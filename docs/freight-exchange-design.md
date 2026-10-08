# Freight Exchange: Fifth-Room Design

Date: October 8, 2026
Status: Implemented as room five after the 1.1.0 source checkpoint.
Baseline: Four existing rooms retained. [Implementation and current evidence](freight-exchange-implementation.md).

## Experience and novelty

Recover a crate from the lower loading bay and return it to the marked Relay 6 dock. Room four allows either robot to do all crate transport. This room's geometry requires both robots to transport it: one retrieves the freight, the other takes it through the shared corridor, then the first finishes the delivery.

The intended conversation is "I have it; hold the relay while I take over." Existing controls are sufficient. There are no timers, additional action buttons, compulsory touch counters or new gate types. The novelty is a physical cargo handoff and changes of direction, rather than a larger map. Enjoyment and difficulty remain hypotheses until the new room is played.

## Exact layout

Cell IDs use `y * 5 + x`. Preserve the five-column, four-row board footprint from Handoff Workshop.

```text
IDs                         Initial contents
00  01  02  03  04          A    .   G2   .   EA
05  06  07  08  09          #   D/R6  #  R8    .
10  11  12  13  14          EB  G11   .  G13   B
15  16  17  18  19          #   R16   #   C    #
```

`D`: marked crate dock; `R`: relay; `G`: gate; `C`: crate; `EA/EB`: exits; `#`: wall. The proposal is stored in [freight-exchange.json](../game/research/freight-exchange.json).

| Element | Cell / linked cell | Rule |
| --- | --- | --- |
| A start / exit | 0 / 4 | Independent movement |
| B start / exit | 14 / 10 | Independent movement |
| Crate start / target | 18 / 6 | Push and Pull with existing controls |
| Gate 2 / Relay 6 | 2 / 6 | Latching |
| Gate 11 / Relay 8 | 11 / 8 | Continuous power |
| Gate 13 / Relay 16 | 13 / 16 | Continuous power |
| Walls | 5, 7, 15, 17, 19 | Impassable |

Completion requires A on 4, B on 10 and the crate on 6 simultaneously. The target also powers Relay 6, although Gate 2 may already be latched. Do not imply that parking powers Gate 11 or Gate 13.

## Verified cooperation sequence

One shortest route has 30 successful individual moves. Waiting and mode switches are not counted. This is an implementation witness, not a walkthrough displayed to players.

1. A moves `1 → 6`; B moves `9 → 8 → 3 → 2`, latching Gate 2.
2. A moves `1 → 0` to clear the passage; B moves `1 → 6`. A then moves `1 → 2 → 3 → 8`.
3. With A holding Relay 8, B moves `11 → 16`, powering Gate 13.
4. A moves to 13 and **pulls upward to 8**, moving the crate from 18 to 13. A now powers Gate 11 again.
5. B moves `11 → 12`, then **pulls left to 11**, moving the crate to 12. B **pulls left to 10**, moving the crate to 11. A must remain on Relay 8 during these cargo entries.
6. A switches Pull OFF and walks `3 → 2 → 1 → 6`. Gate 11 loses power while the crate remains inside. A **pulls upward to 1**, moving the crate from 11 onto the Relay 6 dock. This removes the crate from the unpowered doorway; it does not enter a closed gate.
7. A switches Pull OFF and moves `2 → 3 → 4`. B is already at Exit 10; the room completes.

The crate takes a north–west–north route: `18 → 13 → 12 → 11 → 6`. Both robots must transport it under the existing rules. Other valid routes remain allowed; this witness is not a required ordering.

## Readability and difficulty

- Mark cell 6 with the existing crate dock treatment and `Park crate here`, alongside `→ Gate 2`. Keep destination, relay and gate labels explicit.
- Initial objective: `Park the crate on Relay 6, then reach both exits.` After delivery, retain the existing parked-crate confirmation.
- Reuse first-success Push/Pull learning. Experienced players receive no repeated mandatory tutorial. The existing visible Pull control and direction feedback remain available.
- Suggested optional room hint: `The lower bay needs a northward pull. Trade relay support to bring the crate through the left passage.` Do not expose the full witness by default.
- A crate can safely remain on an unpowered gate and can be removed toward a legal destination. If observation shows confusion here, add crate-specific doorway guidance; do not falsely label crate occupancy as robot exit-only behavior.
- This room is intended to be moderately harder than room four. The 30-versus-26 shortest-move comparison measures route length, not human difficulty or completion time.

## Verification evidence

The [audit](../game/research/freight-exchange-audit.mjs) calls the compiled production `moveFoundry` engine for both robots and both Move/Pull actions. It records spatial configurations and latch state; invalid/blocked attempts do not create movement edges. Success is terminal.

The [machine-readable report](freight-exchange-validation.json) records:

| Check | Result |
| --- | --- |
| Reachable configurations | 2,000 |
| Successful transition edges | 6,528 |
| Terminal success configurations | 1 |
| Recoverable configurations | 2,000 |
| Unrecoverable configurations | 0 |
| Shortest completion | 30 moves |
| Maximum shortest recovery distance | 38 moves |
| Only A transports the crate | No completion |
| Only B transports the crate | No completion |
| Only one robot moves | No completion for either role |

These findings establish solvability, structural cargo cooperation and recovery under the current movement engine. They do not establish UI fit, network behavior, fun, player comprehension or absence of every application-level failure.

Reproduce after compiling: `node game/research/freight-exchange-audit.mjs` from the repository root. The report includes the compiled engine SHA-256; re-run if the rules or layout change.

## Implementation short loop

- [x] Specify the map, completion condition and intended handoff.
- [x] Verify a shortest witness, all-state recovery and both-role cargo involvement.
- [x] Add the authored mission after Handoff Workshop; keep earlier regression profiles intact.
- [x] Expand campaign, level-choice and final-room replay tests from four to five rooms.
- [x] Check that room four offers Next room and room five offers replay and exit.
- [x] Extend crate preview audits to the new map; add a wire witness for the cargo handoff and closed-doorway crate removal.
- [x] Inspect dock/relay label coexistence, mode switching and gate occupancy on desktop, 390x844 and 844x390.
- [ ] Play the new room with two people and record where the handoff becomes unclear.
- [x] Update playable-room counts after implementation and technical verification; keep human acceptance explicitly pending. No Docker publication.

## Scope boundary

The fifth room is now playable using the existing authoritative rules and controls. No database, new persistence scheme or server scaling change was needed. Human enjoyment and comprehension remain to be assessed for this new room; earlier playtest feedback does not establish acceptance of a level that did not yet exist.
