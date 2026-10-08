# Signal Foundry Independent Movement

Date: October 7, 2026
Rule version: SF-T1-v3
Release: sys-04-free-move
Status: Implemented default local profile. The participant explicitly requested direct movement without Ready and waiting by remaining still. This specification supersedes SF-T1 v2 confirmation/turn rules and E1 expansion's simultaneous planning assumptions.

## Player flow

- Two connected participants automatically begin First Connection. No start confirmation button.
- Each player clicks a direction or uses arrow keys / WASD. One accepted input attempts one adjacent grid step immediately; no partner confirmation or mandatory alternating turns.
- A player who does nothing stays at their current position and continues powering any occupied relay. There is no Wait button, idle movement simulation, forced turn or movement timer.
- Walls, closed gates and occupied robot cells still constrain movement. Independent control does not permit passing through obstacles.
- Both own exits occupied at once wins. Both participants still agree to Practice again after success because a restart resets their shared state.

First Connection's geometry, relay links, latch-on-entry gates and exits are unchanged. On arrival at a relay, the partner's gate becomes powered immediately. Server command ordering decides near-simultaneous actions: if departure from the relay is processed first, a subsequent attempt to enter an unlatched gate blocks. If entry is processed first, the gate latches and departure is safe. The interface shows current power rather than promising simultaneous effects.

## Commands and state

| Action | Gameplay fields | Meaning |
| --- | --- | --- |
| move | missionId, from, destination | Move the authorized seat from its expected current position to an adjacent tile |
| ping | missionId, cell | Replace this seat's latest public location ping with a walkable cell |
| retryAgreement | missionId | Retain the existing mutual terminal reset |

All retain authenticated room ID, controller epoch, request ID and monotonic seat sequence. Move and Ping do not carry the shared planning revision or turn: the partner's action must not invalidate an otherwise current local move. A wrong own `from` rejects as STALE_POSITION; no automatic reinterpretation as a new relative move. Mission/room/seat/epoch mismatches still reject. Retried identical commands return the committed acknowledgement without executing again.

The store processes each action synchronously and broadcasts the resulting authoritative positions/gate state. If both aim for an occupied tile, the later processed action cannot overlap the current robot. There are no simultaneous swaps or following transactions; a robot must actually vacate a tile before the partner can enter.

The wire room phase remains `planning` for backward lifecycle compatibility; it means the active session for v3, not that confirmations are needed. `foundry.movement` is `independent`; `ruleVersion` is `SF-T1-v3`. Legacy proposal/ready fields remain in the common projection but are not active commands or UI controls for v3. Ready/propose/signal/startAgreement commands reject on this profile; public location signals use Ping instead.

The existing successful-step counter `turnsResolved` is displayed as **Team moves**. No-op, blocked entry, pings and elapsed idle time do not increase it. Latest pings persist across moves and reconnect, can be replaced without a turn quota, and clear on retry. Existing socket payload/rate/resource bounds still apply.

Pause still blocks action processing while a required player is disconnected. Reconnect preserves positions, latches, pings and count, fences old controllers, and resumes without Ready. Browser inputs remain disabled while awaiting their own acknowledgement/snapshot; this is a transport guard, not partner agreement. Keyboard repeat is throttled to a maximum of roughly eight attempted inputs per second and ignored in text inputs.

## Verification

- Final automated suite: 54 passing tests, including retained legacy regressions.
- Actual independent-rule search: 21 reachable states and 58 legal directional requests enumerated; every reachable state can complete.
- Six-step witness: A 0→1→2, B 8→9, A 2→3, B 9→10→11.
- Tested leaving Relay 2 before B enters Gate 9: B blocks, does not accrue a move, and can continue after A returns. A successful entry latches the gate.
- Tested automatic two-client start, stationary idle, simultaneous moves/pings without shared-revision rejection, stale own positions, duplicate delivery, epoch rebinding after reconnect, terminal immutability and mutual retry reset.
- Browser inspection checked direct click, ArrowRight and D movement, automatic start, six-step success, retry and active refresh. Development-only scripted B is not human enjoyment evidence.
- Fixed relay/gate hover and focus highlighting to update only link styling; rebuilding tile contents during a pointer click had suppressed some pings. Mouse location-ping replacement was rechecked after rebuilding.

Sources: [free-movement.test.ts](../game/tests/free-movement.test.ts), [free-wire.test.ts](../game/tests/free-wire.test.ts), [test-evidence.md](test-evidence.md). No actual phone/touch or public-network validation is implied.

## Expansion compatibility

The E1 rooms are still unimplemented proposals. Re-audited them with one robot action processed at a time: [foundry-independent-expansion-validation.json](foundry-independent-expansion-validation.json). SF-M2 retains 220 reachable states and no unrecoverable state; SF-M3 retains 2,496 and no unrecoverable state. Shortest routes are now 16 and 18 individual command steps, not the former 9/11 simultaneous turns.

Future Push/Pull must atomically commit one robot's action with its crate displacement. Simultaneous two-handler cancellation is obsolete: ordered requests need current actor/crate-position checks. Future progression should retain mutually agreed reset/Next choices; it must not reintroduce per-move Ready. Gate/collision/route witnesses must be tested under the actual generalized engine before releasing new rooms.

## Subsequent SF-02 implementation

October 7, 2026: SF-M2 now runs after First Connection under [shared-passage-implementation.md](shared-passage-implementation.md). The earlier Expansion compatibility section describes the research-only status at SYS-04. SF-M2 has now been audited in the actual TypeScript engine: 220 reachable states, all recoverable, shortest 16 steps. SF-M3 remains research-only. Direct independent control remains unchanged; terminal matching Retry/Next choices extend the earlier retry-only contract.
