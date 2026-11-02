import React from 'react';
import { render, screen } from '@testing-library/react';
import { seedStorage } from '../../support/ui-fixtures';
import { installTransport, loadViews } from '../../support/ui-runtime';

let views;
beforeAll(async () => {
  views = await loadViews();
});

test('actual historical view retains the unhandled rejected-request follow-up', async () => {
  seedStorage();
  installTransport({ history: [{ tickers: ['BTC-USDT'], reject: true }] });
  render(<views.HistoricalView />);
  await screen.findByText('ETH-USD', { selector: 'label' });
});
