import { act } from '@testing-library/react';
import { prepareApps } from '../../support/app-runtime';

let createApp;
beforeAll(async () => {
  createApp = await prepareApps();
});

test('actual open App retains its uncaught malformed message JSON failure', async () => {
  const app = createApp();
  await app.open();
  await act(async () => app.socket.rawMessage('not valid JSON'));
});
