/* AI use-case catalog. Every use case is tied to the technologies it runs on, the scenarios (stories) where it appears,
   the verticals (lenses) and leader roles whose outcomes it moves, and the dashboards those leaders watch.
   All use cases, outcomes and numbers are ILLUSTRATIVE (generated for this demo); product capabilities follow
   docs/OWNERSHIP_BRIEF.md and the Sources page. `run` says where inference happens:
     edge   = Cisco Unified Edge in a campus closet or unit (data stays on the floor: video, vitals, sensors)
     onprem = Cisco Secure AI Factory AI PODs in the Zuckerman data center (PHI never leaves MSK)
     device = on the device itself (e.g. Meraki MV camera)
     cloud  = a vendor cloud service (Splunk Cloud, Webex, Cisco Spaces) */
(function () {
  const MSK = (window.MSK = window.MSK || {});
  // roles used to align use cases with leaders (MSK.leaders[].roles)
  MSK.leaderRoles = {
    ceo: 'Enterprise leadership', coo: 'Hospital & enterprise operations', cno: 'Nursing & patient care', cmo: 'Physician & medical leadership',
    cio: 'Information technology', ciso: 'Information security', cdo: 'Digital, data & AI', cmio: 'Clinical informatics',
    facilities: 'Facilities, real estate & clinical engineering', safety: 'Public safety & security', experience: 'Patient & family experience', research: 'Research & pathology',
  };
  MSK.dashboardKeys = {
    lead: { name: 'Leadership Command', icon: '◆' }, ai: { name: 'AI Usage, Safety & Tokenomics', icon: '✦' }, splunk: { name: 'Splunk Hospital Operations', icon: '❯' },
    systems: { name: 'Priority Systems & Recovery', icon: '▤' }, canvas: { name: 'AI Canvas · Cloud Control infrastructure', icon: '◎' },
    'lens:leadership': { name: 'Leadership lens', icon: '◆' }, 'lens:hospital': { name: 'Hospital Ops lens', icon: '▦' }, 'lens:clinical': { name: 'Clinical Ops lens', icon: '✚' },
    'lens:network': { name: 'Network & Security lens', icon: '⌁' }, 'lens:facilities': { name: 'Facilities lens', icon: '⌂' }, 'lens:security': { name: 'Public Safety lens', icon: '⛨' }, 'lens:patient': { name: 'Patient & Family lens', icon: '♥' },
  };
  MSK.useCases = [
    // ---------------------------------------------------------------- clinical outcomes (local inference first)
    { id: 'deterioration', evidence: { text: 'Published evidence: the TREWS sepsis early-warning system was associated with an 18.7% relative drop in mortality (Nature Medicine, 2022; observational).', url: 'https://www.scientificamerican.com/article/algorithm-that-detects-sepsis-cut-deaths-by-nearly-20-percent/' }, cat: 'clinical', name: 'Early warning for deterioration and neutropenic sepsis', run: 'onprem', site: null,
      outcome: 'Rapid-response team called hours earlier; fewer unplanned ICU transfers.', how: 'A model scores vitals, labs and nursing notes from Epic every 15 minutes on the AI POD; alerts route to the charge nurse over Webex.',
      tech: ['ai-factory', 'nexus', 'webex-calling', 'splunk', 'ai-defense'], scenarios: ['code-blue', 'ucc-surge'], lenses: ['clinical', 'leadership'], roles: ['cno', 'cmo', 'cmio'], dashboards: ['lens:clinical', 'ai'], metrics: ['Alerts acted on', 'Lead time vs. rapid response', 'False-alert rate'] },
    { id: 'fall-elopement', cat: 'clinical', name: 'Fall and elopement prevention from in-room sensing', run: 'edge', site: 'MH/14/NS',
      outcome: 'At-risk patients found in minutes; bed-exit alarms armed on the right nights.', how: 'Spaces wristband movement and privacy-preserving camera analytics are scored on Cisco Unified Edge on the unit; video never leaves the floor.',
      tech: ['unified-edge', 'spaces', 'meraki-mv', 'wifi7', 'splunk'], scenarios: ['dementia-wander'], lenses: ['clinical', 'security', 'patient'], roles: ['cno', 'safety', 'experience'], dashboards: ['lens:clinical', 'lens:security'], metrics: ['Time to locate', 'Falls per 1,000 patient-days', 'Bed-exit alarms armed'] },
    { id: 'ambient', evidence: { text: "Fact: MSK is rolling out Abridge ambient documentation across the enterprise (announced March 2025). The on-unit transcription on Unified Edge shown here is an illustrative architecture, not MSK's deployment.", url: 'https://abridge.com/press-release/msk-abridge' }, cat: 'clinical', name: 'Ambient clinical documentation', run: 'edge', site: 'MH/12/1214',
      outcome: 'Less charting after hours; more face-to-face time at the bedside.', how: 'Speech is transcribed on Cisco Unified Edge on the unit and drafted into a note by MSK’s private LLM on the AI POD; the clinician signs in Epic.',
      tech: ['unified-edge', 'ai-factory', 'wifi7', 'ai-defense', 'galileo', 'splunk-obs'], scenarios: ['koch-infusion-day', 'surgical-journey'], lenses: ['clinical'], roles: ['cno', 'cmo', 'cmio'], dashboards: ['ai', 'lens:clinical'], metrics: ['Minutes saved per note', 'Edit distance', 'Groundedness'] },
    { id: 'radiology', cat: 'clinical', name: 'AI-assisted radiology triage', run: 'onprem', site: 'MH/4/READ',
      outcome: 'Critical findings read first; shorter time to treatment decisions.', how: 'Imaging models run next to PACS on the AI POD and re-order the reading worklist; radiologists confirm every finding.',
      tech: ['ai-factory', 'nexus', 'ise', 'splunk-obs'], scenarios: [], lenses: ['clinical', 'leadership'], roles: ['cmo', 'cdo'], dashboards: ['ai'], metrics: ['Time-to-read for critical findings', 'Studies triaged', 'Concordance'] },
    { id: 'pathology', evidence: { text: 'Fact: Paige, spun out of MSK, received FDA De Novo authorization for Paige Prostate in September 2021; Tempus acquired Paige in August 2025.', url: 'https://www.mskcc.org/news-releases/msk-and-paige-ai' }, cat: 'clinical', name: 'Computational pathology', run: 'onprem', site: 'ZRC/12/LABA',
      outcome: 'Faster, more consistent slide review for tumor boards.', how: 'Whole-slide images (gigabytes each) are analyzed on the AI POD over a lossless Nexus fabric, so slides never leave MSK.',
      tech: ['ai-factory', 'nexus', 'splunk-obs'], scenarios: [], lenses: ['clinical', 'leadership'], roles: ['research', 'cmo', 'cdo'], dashboards: ['ai'], metrics: ['Slides analyzed', 'Turnaround', 'Pathologist agreement'] },
    { id: 'contouring', cat: 'clinical', name: 'Radiation therapy auto-contouring', run: 'onprem', site: 'ZRC/-1/AIPOD',
      outcome: 'Treatment plans ready sooner, with physicians editing rather than drawing.', how: 'Contour suggestions are generated on the AI POD from CT and MRI; the physicist and physician review and approve every structure.',
      tech: ['ai-factory', 'nexus', 'galileo'], scenarios: [], lenses: ['clinical'], roles: ['cmo', 'research'], dashboards: ['ai'], metrics: ['Contouring minutes saved', 'Physician edit rate'] },
    { id: 'or-video', cat: 'clinical', name: 'OR readiness and turnover from room video', run: 'edge', site: 'MH/3/OR7',
      outcome: 'First cases start on time; faster, safer room turnover.', how: 'Room-camera video is analyzed on Cisco Unified Edge in the perioperative closet (no video leaves the OR suite); events flow to Splunk ITSI with the Meraki MT room environment.',
      tech: ['unified-edge', 'meraki-mv', 'meraki-mt', 'splunk-itsi', 'splunk'], scenarios: ['or-humidity', 'surgical-journey'], lenses: ['clinical', 'facilities'], roles: ['cno', 'coo', 'facilities'], dashboards: ['lens:clinical', 'splunk'], metrics: ['First-case on-time starts', 'Turnover minutes', 'Rooms out of range'] },
    { id: 'toxicity', evidence: { text: 'Published evidence: the SHIELD-RT randomized trial roughly halved acute-care visits during radiation and chemoradiation using ML-directed check-ins (JCO, 2020).', url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9526253/' }, cat: 'clinical', name: 'Chemotherapy toxicity and dehydration outreach', run: 'cloud', site: 'MH/6/WEBEXCC',
      outcome: 'Fewer avoidable urgent-care visits during treatment and heat waves.', how: 'Splunk ranks patients at risk from treatment schedules, labs and weather; the Webex AI Agent calls them and books fluids in an infusion chair.',
      tech: ['splunk', 'webex-cc', 'webex-connect'], scenarios: ['heat-wave', 'ucc-surge'], lenses: ['clinical', 'patient', 'hospital'], roles: ['cno', 'experience', 'coo'], dashboards: ['splunk', 'lens:patient'], metrics: ['Avoidable UCC visits', 'Outreach containment', 'Same-day fluids'] },
    { id: 'discharge-agent', cat: 'clinical', name: 'Discharge-summary agent with guardrails', run: 'onprem', site: 'MH/12/NS',
      outcome: 'Patients go home on time with instructions they can read.', how: 'MSK’s private LLM drafts the summary on the AI POD; Cisco AI Defense guards it at runtime and Galileo scores it against the chart before a nurse approves it.',
      tech: ['ai-factory', 'ai-defense', 'galileo', 'astrix', 'webex-connect'], scenarios: ['surgical-journey', 'ai-guardrails'], lenses: ['clinical', 'patient'], roles: ['cmio', 'cno', 'cdo'], dashboards: ['ai'], metrics: ['Groundedness', 'Discharge-order-to-depart', 'PHI redactions'] },
    { id: 'tumor-board', evidence: { text: 'Fact: MSK-CHORD (Nature, 2024) used NLP across 24,950 patients and 705,241 radiology reports to improve outcome prediction. Clinical tumor-board summarization here is illustrative.', url: 'https://pubmed.ncbi.nlm.nih.gov/39506116/' }, cat: 'clinical', name: 'Tumor board case summaries', run: 'onprem', site: 'ZRC/-1/AIPOD',
      outcome: 'Physicians walk into tumor board with one consistent, sourced case summary.', how: 'A private LLM on the AI POD summarizes pathology, imaging and notes with citations to the chart; every summary is evaluated by Galileo.',
      tech: ['ai-factory', 'galileo', 'ai-defense', 'splunk-obs'], scenarios: ['ai-guardrails'], lenses: ['clinical', 'leadership'], roles: ['cmo', 'cdo', 'research'], dashboards: ['ai'], metrics: ['Prep minutes saved', 'Citation accuracy'] },
    { id: 'trial-match', evidence: { text: "Published evidence: NIH's TrialGPT cut clinical-trial screening time by about 40% in a study (Nature Communications, 2024).", url: 'https://www.nih.gov/news-events/news-releases/nih-developed-ai-algorithm-matches-potential-volunteers-clinical-trials' }, cat: 'clinical', name: 'Clinical trial matching', run: 'onprem', site: 'ZRC/-1/AIPOD',
      outcome: 'More eligible patients offered a trial, sooner.', how: 'Eligibility criteria are matched against de-identified chart data on the AI POD; research coordinators confirm every candidate.',
      tech: ['ai-factory', 'ai-defense', 'astrix'], scenarios: [], lenses: ['clinical', 'leadership'], roles: ['research', 'cmo'], dashboards: ['ai'], metrics: ['Candidates surfaced', 'Screen-to-enroll'] },
    { id: 'interpreter', cat: 'clinical', name: 'Interpreter on demand and translated teaching', run: 'cloud', site: 'KOCH/3/NS',
      outcome: 'Families understand the plan in their own language, at the bedside.', how: 'A bedside Webex device connects a certified medical interpreter in seconds; Webex AI provides real-time translation and summaries.',
      tech: ['webex-calling', 'webex-connect'], scenarios: ['koch-infusion-day'], lenses: ['patient', 'clinical'], roles: ['experience', 'cno'], dashboards: ['lens:patient'], metrics: ['Interpreter connect time', 'Teach-back completed'] },
    // ---------------------------------------------------------------- operations
    { id: 'flow', cat: 'operations', name: 'Patient-flow and bed forecasting', run: 'cloud', site: 'MH/6/CMD',
      outcome: 'Patients reach a bed hours sooner; fewer UCC boarders.', how: 'Splunk forecasts admissions, discharges and room readiness from Epic ADT, Spaces EVS events and transport data.',
      tech: ['splunk', 'spaces', 'webex-calling'], scenarios: ['ucc-surge', 'surgical-journey', 'leadership-huddle'], lenses: ['hospital', 'leadership'], roles: ['coo', 'cno'], dashboards: ['splunk', 'lead', 'lens:hospital'], metrics: ['PACU-to-bed', 'Admit decision to bed', 'Discharge before noon'] },
    { id: 'asset-ai', cat: 'operations', name: 'Equipment location and PAR intelligence', run: 'cloud', site: 'MH/15/NS',
      outcome: 'Nurses stop searching; fewer rentals.', how: 'Cisco Spaces locates tagged pumps, carts and wheelchairs from Wi-Fi 7 access points; Splunk learns PAR levels per unit.',
      tech: ['spaces', 'wifi7', 'splunk'], scenarios: ['equipment-hunt', 'lost-med-cart', 'leadership-huddle'], lenses: ['clinical', 'facilities', 'hospital'], roles: ['cno', 'facilities', 'coo'], dashboards: ['lens:clinical', 'lens:facilities'], metrics: ['Search minutes per shift', 'Utilization %', 'Rentals avoided'] },
    { id: 'chair-optimizer', cat: 'operations', name: 'Infusion chair optimizer', run: 'cloud', site: 'KOCH/3/NS',
      outcome: 'More patients treated per chair, with less waiting.', how: 'Splunk predicts lab and pharmacy timing and recommends chair assignments; the charge nurse books them.',
      tech: ['splunk', 'spaces', 'webex-connect'], scenarios: ['koch-infusion-day'], lenses: ['hospital', 'clinical', 'patient'], roles: ['coo', 'cno', 'experience'], dashboards: ['splunk', 'lens:hospital'], metrics: ['Chair idle time', 'Arrival to infusion start'] },
    { id: 'contact-center', cat: 'operations', name: 'Contact-center AI agent with Epic context', run: 'cloud', site: 'MH/6/WEBEXCC',
      outcome: 'Calls answered in seconds; staff freed for the hard conversations.', how: 'The Webex AI Agent handles meal orders, rescheduling and storm outreach inside Webex Contact Center, with the patient’s Epic record on screen.',
      tech: ['webex-cc', 'webex-connect', 'splunk'], scenarios: ['meals-robots', 'noreaster', 'blizzard', 'heat-wave'], lenses: ['hospital', 'patient'], roles: ['coo', 'experience'], dashboards: ['splunk', 'lens:patient'], metrics: ['Containment', 'Average speed of answer', 'CSAT'] },
    { id: 'cold-chain', cat: 'operations', name: 'Cold-chain excursion prediction', run: 'cloud', site: 'MH/6/RXCOLD',
      outcome: 'No lost chemotherapy or immunotherapy stock.', how: 'Meraki MT trends are scored in Splunk to predict an excursion before it happens; Webex Calling pages the pharmacist and the engineer.',
      tech: ['meraki-mt', 'splunk', 'webex-calling', 'spaces'], scenarios: ['cold-chain'], lenses: ['facilities', 'clinical'], roles: ['facilities', 'cno'], dashboards: ['lens:facilities'], metrics: ['Excursions predicted', 'Product loss avoided'] },
    { id: 'plant', cat: 'operations', name: 'Predictive plant and HVAC maintenance', run: 'cloud', site: 'MH/20/CHILL',
      outcome: 'ORs stay in range; the plant rides through storms and heat waves.', how: 'BMS data seen through Cyber Vision and Meraki MT sensors are correlated in Splunk to predict failures and open ServiceNow work orders.',
      tech: ['splunk', 'cyber-vision', 'meraki-mt', 'splunk-itsi'], scenarios: ['heat-wave', 'or-humidity', 'noreaster'], lenses: ['facilities', 'leadership'], roles: ['facilities', 'coo'], dashboards: ['lens:facilities', 'systems'], metrics: ['Predicted failures', 'Rooms out of range', 'Work orders auto-opened'] },
    { id: 'robots', cat: 'operations', name: 'Robot delivery analytics', run: 'cloud', site: 'MH/-1/TRAY',
      outcome: 'Hot meals and supplies on time, with public elevators kept free.', how: 'Spaces tracks every robot on Wi-Fi 7; Splunk measures order-to-door so the robot fleet manager can plan around peaks.',
      tech: ['spaces', 'wifi7', 'splunk', 'astrix'], scenarios: ['meals-robots', 'surgical-journey', 'blizzard'], lenses: ['hospital', 'facilities'], roles: ['coo', 'facilities'], dashboards: ['splunk'], metrics: ['Order to door', 'Deliveries per hour'] },
    // ---------------------------------------------------------------- safety, security & IT
    { id: 'unattended', cat: 'safety', name: 'Unattended-object and crowding analytics', run: 'device', site: 'MH/1/LOBBY',
      outcome: 'Lost belongings returned in minutes; safer lobbies.', how: 'Meraki MV cameras detect objects and occupancy on the camera itself (no facial recognition); Cisco Spaces links an object to a nearby consented device.',
      tech: ['meraki-mv', 'spaces', 'webex-calling'], scenarios: ['surgical-journey', 'duress-ucc'], lenses: ['security', 'patient'], roles: ['safety', 'experience'], dashboards: ['lens:security'], metrics: ['Time to reunite', 'Objects flagged'] },
    { id: 'duress', cat: 'safety', name: 'Staff duress location', run: 'cloud', site: 'MH/1/SEC',
      outcome: 'Officers on scene in under two minutes.', how: 'A duress badge press is located by Cisco Spaces and lands in Public Safety’s dispatch console through a hospital integration.',
      tech: ['spaces', 'meraki-mv', 'webex-calling', 'splunk'], scenarios: ['duress-ucc'], lenses: ['security', 'clinical'], roles: ['safety', 'cno'], dashboards: ['lens:security'], metrics: ['Press to officer on scene', 'Incidents per month'] },
    { id: 'agenticops', cat: 'it', name: 'AgenticOps network troubleshooting', run: 'cloud', site: 'MH/6/NOC',
      outcome: 'Infrastructure problems found in minutes, not hours, before clinicians feel them.', how: 'In AI Canvas in Cisco Cloud Control, engineers and AI agents work from ThousandEyes paths, Splunk ITSI health and SD-WAN telemetry; a person approves every change.',
      tech: ['cloud-control', 'ai-canvas', 'thousandeyes', 'splunk-itsi', 'sdwan', 'wifi7'], scenarios: ['epic-slowdown', 'noreaster', 'heat-wave', 'blizzard'], lenses: ['network', 'leadership'], roles: ['cio', 'ciso'], dashboards: ['canvas', 'systems', 'lens:network'], metrics: ['MTTD', 'MTTR', 'Changes approved vs. proposed'] },
    { id: 'iomt-security', cat: 'it', name: 'Medical-device threat detection and safe containment', run: 'cloud', site: 'MH/17/1712',
      outcome: 'Compromised devices contained without stopping a running infusion.', how: 'Cyber Vision spots abnormal device behavior; Splunk Enterprise Security and XDR correlate it; ISE quarantines the device while care continues.',
      tech: ['cyber-vision', 'splunk-es', 'xdr', 'ise', 'astrix', 'cloud-control'], scenarios: ['iomt-pump'], lenses: ['network', 'clinical'], roles: ['ciso', 'cio', 'facilities'], dashboards: ['canvas', 'lens:network'], metrics: ['Time to contain', 'Interrupted infusions'] },
    { id: 'ai-governance', evidence: { text: "Fact: MSK's AI Governance Committee registered, evaluated and monitored 26 AI models in its first year (Scottsdale Institute, 2025).", url: 'https://scottsdaleinstitute.org/event/webinar-responsible-ai-governance-in-oncology/' }, cat: 'it', name: 'AI governance: inventory, red-teaming and runtime guardrails', run: 'onprem', site: 'MH/6/AIOPS',
      outcome: 'AI adopted faster, with PHI and patients protected.', how: 'Cisco AI Defense inventories and red-teams models and agents and guards them at runtime; Galileo evaluates quality; Astrix governs agent identities.',
      tech: ['ai-defense', 'galileo', 'astrix', 'splunk-obs', 'secure-access'], scenarios: ['ai-guardrails'], lenses: ['network', 'leadership'], roles: ['cdo', 'ciso', 'cio'], dashboards: ['ai', 'canvas'], metrics: ['Injection attempts blocked', 'PHI redactions', 'Hallucination rate'] },
    { id: 'edge-ops', evidence: { text: 'Fact: Cisco Unified Edge was announced November 3, 2025 for real-time AI inference in retail, healthcare and factory sites, managed with Cisco Intersight.', url: 'https://newsroom.cisco.com/c/r/newsroom/en/us/a/y2025/m11/cisco-unified-edge-platform-for-distributed-agentic-ai-workloads.html' }, cat: 'it', name: 'Running AI at the edge: fleet health of Unified Edge nodes', run: 'edge', site: 'MH/14/NS',
      outcome: 'Bedside AI stays available on every unit, around the clock.', how: 'Cisco Unified Edge nodes on the units are deployed with zero touch and managed in Cisco Intersight; Cloud Control shows them in its inventory and topology next to the network they sit on, and Splunk watches their health.',
      tech: ['unified-edge', 'cloud-control', 'ai-canvas', 'splunk-obs', 'ise'], scenarios: ['dementia-wander', 'or-humidity'], lenses: ['network', 'facilities'], roles: ['cio', 'cdo'], dashboards: ['canvas'], metrics: ['Edge nodes healthy', 'Inference latency', 'Model versions current'] },
  ];
  MSK.useCaseMap = Object.fromEntries(MSK.useCases.map((u) => [u.id, u]));
  MSK.runLabels = { edge: 'Edge · Cisco Unified Edge on the unit', onprem: 'On-prem · Secure AI Factory', device: 'On the device', cloud: 'Cloud service' };
  MSK.catLabels = { clinical: 'Clinical outcomes', operations: 'Operations', safety: 'Safety', it: 'IT, security & AI ops' };
})();
