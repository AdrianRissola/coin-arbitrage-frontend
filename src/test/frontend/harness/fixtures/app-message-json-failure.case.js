import { act, screen } from '@testing-library/react';
import arbitrage from '../../../fixtures/contracts/v1/ws-arbitrage.json';
import { prepareApps } from '../../support/app-runtime';

let createApp;
beforeAll(async () => {
  createApp = await prepareApps();
});

test('malformed JSON is ignored and the same socket renders later valid data', async () => {
  const app = createApp();
  await app.open();
  await act(async () => app.socket.rawMessage('not valid JSON'));
  await app.message(arbitrage);
  expect(screen.getByText('Alpha-Gamma')).toBeInTheDocument();
  expect(app.socket.sent).toHaveLength(1);
});
