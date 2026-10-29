// Narration for the narrated edition and off-camera talking points for the live edition.
// One entry per click, aligned with SCENES[i].notes in content.js (same counts).
// The narrator is an AI voice, says so, and tells Stephen's briefing in the third person.

export const NARRATION = {
  title: [
    "Welcome. I am an AI narrator, standing in for Stephen Ewings, a Solutions Engineer at Cisco. This is the IT leadership briefing he prepared for Dominion Energy with the Splunk team. Its idea in one line: Dominion, operated by agents, grounded in one data fabric. Every figure you see carries a numbered source.",
  ],
  twin: [
    "This is a digital twin of the territory: Virginia, North Carolina and South Carolina, three point six million electric customers, and the feed to the Pentagon. Every site emits machine data. The positions are schematic.",
    "Underneath every site sits the Splunk platform Dominion already runs: Core, Enterprise Security Premier and SOAR, extended with ITSI, Edge Processor and Federated Search. One data fabric under every function.",
    "Above it, Cisco Cloud Control orchestrates governed agents, from Storm Surge and CIP Evidence to the offshore wind weather window and Mission Assurance.",
    "Now the threat. These red paths reflect what the sector reports: adversaries pre-positioning inside utilities, and OT ransomware up sixty four percent. Nothing here implies an incident at Dominion.",
    "With every layer on, the fabric sees the anomaly, an agent proposes a response, a person approves it, and every step is traced in Splunk.",
  ],
  story: [
    "The original briefing told its story in ten chapters. The prologue: one territory, every critical function, all of it emitting machine data.",
    "Act one, the demand shock. More than fifty three gigawatts of data center capacity in contracting, and nine of the ten all-time peak days this year.",
    "Act two, offshore wind. The CVOW project delivered first power in March and is eighty one percent complete. Each quarter of delay costs about one hundred forty four million dollars.",
    "Act three, nuclear. North Anna is licensed into the twenty fifties, with an SMR option alongside Amazon. That means decades of airtight cyber evidence.",
    "Act four, the threat. Dragos reports VOLTZITE at stage two of the ICS kill chain, SYLVANITE inside a U.S. utility, and OT ransomware up sixty four percent.",
    "Act five, the fabric. Dominion already runs Splunk Core, ES Premier and SOAR, and data that should stay where it is gets searched in place.",
    "Act six, agentic operations. Cloud Control gives people and agents one login, one data layer and one system of action, with humans in charge.",
    "Act seven, mission assurance. Dominion owns the system that feeds the Pentagon and serves more than three hundred federal sites.",
    "Act eight, CIP-015. The teams are reshaping how Splunk Cloud stores and reaches monitoring data: hot detections, full fidelity in Dominion-owned storage, and evidence archived for audits.",
    "And the epilogue, the proposed NextEra combination. Federated search lets both security teams see shared risk on day one, without migrating data.",
  ],
  kpis: [
    "Six numbers frame the brief. A sixty five billion dollar capital plan through twenty thirty, and fifty three point eight gigawatts of data center capacity in contracting.",
    "Three point six million electric customers, and an offshore wind farm that is eighty one percent built: one hundred seventy six turbines, two point six gigawatts.",
    "And two dates. The NextEra combination is expected to close in the second half of twenty twenty seven, and CIP-015 takes effect on October first, twenty twenty eight.",
  ],
  leadership: [
    "What does this mean for Dominion IT? Six outcomes. At the center, more value from the ES Premier and SOAR licenses Dominion already owns.",
    "The next ring supports the work already under way: CIP-015 readiness by October twenty twenty eight, and retention that grows without runaway cost.",
    "The outer ring extends the platform: resilient digital services, governed AI and agents, and a data fabric that is ready for NextEra.",
  ],
  account: [
    "This is the work already in motion between Dominion and the Splunk team. It starts inside the electronic security perimeter, where sensors and Edge Processor collect, filter and mask data.",
    "Requirement one: detect and evaluate anomalous activity. Detections stay hot in Splunk Cloud, where ES Premier, UEBA and SOAR can work them.",
    "Requirement two: retain anomalous activity data until each evaluation closes. Full fidelity data lands in an S3 bucket Dominion owns, searched in place by Federated Search.",
    "Requirement three: protect that data. The Splunk managed archive keeps evidence up to ten years. The team recommends replicating to a separate Object Lock bucket, because Ingest Processor cannot write to a locked one.",
    "Then act. A CIP Evidence Agent assembles the evidence for each anomaly, and a person approves it before anything is filed.",
  ],
  thesis: [
    "The thesis has four layers: business functions, Cisco infrastructure, the Splunk data fabric, and Cloud Control on top. Thirteen use cases run entirely on what Dominion already owns.",
    "Why now? A build-out at unprecedented scale, adversaries pre-positioning, a security organization that is already converged, and AI that is already in production.",
    "And two catalysts, the NextEra combination and federal mission customers. Both reward a federated, authorized data fabric.",
  ],
  alignment: [
    "Each row is an initiative from Dominion's own filings, and each column a Splunk or Cisco product. First, growth: data center demand, the capital plan and offshore wind.",
    "Then the grid and generation: the Grid Transformation Plan, nuclear life extension, and new generation at Chesterfield and Canadys.",
    "Clean energy mandates, converged security, and NextEra readiness. The green cells are products already in place.",
    "Finally AI in operations, mission customers and regulation. Nine of the twelve initiatives extend what Dominion runs today.",
  ],
  threats: [
    "Twelve threats from sector reporting: two critical, six high and four medium. Nothing here implies an incident at Dominion. Each step turns a group of shields to its counter.",
    "The critical pair: VOLTZITE manipulating engineering workstations, and SYLVANITE, an access broker inside a U.S. utility. The counter: workstation baselines, OT network monitoring, hunts, and the Triage Agent.",
    "OT under pressure: control loops being mapped, an attack on distributed energy resources, and ransomware up sixty four percent. The counter: exposure analytics, segmentation, and containment in ES Premier and SOAR.",
    "Exposure and the physical grid: a twenty four day exploit window, thousands of physical incidents, and the GridEx heat dome. The counter: vulnerability matching and converged physical and cyber correlation.",
    "The AI-era risks: agent privilege creep, and drift or safety bypass in OT. The counter: AI Defense policy, approval gates, and agent tracing in Splunk.",
    "Vendors and the merger window. The counter: the Vendor Compromise Response Plan as a SOAR playbook, governed vendor access, and phishing-resistant MFA. Every shield now has a counter.",
  ],
  departments: [
    "Think of the company as a city of twelve departments, from the security operations center to AI governance.",
    "In the SOC there are three personas: the director proving value to the board, the analyst closing the queue, and the hunter looking for activity before it reaches OT.",
    "Nine use cases for those three people. Four are new use cases on what Dominion already runs; five extend it.",
  ],
  dashboards: [
    "This is what one persona would see: the SOC Command Center. Every value on this screen is illustrative, not Dominion data.",
    "The Triage Agent's dispositions, and findings by domain, from identity and endpoint down to OT and physical security.",
    "And the top risk entities, like a config export from an engineering workstation, or an edge device matching a Talos indicator.",
  ],
  cloud: [
    "Cisco Cloud Control, unveiled at Cisco Live in June. One login and one data layer for people and agents, with Splunk underneath.",
    "Agent Builder turns a plain language description into a tested, versioned agent. App Builder does the same for apps.",
    "It reaches beyond Cisco: Splunk, ServiceNow, PagerDuty, Microsoft and AWS natively, and Dominion systems such as SAP and Esri ArcGIS through MCP.",
    "Here is one agent replayed as a scenario. Storm Surge spots meters going dark, traces the feeders, drafts work orders and proposes crews. A dispatcher approves, and ITSI confirms the services are green.",
  ],
  federal: [
    "Dominion owns the electric system that feeds the Pentagon, and serves Fort Gregg-Adams, Naval Weapons Station Yorktown and more than three hundred federal sites.",
    "Those customers need proof: Army installations must sustain critical buildings for fourteen days, and shared data needs an authorized environment such as FedRAMP High.",
    "The help: a service view for every mission feeder, an authorized enclave, and a Mission Assurance Agent that drafts situation reports for approval.",
  ],
  roadmap: [
    "Eight options, plotted by impact against effort. The quick wins: full value from ES Premier and SOAR, an integration-ready fabric, and trusted AI governance.",
    "Now: activate the Triage Agent Dominion already owns, scan for AI agents in use, model the outage service, and design the federated data layer.",
    "Next, through twenty twenty seven: Cloud Control apps and agents, offshore wind security, a mission enclave, and a day one joint risk view.",
    "Then, up to October twenty twenty eight: CIP-015 monitoring in every control center and beyond.",
  ],
  sources: [
    "Every claim traces back to one of sixty five public sources, numbered on this wall. Dashboards are illustrative, and product authorizations are confirmed during design.",
  ],
  close: [
    "Four proposed next steps. A joint ES Premier and SOAR adoption review, and a checkpoint on the CIP-015 storage design.",
    "Then a Cloud Control executive session, and two roadmap options with clear measures of success. This has been an AI narrated edition of Stephen Ewings' briefing. Thank you for watching.",
  ],
};

export const POINTS = {
  title: [['Dominion, operated by agents', 'Grounded in one fabric you already run', 'Every number cited']],
  twin: [['3 states, 3.6M customers [54]', 'Pentagon feed, Data Center Alley'], ['Splunk under every site', 'Core, ES Premier, SOAR in place'], ['8 governed agents above', 'Cloud Control [36]'], ['Sector threats, not Dominion incidents', 'Ransomware up 64% [23]'], ['See, propose, approve, trace']],
  story: [['Ten chapters', 'One territory'], ['Act I: 53 GW, 9 of 10 peaks'], ['Act II: CVOW 81%, $144M a quarter'], ['Act III: North Anna to 2058/2060', 'SMR with Amazon'], ['Act IV: inhabited silently', 'VOLTZITE, SYLVANITE'], ['Act V: Splunk underneath', 'Federate in place'], ['Act VI: humans in charge'], ['Act VII: Pentagon, 300+ sites'], ['Act VIII: CIP-015 storage'], ['Epilogue: NextEra, Day 1 view']],
  kpis: [['$65B plan [1] [2]', '53.8 GW contracting [3] [4]'], ['3.6M customers [54]', 'CVOW 81% [10]'], ['NextEra close 2H 2027 [7]', 'CIP-015 10/1/2028 [29]']],
  leadership: [['Center: ES Premier + SOAR value', 'Decisions, not queues'], ['CIP-015 by Oct 2028', 'Retention without runaway cost'], ['Resilient services', 'Governed AI, NextEra-ready']],
  account: [['Our work together', 'Collect inside the ESP'], ['R1: hot in Splunk Cloud'], ['R2: Dominion-owned S3', 'Federated Search in place'], ['R3: DDAA up to 10 years', 'Object Lock replica (recommendation)'], ['CIP Evidence Agent', 'Human approval gate']],
  thesis: [['Four layers', '13 run on what you own'], ['Build-out, pre-positioning', 'Converged, AI in production'], ['NextEra + federal', 'Federated, authorized fabric']],
  alignment: [['Rows = initiatives, columns = products', 'Growth first'], ['Grid, nuclear, new gas'], ['Clean energy, security, NextEra', 'Green = in place'], ['AI, mission, regulation', '9 of 12 extend what you run']],
  threats: [['12 sector threats', 'No Dominion incident implied'], ['VOLTZITE, SYLVANITE', 'Triage Agent you own'], ['KAMACITE, ELECTRUM, ransomware'], ['24-day window, physical, GridEx'], ['AI privilege creep, OT drift', 'AI Defense + tracing'], ['Vendors, merger lures', 'SOAR playbook, Duo MFA']],
  departments: [['12 departments'], ['SOC: Director, Analyst, Hunter'], ['9 use cases', '4 on what you run']],
  dashboards: [['SOC Command Center', 'Illustrative data'], ['Triage Agent dispositions', 'Findings by domain'], ['Top risk entities', '15 views in the original']],
  cloud: [['Cisco Live, June 2, 2026', 'One login, one data layer'], ['Agent Builder, App Builder'], ['Native + MCP', 'SAP, ArcGIS, historians'], ['Storm Surge replay', 'Dispatcher approves']],
  federal: [['Pentagon feed [18]', '300+ federal sites [20]'], ['14-day resilience', 'FedRAMP High, IL5 PA [45] [46]'], ['Mission feeder services', 'SITREP agent']],
  roadmap: [['Impact vs effort', '3 quick wins'], ['Now: Triage Agent, AI scan'], ['Next: apps, CVOW, enclave'], ['Then: CIP-015 everywhere']],
  sources: [['65 public sources', 'Press L: original leave-behind']],
  close: [['Adoption review', 'CIP-015 storage checkpoint'], ['Cloud Control session', 'Two roadmap options', 'Thank you']],
};

// Premium voices are pre-rendered with tools/gen_audio.py (edge-tts neural voices).
// This build ships without them (DECK.film.audio is false); render them to enable the cards.
export const VOICES = [
  { key: 'ava', voice: 'en-US-AvaMultilingualNeural', name: 'Ava', look: { skin: '#c98d6b', hair: '#2a1a12', style: 'long', shirt: '#00bceb', blazer: '#0d274d' } },
  { key: 'andrew', voice: 'en-US-AndrewMultilingualNeural', name: 'Andrew', look: { skin: '#8d5a3c', hair: '#120c08', style: 'short', beard: true, shirt: '#6cc04a', blazer: '#07182d' } },
  { key: 'emma', voice: 'en-US-EmmaMultilingualNeural', name: 'Emma', look: { skin: '#f1c7a5', hair: '#8a5a2b', style: 'bob', shirt: '#fbab18', blazer: '#0d274d' } },
  { key: 'brian', voice: 'en-US-BrianMultilingualNeural', name: 'Brian', look: { skin: '#e0ad8a', hair: '#3b2a1f', style: 'side', shirt: '#9be7ff', blazer: '#1a2433' } },
];
