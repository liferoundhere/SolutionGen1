---
name: cisco-3d-stage
description: Design system and engine for Cisco-branded 3D stage presentations, the "FutureSE talk" look. A Three.js web app that moves like a slide deck (arrow keys and clicks step through animations, up and down skip scenes), where every scene is its own lit 3D world with a new sky, a morphing particle formation, and a glass HUD, plus a presenter camera box, presenter and talking-points windows, an in-talk workshop builder, and an optional narrated film edition with premium neural voices and an animated AI narrator. Use when the user asks for a 3D or interactive presentation, a talk or keynote that is "not slides", "the FutureSE talk style", a narrated or self-playing version of a deck, or wants to present and share a story as a link. Content always comes from the request.
---

# Cisco 3D stage presentations

This skill is a **look and an engine, not a talk**. The topic, scenes, copy, and the 3D objects in each scene come from the user's request. What stays constant is how it is staged: deck-style navigation through a row of 3D worlds, the Cisco midnight palette and glass HUD, one sky and one particle field that change on every scene, crisp overlay labels, presenter tooling, and the narrated film option.

It extends the `cisco-branded` skill (palette, type, copy rules). If that skill is available, read its `references/design-system.md` too. Where they differ, this skill wins for presentations: it uses a fixed **stage** of scenes instead of a scroll page.

Look at `examples/` first. They are screenshots of the original build, the FutureSE talk for Cisco Business Solutions Engineering. They set the quality bar. Do not reuse their subject, wording, or customer names unless asked.

## What is fixed and what is dynamic

| Fixed every time | Dynamic per request |
| --- | --- |
| Deck navigation: steps, scene skips, deep links `#scene/step` | Number of scenes, steps per scene, order |
| Each scene is a 3D world at its own origin, reached by a camera flight | What each world contains (dioramas designed from the content) |
| Sky shader changes every scene (and optionally per step) | Sky colors and pattern mix per scene |
| One 7000 point field morphing to a new formation every scene | Which formation means what |
| Glass HUD: eyebrow, two-clause headline with `.grad`, lead, beats | All copy |
| Labels and panels on the OVERLAY layer, after bloom | Labels, screens, media |
| Presenter camera box bottom right, presenter window, talking points | Presenter name, talk track, talking points |
| Optional narrated edition: same stage plus `film.js` | Narration script, voices, where the film pauses |
| Headless review at 1440, 1280, 390 wide, no console errors | Whether there is a workshop, live links, sources |
| No em dashes in any output | Everything else in the words |

## Workflow

1. **Shape the talk.** Find the audience, the length, and the one change you want in the room. At about 150 spoken words per minute, a 20 minute talk is about 3000 words of notes, or 15 to 20 scenes and 50 to 60 clicks. If the user wants a one-shot build, do not ask questions. Decide, and state your assumptions.
2. **Write the scene list** in `js/content.js`. For each scene, write:
   - eyebrow, title, grad clause, lead;
   - `beats`, one per click;
   - `notes`, one paragraph per click, written for the ear;
   - optional `layout` (`hero`, `focus`, `workshop`, or the default stack);
   - optional `prompt` chips, `verse` live links, and media.
   One scene, one message. Mix layouts so the rhythm changes.
3. **Design one world per scene** with `references/scene-recipes.md`. Each world must show its scene's idea as an object or a system: a pyramid that flips, a wall of slides that folds into a sphere, an airport diorama, a city of departments. Each click changes something visible in the world (light a tier, pull a block forward, swap a screenshot). Pick a sky (`bg`, `bgSteps`) and a particle formation that differ from the neighbors.
4. **Scaffold.** Copy `starter/` and serve it with `python3 -m http.server 8765`. Read `starter/README.md`. Replace the sample scenes in `js/scenes.js` and the copy in `js/content.js` and `js/script.js`, and add formations in `js/particles.js`. The engine files (`main.js`, `core.js`, `background.js`, `film.js`, `avatar.js`, `kit.js`) normally need no edits.
5. **Presenter tooling** comes free: notes drawer, the P presenter window, the T talking-points window, the camera box, the scene menu, and the links panel. Write `POINTS` in `js/script.js`: 1 to 3 short bullets per click, read at a glance. See `references/presenting.md`.
6. **Narrated edition (when asked, or when the deck will be shared).** Write `NARRATION` (one paragraph per click, the AI narrator says it is AI), render the voices with `tools/gen_audio.py`, and build the copy with `tools/sync_narrated.sh`. See `references/narrated-edition.md`.
7. **Review.** Run `tools/review.mjs` on every scene at 1440 and 390 wide, open the images, and fix overlaps and empty frames. Test navigation, the presenter sync, and the film flow. See `references/review-and-publish.md`.
8. **Deliver.**
   - Publish both editions if asked. here.now works well, and it supports the range requests that audio seeking needs.
   - Generate `TALKING_POINTS.md`, `SCRIPT.md`, and the printable talk track with `tools/gen_docs.mjs`.
   - Offer a zip without `tmp/`, `node_modules/`, or credentials.

## Quality bar

- [ ] Every scene's world **means something for that scene**, and every click visibly changes the world, not just the HUD.
- [ ] The background changes on every scene change. Adjacent scenes never share a sky palette or a particle formation.
- [ ] Text never sits on bright geometry. Use the scrim, `setViewOffset` shift, diorama `scale`/`dpos`, and camera choices, and verify in screenshots.
- [ ] Labels and screenshots are crisp (OVERLAY layer), never washed out by bloom.
- [ ] Headlines are two clauses with a `.grad` outcome clause. Beats are short. Notes read well out loud.
- [ ] Arrow keys, Space, Enter, left and right click, Up and Down, Home and End, and the deep links all work. Typing in the workshop never navigates.
- [ ] Presenter and talking-points windows stay in sync both ways.
- [ ] Narrated edition: plays from one click, pauses where people need to act, captions highlight words, the narrator is labelled AI, and the scrubber can seek.
- [ ] At 390px: the HUD sits at the bottom, there is no horizontal overflow, and the control bar fits.
- [ ] No console errors. Facts are accurate or labelled modeled. Customer names and links are exactly as given.

## Copy rules

- Never use em dashes. Use commas, colons, semicolons, parentheses, or separate sentences.
- Headline: a statement, then the outcome in `grad` ("The slide deck era is ending." / "Customers want to step inside the story.").
- Eyebrows carry a number and a chapter name: `03 · The method`.
- Notes are spoken: short sentences, "Click." to mark a new step, no reading of bullets.
- The narrator is always disclosed as an AI voice and never impersonates the presenter.

## Security

- Never put API keys, tokens, or passwords in source, media, or published files. Hosting keys stay in the host CLI's credential file.
- Live links accept `https://` only, and edits made in the links panel stay in the browser's localStorage.
- The narrated audio is pre-rendered, so the published site makes no TTS or API calls and needs no keys.

## Files

- `references/stage-engine.md`: architecture, render pipeline, the scene contract, camera, sky, particles, overlay layer.
- `references/scene-recipes.md`: proven scene patterns and how to choreograph steps.
- `references/design-and-layouts.md`: palette, type, HUD layouts, components, motion, mobile.
- `references/presenting.md`: keys, presenter window, talking points, camera box, workshop, deep links, sync.
- `references/narrated-edition.md`: voices, audio pipeline, film player, captions, avatar, controls.
- `references/review-and-publish.md`: headless review, test recipes, publishing, deliverables.
- `starter/`: a runnable 7 scene sample that exercises every layout and both editions.
- `examples/`: screenshots of the original build.
