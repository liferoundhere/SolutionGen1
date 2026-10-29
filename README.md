# Cisco Solutions Generator

A generator that helps Cisco sellers, solutions engineers and customer success managers build customer-specific interactive 3D stories. Pick one of four presentation formats, fill in the customer details (by typing or by talking), choose the format's elements, and copy one prompt into Claude Code. The prompt carries everything needed to recreate that format for a new customer: its stack, layout, design values, components, data model and review steps.

Each format was reverse-engineered from a published example built by Stephen Ewings (Solutions Engineer, Cisco).

## The four formats

| Type | Format | Built from | Stack the prompt asks for |
|---|---|---|---|
| A | Explorable Briefing: one-screen 3D explorer with Without / With / Split Cisco views, tabs, a detail panel and a guided story dock | CSX wayside briefing | three r186, Vite single file, OrbitControls, topojson |
| B | Narrated Talk Film: deck-style 3D stage talk with presenter tools and a narrated film edition | FutureSE talk, "A spoken word away" | the `cisco-3d-stage` skill (three r170, no build step) |
| C | Leadership Digital Twin: scrolling leadership page with a 3D hex-twin hero, cited KPIs, an audio story and sections | Dominion Energy and Splunk briefing | three r169, Vite single file, CSS2DRenderer, bloom |
| D | Mission Globe: game-like 3D globe app with Present, Play and Learn modes, missions, scoring and a 4D timeline | MetLife AgenticOps 4D | three r186, GSAP, Vite single file |

## What is in this repository

```
generator/            The generator page. Open generator/index.html, or serve the folder (it works on GitHub Pages).
  index.html          Standalone page: gallery, composer, setup and design systems
  src/                Page source (generator-src.html), per-format data (types.json, decks2.json) and the data builder
  decks/              The rebuilt example of each format, as single HTML files
  kits/               Each format's prompt template and design and tech spec (Markdown)
  shots2/, shots/     Screenshots of the rebuilds and of the originals
formats/              One folder per format
  */PROMPT.md         The prompt template with {{PLACEHOLDERS}}
  */PROMPT.filled.md  The template filled in for the original customer
  */SPEC.md           The reverse-engineered design and tech spec
  */prompt-fields.json  The form fields and sample values
  */elements.json     Every UI and feature element, each with a prompt snippet (used as composer options)
  */app, */dist       The rebuild's source and its single-file build
  */shots             Original versus rebuild screenshots
skills/               The SEVerse cisco-3d-stage skill pack, as provided
archive/              First-pass rebuilds of all four examples on the cisco-3d-stage engine (superseded)
originals/captures/   Saved copies of the original builds, used for the reverse engineering
tools/                Build and review scripts (bundling, headless screenshots, page conversion) and generator tests
HISTORY.md            How the project was built, request by request
```

## Using the generator

1. Open `generator/index.html` in Chrome or Edge, or the hosted version.
2. **Compose:** pick a format and fill in its fields. Every field has a dictation button, and "Talk it through" runs a spoken, step-by-step intake.
3. **Elements:** keep or drop the format's elements, or borrow elements from other formats.
4. **Guardrails:** on by default: one shot, no questions, time budget, make it real then make it perfect, and create a masterpiece. Uncheck "One shot" to get a staged, guided process instead: a skills check, then questions if allowed, then a script for your approval, a first version, and refinement.
5. **Skills:** the prompt checks that the skills it relies on are installed. One-shot builds note a missing skill and keep going; guided builds stop and ask you to install it.
6. Copy the prompt and paste it into Claude Code in an empty folder.

Type B needs the `cisco-3d-stage` skill: copy `skills/cisco-3d-stage` to `~/.claude/skills/`. Types A, C and D are self-contained.

## Rebuilding the generator page

`generator/index.html` is assembled from `generator/src/generator-src.html` by inserting `types.json` and `decks2.json` at the `__TYPES_JSON__` and `__DECKS_JSON__` markers. The format data in `types.json` is built from each `formats/*/PROMPT.md`, `prompt-fields.json` and `elements.json`.

## Notes

- Live microphone dictation works where the browser allows the page to use the microphone (Chrome or Edge opening the file or a normal site). Inside the claude.ai artifact viewer the microphone is blocked, so the dictation buttons point to system dictation instead.
- The `cisco-branded` base skill that `cisco-3d-stage` extends is not included here.
- Customer-facing figures in the examples are labeled public, modeled or illustrative as in the originals. Review every generated build before it reaches a customer.
- Cisco names and marks belong to Cisco Systems, Inc. Third-party components in the skill pack are listed in `skills/THIRD_PARTY_NOTICES.md`.
