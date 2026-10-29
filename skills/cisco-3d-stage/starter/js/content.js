// All on-screen copy, the talk track (notes), live links, sources, and the workshop
// template. One source of truth for the stage, the presenter window, the talking points
// page, and the printable talk track. Everything here is SAMPLE copy: replace it.
// Copy rules: two-clause headlines (title + grad outcome), no em dashes anywhere.

export const DECK = {
  name: 'Your deck',
  sub: 'Your talk title · Your audience',
  channel: 'cisco-stage',
  film: {
    blurb: 'An AI narrator walks you through this story step by step. Choose a narrator.',
    album: 'Your talk title',
  },
};

export const PRESENTER = {
  name: 'Presenter Name',
  role: 'Role, Cisco',
};

// Structure blocks. Reused by the focus scene, the prompt chips, and the workshop builder.
// Keep eight if you use the focus and workshop scenes as is.
export const BLOCKS = [
  { key: 'medium', label: 'Medium', hint: 'what to build', color: '#00BCEB' },
  { key: 'customer', label: 'Customer', hint: 'who and where', color: '#6CC04A' },
  { key: 'story', label: 'Story + audience', hint: 'who is in the room', color: '#FBAB18' },
  { key: 'items', label: 'Key items', hint: 'must include', color: '#F25C9A' },
  { key: 'research', label: 'Research', hint: 'look it up first', color: '#8E7CFF' },
  { key: 'oneshot', label: 'One shot', hint: 'decide, do not ask', color: '#FF6B4A' },
  { key: 'time', label: 'Time budget', hint: 'ambition + stop', color: '#2DE2C5' },
  { key: 'masterpiece', label: 'Masterpiece', hint: 'raise the bar', color: '#FFD95A' },
];

// Live links shown as buttons on the scene whose id matches `scene`. Overridable in the
// Links panel (stored in this browser only). https only.
export const VERSES = [
  { key: 'example', name: 'Example world', sub: 'A published build', color: '#6CC04A', scene: 'world', gen: 'Sample', url: 'https://example.com/' },
];

export const SCENES = [
  {
    id: 'title',
    eyebrow: '00 · Prologue',
    title: 'Your opening line.',
    grad: 'The outcome in one clause.',
    lead: 'One sentence that tells the room what they will leave with.',
    layout: 'hero',
    beats: [{ h: 'Presenter Name', p: 'Role, Cisco. Presenting to your audience.' }],
    notes: ['Open with why this room matters to you, then say what they will be able to do by the end.'],
  },
  {
    id: 'shift',
    eyebrow: '01 · The shift',
    title: 'The old way is ending.',
    grad: 'Something better replaces it.',
    lead: 'Name the change your audience already feels.',
    beats: [
      { h: 'What it was', p: 'The familiar pattern, in one line.' },
      { h: 'Where it breaks', p: 'The moment the old way cannot show.' },
      { h: 'What replaces it', p: 'The new medium, and why it is cheap now.' },
    ],
    notes: [
      'Describe the familiar pattern so the room nods.',
      'Click. Show the moment where it breaks, in human terms.',
      'Click. Name the replacement and what it costs today.',
    ],
  },
  {
    id: 'flip',
    eyebrow: '02 · The flip',
    title: 'Same problem, new shape.',
    grad: 'Start at the solid base.',
    lead: 'A visual analogy the audience already trusts.',
    beats: [
      { h: 'Balanced on a point', p: 'The old shape wobbles.' },
      { h: 'Flip it', p: 'Put the weight at the base.' },
      { h: 'Iterate to the peak', p: 'Each round narrows the focus.' },
    ],
    notes: ['Show the unstable shape.', 'Click. Flip it.', 'Click. Light it from the base up.'],
  },
  {
    id: 'method',
    eyebrow: '03 · The method',
    title: 'Eight blocks, every time.',
    grad: 'Logic over exact words.',
    lead: 'The structure underneath, one block per click.',
    layout: 'focus',
    beats: [
      { h: 'One structure', p: 'Every result came from the same blocks.' },
      { b: 0, h: 'Medium', q: 'Build an interactive 3D web app of ...', p: 'Name the canvas, not the slides.' },
      { b: 1, h: 'Customer', q: '... the account, and where they are.', p: 'A proper noun unlocks the public record.' },
      { b: 2, h: 'Story and audience', q: 'The CISO will be in the room.', p: 'Who is in the room changes everything.' },
    ],
    notes: ['Introduce the structure.', 'Click. Block one.', 'Click. Block two.', 'Click. Block three.'],
  },
  {
    id: 'world',
    eyebrow: '04 · Example',
    title: 'One world, built by describing it.',
    grad: 'Open it live.',
    lead: 'A diorama of the subject beside screenshots of the real build.',
    verse: true,
    prompt: [['medium', 'web app'], ['customer', 'the account'], ['items', 'must haves']],
    beats: [
      { h: 'What it is', p: 'One line on the build.' },
      { h: 'What it researched', p: 'The fact the model found on its own.' },
      { h: 'Why it landed', p: 'The reaction in the room.' },
    ],
    notes: ['Introduce the example.', 'Click. What it found.', 'Click. How the customer reacted. Press L to open it live.'],
  },
  {
    id: 'workshop',
    eyebrow: '05 · Workshop',
    title: 'Your turn.',
    grad: 'Build yours now.',
    lead: 'Fill the blocks, copy the brief, paste or speak it.',
    layout: 'workshop',
    beats: [{ h: 'Fill', p: '' }, { h: 'Run', p: '' }, { h: 'Share', p: '' }],
    notes: ['Everyone pick one account and fill in the form.', 'Click. Start the timer. Paste it and do not steer.', 'Click. Share out what it found.'],
  },
  {
    id: 'close',
    eyebrow: '06 · Epilogue',
    title: 'The closing line.',
    grad: 'The call to action.',
    lead: 'One sentence the room repeats on the way out.',
    layout: 'hero',
    beats: [{ h: 'The takeaway', p: 'One line.' }, { h: 'This week', p: 'One concrete ask.' }],
    notes: ['Bring it home.', 'Click. Your one concrete ask. Thank you.'],
  },
];

export const SOURCES = [
  ['Replace with the public sources you cite', 'https://example.com/'],
];

export const WORKSHOP_FIELDS = [
  { key: 'customer', label: 'Account', ph: 'e.g. Northwind Health', block: 'customer' },
  { key: 'where', label: 'Where they are', ph: 'e.g. 14 hospitals across Ohio', block: 'customer' },
  { key: 'story', label: 'What to discuss', ph: 'e.g. keeping clinical apps up during a storm', block: 'story' },
  { key: 'audience', label: 'Who is in the room', ph: 'e.g. VP of Infrastructure and the CISO', block: 'story' },
  { key: 'items', label: 'Key items', ph: 'e.g. the products and moments that must appear', block: 'items' },
  { key: 'hours', label: 'Time budget (hours)', ph: '4', block: 'time' },
];

export function buildWorkshopPrompt(v) {
  const s = (x, d) => (x && x.trim() ? x.trim() : d);
  return [
    ['medium', 'Build an interactive Three.js 3D visualization, a single self contained web app I can present and share as a link.'],
    ['customer', `The customer is ${s(v.customer, '[ACCOUNT]')}, ${s(v.where, '[WHERE THEY ARE]')}.`],
    ['story', `I want to discuss ${s(v.story, '[WHAT TO DISCUSS]')}. The audience is ${s(v.audience, '[WHO IS IN THE ROOM]')}.`],
    ['items', `It must include: ${s(v.items, '[KEY ITEMS]')}.`],
    ['research', 'Research is mandatory. Cite sources and label modeled data.'],
    ['oneshot', 'Do not ask me any questions. Make reasonable assumptions and document them.'],
    ['time', `You have ${s(v.hours, '4')} hours of work.`],
    ['masterpiece', 'Create a masterpiece: define what world class means here and iterate until it clears that bar.'],
  ];
}
