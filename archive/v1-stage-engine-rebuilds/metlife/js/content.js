// MetLife x Cisco Cloud Control, AgenticOps 4D. Rebuilt in the cisco-3d-stage format.
// All copy, notes, lenses, chain blocks and sources. Mission facts and figures come from the
// original example; every dollar figure is a modeled estimate and is labelled as such.
// Copy rules: two-clause headlines (title + grad outcome), no em or en dashes anywhere.

export const DECK = {
  name: 'MetLife x Cisco Cloud Control',
  sub: 'AgenticOps 4D · Modeled scenarios',
  channel: 'metlife-agenticops-4d',
  film: {
    blurb: 'An AI narrator, standing in for Stephen Ewings, tours ten MetLife missions and the account team academy. Choose a narrator.',
    album: 'MetLife AgenticOps 4D',
    role: 'AI narrator · Cisco Solutions Engineering',
    // No pre-rendered audio ships with this build: the film offers device voice and captions only.
    audio: false,
  },
};

export const PRESENTER = {
  name: 'Stephen Ewings',
  role: 'Solutions Engineer, Cisco',
};

// The academy chain: IT signal to executive outcome. Used by the focus scene.
export const BLOCKS = [
  { key: 'signal', label: 'IT signal', hint: 'the weak signal', color: '#00BCEB' },
  { key: 'domain', label: 'Domain', hint: 'where it is correlated', color: '#8E7CFF' },
  { key: 'capability', label: 'Cisco capability', hint: 'who acts, under policy', color: '#2DE2C5' },
  { key: 'kpi', label: 'Business KPI', hint: 'the number they track', color: '#FBAB18' },
  { key: 'outcome', label: 'Executive outcome', hint: 'what the board sees', color: '#6CC04A' },
];

// Business function lenses from the mission rail. Shown as chips on mission scenes.
export const LENSES = [
  { key: 'revenue', label: 'Revenue and growth', color: '#A4CE4E' },
  { key: 'customer', label: 'Customer experience', color: '#5EC8F2' },
  { key: 'operations', label: 'Operations and cost', color: '#F2C14E' },
  { key: 'risk', label: 'Risk and compliance', color: '#C792EA' },
  { key: 'security', label: 'Security', color: '#FF6B6B' },
  { key: 'it', label: 'IT and network', color: '#049FD9' },
];

// All ten missions from the original rail. value = modeled value at stake, in $M.
export const MISSIONS = [
  { id: 'enrollment', code: 'M-01', title: 'Open Enrollment Surge', city: 'New York', unit: 'Group Benefits', lenses: ['revenue', 'customer', 'it'], value: 14.0, lat: 40.7533, lon: -73.9767 },
  { id: 'change', code: 'M-02', title: 'The Change That Never Broke', city: 'Cary, NC', unit: 'Global Technology', lenses: ['operations', 'it', 'risk'], value: 9.6, lat: 35.8299, lon: -78.799 },
  { id: 'hurricane', code: 'M-03', title: 'Ahead of the Storm', city: 'Tampa, FL', unit: 'Claims and Customer Care', lenses: ['customer', 'operations', 'risk'], value: 11.0, lat: 28.1298, lon: -82.375 },
  { id: 'japan', code: 'M-04', title: 'The Agent in the Living Room', city: 'Tokyo', unit: 'MetLife Japan Retail and Annuities', lenses: ['revenue', 'customer', 'it'], value: 7.5, lat: 35.6797, lon: 139.7367 },
  { id: 'xcelerator', code: 'M-05', title: 'The Silent Conversion Leak', city: 'Mexico City', unit: 'MetLife Xcelerator Partners', lenses: ['revenue', 'customer', 'it'], value: 5.2, lat: 19.3713, lon: -99.1803 },
  { id: 'pensions', code: 'M-06', title: 'Pension Day', city: 'Santiago', unit: 'Pensions and Annuities', lenses: ['risk', 'operations', 'customer'], value: 3.8, lat: -33.4172, lon: -70.604 },
  { id: 'resilience', code: 'M-07', title: 'Inside the Impact Tolerance', city: 'Brighton', unit: 'U.K. Retirement and Group Protection', lenses: ['risk', 'customer', 'operations'], value: 8.4, lat: 50.8295, lon: -0.1395 },
  { id: 'ransomware', code: 'M-08', title: 'Break the Kill Chain', city: 'Dubai', unit: 'MetLife Gulf', lenses: ['security', 'risk', 'customer'], value: 6.1, lat: 25.253, lon: 55.333 },
  { id: 'voice', code: 'M-09', title: 'Every Voice, Clear', city: 'Noida', unit: 'Global Operations and Service', lenses: ['customer', 'operations', 'it'], value: 2.6, lat: 28.5, lon: 77.418 },
  { id: 'mim', code: 'M-10', title: 'Microseconds and Billions', city: 'Whippany, NJ', unit: 'MetLife Investment Management', lenses: ['revenue', 'risk', 'it'], value: 12.0, lat: 40.823, lon: -74.4165 },
];

// Other public MetLife locations shown as minor dots on the globe.
export const MINOR_SITES = [
  ['North Greenbush, NY', 42.687, -73.68], ['London', 51.5108, -0.0877], ['Seoul', 37.5665, 126.978], ['Shanghai', 31.2304, 121.4737],
  ['Hong Kong', 22.3193, 114.1694], ['Mumbai', 19.076, 72.8777], ['Sydney', -33.8688, 151.2093], ['Sao Paulo', -23.5505, -46.6333],
  ['Istanbul', 41.0082, 28.9784], ['Paris', 48.8566, 2.3522], ['Warsaw', 52.2297, 21.0122], ['Dublin', 53.3498, -6.2603],
];

export const DISCLAIMER = 'Illustrative scenarios from public information. No MetLife internal data is used. Dollar figures are modeled estimates for discussion only.';

export const VERSES = [];

export const SCENES = [
  {
    id: 'title',
    eyebrow: '00 · MetLife x Cisco Cloud Control',
    title: 'Weak signals come first.',
    grad: 'See it before it becomes the business problem.',
    lead: 'A mission-based walkthrough of how AgenticOps, the Splunk-powered Cisco Data Fabric and Cisco Cloud Control give MetLife a vantage point above every domain.',
    layout: 'hero',
    beats: [{ h: 'Stephen Ewings · Solutions Engineer, Cisco', p: 'Illustrative scenarios. Every dollar figure is modeled.' }],
    notes: [
      'Thank you for the time. Today is not a product tour. It is ten moments where a weak IT signal shows up hours or days before it becomes missed revenue, regulatory exposure or a broken customer promise. Everything you will see is built from public information. Every dollar figure is a modeled estimate, for discussion only.',
    ],
  },
  {
    id: 'globe',
    eyebrow: '01 · The vantage point',
    title: 'Ten missions, ten real MetLife locations.',
    grad: 'One vantage point above them all.',
    lead: 'MetLife has been a trusted source of financial security since 1868, serving customers in more than forty markets.',
    beats: [
      { h: 'A global promise', p: 'Group benefits for most of the Fortune 500, retirement income, asset management and high-growth markets.' },
      { h: 'The New Frontier', p: 'Double-digit earnings growth, 15 to 17% ROE, 100 bps lower direct expense ratio, more than $25B of free cash flow.' },
      { h: 'One fabric of data', p: 'Network, internet, cloud, applications, identity, security, business events and external signals in one federated picture.' },
      { h: 'Cisco Cloud Control', p: 'The control plane for AgenticOps: governed agents correlate, forecast and act under policy, with humans approving in AI Canvas.' },
    ],
    notes: [
      'Here is MetLife as a planet. Each pin is a mission at a real MetLife location, from New York to Tokyo. Group benefits for most of the Fortune 500, retirement income, asset management, and fast-growing markets like Mexico, Brazil and India.',
      'Click. Under its New Frontier strategy, MetLife committed to double-digit earnings growth, fifteen to seventeen percent return on equity, a hundred basis point lower direct expense ratio, and more than twenty five billion dollars of free cash flow. Every one of those runs on technology.',
      'Click. For decades, each team saw a slice: network, cloud, apps, security. The Cisco Data Fabric, powered by Splunk, brings every domain together with business events and outside signals like weather and market calendars.',
      'Click. Above it sits Cisco Cloud Control, the control plane for AgenticOps. Governed agents watch the whole picture, correlate weak signals, forecast business impact, and act under policy with a human approving in AI Canvas.',
    ],
  },
  {
    id: 'enrollment',
    eyebrow: '02 · M-01 · New York',
    title: 'Open enrollment is a revenue event.',
    grad: 'The busiest hour looks like any other.',
    lead: 'Group Benefits. Millions of employees choose benefits in a narrow window, and every slow minute shows up in an employer relationship.',
    chipsTitle: 'Business functions', prompt: [['revenue', ''], ['customer', ''], ['it', '']],
    beats: [
      { h: 'T minus 48 hours: the signal', p: 'Rehearsal logins show p95 latency up 38%. The Data Fabric ties it to identity and WAN egress at North Greenbush.' },
      { h: 'Decision point', p: 'The capacity agent forecasts an SLO breach at the opening bell. Approve its plan, or open a ticket?' },
      { h: 'Outcome · $14.0M protected (modeled)', p: 'Peak absorbed. Login p95 1.2 s, not 9.1 s. Completion 98%, not 71%.' },
    ],
    notes: [
      'Mission one, New York. Forty eight hours before enrollment opens, the capacity agent runs a rehearsal with ThousandEyes synthetic logins. Latency is creeping up. Alone it looks like noise, but the Data Fabric correlates it with identity logs and WAN egress at North Greenbush, and the forecast says the service level breaks the moment enrollment opens.',
      'Click. Here is the call. On the left, the agent plan in AI Canvas: scale the auth tier, pre-warm the CDN, shift thirty percent of traffic to the secondary region, all policy checked. On the right, a ticket for the capacity team. What would you do?',
      'Click. Approve the plan. The peak is absorbed, login stays under one point two seconds, and nobody opens a war room. Modeled, that is about fourteen million dollars of group benefits value protected. Talk to the head of group benefits, not just the network team.',
    ],
  },
  {
    id: 'change',
    eyebrow: '03 · M-02 · Cary, NC',
    title: 'Most major outages start with a change.',
    grad: 'This one never broke.',
    lead: 'Global Technology. A weekend firmware and access list change is about to meet undocumented drift on one leaf switch.',
    chipsTitle: 'Business functions', prompt: [['operations', ''], ['it', ''], ['risk', '']],
    beats: [
      { h: 'T minus 20 hours: the signal', p: 'The change agent models the change against the real network. ACL plus drift would block replication. Blast radius: 41 applications.' },
      { h: 'Decision point', p: 'Risk score 92. Accept the agent-corrected change, or proceed because the change board already signed off?' },
      { h: 'Outcome · $9.6M protected (modeled)', p: 'Verified in a digital twin, risk 92 down to 11. Zero downtime instead of 4.5 hours.' },
    ],
    notes: [
      'Mission two, the technology campus in Cary. Twenty hours before the change window, the agent pulls the change record, the Nexus Dashboard intent model and config snapshots into the Data Fabric. The new access list, plus drift on one leaf switch, would block database replication for the policy platform. Forty one applications sit in the blast radius.',
      'Click. The agent rates the change at ninety two. Option one: accept its corrected change, with the drift fixed and the access list revised. Option two: proceed, because the change board already approved it.',
      'Click. The revision is verified in a digital twin, the risk drops to eleven, and the change runs clean. No outage, no overtime. Modeled at about nine point six million dollars, and it maps straight to the direct expense ratio commitment.',
    ],
  },
  {
    id: 'hurricane',
    eyebrow: '04 · M-03 · Tampa, FL',
    title: 'Catastrophes hit insurers twice.',
    grad: 'Landfall becomes a non-event for customers.',
    lead: 'Claims and Customer Care. The surge of claims and calls lands just as local sites lose carriers and power.',
    chipsTitle: 'Business functions', prompt: [['customer', ''], ['operations', ''], ['risk', '']],
    beats: [
      { h: 'T minus 72 hours: the signal', p: 'The storm track meets the network. Two of three carrier circuits share one flood-zone central office. A six-fold call surge is forecast.' },
      { h: 'Decision point', p: 'Run the agent resilience playbook, or rely on the DR plan that was tested last year?' },
      { h: 'Outcome · $11.0M protected (modeled)', p: 'Call abandonment 6%, not 48%. Claims intake same day, not a 3.5 day backlog.' },
    ],
    notes: [
      'Mission three, Tampa. Seventy two hours before landfall, the Data Fabric lines up a public storm track with the network. Two of the three carrier circuits run through the same central office inside the flood zone. The agent also forecasts a six-fold surge in claims calls.',
      'Click. The choice: run the agent playbook, with 5G backup on SD-WAN, voice pre-shifted to Noida and remote agents, and the failover rehearsed. Or rely on the existing plan, which assumed circuit diversity that does not exist.',
      'Click. At landfall two circuits drop, and nobody calling in notices. Policyholders reach a person and claims keep moving. Modeled at about eleven million dollars. The claims promise is the brand promise.',
    ],
  },
  {
    id: 'resilience',
    eyebrow: '05 · M-07 · Brighton',
    title: 'Resilience has to be proven.',
    grad: 'Inside tolerance, evidence already done.',
    lead: 'U.K. Retirement and Group Protection. Impact tolerances and DORA put ICT third-party risk under a microscope.',
    chipsTitle: 'Business functions', prompt: [['risk', ''], ['customer', ''], ['operations', '']],
    beats: [
      { h: 'T minus 18 hours: the signal', p: 'ThousandEyes sees a third-party identity provider degrading. Its status page says minor. The service map says retiree payments stall.' },
      { h: 'Decision point', p: 'Activate the contracted secondary path now, or trust the status page?' },
      { h: 'Outcome · $8.4M protected (modeled)', p: 'Zero time outside tolerance. 3,400 retiree payments on time. Evidence pack built automatically.' },
    ],
    notes: [
      'Mission seven, Brighton. U.K. regulators expect firms to stay within impact tolerances for important business services. Eighteen hours out, ThousandEyes tests against a third-party identity verification provider show a steady decline. The status page says minor. The service map says new retiree income payments would stall.',
      'Click. Activate the contracted secondary provider now, with an evidence pack for the resilience register. Or trust the status page and wait.',
      'Click. The secondary path goes live twelve hours before the failure. The service never leaves tolerance, and a regulator-ready evidence pack already exists. Modeled at about eight point four million dollars. Compliance becomes a by-product of operating well.',
    ],
  },
  {
    id: 'ransomware',
    eyebrow: '06 · M-08 · Dubai',
    title: 'One alert is noise, three are an attack.',
    grad: 'Contained at the identity stage.',
    lead: 'MetLife Gulf. Insurers hold sensitive personal and health data, which makes them a prime ransomware target.',
    chipsTitle: 'Business functions', prompt: [['security', ''], ['risk', ''], ['customer', '']],
    beats: [
      { h: 'T minus 95 minutes: the signal', p: 'A click on a targeted lure, an impossible-travel Duo push, and file share enumeration. Splunk ES and Cisco XDR assemble one chain.' },
      { h: 'Decision point', p: 'Run the SOAR containment playbook now, or escalate to tier 2 for the morning shift?' },
      { h: 'Outcome · $6.1M protected (modeled)', p: 'Contained in 15 minutes, not 25 hours. Nothing encrypted, no breach notification.' },
    ],
    notes: [
      'Mission eight, Dubai. Ninety five minutes before detonation, the agent connects three weak signals: a click on a targeted lure, an impossible-travel Duo push from a new device, and unusual file share enumeration. Splunk Enterprise Security and Cisco XDR assemble them into one attack chain.',
      'Click. Run the Splunk SOAR playbook within policy: revoke sessions, force Duo re-enrollment, isolate endpoints, and segment with Hypershield. Or escalate to tier 2 for the morning shift.',
      'Click. The attack is contained at the identity stage. Nothing is encrypted and no data leaves. The modeled value, about six point one million dollars, follows public industry benchmarks for a financial-sector breach, before any brand impact.',
    ],
  },
  {
    id: 'mim',
    eyebrow: '07 · M-10 · Whippany, NJ',
    title: 'Microseconds become millions.',
    grad: 'The rebalance lands in its window.',
    lead: 'MetLife Investment Management. Clean market data and narrow execution windows decide investment performance.',
    chipsTitle: 'Business functions', prompt: [['revenue', ''], ['risk', ''], ['it', '']],
    beats: [
      { h: 'T minus 70 minutes: the signal', p: 'Five-minute averages look perfect. Sub-second Nexus telemetry shows buffers filling ahead of a central bank announcement.' },
      { h: 'Decision point', p: 'Approve QoS and workload separation, or carry on because utilization is only 30%?' },
      { h: 'Outcome · $12.0M protected (modeled)', p: 'Feed latency flat at the peak, not 40x spikes. Rebalance completed, slippage within tolerance.' },
    ],
    notes: [
      'Mission ten, Whippany, home of MetLife Investment Management. Seventy minutes before a central bank announcement, the markets agent sees microbursts on the market data switch. Five-minute averages look perfect, but sub-second telemetry shows buffers filling. Matched with the market calendar, packets will drop at announcement volume.',
      'Click. A new analytics workload shares an uplink with the feed handlers. Approve quality of service for the feeds and move analytics to its own uplink. Or carry on, because average utilization is only thirty percent.',
      'Click. Clean data at the peak, and the portfolio rebalance completes in its window. Modeled at about twelve million dollars. In asset management, network performance is investment performance.',
    ],
  },
  {
    id: 'rail',
    eyebrow: '08 · The mission rail',
    title: 'Ten missions, six functions.',
    grad: 'Each maps to a number the board tracks.',
    lead: 'Filter the rail by business function. Four more missions sit behind the six we just walked.',
    beats: [
      { h: 'All functions', p: 'About $80.2M of modeled value at stake across all ten missions.' },
      { h: 'Revenue and growth', p: 'New York, Tokyo, Mexico City and Whippany: enrollment, field sales, partner conversion, execution.' },
      { h: 'Risk, compliance and security', p: 'Cary, Tampa, Santiago, Brighton, Dubai and Whippany.' },
      { h: 'Four more missions', p: 'Tokyo field tablets, Mexico City partner APIs, Santiago pension day, Noida voice quality.' },
    ],
    notes: [
      'Here is the whole rail. Ten missions, each a column, its height the modeled value at stake. Together, about eighty million dollars, every figure a modeled estimate for discussion.',
      'Click. Filter for revenue and growth. New York enrollment, Tokyo field sales, Mexico City partner conversion and Whippany execution quality. These are the conversations with business line leaders.',
      'Click. Now risk, compliance and security. Change risk in Cary, storm resilience in Tampa, the pension cutoff in Santiago, impact tolerances in Brighton, ransomware in Dubai. These belong with the chief risk officer and the CISO.',
      'Click. Four missions we did not walk today. Tokyo, where an internet provider path slows e-signatures in customers’ homes. Mexico City, where partner quote latency creeps toward a checkout timeout. Santiago, a pension batch heading for the bank cutoff. And Noida, rising jitter before the U.S. evening shift.',
    ],
  },
  {
    id: 'academy',
    eyebrow: '09 · Account Team Academy',
    title: 'Trace the signal to the outcome.',
    grad: 'Talk to the business, not the network.',
    lead: 'Every mission follows the same chain. Here is Open Enrollment, link by link.',
    layout: 'focus',
    beats: [
      { h: 'Five links, every mission', p: 'IT signal, domain, Cisco capability, business KPI, executive outcome. Learn the chain once, then use it on every account call.' },
      { b: 0, h: 'IT signal', q: 'Synthetic login latency creeping up under rehearsal load', p: 'Start with the weak signal the business never sees. On its own it looks like noise.' },
      { b: 1, h: 'Domain', q: 'Identity, application and WAN, correlated in the Data Fabric', p: 'The value is in correlation. Each tool looks fine alone. Together they predict the failure.' },
      { b: 2, h: 'Cisco capability', q: 'Capacity agent with a policy-governed change in Cisco Cloud Control', p: 'Agents act under policy with a human approval in AI Canvas. That answers the control question before it is asked.' },
      { b: 3, h: 'Business KPI', q: 'Enrollment completion rate and employer satisfaction', p: 'Name the number the business owner already tracks, not a latency chart.' },
      { b: 4, h: 'Executive outcome', q: 'Group Benefits revenue and renewals protected', p: 'Open enrollment is a revenue event, not an IT event. Start the conversation with the group benefits leaders.' },
    ],
    notes: [
      'This is the account team academy. Every mission follows one chain of five links: an IT signal, the domain where it is correlated, the Cisco capability that acts, the business KPI it moves, and the outcome an executive cares about.',
      'Click. Link one, the signal. Synthetic login latency creeping up under rehearsal load. Nobody in the business will ever see it.',
      'Click. Link two, the domain. Identity, application and WAN, correlated in the Data Fabric. This is where weak signals become a forecast.',
      'Click. Link three, the capability. A capacity agent with a policy-governed change in Cisco Cloud Control, approved by a human in AI Canvas.',
      'Click. Link four, the KPI. Enrollment completion rate and employer satisfaction. The number the business owner already watches.',
      'Click. Link five, the outcome. Group Benefits revenue and renewals protected. Lead with this link in the meeting, and walk down the chain only as far as the room needs.',
    ],
  },
  {
    id: 'discovery',
    eyebrow: '10 · Discovery questions',
    title: 'Ask about the last bad day.',
    grad: 'Let the customer name the business cost.',
    lead: 'Questions from the missions, matched to who is in the room.',
    beats: [
      { h: 'Head of Group Benefits', p: 'How did the last open enrollment go? How many employer escalations were tied to portal performance?' },
      { h: 'CIO and the change board', p: 'What share of your major incidents last year started with a change?' },
      { h: 'Chief risk officer', p: 'How long does it take to produce operational resilience evidence for a regulator?' },
      { h: 'CISO', p: 'How many alerts does your SOC handle a day, and how many are investigated within an hour?' },
    ],
    notes: [
      'Discovery is where the modeled numbers become their numbers. For the head of group benefits: how did the last open enrollment go, and how many employer escalations were tied to portal performance?',
      'Click. For the CIO and the change board: what share of your major incidents last year started with a change?',
      'Click. For the chief risk officer: how long does it take to produce operational resilience evidence for a regulator?',
      'Click. And for the CISO: how many alerts does your SOC handle a day, and how many are investigated within an hour? Then stop talking and write down the answer.',
    ],
  },
  {
    id: 'quiz',
    eyebrow: '11 · Academy quiz',
    title: 'Two questions before the meeting.',
    grad: 'Answer like the CFO would.',
    lead: 'From the account team academy. Call your answer out loud, then click to reveal.',
    beats: [
      { h: 'Question one', p: 'Why does an enrollment portal slowdown matter to the CFO?' },
      { h: 'It threatens renewals and revenue', p: 'Group Benefits is a New Frontier priority. Employer experience drives renewals.' },
      { h: 'Question two', p: 'In the Santiago pension run, what did "green" mean in the scheduler?' },
      { h: 'Running, not on time', p: 'The agent judges progress against history and deadlines, not just status.' },
    ],
    notes: [
      'Quick quiz. Why does an enrollment portal slowdown matter to the CFO? Is it cloud spend, employer renewals and group benefits revenue, or slower code releases? Call it out.',
      'Click. It threatens employer renewals and group benefits revenue. Group benefits is a New Frontier priority, and employer experience drives renewals.',
      'Click. Question two, from the Santiago pension mission. Every job in the scheduler showed green. What did green mean? On time, running, or finished?',
      'Click. Running, but not necessarily on time. The batch agent judges progress against history and against the bank cutoff, not just job status. Green is not the same as on time.',
    ],
  },
  {
    id: 'sources',
    eyebrow: '12 · Sources and method',
    title: 'Built from public information.',
    grad: 'Every dollar figure is modeled.',
    lead: DISCLAIMER,
    beats: [
      { h: 'How the figures are modeled', p: 'Industry benchmarks, such as about $40K per minute of downtime for top-tier financial services and about $6M for an average financial-sector breach.' },
      { h: 'What it draws on', p: 'MetLife public information including the New Frontier strategy and public filings, public site locations, and common insurance industry challenges.' },
    ],
    notes: [
      'A word on method. These are illustrative scenarios. No MetLife internal data is used. The dollar figures are modeled estimates from industry benchmarks, for example about forty thousand dollars per minute of downtime for top-tier financial services, and about six million dollars for an average financial-sector breach.',
      'Click. The context comes from public information about MetLife, including its New Frontier strategy and public filings, public office locations, and challenges common across the insurance industry. The sources are listed on screen and in the talk track.',
    ],
  },
  {
    id: 'close',
    eyebrow: '13 · The ask',
    title: 'Pick one live mission.',
    grad: 'Bring its business owner to the table.',
    lead: 'The outcome is not a faster ticket. It is the business never seeing the problem.',
    layout: 'hero',
    beats: [
      { h: 'The takeaway', p: 'Weak signals, correlated early and acted on under policy, protect revenue, trust and regulatory standing.' },
      { h: 'Next step', p: 'Choose a mission, run discovery with its executive owner, and replace our modeled numbers with yours.' },
    ],
    notes: [
      'Here is what I hope you take away. Weak signals show up early in every domain. Correlated in the Data Fabric and acted on under policy from Cisco Cloud Control, they protect revenue, customer trust and regulatory standing.',
      'Click. So the ask is simple. Pick the one mission that matches a live MetLife priority, and let us run discovery with its business owner. We will replace our modeled numbers with yours. Thank you.',
    ],
  },
];

export const SOURCES = [
  ['MetLife investor relations, New Frontier strategy and public filings', 'https://investor.metlife.com/'],
  ['MetLife corporate site and public office locations', 'https://www.metlife.com/'],
  ['U.K. FCA PS21/3, building operational resilience (impact tolerances)', 'https://www.fca.org.uk/publications/policy-statements/ps21-3-building-operational-resilience'],
  ['EU Digital Operational Resilience Act (DORA), Regulation (EU) 2022/2554', 'https://eur-lex.europa.eu/eli/reg/2022/2554/oj'],
  ['IBM Cost of a Data Breach report (financial-sector benchmark)', 'https://www.ibm.com/reports/data-breach'],
];

// The workshop builder is not used in this deck; kept minimal so the engine stays intact.
export const WORKSHOP_FIELDS = [
  { key: 'signal', label: 'IT signal', ph: 'e.g. login latency creeping up under load', block: 'signal' },
  { key: 'outcome', label: 'Executive outcome', ph: 'e.g. renewals protected', block: 'outcome' },
];

export function buildWorkshopPrompt(v) {
  const s = (x, d) => (x && x.trim() ? x.trim() : d);
  return [
    ['signal', `Signal: ${s(v.signal, '[IT SIGNAL]')}.`],
    ['outcome', `Outcome: ${s(v.outcome, '[EXECUTIVE OUTCOME]')}.`],
  ];
}
