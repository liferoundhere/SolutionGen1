/* Where AI runs on campus (map chips) and departmental AI usage & tokenomics (illustrative). */
(function () {
  const MSK = (window.MSK = window.MSK || {});
  MSK.aiSites = [
    { id: 'mv-lobby', name: 'Lobby vision analytics', short: 'Lobby vision', at: 'MH/1/LOBBY', dept: 'Public Safety', tech: 'meraki-mv', runs: 'Edge (on-camera)', model: 'Meraki MV object & person detection',
      does: 'Detects unattended objects, crowding and loitering, and associates objects with device tracks. No facial recognition.', metrics: ['objects detected', 'unattended duration', 'occupancy', 'false-positive rate'], tokens: 0, guard: 'Privacy-preserving metadata only', value: 'Turns hundreds of camera feeds into a few actionable alerts.' },
    { id: 'spaces-engine', name: 'Spaces location engine', short: 'Location AI', at: 'MH/1/SEC', dept: 'Public Safety · Nursing', tech: 'spaces', runs: 'Cisco Spaces cloud', model: 'Location fusion (BLE + UWB + Wi-Fi) & movement anomaly',
      does: 'Blends radio signals into room-level / sub-meter location; flags geofence breaches and unusual movement (e.g. elopement risk).', metrics: ['location accuracy', 'geofence breaches', 'dwell', 'asset utilization'], tokens: 0, guard: 'Consent-based tracking; role-based access', value: 'Minutes instead of hours to find people and equipment.' },
    { id: 'ambient', name: 'Ambient clinical documentation', short: 'Ambient scribe', at: 'MH/12/1214', dept: 'Nursing & Physicians', tech: 'ai-factory', runs: 'On-prem · Secure AI Factory', model: 'Private speech + LLM (fine-tuned)',
      does: 'Drafts nursing assessments and physician notes from the bedside conversation for clinician review.', metrics: ['tokens/note', 'edit distance', 'groundedness', 'minutes saved'], tokens: 16e6, guard: 'AI Defense PHI & safety guardrails · Galileo evals', value: 'Gives clinicians back about an hour a shift for patient care.' },
    { id: 'radiology', name: 'AI-assisted radiology', short: 'Radiology AI', at: 'MH/4/READ', dept: 'Radiology', tech: 'ai-factory', runs: 'On-prem · Secure AI Factory', model: 'Imaging triage + report-drafting LLM',
      does: 'Prioritizes urgent findings on the worklist and drafts structured reports for radiologist sign-off.', metrics: ['studies triaged', 'time-to-read for critical findings', 'report tokens', 'concordance'], tokens: 4.2e6, guard: 'Galileo concordance evals', value: 'Critical findings get read sooner.' },
    { id: 'webex-agent', name: 'Webex AI Agent', short: 'Contact center AI', at: 'MH/6/WEBEXCC', dept: 'Patient Access', tech: 'webex-cc', runs: 'Webex cloud', model: 'Webex AI Agent (voice & chat) + agent assist',
      does: 'Self-service for scheduling, meal orders, directions and visitor info; summarizes and assists human agents with Epic context.', metrics: ['containment', 'AHT', 'CSAT', 'tokens/conversation'], tokens: 9.5e6, guard: 'AI Defense runtime guardrails', value: 'Shorter queues for patients and families.' },
    { id: 'flow', name: 'Patient-flow forecasting', short: 'Flow forecast', at: 'MH/6/CMD', dept: 'Hospital Operations', tech: 'splunk', runs: 'Splunk Cloud', model: 'Cisco time-series foundation model + Splunk AI Toolkit',
      does: 'Forecasts admissions, discharges, UCC arrivals and bed-ready times; explains drivers in plain language.', metrics: ['forecast accuracy (MAPE)', 'room wait', 'boarding hours'], tokens: 1.6e6, guard: 'Model drift monitoring', value: 'Capacity problems are fixed before patients wait.' },
    { id: 'aicanvas', name: 'AI Canvas & AgenticOps', short: 'AgenticOps', at: 'MH/6/NOC', dept: 'Network & Security Ops', tech: 'cloud-control', runs: 'Cisco Cloud Control', model: 'Deep Network Model + AgenticOps agents',
      does: 'Correlates cross-domain incidents, proposes root cause and remediation for human approval.', metrics: ['MTTD', 'MTTR', 'actions approved', 'tokens/incident'], tokens: 3.5e6, guard: 'Policy-governed actions, full audit', value: 'Outages shrink from hours to minutes.' },
    { id: 'soc', name: 'Agentic SOC triage', short: 'SOC agents', at: 'MH/6/NOC', dept: 'Security Operations', tech: 'splunk-es', runs: 'Splunk Cloud', model: 'Splunk ES triage agents · Foundation AI security model',
      does: 'Summarizes, scores and enriches alerts; drafts SOAR playbooks.', metrics: ['alerts auto-triaged', 'time to contain', 'tokens/alert'], tokens: 2.8e6, guard: 'Human approval for containment', value: 'Analysts focus on the real threats.' },
    { id: 'governance', name: 'AI governance stack', short: 'AI Defense · Galileo', at: 'MH/6/AIOPS', dept: 'AI Governance', tech: 'ai-defense', runs: 'Cisco AI Defense + Galileo', model: 'Guardrail classifiers · evaluation models · AI BOM',
      does: 'Inventories every model/agent/MCP server, red-teams them, evaluates quality and enforces runtime guardrails.', metrics: ['prompts inspected', 'blocks', 'groundedness', 'hallucination rate', 'AI BOM size'], tokens: 1.2e6, guard: 'Maps to NIST AI RMF, OWASP LLM Top 10, MITRE ATLAS', value: 'AI that clinicians and regulators can trust.' },
    { id: 'factory', name: 'Cisco Secure AI Factory', short: 'AI Factory', at: 'ZRC/-1/AIPOD', dept: 'Research & Enterprise AI', tech: 'ai-factory', runs: 'On-prem AI PODs (NVIDIA)', model: 'Private LLMs, pathology & imaging foundation models',
      does: 'Hosts training, fine-tuning and PHI-bearing inference inside MSK.', metrics: ['GPU utilization', 'tokens/sec', '$/1M tokens', 'queue time'], tokens: 22e6, guard: 'AI Defense + Hypershield + Splunk', value: 'High-value AI at predictable cost without PHI leaving MSK.' },
    { id: 'pathology', name: 'Computational pathology', short: 'Pathology AI', at: 'ZRC/12/LABA', dept: 'Pathology & Research', tech: 'ai-factory', runs: 'On-prem · Secure AI Factory', model: 'Digital-pathology foundation model',
      does: 'Screens whole-slide images and quantifies biomarkers for pathologist review.', metrics: ['slides/day', 'GPU-hours', 'concordance'], tokens: 0, guard: 'Validated pipeline', value: 'Faster, more consistent diagnoses.' },
    { id: 'kitchen', name: 'Meal-order & robot fleet AI', short: 'Food & robots', at: 'MH/-1/TRAY', dept: 'Food & Nutrition', tech: 'webex-cc', runs: 'Webex AI Agent (Epic diet orders) + robot fleet manager', model: 'Diet-order checking + fleet route optimization',
      does: 'Checks orders against Epic diet/allergy orders; routes robots around elevator peaks.', metrics: ['order-to-door', 'diet errors caught', 'robot utilization'], tokens: 0.5e6, guard: 'Astrix-scoped robot identities', value: 'Hot, safe meals on time.' },
    { id: 'pharmacy', name: 'Cold-chain anomaly detection', short: 'Cold chain AI', at: 'MH/6/RXCOLD', dept: 'Pharmacy', tech: 'meraki-mt', runs: 'Meraki cloud + Splunk', model: 'Predictive drift detection',
      does: 'Predicts refrigerator excursions from compressor and door patterns before limits are breached.', metrics: ['°F trend', 'door-open time', 'excursions prevented'], tokens: 0, guard: '—', value: 'Protects irreplaceable therapies.' },
    { id: 'plant', name: 'Predictive plant maintenance', short: 'Plant AI', at: 'MH/20/CHILL', dept: 'Facilities', tech: 'splunk', runs: 'Splunk + Cyber Vision', model: 'Time-series anomaly models on BMS data',
      does: 'Flags chiller, AHU and valve degradation days ahead.', metrics: ['asset health', 'anomalies', 'work orders auto-created'], tokens: 0.6e6, guard: '—', value: 'No surprise OR humidity or temperature events.' },
    { id: 'infusion', name: 'Infusion chair optimizer', short: 'Chair optimizer', at: 'KOCH/3/NS', dept: 'Outpatient Infusion', tech: 'splunk', runs: 'Splunk', model: 'Scheduling optimizer using arrival & pharmacy-prep signals',
      does: 'Matches chairs, nurses and pharmacy prep to real arrival times.', metrics: ['chair utilization', 'arrival-to-infusion', 'idle chair-minutes'], tokens: 0.3e6, guard: '—', value: 'Less waiting, more treatments per chair.' },
    { id: 'discharge', name: 'Discharge-summary agent', short: 'Discharge agent', at: 'MH/12/NS', dept: 'Clinical Documentation', tech: 'ai-factory', runs: 'On-prem · Secure AI Factory', model: 'Private LLM + RAG over the chart',
      does: 'Drafts plain-language discharge instructions for nurse review; delivered via Webex Connect.', metrics: ['tokens/discharge (3.8K)', 'groundedness', 'reading level', 'nurse edit time'], tokens: 0.32e6, guard: 'AI Defense guardrails · Galileo groundedness gate · Astrix-scoped identity', value: 'Clearer instructions, fewer readmission-risk misunderstandings.' },
  ];

  // Department AI usage & tokenomics (illustrative)
  MSK.aiDepts = [
    { dept: 'Research (AI Factory)', tokens: 22e6, onprem: 1.0, cost1m: 2.9, outcome: 'per fine-tune run', perOutcome: 64, users: 260, blocks: 12, ground: null, gpu: 0.78 },
    { dept: 'Nursing · Ambient docs', tokens: 16e6, onprem: 1.0, cost1m: 2.9, outcome: 'per note', perOutcome: 0.0037, users: 3100, blocks: 214, ground: 0.95, gpu: 0.66 },
    { dept: 'Patient Access (Webex AI Agent)', tokens: 9.5e6, onprem: 0.0, cost1m: 15, outcome: 'per conversation', perOutcome: 0.028, users: 180, blocks: 96, ground: 0.93 },
    { dept: 'Revenue Cycle · Prior auth & coding', tokens: 6.5e6, onprem: 0.3, cost1m: 9.27, outcome: 'per prior-auth letter', perOutcome: 0.14, users: 420, blocks: 31, ground: 0.96 },
    { dept: 'Radiology', tokens: 4.2e6, onprem: 1.0, cost1m: 2.9, outcome: 'per AI-assisted read (incl. GPU)', perOutcome: 0.09, users: 210, blocks: 9, ground: 0.97, gpu: 0.71 },
    { dept: 'IT · AgenticOps', tokens: 3.5e6, onprem: 0.0, cost1m: 9, outcome: 'per incident', perOutcome: 0.41, users: 140, blocks: 4, ground: 0.94 },
    { dept: 'Security Ops', tokens: 2.8e6, onprem: 0.4, cost1m: 6.56, outcome: 'per alert', perOutcome: 0.012, users: 38, blocks: 2, ground: 0.95 },
    { dept: 'Hospital Ops · Forecasting', tokens: 1.6e6, onprem: 0.0, cost1m: 6, outcome: 'per forecast', perOutcome: 0.02, users: 95, blocks: 0, ground: 0.96 },
    { dept: 'Pharmacy', tokens: 1.4e6, onprem: 1.0, cost1m: 2.9, outcome: 'per verification', perOutcome: 0.003, users: 160, blocks: 7, ground: 0.98 },
    { dept: 'Facilities', tokens: 0.6e6, onprem: 0.0, cost1m: 6, outcome: 'per work order', perOutcome: 0.004, users: 70, blocks: 0, ground: 0.95 },
    { dept: 'Food & Nutrition', tokens: 0.5e6, onprem: 0.0, cost1m: 6, outcome: 'per order', perOutcome: 0.0011, users: 60, blocks: 1, ground: 0.97 },
    { dept: 'Clinical Docs · Discharge', tokens: 0.32e6, onprem: 1.0, cost1m: 2.9, outcome: 'per discharge', perOutcome: 0.011, users: 900, blocks: 41, ground: 0.97 },
  ];
  MSK.aiGovernance = {
    bom: { models: 64, agents: 37, mcp: 22, datasets: 41, thirdParty: 118 },
    guard: { inspected: 4.82e6, phi: 1904, injection: 312, jailbreak: 57, shadow: 23 },
    galileo: { evaluated: 1.21e6, ground: 0.962, halluc: 0.008, toolSel: 0.94, drift: 2 },
    astrix: { nhi: 3940, overPriv: 212, stale: 640, rotated: 1188, agentsGoverned: 37 },
    factory: { gpus: 64, util: 0.71, tps: 41000, cost1m: 2.9, cloudCost1m: 9.4 },
  };
})();
