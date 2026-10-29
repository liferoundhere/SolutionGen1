// All on-screen copy, the talk track (notes), live links, sources. One source of truth
// for the stage, the presenter window, the talking points page, and the printable talk track.
// Rebuilt from the Dominion Energy and Splunk IT leadership briefing (public sources plus
// labeled "our work together" items). Numbers in brackets are citations into SOURCES.
// Copy rules: two-clause headlines (title + grad outcome), no em dashes anywhere.

export const DECK = {
  name: 'Dominion Energy and Splunk',
  sub: 'IT leadership briefing · Splunk, a Cisco company',
  channel: 'dominion-splunk-briefing',
  film: {
    blurb: 'An AI narrator walks you through this IT leadership briefing step by step, in about twelve minutes. Choose a narrator.',
    album: 'Dominion Energy and Splunk IT leadership briefing',
    // No pre-rendered neural audio ships with this build. Device voice and captions only.
    audio: false,
  },
};

export const PRESENTER = {
  name: 'Stephen Ewings',
  role: 'Solutions Engineer, Cisco',
};

// Chapters of the story (used by the focus scene's chip row and card colors).
export const BLOCKS = [
  { key: 'demand', label: 'Act I · Demand', hint: 'Data Center Alley', color: '#FBAB18' },
  { key: 'wind', label: 'Act II · Wind', hint: 'CVOW', color: '#2DE2C5' },
  { key: 'nuclear', label: 'Act III · Nuclear', hint: 'North Anna', color: '#FFD95A' },
  { key: 'threat', label: 'Act IV · Threat', hint: 'Inhabited silently', color: '#FF6B4A' },
  { key: 'fabric', label: 'Act V · Fabric', hint: 'Splunk underneath', color: '#F25C9A' },
  { key: 'agentic', label: 'Act VI · Agentic', hint: 'Cloud Control', color: '#00BCEB' },
  { key: 'mission', label: 'Act VII · Mission', hint: 'The capital', color: '#8E7CFF' },
  { key: 'storage', label: 'Act VIII · CIP-015', hint: 'Storage', color: '#6CC04A' },
  { key: 'merger', label: 'Epilogue · NextEra', hint: 'One fabric', color: '#9BE7FF' },
];

// Live links (Links panel, L key). https only.
export const VERSES = [
  { key: 'brief', name: 'Original leave-behind', sub: 'The scrolling briefing page', color: '#00bceb', scene: 'sources', gen: 'Briefing', url: 'https://hollow-flame-f2tf.here.now/' },
];

export const SCENES = [
  {
    id: 'title',
    eyebrow: '00 · Prepared for Dominion Energy IT leadership, October 2026',
    title: 'Dominion Energy, operated by agents.',
    grad: 'Grounded in one data fabric.',
    lead: 'How the Splunk platform you already run, with Cisco Cloud Control, supports your business initiatives, CIP-015 readiness and mission customers.',
    layout: 'hero',
    beats: [{ h: 'Stephen Ewings', p: 'Solutions Engineer, Cisco. Built from public sources and our work together; every claim carries a numbered citation.' }],
    notes: [
      "Thank you for the time. This is a briefing for Dominion IT leadership, built from public sources and from the work our teams are already doing together. Every number you see carries a citation in brackets, and the last scene lists them all. The idea in one line: Dominion, operated by agents, grounded in one data fabric that you already run.",
    ],
  },
  {
    id: 'twin',
    eyebrow: '01 · Digital twin',
    title: 'One territory, every critical function.',
    grad: 'Three layers, one click at a time.',
    lead: 'A schematic of Virginia, North Carolina and South Carolina. Site positions are illustrative, not to scale.',
    beats: [
      { h: 'Operations', p: 'Generation, T&D, data centers, federal and customer sites; 3.6M electric customers [54], plus the Pentagon feed [18].' },
      { h: '+ Splunk fabric', p: 'Every site lands in one Cisco Data Fabric: Core, ES Premier, SOAR, ITSI, Edge Processor, Federated Search [43].' },
      { h: '+ Cloud Control', p: 'Governed agents orbit above, from Storm Surge to Mission Assurance [36] [37].' },
      { h: 'Simulate attacks', p: 'Red paths show what the sector reports: VOLTZITE at ICS Stage 2, OT ransomware up 64% [23].' },
      { h: 'All layers', p: 'The fabric sees it, agents propose, humans approve, and every step is traced in Splunk.' },
    ],
    notes: [
      "This is a digital twin of the territory. Three states, three point six million electric customers, the feed to the Pentagon, and the largest data center market in the world. Every one of these sites emits machine data. The positions are schematic, not survey grade.",
      "Click. Underneath every site sits the Splunk platform you already run. Core, Enterprise Security Premier and SOAR, extended with ITSI, Edge Processor and Federated Search. One data fabric under every function.",
      "Click. Above it, Cisco Cloud Control orchestrates governed agents. Storm Surge, CIP Evidence, Vendor Compromise, Large-Load Readiness, the CVOW weather window, Mission Assurance and more. Each one is something we could build together.",
      "Click. Now simulate the threat. These red paths reflect what Dragos and E-ISAC report across the sector: adversaries pre-positioning inside utilities, and OT ransomware up sixty four percent. Nothing here implies an incident at Dominion.",
      "Click. All layers on. The fabric sees the anomaly, an agent proposes a response, a human approves it, and every step is traced in Splunk. That is the story of this briefing in one picture.",
    ],
  },
  {
    id: 'story',
    eyebrow: '02 · The story in ten chapters',
    title: 'Ten chapters, one territory.',
    grad: 'From machine data to agentic operations.',
    lead: 'The original audio briefing walked these chapters across the twin. Each click opens the next one.',
    layout: 'focus',
    beats: [
      { h: 'Prologue: one territory, every critical function', p: 'Dominion powers 3.6 million customers across VA, NC and SC, plus the Pentagon feed and the largest data center market. [54] [18] [1]' },
      { b: 0, n: 'ACT I · DATA CENTER ALLEY', h: 'The demand shock in Data Center Alley', q: 'Over 53 GW of data center capacity in contracting [4]', p: 'Nine of the ten all-time peak days happened this year. Grid reliability is now a hyperscaler SLA. ITSI and the Cisco Time Series Model can turn historian, EMS and AMI data into forecasts.' },
      { b: 1, n: 'ACT II · CVOW', h: "Building the East Coast's largest offshore wind farm", q: 'First power March 23, 2026; 81% complete [8] [10]', p: 'Each quarter of delay costs about $144M. Turbines, offshore substations and vendor remote access become a new OT estate to observe and defend from day one. [12]' },
      { b: 2, n: 'ACT III · NORTH ANNA', h: 'Carbon-free baseload for 80 years', q: 'Licensed to 2058 and 2060; SMR path with Amazon [17] [15]', p: 'Nuclear cyber programs need airtight evidence: portable media, critical digital asset baselines, one-way data transfers and insider risk. [16]' },
      { b: 3, n: 'ACT IV · THREAT', h: 'A grid that is being "inhabited silently"', q: 'VOLTZITE at Stage 2; OT ransomware up 64% [23]', p: 'SYLVANITE inside a U.S. electric utility. E-ISAC logged more than 3,500 physical incidents. [24] [25]' },
      { b: 4, n: 'ACT V · FABRIC', h: 'Splunk: the data fabric under everything', q: 'Core, ES Premier and SOAR already in place', p: 'Every historian, firewall, badge reader, turbine and IVR session lands in one Cisco Data Fabric. Data that should stay put is federated from S3, Snowflake and Azure. [43] [44] [55]' },
      { b: 5, n: 'ACT VI · AGENTIC', h: 'Cloud Control: agentic ops with humans in charge', q: 'One login, one data layer, one system of action [36]', p: 'Agent Builder connects ServiceNow, PagerDuty, Microsoft and AWS through native connectors and MCP. AI Defense governs; AI Agent Monitoring traces. [37] [38]' },
      { b: 6, n: "ACT VII · THE NATION'S CAPITAL", h: "Mission assurance for the nation's capital", q: 'Feeds JBM-HH and the Pentagon; 300+ federal sites [18] [20]', p: 'Exploring on-base generation with the Navy at Yorktown. Splunk Cloud is FedRAMP High with a DoD IL5 provisional authorization. [21] [45] [46]' },
      { b: 7, n: 'ACT VIII · CIP-015', h: 'CIP-015: re-architecting access to storage', q: 'Monitor, retain, protect [56] [57]', p: 'Hot detections in Splunk Cloud, full-fidelity data in Dominion-owned S3 read in place by Federated Search, and evidence archived for audits. [63]' },
      { b: 8, n: 'EPILOGUE · NEXTERA', h: 'Two companies, one future, one fabric', q: "World's largest regulated electric utility business [6]", p: "Federated search lets both SOCs see each other's risk on Day 1 without migrating a byte, while agents manage the integration workload. [7] [55]" },
    ],
    notes: [
      "The original briefing came with a short audio story in ten chapters. Here they are, one per click. The prologue: one territory, every critical function, and all of it emitting machine data.",
      "Click. Act one, the demand shock. More than fifty three gigawatts of data center capacity in contracting, and nine of the ten all-time peak days this year. Reliability is now a hyperscaler service level.",
      "Click. Act two, offshore wind. CVOW delivered first power in March and is eighty one percent complete. Every quarter of delay costs about one hundred forty four million dollars, and the turbines become a permanent OT estate.",
      "Click. Act three, nuclear. North Anna is licensed into the twenty fifties, with an SMR option alongside Amazon. That means decades of airtight cyber evidence.",
      "Click. Act four, the threat. Dragos describes a grid being inhabited silently: VOLTZITE at stage two of the ICS kill chain, SYLVANITE inside a U.S. utility, and OT ransomware up sixty four percent.",
      "Click. Act five, the fabric. Dominion already runs Splunk Core, ES Premier and SOAR. Everything lands in one data fabric, and data that should stay where it is gets searched in place.",
      "Click. Act six, agentic operations. Cloud Control gives people and agents one login, one data layer and one system of action, with AI Defense governing and Splunk tracing every step.",
      "Click. Act seven, mission assurance. Dominion owns the system that feeds the Pentagon and serves more than three hundred federal sites, and Splunk Cloud holds FedRAMP High.",
      "Click. Act eight, CIP-015. Our teams are reshaping how Splunk Cloud stores and reaches monitoring data: hot detections, full fidelity in Dominion-owned S3, and evidence archived for audits.",
      "Click. The epilogue. The proposed NextEra combination. Federated search lets both security teams see shared risk on Day 1 without migrating data, while agents carry the integration workload.",
    ],
  },
  {
    id: 'kpis',
    eyebrow: '03 · At a glance',
    title: 'Building at a scale it has never built.',
    grad: 'Six numbers frame the brief.',
    lead: 'Each figure comes from filings, earnings calls or regulators. Bracketed numbers point to the sources scene.',
    beats: [
      { h: '$65B and 53.8 GW', p: 'The 2026 to 2030 capital plan [1] [2]; data center capacity in contracting [3] [4].' },
      { h: '3.6M and 81%', p: 'Electric customers in VA, NC and SC [54]; CVOW complete, 176 turbines, 2.6 GW [10].' },
      { h: '2H 2027 and 10/1/2028', p: 'Expected close of the NextEra combination [7]; NERC CIP-015 INSM takes effect [29].' },
    ],
    notes: [
      "Six numbers frame everything else. Sixty five billion dollars of capital through twenty thirty, and fifty three point eight gigawatts of data center capacity in contracting.",
      "Click. Three point six million electric customers across three states, and an offshore wind farm that is eighty one percent built: one hundred seventy six turbines, two point six gigawatts.",
      "Click. And two dates. The NextEra combination is expected to close in the second half of twenty twenty seven, and CIP-015 internal network security monitoring takes effect on October first, twenty twenty eight.",
    ],
  },
  {
    id: 'leadership',
    eyebrow: '04 · For IT leadership',
    title: 'What this means for Dominion IT.',
    grad: 'Six outcomes from what you run.',
    lead: 'Dominion is building at a scale it has never built before while the threat to the grid keeps rising.',
    beats: [
      { h: 'Builds on what you run', p: 'More value from ES Premier and SOAR: the agentic triage, UEBA and automation you already license.' },
      { h: 'Supports our current work', p: 'CIP-015 ready by Oct 2028 [28] [29]; retention without runaway cost through tiered storage and federated search.' },
      { h: 'Extends the platform', p: 'Resilient digital services, governed AI and agents [37], and a fabric that is integration-ready for NextEra [7].' },
    ],
    notes: [
      "So what does this mean for the CIO organization? Six outcomes. The first sits at the center because it builds on what you already run: more value from ES Premier and SOAR, so analysts spend time on decisions instead of queues.",
      "Click. The next two support the work our teams are doing right now: CIP-015 readiness by October twenty twenty eight, and retention that can grow for years without runaway cost.",
      "Click. The outer ring extends the platform: service views for outage, billing and large-load interconnection, every AI agent observed and governed, and a federated fabric that is ready for NextEra without moving sensitive data before close.",
    ],
  },
  {
    id: 'account',
    eyebrow: '05 · Our work together',
    title: 'Re-architecting access to storage.',
    grad: 'Ready for CIP-015, without runaway cost.',
    lead: 'Our work together: how monitoring data is stored, retained, protected and searched in the Splunk Cloud you already run.',
    beats: [
      { h: 'Collect, inside the ESP', p: 'Cyber Vision sensors in IE switches; Edge Processor filters, masks BCSI fields and routes by data type [56].' },
      { h: 'Detect: R1 in Splunk Cloud', p: 'Searchable DDAS keeps detections hot for ES Premier correlation, UEBA and SOAR [56].' },
      { h: 'Retain: R2 in Dominion-owned S3', p: 'Full-fidelity flows and PCAP, read in place by Federated Search [62] [63] [64].' },
      { h: 'Prove: R3 archive and immutability', p: 'DDAA keeps evidence up to 10 years [61]; replicate to a separate Object Lock bucket (our recommendation) [63].' },
      { h: 'Act: CIP Evidence Agent', p: 'Cloud Control assembles R1 to R3 evidence per anomaly, with a human approval gate before anything is filed [37].' },
    ],
    notes: [
      "This is the work already in motion between your teams and ours. It starts inside the electronic security perimeter, where Cyber Vision sensors and Edge Processor collect, filter and mask data before it moves.",
      "Click. Requirement one: detect and evaluate anomalous activity. Detections and context stay hot in Splunk Cloud, so ES Premier, UEBA and SOAR can work them.",
      "Click. Requirement two: retain anomalous-activity data until the evaluation closes. Full fidelity data goes to an S3 bucket Dominion owns, and Federated Search reads it in place, so analysts never leave one console.",
      "Click. Requirement three: protect that data from deletion or tampering. The Splunk managed archive holds evidence for up to ten years. One constraint to resolve early: Ingest Processor cannot write to an Object Lock bucket, so we recommend replicating to a separate locked copy.",
      "Click. Then act. A CIP Evidence Agent in Cloud Control assembles the evidence for each anomaly, from detection to closure, and a person approves it before anything is filed.",
    ],
  },
  {
    id: 'thesis',
    eyebrow: '06 · The thesis',
    title: 'Three layers, one story.',
    grad: 'Starting from the platform you already run.',
    lead: 'This is not a SIEM conversation. It is how every function runs on trusted data and safely governed agents.',
    beats: [
      { h: 'What you already run', p: '13 use cases run entirely on Splunk Core, ES Premier and SOAR; 20 extend it with an add-on or Cisco; 20 need new capability.' },
      { h: 'Why now', p: 'Build-out at unprecedented scale [2] [3]; adversaries pre-positioning [23] [24]; security already converged [14]; AI already in production [33] [35].' },
      { h: 'Two catalysts', p: 'The NextEra combination [7] and federal mission customers [18] [45] both reward a federated, authorized data fabric.' },
    ],
    notes: [
      "Here is the thesis. Four layers: Dominion's business functions at the base, Cisco infrastructure and security in the estate, the Splunk data fabric, and Cloud Control on top. Thirteen of the use cases in this brief run entirely on what you already own.",
      "Click. Why now? The largest build-out in Dominion's history, adversaries moving from access to preparation for impact, a security organization that is already converged under one CSO, and AI that is already in production on drone imagery and the contact center.",
      "Click. And two catalysts: the NextEra combination and your federal mission customers. Both reward a federated, authorized data fabric with governed agents on top.",
    ],
  },
  {
    id: 'alignment',
    eyebrow: '07 · Alignment',
    title: 'What Dominion is trying to accomplish.',
    grad: 'And where Splunk and Cisco help.',
    lead: 'Twelve initiatives from public filings, earnings calls and dockets, mapped to 27 products. Green cells are in place today.',
    beats: [
      { h: 'Growth', p: 'Record data center demand [3] [4]; the $65B plan, 45% on T&D [2] [13]; completing CVOW [8] [10].' },
      { h: 'Grid and generation', p: 'Grid Transformation (OMS, AMI, iMAP) [30] [31] [33]; nuclear life extension [17]; Chesterfield and Canadys [13].' },
      { h: 'Clean energy, security, NextEra', p: 'VCEA and net zero [32]; converged security and federal partnership [14]; NextEra readiness [6] [7].' },
      { h: 'AI, mission and regulation', p: 'AI in operations [34] [35]; DoD and federal customers [18] [20]; NERC CIP-015 and TSA [28] [29].' },
    ],
    notes: [
      "Every initiative here comes from Dominion's own filings, calls or dockets. Each row is an initiative and each column a Splunk or Cisco product. Start with growth: data center demand, the capital plan, and offshore wind.",
      "Click. Then the grid and generation: the Grid Transformation Plan with outage management, AMI and visual AI, nuclear life extension, and new reliability generation at Chesterfield and Canadys.",
      "Click. Clean energy mandates, converged security with federal partners, and readiness for the NextEra combination. Notice how often the green cells appear: the products you already run.",
      "Click. Finally AI in operations, mission customers, and regulation. Nine of the twelve rows extend what you run today; three need new capability.",
    ],
  },
  {
    id: 'threats',
    eyebrow: '08 · Threat landscape',
    title: 'What the sector is reporting.',
    grad: 'Every threat has a counter.',
    lead: 'Peer, regulator and researcher findings. Nothing here implies an incident at Dominion.',
    beats: [
      { h: 'Twelve sector threats', p: 'Two critical, six high, four medium. Each click turns a group of shields to its counter.' },
      { h: 'Critical: VOLTZITE and SYLVANITE', p: 'Counter: engineering workstation baselines (UEBA), Cyber Vision INSM, LOTL hunts; AD credential-theft analytics and the Triage Agent [23] [24].' },
      { h: 'OT under pressure', p: 'KAMACITE maps control loops, ELECTRUM hit DER, ransomware up 64%. Counter: ARI exposure and segmentation, Edge Hub DER telemetry, ES Premier with SOAR [23] [24].' },
      { h: 'Exposure and the physical grid', p: '24-day exploit window, 3,500+ physical incidents, GridEx VIII. Counter: ARI with Cyber Vision, converged PACS and camera correlation, ITSI service health [24] [25] [26].' },
      { h: 'AI-era risks', p: 'Agentic privilege creep; drift and safety bypass in OT. Counter: AI Defense policy, approval gates, AI Agent Monitoring, advisory-only OT agents [50] [51].' },
      { h: 'Vendors and the merger window', p: 'Vendor compromise [13] [14]; merger-window phishing, a sector pattern [7]. Counter: a SOAR playbook for the Vendor Compromise Response Plan, SEA, Duo MFA.' },
    ],
    notes: [
      "Twelve threats, all drawn from sector reporting by Dragos, E-ISAC, NERC and CISA. Two critical, six high, four medium. Nothing here implies an incident at Dominion. Each click turns a group to its counter.",
      "Click. The two critical ones. VOLTZITE, which overlaps Volt Typhoon, manipulating engineering workstations at stage two, and SYLVANITE, an access broker inside a U.S. utility. The counter: workstation baselines, Cyber Vision monitoring, living off the land hunts, and the Triage Agent you already own.",
      "Click. OT under pressure. KAMACITE mapping control loops, ELECTRUM hitting distributed energy resources, and ransomware up sixty four percent. The counter: exposure analytics, segmentation, DER telemetry at the edge, and containment in ES Premier and SOAR.",
      "Click. Exposure and the physical grid. A median of twenty four days from disclosure to exploit, more than thirty five hundred physical incidents, and the GridEx heat dome scenario. The counter: vulnerability matching, converged physical and cyber correlation, and cross-domain service health.",
      "Click. The AI-era risks CISA calls out: agent privilege creep, and drift or safety bypass in OT. The counter: AI Defense policy, human approval gates, agent tracing in Splunk, and advisory-only agents near OT.",
      "Click. Vendors and the merger window. Dominion's own 10-K says vendors may be compromised, and long public regulatory windows are a classic phishing lure. The counter: the Vendor Compromise Response Plan as a SOAR playbook, governed vendor access, and phishing-resistant MFA. Every shield now has a counter.",
    ],
  },
  {
    id: 'departments',
    eyebrow: '09 · Departments',
    title: 'Every department, every persona.',
    grad: 'Use cases on what you have.',
    lead: 'Twelve departments, each with personas, the outcomes they own, and use cases labeled by whether they run on what you have today.',
    beats: [
      { h: 'Twelve departments', p: 'SOC, OT and NERC CIP, Grid Ops, CVOW, Nuclear, Large Load, Customer and IT, Physical, Executive Risk, Integration Office, Federal, AI Governance.' },
      { h: 'Security Operations Center', p: 'The Director cuts time to respond; the Analyst closes the queue; the Threat Hunter finds VOLTZITE-style activity before it reaches OT [23].' },
      { h: 'Nine SOC use cases', p: 'Four are new use cases on what you already run, such as Triage Agent dispositions and SOP Agent response plans; five extend it [42].' },
    ],
    notes: [
      "Think of the company as a city of departments. Twelve of them, from the SOC to AI governance, each with personas and outcomes they own.",
      "Click. Take the Security Operations Center. Three personas: the director who has to prove SOC value to the board, the analyst who has to close the queue without missing the one real intrusion, and the hunter looking for living off the land activity before it reaches OT.",
      "Click. Nine use cases for those three people. The green ones run on what you already own: agentic triage, risk-based alerting, turning SOPs into response plans, and briefing-derived detections. The blue ones extend it with Attack Analyzer, Duo, Talos or App Builder.",
    ],
  },
  {
    id: 'dashboards',
    eyebrow: '10 · Dashboards',
    title: 'What each persona would see.',
    grad: 'Illustrative, in Dashboard Studio.',
    lead: 'The SOC Command Center for the Director, Cyber Defense Operations. All values here are illustrative, not Dominion data.',
    beats: [
      { h: 'SOC Command Center', p: 'Findings ingested, Triage Agent auto-dispositions, mean time to triage and to respond. Runs on ES Premier, which you own.' },
      { h: 'Triage Agent dispositions', p: 'Benign, escalated, auto-contained by SOAR, or needs more context; and findings by domain from identity to OT.' },
      { h: 'Top risk entities', p: 'An engineering workstation exporting configs, a Kerberoast pattern, an Ivanti IOC match from Talos.' },
    ],
    notes: [
      "Here is what one persona would see. The SOC Command Center for the director of cyber defense operations. Everything on this screen is illustrative data, shaped from the use cases, not Dominion numbers.",
      "Click. The Triage Agent's dispositions: what it closed as benign, what it escalated to an analyst, and what SOAR contained automatically. Next to it, findings by domain, from identity and endpoint down to OT and physical.",
      "Click. And the top risk entities: the kind of signals a VOLTZITE-style intrusion leaves, like a config export from an engineering workstation, or an edge device matching a Talos indicator. The original brief has fifteen of these views, one per persona.",
    ],
  },
  {
    id: 'cloud',
    eyebrow: '11 · Cisco Cloud Control',
    title: 'AgenticOps across every system.',
    grad: 'With humans in charge.',
    lead: 'Cisco, Splunk and everything else. Unveiled at Cisco Live on June 2, 2026, with Splunk as the data fabric [36].',
    beats: [
      { h: 'One login, one data layer', p: 'Splunk Platform, ITSI and Observability Cloud are available in Cloud Control [36] [39].' },
      { h: 'Agent Builder and App Builder', p: 'Describe an agent, connect tools through native integrations and MCP, publish through a versioned lifecycle; App Builder brings OpenAI Codex [37] [38].' },
      { h: 'The ecosystem', p: 'Cisco, Splunk, third party such as ServiceNow, PagerDuty and AWS, and Dominion systems via MCP such as SAP, Esri ArcGIS and plant historians [36] [37].' },
      { h: 'Storm Surge Agent, a replay', p: 'Signal, reason, ArcGIS trace, ServiceNow work orders, a proposal, dispatcher approval in Webex, action, and ITSI verifies. Scenario.' },
    ],
    notes: [
      "Cisco Cloud Control, unveiled at Cisco Live in June. One login and one data layer for people and agents, with Splunk as the fabric underneath.",
      "Click. Agent Builder lets your teams describe an agent in plain language, connect it to tools and knowledge, test it in a sandbox, and publish it through a versioned lifecycle. App Builder does the same for apps.",
      "Click. And it reaches beyond Cisco. Splunk, ServiceNow, PagerDuty, Microsoft and AWS natively, and Dominion systems like SAP, Esri ArcGIS and the plant historians through MCP.",
      "Click. Here is one agent we could build together, replayed as a scenario. Storm Surge sees a spike of meters going dark, correlates it with recloser lockouts, traces the feeders, drafts work orders, and proposes crew staging. A dispatcher approves in Webex, and ITSI confirms the outage services are green.",
    ],
  },
  {
    id: 'federal',
    eyebrow: '12 · Mission assurance',
    title: 'Supporting DoD and federal customers.',
    grad: 'Proof of resilience, with the data to show it.',
    lead: 'Dominion owns the main electric system feeding JBM-HH and the Pentagon [18] and serves 300+ federal sites [20].',
    beats: [
      { h: 'Installations', p: 'Pentagon and JBM-HH [18], Fort Gregg-Adams [19], Naval Weapons Station Yorktown [21], Fort Belvoir and more [20].' },
      { h: 'What they need', p: 'Army installations must sustain critical buildings for 14 days [18]; Splunk Cloud is FedRAMP High and DoD IL5 PA [45] [46].' },
      { h: 'How we help', p: 'ITSI services per mission feeder, a FedRAMP High enclave, and a Mission Assurance Agent that drafts SITREPs for approval.' },
    ],
    notes: [
      "Dominion owns and operates the electric systems on several installations, including the one that feeds the Pentagon. Fort Gregg-Adams, Naval Weapons Station Yorktown, and more than three hundred federal sites.",
      "Click. Those customers need proof. Army installations must keep critical buildings running for fourteen days, and any shared data has to live in an authorized environment. Splunk Cloud holds FedRAMP High and a DoD IL5 provisional authorization. We confirm status per workload during design.",
      "Click. How we help Dominion serve them: a service view for every mission feeder, an authorized enclave for installation energy managers, and a Mission Assurance Agent that drafts a situation report within minutes, approved by your federal programs team.",
    ],
  },
  {
    id: 'roadmap',
    eyebrow: '13 · Roadmap',
    title: 'Where we can help next.',
    grad: 'Eight options, sequenced by value and effort.',
    lead: 'Impact and effort scored out of ten. Dates anchored to sources: NextEra close [7], CVOW completion [10], CIP-015 [28] [29].',
    beats: [
      { h: 'Value versus effort', p: 'Quick wins: ES Premier and SOAR (impact 9, effort 3), integration-ready fabric (8, 3), trusted AI governance (7, 3).' },
      { h: 'Now: Q4 2026 to Q1 2027', p: 'Activate the Triage Agent you own, an AI inventory scan, an OMS service model, and a federated data design.' },
      { h: 'Next: 2027', p: 'Cloud Control persona apps and agents, CVOW operate-phase OT security, a mission enclave, a Day-1 joint risk view.' },
      { h: 'Then: to Oct 2028', p: 'CIP-015 INSM in all control centers, medium-impact sites with ERC, and EACMS and PACS coverage.' },
    ],
    notes: [
      "Eight options, plotted by business impact against effort. The quick wins sit in the corner: getting full value from ES Premier and SOAR, an integration-ready data fabric, and trusted AI governance.",
      "Click. Now, this quarter and next: activate the Triage Agent you already own, scan for AI agents in use, model the outage management service, and design the federated data layer.",
      "Click. Next, through twenty twenty seven: Cloud Control persona apps and agents, operate-phase security for CVOW, a mission assurance enclave, and a Day-1 joint risk view for the NextEra close.",
      "Click. Then, up to October twenty twenty eight: CIP-015 monitoring in every control center, extending to medium impact sites, and the EACMS and PACS coverage FERC directed.",
    ],
  },
  {
    id: 'sources',
    eyebrow: '14 · Sources and method',
    title: 'Every claim is cited.',
    grad: 'Public sources, clearly labeled.',
    lead: 'Research current as of Oct 22, 2026. Dominion does not disclose security incidents, and nothing here implies otherwise. Dashboards are illustrative.',
    verse: true,
    beats: [
      { h: '65 public sources', p: 'Filings, earnings calls, SCC dockets, NRC and FERC, DoD, Dragos, E-ISAC, CISA, and Cisco and Splunk documentation. Bracketed numbers match this wall.' },
    ],
    notes: [
      "Everything in this briefing traces back to one of sixty five public sources, numbered on this wall and in the printed talk track. Items labeled our work together reflect what our teams know and are doing; dashboards are illustrative; and product authorizations are confirmed during design. Press L to open the original leave-behind.",
    ],
  },
  {
    id: 'close',
    eyebrow: '15 · Proposed next steps',
    title: 'One data fabric, governed agents.',
    grad: 'Starting with what you already run.',
    lead: 'Four proposed next steps for Dominion IT and the Splunk team.',
    layout: 'hero',
    beats: [
      { h: 'This quarter', p: 'A joint ES Premier and SOAR adoption review, and a CIP-015 storage design checkpoint.' },
      { h: 'Then', p: 'A Cloud Control executive session on your use cases, and two roadmap options with how you would measure them.' },
    ],
    notes: [
      "Four proposed next steps. First, a joint adoption review of ES Premier and SOAR, to confirm what is live and agree on the next three capabilities to activate. Second, a checkpoint on the CIP-015 storage design.",
      "Click. Then a Cloud Control executive session on your own use cases, and picking the two roadmap options with the best value for the effort, with how you would measure them. Thank you.",
    ],
  },
];

export { SOURCES, SOURCE_SHORT } from './sources.js';

// No workshop in this deck; kept for engine compatibility.
export const WORKSHOP_FIELDS = [];
export function buildWorkshopPrompt() { return []; }
