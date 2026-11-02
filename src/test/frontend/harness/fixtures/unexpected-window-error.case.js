test('an otherwise passing assertion cannot hide a document-owned callback error', () => {
  const target = document.createDocumentFragment();
  target.addEventListener('f4-error', () => {
    throw new Error('F4 unhandled window callback');
  });
  target.dispatchEvent(new Event('f4-error'));
  expect(true).toBe(true);
});
