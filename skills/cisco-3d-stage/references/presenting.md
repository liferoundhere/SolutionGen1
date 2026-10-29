# Presenting

## Keys and mouse (stage)

| Input | Action |
| --- | --- |
| → · Space · Enter · PageDown · left click | Next step, then the next scene |
| ← · Backspace · PageUp · right click | Previous step |
| ↓ / ↑ · Shift + → / ← | Next or previous scene |
| Home / End | First or last scene |
| M | Scene menu |
| N | Notes drawer on stage |
| P | Presenter window |
| T | Talking points window |
| C | Webcam in the camera box (getUserMedia) |
| B | Hide or show the camera box |
| L | Open the scene's first live link |
| H | Hide the whole HUD (clean shot) |
| F | Fullscreen |
| , | Links panel (edit live link URLs, https only, saved in this browser) |
| ? | Key help |

- Clicks on UI elements (buttons, links, inputs, the workshop panel, the camera box, the topbar, the film bar) never navigate.
- Typing in inputs never navigates. Escape leaves an input.

## Windows that sync

All windows talk over one `BroadcastChannel` named `DECK.channel`. The messages are:
- `state {cur, step}` from the stage;
- `nav {dir: 1, -1, 2, -2}` and `goto {cur, step}` to the stage;
- `hello`, which asks the stage to rebroadcast.

The windows:
- **Presenter window** (`?presenter`, P): talking points as large bullets, the full note under them, a preview of the next click, back and next buttons, a scene list, and an elapsed clock.
- **Talking points window** (`talking-points.html`, T):
  - Built for a second screen while on camera.
  - Shows big bullets for the current click, the next click, and a scene outline you can click.
  - The pace clock compares elapsed time with a plan at 150 words per minute and reads "on pace", "ahead" or "behind". It starts on the first click.
  - S toggles the full script, and + or − changes the text size, which persists.
  - Standalone with arrow keys when the stage is not open.
- **Printable talk track** (`?talktrack`): every note, with live links and sources, laid out for print.

## Writing notes and points

- `notes[k]` is what the presenter says on click k. Mark new clicks with "Click." Aim for 25 to 80 words per click.
- `POINTS[id][k]` holds 1 to 3 bullets of 3 to 9 words: names, numbers, and the one phrase to land. Do not copy sentences from the notes.
- Keep the counts aligned. Every scene's `notes`, `beats` (for stack and focus layouts), `NARRATION` and `POINTS` arrays have the same length. `tools/export_narration.mjs` checks this.

## Camera box

- C asks for the webcam and shows it mirrored. If it is blocked, the hint explains why.
- During a meeting-app screen share, the presenter usually turns on the meeting camera and presses B to hide the box.
- The name tag reads `PRESENTER.name`.

## Workshop

- `WORKSHOP_FIELDS` render as inputs grouped by block color. `buildWorkshopPrompt(values)` returns `[blockKey, text]` segments, shown as color-underlined prompt text. A Copy button puts the prompt on the clipboard.
- The 3D base slabs light as fields fill: `workshopState.filled[i]` goes from 0 to 1, and `main.js` maps fields to blocks.
- The timer is 10 minutes, shown both in 3D and on the button. The presenter edition auto-starts it on workshop step 1. The narrated edition never auto-starts it.

## Deep links

`#scene/step`, for example `#11/0` for the workshop. Any `?mode` keeps the hash. Links also work for the narrated edition, together with `?voice=` and `?speed=`.
