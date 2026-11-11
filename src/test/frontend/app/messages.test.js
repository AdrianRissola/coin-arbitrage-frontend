import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { prepareApps } from '../support/app-runtime';
import { clone } from '../support/ui-fixtures';
import arbitrage from '../../fixtures/contracts/v1/ws-arbitrage.json';
import best from '../../fixtures/contracts/v1/ws-best-arbitrage.json';
import markets from '../../fixtures/contracts/v1/ws-markets.json';
import welcome from '../../fixtures/contracts/v1/ws-welcome.json';
import noData from '../../fixtures/contracts/v1/no-data.json';

let createApp;
beforeAll(async () => {
  createApp = await prepareApps();
});

test.each([null, [], 42, true, 'invalid'])(
  'a non-object frame %p is ignored and valid data still arrives',
  async (frame) => {
    const app = createApp();
    await app.open();
    const sent = app.socket.sent.slice();
    await app.message(frame);
    await app.message(arbitrage);
    expect(screen.getByText('Alpha-Gamma')).toBeInTheDocument();
    expect(app.socket.sent).toEqual(sent);
  }
);

test.each([
  ['non-array prices', { marketPrices: { 'BTC-USDT': {} } }],
  ['null price row', { marketPrices: { 'BTC-USDT': [null] } }],
  ['object message', { message: { invalid: true } }],
  ['invalid arbitrage map', { arbitrages: { 'BTC-USDT': [] } }],
  ['missing transactions', { arbitrages: { 'BTC-USDT': { 'Alpha-Gamma': {} } } }],
])('malformed %s cannot replace valid arbitrage data', async (name, invalid) => {
  const app = createApp();
  await app.open();
  await app.message(arbitrage);
  const sent = app.socket.sent.slice();
  await app.message({ ...clone(arbitrage), ...invalid });
  expect(screen.getByText('Alpha-Gamma')).toBeInTheDocument();
  await app.message(arbitrage);
  expect(screen.getByRole('columnheader', { name: 'BTC Markets (3)' })).toBeInTheDocument();
  expect(app.socket.sent).toEqual(sent);
});

test.each([undefined, null, {}, { arbitragesData: {} }, { arbitragesData: [null] },
  { arbitragesData: [{ arbitrage: {}, marketPrices: {} }] },
])('malformed best payload %p preserves valid cards and permits recovery', async (payload) => {
  const app = createApp();
  await app.open();
  userEvent.click(screen.getByRole('link', { name: 'Best Arbitrage' }));
  await app.message(best);
  const sent = app.socket.sent.slice();
  await app.message({ channel: 'bestArbitrage', ticker: 'ALL', bestArbitrages: payload });
  expect(screen.getByText('Best Arbitrage: ETH-USD')).toBeInTheDocument();
  await app.message(best);
  expect(app.socket.sent).toEqual(sent);
});

test.each([{}, { connectedMarkets: [null], disconnectedMarkets: [] }])(
  'invalid market status %p cannot replace valid connections', async (invalid) => {
    const app = createApp();
    await app.open();
    userEvent.click(screen.getByRole('link', { name: 'Markets' }));
    await app.message(markets);
    await app.message({ channel: 'markets', markets: invalid });
    expect(screen.getByText(/Connected: 2/)).toHaveTextContent('Disconnected: 1');
    await app.message(markets);
    expect(screen.getByText(/Connected: 2/)).toHaveTextContent('Disconnected: 1');
  }
);

test.each([
  ['shared welcome', welcome],
  [
    'unselected prices channel',
    {
      channel: 'prices',
      ticker: 'BTC-USDT',
      marketPrices: { 'BTC-USDT': [{ market: 'Ignored', price: 999 }] },
    },
  ],
  ['unselected markets channel', markets],
])(
  '%s leaves the initial view empty and sends no response',
  async (name, frame) => {
    const app = createApp();
    await app.open();
    await app.message(frame);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(app.socket.sent).toHaveLength(1);
  }
);

test('a wrong arbitrage ticker retains the previously displayed records and prices', async () => {
  const app = createApp();
  await app.open();
  await app.message(arbitrage);
  await app.message({
    ...clone(arbitrage),
    ticker: 'ETH-USDT',
    marketPrices: { 'BTC-USDT': [{ market: 'Ignored', price: 999 }] },
  });
  expect(
    screen.getByRole('heading', { name: 'BTC-USDT Arbitrage' })
  ).toBeInTheDocument();
  expect(screen.getByText('Alpha-Gamma')).toBeInTheDocument();
  expect(screen.queryByText('Ignored')).not.toBeInTheDocument();
});

test('uppercase responses after lowercase navbar requests do not refresh visible prices', async () => {
  const app = createApp();
  await app.open();
  await app.message(arbitrage);
  userEvent.click(screen.getByRole('link', { name: 'All Arbitrage' }));
  await app.message({
    ...clone(arbitrage),
    marketPrices: { 'BTC-USDT': [{ market: 'Ignored', price: 999 }] },
  });
  expect(screen.queryByText('Ignored')).not.toBeInTheDocument();
  expect(
    screen.getByRole('columnheader', { name: 'BTC Markets (3)' })
  ).toBeInTheDocument();
});

test('a missing initial price payload sets its banner without fabricating an arbitrage view', async () => {
  const app = createApp();
  await app.open();
  const frame = clone(arbitrage);
  delete frame.marketPrices;
  frame.message = 'controlled missing prices';
  await app.message(frame);
  expect(screen.getByText('controlled missing prices')).toBeInTheDocument();
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
});

test('missing later prices preserve the previous table alongside the supplied message', async () => {
  const app = createApp();
  await app.open();
  await app.message(arbitrage);
  const frame = clone(arbitrage);
  delete frame.marketPrices;
  frame.message = 'controlled stale prices';
  await app.message(frame);
  expect(screen.getByText('controlled stale prices')).toBeInTheDocument();
  expect(
    screen.getByRole('columnheader', { name: 'BTC Markets (3)' })
  ).toBeInTheDocument();
});

test('a market with no Last but valid Bid/Ask is accepted and displays both sides', async () => {
  const app = createApp();
  await app.open();
  const frame = clone(arbitrage);
  frame.marketPrices['BTC-USDT'][0].price = null;
  await app.message(frame);
  const table = screen.getAllByRole('table').at(-1);
  const alpha = within(table)
    .getAllByRole('row')
    .find(row => row.textContent.includes('Alpha'));
  expect(within(alpha).getAllByRole('cell').map(cell => cell.textContent)).toEqual([
    'Alpha',
    '79',
    '80',
    '—',
  ]);
});

test('an empty price object retains the old table without entering the missing-price message branch', async () => {
  const app = createApp();
  await app.open();
  await app.message(arbitrage);
  await app.message({
    ...clone(arbitrage),
    marketPrices: {},
    message: 'not displayed',
  });
  expect(screen.queryByText('not displayed')).not.toBeInTheDocument();
  expect(
    screen.getByRole('columnheader', { name: 'BTC Markets (3)' })
  ).toBeInTheDocument();
});

test('the shared no-data payload replaces opportunities with current NotAvailable rows', async () => {
  const app = createApp();
  await app.open();
  await app.message(arbitrage);
  await app.message(noData.arbitrageMessage);
  expect(screen.queryByText('Alpha-Gamma')).not.toBeInTheDocument();
  expect(screen.getAllByText('NotAvailable').length).toBeGreaterThan(0);
  expect(
    screen.getByRole('columnheader', { name: 'BTC Markets (0)' })
  ).toBeInTheDocument();
});

test('best navigation keeps the previous view until a matching channel response arrives', async () => {
  const app = createApp();
  await app.open();
  await app.message(arbitrage);
  userEvent.click(screen.getByRole('link', { name: 'Best Arbitrage' }));
  expect(
    screen.getByRole('heading', { name: 'BTC-USDT Arbitrage' })
  ).toBeInTheDocument();
  await app.message(best);
  expect(screen.getByText('Best Arbitrage: ETH-USD')).toBeInTheDocument();
  expect(screen.getByText('60% USD')).toBeInTheDocument();
  expect(
    screen.queryByRole('heading', { name: 'BTC-USDT Arbitrage' })
  ).not.toBeInTheDocument();
  const sent = app.socket.sent.slice();
  userEvent.click(screen.getByText('USDT', { selector: 'label' }));
  expect(screen.getByText('Best Arbitrage: BTC-USDT')).toBeInTheDocument();
  expect(app.socket.sent).toEqual(sent);
});

test('lowercase best responses after valid data retain that data but acknowledge lowercase subscription metadata', async () => {
  const app = createApp();
  await app.open();
  userEvent.click(screen.getByRole('link', { name: 'Best Arbitrage' }));
  await app.message(best);
  userEvent.click(screen.getByRole('link', { name: 'Best Arbitrage' }));
  expect(app.socket.sent).toHaveLength(3);
  await app.message({ channel: 'bestArbitrage', ticker: 'all' });
  const sent = app.socket.sent.slice();
  userEvent.click(screen.getByRole('link', { name: 'Best Arbitrage' }));
  expect(app.socket.sent).toEqual(sent);
  expect(screen.getByText('Best Arbitrage: ETH-USD')).toBeInTheDocument();
});

test('shared market status drives the real status view and REST metadata together', async () => {
  const app = createApp();
  await app.open();
  userEvent.click(screen.getByRole('link', { name: 'Markets' }));
  await app.message(markets);
  expect(screen.getByRole('heading', { name: 'Markets' })).toBeInTheDocument();
  expect(
    await screen.findByRole('link', { name: 'Alpha' })
  ).toBeInTheDocument();
  expect(screen.getByText('alpha.invalid')).toBeInTheDocument();
  expect(screen.getByText(/Connected: 2/)).toHaveTextContent('Disconnected: 1');
  await app.message({ channel: 'markets' });
  expect(screen.getByText('alpha.invalid')).toBeInTheDocument();
  expect(
    app.transport.calls.filter((call) => call.kind === 'markets')
  ).toHaveLength(1);
});

test.each([{}, { 'BTC-USDT': {} }])('empty arbitrage maps %p clear stale cards and recover', async (empty) => {
  const app = createApp();
  await app.open();
  await app.message(arbitrage);
  await app.message({ channel: 'arbitrage', ticker: 'BTC-USDT', arbitrages: empty, marketPrices: { 'BTC-USDT': [] } });
  expect(screen.queryByText('Alpha-Gamma')).not.toBeInTheDocument();
  expect(screen.getAllByText('NotAvailable').length).toBeGreaterThan(0);
  await app.message(arbitrage);
  expect(screen.getByText('Alpha-Gamma')).toBeInTheDocument();
});

test('empty best frames clear stale cards and recover on the same subscription', async () => {
  const app = createApp();
  await app.open();
  userEvent.click(screen.getByRole('link', { name: 'Best Arbitrage' }));
  const sent = app.socket.sent.slice();
  const empty = {
    channel: 'bestArbitrage',
    ticker: 'ALL',
    bestArbitrages: { arbitragesData: [] },
    message: 'No arbitrage available for: ALL',
  };
  await app.message(empty);
  expect(screen.getByText('No arbitrages available')).toBeInTheDocument();
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
  await app.message(best);
  expect(screen.getByText('Best Arbitrage: ETH-USD')).toBeInTheDocument();
  await app.message(empty);
  expect(screen.getByText('No arbitrages available')).toBeInTheDocument();
  expect(screen.queryByText('Best Arbitrage: ETH-USD')).not.toBeInTheDocument();
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
  await app.message(best);
  expect(screen.getByText('Best Arbitrage: ETH-USD')).toBeInTheDocument();
  expect(app.socket.sent).toEqual(sent);
});
