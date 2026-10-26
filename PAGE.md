# Sonde — page plan (Elaya `landing-page-design` order)

One offer, one audience, one action: a concept study of a database agent for oil and gas,
aimed at production and data engineers who cannot get answers out of their own historian, and
whose one action here is **run the demo question** on this page.

## 1. Page outline (layout A, hero plus sections, chosen because the product is legible from one
scene, and the artwork carries the identity)

1. Island nav: glass pill, CONCEPT chip, hamburger that morphs into an X and opens a full screen overlay
2. Hero: the cross-section plate, headline, subhead, primary CTA, one spec line
3. Spec strip: three design-intent facts, no invented metrics
4. Descent (how it works, pinned): Read the rock → Ask in plain English → Stop at a name
5. Tagline reveal: three lines of words that activate one at a time
6. Run panel (the demo, interactive and labelled SIMULATED)
7. Benefits: four outcomes on a 7/5 asymmetric grid
8. What is real here: honest real/simulated table
9. FAQ, eight questions, native disclosure elements
10. Final CTA, the same action as the hero
11. Footer: legal links, provenance note

## 2. Hero copy

- **Headline:** Ask the field / a question.
- **Subheadline:** Sonde maps your historian, SCADA tags and well schemas, writes the SQL, and stops
  at a named approver before a single row changes.
- **Primary CTA:** Run the demo question
- **Secondary:** What is real here
- **Proof line:** Concept study · demo data is synthetic · no live database is connected

## 3. Benefits

1. **Every answer arrives with its receipts** — the SQL, the tables it read, the row count, the runtime.
2. **Writes stop at a person** — the agent cannot approve itself; the gate keeps the statement and the rollback.
3. **Your schema, not a migration** — historian, SCADA tags, allocations and decline models stay where they are.
4. **A cost ceiling before the read** — dry runs under a limit, on a replica, never on the primary.

## 4. How it works

1. **Read the rock** — schema, column types and counts; not rows.
2. **Ask in plain English** — plan, dry run under the ceiling, read the replica.
3. **Stop at a name** — the write waits at the gate with its rollback attached.

## 5. FAQ

1. **Is Sonde a real product?** No. This is a concept study: an art-directed argument for how a
   production data agent should behave. There is no backend here and nothing is for sale.
2. **Is the demo real?** The interaction is real; the answers are scripted from a synthetic dataset
   of three fictional wells. Every panel on this page is labelled.
3. **Does it read row data?** In the concept, only schema, column types and counts, unless row
   context is switched on for a single run by a named person.
4. **Which systems?** Postgres, SQL Server, Oracle, Snowflake and Timescale, read from a replica.
5. **Can it change production data?** Only one approved statement at a time, through the gate.
6. **Who approves?** A named person with the approver role. The agent cannot approve for them.
7. **Where does the SQL go?** Into the run log, exportable as SQL or CSV.
8. **What does it cost?** Nothing. Nothing is being sold.

## 6. SEO / AEO

Indexable (evergreen concept page, and the FAQ is the search-intent surface).
Title: `Sonde — a database agent for oil and gas (concept study)`
Description: `A concept study of a database agent for oil and gas: reads schema and well data, writes
the SQL, stops at a named approver before a row changes. Demo data is synthetic.`
FAQPage structured data for the eight questions. `og:image` rendered from the hero plate.

## 7. Layout recommendation

A. Classic hero plus sections. The hero scene explains the product's posture (read down, gate on the
way up) in one look, so a long form argument would delay the first judgement. The pinned descent
gives the story its length without turning the page into a document.
