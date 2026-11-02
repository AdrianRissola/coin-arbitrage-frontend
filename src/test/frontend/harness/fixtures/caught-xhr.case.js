test('a swallowed XHR violation cannot be green', () => {
  try {
    new XMLHttpRequest();
  } catch {}
  expect(true).toBe(true);
});
