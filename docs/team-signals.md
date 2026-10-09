# Team signals

Date: October 8, 2026
Status: Implemented for independent Foundry rooms.

## Interaction

The speech-bubble button beside the game menu opens a small, nonmodal panel. Players can keep using movement keys while it is open, except when operating its gate selector.

- **Need power:** choose `Gate N · Relay M`; both players see `A needs Relay M for Gate N` and the relay receives an A/B-colored marker.
- **Hold position:** the server captures the partner's current tile. Both see `A asks B to hold tile N`. This is a request; movement remains available.
- **Got it:** send a short named acknowledgement. This does not accept restart or level-change requests.
- **Mark a tile:** the next floor-tile tap marks it without moving, including adjacent tiles. Escape, the close button or opening the game menu cancels marking. Normal nonadjacent tile taps also send a point signal.

Only the latest signal from each role is retained. Signals last six seconds and sending has a two-second per-role cooldown. Movement does not use that cooldown. Both roles can signal independently. Markers identify their sender and pulse briefly; reduced-motion settings disable the pulse.

The existing bottom feedback area displays messages; no new persistent row or page scrolling is added. Blocked-movement corrections take priority over team messages. The board remains visible when the optional panel is closed.

## Authority and lifecycle

The `communicate` command uses the existing authenticated room/controller envelope, command sequence, request deduplication and mission ID. Inputs are limited to four fixed kinds and valid floor targets. Power requests must name an authored gate. Sender identity comes from the authenticated seat. Hold and acknowledgement positions are derived by the server.

Communication is stored separately from the mission: it does not move robots or crates, power gates, consume moves, change readiness, or accept any shared decision. The server bounds storage to two latest messages and enforces the cooldown. Stale mission requests, paused play and invalid targets are rejected.

Signals from an earlier mission are omitted after restart, replay or level selection, and cannot impose a cooldown on the new mission. Server expiry is projected as remaining duration; the client expires a received message locally even when no later snapshot arrives. Expired records remain bounded and are replaced by the next signal.

## Verification

- All 84 automated tests passed, including cooldown/expiry with a controlled clock, unchanged mission state, movement during cooldown, duplicate request identity, room isolation, invalid gate/wall targets, spoofed fields, pause rejection and stale/reset isolation.
- Real two-seat WebSocket tests verify matching signal identity and content, acknowledgement delivery, then complete/replay crate rooms. Remaining duration is checked by bounds rather than exact equality across separately timed projections.
- Browser checks exercised power requests, target Relay 8 highlighting, continued movement, adjacent tile marking without movement, disabled cooldown buttons, automatic expiry, Hold position and Got it text.
- At 390x844 and 844x390 the page had no overflow. The optional panel can scroll internally on short screens. This is viewport verification with a development partner, not a two-human usability result.
- Subsequent presentation changes added a speech-bubble icon and gave blocked-movement feedback priority; the final TypeScript build passed.
- Final screenshots: [phone panel](team-signals-phone.png) and [named relay request](team-signals-request.png).

## Release boundary

Source-only change under the existing 1.1.0 development line. No Docker image or Azure deployment is included. Free-text chat, voice, chat history and a mandatory acknowledgement workflow are outside this iteration.
