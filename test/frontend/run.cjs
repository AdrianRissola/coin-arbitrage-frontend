const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');
const assert = require('node:assert/strict');
const nativeResult = require('./support/native-result.cjs');
const { version: jestVersion } = require('jest/package.json');
const {
  verifyCatalog,
} = require('../../src/test/integration-contracts/catalog.cjs');
const {
  authorizationName,
  createAuthorization,
} = require('./support/transport.cjs');

const root = path.resolve(__dirname, '../..');
const guard = path.join(__dirname, 'support/offline-guard.cjs');
const framework = path.join(__dirname, 'support/framework-bootstrap.cjs');
const PROBES = [
  'passing',
  'failing',
  'empty',
  'skipped',
  'no-tests',
  'forced-success',
  'caught-fetch',
  'caught-xhr',
  'caught-websocket',
  'caught-shell-probe',
  'unprepared-import',
  'history-import-rejection',
  'markets-import-rejection',
  'history-view-rejection',
  'market-status-rejection',
  'arbitrage-view-rejection',
  'app-wrong-initial-request',
  'app-message-json-failure',
  'app-best-missing-failure',
  'app-prices-shape-failure',
  'app-history-rejection',
  'unexpected-console-warning',
  'unexpected-console-error',
  'unexpected-app-warning',
  'unexpected-window-error',
];
const STAGE_TIMEOUT_MS = 90000;
const PROBE_TIMEOUT_MS = 30000;
const SHUTDOWN_GRACE_MS = 1000;

const run = async (options = {}) => {
  const suite =
    { all: 'offline', components: 'ui' }[options.suite] ||
    options.suite ||
    'offline';
  if (
    !['offline', 'services', 'ui', 'app', 'lifecycle', 'integration'].includes(
      suite
    )
  )
    throw new Error('Unknown frontend suite');
  if (options.probe && !PROBES.includes(options.probe))
    throw new Error('Unknown frontend probe');
  if (
    suite === 'integration' &&
    (!options.testPaths?.length || options.transport?.mode !== 'real-loopback')
  ) {
    throw new Error(
      'Integration requires explicit test paths and controller-owned transport'
    );
  }
  if (
    options.testPaths?.some(
      (file) =>
        !path
          .resolve(file)
          .startsWith(
            `${path.join(root, 'src/test/integration-contracts')}${path.sep}`
          )
    )
  ) {
    throw new Error(
      'Integration tests must be inside the INT-owned test directory'
    );
  }
  verifyCatalog(
    path.join(root, 'src/test/fixtures/contracts/v1'),
    path.join(root, 'src/test/integration-contracts')
  );
  const authorization = await createAuthorization(options.transport);
  const directory = options.directory
    ? path.resolve(options.directory)
    : fs.mkdtempSync(path.join(os.tmpdir(), 'coin-arbitrage-fe-'));
  if (options.directory) fs.mkdirSync(directory, { mode: 0o700 });
  ['home', 'tmp', 'cache'].forEach((name) =>
    fs.mkdirSync(path.join(directory, name))
  );
  const authorizationFile = path.join(directory, authorizationName);
  fs.writeFileSync(authorizationFile, JSON.stringify(authorization), {
    mode: 0o600,
  });
  const env = {
    PATH: process.env.PATH || '',
    HOME: path.join(directory, 'home'),
    TMPDIR: path.join(directory, 'tmp'),
    TEST_BOOTSTRAP_TMPDIR: path.join(directory, 'tmp'),
    BABEL_ENV: 'test',
    CI: 'true',
    FORCE_COLOR: '0',
    ...authorization.profile,
    TZ: 'UTC',
    LANG: 'en_US.UTF-8',
    LC_ALL: 'en_US.UTF-8',
    FE_TEST_REPORT_ROOT: directory,
    FE_TEST_AUTHORIZATION: authorizationFile,
    NODE_OPTIONS: `--require=${guard}`,
  };
  const children = new Set();
  const stopping = new Map();
  let interrupted = false;
  const stop = (child) => {
    if (!children.has(child) || !child.pid || stopping.has(child)) return;
    const signal = (value) => {
      try {
        if (process.platform === 'win32') child.kill(value);
        else process.kill(-child.pid, value);
      } catch (error) {
        if (error.code !== 'ESRCH') throw error;
      }
    };
    signal('SIGTERM');
    stopping.set(
      child,
      setTimeout(() => signal('SIGKILL'), SHUTDOWN_GRACE_MS)
    );
  };
  const onInterrupt = (signal) => {
    interrupted = true;
    process.exitCode = signal === 'SIGINT' ? 130 : 143;
    children.forEach(stop);
  };
  const onInt = () => onInterrupt('SIGINT');
  const onTerm = () => onInterrupt('SIGTERM');
  process.once('SIGINT', onInt);
  process.once('SIGTERM', onTerm);
  const execute = (name, commandArgs) =>
    new Promise((resolve) => {
      const child = cp.spawn(process.execPath, commandArgs, {
        cwd: root,
        env: ['configuration', 'jest'].includes(name)
          ? {
              ...env,
              NODE_OPTIONS: `${env.NODE_OPTIONS} --require=${framework}`,
            }
          : env,
        detached: process.platform !== 'win32',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      children.add(child);
      let stdout = '';
      let stderr = '';
      let timedOut = false;
      child.stdout.on('data', (data) => {
        stdout += data;
      });
      child.stderr.on('data', (data) => {
        stderr += data;
      });
      child.once('error', (error) => {
        stderr += error.message;
      });
      const timeout = setTimeout(
        () => {
          timedOut = true;
          stop(child);
        },
        options.probe ? PROBE_TIMEOUT_MS : STAGE_TIMEOUT_MS
      );
      child.once('close', (childCode, signal) => {
        clearTimeout(timeout);
        clearTimeout(stopping.get(child));
        stopping.delete(child);
        children.delete(child);
        fs.writeFileSync(path.join(directory, `${name}.log`), stdout + stderr);
        resolve({ name, childCode, signal, timedOut, stdout, stderr });
      });
    });
  try {
    const cra = require.resolve('react-scripts/scripts/test.js');
    const args = [
      cra,
      '--watchAll=false',
      '--runInBand',
      '--watchman=false',
      '--haste',
      '{"forceNodeFilesystemAPI":true}',
      '--cacheDirectory',
      path.join(directory, 'cache'),
    ];
    const configurationRun = await execute('configuration', [
      ...args,
      '--showConfig',
    ]);
    if (configurationRun.childCode !== 0 || configurationRun.timedOut) {
      throw new Error(
        `CRA configuration failed:\n${configurationRun.stdout}${configurationRun.stderr}`
      );
    }
    const loaded = JSON.parse(configurationRun.stdout);
    const configuration = loaded.configs[0];
    assert.equal(configuration.rootDir, root);
    assert.equal(configuration.resetMocks, true);
    assert.equal(loaded.globalConfig.watchman, false);
    assert.equal(configuration.haste.forceNodeFilesystemAPI, true);
    assert.deepEqual(configuration.setupFilesAfterEnv, [
      path.join(root, 'src/setupTests.js'),
    ]);
    assert.match(configuration.testEnvironment, /jest-environment-jsdom/);
    assert.ok(
      configuration.transform.some(([, transform]) =>
        transform.endsWith('react-scripts/config/jest/babelTransform.js')
      )
    );
    assert.deepEqual(
      configuration.transformIgnorePatterns,
      JSON.parse(fs.readFileSync(path.join(root, 'package.json'))).jest
        .transformIgnorePatterns
    );
    fs.writeFileSync(
      path.join(directory, 'loaded-configuration.json'),
      JSON.stringify(loaded, null, 2)
    );
    const jestArgs = [
      ...args,
      '--json',
      '--outputFile',
      path.join(directory, 'jest-result.json'),
    ];
    if (options.probe === 'no-tests') {
      jestArgs.push('--testPathPattern', 'no-matching-f1-control-files');
    } else if (options.probe) {
      jestArgs.push(
        '--testMatch',
        '<rootDir>/src/test/frontend/harness/fixtures/*.case.js',
        '--runTestsByPath',
        path.join(
          root,
          `src/test/frontend/harness/fixtures/${options.probe}.case.js`
        )
      );
    } else if (suite === 'services') {
      jestArgs.push(
        '--testMatch',
        '<rootDir>/src/test/frontend/service/**/*.test.js'
      );
    } else if (suite === 'ui') {
      jestArgs.push(
        '--testMatch',
        '<rootDir>/src/test/frontend/{components,views}/**/*.test.js'
      );
    } else if (suite === 'app') {
      jestArgs.push(
        '--testMatch',
        '<rootDir>/src/test/frontend/app/**/*.test.js'
      );
    } else if (suite === 'lifecycle') {
      jestArgs.push(
        '--testMatch',
        '<rootDir>/src/test/frontend/lifecycle/**/*.test.js'
      );
    } else if (suite === 'integration') {
      jestArgs.push(
        '--testMatch',
        '<rootDir>/src/test/integration-contracts/**/*.test.js',
        '--runTestsByPath',
        ...options.testPaths,
        '--testURL',
        options.transport.context.origin
      );
    }
    if (options.coverage) {
      jestArgs.push(
        '--coverage',
        '--coverageDirectory',
        path.join(directory, 'coverage')
      );
    }
    if (options.handles) jestArgs.push('--detectOpenHandles');
    const jest = await execute('jest', jestArgs);
    process.stdout.write(jest.stdout);
    process.stderr.write(jest.stderr);
    const resultFile = path.join(directory, 'jest-result.json');
    const result = fs.existsSync(resultFile)
      ? JSON.parse(fs.readFileSync(resultFile, 'utf8'))
      : null;
    const stages = [
      {
        name: 'jest',
        childCode: jest.childCode,
        signal: jest.signal,
        timedOut: jest.timedOut,
        totalTests: result?.numTotalTests || 0,
        passedTests: result?.numPassedTests || 0,
        skippedTests: result?.numPendingTests || 0,
        failedTests: result?.numFailedTests || 0,
        reason: result ? 'jest-result' : 'missing-jest-result',
        success:
          jest.childCode === 0 &&
          !jest.timedOut &&
          result?.success === true &&
          result.numPassedTests > 0 &&
          result.numFailedTests === 0,
      },
    ];
    if (suite === 'offline' && !options.probe && !interrupted) {
      const nativeGroup = async (name, files) => {
        if (interrupted) return;
        const native = await execute(name, [
          '--test',
          '--test-reporter=tap',
          ...files,
        ]);
        process.stdout.write(native.stdout);
        process.stderr.write(native.stderr);
        stages.push(nativeResult(native));
      };
      await nativeGroup('node', [
        'src/test/integration-contracts/bootstrap.test.cjs',
        'test/security.test.cjs',
        'test/frontend/harness/guard.test.cjs',
        'test/frontend/harness/transport.test.cjs',
        'test/frontend/harness/runner.test.cjs',
        'test/frontend/harness/native-result.test.cjs',
      ]);
      await nativeGroup('node-app', [
        'test/frontend/harness/app-runner.test.cjs',
      ]);
      await nativeGroup('node-services', [
        'test/frontend/harness/service-runner.test.cjs',
      ]);
      await nativeGroup('node-diagnostics', [
        'test/frontend/harness/diagnostics-runner.test.cjs',
      ]);
    }
    const report = {
      version: 1,
      scope: options.probe ? `runner-control:${options.probe}` : suite,
      transportMode: authorization.profile.TEST_TRANSPORT_MODE,
      node: process.version,
      jest: jestVersion,
      stages,
      success: !interrupted && stages.every((stage) => stage.success),
    };
    fs.writeFileSync(
      path.join(directory, 'report.json'),
      `${JSON.stringify(report, null, 2)}\n`
    );
    process.stdout.write(`Report: ${path.join(directory, 'report.json')}\n`);
    return report;
  } finally {
    process.removeListener('SIGINT', onInt);
    process.removeListener('SIGTERM', onTerm);
  }
};

module.exports = { run };

if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  while (args.length) {
    const flag = args.shift();
    if (['--suite', '--probe', '--report-dir'].includes(flag)) {
      const value = args.shift();
      if (!value || value.startsWith('--'))
        throw new Error(`Missing value for ${flag}`);
      options[
        { '--suite': 'suite', '--probe': 'probe', '--report-dir': 'directory' }[
          flag
        ]
      ] = value;
    } else if (flag === '--coverage') options.coverage = true;
    else if (flag === '--detect-open-handles') options.handles = true;
    else throw new Error(`Unknown frontend runner option: ${flag}`);
  }
  run(options)
    .then((report) => {
      if (!report.success) process.exitCode = process.exitCode || 1;
    })
    .catch((error) => {
      process.stderr.write(`${error.stack}\n`);
      process.exitCode = process.exitCode || 1;
    });
}
