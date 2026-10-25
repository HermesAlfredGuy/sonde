# Sonde — design decisions

**Concept.** A field instrument, not a chatbot: the page is the console of an agent that investigates
production data, and it proves every step — the schema it touched, the SQL it wrote, the rows it returned,
the human who approved the fix. Nothing is claimed that is not shown on screen.

**Palette.** Ground `#131209` (warm near black, from the cloned skill's allowed dark set), panel `#1F1F1F`,
raised `#272727`, hairline `#313131`, line strong `#3E3E3E`, text `#F2F0EC` / muted `#A8A49B`, mono dim
`#8B8779`. One accent: flare amber `#FFB020` (live agent state, primary CTA, key data). Status colours
appear only inside the product mock, muted: `#7FAE72` ok, `#D9824A` warn, `#C4574A` fail. Amber covers
roughly 6% of any viewport; the only large amber field is the final CTA band's hairline grid, not a flood.

**Type.** Geist 400/500/600 for everything; Geist Mono 400/500 only for schema names, SQL, timestamps and
numeric data. One typeface, no italics, no weights above 600 (skill B1). Sizes land on Tailwind steps:
96/72/60/48/36/30/24/20/18/16/14/12. `font-pick.sh` suggested Satoshi, which the cloned skill's allowed
set excludes, so Geist wins and the decision is recorded here.

**Spacing and shape.** 8px scale only (4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 128). Radii: 12px panels,
8px inner cells (nested formula: 12 − 4 = 8), 999px pills. Borders always all four sides; no one-sided
rules. No gradients anywhere except the hero heading text (`#FFFFFF → #9B9B9B`, skill B5).

**Motion character.** Mechanical and weighted: 700ms `cubic-bezier(0.32, 0.72, 0, 1)`, no bounce, no spring.
Scroll reveals are a heavy rise from 64px with a 12px blur clearing. Always full motion, no toggle, no
reduced-motion branch (owner rule); the only ceiling is no flashing above 3 Hz.

**Signature moment.** The hero console runs one investigation on loop: schema rails light as tables are
resolved, the plan ticks off, SQL types out at human speed with the joined tables named in comments, the
result table fills, a 90 day water cut trend draws its excursion, and the run stops at an approval gate
before it proposes the allocation fix. Off screen it pauses; it restarts from the question, never mid SQL.

**Avoid.** Dark SaaS gradient blobs and glow rings; holographic or neural network clichés; stock photos of
pumpjacks at sunset; a generic dashboard screenshot standing in for the product. The console is the product.

**Differentiation.** The last two builds were a dark editorial agent runtime page and a light SaaS concept
site, both type led. This one is instrument led: mono data, hairline grid, an amber flare used as a signal
colour rather than decoration, and the page's meaning carried by what the agent does on screen.
