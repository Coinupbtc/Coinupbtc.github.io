# Pass 3 — ART + LOOK + FEEL deep-improve (D-CP1 plan)

**Task:** t_cbbd56a8 · SMART TEAM D-CP1 (dobby)
**Goal (shared):** forward generative/wow + interaction-craft pass 3, building on art pass 1 (0729) and pass 2 (0812, feel-passed). Do NOT redo shipped work. Standing direction (locked): improve how the site LOOKS and how click/hover/scroll FEELS.

## What is already shipped (do not redo)
- Art pass 1 + 2: cinematic H3 hero backplate, topology plate + signal trace + pulse, video-first gallery, mosaic tile, dark mode, canvas generative node-field, hero 3D tilt + spark trail, magnetic CTAs, char-stagger entrance, reveal-on-scroll, count-up, marquee band, scroll progress + back-to-top, acid spotlight on cards/art, art-tile 3D tilt + glare + captions, lightbox zoom/pan/preload/slide.

## CP1 scope — 3 NEW forward interaction-craft upgrades
Chosen to add *net-new* feel that pass 1/2 did not touch. Each has its own acceptance.

### U1 · Marquee micro-interaction (hover = pause + acid edge)
The marquee band currently scrolls and ignores the pointer. Add: hovering the band pauses the scroll and raises an acid border glow so the strip feels alive and browsable.
- Files: `css/style.css` (marquee block), `js/main.js` (hover pause toggle).
- Acceptance: `pointer: hover` users — mousenter pauses animation (via JS pausing the CSS animation), mouseleave resumes; an acid top/bottom edge light appears on hover. Reduced-motion stays static. On `pointer: coarse` (phone) nothing changes.

### U2 · Proof-card cursor parallax (depth on the project grid)
The art tiles tilt with the cursor but the **project cards** only scale on hover (flat). Add pointer-follow parallax to the `.card-top img` — the image shifts slightly opposite the cursor, giving the proof grid the same dimensional feel as the art. Distinct from U3 (no tilt, just image depth under the fixed card frame).
- Files: `js/main.js` (card parallax block), `css/style.css` (set `will-change` + a `.card-top.px` class to avoid fighting the hover scale).
- Acceptance: moving the pointer across a card shifts its image a few px opposite the cursor; resets on leave; desktop/coarse-pointer only; reduced-motion off; touch unaffected.

### U3 · Theme crossfade polish (dark ⇄ light stops snapping)
Today only `body` crossfades; nav cards/sections still snap color on toggle. Add a **guarded** global color/background/border-color transition so the whole page crossfades — but scope it so it never animates transforms or layout props, and never conflicts with the kinetic transforms already applied via inline style.
- Files: `css/style.css` (a `html.theme-anim *` rule injected via JS only while toggling, removed after ~500ms so it never degrades scroll/hover perf).
- Acceptance: toggling theme crossfades background, text and borders page-wide instead of snapping; transitions are removed immediately after the toggle settles so kinetic transforms (magnetic CTAs, card hover, tilt) keep their own timing; reduced-motion users get an instant swap.

## What lands on this CP1 card
U1 + U2 land as working repo edits (smoke-checked in-browser). U3 lands too (low-risk, pure CSS polish) but its full crossfade verification is confirmed in the smoke pass. This is a natural checkpoint — full page we-feel/regression and the remaining polish queue are for D-Finish (see below).

## How S-Look1 should inspect
1. Serve: `cd ~/Documents/projects/portfolio-site && python3 -m http.server 8765` (or `./setup.sh`).
2. Open `http://127.0.0.1:8765/`.
3. **U1:** hover the marquee band (light gray strip under the hero) → it pauses + acid top/bottom edge appears; move off → resumes.
4. **U2:** move the cursor across any project card in `#projects` → the image inside panes opposite the cursor under the fixed frame.
5. **U3:** click the sun/moon top-right → whole page crossfades (not jump cut); click again → back.
6. **iPhone 390×844 portrait:** toggle theme top-right, hover is N/A (touch), marquee auto-scrolls normally; run `??` (there is no phone simulator here — confirm touch variants just no-op by checking the coarse-pointer guards in the code).

## Evidence
- In-browser screenshots (desktop light + one dark) in `docs/screenshots/` (pass3-*).
- Smoke: JS console has zero errors after interactions in the live preview.

## Remaining plan for D-Finish (not on this card)
- Full feel-pass writeup (5 bullets + portrait + landscape screenshots) after D-CP1 lands.
- Optional deepen from the standing direction: lightbox keyboard-hint bar, marquee content "breathing" pulse on non-hover, nav underline sweep.
- Regression pass over existing shipped interactions to confirm nothing regressed with the new global theme transition.
- Commit locally (no force-push/public).
