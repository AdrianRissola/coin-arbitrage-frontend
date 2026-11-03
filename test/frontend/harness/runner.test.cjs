const test = require('node:test');
const assert = require('node:assert/strict');
const probe = require('./probe.cjs');

test('passing frontend control executes a nonempty actual CRA suite', () => {
  const result = probe('passing');
  assert.equal(result.status, 0, result.output);
  assert.equal(result.report.stages[0].passedTests, 1);
  assert.equal(result.report.success, true);
});

test('a failing frontend assertion propagates nonzero status', () => {
  const result = probe('failing');
  assert.equal(result.status, 1);
  assert.equal(result.report.stages[0].failedTests, 1);
});

test('an empty frontend test file cannot be green', () => {
  const result = probe('empty');
  assert.equal(result.status, 1);
  assert.equal(result.report.stages[0].totalTests, 0);
  assert.match(result.output, /must contain at least one test/);
});

test('no matching frontend files return nonzero status', () => {
  const result = probe('no-tests');
  assert.equal(result.status, 1);
  assert.match(result.output, /No tests found/);
});

test('all-skipped frontend tests are not accepted as executed protection', () => {
  const result = probe('skipped');
  assert.equal(result.status, 1);
  assert.equal(result.report.stages[0].childCode, 0);
  assert.equal(result.report.stages[0].passedTests, 0);
});

test('a frontend exit zero without a result is rejected', () => {
  const result = probe('forced-success');
  assert.equal(result.status, 1);
  assert.equal(result.report.stages[0].childCode, 0);
  assert.equal(result.report.stages[0].reason, 'missing-jest-result');
});
