# Signal Foundry 1.1.0 Container Release

## Contents

Six cooperative rooms, including Conveyor Handoff with its dedicated blue belt, route-clearance safety and locked delivery dock. Includes improved crate guidance, explicit relay/gate labels, safe gate departure, compact menus, level selection, team messages above robots and optional sound effects.

## Release gate

The Docker build passed all 94 regressions. The GitHub release workflow passed the runtime smoke check before publishing: non-root process, minimal files, health and browser modules, secure session cookies, all six levels, two real WebSocket seats completing rooms four and six, replay and exit. The local container also passed and its Docker health status was healthy. Publication from `v1.1.0` succeeded; anonymous registry access was verified. Immutable provenance is recorded in [release evidence](../releases/v1.1.0.json).

Published digest: `ghcr.io/lucaslee1234/signal-foundry@sha256:85ae8db2b1c9b1cad0c2313d04a6de8baf7a673c4ef9431e2cc7a3ea84d7cc77`.

Local image: `signal-foundry:1.1.0`. Portable archive: `releases/signal-foundry-v1.1.0.tar`, 80,573,952 bytes; import with `docker load --input releases/signal-foundry-v1.1.0.tar`. The archive stays local rather than being committed to GitHub. Local image identity differs from the registry digest because the builds contain independent attestations; both record the same source commit.

## Azure settings

Use `ghcr.io/lucaslee1234/signal-foundry:1.1.0`, or the verified immutable digest from the release evidence. Linux AMD64; external HTTP ingress with target port 3000. Keep minimum and maximum replicas at 1 and one serving revision. Preserve `APP_ORIGIN=https://signal-foundry.victoriousmushroom-f0174aa0.westus2.azurecontainerapps.io` with no trailing slash. The image defaults to `HOST=0.0.0.0`, `PORT=3000` and `GAME_MODE=foundry`.

The image contains no test origin in its defaults. The synthetic origin used by smoke testing is supplied only to a disposable test container.

Updating the Azure image replaces the in-memory server and ends current rooms. Existing Azure Express environments do not support a custom revision suffix. After the user updates the image, check readiness and two-player browser play through the public HTTPS URL. This release preparation does not change Azure resources or deploy the application.

Rollback is available with the previous immutable 1.0.0 image. That image contains the older four-room game; do not overwrite its tag or digest.
