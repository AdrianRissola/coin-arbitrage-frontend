import { screen } from '@testing-library/react';
import { prepareApps } from '../../support/app-runtime';
import { clone } from '../../support/ui-fixtures';
import arbitrage from '../../../fixtures/contracts/v1/ws-arbitrage.json';

let createApp;
beforeAll(async () => {
  createApp = await prepareApps();
});

test('non-array prices cannot replace valid data or prevent recovery', async () => {
  const app = createApp();
  await app.open();
  await app.message(arbitrage);
  await app.message({ ...clone(arbitrage), marketPrices: { 'BTC-USDT': {} } });
  expect(screen.getByText('Alpha-Gamma')).toBeInTheDocument();
  await app.message(arbitrage);
  expect(screen.getByRole('columnheader', { name: 'BTC Markets (3)' })).toBeInTheDocument();
  expect(app.socket.sent).toHaveLength(1);
});
