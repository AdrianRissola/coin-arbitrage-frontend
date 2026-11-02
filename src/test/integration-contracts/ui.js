const { act, cleanup } = require('@testing-library/react');
const dom = require('@testing-library/dom');
const timers = require('node:timers');
const { ownTimeouts } = require('../frontend/support/resources');
const { state, ownSockets } = require('./support');

const withinDeadline = (operation, label) => {
  let deadline;
  return Promise.race([
    operation,
    new Promise((resolve, reject) => {
      deadline = timers.setTimeout(
        () => reject(new Error(`INT UI deadline: ${label}`)),
        6000
      );
    }),
  ]).finally(() => timers.clearTimeout(deadline));
};
const installNativeUi = () => {
  const Native = window.WebSocket;
  const eventWrapper = dom.getConfig().eventWrapper;
  const nativeSetTimeout = window.setTimeout;
  const sockets = [];
  const connections = ownSockets();
  window.setTimeout = (callback, delay, ...args) =>
    nativeSetTimeout.call(
      window,
      (...values) => {
        let result;
        act(() => {
          result = callback(...values);
        });
        return result;
      },
      delay,
      ...args
    );
  const ownedTimers = ownTimeouts(state);
  dom.configure({
    eventWrapper: (callback) => {
      let result;
      act(() => {
        result = callback();
      });
      return result;
    },
  });
  class ObservedNativeSocket extends Native {
    constructor(...args) {
      super(...args);
      this.received = [];
      this.sent = [];
      this.closeCalls = 0;
      this.held = [];
      this.holdTicker = null;
      this.handlers = new Map();
      this.closedEvent = new Promise((resolve) =>
        super.addEventListener('close', resolve, { once: true })
      );
      super.addEventListener('message', (event) =>
        this.received.push(event.data)
      );
      ['open', 'message', 'error', 'close'].forEach((type) => {
        Object.defineProperty(this, `on${type}`, {
          configurable: true,
          get: () => this.handlers.get(type)?.handler || null,
          set: (handler) => {
            const previous = this.handlers.get(type);
            if (previous?.listener)
              super.removeEventListener(type, previous.listener);
            const listener =
              typeof handler === 'function'
                ? (event) => {
                    if (
                      type === 'message' &&
                      this.holdTicker &&
                      JSON.parse(event.data).ticker === this.holdTicker
                    ) {
                      this.held.push(event);
                      return;
                    }
                    act(() => handler.call(this, event));
                  }
                : null;
            this.handlers.set(type, { handler, listener });
            if (listener) super.addEventListener(type, listener);
          },
        });
      });
      sockets.push(this);
    }

    send(raw) {
      this.sent.push(raw);
      return super.send(raw);
    }

    close(...args) {
      this.closeCalls += 1;
      return super.close(...args);
    }

    releaseGenuineHeldEvents() {
      this.holdTicker = null;
      const events = this.held.splice(0);
      events.forEach((event) => {
        const handler = this.handlers.get('message')?.handler;
        if (handler) act(() => handler.call(this, event));
      });
      return events.map((event) => event.data);
    }
  }
  window.WebSocket = ObservedNativeSocket;
  return {
    sockets,
    close: async () => {
      let before;
      let tcp;
      try {
        cleanup();
        before = sockets.map((socket) => ({
          appCloseCalls: socket.closeCalls,
          realNativeInstance: socket instanceof Native,
          sent: socket.sent.map(JSON.parse),
          received: socket.received.map(JSON.parse),
        }));
        await withinDeadline(
          Promise.all(
            sockets.map((socket) => {
              if (socket.readyState === socket.CLOSED) return undefined;
              socket.close();
              return socket.closedEvent;
            })
          ),
          'native browser socket cleanup'
        );
      } finally {
        window.WebSocket = Native;
        ownedTimers.close();
        window.setTimeout = nativeSetTimeout;
        dom.configure({ eventWrapper });
        tcp = await connections.close();
      }
      return { before, tcp };
    },
  };
};

module.exports = { installNativeUi };
