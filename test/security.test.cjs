'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const CONFIG_FILES = ['webpack.config.js', 'webpack.local.config.js'];
const ALLOWED_KEYS = ['process.env.REACT_APP_API_REST_ENDPOINT', 'process.env.REACT_APP_WEB_SOCKET_ENDPOINT'];
const REST_ENDPOINT = 'http://localhost:3001/';
const WS_ENDPOINT = 'ws://localhost:3001/';
const PRIVATE_CANARIES = ['SYNTHETIC_PRIVATE_CANARY_5d2c8e', 'synthetic-db-password', 'mongodb://synthetic-user:synthetic-db-password@127.0.0.1:27017/synthetic'];

const loadConfig = (file, parsed) => {
	class DefinePlugin {
		constructor(definitions) {
			this.definitions = definitions;
		}
	}
	class HtmlWebPackPlugin {
		constructor(options) {
			this.options = options;
		}
	}
	const dotenvCalls = [];
	const mocks = {
		path,
		webpack: { DefinePlugin },
		dotenv: {
			config: options => {
				dotenvCalls.push(options);
				return { parsed };
			},
		},
		'html-webpack-plugin': HtmlWebPackPlugin,
	};
	const mockRequire = specifier => {
		if (!Object.prototype.hasOwnProperty.call(mocks, specifier)) {
			throw new Error(`Unexpected require: ${specifier}`);
		}
		return mocks[specifier];
	};
	mockRequire.resolve = specifier => `/mock/resolved/${specifier}`;

	const filename = path.join(ROOT, file);
	const source = fs.readFileSync(filename, 'utf8');
	const wrapper = vm.runInNewContext(`(function (require, module, exports, __dirname, __filename) {${source}\n})`, {}, { filename });
	const moduleObject = { exports: {} };
	wrapper(mockRequire, moduleObject, moduleObject.exports, ROOT, filename);

	const definePlugins = moduleObject.exports.plugins.filter(plugin => plugin instanceof DefinePlugin);
	return { config: moduleObject.exports, definePlugins, dotenvCalls };
};

CONFIG_FILES.forEach(file => {
	test(`${file} defines only the allowed public endpoints`, () => {
		const parsed = {
			REACT_APP_API_REST_ENDPOINT: REST_ENDPOINT,
			REACT_APP_WEB_SOCKET_ENDPOINT: WS_ENDPOINT,
			URI: PRIVATE_CANARIES[2],
			DB_PASSWORD: PRIVATE_CANARIES[1],
			SYNTHETIC_PRIVATE_SETTING: PRIVATE_CANARIES[0],
		};
		const { definePlugins, dotenvCalls } = loadConfig(file, parsed);

		assert.equal(definePlugins.length, 1);
		const { definitions } = definePlugins[0];
		assert.deepEqual(Object.keys(definitions).sort(), ALLOWED_KEYS);
		assert.equal(definitions['process.env.REACT_APP_API_REST_ENDPOINT'], JSON.stringify(REST_ENDPOINT));
		assert.equal(definitions['process.env.REACT_APP_WEB_SOCKET_ENDPOINT'], JSON.stringify(WS_ENDPOINT));

		const serialized = JSON.stringify(definitions);
		PRIVATE_CANARIES.forEach(canary => {
			assert.ok(!serialized.includes(canary), 'definitions contain a private canary');
		});
		assert.equal(dotenvCalls.length, 1);
		assert.equal(dotenvCalls[0].path, './.env.local');
	});

	test(`${file} tolerates missing or empty parsed input`, () => {
		[undefined, {}].forEach(parsed => {
			const { definePlugins } = loadConfig(file, parsed);
			assert.equal(definePlugins.length, 1);
			assert.deepEqual({ ...definePlugins[0].definitions }, {
				'process.env.REACT_APP_API_REST_ENDPOINT': '""',
				'process.env.REACT_APP_WEB_SOCKET_ENDPOINT': '""',
			});
		});
	});
});

test('react-dotenv whitelist exposes exactly the two public endpoint names', () => {
	const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
	assert.deepEqual(pkg['react-dotenv'].whitelist, ['REACT_APP_API_REST_ENDPOINT', 'REACT_APP_WEB_SOCKET_ENDPOINT']);
});

test('App.js does not log the whole environment', () => {
	const source = fs.readFileSync(path.join(ROOT, 'src', 'App.js'), 'utf8');
	assert.doesNotMatch(source, /console\s*\.\s*\w+\s*\(\s*process\s*\.\s*env\s*[,)]/);
});
