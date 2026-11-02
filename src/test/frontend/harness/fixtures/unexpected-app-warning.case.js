test('matching a known App component name does not allow a different warning', () => {
  console.error(
    'Warning: F4 new warning%s',
    '\n    at HandleSnackbar (src/App.js:135:42)'
  );
  expect(true).toBe(true);
});
