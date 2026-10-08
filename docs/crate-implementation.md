# SF-03: Keep the Power On

Date: October 8, 2026
Status: Implemented and verified locally

## Bounded outcome

Add the third authored room after Trade Places. Preserve independent movement and the compact interface. One crate starts at 12; service bay 9 is floor. Win requires A at 4, B at 10 and the crate at Relay 8. The crate powers a relay while occupying it. No enemies, timers, damage, inventory, extra players or runtime AI.

## Ordered transport rules

Walk into the adjacent crate to Push. Select the visible Pull toggle and step away with the crate directly behind the robot to Pull; select Move again to resume walking/pushing. Robot and crate commit atomically. Walls, boundaries, a closed entry gate or occupied partner space block the complete request without adding a move. Closed-gate occupants may leave; a crate entering their former tile still needs power. Latching gates persist after robot or crate entry. Current authoritative positions determine power and occupancy.

The new crateMove command includes mission ID, own from position, crateFrom and movement kind. Seat/controller/request/sequence checks remain. If either own or crate position changed, reject the stale command; never reinterpret it as a new push. Unrelated partner walking does not invalidate crate position. Duplicate/reconnected replay cannot execute again. Crate manipulation is independent and serialized, replacing historical simultaneous-handler cancellation.

Matching Next progresses from room two. Retry resets the current room including crate, pings and latches. Pause preserves crate and robot state while clearing transition choices. The final room offers Retry/Leave. Both exits and crate power are shown as separate objective checks.

## Required verification

Actual engine reachability/reverse recovery, 18-step shortest witness, push/pull boundaries and partner conflicts, sustained-power result, command deduplication/staleness/reconnect/retry, real two-client transport, and compact desktop/narrow browser controls. Research counts alone are not implementation evidence. Human enjoyment and actual phone/public networking remain separate obligations.

## Actual implementation evidence

The October 8 build passes all 67 automated tests. The production campaign regression completes First Connection, Trade Places and Keep the Power On in order and resets the final room. Prior two-room comparison tests explicitly use the frozen twoRoomAdventure profile; the production profile continues to use foundryAdventure. The new wire test completes the actual third-room route on two independent HTTP/WebSocket sessions and compares both public mission snapshots after every move.

Actual TypeScript exploration found 2,496 states and 23,300 accepted directional requests (including blocked transitions), all with completion paths. The shortest witness is 18 successful individual moves. This counts positions and the latch state, excluding histories, pings and transient connection metadata. It proves recovery for this authored map/rule state space, not arbitrary future maps or human puzzle understanding. Boundary tests cover off-map pushing, partner occupancy, pulling into a closed gate, leaving a closed gate, both exits without target delivery, stale crate state, accepted pull replay, pause/reconnect and current-room reset.

Browser A with the development-only scripted B advanced through all three rooms. In room three, A pulled the crate from 12 to 13, walked around through service bay 9, and pulled it from 13 to Relay 8. A then stood at 3 while B crossed powered Gate 11 and reached Exit 10; no robot occupied Relay 8. A reached Exit 4 to finish in 22 team moves. Practice again retained room three, reset crate to 12 and reset Pull to Move; scripted B immediately took three new moves, so the displayed retry counter was 3 rather than 0. The automated reset test verifies the zero-move boundary directly.

At a 390-by-844 emulated viewport, measured document width was 375 pixels, no horizontal overflow, and the Pull button was 44 pixels tall. Screenshot: [narrow crate room](crate-room-narrow.jpg). Viewport override was restored and the disposable room was closed. This is browser emulation and a scripted partner; actual phone/touch, independent two-human enjoyment and public networking remain unverified.

A regression run exposed an existing close-order race in the oversized WebSocket test: the client's close event may occur before the server updates pause state. The test now awaits the observable server pause with a two-second bound while retaining close-code and untouched-sequence assertions. No production lifecycle rule was relaxed.

## Next bounded cycle

Observe a first-time partner: can they distinguish Move and Pull, place the crate without explanation, and recognize crate-supplied power? Record confusion and each player's active/waiting time before adding another mechanic. Check actual phone controls and public two-device networking when the hosting prerequisites are available. G2/G3 stay open; local solvability is not prize qualification or an enjoyment result.
