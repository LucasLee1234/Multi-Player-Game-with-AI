# Signal Foundry 1.1.0 Container Release

## Contents

Six cooperative rooms, including Conveyor Handoff with its dedicated blue belt, route-clearance safety and locked delivery dock. Includes improved crate guidance, explicit relay/gate labels, safe gate departure, compact menus, level selection, team messages above robots and optional sound effects.

## Release gate

The Docker build runs the full regression suite. The GitHub release workflow runs the runtime smoke check before publishing: non-root process, minimal files, health and browser modules, secure session cookies, all six levels, two real WebSocket seats completing rooms four and six, replay and exit. Publishing uses the `v1.1.0` source tag; immutable provenance is recorded in `releases/v1.1.0.json` after verification.

## Azure settings

Use `ghcr.io/lucaslee1234/signal-foundry:1.1.0`, or the verified immutable digest from the release evidence. Linux AMD64; external HTTP ingress with target port 3000. Keep minimum and maximum replicas at 1 and one serving revision. Preserve `APP_ORIGIN=https://signal-foundry.victoriousmushroom-f0174aa0.westus2.azurecontainerapps.io` with no trailing slash. The image defaults to `HOST=0.0.0.0`, `PORT=3000` and `GAME_MODE=foundry`.

The image contains no test origin in its defaults. The synthetic origin used by smoke testing is supplied only to a disposable test container.

Updating the Azure image replaces the in-memory server and ends current rooms. Existing Azure Express environments do not support a custom revision suffix. After the user updates the image, check readiness and two-player browser play through the public HTTPS URL. This release preparation does not change Azure resources or deploy the application.

Rollback is available with the previous immutable 1.0.0 image. That image contains the older four-room game; do not overwrite its tag or digest.
