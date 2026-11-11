const nodeTest = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const { rootFrom, layout, verifyCatalog, verifyPair } = require('./catalog.cjs');
const { createTestEnvironment } = require('./context.cjs');

const local = layout(rootFrom(__dirname));
const context = {
	protocolVersion: 1,
	runId: 'bootstrap-case',
	token: 'a'.repeat(64),
	fixtureDigest: 'b'.repeat(64),
	backendRevision: 'c'.repeat(40),
	frontendRevision: 'd'.repeat(40),
	restEndpoint: 'http://127.0.0.1:49152/',
	websocketEndpoint: 'ws://127.0.0.1:49152/',
	origin: 'http://localhost:3000',
	mongoUri: 'mongodb://127.0.0.1:49153/testfoundation_bootstrap-case',
	containerId: 'e'.repeat(64),
	ownerLabel: 'bootstrap-case',
};

const copyCatalog = () => {
	const directory = fs.mkdtempSync(
		path.join(process.env.TEST_BOOTSTRAP_TMPDIR || os.tmpdir(), 'contracts-')
	);
	fs.readdirSync(local.fixtures).forEach(file => {
		fs.copyFileSync(path.join(local.fixtures, file), path.join(directory, file));
	});
	return directory;
};

const changeFixture = (directory, updateHash) => {
	const file = path.join(directory, 'ws-welcome.json');
	fs.writeFileSync(file, '{"response":"different synthetic welcome"}\n');
	if (updateHash) {
		const manifestFile = path.join(directory, 'manifest.json');
		const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
		manifest.files['ws-welcome.json'] = crypto
			.createHash('sha256')
			.update(fs.readFileSync(file))
			.digest('hex');
		fs.writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
	}
};

nodeTest('the local catalog has valid hashes and literal data', () => {
	assert.equal(verifyCatalog(local.fixtures, local.code).version, '1.0.0');
});

nodeTest('an empty catalog cannot declare itself valid', () => {
	const directory = fs.mkdtempSync(
		path.join(process.env.TEST_BOOTSTRAP_TMPDIR || os.tmpdir(), 'empty-contracts-')
	);
	const manifest = JSON.parse(
		fs.readFileSync(path.join(local.fixtures, 'manifest.json'), 'utf8')
	);
	manifest.files = {};
	fs.writeFileSync(path.join(directory, 'manifest.json'), JSON.stringify(manifest));
	assert.throws(() => verifyCatalog(directory, local.code), /required catalog files/);
});

nodeTest('the CLI rejects same-repository parity instead of reporting a paired check', () => {
	const result = cp.spawnSync(
		process.execPath,
		[path.join(local.code, 'verify.cjs'), '--peer', rootFrom(__dirname)],
		{ encoding: 'utf8', timeout: 5000 }
	);
	assert.equal(result.status, 1);
});

nodeTest('literal financial fixtures are internally consistent, not provider validation', () => {
	const { fixtures } = verifyCatalog(local.fixtures, local.code);
	const arbitrages = fixtures['arbitrages.json'];
	assert.deepEqual(
		arbitrages.map(a => a.profitPerUnit),
		[45, 25, 20]
	);
	assert.deepEqual(
		arbitrages.map(a => a.profitPercentage),
		[56.25, 25, 25]
	);
	arbitrages.forEach(a => {
		const [buy, sell] = a.transactions;
		assert.equal(a.profitPerUnit, sell.price - buy.price);
		assert.equal(a.profitPercentage, (100 * (sell.price - buy.price)) / buy.price);
	});
	assert.deepEqual(
		Object.values(fixtures['ws-arbitrage.json'].arbitrages['BTC-USDT']),
		arbitrages
	);
});

nodeTest('byte-identical catalogs pass explicit parity', () => {
	assert.equal(verifyPair(local, { fixtures: copyCatalog(), code: local.code }).version, '1.0.0');
});

nodeTest('an unrecorded payload change fails local verification', () => {
	const directory = copyCatalog();
	changeFixture(directory, false);
	assert.throws(() => verifyCatalog(directory, local.code), /Checksum mismatch/);
});

nodeTest('a peer change with refreshed hashes still fails cross-repository parity', () => {
	const directory = copyCatalog();
	changeFixture(directory, true);
	assert.throws(
		() => verifyPair(local, { fixtures: directory, code: local.code }),
		/Catalog parity mismatch/
	);
});

nodeTest('manifest traversal is rejected before reading outside the catalog', () => {
	const directory = copyCatalog();
	const file = path.join(directory, 'manifest.json');
	const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
	manifest.files['../package-lock.json'] = '0'.repeat(64);
	fs.writeFileSync(file, JSON.stringify(manifest));
	assert.throws(() => verifyCatalog(directory, local.code), /Invalid catalog filename/);
});

nodeTest('offline setup is the default and clears ambient run/database values', () => {
	const env = createTestEnvironment();
	assert.equal(env.TEST_TRANSPORT_MODE, 'offline');
	assert.equal(env.REACT_APP_API_REST_ENDPOINT, 'http://127.0.0.1:1/');
	assert.equal(env.REACT_APP_WEB_SOCKET_ENDPOINT, 'ws://127.0.0.1:1/');
	assert.equal(env.MONGO_DB_URI, '');
	assert.equal(env.MONGO_DB_URI_TEST, '');
	assert.equal(env.TEST_RUN_TOKEN, '');
	assert.ok(Object.isFrozen(env));
});

nodeTest('real-loopback setup requires independent controller expectations', () => {
	assert.throws(
		() => createTestEnvironment({ mode: 'real-loopback', context }),
		/Trusted controller expectations/
	);
});

nodeTest('a matching context produces only validated test environment values', () => {
	const env = createTestEnvironment({
		mode: 'real-loopback',
		context,
		expected: { ...context },
	});
	assert.equal(env.MONGO_DB_URI_TEST, context.mongoUri);
	assert.equal(env.REACT_APP_API_REST_ENDPOINT, context.restEndpoint);
	assert.deepEqual(JSON.parse(env.TEST_RUN_CONTEXT), context);
	assert.deepEqual(JSON.parse(env.LOCAL_ALLOWED_ORIGINS), [context.origin]);
	const { fixtures } = verifyCatalog(local.fixtures, local.code);
	assert.deepEqual(
		Object.keys(JSON.parse(env.TEST_RUN_CONTEXT)).sort(),
		fixtures['harness-interface.json'].contextFields.slice().sort()
	);
});

nodeTest('unknown transport modes fail instead of falling back', () => {
	assert.throws(() => createTestEnvironment({ mode: 'unexpected' }), /Unknown transport mode/);
});

['token', 'backendRevision', 'frontendRevision', 'fixtureDigest', 'containerId'].forEach(field => {
	nodeTest(`a mismatched ${field} is rejected`, () => {
		assert.throws(
			() =>
				createTestEnvironment({
					mode: 'real-loopback',
					context: { ...context, [field]: 'f'.repeat(context[field].length) },
					expected: context,
				}),
			/Controller expectation mismatch/
		);
	});
});

[
	{ restEndpoint: 'https://remote.invalid/' },
	{ restEndpoint: 'http://127.0.0.1:3000/' },
	{ restEndpoint: 'http://127.0.0.1:49152/path' },
	{ websocketEndpoint: 'ws://127.0.0.1:3001/' },
	{ mongoUri: 'mongodb://127.0.0.1:27017/testfoundation_bootstrap-case' },
	{ mongoUri: 'mongodb+srv://remote.invalid/testfoundation_bootstrap-case' },
	{
		mongoUri:
			'mongodb://synthetic:PRIVATE_CANARY@127.0.0.1:49153/testfoundation_bootstrap-case',
	},
	{ mongoUri: 'mongodb://127.0.0.1:49153/existing_database' },
].forEach((override, index) => {
	nodeTest(`unsafe endpoint case ${index + 1} is rejected without echoing credentials`, () => {
		const unsafe = { ...context, ...override };
		assert.throws(
			() =>
				createTestEnvironment({ mode: 'real-loopback', context: unsafe, expected: unsafe }),
			error => /Invalid test/.test(error.message) && !error.message.includes('PRIVATE_CANARY')
		);
	});
});
