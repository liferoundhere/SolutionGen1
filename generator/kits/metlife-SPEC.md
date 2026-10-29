# Type D, Mission Globe: reverse-engineered spec

Original: <https://rosy-beacon-q5c8.here.now/>, "MetLife x Cisco Cloud Control, AgenticOps 4D", by Stephen Ewings (Cisco).

## 0. Sources and what could not be verified

| Source | What it gave |
|---|---|
| `orig.png` (1920x1080 screenshot of the live intro, captured in an earlier pass) | Intro layout, copy, colours sampled from pixels. Saved as `shots/original-1.png`. |
| The production JS bundle `assets/index-Ds7oawb6.js`, 1.05 MB (captured in an earlier pass) | All app logic, shaders, data, scoring and narration, read directly. A readable copy is at `ref/app.js` (app region of `ref/full.js`). All data is extracted to `ref/data.json`, and the land topology to `ref/land-topo.json`. |
| The same bundle run in a stub DOM (`--use-angle=swiftshader`) | Authentic renders of the original 3D: the globe (`shots/original-2.png`), the floor close-up at the decision point (`shots/original-3.png`), and a mission focus (`shots/original-4-mission-globe.png`). The HUD is not styled in these renders. |

**Not verified.** In this pass the live site could not be reached: Firecrawl ran out of credits and here.now is blocked by the network policy. The original HTML shell and the Vite CSS file (`assets/index-*.css`) were never captured. As a result:
- **Main-view CSS is inferred.** This covers exact sizes, positions, paddings and colours of the top bar, mission rail, right panel, 4D timeline, ticker, dock and stage windows. It was inferred from class names, inline `--c` colour variables, JS-side colours, and the intro screenshot. Values marked *(inferred)* below are design decisions, not measured.
- **Only the intro has a pixel reference.** No screenshot of the main view, of an open mission, or of a mode was captured from the live page.
- **Vite version.** Rolldown-style output suggests Vite 7 or later, but it is not confirmed.
- **Studio voices.** The MP3 files exist only on the host. Their file names (hashes) are in the bundle; the audio was not downloaded.

Everything else below (logic, data, shaders, numbers, copy) is read from the bundle.

## 1. Stack and build

- **Build:** Vite, ES modules, a single page. Output is `index.html`, plus `assets/index-<hash>.js` (one bundle with three.js inlined), plus `assets/index-<hash>.css`, plus `audio/`.
- **Libraries (versions from the bundle):**
  - three r186, using OrbitControls, EffectComposer, RenderPass, UnrealBloomPass, OutputPass, CSS2DRenderer and CSS2DObject;
  - GSAP 3.15.0, for every tween (camera, uniforms, timeline playback);
  - a topojson-client `feature()` decoder;
  - Natural Earth 110m land TopoJSON (`world-atlas` land-110m, 130 arcs), inlined.
- **Fonts:** CSS stack `Inter, "Segoe UI", system-ui, ...`, with no web font loaded (the screenshot renders in the system fallback). Canvas text uses `Inter, system-ui, sans-serif`.
- **Studio voices:**
  - Four voices: `heart` ("US English, warm presenter"), `michael` ("US English, steady narrator"), `emma` ("British English, crisp") and `george` ("British English, documentary").
  - 353 MP3s each, served at `audio/<voice>/<hash>.mp3`.
  - `hash` is FNV-1a 32-bit, hex padded to 8, of the sentence with its whitespace collapsed.
  - The manifest is embedded in the bundle as `{base:'audio', voices:{heart:[hashes...]}}`.
- **Narration fallback, per sentence:**
  1. The studio MP3, if the manifest lists that hash.
  2. Otherwise, the best English `speechSynthesis` voice. "Premium" voices are those whose names match `/natural|neural|premium|enhanced|online|google|siri/i`.
  3. Otherwise, a silent timer of `words / 2.6 / rate + 0.5` seconds.
  - If an MP3 errors, its hash is dropped from the manifest and the sentence restarts.
  - If `play()` is blocked by autoplay policy, a toast appears, and the audio retries on the next pointerdown or keydown.
- **Rebuild:** Vite 8.3.5, three 0.186.1, gsap 3.15.0, topojson-client 3.1.0 and vite-plugin-singlefile 2.3.4 produce one HTML file of about 1.1 MB.
  - The studio manifest moves into `<script type="application/json" id="studio-manifest">` so audio can be added without a rebuild.

## 2. Layout map at 1440x900 (main view; *inferred* except where noted)

```
┌──────────────────────────── top bar 56px ─────────────────────────────────────┐
│ ▮▮▮ MetLife x Cisco Cloud Control │ [Tour|Explore|Academy] │ 2.40M 128 1,240 │ $ score  rank/XP  Badges  Voice  Ambient │
├──────────────┬──────────── crumbs pill (centred, top 64) ───────┬─────────────┤
│ Mission rail │   Globe (full-bleed canvas behind everything)     │ Mission     │
│ 300px        │   stage windows dock into 10 slots in the free    │ panel 384px │
│ head         │   centre area; leader lines curve to the site     │ kicker/title│
│ lens chips   │                                                    │ tags, steps │
│ 10 missions  │                 caption (centred)                  │ body scroll │
│ replay intro │                                                    │ agent log   │
│              │                                                    │ Back Pause Overview Next │
├──────────────┴────────────────────────────────────────────────────┴─────────────┤
│ 4D timeline  [Compare|Traditional|AgenticOps]  T-48h 00m  KPI values   Hide │  ~150px
│ KPI band (top 40%) + 5 swim lanes, playhead, T-0 line                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│ LIVE · AGENTICOPS  ticker scrolling 20 site events                          26px│
├────────────── audio dock 900px max, centred, 50px ──────────────────────────────┤
│ |◀ ◀◀ ▶ ▶▶ ▶|  section title · sentence segments bar · 3 / 7   🎤 Voice         │
└─────────────────────────────────────────────────────────────────────────────────┘
```

- **Globe centring.** The globe is centred in the free space between the rails using `camera.setViewOffset`, tweened over 0.6 s (from the bundle: `setCenter`, clamped to ±20% of the viewport).
- **Panel stack.** Bottom up: the dock (bottom 10, height 50), the ticker (26), the timeline (clamp of 116 to 156 px), then the side panels.
- **Collapsing.** `body.mp-collapsed` slides the right panel off-screen, leaving a 34px tab. `body.tl-folded` hides the timeline and shows a "4D timeline" button. The fold state persists under the key `metlife-agenticops-tl`.
- **Mobile (≤760px):**
  - the top bar wraps, with the mode tabs on a full-width second row;
  - the mission rail becomes a drawer behind a "Missions" button;
  - the right panel becomes a 42vh bottom sheet above the dock;
  - the timeline, ticker and captions are hidden;
  - one stage window shows at a time, full width;
  - the intro cards stack.
- **Intro (from the screenshot, 1920x1080):** a centred block of about 1080px.
  - Kicker at y≈260.
  - H1 on two lines, about 64px, at y≈290 to 410.
  - Lead paragraph of 4 lines, 18px, at y≈430 to 535.
  - Three cards of 348x160, 16px apart, at y≈567 to 727.
  - Disclaimer at 13px, then the sound line.
  - The globe sits behind it, large (camera distance 3.8), with a radial vignette.

## 3. Design tokens

### Recovered from the bundle (JS or canvas)

- **Renderer:**
  - clear colour `#02050c`;
  - ACES filmic tone mapping, exposure 1.05;
  - bloom strength 0.62, radius 0.5, threshold 0.32 (0.5 strength in the building view).
- **Site states:**

  | State | Colour |
  |---|---|
  | idle | `#3fb6ff` |
  | signal | `#ffd166` |
  | warning | `#ffb020` |
  | critical | `#ff3b4f` |
  | recovering | `#ff9f43` |
  | protected | `#7cf29c` |

- **Globe colours:** fabric arcs and the shell are `#2fb4ff`; the vantage ring and zone are `#7fe7ff`; the atmosphere is `#1d8fff`.
- **Timeline colours:**
  - traditional `#ff4d5e`, AgenticOps `#6ff09a`, forecast `#ffc14d`;
  - grid `rgba(120,170,255,.10)`, text `rgba(200,220,255,.72)`;
  - lead band `rgba(63,182,255,.10)`, outage band `rgba(255,77,94,.10)`.
- **Swim lanes:**

  | Lane | Colour |
  |---|---|
  | ThousandEyes, network | `#38c6f4` |
  | Splunk Data Fabric | `#f99d1c` |
  | Cloud Control agents | `#5191f0` |
  | Security, XDR | `#ff6a8a` |
  | People and business | `#a4ce4e` |

- **Lenses:**

  | Lens | Colour |
  |---|---|
  | Revenue and growth | `#a4ce4e` |
  | Customer experience | `#5ec8f2` |
  | Operations and cost | `#f2c14e` |
  | Risk and compliance | `#c792ea` |
  | Security | `#ff6b6b` |
  | IT and network | `#049fd9` |

- **Building view:**
  - glass floors `#16365e`, edges `#3f86c9`;
  - customer-occupied floors `#1aa3ff`, mission zone `#7fe7ff`;
  - fog `#030a18`.
- **Canvas fonts:** 10 to 10.5px Inter.
- **Silo colours** (streams in the "silos" layer): `#049fd9`, `#a4ce4e`, `#c792ea`, `#ff6b6b`.

### Sampled from the intro screenshot

- **Background:** `#01050e` at the edges, about `#04192e` behind the globe.
- **Kicker:** "METLIFE" in `#3bb4ff`, "X" muted, "CISCO CLOUD CONTROL" in `#cfe9ff`. 13px, weight 800, letter-spacing about 0.3em.
- **H1 gradient**, left to right: `#e7f9ff`, then `#c7f0ff`, then teal, then `#a3d47b`. Weight 800, line-height about 1.04.
- **Lead text:** about `#9fb2cf`, with bold terms in `#ffffff`.
- **Cards:**
  - glass `rgba(10,30,60,.55)`, 1px border `rgba(120,170,255,.28)`, radius about 14px;
  - kicker 11px in `#7fe7ff`, letter-spacing 0.22em;
  - title 22px weight 750 in `#f3f8ff`;
  - body 14px in `#93a6c4`.
- **Disclaimer:** 12.5px, `#7d8ea9`. **Sound line:** `#6fbfe0`.

### Main UI (inferred)

- Text: ink `#e6f0ff`, ink-2 `#c7d4ea`, muted `#93a7c6`, dim `#6b7f9f`.
- Glass `rgba(6,14,30,.74)` with `blur(14px)`; lines `rgba(120,170,255,.16)` and `.30`.
- Cisco blue `#049fd9`; primary button gradient `#049fd9` to `#0369a1`.
- Radii 14 / 10 / 999; shadow `0 12px 40px rgba(0,0,0,.45)`.
- Type scale:

  | Element | Size |
  |---|---|
  | Panel title | 19px / 760 |
  | Lead | 14px |
  | Body | 13px |
  | Labels (uppercase, letter-spaced) | 10.5px |
  | Window text | 11.5px |

## 4. Components

### Intro and top bar

- **Intro mode cards.** Three buttons with `data-start = tour | explore | academy`:

  | Kicker | Title | Description |
  |---|---|---|
  | PRESENT | Executive Tour | "Cinematic, fully narrated journey across all 10 MetLife missions." |
  | PLAY | Explore Missions | "Pick a location, make the call at each decision point, and protect business value." |
  | LEARN | Account Team Academy | "Trace each IT signal to a business KPI, practice discovery questions, and take the quiz." |

  Clicking a card fades the intro (`.gone`), shows the HUD and calls `setMode`. Deep links are supported: `?mode=tour|explore|academy&mission=<id>&voice=off|studio:<id>`.
- **Top bar:**
  - The brand: Cisco bars logo and the customer name.
  - Mode tabs (`#modeTabs`).
  - **Vantage stats**, updated every 1.3 s:
    - signals per hour, about 2.4M as a random walk;
    - agents, 124 to 132;
    - resolved today, starting at 1,240 to 1,440 and incrementing.
  - The score: value protected, formatted as `$x.xM` or `$x.xxB`.
  - Rank name with an XP bar and `xp / next`.
  - A Badges button with a count, which opens a modal of 8 medals and has a reset.
  - A Voice button, which opens the voice popover.
  - An Ambient toggle.
- **Breadcrumbs (`#crumbs`):** Globe › Americas or Europe, Middle East and Africa or Asia Pacific (by longitude: below -30 is Americas, below 60 is EMEA, otherwise Asia Pacific) › City › Campus (if more than one building) › Building › Floor N with the room name.
  - Every crumb drills the camera.

### Mission rail and right panel

- **Mission rail:**
  - Lens chips: "All functions" plus 6 lenses, each with a colour dot.
  - Filtering re-renders the list and flashes each matching site with a staggered cyan sprite every 120 ms.
  - Each mission row shows:
    - the code tile (`M-01`), coloured green, amber or red once played;
    - the title;
    - "City | Business unit";
    - three lens bars;
    - a status column: Not started, Protected, Partial or Impacted, plus "$X at stake" or "$X", plus "Quiz N%".
  - The footer reads "Replay the opening".
- **Right step panel:**
  - Kicker (`M-01 | New York, United States`), title, subtitle and lens tags.
  - Step chips (Overview, Briefing, Signal, Decision, ...), clickable.
  - The body: a step title and HTML for the step.
  - The live agent log: events up to the playhead, newest first, with time, coloured source and text.
  - A nav row: Back, Pause or Resume, Overview, and Next. Next pulses on manual steps and reads "Next mission" or "Done" on the last step.

### Decisions, academy and quiz

- **Decision options and feedback.** There are 3 options with qualities `best | partial | poor`, shown in two places: the right panel and the AI Canvas "Your call" card.
  - Picking an option locks all of them, colours the pick, and marks the best one.
  - Feedback opens with "Great call.", "Partial save." or "Business impact ahead.", followed by the option's feedback text.
  - A sound cue plays (good, warn or crit), the narration stops, and the step auto-advances after 2.6 s.
- **Academy chain.** Five stacked links with arrows: IT signal, Domains, Cisco capability, Business KPI and Executive outcome. They appear in Overview, Outcome and Connections (big variant).
- **Discovery questions.** The Connections step holds three cards:
  - a talk track (three ordered sentences);
  - "Discovery questions to ask" (three bullets);
  - "Cisco and Splunk capabilities in play" as chips.
- **Quiz.** Two questions per mission, three options each.
  - Answering a question reveals the right answer and its "why".
  - Once all are answered: "Score: N/2. +N×30 XP".
  - The step ends with "Next mission" and "All missions" buttons.

### Audio, ticker and timeline

- **Audio dock:**
  - Buttons: previous section, previous sentence, play or pause, next sentence, next section.
  - The section label: `M-01 · Make the call`.
  - A sentence segment bar, where each segment's width is proportional to the sentence length; it fills in real time and is clickable to seek.
  - A counter (`3 / 7`) and a voice button.
  - **Voice popover:** toggles for Voice and Captions, speed (0.85 to 1.5x), and groups for Studio, Premium device and Other device voices. Each voice has a preview button that plays "Welcome to the MetLife and Cisco Cloud Control experience." Settings persist.
  - **Captions:** each sentence appears centred above the timeline.
- **Ticker:** 20 one-line "City | Agent did X. Outcome." items, duplicated and scrolled in a CSS marquee. A green "LIVE" dot leads it.
- **4D timeline:**
  - The header: title, branch toggle (Compare, Traditional, AgenticOps), mission clock `T-48h 00m`, and KPI read-outs (Traditional N, AgenticOps N, and "Exposure $X" after T-0).
  - **The canvas:**
    - A left gutter of 132px holds the "BUSINESS KPI" label, the metric name and the lane labels.
    - The KPI band takes the top 40%: a y axis of 0 to 110 with grid lines at 0, 50 and 100, and an x axis that ticks at the first of 1, 2, 4, 6, 8, 10, 12, 15, 20, 24, 30, 48 or 60 that is at least range/10.
    - Five lanes sit below the band.
    - A dashed white T-0 line is labelled "T-0  business moment".
    - The traditional and AgenticOps curves glow (shadowBlur 8). The agentic-only view adds a dashed forecast of the traditional curve.
    - Event markers: diamonds for AgenticOps, circles for traditional, offset ±20% of the lane in Compare. Critical events get a white ring, and future events are grey.
    - The playhead is white with a cyan glow.
    - Once the agent detects the problem, "Agent lead time: 48 hours" appears.
  - **Interaction:** drag to scrub; hover shows a tooltip; click opens the matching product window (by lane) and toasts the event.
  - Choosing Compare counts toward the Time Traveler badge.

### Stage windows

Floating product panels, each about half the free area. They dock into slots nw, ne, sw, se, w, e, n, s, center or mid; opening a slot closes conflicting slots.
- **Window frame.** A product-coloured header with the brand, the title, a live status dot and status text, plus expand and close buttons.
- **Leader line.** A dashed, animated SVG bezier runs from the window edge to the projected site (on the globe) or zone (in the building), with a glowing dot.
- **Panels:**

  | Panel | Contents |
  |---|---|
  | Splunk ITSI | Health ring, predicted health, episode banner, 4 KPI sparklines, adaptive-threshold chart, service tree with a root-cause outline |
  | ThousandEyes or Nexus path | Hop glyphs, bad hop and alternate path, loss, latency and jitter, verdict |
  | AI Canvas | Typed prompt, 4-agent plan, generated forecast widget, sourced root cause, proposed action with policy, Approve / Revise / Reject, "Your call" options, reasoning trail |
  | Cisco AI Assistant | Question, generated SPL2, result table, follow-up chips, free-text input with keyword matching |
  | Traditional "12 tools, 6 teams, 1 bridge call" | Alert storm, tickets, teams joining the P1 bridge, root cause "found by hand" |
  | Cisco XDR | Verdict, MITRE tactics, attack story, SOAR tasks, "Contained at the identity stage" |
  | Business impact | Pillar, exposure realized vs protected (modeled), KPI bars, KPI table |
  | Facility | Address, mission floor and basis, public vs illustrative facts, drill buttons, sources |
  | Data Fabric diagram | 6 signal domains, Data Fabric, Cloud Control, 6 action targets, with lit wires and animated dots |
  | Cloud Control topology | Site rows with states |

  The tour adds five panels: "MetLife at a glance", New Frontier, "Each team sees a slice", Cloud Control shell, and "From signal to action" loop.

## 5. Globe

### Construction

- **Ocean:** a sphere of radius 0.995 with a fresnel shader. Deep blue on the night side, slightly lighter on the day side, and a `(0.05,0.35,0.7)` rim.
- **Land:** points.
  1. The TopoJSON land is drawn to a 2048x1024 equirectangular canvas mask.
  2. 95,000 Fibonacci-sphere points are generated, keeping those on land with latitude ≥ -62°.
  3. Point size is `0.0062 × pixelRatio × 900/-z`.
- **Point colour:** night `(0.05,0.11,0.24)` blends to day `(0.2,0.46,0.78)` by the sun direction. About 3.5% of points on the night side flicker amber as city lights.
- **Point uniforms:**
  - focus glow around the selected site;
  - scan ring, which expands 0 to 0.9 over 2.4 s;
  - incident disc: colour and radius tween with a ripple, red, amber or green.
- **The sun** follows the mission clock: `lon = siteLon + 30 - hours × 15`.
- **Atmosphere:** a back-face shell at 1.16×, additive, `#1d8fff`, with intensity `pow(d, 2.6) × 0.95`.
- **Stars:** 2,600 points at radius 40 to 100.
- **Vantage shell:** an icosahedron(1.55, detail 3) wireframe at opacity 0.045, plus three thin torus rings of radius 1.55, 1.585 and 1.62, tilted and counter-rotating. Nine octahedron "agents" with glow sprites orbit the rings. Opacity fades as the camera nears.
- **Data streams:** 26 particles per site rise from the surface to the shell. In the silos layer they take silo colours and reach only 32% of the way.

### Pins, labels and arcs

- **Pins (beacons).** Each pin has:
  - a spike of height 0.07 (hub) or 0.032 (minor);
  - a glow head;
  - a base ring;
  - a pulsing ring, whose rate and size depend on state;
  - a protected wireframe dome of radius 0.085;
  - an invisible hit sphere.
  - Pins tween colour by state, flicker in the signal state, and throb in the critical state.
- **Labels.** CSS2D labels show the city and a live note (`T-48h 00m | Agent acting`). Labels fade near the limb.
  - **Hubs:** NYC, Cary, Tampa, Whippany, Tokyo, Mexico City, Santiago, Brighton, Dubai and Noida.
  - **Minor sites:** London, North Greenbush, Seoul, Shanghai, Hong Kong, Mumbai, Sydney, Sao Paulo, Istanbul, Paris, Warsaw and Dublin.
- **Fabric arcs.** 30 great-circle tubes link the sites. Each lifts by `0.03 + min(dist, 1.3) × 0.17`, with radius 0.0022, colour `#2fb4ff` and a travelling pulse head (speed 0.12 to 0.24).
- **Blast arcs.** These are red (radius 0.0035, speed 0.5) and run from the mission site to its `blast` sites while the state is critical.
- **Beam.** A striped cyan cone (0.55 long) stands on the site while the agent acts, and one shell agent flies to the beam top.
- **Effects:** a green shockwave ring (scale 1 to 9 over 1.6 s) when the site becomes protected. Random green or cyan flashes every 1.3 s act as the ambient "vantage loop".

### Camera and layers

- **Camera.** FOV 42, starting at (lat 25, lon -40, distance 3.8), with a slow idle spin of 3° of longitude per second.
- **Flights.** `flyTo` tweens latitude, longitude and radius with power2.inOut, adding an arc lift of `min(1.2, |Δlon|/120 + |Δlat|/120)`.
- **Distances by level:**

  | Level | Distance |
  |---|---|
  | Globe | 3.7 |
  | Region | 3.25 |
  | City / focus | 2.2 at lat - 6 |
  | Before entering a building | 1.32 |
  | Traditional branch | 3.1 |
  | Agentic branch | 2.35 |

- **Orbit controls.** Damping 0.06, no pan, distance 1.35 to 7.
- **Story layers** (fabric, streams, reach, silo, shell), tweened over 2.2 s:

  | Layer | fabric | streams | reach | silo | shell |
  |---|---|---|---|---|---|
  | sites | .25 | .35 | .25 | 0 | .15 |
  | silos | 0 | 1.3 | .32 | 1 | 0 |
  | fabric | 1.2 | 1 | .45 | 0 | .2 |
  | agents | .8 | 1 | 1 | 0 | 1.4 |
  | all | .8 | .9 | 1 | 0 | 1 |

### Mission close-ups (the building view)

- **Transition.** The camera flies to distance 1.32 over the site. A radial "warp" flash plays, then the renderer swaps to a second scene and camera.
- **The scene:**
  - **Ground.** A shader grid with major streets every 5 to 20 units, depending on the city context, plus an expanding radar ring.
  - **City blocks.** A procedural instanced city, either a grid or a scatter by context (manhattan, tokyo, cdmx, santiago, dubai, noida, brighton, campus). It uses a lit-window shader with a hash and is kept clear of real buildings.
  - **Extras:** water, parking decks, trees, mountains (Santiago), and landmark boxes with an arched vault (Grand Central).
  - **The real building(s).** Each building has:
    - a footprint shape (rect, octagon, faceted or datacenter);
    - its real floor count and floor height (MetLife Building: 59 floors × 0.417);
    - one translucent slab per floor with edges;
    - customer-occupied floors in blue (public source);
    - the mission floor in cyan, coloured by state and pulsing;
    - a podium, a core, a "MetLife" sign, and racks with LEDs for data centres.
  - **Hover and click.** Hovering a floor shows a tooltip: "MetLife-occupied floor (public source)", "Illustrative floor" or the zone basis. Clicking a floor toasts whether it is customer space.
  - **Link tubes.** These run to other sites, for example "North Greenbush data center".
- **Floor focus:**
  - floors above are hidden to 6% opacity and other buildings to 30%, and the city is dimmed;
  - the interior appears: a floor plate, an instanced desk grid, a cyan room box, and 4 or 5 device beacons (ThousandEyes agent, switch, AP, wall display, router, firewall, endpoint, phone) with labels and flow tubes to the core.
- **State effects:**

  | State | Effect |
  |---|---|
  | warning | striped cyan beam |
  | critical | red alarm ring pulsing on the ground |
  | protected | green wireframe dome |

## 6. Game logic

- **Value protected** = `round(exposure × share)`, where share is best 1, partial 0.4 and poor 0.
  - Only the best result per mission counts toward the total, so a replay can raise the score but never lower it.
  - Tour and academy runs count as best.
- **XP:**

  | Action | XP |
  |---|---|
  | Outcome: best / partial / poor | +150 / +60 / +20 |
  | First Compare per mission (also on finishing a counterfactual) | +20 |
  | Each correct quiz answer | +30 |

- **Ranks by XP:** Observer 0, Operator 200, Correlator 600, Orchestrator 1200, AgenticOps Architect 2000.
- **Badges (8):**

  | Badge | Condition |
  |---|---|
  | First Save | any value greater than 0 |
  | Perfect Call | 3 best calls |
  | Americas Guardian | all Americas missions |
  | Asia Guardian | all Asia missions |
  | EMEA Guardian | all EMEA missions |
  | Account Scholar | 100% on 3 quizzes |
  | Time Traveler | Compare in 5 missions |
  | Global Vantage | all 10 missions |

  A badge triggers a toast and a four-note chime.
- **Persistence:** `localStorage` keys `metlife-agenticops-v1` (game), `-voice`, `-captions` and `-tl`.
- **Sounds (WebAudio):**
  - An ambient pad, off by default: detuned sines at 73.42, 110, 146.83, 164.81 and 220 Hz through a 520 Hz lowpass with an LFO, at gain 0.05. It ducks to 45% while speaking.
  - Cues: info, select, warn, crit, good and badge.
- **The timeline model** is defined per mission by `range`, `agentDetect`, `agentRemediate`, `impact = 0`, `tradDetect`, `tradRecover`, `tradDip`, `agentDip` and `unit` (h or m).
  - **KPI health, traditional:** 100, minus a pre-impact sag of 4, minus `tradDip × 100` from impact through recovery (smoothstep in and out), plus jitter.
  - **KPI health, agentic:** 100, minus a triangle of `agentDip` between detect and remediate, plus up to 2 after, plus jitter.
  - **Site state, traditional:** idle, then signal (from agentDetect), then critical (from impact), then recovering, then idle.
  - **Site state, agentic:** idle, then warning (from agentDetect), then protected (from agentRemediate).
  - **Exposure realized** = `exposure × smoothstep(impact, tradRecover, t)`.
  - **Panel "harm"** is `(100 - KPI) / 60`. The predicted harm looks ahead `max(0.5h or 30m, lead × 0.6)` on the traditional curve.

## 7. Mode flows

- **Every step** carries:
  - narration;
  - an `enter()` that sets the camera, timeline and drill level;
  - `render()` HTML for the right panel;
  - cues `[fraction, fn]` that fire as narration progresses (by sentence index plus sentence progress);
  - a wait setting: auto (advance 1.4 s after narration) or manual.
- **Executive Tour (`tour`)** auto-plays end to end.
  1. Six opening chapters, each with a camera position and a layer:
     - "A global promise": facts panel, sites layer.
     - "The New Frontier": strategy panel.
     - "The era of network operations is changing": silos panel, silos layer.
     - "One fabric of data": Data Fabric diagram, fabric layer.
     - "A vantage point above it all": Cloud Control shell and loop panels, agents layer, every mission site flashes.
     - "From IT problems to business outcomes": topology panel and legend.
  2. Each of the 10 missions in turn: Briefing (enters the building, then drops to the floor), Signal, Timeline A traditional, Timeline B AgenticOps, Outcome.
  3. A finale: "The vantage point, everywhere", with every site protected, the total modeled value, and a table of mission, outcome and value. Its buttons are Explore missions and Open Academy.
- **Explore Missions (`explore`).** The idle panel reads "Choose a mission". The steps are:
  1. **Overview**, an audio overview: city view; facility, topology and Data Fabric windows; the chain.
  2. **Briefing:** "Where it happens", "Known industry challenge", "New Frontier priority at stake" and "Data Fabric sources joined".
  3. **Signal:** the AgenticOps view plays to 30% of the agent window; path, Splunk and Assistant windows; the lead-time callout.
  4. **Decision** (manual): the AI Canvas shows the action and "Your call"; the options also appear in the panel; Next is disabled until you pick.
  5. **Your outcome:** your timeline plays. Best plays the agentic branch; partial or poor plays the traditional branch.
  6. **Other timeline:** the counterfactual.
  7. **Outcome** (manual): big modeled number, basis, KPI table, chain and products; Next mission, Replay and make a better call, and All missions.
- **Account Team Academy (`academy`).** Overview, Briefing and Signal, then Timeline A, Timeline B and Outcome, then:
  - **Connections:** big chain, talk track, discovery questions, capabilities;
  - **Quiz:** two questions, then Next mission.
- **Keys:**
  - Space: pause.
  - Left / Right: previous or next sentence.
  - Shift + Left / Right, or Page Up / Down: previous or next section.
  - Escape: close the modal or popover.

## 8. Data schema

```ts
Site      { id, name, city, country, lat, lon, role, hub?: boolean }
Lens      { id, label, color }
Mission   { id, siteId, code:'M-01', title, subtitle:'City | Unit', region:'Americas'|'Asia'|'EMEA', lenses:[3 lens ids],
            pillar, industryChallenge, metricName, unit:'h'|'m', range:[from,to], agentDetect, agentRemediate, impact:0,
            tradDetect, tradRecover, tradDip:0..1, agentDip:0..1, exposure:number, exposureBasis:'Modeled: ...',
            blast:[siteIds], signals:[5], products:[~6],
            events:[{t, branch:'agentic'|'traditional', sev:'info'|'warn'|'crit'|'good', source, text}] (~6 + ~5),
            narration:{overview, briefing, signal, traditional, agentic, outcome},
            decision:{prompt, options:[{label, detail, quality:'best'|'partial'|'poor', feedback}] (3)},
            kpis:[{label, traditional, agentic}] (4), chain:{signal, domain, capability, kpi, outcome},
            talkTrack:[3], discovery:[3], quiz:[{q, options:[3], answer:index, why}] (2) }
View      { service, tree:[6 nodes], rootNode, kpis:[{name, unit, good, bad, dec?}] (4),
            path:{title, source:'ThousandEyes'|'Nexus Dashboard'|'Splunk ITSI'|'Cisco XDR', hops:[{name, kind, sub}] (5), bad, alt, badMetric, goodMetric},
            assistant:{q, spl, a, rows:[[k,v,note]] (3), followups:[{q,a}] (3, last one says 'I have opened it in AI Canvas')},
            canvas:{prompt, plan:[{agent, source, task}] (4), finding:{title, evidence:[3]}, action:{title, steps:[3-4], policy, validation}},
            alerts:[{tool, text}] (8), teams:[6], security?:{verdict, tactics:[5], story:[{stage,text}] (5), responses:[4]} }
Facility  { siteId, title, entity, address, context, buildings:[{id,label,shape,w,d,floors,floorH,x,z,rot?,podium?,metlife?:[[from,to]],bands?,heightVerified?}],
            landmarks?, parking?, lake?, ponds?, trees?, mountains?, facts:[{k, v, verified}], sources:[...], intro, links:[{to,label,bearing}] }
Zone      { buildingId, floor, room, basis, verified, devices:[{kind:'te'|'switch'|'ap'|'wall'|'router'|'firewall'|'endpoint'|'phone'|'server', label}] }
TourChapter { title, short, text, cam:{lat,lon,dist}, layer:'sites'|'silos'|'fabric'|'agents'|'all' }
Badge { id, name, desc }   Rank { xp, name }   Ticker: string[] ('City | what an agent did. outcome.')
```

The MetLife values are 10 missions, 22 sites, 11 facilities, 10 zones, 10 views, 20 ticker lines and 6 tour chapters. The modeled total is $80.2M. Individual figures:

| Mission | City | Modeled value |
|---|---|---|
| M-01 | New York | $14.0M |
| M-02 | Cary | $9.6M |
| M-03 | Tampa | $11.0M |
| M-04 | Tokyo | $7.5M |
| M-05 | Mexico City | $5.2M |
| M-06 | Santiago | $3.8M |
| M-07 | Brighton | $8.4M |
| M-08 | Dubai | $6.1M |
| M-09 | Noida | $2.6M |
| M-10 | Whippany | $12.0M |

## 9. Disclaimer, labelling and copy patterns

- **Intro disclaimer (verbatim):** "Illustrative scenarios built from public information about MetLife (including its New Frontier strategy and public filings) and common challenges across the insurance industry. No MetLife internal data is used. Dollar figures are modeled estimates based on industry benchmarks, meant for discussion only."
- **Labelling rules:**
  - Every exposure carries an `exposureBasis` that starts with "Modeled:".
  - The impact window has status "Modeled".
  - Outcome labels read "modeled business value protected".
  - Facility facts are tagged "Public source" or "Illustrative".
  - Zones carry a `basis` such as "Floor 6 is MetLife-leased (public). The room is illustrative."
  - The rebuild adds "modeled" to the score label and to the timeline exposure read-out.
- **No source links** in the main experience. Facility panels list source domains as text only.
- **Copy patterns:**
  - Mission titles are short and evocative ("Ahead of the Storm", "Break the Kill Chain").
  - Narration is spoken English with numbers written as words, opening "Mission one, New York." It runs briefing, signal (with "T minus" lead time), traditional ("Here is the traditional path..."), agentic ("Here is the AgenticOps path..."), and outcome ("The business outcome is not a faster ticket...", ending with who to talk to).
  - Decision prompts end with "What do you do?".
  - Event texts are one sentence, past tense, from a named source ("Capacity Agent", "War room").
  - Ticker lines use the form "City | Agent did X. Outcome."
  - No em dashes.
