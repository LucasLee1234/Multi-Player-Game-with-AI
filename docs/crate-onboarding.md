# Crate onboarding improvement

## Problem and scope

First-time players struggle to connect the crate goal with push/pull geometry and the persistent Pull mode. Acknowledging a long explanation does not establish mastery. Keep the existing four rooms, authoritative movement rules, keyboard/touch controls and single-screen game layout.

## Implemented behavior

- First crate encounter offers a short push diagram. A second diagram explains standing next to the crate and stepping away in Pull mode. Both show before/after positions, with a subtle after-state animation and a reduced-motion fallback.
- The visible control reads `Pull OFF · F` or `Pull ON · F`. First activation offers the pull lesson unless it was already offered or mastered. The menu can reopen either explanation.
- A dismissed lesson is offered only once per page session. Push/pull mastery is saved separately after a confirmed local-role crate action. Previous crate v2 acknowledgement does not suppress these new v3 lessons. Another player's action, ordinary movement and blocked moves do not count as mastery.
- Legal crate actions receive a direction label and outline on their destination tile. This is immediate local guidance, not a solution path or a replacement for server validation; partner movement can make a preview stale.
- Failed crate actions produce a dismissible seven-second correction near the board, including wrong pull geometry, walls, closed gates and partner occupancy. First successful push/pull also gets a short tip.
- A matching dashed crate dock reads `Park crate here`. Parking turns it green, labels it `Crate parked` and changes the objective to keeping the crate there while reaching both robot exits. Moving it away restores the unfinished objective.
- No permanent instruction panel or page scrolling was added. Restart and level-selection consent remain unchanged.

## Validation

- 78 automated tests passed with local HTTP/WebSocket access. Three new tests check corrective copy and compare every direction preview against the actual server engine in every reachable state of both crate rooms, including gate power, walls, map edges, partner occupancy and terminal states.
- The first sandboxed suite encountered loopback access restrictions; the complete rerun with the required local network access passed.
- Browser inspection with a development scripted partner exercised both diagrams, a blocked pull, a successful pull, a legal push highlight and crate parking in Handoff Workshop. Reloading after successful push/pull did not reopen crate onboarding.
- Phone-sized 390x844 and 844x390 board inspection showed no page overflow. This is responsive browser verification, not an actual-phone or independent two-human playtest.
- [Verified parked-crate preview](crate-onboarding-preview.png).

## Human acceptance next

Ask a new player to attempt a crate room without verbal coaching. Observe whether they can push, recover with Pull, identify the dock and explain why both robots still need their exits. Record failures before adding more text or changing the puzzle. The goal is clear controls without giving away the cooperative solution.

## Release boundary

These changes are source/local-development improvements. The immutable v1.0.0 image and deployed Azure app are not replaced by editing the repository. Publish a new versioned image and deploy it explicitly after acceptance; do not overwrite the existing v1.0.0 release or its digest.

## Follow-up: visible control and straight-away pulling

Player feedback identified two remaining issues: the fixed bottom Pull button was easy to miss, and players expected to walk sideways while Pull was active.

- Moved the Pull control into the mission toolbar above the board, next to room progress. Removed the obsolete bottom-control space reservation.
- Pull ON now displays the geometric direction arrow when the robot is adjacent to the crate. This direction still requires a clear, powered destination; legal actions remain highlighted separately.
- The lesson explicitly explains that a crate on the robot's left can only be pulled right. Up/down movement requires turning Pull OFF with F or the visible button.
- A failed pull now names the current straight-away direction, or tells a nonadjacent player to switch OFF and approach the crate. Accessible tile labels no longer describe illegal pulls as available actions.
- 79 regressions passed, including all four correction directions and row-boundary rejection. Browser validation reproduced crate-left/robot-right, verified the right arrow and failed-up correction, and confirmed upward walking succeeds after switching Pull OFF.
- At 390x844 the Pull control started at y=99; at 844x390 it started at y=88. Neither viewport had page overflow. [Mobile control and correction evidence](pull-control-preview.png).
