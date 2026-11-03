import { screen } from '@testing-library/react';
import { prepareApps, cleanupApps } from '../support/app-runtime';
import arbitrage from '../../fixtures/contracts/v1/ws-arbitrage.json';

let createApp;
beforeAll(async () => {
  createApp = await prepareApps();
});

test('actual App unmount omission is observed before explicit fixture socket/global cleanup', async () => {
  const guarded = window.WebSocket;
  const app = createApp();
  await app.open();
  await app.message(arbitrage);
  const socket = app.socket;
  app.unmount();
  expect(socket.readyState).toBe(socket.OPEN);
  expect(socket.onmessage).toEqual(expect.any(Function));
  expect(socket.closeCalls).toEqual([]);
  cleanupApps();
  expect(socket.readyState).toBe(socket.CLOSED);
  expect(
    ['open', 'message', 'error', 'close'].map((type) => socket[`on${type}`])
  ).toEqual([null, null, null, null]);
  expect(socket.listenerCount()).toBe(0);
  expect(window.WebSocket).toBe(guarded);
  expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
});
test('fixture cleanup detaches direct listeners and is idempotent before finishClose dispatch', async () => {
  const app = createApp();
  await app.open();
  const closed = jest.fn();
  app.socket.addEventListener('close', closed);
  app.socket.addEventListener('close', closed);
  const socket = app.socket;
  cleanupApps();
  cleanupApps();
  expect(closed).not.toHaveBeenCalled();
  expect(socket.listenerCount()).toBe(0);
  expect(socket.closeCalls).toHaveLength(1);
});
test('nested actual App contexts restore their guarded global in reverse order', async () => {
  const guarded = window.WebSocket;
  const first = createApp();
  await first.open();
  first.unmount();
  const second = createApp();
  await second.open();
  cleanupApps();
  expect([first.socket.readyState, second.socket.readyState]).toEqual([3, 3]);
  expect([first.socket.listenerCount(), second.socket.listenerCount()]).toEqual(
    [0, 0]
  );
  expect(window.WebSocket).toBe(guarded);
});
test('fixture-owned notification timeouts are cancelled without claiming production timer cleanup', async () => {
  const originalTimeout = window.setTimeout;
  const originalClear = window.clearTimeout;
  const app = createApp();
  await app.open();
  expect(app.timers.pendingCount()).toBeGreaterThan(0);
  app.unmount();
  cleanupApps();
  expect(app.timers.pendingCount()).toBe(0);
  expect(window.setTimeout).toBe(originalTimeout);
  expect(window.clearTimeout).toBe(originalClear);
});
test('disposed socket events cannot invoke the old App callback or recreate its DOM', async () => {
  const app = createApp();
  await app.open();
  const callback = jest.fn();
  app.socket.addEventListener('message', callback);
  const socket = app.socket;
  cleanupApps();
  socket.dispatchEvent(
    new MessageEvent('message', { data: JSON.stringify(arbitrage) })
  );
  expect(callback).not.toHaveBeenCalled();
  expect(
    screen.queryByRole('heading', { name: 'BTC-USDT Arbitrage' })
  ).not.toBeInTheDocument();
});
test('locale and timezone are explicit and independent of host numeric/date defaults', () => {
  expect(Intl.NumberFormat().resolvedOptions().locale).toBe('en-US');
  expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('UTC');
  expect((1234.5).toLocaleString()).toBe('1,234.5');
  expect(navigator.language).toBe('en-US');
});
test('a case may populate storage without exposing it to another case', () => {
  localStorage.setItem('f4-case-marker', 'owned');
  sessionStorage.setItem('f4-case-marker', 'owned');
  expect(localStorage.getItem('f4-case-marker')).toBe('owned');
});
test('per-case setup removes previous local and session storage markers', () => {
  expect(localStorage.getItem('f4-case-marker')).toBeNull();
  expect(sessionStorage.getItem('f4-case-marker')).toBeNull();
});
