// Narration for the narrated edition and off-camera talking points for the live edition.
// One entry per click, aligned with SCENES[i].notes in content.js (same counts).
// The narrator is an AI voice, says so, and tells Stephen's story in the third person.

export const NARRATION = {
  title: [
    'Welcome. I am an AI narrator, standing in for Stephen Ewings, a Solutions Engineer at Cisco. This talk was made for the Business Solutions Engineering team, and it is not a slide deck. It is a 3D web app that Stephen built by describing it. By the end, you will have started a customer world of your own. Use the arrow keys or the controls below at any time.',
  ],
  slides: [
    'Think about the last deck you saw. Title, agenda, three bullets, architecture, next steps. We have told customer stories in rectangles for thirty years, and most customers can predict slide four.',
    'A rectangle cannot show what it feels like to be the operator at two in the morning, the gate agent with a dead kiosk, or a plasma center that cannot check in a single donor. Those are the moments where Cisco matters most.',
    'What replaces the deck is interactive: web apps, dashboards, and narrated tours of the customer\'s own world. And the cost has collapsed. What once took an agency a quarter now takes a paragraph, a few hours of compute, and a link.',
  ],
  google: [
    'Most people still use AI like Google. Ten words in, a datasheet out. Stephen compares it to hiring a principal architect and asking them to fetch coffee.',
    'On the other side of that box is a Swiss Army knife. It researches, designs, writes, codes, narrates, and it can even be funny. Cursor, Claude, and ChatGPT are not search engines. They are teammates.',
    'So the shift is simple to say: stop querying, start briefing. Give context, intent, freedom, and a bar to clear. Stephen barely types anymore. He speaks the brief. The story really is a spoken word away.',
  ],
  flip: [
    'Here is the shape that changed how Stephen sees everything. Today a ticket climbs: tier one troubleshoots, a senior engineer starts over, then an architect. Nobody measures the time between the handoffs.',
    'Now flip it. With Cisco Cloud Control, the junior engineer has agentic reach: AI Assistant, AI Canvas, ThousandEyes and Splunk evidence, and agents that find, fix, test, and confirm, with a human approving. Cisco published a customer example at general availability: a recurring issue that took more than ten hours by hand closed in under ten minutes in AI Canvas.',
    'And when a problem truly is beyond reach, it climbs with the context already collected. Nobody starts from scratch. Hold on to this shape. It is exactly the shape of a good prompt.',
  ],
  pyramid: [
    'When we use AI like Google, we start at the tip with one narrow question, then stack follow ups brick by brick. It balances on a point, and it wobbles.',
    'Flip it. Start at the base with one rich, one-shot brief that holds everything the model needs, plus the freedom to go and get what it does not have. The first round lands most of the outcome.',
    'Stephen compares it to racing. The old way, you are still designing the car when the season starts. With a solid base, you are already on the track. You iterate to optimize, not to design.',
  ],
  anatomy: [
    'This is the heart of the method. The exact words do not matter. The structure does. Every verse came from the same eight blocks, and the quotes on screen are real fragments from the verse chats.',
    'Block one, the medium. Build a Three.js visualization. Name a canvas the model is spectacular at, and the output is code: one link, or one file you can send to anyone.',
    'Block two, the customer. Just the name and where they are. That proper noun unlocks the public record: sites, filings, leaders, outages, and the technology they publish.',
    'Block three, story and audience. Who is in the room and what should they feel. For one briefing the CISO was in the room, so the world was organized by department. One sentence of audience changes everything.',
    'Block four, key items. The must haves, like Splunk, patching, pre and post checks, ThousandEyes, and Agent Builder. Ingredients, not recipe.',
    'Block five, research, and it is mandatory. The customer first, then Cisco through the customer\'s lens. It is the reason, act, observe loop from the research literature.',
    'Block six. Do not ask any questions, this is a one-shot task. It gives the model the authority to answer its own questions, pick the most reasonable assumption, and document it.',
    'Block seven, the time budget. You have five hours of work. It sets the ambition and a stop condition. Funny enough, round one usually finishes in about an hour.',
    'Block eight, the one people laugh at. Make this a masterpiece. The model has to define the bar, rank its own ideas, and keep going until it clears it. That one sentence is why round one comes out nearly production ready.',
  ],
  galaxy: [
    'So what did the method produce? Seven worlds, and each one taught the next. Three originals for Delta, NYU Langone, and Memorial Sloan Kettering. Then verses for T. Rowe Price, CSL Plasma and Dominion, and MetLife. And SEVerse, where the method itself was packaged.',
    'For honesty: nights and weekends, about five hundred and forty four dollars of model tokens on Stephen\'s own credits. As each world appears, watch the prompt logic chips at the bottom left. That is the part to take home.',
  ],
  delta: [
    'The first original, the Deltaverse. Stephen asked it to mimic the Atlanta airport without giving it a map. It researched the layout: the domestic terminal, concourses T through F, and the Plane Train underneath.',
    'Twelve operations personas, from the NOC lead to the baggage manager. A ThousandEyes agent on a kiosk sees the failure first, and a COO can know by six in the morning whether the day is green or yellow.',
    'And it is live, with real weather for the Atlanta airport and a traveler journey through Webex Contact Center and Spaces. Line of business stories, started as a sentence. You can open it live from the button on screen.',
  ],
  nyu: [
    'The second original, NYU Langone. It rebuilt the campus, then did something nobody asked for: it drew a halo of the technologies NYU publishes about itself.',
    'Six lenses and twenty seven scenarios, from leadership and clinical to facilities and patients, with live KPIs and weather events. Every scenario follows a person, like a movie.',
    'And the one people remember: the lost cart, replayed with Cisco and without. The cost of doing nothing is the most persuasive slide you never have to show.',
  ],
  msk: [
    'The third original, Memorial Sloan Kettering. The team did not even want a demo, so this verse is about helping them see it and sell it upward.',
    'The first maps were rough. Stephen took a screenshot, highlighted an area, and said these columns should be elevators. The next version had moving elevator cars and floors you can drill into. Plain language, no technical guidance.',
    'And the story that lands: the missing medication cart. Three minutes with Cisco, forty seven without. Splunk is the data layer, and every place AI runs in the hospital is tagged.',
  ],
  gary: [
    'GaryVerse, built for a T. Rowe Price executive briefing, with the CISO in the room. The brief was a wall of notes. The research pulled forty sources and nineteen Cloud Control use cases.',
    'Here is the iteration lesson. Round one was a galaxy hub and a globe. Beautiful, and wrong. Gary wanted their places and their people, so round two narrowed the triangle to the boardroom, the offices, and a client at home.',
    'And it found a storyline even the business unit rarely tells. In an outage, leadership asks AI Canvas where things stand, the answer comes from live evidence, and nobody gets pulled off the fix.',
  ],
  workshop: [
    'Your turn. Pick one account you are working right now and fill in the blocks on screen: the account, where they are, what to discuss, who is in the room, and the key items. Leave the constraints alone, then copy the brief. The film will pause here. Press play when you are ready.',
    'Paste the brief into Cursor, Claude, or ChatGPT, or speak it. Then do not steer. Let it research and watch what it decides to look up. You can start the ten minute timer on screen if you like.',
    'What did it find about your customer that you did not know? If you had one sentence for round two, what would it be? That second sentence is where you start narrowing the triangle.',
  ],
  anu: [
    'AnuVerse began with a transcript. Stephen dropped a conversation with his mentor Anu into Cursor and asked for a game plan. The model worked out the customer was CSL Plasma, then pulled every donation center onto one map.',
    'The lead story came from Anu\'s own words: one center out affects another fifty miles away. The Ripple follows two centers, Mobile and Pensacola. Sixty plus stories by function, persona, and technology.',
    'Then a champion edition: every donation depends on the network. A three minute narrated story, built to be shared with a customer champion.',
    'And Dominion Energy, the audience lesson. The brief named the wrong audience. One corrected sentence and one rerun, about thirty one minutes, turned it into a customer facing IT leadership briefing, with questions to validate with the account team.',
  ],
  allen: [
    'AllenVerse, the latest evolution, for MetLife. Every one of the eight blocks in one breath: research the business, build a four dimensional gamified system, no questions, five hours, make it a masterpiece.',
    'Ten missions at ten real MetLife locations. Each ties a weak IT signal to a public New Frontier commitment, then replays the day with traditional IT and with AgenticOps. The exposure numbers are modeled, and labeled that way.',
    'Three modes: Present, Play, and Learn. Learn is an Account Team Academy, so the account team learns the business impact, not just the product. That is how a verse becomes enablement.',
  ],
  severse: [
    'SEVerse is the meta one. First, a narrated leadership explainer called From Boxes to Business Outcomes, using every verse as proof that the unit of value has changed.',
    'Then Stephen asked it to package the method as a reusable Cisco branded skill: the colors, the type, the particles that morph for every section, the components, and copy rules like no em dashes.',
    'And this presentation was built with it. The midnight palette, the glass, the morphing particles, the bridge bars. Build, learn, package, reuse.',
  ],
  fuel: [
    'How does this become a habit? Record everything. Every conversation carries context. Customer calls, internal syncs, and deep dives can all become a learning map or a lab.',
    'The transcript, plus mandatory research, plus the eight blocks, becomes the verse. Or the talk track. Or the lesson.',
    'And the verse starts the next conversation, which creates the next transcript. This presentation was built exactly that way.',
  ],
  guardrails: [
    'A word on trust. The data is mock or modeled, and labeled that way. The places, the published ecosystems, and the Cisco capabilities come from public sources and Cisco documentation.',
    'It does get things wrong. If something looks off, ask it where it got that. It will show you, or fix it. Then vet with the account team and the business unit expert.',
    'These are internal enablement tools first, not approved collateral. Keep competitor comparisons out, mind IP and publishing rules, and keep credentials out of prompts and pages.',
  ],
  close: [
    'To bring it home: the flip Cloud Control gives a tier one engineer is the same flip these tools give every storyteller. Start at the solid base, then iterate to the peak.',
    'The ask for this week. Record one call. Speak the eight blocks for one account. Let it run, and share what you build with the team. The next story is a spoken word away. Thank you for watching. I was your AI narrator.',
  ],
};

export const POINTS = {
  title: [['Thank Scott, Anu, Keith, the BSA crew', 'This talk is a 3D web app, built by describing it', 'You start your own in 20 minutes']],
  slides: [['30 years of rectangles', 'Customers predict slide four'], ['Operator at 2 AM, dead kiosk, plasma center', 'Where Cisco matters, flattened'], ['Interactive worlds replace the deck', 'Agency quarter to a paragraph']],
  google: [['Keith: still using it like Google', 'Architect fetching coffee'], ['Swiss Army knife teammate', 'Cursor, Claude, ChatGPT'], ['Stop querying, start briefing', 'I speak it, I barely type']],
  flip: [['Watch the ticket climb', 'Time between handoffs'], ['Cloud Control: agentic reach at the base', 'GA example: 10+ hours to under 10 min'], ['Escalations arrive with context', 'Same shape as a good prompt']],
  pyramid: [['Google way: balanced on a point', 'Context brick by brick'], ['One-shot brief at the base', 'Round one lands most of it'], ['Racing: on the track, tuning', 'So what goes in the base?']],
  anatomy: [['Structure, not exact words', 'Real chat fragments on screen'], ['Medium: Three.js, the output is code'], ['Customer: proper noun, public record'], ['Story + audience: CISO, by department', 'Dominion lesson coming'], ['Key items: ingredients, not recipe'], ['Research is mandatory', 'CSL: every center on one map', 'ReAct'], ['One shot: authority to decide', 'GPT-5 guide says the same'], ['Five hours: ambition + stop', 'Round one in about an hour'], ['Masterpiece: define the bar, loop', 'Self-Refine, rubric']],
  galaxy: [['Seven worlds, three originals', 'Gary, Anu, Allen, SEVerse'], ['Nights, weekends, about $544', 'Watch the prompt logic chips']],
  delta: [['No map given; it researched ATL', 'Scott: exactly how it is laid out'], ['12 operations personas', 'Kiosk blind spot, COO by six'], ['Live KATL weather', 'Webex Contact Center, Spaces', 'Press L to open it']],
  nyu: [['Halo of what NYU publishes', 'I never asked for it'], ['6 lenses, 27 scenarios', 'Every story has a protagonist'], ['Lost cart: Cisco vs manual', 'Cost of doing nothing']],
  msk: [['They did not want a demo', 'Help them sell it upward'], ['Screenshot, highlight: elevators', '7 leader lenses'], ['Cart: 3 min vs 47 min', 'Splunk data layer, AI tagged']],
  gary: [['T. Rowe Price EBC, CISO in the room', '40 sources, 19 use cases'], ['Galaxy was wrong', 'Round two: their places, their people'], ['Leadership asks AI Canvas', 'Nobody pulled off the fix']],
  workshop: [['Pick one account', 'Fill the blanks, keep the constraints', 'Copy'], ['10 minute timer', 'Paste or speak it; do not steer'], ['Share out: what did it find?', 'Your round two sentence']],
  anu: [['Transcript was the brief', 'It found CSL Plasma, not dialysis'], ['The Ripple: Mobile and Pensacola', '60+ stories'], ['Champion edition', '"Every donation depends on the network."'], ['Dominion: wrong audience, one rerun', 'About 31 minutes', 'Questions for the account team']],
  allen: [['Allen went on PTO', 'All eight blocks in one breath'], ['10 missions, 10 real sites', 'New Frontier commitments; exposure modeled'], ['Present, Play, Learn', 'Account Team Academy']],
  severse: [['From Boxes to Business Outcomes', 'Narrated, password protected'], ['Packaged as a cisco-branded skill', 'Copy rules: no em dashes'], ['This talk was built with it', 'Build, learn, package, reuse']],
  fuel: [['Record everything', 'Transcript to a 3D learning lab'], ['Transcript + research + 8 blocks', 'Keith and the TAC notes'], ['Verse starts the next conversation', 'Built from this week\'s calls']],
  guardrails: [['Mock or modeled, labeled', 'Public sources, Cisco docs'], ['Ask it where it got that', 'Vet with account team and BU'], ['Internal first, not collateral', 'No competitors; no keys in prompts']],
  close: [['Same flip, same shape', 'Solid base, iterate to the peak'], ['This week: record one call', 'Speak the eight blocks, share it', 'Thank you']],
};

// Premium voices are pre-rendered with tools/gen_audio.py (edge-tts neural voices).
// `look` drives the animated narrator in js/avatar.js. styles: long, short, bob, side.
export const VOICES = [
  { key: 'ava', voice: 'en-US-AvaMultilingualNeural', name: 'Ava', look: { skin: '#c98d6b', hair: '#2a1a12', style: 'long', shirt: '#00bceb', blazer: '#0d274d' } },
  { key: 'andrew', voice: 'en-US-AndrewMultilingualNeural', name: 'Andrew', look: { skin: '#8d5a3c', hair: '#120c08', style: 'short', beard: true, shirt: '#6cc04a', blazer: '#07182d' } },
  { key: 'emma', voice: 'en-US-EmmaMultilingualNeural', name: 'Emma', look: { skin: '#f1c7a5', hair: '#8a5a2b', style: 'bob', shirt: '#fbab18', blazer: '#0d274d' } },
  { key: 'brian', voice: 'en-US-BrianMultilingualNeural', name: 'Brian', look: { skin: '#e0ad8a', hair: '#3b2a1f', style: 'side', shirt: '#9be7ff', blazer: '#1a2433' } },
];
