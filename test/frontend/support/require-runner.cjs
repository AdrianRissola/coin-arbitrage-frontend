module.exports = () => {
  const state =
    require('node:net')[Symbol.for('coin-arbitrage.frontend-test-guard')];
  if (!state?.profile)
    throw new Error('Use the guarded frontend runner: npm test');
};
