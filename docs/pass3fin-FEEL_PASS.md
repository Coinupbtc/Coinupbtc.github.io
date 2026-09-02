# Feel-pass — coinupbtc.com (pass 3 D-Finish, 2026-08-15)

Cold open as a stranger. Surface: local preview at 390×844 portrait, 844×390
landscape, and 1280×800 desktop. Builds on art pass 1 (0729) + pass 2 (0812).
This covers the pass-3 interaction-craft layer (CP1 U1/U2/U3) + the D-Finish
deepen (D1 keyboard-hint, D2 marquee breath, D3 nav underline sweep).

## Five bullets

1. **Cold open — the hero breathes.** The marquee band under the hero scrolls
   and its acid separators pulse gently at rest (D2); the moment a pointer
   crosses it, the scroll pauses and an acid edge lights top and bottom (U1).
   It reads "alive but restrained" — motion that invites a second look, not
   motion that shouts.
2. **Primary path — the proof grid has depth.** Crossing any project card pans
   its image a few px opposite the cursor under the fixed frame (U2, parallax
   not tilt) while the art tiles keep their 3D tilt + glare. Built here feels
   dimensional in two different ways, side by side.
3. **Break / error — the lightbox teaches itself.** Open any tile and the
   viewer opens clean; press → or Esc once and a slim hint pill fades in at the
   top (D1): "← → browse · Esc close · +/− or scroll to zoom · drag to pan".
   No clutter on first open, discoverability on first key. Touch users never
   see it (correctly).
4. **Loading / empty — instant, no white flash.** Video tiles show posters
   before the mp4; theme flips light↔dark across the whole page in a single
   guarded crossfade (U3) that never animates transforms or layout — kinetic
   hover/magnetic transforms keep their own timing. States verified: loading
   (poster-first) ✓, empty N/A, error N/A, success ✓.
5. **Would a stranger keep this? yes.** Every accent is the same acid
   (#c8f54a); new motion reuses the existing accent language rather than adding
   a second vibe. Nav links now underline-sweep on hover and hold an acid
   underline on the active section (D3) — wayfinding reads while it feels.
   Residual: deploy is still a local push (per constraints).

## Plain-English primary copy
- Brand: **Coinupbtc** — "I don't rent intelligence — I host it."
- Proof grid: "Built here, shipped open" — the verbs, not the stats.
- Systems: "Hardware behind the proof" (121 GB, 3.7 TB, ~35–38 t/s).

## States
- loading: poster-first video tiles, no blank flash ✓
- empty: N/A (no empty-state surface)
- error: N/A (no forms/remote calls)
- success: hero + proof + art + lightbox all render/respond ✓

## Evidence (committed, docs/screenshots/)
- pass3fin-phone-portrait.png   (390×844 @2x, dark)
- pass3fin-phone-landscape.png  (844×390 @2x, dark)
- pass3fin-desktop-hero-light.png / -dark.png
- pass3fin-desktop-projects-dark.png
- pass3fin-lightbox-hint.png (D1 pill + zoom controls visible)

## Black-box verification
See workspace pass3fin_proof.js — 26/26 checks: regression on shipped pass1/2
interactions (magnetic CTA, hero tilt, art-tile tilt, count-up, scroll progress,
plate trace, lightbox slide) all still alive under the new theme transition;
all three new features behave as designed; iPhone 390/844 + 844/390: one-column,
44px touch, no overflow, zero JS errors, zero local 404s.
(The single transient 404 CP1 saw was an external fonts.gstatic.com woff2 flake
— no local-asset 404 reproduced across load/full-scroll/hover-all/slide-all.)

Date: 2026-08-15
