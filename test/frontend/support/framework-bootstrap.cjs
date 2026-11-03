const cp = require('node:child_process');
const { syncBuiltinESMExports } = require('node:module');

const original = cp.execSync;
cp.execSync = (command, ...args) => {
  if (command === 'watchman --version') {
    const error = new Error(
      'Watchman is unavailable in guarded frontend tests'
    );
    error.status = 1;
    throw error;
  }
  return original(command, ...args);
};
try {
  require('jest-haste-map');
} finally {
  cp.execSync = original;
  syncBuiltinESMExports();
}
