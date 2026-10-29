/* MSK leaders: REAL names and titles, taken only from MSK's public pages (see js/data/sources.js), as of October 2026.
   Only the name, title and source are factual. The alignment of each leader with use cases, scenarios and dashboards
   (roles, useCases, focus) is this demo's illustrative assumption about the role, not a statement by or about the person.
   No real leader appears in any story, scenario or 3D scene; story characters are fictional. */
(function () {
  const MSK = (window.MSK = window.MSK || {});
  const L1 = { label: 'mskcc.org · Executive Leadership', url: 'https://www.mskcc.org/about/leadership/executive-leadership', date: 'accessed Oct 2026' };
  MSK.leaders = [
    // Leadership (enterprise)
    { id: 'vickers', name: 'Selwyn M. Vickers, MD', title: 'President and CEO', lens: 'leadership', lead: true, roles: ['ceo', 'coo', 'experience'], source: L1,
      focus: 'Enterprise performance and the patient experience across the whole system: access, capacity, safety and the return on strategic technology.' },
    { id: 'mack', name: 'LaKisha Mack', title: 'Chief Administrative Officer', lens: 'leadership', roles: ['coo', 'facilities'], source: L1,
      focus: 'Administrative operations that keep the enterprise running: shared services, resilience and cost.' },
    { id: 'offodile', name: 'Anaeze Offodile II, MD', title: 'Chief Strategy Officer', lens: 'leadership', roles: ['ceo', 'cdo'], source: L1,
      focus: 'Strategic bets: where AI and digital capabilities change access, outcomes and growth.' },
    { id: 'glass', name: 'Steve Glass', title: 'EVP and Chief Financial Officer', lens: 'leadership', roles: ['coo'], source: L1,
      focus: 'Cost per outcome, capital avoided (rentals, overtime, lost stock) and the economics of AI.', useCases: ['flow', 'asset-ai', 'cold-chain', 'ai-governance', 'contact-center', 'plant'] },
    { id: 'berns', name: 'Debra Berns', title: 'SVP and Chief Risk Officer', lens: 'leadership', also: ['security'], roles: ['ciso', 'safety'], source: { label: 'mskcc.org · Debra Berns joins MSK', url: 'https://www.mskcc.org/news-releases/debra-berns-joins-msk-senior-vice-president-and-chief-risk-officer-01' },
      focus: 'Enterprise risk: patient safety events, cyber and medical-device risk, AI risk and compliance evidence.' },
    // Hospital operations
    { id: 'anderson', name: 'Shelly Anderson', title: 'Hospital President', lens: 'hospital', lead: true, also: ['patient'], roles: ['coo', 'experience', 'cno'], source: { label: 'mskcc.org · Shelly Anderson named inaugural Hospital President', url: 'https://www.mskcc.org/news-releases/shelly-anderson-named-mskccs-inaugural-hospital-president' },
      focus: 'Memorial Hospital operations and care coordination, and the patient experience: beds, flow, waits and on-time discharge.' },
    { id: 'koford', name: 'Kreg Koford', title: 'SVP, Supply Chain and Hospital Operations', lens: 'hospital', also: ['facilities'], roles: ['coo', 'facilities'], source: L1,
      focus: 'Supply chain and hospital operations: equipment availability, cold chain, meals and deliveries.', useCases: ['asset-ai', 'cold-chain', 'robots', 'flow', 'contact-center', 'chair-optimizer'] },
    { id: 'hagerty', name: 'Judy Hagerty-Paglia', title: 'SVP, Diagnostics, Inpatient & Clinical Operations', lens: 'hospital', also: ['clinical'], roles: ['coo', 'cno'], source: L1,
      focus: 'Inpatient and diagnostic operations: bed turnover, throughput and the time patients spend waiting.' },
    // Clinical
    { id: 'gosselin', name: 'Tracy Gosselin, PhD, RN', title: 'SVP and Chief Nursing Executive', lens: 'clinical', lead: true, roles: ['cno'], source: L1,
      focus: 'Nursing practice and patient safety: falls, elopement, time at the bedside and on-time medication.' },
    { id: 'smith', name: 'Cardinale Smith, MD', title: 'Chief Medical Officer', lens: 'clinical', roles: ['cmo', 'cmio'], source: L1,
      focus: 'Quality and safety of medical care: early warning, documentation burden and safe, governed clinical AI.' },
    { id: 'drebin', name: 'Jeffrey Drebin, MD, PhD', title: 'Chief Physician Executive', lens: 'clinical', roles: ['cmo', 'research'], source: L1,
      focus: 'Physician practice and research translation: tumor boards, trials and diagnostic AI.' },
    { id: 'rowland', name: 'Sean Rowland', title: 'SVP, Peri-Operative, Procedural & Clinical Operations', lens: 'clinical', roles: ['cno'], source: L1,
      focus: 'Operating rooms and procedural areas: first-case on-time starts, turnover and room readiness.', useCases: ['or-video', 'flow', 'asset-ai', 'plant', 'discharge-agent'] },
    { id: 'schwartz', name: 'Lawrence Schwartz, MD', title: 'Chair, Department of Radiology', lens: 'clinical', roles: [], source: L1,
      focus: 'Imaging access and time-to-read for critical findings.', useCases: ['radiology', 'tumor-board', 'ai-governance'] },
    { id: 'elenitoba', name: 'Kojo S.J. Elenitoba-Johnson, MD', title: 'Chair, Pathology and Laboratory Medicine', lens: 'clinical', roles: [], source: L1,
      focus: 'Diagnostic accuracy and turnaround in pathology and laboratory medicine.', useCases: ['pathology', 'tumor-board', 'trial-match'] },
    { id: 'deasy', name: 'Joseph O. Deasy, PhD', title: 'Chair, Medical Physics', lens: 'clinical', roles: [], source: L1,
      focus: 'Radiation therapy planning quality and speed.', useCases: ['contouring', 'ai-governance'] },
    { id: 'fischer', name: 'Gregory Fischer, MD', title: 'Chair, Anesthesiology & Critical Care', lens: 'clinical', roles: [], source: L1,
      focus: 'Critical care and perioperative safety: deterioration, rapid response and OR readiness.', useCases: ['deterioration', 'or-video', 'fall-elopement'] },
    // Technology (network & security lens)
    { id: 'akhter', name: 'Shakeeb Akhter', title: 'EVP, Chief Digital Officer and Head of Technology', lens: 'network', lead: true, roles: ['cio', 'cdo', 'cmio', 'ciso'], source: { label: 'mskcc.org · MSK appoints Shakeeb Akhter as Chief Digital Officer', url: 'https://www.mskcc.org/news-releases/mskcc-appoints-shakeeb-akhter-as-chief-digital-officer', date: 'May 2026' },
      focus: 'Digital and technology: infrastructure resilience, Epic performance, security, and AI that is safe, governed and running where it is needed.' },
  ];
  MSK.leaderMap = Object.fromEntries(MSK.leaders.map((l) => [l.id, l]));
})();
