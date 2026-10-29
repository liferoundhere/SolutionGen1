# Stage engine

Plain ES modules with no build step. Three.js r170 is vendored and loaded through an import map, so the deck runs offline from any static server. It does not run from `file://`, because modules and textures need http.

## Files

| File | Role |
| --- | --- |
| `index.html` | Canvas, HUD, topbar, workshop panel, camera box, overlays, presenter and talk-track roots |
| `talking-points.html` | Standalone off-camera talking points page (same `main.js`, `data-mode="points"`) |
| `js/content.js` | All copy: `DECK`, `PRESENTER`, `BLOCKS`, `VERSES` (live links), `SCENES`, `SOURCES`, workshop template |
| `js/script.js` | `NARRATION`, `POINTS`, `VOICES` |
| `js/scenes.js` | Scene definitions, one export per scene id |
| `js/kit.js` | `bridgeBars`, `makePyramid`, `mediaScreen`, `worldScene` |
| `js/core.js` | Palette `C`, `OVERLAY`, `damp`, `smooth`, `easeInOut`, `label`, `canvasPanel`, `glowSprite`, `wireBox`, `gridFloor`, `points`, `drawTube`, `arc`, `person`, `plane`, `setOpacity`, materials |
| `js/background.js` | Sky sphere shader (`createSky`) |
| `js/particles.js` | Shared particle field and `FORMATIONS` |
| `js/main.js` | Mode router, renderer, flights, navigation, HUD, workshop, camera box, presenter, talking points, talk track |
| `js/film.js`, `js/avatar.js` | Narrated edition only (loaded when `<body data-edition="narrated">`) |

## Modes

`main.js` routes on the URL:
- `?talktrack`: printable talk track.
- `?points`, or `talking-points.html`: talking points.
- `?presenter`: presenter window.
- Anything else is the stage.

The stage reads `#scene/step` on load and writes it on every move, so any URL is a deep link.

## Render pipeline

- `WebGLRenderer` with ACESFilmic tone mapping, exposure 1.05, and pixel ratio capped at 2.
- `FogExp2(0x050e1d, 0.011)`, plus ambient, hemisphere and one key light.
- `EffectComposer`: RenderPass, then `UnrealBloomPass(strength 0.5, radius 0.45, threshold 0.24)`, then OutputPass.
- **OVERLAY pass.** After the composer, the frame loop sets `camera.layers.set(1)`, `renderer.autoClear = false`, `clearDepth()`, and renders again.
  - Anything on layer 1 is drawn crisp on top, without bloom, fog or tone mapping.
  - `label()` sprites, `canvasPanel()` meshes and media screen planes all go on this layer. Their materials use `fog: false` and `toneMapped: false`.
  - This is why text and screenshots stay legible in a glowing scene. Keep emissive geometry on layer 0.

## World layout and camera

- Scene `i` lives at origin `x = i * 700`, `z = (i % 2) * -120`. Scenes are built lazily (`ensure(i)` builds the current scene and the next one) and hidden when not in view.
- Each scene has `cams`, one `{ p, t }` per step, local to its origin. On a scene change the camera flies for 1.9 s with ease-in-out, a +40 y arc, and warp streaks in the sky. Within a scene it damps toward the step camera.
- The mouse adds a small parallax.
- `camera.setViewOffset` shifts the render to the right so the world sits beside the left HUD: 0.17 of the width for stack and focus layouts, 0.2 for workshop, 0 for hero, and 0 below 900px.

## Scene contract

```js
export const myScene = {
  id: 'myScene',                                   // matches SCENES[i].id
  bg: { a: '#020611', b: '#06213f', c: '#00bceb', mix: [aurora, horizonGrid, dataRain, starfield] },
  bgSteps: [null, { ...another bg }],              // optional per step override, null keeps previous
  cams: [{ p: [x, y, z], t: [x, y, z] }, ...],     // one per step (last one repeats)
  build() {
    const group = new THREE.Group();
    // ... build the world
    return {
      group,
      update(dt, t, step) { /* damp values toward the targets for this step */ },
      reset() { /* optional: called when the scene is entered */ },
      leave() { /* optional: stop video or audio when leaving */ },
    };
  },
};
```

- **State driven, not timeline driven.** `update` gets the current step every frame. Keep a value per effect and `damp()` it toward its step target, for example `k = damp(k, step >= 1 ? 1 : 0, 3, dt)`. Going back a step simply reverses the animation, and deep links land in the right state.
- Neighbor scenes keep updating during flights, with the step clamped to their first or last.
- Use `smooth(k)` for eased reveals and `setOpacity(obj, o)` to fade whole subtrees.
- Put the scene group a few units right (`group.position.x = 3 or 4`) when the HUD is on the left.

## Sky

- `createSky()` is a back-face sphere, radius 1500, that follows the camera.
- Colors:
  - `a` is the zenith.
  - `b` is the horizon and base.
  - `c` is the accent used by every pattern.
- `mix` weights four patterns:
  - `x`: aurora curtains.
  - `y`: horizon grid glow.
  - `z`: data rain.
  - `w`: starfield and nebula.
- Values ease over about half a second. `snap()` applies them instantly for deep links and tests.
- Rule: change the sky on every scene. Use `bgSteps` to turn a scene's mood when its story turns, such as red during the problem and blue after the fix.

## Particles

- `createField()` makes one `Points` cloud of 7000 additive particles.
- `morph(id, origin)` retargets every particle to the formation for that scene id, placed at the scene's origin.
- Formations are pure functions `(i) => [x, y, z]` in `particles.js`:
  - `wave`, `frames`, `sphere`, `invPyr`, `pyr`, `rings`, `spiral`, `runways`, `halo`, `columns`;
  - `city`, `lattice`, `mapPlane`, `latRings`, `helix`, `knot`, `hex`, `bars`.
- Map scene ids to `[formation, color]` in `FORMATIONS`. Add new ones from the content's own world: a terminal row for an airport, floors for a hospital, a map plane for a branch network.

## Stage API

`main.js` builds a `stage` object and passes it to `film.js`:
- `go(i, s)`, `next()`, `prev()`, `nextScene()`, `prevScene()`, and `stepsOf(i)`.
- Getters `cur` and `step`.
- `onChange(fn)`, called with `{ cur, step, sceneChanged }`.
- `keyHook`, a key handler that runs before the deck keys and returns true to consume the key.
- `camBox` and `nameTag`.

For tests, `window.__stage` exposes `go`, `jump(i, s)` (instant, no flight), and `state`.

## Performance

- Build geometry once in `build()`. Never allocate in `update`.
- Cache textures (`kit.js` keeps a texture cache).
- Media videos are muted, looping, and paused on `leave()`.
- Keep the total draw calls per scene modest. Instanced or `points()` clouds are cheaper than many meshes.
