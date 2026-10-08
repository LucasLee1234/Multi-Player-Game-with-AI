# Handoff Workshop: Fourth-Room Design

Date: October 8, 2026
Status: Validated design proposal; not installed in the live three-room campaign.

Implementation update, October 8: this proposal has now been installed as stage 4. The proposal status and checklist below describe the original design checkpoint. [Implementation and current evidence](handoff-workshop-implementation.md) supersede the earlier not-installed status.

## Purpose and scope

Create a new cooperation puzzle using the existing movement, Push, Pull, relays, pressure gates and latching gates. The handoff is a change of support responsibility: A helps B cross, B powers the delivery route, then A returns to release B. Either robot may transport the crate. Do not add a compulsory "both players touched the crate" objective, a countdown, another control panel or a new tutorial overlay.

The participant reports enjoying the existing game. This design's enjoyment, difficulty and readability remain hypotheses until it is played. Mathematical solvability is not evidence of fun.

## Exact proposed layout

Cell IDs use `y * 5 + x`. The board has five columns and four rows, fifteen floor cells and five walls. This is one row taller than room three; implementation must verify that the board still fits the single-screen interface on narrow and short viewports.

```text
 IDs                       Initial contents
 00  01  02  03  04         A   .   G1  .   EA
 05  06  07  08  09         #   R1  #   R2  .
 10  11  12  13  14         EB  G2  C   G3  B
 15  16  17  18  19         #   R3  #   P   #
```

`A/B`: robots; `EA/EB`: their exits; `C`: crate; `P`: marked crate parking target; `G`: gate; `R`: relay; `#`: wall; `.`: ordinary floor. Floor cells can also contain a robot or crate during play.

| Item | Cell | Rule |
| --- | --- | --- |
| Robot A / exit A | 0 / 4 | Independent cardinal movement |
| Robot B / exit B | 14 / 10 | Independent cardinal movement |
| Crate / parking target | 12 / 18 | Push by moving into it; Pull with existing F/touch mode |
| Gate G1 / relay R1 | 2 / 6 | Latches after a robot or crate successfully enters the gate |
| Gate G2 / relay R2 | 11 / 8 | Open only while relay 8 is occupied |
| Gate G3 / relay R3 | 13 / 16 | Open only while relay 16 is occupied |
| Walls | 5, 7, 15, 17, 19 | Impassable |

Completion requires **A on 4, B on 10 and the crate on 18 at the same time**. Parking alone does not complete the room. Cell 18 is a parking objective; no additional gate is wired to it. Do not imply that the parked crate powers either pressure gate.

Authoring source: [proposed mission JSON](../game/research/handoff-workshop.json). Production movement rules remain authoritative: [joint-exit.ts](../game/src/rules/joint-exit.ts).

## Intended cooperation

1. **Open the shared upper route.** A reaches relay 6. B takes the northern route and enters gate 2, which latches open.
2. **Exchange sides.** A steps back into cell 0 to let B pass through 1 into 6. A then takes the newly opened route to relay 8. This uses a safe waiting bay rather than an overlap or direct swap.
3. **Hand off support.** A on relay 8 admits B through gate 11 into control pocket 16. B now powers gate 13. A may leave relay 8; gate 11 closes, so B needs A's later assistance to return.
4. **Turn the delivery.** With B holding 16, A reaches 13, pulls the crate from 12 into 13 by stepping right to 14, walks around through 9 and 8, then pushes the crate down into target 18.
5. **Bring the partner home.** A returns to relay 8. B leaves pocket 16 through gate 11 and reaches exit 10. A reaches exit 4. Staying on an exit never removes a robot or prevents it helping again before completion.

The clockwise right-hand service loop makes a ninety-degree crate turn possible. The return to relay 8 gives the support player a visible reason to stay involved after delivery.

Alternative routes are allowed. The search also reaches completion with gate 2 still unlatched, so the northern crossing is a route option rather than a mandatory puzzle milestone. Only parking and joint exit are completion conditions; hints must not claim a specific sequence is required.

## Engine-verified shortest witness

The following route uses 26 successful individual steps, not synchronized turns. Unlisted robots remain still. "Move" automatically pushes when the destination contains the crate. After the Pull at step 18, return to Move mode before step 21; mode switching is not counted as a movement step.

| Step | Robot | Action / destination | Crate after action | Purpose |
| --- | --- | --- | --- | --- |
| 1 | A | Move 1 | 12 | Approach support relay |
| 2 | A | Move 6 | 12 | Power gate 2 |
| 3 | B | Move 9 | 12 | Take northern service loop |
| 4 | B | Move 8 | 12 | Continue north |
| 5 | B | Move 3 | 12 | Approach gate 2 |
| 6 | B | Move 2 | 12 | Latch gate 2 open |
| 7 | A | Move 1 | 12 | Clear relay bay |
| 8 | A | Move 0 | 12 | Make space for B |
| 9 | B | Move 1 | 12 | Exchange sides |
| 10 | B | Move 6 | 12 | Approach gate 11 |
| 11 | A | Move 1 | 12 | Use cleared passage |
| 12 | A | Move 2 | 12 | Cross latched gate |
| 13 | A | Move 3 | 12 | Approach relay 8 |
| 14 | A | Move 8 | 12 | Power gate 11 |
| 15 | B | Move 11 | 12 | Enter powered gate |
| 16 | B | Move 16 | 12 | Power gate 13 |
| 17 | A | Move 13 | 12 | Stand beside crate |
| 18 | A | Pull 14 | 13 | Pull crate into powered gate 13 |
| 19 | A | Move 9 | 13 | Walk around crate |
| 20 | A | Move 8 | 13 | Stand above crate |
| 21 | A | Move 13 (Push) | 18 | Park crate on marked target |
| 22 | A | Move 8 | 18 | Power B's return gate |
| 23 | B | Move 11 | 18 | Leave control pocket |
| 24 | A | Move 9 | 18 | Clear relay area |
| 25 | A | Move 4 | 18 | Reach exit A |
| 26 | B | Move 10 | 18 | Reach exit B; complete |

This witness has 16 A steps and 10 B steps. There is no timed hold: B can wait safely on 16 during the five-step transport sequence. This is a route example, not a mandated solution or an estimated play duration.

## Validation and design correction

The audit imports the compiled production `newMission` and `moveFoundry` functions. It searches every reachable gameplay configuration and reverse-searches from successful configurations. State identity includes A position, B position, crate position and latched gates. Turn counters, messages and request revisions are excluded because they do not affect future spatial legality in this independent, untimed room.

| Check | Result | Interpretation |
| --- | --- | --- |
| Reachable configurations | 2,000 | Exhaustive for this authored map and current movement rules |
| Successful action edges | 6,526 | Blocked requests and mode-only changes excluded |
| Successful configurations | 2 | Same exit/target positions, with different latch history |
| Configurations with a completion route | 2,000 | No reachable spatial softlock under these rules |
| Shortest completion | 26 moves | Breadth-first minimum |
| Largest minimum completion distance from a reachable state | 40 moves | Recovery may require repositioning; not a difficulty rating |
| A alone can move, B stays at start | No completion; 3 configurations | A needs B's participation |
| B alone can move, A stays at start | No completion; 5 configurations | B needs A's participation |
| Only A may move the crate; both may walk | Completion possible | Mandatory shared crate handling is not enforced |
| Only B may move the crate; both may walk | Completion possible | Either transport specialist is supported |
| Shortest route in which both transport | 28 moves | The first witness contains a pull immediately undone by a push |

**Correction:** requiring both players to move the crate would reward a pointless detour in the discovered 28-step witness. The selected design therefore treats handoff as support-role exchange, not mandatory crate ownership. Do not advertise forced crate passing. If later human feedback asks for genuine shared transport, design and audit another geometry rather than adding a hidden touch counter.

All-state recoverability includes misplaced crates, prematurely abandoned relays and closed gates around existing occupants. A pressure gate blocks new robot/crate entry while closed; an occupant can leave. The audit proves a path exists with cooperation, not that an inexperienced player will discover it easily. Restart and Leave must remain available.

Evidence: [machine-readable results](handoff-workshop-validation.json), [rerunnable audit](../game/research/handoff-workshop-audit.mjs). Results were reproduced after a fresh production build. The report records the compiled engine SHA-256 for traceability. It does not test networking, rendering, input mode persistence or two-human enjoyment.

From the project root, using an available Node executable:

```powershell
node game/scripts/check.mjs build
node game/research/handoff-workshop-audit.mjs
```

## Interface and readability contract

- Retain the current single-screen game layout and menu. Add no persistent instruction card, Ready button or extra transport button.
- Show the existing crate target marker clearly on 18 from the start, with completion state when occupied.
- Give gates 11 and 13 their existing pressure-gate styling and explicit relay numbers. Keep gate 2 visibly distinct as latching.
- Use the existing first-encounter movement/crate lessons and menu help. Returning players should not receive another movement or Push/Pull lesson.
- Use a short room hint: "Trade support roles: Relay 8 opens Gate 11; Relay 16 opens Gate 13. Park the crate on 18, then reach both exits."
- Contextual blocked-gate feedback should name the relay needed. Do not silently open gate 13 when relay 16 is unoccupied.
- Check the existing cargo completion feedback before integration: it currently calls every target a powered relay. A parking-only target needs accurate wording without claiming it controls a gate.

## Implementation checklist for the next coding cycle

- [ ] Register this mission as stage 4 after Keep the Power On, keeping the prior layouts intact.
- [ ] Derive campaign room count from authoritative metadata instead of extending a release-specific hardcoded number. Current progress rendering in `game/src/client/main.ts` assumes three rooms for the crate release.
- [ ] Expand or derive valid completion-history stage IDs; current local-storage restore allowlist contains only 1, 2 and 3.
- [ ] Confirm the server's level catalog and mutual level-selection contract include stage 4.
- [ ] Preserve green marks only for genuinely completed rooms; selection and restart must not mark completion.
- [ ] Make cargo parking feedback accurate for target 18 and maintain the current target marker.
- [ ] Add meaningful mission integration checks: actual room-three-to-four progression, fourth-room reset, consent-bound selection, completion and final replay/exit behavior.
- [ ] Run the production rule audit and relevant regressions after integration.
- [ ] Verify browser play with two contexts: the 26-step witness, pressure gates, F/touch Pull switching, restart and final exit.
- [ ] Check desktop, narrow portrait and short landscape layouts for board fit, legible symbols, reachable menu and no page scrolling.
- [ ] Observe a first-time partner: identify the target, explain who powers each gate, perform the turn and rescue the support player. Record confusion and replay interest separately from automated evidence.

Design readiness: ready for a bounded implementation cycle. No production mission registration, live room changes or public release are part of this design task. If human play reveals excessive waiting, confusing wiring or poor board fit, revise this room before increasing campaign size again.
