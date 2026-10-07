# Signal Rescue

A two-player cooperative browser game in development. The current **Signal Foundry** experiment lets two robots power each other's gates and reach their exits together.

**Status:** SF-T1 First Connection is implemented locally and is the default startup mission. It includes relay power, latch-on-entry gates, public tile pings, synchronized movement, joint exit, and mutual retry. The earlier J1 private-hazard mission remains available as a developer comparison. There is no public deployment or completed human playtest.

## Planned experience

- Exactly two human players on separate phones or computers.
- Join the same session through a public URL and room code, without a player account or installation.
- Your robot's relay can open a gate for your partner; cooperation changes the available route.
- Visible movement proposals help players coordinate before a turn resolves.
- Small authored missions with clear outcomes and retry.

The current [SF-T1 specification](docs/signal-foundry-spec.md) defines one public-map teaching room, not a full campaign. Gates stay open after first entry; exploration has no turn limit or numerical score. Private-information content remains a future design question. The earlier [J1-C1 candidate](docs/candidate-gameplay-spec.md) is preserved for comparison and has different hazard, strike, and turn-limit rules. Do not combine the rule versions.

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

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). Use a normal and private browser window, or two different profiles, for two independent sessions. Create a room, then join its code. Two tabs in the same profile share a seat: the second must explicitly take control. Both players select **Ready to start**. B starts on Relay 8, powering A's Gate 1. A crosses to Relay 2 to power B's Gate 9. Propose an adjacent move or Wait, then both select **Ready - confirm this plan**. Entering a powered gate latches it open. Relay power is checked at turn start; moving onto a relay powers its gate for the next turn. Optional tile pings point out a location once per player per turn and clear both confirmations. Bring A to Exit 3 and B to Exit 11 together. Both must agree to **Practice again**.

Forty-six automated tests passed, including all earlier J1/room checks, foundry state exploration, reconnect/reset, and two-context HTTP/WebSocket gameplay. The actual foundry rule module reaches the same 21 states and 120 transitions as the research audit; every reachable state can complete. A browser-A/development-client-B check finished the teaching route in five turns and checked terminal refresh/retry. A measured 390-pixel viewport had no horizontal overflow; this is browser emulation, not an actual phone or touch test. Scripted checks do not establish human enjoyment. `tests/manual-partner.mjs` is a development-only wire helper, not served, not automatically started, and not part of the public game.

Default startup uses `GAME_MODE=foundry`. To compare the earlier hazard mission, set `GAME_MODE=J1` before starting the server, then create a new room. For example in PowerShell: `$env:GAME_MODE = 'J1'`; remove the variable to return to the default. Changing mode requires a restart and ends existing in-memory rooms. The server factory's default remains J1 for existing regression tests; the actual startup entry point explicitly selects the mode. No player-facing mode selector or level progression is included.

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
- [Foundry expansion design](docs/foundry-expansion-design.md): checked shared-passage/pressure-gate and crate room proposals; not yet implemented in the browser.
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
