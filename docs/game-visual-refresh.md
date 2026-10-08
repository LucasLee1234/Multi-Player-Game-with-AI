# In-Game Workshop Visual Refresh

Date: October 8, 2026
Status: Implemented and inspected in the browser

## Scope

Unify the playing screen with the entry/waiting-room workshop palette. Blue/pink robots and matching exit tiles identify each player's destination. Code-native SVG machinery icons replace font-dependent relay/gate/exit glyphs; textual gate kinds, states, links, tile numbers and accessible labels remain. Decorative icons/robots are hidden from assistive technology. The crate has a wooden face and a short movement animation; its empty dock remains dashed and labeled Park C here, becoming a labeled green dock when parked.

Direction controls occupy a tactile panel; crate controls use a warm transport panel with a visibly selected Pull state. Brief move/power animations remain; blocked gate/pull messages gain a feedback color and shake. Reduced-motion settings disable animations/transitions. The completion panel uses the same palette. No movement, cargo, lifecycle, scoring or command rules changed. Mid-room restart and extra levels are not part of this visual cycle.

## Verification

Pinned TypeScript build passed after resuming saved changes. Browser tooling recovered. An allowed fresh localhost tab was used because an earlier tab displayed a browser error page. The default three-room server was running. Browser A and development-only scripted B advanced through all three rooms with visible buttons.

A deliberate closed Gate 11 entry in Trade Places left A at 12 and the count unchanged, showing the gate/relay explanation. A deliberate Pull request at third-room start left A at 0 and displayed Pull needs the crate directly behind you. Switching back to Move allowed Right 1. Pull operations moved the crate 12 -> 13 -> 8; the parked dock and powered Gate 11 were visible before extraction. Both exits completed room three in 22 successful moves. The result panel and Practice again button were visible. This is scripted interaction, not a two-human or actual phone test.

Desktop map/icons/control layout inspected by screenshot. At 390-by-844 emulated viewport, document width measured 375 pixels. No tile had scrollHeight more than two pixels above clientHeight, before or after delivery. All four visible direction buttons measured 52 pixels high. [Full-page narrow screenshot](workshop-game-narrow.jpg) records crate on Relay 8, A at 3 and B at 10, with target/power labels and controls visible. Viewport restored and disposable room closed; server remains running. Existing 67-test rule evidence is unchanged and was not rerun for this presentation-only cycle.

## Follow-up

Inspect actual phone touch interaction and ask a first-time partner whether gate types, crate target and Pull are understood without coaching. Mid-room restart should be a separate functional cycle retaining both-player consent and current-room reset.
