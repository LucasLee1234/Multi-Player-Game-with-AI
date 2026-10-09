# Changelog

## Unreleased

- Compact team signals: power requests, Hold position, Got it and explicit tile marking, with named markers, six-second expiry and a server-enforced two-second cooldown. [Behavior and verification](docs/team-signals.md).
- 84 tests pass, including communication authority, lifecycle and real two-seat delivery.
- Added Freight Exchange as room five: recover the crate through a physical handoff between both robots.
- Five-room progression, consent-bound level selection, green completion history and final-room replay/exit.
- 82 tests pass, including exhaustive fifth-room previews and synchronized two-seat network completion/replay. [Implementation evidence](docs/freight-exchange-implementation.md).

## 1.1.0 - October 8, 2026

Source-only checkpoint. No Docker image was built or published, and Azure was not updated. No `v1.1.0` tag was created because `v*` tags trigger container publication.

- Amber exit-only state and safe-departure guidance for robots occupying an unpowered gate; [behavior and evidence](docs/gate-occupancy.md).
- Explicit relay destinations (`Relay → Gate N`), including compact landscape layouts and crate docks.
- Short push/pull diagrams and contextual, dismissible crate guidance.
- Successful-action learning, legal direction previews and clear parked-crate objectives.
- Pull control above the board, with explicit straight-away direction and mode-switch corrections.
- Exhaustive preview checks against both crate-room engines; 79 tests pass.
- See [crate onboarding evidence](docs/crate-onboarding.md). The v1.0.0 image remains unchanged.

## 1.0.0 - October 8, 2026

First container-release candidate for Signal Foundry.

- Four cooperative rooms, independent movement and shared authoritative state.
- Latching/pressure gates, crate Push/Pull, marked parking targets and joint extraction.
- Compact single-screen play, first-encounter lessons, F/touch mode switching and organized menu.
- Consent-bound restart/level selection, browser-local green completion history and direct exit.
- Linux AMD64 Docker build with regression gate, non-root runtime and health check.
- Tagged GitHub Actions image publishing and Azure single-instance deployment instructions.
- MIT project license and third-party notice index.

Known limits: in-memory rooms end on server restart; no horizontal scaling, database or account synchronization. Public Azure deployment, actual-phone testing and independent two-human acceptance remain pending. Build/publication success must be recorded separately from this release candidate description.
