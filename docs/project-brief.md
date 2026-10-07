# Signal Rescue Project Brief

Updated: October 6, 2026
Status: Concept B selected. GP-01 delivered; the design 0.2 recommendation is reopened after the second gameplay review. GP-02 continues on paper; prototype construction is deferred. G2 and human validation remain open.

Current implementation update: coding has resumed and the participant requested the [Signal Foundry teaching experiment](signal-foundry-spec.md). It now runs as the default local profile, with two robots powering partner gates on a public map. The original private-hazard promise below describes B's earlier premise; SF-T1 does not claim to satisfy it. Broader gameplay acceptance, complementary information content, actual phone/public proof, and G2/G3 remain open. J1 is retained as a developer comparison.

## Objective

Create Signal Rescue, a cooperative browser game in which each player can see dangers that threaten the other player and must help that player navigate safely. Deliver a reliable, distinctive two-player experience and a valid entry for the Handshake multiplayer game challenge. Aim for a competitive entry across execution, creativity, value, and polish; no outcome is guaranteed.

The participant explicitly selected this concept on October 6. A and C in [game-concepts.md](game-concepts.md) are archived alternatives, not active workstreams. Changing the selected concept requires a new participant decision; revising prototype parameters within B is normal research.

## Product promise

"I can see your danger. You can see mine. We get out together."

The player should feel that their partner's information changes their decisions, that failures are understandable, and that another attempt is worthwhile. Different screens must have a meaningful role in play.

## Scope and constraints

- Exactly two human players for the initial release, each on a separate device.
- One cooperative mode with a small set of authored missions and replay.
- Room-code entry through a public browser URL; no player login, installation, or required voice call.
- English product text and project contents.
- Azure is the selected provider. Verify student credit, expiry, permissions, service behavior, and total cost before committing resources.
- Approximately one hour of participant time per day, with extra sessions by need. Keep the existing 21-30 hour participant budget as a planning envelope; B's earlier 25-32 hour estimate exposes a scope risk, not an approved increase. Re-estimate after research and cut scope if needed.
- Candidate ready by October 24, structured friend tests around October 25-26, final repairs October 26-27, submission October 28.
- At least one friend is available to invite. Broader feedback is desirable, not assumed.
- Keep the public game available through the planned review window, at least November 29 unless organizer updates require longer.

The 3-by-3 board, three signals, eight turns, three strikes, three missions per match, six authored layouts, and scoring formula in the concept document are hypotheses. They are not accepted requirements. Their usefulness must be tested before they enter the approved design.

## Requirements and acceptance evidence

These are project requirements. Contest-specific obligations remain in [competition-plan.md](competition-plan.md).

| ID | Requirement | Acceptance evidence |
| --- | --- | --- |
| SR-01 | Two separate devices can join one public room and finish a cooperative session | Recorded phone/computer test on different networks |
| SR-02 | Each player receives appropriate public state and only authorized private information | Payload inspection and isolation/authorization tests |
| SR-03 | The partner's information supports meaningful decisions | Research examples first; observed first-time human play later |
| SR-04 | Rules define actions, resolution order, failure, success, score, and replay | Approved design, worked examples, and rule tests |
| SR-05 | Accepted actions and results remain consistent across devices | Concurrent-action, retry, synchronization, and complete-session tests |
| SR-06 | Disconnects, timeouts, expired rooms, and server restarts have defined behavior | Recovery tests and clear player-facing messages |
| SR-07 | Every shipped mission has a valid solution under the implemented rules | Solver or exhaustive state exploration; restricted-information usability tested separately |
| SR-08 | Phone controls and onboarding support first-time use without spoken teaching | Mobile checks and the friend's unassisted first attempt |
| SR-09 | Deployment is reproducible and fits the verified Azure budget | Deployment record, actual usage observation, and rollback check |
| SR-10 | Required title, cover image, description, and URL are submitted through the mission | Submission confirmation and release identifier |

## Excluded from the initial release

Procedural level generation, more than two players, account systems, matchmaking, leaderboards, progression economies, user-created missions, runtime AI calls, voice chat, moving physics, and a large story campaign. Add any of these only through the change process and a revised effort estimate.

## Success measures

1. A friend can join and begin without spoken instructions.
2. Both players finish a session and can explain at least one decision affected by the partner's information.
3. Failure explanations identify the actual action and rule, without leaking future hidden information.
4. The friend reports enjoyment and is willing to replay; record the actual response rather than treating a target as a result.
5. The release passes technical checks and meets the submission requirements.

One friend's feedback is limited evidence. AI-generated opinions, full-information puzzle solutions, and repeated tests by the creator cannot replace first-time human feedback.

## Ownership and next step

Participant: product choices, account facts, time/budget choices, human playtests, and entry attestations.
Assistant: research, documented alternatives, implementation, automated checks, evidence, and explicit reporting of gaps.

Follow [development-workflow.md](development-workflow.md). The active task list is [tasks.md](tasks.md). See [gameplay-research.md](gameplay-research.md), [game-design.md](game-design.md), and [gameplay-second-review.md](gameplay-second-review.md). Next: GP-02, reassess the core interaction on paper against the second review's criteria. Prototype construction is deferred by the participant; full production and cloud provisioning remain separate tasks.
