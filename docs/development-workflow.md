# Signal Rescue Development Workflow

Updated: October 6, 2026
Scope: All subsequent project work. Follow explicit participant instructions if they change these working agreements.

## 1. Document ownership

| Document | Authority |
| --- | --- |
| `competition-plan.md` | Contest sources, overall schedule, submission obligations, model recommendations |
| `decisions.md` | Participant constraints and decisions, including why a choice changed |
| `game-concepts.md` | Historical options and concept-stage hypotheses |
| `project-brief.md` | Selected product, scope, requirement IDs, success criteria |
| `requirements-analysis.md` | Detailed functional/non-functional requirements, user stories/use cases, open decisions, and traceability to SR parent IDs |
| `tasks.md` | Current work status, dependencies, next task, and completion evidence |
| `gameplay-research.md` | Research findings, alternatives, examples, and unresolved hypotheses |
| `game-design.md` | Historical 0.2 extraction rules and their audit context |
| `candidate-gameplay-spec.md` | J1-C1 candidate rules, authored mission witnesses, and implementation acceptance; not a release baseline |
| `mobile-wireframe.html` | Static low-fidelity interface study; no functional or device evidence |
| `architecture.md` | High-level technical design, draft room/protocol/lifecycle contracts, deployment candidate, and first implementation slice |
| `test-evidence.md` | Future verification results tied to a build and requirement |

Create future documents when their tasks begin. Do not copy a full rule set into multiple places. When a decision changes, update its authoritative document and affected references in the same work unit. A research hypothesis never silently becomes an approved rule.

## 2. Work states and priorities

Use `TODO`, `IN PROGRESS`, `BLOCKED`, and `DONE`. `BLOCKED` means a named dependency prevents that task, not that all project work must stop. Record the required input or failing condition and continue independent work where useful.

- P0: official submission/eligibility blocker, broken core session, private-state leak, incorrect outcomes, or unavailable production game.
- P1: necessary gameplay quality, usability, or reliability work.
- P2: optional polish or content. Cut before delaying P0/P1 work or the submission buffer.

Keep one primary task in progress. Do not start unrelated features while its acceptance criteria remain unresolved. No automatic agent delegation, recurring monitoring, or external messaging is established by this workflow.

## 3. Definition of ready

Before implementing a task, establish:

1. The player/problem outcome and linked requirement IDs.
2. Inputs and dependencies that are actually available.
3. A bounded change with explicit exclusions.
4. Acceptance criteria and the smallest meaningful verification method.
5. Any unresolved decision and whether it blocks the task.

Research tasks can start with uncertain rules if they name the hypotheses they will test. Production implementation cannot depend on contradictory or unspecified resolution rules.

## 4. Work loop

Use [short-development-cycle.md](short-development-cycle.md) for the practical cycle checklist, the initial implementation sequence, wireframe guidance, and Git synchronization procedure. It applies this workflow without adding another approval gate.

1. Read the current brief, relevant decisions, and active task before editing.
2. State the intended outcome and any consequential assumption to the participant.
3. Perform one bounded research or implementation increment. Save project content in English.
4. Verify against its acceptance criteria. Use source checks for factual claims and executed tests for software behavior.
5. Review the result for contradictions, scope drift, and affected requirements. A second reading or model is not a substitute for evidence.
6. Update task status and decisions. Record what passed, failed, or remains untested.
7. Report the result, evidence, limitations, and next action concisely.

Suggested participant session: five minutes to review status, about forty minutes on the focused task or review, ten minutes for verification, and five minutes to record the outcome. This is a flexible timebox; assistant execution time is separate.

## 5. Stage gates

| Gate | Deliverable and exit condition | Work permitted afterward |
| --- | --- | --- |
| G0: Selected direction | Participant has selected B and scope is recorded | Gameplay research |
| G1: Research complete | Alternatives, worked scenarios, failure risks, and a recommended prototype rule set are documented; no known logical contradiction in examples | Focused prototype and participant review of proposed rules |
| G2: Design baseline | Participant accepts core gameplay; actions, information, resolution, objectives, timeouts, and examples are explicit | Full core-loop implementation |
| G3: Technical proof | Two devices complete the central interaction through a public Azure deployment with correct state/private views | Expand the approved loop and presentation |
| G4: Playable candidate | Full loop works, authored levels are validated, onboarding exists, no known blocker prevents a session | Structured human tests around October 25 |
| G5: Release candidate | Feedback triaged, P0 defects closed, relevant regression checks pass, deployment/rollback recorded | Submission preparation and final public smoke test |
| G6: Submitted | Correct mission submission has an explicit confirmation and stable URL | Maintenance and organizer follow-up |

G2 and G3 may be developed together using a small throwaway prototype. Do not build content or elaborate art around an unproven mechanic. Automated checks and technical smoke tests happen throughout; the October 25 date is for structured friend playtests, not the first verification of any kind.

Ask for a participant decision when changing the core experience, concept, spending commitment, or agreed milestone. Routine implementation choices, reversible fixes, and already-authorized work do not require repeated permission. Gate completion is established by evidence, not by an unnecessary approval ceremony.

## 6. Gameplay research standard

Timebox the first research package to approximately 2-3 hours of participant involvement, not a mandatory tool wait or a guarantee of elapsed time. Recommend GPT-6 Astra / Medium as recorded in the main plan; never claim a model was used without evidence.

Evaluate at least these issues:

- Shared board versus separate boards: what does each screen reveal and why does the partner matter?
- Signals: what can be sent, when, at what cost, and whether coordinates or repeated messages trivialize hidden information.
- Simultaneous actions: hazards, collisions, extraction, strikes, score, and terminal-state precedence.
- Information versus guessing: can a player justify a decision from information available at that moment?
- Cooperation versus instruction-following: do both players make decisions, including after one robot reaches its goal?
- Level design: full-information solvability, hidden-information difficulty, repeated-route shortcuts, and replay variety.
- Scoring incentives: does penalizing signals discourage the cooperative behavior the game is intended to celebrate?
- Scope: number of screens, level count, content cost, and mobile readability.

Use explicit scenarios, counterexamples, and any small analytical checks needed. Keep research code under `game/` and conclusions under `docs/`. Label simulations and designer reasoning as such. No human test is recorded unless a human actually participates.

## 7. Verification and definition of done

A completed task needs a deliverable, satisfied acceptance criteria, a review of affected behavior, and a concrete evidence reference. Documentation work needs factual/structural checks, not artificial unit tests. Code needs checks proportionate to the risk.

For rule logic, test boundaries and combinations rather than only happy paths: duplicate actions, same-cell destinations, swaps, hazard-stopped movement, simultaneous strikes/extraction, timeouts, and terminal states. For networking, check authorization, room isolation, reconnects, and concurrency. For product quality, use actual first-time players.

Record future test results with:

`Date | Task/requirement | Build/version | Environment | Steps | Expected | Observed | PASS/FAIL/NOT TESTED | Evidence/defect`

After a meaningful fix, rerun affected checks and a core smoke test when appropriate. Broaden the test run when the change crosses subsystem boundaries; avoid repeated identical runs without a reason. Release gates require the final candidate, not an unrelated earlier build.

## 8. Change and defect control

Record material changes in `decisions.md` with an ID, date, previous behavior, new behavior, reason, schedule/test impact, and status. Do not erase rejected options or imply an untested change solved a defect.

Defect format: `ID | Severity | Build | Reproduction | Expected | Actual | Fix | Regression evidence | Status`.

After two failed fixes to the same reproduced issue, stop broad patching, isolate a minimal reproduction, and reassess the cause. Escalate reasoning/model only if useful; actual evidence remains necessary.

After October 24, default to fixes and clarity improvements. Any new mechanic must show why it is essential and how the submission buffer survives. Cut optional animation and content before reliability. Changing away from B requires the participant's decision.

## 9. Source control and release discipline

At implementation start, establish Git if not already present, ignore credentials/dependencies/transient files, and keep meaningful checkpoints. Avoid modifying unrelated work. A small coherent change should have a concise description and its verification recorded.

Record the release commit/version and deployment ID, preserve a known-good build, and test rollback before submission. Never place API keys, account tokens, identity documents, or tax records in project files. Provisioning and spending follow the participant's actual authorization and verified Azure budget.

## 10. Current status

G0 and G1 are complete. GP-01 produced a documented prototype proposal and executed local rule checks. G2-G6 remain open. Production implementation, Azure deployment, and human playtests have not been completed. See `tasks.md` for current work and `gameplay-research.md` for evidence limits.
