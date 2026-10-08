# Freight Exchange implementation

Date: October 8, 2026
Status: Playable room five; technical checks passed. Human acceptance pending for this new room.

## Delivered behavior

- Added the audited Freight Exchange definition after Handoff Workshop without changing either room's spatial rules. The historical standalone/frozen profiles remain intact.
- Room four now offers the fifth room through existing matching partner consent. Room five is directly selectable through the same consent-bound menu.
- Players recover the crate from bay 18 and park it on the marked Relay 6 dock, then reach A's exit 4 and B's exit 10. Both robots necessarily transport cargo under this map's geometry.
- Final completion retains Practice again and Leave room. Browser-local completion history marks room five green. Replay restores the fifth room's crate start at 18.
- Entry copy and documentation now describe five playable rooms. Existing F/touch Pull controls and first-success learning are reused.
- No image was built or published, and Azure was not updated. The source version remains 1.1.0; subsequent changes are recorded under Unreleased.

## Verification

All **82 automated tests passed**. Coverage includes the entire five-room progression and final replay, fifth-room selection with distinct consent, exhaustive crate preview agreement with the engine, the physical handoff and final extraction, and a real two-seat WebSocket completion/replay witness.

The wire witness follows the production connection rate limit. Its initial unpaced run triggered the existing token bucket; pacing the test resolved the failure without weakening application protection.

The design audit now asserts equality between the production definition and [authored JSON](../game/research/freight-exchange.json). It verifies 2,000 reachable configurations, all recoverable, a shortest 30-step completion and no completion when only one role can transport the crate. [Audit report](freight-exchange-validation.json).

A browser-controlled A with the development scripted B completed the exact 30-step route. Observed checks included:

1. The menu lists Freight Exchange as the fifth room, and the HUD shows ROOM 05 / 05.
2. A pulls the crate upward from 18; B takes over and pulls it through 12 into 11.
3. A leaves Relay 8, then pulls the crate out of the unpowered Gate 11 onto Relay 6. The UI confirms parking and still requires both exits.
4. Final completion shows Practice again and Leave room, with no next-room button. The menu applies the green `level-completed` class to Freight Exchange.
5. Practice again resets the room and crate. The scripted partner subsequently advances, so the browser's observed replay counter is three moves rather than the initial zero verified in the wire test.

At 390x844 and 844x390, the document had no horizontal or vertical overflow. The dock marker and `→ Gate 2` coexist with the crate and parked state. These are browser viewport checks, not physical-phone tests or two-human playtesting.

## Screenshots

- [Desktop room](freight-exchange-desktop.png)
- [Phone-sized board](freight-exchange-phone.png)
- [Landscape parking confirmation](freight-exchange-parked.png)
- [Final result with replay and exit](freight-exchange-complete.png)

## Next human check

Play the newly added room with a partner and observe whether the cargo handoff and removal from an unpowered doorway are understandable. Prior human testing covered the earlier rooms and usability changes; it does not establish that Freight Exchange is enjoyable or sufficiently clear.
