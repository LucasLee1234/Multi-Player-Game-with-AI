# Signal Foundry v1 Container Deployment

The release image targets Linux AMD64 and runs one Node.js process on port 3000. Production requires `APP_ORIGIN` to equal the exact public HTTPS origin, without a trailing slash. Startup intentionally rejects an insecure public origin.

## Build

From the repository root:

```powershell
docker build --platform linux/amd64 --build-arg VCS_REF=<commit-sha> -t signal-foundry:v1.0.0 -t signal-foundry:v1 .
```

The build installs locked dependencies and runs the complete regression suite before removing development dependencies. The runtime image contains compiled application code, production dependencies and public assets. It excludes contest reference documents, research, tests, Git history and credentials. The process runs as the non-root `node` user.

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

- [ ] Build the Linux AMD64 image successfully with its regression gate.
- [ ] Run a disposable container; verify non-root runtime, health, static asset allowlist and two-client room/game commands.
- [ ] Record image ID, source commit and image tag.
- [ ] Push the requested public source repository and v1 release tag.
- [ ] Publish the image to an authenticated registry, or export a portable Docker archive.
- [ ] Deploy to Azure only after choosing resources and reviewing actual subscription costs.
- [ ] Verify public two-device/network play and budget runway through judging.

Azure resource creation and cloud spending are not performed by preparing this image.

References: [Docker Node.js guide](https://docs.docker.com/guides/nodejs/), [Azure container requirements](https://learn.microsoft.com/en-us/azure/container-apps/containers), [Azure ingress](https://learn.microsoft.com/en-us/azure/container-apps/ingress-overview).
