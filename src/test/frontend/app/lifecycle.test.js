import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { prepareApps } from '../support/app-runtime';
import { clone } from '../support/ui-fixtures';
import arbitrage from '../../fixtures/contracts/v1/ws-arbitrage.json';
import best from '../../fixtures/contracts/v1/ws-best-arbitrage.json';
import welcome from '../../fixtures/contracts/v1/ws-welcome.json';
import requests from '../../fixtures/contracts/v1/requests.json';

let createApp;
beforeAll(async () => {
  createApp = await prepareApps();
});

test('the real provider shows connecting status but open alone does not enqueue another notification', async () => {
  const app = createApp();
  expect(
    await screen.findByText('WebSocket status: CONNECTING')
  ).toBeInTheDocument();
  await app.open();
  await app.message(welcome);
  expect(screen.queryByText('WebSocket status: OPEN')).not.toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: '| Light' }));
  expect(await screen.findByText('WebSocket status: OPEN')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '| Dark' })).toBeInTheDocument();
});

test('closing status is observed only on a render and does not create a replacement socket', async () => {
  const app = createApp();
  await app.open();
  app.socket.close();
  expect(
    screen.queryByText('WebSocket status: CLOSING')
  ).not.toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: '| Light' }));
  expect(
    await screen.findByText('WebSocket status: CLOSING')
  ).toBeInTheDocument();
  expect(app.sockets).toHaveLength(1);
});

test('closed events do not autonomously reconnect; the next render creates a connecting socket rather than a CLOSED notification', async () => {
  const app = createApp();
  await app.open();
  const old = app.socket;
  await app.serverClose();
  expect(app.sockets).toHaveLength(1);
  app.rerender();
  expect(app.sockets).toHaveLength(2);
  expect(app.socket.readyState).toBe(app.socket.CONNECTING);
  expect(old.readyState).toBe(old.CLOSED);
  expect(
    screen.queryByText('WebSocket status: CLOSED')
  ).not.toBeInTheDocument();
  await app.open();
  expect(app.socket.sent.map(JSON.parse)).toEqual([requests.websocket.initial]);
});

test('interaction with a closed socket replaces it and open uses the newly selected request', async () => {
  const app = createApp();
  await app.open();
  await app.serverClose();
  userEvent.click(screen.getByRole('link', { name: 'Markets' }));
  expect(app.sockets).toHaveLength(2);
  expect(app.socket.sent).toEqual([]);
  await app.open();
  expect(app.socket.sent.map(JSON.parse)).toEqual([requests.websocket.markets]);
});

test('socket errors display both banners and valid data clears both', async () => {
  const app = createApp();
  await app.open();
  await app.error();
  expect(
    screen.getByText('Arbitrage service is not available')
  ).toBeInTheDocument();
  expect(
    screen.getByText('Market prices service is not available')
  ).toBeInTheDocument();
  await app.message(arbitrage);
  expect(
    screen.queryByText('Arbitrage service is not available')
  ).not.toBeInTheDocument();
  expect(
    screen.queryByText('Market prices service is not available')
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole('columnheader', { name: 'BTC Markets (3)' })
  ).toBeInTheDocument();
});

test.each([
  ['empty prices', { ...arbitrage, marketPrices: { 'BTC-USDT': [] } }],
  ['best data', best],
  ['empty best data', { channel: 'bestArbitrage', ticker: 'ALL', bestArbitrages: { arbitragesData: [] } }],
])('%s clears the recovered market-price banner', async (name, frame) => {
  const app = createApp();
  await app.open();
  if (frame.channel === 'bestArbitrage')
    userEvent.click(screen.getByRole('link', { name: 'Best Arbitrage' }));
  await app.error();
  await app.message(frame);
  expect(screen.queryByText('Market prices service is not available')).not.toBeInTheDocument();
});

test('an unrelated ticker cannot clear the market-price error', async () => {
  const app = createApp();
  await app.open();
  await app.error();
  await app.message({ ...arbitrage, ticker: 'ETH-USDT' });
  expect(screen.getByText('Market prices service is not available')).toBeInTheDocument();
});

test('unmount does not close the module-scoped socket or remove its public handlers', async () => {
  const app = createApp();
  await app.open();
  const socket = app.socket;
  app.unmount();
  expect(socket.closeCalls).toEqual([]);
  expect(socket.readyState).toBe(socket.OPEN);
  expect(typeof socket.onmessage).toBe('function');
  expect(typeof socket.onerror).toBe('function');
});

test('remounting the same module reuses its open socket and status without resubscribing or restoring component data', async () => {
  const app = createApp();
  await app.open();
  await app.message(arbitrage);
  expect(await screen.findByText('WebSocket status: OPEN')).toBeInTheDocument();
  const sent = app.socket.sent.slice();
  app.unmount();
  app.mount();
  expect(app.sockets).toHaveLength(1);
  expect(app.socket.sent).toEqual(sent);
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
  expect(screen.queryByText(/WebSocket status:/)).not.toBeInTheDocument();
});

test('rerenders replace event properties rather than registering duplicate open subscriptions', async () => {
  const app = createApp();
  const handler = app.socket.onopen;
  app.rerender();
  app.rerender();
  expect(app.socket.onopen).not.toBe(handler);
  await app.open();
  expect(app.socket.sent.map(JSON.parse)).toEqual([requests.websocket.initial]);
});

test('each fresh isolated App starts with a new connecting socket and uppercase default state', async () => {
  const first = createApp();
  await first.open();
  userEvent.click(screen.getByRole('link', { name: 'Best Arbitrage' }));
  first.unmount();
  const second = createApp();
  expect(second.socket.readyState).toBe(second.socket.CONNECTING);
  await second.open();
  expect(second.socket.sent.map(JSON.parse)).toEqual([
    requests.websocket.initial,
  ]);
});

test('message callbacks always consume the latest request after a rendered selection change', async () => {
  const app = createApp();
  await app.open();
  await app.message(arbitrage);
  userEvent.click(await screen.findByText('BTC-USD', { selector: 'label' }));
  const stale = clone(arbitrage);
  stale.marketPrices = { 'BTC-USDT': [{ market: 'StaleOnly', price: 999 }] };
  await act(async () => app.socket.message(stale));
  expect(
    screen.getByRole('heading', { name: 'BTC-USDT Arbitrage' })
  ).toBeInTheDocument();
  expect(screen.queryByText('StaleOnly')).not.toBeInTheDocument();
  expect(
    screen.getByRole('columnheader', { name: 'BTC Markets (3)' })
  ).toBeInTheDocument();
  expect(app.socket.sent.map(JSON.parse).at(-1)).toEqual({
    channel: 'arbitrage',
    ticker: 'BTC-USD',
  });
});
