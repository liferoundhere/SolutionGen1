# Cisco Solutions Generator

**Turn a customer conversation into a customer-specific, interactive 3D story, from one prompt.**

The Cisco Solutions Generator is for Cisco sellers, solutions engineers and customer success managers who need visuals and storytelling that hold up in front of customer executives. You pick one of four proven presentation formats, describe the customer (by typing or by talking), choose the elements you want, and copy one prompt into Claude Code. The prompt carries everything needed to build that format for a new customer: the tech stack and versions, the layout, the design values, every component, the data model, the honesty rules and the review steps. By default it tells the model to build the whole thing in one shot, without questions, inside a time budget, and to make it a masterpiece.

Each format was reverse-engineered from a published example built by Stephen Ewings (Solutions Engineer, Cisco), and the example was rebuilt from its own prompt to prove the prompt works.

![The generator's gallery](docs/screenshots/01-gallery.png)

**Get started:** read the [Instructions](docs/INSTRUCTIONS.md), or open [`generator/index.html`](generator/index.html) in Chrome or Edge.

---

## The four formats

Each format keeps the format, stack and look of its original. Only the talk (B) uses deck navigation, presenter windows and a camera box.

### A · Explorable Briefing

![Explorable Briefing rebuild: split view of a scenario without and with Cisco](generator/shots2/csx-r3.jpg)

A single-screen 3D explorer for one customer and one executive audience. A top bar switches between the network map and a site diorama, and between Without Cisco, With Cisco and a Split view that renders both side by side. A left panel holds Personas, Technology, Scenarios and Places; a right panel shows details; a story dock runs a short guided story. Every item is badged PUBLIC, MODELED or ILLUSTRATIVE, and Sources and Assumptions open as panels.

*Studied from the CSX wayside briefing. Stack: three r186, OrbitControls, topojson-client, Vite single file. 34 elements.*

### B · Narrated Talk Film

![Narrated Talk Film rebuild: the eight-block method in the focus layout](generator/shots/futurese-2.jpg)

A talk that moves like a slide deck through a row of lit 3D worlds: a new sky and particle formation on every scene, a glass HUD with two-clause headlines, presenter and talking-points windows, a camera box, a printable talk track, a live workshop, and a narrated film edition with an AI narrator.

*Studied from the FutureSE talk, "A spoken word away". Built on the `cisco-3d-stage` skill (three r170, no build step). 19 elements.*

### C · Leadership Digital Twin

![Leadership Digital Twin rebuild: hex-twin hero with KPI tiles and the story card](generator/shots2/dominion-r1.jpg)

A scrolling leave-behind page for a leadership team. The hero is a 3D hex twin of the customer's territory with layer chips (operations, data fabric, control plane, simulated attacks), six cited KPI tiles and a ten-chapter story card with an audio briefing. Below it, anchored sections cover outcomes, the work together, alignment, threats with counter boxes, departments, dashboards, capabilities, federal, roadmap and numbered sources.

*Studied from the Dominion Energy and Splunk briefing. Stack: three r169 with CSS2DRenderer and bloom, Vite single file. 34 elements.*

### D · Mission Globe

![Mission Globe rebuild: a decision point with product windows and the 4D timeline](generator/shots2/metlife-r3.jpg)

A game-like 3D globe with three modes. **Present** runs a narrated executive tour. **Play** lets people pick a mission, make the call at a decision point and get scored. **Learn** traces each IT signal to a business KPI, with discovery questions and a quiz. A mission rail with business-function filters, docking product windows, a 4D timeline comparing the traditional and agentic outcomes, a live ticker and a narration dock complete it. Every dollar figure is labeled modeled.

*Studied from MetLife AgenticOps 4D. Stack: three r186 with bloom, GSAP, topojson-client, Vite single file. 51 elements.*

---

## What the generator does

### Compose a prompt for any customer

![Compose](docs/screenshots/05-compose-fields-and-prompt.png)

Each format has its own fields (13 to 17) with sample values, and its own prompt of roughly 1,300 to 4,000 words. The assembled prompt updates live, and empty fields are highlighted.

### Keep, drop or borrow elements

![Elements](docs/screenshots/06-compose-elements.png)

Every element of the chosen format is a checkbox. Drop what you do not need, or borrow elements from the other formats; each brings its own instructions.

### Guardrails: build it, or guide me through it

![Guardrails](docs/screenshots/07-compose-guardrails.png)

Five guardrails are on by default: **one shot**, **no questions**, **time budget**, **make it real, then make it perfect**, and **create a masterpiece**. They open the prompt as operating rules that override everything else, so the model builds instead of asking for approval. "Create a masterpiece" is a broad approval for the model to decide what a masterpiece is; you can add your own examples or the gallery's quality bar if you want to steer it.

Uncheck **One shot** and the prompt becomes a staged, guided process: a skills check, questions or assumptions, a format-specific script for your approval, a first version with screenshots, then refinement passes, stopping for your go-ahead at each stage.

![Guided mode](docs/screenshots/09-compose-guided-mode.png)

### Skills for the visuals

![Skills](docs/screenshots/08-compose-skills.png)

Every prompt tells the model to confirm the skills it relies on are installed and to use them for the visuals. One-shot builds note a missing skill and keep going; guided builds stop and help you install it.

### Talk it through

![Talk it through](docs/screenshots/10-talk-it-through.png)

Every field has a dictation button, and **Talk it through** runs a spoken, step-by-step intake: it reads each question aloud, listens, fills the fields, takes voice commands, and can tidy your spoken answers on request.

### Setup and design systems

| Setup | Design systems |
|---|---|
| ![Setup](docs/screenshots/11-setup.png) | ![Design systems](docs/screenshots/12-design-systems.png) |

**Setup** shows what each format needs, the skill install steps and the dependencies. **Design systems** shows each format's palette, type and rules.

---

## Repository layout

```
generator/              The generator. Open generator/index.html, or serve the folder (works on GitHub Pages).
  index.html            Standalone page: Gallery, Compose, Setup, Design systems
  src/                  Page source, per-format data (types.json, decks2.json) and the data builder
  decks/                The rebuilt example of each format, as single HTML files
  kits/                 Each format's prompt template and design and tech spec
  shots2/, shots/       Screenshots of the rebuilds and the originals
formats/                One kit per format (A-explorable-briefing, B-narrated-talk-film,
                        C-leadership-digital-twin, D-mission-globe)
  PROMPT.md             The prompt template, with {{PLACEHOLDERS}}
  PROMPT.filled.md      The template filled in for the original customer
  SPEC.md               The reverse-engineered design and tech spec
  prompt-fields.json    The form fields and sample values
  elements.json         Every element, with a prompt snippet (the composer's options)
  app/, dist/, shots/   The rebuild's source, its single-file build, and screenshots
skills/                 The SEVerse cisco-3d-stage skill pack
archive/                First-pass rebuilds on the cisco-3d-stage engine (superseded)
originals/captures/     Saved copies of the original builds used for the reverse engineering
tools/                  Bundling, headless screenshot and page-conversion scripts, and generator tests
docs/                   Instructions and screenshots
HISTORY.md              How the project was built, request by request
```

## Rebuilding the generator page

`generator/index.html` is assembled from `generator/src/generator-src.html` by replacing the `__TYPES_JSON__` and `__DECKS_JSON__` markers with `types.json` and `decks2.json`. `types.json` is built from each format's `PROMPT.md`, `prompt-fields.json` and `elements.json`.

## Notes and limits

- **Dictation:** live in-page dictation works where the browser lets the page use the microphone (Chrome or Edge, from a file or a normal site). Inside the claude.ai artifact viewer the microphone is blocked, so the buttons point to system dictation.
- **Downloads:** the generator's download buttons use a claude.ai feature. On GitHub Pages or a local copy, take the files from this repository instead.
- **cisco-branded:** the base skill that `cisco-3d-stage` extends is not included.
- **Prompt testing:** the rebuilds were made from each format's prompt using the original customer's data. Running each prompt for a new customer is the next test.
- **Honesty:** figures in the examples are labeled public, modeled or illustrative as in the originals. Have a person review every generated build before it reaches a customer.
- Cisco names and marks belong to Cisco Systems, Inc. Third-party components in the skill pack are listed in [`skills/THIRD_PARTY_NOTICES.md`](skills/THIRD_PARTY_NOTICES.md).
