// Writes TALKING_POINTS.md and SCRIPT.md from js/content.js and js/script.js.
// Usage: node tools/gen_docs.mjs [path/to/audio/manifest.json]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { SCENES, VERSES, PRESENTER } from '../js/content.js';
import { POINTS, NARRATION, VOICES } from '../js/script.js';

const root = new URL('..', import.meta.url).pathname;
const manPath = process.argv[2];
const manifest = manPath && existsSync(manPath) ? JSON.parse(readFileSync(manPath, 'utf8')) : null;
const words = (t) => t.split(/\s+/).filter(Boolean).length;
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
const versesFor = (id) => VERSES.filter((v) => v.scene === id);

let tp = `# Talking points\n\n${PRESENTER.name} · ${PRESENTER.role} · Business Solutions Engineering\n\n`;
tp += 'One block per click. Read the bullets, not the script. The live version of this page syncs with the stage: open `talking-points.html` (or press T on the stage) on your second screen.\n\n';
let clock = 0;
SCENES.forEach((s, i) => {
  tp += `## ${String(i + 1).padStart(2, '0')} · ${s.eyebrow}: ${s.title} ${s.grad}\n\n`;
  s.notes.forEach((n, k) => {
    tp += `**Click ${k + 1}** (at about ${mmss(clock)})\n\n`;
    (POINTS[s.id]?.[k] || []).forEach((p) => { tp += `- ${p}\n`; });
    tp += '\n';
    clock += (words(n) / 150) * 60;
  });
  const vs = versesFor(s.id);
  if (vs.length) tp += `Live links: ${vs.map((v) => `${v.name} ${v.url}`).join(' · ')}\n\n`;
});
tp += `Planned length at 150 words per minute: about ${mmss(clock)}.\n`;
writeFileSync(`${root}TALKING_POINTS.md`, tp);

let sc = '# Narration script (narrated edition)\n\n';
sc += 'Read by an AI narrator standing in for the presenter. Each paragraph is one step of the film; the film advances on its own when a paragraph ends, and pauses at the workshop.\n\n';
sc += `Voices: ${VOICES.map((v) => `${v.name} (${v.voice})`).join(', ')}.\n\n`;
if (manifest) {
  sc += '| Voice | Runtime at 1x |\n| --- | --- |\n';
  VOICES.forEach((v) => { if (manifest[v.key]) sc += `| ${v.name} | ${mmss(Object.values(manifest[v.key]).reduce((a, c) => a + c.dur, 0))} |\n`; });
  sc += '\n';
}
let total = 0;
SCENES.forEach((s, i) => {
  sc += `## ${String(i + 1).padStart(2, '0')} · ${s.title} ${s.grad}\n\n`;
  NARRATION[s.id].forEach((t, k) => {
    const d = manifest?.ava?.[`${i}-${k}`]?.dur;
    sc += `**Step ${k + 1}**${d ? ` (${mmss(d)})` : ''}. ${t}\n\n`;
    total += words(t);
  });
});
sc += `About ${total} words.\n`;
writeFileSync(`${root}SCRIPT.md`, sc);
console.log('wrote TALKING_POINTS.md and SCRIPT.md', Math.round(clock / 60), 'min plan,', total, 'narration words');
