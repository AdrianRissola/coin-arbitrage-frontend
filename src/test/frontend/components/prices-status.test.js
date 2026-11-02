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

test('prices expose ticker units, count and original incoming order', () => {
  render(<MarketPrices ticker="BTC-USDT" marketPrices={prices()} />);
  expect(priceRows()).toEqual([
    ['Gamma', '125'],
    ['Alpha', '80'],
    ['Beta', '100'],
  ]);
  expect(
    screen.getByRole('columnheader', { name: 'BTC Markets (3)' })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('columnheader', { name: 'Price (USDT)' })
  ).toBeInTheDocument();
});

test('checking price order sorts rows; unchecking does not restore incoming order', () => {
  render(<MarketPrices ticker="BTC-USDT" marketPrices={prices()} />);
  const order = screen.getByRole('checkbox');
  userEvent.click(order);
  expect(priceRows()).toEqual([
    ['Alpha', '80'],
    ['Beta', '100'],
    ['Gamma', '125'],
  ]);
  userEvent.click(order);
  expect(priceRows()).toEqual([
    ['Alpha', '80'],
    ['Beta', '100'],
    ['Gamma', '125'],
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

test('a malformed price retains its toLocaleString render failure', () => {
  expectRenderFailure(
    <MarketPrices ticker="BTC-USDT" marketPrices={[{ market: 'Broken' }]} />,
    /toLocaleString/
  );
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
