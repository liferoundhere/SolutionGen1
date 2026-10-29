/* Narrated stories: the guided tour, patient & care-team journeys, and short scenario stories, each told
   "with Cisco" and "without Cisco". One audio clip per beat (Voicebox · Qwen3-TTS "Ryan", directed per beat).
   Beat fields:
     text    what the storyteller says; [warmly] [curious] [serious] [softly] [tired] direct the delivery, [pause] is a breath
     step    scenario step to show while this beat plays (the scene, camera and people follow it)
     fly     tour only: camera target (home | building | hub | splunk | inside)
     panels  tour only: show (true) or hide (false) the side panels
     hl      tour only: CSS selector(s) to highlight
     phone   pulse the phone (it never pops open during a story)
   Positioning follows docs/OWNERSHIP_BRIEF.md: Cloud Control runs IT, network and security operations; Webex and
   Cisco Spaces run patient and clinical workflows (Webex integrates with Epic); Splunk is the data layer. */
(function () {
  const MSK = (window.MSK = window.MSK || {});

  const WELCOME = {
    id: 'welcome', title: 'Welcome to the York Avenue campus',
    beats: [
      { fly: 'home', panels: false, text: "[warmly] Welcome. What you're looking at is a living model of Memorial Sloan Kettering's York Avenue campus, on Manhattan's Upper East Side. Memorial Hospital, the research towers, the Koch Center, the surgery center, and the East River running beside them. The rooms, the elevators, the people walking the halls... all of it moves. Everything here is illustrative, but the problems it shows are very real. [pause] Let's move in a little closer." },
      { fly: 'building', panels: false, text: "Inside these walls, thousands of people are having one of the hardest days of their lives. A woman arriving before dawn for surgery. A young mother starting chemotherapy. An eighty one year old man who wakes at two in the morning, sure he's late for work. And around each of them, nurses, doctors, officers, cooks and engineers, all trying to get the next hour right. [pause] So how does technology help them, without getting in the way? Let's look up." },
      { fly: 'splunk', panels: false, text: "[curious] The pink layer floating above the campus is Splunk, the data layer. Every signal on campus flows into it... locations, sensors, calls, network paths, the hospital's own systems... and Splunk turns them into the forecasts and early warnings that people act on, minutes or hours before a problem reaches a patient. [pause] And just above Splunk is where the hospital's technology teams do their work." },
      { fly: 'hub', panels: false, text: "[warmly] That's Cisco Cloud Control, the operations home for those teams. With one sign-in, network, security and IT engineers manage the Wi-Fi and campus network, the links to the outside world, the data center, security policy, and the Webex phones and video rooms, with ThousandEyes and Splunk alongside. In its AI Canvas, engineers and AI agents work a problem together, and an assistant drafts the fix for a person to approve. Through Splunk, it can draw on data from medical and clinical systems too. [pause] Now, let's follow it all down to the floors." },
      { fly: 'inside', panels: false, text: "[warmly] Down here, where the care happens, Webex and Cisco Spaces are part of every shift. Spaces quietly knows where things and people are... a pump, a wheelchair, a wristband, a blue dot guiding a visitor down the hall. Webex is how people reach each other. A text that arrives at the right moment. A call answered with the patient's chart already open. A page that finds the right nurse. And Webex works directly with Epic, the hospital's record. [pause] You can explore all of this yourself, and the screen is built to help." },
      { fly: 'home', panels: true, right: 'building:MH', dock: 'surgical-journey', hl: '#lenses, #left, #right, #dock', text: "Across the top are the lenses: leadership, hospital operations, the clinical teams, network and security, facilities, public safety, and patients and families. Each one sees the same campus through different eyes. The panel on the left holds that lens's scenarios and people. The panel on the right opens whatever you click... a person, a room, a building. And the player along the bottom walks through a scenario, one step at a time. [pause] But there's an even better way in." },
      { panels: false, hl: '#btn-journeys', phone: true, text: "[warmly] Press Journeys, and you'll follow one person's day, from beginning to end. Maria, from the curb to her car after surgery. Harold, at two in the morning. Keisha, looking for a medicine cart in the dark. Keep an eye on the phone in the corner. It shows the messages that reach them, and which ones Cisco made possible. [pause] And every one of these stories has a second version." },
      { panels: false, text: "Every story can be told twice. [pause] Once with Cisco... and once without. Same patient. Same night. Same people, doing their very best. Only the outcome changes. [softly] That difference is what this whole project is about. [pause] Before you go, a few quick tips." },
      { panels: false, hl: '#btn-focus, #btn-theme', text: "[warmly] Focus clears the screen, so the map fills it. The night button switches between a bright street map and the night operations view. And if you ever lose the person you're following, press the target, or the letter T, and the camera will find them. [pause] Now... pick a journey, and let's go inside." },
    ],
  };

  // ---------------------------------------------------------------- journeys (one person, start to finish)
  // withoutVariant: 'without' = the scenario's own Without variant; null = replay the same steps with Cisco's help removed
  const JOURNEYS = [
    { id: 'maria', scenario: 'surgical-journey', withoutVariant: null, hero: 'maria', icon: '♥', color: '#ec4899', name: 'Maria Alvarez', type: 'Patient · surgery day', pitch: 'A retired teacher arrives before dawn for kidney surgery. Curb to car, with her husband, a lost tote bag and a framed photo.', recommended: true },
    { id: 'harold', scenario: 'dementia-wander', withoutVariant: 'without', hero: 'harold', icon: '⌖', color: '#a78bfa', name: 'Harold Bennett', type: 'Patient · 2 AM on Floor 14', pitch: 'An 81-year-old former subway driver with early Alzheimer’s walks out of his room at 2:07 AM, sure he is late for his shift.', recommended: true },
    { id: 'keisha', scenario: 'lost-med-cart', withoutVariant: 'without', hero: 'keisha', icon: '✚', color: '#34d399', name: 'Keisha Thompson, RN', type: 'Charge nurse · night shift', pitch: 'One nurse short, a call light, and a medication cart left in a dark room with its narcotics drawer open.', recommended: true },
    { id: 'stanley', scenario: 'code-blue', withoutVariant: null, hero: 'joym', icon: '♡', color: '#ef4444', name: 'Stanley Kaminski', type: 'Patient · Code Blue', pitch: 'A leukemia patient’s heart stops at 2:32 PM. Every second between the button and the first shock counts.' },
    { id: 'anhthu', scenario: 'koch-infusion-day', withoutVariant: null, hero: 'anhthu', icon: '☀', color: '#f59e0b', name: 'Anh Thu Tran', type: 'Patient · first chemotherapy', pitch: 'A young mother’s first infusion day at the Koch Center, with her mother, who speaks Vietnamese and is quietly terrified.' },
    { id: 'farah', scenario: 'epic-slowdown', withoutVariant: 'without', hero: 'farah14', icon: '≋', color: '#0ea5e9', name: 'Farah Siddiqui, RN', type: 'Day charge nurse · Epic slows', pitch: 'Morning rounds, 1,400 clinicians logging in, and Epic starts to crawl because of a router miles away.' },
  ];

  const STORIES = {
    maria: {
      title: "Maria's surgery day",
      with: [
        { step: 1, phone: true, text: "[warmly] It's five thirty in the morning on York Avenue, and Maria Alvarez is about to have a tumor taken out of her kidney. She's fifty eight, a retired teacher, and she has held her husband Daniel's hand the whole ride over. As the car pulls up, her phone joins the hospital Wi-Fi on its own. Cisco Spaces notices she's here, and a Webex text, matched to her appointment in Epic, lights up her screen. Welcome, Maria. Just follow the blue dot." },
        { step: 3, text: "[curious] In the lobby, Daniel stops for a coffee. Maria sets her tote bag on a café table... her glasses, her charger, and a framed photo of her grandson... and walks on without it. [pause] A Meraki camera notices a bag sitting on its own. And Cisco Spaces works out whose it is." },
        { step: 4, text: "Officer Andre Williams gets the alert on his Webex phone, with Maria's blue dot moving toward the elevators. He catches her before the doors open. Two minutes and ten seconds. [softly] She never even knew it was gone." },
        { step: 8, phone: true, text: "[serious] At seven thirty one, Maria is wheeled into operating room five. Before anyone picks up a scalpel, Splunk has checked the things that matter: the room's humidity, the devices on the network, the path to Epic. All green. And the moment her wristband crosses the doorway, Daniel's phone buzzes. She's in." },
        { step: 10, text: "[warmly] The surgery goes well. Tumor out... kidney saved. And while Maria is still waking up, Splunk is already thinking about her room. It can see the patient in twelve fourteen is going home this morning, and it tells the cleaning team exactly when to be ready. Ninety minutes from recovery to her own bed... instead of nearly four hours." },
        { step: 19, phone: true, text: "[softly] Two days later, her discharge papers arrive on her phone, drafted by a private AI that never sent her records outside the building, and checked by her nurse. When Daniel's car turns onto Sixty Seventh Street, a wheelchair is already on its way. [pause] She leaves with her tote, her paperwork, and that little framed photo. [warmly] For the hospital, it was a Tuesday. For Maria, it was the day she got to go home." },
      ],
      without: [
        { step: 1, text: "[serious] Now, let's replay Maria's morning without Cisco. Same car. Same five thirty. But no text greets her. Daniel reads the signs out loud while they guess at the elevators, and they ask three different people for directions." },
        { step: 3, text: "Her tote bag stays on the café table, and nothing connects it to anyone. [pause] She realizes it's gone in pre-op... in a gown, with a needle in her arm... and spends the last minutes before surgery worrying about a photograph." },
        { step: 10, text: "[tired] The surgery still goes well. But upstairs, nobody knows her room is ready until somebody calls. She waits in recovery for almost four hours, while Daniel paces a waiting room with no news." },
        { step: 19, text: "[softly] On discharge day, she waits three hours for paperwork and a wheelchair. Her tote turns up the next day, in lost and found. Same surgeon. Same skill. [pause] A completely different stay." },
      ],
    },
    harold: {
      title: 'Harold at 2 AM',
      with: [
        { step: 0, text: "[softly] It's one fifty two in the morning on the fourteenth floor. Harold Bennett is eighty one. He's being treated for pneumonia on top of his chemotherapy, and he has early Alzheimer's. For thirty one years, he drove the number four train. [pause] Tonight, he can't sleep. And down the hall, Keisha, the charge nurse, is one nurse short, with two admissions on the way." },
        { step: 1, text: "[curious] At two oh seven, Harold puts on his slippers and walks out of his room. In his mind, he's late for his shift. He passes the nurse station while Keisha is with another patient... and pushes through the stairwell door." },
        { step: 3, phone: true, text: "The moment his wristband crosses into that stairwell, Cisco Spaces raises a quiet alert. No overhead page. No alarm waking the floor. It goes to exactly two places: Keisha's Webex phone, and Teresa, the dispatcher downstairs. Teresa sees the nearest officer is Andre, in the lobby... and with one tap, sends him Harold's live blue dot." },
        { step: 5, text: "[warmly] Andre takes the elevator up and opens the stairwell door on twelve. Harold is sitting on the landing, a little out of breath. Andre doesn't say patient, or code. He asks about the four train. [pause] Three minutes and fifty two seconds after the alert, Harold is safe... and telling him all about the blackout of nineteen seventy seven." },
        { step: 7, text: "Every moment of the night lands in Splunk. And Splunk notices something nobody had connected: Harold has been up and pacing at this same hour, three nights in a row. Tonight, his bed alarm will already be on." },
        { step: 8, phone: true, text: "[softly] At a quarter to eight, his daughter Ellen gets a calm text instead of a phone call in the dark. What happened. That he was safe within four minutes. And the plan for tonight. [pause] Harold is asking for coffee." },
      ],
      without: [
        { step: 1, text: "[serious] Now, let's replay the same night without Cisco. Harold walks out at two oh seven, just the same. But there's no wristband alert, and the stairwell door doesn't make a sound." },
        { step: 2, text: "Seventeen minutes later, Keisha finds his bed empty. She checks the bathroom, the lounge, the rooms next door. [pause] By now, Harold has found an elevator, and he's on the ground floor." },
        { step: 4, text: "[tired] A missing patient code wakes every floor of the tower. Officers search stairwell by stairwell... always looking where Harold was, never where he is." },
        { step: 6, text: "[softly] At two fifty nine, fifty two minutes after he left, Andre finds him in the ambulance bay, cold and frightened, his hand scraped from a stumble, one step from Sixty Seventh Street. Ellen gets the phone call at ten past three. Same man. Same night. [pause] A completely different ending." },
      ],
    },
    keisha: {
      title: "Keisha's missing med cart",
      with: [
        { step: 0, text: "[warmly] It's past one in the morning on the fourteenth floor, and Keisha Thompson is running behind. She's the charge nurse tonight, one nurse short, pushing medicine cart fourteen B down the east hallway. Every patient's two o'clock doses are in that cart... and a drawer of narcotics." },
        { step: 1, text: "[curious] Then, a call light. Gloria, in fourteen oh nine, is about to be sick. Keisha leaves the cart inside a sleeping patient's room and runs. [pause] It's the right call. But the drawer is still unlocked." },
        { step: 2, phone: true, text: "Ten minutes later, Splunk puts two facts together. Cisco Spaces says the cart hasn't moved, and the cart's own lock says the drawer is open. One message lands on Keisha's Webex phone. With a single tap, she sends Marisol, the nearest free nurse, to lock it." },
        { step: 4, phone: true, text: "[warmly] At two o'clock, nine patients are due their medicine. Keisha types four words into her phone: find med cart fourteen B. Spaces answers in under a second. Room fourteen eighteen, forty one meters away, locked since one thirty two." },
        { step: 6, text: "[softly] Three minutes later, Gloria has her anti-nausea medicine, right on time. The other eight doses follow before two thirty. [pause] Nobody woke up. Nobody searched. A busy night... that stayed a normal one." },
      ],
      without: [
        { step: 2, text: "[serious] Now, let's replay the same night without Cisco. The cart sits in fourteen eighteen with its drawer open, for almost an hour and a half. Nothing knows where it is, or that it's unlocked." },
        { step: 4, text: "[tired] At two o'clock, Keisha goes looking. She opens door after door on sleeping patients, with a penlight. Fifteen rooms. Fourteen minutes. Nothing." },
        { step: 6, text: "By two thirty, the window has closed for seven of nine doses. Gloria is sick again. Three nurses on two floors are searching... and not one of them is with a patient." },
        { step: 7, text: "[softly] At two forty seven, the man in fourteen eighteen wakes up and asks why there's a cart beside his bed. It was forty one meters from the nurse station the whole time. Same nurses. Same night. [pause] Forty seven minutes, lost." },
      ],
    },
    stanley: {
      title: "Stanley's two minutes",
      with: [
        { step: 0, text: "[serious] It's two thirty two on a Friday afternoon, on the leukemia floor. Joy Mendoza walks into room fifteen twelve and finds Stanley Kaminski unresponsive. His heart has slipped into a deadly rhythm. [pause] She presses the Code Blue button on the wall... and starts chest compressions." },
        { step: 1, phone: true, text: "That button starts the hospital's code workflow. Cisco Spaces finds the nearest crash cart, twenty four meters away, and the nearest people who can help, by their badges. A code leader one floor up. A respiratory therapist one floor down. The intensive care nurse, ten floors below. Webex Calling pages every one of them, with Stanley's room and a blue dot." },
        { step: 2, text: "[curious] Devi follows the blue dot straight to the cart, and wheels it into the room fifty eight seconds after the button was pressed. She places the pads while Joy keeps pushing, hard and fast." },
        { step: 6, text: "The doctors arrive from three directions. The elevator controller has already sent a car for the intensive care nurse. And at one minute and fifty two seconds, the first shock is delivered... inside the two minutes that matter most." },
        { step: 7, text: "[softly] Seven minutes after Joy found him, Stanley has a pulse again. Downstairs in the café, his wife Halina gets a call from the family liaison. [pause] He's alive. He's going to intensive care. Come up." },
      ],
      without: [
        { step: 1, text: "[serious] Now, let's replay the same afternoon without Cisco. Joy presses the button just as fast, and starts compressions just as fast. But the overhead page says only: Code Blue, fifteen. And nobody knows which cart is closest." },
        { step: 2, text: "[tired] The nearest cart is in a utility room nobody checks first. It reaches the bedside after three minutes and forty seconds. The intensive care nurse waits at a crowded elevator bank." },
        { step: 6, text: "[softly] The first shock comes at four and a half minutes. Every minute without one, the odds of surviving fall. Same nurse. Same doctors. Same skill. [pause] Only the minutes were different." },
      ],
    },
    anhthu: {
      title: "Anh Thu's first chemotherapy day",
      with: [
        { step: 0, phone: true, text: "[warmly] Anh Thu Tran is a mother of two, and tomorrow is her first day of chemotherapy. Her own mother, Mai Lan, will be beside her. Mai Lan speaks Vietnamese, and she's frightened in a way she won't say out loud. [pause] The night before, one Webex text turns three appointments into a single plan, and a reply of one letter books an interpreter." },
        { step: 3, text: "[curious] At the Koch Center, Cisco Spaces sees her arrive, and Webex checks her in before she reaches the door. After her blood draw, instead of sitting in a crowded waiting room, the two of them have breakfast in the café. Splunk is watching her lab results, and her phone will tell her the moment it's time to go up." },
        { step: 5, text: "When her doctor signs okay to treat, Epic sends the order to the pharmacy right away, because the hospital already knows Anh Thu is in the building. Nothing precious is mixed for someone who hasn't arrived." },
        { step: 9, text: "[softly] In the infusion chair, her nurse Kwame taps a screen, and a Vietnamese interpreter appears on video in thirty seconds. And Mai Lan finally asks the question she couldn't ask through her daughter: will she lose her hair?" },
        { step: 11, phone: true, text: "[warmly] As the last drip runs down, Webex offers a ride home, and the car is waiting at the curb when she walks out. Nine minutes from chair to car. [pause] It was the hardest day of Anh Thu's year... and not one minute of it was spent waiting for no reason." },
      ],
      without: [
        { step: 1, text: "[serious] Now, let's replay Anh Thu's first day without Cisco. She checks in at a desk, in a line. Then she waits. And waits... in a room full of patients whose immune systems are as fragile as hers." },
        { step: 5, text: "[tired] Her medicine isn't mixed until a nurse confirms she's really in a chair. Nearly three hours in waiting rooms. And Mai Lan's questions go unasked, because Anh Thu is translating for herself." },
        { step: 11, text: "[softly] She finally gets home in the evening, exhausted, and her mother is still holding every question nobody answered. Same doctor. Same medicine. [pause] Just two more hours of fear." },
      ],
    },
    farah: {
      title: 'The morning Epic slowed',
      with: [
        { step: 0, text: "[curious] It's seven forty one in the morning. Farah Siddiqui, the day charge nurse on fourteen, is twenty minutes from the busiest hour of her shift. She doesn't know it yet, but something is going wrong miles away. [pause] Splunk does. It watches the health of Epic, the system every nurse depends on, and it sees trouble coming before anyone feels it." },
        { step: 1, text: "Cisco ThousandEyes finds it. A single router, deep inside an outside carrier's network, is dropping data. Not the hospital's network. Not Epic. Somewhere out on the internet." },
        { step: 2, text: "At eight oh five, Farah's medicine screens start to crawl. She sends a message on Webex, and gets an answer within a minute. The network team already knows. It's an outside carrier. A fix is coming." },
        { step: 5, text: "[warmly] In the AI Canvas, inside Cisco Cloud Control, the network team sees all the evidence in one place, and an assistant proposes a fix: send Epic's traffic over a second carrier. Priya approves it. Thirty eight seconds later, it's done." },
        { step: 6, text: "[softly] Seven minutes after Farah's first message, her screens are fast again. The nine o'clock chemotherapy starts on time, and nobody had to switch to paper. [pause] Most people on the floor never knew anything happened." },
      ],
      without: [
        { step: 0, text: "[serious] Now, let's replay the same morning without Cisco. The carrier fault hits at the same moment. But inside the hospital, nobody can see past their own front door. Farah calls the service desk... and waits on hold." },
        { step: 2, text: "[tired] Forty people join a bridge call. Every team's dashboard is green, and every team explains why it must be somebody else. Someone restarts a system to rule it out, and a hundred and eighty clinicians are logged out mid-task." },
        { step: 5, text: "Five units switch to paper. Medicine records by hand, orders on paper, and every step to be typed in again later." },
        { step: 6, text: "[softly] At five to eleven, the carrier finally fixes it. Two hours and fifty minutes. Nobody is sure what fixed it, or how many patients waited. Same fault. Same morning. [pause] A very different day on fourteen." },
      ],
    },
  };

  // ---------------------------------------------------------------- short scenario stories (2 beats with, 1 without)
  const SCENARIO_STORIES = {
    'equipment-hunt': { title: 'The morning nothing went missing', hero: 'tomas', withoutVariant: 'without',
      with: [
        { step: 0, text: "[curious] Thursday, seven oh two. Ruth's oxygen is falling on the fifteenth floor, and her respiratory therapist, Tomás, needs a high flow oxygen unit... now. He asks Cisco Spaces, and it shows him the nearest clean one, one floor down." },
        { step: 5, text: "[warmly] It's at her bedside in six minutes. Later that morning, the same map turns a recall notice for forty infusion pumps into one efficient route, and the biomed team finds every single one. [pause] Splunk adds it up: less searching, fewer rentals, and equipment the hospital already owns, actually found." },
      ],
      without: [
        { step: 1, text: "[serious] Without Cisco, Tomás goes alcove to alcove, floor to floor. Ruth's oxygen keeps falling, and by the time the unit arrives, she needs a rapid response team and an intensive care bed. [softly] By noon, twelve of forty recalled pumps are found... and the answer to everything is, rent more." },
      ] },
    'duress-ucc': { title: "Nicole's silent button", hero: 'nbaptiste', withoutVariant: null,
      with: [
        { step: 1, text: "[serious] Eleven forty at night in the Urgent Care Center. A son who has watched his mother wait six hours for a bed is shouting at the triage desk. Nicole, the triage nurse, presses the button on her badge without breaking eye contact. [pause] Cisco Spaces sends her exact location to the Public Safety dispatcher, and a Meraki camera shows the scene without identifying anyone." },
        { step: 6, text: "[warmly] Two officers are there in under two minutes, calm and quiet. A social worker joins through Webex. And then the real fix arrives: a bed time he can believe. Within the hour, his mother goes upstairs... and Nicole gets a check-in from her manager." },
      ],
      without: [
        { step: 3, text: "[serious] Without Cisco, Nicole has to step away to a phone and describe where she is, while the shouting grows. Officers search the department for the right bay. [softly] Nobody is hurt, this time. But Nicole goes home shaking... and nobody ever counts what happened." },
      ] },
    'ucc-surge': { title: 'The wave that was seen coming', hero: 'hannah', withoutVariant: null,
      with: [
        { step: 0, text: "[curious] It's two in the afternoon on a Monday, and Splunk sees a wave coming. Chemotherapy patients with complications, heading for the Urgent Care Center between five and eight tonight. Four hours of warning. Hannah, in the Command Center, opens a Webex space with everyone who needs to act." },
        { step: 9, text: "[warmly] Discharges move to the lounge early. Cleaning teams go where the admissions are going. And Cisco Spaces shows every room on every floor, live. When the wave hits, there are beds waiting. [pause] Admit decision to bed: fifty two minutes." },
      ],
      without: [
        { step: 7, text: "[serious] Without Cisco, the surge arrives as a surprise. Patients board in hallways for hours, while clean beds sit unknown upstairs. [softly] Everyone works just as hard. They just find out too late." },
      ] },
    noreaster: { title: 'The storm that came up the river', hero: 'oksana', withoutVariant: null,
      with: [
        { step: 0, text: "[serious] A Nor'easter is coming, and Splunk sees it eighteen hours out. The river, the tide, the roads, the deliveries... and what each one will mean for the hospital. Incident command turns that forecast into tasks, with an owner for every one." },
        { step: 9, text: "[curious] When the storm hits, the river pours over the FDR Drive. Meraki sensors find water in the basement in seconds. A power feeder trips, and the generators take the load. A fiber is cut in a flooded tunnel, and Catalyst SD-WAN with 5G keeps Epic and Webex running. Six slow minutes, instead of hours. [softly] And families hear it from the hospital first." },
      ],
      without: [
        { step: 6, text: "[serious] Without Cisco, the water is found on the eight o'clock rounds, three inches deep. The network core goes down, and Epic goes with it. [tired] And the after-action meeting is a room full of people, guessing what happened." },
      ] },
    'heat-wave': { title: 'A hundred and one degrees', hero: 'lucillem', withoutVariant: null,
      with: [
        { step: 3, text: "[curious] It's a hundred and one degrees in Manhattan. Splunk notices patients on chemotherapy arriving in urgent care dehydrated... and it knows who else is at risk. The Webex AI Agent calls them, one by one, before they get sick." },
        { step: 12, text: "[warmly] When the grid is pushed to its limit and a network closet on fourteen starts to overheat, the network team sees it in Cisco Cloud Control and has cooling there in eleven minutes. [pause] And Lucille gets her fluids in a quiet infusion chair... not in an emergency room." },
      ],
      without: [
        { step: 10, text: "[serious] Without Cisco, the calls never happen, and heat-sick patients arrive in waves. When the closet on fourteen cooks, nine access points go dark... [tired] and nobody knows why for hours." },
      ] },
    blizzard: { title: 'Twenty inches and a skeleton crew', hero: 'thandim', withoutVariant: null,
      with: [
        { step: 3, text: "[serious] Twenty inches of snow, and the subway stops. Splunk saw the staffing gap a day ahead, and staff who could stay slept on campus. Now Cisco Spaces shows who actually made it in, so two thin units can become one safe one." },
        { step: 10, text: "[warmly] Koch Center appointments move to Webex video. ThousandEyes diagnoses a doctor's slow home connection in minutes. And when discharged patients are stuck in the snow, Webex finds them a ride. [softly] A blizzard, measured... and survived." },
      ],
      without: [
        { step: 4, text: "[serious] Without Cisco, nobody knows who is really in the building until the shift starts short. Patients wait at home for calls that never come. [tired] The day is spent counting, instead of caring." },
      ] },
    'iomt-pump': { title: 'The pump that called home', hero: 'imanirn', withoutVariant: null,
      with: [
        { step: 1, text: "[curious] A vendor plugs a laptop into the network on the bone marrow transplant unit. Minutes later, Cisco Cyber Vision sees an infusion pump in room seventeen twelve start calling out to an address it has never talked to before." },
        { step: 4, text: "[warmly] In the AI Canvas, inside Cisco Cloud Control, the security team sees the whole chain. Cisco ISE quarantines the pump, but lets the medicine keep flowing, so the patient's infusion finishes safely. Five minutes from alert to contained. [pause] Zero interrupted infusions." },
      ],
      without: [
        { step: 4, text: "[serious] Without Cisco, nobody notices the pump at all, until three days later, when a ransomware investigation finds where it all began. [softly] Same pump. Same laptop. A very different week." },
      ] },
    'ai-guardrails': { title: 'AI with guardrails', hero: 'elena', withoutVariant: null,
      with: [
        { step: 4, text: "[curious] A referral letter arrives, scanned from a fax. Hidden inside it is an instruction meant to trick the hospital's AI into giving away records. Cisco AI Defense catches it before the AI ever acts on it." },
        { step: 6, text: "[warmly] And when a vendor update makes the discharge summary AI start drifting from the facts, Galileo notices, and the team rolls it back the same afternoon. [pause] AI that's safe, measured... and still giving clinicians their hours back." },
      ],
      without: [
        { step: 6, text: "[serious] Without Cisco, the hidden instruction slips through, and nobody can say which AI read it. The drifting model keeps writing summaries for a week. [softly] And trust in AI, once lost, is very hard to win back." },
      ] },
    'cold-chain': { title: 'The 3 AM refrigerator', hero: 'tomasz', withoutVariant: 'without',
      with: [
        { step: 1, text: "[softly] Two forty in the morning, in a locked pharmacy room. A refrigerator full of chemotherapy and immunotherapy starts to warm. Meraki sensors notice, and Splunk predicts it will go out of range in thirty eight minutes." },
        { step: 5, text: "[warmly] Webex pages the pharmacist and the engineer. Spaces finds a backup refrigerator. And the medicines are moved in fourteen minutes, never once out of range. [pause] By morning, the infusions start on time, and nobody outside the pharmacy ever knew." },
      ],
      without: [
        { step: 3, text: "[serious] Without Cisco, the alarm sounds behind a closed door. At six thirty, the morning pharmacist finds a warm refrigerator. Three hundred and eighty thousand dollars of medicine, gone... [softly] and patients whose treatment runs on a calendar, sent home to wait." },
      ] },
    'or-humidity': { title: 'Before the first incision', hero: 'tony', withoutVariant: null,
      with: [
        { step: 2, text: "[curious] Five ten in the morning. Humidity is creeping up in two operating rooms, and the first cases start at seven thirty. Meraki sensors catch it. Splunk finds the cause, a valve that isn't doing what it's told, and lists exactly which surgeries are at risk." },
        { step: 8, text: "[warmly] Tony, the engineer, gets the page with the evidence, and fixes a slipped linkage by five forty two. Both rooms are back in range, and the first patients go in on time. [softly] Walter, waiting in pre-op, never has to hear the word cancelled." },
      ],
      without: [
        { step: 7, text: "[serious] Without Cisco, the humidity is noticed when the surgical team walks in. Cases are delayed, then moved. [softly] And Walter, who hasn't eaten since midnight, is told to wait." },
      ] },
    'meals-robots': { title: "Milo's safe lunch", hero: 'miloq', withoutVariant: null,
      with: [
        { step: 2, text: "[curious] It's the lunch rush. On the children's floor, Milo's mother orders the noodle bowl he saw on the playroom menu. The Webex AI Agent checks his allergies in Epic, and catches the peanut sauce before the order even exists." },
        { step: 7, text: "[warmly] Down in the basement, robots carry the meals up on the service elevators. When one elevator breaks, the robot fleet manager reroutes them in forty seconds, and Cisco Spaces shows where every tray is. [pause] Milo gets his safe lunch, still hot." },
      ],
      without: [
        { step: 6, text: "[serious] Without Cisco, the peanut sauce is caught only at the bedside... if someone remembers to check. Trays go cold waiting for elevators, and patients away for scans get a meal nobody eats." },
      ] },
    'leadership-huddle': { title: 'The seven thirty huddle', hero: 'catherine', withoutVariant: null,
      with: [
        { step: 1, text: "[warmly] It's seven thirty, and Catherine, the hospital's chief operating officer, walks into the operations center. Splunk has already written the overnight brief. What happened. What's coming. And what needs a decision." },
        { step: 8, text: "[curious] One by one, each insight becomes a decision with a name on it. Scale the pickup alerts. Get ready for Monday's surge. Move idle pumps to the floor that's renting them. [softly] Six decisions, six owners... and Splunk will measure every outcome." },
      ],
      without: [
        { step: 1, text: "[serious] Without Cisco, the huddle starts with everyone reading their own report, from their own system. [tired] Half an hour later, the decisions are vague, the owners are unclear, and nobody will ever know if any of it worked." },
      ] },
  };

  const plain = (t) => String(t || '').replace(/\[[a-z ]+\]\s*/g, '').replace(/\s{2,}/g, ' ').trim();
  MSK.stories = { WELCOME, JOURNEYS, STORIES, SCENARIO_STORIES, plain, JOURNEY_BY_ID: Object.fromEntries(JOURNEYS.map((j) => [j.id, j])) };
})();
