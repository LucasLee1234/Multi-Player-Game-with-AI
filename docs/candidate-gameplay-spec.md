# Signal Rescue - J1 Candidate Implementation Specification

Date: October 6, 2026
Version: J1-C1
Status: Selected for the next bounded prototype specification, not a release baseline. Paper verification only; no executable J1 model, browser game, or human playtest was created in this preparation pass. G2 and G3 remain open.

This document owns the candidate rules for the next implementation. [game-design.md](game-design.md) remains the historical 0.2 extraction design; do not combine its extraction behavior or route counts with this candidate. The participant requested the recommended J1 specification, asymmetric mission, and low-fidelity layout. This authorizes this preparation pass, without implying acceptance of untested enjoyment or resuming the previously deferred prototype.

## 1. Player outcome and scope

Two people join a browser room from separate devices. Each sees the partner's hazard layer, shares truthful warnings, proposes a move for their own robot, and confirms the shared plan. Win by placing both robots on their respective exits at the same time. A robot stays movable after arriving and can leave its exit to help the partner.

Prototype content: one unscored teaching mission and one unscored asymmetric mission. Eight resolved turns and a three-strike failure limit are candidate parameters, not proven balance. Show result, turns used, and strikes; omit numerical points and leaderboards from this candidate. The old score formula is historical comparison material. Adding points later requires evidence that they improve the experience.

Retain exactly two players, a 3-by-3 grid, static robot-specific hazards, no required voice chat, no runtime AI, no procedural content, and no player accounts. The prototype should test cooperation after disclosure rather than promise that information stays hidden throughout play.

Requirement links: FR-07 to FR-14, FR-16 to FR-23; NFR-01 to NFR-06, NFR-12, NFR-14 in [requirements-analysis.md](requirements-analysis.md). FR-15 scoring is optional and deliberately omitted. Room authorization, agreement, reconnect, expiry, and deployment contracts are in [architecture.md](architecture.md).

## 2. Board, state, and information

```text
0  1  2
3  4  5
6  7  8
```

- A starts at 3; its exit is 5. B starts at 5; its exit is 3.
- Every authored mission has exactly two hazards per robot, excluding that robot's start and exit. A hazard affects only the named robot. There is no extracted robot or cell 9.
- Both positions, both exits, proposals, readiness, turn, strikes, and transmitted signals are public.
- A receives B's entire hazard layer; B receives A's. Own-layer knowledge starts with own start and exit marked Safe; other cells are Unknown. Confirmed signals, successful visits, and hazard attempts persist until the mission resets.
- If both own hazards become known, all remaining own cells can logically be deduced safe because the two-hazard count is public. For C1, automatically mark these cells `Safe (deduced)` using only authorized knowledge. This is a candidate clarity change, not a new private-state disclosure. Before both hazards are known, do not treat an unsignaled cell as Safe merely because its counterpart is safe for the partner.
- Keep knowledge provenance internally: start/exit, signal, visit, hazard attempt, or deduction. Public learned cells do not expose either complete undisclosed hazard layer.

Server projections must follow the allowlist in the architecture. Mission content and solution traces must not be bundled with client assets. A player who remembers a previous mission may know more than the interface; replay is practice.

## 3. Planning and confirmation

Turn 1 begins at the starting positions with zero strikes, both proposals set to Wait, and both humans unready. Each player can send one free truthful cell signal about the partner's hazard layer per turn. The server supplies Safe or Danger; an accepted signal cannot be changed that turn. Repeating a previously signaled cell consumes the allowance. No quota carryover or point penalty applies.

Each player proposes one cardinal adjacent destination or Wait for their own robot. Nonadjacent or out-of-board requests are rejected without resolving a turn. Known-danger attempts remain legal but carry a visible warning; Unknown attempts are marked `Unverified`. Neither kind of attempt is necessary for the verified mission witnesses.

Accepted new signals or changed proposals increment the planning revision and clear both Ready states. Unchanged proposals are no-ops. Ready refers to the current revision. The second valid Ready resolves that revision exactly once; duplicate or stale requests cannot advance play. A new nonterminal turn resets proposals to Wait, readiness, and signal allowances while preserving positions and knowledge.

Both robots and both signaling controls remain active until termination, including when a robot occupies its exit. There is no forced move deadline while connected; room inactivity limits still apply. A signal is optional. Both players may Wait to exchange information, at the cost of a resolved turn.

## 4. Exact resolution order

Resolve against the starting positions for that turn:

1. For each attempted destination hazardous to its robot, add one team strike, reveal that own hazard, and leave that robot at its starting position. Other attempts produce their tentative destinations. Two hazardous attempts add two strikes.
2. If tentative positions coincide, both robots remain at their original positions. Also block a direct swap of the original positions. Following into a cell the partner successfully vacates is allowed. Collision blocks add no strikes but consume the turn; prior hazard strikes are retained.
3. Mark each actually occupied destination Safe in that robot's knowledge. Keep the robots on the board regardless of exit occupancy.
4. If cumulative strikes are at least three, fail. Otherwise, if A occupies 5 and B occupies 3, succeed. Otherwise, if the just-resolved turn is eight, fail for running out of turns. Otherwise begin the next turn.

Thus a zero-strike joint arrival on turn eight wins. A third strike takes precedence over arrival. Waiting together consumes a turn. Reaching only one exit does not save progress permanently or disable controls. No commands can modify gameplay after termination.

Explain each result in terms of hazards, blocked overlap/swap, or movement. Derive public preview warnings only from public positions and proposals; do not predict an undisclosed hazard's effects before resolution.

## 5. Session continuation and interruptions

Both current players must agree to start. At a terminal screen, choices are Retry and, when an authored next mission exists, Next mission. Matching choices start exactly one new mission; disagreement remains visible and revisable. After the final mission, show `Practice again` (Retry) and `Leave room`, with no invented next level. Retry fully resets mission knowledge, positions, turn, strikes, signals, and readiness under a new mission ID.

Use the architecture's lifecycle unchanged: a detected disconnect pauses the session and clears agreement; reserve both seats for the 60-second recovery window. Both must reconnect and freshly confirm before progress. Expiry or explicit leave during a mission ends the room without a score. A previously committed terminal result remains an outcome, even if its room subsequently closes. Server state loss ends the session with an explicit message; do not fake successful recovery.

## 6. Authored mission candidates

| ID | Title | A hazards | B hazards | Role |
| --- | --- | --- | --- | --- |
| J1-T1 | Make Room | 1, 7 | 1, 7 | Teach hazard labels, signals, public plans, following, and joint exit; symmetric layers are intentional |
| J1-M1 | Different Dangers | 1, 7 | 0, 7 | Test genuinely different safety information and shared movement constraints |

Both use the starts/exits and eight-turn/three-strike bounds above. These are the entire initial content scope. No claim of broad replay variety or optimal route length is made.

Tutorial instruction, delivered in short steps without requiring spoken coaching:

1. `Your route is on the left. You can see your partner's dangers on the right.`
2. `Select a cell on your partner's map to send a truthful signal.`
3. `Choose your move. Check both proposals, then both press Ready.`
4. `Bring both robots to their exits together. You can leave your exit to make room.`

Explain blocked swaps and allowed following with a small public-position example before the first mission. The tutorial route is the seven-turn witness in [gameplay-cooperation-analysis.md](gameplay-cooperation-analysis.md), using two disclosure Wait turns then the five movement turns. It is paper-checked only. Whether the instructions suffice without coaching remains a human test.

## 7. Asymmetric mission: justified seven-turn witness

For J1-M1, A sees that B's hazards are 0 and 7. B sees that A's hazards are 1 and 7. The difference matters: A may safely enter 0 while B may not; B may enter 1 while A may not. Do not show the same cell's safety as universal.

At the start, both know their own start and exit are safe. Each knows there are exactly two hazards. On turns 1 and 2, both voluntarily Wait while transmitting their partner's two hazards. Each move afterward is justified from learned information and the two-hazard count; no omniscient route knowledge or blind guess is needed.

| Actual turn | A sends to B | B sends to A | A proposal | B proposal | Resolved positions | Why legal and informed |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 0 Danger | 1 Danger | Wait at 3 | Wait at 5 | (3,5) | Starts known safe; both learn the differing danger |
| 2 | 7 Danger | 7 Danger | Wait at 3 | Wait at 5 | (3,5) | Both learn the second hazard and deduce other cells safe |
| 3 | Optional; none needed | Optional; none needed | 0 | 4 | (0,4) | Both cardinal, own-safe, distinct, and not a swap |
| 4 | None needed | None needed | Wait at 0 | 3 | (0,3) | B arrives at its exit; A is still short of its exit |
| 5 | None needed | None needed | 3 | 6 | (3,6) | B yields into a safe pocket; A follows into vacated 3 |
| 6 | None needed | None needed | 4 | 3 | (4,3) | B returns behind A; neither target overlaps nor swaps |
| 7 | None needed | None needed | 5 | Wait at 3 | (5,3) | Simultaneous own-exit occupancy: success, zero strikes |

Movement phase uses five turns; total uses seven of eight, leaving one turn for recovery. This establishes one safe, informed route, not a shortest-path result or novice discoverability.

### Cooperation remaining after disclosure

In A's safe graph, removing 4 separates the left component containing start 3 from the right component containing exit 5: hazards 1 and 7 block the other crossings. Therefore A must use 4.

For B, exit 3 can be approached from 4 or 6; cell 0 is hazardous, and safe cell 6 can only be reached from 3 because 7 is hazardous. Therefore B must also pass through 4 before reaching its exit. Sharing this bottleneck requires compatible timing even when all hazards have been disclosed.

At (0,3), A has only one safe departure, into occupied 3. If A intends to leave that pocket now, B must vacate safely. B staying blocks A; B attempting 0 is hazardous and cannot exchange positions safely; B yielding to 6 allows the checked continuation. Moving B to 4 is also legal at this step, but creates another coordination problem rather than proving immediate failure.

This is a necessary yielding decision for this witnessed situation, not a claim that every winning route requires leaving an exit. For example, after the same two disclosure turns, the following alternative succeeds on turn six:

```text
(3,5) -> (4,2) -> (5,1) -> (5,4) -> (5,3)
```

Every move is cardinal/Wait and own-safe; both still time access to 4. B's safe use of 1 makes this alternative possible, whereas A cannot use 1. Alternative plans are an opportunity for discussion, not a defect to eliminate by concealing information. The paper example does not prove equal participation, sustained difficulty, or fun.

### Tempting failed plan and recoverable mistakes

Starting from (0,3) after turn 4:

| Turn-5 plan | Resolution | Consequence | Recovery |
| --- | --- | --- | --- |
| A -> 3; B Wait at 3 | Same tentative cell; both stay at (0,3) | No strikes; one turn consumed | Execute (3,6), (4,3), (5,3) on turns 6-8; succeeds at the limit |
| A -> 3; B -> 0 | B attempts its known hazard, stays at 3; A then overlaps B, so both stay at (0,3) | One strike retained; one turn consumed | Same turns 6-8 continuation succeeds with one strike |

The second plan is a useful negative example for robot-specific safety and hazard-before-collision order. It is avoidable from the information already known. With two prior strikes it would instead fail immediately; do not present recovery as unconditional. Two wasted turns at this point exceed the eight-turn budget. No hazard attempt is required to learn the mission.

### Each participant's opportunity to contribute

- A identifies and communicates B's distinctive hazard at 0, evaluates the left pocket, and proposes a route toward 5.
- B identifies and communicates A's distinctive hazard at 1, chooses a compatible route through 4, and either yields from 3 or proposes the upper alternative via 2 and 1.
- Both can inspect the public intentions, change the plan, and explain a collision. Ready itself is not counted as evidence of meaningful reasoning.

One person may still lead. Human observation must determine whether both actually understand and contribute, rather than inferring this from required attendance.

## 8. Verification record and implementation checks

Paper checks completed in this pass:

| ID | Check | Result and scope |
| --- | --- | --- |
| P-01 | Grid and hazard legality | Both lists have two distinct in-board hazards, neither on that robot's start/exit |
| P-02 | Information trace | The first two turns explicitly disclose both own hazards before any unknown-cell movement |
| P-03 | Seven-turn route | Each consecutive destination is cardinal/Wait, own-safe, distinct, and not a swap; final exits occupied |
| P-04 | Coupling countercheck | Both must traverse 4, but an alternate four-movement-turn route disproves mandatory exit departure |
| P-05 | Recovery traces | One collision turn or one hazard-plus-collision turn permits the same three-step completion by turn eight |
| P-06 | Rule/document separation | No extraction, old route totals, numerical score, or executable J1 validation is carried into C1 |

These are manual deductions and route reviews, not software tests. Once implementation is authorized, test the actual J1 engine against these witnesses and meaningful boundaries: overlapping intentions, direct swaps, following, hazard-stopped occupancy, two strikes in a turn, failure precedence, turn-eight victory, knowledge persistence/deduction, arrival without extraction, optional/repeated signals, and complete retry reset. Inspect real per-seat payloads for privacy. Use the architecture's concurrency and interruption checks for the transport layer.

For the first-time playtest, record whether players can distinguish layers and Unknown, send a signal, explain the simultaneous-exit objective, recover from a blocked plan, and contribute a plan without spoken teaching. Record enjoyment/replay interest honestly. If the mission feels too short or procedural, adjust one demonstrated problem before adding mechanics or content.

## 9. Readiness and next short cycle

Subsequent implementation update: the participant explicitly resumed coding. SYS-01 room/connection work is now complete locally; [test-evidence.md](test-evidence.md) records coverage. Next is SYS-02 using this candidate for a synchronized turn. Earlier deferral statements describe this specification's preparation pass, not the current coding authorization.

The candidate is specific enough to implement and compare when prototype work resumes. Its examples and low-fidelity layout are bounded preparation evidence; G2 acceptance, G3 public proof, mobile touch fit, discoverability, and balance remain unverified.

The static layout is [mobile-wireframe.html](mobile-wireframe.html); it demonstrates hierarchy, not a working game. Next coding slice remains SYS-01 from the architecture: establish isolated project Git/runtime and implement create/join/connection state. Keep Start visibly unavailable until actual mission initialization exists. Then use J1-C1 for the smallest synchronized-turn increment; do not repeat unrestricted concept analysis before that evidence exists.
