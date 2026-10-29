// All on-screen copy, the talk track (notes), live links, sources, and the workshop
// template for "A spoken word away", the FutureSE talk for Cisco Business Solutions Engineering.
// One source of truth for the stage, the presenter window, the talking points page,
// and the printable talk track.
// Copy rules: two-clause headlines (title + grad outcome), no em dashes anywhere.

export const DECK = {
  name: 'FutureSE',
  sub: 'A spoken word away',
  channel: 'futurese-stage',
  film: {
    blurb: 'An AI narrator walks you through how the FutureSE verses were built with natural language, step by step: the shift away from slide decks, the prompt pattern, a hands-on workshop, and the live verses. Choose a narrator.',
    album: 'A spoken word away',
    // No pre-rendered neural audio ships with this rebuild (no edge-tts access when it was built).
    // Set to true after running tools/gen_audio.py so the gate offers the four neural voices.
    audio: false,
  },
};

export const PRESENTER = {
  name: 'Stephen Ewings',
  role: 'Solutions Engineer, Cisco',
};

// The eight prompt blocks. Reused by the focus scene, the prompt chips, and the workshop builder.
export const BLOCKS = [
  { key: 'medium', label: 'Medium', hint: 'the canvas', color: '#00BCEB' },
  { key: 'customer', label: 'Customer', hint: 'the account', color: '#6CC04A' },
  { key: 'story', label: 'Story + audience', hint: 'who + what', color: '#FBAB18' },
  { key: 'items', label: 'Key items', hint: 'ingredients', color: '#F25C9A' },
  { key: 'research', label: 'Research (mandatory)', hint: 'look it up', color: '#8E7CFF' },
  { key: 'oneshot', label: 'One shot, no questions', hint: 'decide, do not ask', color: '#FF6B4A' },
  { key: 'time', label: 'Time budget', hint: '5 hours', color: '#2DE2C5' },
  { key: 'masterpiece', label: 'Masterpiece', hint: 'raise the bar', color: '#FFD95A' },
];

// Live links shown as buttons on the scene whose id matches `scene`. Overridable in the
// Links panel (stored in this browser only). https only.
export const VERSES = [
  { key: 'delta', name: 'Deltaverse', sub: 'Delta Air Lines', color: '#e2231a', scene: 'delta', gen: 'Original', url: 'https://dapper-ginger-cs9a.here.now/' },
  { key: 'nyu', name: 'NYULH Verse', sub: 'NYU Langone Health', color: '#8e7cff', scene: 'nyu', gen: 'Original', url: 'https://mighty-orbit-f3r4.here.now/' },
  { key: 'msk', name: 'MSK Operations Twin', sub: 'Memorial Sloan Kettering', color: '#2de2c5', scene: 'msk', gen: 'Original', url: 'https://topaz-kernel-3cga.here.now/' },
  { key: 'gary', name: 'GaryVerse', sub: 'T. Rowe Price EBC', color: '#fbab18', scene: 'gary', gen: 'Evolution', url: 'https://scarlet-iris-csv8.here.now/' },
  { key: 'anu', name: 'AnuVerse', sub: 'CSL Plasma', color: '#6cc04a', scene: 'anu', gen: 'Evolution', url: 'https://ancient-vault-4jt8.here.now/' },
  { key: 'anuChampion', name: 'AnuVerse Champion', sub: 'Champion edition', color: '#6cc04a', scene: 'anu', gen: 'Evolution', url: 'https://verdant-ribbon-ks6e.here.now/' },
  { key: 'anuDominion', name: 'AnuVerse Dominion', sub: 'Dominion Energy', color: '#6cc04a', scene: 'anu', gen: 'Evolution', url: 'https://hollow-flame-f2tf.here.now/' },
  { key: 'allen', name: 'AllenVerse', sub: 'MetLife AgenticOps 4D', color: '#00bceb', scene: 'allen', gen: 'Latest evolution', url: 'https://rosy-beacon-q5c8.here.now/' },
  { key: 'severse', name: 'SEVerse', sub: 'The method, packaged', color: '#f25c9a', scene: 'severse', gen: 'Skill', url: 'https://sonic-karma-7gzp.here.now/' },
];

export const SCENES = [
  {
    id: 'title',
    eyebrow: '00 · Prologue',
    title: 'Stories used to be decks.',
    grad: 'Now they are worlds.',
    lead: 'How seven customer worlds were built with natural language, and how you can build the next one today.',
    layout: 'hero',
    beats: [{ h: 'Stephen Ewings', p: 'Solutions Engineer, Cisco. Presenting to the Business Solutions Engineering team.' }],
    notes: [
      'Thank you all for having me. A confession before we start: a lot of what you are about to see started with this team. Scott, Anu, Keith, and the BSA crew taught me to look at a customer as one story, not one box at a time. I took that lesson and pointed AI at it. So today I am not going to show you slides. This whole presentation is a 3D web app, and I built it by describing it. By the end of the next twenty minutes, you will have started one of your own.',
    ],
  },
  {
    id: 'slides',
    eyebrow: '01 · The shift',
    title: 'The slide deck era is ending.',
    grad: 'Customers want to step inside the story.',
    lead: 'Our customers do not live in rectangles. Our stories should not either.',
    beats: [
      { h: 'Thirty years of rectangles', p: 'Title, agenda, three bullets, architecture, next steps. Same deck, different logo.' },
      { h: 'The rectangle breaks', p: 'A deck cannot show a hospital at 2 AM, an airport at rush hour, or a plasma center that cannot check in donors.' },
      { h: 'Interactive worlds are the new deck', p: 'Web apps, live dashboards, narrated tours. Customer specific, built in hours, shared as a link.' },
    ],
    notes: [
      'Think about the last deck you presented. Title, agenda, problem, three bullets, architecture, next steps. We have told stories in rectangles for thirty years, and most customers can predict slide four before we click.',
      'Click. A rectangle cannot show what it feels like to be the operator at two in the morning, the gate agent with a dead kiosk, or a plasma center manager who cannot check in a single donor. Those are the moments where Cisco actually matters, and we flatten them into bullets.',
      'Click. What replaces the deck is interactive: web apps, dashboards, narrated tours of the customer\'s own world. And the part that changes everything is the cost. This used to take an agency a quarter. Now it takes a paragraph and a few hours of compute, and you share it as a link.',
    ],
  },
  {
    id: 'google',
    eyebrow: '01 · The shift',
    title: 'Stop using AI like Google.',
    grad: 'Brief it like a teammate.',
    lead: 'A search box gives you links. An intelligent assistant gives you outcomes.',
    beats: [
      { h: 'The search box habit', p: 'Ten words in, ten links out. We are still asking frontier models for datasheets.' },
      { h: 'A Swiss Army knife', p: 'Researcher, architect, storyteller, artist, analyst, engineer, narrator, and yes, comedian. One conversation.' },
      { h: 'Stop querying, start briefing', p: 'Context, intent, freedom, and a bar to clear. Cursor, Claude, ChatGPT: a spoken word away.' },
    ],
    notes: [
      'Keith said something to me this week that stuck: most people are still using it like Google. We type ten words into a frontier model and ask for a datasheet. That is like hiring a principal architect and asking them to fetch coffee.',
      'Click. On the other side of that box is a Swiss Army knife. It researches, designs, writes, codes, narrates, and it is genuinely funny. It is well read and it is artistic. Cursor, Claude, ChatGPT are not search engines. They are teammates who never get tired.',
      'Click. So the shift is easy to say and hard to do: stop querying, start briefing. Give it context, tell it what you want and why, give it freedom, and give it a bar to clear. And I barely type anymore. I speak it. The story is a spoken word away. Before I show you how, I want to show you why this matters beyond storytelling.',
    ],
  },
  {
    id: 'flip',
    eyebrow: '02 · The flip',
    title: 'Same engineers, same tickets.',
    grad: 'Cloud Control flips the pyramid.',
    lead: 'Cisco Cloud Control gives the base of the pyramid agentic reach.',
    beats: [
      { h: 'Today: the escalation climb', p: 'Tier 1 troubleshoots, hands off to a senior who starts over, who pulls in an architect. Nobody counts the time between handoffs.' },
      { h: 'Flipped: agentic reach at the base', p: 'AI Assistant, AI Canvas, ThousandEyes, Splunk, and agents give the junior engineer reach across every domain. Most tickets end here.' },
      { h: 'Escalations arrive with context', p: 'Only the truly hard problems climb, and they arrive with evidence, timeline, and hypotheses already collected.' },
    ],
    notes: [
      'This shape rewired how I see everything. Watch the ticket. Today a tier one engineer takes the call and spends real time troubleshooting. Then a senior engineer picks it up and, nine times out of ten, starts over and pulls the logs again. Then an architect. Look at the clock. What we never measure is the time between the handoffs.',
      'Click. Now flip it. With Cisco Cloud Control, that same junior engineer has agentic reach: AI Assistant across domains, AI Canvas as a shared investigation workspace, ThousandEyes and Splunk evidence, and agents that spot the trouble, identify the cause, fix, test, and confirm, with a human approving. The wide part of the pyramid is now the capable part, and mean time to resolution drops. Cisco published a customer example at GA: a recurring issue that took more than ten hours manually, closed in under ten minutes in AI Canvas.',
      'Click. And when something truly is beyond their reach, it climbs to the senior and the architect with the context already collected. Nobody starts from scratch. Hold on to this shape, because it is exactly the shape of a good prompt.',
    ],
  },
  {
    id: 'pyramid',
    eyebrow: '02 · The flip',
    title: 'Prompting has the same shape.',
    grad: 'Start at the solid base.',
    lead: 'Put the weight in round one. Let iteration narrow the focus.',
    beats: [
      { h: 'The Google way balances on a point', p: 'One narrow question, then a hundred follow ups, adding context one brick at a time. It wobbles.' },
      { h: 'Flip it: a one-shot foundation', p: 'Medium, customer, story, key items, mandatory research, no questions, a time budget, a masterpiece. Most of the work lands in round one.' },
      { h: 'Iterate to optimize, not to design', p: 'In a race, the old way is still designing the car. With a solid base you are already on the track, tuning.' },
    ],
    notes: [
      'When we use AI like Google, we start at the tip: one narrow question. Then we stack follow ups, brick by brick, trying to hand it the context it should have had from the start. It balances on a point, and it wobbles.',
      'Click. Flip it. I start at the bottom of the triangle with the solid component: one rich, one-shot brief with everything the model needs, plus the freedom to go get what it does not have. That first round lands most of the outcome. Then each iteration narrows the focus: fix the map, add a focus mode, add narration.',
      'Click. I told Keith it is like racing. The old way, you are still in the garage designing the car when the season starts. With a solid base the car is built and you are on the track. You iterate to optimize, not to design. So what goes in that base?',
    ],
  },
  {
    id: 'anatomy',
    eyebrow: '03 · The method',
    title: 'Eight blocks, every verse.',
    grad: 'Logic over exact words.',
    lead: 'Not the exact prompts. The structure underneath every one of them.',
    layout: 'focus',
    beats: [
      { h: 'One structure, seven worlds', p: 'Every verse came from the same eight blocks, usually spoken out loud, rough, with barely a period in it.' },
      { b: 0, h: 'Medium', q: 'Build a Three.js (npm) visualization of ...', p: 'Name the canvas, not the slides. The output is code: editable, self contained, one link or one file.' },
      { b: 1, h: 'Customer', q: '... T. Rowe Price. CSL Plasma. MetLife locations across the globe.', p: 'A proper noun unlocks the public record: sites, filings, leaders, outages, published technology.' },
      { b: 2, h: 'Story and audience', q: 'The CISO will be in the room. Organize it by department so they can navigate it any way they want.', p: 'Who is in the room and what they should feel. Anthropic\'s guidance: give the motivation behind the ask.' },
      { b: 3, h: 'Key items', q: 'It must include Splunk. Patching, pre and post checks, ThousandEyes, Agent Builder.', p: 'Ingredients, not recipe. Name the technologies and moments, let the model find the connections.' },
      { b: 4, h: 'Research is mandatory', q: 'Research the customer, their challenges, outages, locations. Research Cloud Control.', p: 'Grounding beats guessing. The customer first, then Cisco read through the customer\'s lens.' },
      { b: 5, h: 'One shot, no questions', q: 'Do not ask any questions. This is a one-shot task.', p: 'It tells the model it has the authority to answer its own questions: decide, act, document the assumption.' },
      { b: 6, h: 'Time budget', q: 'You have five hours of work.', p: 'Sets ambition and a stop condition. It may think deeply, and it must ship inside the window.' },
      { b: 7, h: 'Create a masterpiece', q: 'Make this a masterpiece.', p: 'A bar it must define and grade itself against. It ranks its ideas and loops until the work clears it.' },
    ],
    notes: [
      'This is the heart of it. I am not going to show you my exact prompts, because the words do not matter. The structure does. Every verse came from the same eight blocks. The quotes on screen are real fragments from the verse chats, typos removed.',
      'Block one, the medium. Build a Three.js visualization, the npm package. I am naming a canvas the model is spectacular at, and the output is code: one link, or one HTML file I can run offline and send to anyone.',
      'Block two, the customer. Just the name, and where they are. That proper noun is a key to the public record: sites, filings, leaders, outages, and the technology they publish about themselves.',
      'Block three, story and audience. Who is in the room and what I want to discuss. For Gary, the CISO was in the room and I asked for it organized by department so the customer could navigate it any way they want. One sentence of audience changes the whole output. I learned that the hard way on Dominion, which I will show you.',
      'Block four, key items. The must haves: it must include Splunk, patching, pre and post checks, ThousandEyes, Agent Builder. But I never tell it what to do with them. Ingredients, not recipe.',
      'Block five, research, and it is mandatory. Research the customer, their challenges, their outages, every location. Then research Cisco through that lens. For CSL it pulled every donation center onto one map. This is the ReAct pattern from the research literature: reason, act, observe, repeat.',
      'Block six: do not ask me any questions, this is a one-shot task. People ask why. It is not rudeness. It tells the model it has the authority and the ability to answer its own questions. OpenAI\'s GPT-5 prompting guide recommends almost the same language: do not hand back on uncertainty, pick the most reasonable assumption, proceed, and document it.',
      'Block seven, the time budget: you have five hours of work. It sets the ambition, five hours implies something substantial, and it sets a stop condition. Research on test-time compute backs this up: models do better when they are allowed to think longer. Funny enough, round one usually finishes in about an hour.',
      'Block eight, the one people laugh at: make this a masterpiece. It forces the model to define what a masterpiece is, rank its own ideas, and loop until it believes it has one. I have watched it test something, decide that is not a masterpiece, and keep going. That is self critique, the Self-Refine idea from the research, and OpenAI\'s guide literally suggests having the model build a world class rubric and start again if it is not hitting top marks. That one sentence is why round one comes out nearly production ready.',
    ],
  },
  {
    id: 'galaxy',
    eyebrow: '04 · The multiverse',
    title: 'Seven worlds, one method.',
    grad: 'Each one taught the next.',
    lead: 'Three originals, then a verse for every mentor who asked.',
    beats: [
      { h: 'The lineage', p: 'Delta, NYU Langone, and MSK first. Then GaryVerse for T. Rowe Price, AnuVerse for CSL Plasma and Dominion, AllenVerse for MetLife, and SEVerse to package the method.' },
      { h: 'Nights, weekends, about $544', p: 'Frontier model tokens on my own credits. One deal pays for it many times over.' },
    ],
    notes: [
      'So what did that method produce? Seven worlds, and each one taught the next. Three originals: Delta, NYU Langone, and Memorial Sloan Kettering. Then Gary asked for one for a T. Rowe Price executive briefing. Anu asked for CSL Plasma, and later Dominion Energy. Allen asked for MetLife, which is the latest evolution. And SEVerse is where I packaged the method itself.',
      'Click. For honesty: nights and weekends, about five hundred and forty four dollars of model tokens on my own credits. As you watch each world, look at the prompt logic chips at the bottom left. That is the part you are taking home.',
    ],
  },
  {
    id: 'delta',
    eyebrow: '04 · Original · Delta Air Lines',
    title: 'Deltaverse.',
    grad: 'A living model of ATL.',
    lead: 'The world\'s busiest airport, live weather, and one traveler\'s day worked by the whole Cisco portfolio.',
    verse: true,
    prompt: [['medium', 'Three.js airport'], ['customer', 'Delta at Hartsfield-Jackson'], ['story', 'traveler journeys, with and without Cisco'], ['items', 'Webex Contact Center, Spaces, ThousandEyes, Splunk'], ['research', 'airport layout, live KATL weather'], ['masterpiece', '']],
    beats: [
      { h: 'It researched the layout', p: 'Domestic terminal, concourses T through F, the Plane Train underneath. Scott confirmed: that is how ATL is laid out.' },
      { h: 'Twelve operations personas', p: 'From the NOC lead to the baggage manager. Kiosk blind spots, gate readiness, a 4 AM COO view of the day.' },
      { h: 'Live, not static', p: 'Live KATL weather, Webex Contact Center and Spaces in the traveler journey. A world you can walk through.' },
    ],
    notes: [
      'The first original, the Deltaverse. I asked it to mimic the Atlanta airport and I did not give it a map. It researched the layout. When I showed Scott, he said that is exactly how it is laid out: domestic terminal, concourses T through F, the Plane Train running underneath.',
      'Click. Twelve operations personas, from the NOC lead to the baggage manager. One story came straight from Scott: kiosks are a blind spot. A ThousandEyes agent on the kiosk sees the failure first, and the gate agent stops sending people to the broken booth. And the COO wants to wake up at 4 AM and know by six whether the day is green or yellow.',
      'Click. And it is live. It pulls real KATL weather, and the traveler journey runs through Webex Contact Center and Spaces. These are not technical stories. They are line of business stories, and it started as a sentence.',
    ],
  },
  {
    id: 'nyu',
    eyebrow: '04 · Original · NYU Langone Health',
    title: 'NYULH Verse.',
    grad: 'A day at NYU Langone.',
    lead: 'Six lenses, 27 scenarios, live KPIs, weather events, and the same moment told two ways.',
    verse: true,
    prompt: [['medium', 'Three.js campus'], ['customer', 'NYU Langone, Manhattan'], ['story', 'a day told as stories, by lens'], ['items', 'Spaces, Webex, Splunk, ThousandEyes, Secure Access, Cloud Control'], ['research', 'their buildings and published ecosystem'], ['oneshot', '']],
    beats: [
      { h: 'Their campus, their ecosystem', p: 'The model rebuilt the campus and drew the ring of technologies NYU publishes about itself.' },
      { h: 'Six lenses, 27 scenarios', p: 'Leadership, clinical, labs, network and security, facilities, patients. Live KPIs and weather events.' },
      { h: 'Lost cart: with Cisco vs manual', p: 'The same moment replayed both ways. Spaces finds the cart in minutes; the manual hunt takes the shift.' },
    ],
    notes: [
      'The second original, NYU Langone. It rebuilt their campus, and then did something I never asked for: it drew a halo of the technologies NYU publishes about itself. If your customer is publish forward, this method gets real very fast.',
      'Click. Six lenses and twenty seven scenarios: leadership, clinical, labs, network and security, facilities, and patients, with live KPIs and weather events. Anu taught me that a story needs a protagonist, like a movie, so every scenario follows a person.',
      'Click. And this is the one people remember: the lost cart, with Cisco versus manual. The same moment replayed both ways. Every scenario has a counter story, because the cost of doing nothing is the most persuasive slide you never have to show.',
    ],
  },
  {
    id: 'msk',
    eyebrow: '04 · Original · Memorial Sloan Kettering',
    title: 'MSK Operations Twin.',
    grad: 'Told through the people in it.',
    lead: 'The York Avenue campus, seven leader lenses, and what changes on their hardest days.',
    verse: true,
    prompt: [['medium', 'Three.js (npm) operations twin'], ['customer', 'MSK, York Avenue campus'], ['story', 'leaders on their hardest days'], ['items', 'Webex, Spaces, Cloud Control, Splunk, where AI runs'], ['time', '6 hours'], ['masterpiece', '']],
    beats: [
      { h: 'Floors, towers, elevators', p: 'One screenshot with a highlighted area, and the next version had elevator shafts, moving cars, and floors you can drill into.' },
      { h: 'Seven leader lenses', p: 'Leadership, hospital ops, clinical ops, network and security, facilities, public safety, patient and family. 17+ scenarios.' },
      { h: 'The missing medication cart', p: 'Found in 3 minutes with Cisco, 47 minutes without. Splunk as the data layer, AI systems tagged where they actually run.' },
    ],
    notes: [
      'The third original, MSK. Context: this team did not even want a demo. I snuck it in, they loved it, and the leader said if we want to buy something we will call you. So this verse is about helping his team see it and sell it upward.',
      'Click. The first maps were honestly rough. I took a screenshot, highlighted an area, and said these columns should be elevators. The next version had elevator shafts with moving cars and floors you can drill into. No technical guidance, just steering in plain language. Seven leader lenses, from hospital operations to public safety to patient and family.',
      'Click. And the story that lands: the missing medication cart. Three minutes with Cisco, forty seven without. Splunk is the data layer, and every place AI actually runs in the hospital is tagged, which opens a conversation about Secure AI Factory and AI Defense without a single slide.',
    ],
  },
  {
    id: 'gary',
    eyebrow: '04 · Evolution · GaryVerse',
    title: 'GaryVerse.',
    grad: 'Built for a T. Rowe Price EBC.',
    lead: 'An executive briefing for Gary Schives, Account Manager and former SE. Six teams, eight places, 24 scenarios.',
    verse: true,
    prompt: [['medium', 'Three.js (npm) visualization'], ['customer', 'T. Rowe Price, CISO in the room'], ['story', 'by department: NetOps, Leadership, Customer, Partners, Ops, Facilities'], ['items', 'patching, Workflows, Agent Builder, pre and post checks, ThousandEyes, Splunk'], ['research', 'initiatives, outages, locations, Cloud Control']],
    beats: [
      { h: 'Research first, 40 sources', p: 'Initiatives, a cloud migration, an outage in the public record, the CISO. 19 Cloud Control use cases across six departments.' },
      { h: 'Steered to literal places', p: 'Round one was a galaxy and a globe. Gary wanted their places and people. Round two: boardroom, offices, home, and the client experience.' },
      { h: 'Leadership asks AI Canvas', p: '"Where do we stand?" answered from live evidence, without pulling engineers off the fix.' },
    ],
    notes: [
      'GaryVerse. Gary Schives, an Account Manager and former SE, had a T. Rowe Price executive briefing, with the CISO in the room. My brief was a wall of notes: they are a Dell shop moving to the cloud, nobody talks about AI so AI use cases help, include patching, pre and post checks, ThousandEyes and the Splunk data fabric, and organize it by department so the customer can navigate it any way they want. The research worker pulled forty sources and nineteen Cloud Control use cases.',
      'Click. Here is the iteration lesson. Round one was a galaxy hub and a globe. Beautiful, and wrong. Gary wanted their places and their people. So round two narrowed the triangle: literal scenes of the boardroom, the offices, a client at home. That preference is now saved, so every verse since starts there.',
      'Click. And it found a storyline even the BU does not tell well. In an outage, leadership jumps on the bridge and troubleshooting stops so explaining can start. Here, leadership asks AI Canvas: where do we stand, what is the business impact. The answer comes from live evidence, and nobody gets pulled off the fix.',
    ],
  },
  {
    id: 'workshop',
    eyebrow: '05 · Workshop',
    title: 'Your account, eight blocks.',
    grad: 'Build your verse now.',
    lead: 'Fill in the blocks. Keep the constraints. Let it run.',
    layout: 'workshop',
    beats: [{ h: 'Fill', p: '' }, { h: 'Run', p: '' }, { h: 'Share', p: '' }],
    notes: [
      'Your turn. Everybody pick one account you are working right now. On screen is the framework as fill in the blank. Give me an account, a location, what you want to discuss, who is in the room, and the key items. Do not touch the constraints: research is mandatory, no questions, a time budget, and a masterpiece. Then hit copy. Watch the base of the pyramid fill in as you type.',
      'Click. I am starting a ten minute timer. Paste it into Cursor, Claude, or ChatGPT, whichever you have. Better yet, hit the microphone and speak it. Then do not steer. Let it research, and watch what it decides to look up.',
      'Click. Let\'s share out. What did it find about your customer that you did not know? And if you had one sentence for round two, what would it be? That second sentence is where you start narrowing the triangle.',
    ],
  },
  {
    id: 'anu',
    eyebrow: '04 · Evolution · AnuVerse',
    title: 'CSL Plasma, then Dominion.',
    grad: 'One center out ripples to the next.',
    lead: 'For Anu, my BSA mentor. About 300 donation centers on one living map, 60+ stories.',
    verse: true,
    prompt: [['medium', 'Three.js (npm) visualization of their sites'], ['customer', 'CSL Plasma, deputy CIO'], ['story', 'patients, operations staff, leadership; by persona or technology'], ['items', 'every product under Cloud Control; it must include Splunk'], ['research', 'public challenges, outages, every location, their apps']],
    beats: [
      { h: 'The transcript was the brief', p: 'I dropped in my 1:1 with Anu. The model identified the customer, pulled every center, and organized it the way Anu described.' },
      { h: 'The Ripple: two centers', p: 'Mobile and Pensacola. One center goes dark and donors drive to the next. Function, persona, and technology views.' },
      { h: 'A champion leave-behind', p: '"Every donation depends on the network." A three minute narrated story that plays on a phone.' },
      { h: 'Dominion: one sentence of audience', p: 'I told it an internal Splunk leader. It was a director reporting to the CIO. One rerun: a customer facing briefing.' },
    ],
    notes: [
      'AnuVerse. I met with Anu, showed him a gamified customer journey, and he gave me guidance. I dropped the transcript into Cursor and said: review this and come up with a game plan for the customer he mentioned. I thought it was a dialysis company. The model read the transcript and said, he is actually talking about CSL Plasma and their plasma centers. Then it pulled every location onto one map.',
      'Click. The lead story came straight from Anu\'s words: one center out affects another fifty miles away. The Ripple, with two centers, Mobile and Pensacola. When a center cannot check donors in, they drive to the next one, and that center\'s network suddenly matters twice as much. Sixty plus stories by function, persona, and technology.',
      'Click. Then a champion edition: "Every donation depends on the network." A three minute narrated story built to be shared with a customer champion as an idea generator that sparks interest internally.',
      'Click. And Dominion Energy, the lesson I promised. I told it Anu was meeting an internal Splunk leader. He was actually meeting a director who reports to the CIO. One sentence of audience, one rerun, about thirty one minutes, and it became a customer facing IT leadership briefing. Anu\'s favorite part was not the visuals. It was the questions it generated to validate with the account team.',
    ],
  },
  {
    id: 'allen',
    eyebrow: '04 · Latest evolution · AllenVerse',
    title: 'MetLife AgenticOps 4D.',
    grad: 'Business outcomes, not IT problems.',
    lead: 'For Allen Malanda, who asked for one and went on PTO. Ten real locations, ten business moments.',
    verse: true,
    prompt: [['medium', '4D gamified Three.js (npm) system'], ['customer', 'MetLife locations across the globe'], ['story', 'business outcomes; also teaches account teams'], ['items', 'every scenario gets an audio overview and walkthrough'], ['research', 'their business, expensive issues, resiliency'], ['oneshot', 'Do not ask any questions'], ['time', 'five hours'], ['masterpiece', 'Make this a masterpiece']],
    beats: [
      { h: 'All eight blocks, in one breath', p: 'The cleanest version of the method. Every block present, spoken, one shot.' },
      { h: 'Ten missions at ten real sites', p: 'Each mission ties a weak IT signal to a MetLife New Frontier commitment, then replays the day with traditional IT and with AgenticOps.' },
      { h: 'Present, Play, Learn', p: 'A 4D timeline, modeled business exposure, and an Account Team Academy so the account team learns the story too.' },
    ],
    notes: [
      'AllenVerse, the latest evolution. Allen asked for one and then went on PTO, so I asked the questions I think this team would ask. Research MetLife\'s business, the expensive issues Cloud Control can alleviate, their resiliency strategy. Build a realistic four dimensional gamified system. Do not ask any questions. You have five hours. Make this a masterpiece. This is a one shot task. Every one of the eight blocks, in one breath.',
      'Click. Ten missions at ten real MetLife locations. Each one ties a weak IT signal to one of their public New Frontier commitments, then replays the same day two ways, with traditional IT and with AgenticOps. The exposure numbers are modeled and labeled that way, but the commitments are theirs.',
      'Click. And three modes: Present, Play, and Learn. Learn is an Account Team Academy, because I wanted the account team to learn the business impact, not just the product. That is how a verse becomes enablement.',
    ],
  },
  {
    id: 'severse',
    eyebrow: '04 · The method, packaged · SEVerse',
    title: 'From boxes to business outcomes.',
    grad: 'The method became a skill.',
    lead: 'An AI leadership explainer, and a reusable Cisco branded skill anyone can install.',
    verse: true,
    prompt: [['medium', 'narrated explainer site'], ['story', 'a massive shift is coming; seven twins as proof'], ['items', 'premium narration, captions, password protected'], ['masterpiece', 'turn the design into a reusable skill']],
    beats: [
      { h: 'An explainer for leadership', p: 'Narrated, password protected, the whole multiverse as proof that the unit of value changed.' },
      { h: 'Then: package the method', p: 'I asked it to turn the design into a cisco-branded skill: colors, typography, particle formations, components, copy rules.' },
      { h: 'This talk was built with it', p: 'The palette, the glass, the morphing particles, the bridge bars. You are looking at the skill right now.' },
    ],
    notes: [
      'SEVerse is the meta one. First, an AI leadership explainer called From Boxes to Business Outcomes: narrated, password protected, using all the verses as proof that the unit of value has changed. Cloud Control and the Splunk data fabric turn the stack into one system that agents can act on.',
      'Click. Then I asked it to package the method. Turn this design into a reusable Cisco branded skill: the colorway, the typography, the particles that morph into a meaningful shape for every section, the components, and copy rules, like no em dashes. Content is generated per request. Install it, and every Cursor agent you run starts from the same brand system.',
      'Click. And this presentation was built with it. The midnight palette, the glass panels, the particle field that changes shape every scene, the Cisco bridge bars at the end. You are looking at the skill right now. That is the loop: build, learn, package, reuse.',
    ],
  },
  {
    id: 'fuel',
    eyebrow: '06 · The loop',
    title: 'Every conversation is context.',
    grad: 'Transcripts are fuel.',
    lead: 'Record everything. The transcript is the richest brief you will never have to write.',
    beats: [
      { h: 'Conversation becomes context', p: 'Customer calls, internal syncs, BU deep dives. AnuVerse started as a 1:1 transcript.' },
      { h: 'Context becomes a world', p: 'Transcript plus research plus the eight blocks becomes a verse, a talk track, or a lesson plan.' },
      { h: 'The world starts the next conversation', p: 'Which creates the next transcript. Each loop narrows the triangle.' },
    ],
    notes: [
      'So how does this become a habit? I say it all the time and people look at me funny: record everything. Every conversation has context you can build on. When a BU team walked me through topologies I had never seen, I was not worried. I knew I would grab the transcript and ask for a visual learning map. For one account I dropped two customer calls, one internal call, and a screenshot of their design into Cursor and got a 3D learning lab of their internet core, with packet walks, before my experts went on PTO.',
      'Click. The transcript plus mandatory research plus the eight blocks becomes the verse. Or the talk track. Or the lesson. Keith did this with a TAC engineer\'s notes and suddenly understood why the recommendations were made.',
      'Click. And the verse starts the next conversation, which creates the next transcript. This presentation was built exactly that way, from my conversations with Scott, Anu, Keith, and Steve this week.',
    ],
  },
  {
    id: 'guardrails',
    eyebrow: '06 · The loop',
    title: 'Art of the possible.',
    grad: 'Grounded in fact, vetted by people.',
    lead: 'An idea generator built on real sources. Vet it before it leaves the building.',
    beats: [
      { h: 'Mock data, real context', p: 'Numbers are synthetic or modeled and labeled that way. Places, published ecosystems, and Cisco capabilities come from public sources and Cisco docs.' },
      { h: 'Ask it where it got that', p: 'It once made Cloud Control the hospital\'s clinical orchestrator. I said change that. Question sources, then vet with the account team and the BU.' },
      { h: 'Internal first, customer when earned', p: 'Not approved collateral. No competitor comparisons, mind IP and publishing rules, keep secrets out of prompts and pages.' },
    ],
    notes: [
      'A word on trust, because Steve and Anu both pushed me here. The data is mock or modeled, and labeled that way. The places, the published ecosystems, and the Cisco capabilities come from public sources and our documentation. It is an idea generator, grounded in fact.',
      'Click. And it does get things wrong. One version made Cloud Control the orchestrator for clinical operations. I said change that, I do not want to mislead anyone. If something looks off, ask it where it got that. It will show you, or it will fix it. Then vet with the account team and the BU expert.',
      'Click. These are internal enablement tools first, not Cisco approved collateral. Keep competitor comparisons out, mind IP and publishing rules, and keep credentials out of prompts and pages. I learned that one when I pasted an API key into a chat and had to rotate it. The goal is to spark the idea inside the account team, then earn the customer version.',
    ],
  },
  {
    id: 'close',
    eyebrow: '07 · Epilogue',
    title: 'The way we tell stories must change.',
    grad: 'The next one is a spoken word away.',
    lead: 'The same flip Cloud Control gives a Tier 1 engineer, these tools give every SE and BSA.',
    layout: 'hero',
    beats: [
      { h: 'Same flip, same shape', p: 'Agentic reach at the base. Hard problems arrive with context. Iterate to the peak.' },
      { h: 'This week', p: 'Record one call. Speak the eight blocks for one account. Let it run. Share your verse with this team.' },
    ],
    notes: [
      'Let me bring it home. The flip Cloud Control does for a tier one engineer, agentic reach at the base so hard problems arrive with context, is exactly what these tools do for us as storytellers. Start at the solid base, then iterate to the peak.',
      'Click. My ask for this week: record one call. Pick one account and speak the eight blocks. Do not let it ask questions, give it time, ask for a masterpiece, and let it run. Then share what you build with this team. The slide deck era is ending, and the big thinkers and storytellers in this room are exactly the people who should lead what comes next. Thank you.',
    ],
  },
];

export const SOURCES = [
  ['Cisco Blogs, Cisco Cloud Control is generally available for U.S. customers (Aug 25, 2026)', 'https://blogs.cisco.com/ai/cisco-cloud-control-us-general-availability'],
  ['Cisco Newsroom, Cisco unveils agentic platform for operating and defending critical IT infrastructure (Jun 2, 2026)', 'https://newsroom.cisco.com/c/r/newsroom/en/us/a/y2026/m06/cisco-unveils-agentic-platform-for-operating-and-defending-critical-it-infrastructure.html'],
  ['OpenAI, GPT-5 prompting guide: persistence and self-reflection rubrics', 'https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide'],
  ['Anthropic, Prompting best practices: be clear and direct, add context and motivation', 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices'],
  ['Yao et al., ReAct: Synergizing Reasoning and Acting in Language Models (ICLR 2023)', 'https://arxiv.org/abs/2210.03629'],
  ['Madaan et al., Self-Refine: Iterative Refinement with Self-Feedback (NeurIPS 2023)', 'https://arxiv.org/abs/2303.17651'],
  ['Snell et al., Scaling LLM Test-Time Compute Optimally (2024)', 'https://arxiv.org/abs/2408.03314'],
];

export const WORKSHOP_FIELDS = [
  { key: 'customer', label: 'Account', ph: 'e.g. Northwind Health', block: 'customer' },
  { key: 'where', label: 'Where they are', ph: 'e.g. 14 hospitals across Ohio', block: 'customer' },
  { key: 'story', label: 'What to discuss', ph: 'e.g. keeping clinical apps up during a storm', block: 'story' },
  { key: 'audience', label: 'Who is in the room', ph: 'e.g. VP of Infrastructure and the CISO', block: 'story' },
  { key: 'items', label: 'Key items', ph: 'e.g. ThousandEyes, Webex, patching, pre and post checks', block: 'items' },
  { key: 'hours', label: 'Time budget (hours)', ph: '4', block: 'time' },
];

// The one-shot brief, as it reads on the original workshop scene.
export function buildWorkshopPrompt(v) {
  const s = (x, d) => (x && x.trim() ? x.trim() : d);
  return [
    ['medium', 'Build an interactive Three.js (npm) 3D visualization, a single self contained web app I can present and share as a link.'],
    ['customer', `The customer is ${s(v.customer, '[ACCOUNT]')}, ${s(v.where, '[WHERE THEY ARE]')}. Show their real places and the people in them.`],
    ['story', `I want to discuss ${s(v.story, '[WHAT TO DISCUSS]')}. The audience is ${s(v.audience, '[WHO IS IN THE ROOM]')}. Organize it so they can navigate by persona or by technology, and tell every scenario with Cisco and without.`],
    ['items', `It must include: ${s(v.items, '[KEY ITEMS]')}, and Cisco Cloud Control with the Splunk data fabric.`],
    ['research', 'Research is mandatory: research the customer\'s business, initiatives, public challenges and outages, and locations, then research the Cisco solutions through that lens. Cite sources and label modeled data.'],
    ['oneshot', 'Do not ask me any questions. This is a one-shot task. Make reasonable assumptions and document them.'],
    ['time', `You have ${s(v.hours, '4')} hours of work.`],
    ['masterpiece', 'Create a masterpiece: define what world class means here, rank your ideas, and keep iterating until it clears that bar.'],
  ];
}
