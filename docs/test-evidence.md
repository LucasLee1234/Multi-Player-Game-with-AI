# Signal Rescue - Verification Evidence

Latest slice: **SYS-02**. The SYS-01 record below is historical; current gameplay evidence follows it in the SYS-02 section.

Date: October 6, 2026
Build slice: SYS-01 / room and authorized connection
Rules: no mission engine; J1-C1 remains the next gameplay candidate
Remote synchronization: NOT CONFIGURED

## Cycle record

Outcome: independent sessions obtain exactly two room seats and see authoritative connection state, with anonymous session control, reserved disconnected seats, and an explicit duplicate-tab takeover.

Included: fixed-version TypeScript/Node/ws build; public asset allowlist; bootstrap/create/join/session HTTP; same-origin cookie authorization; WebSocket lobby snapshots and Leave; admission deduplication; controller epochs; monotonic injected expiry; bounded sessions/rooms/admission attempts/frames/outgoing buffers; heartbeat; local browser interface.

Excluded: mission state, hidden hazard payloads, movement/signals/Ready/start, scores, Azure, public phone play, performance claims, human enjoyment, and GitHub publication. No synthetic hazard fixture was introduced: lobby view tests cover credentials/internal-state exclusion, not actual gameplay hazard filtering. SYS-01 is complete for this bounded local slice; G2 and G3 are not complete.

## Automated results

Observed: TypeScript build passed. The current `pnpm --ignore-workspace test` entry point builds then runs Node's test runner. Fourteen tests passed, zero failed/skipped. Tests use ephemeral loopback ports and injected clocks rather than waiting for recovery timers. They do not connect to Azure or GitHub.

Environment: Windows; direct bundled Node 24.19.0; pnpm 11.19.0; TypeScript 7.0.2; ws 8.22.0; types pinned in the lockfile. A former nested-pnpm entry also passed under the system Node 24.20.0, but the final scripts avoid nested package-manager startup. The existing default npm issue was not repaired. Install required network permission; pnpm dependency links required outside-sandbox execution for compilation/testing.

| Evidence | Requirements / contract | Observed check | Result |
| --- | --- | --- | --- |
| AUTO-01 | FR-02 to FR-05; NFR-01 | Two independent cookie contexts; simultaneous competing join requests yield one B and one ROOM_FULL | PASS |
| AUTO-02 | NFR-01, NFR-03 | Duplicate create/join/lost admission acknowledgement replay returns current same association; payload conflicts/stale contexts reject | PASS |
| AUTO-03 | FR-06, FR-19; NFR-02 | Lobby projection keys are allowlisted; no capability/internal records; room code cannot authenticate | PASS, lobby scope only |
| AUTO-04 | FR-19; NFR-02 | Duplicate socket rejects; explicit takeover changes epoch, closes/fences old controller | PASS |
| AUTO-05 | FR-18 to FR-20; NFR-03 | Repeated disconnect does not extend grace; both authorized return before expiry; exact deadline closes | PASS |
| AUTO-06 | FR-24; lifecycle | Waiting Leave transfers setup owner and allows replacement; old association cannot control it; paused Leave closes both seats | PASS |
| AUTO-07 | NFR-01, NFR-02 | Cross-room/sequence-gap/role injection/unknown action rejected without applying | PASS |
| AUTO-08 | NFR-15 | Room/session/admission bounds and cleanup; idle/hard expiry on request | PASS, selected boundaries; not measured capacity |
| AUTO-09 | NFR-02, NFR-16 | Cross-origin HTTP/WS, missing capability, oversized HTTP/WS; insecure public configuration rejected | PASS, local integration |
| AUTO-10 | NFR-11; public files | Only allowlisted HTML/CSS/client JS served; server/research/content/document URLs unavailable | PASS |
| AUTO-11 | FR-20 | New store/boot cannot restore a prior capability; clear ended/unavailable context | PASS |

Test sources: [store.test.ts](../game/tests/store.test.ts), [http.test.ts](../game/tests/http.test.ts). Gameplay command acknowledgement eviction/domain-error semantics will be tested with the next implemented actions; they are not proven by a Leave-only command path.

## Browser inspection

Observed through the Codex in-app browser on the actual loopback server:

| Evidence | Steps and observation | Result |
| --- | --- | --- |
| UI-01 | Create room; code and role A shown; own connection active; B waiting; Start disabled and gameplay absence explicit | PASS |
| UI-02 | Reload same page; same room/role restored | PASS |
| UI-03 | Open second same-profile tab; cannot silently replace original; Use this tab transfers control | PASS |
| UI-04 | Original tab says status is not live after takeover, instead of displaying stale connection/timer as live | PASS after fix |
| UI-05 | Restart server and reload; unavailable/expired-or-restarted message and create/join entry, no fake restored room | PASS |
| UI-06 | Leave returns to entry; nonexistent AAAAAA code displays understandable failure | PASS |
| UI-07 | Screenshot/DOM inspection of actual lobby; visible action buttons measured 48 CSS pixels high | PASS on inspected desktop layout |
| UI-08 | Attempted 360-by-800 viewport override; DOM reported 870-pixel inner width instead | NOT VERIFIED; no mobile-width claim |

Screenshot: [sys-01-lobby.jpg](evidence/sys-01-lobby.jpg). Its code belongs to a disposable local room, not a credential or lasting invitation. Browser create/reload/takeover/leave used one cookie profile; independent A/B contexts were checked by HTTP/WS integration, not two humans on different devices. The viewport override was reset. This is not complete accessibility verification.

## Defects resolved and limits

- ENV-01: parent workspace discovery made an install appear successful without project dependencies. Explicit `--ignore-workspace` and verified project files fixed the local setup; default npm remains broken.
- UI-01: replaced tabs showed a stale paused countdown. They now explicitly say their room status is not live. Rechecked in-browser after rebuilding/restarting.
- CLIENT-01: ignore a lower session context version so a late HTTP response cannot restore an older association. Runtime concurrency coverage for this browser guard remains limited; server authority tests passed.
- SCRIPT-01: nested pnpm triggered Corepack startup. The final check script invokes compilation/tests through the current Node directly and the documented command passed.

Remaining: actual J1 rules/private hazards, full command replay behavior, public TLS ingress, measured load/latency/backpressure, actual mobile rendering, keyboard walk-through, two-device/network proof, Azure balance/cost, and human gameplay. Resource limits are protection defaults, not evidence of production security or 20-room capacity.

## Source-control checkpoint

Project-local repository created on `codex/sys-01`, with participant-specified local author configuration. Supplied `info/` binaries excluded; authored docs/research, source, tests, lockfile, README, and screenshot included. Generated `dist/`, dependencies, logs, and credentials excluded.

The intended initial checkpoint records this document and the slice. Its actual identifier is reported after commit; it can also be read with `git log -1 --oneline` from the project root. GitHub has not been created/configured, so no push or remote synchronization is claimed. No global Git trust setting was changed; outside-sandbox Git uses a command-scoped exception for this exact workspace due to the sandbox owner's .git directory.

Next smallest cycle: one authoritative synchronized J1-C1 turn, tested actual per-seat hazard projections and stale/duplicate confirmation, before full mission content or art.

## SYS-02 - Authoritative J1-C1 gameplay

Date: October 6, 2026. Release ID: `sys-02`. Runtime/dependency versions unchanged from SYS-01. Final compile and Node test run: **36 tests passed, zero failed/skipped**. Sources include [J1 rules](../game/src/rules/joint-exit.ts), [rule tests](../game/tests/joint-exit.test.ts), [game store tests](../game/tests/game-store.test.ts), and [actual gameplay wire test](../game/tests/game-http.test.ts). The historical 0.2 Python model/results are not used to validate these semantics.

Implemented: one server-only asymmetric mission J1-M1; two-player current-lobby start; own learned information/partner full hazard layer; one truthful per-turn signal; persistent own knowledge and two-hazard deduction; cardinal/Wait proposals; plan-edit confirmation reset; second-current-Ready one-time resolution; J1 joint exit/strikes/turn limit; unscored result summaries; mutual retry/new mission ID; phase-preserving pause, fresh agreement, terminal outcome retention. No runtime AI, extra players, procedural generation, tutorial progression, public host, or numerical points.

| Evidence | Requirement / boundary | Observed |
| --- | --- | --- |
| J1-01 | FR-09, FR-12 to FR-14, FR-22 | Six/seven-turn routes executed; collision or hazard-plus-collision recovery wins on turn eight; same-cell/swap/following, two hazard attempts, failure/arrival/turn-limit precedence pass |
| J1-02 | FR-07, FR-08, FR-23; NFR-02 | Actual WebSocket recipients receive only their own learned cells and the partner's hazards; initial own hazard remains Unknown; mission definition/other knowledge absent; private content/rule asset URLs unavailable |
| J1-03 | FR-10 to FR-12; NFR-01 | Changed proposals/signals clear both Ready; stale plans reject; simultaneous two-Ready messages resolve once; replayed committed acknowledgement cannot resolve again |
| J1-04 | NFR-01, NFR-03 | Valid domain failures consume/cache sequence; request/payload conflicts and old evicted requests reject; authorized reconnect retries the same intent with a new controller epoch |
| J1-05 | FR-18 to FR-20 | Pause restores same mission/positions/knowledge and prior phase with readiness cleared; terminal retry agreement clears on interruption; expiry retains a committed outcome without hazards |
| J1-06 | FR-16, FR-19, FR-24 | Both retry agreements required; new ID and clean positions/knowledge/signals; sequences remain monotonic; active Leave closes both; no anonymous active replacement |

Browser inspection used the Codex in-app browser for A and [a development-only wire client](../game/tests/manual-partner.mjs) for B. Both tabs of the enabled UI browser share cookies; no second independently controlled UI profile was available. The helper is outside the served asset allowlist and never launched by the application. It proposes the documented B route and waits for A's compatible confirmation. It is test infrastructure, not a product bot or human evidence.

Observed browser results:

- Both connected and agreed to Start; correct robot/layer labels and Unknown versus learned/deduced safety displayed.
- Sent A's signals at 0 and 7; two disclosure Wait turns consumed, followed by the five-step yielding route. Both reached exits on turn seven with zero strikes; movement/signal controls disabled at terminal.
- Refreshed terminal page: same committed result restored. Practice again required the partner's agreement and reset to turn one/start positions/Unknown knowledge, with the helper's new legitimate signal then visible.
- After the final acknowledgement/snapshot UI guard change, rebuilt/restarted and rechecked Start -> Signal -> Ready -> turn two -> Leave. Controls reopen after the authoritative snapshot; fixed nodes preserve control focus across state changes.
- Closed both disposable rooms; development B clients exited. Local server remains available for participant-created sessions.

Screenshots: [planning/private labels](evidence/sys-02-planning.jpg), [seven-turn result](evidence/sys-02-result.jpg). They demonstrate the implemented local flow, not two-human collaboration, phone usability, or an active invitation.

Remaining verification: human discoverability/enjoyment/participation, exact phone browser/touch/viewport layout, public TLS and separate networks, measured load/latency, tutorial/onboarding, and Azure cost/access. The earlier 360-pixel viewport override was not effective; no phone-width pass is claimed. G2 and G3 remain open. GitHub is not configured; this cycle is saved only as a local checkpoint, with its actual commit reported in chat.

Next: participant inspection using two independent human-controlled contexts, then the bounded teaching/phone cycle and public technical proof after account/cost checks.

## SF-01 - Signal Foundry First Connection

Date: October 6, 2026. Release ID: `sys-03-sf-t1`. Default startup profile: foundry. Node/dependencies unchanged. Final regression suite: **46 tests passed, zero failed/skipped**. J1 remains a developer comparison with its earlier tests intact.

Sources: [rule module](../game/src/rules/joint-exit.ts), [foundry rules tests](../game/tests/foundry.test.ts), [foundry store tests](../game/tests/foundry-store.test.ts), [two-profile wire tests](../game/tests/game-http.test.ts). Specification: [SF-T1 v2](signal-foundry-spec.md).

| Evidence | Check | Actual result |
| --- | --- | --- |
| SF-A01 | Full state search of actual TypeScript transitions | 21 states, 120 transitions, matching independent Python research counts; every reachable state can complete |
| SF-A02 | Witness and original softlock recovery | Five-turn completion; latching allows return through both gates after relay departure; more-than-eight-turn exploration still completes |
| SF-A03 | Turn-start power and gate state | Simultaneous first arrival at relay does not enable entry that turn; powered entry with simultaneous relay departure latches correctly |
| SF-A04 | Geometry and location pings | Walls/wrap/nonadjacent destinations reject; one public walkable-tile ping per seat per turn; ping clears both ready; projections cannot mutate truth |
| SF-A05 | Authority, duplication and reset | Duplicate second Ready cannot advance again; same public gate state for both seats; mutual retry resets positions/latches/attempt ID while seat sequences remain monotonic |
| SF-A06 | Recovery | Pause/reconnect retains robot positions and latches, clears agreements and restores planning; existing room/authorization regressions pass |
| SF-A07 | Real HTTP/WebSocket contexts | Two distinct capability cookies complete First Connection and mutually retry; duplicate confirmation does not resolve twice; private server content remains unserved |
| SF-U01 | Browser A with development-only B helper | Five-turn route completes; powered and latched gate labels/robot markers update; no hazard/strike-limit UI in foundry |
| SF-U02 | Tile inspection/ping | Selecting Relay 2 identifies Gate 9 and publishes A's location ping; movement remains controlled separately |
| SF-U03 | Terminal refresh and retry | Same committed success after refresh; both retry agreements produce turn one, initial positions, no latches, GA powered and GB closed |
| SF-U04 | Narrow browser viewport | Actual `innerWidth=390`, document `clientWidth=375`, `scrollWidth=375`, board width approximately 313.6 CSS pixels; no horizontal overflow; screenshot inspected; override reset |

Browser helper usage is scripted inspection, not two-human evidence. It is outside the served asset allowlist, not launched by the application, and stopped when the disposable room closed. Narrow inspection is browser emulation, not an actual phone/touch or full accessibility test.

Client correction: terminal resolution increments planning revision without changing the turn counter. The previous generic ready-invalidation message consequently appeared after success. Suppress it on terminal snapshots and clear obsolete feedback on resolved/new attempts; final browser completion checked after rebuild/restart. The terminal hint also now describes completion rather than asking players to keep moving.

Screenshots: [powered partner gate](evidence/sf-t1-powered.png), [narrow completion](evidence/sf-t1-narrow.png), [final desktop completion](evidence/sf-t1-result.png). Codes shown belong to closed disposable rooms.

Limits: one public, disjoint teaching room; no second room, private relay information, independent-step control, production load measurements, actual phone/network proof, public Azure deployment or human enjoyment validation. In particular, the original FR-23 information-and-reasoning requirement is still open. Local source control only; GitHub not configured. Next: two human-controlled independent contexts, observe understanding and waiting/confirmation friction, then choose the smallest adjustment.
