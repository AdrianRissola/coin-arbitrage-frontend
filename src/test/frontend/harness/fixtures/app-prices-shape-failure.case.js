import { prepareApps } from '../../support/app-runtime';
import { clone } from '../../support/ui-fixtures';
import arbitrage from '../../../fixtures/contracts/v1/ws-arbitrage.json';

let createApp;
beforeAll(async () => {
  createApp = await prepareApps();
});

test('actual App retains its non-array prices event-handler failure', async () => {
  const app = createApp();
  await app.open();
  await app.message({ ...clone(arbitrage), marketPrices: { 'BTC-USDT': {} } });
});
