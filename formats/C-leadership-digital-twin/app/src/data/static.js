// Static copy blocks and twin geometry. Copy is taken from the original briefing.
export const CUSTOMER = 'Dominion Energy';
export const BRIEF_DATE = 'October 2026';

export const LEAD = [
  { t: 'More value from ES Premier and SOAR', d: 'Turn on the agentic triage, UEBA and automation you already license so analysts spend time on decisions, not queues.', go: '#story', tag: 'own' },
  { t: 'CIP-015 ready by Oct 2028', d: 'Internal network security monitoring evidence for R1 to R3, with the storage design our teams are shaping now.', go: '#account', tag: 'act', s: ['s28', 's29'] },
  { t: 'Retention without runaway cost', d: 'Keep years of compliance data affordably with tiered storage and federated search, searchable when auditors ask.', go: '#account', tag: 'act' },
  { t: 'Resilient digital services', d: 'Service views for outage, billing and large-load interconnection so IT sees customer impact before customers do.', go: '#alignment', tag: 'ext' },
  { t: 'Governed AI and agents', d: 'Every agent observed in Splunk and governed by policy, so AI scales across functions with an audit trail.', go: '#agentic', tag: 'ext', s: ['s37'] },
  { t: 'Integration-ready for NextEra', d: 'A federated data fabric that supports a combined risk view without moving sensitive data before close.', go: '#plays', tag: 'ext', s: ['s7'] },
];
export const LEAD_TAGS = { own: 'Builds on what you run', act: 'Supports our current work', ext: 'Extends the platform' };

export const NEXT_STEPS = [
  ['Joint ES Premier and SOAR adoption review', 'Confirm which licensed capabilities are live and agree on the next three to activate.'],
  ['CIP-015 storage design checkpoint', 'Review the storage re-architecture against retention, search and evidence requirements.'],
  ['Cloud Control executive session', 'See agentic operations across Cisco, Splunk and third-party systems on your use cases.'],
  ['Prioritize two roadmap options', 'Pick the plays with the best value-to-effort ratio and define how you would measure them.'],
];

export const MOTIONS = [
  ['1. Get more from what you own', 'New use cases on Splunk Core, ES Premier and SOAR: agentic triage, UEBA, CIP evidence, documented playbooks.'],
  ['2. Extend the platform', 'Splunk capabilities that plug into the platform you run: ITSI, OT Security, Edge Processor, Federated Search, DDAA, AI Toolkit.'],
  ['3. Connect across Cisco', 'Cisco Cloud Control, Cyber Vision and Cisco security, with Splunk as the data fabric underneath.'],
];

export const STACK = [
  { cls: 'l-cisco', name: 'Cisco Cloud Control', sub: 'Agentic operations layer', items: ['AI Canvas', 'Agent Builder', 'App Builder (OpenAI Codex)', 'AI Defense governance', 'Splunk AI Agent Monitoring', 'MCP + 50 planned integrations'], s: ['s36', 's37', 's38'] },
  { cls: 'l-splunk', name: 'splunk&gt; Data Fabric', sub: 'Cisco Data Fabric powered by Splunk', items: ['*Splunk Cloud Platform (Core)', '*ES Premier: SIEM + SOAR + UEBA', 'ITSI', 'Observability Cloud', 'Edge Hub / Edge Processor', 'Federated Search (S3, Snowflake, Azure)', 'AI Toolkit + Time Series Model'], s: ['s43', 's41', 's55'] },
  { cls: 'l-cisco2', name: 'Cisco infrastructure and security', sub: 'Sensors and controls in the estate', items: ['Cyber Vision', 'Industrial Ethernet', 'Secure Equipment Access', 'ISE', 'Secure Firewall', 'Duo', 'ThousandEyes', 'Talos', 'Meraki', 'Webex'] },
  { cls: 'l-cust', name: 'Dominion Energy business functions', sub: 'Plus third-party systems via MCP', items: ['Generation: nuclear, gas, hydro, solar, offshore wind', 'Transmission and distribution', 'Large load / data centers', 'Customer experience', 'Federal mission customers', 'Corporate and converged security'] },
];

export const THESIS = [
  { t: '1. Build-out at unprecedented scale', d: '$65B through 2030, 45% on T&amp;D, 53.8 GW of data center demand in contracting, CVOW finishing in 2027 and new gas at Chesterfield and Canadys.', s: ['s2', 's3', 's10', 's13'], d2: ' Every new site is new telemetry and new attack surface.' },
  { t: '2. Adversaries are pre-positioning', d: 'VOLTZITE at ICS Stage 2, SYLVANITE in a U.S. electric utility, ELECTRUM hitting DER, ransomware up 64%. Regulators answered with CIP-015 INSM, effective Oct 1, 2028.', s: ['s23', 's24', 's29'] },
  { t: '3. Security is already converged', d: 'Dominion runs cyber, physical and threat intel in one department under a CSO, with a documented Vendor Compromise Response Plan.', s: ['s14'], d2: ' You already run ES Premier and SOAR, so the console for that model is in place. The opportunity is deeper adoption.' },
  { t: '4. AI is already in production', d: 'Visual AI on drone imagery and agentic IVR pilots are live.', s: ['s33', 's35'], d2: ' Cloud Control adds governed agents across every function, observed in Splunk.' },
  { t: '5. Two catalysts', d: 'The NextEra combination (close expected 2H 2027) and federal mission customers both reward a federated, authorized data fabric.', s: ['s7', 's18', 's45'] },
];

export const PILLARS = [
  { t: 'One login, one data layer', d: 'Single view of Cisco networking, security, compute, observability and collaboration. Splunk Platform, ITSI and Observability Cloud are available in Cloud Control.', s: ['s36', 's39'] },
  { t: 'Agent Builder', d: 'Describe an agent in natural language, connect tools and knowledge, test in a sandbox, publish through a versioned lifecycle. Native integrations plus MCP for systems beyond Cisco.', s: ['s37'] },
  { t: 'App Builder', d: 'OpenAI Codex inside Cloud Control Studio: plain-language apps, custom operational views and unified integrations that run directly in the platform.', s: ['s38'] },
  { t: 'Governed and observed', d: 'Every agent runs under Cisco AI Defense policy with human approval for production changes. Splunk AI Agent Monitoring traces every LLM call, tool call and skill, with evals powered by Galileo.', s: ['s37'] },
];

export const CONSTELLATION = {
  cisco: ['Cyber Vision', 'Secure Firewall', 'ISE', 'Duo', 'XDR', 'Secure Access', 'ThousandEyes', 'Meraki', 'Webex', 'Talos', 'AI Defense'],
  splunk: ['Cloud Platform', 'ES Premier', 'SOAR', 'UEBA', 'ITSI', 'Observability Cloud', 'Edge Hub', 'Federated Search', 'AI Toolkit', 'AI Agent Monitoring'],
  splunkOwned: ['Cloud Platform', 'ES Premier', 'SOAR'], splunkIncl: ['UEBA'],
  third: ['ServiceNow', 'PagerDuty', 'Microsoft', 'AWS', 'Google Cloud + Wiz', 'Slack', 'Linear', 'Confluence', 'Infoblox / BlueCat'],
  targets: ['SAP', 'Esri ArcGIS', 'Amazon Connect', 'Salesforce', 'Snowflake', 'Primavera', 'Plant historians', 'ADMS / OMS'],
};

export const FED_HELP = [
  ['Mission feeder services.', 'ITSI services for every feeder that serves a designated installation, with redundancy headroom and 14-day readiness KPIs.'],
  ['Authorized sharing.', 'A Splunk Cloud FedRAMP High (or IL5 where required) enclave so installation energy managers and agency facilities teams see approved fields only.', ['s45', 's46']],
  ['Mission Assurance Agent.', "Cloud Control agent drafts SITREPs within minutes of any feeder event, approved by Dominion's federal programs team."],
  ['Joint readiness.', "Exercise analytics and sanitized indicator sharing that build on Dominion's classified briefings and annual federal exercise.", ['s14']],
  ['On-base generation by design.', 'Cyber Vision, ISE and Splunk OT monitoring built into Yorktown and Fort Gregg-Adams generation projects from day one.', ['s21', 's19']],
];

export const ROADMAP = [
  { h: 'Now: Q4 2026 to Q1 2027', items: ['Activate the ES Premier Triage Agent you own', 'Trusted AI inventory scan', 'Grid digital resilience: OMS service model', 'Integration-ready federated data design'] },
  { h: 'Next: 2027', items: ['Cloud Control persona apps and agents', 'CVOW operate-phase OT security', 'Mission assurance enclave', 'Day-1 joint risk view (close expected 2H 2027)'] },
  { h: 'Then: to Oct 2028', items: ['CIP-015 INSM in all control centers', 'Extend INSM to medium-impact sites with ERC', 'EACMS / PACS coverage per FERC directive'] },
];
export const BUBBLE_COLORS = ['#e5007e', '#f7931e', '#00bceb', '#2ecc9a', '#22d3ee', '#60a5fa', '#c084fc', '#049fd9'];

export const METHOD = [
  ['Public sources.', 'Dominion filings (10-K, 8-K), earnings calls, Virginia SCC dockets, NRC and FERC records, DoD and service publications, Dragos, NERC E-ISAC, CISA, and Cisco and Splunk product documentation. Research current as of Oct 22, 2026.'],
  ['Sector patterns.', 'Dominion does not disclose security incidents, and nothing here implies otherwise. Threat content reflects sector reporting; items labeled "sector pattern" are reasoned from that reporting.'],
  ['Illustrative dashboards.', 'All dashboard values are illustrative unless labeled "reported." No Dominion confidential data is used or implied.'],
  ['What you run today.', 'Items marked "in place" (Splunk Core, ES Premier, SOAR) reflect your current Splunk estate. "Included" marks capabilities that ship with ES Premier.'],
  ['How to read the labels.', '"Public sources" content is cited below. "Our work together" reflects known insights and current activities between Dominion and the Splunk team. "Our recommendation" marks where we connect the two.'],
  ['Confirmed during design.', 'Product availability, regional support and authorization status (FedRAMP, IL5) change over time; we confirm each with product teams as part of any engagement.'],
];

// Spoken narration per chapter (no citation numbers). Same facts as the chapter bodies.
export const SAY = {
  overview: 'Dominion Energy powers three point six million customers across Virginia, North Carolina and South Carolina. It also feeds the Pentagon, and it serves the largest data center market in the world. Every function you see on this map, from nuclear stations to contact centers, emits machine data. This briefing is the story of turning that data into agentic operations, starting with the Splunk platform your teams already run.',
  demand: 'Start in Data Center Alley. More than fifty-three gigawatts of data center capacity is in contracting, and nine of the ten all-time peak days happened this year. Grid reliability is now effectively a hyperscaler service level. Splunk ITSI and the Cisco Time Series Model can turn historian, EMS and smart meter data into forecasts and early warnings, so operators see the ramp before it arrives.',
  wind: 'Offshore, the Coastal Virginia Offshore Wind project delivered first power in March and is eighty-one percent complete. Each quarter of delay costs about one hundred forty-four million dollars. The turbines, offshore substations and vendor remote access add up to a brand new operational technology estate, and it has to be observed and defended from the first day of operation.',
  nuclear: 'North Anna is licensed into the twenty-fifties, and Dominion is preserving a path to a small modular reactor with Amazon. Nuclear cyber programs live on evidence: portable media controls, critical digital asset baselines, one-way data transfers and insider risk. The goal is evidence that is complete, continuous and ready for an inspector at any time.',
  threat: 'Now the threat. Dragos reports VOLTZITE, which overlaps with Volt Typhoon, at stage two of the industrial control system kill chain, and SYLVANITE inside a U.S. electric utility. Operational technology ransomware is up sixty-four percent, and the E-ISAC logged more than thirty-five hundred physical incidents. The red pulses on the map are attack paths. None of this implies an incident at Dominion. It is what your teams defend against.',
  fabric: 'Underneath everything sits the platform you already run: Splunk Core, Enterprise Security Premier and SOAR. Building on it, every SCADA historian, firewall, badge reader, turbine and IVR session lands in one Cisco Data Fabric powered by Splunk. Data that should stay where it is gets searched in place in S3, Snowflake and Azure, and Edge Processor filters it at the substation.',
  agentic: 'Above the fabric, Cisco Cloud Control gives people and agents one login, one data layer and one system of action. Agent Builder connects ServiceNow, PagerDuty, Microsoft and AWS through native connectors and MCP. App Builder turns plain language into apps. AI Defense governs every agent, and Splunk AI Agent Monitoring traces every step, with a human approving production changes.',
  mission: 'Dominion owns the main electric system that feeds Joint Base Myer-Henderson Hall and the Pentagon, serves more than three hundred federal sites, and is exploring on-base generation with the Navy at Yorktown. Splunk Cloud is FedRAMP High and holds a DoD impact level five provisional authorization, so mission customers can see the resilience data they need in an authorized environment.',
  storage: 'This is where our teams are working together today. CIP-015 asks Dominion to monitor inside the electronic security perimeter, retain anomalous activity data until each evaluation closes, and protect it from tampering. We are reshaping how Splunk Cloud stores and reaches that data: hot detections in Splunk Cloud, full-fidelity data in Dominion-owned S3 searched in place, and evidence archived for audits.',
  merger: 'Finally, the proposed NextEra combination would create the largest regulated electric utility business in the world. A federated data fabric lets both security operations centers see each other\'s risk on day one without migrating a byte, while governed agents help manage the integration workload. One territory, one fabric, and agents that work for your people.',
};

// Simplified state outlines [lon, lat] for the hex territory.
export const REGIONS = [
  { id: 'va', label: 'VIRGINIA', edge: '#e5007e', lbl: [-78.9, 37.4], poly: [[-83.68, 36.6], [-80.3, 36.56], [-75.87, 36.55], [-75.98, 36.95], [-76.32, 37.15], [-76.28, 37.75], [-76.6, 38.15], [-77.0, 38.42], [-77.05, 38.8], [-77.12, 38.95], [-77.45, 39.22], [-77.8, 39.33], [-78.35, 39.42], [-78.8, 38.88], [-79.3, 38.42], [-79.65, 38.55], [-80.0, 37.95], [-80.3, 37.52], [-80.85, 37.4], [-81.7, 37.2], [-82.3, 37.3], [-82.85, 36.98]] },
  { id: 'vae', label: null, edge: '#e5007e', poly: [[-75.24, 38.03], [-75.68, 37.95], [-76.02, 37.25], [-75.92, 37.12], [-75.6, 37.5]] },
  { id: 'nc', label: 'NORTH CAROLINA', edge: '#f7931e', lbl: [-79.3, 35.55], poly: [[-84.32, 34.99], [-83.1, 35.0], [-82.4, 35.2], [-81.04, 35.15], [-80.93, 35.1], [-80.78, 34.82], [-79.67, 34.8], [-78.55, 33.86], [-78.0, 33.92], [-77.7, 34.32], [-77.0, 34.68], [-76.4, 34.75], [-75.95, 35.15], [-75.5, 35.25], [-75.62, 35.9], [-75.87, 36.55], [-80.3, 36.56], [-81.68, 36.59], [-82.0, 36.42], [-82.6, 36.08], [-83.5, 35.56], [-84.0, 35.25]] },
  { id: 'sc', label: 'SOUTH CAROLINA', edge: '#f7931e', lbl: [-81.0, 33.7], poly: [[-83.1, 35.0], [-82.4, 35.2], [-81.04, 35.15], [-80.93, 35.1], [-80.78, 34.82], [-79.67, 34.8], [-78.55, 33.86], [-79.2, 33.2], [-79.9, 32.72], [-80.5, 32.4], [-80.9, 32.05], [-81.4, 32.6], [-81.9, 33.2], [-82.3, 33.6], [-82.7, 34.05], [-83.35, 34.7]] },
];
export const OCEAN_LABEL = { label: 'ATLANTIC OCEAN', at: [-73.6, 34.9] };
export const SITE_WHERE = { millstone: 'Waterford, CT', nextera: 'Juno Beach, FL' };
// Department colors for site beacons come from data.depts[].color.
