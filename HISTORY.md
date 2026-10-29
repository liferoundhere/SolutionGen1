# Project history

How the Cisco Solutions Generator was built, request by request. Written from the working session with Claude (October 28 to 29, 2026).

## 1. Research and build plan

The starting point was a research document, "Cisco Solutions Generator: Source Research and Build Plan". It traced an Instagram reel to Futurepedia's tutorial "Claude Makes a New Kind of Video" and the creator's free Style Atlas: a library of styles, each with a copy-ready prompt that carries the full reference code. It then analyzed the four Cisco examples (CSX, FutureSE, Dominion, MetLife), proposed four style presets, a 12-block prompt skeleton and a phased build plan, and listed open decisions.

## 2. First prompt composer

Request: build the prompt composer (phase 2 of the plan), with no default Cisco scenario.

Built: a single-page composer with the form fields from the plan, four style presets, a storyboard toggle and a Copy button, assembling the 12-block skeleton. Published as a private claude.ai artifact.

## 3. Visual mock-ups of each preset

Request: add visual examples of each style preset.

Built: SVG mock-ups of all four presets for a made-up sample customer (Northwind Freight), shown as thumbnails and a large preview with the parts each preset includes.

## 4. The skill pack and the first rebuilds

Request: include the uploaded SEVerse skill pack and its design guidance, rebuild each example with the skill, add an install guide, and study the four example sites.

Built:
- Unpacked the `cisco-3d-stage` skill (SKILL.md, six references, a runnable starter with vendored Three.js r170, tools for narration, review and docs). Noted that the `cisco-branded` base skill it extends was not in the pack.
- A bundler that turns a stage deck into one self-contained HTML file, and a headless review script.
- Four rebuilds, all on the cisco-3d-stage engine, each with a narrated edition. These are kept in `archive/v1-stage-engine-rebuilds`.
- A new generator with a gallery of the rebuilds, a composer built on the skill's eight-block method, an install module (Claude Code, Claude app, Cursor) with downloads, and a design-system page.

## 5. Correction: each format keeps its own stack

Feedback: the rebuilds all looked like the narrated talk, with a camera box on every one. Only the FutureSE talk works that way. Each example needs its own tech stack and its own prompt, detailed enough to recreate something similar, not identical.

Built:
- Each original was re-studied from saved copies of its build and data: CSX (Three.js r186 explorer), Dominion (Three.js r169 scrolling page; not raw WebGL as first thought), MetLife (Three.js r186 with GSAP, three modes and a game layer).
- For each: SPEC.md, a 3,000 to 3,500 word PROMPT.md with its own sections and fields, a filled version, and an elements list (34, 34 and 51 elements).
- Rebuilds from those prompts in each original's own format, republished to the same links.
- The FutureSE talk (type B) stayed on the skill, with a new prompt template and a 19-element list.
- The composer now uses a per-format prompt, per-format fields, and element checkboxes, with borrowing between formats. The gallery shows rebuild and original screenshots side by side.

## 6. More examples, dictation and a spoken intake

Request: study four more examples (topaz-kernel-3cga, dapper-ginger-cs9a, presto-cedar-mcz6, waxen-salmon-jt6z), add a dictation button to every input, and build an advanced step-by-step spoken questionnaire.

Built:
- A dictation button on every field, using the browser's speech recognition where the page may use the microphone, and a system-dictation fallback (Fn twice on Mac, Win+H on Windows) where it may not, as in the claude.ai viewer.
- "Talk it through": reads each question aloud, listens, fills the fields, takes the voice commands next, back, skip, clear and done, and can tidy the spoken answers with Claude on request.
- A downloadable single-file copy of the generator for live dictation in Chrome or Edge.

Not done: the four new examples could not be studied. The session's network policy blocks here.now and the scraping service ran out of credits. Two are known from the FutureSE talk's links: dapper-ginger-cs9a is the Deltaverse (Delta Air Lines) and topaz-kernel-3cga is the MSK Operations Twin (Memorial Sloan Kettering).

## 7. Guardrails

Feedback: every AI tool given the prompt stopped to present a plan and ask for approval. The goal is to make it real, then make it perfect.

Cause: a "Plan first" switch was on by default.

Built: five guardrails, on by default: one shot, no questions, time budget, make it real then make it perfect, and create a masterpiece. Each one has a work-with-me alternative when it is unchecked. The prompt opens with them as operating rules that override the rest, and closes with a "Start now" line.

## 8. Guided mode and the skills check

Request: when the one-shot principles are unchecked, return to the step-by-step process with script approval; make sure the skills are used for the visuals; check that they are installed and ask for them if missing, except in one-shot mode.

Built:
- Unchecking "One shot" turns the prompt into staged work with a gate after each stage: skills check, questions or assumptions, research and a format-specific script for approval, first version with screenshots, then refinement passes.
- A "Skills for the visuals" section. `cisco-3d-stage` is required for type B and optional for the others; `cisco-branded` is recommended for all; custom skills can be added by name. Every prompt tells the model to verify each skill is installed and readable. One-shot builds note a missing skill in the README and continue; guided builds stop and walk the user through installing it. Skills win on Cisco brand rules; the prompt wins on each format's own layout, stack and design values.

## 9. Masterpiece is the model's call

Feedback: "Create a masterpiece" is a broad approval. The model should decide what a masterpiece is, unless the user gives examples.

Built: the guardrail is now two sentences that name the audience and leave the definition to the model. Optional: a field for masterpiece examples (treated as the bar to clear, not templates), and a checkbox, off by default, that adds the gallery's quality bar and the list of AI slop to avoid. No rubric step remains.

## 10. GitHub

The project, the skill pack, the rebuilds, the captured originals, the tools and this history were uploaded to `liferoundhere/solutiongen1`.

## 11. Why the MedStar run was not a masterpiece

Feedback: a prompt from the generator, run for MedStar Health, did not produce a masterpiece. Shared for comparison: the original CSX prompt, the brief Cursor wrote for its agent, and the CSX output.

Findings:
- The CSX prompt was about 280 words of intent only: customer, places and people, the conversation and audience, navigation axes, a story device, must include, must not mention, an integration target, mandatory research, one shot, time and "create a masterpiece". Cursor's brief expanded it in the domain (named yards, incidents, directives, asset classes) and added proof of delivery, still with no layout or colors. The model designed the rest.
- The generator did the opposite: 3,000 to 4,000 words describing how one build was implemented, a rail-shaped template and fields, and sample values that leaked into real prompts.

## 12. All eight examples studied, and the composer rebuilt around the brief

With here.now reachable, all eight published builds were downloaded and reviewed. The four new links are the MSK Operations Twin (two versions) and the Deltaverse (two versions). The FutureSE talk's workshop scene contains the eight-block brief itself, the same shape as the CSX prompt. From that one kind of brief, the model chose a different form for every customer, and all eight share the same ingredients: their real place as the stage, people as the way in, timed story scenarios, several lenses, before and after, a guided way in plus free exploration, a living world, an honesty layer, and depth.

Built:
- The composer now writes the eight-block brief first, then the format as an experience with live reference builds to clear ("similar ambition and craft, not a copy"), the nine shared ingredients, a research-then-brief step, the skills check and a proof-of-delivery list. Prompts run about 1,100 words.
- Shared fields for every format in the order of the brief, including Navigate by, Story device, Must not mention and Call out integrations. Fields start empty with placeholders; Copy stays disabled until the required fields are filled.
- The detailed specs became an optional technical appendix, off by default. Signature elements from any format can be borrowed.
- A fifth format, the Operations Twin, drawn from MSK and the Deltaverse, the closest precedent for a hospital system.
- docs/examples compares the MedStar prompt from the old and new generator: 3,758 words with 31 rail terms, 10 Splunk mentions and 4 sample-customer mentions, against 1,109 words with none.

## Open items

- Add the `cisco-branded` skill if it is to be part of the pack.
- Run the new MedStar prompt (docs/examples/medstar-new-prompt.md) end to end and compare it with the earlier run.
- Render neural voices (edge-tts) for the narrated and audio editions; the rebuilds here use the browser voice or captions only.
