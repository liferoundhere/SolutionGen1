// Export every narrated sentence with its studio-voice file name, for offline TTS rendering.
// Usage: node tools/narration-lines.mjs > lines.json
// Render each line to public/audio/<voice>/<hash>.mp3 with any TTS (one file per voice per line),
// then put {"base":"audio","voices":{"<voice>":[...hashes]}} into <script id="studio-manifest"> in index.html.
import { readFileSync } from 'node:fs';
const C = JSON.parse(readFileSync(new URL('../src/data/content.json', import.meta.url)));
const split = (t) => t.replace(/\s+/g, ' ').trim().split(/(?<=[.!?]["')\]]?)\s+(?=["'(A-Z0-9])/).map((s) => s.trim()).filter(Boolean);
const hash = (s) => { const t = s.replace(/\s+/g, ' ').trim(); let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16).padStart(8, '0'); };
const texts = [C.strings.preview, C.strings.otherTimeline, C.strings.quizIntro, C.finale, ...C.tour.map((t) => t.text)];
for (const m of C.missions) {
  const f = C.facilities[m.siteId], z = C.zones[m.id];
  const floor = z ? `We drop inside to floor ${z.floor}, ${z.room.charAt(0).toLowerCase()}${z.room.slice(1)}.` : '';
  texts.push(...Object.values(m.narration), [f?.intro ?? '', floor, m.narration.briefing].filter(Boolean).join(' '), m.decision.prompt, `${C.strings.talkIntro} ${m.talkTrack.join(' ')}`, ...m.decision.options.map((o) => o.feedback));
}
const lines = new Map(); for (const t of texts) for (const s of split(t)) lines.set(hash(s), s);
console.log(JSON.stringify([...lines].map(([hash, text]) => ({ hash, text })), null, 1));
console.error(`${lines.size} unique sentences`);
