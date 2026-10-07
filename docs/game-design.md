# Signal Rescue - Prototype Design 0.2

Historical audit version. The next bounded candidate is [J1-C1](candidate-gameplay-spec.md), which uses joint exit without extraction and omits numerical points. Do not implement a hybrid or transfer 0.2 route totals to J1.

Date: October 6, 2026
Status: Proposed rules under renewed paper review; not ready for production freeze. The second audit found a complete-disclosure shortcut and unresolved participation risks. Prototype work is deferred by the participant. G2 acceptance and human validation remain open. See [gameplay-second-review.md](gameplay-second-review.md). Numerical rules below are retained for audit, not newly approved by this review.

## Experience and scope

Two players guide robots across a shared 3-by-3 grid. Each player sees the hazards affecting the partner, while their own hazards are initially unknown. The central choice is which safe route to recommend and how to coordinate the robots' movement.

Keep exactly two players, one cooperative mode, no required voice call, no runtime AI, and no procedural maps. Build one tutorial first, then two research missions only if the tutorial interaction works. All three remain candidates rather than approved release content. No additional grid size or mechanic is introduced in this revision.

## State and information

Cells use `row * 3 + column`: top row 0,1,2; middle 3,4,5; bottom 6,7,8. Robot A starts at 3 and exits at 5; B starts at 5 and exits at 3. Extraction removes a robot from occupancy. `9` is an analysis-only extracted sentinel, never a board cell.

Each robot has exactly two static hazards, excluding its start and exit. A hazard belongs to a robot's layer, not globally to a square. A cell dangerous for A can be safe for B. Layer labels must always identify the affected robot.

Public state: positions, exits, current proposed destinations, ready indicators, turn, strikes, signals, discovered cells, terminal result. Private state for player A: B's entire hazard layer; for B: A's. Own start, exit, occupied safe cells, previously visited safe cells, received signals, and attempted hazard cells are known. Other own-layer cells display Unknown, never Safe by default. Players may deduce safe cells after learning both hazards, but the server need not auto-fill them.

Production sends filtered per-player views. Never send both complete layers to either browser, even if one is visually hidden. The Python research model holds both layers for analysis; it is not a privacy implementation.

## Turn loop

1. Planning begins with both robot proposals set to Wait and both humans unready. Turn 1 starts at the initial positions. Each human receives one signal allowance for this turn, with no carryover.
2. Each player may send one truthful cell signal about the partner's layer. The server supplies Safe or Danger; the sender cannot lie. Any board cell may be selected. The accepted signal is immutable this turn. Previously signaled cells can be signaled again, consuming the new turn's allowance; received knowledge persists for the mission. There is no signal score penalty or click reward.
3. Each active robot may propose a cardinal adjacent cell or Wait. Proposals are public and freely revisable until resolution. An extracted robot always proposes Extracted and has no movement controls. Illegal coordinates/nonadjacent moves are rejected without consuming a turn.
4. Any accepted change to a proposal or new signal increments the planning revision and clears BOTH ready states. Selecting an unchanged proposal is a no-op. Ready states refer to the current revision. Stale actions are rejected with refreshed state.
5. Both humans press Ready on the same revision. The second valid confirmation atomically closes planning and resolves exactly once. Duplicate Ready from one player cannot advance play. Signals and proposal changes after closure are rejected. The interface displays "Plan changed - confirm again" when appropriate.
6. After a nonterminal resolution, increment the turn, restore both signal allowances, clear readiness and proposals to Wait, and preserve learned information. A mission has at most eight resolved turns.

Signaling is optional. A player who used their signal on an unhelpful cell can send a better signal next turn; both may Wait to obtain that next opportunity, consuming a turn. Unknown movement is permitted but visually marked "Unverified"; it is not a required strategy. A known hazard is warned about but remains a legal attempted move, avoiding hidden automatic corrections.

The UI can warn about planned same-cell destinations and swaps using public intentions only. It must not predict undisclosed hazards or their downstream collisions. Show a result explanation after resolution: hazard stop, collision stop, movement, or extraction.

## Resolution and outcomes

Apply this order once, using the turn's starting positions:

1. Each attempted destination in that robot's hazard layer adds one team strike and leaves that robot at its starting position. Reveal that cell in its own-layer knowledge. Two hazard attempts add two strikes, including when they name the same cell in different layers.
2. Compare the resulting tentative positions. If both active robots occupy the same cell, or directly swap starting cells, both stay at their original positions. Hazard strikes still count. Following a robot into a cell it successfully vacates is permitted. Collisions do not add strikes but consume the turn.
3. Robots on their respective exits extract. They cease occupying cells in future turns. An extracted player's navigation and Ready controls remain active until the mission ends. Signals to an already extracted robot are disabled and rejected; signals from its human to the remaining robot remain available.
4. At three or more cumulative strikes, fail the mission. Otherwise, if both robots have extracted, win. Otherwise, if turn eight just resolved, fail for running out of turns. Otherwise, begin the next turn. Thus a clean arrival on turn eight wins; one robot extracting while the partner reaches a third strike still fails.

A win scores `100 - 10 * team_strikes`; failure scores 0. Turns and signals used may be shown as descriptive statistics with no score bonus or penalty. Aborted missions have no score. There is no leaderboard. Scores never override the actual success/failure result.

Tutorial results are unscored. For the initial content candidate, the two subsequent missions have separate result cards; the game need not implement a cumulative match score. Both players choose Continue or Retry before a new mission begins. Retry resets positions, strikes, turns, knowledge, allowances, and readiness. Hazard memory in human players is unavoidable; replay is practice, not evidence of fresh discovery.

## Interruption contract for the production prototype

There is no forced move deadline during connected planning. A disconnected participant pauses gameplay; clear readiness and accept no gameplay commands until both reconnect. Allow 60 seconds from the first detected disconnect without extending the deadline on repeated disconnect events. Reconnection before the deadline resumes the same turn and knowledge with fresh readiness. Expiry aborts without a score. A server restart that loses room state returns "Session ended - create a new room" rather than pretending recovery occurred.

Use server-side serialized commands, room/mission/turn IDs, planning revision, and player-scoped request IDs. An identical retried request returns its original acknowledgement; it cannot spend another signal. Reusing an ID with a different payload is rejected. Ready does not increment the planning revision. If Ready and an edit race, processing order determines whether editing is accepted and clears readiness, or resolution has closed the turn and the edit is rejected. A stale turn ID always fails even if its revision number matches.

Disconnect detection, clocks, request deduplication, persistence/reset, view filtering, and room authorization require production integration tests. They are specified here but NOT implemented by the analysis model.

## Interface prototype

Use two clearly titled views: "Your route - ask for help" and "Partner's hazards - guide them." Maintain identical orientation and cell labels on both devices. Prefer a small navigation panel plus the movement board rather than eight unlabeled directional controls. Use icons and text as well as color for Safe, Danger, Unknown, proposed move, and Ready.

Before Ready, show the proposed pair of actions and whether the player's destination is known safe, known dangerous, or unverified. Teach one useful signal, one move, and both-player confirmation in the tutorial. After extraction, replace the movement controls with "Your robot is safe. Keep guiding your partner." Keep the remaining robot's next destination visible.

## Verification and acceptance

See [gameplay-research.md](gameplay-research.md) for alternatives and examples, and [gameplay-validation-results.json](gameplay-validation-results.json) for generated routes. The executable model and tests live under `game/research/`. Spatial solvability and signal capacity are checked; human discoverability is not.

Before G2 closes, review this core loop with the participant through a small prototype. Before release, require an actual two-device session with correct private views, useful partner decisions, readable mobile controls, and an unassisted first-time attempt. If players mainly follow orders without making choices, or navigate successfully without attending to partner information on unseen missions, revise level geometry/interaction before adding content.
