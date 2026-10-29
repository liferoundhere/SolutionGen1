# Third-party notices

These components are vendored in `cisco-3d-stage/starter/vendor/`:

| Component | Version | License | Source |
| --- | --- | --- | --- |
| three.js (core and the postprocessing and shader addons) | r170 | MIT | https://github.com/mrdoob/three.js |
| Inter | 4.x | SIL Open Font License 1.1 | https://github.com/rsms/inter |
| JetBrains Mono | 2.x | SIL Open Font License 1.1 | https://github.com/JetBrains/JetBrainsMono |

Optional tools that are installed separately and not vendored:

| Tool | License | Use |
| --- | --- | --- |
| edge-tts | LGPL-3.0 / GPL-3.0 | Pre-rendering the neural narration voices (`tools/gen_audio.py`) |
| rangehttpserver | Apache-2.0 | Local static server with HTTP range support, for audio seeking |
| puppeteer-core | Apache-2.0 | Headless review scripts |

The narration voices are Microsoft Azure neural voices accessed through edge-tts. Check that your use of the generated audio fits your organization's policies.
