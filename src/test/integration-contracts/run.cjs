const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');

const load = createRequire(__filename);
const parse = argv => {
	const args = argv.slice();
	const index = args.indexOf('--backend-dir');
	if (index < 0 || !args[index + 1] || args[index + 1].startsWith('--') ||
		args.lastIndexOf('--backend-dir') !== index || args.includes('--frontend-dir'))
		throw new Error('An explicit pinned backend directory is required; frontend is this checkout');
	const backendDir = fs.realpathSync(args.splice(index, 2)[1]);
	if (JSON.parse(fs.readFileSync(path.join(backendDir, 'package.json'))).name !== 'coin-arbitrer')
		throw new Error('Pinned backend repository role mismatch');
	return { backendDir, args: ['--frontend-dir', path.resolve(__dirname, '../../..'), ...args] };
};
const run = argv => {
	const options = parse(argv);
	const runner = load(path.join(options.backendDir, 'test/integration-contracts/run.cjs'));
	return runner.run(runner.parse(options.args));
};

module.exports = { parse, run };
if (require.main === module)
	Promise.resolve().then(() => run(process.argv.slice(2))).then(
		report => { if (!report.success) process.exitCode = 1; },
		error => { process.stderr.write(`${error.stack}\n`); process.exitCode = 1; }
	);
