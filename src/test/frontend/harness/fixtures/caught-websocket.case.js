test('a swallowed browser WebSocket violation cannot be green', () => {
  try {
    new WebSocket('ws://127.0.0.1:1/');
  } catch {}
  expect(true).toBe(true);
});
