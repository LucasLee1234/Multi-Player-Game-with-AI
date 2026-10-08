# Signal Foundry: Cooperation and Obstacle Expansion

Date: October 7, 2026
Version: Expansion research E1

Control update, October 7: the participant requested independent movement. [independent-movement-spec.md](independent-movement-spec.md) overrides the confirmation/turn assumptions below. An ordered, single-action re-audit found no unrecoverable state in either room, with shortest routes of 16/18 individual steps: [new evidence](foundry-independent-expansion-validation.json). The nine/eleven-turn witnesses below remain historical simultaneous examples. Do not add Ready to the future expansion or treat two simultaneous crate requests as its new resolution model.
Implementation update, October 7: SF-M2 is now playable after First Connection. [SF-02 implementation](shared-passage-implementation.md) is the active shared-room contract; its actual TypeScript search matches 220 reachable states, all recoverable, shortest 16 individual steps. Sixty-one regressions and scripted-partner browser inspection passed. SF-M3 was subsequently implemented on October 8: [crate implementation](crate-implementation.md). Actual ordered rules have 2,496 recoverable states and an 18-step minimum; 67 regressions and scripted browser delivery/retry/narrow checks passed. Earlier simultaneous tables below are historical model evidence.

## 1. Feedback and intended outcome

The participant reported enjoying the current room and requested more complex gameplay, more obstacles, and more opportunities to cooperate. This is participant feedback, not a recorded two-human session or an independent friend's observation.

Expand the game around decisions about support, transport, routes, and shared space. Retain First Connection unchanged as the first teaching room. A longer corridor with additional identical gates would mostly increase waiting; it is not the recommended expansion.

Recommended progression:

| Room | New learning | Shared decision |
| --- | --- | --- |
| SF-T1 First Connection | Partner power and gates that latch open | Who enables the first crossing? |
| SF-M2 Trade Places | A hold-open pressure gate, shared passages, and parking spaces | Which route do we use, and where does each robot make room? |
| SF-M3 Keep the Power On | One movable crate, pushing/pulling, and sustained power | Where should the crate go, and how do we keep each other's path clear? |

Introduce one main obstacle family per room. No countdown, damage, enemies, physical rope, jumping, inventory, or procedural generation is needed for these designs.

## 2. Shared movement and gate rules

Use a 5-column, 3-row grid. Cell IDs are `y * 5 + x`. Moves are cardinal adjacent or Wait; no row wrapping. Robot roles control only their own actions. Preserve public proposals, current-plan mutual confirmation, and tile pings.

Two gate types are deliberately distinct:

- **Latching gate, cell 2:** Relay 6 opens it. First successful entry by a robot or crate latches it open for the attempt. Label `Latching gate` and `Latched open` explicitly.
- **Pressure gate, cell 11:** Relay 8 opens it only while occupied. It never latches. Label `Hold-open gate` and identify Relay 8 on the gate. Closing blocks new entry but never crushes an occupant or stops that occupant leaving.

Relay power is evaluated from positions at the beginning of the turn. A robot may leave a relay on the same turn the partner enters its gate. Moving onto a relay only enables new entry next turn. This is positional planning, not a test of reaction speed.

Closed-gate attempts become Wait, with feedback. Do not add a strike or fail the mission. Tentative robot overlap, direct swaps, or robot/crate overlap cancel the entire movement transaction for that turn, including any crate movement and new latching. Following into an actually vacated cell is allowed. A both-Wait or blocked turn still increments the displayed turn count.

These are expansion research rules. They do not silently change SF-T1's gate types or its production contract.

## 3. SF-M2: Trade Places

### Layout and objective

```text
Cell IDs          Contents
 0  1  2  3  4    A  .  L  .  XA
 5  6  7  8  9    #  P  #  Q  #
10 11 12 13 14    XB H  .  .  B

P6 → L2: latching gate
Q8 → H11: hold-open pressure gate
```

Walkable cells: 0, 1, 2, 3, 4, 6, 8, 10, 11, 12, 13, 14. Walls: 5, 7, 9. A starts at 0 and exits at 4; B starts at 14 and exits at 10. Both exits must be occupied simultaneously. No crate, turn limit, or numerical score.

This is a connected map. Cells 0 and 14 can act as parking spaces after their robot departs. A player is allowed to revisit a start cell or leave an exit.

### Executed nine-turn southern route

| Turn | A destination | B destination | Cooperation |
| --- | --- | --- | --- |
| 1 | 1 | 13 | Both approach their working positions |
| 2 | 6 | 8 | B powers the pressure gate; A is ready to enter |
| 3 | 11 | Wait at 8 | B's support lets A through |
| 4 | 12 | 13 | B vacates the relay; the occupied pressure gate was already cleared |
| 5 | 13 | 14 | B parks to make room for A |
| 6 | 8 | 13 | A reaches the relay; B follows into a vacated cell |
| 7 | Wait at 8 | 12 | A now supplies the partner's power |
| 8 | 3 | 11 | B enters using start-of-turn power while A leaves the relay |
| 9 | 4 | 10 | Joint exit |

This shortest route does not use the latching gate at 2. That is an intentional route choice, not proof that every placed obstacle is mandatory.

### Executed twelve-turn northern alternative

```text
(0,14) -> (1,13) -> (6,8) -> (6,3) -> (6,2)
-> (6,1) -> (6,0) -> (1,0) -> (2,1) -> (3,6)
-> (8,6) -> (3,11) -> (4,10)
```

A holds Relay 6 while B crosses Gate 2. B then uses the vacated start cell 0 as a parking space. A passes to the right and powers Relay 8 so B can reach its exit. Directly swapping A at 6 with B at 1 fails; the side space permits a different plan.

Both routes are valid. Do not force the longer one through instructions or present Gate 2 as required. Let players compare holding the southern gate with opening the northern route. Permanently disabling Gate 11 prevents completion; disabling Gate 2 still permits the southern solution.

### Intended interaction

Players should encounter a choice of routes, recognize that standing on a relay helps the partner, and adjust positions when they cannot pass. The obstacle is a shared dependency, not an invisible penalty. Waiting is purposeful in the recorded shortest witness: only two of its eighteen player-action slots are Wait.

This one witness does not characterize all play. People can still spend longer waiting or allow one person to direct the entire puzzle.

## 4. SF-M3: Keep the Power On

### Layout and objective

Use SF-M2's layout with a crate at cell 12 and a new walkable service bay at cell 9:

```text
A  .  L  .  XA
#  P  #  Q  .
XB H  C  .  B

C starts at 12.
Cell 9 connects 4, 8, and 14.
```

Win only with A at 4, B at 10, and Relay 8 still powered. Since neither exit occupies Relay 8, the crate must finish at 8. Explain this as keeping the extraction system powered; show separate checks for both robots and sustained power.

The service bay has a purpose: it allows the robot at 14 to move around a crate at 13 instead of trapping both players. Its extra connection also makes the northern gate optional in some solutions. Keep both route possibilities rather than implying all machinery must be used.

### Crate rules

One crate only. It occupies one tile, blocks robot occupancy, and powers relays while on them. Either robot can manipulate it; there are no strength classes or ownership rules.

- **Push:** propose a normal move into the adjacent crate. The crate moves one tile in the same direction and the robot occupies its former cell. The crate's destination must be adjacent walkable floor, traversable under turn-start gate state, and unoccupied by either robot at turn start. No chain push.
- **Pull:** explicitly select Pull and propose an adjacent move away from the crate directly behind the robot. The robot moves forward and the crate enters the robot's former cell. Both entry cells must be traversable at turn start. Pull cannot move diagonally or act without an adjacent crate behind.
- A robot or crate already inside a closed pressure gate can leave it. Moving a crate into that closed cell as part of Pull is a new entry and is blocked.
- A blocked manipulation leaves that robot and crate unchanged; the partner's unrelated valid move may still occur.
- If both otherwise valid actions attempt to manipulate the same crate, cancel both moves and the crate movement. Explain `Both robots tried to move the same crate. Choose one handler this turn.`
- Resolve robot/crate collision before committing movement or latches. A collision cancels the movement transaction for both players. No damage applies.
- Robot and crate positions, gate states, and proposed crate displacement are public. A preview must distinguish the action from its proposed consequence; it is not a committed move.

### Executed eleven-turn witness

| Turn | A action | B action | Crate afterward |
| --- | --- | --- | --- |
| 1 | Wait at 0 | Move to 13 | 12 |
| 2 | Wait at 0 | Pull toward 14 | 13 |
| 3 | Wait at 0 | Move to 9, using the service bay | 13 |
| 4 | Move to 1 | Move to 8 | 13 |
| 5 | Move to 6 | Pull toward 3 | 8; sustained power established |
| 6 | Move to 1 | Move to 2; A's relay power permits entry | 8 |
| 7 | Move to 0, making room | Move to 1 | 8 |
| 8 | Move to 1 | Move to 6 | 8 |
| 9 | Move to 2 | Wait at 6 | 8 |
| 10 | Move to 3 | Move to 11, powered by the crate | 8 |
| 11 | Move to 4 | Move to 10 | 8; success |

This solver-selected route uses B for both pulls. Crate handling is not a mandatory unique role: A can also perform it in other states. Do not claim both players handle the crate in every solution.

A may prepare at 1/6 earlier than the displayed route while B works, redistributing the same necessary waiting. The witness has four Wait slots out of twenty-two actions; its ratio is approximately 18%, compared with 40% in SF-T1's five-turn witness. These are route-level counts, not an enjoyment measurement.

### Rejected design and repair

Without the service bay at 9, the research search found four softlocked states among 1,662 reachable states, despite having Pull. One is `(A12, B14, crate13, gate2 unlatched)`: the crate and pressure gate prevent either player making the necessary recovery.

The added service bay removes those dead ends in the revised model. Push alone also cannot complete this authored crate-delivery objective; Pull is a required control for this room, not optional polish.

## 5. Executed verification

Research source: [foundry_expansion_probe.py](../game/research/foundry_expansion_probe.py). Output: [foundry-expansion-validation.json](foundry-expansion-validation.json).

```text
python game/research/foundry_expansion_probe.py
```

| Candidate | Reachable states | Enumerated transitions | States without a completion path | Shortest completion |
| --- | --- | --- | --- | --- |
| SF-M2 | 220 | 1,962 | 0 | 9 turns |
| SF-M3, with service bay | 2,496 | 79,842 | 0 | 11 turns |

Thirty explicit boundary/witness checks passed. Breadth-first search establishes shortest routes; reverse reachability from all winning states checks recovery from every reachable state. Terminal states do not accept further movement. Gate-disable counterchecks distinguish mandatory and optional obstacles. The rejected map and Push-only counterexample are recorded rather than discarded.

Limits: full-information Python research only; no changed TypeScript engine, protocol, browser UI, actual phone test, or new human observation. Unlimited puzzle turns and the specified Pull/collision rules are part of the recovery result. Do not transfer these counts to a different map or resolution order.

## 6. Implement in two short cycles

### Cycle SF-02: shared passages and pressure gate

First generalize the server-owned mission definition to own geometry, starts/exits, gate types, and relay links. Preserve SF-T1's existing content/rules. Render declared map dimensions rather than assuming twelve fixed tiles. Add SF-M2, pressure-gate labels and matched mutual Next-room agreements after success.

Both players must agree to the same transition: Retry or Next room. Neither choice silently overrides the other. The final room offers Retry and Leave only. A conflicting choice remains visible and revisable; a disconnect clears agreement. Room roles, cookies, command sequence and controller epoch continue across a new mission ID.

Acceptance: both SF-M2 routes work under the actual engine; a closing gate permits occupant escape; invalid swaps block; following and parking work; repeated confirms/transition requests cannot advance twice; retry resets gate latches; phone layout uses the declared dimensions. Original SF-T1 and room regressions must still pass.

### Cycle SF-03: sustained power and crate transport

Add one authoritative crate position and move-versus-pull intent. Include movement kind in semantic retry identity and the current planning revision. Send no client-authored gate or crate state. Reset/recovery must include the crate and sustained-power objective.

Add SF-M3 and a short contextual demonstration of Push/Pull before the puzzle. Do not hide Pull inside an undocumented gesture. Show `You`, `Partner`, `Crate`, each gate type and links with symbols/text as well as color. Expose all proposed robot/crate destinations before confirmation.

Acceptance: execute the eleven-turn witness, verify Push/Pull and two-handler collisions, reject wall/gate/occupied-cell pushes, reproduce recovery properties in the actual engine, and test pause/reset/terminal/transition behavior with two authorized wire clients. Then observe two humans and actual phone controls.

The original request authorized complexity design. Subsequent participant continuation authorized SF-02 implementation; SF-M2 now runs locally. SF-03 is the remaining recommended bounded implementation cycle.

## 7. Further obstacle backlog

| Optional later idea | Cooperation it could add | Required research before adoption |
| --- | --- | --- |
| Two-relay power circuit | Crate powers one input while a robot holds another | Explicit AND-power rule, safe exit/recovery layout, new solvability audit |
| One-way conveyor tile | Partner arranges the route before stepping onto transport | Exact one-tile displacement/collision rules and recoverability; avoid continuous physics |
| Complementary maintenance displays | Each player sees a different circuit clue and can mark a shared target | Useful private information that survives initial disclosure; first-time comprehension |

These ideas have no validated levels or implementation. Prefer the two checked rooms over adding all three. Keep structured tests around October 25-26 and the October 28 submission target; hosting/cost/public access remain independent obligations.

## 8. Human inspection goals

Record actual behavior: do both propose a route; does someone notice a parking space; does the partner's support alter a decision; can players explain Powered versus Latched open; is Pull discoverable; do blocked attempts feel understandable; and do they want the next room?

Also observe whether one person issues every instruction, the first three crate actions leave A bored, or repeated Ready presses interrupt the flow. Fix those specific observations before adding more obstacles. One owner's positive reaction is valuable directional feedback but does not close G2/G3 or establish contest readiness.
