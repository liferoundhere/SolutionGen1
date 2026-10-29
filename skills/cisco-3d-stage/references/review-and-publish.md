# Review and publish

## Headless review

- Chrome flags for WebGL in headless mode: `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`. For film tests, add `--autoplay-policy=no-user-gesture-required`.
- Software rendering runs at a low frame rate. Use `window.__stage.jump(i, s)` (instant, no flight), then wait about 6 to 7 s before each screenshot so damped values settle.
- `node tools/review.mjs <url> <w> <h> [list]` screenshots each scene into `tmp/review/` and prints console errors. Run it at 1440x900, 1280x720 and 390x844, then open every image.

What to look for:
- Text over bright geometry.
- Empty frames, where the camera target missed the world.
- Labels edge-on. `lookAt` needs world coordinates: add `group.position`.
- Screens off frame.
- Notes drawer peeking out.
- Workshop panel overlapping the title at short heights.
- Overflow at 390px.

## Behavior tests (puppeteer)

1. Navigation:
   - → ×3, ←, ↓, left click and right click each give the expected `__stage.state`.
   - 80 presses of → end on the last step.
   - Home, then ↑.
   - Typing in a workshop input does not move the deck.
2. Workshop: typing into the fields updates the prompt text, and Copy works.
3. Sync: open `talking-points.html` and the stage in two pages of one browser. The points page shows "Synced", and pressing → on it moves the stage. The presenter window shows the bullets.
4. Film, against a server with range support (`pip install rangehttpserver`, then `python3 -m RangeHTTPServer`; the plain `http.server` cannot seek):
   - Click a voice card, then Play: the state is `speaking` and `t` increases.
   - `__film.seek(i, k, dur - 2)`: it auto-advances to the next step.
   - Seek near the end of the workshop step 0: `playing` is false and the workshop toast shows. Continue plays step 1.
   - Seek near the end of the last step: the end toast shows.
   - Test `setVoice('silent')`, `setSpeed(2)` and a 390px viewport.
5. Grep all output for em and en dashes (U+2014, U+2013): `grep -rnP "\x{2014}|\x{2013}" --include=*.js --include=*.html --include=*.css --include=*.md .` should print nothing.

## Publish

- Any static host works. Audio seeking needs HTTP range support, which here.now provides.
- Publish the presenter and narrated folders as two sites. When updating, reuse the existing site (here.now `--slug`) so the links stay the same.
- Anonymous here.now sites expire in 24 hours. Share the claim URL, or publish with an account key stored in the CLI's credential file. Never put the key in the repo.
- Do not publish `tmp/` or test output.

## Deliverables

- Two links (presenter and narrated) and their claim URLs or expiry.
- `TALKING_POINTS.md`, `SCRIPT.md` (with the runtime of each voice) and `TALK_TRACK.md`. Build them with `node tools/gen_docs.mjs <narrated>/audio/manifest.json`; the talk track is also at `?talktrack`.
- Optionally, a source zip without `tmp/`, `node_modules/` or credentials.
