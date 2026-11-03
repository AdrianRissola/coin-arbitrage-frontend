const net = require('node:net');
const { installDiagnostics } = require('./diagnostics');

const state = net[Symbol.for('coin-arbitrage.frontend-test-guard')];
if (!state?.profile)
  throw new Error('Frontend test setup requires the guarded runner');
const mode = state.profile.TEST_TRANSPORT_MODE;
const NativeXHR = window.XMLHttpRequest;
const NativeWebSocket = window.WebSocket;
const nativeFetch = window.fetch;
const publicKeys = [
  'REACT_APP_API_REST_ENDPOINT',
  'REACT_APP_WEB_SOCKET_ENDPOINT',
];

class GuardedXHR extends NativeXHR {
  constructor(...args) {
    if (mode === 'offline') throw state.deny('browser XMLHttpRequest');
    super(...args);
  }

  open(method, url, ...args) {
    state.validateUrl(url, 'http:');
    return super.open(method, url, ...args);
  }
}

class GuardedWebSocket extends NativeWebSocket {
  constructor(url, ...args) {
    state.validateUrl(url, 'ws:');
    super(url, ...args);
  }
}

const guardedFetch = async (...args) => {
  state.validateUrl(args[0], 'http:');
  if (!nativeFetch) throw state.deny('browser fetch is unavailable');
  return nativeFetch(...args);
};

const installGlobals = () => {
  window.XMLHttpRequest = GuardedXHR;
  window.WebSocket = GuardedWebSocket;
  window.fetch = guardedFetch;
};

const installRuntime = () => {
  const diagnostics = installDiagnostics(state);
  installGlobals();
  publicKeys.forEach((key) => {
    process.env[key] = state.profile[key];
  });
  beforeEach(() => {
    diagnostics.check();
    expect(process.env.TEST_TRANSPORT_MODE).toBe(mode);
    installGlobals();
    publicKeys.forEach((key) => {
      process.env[key] = state.profile[key];
    });
    localStorage.clear();
    sessionStorage.clear();
  });
  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    publicKeys.forEach((key) => {
      process.env[key] = state.profile[key];
    });
    expect(state.violations).toEqual([]);
    diagnostics.check();
  });
  afterAll(() => {
    diagnostics.check();
    expect(state.violations).toEqual([]);
  });
};

const getRuntime = () => Object.freeze({ mode, reportRoot: state.root });

module.exports = { installRuntime, getRuntime };
