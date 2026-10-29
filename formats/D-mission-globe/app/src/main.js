// MetLife x Cisco Cloud Control, AgenticOps 4D. Three entry modes on one globe:
//   tour     Executive Tour: 6 opening chapters, then every mission (briefing, signal, timeline A,
//            timeline B, outcome), then a finale. Fully narrated, auto-advances.
//   explore  Explore Missions: pick a mission, play overview > briefing > signal > DECISION (scored)
//            > your outcome > the other timeline > outcome.
//   academy  Account Team Academy: overview > briefing > signal > timelines > outcome > connections
//            (chain, talk track, discovery) > quiz.
import './style.css';
import { World } from './world.js';
import { Timeline, TimelineChart, laneOf } from './timeline.js';
import { Narrator, sentences } from './narrator.js';
import { Sound } from './audio.js';
import { Game } from './game.js';
import { Dock } from './dock.js';
import { Stage, SplunkPanel, PathPanel, CanvasPanel, AssistantPanel, StormPanel, XdrPanel, ImpactPanel, FacilityPanel, FabricPanel, GlobalPanel, FactsPanel, FrontierPanel, SilosPanel, ShellPanel, LoopPanel } from './panels.js';
import { SITES, SITE, LENSES, TOUR, FINALE, BADGES, MISSIONS, MISSION, FACILITIES, ZONES, VIEWS, TICKER, LANES, STR, money, esc, regionOf } from './content.js';

const $ = (s) => { const el = document.querySelector(s); if (!el) throw new Error(`Missing element ${s}`); return el; };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

const LEGEND = `<div class="legend">
  <div><span class="sw" style="--c:#3fb6ff"></span>MetLife location, healthy</div>
  <div><span class="sw" style="--c:#ffb020"></span>Weak signal detected by an agent</div>
  <div><span class="sw" style="--c:#ff3b4f"></span>Business impact and blast radius</div>
  <div><span class="sw" style="--c:#7cf29c"></span>Protected by AgenticOps</div>
  <div><span class="sw line" style="--c:#2fb4ff"></span>Data Fabric telemetry</div>
  <div><span class="sw ring" style="--c:#7fe7ff"></span>Cisco Cloud Control vantage layer</div></div>`;

function floorLine(m) { const z = ZONES[m.id]; return z ? `We drop inside to floor ${z.floor}, ${z.room.charAt(0).toLowerCase()}${z.room.slice(1)}.` : ''; }
function briefingText(m) { return [FACILITIES[m.siteId]?.intro ?? '', floorLine(m), m.narration.briefing].filter(Boolean).join(' '); }

class App {
  tl = new Timeline(); narrator = new Narrator(); stage = new Stage(); sound = new Sound(); game = new Game();
  mode = 'explore'; steps = []; stepIdx = 0; run = 0; paused = false; scenario = null; choice = null;
  loc = { siteId: null, level: 'globe' }; cues = []; cueNext = 0; ctx = null; prevState = null; prevBranch = null; logKey = '';
  lensFilter = null; resolvedToday = 1240 + Math.floor(Math.random() * 200); drillToken = 0;
  params = new URLSearchParams(location.search);

  constructor() {
    this.world = new World($('#stage'), $('#labels'));
    this.chart = new TimelineChart($('#tlCanvas'), this.tl);
    this.dock = new Dock(this.narrator);
    this.tooltip = document.createElement('div'); this.tooltip.className = 'site-tip hidden'; document.body.appendChild(this.tooltip);
    this.tl.onChange(() => this.applyWorld());
    this.tl.onView((v) => document.querySelectorAll('#branchToggle button').forEach((b) => b.classList.toggle('active', b.dataset.branch === v)));
    this.chart.onScrub = (t) => this.tl.scrub(t);
    this.chart.onEvent = (e) => this.openEvent(e);
    this.chart.onHover = (e, x, y) => this.eventTip(e, x, y);
    this.stage.project = (k) => (k === 'site' ? (this.world.view === 'local' ? this.world.project('zone') : this.scenario ? this.world.project(this.scenario.siteId) : { x: 0, y: 0, visible: false }) : this.world.project(k));
    this.narrator.onCaption = (t) => this.dock.caption(t);
    this.narrator.onSpeaking = (on) => this.sound.setDucked(on);
    this.narrator.onSentence = (i, n) => this.fireCues(n ? i / n : 1);
    this.narrator.onBlocked = () => this.toast('Your browser blocked audio. Click anywhere to turn the narration voice on.', 5000);
    this.dock.onPlayPause = () => this.togglePause();
    this.dock.onPrevSection = () => this.prev();
    this.dock.onNextSection = () => this.next();
    this.dock.onSkipEnd = () => this.next();
    this.dock.beforeSeek = () => { if (this.paused) { this.setPaused(false); this.tl.resume(); } };
    this.world.onSiteClick = (id) => this.siteClick(id);
    this.world.onSiteHover = (s) => {
      if (!s) return this.tooltip.classList.add('hidden');
      const m = MISSIONS.find((x) => x.siteId === s.id), f = FACILITIES[s.id];
      this.tooltip.innerHTML = `<b>${esc(s.city)}</b><span>${esc(s.name)}</span><em>${esc(f?.address ?? s.role)}</em>${m ? `<i>${m.code} | ${esc(m.title)}. Click to start.</i>` : f ? '<i>Click to walk into the building.</i>' : ''}`;
      this.tooltip.classList.remove('hidden');
    };
    this.world.facility.onFloorHover = (h) => {
      if (!h) return this.tooltip.classList.add('hidden');
      this.tooltip.innerHTML = `<b>${esc(h.building)}</b><span>Floor ${h.floor}</span><em>${esc(h.text)}</em>`; this.tooltip.classList.remove('hidden');
    };
    this.world.onFloorClick = (b, f) => this.floorClick(b, f);
    window.addEventListener('pointermove', (e) => (this.tooltip.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 12}px)`));
    this.game.onChange = () => this.renderHud();
    this.game.onBadge = (b) => { this.sound.cue('badge'); this.toast(`Badge unlocked: <b>${esc(b.name)}</b>. ${esc(b.desc)}`, 4200); };
    const unlock = () => { this.sound.init(); this.narrator.unblock(); };
    window.addEventListener('pointerdown', unlock); window.addEventListener('keydown', unlock);
    this.wireUi(); this.renderMissions(); this.renderHud(); this.buildTicker();
    this.world.start(); this.world.setLayer('all'); this.vantageLoop();
    setInterval(() => this.ctx && this.stage.update(this.ctx), 250);
    setInterval(() => { const n = this.narrator; if (n.active && !n.isPaused && n.total) this.fireCues((n.index + n.sentenceProgress) / n.total); }, 150);
    const recenter = () => { const r = this.stage.root.getBoundingClientRect(); if (r.width > 0) this.world.setCenter(r.left + r.width / 2, r.top + r.height / 2); };
    new ResizeObserver(recenter).observe(this.stage.root); window.addEventListener('resize', recenter);
    window.__app = this;
    const v = this.params.get('voice'); if (v === 'off') this.narrator.setEnabled(false); else if (v?.startsWith('studio:')) this.narrator.setVoice(v);
    const m = this.params.get('mode'); if (m && ['tour', 'explore', 'academy'].includes(m)) this.begin(m, this.params.get('mission') ?? undefined);
  }

  wireUi() {
    document.querySelectorAll('[data-start]').forEach((b) => b.addEventListener('click', () => this.begin(b.dataset.start)));
    document.querySelectorAll('#modeTabs button').forEach((b) => b.addEventListener('click', () => this.setMode(b.dataset.mode)));
    document.querySelectorAll('#branchToggle button').forEach((b) => b.addEventListener('click', () => { this.tl.setView(b.dataset.branch); if (this.scenario && b.dataset.branch === 'compare') this.game.compare(this.scenario.id); }));
    $('#playBtn').addEventListener('click', () => this.togglePause());
    $('#nextStep').addEventListener('click', () => this.next());
    $('#prevStep').addEventListener('click', () => this.prev());
    $('#overviewBtn').addEventListener('click', () => this.playOverview());
    $('#introReplay').addEventListener('click', () => this.startIntroOnly());
    $('#mpCollapse').addEventListener('click', () => document.body.classList.toggle('mp-collapsed'));
    $('#mlToggle').addEventListener('click', () => document.body.classList.toggle('ml-open'));
    const fold = (on) => { document.body.classList.toggle('tl-folded', on); try { localStorage.setItem('metlife-agenticops-tl', on ? 'folded' : 'open'); } catch {} };
    try { if (localStorage.getItem('metlife-agenticops-tl') === 'folded') document.body.classList.add('tl-folded'); } catch {}
    $('#tlFold').addEventListener('click', () => fold(true)); $('#tlShow').addEventListener('click', () => fold(false));
    $('#ambientBtn').addEventListener('click', () => { this.sound.init(); this.sound.setAmbient(!this.sound.ambientOn); $('#ambientBtn').textContent = `Ambient: ${this.sound.ambientOn ? 'On' : 'Off'}`; });
    $('#badgesBtn').addEventListener('click', () => this.showBadges());
    $('#modal').addEventListener('click', (e) => { if (e.target === $('#modal')) this.closeModal(); });
    window.addEventListener('keydown', (e) => {
      const tag = e.target.tagName; if (['SELECT', 'INPUT', 'TEXTAREA'].includes(tag)) return;
      if (e.code === 'Space') { e.preventDefault(); this.togglePause(); }
      else if (e.code === 'ArrowRight') e.shiftKey ? this.next() : this.dock.skip(1);
      else if (e.code === 'ArrowLeft') e.shiftKey ? this.prev() : this.dock.skip(-1);
      else if (e.code === 'PageDown') this.next();
      else if (e.code === 'PageUp') this.prev();
      else if (e.code === 'Escape') { this.closeModal(); $('#voicePop').classList.add('hidden'); }
    });
    const row = $('#lensRow');
    row.innerHTML = `<button class="chip active" data-lens="">All functions</button>${LENSES.map((l) => `<button class="chip" data-lens="${l.id}" style="--c:${l.color}">${esc(l.label)}</button>`).join('')}`;
    row.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      this.lensFilter = b.dataset.lens || null; row.querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === b)); this.renderMissions();
      MISSIONS.filter((m) => !this.lensFilter || m.lenses.includes(this.lensFilter)).forEach((m, i) => setTimeout(() => this.world.flash(m.siteId, '#7fe7ff'), i * 120));
    }));
  }

  begin(mode, mission) {
    this.sound.init(); $('#intro').classList.add('gone');
    ['#topbar', '#missionList', '#missionPanel', '#timeline', '#ticker', '#dock', '#crumbs'].forEach((s) => $(s).classList.remove('hidden'));
    document.body.classList.add('started'); this.setMode(mode, mission);
  }
  setMode(mode, mission) {
    this.mode = mode; document.querySelectorAll('#modeTabs button').forEach((b) => b.classList.toggle('active', b.dataset.mode === mode)); document.body.dataset.mode = mode;
    if (mode === 'tour') {
      this.steps = [...this.introSteps(), ...MISSIONS.flatMap((m) => this.missionSteps(m, 'tour')), this.finaleStep()];
      const i = mission ? this.steps.findIndex((s) => s.scenario?.id === mission) : 0; this.goto(Math.max(0, i));
    } else if (mission && MISSION[mission]) this.openMission(mission); else this.idleHome();
  }
  idleHome() {
    this.cancelRun(); this.scenario = null; this.ctx = null; this.stage.resetCtx(); this.stage.clear(); this.steps = []; this.dock.setSection('');
    document.body.classList.remove('directing'); this.world.resetSites(); this.world.clearFocus(); this.world.setLabelNote(null); this.world.setLayer('all');
    this.drill(null, 'globe').then(() => this.world.setIdleSpin(true));
    $('#timeline').classList.add('empty'); document.body.classList.add('no-mission');
    const academy = this.mode === 'academy';
    $('#mpKicker').textContent = academy ? 'Account Team Academy' : 'Explore'; $('#mpTitle').textContent = academy ? 'Learn the business connections' : 'Choose a mission';
    $('#mpSub').textContent = ''; $('#mpTags').innerHTML = ''; $('#mpSteps').innerHTML = ''; $('#mpLog').innerHTML = '';
    $('#mpBody').innerHTML = academy
      ? '<p class="lead">Each Academy mission traces one path: <b>IT signal</b>, then <b>domain</b>, then <b>Cisco capability</b>, then <b>business KPI</b>, then <b>executive outcome</b>. After the walkthrough you get the talk track, discovery questions and a short quiz.</p><p>Choose a mission on the left, or click any glowing MetLife location on the globe.</p>'
      : '<p class="lead">Ten real MetLife locations. Ten business moments. At each one, a weak signal shows up long before the business would feel it.</p><p>Choose a mission on the left, or click a location on the globe to walk into the building. Make the call at the decision point and protect as much business value as you can.</p><p class="muted">Tip: drag to orbit, scroll to zoom. Space pauses; the arrow keys skip sentences and Shift plus an arrow key skips sections.</p>';
    this.updateNav();
  }
  // Drill levels: globe > region > city > site (campus) > building > floor.
  async drill(siteId, level) {
    const tok = ++this.drillToken, s = siteId ? SITE[siteId] : null, fac = siteId ? FACILITIES[siteId] : undefined;
    if (!s) level = 'globe';
    if (['site', 'building', 'floor'].includes(level) && !fac) level = 'city';
    const zone = this.scenario && this.scenario.siteId === siteId ? ZONES[this.scenario.id] ?? null : null;
    if (level === 'floor' && !zone) level = 'building';
    if (level === 'site' && fac && fac.buildings.length < 2) level = 'building';
    this.loc = { siteId: s ? s.id : null, level }; this.renderCrumbs(); this.world.setIdleSpin(false);
    if (['site', 'building', 'floor'].includes(level)) {
      await this.world.enterFacility(fac, zone, level);
      if (tok === this.drillToken) this.world.setLocalState(this.ctx && zone ? this.ctx.state : 'idle');
    } else {
      if (this.world.view === 'local') await this.world.exitFacility(level === 'city' ? 2.2 : 3.2);
      if (tok !== this.drillToken) return;
      if (level === 'globe') await this.world.flyTo(22, -50, 3.7, 2.2);
      else if (level === 'region') await this.world.flyTo(s.lat - 6, s.lon, 3.25, 2.2);
      else await this.world.focusSite(s.id, 2.2, 2.2);
    }
  }
  renderCrumbs() {
    const { siteId, level } = this.loc, s = siteId ? SITE[siteId] : null, fac = siteId ? FACILITIES[siteId] : undefined, zone = this.scenario && this.scenario.siteId === siteId ? ZONES[this.scenario.id] : undefined;
    const items = [{ label: 'Globe', lv: 'globe' }];
    if (s) {
      items.push({ label: regionOf(s.lon), lv: 'region' }, { label: s.city, lv: 'city' });
      if (fac) {
        if (fac.buildings.length > 1) items.push({ label: fac.title, lv: 'site' });
        const b = zone ? fac.buildings.find((x) => x.id === zone.buildingId) : fac.buildings[0];
        items.push({ label: b?.label ?? fac.title, lv: 'building' });
        if (zone) items.push({ label: `Floor ${zone.floor}`, lv: 'floor', sub: zone.room });
      }
    }
    const order = ['globe', 'region', 'city', 'site', 'building', 'floor'], cur = order.indexOf(level);
    $('#crumbs').innerHTML = items.map((it) => `<button class="cr ${it.lv === level ? 'on' : order.indexOf(it.lv) < cur ? 'up' : 'down'}" data-lv="${it.lv}">${esc(it.label)}${it.sub && it.lv === level ? `<em>${esc(it.sub)}</em>` : ''}</button>`).join('<i>›</i>');
    $('#crumbs').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => void this.drill(siteId, b.dataset.lv)));
  }
  siteClick(id) {
    const m = MISSIONS.find((x) => x.siteId === id);
    if (m && (!this.scenario || this.scenario.id !== m.id)) return this.openMission(m.id);
    const fac = FACILITIES[id];
    if (fac) { this.drill(id, this.scenario?.siteId === id ? 'floor' : 'building'); const p = this.stage.show(new FacilityPanel(fac, this.scenario?.siteId === id ? ZONES[this.scenario.id] ?? null : null), 'ne', { anchor: 'building' }); p.onLevel = (lv) => void this.drill(lv === 'globe' ? null : id, lv); }
    else this.toast(`${esc(SITE[id].name)}: monitored by AgenticOps. No active mission here.`);
  }
  floorClick(bid, floor) {
    const fac = this.loc.siteId ? FACILITIES[this.loc.siteId] : undefined; if (!fac) return;
    const b = fac.buildings.find((x) => x.id === bid), zone = this.scenario && this.scenario.siteId === fac.siteId ? ZONES[this.scenario.id] : undefined;
    if (zone && zone.buildingId === bid && zone.floor === floor) { this.drill(fac.siteId, 'floor'); return; }
    const ml = b?.metlife?.some(([a, z]) => floor >= a && floor <= z);
    this.toast(`<b>${esc(b?.label ?? fac.title)}, floor ${floor}.</b> ${ml ? 'MetLife space, per public sources.' : 'Not identified as MetLife space in public sources.'}${zone ? ` This mission plays out on floor ${zone.floor}.` : ''}`, 3600);
  }
  show(panel, slot, anchor) { return this.stage.show(panel, slot, { anchor }); }
  facilityPanel(m, slot = 'ne') { const f = FACILITIES[m.siteId]; if (!f) return; const p = this.show(new FacilityPanel(f, ZONES[m.id] ?? null), slot, 'building'); p.onLevel = (lv) => void this.drill(lv === 'globe' ? null : m.siteId, lv); }
  globalPanel(m, slot) { const p = this.show(new GlobalPanel(m), slot); p.onPick = (id) => (FACILITIES[id] ? this.drill(id, m?.siteId === id ? 'floor' : 'building') : this.drill(id, 'city')); }
  canvas(m, slot = 'w') { const p = this.show(new CanvasPanel(VIEWS[m.id], m), slot, 'site'); p.onApprove = () => p.beat(5); p.onPick = (i) => this.decide(m, i); return p; }
  assistant(m, slot = 'sw') { const p = this.show(new AssistantPanel(VIEWS[m.id], m), slot); p.onCanvas = () => { if (!this.stage.has('canvas')) this.canvas(m, 'w').beat(1); }; return p; }
  signalPanel(m, slot) { const v = VIEWS[m.id]; return v.security ? this.show(new XdrPanel(v), slot, 'site') : this.show(new SplunkPanel(v), slot, 'site'); }
  openEvent(e) {
    const m = this.scenario; if (!m) return;
    const v = VIEWS[m.id], lane = laneOf(e.source);
    if (lane === 'te') this.show(new PathPanel(v), 'nw', 'site');
    else if (lane === 'splunk') this.show(new SplunkPanel(v), 'ne', 'site');
    else if (lane === 'cc') (this.stage.get('canvas') ?? this.canvas(m, 'w')).beat(e.t >= m.agentRemediate ? 6 : e.t >= m.agentDetect ? 4 : 1);
    else if (lane === 'xdr') this.signalPanel(m, 'ne');
    else if (e.branch === 'traditional') this.show(new StormPanel(v, m), 'nw', 'site');
    else this.show(new ImpactPanel(m), 'se');
    if (!this.tl.playing) this.tl.scrub(e.t);
    const L = LANES.find((l) => l.id === lane);
    this.toast(`<b style="color:${L.color}">${esc(e.source)}</b> ${esc(this.tl.format(e.t))}: ${esc(e.text)}`, 3600);
  }
  eventTip(e, x, y) {
    const tip = $('#evTip'); if (!e) return tip.classList.add('hidden');
    const L = LANES.find((l) => l.id === laneOf(e.source));
    tip.innerHTML = `<b style="color:${L.color}">${esc(e.source)}</b><span>${esc(this.tl.format(e.t))} · ${e.branch === 'agentic' ? 'AgenticOps' : 'Traditional'}</span><p>${esc(e.text)}</p><em>Click to open ${esc(L.label)}</em>`;
    tip.style.left = `${x}px`; tip.style.top = `${y}px`; tip.classList.remove('hidden');
  }

  // ---- Steps ---------------------------------------------------------------------------------
  introSteps() {
    const cues = [
      () => [[0, () => this.show(new FactsPanel(), 'ne')]],
      () => [[0, () => this.show(new FrontierPanel(), 'ne')]],
      () => [[0, () => this.show(new SilosPanel(), 'n')]],
      () => [[0.2, () => this.show(new FabricPanel(), 's')]],
      () => [[0, () => this.show(new ShellPanel(), 'n')], [0.5, () => this.show(new LoopPanel(), 's')]],
      () => [[0.3, () => this.globalPanel(null, 'ne')]],
    ];
    return TOUR.map((ch, i) => {
      const st = { id: `intro-${i}`, label: ch.short, title: ch.title, narration: ch.text, scenario: null, wait: 'auto',
        enter: async () => {
          this.scenario = null; this.ctx = null; this.stage.resetCtx(); this.stage.clear(); st.cues = cues[i]();
          $('#timeline').classList.add('empty'); this.world.resetSites(); this.world.clearFocus();
          if (this.world.view === 'local') await this.world.exitFacility(3.4);
          this.loc = { siteId: null, level: 'globe' }; this.renderCrumbs(); this.world.setLayer(ch.layer);
          if (ch.layer === 'agents') MISSIONS.forEach((m, k) => setTimeout(() => this.world.flash(m.siteId), k * 180));
          await this.world.flyTo(ch.cam.lat, ch.cam.lon, ch.cam.dist, 3.2);
        },
        render: () => `<p class="lead">${esc(ch.text)}</p>${i === TOUR.length - 1 ? LEGEND : ''}` };
      return st;
    });
  }
  finaleStep() {
    return { id: 'finale', label: 'Close', title: 'The vantage point, everywhere', narration: FINALE, scenario: null, wait: 'manual',
      cues: [[0, () => this.globalPanel(null, 'ne')], [0.4, () => this.show(new FabricPanel(), 's')]],
      enter: async () => {
        this.scenario = null; this.ctx = null; this.stage.resetCtx(); this.stage.clear(); $('#timeline').classList.add('empty'); this.world.clearFocus(); this.world.setLayer('all');
        MISSIONS.forEach((m) => this.world.setSiteState(m.siteId, 'protected')); await this.drill(null, 'globe'); await this.world.flyTo(28, -30, 4.6, 3); this.world.setIdleSpin(true);
      },
      render: () => { const total = MISSIONS.reduce((a, m) => a + m.exposure, 0); return `<p class="lead">${esc(FINALE)}</p>
        <div class="big-number"><span>${money(total)}</span><label>modeled business value protected across ${MISSIONS.length} missions</label></div>
        <table class="kpi"><thead><tr><th>Mission</th><th>Business outcome</th><th>Value (modeled)</th></tr></thead><tbody>
        ${MISSIONS.map((m) => `<tr><td>${m.code} ${esc(m.subtitle.split('|')[0])}</td><td>${esc(m.chain.outcome)}</td><td>${money(m.exposure)}</td></tr>`).join('')}</tbody></table>
        <div class="row-btns"><button class="btn" data-act="explore">Explore missions</button><button class="btn ghost" data-act="academy">Open Academy</button></div>`; },
      after: () => document.querySelectorAll('#mpBody [data-act]').forEach((b) => b.addEventListener('click', () => this.setMode(b.dataset.act))) };
  }
  tradCues(m) { const v = VIEWS[m.id]; return [[0, () => this.show(new StormPanel(v, m), 'nw', 'site')], [0.34, () => { this.drill(m.siteId, 'region'); this.globalPanel(m, 'ne'); }], [0.67, () => this.show(new ImpactPanel(m), 'se', m.siteId)]]; }
  agentCues(m, fromDecision = false) {
    let c = null; const cv = () => (c = c && this.stage.get('canvas') === c ? c : this.canvas(m, 'w'));
    return [[0, () => cv().beat(fromDecision ? 4 : 0)], [0.14, () => cv().beat(1)], [0.28, () => { cv().beat(2); this.signalPanel(m, 'ne'); }], [0.46, () => cv().beat(3)], [0.62, () => { cv().beat(4); this.show(new PathPanel(VIEWS[m.id]), 'se', 'site'); }], [0.78, () => cv().beat(5)]];
  }
  missionSteps(m, mode) {
    const n = m.narration, v = VIEWS[m.id], fac = FACILITIES[m.siteId], out = [], dur = (t, min = 7) => Math.max(min, this.narrator.estimate(t) * 0.92);
    if (mode !== 'tour') out.push({ id: 'overview', label: 'Overview', title: 'Audio overview', narration: n.overview, scenario: m, wait: 'auto',
      cues: [[0, () => this.facilityPanel(m, 'ne')], [0.3, () => this.globalPanel(m, 'nw')], [0.6, () => this.show(new FabricPanel(m), 's')]],
      enter: async () => { this.stage.clear(); this.tl.setView('compare'); this.tl.scrub(m.range[0]); this.world.resetSites(); this.world.setLayer('all'); await this.drill(m.siteId, 'city'); },
      render: () => `<p class="lead">${esc(n.overview)}</p>${this.chainHtml(m)}` });
    const brief = briefingText(m), bn = sentences(brief).length || 1, introN = fac ? sentences(fac.intro).length : 0;
    out.push({ id: 'briefing', label: 'Briefing', title: 'Mission briefing', narration: brief, scenario: m, wait: 'auto',
      cues: [[0, () => this.facilityPanel(m, 'ne')], [introN / bn, () => void this.drill(m.siteId, 'floor')], [(introN + 1) / bn, () => this.show(new FabricPanel(m), 'sw')], [Math.min(0.95, (introN + 2) / bn), () => this.show(new ImpactPanel(m), 'nw', 'site')]],
      enter: async () => { this.stage.clear(['facility']); this.tl.setView('compare'); this.tl.scrub(m.range[0]); this.world.resetSites(); this.world.setLayer('all'); await this.drill(m.siteId, fac && fac.buildings.length > 1 ? 'site' : 'building'); },
      render: () => `<p class="lead">${esc(n.briefing)}</p>
        ${fac ? `<div class="card"><h4>Where it happens</h4><p><b>${esc(fac.title)}</b>, ${esc(fac.address)}</p>${ZONES[m.id] ? `<p class="muted">Floor ${ZONES[m.id].floor}: ${esc(ZONES[m.id].room)}. ${esc(ZONES[m.id].basis)}</p>` : ''}</div>` : ''}
        <div class="card"><h4>Known industry challenge</h4><p>${esc(m.industryChallenge)}</p></div>
        <div class="card"><h4>New Frontier priority at stake</h4><p class="pillar">${esc(m.pillar)}</p></div>
        <div class="card"><h4>Data Fabric sources joined</h4><ul class="src">${m.signals.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>` });
    out.push({ id: 'signal', label: 'Signal', title: 'The weak signal', narration: n.signal, scenario: m, wait: 'auto',
      cues: v.security
        ? [[0, () => this.show(new XdrPanel(v), 'nw', 'site')], [0.25, () => this.show(new SplunkPanel(v), 'ne', 'site')], [0.5, () => this.assistant(m, 'sw').beat(0)], [0.8, () => this.stage.beat('assistant', 1)]]
        : [[0, () => this.show(new PathPanel(v), 'nw', 'site')], [0.25, () => this.show(new SplunkPanel(v), 'ne', 'site')], [0.5, () => this.assistant(m, 'sw').beat(0)], [0.8, () => this.stage.beat('assistant', 1)]],
      enter: async (run) => {
        this.stage.clear(); this.tl.setView('agentic'); this.tl.scrub(m.range[0]); this.drill(m.siteId, 'floor');
        await this.tl.playTo(m.agentDetect + (m.agentRemediate - m.agentDetect) * 0.3, dur(n.signal, 6) * 0.7);
        if (run === this.run && this.world.view === 'globe') this.world.scan(m.siteId);
      },
      render: () => `<p class="lead">${esc(n.signal)}</p><div class="callout"><span>Agent lead time before business impact</span><b>${esc(this.tl.scenario === m ? this.tl.formatLead() : `${m.impact - m.agentDetect}${m.unit}`)}</b></div><div class="card"><h4>Metric that matters</h4><p>${esc(m.metricName)}</p></div>` });
    if (mode === 'explore') {
      out.push({ id: 'decision', label: 'Decision', title: 'Make the call', narration: m.decision.prompt, scenario: m, wait: 'manual',
        cues: [[0, () => { const c = this.canvas(m, 'w'); c.beat(4); c.setDecision(m.decision.options, null); }], [0.3, () => this.signalPanel(m, 'ne')]],
        enter: async () => { this.choice = null; this.tl.stop(); this.stage.clear(); await this.drill(m.siteId, 'floor'); },
        render: () => `<p class="lead">${esc(m.decision.prompt)}</p><div class="options">${m.decision.options.map((o, i) => `<button class="option" data-opt="${i}"><b>${esc(o.label)}</b><span>${esc(o.detail)}</span></button>`).join('')}</div><div class="feedback" id="feedback"></div>`,
        after: () => { document.querySelectorAll('#mpBody [data-opt]').forEach((b) => b.addEventListener('click', () => this.decide(m, Number(b.dataset.opt)))); this.updateNav(); } });
      const branchStep = (mine) => {
        const which = () => (mine === ((this.choice?.quality ?? 'best') === 'best') ? 'agentic' : 'traditional');
        const st = { id: mine ? 'consequence' : 'counterfactual', label: mine ? 'Your outcome' : 'Other timeline', title: mine ? 'Your outcome' : 'The other timeline', narration: '', scenario: m, wait: 'auto',
          enter: async () => {
            const b = which(); st.title = b === 'agentic' ? 'The AgenticOps timeline' : 'The traditional IT timeline';
            st.narration = (mine ? `${this.choice?.feedback ?? ''} ` : `${STR.otherTimeline} `) + (b === 'agentic' ? n.agentic : n.traditional);
            st.cues = b === 'agentic' ? this.agentCues(m, mine) : this.tradCues(m); this.stage.clear();
            if (b === 'agentic') this.drill(m.siteId, 'floor');
            await this.playBranch(m, b, dur(st.narration, 9)); if (!mine) this.game.compare(m.id);
          },
          render: () => (st.narration ? `<p class="lead">${esc(st.narration)}</p>${this.branchSummary(m, which())}` : '') };
        return st;
      };
      out.push(branchStep(true), branchStep(false));
    } else {
      out.push({ id: 'traditional', label: 'Traditional', title: 'Timeline A: traditional IT', narration: n.traditional, scenario: m, wait: 'auto', cues: this.tradCues(m),
        enter: async () => { this.stage.clear(); await this.playBranch(m, 'traditional', dur(n.traditional, 9)); }, render: () => `<p class="lead">${esc(n.traditional)}</p>${this.branchSummary(m, 'traditional')}` });
      out.push({ id: 'agentic', label: 'AgenticOps', title: 'Timeline B: AgenticOps', narration: n.agentic, scenario: m, wait: 'auto', cues: this.agentCues(m),
        enter: async () => { this.stage.clear(); this.drill(m.siteId, 'floor'); await this.playBranch(m, 'agentic', dur(n.agentic, 9)); }, render: () => `<p class="lead">${esc(n.agentic)}</p>${this.branchSummary(m, 'agentic')}` });
    }
    out.push({ id: 'outcome', label: 'Outcome', title: 'Business outcome', narration: n.outcome, scenario: m, wait: mode === 'explore' ? 'manual' : 'auto',
      cues: [[0, () => this.show(new ImpactPanel(m), 'ne', m.siteId)], [0.3, () => this.globalPanel(m, 'nw')], [0.6, () => this.show(new FabricPanel(m), 's')]],
      enter: async () => {
        this.stage.clear(); this.tl.setView('compare'); this.tl.scrub(m.range[1]);
        const q = mode === 'explore' ? this.choice?.quality ?? 'poor' : 'best', r = this.game.complete(m, q);
        this.floatXp(r.xp, r.value); this.renderMissions(); await this.drill(m.siteId, 'region');
        this.world.setSiteState(m.siteId, 'protected'); this.world.setIncident(m.siteId, 'protected', 0.16); this.world.setBlast(null, []); this.world.shockwave(m.siteId);
      },
      render: () => this.outcomeHtml(m, mode),
      after: () => document.querySelectorAll('#mpBody [data-act]').forEach((b) => b.addEventListener('click', () => { const a = b.dataset.act; if (a === 'replay') this.openMission(m.id); else if (a === 'next') this.openMission(this.nextMissionId(m.id)); else if (a === 'home') this.idleHome(); })) });
    if (mode === 'academy') {
      out.push({ id: 'connect', label: 'Connections', title: 'Connect IT to the business', narration: `${STR.talkIntro} ${m.talkTrack.join(' ')}`, scenario: m, wait: 'manual',
        cues: [[0, () => this.show(new FabricPanel(m), 's')], [0.5, () => this.show(new ImpactPanel(m), 'ne')]],
        enter: async () => { this.stage.clear(); this.tl.setView('compare'); this.tl.scrub(m.range[1]); },
        render: () => `${this.chainHtml(m, true)}<div class="card"><h4>Talk track</h4><ol>${m.talkTrack.map((t) => `<li>${esc(t)}</li>`).join('')}</ol></div>
          <div class="card"><h4>Discovery questions to ask</h4><ul class="q">${m.discovery.map((d) => `<li>${esc(d)}</li>`).join('')}</ul></div>
          <div class="card"><h4>Cisco and Splunk capabilities in play</h4><div class="chips">${m.products.map((p) => `<span class="pchip">${esc(p)}</span>`).join('')}</div></div>` });
      out.push({ id: 'quiz', label: 'Quiz', title: 'Check your understanding', narration: STR.quizIntro, scenario: m, wait: 'manual',
        enter: async () => { this.stage.clear(); this.tl.setView('compare'); this.tl.scrub(m.range[1]); },
        render: () => `<div class="quiz">${m.quiz.map((q, i) => `<div class="qz" data-q="${i}"><p><b>Q${i + 1}.</b> ${esc(q.q)}</p>${q.options.map((o, j) => `<button class="qopt" data-q="${i}" data-o="${j}">${esc(o)}</button>`).join('')}<div class="why"></div></div>`).join('')}</div><div class="quiz-score" id="quizScore"></div>
          <div class="row-btns"><button class="btn" data-act="next">Next mission</button><button class="btn ghost" data-act="home">All missions</button></div>`,
        after: () => this.wireQuiz(m) });
    }
    return out;
  }
  nextMissionId(id) { return MISSIONS[(MISSIONS.findIndex((m) => m.id === id) + 1) % MISSIONS.length].id; }
  async playBranch(m, branch, d) {
    this.tl.setView(branch); this.world.resetSites();
    this.tl.scrub(branch === 'traditional' ? m.range[0] + (m.agentDetect - m.range[0]) * 0.4 : m.range[0] + (m.agentDetect - m.range[0]) * 0.6);
    if (this.world.view === 'globe') this.world.focusSite(m.siteId, branch === 'traditional' ? 3.1 : 2.35, 2.2);
    const legs = branch === 'agentic' ? [[m.agentRemediate, 0.66], [m.range[1], 0.34]] : [[m.impact, 0.3], [m.tradRecover, 0.55], [m.range[1], 0.15]], run = this.run;
    for (const [t, k] of legs) { if (run !== this.run) return; if (t > this.tl.t) await this.tl.playTo(t, d * k); }
  }
  openMission(id) {
    const m = MISSION[id]; if (!m) return;
    if (this.mode === 'tour') { const i = this.steps.findIndex((s) => s.scenario?.id === id); if (i >= 0) return void this.goto(i); }
    this.steps = this.missionSteps(m, this.mode); this.goto(0);
    document.body.classList.remove('ml-open');
  }
  cancelRun() { this.run++; this.narrator.cancel(); this.tl.stop(); this.setPaused(false); }
  fireCues(p) { while (this.cueNext < this.cues.length && this.cues[this.cueNext][0] <= p + 1e-6) { const fn = this.cues[this.cueNext++][1]; try { fn(); } catch (e) { console.warn(e); } } }
  async goto(i) {
    if (i < 0 || i >= this.steps.length) return;
    this.cancelRun(); const run = this.run; this.stepIdx = i; const st = this.steps[i];
    this.world.setIdleSpin(false); document.body.classList.add('directing');
    if (st.scenario && st.scenario !== this.scenario) this.loadScenario(st.scenario);
    if (!st.scenario) this.renderIntroHeader(st.id === 'finale');
    this.refreshPanel(st);
    const entering = st.enter(run);
    this.refreshPanel(st);
    this.cues = [...(st.cues ?? [])].sort((a, b) => a[0] - b[0]); this.cueNext = 0;
    this.dock.setSection(st.scenario ? `${st.scenario.code} · ${st.title}` : st.title);
    const speaking = this.narrator.speak(st.narration);
    if (!st.narration) this.fireCues(1);
    await Promise.all([entering, speaking]);
    if (run !== this.run) return;
    this.fireCues(1); this.updateNav(true);
    if (st.wait === 'auto') { await wait(1400); while (this.paused && run === this.run) await wait(200); if (run === this.run) this.next(); }
  }
  refreshPanel(st) { document.body.dataset.step = st.id; $('#mpBody').innerHTML = `<h3 class="step-title">${esc(st.title)}</h3>${st.render()}`; $('#mpBody').scrollTop = 0; st.after?.(); this.renderStepDots(); this.updateNav(); }
  next() {
    const st = this.steps[this.stepIdx]; if (!st) return;
    if (st.id === 'decision' && !this.choice) return this.toast('Make the call first. Pick one of the options on the AI Canvas.');
    if (this.stepIdx + 1 < this.steps.length) this.goto(this.stepIdx + 1);
    else if (this.mode === 'tour') this.setMode('explore');
    else if (this.scenario) this.openMission(this.nextMissionId(this.scenario.id));
  }
  prev() { if (this.stepIdx > 0) this.goto(this.stepIdx - 1); }
  togglePause() { if (!this.steps.length) return; this.setPaused(!this.paused); if (this.paused) { this.narrator.pause(); this.tl.pause(); } else { this.narrator.resume(); this.tl.resume(); } }
  setPaused(p) { this.paused = p; $('#playBtn').textContent = p ? 'Resume' : 'Pause'; document.body.classList.toggle('paused', p); this.dock.setPaused(p); }
  playOverview() {
    const m = this.scenario; if (!m) return this.toast('Choose a mission to hear its audio overview.');
    if (this.mode !== 'tour') { const i = this.steps.findIndex((s) => s.id === 'overview'); if (i >= 0) return void this.goto(i); }
    const back = this.stepIdx; this.cancelRun(); const run = this.run;
    $('#mpBody').innerHTML = `<h3 class="step-title">Audio overview</h3><p class="lead">${esc(m.narration.overview)}</p>${this.chainHtml(m)}`;
    this.dock.setSection(`${m.code} · Audio overview`);
    this.narrator.speak(m.narration.overview).then((ok) => { if (ok && run === this.run) this.goto(back); });
  }
  startIntroOnly() {
    if (this.mode !== 'tour') {
      this.steps = [...this.introSteps()]; const last = this.steps[this.steps.length - 1]; last.wait = 'manual';
      last.render = () => `<p class="lead">${esc(TOUR[TOUR.length - 1].text)}</p>${LEGEND}<div class="row-btns"><button class="btn" data-act="home">Choose a mission</button></div>`;
      last.after = () => document.querySelector('#mpBody [data-act="home"]')?.addEventListener('click', () => this.idleHome());
    }
    this.goto(0);
  }
  decide(m, i) {
    if (this.choice) return; const o = m.decision.options[i]; if (!o) return;
    this.choice = o;
    document.querySelectorAll('#mpBody .option').forEach((b) => b.classList.add('locked'));
    document.querySelector(`#mpBody [data-opt="${i}"]`)?.classList.add(o.quality);
    document.querySelector(`#mpBody [data-opt="${m.decision.options.findIndex((x) => x.quality === 'best')}"]`)?.classList.add('best-mark');
    const fb = document.querySelector('#feedback');
    if (fb) { fb.className = `feedback ${o.quality}`; fb.innerHTML = `<b>${o.quality === 'best' ? 'Great call.' : o.quality === 'partial' ? 'Partial save.' : 'Business impact ahead.'}</b> ${esc(o.feedback)}`; }
    this.stage.get('canvas')?.setDecision(m.decision.options, i);
    this.sound.cue(o.quality === 'best' ? 'good' : o.quality === 'partial' ? 'warn' : 'crit');
    this.narrator.cancel(); this.updateNav(true);
    const run = this.run; setTimeout(() => { if (run === this.run) this.next(); }, 2600);
  }
  wireQuiz(m) {
    const answered = new Map();
    document.querySelectorAll('#mpBody .qopt').forEach((b) => b.addEventListener('click', () => {
      const qi = Number(b.dataset.q); if (answered.has(qi)) return;
      const oi = Number(b.dataset.o), q = m.quiz[qi], ok = oi === q.answer; answered.set(qi, ok);
      const box = b.closest('.qz');
      box.querySelectorAll('.qopt').forEach((x, j) => { x.classList.add('locked'); if (j === q.answer) x.classList.add('right'); });
      if (!ok) b.classList.add('wrong');
      box.querySelector('.why').innerHTML = `${ok ? 'Correct.' : 'Not quite.'} ${esc(q.why)}`; this.sound.cue(ok ? 'good' : 'warn');
      if (answered.size === m.quiz.length) { const right = [...answered.values()].filter(Boolean).length; this.game.quiz(m.id, right, m.quiz.length); $('#quizScore').innerHTML = `Score: <b>${right}/${m.quiz.length}</b>. +${right * 30} XP`; this.renderMissions(); }
    }));
    document.querySelectorAll('#mpBody [data-act]').forEach((b) => b.addEventListener('click', () => (b.dataset.act === 'next' ? this.openMission(this.nextMissionId(m.id)) : this.idleHome())));
  }
  loadScenario(m) {
    document.body.classList.remove('no-mission'); this.scenario = m; this.choice = null; this.prevState = null; this.prevBranch = null; this.logKey = '';
    this.stage.resetCtx(); $('#mpLog').innerHTML = ''; $('#timeline').classList.remove('empty'); this.tl.load(m);
    const s = SITE[m.siteId];
    $('#mpKicker').textContent = `${m.code} | ${s.city}, ${s.country}`; $('#mpTitle').textContent = m.title; $('#mpSub').textContent = m.subtitle;
    $('#mpTags').innerHTML = m.lenses.map((id) => { const l = LENSES.find((x) => x.id === id); return `<span class="tag" style="--c:${l.color}">${esc(l.label)}</span>`; }).join('');
    $('#tlMetric').innerHTML = ''; this.renderMissions();
  }
  renderIntroHeader(finale = false) {
    document.body.classList.add('no-mission'); this.world.setLabelNote(null);
    $('#mpKicker').textContent = finale ? 'Close | Ten missions, one pattern' : 'Opening | The change in network operations';
    $('#mpTitle').textContent = finale ? 'Business outcomes, everywhere' : 'From IT signals to business outcomes';
    $('#mpSub').textContent = 'Cisco Cloud Control, AgenticOps and the Cisco Data Fabric'; $('#mpTags').innerHTML = ''; $('#mpLog').innerHTML = '';
  }
  // Timeline clock -> globe state, building state, panels, live log, chart.
  applyWorld() {
    const m = this.scenario; if (!m || this.tl.scenario !== m) return;
    const t = this.tl.t, view = this.tl.view, branch = view === 'compare' ? 'agentic' : view, st = this.tl.siteState(branch, t);
    if (branch !== this.prevBranch) { this.prevState = null; this.world.setBlast(null, []); m.blast.forEach((b) => this.world.setSiteState(b, 'idle')); this.world.setBeam(null); this.world.releaseAgent(); this.world.setIncident(null); }
    if (st !== this.prevState) {
      this.world.setSiteState(m.siteId, st);
      if (this.world.view === 'local' && this.loc.siteId === m.siteId) this.world.setLocalState(st);
      const live = this.prevState !== null;
      switch (st) {
        case 'idle': this.world.setIncident(null); this.world.setBlast(null, []); this.world.setBeam(null); m.blast.forEach((b) => this.world.setSiteState(b, 'idle')); break;
        case 'signal': this.world.setIncident(m.siteId, 'warning', 0.08); break;
        case 'critical': this.world.setIncident(m.siteId, 'critical', 0.34); this.world.setBlast(m.siteId, m.blast); m.blast.forEach((b) => this.world.setSiteState(b, 'critical')); if (live) this.sound.cue('crit'); break;
        case 'recovering': this.world.setIncident(m.siteId, 'warning', 0.2); this.world.setBlast(null, []); m.blast.forEach((b) => this.world.setSiteState(b, 'recovering')); break;
        case 'warning': this.world.setIncident(m.siteId, 'warning', 0.14); this.world.setBeam(m.siteId); if (live) { if (this.world.view === 'globe') this.world.scan(m.siteId); this.sound.cue('warn'); } break;
        case 'protected': this.world.setBeam(null); this.world.releaseAgent(); this.world.setIncident(m.siteId, 'protected', 0.16); m.blast.forEach((b) => this.world.setSiteState(b, 'idle')); if (live) { this.world.shockwave(m.siteId); this.sound.cue('good'); } break;
      }
      this.prevState = st;
    }
    this.prevBranch = branch;
    const note = { idle: t < m.impact ? 'Normal operations' : 'Recovered', signal: 'Unseen weak signal', warning: 'Agent acting', critical: 'Business impact', recovering: 'Recovering', protected: 'Protected' };
    this.world.setLabelNote(m.siteId, `${this.tl.format(t)} | ${note[st]}`);
    this.world.setSun(SITE[m.siteId].lon + 30 - (m.unit === 'h' ? t : t / 60) * 15);
    $('#tlClock').textContent = this.tl.format(t);
    const tv = this.tl.metric('traditional', t), av = this.tl.metric('agentic', t), showT = view !== 'agentic', showA = view !== 'traditional';
    $('#tlMetric').innerHTML = `<span class="m-name">${esc(m.metricName)}</span>${showT ? `<span class="m-val trad">Traditional ${tv.toFixed(0)}</span>` : ''}${showA ? `<span class="m-val agent">AgenticOps ${av.toFixed(0)}</span>` : ''}${showT && t > m.impact ? `<span class="m-val exp">Exposure ${money(this.tl.exposureAt(t))} (modeled)</span>` : ''}`;
    const harm = (b, x) => clamp((100 - this.tl.metric(b, x)) / 60), h = harm(branch, t), ahead = Math.max(m.unit === 'h' ? 0.5 : 30, (m.impact - m.agentDetect) * 0.6);
    const hPred = branch === 'agentic' && st === 'warning' ? Math.max(h, harm('traditional', t + ahead)) : h;
    this.ctx = { t, view, branch, state: st, h, hPred, s: m, v: VIEWS[m.id], tl: this.tl };
    this.stage.update(this.ctx);
    this.renderLog(branch === 'agentic' && view === 'compare' ? this.tl.events('agentic', t) : this.tl.events(branch, t), branch);
    this.chart.draw();
  }
  renderLog(evts, branch) {
    const key = `${branch}:${evts.length}`; if (key === this.logKey) return;
    const [pb, pn] = this.logKey.split(':'); this.logKey = key; const grew = pb === branch && Number(pn) < evts.length;
    $('#mpLog').innerHTML = evts.slice().reverse().map((e, i) => { const L = LANES.find((l) => l.id === laneOf(e.source)); return `<div class="log-row ${e.sev} ${grew && i === 0 ? 'new' : ''}"><span class="lt">${this.tl.format(e.t)}</span><span class="ls" style="--lc:${L.color}">${esc(e.source)}</span><span class="lx">${esc(e.text)}</span></div>`; }).join('');
    if (grew && evts.length && evts[evts.length - 1].sev === 'info') this.sound.cue('info');
  }
  renderStepDots() {
    const sc = this.steps[this.stepIdx]?.scenario ?? null, list = this.steps.map((x, i) => ({ x, i })).filter(({ x }) => x.scenario === sc);
    $('#mpSteps').innerHTML = list.map(({ x, i }) => `<button class="sdot ${i === this.stepIdx ? 'on' : i < this.stepIdx ? 'done' : ''}" data-i="${i}" title="${esc(x.title)}">${esc(x.label)}</button>`).join('');
    $('#mpSteps').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => void this.goto(Number(b.dataset.i))));
  }
  updateNav(settled = false) {
    const st = this.steps[this.stepIdx], nx = $('#nextStep'), pv = $('#prevStep');
    pv.disabled = !st || this.stepIdx === 0; nx.disabled = !st || (st.id === 'decision' && !this.choice);
    nx.classList.toggle('pulse', settled && !!st && st.wait === 'manual');
    nx.textContent = st && this.stepIdx === this.steps.length - 1 ? (this.mode === 'tour' ? 'Done' : 'Next mission') : 'Next';
  }
  renderMissions() {
    const done = this.game.s.missions, list = MISSIONS.filter((m) => !this.lensFilter || m.lenses.includes(this.lensFilter));
    $('#missions').innerHTML = list.map((m) => {
      const r = done[m.id], qz = this.game.s.quizzes[m.id], status = r ? (r.quality === 'best' ? 'Protected' : r.quality === 'partial' ? 'Partial' : 'Impacted') : 'Not started';
      return `<button class="mission ${this.scenario?.id === m.id ? 'active' : ''} ${r ? r.quality : ''}" data-id="${m.id}" title="${esc(m.title)}">
        <span class="m-code">${m.code}</span>
        <span class="m-main"><b>${esc(m.title)}</b><span>${esc(m.subtitle)}</span><span class="m-lens">${m.lenses.map((id) => `<i style="--c:${LENSES.find((l) => l.id === id).color}" title="${id}"></i>`).join('')}</span></span>
        <span class="m-status"><em>${status}</em><small>${r ? money(r.value) : `${money(m.exposure)} at stake`}</small>${qz === undefined ? '' : `<small>Quiz ${qz}%</small>`}</span></button>`;
    }).join('');
    $('#missions').querySelectorAll('.mission').forEach((b) => b.addEventListener('click', () => this.openMission(b.dataset.id)));
  }
  renderHud() {
    $('#scoreValue').textContent = money(this.game.s.value);
    const r = this.game.rank(); $('#rankName').textContent = r.name; $('#xpFill').style.width = `${Math.round(r.progress * 100)}%`;
    $('#xpText').textContent = `${this.game.s.xp} XP${r.next ? ` / ${r.next}` : ''}`; $('#badgeCount').textContent = String(this.game.s.badges.length);
  }
  chainHtml(m, big = false) {
    const c = m.chain, links = [['IT signal', c.signal], ['Domains', c.domain], ['Cisco capability', c.capability], ['Business KPI', c.kpi], ['Executive outcome', c.outcome]];
    return `<div class="chain ${big ? 'big' : ''}">${links.map(([k, v], i) => `<div class="link" style="--i:${i}"><label>${k}</label><span>${esc(v)}</span></div>`).join('<div class="arrow"></div>')}</div>`;
  }
  branchSummary(m, b) {
    const ev = m.events.filter((e) => e.branch === b);
    return `<div class="card ${b}"><h4>${b === 'agentic' ? 'What the agents did' : 'What happened'}</h4><ul class="tl-list">${ev.map((e) => `<li class="${e.sev}"><span>${this.tl.format(e.t)}</span>${esc(e.text)}</li>`).join('')}</ul></div>`;
  }
  outcomeHtml(m, mode) {
    const r = this.game.s.missions[m.id], q = mode === 'explore' ? this.choice?.quality ?? r?.quality ?? 'poor' : 'best', v = q === 'best' ? m.exposure : q === 'partial' ? m.exposure * 0.4 : 0;
    return `<p class="lead">${esc(m.narration.outcome)}</p>
      <div class="big-number ${q}"><span>${money(v)}</span><label>${q === 'best' ? 'modeled business value protected' : q === 'partial' ? `protected out of ${money(m.exposure)} at stake (modeled)` : `protected. ${money(m.exposure)} of modeled exposure realized`}</label></div>
      <p class="basis">${esc(m.exposureBasis)}</p>
      <table class="kpi"><thead><tr><th>Business KPI</th><th>Traditional IT</th><th>AgenticOps</th></tr></thead><tbody>${m.kpis.map((k) => `<tr><td>${esc(k.label)}</td><td class="trad">${esc(k.traditional)}</td><td class="agent">${esc(k.agentic)}</td></tr>`).join('')}</tbody></table>
      ${this.chainHtml(m)}
      <div class="card"><h4>Capabilities in play</h4><div class="chips">${m.products.map((p) => `<span class="pchip">${esc(p)}</span>`).join('')}</div></div>
      ${mode === 'explore' ? `<div class="row-btns"><button class="btn" data-act="next">Next mission</button>${q === 'best' ? '' : '<button class="btn ghost" data-act="replay">Replay and make a better call</button>'}<button class="btn ghost" data-act="home">All missions</button></div>` : ''}`;
  }
  floatXp(xp, v) { const d = document.createElement('div'); d.className = 'float-xp'; d.innerHTML = `+${xp} XP${v ? `<br><b>+${money(v)}</b>` : ''}`; document.body.appendChild(d); setTimeout(() => d.remove(), 2600); }
  toast(html, ms = 2800) { const t = $('#toast'); t.innerHTML = html; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), ms); }
  showBadges() {
    const got = new Set(this.game.s.badges);
    $('#modalCard').innerHTML = `<h2>Badges</h2><p class="muted">${this.game.s.xp} XP · ${esc(this.game.rank().name)}</p><div class="badges">${BADGES.map((b) => `<div class="badge ${got.has(b.id) ? 'got' : ''}"><div class="medal"></div><b>${esc(b.name)}</b><span>${esc(b.desc)}</span></div>`).join('')}</div><div class="row-btns"><button class="btn ghost" id="resetProgress">Reset progress</button><button class="btn" id="closeModal">Close</button></div>`;
    $('#modal').classList.remove('hidden');
    $('#closeModal').addEventListener('click', () => this.closeModal());
    $('#resetProgress').addEventListener('click', () => { this.game.reset(); this.renderMissions(); this.showBadges(); });
  }
  closeModal() { $('#modal').classList.add('hidden'); }
  buildTicker() { $('#tickerTrack').innerHTML = [...TICKER, ...TICKER].map((t) => `<span><i></i>${esc(t)}</span>`).join(''); }
  vantageLoop() {
    const ids = SITES.map((s) => s.id); let sig = 2.4e6;
    setInterval(() => {
      const id = ids[Math.floor(Math.random() * ids.length)];
      if (!this.scenario || id !== this.scenario.siteId) this.world.flash(id, Math.random() < 0.85 ? '#7cf29c' : '#7fe7ff');
      this.resolvedToday += +(Math.random() < 0.6); sig += (Math.random() - 0.5) * 6e4;
      $('#vpSignals').textContent = `${(sig / 1e6).toFixed(2)}M`; $('#vpAgents').textContent = String(124 + Math.floor(Math.random() * 9)); $('#vpResolved').textContent = this.resolvedToday.toLocaleString();
    }, 1300);
  }
}

new App();
