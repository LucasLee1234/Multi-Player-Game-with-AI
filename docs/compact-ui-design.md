# UI-01: Compact factory interface

Status: Implemented locally

## Intent

The participant requested a simpler interface before more gameplay. Keep both implemented rooms and the independent control contract. Make the map and directional controls prominent, reduce repeated information and improve feedback without changing authoritative rules. Crate work remains deferred to SF-03.

## Presentation decisions

- Warm neutral background, restrained teal controls and separate blue/pink robots.
- Compact title and role badge during play; room invitation, connection details and Leave in an expandable Room panel. The waiting lobby keeps this panel open; a new mission collapses it.
- Keep routine connected status quiet; errors, pause, connection recovery and explicit copy feedback remain visible.
- Short objective and room/move count. Rules, room hints, symbols and ping details are expandable. Tile pings remain visible as dots.
- Map-native symbols and short labels: Relay, Latch, Hold and Exit. Complete gate type/state, tile ID and robot ownership remain in accessible button labels and relay-link inspection.
- Direction buttons form a familiar arrow pad next to the map controls on desktop, and below the map on narrow screens. Buttons remain 52 by 52 CSS pixels. Arrow keys/WASD and implicit waiting are unchanged.
- CSS robot-step, gate power and blocked-action feedback; animation never delays or decides server state. Reduced-motion preference disables animation and transitions.
- No new assets, runtime dependencies, AI calls, sound, levels or server/protocol changes.

## Verification

Compilation succeeded and all 61 retained gameplay/session tests passed. Browser A with the development-only scripted B completed First Connection in six moves, advanced through Next room and completed Trade Places in sixteen moves. Expanded room controls, Leave and room hints were checked. Computed animation names verified robot-step, power-flash and blocked-flash; blocked pressure-gate attempts retain the move count and explanation.

At viewport width 390 and height 844, document client/scroll widths were both 375, directional button width was 52, and the movement-controls bottom was approximately 761.9 CSS pixels. The map and controls therefore fit this inspected viewport without horizontal scrolling. Screenshots were inspected; temporary viewport override reset. Actual phone touch and independent human observation remain pending. Copy/recovery visibility was corrected in final source and compiled; the full browser route was run before that narrow wording/visibility correction.

Evidence: [desktop](evidence/compact-ui-desktop.png), [phone-width emulation](evidence/compact-ui-phone.png). Disposable test room closed; helper stopped. Local Git checkpoint only.

## UI-02: Gate-rule clarity (October 8, 2026)

Participant feedback: Gate 2 appeared open with Relay 6 empty. Inspection found it was correctly latched, but short labels did not explain persistence clearly enough.

Gate tiles now show their gate ID, linked relay ID, behavior (Stays open or Hold relay), and current state (Closed, Powered or Locked open). These labels are visible without expanding help. Inspection of a latched gate explicitly says the relay is no longer needed. Pressure-gate inspection says to keep the linked relay occupied. Accessible labels include the complete rule, and the compact symbol legend uses the same language. No gate mechanics, map, transport or scoring changed.

Verification: TypeScript compilation passed. Scripted-partner browser inspection completed the six-step tutorial, confirmed the locked-open explanation, advanced to Trade Places, and checked both rule labels. At width 390, document client/scroll widths were both 375; unoccupied and occupied gate tiles had client/scroll heights both 94, with no content overflow. Viewport override reset; disposable room/helper closed. Actual phone touch and human understanding of these new labels remain unverified.

Screenshot: [gate-rule clarity](evidence/gate-rule-clarity.png). SF-03 crate work remains the next gameplay cycle.
