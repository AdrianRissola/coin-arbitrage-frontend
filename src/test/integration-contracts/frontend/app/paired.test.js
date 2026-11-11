const React = require('react');
const { render, screen, waitFor, within, queryAllByAttribute } = require('@testing-library/react');
const userEvent = require('@testing-library/user-event').default;
const { installNativeUi } = require('../../ui');
const { fixture, rpc, save } = require('../../support');

jest.setTimeout(60000);
test('actual App and real views consume the selected owned paired flow increment', async () => {
  const ui = installNativeUi();
  const observations = { completed: [] };
  let testFailure;
  try {
    const { selectedFlows } = await rpc('status');
    const runSelectedFlow = async (name, execute) => {
      if (selectedFlows.includes(name)) await execute();
    };
    const App = jest.requireActual('../../../../App').default;
    const { SnackbarProvider } = jest.requireActual('notistack');
    const { container } = render(
      <SnackbarProvider maxSnack={3}>
        <App />
      </SnackbarProvider>
    );
    await screen.findByRole(
      'heading',
      { name: 'BTC-USDT Arbitrage' },
      { timeout: 6000 }
    );
    expect(await screen.findByText('Alpha-Gamma')).toBeInTheDocument();
    expect(screen.getAllByText('56.3% USDT')).toHaveLength(2);
    expect(screen.getByRole('columnheader', { name: 'BTC Markets (3)' })).toBeInTheDocument();
    expect(ui.sockets).toHaveLength(1);
    const socket = ui.sockets[0];
    expect(socket.sent.map(JSON.parse)[0]).toEqual(
      fixture('requests').websocket.initial
    );
    expect(socket.received.map(JSON.parse)[0]).toEqual(fixture('ws-welcome'));
    observations.completed.push('arbitrage');
    await runSelectedFlow('historical', async () => {
      const requestStart = (await rpc('snapshot')).requests.length;
      const sentBeforePause = socket.sent.length;
      const receivedBeforePause = socket.received.length;
      userEvent.click(screen.getByRole('link', { name: 'Historical' }));
      await screen.findByRole('heading', { name: 'Historical' });
      await screen.findByRole('heading', { name: 'Arbitrage Found: 1' }, { timeout: 6000 });
      const checkbox = (label) => within(
        screen.getAllByRole('listitem').find(item => within(item).queryByText(label, { selector: 'label' }))
      ).getByRole('checkbox');
      await waitFor(() => expect(checkbox('ETH-USDT')).toBeInTheDocument(), { timeout: 6000 });
      userEvent.click(checkbox('ETH-USDT'));
      userEvent.click(screen.getByRole('button', { name: 'Find' }));
      await screen.findByRole('heading', { name: 'Arbitrage Found: 2' }, { timeout: 6000 });
      expect(queryAllByAttribute('class', container, 'card-header').map(node => node.textContent.split('2024')[0])).toEqual(['BTC-USDT', 'ETH-USDT']);
      const subset = (await rpc('snapshot')).requests.slice(requestStart).find(request =>
        request.url === fixture('requests').rest.find(request => request.name === 'historyMultiple').path
      );
      expect(JSON.parse(subset.rawBody)).toEqual(fixture('historical-arbitrages'));
      userEvent.click(checkbox('Select All'));
      userEvent.click(screen.getByRole('button', { name: 'Find' }));
      await screen.findByRole('heading', { name: 'Arbitrage Found: 2' }, { timeout: 6000 });
      const all = (await rpc('snapshot')).requests.at(-1);
      expect(all.url).toBe('/coin-arbitrage/crypto/historical-arbitrages');
      expect(JSON.parse(all.rawBody)).toEqual(fixture('historical-arbitrages'));
      userEvent.click(checkbox('Select All'));
      userEvent.click(checkbox('BTC-USD'));
      userEvent.click(screen.getByRole('button', { name: 'Find' }));
      await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument(), { timeout: 6000 });
      expect(screen.queryByRole('heading', { name: /Arbitrage Found/ })).not.toBeInTheDocument();
      expect(screen.queryByText('No arbitrages available')).not.toBeInTheDocument();
      const empty = (await rpc('snapshot')).requests.at(-1);
      expect(empty.url).toBe('/coin-arbitrage/crypto/historical-arbitrages?tickers[]=BTC-USD');
      expect(JSON.parse(empty.rawBody)).toEqual([]);
      await waitFor(() => expect(socket.received.length).toBeGreaterThan(receivedBeforePause), { timeout: 6000 });
      expect(socket.sent).toHaveLength(sentBeforePause);
      expect(screen.getByRole('heading', { name: 'Historical' })).toBeInTheDocument();
      observations.history = { subset: subset.url, all: all.url, empty: empty.url, nativeFramesWhilePaused: socket.received.length - receivedBeforePause };
      observations.completed.push('historical');
    });
    userEvent.click(screen.getByRole('link', { name: 'All Arbitrage' }));
    await waitFor(
      () =>
        expect(socket.received.map(JSON.parse)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              channel: 'arbitrage',
              ticker: 'btc-usdt',
            }),
          ])
        ),
      { timeout: 6000 }
    );
    expect(socket.sent.map(JSON.parse)).toContainEqual(
      fixture('requests').websocket.navbar
    );
    expect(screen.getAllByText('56.3% USDT')).toHaveLength(2);
    await runSelectedFlow('ticker', async () => {
      socket.holdTicker = 'btc-usdt';
      await waitFor(() => expect(socket.held.length).toBeGreaterThan(0), {
        timeout: 6000,
      });
      userEvent.click(await screen.findByText('ETH', { selector: 'label' }));
      userEvent.click(await screen.findByText('ETH-USD', { selector: 'label' }));
      await screen.findByRole(
        'heading',
        { name: 'ETH-USD Arbitrage' },
        { timeout: 6000 }
      );
      expect(screen.getAllByText('60% USD')).toHaveLength(2);
      expect(socket.sent.map(JSON.parse)).toContainEqual({
        channel: 'arbitrage',
        ticker: 'ETH-USD',
      });
      const released = socket.releaseGenuineHeldEvents();
      expect(released.length).toBeGreaterThan(0);
      expect(screen.getByRole('heading', { name: 'ETH-USD Arbitrage' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'BTC-USDT Arbitrage' })).not.toBeInTheDocument();
      expect(screen.getAllByText('60% USD')).toHaveLength(2);
      observations.staleDelivery = {
        source: 'unchanged genuine native MessageEvent delayed until selected-pair UI update',
        released: released.map(JSON.parse),
      };
      observations.completed.push('ticker');
    });
    await runSelectedFlow('best', async () => {
      userEvent.click(screen.getByRole('link', { name: 'Best Arbitrage' }));
      await screen.findByText('Best Arbitrage: ETH-USD', {}, { timeout: 6000 });
      expect(screen.getByText('60% USD')).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'ETH Markets (3)' })).toBeInTheDocument();
      expect(socket.sent.map(JSON.parse)).toContainEqual(
        fixture('requests').websocket.best
      );
      const best = socket.received.map(JSON.parse).find(frame => frame.channel === 'bestArbitrage');
      expect(best.ticker).toBe('ALL');
      const stable = frame => ({
        ...frame,
        bestArbitrages: {
          ...frame.bestArbitrages,
          arbitragesData: frame.bestArbitrages.arbitragesData.map(({ arbitrage: { date, ...arbitrage }, ...rest }) => {
            expect(new Date(date).toISOString()).toBe(date);
            return { ...rest, arbitrage };
          }),
        },
      });
      expect(stable(best)).toEqual(stable(fixture('ws-best-arbitrage')));
      userEvent.click(screen.getByText('USDT', { selector: 'label' }));
      expect(screen.getByRole('heading', { name: 'Best USDT Arbitrage' })).toBeInTheDocument();
      expect(screen.getByText('Best Arbitrage: BTC-USDT')).toBeInTheDocument();
      expect(screen.getByText('56.3% USDT')).toBeInTheDocument();
      observations.completed.push('best');
    });
    await runSelectedFlow('markets', async () => {
      userEvent.click(screen.getByRole('link', { name: 'Markets' }));
      await screen.findByRole('heading', { name: 'Markets' }, { timeout: 6000 });
      await screen.findByRole('columnheader', { name: 'Market (3)' }, { timeout: 6000 });
      expect(screen.getByRole('link', { name: 'Alpha' })).toHaveAttribute('href', fixture('markets')[0].website);
      await waitFor(() => expect(screen.getByText(/Connected: 3/)).toHaveTextContent('Disconnected: 0'), { timeout: 6000 });
      expect(socket.sent.map(JSON.parse)).toContainEqual(fixture('requests').websocket.markets);
      expect(await rpc('disconnect', { host: 'gamma.invalid' })).toEqual({ closed: 'gamma.invalid' });
      await waitFor(() => expect(screen.getByText(/Connected: 2/)).toHaveTextContent('Disconnected: 1'), { timeout: 6000 });
      const marketFrame = socket.received.map(JSON.parse).filter(frame => frame.channel === 'markets').at(-1);
      expect(marketFrame).toEqual(fixture('ws-markets'));
      expect(screen.getByText('gamma.invalid - synthetic disconnect')).toBeInTheDocument();
      observations.completed.push('markets');
    });
    await runSelectedFlow('error', async () => {
      if (!screen.queryByRole('heading', { name: 'BTC-USDT Arbitrage' }))
        userEvent.click(screen.getByRole('link', { name: 'All Arbitrage' }));
      await screen.findByRole('heading', { name: 'BTC-USDT Arbitrage' }, { timeout: 6000 });
      const beforeFinalSubscription = socket.received.length;
      userEvent.click(await screen.findByText('BTC-USDT', { selector: 'label' }));
      await waitFor(() => expect(JSON.parse(socket.sent.at(-1))).toEqual({ channel: 'arbitrage', ticker: 'BTC-USDT' }), { timeout: 6000 });
      await waitFor(() => expect(socket.received.slice(beforeFinalSubscription).map(JSON.parse)).toEqual(expect.arrayContaining([
        expect.objectContaining({ channel: 'arbitrage', ticker: 'BTC-USDT', arbitrages: expect.any(Object) }),
      ])), { timeout: 6000 });
      await rpc('disconnect', { host: 'alpha.invalid' });
      await rpc('disconnect', { host: 'beta.invalid' });
      await rpc('disconnect', { host: 'gamma.invalid' });
      await screen.findByText('Arbitrage not available for: BTC-USDT', {}, { timeout: 6000 });
      await screen.findByRole('columnheader', { name: 'BTC Markets (0)' }, { timeout: 6000 });
      const noData = socket.received.map(JSON.parse).find(frame => frame.channel === 'arbitrage' && frame.ticker === 'BTC-USDT' && frame.arbitrages === null && frame.marketPrices['BTC-USDT'].length === 0);
      expect(noData).toEqual(fixture('no-data').arbitrageMessage);
      await rpc('close-browser');
      await waitFor(() => expect(socket.readyState).toBe(socket.CLOSED), { timeout: 6000 });
      expect(ui.sockets).toHaveLength(1);
      expect(screen.getByText('Arbitrage not available for: BTC-USDT')).toBeInTheDocument();
      observations.completed.push('error');
    });
    const persisted = (await rpc('snapshot')).history;
    expect(persisted.length).toBeGreaterThanOrEqual(2);
    persisted.forEach(record => {
      expect(record._id).toMatch(/^[a-f0-9]{24}$/);
      expect(new Date(record.date).toISOString()).toBe(record.date);
      expect(record.__v).toBe(0);
      expect(Number.isFinite(record.profitPercentage)).toBe(true);
      expect(Number.isFinite(record.profitPerUnit)).toBe(true);
      expect(record.transactions.map(transaction => transaction.type)).toEqual(['BUY', 'SELL']);
      record.transactions.forEach(transaction => expect(Number.isFinite(transaction.price)).toBe(true));
    });
    observations.persistedFormats = {
      documents: persisted.length,
      generatedDocuments: persisted.filter(record => !fixture('historical-arbitrages').some(seed => seed._id === record._id)).length,
      objectIdsAndIsoDatesVerified: true,
    };
  } catch (error) {
    testFailure = error;
    throw error;
  } finally {
    try {
      observations.cleanup = await ui.close();
    } catch (error) {
      observations.cleanupError = error.message;
      if (!testFailure) throw error;
    } finally {
      save('app-observations', observations);
    }
  }
});
