import React, { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MarketsArbitrage from '../../../components/MarketsArbitrage';
import { pairMap } from '../support/ui-fixtures';
import { installTransport, loadViews } from '../support/ui-runtime';

let views;
beforeAll(async () => {
  views = await loadViews();
});
const checkbox = (label) =>
  within(
    screen
      .getAllByRole('listitem')
      .find((item) => within(item).queryByText(label, { selector: 'label' }))
  ).getByRole('checkbox');
const MarketHarness = () => {
  const [selected, setSelected] = useState([]);
  return (
    <>
      <views.MarketsFilter
        buttonText="Markets"
        marketsFilter={selected}
        onClickFunction={setSelected}
      />
      <MarketsArbitrage arbitrages={pairMap()} marketsFilter={selected} />
    </>
  );
};

test('market metadata preselects sorted names; a subset filters real child cards', async () => {
  installTransport();
  render(<MarketHarness />);
  await screen.findByText('Alpha-Gamma');
  expect(
    screen
      .getAllByText(/^(Alpha|Beta|Gamma)$/, { selector: 'label' })
      .map((label) => label.textContent)
  ).toEqual(['Alpha', 'Beta', 'Gamma']);
  userEvent.click(checkbox('Beta'));
  expect(screen.getAllByRole('table')).toHaveLength(2);
  expect(screen.getByText('Alpha-Gamma')).toBeInTheDocument();
  expect(checkbox('Select All')).not.toBeChecked();
  userEvent.click(checkbox('Beta'));
  expect(screen.getAllByRole('table')).toHaveLength(4);
  expect(checkbox('Select All')).toBeChecked();
});

test('market select-all off hides pair cards but not the unconditional best card', async () => {
  installTransport();
  render(<MarketHarness />);
  await screen.findByText('Alpha-Gamma');
  userEvent.click(checkbox('Select All'));
  expect(screen.getAllByRole('table')).toHaveLength(1);
  expect(screen.getByText('Best Arbitrage')).toBeInTheDocument();
  userEvent.click(checkbox('Alpha'));
  userEvent.click(checkbox('Gamma'));
  expect(screen.getAllByRole('table')).toHaveLength(2);
  expect(checkbox('Select All')).not.toBeChecked();
});

test('a market text label toggles its own checkbox, not the first market', async () => {
  installTransport();
  render(<MarketHarness />);
  await screen.findByText('Alpha-Gamma');
  userEvent.click(screen.getByText('Beta', { selector: 'label' }));
  expect(checkbox('Beta')).not.toBeChecked();
  expect(checkbox('Alpha')).toBeChecked();
  expect(screen.getAllByRole('table')).toHaveLength(2);
});

test('selecting all markets again restores all rendered pairs', async () => {
  installTransport();
  render(<MarketHarness />);
  await screen.findByText('Alpha-Gamma');
  userEvent.click(checkbox('Select All'));
  userEvent.click(checkbox('Select All'));
  expect(screen.getAllByRole('table')).toHaveLength(4);
  expect(screen.getAllByRole('checkbox').every((input) => input.checked)).toBe(
    true
  );
});

const mountTickerChoices = async () => {
  const selected = jest.fn();
  render(
    <views.TickersFilter
      buttonText="Tickers"
      handleOnClickFindButton={selected}
    />
  );
  await screen.findByText('ETH-USD', { selector: 'label' });
  return selected;
};

test('ticker selection begins at BTC-USDT and Find sends individual additions in selection order', async () => {
  installTransport();
  const selected = await mountTickerChoices();
  userEvent.click(screen.getByRole('button', { name: 'Find' }));
  expect(selected).toHaveBeenLastCalledWith(['BTC-USDT']);
  userEvent.click(checkbox('ETH-USD'));
  userEvent.click(screen.getByRole('button', { name: 'Find' }));
  expect(selected).toHaveBeenLastCalledWith(['BTC-USDT', 'ETH-USD']);
  expect(screen.getByRole('button', { name: 'Tickers' })).toHaveAttribute(
    'title',
    'Current selection: BTC-USDT,ETH-USD'
  );
});

test('ticker select-all and clear send actual sorted tickers and an empty selection', async () => {
  installTransport();
  const selected = await mountTickerChoices();
  userEvent.click(checkbox('Select All'));
  userEvent.click(screen.getByRole('button', { name: 'Find' }));
  expect(selected).toHaveBeenLastCalledWith([
    'BTC-USD',
    'BTC-USDT',
    'ETH-USD',
    'ETH-USDT',
  ]);
  userEvent.click(checkbox('Select All'));
  userEvent.click(screen.getByRole('button', { name: 'Find' }));
  expect(selected).toHaveBeenLastCalledWith([]);
});

test('quote input selection replaces the previous group and deselecting it clears everything', async () => {
  installTransport();
  const selected = await mountTickerChoices();
  userEvent.click(checkbox('Select All USD'));
  userEvent.click(screen.getByRole('button', { name: 'Find' }));
  expect(selected).toHaveBeenLastCalledWith(['BTC-USD', 'ETH-USD']);
  userEvent.click(checkbox('Select All USDT'));
  userEvent.click(screen.getByRole('button', { name: 'Find' }));
  expect(selected).toHaveBeenLastCalledWith(['BTC-USDT', 'ETH-USDT']);
  userEvent.click(checkbox('Select All USDT'));
  userEvent.click(screen.getByRole('button', { name: 'Find' }));
  expect(selected).toHaveBeenLastCalledWith([]);
});

test('individual changes clear and restore the quote-group indicator', async () => {
  installTransport();
  const selected = await mountTickerChoices();
  userEvent.click(checkbox('Select All USDT'));
  userEvent.click(checkbox('BTC-USDT'));
  expect(checkbox('Select All USDT')).not.toBeChecked();
  userEvent.click(screen.getByRole('button', { name: 'Find' }));
  expect(selected).toHaveBeenLastCalledWith(['ETH-USDT']);
  userEvent.click(checkbox('BTC-USDT'));
  expect(checkbox('Select All USDT')).toBeChecked();
  expect(checkbox('Select All')).not.toBeChecked();
});

test('manually completing a quote group marks it selected', async () => {
  installTransport();
  await mountTickerChoices();
  userEvent.click(checkbox('ETH-USDT'));
  expect(checkbox('Select All USDT')).toBeChecked();
  expect(checkbox('Select All USD')).not.toBeChecked();
});

test('global selection and clearing keep quote-group indicators consistent', async () => {
  installTransport();
  await mountTickerChoices();
  userEvent.click(checkbox('Select All'));
  expect(checkbox('Select All USD')).toBeChecked();
  expect(checkbox('Select All USDT')).toBeChecked();
  userEvent.click(checkbox('Select All'));
  expect(screen.getAllByRole('checkbox').every((input) => !input.checked)).toBe(true);
});

test.each(['USD', 'USDT'])(
  'the %s text label selects its own quote group just like its checkbox',
  async (quote) => {
    installTransport();
    const selected = await mountTickerChoices();
    userEvent.click(screen.getByText(`Select All ${quote}`, { selector: 'label' }));
    userEvent.click(screen.getByRole('button', { name: 'Find' }));
    expect(selected).toHaveBeenLastCalledWith([`BTC-${quote}`, `ETH-${quote}`]);
    expect(checkbox(`Select All ${quote}`)).toBeChecked();
  }
);

test('an individual ticker label toggles that ticker rather than the first input', async () => {
  installTransport();
  const selected = await mountTickerChoices();
  userEvent.click(screen.getByText('ETH-USD', { selector: 'label' }));
  userEvent.click(screen.getByRole('button', { name: 'Find' }));
  expect(selected).toHaveBeenLastCalledWith(['BTC-USDT', 'ETH-USD']);
  expect(checkbox('ETH-USD')).toBeChecked();
  expect(checkbox('BTC-USD')).not.toBeChecked();
});

test.each([
  ['MarketsFilter', 'markets', 'Retry market filter', 'Alpha'],
  ['TickersFilter', 'tickers', 'Retry ticker filter', 'ETH-USD'],
])('%s contains request rejection and allows retry', async (name, kind, retry, label) => {
  installTransport({ [kind]: [{ reject: true }] });
  const selected = jest.fn();
  const Component = views[name];
  render(<Component marketsFilter={[]} onClickFunction={selected} handleOnClickFindButton={selected} buttonText="Filter" />);
  expect(await screen.findByRole('alert')).toHaveTextContent('not available');
  userEvent.click(screen.getByRole('button', { name: retry }));
  await screen.findByText(label, { selector: 'label' });
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('empty available ticker metadata produces an empty Find payload', async () => {
  installTransport({ tickers: [{ data: [] }] });
  const selected = jest.fn();
  render(
    <views.TickersFilter
      buttonText="Tickers"
      handleOnClickFindButton={selected}
    />
  );
  await screen.findByTitle(/^Current selection:\s*$/);
  userEvent.click(screen.getByRole('button', { name: 'Find' }));
  expect(selected).toHaveBeenCalledWith([]);
});
