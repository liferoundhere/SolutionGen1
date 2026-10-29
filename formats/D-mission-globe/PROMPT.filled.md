# Type D, Mission Globe: build prompt (filled for MetLife)

> Filled for MetLife, matching the original example (rosy-beacon-q5c8.here.now). Paste the whole prompt into Claude Code.

## 1. Role and output

You are a senior creative technologist building a **Mission Globe** for a Cisco account team: a dark, cinematic 3D globe of MetLife's real locations. Each location hosts a "mission", a weak IT signal that appears hours or days before it becomes a business problem. The viewer plays each mission twice on a scrubbable 4D timeline (traditional vs Cisco Cloud Control and AgenticOps, powered by the Splunk-based Cisco Data Fabric), makes a scored decision, and sees the modeled value protected.

Not a slide deck: no presenter camera box, no deck navigation. One globe, three modes (Present, Play, Learn), a game layer and a narrated audio dock.

**Stack (exact versions):** Vite 8.3.5, three 0.186.1 (OrbitControls, EffectComposer, RenderPass, UnrealBloomPass, OutputPass, CSS2DRenderer), gsap 3.15.0, topojson-client 3.1.0 with the Natural Earth 110m land TopoJSON inlined, and vite-plugin-singlefile 2.3.4. No other dependencies, no web fonts (`Inter, "Segoe UI", system-ui, ...`).

**Output:** `dist/metlife.html` (one file, works from `file://`), optional `dist/audio/<voice>/<hash>.mp3`, source in `app/src/` (world, timeline, narrator, audio, game, panels, dock, main, style, `data/content.json`) and `tools/narration-lines.mjs`.

Time budget: 12 hours, in this order: content accuracy, core loop, globe, polish.

## 2. Customer and audience

- Customer: **MetLife**. Global footprint: Global headquarters in the MetLife Building, 200 Park Avenue, New York, serving customers in more than 40 markets across the Americas, EMEA and Asia. Key sites: the Global Technology Campus in Cary, NC; a data center in North Greenbush, NY; the Tampa operations center; MetLife Investment Management in Whippany, NJ; MetLife Japan in Tokyo; and offices in Mexico City, Santiago, Brighton, Dubai and Noida.
- Audience: MetLife technology and business leaders (CIO and CTO organisation, CISO, chief risk officer, heads of Group Benefits, Retirement and MetLife Investment Management), plus the Cisco account team that will run the follow-up conversations. Goal of the experience: show that weak IT signals, correlated early and acted on under policy, protect MetLife revenue, customer trust and regulatory standing; then agree to pick one live mission and run discovery with its business owner, replacing the modeled numbers with MetLife's own.
- Cisco story: Cisco Cloud Control and AgenticOps, powered by the Splunk-based Cisco Data Fabric. Products and capabilities to feature: Cisco Cloud Control, AI Canvas, Cisco AI Assistant, Cisco Data Fabric (Splunk), Splunk ITSI, Splunk Observability Cloud, Splunk Enterprise Security and SOAR, ThousandEyes, Catalyst SD-WAN, Nexus Dashboard, Cisco XDR, Duo, Hypershield, Secure Access, Secure Firewall, Webex Contact Center.
- The customer's public strategy, which the missions must map to: its New Frontier strategy. Its pillars and public commitments: extend leadership in Group Benefits; capitalize on the retirement platform (U.S., U.K. and Japan); accelerate growth in asset management (MetLife Investment Management); expand in high-growth international markets; operate with efficiency. Public commitments: double-digit adjusted EPS growth, 15% to 17% adjusted ROE, a 100 bps lower direct expense ratio, and more than $25B of free cash flow.
- Presenter credit, used in the intro note and the page description: Stephen Ewings, Solutions Engineer, Cisco.
- Intro headline, a short promise that ends with a full stop: See it before it becomes the business problem..

## 3. Research plan (do this before writing content)

1. **Public facts only** (investor relations, 10-K, strategy material, newsroom, office list). Log a source per fact in `research.md`; no source links in the UI.
2. **Missions.** Pick 10 locations from the ten mission seeds below, plus minor offices (North Greenbush NY, London, Seoul, Shanghai, Hong Kong, Mumbai, Sydney, Sao Paulo, Istanbul, Paris, Warsaw, Dublin):

| Code | Title | City | Business unit | Lenses | Region | Unit | Modeled exposure |
|---|---|---|---|---|---|---|---|
| M-01 | Open Enrollment Surge | New York | Group Benefits | revenue, customer, IT | Americas | h | $14.0M |
| M-02 | The Change That Never Broke | Cary, NC | Global Technology | operations, IT, risk | Americas | h | $9.6M |
| M-03 | Ahead of the Storm | Tampa, FL | Claims and Customer Care | customer, operations, risk | Americas | h | $11.0M |
| M-04 | The Agent in the Living Room | Tokyo | MetLife Japan Retail and Annuities | revenue, customer, IT | Asia | h | $7.5M |
| M-05 | The Silent Conversion Leak | Mexico City | MetLife Xcelerator Partners | revenue, customer, IT | Americas | h | $5.2M |
| M-06 | Pension Day | Santiago | Pensions and Annuities | risk, operations, customer | Americas | h | $3.8M |
| M-07 | Inside the Impact Tolerance | Brighton | U.K. Retirement and Group Protection | risk, customer, operations | EMEA | h | $8.4M |
| M-08 | Break the Kill Chain | Dubai | MetLife Gulf | security, risk, customer | EMEA | m | $6.1M |
| M-09 | Every Voice, Clear | Noida | Global Operations and Service | customer, operations, IT | Asia | h | $2.6M |
| M-10 | Microseconds and Billions | Whippany, NJ | MetLife Investment Management | revenue, risk, IT | Americas | m | $12.0M |

Total modeled value: about $80.2M; for each, the business unit there, one publicly documented industry challenge, and the strategy pillar it touches.
3. **Buildings.** Address, floors and height, customer-occupied floors, neighbouring landmarks. Mark anything unverified **Illustrative**.
4. **Value modeling.** A modeled exposure per mission from public benchmarks (downtime cost per minute, breach cost, SLA credits, abandonment, slippage), about $2M to $15M, with a one-sentence basis starting "Modeled:".
5. **No internal data.** Never invent internal customer metrics.

## 4. Mission authoring rules

Write 10 missions (default 10), each at a different real location. Together they must cover all the business functions in Revenue and growth; Customer experience; Operations and cost; Risk and compliance; Security; IT and network. Each mission has exactly 3 function "lenses". Use at least 3 regions (Americas, EMEA, Asia), because badges reward completing each region. At least one mission must be a security incident measured in minutes (`unit:'m'`); the rest use hours.

Every mission needs all of the following:
- **Identity.** A `code` (M-01 to M-NN), a short evocative `title` ("Ahead of the Storm"), a `subtitle` of "City | Business unit", a `region`, 3 `lenses`, a `pillar` (the strategy pillar it protects), an `industryChallenge` (2 sentences) and a `metricName` (the business KPI being watched).
- **Timeline numbers.** `unit`, `range:[from,to]`, `agentDetect` (negative, so the lead time is real), `agentRemediate` (still before 0), `impact: 0`, `tradDetect` and `tradRecover` (after 0), `tradDip` (0.4 to 0.85) and `agentDip` (0 to 0.06).
- **Value.** `exposure` in dollars (modeled) and an `exposureBasis` that starts with "Modeled:".
- **Blast radius.** `blast`: 2 to 6 other site IDs affected if nobody acts.
- **Signals and products.** `signals`: 5 data sources the Data Fabric joins, including at least one business or external signal. `products`: about 6 Cisco and Splunk capabilities from Cisco Cloud Control, AI Canvas, Cisco AI Assistant, Cisco Data Fabric (Splunk), Splunk ITSI, Splunk Observability Cloud, Splunk Enterprise Security and SOAR, ThousandEyes, Catalyst SD-WAN, Nexus Dashboard, Cisco XDR, Duo, Hypershield, Secure Access, Secure Firewall, Webex Contact Center.
- **Events:** about 6 agentic and 5 traditional `{t, branch, sev: info|warn|crit|good, source, text}`, one sentence each from a named actor ("Capacity Agent", "War room"). The agentic branch includes a human approval in AI Canvas.
- **Narration**, six spoken paragraphs with numbers as words: `overview` ("Mission one, City.", 4-5 sentences), `briefing`, `signal` (states the lead time), `traditional` ("Here is the traditional path."), `agentic` ("Here is the AgenticOps path."), `outcome` ("The business outcome is not a faster ticket.", ending with who to talk to).
- **Decision.** A `prompt` that ends "What do you do?". Three `options`, one each of `best`, `partial` and `poor`, each `{label, detail, quality, feedback}`. Feedback is 1 or 2 sentences of consequence. The best option is always the governed agent action with human approval.
- **KPIs.** 4 rows of `{label, traditional, agentic}`, with concrete before and after values.
- **Academy chain:** `{signal, domain, capability, kpi, outcome}`.
- **Talk track.** 3 sentences an account rep can say verbatim.
- **Discovery.** 3 open questions for the business owner, about the last bad day and its cost.
- **Quiz.** 2 items of `{q, options:[3], answer, why}`. One is about business impact, one about how the agent knew.

**Per-mission product views** (`views[missionId]`): `service`; `tree` (6 nodes) with `rootNode`; `kpis:[4 {name, unit, good, bad}]`; `path` (5 typed hops, `bad` hop index, `alt` hop, `badMetric`, `goodMetric`, `source`); `assistant {q, spl (3-line SPL2), a, rows:[3], followups:[3]}` where the last follow-up opens AI Canvas; `canvas {prompt, plan:[4 {agent, source, task}], finding {title, evidence:[3]}, action {title, steps, policy, validation}}`; `alerts:[8 {tool, text}]`; `teams:[6]`; and, for the security mission, `security {verdict, tactics:[5], story:[5], responses:[4]}`.

**Facilities** (`facilities[siteId]`): `title, entity, address, intro` (spoken), `context` (manhattan|tokyo|cdmx|santiago|dubai|noida|brighton|campus), `buildings:[{id, label, shape: rect|octagon|faceted|datacenter, w, d, floors, floorH, x, z, rot?, podium?, metlife?:[[from,to]] customer floors, heightVerified?}]`, optional `landmarks, parking, lake, ponds, trees, mountains`, `facts:[4-5 {k, v, verified}]`, text-only `sources`, `links:[2-3 {to, label, bearing}]`.

**Zones** (`zones[missionId]`): `{buildingId, floor, room, basis, verified, devices: 4-5 {kind, label}}`. The basis states what is public and what is illustrative.

**Opening tour:** 6 chapters `{title, short, text, cam:{lat,lon,dist}, layer}`: customer promise (`sites`), strategy numbers (`sites`), "The era of network operations is changing" (`silos`), "One fabric of data" (`fabric`), "A vantage point above it all" (`agents`), "From IT problems to business outcomes" (`all`).

Also write a `finale` paragraph, 20 `ticker` lines ("City | Agent did X. Outcome."), 8 badges, 5 ranks and 22 or so `sites` (the mission hubs plus minor offices).

**Copy rules:** Plain, confident English. No em dashes. Mission titles are 2 to 5 words. Every dollar figure is labelled as modeled.

## 5. Data schema

One `src/data/content.json` with `sites, lenses, tour, finale, ranks, badges, missions, facilities, zones, views, ticker, lanes, fabricSources, fabricActions, studioVoices, strings`, shaped as in section 4. The 5 `lanes` are ThousandEyes `#38c6f4`, Splunk Data Fabric `#f99d1c`, Cloud Control agents `#5191f0`, Security XDR `#ff6a8a`, People and business `#a4ce4e`; events map to lanes by regex on `source`.

## 6. Layout (1440x900 reference)

- **Full-bleed WebGL globe** behind everything. Keep it centred in the free space between the side panels with `camera.setViewOffset`.
- **Top bar, 56px:** Cisco bars logo with "MetLife x Cisco Cloud Control" / "AgenticOps 4D · modeled scenarios"; mode tabs (Executive Tour | Explore Missions | Academy); live vantage stats (signals/hr, agents, resolved today); green score "VALUE PROTECTED · MODELED"; rank with XP bar; Badges (count), Voice, Ambient.
- **Breadcrumb pill**, centred under the bar: Globe › Region › City › Campus › Building › Floor N (room). Every crumb drills the camera.
- **Left mission rail, about 300px glass:** "Missions", lens chips ("All functions" plus one per function with a colour dot), mission rows (code tile, title, "City | Unit", 3 lens bars, status: Not started / Protected / Partial / Impacted with "$X at stake" or "$X" and "Quiz N%"), footer "Replay the opening".
- **Right step panel, about 384px glass:** kicker "M-01 | City, Country", title, subtitle, lens tags, step chips, scrolling body, "Live agent log" (events up to the playhead, newest first), nav row Back / Pause / Overview / Next (Next pulses on manual steps).
- **Bottom stack:** the 4D timeline (about 150 to 200px), then the live ticker (26px), then the audio dock (50px, max 900px, centred).
- **Stage windows:** floating product panels that dock into slots (nw, ne, sw, se, w, e, n, s, center) between the rails, with a dashed animated leader line to the site.
- **Captions:** centred above the timeline.
- **Mobile (≤760px):** tabs wrap to their own row, the rail becomes a "Missions" drawer, the step panel a 42vh bottom sheet; hide timeline, ticker and captions; one stage window at a time; intro cards stack; no horizontal scroll.

## 7. Design tokens

- **Background `#02050c`.** Glass `rgba(6,14,30,.74)` with a 14px blur; lines `rgba(120,170,255,.16)` and `.30`.
- **Text:** ink `#e6f0ff`, ink-2 `#c7d4ea`, muted `#93a7c6`, dim `#6b7f9f`.
- **Accents:** Cisco blue `#049fd9`, sky `#3fb6ff`, cyan `#7fe7ff`, fabric `#2fb4ff`.
- **States:** signal `#ffd166`, warning `#ffb020`, critical `#ff3b4f`, recovering `#ff9f43`, protected `#7cf29c`.
- **Timeline:** traditional `#ff4d5e`, AgenticOps `#6ff09a`, forecast `#ffc14d`.
- **Lenses:** revenue `#a4ce4e`, customer `#5ec8f2`, operations `#f2c14e`, risk `#c792ea`, security `#ff6b6b`, IT `#049fd9`.
- **Academy chain:** signal `#00bceb`, domain `#8e7cff`, capability `#2de2c5`, KPI `#fbab18`, outcome `#6cc04a`.
- **Radii:** 14 panels, 10 buttons, 999 chips.
- **Type:** panel title 19px/760, lead 14px, body 13px, uppercase micro-labels 10.5px with 0.12em letter-spacing, window text 11.5px. Use tabular numbers.
- **Intro:** kicker 13px/800, 0.3em tracking, customer name sky blue; H1 `clamp(32px, 4.4vw, 64px)`/800 with gradient `#f2fbff → #c4ecff → #8fe3d9 → #a6d977`; lead 18px `#9fb2cf` with product names bold white; three glass cards (11px cyan kicker, 22px title, 14px muted text).

## 8. Globe

- **Renderer:** ACES filmic tone mapping, exposure 1.05, clear colour `#02050c`. UnrealBloom at strength 0.62, radius 0.5, threshold 0.32, then an OutputPass. Labels use CSS2D.
- **Ocean:** a fresnel sphere of radius 0.995.
- **Land:** about 95,000 Fibonacci-sphere points, kept where a 2048x1024 canvas raster of the TopoJSON land says land (latitude ≥ -62°).
- **Point shader:** day/night from a sun that follows the mission clock (`lon = siteLon + 30 - hours × 15`), amber city lights on about 3.5% of night points, and uniforms for a focus glow, a scan ring and a rippling incident disc (red, amber or green).
- **Atmosphere:** a back-face additive shell at 1.16× in `#1d8fff`. Add 2,600 stars.
- **Vantage shell (Cloud Control):** icosahedron wireframe (r 1.55, detail 3, about 5% opacity), three tilted counter-rotating torus rings, nine glowing octahedron "agents" orbiting them.
- **Data streams:** 26 particles per site rise to the shell. In the "silos" layer they take siloed colours and stop short.
- **Fabric arcs:** about 30 great-circle tubes between sites, with lift `0.03 + min(d, 1.3) × 0.17` and a travelling pulse head in `#2fb4ff`.
- **Pins:** spike (hubs 2× taller), glow head, base and pulse rings, protected dome, hit sphere; colour tweens by state; CSS2D label with city and live note ("T-48h 00m | Agent acting"); click opens the mission, hover shows a tooltip.
- **Blast radius:** red arcs from the mission site to its `blast` sites while the state is critical.
- **Agent beam and shockwave:** a striped cyan beam on the site while the agent acts (one shell agent flies to it). A green shockwave ring when the site becomes protected.
- **Ambient flashes:** a random green or cyan flash every 1.3 s.
- **Story layers** tween 5 values (fabric, streams, reach, silo, shell) over 2.2 s, with presets `sites`, `silos`, `fabric`, `agents` and `all`.
- **Camera:** FOV 42, start at lat 25, lon -40, distance 3.8 with idle spin; `flyTo(lat, lon, dist)` on a great circle with mid-flight lift; region 3.25, city 2.2 at lat - 6, branch views 3.1 / 2.35; orbit controls, no pan, 1.35 to 7.
- **Building close-up** (fly to 1.32, radial "warp" flash, second scene): shader street grid with radar ring; procedural lit-window city in the site's `context` style; landmarks, water, trees; the real building(s) as translucent floor slabs, customer floors blue, mission floor cyan coloured by state, hover tooltips (public vs illustrative).
- **Floor focus:** fade upper floors, dim the city, reveal desks, a room box and labelled device beacons. Warning beam, red critical alarm ring, green protected dome. Drill: globe › region › city › site › building › floor.

## 9. Mode flows

Each mode is a list of steps. A step has `narration`, `enter()` (camera, timeline and drill), `render()` (HTML for the right panel), `cues: [[fraction, fn]]` that fire as narration progresses, and `wait: 'auto' | 'manual'` (auto advances 1.4 s after the narration ends).

- **Intro screen** over the spinning globe: kicker, See it before it becomes the business problem. as H1, lead, three cards (PRESENT · Executive Tour, PLAY · Explore Missions, LEARN · Account Team Academy), disclaimer, "Best with sound on…". Support `?mode=…&mission=<id>&voice=off`.
- **Executive Tour** (narrated, auto-advancing): 6 opening chapters; per mission Briefing (into the building, then the floor), Signal, Timeline A, Timeline B, Outcome; a finale with all sites protected, the total modeled value, a value table, and Explore / Academy buttons.
- **Explore Missions.** The idle panel reads "Choose a mission". The steps are:
  1. Overview (audio overview and chain).
  2. Briefing (cards: where it happens, known industry challenge, strategy priority at stake, Data Fabric sources joined).
  3. Signal (play the AgenticOps view to 30% of the agent window; ThousandEyes path, Splunk ITSI and AI Assistant windows; lead-time callout).
  4. **Decision**, manual. The AI Canvas shows the proposed action and "Your call"; the same options appear in the right panel; Next is disabled until a choice is made.
  5. Your outcome. Best plays the AgenticOps branch; partial or poor plays the traditional branch.
  6. The other timeline.
  7. Outcome, manual: a big modeled number, the basis, the KPI table, the chain and the products, with buttons Next mission, Replay and make a better call, and All missions.
- **Account Team Academy.** Overview, Briefing, Signal, Timeline A, Timeline B, Outcome, then:
  - **Connections:** a big chain, talk track, "Discovery questions to ask" and capability chips;
  - **Quiz:** answer to reveal; the score earns XP; then Next mission.
- **Stage windows** (opened by cues and timeline clicks): Splunk ITSI health and service tree; ThousandEyes path with bad hop and alternate; AI Canvas (typed prompt, 4-agent plan, forecast, root cause, policy-checked action, Approve / Revise / Reject, "Your call", reasoning trail); AI Assistant with generated SPL2 and follow-ups; the traditional "12 tools, 6 teams, 1 bridge call" storm; XDR attack story with SOAR tasks; Business impact (Modeled); Facility facts; Data Fabric diagram; Cloud Control topology. The tour adds five context panels.
- **Keys:** Space pauses. Left / Right moves by sentence. Shift + arrows or PgUp/PgDn move by section. Escape closes.

## 10. 4D timeline

- **Model.** One mission clock in hours or minutes from T-0. Branches are `traditional` and `agentic`; views are Compare, Traditional and AgenticOps.
- **KPI health (0 to 100):** traditional dips by `tradDip` from T-0 to `tradRecover`; agentic dips by `agentDip` between detect and remediate, then improves slightly; small jitter on both.
- **Site state** drives globe, building and windows: traditional idle › signal › critical › recovering › idle; agentic idle › warning › protected.
- **Canvas chart:** 132px label gutter, KPI band in the top 40% (grid 0/50/100), 5 swim lanes, dashed T-0 "business moment" line, glowing curves (dashed forecast in the AgenticOps view), event diamonds (agentic) and circles (traditional, white ring if critical), lead-time and outage bands, white playhead, "Agent lead time: N hours".
- **Interaction.** Drag to scrub. Hover an event for a tooltip; click it to open the matching window and toast the event. The header shows the clock `T-48h 00m`, KPI read-outs and "Exposure $X (modeled)". There is a Hide button.

## 11. Game logic

- **Value protected** = `exposure × {best: 1, partial: 0.4, poor: 0}`. Keep only the best result per mission. Tour and academy runs count as best.
- **XP:** +150 / +60 / +20 per outcome quality; +20 the first time a mission's timelines are compared; +30 per correct quiz answer.
- **Ranks:** Observer 0, Operator 200, Correlator 600, Orchestrator 1200, AgenticOps Architect 2000.
- **8 badges:** First Save, Perfect Call (3 best calls), Americas / Asia / EMEA Guardian (all missions in a region), Account Scholar (100% on 3 quizzes), Time Traveler (compare in 5 missions), Global Vantage (all missions).
- **Rewards:** a toast plus a chime, and a floating "+XP +$X". There is a badges modal with a reset.
- **Persistence:** `localStorage` with `metlife-agenticops-*` keys, wrapped in try/catch.
- **WebAudio:** an ambient pad (off by default; it ducks under narration), and cues for info, warn, crit, good and badge. Create the AudioContext only after a user gesture.

## 12. Narration

- **Sentence engine.** Split narration into sentences. Speak them one at a time, fire step cues by `(index + sentenceProgress) / total`, and show each sentence as a caption.
- **Dock:** section and sentence skip, play/pause, a clickable segment bar (one segment per sentence, width by length, live fill), counter, and a voice popover (Voice and Captions toggles, speed 0.85 to 1.5x, Studio / Premium device / Other device voices with previews). Settings persist.
- **Studio voices:** Heart, Michael (US English), Emma, George (British English) at `audio/<voice>/<fnv1a32(collapsed sentence)>.mp3`; manifest in `<script type="application/json" id="studio-manifest">` (`{"base":"audio","voices":{}}` when empty); `tools/narration-lines.mjs` prints `{hash, text}` per sentence for offline rendering.
- **Fallback per sentence:** studio MP3 if listed, else the best English `speechSynthesis` voice (prefer natural / neural / premium / enhanced / online / google / siri names), else a silent timer of `words / 2.6 / rate + 0.5` s. Drop a failing MP3 hash and retry; on an autoplay block, toast and resume on the next gesture. Nothing may throw without audio.

## 13. Disclaimer

Show this verbatim on the intro, filled in: "Illustrative scenarios built from public information about MetLife (including its New Frontier strategy and public filings) and common challenges across the insurance industry. No MetLife internal data is used. Dollar figures are modeled estimates based on industry benchmarks, meant for discussion only."

Label the score, timeline exposure and impact window "modeled", show each outcome's "Modeled:" basis, tag facility facts "Public source" or "Illustrative", and add no source links in the UI.

## 14. Quality checks and review

- **Content:** all fields present; detect < remediate < 0 < tradDetect < tradRecover; narration uses only facts in the data; no em dashes; every dollar labelled modeled.
- **Playwright review** (Chromium, `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`) at 1280x720 and 1440x900: intro, Explore idle, a Decision step, Academy Connections, an AgenticOps timeline; plus intro and a mission at 390x844.
- **Pass criteria:** zero console errors; no mobile horizontal overflow; a decision updates score, XP, rail and badges; the quiz scores; scrubbing changes globe states; the tour auto-advances with `?voice=off`.
- Do 2 or 3 visual passes: fix overlap, crowding at 1280x720, legibility of the timeline lanes, and panel scroll.

## 15. Deliverables

1. `dist/metlife.html`, a single self-contained file of about 1 to 1.5 MB, plus an empty `dist/audio/`.
2. The `app/` source with `npm run build`.
3. `research.md` with the source for each fact and each value basis.
4. Screenshots of the review states.
5. README notes: adding studio voices, deep links, editing `content.json`.
