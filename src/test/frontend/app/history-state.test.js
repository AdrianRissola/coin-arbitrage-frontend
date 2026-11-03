import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { prepareApps } from '../support/app-runtime';
import { deferred, resolveResponse } from '../support/ui-runtime';
import arbitrage from '../../fixtures/contracts/v1/ws-arbitrage.json';
import history from '../../fixtures/contracts/v1/historical-arbitrages.json';
import requests from '../../fixtures/contracts/v1/requests.json';
import noData from '../../fixtures/contracts/v1/no-data.json';

let createApp;
beforeAll(async () => {
  createApp = await prepareApps();
});

test('historical navigation pauses message consumption before JSON parsing without sending unsubscribe', async () => {
  const pending = deferred();
  const app = createApp({
    transport: { history: [{ tickers: ['BTC-USDT'], deferred: pending }] },
  });
  await app.open();
  await app.message(arbitrage);
  userEvent.click(screen.getByRole('link', { name: 'Historical' }));
  expect(
    screen.getByRole('heading', { name: 'Historical' })
  ).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Loading...');
  await act(async () => app.socket.rawMessage('not valid JSON'));
  await app.message(arbitrage);
  expect(screen.queryByText('Alpha-Gamma')).not.toBeInTheDocument();
  expect(app.socket.sent.map(JSON.parse)).toEqual([requests.websocket.initial]);
  await resolveResponse(pending, history);
  expect(
    await screen.findByRole('heading', { name: 'Arbitrage Found: 2' })
  ).toBeInTheDocument();
  expect(
    app.transport.calls.find((call) => call.kind === 'historical-arbitrages')
      .uri
  ).toBe(
    'http://127.0.0.1:1/coin-arbitrage/crypto/historical-arbitrages?tickers[]=BTC-USDT'
  );
});

test('returning from history resumes stream consumption through actual navbar and ticker controls', async () => {
  const app = createApp({
    transport: { history: [{ tickers: ['BTC-USDT'], data: [] }] },
  });
  await app.open();
  await app.message(arbitrage);
  userEvent.click(screen.getByRole('link', { name: 'Historical' }));
  expect(
    await screen.findByText('ETH-USD', { selector: 'label' })
  ).toBeInTheDocument();
  userEvent.click(screen.getByRole('link', { name: 'All Arbitrage' }));
  userEvent.click(await screen.findByText('BTC-USDT', { selector: 'label' }));
  await app.message(noData.arbitrageMessage);
  expect(screen.getAllByText('NotAvailable').length).toBeGreaterThan(0);
  expect(app.socket.sent.map(JSON.parse)).toEqual([
    requests.websocket.initial,
    requests.websocket.navbar,
    requests.websocket.initial,
  ]);
  expect(
    screen.queryByRole('heading', { name: 'Historical' })
  ).not.toBeInTheDocument();
});

test('empty history resolves loading without inventing a no-results banner or discarding stream state', async () => {
  const pending = deferred();
  const app = createApp({
    transport: { history: [{ tickers: ['BTC-USDT'], deferred: pending }] },
  });
  await app.open();
  await app.message(arbitrage);
  userEvent.click(screen.getByRole('link', { name: 'Historical' }));
  await resolveResponse(pending, []);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(
    screen.queryByRole('heading', { name: /Arbitrage Found/ })
  ).not.toBeInTheDocument();
  userEvent.click(screen.getByRole('link', { name: 'All Arbitrage' }));
  expect(await screen.findByText('Alpha-Gamma')).toBeInTheDocument();
});

test('a render-triggered reconnect during history resends the last stream request but keeps consumption paused', async () => {
  const app = createApp({
    transport: { history: [{ tickers: ['BTC-USDT'], data: [] }] },
  });
  await app.open();
  userEvent.click(screen.getByRole('link', { name: 'Historical' }));
  await screen.findByText('ETH-USD', { selector: 'label' });
  await app.serverClose();
  app.rerender();
  await app.open();
  expect(app.socket.sent.map(JSON.parse)).toEqual([requests.websocket.initial]);
  await act(async () => app.socket.rawMessage('still not JSON'));
  expect(
    screen.getByRole('heading', { name: 'Historical' })
  ).toBeInTheDocument();
});
