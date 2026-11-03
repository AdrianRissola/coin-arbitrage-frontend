const { loadService } = require('../support/service-harness');
const history = require('../../fixtures/contracts/v1/historical-arbitrages.json');
const tickers = require('../../fixtures/contracts/v1/available-tickers.json');

test.each([
  [
    'ArbitrageService',
    'http://127.0.0.1:1',
    'http://127.0.0.1:1coin-arbitrage/crypto/historical-arbitrages',
    0,
    history,
  ],
  [
    'ArbitrageService',
    'http://127.0.0.1:1//',
    'http://127.0.0.1:1//coin-arbitrage/crypto/historical-arbitrages',
    0,
    history,
  ],
  [
    'HistoricalArbitrageService',
    'http://127.0.0.1:1',
    'http://127.0.0.1:1coin-arbitrage/crypto/historical-arbitrages?tickers[]=BTC-USDT',
    1,
    history,
  ],
  [
    'HistoricalArbitrageService',
    'http://127.0.0.1:1//',
    'http://127.0.0.1:1//coin-arbitrage/crypto/historical-arbitrages?tickers[]=BTC-USDT',
    1,
    history,
  ],
  [
    'MarketService',
    'http://127.0.0.1:1',
    'http://127.0.0.1:1coin-arbitrage/crypto/available-tickers',
    2,
    tickers,
  ],
  [
    'MarketService',
    'http://127.0.0.1:1//',
    'http://127.0.0.1:1//coin-arbitrage/crypto/available-tickers',
    2,
    tickers,
  ],
])(
  '%s retains literal endpoint concatenation for %s',
  async (name, base, uri, storageCount, data) => {
    process.env.REACT_APP_API_REST_ENDPOINT = base;
    const lease = loadService(name, [{ uri, data }], storageCount);
    if (storageCount) await lease.waitForImports();
    else await lease.service.getHistoricalArbitrages();
    expect(lease.calls[0].uri).toBe(uri);
    expect(lease.calls[0].method).toBe('get');
  }
);

test('the endpoint is captured at module import rather than reread for each call', async () => {
  const uri = 'http://127.0.0.1:1/coin-arbitrage/crypto/historical-arbitrages';
  const lease = loadService('ArbitrageService', [{ uri, data: history }]);
  process.env.REACT_APP_API_REST_ENDPOINT = 'http://127.0.0.1:1/changed/';
  await lease.service.getHistoricalArbitrages();
  expect(lease.calls[0].uri).toBe(uri);
});
