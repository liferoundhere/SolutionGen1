# Type A: Explorable Briefing. Reverse-engineered spec

Source: "Cisco for CSX, Securing the wayside" (https://rapid-rafter-dk38.here.now/). Studied from a saved copy of the published file (818 KB, captured in an earlier pass), its inlined module script and Playwright renders at 1280x720, 1440x900 and 390x844.

**Verification note:** in this pass the live URL could not be fetched again (Firecrawl ran out of credits and the network policy blocks here.now), so all values come from that saved copy. The saved copy is a serialized DOM: the CSS values are browser-normalized (for example `0px` and `rgba()`) and may differ cosmetically from the authored source. Not verifiable from it: whether the live page has changed since the capture, the exact Vite version (the minified output suggests Vite 6 to 8), and the `og:image` artwork.

**What this type is:** an explorable 3D executive briefing. It is not a slide deck and not a narrated film. The user lands on an intro overlay, then roams a live 3D scene with glass panels around it: a left navigator (personas, technology, scenarios, places), a right detail panel, and a bottom story dock. A short guided story (7 steps) drives the same UI. Every claim carries a PUBLIC, MODELED or ILLUSTRATIVE badge, and the Sources and Assumptions modals hold the research. There is no presenter camera box, no narration and no slide navigation.

---

## 1. Stack and build

| Item | Original | Notes |
|---|---|---|
| Bundler | Vite (production build, minified, `type="module" crossorigin` script, modulepreload polyfill) | All JS inlined into one `<script type="module">` in `<head>`; CSS inlined into one `<style>` |
| 3D | Three.js r186 (`<canvas id="gl" data-engine="three.js r186">`) | `WebGLRenderer`, `PerspectiveCamera`, `OrbitControls` from `three/examples/jsm/controls/OrbitControls.js` |
| Geo | `topojson-client` `feature()` (inlined) plus us-atlas states topojson (lon/lat, quantized, about 115 KB) embedded as a JS literal | Only `objects.states` used |
| UI | Vanilla JS and template strings, no framework | `document.querySelector` helper `$` |
| Fonts | `Inter, "Segoe UI", system-ui, ...` stack, no web font loaded | Renders as Inter where installed, otherwise system UI |
| Post-processing | None (no EffectComposer, no bloom) | Glow is faked with additive radial-gradient sprites |
| Images | None. Every label is a `CanvasTexture` sprite drawn at runtime | Keeps the file small |
| Output | One self-contained HTML file (about 812 KB): three.js about 600 KB, data and topojson about 160 KB, app about 40 KB | Open over `file://` or any static host; no network calls at runtime |

Rebuild stack: `three@0.186.0`, `topojson-client@3.1.0`, `vite@8`, `vite-plugin-singlefile@2` (inlines the JS and CSS and removes the asset files), output copied to `dist/csx.html`.

Module layout (rebuild): `src/data/content.js` (brand, sources, assumptions, places, personas, tech, scenarios, story, legend), `src/data/geo.js` (stations, corridors, highlighted states, topojson), `src/three/sprites.js` (glow sprite, label sprite, tube flow, box/cylinder helpers, camera fly), `src/three/mapScene.js`, `src/three/waysideScene.js`, `src/ui.js`, `src/main.js`, `src/style.css`.

---

## 2. Layout map (1440x900)

```
+--------------------------------------------------------------------------------------------+
| #top 64px: [logo bars + title/subtitle, min 230px] [Network map|Wayside site] [Without|With|Split]   [Guided story][Sources][Assumptions] |
+--------------------------------------------------------------------------------------------+
| #nav glass 300px          |                                            | #detail glass 400px  |
| top 78, bottom 150, l 14  |          full-bleed WebGL canvas           | top 78, bottom 150,  |
| tabs row (4 equal cols)   |          (fixed, inset 0, behind all)      | r 14, scrolls        |
| scrolling list of items   |                                            | hidden (.empty) until|
|                           | #legend glass max 280px, bottom 150,       | something is picked  |
|                           | left 330 (sits beside nav)                 |                      |
|            #story glass: width min(900px, 100vw-40px), bottom 16, centred, about 76px tall       |
+--------------------------------------------------------------------------------------------+
```

- `#top`: fixed, 64px, padding 0 18px, gap 18px, flex, gradient `rgba(3,8,20,.95)` to `rgba(3,8,20,.55)`, 1px bottom border `--line`. `.actions` pushed right with `margin-left:auto`.
- `#nav`: fixed glass, `width:300px; top:78px; bottom:150px; left:14px`, column flex, list scrolls.
- `#detail`: fixed glass, `width:400px; top:78px; bottom:150px; right:14px; padding:18px 20px; overflow-y:auto`. `.empty` = `opacity:0; pointer-events:none; translateX(20px)`.
- `#legend`: fixed glass, `bottom:150px; left:330px; max-width:280px; padding:10px 12px; font 11.5px`.
- `#story`: fixed glass, centred, `bottom:16px; width:min(900px, 100vw - 40px); padding:12px 14px`, flex: prev button, body, play button, next button.
- `#splitLabels`: fixed `inset:64px 0 0`, shows a centre divider and two pills "WITHOUT CISCO" (right edge at 50%-16px) and "WITH CISCO" (left edge at 50%+16px) at `top:16px`.
- `#intro`: fixed full screen, z 40, radial gradient overlay; content box `max-width:760px; padding:30px`, centred.
- `#modal`: fixed full screen, z 30, dim `rgba(2,6,15,.6)`; box `width:min(900px,92vw); max-height:84vh`.
- `#fade`: fixed black `rgb(2,6,15)` layer, z 5, opacity 0 to 1 over .45s for view changes.
- Z order: canvas 0, fade 5, splitLabels 6, legend 8, nav/detail/story 9, top 10, tooltip 20, modal 30, intro 40.

**Breakpoints in the original:** only `max-width:1200px` (detail 340px, nav 260px, legend left 290px). Split mode adds `body.collapsed`: nav slides out `translateX(-330px)`, legend hidden, detail narrows to 330px with a lighter `rgba(10,18,36,.7)` fill. Key `H` toggles the same class.

**Mobile:** the original does not adapt below 760px (the top bar clips and the nav covers the scene). The rebuild adds a `max-width:760px` layout: the top bar becomes two rows (brand plus a "Browse" button and the action buttons on row 1, the two segmented controls on a horizontally scrollable row 2, total about 104px); the nav becomes a sheet toggled by "Browse" (`body.navOpen`), the detail panel becomes a bottom sheet above the story dock (`left/right:10px; top:auto; max-height:46vh`), the legend is hidden, the story dock spans `100vw - 20px` with smaller buttons, and the intro headline clamps to 34px. No horizontal overflow (`html,body{overflow:hidden}`).

---

## 3. Design tokens (exact values from the original)

```css
:root{
  --bg:#050a16;  --glass:#0a1224c7;  /* rgba(10,18,36,.78) */
  --line:#78aaff2e;                  /* rgba(120,170,255,.18) */
  --text:#e6eefc; --muted:#93a4c3;
  --cisco:#049fd9; --good:#2dd4bf; --bad:#f87171; --ms:#60a5fa;
}
```

- **Glass card:** `background:var(--glass); border:1px solid var(--line); border-radius:16px; box-shadow:0 10px 40px rgba(0,0,0,.45)`. No backdrop blur (the 3D shows through the 78% fill).
- **Type scale:** intro h1 `clamp(34px,5vw,58px)`, weight 700, line-height 1.05, letter-spacing -.02em, second line is a gradient text span `linear-gradient(90deg,#22d3ee,#2dd4bf,#a3e635)`; detail h2 21px; story title 15px/700; brand 16px/700 letter-spacing .02em; item title 13.5px/650; body 13.5px/1.5; sub and list meta 11.5 to 13px muted; section headings (h4) 11px uppercase letter-spacing .12em muted; badges 9.5px/800 letter-spacing .08em; kicker 12px/800 uppercase .16em in `--cisco`.
- **Radii:** glass 16, segmented control 12 (inner buttons 9), buttons 10, list items 12, dots 10, chips 999, badges 6, columns 12, KPI tiles 10, story arrows 50%.
- **Buttons:** `border:1px solid var(--line); background:rgba(255,255,255,.06); border-radius:10px; padding:8px 14px; 13px/600`. Primary: `linear-gradient(135deg,#049fd9,#0369a1)`, white, no border. Hover: `filter:brightness(1.15)`. Big (intro): `padding:13px 20px; radius 12; 15px`.
- **Segmented control `.seg`:** `rgba(255,255,255,.05)` fill, 1px `--line` border, radius 12, padding 3. Buttons muted 13px/600, padding 8px 14px. On: white text, `rgba(4,159,217,.22)` fill, inset 1px ring `rgba(4,159,217,.6)`. Mode control: Without on uses red fill `rgba(248,113,113,.2)` and ring `.7`; With on uses teal `rgba(45,212,191,.2)` and ring `.7`; Split uses the default cyan.
- **Badges:** PUBLIC `color:#7dd3fc; background:rgba(56,189,248,.18)`. MODELED and ILLUSTRATIVE `color:#fde047; background:rgba(250,204,21,.16)`.
- **Without/With columns:** bad `rgba(248,113,113,.08)` fill and `.35` border, heading `--bad`; good `rgba(45,212,191,.08)` and `.35`, heading `--good`; the column that does not match the current mode gets `.dim` (opacity .45).
- **SIEM box `.ms`:** `rgba(37,99,235,.12)` fill, `rgba(96,165,250,.45)` border, radius 12; header 11px/800 uppercase `#93c5fd` with a 4-square Microsoft-style logo (`#f25022 #7fba00 #00a4ef #ffb900`, 6px squares, 1.5px gap).
- **Quote / priority:** left border 3px `--cisco`, fill `rgba(4,159,217,.08)`, radius `0 10px 10px 0`, italic 14px `#cfe3ff`.
- **Links:** `#7dd3fc`.
- **Category colors (places):** hq `#38bdf8`, ops `#f59e0b`, dc `#06b6d4`, yard `#facc15`, project `#a78bfa`, event `#f43f5e`, wayside `#22c55e`. Persona dots use their own color; tech dots their product color; scenario dots `#e2e8f0` with the index number. Dot text `rgb(4,16,31)` 13px/800 in a 34px rounded square.
- **Logo:** seven 4px bars in `--cisco`, radius 2, heights 8/16/22/26/22/16/8, gap 3, aligned bottom, 26px tall.

---

## 4. Components and states

| Component | Content | States |
|---|---|---|
| Top bar | logo, title, subtitle; View seg; Mode seg; Guided story (primary), Sources, Assumptions | seg button `.on`; mode-specific colors |
| Intro overlay | kicker, 2-line h1 (2nd line gradient), paragraph, two big buttons, note | visible, `.gone` (fade .6s); skipped if the URL hash has params |
| Nav tabs | Personas, Technology, Scenarios, Places (4-col grid, 12px/600, 2px bottom border `--cisco` when on) | `.on` |
| List item | dot (initials, abbr, index or kind letter), title + badge, sub line | hover `rgba(255,255,255,.05)`, `.on` cyan tint `rgba(4,159,217,.14)` with border `.45` |
| Detail: place | kind label + badge, h2, address, body, People here chips, Scenarios chips, "Enter a wayside site" CTA, Sources | |
| Detail: persona | "Persona" + badge, h2, role, priority block (labeled illustrative), What matters list, Their scenarios chips, Where chip, Sources | |
| Detail: technology | "Technology", h2 in product color, "In the wayside" line, Verified facts list, SIEM integration box, Scenarios chips, Sources | |
| Detail: scenario | "Scenario n of 8" + ILLUSTRATIVE, h2, hook, two columns (Without / With ordered lists), 3 KPI tiles (Time to detect, Visibility, Field impact, red value then arrow then teal value), SIEM touchpoints box, Personas chips, Cisco technology chips, 3 mode CTAs, Sources | columns dim by mode |
| Chips | `data-open="type:id"` cross-links | hover cyan |
| Legend | swatch rows (10px dot or 18x3 line) plus a hint line; content swaps by view | hidden in split |
| Story dock | prev, `n / 7` in cyan 11px/800, title, text plus inline source links (11px `#7dd3fc`), 7 dots (22x4) that fill up to the current step, play/pause, next | Ready, Explore, step n, playing (pause glyph) |
| Split labels | divider line plus WITHOUT / WITH pills | only in split |
| Tooltip | place name bold plus muted sub; follows the pointer (+14, +10) | map view only |
| Modal | Sources grouped by `group` (h3 per group, ordered list of title plus URL); Assumptions ordered list plus badge legend | open, closed (X, backdrop click, Esc) |

---

## 5. 3D scene

**Renderer:** `antialias:true, preserveDrawingBuffer:true`, pixel ratio `min(dpr,2)`, `outputColorSpace=SRGB`, `toneMapping=ACESFilmic`, exposure 1.1, `shadowMap.enabled`, PCF shadows. One canvas, two scenes; the active view picks which one renders.

**Camera and controls:** `PerspectiveCamera(45, aspect, .1, 500)` (fov switches to 60 in split mode). `OrbitControls` with `enableDamping`, `dampingFactor .08`, `maxPolarAngle .47*PI`, `minDistance 2`, `maxDistance 80`. Camera moves use a custom fly: lerp position and target over 1.4 to 1.6 s with cubic in-out easing and a sine arc lift of 18% of the travel distance. A view switch fades to black (.45 s), jumps to 1.35x the target distance, fades back, then flies in.

**Shared helpers:**
- Glow sprite: 128px radial gradient canvas (white 1, .55 at 25%, 0 at the edge), `SpriteMaterial` with additive blending, tinted by color.
- Label sprite: canvas text at 60px (weight 600) plus an optional 40px/500 sub line in `#93a4c3`, a rounded rect fill `rgba(8,16,32,.78)`, a 4px border (color per item), radius 24, scaled to world units by `size`. `renderOrder 10`, `depthWrite false`.
- Flow: `CatmullRomCurve3` through 3 points (start, raised midpoint, end), a thin `TubeGeometry` (radius .02, opacity .35, no depth write) plus N glow beads moving along `getPointAt((offset + t*speed) % 1)`.

**Network map scene:** background and `FogExp2` `#050a16`, density .018; hemisphere light (`#8fb4ff`, `#0a0f1e`, .9); one directional light 1.4. Ground plane 400x400 `#060d1d` and a `GridHelper(200,200,#10203f,#0b1830)`. Projection: `x=(lon+82)*cos(36deg)`, `z=-(lat-36)`. US states are extruded shapes: the 26 operating states depth .16 `#12305a` with emissive `#0b2a55` .45, others depth .05 `#0c1528`; outlines are line segments (`#3b82f6` .7 or `#1e2c4a` .6). Corridors: 23 schematic polylines between real city coordinates, as a centripetal Catmull-Rom tube (main .055, others .038) in `#f5b301` (Blue Ridge Sub in `#f43f5e`) plus a wide additive halo tube (.16/.11, opacity .12). Gold glow "trains" (`#ffe08a`) run along each corridor (3 on main lines). Places: a vertical glowing pin (HQ 2.2 tall, yards 1.1, others 1.5), a ground ring (.16 to .24) and a glow sprite on top, colored by kind, plus a label sprite (HQ larger, with sub line). An invisible sphere (r .45) per place is the raycast target. Selection scales the top glow up 1.3 and dims the other labels to .55; the selected ring pulses larger.
- **Without:** red rings (`#ef4444`, opacity .35 to .6 pulsing) every 1.1 units along all corridors, and a "?" label sprite on every 4th ring (unmonitored wayside sites).
- **With:** teal dots (`#2dd4bf`) at the same points, and every 3rd point sends an arched teal flow (`#22d3ee`, additive) to the Jacksonville data center, where a big pulsing glow sits (sensor telemetry to the hub).

**Wayside site scene (modeled diorama):** background `#0a1424`, linear fog 45 to 110; hemisphere light (`#bcd4ff`, `#1a2414`, .75); a warm key light (`#fff0d6`, 2) casting 2048 shadows, and a cool fill (`#6ea8ff`, .6). Ground disc r 90 `#1d2b1c`; track ballast (120 x .35 x 4.2), two steel rails (metalness .9), 200 instanced sleepers, and a diverging siding. Objects: a 3-aspect signal mast with a glowing active aspect; a signal bungalow (walls, translucent front, edge lines, pyramid roof, an equipment rack); a PTC 220 MHz radio tower with an amber beacon; a grade crossing with a road, two gate arms that lower when the train passes and alternating flashers; a hot box detector; a power switch machine; a fiber pole line along the track with sagging wires; a carrier 5G/LTE tower; about 140 seeded-random cone trees; and a train (locomotive plus 6 cars) that loops along the track and drives signal aspects and crossing gates. Labels: name plus sub on each object.
- **Without:** the rack shows an "Unmanaged switch" and a "Legacy modem" (red labels); a red intruder figure with a laptop by the bungalow; red threat flows (a laptop to the bungalow, a vendor VPN from off-site to the detector, IT to OT from off-site); pulsing red "?" callouts: unknown device on a spare port, shared vendor VPN with standing access, IT-to-OT path not segmented, backhaul fault (drive out to find it), no asset inventory.
- **With:** the rack shows IE3500 (cyan) and IR1101 (green) with blinking port LEDs; a translucent teal sensor dome with a wireframe over the bungalow; teal rings at each field asset; 7 floating "control plane" label sprites with glow (Catalyst Center, Cyber Vision Center, ISE, ThousandEyes, Cloud Control, XDR, Microsoft Sentinel highlighted in deep blue); colored bead flows from the IE3500/IR1101 to Cyber Vision, ISE, Catalyst Center and ThousandEyes, and on to XDR, Cloud Control and Sentinel (Sentinel flows in `#93c5fd`); a ThousandEyes path along the poles to the carrier tower with hop glows; field-asset flows into the bungalow; green callouts: "Profiled: signal controller, WIU, crossing controller", "Vendor session: just in time, recorded", "5G failover ready (dual SIM)".
- **Highlight:** a white pulsing ring plus a glow at the focused object; non-focused control plane labels fade to .45.
- **Named camera poses:** overview, bungalow, ie3500, ir1101, radio, crossing, detector, switch, signal, backhaul, control, plus one per control plane object.

**Split mode:** one scene, rendered twice per frame with the scissor test: the left half in Without, the right half in With, each with aspect `w/2/h` and fov 60. Raycasting maps the pointer into the half it is in.

---

## 6. Interaction model

- **Intro:** "Start the guided story" hides the intro, goes to step 1 and starts autoplay. "Explore freely" hides it, flies to the overview, and sets the dock to "Explore" with a how-to line.
- **View seg:** Network map / Wayside site (fade and fly). **Mode seg:** Without / With / Split; applies to both scenes; Split collapses the nav.
- **Tabs:** switch the list; selecting any item opens its detail and syncs the active tab to that item's type.
- **Selecting:** place: map flies to the place pose; persona: flies to the persona's place; technology: switches to With (if in Without), wayside view, flies to the product's pose and highlights it; scenario: wayside view, highlight and fly to `focus`.
- **Chips** in the detail open the linked item. Mode CTAs set the mode.
- **Map picking:** hover shows a tooltip and a pointer cursor; click (pointer travel under 5px, so drags do not count) selects the place.
- **Story:** 7 steps; each step sets the view, the mode (steps 1 to 3 force Without), the place or focus, and an optional detail to open. Dots fill up to the current step and are clickable. Play advances every 7.5 s and stops at the end; any manual navigation stops autoplay.
- **Keyboard:** Left and Right arrows step the story, Esc closes the modal, H collapses the panels.
- **Hash deep links** (read on load and on `hashchange`; any parameter skips the intro): `mode=without|with|split`, `open=persona:ciso` / `tech:ise` / `scenario:rogue` / `place:hq`, `view=map|wayside` with optional `focus=<pose>`, `story=0..6`. The rebuild also writes the hash as the state changes (`history.replaceState`), so a URL always restores the current view.

---

## 7. Data schema

```jsonc
// Source (keyed object; id -> source)
{ "csx10k": { "title": "CSX Corporation Form 10-K for FY2025 (filed Feb 12, 2026)", "url": "https://...", "group": "CSX" } }
// groups used: Customer, Rail and PTC (industry), Regulatory and threat, Cisco, Microsoft Sentinel (SIEM)

// Place
{ "id": "hq", "name": "CSX Headquarters", "sub": "500 Water Street, Jacksonville, FL",
  "ll": [-81.664, 30.322], "kind": "hq|ops|dc|yard|project|event|wayside",
  "modeled": false, "src": ["csx10k"], "body": "2 to 3 sentence fact paragraph", "personas": ["ciso","cio"] }

// Persona
{ "id": "dispatcher", "name": "Dana, Train Dispatcher", "role": "Network Operations Center, Jacksonville (modeled persona)",
  "place": "noc", "public": false, "src": [], "color": "#f59e0b",
  "priority": "First-person line, shown as an ILLUSTRATIVE priority, never as a quote",
  "cares": ["3 to 4 bullets"], "scenarios": ["backhaul","crossing"] }

// Technology
{ "id": "ie3500", "abbr": "IE", "name": "Cisco IE3500 Rugged Switch", "short": "IE3500", "color": "#22d3ee",
  "obj": "ie3500", "src": ["ie3500","ccIA"], "facts": ["4 to 5 verified facts"],
  "wayside": "Where it sits in the site, 1 sentence", "sentinel": "Documented SIEM path, 1 to 2 sentences",
  "scenarios": ["rogue","config","helene"] }

// Scenario
{ "id": "rogue", "title": "Unknown laptop in a signal bungalow", "focus": "bungalow", "place": "wayside",
  "personas": ["maintainer","ciso","soc"], "tech": ["ie3500","ise","cybervision","xdr","sentinel"],
  "hook": "1 sentence situation",
  "without": ["4 steps"], "with": ["4 steps, one names the SIEM path"],
  "kpi": { "without": { "mttd": "Weeks", "vis": "~40%", "roll": "3 trips" },
           "with":    { "mttd": "Minutes", "vis": "~100%", "roll": "1 trip" } } }

// Story step
{ "title": "Without Cisco: blind, flat, slow", "view": "map|wayside", "place": "hq|null", "focus": "bungalow",
  "mode": "without|with|split", "open": "scenario:rogue|null", "text": "1 to 3 sentences", "src": ["csx10k"] }

// Assumption: plain string. Corridor: { "name", "pts": [station codes], "coords": [[lon,lat]...], "main"?: true, "special"?: "blueridge" }
```

CSX counts: 7 personas (2 public, 5 modeled), 9 technologies, 8 scenarios, 15 places (14 public, 1 modeled), 46 sources in 5 groups, 13 assumptions, 7 story steps, 23 corridors over 62 stations.

---

## 8. Labeling and honesty rules

1. Every persona and place shows PUBLIC (sourced) or MODELED. Every scenario shows ILLUSTRATIVE. Technology items carry facts with sources.
2. The detail panel ends with a Sources block of links; modeled items say "Modeled content, no external source."
3. Named executives: the line shown is an illustrative priority, not a quote. The rebuild labels the block "Illustrative priority, not a quote" (the original rendered it in quote marks).
4. A public executive whose name conflicts across sources is shown by role only, with a note pointing to Assumptions.
5. KPIs are headed "Outcome (modeled KPIs)" and the Assumptions list says they are not measured customer data or Cisco guarantees.
6. The SIEM is labeled "(assumed SIEM)" when it is not publicly confirmed; integration paths are drawn only where documented and the rest are called "patterns to validate".
7. Map corridors are "schematic, modeled"; the wayside site is "Representative site, modeled layout".
8. No customer sensitive security information; scenarios are composites "informed by public advisories".

---

## 9. Copy patterns

- **Brand line:** "Cisco for {Customer}" / 3-word mission ("Securing the wayside").
- **Intro kicker:** "Executive briefing for the {Customer} {roles}". **Headline:** two short parallel sentences, the second in gradient ("Every bungalow, a sensor. / Every mile, assured.").
- **Scenario titles:** concrete and visual, 4 to 7 words ("Unknown laptop in a signal bungalow", "PTC WIU goes quiet on the backhaul").
- **Without steps:** what goes wrong, in plain operational terms, ending in delay or late discovery. **With steps:** product, action, result; one step names the SIEM landing path.
- **KPI words:** short contrasts ("Weeks to Minutes", "Core only to Hop-by-hop", "3 trips to 1 trip").
- **Story titles:** headline style ("A network under pressure", "Without Cisco: blind, flat, slow", "Side by side").
- **Voice:** short declaratives, no hype; numbers carry their source; dates are explicit.
