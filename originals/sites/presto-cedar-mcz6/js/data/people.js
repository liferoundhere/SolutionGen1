/* Persona lenses and the core cast. All people are fictional composites. Scenario files may add people with MSK.registerPeople(). */
(function () {
  const MSK = (window.MSK = window.MSK || {});
  MSK.kindColors = {
    patient: '#60a5fa', family: '#93c5fd', visitor: '#93c5fd', nurse: '#34d399', physician: '#22d3ee', security: '#f59e0b', ops: '#a78bfa',
    it: '#38bdf8', facilities: '#fb923c', biomed: '#fb923c', evs: '#2dd4bf', food: '#fbbf24', transport: '#c084fc', robot: '#e2e8f0', courier: '#84cc16',
    leader: '#f472b6', therapist: '#4ade80', agent: '#5eead4', driver: '#94a3b8',
  };

  MSK.lenses = [
    { id: 'leadership', name: 'Leadership', icon: '◆', color: '#f472b6', persona: 'catherine', home: 'MH/6/CMD',
      focus: 'Priority operations milestones, tasks and insights across the enterprise.',
      questions: ['Are we on track for the FY27 operations milestones?', 'Where are patients waiting, and why?', 'What did resilience investments save us this quarter?', 'Is our AI safe, used and paying back?'] },
    { id: 'hospital', name: 'Hospital Ops', icon: '▦', color: '#a78bfa', persona: 'hannah', home: 'MH/6/CMD',
      focus: 'Patient flow, beds, transport, EVS, food & nutrition, contact center: the operating system of the hospital.',
      questions: ['How long are patients waiting for a bed?', 'Which rooms are dirty, clean or blocked?', 'Are meals and transports on time?', 'What is the discharge-before-noon rate today?'] },
    { id: 'clinical', name: 'Clinical Ops', icon: '✚', color: '#34d399', persona: 'lauren', home: 'MH/3/ORDESK',
      focus: 'Nursing, perioperative, urgent care and clinical engineering: time at the bedside and safe, on-time care.',
      questions: ['Are first-case surgeries starting on time?', 'How much nursing time is lost searching for equipment?', 'Are high-risk patients safe tonight?', 'Is UCC door-to-provider within target?'] },
    { id: 'network', name: 'Network & Security Ops', short: 'Network & Sec', icon: '⌁', color: '#38bdf8', persona: 'priya', home: 'MH/6/NOC',
      focus: 'Networks, clouds, carriers, IoMT, identity and AI security: keeping every clinical system reachable and safe.',
      questions: ['Is Epic healthy end-to-end?', 'Is a problem inside or outside our network?', 'Are any medical devices behaving abnormally?', 'Are AI agents and their identities governed?'] },
    { id: 'facilities', name: 'Facilities', icon: '⌂', color: '#fb923c', persona: 'marcus', home: 'MH/20/BMS',
      focus: 'Power, HVAC, water, cold chain, elevators, space and medical-equipment fleet.',
      questions: ['Are OR temperature and humidity in range?', 'Is the cold chain intact?', 'How is the plant handling the weather?', 'Which spaces are under-used?'] },
    { id: 'security', name: 'Public Safety', icon: '⛨', color: '#f59e0b', persona: 'rosa', home: 'MH/1/SEC',
      focus: 'Safety of patients, visitors and staff: elopement, duress, lost property, access and incident response.',
      questions: ['Where is every at-risk patient right now?', 'How fast do we reach a duress call?', 'Who owns this unattended item?', 'Are visitors where they are allowed to be?'] },
    { id: 'patient', name: 'Patient & Family', icon: '♥', color: '#60a5fa', persona: 'maria', home: 'curb/main',
      focus: 'The experience of the people we serve, from first text to the ride home.',
      questions: ['Do I know where to go?', 'Is someone looking after my belongings and my family?', 'When will I get my room, my meal, my discharge?', 'Can my family find me?'] },
  ];
  MSK.lensMap = Object.fromEntries(MSK.lenses.map((l) => [l.id, l]));

  const P = [
    // ---------------- patient & family ----------------
    { id: 'maria', name: 'Maria Alvarez', kind: 'patient', lens: 'patient', role: 'Patient · Robotic partial nephrectomy', age: 58, home: 'Yonkers, NY',
      why: 'A small tumor was found on Maria’s left kidney during an unrelated scan. Her MSK urologic surgeon recommended a robotic-assisted partial nephrectomy to remove the tumor and save the kidney, with a planned two-night stay on the 12th-floor urology unit.',
      story: ['Maria has been a high-school principal in Yonkers for 19 years. She is organized, she is the one who usually takes care of everyone else, and she has not slept well since the diagnosis.', 'She has never been to the York Avenue campus. Her biggest fears are getting lost, being late, and her family sitting in a waiting room for hours with no news.', 'On surgery morning she arrives by Uber at 5:40 AM with her husband Daniel, an overnight bag and a tote with her reading glasses, phone charger and a framed photo of her grandson.'],
      narrator: 'From the moment Maria’s phone joins the MSK network at the York Avenue curb, Cisco Spaces knows she has arrived and Webex Connect sends a text with blue-dot directions to the Surgical Waiting Room. When she sets her tote down in the lobby and walks away, a Meraki MV camera’s edge AI and Spaces location data link the bag to her, and Security returns it before she reaches the elevator. Webex keeps Daniel and Sofia updated through surgery, Splunk analytics speed up her bed assignment, the Webex Contact Center takes her lunch order through Epic, a Spaces-tracked robot brings it, and on discharge day her paperwork arrives on her phone to review and e-sign. Each touchpoint takes away a reason to worry.',
      quote: '“I expected to feel lost. Instead it felt like the building knew I was coming.”', devices: ['iPhone with MyChart', 'MSK guest Wi-Fi (OpenRoaming)', 'Patient wristband with BLE tag (inpatient)'], cares: ['Not getting lost', 'Her family knowing what is happening', 'Going home on time'] },
    { id: 'daniel', name: 'Daniel Alvarez', kind: 'family', lens: 'patient', role: 'Husband & care partner', age: 61, home: 'Yonkers, NY',
      why: 'Daniel is Maria’s husband and designated care partner. He will wait during surgery, visit on the 12th floor and drive her home.',
      story: ['Daniel is a retired MTA bus mechanic who handles stress by fixing things, and there is nothing to fix in a surgical waiting room.', 'He is hard of hearing in one ear and hates crowded, noisy spaces. Texts work better for him than overhead pages.'],
      narrator: 'Daniel gets surgical milestones by text through Webex Connect: “in the OR”, “surgery complete”, “in recovery”, “room 1214 ready”. Each one comes with a blue-dot link, so he never has to ask the front desk where to go. On discharge day Spaces sees his car approach the E 67th St pickup zone and tells the discharge nurse to bring Maria down. The car door opens three minutes after he arrives.',
      quote: '“Every text came right when I was starting to worry.”', devices: ['Android phone', 'Visitor pass (digital, via Webex Connect)'] },
    { id: 'sofia', name: 'Sofia Alvarez', kind: 'family', lens: 'patient', role: 'Daughter · visiting after work', age: 24, home: 'Astoria, Queens',
      why: 'Sofia, a nurse at a Queens hospital, visits her mother the evening after surgery.',
      story: ['Sofia knows hospitals from the inside, which makes her both reassuring and the family’s toughest critic.', 'She arrives at 6:15 PM on the M31 bus straight from a 12-hour shift.'],
      narrator: 'Sofia checks in from her phone on the bus with a Webex Connect visitor link. Spaces generates a visitor pass and blue-dot directions from the York Ave entrance to Room 1214. Security can see that visitors are where their pass allows, without stopping anyone at the desk.',
      quote: '“As a nurse, I noticed nobody was hunting for anything. That never happens.”', devices: ['iPhone'] },
    { id: 'harold', name: 'Harold Bennett', kind: 'patient', lens: 'patient', role: 'Inpatient · pneumonia during chemotherapy; early Alzheimer’s', age: 81, home: 'Bay Ridge, Brooklyn',
      why: 'Harold was admitted to the 14th-floor medical oncology unit with pneumonia during treatment for lymphoma. He has early-stage Alzheimer’s disease, which can cause confusion at night, especially in an unfamiliar place.',
      story: ['Harold drove the 4 train for 31 years and still talks about the 1977 blackout. At night he sometimes thinks he is late for his shift.', 'His daughter Ellen lives in New Jersey and calls every evening. Her biggest fear is that he will wander and fall.', 'Because of his elopement risk, Harold wears a soft wristband with a Cisco Spaces-compatible BLE tag. It is not a restraint; it is a safety net.'],
      narrator: 'At 2:07 AM Harold leaves Room 1406 looking for “the train”. Cisco Spaces sees his wristband cross the east-stairwell geofence and alerts the charge nurse’s phone and the Public Safety Command Center with his exact location. Officer Andre Williams uses the live blue dot to meet Harold on the 12th-floor landing four minutes later, calm and unharmed. Without location, this becomes a building-wide missing-patient search that can take an hour.',
      quote: '“The young man walked me back and asked me about the 4 train. Nice kid.”', devices: ['Elopement-risk wristband (BLE)', 'Smart bed exit sensor'] },
    { id: 'ellen', name: 'Ellen Bennett', kind: 'family', lens: 'patient', role: 'Harold’s daughter', age: 52, home: 'Montclair, NJ', why: 'Ellen is Harold’s health-care proxy.',
      story: ['Ellen is a CPA who calls her father every evening at 7.'], narrator: 'Ellen gets a calm, factual Webex message the next morning (“Your father had an episode of night-time confusion; he was safe within 4 minutes and is resting”) instead of a 3 AM phone call.', devices: ['iPhone'] },

    // ---------------- leadership ----------------
    { id: 'catherine', name: 'Catherine Wells', kind: 'leader', lens: 'leadership', role: 'EVP & Chief Operating Officer', dept: 'Executive Leadership',
      why: 'Catherine owns hospital operations performance across MSK’s Manhattan campus: patient flow, capacity, resilience and the cost of operations.',
      story: ['Catherine started as an ICU nurse and spent a decade running perioperative services before becoming COO.', 'Her board priorities this fiscal year: grow surgical volume 6% without adding ORs, reach 55% discharge-before-noon, cut equipment rental spend by $2M, and prove that AI investments are safe and paying back.'],
      narrator: 'Catherine does not want more dashboards; she wants fewer surprises. Her Leadership lens in Cisco Cloud Control rolls Splunk analytics into milestone health, open tasks and AI-generated insights she can act on during the 7:30 AM huddle. When a Nor’easter approaches, she sees the predicted impact on surgeries, staffing and supply 18 hours early.',
      quote: '“Show me the three things that will hurt a patient today, and who is fixing them.”' },
    { id: 'ken', name: 'Ken Nakamura', kind: 'leader', lens: 'leadership', role: 'Chief Information Officer', dept: 'Digital & Informatics',
      why: 'Ken owns the digital backbone: Epic, the network, cloud, AI platforms and the Cisco Cloud Control rollout.', story: ['Ken’s mandate is “invisible IT”: technology that clinicians never have to think about.'],
      narrator: 'Ken tracks the Wi-Fi 7 and Spaces rollout floor by floor, Epic service health in Splunk ITSI, and the AI token budget across 11 departments.' },
    { id: 'elena', name: 'Dr. Elena Petrova', kind: 'leader', lens: 'network', role: 'Chief AI Officer', dept: 'AI Governance',
      why: 'Elena chairs MSK’s AI governance council and owns the AI platform: the on-prem Secure AI Factory, cloud model contracts, AI Defense guardrails, Galileo evaluations and the token budget.',
      story: ['A radiation oncologist turned informatician, Elena has one rule: no AI touches a patient workflow until it is evaluated, guarded and observable.', 'She reports AI usage, safety and “tokenomics” to the board each quarter.'],
      narrator: 'Elena’s AI lens combines Cisco AI Defense (guardrails, AI BOM, red-teaming), Galileo evaluations (groundedness, hallucination rate), Astrix (agent identities) and Splunk Agent Observability (tokens, cost, latency) into one governance view. She can show the board which AI is in use where, what it costs per outcome, and that it is safe.',
      quote: '“If we can’t measure it, guard it and switch it off, we don’t deploy it.”' },

    // ---------------- hospital ops ----------------
    { id: 'hannah', name: 'Hannah Brooks', kind: 'ops', lens: 'hospital', role: 'Director, Hospital Operations Command Center', dept: 'Patient Flow',
      why: 'Hannah runs the 24/7 command center on 6 that manages beds, transfers, transport, EVS and capacity for the whole campus.',
      story: ['Hannah came from airline operations, where the job is to move people on time.', 'Her wall of screens used to show 14 separate systems. Now one Cloud Control workspace and a set of Splunk dashboards show where every patient, bed, transporter and robot is.'],
      narrator: 'Splunk forecasts admissions and discharges six hours out, and Cisco Spaces shows real-time room status (occupied, dirty, being cleaned, ready) from EVS badges and bed sensors. Hannah sees bottlenecks before they turn into a crowded UCC.',
      quote: '“A bed isn’t empty until it’s clean, staffed and somebody knows about it.”' },
    { id: 'sam', name: 'Sam Okafor', kind: 'ops', lens: 'hospital', role: 'Bed Placement Manager', dept: 'Patient Flow',
      why: 'Sam assigns every inpatient bed on campus.', story: ['Sam has a spreadsheet habit he is slowly giving up thanks to Splunk.'],
      narrator: 'Sam’s Splunk bed board blends Epic ADT, EVS status from Spaces badges, transport availability and predicted discharges, so he can promise a room time and keep it.' },
    { id: 'nadia', name: 'Nadia Haddad', kind: 'food', lens: 'hospital', role: 'Director, Food & Nutrition Services', dept: 'Food & Nutrition',
      why: 'Nadia’s team serves about 3,000 patient meals a day from the B1 kitchen, room-service style.',
      story: ['Nadia trained as a chef in Beirut and Paris and believes hospital food is part of healing.', 'Her challenges: diet-order accuracy, hot food arriving hot, and elevators shared with everyone else.'],
      narrator: 'Patients order from MyChart or by calling the Webex Contact Center, where agents see Epic diet orders and allergies before taking the order. Spaces tracks every delivery robot and tray cart, Cloud Control coordinates the robots with the service elevators, and Splunk measures order-to-door time.' },
    { id: 'grace', name: 'Grace Kim', kind: 'evs', lens: 'hospital', role: 'Environmental Services Supervisor', dept: 'EVS',
      why: 'Grace leads the night EVS team that turns rooms over for new admissions.', story: ['Grace knows every service elevator’s quirks.'],
      narrator: 'Spaces badges tell Grace’s team which rooms are vacated the moment a patient leaves, and Splunk ranks cleaning priority by which admissions are waiting.' },
    { id: 'luis', name: 'Luis Ortega', kind: 'transport', lens: 'hospital', role: 'Patient Transporter', dept: 'Patient Transport',
      why: 'Luis moves patients between PACU, imaging and inpatient units.', story: ['Luis walks about 11 miles a shift.'],
      narrator: 'Spaces shows Luis the nearest clean wheelchair or stretcher, so he no longer searches three floors before every job.' },
    { id: 'brianna', name: 'Brianna Lee', kind: 'agent', lens: 'hospital', role: 'Patient Access Specialist · Webex Contact Center', dept: 'Patient Access',
      why: 'Brianna handles calls from patients and families, including room-service meal orders and visitor questions.', story: ['Brianna is studying nursing at Hunter College at night.'],
      narrator: 'When a call comes in, Webex Contact Center screen-pops the patient’s Epic record: room, diet order, allergies, care team. The Webex AI Agent handles simple requests on its own and hands complex ones to Brianna with a summary.' },

    // ---------------- clinical ----------------
    { id: 'lauren', name: 'Lauren Fitzgerald', kind: 'nurse', lens: 'clinical', role: 'VP Clinical Operations & Perioperative Services', dept: 'Clinical Operations',
      why: 'Lauren is accountable for OR efficiency, nursing operations and urgent-care throughput.', story: ['Lauren still covers a charge-nurse shift once a quarter so she knows what the floor is really like.'],
      narrator: 'Lauren’s Clinical lens shows first-case on-time starts, PACU holds, nursing minutes lost to searching, and every at-risk patient on campus. Spaces asset tracking is the single biggest driver of time given back to her nurses.',
      quote: '“Every minute a nurse spends looking for a pump is a minute not spent with a patient.”' },
    { id: 'keisha', name: 'Keisha Thompson, RN', kind: 'nurse', lens: 'clinical', role: 'Charge Nurse · 14th Floor Medical Oncology', dept: 'Nursing',
      why: 'Keisha runs the night shift on a 24-bed medical oncology unit.',
      story: ['Keisha has been a nurse for 14 years, 8 of them at MSK. She is the person new nurses call when something goes wrong.', 'Tonight she is short one nurse, has two admissions coming from the UCC, and Harold Bennett in 1406 is restless.'],
      narrator: 'Keisha’s Webex phone gets Spaces alerts for her unit only, with location. When her medication cart goes missing she types “find med cart 14-B” and sees it in Room 1418 in seconds. When Harold wanders she sees his blue dot moving on the map, not just an alarm.' },
    { id: 'ben', name: 'Ben Carter, RN', kind: 'nurse', lens: 'clinical', role: 'Staff Nurse · 12th Floor Urology', dept: 'Nursing', why: 'Ben is Maria’s nurse after surgery.', story: ['Ben is a former Army medic.'],
      narrator: 'Ben’s workstation-on-wheels uses Duo tap-to-badge login, and Spaces lets him find the nearest bladder scanner in one tap.' },
    { id: 'olivia', name: 'Olivia Grant, RN', kind: 'nurse', lens: 'clinical', role: 'Pre-op Nurse · Surgical Day Hospital', dept: 'Perioperative', why: 'Olivia admits Maria in Pre-op Bay 4.', story: ['Olivia is known for warm blankets and bad jokes.'],
      narrator: 'Because Spaces flagged Maria’s arrival 20 minutes before her check-in time, Olivia had Bay 4 ready, and she could see that Daniel was already in the Family Lounge.' },
    { id: 'drchen', name: 'Dr. Michael Chen', kind: 'physician', lens: 'clinical', role: 'Urologic Surgeon', dept: 'Surgery', why: 'Dr. Chen performs Maria’s robotic partial nephrectomy in OR 5.', story: ['Dr. Chen has done more than 1,200 robotic kidney operations.'],
      narrator: 'The surgical robot, anesthesia machines and imaging in OR 5 sit on an ISE-segmented medical network, and Meraki MT sensors confirmed the OR’s humidity and temperature were in range before the first incision.' },
    { id: 'drrahman', name: 'Dr. Aisha Rahman', kind: 'physician', lens: 'clinical', role: 'Anesthesiologist', dept: 'Anesthesiology', why: 'Dr. Rahman manages Maria’s anesthesia.', story: ['Dr. Rahman rides a Citi Bike to work, rain or shine.'], narrator: 'Webex messages from the OR control desk keep Dr. Rahman in sync with PACU bed availability.' },
    { id: 'drOneill', name: 'Dr. James O’Neill', kind: 'physician', lens: 'clinical', role: 'Medical Director, Urgent Care Center', dept: 'Urgent Care', why: 'Dr. O’Neill runs MSK’s cancer-specific urgent care.', story: ['He has seen every kind of chemotherapy complication.'], narrator: 'Splunk forecasts UCC arrivals by hour, and Meraki MV occupancy counts in the waiting room trigger surge staffing before the waiting room is full.' },

    // ---------------- network / IT ----------------
    { id: 'priya', name: 'Priya Raman', kind: 'it', lens: 'network', role: 'Director, Network & Security Operations Center', dept: 'Infrastructure',
      why: 'Priya runs the combined NOC/SOC on 6 that keeps 40,000+ endpoints, Epic connectivity, carrier links and medical devices healthy and secure.',
      story: ['Priya spent eight years at a carrier before healthcare. She knows exactly how carrier networks fail.', 'Her team used to live on bridge calls. Now most incidents start and end in a Cloud Control AI Canvas.'],
      narrator: 'ThousandEyes shows Priya every hop between MSK and Epic’s hosting provider, Webex and cloud AI endpoints; Splunk ITSI shows which clinical services are at risk; AI Canvas pulls the evidence together; Cloud Control executes the fix after she approves it.',
      quote: '“The fastest outage is the one where you know in five minutes it isn’t you, and exactly who it is.”' },
    { id: 'devon', name: 'Devon Marsh', kind: 'it', lens: 'network', role: 'Senior Network Engineer (on-call)', dept: 'Infrastructure', why: 'Devon is on call for the network tonight.', story: ['Devon builds Cloud Control Studio agents in his spare time.'], narrator: 'Devon approves an AI-proposed SD-WAN policy change from his phone in 90 seconds.' },

    // ---------------- facilities ----------------
    { id: 'marcus', name: 'Marcus Johnson', kind: 'facilities', lens: 'facilities', role: 'VP Facilities & Clinical Engineering', dept: 'Facilities',
      why: 'Marcus is responsible for power, HVAC, water, elevators, the cold chain and a $180M fleet of medical equipment.',
      story: ['Marcus was a Navy nuclear machinist’s mate; he thinks in redundancy.', 'Superstorm Sandy taught every hospital on the East River what water can do to a basement.'],
      narrator: 'Meraki MT sensors, Cyber Vision visibility into BMS controllers and Spaces asset data all flow into Splunk, and Cloud Control coordinates the response across facilities, IT and clinical teams. Marcus sees a humidity drift in OR 7 or a cold-chain excursion in the pharmacy before anyone has to cancel a case or throw away a drug.' },
    { id: 'raj', name: 'Raj Patel', kind: 'biomed', lens: 'facilities', role: 'Clinical Engineering (Biomed) Technician', dept: 'Clinical Engineering', why: 'Raj maintains infusion pumps, ultrasounds and monitors.', story: ['Raj used to spend Mondays hunting for devices due for preventive maintenance.'],
      narrator: 'Spaces shows Raj where every device due for PM is, so he can maintain 40 pumps in a morning instead of finding 12.' },
    { id: 'tony', name: 'Tony Russo', kind: 'facilities', lens: 'facilities', role: 'Stationary Engineer · Plant Operations', dept: 'Facilities', why: 'Tony keeps the chillers, AHUs and generators running.', story: ['Tony has worked the MH mechanical penthouse for 22 years.'], narrator: 'Tony gets Meraki MT and BMS alerts on his Webex phone, with the trend chart attached.' },

    // ---------------- security ----------------
    { id: 'rosa', name: 'Capt. Rosa Delgado', kind: 'security', lens: 'security', role: 'Director of Public Safety', dept: 'Public Safety',
      why: 'Rosa leads security for patients, visitors and 20,000+ staff across the campus.', story: ['Rosa spent 20 years with the NYPD before coming to MSK.', 'Her team’s mission: “calm, fast and kind.”'],
      narrator: 'Rosa’s Public Safety lens combines Cisco Spaces (elopement geofences, duress badges, visitor passes), Meraki MV edge-AI video and Webex dispatch. Officers go straight to a precise location instead of searching.' },
    { id: 'andre', name: 'Officer Andre Williams', kind: 'security', lens: 'security', role: 'Public Safety Officer', dept: 'Public Safety',
      why: 'Andre patrols the main hospital on the night shift and the lobby during the morning surgical rush.', story: ['Andre is a former high-school point guard and a part-time EMT student.'],
      narrator: 'Andre’s Webex phone shows a live blue dot of whoever or whatever he is dispatched to find: a dropped bag, a wandering patient, a duress call.' },

    // ---------------- other actors ----------------
    { id: 'jamal', name: 'Jamal Reed', kind: 'courier', lens: 'patient', role: 'Uber Eats courier', why: 'Jamal delivers food orders on the Upper East Side by e-bike.', story: ['Jamal has never been allowed past a hospital lobby, and he doesn’t need to be.'],
      narrator: 'Jamal hands Maria’s order to a delivery robot at the York Ave lobby handoff locker. The robot rides the service elevator to 12, and Spaces tracks it the whole way.' },
    { id: 'relay7', name: 'Relay-07', kind: 'robot', lens: 'hospital', role: 'Autonomous delivery robot', why: 'Relay-07 is one of eight delivery robots that carry meals, specimens and supplies.', story: ['Relay-07 averages 31 deliveries a day and has never once complained about the elevators.'],
      narrator: 'Relay-07 rides the hospital Wi-Fi 7 network, is located by Spaces, has its own Astrix-governed machine identity, and calls service elevators through a Cloud Control Studio integration.' },
  ];
  MSK.people = {};
  MSK.registerPeople = function (arr) { arr.forEach((p) => { MSK.people[p.id] = Object.assign({ color: MSK.kindColors[p.kind] || '#cbd5e1' }, MSK.people[p.id] || {}, p); }); };
  MSK.registerPeople(P);
})();
