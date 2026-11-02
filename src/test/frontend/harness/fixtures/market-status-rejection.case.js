import React from 'react';
import { render, screen } from '@testing-library/react';
import { installTransport, loadViews } from '../../support/ui-runtime';

let views;
beforeAll(async () => {
  views = await loadViews();
});

test('actual market status view retains the unhandled rejected-metadata follow-up', () => {
  installTransport({ markets: [{ reject: true }] });
  render(<views.MarketStatusView />);
  expect(
    screen.getByRole('columnheader', { name: 'Market (0)' })
  ).toBeInTheDocument();
});
