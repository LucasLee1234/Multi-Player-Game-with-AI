# Signal Rescue Task Board

Updated: October 8, 2026
Active direction: B - Signal Rescue
Current gate: G0 and G1 complete; G2 open
Primary next task: SF-04 first-time partner inspection of the three-room campaign, including crate Push/Pull clarity; retain actual phone/public requirements

Current control baseline: direct independent movement, automatic start and idle waiting. [independent-movement-spec.md](independent-movement-spec.md) supersedes earlier Ready/Wait contracts. SF-02 is implemented in [shared-passage-implementation.md](shared-passage-implementation.md): First Connection leads to Trade Places through matching next-room choices; pressure gates and authored geometry are verified. Sixty-seven regression tests pass. SF-03 adds Keep the Power On after Trade Places: [crate-implementation.md](crate-implementation.md).

Status meanings and completion standards: [development-workflow.md](development-workflow.md).

Gameplay exploration update (October 6): [cooperative-robot-alternatives.md](cooperative-robot-alternatives.md) compares relay/gate, tether, and parallel-world robot adventures. R1 relay/gate research is recommended for a bounded experiment; participant selection is pending. This research does not replace J1, authorize new mechanics, or establish human enjoyment. Resolve this gameplay choice before expanding J1 content.

R1 follow-up: requested design/validation completed in [signal-foundry-spec.md](signal-foundry-spec.md). The momentary-gate proposal exposed a reachable softlock; latch-on-entry SF-T1 v2 has completion paths from all 21 reachable research states. This is a bounded prototype recommendation, not a browser implementation or full product replacement. Next gameplay increment: the single SF-T1 room; detailed requirement/contract updates precede its integration.

Implementation follow-up: the participant requested implementation. SF-01 is complete locally; First Connection is now the default startup profile. Previous research-only notes above are historical. J1 remains a developer comparison; full product/human acceptance is still open.

October 7 feedback: the participant reports enjoying First Connection and requests more complex obstacles/cooperation. [foundry-expansion-design.md](foundry-expansion-design.md) supplies two concrete room designs. Executed research found no unrecoverable reachable state in either revised design; a rejected crate map did contain deadlocks and was repaired with a service bay. This is design/model evidence, not a new browser build or independently observed friend test.

## Completed setup

| ID | Priority | Status | Deliverable | Evidence |
| --- | --- | --- | --- | --- |
| SET-01 | P1 | DONE | Record participant selection of B | Participant instruction in chat; DEC-001 in `decisions.md` |
| SET-02 | P1 | DONE | Define product objective and requirement IDs | `project-brief.md` |
| SET-03 | P1 | DONE | Establish work states, stage gates, verification, and change control | `development-workflow.md` |
| SET-04 | P1 | DONE | Establish this dependency-ordered task board | This file |

## Backlog

Feasibility review: [feasibility-analysis.md](feasibility-analysis.md). GP-01 is now complete: [gameplay-research.md](gameplay-research.md) compares three variants and records executable checks. Human enjoyment, public multiplayer, and G2 acceptance remain unverified.

| ID | Priority | Status | Outcome / acceptance criterion | Dependencies | Requirements |
| --- | --- | --- | --- | --- | --- |
| GP-01 | P1 | DONE | Three variants, three scenarios, counterexamples, recommended rules and bounded checks recorded in `gameplay-research.md` | SET-01 to SET-04 | SR-03, SR-04, SR-07 |
| GP-02 | P1 | IN PROGRESS | Bounded J1-C1 specification, asymmetric routes, recovery examples, and wireframe prepared; obtain prototype/participant evidence of meaningful participation before G2 acceptance | GP-01 | SR-02 to SR-08 |
| SYS-01 | P0 | DONE | Local create/join, exactly two sessions, authorized live lobby, recovery/expiry, takeover, and Leave; 14 automated tests plus browser inspection | Candidate preparation; coding explicitly resumed | FR-01 to FR-06, FR-18 to FR-20, FR-24; NFR-01 to NFR-03, NFR-15, NFR-16 |
| SYS-02 | P0 | DONE | J1-C1 authoritative turns/private views implemented; mutual start, signals, proposals, revision-bound Ready, outcomes/retry/recovery; 36 automated tests and scripted-partner browser inspection | SYS-01, J1-C1 | FR-07 to FR-14; NFR-01, NFR-02 |
| SF-01 | P1 | DONE | Implement the SF-T1 relay/gate teaching room, tile pings, joint exit and mutual retry; actual rules match research state counts and recover from every reachable state | Participant implementation request; SF-T1 spec | SF-01 to SF-07; SR-01 to SR-08 scoped experimental coverage |
| SF-D02 | P1 | DONE | Define shared-passage and crate rooms, exact gate/transport rules, routes, deadlock repairs and implementation criteria; 30 research checks and exhaustive reachability | Participant complexity-design request | SR-03, SR-04, SR-07 |
| SF-CTRL | P1 | DONE | Replace foundry start/step confirmations with automatic two-client start and independent direction/key movement; idle is Wait, live power, deduplicated moves and recovery verified | Participant direct-movement request | SR-01, SR-04 to SR-08 |
| SF-02 | P1 | DONE | Authored geometry, SF-M2 shared passages/pressure gate and mutually selected progression; 220 actual-engine states all recoverable, both routes tested, 61 regressions and narrow/browser completion checked | SF-D02; participant continuation | SR-03 to SR-08 |
| UI-01 | P1 | DONE | Compact map-first interface, expandable room/help, accessible arrow pad and CSS feedback; 61 regressions and desktop/narrow scripted inspection | Participant simple-UI request | SR-08 |
| UI-02 | P1 | DONE | Gate tiles expose relay ID, persistent/hold behavior and current state; locked-open inspection explains relay no longer needed; compile and browser/narrow checks passed | Participant gate confusion | SR-08 |
| SF-03 | P1 | DONE | Add one crate with explicit Push/Pull and sustained-power completion; implement SF-M3 and verify recovery/reset/transport conflicts | SF-02 | SR-03 to SR-08 |
| SYS-03 | P1 | TODO | Observe first-time SF-T1 understanding and inspect actual phone controls; adjust onboarding/interaction to concrete confusion | SF-01; participant/device observations | FR-21 to FR-23; NFR-04 to NFR-06 |
| TECH-01 | P0 | TODO | Confirm Azure balance/expiry/access; select and cost a small deployment route, including review-window operation | Participant account access | SR-09 |
| TECH-02 | P0 | TODO | Establish source control/runtime and deploy one playable interaction on two devices with correct private views | GP-01, TECH-01; provisional rules clearly labeled | SR-01, SR-02, SR-05, SR-09 |
| BUILD-01 | P0 | TODO | Implement approved complete session, terminal results, selected scoring policy if adopted, and replay with rule tests | GP-02, TECH-02 | SR-01, SR-04, SR-05 |
| LEVEL-01 | P1 | TODO | Produce a small authored mission set; verify solutions and document restricted-information risks | GP-02, tested rule engine | SR-03, SR-07 |
| UX-01 | P1 | TODO | Implement English onboarding, mobile controls, private/public labels, useful error states, and accessibility checks | GP-02, BUILD-01 | SR-02, SR-08 |
| REL-01 | P0 | TODO | Verify authorization, concurrent actions/rooms, retries, timeouts, reconnects, and restart behavior | BUILD-01 | SR-02, SR-05, SR-06 |
| PLAY-01 | P1 | TODO | Around Oct 25-26, observe participant plus at least one first-time friend; record understanding, partner-dependent decisions, confusion, enjoyment, and replay interest | Candidate ready by Oct 24 | SR-03, SR-08 |
| FIX-01 | P0 | TODO | Resolve release blockers and highest-impact feedback; rerun affected tests and full public smoke test | PLAY-01, REL-01 | SR-01 to SR-09 |
| ENTRY-01 | P0 | TODO | Complete remaining eligibility/account/conduct checks and prepare correct title, cover, description, and URL | Participant input; final build for accurate claims | SR-10 |
| RELEASE-01 | P0 | TODO | Save reproducible release and rollback evidence; confirm public access and credit runway | FIX-01, TECH-01 | SR-01, SR-09 |
| SUBMIT-01 | P0 | TODO | Submit through the mission on Oct 28 and retain confirmation | ENTRY-01, RELEASE-01 | SR-10 |
| OPS-01 | P1 | TODO | Maintain access through planned review and handle organizer follow-up | SUBMIT-01 | SR-09, SR-10 |

P0 denotes importance, not a requirement to finish every P0 before any independent P1. Gameplay research can proceed while account-specific checks remain open.

## GP-01 research brief

**Problem:** the premise is selected, but the current signal budget, private hazard layers, scoring, and simultaneous movement may produce guessing, shortcuts, or passive players.

**Deliverable:** `docs/gameplay-research.md`, created when research begins. Include:

1. A concise hypothesis about why helping the partner is enjoyable.
2. At least two bounded alternatives for communicating information within Signal Rescue.
3. Three worked situations: a useful warning, a coordination conflict, and a recoverable mistake.
4. A counterexample that breaks or trivializes each proposed approach.
5. An analysis of signal penalties, goal extraction, and continuing participation after one robot finishes.
6. Solvability and partial-information limits, without conflating them.
7. One recommended prototype, exact provisional rules, cut-first scope, and unanswered human-testing questions.
8. Evidence labels distinguishing source facts, calculations, designer inference, and future tests.

**Timebox:** approximately 2-3 hours of participant involvement for the first research/review cycle. Work may use less; do not prolong it to fill the budget.

**Exit:** a coherent, testable prototype proposal with examples and risks. Human enjoyment remains unverified until PLAY-01. Approval of B does not mean approval of every number in the old concept draft.

**Out of scope:** production backend, detailed art, extra players, large level generation, external publication, or actual cloud spending in this research task.

## Session log

| Date | Task | Result | Verification | Next |
| --- | --- | --- | --- | --- |
| Oct 6, 2026 | SET-01 to SET-04 | Recorded B selection and created brief, workflow, and task board | Documentation consistency and local-link checks for this update | GP-01 gameplay research |
| Oct 6, 2026 | Feasibility review | Identified nine risks; B remains selected | Official sources rechecked; bounded probe: 441 layouts, 423 safe solutions within eight turns, 18 without | GP-01 to address findings F-01 through F-05 |
| Oct 6, 2026 | GP-01; GP-02 draft | Compared three signaling variants; proposed design 0.2; G1 complete | Local rule tests and `gameplay-validation-results.json`; human testing pending | GP-02 interaction review; TECH-01 account checks |
| Oct 6, 2026 | Player-count audit | Exactly two satisfies the local mission minimum | `info/create.doc` rechecked and official web sources reopened; `player-count-compliance.md` | Retain two-player scope; prove public two-device play |
| Oct 6, 2026 | Second gameplay review | Reopened 0.2 recommendation; complete disclosure fits all 423 safe-solvable layouts at score 100 | Existing rule functions replayed two signaling/Wait turns then safe routes; `gameplay-second-review-results.json` | Continue paper review; no prototype construction yet |
| Oct 6, 2026 | Continued GP-02 analysis | Distinguished disclosure from loss of cooperation; proposed joint-exit candidate J1 | `gameplay-cooperation-analysis.md`: manually checked five-step coordination witness; no new model or human test | Analyze an asymmetric J1 mission before any baseline decision; prototype remains deferred |
| Oct 6, 2026 | Development preparation | Created short-cycle checklist, repository README, and initial ignore rules; recorded requested Git sync during upcoming coding | Documentation checks and README research commands; project-local Git repository and target remote not yet configured | Complete bounded specification and low-fidelity layout; establish project-local Git when coding starts |
| Oct 6, 2026 | Requirements analysis | Consolidated user needs, 24 functional requirements, 14 quality requirements, constraints, stories, use cases, and SR traceability | `requirements-analysis.md`; proposed policies and unresolved choices explicitly labeled; document checks | Bounded selected-rule implementation specification and low-fidelity layout; prototype deferral remains in effect |
| Oct 6, 2026 | Requirements readiness review | Ready for high-level system design; gameplay/recovery/sizing freeze conditional | `requirements-readiness-review.md`; SRS 1.1 adds derived resource/transport obligations and lifecycle/envelope decision entries; document checks | Focused `architecture.md` when requested; resolve affected contracts during design; no coding resumed |
| Oct 6, 2026 | System design | Created `architecture.md` with modules, filtered views, anonymous seat control, serialized commands, lifecycle, bounds, hosting candidate, and SYS-01 | Official technical sources checked; local Node available, default npm broken; design consistency/link checks; no implementation evidence | Bounded candidate gameplay specification and low-fidelity layout; repair/select package-manager path at coding start; Azure account check before provisioning |
| Oct 6, 2026 | GP-02 bounded preparation | Selected J1-C1 for prototype specification; two mission candidates, exact rules, asymmetric informed routes, recoverable mistakes, and static layout | `candidate-gameplay-spec.md` paper checks P-01 to P-06; document/HTML structural checks; no J1 engine, visual device test, or human evidence | SYS-01 when coding resumes; verify candidate rules in actual engine; G2/G3 remain open |
| Oct 6, 2026 | SYS-01 short coding cycle | Coding explicitly resumed; project-local Git, pinned dependencies, room server and browser interface implemented | `test-evidence.md`: 14 automated checks passed; browser creation, refresh, takeover, leave, invalid-code and restart feedback checked; mobile/public/human proof pending | SYS-02 synchronized J1 turn/private layers; Azure account check before public provisioning; no remote configured |

| Oct 6, 2026 | SYS-02 coding cycle | Implemented J1-C1 asymmetric mission and synchronized turns, filtered views, mutual start/retry, outcomes and phase-preserving recovery | `test-evidence.md` SYS-02: 36 tests passed; browser A plus scripted B completed seven-turn/zero-strike witness; final signal-to-confirm flow checked; no human/mobile/public claim | Human two-context inspection, SYS-03 teaching/phone work; TECH-01 Azure account/cost; no GitHub remote |

| Oct 7, 2026 | SF-02 short cycle | Generalized factory geometry; implemented Trade Places, pressure gates and matched next-room/retry choices | 61 passing tests; 220 actual states all recoverable; scripted browser progression, 16-step completion, retry and narrow layout | SF-03 crate transport; human/phone/public proof remains open |

| Oct 8, 2026 | SF-03 short cycle | Implemented third room, atomic Push/Pull, crate relay power and three-part extraction objective | 67 passing tests; 2,496 actual states all recoverable; 18-step minimum; three-room browser progression, 22-step crate completion, replay and narrow layout with scripted B | SF-04 first-time partner/phone inspection; public deployment prerequisites |

SF-03 local completion authority: [crate-implementation.md](crate-implementation.md). Scripted browser evidence does not close G2/G3. The next cycle should test whether first-time players understand Pull and sustained power before expanding mechanics.
