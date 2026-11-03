const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const assert = require('node:assert/strict');

module.exports = (name) => {
  const result = cp.spawnSync(
    process.execPath,
    [path.resolve(__dirname, '../run.cjs'), '--probe', name],
    {
      env: process.env,
      encoding: 'utf8',
      timeout: 45000,
      maxBuffer: 8 * 1024 * 1024,
    }
  );
  const output = (result.stdout || '') + (result.stderr || '');
  const reportPath = result.stdout?.match(/^Report: (.+)$/m)?.[1];
  assert.ok(reportPath, output);
  const resultPath = path.join(path.dirname(reportPath), 'jest-result.json');
  const failures = fs.existsSync(resultPath)
    ? JSON.parse(fs.readFileSync(resultPath)).testResults.flatMap((file) =>
        file.assertionResults.flatMap((assertion) => assertion.failureMessages)
      )
    : [];
  return {
    ...result,
    output,
    report: JSON.parse(fs.readFileSync(reportPath, 'utf8')),
    failures,
  };
};
