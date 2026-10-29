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
  UI.followActor = function () { /* follow handled by world.follow; stop on user drag */ };

  MSK.boot = function () {
    try {
      MSK.nav.init();
      MSK.world.init($('#stage'));
      MSK.actors.init(); MSK.fx.init(); MSK.weather.init();
      MSK.world.ticks.push((dt) => MSK.director.tick(dt));
    } catch (e) {
      console.error(e); $('#loader-msg').textContent = 'Failed to start the 3D engine: ' + e.message; return;
    }
    MSK.panels.bind(); MSK.inspector.bind(); MSK.dock.bind(); MSK.dash.bind();
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

    // keyboard
    window.addEventListener('keydown', (e) => {
      if (/input|select|textarea/i.test(e.target.tagName)) return;
      if (e.key === 'Escape') { if ($('#modal').classList.contains('on')) MSK.dash.close(); else MSK.inspector.close(); }
      if (!MSK.director.current()) return;
      if (e.code === 'Space') { e.preventDefault(); MSK.director.toggle(); }
      if (e.key === 'ArrowRight') MSK.director.next();
      if (e.key === 'ArrowLeft') MSK.director.prev();
    });

    // persona presence: when no scenario is running, the lens persona appears at their post
    let lensActor = null, booted = false;
    MSK.bus.on('lens', (id) => {
      if (MSK.director.current()) return;
      const L = MSK.lensMap[id]; if (!L || !L.home) return;
      if (lensActor) MSK.actors.remove(lensActor);
      lensActor = L.persona; MSK.actors.ensure(L.persona); MSK.actors.place(L.persona, L.home);
      MSK.actors.setStatus(L.persona, 'On shift · ' + (MSK.people[L.persona].role || '').split(',')[0]);
      if (booted) { UI.flyToKey(L.home); MSK.director.follow(L.persona); }
    });
    MSK.bus.on('director:load', () => { lensActor = null; });
    MSK.bus.on('director:unload', () => { lensActor = null; MSK.bus.emit('lens', MSK.state.lens); });
    MSK.bus.emit('lens', MSK.state.lens);

    // welcome card
    const wc = U.el('div', 'welcome');
    const floors = MSK.campus.buildings.reduce((n, b) => n + b.levels.length, 0), rooms = MSK.campus.buildings.reduce((n, b) => n + b.levels.reduce((m, L) => m + L.rooms.length, 0), 0);
    wc.innerHTML = `<button class="x" title="Close">✕</button><div class="cat" style="color:var(--cisco)">Cisco Cloud Control × Splunk · hospital operations twin</div>
      <h2>Memorial Sloan Kettering · York Avenue campus</h2>
      <p>Every connected system on the campus is orchestrated by <b style="color:var(--cisco)">Cisco Cloud Control</b>, and every operations decision runs on <b style="color:var(--splunk)">Splunk</b> data. Choose a persona, play a scenario, and click anyone to hear their story.</p>
      <div class="wc-stats"><span><b>${MSK.scenarios.length}</b> scenarios</span><span><b>${Object.keys(MSK.people).length}</b> people</span><span><b>${floors}</b> floors · <b>${U.fmt(rooms)}</b> spaces</span><span><b>${MSK.cisco.list.length}</b> Cisco technologies</span></div>
      <div class="btnrow"><button class="pbtn" data-w="play">▶ Play Maria’s journey: curb to car</button><button class="pbtn ghost" data-w="persona">Choose a persona</button><button class="pbtn ghost" data-w="explore">Explore the campus</button></div>`;
    $('#stage').appendChild(wc);
    const closeWc = () => wc.remove();
    wc.addEventListener('click', (e) => {
      const b = e.target.closest('[data-w]'); if (e.target.closest('.x')) return closeWc(); if (!b) return;
      closeWc();
      if (b.dataset.w === 'play') MSK.director.load('surgical-journey');
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
    const m = location.hash.match(/scenario=([\w-]+)/); if (m) setTimeout(() => MSK.director.load(m[1]), 1800);
    window.addEventListener('resize', () => {});
  };
})();
