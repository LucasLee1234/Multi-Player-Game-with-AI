# Room Six: Conveyor Handoff

## Purpose

Teach one new mechanism through the existing cooperative layout: B holds Relay 8 while A reaches Switch 16; a powered belt carries the crate from 12 through 13 to Dock 18. Both robots then reach their exits. Team signals support requests to hold power and clear a tile.

## Rules and acceptance criteria

- The belt follows the visible arrows on 12 → 13 → 18. Tile 18 is both the end and the crate dock.
- A robot must hold Switch 16. The crate cannot power the belt itself.
- Accepted robot moves settle the powered belt to its furthest clear tile in the same server transaction. There is no timer, reflex challenge or extra confirmation button.
- Occupied tiles and closed gates stop the crate before entry. Clearing a robot or supplying power during a later accepted move resumes transport.
- Crates on intermediate belt tiles use the belt instead of manual push/pull. Manual handling is available at the end; feedback explains this restriction.
- Failed moves, signals, duplicate commands and disconnected rooms do not advance the belt. No crate/robot overlap is permitted.
- Completion requires Dock 18 and both robot exits. Restart and room selection retain existing mutual consent.

## Verification gate

Use the production engine to enumerate spatial states and reverse-search from success. Every reachable configuration must be recoverable. Check blocked routes, gate power, switch departure, manual handling, command replay, client previews and six-room progression. Verify arrows, dock and switch in desktop and narrow layouts. Automated recoverability is not evidence of human enjoyment.

This is a source-only iteration. No Docker publication or Azure deployment is authorized in this cycle.
