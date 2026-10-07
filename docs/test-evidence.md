# Signal Rescue - Verification Evidence

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
