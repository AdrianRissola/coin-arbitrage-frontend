import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MarketPrices from '../../../components/MarketPrices';
import MarketStatus from '../../../components/MarketStatus';
import { prices } from '../support/ui-fixtures';
import { expectRenderFailure } from '../support/ui-runtime';

const priceRows = () =>
  within(screen.getByRole('table'))
    .getAllByRole('row')
    .slice(2)
    .map((row) =>
      within(row)
        .getAllByRole('cell')
        .map((cell) => cell.textContent)
    );

test('prices expose bid/ask/last columns, count and incoming order', () => {
  render(<MarketPrices ticker="BTC-USDT" marketPrices={prices()} />);
  expect(priceRows()).toEqual([
    ['Gamma', '124.5', '125.5', '125'],
    ['Alpha', '79.5', '80.5', '80'],
    ['Betadisconnected', '99.5', '100.5', '100'],
  ]);
  expect(
    screen.getByRole('columnheader', { name: 'BTC Markets (3)' })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('columnheader', { name: 'Bid (USDT)' })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('columnheader', { name: 'Ask (USDT)' })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('columnheader', { name: 'Last (USDT)' })
  ).toBeInTheDocument();
});

test('stale and aged quotes are badged, dimmed and annotated', () => {
  const rows = prices();
  rows[0] = { ...rows[0], stale: true, timestamp: Date.now() - 10_000 };
  render(<MarketPrices ticker="BTC-USDT" marketPrices={rows} />);
  const table = screen.getByRole('table');
  expect(within(table).getByText('stale')).toBeInTheDocument();
  expect(within(table).getByText(/s ago\)/)).toBeInTheDocument();
  const staleRow = within(table)
    .getAllByRole('row')
    .find(row => row.textContent.includes('Gamma'));
  expect(staleRow).toHaveStyle({ opacity: '0.55' });
});

test('checking price order sorts by ask; unchecking restores incoming order', () => {
  render(<MarketPrices ticker="BTC-USDT" marketPrices={prices()} />);
  const order = screen.getByRole('checkbox');
  userEvent.click(order);
  expect(priceRows()).toEqual([
    ['Alpha', '79.5', '80.5', '80'],
    ['Gamma', '124.5', '125.5', '125'],
    ['Betadisconnected', '99.5', '100.5', '100'],
  ]);
  userEvent.click(order);
  expect(priceRows()).toEqual([
    ['Gamma', '124.5', '125.5', '125'],
    ['Alpha', '79.5', '80.5', '80'],
    ['Betadisconnected', '99.5', '100.5', '100'],
  ]);
  expect(order).not.toBeChecked();
});

test('empty supplied prices still show an empty table, count and default coin units', () => {
  render(<MarketPrices marketPrices={[]} />);
  expect(priceRows()).toEqual([]);
  expect(
    screen.getByRole('columnheader', { name: 'coin Markets (0)' })
  ).toBeInTheDocument();
});

test.each([undefined, null])(
  'missing prices %p initially render no table or loading state',
  (data) => {
    render(<MarketPrices marketPrices={data} />);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  }
);

test('a row with no quote sides renders em-dashes instead of crashing', () => {
  render(<MarketPrices ticker="BTC-USDT" marketPrices={[{ market: 'Broken' }]} />);
  expect(priceRows()).toEqual([['Broken', '—', '—', '—']]);
});

test('status counts and rows preserve host descriptions and connection labels', () => {
  const { container } = render(
    <MarketStatus
      darkMode
      marketsStatus={{
        connectedMarkets: ['alpha.invalid', 'beta.invalid'],
        disconnectedMarkets: ['gamma.invalid - controlled close'],
      }}
    />
  );
  expect(container).toHaveTextContent('Connected: 2');
  expect(container).toHaveTextContent('Disconnected: 1');
  expect(
    within(screen.getByRole('table'))
      .getAllByRole('row')
      .map((row) => row.textContent)
  ).toEqual([
    'alpha.invalidConnected',
    'beta.invalidConnected',
    'gamma.invalid - controlled closeDisconnected',
  ]);
});

test('missing status defaults to zero counts and no rows', () => {
  render(<MarketStatus />);
  expect(screen.getByText(/Connected: 0/)).toHaveTextContent('Disconnected: 0');
  expect(screen.queryByRole('row')).not.toBeInTheDocument();
});

test('truthy malformed status keeps its native length failure', () => {
  expectRenderFailure(<MarketStatus marketsStatus={{}} />, /length/);
});
