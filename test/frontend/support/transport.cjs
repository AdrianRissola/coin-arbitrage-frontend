const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {
  createTestEnvironment,
} = require('../../../src/test/integration-contracts/context.cjs');

const authorizationName = 'frontend-authorization.json';
const createAuthorization = async (transport = {}) => {
  const mode = transport.mode || 'offline';
  if (mode === 'offline') {
    return Object.freeze({
      protocolVersion: 1,
      profile: createTestEnvironment(),
    });
  }
  const context = Object.freeze({ ...transport.context });
  createTestEnvironment({ mode, context, expected: { ...context } });
  if (typeof transport.verifyOwnership !== 'function') {
    throw new Error(
      'Real loopback requires the trusted controller ownership verifier'
    );
  }
  const expected = await transport.verifyOwnership(context);
  if (expected === context)
    throw new Error('Independent controller expectations are required');
  const profile = createTestEnvironment({ mode, context, expected });
  const manifest = path.resolve(
    __dirname,
    '../../../src/test/fixtures/contracts/v1/manifest.json'
  );
  const digest = crypto
    .createHash('sha256')
    .update(fs.readFileSync(manifest))
    .digest('hex');
  if (context.fixtureDigest !== digest)
    throw new Error('Controller fixture digest mismatch');
  const canonical = JSON.parse(profile.TEST_RUN_CONTEXT);
  return Object.freeze({
    protocolVersion: 1,
    profile,
    context: canonical,
    expected: Object.fromEntries(
      Object.keys(canonical).map((field) => [field, expected[field]])
    ),
  });
};

const readAuthorization = (root) => {
  const filename = process.env.FE_TEST_AUTHORIZATION;
  if (!filename) {
    if (
      process.env.TEST_TRANSPORT_MODE &&
      process.env.TEST_TRANSPORT_MODE !== 'offline'
    ) {
      throw new Error(
        'Real loopback requires a controller authorization record'
      );
    }
    return createTestEnvironment();
  }
  const target = fs.realpathSync(filename);
  if (target !== path.join(root, authorizationName)) {
    throw new Error('Authorization record must be in the owned run directory');
  }
  const record = JSON.parse(fs.readFileSync(target, 'utf8'));
  if (record.protocolVersion !== 1)
    throw new Error('Unsupported frontend authorization');
  const profile =
    record.profile.TEST_TRANSPORT_MODE === 'offline'
      ? createTestEnvironment()
      : createTestEnvironment({
          mode: record.profile.TEST_TRANSPORT_MODE,
          context: record.context,
          expected: record.expected,
        });
  if (JSON.stringify(profile) !== JSON.stringify(record.profile)) {
    throw new Error('Frontend authorization profile mismatch');
  }
  return profile;
};

module.exports = { authorizationName, createAuthorization, readAuthorization };
