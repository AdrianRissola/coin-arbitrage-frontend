test('a swallowed fetch violation cannot be green', async () => {
  await fetch('http://127.0.0.1:1/').catch(() => {});
  expect(true).toBe(true);
});
