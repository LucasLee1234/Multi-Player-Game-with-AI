# Unpowered gate occupancy

## Player rule

A hold-open gate needs continuous power from its linked relay. If power stops while a robot occupies the doorway, the robot remains safe and can walk onto a clear adjacent tile. The doorway is exit-only until power returns. Leaving does not permanently unlock the gate; re-entry still requires relay power. Latching gates retain their existing permanent-unlock rule.

In a crate room, turn Pull OFF to walk out. Pulling would move the crate into the unpowered doorway and still requires relay power. Walls, map edges and partner occupancy continue to block movement.

## Presentation

- The occupied, unpowered doorway has an amber dashed border and an `Exit only` label. It no longer looks like solid bars closed through the robot.
- The affected player's objective temporarily explains safe departure and names the relay needed for returning. The normal objective returns after departure or restored power.
- Gate inspection and menu instructions explain the same rule. Compact landscape layouts retain the exit-only label.
- This is a clarification of the existing authoritative movement rule. No extra gate power, permanent unlock, teleportation or damage is introduced.

## Verification

- All 79 tests passed. The pressure-gate regression verifies that power loss leaves the robot in place, both departure directions remain available, re-entry is blocked and restoring relay power permits entry.
- A browser session with a development scripted partner reproduced A on Gate 11 while B left Relay 8. The amber exit-only state and corrective objective appeared. A walked up to tile 6; a subsequent downward request was rejected with the correct Relay 8 instruction.
- At 844x390 the page had no overflow. [Verified doorway state](gate-exit-only-preview.png).
- The local server runs the updated client. The immutable v1.0.0 image and Azure deployment require a separate versioned release to receive this change.
