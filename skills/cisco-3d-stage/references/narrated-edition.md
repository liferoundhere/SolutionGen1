# Narrated edition

This is a second copy of the same deck that plays like a film. Anyone with the link can press play. The presenter edition stays untouched.

## How it is built

- `tools/sync_narrated.sh [dest]` copies the shared code into the narrated folder, keeps its `audio/`, and changes `<body>` to `<body data-edition="narrated">`.
- With that attribute, `main.js` dynamically imports `film.js` and passes it the `stage` API. Nothing else changes: the deck navigation, the presenter window and the talking points all still work.

## Script

- `NARRATION[id][k]` holds one paragraph per click, written for the ear, at about 150 to 170 words per minute.
- The narrator opens by saying it is an AI narrator standing in for the presenter, and tells the presenter's story in the third person.
- Name the pause where people need to act ("The film will pause here. Press play when you are ready.").
- Keep numbers speakable, for example "ten minutes" rather than "10:00".

## Audio pipeline

1. `node tools/export_narration.mjs tmp/narr.json` checks the counts and writes `{ ids, narr, voices }`.
2. `python3 tools/gen_audio.py tmp/narr.json <narrated>/audio` (needs `pip install edge-tts`):
   - Renders `audio/<voiceKey>/<scene>-<step>.mp3` with Microsoft neural voices through edge-tts, using `boundary="WordBoundary"`, six requests in parallel, and up to four retries.
   - Writes `audio/manifest.json`: `{ voiceKey: { "i-k": { words: [[offsetSec, durSec, text], ...], dur } } }`.
   - About 1.4 MB per spoken minute per voice. Four voices for a 16 minute film come to about 23 MB.
3. Default voices: Ava, Andrew, Emma and Brian (`en-US-*MultilingualNeural`). Each voice has a `look` for the avatar.

Pre-rendered audio means no runtime API, no keys, works offline, and gives identical timing for everyone.

## Player (`film.js`)

- **Start gate** (required by browser autoplay rules):
  - Voice cards with live avatar thumbnails and the runtime of each voice.
  - "Device voice" (Web Speech API, no avatar) and "Captions only" (silent, timed captions).
  - Speed and captions options.
  - Play the film, "Resume at <scene>" when the link was deep linked, Start from the beginning, and Explore without narration.
  - An AI disclosure line.
- **Engine**:
  - One `<audio>` element per clip.
  - Moving to a step cues its clip. The clip starts after 0.3 s within a scene, or 1.5 s after a scene change so the camera lands first.
  - When a clip ends, the film waits 0.9 s and then calls `stage.next()` if auto-advance is on.
  - `PAUSE_AFTER = { workshop: 0 }` stops the film and shows a toast with "Start the 10 minute timer" and "Continue the film".
  - The last step shows an end toast with Replay and Copy share link.
  - Manual navigation while playing plays the new step. Navigation while paused only cues it.
  - Stale timers are guarded by a token.
- **Clock and timeline**:
  - Clip time comes from `audio.currentTime`, the virtual clock in captions-only mode, or the boundary character index for the device voice.
  - The total timeline is the sum of clip durations plus gaps plus landing time.
  - The scrubber shows a tick per scene and a hover tip with the scene, step and time. Clicking seeks within a clip through `loadedmetadata`, then `currentTime`. The server must support HTTP range requests.
- **Captions**:
  - Manifest words are mapped to character offsets in the paragraph.
  - The paragraph is chunked into sentence-sized lines of at most 18 words.
  - Spoken words turn white and the current word glows ice blue. Captions hide between clips.
- **Controls bar** (auto-hides after 3 s of no mouse movement while playing):
  - Previous, play/pause, next and replay.
  - Time, and the current scene title.
  - CC, Auto, speed (0.75 to 2x, pitch preserved), voice, mute, volume.
  - Chapters (the scene menu), Share (copies `?voice=&speed=#i/s`), fullscreen.
- **Keys**: Space or K play/pause, [ and ] speed, S captions, A auto-advance, J replay, V cycle voice, 0 mute, - and = volume. The arrow keys still step.
- Preferences (voice, speed, volume, captions, auto) persist in localStorage. URL parameters `voice`, `speed` and `cc` override them.
- Media Session metadata, plus play, pause, next and previous handlers for hardware keys.

## Animated narrator (`avatar.js`)

- A Canvas 2D bust in the camera box, drawn every frame. It is deliberately stylized and clearly synthetic.
- The box carries an "AI" badge, and the name tag reads "<Name> · AI narrator · Business Solutions Architect" (change the role to fit the deck).
- `look: { skin, hair, style: long|short|bob|side, beard?, shirt, blazer }`.
- Motion:
  - Blinks every 2.2 to 5.8 s, with saccades and a return to center.
  - Breathing, head sway and tilt.
  - Nods and eyebrow raises on loud passages.
  - A blue rim light and halo that brighten while speaking.
  - Scanlines, a perspective grid, and a live level meter in the corner.
- **Lip sync**:
  - Amplitude comes from a WebAudio `AnalyserNode` (RMS of the time-domain data) on the audio element.
  - Mouth shape comes from the letter currently being spoken. A word's progress picks a letter, and the letter maps to a viseme (open, wide) pair: closed for m, b, p; round for o, u; wide for e, i; open for a.
  - If the analyser is unavailable, the word timings drive a synthetic envelope.
- The device voice shows an animated waveform orb instead of a person. Captions-only mode hides the box.
- If the viewer turns on their own webcam (C), it replaces the avatar.

## Mobile

- The camera box moves to the top right.
- The control bar keeps only previous, play, next, time, CC, speed and fullscreen.
- Captions span the full width above the bar.
