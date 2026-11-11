const tickers = require('../../fixtures/contracts/v1/available-tickers.json');
const markets = require('../../fixtures/contracts/v1/markets.json');
const arbitrages = require('../../fixtures/contracts/v1/arbitrages.json');
const clone = (value) => JSON.parse(JSON.stringify(value));
const prices = () => [
  { market: 'Gamma', bid: 124.5, ask: 125.5, price: 125 },
  { market: 'Alpha', bid: 79.5, ask: 80.5, price: 80 },
  { market: 'Beta', bid: 99.5, ask: 100.5, price: 100, connected: false },
];
const opportunity = () => clone(arbitrages[0]);
const pairMap = () => ({
  'Alpha-Gamma': clone(arbitrages[0]),
  'Beta-Gamma': clone(arbitrages[1]),
  'Alpha-Beta': clone(arbitrages[2]),
});
const history = () => [
  { ...opportunity(), _id: 'old', date: '2024-01-01T03:04:05.000Z' },
  {
    _id: 'new',
    transactions: [
      { type: 'BUY', market: 'Beta', pair: 'ETH-USD', price: 50 },
      { type: 'SELL', market: 'Gamma', pair: 'ETH-USD', price: 100 },
    ],
    profitPerUnit: 50,
    profitPercentage: 50,
    date: '2024-01-03T03:04:05.000Z',
  },
  {
    _id: 'middle',
    transactions: [
      { type: 'BUY', market: 'Alpha', pair: 'BTC-USD', price: 80 },
      { type: 'SELL', market: 'Beta', pair: 'BTC-USD', price: 100 },
    ],
    profitPerUnit: 20,
    profitPercentage: 20,
    date: '2024-01-02T03:04:05.000Z',
  },
];
const seedStorage = (data = tickers) => {
  localStorage.setItem('availableWebsocketTickers', JSON.stringify(data));
  localStorage.setItem('availableWebsocketQuoteCurrencies', '["USD","USDT"]');
};

module.exports = {
  tickers,
  markets,
  clone,
  prices,
  opportunity,
  pairMap,
  history,
  seedStorage,
};
