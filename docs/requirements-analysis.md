# Signal Rescue - Requirements Analysis and Lightweight SRS

Document version: 1.1
Date: October 6, 2026
Status: Draft requirements baseline derived from existing project records. No new gameplay choice, cloud expenditure, prototype construction, or release approval is implied.
Owner: Project participant, supported by the development assistant.

## 1. Purpose and reading guide

Define what the users and project owner need before choosing implementation details. This document consolidates stakeholder needs, functional and non-functional requirements, constraints, scenarios, user stories, use cases, acceptance criteria, and traceability.

Read Sections 2-4 for purpose and scope, 5-7 for system requirements, 8-10 for user behavior, and 11-13 for decisions, verification, and the next implementation boundary.

This is a practical SRS for a small project, not a claim of compliance with a particular requirements-document standard. The game is not implemented. Existing Python results cover the audited 0.2 research model, not a production system or the proposed joint-exit candidate.

### Requirement status and priority

| Label | Meaning |
| --- | --- |
| B - Backed | Supported by an explicit participant instruction, selected scope, or recorded mission requirement. Still not evidence of implementation or a formally approved SRS |
| D - Derived | Proposed to make the backed experience coherent, reliable, or testable; detail may change during design |
| O - Open | Unresolved parameter, policy, external dependency, or product decision |
| Must | Needed for the intended initial release or entry; not an ordering of all development tasks |
| Should | Important experience/quality work that may be simplified without breaking the core promise |
| Could | Optional enhancement, excluded unless explicitly selected |

"Shall" specifies intended required behavior in this draft. B/D labels identify its basis; they do not imply the software already behaves that way. A proposed numeric target is explicitly identified and must not silently become an official contest condition.

### Sources and authority

| Source | What it establishes |
| --- | --- |
| [Project brief](project-brief.md) | Selected B concept, scope, SR-01 through SR-10, product success measures |
| [Decisions](decisions.md) | Participant constraints, authorization history, prototype deferral, future Git sync request |
| [Competition plan](competition-plan.md) and supplied `info/` files | Recorded mission/contest requirements and source links; current eligibility and submission checks remain separate |
| [Player-count audit](player-count-compliance.md) | Exactly two players satisfies the recorded minimum; actual separate-device operation remains unproved |
| [Audited design 0.2](game-design.md) | Explicit research rules; not a frozen production baseline |
| [Second gameplay review](gameplay-second-review.md) | Disclosure, participation, confirmation, and replay risks |
| [Cooperation analysis](gameplay-cooperation-analysis.md) | Proposed J1 joint exit and one manually checked symmetric witness |
| [Short development cycle](short-development-cycle.md), [workflow](development-workflow.md), [tasks](tasks.md) | Implementation process, gates, dependencies, and progress |

This document owns the detailed requirement IDs and traceability. `project-brief.md` owns product scope and the SR parent IDs; the adopted `game-design.md` will own exact rules. `decisions.md` owns resolved choices and `tasks.md` owns status. When an adopted rule changes, update affected requirements and tests in the same work cycle. This document records existing contest research rather than claiming a fresh official-source verification.

## 2. What the user actually wants

### Project owner

Deliver an original, polished, reliable multiplayer browser game with the strongest feasible contest entry within the available time and Azure student credit. Use AI assistance effectively, keep project artifacts in English, follow a lightweight engineering process, and preserve work in Git with a useful GitHub README. Winning is an aspiration, not a requirement the system can guarantee or a measurable probability currently established.

The owner needs concrete progress and honest evidence. An analysis that only grows documentation without resolving the next implementable uncertainty does not meet that need.

### Players

Two friends, potentially in different locations, want to join quickly from their own devices, understand the game without the creator explaining it, and solve a short cooperative challenge. Each should be able to understand how their information or movement helps the other. Mistakes and waiting should have understandable consequences. An external voice call should be optional, not necessary.

These are intended needs, not interview results from recruited players. The participant and at least one first-time friend are the available baseline test group. Exact devices, accessibility needs, genre preferences, and broader audience appeal remain unresearched.

### Evaluators and operator

An evaluator needs a stable public URL, clear entry materials, and an experience that works without creator intervention. The operator needs reproducible deployment, visible failures, affordable operation, and a recoverable release checkpoint. Neither role needs a large administrative dashboard for this initial game.

### Outcome measures

| Outcome | Evidence sought | Current state |
| --- | --- | --- |
| Real remote cooperation | Two humans complete the same public session on separate devices/networks | Not tested |
| Understandable first use | First-time friend joins and begins without spoken teaching | Not tested |
| Useful partner contribution | Each can describe at least one decision changed by the other's information or action | Paper examples only |
| Understandable failure | Player-facing explanation matches the actual resolved rule and reveals only allowed information | Written behavior and limited research tests |
| Enjoyment and replay interest | Actual friend feedback, including negative responses and voluntary retry/another mission | Not tested |
| Controlled delivery | Candidate, regression checks, entry materials, and submission confirmation meet agreed milestones | Planning only |

One friend's feedback is directional evidence, not statistical proof. Both a working protocol and an enjoyable interaction matter; neither substitutes for the other.

## 3. Stakeholders, actors, and system boundary

| Actor | Responsibilities and needs |
| --- | --- |
| Player A / Player B | Join a seat, inspect allowed views, guide the partner, choose moves, confirm, interpret results, replay or leave |
| Room creator | Share the room code and start the ready pair; this setup role does not confer access to both private maps |
| Returning player | Restore their own seat after a temporary connection loss without taking another player's seat |
| Project owner | Make product/budget choices, supply account access, participate in tests, handle personal attestations and submission |
| Development assistant | Produce requirements/design/code/checks, preserve evidence and Git checkpoints, report limits |
| Operator | Deploy and maintain the selected build within the verified budget; can be the project owner |
| Evaluator | Reach the public game and understand how to play; may need a second human for the intended experience |

Inside the game boundary: browser UI, room/session management, authoritative rules/state, filtered player views, synchronization, mission results, retry, and interruption behavior.

Outside it: Handshake entry forms, ChatGPT/AI development tools, GitHub repository management, Azure subscription billing, optional voice calls, recruitment, and identity/eligibility attestations. The game shall not implement player accounts, contest administration, payments, or runtime AI merely because those external systems exist.

## 4. Scope, assumptions, and exclusions

### Initial release scope

- Exactly two human players per session, one cooperative mode, a small authored mission set.
- Public browser access, room-code joining, no player login or app installation.
- Appropriate private hazard information, helpful signaling, public movement planning, consistent results, and retry.
- Onboarding and controls usable on the owner's phone and computer, with target browsers recorded during validation.
- Azure-hosted release with deployment, rollback/reset, cost, and availability evidence.
- Required entry materials and truthful AI collaboration/project records outside the runtime application.

### Existing evidence and assumptions

The owner reports age 18 or above, US legal residence, intended US submission location, mission access, ChatGPT access, approximately one hour daily with flexibility, a phone/computer, and at least one friend. These statements support planning; account/eligibility/device verification is not complete.

Public internet access is assumed for players. A room creator can share a code by an external communication method; the game need not send emails or messages. The reported USD 100 student credit is not a verified remaining balance. Git is installed; a project-local repository and GitHub remote have not been established, and the participant confirmed that the GitHub repository has not been created.

### Exclusions

More than two players, matchmaking, player accounts, persistent progression, leaderboards, payments, user-created content, procedural generation, runtime AI, built-in voice chat, real-time physics, a large story campaign, and a full administrative UI are outside the initial scope. Polished art can follow the first validated interaction; it is not a prerequisite for the minimal prototype.

## 5. Functional requirements

Each row defines one primary obligation and an acceptance method. Tests are planned unless explicitly recorded as executed elsewhere.

| ID | Requirement | Priority / basis | Acceptance method | Parent |
| --- | --- | --- | --- | --- |
| FR-01 | The game shall be reachable at a public browser URL without a player account or app installation | Must / B | Open from a signed-out browser on phone and computer | SR-01, SR-08 |
| FR-02 | A player shall be able to create a room and obtain a shareable room code | Must / B | Create a room; use the code on another device | SR-01 |
| FR-03 | A second player shall be able to join an available room using its code | Must / B | Separate device joins the same room and is assigned the other role | SR-01 |
| FR-04 | The game shall start a mission only with exactly two admitted players and their explicit start agreement | Must / D | One-player start rejected; third seat rejected; two ready players start once | SR-01, SR-04 |
| FR-05 | The game shall communicate failed join attempts without exposing existing players' private state | Must / D | Invalid, full, closed, and expired room attempts give actionable feedback | SR-02, SR-08 |
| FR-06 | Each player shall receive only their authorized public state and private information | Must / B | Inspect both payloads; modify client requests; verify no unauthorized full hazard layer is delivered | SR-02 |
| FR-07 | Each player shall be able to send the partner truthful guidance under the selected signal policy | Must / B | Test valid clues, wrong-layer attempts, quota behavior, and closure behavior for the selected rules | SR-02, SR-03, SR-04 |
| FR-08 | The game shall distinguish learned own-layer safety information from unknown cells | Must / D | Received clue and hazard attempt update the correct layer; unknown cells never default to Safe | SR-02, SR-08 |
| FR-09 | A player shall be able to select a legal move or Wait for their robot | Must / B | Adjacent moves and Wait work; illegal destinations are rejected without resolving a turn | SR-04 |
| FR-10 | Both players shall be able to inspect the current joint movement proposal before confirming it | Must / D | The same public destination pair appears on both devices before resolution | SR-03, SR-05 |
| FR-11 | The game shall resolve a turn only after both players agree to the current accepted plan | Must / D | Changed plan invalidates stale agreement; duplicate/stale confirmation cannot resolve a turn | SR-04, SR-05 |
| FR-12 | The game shall resolve accepted actions once under the adopted rule version | Must / B | Test hazards, collisions, swaps, following, and terminal precedence; compare both client results | SR-04, SR-05 |
| FR-13 | The game shall expose the shared progress and each resolved turn's explanation | Must / D | Positions, selected progress indicators, and actual stop/movement reasons match authoritative state | SR-04, SR-08 |
| FR-14 | The game shall determine and display a terminal mission result under the selected completion/failure policy | Must / B | Success/failure examples and boundary cases produce the same terminal result on both devices | SR-04, SR-05 |
| FR-15 | If numerical scoring is adopted, the game shall compute and display it consistently with the selected scoring policy | Should / O | Success, failure, and unscored tutorial/abort cases match that policy; no stale score after retry | SR-04 |
| FR-16 | Players shall be able to restart a terminal mission through an agreed retry action | Must / B | Both choose Retry; new mission state resets required fields with no duplicate transition | SR-04, SR-05 |
| FR-17 | Continue and Retry choices shall not advance to contradictory sessions on different devices | Must / D | Conflicting choices remain pending until reconciled under the adopted transition policy | SR-05, SR-08 |
| FR-18 | Temporary disconnection shall invoke a defined pause, recovery, or termination policy | Must / B | Disconnect/reconnect and expiry tests match the selected contract without unattended harmful moves | SR-06 |
| FR-19 | A returning player shall be able to reclaim only their authorized seat during the allowed recovery window | Must / D | Reconnect own session; attempts to occupy the other seat or a different room are rejected | SR-02, SR-06 |
| FR-20 | Players shall receive an explicit session-ended message when lost room state cannot be recovered | Must / D | Restart/reset test reports loss and provides a valid path to a new session | SR-06, SR-08 |
| FR-21 | The game shall teach the selected objective, private information roles, actions, and result rules in its interface | Must / B | First-time friend can join and begin without spoken teaching; misunderstandings recorded | SR-03, SR-08 |
| FR-22 | Every published mission shall have a documented zero-strike route under the implemented rule version | Must / D | Validate each versioned mission; separately inspect the player's information trace | SR-07 |
| FR-23 | Authored content shall include at least one mission where partner information and coupled movement affect the solution process | Must / D | Paper decision trace followed by actual play observations; disjoint tutorial alone is insufficient | SR-03, SR-07 |
| FR-24 | A player shall be able to leave a session through an understandable flow that notifies the partner | Should / D | Leaving changes the room state consistently and explains whether play can resume or must restart | SR-06, SR-08 |

FR-22 is a proposed fairness standard stronger than merely 'some winning route exists.' Earlier counts of 18 failing layouts mean no zero-strike route within the old bound, not necessarily no winning route with permitted strikes. Do not label such maps impossible without the corresponding proof.

## 6. Non-functional requirements

| ID | Requirement | Priority / basis | Acceptance and limitation | Parent |
| --- | --- | --- | --- | --- |
| NFR-01 | Accepted authoritative state shall converge to the same public result on both connected clients | Must / B | Complete-session, retry, stale request, and resynchronization checks; transient pending UI may differ but must be labeled | SR-05 |
| NFR-02 | Private state and player actions shall be isolated by room and authorized seat | Must / B | Cross-room/seat requests and payload inspection; knowing a room code alone must not authorize control of an occupied seat | SR-02 |
| NFR-03 | Expected failures shall preserve a coherent outcome or terminate clearly instead of producing silent divergence | Must / B | Exercise disconnect, retry, room expiry, and lost-state paths on the actual build | SR-05, SR-06 |
| NFR-04 | Core controls and information shall be usable on the recorded target phone and computer | Must / B | Actual devices plus narrow/wide viewport checks; target OS/browser list is open | SR-08 |
| NFR-05 | Essential state shall not depend on color alone, and interactive controls shall have understandable labels | Must / D | Inspect Safe/Danger/Unknown, ready state, errors, and movement controls using text/symbols | SR-08 |
| NFR-06 | Core navigation and actions should support keyboard use and visible focus on desktop | Should / D | Complete a core flow with keyboard; record exceptions; no unverified accessibility-certification claim | SR-08 |
| NFR-07 | State updates should meet a measured responsiveness target on the supported deployment/network configuration | Should / O | Proposed target from the plan: at least 95% of at least 30 sampled updates visible within 1.5 seconds; method and environment recorded; not a universal network guarantee | SR-05, SR-09 |
| NFR-08 | The release shall support two human clients in a room; any advertised concurrency beyond that shall be measured before publication | Must / B | Two-device acceptance; room-isolation tests may use synthetic clients; total concurrent-room capacity remains open | SR-01, SR-09 |
| NFR-09 | Deployment shall fit a verified budget through the planned review window | Must / B | Record remaining credit, expiry, priced service configuration, contingency, and observed usage | SR-09 |
| NFR-10 | The release shall be reproducible from a named source checkpoint and documented configuration | Must / B | Rebuild/redeploy and rollback or safe reset from the recorded checkpoint | SR-09 |
| NFR-11 | Project secrets and personal eligibility documents shall stay outside tracked/public project artifacts | Must / B | Inspect intended tracked files and deployment configuration; do not embed credentials in README or client assets | SR-02, SR-09, SR-10 |
| NFR-12 | All authored project artifacts and product text shall be in English | Must / B | Review source, UI, documentation, asset text, and entry materials | SR-08, SR-10 |
| NFR-13 | The submitted public game shall remain available through the planned review window | Must / B | Operational checks and credit runway through at least November 29, subject to organizer changes; no unpriced uptime percentage promised | SR-09, SR-10 |
| NFR-14 | Rule changes shall be traceable to a versioned decision and relevant verification | Must / B | Record rule version, affected levels/tests, Git checkpoint, and known limitations | SR-04, SR-07, SR-09 |
| NFR-15 | The public service shall bound room and command resource use under documented admission and expiry limits | Must / D | Test configured room/command limits, bounded retries and expired-room cleanup; excess work receives controlled feedback rather than unbounded growth | SR-05, SR-06, SR-09 |
| NFR-16 | Public transport shall protect player-control credentials and private game payloads in transit | Must / D | Verify HTTPS and the secure form of the selected realtime transport; no public plaintext control/payload path or credentials in shareable URLs | SR-02, SR-09 |

Performance targets, capacity, supported browsers, and exact recovery timing must be confirmed before they are advertised. A turn cap does not bound elapsed play duration when planning time is unlimited.

## 7. Constraints and delivery requirements

| ID | Constraint / delivery requirement | Basis and consequence |
| --- | --- | --- |
| C-01 | Initial sessions have exactly two human players | Selected scope; no four/eight-player requirement inferred from tutorial examples |
| C-02 | Azure is the selected hosting provider | Service/region/runtime remain open; verified student credit is the funding constraint |
| C-03 | No additional cash spending or subscription upgrade is approved | Do not provision based solely on an assumed USD 100 balance |
| C-04 | Approximately one participant hour daily, flexible as needed; 21-30 hours is a planning envelope | Scope must fit; assistant execution/waiting time is separate; no total development-time guarantee |
| C-05 | Candidate by Oct 24; structured friend tests around Oct 25-26; repairs Oct 26-27; submission Oct 28 | Participant milestone intentions; exact friend availability still needs arrangement |
| C-06 | Formal deadline recorded as Oct 30, 2026, 11:59 PM PT | The competition plan maps this to Oct 31, 1:59 AM America/Chicago; recheck amendments before submission; Oct 28 remains the internal target |
| C-07 | Keep code/tests/runtime assets/configuration in `game/`, authored non-code work in `docs/`, supplied references in `info/` | Root README and Git configuration are repository-level artifacts |
| C-08 | Use the short development cycle with targeted checks and meaningful Git checkpoints | Participant requested sync during upcoming coding; remote sync awaits repository setup |
| C-09 | Prototype construction is currently deferred | This requirements task does not resume coding or freeze J1 |
| C-10 | Exactly one named entrant and the prescribed mission submission flow | Eligibility/account/Code of Conduct and tool-workflow uncertainties remain tracked; this SRS is not an eligibility determination |

| ID | Delivery requirement | Acceptance |
| --- | --- | --- |
| DR-01 | Prepare and submit the required project title, cover image, description, and working URL through the specified Handshake mission | Correct fields and explicit submission confirmation; a GitHub push alone does not enter the contest |
| DR-02 | Use an isolated project-local Git repository and commit verified work increments | Repository top level matches this project; meaningful checkpoint includes intended code/docs; no parent-repository changes |
| DR-03 | Push ordinary work increments to the participant's intended GitHub remote once it is created and configured | Confirm successful push and report commit/branch; local-only or failed sync remains explicitly labeled |
| DR-04 | Maintain an accurate root README with actual setup/check commands, state of implementation, and document links | Verify commands/links when they change; no invented playable URL, license, or completed feature claim |
| DR-05 | Preserve concise design/test/AI collaboration and release evidence | Trace artifacts to actual tools/builds; no claimed model review or human test without evidence |

Repository owner/name/visibility/license are not chosen by this document. No automatic background syncing, external messages, deployment, or contest submission is scheduled by these requirements.

## 8. User stories

| ID | User story | Acceptance / requirements |
| --- | --- | --- |
| US-01 | As a room creator, I want a simple code so my friend can join from another device | Create/share/join flow succeeds without a player account; FR-01 to FR-05 |
| US-02 | As a first-time player, I want clear rules and labels so I can start without the creator teaching me | Identify my robot, partner hazards, actions, and objective; FR-21, NFR-04 to NFR-06 |
| US-03 | As a navigator, I want to communicate useful safety information so my partner can make a justified move | Clue reaches the correct layer; no private-layer leak; FR-06 to FR-08 |
| US-04 | As a moving player, I want to see both intended destinations so we can agree who yields | Shared proposal visible before resolution; altered plan requires current agreement; FR-09 to FR-12 |
| US-05 | As a teammate, I want my action or information to affect our shared plan so cooperation has a purpose | Decision trace and real observations show useful contributions from both; FR-23, SR-03 |
| US-06 | As a player who makes a mistake, I want an explanation so I understand what happened and whether we can recover | Actual hazard/collision reason shown; result matches rules; FR-13, FR-14 |
| US-07 | As a disconnected player, I want a clear recovery path so I know whether I can return to my seat | Reconnect only my seat or receive explicit expiry/reset guidance; FR-18 to FR-20 |
| US-08 | As a pair, we want a fresh retry so we can practice without creating another room unnecessarily | Agreed retry resets mission state; disagreement cannot split sessions; FR-16, FR-17 |
| US-09 | As the owner, I want tested checkpoints and documented deployment so I can restore a known-good release | NFR-09, NFR-10, NFR-14, DR-02 to DR-05 |
| US-10 | As an evaluator, I want a working public game and truthful project description so I can assess the actual entry | FR-01, FR-21, NFR-13, DR-01, DR-04 |

These stories summarize needs, not additional mechanics. The exact goal/extraction behavior must be selected before writing its implementation acceptance cases.

## 9. Use cases and scenarios

### UC-01 - Create and join a remote session

Actors: Room creator and invited player.
Preconditions: Public game is reachable; the room service is running.
Trigger: Creator selects Create Room.

1. System creates a room, assigns the creator a seat, and displays the room code and waiting state.
2. Creator shares the code through their chosen external channel.
3. Friend opens the URL on another device and enters the code.
4. System validates room availability, admits the second seat, and gives each only their authorized view.
5. Both see the pair present and indicate start agreement.
6. System initializes one mission under the selected rules.

Alternatives: invalid/expired code, a full room, one missing player, or connection failure gives feedback without starting a partial mission. Exact code format and room lifetime are open.
Postcondition: Two authorized players share one active mission; no third participant can take an occupied seat.
Trace: US-01; FR-01 to FR-06; NFR-02, NFR-08.

### UC-02 - Guide, propose, confirm, and resolve

Actors: Both players.
Preconditions: Mission is active and connected; selected rules specify signal/action limits and current knowledge.
Trigger: Either player inspects the next movement choice.

1. Player reviews their route and the partner's authorized hazard layer.
2. Player sends a permitted truthful clue or declines to send one.
3. Recipient's relevant known state updates according to the selected persistence policy.
4. Both choose a move or Wait and inspect public intended destinations.
5. Each confirms the current plan; a relevant accepted change invalidates stale agreement.
6. Once both current confirmations exist, system resolves exactly once.
7. Both see the same resulting positions, explanation, and active/terminal state.

Alternatives: illegal move or clue rejected; stale request refreshes state; collision/hazard resolves under the actual rule version; duplicate/reordered requests cannot create a second turn. Disconnection invokes UC-04.
Postcondition: One consistent turn result or an explicit rejection/pause, never two divergent outcomes.
Trace: US-03 to US-06; FR-06 to FR-14; NFR-01 to NFR-03.

### UC-03 - Resolve mission and decide what follows

Actors: Both players.
Preconditions: A turn has produced success or failure under the selected objective.
Trigger: System enters terminal mission state.

1. System disables further gameplay commands for that completed mission.
2. Both see the same result and explanation; numerical score appears only if selected for that mission type.
3. Players choose an available next action, such as Retry or Continue when another mission exists.
4. System applies the adopted agreement policy; conflicting choices remain visible and pending.
5. Accepted retry/continue initializes one new mission and updates both devices.

Alternatives: no next mission leads to a clear end-of-session choice; disconnection or departure follows the selected recovery/leave policy. A proposed matching-choice policy permits revision of pending choices; it is not yet adopted.
Postcondition: Both remain at the same terminal state or enter the same next mission exactly once.
Trace: US-06, US-08; FR-14 to FR-17, FR-24.

### UC-04 - Disconnect and return

Actors: Returning player, connected partner.
Preconditions: Active or waiting room; recovery identity for the seat exists.
Trigger: Connection loss is detected.

1. System notifies the partner and applies the selected pause/termination policy.
2. Returning player requests their original seat through the normal recovery flow.
3. System checks authorization, room status, and recovery window.
4. If recoverable, system supplies current filtered state and restores a coherent planning/confirmation state.
5. If expired or lost, system explains termination and how to create/join a new session.

Alternatives: wrong seat/room credentials rejected; server restart with lost room state cannot claim successful recovery. Timing and whether terminal result recovery uses the same window are open.
Postcondition: Authorized recovery or explicit termination; no forced damaging move and no private-state transfer to the wrong player.
Trace: US-07; FR-18 to FR-20, FR-24; NFR-02, NFR-03.

### UC-05 - Owner delivers a verified entry

Actor: Project owner/operator, assisted by development tooling.
Preconditions: Selected build has passed required checks; account eligibility and budget dependencies are resolved.
Trigger: Release candidate is prepared.

1. Record source checkpoint, configuration, asset rights, and actual test coverage.
2. Deploy and verify signed-out public access and a separate-device session.
3. Confirm operating credit runway and rollback/safe-reset procedure.
4. Prepare accurate title, cover, description, and project URL.
5. Owner submits through the specified mission and retains confirmation.
6. Maintain the public release during the planned review window.

Alternatives: failed public smoke test or insufficient budget blocks a release claim; failed submission remains unsubmitted even if GitHub is synchronized.
Postcondition: Confirmed entry pointing to the verified public build, with operational evidence.
Trace: US-09, US-10; NFR-09 to NFR-14; DR-01 to DR-05; SR-09, SR-10.

### Representative scenarios

| Scenario | User concern | Required coverage |
| --- | --- | --- |
| First-time friend on a phone joins an owner on a laptop, using different networks | Access and comprehension | UC-01, UC-02; no creator login, installation, or spoken walkthrough |
| Both propose the same destination | Avoid arbitrary confusion | Public conflict is inspectable; actual resolution explanation matches adopted rules |
| One player warns about danger but cannot send another clue this turn | Understand quota consequences | Exact signal policy and tutorial explain legal alternatives; fairness risk remains part of rule selection |
| One robot reaches its exit before the other | Know whether to move, guide, or wait | Behavior depends on O-01; do not mix 0.2 extraction and J1 joint-exit instructions |
| Both disclose hazards before moving | Does cooperation still have a purpose? | Intentionally allow a meaningful residual puzzle or adopt a justified information policy; do not call ordinary sharing cheating |
| Phone loses connection after one player confirms | Avoid unintended moves and seat theft | UC-04; current agreement and authoritative state remain coherent |
| Players choose different post-mission actions | Avoid split sessions | UC-03; conflict remains pending under a selected policy |

## 10. Logical state and data requirements

### Logical lifecycle

Expected states are Waiting, Playing/Planning, Resolving, Paused, Terminal, and Closed. These describe behavior; exact technical enums and transport remain architecture decisions.

- Waiting admits valid seats and cannot resolve gameplay.
- Planning accepts only authorized current-mission actions and maintains agreement on the latest relevant plan.
- Resolving is an atomic transition; gameplay cannot resolve twice for the same turn.
- Paused follows the adopted interruption contract.
- Terminal accepts only permitted post-mission actions, not old movement commands.
- Closed rejects entry/recovery that the expiry policy disallows and explains the next valid path.

Start, gameplay, continuation, reconnect, and expiry must have defined transitions. Persisted restart recovery is not required if safe explicit termination is selected and tested.

### Logical data inventory

| Data | Purpose | Visibility / lifecycle |
| --- | --- | --- |
| Room identity, join code, seat assignment | Join and isolate one pair | Join code may be shared; seat-control proof is separate and not shown to the partner |
| Mission identity and rule/content version | Prevent stale cross-mission actions and trace results | Shared identity/version; content reflects the selected information policy |
| Board geometry, positions, exits, public intentions | Render the shared movement problem | Public as defined by selected rules |
| Hazard layers | Authoritative safety and partner guidance | Server owns both; each browser receives only authorized information and permitted revelations |
| Learned information and accepted signals | Justify the player's decisions | Visibility and persistence specified by selected rules, reset appropriately on a new mission |
| Turn/progress, strikes, confirmations, outcome | Consistent progression and result | Shared where adopted; numeric score optional until decided |
| Connection/recovery metadata and action identifiers | Recover seats and prevent duplicate/stale effects | Restricted control metadata; do not expose recovery secrets or record them in public logs |
| Release/test records and submission evidence | Reproducibility and truthful project claims | Stored as authored non-code evidence; personal eligibility documents remain outside the project |

No player profile, email, chat history, payment data, or durable progression database is needed for the initial game. Exact room expiry and log retention are open. Record only diagnostic data necessary for operation; no analytics service is selected by this SRS.

## 11. Open decisions and dependency impact

| ID | Unresolved issue | Evidence / options | Impact and next resolution |
| --- | --- | --- | --- |
| O-01 | Mission completion rule | 0.2 extracts robots; J1 keeps both active until simultaneous own-exit occupancy | Blocks final engine/level acceptance; select one candidate for a bounded prototype and label it |
| O-02 | Signal location, quota, timing, persistence | 0.2 permits any-cell, one-per-turn truthful clues; two Wait turns can disclose both hazards | Blocks final signaling tests; compare intended residual cooperation rather than assuming perpetual secrecy |
| O-03 | Board size, hazard count, turn/strike bounds | 3-by-3, two hazards, eight turns, three strikes are research parameters | Freeze a testable candidate, not a universal balance claim |
| O-04 | Score and tutorial behavior | 0.2 formula exists; tutorial unscored; no prize requirement establishes this formula | Decide mission/result policy; do not prioritize aggregate scoring over working cooperation |
| O-05 | Authored release content | Tutorial plus two research candidates; J1 witness is symmetric and only manually checked | Produce an asymmetric candidate and verify under the chosen rules; old counts do not transfer |
| O-06 | Start/Continue/Retry disagreement | Mutual agreement derived; matching revisable choices proposed | Define one explicit policy before implementing those transitions |
| O-07 | Recovery timing and room lifetime | 0.2 proposes a 60-second disconnect window and safe restart termination | Time is provisional; specify active/waiting/terminal/abandoned room handling and test it |
| O-08 | Azure account and deployment route | Balance, expiry, region/service permissions, priced configuration unknown | Blocks provisioning/public proof; local requirements and design can proceed |
| O-09 | Target devices, browsers, and capacity | Phone/computer available; versions and concurrent room limit unknown | Record actual test matrix and publish only measured support |
| O-10 | GitHub remote and repository choices | Repository not created; owner/name/visibility/license unknown | Blocks remote push, not local work; configure before claiming sync |
| O-11 | Remaining contest/account/tool obligations | Work access, linked email, conduct guidance, excluded-party and workflow questions remain in the competition plan | Resolve before entry; do not infer eligibility from age/residence alone |
| O-12 | Detailed room/seat lifecycle policy | Host departure, explicit leave versus transient loss, active-room replacement, page refresh, competing tabs, and terminal recovery need explicit policies | Overall architecture may start; settle each affected transition before finalizing its control/recovery interface |
| O-13 | Quantitative operating and measurement envelope | Concurrent-room/admission limits, command bounds, expiry/retention, target browsers, and latency measurement endpoints are not selected | Document design assumptions, then validate actual configuration; blocks deployment sizing and performance claims, not exploratory design |

System-design update: [architecture.md](architecture.md) now specifies proposed contracts/defaults for O-06, O-07, O-12, and O-13 and identifies a candidate route for O-08/O-09. The rows above record the original unresolved requirement inputs; they are not evidence of implementation. Design defaults and measurement assumptions are selected for review, while actual account/device data, gameplay choices, sizing, and test results remain open.

Do not repeatedly request already supplied facts. Resolve only missing information when the next task actually depends on it. New requirements or changes should record rationale, affected IDs, time/budget impact, and verification. Ordinary reversible work within agreed scope does not require another approval ceremony.

## 12. Acceptance strategy and traceability

### Verification layers

1. Document inspection: requirements are specific, linked, consistent with participant constraints, and label uncertainty.
2. Rule verification: action/terminal boundaries and each mission's solution under the exact selected version.
3. Integration/security verification: real room isolation, filtered payloads, stale/duplicate commands, reconnect, and consistent results.
4. Device/public verification: actual phone/computer session on different networks, signed-out access, readable controls.
5. Human experience verification: first-time understanding, useful decisions by both participants, confusion, engagement, and replay response.
6. Release/entry verification: source checkpoint, deployment configuration, cost runway, rollback/reset, required fields, and confirmation.

Existing 0.2 research evidence supports only bounded portions of layer 2. A manually checked J1 route is not an executed J1 solver, and neither demonstrates layers 3-6.

### Parent requirement coverage

| Parent | Detailed requirements | Main use cases / delivery tasks |
| --- | --- | --- |
| SR-01 | FR-01 to FR-04; NFR-08 | UC-01; TECH-02, BUILD-01 |
| SR-02 | FR-05 to FR-08, FR-19; NFR-02, NFR-11, NFR-16 | UC-01, UC-02, UC-04; TECH-02, REL-01 |
| SR-03 | FR-07, FR-10, FR-21, FR-23 | UC-02 and experience scenarios; GP-02, LEVEL-01, PLAY-01 |
| SR-04 | FR-04, FR-07, FR-09, FR-11 to FR-16; NFR-14 | UC-02, UC-03; GP-02, BUILD-01 |
| SR-05 | FR-10 to FR-14, FR-16, FR-17; NFR-01, NFR-03, NFR-07, NFR-15 | UC-02 to UC-04; TECH-02, BUILD-01, REL-01 |
| SR-06 | FR-18 to FR-20, FR-24; NFR-03, NFR-15 | UC-04; REL-01 |
| SR-07 | FR-22, FR-23; NFR-14 | Rule/level validation; GP-02, LEVEL-01 |
| SR-08 | FR-01, FR-05, FR-08, FR-13, FR-20, FR-21, FR-24; NFR-04 to NFR-06, NFR-12 | UC-01 to UC-04; UX-01, PLAY-01 |
| SR-09 | NFR-07 to NFR-11, NFR-13 to NFR-16; DR-02 to DR-05 | UC-05; TECH-01, TECH-02, RELEASE-01, OPS-01 |
| SR-10 | NFR-11 to NFR-13; DR-01, DR-04, DR-05 | UC-05; ENTRY-01, SUBMIT-01 |

At implementation, assign concrete test/evidence IDs to the chosen increments rather than inventing hundreds of tests now. Evidence format: `Requirement ID | Rule/build version | Environment | Steps | Expected | Observed | PASS/FAIL/NOT TESTED | Artifact/defect`. Keep task completion and requirement coverage separate.

### Minimum release acceptance

- Two real participants can join and finish the same public session across separate devices/networks.
- Only authorized hazard information reaches each browser; no room/seat control bypass is known.
- Selected rules, mission solutions, duplicate/stale actions, outcomes, retry, and interruption behavior pass relevant checks.
- The first-time friend can begin without spoken teaching, and actual cooperation/feedback is recorded.
- No known P0 defect prevents access, a correct core result, privacy, or entry submission.
- Source/deployment/reset evidence and verified operating runway are recorded.
- Required entry fields point to the tested build and an explicit submission confirmation is retained.

Small-sample enjoyment targets and response-time targets are product goals, not award guarantees. A failed experience check should trigger a focused change within the deadline buffer rather than a claim of success based on automatic tests.

## 13. Readiness and next increment

Current candidate override: the participant requested and authorized implementing [SF-T1](signal-foundry-spec.md). First Connection is now the default local profile; the original J1 profile remains a developer comparison. The scoped requirement changes in section 14 supersede hazard-specific expectations for this experiment only. They do not establish release acceptance or declare the original information-cooperation requirement complete.

Implementation update: the participant explicitly resumed coding; SYS-01 and SYS-02 are now locally tested. The implemented subset includes J1-C1 asymmetric gameplay and phase-preserving recovery; [test-evidence.md](test-evidence.md) records actual coverage. Earlier prototype-deferral/open-input statements are historical. Teaching, human acceptance, actual phone compatibility, Azure public proof and release checks remain open; G2/G3 are not closed by automated tests.

Candidate update, October 6: [J1-C1](candidate-gameplay-spec.md) supplies a bounded test specification for O-01 through O-05: joint exit, retained free per-turn signals, provisional eight-turn/three-strike bounds, no numerical points, and two authored mission candidates. It also defines safe-cell deduction from authorized knowledge. These choices supersede unspecified candidate inputs for prototype planning, not the unverified release baseline. [The static layout](mobile-wireframe.html) supplies interface preparation. Prototype, device, and human acceptance remain open; the historical open-decision entries describe earlier inputs.

The completeness review in [requirements-readiness-review.md](requirements-readiness-review.md) finds sufficient scope for high-level system design, with explicit conditions before detailed gameplay/interface freeze. Version 1.1 adds derived public-service resource and transport requirements plus lifecycle/measurement decision entries. Their policies and numeric values remain unselected. This does not close G2 or resume deferred prototype construction.

The product direction and access/cooperation/reliability needs are clear enough for focused implementation when requested. J1-C1 and the static layout now specify the candidate; final balance, release content acceptance, actual device usability, and deployment details are not frozen.

The earlier candidate preparation sequence is historical. Current next step: first-time human inspection of the implemented SF-T1 room, then actual phone/public technical proof and narrowly chosen gameplay adjustments. Do not repeat a general concept review merely because this SRS has open entries.

## 14. SF-T1 experimental requirement profile

Current override: [SF-T1 v3](independent-movement-spec.md) is explicitly selected by the participant's direct-movement instruction. FR-04 uses automatic start once both authorized seats are connected. FR-09/FR-12 use independent immediate adjacent moves with current relay power. FR-10 public joint proposals and FR-11 mutual per-move confirmation no longer apply to this foundry profile; seat authority, ordered execution, retry identity and current-own-position checks remain. FR-07 uses repeatable public location pings without a turn quota; FR-13 reports successful team steps. Mutual terminal retry still applies to FR-16. The v2 table below records the preceding profile; it cannot justify reintroducing Ready/Wait/start agreement into foundry.

Applies to the participant-authorized single First Connection room. Detailed relay/gate rules are owned by [signal-foundry-spec.md](signal-foundry-spec.md), not duplicated here.

| Area / ID | Current experiment requirement | Evidence / limit |
| --- | --- | --- |
| FR-01 to FR-05, FR-18 to FR-20, FR-24 | Retain two independent seats, authoritative admission/start/control, pause/recovery/expiry and leave | Local regressions pass; public/device proof pending |
| FR-06 / SF-01 | Publish the teaching map and gate links to both seats; only the authorized seat can issue its own robot's actions | Public views match in wire test; no hidden layer claimed |
| FR-07 / SF-02 | Allow one public walkable-tile ping per player per turn under current revision and command authority | Quota/wall/projection checks pass; UI labels it as a location ping |
| FR-08 | Own hidden-layer knowledge is not applicable to SF-T1; remains part of retained J1 | Empty knowledge arrays in foundry; do not infer satisfaction of future private-information content |
| FR-09 to FR-12 / SF-03 | Resolve legal tile moves using turn-start relay power and latch gates only after actual entry; both current confirmations required | Rule boundaries, duplicate confirmations and wire checks pass |
| FR-13 / SF-04 | Show robot positions, relay links, Closed/Powered/Latched open text and actual turn explanations | Browser inspection completed; human comprehension unverified |
| FR-14 / SF-05 | Succeed on joint own-exit occupancy; no strike, countdown or turn-limit failure in this teaching room | Witness and more-than-eight-turn recovery pass |
| FR-15 | No numerical score adopted | Turn summary only |
| FR-16 / SF-06 | Both retry agreements create a new attempt and reset latches, robot positions, pings and turn count | Store/wire/UI retry checked |
| FR-17 | No Continue option because no second foundry room is implemented | Multi-room progression remains future work |
| FR-21 / SF-07 | Teach how each robot opens the partner's route and how start-of-turn power differs from latching | English instructions and contextual hints present; first-time human criterion remains open |
| FR-22 | Provide a verified route and inspect recovery under actual foundry rules | Five-turn route; 21 reachable states/120 transitions; all states can complete |
| FR-23 | Complementary private information plus coupled reasoning remains unmet by this public, disjoint teaching room | Required gate dependencies are proven; no human/release completion claim |

All original accessibility, synchronization, bounded-resource, deployment/cost and submission requirements remain applicable. Measured 390-pixel browser emulation is partial NFR-04/05 evidence; actual phone/touch, two devices, performance/load and public HTTPS remain pending. The implementation's 46 passing tests do not close G2 or G3.

This task delivers requirements analysis only. It does not implement gameplay, configure Git/GitHub, provision Azure, perform a human test, or close G2-G6.
