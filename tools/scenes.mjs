// Print a deck's scene list as JSON for the gallery: eyebrow, title, grad, layout and formation per scene.
import path from 'node:path'; import { pathToFileURL } from 'node:url';
const dir = path.resolve(process.argv[2]);
const c = await import(pathToFileURL(path.join(dir, 'js/content.js')));
let F = {};
try { const src = (await import('node:fs')).readFileSync(path.join(dir, 'js/particles.js'), 'utf8');
  const m = src.match(/FORMATIONS\s*=\s*\{([\s\S]*?)\n\};/); if (m) for (const x of m[1].matchAll(/(\w+)\s*:\s*\[\s*'?(\w+)/g)) F[x[1]] = x[2]; } catch {}
const out = c.SCENES.map(s => ({ eyebrow: s.eyebrow, title: s.title, grad: s.grad || '', layout: `${s.layout || 'stack'}${F[s.id] ? ' · ' + F[s.id] : ''}`, steps: Math.max(1, (s.beats || []).length) }));
console.log(JSON.stringify({ deck: c.DECK.name, sub: c.DECK.sub, clicks: out.reduce((a, s) => a + s.steps, 0), scenes: out }, null, 1));
