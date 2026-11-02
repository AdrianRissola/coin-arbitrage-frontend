const FIELDS = [
	'protocolVersion',
	'runId',
	'token',
	'fixtureDigest',
	'backendRevision',
	'frontendRevision',
	'restEndpoint',
	'websocketEndpoint',
	'origin',
	'mongoUri',
	'containerId',
	'ownerLabel',
];
const HASH = /^[a-f0-9]{64}$/;
const REVISION = /^[a-f0-9]{40}$/;
const RESERVED_PORTS = new Set([3000, 3001, 27017]);

const testUrl = (value, protocol, label) => {
	let url;
	try {
		url = new URL(value);
	} catch {
		throw new Error(`Invalid test ${label}`);
	}
	if (
		url.protocol !== protocol ||
		url.hostname !== '127.0.0.1' ||
		url.username ||
		url.password ||
		url.search ||
		url.hash ||
		Number(url.port) < 1024 ||
		RESERVED_PORTS.has(Number(url.port))
	) {
		throw new Error(`Invalid test ${label}`);
	}
	return url;
};

const createTestEnvironment = ({ mode = 'offline', context, expected } = {}) => {
	const offline = {
		NODE_ENV: 'test',
		TEST_TRANSPORT_MODE: 'offline',
		TEST_RUN_TOKEN: '',
		TEST_RUN_CONTEXT: '',
		REACT_APP_API_REST_ENDPOINT: 'http://127.0.0.1:1/',
		REACT_APP_WEB_SOCKET_ENDPOINT: 'ws://127.0.0.1:1/',
		MONGO_DB_URI: '',
		MONGO_DB_URI_TEST: '',
		LOCAL_ALLOWED_ORIGINS: '[]',
		PROD_ALLOWED_ORIGINS: '[]',
	};
	if (mode === 'offline') return Object.freeze(offline);
	if (mode !== 'real-loopback') throw new Error('Unknown transport mode');
	if (!context || !expected) throw new Error('Trusted controller expectations are required');
	FIELDS.forEach(field => {
		if (context[field] !== expected[field]) {
			throw new Error(`Controller expectation mismatch: ${field}`);
		}
	});
	if (
		context.protocolVersion !== 1 ||
		FIELDS.some(field => field !== 'protocolVersion' && typeof context[field] !== 'string') ||
		!/^[A-Za-z0-9_-]{1,40}$/.test(context.runId) ||
		!HASH.test(context.token) ||
		!HASH.test(context.fixtureDigest) ||
		!HASH.test(context.containerId) ||
		!REVISION.test(context.backendRevision) ||
		!REVISION.test(context.frontendRevision) ||
		context.ownerLabel !== context.runId
	) {
		throw new Error('Invalid test run context');
	}
	const rest = testUrl(context.restEndpoint, 'http:', 'REST endpoint');
	const websocket = testUrl(context.websocketEndpoint, 'ws:', 'WebSocket endpoint');
	const mongo = testUrl(context.mongoUri, 'mongodb:', 'MongoDB URI');
	if (
		rest.pathname !== '/' ||
		websocket.pathname !== '/' ||
		rest.port !== websocket.port ||
		mongo.port === rest.port ||
		mongo.pathname !== `/testfoundation_${context.runId}`
	) {
		throw new Error('Invalid test endpoint paths or ports');
	}
	let origin;
	try {
		origin = new URL(context.origin);
	} catch {
		throw new Error('Invalid test browser origin');
	}
	if (
		origin.protocol !== 'http:' ||
		!['localhost', '127.0.0.1'].includes(origin.hostname) ||
		origin.origin !== context.origin
	) {
		throw new Error('Invalid test browser origin');
	}
	return Object.freeze({
		...offline,
		TEST_TRANSPORT_MODE: mode,
		TEST_RUN_TOKEN: context.token,
		TEST_RUN_CONTEXT: JSON.stringify(
			Object.fromEntries(FIELDS.map(field => [field, context[field]]))
		),
		REACT_APP_API_REST_ENDPOINT: rest.href,
		REACT_APP_WEB_SOCKET_ENDPOINT: websocket.href,
		MONGO_DB_URI: mongo.href,
		MONGO_DB_URI_TEST: mongo.href,
		LOCAL_ALLOWED_ORIGINS: JSON.stringify([context.origin]),
	});
};

module.exports = { createTestEnvironment };
