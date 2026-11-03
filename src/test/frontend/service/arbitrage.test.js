const { loadService } = require('../support/service-harness');
const history = require('../../fixtures/contracts/v1/historical-arbitrages.json');
const empty = require('../../fixtures/contracts/v1/historical-empty.json');

const uri = 'http://127.0.0.1:1/coin-arbitrage/crypto/historical-arbitrages';

test('the older ArbitrageService has no import-time request and sends an unfiltered historical GET', async () => {
  const lease = loadService('ArbitrageService', [{ uri, data: history }]);
  expect(lease.calls).toEqual([]);
  const response = await lease.service.getHistoricalArbitrages();
  expect(lease.calls).toEqual([{ uri, method: 'get', params: undefined }]);
  expect(response).toBe(lease.responses[0]);
  expect(response.data).toEqual(history);
  expect(lease.writes).toEqual([]);
});

test.each([[empty], [null]])(
  'the older service passes through empty/null data without normalising it',
  async (data) => {
    const lease = loadService('ArbitrageService', [{ uri, data }]);
    const response = await lease.service.getHistoricalArbitrages();
    expect(response.data).toEqual(data);
    expect(response).toBe(lease.responses[0]);
  }
);

test('the older service logs its actual AxiosError and resolves undefined on rejection', async () => {
  const lease = loadService('ArbitrageService', [{ uri, reject: true }]);
  await expect(
    lease.service.getHistoricalArbitrages()
  ).resolves.toBeUndefined();
  expect(lease.axios.isAxiosError(lease.errors[0])).toBe(true);
  expect(lease.log).toHaveBeenCalledWith(
    'Axios Error in ArbitrageService.getHistoricalArbitrages:',
    lease.errors[0]
  );
});
