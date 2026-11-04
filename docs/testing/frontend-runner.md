# Frontend Test Runner

## Local Commands

From the reviewed frontend feature worktree with the existing dependencies:

```sh
npm test
npm run test:services
npm run test:ui
npm run test:components
npm run test:app
npm run test:lifecycle
npm run test:coverage
npm run test:handles
npm run test:lint
npm run test:fixtures
npm run test:all
npm run test:ci
```

No installation, backend, browser server, MongoDB, Docker or credentials are
needed for the default offline profile. The original checkouts do not contain
these uncommitted feature-worktree changes.

`test` runs the F1 services, F2 component/view, F3 App and F4 lifecycle profiles followed by C0 bootstrap, isolated
Node security and harness checks. `test:services` selects only the service
profile. `test:ui` selects only F2 component/view tests; `test:app` selects only F3 App tests.
Use the default command to include native safety/failure controls. Coverage instruments application JavaScript, not test support or
native VM checks. Open-handle diagnostics do not force process exit.

The runner creates a fresh `coin-arbitrage-fe-*` directory under the OS temporary
directory. Each owns its HOME, cache, temporary fixture copies and reports.
Use a test-owned temporary parent when scripting runs. An optional
`--report-dir /existing/owned/parent/new-run` must name a new destination.

`report.json`, `loaded-configuration.json`, stage logs and optional coverage
are retained there. Existing destinations are not overwritten. Empty,
all-skipped, missing-result, failed and timed-out suites are not green.

## CRA And Axios Configuration

The runner invokes the installed CRA test entry and verifies its actual loaded
jsdom environment, `src/setupTests.js`, CRA Babel transformer and
`resetMocks: true`. It verifies the Axios-only transform whitelist too.
There is no Axios mock, Node-build alias, dependency upgrade, ejection or
production `.babelrc` change.

Jest 27 probes Watchman at module initialisation even when disabled. A guarded
framework preload marks that exact capability unavailable without executing a
command, then restores the shell guard before application imports. The CLI's
supported `haste.forceNodeFilesystemAPI` option disables its native `find`
probe. A negative control proves the same Watchman command remains forbidden
after framework startup. No watcher or external crawler is started.

`src/setupTests.js` retains jest-dom and installs fail-closed XHR, fetch and
WebSocket controls before services. Node preload guards cover sockets, DNS, UDP,
dotenv reads, unowned writes and unguarded child processes. Caught attempts are
sticky failures. Public endpoints and browser storage reset per test.

The service harness loads a fresh coupled service/Axios module instance without
resetting a shared React instance. It reinstalls adapters and spies inside each
test, after CRA resets mocks. The real Axios client builds and serialises
requests; a controlled adapter supplies JSON responses or real AxiosErrors.
Deferred responses and observed storage writes replace timing sleeps.

## INT Transport Interface

`test/frontend/run.cjs` exports `run(options)`. The standalone CLI only provides
offline/all/services/ui/components/app/lifecycle profiles; real integration requires the programmatic interface:

```js
await run({
  suite: 'integration',
  testPaths: absoluteIntOwnedTestPaths,
  transport: {
    mode: 'real-loopback',
    context: selectedRunContext,
    verifyOwnership: async frozenContext => independentlyVerifiedExpectations,
  },
});
```

Paths must be within `src/test/integration-contracts/`. The trusted INT controller
must independently verify live container labels, bound listeners and run-token
ownership before returning its expected C0 record. F1 does not discover or
create those resources. No CLI ambient mode/context enables real transport.

The parent validates C0 fields, local fixture digest, endpoints and token before
minting an owned private authorization record. Child and jsdom guards accept
only that controller's numeric loopback port, not DNS, TLS, arbitrary listeners
or another database port. Missing or mismatched authorization fails closed.
Positive F1 policy tests use synthetic receipts and open no endpoint; they are
not real resource-ownership or wire-compatibility validation. I1 must exercise
this interface against actual owned infrastructure.

These JavaScript guards are not an adversarial OS sandbox. The exercised host
is macOS ARM64; Windows process-tree cleanup and every timeout-escalation path
are not validated.

## Characterisations And Remaining Gaps

Tests preserve GET paths, literal slash concatenation and import-time endpoint
capture; ticker array, null and omitted query forms; response identity/data and
both import-time cache writers. FE-02 makes historical requests log and reject
with the original error, while the import-time cache writer contains that
rejection and leaves cached data unchanged. The historical view stops loading,
removes stale rows, displays a generic error and permits Find to retry.

Market import rejection still produces an unhandled `.data` follow-up TypeError.
Historical import/view/App subprocess controls instead require successful error
handling and natural zero exits; unrelated failure controls remain enabled.

## Component And View Profile

F2 renders actual cards, collections, prices/status widgets, filters and the four
views with the installed React Testing Library and user-event. It never imports
App, creates a socket or starts a browser server. The normal React instance is
retained while real services load after a controlled real-Axios adapter is
installed. Import readiness observes actual storage writes; response gates and
DOM queries replace sleeps. Per-test adapters verify requests and consumed plans,
restore the original adapter and reject unexpected traffic through the existing
sticky guard. RTL cleanup unmounts real trees.

The installed RTL and user-event resolve different DOM-testing-library copies.
The UI helper configures the latter's public event-wrapper hook with RTL `act`,
preserving callback results, then restores its original value. No dependency
replacement, shared React reset or component/state mock is used.

Prefer roles, visible text and scoped lists/rows. Tooltip descriptions currently
provide some radio names. Duplicate checkbox IDs and misassociated quote labels
remain unchanged: scoped list-item queries exercise the actual input, with an
additional case protecting the current incorrect USD-label/USDT-checkbox action.
Narrow attribute queries locate non-semantic card headers and scrolling strips.
This does not prove Bootstrap's external dropdown plugin, real pixel layout or
browser scrolling. A per-element scrollBy spy tests only the existing API call.

Characterisations include literal locale rounding, zero/string/negative profits,
unconditional best-card filter bypass, quote-first selection and ties, in-place
price-order effects, historical loading/empty/null behaviour, count-only
all-tickers requests and the sort-option/primary-button mismatch. Missing
metadata and raw-object children retain their local render failures. The
render-failure helper accepts only the expected error/React boundary diagnostics,
rather than suppressing unrelated console errors. FE-01 now renders
"No arbitrages available" for empty best data, including null/absent inputs.
A removed quote retains its selection and shows no data rather than switching
currencies; choosing Best or receiving that quote again restores the cards.

Separate guarded subprocess cases render actual Historical, MarketStatus and
Arbitrage views under rejected responses. Historical probes require the FE-02
error state and recovery; other view probes retain their source-specific
unhandled failures. No global unhandled-rejection suppression is installed.

The unchanged `src/App.test.js` scaffold's obsolete “learn react” assertion is
outside the active profiles. Step A retains its raw Axios/Jest parse failure and
controlled absent-link diagnostic. Its replacement coverage is the real App
navbar/initial-subscription/data-state cases under `src/test/frontend/app/`,
not another scaffold assertion or a stubbed App. The original is dormant,
not silently presented as a passing test.

## App State And Socket Consumption Profile

F3 renders actual App, navbar, view builders, views and services under the real
notistack provider. The test shell allows five queued notifications so state
transitions remain observable; it does not validate production queue eviction,
visual placement or real transition timing. The existing enqueue-during-render,
invalid-class and missing-key React warnings remain visible and unfixed.

App alone is loaded in a fresh isolated module graph per case to reset its
module-scoped socket/status, without resetting the shared React instance.
React, notistack and ViewBuilder resolve to their actual already-initialised
exports. No App state setter, hook, notification API, controller or view is
substituted. A separate remount case deliberately retains the same App module
to expose its actual cross-mount state.

Real Axios uses the F2 controlled adapter. A test-owned socket captures actual
send strings and dispatches public open/message/error/close events. Its endpoint
must equal the guarded public test endpoint. No native socket, listener, backend,
database, credentials or server are required. Shared literal welcome, arbitrage,
best, markets and no-data messages enter through MessageEvent data and are parsed
by production code. Ticker, stale/missing-shape and rejection variants are
test-private copies; frozen INT fixture bytes are unchanged.

The event adapter delegates to a document-owned DocumentFragment, not a bare
custom EventTarget: the installed JSDOM silently swallows callback exceptions
without an owning window. Property replacement detaches previous listeners and
binds the real handler to the controlled socket. Native negative controls require
the exact App malformed-JSON, missing-best and non-array-prices errors, so a
window-less false green is rejected. The adapter models the data callbacks used
by App, not native event target identity, a wire handshake or socket buffering.

Initial uppercase requests, lowercase navbar requests, capital `Markets` without
a ticker and uppercase `ALL` responses are characterised as-is. State tests cover
acknowledgement-dependent duplicates, ticker changes, actual view/card/price
updates, stale data, ignored channels, pause before JSON parsing, history
loading/empty/resume and error banners. BE-07/FE-01 empty best frames use the
normal `bestArbitrages.arbitragesData: []` envelope, remove stale cards/prices
and recover on subsequent data without resubscribing. Event-handler and
rejected-history failures outside this fix run in bounded subprocesses
whose parents require matching errors and source frames in the same structured
Jest failure (not an unrelated console warning) and natural nonzero exits, not a
timeout or policy error. A wrong initial-request oracle is also rejected.

FE-03 clears the market-price error banner when a matching arbitrage frame
supplies prices or a best-arbitrage frame supplies its data array. Valid empty
price/best arrays also clear it. Unrelated ticker/channel messages do not clear
a still-unrecovered error; missing-price messages retain their existing behaviour.

Open/close events do not themselves rerender App. Notifications observe status
on a subsequent render; a closed socket is replaced during that render before a
CLOSED notification can appear. There is no claimed autonomous reconnect or
unsubscribe. History can still cause a render-triggered reconnect to resend the
last request while consumption remains paused.

App unmount does not close its module-scoped socket or detach handlers.
Same-module remount reuses an open socket/status, does not resubscribe and starts
with fresh component data. These are asserted before test-owned cleanup.
RTL unmounts all trees, test-owned scopes cancel notification/transition timers, adapters verify
completed/consumed plans and restore, and socket leases explicitly remove
handlers, close controlled instances and restore the original guarded global.
JavaScript fakes are not evidence of real browser resource cleanup.

Real browser layout/plugins, native socket lifecycle/wire, source startup,
real HTTP/CORS and paired BE-FE flows remain unvalidated. Windows process-tree
cleanup and every deadline escalation branch are still unvalidated.

## Resource Lifecycle And Diagnostics

`test:lifecycle` selects the F4 resource/locale cases. They also run in the
listener-free default. Each child has explicit UTC, en-US locale variables and
fixed numeric/date expectations rather than relying on the host defaults.

Actual App unmount omissions are asserted before `cleanupApps`. The test-only
cleanup API unmounts actual trees, detaches property and direct socket listeners,
closes controlled sockets and restores nested guarded globals in reverse order.
Listener registration tracks type/callback/capture identity, including duplicate
registration. Cleanup is idempotent and late dispatched events cannot recreate
the old App tree.

App scopes own their notification/transition timeout handles through delegating
wrappers around the existing JSDOM functions. Cleanup cancels only handles created
inside those scopes and restores original timer functions. Pending adapter
operations/plans are still asserted separately; cancelling a timeout cannot turn
an unresolved request into a pass. This does not claim production unmount closes
a native socket or that native browser timer/resource semantics were tested.

Console warn/error diagnostics remain visible. A guard rejects unexpected
diagnostics and replacement of that guard, including warnings logged by otherwise
passing assertions. Only exact existing render-phase, class/className and
BestArbitrageView key warnings are accepted in their real app/view/lifecycle
files and enumerated negative rendering fixtures. Expected render failures remain locally checked by their existing helper.
Source-specific error diagnostics are accepted only in their bounded negative
fixtures, whose parents still require actual nonzero failure/source evidence.
Matching a component name alone is insufficient to allow a new warning.

Four native controls demonstrate unexpected warn/error/new-App-warning failures
and document-owned callback exception visibility. They do not suppress unhandled
rejections or install a global window error handler that changes Jest's own error
propagation. Diagnostic guards remain in the isolated Jest environment until its
teardown, so late cleanup diagnostics remain sticky rather than being hidden.

The default partitions native controls into four disjoint groups: core/accounting,
App failures, service/view failures and diagnostics. Each retains the same 90-second
deadline; the probe deadline remains 30 seconds. Selection is explicit through
disjoint native file lists. Reports distinguish discovered, skipped and selected cases
so older Node versions that report filtered cases as skipped cannot count them
as passes. Exit-zero, incomplete, all-skipped and timed-out output remain failures.

## Consumer Behaviour And Legacy Accounting

| Boundary | Executed standalone coverage | Not established |
| --- | --- | --- |
| Three REST services | 27 real-Axios request/serialization/response/import-storage cases | Actual backend HTTP/CORS or production URLs |
| Components and views | 84 RTL/user-event cases for cards, collections, filters, sorting, loading, empty and error behaviour | Browser pixel layout, external dropdown plugins or accessibility correctness |
| App and socket messages | 39 real-App cases for subscription strings, channel consumption, navigation, pause/resume, banners and notifications | Native socket handshake/reconnection or provider wire compatibility |
| Fixture lifecycle and locale | Eight cases for observed omissions, owned cleanup and fixed expectations | Automatic production cleanup or native browser resource semantics |
| Native controls | Bootstrap/security/guard/failure controls and five result-accounting checks plus four diagnostics controls | Additional application statement coverage |

The original `src/App.test.js` assertion is preserved but dormant. Its failed
Step A diagnostic is not reclassified as passing. Real navbar/subscription/data
cases supersede the obsolete scaffold; original isolated security cases remain
executed. The frozen C0 fixture catalog is unchanged and parity can be checked
explicitly without starting paired integration. Literal matching on both sides
does not itself establish real BE-FE compatibility.

## Commands, Artifacts And CI Handoff

`--suite components`/`test:components` aliases the existing `ui` selection.
`--suite all`/`test:all` aliases the offline default, including lifecycle and
all disjoint native groups. Existing services/ui/app/lifecycle commands remain
valid. `test:ci` selects all with coverage and open-handle diagnostics. All of
these commands remain independent of a backend, Docker or a browser server.

Each coverage run retains HTML, LCOV, full JSON, JSON summary and a text summary
in its owned report directory. Application coverage is separate from native
failure controls and does not imply protection for every branch or browser flow.
The existing runner guide is the consolidated test plan/consumer matrix and
handoff; exact commands, result JSON, immutable overlay hashes and coverage are
retained by the coordinator rather than adding separate plan/report documents.

The GitHub Actions regression workflow pins verified checkout/setup/upload action
commit IDs, read-only repository permissions and the exercised Node 25.2.1
runtime. It installs the unchanged lockfile, strictly lints test-owned files and
executes `test:ci`. Upload paths select only reports, coverage and logs, not
authorization records, dotenv files, HOME or dependency caches. YAML and local
commands are checked; no GitHub run, push or commit is implied by this overlay.
Other Node/LTS/platform combinations remain unvalidated.

Frontend build verification uses separate execution copies that exclude every
dotenv source, retain dependency versions, copy the path-sensitive react-dotenv
writer and own all cache/build/public output. Endpoints are synthetic and writes
outside the owned copy or outbound traffic fail the build guard. The actual
production build script is unchanged. Ordinary and strict-CI results are recorded
separately: existing warnings can pass the former and fail the latter. No
warning-suppression flag, dependency update or source fix is used to manufacture
a green build. The regression workflow is not a production release/build gate.
