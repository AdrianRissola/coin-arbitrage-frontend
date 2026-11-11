import React from 'react';
import {
  render,
  screen,
  within,
  queryAllByAttribute,
} from '@testing-library/react';
import MarketsArbitrage from '../../../components/MarketsArbitrage';
import ArbitrageList from '../../../components/ArbitrageList';
import helper from '../../../helper';
import { pairMap, history } from '../support/ui-fixtures';
import { expectRenderFailure } from '../support/ui-runtime';

const headers = (container) =>
  queryAllByAttribute('class', container, 'card-header').map(
    (node) => node.textContent
  );
const listProps = () => ({ arbitrages: history(), withHeader: true });

test('market pair cards sort keys while the unconditional best card uses insertion order', () => {
  const { container } = render(<MarketsArbitrage arbitrages={pairMap()} />);
  expect(headers(container)).toEqual([
    'Best Arbitrage',
    'Alpha-Beta',
    'Alpha-Gamma',
    'Beta-Gamma',
  ]);
  expect(
    within(screen.getAllByRole('table')[0]).getByText('36% USDT')
  ).toBeInTheDocument();
});

test('best card is not recalculated from the highest percentage in a supplied map', () => {
  const data = pairMap();
  render(
    <MarketsArbitrage
      arbitrages={{
        'Beta-Gamma': data['Beta-Gamma'],
        'Alpha-Gamma': data['Alpha-Gamma'],
      }}
      marketFilter="missing"
    />
  );
  expect(screen.getAllByRole('table')).toHaveLength(1);
  expect(screen.getByText('20% USDT')).toBeInTheDocument();
});

test.each([
  [{ marketFilter: 'bEtA' }, ['Best Arbitrage', 'Alpha-Beta', 'Beta-Gamma']],
  [{ marketsFilter: ['Alpha', 'Gamma'] }, ['Best Arbitrage', 'Alpha-Gamma']],
  [{ marketsFilter: [] }, ['Best Arbitrage']],
  [
    { minProfitFilter: 20 },
    ['Best Arbitrage', 'Alpha-Beta', 'Alpha-Gamma', 'Beta-Gamma'],
  ],
  [{ minProfitFilter: '20.01' }, ['Best Arbitrage', 'Alpha-Gamma']],
  [{ minProfitFilter: 100 }, ['Best Arbitrage']],
])(
  'market filter combination %j preserves best-card bypass and pair inclusion',
  (filters, expected) => {
    const { container } = render(
      <MarketsArbitrage arbitrages={pairMap()} {...filters} />
    );
    expect(headers(container)).toEqual(expected);
  }
);

test('the real unavailable helper becomes a non-profitable message card rather than invented error UI', () => {
  const { container } = render(
    <MarketsArbitrage
      arbitrages={helper.arbitrageNotAvailable('BTC-USDT')}
      marketsFilter={[]}
    />
  );
  expect(headers(container)).toEqual(['Arbitrage not available for: BTC-USDT']);
  expect(screen.getAllByText('Non Profitable')).toHaveLength(1);
});

test.each([null, {}])(
  'missing/empty market map %p retains its existing render failure',
  (data) => {
    expectRenderFailure(
      <MarketsArbitrage arbitrages={data} />,
      /arbitrage_not_available|transactions/
    );
  }
);

test.each([
  [
    { marketFilter: 'aLpHa' },
    ['BTC-USDT2024-01-01 03:04:05', 'BTC-USD2024-01-02 03:04:05'],
  ],
  [{ marketsFilter: ['Alpha', 'Beta'] }, ['BTC-USD2024-01-02 03:04:05']],
  [{ marketsFilter: [] }, []],
  [
    { minProfitFilter: '36' },
    ['BTC-USDT2024-01-01 03:04:05', 'ETH-USD2024-01-03 03:04:05'],
  ],
  [{ tickerFilter: 'btc-usdt' }, ['BTC-USDT2024-01-01 03:04:05']],
  [
    { tickerFilter: 'all' },
    [
      'BTC-USDT2024-01-01 03:04:05',
      'ETH-USD2024-01-03 03:04:05',
      'BTC-USD2024-01-02 03:04:05',
    ],
  ],
])(
  'list filters %j count only currently included real cards',
  (filters, expected) => {
    const { container } = render(
      <ArbitrageList {...listProps()} {...filters} />
    );
    expect(headers(container)).toEqual(expected);
    expect(
      screen.getByRole('heading', {
        name: `Arbitrage Found: ${expected.length}`,
      })
    ).toBeInTheDocument();
  }
);

test.each([
  ['date', 'DESC', ['ETH-USD', 'BTC-USD', 'BTC-USDT']],
  ['date', 'ASC', ['BTC-USDT', 'BTC-USD', 'ETH-USD']],
  ['profitPercentage', 'DESC', ['ETH-USD', 'BTC-USDT', 'BTC-USD']],
  ['profitPercentage', 'ASC', ['BTC-USD', 'BTC-USDT', 'ETH-USD']],
])(
  'list %s %s ordering is visible in the rendered card sequence',
  (key, value, expected) => {
    const { container } = render(
      <ArbitrageList {...listProps()} orderBy={{ key, value }} />
    );
    expect(
      headers(container).map((heading) => heading.split('2024')[0])
    ).toEqual(expected);
  }
);

test('empty arrays retain the count heading rather than a synthetic loading/error state', () => {
  render(<ArbitrageList arbitrages={[]} withHeader />);
  expect(
    screen.getByRole('heading', { name: 'Arbitrage Found: 0' })
  ).toBeInTheDocument();
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
});

test('withHeader false currently returns raw objects and retains React child failure', () => {
  expectRenderFailure(
    <ArbitrageList arbitrages={history()} withHeader={false} />,
    /Objects are not valid as a React child/
  );
});

test('a null historical date keeps its native slice failure rather than adding a fallback', () => {
  expectRenderFailure(
    <ArbitrageList arbitrages={[{ ...history()[0], date: null }]} withHeader />,
    /slice/
  );
});
