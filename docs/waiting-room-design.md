# Waiting Room Visual Refresh

Date: October 8, 2026
Status: Implemented; browser visual review pending

## Intended experience

After creating or joining a room, show a welcoming workshop lobby, two robot seat cards and a large invitation code. Continue the entry screen's cream/green palette with blue Robot A and pink Robot B. Highlight the local player's seat with You and the other with Partner. Show Connected, Waiting for a player, Reconnecting or Checking connection in words; color is supplementary.

The existing room-code element and copy action remain single instances. Instructions explain sharing the URL/code and using a private window or separate browser profile on one computer. Existing connection status, pause countdown, takeover/reconnect actions and Leave remain available. Automatic mission start and legacy start behavior are unchanged.

## State and layout

waiting-screen applies only to an admitted room without a mission. The crew panel hides when the mission starts. Existing compact in-game room details remain unchanged apart from a span wrapping the Room label. Disconnected/replaced local transport never presents old crew snapshots as live: cards show Checking connection until authoritative updates resume. Two responsive cards use minmax(0,1fr), compact mobile labels and a wrapping invitation paragraph. Copy and Leave have at least 44-pixel targets. Decorative robot shapes are CSS and hidden from assistive technology.

## Verification

Pinned TypeScript build passed. HTML parsing confirmed unique IDs and all new/existing lobby bindings. Changed files contain English text only. Source checks cover local A/B labeling, missing/connected/disconnected seats, inactive local controller, hidden-state precedence and responsive dimensions. No gameplay/lifecycle or command schema changed. Browser automation failed during environment setup, so visual desktop/mobile verification is pending and no screenshot is claimed. Runtime asset checks after restart verify that the new markup, CSS and client are served.
