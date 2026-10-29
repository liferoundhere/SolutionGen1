## 1. Role and output
Use the cisco-3d-stage skill (read its SKILL.md and every file in references/ before writing code). Build an interactive 3D stage presentation from the skill's starter: a Three.js r170 web app with vendored Three.js, Inter and JetBrains Mono, plain ES modules and no build step. It moves like a slide deck: right arrow, Space, Enter and left click step through animations; up and down skip whole scenes; every scene is its own lit 3D world reached by a 1.9 second camera flight. Deliver two editions of the same deck: the presenter edition, and the narrated film edition (body attribute data-edition="narrated") with pre-rendered neural voices and the animated AI narrator. Presenter: {{PRESENTER}}.

## 2. The talk
Title: {{TALK_TITLE}}. Audience: {{AUDIENCE}}. The one change I want in the room: {{GOAL}}. Length: {{MINUTES}} minutes, about 150 spoken words per minute, so plan the scene count and clicks from that (a 20 minute talk is about 3,000 words of notes, 15 to 20 scenes, 50 to 60 clicks). Group scenes into chapters and number every eyebrow with its chapter: "00 · Prologue", "01 · The shift", "03 · The method".

## 3. Story arc
Shape the talk the way the FutureSE talk "A spoken word away" was shaped, adapted to this topic:
1. Prologue, hero layout: the bridge bars rise; one headline that names the change.
2. The shift (2 scenes): what the audience does today and why it stops working. Use the "old medium breaks" recipe (a wall of flat frames that tilt, wobble, then fold into a sphere) and a "search versus brief" style contrast if the topic has a before and after way of working.
3. The flip (2 scenes): a pyramid that balances on its point, flips onto a solid base, and lights tier by tier. Use it for the structural insight of the talk.
4. The method (1 scene, focus layout): the structure underneath, one numbered block per click, each with a block color, a heading, a quoted fragment in mono and a one-line explanation. Method blocks: {{METHOD_BLOCKS}}.
5. The examples (one scene each, world-and-screen recipe): a diorama of each example's real world beside a glass browser screen that steps through captures, with a live link button for each. Examples and links: {{EXAMPLES}}. Before them, a lineage galaxy scene shows the examples as glowing nodes on a spiral, joined by arcs in the order they were built.
6. Workshop ({{WORKSHOP}}): workshop layout; the audience fills a short brief, the 3D base slabs light as they type, a 10 minute timer appears, and the finished prompt copies with one click. The narrated film pauses here.
7. The loop and the guardrails (2 scenes): what keeps the method honest (loop recipe with documents flowing around a ring; hex shields that light two per click).
8. Epilogue, hero layout: bridge bars return over an audio-wave floor; the closing line.

Cisco content to weave through the examples and the flip: {{SCENARIO}}. It must include: {{KEY_ITEMS}}.

## 4. Scene authoring rules
- Write all copy in js/content.js. For every scene: id, eyebrow, title (a statement), grad (the outcome clause in the gradient), lead (one sentence), beats (one per click, each { h, p } and short), notes (one paragraph per click, written to be spoken, "Click." marks a new step, 25 to 80 words), optional layout (hero, focus, workshop, or the default stack), optional prompt chips ([[blockKey, text], ...] under the heading "Prompt logic"), optional verse: true for live links.
- One idea per scene, one change per click. Step 0 is the establishing shot. Every click changes the world, not just the text.
- Design one world per scene in js/scenes.js with the skill's kit (wireBox, gridFloor, person, plane, points, drawTube, arc, label, canvasPanel, glowSprite, mediaScreen, worldScene). The world must mean something for its scene: model the example's real, public layout where you can (terminals and concourses, hospital floors, a branch map) and label modeled data as modeled.
- Give every scene a sky (bg colors a, b, c and a mix of aurora, horizon grid, data rain, starfield) and a particle formation in js/particles.js. Adjacent scenes never share either. Turn the sky with the story through bgSteps: red or amber for the problem, blue or green after the fix.
- Mix layouts so the rhythm changes. Keep text off bright geometry with the left scrim, the view offset and diorama scale.

## 5. Presenter tooling
Keep everything the skill ships: presenter window (P), off-camera talking points window (T) with the pace clock, notes drawer (N), scene menu (M), camera box bottom right with the presenter's name tag, live link buttons (L), clean mode (H), printable talk track (?talktrack) and #scene/step deep links. Write POINTS in js/script.js: 1 to 3 bullets of 3 to 9 words per click, the names, numbers and the one phrase to land. Keep notes, beats, POINTS and NARRATION the same length for every scene.

## 6. Narrated edition
Write NARRATION in js/script.js, one paragraph per click at 150 to 170 words per minute, in the third person. The narrator opens by saying it is an AI narrator standing in for {{PRESENTER_NAME}} and never impersonates them. Name the pause at the workshop ("The film will pause here. Press play when you are ready."). Render Ava, Andrew, Emma and Brian with tools/gen_audio.py (edge-tts), build the copy with tools/sync_narrated.sh, and serve it with a range-capable server so the scrubber can seek. The film offers device voice and captions only as fallbacks.

## 7. Design rules
Follow the skill's design system exactly: midnight #050e1d ground, blue #00bceb accent, green #6cc04a outcome, amber and red only for problem states, the headline gradient #7fe3ff to #00bceb to #6cc04a on the outcome clause, Inter (CiscoSansTT first in the stack) and JetBrains Mono, glass panels rgba(7,24,45,0.82) with a 1px line border and 18px radius. Labels, panels and screenshots go on the OVERLAY layer after bloom so they stay crisp. Never use em dashes anywhere. {{BRAND_RULES}}

## 8. Research and truth
Research each example and the Cisco content in public sources first. Cite them in a sources list that the printable talk track shows. Customer names and links exactly as given. Facts are accurate or labelled modeled; no invented quotes or figures. Media screens show real captures of each build (1280x720 JPG, optional 6 to 12 second muted MP4); if you cannot capture one, draw it and label it as an illustration.

## 9. Way of working
Follow the operating rules at the top of this prompt. A complete, reviewed deck beats an ambitious unfinished one.

## 10. Review
Run tools/review.mjs at 1440x900, 1280x720 and 390x844 and open every screenshot. Fix text over bright geometry, empty frames, edge-on labels, screens off frame and overflow at 390px. Test arrow keys, clicks, up and down, Home and End, deep links, presenter and talking points sync, and the film flow (play, auto-advance, workshop pause, end card). No console errors. Grep for em and en dashes; there must be none.

## 11. Deliverables
Both editions, TALKING_POINTS.md, SCRIPT.md with the runtime of each voice, and TALK_TRACK.md from tools/gen_docs.mjs. {{PUBLISHING}}
