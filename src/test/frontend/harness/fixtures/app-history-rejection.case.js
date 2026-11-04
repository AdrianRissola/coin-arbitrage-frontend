import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { prepareApps } from '../../support/app-runtime';

let createApp;
beforeAll(async () => {
  createApp = await prepareApps();
});

test('real App history navigation contains failure and allows retry', async () => {
  const app = createApp({
    transport: { history: [
      { tickers: ['BTC-USDT'], reject: true },
      { tickers: ['BTC-USDT'], data: [] },
    ] },
  });
  await app.open();
  userEvent.click(screen.getByRole('link', { name: 'Historical' }));
  expect(await screen.findByText('Historical arbitrage service is not available')).toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: 'Find' }));
  await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  expect(screen.queryByText('Historical arbitrage service is not available')).not.toBeInTheDocument();
});
