/* Scenario director: schedules and plays step actions, supports scrubbing (instant state rebuild), variants and speed. */
(function () {
  const MSK = (window.MSK = window.MSK || {});
  const D = (MSK.director = {});
  const WALK_V = 9, VEH_V = 70, BEAT = 0.35;
  let S = null; // { sc, variant, steps, idx, t, dur, events, playing, speed }
  let speed = 1, playing = false;
  D.speed = () => speed; D.paused = () => !!S && !playing;
  D.setSpeed = (v) => { speed = v; MSK.bus.emit('director:speed', v); };
  D.current = () => S;

  const AC = () => MSK.actors, FX = () => MSK.fx, W = () => MSK.world;

  function stepsOf(sc, variant) { return sc.variants ? (sc.variants[variant] || Object.values(sc.variants)[0]).steps : sc.steps; }
  D.variants = (sc) => (sc.variants ? Object.entries(sc.variants).map(([k, v]) => ({ id: k, label: v.label || k })) : []);

  D.unload = function () {
    if (!S) return;
    AC().clear(); FX().clearMarkers(); FX().clearPaths();
    Object.keys(W()._hl || {}).forEach((k) => W().highlightRoom(k, null)); W()._hl = {};
    MSK.weather.set({ type: 'clear' }); W().follow = null;
    S = null; playing = false; MSK.bus.emit('director:unload');
  };
  D.load = function (id, variant) {
    const sc = MSK.scenarios.find((s) => s.id === id); if (!sc) return;
    D.unload();
    const v = variant || (sc.variants ? Object.keys(sc.variants)[0] : null);
    S = { sc, variant: v, steps: stepsOf(sc, v), idx: -1, t: 0, dur: 0, events: [], phones: {}, kpis: {}, cascade: {}, timers: [] };
    MSK.bus.emit('director:load', S);
    D.goto(0, true);
  };
  D.setVariant = function (v) { if (!S || !S.sc.variants) return; const idx = 0; const id = S.sc.id; D.load(id, v); D.goto(idx, true); };

  // ---------------------------------------------------------------- scrubbing
  D.goto = function (i, autoplay) {
    if (!S) return; i = Math.max(0, Math.min(S.steps.length - 1, i));
    // rebuild state from scratch up to step i (instant), then play step i
    AC().clear(); FX().clearMarkers(); FX().clearPaths();
    Object.keys(W()._hl || {}).forEach((k) => W().highlightRoom(k, null)); W()._hl = {};
    S.phones = {}; S.kpis = {}; S.cascade = {}; S.timers = []; S.weather = { type: 'clear' };
    MSK.weather.set({ type: 'clear' });
    for (let k = 0; k < i; k++) (S.steps[k].actions || []).forEach((a) => runInstant(a));
    MSK.weather.snap();
    MSK.bus.emit('director:rebuilt', S);
    startStep(i);
    playing = autoplay !== false; MSK.bus.emit('director:play', playing);
  };
  D.next = () => { if (S && S.idx < S.steps.length - 1) D.goto(S.idx + 1, true); };
  D.prev = () => { if (S) D.goto(Math.max(0, S.idx - (S.t < 1.5 ? 1 : 0)), true); };
  D.play = () => { if (!S) return; if (S.idx === S.steps.length - 1 && S.t >= S.dur) D.goto(0, true); playing = true; MSK.bus.emit('director:play', true); };
  D.pause = () => { playing = false; MSK.bus.emit('director:play', false); };
  D.toggle = () => (playing ? D.pause() : D.play());

  // ---------------------------------------------------------------- instant application
  function runInstant(a) {
    const ac = AC();
    if ('spawn' in a) { ac.ensure(a.spawn); ac.setHidden(a.spawn, false); ac.place(a.spawn, a.at); }
    else if ('despawn' in a) ac.remove(a.despawn);
    else if ('move' in a) { if (!ac.get(a.move)) return; ac.place(a.move, a.to); (a.with || []).forEach((c) => { if (ac.get(c)) ac.place(c, a.to); }); }
    else if ('vehicle' in a) {
      const v = ac.ensure(a.vehicle, { type: 'vehicle', kind: a.kind, label: a.label });
      (a.carry || []).forEach((p) => { ac.ensure(p); ac.setHidden(p, true); });
      arriveVehicle(v, a);
    }
    else if ('asset' in a) { ac.ensure(a.asset, { type: 'asset', kind: a.kind, label: a.label, tag: a.tag }); ac.place(a.asset, a.at, { type: 'asset' }); }
    else if ('attach' in a) ac.attach(a.attach, a.to);
    else if ('detach' in a) ac.detach(a.detach, a.at);
    else if ('marker' in a) FX().marker(a.id || a.marker, a.marker, a.kind, a.label);
    else if ('clear' in a) FX().clearMarker(a.clear);
    else if ('highlight' in a) W().highlightRoom(a.highlight, hlColor(a.color));
    else if ('unhighlight' in a) W().highlightRoom(a.unhighlight, null);
    else if ('status' in a) { S.status = S.status || {}; S.status[a.status] = a.text; ac.setStatus(a.status, a.text); }
    else if ('weather' in a) { S.weather = a.weather; MSK.weather.set(a.weather); }
    else if ('cascade' in a) { Object.assign(S.cascade, a.cascade); MSK.bus.emit('ui:cascade', { state: S.cascade, instant: true }); }
    else if ('kpi' in a) { S.kpis[a.kpi.label] = a.kpi; MSK.bus.emit('ui:kpi', { kpis: S.kpis, instant: true }); }
    else if ('phone' in a) { (S.phones[a.phone] = S.phones[a.phone] || []).push(a); }
    // alert / packet / say / timer are transient: skipped
  }
  function hlColor(c) { return { ok: 0x34d399, warn: 0xfbbf24, crit: 0xef4444, info: 0x22d3ee }[c] || (c ? c : 0x22d3ee); }
  function arriveVehicle(v, a) {
    const ac = AC(); const dest = MSK.campus.outdoor[a.to];
    ac.place(v.id, a.to, { type: 'vehicle' });
    const pass = a.carry || [];
    if (dest && dest.kind === 'edge') { pass.forEach((p) => ac.setHidden(p, true)); ac.remove(v.id); }
    else pass.forEach((p) => { ac.setHidden(p, false); ac.place(p, a.to); });
  }

  // ---------------------------------------------------------------- scheduling
  function startStep(i) {
    const st = S.steps[i]; S.idx = i; S.t = 0;
    const ac = AC();
    const sim = {}; ac.map.forEach((a, id) => { sim[id] = a.loc; });
    const busy = {}; const holder = {}; ac.map.forEach((a, id) => { if (a.holder) holder[id] = a.holder.id; });
    const busyOf = (id) => (holder[id] ? busy[holder[id]] || 0 : busy[id] || 0);
    let prevStart = 0, prevEnd = 0; const evs = [];
    const refs = (a) => {
      if ('move' in a) return [a.move, ...(a.with || [])]; if ('vehicle' in a) return [a.vehicle, ...(a.carry || [])];
      if ('spawn' in a) return [a.spawn]; if ('attach' in a) return [a.attach, a.to]; if ('detach' in a) return [a.detach];
      if ('say' in a) return [a.say]; if ('status' in a) return [a.status]; if ('phone' in a) return [a.phone]; if ('asset' in a) return [a.asset]; if ('despawn' in a) return [a.despawn];
      return [];
    };
    (st.actions || []).forEach((a) => {
      const r = refs(a); const eb = Math.max(0, ...r.map(busyOf));
      const motion = 'move' in a || 'vehicle' in a || 'spawn' in a || 'attach' in a || 'detach' in a;
      const T = motion ? Math.max(prevStart, eb) : Math.max(prevEnd, eb);
      let dur = 'phone' in a || 'alert' in a ? 0.55 : BEAT, payload = null;
      if ('move' in a) {
        const from = sim[a.move] || (ac.get(a.move) && ac.get(a.move).loc);
        let pts = []; let cur = from;
        if (from) [...(a.via || []), a.to].forEach((dest) => { const p = MSK.nav.path(cur, dest, a.mode || 'walk'); if (p) pts = pts.concat(pts.length ? p.slice(1) : p); cur = dest; });
        const len = pts.length > 1 ? MSK.nav.length(pts) : 0;
        dur = Math.max(0.8, len / WALK_V) + (a.via ? a.via.length * 0.9 : 0); payload = pts;
        sim[a.move] = a.to; (a.with || []).forEach((c) => (sim[c] = a.to));
      } else if ('vehicle' in a) {
        const from = a.from || sim[a.vehicle];
        const pts = from ? MSK.nav.path(from, a.to, 'drive') : null;
        dur = pts ? Math.max(1.5, MSK.nav.length(pts) / VEH_V) : 1; payload = pts;
        sim[a.vehicle] = a.to; (a.carry || []).forEach((p) => (sim[p] = a.to));
      } else if ('spawn' in a) sim[a.spawn] = a.at;
      else if ('asset' in a) sim[a.asset] = a.at;
      else if ('attach' in a) holder[a.attach] = a.to;
      else if ('detach' in a) { delete holder[a.detach]; sim[a.detach] = a.at; }
      const E = T + dur;
      r.forEach((id) => { if (!holder[id]) busy[id] = Math.max(busy[id] || 0, E); });
      if ('attach' in a) busy[a.attach] = E;
      evs.push({ T, dur, a, payload });
      prevStart = T; prevEnd = E;
    });
    const natural = evs.reduce((m, e) => Math.max(m, e.T + e.dur), 0);
    const base = st.duration || 7;
    const eff = Math.max(base, Math.min(natural * 1.08 + 1.2, base * 1.5));
    const scale = Math.min(1, (eff - 1.0) / (natural || 1));
    S.events = evs.map((e) => ({ ...e, T: e.T * scale, dur: e.dur * scale, done: false })).sort((x, y) => x.T - y.T);
    S.dur = eff;
    applyFocus(st);
    tweenClock(st.clock);
    MSK.bus.emit('director:step', { idx: i, step: st, S });
  }

  function runTimed(e) {
    const a = e.a, ac = AC(), fx = FX();
    if ('move' in a) {
      const act = ac.get(a.move); if (!act) return;
      const pts = e.payload; if (!pts || pts.length < 2) { ac.place(a.move, a.to); return; }
      let path = null;
      if (a.wayfind) path = fx.wayfind(pts, { color: 0x3b82f6 });
      ac.moveAlong(a.move, pts, e.dur, { toKey: a.to, onDone: () => { if (path) fx.endPath(path, 2.5); } });
      (a.with || []).forEach((c, k) => { if (!ac.get(c)) return; ac.setHidden(c, false); ac.moveAlong(c, pts, e.dur * 1.02, { toKey: a.to, lateral: [1.3 * (k + 1), 0.9], delay: 0.05 }); });
    } else if ('vehicle' in a) {
      const v = ac.ensure(a.vehicle, { type: 'vehicle', kind: a.kind, label: a.label });
      if (a.from) ac.place(v.id, a.from, { type: 'vehicle' });
      (a.carry || []).forEach((p) => { ac.ensure(p); ac.setHidden(p, true); });
      if (!e.payload) { arriveVehicle(v, a); return; }
      ac.setHidden(v.id, false);
      ac.moveAlong(v.id, e.payload, e.dur, { toKey: a.to, onDone: () => arriveVehicle(v, a) });
    } else if ('phone' in a) { (S.phones[a.phone] = S.phones[a.phone] || []).push(a); MSK.bus.emit('ui:phone', { a, S }); }
    else if ('alert' in a) { MSK.bus.emit('ui:alert', a); if (a.at) fx.pulse(a.at, a.level === 'crit' ? 'incident' : a.level === 'warn' ? 'warn' : a.level === 'ok' ? 'ok' : 'info'); }
    else if ('packet' in a) fx.packet(a.packet, a.tech, a.to);
    else if ('say' in a) ac.say(a.say, a.text);
    else if ('timer' in a) MSK.bus.emit('ui:timer', a);
    else if ('kpi' in a) { S.kpis[a.kpi.label] = a.kpi; MSK.bus.emit('ui:kpi', { kpis: S.kpis }); }
    else if ('cascade' in a) { Object.assign(S.cascade, a.cascade); MSK.bus.emit('ui:cascade', { state: S.cascade }); }
    else runInstant(a);
  }

  // ---------------------------------------------------------------- focus & clock
  function levelAt(p) {
    for (const b of MSK.campus.buildings) {
      if (p.x < b.x0 - 1 || p.x > b.x1 + 1 || p.z < b.z0 - 1 || p.z > b.z1 + 1) continue;
      let best = null; b.levels.forEach((L) => { if (p.y >= L.y - 1 && p.y < L.y + b.floorH - 0.5) best = L; });
      if (best && !(best.n === 1 && p.y < 0.5 && (p.x < best.rect.x0 || p.x > best.rect.x1 || p.z < best.rect.z0 || p.z > best.rect.z1))) return { b: b.id, level: best.n };
    }
    return null;
  }
  D.levelAt = levelAt;
  let followId = null, lvlPending = null, lvlT = 0, pendingFocus = null;
  function applyFocus(st) {
    const f = st.focus; const w = W(); followId = null; w.follow = null; pendingFocus = null;
    if (!f) return;
    if (f.campus) { w.home(); return; }
    if (f.building) { w.clearFocus(); const b = MSK.campus.buildingMap[f.building]; w.flyTo({ x: (b.x0 + b.x1) / 2, y: b.height / 2, z: (b.z0 + b.z1) / 2 }, f.dist || 320); return; }
    if (f.actor) {
      const a = AC().get(f.actor);
      if (!a || !a.group.visible) { pendingFocus = f; return; }
      const target = a.pos;
      const lv = levelAt(target); if (lv) w.focusLevel(lv.b, lv.level); else w.clearFocus();
      w.flyTo(target, f.dist || (lv ? 95 : 130), { polar: lv ? 0.82 : 0.9 });
      D.follow(f.actor);
      return;
    }
    const key = typeof f === 'string' ? f : f.loc; const l = MSK.loc(key); if (!l) return;
    if (l.b) { w.focusLevel(l.b, l.level); w.flyTo({ x: l.x, y: l.y, z: l.z }, f.dist || (l.kind === 'level' ? 150 : 90), { polar: 0.82 }); }
    else { w.clearFocus(); w.flyTo({ x: l.x, y: 0, z: l.z }, f.dist || 140, { polar: 0.95 }); }
  }
  let clockTw = null;
  function tweenClock(to) {
    if (to == null) return; const from = W().clockMin ?? to; let delta = to - from; if (delta < 0) delta += 1440; if (delta > 720 && delta < 1440 && to < from) delta = to - from + 1440;
    clockTw = { from, delta, t: 0 };
  }

  // ---------------------------------------------------------------- tick
  D.tick = function (dt) {
    if (clockTw) { clockTw.t = Math.min(1, clockTw.t + dt / 2.2); W().setClock(clockTw.from + clockTw.delta * MSK.util.smooth(clockTw.t)); if (clockTw.t >= 1) clockTw = null; }
    trackFollow(dt);
    if (!S) return;
    if (pendingFocus) { const a = AC().get(pendingFocus.actor); if (a && a.group.visible) { const f = pendingFocus; pendingFocus = null; applyFocus({ focus: f }); } }
    if (!playing) return;
    S.t += dt * speed;
    S.events.forEach((e) => { if (!e.done && S.t >= e.T) { e.done = true; try { runTimed(e); } catch (err) { console.error('[director]', err, e.a); } } });
    MSK.bus.emit('director:tick', { t: S.t, dur: S.dur, idx: S.idx });
    if (S.t >= S.dur) {
      if (S.idx < S.steps.length - 1) { if (D.autoAdvance !== false) startStep(S.idx + 1); else { playing = false; MSK.bus.emit('director:play', false); } }
      else { playing = false; S.t = S.dur; MSK.bus.emit('director:play', false); MSK.bus.emit('director:end', S); }
    }
  };
  // follow an actor with the camera, switching the cutaway floor as they change levels
  D.follow = function (id) {
    followId = id; const w = W();
    w.follow = () => { const x = AC().get(followId); return x && x.group.visible ? x.pos : null; };
  };
  D.stopFollow = () => { followId = null; W().follow = null; };
  function trackFollow(dt) {
    if (followId && !W().follow) followId = null; // user dragged the camera
    if (followId) {
      const a = AC().get(followId);
      if (a && a.group.visible) {
        const lv = levelAt(a.pos); const key = lv ? lv.b + '/' + lv.level : 'out';
        const curKey = W().focus.b ? W().focus.b + '/' + W().focus.level : 'out';
        if (key !== curKey) { if (lvlPending !== key) { lvlPending = key; lvlT = 0; } lvlT += dt; if (lvlT > 0.35) { if (lv) W().focusLevel(lv.b, lv.level); else W().clearFocus(); lvlPending = null; } }
      }
    }
  }
  D.autoAdvance = true;
})();
