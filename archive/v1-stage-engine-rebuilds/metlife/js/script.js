// Narration for the narrated edition and off-camera talking points for the live edition.
// One entry per click, aligned with SCENES[i].notes in content.js (same counts).
// The narrator is an AI voice, says so, and tells Stephen's story in the third person.

export const NARRATION = {
  title: ['Welcome. I am an AI narrator, standing in for Stephen Ewings, a Solutions Engineer at Cisco. This is a tour of ten moments where a weak IT signal appears hours or days before it becomes a business problem for MetLife. The scenarios are illustrative and built from public information, and every dollar figure is a modeled estimate.'],
  globe: [
    'Here is MetLife as a planet. Each pin is a mission at a real MetLife location, from New York to Tokyo. MetLife has been a trusted source of financial security since eighteen sixty eight, and serves customers in more than forty markets.',
    'Under its New Frontier strategy, MetLife committed to double-digit earnings growth, fifteen to seventeen percent return on equity, a one hundred basis point lower direct expense ratio, and more than twenty five billion dollars of free cash flow. Every one of those commitments runs on technology.',
    'For decades, each operations team saw only its slice. The Cisco Data Fabric, powered by Splunk, brings network, internet, cloud, applications, identity and security together with business events and outside signals like weather and market calendars.',
    'Above it all sits Cisco Cloud Control, the control plane for AgenticOps. Governed agents correlate weak signals, forecast business impact, and act under policy, with humans approving in AI Canvas.',
  ],
  enrollment: [
    'Mission one, New York. Forty eight hours before open enrollment, a rehearsal with ThousandEyes synthetic logins shows latency creeping up. The Data Fabric ties it to identity logs and WAN egress at the North Greenbush data center, and the forecast says the service level breaks at the opening bell.',
    'This is the decision point. Approve the agent plan in AI Canvas, which scales the authentication tier, pre-warms the content delivery network and shifts traffic to a second region. Or open a ticket for the capacity team and wait for next week.',
    'With the plan approved, the peak is absorbed and logins stay under one point two seconds. In the model, about fourteen million dollars of group benefits value is protected.',
  ],
  change: [
    'Mission two, the global technology campus in Cary, North Carolina. Twenty hours before a weekend change, the agent finds that a new access list, combined with drift on one leaf switch, would block replication for the policy platform. Forty one applications sit in the blast radius.',
    'The risk score is ninety two. Accept the corrected change the agent proposes, or proceed, because the change board already approved it.',
    'The corrected change is verified in a digital twin, the risk drops to eleven, and the change runs clean. The modeled value is about nine point six million dollars of outage avoided.',
  ],
  hurricane: [
    'Mission three, Tampa. Seventy two hours before landfall, the Data Fabric lines up the storm track with the network. Two of the three carrier circuits share one central office inside the flood zone, and claims calls are forecast to surge six-fold.',
    'Run the agent resilience playbook, with 5G backup, voice shifted ahead of time and a rehearsed failover. Or rely on last year’s disaster recovery plan, which assumed diversity that does not exist.',
    'At landfall two circuits drop, and nobody calling in notices. Policyholders reach a person and claims keep moving. The model puts the value at about eleven million dollars.',
  ],
  resilience: [
    'Mission seven, Brighton. U.K. firms must stay within impact tolerances for important business services. Eighteen hours out, ThousandEyes sees a third-party identity provider degrading, while its status page still says minor.',
    'Activate the contracted secondary provider now, or trust the status page and wait.',
    'The secondary path goes live twelve hours before the failure. The service never leaves tolerance, and the evidence pack for the regulator is created automatically. Modeled at about eight point four million dollars.',
  ],
  ransomware: [
    'Mission eight, Dubai. Ninety five minutes before detonation, three weak signals line up: a click on a targeted lure, an impossible-travel Duo push, and unusual file share enumeration. Splunk Enterprise Security and Cisco XDR assemble them into one attack chain.',
    'Run the Splunk SOAR containment playbook now, or escalate to tier two for review in the morning.',
    'The playbook revokes sessions, forces re-enrollment, isolates endpoints and segments with Hypershield. The attack is contained at the identity stage. The modeled value, about six point one million dollars, follows public breach cost benchmarks.',
  ],
  mim: [
    'Mission ten, Whippany, New Jersey, home of MetLife Investment Management. Seventy minutes before a central bank announcement, averages look perfect, but sub-second telemetry shows microbursts filling switch buffers.',
    'Approve quality of service for the market data feeds and move a noisy analytics workload to its own uplink. Or carry on, because average utilization is only thirty percent.',
    'The data stays clean at the peak and the portfolio rebalance completes in its window. The model puts the value at about twelve million dollars.',
  ],
  rail: [
    'Here is the full mission rail. Ten columns, each one a mission, its height the modeled value at stake. Together, about eighty million dollars, all of it modeled.',
    'Filtered for revenue and growth: New York, Tokyo, Mexico City and Whippany.',
    'Filtered for risk, compliance and security: Cary, Tampa, Santiago, Brighton, Dubai and Whippany.',
    'And four missions this tour did not walk: field tablets in Tokyo, partner quote latency in Mexico City, the pension cutoff in Santiago, and voice quality in Noida.',
  ],
  academy: [
    'This is the account team academy. Every mission follows a chain of five links, from an IT signal up to an executive outcome.',
    'Link one, the IT signal. Synthetic login latency creeping up under rehearsal load.',
    'Link two, the domain. Identity, application and WAN, correlated in the Data Fabric.',
    'Link three, the Cisco capability. A capacity agent with a policy-governed change in Cisco Cloud Control.',
    'Link four, the business KPI. Enrollment completion rate and employer satisfaction.',
    'Link five, the executive outcome. Group Benefits revenue and renewals protected. Stephen suggests leading with this link in the meeting.',
  ],
  discovery: [
    'Discovery questions, matched to the room. For the head of group benefits: how did the last open enrollment go?',
    'For the CIO and the change board: what share of major incidents last year started with a change?',
    'For the chief risk officer: how long does it take to produce resilience evidence for a regulator?',
    'For the CISO: how many alerts does the SOC handle a day, and how many are investigated within an hour?',
  ],
  quiz: [
    'A quick quiz. Why does an enrollment portal slowdown matter to the CFO? The film will pause here. Press play when you have your answer.',
    'Because it threatens employer renewals and group benefits revenue. Employer experience drives renewals.',
    'Question two. In the Santiago pension run, every job showed green. What did green mean? The film pauses again. Press play when you are ready.',
    'Running, but not necessarily on time. The agent judges progress against history and the deadline, not just status.',
  ],
  sources: [
    'A note on method. These scenarios are illustrative, and no MetLife internal data is used. Dollar figures are modeled from industry benchmarks, for discussion only.',
    'The context comes from public information, including the New Frontier strategy, public filings and public office locations. The sources are listed on screen.',
  ],
  close: [
    'The takeaway: weak signals, correlated early and acted on under policy, protect revenue, trust and regulatory standing.',
    'Stephen’s ask is simple. Pick one mission that matches a live MetLife priority, and run discovery with its business owner. Thank you for watching. This narration was generated by AI.',
  ],
};

export const POINTS = {
  title: [['Ten moments, weak signals first', 'Public info; every dollar modeled']],
  globe: [['Pins = missions at real sites', 'Since 1868, 40+ markets'], ['New Frontier: EPS, ROE, 100 bps', '$25B+ free cash flow'], ['Data Fabric joins every domain', 'Plus weather, market calendars'], ['Cloud Control: governed agents', 'Human approves in AI Canvas']],
  enrollment: [['T-48h: login p95 up 38%', 'Identity + WAN egress correlated'], ['Approve plan vs open ticket', 'Ask the room'], ['$14.0M protected, modeled', 'Talk to head of group benefits']],
  change: [['T-20h: ACL + drift collision', 'Blast radius: 41 apps'], ['Risk 92: accept fix vs proceed'], ['Digital twin, risk 92 to 11', '$9.6M modeled; expense ratio']],
  hurricane: [['T-72h: storm track + circuits', 'Two circuits, one flood-zone CO'], ['Playbook vs last year’s DR plan'], ['Abandonment 6% not 48%', '$11.0M modeled; claims promise']],
  resilience: [['T-18h: provider degrading', 'Status page says minor'], ['Secondary path now vs wait'], ['Zero time outside tolerance', '$8.4M modeled; evidence automatic']],
  ransomware: [['T-95 min: three weak signals', 'ES + XDR build one chain'], ['SOAR now vs tier 2 tomorrow'], ['Contained at identity, 15 min', '$6.1M modeled, breach benchmark']],
  mim: [['T-70 min: microbursts', 'Averages lie'], ['QoS + separation vs carry on'], ['Rebalance in window', '$12.0M modeled']],
  rail: [['Ten columns, about $80.2M modeled'], ['Revenue: NY, Tokyo, CDMX, Whippany'], ['Risk + security: CRO and CISO'], ['Four more: Tokyo, CDMX, Santiago, Noida']],
  academy: [['Five links, every mission'], ['Signal: rehearsal login latency'], ['Domain: correlated in Data Fabric'], ['Capability: governed capacity agent'], ['KPI: completion rate, satisfaction'], ['Outcome: revenue and renewals', 'Lead with this link']],
  discovery: [['Group benefits: last enrollment?'], ['CIO: incidents from changes?'], ['CRO: time to resilience evidence?'], ['CISO: alerts per day, per hour?', 'Then stop and listen']],
  quiz: [['Q1: why the CFO cares', 'Let the room answer'], ['Renewals and group revenue'], ['Q2: what did green mean?'], ['Running, not on time']],
  sources: [['Illustrative, no internal data', '$40K/min, ~$6M breach benchmarks'], ['Public info, New Frontier, filings']],
  close: [['Signals early, action under policy'], ['Pick one mission', 'Discovery with its owner', 'Thank you']],
};

// Premium voices would be pre-rendered with tools/gen_audio.py. This build ships without
// audio, so the film offers device voice and captions only. `look` drives the avatar.
export const VOICES = [
  { key: 'ava', voice: 'en-US-AvaMultilingualNeural', name: 'Ava', look: { skin: '#c98d6b', hair: '#2a1a12', style: 'long', shirt: '#00bceb', blazer: '#0d274d' } },
  { key: 'andrew', voice: 'en-US-AndrewMultilingualNeural', name: 'Andrew', look: { skin: '#8d5a3c', hair: '#120c08', style: 'short', beard: true, shirt: '#6cc04a', blazer: '#07182d' } },
  { key: 'emma', voice: 'en-US-EmmaMultilingualNeural', name: 'Emma', look: { skin: '#f1c7a5', hair: '#8a5a2b', style: 'bob', shirt: '#fbab18', blazer: '#0d274d' } },
  { key: 'brian', voice: 'en-US-BrianMultilingualNeural', name: 'Brian', look: { skin: '#e0ad8a', hair: '#3b2a1f', style: 'side', shirt: '#9be7ff', blazer: '#1a2433' } },
];
