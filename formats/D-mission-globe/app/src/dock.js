// Bottom audio dock: section transport, sentence-segment progress bar, captions, voice picker.
import { esc, STUDIO_VOICES, STR, BRAND } from './content.js';

const $ = (s) => document.querySelector(s);
export const ICON = {
  prevSec: '<svg viewBox="0 0 24 24"><path d="M6 5h2v14H6zM20 5v14L9 12z"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M11 6v12l-8-6zM21 6v12l-8-6z"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',
  fwd: '<svg viewBox="0 0 24 24"><path d="M3 6v12l8-6zM13 6v12l8-6z"/></svg>',
  nextSec: '<svg viewBox="0 0 24 24"><path d="M16 5h2v14h-2zM4 5v14l11-7z"/></svg>',
  voice: '<svg viewBox="0 0 24 24"><path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zm-7 9h2a5 5 0 0 0 10 0h2a7 7 0 0 1-6 6.9V21h-2v-2.1A7 7 0 0 1 5 12z"/></svg>',
  speaker: '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4zM16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
};
const CAP_KEY = `${BRAND.storagePrefix}-captions`;

export class Dock {
  onPlayPause = () => {}; onPrevSection = () => {}; onNextSection = () => {}; onSkipEnd = () => {}; beforeSeek = () => {};
  captions = true; paused = false; section = '';
  constructor(n) {
    this.n = n; this.bar = $('#dkBar');
    $('#dkPrevSec').innerHTML = ICON.prevSec; $('#dkBack').innerHTML = ICON.back; $('#dkFwd').innerHTML = ICON.fwd; $('#dkNextSec').innerHTML = ICON.nextSec; $('#dkPlay').innerHTML = ICON.pause; $('#dkVoiceIc').innerHTML = ICON.voice;
    $('#dkPrevSec').addEventListener('click', () => this.onPrevSection());
    $('#dkNextSec').addEventListener('click', () => this.onNextSection());
    $('#dkPlay').addEventListener('click', () => this.onPlayPause());
    $('#dkBack').addEventListener('click', () => this.skip(-1));
    $('#dkFwd').addEventListener('click', () => this.skip(1));
    $('#dkVoice').addEventListener('click', (e) => { e.stopPropagation(); this.togglePop(); });
    $('#voiceBtn').addEventListener('click', (e) => { e.stopPropagation(); this.togglePop(); });
    $('#voicePop').addEventListener('click', (e) => e.stopPropagation());
    document.addEventListener('click', () => $('#voicePop').classList.add('hidden'));
    this.bar.addEventListener('click', (e) => { const s = e.target.closest('.seg'); if (s) { this.beforeSeek(); this.n.seek(Number(s.dataset.i)); } });
    n.onState = () => this.render();
    n.onVoicesChanged = () => { this.renderPop(); this.render(); };
    try { this.captions = localStorage.getItem(CAP_KEY) !== 'off'; } catch {}
    document.body.classList.toggle('no-captions', !this.captions);
    const tick = () => { requestAnimationFrame(tick); const i = this.bar.querySelector('.seg.on i'); if (i) i.style.width = `${Math.round(this.n.sentenceProgress * 100)}%`; };
    tick(); this.renderPop(); this.render();
  }
  skip(d) { if (this.n.active) { this.beforeSeek(); if (!this.n.skip(d) && d > 0) { this.n.cancel(); this.onSkipEnd(); } } else if (d > 0) this.onSkipEnd(); }
  setSection(t) { this.section = t; $('#dkSec').textContent = t; }
  setPaused(p) { this.paused = p; $('#dkPlay').innerHTML = p ? ICON.play : ICON.pause; $('#dkPlay').title = p ? 'Resume (Space)' : 'Pause (Space)'; $('#dock').classList.toggle('paused', p); }
  caption(t) {
    const el = $('#captionText');
    if (t) { el.textContent = t; el.classList.remove('fade'); void el.offsetWidth; el.classList.add('in'); } else el.classList.add('fade');
  }
  render() {
    const n = this.n, total = n.total, idx = n.index;
    if (this.bar.childElementCount !== total || this.bar.dataset.key !== (n.lines[0] ?? '')) {
      this.bar.dataset.key = n.lines[0] ?? '';
      this.bar.innerHTML = n.lines.map((l, i) => `<span class="seg" data-i="${i}" title="${esc(l.slice(0, 120))}" style="flex:${Math.max(1, l.length)}"><i></i></span>`).join('');
    }
    this.bar.querySelectorAll('.seg').forEach((s, i) => {
      s.classList.toggle('done', !n.active || i < idx); s.classList.toggle('on', n.active && i === idx);
      s.querySelector('i').style.width = n.active ? (i < idx ? '100%' : '0%') : '100%';
    });
    $('#dkCount').textContent = total ? `${Math.min(idx + 1, total)} / ${total}` : '';
    const v = n.currentVoice, name = n.enabled ? (v ? v.label : 'Captions') : 'Voice off';
    $('#dkVoiceName').textContent = name; $('#voiceBtn').textContent = n.enabled ? `Voice: ${name}` : 'Voice: Off';
    $('#dkSec').textContent = this.section; this.setPaused(this.paused);
  }
  togglePop() { const p = $('#voicePop'); p.classList.toggle('hidden'); if (!p.classList.contains('hidden')) this.renderPop(); }
  renderPop() {
    const n = this.n, all = n.voices(), cur = n.currentVoice?.id;
    const studio = all.filter((v) => v.kind === 'studio'), prem = all.filter((v) => v.kind === 'device' && v.premium), other = all.filter((v) => v.kind === 'device' && !v.premium).slice(0, 14);
    const row = (v) => `<div class="vp-row ${v.id === cur ? 'on' : ''}" data-id="${esc(v.id)}"><button class="vp-pick"><b>${esc(v.label)}</b><span>${esc(v.detail)}</span></button>${v.premium ? '<em class="vp-badge">Premium</em>' : ''}<button class="vp-prev" title="Preview" aria-label="Preview">${ICON.speaker}</button></div>`;
    const group = (h, list) => (list.length ? `<h6>${h}</h6>${list.map(row).join('')}` : '');
    const note = studio.length ? '' : `<p class="vp-note">Studio neural voices (${STUDIO_VOICES.map((v) => v.label).join(', ')}) play when their MP3s are deployed next to this file. This copy uses the best voices on your device.</p>`;
    const none = all.length ? '' : '<p class="vp-note">No speech voices are available in this browser. Captions keep the story moving.</p>';
    const pop = $('#voicePop');
    pop.innerHTML = `<div class="vp-head"><b>Narration voice</b><label class="vp-tog"><input type="checkbox" id="vpOn" ${n.enabled ? 'checked' : ''}/> Voice</label><label class="vp-tog"><input type="checkbox" id="vpCap" ${this.captions ? 'checked' : ''}/> Captions</label></div>
      <div class="vp-speed"><span>Speed</span>${[0.85, 1, 1.15, 1.3, 1.5].map((r) => `<button data-r="${r}" class="${Math.abs(n.rate - r) < 0.01 ? 'on' : ''}">${r}x</button>`).join('')}</div>
      <div class="vp-list">${group('Studio neural voices', studio)}${note}${group('Premium voices on this device', prem)}${group('Other device voices', other)}${none}</div>`;
    pop.querySelectorAll('.vp-row').forEach((r) => {
      const id = r.dataset.id;
      r.querySelector('.vp-pick').addEventListener('click', () => { n.setVoice(id); if (!n.enabled) n.setEnabled(true); this.renderPop(); });
      r.querySelector('.vp-prev').addEventListener('click', () => n.preview(id, STR.preview));
    });
    pop.querySelectorAll('.vp-speed button').forEach((b) => b.addEventListener('click', () => { n.setRate(Number(b.dataset.r)); this.renderPop(); }));
    $('#vpOn').addEventListener('change', (e) => n.setEnabled(e.target.checked));
    $('#vpCap').addEventListener('change', (e) => { this.captions = e.target.checked; document.body.classList.toggle('no-captions', !this.captions); try { localStorage.setItem(CAP_KEY, this.captions ? 'on' : 'off'); } catch {} });
  }
}
