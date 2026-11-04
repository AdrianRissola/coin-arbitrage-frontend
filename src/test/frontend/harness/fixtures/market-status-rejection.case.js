import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { installTransport, loadViews } from '../../support/ui-runtime';

let views;
beforeAll(async () => {
  views = await loadViews();
});

test('market status view contains rejection and retries successfully', async () => {
  installTransport({ markets: [{ reject: true }] });
  render(<views.MarketStatusView />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Market information is not available');
  userEvent.click(screen.getByRole('button', { name: 'Retry markets' }));
  await screen.findByRole('columnheader', { name: 'Market (3)' });
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
