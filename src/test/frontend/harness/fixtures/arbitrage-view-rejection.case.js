import React from 'react';
import { render, screen } from '@testing-library/react';
import { pairMap, prices } from '../../support/ui-fixtures';
import { installTransport, loadViews } from '../../support/ui-runtime';

let views;
beforeAll(async () => {
  views = await loadViews();
});

test('actual arbitrage view retains the unhandled rejected-ticker follow-up', async () => {
  installTransport({ tickers: [{ reject: true }] });
  render(
    <views.ArbitrageView
      ticker="BTC-USDT"
      arbitrages={pairMap()}
      marketPrices={prices()}
      handleChangeChannelSubscriptionClick={jest.fn()}
    />
  );
  await screen.findByText('Alpha-Gamma');
});
