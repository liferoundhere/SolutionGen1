/* App boot & wiring. */
(function () {
  const MSK = (window.MSK = window.MSK || {});
  const U = MSK.util; const { $, esc } = U;
  const UI = (MSK.ui = {});

  UI.toast = function (msg, ms = 4200) {
    const t = U.el('div', 'toast', esc(msg)); document.body.appendChild(t);
    setTimeout(() => { t.style.transition = 'opacity .4s'; t.style.opacity = 0; setTimeout(() => t.remove(), 450); }, ms);
  };
  UI.flyToKey = function (key) {
    const l = MSK.loc(key); if (!l) return; const W = MSK.world; W.follow = null;
    if (l.b) { W.focusLevel(l.b, l.level); W.flyTo({ x: l.x, y: l.y, z: l.z }, l.kind === 'level' ? 150 : 80, { polar: 0.8 }); }
    else { W.clearFocus(); W.flyTo({ x: l.x, y: 0, z: l.z }, 140); }
  };
  // Focus mode: collapse every panel so the 3D map fills the window; remembers and restores the previous layout
  let focusPrev = null;
  UI.focusMode = function (on) {
    const app = $('#app'); const v = on != null ? !!on : !app.classList.contains('focus-mode');
    if (v === app.classList.contains('focus-mode')) return;
    if (v) {
      focusPrev = { left: app.classList.contains('left-collapsed'), right: $('#right').classList.contains('on'), dockMin: $('#dock').classList.contains('dock-min') };
      app.classList.add('focus-mode', 'left-collapsed'); $('#right').classList.remove('on'); $('#dock').classList.add('dock-min');
    } else {
      app.classList.remove('focus-mode');
      if (focusPrev) { app.classList.toggle('left-collapsed', focusPrev.left); if (focusPrev.right) $('#right').classList.add('on'); $('#dock').classList.toggle('dock-min', focusPrev.dockMin); }
    }
    $('#btn-focus').classList.toggle('on', v); $('#btn-focus').innerHTML = v ? '⛶ Exit focus' : '⛶ Focus';
    const dm = $('#dk-min'); if (dm) dm.textContent = $('#dock').classList.contains('dock-min') ? '▴' : '▾';
    window.dispatchEvent(new Event('resize'));
  };
  // Theme: the daylight street map (default) or the night operations view; the choice is remembered per browser
  UI.setTheme = function (t, save = true) {
    MSK.world.setTheme(t);
    const light = MSK.world.theme === 'light'; const b = $('#btn-theme');
    if (b) { b.innerHTML = light ? '☾ Night' : '☀ Day'; b.title = light ? 'Switch to the night operations view (L)' : 'Switch to the daylight street map (L)'; }
    if (save) try { localStorage.setItem('msk.theme', JSON.stringify(MSK.world.theme)); } catch (e) {}
  };
  UI.followActor = function () { /* follow handled by world.follow; stop on user drag */ };
  // toggle a toolbar overlay programmatically (keeps the button state in sync)
  UI.setOverlay = function (k, v) { const b = document.querySelector('[data-ov="' + k + '"]'); if (b && b.classList.contains('on') !== !!v) b.click(); };

  MSK.boot = function () {
    try {
      MSK.nav.init();
      MSK.world.init($('#stage'));
      MSK.actors.init(); MSK.fx.init(); MSK.weather.init(); MSK.elevators.init(); MSK.narrator.init();
      MSK.world.ticks.push((dt) => MSK.director.tick(dt));
    } catch (e) {
      console.error(e); $('#loader-msg').textContent = 'Failed to start the 3D engine: ' + e.message; return;
    }
    MSK.panels.bind(); MSK.inspector.bind(); MSK.dock.bind(); MSK.dash.bind(); MSK.story.bind(); MSK.explore.bind();
    $('#btn-sources').addEventListener('click', () => MSK.dash.open('sources'));
    document.addEventListener('click', (e) => { if (e.target.closest('[data-open-sources]')) { e.preventDefault(); MSK.dash.open('sources'); } });
    const narrow = () => window.innerWidth < 820;
    if (narrow()) $('#app').classList.add('left-collapsed');
    MSK.bus.on('director:load', () => { if (narrow()) $('#app').classList.add('left-collapsed'); });
    $('#left-body').addEventListener('click', (e) => { if (narrow() && e.target.closest('[data-sc],[data-person]')) $('#app').classList.add('left-collapsed'); });
    MSK.panels.setLens(MSK.state.lens);
    $('#insp-back').style.visibility = 'hidden';

    // picking
    MSK.bus.on('pick:building', ({ b, level }) => {
      const B = MSK.campus.buildingMap[b]; const W = MSK.world; W.follow = null;
      const n = level && level >= 1 ? level : 1; const L = B.levelMap[n];
      W.focusLevel(b, n); W.flyTo({ x: (L.rect.x0 + L.rect.x1) / 2, y: L.y, z: L.zc }, Math.max(150, (L.rect.x1 - L.rect.x0) * 1.15), { polar: 0.78 });
      MSK.inspector.building(b);
    });
    MSK.bus.on('pick:room', ({ key }) => MSK.inspector.room(key));
    MSK.bus.on('pick:actor', ({ id }) => { if (MSK.people[id]) MSK.inspector.person(id); });
    MSK.bus.on('pick:asset', ({ id }) => MSK.inspector.asset(id));
    MSK.bus.on('pick:tech', ({ id }) => MSK.inspector.tech(id));
    MSK.bus.on('pick:ai', ({ id }) => MSK.inspector.ai(id));
    MSK.bus.on('pick:ai-building', ({ b }) => { MSK.inspector.building(b); const h = document.getElementById('ai-in-b'); if (h) h.scrollIntoView({ block: 'start' }); });

    // stop follow-cam when the user drags
    MSK.world.renderer.domElement.addEventListener('pointerdown', () => { MSK.world.stopTween(); });
    MSK.world.controls.addEventListener('start', () => { MSK.world.follow = null; });

    // clock & weather chip
    let lastMin = -1;
    MSK.bus.on('clock', (m) => { const mm = Math.floor(m); if (mm === lastMin) return; lastMin = mm; $('#clock').firstChild.nodeValue = U.timeStr(mm); });
    MSK.bus.on('weather', (s) => { $('#wx').textContent = MSK.weather.label() + (s.flood > 0.2 ? ' · flooding' : ''); });

    // focus mode
    $('#btn-focus').addEventListener('click', () => UI.focusMode());
    // light / dark
    UI.setTheme(MSK.world.theme, false);
    $('#btn-theme').addEventListener('click', () => UI.setTheme(MSK.world.theme === 'light' ? 'dark' : 'light'));
    // keyboard
    window.addEventListener('keydown', (e) => {
      if (/input|select|textarea/i.test(e.target.tagName)) return;
      if (e.key === 'f' || e.key === 'F') { UI.focusMode(); return; }
      if (e.key === 't' || e.key === 'T') { MSK.story.findPerson(); return; }
      if (e.key === 'l' || e.key === 'L') { UI.setTheme(MSK.world.theme === 'light' ? 'dark' : 'light'); return; }
      if (e.key === 'j' || e.key === 'J') { MSK.story.openHub('start'); return; }
      if ((e.key === 'e' || e.key === 'E') && !MSK.story.active) { MSK.explore.open('explore'); return; }
      // while a story plays, the keys drive the story player
      if (MSK.story.active) {
        if (e.code === 'Space') { e.preventDefault(); MSK.story.ctl('pause'); }
        if (e.key === 'ArrowRight') MSK.story.ctl('next');
        if (e.key === 'ArrowLeft') MSK.story.ctl('prev');
        if (e.key === 'Escape') { if ($('#modal').classList.contains('on')) MSK.dash.close(); else MSK.story.stop(); }
        return;
      }
      if (e.key === 'Escape') { if (document.querySelector('.splash')) MSK.story.closeSplash(); else if ($('#modal').classList.contains('on')) MSK.dash.close(); else if ($('#app').classList.contains('focus-mode')) UI.focusMode(false); else MSK.inspector.close(); }
      if (!MSK.director.current()) return;
      if (e.code === 'Space') { e.preventDefault(); MSK.director.toggle(); }
      if (e.key === 'ArrowRight') MSK.director.next();
      if (e.key === 'ArrowLeft') MSK.director.prev();
      if (e.key === 'c' || e.key === 'C') MSK.dock.cinema();
      if (e.key === 'm' || e.key === 'M') MSK.narrator.setEnabled(!MSK.narrator.enabled);
    });

    // persona presence: when no scenario is running, the lens persona appears at their post
    let lensActor = null, booted = false;
    MSK.bus.on('lens', (id) => {
      if (MSK.director.current() || (MSK.story && MSK.story.active)) return;
      const L = MSK.lensMap[id]; if (!L || !L.home) return;
      if (lensActor) { MSK.actors.remove(lensActor); lensActor = null; }
      if (MSK.panels.lensLead(L).real) { if (booted) UI.flyToKey(L.home); return; }
      lensActor = L.persona; MSK.actors.ensure(L.persona); MSK.actors.place(L.persona, L.home);
      MSK.actors.setStatus(L.persona, 'On shift · ' + (MSK.people[L.persona].role || '').split(',')[0]);
      if (booted) { UI.flyToKey(L.home); MSK.director.follow(L.persona); }
    });
    MSK.bus.on('director:load', () => { lensActor = null; });
    MSK.bus.on('director:unload', () => { lensActor = null; MSK.bus.emit('lens', MSK.state.lens); });
    MSK.bus.emit('lens', MSK.state.lens);

    // welcome card (legacy, kept off: the splash below replaces it)
    const wc = U.el('div', 'welcome');
    const floors = MSK.campus.buildings.reduce((n, b) => n + b.levels.length, 0), rooms = MSK.campus.buildings.reduce((n, b) => n + b.levels.reduce((m, L) => m + L.rooms.length, 0), 0);
    wc.innerHTML = `<button class="x" title="Close">✕</button><div class="cat" style="color:var(--cisco)">Cisco × Splunk · hospital operations twin</div>
      <h2>Memorial Sloan Kettering · York Avenue campus</h2>
      <p><b style="color:var(--collab)">Webex</b> and <b style="color:var(--spaces)">Cisco Spaces</b> run the patient and clinical workflows and talk directly to Epic. <b style="color:var(--cisco)">Cisco Cloud Control</b> runs IT, network and security operations. <b style="color:var(--splunk)">Splunk</b> is the data layer: every signal and every outcome lands there. Choose a persona, play a scenario, and click anyone to hear their story.</p>
      <div class="wc-stats"><span><b>${MSK.scenarios.length}</b> scenarios</span><span><b>${Object.keys(MSK.people).length}</b> people</span><span><b>${floors}</b> floors · <b>${U.fmt(rooms)}</b> spaces</span><span><b>${MSK.cisco.list.length}</b> Cisco technologies</span></div>
      <div class="btnrow"><button class="pbtn" data-w="tour">▶ Guided tour · 3 min, narrated</button><button class="pbtn ghost" data-w="play">♥ Maria’s journey: curb to car</button><button class="pbtn ghost" data-w="persona">Choose a persona</button><button class="pbtn ghost" data-w="explore">Explore</button></div><div class="wc-hint">🔊 Every scenario is narrated · <span class="kbd">M</span> mute · <span class="kbd">C</span> cinema mode · <span class="kbd">F</span> focus · <span class="kbd">L</span> day/night map · <span class="kbd">Space</span> pause · <span class="kbd">← →</span> step</div>`;
    const closeWc = () => wc.remove();
    wc.addEventListener('click', (e) => {
      const b = e.target.closest('[data-w]'); if (e.target.closest('.x')) return closeWc(); if (!b) return;
      closeWc();
      if (b.dataset.w === 'play') MSK.director.load('surgical-journey');
      if (b.dataset.w === 'tour') MSK.director.load('campus-tour');
      if (b.dataset.w === 'persona') { const l = $('#lenses'); l.classList.add('pulse'); setTimeout(() => l.classList.remove('pulse'), 2400); UI.toast('Pick a lens: each persona sees the same hospital through their own priorities.'); }
      if (b.dataset.w === 'explore') UI.toast('Tip: click a glowing MSK building to open it, then pick a floor. Turn on “Spaces data” for live room telemetry.');
    });
    MSK.bus.on('director:load', closeWc);

    // reveal
    MSK.world.setClock(8 * 60 + 40);
    MSK.world.camera.position.set(900, 760, 1300); MSK.world.controls.target.set(-40, 0, -60);
    MSK.world.home(3.2);
    setTimeout(() => { $('#loader').classList.add('done'); }, 250);
    setTimeout(() => { $('#loader').style.display = 'none'; }, 1100);
    setTimeout(() => { booted = true; }, 3400);
    // deep link: #scenario=id
    // deep links: #scenario=id[&variant=without][&step=4][&mute=1][&lens=clinical]
    const hp = new URLSearchParams(location.hash.slice(1));
    if (hp.get('lens') && MSK.lensMap[hp.get('lens')]) MSK.panels.setLens(hp.get('lens'));
    if (hp.get('mute')) MSK.narrator.setEnabled(false);
    if (hp.get('debug')) setInterval(() => { const W = MSK.world, S = MSK.director.current(); document.title = JSON.stringify({ cam: W.camera.position.toArray().map((v) => Math.round(v)), tgt: W.controls.target.toArray().map((v) => Math.round(v)), focus: W.focus, follow: !!W.follow, idx: S && S.idx, t: S && +S.t.toFixed(1), time: +W.time.toFixed(1) }); }, 250);
    if (hp.get('scenario')) setTimeout(() => { MSK.director.load(hp.get('scenario'), hp.get('variant') || undefined); if (hp.get('step')) MSK.director.goto(Number(hp.get('step')), true); }, 1800);
    // #story=journey:maria:with | scenario:cold-chain:compare | welcome   ·   #hub=journeys   ·   #notour skips the splash
    if (hp.get('story')) { const [k, id, m] = hp.get('story').split(':'); setTimeout(() => MSK.story.start(k, k === 'welcome' ? 'welcome' : id, m || 'with'), 1800); }
    else if (hp.get('hub')) setTimeout(() => MSK.story.openHub(hp.get('hub')), 1500);
    else if (!hp.get('scenario') && !hp.has('notour')) setTimeout(() => MSK.story.splash(), 900);
    window.addEventListener('resize', () => {});
  };
})();
