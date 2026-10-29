# Starter: Cisco 3D stage

A runnable 7 scene sample deck (24 clicks) that exercises every layout:
- `title`, hero;
- `shift`, stack;
- `flip`, stack;
- `method`, focus;
- `world`, stack with a media screen and a live link;
- `workshop`;
- `close`, hero.

All copy is placeholder. Replace it.

## Run

```bash
python3 -m http.server 8765        # then open http://localhost:8765/
```

Talking points: `http://localhost:8765/talking-points.html`. Presenter window: P. Talk track: `?talktrack`.

## Make it yours

1. `js/content.js`: `DECK`, `PRESENTER`, `SCENES` (copy, beats, notes, layouts), `VERSES` (live links), `SOURCES`, and the workshop template.
2. `js/scenes.js`: one export per scene id (see `../references/stage-engine.md` for the contract). Building blocks are in `js/kit.js` and `js/core.js`.
3. `js/particles.js`: map every scene id in `FORMATIONS`. Add formations designed from the content.
4. `js/script.js`: `POINTS` (talking points) and `NARRATION`, with one entry per click for each scene.
5. `media/`: captures for the media screens (1280x720 JPG, optional short muted MP4).

## Narrated edition

```bash
pip install edge-tts rangehttpserver
node tools/export_narration.mjs tmp/narr.json
bash tools/sync_narrated.sh ../narrated            # copy code, flag as narrated
python3 tools/gen_audio.py tmp/narr.json ../narrated/audio
cd ../narrated && python3 -m RangeHTTPServer 8766  # range support for seeking
```

Re-run `sync_narrated.sh` after code or copy edits. Re-run `gen_audio.py` after narration edits.

## Docs and review

```bash
node tools/gen_docs.mjs ../narrated/audio/manifest.json   # TALKING_POINTS.md, SCRIPT.md
npm i -D puppeteer-core && node tools/review.mjs http://localhost:8765/ 1440 900
```
