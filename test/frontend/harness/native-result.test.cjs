const test = require('node:test');
const assert = require('node:assert/strict');
const nativeResult = require('../support/native-result.cjs');

test('selected native cases report explicit skipped/discovered counts without claiming skipped passes', () => {
  assert.deepEqual(
    nativeResult({
      name: 'node-core',
      childCode: 0,
      signal: null,
      timedOut: false,
      stdout: '# tests 5\n# pass 3\n# skipped 2\n',
    }),
    {
      name: 'node-core',
      childCode: 0,
      signal: null,
      timedOut: false,
      discoveredTests: 5,
      totalTests: 3,
      passedTests: 3,
      skippedTests: 2,
      success: true,
    }
  );
});
test('all-skipped native output cannot become a successful stage', () => {
  assert.equal(
    nativeResult({ childCode: 0, stdout: '# tests 4\n# pass 0\n# skipped 4\n' })
      .success,
    false
  );
});
test('missing native totals cannot become a successful exit-zero stage', () => {
  assert.equal(
    nativeResult({ childCode: 0, stdout: 'incomplete TAP' }).success,
    false
  );
});
[
  { childCode: 1, timedOut: false },
  { childCode: 0, timedOut: true },
].forEach((state) => {
  test(`native success counts do not override exit=${state.childCode}/timeout=${state.timedOut}`, () => {
    assert.equal(
      nativeResult({ ...state, stdout: '# tests 1\n# pass 1\n# skipped 0\n' })
        .success,
      false
    );
  });
});
