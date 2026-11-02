# Frontend paired integration

The dedicated consumer uses the actual services, Axios/XHR, native jsdom
WebSocket, App, notification provider and views. The default offline frontend
suite and its frozen helpers remain unchanged.

Set `BE_DIR` to the explicitly pinned backend integration checkout, `BE_SHA`
and `FE_SHA` to their full expected HEAD revisions and `RUN_DIR` to a new
artifact directory outside every registered worktree. Its parent must exist.

```sh
npm run test:fixtures -- --peer "$BE_DIR"
npm run test:int -- --backend-dir "$BE_DIR" \
  --backend-rev "$BE_SHA" --frontend-rev "$FE_SHA" \
  --flows all --image mongo:4.4.1 \
  --detect-open-handles --report-dir "$RUN_DIR"
```

`test:int:coverage` runs the same pair with coverage. The frontend launcher
binds this checkout and delegates to the backend coordinator; it does not
accept a different `--frontend-dir`. No dependencies/images are downloaded.

The backend must have the accepted B6 overlay plus INT, existing lockfile
dependencies and a cached Mongo 4.4.1 image with local Docker. Fresh Docker and
provider-listener validation precede native transport authorisation.
The run never uses an existing MongoDB or frontend/backend service.

Authoritative provider ownership, full pin table, flags, cleanup and CI handoff
are in the paired backend's `docs/testing/integration-plan.md`.
Use its native controls before the paired command. Existing B6/F5 workflows
are unchanged; no GitHub execution or clean published revision is claimed.

Upload only reports, observations and coverage, never whole run directories:
authorization JSON, private mailboxes and home/tmp/cache are excluded.
All source changes remain uncommitted test/documentation overlays.
