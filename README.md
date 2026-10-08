# Signal Rescue

A two-player cooperative browser game in development. The current **Signal Foundry** experiment lets two robots power each other's gates and reach their exits together.

**Status:** Two local Signal Foundry rooms are implemented: First Connection and Trade Places. Both connected players start automatically and move independently with direction buttons or arrow keys / WASD. No Ready or Wait button. Shared passages, latching gates, hold-open pressure gates, public location pings, joint exit, mutual retry and next-room choices are implemented. J1 remains a developer comparison. There is no public deployment or completed independent human playtest.

## Planned experience

- Exactly two human players on separate phones or computers.
- Join the same session through a public URL and room code, without a player account or installation.
- Your robot's relay can open a gate for your partner; cooperation changes the available route.
- Each player moves their own robot directly; staying still lets the partner act while relay power is maintained.
- Small authored missions with clear outcomes and retry.

The [independent movement specification](docs/independent-movement-spec.md) overrides the [SF-T1 v2](docs/signal-foundry-spec.md) confirmation rules. [SF-02 implementation](docs/shared-passage-implementation.md) adds a shared-passage room: latching gates stay open after first entry; hold-open gates need continued relay occupancy. Exploration has no move limit or numerical score. Private-information content remains a future design question. The earlier [J1-C1 candidate](docs/candidate-gameplay-spec.md) is preserved for comparison and has different hazard, strike, and turn-limit rules. Do not combine the rule versions.

The project uses AI assistance during design and development. Runtime AI calls are outside the initial game scope. Azure is the planned hosting provider; deployment configuration and costs remain unverified.

## Repository layout

```text
game/
  src/        TypeScript server, versioned gameplay rules, content, client, contracts
  public/     Allowlisted browser assets
  tests/      Local authority, lifecycle, and HTTP/WebSocket checks
  scripts/    Reproducible build/test entry point
  research/   Python rule analysis, bounded searches, and tests
docs/         Design, research, workflow, decisions, and validation evidence
info/         Locally supplied contest reference material
README.md     Project overview and verified usage instructions
```

## Run the local gameplay prototype

Verified runtime: bundled Node 24.19.0, pnpm 11.19.0; exact dependencies are in `game/pnpm-lock.yaml`. From the project root, using these tools on PATH:

```sh
cd game
pnpm --ignore-workspace install --frozen-lockfile
pnpm --ignore-workspace test
pnpm --ignore-workspace start
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). Use a normal and private browser window, or two different profiles, for two independent sessions. Create a room, then join its code. Two tabs in the same profile share a seat: the second must explicitly take control. The mission starts when both are connected. In First Connection, B starts on Relay 8, powering A's Gate 1. A crosses to Relay 2 to power B's Gate 9 immediately. Click a direction or use arrow keys / WASD to move one tile; stay still to wait. A move never needs the partner's confirmation. Select a walkable tile to publish or update a location ping. Bring A to Exit 3 and B to Exit 11 together.

After success, both choose **Next room: Trade Places** to advance, or **Practice again** to retry. Mismatched choices wait; either player can change their choice. Trade Places has a shared 5-by-3 map. Relay 6 powers latching Gate 2; Relay 8 powers hold-open Gate 11. Closing a gate blocks entry but permits an occupant to leave. Use parking spaces to pass each other; finish with A at Exit 4 and B at Exit 10. Practice again retries the current room. Trade Places currently offers no further room; Leave ends the session.

Sixty-one automated tests passed, including independent movement, actual shared-passage state recovery, pressure-gate boundaries, matched/conflicting next-room choices, duplicate delivery, reconnect and all earlier J1/room checks. Actual rule audits found 21 teaching states and 220 Trade Places states; every state can complete. Trade Places has a shortest 16-step solution and a tested 18-step northern alternative. Browser-A/development-client-B checks verified six-step teaching completion, progression, sixteen-step shared-room completion, pings and retry. The 390-pixel second-room layout has no horizontal overflow; this is browser emulation, not an actual phone/touch test. Scripted checks do not establish human enjoyment. `tests/manual-partner.mjs` is a development-only wire helper, not served, not automatically started, and not part of the public game.

Default startup uses `GAME_MODE=foundry` and release `sys-05-shared-passage`. To compare the earlier hazard mission, set `GAME_MODE=J1` before starting the server, then create a new room. For example in PowerShell: `$env:GAME_MODE = 'J1'`; remove the variable to return to the default. Changing mode requires a restart and ends existing in-memory rooms. The server factory's default remains J1 for existing regression tests; the actual startup entry point explicitly selects the adventure. No player-facing profile selector is included.

The default server binds only to `127.0.0.1`; a phone cannot use the computer's loopback URL. Public/LAN play needs the planned HTTPS deployment, which has not been provisioned. `HOST`, `PORT`, and exact `APP_ORIGIN` are server settings; a non-loopback host requires an HTTPS origin and an actual HTTPS reverse proxy. Do not publish this plain HTTP development listener.

This Windows environment has a broken default npm launcher and pnpm workspace discovery inherited from a parent directory. The verified fallback uses the bundled executable directly from the project root:

```powershell
Set-Location game
$runtimeNode = 'C:/Users/LiHongBo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
$runtimePnpm = 'C:/Users/LiHongBo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pnpm/bin/pnpm.mjs'
& $runtimeNode $runtimePnpm --ignore-workspace install --frozen-lockfile
& $runtimeNode $runtimePnpm --ignore-workspace test
& $runtimeNode dist/src/server/main.js
```

These fallback paths are specific to this machine. Compilation and local Node tests passed; current evidence and untested behavior are in [test-evidence.md](docs/test-evidence.md). No Azure resource or GitHub remote exists. Supplied `info/` references are retained locally and excluded from Git; contest sources are linked in the planning documents. No background synchronization is configured.

## Run the existing research checks

Requirements: Python 3 with the standard library. Run from the project root:

```sh
python -B -m unittest discover -s game/research -p "test_*.py" -v
python -B game/research/feasibility_probe.py
python -B game/research/validate_design.py
```

These commands exercise the **0.2 research rules**, which remove robots when they reach their exits. They do not implement the proposed joint-exit candidate, networking, a user interface, or a production server. The analysis commands print results; they do not launch a playable game.

Recorded 0.2 evidence includes 15 passing boundary tests and an exhaustive check of 441 fixed 3-by-3 hazard layouts. Of those, 423 have a zero-strike route within eight turns. A later analysis found that all 423 can also finish after two initial information-sharing Wait turns, exposing a weakness in the intended information constraint. These findings motivate further design work; they do not establish human enjoyment or joint-exit solvability.

## Design and development

- [Project brief](docs/project-brief.md): scope and acceptance requirements.
- [Requirements analysis and SRS](docs/requirements-analysis.md): user needs, functional/non-functional requirements, scenarios, stories, use cases, and acceptance criteria.
- [Requirements readiness review](docs/requirements-readiness-review.md): completeness findings and conditions for system design.
- [System architecture](docs/architecture.md): authoritative rooms, filtered views, command/lifecycle contracts, Azure candidate, and the first implementation slice.
- [Current tasks](docs/tasks.md): progress and dependencies.
- [Foundry expansion design](docs/foundry-expansion-design.md): shared-passage/pressure-gate design now implemented; the crate room remains a checked proposal.
- [Shared-passage implementation](docs/shared-passage-implementation.md): active SF-02 contract, acceptance and implementation evidence.
- [Short development cycle](docs/short-development-cycle.md): define, implement, verify, inspect, adjust, and sync.
- [Development workflow](docs/development-workflow.md): stage gates and evidence standards.
- [Audited 0.2 rules](docs/game-design.md): the rule set used by the existing research code.
- [Second gameplay review](docs/gameplay-second-review.md): information, participation, and replay risks.
- [Joint-exit analysis](docs/gameplay-cooperation-analysis.md): proposed change and a manually checked example.
- [Recorded validation results](docs/gameplay-validation-results.json): bounded 0.2 spatial evidence.

Next inspect First Connection with two independent human-controlled browser contexts, especially whether partner support and waiting feel useful. Verify actual phone controls and Azure account/cost before public two-device proof. G2/G3 remain open.

## Project context

Signal Rescue is being developed toward the Handshake AI Skills Studio x OpenAI multiplayer game challenge. Contest research and submission planning are in [the competition plan](docs/competition-plan.md). Submission and award outcomes are not yet established.

## License

No project license has been selected yet. Supplied reference materials retain their respective ownership and terms.
