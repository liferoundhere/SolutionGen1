// Score, XP, rank and badges. Persisted per viewer in localStorage.
import { MISSIONS, BADGES, RANKS, VALUE_SHARE, XP, BRAND } from './content.js';

const KEY = `${BRAND.storagePrefix}-v1`;
const fresh = () => ({ value: 0, xp: 0, badges: [], missions: {}, compared: [], quizzes: {} });

export class Game {
  onChange = () => {}; onBadge = () => {};
  constructor() { this.s = fresh(); try { const raw = localStorage.getItem(KEY); if (raw) this.s = { ...this.s, ...JSON.parse(raw) }; } catch {} }
  save() { try { localStorage.setItem(KEY, JSON.stringify(this.s)); } catch {} this.onChange(); }
  reset() { this.s = fresh(); this.save(); }
  // Value protected = exposure x share for the decision quality; only the best result per mission counts.
  complete(m, quality) {
    const value = Math.round(m.exposure * VALUE_SHARE[quality]), xp = XP[quality], prev = this.s.missions[m.id];
    if (!prev || value > prev.value) { this.s.value += value - (prev?.value ?? 0); this.s.missions[m.id] = { quality, value }; }
    this.s.xp += xp; this.checkBadges(); this.save(); return { value, xp };
  }
  compare(id) { if (!this.s.compared.includes(id)) { this.s.compared.push(id); this.s.xp += 20; this.checkBadges(); this.save(); } }
  quiz(id, right, total) { this.s.quizzes[id] = Math.max(this.s.quizzes[id] ?? 0, Math.round((right / total) * 100)); this.s.xp += right * 30; this.checkBadges(); this.save(); }
  award(id) { if (this.s.badges.includes(id)) return; this.s.badges.push(id); const b = BADGES.find((x) => x.id === id); if (b) this.onBadge(b); }
  checkBadges() {
    const done = this.s.missions, all = (ids) => ids.every((i) => done[i]);
    if (Object.values(done).some((m) => m.value > 0)) this.award('first-save');
    if (Object.values(done).filter((m) => m.quality === 'best').length >= 3) this.award('perfect-call');
    for (const r of ['Americas', 'Asia', 'EMEA']) if (all(MISSIONS.filter((m) => m.region === r).map((m) => m.id))) this.award(r.toLowerCase());
    if (Object.values(this.s.quizzes).filter((q) => q === 100).length >= 3) this.award('scholar');
    if (this.s.compared.length >= 5) this.award('time-traveler');
    if (all(MISSIONS.map((m) => m.id))) this.award('architect');
  }
  rank() {
    let i = 0; while (i + 1 < RANKS.length && this.s.xp >= RANKS[i + 1].xp) i++;
    const cur = RANKS[i], nxt = RANKS[i + 1];
    return { name: cur.name, progress: nxt ? (this.s.xp - cur.xp) / (nxt.xp - cur.xp) : 1, next: nxt?.xp ?? null };
  }
}
