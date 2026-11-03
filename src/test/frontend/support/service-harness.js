const net = require('node:net');
const state = net[Symbol.for('coin-arbitrage.frontend-test-guard')];
const leases = [];

const deferred = () => {
  let resolve;
  const promise = new Promise((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
};

const loadService = (name, expectations, storageCount = 0) => {
  const plans = expectations.slice();
  const calls = [];
  const responses = [];
  const errors = [];
  const writes = [];
  const importsDone = deferred();
  const originalSetItem = Storage.prototype.setItem;
  let active = 0;
  const storage = jest
    .spyOn(Storage.prototype, 'setItem')
    .mockImplementation(function setItem(key, value) {
      originalSetItem.call(this, key, value);
      writes.push({ key: String(key), value: String(value) });
      if (writes.length === storageCount) importsDone.resolve();
    });
  if (!storageCount) importsDone.resolve();
  const log = jest.spyOn(console, 'log').mockImplementation(() => {});
  let axios;
  let service;
  jest.isolateModules(() => {
    axios = require('axios').default;
    axios.defaults.adapter = async (config) => {
      const expected = plans.shift();
      const uri = axios.getUri(config);
      calls.push({ uri, method: config.method, params: config.params });
      if (!expected || uri !== expected.uri)
        throw state.deny('unexpected controlled Axios request');
      active += 1;
      try {
        if (expected.reject) {
          const error = new axios.AxiosError(
            'controlled adapter rejection',
            'ERR_BAD_RESPONSE',
            config,
            { testOwned: true },
            { status: 500, data: { message: 'synthetic failure' } }
          );
          errors.push(error);
          throw error;
        }
        const data = expected.deferred
          ? await expected.deferred.promise
          : expected.data;
        const response = {
          data: JSON.stringify(data),
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'application/json' },
          config,
          request: { testOwned: true },
        };
        responses.push(response);
        return response;
      } finally {
        active -= 1;
      }
    };
    service = require(`../../../service/${name}`);
  });
  const lease = {
    axios,
    service,
    calls,
    responses,
    errors,
    writes,
    log,
    waitForImports: () => importsDone.promise,
    close: () => {
      try {
        expect(plans).toEqual([]);
        expect(active).toBe(0);
        expect(writes.length).toBe(storageCount);
      } finally {
        storage.mockRestore();
        log.mockRestore();
      }
    },
  };
  leases.push(lease);
  return lease;
};

afterEach(() => {
  leases.splice(0).forEach((lease) => lease.close());
});

module.exports = { deferred, loadService };
