const { act, cleanup, render } = require('@testing-library/react');
const dom = require('@testing-library/dom');
const axios = require('axios').default;
const net = require('node:net');
const { clone, tickers, markets } = require('./ui-fixtures');

const state = net[Symbol.for('coin-arbitrage.frontend-test-guard')];
const leases = [];
const originalEventWrapper = dom.getConfig().eventWrapper;
beforeAll(() => {
  dom.configure({
    eventWrapper: (callback) => {
      let result;
      act(() => {
        result = callback();
      });
      return result;
    },
  });
});
afterAll(() => dom.configure({ eventWrapper: originalEventWrapper }));
const root = 'http://127.0.0.1:1/coin-arbitrage/crypto/';
const deferred = () => {
  let resolve;
  const promise = new Promise((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
};

const installTransport = (options = {}) => {
  const original = axios.defaults.adapter;
  const plans = {
    'historical-arbitrages': (options.history || []).slice(),
    'available-tickers': (options.tickers || []).slice(),
    markets: (options.markets || []).slice(),
  };
  const defaults = {
    'available-tickers': tickers,
    markets: clone(markets).reverse(),
  };
  const calls = [];
  const log = jest.spyOn(console, 'log').mockImplementation(() => {});
  let active = 0;
  let closed = false;
  axios.defaults.adapter = async (config) => {
    const kind = config.url.slice(root.length);
    if (
      !config.url.startsWith(root) ||
      !Object.hasOwn(plans, kind) ||
      config.method !== 'get'
    )
      throw state.deny('unexpected controlled UI request');
    const plan = plans[kind].shift();
    if (!plan && kind === 'historical-arbitrages')
      throw state.deny('unplanned controlled UI history request');
    if (
      plan &&
      Object.hasOwn(plan, 'tickers') &&
      JSON.stringify(config.params) !==
        JSON.stringify({ tickers: plan.tickers })
    )
      throw state.deny('unexpected controlled UI history selection');
    calls.push({
      kind,
      method: config.method,
      uri: axios.getUri(config),
      params: config.params === undefined ? undefined : clone(config.params),
    });
    active += 1;
    try {
      if (plan?.reject)
        throw new axios.AxiosError(
          'controlled UI rejection',
          'ERR_BAD_RESPONSE',
          config,
          { testOwned: true },
          { status: 500, data: { message: 'synthetic failure' } }
        );
      const data = plan
        ? plan.deferred
          ? await plan.deferred.promise
          : plan.data
        : defaults[kind];
      return {
        data: JSON.stringify(data),
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config,
        request: { testOwned: true },
      };
    } finally {
      active -= 1;
    }
  };
  const lease = {
    calls,
    next: (kind, plan) => plans[kind].push(plan),
    close: () => {
      if (closed) return;
      closed = true;
      try {
        expect(active).toBe(0);
        Object.values(plans).forEach((remaining) =>
          expect(remaining).toEqual([])
        );
      } finally {
        axios.defaults.adapter = original;
        log.mockRestore();
      }
    },
  };
  leases.push(lease);
  return lease;
};

const loadViews = async () => {
  const boot = installTransport({
    history: [{ tickers: ['BTC-USDT'], data: [] }],
  });
  const complete = deferred();
  const keys = new Set();
  const original = Storage.prototype.setItem;
  const storage = jest
    .spyOn(Storage.prototype, 'setItem')
    .mockImplementation(function write(key, value) {
      original.call(this, key, value);
      keys.add(key);
      if (
        [
          'availableWebsocketTickers',
          'availableWebsocketQuoteCurrencies',
          'historicalArbitrages',
        ].every((expected) => keys.has(expected))
      )
        complete.resolve();
    });
  let views;
  try {
    await act(async () => {
      views = {
        ArbitrageView: require('../../../components/views/ArbitrageView')
          .default,
        HistoricalView: require('../../../components/views/HistoricalView')
          .default,
        BestArbitrageView:
          require('../../../components/views/BestArbitrageView').default,
        MarketStatusView: require('../../../components/views/MarketStatusView')
          .default,
        MarketsFilter:
          require('../../../components/filters/MarketsCheckboxDropdownFilter')
            .default,
        TickersFilter:
          require('../../../components/filters/TickersCheckboxDropdownFilter')
            .default,
      };
      await complete.promise;
    });
    return views;
  } finally {
    storage.mockRestore();
    boot.close();
  }
};

const resolveResponse = async (pending, data) => {
  await act(async () => {
    pending.resolve(data);
    await pending.promise;
  });
};

const expectRenderFailure = (element, message) => {
  const nativeError = console.error;
  const unexpected = [];
  const errors = jest.spyOn(console, 'error').mockImplementation((...args) => {
    const text = args.map(String).join(' ');
    if (!text.includes('The above error occurred') && !message.test(text)) {
      unexpected.push(text);
      nativeError(...args);
    }
  });
  try {
    expect(
      typeof element === 'function' ? element : () => render(element)
    ).toThrow(message);
    expect(errors).toHaveBeenCalled();
    expect(unexpected).toEqual([]);
  } finally {
    errors.mockRestore();
    cleanup();
  }
};

afterEach(() => {
  cleanup();
  leases
    .splice(0)
    .reverse()
    .forEach((lease) => lease.close());
});

module.exports = {
  deferred,
  installTransport,
  loadViews,
  resolveResponse,
  expectRenderFailure,
};
