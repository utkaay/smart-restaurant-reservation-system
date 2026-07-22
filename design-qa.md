# Homepage Restaurant Discovery Design QA

## Comparison target

- Source visual truth: `assets/images/restaurant-discovery.png`
- Browser-rendered implementation: `artifacts/homepage-restaurants-1440x900-final.png`
- Local route: `http://127.0.0.1:8765/#restaurants`
- Viewport: 1440 x 900 CSS pixels
- Source pixels: 1440 x 900
- Implementation pixels: 1440 x 900 at `devicePixelRatio: 1`
- Density normalization: none; both images are 1:1 at the requested desktop size
- Comparison normalization: the source's 72-pixel global header was excluded because this task is section-only. Source pixels `(0, 72, 1440, 828)` were compared with implementation pixels `(0, 0, 1440, 828)` after aligning the start of `#restaurants`.
- State: logged-out homepage, default discovery plan, all six project restaurants loaded, no active search or facet filter

## Evidence

- Full-view comparison: `artifacts/restaurant-discovery-reference-vs-implementation.png` places the normalized source and implementation together at identical scale.
- Focused toolbar comparison: `artifacts/restaurant-discovery-toolbar-comparison.png` places the 1368 x 85 source and implementation toolbars together at 1:1 scale.
- Focused plan/card comparison: `artifacts/restaurant-discovery-cards-comparison.png` places the 1368 x 510 source and implementation result regions together at 1:1 scale.
- Responsive evidence: `artifacts/homepage-restaurants-1024x768-responsive.png`, `artifacts/homepage-restaurants-390x844-responsive.png`, and `artifacts/homepage-restaurants-390x844-card-responsive.png`.
- Above-section regression evidence: `artifacts/homepage-1440x900-after-discovery.png` is byte-for-byte identical to the previously approved `artifacts/homepage-1440x900-final.png` (matching SHA-256: `141DD52A80602673790DFB638D1D3D1F8F1EA7ED9D9D647C3C76249792783CAD`).

## Findings

- No actionable P0, P1, or P2 mismatch remains.
- [P3] Project data intentionally differs from mockup sample data
  - Location: result count, restaurant names, locations, badges, ratings, and restaurant photography.
  - Evidence: the source shows 12 sample restaurants headed by Olive & Ember, Saffron Room, and Noir Garden. The implementation shows the project's six existing restaurants and their existing image URLs, including Olive & Ember, Noodle House, and The Garden Table.
  - Impact: content and imagery are visibly different, while hierarchy, crop ratios, card geometry, and interaction patterns match.
  - Resolution: accepted because the user explicitly required preserving the existing restaurant data and badges.
- [P3] Plan date follows live homepage state
  - Location: `#discoveryPlanDate`.
  - Evidence: the mockup displays `Fri, 24 Jul`; the implementation displays the current hero-search value `Tonight` and stays synchronized when the hero form changes.
  - Impact: minor copy variance only.
  - Resolution: accepted because it preserves working search state instead of hard-coding mock data.

## Required fidelity surfaces

- Fonts and typography: Playfair Display is used for the section and restaurant display headings; DM Sans is used for interface and body text. Browser checks returned `true` for both fonts. Heading hierarchy, card-title truncation, weight, line height, and control density were compared directly.
- Spacing and layout rhythm: final browser measurements are heading `(36, 42)`, toolbar `(36, 159, 1368 x 85)`, plan rail `(36, 270, 193 x 510)`, first card `(250, 267, 417 x 514)`, image height `276`, and action row `(269, 724, 379 x 42)`. Desktop filter x positions are `447 / 585 / 733 / 851 / 989`, matching the reference within one pixel.
- Colors and visual tokens: the warm cream canvas, off-white surfaces, dark evergreen controls, muted sage chips, gold featured border, gold availability label, and low-contrast tan borders were matched from the source.
- Image quality and asset fidelity: existing project restaurant images remain real raster photographs and are rendered with measured `object-fit: cover` crops. No placeholder boxes, CSS drawings, emoji, inline SVG substitutes, or stretched screenshots were introduced.
- Copy and content: the static discovery heading, subtitle, filter labels, plan heading, availability label, `View tables`, and `Choose exact table` match the mockup. Dynamic restaurant content remains sourced from the application.
- Icons: all visible icons use the already loaded Material Symbols outline family with consistent size, weight, alignment, and selected states.
- Accessibility: search and facet controls have semantic labels, each card image has restaurant-specific alt text, favorite buttons expose `aria-pressed`, grid/list controls expose pressed states, booking CTAs retain descriptive accessible labels, and the search focus ring is visible.
- Responsive resilience: the toolbar wraps cleanly at 1024 pixels; the plan becomes a compact two-column summary and cards become single-column at 390 pixels. The focused mobile capture confirms both booking actions remain visible without clipping or horizontal page overflow.

## Comparison history

1. Pass 1 - blocked
   - Earlier P2 findings: the result section was not aligned to the mockup's content origin, the match icon rendered incorrectly, and the card content stack did not fit the measured card height.
   - Fixes: aligned the section, toolbar, rail, and card grid to the source coordinates; switched to the correct Material Symbol; constrained the card's internal flex tracks.
   - Evidence: `artifacts/homepage-restaurants-1440x900-pass1.png`.
2. Pass 2 - blocked
   - Earlier P2 findings: restaurant location collapsed to zero height, and booking controls extended below the card boundary.
   - Fixes: restored a fixed location row, removed inherited card-body gaps, reserved explicit badge/availability/action tracks, and verified a 42-pixel action row inside the card.
   - Evidence: `artifacts/homepage-restaurants-1440x900-pass2.png` and `artifacts/homepage-restaurants-1440x900-pass3.png`.
3. Pass 3 - passed after focused alignment refinement
   - Earlier P3 finding: the desktop facet group started 14 pixels too far right.
   - Fix: aligned the five measured facet controls to x positions `447 / 585 / 733 / 851 / 989` and retained responsive overrides below 1221 pixels.
   - Post-fix evidence: final full-view, toolbar, and plan/card comparison images listed above.

## Interaction and technical checks

- Main Discover navigation reaches `#restaurants` with the section below the fixed header offset.
- Existing hero search remains functional: `Mediterranean` returns Olive & Ember; clearing restores all six restaurants.
- Discovery search remains functional: `Japanese` returns Noodle House.
- Cuisine facet remains functional: `Mediterranean` returns Olive & Ember; reset restores six restaurants.
- All seven existing Olive & Ember badges remain in the rendered card and are horizontally available within the badge row.
- Time selection, favorite state, grid/list view switching, and clear/reset controls passed.
- Both card CTAs retain `data-restaurant-id`; `View tables` enters the existing Start Booking flow, navigates to login when logged out, and stores `{"type":"booking","restaurantId":1}` as the pending action.
- Browser console: no warnings, errors, or uncaught exceptions.
- Static checks: `node --check` passes for discovery, homepage, and QA scripts; `git diff --check` passes; all 28 homepage IDs are unique.

## Implementation checklist

- [x] Replace only the `#restaurants` heading, filters, plan rail, and restaurant-card presentation.
- [x] Preserve existing restaurant data, search, filtering, badges, and booking flow.
- [x] Match `restaurant-discovery.png` at 1440 x 900.
- [x] Keep the completed hero and curated section visually unchanged.
- [x] Verify desktop, tablet, mobile, keyboard focus, responsive card actions, and browser console state.
- [x] Leave every other page unchanged.

## Open questions

- None blocking.

## Follow-up polish

- Exact mockup photography should not replace the current project imagery unless the data-preservation requirement changes.

final result: passed

---

# Smart Concierge Header Parity Design QA

## Comparison target

- Source visual truth: `artifacts/header-parity/my-bookings-logged-in-1440-header.png` and `artifacts/header-parity/my-bookings-logged-in-390-menu.png`.
- Browser-rendered implementation: `artifacts/header-parity/concierge-logged-in-1440-header.png` and `artifacts/header-parity/concierge-logged-in-390-menu.png`.
- Combined comparison evidence: `artifacts/header-parity/comparison-logged-in-desktop.png`, `artifacts/header-parity/comparison-logged-out-desktop.png`, and `artifacts/header-parity/comparison-logged-in-mobile.png`.
- Desktop viewport: 1440 x 900 CSS pixels; header crops are 1440 x 77 pixels at devicePixelRatio 1.
- Mobile viewport: 390 x 844 CSS pixels; open-menu crops are 390 x 447 pixels at devicePixelRatio 1.
- States: logged in, logged out, open mobile navigation, and desktop after scrolling 600 CSS pixels.
- Density normalization: none required; source and implementation were captured from the same browser, viewport, scale, and device pixel ratio.

## Findings

- No actionable P0, P1, or P2 mismatches remain.
- Fonts and typography: the computed family, size, weight, line height, and link typography match the source header.
- Spacing and layout rhythm: header and inner geometry, brand position, navigation spacing, avatar, logout, CTA, border, and open mobile panel match. There is no horizontal overflow.
- Colors and visual tokens: both pages inherit the same dark-green, ivory, and gold shared-header values. The gold underline has the same computed thickness and vertical position.
- Image quality and asset fidelity: neither header uses raster imagery; the existing typographic JACK'S mark is identical in both captures.
- Copy and content: shared navigation, brand subtitle, logout, and CTA copy match. The active item differs intentionally: My Bookings in the source and Smart Concierge in the implementation.
- Icons and states: the Concierge initials control shows `AR` only. Its `::before` content computes to `none`, so the obsolete person glyph is gone. Logged-out My Bookings follows the approved authentication redirect and therefore marks Login active; Concierge correctly marks Smart Concierge active.
- Behavior and accessibility: the mobile menu opens with the same control and layout, persistent controls remain visible, and both desktop headers stay at top `0` after scrolling.

## Comparison history

- Initial finding [P1]: Concierge rendered an extra `person` pseudo-element beside the avatar initials. Fix: removed the obsolete Concierge-only `#authNavLink::before` rule. Post-fix evidence: desktop and mobile combined comparisons show the same initials-only avatar as My Bookings.
- Initial finding [P2]: legacy Concierge-only header selectors duplicated and could override the approved shared header. Fix: removed the unused desktop and responsive header overrides from `styles/concierge-page.css`. Post-fix computed-style checks show parity for all requested header surfaces.

## Browser verification

- Primary interactions tested: logged-in identity/logout rendering, logged-out navigation, mobile menu open, and sticky header after scroll.
- Browser console: no errors or uncaught exceptions in the tested states.
- Focused comparison evidence was used because the header itself is the complete visual target; a separate full-page comparison would introduce intentionally different page content and reduce precision.

## Implementation checklist

- [x] Remove the extra Concierge person icon.
- [x] Remove obsolete Concierge-specific header overrides.
- [x] Match desktop geometry and visual styling.
- [x] Match logged-out structure and styling while preserving auth behavior.
- [x] Match the 390 x 844 open mobile navigation.
- [x] Verify sticky behavior and no horizontal overflow.

final result: passed
