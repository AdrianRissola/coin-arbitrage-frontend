const { loadService, deferred } = require('../support/service-harness');
const history = require('../../fixtures/contracts/v1/historical-arbitrages.json');
const requests = require('../../fixtures/contracts/v1/requests.json');

const base = 'http://127.0.0.1:1';
const path = '/coin-arbitrage/crypto/historical-arbitrages';
const initialUri = `${base}${
  requests.rest.find((request) => request.name === 'historySingle').path
}`;
const initial = () => ({ uri: initialUri, data: history });

test('historical import sends the literal BTC request and writes only after its controlled response', async () => {
  const response = deferred();
  const lease = loadService(
    'HistoricalArbitrageService',
    [{ uri: initialUri, deferred: response }],
    1
  );
  expect(lease.calls).toEqual([
    { uri: initialUri, method: 'get', params: { tickers: ['BTC-USDT'] } },
  ]);
  expect(localStorage.getItem('historicalArbitrages')).toBeNull();
  response.resolve(history);
  await lease.waitForImports();
  expect(lease.writes).toEqual([
    { key: 'historicalArbitrages', value: JSON.stringify(history) },
  ]);
  expect(localStorage.getItem('historicalArbitrages')).toBe(
    JSON.stringify(history)
  );
});

test.each([
  ['historySingle', ['BTC-USDT']],
  ['historyMultiple', ['BTC-USDT', 'ETH-USDT']],
  ['historyNull', null],
  ['historyAbsent', undefined],
])(
  'real Axios serialises %s exactly as the literal contract fixture',
  async (name, tickers) => {
    const expected = requests.rest.find((request) => request.name === name);
    const uri = `${base}${expected.path}`;
    const lease = loadService(
      'HistoricalArbitrageService',
      [initial(), { uri, data: history }],
      1
    );
    await lease.waitForImports();
    const response = await lease.service.getHistoricalArbitrages(tickers);
    expect(lease.calls[1]).toEqual({ uri, method: 'get', params: { tickers } });
    expect(response).toBe(lease.responses[1]);
    expect(response.data).toEqual(history);
    expect(lease.writes).toHaveLength(1);
  }
);

test.each([
  [[], `${base}${path}`],
  ['BTC-USDT', `${base}${path}?tickers=BTC-USDT`],
])(
  'empty arrays/scalar inputs retain the current Axios query behaviour',
  async (tickers, uri) => {
    const lease = loadService(
      'HistoricalArbitrageService',
      [initial(), { uri, data: [] }],
      1
    );
    await lease.waitForImports();
    const response = await lease.service.getHistoricalArbitrages(tickers);
    expect(lease.calls[1].uri).toBe(uri);
    expect(response.data).toEqual([]);
  }
);

test.each([null, {}, 'invalid'])(
  'a %p response rejects as invalid without writing the cache',
  async (invalid) => {
    const lease = loadService(
      'HistoricalArbitrageService',
      [initial(), { uri: `${base}${path}`, data: invalid }],
      1
    );
    await lease.waitForImports();
    await expect(
      lease.service.getHistoricalArbitrages(null)
    ).rejects.toThrow(TypeError);
    expect(lease.writes).toHaveLength(1);
    expect(localStorage.getItem('historicalArbitrages')).toBe(
      JSON.stringify(history)
    );
  }
);

test('a direct historical rejection is logged and propagated without rewriting cached import data', async () => {
  const lease = loadService(
    'HistoricalArbitrageService',
    [initial(), { uri: `${base}${path}`, reject: true }],
    1
  );
  await lease.waitForImports();
  await expect(
    lease.service.getHistoricalArbitrages(null)
  ).rejects.toBe(lease.errors[0]);
  expect(lease.log).toHaveBeenCalledWith(
    'Axios Error in HistoricalArbitrageService.getHistoricalArbitrages:',
    lease.errors[0]
  );
  expect(localStorage.getItem('historicalArbitrages')).toBe(
    JSON.stringify(history)
  );
});
