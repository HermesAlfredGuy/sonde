# Sonde — art direction and motion brief

Project: `sonde-studio-20261026`, replacing the rejected monochrome baseline at
https://hermesalfredguy.github.io/sonde/
Built by Hermes. Concept page for a database agent for oil and gas; nothing on the page is a live
product, and the page says so.

## 1. Concept

**The page is a well.** A single continuous cross-section of the Delaware Basin at night, cut open
from the sky down to the reservoir, with the copy sitting on the quiet dark of the surface and the
wellbore running through every section beneath it. You do not scroll past a hero; you descend.

Personality: **instrumental, geological, unhurried**. Not a SaaS dashboard, not a fake startup.
Anti-reference: the previous Sonde page (dark IDE mockup, grey text panels, no place, no material)
and "AI database agent" pages that show a chat box on a gradient.

Why this concept is honest: Sonde is named for the logging tool lowered into a borehole. The
product's actual claim is a read down into data and a gate on the way back up, so the artwork is
the argument rather than decoration.

## 2. References (studied, not copied)

| Reference | Observed | Adapted | Kept original |
|---|---|---|---|
| Owner target, x.com/elayadesigns/status/2114049200749175174 (14.7 s, 1752×1080, frames in `docs/reference/frames/`) | Full-bleed painted environment as the hero; one dominant scene; oversized grotesque headline over the quiet part of the image; tiny uppercase eyebrow, one pill CTA; jewel palettes (navy + gold, oxblood + black, teal + orange); visible grain, atmospheric haze, strong light source | Full-bleed hero, one dominant scene, oversized headline on the dark side, single amber accent, grain and haze as finish | All artwork authored here: no frame, character, composition or asset from the reference is reproduced |
| Oilfield well-log and cross-section conventions (public geology literature, e.g. USGS/BEG illustrations of the Delaware Basin) | Depth increases downward, formation tops labelled at a hairline, gamma-ray and resistivity tracks at the left margin, faults offset beds, oil/water contact flat | Depth ruler, formation tops, GR and resistivity curves, two normal faults, anticline trap, oil/water contact | Geometry is illustrative and labelled as such; it is not a real field map |
| Poly Haven `cliff_side`, `dark_rock_02` (CC0) | Real sedimentary bedding at metre scale, warm sandstone tones, vertical fissures | Used as photographic micro-detail inside bands, tinted cool, at low opacity, to give material that flat vector fills cannot | No Poly Haven render copied; textures composited into an original section |

## 3. Type

One family: **Geist** (variable 100–900, self-hosted `assets/fonts/geist.woff2`). **Geist Mono**
reserved for depth numbers, SQL, tags and labels, because there it is functional, not decorative.

Scale, snapped to the skill's steps, no ad-hoc sizes:
96 / 60 / 48 / 30 / 24 / 20 / 18 / 16 / 14 / 12 px with their paired line heights.
Display: weight 500–600, tracking −0.03em, `text-wrap: balance`, hand-set line breaks.
Body: weight 400, 18/28, `text-wrap: pretty`, measure ≤ 62 characters.
Mono labels: 12/16, uppercase, tracking 0.14em.
No italics anywhere. No weight above 600.

## 4. Colour

| Role | Value | Use |
|---|---|---|
| Ground | `#060F14` | page surface, always flat |
| Deep | `#0A1922` | section alternation, card surfaces |
| Petrol | `#123039` | strata mid tone, borders |
| Slate | `#2C4A4C` | lighter beds, rules |
| Bone | `#EFE9DC` | headings, primary text |
| Muted | `#8FA3A3` | body, secondary labels |
| Signal | `#F0A03C` | **the** accent: the query pulse, the reservoir, approved state, primary CTA fill |
| Signal dim | `#7A5426` | signal at low energy (behind fills only) |

Discipline: amber is spent on state and the single CTA, never on decoration or headings. Everything
else is petrol/slate/bone. Text contrast ≥ 4.5:1 on the flat surfaces (bone on ground = 15.6:1,
muted on ground = 6.9:1, ground on amber CTA = 9.4:1).

Backgrounds of UI surfaces are flat. Gradients exist only inside the artwork plate, where they are
atmosphere (sky, depth haze), never as a page background.

## 5. Composition

- **One thing wins each viewport.** Hero: the cross-section. Descent: the wellbore and its depth
  readout. Demo: the run panel. Tagline: the words.
- 12-column grid, max width 1280 px, gutters 32 px, outer margin 32/64 px. Hero copy occupies
  columns 1–6, artwork bleeds full width behind it, with its quiet zone deliberately over the copy.
- **Signature layout move:** every section is registered to the same vertical axis — the wellbore at
  66% width on desktop, 50% on phone — so the page reads as one continuous borehole. Section
  headers carry a depth value in mono ("−3,200 ft") instead of a decorative eyebrow.
- Asymmetry: the benefits grid is a 7/5 split, not four equal boxes; the demo panel hangs off the
  right edge at desktop.
- Negative space: the hero keeps 40% of its height as quiet sky. Nothing floats in the margins.

## 6. Imagery

Authored original 2D, drawn in SVG from a formation table at runtime:
nine formations with names, depths, thicknesses, colours, dips; two normal faults with real offset;
an anticline whose crest is the trap; a flat oil/water contact; a horizontal lateral with
perforation ticks; GR and resistivity tracks; a depth ruler.
Material: `cliff_side` and `dark_rock_02` (Poly Haven, CC0) as tinted photographic texture inside
the bands at 8–18% opacity with multiply/soft-light, plus bedding hairlines, marker beds, rim light
on the ground edge, depth haze, vignette and a static grain finish.
Above ground: night sky with a computed star field, three ridge silhouettes in atmospheric
perspective, a pumpjack and wellhead silhouette for scale, one flare with an amber glow.
Provenance and hashes in `media-manifest.json`.

## 7. Motion language

Character: **instrumental, weighted, mechanical**. Long expo-outs (0.9–1.2 s) for things arriving,
linear only for measurement, nothing bouncy, nothing spinning. Every animation is tied to a
geological fact (a probe descending, a trace drawing, a gate closing).

- Hero intro (~3.2 s): ground rim light draws, strata settle by 6–14 px with blur resolving, wellbore
  casing draws downward, the query pulse descends and the reservoir blooms, log traces draw, labels
  arrive on their formation tops.
- Idle: pulse travels the bore every 6 s; reservoir breathing; two dust motes fields drifting at
  different speeds; flare flicker at 1.2 s period (below the 3 flashes/second limit).
- Descent: a pinned 300 vh sequence. The section scrolls *down* through the artwork while the depth
  readout counts, three chapters cross-fade at depth marks, the probe stays fixed to the bore.
- Tagline: words activate one at a time across a scroll trigger, 25% → 100% opacity.
- Demo: the question types, the SQL writes itself line by line, rows fill, the gate closes.
- Section entrances: one IntersectionObserver, translateY 16 px + blur 6 px → 0, 0.9 s expo, stagger
  80 ms within a group. No unthrottled scroll listeners; GSAP ScrollTrigger drives the pinned
  sequence and the tagline only.
- **Motion policy for this project:** full motion always, on every device, as the owner requires.
  No reduced-motion branch and no motion toggle is shipped. Phone gets shorter sequences and fewer
  motes, never removed ones. Hard limit respected: no element flashes faster than 3 Hz.

## 8. Accessibility

Contrast checked per role above. Focus visible: 2 px bone ring, 2 px offset, on every interactive
element. Keyboard: skip link, nav overlay trap and Escape, demo presets are buttons, gate is a real
button, FAQ uses native `<details>`. Target sizes ≥ 44 px. Artwork is decorative (`aria-hidden`) and
every claim it carries is repeated in text. Semantic landmarks and one `<h1>`.

## 9. Content and responsive intent

Real copy written here, no lorem, no invented customers, quotes, logos or measured results.
Every simulated element carries a label: the hero chip says CONCEPT, the demo panel says SIMULATED,
the disclosure section lists what is real versus what is demonstrated. No form collects data; the
only actions are in-page (run the demo, open the disclosure, read the FAQ).
Phone: the hero becomes a vertical composition — copy top, artwork cropped to a tall section with the
wellbore centred and the wellhead above it; the descent runs 220 vh with the chapters stacked above
the bore; the demo panel goes full width with horizontal SQL scroll; the benefits grid collapses to
one column with the 7/5 asymmetry preserved as alternating offsets.

## 10. Anti-clichés to avoid

1. A dark chat/IDE card on a gradient with a glowing border (the baseline we are replacing).
2. Four equal feature cards with line icons.
3. Fake proof: customer logos, invented quotes, "trusted by 40 operators", round percentages.
