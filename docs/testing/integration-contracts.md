# Frontend paired contract coverage

Consumers are `src/test/integration-contracts/transport.test.js` and
`frontend/app/paired.test.js` beneath the same directory. The latter is one
sequential multi-flow test; it is not a replacement for isolated F1–F5 cases.

| Flow | Real consumer observation |
| --- | --- |
| REST | Markets/tickers/history JSON and import-time storage through installed Axios/XHR; actual array-query bytes and no-data variants |
| Startup | Upper-case initial BTC-USDT request, native welcome, Alpha/Gamma BUY 80/SELL 125 and 36%; lower-case navbar request is preserved |
| Selection | Rendered ETH-USD control, actual 37.5%; genuinely older native events cannot roll back the displayed pair |
| Best | Request `all`, response `ALL`, literal quote-group payload; USDT control changes the visible selected opportunity |
| Historical | Real subset request, fixed IDs/dates and card order; all omits params; BTC-USD empty subset has no invented fallback; incoming frames do not leave Historical |
| Markets | `Markets` request without ticker, `markets` response, real REST metadata, 3/0 then 2/1 connection counts and literal host/reason |
| No-data/close | All active feeds close after a real subscription response; unavailable UI and empty prices reflect actual null output; server close does not itself create another socket |

Generated persisted IDs, ISO dates, version and numeric fields are checked
separately from fixed historical fixtures. The complete literal matrix is in
the paired backend's `docs/testing/integration-contracts.md`.

Native instrumentation delegates construction/send/close and never supplies
invented payloads, readyState or App state. Only delivery timing of already
received stale native events is controlled. Real event/timer callbacks use
React act. Test-owned pooled TCP sockets and timers are cleaned explicitly.

Current quirks remain: subscription matching is case-sensitive, returning to
arbitrage can reopen feeds, close alone does not rerender App and App unmount
does not own complete transport disposal. Stale display protection is not a
claim about every internal subscription field.

Known exact App warnings remain visible under the frozen diagnostic policy.
Unexpected diagnostics are failures. jsdom does not establish real-browser
layout, CDN dropdowns, deployment proxies or live exchange behaviour.
