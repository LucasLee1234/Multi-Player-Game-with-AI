# Signal Rescue

A two-player cooperative browser game in development: you can see your partner's hazards, and they can see yours. Share information, coordinate movement, and find a way out together.

**Status:** SYS-02 gameplay prototype implemented locally: two-player start, private hazard views, truthful signals, public proposals, synchronized confirmation, J1 joint-exit outcomes, and mutual retry. One asymmetric mission is available. There is no public deployment or completed human playtest.

## Planned experience

- Exactly two human players on separate phones or computers.
- Join the same session through a public URL and room code, without a player account or installation.
- Different hazard information on each screen makes communication useful.
- Visible movement proposals help players coordinate before a turn resolves.
- Small authored missions with clear outcomes and retry.

The specified candidate, [J1-C1](docs/candidate-gameplay-spec.md), uses **joint exit**: both robots remain movable until they occupy their respective exits together. Sometimes one robot leaves an exit temporarily to make room for the other; other routes coordinate earlier. Its asymmetric mission is implemented with outcome/turn/strike summaries and no numerical points. The teaching mission remains planned. A [static low-fidelity layout](docs/mobile-wireframe.html) records the earlier interface study.

The project uses AI assistance during design and development. Runtime AI calls are outside the initial game scope. Azure is the planned hosting provider; deployment configuration and costs remain unverified.

## Repository layout

```text
game/
  src/        TypeScript server, J1 rules, server-only content, client, contracts
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

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). Use a normal and private browser window, or two different profiles, for two independent sessions. Create a room, then join its code. Two tabs in the same profile share a seat: the second must explicitly take control. Both players select **Ready to start**. Read **How to play**, then select a cell on the partner's map to send a truthful signal, propose an adjacent move or Wait, and both select **Ready - confirm this plan**. Any accepted plan edit or signal clears both confirmations. Unknown is not Safe; each robot has its own danger layer. Bring A to 5 and B to 3 simultaneously within eight turns and fewer than three strikes. Both must agree to Practice again. This is one authored asymmetric mission, not the planned tutorial sequence.

Thirty-six automated tests passed. Real HTTP/WebSocket tests inspected recipient-specific payloads and simultaneous confirmation. A browser-A/development-client-B check finished in seven turns with zero strikes and verified terminal refresh/retry. That scripted check is not two-human enjoyment evidence. `tests/manual-partner.mjs` is a development-only wire helper, not served, not automatically started, and not part of the public game. Actual phone, public networking, and first-time human observations remain pending.

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
- [Short development cycle](docs/short-development-cycle.md): define, implement, verify, inspect, adjust, and sync.
- [Development workflow](docs/development-workflow.md): stage gates and evidence standards.
- [Audited 0.2 rules](docs/game-design.md): the rule set used by the existing research code.
- [Second gameplay review](docs/gameplay-second-review.md): information, participation, and replay risks.
- [Joint-exit analysis](docs/gameplay-cooperation-analysis.md): proposed change and a manually checked example.
- [Recorded validation results](docs/gameplay-validation-results.json): bounded 0.2 spatial evidence.

Next inspect the experience with two independent human-controlled browser contexts, then refine onboarding/tutorial and phone layout using observations. Verify Azure account/cost before provisioning the public two-device proof. G2/G3 remain open.

## Project context

Signal Rescue is being developed toward the Handshake AI Skills Studio x OpenAI multiplayer game challenge. Contest research and submission planning are in [the competition plan](docs/competition-plan.md). Submission and award outcomes are not yet established.

## License

No project license has been selected yet. Supplied reference materials retain their respective ownership and terms.
