/* Actors: people, robots, vehicles and tagged assets, plus ambient pedestrians & traffic. */
(function () {
  const MSK = (window.MSK = window.MSK || {});
  const AC = (MSK.actors = { map: new Map() });
  let THREE, W, scene, beaconTex, tagTex;
  const PS = 1.55; // visual scale for people

  function radialTex(inner, outer) {
    const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, inner); gr.addColorStop(0.35, inner); gr.addColorStop(0.45, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.55, outer); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }

  AC.init = function () {
    THREE = window.THREE; W = MSK.world; scene = W.scene;
    beaconTex = radialTex('rgba(255,255,255,1)', 'rgba(255,255,255,0.25)');
    tagTex = radialTex('rgba(120,170,255,1)', 'rgba(79,140,255,0.3)');
    initAmbient();
    W.ticks.push(update);
  };

  // ---------------------------------------------------------------- meshes
  const lam = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
  function personMesh(p) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.85, 4, 10), lam(p.color));
    body.position.y = 0.75; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 10), lam(0xe9c9a8)); head.position.y = 1.55; g.add(head);
    if (p.kind === 'nurse' || p.kind === 'physician') { const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.08, 12), lam(p.kind === 'nurse' ? 0x6ee7b7 : 0x67e8f9)); cap.position.y = 1.76; g.add(cap); }
    if (p.kind === 'security') { const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.12, 12), lam(0x1f2937)); hat.position.y = 1.78; g.add(hat); }
    if (p.kind === 'patient') { const band = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.04, 6, 16), new THREE.MeshBasicMaterial({ color: 0x93c5fd })); band.rotation.x = Math.PI / 2; band.position.y = 0.95; g.add(band); }
    g.scale.setScalar(PS);
    return { group: g, body };
  }
  function robotMesh() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 1.0, 16), lam(0xe5e7eb)); body.position.y = 0.55; g.add(body);
    const lid = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), lam(0xcbd5e1)); lid.position.y = 1.05; g.add(lid);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.05, 6, 20), new THREE.MeshBasicMaterial({ color: 0x22d3ee })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.85; g.add(ring);
    g.scale.setScalar(PS); return { group: g, body };
  }
  const VEH = {
    car: { len: 4.6, w: 1.9, h: 1.3, color: 0x334a7a }, rideshare: { len: 4.8, w: 1.9, h: 1.4, color: 0x111827, light: 0x22c55e },
    ambulance: { len: 6.6, w: 2.4, h: 2.6, color: 0xf8fafc, light: 0xef4444, stripe: 0xef4444 }, courier: { len: 1.9, w: 0.7, h: 1.2, color: 0x16a34a, bike: true },
    truck: { len: 8, w: 2.5, h: 3.2, color: 0xe5e7eb }, police: { len: 4.9, w: 2, h: 1.5, color: 0x1e3a8a, light: 0x3b82f6 }, plow: { len: 7.5, w: 2.6, h: 3, color: 0xf97316, blade: true },
  };
  function vehicleMesh(kind) {
    const v = VEH[kind] || VEH.car; const g = new THREE.Group(); let light = null;
    if (v.bike) {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(v.len, 0.5, 0.15), lam(0x1f2937)); frame.position.y = 0.6; g.add(frame);
      [-0.7, 0.7].forEach((x) => { const wh = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.07, 6, 16), lam(0x111827)); wh.position.set(x, 0.35, 0); g.add(wh); });
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), lam(0x16a34a)); box.position.set(-0.6, 1.6, 0); g.add(box);
      const rider = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.7, 4, 8), lam(0x84cc16)); rider.position.set(0, 1.35, 0); g.add(rider);
    } else {
      const body = new THREE.Mesh(new THREE.BoxGeometry(v.len, v.h * 0.55, v.w), lam(v.color)); body.position.y = v.h * 0.3 + 0.25; g.add(body);
      const cab = new THREE.Mesh(new THREE.BoxGeometry(v.len * (kind === 'ambulance' || kind === 'truck' ? 0.95 : 0.55), v.h * 0.45, v.w * 0.92), lam(kind === 'ambulance' || kind === 'truck' ? v.color : 0x0f172a)); cab.position.set(kind === 'ambulance' || kind === 'truck' ? 0 : -v.len * 0.05, v.h * 0.78 + 0.25, 0); g.add(cab);
      if (v.stripe) { const s = new THREE.Mesh(new THREE.BoxGeometry(v.len * 1.01, 0.25, v.w * 1.01), new THREE.MeshBasicMaterial({ color: v.stripe })); s.position.y = v.h * 0.45; g.add(s); }
      if (v.blade) { const bl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.1, v.w * 1.5), lam(0x9ca3af)); bl.position.set(v.len / 2 + 0.5, 0.6, 0); bl.rotation.y = 0.35; g.add(bl); }
      [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => { const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.3, 12), lam(0x0b0f17)); wh.rotation.x = Math.PI / 2; wh.position.set(sx * v.len * 0.32, 0.36, sz * v.w * 0.5); g.add(wh); }));
      if (v.light) { light = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.25, v.w * 0.6), new THREE.MeshBasicMaterial({ color: v.light })); light.position.set(0, v.h + 0.35, 0); g.add(light); }
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.25, v.w * 0.8), new THREE.MeshBasicMaterial({ color: 0xfff4d6 })); hl.position.set(v.len / 2 + 0.02, v.h * 0.35 + 0.25, 0); g.add(hl);
    }
    g.scale.setScalar(1.25);
    return { group: g, light, flash: kind === 'ambulance' || kind === 'police' };
  }
  const ASSET = {
    cart: [0x2563eb, 1.0, 1.0, 0.6], pump: [0xf1f5f9, 0.4, 1.7, 0.4], wheelchair: [0x334155, 0.7, 1.0, 0.7], ultrasound: [0xe2e8f0, 0.7, 1.4, 0.6], vent: [0x0ea5e9, 0.6, 1.3, 0.6],
    bed: [0xe5e7eb, 1.0, 0.7, 2.1], bag: [0xc08a50, 0.5, 0.45, 0.25], tray: [0xf8fafc, 0.55, 0.12, 0.4], crashcart: [0xdc2626, 0.9, 1.1, 0.6], 'robot-uv': [0xa855f7, 0.7, 1.7, 0.7],
    scanner: [0xf1f5f9, 0.6, 1.2, 0.5], box: [0xa3a3a3, 0.6, 0.6, 0.6], fridge: [0xf8fafc, 0.9, 1.9, 0.8],
  };
  function assetMesh(kind) {
    const a = ASSET[kind] || ASSET.box; const g = new THREE.Group();
    const m = new THREE.Mesh(new THREE.BoxGeometry(a[1], a[2], a[3]), lam(a[0], kind === 'robot-uv' ? { emissive: 0x6d28d9, emissiveIntensity: 0.6 } : {}));
    m.position.y = a[2] / 2 + 0.02; g.add(m);
    if (kind === 'pump') { const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.2), lam(0x94a3b8)); pole.position.set(0, 1.1, 0.25); g.add(pole); }
    if (kind === 'ultrasound') { const sc = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.45, 0.05), new THREE.MeshBasicMaterial({ color: 0x38bdf8 })); sc.position.set(0, 1.65, 0); g.add(sc); }
    g.scale.setScalar(1.4);
    return { group: g, body: m };
  }

  // ---------------------------------------------------------------- create
  function makeBeacon(color, size = 0.02) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: beaconTex, color, depthTest: false, transparent: true, sizeAttenuation: false }));
    s.scale.set(size, size, 1); s.renderOrder = 999; return s;
  }
  function makeLabel(a, text, color) {
    const o = W.css2d(`<i style="background:${color}"></i><b>${MSK.util.esc(text)}</b><small></small>`, 'lbl lbl-actor');
    o.userData.el.addEventListener('click', (e) => { e.stopPropagation(); MSK.bus.emit(a.type === 'asset' ? 'pick:asset' : 'pick:actor', { id: a.id }); });
    return o;
  }
  AC.ensure = function (id, opts = {}) {
    if (AC.map.has(id)) return AC.map.get(id);
    const p = MSK.people[id]; let a;
    if (opts.type === 'vehicle') {
      const m = vehicleMesh(opts.kind || 'car');
      a = { id, type: 'vehicle', kind: opts.kind, name: opts.label || id, group: m.group, light: m.light, flash: m.flash, passengers: [] };
      a.beacon = makeBeacon(new THREE.Color(0xcbd5e1), 0.014); a.beacon.position.y = 6; a.group.add(a.beacon);
      a.label = makeLabel(a, opts.label || id, '#cbd5e1'); a.label.position.y = 7; a.group.add(a.label);
    } else if (opts.type === 'asset') {
      const m = assetMesh(opts.kind);
      a = { id, type: 'asset', kind: opts.kind, name: opts.label || id, group: m.group, tagged: !!opts.tag };
      m.body.userData = { pick: 'asset', asset: id }; W.pickables.push(m.body);
      if (opts.tag) { a.beacon = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagTex, color: 0x4f8cff, depthTest: false, transparent: true, sizeAttenuation: false })); a.beacon.scale.set(0.022, 0.022, 1); a.beacon.renderOrder = 998; a.beacon.position.y = 2.4; a.group.add(a.beacon); }
      a.label = makeLabel(a, opts.label || id, '#4f8cff'); a.label.position.y = 3.2; a.group.add(a.label);
    } else {
      if (!p) { console.warn('[actors] unknown person', id); return null; }
      const m = p.kind === 'robot' ? robotMesh() : personMesh(p);
      a = { id, type: 'person', kind: p.kind, name: p.name, person: p, group: m.group };
      m.body.userData = { pick: 'actor', actor: id }; W.pickables.push(m.body);
      a.beacon = makeBeacon(new THREE.Color(p.color), 0.02); a.beacon.position.y = 2.6; a.group.add(a.beacon);
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.75, 24), new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2; ring.position.y = 0.05; a.group.add(ring); a.ring = ring;
      a.label = makeLabel(a, p.name.replace(/, RN$/, ''), p.color); a.label.position.y = 2.75; a.group.add(a.label);
    }
    a.pos = new THREE.Vector3(); a.group.visible = false; a.attached = []; a.yaw = 0;
    scene.add(a.group); AC.map.set(id, a); return a;
  };
  AC.get = (id) => AC.map.get(id);
  AC.setStatus = function (id, text) { const a = AC.map.get(id); if (!a) return; a.status = text; const s = a.label.userData.el.querySelector('small'); if (s) s.textContent = text || ''; };
  AC.say = function (id, text, secs = 5) {
    const a = AC.map.get(id); if (!a || !a.group.visible) return;
    if (a.bubble) { a.group.remove(a.bubble); a.bubble = null; }
    const b = W.css2d(`<span>${MSK.util.esc(text)}</span>`, 'lbl lbl-bubble'); b.position.y = a.type === 'person' ? 4.1 : 5; a.group.add(b); a.bubble = b;
    a.bubbleT = secs;
  };

  // slot offsets so people at the same place don't overlap
  const slots = new Map();
  function slotOffset(key, id) {
    if (!slots.has(key)) slots.set(key, []);
    const arr = slots.get(key); slots.forEach((v, k) => { if (k !== key) { const i = v.indexOf(id); if (i >= 0) v.splice(i, 1); } });
    let i = arr.indexOf(id); if (i < 0) { arr.push(id); i = arr.length - 1; }
    if (i === 0) return [0, 0]; const ang = i * 2.1, r = 1.6 + Math.floor(i / 3) * 1.2; return [Math.cos(ang) * r, Math.sin(ang) * r];
  }
  AC.place = function (id, key, opts = {}) {
    const a = AC.map.get(id) || AC.ensure(id, opts); if (!a) return null;
    const p = W.posOf(key); if (!p) { console.warn('[actors] bad loc', key); return a; }
    const [ox, oz] = a.type === 'vehicle' ? [0, 0] : slotOffset(key, id);
    a.pos.set(p.x + ox, p.y, p.z + oz); a.group.position.copy(a.pos); a.loc = key; a.path = null; a.group.visible = !a.hidden;
    syncAttached(a);
    return a;
  };
  AC.remove = function (id) {
    const a = AC.map.get(id); if (!a) return;
    a.attached.slice().forEach((c) => AC.detach(c.id));
    if (a.holder) AC.detach(id);
    W.dropLabels(a.group); scene.remove(a.group); AC.map.delete(id);
    slots.forEach((v) => { const i = v.indexOf(id); if (i >= 0) v.splice(i, 1); });
    W.pickables = W.pickables.filter((o) => !(o.userData && (o.userData.actor === id || o.userData.asset === id)));
  };
  AC.clear = function () { Array.from(AC.map.keys()).forEach(AC.remove); slots.clear(); };
  AC.setHidden = function (id, h) { const a = AC.map.get(id); if (!a) return; a.hidden = h; a.group.visible = !h; };

  // ---------------------------------------------------------------- attachment
  AC.attach = function (assetId, holderId) {
    const c = AC.map.get(assetId), h = AC.map.get(holderId); if (!c || !h) return;
    if (c.holder) AC.detach(assetId);
    c.holder = h; h.attached.push(c); syncAttached(h);
  };
  AC.detach = function (assetId, key) {
    const c = AC.map.get(assetId); if (!c) return;
    if (c.holder) { c.holder.attached = c.holder.attached.filter((x) => x !== c); c.holder = null; }
    if (key) AC.place(assetId, key);
  };
  function syncAttached(h) {
    h.attached.forEach((c, i) => {
      const ang = h.yaw + Math.PI / 2; const off = h.kind === 'robot' ? 0 : 1.1;
      c.pos.set(h.pos.x + Math.cos(h.yaw) * off * 0.6 + Math.cos(ang) * 0.6 * (i + 1), h.pos.y + (h.kind === 'robot' ? 1.7 : 0), h.pos.z - Math.sin(h.yaw) * off * 0.6 - Math.sin(ang) * 0.6 * (i + 1));
      c.group.position.copy(c.pos); c.group.visible = h.group.visible || c.holderVisible; c.loc = h.loc;
    });
  }

  // ---------------------------------------------------------------- movement
  function offsetLane(pts, d) {
    if (pts.length < 2) return pts;
    return pts.map((p, i) => {
      if (i === pts.length - 1 || i === 0) return p;
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      const dx = b.x - a.x, dz = b.z - a.z, L = Math.hypot(dx, dz) || 1;
      return { ...p, x: p.x - (dz / L) * d, z: p.z + (dx / L) * d };
    });
  }
  // move actor along precomputed points, taking `dur` seconds (playback time)
  AC.moveAlong = function (id, pts, dur, opts = {}) {
    const a = AC.map.get(id); if (!a || !pts || pts.length < 1) return;
    if (a.type === 'vehicle') pts = offsetLane(pts, -3.4);
    const P = pts.map((p) => new THREE.Vector3(p.x, p.y, p.z));
    if (opts.lateral) P.forEach((v, i) => { if (i > 0) { v.x += opts.lateral[0]; v.z += opts.lateral[1]; } });
    P[0] = a.pos.clone();
    const cum = [0]; for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + P[i].distanceTo(P[i - 1]));
    a.path = { P, cum, len: cum[cum.length - 1] || 0.001, t: 0, dur: Math.max(0.05, dur), delay: opts.delay || 0, onDone: opts.onDone };
    if (opts.toKey) a.loc = opts.toKey;
    a.group.visible = !a.hidden;
  };
  AC.finish = function (id) { const a = AC.map.get(id); if (a && a.path) { const P = a.path.P; a.pos.copy(P[P.length - 1]); a.group.position.copy(a.pos); const cb = a.path.onDone; a.path = null; syncAttached(a); if (cb) cb(); } };
  AC.finishAll = function () { AC.map.forEach((a) => AC.finish(a.id)); };

  function update(dt, time) {
    const speed = MSK.director ? MSK.director.speed() : 1;
    AC.map.forEach((a) => {
      if (a.path && !(MSK.director && MSK.director.paused())) {
        const pth = a.path;
        if (pth.delay > 0) { pth.delay -= dt * speed; }
        else {
          pth.t = Math.min(1, pth.t + (dt * speed) / pth.dur);
          const d = pth.t * pth.len; let i = 1; while (i < pth.cum.length - 1 && pth.cum[i] < d) i++;
          const seg = pth.cum[i] - pth.cum[i - 1] || 1, k = (d - pth.cum[i - 1]) / seg;
          const A0 = pth.P[i - 1], B0 = pth.P[i];
          a.pos.lerpVectors(A0, B0, Math.max(0, Math.min(1, k)));
          const dx = B0.x - A0.x, dz = B0.z - A0.z;
          if (Math.hypot(dx, dz) > 0.05) { const target = Math.atan2(-dz, dx); let diff = target - a.yaw; while (diff > Math.PI) diff -= Math.PI * 2; while (diff < -Math.PI) diff += Math.PI * 2; a.yaw += diff * Math.min(1, dt * 10); }
          a.group.position.copy(a.pos); a.group.rotation.y = a.yaw;
          if (a.type === 'person' && a.kind !== 'robot') a.group.children[0].position.y = 0.75 + Math.abs(Math.sin(time * 9)) * 0.06;
          syncAttached(a);
          if (pth.t >= 1) { const cb = pth.onDone; a.path = null; if (cb) cb(); }
        }
      }
      if (a.flash && a.light) a.light.material.color.setHex(Math.sin(time * 14) > 0 ? 0xef4444 : 0x3b82f6);
      if (a.ring) a.ring.material.opacity = 0.55 + Math.sin(time * 3) * 0.3;
      if (a.beacon && a.type === 'asset') { const s = 0.02 + Math.sin(time * 4) * 0.004; a.beacon.scale.set(s, s, 1); }
      if (a.bubble) { a.bubbleT -= dt; if (a.bubbleT <= 0) { a.group.remove(a.bubble); a.bubble = null; } }
    });
    updateAmbient(dt);
  }
  AC.labelsVisible = function (v) { AC.map.forEach((a) => { if (a.label) a.label.visible = v; }); };

  // ---------------------------------------------------------------- ambient pedestrians & traffic
  const amb = { peds: [], cars: [] };
  function initAmbient() {
    const walk = MSK.nav.walk, road = MSK.nav.road; const r = MSK.util.rng('ambient');
    const swNodes = Array.from(walk.nodes.values()).filter((n) => n.kind === 'sw');
    const rdNodes = Array.from(road.nodes.values()).filter((n) => n.kind === 'rd');
    const NP = 260, NC = 110;
    const pedGeo = new THREE.CapsuleGeometry(0.3, 0.9, 3, 6); pedGeo.translate(0, 0.75, 0); pedGeo.scale(1.4, 1.4, 1.4);
    amb.pedMesh = new THREE.InstancedMesh(pedGeo, new THREE.MeshLambertMaterial({ color: 0xffffff }), NP);
    const pal = [0x94a3b8, 0x64748b, 0xcbd5e1, 0x7c8ba1, 0xa8b3c4, 0x5b6b82];
    for (let i = 0; i < NP; i++) {
      const n = swNodes[Math.floor(r() * swNodes.length)];
      amb.peds.push({ cur: n.id, next: null, t: r(), speed: 1.2 + r() * 0.7, x: n.x, z: n.z, off: (r() - 0.5) * 2.4 });
      amb.pedMesh.setColorAt(i, new THREE.Color(pal[i % pal.length]));
    }
    scene.add(amb.pedMesh);
    const carGeo = new THREE.BoxGeometry(4.6, 1.5, 2); carGeo.translate(0, 1.0, 0);
    amb.carMesh = new THREE.InstancedMesh(carGeo, new THREE.MeshLambertMaterial({ color: 0xffffff }), NC);
    const cpal = [0x1f2937, 0x374151, 0xe5e7eb, 0x7f1d1d, 0x1e3a8a, 0xfacc15, 0x475569, 0x0f172a];
    for (let i = 0; i < NC; i++) {
      const n = rdNodes[Math.floor(r() * rdNodes.length)];
      amb.cars.push({ cur: n.id, next: null, t: r(), speed: 7 + r() * 6, x: n.x, z: n.z, yaw: 0 });
      amb.carMesh.setColorAt(i, new THREE.Color(i % 9 === 0 ? 0xfacc15 : cpal[i % cpal.length]));
    }
    scene.add(amb.carMesh);
    amb.dummy = new THREE.Object3D(); amb.r = MSK.util.rng('amb-walk');
  }
  function stepAgent(ag, graph, dt, filterKind) {
    const nodes = graph.nodes;
    if (!ag.next) {
      const opts = graph.adj.get(ag.cur).filter((e) => nodes.get(e.to).kind === filterKind && e.to !== ag.prev);
      const list = opts.length ? opts : graph.adj.get(ag.cur).filter((e) => nodes.get(e.to).kind === filterKind);
      if (!list.length) return;
      const e = list[Math.floor(amb.r() * list.length)]; ag.prev = ag.cur; ag.next = e.to; ag.t = 0; ag.segLen = e.c || 1;
    }
    ag.t += (dt * ag.speed) / ag.segLen;
    const A = nodes.get(ag.cur), B = nodes.get(ag.next);
    if (ag.t >= 1) { ag.cur = ag.next; ag.next = null; ag.x = B.x; ag.z = B.z; return; }
    ag.x = A.x + (B.x - A.x) * ag.t; ag.z = A.z + (B.z - A.z) * ag.t; ag.dx = B.x - A.x; ag.dz = B.z - A.z;
  }
  function updateAmbient(dt) {
    if (!amb.pedMesh) return;
    const d = amb.dummy; const flood = W.floodLevel || 0;
    amb.peds.forEach((p, i) => {
      stepAgent(p, MSK.nav.walk, dt * (W.weatherSlow || 1), 'sw');
      const L = Math.hypot(p.dx || 0, p.dz || 0) || 1;
      d.position.set(p.x - ((p.dz || 0) / L) * p.off, 0.2, p.z + ((p.dx || 0) / L) * p.off);
      d.rotation.set(0, 0, 0); d.scale.setScalar(i < (W.pedCount ?? 260) ? 1 : 0); d.updateMatrix(); amb.pedMesh.setMatrixAt(i, d.matrix);
    });
    amb.pedMesh.instanceMatrix.needsUpdate = true;
    amb.cars.forEach((c, i) => {
      stepAgent(c, MSK.nav.road, dt * (W.weatherSlow || 1), 'rd');
      const L = Math.hypot(c.dx || 0, c.dz || 0) || 1;
      const x = c.x - ((c.dz || 0) / L) * 3.4, z = c.z + ((c.dx || 0) / L) * 3.4;
      const onFDR = Math.abs(x - MSK.geo.AV.fdr) < 12 && flood > 0.45;
      d.position.set(x, 0.1, z); d.rotation.set(0, Math.atan2(-(c.dz || 0), c.dx || 1), 0);
      d.scale.setScalar(onFDR || i >= (W.carCount ?? 110) ? 0 : 1.2); d.updateMatrix(); amb.carMesh.setMatrixAt(i, d.matrix);
    });
    amb.carMesh.instanceMatrix.needsUpdate = true;
  }
})();
