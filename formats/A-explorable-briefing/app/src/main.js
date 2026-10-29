import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createMapScene } from './three/mapScene.js';
import { createWaysideScene } from './three/waysideScene.js';
import { fly } from './three/sprites.js';
import { BRAND, SOURCES, ASSUMPTIONS, PLACES, PERSONAS, TECH, SCENARIOS, SCENARIO_EXTRA_SOURCES, STORY, LEGEND } from './data/content.js';

const $ = (s) => document.querySelector(s);
const byId = (list, id) => list.find((x) => x.id === id);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- Brand copy ----------
document.title = BRAND.docTitle;
$('#b1').textContent = BRAND.title;
$('#b2').textContent = BRAND.subtitle;
$('#iKicker').textContent = BRAND.kicker;
$('#iH1').innerHTML = `${BRAND.headline[0]}<br><span>${BRAND.headline[1]}</span>`;
$('#iP').textContent = BRAND.intro;
$('#iNote').textContent = BRAND.note;

// ---------- Renderer, camera, controls ----------
const canvas = $('#gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI * 0.47;
controls.minDistance = 2;
controls.maxDistance = 80;

const map = createMapScene();
const site = createWaysideScene();
const scenes = { map, wayside: site };
const state = { view: 'map', mode: 'without', sel: null, tab: 'personas', story: -1, playing: false };

camera.position.copy(map.overview.pos).add(new THREE.Vector3(0, 12, 14));
controls.target.copy(map.overview.target);
controls.update();

// ---------- Hash state (written on change, read on load and hashchange) ----------
let writingHash = false;
function writeHash() {
  const p = new URLSearchParams();
  if (state.mode !== 'without') p.set('mode', state.mode);
  if (state.story >= 0) p.set('story', state.story);
  else if (state.sel) p.set('open', `${state.sel.type}:${state.sel.id}`);
  else p.set('view', state.view);
  writingHash = true;
  history.replaceState(null, '', `#${p.toString().replace(/%3A/gi, ':')}`);
  writingHash = false;
}

// ---------- View and mode ----------
async function setView(view, pose) {
  if (view !== state.view) {
    $('#fade').classList.add('on');
    await wait(450);
    state.view = view;
    const p = pose || (view === 'map' ? map.overview : site.POSES.overview);
    const from = p.pos.clone().sub(p.target).multiplyScalar(1.35).add(p.target);
    camera.position.copy(from);
    controls.target.copy(p.target);
    controls.update();
    document.querySelectorAll('#viewSeg button').forEach((b) => b.classList.toggle('on', b.dataset.view === view));
    renderLegend();
    $('#fade').classList.remove('on');
    writeHash();
    await fly(camera, controls, p.pos, p.target, 1.4);
  } else if (pose) {
    await fly(camera, controls, pose.pos, pose.target, 1.6);
  }
}

function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll('#modeSeg button').forEach((b) => b.classList.toggle('on', b.dataset.mode === mode));
  $('#splitLabels').classList.toggle('on', mode === 'split');
  document.body.classList.toggle('collapsed', mode === 'split');
  if (mode !== 'split') { map.applyMode(mode); site.applyMode(mode); }
  if (state.sel) renderDetail(state.sel.type, state.sel.id, false);
  writeHash();
}

// ---------- Render loop (split = scissored double render) ----------
let last = performance.now();
let clock = 0;
function frame() {
  const now = performance.now();
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  clock += dt;
  const fov = state.mode === 'split' ? 60 : 45;
  if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
  controls.update();
  const s = scenes[state.view];
  s.tick(clock, dt);
  const w = window.innerWidth, h = window.innerHeight;
  if (state.mode === 'split') {
    renderer.setScissorTest(true);
    camera.aspect = w / 2 / h;
    camera.updateProjectionMatrix();
    [['without', 0], ['with', 1]].forEach(([m, i]) => {
      s.applyMode(m);
      renderer.setViewport((i * w) / 2, 0, w / 2, h);
      renderer.setScissor((i * w) / 2, 0, w / 2, h);
      renderer.render(s.scene, camera);
    });
    renderer.setScissorTest(false);
  } else {
    if (camera.aspect !== w / h) { camera.aspect = w / h; camera.updateProjectionMatrix(); }
    renderer.setViewport(0, 0, w, h);
    renderer.render(s.scene, camera);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// ---------- Map picking and tooltip ----------
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const tip = $('#tooltip');
function pick(e) {
  if (state.view !== 'map') return null;
  const W = window.innerWidth, H = window.innerHeight;
  let x = e.clientX, aspect = W / H, width = W;
  if (state.mode === 'split') { width = W / 2; x = e.clientX % width; aspect = width / H; }
  ndc.set((x / width) * 2 - 1, -(e.clientY / H) * 2 + 1);
  const cam = camera.clone();
  cam.aspect = aspect;
  cam.updateProjectionMatrix();
  ray.setFromCamera(ndc, cam);
  const hit = ray.intersectObjects(map.pickables, false)[0];
  return hit ? hit.object.userData.placeId : null;
}
canvas.addEventListener('pointermove', (e) => {
  const id = pick(e);
  canvas.style.cursor = id ? 'pointer' : 'grab';
  if (id) {
    const p = byId(PLACES, id);
    tip.style.display = 'block';
    tip.style.left = `${e.clientX + 14}px`;
    tip.style.top = `${e.clientY + 10}px`;
    tip.innerHTML = `<b>${p.name}</b><br><span style="color:#93a4c3">${p.sub}</span>`;
  } else tip.style.display = 'none';
});
let down = null;
canvas.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
canvas.addEventListener('pointerup', (e) => {
  if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
  const id = pick(e);
  if (id) { stopPlay(); openPlace(id); }
});

// ---------- Rendering helpers ----------
const badge = (pub) => (pub ? '<span class="badge pub">PUBLIC</span>' : '<span class="badge mod">MODELED</span>');
const srcList = (ids) => {
  const ok = (ids || []).filter((k) => SOURCES[k]);
  return ok.length
    ? `<div class="srcs">${ok.map((k) => `<a href="${SOURCES[k].url}" target="_blank" rel="noopener">${SOURCES[k].title}</a>`).join('')}</div>`
    : '<div class="srcs">Modeled content, no external source.</div>';
};
const MSLOGO = '<span class="mslogo"><i style="background:#f25022"></i><i style="background:#7fba00"></i><i style="background:#00a4ef"></i><i style="background:#ffb900"></i></span>';
const initials = (n) => n.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const KIND_HEX = { hq: '#38bdf8', ops: '#f59e0b', dc: '#06b6d4', yard: '#facc15', project: '#a78bfa', event: '#f43f5e', wayside: '#22c55e' };
const KIND_LABEL = { hq: 'Headquarters', ops: 'Operations center', dc: 'Data center', yard: 'Yard / terminal', project: 'Strategic project', event: 'Resilience event', wayside: 'Wayside deep dive' };
const chip = (type, id, text) => `<span class="chip" data-open="${type}:${id}">${text}</span>`;

function renderList() {
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === state.tab));
  const on = (id) => (state.sel?.id === id ? 'on' : '');
  const row = (type, id, dot, color, title, sub) =>
    `<div class="item ${on(id)}" data-type="${type}" data-id="${id}"><div class="dot" style="background:${color}">${dot}</div><div><div class="t">${title}</div><div class="s">${sub}</div></div></div>`;
  let html = '';
  if (state.tab === 'personas') html = PERSONAS.map((p) => row('persona', p.id, initials(p.name), p.color, p.name + badge(p.public), p.role)).join('');
  else if (state.tab === 'tech') html = TECH.map((t) => row('tech', t.id, t.abbr, t.color, t.name, t.wayside)).join('');
  else if (state.tab === 'scenarios') html = SCENARIOS.map((s, i) => row('scenario', s.id, i + 1, '#e2e8f0', s.title, s.personas.map((p) => byId(PERSONAS, p).name.split(',')[0]).join(', '))).join('');
  else html = PLACES.map((p) => row('place', p.id, p.kind[0].toUpperCase(), KIND_HEX[p.kind], p.name + badge(!p.modeled), p.sub)).join('');
  $('#list').innerHTML = html;
}

function renderDetail(type, id, syncTab = true) {
  state.sel = { type, id };
  $('#detail').classList.remove('empty');
  let h = '';
  if (type === 'place') {
    const p = byId(PLACES, id);
    h = `<div class="sub">${KIND_LABEL[p.kind]}${badge(!p.modeled)}</div><h2>${p.name}</h2><div class="sub">${p.sub}</div><p>${p.body}</p>`;
    if (p.personas.length) h += `<h4>People here</h4><div class="chips">${p.personas.map((x) => chip('persona', x, byId(PERSONAS, x).name)).join('')}</div>`;
    const sc = SCENARIOS.filter((s) => s.place === id);
    if (sc.length) h += `<h4>Scenarios</h4><div class="chips">${sc.map((s) => chip('scenario', s.id, s.title)).join('')}</div>`;
    h += '<div class="cta"><button data-open="wayside:overview">Enter a wayside site</button></div>';
    h += `<h4>Sources</h4>${srcList(p.src)}`;
  } else if (type === 'persona') {
    const p = byId(PERSONAS, id);
    h = `<div class="sub">Persona${badge(p.public)}</div><h2>${p.name}</h2><div class="sub">${p.role}</div>
      <div class="quote"><div class="qLabel">Illustrative priority, not a quote</div>${p.priority}</div>
      ${p.public ? '<div class="srcs" style="margin-top:6px">Role is public; the priority line is our framing for discussion.</div>' : '<div class="srcs" style="margin-top:6px">Persona and priority are modeled for discussion.</div>'}
      <h4>What matters</h4><ul>${p.cares.map((c) => `<li>${c}</li>`).join('')}</ul>
      <h4>Their scenarios</h4><div class="chips">${p.scenarios.map((s) => chip('scenario', s, byId(SCENARIOS, s).title)).join('')}</div>
      <h4>Where</h4><div class="chips">${chip('place', p.place, byId(PLACES, p.place).name)}</div>
      <h4>Sources</h4>${srcList(p.src)}`;
    if (p.public && p.id === 'ciso') h += '<div class="srcs" style="margin-top:6px">Shown by role only; see Assumptions.</div>';
  } else if (type === 'tech') {
    const t = byId(TECH, id);
    h = `<div class="sub">Technology</div><h2 style="color:${t.color}">${t.name}</h2>
      <p><b>In the wayside:</b> ${t.wayside}</p>
      <h4>Verified facts</h4><ul>${t.facts.map((f) => `<li>${f}</li>`).join('')}</ul>
      <h4>${BRAND.siem} integration</h4><div class="ms"><div class="h">${MSLOGO} Sentinel touchpoint</div>${t.sentinel}</div>
      <h4>Scenarios</h4><div class="chips">${t.scenarios.map((s) => chip('scenario', s, byId(SCENARIOS, s).title)).join('')}</div>
      <h4>Sources</h4>${srcList(t.src)}`;
  } else if (type === 'scenario') {
    const s = byId(SCENARIOS, id);
    const m = state.mode;
    const siemTech = s.tech.map((x) => byId(TECH, x)).filter((t) => ['ise', 'cybervision', 'xdr', 'thousandeyes'].includes(t.id));
    h = `<div class="sub">Scenario ${SCENARIOS.indexOf(s) + 1} of ${SCENARIOS.length}<span class="badge ill">ILLUSTRATIVE</span></div><h2>${s.title}</h2>
      <p>${s.hook}</p>
      <div class="cols">
        <div class="col bad ${m === 'with' ? 'dim' : ''}"><h5>Without Cisco</h5><ol>${s.without.map((x) => `<li>${x}</li>`).join('')}</ol></div>
        <div class="col good ${m === 'without' ? 'dim' : ''}"><h5>With Cisco</h5><ol>${s.with.map((x) => `<li>${x}</li>`).join('')}</ol></div>
      </div>
      <h4>Outcome (modeled KPIs)</h4>
      <div class="kpis">
        <div class="kpi">Time to detect<b><span class="w">${s.kpi.without.mttd}</span> &rarr; <span class="c">${s.kpi.with.mttd}</span></b></div>
        <div class="kpi">Visibility<b><span class="w">${s.kpi.without.vis}</span> &rarr; <span class="c">${s.kpi.with.vis}</span></b></div>
        <div class="kpi">Field impact<b><span class="w">${s.kpi.without.roll}</span> &rarr; <span class="c">${s.kpi.with.roll}</span></b></div>
      </div>`;
    if (siemTech.length) h += `<h4>${BRAND.siem} touchpoints</h4><div class="ms"><div class="h">${MSLOGO} Where the SOC sees it</div><ul>${siemTech.map((t) => `<li><b>${t.short}:</b> ${t.sentinel}</li>`).join('')}</ul></div>`;
    h += `<h4>Personas</h4><div class="chips">${s.personas.map((p) => chip('persona', p, byId(PERSONAS, p).name)).join('')}</div>
      <h4>Cisco technology</h4><div class="chips">${s.tech.map((t) => chip('tech', t, byId(TECH, t).short)).join('')}</div>
      <div class="cta"><button data-mode-set="without">Show without Cisco</button><button data-mode-set="with">Show with Cisco</button><button data-mode-set="split">Split view</button></div>`;
    const src = [...(SCENARIO_EXTRA_SOURCES[s.id] || []), ...new Set(s.tech.flatMap((t) => byId(TECH, t).src))];
    h += `<h4>Sources</h4>${srcList([...new Set(src)])}`;
  }
  $('#detailInner').innerHTML = h;
  $('#detail').scrollTop = 0;
  if (syncTab) state.tab = { place: 'places', persona: 'personas', tech: 'tech', scenario: 'scenarios' }[type];
  renderList();
  writeHash();
}

function closeDetail() {
  $('#detail').classList.add('empty');
  state.sel = null;
  renderList();
}

// ---------- Openers ----------
async function openPlace(id) { renderDetail('place', id); map.select(id); await setView('map', map.placePose(id)); }
async function openPersona(id) { const p = byId(PERSONAS, id); renderDetail('persona', id); map.select(p.place); await setView('map', map.placePose(p.place)); }
async function openTech(id) {
  const t = byId(TECH, id);
  renderDetail('tech', id);
  if (state.mode === 'without') setMode('with');
  site.highlight(t.obj);
  await setView('wayside', site.POSES[t.obj] || site.POSES.control);
}
async function openScenario(id) {
  const s = byId(SCENARIOS, id);
  renderDetail('scenario', id);
  site.highlight(s.focus === 'overview' || s.focus === 'control' ? null : s.focus);
  await setView('wayside', site.POSES[s.focus] || site.POSES.overview);
}
function open(type, id) {
  document.body.classList.remove('navOpen');
  state.story = -1; // a manual pick leaves the story
  return { place: openPlace, persona: openPersona, tech: openTech, scenario: openScenario }[type]?.(id);
}

// ---------- Panels ----------
$('#tabs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { state.tab = b.dataset.tab; renderList(); } });
$('#list').addEventListener('click', (e) => { const it = e.target.closest('.item'); if (it) { stopPlay(); open(it.dataset.type, it.dataset.id); } });
$('#detail').addEventListener('click', (e) => {
  const o = e.target.closest('[data-open]');
  if (o) {
    stopPlay();
    const [type, id] = o.dataset.open.split(':');
    if (type === 'wayside') { state.story = -1; setView('wayside', site.POSES.overview); return; }
    open(type, id);
    return;
  }
  const m = e.target.closest('[data-mode-set]');
  if (m) setMode(m.dataset.modeSet);
});
$('#dClose').addEventListener('click', () => { closeDetail(); writeHash(); });
$('#viewSeg').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { stopPlay(); state.story = -1; site.highlight(null); setView(b.dataset.view); } });
$('#modeSeg').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) setMode(b.dataset.mode); });
$('#btnBrowse').addEventListener('click', () => document.body.classList.toggle('navOpen'));

function renderLegend() {
  const rows = state.view === 'map' ? LEGEND.map : LEGEND.wayside;
  const note = state.view === 'map' ? LEGEND.mapNote : LEGEND.waysideNote;
  $('#legend').innerHTML = rows.map(([k, c, t]) => `<div class="row"><span class="${k}" style="background:${c}"></span>${t}</div>`).join('') + `<div style="margin-top:6px">${note}</div>`;
}
renderLegend();

// ---------- Guided story ----------
const dots = $('#stDots');
dots.innerHTML = STORY.map((_, i) => `<i data-i="${i}"></i>`).join('');
dots.addEventListener('click', (e) => { const i = e.target.dataset.i; if (i != null) { stopPlay(); goStory(+i); } });

async function goStory(i) {
  i = Math.max(0, Math.min(STORY.length - 1, i));
  state.story = i;
  const st = STORY[i];
  $('#stNum').textContent = `${i + 1} / ${STORY.length}`;
  $('#stTitle').textContent = st.title;
  $('#stText').innerHTML = st.text + (st.src.length
    ? ` <span class="stSrc">Sources: ${st.src.map((k) => `<a href="${SOURCES[k].url}" target="_blank" rel="noopener">${SOURCES[k].title.split('(')[0].trim()}</a>`).join('; ')}</span>` : '');
  dots.querySelectorAll('i').forEach((d, k) => d.classList.toggle('on', k <= i));
  if (st.mode) setMode(st.mode);
  if (st.view === 'map') {
    site.highlight(null);
    if (st.place) { map.select(st.place); renderDetail('place', st.place); await setView('map', map.placePose(st.place)); }
    else { map.select(null); closeDetail(); writeHash(); await setView('map', map.overview); }
  } else {
    site.highlight(st.focus === 'overview' ? null : st.focus);
    if (st.open) { const [t, id] = st.open.split(':'); renderDetail(t, id); } else { closeDetail(); writeHash(); }
    await setView('wayside', site.POSES[st.focus] || site.POSES.overview);
  }
}

let timer = null;
function stopPlay() { state.playing = false; clearTimeout(timer); $('#stPlay').innerHTML = '&#9654;'; }
function startPlay() {
  state.playing = true;
  $('#stPlay').innerHTML = '&#10074;&#10074;';
  const next = async () => {
    if (!state.playing) return;
    if (state.story >= STORY.length - 1) { stopPlay(); return; }
    await goStory(state.story + 1);
    timer = setTimeout(next, 7500);
  };
  timer = setTimeout(next, 7500);
}
$('#stPrev').onclick = () => { stopPlay(); goStory(state.story - 1); };
$('#stNext').onclick = () => { stopPlay(); goStory(state.story + 1); };
$('#stPlay').onclick = () => (state.playing ? stopPlay() : startPlay());
$('#btnTour').onclick = () => { $('#intro').classList.add('gone'); goStory(0); startPlay(); };

// ---------- Modals ----------
function showModal(html) { $('#mBody').innerHTML = html; $('#modal').classList.remove('hidden'); }
const hideModal = () => $('#modal').classList.add('hidden');
$('#mClose').onclick = hideModal;
$('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') hideModal(); });
$('#btnSources').onclick = () => {
  const groups = {};
  Object.values(SOURCES).forEach((s) => (groups[s.group] ||= []).push(s));
  showModal(`<h2>Sources</h2><p style="color:#93a4c3;font-size:13px">Public sources used for facts in this app (researched ${BRAND.researched}). Items labeled MODELED or ILLUSTRATIVE are not sourced CSX facts.</p>`
    + Object.entries(groups).map(([g, list]) => `<h3>${g}</h3><ol>${list.map((s) => `<li>${s.title}<br><a href="${s.url}" target="_blank" rel="noopener">${s.url}</a></li>`).join('')}</ol>`).join(''));
};
$('#btnAssump').onclick = () => showModal(`<h2>Assumptions and labeling</h2><ol>${ASSUMPTIONS.map((a) => `<li>${a}</li>`).join('')}</ol>
  <h3>Legend</h3><p style="font-size:13px"><span class="badge pub">PUBLIC</span> sourced from public documents. <span class="badge mod">MODELED</span> composite persona, site or line geometry. <span class="badge ill">ILLUSTRATIVE</span> scenario narrative and KPIs for discussion.</p>`);

// ---------- Keyboard ----------
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { hideModal(); document.body.classList.remove('navOpen'); }
  if (e.key === 'ArrowRight') { stopPlay(); goStory(state.story + 1); }
  if (e.key === 'ArrowLeft') { stopPlay(); goStory(state.story - 1); }
  if (e.key.toLowerCase() === 'h') document.body.classList.toggle('collapsed');
});

// ---------- Intro ----------
$('#iTour').onclick = () => { $('#intro').classList.add('gone'); goStory(0); startPlay(); };
$('#iExplore').onclick = () => {
  $('#intro').classList.add('gone');
  fly(camera, controls, map.overview.pos, map.overview.target, 2);
  $('#stNum').textContent = '';
  $('#stTitle').textContent = 'Explore';
  $('#stText').textContent = 'Use the left panel to navigate by persona, technology, scenario or place. Toggle Without, With or Split view at the top. Press the arrows to step through the story.';
  writeHash();
};

renderList();

// ---------- Deep links ----------
function readHash() {
  if (writingHash) return;
  const p = new URLSearchParams(location.hash.slice(1));
  if (!p.toString()) return;
  $('#intro').classList.add('gone');
  if (!p.get('story')) state.story = -1;
  if (p.get('mode')) setMode(p.get('mode'));
  if (p.get('open')) { const [t, id] = p.get('open').split(':'); open(t, id); }
  else if (p.get('view')) {
    const v = p.get('view');
    setView(v, v === 'map' ? map.overview : site.POSES[p.get('focus') || 'overview']);
  } else if (p.get('story')) goStory(+p.get('story'));
}
readHash();
window.addEventListener('hashchange', readHash);
