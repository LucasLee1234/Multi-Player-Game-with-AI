# Conveyor Handoff: Implementation and Verification

## Delivered behavior

Room six uses the existing compact map and controls. Blue striped tracks and large arrows mark 12 → 13 → Dock 18. Switch 16 controls only the conveyor; Gate 13 was removed and Tile 13 is the belt corner. One robot supplies relay support so the other can reach the switch. Cargo travels within a successful robot move only when the entire route is clear. The dock locks delivered cargo against removal.

Only robots power the switch. This room needs no manual cargo handling; the mode control says `Belt · Switch 16`, then `✓ Cargo delivered`. F explains the required action, and the menu hides its Pull button in this room. The revised first-use lesson is remembered separately and can be reopened in Menu → Controls → Show tutorial. Other rooms retain their original gates and Push/Pull rules.

## Evidence

- All 94 automated tests passed after clarification, including whole-route waiting, a receiver escaping Dock 18 before delivery, dock locking, separate gate power in a custom fixture, idle/failed commands, invalid authored paths, exhaustive client action previews, six-room progression and three real two-seat WebSocket completion/replay cases.
- The final production-engine audit found 497 reachable spatial states, 1,876 successful transitions, every state recoverable, shortest completion 18 moves and maximum shortest recovery 18 moves. The audit stops expansion at success and abstracts counters and command history; lifecycle and command correctness are tested separately. [Recorded report](conveyor-validation.json).
- Browser A with a scripted development partner selected room six, viewed and dismissed the new lesson, delivered the crate through switch activation, completed in 20 moves and used Leave room from the success screen. No console errors were captured.
- At 390×844 and 844×390 the page had no overflow. The landscape inspection identified an overlapping END label, which was removed in favor of the existing dock marker. A subsequent build passed, and the final UI was checked again for belt-specific F guidance and the corrected dock.

This is not independent two-human playtesting or an actual-phone test. The belt intentionally settles immediately instead of requiring timed movement. The next human check should ask whether both players understand the switch, arrow direction and safe waiting behavior without verbal coaching.

## Clarification follow-up

Player feedback identified the dual-purpose switch and faint belt as confusing. Removing Gate 13 first exposed unsafe cargo-removal states; locking the dock and waiting for the whole route eliminated all unrecoverable spatial states. The original 20-step witness remains valid. Revised screenshots show the blue track, dedicated switch and no Gate 13; browser checks verified the new lesson and narrow-layout visibility.

[Desktop](conveyor-desktop.png) · [Phone viewport](conveyor-phone.png) · [Landscape viewport](conveyor-landscape.png).

## Release boundary

Source-only update under 1.1.0. No Docker image, version tag or Azure deployment was created. The published 1.0.0 image does not include this sixth room.
