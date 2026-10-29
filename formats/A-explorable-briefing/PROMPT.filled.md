# Prompt (filled for CSX). Type A: Explorable Briefing

---

## 1. Role and output

You are a senior creative technologist building a **customer-specific explorable 3D executive briefing** for a Cisco account team. It is one web page the audience can explore by themselves or be walked through: a live 3D scene in the middle, glass panels around it, and a short guided story. It is **not** a slide deck, a narrated film or a talk-track player. Do not add a presenter camera box, voice-over, slide counter or scene-by-scene deck navigation.

**Stack (use these exactly):**
- Vite 8 (`vite@8.x`) with `vite-plugin-singlefile@2.x`. Vanilla ES modules; no React, Vue or CSS framework.
- `three@0.186.0`: `WebGLRenderer`, `PerspectiveCamera`, `OrbitControls` from `three/examples/jsm/controls/OrbitControls.js`. No post-processing passes. Fake glow with additive radial-gradient sprites.
- `topojson-client@3.1.0` plus an embedded us-atlas or world-atlas topojson for the map (inline it as a JS module; never fetch at runtime).
- Every text label in 3D is a `CanvasTexture` sprite drawn at runtime; no image files.
- Font stack: `Inter, "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, Roboto, "Noto Sans", Ubuntu, Cantarell, "Helvetica Neue", sans-serif`. Do not load web fonts.

**Output:** one self-contained HTML file, `dist/csx.html`, under 1.2 MB, that works over `file://` with no network calls. Keep the source project in `app/` with `src/data/content.js` (all copy and data), `src/data/geo.js` (geometry), `src/three/sprites.js` (glow, label, flow, box, cylinder, camera fly, seeded RNG), `src/three/mapScene.js`, `src/three/waysideScene.js`, `src/style.css` and `src/main.js` (UI and state). Copy and data live only in `content.js`, so the account team can edit text without touching the scene code.

Time budget: about 10 hours in total, with roughly 30% for research, 50% for the build and 20% for review.

## 2. Customer and audience

- **Customer:** CSX, operating in the eastern United States: about 20,000 route miles across 26 states, DC, Ontario and Quebec, headquartered at 500 Water Street, Jacksonville, FL.
- **Audience:** the CSX CISO (by role only) and the executive with the CIO remit, Steve Watkins, Chief Digital and Technology Officer. They will open the link before or after a meeting and explore on their own, or Stephen Ewings, Cisco Solutions Engineer will drive it live on a big screen.
- **Goal of the briefing:** Show that every wayside bungalow can become a monitored, segmented sensor whose OT context reaches the SOC, and that backhaul faults can be found without a truck roll.
- **Cisco topic:** Securing the wayside: Cisco industrial networking, OT security and assurance for signals, PTC, crossings, detectors, switches and backhaul
- **Cisco technologies to feature:** Cisco IE3500 Rugged Switch, Catalyst IR1101 Rugged Router, Cyber Vision, Identity Services Engine, Catalyst Center, ThousandEyes, Cisco Cloud Control, Cisco XDR
- **SIEM:** Microsoft Sentinel. If the customer's use of it is not publicly confirmed, label it "(assumed SIEM)" everywhere it appears and say so in Assumptions.
- **Brand line:** "Cisco for CSX" over the subtitle "Securing the wayside".
- **Intro headline:** two short parallel sentences; the second gets the gradient. Example shape: "Every bungalow, a sensor. / Every mile, assured." Use: "Every bungalow, a sensor. / Every mile, assured."

## 3. Research and the data model to fill

Research public sources first: annual report or 10-K, investor deck, the customer's newsroom, regulators and advisories for the sector, Cisco data sheets and release notes, and Microsoft Sentinel connector documentation. Record every source with a title, URL and group. Use only facts you can cite. Anything you invent (personas, site layout, KPIs, scenario narratives) must be labeled MODELED or ILLUSTRATIVE.

Fill these collections in `src/data/content.js`:

```js
export const BRAND = { title, subtitle, docTitle, kicker, headline: [line1, line2], intro, note, siem: 'Microsoft Sentinel', researched: 'Month YYYY' };

// 30 to 50 sources, keyed. group is one of: 'CSX', '<Industry> and <safety system>', 'Regulatory and threat', 'Cisco', 'Microsoft Sentinel'
export const SOURCES = { key: { title, url, group } };

// 10 to 14 plain-language strings: audience, who is named and why, modeled personas, schematic geometry,
// modeled site, SIEM assumption, which integrations are documented, product availability dates,
// software release prerequisites, KPI disclaimer, threat composites, "no sensitive security information".
export const ASSUMPTIONS = [ '...' ];

// 10 to 16 places on the map. kind: hq | ops | dc | yard | project | event | site
export const PLACES = [{ id, name, sub /* address or 1-line role */, ll: [lon, lat], kind, modeled: false, src: ['key'],
  body /* 2 to 3 sourced sentences */, personas: ['id'] }];

// 6 to 8 personas: 1 to 2 PUBLIC executives (named only if sources agree, otherwise by role), the rest MODELED composites.
export const PERSONAS = [{ id, name /* "Dana, Train Dispatcher" */, role /* include "(modeled persona)" when modeled */,
  place: 'placeId', public: true|false, src: [], color: '#hex',
  priority /* one first-person line, shown as an illustrative priority, never as a quote */,
  cares: ['3 to 4 bullets'], scenarios: ['scenarioId'] }];

// 7 to 9 technologies, one of which is Microsoft Sentinel itself.
export const TECH = [{ id, abbr /* 2 to 3 letters */, name, short, color: '#hex', obj /* site object or control-plane id */,
  src: [], facts: ['4 to 5 verified facts with numbers'], wayside /* where it sits in a representative wayside control point, 1 sentence */,
  sentinel /* the documented path into Microsoft Sentinel, or "integration pattern to validate" */, scenarios: [] }];

// Exactly 8 scenarios (see section 8).
export const SCENARIOS = [{ id, title, focus /* site pose id */, place /* map place id */, personas: [], tech: [],
  hook, without: ['4 steps'], with: ['4 steps'],
  kpi: { without: { mttd, vis, roll }, with: { mttd, vis, roll } } }];

// Exactly 7 story steps (see section 7).
export const STORY = [{ title, view: 'map'|'wayside', place: 'id'|null, focus: 'poseId', mode: 'without'|'with'|'split', open: 'type:id'|null, text, src: [] }];

export const LEGEND = { map: [['sw'|'ln', '#hex', 'label']], mapNote, site: [...], siteNote };
```

In `src/data/geo.js`: the map projection origin, the telemetry hub `the CSX Data Center, 6425 Southpoint Pkwy, Jacksonville, FL [-81.56, 30.24]` as `[lon, lat]`, the list of highlighted regions (the states or countries where CSX operates, from a source), 15 to 25 schematic corridors or links as `{ name, coords: [[lon,lat],...], main?: true, special?: 'eventId' }` drawn between real city coordinates, and the topojson for the eastern United States (us-atlas states-10m, 26 operating states highlighted).

## 4. Layout spec (desktop 1440x900; must also work at 1280x720)

- **Canvas:** fixed and full-bleed behind everything.
- **Top bar** `#top`: fixed, 64px tall, padding 0 18px, gap 18px, flex; background `linear-gradient(rgba(3,8,20,.95), rgba(3,8,20,.55))` with a 1px bottom line. From left: brand block (Cisco 7-bar logo, title 16px/700, subtitle 12px muted, min-width 230px); a **view** segmented control "Network map | Wayside site"; a **mode** segmented control "Without Cisco | With Cisco | Split view"; then, pushed right, the buttons **Guided story** (primary), **Sources** and **Assumptions**.
- **Left navigator** `#nav`: glass, `left:14px; top:78px; bottom:150px; width:300px`. A 4-column tab row (Personas, Technology, Scenarios, Places) over a scrolling list of items: a 34px rounded-square color dot with initials or an index, the title plus a badge, and a muted sub line.
- **Right detail panel** `#detail`: glass, `right:14px; top:78px; bottom:150px; width:400px; padding:18px 20px`, scrolls. Hidden (opacity 0, shifted 20px right, no pointer events) until something is selected.
- **Legend** `#legend`: glass, `left:330px; bottom:150px; max-width:280px`, 11.5px rows with 10px dots or 18x3 line swatches and a one-line hint. Content changes with the view.
- **Story dock** `#story`: glass, centred at `bottom:16px`, `width:min(900px, 100vw - 40px)`, padding 12px 14px: a round prev button (38px), the body (step number "3 / 7" in cyan 11px/800, title 15px/700, text 13px with inline source links, and 7 progress bars 22x4), a play/pause button and a next button.
- **Split overlay:** a vertical gradient divider at 50% and two pills, "WITHOUT CISCO" (red) left of centre and "WITH CISCO" (teal) right of centre, at the top of the scene.
- **Intro overlay:** full screen, `radial-gradient(at 30% 40%, rgba(4,159,217,.18), rgba(2,6,15,.9) 60%)`, a content block (max 760px): the kicker, the 2-line h1 (`clamp(34px,5vw,58px)`), a paragraph (16px/1.6), two big buttons "Start the guided story" (primary) and "Explore freely", and a small honesty note.
- **Modal:** dimmed full screen, a glass box `min(900px,92vw)`, max 84vh, scrolls, with an X close button.
- At 1200px and below: detail 340px, nav 260px, legend left 290px. In split mode (and on the H key) add `body.collapsed`: the nav slides off left, the legend hides, and the detail narrows to 330px.
- **Mobile (760px and below):** the top bar wraps to two rows (brand, Browse and Guided story on row 1; both segmented controls on a horizontally scrollable row 2); Sources and Assumptions move into the Browse sheet or stay reachable; the nav becomes a full-width sheet opened by "Browse"; the detail becomes a bottom sheet (max 50vh, close button) above the dock; the legend hides; the scenario columns stack. No horizontal overflow at 390px.

## 5. Visual design tokens

```css
:root{ --bg:#050a16; --glass:#0a1224c7; --line:#78aaff2e; --text:#e6eefc; --muted:#93a4c3;
       --cisco:#049fd9; --good:#2dd4bf; --bad:#f87171; --ms:#60a5fa; }
.glass{ background:var(--glass); border:1px solid var(--line); border-radius:16px; box-shadow:0 10px 40px rgba(0,0,0,.45); }
```
- No backdrop blur; the 78% fill lets the 3D show through.
- Buttons: radius 10, `rgba(255,255,255,.06)` fill, 1px `--line` border, 13px/600. Primary: `linear-gradient(135deg,#049fd9,#0369a1)`. Hover: `brightness(1.15)`.
- Segmented control: radius 12 track, radius 9 buttons. The active state is cyan (`rgba(4,159,217,.22)` plus an inset ring at .6); "Without" active is red (`rgba(248,113,113,.2)`, ring .7); "With" active is teal (`rgba(45,212,191,.2)`, ring .7).
- Badges (9.5px/800, letter-spacing .08em, radius 6): PUBLIC `#7dd3fc` on `rgba(56,189,248,.18)`; MODELED and ILLUSTRATIVE `#fde047` on `rgba(250,204,21,.16)`.
- Section headings in the detail: 11px uppercase, letter-spacing .12em, muted. h2 21px. Body 13.5px/1.5. Chips: pills with radius 999.
- Without and With columns: red and teal tinted cards (.08 fill, .35 border). The column that does not match the current mode drops to opacity .45.
- KPI tiles: 3 across, radius 10, muted label, value line "red &rarr; teal".
- SIEM box: blue `rgba(37,99,235,.12)` fill, `rgba(96,165,250,.45)` border, an 11px uppercase header with the SIEM's logo mark built in CSS (no image).
- Priority block: 3px cyan left border, italic 14px, with an "Illustrative priority, not a quote" label above it.
- Category colors on the map: hq `#38bdf8`, ops `#f59e0b`, dc `#06b6d4`, yard or terminal `#facc15`, project `#a78bfa`, event `#f43f5e`, site `#22c55e`; corridors `#f5b301`; Without red `#ef4444`; With teal `#2dd4bf` and `#22d3ee`; SIEM flows `#93c5fd`.

## 6. 3D scene spec

**Renderer:** antialias, `preserveDrawingBuffer:true`, pixel ratio capped at 2, sRGB output, ACES filmic tone mapping at exposure 1.1, PCF shadows. One canvas and two `Scene`s; only the active view renders. Camera: perspective, fov 45 (60 in split), near .1, far 500. OrbitControls with damping .08, `maxPolarAngle .47*PI`, distance 2 to 80. Camera moves use a custom 1.4 to 1.6 s cubic in-out fly with an arcing lift; switching views fades through black (.45 s).

**Network map view (the eastern United States (us-atlas states-10m, 26 operating states highlighted)):** background and FogExp2 `#050a16`, hemisphere plus one directional light, a dark ground plane and a faint 200x200 grid. Project lon/lat equirectangularly scaled by cos(latitude). Extrude the regions where CSX operates (depth .16, deep blue with emissive, bright blue outlines) and the others flat and dark. Draw corridors as Catmull-Rom tubes with an additive halo, plus small gold glow "trains" moving along them; draw one special event corridor in rose. Places: a glowing vertical pin (taller for HQ), a ground ring and a top glow in the kind color, plus a canvas label (larger with a sub line for HQ and events), and an invisible sphere as the raycast target. Hover shows a tooltip; click selects; the selected ring pulses larger and the other labels dim.
- **Without:** sample points every ~1.1 units along all corridors as pulsing red rings, with a "?" label on every 4th: unmonitored sites.
- **With:** the same points as teal glows; every 3rd sends an arched additive flow with a moving bead to the CSX Data Center, 6425 Southpoint Pkwy, Jacksonville, FL [-81.56, 30.24], where a large pulsing glow sits.

**Site view (a representative wayside control point, a modeled diorama):** a dusk palette (background `#0a1424`, linear fog 45 to 110), a warm shadow-casting key light, a cool fill and a hemisphere light; ground, infrastructure and seeded-random scenery. Build 6 to 8 named field assets that matter to CSX (3-aspect signal, signal bungalow with PTC WIU and signal controller, PTC 220 MHz radio tower, grade crossing with gates and flashers, hot box detector, power switch machine, fiber pole line, carrier 5G/LTE tower), an equipment enclosure with a visible rack, primary and secondary backhaul (wired path plus a carrier tower), and one moving element that drives state (for rail, a train that sets signal aspects and lowers crossing gates; for other sectors, a comparable process such as a conveyor, a vehicle, a pump cycle or a crane). Every asset gets a canvas label with a sub line and a named camera pose.
- **Without layer:** a legacy kit in the rack with red labels, an intruder figure, 3 red threat flows from off-site, and 5 pulsing red "?" callouts naming the blind spots.
- **With layer:** Cisco kit in the rack with lit bezels and blinking port LEDs, a translucent sensor dome with a wireframe, teal rings at each asset, 6 to 8 floating "control plane" labels (one per featured product, plus Microsoft Sentinel in deep blue), colored bead flows from the edge devices to the products and on to Microsoft Sentinel, a path-assurance flow along the backhaul with hop glows, and 3 green callouts naming what is now known.
- **Highlight:** a white pulsing ring and glow at the focused asset; other control-plane labels fade to .45.

**Split mode:** render the active scene twice per frame with the scissor test: the left half in Without and the right half in With, each with aspect `w/2/h`. Map raycasting must account for the half the pointer is in.

## 7. Interactions and deep links

- **Intro:** "Start the guided story" goes to step 1 and autoplays. "Explore freely" flies to the overview and sets the dock to "Explore" with a how-to line.
- **Tabs** switch the list. Selecting an item opens its detail, highlights it in the list, and switches the tab to the item's type. A place flies the map to it; a persona flies to its place; a technology switches to With, opens the site view, and highlights and flies to its object; a scenario opens the site view at its focus.
- **Detail chips** cross-link persona, scenario, technology and place. A scenario has three CTA buttons (Show without, Show with, Split view). A place has "Enter Wayside site".
- **Guided story:** exactly 7 steps. (1) Who CSX is, in numbers (map overview). (2) The pressure: an event or a growth project (map, place). (3) Regulators and adversaries (map, HQ). (4) Inside a representative wayside control point (site overview). (5) Without Cisco: blind, flat, slow (site, focus on the enclosure, opens the lead scenario). (6) With Cisco: every site is a sensor (With mode, opens the key sensing technology). (7) Side by side (Split mode, opens a second scenario). Steps 1 to 3 force Without. The dots fill up to the current step and are clickable. Play advances every 7.5 s and stops at the end; any manual action stops play.
- **Keyboard:** Left and Right arrows step the story, Esc closes the modal (and the mobile sheet), H toggles the collapsed panels.
- **Hash deep links** (read on load and on `hashchange`; any parameter skips the intro): `mode=without|with|split`, `open=persona:<id>|tech:<id>|scenario:<id>|place:<id>`, `view=map|wayside` with optional `focus=<pose>`, `story=0..6`. Write the hash back with `history.replaceState` as the state changes, keeping colons readable.
- **Sources modal:** an intro line ("Public sources used for facts in this app (researched <month year>). Items labeled MODELED or ILLUSTRATIVE are not sourced CSX facts."), then an h3 per group and an ordered list of title plus URL. **Assumptions modal:** an ordered list plus a badge legend.

## 8. Scenario authoring rules

Write exactly 8 scenarios across security, operations and resilience. They must match the topic, Securing the wayside: Cisco industrial networking, OT security and assurance for signals, PTC, crossings, detectors, switches and backhaul, and include at least: an unknown device on the OT edge, a backhaul or path failure, configuration drift or stale firmware, a disaster rebuild or major event, IT-to-OT lateral movement, third-party or vendor remote access, a safety-critical field asset, and regulatory evidence for the board.
- **Title:** concrete and visual, 4 to 7 words.
- **Hook:** one sentence situation in the field.
- **Without (4 steps):** what the people actually see and do today, ending in delay, a truck roll or late discovery. No product names. No mockery of the customer's current vendors.
- **With (4 steps):** each step is product, action, result, using only capabilities from that product's verified facts. One step must name the documented path into Microsoft Sentinel (connector, syslog/CEF via the agent, webhook, or a native export). If no documented path exists, write "integration pattern to validate".
- **KPIs:** three short contrasts (time to detect, visibility, field impact), for example "Weeks" to "Minutes". They are modeled; never present them as measured.
- Tie each scenario to 2 to 3 personas, 3 to 5 technologies, one map place and one site focus pose.

## 9. Labeling and assumptions

- Every persona and place shows PUBLIC or MODELED; every scenario shows ILLUSTRATIVE; KPI blocks are titled "Outcome (modeled KPIs)".
- Each detail panel ends with a Sources block of links, or "Modeled content, no external source."
- Named executives: never invent quotes. Show their line as "Illustrative priority, not a quote". If sources conflict on a name, show the role only and explain in Assumptions.
- Map lines are "schematic, modeled"; the site is "Representative site, modeled layout".
- Do not depict real security weaknesses of CSX or any sensitive security information. Threat scenarios are composites informed by public advisories.

## 10. Quality checks and review

1. `npm run build` produces one HTML file; open it over `file://`. There must be no console errors or warnings.
2. With Playwright (`chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']})`), screenshot at 1280x720 and 1440x900: the intro, the map in Without, `#story=2`, `#view=wayside&mode=with`, `#mode=split&open=scenario:<lead>`, `#open=persona:<exec>` and `#open=tech:<sensor>`. Also screenshot the home state at 390x844. Look at every image.
3. Check: no label collisions over the panels at the overview poses; the detail never covers the active asset; the split pills are readable; `scrollWidth == innerWidth` on mobile.
4. Click through every tab item and every chip once; step the whole story with the arrow keys; open both modals; confirm that each hash restores its state after a reload.
5. Fact pass: every number in PLACES, TECH facts and STORY has a source key that resolves; every MODELED item says so.
6. Do 2 to 3 fix-and-review passes on layout, color, spacing and motion.

## 11. Deliverables

- `dist/csx.html`: the single-file app.
- `app/`: the Vite source (package.json pinned to the versions above).
- `shots/`: the review screenshots.
- A short README: how to run and build it, how to edit `content.js`, the deep-link list, and the open assumptions to confirm with CSX (especially the Microsoft Sentinel assumption).

## 12. Customer notes for this build (CSX)

- **Kicker:** "Executive briefing for the CSX CISO and CIO". **Headline:** "Every bungalow, a sensor. / Every mile, assured."
- **Story anchors:** step 2 uses the Blue Ridge Subdivision (Hurricane Helene, rebuilt and reopened Sep 2025) and the Howard Street Tunnel (double-stack from May 2026); step 3 cites TSA SD 1580-21-01E, SD 1580/82-2022-01E and CISA ICSA-25-191-10.
- **Place kinds:** HQ, Network Operations Center (Warrington St), CSX Data Center (Southpoint Pkwy), the major hump yards, Howard Street Tunnel (project), Blue Ridge Subdivision (event), and a modeled wayside site near Waycross, GA.
- **SIEM paths shown as documented:** ISE (Sentinel solution, Syslog via AMA), Cyber Vision (CEF via AMA), XDR (native export workflows), ThousandEyes (custom webhook to an ingestion endpoint), IOS XE syslog. Catalyst Center and Cloud Control are patterns to validate. The CSX 10-K cites a third-party managed SOC; Sentinel use is assumed.
- **Personas:** CISO (by role, public), Steve Watkins (public), plus modeled composites: train dispatcher, signal maintainer, OT network engineer, managed SOC analyst, field communications technician.
