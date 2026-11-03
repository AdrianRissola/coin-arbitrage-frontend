const test = require('node:test');
const assert = require('node:assert/strict');
const probe = require('./probe.cjs');

[
  'unexpected-console-warning',
  'unexpected-console-error',
  'unexpected-app-warning',
].forEach((name) => {
  test(`F4 ${name} cannot pass with a successful assertion`, () => {
    const result = probe(name);
    assert.equal(result.status, 1, result.output);
    assert.equal(result.report.stages[0].timedOut, false);
    assert.equal(result.report.success, false);
    assert.match(result.output, /unexpected console diagnostic/);
  });
});
test('F4 document-owned callback errors fail with their actual exception, not a policy error', () => {
  const result = probe('unexpected-window-error');
  assert.equal(result.status, 1, result.output);
  assert.equal(result.report.stages[0].timedOut, false);
  assert.ok(
    result.failures.some((failure) =>
      failure.includes('F4 unhandled window callback')
    ),
    result.output
  );
  assert.ok(!result.output.includes('FE_TEST_GUARD_BLOCKED'), result.output);
});
