import React from 'react';
import {
  render,
  screen,
  within,
  queryAllByAttribute,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { pairMap, prices } from '../support/ui-fixtures';
import {
  deferred,
  installTransport,
  loadViews,
  resolveResponse,
} from '../support/ui-runtime';

let views;
beforeAll(async () => {
  views = await loadViews();
});
const props = () => ({
  ticker: 'BTC-USDT',
  arbitrages: pairMap(),
  marketPrices: prices(),
  handleChangeChannelSubscriptionClick: jest.fn(),
});
const selectLabel = (name) =>
  userEvent.click(screen.getByText(name, { selector: 'label' }));
const tickerNames = () =>
  screen
    .getAllByRole('radio')
    .filter((radio) => radio.name === 'btnradioTciker')
    .map((radio) => radio.id);
const headers = (container) =>
  queryAllByAttribute('class', container, 'card-header').map(
    (node) => node.textContent
  );

test('real view resolves metadata into filters, ticker choices, cards and a price table', async () => {
  const transport = installTransport();
  const { container } = render(<views.ArbitrageView {...props()} />);
  await screen.findByText('Alpha-Gamma');
  expect(
    screen.getByRole('heading', { name: 'BTC-USDT Arbitrage' })
  ).toBeInTheDocument();
  expect(tickerNames()).toEqual(['BTC-USD', 'BTC-USDT']);
  expect(headers(container)).toEqual([
    'Best Arbitrage',
    'Alpha-Beta',
    'Alpha-Gamma',
    'Beta-Gamma',
  ]);
  expect(screen.getAllByRole('table')).toHaveLength(5);
  expect(transport.calls.map((call) => call.kind).sort()).toEqual([
    'available-tickers',
    'markets',
  ]);
});

test('market and exact percentage boundaries affect pair cards but never filter away best', async () => {
  installTransport();
  const { container } = render(<views.ArbitrageView {...props()} />);
  await screen.findByText('Alpha-Gamma');
  userEvent.type(screen.getByRole('textbox'), 'beta');
  expect(headers(container)).toEqual([
    'Best Arbitrage',
    'Alpha-Beta',
    'Beta-Gamma',
  ]);
  userEvent.clear(screen.getByRole('spinbutton'));
  userEvent.type(screen.getByRole('spinbutton'), '36');
  expect(headers(container)).toEqual(['Best Arbitrage']);
  userEvent.clear(screen.getByRole('textbox'));
  expect(headers(container)).toEqual(['Best Arbitrage', 'Alpha-Gamma']);
  userEvent.clear(screen.getByRole('spinbutton'));
  userEvent.type(screen.getByRole('spinbutton'), '36.01');
  expect(headers(container)).toEqual(['Best Arbitrage']);
});

test('base/quote choices change real ticker buttons while subscription remains a parent callback', async () => {
  installTransport();
  const data = props();
  render(<views.ArbitrageView {...data} />);
  await screen.findByText('ETH', { selector: 'label' });
  selectLabel('ETH');
  expect(tickerNames()).toEqual(['ETH-USD', 'ETH-USDT']);
  selectLabel('ETH-USD');
  expect(data.handleChangeChannelSubscriptionClick).toHaveBeenLastCalledWith({
    channel: 'arbitrage',
    ticker: 'ETH-USD',
  });
  expect(
    screen.getByRole('heading', { name: 'BTC-USDT Arbitrage' })
  ).toBeInTheDocument();
  selectLabel('USD');
  expect(tickerNames()).toEqual(['BTC-USD', 'ETH-USD']);
});

test('scroll controls target the current ticker strip through the existing browser API', async () => {
  installTransport();
  const { container } = render(<views.ArbitrageView {...props()} />);
  await screen.findByText('ETH', { selector: 'label' });
  const strip = queryAllByAttribute('id', container, 'BTCscroll')[0];
  strip.scrollBy = jest.fn();
  const buttons = within(
    queryAllByAttribute('class', container, 'cover')[0]
  ).getAllByRole('button');
  userEvent.click(buttons[0]);
  userEvent.click(buttons[1]);
  expect(strip.scrollBy.mock.calls).toEqual([
    [-200, 0],
    [200, 0],
  ]);
});

test('empty metadata leaves supplied arbitrage/prices visible without inventing ticker options', async () => {
  const tickers = deferred();
  const markets = deferred();
  const transport = installTransport({
    tickers: [{ deferred: tickers }],
    markets: [{ deferred: markets }],
  });
  render(<views.ArbitrageView {...props()} />);
  await resolveResponse(tickers, []);
  await resolveResponse(markets, []);
  expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  expect(screen.getByText('Best Arbitrage')).toBeInTheDocument();
  expect(transport.calls).toHaveLength(2);
});
