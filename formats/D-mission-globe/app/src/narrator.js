// Sentence-by-sentence narration. Order of preference for each sentence:
//   1. a pre-rendered studio MP3 at audio/<voice>/<fnv1a(sentence)>.mp3, if the manifest lists it;
//   2. the best English speechSynthesis voice on the device;
//   3. a silent timer (about 2.6 words per second) so captions and cues still advance.
// The studio manifest is embedded in index.html (<script id="studio-manifest">) and ships empty here.
import { STUDIO_VOICES, BRAND } from './content.js';

export function sentences(text) {
  const t = text.replace(/\s+/g, ' ').trim();
  return t ? t.split(/(?<=[.!?]["')\]]?)\s+(?=["'(A-Z0-9])/).map((s) => s.trim()).filter(Boolean) : [];
}
export function hashSentence(s) {
  const t = s.replace(/\s+/g, ' ').trim(); let h = 2166136261;
  for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(16).padStart(8, '0');
}
function readManifest() {
  try { const el = document.getElementById('studio-manifest'); return el ? JSON.parse(el.textContent || '{}') : {}; } catch { return {}; }
}
const PREMIUM = /(natural|neural|premium|enhanced|online|google|siri)/i;
const KEY = `${BRAND.storagePrefix}-voice`;

export class Narrator {
  enabled = true; rate = 1; voiceId = 'studio:heart'; deviceVoices = []; studio = new Map();
  lines = []; idx = 0; token = 0; paused = false; resolveFn = null; timer = null; mode = 'timer';
  sentenceStart = 0; sentenceDur = 1; elapsedBeforePause = 0; blocked = false;
  synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  audio = typeof Audio !== 'undefined' ? new Audio() : null;
  onCaption = () => {}; onSpeaking = () => {}; onSentence = () => {}; onState = () => {}; onVoicesChanged = () => {}; onBlocked = () => {};
  constructor() {
    const man = readManifest(); this.base = man.base || 'audio';
    for (const [id, list] of Object.entries(man.voices || {})) this.studio.set(id, new Set(list));
    if (this.synth) {
      const load = () => { this.deviceVoices = this.synth.getVoices().filter((v) => /^en/i.test(v.lang)); this.onVoicesChanged(); };
      load(); this.synth.addEventListener?.('voiceschanged', load);
    }
    try { const s = JSON.parse(localStorage.getItem(KEY) ?? 'null'); if (s?.voiceId) this.voiceId = s.voiceId; if (s?.rate) this.rate = s.rate; } catch {}
    if (!this.studioAvailable && this.voiceId.startsWith('studio:')) this.voiceId = 'auto';
    if (this.audio) this.audio.preload = 'auto';
  }
  get studioAvailable() { return [...this.studio.values()].some((s) => s.size > 0); }
  voices() {
    const out = [];
    for (const v of STUDIO_VOICES) if (this.studio.get(v.id)?.size) out.push({ id: `studio:${v.id}`, label: v.label, detail: `${v.detail}. Studio neural voice.`, kind: 'studio', premium: true });
    const dev = [...this.deviceVoices].sort((a, b) => Number(PREMIUM.test(b.name)) - Number(PREMIUM.test(a.name)));
    for (const v of dev) out.push({ id: `device:${v.voiceURI}`, label: v.name.replace(/^Microsoft /, '').replace(/ - English.*$/, ''), detail: `${v.lang}${v.localService ? ', on this device' : ', cloud'}`, kind: 'device', premium: PREMIUM.test(v.name), device: v });
    return out;
  }
  resolvedVoiceId() {
    if (this.voiceId !== 'auto') return this.voiceId;
    const v = this.voices(); return (v.find((x) => x.kind === 'studio') ?? v.find((x) => x.premium) ?? v[0])?.id ?? '';
  }
  get currentVoice() { return this.voices().find((v) => v.id === this.resolvedVoiceId()) ?? null; }
  setVoice(id) { this.voiceId = id; this.persist(); this.onState(); if (this.resolveFn && !this.paused) this.restartSentence(); }
  setRate(r) { this.rate = r; if (this.audio) this.audio.playbackRate = r; this.persist(); this.onState(); }
  persist() { try { localStorage.setItem(KEY, JSON.stringify({ voiceId: this.voiceId, rate: this.rate })); } catch {} }
  estimate(s) { return s.split(/\s+/).length / 2.6 / this.rate + 0.5; }
  get active() { return !!this.resolveFn; }
  get isPaused() { return this.paused; }
  get index() { return this.idx; }
  get total() { return this.lines.length; }
  get sentenceProgress() {
    if (!this.resolveFn) return 0;
    if (this.mode === 'audio' && this.audio && this.audio.duration > 0) return Math.min(1, this.audio.currentTime / this.audio.duration);
    const el = this.paused ? this.elapsedBeforePause : this.elapsedBeforePause + (performance.now() - this.sentenceStart) / 1000;
    return Math.min(1, el / this.sentenceDur);
  }
  speak(text) {
    this.cancel(); const tok = ++this.token; this.lines = sentences(text || ''); this.idx = 0; this.paused = false;
    if (!this.lines.length) return Promise.resolve(true);
    return new Promise((res) => { this.resolveFn = res; this.play(tok); this.onState(); });
  }
  stopOutput() {
    if (this.timer) clearTimeout(this.timer); this.timer = null;
    if (this.audio) { this.audio.onended = null; this.audio.onerror = null; this.audio.pause(); }
    this.synth?.cancel();
  }
  play(tok) {
    if (tok !== this.token || this.paused) return;
    this.stopOutput();
    if (this.idx >= this.lines.length) { this.onCaption(null); this.onSpeaking(false); const r = this.resolveFn; this.resolveFn = null; this.onState(); r?.(true); return; }
    const line = this.lines[this.idx];
    this.onCaption(line); this.onSentence(this.idx, this.lines.length); this.onState();
    this.elapsedBeforePause = 0; this.sentenceStart = performance.now(); this.sentenceDur = this.estimate(line);
    const next = () => { if (tok === this.token && !this.paused) { this.idx++; this.play(tok); } };
    const vid = this.resolvedVoiceId(), h = hashSentence(line), studio = vid.startsWith('studio:') ? vid.slice(7) : null;
    if (this.enabled && studio && this.studio.get(studio)?.has(h) && this.audio && !this.blocked) {
      this.mode = 'audio'; const a = this.audio;
      a.src = `${this.base}/${studio}/${h}.mp3`; a.playbackRate = this.rate; a.onended = next;
      a.onerror = () => { if (tok === this.token) { this.studio.get(studio)?.delete(h); this.restartSentence(); } };
      this.onSpeaking(true);
      a.play().catch((err) => { if (tok !== this.token) return; if (err?.name === 'NotAllowedError') { this.blocked = true; this.onBlocked(); } this.fallbackTimer(tok, next); });
      this.prefetch(studio); return;
    }
    const dv = vid.startsWith('device:') ? this.deviceVoices.find((v) => `device:${v.voiceURI}` === vid) : this.deviceVoices.find((v) => PREMIUM.test(v.name)) ?? this.deviceVoices[0];
    if (this.enabled && this.synth && dv) {
      this.mode = 'speech'; const u = new SpeechSynthesisUtterance(line); u.voice = dv; u.rate = this.rate;
      let done = false; const fin = () => { if (!done) { done = true; next(); } };
      u.onend = fin; u.onerror = (e) => { if (e.error !== 'interrupted' && e.error !== 'canceled') fin(); };
      this.timer = window.setTimeout(fin, this.sentenceDur * 1000 * 1.8 + 2500); this.onSpeaking(true);
      setTimeout(() => { if (tok === this.token && !this.paused) this.synth.speak(u); }, 40);
    } else this.fallbackTimer(tok, next);
  }
  fallbackTimer(tok, next) {
    if (tok !== this.token) return;
    this.mode = 'timer'; this.onSpeaking(false);
    const left = Math.max(0.3, this.sentenceDur - this.elapsedBeforePause); this.sentenceStart = performance.now();
    this.timer = window.setTimeout(next, left * 1000);
  }
  prefetch(studio) {
    const n = this.lines[this.idx + 1]; if (!n) return; const h = hashSentence(n);
    if (this.studio.get(studio)?.has(h)) { const a = new Audio(); a.preload = 'auto'; a.src = `${this.base}/${studio}/${h}.mp3`; }
  }
  unblock() { if (this.blocked) { this.blocked = false; if (this.resolveFn && !this.paused && this.mode === 'timer') this.restartSentence(); } }
  restartSentence() { this.token++; this.play(this.token); }
  pause() {
    if (this.paused || !this.resolveFn) return;
    this.paused = true; this.elapsedBeforePause += (performance.now() - this.sentenceStart) / 1000;
    if (this.timer) clearTimeout(this.timer);
    this.mode === 'audio' ? this.audio?.pause() : this.synth?.cancel();
    this.onSpeaking(false); this.onState();
  }
  resume() {
    if (!this.paused) return; this.paused = false; const tok = this.token;
    if (this.mode === 'audio' && this.audio?.src && !this.audio.ended) { this.onSpeaking(true); this.audio.play().catch(() => this.fallbackTimer(tok, () => { if (tok === this.token) { this.idx++; this.play(tok); } })); }
    else if (this.mode === 'timer') { this.sentenceStart = performance.now(); this.timer = window.setTimeout(() => { if (tok === this.token && !this.paused) { this.idx++; this.play(tok); } }, Math.max(0.2, this.sentenceDur - this.elapsedBeforePause) * 1000); }
    else this.restartSentence();
    this.onState();
  }
  toggle() { this.paused ? this.resume() : this.pause(); }
  seek(i) { if (!this.resolveFn || i >= this.lines.length) return false; this.idx = Math.max(0, i); this.paused = false; this.token++; this.play(this.token); return true; }
  skip(d) { return this.seek(this.idx + d); }
  cancel() { this.token++; this.paused = false; this.stopOutput(); this.onCaption(null); this.onSpeaking(false); const r = this.resolveFn; this.resolveFn = null; this.onState(); r?.(false); }
  setEnabled(on) { this.enabled = on; if (this.resolveFn && !this.paused) this.restartSentence(); this.onState(); }
  preview(id, text) {
    const studio = id.startsWith('studio:') ? id.slice(7) : null, h = hashSentence(text);
    if (studio && this.studio.get(studio)?.has(h)) { const a = new Audio(`${this.base}/${studio}/${h}.mp3`); a.playbackRate = this.rate; a.play().catch(() => {}); return; }
    const v = this.deviceVoices.find((x) => `device:${x.voiceURI}` === id);
    if (this.synth && v) { const u = new SpeechSynthesisUtterance(text); u.voice = v; u.rate = this.rate; this.synth.speak(u); }
  }
}
