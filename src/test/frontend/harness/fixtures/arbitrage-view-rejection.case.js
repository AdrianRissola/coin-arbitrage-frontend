import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { pairMap, prices } from '../../support/ui-fixtures';
import { installTransport, loadViews } from '../../support/ui-runtime';

let views;
beforeAll(async () => {
  views = await loadViews();
});

test('arbitrage view contains rejected metadata and retries successfully', async () => {
  installTransport({ tickers: [{ reject: true }] });
  render(
    <views.ArbitrageView
      ticker="BTC-USDT"
      arbitrages={pairMap()}
      marketPrices={prices()}
      handleChangeChannelSubscriptionClick={jest.fn()}
    />
  );
  expect(await screen.findByRole('alert')).toHaveTextContent('Ticker information is not available');
  userEvent.click(screen.getByRole('button', { name: 'Retry tickers' }));
  await screen.findByText('ETH', { selector: 'label' });
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
