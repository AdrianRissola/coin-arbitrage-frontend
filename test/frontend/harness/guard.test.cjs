const nodeTest = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const cp = require('node:child_process');

const guard = path.resolve(__dirname, '../support/offline-guard.cjs');
const probe = (source) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'frontend-guard-'));
  const env = {
    ...process.env,
    FE_TEST_REPORT_ROOT: directory,
    NODE_OPTIONS: `--require=${guard}`,
    TEST_TRANSPORT_MODE: 'offline',
  };
  delete env.FE_TEST_AUTHORIZATION;
  const result = cp.spawnSync(
    process.execPath,
    ['--require', guard, '-e', source],
    {
      env,
      encoding: 'utf8',
      timeout: 10000,
    }
  );
  return { ...result, directory };
};

nodeTest('owned frontend report writes remain available', () => {
  const result = probe(
    'require("node:fs").writeFileSync(process.env.FE_TEST_REPORT_ROOT+"/owned.txt","synthetic");'
  );
  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    fs.readFileSync(path.join(result.directory, 'owned.txt'), 'utf8'),
    'synthetic'
  );
});

nodeTest('guarded frontend Node children remain available', () => {
  const result = probe(
    'const r=require("node:child_process").spawnSync("node",["-e",""]);if(r.status!==0)throw new Error("Node child failed");'
  );
  assert.equal(result.status, 0, result.stderr);
});

[
  ['TCP', 'require("node:net").connect({host:"127.0.0.1",port:1});'],
  ['listener', 'require("node:net").createServer().listen(0,"127.0.0.1");'],
  ['DNS', 'require("node:dns").lookup("synthetic.invalid",()=>{});'],
  [
    'promise DNS',
    'require("node:dns").promises.resolve4("synthetic.invalid").catch(()=>{});',
  ],
  [
    'UDP',
    'require("node:dgram").createSocket("udp4").send("x",1,"127.0.0.1");',
  ],
  [
    'shell child',
    'require("node:child_process").execSync("printf synthetic");',
  ],
  [
    'unguarded child',
    'require("node:child_process").spawnSync(process.execPath,["-e",""],{env:{}});',
  ],
  [
    'dotenv',
    'require("node:fs").readFileSync("/nonexistent-synthetic/.env","utf8");',
  ],
  [
    'outside write',
    'require("node:fs").writeFileSync(process.env.FE_TEST_REPORT_ROOT+"-outside","x");',
  ],
  [
    'numeric outside open',
    'const fs=require("node:fs");fs.openSync(process.env.FE_TEST_REPORT_ROOT+"-outside",fs.constants.O_CREAT+fs.constants.O_RDWR);',
  ],
  [
    'late TCP',
    'process.once("beforeExit",()=>{try{require("node:net").connect({host:"127.0.0.1",port:1});}catch{}});',
  ],
  [
    'forced-success TCP',
    'try{require("node:net").connect({host:"127.0.0.1",port:1});}catch{};process.exit(0);',
  ],
].forEach(([name, source]) => {
  nodeTest(`caught frontend ${name} violations still fail the child`, () => {
    const result = probe(`try{${source}}catch{}`);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /FE_TEST_GUARD_BLOCKED/);
    assert.equal(fs.existsSync(`${result.directory}-outside`), false);
  });
});
