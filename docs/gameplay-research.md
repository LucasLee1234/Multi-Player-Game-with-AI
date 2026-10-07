# Signal Rescue - Gameplay Research and Adjustment

Date: October 6, 2026
Task: GP-01. Historical research package complete. The 0.2 implementation recommendation is reopened by [gameplay-second-review.md](gameplay-second-review.md); prototype work is deferred. No human enjoyment evidence exists.

## Finding

Keep the premise of seeing the partner's danger. Remove penalties for asking for help, expose movement plans, and retain the extracted player's navigation role. The principal remaining uncertainty is whether a tiny static puzzle produces satisfying decisions rather than routine instruction-following.

Evidence labels used below: **Design** means reasoned proposal; **Executed** means a local program ran; **Pending** means untested. No human playtest, cloud deployment, independent reviewer, or alternate-model audit is claimed.

## Alternatives compared

| Variant | Benefit | Counterexample / weakness | Decision |
| --- | --- | --- | --- |
| Original: three shared signals per mission, minus five points per signal, hidden moves | Scarcity can create tension | A zero-strike communicating team scores below an equally successful silent team. A fourth needed clue cannot be sent. Safe hidden moves may collide without a coordination tool | Reject for the prototype |
| Unlimited truthful signals with public plans | Straightforward and avoids a token bottleneck | Both hazards can be disclosed immediately; the private-information premise collapses into a shared route puzzle | Keep only as a possible accessibility/comparison variant, not current scope |
| One free signal per player per turn, public plans, revision-bound Ready | Supports one helpful recommendation for each robot each turn; eliminates the shared last-token race | Two turns can disclose both hazards; an unhelpful immutable signal can waste a turn; repeated Ready resets can frustrate players | Recommend for a bounded prototype, monitor these weaknesses |

**Design:** The selected variant makes the constraint the pace of information, not reluctance to cooperate. No anti-cheat claim is made: voice, memorized routes, agreed cell encodings, and proposal timing can bypass intended uncertainty. A cooperative puzzle should remain coherent with generous communication. Do not add surveillance or costly enforcement.

The revised quota does not guarantee success after arbitrary signaling choices. It does permit a truthful next-cell recommendation for both robots on every turn of any supplied safe route. That is a narrower, testable claim than guaranteeing players can discover the route with distributed knowledge.

## Three worked situations

Cell numbering is shown in [game-design.md](game-design.md). These examples use A hazards `{4,6}` and B hazards `{1,2}`, unless stated otherwise.

### 1. A useful warning and a safe alternative

At positions `(3,5)`, A proposes 4. B sees that 4 is dangerous for A. B sends Danger at 4, which clears both Ready states. A can stay and wait for a later recommendation, or select a different unverified destination; the warning itself does not magically make another cell safe.

A more constructive opening is B sending Safe at 0 and A sending Safe at 8. Both recipients see a verified option, revise to `(0,8)`, and confirm. Continue with `(1,7)`, `(2,6)`, `(5,3)`, receiving truthful next-cell signals each turn. Both extract on turn four with zero strikes. The general score formula would yield 100, but the tutorial is unscored in the proposed product. Eight signals carry no penalty. A's move to cell 2 is safe for A even though cell 2 is dangerous for B: the two layers must be unmistakably labeled.

**Executed:** The full four-turn route with both signals and readiness passes the signal-capacity replay. **Pending:** Whether players independently choose this productive signaling style.

### 2. Resolving an actual coordination conflict

Use the Shared Corridor candidate with both hazard layers `{1,7}`. From `(3,5)`, both can safely propose 4, but a same-cell collision would leave both still and consume a turn. The visible proposals make the conflict available to resolve before confirmation. A waits while B moves to 4. A then moves to 6 while B moves to 3 and extracts. A follows 3,4,5 while B continues as navigator and confirms each turn.

Joint action sequence: `(3,4)`, `(6,3)`, `(3,9)`, `(4,9)`, `(5,9)`. Five turns, zero strikes, score 100. If A instead tries to swap directly with B after the first turn, the swap is blocked. The side cell is a yielding space.

**Executed:** This is the unique five-turn minimum case in the enumerated layout family. **Design limitation:** Identical hazard layers are an exceptional teaching geometry, not evidence of strong asymmetric-information value. Do not use this mission as the sole proof that private screens matter.

### 3. A recoverable mistake

On the tutorial map, both attempt 4 on turn one. A hits a hazard and stays at 3; B safely moves to 4. There is no collision after the hazard stop because the tentative positions differ. The team has one strike and A learns that 4 is dangerous.

Next choose `(0,3)`: A moves up and B extracts. B continues guiding A through 1,2,5, yielding the remaining actions `(1,9)`, `(2,9)`, `(5,9)`. Finish on turn five with one strike. The general score formula would yield 90; the tutorial itself is unscored. This illustrates understandable error recovery and why the first finisher must stay active.

**Executed:** A dedicated regression replays this outcome. **Pending:** Whether spending three further turns as navigator feels engaging.

## Changes mapped to the feasibility findings

| Finding | Adjustment | Current evidence / remaining risk |
| --- | --- | --- |
| F-01 | Remove signal penalty; no click reward | Score depends on strikes only; enjoyment/incentives unobserved |
| F-02 | Extracted human continues signaling and Ready | Model test passes; participation quality pending |
| F-03 | Independent one-per-turn allowance; immutable accepted clue; persistent knowledge | No shared-token race; signaling shortcuts remain possible and accepted |
| F-04 | Public proposals with both-player confirmation | Same-cell/swap/following cases tested; mobile clarity pending |
| F-05 | Explicit resolution precedence, ready invalidation, interruption contract | Core rule boundaries tested; network contract not implemented |
| F-06 | Tutorial plus two contrasting candidates, no six-level commitment | Small maps still memorized; release inclusion conditional |
| F-07 | Exhaustive bounded route checks plus signal witnesses | Eighteen layouts rejected; no decentralized strategy proof |
| F-08 | Preserve Oct 24 candidate and Oct 25 testing | Late feedback risk remains; no earlier friend test scheduled |
| F-09 | Leave cloud selection/cost to TECH-01 | No verified account balance, deployment, or cost claim |

## Executed validation

Environment: local Windows, bundled Python, standard library only. Run from the project root:

```text
python -B -m unittest discover -s game/research -p "test_*.py" -v
python -B game/research/validate_design.py
```

The second command prints the evidence stored in [gameplay-validation-results.json](gameplay-validation-results.json). The generated route is a witness, not a solver running on a player's private view.

- All 441 two-hazard layout pairs checked. 422 have a shortest safe route of four turns; one needs five; 18 have none within eight turns.
- All 441 route lengths agree with the earlier separately written spatial probe. This is an internal cross-check, not independent certification; both share the same design assumptions.
- All 423 solvable layouts support replay of a supplied route with at most one truthful signal per sender per turn, including extracted navigators. It proves communication capacity, not distributed planning ability.
- 209,034 spatial transitions across valid modeled positions/actions preserve safe occupied cells, non-overlapping active robots, and correct per-attempt strike counts. These are single-turn invariants, not full protocol coverage.
- Unit cases cover collisions, swaps, following, hazard-before-collision, two simultaneous strikes, turn-eight outcomes, extraction with a third strike, illegal moves, signal quotas, readiness invalidation, duplicate Ready, closure, extracted navigation, and recoverable mistakes.
- Final unit run: 15 tests passed. Project Markdown/Python character scan found no CJK text; local Markdown links resolve after URL decoding.

During the first test pass, the extraction/third-strike fixture incorrectly expected an exit occupied by a hazard-stopped partner to be free. The test failed correctly under the documented collision order. The fixture was changed to isolate noncolliding extraction plus a third strike; hazard-blocked collisions remain separately tested. Final results, rather than the initial failed expectation, determine the recorded pass status.

## Prototype decision and cut order

Build the tutorial interaction before presentation or more levels. Observe whether each player can distinguish layers, give a useful safe-cell recommendation, identify a public-plan conflict, and stay involved after extraction. The two additional maps in the result file are research fixtures, not a promise of sufficient release content.

Suggested participant effort allocation within the existing 21-30 hour envelope: rules/prototype review 2 hours; account and deployment checks 3-4; incremental device checks and decisions 6-8; candidate review 3-4; friend tests and feedback 3-4; release/submission 2-3; contingency 2-5. These planning estimates sum to 21-30 hours, not measured actuals or an added budget. Assistant execution time is separate. Re-estimate after the first public interaction.

Cut optional animation, aggregate scoring, and additional layouts first. Do not cut public two-device play, private view isolation, clear outcomes, or submission materials. No larger board, live AI, chat, new resource, or new mode is authorized by this recommendation.

## Human validation still required

Record actual observations, not inferred satisfaction:

1. Can the first-time friend identify which robot each hazard label affects without spoken teaching?
2. Can each player describe a decision changed by the partner's information on an unseen mission?
3. Do visible plans help resolve yielding, or does repeated Ready invalidation become confusing?
4. Does one clue per turn enable useful guidance without too many information-only Wait turns?
5. Does the navigator remain involved after extraction, and can the pair finish without voice?
6. Would the friend voluntarily replay or try another mission, and why?

If route choice is trivial, improve authored geometry before adding a mechanic. If clue scarcity causes frustration, compare unlimited signals in the same scene before expanding scope. If role asymmetry confuses users, improve layer labels and tutorial feedback before changing the concept.

GP-01 has a coherent proposal and executable logical evidence. G2, production privacy/reliability, human enjoyment, and award competitiveness remain unproven.
