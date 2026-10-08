# Signal Foundry v1 Container Deployment

The release image targets Linux AMD64 and runs one Node.js process on port 3000. Production requires `APP_ORIGIN` to equal the exact public HTTPS origin, without a trailing slash. Startup intentionally rejects an insecure public origin.

## Build

From the repository root:

```powershell
docker build --platform linux/amd64 --build-arg VCS_REF=<commit-sha> -t signal-foundry:v1.0.0 -t signal-foundry:v1 .
```

The build installs locked dependencies and runs the complete regression suite before removing development dependencies. The runtime image contains compiled application code, production dependencies and public assets. It excludes contest reference documents, research, tests, Git history and credentials. The process runs as the non-root `node` user.

One historical validation JSON fixture is copied into the build stage for a regression test, but is not copied into the runtime. GitHub Actions also runs the real two-client runtime smoke check before publishing.

## Azure Container Apps configuration

| Setting | Value |
| --- | --- |
| Image | Registry-qualified v1.0.0 tag or immutable digest |
| OS / architecture | Linux / AMD64 |
| External ingress | HTTP ingress, HTTPS public endpoint |
| Target port | 3000 |
| `APP_ORIGIN` | Exact assigned HTTPS origin |
| `HOST` | 0.0.0.0 (image default) |
| `PORT` | 3000 (image default) |
| `GAME_MODE` | foundry (image default) |
| Minimum / maximum replicas | 1 / 1 |
| Revision mode | Single; no weighted traffic splitting |
| Application workers | One |
| Readiness probe | HTTP GET /health/ready on port 3000 |
| Liveness probe | HTTP GET /health/live on port 3000 |

Explicitly configure Azure probes; the image's Docker HEALTHCHECK is also useful for local inspection. Set `APP_ORIGIN` after obtaining the Azure hostname, then verify readiness, secure cookies and two-player WebSocket play through that same origin.

The game stores rooms and sessions in process memory. Restarting or replacing the container ends those rooms. One replica does not guarantee uninterrupted operation, and revision replacement can overlap processes. Schedule release replacement between play sessions, use one serving revision and rerun public smoke checks. Do not enable horizontal scaling until room authority and shared state are redesigned.

## Publish an image

After choosing and authenticating to a container registry:

```powershell
docker tag signal-foundry:v1.0.0 <registry>/signal-foundry:v1.0.0
docker push <registry>/signal-foundry:v1.0.0
```

Source code on GitHub is separate from an image published to a registry. Azure pulls the image from ACR, GHCR or another configured registry; it does not run the repository directly. Prefer a commit-specific tag or digest for rollback. Do not put registry tokens or Azure credentials in source, build arguments or images.

## Release acceptance

- [x] Build the Linux AMD64 image successfully with its regression gate.
- [x] Run a disposable container; verify non-root runtime, health, static asset allowlist and two-client room/game commands.
- [x] Record image ID, source commit and image tag.
- [x] Push the requested public source repository and v1 release tag.
- [x] Publish the image to an authenticated registry, or export a portable Docker archive.
- [ ] Deploy to Azure only after choosing resources and reviewing actual subscription costs.
- [ ] Verify public two-device/network play and budget runway through judging.

Azure resource creation and cloud spending are not performed by preparing this image.

## Verified local release preparation

The local Linux AMD64 candidate successfully built with all 75 regressions passing. Its runtime smoke check passed non-root/minimal-file checks, health/assets, secure cookie attributes, real two-wire fourth-room selection, 26-step completion, replay and exit. Docker HEALTHCHECK reported healthy. These are local container checks, not an Azure public endpoint or actual-phone test.

The published image is `ghcr.io/lucaslee1234/signal-foundry:1.0.0`. GitHub release tag `v1.0.0` also produces image tags `v1` and a commit SHA tag. The release workflow succeeded, and an unauthenticated registry token/manifest request verified anonymous pull access on October 8, 2026. The published index digest is `sha256:f264ddb687286eabcdefe39772698112a31ab8d6e424447d8d3888565dac4ee5`. Use the digest for immutable Azure deployment. See [release evidence](../releases/v1.0.0.json).

A local portable archive is available at `releases/signal-foundry-v1.0.0.tar` and is excluded from Git. Import it with `docker load --input releases/signal-foundry-v1.0.0.tar`. Its local image ID differs from the registry index digest because GitHub independently builds and publishes the image with attestations; both use the source commit recorded in the release evidence.

References: [Docker Node.js guide](https://docs.docker.com/guides/nodejs/), [Azure container requirements](https://learn.microsoft.com/en-us/azure/container-apps/containers), [Azure ingress](https://learn.microsoft.com/en-us/azure/container-apps/ingress-overview).
