const test = require('node:test');
const assert = require('node:assert/strict');
const probe = require('./probe.cjs');

[
  'history-import-rejection',
  'history-view-rejection',
  'markets-import-rejection',
  'market-status-rejection',
  'arbitrage-view-rejection',
].forEach((name) => {
  test(`${name} contains failure and exits naturally`, () => {
    const result = probe(name);
    assert.equal(result.status, 0, result.output);
    assert.equal(result.report.success, true, result.output);
    assert.equal(result.report.stages[0].passedTests, 1);
    assert.equal(result.report.stages[0].timedOut, false);
    assert.ok(!result.output.includes('FE_TEST_GUARD_BLOCKED'), result.output);
  });
});

[
  'caught-fetch',
  'caught-xhr',
  'caught-websocket',
  'caught-shell-probe',
  'unprepared-import',
].forEach((name) => {
  test(`${name} fails even if the caller catches the guarded failure`, () => {
    const result = probe(name);
    assert.equal(result.status, 1);
    assert.equal(result.report.stages[0].failedTests, 1);
    assert.match(result.output, /FE_TEST_GUARD_BLOCKED/);
  });
});
