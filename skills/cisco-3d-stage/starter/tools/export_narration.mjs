// Writes the narration as JSON for tools/gen_audio.py. Usage: node tools/export_narration.mjs narr.json
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { SCENES } from '../js/content.js';
import { NARRATION, VOICES } from '../js/script.js';

const out = process.argv[2] || 'narr.json';
const bad = SCENES.filter((s) => (NARRATION[s.id] || []).length !== s.notes.length).map((s) => s.id);
if (bad.length) { console.error('NARRATION step counts do not match notes for:', bad.join(', ')); process.exit(1); }
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({ ids: SCENES.map((s) => s.id), narr: NARRATION, voices: VOICES }));
console.log('wrote', out);
