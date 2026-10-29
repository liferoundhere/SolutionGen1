/* Lens dashboards, leadership milestones/tasks/insights, lines of business. All figures illustrative. */
(function () {
  const MSK = (window.MSK = window.MSK || {});
  MSK.leadership = {
    milestones: [
      { name: 'Wi-Fi 7 + Cisco Spaces across York Ave campus', owner: 'Ken Nakamura', pct: 82, target: 'Dec 2026', status: 'on-track', detail: '186 of 227 floors live; Koch Center 100%, MH 84%, JRSC 100%, research towers 61%.', tech: ['wifi7', 'spaces'] },
      { name: 'Tag 18,000 mobile medical assets', owner: 'Marcus Johnson', pct: 79, target: 'Jan 2027', status: 'on-track', detail: '14,220 tagged; pumps, wheelchairs, ultrasounds, WOWs, bladder scanners, med carts complete.', tech: ['spaces'] },
      { name: 'Discharge-before-noon ≥ 55%', owner: 'Hannah Brooks', pct: 49, target: 'Q2 FY27', status: 'at-risk', detail: '49% (from 34%). Pickup geofencing on Fl 12 is the biggest lever. Rollout to Fl 7–11 pending approval.', tech: ['splunk', 'spaces', 'webex-connect'] },
      { name: 'First-case on-time starts ≥ 90%', owner: 'Lauren Fitzgerald', pct: 100, target: 'Achieved', status: 'done', detail: '91% for 3 consecutive months (from 78%).', tech: ['spaces', 'meraki-mt', 'webex-connect'] },
      { name: 'Splunk ITSI service maps · top 25 clinical services', owner: 'Priya Raman', pct: 84, target: 'Nov 2026', status: 'on-track', detail: '21 of 25 mapped incl. Epic Inpatient, OpTime, PACS, nurse call, Webex CC.', tech: ['splunk-itsi', 'thousandeyes'] },
      { name: 'AI Defense on 100% of sanctioned AI apps & agents', owner: 'Dr. Elena Petrova', pct: 94, target: 'Nov 2026', status: 'on-track', detail: '35 of 37 agents behind runtime guardrails; AI BOM covers 64 models, 22 MCP servers.', tech: ['ai-defense'] },
      { name: 'Galileo evaluation gates for patient-facing AI', owner: 'Dr. Elena Petrova', pct: 78, target: 'Dec 2026', status: 'on-track', detail: '7 of 9 patient-facing agents gated on groundedness ≥ 0.95.', tech: ['galileo'] },
      { name: 'Non-human identity least privilege (Astrix)', owner: 'Priya Raman', pct: 61, target: 'Jan 2027', status: 'at-risk', detail: '3,940 NHIs discovered; 212 over-privileged tokens open; 1,188 secrets rotated.', tech: ['astrix'] },
      { name: 'Unified operations in Cisco Cloud Control', owner: 'Ken Nakamura', pct: 66, target: 'Mar 2027', status: 'on-track', detail: 'Phase 2 of 3: NetOps + SecOps live; data center and IoT network next.', tech: ['cloud-control', 'ai-canvas'] },
      { name: 'Storm resilience: dual carrier + 5G for all sites', owner: 'Priya Raman', pct: 100, target: 'Achieved', status: 'done', detail: 'All 14 regional sites on Catalyst SD-WAN with 5G backup; tested in October drill.', tech: ['sdwan', 'thousandeyes'] },
      { name: 'Reduce equipment rental spend by $2.0M', owner: 'Marcus Johnson', pct: 73, target: 'FY27', status: 'on-track', detail: '−$1.46M YTD from Spaces utilization & PAR rebalancing.', tech: ['spaces', 'splunk'] },
      { name: 'Delivery robot fleet 8 → 14', owner: 'Nadia Haddad', pct: 33, target: 'Feb 2027', status: 'watch', detail: '10 deployed; elevator API integration for KOCH pending.', tech: ['cloud-control', 'astrix'] },
    ],
    tasks: [
      { t: 'Approve pickup-geofence rollout to Floors 7–11', owner: 'Hannah Brooks', due: 'Oct 24', pri: 'high', state: 'Needs decision' },
      { t: 'Remediate 212 over-privileged API tokens', owner: 'Priya Raman', due: 'Nov 15', pri: 'high', state: 'In progress' },
      { t: 'Replace AHU-1 humidifier valve actuator (OR supply)', owner: 'Marcus Johnson', due: 'Oct 22', pri: 'high', state: 'Parts ordered' },
      { t: 'Move contact-center summarization on-prem (−80% cost per call)', owner: 'Dr. Elena Petrova', due: 'Nov 1', pri: 'med', state: 'Needs decision' },
      { t: 'Nor’easter readiness tabletop (Public Safety + Facilities)', owner: 'Capt. Rosa Delgado', due: 'Oct 29', pri: 'med', state: 'Scheduled' },
      { t: 'Rebalance infusion pump PAR levels, Floors 14–17', owner: 'Raj Patel', due: 'Oct 21', pri: 'med', state: 'In progress' },
      { t: 'Board AI report: usage, safety, tokenomics', owner: 'Catherine Wells', due: 'Nov 6', pri: 'med', state: 'Drafting' },
      { t: 'Add parking-validation self-service to Webex AI Agent', owner: 'Brianna Lee', due: 'Nov 8', pri: 'low', state: 'Backlog' },
    ],
    insights: [
      { k: 'Flow', icon: '↗', title: 'Pickup geofencing cut Floor 12 discharge-to-depart by 72%', text: 'Rolling it out to Floors 7–11 is projected to return ~410 bed-hours per month and lift discharge-before-noon to 54%.', conf: 0.86, src: ['splunk', 'spaces'], action: 'Approve rollout' },
      { k: 'Capacity', icon: '⚠', title: 'UCC arrivals forecast +18% Monday 14:00–20:00', text: 'Matches the chemo-cycle pattern of the last 6 weeks. Pre-staff 2 RNs and pull forward 6 discharges.', conf: 0.81, src: ['splunk'], action: 'Open surge playbook' },
      { k: 'Assets', icon: '⌖', title: '31% of infusion pumps idle in Fl 14–16 alcoves while Fl 17 rents 12', text: 'Rebalancing PAR levels saves ~$96K/year in rentals and ~30 nursing search minutes per shift.', conf: 0.9, src: ['spaces', 'splunk'], action: 'Create PAR task' },
      { k: 'Network', icon: '◐', title: 'Carrier B latency to Epic hosting up 3 days running', text: 'ThousandEyes sees +14 ms at a metro hop. No user impact yet, so open a proactive carrier ticket with evidence.', conf: 0.77, src: ['thousandeyes'], action: 'Share evidence' },
      { k: 'AI', icon: '✦', title: 'Contact-center AI is the largest cloud token spend', text: 'Moving Webex AI Agent summarization to the Secure AI Factory cuts cost per call from $0.028 to $0.005 (about $3.4K/month) and keeps transcripts in-house, at equal Galileo quality (0.95 vs 0.95).', conf: 0.84, src: ['splunk-obs', 'galileo', 'ai-factory'], action: 'Approve migration' },
      { k: 'Experience', icon: '♥', title: 'Top unresolved Webex AI Agent intent: parking validation', text: '11% of escalations. A self-service flow would raise containment from 58% to ~63%.', conf: 0.88, src: ['webex-cc'], action: 'Add flow' },
    ],
    lob: [
      { name: 'Inpatient', kpi: '412 / 470 beds', sub: 'ALOS 5.6 d · room wait 38 min', trend: [80, 82, 84, 86, 85, 88, 87.6], unit: '% occ', tone: 'warn' },
      { name: 'Surgery (MH + JRSC)', kpi: '96 cases/day', sub: 'First-case on-time 91%', trend: [84, 86, 88, 89, 90, 92, 96], unit: 'cases', tone: 'ok' },
      { name: 'Outpatient & Infusion (Koch)', kpi: '2,850 visits/day', sub: 'Chair utilization 87%', trend: [80, 82, 83, 84, 86, 85, 87], unit: '%', tone: 'ok' },
      { name: 'Urgent Care Center', kpi: '96 visits/day', sub: 'Door-to-provider 14 min', trend: [22, 21, 19, 18, 16, 15, 14], unit: 'min', tone: 'ok' },
      { name: 'Imaging', kpi: '1,150 scans/day', sub: 'Critical result read 22 min', trend: [38, 35, 31, 29, 27, 24, 22], unit: 'min', tone: 'ok' },
      { name: 'Pharmacy', kpi: '21,000 doses/day', sub: 'Cold-chain excursions 0', trend: [3, 2, 2, 1, 1, 0, 0], unit: 'exc', tone: 'ok' },
      { name: 'Food & Nutrition', kpi: '3,010 meals/day', sub: 'Order-to-door 24 min', trend: [41, 38, 34, 31, 28, 26, 24], unit: 'min', tone: 'ok' },
      { name: 'Research & AI', kpi: '100+ labs', sub: 'AI Factory GPU util 71%', trend: [52, 58, 61, 66, 68, 70, 71], unit: '%', tone: 'ok' },
    ],
    value: [
      { label: 'Outage minutes avoided (YTD)', v: 1840, fmt: 'min', tech: 'thousandeyes' },
      { label: 'Equipment rentals avoided', v: 1460000, fmt: '$', tech: 'spaces' },
      { label: 'Nursing hours returned (YTD)', v: 61400, fmt: 'h', tech: 'spaces' },
      { label: 'Bed-hours released', v: 38200, fmt: 'h', tech: 'splunk' },
      { label: 'Drugs protected (cold chain)', v: 920000, fmt: '$', tech: 'meraki-mt' },
      { label: 'AI tokens governed / day', v: 69e6, fmt: 'n', tech: 'ai-defense' },
    ],
  };

  // Operations priority systems: tiering, health, recovery targets and Cisco coverage (illustrative)
  MSK.prioritySystems = [
    { sys: 'Epic EHR (Hyperspace, OpTime, Willow, ASAP)', tier: 1, status: 'ok', health: 99, owner: 'Digital & Informatics', rto: '15 min', lens: 'network', tech: ['splunk-itsi', 'thousandeyes', 'splunk-obs', 'sdwan'], deps: 'Data center fabric · Carrier A/B · VDI', note: 'ITSI health 99 · path to hosting 18 ms, 0% loss' },
    { sys: 'Nurse call & clinical communications', tier: 1, status: 'ok', health: 100, owner: 'Clinical Engineering', rto: '5 min', lens: 'clinical', tech: ['wifi7', 'webex-calling', 'splunk-itsi'], deps: 'Wi-Fi 7 · Webex Calling · badge platform', note: 'Roam time 18 ms · 0 dropped alarms' },
    { sys: 'Physiologic monitoring & telemetry', tier: 1, status: 'ok', health: 99, owner: 'Clinical Engineering', rto: '5 min', lens: 'clinical', tech: ['ise', 'cyber-vision', 'wifi7'], deps: 'Medical VLAN · central station servers', note: '2,140 monitors profiled & segmented' },
    { sys: 'Infusion pumps & IoMT fleet', tier: 1, status: 'watch', health: 97, owner: 'Clinical Engineering', rto: '30 min', lens: 'facilities', tech: ['ise', 'cyber-vision', 'spaces', 'splunk-es'], deps: 'Pump server · drug library', note: '1 pump in adaptive quarantine (infusion running)' },
    { sys: 'PACS, imaging & MRI chillers', tier: 1, status: 'ok', health: 98, owner: 'Radiology IT', rto: '30 min', lens: 'facilities', tech: ['splunk-itsi', 'meraki-mt', 'nexus'], deps: 'Storage · chilled water · helium', note: 'MRI 1 helium 78% · chiller in range' },
    { sys: 'Pharmacy automation & cold chain', tier: 1, status: 'ok', health: 100, owner: 'Pharmacy', rto: '15 min', lens: 'facilities', tech: ['meraki-mt', 'splunk', 'cloud-control'], deps: 'Dispensing cabinets · 212 fridges/freezers', note: '0 excursions in 30 days' },
    { sys: 'Lab information system & blood bank', tier: 1, status: 'ok', health: 99, owner: 'Laboratory Medicine', rto: '15 min', lens: 'clinical', tech: ['splunk-itsi', 'meraki-mt'], deps: 'LIS · analyzers · blood fridges', note: 'STAT turnaround 38 min' },
    { sys: 'Utility power, generators & ATS', tier: 1, status: 'ok', health: 100, owner: 'Plant Operations', rto: '10 s', lens: 'facilities', tech: ['cyber-vision', 'splunk', 'cloud-control'], deps: 'Con Ed feeders · 4 generators · fuel', note: 'Monthly load test passed Sat' },
    { sys: 'HVAC & OR environment (AHU, chillers)', tier: 1, status: 'watch', health: 96, owner: 'Plant Operations', rto: '30 min', lens: 'facilities', tech: ['meraki-mt', 'cyber-vision', 'splunk'], deps: 'Chiller plant · AHU-1/2 · BMS', note: 'Chiller load 71% · AHU-1 actuator on order' },
    { sys: 'Medical gases & vacuum', tier: 1, status: 'ok', health: 100, owner: 'Plant Operations', rto: '5 min', lens: 'facilities', tech: ['cyber-vision', 'meraki-mt'], deps: 'Bulk O₂ · manifolds · alarms', note: 'Bulk O₂ 81%' },
    { sys: 'Network core, Wi-Fi 7 & SD-WAN', tier: 1, status: 'ok', health: 99, owner: 'Infrastructure', rto: '5 min', lens: 'network', tech: ['wifi7', 'sdwan', 'thousandeyes', 'nexus', 'cloud-control'], deps: 'Dual carriers · 5G backup · MDF/IDFs', note: '41,208 endpoints · client health 98%' },
    { sys: 'Identity, access & zero trust', tier: 1, status: 'warn', health: 91, owner: 'Information Security', rto: '15 min', lens: 'network', tech: ['secure-access', 'ise', 'astrix', 'xdr'], deps: 'Duo · ISE · Secure Access · NHI vault', note: '212 over-privileged machine tokens open' },
    { sys: 'Clinical & enterprise AI agents', tier: 2, status: 'ok', health: 98, owner: 'AI Governance', rto: '1 h', lens: 'network', tech: ['ai-defense', 'galileo', 'splunk-obs', 'astrix', 'ai-factory'], deps: 'AI Factory · cloud model APIs · MCP servers', note: '35/37 agents guarded · groundedness 0.962' },
    { sys: 'Elevators & vertical transport', tier: 2, status: 'watch', health: 94, owner: 'Plant Operations', rto: '30 min', lens: 'facilities', tech: ['cloud-control', 'cyber-vision'], deps: 'Elevator controllers · robot API', note: '27 of 28 in service (S2 preventive maintenance)' },
    { sys: 'Patient flow & bed management', tier: 2, status: 'ok', health: 97, owner: 'Hospital Operations', rto: '30 min', lens: 'hospital', tech: ['splunk', 'spaces', 'cloud-control'], deps: 'Epic ADT · EVS badges · transport', note: 'Room wait 38 min · 3 UCC boarders' },
    { sys: 'Webex Contact Center & patient messaging', tier: 2, status: 'ok', health: 99, owner: 'Patient Access', rto: '15 min', lens: 'hospital', tech: ['webex-cc', 'webex-connect', 'thousandeyes'], deps: 'Epic integration · carriers · SMS gateway', note: 'AI Agent containment 58% · abandon 2.1%' },
    { sys: 'Physical security, cameras & access control', tier: 2, status: 'ok', health: 99, owner: 'Public Safety', rto: '15 min', lens: 'security', tech: ['meraki-mv', 'spaces', 'webex-calling'], deps: 'Cameras · badges · duress buttons', note: '1,180 cameras · duress → scene 1 m 48 s' },
    { sys: 'Food & nutrition, tray line & robots', tier: 2, status: 'ok', health: 98, owner: 'Food & Nutrition', rto: '1 h', lens: 'hospital', tech: ['spaces', 'cloud-control', 'webex-cc', 'astrix'], deps: 'Epic diet orders · service elevators', note: 'Order → door 24 min · 10 robots' },
    { sys: 'Patient transport & environmental services', tier: 2, status: 'ok', health: 97, owner: 'Hospital Operations', rto: '30 min', lens: 'hospital', tech: ['spaces', 'splunk'], deps: 'Badges · wheelchairs/stretchers · dispatch', note: 'Transport job 18 min · EVS 41 min' },
    { sys: 'Wayfinding & visitor management', tier: 3, status: 'ok', health: 100, owner: 'Patient Experience', rto: '4 h', lens: 'patient', tech: ['spaces', 'webex-connect'], deps: 'Maps · OpenRoaming · visitor passes', note: '6,920 sessions today' },
    { sys: 'Research computing & Secure AI Factory', tier: 3, status: 'ok', health: 99, owner: 'Research IT', rto: '4 h', lens: 'network', tech: ['ai-factory', 'nexus', 'splunk'], deps: 'GPU PODs · storage · liquid cooling', note: 'GPU utilization 71%' },
  ];

  // per-lens live KPI tiles (value, delta, sparkline seed)
  MSK.lensKPIs = {
    leadership: [
      { l: 'Milestones on track', v: '9 / 12', d: '2 at risk', tone: 'warn' }, { l: 'Discharge before noon', v: '49%', d: '+15 pts YoY', tone: 'ok', s: [34, 36, 39, 41, 44, 47, 49] },
      { l: 'Room wait (avg)', v: '38 min', d: '−66%', tone: 'ok', s: [112, 98, 84, 70, 55, 44, 38] }, { l: 'Clinical outage minutes', v: '41', d: '−87% QoQ', tone: 'ok', s: [310, 260, 190, 120, 80, 55, 41] },
    ],
    hospital: [
      { l: 'Census', v: '412', d: '87.6% occupancy', tone: 'warn', s: [395, 401, 398, 405, 409, 410, 412] }, { l: 'Room wait', v: '38 min', d: 'target 45', tone: 'ok', s: [52, 49, 47, 44, 41, 40, 38] },
      { l: 'EVS turnaround', v: '41 min', d: '−47%', tone: 'ok', s: [78, 70, 61, 55, 49, 44, 41] }, { l: 'Order → door (meals)', v: '24 min', d: 'target 30', tone: 'ok', s: [41, 38, 34, 31, 28, 26, 24] },
    ],
    clinical: [
      { l: 'First-case on-time', v: '91%', d: '+13 pts', tone: 'ok', s: [78, 80, 83, 86, 88, 90, 91] }, { l: 'Nurse search min/shift', v: '6', d: 'from 38', tone: 'ok', s: [38, 31, 24, 17, 11, 8, 6] },
      { l: 'At-risk patients tracked', v: '23', d: 'elopement wristbands', tone: 'info' }, { l: 'UCC door-to-provider', v: '14 min', d: 'target 15', tone: 'ok', s: [22, 21, 19, 18, 16, 15, 14] },
    ],
    network: [
      { l: 'Epic service health', v: '99', d: 'ITSI · 24 h', tone: 'ok', s: [97, 98, 96, 99, 99, 98, 99] }, { l: 'MTTR (clinical P1)', v: '11 min', d: 'from 2 h 40 m', tone: 'ok', s: [160, 120, 70, 40, 22, 14, 11] },
      { l: 'IoMT profiled (ISE)', v: '41,208', d: '3 quarantined', tone: 'warn' }, { l: 'AI prompts guarded / day', v: '4.8M', d: '312 injections blocked', tone: 'ok' },
    ],
    facilities: [
      { l: 'OR env compliance', v: '99.96%', d: '24 ORs', tone: 'ok' }, { l: 'Cold-chain units', v: '212', d: '0 excursions 30 d', tone: 'ok' },
      { l: 'Chiller load', v: '71%', d: 'heat index 84 °F', tone: 'warn', s: [52, 58, 61, 66, 70, 72, 71] }, { l: 'Asset utilization', v: '64%', d: '+19 pts', tone: 'ok', s: [45, 49, 53, 57, 60, 62, 64] },
    ],
    security: [
      { l: 'Duress → on-scene', v: '1 m 48 s', d: 'from 7 m', tone: 'ok', s: [7, 6, 4.5, 3.2, 2.5, 2, 1.8] }, { l: 'Elopement alerts (30 d)', v: '17', d: 'all < 6 min', tone: 'ok' },
      { l: 'Visitors on campus', v: '1,284', d: '3 out of zone', tone: 'info' }, { l: 'Unattended items', v: '42', d: '94% owner-matched', tone: 'ok' },
    ],
    patient: [
      { l: 'Likelihood to recommend', v: '94', d: '+6', tone: 'ok', s: [86, 88, 89, 90, 92, 93, 94] }, { l: 'Wayfinding sessions / day', v: '6,920', d: 'avg 3.8 min', tone: 'info' },
      { l: 'Family updates sent', v: '2,410', d: 'per day', tone: 'info' }, { l: 'Lost belongings claims', v: '−81%', d: 'since tagging', tone: 'ok' },
    ],
  };
})();
