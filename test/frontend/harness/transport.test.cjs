const test = require('node:test');
const assert = require('node:assert/strict');
const { createAuthorization } = require('../support/transport.cjs');

const context = {
  protocolVersion: 1,
  runId: 'f1_policy',
  token: 'a'.repeat(64),
  fixtureDigest:
    'f49812d1adc8d6e7efd83620db6f63d08c9b35884a217bbcb4189b31f2009e28',
  backendRevision: 'b8d1a6e685b7be0a5ec5ec93d2f652707e724e17',
  frontendRevision: '2c731ce387e3b4e0bbe5b0f2278c2e0eea7ada9b',
  restEndpoint: 'http://127.0.0.1:44220/',
  websocketEndpoint: 'ws://127.0.0.1:44220/',
  origin: 'http://localhost:44222',
  mongoUri: 'mongodb://127.0.0.1:44221/testfoundation_f1_policy',
  containerId: 'c'.repeat(64),
  ownerLabel: 'f1_policy',
};

test('default authorization is immutable offline data with no database or token', async () => {
  const { profile } = await createAuthorization();
  assert.deepEqual(
    {
      mode: profile.TEST_TRANSPORT_MODE,
      rest: profile.REACT_APP_API_REST_ENDPOINT,
      ws: profile.REACT_APP_WEB_SOCKET_ENDPOINT,
      token: profile.TEST_RUN_TOKEN,
      db: profile.MONGO_DB_URI,
      frozen: Object.isFrozen(profile),
    },
    {
      mode: 'offline',
      rest: 'http://127.0.0.1:1/',
      ws: 'ws://127.0.0.1:1/',
      token: '',
      db: '',
      frozen: true,
    }
  );
});

test('unknown transport cannot silently fall back to offline', async () => {
  await assert.rejects(
    createAuthorization({ mode: 'unknown' }),
    /Unknown transport mode/
  );
});

test('real-loopback selection requires the independent controller verifier', async () => {
  await assert.rejects(
    createAuthorization({ mode: 'real-loopback', context }),
    /ownership verifier/
  );
});

test('synthetic receipt tests policy only and never opens an endpoint', async () => {
  let calls = 0;
  const record = await createAuthorization({
    mode: 'real-loopback',
    context,
    verifyOwnership: (received) => {
      calls += 1;
      assert.equal(Object.isFrozen(received), true);
      return { ...context };
    },
  });
  assert.equal(calls, 1);
  assert.equal(record.profile.TEST_RUN_TOKEN, context.token);
  assert.equal(record.profile.TEST_TRANSPORT_MODE, 'real-loopback');
  assert.deepEqual(record.expected, context);
});

test('echoing the submitted context is not an independent receipt', async () => {
  await assert.rejects(
    createAuthorization({
      mode: 'real-loopback',
      context,
      verifyOwnership: (received) => received,
    }),
    /Independent controller/
  );
});

test('controller token mismatch is rejected', async () => {
  await assert.rejects(
    createAuthorization({
      mode: 'real-loopback',
      context,
      verifyOwnership: () => ({ ...context, token: 'b'.repeat(64) }),
    }),
    /expectation mismatch: token/
  );
});

test('a different valid-format fixture digest is not accepted', async () => {
  const different = { ...context, fixtureDigest: '0'.repeat(64) };
  await assert.rejects(
    createAuthorization({
      mode: 'real-loopback',
      context: different,
      verifyOwnership: () => ({ ...different }),
    }),
    /fixture digest mismatch/
  );
});

test('failed live ownership verification propagates instead of minting authorization', async () => {
  await assert.rejects(
    createAuthorization({
      mode: 'real-loopback',
      context,
      verifyOwnership: async () => {
        throw new Error('ownership not confirmed');
      },
    }),
    /ownership not confirmed/
  );
});

[
  ['remote host', { restEndpoint: 'http://synthetic.invalid:44220/' }],
  ['existing frontend port', { restEndpoint: 'http://127.0.0.1:3000/' }],
  ['existing backend port', { restEndpoint: 'http://127.0.0.1:3001/' }],
  [
    'existing Mongo port',
    { mongoUri: 'mongodb://127.0.0.1:27017/testfoundation_f1_policy' },
  ],
].forEach(([name, values]) => {
  test(`${name} is rejected before the controller verifier runs`, async () => {
    let called = false;
    await assert.rejects(
      createAuthorization({
        mode: 'real-loopback',
        context: { ...context, ...values },
        verifyOwnership: () => {
          called = true;
          return { ...context };
        },
      }),
      /Invalid test/
    );
    assert.equal(called, false);
  });
});
