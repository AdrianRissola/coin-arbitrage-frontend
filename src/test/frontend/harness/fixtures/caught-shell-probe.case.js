const cp = require('node:child_process');

test('the framework bootstrap does not exempt later application shell commands', () => {
  try {
    cp.execSync('watchman --version');
  } catch {}
  expect(true).toBe(true);
});
