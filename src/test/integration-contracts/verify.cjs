const path = require('node:path');
const { rootFrom, layout, verifyCatalog, verifyPair } = require('./catalog.cjs');

try {
	const args = process.argv.slice(2);
	if (!(args.length === 0 || (args.length === 2 && args[0] === '--peer'))) {
		throw new Error('Usage: verify.cjs [--peer /path/to/other/repository]');
	}
	const local = layout(rootFrom(__dirname));
	const peer = args.length ? layout(path.resolve(args[1])) : null;
	if (peer && peer.repository === local.repository) {
		throw new Error('Peer must be the other repository');
	}
	const result = peer ? verifyPair(local, peer) : verifyCatalog(local.fixtures, local.code);
	process.stdout.write(
		`${JSON.stringify(
			{
				version: result.version,
				digest: result.digest,
				files: Object.keys(result.manifest.files).length,
				parityChecked: args.length > 0,
				scope: 'Fixture consistency only; provider/consumer execution is not validated.',
			},
			null,
			2
		)}\n`
	);
} catch (error) {
	process.stderr.write(`Fixture verification failed: ${error.message}\n`);
	process.exitCode = 1;
}
