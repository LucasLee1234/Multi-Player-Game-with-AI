# SF-02: Shared passages and pressure gates

Date: October 7, 2026
Status: Implemented and verified locally; release `sys-05-shared-passage`

## Outcome and scope

Implement Trade Places (SF-M2) after First Connection. Preserve direct independent movement, automatic two-client start and idle waiting. Generalize server-authored geometry, starts/exits and gate types. Add a mutually selected Next room versus Practice again transition after success. No crates, new hosting, art generation or runtime AI in this cycle. Parent requirements: SR-03 through SR-08.

## Active rules

Use the map in [foundry-expansion-design.md](foundry-expansion-design.md), with the independent control contract from [independent-movement-spec.md](independent-movement-spec.md). Gate 2 links to Relay 6 and latches on first entry. Gate 11 links to Relay 8 and never latches. A closed pressure gate blocks entry, permits an occupant to leave, and causes no damage. Each request acts against current authoritative positions. Occupied destinations block; the partner must vacate first. Successful individual steps alone count.

Both robots can revisit starts and leave exits. A exits at 4; B exits at 10. Gate labels must distinguish Latching and Hold-open, using text as well as color. Floor dimensions and relay links come from the mission projection. First Connection retains its existing map and six-step route.

## Transition contract

After success in First Connection each seat chooses Next room or Practice again. Choices remain visible and revisable; mismatched choices do not advance. Matching Next choices start Trade Places; matching Retry choices restart the current room. A final room offers Retry and Leave. Requests bind to the completed mission ID. Duplicate delivery returns the cached acknowledgement without advancing again. Roles, credentials and command sequences continue. A fresh mission ID resets moves, pings, positions, latches and transition choices. Disconnect clears both choices and preserves the completed outcome; reconnection does not carry old consent forward.

## Acceptance checklist

- [x] First Connection regressions pass.
- [x] Actual Trade Places rule search matches 220 reachable states, with a shortest 16-step solution and no unrecoverable state.
- [x] Southern and northern routes complete under ordered independent moves.
- [x] Pressure gate closes without trapping its occupant; leaving the relay before entry blocks entry.
- [x] Occupied destinations block; vacated passages and parking spaces work; walls/wrap reject.
- [x] Mutually selected transitions, conflicting choices, duplicates, stale mission requests, retry and reconnect work in store and two-client transport.
- [x] Browser shows a 5-by-3 room, accurate gate labels and independent controls; narrow viewport has no horizontal overflow.
- [x] Save English documentation, actual verification evidence and a local Git checkpoint.

Human enjoyment, actual phone touch, public networking and contest readiness remain separate verification obligations. Research state counts do not substitute for testing the implemented engine.

## Verification

Sixty-one automated tests passed. [Actual rule/store tests](../game/tests/shared-passage.test.ts) enumerate 220 states and 876 directional requests; reverse reachability finds a completion path from every state. Southern and northern witnesses finish in 16 and 18 individual steps. [Two-client wire test](../game/tests/shared-passage-wire.test.ts) verifies matching/conflicting choices, cached duplicate delivery, shared completion and current-room retry. Store tests separately verify reconnect clears consent and replay cannot restore it.

Browser A with development-only scripted B completed both rooms, clicked Next room, published a relay ping, tested closed-gate feedback without a counted move, exchanged support and retried Trade Places. At viewport width 390, document client/scroll widths were both 375; the board was approximately 313.6 CSS pixels wide with five columns. The override was reset. Evidence and limits: [test-evidence.md](test-evidence.md).
