# Multiplayer Game Competition Plan

Created and source-checked: October 6, 2026<br>
Planning timezone: America/Chicago<br>
Updated: October 6, 2026, after participant input<br>
Status: B - Signal Rescue selected by the participant. Gameplay research is next. Azure is the selected provider, while its service, actual credit balance, and deployment remain unverified.

## 1. Objective and working agreement

Build an original, enjoyable, reliable multiplayer browser game for the Handshake AI Skills Studio x OpenAI Multiplayer Game Challenge. Optimize for all four judging categories while completing a valid submission early. Winning cannot be guaranteed: the rules specify comparative judging, not a qualifying score that guarantees a prize.

All project files, filenames, code comments, game text, plans, and saved work records must be in English.

- `game/`: executable game source, automated tests, dependencies, runtime assets, and build/deployment configuration.
- `docs/`: all non-code work, including designs, plans, research, decisions, test evidence, asset provenance, and submission materials.
- `info/`: the original reference documents already supplied by the user.

This plan, `docs/decisions.md`, `docs/game-concepts.md`, `docs/project-brief.md`, `docs/development-workflow.md`, and `docs/tasks.md` exist. The task board is the authoritative current work status; this plan retains the broader contest roadmap. Other proposed files are future deliverables. Keep one authoritative version of each decision rather than duplicating requirements across many documents.

**Labels used throughout:**

- **Official:** stated in the supplied contest rules or mission materials; source IDs identify the authority.
- **Project target:** a measurable internal quality goal, not a contest requirement or promised winning threshold.
- **Recommendation:** an implementation or workflow choice to validate.
- **Unconfirmed:** requires participant information, organizer clarification, account access, or a real test.

## 2. Verified contest baseline

This section is based primarily on the local official rules, read in full, and the two local mission documents. The online official rules were also checked for the deadline, entry requirements, judging process, and prize description. [L1-L3, W1-W3]

| Item | Verified requirement or finding | Practical consequence |
| --- | --- | --- |
| Prize | The top three winners each receive USD 1,000. | Finishing the mission does not automatically earn money. |
| Selection | Round 1 selects the top 20 entries; Round 2 applies the same criteria through judges from Handshake or partner sponsors. | Prepare for hands-on evaluation by someone unfamiliar with the project. |
| Scoring | Execution, Creativity, Usefulness / Value, and Polish & Thoughtfulness each carry 25%; each has levels 1 through 5. | A technically functional but generic game is insufficient as a competitive strategy. |
| Entry window | September 22 through October 30, 2026, at 11:59 PM Pacific Time. | Use this explicit formal deadline instead of the less precise October 31 marketing copy. |
| Age and location | Individual legal residents of Appendix A locations, at least 18 / the applicable age of majority; entrants must also be in an eligible location when entering. | Confirm both residence and physical location. Nationality alone does not answer eligibility. |
| Eligible locations | Appendix A lists the United States, Canada, India, many European countries, and specified other territories/countries. Mainland China, Hong Kong, Macao, and Taiwan are not listed. | Consult the complete appendix for the entrant's actual circumstances; do not infer eligibility from device timezone or language. |
| Account | An active Handshake account associated with the entry email is required. | Verify the account, mission access, and email receipt before substantial competition-specific spending. |
| Exclusions | Specified Handshake personnel, related parties, and certain family/household members are excluded. | Check the eligibility paragraph, not only age and country. |
| Submission | Submit through the Handshake AI Skills Studio "Create a Multiplayer Game" mission with title, cover image, description, and project URL. | A GitHub repository, public website, or social post alone is not a contest entry. |
| Game minimum | At least two players on separate devices; understandable rules; a publicly reachable URL or host. | A local-only or simulated multiplayer demo does not establish compliance. |
| Mission experience | The mission describes ChatGPT Work, synchronized play, room codes, phone/laptop access, no player login, and no installation. | Build toward this complete experience. The creator still needs platform accounts. |
| Tutorial scope | The example prompt uses 2-8 players; a deployment example uses three rounds. | These examples do not establish a universal eight-player or three-round minimum. |
| Multiple entries | Multiple entries are allowed; mass entries and entries generated through scripts/macros/automated devices are prohibited. | Focus on one strong entry and use the normal submission flow. AI-assisted game development is explicitly part of the mission. |
| Costs and award | Entry is free; purchases do not improve winning chances. Handshake may cancel the contest or withhold prizes. | Set a development/hosting budget independently of the prize. |
| Notification | Winners are notified through the account email within 30 days after the deadline. | Check email and spam folders through November 29, 2026; allow for organizer updates. |
| Prize acceptance | Eligibility evidence, written acceptance, releases, and tax-related obligations may apply. | The participant handles these personally and keeps sensitive records outside the public repository. |
| Rights and conduct | Entry grants broad, perpetual promotional licenses for the submission and specified personal information; rules reference a Challenge Code of Conduct and applicable service terms. | Review those obligations before submission; record asset rights and resolve any missing conduct guidance. |

**Deadline conversion, verified using timezone data:**

| Timezone | Formal deadline |
| --- | --- |
| America/Los_Angeles | October 30, 2026, 11:59 PM PDT (UTC-07:00) |
| America/Chicago | October 31, 2026, 1:59 AM CDT (UTC-05:00) |
| UTC | October 31, 2026, 06:59 |
| Asia/Shanghai | October 31, 2026, 2:59 PM CST (UTC+08:00) |

**Internal submission target: October 28, 2026, by 6:00 PM America/Chicago.** Reserve October 29-30 for submission problems and narrowly scoped fixes. Do not use the last hours as planned development time.

### Participant constraints recorded on October 6

The participant reports being at least 18, legally residing in the United States, and planning to be in the United States at submission. They can access the Handshake mission and ChatGPT. These are participant statements, not an independent eligibility determination. Specific ChatGPT Work access, the linked email, and excluded-party status still need confirmation.

Daily participant availability is approximately one hour or more as needed. Structured human playtesting should start around October 25; submission is planned for October 28. A phone and computer are available, and at least one friend can be invited. More testers are optional. The hosting provider is Azure using the reported USD 100 student credit. The actual remaining balance, expiry, and service permissions have not been inspected. No additional out-of-pocket spending is approved.

The participant selected B - Signal Rescue after reviewing three concepts. The initial release targets exactly two players in one cooperative mode. See `docs/project-brief.md` for the objective and `docs/decisions.md` for the selection record. Gameplay research precedes approval of the detailed rules.

### Conflicts and remaining uncertainties

1. **Deadline:** mission marketing says October 31, while the formal rules specify October 30 at 11:59 PM PT. The plan uses the explicit formal deadline. Recheck for an official amendment before submission. [L1 p. 1; L2; W1-W2]
2. **Cover image:** general help marks preview images optional, but this contest's rules require a cover image. Supply one. [L1 p. 1; W3]
3. **Submission versus AI Showcase:** general help treats Showcase as an optional separate choice. The contest rules require the mission submission and do not explicitly require Showcase enrollment. Check any contest-specific wording visible in the actual form. [L1 p. 1; W3]
4. **Code of Conduct:** referenced in the rules, but its full contest-specific text is not in `info/` and was not established by this research. Locate it in the mission or request it from Handshake if necessary; do not invent its contents. [L1 p. 4]
5. **Work versus Codex:** mission instructions explicitly name ChatGPT Work. The reviewed rules do not clearly resolve a Codex-only workflow. Use Work for the mission's design/build workflow, retain a truthful account of tools used, and clarify acceptability if the intended workflow would be exclusively Codex. [L2-L3; W2]
6. **Team entry and later edits:** the contest identifies individual account holders; team award handling and post-submission update treatment are not clearly specified. Use a single named entrant and clarify these points if they become relevant. [L1 pp. 1, 4]

## 3. Strategy for a competitive entry

**Selected scope:** Signal Rescue supports exactly two players in one cooperative mode. Larger groups are outside the initial release; the mission minimum does not require them. Target a short replayable session and rules understandable within 60 seconds. These are scope choices, not official duration requirements. See `docs/player-count-compliance.md` for the source audit.

Prefer mechanics that work through on-screen information and player choices. Avoid relying on everyone sharing a room or joining a separate voice call. Exclude accounts, payments, matchmaking, persistent progression, 3D worlds, real-time physics, and runtime AI generation from the initial scope. Any exception must justify its effect on fun, effort, reliability, and cost.

There is no established requirement to call an AI API during play, publish the source repository, submit a video, or generate every line of code with AI. Preserve a truthful AI collaboration record without presenting it as a required submission field. Optional demonstration material must not substitute for the live game.

| Judging category | Planned evidence | Internal target |
| --- | --- | --- |
| Execution, 25% | Complete public multiplayer sessions, reliable scoring, room isolation, recovery behavior, and reproducible build | Aim for the official level-5 description; no known release-blocking failures |
| Creativity, 25% | One distinctive interaction that changes player decisions; comparison against three relevant existing games | A concrete difference beyond theme, colors, or generated art |
| Usefulness / Value, 25% | Participant and at least one first-time friend complete multiple sessions; record enjoyment and voluntary replay | Baseline: the friend rates enjoyment at least 4/5 and voluntarily replays; optional expanded target: at least 4 of 6 testers rate enjoyment 4/5 or higher, with at least 3 replaying |
| Polish & Thoughtfulness, 25% | Clear onboarding, consistent visual language, accessible controls, and understandable error/recovery states | Baseline: the first-time friend joins and begins without spoken guidance; optional expanded target: at least 5 of 6 testers do so |

Treat these small-sample targets as directional product evidence, not statistical proof or predictors of winning. One friend's feedback offers particularly limited evidence; repeated sessions do not create additional independent testers. Record negative feedback as well as positive feedback. A self-score of 4.5/5 is a useful internal stretch target, never an official qualification threshold.

## 4. Recommended models and reasoning settings

These are development-assistant recommendations, not models the game must call at runtime. Official documentation positions GPT-6.1 Sol for complex work with cost/time considerations and Astra for demanding analysis. Exact stage assignments below are project judgments. Availability depends on the account, client, and workspace. [M1-M3]

Use explicit model IDs: **Sol = `gpt-6.1-sol`**, **Astra = `gpt-6-astra`**. Do not assume that a generic "Sol" preset selects the same model version. Medium means `medium`; Extra High means `xhigh`. Both models document these efforts. [M2-M3]

| Work stage | Default recommendation | Escalation or review | Reason for this assignment |
| --- | --- | --- | --- |
| 0. Requirements and eligibility checklist | GPT-6.1 Sol / Medium | GPT-6 Astra / Medium for conflicting text | Most work is source mapping; ambiguous terms need careful review and sometimes organizer clarification |
| 1. Concept selection and rules | GPT-6 Astra / Medium | Astra / Extra High for unresolved tradeoffs | Originality, player incentives, and scope need considered judgment |
| 2. Architecture and deployment proof | GPT-6.1 Sol / High | Astra / Extra High for race conditions or an unresolved platform constraint | Resolve state ownership and production behavior early |
| 3. Core implementation | GPT-6.1 Sol / Medium | Sol / High, then Astra / Medium for a reproduced difficult defect | Keep routine development efficient and escalate based on evidence |
| 4. Interface and onboarding | GPT-6.1 Sol / Medium | Sol / Extra High for a cohesive final design review | Iterative browser feedback matters more than a longer first draft |
| 5. Playtesting and balance | GPT-6.1 Sol / Medium | Astra / Medium to analyze conflicting player feedback | Models help interpret observations; human play is the test |
| 6. Reliability and release audit | GPT-6.1 Sol / High | Astra / Extra High for a fresh review of actual code and failure evidence | Highest scrutiny belongs on scoring, isolation, reconnection, and release blockers |
| 7. Submission materials | GPT-6.1 Sol / Medium | Astra / Low for concise English copy | Keep claims precise and supported by the final build |
| 8. Post-submission operations | GPT-6.1 Sol / Medium | Sol / High for an incident | Small, reversible maintenance with a known-good release |

Workflow rules:

- Start each task with inputs, scope, acceptance criteria, and a verification method.
- After two unsuccessful fixes to the same reproduced defect, stop patching blindly. Gather logs and a minimal reproduction, then escalate model/effort or simplify the design.
- Use Astra for high-impact decisions and bounded audits rather than automatically for every small edit. No fixed budget saving or accuracy percentage is assumed.
- A second model's agreement is not validation. Run the relevant test or check the cited source.
- Preserve model/version, important design decisions, and meaningful human corrections in `docs/ai-work-log.md`. Store concise English summaries, not secrets or unnecessary full chat dumps.
- Model changes are recommendations for the user to select when needed. This plan does not change the active model, create agents, or claim that a different model has reviewed it.

## 5. Schedule and effort budget

**Revised planning assumption:** approximately 21-30 hours of participant involvement between October 6 and October 28, with roughly one hour daily and longer sessions only as needed. October 6-28 contains 23 calendar days. Assistant execution and waiting time are separate from this participant budget; the former 50-65 hour estimate is no longer a required participant commitment. This lean estimate requires one small mode and a strong two-player experience, and must be revised after concept selection and the Azure deployment proof. It is not a promise of total implementation time. The mission's advertised 45 minutes is not treated as an estimate for a polished contest entry.

| Stage | Target dates, America/Chicago | Focused effort | Dependency | Exit gate |
| --- | --- | --- | --- | --- |
| 0. Entry readiness | Oct 6-7 | 1-2 h | Participant information | Remaining eligibility/account/workflow issues resolved or tracked |
| 1. Concept and rules | Oct 7-8 | 2-3 h | Initial readiness | One approved concept and complete rules |
| 2. Azure deployment proof | Oct 9-11 | 3-4 h | Concept | Two real devices complete a minimal public session |
| 3. Complete game loop | Oct 12-19 | 6-8 h | Deployment proof | Full playable two-player game with correct scores and restart |
| 4. Interface and onboarding | Oct 20-23 | 3-4 h | Core loop | Interface and written rules ready for unassisted first-time use |
| 5. Human playtests | Around Oct 25-26 | 2-3 h | Playable polished build | Participant and at least one friend play; findings and changes recorded |
| 6. Release hardening | Preliminary Oct 23-24; final Oct 26-27 | 2-3 h | Core build, then human feedback | Release matrix passes; rollback verified |
| 7. Submission | Materials Oct 24-27; submit Oct 28 | 2-3 h | Release candidate | Valid mission submission and saved receipt |
| 8. Availability and follow-up | Oct 29-Nov 29 | Separate maintenance allowance | Submission | Game stays accessible through the planned review window |

The rows are effort allocations, not hours required on every listed day. Preliminary hardening and draft submission materials overlap other work; final hardening depends on human feedback. Routine technical checks occur throughout development, including the early phone/computer deployment check. Structured gameplay testing with the friend begins around October 25 as requested.

If available effort falls below the estimate, cut optional features first. Preserve public multiplayer, clear rules, a complete scoring loop, stability, and valid submission. If the public proof is not working by October 11, simplify the mechanic or Azure service design before proceeding. If behind schedule after October 19, freeze new mechanics and retain a smaller tested player range. Have a complete candidate ready by October 24 so October 25-27 can be used for feedback and repairs. Prepare the cover/description early rather than leaving all submission work until October 28.

## 6. Stage-by-stage TODO list

Checkboxes represent work status. A checked task may mean that a participant statement has been recorded; it does not imply independent verification of that statement. Other tasks become complete only when their stated evidence exists. **Owner** identifies human participation that AI cannot replace.

### Stage 0 - Confirm entry readiness

**Model:** GPT-6.1 Sol / Medium. **Owner:** participant for personal/account facts; assistant for source checking.

- [x] Record the participant's reported age eligibility, US legal residence, and planned US location at submission.
- [ ] Check any remaining eligibility conditions, including applicable age of majority and excluded-party status.
- [x] Record participant-reported access to the Handshake mission and ChatGPT.
- [ ] Confirm access to the linked email. Do not store identity documents in this project.
- [ ] Confirm ChatGPT Work access and the planned use of Work/Codex; resolve a Codex-only approach with the organizer if necessary.
- [ ] Locate the referenced Code of Conduct and record its source, or document the unresolved request in `docs/decisions.md`.
- [x] Record daily availability, Azure student credit as the hosting budget, phone/computer availability, and at least one potential friend tester.
- [ ] Confirm Azure subscription status, actual remaining credit, expiry, and deployable services. Additional out-of-pocket spending remains unapproved.
- [ ] Review submission/publicity terms and available rights for planned third-party material.
- [x] Record non-sensitive participant statements and constraints in `docs/decisions.md`.

**Exit evidence:** a dated readiness checklist. An unresolved qualification issue remains visible; do not mark the entrant eligible based on assumptions.

### Stage 1 - Select the concept and write complete rules

**Model:** GPT-6 Astra / Medium. **Owner:** participant chooses the concept; assistant develops options and specification.

- [x] Propose three compact concepts with audience, decisions, distinctive mechanic, two-player behavior, scope, and risks in `docs/game-concepts.md`.
- [x] Compare three existing games using publisher/developer pages and record differences without claiming absolute originality.
- [x] Compare the concepts against all four judging categories and estimated participant effort.
- [x] Record participant selection of B - Signal Rescue; detailed rules remain provisional.
- [ ] Write `docs/game-design.md`: goal, inputs, phases, scoring, ties, end condition, replay, player limits, and examples.
- [ ] Define late joins, absent players, invalid actions, disconnected players, and host departure. Prefer a clear small rule over a complicated feature.
- [ ] Identify public versus private player information. Decide how remote players coordinate without an external voice call.
- [ ] Set explicit must-have and cut-first lists. Design a short paper/prototype playthrough to catch unfun or contradictory rules before coding.

**Exit evidence:** approved rules and a worked example with manually calculated scores. Every phase has a defined next step and end condition.

### Stage 2 - Prove architecture and real deployment

**Model:** GPT-6.1 Sol / High; Astra / Extra High only for unresolved architectural risks.

- [ ] Inspect available development tools, choose supported runtime/package versions, and record them. Initialize version control and ignore secrets, dependencies, and transient outputs when implementation begins.
- [ ] Choose an Azure service/deployment route from Section 7 after checking subscription access, actual limits, and projected credit usage through the review window. Record the decision in `docs/architecture.md`.
- [ ] Build the smallest vertical slice: create room, join from another device, submit one action, synchronize one shared result, and start again.
- [ ] Give the server authority over state transitions and scores. Client-side displays must not decide who won.
- [ ] Implement unguessable player session tokens separately from shareable room codes; authorize actions by membership and role.
- [ ] Define a room state machine, versioning, duplicate-action handling, timeout policy, room cleanup, and reconnection behavior.
- [ ] Deploy the slice to a durable HTTPS URL and test a phone on cellular data against a laptop on a different network.
- [ ] Verify backend/function calls actually work in production, then repeat after an idle period and a redeploy.
- [ ] Measure observed join time, update delay, and hosting usage. Confirm that the intended game pace is achievable.
- [ ] Save the URL, build identifier, device/network details, and outcome in `docs/test-evidence.md`.

**Exit evidence:** a real public two-device session. A screenshot of the homepage or a successful frontend build is insufficient.

### Stage 3 - Implement a complete game

**Model:** GPT-6.1 Sol / Medium; High for networking or scoring defects.

- [ ] Implement lobby, readiness/start rules, all game phases, scoring, ties, results, and replay using the approved specification.
- [ ] Add meaningful tests for scoring, legal/illegal state transitions, concurrent actions, and duplicate submissions.
- [ ] Test room isolation, authorization, private-state filtering, and server-side validation with deliberately invalid requests.
- [ ] Add timeouts so a silent or disconnected player cannot stall every other player indefinitely.
- [ ] Implement the documented host-leaving and session-recovery policy. Handle server restarts with either tested recovery or an explicit safe restart path.
- [ ] Verify the minimum and intended maximum player counts; reduce the advertised range if the maximum cannot be supported reliably.
- [ ] Keep dependency versions locked, validate production builds, and retain a known-good version after each milestone.

**Exit evidence:** three complete consecutive multiplayer sessions on the deployed build with correct scores and no blocking issue. This is an early milestone, not the final release sample.

### Stage 4 - Make the experience clear and distinctive

**Model:** GPT-6.1 Sol / Medium; Sol / Extra High for final visual consistency review.

- [ ] Select one coherent visual direction that reinforces the mechanic and remains readable on small screens.
- [ ] Write short English rules, a concrete example, and in-context instructions for each phase.
- [ ] Make room sharing, current phase, pending players, scores, results, and replay easy to find.
- [ ] Show useful feedback for invalid codes, full rooms, late joins, lost connections, and expired rooms.
- [ ] Check phone and desktop layouts; prevent clipped actions and horizontal scrolling in normal play.
- [ ] Support keyboard operation, visible focus, readable contrast, non-color-only status, and reduced motion where animation is used.
- [ ] Make sound optional and provide a visible mute control if audio exists.
- [ ] Record licenses/provenance for fonts, images, music, and copied libraries in `docs/asset-register.md`. Store only required runtime assets in `game/`.

**Exit evidence:** observed first-time use without spoken instruction, with screenshots and specific issues recorded. Visual polish must not obscure game state.

### Stage 5 - Test with people and improve the fun

**Model:** GPT-6.1 Sol / Medium; Astra / Medium for interpretation. **Owner:** participant recruits testers; humans play.

- [ ] Arrange structured human playtests around October 25-26 with the participant and at least one first-time friend. Run at least two sessions and get consent for any recording.
- [ ] Test two-player gameplay across different devices and networks. Test a larger group only if it is part of the advertised player range; automated clients can test capacity, while human fun remains a separate coverage gap if no larger group is available.
- [ ] Observe the initial attempt without teaching the rules. Measure understanding, joining friction, completion, and replay interest.
- [ ] Ask what decision felt interesting, what was confusing, and whether the tester wanted another round. Record exact sample size and failures.
- [ ] Compare observations with the internal targets in Section 3; do not substitute AI personas or simulated browser clients for human enjoyment feedback.
- [ ] Prioritize the three most frequent or severe problems, make small changes, and retest the affected behavior.
- [ ] Record findings and resulting changes in `docs/playtest-report.md`.
- [ ] Freeze the core mechanic after this stage unless a fundamental failure requires a smaller design.

**Exit evidence:** real observations, one completed iteration, and either achievement of the internal experience targets or a documented reason for accepting the remaining gap.

### Stage 6 - Harden and audit the release

**Model:** GPT-6.1 Sol / High; recommended final code audit with GPT-6 Astra / Extra High if available.

- [ ] Run the full verification matrix in Section 8 against the release candidate.
- [ ] Fix every release-blocking defect: inability to join/play/finish, incorrect scoring, cross-room leakage, exploitable unauthorized actions, or unavailable public URL.
- [ ] Verify server-side limits for action rate, input length, room capacity, and room lifetime; check that no private key or service credential reaches the browser or repository.
- [ ] Test concurrent rooms and measure resource usage. Confirm that one room cannot change another room's scores or phases.
- [ ] Test hosting idle behavior, restart/redeploy behavior, and the recovery messaging players actually see.
- [ ] Rebuild from a clean checkout using documented commands. Run the tests that correspond to the supported features.
- [ ] Practice reverting to the known-good release and confirm the stable URL still works afterward.
- [ ] Conduct a separate review pass using the rubric, real code, and test evidence. Record findings, not merely an approval statement.
- [ ] Save the version/commit, deployment identifier, known limitations, and review results in `docs/release-checklist.md`.

**Exit evidence:** no open release blockers, completed release matrix, and reproducible deployment. Minor issues may remain only if they do not invalidate requirements or materially harm play.

### Stage 7 - Prepare and submit the entry

**Model:** GPT-6.1 Sol / Medium; optional Astra / Low copy edit. **Owner:** participant supplies accurate entry details and completes required attestations.

- [ ] Recheck official rules, deadline, task instructions, and the actual submission form for changes.
- [ ] Prepare an English title, actual gameplay cover image, accurate description, and stable public URL in `docs/submission.md`.
- [ ] Explain the player experience, distinctive mechanic, supported player range, and how ChatGPT helped. Do not claim untested features or guaranteed uptime.
- [ ] Prepare an optional short demonstration only if useful and accepted; it must show real multiplayer behavior, not replace access to the game.
- [ ] Verify the game in a signed-out/private browser and on two separate devices. Confirm no creator account, app installation, or hosting password is required for players.
- [ ] Confirm the deployed build matches the cover image and description; remove development-only controls from the public experience.
- [ ] Complete the mission's Build step and submit through its Submit Project flow using a desktop browser. Include the cover image even if the generic UI labels it optional.
- [ ] Review the actual form's Showcase choice and contest terms; do not mistake a separate Showcase submission for the mission entry.
- [ ] Submit by October 28 at 6:00 PM America/Chicago and save the confirmation, timestamp, submitted URL, and release identifier in `docs/submission-receipt.md`.
- [ ] Check that the submission is visible/confirmed rather than only saved as a draft. Redact personal account details from any shared evidence.

**Exit evidence:** confirmed submission receipt and an independently accessible deployed game. Do not automatically submit duplicate entries as a troubleshooting tactic.

### Stage 8 - Keep the game available and handle results

**Model:** GPT-6.1 Sol / Medium. **Owner:** participant for account, billing, and prize communication.

- [ ] Keep the URL, backend, and required storage available through at least November 29, 2026, extending if the organizer's review continues. This is our operating target, not an explicit hosting-duration clause.
- [ ] Check availability, usage limits, and email regularly; frequency should reflect actual hosting risk. Automated monitoring is a future option, not configured by this document.
- [ ] Preserve the submitted release. Avoid changing the game materially after entry without checking the organizer's update policy.
- [ ] For necessary fixes, save a before/after record and rerun the affected tests plus one full public session.
- [ ] Respond to legitimate winner notices and required documentation promptly; keep identity and tax information out of the public project.

**Exit evidence:** accessible game during review and completed follow-up. Prize selection remains the organizer's decision.

## 7. Technical feasibility and hosting decision

**Selected provider: Azure.** Provisional implementation: a compact TypeScript browser game with server-authoritative state. The exact framework and Azure service remain a Stage 2 decision. A framework preference must not delay a public proof. Non-Azure providers are prior research only and are not the current deployment plan.

| Route | Suitable use | Constraint to prove before committing |
| --- | --- | --- |
| Azure Container Apps + a small Node service | HTTP/WebSocket multiplayer in one deployed service | Student subscription permissions, region, container deployment, scale/cold start, room-state handling, and measured cost |
| Azure App Service + a small Node service | Conventional web-service deployment | Chosen tier's actual CPU/connection limits, idle behavior, supported features, and credit cost; do not assume Free is suitable |
| Azure static frontend + Functions + shared storage | Discrete turns where measured polling is acceptable | Functions/storage permissions, conflict-safe updates, request volume, latency, and combined cost |

Azure for Students describes USD 100 credit usable within 12 months. The participant's actual balance and expiry are account-specific; inspect them before provisioning. Exhausted or expired student credit can disable the subscription. Do not upgrade to pay-as-you-go or authorize additional charges as part of this planning update. [A1-A2]

Container Apps ingress supports WebSockets, and Consumption billing has free allowances. This supports investigating the route, not promising free operation: replicas, compute, storage, logging, and other resources can affect actual usage. Choose scale-to-zero versus a warm minimum only after checking the budget and cold-start behavior. With multiple replicas, in-memory room state alone is insufficient; use shared state or a tested single-replica design with an explicit restart policy. [A4-A5]

App Service Free/Shared plans have shared compute quotas. Verify the exact chosen tier rather than assuming an always-running server. Check HTTPS, connections, idle behavior, and resource limits in the actual subscription. [A3]

**Proposed spending policy, not an approved allocation:** estimate the total through November 29 including compute, persistent storage, logs, and network usage; retain at least 25% of the verified remaining credit as contingency. Set alerts where supported and review credit usage after the public proof and again before submission. Budget alerts alone do not impose a hard spending cap.

The following Netlify/Render observations remain background research for a fallback only; changing provider would be a new decision.

**Netlify-specific verification:** current documentation describes both ordinary manual deployments without a build and a logged-in Drop flow that can detect and build source projects. Do not treat every upload flow as equivalent. The exact account/flow must successfully deploy frontend and functions. Prefer a repeatable documented CLI or Git deployment if packaging is uncertain. A folder of static files alone does not provide shared game state. [H1-H2]

Netlify Blobs documents strong reads and conditional writes, but the application still needs to handle conflicts, retries, and duplicate actions. Strong reads alone do not make a read-modify-write sequence atomic. For this route, keep a room's authoritative state in one versioned record, use conditional writes, and test simultaneous submissions. If that proof fails, select storage with suitable transactions instead. [H3]

**Request-budget example, not a provider quota:** six players polling every second generate about 360 reads per minute per room; ten such rooms generate about 3,600. Add action writes and retries, measure the actual implementation, and check the chosen account's current billing/limits before deciding whether this is acceptable.

Render documents idle spin-down for free web services after 15 minutes without incoming traffic and roughly one minute to wake; local files are ephemeral. WebSocket connections can also be interrupted during maintenance or deployment. If using this route, measure the cold start and implement reconnection/state handling. Do not assume a free process or its in-memory rooms remain available indefinitely. [H4-H5]

Choose polling only for a mechanic that tolerates its measured delay. Do not score sub-second reaction speed through slow polling. If timing matters, define a server clock and an explicit fairness policy.

## 8. Verification matrix and evidence standard

All thresholds here are **project targets**, not official contest requirements. Tune them after the first deployed measurements while preserving the official requirements. Record the build, environment, expected behavior, observed result, and any linked defect. "Not tested" is a valid status; it is not a pass.

| Area | Test | Required project outcome |
| --- | --- | --- |
| Entry access | Participant checks age/residence/account/mission access | Explicit confirmation or documented unresolved issue |
| Public access | Signed-out browser, phone on cellular, laptop on another network | Both devices can join and complete the same game |
| Browser coverage | Current Chrome and Edge desktop; Safari iPhone and Chrome Android where devices are available | Supported combinations work; unavailable hardware is listed as a coverage gap |
| Player counts | Minimum, maximum advertised, too many players, and too few to start | Valid sizes work; invalid sizes receive clear feedback |
| Main loop | Ten complete deployed sessions across minimum/larger groups and at least two device/network combinations | No blocking failure or incorrect final score; early milestone sessions may count if on the unchanged candidate |
| Concurrent rooms | At least three separate rooms running concurrently | Independent state, scores, and participants |
| Concurrency | Near-simultaneous actions and intentionally repeated requests | No lost accepted action, duplicate scoring, or invalid phase advancement |
| Connection loss | Refresh, temporary disconnection, phone backgrounding, host exit | Documented recovery or clear safe exit/restart; no silent indefinite stall |
| Lifecycle | Idle expiration, restart, and redeploy | Correct cleanup and documented behavior; no stale token attached to a different room |
| Information boundaries | Inspect payloads and attempt unauthorized actions | No other player's private state, unauthorized host action, or cross-room access |
| Latency | Sample at least 30 updates on the target deployment/network setup | Proposed target: at least 95% visible within 1.5 seconds for a round-based game; record actual values |
| Onboarding | At least one first-time friend with no spoken instruction; optionally expand to six testers | Section 3 baseline/expanded targets assessed honestly, with the true sample size recorded |
| Accessibility | Keyboard, focus, small screen, contrast, reduced motion | Core actions remain understandable and usable |
| Hosting | Idle/cold start, usage observation, account limit check | No unresolved availability or budget issue that would block judging |
| Release | Clean build, relevant tests, public smoke test, rollback | A reproducible known-good release |
| Submission | Review title, image, description, URL, and confirmation | Complete entry with timestamp and receipt |

Automated multi-browser tests help find state bugs but do not prove separate physical devices or human enjoyment. Repeat affected checks after meaningful changes; rerun the complete release smoke test after the final deployment. Avoid repeatedly rerunning unchanged tests without a reason.

## 9. Risks, missing inputs, and fallback decisions

| Risk or missing input | Why it matters | Action / fallback | Owner |
| --- | --- | --- | --- |
| Remaining eligibility details | Age, US residence/location, and mission access are participant-reported; exclusions and other conditions remain | Resolve the remaining Stage 0 checks without mislabeling statements as independent verification | Participant |
| Daily time and short feedback window | Approximately one hour daily; friend testing starts around Oct 25 | Use the 21-30 h participant plan, one small mode, and a complete candidate by Oct 24 | Participant + assistant |
| Azure balance, expiry, and service access | USD 100 student credit is reported, but actual remaining resources are unverified | Check the portal, estimate through review, preserve contingency, and avoid unapproved cash spending | Participant |
| Codex-only acceptability unclear | Mission explicitly names Work | Use Work as instructed or obtain clarification | Participant |
| Deployment works only locally | Multiplayer cannot be evaluated publicly | Require the Stage 2 public proof before full implementation | Assistant + participant |
| Generic concept | Creativity is one quarter of the score | Compare concepts and validate one distinctive player interaction | Participant + assistant |
| Over-scoping | Extra modes can consume the testing buffer | One mode; cut optional content/player capacity before core reliability | Participant + assistant |
| Small playtest sample | Phone/computer and at least one potential friend are available; broader human coverage is not assured | Prioritize strong two-player play, repeat sessions, and document larger-group/browser gaps honestly | Participant |
| Backend conflicts or cheating | Scores and hidden information become unreliable | Server authority, validated actions, versioned updates, isolation tests | Assistant |
| Unsafe public input or rights issues | Names/content may be abusive; assets may not be reusable | Bound and escape input; minimize free text; keep licensed/original assets with provenance | Assistant + participant |
| Submission unclear or incomplete | Public deployment alone does not enter the contest | Submit early and retain explicit confirmation | Participant |
| Late outage or regression | Judges may encounter a broken game | Stable URL, retained release, tested rollback, operations budget | Participant + assistant |

**Cut-first order:** additional themes -> sound effects -> extra content -> extra modes -> player capacity above the tested minimum. Never cut genuine cross-device play, correct scoring, readable rules, public availability, or submission completeness.

## 10. Verification record for this plan

The records below describe earlier planning revisions. Checkbox counts are historical snapshots, not counts for the current edited document. The subsequent Signal Rescue assessment is in [feasibility-analysis.md](feasibility-analysis.md).

These checks concern this planning document only. They do not certify an unbuilt game, establish personal eligibility, or imply any playtest has occurred.

| Pass | Method | Finding / status |
| --- | --- | --- |
| 1. Source audit | Re-read the seven-page local rules and both mission documents; check the official mission, linked rules, and submission help | Confirmed the contest baseline; retained the deadline and cover-image conflicts explicitly |
| 2. Technical and model audit | Open current official model pages and deployment/storage documentation | Model IDs/efforts supported; platform availability still account-dependent; hosting requires an early proof |
| 3. Schedule and dependency audit | Calculate deadline conversions with timezone data; review phase dependencies and effort totals | Formal deadline conversions verified. Revised participant effort totals 21-30 h; structured playtests around Oct 25-26, final fixes Oct 26-27, submission Oct 28 |
| 4. Document integrity audit | Check English-only text, task structure, source references, linked local inputs, and evidence for checked tasks | Revised-file checks passed: English/ASCII text, consistent tables, all three local references resolve, 75 open actions and four completed recording tasks, 21-30 h effort total, and no obsolete Oct 19-21 playtest schedule |
| 5. Participant update and Azure audit | Compare participant constraints with the revised schedule and open Microsoft documentation | Azure selected; student credit is finite; exact subscription balance, expiry, service access, and deployment are still unverified |

The review passes were performed within this chat, not by independent reviewers or multiple models. The recommended future Astra audit has not happened. Remaining uncertainties are intentionally recorded instead of being presented as verified facts.

## 11. Sources and authority

All web sources below were accessed on October 6, 2026. Formal contest rules govern our eligibility/submission interpretation; generic help pages describe platform behavior. Hosting/model documentation supports technical recommendations, not prize eligibility. Recheck time-sensitive facts before implementation or submission.

### Local source documents

- **L1:** [Contest Official Rules](../info/%5BAI_Skills_Studio_Challenge%5D_Contest_Official_Rules.pdf). Page 1: eligibility, deadline, entry fields. Pages 2-3: scoring, selection, prizes. Pages 3-5: rights, conduct, liability, disputes. Pages 5-7: eligible locations.
- **L2:** [Mission introduction](../info/start.doc). Purpose, Work requirement, room-code experience, marketing deadline.
- **L3:** [Build guide](../info/create.doc). Minimum game requirements, sample scope, testing loop, and suggested deployment routes.

### Official contest and platform sources

- **W1:** [Online contest rules](https://go.joinhandshake.com/rs/390-ZTF-353/images/%5BAI_Skills_Studio_Challenge%5D_Contest_Official_Rules.pdf?version=0).
- **W2:** [Create a Multiplayer Game](https://joinhandshake.com/learn/create-a-multiplayer-game-8d7d59b5/).
- **W3:** [Submit Your Project from a Mission](https://support.joinhandshake.com/hc/en-us/articles/43389244796823-Submit-Your-Project-from-a-Mission).

### Official model sources

- **M1:** [Model selection](https://learn.chatgpt.com/docs/model-selection). General workload and reasoning guidance; the stage assignments in this plan are our recommendations.
- **M2:** [GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol). Exact model identifier and supported reasoning efforts; API pricing is not a quote for a ChatGPT subscription.
- **M3:** [GPT-6 Astra](https://developers.openai.com/api/docs/models/gpt-6-astra). Exact model identifier and supported reasoning efforts.

### Official hosting sources

- **H1:** [Netlify: Create deploys](https://docs.netlify.com/deploy/create-deploys/). Different manual/Drop flows require checking the exact deployment path.
- **H2:** [Netlify CLI](https://docs.netlify.com/api-and-cli-guides/cli-guides/get-started-with-cli/). Function deployment and publish-directory handling.
- **H3:** [Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/). Consistency and conditional-write facilities.
- **H4:** [Render free services](https://render.com/docs/free). Idle behavior and ephemeral filesystem limitations.
- **H5:** [WebSockets on Render](https://render.com/docs/websocket). Connection interruptions and session-state handling.

### Official Azure sources checked for the participant update

- **A1:** [Azure for Students](https://azure.microsoft.com/en-us/free/students/). Student credit and service allowances; actual account benefits require verification.
- **A2:** [Disabled Azure for Students subscriptions](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/azurestudents-subscription-disabled). Credit exhaustion and expiry.
- **A3:** [Azure App Service hosting plans](https://learn.microsoft.com/en-us/azure/app-service/overview-hosting-plans). Tier and compute constraints.
- **A4:** [Azure Container Apps ingress](https://learn.microsoft.com/en-us/azure/container-apps/ingress-overview). HTTP/WebSocket support.
- **A5:** [Azure Container Apps billing](https://learn.microsoft.com/en-us/azure/container-apps/billing). Consumption allowances and billing considerations.

## 12. Immediate next actions

- [ ] Resolve the remaining Stage 0 checks; age/residence/location, mission/ChatGPT access, daily availability, Azure preference, and devices/friend access have already been recorded.
- [x] Develop and compare three concepts; participant selected B - Signal Rescue.
- [ ] Complete GP-01 gameplay research and review the proposed English game rules before establishing the design baseline.
- [ ] Build and deploy the smallest two-device proof before expanding the game.
