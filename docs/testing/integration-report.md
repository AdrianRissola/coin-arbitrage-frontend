# Frontend paired integration results

Workspace: `/Users/adrian.rissola/.devin/integration-20261101T175618Z/`.
The paired backend's integration report contains the full evidence/limits.

- `i1-real-frontend-clean` and `i1-real-frontend-repeat`: 2/2 transport tests each.
- `i2-all-fixed`, `i2-all-repeat`, `i2-all-final`: full selected matrix passes.
  Each invocation has 2 transport tests and 1 sequential App flow test.
- `i3-coverage`: public frontend coverage launcher passes the complete pair.
- All accepted consumer stages have zero actual Jest open handles.
- A real failing frontend assertion after owned provider readiness retains
  child exit 1 while backend/container cleanup succeeds.

The coverage run uses Node `v25.2.1`, React `18.2.0`, CRA `5.0.1`, Axios `1.6.5`,
Jest `27.5.1` and RTL `13.4.0`.

| Profile | Statements | Functions | Branches |
| --- | --- | --- | --- |
| Transport | 31/598, 5.18% | 10/179, 5.59% | 1/318, 0.31% |
| Real App flows | 454/598, 75.92% | 126/179, 70.39% | 167/318, 52.52% |

Metrics are per consumer, not merged with each other or the F1–F5 profile.
The backend's native V8 metric has a different loaded-script denominator and
must not be presented as equivalent statement coverage.

Full manifests record expected/actual revisions, dirty overlay hashes, frozen
core checks, primary/isolated lock hashes, unchanged production-source hashes,
actual bindings and cleanup. These are uncommitted overlay executions,
**not clean commit validation**. Checkpoints and final audits are private
workspace artifacts outside both repositories.

No production source, dependency or lockfile changes, staging, commits or
pushes are included. Fourteen prior worktrees and existing Docker resources
were preserved at the I2 audit; the final audit is recorded separately.

No GitHub CI, real browser, public proxy or live exchange run is claimed.
Strict frontend CI build still fails on the five unchanged baseline warnings.
Exact known App render/class/key warnings remain visible; they were neither
fixed nor broadly suppressed.
