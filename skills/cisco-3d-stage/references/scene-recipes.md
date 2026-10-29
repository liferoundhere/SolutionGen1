# Scene recipes

These are patterns proven in the original build. Each shows the idea of its scene as an object, and each click changes the object. Combine and re-skin them for new content; the subject always comes from the request.

## Choreography rules

- **One idea per scene, one change per click.** Write the beat, then decide what moves: light, pull forward, swap, fold, flip, fill, reveal labels, or turn the sky.
- **Step 0 is the establishing shot.** The world is complete enough to read before the first click.
- **The camera moves with the story.** Push in for detail, pull back for scale, orbit for a reveal. Keep `t` (target) on the subject and leave room on the left for the HUD.
- **Turn the sky with the story** using `bgSteps`: problem colors (red, amber), then fix colors (blue, green).
- **Scale dioramas to the frame.** In `worldScene`, `scale` (default 0.7) and `dpos` move the diorama away from the text. Label sprites are compensated so they stay readable.

## Patterns

| Pattern | Layout | Steps | What happens | Starter or original |
| --- | --- | --- | --- | --- |
| Hero mark | hero | 1 | Cisco bridge bars rise from a reflective grid, rings orbit, dust drifts | `title` (starter) |
| Old medium breaks | stack | 3 | A wall of flat frames, they tilt and wobble, then fold into a sphere "you step inside" | `shift` (starter), original "slides" |
| Search versus brief | stack | 3 | A tiny query orb versus a full context orb; the answer shape grows | original "google" |
| Pyramid flip | stack | 3 | An inverted pyramid balanced on its point flips onto a solid base, tiers light from the base | `flip` (starter), original "flip" and "pyramid" |
| Anatomy focus | focus | 1 + N | N colored tiles orbit a core; each click pulls one forward and adds a ring | `method` (starter), original "anatomy" |
| Lineage galaxy | stack | 2 | Worlds as glowing nodes on a spiral, connected by arcs in creation order | original "galaxy" |
| World and screen | stack | 3 to 4 | A diorama of the subject's world beside a glass browser screen that steps through screenshots and a muted clip | `world` (starter), originals "delta", "gary", "anu" |
| Workshop builder | workshop | 3 | The HTML form fills 3D base slabs live, then a 3D timer and sparks appear | `workshop` (starter) |
| Loop | stack | 3 | Conversation, context and world as three nodes on a ring; documents flow around it | original "fuel" |
| Guardrails | stack | 3 | Hex shields light one by one around the core | original "guardrails" |
| Hero close | hero | 2 | Bridge bars return, an inverted pyramid shrinks above, an audio-wave floor answers | `close` (starter) |

## World and screen details

`worldScene(cfg)` in `kit.js`:

- `cfg.diorama(group)` adds one child group and returns `{ update(dt, t, step), reset? }`.
- `cfg.media` is a list of files in `media/`. The step sequence is `[media[0], video, ...media.slice(1)]`, so step 1 plays the clip when `cfg.video` is set.
- `cfg.accent` and `cfg.url` color and label the screen frame (the URL shows in its address bar).
- `cfg.screenPos`, `screenRot` and `screenW` place the screen, and `cfg.cams` overrides the default `VCAMS`.
- Live link buttons appear when the scene has `verse: true` and `VERSES` has entries with `scene` equal to the scene id. Press L to open the first link.

Diorama vocabulary from `core.js`:
- `wireBox` for buildings, rooms and racks.
- `gridFloor` for ground.
- `person` and `plane` for people and aircraft.
- `points` for crowds, weather and data.
- `drawTube` with `setProgress` for drawn paths.
- `arc` for flows.
- `label` for names.
- `glowSprite` for status lights.
- `emissiveMat` for anything that should bloom.

Model the subject's real layout when it is public (terminals and concourses, hospital floors, a branch map), and label modeled data as modeled.

## Formations

Choose the particle formation as a second voice for the scene. Examples from the original build:
- runways under an airport;
- a halo over a hospital;
- columns for a cancer center's towers;
- a city of departments;
- a map plane for a national network;
- latitude rings for a global insurer;
- a helix for "the method became a skill";
- a trefoil knot for "the loop";
- hexes for guardrails;
- bars for the close.

## Media capture

Screens look best with real captures of the build being described, at 1280x720 JPG. Optional clips are short (6 to 12 s), muted MP4s, H.264, about 1 to 2 MB. Name the files by scene (`delta-hero.jpg`, `delta-tour.mp4`) and keep them under `media/`.
