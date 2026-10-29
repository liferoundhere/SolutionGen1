/* Visual effects: Cloud Control hub & Splunk layer, data packets, blue-dot wayfinding paths, incident markers, AI sites, Spaces fabric. */
(function () {
  const MSK = (window.MSK = window.MSK || {});
  const FX = (MSK.fx = { markers: new Map(), paths: [], packets: [] });
  let THREE, W, scene;
  const HUB = { x: -235, y: 190, z: -110 };
  FX.HUB = HUB;

  FX.init = function () {
    THREE = window.THREE; W = MSK.world; scene = W.scene;
    buildHub(); buildFabric(); buildAISites();
    W.ticks.push(update);
    setInterval(() => { if (W.overlay.flows && !document.hidden) ambientPacket(); }, 380);
  };

  // ---------------------------------------------------------------- hub
  function buildHub() {
    const g = new THREE.Group(); g.position.set(HUB.x, HUB.y, HUB.z); scene.add(g); FX.hub = g;
    const cyan = 0x00bceb;
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(9, 1), new THREE.MeshBasicMaterial({ color: cyan, wireframe: true, transparent: true, opacity: 0.9 }));
    const coreIn = new THREE.Mesh(new THREE.IcosahedronGeometry(5.5, 0), new THREE.MeshBasicMaterial({ color: 0x7ae5ff }));
    g.add(core, coreIn); FX.core = core;
    FX.rings = [26, 38, 52].map((r, i) => { const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.45, 8, 96), new THREE.MeshBasicMaterial({ color: cyan, transparent: true, opacity: 0.75 - i * 0.18 })); m.rotation.x = Math.PI / 2 + (i - 1) * 0.22; m.rotation.y = i * 0.6; g.add(m); return m; });
    // orbiting nodes = connected domains
    const domains = ['Network', 'Security', 'Observability', 'Collaboration', 'Compute', 'IoT', 'AI'];
    FX.orbit = domains.map((d, i) => { const s = new THREE.Mesh(new THREE.SphereGeometry(1.8, 12, 8), new THREE.MeshBasicMaterial({ color: 0xbff4ff })); g.add(s); return { s, a: (i / domains.length) * Math.PI * 2, r: 38, name: d }; });
    const lbl = W.css2d('<b>CISCO CLOUD CONTROL</b><small>Orchestration · AI Canvas · AgenticOps</small>', 'lbl lbl-hub'); lbl.position.set(0, 26, 0); g.add(lbl);
    lbl.userData.el.addEventListener('click', (e) => { e.stopPropagation(); MSK.bus.emit('pick:tech', { id: 'cloud-control' }); });
    // Splunk data layer
    const sp = new THREE.Group(); sp.position.set(HUB.x, HUB.y - 34, HUB.z); scene.add(sp); FX.splunk = sp;
    const hexGeo = new THREE.CircleGeometry(78, 6);
    const hex = new THREE.Mesh(hexGeo, new THREE.MeshBasicMaterial({ color: 0xff5ca8, transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false })); hex.rotation.x = -Math.PI / 2; sp.add(hex);
    const hexL = new THREE.LineSegments(new THREE.EdgesGeometry(hexGeo), new THREE.LineBasicMaterial({ color: 0xff5ca8, transparent: true, opacity: 0.8 })); hexL.rotation.x = -Math.PI / 2; sp.add(hexL);
    const grid = new THREE.PolarGridHelper(76, 6, 6, 64, 0xff5ca8, 0xff5ca8); grid.material.transparent = true; grid.material.opacity = 0.18; sp.add(grid);
    const sl = W.css2d('<b>SPLUNK · DATA LAYER</b><small>Cisco Data Fabric · ITSI · Observability · ES</small>', 'lbl lbl-splunk'); sl.position.set(70, 0, 30); sp.add(sl);
    sl.userData.el.addEventListener('click', (e) => { e.stopPropagation(); MSK.bus.emit('pick:tech', { id: 'splunk' }); });
    FX.splunkHex = hexL;
    // tethers to MSK buildings
    const pts = [];
    MSK.campus.buildings.forEach((b) => { const cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2; pts.push(cx, b.height + 2, cz, HUB.x, HUB.y - 34, HUB.z); });
    const tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    FX.tethers = new THREE.LineSegments(tg, new THREE.LineDashedMaterial({ color: 0x38bdf8, dashSize: 4, gapSize: 6, transparent: true, opacity: 0.35 }));
    FX.tethers.computeLineDistances(); scene.add(FX.tethers);
  }

  // ---------------------------------------------------------------- Spaces fabric (AP constellation across all MSK floors)
  function buildFabric() {
    const pos = [];
    MSK.campus.buildings.forEach((b) => b.levels.forEach((L) => { if (L.n < 1) return; for (let x = L.rect.x0 + 8; x < L.rect.x1 - 4; x += 16) pos.push(x, L.y + b.floorH - 0.8, L.zc); L.rooms.forEach((r) => { if (r.x1 - r.x0 > 14) pos.push(r.cx, L.y + b.floorH - 0.8, r.cz); }); }));
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    FX.fabric = new THREE.Points(g, new THREE.PointsMaterial({ color: 0x6aa8ff, size: 3.2, sizeAttenuation: false, transparent: true, opacity: 0.9, depthTest: false }));
    FX.fabric.renderOrder = 5; FX.fabric.visible = false; scene.add(FX.fabric);
    FX.apCount = pos.length / 3;
    // outdoor Spaces zones (curbs, transit, garage)
    FX.zones = new THREE.Group(); FX.zones.visible = false; scene.add(FX.zones);
    Object.values(MSK.campus.outdoor).filter((o) => ['curb', 'transit', 'garage'].includes(o.kind)).forEach((o) => {
      const d = W.roomData(o.key);
      const lb = W.css2d(`<i style="background:#4f8cff"></i><span>${MSK.util.esc(o.label.split(' · ')[0])} · ${d.people} now</span>`, 'lbl lbl-marker k-asset');
      lb.position.set(o.x, 6, o.z); lb.userData.el.style.pointerEvents = 'auto'; lb.userData.el.style.cursor = 'pointer';
      lb.userData.el.addEventListener('click', (e) => { e.stopPropagation(); MSK.bus.emit('pick:room', { key: o.key }); });
      const ring = new THREE.Mesh(new THREE.RingGeometry(5, 6, 40), new THREE.MeshBasicMaterial({ color: 0x4f8cff, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2; ring.position.set(o.x, 0.4, o.z);
      FX.zones.add(lb, ring);
    });
    const syncZones = () => { FX.zones.visible = W.overlay.spaces && !W.focus.b; };
    MSK.bus.on('overlay', ({ k, v }) => { if (k === 'spaces') { FX.fabric.visible = v && !W.focus.b; syncZones(); } if (k === 'ai') FX.aiGroup.visible = v; if (k === 'flows') { FX.tethers.visible = v; } });
    MSK.bus.on('focus:level', ({ b }) => { FX.fabric.visible = W.overlay.spaces && !b; syncZones(); });
  }

  // ---------------------------------------------------------------- AI sites
  function buildAISites() {
    FX.aiGroup = new THREE.Group(); scene.add(FX.aiGroup);
    (MSK.aiSites || []).forEach((s) => {
      const p = W.posOf(s.at); if (!p) { console.warn('[ai] bad site', s.at); return; }
      const o = W.css2d(`<i>AI</i><span>${MSK.util.esc(s.short || s.name)}</span>`, 'lbl lbl-ai');
      o.position.set(p.x, p.y + 6, p.z);
      o.userData.el.addEventListener('click', (e) => { e.stopPropagation(); MSK.bus.emit('pick:ai', { id: s.id }); });
      o.userData.site = s; FX.aiGroup.add(o);
    });
    // aggregate chip per building for the exterior view
    const byB = {};
    (MSK.aiSites || []).forEach((s) => { const l = MSK.loc(s.at); if (l && l.b) (byB[l.b] = byB[l.b] || []).push(s); });
    FX.aiAgg = [];
    Object.entries(byB).forEach(([bid, list]) => {
      const b = MSK.campus.buildingMap[bid];
      const o = W.css2d(`<i>AI</i><span>${list.length} AI system${list.length > 1 ? 's' : ''}</span>`, 'lbl lbl-ai');
      o.position.set(b.x1 + 4, Math.min(b.height * 0.55, 60), b.z1 + 4);
      o.userData.agg = bid;
      o.userData.el.addEventListener('click', (e) => { e.stopPropagation(); MSK.bus.emit('pick:ai-building', { b: bid }); });
      FX.aiGroup.add(o); FX.aiAgg.push(o);
    });
    // individual chips only on the focused level; aggregates only outside
    MSK.bus.on('focus:level', ({ b, level }) => {
      FX.aiGroup.children.forEach((o) => {
        if (o.userData.agg) { o.visible = !b; return; }
        const l = MSK.loc(o.userData.site.at); o.visible = !!(b && l && l.b === b && l.level === level);
      });
    });
    MSK.bus.emit('focus:level', { b: null });
  }

  // ---------------------------------------------------------------- packets
  const _v = () => new THREE.Vector3();
  function arcPoints(a, b, lift) {
    const mid = a.clone().add(b).multiplyScalar(0.5); mid.y = Math.max(a.y, b.y) + lift;
    return new THREE.QuadraticBezierCurve3(a, mid, b);
  }
  FX.packet = function (fromKey, tech, toKey) {
    const p = W.posOf(fromKey); if (!p) return;
    const color = new THREE.Color(MSK.techColor(tech || 'splunk'));
    launch(p.clone().setY(p.y + 3), new THREE.Vector3(HUB.x, HUB.y, HUB.z), color, 1.5, () => {
      FX.pulseHub(color);
      if (toKey) { const q = W.posOf(toKey); if (q) launch(new THREE.Vector3(HUB.x, HUB.y - 30, HUB.z), q.clone().setY(q.y + 3), new THREE.Color(0x00bceb), 1.3); }
    }, 1);
  };
  function launch(a, b, color, dur, onDone, size = 0.6) {
    const curve = arcPoints(a, b, 40 + a.distanceTo(b) * 0.12);
    const head = new THREE.Mesh(new THREE.SphereGeometry(size * 1.6, 10, 8), new THREE.MeshBasicMaterial({ color, transparent: true, depthTest: false }));
    head.renderOrder = 997; scene.add(head);
    const pts = curve.getPoints(40);
    const lg = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.Line(lg, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.0 })); scene.add(line);
    FX.packets.push({ curve, head, line, t: 0, dur, onDone });
  }
  function ambientPacket() {
    if (FX.packets.length > 60) return;
    const r = Math.random(); const b = MSK.campus.buildings[Math.floor(r * MSK.campus.buildings.length)];
    const L = b.levels[Math.floor(Math.random() * b.levels.length)]; if (L.n < 1) return;
    const room = L.rooms[Math.floor(Math.random() * L.rooms.length)];
    const techs = ['spaces', 'splunk', 'thousandeyes', 'meraki-mt', 'webex-cc', 'ise', 'wifi7', 'meraki-mv'];
    const color = new THREE.Color(MSK.techColor(techs[Math.floor(Math.random() * techs.length)]));
    const a = new THREE.Vector3(room.cx, L.y + 2, room.cz); const bb = new THREE.Vector3(HUB.x, HUB.y - 34, HUB.z);
    launch(a, bb, color, 2.2 + Math.random(), null, 0.32);
  }
  FX.pulseHub = function (color) { FX.hubPulse = 1; if (color) FX.core.material.color.copy(color); };

  // ---------------------------------------------------------------- wayfinding path (blue dot route)
  const pathVS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }';
  const pathFS = `uniform float t; uniform float len; uniform vec3 col; uniform float fade; varying vec2 vUv;
    void main(){ float d = vUv.x * len; float s = fract((d - t*14.0) / 6.0); float dash = smoothstep(0.0,0.15,s)*smoothstep(0.65,0.5,s);
    float a = (0.35 + dash*0.65) * fade; gl_FragColor = vec4(col*(0.8+dash*0.8), a); }`;
  FX.wayfind = function (pts, opts = {}) {
    if (!pts || pts.length < 2) return null;
    const P = pts.map((p) => new THREE.Vector3(p.x, p.y + 0.35, p.z));
    // dedupe & build polyline curve
    const clean = [P[0]]; P.forEach((p) => { if (p.distanceTo(clean[clean.length - 1]) > 0.3) clean.push(p); });
    if (clean.length < 2) return null;
    const curve = new THREE.CatmullRomCurve3(clean, false, 'catmullrom', 0.05);
    let len = 0; for (let i = 1; i < clean.length; i++) len += clean[i].distanceTo(clean[i - 1]);
    const geo = new THREE.TubeGeometry(curve, Math.min(900, Math.max(40, Math.floor(len / 1.2))), opts.radius || 0.55, 6, false);
    const u = { t: { value: 0 }, len: { value: len }, col: { value: new THREE.Color(opts.color || 0x3b82f6) }, fade: { value: 1 } };
    const mesh = new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms: u, vertexShader: pathVS, fragmentShader: pathFS, transparent: true, depthWrite: false, depthTest: false }));
    mesh.renderOrder = 990; scene.add(mesh);
    const pin = new THREE.Group(); const end = clean[clean.length - 1];
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.6, 16), new THREE.MeshBasicMaterial({ color: u.col.value, depthTest: false, transparent: true })); cone.rotation.x = Math.PI; cone.position.y = 3.2; cone.renderOrder = 991; pin.add(cone);
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.6, 32), new THREE.MeshBasicMaterial({ color: u.col.value, transparent: true, depthTest: false, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.renderOrder = 991; pin.add(ring);
    pin.position.copy(end); scene.add(pin);
    const rec = { mesh, pin, u, ring, life: opts.life ?? 999, fadeOut: false };
    FX.paths.push(rec); return rec;
  };
  FX.endPath = function (rec, delay = 2.5) { if (rec) rec.life = delay; };
  FX.clearPaths = function () { FX.paths.forEach((p) => { scene.remove(p.mesh, p.pin); p.mesh.geometry.dispose(); }); FX.paths = []; };

  // ---------------------------------------------------------------- markers
  const MCOL = { incident: 0xf87171, warn: 0xfbbf24, asset: 0x4f8cff, ok: 0x34d399, info: 0x22d3ee, weather: 0x93c5fd, crit: 0xef4444 };
  FX.marker = function (id, key, kind = 'info', label, ttl) {
    FX.clearMarker(id);
    const p = W.posOf(key); if (!p) return;
    const col = MCOL[kind] || MCOL.info; const g = new THREE.Group(); g.position.copy(p);
    const ring = new THREE.Mesh(new THREE.RingGeometry(2.2, 2.9, 40), new THREE.MeshBasicMaterial({ color: col, transparent: true, side: THREE.DoubleSide, depthTest: false }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.3; ring.renderOrder = 995; g.add(ring);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.6, 60, 16, 1, true), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide }));
    beam.position.y = 30; g.add(beam);
    if (label) { const l = W.css2d(`<i style="background:#${col.toString(16).padStart(6, '0')}"></i><span>${MSK.util.esc(label)}</span>`, 'lbl lbl-marker k-' + kind); l.position.y = 9; g.add(l); }
    scene.add(g); FX.markers.set(id, { g, ring, beam, t: 0, ttl });
  };
  FX.clearMarker = function (id) { const m = FX.markers.get(id); if (m) { W.dropLabels(m.g); scene.remove(m.g); FX.markers.delete(id); } };
  FX.clearMarkers = function () { Array.from(FX.markers.keys()).forEach(FX.clearMarker); };
  let pulseN = 0;
  FX.pulse = function (key, kind) { FX.marker('pulse' + pulseN++, key, kind || 'info', null, 4); };

  // ---------------------------------------------------------------- tick
  function update(dt, time) {
    const sp = MSK.director ? MSK.director.speed() : 1;
    if (FX.hub) {
      FX.rings.forEach((r, i) => { r.rotation.z += dt * (0.25 + i * 0.12) * (i % 2 ? -1 : 1); });
      FX.core.rotation.y += dt * 0.4; FX.core.rotation.x += dt * 0.2;
      FX.orbit.forEach((o, i) => { o.a += dt * 0.35; o.s.position.set(Math.cos(o.a) * o.r, Math.sin(o.a * 2 + i) * 4, Math.sin(o.a) * o.r); });
      if (FX.hubPulse > 0) { FX.hubPulse -= dt * 1.5; const s = 1 + Math.max(0, FX.hubPulse) * 0.5; FX.core.scale.setScalar(s); } else FX.core.material.color.lerp(new THREE.Color(0x00bceb), dt * 2);
      FX.splunkHex.rotation.z += dt * 0.05;
      FX.tethers.material.dashOffset = -time * 8;
    }
    for (let i = FX.packets.length - 1; i >= 0; i--) {
      const k = FX.packets[i]; k.t += (dt * Math.max(1, sp)) / k.dur;
      const tt = Math.min(1, k.t); k.head.position.copy(k.curve.getPoint(tt));
      k.line.material.opacity = Math.sin(tt * Math.PI) * 0.35;
      if (k.t >= 1) { scene.remove(k.head, k.line); k.head.geometry.dispose(); k.line.geometry.dispose(); FX.packets.splice(i, 1); if (k.onDone) k.onDone(); }
    }
    for (let i = FX.paths.length - 1; i >= 0; i--) {
      const p = FX.paths[i]; p.u.t.value = time; const s = 1 + Math.sin(time * 4) * 0.15; p.ring.scale.set(s, s, s);
      if (p.life < 900) { p.life -= dt; p.u.fade.value = Math.max(0, Math.min(1, p.life / 1.5)); if (p.life <= 0) { scene.remove(p.mesh, p.pin); p.mesh.geometry.dispose(); FX.paths.splice(i, 1); } }
    }
    FX.markers.forEach((m, id) => {
      m.t += dt; const s = 1 + (m.t * 0.8 % 1) * 1.4; m.ring.scale.set(s, s, s); m.ring.material.opacity = 1 - (m.t * 0.8 % 1);
      if (m.ttl != null && m.t > m.ttl) FX.clearMarker(id);
    });
  }
})();
