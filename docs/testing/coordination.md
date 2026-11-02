# Test Foundation Coordination Interface v1

## Commands

From either repository's dedicated bootstrap worktree:

```sh
npm run test:bootstrap
npm run test:fixtures
npm run test:fixtures -- --peer "/absolute/path/to/the/other/repository"
```

The first two commands are independent of the sibling repository. They use
Node built-ins, not installed application dependencies. The optional paired
check requires the other repository, rejects same-side comparisons and verifies
byte-identical JSON plus the checksummed shared helpers.

These are bootstrap checks, not application regression or integration tests.
C0-only worktrees retain their original default test commands. This frontend F1
worktree uses the guarded CRA runner documented in `frontend-runner.md`.
Do not run legacy backend Jest against an existing database or run builds in
the original checkouts.

## Shared Ownership And Locations

| Item | Backend | Frontend |
| --- | --- | --- |
| Canonical/replicated literals | `test/fixtures/contracts/v1/` | `src/test/fixtures/contracts/v1/` |
| Shared test-only helpers | `test/integration-contracts/` | `src/test/integration-contracts/` |
| Interface documentation | `docs/testing/coordination.md` | Same relative path |

INT owns both fixture/helper copies. Coordination owns serialized package-script
and documentation edits. BE and FE consume the shared files read-only and own
their separate regression suites. No default command requires a sibling checkout.

`manifest.json` records source revisions and SHA-256 checksums for all 15 payload
files and four shared CJS files. Its own SHA-256 is the catalogue digest. It is
not a claim that the application revisions have passed provider/consumer tests.
Do not silently regenerate expectations from application output. A reviewed
fixture/interface change updates both copies, hashes and version declaration.

## Literal Profiles And Comparison Rules

- `seed.json` separates Currency records from the legacy API ticker flags.
  Preserve the listed currency insertion order when preparing manager state.
- `markets.json` is the REST metadata response, including the currently empty
  REST ticker arrays. Synthetic `.invalid` hosts must never be contacted.
- `available-tickers.json` is the Currency-derived four-pair response, with its
  current insertion order and descriptions.
- `market-prices.json` contains financial calculation/feed inputs, not the REST
  priced-ticker DTO. Alpha/Beta/Gamma BTC-USDT prices are 80/100/125.
- `arbitrages.json` contains the literal descending-profit BTC-USDT response:
  profits 45/25/20, percentages 36/20/20. Percentage uses the sell-price
  denominator, not conventional return-on-buy-cost.
- `historical-arbitrages.json` is the two-ticker result for the matching subset:
  BTC-USDT then ETH-USDT by date. Seed the explicit parent/transaction IDs and
  dates before exact comparisons. Single-ticker queries select their matching
  documents; `historical-empty.json` is a separate empty-result case.
- WebSocket files preserve the welcome shape, echoed ticker, uppercase data
  keys, alphabetical pair keys and quote-group best-arbitrage structure.
  `ws-markets.json` describes a later Gamma-disconnected state, not the same
  connected-price snapshot as the arbitrage files.
- `requests.json` distinguishes initial uppercase and navbar lowercase tickers,
  `bestArbitrage`/`all` and `Markets` without a ticker. Responses remain
  `bestArbitrage`/`ALL` and lowercase `markets`. No unsubscribe event is added.
- History array query strings are literal installed-Axios 1.6.5 results.
  Null/absent parameters omit the query string; this does not establish their
  database result semantics or mean "all history".
- `errors.json` and `no-data.json` are context-specific source-derived
  expectations, not a universal error schema. Empty best-arbitrage processing,
  hangs and malformed-JSON engine text are not invented as successful JSON.

Clone inputs before passing them to production code that sorts or mutates them.
Expected response literals must remain independent of provider output.

Dates equal `2024-01-02T03:04:05.000Z` only with a controlled clock or matching
seed. In real-clock runs, explicitly validate ISO date fields at arbitrage
`date` paths without loosening any financial, ordering or casing assertion.
Seeded historical IDs/dates remain exact. Unseeded generated IDs require explicit
format assertions, not blanket removal of `_id` or other fields.

## Test Environment API

`context.cjs` exports:

```js
createTestEnvironment()
createTestEnvironment({ mode: 'real-loopback', context, expected })
```

The returned frozen object is an environment patch. The caller must apply it
before app imports. It does not load dotenv, mutate `process.env`, open resources
or install networking/mocking guards.

Default `offline` uses synthetic port-1 public endpoints, clears MongoDB/run
values and permits no origin. B1/F1 must separately install fail-closed Node,
Axios/XHR and browser WebSocket controls before import-time side effects.
Sentinel endpoints alone are not network isolation.

`real-loopback` requires an independent trusted controller record in `expected`.
Never authorize real operations with `expected: context`. The controller first
verifies its live bound listeners and exact Docker container ID/ownership label.
Only then may it supply expectations to this data validator.

The flat context schema is declared in `harness-interface.json`:

| Fields | Required representation |
| --- | --- |
| `protocolVersion` | Number `1` |
| `runId`, `ownerLabel` | Same 1–40 character ASCII alphanumeric/underscore/hyphen run ID |
| `token`, `fixtureDigest`, `containerId` | 64 lowercase hexadecimal characters; minted token, pinned digest and actual owned container ID |
| `backendRevision`, `frontendRevision` | Full 40-character source commit IDs |
| `restEndpoint`, `websocketEndpoint` | `http`/`ws`, literal `127.0.0.1`, same owned nonprivileged port, root path, no credentials/query/hash |
| `origin` | Exact local HTTP origin, such as `http://localhost:3000`; metadata, not a connection target |
| `mongoUri` | Credential-free `mongodb` URI on another owned loopback port; database `testfoundation_<runId>` |

Application/database ports 3000, 3001 and 27017 are rejected as resource targets.
The validated context is serialized as JSON in `TEST_RUN_CONTEXT`; the token is
also in `TEST_RUN_TOKEN`. Only public endpoint values use `REACT_APP_` names.
Errors identify invalid fields without printing URI credentials.

This validates context data, not ownership, liveness or transport isolation.
Actual guards belong to B1/F1; container lifecycle and label checks belong to
B5. The native self-tests use synthetic context records and start no servers.

## Future Runner Handoff

The controller creates resources first, verifies readiness, then supplies the
validated context and independent expectations to BE/FE consumers. B5 owns the
Mongo URI, exact ID/label, driver-ready handshake, isolated seeds and exact-ID
cleanup. INT owns real listener discovery, frontend invocation and controlled
raw exchange-feed delivery through existing adapter callbacks.

Test-runner readiness/feed/shutdown communication is private harness IPC, never
a new application endpoint or WebSocket channel. Readiness is emitted only after
the database seed, manager state and bound listeners are usable. Feed injection
identifies the run and synthetic exchange host and delivers the raw UTF8 payload;
it must not replace calculated/provider responses with fixture-returning stubs.
Shutdown closes consumers, feeds, listeners, timers and only the owned container.
Every wait is bounded, and cleanup cannot overwrite an earlier failure.

Paired acceptance requires full BE/FE revisions, clean reviewed harness commits,
fixture digest, installed-version/runtime provenance and cleanup evidence.
Uncommitted bootstrap overlays are exploratory evidence, not release validation.

## Self-Test Artifacts

`TEST_BOOTSTRAP_TMPDIR` optionally selects an existing owned directory for
negative-test fixture copies. Otherwise the OS temporary directory is used.
Unique copies are retained for inspection; originals and canonical fixtures are
never changed by those tests. No network, database, container, application
startup, build or dependency installation occurs.

## INT v1 Controller Handoff

The accepted B6/F5 snapshots are consumed read-only. INT source preflight pins
both full base revisions, original overlay digests, immutable file cores and
canonical packages. It verifies fixture parity before creating infrastructure.
Only new INT paths, this coordination guide and the two coordinated INT npm
aliases are outside those immutable cores. Actual working overlays are hashed
separately. Until commits are authorised, evidence is base-plus-overlay
compatibility evidence, not clean-commit or published CI/release acceptance.

C0's unchanged resource label is `ai.devin.testfoundation.run`; its database is
`testfoundation_<runId>`. An INT-owned allocator adds that run label alongside
the accepted B5 nonce/root/scope labels, creates only a fresh cached-image,
read-only/tmpfs container and reuses B5's strict ownership verification. It does
not widen the accepted B5 `be_test_*` capability or edit either support interface.
Live verification must match image/ID/name/labels/mounts, a running container and
one random loopback binding before a child is authorised.

Provider readiness is private IPC after real database seeds, cache events and
HTTP/WebSocket binding. The receipt includes the actual owned child PID, nonce,
run ID, bound IPv4 address and port. A fresh receipt and fresh Docker inspection
produce independent frontend expectations. Context validation alone is not
proof of live ownership. The synthetic origin is `http://localhost:3000`; no
connection to an existing service at that address is required or permitted.

The version-one control envelope is `{version, id, token, action, args}`.
`id` is 32 lowercase hex characters and `token` is the issued private 64-character
nonce. Actions are `status`, `snapshot`, `feed`, `disconnect` and `close-browser`.
Arguments are an object, not arbitrary executable/provider method names.
Frontend requests use event-driven files named `int-rpc-<id>.request.json`
inside their owned report directory; the controller forwards them over its
owned child IPC and returns matching response files. No test HTTP route,
application readiness API, second frontend network port or ambient URI is added.
Requests, responses and readiness have bounded deadlines; private capability
files are not public artifact-upload targets.

The explicit flow set is `rest,arbitrage,ticker,best,historical,markets,error`;
`all` selects that exact ordered set. Unknown/empty/duplicate selections fail.
Backend scheduling remains real. Provider output is observed, never replaced
with fixture responses. Frontend uses the guarded real-loopback runner, native
XHR/WebSocket and real services/App/views. App consumers live in the INT-owned
`frontend/app` category so existing exact App-diagnostic checks still apply;
unexpected diagnostics remain failures without replacing the console guard.

INT consumer commands are documented in `integration-plan.md`, executed
contracts in `integration-contracts.md` and measured results/limits in
`integration-report.md`. The frontend npm launcher requires an explicit pinned
backend peer and keeps this checkout as the frontend. Open-handle measurement
is mandatory; private authorisation/control records are not public artifacts.
