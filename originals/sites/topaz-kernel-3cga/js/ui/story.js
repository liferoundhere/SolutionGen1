/* Story experience: welcome splash → guided tour, the Journeys hub, and the beat-driven story player.
   One clip per beat (audio/stories/<key>.mp3, MSK.storyManifest). Each beat can move the scenario to a step, fly the
   camera, show or hide the panels, highlight UI and pulse the phone, so the voice and the twin stay in sync.
   While a story plays the screen goes quiet (body.narrating): only the pill player and the people remain. */
(function () {
  const MSK = (window.MSK = window.MSK || {});
  const U = MSK.util; const { $, esc } = U;
  const SX = (MSK.story = { active: false, captions: false });
  const ST = () => MSK.stories, D = () => MSK.director, W = () => MSK.world, AC = () => MSK.actors;
  const lines = () => (MSK.storyManifest && MSK.storyManifest.lines) || {};
  let st = null, parts = [], pi = 0, bi = 0, paused = false, timer = null, prev = null, el = null, cap = null;
  const audio = new Audio(); audio.preload = 'auto'; SX.audio = audio;
  const synth = window.speechSynthesis || null;
  const sc = (id) => MSK.scenarios.find((s) => s.id === id);

  // ---------------------------------------------------------------- what can be played
  function storyFor(kind, id) {
    const S = ST();
    if (kind === 'welcome') return { kind, title: S.WELCOME.title, prefix: 'welcome', parts: { with: S.WELCOME.beats } };
    if (kind === 'journey') { const j = S.JOURNEY_BY_ID[id]; const s = S.STORIES[id]; return j && s ? { kind, id, title: s.title, prefix: `j-${id}`, scenario: j.scenario, hero: j.hero, withoutVariant: j.withoutVariant, parts: s } : null; }
    if (kind === 'scenario') {
      const s = S.SCENARIO_STORIES[id]; if (s) return { kind, id, title: s.title, prefix: `s-${id}`, scenario: id, hero: s.hero, withoutVariant: s.withoutVariant, parts: s };
      const j = S.JOURNEYS.find((x) => x.scenario === id); return j ? storyFor('journey', j.id) : null;
    }
    return null;
  }
  const keyOf = (p, i) => (st.prefix === 'welcome' ? `welcome-${i}` : `${st.prefix}-${p}-${i}`);
  // a story is offered only once every beat has its premium recording (never a robotic stand-in)
  SX.ready = function (kind, id, mode) {
    const s = storyFor(kind, id); if (!s) return false;
    const ps = kind === 'welcome' ? ['with'] : mode === 'compare' ? ['without', 'with'] : [mode || 'with'];
    return ps.every((p) => (s.parts[p] || []).every((_, i) => lines()[s.prefix === 'welcome' ? `welcome-${i}` : `${s.prefix}-${p}-${i}`]));
  };

  SX.start = function (kind, id, mode = 'with') {
    const s = storyFor(kind, id); if (!s) return;
    const wasActive = SX.active; SX.stop(true);
    document.querySelector('.splash') && document.querySelector('.splash').remove();
    MSK.dash.close();
    st = s; st.mode = kind === 'welcome' ? 'with' : mode;
    parts = st.mode === 'compare' ? ['without', 'with'] : [st.mode]; pi = 0; bi = 0; paused = false; SX.active = true;
    if (!wasActive) prev = { focus: $('#app').classList.contains('focus-mode'), lens: MSK.state.lens };
    MSK.narrator.suspend(true);
    document.body.classList.add('narrating'); document.body.classList.toggle('tour', kind === 'welcome');
    MSK.ui.focusMode(true);
    MSK.dock.phone.close();
    el.classList.add('on');
    setupPart(); playBeat();
  };
  const beats = () => (st && st.parts[parts[pi]]) || [];

  function setupPart() {
    const part = parts[pi];
    if (st.kind === 'welcome') {
      D().unload(); D().counterfactual = false;
      W().setClock(9 * 60);
      return;
    }
    const s = sc(st.scenario);
    const variant = s.variants ? (part === 'without' && st.withoutVariant ? st.withoutVariant : (s.variants.with ? 'with' : Object.keys(s.variants)[0])) : undefined;
    // the counterfactual switch: a scenario without its own Without variant is replayed with Cisco's help removed
    D().counterfactual = part === 'without' && !st.withoutVariant;
    D().autoAdvance = false;
    D().load(st.scenario, variant);
    MSK.dock.phone.reset();
  }

  function playBeat() {
    if (!SX.active) return;
    const list = beats();
    if (bi >= list.length) {
      if (pi < parts.length - 1) { pi++; bi = 0; setupPart(); return playBeat(); }
      return finish();
    }
    const b = list[bi];
    applyBeat(b); render();
    clearTimeout(timer); if (synth) synth.cancel();
    const key = keyOf(parts[pi], bi); const rec = lines()[key];
    showCaption(ST().plain(b.text));
    const next = () => { if (!SX.active || paused) return; bi++; timer = setTimeout(playBeat, 450); };
    if (rec) {
      audio.onended = next;
      audio.onerror = () => { if ((audio.getAttribute('src') || '').includes(key)) speakFallback(b, next); };
      audio.src = 'audio/stories/' + rec.file + '?v=' + (rec.hash || rec.dur); audio.playbackRate = 1;
      const p = audio.play(); if (p && p.catch) p.catch((e) => { if (e && e.name === 'AbortError') return; speakFallback(b, next); });
      const nk = keyOf(parts[pi], bi + 1); const nr = lines()[nk];
      if (nr) fetch('audio/stories/' + nr.file + '?v=' + (nr.hash || nr.dur), { cache: 'force-cache' }).catch(() => {});
    } else speakFallback(b, next);
  }
  function speakFallback(b, next) {
    const text = ST().plain(b.text);
    if (!synth) { timer = setTimeout(next, Math.max(3000, text.split(/\s+/).length * 400)); return; }
    const u = new SpeechSynthesisUtterance(text); u.rate = 0.98;
    const v = (synth.getVoices() || []).find((x) => /Natural/i.test(x.name) && /^en/i.test(x.lang)) || (synth.getVoices() || []).find((x) => /^en/i.test(x.lang)); if (v) u.voice = v;
    u.onend = next; u.onerror = () => { timer = setTimeout(next, 3000); };
    synth.speak(u);
  }

  // ---------------------------------------------------------------- beat actions
  function applyBeat(b) {
    if (b.step != null && D().current()) { const S = D().current(); if (S.idx !== b.step) D().goto(b.step, true); else if (D().paused()) D().play(); }
    if (b.fly) fly(b.fly);
    if (b.panels != null) MSK.ui.focusMode(!b.panels);
    if (st.kind === 'welcome') {
      // bottom: a scenario in the player, paused (shown only on the beat that describes it)
      if (b.dock) { if (!D().current() || D().current().sc.id !== b.dock) D().load(b.dock); D().pause(); $('#dock').classList.remove('dock-min'); }
      else if (D().current()) D().unload();
      // right: the inspector, opened on something worth reading
      if (b.right) { const [k, id] = b.right.split(':'); MSK.inspector[k](id); } else MSK.inspector.close();
      if (b.panels) $('#app').classList.remove('left-collapsed');
    }
    document.querySelectorAll('.sx-hl').forEach((n) => n.classList.remove('sx-hl'));
    if (b.hl) requestAnimationFrame(() => document.querySelectorAll(b.hl).forEach((n) => n.classList.add('sx-hl')));
    if (b.phone) MSK.dock.phone.pulse();
  }
  function fly(t) {
    const w = W();
    if (t !== 'inside' && w.overlay.spaces && st.kind === 'welcome') MSK.ui.setOverlay('spaces', false);
    if (t === 'home') return w.home(2.2);
    if (t === 'building') { w.clearFocus(); const b = MSK.campus.buildingMap.MH; return w.flyTo({ x: (b.x0 + b.x1) / 2, y: 60, z: (b.z0 + b.z1) / 2 }, 330, { az: 0.6, polar: 0.95, dur: 2.4 }); }
    if (t === 'hub') { w.clearFocus(); const H = MSK.fx.HUB; return w.flyTo({ x: H.x, y: H.y, z: H.z }, 260, { az: 0.9, polar: 1.0, dur: 2.4 }); }
    if (t === 'splunk') { w.clearFocus(); const H = MSK.fx.HUB; return w.flyTo({ x: H.x, y: H.y - 34, z: H.z }, 300, { az: 0.9, polar: 1.12, dur: 2.4 }); }
    if (t === 'inside') {
      const L = MSK.campus.buildingMap.MH.levelMap[14]; w.focusLevel('MH', 14); MSK.ui.setOverlay('spaces', true);
      return w.flyTo({ x: (L.rect.x0 + L.rect.x1) / 2, y: L.y, z: L.zc }, 150, { polar: 0.78, dur: 2.4 });
    }
  }

  // ---------------------------------------------------------------- mini player (pill)
  function render() {
    const total = parts.reduce((a, p) => a + (st.parts[p] || []).length, 0);
    const done = parts.slice(0, pi).reduce((a, p) => a + st.parts[p].length, 0) + bi;
    const part = parts[pi];
    el.innerHTML = `<span class="sx-mode ${part === 'without' ? 'x' : ''}">${st.kind === 'welcome' ? 'Tour' : part === 'without' ? 'Without Cisco' : 'With Cisco'}</span><span class="sx-t">${esc(st.title)}</span>
      <span class="sx-dots">${Array.from({ length: total }, (_, i) => `<i class="${i < done ? 'd' : i === done ? 'c' : ''}"></i>`).join('')}</span>
      <i data-a="prev" title="Back (←)">⏮</i><i data-a="pause" title="Pause (space)">${paused ? '▶' : '⏸'}</i><i data-a="next" title="Skip (→)">⏭</i>
      ${st.kind !== 'welcome' ? '<i data-a="find" title="Find the person (T)">🎯</i>' : ''}<i data-a="cc" class="${SX.captions ? 'on' : ''}" title="Captions">CC</i><i data-a="x" title="End the story (Esc)">✕</i>`;
    el.querySelectorAll('[data-a]').forEach((n) => (n.onclick = () => SX.ctl(n.dataset.a)));
  }
  function showCaption(t) { cap.textContent = t; cap.classList.toggle('on', SX.captions && SX.active); }
  SX.ctl = function (a) {
    if (!SX.active) return;
    if (a === 'x') return SX.stop();
    if (a === 'find') return SX.findPerson();
    if (a === 'cc') { SX.captions = !SX.captions; cap.classList.toggle('on', SX.captions); return render(); }
    const halt = () => { audio.pause(); if (synth) synth.cancel(); clearTimeout(timer); };
    if (a === 'next') { halt(); paused = false; bi++; return playBeat(); }
    if (a === 'prev') { halt(); paused = false; bi = Math.max(0, bi - 1); return playBeat(); }
    if (a === 'pause') {
      paused = !paused;
      if (paused) { audio.pause(); if (synth) synth.pause(); clearTimeout(timer); if (D().current()) D().pause(); }
      else { if (D().current()) D().play(); if (audio.src && !audio.ended && audio.currentTime > 0) audio.play().catch(() => {}); else if (synth && synth.paused) synth.resume(); else playBeat(); }
      render();
    }
  };
  function finish() { const s = st; SX.stop(); SX.openHub(s.kind === 'welcome' ? 'journeys' : s.kind === 'scenario' ? 'scenarios' : 'journeys', { justPlayed: s.kind === 'welcome' ? null : s }); }
  SX.stop = function (silent) {
    if (!SX.active) return;
    SX.active = false; audio.pause(); if (synth) synth.cancel(); clearTimeout(timer);
    el.classList.remove('on'); cap.classList.remove('on');
    document.body.classList.remove('narrating', 'tour');
    document.querySelectorAll('.sx-hl').forEach((n) => n.classList.remove('sx-hl'));
    D().counterfactual = false; D().autoAdvance = true;
    MSK.narrator.suspend(false);
    if (W().overlay.spaces && st && st.kind === 'welcome') MSK.ui.setOverlay('spaces', false);
    if (!silent) { D().unload(); MSK.ui.focusMode(!!(prev && prev.focus)); MSK.inspector.close(); }
  };
  SX.mode = () => (SX.active ? { kind: st.kind, part: parts[pi], hero: st.hero } : null);

  // ---------------------------------------------------------------- find the person
  SX.target = function () {
    const ac = AC(); const ids = [SX.active && st.hero, ac.tracked && ac.tracked()].filter(Boolean);
    for (const id of ids) { const a = ac.get(id); if (a && a.group.visible) return a; }
    return null;
  };
  SX.findPerson = function () {
    const a = SX.target(); if (!a) { MSK.ui.toast('No one is being followed right now. Play a journey, or click a person.'); return; }
    const w = W(); const lv = D().levelAt(a.pos);
    if (lv) w.focusLevel(lv.b, lv.level); else w.clearFocus();
    w.frame(a.pos, lv ? 62 : 95, lv ? 0.5 : 0.62, { dur: 1.1, track: () => a.pos });
    D().follow(a.id);
    const arrow = $('#edge-arrow'); if (arrow) { arrow.classList.remove('ping'); void arrow.offsetWidth; arrow.classList.add('ping'); }
  };
  // edge-of-screen arrow that points to the followed person when they are off screen
  function edgeTick() {
    const arrow = $('#edge-arrow'); if (!arrow) return;
    const a = SX.target(); const w = W(); const stage = $('#stage');
    if (!a || !stage.clientWidth) { arrow.classList.remove('on'); return; }
    const p = a.pos.clone(); p.y += 2; p.project(w.camera);
    const behind = p.z > 1; const inside = !behind && Math.abs(p.x) < 0.94 && Math.abs(p.y) < 0.9;
    if (inside) { arrow.classList.remove('on'); return; }
    let x = p.x, y = p.y; if (behind) { x = -x; y = -y; }
    const m = Math.max(Math.abs(x), Math.abs(y)) || 1; x /= m; y /= m;
    const W2 = stage.clientWidth / 2, H2 = stage.clientHeight / 2, pad = 34;
    const dockH = document.body.classList.contains('narrating') ? 70 : (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dock-h')) || 0);
    const px = W2 + x * (W2 - pad), py = Math.min(stage.clientHeight - dockH - pad, Math.max(pad + 50, H2 - y * (H2 - pad)));
    arrow.style.transform = `translate(${px - 22}px, ${py - 22}px)`;
    arrow.querySelector('i').style.transform = `rotate(${Math.atan2(-y, x)}rad)`;
    arrow.querySelector('b').textContent = (a.name || '').split(' ')[0].replace(/,$/, '');
    arrow.style.setProperty('--pc', a.person ? '#' + new MSK.world.THREE.Color(a.person.color).getHexString() : '#0e8fb0');
    arrow.classList.add('on');
  }

  // ---------------------------------------------------------------- Journeys hub
  SX.openHub = function (tab = 'start', opts = {}) {
    if (SX.active) SX.stop();
    const S = ST();
    const modes = (kind, id) => SX.ready(kind, id, 'compare')
      ? `<div class="jp-play"><button class="pbtn" data-k="${kind}" data-id="${id}" data-m="with">▶ With Cisco</button><button class="pbtn red" data-k="${kind}" data-id="${id}" data-m="without">▶ Without Cisco</button><button class="pbtn ghost" data-k="${kind}" data-id="${id}" data-m="compare">⇄ Compare</button></div>`
      : `<div class="jp-play"><span class="jp-rec">🎙 The narrator is still recording this story. It unlocks here when it’s ready.</span></div>`;
    const kpis = (scid) => { const o = (sc(scid).outcomes || []).slice(0, 3); return o.length ? `<div class="jp-k">${o.map((k) => `<div><small>${esc(k.label)}</small><b><s>${esc(k.without)}</s> → ${esc(k.with)}</b></div>`).join('')}</div>` : ''; };
    const walk = (scid) => { const s = sc(scid); return `<div class="jp-walk"><span data-walk="${scid}" data-v="${s.variants ? (s.variants.with ? 'with' : Object.keys(s.variants)[0]) : ''}">🚶 Walk it yourself, step by step</span>${s.variants && s.variants.without ? ` · <span data-walk="${scid}" data-v="without">without Cisco</span>` : ''}</div>`; };
    const jcard = (j) => `<div class="jp-card" style="--jc:${j.color}"><div class="jp-h"><span class="jp-ic">${j.icon}</span><div><b>${esc(j.name)}</b><small>${esc(j.type)}</small></div></div>
        <p>${esc(j.pitch)}</p>${kpis(j.scenario)}${modes('journey', j.id)}${walk(j.scenario)}</div>`;
    const scs = MSK.scenarios.filter((s) => s.id !== 'campus-tour' && storyFor('scenario', s.id));
    const scard = (s) => { const j = S.JOURNEYS.find((x) => x.scenario === s.id); const own = S.SCENARIO_STORIES[s.id];
      return `<div class="jp-card sc" style="--jc:${j ? j.color : MSK.techColor((s.tech || [])[0] || 'splunk')}"><div class="jp-h"><span class="jp-ic">${s.icon || '•'}</span><div><b>${esc(s.title)}</b><small>${esc(s.category || '')}${j ? ` · told through ${esc(j.name)}’s journey` : own ? ` · ${esc(own.title)}` : ''}</small></div></div><p>${esc((s.summary || '').split('. ').slice(0, 2).join('. ').replace(/\.?$/, '.'))}</p>${modes('scenario', s.id)}${walk(s.id)}</div>`; };
    const rec = S.JOURNEYS.filter((j) => j.recommended);
    $('#modal-title').textContent = '♥ Journeys';
    $('#modal-sub').textContent = 'Narrated stories of patients and care teams · each told with and without Cisco';
    $('#modal-body').innerHTML = `<div class="jp-tabs"><span data-tab="start" class="${tab === 'start' ? 'on' : ''}">⭐ Start here</span><span data-tab="journeys" class="${tab === 'journeys' ? 'on' : ''}">♥ Journeys (${S.JOURNEYS.length})</span><span data-tab="scenarios" class="${tab === 'scenarios' ? 'on' : ''}">⚡ Scenarios (${scs.length})</span></div>
      ${opts.justPlayed ? `<div class="jp-done">✓ Finished: <b>${esc(opts.justPlayed.title)}</b>${opts.justPlayed.mode === 'compare' ? '' : `. Replay it ${opts.justPlayed.mode === 'without' ? '<b>with</b>' : '<b>without</b>'} Cisco to see the difference, or pick another story.`}</div>` : ''}
      <div class="jp-pane" data-pane="start" ${tab === 'start' ? '' : 'hidden'}><div class="jp-hero"><div><h3>The guided tour</h3><p>A four-minute narrated introduction: what this twin is, what Webex, Cisco Spaces, Cisco Cloud Control and Splunk each do here, how the stories work, and how to find your way around.</p><button class="pbtn big" data-k="welcome" data-id="welcome" data-m="with">▶ Play the guided tour</button></div></div>
        <h4>Recommended first stories</h4><div class="jp-grid">${rec.map(jcard).join('')}</div></div>
      <div class="jp-pane" data-pane="journeys" ${tab === 'journeys' ? '' : 'hidden'}><div class="sub" style="margin:0 0 12px">Follow one person through their day. The story drives the scene, the camera and the phone. <b>Without Cisco</b> replays the same day with Cisco’s help removed; <b>Compare</b> plays both, back to back.</div><div class="jp-grid">${S.JOURNEYS.map(jcard).join('')}</div></div>
      <div class="jp-pane" data-pane="scenarios" ${tab === 'scenarios' ? '' : 'hidden'}><div class="sub" style="margin:0 0 12px">Every scenario is told as a short story, through the person it touches most.</div><div class="jp-grid">${scs.map(scard).join('')}</div></div>`;
    $('#modal').classList.add('on'); $('#modal-body').scrollTop = 0;
    const body = $('#modal-body');
    body.querySelectorAll('[data-tab]').forEach((t) => (t.onclick = () => { body.querySelectorAll('[data-tab]').forEach((x) => x.classList.toggle('on', x === t)); body.querySelectorAll('[data-pane]').forEach((p) => (p.hidden = p.dataset.pane !== t.dataset.tab)); }));
    body.querySelectorAll('[data-k]').forEach((b) => (b.onclick = () => SX.start(b.dataset.k, b.dataset.id, b.dataset.m)));
    body.querySelectorAll('[data-walk]').forEach((b) => (b.onclick = () => { MSK.dash.close(); D().load(b.dataset.walk, b.dataset.v || undefined); }));
  };

  // ---------------------------------------------------------------- welcome splash
  SX.splash = function () {
    if (document.querySelector('.splash')) return;
    const s = U.el('div', 'splash');
    s.innerHTML = `<div class="sx-card"><div class="sx-kick">Cisco × Splunk · hospital operations twin</div>
      <h1>Memorial Sloan Kettering<br>York Avenue campus</h1>
      <p>A living model of a cancer hospital, told through the people in it. See what Webex, Cisco Spaces, Cisco Cloud Control and Splunk change on their hardest days, with and without Cisco.</p>
      <button class="sx-go" data-go="tour">▶ Start the guided tour <small>· sound on · 4 min</small></button>
      <div class="sx-alt"><span data-go="journeys">♥ Journeys</span><span data-go="explore">Explore on my own</span></div>
      <div class="sx-foot">Illustrative concept demo. Not affiliated with or endorsed by Memorial Sloan Kettering. Story characters are fictional; leader names and titles come from MSK’s public pages. <a href="#" data-open-sources>Sources & methodology</a></div></div>`;
    document.body.appendChild(s);
    const close = () => { s.classList.add('out'); setTimeout(() => s.remove(), 450); };
    s.addEventListener('click', (e) => {
      const g = e.target.closest('[data-go]'); if (!g) { if (e.target === s) close(); return; }
      close();
      if (g.dataset.go === 'tour') SX.start('welcome', 'welcome');
      if (g.dataset.go === 'journeys') SX.openHub('start');
    });
    SX.closeSplash = close;
  };

  // ---------------------------------------------------------------- bind
  SX.bind = function () {
    el = U.el('div', 'sx'); el.id = 'storyPlayer'; $('#stage').appendChild(el);
    cap = U.el('div', 'sx-cap'); $('#stage').appendChild(cap);
    const arrow = U.el('button', 'edge-arrow', '<i>➤</i><b></b>'); arrow.id = 'edge-arrow'; arrow.title = 'Find the person (T)'; $('#stage').appendChild(arrow);
    arrow.addEventListener('click', () => SX.findPerson());
    W().ticks.push(edgeTick);
    $('#btn-journeys').addEventListener('click', () => SX.openHub('start'));
    // a story owns the director while it plays; if the user loads another scenario from the panels, the story ends
    MSK.bus.on('director:load', (S) => { if (SX.active && st && st.kind !== 'welcome' && S.sc.id !== st.scenario) SX.stop(true); });
    // the tour's panel beat loads a scenario into the bottom player: keep the camera on the tour's own shots
    MSK.bus.on('director:step', () => { if (SX.active && st && st.kind === 'welcome') W().stopTween(); });
  };
})();
