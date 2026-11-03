import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { history, prices, clone, markets } from '../support/ui-fixtures';
import {
  deferred,
  installTransport,
  loadViews,
  resolveResponse,
  expectRenderFailure,
} from '../support/ui-runtime';

let views;
beforeAll(async () => {
  views = await loadViews();
});
const bestProps = () => ({
  bestArbitrage: history().slice(0, 2),
  marketPrices: {
    'BTC-USDT': prices(),
    'BTC-USD': [
      { market: 'Alpha', price: 80 },
      { market: 'Beta', price: 100 },
    ],
    'ETH-USD': [
      { market: 'Gamma', price: 100 },
      { market: 'Beta', price: 50 },
    ],
  },
});

test('best view selects highest percentage and quote controls update real cards and prices', () => {
  const data = bestProps();
  render(<views.BestArbitrageView {...data} />);
  expect(screen.getByText('Best Arbitrage: ETH-USD')).toBeInTheDocument();
  expect(screen.getByText('50% USD')).toBeInTheDocument();
  expect(
    screen.getByRole('columnheader', { name: 'ETH Markets (2)' })
  ).toBeInTheDocument();
  userEvent.click(screen.getByText('USDT', { selector: 'label' }));
  expect(
    screen.getByRole('heading', { name: 'Best USDT Arbitrage' })
  ).toBeInTheDocument();
  expect(screen.getByText('Best Arbitrage: BTC-USDT')).toBeInTheDocument();
  expect(
    screen.getByRole('columnheader', { name: 'BTC Markets (3)' })
  ).toBeInTheDocument();
  userEvent.click(screen.getByText('Best', { selector: 'label' }));
  expect(screen.getByText('Best Arbitrage: ETH-USD')).toBeInTheDocument();
});

test('quote filtering takes the first supplied quote record rather than recalculating its best profit', () => {
  const records = history();
  render(
    <views.BestArbitrageView
      {...bestProps()}
      bestArbitrage={[records[2], records[1], records[0]]}
    />
  );
  expect(screen.getByText('Best Arbitrage: ETH-USD')).toBeInTheDocument();
  userEvent.click(screen.getAllByText('USD', { selector: 'label' })[0]);
  expect(screen.getByText('Best Arbitrage: BTC-USD')).toBeInTheDocument();
  expect(screen.getByText('20% USD')).toBeInTheDocument();
});

test('equal maximum percentages choose the later supplied record', () => {
  const records = history().slice(0, 2);
  records[1].profitPercentage = 36;
  render(<views.BestArbitrageView {...bestProps()} bestArbitrage={records} />);
  expect(screen.getByText('Best Arbitrage: ETH-USD')).toBeInTheDocument();
});

test('empty best data throws before its current no-arbitrages fallback can render', () => {
  expectRenderFailure(
    <views.BestArbitrageView bestArbitrage={[]} marketPrices={{}} />,
    /Reduce of empty array/i
  );
});

test('a selected quote removed by new props keeps its current undefined.transactions failure', () => {
  const data = bestProps();
  const { rerender } = render(<views.BestArbitrageView {...data} />);
  userEvent.click(screen.getByText('USDT', { selector: 'label' }));
  expectRenderFailure(
    () =>
      rerender(
        <views.BestArbitrageView
          {...data}
          bestArbitrage={[data.bestArbitrage[1]]}
        />
      ),
    /transactions/
  );
});

test('status metadata begins at count zero, then renders sorted links and real connection counts', async () => {
  const pending = deferred();
  installTransport({ markets: [{ deferred: pending }] });
  render(
    <views.MarketStatusView
      marketStatus={{
        connectedMarkets: ['alpha.invalid'],
        disconnectedMarkets: ['beta.invalid - test close'],
      }}
    />
  );
  expect(
    screen.getByRole('columnheader', { name: 'Market (0)' })
  ).toBeInTheDocument();
  expect(screen.getByText(/Connected: 1/)).toHaveTextContent('Disconnected: 1');
  await resolveResponse(pending, clone(markets).reverse());
  expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual([
    'Alpha',
    'Beta',
    'Gamma',
  ]);
  expect(screen.getByRole('link', { name: 'Alpha' })).toHaveAttribute(
    'href',
    'https://alpha.invalid/'
  );
  expect(screen.getByRole('link', { name: 'Alpha' })).toHaveAttribute(
    'rel',
    'noopener noreferrer'
  );
});

test('market metadata expansion changes the existing row button and clipping styles', async () => {
  installTransport();
  render(<views.MarketStatusView darkMode />);
  await screen.findByRole('link', { name: 'Alpha' });
  const row = screen
    .getAllByRole('row')
    .find((candidate) =>
      within(candidate).queryByRole('link', { name: 'Alpha' })
    );
  const clipped = within(row).getByText('BTC-USDT,BTC-USD,ETH-USDT,ETH-USD');
  expect(clipped).toHaveStyle({ height: '1.2rem', overflow: 'hidden' });
  userEvent.click(within(row).getByRole('button', { name: '+' }));
  expect(within(row).getByRole('button', { name: '-' })).toBeInTheDocument();
  expect(clipped).not.toHaveStyle({ height: '1.2rem' });
  userEvent.click(within(row).getByRole('button', { name: '-' }));
  expect(clipped).toHaveStyle({ height: '1.2rem' });
});

test('empty market metadata retains zero rows and default zero connection counts without a spinner', async () => {
  const pending = deferred();
  installTransport({ markets: [{ deferred: pending }] });
  render(<views.MarketStatusView />);
  await resolveResponse(pending, []);
  expect(
    screen.getByRole('columnheader', { name: 'Market (0)' })
  ).toBeInTheDocument();
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  expect(screen.getByText(/Connected: 0/)).toHaveTextContent('Disconnected: 0');
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
