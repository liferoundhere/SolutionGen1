# Prompt comparison: MedStar Health

The same customer inputs run through the generator before and after the rebuild of the composer, to show why the old prompts did not produce a masterpiece and what changed.

The MedStar inputs used here are stand-ins (the real run's inputs were not shared): MedStar Health, headquartered in Columbia, Maryland, with hospitals and care sites across Maryland, Washington DC and Virginia; discussing how one connected network and security fabric keeps clinical care running through outages, storms and cyber events; for the CIO and the CISO; must include ThousandEyes, Cisco Spaces, ISE, Cyber Vision, Secure Access and Cisco Cloud Control; integrations with Epic and Microsoft Sentinel; 2 hours.

- [`medstar-old-prompt.md`](medstar-old-prompt.md): the previous generator, Explorable Briefing (type A), with the core fields filled and the other fields left as shipped.
- [`medstar-new-prompt.md`](medstar-new-prompt.md): the rebuilt generator, Operations Twin (type E), with the same inputs.
- [`csx-reference-prompts.md`](csx-reference-prompts.md): the CSX prompt that produced a masterpiece, and the brief Cursor wrote for its agent.

## Side by side

| | Old (type A) | New (Operations Twin) |
|---|---|---|
| Words | 3,758 | 1,109 |
| Fixed pixel sizes | 58 | 0 |
| Fixed hex colors | 25 | 0 |
| Rail terms (rail, wayside, corridor, train, terminal and similar) | 31 | 0 |
| "Splunk" | 10, from the default SIEM field | 0 |
| "Northwind" (sample customer) | 4 | 0 |
| Live reference builds the model is pointed at | 1 | 3 |
| Leads with | Operating rules, then an implementation spec of the CSX build | The eight-block brief, then the experience, then shared ingredients |

The old prompt also asked for the tagline "Securing the corridor", an intermodal terminal gate as the site to model, a US Midwest map and a Northwind data center in Lenexa, Kansas, because those fields kept their sample values.

## What went wrong in the old prompt

1. **It specified how, not what.** Most of its words described how the CSX build was implemented: pixel sizes, colors, file structure, hash parameters. The prompts that produced the eight reference builds said what and why and left the design to the model.
2. **It was locked to rail.** The template and its fields assumed a rail network, a wayside site and a SIEM, so a hospital system was pushed through a railroad-shaped format.
3. **Sample values leaked.** Fields started filled with a made-up customer and counted as complete, so anything not overwritten (here the SIEM, tagline, site, map and hub) went into the prompt.
4. **The intent was buried.** The ten lines that matter sat inside 3,000 to 4,000 words.
5. **There was no research-then-brief step.** The model was asked to fill a fixed schema instead of turning its research into a story spine first.

## What the new prompt does

1. **Leads with the eight-block brief** that produced every reference build: medium, customer ("show their real places and the people in them"), what to discuss and who is in the room (with navigation axes and a story device), key items (with must-not-mention and integration callouts), mandatory research, one shot, time, and "Create a masterpiece."
2. **Describes the format as an experience** in a few lines and points the model at the live reference builds as the bar, "similar ambition and craft, not a copy", with permission to choose a better form if the research suggests one.
3. **Adds the ingredients every reference build shares**, one line each: their real place as the stage, people as the way in, timed story scenarios, several lenses, before and after, a guided way in plus free exploration, a living world, an honesty layer, and depth.
4. **Adds research-then-brief**: research, write `research-notes.md` with places, people, incidents, initiatives, the products through that lens and the scenarios, then build from it without asking for approval.
5. **Keeps proof of delivery**: one self-contained file, a public link opened to verify it loads, screenshots after a visual test, research notes with sources and assumptions, no em dashes, no credentials.
6. **Starts with empty fields** (placeholders show the kind of answer) and will not copy until the required fields are filled.
7. **Keeps the detailed spec as an optional appendix**, off by default, for anyone who wants a close copy of a reference build.

For a hospital system the new format choice matters as much as the wording: the Operations Twin format is drawn from the MSK Operations Twin (a hospital campus) and the Deltaverse, the closest precedents to MedStar.
