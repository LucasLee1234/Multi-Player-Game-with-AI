# Conveyor Handoff: Implementation and Verification

## Delivered behavior

Room six uses the existing compact map and controls. Belt arrows mark 12 → 13 → Dock 18; Switch 16 also powers Gate 13. One robot supplies relay support so the other can reach the switch. The crate travels to the furthest clear belt tile within a successful robot move, stops before occupied tiles or closed gates and resumes after a later accepted move clears the route.

Only robots power the switch. Intermediate belt cargo cannot be pushed or pulled manually; the mode control instead says `Belt · Switch 16` and pressing F explains the required action. The first-use lesson is remembered in the browser and can be reopened in Menu → Controls → Show tutorial. Dock markings, team signals, sound, consent-bound level selection, restart and the final replay/exit flow remain available.

## Evidence

- All 94 automated tests passed, including obstacle stops/resumption, separate gate power, idle/failed commands, end handling, invalid authored paths, exhaustive client action previews, six-room progression and three real two-seat WebSocket completion/replay cases.
- `game/research/conveyor-audit.mjs` searched the compiled production engine: 318 reachable spatial states, 1,076 successful transitions, every state recoverable, shortest completion 20 moves, maximum shortest recovery 22 moves. The audit stops expansion at success and abstracts counters and command history; lifecycle and command correctness are tested separately. [Recorded report](conveyor-validation.json).
- Browser A with a scripted development partner selected room six, viewed and dismissed the new lesson, delivered the crate through switch activation, completed in 20 moves and used Leave room from the success screen. No console errors were captured.
- At 390×844 and 844×390 the page had no overflow. The landscape inspection identified an overlapping END label, which was removed in favor of the existing dock marker. A subsequent build passed, and the final UI was checked again for belt-specific F guidance and the corrected dock.

This is not independent two-human playtesting or an actual-phone test. The belt intentionally settles immediately instead of requiring timed movement. The next human check should ask whether both players understand the switch, arrow direction and safe waiting behavior without verbal coaching.

[Desktop](conveyor-desktop.png) · [Phone viewport](conveyor-phone.png) · [Landscape viewport](conveyor-landscape.png).

## Release boundary

Source-only update under 1.1.0. No Docker image, version tag or Azure deployment was created. The published 1.0.0 image does not include this sixth room.
