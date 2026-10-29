import { SCENES, DECK } from './content.js';
import { NARRATION, VOICES } from './script.js';
import { createAvatar } from './avatar.js';

const $ = (s) => document.querySelector(s);
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; };
const PREF = `${DECK.channel}.film.v1`;
const SPEEDS = [0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2];
const GAP = 0.9;
const LAND = 1.5;
const PAUSE_AFTER = { workshop: 0 };
const ROLE = 'AI narrator · Business Solutions Architect';
const ICON = {
  play: '<svg viewBox="0 0 16 16"><path fill="currentColor" d="M4 2.5v11l9-5.5z"/></svg>',
  pause: '<svg viewBox="0 0 16 16"><path fill="currentColor" d="M3.5 2.5h3v11h-3zM9.5 2.5h3v11h-3z"/></svg>',
  prev: '<svg viewBox="0 0 16 16"><path fill="currentColor" d="M3 3h2v10H3zM14 3v10L6 8z"/></svg>',
  next: '<svg viewBox="0 0 16 16"><path fill="currentColor" d="M11 3h2v10h-2zM2 3v10l8-5z"/></svg>',
  replay: '<svg viewBox="0 0 16 16"><path fill="none" stroke="currentColor" stroke-width="1.6" d="M3.2 8a4.8 4.8 0 1 0 1.5-3.5"/><path fill="currentColor" d="M2.5 2v4h4z"/></svg>',
  sound: '<svg viewBox="0 0 16 16"><path fill="currentColor" d="M2 6h3l4-3v10L5 10H2z"/><path fill="none" stroke="currentColor" stroke-width="1.4" d="M11 5.5a3.5 3.5 0 0 1 0 5M12.8 3.8a6 6 0 0 1 0 8.4"/></svg>',
  mute: '<svg viewBox="0 0 16 16"><path fill="currentColor" d="M2 6h3l4-3v10L5 10H2z"/><path stroke="currentColor" stroke-width="1.4" d="M11 6l4 4M15 6l-4 4"/></svg>',
  full: '<svg viewBox="0 0 16 16"><path fill="none" stroke="currentColor" stroke-width="1.6" d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4"/></svg>',
};
const iconBtn = (cls, icon, title) => { const b = document.createElement('button'); if (cls) b.className = cls; b.innerHTML = ICON[icon]; b.title = title; return b; };
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export async function initFilm(stage) {
  document.body.classList.add('film');
  let manifest = {};
  // Pre-rendered neural audio is optional. With DECK.film.audio === false (no audio/ folder shipped),
  // skip the request entirely so the page logs no 404; the gate then offers device voice and captions only.
  if (DECK.film.audio !== false) {
    try { const r = await fetch('audio/manifest.json'); manifest = r.ok ? await r.json() : {}; } catch { manifest = {}; }
  }
  if (!manifest || typeof manifest !== 'object') manifest = {};
  const premium = VOICES.filter((v) => manifest[v.key]);
  const params = new URLSearchParams(location.search);
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(PREF) || '{}'); } catch { saved = {}; }
  const pickVoice = (k) => (k === 'device' || k === 'silent' || premium.some((v) => v.key === k) ? k : premium[0]?.key || ('speechSynthesis' in window ? 'device' : 'silent'));
  const nearSpeed = (s) => SPEEDS.reduce((a, b) => (Math.abs(b - s) < Math.abs(a - s) ? b : a), 1);
  const opt = {
    voice: pickVoice(params.get('voice') || saved.voice),
    speed: nearSpeed(+params.get('speed') || saved.speed || 1),
    volume: typeof saved.volume === 'number' ? saved.volume : 1,
    muted: false,
    captions: params.has('cc') ? params.get('cc') !== '0' : saved.captions !== false,
    auto: saved.auto !== false,
  };
  const save = () => localStorage.setItem(PREF, JSON.stringify({ voice: opt.voice, speed: opt.speed, volume: opt.volume, captions: opt.captions, auto: opt.auto }));
  const voiceOf = (k) => VOICES.find((v) => v.key === k);
  const isPremium = () => !!manifest[opt.voice];

  // ---- timeline
  const flat = [];
  SCENES.forEach((s, i) => s.notes.forEach((_, k) => flat.push([i, k])));
  const idxOf = (i, k) => flat.findIndex(([a, b]) => a === i && b === k);
  const textOf = (i, k) => NARRATION[SCENES[i].id][k];
  const timingKey = () => (manifest[opt.voice] ? opt.voice : premium[0]?.key);
  const clipOf = (i, k) => manifest[timingKey()]?.[`${i}-${k}`];
  const durOf = (i, k) => clipOf(i, k)?.dur ?? textOf(i, k).split(/\s+/).length / 2.5;
  const starts = [];
  let total = 0;
  function timeline() {
    let acc = 0; starts.length = 0;
    flat.forEach(([i, k], j) => {
      starts.push(acc);
      acc += durOf(i, k) + GAP + (flat[j + 1] && flat[j + 1][0] !== i ? LAND : 0);
    });
    total = acc;
  }
  timeline();

  // ---- audio
  const audio = new Audio();
  audio.preload = 'auto';
  let prefetch = null;
  let actx = null, analyser = null, abuf = null;
  function ensureGraph() {
    if (actx) { if (actx.state === 'suspended') actx.resume(); return; }
    try {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      const src = actx.createMediaElementSource(audio);
      analyser = actx.createAnalyser(); analyser.fftSize = 512; abuf = new Uint8Array(analyser.fftSize);
      src.connect(analyser); analyser.connect(actx.destination);
    } catch { analyser = null; }
  }
  function level() {
    if (!analyser) return null;
    analyser.getByteTimeDomainData(abuf);
    let s = 0; for (let n = 0; n < abuf.length; n++) { const d = (abuf[n] - 128) / 128; s += d * d; }
    return Math.min(1, Math.sqrt(s / abuf.length) * 4.5);
  }
  function deviceVoice() {
    const vs = speechSynthesis.getVoices().filter((v) => /^en(-|_)/i.test(v.lang));
    return vs.find((v) => /natural/i.test(v.name)) || vs.find((v) => /google us english/i.test(v.name)) || vs.find((v) => v.lang === 'en-US') || vs[0] || null;
  }
  if ('speechSynthesis' in window) speechSynthesis.getVoices();

  // ---- playback state
  let playing = false, clip = 'idle', token = 0, cueI = stage.cur, cueK = stage.step, cueFrom = 0, pendingSeek = 0;
  let silentPos = 0, devChar = 0, devStart = 0, doneAt = 0;
  let words = [], tokens = [], chunks = [], chunkNow = -1;

  function mapWords(i, k) {
    const text = textOf(i, k), low = text.toLowerCase();
    let cursor = 0;
    words = (clipOf(i, k)?.words || []).map(([t, d, w]) => {
      const at = low.indexOf(String(w).toLowerCase(), cursor);
      const ci = at < 0 ? cursor : at;
      if (at >= 0) cursor = at + String(w).length;
      return { t, d, w: String(w), ci };
    });
    tokens = [...text.matchAll(/\S+/g)].map((m) => ({ s: m.index, e: m.index + m[0].length, w: m[0] }));
    chunks = [];
    let c = [];
    tokens.forEach((tk, n) => {
      c.push(n);
      const end = /[.!?:]["')]?$/.test(tk.w) || c.length >= 18 || (c.length >= 11 && /[,;]$/.test(tk.w));
      if (end) { chunks.push(c); c = []; }
    });
    if (c.length) chunks.push(c);
    chunkNow = -1;
  }

  function stopClip() {
    audio.pause();
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }

  function cue(i, k, delay) {
    const my = ++token;
    stopClip();
    cueI = i; cueK = k; cueFrom = pendingSeek; pendingSeek = 0; silentPos = cueFrom; devChar = 0;
    mapWords(i, k);
    hideToast();
    clip = 'waiting';
    warmNext();
    if (playing) setTimeout(() => { if (my === token && playing && clip === 'waiting') startClip(my); }, (delay * 1000) / Math.max(1, opt.speed));
    paintUI();
  }

  function warmNext() {
    const n = flat[idxOf(cueI, cueK) + 1];
    if (!n || !isPremium()) return;
    prefetch = new Audio(); prefetch.preload = 'auto'; prefetch.src = `audio/${opt.voice}/${n[0]}-${n[1]}.mp3`;
  }

  function startClip(my) {
    clip = 'speaking';
    const text = textOf(cueI, cueK);
    if (isPremium()) {
      audio.src = `audio/${opt.voice}/${cueI}-${cueK}.mp3`;
      if (cueFrom > 0) { const at = cueFrom; audio.addEventListener('loadedmetadata', () => { if (my === token) audio.currentTime = at; }, { once: true }); }
      audio.playbackRate = opt.speed;
      audio.volume = opt.muted ? 0 : opt.volume;
      audio.onended = () => clipEnded(my);
      audio.play().catch(() => { if (my === token) { playing = false; clip = 'waiting'; showToast('blocked'); paintUI(); } });
    } else if (opt.voice === 'device' && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      const v = deviceVoice(); if (v) u.voice = v;
      u.rate = opt.speed; u.volume = opt.muted ? 0 : opt.volume;
      u.onboundary = (e) => { if (my === token) devChar = e.charIndex; };
      u.onend = () => clipEnded(my);
      devStart = performance.now();
      speechSynthesis.speak(u);
    }
    paintUI();
  }

  function clipEnded(my) {
    if (my !== token || clip !== 'speaking') return;
    clip = 'done'; doneAt = performance.now();
    if (!playing) { paintUI(); return; }
    const sid = SCENES[cueI].id;
    if (PAUSE_AFTER[sid] === cueK) { playing = false; showToast('workshop'); paintUI(); return; }
    if (idxOf(cueI, cueK) === flat.length - 1) { playing = false; showToast('end'); paintUI(); return; }
    if (opt.auto) setTimeout(() => { if (my === token && playing) stage.next(); }, (GAP * 1000) / opt.speed);
    paintUI();
  }

  function play() {
    ensureGraph();
    playing = true; hideToast();
    if (clip === 'speaking') {
      if (isPremium()) audio.play().catch(() => {});
      else if (opt.voice === 'device') speechSynthesis.resume();
    } else if (clip === 'waiting' || clip === 'idle') startClip(token);
    else if (clip === 'done') {
      if (idxOf(cueI, cueK) === flat.length - 1) stage.go(0, 0); else stage.next();
    }
    paintUI();
  }
  function pause() {
    playing = false;
    if (clip === 'speaking') {
      if (isPremium()) audio.pause();
      else if (opt.voice === 'device') speechSynthesis.pause();
    }
    paintUI();
  }
  const toggle = () => (playing ? pause() : play());
  function replay() { pendingSeek = 0; playing = true; ensureGraph(); cue(cueI, cueK, 0.05); }

  function setVoice(k) {
    opt.voice = pickVoice(k); save(); timeline();
    const my = ++token; stopClip();
    cueFrom = 0; silentPos = 0; mapWords(cueI, cueK);
    clip = 'waiting';
    if (playing) startClip(my);
    dressNarrator(); paintUI();
  }
  function setSpeed(s) {
    opt.speed = nearSpeed(s); save();
    audio.playbackRate = opt.speed;
    paintUI();
  }

  stage.onChange(({ cur, step, sceneChanged }) => cue(cur, step, sceneChanged ? LAND : 0.3));

  // ---- clip clock (seconds at 1x within the current clip)
  function clipTime() {
    if (clip === 'done') return durOf(cueI, cueK);
    if (clip !== 'speaking') return cueFrom;
    if (isPremium()) return audio.currentTime || 0;
    if (opt.voice === 'device') return (devChar / Math.max(1, textOf(cueI, cueK).length)) * durOf(cueI, cueK);
    return silentPos;
  }
  function charAt(t) {
    if (opt.voice === 'device' && clip === 'speaking') return { ci: devChar, letter: textOf(cueI, cueK)[devChar + 1] || '' };
    let w = null;
    for (let n = 0; n < words.length; n++) { if (words[n].t <= t + 0.04) w = words[n]; else break; }
    if (!w) return { ci: -1, letter: '' };
    const p = (t - w.t) / Math.max(0.05, w.d);
    if (p > 1.15) return { ci: w.ci + w.w.length - 1, letter: '', gap: true };
    return { ci: w.ci + Math.floor(Math.min(0.99, Math.max(0, p)) * w.w.length), letter: w.w[Math.floor(Math.min(0.99, Math.max(0, p)) * w.w.length)] };
  }

  // ---- narrator box
  const cam = stage.camBox;
  const cv = el('canvas'); cv.id = 'avatar';
  cam.prepend(cv);
  cam.appendChild(el('span', 'cam-ai', 'AI'));
  cam.title = 'AI narrator · double-click to resize · B hides';
  const avatar = createAvatar(cv, { mode: 'orb' });
  function dressNarrator() {
    const v = voiceOf(opt.voice);
    const tag = stage.nameTag; tag.textContent = '';
    cam.classList.toggle('hidden', opt.voice === 'silent');
    if (v && isPremium()) { avatar.set({ mode: 'person', look: v.look }); tag.append(`${v.name} `, el('small', '', ROLE)); }
    else { avatar.set({ mode: 'orb' }); tag.append('Device voice ', el('small', '', 'Browser speech · captions on')); }
  }

  // ---- captions
  const cap = el('div'); cap.id = 'captions'; cap.setAttribute('aria-live', 'off');
  const capIn = el('span', 'cap-in'); cap.appendChild(capIn); document.body.appendChild(cap);
  let capSpans = [];
  function paintCaptions(ci) {
    const show = opt.captions && (clip === 'speaking' || (clip === 'done' && performance.now() - doneAt < 1200));
    cap.style.opacity = show ? 1 : 0;
    if (!show || !chunks.length) return;
    let ch = 0;
    for (let n = 0; n < chunks.length; n++) if (tokens[chunks[n][0]].s <= Math.max(0, ci)) ch = n;
    if (clip === 'done') ch = chunks.length - 1;
    if (ch !== chunkNow) {
      chunkNow = ch; capIn.textContent = ''; capSpans = [];
      chunks[ch].forEach((n, m) => { const s = el('span', 'w', tokens[n].w); capSpans.push([s, tokens[n]]); capIn.append(s, m < chunks[ch].length - 1 ? ' ' : ''); });
    }
    capSpans.forEach(([s, tk]) => {
      const said = clip === 'done' || tk.e <= ci, now = tk.s <= ci && ci < tk.e;
      s.classList.toggle('said', said || now); s.classList.toggle('now', now);
    });
  }

  // ---- control bar
  const bar = el('div', 'film-bar film-ui');
  const track = el('div', 'fb-track'); const fill = el('div', 'fb-fill'); const knob = el('div', 'fb-knob'); const tip = el('div', 'fb-tip');
  track.append(fill, knob, tip);
  const row = el('div', 'film-row');
  const bPrev = iconBtn('fb-icon', 'prev', 'Previous step (←)');
  const bPlay = el('button', 'fb-play'); bPlay.title = 'Play or pause (Space, K)';
  const bNext = iconBtn('fb-icon', 'next', 'Next step (→)');
  const bReplay = iconBtn('fb-icon fb-hide-sm', 'replay', 'Replay this step (J)');
  const time = el('span', 'fb-time');
  const title = el('span', 'fb-title');
  const bCC = el('button', '', 'CC'); bCC.title = 'Captions (S)';
  const bAuto = el('button', 'fb-hide-sm', 'Auto'); bAuto.title = 'Auto-advance after each step (A)';
  const sSpeed = el('select'); sSpeed.title = 'Speed ([ and ])';
  SPEEDS.forEach((s) => { const o = el('option', '', `${s}×`); o.value = s; sSpeed.appendChild(o); });
  const sVoice = el('select', 'fb-hide-sm'); sVoice.title = 'Narrator voice (V)';
  premium.forEach((v) => { const o = el('option', '', `${v.name} · neural`); o.value = v.key; sVoice.appendChild(o); });
  [['device', 'Device voice'], ['silent', 'Captions only']].forEach(([k, n]) => { const o = el('option', '', n); o.value = k; sVoice.appendChild(o); });
  const bMute = iconBtn('fb-icon fb-hide-sm', 'sound', 'Mute (0)');
  const vol = el('input', 'fb-vol'); vol.type = 'range'; vol.min = 0; vol.max = 1; vol.step = 0.05; vol.value = opt.volume; vol.title = 'Volume (- and =)';
  const bChap = el('button', 'fb-hide-sm', 'Chapters'); bChap.title = 'Jump to a scene (M)';
  const bShare = el('button', 'fb-hide-sm', 'Share'); bShare.title = 'Copy a link to this exact moment';
  const bFull = iconBtn('fb-icon', 'full', 'Fullscreen (F)');
  row.append(bPrev, bPlay, bNext, bReplay, time, title, bCC, bAuto, sSpeed, sVoice, bMute, vol, bChap, bShare, bFull);
  bar.append(track, row);
  document.body.appendChild(bar);
  const ticks = [];
  flat.forEach(([, k], j) => { if (k === 0 && j > 0) { const tk = el('div', 'fb-tick'); track.appendChild(tk); ticks.push([tk, j]); } });
  const relayTicks = () => ticks.forEach(([tk, j]) => { tk.style.left = `${(starts[j] / total) * 100}%`; });
  relayTicks();

  bPrev.addEventListener('click', () => stage.prev());
  bNext.addEventListener('click', () => stage.next());
  bPlay.addEventListener('click', toggle);
  bReplay.addEventListener('click', replay);
  bCC.addEventListener('click', () => { opt.captions = !opt.captions; save(); paintUI(); });
  bAuto.addEventListener('click', () => { opt.auto = !opt.auto; save(); paintUI(); });
  sSpeed.addEventListener('change', () => setSpeed(+sSpeed.value));
  sVoice.addEventListener('change', () => { setVoice(sVoice.value); relayTicks(); });
  bMute.addEventListener('click', () => { opt.muted = !opt.muted; audio.volume = opt.muted ? 0 : opt.volume; paintUI(); });
  vol.addEventListener('input', () => { opt.volume = +vol.value; opt.muted = false; audio.volume = opt.volume; save(); paintUI(); });
  bChap.addEventListener('click', () => $('#btn-menu').click());
  bShare.addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}?voice=${encodeURIComponent(opt.voice)}&speed=${opt.speed}#${stage.cur}/${stage.step}`;
    try { await navigator.clipboard.writeText(url); bShare.textContent = 'Link copied'; } catch { bShare.textContent = 'Copy failed'; }
    setTimeout(() => { bShare.textContent = 'Share'; }, 1600);
  });
  bFull.addEventListener('click', () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.(); });

  function posAt(x) {
    const r = track.getBoundingClientRect();
    const t = Math.max(0, Math.min(0.9999, (x - r.left) / r.width)) * total;
    let j = 0; while (j + 1 < starts.length && starts[j + 1] <= t) j++;
    return { j, off: Math.max(0, Math.min(durOf(...flat[j]) - 0.3, t - starts[j])), frac: t / total };
  }
  track.addEventListener('pointermove', (e) => {
    const { j, frac } = posAt(e.clientX); const [i, k] = flat[j];
    tip.textContent = `${SCENES[i].title} · step ${k + 1} · ${fmt(starts[j] / opt.speed)}`;
    tip.style.left = `${frac * 100}%`;
  });
  track.addEventListener('click', (e) => {
    const { j, off } = posAt(e.clientX); const [i, k] = flat[j];
    pendingSeek = isPremium() || opt.voice === 'silent' ? off : 0;
    stage.go(i, k);
  });

  function paintUI() {
    bPlay.innerHTML = playing ? ICON.pause : ICON.play;
    bCC.classList.toggle('on', opt.captions); document.body.classList.toggle('no-captions', !opt.captions);
    bAuto.classList.toggle('on', opt.auto);
    sSpeed.value = String(opt.speed); sVoice.value = opt.voice;
    bMute.innerHTML = ICON[opt.muted || opt.volume === 0 ? 'mute' : 'sound'];
    const s = SCENES[cueI];
    title.textContent = '';
    title.append(el('b', '', `${String(cueI + 1).padStart(2, '0')} ${s.eyebrow}`), `${s.title} · step ${cueK + 1} of ${s.notes.length}`);
    document.body.classList.toggle('film-playing', playing);
    if ('mediaSession' in navigator) {
      try {
        const v = voiceOf(opt.voice);
        navigator.mediaSession.metadata = new MediaMetadata({ title: `${s.title} ${s.grad}`, artist: v && isPremium() ? `${v.name} · AI narrator` : `${DECK.name} narrated`, album: DECK.film.album });
        navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
      } catch { /* optional API */ }
    }
  }
  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.setActionHandler('play', play);
      navigator.mediaSession.setActionHandler('pause', pause);
      navigator.mediaSession.setActionHandler('nexttrack', () => stage.next());
      navigator.mediaSession.setActionHandler('previoustrack', () => stage.prev());
    } catch { /* optional API */ }
  }

  // ---- toasts
  const toast = el('div', 'film-toast film-ui'); toast.hidden = true; document.body.appendChild(toast);
  function hideToast() { toast.hidden = true; }
  function showToast(kind) {
    toast.textContent = ''; toast.hidden = false; toast.dataset.kind = kind;
    const act = el('div', 'toast-actions');
    if (kind === 'workshop') {
      toast.append(el('div', 'eyebrow', 'Workshop break'), el('p', '', 'Fill in your brief on the left, copy it, and paste or speak it into Cursor, Claude, or ChatGPT. The film waits for you.'));
      const bt = el('button', '', 'Start the 10 minute timer'); bt.addEventListener('click', () => { $('#ws-timer').click(); bt.disabled = true; });
      const bc = el('button', 'primary', 'Continue the film'); bc.addEventListener('click', play);
      act.append(bt, bc);
    } else if (kind === 'end') {
      toast.append(el('div', 'eyebrow', 'The end'), el('p', '', 'That is the film. Open any verse from the scenes menu, or share this link with your team.'));
      const br = el('button', '', 'Replay from the start'); br.addEventListener('click', () => { playing = true; ensureGraph(); stage.go(0, 0); });
      const bs = el('button', 'primary', 'Copy share link'); bs.addEventListener('click', () => bShare.click());
      act.append(br, bs);
    } else {
      toast.append(el('div', 'eyebrow', 'Audio is waiting'), el('p', '', 'Your browser needs one click before it plays sound.'));
      const bp = el('button', 'primary', 'Play'); bp.addEventListener('click', play);
      act.append(bp);
    }
    toast.appendChild(act);
  }

  // ---- start gate
  const gate = el('div', 'film-gate film-ui');
  const card = el('div', 'gate-card');
  const mins = Math.round(total / 60);
  card.append(el('div', 'eyebrow', `The narrated edition · about ${mins} minutes at 1×`));
  const h1 = el('h1'); h1.append(`${SCENES[0].title} `, Object.assign(el('span', 'grad'), { textContent: 'Press play and sit back.' }));
  card.append(h1, el('p', '', DECK.film.blurb));
  const grid = el('div', 'gate-voices');
  const thumbs = [];
  const addCard = (key, name, sub, look) => {
    const b = el('button', 'voice-card'); b.dataset.key = key;
    if (look) { const c = el('canvas'); b.appendChild(c); thumbs.push([c, look]); } else b.appendChild(el('span', 'vc-icon', key === 'device' ? 'Aa' : 'CC'));
    const tx = el('div'); tx.append(el('b', '', name), el('span', '', sub)); b.appendChild(tx);
    b.addEventListener('click', () => { opt.voice = key; save(); grid.querySelectorAll('.voice-card').forEach((x) => x.classList.toggle('on', x === b)); });
    b.addEventListener('dblclick', () => startFilm());
    grid.appendChild(b);
  };
  premium.forEach((v) => {
    const sec = Object.values(manifest[v.key]).reduce((a, c) => a + c.dur, 0);
    addCard(v.key, v.name, `Neural voice · ${Math.round(sec / 60)} min · animated`, v.look);
  });
  if ('speechSynthesis' in window) addCard('device', 'Device voice', 'Your browser speech · no avatar');
  addCard('silent', 'Captions only', 'Silent · timed captions');
  card.appendChild(grid);
  const optRow = el('div', 'gate-actions');
  const gSpeed = sSpeed.cloneNode(true); gSpeed.value = String(opt.speed); gSpeed.addEventListener('change', () => setSpeed(+gSpeed.value));
  const lab = el('label', 'muted'); const cb = el('input'); cb.type = 'checkbox'; cb.checked = opt.captions; cb.addEventListener('change', () => { opt.captions = cb.checked; save(); paintUI(); });
  lab.append(cb, ' Captions');
  const resumeAt = stage.cur > 0 || stage.step > 0;
  const bGo = el('button', 'primary', resumeAt ? `Resume at ${SCENES[stage.cur].title}` : 'Play the film');
  bGo.addEventListener('click', () => startFilm());
  optRow.append(bGo);
  if (resumeAt) { const b0 = el('button', '', 'Start from the beginning'); b0.addEventListener('click', () => startFilm(true)); optRow.append(b0); }
  const bExplore = el('button', '', 'Explore without narration'); bExplore.addEventListener('click', () => { gate.hidden = true; paintUI(); });
  const speedLab = el('label', 'muted', 'Speed '); speedLab.appendChild(gSpeed);
  optRow.append(bExplore, speedLab, lab);
  card.appendChild(optRow);
  card.appendChild(el('p', 'muted gate-note', 'The narrator is an AI-generated voice and an animated avatar, not a real person. Keys: Space or K play and pause, ← → step, ↓ ↑ scene, [ ] speed, S captions, V voice, J replay, M chapters, T talking points.'));
  gate.appendChild(card);
  document.body.appendChild(gate);
  grid.querySelector(`[data-key="${opt.voice}"]`)?.classList.add('on');
  requestAnimationFrame(() => thumbs.forEach(([c, look]) => createAvatar(c, { mode: 'person', look }).frame(0.016, 2, {})));

  function startFilm(fromTop = false) {
    gate.hidden = true;
    timeline(); relayTicks(); dressNarrator();
    ensureGraph();
    playing = true;
    if (fromTop) stage.go(0, 0);
    else { cueFrom = 0; clip = 'waiting'; startClip(token); }
    paintUI();
  }

  // ---- keys
  stage.keyHook = (e) => {
    const k = e.key;
    if (!gate.hidden) {
      if (k === 'Enter' || k === ' ') { e.preventDefault(); startFilm(); return true; }
      return false;
    }
    if (k === ' ' || k === 'k' || k === 'K' || k === 'MediaPlayPause') toggle();
    else if (k === '[' || k === '<') setSpeed(SPEEDS[Math.max(0, SPEEDS.indexOf(opt.speed) - 1)]);
    else if (k === ']' || k === '>') setSpeed(SPEEDS[Math.min(SPEEDS.length - 1, SPEEDS.indexOf(opt.speed) + 1)]);
    else if (k === 's' || k === 'S') bCC.click();
    else if (k === 'a' || k === 'A') bAuto.click();
    else if (k === 'j' || k === 'J') replay();
    else if (k === '0') bMute.click();
    else if (k === '-' || k === '=') { vol.value = Math.max(0, Math.min(1, opt.volume + (k === '=' ? 0.1 : -0.1))); vol.dispatchEvent(new Event('input')); }
    else if (k === 'v' || k === 'V') {
      const keys = [...sVoice.options].map((o) => o.value);
      setVoice(keys[(keys.indexOf(opt.voice) + 1) % keys.length]); relayTicks();
    } else return false;
    e.preventDefault();
    return true;
  };

  // ---- idle hide
  let idleT = 0;
  const wake = () => { document.body.classList.remove('film-idle'); idleT = 0; };
  addEventListener('pointermove', wake); addEventListener('keydown', wake);
  bar.addEventListener('pointerenter', () => { bar.dataset.hover = '1'; });
  bar.addEventListener('pointerleave', () => { bar.dataset.hover = ''; });

  // ---- loop
  let last = performance.now(), uiT = 0;
  function tick(now) {
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (playing && clip === 'speaking' && opt.voice === 'silent') {
      silentPos += dt * opt.speed;
      if (silentPos >= durOf(cueI, cueK)) clipEnded(token);
    }
    const t = clipTime();
    const c = charAt(t);
    let amp = 0;
    const speaking = clip === 'speaking' && playing;
    if (speaking) {
      const lv = isPremium() ? level() : null;
      amp = lv !== null ? lv : c.gap || c.ci < 0 ? 0.05 : 0.4 + 0.3 * Math.abs(Math.sin(now / 70));
    }
    avatar.frame(dt, now / 1000, { amp, letter: speaking ? c.letter : '' });
    paintCaptions(c.ci);
    uiT += dt;
    if (uiT > 0.1) {
      uiT = 0;
      const j = Math.max(0, idxOf(cueI, cueK));
      const pos = Math.min(total, starts[j] + Math.min(t, durOf(cueI, cueK)));
      const f = (pos / total) * 100;
      fill.style.width = `${f}%`; knob.style.left = `${f}%`;
      time.textContent = `${fmt(pos / opt.speed)} / ${fmt(total / opt.speed)}`;
      idleT += 0.1;
      if (playing && idleT > 3.2 && !bar.dataset.hover && gate.hidden) document.body.classList.add('film-idle');
    }
    requestAnimationFrame(tick);
  }
  dressNarrator();
  mapWords(cueI, cueK);
  paintUI();
  requestAnimationFrame(tick);
  window.__film = { play, pause, setVoice, setSpeed, seek: (i, k, off) => { pendingSeek = off; stage.go(i, k); }, get state() { return { playing, clip, cueI, cueK, voice: opt.voice, speed: opt.speed, t: clipTime() }; } };
}
