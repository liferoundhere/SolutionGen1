# Type C: Leadership Digital Twin Page (reverse-engineered spec)

**Reference:** https://hollow-flame-f2tf.here.now/ is "Dominion Energy and Splunk, a Cisco company | IT Leadership Briefing".

**Evidence used.** The live host could not be reached from this container: the proxy returns 403, Firecrawl had no credits, and WebFetch has no DNS for the host. Everything below comes from a capture made earlier in this session, now kept in `research/`:

- `raw.html`: the rendered DOM after JS ran, 166 KB.
- `bundle.js`: the Vite entry chunk `assets/index-BZhB-nM2.js`, 147 KB.
- `page.md`: a text render of the page.
- `original-hero-1920.png`: a 1920x1080 viewport shot of the hero.

All of the content data was pulled verbatim from the bundle into `research/data.json`: 65 sources, 20 assets, 32 products, 6 KPIs, 10 chapters, 12 initiatives, 12 threats, 12 departments, 8 agents, 8 plays, the federal block, 8 CIP research cards, 5 tiers, 6 questions, 8 themes, the account block and 16 dashboards.

**What was not captured:**
- The CSS file (`assets/index-ljURABLS.css`). The design tokens below were sampled from the screenshot's pixels and inferred from class names, so treat exact values as close matches, not copies.
- The lazy scene chunk (`scene-lyyCIr13.js`).

---

## 1. Stack and build

| Concern | Original | Notes |
|---|---|---|
| Bundler | **Vite**: hashed `assets/index-*.js` and `index-*.css`, the modulepreload polyfill, and `__vitePreload` for a dynamic import | Vanilla ES modules with no UI framework. All DOM is built from template strings (`innerHTML`) plus a small `el(tag, cls, text)` helper. |
| 3D | **Three.js r169**: the canvas carries `data-engine="three.js r169"`. It lives in a lazy chunk, `import("./scene-*.js")`, so the entry chunk holds no Three.js code. | An earlier note said the page used raw WebGL. That came from grepping the entry chunk only. The 3D is in fact Three.js, code-split. |
| Labels | A DOM overlay, `#labels > .label-layer`, whose children carry `transform: translate(-50%,-50%) translate(Xpx,Ypx)` and depth-sorted `z-index` | This is the exact signature of Three.js `CSS2DRenderer`. |
| Glow | Strong bloom on orbs, beams and the core | Consistent with `EffectComposer` + `UnrealBloomPass`. |
| WebGL guard | `canvas.getContext('webgl2') \|\| getContext('webgl')` | If both fail, `#stage` shows `.nogl` with "WebGL is not available in this browser. The brief below is fully readable." |
| Perf | An `IntersectionObserver` on `#twin` (threshold .02) calls `scene.pause(!visible)` | The render loop stops once the user scrolls past the hero. |
| Audio | One `new Audio()`, `preload="auto"`. Each chapter has its own MP3 at `./audio/{chapterId}.mp3`; on `ended` the player moves to the next chapter. The full `./audio/briefing.mp3` (5:40) is offered as a download link. | So the original is a multi-file `dist/`: `index.html`, `assets/` and `audio/`. |
| Fonts | Inter-style grotesk (geometric "a", tight bold display) | |
| Output of the rebuild | **One self-contained HTML file.** `vite-plugin-singlefile` inlines the JS, the CSS and the Inter woff2 files (`@fontsource/inter`). Three.js is still code-split in source but inlined at build. | Audio in the single file uses `speechSynthesis` reading the chapter script, with a labeled fallback (see section 9). |

### Scene module contract (from the bundle's calls)

The page calls `createScene(stageEl, labelsEl)`, which returns:

- `onSelect(cb(assetId|null))`: a site was clicked. The page opens `#assetPanel`.
- `onAgent(cb(agentId))`: an agent orb was clicked. The page scrolls to `#agentic` and shows that agent's run.
- `pause(bool)`: stop or start the render loop.
- `flyTo(posVec3, targetVec3, seconds)`: eased camera move. The story uses 2.6 s.
- `setLayer('all'|'ops'|'fabric'|'agentic')`.
- `setThreat(bool)`: turn the attack paths on or off.
- `select(assetId|null)`: highlight a site and draw its focus ring.

---

## 2. Page anatomy (in order)

The **sticky top bar** (`header.topbar`) is a three-part lockup followed by the nav:

- **Lockup:** the Cisco bars-logo SVG (9 rounded bars, "CISCO" under them), a divider, `splunk>` with the small caption "a Cisco company", a divider, then the customer name in bold with the caption "IT leadership briefing".
- **Nav:** 12 anchor links: Digital Twin `#twin`, For IT Leadership `#leadership`, Our Work Together `#account`, Story `#story`, Alignment `#alignment`, Threats `#threats`, Departments `#personas`, Dashboards `#dashboards`, Cloud Control `#agentic`, Federal `#federal`, Roadmap `#plays`, Sources `#sources`.
- **Mobile:** the nav becomes one horizontally scrollable row under the lockup. Only the nav scrolls, never the page.

| # | Section id | Kicker / H2 | Layout |
|---|---|---|---|
| 0 | `#twin` (hero, 100vh) | "Prepared for … October 2026" / H1 in 3 color runs | A full-bleed canvas. **Left rail**, about 540 px wide: kicker, H1, lede, "Listen" button, a 3×2 KPI grid, and the chapter card pinned to the bottom. **Top right:** layer chips, with "Simulate attacks" below them. **Right:** an asset drawer. **Bottom right:** the legend strip. **Bottom center:** "Scroll for the full brief". |
| 1 | `#leadership` | For IT leadership / What this means for {customer} IT | A 3-column grid of 6 `lead-card`s, each tagged own, act or ext. Below it, a "Proposed next steps" panel holding a numbered list of 4. |
| 2 | `#account` | Our work together / {current engagement} | A provenance legend, then a status bar, then 2 columns. The **research** column holds 5 numbered tiers and 8 `rcard`s. The **team** column holds `details` groups of known-insight points. Below the columns: the activity card ("How we can help" list plus source links), then an open-questions list. |
| 3 | `#story` | The thesis / Three layers, one story | The "What you already run" panel: 3 owned products, 3 counters (owned/extend/new use cases) and 3 motions. Then a **4-layer stack diagram**: Cisco Cloud Control, splunk> Data Fabric, Cisco infrastructure, customer business functions. Then a 5-column `thesis` row. |
| 4 | `#alignment` | Sourced alignment / What {customer} is trying to accomplish, and where we help | Tabs for "Initiative cards" and "Initiative x product matrix". There are 12 `init` cards in a 2- or 3-column grid; the matrix is a scrollable table. |
| 5 | `#threats` | Threat landscape / What {customer}'s peers and the sector are reporting | A 3-column grid of 12 `threat` cards, each with a severity tag and a **Counter** box. |
| 6 | `#personas` | Departments and personas / Every department, every persona, multiple use cases | A tab row of 12 departments. Each opens a head plus a 3-column grid of `persona` cards with an avatar of initials and an ordered list of use cases (chips plus an own-line). |
| 7 | `#dashboards` | Mock dashboards / What each persona would see | A list in the left column (grouped by department) and a dashboard view on the right that imitates Splunk Dashboard Studio: a dark bar, filters, an "Illustrative data" tag and a 12-column panel grid. |
| 8 | `#agentic` | Cisco Cloud Control / AgenticOps across Cisco, Splunk and everything else | 4 `pillar`s, then the **ecosystem constellation**: Cisco column, a ringed core, a Splunk column, and a third-party plus customer-targets column. Then "Agents we could build together": an agent list on the left and a run trace with 8 typed steps on the right. |
| 9 | `#federal` | Mission assurance / Supporting your DoD and DC-area federal customers | 2 columns. Left: installations. Right: needs, then a numbered "How we help", a caveat, and an "Open dashboard" button. |
| 10 | `#plays` | Roadmap options / Where we can help next | A value-vs-effort **bubble SVG** with a legend, beside a 3-column **Now / Next / Then** sequencing roadmap. Below them, 8 `play` cards. |
| 11 | `#sources` | Evidence / Sources and method | 6 method notes in a 3×2 grid, then an ordered source list where each item has the id `src-sN`. |
| — | `footer.foot` | Disclaimer, illustrative-data note and trademarks | |

Sections use `.sec`: max-width about 1240 px, centered, and roughly 96 px of top padding (`scroll-margin-top` clears the sticky bar). A `.sec-head` holds the kicker, an H2 of about 36 px and a lede paragraph capped at about 760 px. Where a section's content is all public, the kicker carries an inline `prov r sm` "Public sources" badge.

**Mobile (≤ 900 px):**
- The hero canvas becomes about 62vh and the rail flows below it as normal content.
- Every grid drops to 1 column. The constellation stacks and the dashboard list becomes a horizontal scroller.
- Tables scroll inside their wrapper.
- The layer chips wrap.

---

## 3. Design tokens (sampled)

```
--bg:        #020710   page and top bar (topbar uses rgba(2,7,16,.86) + backdrop-filter blur 14px)
--panel:     #05172b   KPI tile and card fill (≈ rgba(6,22,42,.78) over the scene)
--panel-2:   #0a1f38   raised fill (buttons, the audio row)
--line:      rgba(120,170,220,.16)   1px card borders; hover rgba(0,188,235,.45)
--ink:       #e6edf5   headings and KPI values
--ink-2:     #c2cfde   body
--muted:     #869bb3   captions, legend
--cyan:      #00bceb   Cisco blue: kicker, active chip, citations, dots
--pink:      #e5007e   Splunk magenta
--orange:    #f7931e
--green:     #2ecc9a
--purple:    #a78bfa
--yellow:    #ffcc00
--red:       #ff4d4f   (threat path #ff6b6b)
--grey:      #6b7785
--blue-2:    #60a5fa   --sky: #22d3ee   --cisco-deep: #049fd9
H1 run 2 (grad):  linear-gradient(90deg, #0a8fc0, #5fd6f0)
H1 run 3 (grad2): linear-gradient(90deg, #e5007e, #f7931e). It spans the wrapped lines, so the last word is orange.
Primary button:   linear-gradient(90deg, #e5007e, #f7931e), white 700 text
```

**Type:** Inter in weights 400, 500, 600, 700 and 800.

| Role | Size | Weight | Other |
|---|---|---|---|
| H1 | clamp(34px, 3.1vw, 54px) | 800 | letter-spacing -.02em, line-height 1.04 |
| H2 | 34–36 px | 750–800 | |
| Card H3 | 17 px | 700 | |
| Body | 15–16 px | | line-height 1.55 |
| Kicker | 12 px | 700 | uppercase, letter-spacing .14em, cyan (chapter kicker is orange) |
| KPI value | 21 px | 700 | |
| KPI label | 12.5 px | | muted |

**Radii:** KPI tile 8 px, chapter card 14 px, regular card 12 px, chips and buttons 999 px (the arrow buttons are 8 px).

**Shadows:** cards have nearly none. Glass panels use `0 10px 40px rgba(0,0,0,.35)`. Glow comes from the WebGL scene, not from CSS.

---

## 4. Components

- **KPI tile (`.kpi`):** value in bold over a two-line muted label, followed by citation chips. The six tiles sit in a 3×2 grid with a 10 px gap. Each has a `title` attribute of "value: label".
- **Citation chip (`a.cite`):** a small cyan-tinted square badge, about 15×15 px at 10 px bold. Its background is rgba(0,188,235,.16) and its text is cyan. It shows the source's ordinal number, links to `#src-sN`, and its `title` is the source title. It sits after the claim with no brackets.
- **Provenance badge (`.prov`):** a pill in one of three kinds:
  - `r` = Public sources: cyan outline;
  - `a` = Our work together, Known insight or Current activity: magenta;
  - `i` = Our recommendation or How we can help: orange.

  A `sm` modifier makes it smaller.
- **Product chip (`.chip.{fam}`):** `splunk` chips are magenta-tinted and `cisco` chips are cyan-tinted. Modifiers:
  - `.owned` adds a solid left dot and the tooltip "{customer} already runs this";
  - `.incl` adds a dashed border and the tooltip "Included with ES Premier".
- **Own-line (`.own-line.{owned|extend|new}`):** the classification for each use case or play. "New use case on what you already run" means every product is owned. "Extends what you run" means some products are owned. "New capability" means none are. It also lists "In place today: …" and "Adds: …".
- **Hero listen button (`.hero-listen`):** a glass rectangle with a 5-bar animated equalizer, the bold line "Listen to the security briefing" and the muted line "5 minute narrated overview".
- **Story card and audio player (`.chapter-card`):** a glass card, 14 px radius. It contains:
  - A kicker row: an orange kicker such as "Prologue" or "Act IV" on the left, "n / 10" on the right.
  - An H2 at 22 px.
  - The body with citations.
  - `.cc-audio`: a pill-outlined row holding a listen pill (equalizer plus "Audio briefing"), a progress track, the time ("5:40" when idle, "m:ss / m:ss" when playing) and an "MP3" download chip.
  - `.cc-ctrl`: ← and → square buttons, a gradient "Play story" / "Pause story" button, and 10 dots on the right with the active one in cyan.
- **Threat card (`.threat.sev-{critical|high|medium}`):** a severity tag with uppercase text, critical in red, high in orange and medium in yellow. There is a matching 3 px top border, then an H3 and a body with citations. The **Counter** box sits below: a darker inset with a cyan "Counter" label and the mitigation sentence.
- **Lead card (`.lead-card.{own|act|ext}`):** a colored `lc-k` label ("Builds on what you run" / "Supports our current work" / "Extends the platform"), an H3, a body and "Explore →". The whole card links to a section.
- **Capability card (`.pillar`):** an H4 and a paragraph with citations, set in a 4-column grid.
- **Ecosystem constellation:** 4 columns. Cisco items are cyan chips, Splunk items are magenta chips (owned and included states apply), and third-party items are neutral chips; the customer's MCP targets are dashed chips. The center core has two concentric animated rings around "Cisco Cloud Control / on the Splunk data fabric".
- **Agent run:** a header with "{dept} agent" and a "Replay run" button. Meta rows: Trigger, Splunk data (`code` chips reading `index=x`), Tools, and Guardrail (AI Defense). Then 8 steps, each with a typed key (Signal, Reason, Tool, Proposal, Human, Action, Verify) and its own color. Steps reveal one by one. A footer row shows 3 assurance tags.
- **Roadmap:**
  - The bubble SVG (520×340) plots impact (y) against effort (x). The "Quick wins" quadrant is tinted green, and numbered circles are colored per play.
  - The sequencing block has 3 columns, "Now: …", "Next: …" and "Then: …", each holding stacked items.
  - A caveat lists the date anchors with citations.
  - Each play card has a number badge, an H3, a "horizon | impact x/10 | effort y/10" line, a "why" paragraph, two columns ("How we would start" as an ordered list; "Questions for a working session" plus "How you would measure it"), product chips and an own-line.
- **Sources list:** an ordered list where each `li#src-sN` holds a link (opens in a new tab) and an "Org, date" line. When the page arrives at a source, it flashes.
- **Dashboard panels:** kpi with sparkline, line (multi-series with an optional threshold), donut, hbars, bars (stacked), gauge, heat, table (cells written `!crit|182` render as a severity pill), tiles (ok/warn/crit), feed (agent trace) and spl (code). Series come from a seeded LCG, so values are stable from load to load.

---

## 5. Hex twin

- **Frame:**
  - World units: x runs east and z runs south, with `x ≈ (lon + 78.2) × 4.6` and `z ≈ (36 − lat) × 5`.
  - The territory spans roughly x −20…30 and z −20…25.
  - A huge cyan square-grid floor (Splunk fabric) extends to the horizon, fading into a deep blue fog of about #00243f.
- **Hex territory:**
  - A pointy-top hex lattice clipped to the service-territory polygons (VA, NC, SC here).
  - Each hex is a short **extruded prism** with a near-black top (#05080f).
  - Hexes have **glowing edges**, tinted by layer: magenta in the core territory, amber/orange toward the coast and the south, cyan near the fabric.
  - A small random height variation gives an "ops terrain" look.
  - State names float as spaced uppercase labels (`.state-lbl`, letter-spacing .4em, low opacity), and so does "ATLANTIC OCEAN".
- **Sites (20):**
  - Each site is a glowing orb or beacon at its lat/lon, colored by department.
  - Its label (`.asset-lbl`) is a dark pill with a colored dot and the short name. Out-of-territory sites get an italic place suffix, for example "Millstone *Waterford, CT*".
  - Click a site to select it: a focus ring appears and the asset drawer opens with the department tag, name, function, "What the public record says" (facts with citations), "Where Splunk and Cisco help", and buttons for "Personas and use cases" and "Open mock dashboard".
  - The merger partner site (NextEra) is a tall **light beam** of cyan-white with a ground ring.
- **Layers** (the chips: All layers, Operations, + Splunk fabric, + Cloud Control):
  - `ops`: hexes and sites only.
  - `fabric`: adds the cyan grid plane, upward "ingest" particle streams from each site to the fabric, and the `splunk>` Cisco Data Fabric callout (`.layer-lbl.splunk`), which lists the platform products.
  - `agentic`: adds the **Cloud Control orbit**: a bright core sphere floating above the territory, 2–3 elliptical rings, and the 8 agent orbs on the ring, each with a label (`.agent-lbl`) and clickable. It also adds the "Cisco Cloud Control AgenticOps" callout (`.layer-lbl.cisco`) and thin "agent action" arcs from orbs down to sites.
  - `all`: everything.
- **Simulate attacks** (toggle, red-tinted outline): red "threat path" arcs travel from outside the territory to OT and grid sites, with pulsing red rings on their targets. The chip turns solid red while it is on.
- **Legend strip** (bottom right): Dominion territory (dark slate), Transmission (cyan), Splunk ingest (orange), Agent actions (sky), Threat path (red). Each is a 14×3 px swatch.
- **Camera:**
  - A perspective camera with a fov of about 40°.
  - The start view is chapter 0's `cam.p=[0,52,60]`, `t=[-2,0,2]`.
  - `flyTo` eases both position and target over 2.6 s with cubic ease-in-out.
  - Drag orbits gently and the view auto-drifts slowly. The idle orbit and pulse animations run at all times.
- **Labels:** depth-sorted DOM overlay with pointer events only on the asset pills and agent pills. Labels behind the camera are hidden.

---

## 6. Interaction model

- **Anchors:** native `href="#id"` with `html{scroll-behavior:smooth}` and `scroll-margin-top: 72px`. Internal "go" links use `scrollIntoView({behavior:'smooth'})`. Citation and research links scroll to the target with `block:'center'`, then add `.flash` for 1.6 s.
- **Layer chips:** exactly one of `[data-layer]` has `.on`; the scene receives `setLayer`. Simulate attacks toggles independently.
- **Story playback:**
  - Index `b` lives in the range 0–9. ← and → wrap around.
  - Moving to a chapter does three things: `flyTo(cam.p, cam.t, 2.6)`, sets the layer (a `threat` chapter means `all` plus `setThreat(true)`), and selects `focus` when it is set.
  - "Play story" advances every **9 s**.
  - "Audio briefing" or the hero "Listen" button starts narration from the current chapter (from 0 if it is on the last). When a chapter's audio ends, it moves to the next chapter, and narration stops after the last.
  - Any chapter beyond 0, or active playback, adds `body.story`. This fades the hero title, lede and KPIs so the map shows, leaving the chapter card visible.
  - Starting the audio stops "Play story", and starting "Play story" stops the audio.
- **Pause:** the render loop pauses once the hero leaves the viewport.
- **Tabs:** alignment (cards or matrix), departments (12), dashboards (list), and agents (list, each with replay).

---

## 7. Data schema (see `research/data.json`)

```ts
Source     { id:'s1', org, date:'YYYY-MM[-DD]', title, url }            // ordinal = array index + 1
Kpi        { v:'$65B', l:'2026 to 2030 capital plan', s:['s1','s2'] }
Chapter    { id, kicker:'Prologue'|'Act I'…'Epilogue', title, body, s:[], cam:{p:[x,y,z], t:[x,y,z]}, focus:assetId|null, layers:'ops'|'fabric'|'agentic'|'threat' }
Asset      { id, name, short, type:'hq'|'datacenter'|'wind'|'nuclear'|'gas'|'hydro'|'solar'|'substation'|'federal'|'port'|'cx'|'beacon', lat, lon, fn, facts:[{t,s}], plays:[string], dept }
Product    { [key]: { name, fam:'splunk'|'cisco', owned?:true, incl?:'ES Premier' } }
Initiative { id, name, icon, evidence, s, challenge, splunk:[..], cisco:[..], products:[key] }
Threat     { name, sev:'critical'|'high'|'medium', body, s, counter }
Dept       { id, name, sub, color, personas:[{ role, dash, goal, uses:[{ t, d, p:[key], s? }] }] }
Agent      { id, name, dept, trigger, data:[index], tools:[..], guard, steps:['Signal: …','Reason: …','Tool: …','Proposal: …','Human: …','Action: …','Verify: …'] }
Play       { id, name, impact:1-10, effort:1-10, horizon, products, why, s, motion:[3], ask, metric }
Federal    { installations:[{n,d,s}], needs:[{t,d,s}] }
Research   { id:'rs-r1', tag, title, body, s, so }       // CIP/regulatory explainer cards
Tier       { k:'Collect', t, d, p:[key], s }             // numbered pipeline tiers
Account    { meeting:{title,source,attendees}, points:[{theme,t,d}], activities:[{t,owner,status,research:[rsId],support:[{d,research}]}] }
Dashboard  { [id]: { title, app, persona, dept, filters:[..], panels:[{ type, w:1-12, h?:2, t, ... }] } }
```

---

## 8. Citation and labeling rules

1. Every number, date and named fact about the customer or the sector carries at least one citation chip. Product capability claims cite vendor docs or press.
2. Sources are numbered in the order of the sources array, not the order they appear on the page. The same `sN` id always renders the same number.
3. Use three provenance labels and never mix them: **Public sources** (cited), **Our work together** (known account context, not cited), **Our recommendation** (Cisco and Splunk guidance).
4. Threats are **sector patterns**. The lede must say: "Nothing here implies an incident at {customer}."
5. Dashboards are illustrative. Each carries an "Illustrative data" tag, and only values tagged "reported" are real.
6. Owned products are marked "in place"; capabilities bundled in an owned SKU are marked "included".
7. Every product chip and use case shows its own-line classification, and the story section totals the counts: "13 use cases run entirely on what you already run / 20 extend / 20 need new capability".
8. Authorization and availability claims come with a caveat line ("confirmed during design").
9. The footer carries the disclaimer, the illustrative-data note and trademarks.

---

## 9. Audio briefing

- The script is 10 short chapter narrations of about 30–40 s each, roughly 5:40 in total. Each one expands on its chapter's body text in a spoken register.
- **The production MP3 is rendered offline.** Any of these works:
  - `edge-tts --voice en-US-AndrewMultilingualNeural --text … --write-media audio/{id}.mp3`;
  - Gemini TTS (`gemini-2.5-flash-preview-tts`, voice "Charon");
  - ElevenLabs `text_to_speech` (multilingual v2).

  Then concatenate them with `ffmpeg -f concat` into `briefing.mp3`. Ship `audio/` beside the page, or base64-inline small files.
- **The rebuild's single file** sets `AUDIO_MODE = 'speech'` and reads each chapter's script through `speechSynthesis`. It prefers an en-US natural voice and walks the chapters with `onend`. Progress is estimated from the word count at 150 words per minute. The MP3 chip becomes "Script" and opens the full narration text in a dialog. When `speechSynthesis` is missing, the button reads "Read script" and opens the same dialog.

---

## 10. Copy patterns

- **H1:** "{Customer}, **operated by agents**, **grounded in one data fabric**".
- **Lede:** "A 3D view of your critical business functions, the Splunk platform you already run beneath them, and Cisco Cloud Control orchestrating governed agents above. Click any site, or press play to walk the story."
- **Chapters:** kicker "Prologue / Act I…VIII / Epilogue" plus a short declarative title ("One territory. Every critical function."). The body is 2–3 sentences that end on what it means for data and agents.
- **Voice:** second person ("your teams", "you already run"). No hype. Sentences are short and concrete, with numbers, and active.
- **Lead cards:** an outcome as the title ("CIP-015 ready by Oct 2028") plus one sentence about how.
- **Threat counters:** a noun-phrase list of controls ("Engineering workstation behavior baselines (UEBA), Cyber Vision INSM, LOTL hunts in ES.").
- **Plays:** an imperative name, a "why" grounded in the customer's filings, 3 opening motions, discovery questions written as questions, and a metric.

---

## 11. What could not be verified (network blocked during this pass)

The live host could not be reached during this pass: here.now is blocked by policy, Firecrawl is out of credits, and WebFetch fails DNS. Only the earlier capture in `research/` was available, so the following points are unconfirmed:

- **The CSS is unseen.** The tokens in section 3 were sampled from the pixels of one 1920×1080 hero screenshot. Radii, spacing, section padding, card styles below the hero, and all hover and focus states are inferred, not copied.
- **No screenshots of the sections below the hero.** Their layouts were reconstructed from the rendered DOM (`raw.html`) and its class names (`lead-grid`, `threat-grid`, `constellation`, `rm`, and so on). Column counts are best guesses.
- **The mobile layout and breakpoints were never observed.** The ≤900 px behavior in section 2 is a design decision, not a measurement.
- **The scene chunk (`scene-*.js`) was not captured.**
  - Three.js r169 is confirmed by the canvas attribute.
  - CSS2DRenderer is confirmed by the label DOM signature.
  - Bloom, hex geometry, the projection constants, ring sizes, orbit speed, threat-arc styling and camera easing are inferred from the screenshot and from chapter `cam` values. The chapter targets match `x=(lon+78.2)*4.6, z=(36-lat)*5` to within about 1 unit, which suggests a similar equirectangular projection.
- **The audio files were not captured.** Per-chapter `audio/{id}.mp3` and the 5:40 `briefing.mp3` are known only from the bundle code. The voice, the TTS engine and the exact narration text are unknown.
- **Behavior was read from code, not observed:** story autoplay, the `body.story` fade and the drawer animation.

## 12. Rebuild implementation (app/)

- **Stack:** Vite 5.4, `three@0.169.0` (dynamic import), `@fontsource/inter` (latin woff2, inlined) and `vite-plugin-singlefile`. The output is `dist/dominion.html`, about 0.89 MB.
- **Data:** `app/src/data/data.json` is extracted verbatim from the original bundle. `static.js` holds the copy blocks, the narration and the state outlines.
- **Scene:** `app/src/scene.js` is described below.
  - Hexes: an `InstancedMesh` of hex prisms plus an additive `InstancedMesh` of edge rings.
  - Floor and glow: a `GridHelper` floor and UnrealBloom (0.95, 0.55, 0.42).
  - Labels: CSS2D.
  - On screens wider than 900 px, `setViewOffset` shifts the map right so the left rail does not cover it.
- **Audio:** `AUDIO_MODE='speech'` (Web Speech API). "Script" opens a dialog with the narration. `audio/script.md` holds the TTS commands for producing real MP3s.
