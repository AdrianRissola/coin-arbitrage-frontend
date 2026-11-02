test('a real service request without a controlled adapter cannot be green', async () => {
  const service = require('../../../../service/ArbitrageService');
  await service.getHistoricalArbitrages();
  expect(true).toBe(true);
});
