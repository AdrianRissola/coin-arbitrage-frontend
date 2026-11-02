const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const net = require('node:net');
const { setImmediate } = require('node:timers');

const state = net[Symbol.for('coin-arbitrage.frontend-test-guard')];
if (state?.profile.TEST_TRANSPORT_MODE !== 'real-loopback')
  throw new Error('INT consumers require the actual owned real-loopback runner');
const context = JSON.parse(state.profile.TEST_RUN_CONTEXT);
const fixture = (name) =>
  JSON.parse(JSON.stringify(require(`../fixtures/contracts/v1/${name}.json`)));
const rpc = (action, args = {}) =>
  new Promise((resolve, reject) => {
    const id = crypto.randomBytes(16).toString('hex');
    const request = path.join(state.root, `int-rpc-${id}.request.json`);
    const response = `int-rpc-${id}.response.json`;
    let done = false;
    let watcher;
    let timer;
    const finish = (error, value) => {
      if (done) return;
      done = true;
      watcher?.close();
      clearTimeout(timer);
      if (error) reject(error);
      else resolve(value);
    };
    const receive = () => {
      const file = path.join(state.root, response);
      if (!fs.existsSync(file)) return;
      try {
        const message = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (message.version !== 1 || message.id !== id || message.ok !== true)
          throw new Error(message.error || 'Invalid owned INT control reply');
        finish(null, message.value);
      } catch (error) {
        finish(error);
      }
    };
    watcher = fs.watch(state.root, (event, filename) => {
      if (String(filename) === response) receive();
    });
    timer = setTimeout(
      () => finish(new Error(`INT control deadline: ${action}`)),
      12000
    );
    fs.writeFileSync(
      `${request}.tmp`,
      JSON.stringify({
        version: 1,
        id,
        token: state.profile.TEST_RUN_TOKEN,
        action,
        args,
      }),
      { mode: 0o600 }
    );
    fs.renameSync(`${request}.tmp`, request);
    receive();
  });
const save = (name, value) =>
  fs.writeFileSync(
    path.join(state.root, `${name}.json`),
    JSON.stringify(value, null, 2)
  );

const ownSockets = () => {
  const original = net.Socket.prototype.connect;
  const sockets = new Set();
  const connect = function connect(...args) {
    const result = Reflect.apply(original, this, args);
    sockets.add(this);
    this.once('close', () => sockets.delete(this));
    return result;
  };
  Object.defineProperty(net.Socket.prototype, 'connect', { value: connect });
  return {
    close: async () => {
      if (net.Socket.prototype.connect !== connect)
        throw state.deny('INT owned socket observer replaced');
      try {
        await Promise.all(
          Array.from(sockets, (socket) => {
            const closed = socket.closed
              ? Promise.resolve()
              : new Promise((resolve) => socket.once('close', resolve));
            socket.destroy();
            return closed;
          })
        );
        sockets.forEach((socket) => {
          if (socket.closed) sockets.delete(socket);
        });
        await new Promise((resolve) => setImmediate(resolve));
        if (sockets.size) throw state.deny('INT frontend socket ownership leak');
      } finally {
        Object.defineProperty(net.Socket.prototype, 'connect', { value: original });
      }
      return { remaining: sockets.size, guardedConnectRestored: true };
    },
  };
};

module.exports = { context, fixture, rpc, save, state, ownSockets };
