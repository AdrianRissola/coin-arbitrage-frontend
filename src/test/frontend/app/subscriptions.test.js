import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { prepareApps } from '../support/app-runtime';
import { clone } from '../support/ui-fixtures';
import requests from '../../fixtures/contracts/v1/requests.json';
import arbitrage from '../../fixtures/contracts/v1/ws-arbitrage.json';

let createApp;
beforeAll(async () => {
  createApp = await prepareApps();
});

test('actual App opens one controlled socket and sends the exact shared initial subscription', async () => {
  const app = createApp();
  expect(app.sockets).toHaveLength(1);
  expect(app.socket.sent).toEqual([]);
  expect(
    screen.getByRole('link', { name: 'Real-Time Arbitrage Monitor' })
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('heading', { name: 'BTC-USDT Arbitrage' })
  ).not.toBeInTheDocument();
  await app.open();
  expect(app.socket.sent.map(JSON.parse)).toEqual([requests.websocket.initial]);
});

test('shared arbitrage response reaches actual App state, view, cards and price rows', async () => {
  const app = createApp();
  await app.open();
  await app.message(arbitrage);
  expect(await screen.findByText('Alpha-Gamma')).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: 'BTC-USDT Arbitrage' })
  ).toBeInTheDocument();
  expect(screen.getAllByRole('table')).toHaveLength(5);
});

test('real navbar retains the lowercase arbitrage request', async () => {
  const app = createApp();
  await app.open();
  userEvent.click(screen.getByRole('link', { name: 'All Arbitrage' }));
  expect(app.socket.sent.map(JSON.parse)).toEqual([
    requests.websocket.initial,
    requests.websocket.navbar,
  ]);
});

test('brand link sends the same lowercase request as the actual arbitrage navbar item', async () => {
  const app = createApp();
  await app.open();
  userEvent.click(
    screen.getByRole('link', { name: 'Real-Time Arbitrage Monitor' })
  );
  expect(app.socket.sent.map(JSON.parse)).toEqual([
    requests.websocket.initial,
    requests.websocket.navbar,
  ]);
});

test.each([
  ['Best Arbitrage', requests.websocket.best],
  ['Markets', requests.websocket.markets],
])(
  'actual %s navigation emits its exact shared request, with no invented fields',
  async (link, request) => {
    const app = createApp();
    await app.open();
    userEvent.click(screen.getByRole('link', { name: link }));
    expect(app.socket.sent.map(JSON.parse)).toEqual([
      requests.websocket.initial,
      request,
    ]);
  }
);

test('ticker selection uses the actual view radio callback and uppercase subscription', async () => {
  const app = createApp();
  await app.open();
  await app.message(arbitrage);
  userEvent.click(await screen.findByText('BTC-USD', { selector: 'label' }));
  expect(app.socket.sent.map(JSON.parse)).toEqual([
    requests.websocket.initial,
    { channel: 'arbitrage', ticker: 'BTC-USD' },
  ]);
});

test('selecting the currently acknowledged ticker does not send another subscription', async () => {
  const app = createApp();
  await app.open();
  await app.message(arbitrage);
  userEvent.click(await screen.findByText('BTC-USDT', { selector: 'label' }));
  expect(app.socket.sent.map(JSON.parse)).toEqual([requests.websocket.initial]);
});

test('a newly selected uppercase ticker response updates actual App heading, opportunities and quote units', async () => {
  const app = createApp();
  await app.open();
  await app.message(arbitrage);
  userEvent.click(await screen.findByText('BTC-USD', { selector: 'label' }));
  const frame = clone(arbitrage);
  frame.ticker = 'BTC-USD';
  frame.arbitrages = { 'BTC-USD': frame.arbitrages['BTC-USDT'] };
  Object.values(frame.arbitrages['BTC-USD']).forEach((record) => {
    record.transactions.forEach((transaction) => {
      transaction.pair = 'BTC-USD';
    });
  });
  frame.marketPrices = { 'BTC-USD': frame.marketPrices['BTC-USDT'].reverse() };
  await app.message(frame);
  expect(
    screen.getByRole('heading', { name: 'BTC-USD Arbitrage' })
  ).toBeInTheDocument();
  expect(screen.getAllByText('56.3% USD')).toHaveLength(2);
  expect(screen.queryByText('56.3% USDT')).not.toBeInTheDocument();
});

test('changing selection while connecting sends only the latest desired request on open', async () => {
  const app = createApp();
  userEvent.click(screen.getByRole('link', { name: 'Best Arbitrage' }));
  expect(app.socket.sent).toEqual([]);
  await app.open();
  expect(app.socket.sent.map(JSON.parse)).toEqual([requests.websocket.best]);
});

test('repeated unacknowledged best requests are not deduplicated by the last sent request', async () => {
  const app = createApp();
  await app.open();
  userEvent.click(screen.getByRole('link', { name: 'Best Arbitrage' }));
  userEvent.click(screen.getByRole('link', { name: 'Best Arbitrage' }));
  expect(app.socket.sent.map(JSON.parse)).toEqual([
    requests.websocket.initial,
    requests.websocket.best,
    requests.websocket.best,
  ]);
});

test('an open callback without actual OPEN readiness sends nothing', async () => {
  const app = createApp();
  app.socket.dispatchEvent(new Event('open'));
  expect(app.socket.sent).toEqual([]);
});
