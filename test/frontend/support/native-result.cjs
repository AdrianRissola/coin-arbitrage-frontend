module.exports = (result) => {
  const discoveredTests = Number(
    result.stdout.match(/^# tests (\d+)$/m)?.[1] || 0
  );
  const passedTests = Number(result.stdout.match(/^# pass (\d+)$/m)?.[1] || 0);
  const skippedTests = Number(
    result.stdout.match(/^# skipped (\d+)$/m)?.[1] || 0
  );
  const totalTests = discoveredTests - skippedTests;
  return {
    name: result.name,
    childCode: result.childCode,
    signal: result.signal,
    timedOut: result.timedOut,
    discoveredTests,
    totalTests,
    passedTests,
    skippedTests,
    success:
      result.childCode === 0 &&
      !result.timedOut &&
      totalTests > 0 &&
      passedTests === totalTests,
  };
};
