const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const REQUIRED_FIXTURES = [
	'arbitrages.json',
	'available-tickers.json',
	'errors.json',
	'harness-interface.json',
	'historical-arbitrages.json',
	'historical-empty.json',
	'market-prices.json',
	'markets.json',
	'no-data.json',
	'requests.json',
	'seed.json',
	'ws-arbitrage.json',
	'ws-best-arbitrage.json',
	'ws-markets.json',
	'ws-welcome.json',
];
const REQUIRED_INTERFACES = ['bootstrap.test.cjs', 'catalog.cjs', 'context.cjs', 'verify.cjs'];

const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const readJson = file => {
	try {
		return JSON.parse(fs.readFileSync(file, 'utf8'));
	} catch {
		throw new Error(`Invalid catalog JSON: ${path.basename(file)}`);
	}
};

const rootFrom = directory => {
	const candidates = [path.resolve(directory, '../..'), path.resolve(directory, '../../..')];
	const root = candidates.find(candidate => {
		const file = path.join(candidate, 'package.json');
		return (
			fs.existsSync(file) &&
			['coin-arbitrer', 'coin-arbitrage-frontend'].includes(readJson(file).name)
		);
	});
	if (!root) throw new Error('Unsupported bootstrap repository');
	return root;
};

const layout = root => {
	const { name } = readJson(path.join(root, 'package.json'));
	if (!['coin-arbitrer', 'coin-arbitrage-frontend'].includes(name)) {
		throw new Error('Unsupported bootstrap repository');
	}
	const tests = path.join(root, name === 'coin-arbitrer' ? 'test' : 'src/test');
	return {
		repository: name,
		fixtures: path.join(tests, 'fixtures/contracts/v1'),
		code: path.join(tests, 'integration-contracts'),
	};
};

const checkFiles = (directory, hashes, extension, required) => {
	if (!hashes || Array.isArray(hashes) || typeof hashes !== 'object') {
		throw new Error('Invalid catalog file map');
	}
	Object.keys(hashes).forEach(file => {
		if (!/^[a-z0-9.-]+$/.test(file) || !file.endsWith(extension) || file.startsWith('.')) {
			throw new Error('Invalid catalog filename');
		}
	});
	if (JSON.stringify(Object.keys(hashes).sort()) !== JSON.stringify(required.slice().sort())) {
		throw new Error('Missing or unexpected required catalog files');
	}
	Object.entries(hashes).forEach(([file, hash]) => {
		if (!/^[a-f0-9]{64}$/.test(hash)) throw new Error('Invalid catalog checksum');
		if (sha256(fs.readFileSync(path.join(directory, file))) !== hash) {
			throw new Error(`Checksum mismatch: ${file}`);
		}
	});
};

const verifyCatalog = (directory, codeDirectory) => {
	const manifest = readJson(path.join(directory, 'manifest.json'));
	if (
		manifest.version !== '1.0.0' ||
		manifest.protocolVersion !== 1 ||
		!/^[a-f0-9]{40}$/.test(manifest.providerCommit) ||
		!/^[a-f0-9]{40}$/.test(manifest.consumerCommit)
	) {
		throw new Error('Invalid catalog manifest');
	}
	checkFiles(directory, manifest.files, '.json', REQUIRED_FIXTURES);
	checkFiles(codeDirectory, manifest.interfaceFiles, '.cjs', REQUIRED_INTERFACES);
	const actual = fs.readdirSync(directory).sort();
	const expected = [...Object.keys(manifest.files), 'manifest.json'].sort();
	if (JSON.stringify(actual) !== JSON.stringify(expected)) {
		throw new Error('Unexpected or missing catalog files');
	}
	const fixtures = Object.fromEntries(
		Object.keys(manifest.files).map(file => [file, readJson(path.join(directory, file))])
	);
	return {
		version: manifest.version,
		digest: sha256(fs.readFileSync(path.join(directory, 'manifest.json'))),
		fixtures,
		manifest,
	};
};

const verifyPair = (local, peer) => {
	const result = verifyCatalog(local.fixtures, local.code);
	const other = verifyCatalog(peer.fixtures, peer.code);
	if (
		result.digest !== other.digest ||
		Object.keys(result.manifest.files).some(
			file =>
				!fs
					.readFileSync(path.join(local.fixtures, file))
					.equals(fs.readFileSync(path.join(peer.fixtures, file)))
		)
	) {
		throw new Error('Catalog parity mismatch');
	}
	return result;
};

module.exports = { rootFrom, layout, verifyCatalog, verifyPair };
