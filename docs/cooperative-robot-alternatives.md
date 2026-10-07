# Cooperative Robot Gameplay Exploration

Date: October 6, 2026
Status: Research proposal in response to the participant's request. No replacement gameplay has been selected or implemented. Signal Rescue B and the running J1 prototype remain the current baseline.

## Player outcome

Two people control separate robots and overcome obstacles by changing what their partner can do. The desired moment is: "You opened my route; now I can help you through." Cooperation should remain meaningful after the players understand the map.

Current J1 already contains robot movement and shared-space coordination. Its risks are a repeatable two-turn information disclosure opening, frequent mutual confirmation, and limited variety in one small map. These are design concerns, not observed human findings. Adding robot artwork alone would not address them.

## External references

Official product pages checked on October 6, 2026:

| Reference | Verified description | Design inference for this project |
| --- | --- | --- |
| [Biped — PlayStation](https://store.playstation.com/en-us/concept/10000494) | Two robots cooperate in an action adventure; controls operate each robot's legs | Make helping the partner visible through movement and machinery. Its controls and production scope are unsuitable as a direct target for this small browser project. |
| [Snipperclips — Nintendo](https://www.nintendo.com/us/store/products/snipperclips-cut-it-out-together-switch/) | Partners change each other's shapes to overcome obstacles | A player's action can change the partner's available solution, rather than merely communicate an answer. |
| [ibb & obb — Steam](https://store.steampowered.com/app/95400/ibb__obb/?cc=us&l=english) | Two-player cooperative puzzles in a world with gravity in opposite directions | Different movement constraints can create complementary responsibilities. |

These descriptions establish examples, not evidence that our proposals are enjoyable or likely to win. Use original levels, visuals, names, and text; these references are inspiration, not an asset source.

## Candidate comparison

The relative effort judgments below are engineering estimates, not measured completion times. All retain two human players, room codes, browser access, and no required voice call.

| Candidate | Central interaction | Potential appeal | Main risk | Relative change from J1 |
| --- | --- | --- | --- | --- |
| R1: Signal Foundry | Position on relays to open a partner's gate, then exchange support roles | Concrete cause and effect; short rooms with a shared escape goal | One player only holds a switch while the other does all the thinking | Moderate: new board/rules/UI/content; existing room infrastructure reusable |
| R2: Tether Rescue | Robots connected by a discrete cable; one anchors while the other crosses a gap | Memorable shared constraint and recoverable mishaps | Cable routing, tension, blocking, and reset rules become complicated | High; a grid cable is more bounded than physical rope, but still a new rules system |
| R3: Parallel Worlds | Each robot occupies a different layer; switches alter the other layer's bridges | Strong separate-screen purpose and discovery | Too much explanation, hidden dependencies, and dominant-player direction | Moderate to high: two map projections and cross-layer rules |

Recommendation: investigate R1 first. R2 is a possible later research alternative if R1 feels mechanical. R3 offers a stronger information asymmetry but is harder to teach. None has human enjoyment evidence.

## R1: bounded proposed experience

Setting: two maintenance robots restore an abandoned facility and reach separate extraction pads together.

Initial experiment:

- A compact top-down grid with walls, floor, two robot positions, two relay-controlled gates, and two exits.
- Each player moves only their own robot. Standing on a relay opens its linked gate for the partner. Gate links have both matching symbols and visible connecting indicators.
- Both exits must be occupied simultaneously; robots remain movable until success.
- Use deterministic tile movement. Retain proposal/Ready for the first rule experiment so gate effects can be inspected without network timing ambiguity. Only a later measured interaction experiment should replace mutual confirmation with independent steps.
- No mandatory countdown or eight-turn failure in the teaching experiment. Count moves for feedback without punishing exploration. This is a proposed change to J1, not an approved balance update.
- Include truthful cell pings to indicate a relay, destination, or request to wait. A first test should be possible without a voice call.
- Keep hazards, boxes, batteries, jumping, and physical rope out of the first experiment. Add one mechanic at a time only if needed.

The first room can be public to teach machinery. If selected as an evolution of B, a later room should investigate complementary private relay information so the original separate-screen promise still has substance. Private information is not automatically beneficial: do not hide basic gate effects simply to force conversation.

## Introductory puzzle: paper witness

This is a minimal graph puzzle, not a finished grid layout. Adjacent entries are connected by one traversable edge; there are no connections between the two corridors.

```text
A corridor:  A0 -- GA -- PA -- XA
B corridor:  PB -- GB -- B1 -- XB

A starts at A0; B starts at PB.
PB opens GA. PA opens GB.
XA and XB are the respective exits.
```

Candidate resolution rules for this example:

1. Evaluate relay occupancy from the beginning of the turn.
2. Allow a robot to enter a gate cell only if its gate was open at that point. A blocked entry leaves the robot in place and provides feedback.
3. Resolve legal adjacent moves/Wait together; use J1's overlap and direct-swap blocking if a future layout has shared cells.
4. Recompute relay occupancy and gate appearance after movement. A closed gate forbids entry but never crushes an occupant or prevents leaving its cell.
5. Check simultaneous exit occupancy after movement. No damage or turn-limit failure applies to this teaching example.

| Turn | A action | B action | Result |
| --- | --- | --- | --- |
| 1 | A0 to GA | Wait on PB | B's support permits A to enter GA |
| 2 | GA to PA | Wait on PB | A reaches the relay; GB opens after movement |
| 3 | Wait on PA | PB to GB | A's support permits B to cross; GA closes |
| 4 | Wait on PA | GB to B1 | B clears the gate |
| 5 | PA to XA | B1 to XB | Both arrive; success |

Counterchecks:

- If B leaves PB on turn 1, GB is closed, so B remains on PB. The puzzle is recoverable, not a softlock.
- If A tries to exit PA on turn 3 while B enters GB, the gate was open at turn start, so both moves succeed. B may leave the now-closed gate next turn. Do not teach players that A must hold PA until B reaches B1: that stronger condition is false under these rules.
- Before A first occupies PA, B cannot enter GB. Before A reaches GA, B's occupancy of PB is necessary. Both robots have a causal role.
- Required actions do not prove equal reasoning. This introductory room is deliberately simple and would be weak as the entire game.

Manual inspection establishes a route and the stated counterexamples only. No executable solver, grid embedding, human test, or production rule test has been run for R1.

## Content direction if selected

Limit the first content target to three short authored rooms, subject to actual implementation effort:

1. **First Connection:** teach the graph example above using a verified grid embedding.
2. **Trade Places:** require alternating support across two stages, with each robot choosing between a holding position and an onward route. Layout and solvability are still to be designed.
3. **Restore the Beacon:** combine already learned relay behavior with one complementary information task. No new mechanic in the final room. Layout and information rules are still to be designed.

Aim for a compact shared adventure with visible restoration after each room. Three rooms are a scope proposal, not validated content or a promised session duration. A single polished room is preferable to several unverified ones if time tightens.

## Engineering impact and constraints

Reuse candidate: room admission, separate session identities, authorized commands, sequence/retry handling, controller takeover, pause/recovery, mutual start/retry, and deployment/security infrastructure. Reuse must be verified against any changed command or lifecycle behavior.

New work: mission schema, tile map renderer, relay/gate state, movement legality, feedback, authored levels, room progression, onboarding, and rule tests. J1's passing tests do not establish correctness of new gate rules. Private projection rules must be revisited if visibility changes.

A physical real-time platformer would add jumping, collision simulation, latency handling, mobile input, and a much larger verification surface. A tile-based adventure is the recommended first scope. No runtime AI service is necessary for this loop.

Participant availability, October 24 candidate target, October 25-26 structured tests, October 28 submission target, and Azure cost verification remain constraints. No new hosting expenditure is authorized by this research.

Replacing hazard navigation with machinery changes core gameplay and affected SRS requirements. Before coding that replacement, record the participant's choice, revise the authoritative specification and traceability, and define the first bounded task. Keep J1 as a comparison checkpoint rather than combining incompatible rules silently.

## Next short cycle and acceptance

1. Select R1 for a bounded experiment or retain J1; selection is pending.
2. Embed the introductory graph into a small grid, define all gate/relay rules, and inspect a complete route plus failure/recovery cases.
3. Implement only that room using the existing lobby and synchronization infrastructure.
4. Verify start-of-turn gate evaluation, simultaneous relay departure/gate entry, closed-gate occupant escape, invalid moves, collision rules, duplicate resolution, reconnect, terminal state, and reset.
5. Observe two humans without a walkthrough. Record whether each understands the partner's contribution, suggests a plan, recovers from a failed attempt, and wants a second room. Record forced waits and repetitive Ready presses separately.
6. Continue only if the central interaction is understandable and promising; fix the main observed friction before adding content or art. One pair provides limited directional evidence, not general validation.

Research checks completed: official reference descriptions reviewed; current brief/specification/workflow considered; the five-turn witness and early relay departure counterexample manually inspected; scope and implementation evidence kept separate. Human enjoyment, final level layouts, mobile usability, public access, and competitive outcome remain unverified.
