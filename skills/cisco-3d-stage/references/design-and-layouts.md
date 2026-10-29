# Design and layouts

The palette and type follow the `cisco-branded` skill. CSS tokens live in `css/style.css` (`:root`), and the matching WebGL colors in `core.js` (`C`).

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--midnight` | `#050e1d` | Page and fog |
| `--navy` / `--deep` | `#07182d` / `#0d274d` | Panels, avatar blazer |
| `--blue` | `#00bceb` | Primary accent, eyebrows, focus, the mark |
| `--sky` / `--ice` | `#02c8ff` / `#9be7ff` | Secondary accent, highlighted caption words |
| `--green` | `#6cc04a` | Outcome, success, live dots |
| `--amber` / `--red` | `#fbab18` / `#e2231a` | Warning or problem states |
| `--grad` | `#7fe3ff` to `#00bceb` to `#6cc04a` | Headline outcome clause, progress bar |
| `--glass` | `rgba(10,30,58,0.55)` plus blur | Beats, chips, buttons |

Block colors for structure diagrams: `#00BCEB #6CC04A #FBAB18 #F25C9A #8E7CFF #FF6B4A #2DE2C5 #FFD95A`.

## Type

- Inter 300 to 800, vendored, with the `CiscoSansTT` name first in the stack so the corporate font wins where installed.
- JetBrains Mono for code, timers and URLs.
- Headline: `clamp(32px, 3.7vw, 58px)`, 800 weight, -0.03em tracking, 1.02 line height. Hero: `clamp(40px, 5.2vw, 76px)`.
- Eyebrow: 12.5px, uppercase, 0.16em tracking, blue.

## HUD layouts (`SCENES[i].layout`)

- **stack** (default): the HUD is on the left (`left: clamp(22px, 5vw, 84px)`, width `min(40vw, 600px)`), vertically centered. The beats list marks each beat `done`, `now` or `later`, so the current click glows and earlier ones dim. A left scrim gradient protects the text, and the world renders shifted right.
- **hero**: centered at the bottom, wide headline, bottom scrim, no view offset. Used for the opening and the close.
- **focus**: one large card for the current step, `{ b, h, q, p }`. It has a block number, a heading in the block color, a quoted prompt fragment in mono, and an explanation. Step 0 (no `b`) shows the block chips row.
- **workshop**: short HUD on top, the glass form panel below it on the left, and the world on the right.

Other HUD parts:
- **Prompt chips** (`prompt: [[blockKey, text], ...]`) appear under the beats, titled "Prompt logic". This is how to show prompt structure without showing exact prompts.
- **Live link buttons**, top right: a pulsing green dot, the name, and the short URL.
- **Stepinfo** bottom left (`03/18 · step 2/3`), dots in the topbar, and a 3px gradient progress bar at the very top.

## Components

- Glass panels: `rgba(7,24,45,0.82)`, 1px `--line` border, 18px radius, `backdrop-filter: blur(16px)`.
- 3D labels: `label(text, { size, color, bg, border, weight, mono })`. Use a dark rounded pill for labels that sit over bright geometry.
- 3D panels: `canvasPanel(w, h, draw)` with a `redraw(...)` method for live values such as timers.
- Media screen: a browser chrome frame (traffic lights and URL bar), a halo, and crossfading planes.
- Camera box: bottom right, 4:3, 1px blue border, soft glow, name tag bottom left with a blue left border. Double-click to enlarge.

## Motion

- Everything damps. There are no keyframes. The HUD fades and rises on every change (the `.in` class).
- Scene flights take 1.9 s. Step changes take about 0.5 to 1.5 s through damping.
- Sky colors ease over about 0.5 s, and particles morph over about 2 s.

## Mobile (900px and below)

- The HUD moves to the bottom, full width. Done beats and extra chips hide, and so do the dots and secondary tool buttons.
- The workshop panel becomes a full-width overlay.
- In the presenter edition the camera box hides unless it is live. In the narrated edition it moves to the top right.
- The view offset is 0.
