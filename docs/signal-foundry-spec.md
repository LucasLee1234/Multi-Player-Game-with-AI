# Signal Foundry: First Connection Experiment

Date: October 6, 2026
Version: SF-T1 v2

Supersession on October 7: [independent-movement-spec.md](independent-movement-spec.md) defines implemented SF-T1 v3. It replaces per-turn confirmation/Wait/start agreement with automatic start and direct individual moves; geometry and latch gates remain. The v2 text below is historical rule/verification context.
Status: Bounded design and executable research completed after the participant requested further work on the relay/gate direction. This is not a production replacement approval or a human-tested release baseline. The running browser game remains J1.

Implementation update: the participant explicitly requested implementation. SF-T1 v2 is now the default local startup profile (`sys-03-sf-t1`); J1 is retained only as a developer comparison profile. [test-evidence.md](test-evidence.md) records production-module and wire checks. Earlier statements about future implementation below describe the pre-coding specification; human/release acceptance remains open.

## 1. Player experience

Two maintenance robots restore passage through a small facility. B provides power so A can cross the first gate. A then reaches the relay that allows B through. Both reach separate exit pads together.

This first room teaches a causal interaction, not an entire adventure. It does not establish replay value or equal reasoning. The main question for the next playable experiment is whether players understand and enjoy enabling their partner's movement.

## 2. Exact tile layout

Width 4, height 3. Cell ID is `y * 4 + x`; coordinates start at the top-left with zero.

```text
Cell IDs       Tile contents
 0  1  2  3    A  GA PA XA
 4  5  6  7    #  #  #  #
 8  9 10 11    PB GB .  XB

A  = A's starting position, cell 0
B  = B starts on PB, cell 8
GA = gate at 1; powered by PB at 8
GB = gate at 9; powered by PA at 2
XA = A's exit at 3
XB = B's exit at 11
#  = impassable wall
```

Walkable cells: 0, 1, 2, 3, 8, 9, 10, 11. Only cardinal adjacent movement is allowed. The corridors are separated by walls; there is no wrapping or corridor switching. A relay activates when occupied by either robot, though this layout physically limits who can reach each relay.

All tiles, connections, positions, gate states, and proposals are public in this teaching room. The two people retain separate robot control. Do not claim private-information cooperation for this room.

## 3. Resolution rules

Initial state: A at 0, B at 8, neither gate latched, both proposals Wait, both unready, zero resolved turns. GA is powered open because B is already on PB; GB is closed.

1. Each player proposes an adjacent walkable destination or Wait. Wall, out-of-range, nonadjacent, and wrong-seat commands are rejected rather than advancing a turn.
2. Preserve J1's planning-revision mechanism: changed proposals clear both confirmations. The second current Ready commits exactly one simultaneous turn. No forced movement clock applies.
3. Evaluate gates from positions and latches at the beginning of that turn. A gate is open if its linked relay is occupied or its latch is set.
4. Entry into a closed gate becomes Wait for that robot, with an explicit blocked-entry explanation. The other robot's valid move can still occur. No damage or strike is added.
5. Resolve tentative overlap/direct swaps by keeping both original positions. Following into a vacated cell is allowed. These are general rules for future shared-space layouts; this room cannot exercise them.
6. After actual movement, any gate newly entered by a robot latches open for the remainder of this attempt. Collision-blocked entry does not latch a gate. No gate consumes power or closes on its occupant.
7. Recompute relay power and visible gate state. New relay occupancy affects entry legality from the next turn, not retroactively in the current turn.
8. Increment resolved turns, including a both-Wait or both-blocked turn. Win only when A occupies 3 and B occupies 11 simultaneously. There is no hazard, strike limit, eight-turn limit, or score in SF-T1.
9. After success, movement commands are rejected. Mutual retry creates a fresh mission attempt with positions, latches, proposals, agreements, and turn count reset. Recompute initial relay power; GA is powered, not latched, on reset.

The existing room inactivity/expiry policies still apply. Unlimited puzzle turns do not imply an unlimited room lifetime. Reconnect retains the attempt's positions and latches but clears agreements under the existing recovery contract. These networking/reset behaviors are specified here, not yet implemented or verified for SF-T1.

## 4. Why the gate rule changed

The original research proposal used momentary gates that closed whenever a relay became unoccupied. The exhaustive probe exposed a reachable softlock:

```text
(A0, B8) -> (A1, B8) -> (A2, B8) -> (A1, B9) -> (A0, B10)
```

At the final state, A cannot enter GA because B is away from PB; B cannot enter GB because A is away from PA. Neither can return to the relay. Waiting does not help.

SF-T1 v2 therefore latches each gate on its first successful entry. This preserves the initial need for the partner's relay while making backward exploration recoverable. It also reduces later puzzle difficulty. Do not silently reuse this rule for levels that depend on holding a gate open continuously: those need different layouts and fresh validation.

## 5. Verified completion

| Turn | A destination | B destination | New effect |
| --- | --- | --- | --- |
| 1 | 1 | Wait at 8 | GA latches; B enabled A's entry |
| 2 | 2 | Wait at 8 | PA powers GB for the next turn |
| 3 | Wait at 2 | 9 | GB latches; A enabled B's entry |
| 4 | Wait at 2 | 10 | B advances toward its exit |
| 5 | 3 | 11 | Joint exit, success |

Alternative: A can move to 3 on turn 3 while B enters 9; GB was powered at turn start and latches on entry. A then waits for B. Do not claim that holding PA for the extra turn is necessary.

Another important feedback case: from `(A1, B8)`, proposing A to 2 and B to 9 together moves A but blocks B. PA becomes occupied only after entry legality was evaluated. Feedback should say `Gate not powered at turn start. Your partner has now powered it.`

## 6. Executed research evidence

Run from the project root:

```text
python game/research/signal_foundry_probe.py
```

Actual output: [signal-foundry-validation.json](signal-foundry-validation.json). Research source: [signal_foundry_probe.py](../game/research/signal_foundry_probe.py).

- 24 checks passed, including the rejected original-rule softlock trace.
- Breadth-first exploration found 21 reachable states, including success, and enumerated 120 nonterminal outgoing transitions.
- Every reachable state has a completion path under SF-T1 v2. The longest shortest recovery path is five turns.
- The shortest initial completion is five turns. Permanently disabling either gate eliminates completion, establishing that both gate dependencies matter.
- A shortest completion uses six individual moves out of ten available player-action slots; four are Wait slots. This 40% waiting exposure is a design risk, not evidence of boredom.

The state is `(A cell, B cell, latch mask)`; bit 1 means GA latched and bit 2 means GB latched. Powered states are derived from positions, so no extra state is needed.

Scope limits: this is a standalone Python model, not the running TypeScript engine. Disjoint corridors cannot validate collision behavior. No human, phone, networking, room reset, or public-deployment check was performed for SF-T1. Full-information solvability does not establish enjoyable collaboration.

## 7. First playable increment

Outcome: two existing room participants can complete only SF-T1 and retry, with understandable power/latch feedback.

Included: the specified tile map, relay links, gates, actual robot moves, joint exit, mutual retry, and existing session recovery. Excluded: additional rooms, physics, enemies, crates, batteries, animation-heavy art, private relay puzzles, numerical scoring, and cloud changes.

UI requirements:

- Show one shared map with prominent `You` and `Partner` robot labels and a four-direction control plus Wait.
- Distinguish `Closed`, `Powered`, and `Latched open` using text/symbols as well as color.
- Draw or highlight each relay-to-gate relationship. Selecting a relay must identify the linked gate.
- Explain that B starts on a relay: `You are powering your partner's gate.`
- Show the public proposed moves and whether the partner is ready. Use a brief English outcome sentence after each resolved turn.
- Preserve keyboard focus, accessible names, and existing connection feedback. Confirm actual phone fit rather than inferring it from CSS.
- A small contextual ping/request-to-wait interaction is useful for a no-voice experiment; its command, revision, and rate-limit semantics must be specified before implementation. It must not become a backdoor to controlling the partner.

Implemented ping contract: reuse `signal` with one walkable tile cell and current mission/turn/planning revision. It publishes the selected cell as a location ping, once per seat per turn; the retained `safety: Safe` wire field denotes walkable floor, not safe gate entry. Walls reject. New pings increment planning revision and clear both Ready states; resolved nonterminal turns reset the allowance. The client displays `points to tile`, never interprets the wire field as gate power, and highlights relay/gate links. Existing command authentication, quota, retries, and rate limits apply. No separate text/chat or request-to-wait command was added.

Implementation verification must cover the research witness, delayed relay activation, latch persistence, blocked entry without a strike, mutual retry clearing latches, terminal immutability, duplicate Ready handling, and pause/reconnect state. Repeat relevant room/protocol checks when integration changes them. Validate shared-space collision rules separately if the reused engine claims them.

## 8. Requirement impact and product risks

| Existing requirement area | Experiment impact |
| --- | --- |
| SR-01 / SR-05 / SR-06 | Keep two clients, authoritative results, and defined recovery; integration evidence required |
| SR-02 | Keep authorized per-seat control; this room has no hidden hazard layer |
| SR-03 / SR-07 | Gate dependencies and solvability have research evidence; reasoning/enjoyment need humans |
| SR-04 | New relay/latch rules replace hazard/strike rules only within the experiment |
| SR-08 | New instructions/map controls require usability checks |
| SR-09 / SR-10 | Hosting budget and submission obligations remain unchanged |

Before replacing the shipped J1 flow, update the SRS's detailed hazard/signal requirements, architecture/game contracts, README, authoritative implementation task, and affected evidence. This experiment specification does not declare those existing requirements satisfied or obsolete.

Main risks: the teaching room is easy; support roles contain waiting; one person can direct both; per-turn confirmation remains friction; a public map weakens B's original information distinction. Add no content merely to mask these risks.

Human inspection should record: whether each person explains their gate dependency, proposes any plan, understands the blocked simultaneous entry, can recover without a walkthrough, and voluntarily wants a second room. Use actual responses, with one pair treated as limited feedback. If holding/confirming dominates, compare a bounded independent-step control variant before designing a campaign.

Next recommendation: implement one experimental teaching room after the gameplay experiment scope is adopted. The design is ready for a bounded prototype; evidence is insufficient for a full campaign or a release baseline.
