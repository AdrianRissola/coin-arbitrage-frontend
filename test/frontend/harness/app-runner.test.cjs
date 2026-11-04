const test = require('node:test');
const assert = require('node:assert/strict');
const probe = require('./probe.cjs');

test('history navigation handles rejection and permits retry without failing the runner', () => {
  const result = probe('app-history-rejection');
  assert.equal(result.status, 0, result.output);
  assert.equal(result.report.success, true, result.output);
  assert.equal(result.report.stages[0].passedTests, 1);
  assert.equal(result.report.stages[0].timedOut, false);
  assert.ok(!result.output.includes('FE_TEST_GUARD_BLOCKED'), result.output);
});

test('a wrong initial subscription oracle is rejected against real App', () => {
  const result = probe('app-wrong-initial-request');
  assert.equal(result.status, 1, result.output);
  assert.equal(result.report.stages[0].childCode, 1, result.output);
  assert.equal(result.report.stages[0].failedTests, 1);
  assert.equal(result.report.stages[0].timedOut, false);
  assert.equal(result.report.success, false);
  assert.match(result.output, /BTC-USD/);
  assert.match(result.output, /BTC-USDT/);
  assert.ok(!result.output.includes('FE_TEST_GUARD_BLOCKED'), result.output);
});

[
  'app-message-json-failure',
  'app-best-missing-failure',
  'app-prices-shape-failure',
].forEach((name) => {
  test(`${name} contains malformed input and recovers without resubscribing`, () => {
    const result = probe(name);
    assert.equal(result.status, 0, result.output);
    assert.equal(result.report.stages[0].childCode, 0, result.output);
    assert.equal(result.report.stages[0].passedTests, 1);
    assert.equal(result.report.stages[0].timedOut, false);
    assert.equal(result.report.success, true, result.output);
    assert.ok(!result.output.includes('FE_TEST_GUARD_BLOCKED'), result.output);
  });
});
