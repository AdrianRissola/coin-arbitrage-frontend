const { loadService, deferred } = require('../support/service-harness');
const tickers = require('../../fixtures/contracts/v1/available-tickers.json');
const markets = require('../../fixtures/contracts/v1/markets.json');

const root = 'http://127.0.0.1:1';
const tickersUri = `${root}/coin-arbitrage/crypto/available-tickers`;
const marketsUri = `${root}/coin-arbitrage/crypto/markets`;
const initial = () => ({ uri: tickersUri, data: tickers });

test('market import stores the original records and unique sorted quote currencies after the response', async () => {
  const response = deferred();
  const lease = loadService(
    'MarketService',
    [{ uri: tickersUri, deferred: response }],
    2
  );
  expect(localStorage.getItem('availableWebsocketTickers')).toBeNull();
  response.resolve(tickers);
  await lease.waitForImports();
  expect(lease.calls).toEqual([
    { uri: tickersUri, method: 'get', params: undefined },
  ]);
  expect(lease.writes).toEqual([
    { key: 'availableWebsocketTickers', value: JSON.stringify(tickers) },
    { key: 'availableWebsocketQuoteCurrencies', value: '["USD","USDT"]' },
  ]);
  expect(
    JSON.parse(localStorage.getItem('availableWebsocketQuoteCurrencies'))
  ).toEqual(['USD', 'USDT']);
});

test('market GET preserves the actual Axios response and literal market fixture', async () => {
  const lease = loadService(
    'MarketService',
    [initial(), { uri: marketsUri, data: markets }],
    2
  );
  await lease.waitForImports();
  const response = await lease.service.getMarkets();
  expect(lease.calls[1]).toEqual({
    uri: marketsUri,
    method: 'get',
    params: undefined,
  });
  expect(response).toBe(lease.responses[1]);
  expect(response.data).toEqual(markets);
});

test('a direct ticker GET returns its response without repeating import-time storage writes', async () => {
  const lease = loadService(
    'MarketService',
    [initial(), { uri: tickersUri, data: tickers }],
    2
  );
  await lease.waitForImports();
  const response = await lease.service.getAllAvailableTickers();
  expect(response.data).toEqual(tickers);
  expect(response).toBe(lease.responses[1]);
  expect(lease.writes).toHaveLength(2);
});

test('empty imported tickers store two empty JSON arrays', async () => {
  const lease = loadService(
    'MarketService',
    [{ uri: tickersUri, data: [] }],
    2
  );
  await lease.waitForImports();
  expect(lease.writes).toEqual([
    { key: 'availableWebsocketTickers', value: '[]' },
    { key: 'availableWebsocketQuoteCurrencies', value: '[]' },
  ]);
});

test.each([
  ['getMarkets', marketsUri],
  ['getAllAvailableTickers', tickersUri],
])('%s rejects non-array metadata and can recover', async (method, uri) => {
  const lease = loadService('MarketService', [initial(), { uri, data: null }, { uri, data: [] }], 2);
  await lease.waitForImports();
  await expect(lease.service[method]()).rejects.toThrow(/Invalid .* metadata/);
  await expect(lease.service[method]()).resolves.toMatchObject({ data: [] });
});

test.each([
  ['getMarkets', marketsUri, 'Axios Error in MarketService.getMarkets:'],
  [
    'getAllAvailableTickers',
    tickersUri,
    'Axios Error in MarketService.getAllAvailableTickers:',
  ],
])(
  '%s logs and propagates its original Axios rejection',
  async (method, uri, message) => {
    const lease = loadService(
      'MarketService',
      [initial(), { uri, reject: true }],
      2
    );
    await lease.waitForImports();
    await expect(lease.service[method]()).rejects.toBe(lease.errors[0]);
    expect(lease.log).toHaveBeenCalledWith(message, lease.errors[0]);
  }
);
