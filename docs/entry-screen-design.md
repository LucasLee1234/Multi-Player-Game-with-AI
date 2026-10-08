# Entry Screen Visual Refresh

Date: October 8, 2026
Status: Implemented; browser visual inspection pending

## User outcome

Make the initial create/join screen welcoming and easier to understand while keeping two direct actions. Use a warm cream workshop palette, green primary action, blue/pink cooperative robot illustration and compact game facts. The illustration is decorative inline SVG, with no external asset request or new dependency.

## Layout and behavior

Desktop: introduction and workshop illustration share a row; two cards explain creating a room or joining a friend's six-character code. At widths up to 600 pixels, both sections stack. Inputs and actions retain their existing IDs, semantic form, validation, disabled/connection behavior and visible focus outlines. The code field has an associated label and help text. Decorative SVG is hidden from assistive technology and has no interactive controls.

The entry-screen body class follows absence of an active room. Entry styling is scoped to that state; the illustration and metadata hide after admission. Existing room/game controls and gameplay rules are unchanged. Connection and error messages remain visible. No player account, hosting claim or new public deployment is introduced.

## Verification

Pinned TypeScript build passed. HTML parsing confirmed unique element IDs, the single join form and required client bindings. Modified files contain English text only. Responsive source inspection checked min-width:0, flexible input sizing, stacked cards, 48-pixel-or-larger action controls and existing hidden-state precedence. Browser automation failed during environment setup, so actual desktop/mobile rendering and visual contrast have not yet been verified. This evidence does not claim a screenshot or a successful visual pass.
