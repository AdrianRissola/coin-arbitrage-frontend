const React = require('react');
const notifications = require('notistack');
const { act, cleanup, render } = require('@testing-library/react');
const net = require('node:net');
const { loadViews, installTransport } = require('./ui-runtime');
const { seedStorage } = require('./ui-fixtures');
const { ownTimeouts } = require('./resources');

const guard = net[Symbol.for('coin-arbitrage.frontend-test-guard')];
const leases = [];
const socketTypes = ['open', 'message', 'error', 'close'];
const installSockets = () => {
  const original = window.WebSocket;
  const sockets = [];
  class ControlledSocket {
    constructor(url) {
      if (
        new URL(url).href !==
        new URL(guard.profile.REACT_APP_WEB_SOCKET_ENDPOINT).href
      )
        throw guard.deny('unexpected controlled App WebSocket URL');
      this.url = new URL(url).href;
      this.readyState = 0;
      this.sent = [];
      this.sendAttempts = [];
      this.closeCalls = [];
      const events = document.createDocumentFragment();
      const listeners = [];
      const capture = (options) =>
        typeof options === 'boolean' ? options : !!options?.capture;
      this.addEventListener = (type, listener, options) => {
        if (
          !listeners.some(
            (entry) =>
              entry.type === type &&
              entry.listener === listener &&
              entry.capture === capture(options)
          )
        )
          listeners.push({ type, listener, capture: capture(options) });
        events.addEventListener(type, listener, options);
      };
      this.removeEventListener = (type, listener, options) => {
        const index = listeners.findIndex(
          (entry) =>
            entry.type === type &&
            entry.listener === listener &&
            entry.capture === capture(options)
        );
        if (index >= 0) listeners.splice(index, 1);
        events.removeEventListener(type, listener, options);
      };
      this.listenerCount = () => listeners.length;
      this.clearOwnedListeners = () => {
        listeners
          .splice(0)
          .forEach((entry) =>
            events.removeEventListener(
              entry.type,
              entry.listener,
              entry.capture
            )
          );
      };
      this.dispatchEvent = events.dispatchEvent.bind(events);
      const handlers = new Map();
      socketTypes.forEach((type) => {
        Object.defineProperty(this, `on${type}`, {
          configurable: true,
          get: () => handlers.get(type)?.handler || null,
          set: (handler) => {
            const previous = handlers.get(type);
            if (previous?.listener)
              this.removeEventListener(type, previous.listener);
            const listener =
              typeof handler === 'function' ? handler.bind(this) : null;
            handlers.set(type, {
              handler: listener ? handler : null,
              listener,
            });
            if (listener) this.addEventListener(type, listener);
          },
        });
      });
      sockets.push(this);
    }

    send(value) {
      this.sendAttempts.push(value);
      if (this.readyState === this.CONNECTING)
        throw new DOMException('WebSocket is connecting', 'InvalidStateError');
      if (this.readyState === this.OPEN) this.sent.push(value);
    }

    open() {
      this.readyState = this.OPEN;
      this.dispatchEvent(new Event('open'));
    }

    message(value) {
      this.rawMessage(JSON.stringify(value));
    }

    rawMessage(data) {
      if (this.readyState !== this.OPEN)
        throw new Error('Controlled message requires an open socket');
      this.dispatchEvent(new MessageEvent('message', { data }));
    }

    fail() {
      this.dispatchEvent(new Event('error'));
    }

    close(...args) {
      this.closeCalls.push(args);
      this.readyState = this.CLOSING;
    }

    finishClose() {
      this.readyState = this.CLOSED;
      this.dispatchEvent(new CloseEvent('close'));
    }
  }
  const constants = { CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3 };
  Object.assign(ControlledSocket, constants);
  Object.assign(ControlledSocket.prototype, constants);
  window.WebSocket = ControlledSocket;
  let closed = false;
  return {
    sockets,
    close: () => {
      if (closed) return;
      closed = true;
      sockets.forEach((socket) => {
        socketTypes.forEach((type) => {
          socket[`on${type}`] = null;
        });
        socket.clearOwnedListeners();
        if (socket.readyState === socket.CONNECTING || socket.readyState === socket.OPEN)
          socket.close();
        socket.finishClose();
      });
      window.WebSocket = original;
    },
  };
};

const prepareApps = async () => {
  await loadViews();
  const builder = jest.requireActual('../../../components/views/ViewBuilder');
  return (options = {}) => {
    seedStorage();
    const transport = installTransport(options.transport);
    const timers = ownTimeouts(guard);
    const sockets = installSockets();
    leases.push({
      close: () => {
        try {
          sockets.close();
        } finally {
          timers.close();
        }
      },
    });
    let App;
    jest.isolateModules(() => {
      jest.doMock('react', () => React);
      jest.doMock('notistack', () => notifications);
      jest.doMock('../../../components/views/ViewBuilder', () => builder);
      App = jest.requireActual('../../../App').default;
    });
    const element = () =>
      React.createElement(
        notifications.SnackbarProvider,
        { autoHideDuration: 1000, maxSnack: 5 },
        options.strict
          ? React.createElement(React.StrictMode, null, React.createElement(App))
          : React.createElement(App)
      );
    let mounted;
    const context = {
      transport,
      timers,
      sockets: sockets.sockets,
      get socket() {
        return sockets.sockets[sockets.sockets.length - 1];
      },
      get container() {
        return mounted.container;
      },
      mount: () => {
        mounted = render(element());
        return mounted;
      },
      rerender: () => mounted.rerender(element()),
      unmount: () => mounted.unmount(),
      open: async () => {
        await act(async () => {
          context.socket.open();
        });
      },
      message: async (value) => {
        await act(async () => {
          context.socket.message(value);
        });
      },
      error: async () => {
        await act(async () => {
          context.socket.fail();
        });
      },
      serverClose: async () => {
        await act(async () => {
          context.socket.finishClose();
        });
      },
    };
    context.mount();
    return context;
  };
};

const cleanupApps = () => {
  try {
    cleanup();
  } finally {
    leases
      .splice(0)
      .reverse()
      .forEach((lease) => lease.close());
  }
};
afterEach(cleanupApps);

module.exports = { prepareApps, cleanupApps };
