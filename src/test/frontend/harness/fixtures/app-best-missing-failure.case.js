import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import best from '../../../fixtures/contracts/v1/ws-best-arbitrage.json';
import { prepareApps } from '../../support/app-runtime';

let createApp;
beforeAll(async () => {
  createApp = await prepareApps();
});

test('a missing best payload does not prevent later valid best data', async () => {
  const app = createApp();
  await app.open();
  userEvent.click(screen.getByRole('link', { name: 'Best Arbitrage' }));
  await app.message({ channel: 'bestArbitrage', ticker: 'ALL' });
  await app.message(best);
  expect(screen.getByText('Best Arbitrage: ETH-USD')).toBeInTheDocument();
  expect(app.socket.sent).toHaveLength(2);
});
