const { waitFor } = require('@testing-library/react');
const { context, fixture, rpc, save, ownSockets } = require('./support');

jest.setTimeout(25000);
const observations = {};
let sockets;
beforeAll(() => {
  sockets = ownSockets();
});
test('real FE Axios/XHR crosses actual routes, models and literal persisted history', async () => {
  const markets = jest.requireActual('../../service/MarketService');
  const history = jest.requireActual('../../service/HistoricalArbitrageService');
  const response = await markets.getMarkets();
  expect(response.request).toBeInstanceOf(window.XMLHttpRequest);
  expect(response.data).toEqual(fixture('markets'));
  expect((await markets.getAllAvailableTickers()).data).toEqual(
    fixture('available-tickers')
  );
  await waitFor(() =>
    expect(JSON.parse(localStorage.getItem('availableWebsocketTickers'))).toEqual(
      fixture('available-tickers')
    )
  );
  expect((await history.getHistoricalArbitrages(['BTC-USDT'])).data).toEqual([
    fixture('historical-arbitrages')[0],
  ]);
  expect(
    (await history.getHistoricalArbitrages(['BTC-USDT', 'ETH-USDT'])).data
  ).toEqual(fixture('historical-arbitrages'));
  expect((await history.getHistoricalArbitrages(null)).data).toEqual(
    fixture('historical-arbitrages')
  );
  expect((await history.getHistoricalArbitrages()).data).toEqual(
    fixture('historical-arbitrages')
  );
  expect((await history.getHistoricalArbitrages(['NO-DATA'])).data).toEqual([]);
  const observed = await rpc('snapshot');
  expect(observed.requests).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        url: '/coin-arbitrage/crypto/historical-arbitrages?tickers[]=BTC-USDT&tickers[]=ETH-USDT',
        method: 'GET',
        origin: context.origin,
        status: 200,
      }),
    ])
  );
  observations.realXhr = true;
  observations.historyNullAndAbsentReturnActualSeededHistory = true;
});
test('native browser-compatible WebSocket receives real welcome and 36 percent calculation', async () => {
  const socket = new window.WebSocket(context.websocketEndpoint);
  const frames = [];
  const waiting = [];
  socket.addEventListener('message', (event) => {
    if (waiting.length) waiting.shift()(event.data);
    else frames.push(event.data);
  });
  const next = () =>
    new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error('INT native frame deadline')),
        6000
      );
      const complete = (raw) => {
        clearTimeout(timeout);
        resolve(JSON.parse(raw));
      };
      if (frames.length) complete(frames.shift());
      else waiting.push(complete);
    });
  try {
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true });
      socket.addEventListener('error', reject, { once: true });
    });
    expect(await next()).toEqual(fixture('ws-welcome'));
    socket.send(JSON.stringify({ channel: 'arbitrage', ticker: 'BTC-USDT' }));
    const response = await next();
    const expected = fixture('ws-arbitrage');
    Object.values(response.arbitrages['BTC-USDT']).forEach((arbitrage) => {
      expect(new Date(arbitrage.date).toISOString()).toBe(arbitrage.date);
      delete arbitrage.date;
    });
    Object.values(expected.arbitrages['BTC-USDT']).forEach((arbitrage) => {
      delete arbitrage.date;
    });
    expect(response).toEqual(expected);
    observations.realWebSocket = true;
    observations.literalProfitPercentage = 36;
  } finally {
    const closed = new Promise((resolve) =>
      socket.addEventListener('close', resolve, { once: true })
    );
    socket.close();
    await closed;
  }
});
afterAll(async () => {
  observations.cleanup = await sockets.close();
  save('transport-observations', observations);
});
