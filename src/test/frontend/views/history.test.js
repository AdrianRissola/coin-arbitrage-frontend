import React from 'react';
import {
  render,
  screen,
  within,
  waitFor,
  queryAllByAttribute,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { history, seedStorage, tickers } from '../support/ui-fixtures';
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
beforeEach(() => seedStorage());
const headers = (container) =>
  queryAllByAttribute('class', container, 'card-header').map(
    (node) => node.textContent.split('2024')[0]
  );
const tickerCheckbox = (text) =>
  within(
    screen
      .getAllByRole('listitem')
      .find((item) => within(item).queryByText(text, { selector: 'label' }))
  ).getByRole('checkbox');
const ready = () =>
  screen.findByRole('heading', { name: 'Arbitrage Found: 3' });

test('history shows Loading until its controlled response then renders real date-descending cards', async () => {
  const pending = deferred();
  const transport = installTransport({
    history: [{ tickers: ['BTC-USDT'], deferred: pending }],
  });
  localStorage.setItem(
    'historicalArbitrages',
    JSON.stringify([{ stale: true }])
  );
  const { container } = render(<views.HistoricalView />);
  expect(screen.getByRole('status')).toHaveTextContent('Loading...');
  await resolveResponse(pending, history());
  await ready();
  expect(headers(container)).toEqual(['ETH-USD', 'BTC-USD', 'BTC-USDT']);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(
    transport.calls.find((call) => call.kind === 'historical-arbitrages').params
  ).toEqual({ tickers: ['BTC-USDT'] });
});

test('a rejected history request shows an error, clears loading and permits retry', async () => {
  installTransport({ history: [
    { tickers: ['BTC-USDT'], reject: true },
    { tickers: ['BTC-USDT'], data: history() },
  ] });
  render(<views.HistoricalView />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Historical arbitrage service is not available');
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: 'Find' }));
  await ready();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('a later rejected history request removes stale results and recovers', async () => {
  installTransport({ history: [
    { tickers: ['BTC-USDT'], data: history() },
    { tickers: ['BTC-USDT'], reject: true },
    { tickers: ['BTC-USDT'], data: [] },
  ] });
  render(<views.HistoricalView />);
  await ready();
  userEvent.click(screen.getByRole('button', { name: 'Find' }));
  await screen.findByRole('alert');
  expect(screen.queryByRole('heading', { name: /Arbitrage Found/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: 'Find' }));
  await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('an empty array removes loading but does not add a count heading or invented empty message', async () => {
  installTransport({ history: [{ tickers: ['BTC-USDT'], data: [] }] });
  render(<views.HistoricalView />);
  await waitFor(() =>
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  );
  expect(
    screen.queryByRole('heading', { name: /Arbitrage Found/ })
  ).not.toBeInTheDocument();
  expect(screen.queryByText(/No arbitrages available/)).not.toBeInTheDocument();
});

test.each([null, {}, 'invalid'])(
  'a %p response settles into the error state instead of loading forever',
  async (invalid) => {
    const pending = deferred();
    installTransport({ history: [{ tickers: ['BTC-USDT'], deferred: pending }] });
    render(<views.HistoricalView />);
    await resolveResponse(pending, invalid);
    expect(await screen.findByRole('alert')).toHaveTextContent('not available');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  }
);

test('Refine reveals real filters and exact minimum boundaries change observable historical rows', async () => {
  const transport = installTransport({
    history: [{ tickers: ['BTC-USDT'], data: history() }],
  });
  const { container } = render(<views.HistoricalView />);
  await ready();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: 'Refine' }));
  userEvent.type(screen.getByRole('textbox'), 'aLpHa');
  expect(headers(container)).toEqual(['BTC-USD', 'BTC-USDT']);
  userEvent.clear(screen.getByRole('spinbutton'));
  userEvent.type(screen.getByRole('spinbutton'), '36');
  expect(headers(container)).toEqual(['BTC-USDT']);
  userEvent.clear(screen.getByRole('spinbutton'));
  userEvent.type(screen.getByRole('spinbutton'), '36.01');
  expect(
    screen.getByRole('heading', { name: 'Arbitrage Found: 0' })
  ).toBeInTheDocument();
  expect(
    transport.calls.filter((call) => call.kind === 'historical-arbitrages')
  ).toHaveLength(1);
});

test('sort option applies its ordering immediately and the primary button toggles direction', async () => {
  installTransport({ history: [{ tickers: ['BTC-USDT'], data: history() }] });
  const { container } = render(<views.HistoricalView />);
  await ready();
  userEvent.click(screen.getByRole('button', { name: 'Refine' }));
  userEvent.click(screen.getByRole('button', { name: 'Profit %' }));
  expect(
    screen.getByRole('button', { name: 'Order By: Profit % ↑' })
  ).toBeInTheDocument();
  expect(headers(container)).toEqual(['ETH-USD', 'BTC-USDT', 'BTC-USD']);
  userEvent.click(screen.getByRole('button', { name: 'Order By: Profit % ↑' }));
  expect(headers(container)).toEqual(['BTC-USD', 'BTC-USDT', 'ETH-USD']);
  userEvent.click(screen.getByRole('button', { name: 'Order By: Profit % ↓' }));
  expect(headers(container)).toEqual(['ETH-USD', 'BTC-USDT', 'BTC-USD']);
});

test('select-all Find makes the actual null/all-tickers request and resets the loading display', async () => {
  const pending = deferred();
  const transport = installTransport({
    history: [
      { tickers: ['BTC-USDT'], data: history() },
      { tickers: null, deferred: pending },
    ],
  });
  render(<views.HistoricalView />);
  await ready();
  userEvent.click(tickerCheckbox('Select All'));
  userEvent.click(screen.getByRole('button', { name: 'Find' }));
  expect(screen.getByRole('status')).toHaveTextContent('Loading...');
  expect(
    transport.calls.filter((call) => call.kind === 'historical-arbitrages')[1]
  ).toMatchObject({
    uri: 'http://127.0.0.1:1/coin-arbitrage/crypto/historical-arbitrages',
    params: { tickers: null },
  });
  await resolveResponse(pending, []);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

test('a selected subset is requested as actual ticker strings rather than the cached object records', async () => {
  const transport = installTransport({
    history: [
      { tickers: ['BTC-USDT'], data: history() },
      { tickers: ['ETH-USD'], data: [] },
    ],
  });
  render(<views.HistoricalView />);
  await ready();
  userEvent.click(tickerCheckbox('BTC-USDT'));
  userEvent.click(tickerCheckbox('ETH-USD'));
  userEvent.click(screen.getByRole('button', { name: 'Find' }));
  await waitFor(() =>
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  );
  expect(
    transport.calls.filter((call) => call.kind === 'historical-arbitrages')[1]
      .params
  ).toEqual({ tickers: ['ETH-USD'] });
});

test('empty Find selection makes no new request and leaves current rows visible', async () => {
  const transport = installTransport({
    history: [{ tickers: ['BTC-USDT'], data: history() }],
  });
  render(<views.HistoricalView />);
  await ready();
  userEvent.click(tickerCheckbox('Select All'));
  userEvent.click(tickerCheckbox('Select All'));
  userEvent.click(screen.getByRole('button', { name: 'Find' }));
  expect(
    screen.getByRole('heading', { name: 'Arbitrage Found: 3' })
  ).toBeInTheDocument();
  expect(
    transport.calls.filter((call) => call.kind === 'historical-arbitrages')
  ).toHaveLength(1);
});

test('equal counts with different ticker identities do not broaden the request', async () => {
  seedStorage([tickers.find((ticker) => ticker.name === 'ETH-USD')]);
  const transport = installTransport({
    history: [{ tickers: ['BTC-USDT'], data: [] }],
  });
  render(<views.HistoricalView />);
  await waitFor(() =>
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  );
  expect(
    transport.calls.find((call) => call.kind === 'historical-arbitrages').params
  ).toEqual({ tickers: ['BTC-USDT'] });
});

test('cache changes cannot broaden the initial or subsequent explicit selection', async () => {
  seedStorage([tickers.find((ticker) => ticker.name === 'BTC-USDT')]);
  const transport = installTransport({ history: [
    { tickers: ['BTC-USDT'], data: history() },
    { tickers: ['BTC-USDT'], data: [] },
  ] });
  render(<views.HistoricalView />);
  await ready();
  seedStorage([tickers.find((ticker) => ticker.name === 'ETH-USD')]);
  userEvent.click(screen.getByRole('button', { name: 'Find' }));
  await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  expect(transport.calls.filter((call) => call.kind === 'historical-arbitrages').map((call) => call.params))
    .toEqual([{ tickers: ['BTC-USDT'] }, { tickers: ['BTC-USDT'] }]);
});

test('a one-ticker inventory does not turn the default ticker into an implicit ALL request', async () => {
  const available = [tickers.find((ticker) => ticker.name === 'BTC-USDT')];
  seedStorage(available);
  const transport = installTransport({ tickers: [{ data: available }], history: [
    { tickers: ['BTC-USDT'], data: [] }, { tickers: ['BTC-USDT'], data: [] },
  ] });
  render(<views.HistoricalView />);
  await screen.findByText('BTC-USDT', { selector: 'label' });
  await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  userEvent.click(screen.getByRole('button', { name: 'Find' }));
  await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  expect(transport.calls.filter((call) => call.kind === 'historical-arbitrages').map((call) => call.params))
    .toEqual([{ tickers: ['BTC-USDT'] }, { tickers: ['BTC-USDT'] }]);
});

test('a quote preset covering the inventory remains an explicit quote selection, not ALL', async () => {
  const available = tickers.filter((ticker) => ticker.name.endsWith('-USD'));
  seedStorage(available);
  const transport = installTransport({ tickers: [{ data: available }], history: [
    { tickers: ['BTC-USDT'], data: [] }, { tickers: ['BTC-USD', 'ETH-USD'], data: [] },
  ] });
  render(<views.HistoricalView />);
  await screen.findByText('Select All USD', { selector: 'label' });
  userEvent.click(tickerCheckbox('Select All USD'));
  userEvent.click(screen.getByRole('button', { name: 'Find' }));
  await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  expect(transport.calls.filter((call) => call.kind === 'historical-arbitrages')[1].params)
    .toEqual({ tickers: ['BTC-USD', 'ETH-USD'] });
});

test('individual changes after global Select All restore an explicit ticker request', async () => {
  const selected = ['BTC-USD', 'ETH-USD', 'ETH-USDT', 'BTC-USDT'];
  const transport = installTransport({ history: [
    { tickers: ['BTC-USDT'], data: history() }, { tickers: selected, data: [] },
  ] });
  render(<views.HistoricalView />);
  await ready();
  userEvent.click(tickerCheckbox('Select All'));
  userEvent.click(tickerCheckbox('BTC-USDT'));
  userEvent.click(tickerCheckbox('BTC-USDT'));
  userEvent.click(screen.getByRole('button', { name: 'Find' }));
  await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  expect(transport.calls.filter((call) => call.kind === 'historical-arbitrages')[1].params)
    .toEqual({ tickers: selected });
});

test.each([null, '[', '{}', 'null', '"invalid"', '[null]', '[{"name":null}]'])(
  'invalid or missing ticker cache %p does not prevent historical loading',
  async (cached) => {
    if (cached === null) localStorage.removeItem('availableWebsocketTickers');
    else localStorage.setItem('availableWebsocketTickers', cached);
    const transport = installTransport({ history: [{ tickers: ['BTC-USDT'], data: [] }] });
    render(<views.HistoricalView />);
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(transport.calls.find((call) => call.kind === 'historical-arbitrages').params)
      .toEqual({ tickers: ['BTC-USDT'] });
  }
);
