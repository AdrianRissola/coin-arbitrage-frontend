test('an otherwise passing test cannot hide an unexpected error diagnostic', () => {
  console.error('F4 unexpected error');
  expect(true).toBe(true);
});
