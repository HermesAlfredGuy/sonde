# Sonde — page plan

Written before code, in the order the `landing-page-design` skill requires.

## 1. Page outline

Layout **A, classic hero plus sections** — the product is legible from one hero window (question,
SQL, rows, approver), so a long form story would slow the first judgement. Sections, in build order:

1. Fluid island nav (glass pill, morphing hamburger, full screen overlay)
2. Hero: headline, subheadline, one primary CTA, proof line, product window
3. Tagline reveal — two lines, words activate one at a time
4. Problem to solution
5. Benefits, four, outcome first
6. How it works, three steps
7. Proof: case note, three numbers, one quote
8. Approval and security (objection: can an agent touch production data)
9. Pilot offer (risk reversal)
10. FAQ, eight questions
11. Final CTA, identical to the hero
12. Footer with legal links

## 2. Hero copy

- **Headline:** Ask your wells a question. Get the query that answered it.
- **Subheadline:** Sonde reads your historian, SCADA tags and well schemas, writes the SQL itself, and
  stops at a named approver before a row changes. Six week pilot on one asset, no procurement.
- **CTA:** Book a walkthrough
- **Proof line:** 3 assets in the Permian and the Montney. Median 41 seconds from question to rows.

## 3. Benefits

1. **Minutes, not sprints** — median 41 seconds from question to rows against a 9.7M row replica.
2. **Every number traces back** — each answer keeps the SQL, the tables it read and the row count.
3. **Writes stop at a person** — 100% of writes wait for a named approver. 0 have shipped without one.
4. **Built on the schema you have** — historian, SCADA tags, allocations and decline models as they are.

## 4. How it works

1. **Point it at a replica** — Sonde reads schema and column types, never rows, unless you switch row
   context on for a single run.
2. **Ask the question you would ask a colleague** — Sonde plans the query, writes it, dry runs it under
   a cost ceiling and reads 9.7M rows without touching the primary.
3. **Approve the write, keep the trail** — the change waits at the gate. Approving it stores the
   statement, the rollback and the name.

## 5. FAQ

1. **Does Sonde read row data?** No. It reads schema, column types and counts. Row context is opt in per run.
2. **Which databases does it connect to?** Postgres, SQL Server, Oracle, Snowflake and Timescale, over a replica.
3. **Can it change production data?** Only through the gate, one approved statement at a time.
4. **Who approves a write?** A named person in your organisation with the approver role. Sonde cannot approve for them.
5. **How long does setup take?** Replica credentials and a schema read, usually inside one day.
6. **Where does the SQL go?** Into the run log, kept 90 days, exportable as SQL or CSV.
7. **Does it run on our own servers?** Yes, inside your VPC or on hardware you own.
8. **What does the pilot cost?** Nothing for six weeks. After that it is priced per asset, not per seat.

## 6. SEO and AEO

Evergreen offer with search intent, so **index** it. Title: `Sonde — the database agent for oil and gas`.
Meta description: the subheadline, trimmed. FAQ written as plain question and answer with FAQPage
schema. Canonical and `og:image` point at the live GitHub Pages URL.

## 7. Visual system decisions (skill Part B)

- Geist for text, Geist Mono only for SQL and data rows.
- Type sizes only from the scale: 12, 14, 16, 18, 20, 24, 30, 36, 48, 60.
- Spacing only from the table: 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96.
- Radii from the set, with the nested formula (outer 16 with an 8px gap gives inner 8).
- Backgrounds flat: `#131209` page, `#181818` panel, `#1F1F1F` raised, borders `#313131` all round.
- One gradient, on the hero heading only: `#FFFFFF` to `#9B9B9B`.
- Monochrome throughout. No accent colour competing with the product window.
- Reveals: `translateY(64px) blur(12px)` to zero over 800ms on `cubic-bezier(0.32,0.72,0,1)`,
  driven by IntersectionObserver, never a scroll listener.
- Signature moment: the product window runs one investigation, then the human gate turns to approved.
- Three things to avoid: a full width sticky bar instead of the floating pill, a second accent colour,
  and cards built from one sided borders.
- Differs from Lathe (warm orange, editorial serif contrast) and from the first Sonde build (amber
  instrument) by going fully monochrome and product first.
