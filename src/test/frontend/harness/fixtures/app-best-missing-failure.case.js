import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { prepareApps } from '../../support/app-runtime';

let createApp;
beforeAll(async () => {
  createApp = await prepareApps();
});

test('actual App retains its missing best payload event-handler failure', async () => {
  const app = createApp();
  await app.open();
  userEvent.click(screen.getByRole('link', { name: 'Best Arbitrage' }));
  await app.message({ channel: 'bestArbitrage', ticker: 'ALL' });
});
