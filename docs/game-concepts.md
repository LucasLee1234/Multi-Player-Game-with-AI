# Game Concept Options and Selection Record

Date: October 6, 2026<br>
Status: Participant selected B - Signal Rescue on October 6, 2026. Detailed rules remain provisional.<br>
Related documents: [Competition plan](competition-plan.md), [Participant constraints](decisions.md).

## 1. Purpose and development process

Choose one game worth prototyping before committing to a full implementation. This document is the concept comparison and selection record. After selection, write the approved rules in `game-design.md`, prove deployment and shared state, then implement and test. Candidate rules below are specific enough to expose problems, but remain proposals.

Process: constraints -> concept alternatives -> comparison with existing games -> rule walkthrough -> participant choice -> small playable proof -> approved design -> implementation -> human feedback -> release.

All names are working titles. No trademark search or claim of global originality has been made. All enjoyment and competitiveness assessments are hypotheses, not playtest results or predictions of winning. Official contest requirements remain in the competition plan.

The project recommends GPT-6 Astra / Medium for concept design. This document does not attest to a verified model switch or a separate Astra review. No subagent review has been performed.

## 2. Design constraints

- A complete two-player experience is mandatory for our scope: the participant has a phone, a computer, and at least one friend available.
- One small game mode; additional player counts are deferred until the core works and human testing supports them.
- Approximately one hour of participant time per day, with flexible additional sessions. Structured friend playtesting starts around October 25; submission is October 28.
- Public browser access on separate devices, room codes, readable rules, no player account or installation, and no required external voice call.
- English game content and project files.
- Azure hosting using the reported student credit. Exact service, balance, expiry, and subscription permissions remain unverified.
- No runtime AI API, generated trivia database, large art pipeline, or real-time physics is required by these concepts.
- Work toward all four equally weighted judging categories: execution, creativity, value, and polish.

## 3. Overview

| Candidate | Player experience | Distinctive decision | Proposed session | Main risk |
| --- | --- | --- | --- | --- |
| A. Borrowed Tomorrow | Competitive auction and resource planning | Win now by borrowing against the next round, exposing a later weakness | 5-7 minutes | Borrowing and item values may produce a dominant strategy |
| B. Signal Rescue | Cooperative navigation with different information on each device | Protect your partner while trusting them to protect you | 6-10 minutes | Communication restrictions may feel frustrating or make puzzles trivial |
| C. Counterfeit Courier | Competitive bluffing and targeted inspection | Predict what your opponent will inspect and when they will trust you | 5-8 minutes | Decisions may feel random without readable behavioral patterns |

**Historical comparison:** A was initially recommended for scope/reliability balance; B for cooperative discovery and visual demonstration; C for bluffing. **Current decision: B is selected.** A and C are archived alternatives. Do not combine the three into one game. The current objective is defined in [project-brief.md](project-brief.md).

## 4. Candidate A - Borrowed Tomorrow

### Pitch and intended audience

Two rival collectors bid on artifacts arriving from the future. You can borrow money from your next round to win an artifact now, but your opponent sees the debt after bids reveal and can exploit your weaker next round.

For players who enjoy prediction, resource decisions, and a rematch after discovering the opponent's strategy. Presentation: a small futuristic auction desk with an explicit timeline showing current coins, next-round income, and debt.

### Proposed rules

1. Play six auctions. Both players start with six coins. Rounds 2-6 normally grant two coins each before bidding.
2. The full six-lot sequence is public from the start. Each lot has a category and a base point value. Use two lots per category across three categories; shuffle their order with a server seed.
3. Each player privately receives one preferred category: its acquired lots score two bonus points each. Use distinct preferred categories and reveal both at the end.
4. Simultaneously submit a sealed integer bid from zero to available coins. Zero means pass. Bids and borrowing choices stay hidden until both lock or the server deadline expires.
5. A player may borrow three coins before bidding, at most twice per game and only in rounds 1-5. Borrowing removes the next round's two-coin income and costs one final point. A player cannot borrow while still carrying an unsettled next-round income penalty.
6. Borrowing is committed with the bid and takes effect even if the bidder loses. Received coins remain available until spent. The interface must show all consequences before confirmation.
7. Highest positive bid wins the lot and pays the bid; the other player pays nothing. A tied positive bid is resolved by a public priority marker that alternates every round. If both pass, discard the lot.
8. At the end, score lot values, preferred-category bonuses, one point per three unspent coins rounded down, and minus one point for each loan. Higher score wins; an exact tie is a draw.

These values are prototype parameters. The point of borrowing is timing, not free money: it brings three coins forward while costing two future coins and one final point.

### Concrete round example

Round 3 offers a blue artifact worth four base points. Alice prefers blue and has two coins; Ben has four coins. Alice borrows three, reaches five coins, and bids five. Ben bids four. Alice wins and pays five, leaving zero; Ben keeps four.

In round 4 Alice receives zero income because of the loan; Ben receives two and reaches six. Alice's artifact is worth six points to her, with a one-point loan penalty at game end. The next lot is now much easier for Ben to contest. Whether Alice's choice was good depends on the visible remaining lots and the eventual scores.

### Why two players matter

There is a single readable opponent. Public balances, past bids, loan history, and the future lot sequence give evidence for predicting behavior. The private preferred category adds uncertainty without requiring a crowd or fabricated players.

The reveal should explain the strategic consequence: not just who won, but who now has the advantage for the next lot. A replay screen can summarize decisive purchases and borrowing choices using deterministic text.

### Minimum implementation and cuts

- Required: lobby, six-lot timeline, private preference card, bid/loan controls, simultaneous reveal, score explanation, replay, reconnection, server-side validation.
- Content: a small original set of artifact cards using three categories and a consistent graphic treatment; no authored story campaign.
- Cut first: animated auctioneer, additional categories, special artifact powers, daily challenges, and more than two players.
- Do not add abilities that change auction rules until the plain economy is demonstrably enjoyable.

### Critical validation

- Simulate always-borrow, never-borrow, conservative bidding, and aggressive bidding on the same lot schedules. Simulation can expose obvious economy defects, not establish human fun.
- Check if the alternating tie marker or last-round spending creates an overwhelming advantage. Randomize the first marker and show it clearly.
- Check whether every decision reduces to bidding all available money. If so, adjust values/income before adding complexity.
- Verify the borrowing ledger, loss behavior, both-pass behavior, duplicate bids, and hidden bids in network payloads.
- First human question: "Did you change your plan because of your opponent's money or earlier decisions?" If not, the strategic promise is failing.

### Similarity and differentiation

For Sale is an established bidding game involving buying and selling property. That means auctions and reading opponents are not original inventions. This proposal's intended emphasis is a visible future schedule plus short-term borrowing that changes the next encounter. It does not copy that game's cards, scoring system, or presentation. This comparison is limited, not an exhaustive prior-art search. [S1]

### Delivery assessment

Lowest implementation risk of these three: small finite state, simple inputs, deterministic scoring, and no puzzle generator. Azure needs only modest room messages and state storage; exact costs require measurement.

Planning estimate: approximately 21-27 hours of participant involvement through submission, including review and playtesting, with additional assistant execution time. This is a provisional allocation inside the project's schedule, not a guaranteed build estimate. Re-estimate after a two-player auction works publicly.

## 5. Candidate B - Signal Rescue

### Pitch and intended audience

Two small rescue robots must cross a damaged station. Your screen shows the hazards that threaten your friend's robot, while your friend sees the hazards that threaten yours. You can send limited truthful map signals and commit movement at the same time.

For players who enjoy cooperation, spatial puzzles, and moments of mutual trust. Presentation: two colored robots and a compact station board, with visual differences between the screens and a final reveal of both hazard layers.

### Proposed rules

1. A match contains three short missions. Each mission uses a 3-by-3 grid, two visible robots, and their visible destination cells.
2. Each robot has its own hazard layer. Player A sees B's hazards, and B sees A's hazards. Each layer initially contains two hazard cells, excluding that robot's start and destination.
3. Before movement, players may send truthful safe/danger markers onto their partner's map. The server verifies the marker against the sender's visible layer. The team has three markers per mission; sent markers remain visible for that mission.
4. Each player secretly selects up, down, left, right, or wait. Both moves resolve together. Movement is turn-based, so fast reactions do not improve the result.
5. Stepping out of bounds is rejected before submission. Stepping onto an own-layer hazard leaves the robot in place, reveals that hazard to its controller, and adds one shared strike.
6. Resolve hazards first, replacing a hazardous move's destination with that robot's current cell and recording its strike. Then, if the resulting destinations overlap or directly swap positions, both robots stay at their original cells. Collisions add no further strike. Moving into a cell that the other robot safely leaves is allowed unless it is a direct swap. This order prevents a hazard-stopped robot from sharing a cell with its partner.
7. A robot reaching its destination is extracted from the board and takes no further actions. The team succeeds when both are extracted within eight turns, before accumulating three strikes. The third strike fails the mission even if the other robot reaches its destination that turn.
8. A successful mission scores 100 minus 10 per strike and five per marker spent. A failed mission scores zero. Play all three missions and compare the team total on a rematch. There is no individual winner.

A short turn deadline and default wait prevent indefinite stalls; the exact duration is a prototype parameter. The timer is a pacing tool, not a reaction-speed contest. No voice call or free-text chat is needed for the proposed interface.

### Concrete mission example

Coordinates use columns 0-2 from left to right and rows 0-2 from top to bottom. A starts at (0,1), heading to (2,1); B starts at (2,1), heading to (0,1).

- A's hazards are (1,1) and (0,2); only B initially sees them.
- B's hazards are (1,0) and (2,0); only A initially sees them.
- B marks (1,1) as dangerous for A. A marks (1,0) as dangerous for B.
- One safe simultaneous route is A: (0,0), (1,0), (2,0), (2,1); B: (2,2), (1,2), (0,2), (0,1).
- They finish in four turns with no strikes and two markers spent, scoring 90.

The same cell can be safe for one robot and dangerous for the other. Clear robot-specific hazard labels are therefore essential.

### Why two players matter

Both players act and provide information. Neither gets relegated to reading instructions for the whole session. A single screen intentionally lacks the complete information needed for confident navigation.

External voice or screen sharing can bypass the information restriction. Treat that as a limitation of the cooperative challenge, not something invasive anti-cheat should attempt to prevent. The intended experience is fully playable through the in-game markers.

### Minimum implementation and cuts

- Required: synchronized grid, private hazard views, signal budget, simultaneous movement resolver, goal extraction, mission scoring, replay, reconnection.
- Start with six hand-authored, verified mission layouts. Shuffle or mirror only where validation confirms the transformation preserves the rules.
- Cut first: procedural generation, larger boards, moving hazards, doors, additional robots, and elaborate character animation.
- Avoid advertising endless new puzzles if only a small authored set exists.

### Critical validation

- Enumerate joint robot positions and legal moves to verify that every layout has a no-strike solution within eight turns. A solution with full information does not prove it is understandable with the restricted views.
- Separately test whether three signals permit informed cooperation rather than blind guessing. If not, add signals or simplify layouts before creating more content.
- Check whether players can solve every board by following a fixed upper/lower route. Reject layouts that do not require meaningful coordination.
- Test all collision/hazard combinations and private-state payloads; the walkthrough alone does not cover them.
- First human question: "Did your friend's signal change your next move, and did that feel satisfying?"
- If restricted communication is frustrating after the first revision, cut to a simpler cooperative mission before committing further time.

### Similarity and differentiation

Keep Talking and Nobody Explodes uses separated information and communication to solve a shared problem. Its official page describes a defuser and experts with a manual. This proposal instead gives both players moving pieces, reciprocal hazard information, and a built-in limited map-signaling system. That is the proposed distinction, not a claim that asymmetric cooperation is new. [S2]

### Delivery assessment

Highest design/verification risk of these three: puzzle solvability, information limits, mobile grid clarity, and simultaneous collision behavior all need attention. Static authored levels keep the scope manageable. Azure traffic remains discrete turn events, not a physics stream.

Planning estimate: approximately 25-32 hours of participant involvement through submission, plus assistant execution. The upper end exceeds the current 30-hour planning range. Select this only with willingness to add time or reduce the mission set; a playable proof must establish the communication mechanic early.

## 6. Candidate C - Counterfeit Courier

### Pitch and intended audience

Two interstellar couriers alternate delivering parcels and inspecting them. A sender can ship a genuine parcel or falsify one of three fields. The inspector gets one free targeted check, then decides whether to trust the parcel, reject it, or spend a scarce full inspection.

For players who enjoy bluffing, testing a friend's habits, and revealing what really happened. Presentation: a colorful customs desk with a compact manifest, three inspection buttons, and a stamp/reveal animation.

### Proposed rules

1. Play six deliveries, alternating sender and inspector, so each player performs each role three times. Randomize the starting sender; alternate it on a rematch.
2. The sender secretly selects genuine or counterfeit. A counterfeit parcel has exactly one invalid field chosen by the sender: weight, destination, or seal. Genuine parcels pass all three.
3. The parcel is committed before the inspector acts. The inspector chooses one field to check for free. The server reveals only whether that field passes.
4. A failed field immediately exposes the counterfeit and resolves the delivery. A passed field does not prove the other two are valid.
5. After a passed check, the inspector chooses Accept, Reject, or Full Scan. Each player has one Full Scan for their three inspector turns. Full Scan reveals all fields and resolves honestly according to the table below.
6. Reveal the parcel truth and the chosen checks after every delivery. Past behavior is public evidence for later decisions.
7. Add both roles' points across all deliveries. Higher total wins; an exact tie is a draw. Negative totals are allowed.

| Outcome | Sender points | Inspector points |
| --- | --- | --- |
| Accept genuine | +3 | +2 |
| Accept counterfeit | +6 | -2 |
| Reject genuine | 0 | -1 |
| Reject or expose counterfeit | -2 | +3 |
| Full Scan confirms genuine | +3 | +1 |

Full Scan detecting counterfeit uses the expose-counterfeit row and consumes the scan. The free failed check uses the same row without consuming a scan. A scan is never needed after a failed check.

### Concrete delivery example

Alice falsifies the seal because Ben previously checked weight. Ben checks destination, which passes. Ben has already spent his Full Scan, so he must accept or reject. He accepts: Alice gains six points and Ben loses two.

The reveal shows that only the seal was invalid. Next time Alice sends a parcel, she must consider whether Ben will now check seals. If Ben had selected seal initially, Alice would lose two and Ben would gain three instead.

### Why two players matter

The opponent's checking and bluffing history is easy to follow. Roles alternate, so both players get to deceive and investigate. The game needs neither a crowd vote nor typed jokes or external trivia.

The design still risks becoming a guessing exercise. History creates a possibility of prediction, but only human playtesting can establish that three turns per role are enough to produce satisfying adaptation.

### Minimum implementation and cuts

- Required: alternating roles, private committed parcel, one-field check, limited full scan, decision controls, score table, visible history, replay, reconnection.
- Content: three fields and a small set of decorative parcel appearances; the appearance must not accidentally reveal hidden truth.
- Cut first: bribery, custom messages, extra field types, character powers, multiple simultaneous inspectors, and story cases.
- Keep the inspection result literal and readable: "Destination passes; weight and seal are still unknown."

### Critical validation

- Walk through all genuine/counterfeit, field-choice, acceptance, rejection, and scan branches. Verify the server never permits the sender to change a committed field.
- Compare always-genuine, always-counterfeit, fixed-field, and adaptive checking policies. Do not assume a balanced payoff table merely because the numbers look plausible.
- Test whether one Full Scan is useful and whether saving it for the last delivery is always optimal.
- With a uniformly chosen check and a counterfeit field selected beforehand, the free check catches one out of three counterfeits. That is a baseline calculation, not the expected rate against a human who adapts.
- First human question: "Did you make a choice based on what your friend did earlier?" If play remains arbitrary, this concept needs redesign rather than extra cosmetics.

### Similarity and differentiation

Fibbage is a bluffing game built around misleading answers and finding the truth. This proposal uses structured parcel fields, targeted inspection, and a finite information resource rather than player-authored false trivia answers. Bluffing itself is established; the inspection/history combination is the specific proposal to validate. [S3]

### Delivery assessment

Low-to-medium technical risk, medium-to-high balance risk. Its small state machine and fixed content fit phone interfaces and a lightweight Azure backend. Its main uncertainty is repeat-play appeal.

Planning estimate: approximately 22-28 hours of participant involvement through submission, plus assistant execution. Re-estimate after both roles work in a public two-device delivery.

## 7. Comparison against the contest rubric

These are qualitative design assessments, not earned scores. The four official categories remain equally weighted; no winner probability is assigned.

| Category | A. Borrowed Tomorrow | B. Signal Rescue | C. Counterfeit Courier |
| --- | --- | --- | --- |
| Execution | Small rules engine; economy and sealed bids are the critical checks | Most edge cases; requires layout and simultaneous-move validation | Small role-based state machine; hidden commitments are critical |
| Creativity | Visible future rounds plus borrowing create a focused twist | Reciprocal hidden hazards and scarce signals make different screens meaningful | Targeted checking makes bluffing more concrete than a binary trust choice |
| Value / enjoyment | Prediction, resource tension, and planning; test for dominant strategies | Shared rescue and coordination; test frustration versus discovery | Reading a friend's habits; test whether decisions feel informed |
| Polish | Clear timeline, debt preview, and decisive reveal can explain the whole game | Strong visual story, but private layers and markers must be unmistakable | Strong stamp/reveal moment and compact mobile controls |

| Practical factor | A | B | C |
| --- | --- | --- | --- |
| Fit with one friend | Strong by design, untested | Strong by design, untested | Strong by design, untested |
| Implementation risk | Lowest | Highest | Low-to-medium |
| Content burden | Low | Medium: verified authored layouts | Low |
| Main design uncertainty | Economy balance | Meaningful restricted communication | Whether bluffing avoids feeling random |
| Scope fit | Best | Conditional on early proof and cuts | Good |

Recommend A if the priority is finishing a distinctive, polished entry within the current schedule. Recommend B if the participant is most excited by cooperation and visibly different information on each screen. Recommend C if deception and direct rivalry sound most fun. The participant's enthusiasm matters because iteration and repeated testing are necessary for every option.

## 8. Shared engineering approach after selection

Use one server-authoritative room state machine and a thin browser client. Shared infrastructure should support the selected game only; do not build a generic three-game platform.

- Public and private state are separate projections. The server sends each player only authorized information.
- Room codes invite players; private reconnect tokens identify existing players. A room code alone must not authorize another player's actions.
- Each accepted action has a room version and unique action ID; retries must not duplicate bidding, movement, scans, or scoring.
- A server deadline supplies a documented fallback: A passes without borrowing; B waits; C cancels an uncommitted delivery or applies a clearly displayed conservative decision. Specify final timeout/rejoin rules in the approved design.
- Reconnection restores the correct role and phase. After a server restart, either restore persisted room state or clearly offer a safe restart; do not silently invent missing state.
- Azure Container Apps or App Service remain candidates. Service selection depends on the actual subscription and a costed deployment proof. The game concepts do not assume free unlimited hosting.
- Test private views, invalid actions, duplicate actions, complete scoring, and concurrent rooms. Use real separate-device checks for networking and humans for enjoyment.
- Runtime AI remains optional and outside the minimum scope. AI assists development; players do not need an API key.

## 9. Selection and next gate

**Selection: B - Signal Rescue, confirmed by the participant.** Final rules remain provisional. Follow [tasks.md](tasks.md) for current work status; the checklist below is the concept-stage history.

- [x] Participant selected B - Signal Rescue as the project direction.
- [x] Record the selected concept and rationale here and in `decisions.md`.
- [ ] Write a concise approved design with rules, state transitions, scoring, timeouts, private information, and the cut-first list.
- [ ] Make a small public Azure proof of the central interaction: one auction, one rescue turn, or one parcel inspection.
- [ ] Confirm two devices see consistent outcomes and appropriate private information.
- [ ] Re-estimate work after the proof. If the central mechanic fails its stated test, simplify or revisit selection before full production.
- [ ] Build the complete candidate by October 24, run structured friend playtests around October 25-26, repair October 26-27, and submit October 28.

Early technical checks and worked examples are not substitutes for the scheduled human playtests. Scope must fit the existing plan rather than creating new unbudgeted modes.

## 10. Review record and limitations

- Constraints reviewed against the participant decision record and competition plan.
- Three publisher/developer pages opened for comparisons; summaries are attributed below.
- Each candidate includes a bounded match, defined scoring, a two-player core, a concrete example, scope cuts, and a primary falsification test.
- Rule walkthroughs check internal consistency only. No game build, simulation, Azure deployment, or human enjoyment test has occurred in this concept step.
- Participant-hour ranges are estimates, not measured production data. Azure costs and account compatibility remain to be established.
- Names, originality beyond the limited comparisons, balance, session length, and audience appeal remain unverified.

## 11. Sources

Accessed October 6, 2026. Existing games are references for comparison, not sources of reusable assets or permission to copy their expression.

- **S1:** [For Sale, Eagle-Gryphon Games](https://www.eagle-gryphon.com/products/for-sale). Publisher description of bidding and buying/selling property.
- **S2:** [Keep Talking and Nobody Explodes, Steel Crate Games](https://keeptalkinggame.com/). Developer description of the defuser/expert information split.
- **S3:** [Fibbage, Jackbox Games](https://www.jackboxgames.com/games/fibbage). Developer description of bluffing and identifying the truth.
- [Competition plan](competition-plan.md): official contest sources, model recommendations, schedule, and hosting research.
- [Participant constraints](decisions.md): user-reported availability, Azure preference, device/tester access, language, and dates.
