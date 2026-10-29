// Narration for the narrated edition and off-camera talking points for the live edition.
// One entry per click, aligned with SCENES[i].notes in content.js (same counts).
// The narrator is an AI voice and says so. SAMPLE copy: replace it.

export const NARRATION = {
  title: ['Welcome. I am an AI narrator, standing in for the presenter. Everything you are about to see is a 3D web app, and you can move through it with the arrow keys or the controls below.'],
  shift: [
    'Think about the familiar way this story is usually told, and how predictable it has become.',
    'Here is the moment the old way cannot show: the human situation where the change actually matters.',
    'What replaces it is something you can step inside, and today it costs a paragraph and a few hours.',
  ],
  flip: [
    'The old approach balances on a single point, and it wobbles.',
    'Flip it. Put the weight at the base, with everything the work needs up front.',
    'Then each round narrows the focus, from a solid foundation up to the peak.',
  ],
  method: [
    'This is the structure underneath. Not exact words, just the blocks that every result came from.',
    'Block one, the medium. Name the canvas you want, not the slides.',
    'Block two, the customer. A proper noun unlocks the public record.',
    'Block three, story and audience. Who is in the room changes everything about the output.',
  ],
  world: [
    'Here is one example, built entirely by describing it.',
    'Notice what it found on its own, without being told.',
    'And this is how the room reacted. You can open it live from the button on screen.',
  ],
  workshop: [
    'Your turn. Pick one account and fill in the blocks on screen, then copy the brief. The film will pause here. Press play when you are ready.',
    'Paste it into your AI tool, or speak it, and do not steer. You can start the timer on screen if you like.',
    'Share what it found that you did not know.',
  ],
  close: [
    'Let us bring it home, with the one idea worth repeating on the way out.',
    'And one concrete ask for this week. Thank you for watching.',
  ],
};

export const POINTS = {
  title: [['Why this room matters', 'What they leave with']],
  shift: [['The familiar pattern'], ['Where it breaks, in human terms'], ['The replacement and its cost today']],
  flip: [['Balanced on a point'], ['Flip it: weight at the base'], ['Iterate to the peak']],
  method: [['Structure, not exact words'], ['Medium: name the canvas'], ['Customer: proper noun'], ['Audience: who is in the room']],
  world: [['What it is'], ['What it found on its own'], ['The reaction; press L to open live']],
  workshop: [['Pick an account, fill the form', 'Copy the brief'], ['Timer on', 'Paste or speak it; do not steer'], ['Share out']],
  close: [['The takeaway'], ['This week: one ask', 'Thank you']],
};

// Premium voices are pre-rendered with tools/gen_audio.py (edge-tts neural voices).
// `look` drives the animated narrator in js/avatar.js. styles: long, short, bob, side.
export const VOICES = [
  { key: 'ava', voice: 'en-US-AvaMultilingualNeural', name: 'Ava', look: { skin: '#c98d6b', hair: '#2a1a12', style: 'long', shirt: '#00bceb', blazer: '#0d274d' } },
  { key: 'andrew', voice: 'en-US-AndrewMultilingualNeural', name: 'Andrew', look: { skin: '#8d5a3c', hair: '#120c08', style: 'short', beard: true, shirt: '#6cc04a', blazer: '#07182d' } },
  { key: 'emma', voice: 'en-US-EmmaMultilingualNeural', name: 'Emma', look: { skin: '#f1c7a5', hair: '#8a5a2b', style: 'bob', shirt: '#fbab18', blazer: '#0d274d' } },
  { key: 'brian', voice: 'en-US-BrianMultilingualNeural', name: 'Brian', look: { skin: '#e0ad8a', hair: '#3b2a1f', style: 'side', shirt: '#9be7ff', blazer: '#1a2433' } },
];
