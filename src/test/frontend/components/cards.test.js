import React from 'react';
import {
  render,
  screen,
  within,
  queryAllByAttribute,
} from '@testing-library/react';
import Arbitrage from '../../../components/Arbitrage';
import MiniCard from '../../../components/ArbitrageMiniCard';
import { opportunity } from '../support/ui-fixtures';
import { expectRenderFailure } from '../support/ui-runtime';

let language;
beforeEach(() => {
  language = jest.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');
});
afterEach(() => language.mockRestore());

test('the real arbitrage card displays the independent literal percentage', () => {
  render(<Arbitrage header="BTC-USDT" arbitrage={opportunity()} />);
  expect(screen.getByText('36% USDT')).toBeInTheDocument();
});

test('full card exposes BUY/SELL fields, literal unit profit and supplied secondary heading', () => {
  render(
    <Arbitrage
      header="BTC-USDT"
      header2="2024-01-02 03:04:05"
      arbitrage={opportunity()}
    />
  );
  expect(screen.getAllByRole('table')[0]).toHaveStyle({
    tableLayout: 'fixed',
    width: '100%',
  });
  const rows = within(screen.getByRole('table')).getAllByRole('row');
  expect(
    rows.slice(2, 4).map((row) =>
      within(row)
        .getAllByRole('cell')
        .map((cell) => cell.textContent)
    )
  ).toEqual([
    ['BUY', 'Alpha', '80 · ask'],
    ['SELL', 'Gamma', '125 · bid'],
  ]);
  expect(screen.getByTitle('Ask')).toBeInTheDocument();
  expect(screen.getByTitle('Bid')).toBeInTheDocument();
  expect(screen.getByText(/computed .* ago/)).toBeInTheDocument();
  expect(screen.getByText('2024-01-02 03:04:05')).toBeInTheDocument();
});

test('long exchange names stay on one line in the card market column', () => {
  const data = opportunity();
  data.transactions[0].market = 'Crypto.com';
  render(<Arbitrage header="BTC-USDT" arbitrage={data} />);
  expect(screen.getByText('Crypto.com')).toHaveStyle({
    whiteSpace: 'nowrap',
    fontSize: '0.95rem',
  });
});

test('real significant-digit rounding retains raw numeric titles', () => {
  const data = opportunity();
  data.transactions[0].price = 1234567.89;
  data.transactions[1].price = 0.000123456789;
  data.profitPercentage = 12.345678;
  data.profitPerUnit = 12345.6789;
  render(<Arbitrage header="Literal" arbitrage={data} />);
  expect([
    screen.getByTitle('Ask').textContent,
    screen.getByTitle('Bid').textContent,
    screen.getByText('12.3% USDT').textContent,
  ]).toEqual(['1,234,568 · ask', '0.0001234568 · bid', '12.3% USDT']);
});

test('locale is taken from navigator instead of a hard-coded English formatter', () => {
  language.mockReturnValue('de-DE');
  const data = opportunity();
  data.transactions[0].price = 1234.5;
  data.profitPercentage = 12.34;
  render(<Arbitrage header="Locale" arbitrage={data} />);
  expect([
    screen.getByTitle('Ask').textContent,
    screen.getByText('12,3% USDT').textContent,
  ]).toEqual(['1.234,5 · ask', '12,3% USDT']);
});

test('numeric zero profits show the full-card non-profitable row', () => {
  const data = { ...opportunity(), profitPercentage: 0 };
  render(<Arbitrage header="Zero" arbitrage={data} />);
  expect(screen.getAllByText('Non Profitable')).toHaveLength(1);
  expect(screen.queryByText('Profit:')).not.toBeInTheDocument();
});

test('strict zero checks do not rewrite string zero or negative profit values', () => {
  const data = { ...opportunity(), profitPercentage: '0', profitPerUnit: -2 };
  render(<Arbitrage header="Literal" arbitrage={data} />);
  expect(screen.getByText('0% USDT').textContent).toEqual('0% USDT');
  expect(screen.queryByText('Non Profitable')).not.toBeInTheDocument();
});

test('best-header matching is case-insensitive and dark presentation retains real styling', () => {
  const { container } = render(
    <Arbitrage
      header="BEST ARBITRAGE: BTC-USDT"
      darkMode
      arbitrage={opportunity()}
    />
  );
  expect(screen.getByRole('table')).toHaveStyle({ color: 'white' });
  expect(
    queryAllByAttribute('class', container, 'card text-white bg-dark mb-3')[0]
  ).toHaveStyle({ borderRadius: '40px' });
});

test('mini card renders its own operation layout and omits the full unit-profit row', () => {
  render(
    <MiniCard header="Mini" header2="Secondary" arbitrage={opportunity()} />
  );
  expect(screen.getByRole('table')).toHaveStyle({
    tableLayout: 'fixed',
    width: '100%',
  });
  expect([
    screen.getByText('BUY - Alpha').textContent,
    screen.getByText('SELL - Gamma').textContent,
  ]).toEqual(['BUY - Alpha', 'SELL - Gamma']);
  expect(screen.getByText('36% USDT')).toBeInTheDocument();
  expect(screen.queryByText('Profit / BTC:')).not.toBeInTheDocument();
});

test('mini numeric zero produces one non-profitable label', () => {
  render(
    <MiniCard
      header="Best Arbitrage"
      darkMode
      arbitrage={{ ...opportunity(), profitPercentage: 0 }}
    />
  );
  expect(screen.getAllByText('Non Profitable')).toHaveLength(1);
});

test.each([
  ['missing record', undefined, /transactions/],
  ['empty transactions', { transactions: [] }, /pair/],
  [
    'missing numeric price',
    {
      ...opportunity(),
      transactions: [
        { type: 'BUY', market: 'Alpha', pair: 'BTC-USDT' },
        opportunity().transactions[1],
      ],
    },
    /toLocaleString/,
  ],
])(
  'full card retains its local render failure for %s',
  (name, data, message) => {
    expectRenderFailure(
      <Arbitrage header="Malformed" arbitrage={data} />,
      message
    );
  }
);
