import { prepareApps } from '../../support/app-runtime';

let createApp;
beforeAll(async () => {
  createApp = await prepareApps();
});

test('a deliberately wrong initial subscription oracle fails against actual App', async () => {
  const app = createApp();
  await app.open();
  expect(app.socket.sent.map(JSON.parse)).toEqual([
    { channel: 'arbitrage', ticker: 'BTC-USD' },
  ]);
});
