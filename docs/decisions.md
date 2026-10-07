# Project Decisions and Participant Constraints

Updated: October 6, 2026<br>
Source: participant statements in this chat, unless a linked official source is identified.

## Confirmed participant statements

These are recorded statements, not independent identity, account, or eligibility verification.

| Topic | Participant statement | Planning consequence |
| --- | --- | --- |
| Age | At least 18 years old | Age threshold reported met; check any applicable majority-age condition |
| Residence | Legally resides in the United States | Use the United States for the eligibility review |
| Submission location | Will be in the United States when submitting | Physical-location condition reported planned |
| Handshake | Can access the contest mission | Continue with mission-specific preparation |
| ChatGPT | Can use ChatGPT | Specific Work access still needs confirmation |
| Daily availability | About one hour or more according to task needs | Plan small daily decisions and bounded review tasks; longer sessions remain flexible |
| Human playtesting | Start around October 25, 2026 | Complete a playable candidate by October 24; reserve October 26-27 for fixes |
| Submission | October 28, 2026 | Internal 6:00 PM America/Chicago target is a planning recommendation, not a participant-specified time |
| Hosting | Azure using the student USD 100 credit | Stay on Azure; choose the service after concept selection and a credit/access check |
| Devices | A phone and a computer | Prove cross-device play; exact OS/browser models remain unknown |
| Testers | Can invite at least one friend | Baseline human test: participant plus one first-time friend; wider recruitment is optional |
| Game preference | No current genre preference | Prepare three creative, compact candidates at the next selection step |
| Language | English project contents | All saved artifacts and game text remain English |

## Adopted planning decisions

- Keep all code, tests, runtime assets, and deployment configuration in `game/`.
- Keep designs, research, decisions, test evidence, and submission materials in `docs/`.
- Keep supplied source documents in `info/`.
- Use one small game mode and make two-player gameplay enjoyable on its own. Additional player capacity is optional until tested.
- Prefer no required voice call, no player login, and no installation.
- Target 21-30 hours of participant involvement through October 28; assistant execution/waiting time is separate. Re-estimate after concept and deployment proof.
- Start structured friend playtests around October 25. Early device checks validate deployment and synchronization; they do not substitute for later enjoyment tests.
- Use Azure as the selected hosting provider. Exact service, region, runtime, storage, and scaling remain undecided.
- Use the reported student credit as the funding source. The actual remaining balance/expiry are unverified. Additional cash spending or a subscription upgrade is not approved.
- Preserve the October 28 submission target and aim to keep the submitted game available through at least November 29.
- Record truthful test coverage. Repeated sessions with one friend do not equal multiple independent testers.

## Remaining checks

- [ ] Confirm specific ChatGPT Work access, account email access, applicable majority-age requirements, and excluded-party status.
- [ ] Locate the contest-specific Code of Conduct and resolve workflow questions only if they apply.
- [ ] Verify Azure subscription activation, remaining credit, expiration date, available services/regions, and spending controls without saving secrets or personal identity documents.
- [ ] Identify the phone/computer OS and browsers when constructing the test matrix.
- [ ] Arrange the friend's availability around October 25-26; ask about further testers only if useful.
- [x] Select a concept: participant chose B - Signal Rescue. Detailed rules remain provisional.
- [ ] Set a measured Azure cost estimate and contingency before provisioning resources.

## Azure source check

Checked official Microsoft documentation on October 6, 2026:

- [Azure for Students](https://azure.microsoft.com/en-us/free/students/) describes USD 100 credit usable within 12 months. This does not establish the participant's actual remaining balance.
- [Student subscription disablement](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/azurestudents-subscription-disabled) explains credit exhaustion/expiration.
- [Container Apps ingress](https://learn.microsoft.com/en-us/azure/container-apps/ingress-overview) documents WebSocket support, making a small Node multiplayer service a candidate to validate.

No Azure resource has been created, no subscription setting has been changed, and no public deployment or human playtest has occurred as part of this update.

## Concept options prepared

The three proposals are recorded in [game-concepts.md](game-concepts.md). The participant selected Signal Rescue; A and C remain historical alternatives. The next deliverable is gameplay research, followed by a reviewed design baseline in `game-design.md`.

## DEC-001 - Select Signal Rescue and establish the workflow

Date: October 6, 2026. Status: Accepted by explicit participant instruction.

- Previous state: three candidate concepts; no selection.
- Decision: adopt B - Signal Rescue as the shared project direction, record implementation objectives, establish a strict software development workflow, then conduct gameplay research as the next step.
- Rationale: prioritize meaningful cooperation and the distinctive experience of seeing the partner's hazards. Contest success and player enjoyment remain hypotheses.
- Scope: two-player cooperative browser game, one small mode. Candidate numerical rules remain provisional.
- Schedule impact: B carries more design risk than A. Preserve the Oct 25 playtest and Oct 28 submission targets; re-estimate after research and simplify within B before expanding effort.
- Verification impact: add explicit checks for partial information, signal incentives, simultaneous movement, solvable layouts, and both players' continued participation.
- Authoritative documents: [project-brief.md](project-brief.md), [development-workflow.md](development-workflow.md), and [tasks.md](tasks.md).
- Next: GP-01 gameplay research. This update does not claim that research, deployment, implementation, or human testing is complete.

## DEC-002 - Revise the prototype after feasibility research

Date: October 6, 2026. Status: Design adjustments authorized; prototype 0.2 proposed, G2 acceptance pending.

- Replace the three shared mission signals and signal score penalty with one free signal per human per turn. Replace hidden moves with public proposals and revision-bound confirmation. Retain navigation and confirmation after robot extraction.
- Rationale: address F-01 through F-05 without adding another game mode or larger maps. Research compared three alternatives and recorded counterexamples.
- Scope: one tutorial plus two candidate research maps; defer a six-map commitment. Preserve the agreed milestones and existing participant effort envelope.
- Verification: executable boundary cases, 441 spatial layouts, 423 signal-capacity witnesses, and 209,034 transition invariant checks. Human fun and production/network behavior remain untested.
- Authoritative proposed rules: [game-design.md](game-design.md). Research/evidence: [gameplay-research.md](gameplay-research.md).
- Follow-up source audit: [player-count-compliance.md](player-count-compliance.md) confirms that exactly two players meets the documented minimum; public separate-device functionality still requires implementation and testing.

## DEC-003 - Defer prototype work and reopen gameplay recommendation

Date: October 6, 2026. Status: Prototype deferral explicitly requested; analytical reassessment completed.

- Participant instruction: do not construct a prototype now; validate and analyze gameplay again.
- Action: retain the current rules for audit, review incentives/information/participation, and check an adversarial strategy using existing research functions. No new executable rules model or game was created.
- Finding: two disclosure/Wait turns followed by a safe route win all 423 safe-solvable layouts in six or seven turns, scoring 100. Continued hidden-information cooperation is therefore not guaranteed by 0.2.
- Consequence: reopen the recommendation for 0.2; G2 remains open. GP-02 continues on paper. Concept B, exactly two players, and the agreed submission/testing milestones remain selected.
- Evidence and next analytical criteria: [gameplay-second-review.md](gameplay-second-review.md) and [gameplay-second-review-results.json](gameplay-second-review-results.json).

## DEC-004 - Prepare a short development cycle and Git synchronization

Date: October 6, 2026. Status: Documentation and future coding synchronization requested by the participant.

- Create a practical short-cycle document and a GitHub-ready root README.
- During upcoming coding work, make meaningful local commits and push verified increments to the participant's intended remote when configured. No automatic background synchronization is established.
- Current inspection: Git is installed, but the project has no local repository; Git found a different repository in the parent user directory. Establish an isolated project-local repository at implementation start.
- The participant confirmed that the GitHub repository has not been created. Repository creation, target account/name, visibility, and remote URL remain pending. Do not infer them from the parent repository.
- Recommend one low-fidelity layout before interaction coding; final visual polish follows core experience validation. The recommendation does not adopt J1 as a final rule set.
- Deliverables: [short-development-cycle.md](short-development-cycle.md), [README.md](../README.md), and the root `.gitignore`.

## DEC-005 - Establish the high-level system design

Date: October 6, 2026. Status: System-design work explicitly requested; technical choices documented for review and implementation verification.

- Design one same-origin browser/Node application with an authoritative in-memory room store, per-seat filtered snapshots, anonymous capability-cookie control, and serialized commands. Node 24 LTS/TypeScript, native browser WebSocket plus server `ws`, and Container Apps are the proposed implementation route.
- Resolve draft lifecycle policies for mutual start/next actions, reserved disconnected seats, explicit leave, controller takeover, bounded expiry, and safe lost-state termination. Define configuration defaults, not measured production capacity or verified cloud prices.
- Use one serving process/replica for the candidate deployment; restart/revision replacement ends in-memory sessions. Multi-replica coordination and durable restart recovery are outside this initial design.
- First slice SYS-01 covers rooms and authorized connections. J1 remains a gameplay recommendation requiring a selected-version specification and asymmetric mission evidence before engine freeze.
- Environment: Node 24.20.0 works; the default npm launcher refers to a missing module. No package-manager repair/install, Azure resource, source implementation, Git checkpoint/push, or human test was performed.
- Authoritative technical design: [architecture.md](architecture.md). Prototype deferral and existing milestones remain in effect.

## DEC-006 - Specify J1-C1 and bound initial content

Date: October 6, 2026. Status: Recommended preparation steps requested; candidate selected for a future prototype, not approved as a tested release baseline.

- Use joint exit with both robots remaining movable; retain truthful per-turn signals, public proposals, revision-bound readiness, and hazard-before-collision resolution. Eight turns and three strikes are test parameters.
- Bound content to one symmetric teaching mission and one asymmetric mission. Omit numerical points for C1; report outcome, turns, and strikes. Auto-mark logically deduced own safe cells only after both hazards are known from authorized information.
- The asymmetric mission admits both a seven-turn informed yielding witness and a six-turn alternative. Central-cell timing remains coupled after full disclosure; leaving an exit is necessary only for the witnessed pocket situation, not every solution.
- Paper recovery examples cover one wasted collision turn and one hazard-plus-collision turn. Neither proves human discovery or enjoyment. Existing 0.2 executable results do not validate J1.
- Deliverables: [candidate-gameplay-spec.md](candidate-gameplay-spec.md) and [mobile-wireframe.html](mobile-wireframe.html). Prototype deferral remains in effect; the next implementation slice is SYS-01 when coding resumes. No runtime implementation, package installation, Git setup/push, cloud spending, or human test occurred.

## DEC-007 - Resume coding with the SYS-01 local slice

Date: October 6, 2026. Status: Explicitly authorized by the participant's request to perform a short coding cycle.

- Supersedes the earlier prototype deferral for coding work. Implemented rooms and authorized live connections first; mission actions remain disabled.
- Created an independent project Git repository on `codex/sys-01` and used the participant-specified author identity in local configuration. Exclude supplied `info/` references and generated output; preserve them locally. No GitHub repository or remote was created.
- Current bundled executable reports Node 24.19.0, so pin that observed patch for this slice rather than the earlier planning inspection's 24.20.0. Pin pnpm 11.19.0 and exact dependencies with the project lockfile. System Node 24.20.0 appeared in the former nested-pnpm run; final check scripts avoid that dependency chain.
- Use explicit `--ignore-workspace` for the inherited parent-workspace environment. Keep the default npm issue separate; it was not repaired. Only command-scoped Git trust was used for the exact project during outside-sandbox Git, with no global setting change.
- Verification: 14 automatic boundary/integration tests passed; browser create/reload/takeover/leave/invalid-code/restart checked. Mobile override did not produce the requested measured width, so mobile compatibility remains unverified. No public deployment, phone session, gameplay, or human enjoyment claim.
- Evidence: [test-evidence.md](test-evidence.md). Next: SYS-02 authoritative turn and actual private hazard projections; retain G2/G3 open and Oct 25/28 milestones.

## DEC-008 - Implement the bounded J1-C1 gameplay slice

Date: October 6, 2026. Status: Explicit coding request fulfilled; tested local candidate, not human-approved release baseline.

- Implement server-only Different Dangers content and pure J1 transitions with per-seat allowlisted views. Mutual start, truthful signals, persistent/deduced own knowledge, public proposals, revision-bound confirmation, one-time resolution, outcomes and mutual retry now run locally.
- Keep this cycle to one asymmetric mission plus in-page instructions. Teaching mission/Continue and phone/public/human validation remain pending; no numerical points added.
- Retry identity keeps request ID, sequence, and semantic payload across authorized reconnect. Controller epoch is validated separately and can rebind without creating a new action. Pause clears agreements and preserves phase/mission; terminal closure retains only allowed outcome metadata.
- Test the browser using A plus a development-only B wire helper because the enabled UI browser has one cookie profile. This does not establish human participation/enjoyment. The helper is not public, not automatically launched, and was stopped by closing disposable rooms.
- Evidence: 36 automated tests passed; browser seven-turn zero-strike witness, terminal refresh, retry reset and final signal-to-confirm flow checked. Screenshots and limitations in [test-evidence.md](test-evidence.md). Local source control only; no GitHub remote, Azure resource or cloud spending.

## DEC-009 - Develop the Signal Foundry teaching experiment

Date: October 6, 2026. Status: Participant requested further work on the relay/gate direction; bounded design and research validation completed.

- Prepare one concrete tile layout and explicit SF-T1 rules, without replacing the running J1 browser game or committing to a campaign.
- Exhaustive research exposed a reachable deadlock in the original momentary-gate proposal. Recommend latch-on-entry gates for the teaching room; all 21 reachable revised-model states can complete.
- The five-turn shortest completion still contains four Wait action slots. Required gate dependencies are demonstrated; equal reasoning and enjoyment are unverified.
- Authoritative experiment specification: [signal-foundry-spec.md](signal-foundry-spec.md); executed model output: [signal-foundry-validation.json](signal-foundry-validation.json). No production SF-T1 engine, human test, cloud expenditure, or full product replacement acceptance is implied.

## DEC-010 - Implement SF-T1 as the default local experiment

Date: October 6, 2026. Status: Participant explicitly requested implementation; local slice completed, human/release acceptance pending.

- Default server startup now selects First Connection. Retain J1 with an explicit developer `GAME_MODE=J1` startup setting; no player-facing mode selection or second foundry room added.
- Reuse existing authority, command sequencing, confirmations and recovery; add fixed public factory tiles, turn-start relay power and latch-on-entry gates. Teaching room has no hazards/strikes/turn limit. Both retry agreements reset latches under a new mission ID.
- Reuse the bounded signal envelope as a public floor-tile ping, with the legacy Safe field meaning walkability only. UI explicitly describes a location ping, not private safety or open-gate permission.
- Actual TypeScript search matches the research audit's 21 reachable states and 120 transitions; every state can complete. Forty-six automated tests passed, including retained J1/room checks and foundry wire completion/reset/recovery.
- Browser A plus a development-only B helper completed in five turns and checked refresh/retry. A measured 390-pixel browser viewport fit without horizontal overflow. This is not actual phone/touch, human enjoyment, public deployment, or full release acceptance.
- Updated scoped SRS/architecture/specification/README; preserve original information-cooperation requirement as unresolved rather than calling a public teaching map sufficient. No Azure spending, remote repository creation, or push.

## DEC-011 - Expand cooperative obstacles after participant feedback

Date: October 7, 2026. Status: Participant reports the teaching room is enjoyable and requests complexity/obstacle/cooperation design; research package completed.

- Preserve SF-T1 as onboarding. Recommend SF-M2 with shared passages, parking spaces and a hold-open pressure gate, followed by SF-M3 with a pushable/pullable crate and sustained relay power.
- Validate concrete 5-by-3 layouts instead of assuming additional obstacles improve the experience. The proposed teaching gate's latching behavior remains unchanged.
- SF-M2 has a nine-turn shortest route and a verified twelve-turn alternative. Gate 2 is an optional route, not required by every solution. SF-M3 has an eleven-turn shortest route after adding a service bay to repair four reachable deadlocks in the rejected map. Pull is necessary for the authored delivery objective.
- Revised research models have completion paths from all 220 SF-M2 and 2,496 SF-M3 reachable states. Thirty explicit checks passed; no new browser or TypeScript gameplay was implemented in this design pass.
- Owner feedback does not imply an observed friend test or equal participation. Record waiting/handler imbalance and Ready friction in subsequent human inspection. Existing dates, Azure budget verification, and public-device requirements remain.
- Authority: [foundry-expansion-design.md](foundry-expansion-design.md); evidence: [foundry-expansion-validation.json](foundry-expansion-validation.json).

## DEC-012 - Independent movement and implicit waiting

Date: October 7, 2026. Status: Participant explicitly requested removing Ready and letting each player move independently; implemented locally.

- Default foundry profile now starts automatically when both seats are connected. Direction buttons and arrow keys/WASD move immediately. Remaining still is waiting; no movement confirmation, shared-plan UI or Wait button.
- Keep relay/gate geometry and latching; evaluate live power in ordered server commands. Count only successful steps, not idle time, pings or blocked requests. Mutual terminal retry still resets shared state.
- Use new move/ping commands without shared planning revisions. From-position plus seat sequence/request/epoch prevents stale or duplicate movement while allowing concurrent partner activity. Pause/reconnect preserves mission and resumes without Ready.
- Current teaching room has 21 recoverable states/58 directional requests; the 54-test suite passes. Re-audited future rooms under independent ordering: 220/2,496 recoverable states, shortest 16/18 individual steps. Their earlier simultaneous turn counts are historical.
- Browser button/ArrowRight/D movement completed in six steps with a scripted partner, not human evidence. Mouse relay/link hover was changed to avoid rebuilding clicked contents; pings rechecked.
- Authority: [independent-movement-spec.md](independent-movement-spec.md). No new rooms, public deployment, cloud spending or remote push in this change.
