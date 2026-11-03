test('an otherwise passing test cannot hide an unexpected warning', () => {
  console.warn('F4 unexpected warning');
  expect(true).toBe(true);
});
