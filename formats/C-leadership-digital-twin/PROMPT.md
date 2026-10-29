# Build a Leadership Digital Twin briefing page for {{CUSTOMER}}

## 1. Role and output

You are a senior creative technologist on a Cisco and Splunk account team. Build ONE long-scrolling web page: an IT leadership briefing for {{CUSTOMER}} with a live 3D "digital twin" of its territory as the hero. It is a **leave-behind page that people scroll and read**. It is not a slide deck.

Do not build any of the following:
- slide or step navigation;
- a presenter camera box;
- a narrated talk-track HUD;
- keyboard-driven scenes.

**Stack (use exactly this):**
- Vite 5 with vanilla ES modules: no React and no UI framework. Build the DOM from template strings plus a tiny `el(tag, cls, text)` helper.
- **Three.js r169** (`three@0.169.0`) for the twin, loaded through a dynamic `import('./scene.js')` so it stays a separate module. Use these addons: `CSS2DRenderer` for labels, and `EffectComposer` + `RenderPass` + `UnrealBloomPass` + `OutputPass` for glow.
- Fonts: `@fontsource/inter` in weights 400, 500, 600, 700 and 800.
- Output: `vite-plugin-singlefile`, so `npm run build` emits **one self-contained `dist/index.html`** with JS, CSS and fonts inlined. Copy it to the deliverable name in section 11. It must open from `file://` with no network.
- Guard WebGL with `getContext('webgl2')||getContext('webgl')`. Without WebGL, show "WebGL is not available in this browser. The brief below is fully readable." in place of the canvas.
- Pause the render loop with an `IntersectionObserver` once the hero is off screen.

Time budget: about {{HOURS}} hours across research, build and review. Spend roughly a third of it on research and citations.

## 2. Customer and leadership audience

- **Customer:** {{CUSTOMER}}
- **Territory shown on the twin:** {{WHERE}}
- **Audience:** {{AUDIENCE}}
- **What the page must achieve:** {{GOAL}}
- **Cisco and Splunk topic:** {{SCENARIO}}
- **Platform they already run:** {{PLATFORM_OWNED}}. Treat it as the base everything builds on. Mark it "in place" everywhere.
- **Current joint work:** {{CURRENT_WORK}}
- **Regulatory frame:** {{REGULATORY_FRAME}}
- **Catalysts (merger, build-out, deadlines):** {{CATALYSTS}}
- **Mission or critical customers they serve:** {{MISSION_CUSTOMERS}}
- **Sites and functions to place on the twin:** {{KEY_ITEMS}}
- **Departments to cover:** {{DEPARTMENTS}}
- **Prepared by / date line:** {{PRESENTER}}, {{BRIEFING_DATE}}

Write for CIO and CISO staff. Use second person ("your teams", "the platform you already run"). Keep sentences short and concrete with numbers. Lead with outcomes, not products.

## 3. Research plan and citation rules

1. **Collect 40–70 public sources.** Draw on the customer's 10-K/10-Q/8-K, earnings-call transcripts, investor decks, regulator dockets, press releases, project sites, sector threat reports (Dragos, E-ISAC, CISA, vendor CTI), the regulation's text, and Cisco and Splunk product docs and launch posts.
   - Store each source as `{id:'s1', org, date, title, url}`.
   - Note today's research cut-off date in the method notes.
2. **Extract:** 6 headline KPIs; 12 strategic initiatives, each with its evidence; 12 sector threats; the regulatory requirements; the customer's own security operating model; production AI use; and any federal or critical-customer relationships.
3. **Citations:**
   - Every number, date and named fact about the customer or the sector gets a citation chip after the claim. The chip shows the source's ordinal number (array index + 1), links to `#src-sN`, and its `title` is the source title.
   - Never invent a source or a URL. If you cannot source a fact, cut it.
4. **Provenance labels.** Use exactly three, and never blur them:
   - `Public sources`: cited;
   - `Our work together`: account context from {{CURRENT_WORK}}, not cited;
   - `Our recommendation`: guidance.
5. **Threats are sector patterns.** The Threats lede must state: "Nothing here implies an incident at {{CUSTOMER}}."
6. **Dashboards are illustrative.** Tag every one "Illustrative data". A value may be called "reported" only if it is cited.
7. **Classify every use case and play against what the customer owns:**
   - "New use case on what you already run": all products are owned;
   - "Extends what you run": some are owned;
   - "New capability": none are.

   Show the totals in the Story section.
8. Hedge authorization and availability (FedRAMP, IL levels, regional support) with a "confirmed during design" caveat.

## 4. Page anatomy, section by section

**Sticky top bar.**
- Lockup: Cisco bars-logo SVG | `splunk>` with "a Cisco company" | **{{CUSTOMER}}** with "IT leadership briefing".
- Then 12 anchor links: Digital Twin, For IT Leadership, Our Work Together, Story, Alignment, Threats, Departments, Dashboards, Cloud Control, Federal (rename it to fit {{MISSION_CUSTOMERS}}), Roadmap, Sources.
- Style it as glass (`rgba(2,7,16,.86)` with a 14 px blur) at 60 px tall.
- On mobile the nav becomes a horizontally scrollable row. The page itself must never scroll sideways.

**0. Hero `#twin` (100vh, min 680 px).** A full-bleed canvas behind a left rail about 540 px wide. The rail holds:
1. A cyan kicker, "PREPARED FOR {{CUSTOMER}} IT LEADERSHIP, {{BRIEFING_DATE}}".
2. The H1 in three runs: "{{CUSTOMER}}," in white, then **"operated by agents,"** in a cyan gradient, then **"grounded in one data fabric"** in a magenta-to-orange gradient that spans the wrapped lines.
3. A two-sentence lede ending "Click any site, or press play to walk the story."
4. The "Listen to the security briefing / N minute narrated overview" button.
5. A **3×2 KPI grid**.
6. The **story card**, pinned at the bottom of the rail.

Elsewhere on the hero:
- Top right: layer chips (All layers, Operations, + Splunk fabric, + Cloud Control) with a red-outlined "Simulate attacks" toggle below them.
- A right-side asset drawer that opens when a site is clicked.
- Bottom right: the legend strip (territory, transmission, Splunk ingest, agent actions, threat path).
- Bottom center: "Scroll for the full brief".

**1. `#leadership`: For IT leadership / "What this means for {{CUSTOMER}} IT".**
- Six outcome cards in a 3-column grid. Each card has a colored tag:
  - "Builds on what you run" (magenta);
  - "Supports our current work" (orange);
  - "Extends the platform" (cyan).

  Then a title that states the outcome, one sentence, citations, and "Explore →" linking to a section.
- Then "Proposed next steps": 4 numbered items, each a bold title plus one line.

**2. `#account`: Our work together / the title of {{CURRENT_WORK}}.**
- A provenance legend, then a status strip.
- Two columns:
  - Left, "Public sources": what the regulation requires and what the platform offers. It holds 4–5 numbered pipeline tiers (Collect → Route → Store → Search → Evidence) with product chips, plus 6–8 research cards. Each card has a tag such as "CIP-015 R1", a title, a body and a "What it means" or "Our recommendation" footnote.
  - Right, "Our work together": collapsible `details` groups by theme. Each holds known insights and links back to the research cards; a link scrolls to its card and flashes it.
- Below the columns: the activity card ("Current activity" / "How we can help": 5–6 bullets, each linked to research), then "Open questions for your team" with 6 questions.

**3. `#story`: The thesis / "Three layers, one story".**
- The "What you already run" panel: the owned products with one line each; three counters (owned / extend / new use-case totals); three motions ("1. Get more from what you own", "2. Extend the platform", "3. Connect across Cisco"); and a caveat.
- A **4-layer stack diagram**, top to bottom:
  1. Cisco Cloud Control (agentic operations layer);
  2. splunk> Data Fabric, with owned items highlighted;
  3. Cisco infrastructure and security;
  4. {{CUSTOMER}} business functions.

  Each layer is a colored left band with its name, followed by item chips and citations.
- A 5-column thesis row of numbered claims with citations.

**4. `#alignment`: "What {{CUSTOMER}} is trying to accomplish, and where we help".**
- Tabs: Initiative cards | Initiative x product matrix.
- Each of the 12 cards has an icon, a title, **Evidence** (cited), **Challenge**, two columns of Splunk and Cisco bullets, product chips and an own-line.
- The matrix has initiatives as rows and every product used as a column, with ● marks. It scrolls horizontally inside its wrapper.

**5. `#threats`: "What {{CUSTOMER}}'s peers and the sector are reporting".** Twelve cards in 3 columns. Each has a severity tag (critical red, high orange, medium yellow) with a matching top border, a title, a cited body, and a darker **Counter** box that names the controls.

**6. `#personas`: Departments and personas.**
- 12 department tabs.
- Each department has a head (name plus subtitle), then 3 persona cards. Each card shows an initials avatar, a role, a goal, and 3 ordered use cases. Each use case has a title, a sentence, product chips and an own-line.
- Each card ends with an `Open "<dashboard>" dashboard →` button.

**7. `#dashboards`: "What each persona would see".**
- On the left, a list of 12–16 dashboards grouped by department. On the right, a mock of Splunk Dashboard Studio:
  - a dark app bar with a `splunk>` mini-logo, the app name, tabs (Dashboards, Search, Findings, AI Assistant) and the persona;
  - a title, filter pills, and an "Illustrative data" tag;
  - a 12-column panel grid.
- Panel types: kpi + sparkline, line, bars, hbars, donut, gauge, heat, table, tiles, feed (agent reasoning trace) and spl (code).
- Use a seeded PRNG so values stay stable from load to load.

**8. `#agentic`: Cisco Cloud Control / "AgenticOps across Cisco, Splunk and everything else".**
- 4 capability cards: One login, one data layer · Agent Builder · App Builder · Governed and observed.
- The **ecosystem constellation**, in 4 columns:
  - Cisco products as cyan chips;
  - the center core, "Cisco Cloud Control / on the Splunk data fabric", with two animated rings;
  - Splunk products as magenta chips, with owned and included states;
  - third-party integrations, plus "{{CUSTOMER}}-relevant targets via MCP (examples)" as dashed chips.
- "Agents we could build together in Cloud Control Studio": 8 agents in a list on the left, and on the right a run trace with:
  - meta rows: Trigger, Splunk data as `index=` code chips, Tools, Guardrail (AI Defense);
  - 8 typed steps (Signal → Reason → Tool → Tool → Proposal → Human → Action → Verify) that reveal one at a time, with "Replay run";
  - a footer of 3 assurance tags.
- Clicking an agent orb in the twin scrolls here and opens that agent.

**9. `#federal` (or a mission-customer section): "Supporting {{MISSION_CUSTOMERS}}".** Two columns. Left: installations or relationships (cited). Right: what they need, then a numbered "How we help" list, an authorization caveat, and an "Open dashboard" button.

**10. `#plays`: Roadmap options / "Where we can help next".**
- A value-vs-effort **bubble chart** (SVG, 520×340): impact on y, effort on x, a green-tinted "Quick wins" quadrant, numbered colored bubbles, and a legend.
- Beside it, **Sequencing**: three columns, "Now: …", "Next: …" and "Then: …", anchored to the cited deadlines, with a caveat that lists the anchors.
- Then 8 play cards, each holding:
  - a number badge, a title, and "horizon | impact x/10 | effort y/10";
  - a cited "why";
  - "How we would start" (3 steps), "Questions for a working session" and "How you would measure it";
  - product chips and an own-line.

**11. `#sources`: Evidence / "Sources and method".** Six method notes in a 3×2 grid: Public sources (with the research cut-off date) · Sector patterns · Illustrative dashboards · What you run today · How to read the labels · Confirmed during design. Then the ordered source list, where each `li#src-sN` holds a link (new tab) and "Org, date".

**Footer:** prepared-by line, illustrative-data note, availability caveat and trademarks.

## 5. The hex twin

Write `scene.js`, which exports `createScene(stageEl, labelsEl)` and returns `{onSelect, onAgent, pause, flyTo, setLayer, setThreat, select}`.

- **Projection:** an equirectangular projection centered on {{WHERE}}: `x=(lon-lon0)*k*cos(lat0)`, `z=(lat0-lat)*k`. Choose `k` so the territory spans about 50 world units. North points away from the start camera.
- **Territory:**
  - Hand-trace a simplified polygon of 15–30 vertices for each state or region in {{WHERE}}.
  - Fill the polygons with a pointy-top hex lattice of radius about 0.9 and render it as one `InstancedMesh` of short hex prisms (height 0.3–1.4, varied by noise).
  - Prism tops are near-black (#05080f) with a faint emissive rim.
  - Draw hex **edges** as a second instanced line or thin-ring mesh with additive blending, colored per region: magenta #e5007e for the core, amber #f7931e for the secondary regions, and cyan near the coast.
  - Float spaced uppercase region labels (letter-spacing .4em, opacity .35), including the ocean or neighbor name.
- **Floor:** a huge cyan square grid (`GridHelper` or a shader plane) on y = 0, fading into fog (#00243f). Light it with a cyan hemisphere light and add a bluish vertical background gradient.
- **Sites:**
  - Place one emissive sphere or beacon per entry in {{KEY_ITEMS}}, colored by department.
  - Each gets a `CSS2DObject` label: a dark pill with a colored dot and the short name. Add an italic place suffix for sites outside the territory.
  - Raycast clicks to open the asset drawer, which shows the department tag, name, function, "What the public record says" (cited facts), "Where Splunk and Cisco help", and buttons for "Personas and use cases" and "Open mock dashboard". Add a pulsing focus ring on the selected site.
  - The catalyst site (merger partner or flagship project) gets a tall additive **light beam** with a ground ring.
- **Layers:**
  - `ops`: hexes and sites.
  - `fabric`: adds the grid floor glow, rising orange "Splunk ingest" particle streams from each site, and the callout "splunk> Cisco Data Fabric — {owned and platform products}".
  - `agentic`: adds a bright **Cloud Control core** sphere about 18 units above the territory, two tilted elliptical rings, and **8 agent orbs** orbiting slowly. Each orb has a pill label and is clickable (`onAgent`). Add sky-blue arcs from each orb to its department's site, and the callout "Cisco Cloud Control AgenticOps — AI Canvas, Agent Builder, App Builder, AI Defense, Splunk AI Agent Monitoring".
  - `all`: everything.
- **Simulate attacks:** 5–7 red quadratic arcs from off-territory origins to OT, grid and HQ sites, each with a moving head particle and a pulsing red ring at the target.
- **Camera:** `PerspectiveCamera` with a fov of 40. Start from chapter 0's `cam`. `flyTo(p, t, 2.6)` eases position and target with cubic ease-in-out. Add light pointer-drag orbit and a slow idle drift.
- **Glow:** `UnrealBloomPass` at strength 0.9–1.2, radius 0.6 and threshold 0.15. `devicePixelRatio` is capped at 1.75.
- **Labels:** the CSS2D overlay is depth-sorted. Labels behind the camera or behind the far fog are hidden.

## 6. Design tokens

```
--bg #020710  --panel rgba(6,22,42,.78)  --panel-2 #0a1f38  --line rgba(120,170,220,.16)
--ink #e6edf5  --ink-2 #c2cfde  --muted #869bb3
--cyan #00bceb  --pink #e5007e  --orange #f7931e  --green #2ecc9a  --purple #a78bfa
--yellow #ffcc00  --red #ff4d4f  --grey #6b7785  --blue-2 #60a5fa  --sky #22d3ee
grad  = linear-gradient(90deg,#0a8fc0,#5fd6f0)      // H1 run 2
grad2 = linear-gradient(90deg,#e5007e,#f7931e)      // H1 run 3, primary buttons
```

- **Type:**
  - Inter throughout.
  - H1: clamp(34px, 3.1vw, 54px), weight 800, letter-spacing -.02em, line-height 1.04.
  - H2: 34 px, weight 800.
  - Card H3: 17 px, weight 700.
  - Body: 15–16 px, line-height 1.55.
  - Kicker: 12 px, uppercase, letter-spacing .14em, cyan.
- **Radii:** 8 px for tiles and square buttons, 12 px for cards, 14 px for the story card, 999 px for chips and pills.
- **Surfaces:** cards use a 1 px `--line` border on `--panel` with a 10 px backdrop blur over the canvas. Hover brightens the border toward cyan.
- **Spacing:** sections are capped at 1240 px with 96 px of top padding and `scroll-margin-top: 72px`. Grid gaps are 14–18 px.
- **Overall look:** dark only; glow comes from WebGL, not from CSS shadows.

## 7. Component specs

- **KPI tile:** the value (21 px, 700, `--ink`) over a muted two-line label, then citation chips. It has a `title` attribute.
- **Citation chip `a.cite`:** about 15×15 px at 10 px weight 700, cyan text on `rgba(0,188,235,.16)` with a 3 px radius. It sits after the claim with no brackets. When its target is reached, the target flashes for 1.6 s.
- **Provenance badge `.prov.r|a|i`:** a pill. `r` is cyan, `a` is magenta and `i` is orange; `.sm` makes it smaller.
- **Product chip `.chip.splunk|cisco`, with `.owned` (solid dot) or `.incl` (dashed):** the tooltip says "{{CUSTOMER}} already runs this" or "Included with …".
- **Own-line:** a classification label plus "In place today: …" and "Adds: …".
- **Story card:** a glass panel holding:
  - an orange kicker plus "n / 10";
  - the title (22 px);
  - a cited body;
  - the audio row: an equalizer pill reading "Audio briefing", a progress track, the time, and an MP3 or Script chip;
  - controls: ←, a gradient "Play story" / "Pause story" button, →, and 10 dots.
- **Threat card:** severity tag, top border, title, body and a **Counter** inset.
- **Lead card, pillar, research card, play card, persona card, agent run:** as described in section 4.
- **Ecosystem diagram:** the 4-column constellation with the ringed core. On mobile it stacks, with the core first.
- **Roadmap:** the bubble SVG plus three sequencing columns.
- **Sources list:** an ordered list with ids.

## 8. Audio briefing

1. Write a 10-chapter narration script, `story[i].say`, of 55–80 words per chapter and about 5–6 minutes in total. Use the same facts as the chapter bodies, in a spoken register with no citation numbers.
2. **The production audio is rendered offline**, one MP3 per chapter (`audio/{id}.mp3`), then concatenated into `audio/briefing.mp3` with `ffmpeg -f concat`. Render it with any of these:
   - edge-tts (`en-US-AndrewMultilingualNeural`);
   - Gemini TTS (`gemini-2.5-flash-preview-tts`);
   - ElevenLabs (multilingual v2).

   Embed small files as base64, or ship `audio/` beside the HTML.
3. **In the single-file build**, set `AUDIO_MODE='speech'`:
   - Read each chapter with `speechSynthesis`, preferring an en-US natural voice, at rate 1.0.
   - On `onend`, advance to the next chapter.
   - Estimate progress at 150 words per minute.
   - The chip says "Script" and opens a dialog with the full narration.
   - If speech is missing, "Read script" opens the same dialog.
   - Starting audio stops "Play story", and starting "Play story" stops audio.
4. "Play story" without audio advances chapters every 9 s. Each chapter calls `flyTo(cam.p, cam.t, 2.6)`, sets its layer (a `threat` chapter means `all` plus `setThreat(true)`) and selects `focus`. Once you are past chapter 0, `body.story` fades the H1, lede and KPIs so the map shows through.

**Chapter arc (10 chapters):**

| Chapter | Content |
|---|---|
| Prologue | The territory and everything in it |
| Acts I–III | The three biggest operating stories (growth, generation, build-out) |
| Act IV | The threat (`layers:'threat'`) |
| Act V | Splunk as the fabric (`fabric`) |
| Act VI | Cloud Control agentic ops (`agentic`) |
| Act VII | Mission or critical customers |
| Act VIII | {{CURRENT_WORK}} |
| Epilogue | {{CATALYSTS}} |

## 9. Data schema

Keep every piece of content in `src/data/*.js` and render from it.

```ts
Source     { id, org, date, title, url }
Kpi        { v, l, s:[sourceId] }
Chapter    { id, kicker, title, body, say, s, cam:{p:[x,y,z], t:[x,y,z]}, focus:assetId|null, layers:'ops'|'fabric'|'agentic'|'threat' }
Asset      { id, name, short, type, lat, lon, fn, facts:[{t,s}], plays:[string], dept, where? }
Product    { [key]: { name, fam:'splunk'|'cisco', owned?, incl? } }
Initiative { id, name, icon, evidence, s, challenge, splunk:[], cisco:[], products:[key] }
Threat     { name, sev:'critical'|'high'|'medium', body, s, counter }
Dept       { id, name, sub, color, personas:[{ role, dash, goal, uses:[{t, d, p:[key], s?}] }] }
Agent      { id, name, dept, trigger, data:[index], tools:[], guard, steps:['Signal: …', …] }
Play       { id, name, impact, effort, horizon, products, why, s, motion:[3], ask, metric }
Research   { id, tag, title, body, s, so }   Tier { k, t, d, p, s }
Account    { meeting:{title, source}, points:[{theme, t, d}], activities:[{t, owner, status, research, support:[{d, research}]}] }
Dashboard  { [id]: { title, app, persona, dept, filters, panels:[{type, w, h?, t, …}] } }
```

## 10. Quality checks and review

- No console errors or warnings from your code. No network requests after load: fonts are inlined and there is no CDN.
- Check with Playwright at 1440×900, 1280×720 and 390×844. Launch Chromium with `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader` so WebGL renders headless. At each size:
  - take a full-page screenshot and viewport shots of the hero, the KPIs and story card, the threats, and the Cloud Control or roadmap section;
  - confirm `document.documentElement.scrollWidth <= innerWidth` (no horizontal overflow);
  - click each layer chip, Simulate attacks, a site, Play story, →, and an agent orb.
- Read your screenshots and fix layout, color, type, spacing and behavior. Do at least two passes.
- **Content audit:**
  - every number is cited;
  - every citation resolves to a list entry;
  - nothing is marked "reported" without a source;
  - the threats lede carries the no-incident line;
  - every dashboard is tagged illustrative;
  - the own-line counts in Story match the data.
- **Accessibility:**
  - every button has a name;
  - focus is visible;
  - text contrast is at least 4.5:1;
  - `prefers-reduced-motion` stops the idle drift and the ring animations.

## 11. Deliverables

1. `app/`: the Vite project (`index.html`, `src/main.js`, `src/scene.js`, `src/data/*.js`, `src/styles.css`, `vite.config.js`).
2. `dist/{{CUSTOMER}}-briefing.html`: one self-contained file.
3. `audio/script.md`: the 10-chapter narration, plus the exact TTS commands to render the MP3s.
4. `shots/`: review screenshots.
5. A short README covering how to run, how to build, how to swap in real MP3s (`AUDIO_MODE='mp3'`), and the source cut-off date.
