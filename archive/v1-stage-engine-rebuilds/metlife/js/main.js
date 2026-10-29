import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SCENES, BLOCKS, LENSES, VERSES, SOURCES, PRESENTER, DECK, WORKSHOP_FIELDS, buildWorkshopPrompt } from './content.js';
import { createSky } from './background.js';
import { createField } from './particles.js';
import * as B from './scenes.js';
import { damp, easeInOut, OVERLAY } from './core.js';
import { POINTS } from './script.js';

const DEFS = { ...B };
const FILM = document.body.dataset.edition === 'narrated';
const $ = (s) => document.querySelector(s);
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; };
const blockOf = (k) => BLOCKS.find((b) => b.key === k) || (LENSES || []).find((b) => b.key === k) || { label: k, color: '#00BCEB' };
const stepsOf = (i) => Math.max(1, SCENES[i].notes.length);
const chan = 'BroadcastChannel' in window ? new BroadcastChannel(DECK.channel) : null;

// ---------------------------------------------------------------- verse links
const URL_KEY = `${DECK.channel}.links.v1`;
function verseUrls() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(URL_KEY) || '{}'); } catch { saved = {}; }
  const out = {};
  VERSES.forEach((v) => {
    const s = typeof saved[v.key] === 'string' ? saved[v.key] : '';
    out[v.key] = /^https:\/\/[^\s]+$/.test(s) ? s : v.url;
  });
  return out;
}

// ---------------------------------------------------------------- modes
const params = new URLSearchParams(location.search);
if (params.has('talktrack')) renderTalkTrack();
else if (params.has('points') || document.body.dataset.mode === 'points') renderPoints();
else if (params.has('presenter')) renderPresenter();
else startStage();

// ================================================================ STAGE
function startStage() {
  document.body.classList.add('stage');
  const canvas = $('#gl');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050e1d, 0.011);
  const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 4000);
  scene.add(new THREE.AmbientLight(0x9be7ff, 0.55));
  scene.add(new THREE.HemisphereLight(0x9be7ff, 0x050e1d, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(20, 40, 30); scene.add(key);

  const sky = createSky(); scene.add(sky.mesh);
  const field = createField(); scene.add(field.points);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.5, 0.45, 0.24);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const SPACING = 700;
  const origins = SCENES.map((_, i) => new THREE.Vector3(i * SPACING, 0, (i % 2) * -120));
  const built = new Map();
  function ensure(i) {
    if (i < 0 || i >= SCENES.length) return null;
    if (built.has(i)) return built.get(i);
    const def = DEFS[SCENES[i].id];
    const inst = def.build();
    inst.def = def;
    inst.group.position.add(origins[i]);
    inst.group.visible = false;
    scene.add(inst.group);
    built.set(i, inst);
    return inst;
  }

  // ---- state
  let cur = 0, step = 0, prevScene = -1;
  const camPos = new THREE.Vector3(0, 6, 30), camTgt = new THREE.Vector3(0, 5, 0);
  const flight = { on: false, u: 0, from: new THREE.Vector3(), fromT: new THREE.Vector3(), dur: 1.9 };
  let viewShift = 0;
  const fromHash = location.hash.match(/^#(\d+)(?:\/(\d+))?/);
  if (fromHash) { cur = Math.min(SCENES.length - 1, +fromHash[1]); step = Math.min(stepsOf(cur) - 1, +(fromHash[2] || 0)); }

  function camFor(i, s) {
    const def = DEFS[SCENES[i].id];
    const c = def.cams[Math.min(s, def.cams.length - 1)];
    return { p: new THREE.Vector3(...c.p).add(origins[i]), t: new THREE.Vector3(...c.t).add(origins[i]) };
  }
  function bgFor(i, s) {
    const def = DEFS[SCENES[i].id];
    let bg = def.bg;
    if (def.bgSteps) for (let k = 0; k <= s && k < def.bgSteps.length; k++) if (def.bgSteps[k]) bg = def.bgSteps[k];
    return bg;
  }

  function go(i, s, { instant = false } = {}) {
    i = Math.max(0, Math.min(SCENES.length - 1, i));
    s = Math.max(0, Math.min(stepsOf(i) - 1, s));
    const changed = i !== cur || instant;
    if (i !== cur) {
      prevScene = cur;
      const old = built.get(cur); if (old && old.leave) old.leave();
      cur = i;
      const inst = ensure(cur); inst.reset?.(); inst.group.visible = true;
      flight.on = true; flight.u = 0; flight.from.copy(camPos); flight.fromT.copy(camTgt);
      ensure(cur + 1);
    }
    step = s;
    sky.set(bgFor(cur, step));
    if (changed) field.morph(SCENES[cur].id, origins[cur]);
    if (instant) {
      const c = camFor(cur, step); camPos.copy(c.p); camTgt.copy(c.t); flight.on = false; sky.snap();
      const inst = ensure(cur); inst.group.visible = true;
    }
    history.replaceState(null, '', `${location.pathname}${location.search}#${cur}/${step}`);
    renderHud();
    broadcast();
    listeners.forEach((fn) => fn({ cur, step, sceneChanged: i !== prevCur }));
    prevCur = cur;
  }
  const listeners = [];
  let prevCur = -1;
  const next = () => (step < stepsOf(cur) - 1 ? go(cur, step + 1) : go(cur + 1, 0));
  const prev = () => (step > 0 ? go(cur, step - 1) : go(cur - 1, stepsOf(cur - 1 < 0 ? 0 : cur - 1) - 1));
  const nextScene = () => go(cur + 1, 0);
  const prevScene_ = () => go(step > 0 ? cur : cur - 1, 0);

  // ---- HUD
  const hud = $('#hud');
  const chips = $('#chips');
  const live = $('#live');
  const prog = $('#progress > i');
  const dots = $('#dots');
  const chapters = [];
  SCENES.forEach((s, i) => {
    const d = el('button', 'dot'); d.title = `${s.eyebrow} · ${s.title}`; d.addEventListener('click', () => go(i, 0));
    dots.appendChild(d); chapters.push(d);
  });

  function renderHud() {
    const s = SCENES[cur];
    document.body.dataset.layout = s.layout || 'stack';
    document.body.dataset.scene = s.id;
    hud.classList.remove('in'); void hud.offsetWidth;
    $('#eyebrow').textContent = s.eyebrow;
    const h1 = $('#title'); h1.textContent = ''; h1.append(s.title + ' ', Object.assign(el('span', 'grad'), { textContent: s.grad }));
    $('#lead').textContent = s.lead;
    const beats = $('#beats'); beats.textContent = '';
    if (s.layout === 'focus') {
      const b = s.beats[step];
      const card = el('div', 'focus-card');
      if (b.b !== undefined) {
        const bk = BLOCKS[b.b];
        card.style.setProperty('--c', bk.color);
        card.append(el('div', 'focus-num', String(b.b + 1).padStart(2, '0') + ' / ' + String(BLOCKS.length).padStart(2, '0')), el('h3', '', b.h), el('code', 'focus-q', b.q), el('p', '', b.p));
      } else {
        card.append(el('h3', '', b.h), el('p', '', b.p));
        const row = el('div', 'block-row');
        BLOCKS.forEach((bk) => { const c = el('span', 'chip', bk.label); c.style.setProperty('--c', bk.color); row.appendChild(c); });
        card.appendChild(row);
      }
      beats.appendChild(card);
    } else if (s.layout !== 'workshop') {
      s.beats.forEach((b, k) => {
        const li = el('li', k < step ? 'done' : k === step ? 'now' : 'later');
        li.append(el('strong', '', b.h), el('span', '', b.p));
        beats.appendChild(li);
      });
    }
    chips.textContent = '';
    if (s.prompt) {
      chips.appendChild(el('div', 'chips-title', s.chipsTitle || 'Prompt logic'));
      s.prompt.forEach(([k, txt]) => {
        const bk = blockOf(k);
        const c = el('span', 'chip'); c.style.setProperty('--c', bk.color);
        c.append(el('b', '', bk.label), txt ? document.createTextNode(' ' + txt) : '');
        chips.appendChild(c);
      });
    }
    live.textContent = '';
    if (s.verse) {
      const urls = verseUrls();
      const list = VERSES.filter((v) => v.scene === s.id);
      list.forEach((v) => {
        const a = el('a', 'live-btn'); a.href = urls[v.key]; a.target = '_blank'; a.rel = 'noopener noreferrer';
        a.append(el('span', 'live-dot'), el('b', '', v.name), el('span', 'live-url', urls[v.key].replace('https://', '').replace(/\/$/, '')));
        live.appendChild(a);
      });
    }
    $('#stepinfo').textContent = `${String(cur + 1).padStart(2, '0')}/${SCENES.length} · step ${step + 1}/${stepsOf(cur)}`;
    chapters.forEach((d, i) => { d.classList.toggle('on', i === cur); d.classList.toggle('past', i < cur); });
    const total = SCENES.reduce((a, _, i) => a + stepsOf(i), 0);
    const done = SCENES.slice(0, cur).reduce((a, _, i) => a + stepsOf(i), 0) + step + 1;
    prog.style.width = `${(done / total) * 100}%`;
    $('#notes-body').textContent = s.notes[step] || '';
    $('#workshop').classList.toggle('open', s.layout === 'workshop');
    if (!FILM && s.id === 'workshop' && step >= 1 && !timer.started) startTimer();
    requestAnimationFrame(() => hud.classList.add('in'));
  }

  // ---- workshop
  const wsVals = {};
  const form = $('#ws-form');
  WORKSHOP_FIELDS.forEach((f) => {
    const lab = el('label', 'ws-field'); lab.style.setProperty('--c', blockOf(f.block).color);
    lab.append(el('span', '', f.label));
    const inp = el('input'); inp.placeholder = f.ph; inp.maxLength = 220; inp.autocomplete = 'off';
    if (f.key === 'hours') { inp.inputMode = 'numeric'; inp.maxLength = 2; }
    inp.addEventListener('input', () => { wsVals[f.key] = inp.value; renderPrompt(); });
    lab.appendChild(inp); form.appendChild(lab);
  });
  function renderPrompt() {
    const parts = buildWorkshopPrompt(wsVals);
    const out = $('#ws-prompt'); out.textContent = '';
    parts.forEach(([k, txt]) => { const s = el('span', 'seg', txt + ' '); s.style.setProperty('--c', blockOf(k).color); out.appendChild(s); });
    const has = (k) => (wsVals[k] && wsVals[k].trim() ? 1 : 0);
    const f = B.workshopState.filled;
    // Each block lights when its fields are filled; blocks with no fields are fixed text and stay lit.
    BLOCKS.forEach((bk, i) => {
      const fs = WORKSHOP_FIELDS.filter((x) => x.block === bk.key);
      f[i] = fs.length ? Math.max(...fs.map((x) => has(x.key))) : 1;
    });
    return parts.map((p) => p[1]).join('\n\n');
  }
  renderPrompt();
  $('#ws-copy').addEventListener('click', async () => {
    const txt = renderPrompt();
    try { await navigator.clipboard.writeText(txt); } catch {
      const ta = el('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    $('#ws-copy').textContent = 'Copied'; setTimeout(() => { $('#ws-copy').textContent = 'Copy prompt'; }, 1600);
  });
  const timer = { started: false, running: false, rem: 600 };
  B.workshopState.timer = 600;
  function startTimer() { timer.started = true; timer.running = true; }
  $('#ws-timer').addEventListener('click', () => { timer.started = true; timer.running = !timer.running; });
  $('#ws-reset').addEventListener('click', () => { timer.rem = 600; timer.running = false; timer.started = false; });

  // ---- presenter cam
  const cam = $('#cam'), camVideo = $('#cam video');
  $('#cam-name').textContent = PRESENTER.name;
  let stream = null;
  async function toggleCam() {
    if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; camVideo.srcObject = null; cam.classList.remove('live'); return; }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
      camVideo.srcObject = stream; await camVideo.play(); cam.classList.add('live');
    } catch { $('#cam-hint').textContent = 'Camera blocked. Allow it in the browser, or use your meeting app camera here.'; }
  }
  $('#cam').addEventListener('dblclick', () => cam.classList.toggle('big'));
  $('#cam-hint').addEventListener('click', toggleCam);

  // ---- overlays
  const menu = $('#menu');
  SCENES.forEach((s, i) => {
    const b = el('button', 'menu-item');
    b.append(el('span', 'menu-eb', s.eyebrow), el('strong', '', s.title), el('span', 'menu-g', s.grad));
    b.addEventListener('click', () => { menu.classList.remove('open'); go(i, 0); });
    $('#menu-grid').appendChild(b);
  });
  function buildSettings() {
    const box = $('#settings-list'); box.textContent = '';
    const urls = verseUrls();
    VERSES.forEach((v) => {
      const lab = el('label', 'set-row'); lab.append(el('span', '', `${v.name} · ${v.sub}`));
      const inp = el('input'); inp.value = urls[v.key]; inp.dataset.key = v.key; inp.spellcheck = false;
      lab.appendChild(inp); box.appendChild(lab);
    });
  }
  $('#settings-save').addEventListener('click', () => {
    const o = {};
    document.querySelectorAll('#settings-list input').forEach((i) => { const v = i.value.trim(); if (/^https:\/\/[^\s]+$/.test(v)) o[i.dataset.key] = v; });
    localStorage.setItem(URL_KEY, JSON.stringify(o));
    $('#settings').classList.remove('open'); renderHud();
  });
  $('#settings-reset').addEventListener('click', () => { localStorage.removeItem(URL_KEY); buildSettings(); renderHud(); });
  document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => b.closest('.overlay').classList.remove('open')));
  $('#btn-menu').addEventListener('click', () => menu.classList.toggle('open'));
  $('#btn-notes').addEventListener('click', () => document.body.classList.toggle('show-notes'));
  $('#btn-presenter').addEventListener('click', openPresenter);
  $('#btn-cam').addEventListener('click', toggleCam);
  $('#btn-settings').addEventListener('click', () => { buildSettings(); $('#settings').classList.add('open'); });
  $('#btn-help').addEventListener('click', () => $('#help').classList.toggle('open'));
  function openPresenter() { window.open(`${location.pathname}?presenter#${cur}/${step}`, `${DECK.channel}-presenter`, 'width=1100,height=760'); }
  function openPoints() { window.open(`talking-points.html#${cur}/${step}`, `${DECK.channel}-points`, 'width=1100,height=800'); }
  $('#btn-points').addEventListener('click', openPoints);

  // ---- input
  const isUI = (t) => t.closest && t.closest('input, textarea, button, a, select, label, .overlay, #workshop, #cam, .topbar, #live, .film-ui');
  const stage = {
    go, next, prev, nextScene, prevScene: prevScene_, stepsOf,
    get cur() { return cur; }, get step() { return step; },
    onChange: (fn) => listeners.push(fn), keyHook: null,
    camBox: cam, nameTag: $('#cam-name'),
  };
  addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input, textarea')) { if (e.key === 'Escape') e.target.blur(); return; }
    if (stage.keyHook && stage.keyHook(e)) return;
    const k = e.key;
    if ((k === 'ArrowRight' && e.shiftKey) || k === 'ArrowDown') { e.preventDefault(); nextScene(); }
    else if ((k === 'ArrowLeft' && e.shiftKey) || k === 'ArrowUp') { e.preventDefault(); prevScene_(); }
    else if (k === 'ArrowRight' || k === ' ' || k === 'PageDown' || k === 'Enter') { e.preventDefault(); next(); }
    else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'Backspace') { e.preventDefault(); prev(); }
    else if (k === 'Home') go(0, 0);
    else if (k === 'End') go(SCENES.length - 1, 0);
    else if (k === 'm' || k === 'M') menu.classList.toggle('open');
    else if (k === 'n' || k === 'N') document.body.classList.toggle('show-notes');
    else if (k === 'p' || k === 'P') openPresenter();
    else if (k === 't' || k === 'T') openPoints();
    else if (k === 'c' || k === 'C') toggleCam();
    else if (k === 'b' || k === 'B') cam.classList.toggle('hidden');
    else if (k === 'h' || k === 'H') document.body.classList.toggle('clean');
    else if (k === 'l' || k === 'L') { const a = live.querySelector('a'); if (a) window.open(a.href, '_blank', 'noopener'); }
    else if (k === ',') { buildSettings(); $('#settings').classList.add('open'); }
    else if (k === 'f' || k === 'F') { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.(); }
    else if (k === '?') $('#help').classList.toggle('open');
    else if (k === 'Escape') document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open'));
  });
  addEventListener('mousedown', (e) => {
    if (isUI(e.target)) return;
    if (e.button === 0) next(); else if (e.button === 2) prev();
  });
  addEventListener('contextmenu', (e) => { if (!isUI(e.target)) e.preventDefault(); });
  const mouse = new THREE.Vector2();
  addEventListener('pointermove', (e) => { mouse.set(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5); });

  // ---- presenter sync
  function broadcast() { chan?.postMessage({ type: 'state', cur, step }); }
  if (chan) chan.onmessage = (ev) => {
    const m = ev.data || {};
    if (m.type === 'nav') { if (m.dir === 1) next(); else if (m.dir === -1) prev(); else if (m.dir === 2) nextScene(); else if (m.dir === -2) prevScene_(); }
    else if (m.type === 'goto' && Number.isInteger(m.cur)) go(m.cur, Number.isInteger(m.step) ? m.step : 0);
    else if (m.type === 'hello') broadcast();
  };

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight);
    bloom.setSize(innerWidth, innerHeight);
  });

  // ---- loop
  ensure(cur); ensure(cur + 1);
  go(cur, step, { instant: true });
  const clock = new THREE.Clock();
  const look = new THREE.Vector3();
  function frame() {
    const dt = Math.min(0.05, clock.getDelta());
    const t = clock.elapsedTime;
    const c = camFor(cur, step);
    let warp = 0;
    if (flight.on) {
      flight.u = Math.min(1, flight.u + dt / flight.dur);
      const e = easeInOut(flight.u);
      camPos.lerpVectors(flight.from, c.p, e);
      camPos.y += Math.sin(e * Math.PI) * 40;
      camTgt.lerpVectors(flight.fromT, c.t, e);
      warp = Math.sin(flight.u * Math.PI);
      if (flight.u >= 1) {
        flight.on = false;
        built.forEach((inst, i) => { if (i !== cur) inst.group.visible = false; });
      }
    } else {
      camPos.x = damp(camPos.x, c.p.x, 2.2, dt); camPos.y = damp(camPos.y, c.p.y, 2.2, dt); camPos.z = damp(camPos.z, c.p.z, 2.2, dt);
      camTgt.x = damp(camTgt.x, c.t.x, 2.6, dt); camTgt.y = damp(camTgt.y, c.t.y, 2.6, dt); camTgt.z = damp(camTgt.z, c.t.z, 2.6, dt);
    }
    camera.position.copy(camPos);
    camera.position.x += mouse.x * 1.6; camera.position.y -= mouse.y * 1.0;
    look.copy(camTgt);
    camera.lookAt(look);
    const lay = SCENES[cur].layout || 'stack';
    const wantShift = innerWidth > 900 ? (lay === 'hero' ? 0 : lay === 'workshop' ? 0.2 : 0.17) : 0;
    viewShift = damp(viewShift, wantShift, 3, dt);
    camera.setViewOffset(innerWidth, innerHeight, -viewShift * innerWidth, 0, innerWidth, innerHeight);

    built.forEach((inst, i) => {
      if (!inst.group.visible) return;
      inst.update(dt, t, i === cur ? step : (i < cur ? stepsOf(i) - 1 : 0));
    });
    if (timer.running) { timer.rem = Math.max(0, timer.rem - dt); if (timer.rem === 0) timer.running = false; }
    B.workshopState.timer = timer.rem;
    const tl = $('#ws-timer'); const txt = `${String(Math.floor(timer.rem / 60)).padStart(2, '0')}:${String(Math.floor(timer.rem % 60)).padStart(2, '0')}`;
    if (tl.dataset.t !== txt + timer.running) { tl.dataset.t = txt + timer.running; tl.textContent = `${timer.running ? 'Pause' : 'Start'} · ${txt}`; }
    sky.update(dt, t, camera.position, warp);
    field.update(dt, t, innerHeight);
    camera.layers.set(0);
    composer.render();
    renderer.autoClear = false;
    renderer.clearDepth();
    camera.layers.set(OVERLAY);
    renderer.render(scene, camera);
    camera.layers.set(0);
    renderer.autoClear = true;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  if (FILM) import('./film.js').then((m) => m.initFilm(stage));
  window.__stage = { go, jump: (i, s) => go(i, s, { instant: true }), get fps() { return 1 / Math.max(1e-3, clock.getDelta()); }, get state() { return { cur, step }; } };
}

// ================================================================ PRESENTER
function renderPresenter() {
  document.body.classList.add('presenter');
  document.title = `Presenter · ${DECK.name}`;
  const root = $('#presenter-root'); root.hidden = false;
  let cur = 0, step = 0;
  const m = location.hash.match(/^#(\d+)(?:\/(\d+))?/); if (m) { cur = +m[1]; step = +(m[2] || 0); }
  const t0 = Date.now();
  function draw() {
    const s = SCENES[cur];
    $('#p-eyebrow').textContent = `${s.eyebrow} · step ${step + 1}/${stepsOf(cur)}`;
    $('#p-title').textContent = `${s.title} ${s.grad}`;
    const pts = $('#p-points'); pts.textContent = '';
    (POINTS[s.id]?.[step] || []).forEach((p) => pts.appendChild(el('li', '', p)));
    $('#p-note').textContent = s.notes[step] || '';
    const nx = step < stepsOf(cur) - 1 ? [cur, step + 1] : [cur + 1, 0];
    const ns = SCENES[nx[0]];
    $('#p-next').textContent = ns ? `${nx[0] === cur ? 'Next click' : 'Next scene: ' + ns.title}  ·  ${(ns.notes[nx[1]] || '').slice(0, 220)}...` : 'End of talk.';
    const list = $('#p-list'); list.textContent = '';
    SCENES.forEach((sc, i) => {
      const b = el('button', i === cur ? 'on' : '', `${String(i + 1).padStart(2, '0')}  ${sc.title}`);
      b.addEventListener('click', () => chan?.postMessage({ type: 'goto', cur: i, step: 0 }));
      list.appendChild(b);
    });
  }
  chan && (chan.onmessage = (ev) => { if (ev.data?.type === 'state') { cur = ev.data.cur; step = ev.data.step; draw(); } });
  chan?.postMessage({ type: 'hello' });
  const nav = (dir) => chan?.postMessage({ type: 'nav', dir });
  $('#p-prev').addEventListener('click', () => nav(-1));
  $('#p-nextbtn').addEventListener('click', () => nav(1));
  addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || (e.key === 'ArrowRight' && e.shiftKey)) nav(2);
    else if (e.key === 'ArrowUp' || (e.key === 'ArrowLeft' && e.shiftKey)) nav(-2);
    else if (['ArrowRight', ' ', 'PageDown'].includes(e.key)) { e.preventDefault(); nav(1); }
    else if (['ArrowLeft', 'PageUp'].includes(e.key)) nav(-1);
  });
  setInterval(() => {
    const s = Math.floor((Date.now() - t0) / 1000);
    $('#p-clock').textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')} elapsed`;
  }, 500);
  draw();
}

// ================================================================ TALKING POINTS
function renderPoints() {
  document.body.classList.add('points');
  document.title = `Talking points · ${DECK.name}`;
  const root = $('#points-root'); root.hidden = false;
  const flat = [];
  SCENES.forEach((s, i) => s.notes.forEach((_, k) => flat.push([i, k])));
  const words = (t) => t.split(/\s+/).filter(Boolean).length;
  const plannedAt = [];
  flat.reduce((acc, [i, k]) => { plannedAt.push(acc); return acc + words(SCENES[i].notes[k]) / 150 * 60; }, 0);
  const planned = plannedAt[plannedAt.length - 1] + words(SCENES.at(-1).notes.at(-1)) / 150 * 60;
  let cur = 0, step = 0, synced = false, t0 = null, size = +(localStorage.getItem(`${DECK.channel}.points.size`) || 1);
  const m = location.hash.match(/^#(\d+)(?:\/(\d+))?/); if (m) { cur = Math.min(SCENES.length - 1, +m[1]); step = +(m[2] || 0); }
  const idx = () => flat.findIndex(([i, k]) => i === cur && k === step);
  const fmt = (s) => `${s < 0 ? '-' : ''}${Math.floor(Math.abs(s) / 60)}:${String(Math.floor(Math.abs(s) % 60)).padStart(2, '0')}`;

  function draw() {
    const s = SCENES[cur];
    root.style.setProperty('--pt-scale', size);
    $('#pt-eyebrow').textContent = `${String(cur + 1).padStart(2, '0')} / ${SCENES.length} · ${s.eyebrow} · click ${step + 1} of ${stepsOf(cur)}`;
    $('#pt-title').textContent = `${s.title} ${s.grad}`;
    const ul = $('#pt-now'); ul.textContent = '';
    (POINTS[s.id]?.[step] || []).forEach((p) => ul.appendChild(el('li', '', p)));
    $('#pt-say').textContent = s.notes[step] || '';
    const n = flat[idx() + 1];
    const nx = $('#pt-next'); nx.textContent = '';
    if (n) {
      const ns = SCENES[n[0]];
      nx.append(el('b', '', n[0] === cur ? `Next click (${n[1] + 1}/${stepsOf(cur)})` : `Next scene · ${ns.title}`), el('span', '', ' ' + (POINTS[ns.id]?.[n[1]]?.[0] || '')));
    } else nx.textContent = 'Last click. Thank the room and open questions.';
    const out = $('#pt-outline'); out.textContent = '';
    SCENES.forEach((sc, i) => {
      const b = el('button', i === cur ? 'on' : i < cur ? 'past' : '', `${String(i + 1).padStart(2, '0')}  ${sc.title}`);
      b.addEventListener('click', () => goto(i, 0));
      out.appendChild(b);
    });
    out.querySelector('.on')?.scrollIntoView({ block: 'nearest' });
    $('#pt-sync').textContent = synced ? 'Synced with the stage' : 'Standalone · open the stage to sync';
    $('#pt-sync').classList.toggle('on', synced);
    history.replaceState(null, '', `${location.pathname}${location.search}#${cur}/${step}`);
  }
  function goto(i, k) {
    if (synced) chan.postMessage({ type: 'goto', cur: i, step: k });
    else { cur = i; step = k; draw(); }
  }
  function nav(dir) {
    if (!t0) t0 = Date.now();
    if (synced) { chan.postMessage({ type: 'nav', dir }); return; }
    const j = idx();
    if (dir === 1 && flat[j + 1]) [cur, step] = flat[j + 1];
    else if (dir === -1 && j > 0) [cur, step] = flat[j - 1];
    else if (dir === 2 && cur < SCENES.length - 1) { cur++; step = 0; }
    else if (dir === -2) { if (step > 0) step = 0; else if (cur > 0) { cur--; step = 0; } }
    draw();
  }
  if (chan) chan.onmessage = (ev) => {
    if (ev.data?.type !== 'state') return;
    const moved = synced && (ev.data.cur !== cur || ev.data.step !== step);
    if (!t0 && moved) t0 = Date.now();
    synced = true; cur = ev.data.cur; step = ev.data.step; draw();
  };
  chan?.postMessage({ type: 'hello' });
  $('#pt-prev').addEventListener('click', () => nav(-1));
  $('#pt-nextbtn').addEventListener('click', () => nav(1));
  $('#pt-smaller').addEventListener('click', () => { size = Math.max(0.7, size - 0.1); localStorage.setItem(`${DECK.channel}.points.size`, size); draw(); });
  $('#pt-bigger').addEventListener('click', () => { size = Math.min(1.8, size + 0.1); localStorage.setItem(`${DECK.channel}.points.size`, size); draw(); });
  $('#pt-script').addEventListener('click', () => root.classList.toggle('show-say'));
  $('#pt-clock-reset').addEventListener('click', () => { t0 = Date.now(); });
  addEventListener('keydown', (e) => {
    const k = e.key;
    if (k === 'ArrowDown' || (k === 'ArrowRight' && e.shiftKey)) { e.preventDefault(); nav(2); }
    else if (k === 'ArrowUp' || (k === 'ArrowLeft' && e.shiftKey)) { e.preventDefault(); nav(-2); }
    else if (['ArrowRight', ' ', 'PageDown', 'Enter'].includes(k)) { e.preventDefault(); nav(1); }
    else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); nav(-1); }
    else if (k === 's' || k === 'S') root.classList.toggle('show-say');
    else if (k === '+' || k === '=') $('#pt-bigger').click();
    else if (k === '-') $('#pt-smaller').click();
  });
  setInterval(() => {
    const el_ = t0 ? (Date.now() - t0) / 1000 : 0;
    const delta = el_ - plannedAt[Math.max(0, idx())];
    $('#pt-clock').textContent = `${fmt(el_)} elapsed · plan ${fmt(planned)}`;
    const pace = $('#pt-pace');
    pace.textContent = !t0 ? 'Clock starts on your first click' : Math.abs(delta) < 45 ? 'On pace' : delta > 0 ? `${fmt(delta)} behind plan` : `${fmt(-delta)} ahead of plan`;
    pace.dataset.state = !t0 ? '' : Math.abs(delta) < 45 ? 'ok' : delta > 0 ? 'late' : 'early';
  }, 500);
  draw();
}

// ================================================================ TALK TRACK
function renderTalkTrack() {
  document.body.classList.add('talktrack');
  document.title = `Talk track · ${DECK.name}`;
  const root = $('#talktrack-root'); root.hidden = false;
  root.appendChild(el('h1', '', `${DECK.sub}: talk track`));
  root.appendChild(el('p', 'tt-sub', `${PRESENTER.name} · ${PRESENTER.role} · ${DECK.sub}. Each paragraph is one click.`));
  SCENES.forEach((s, i) => {
    const sec = el('section');
    sec.append(el('div', 'tt-eb', `${String(i + 1).padStart(2, '0')} · ${s.eyebrow}`), el('h2', '', `${s.title} ${s.grad}`));
    s.notes.forEach((n, k) => { const p = el('p'); p.append(el('b', '', `Click ${k + 1}. `), n); sec.appendChild(p); });
    if (s.verse) {
      const urls = verseUrls();
      VERSES.filter((v) => v.scene === s.id).forEach((v) => sec.appendChild(el('p', 'tt-link', `${v.name}: ${urls[v.key]}`)));
    }
    root.appendChild(sec);
  });
  const src = el('section'); src.appendChild(el('h2', '', 'Sources'));
  SOURCES.forEach(([n, u]) => src.appendChild(el('p', 'tt-link', `${n}. ${u}`)));
  root.appendChild(src);
}
