const test = require('node:test');
const assert = require('node:assert/strict');
const probe = require('./probe.cjs');

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
[
  ['history-import-rejection', 'HistoricalArbitrageService'],
  ['markets-import-rejection', 'MarketService'],
].forEach(([name, service]) => {
  test(`${service} import rejection retains its current unhandled follow-up failure`, () => {
    const result = probe(name);
    assert.equal(result.status, 1);
    assert.match(
      result.output,
      /Cannot read properties of undefined \(reading 'data'\)/
    );
    assert.ok(
      result.output.includes(`src/service/${service}.js`),
      result.output
    );
  });
});
[
  ['history-view-rejection', 'HistoricalView'],
  ['market-status-rejection', 'MarketStatusView'],
  ['arbitrage-view-rejection', 'ArbitrageView'],
].forEach(([name, view]) => {
  test(`${view} retains its unhandled request failure without invented error UI`, () => {
    const result = probe(name);
    assert.equal(result.status, 1, result.output);
    assert.equal(result.report.stages[0].childCode, 1, result.output);
    assert.match(
      result.output,
      /Cannot destructure property 'data'|Cannot read properties of undefined \(reading 'data'\)/
    );
    assert.ok(
      result.output.includes(`src/components/views/${view}.js`),
      result.output
    );
    assert.ok(!result.output.includes('FE_TEST_GUARD_BLOCKED'), result.output);
  });
});
