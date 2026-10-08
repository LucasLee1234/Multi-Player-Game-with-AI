# Handoff Workshop Implementation

Date: October 8, 2026
Status: Implemented and running locally; human partner, actual phone and public deployment checks remain open.

## Behavior

Handoff Workshop follows Keep the Power On in the production campaign. The board matches the [validated design](handoff-workshop-design.md): five columns, four rows, gates 2/11/13, relays 6/8/16, crate start 12, dock 18, exits A4/B10. Both exits and the parked crate are required simultaneously. Pressure gate 13 requires live occupancy of relay 16; relay 8 alone never opens it.

The existing server-derived level catalog automatically includes room four. Matching consent from two distinct players is required to select it. Selecting a room does not award completion. Restart and replay reset positions, gates, crate and move count; completion history persists. Final success offers Practice again and Leave room.

Room progress now derives its total from the authoritative catalog rather than a release-ID constant. Local completion restore accepts positive integer stage IDs, so witnessed room-four completion is remembered; only catalog entries are rendered as selectable levels. Local marks are convenience history, not server authorization or submission evidence.

Objectives, menu cargo help and engine feedback distinguish an actual wired relay target from a parking-only dock. Room three retains Relay 8 wording; room four names Dock 18. Parking 18 does not falsely claim to power a gate.

No new controls or tutorial lessons were introduced. F and the existing touch mode control toggle Pull. Four-row boards use horizontal tile contents on short screens to keep robots, gate relay labels and parking markers inside their cells. Portrait and normal desktop retain the existing styling.

## Verification

- Full regression suite: **75 tests passed, zero failures**. Includes real HTTP/WebSocket checks, four-room progression, final fourth-room replay, consent-bound fourth-room selection/restart and original room-three extraction.
- One new fourth-room rule test checks gate-specific power, blocked partner return, parking without early completion, accurate dock feedback and the 26-step completion witness.
- Exhaustive actual-engine audit: **2,000 reachable configurations, all recoverable**, 6,526 successful action edges, shortest solution 26 steps. The audit asserts the registered production room equals its authored design JSON. [Results](handoff-workshop-validation.json).
- Initial sandboxed network tests failed because localhost connections returned EACCES. The complete suite was then run with local network access and passed. These were environment failures, not discarded gameplay failures.
- Actual browser A plus development-only wire B selected room four with consent, completed it in 26 moves, used F to pull and restore Move, observed the parked marker without premature success, replayed and saw the fourth-room green completion mark. Leaving through the menu returned to entry. This is scripted partner evidence, not a two-human playtest.
- Final build passed after the responsive fix. Final browser checks at 390x844 and 844x390 found document dimensions equal to the viewport with no page overflow. In the short landscape layout, rendered robot/name/parking-label bounds remained inside their tiles. No claim of actual phone testing.

The local server was restarted to serve the final assets; old in-memory rooms were not retained. The normal browser viewport was restored after responsive inspection.

![Fourth-room short-landscape layout](handoff-workshop-landscape.jpg)

## Next bounded check

Play with a first-time friend. Observe whether they recognize Dock 18, distinguish relays 8 and 16, understand the Pull-to-Push turn and remember to return for the support robot. Record waiting, confusion and replay interest before adding more content. Public access and release preparation remain separate unfinished work.
