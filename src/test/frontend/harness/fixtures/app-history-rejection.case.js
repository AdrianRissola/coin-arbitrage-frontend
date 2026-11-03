import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { prepareApps } from '../../support/app-runtime';

let createApp;
beforeAll(async () => {
  createApp = await prepareApps();
});

test('real App history navigation retains the unhandled rejected service follow-up', async () => {
  const app = createApp({
    transport: { history: [{ tickers: ['BTC-USDT'], reject: true }] },
  });
  await app.open();
  userEvent.click(screen.getByRole('link', { name: 'Historical' }));
  await screen.findByText('ETH-USD', { selector: 'label' });
});
