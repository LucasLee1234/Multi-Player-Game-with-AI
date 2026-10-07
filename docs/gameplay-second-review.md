# Signal Rescue 0.2 - Second Gameplay Review

Date: October 6, 2026
Scope: Reassess the existing rules and evidence. The participant deferred prototype construction. No new game, executable rules model, cloud resource, or human playtest was created for this review.
Verdict: Retain concept B, but reopen the gameplay recommendation. Version 0.2 is logically workable as a small cooperative puzzle; it does not yet support the stronger promise of sustained partner-dependent navigation. Do not freeze it for production.

## Method and evidence limits

Reviewed `game-design.md`, `gameplay-research.md`, the stored results, and the existing analysis functions and tests. Checked the intended experience against the behavior allowed by the rules, traced candidate missions, and ran an adversarial disclosure check using the existing rule functions without changing them.

The [MDA paper by Hunicke, LeBlanc, and Zubek](https://users.cs.northwestern.edu/~hunicke/MDA.pdf), accessed October 6, distinguishes mechanics, the behavior they produce, and intended player experience. This review uses that distinction: a valid movement engine is insufficient evidence of interesting cooperation. MDA supplies an analytical framework, not proof of this game's enjoyment or competitiveness.

Evidence categories: Executed = local calculation actually run; Derived = follows from specified rules; Assessment = designer interpretation; Pending = requires implementation or human observation. This is an internal second review, not an independent or multi-model audit.

## R2-01 - Complete disclosure is a legal, high-scoring general strategy

Severity: High. Evidence: Derived and Executed.

Each player knows the partner's entire static hazard layer. Each layer has exactly two hazards. A truthful signal can target any board cell, knowledge persists, and both players may Wait. Therefore:

1. On turn one, each sender marks the first hazard affecting the partner; both robots Wait.
2. On turn two, each sender marks the second hazard affecting the partner; both robots Wait.
3. Both players now know their own two hazards. The exact hazard count implies all remaining cells are safe. Each already knew the partner's layer, so both humans now possess both complete layers.
4. Solve the remaining full-information route, without any further necessary hazard signals.

The existing exhaustive family has 423 layouts with a safe solution: 422 take four movement turns, one takes five. Adding the two disclosure turns finishes in six or seven turns, within the eight-turn limit. All finish with zero strikes and score 100. This holds for every safe-solvable layout in the exact enumerated family, not for arbitrary future boards or actual novice behavior.

Executed check: used existing `Planning`, `resolve`, and `safe_route` functions. For each of the 441 layouts, select its two sorted hazards per layer, replay two legal signaling/Wait turns, verify both hazards have been disclosed, then replay the returned safe route starting at turn three. All 423 eligible layouts won without strikes: 422 on turn six and one on turn seven. The result is saved in [gameplay-second-review-results.json](gameplay-second-review-results.json).

This strategy requires ordinary in-game signals, not voice, a timing code, screen sharing, cheating, or memorized maps. Solving the revealed route is still a puzzle. The specific failure is loss of the need for continued private-information navigation. Earlier research acknowledged two-turn disclosure but did not quantify that the entire tested safe-solvable family can still finish at maximum score.

The waiting strategy is not strictly dominant on every player preference: direct navigation can finish earlier, and people may enjoy moving sooner. However, the score provides no distinction, and disclosure removes uncertainty at a small turn cost. Its availability conflicts with treating persistent hidden information as a guaranteed source of challenge.

## R2-02 - Most of the spatial family offers little progression in route length

Severity: High for the current content plan. Evidence: Executed counts and Assessment.

Of 423 safe-solvable layouts, 422, or approximately 99.76%, have a shortest safe route of four turns; only one needs five. This is a property of the specified 3-by-3 family, not a distribution of player difficulty. Four-turn routes can differ in discoverability, branching, and yielding choices. Nevertheless, authoring more layouts alone does not demonstrate a progression of planning depth.

The eight-turn limit leaves three or four turns beyond the shortest safe solution. This makes error recovery possible but also accommodates the complete-disclosure strategy. Do not call the limit balanced merely because safe routes fit it. A lower limit could suppress waiting, but might punish useful discussion or recovery through additional resolved Wait turns. It needs a rationale rather than a guessed number.

The eighteen layouts without a safe solution remain unsuitable for a zero-strike mission standard. They were not proven impossible with one or two allowed hazard attempts: distinguish 'no zero-strike route' from 'cannot win under the three-strike rule.'

## R2-03 - Continued controls do not establish continued agency

Severity: High. Evidence: Derived candidate timelines and Assessment.

The Early Arrival witness extracts A on turn two and leaves two turns for B. The Shared Corridor witness extracts B on turn two and leaves three turns for A. Keeping signaling and Ready available prevents an interface dead end. It does not prove the extracted player has a meaningful choice.

After two disclosure turns, private hazard information is already shared; any player who extracts later may have nothing unique left to contribute. Even under step-by-step safe recommendations, the remaining route can be obvious. Requiring the navigator to click Ready then risks making attendance mandatory without making their decision valuable.

Validate the navigator by identifying an actual consequential choice and the alternatives available, not by counting clicks or turns on screen. 'The partner still can act' and 'the partner still needs to think' are different claims.

## R2-04 - A warning can consume the only opportunity to help

Severity: Medium. Evidence: Derived.

Suppose A proposes danger cell 4. B uses the only clue on Danger at 4. B can no longer certify a safe alternative in that turn. A may wait, choose an unverified cell, or infer from already known information. A correct protective warning can therefore create another Wait turn or an unverified decision.

Marking a useful safe alternative is often more constructive than marking the proposed hazard. That distinction needs teaching. It is not a global proof that Danger signals are always inferior: they can reveal a bottleneck, inform several future decisions, or complete knowledge of the two hazards. Evaluate the usefulness of both labels over a mission.

Possible future adjustment: attach guidance to a proposed move or allow replacement of the current clue. Neither is adopted here. Replacement must address whether prior revealed information remains known; otherwise one editable slot can disclose many cells before resolution. A nearby-cell-only rule would limit global disclosure but could still produce rote move-by-move instruction rather than joint planning.

## R2-05 - Layer clarity and coordination are the strongest retained foundations

Severity: Medium usability risk; positive design evidence. Evidence: Derived.

A signal can be safe for one robot while the same cell is dangerous for the other. Teaching the affected robot is essential. Shared coordinates alone are not sufficient. Keep explicit robot labels, consistent orientation, and Unknown distinct from Safe.

Public proposed moves solve a real ambiguity from the previous hidden-move version. The Shared Corridor example has a genuine yielding choice: wait, take the side cell, or attempt a blocked swap. Retain this source of interaction. Its identical hazard layers make it a useful movement teaching example but a weak demonstration of asymmetric information. Do not expand to hidden intentions to manufacture surprise collisions.

## R2-06 - Confirmation is correct but may create avoidable friction

Severity: Medium. Evidence: Derived; experience Pending.

Resetting both ready states on accepted information or movement changes prevents stale agreement. If a player readies before the partner signals, readiness must be repeated. The system is internally consistent, but two proposal selections, two signals, and two confirmation actions can surround a single small movement decision. A sender may also spend their allowance on a previously known cell and reset both confirmations without adding information.

Teach a predictable order: receive/give guidance, set destinations, inspect the joint plan, then confirm. Explain resets visibly. Do not treat a player who confirms twice as evidence of two meaningful decisions. Changes to confirmation timing should preserve agreement on the latest information and be evaluated separately from puzzle depth.

The written Continue/Retry rule is also incomplete for disagreement: if one player chooses Continue and the other Retry, no transition is specified. Before production, define pending choice display, revisability, and a rule requiring matching choices. This is a specification gap, not an observed runtime defect.

## R2-07 - Failure and recovery are coherent, but only partly justified

Severity: Medium. Evidence: Existing boundary tests and Assessment.

Hazard stop before collision, blocked direct swaps, following into a vacated cell, turn-eight success, and strike-limit failure are consistently specified. A collision costs a turn without a strike. The tested recoverable mistake reaches success with one strike. Retain these explanations.

Three strikes and eight turns are parameters without human balance evidence. A failure for a third strike correctly takes precedence over a simultaneous single extraction. On valid hazard-free exits, both robots extracting simultaneously cannot also create a new hazard strike; do not invent an unreachable precedence conflict.

Tutorial outcomes are unscored in the design. Earlier worked tutorial examples quoted the numerical score formula as if an actual tutorial score would be awarded. The research wording is clarified to distinguish calculation from the proposed player-facing result. The analysis engine is not a complete tutorial controller.

## R2-08 - Replay and session length remain unsupported claims

Severity: High for experiential value, Medium for scheduling. Evidence: Derived and Assessment.

Resetting stored knowledge on Retry does not reset human memory. Fixed maps support practice; they do not guarantee renewed discovery. Mirroring or swapping roles may change controls without introducing a new plan. Three candidate maps are a content starting point, not proof of replay appeal.

The number of turns is bounded, but planning time is unbounded while connected. An eight-turn mission is not automatically a five-minute session. Treat any duration as a target to measure, not a verified consequence of the rule limit. A real-time synchronized multiplayer transport is compatible with discrete turns, but says nothing about pace or excitement.

Do not add moving hazards, procedural generation, a larger grid, or live AI merely to claim replay. Each would require new scope, interaction reasoning, balance, and verification.

## What the prior checks establish

| Evidence | Supported conclusion | Unsupported conclusion |
| --- | --- | --- |
| 15 existing boundary tests | The modeled cases match selected core rules | All game behavior, interruptions, or privacy are correct |
| 441 layout searches | Safe-route existence and minimum depth in the bounded full-information family | A human can discover the route using only their initial screen |
| 423 signal-capacity witnesses | A supplied route can be communicated within per-turn quotas | The quota sustains mystery, teamwork, or interesting decisions |
| 209,034 transition invariants | Modeled single-turn occupancy/hazard/strike invariants hold | Networking, persistent knowledge, ready races, or human fun are verified |
| This disclosure counterexample | Legal complete disclosure fits the turn bound in all 423 safe-solvable cases | All players will use it, or the game cannot be enjoyable |

`signal_witness` receives a full-information route from the solver before communication begins. Its success therefore cannot independently establish distributed route discovery. `Planning` models one turn and initializes knowledge anew; it is not an implementation of mission-long knowledge persistence. Persistent knowledge in this review follows the written game rules. The existing model supports boundary calculations but should not be described as the finished game.

## Recommended next design work

First choose the intended experience within B:

| Direction | Implication | Assessment |
| --- | --- | --- |
| Gentle information-sharing and route coordination | Accept that hazards may be fully revealed early; value comes from joint movement planning | Feasible interpretation, but current geometry/content needs to carry more of the experience |
| Sustained asymmetric navigation | A static two-hazard map disclosed anywhere cannot guarantee lasting private knowledge; revise the information contract or introduce a carefully justified decision source | Closest to the current product promise; requires further design reasoning before production |

Recommended direction: preserve the promise of meaningful partner navigation, but resolve R2-01 and R2-03 on paper before building. Do not restore a signal score penalty as the first fix; it previously discouraged the intended helping behavior. Do not add a hard clock as a substitute for an interesting decision. A clock changes pressure and accessibility rather than proving cooperation depth.

Paper acceptance criteria for a revised candidate:

1. Describe one mission using only each player's legally available knowledge, with a decision trace showing why their choices are justified. Do not import a centrally solved route into the trace without labeling it.
2. Attempt the same complete-disclosure strategy. Either it remains an intended solution and the residual coordination puzzle is demonstrably nontrivial, or the information rule prevents it for a clear reason. Avoid invasive enforcement or relying on players not noticing.
3. Identify a consequential decision for each human beyond sending the first information. If one robot extracts early, show what meaningful choice its navigator still contributes; otherwise redesign the candidate's participation pattern.
4. Show a useful Safe signal and a useful Danger signal, or remove a label whose only effect is unnecessary friction.
5. Show one planning conflict that can be understood before resolution and one mistake that can be recovered from without forced guessing.
6. Specify Continue/Retry disagreement and distinguish tutorial teaching from scored missions.
7. Keep exactly two players and the agreed milestones. Any content/mechanic expansion needs an explicit effort consequence.

These criteria are analytical gates, not fabricated human approval. After a revised paper design passes them, future first-time human tests must still measure understanding, consequential partner decisions, engagement after extraction, and voluntary replay interest.

## Disposition

Continuation: [gameplay-cooperation-analysis.md](gameplay-cooperation-analysis.md) investigates joint exit as a paper candidate. It explicitly allows full disclosure when a meaningful coordination puzzle remains. No J1 implementation or universal solvability claim is made.

G2 stays open. GP-01 remains a delivered historical research package; its implementation recommendation is reopened by this review. GP-02 continues as paper design review. Prototype work is deferred per the participant's current instruction. No new rules are adopted by this report, and B remains the selected concept.
