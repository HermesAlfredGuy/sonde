# Sonde — landing page

A single-page site for **Sonde**, a fictional database agent that works inside an oil and gas
operator's own network: it reads the historian, SCADA tags and well schemas, writes and verifies the
SQL itself, and stops at a named approver before any row changes.

Live: https://hermesalfredguy.github.io/sonde/

## Stack

- Vite 8 + plain ES modules, no framework, one DOM (nothing swaps on hydration)
- Geist Variable + Geist Mono, self-hosted through `@fontsource` (no Google Fonts request)
- GSAP 3.15 for the intro, reveals and the console timeline; Lenis for smooth scroll
- Design tokens in `src/styles/tokens.css`; all copy and markup in `index.html`
- Built from `/opt/data/kits/web-editorial`; the kit's structure was replaced section by section

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static output in dist/
npm run preview
```

## The signature moment

The hero console runs one investigation on a loop while it is on screen (it pauses off screen):
question typed → four plan steps tick as the tables they need light up → the SQL types itself →
three rows land → the run stops at a human gate → approved → the loop restarts. The elapsed clock
counts to 41.0 s and the 90-day spark draws the water-cut jump. State is driven by `data-*`
attributes in `src/motion/console.js`.

## Motion

Full motion always, per the client's rule: no `prefers-reduced-motion` branch, no toggle. Sequences
shorten on phones rather than disappearing (the spark sits under the rows instead of beside them).
Nothing flashes; the only repeating beat is the console loop.

## What was checked (2026-10-25, against the live URL)

| Check | Result |
| --- | --- |
| Overflow at 360/390/768/1024/1280/1440/1920 | 0 px everywhere |
| Tap targets under 44 px | none |
| Text contrast under 4.5:1 (3:1 large) | none, measured on every text node |
| Layout collisions between cards, tiles, console rows | none |
| Menu: open, focus trap, Esc, focus returned | pass |
| Pricing toggle, form validation, FAQ | pass |
| Console timeline end to end | question 94 chars, SQL 406 chars, 3 rows, gate waiting → approved |
| Console errors and failed requests on load | none |

Evidence: `docs/qa-2026-10-25.txt`, `docs/capture-2026-10-25.log`; screenshots in `shots/web/`.
The scripts that produced them live in `../tools/` — `sweep.mjs`, `layout-critic.mjs`,
`interactions.mjs`, `probe-run.mjs`, `capture.mjs`, `spec-audit.mjs`.

## Limitations, stated plainly

- All content is fictional: no customer, price, metric or quote on this page is real.
- The console is a scripted replay, not a live query against a database.
- No Lighthouse run is recorded for this page; the claims above come from the scripts in
  `../tools/`, not from Lighthouse.
- Visual review this round was measurement-based (the vision route was rate-limited), so the
  judgement of the render as an image came from geometry, contrast and density rather than eyes.

## Type and colour

One typeface (Geist) plus Geist Mono for data only; weights 400/500/600, no italics. One accent,
flare amber `#FFB020`, used for live state, the human gate, the CTA and the console spark — about
1 % of a desktop viewport and 5 % on a phone. Everything else is ink on a warm near-black ground
(`#131209`), with hairline rules instead of cards and shadows only on the two floating layers.
