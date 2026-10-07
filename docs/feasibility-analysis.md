# Signal Rescue Feasibility Assessment

Date: October 6, 2026
Decision: Proceed with bounded gameplay research and a small prototype. Do not freeze the current numerical rules or begin full content production yet.

## 1. Executive assessment

Signal Rescue is technically plausible as a small two-player browser game on Azure. The largest uncertainty is whether information sharing produces enjoyable cooperation. Keep B as the selected direction, but do not treat its current draft as an implementation-ready specification.

| Dimension | Assessment | Evidence and limitation |
| --- | --- | --- |
| Technology | Feasible architecture | Small authoritative server and discrete turns; no deployment yet |
| Gameplay | Material design issues remain | Incentives, extracted-player participation, and coordination need research |
| Levels | Validation is necessary | Executed bounded search found 18 failing layouts among 441 combinations |
| Schedule | Tight and conditional | One-hour daily baseline; first structured friend feedback around Oct 25 |
| Azure budget | Plausible but unverified | Actual balance, expiry, permissions, and priced configuration unknown |
| Testing | Enough for initial two-player testing | One friend is weak evidence of broader appeal; browser coverage unknown |
| Contest fit | Appropriate direction if delivered | Submission and remaining eligibility checks still required |
| Winning potential | Cannot be quantified | No competing entries, judge feedback, or human enjoyment evidence |

Recommendations here are not approved rule changes. The authoritative scope is [project-brief.md](project-brief.md). GP-01 compares solutions; GP-02 establishes the design baseline.

## 2. Review method

Reviewed the brief, task board, selected B rules and example, competition plan, decisions, and workflow. Reopened official Microsoft hosting documentation and the contest rules. Executed a small exhaustive search of the provisional spatial rules.

This is an internal review, not independent certification or a multi-model audit. No personal eligibility, cloud access, network performance, human enjoyment, or prize probability has been verified. No cloud resources were created.

## 3. Gameplay findings

### F-01 - Scoring discourages the intended helping action

The draft gives 100 points for success, minus 10 per strike and five per marker. An equally successful run without communication scores better than a run with useful signals. Limited signals already impose a constraint; an additional score penalty may encourage guessing or memorizing maps instead of cooperating.

This is an incentive concern, not an observed player behavior. Compare a version without a signal score penalty against the current version. Avoid rewarding raw signal clicks, which creates another exploit.

### F-02 - Extraction may remove one player's purpose

The draft says an extracted robot takes no further actions, without defining whether its player can still send signals. That player may be the only person who knows the remaining robot's hazards.

Separate robot movement from player participation. Test whether the extracted player remains a navigator, which controls stay available, and what happens when signals are exhausted. Do not let one of two humans become a spectator unintentionally.

### F-03 - Signals carry more information than their labels

A marker conveys both a safe/danger label and a chosen coordinate. Repeated markers, cancellation, timing, or agreed coordinate patterns can reveal more than intended. External voice or screen sharing can bypass the restriction entirely.

Define signal timing, editability, duplicate behavior, and atomic token spending. Test normal novice use and simple shortcuts. A cooperative game does not need invasive anti-cheat; the intended constrained experience should be understandable and optional outside formal evaluation.

### F-04 - Hidden movement may make collisions feel arbitrary

Players secretly choose moves, while signals describe hazards rather than intended movement. Two individually safe plans can collide without a clear way to coordinate who yields.

Compare the current hidden movement with a lightweight visible-intent or ready mechanism. This is a proposed research variant, not an approved feature. Establish what a locked action reveals and whether a player can revise a choice before resolution.

### F-05 - Timing and terminal-state details remain unspecified

Resolve these before production implementation:

- Whether signals can be sent after movement selection or after the partner locks.
- Which request receives the last shared signal when both arrive together.
- Whether repeat markers spend tokens.
- Whether two hazard attempts in one turn produce two shared strikes.
- Whether success on turn eight is checked before turn-limit failure.
- Whether an extracted player counts toward readiness or can still signal.
- How disconnection affects deadlines, wait fallback, and mission outcomes.

The hazard-before-collision order is usable for analysis, but does not define the whole state machine. A resolution table will prevent contradictory code and tests.

### F-06 - Small maps may be memorized

Six nine-cell layouts are feasible to author, but replaying them can reveal all hazards. Mirroring and swapping roles do not necessarily create new decisions. Knowing there are exactly two hazards also creates deductions once both are identified.

Start the proof with a tutorial and two contrasting layouts. Expand after the mechanic works. Describe replay variety honestly, and keep procedural generation out of the initial scope.

## 4. Executed spatial probe

Analysis code: [feasibility_probe.py](../game/research/feasibility_probe.py).
Reproduction from the project root: `python game/research/feasibility_probe.py`.

The model fixes a 3-by-3 board, starts at (0,1) and (2,1), and exchanged goal cells. Each robot has two hazards excluding its start and goal: 21 possible pairs per robot, or 441 combined layouts. Breadth-first search examines joint cardinal moves/waits, collision and swap constraints, and goal extraction. It searches for a zero-strike solution within eight turns with full knowledge of both maps.

| Shortest zero-strike solution | Layout count |
| --- | --- |
| Four turns | 422 |
| Five turns | 1 |
| No solution within eight turns | 18 |
| Total | 441 |

Sanity checks passed for an empty board, a deliberately blocked start, and the published example. The published example has a four-turn solution and draft score 90 with two markers and no strikes.

One failing example places hazards at (0,0) and (1,1) in both layers. Both robots are forced toward the lower corridor, where passing constraints matter. The result is limited to this exact model and bound; it does not establish impossibility under future rule changes.

About 4.1% of this complete, narrowly defined combination set fails the safe-route criterion. That is not a predicted failure rate for curated production levels. Every authored mission needs a validator. Most solvable layouts have a four-turn spatial solution, so the usefulness of an eight-turn allowance depends mainly on uncertainty and coordination.

The search excludes signals, partial knowledge, deadlines, networking, and human enjoyment. A full-information route does not prove a fair discoverable solution. No simulation is presented as a human playtest.

## 5. Technical and Azure feasibility

The game sends small updates at turn boundaries rather than continuous physics. Evaluate one small Node service with a server-authoritative room state machine, separate player views, reconnect tokens, action IDs, room versions, and serial processing per room. Avoid microservices or a generic multi-game engine.

Microsoft documents HTTPS and WebSocket support for Container Apps ingress, making it a candidate for the required transport. Account/region permissions remain unverified. [A1]

A single replica simplifies room ownership, but does not prevent restarts or revision replacement. Client session affinity alone does not guarantee that two different clients in a room reach the same process. Multiple replicas need shared coordination/state or routing designed around rooms. Define either persisted recovery or a clear safe room-restart path and test it.

Microsoft describes Azure student credit of USD 100 usable within 12 months. The participant's remaining amount and expiry are unknown. Consumption free allowances do not make all related resources free. [A2-A3]

Price compute, storage, logs, network usage, and any registry before claiming affordability. For illustration only, USD 75 after a 25% contingency divided over October 6-November 29 inclusive, 55 calendar days, is about USD 1.36 per day. This is an arithmetic allowance assuming the full USD 100 remains, not an Azure quote or an approved allocation.

TECH-01 must check the actual balance, expiry, access, and cost configuration. TECH-02 must establish a public separate-network room and observed usage. No subscription upgrade or spending is authorized by this report.

## 6. Schedule and test-resource feasibility

October 6-28 contains 23 calendar days: roughly 23 participant hours at one hour per day. The project's 21-30 hour envelope and the B estimate of 25-32 hours are estimates, not measurements. Extra assistant execution does not remove human decision, account, and testing dependencies.

Critical path: coherent mechanic -> reviewed rules and technical proof -> complete session -> usable candidate -> human feedback -> repairs -> submission.

The biggest schedule risk is discovering the core is unfun around October 25, three days before submission. An earlier optional 15-20 minute friend check would reduce that risk, but it is not agreed or scheduled. Preserve the participant's current testing date and explicitly accept its limited redesign buffer.

| Target | Gate |
| --- | --- |
| Oct 8 | Testable signaling approach and explicit resolution order |
| Oct 11 | Central interaction working on two devices through Azure |
| Oct 19 | Complete session with a small authored mission set |
| Oct 24 | Playable candidate and draft submission materials |
| Oct 25-26 | Structured friend feedback and bounded changes |
| Oct 27 | Regression/public-access checks |
| Oct 28 | Confirmed submission |

If Oct 11 slips, simplify the technical route within Azure and the prototype before expanding presentation. If Oct 19 slips, cut optional levels, animation, and scoring complexity. Preserve real multiplayer, privacy, understandable rules, and submission completeness.

One friend plus the creator can validate an actual two-player session. Only the friend supplies first-time onboarding evidence. Repeated sessions do not add independent testers. Record actual OS/browser/network coverage and avoid claims about untested devices.

Keep three evidence types distinct: logical validity from deterministic tests; operational validity from deployed sessions; enjoyment from observed human play.

## 7. Contest and workflow assessment

The official rules weight execution, creativity, value, and polish equally, with a top-20 first-round selection before final judging. A technically functioning prototype alone does not establish a competitive entry. Required submission materials and remaining eligibility checks remain in the competition plan. [C1]

The mission's minimum two-player direction fits this scope. Runtime AI is not an established requirement in the reviewed materials. Winning probability cannot be estimated from the available evidence.

The requirement IDs, task dependencies, and stage gates are useful. Keep them lightweight: update authoritative records rather than producing a new long document for every change. Historical checklist counts in the competition plan should be labeled as earlier audit snapshots, not current counts after later edits.

Retain B while researching mechanisms within it. A failed signal parameter is a reason to revise that mechanism, not silently replace the selected concept. A recommended model is not evidence of an independent review by that model.

## 8. Risk register and next decisions

| ID | Severity | Risk | Action | Requirement |
| --- | --- | --- | --- | --- |
| F-01 | High | Score discourages helping | Compare scoring/signal variants | SR-03, SR-04 |
| F-02 | High | Extracted player becomes passive | Define continued navigator role | SR-03, SR-04 |
| F-03 | Medium | Signals create shortcuts | Specify phases and test ordinary shortcuts | SR-02, SR-03 |
| F-04 | High | Hidden moves cause arbitrary collisions | Compare coordination variants | SR-03, SR-04 |
| F-05 | High | Rules omit edge-case precedence | Define resolution/state table | SR-04, SR-05, SR-06 |
| F-06 | Medium | Small map set becomes memorized | Validate variety without expanding scope prematurely | SR-03, SR-07 |
| F-07 | High | Some layouts fail route criterion | Validate every shipped map | SR-07 |
| F-08 | High | Human feedback arrives late | Candidate early; preserve repair buffer | SR-03, SR-08 |
| F-09 | High | Cloud access/cost unknown | Complete TECH-01 | SR-09 |

Proceed now with GP-01: compare at least two bounded communication variants and address F-01 through F-05 with worked examples and counterexamples. This assessment is input to GP-01, not completion of its full acceptance criteria.

Proceed to full production only after coherent core rules, useful roles for both players, validated candidate routes, participant acceptance of the design, and a public technical proof. Rework within B if success requires blind guessing, partner information rarely matters, or one player is regularly passive. Account-dependent deployment can wait while independent research continues.

## Sources

Accessed October 6, 2026.

- **A1:** [Azure Container Apps ingress](https://learn.microsoft.com/en-us/azure/container-apps/ingress-overview).
- **A2:** [Azure Container Apps billing](https://learn.microsoft.com/en-us/azure/container-apps/billing).
- **A3:** [Azure for Students](https://azure.microsoft.com/en-us/free/students/).
- **C1:** [Official contest rules](https://go.joinhandshake.com/rs/390-ZTF-353/images/%5BAI_Skills_Studio_Challenge%5D_Contest_Official_Rules.pdf?version=0).
- Internal sources: [competition-plan.md](competition-plan.md), [game-concepts.md](game-concepts.md), [project-brief.md](project-brief.md), [tasks.md](tasks.md), and [development-workflow.md](development-workflow.md).
