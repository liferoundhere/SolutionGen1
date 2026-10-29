/* MSK York Avenue campus model (illustrative). Units: meters. +x = east (toward East River), -z = north (uptown). */
(function () {
  const MSK = (window.MSK = window.MSK || {});
  const ST = (n) => (67 - n) * 70; // z of street centerline (E 67th St = 0)
  const AV = { second: -460, first: -230, york: 0, fdr: 240 };
  const GEO = (MSK.geo = {
    ST, AV, streetW: 14, aveW: 24, fdrW: 20, riverX: 256, corrW: 4,
    streetsWest: [], streetsEast: [61, 62, 63, 70, 71, 72, 73, 74, 75], fdrRamps: [61, 63, 71, 73],
    zMin: ST(75) - 60, zMax: ST(60) + 40, xMin: -470, xMax: AV.fdr + 14,
  });
  for (let n = 60; n <= 75; n++) GEO.streetsWest.push(n);

  // ---------- room program helpers ----------
  const R = (code, name, type, w = 1) => ({ code, name, type, w });
  function inpatient(n, unit, opts = {}) {
    const p = (i) => R(`${n}${String(i).padStart(2, '0')}`, `Room ${n}${String(i).padStart(2, '0')}`, opts.icu ? 'icu' : 'patient', 1);
    const north = [R('STW', 'West Stairwell', 'stair', 0.45)];
    for (let i = 1; i <= 12; i++) north.push(p(i));
    north.push(R('FAM', opts.kids ? 'Family Lounge & Playroom' : 'Family Lounge', 'lounge', 0.9));
    const south = [R('NS', 'Nurse Station', 'clinical', 1.3), R('MED', 'Medication Room', 'pharmacy', 0.7), R('CLEAN', 'Clean Utility', 'storage', 0.6)];
    for (let i = 13; i <= 24; i++) south.push(p(i));
    south.push(R('SOIL', 'Soiled Utility', 'utility', 0.5), R('EQ', 'Equipment Alcove', 'storage', 0.6), R('IDF', 'IDF Network Closet', 'it', 0.4), R('BRK', 'Staff Lounge', 'lounge', 0.7), R('STE', 'East Stairwell', 'stair', 0.45));
    return { n, label: String(n), name: unit, kind: opts.icu ? 'icu' : 'inpatient', north, south };
  }
  function labFloor(n, name) {
    return { n, label: String(n), name, kind: 'lab',
      north: [R('LABA', 'Research Lab A', 'lab', 1.3), R('LABB', 'Research Lab B', 'lab', 1.3), R('COLD', 'Cold Room & −80°C Freezers', 'storage', 0.8), R('OFF', 'Investigator Offices', 'office', 1.1)],
      south: [R('LABC', 'Research Lab C', 'lab', 1.3), R('EQUIP', 'Shared Instrument Core', 'lab', 1.0), R('TC', 'Tissue Culture Suite', 'lab', 0.9), R('IDF', 'IDF Network Closet', 'it', 0.4), R('LABD', 'Research Lab D', 'lab', 1.2)] };
  }
  function clinicFloor(n, name) {
    const north = [R('WAIT', `${name} · Waiting`, 'waiting', 1.4), R('CHK', 'Check-in & Spaces Kiosk', 'admin', 0.8)];
    for (let i = 1; i <= 8; i++) north.push(R('EX' + String(i).padStart(2, '0'), `Exam Room ${n}-${i}`, 'exam', 0.7));
    const south = [R('NS', 'Clinical Team Station', 'clinical', 1.1)];
    for (let i = 9; i <= 16; i++) south.push(R('EX' + String(i).padStart(2, '0'), `Exam Room ${n}-${i}`, 'exam', 0.7));
    south.push(R('TELE', 'Webex Telehealth Studio', 'office', 0.8), R('IDF', 'IDF Network Closet', 'it', 0.4));
    return { n, label: String(n), name: name + ' Clinic', kind: 'clinic', north, south };
  }
  function infusionFloor(n, name) {
    const north = [R('INFW', 'Infusion Waiting', 'waiting', 1.2)], south = [R('NS', 'Infusion Nurse Station', 'clinical', 1.1), R('RXSAT', 'Pharmacy Satellite', 'pharmacy', 0.8)];
    for (let i = 1; i <= 10; i++) north.push(R('INF' + String(i).padStart(2, '0'), `Infusion Suite ${n}-${i}`, 'infusion', 0.7));
    for (let i = 11; i <= 18; i++) south.push(R('INF' + String(i).padStart(2, '0'), `Infusion Suite ${n}-${i}`, 'infusion', 0.7));
    south.push(R('EQ', 'Pump & Equipment Alcove', 'storage', 0.6), R('IDF', 'IDF Network Closet', 'it', 0.4));
    return { n, label: String(n), name, kind: 'infusion', north, south };
  }
  const mech = (n, name = 'Mechanical Penthouse') => ({ n, label: String(n), name, kind: 'mech',
    north: [R('CHILL', 'Chiller Plant', 'mech', 2), R('AHU1', 'Air Handling Unit 1 (OR supply)', 'mech', 1.4), R('AHU2', 'Air Handling Unit 2', 'mech', 1.4)],
    south: [R('GEN', 'Emergency Generator Switchgear', 'mech', 1.6), R('BMS', 'Building Management System (BMS)', 'it', 1.0), R('ELEVM', 'Elevator Machine Room', 'mech', 1.0), R('IDF', 'IDF Network Closet', 'it', 0.5)] });

  // ---------- Memorial Hospital program ----------
  const MH_UNITS = {
    7: 'Gynecologic & Surgical Inpatient', 8: 'Thoracic Surgery', 9: 'MSK Kids · Pediatric Oncology', 10: 'Head & Neck · Plastic Surgery',
    11: 'GI & Hepatobiliary Surgery', 12: 'Urology & Kidney Surgery', 13: 'Breast & Gynecologic Medicine', 14: 'Medical Oncology · Hospital Medicine',
    15: 'Leukemia Service', 16: 'Lymphoma & Myeloma', 17: 'Bone Marrow Transplant (BMT)', 18: 'Neuro-Oncology', 19: 'Supportive & Palliative Care',
  };
  const ucc = []; for (let i = 1; i <= 6; i++) ucc.push(R('UCC' + i, 'UCC Treatment Bay ' + i, 'ucc', 0.55));
  const preop = []; for (let i = 1; i <= 8; i++) preop.push(R('PREOP' + i, 'Pre-op Bay ' + i, 'preop', 0.55));
  const ors1 = [], ors2 = []; for (let i = 1; i <= 7; i++) ors1.push(R('OR' + i, 'Operating Room ' + i, 'or', 1)); for (let i = 8; i <= 12; i++) ors2.push(R('OR' + i, 'Operating Room ' + i, 'or', 1));
  const icuN = [R('STW', 'West Stairwell', 'stair', 0.45)], icuS = [R('NS', 'ICU Nurse Station', 'clinical', 1.3), R('MED', 'Medication Room', 'pharmacy', 0.7), R('CRASH', 'Crash Cart Alcove', 'storage', 0.5)];
  for (let i = 1; i <= 10; i++) icuN.push(R('5' + String(i).padStart(2, '0'), 'ICU Room 5' + String(i).padStart(2, '0'), 'icu', 1));
  for (let i = 11; i <= 18; i++) icuS.push(R('5' + i, 'ICU Room 5' + i, 'icu', 1));
  icuN.push(R('FAM', 'ICU Family Lounge', 'lounge', 0.9)); icuS.push(R('EQ', 'Equipment Alcove', 'storage', 0.6), R('IDF', 'IDF Network Closet', 'it', 0.4), R('STE', 'East Stairwell', 'stair', 0.45));

  const MH_LEVELS = [
    { n: -1, label: 'B1', name: 'Support Services · Food & Nutrition · Robotics', kind: 'support',
      north: [R('KITCHEN', 'Main Kitchen · Food & Nutrition', 'kitchen', 2.2), R('TRAY', 'Tray Line & Room-Service Call Center', 'kitchen', 1.5), R('ROBOT', 'Delivery Robot Hub & Charging', 'robot', 1.1), R('DEPOT', 'Mobile Equipment Depot', 'storage', 1.3), R('MATL', 'Materials Management', 'storage', 1.4)],
      south: [R('CSP', 'Central Sterile Processing', 'clinical', 2.0), R('BIOMED', 'Clinical Engineering (Biomed) Shop', 'support', 1.4), R('MDF', 'Main Distribution Frame · Network Core', 'it', 1.0), R('LINEN', 'Linen & EVS Hub', 'support', 1.2), R('DECD', 'Decedent Care', 'support', 0.6)] },
    { n: 1, label: '1', name: 'Main Lobby · Admitting · Urgent Care Center', kind: 'lobby',
      north: [R('DOCK', 'Loading Dock & Receiving (E 68th St)', 'dock', 1.3), R('SEC', 'Public Safety Command Center', 'security', 1.2), R('LOST', 'Security Desk · Lost & Found', 'security', 0.8), R('REG', 'Admitting & Patient Registration', 'admin', 1.5), R('WELCOME', 'Welcome Desk · Visitor Check-in', 'lobby', 1.2), R('GIFT', 'Gift Shop', 'retail', 0.7), R('CAFE', 'Café 1275', 'retail', 1.1), R('LOBBY', 'Main Lobby (York Avenue)', 'lobby', 2.2)],
      south: [R('AMB', 'Ambulance Bay Vestibule', 'ucc', 0.8), ...ucc, R('UCCNS', 'UCC Nurse Station', 'clinical', 0.8), R('UCCT', 'UCC Triage', 'ucc', 0.8), R('UCCW', 'Urgent Care Center · Waiting', 'waiting', 1.4), R('LAB', 'Outpatient Lab Draw', 'clinical', 1.0), R('RXO', 'Outpatient Pharmacy', 'pharmacy', 0.9), R('CHAPEL', 'Interfaith Chapel', 'lounge', 0.7), R('DISCH', 'Discharge Lounge & Patient Pickup', 'lounge', 1.2)] },
    { n: 2, label: '2', name: 'Surgical Admissions · Pre-op · Surgical Waiting', kind: 'surgical',
      north: [R('PRESURG', 'Pre-Surgical Testing', 'clinical', 1.2), R('CONS1', 'Surgeon Family Consult Room 1', 'office', 0.6), R('CONS2', 'Surgeon Family Consult Room 2', 'office', 0.6), R('FAMW', 'Family Surgical Waiting Lounge', 'waiting', 1.6), R('SURGCHK', 'Surgical Check-in Desk', 'admin', 1.0), R('SURGWAIT', 'Surgical Waiting Room', 'waiting', 1.8)],
      south: [...preop, R('ANES', 'Anesthesia Pre-op Assessment', 'clinical', 0.9), R('SDH', 'Surgical Day Hospital Nurse Station', 'clinical', 1.0), R('LOCK', 'Patient Belongings & Lockers', 'storage', 0.7), R('IDF', 'IDF Network Closet', 'it', 0.4)] },
    { n: 3, label: '3', name: 'Operating Rooms · PACU', kind: 'or',
      north: [R('EQ', 'OR Equipment Alcove', 'storage', 0.6), ...ors1],
      south: [...ors2, R('STER', 'Sterile Core', 'clinical', 0.9), R('ORDESK', 'OR Control Desk', 'admin', 0.8), R('PACU', 'Post-Anesthesia Care Unit (PACU)', 'pacu', 2.0), R('IDF', 'IDF Network Closet', 'it', 0.4)] },
    { n: 4, label: '4', name: 'Imaging · Interventional Radiology', kind: 'imaging',
      north: [R('CT1', 'CT Scanner 1', 'imaging', 1), R('CT2', 'CT Scanner 2', 'imaging', 1), R('MRI1', 'MRI 1 (3T)', 'imaging', 1.2), R('MRI2', 'MRI 2 (1.5T)', 'imaging', 1.2), R('READ', 'AI-Assisted Radiology Reading Room', 'office', 1.2), R('IMGW', 'Imaging Waiting', 'waiting', 1.0)],
      south: [R('IR1', 'Interventional Radiology Suite 1', 'or', 1.2), R('IR2', 'Interventional Radiology Suite 2', 'or', 1.2), R('US1', 'Ultrasound 1', 'imaging', 0.7), R('US2', 'Ultrasound 2', 'imaging', 0.7), R('PET', 'PET/CT', 'imaging', 1.2), R('EQ', 'Imaging Equipment Alcove', 'storage', 0.6), R('IDF', 'IDF Network Closet', 'it', 0.4)] },
    { n: 5, label: '5', name: 'Surgical & Medical ICU', kind: 'icu', north: icuN, south: icuS },
    { n: 6, label: '6', name: 'Integrated Operations Center · Inpatient Pharmacy', kind: 'ops',
      north: [R('CMD', 'Hospital Operations Command Center', 'ops', 2.2), R('NOC', 'Network & Security Operations Center (NOC/SOC)', 'it', 1.8), R('AIOPS', 'AI Governance & Platform Team', 'office', 1.0), R('WEBEXCC', 'Patient Access Contact Center (Webex)', 'office', 1.6)],
      south: [R('RXIN', 'Inpatient Pharmacy', 'pharmacy', 2.0), R('RXCOLD', 'Pharmacy Cold Chain (Chemo & Biologics)', 'pharmacy', 1.0), R('IVROOM', 'Sterile Compounding (IV Room)', 'pharmacy', 1.2), R('LABSTAT', 'STAT Core Lab', 'clinical', 1.2), R('IDF', 'IDF Network Closet', 'it', 0.5)] },
  ];
  for (let n = 7; n <= 19; n++) MH_LEVELS.push(inpatient(n, MH_UNITS[n], { kids: n === 9 }));
  MH_LEVELS.push(mech(20));

  // ---------- Koch Center program ----------
  const KOCH_CLINICS = ['Breast Medicine', 'GI Oncology', 'Thoracic Oncology', 'Genitourinary Oncology', 'Melanoma & Skin', 'Gynecologic Oncology', 'Head & Neck Oncology', 'Lymphoma', 'Leukemia', 'Myeloma', 'Sarcoma', 'Neuro-Oncology', 'Survivorship', 'Cancer Genetics', 'Integrative Medicine', 'Early Drug Development'];
  const KOCH_LEVELS = [
    { n: 1, label: '1', name: 'Lobby & Welcome (E 74th St)', kind: 'lobby',
      north: [R('SEC', 'Security Desk', 'security', 0.6), R('CAFE', 'Café', 'retail', 1.0), R('WELCOME', 'Welcome & Check-in', 'lobby', 1.2), R('LOBBY', 'Koch Center Lobby', 'lobby', 2.2)],
      south: [R('PHARM', 'Outpatient Pharmacy', 'pharmacy', 1.0), R('LAB', 'Lab Draw', 'clinical', 1.2), R('RESOURCE', 'Patient & Caregiver Resource Center', 'lounge', 1.2), R('VALET', 'Valet & Rideshare Lounge', 'lounge', 1.0), R('IDF', 'IDF Network Closet', 'it', 0.4)] },
    { n: 2, label: '2', name: 'Diagnostic Imaging', kind: 'imaging',
      north: [R('IMGW', 'Imaging Waiting', 'waiting', 1.2), R('CT1', 'CT Scanner 1', 'imaging', 1), R('CT2', 'CT Scanner 2', 'imaging', 1), R('MRI1', 'MRI 1', 'imaging', 1.2)],
      south: [R('MAMMO', 'Mammography', 'imaging', 1), R('US1', 'Ultrasound 1', 'imaging', 0.7), R('US2', 'Ultrasound 2', 'imaging', 0.7), R('PET', 'PET/CT', 'imaging', 1.2), R('IDF', 'IDF Network Closet', 'it', 0.4)] },
    infusionFloor(3, 'Infusion A'), infusionFloor(4, 'Infusion B'), infusionFloor(5, 'Infusion C · Cellular Therapy'),
  ];
  KOCH_CLINICS.forEach((c, i) => KOCH_LEVELS.push(clinicFloor(6 + i, c)));
  KOCH_LEVELS.push({ n: 22, label: '22', name: 'Education & Conference Center', kind: 'office', north: [R('CONF', 'Conference Center', 'office', 2), R('SIM', 'Simulation Lab', 'lab', 1.2)], south: [R('AUD', 'Auditorium', 'office', 2.2), R('IDF', 'IDF Network Closet', 'it', 0.4)] });
  KOCH_LEVELS.push(mech(23));

  // ---------- Zuckerman Research Center ----------
  const ZRC_LEVELS = [
    { n: -1, label: 'B1', name: 'Research Data Center · Cisco Secure AI Factory', kind: 'datacenter',
      north: [R('AIPOD', 'Cisco Secure AI Factory · AI PODs (NVIDIA)', 'it', 2.2), R('STOR', 'AI Data Platform Storage', 'it', 1.2)],
      south: [R('RCORE', 'Research Network Core (Nexus Hyperfabric)', 'it', 1.4), R('UPS', 'UPS & Liquid Cooling', 'mech', 1.4), R('AIOC', 'AI Factory Ops Console', 'office', 1.0)] },
    { n: 1, label: '1', name: 'Lobby & Badge Security (E 68th St)', kind: 'lobby',
      north: [R('LOBBY', 'Zuckerman Lobby', 'lobby', 2), R('SEC', 'Badge Turnstiles & Security', 'security', 1)],
      south: [R('AUD', 'Auditorium', 'office', 2), R('CAFE', 'Café', 'retail', 1), R('IDF', 'IDF Network Closet', 'it', 0.4)] },
  ];
  for (let n = 2; n <= 22; n++) ZRC_LEVELS.push(labFloor(n, ['Cancer Biology & Genetics', 'Computational Oncology', 'Immunology', 'Molecular Pharmacology', 'Structural Biology', 'Cell Biology', 'Developmental Biology'][n % 7]));
  ZRC_LEVELS.push(mech(23));

  const RRL_LEVELS = [{ n: 1, label: '1', name: 'Lobby (E 67th St)', kind: 'lobby', north: [R('LOBBY', 'Rockefeller Labs Lobby', 'lobby', 2), R('SEC', 'Security', 'security', 0.8)], south: [R('SHIP', 'Shipping & Receiving', 'dock', 1.2), R('IDF', 'IDF Network Closet', 'it', 0.4)] }];
  for (let n = 2; n <= 17; n++) RRL_LEVELS.push(labFloor(n, ['Molecular Biology', 'Chemical Biology', 'Experimental Therapeutics', 'Human Oncology & Pathogenesis'][n % 4]));
  RRL_LEVELS.push(mech(18));

  const JR_LEVELS = [
    { n: 1, label: '1', name: 'Lobby & Surgical Check-in', kind: 'lobby', north: [R('SEC', 'Security Desk', 'security', 0.6), R('CHK', 'Surgical Check-in', 'admin', 1.2), R('LOBBY', 'Josie Robertson Lobby', 'lobby', 2.0)], south: [R('FAMW', 'Family Waiting Lounge', 'waiting', 1.6), R('CAFE', 'Café', 'retail', 0.8), R('IDF', 'IDF Network Closet', 'it', 0.4)] },
    { n: 2, label: '2', name: 'Pre-op & Surgical Waiting', kind: 'surgical', north: [R('SURGWAIT', 'Surgical Waiting', 'waiting', 1.8), R('ANES', 'Anesthesia Assessment', 'clinical', 0.9)], south: [1, 2, 3, 4, 5, 6, 7, 8].map((i) => R('PREOP' + i, 'Pre-op Bay ' + i, 'preop', 0.55)) },
    { n: 3, label: '3', name: 'Operating Rooms (12 ORs)', kind: 'or', north: [1, 2, 3, 4, 5, 6].map((i) => R('OR' + i, 'Operating Room ' + i, 'or', 1)), south: [7, 8, 9, 10, 11, 12].map((i) => R('OR' + i, 'Operating Room ' + i, 'or', 1)).concat([R('STER', 'Sterile Core', 'clinical', 0.8)]) },
    { n: 4, label: '4', name: 'Recovery (PACU)', kind: 'pacu', north: [R('PACU', 'PACU', 'pacu', 2.4), R('NS', 'Recovery Nurse Station', 'clinical', 1)], south: [1, 2, 3, 4, 5, 6, 7, 8].map((i) => R('REC' + i, 'Recovery Bay ' + i, 'pacu', 0.6)) },
    { n: 5, label: '5', name: 'Overnight Recovery Suites', kind: 'inpatient', north: [1, 2, 3, 4, 5, 6, 7, 8].map((i) => R('5' + String(i).padStart(2, '0'), 'Suite 5' + String(i).padStart(2, '0'), 'patient', 1)), south: [R('NS', 'Nurse Station', 'clinical', 1.2)].concat([9, 10, 11, 12, 13, 14].map((i) => R('5' + i, 'Suite 5' + i, 'patient', 1))) },
  ];
  for (let n = 6; n <= 15; n++) JR_LEVELS.push({ n, label: String(n), name: 'Surgical Services Offices', kind: 'office', north: [R('OFF', 'Offices', 'office', 2), R('CONF', 'Conference', 'office', 1)], south: [R('WORK', 'Workroom', 'office', 2), R('IDF', 'IDF Network Closet', 'it', 0.4)] });
  JR_LEVELS.push(mech(16));

  // ---------- buildings ----------
  const B = [
    { id: 'MH', name: 'Memorial Hospital', short: 'Memorial Hospital', address: '1275 York Avenue (E 67th–68th St)', msk: true,
      x0: -185, x1: -17, z0: ST(68) + 11, z1: ST(67) - 11, floorH: 4.6,
      tower: { from: 5, x0: -168, x1: -36, z0: ST(68) + 15, z1: ST(67) - 15 },
      cores: [{ id: 'A', x: -98, label: 'Main Elevator Bank' }, { id: 'S', x: -152, label: 'Service & Robot Elevators' }],
      entrances: [
        { id: 'main', label: 'Main Entrance · York Avenue', side: 'east', level: 1, room: 'LOBBY', curb: 'curb/main' },
        { id: 'ucc', label: 'Urgent Care Center · E 67th St', side: 'south', level: 1, room: 'UCCW', curb: 'curb/ucc' },
        { id: 'amb', label: 'Ambulance Bay · E 67th St', side: 'south', level: 1, room: 'AMB', curb: 'curb/amb' },
        { id: 'dock', label: 'Loading Dock · E 68th St', side: 'north', level: 1, room: 'DOCK', curb: 'curb/dock' },
        { id: 'disch', label: 'Patient Pickup · E 67th St', side: 'south', level: 1, room: 'DISCH', curb: 'curb/disch' },
      ],
      levels: MH_LEVELS,
      blurb: 'MSK’s flagship inpatient hospital on York Avenue: Urgent Care Center, main operating rooms, ICU, MSK Kids and 13 inpatient units. In this twin it also hosts the Integrated Operations Center where Cisco Cloud Control and Splunk tie every system together.' },
    { id: 'ZRC', name: 'Mortimer B. Zuckerman Research Center', short: 'Zuckerman Research', address: '417 E 68th Street', msk: true,
      x0: -168, x1: -62, z0: ST(69) + 11, z1: ST(68) - 11, floorH: 4.3,
      cores: [{ id: 'A', x: -115, label: 'Elevators' }],
      entrances: [{ id: 'main', label: 'Entrance · E 68th St', side: 'south', level: 1, room: 'LOBBY', curb: 'curb/zrc' }],
      levels: ZRC_LEVELS,
      blurb: '23-story research tower with 100+ labs. In this scenario its lower level hosts an on-prem Cisco Secure AI Factory (AI PODs with NVIDIA) so PHI-bearing AI workloads never leave MSK.' },
    { id: 'RRL', name: 'Rockefeller Research Laboratories', short: 'Rockefeller Labs', address: '430 E 67th Street', msk: true,
      x0: -172, x1: -82, z0: ST(67) + 11, z1: ST(66) - 11, floorH: 4.3,
      cores: [{ id: 'A', x: -127, label: 'Elevators' }],
      entrances: [{ id: 'main', label: 'Entrance · E 67th St', side: 'north', level: 1, room: 'LOBBY', curb: 'curb/rrl' }],
      levels: RRL_LEVELS,
      blurb: 'Sloan Kettering Institute research building across E 67th St from the hospital.' },
    { id: 'KOCH', name: 'David H. Koch Center for Cancer Care', short: 'Koch Center', address: '530 E 74th Street', msk: true,
      x0: 22, x1: 168, z0: ST(74) + 11, z1: ST(73) - 11, floorH: 4.4,
      cores: [{ id: 'A', x: 95, label: 'Elevators' }],
      entrances: [{ id: 'main', label: 'Main Entrance · E 74th St', side: 'north', level: 1, room: 'LOBBY', curb: 'curb/koch' }, { id: 'york', label: 'York Ave Entrance', side: 'west', level: 1, room: 'SEC', curb: 'curb/koch-york' }],
      levels: KOCH_LEVELS,
      blurb: '23-story, ~750,000 sq ft outpatient cancer center between E 73rd & 74th Streets: infusion, imaging and multidisciplinary clinics designed around the patient.' },
    { id: 'JRSC', name: 'Josie Robertson Surgery Center', short: 'Josie Robertson', address: '1133 York Avenue (E 61st–62nd St)', msk: true,
      x0: -122, x1: -17, z0: ST(62) + 11, z1: ST(61) - 11, floorH: 4.6,
      cores: [{ id: 'A', x: -70, label: 'Elevators' }],
      entrances: [{ id: 'main', label: 'Main Entrance · York Avenue', side: 'east', level: 1, room: 'LOBBY', curb: 'curb/jrsc' }],
      levels: JR_LEVELS,
      blurb: 'MSK’s ambulatory surgery center with 12 operating rooms and overnight recovery suites, built for same-day and short-stay procedures.' },
  ];

  // ---------- layout computation ----------
  function rectFor(b, n) { return b.tower && n >= b.tower.from ? b.tower : b; }
  function levelY(b, n) { return n >= 1 ? (n - 1) * b.floorH : n * b.floorH; }
  function layoutSide(rooms, xa, xb, gaps) {
    // split [xa,xb] into segments around gaps; assign rooms to segments by cumulative weight midpoint
    const segs = []; let cur = xa;
    gaps.slice().sort((a, b) => a[0] - b[0]).forEach(([g0, g1]) => { if (g0 > cur) segs.push([cur, g0]); cur = Math.max(cur, g1); });
    if (cur < xb) segs.push([cur, xb]);
    const total = segs.reduce((a, s) => a + (s[1] - s[0]), 0);
    const W = rooms.reduce((a, r) => a + r.w, 0);
    const bySeg = segs.map(() => []); let acc = 0;
    rooms.forEach((r) => {
      const mid = ((acc + r.w / 2) / W) * total; acc += r.w;
      let off = 0, si = 0;
      for (si = 0; si < segs.length; si++) { const L = segs[si][1] - segs[si][0]; if (mid <= off + L || si === segs.length - 1) break; off += L; }
      bySeg[si].push(r);
    });
    const out = [];
    segs.forEach((s, i) => {
      let list = bySeg[i];
      if (!list.length) list = [R('SUP' + i, 'Support Space', 'support', 1)];
      const w = list.reduce((a, r) => a + r.w, 0); let x = s[0];
      list.forEach((r) => { const len = ((s[1] - s[0]) * r.w) / w; out.push({ ...r, x0: x, x1: x + len }); x += len; });
    });
    return out;
  }
  B.forEach((b) => {
    b.levelMap = {};
    b.height = Math.max(...b.levels.map((l) => l.n)) * b.floorH;
    b.levels.forEach((L) => {
      const rc = rectFor(b, L.n);
      L.rect = { x0: rc.x0, x1: rc.x1, z0: rc.z0, z1: rc.z1 };
      L.y = levelY(b, L.n); L.b = b.id; L.key = b.id + '/' + L.n;
      L.zc = (rc.z0 + rc.z1) / 2;
      const cw = GEO.corrW / 2;
      const gaps = b.cores.map((c) => [c.x - 6, c.x + 6]);
      const xa = rc.x0 + 1, xb = rc.x1 - 1;
      const north = layoutSide(L.north, xa, xb, gaps).map((r) => ({ ...r, side: 'n', z0: rc.z0 + 0.6, z1: L.zc - cw }));
      const south = layoutSide(L.south, xa, xb, gaps).map((r) => ({ ...r, side: 's', z0: L.zc + cw, z1: rc.z1 - 0.6 }));
      L.rooms = north.concat(south).map((r) => ({ ...r, b: b.id, level: L.n, levelLabel: L.label, y: L.y, cx: (r.x0 + r.x1) / 2, cz: (r.z0 + r.z1) / 2, key: `${b.id}/${L.n}/${r.code}` }));
      L.roomMap = {}; L.rooms.forEach((r) => (L.roomMap[r.code] = r));
      L.coreNodes = b.cores.map((c) => ({ id: c.id, x: c.x, z: L.zc }));
      b.levelMap[L.n] = L;
    });
    // entrances: door point on facade aligned with room center
    b.entrances.forEach((e) => {
      const L = b.levelMap[e.level]; const r = L.roomMap[e.room];
      if (e.side === 'east') e.door = { x: L.rect.x1, z: r.cz };
      else if (e.side === 'west') e.door = { x: L.rect.x0, z: r.cz };
      else if (e.side === 'north') e.door = { x: r.cx, z: L.rect.z0 };
      else e.door = { x: r.cx, z: L.rect.z1 };
      const o = 3.5; const d = { east: [o, 0], west: [-o, 0], north: [0, -o], south: [0, o] }[e.side];
      e.outside = { x: e.door.x + d[0], z: e.door.z + d[1] };
      e.roomKey = `${b.id}/${e.level}/${e.room}`;
    });
  });

  // ---------- non-MSK landmarks (context) ----------
  const LANDMARKS = [
    { id: 'NYP', name: 'NewYork-Presbyterian / Weill Cornell', x0: 17, x1: 228, z0: ST(70) + 11, z1: ST(68) - 11,
      masses: [{ x0: 40, x1: 110, z0: -175, z1: -110, h: 118, crown: true }, { x0: 17, x1: 60, z0: -199, z1: -81, h: 58 }, { x0: 110, x1: 200, z0: -199, z1: -140, h: 72 }, { x0: 110, x1: 228, z0: -138, z1: -81, h: 46 }, { x0: 200, x1: 228, z0: -199, z1: -140, h: 34 }] },
    { id: 'RU', name: 'The Rockefeller University', x0: 17, x1: 228, z0: ST(68) + 11, z1: ST(63) - 11, campus: true,
      masses: [{ x0: 30, x1: 70, z0: 120, z1: 200, h: 38 }, { x0: 150, x1: 215, z0: 30, z1: 90, h: 24 }, { x0: 120, x1: 205, z0: 210, z1: 255, h: 30 }, { x0: 26, x1: 60, z0: -50, z1: 10, h: 54 }], dome: { x: 110, z: 150, r: 16 } },
    { id: 'HSS', name: 'Hospital for Special Surgery', x0: 60, x1: 228, z0: ST(71) + 11, z1: ST(70) - 11, masses: [{ x0: 60, x1: 160, z0: -269, z1: -221, h: 82 }, { x0: 160, x1: 228, z0: -269, z1: -221, h: 52 }] },
  ];

  // ---------- named outdoor locations ----------
  const OUT = {};
  const addOut = (key, x, z, label, kind = 'outdoor', extra = {}) => (OUT[key] = { key, x, y: 0, z, label, kind, ...extra });
  addOut('curb/main', -8, B[0].entrances[0].door.z, 'York Ave Drop-off · MH Main Entrance', 'curb');
  addOut('curb/ucc', B[0].entrances[1].door.x, ST(67) + 3.5, 'E 67th St · UCC Walk-in', 'curb');
  addOut('curb/amb', B[0].entrances[2].door.x, ST(67) + 3.5, 'E 67th St · Ambulance Bay', 'curb');
  addOut('curb/dock', B[0].entrances[3].door.x, ST(68) - 3.5, 'E 68th St · Loading Dock', 'curb');
  addOut('curb/disch', B[0].entrances[4].door.x, ST(67) + 3.5, 'E 67th St · Patient Pickup Zone', 'curb');
  addOut('curb/zrc', B[1].entrances[0].door.x, ST(68) - 3.5, 'E 68th St · Zuckerman', 'curb');
  addOut('curb/rrl', B[2].entrances[0].door.x, ST(67) + 3.5, 'E 67th St · Rockefeller Labs', 'curb');
  addOut('curb/koch', B[3].entrances[0].door.x, ST(74) + 3.5, 'E 74th St · Koch Center Drop-off', 'curb');
  addOut('curb/koch-york', 8, B[3].entrances[1].door.z, 'York Ave · Koch Center', 'curb');
  addOut('curb/jrsc', -8, B[4].entrances[0].door.z, 'York Ave Drop-off · Josie Robertson', 'curb');
  addOut('bus/york-68', 15, ST(68) + 16, 'M31 Bus Stop · York Ave & E 68th St', 'transit');
  addOut('bus/york-72', -15, ST(72) - 16, 'M31 Bus Stop · York Ave & E 72nd St', 'transit');
  addOut('walk/york-67', -14.5, ST(67) - 9, 'York Ave & E 67th St (NW corner)', 'outdoor');
  addOut('garage/66', -205, 35, 'Public Parking Garage · E 66th St', 'garage');
  addOut('esplanade/67', 250, 0, 'East River Esplanade', 'outdoor');
  addOut('edge/west-68', -470, ST(68), 'Westbound · E 68th St', 'edge');
  addOut('edge/west-67', -470, ST(67), 'E 67th St (from 2nd Ave)', 'edge');
  addOut('edge/south-york', 0, GEO.zMax - 10, 'York Ave (from Queensboro Bridge)', 'edge');
  addOut('edge/north-york', 0, GEO.zMin + 10, 'York Ave (Uptown)', 'edge');
  addOut('edge/fdr-north', AV.fdr, GEO.zMin - 40, 'FDR Drive · Northbound', 'edge');
  addOut('edge/fdr-south', AV.fdr, GEO.zMax + 40, 'FDR Drive · Southbound', 'edge');
  addOut('infra/coned', -230, ST(70), 'Con Edison Feeder Network (Yorkville)', 'infra');
  addOut('infra/fdr-flood', AV.fdr, ST(70), 'FDR Drive @ 70th · Flood-prone segment', 'infra');
  addOut('infra/carrier', -340, ST(65), 'Carrier Fiber Route (1st Ave conduit)', 'infra');

  MSK.campus = { buildings: B, buildingMap: Object.fromEntries(B.map((b) => [b.id, b])), landmarks: LANDMARKS, outdoor: OUT };

  // ---------- location resolver ----------
  // keys: "MH/12/1214" (room), "MH/12" (level center / core), "MH" (building lobby), or outdoor keys like "curb/main"
  MSK.loc = function (key) {
    if (!key) return null;
    if (typeof key === 'object') return key;
    if (OUT[key]) return OUT[key];
    const [bid, lv, code] = key.split('/');
    const b = MSK.campus.buildingMap[bid];
    if (!b) return null;
    if (lv == null) { const e = b.entrances[0]; return MSK.loc(e.roomKey); }
    const L = b.levelMap[Number(lv)] || b.levelMap[lv === 'B1' ? -1 : NaN];
    if (!L) return null;
    if (code == null) return { key, b: bid, level: L.n, x: b.cores[0].x, z: L.zc, y: L.y, label: `${b.short} · Floor ${L.label}`, kind: 'level' };
    const r = L.roomMap[code];
    if (!r) return null;
    return { key: r.key, b: bid, level: L.n, x: r.cx, z: r.cz, y: L.y, label: r.name, sub: `${b.short} · Floor ${L.label} · ${L.name}`, kind: 'room', room: r };
  };
  MSK.locLabel = (key) => { const l = MSK.loc(key); return l ? l.label : key; };
  // list all rooms for search
  MSK.allRooms = function () {
    const out = [];
    B.forEach((b) => b.levels.forEach((L) => L.rooms.forEach((r) => { if (!/^SUP/.test(r.code)) out.push({ key: r.key, label: r.name, sub: `${b.short} · Fl ${L.label}`, type: r.type }); })));
    Object.values(OUT).filter((o) => o.kind !== 'edge' && o.kind !== 'infra').forEach((o) => out.push({ key: o.key, label: o.label, sub: 'Outdoor', type: 'outdoor' }));
    return out;
  };
})();
