// Narration for the narrated edition and off-camera talking points for the live
// edition. One entry per click, aligned with SCENES[i].notes in content.js.
// The narrator is an AI voice and says so; it tells Stephen's story in third person.

export const NARRATION = {
  title: [
    `Welcome. I am an AI narrator, standing in for Stephen Ewings, a Solutions Engineer at Cisco. Stephen built everything you are about to see, and he built it by describing it. No slides. This whole presentation is a 3D web app. Over the next fifteen minutes you will see seven customer worlds, the method behind them, and you will get the chance to start one of your own. Use the arrow keys or the controls below at any time.`,
  ],
  slides: [
    `Think about the last deck you sat through. Title, agenda, three bullets, an architecture diagram, next steps. We have told stories in rectangles for thirty years, and most customers can predict slide four before it appears.`,
    `A rectangle cannot show what it feels like to be the operator at two in the morning, the gate agent with a dead kiosk, or a plasma center manager who cannot check in a single donor. Those are the moments where Cisco actually matters, and decks flatten them into bullets.`,
    `What replaces the deck is interactive: web apps, live dashboards, narrated tours of the customer's own world. And the cost has collapsed. Work that once took an agency a quarter now takes a paragraph and a few hours of compute, and it is shared as a link.`,
  ],
  google: [
    `One of Stephen's mentors, Keith, put it simply: most people still use AI like Google. Ten words in, ten links out. That is like hiring a principal architect and asking them to fetch coffee.`,
    `On the other side of that box is a Swiss Army knife. It researches, designs, writes, codes, narrates, and yes, it can be genuinely funny. Cursor, Claude, and ChatGPT are not search engines. They are teammates that never get tired.`,
    `So the shift is easy to say and hard to do: stop querying, start briefing. Give it context, intent, freedom, and a bar to clear. Stephen barely types anymore. He speaks his briefs. The story really is a spoken word away.`,
  ],
  flip: [
    `Here is why this matters beyond storytelling. Watch the ticket. Today a tier one engineer troubleshoots, hands off to a senior engineer who starts over, who pulls in an architect. Look at the clock. What nobody measures is the time between the handoffs.`,
    `Now flip it. With Cisco Cloud Control, that same junior engineer has agentic reach: AI Assistant across domains, AI Canvas as a shared investigation space, ThousandEyes and Splunk evidence, and agents that spot, diagnose, fix, test, and confirm, with a human approving. Most tickets end at the base. Cisco shared a customer example at launch: a recurring issue that took more than ten hours by hand, resolved in under ten minutes in AI Canvas.`,
    `And when a problem truly is beyond reach, it climbs with the context already collected. Nobody starts from scratch. Hold on to this shape. It is exactly the shape of a good prompt.`,
  ],
  pyramid: [
    `When we use AI like Google, we start at the tip: one narrow question. Then we stack follow ups, brick by brick, handing over context it should have had from the start. It balances on a point, and it wobbles.`,
    `Flip it. Start at the bottom with a solid foundation: one rich, one-shot brief with everything the model needs, plus the freedom to find what it does not have. Round one lands most of the outcome, and each iteration narrows the focus.`,
    `Stephen compares it to racing. The old way, you are still in the garage designing the car when the season starts. With a solid base, the car is built and you are on the track, tuning. You iterate to optimize, not to design.`,
  ],
  anatomy: [
    `This is the heart of it. Every world in this presentation came from the same eight blocks. Not exact words, a structure. The quotes on screen are real fragments from Stephen's verse prompts.`,
    `Block one, the medium. Build a Three.js visualization. Name a canvas the model is spectacular at, and the output is code: one link, or one file you can run anywhere.`,
    `Block two, the customer. Just a name and a place. That proper noun unlocks the public record: sites, filings, leaders, outages, and the technology a company publishes about itself.`,
    `Block three, story and audience. Who is in the room, and what should they feel. Anthropic's own guidance says the same: give the model the motivation behind the ask. One sentence of audience can change everything, as you will see with Dominion.`,
    `Block four, key items. The must haves: it must include Splunk, patching, ThousandEyes, Agent Builder. Ingredients, not recipe. The model finds the connections.`,
    `Block five, research, and it is mandatory. The customer first, then Cisco, read through the customer's lens. This mirrors the ReAct pattern from the research literature: reason, act, observe, repeat.`,
    `Block six: do not ask any questions, this is a one-shot task. It is not rudeness. It tells the model it has the authority to answer its own questions. OpenAI's GPT-5 prompting guide recommends nearly the same language: pick the most reasonable assumption, proceed, and document it.`,
    `Block seven, the time budget: you have five hours of work. It sets the ambition and a stop condition. Research on test-time compute shows models do better when they are allowed to think longer.`,
    `Block eight, the one people laugh at: make this a masterpiece. It forces the model to define a bar, rank its own ideas, and loop until it clears it. That is self critique, the Self-Refine idea, and OpenAI's guide even suggests building a world class rubric and starting over if the work misses. That one sentence is why round one comes out nearly production ready.`,
  ],
  galaxy: [
    `So what did the method produce? Seven worlds, and each one taught the next. Three originals: Delta, NYU Langone, and Memorial Sloan Kettering. Then a verse for every mentor who asked: GaryVerse for T. Rowe Price, AnuVerse for CSL Plasma and Dominion Energy, AllenVerse for MetLife, and SEVerse, where the method itself was packaged.`,
    `For honesty: nights and weekends, and about five hundred and forty four dollars of model tokens on Stephen's own credits. As each world appears, watch the prompt logic chips. That is the part to take home.`,
  ],
  delta: [
    `The first original, the Deltaverse. Stephen asked it to mimic the Atlanta airport and gave it no map. It researched the layout itself: the domestic terminal, concourses T through F, and the Plane Train underneath. His mentor Scott confirmed it: that is exactly how ATL is laid out.`,
    `Twelve operations personas, from the NOC lead to the baggage manager. One story came straight from Scott: kiosks are a blind spot. A ThousandEyes agent on the kiosk sees the failure first, and the gate agent stops sending travelers to the broken booth.`,
    `And it is live, pulling real Atlanta weather, with Webex Contact Center and Cisco Spaces woven through a traveler's day. These are not technical stories. They are line of business stories, and it started as a sentence.`,
  ],
  nyu: [
    `The second original, NYU Langone Health. It rebuilt the campus, then did something nobody asked for: it drew a halo of the technologies NYU publishes about itself. If your customer is publish forward, this method gets real very fast.`,
    `Six lenses and twenty seven scenarios: leadership, clinical, labs, network and security, facilities, and patients, with live KPIs and weather events. Every scenario follows a person, because a story needs a protagonist.`,
    `And the one people remember: the lost cart, with Cisco versus manual. The same moment, replayed both ways. The cost of doing nothing is the most persuasive slide you never have to show.`,
  ],
  msk: [
    `The third original, the MSK Operations Twin. This team did not even want a demo. Stephen showed it anyway, they loved it, and the goal became helping that team see it and sell the idea upward.`,
    `The first maps were rough. Stephen took a screenshot, circled an area, and said these columns should be elevators. The next version had elevator shafts, moving cars, and floors you can drill into. No technical instructions. Just steering in plain language. Seven leader lenses, from hospital operations to public safety to patient and family.`,
    `The story that lands: the missing medication cart. Three minutes with Cisco, forty seven without. Splunk is the data layer, and every place AI actually runs in the hospital is tagged, which opens the AI Defense and Secure AI Factory conversation without a single slide.`,
  ],
  gary: [
    `GaryVerse. Gary Schives, an Account Manager and former SE, had a T. Rowe Price executive briefing with the CISO in the room. The brief was a wall of notes: a Dell shop moving to the cloud, nobody talks about AI so AI use cases help, include patching, pre and post checks, ThousandEyes, the Splunk data fabric, and organize it by department. Research pulled forty sources and nineteen Cloud Control use cases.`,
    `Then the iteration lesson. Round one was a galaxy and a globe. Beautiful, and wrong. Gary wanted their places and their people. Round two narrowed the triangle: a boardroom, offices, a client at home. That preference is now saved, so every verse since starts there.`,
    `And it surfaced a storyline even the business unit rarely tells. In an outage, leadership jumps on the bridge and troubleshooting stops so explaining can start. Here, leadership asks AI Canvas: where do we stand? The answer comes from live evidence, and no engineer is pulled off the fix.`,
  ],
  workshop: [
    `Your turn. Pick one account you are working right now and fill in the blocks on screen: the account, where they are, what you want to discuss, who is in the room, and the key items. The constraints are already set: mandatory research, no questions, a time budget, and a masterpiece. Watch the base of the pyramid fill in as you type, then copy the prompt. The film will pause here. Press play when you are ready.`,
    `Paste it into Cursor, Claude, or ChatGPT, or better yet, speak it. Then do not steer. Let it research, and watch what it decides to look up. You can start the ten minute timer on screen if you like.`,
    `When it finishes, ask yourself two questions. What did it find about your customer that you did not know? And what is your one sentence for round two? That second sentence is where you start narrowing the triangle.`,
  ],
  anu: [
    `AnuVerse. After a one on one with his mentor Anu, a Business Solutions Architect, Stephen dropped the transcript into Cursor and asked for a game plan for the customer Anu mentioned. Stephen thought it was a dialysis company. The model read the transcript and corrected him: Anu meant CSL Plasma and its donation centers. Then it pulled every center onto one map.`,
    `The lead story came straight from Anu's words: one center out affects another fifty miles away. The Ripple, two centers, Mobile and Pensacola. When one cannot check donors in, they drive to the next, and that network suddenly matters twice as much.`,
    `Then a champion edition: every donation depends on the network. A three minute narrated story, built for a customer champion to share internally as an idea generator.`,
    `And Dominion Energy, the audience lesson. Stephen told the model Anu was meeting an internal Splunk leader. He was actually meeting a director who reports to the CIO. One sentence changed, one rerun of about thirty minutes, and it became a customer facing briefing. Anu's favorite part was not the visuals. It was the questions it raised to validate with the account team.`,
  ],
  allen: [
    `AllenVerse, the latest evolution. Allen Malanda asked for one and went on PTO, so Stephen asked the questions a BSA would ask: research MetLife's business, the expensive issues Cloud Control can relieve, their resiliency strategy. Build a realistic four dimensional gamified system. Do not ask any questions. You have five hours. Make this a masterpiece. Every block, in one breath.`,
    `Ten missions at ten real MetLife locations. Each ties a weak IT signal to one of MetLife's public commitments, then replays the same day two ways: traditional IT, and AgenticOps. The exposure figures are modeled and labeled that way. The commitments are MetLife's own.`,
    `And three modes: Present, Play, and Learn. Learn is an Account Team Academy, so the account team learns the business impact, not just the product. That is how a verse becomes enablement.`,
  ],
  severse: [
    `SEVerse is the meta one. First, a narrated leadership explainer called From Boxes to Business Outcomes, using every verse as proof that the unit of value has changed. Cloud Control and the Splunk data fabric turn the stack into one system that agents can act on.`,
    `Then Stephen asked the model to package the method itself: a reusable Cisco branded skill with the colorway, typography, particle formations, components, and copy rules. Install it, and every agent starts from the same brand system.`,
    `And this presentation was built with that skill. The midnight palette, the glass, the particles that change shape every scene, the Cisco bridge bars at the end. Build, learn, package, reuse.`,
  ],
  fuel: [
    `How does this become a habit? Record everything. Every conversation has context you can build on. For one account, Stephen dropped two customer calls, an internal call, and a screenshot of the design into Cursor, and got a 3D learning lab of the customer's internet core, with packet walks, before his experts went on PTO.`,
    `The transcript plus mandatory research plus the eight blocks becomes the verse. Or the talk track. Or the lesson plan.`,
    `And the verse starts the next conversation, which creates the next transcript. This presentation was built exactly that way, from a week of conversations with Stephen's mentors.`,
  ],
  guardrails: [
    `A word on trust. The data in these worlds is mock or modeled, and labeled that way. The places, the published ecosystems, and the Cisco capabilities come from public sources and Cisco documentation. It is an idea generator, grounded in fact.`,
    `And it does get things wrong. One version made Cloud Control the orchestrator of clinical operations. Stephen told it to change that. If something looks off, ask where it came from, then vet it with the account team and the business unit expert.`,
    `These are internal enablement tools first, not approved collateral. Keep competitor comparisons out, mind IP and publishing rules, and keep credentials out of prompts and pages. Spark the idea inside the account team, then earn the customer version.`,
  ],
  close: [
    `To bring it home: the flip Cloud Control gives a tier one engineer, agentic reach at the base so hard problems arrive with context, is exactly what these tools give every SE and BSA as a storyteller. Start at the solid base, then iterate to the peak.`,
    `So here is the ask. Record one call this week. Pick one account and speak the eight blocks. Let it run. Then share what you build. The slide deck era is ending, and the storytellers who watch this are exactly the people who should lead what comes next. Thank you for watching.`,
  ],
};

// Talking points for Stephen, one list per click. Glanceable, not a script.
export const POINTS = {
  title: [['Thank the BSE team; Scott, Anu, Keith taught "one story, not one box"', 'No slides today: this is a 3D web app, built by describing it', 'By the end, you start your own']],
  slides: [
    ['Last deck you saw: title, agenda, 3 bullets, architecture, next steps', 'Customers can predict slide four'],
    ['Rectangles cannot show the 2 AM operator, the dead kiosk, the donor who cannot check in', 'Those moments are where Cisco matters'],
    ['Replacement: web apps, dashboards, narrated tours of their world', 'Agency quarter becomes a paragraph plus hours of compute', 'Shared as a link'],
  ],
  google: [
    ['Keith: "people still use it like Google"', 'Ten words in, ten links out', 'Principal architect fetching coffee'],
    ['Swiss Army knife: research, design, code, narrate, funny', 'Cursor, Claude, ChatGPT are teammates'],
    ['Stop querying, start briefing', 'Context, intent, freedom, a bar to clear', 'I speak my briefs: a spoken word away'],
  ],
  flip: [
    ['Watch the ticket climb: Tier 1, senior starts over, architect', 'Point at the clock: time between handoffs is never measured'],
    ['Flip: junior engineer gets agentic reach', 'AI Assistant, AI Canvas, ThousandEyes, Splunk, agents with human approval', 'Cisco GA example: 10+ hours to under 10 minutes'],
    ['Hard problems still climb, with context collected', 'Nobody starts over', 'Bridge: same shape as a good prompt'],
  ],
  pyramid: [['Google way starts at the tip, stacks follow ups', 'Balances on a point, wobbles'],
    ['Flip it: one rich one-shot brief is the base', 'Round one lands most of the outcome', 'Iterations narrow: map, focus mode, narration'],
    ['Racing analogy (told Keith)', 'Old way: still designing the car', 'Solid base: on the track, tuning']],
  anatomy: [
    ['Eight blocks, every verse', 'Structure, not exact words; quotes are real fragments', 'I speak them, rough, barely a period'],
    ['MEDIUM: Three.js (npm) visualization', 'Output is code: one link or one file'],
    ['CUSTOMER: name plus place', 'Unlocks public record: sites, filings, leaders, outages, published tech'],
    ['STORY + AUDIENCE: who is in the room, what they should feel', 'Gary: CISO in the room, organize by department', 'Tease the Dominion lesson'],
    ['KEY ITEMS: "it must include Splunk", patching, ThousandEyes, Agent Builder', 'Ingredients, not recipe'],
    ['RESEARCH is mandatory: customer first, then Cisco through their lens', 'CSL: every center on one map', 'ReAct: reason, act, observe'],
    ['ONE SHOT: "Do not ask any questions"', 'Gives it authority to answer its own questions', 'OpenAI GPT-5 guide: assume, proceed, document'],
    ['TIME BUDGET: "You have five hours"', 'Ambition plus stop condition', 'Test-time compute research; round one is usually about an hour'],
    ['MASTERPIECE: it defines the bar, ranks ideas, loops', 'Watched it reject its own work and keep going', 'Self-Refine; OpenAI rubric advice'],
  ],
  galaxy: [['Each world taught the next', 'Originals: Delta, NYU, MSK', 'Then Gary, Anu (CSL, Dominion), Allen (MetLife), SEVerse'],
    ['Nights and weekends, about $544 on my credits', 'Watch the prompt chips: that is the takeaway']],
  delta: [['"Mimic the Atlanta airport", no map given', 'It researched: terminal, T through F, Plane Train', 'Scott: "that is exactly how it is laid out"'],
    ['12 personas, NOC lead to baggage manager', 'Scott story: kiosks are a blind spot, ThousandEyes on the kiosk', '4 AM COO: green or yellow by six'],
    ['Live KATL weather', 'Webex Contact Center + Spaces in the traveler journey', 'Line of business stories, from one sentence']],
  nyu: [['Rebuilt the campus', 'Unasked: halo of the tech NYU publishes', 'Publish-forward customers get real fast'],
    ['6 lenses, 27 scenarios, live KPIs, weather', 'Anu: every story needs a protagonist'],
    ['Lost cart: with Cisco vs manual', 'Same moment both ways', 'Cost of doing nothing sells itself']],
  msk: [['Team did not want a demo; I snuck it in, they loved it', '"If we want to buy, we will call you"', 'Goal: help them sell it upward'],
    ['Screenshot, circle, "these should be elevators"', 'Next version: shafts, moving cars, drill-in floors', '7 leader lenses'],
    ['Missing medication cart: 3 min vs 47 min', 'Splunk as the data layer', 'AI tagged where it runs: AI Defense, Secure AI Factory']],
  gary: [['Gary Schives, AM and former SE; T. Rowe EBC, CISO in the room', 'Brief: Dell shop to cloud, AI use cases, patching, pre/post checks, by department', '40 sources, 19 Cloud Control use cases'],
    ['Round one: galaxy and globe, beautiful and wrong', 'Gary wanted their places and people', 'Preference saved: literal places every time since'],
    ['Outage: leadership on the bridge stops the fix', 'Leadership asks AI Canvas "where do we stand?"', 'Keith wanted to write that down']],
  workshop: [['Everyone pick a live account', 'Fill: account, where, discuss, who is in the room, key items', 'Leave constraints alone; watch the base light up; copy'],
    ['Timer starts now: 10 minutes', 'Paste into Cursor, Claude, ChatGPT, or speak it', 'Do not steer: watch what it researches'],
    ['Share out: what did it find you did not know?', 'Your one sentence for round two?', 'That is narrowing the triangle']],
  anu: [['Dropped my Anu 1:1 transcript into Cursor', 'I thought dialysis; model said CSL Plasma', 'Pulled every center onto one map'],
    ['Anu: "one center out affects another 50 miles away"', 'The Ripple: Mobile and Pensacola', 'Function, persona, technology views'],
    ['Champion edition: "Every donation depends on the network"', '3 minute narrated leave-behind'],
    ['Dominion: said internal Splunk leader, was a director reporting to the CIO', 'One sentence, one rerun (~31 min), customer facing', 'Anu loved the validation questions most; scored 8 to 9 of 10']],
  allen: [['Allen asked, went on PTO; I asked BSA questions', 'Read the prompt: all 8 blocks in one breath', '"You have five hours. Make this a masterpiece."'],
    ['10 missions at 10 real MetLife sites', 'Weak IT signal tied to a public commitment', 'Traditional IT vs AgenticOps; exposure is modeled'],
    ['Present, Play, Learn', 'Account Team Academy: verse becomes enablement']],
  severse: [['Leadership explainer: From Boxes to Business Outcomes', 'Narrated, password protected, verses as proof'],
    ['Asked it to package the method as a skill', 'Colorway, type, particles, components, copy rules', 'Install it, every agent starts on-brand'],
    ['This talk was built with that skill', 'Build, learn, package, reuse']],
  fuel: [['Record everything', 'Internet core lab: 2 customer calls, 1 internal, 1 screenshot', 'Built before my experts went on PTO'],
    ['Transcript + research + 8 blocks = verse, talk track, lesson', 'Keith: TAC notes became understanding'],
    ['Verse starts the next conversation', 'This talk came from this week with Scott, Anu, Keith, Steve']],
  guardrails: [['Mock or modeled data, labeled', 'Places, ecosystems, capabilities from public sources and Cisco docs', 'Idea generator, grounded in fact'],
    ['It gets things wrong: Cloud Control as clinical orchestrator', 'Ask "where did you get that?"', 'Vet with account team and BU'],
    ['Internal enablement first, not approved collateral', 'No competitor comparisons; mind IP and publishing', 'Keep keys out of prompts (I rotated one)']],
  close: [['Same flip as Cloud Control: reach at the base', 'Start at the solid base, iterate to the peak'],
    ['Ask: record one call this week', 'Speak the 8 blocks for one account; let it run; share it', 'Storytellers in this room should lead what comes next', 'Thank you']],
};

// Premium neural voices (pre-rendered with Microsoft neural TTS). Each gets an
// animated AI narrator persona in the presenter box.
export const VOICES = [
  { key: 'ava', voice: 'en-US-AvaMultilingualNeural', name: 'Ava', look: { skin: '#c98d6b', hair: '#2a1a12', style: 'long', shirt: '#00bceb', blazer: '#0d274d' } },
  { key: 'andrew', voice: 'en-US-AndrewMultilingualNeural', name: 'Andrew', look: { skin: '#8d5a3c', hair: '#120c08', style: 'short', beard: true, shirt: '#6cc04a', blazer: '#07182d' } },
  { key: 'emma', voice: 'en-US-EmmaMultilingualNeural', name: 'Emma', look: { skin: '#f1c7a5', hair: '#8a5a2b', style: 'bob', shirt: '#fbab18', blazer: '#0d274d' } },
  { key: 'brian', voice: 'en-US-BrianMultilingualNeural', name: 'Brian', look: { skin: '#e0ad8a', hair: '#3b2a1f', style: 'side', shirt: '#9be7ff', blazer: '#1a2433' } },
];
