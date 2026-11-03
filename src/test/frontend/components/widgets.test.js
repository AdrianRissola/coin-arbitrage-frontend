import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MarketFilter from '../../../components/filters/MarketFilter';
import MinProfitFilter from '../../../components/filters/MinProfitFilter';
import ComboBox from '../../../components/filters/ComboBoxFilter';
import TickerComboBox from '../../../components/filters/TickerComboBoxFilter';
import TickerButtons from '../../../components/TickerButtons';
import { clone, tickers } from '../support/ui-fixtures';
import '../support/ui-runtime';

test('market text input remains controlled and emits typed strings without changing case', () => {
  const changed = jest.fn();
  const Harness = () => {
    const [value, setValue] = useState('');
    return (
      <MarketFilter
        marketFilter={value}
        marketFilterSetFunction={(next) => {
          setValue(next);
          changed(next);
        }}
      />
    );
  };
  render(<Harness />);
  userEvent.type(screen.getByRole('textbox'), 'aLpHa');
  expect(screen.getByRole('textbox')).toHaveValue('aLpHa');
  expect(changed).toHaveBeenLastCalledWith('aLpHa');
});

test('minimum profit keeps native number attributes but emits strings including an empty clear', () => {
  const changed = jest.fn();
  const Harness = () => {
    const [value, setValue] = useState(0);
    return (
      <MinProfitFilter
        darkMode
        minProfitFilter={value}
        minProfitFilterSetFunction={(next) => {
          setValue(next);
          changed(next);
        }}
      />
    );
  };
  render(<Harness />);
  const field = screen.getByRole('spinbutton');
  userEvent.clear(field);
  expect(changed).toHaveBeenLastCalledWith('');
  userEvent.type(field, '0.01');
  expect([
    field.getAttribute('min'),
    field.getAttribute('step'),
    field.value,
  ]).toEqual(['0', '0.01', '0.01']);
  expect(changed).toHaveBeenLastCalledWith('0.01');
});

test('generic combo selection changes its label and keeps local selection across a changed prop', () => {
  const selected = jest.fn();
  const { rerender } = render(
    <ComboBox
      buttonText="Order"
      currentSelection="Date"
      options={['Date', 'Profit']}
      onClickFunction={selected}
    />
  );
  userEvent.click(screen.getByRole('button', { name: 'Profit' }));
  expect(selected).toHaveBeenCalledWith('Profit');
  expect(
    screen.getByRole('button', { name: 'Order Profit' })
  ).toBeInTheDocument();
  rerender(
    <ComboBox
      buttonText="Order"
      currentSelection="Date"
      options={['Date', 'Profit']}
      onClickFunction={selected}
    />
  );
  expect(
    screen.getByRole('button', { name: 'Order Profit' })
  ).toBeInTheDocument();
});

test('ticker combo defaults to ALL and emits the selected literal ticker', () => {
  const selected = jest.fn();
  render(
    <TickerComboBox
      tickers={['ALL', 'BTC-USDT']}
      onClickFunction={selected}
      darkMode
    />
  );
  expect(
    screen.getByRole('button', { name: 'Ticker: ALL' })
  ).toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: 'BTC-USDT' }));
  expect(selected).toHaveBeenCalledWith('BTC-USDT');
  expect(
    screen.getByRole('button', { name: 'Ticker: BTC-USDT' })
  ).toBeInTheDocument();
});

test('ticker buttons sort their visible labels, default BTC-USDT and emit the actual subscription object', () => {
  const selected = jest.fn();
  render(
    <TickerButtons
      tickers={clone(tickers).reverse()}
      handleChangeChannelSubscriptionClick={selected}
      darkMode
    />
  );
  expect(screen.getAllByRole('radio').map((radio) => radio.id)).toEqual([
    'BTC-USD',
    'BTC-USDT',
    'ETH-USD',
    'ETH-USDT',
  ]);
  expect(screen.getByRole('radio', { name: 'Bitcoin - Tether' })).toBeChecked();
  userEvent.click(screen.getByRole('radio', { name: 'Ethereum - US Dollar' }));
  expect(selected).toHaveBeenCalledWith({
    channel: 'arbitrage',
    ticker: 'ETH-USD',
  });
  expect(
    screen.getByRole('radio', { name: 'Ethereum - US Dollar' })
  ).toBeChecked();
});

test('ticker buttons render no invented option for an empty input', () => {
  render(
    <TickerButtons
      tickers={[]}
      handleChangeChannelSubscriptionClick={jest.fn()}
    />
  );
  expect(screen.queryByRole('radio')).not.toBeInTheDocument();
});
