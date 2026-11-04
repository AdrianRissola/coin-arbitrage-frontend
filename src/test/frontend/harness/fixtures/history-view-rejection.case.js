import React from 'react';
import { render, screen } from '@testing-library/react';
import { seedStorage } from '../../support/ui-fixtures';
import { installTransport, loadViews } from '../../support/ui-runtime';

let views;
beforeAll(async () => {
  views = await loadViews();
});

test('actual historical view contains rejection and stops loading', async () => {
  seedStorage();
  installTransport({ history: [{ tickers: ['BTC-USDT'], reject: true }] });
  render(<views.HistoricalView />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Historical arbitrage service is not available');
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
