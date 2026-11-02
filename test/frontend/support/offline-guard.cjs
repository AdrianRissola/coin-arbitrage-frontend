const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const dns = require('node:dns');
const tls = require('node:tls');
const dgram = require('node:dgram');
const cp = require('node:child_process');
const { fileURLToPath } = require('node:url');
const { syncBuiltinESMExports } = require('node:module');
const { readAuthorization } = require('./transport.cjs');

const install = () => {
  const key = Symbol.for('coin-arbitrage.frontend-test-guard');
  if (net[key]) return net[key];
  const realpath = fs.realpathSync.bind(fs);
  const exists = fs.existsSync.bind(fs);
  if (!process.env.FE_TEST_REPORT_ROOT)
    throw new Error('Missing owned frontend report root');
  const root = realpath(process.env.FE_TEST_REPORT_ROOT);
  const profile = readAuthorization(root);
  const state = { root, profile, violations: [], details: [] };
  Object.defineProperty(net, key, { value: state });
  const inside = (value) =>
    value === root || value.startsWith(`${root}${path.sep}`);
  const resolved = (file) => {
    if (
      typeof file !== 'string' &&
      !Buffer.isBuffer(file) &&
      !(file instanceof URL)
    )
      return null;
    const target = path.resolve(
      file instanceof URL ? fileURLToPath(file) : String(file)
    );
    let parent = target;
    while (!exists(parent)) parent = path.dirname(parent);
    return path.resolve(realpath(parent), path.relative(parent, target));
  };
  const deny = (operation) => {
    state.violations.push(operation);
    state.details.push({ operation, stack: new Error(operation).stack });
    process.exitCode = process.exitCode || 1;
    return new Error(`FE_TEST_GUARD_BLOCKED: ${operation}`);
  };
  state.deny = deny;
  const validateUrl = (value, protocol) => {
    let url;
    try {
      url = new URL(value?.url || value);
    } catch {
      throw deny('invalid transport URL');
    }
    const endpoint = new URL(profile.REACT_APP_API_REST_ENDPOINT);
    if (
      profile.TEST_TRANSPORT_MODE !== 'real-loopback' ||
      url.protocol !== protocol ||
      url.hostname !== '127.0.0.1' ||
      url.port !== endpoint.port ||
      url.username ||
      url.password
    ) {
      throw deny('transport outside controller endpoint');
    }
  };
  state.validateUrl = validateUrl;
  const checkRead = (file) => {
    const target = resolved(file);
    if (target && /^\.env(?:\.|$)/.test(path.basename(target)))
      throw deny('dotenv read');
  };
  const checkWrite = (file) => {
    const target = resolved(file);
    if (target && !inside(target)) throw deny('write outside owned artifacts');
  };
  const wrap = (object, name, check, asynchronous = false) => {
    if (typeof object[name] !== 'function') return;
    const original = object[name];
    function invoke(...args) {
      check(args);
      return Reflect.apply(original, this, args);
    }
    Object.defineProperty(object, name, {
      value: asynchronous
        ? async function guardedPromise(...args) {
            return invoke.apply(this, args);
          }
        : invoke,
    });
  };
  Object.entries({
    writeFile: [0],
    appendFile: [0],
    mkdir: [0],
    unlink: [0],
    rm: [0],
    rmdir: [0],
    rename: [0, 1],
    copyFile: [1],
    cp: [1],
    chmod: [0],
    chown: [0],
    utimes: [0],
    truncate: [0],
    symlink: [1],
    link: [0, 1],
  }).forEach(([name, positions]) => {
    const check = (args) =>
      positions.forEach((position) => checkWrite(args[position]));
    [name, `${name}Sync`].forEach((method) => wrap(fs, method, check));
    wrap(fs.promises, name, check, true);
  });
  ['readFile', 'readFileSync', 'createReadStream'].forEach((name) => {
    wrap(fs, name, (args) => checkRead(args[0]));
  });
  wrap(fs.promises, 'readFile', (args) => checkRead(args[0]), true);
  const writeBits = [
    fs.constants.O_WRONLY,
    fs.constants.O_RDWR,
    fs.constants.O_CREAT,
    fs.constants.O_TRUNC,
    fs.constants.O_APPEND,
  ];
  const checkOpen = ([file, flags]) => {
    checkRead(file);
    if (
      (typeof flags === 'string' && /[wa+]/.test(flags)) ||
      (typeof flags === 'number' &&
        writeBits.some((bit) => flags % (bit * 2) >= bit))
    )
      checkWrite(file);
  };
  wrap(fs, 'open', checkOpen);
  wrap(fs, 'openSync', checkOpen);
  wrap(fs.promises, 'open', checkOpen, true);
  wrap(fs, 'createWriteStream', (args) => checkWrite(args[0]));
  const block = (object, name, label, asynchronous = false) => {
    wrap(
      object,
      name,
      () => {
        throw deny(label);
      },
      asynchronous
    );
  };
  wrap(net.Socket.prototype, 'connect', (args) => {
    const input = Array.isArray(args[0]) ? args[0] : args;
    const options =
      typeof input[0] === 'object'
        ? input[0]
        : {
            port: input[0],
            host: typeof input[1] === 'string' ? input[1] : 'localhost',
          };
    const endpoint = new URL(profile.REACT_APP_API_REST_ENDPOINT);
    if (
      profile.TEST_TRANSPORT_MODE !== 'real-loopback' ||
      options.path ||
      options.host !== '127.0.0.1' ||
      Number(options.port) !== Number(endpoint.port)
    ) {
      throw deny('network connect');
    }
  });
  block(net.Server.prototype, 'listen', 'network listener');
  block(tls, 'connect', 'TLS connect');
  block(dgram, 'createSocket', 'UDP socket');
  const blockDns = (object, asynchronous) => {
    Object.getOwnPropertyNames(object)
      .filter((name) => /^(lookup|resolve|reverse)/.test(name))
      .forEach((name) => block(object, name, 'DNS query', asynchronous));
  };
  blockDns(dns, false);
  blockDns(dns.promises, true);
  blockDns(dns.Resolver.prototype, false);
  blockDns(dns.promises.Resolver.prototype, true);
  if (global.fetch)
    wrap(global, 'fetch', (args) => validateUrl(args[0], 'http:'), true);
  if (global.WebSocket) {
    const NativeWebSocket = global.WebSocket;
    global.WebSocket = class extends NativeWebSocket {
      constructor(url, ...args) {
        validateUrl(url, 'ws:');
        super(url, ...args);
      }
    };
  }
  ['exec', 'execSync'].forEach((name) => block(cp, name, 'shell child'));
  const checkChild = (file, options) => {
    const env = options?.env || process.env;
    const executable =
      file === 'node'
        ? (env.PATH || '')
            .split(path.delimiter)
            .map((parent) => path.join(parent, file))
            .find((candidate) => exists(candidate))
        : file;
    if (
      !executable ||
      !exists(executable) ||
      realpath(executable) !== realpath(process.execPath) ||
      !env.NODE_OPTIONS?.includes(__filename) ||
      !env.FE_TEST_REPORT_ROOT ||
      !inside(resolved(env.FE_TEST_REPORT_ROOT))
    ) {
      throw deny('unguarded child process');
    }
  };
  ['spawn', 'spawnSync', 'execFile', 'execFileSync'].forEach((name) => {
    wrap(cp, name, (args) =>
      checkChild(args[0], Array.isArray(args[1]) ? args[2] : args[1])
    );
  });
  wrap(cp, 'fork', (args) =>
    checkChild(process.execPath, Array.isArray(args[1]) ? args[2] : args[1])
  );
  process.once('exit', () => {
    if (state.violations.length) {
      fs.writeFileSync(
        path.join(root, 'guard-violations.json'),
        JSON.stringify(state.details, null, 2)
      );
      fs.writeSync(
        2,
        `FE_TEST_GUARD_BLOCKED: ${
          state.violations.length
        } recorded violation(s): ${state.violations.join(', ')}\n`
      );
      process.exitCode = process.exitCode || 1;
    }
  });
  syncBuiltinESMExports();
  return state;
};

module.exports = install();
