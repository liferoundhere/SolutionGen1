/* Navigation graphs: pedestrian/robot graph (indoor + sidewalks) and road graph (vehicles). A* routing. */
(function () {
  const MSK = (window.MSK = window.MSK || {});
  const G = MSK.geo;

  function Graph() { this.nodes = new Map(); this.adj = new Map(); }
  Graph.prototype.add = function (id, x, y, z, meta) {
    if (!this.nodes.has(id)) { this.nodes.set(id, { id, x, y, z, ...(meta || {}) }); this.adj.set(id, []); }
    return this.nodes.get(id);
  };
  Graph.prototype.link = function (a, b, cost, tag) {
    const A = this.nodes.get(a), Bn = this.nodes.get(b);
    if (!A || !Bn || a === b) return;
    const c = cost != null ? cost : Math.hypot(A.x - Bn.x, A.y - Bn.y, A.z - Bn.z);
    this.adj.get(a).push({ to: b, c, tag }); this.adj.get(b).push({ to: a, c, tag });
  };
  // A* with binary heap
  Graph.prototype.route = function (from, to, costFn) {
    if (!this.nodes.has(from) || !this.nodes.has(to)) return null;
    const goal = this.nodes.get(to);
    const h = (id) => { const n = this.nodes.get(id); return Math.hypot(n.x - goal.x, n.z - goal.z) * 0.9; };
    const open = [{ id: from, f: h(from) }], g = new Map([[from, 0]]), came = new Map(), closed = new Set();
    const push = (it) => { open.push(it); let i = open.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (open[p].f <= open[i].f) break; [open[p], open[i]] = [open[i], open[p]]; i = p; } };
    const pop = () => { const top = open[0], last = open.pop(); if (open.length) { open[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < open.length && open[l].f < open[m].f) m = l; if (r < open.length && open[r].f < open[m].f) m = r; if (m === i) break; [open[m], open[i]] = [open[i], open[m]]; i = m; } } return top; };
    while (open.length) {
      const cur = pop();
      if (cur.id === to) break;
      if (closed.has(cur.id)) continue; closed.add(cur.id);
      for (const e of this.adj.get(cur.id)) {
        const ng = g.get(cur.id) + (costFn ? costFn(e, cur.id) : e.c);
        if (ng < (g.has(e.to) ? g.get(e.to) : Infinity)) { g.set(e.to, ng); came.set(e.to, cur.id); push({ id: e.to, f: ng + h(e.to) }); }
      }
    }
    if (!came.has(to) && from !== to) return null;
    const ids = [to]; let c = to; while (came.has(c)) { c = came.get(c); ids.unshift(c); }
    return ids.map((id) => this.nodes.get(id));
  };

  // ---------- line-based network builder (sidewalks / roads) ----------
  function LineNet(graph, prefix, y) { this.g = graph; this.prefix = prefix; this.y = y || 0; this.lines = []; this.count = 0; }
  LineNet.prototype.line = function (ax, az, bx, bz, tag) { const L = { ax, az, bx, bz, tag, pts: [] }; this.lines.push(L); return L; };
  LineNet.prototype.param = function (L, x, z) { const dx = L.bx - L.ax, dz = L.bz - L.az; const len2 = dx * dx + dz * dz; return ((x - L.ax) * dx + (z - L.az) * dz) / len2; };
  LineNet.prototype.insert = function (L, t, idHint) {
    t = Math.max(0, Math.min(1, t));
    const x = L.ax + (L.bx - L.ax) * t, z = L.az + (L.bz - L.az) * t;
    const near = L.pts.find((p) => Math.abs(p.t - t) * Math.hypot(L.bx - L.ax, L.bz - L.az) < 0.6);
    if (near) return near.id;
    const id = idHint || `${this.prefix}${this.count++}`;
    this.g.add(id, x, this.y, z, { kind: this.prefix });
    L.pts.push({ t, id }); return id;
  };
  LineNet.prototype.intersectAll = function () {
    for (let i = 0; i < this.lines.length; i++) for (let j = i + 1; j < this.lines.length; j++) {
      const a = this.lines[i], b = this.lines[j];
      const d = (a.bx - a.ax) * (b.bz - b.az) - (a.bz - a.az) * (b.bx - b.ax);
      if (Math.abs(d) < 1e-9) continue;
      const t = ((b.ax - a.ax) * (b.bz - b.az) - (b.az - a.az) * (b.bx - b.ax)) / d;
      const u = ((b.ax - a.ax) * (a.bz - a.az) - (b.az - a.az) * (a.bx - a.ax)) / d;
      if (t >= -1e-6 && t <= 1 + 1e-6 && u >= -1e-6 && u <= 1 + 1e-6) {
        const id = this.insert(a, t); const x = this.g.nodes.get(id);
        // register same node on b
        const tb = this.param(b, x.x, x.z);
        if (!b.pts.find((p) => p.id === id)) b.pts.push({ t: tb, id });
      }
    }
  };
  LineNet.prototype.snap = function (x, z, filter) {
    let best = null;
    this.lines.forEach((L) => {
      if (filter && !filter(L)) return;
      const t = Math.max(0, Math.min(1, this.param(L, x, z)));
      const px = L.ax + (L.bx - L.ax) * t, pz = L.az + (L.bz - L.az) * t;
      const d = Math.hypot(px - x, pz - z);
      if (!best || d < best.d) best = { L, t, d };
    });
    return best ? this.insert(best.L, best.t) : null;
  };
  LineNet.prototype.finalize = function (costMul = 1) {
    this.lines.forEach((L) => {
      L.pts.sort((a, b) => a.t - b.t);
      for (let i = 1; i < L.pts.length; i++) {
        const A = this.g.nodes.get(L.pts[i - 1].id), B = this.g.nodes.get(L.pts[i].id);
        this.g.link(A.id, B.id, Math.hypot(A.x - B.x, A.z - B.z) * costMul, L.tag);
      }
    });
  };

  // ---------- build ----------
  const WALK = 1.35; // m/s
  function build() {
    const walk = new Graph(), road = new Graph();
    const sw = new LineNet(walk, 'sw', 0.05);
    const zA = G.zMin + 8, zB = G.zMax - 8;
    // avenue sidewalks
    [[-14.5], [14.5], [G.AV.first - 14.5], [G.AV.first + 14.5]].forEach(([x]) => sw.line(x, zA, x, zB, 'avenue'));
    // street sidewalks
    G.streetsWest.forEach((n) => { [-9, 9].forEach((o) => sw.line(G.xMin + 4, G.ST(n) + o, -14.5, G.ST(n) + o, 'street')); });
    G.streetsEast.forEach((n) => { [-9, 9].forEach((o) => sw.line(14.5, G.ST(n) + o, G.AV.fdr - 16, G.ST(n) + o, 'street')); });
    // crosswalks across York and First at each street
    G.streetsWest.forEach((n) => [-9, 9].forEach((o) => { sw.line(-14.5, G.ST(n) + o, 14.5, G.ST(n) + o, 'crosswalk'); }));
    // esplanade
    sw.line(G.riverX - 6, zA, G.riverX - 6, zB, 'esplanade');
    G.streetsEast.forEach((n) => sw.line(G.AV.fdr - 16, G.ST(n) + 9, G.riverX - 6, G.ST(n) + 9, 'overpass'));
    sw.intersectAll();

    // indoor
    MSK.campus.buildings.forEach((b) => {
      b.levels.forEach((L) => {
        const y = L.y + 0.05;
        const xs = [L.rect.x0 + 1.5, L.rect.x1 - 1.5, ...L.rooms.map((r) => r.cx), ...b.cores.map((c) => c.x)].sort((a, c) => a - c);
        const uniq = []; xs.forEach((x) => { if (!uniq.length || x - uniq[uniq.length - 1] > 0.8) uniq.push(x); });
        const spine = uniq.map((x, i) => walk.add(`sp:${L.key}:${i}`, x, y, L.zc, { b: b.id, level: L.n, kind: 'spine' }).id);
        for (let i = 1; i < spine.length; i++) walk.link(spine[i - 1], spine[i]);
        const nearestSpine = (x) => { let best = spine[0], bd = Infinity; spine.forEach((id) => { const d = Math.abs(walk.nodes.get(id).x - x); if (d < bd) { bd = d; best = id; } }); return best; };
        L.rooms.forEach((r) => {
          walk.add(r.key, r.cx, y, r.cz, { b: b.id, level: L.n, kind: 'room', room: r.code });
          // door point on corridor edge then room center
          const doorZ = r.side === 'n' ? L.zc - G.corrW / 2 : L.zc + G.corrW / 2;
          const did = `door:${r.key}`; walk.add(did, r.cx, y, doorZ, { b: b.id, level: L.n, kind: 'door' });
          walk.link(nearestSpine(r.cx), did); walk.link(did, r.key);
        });
        b.cores.forEach((c) => {
          const id = `core:${b.id}:${c.id}:${L.n}`;
          walk.add(id, c.x, y, L.zc, { b: b.id, level: L.n, kind: 'core', core: c.id });
          walk.link(id, nearestSpine(c.x), 0.1);
        });
      });
      // vertical
      b.cores.forEach((c) => {
        const lv = b.levels.map((l) => l.n).sort((a, d) => a - d);
        for (let i = 1; i < lv.length; i++) {
          const a = `core:${b.id}:${c.id}:${lv[i - 1]}`, d = `core:${b.id}:${c.id}:${lv[i]}`;
          walk.link(a, d, b.floorH * 0.55 + 1.2, 'elevator:' + c.id);
        }
      });
      // stairwells (rooms coded STW/STE) connect vertically
      ['STW', 'STE'].forEach((code) => {
        const lv = b.levels.filter((l) => l.roomMap[code]).map((l) => l.n).sort((a, d) => a - d);
        for (let i = 1; i < lv.length; i++) if (lv[i] - lv[i - 1] === 1) walk.link(`${b.id}/${lv[i - 1]}/${code}`, `${b.id}/${lv[i]}/${code}`, b.floorH * 3.2, 'stair');
      });
      // entrances
      b.entrances.forEach((e) => {
        const L = b.levelMap[e.level];
        const out = walk.add(`ent:${b.id}:${e.id}`, e.outside.x, 0.05, e.outside.z, { kind: 'entrance', b: b.id });
        const door = walk.add(`entd:${b.id}:${e.id}`, e.door.x, L.y + 0.05, e.door.z, { kind: 'door', b: b.id, level: e.level });
        walk.link(out.id, door.id); walk.link(door.id, e.roomKey);
        const s = sw.snap(e.outside.x, e.outside.z); walk.link(out.id, s);
      });
    });
    // outdoor named places
    Object.values(MSK.campus.outdoor).forEach((o) => {
      const id = 'o:' + o.key; walk.add(id, o.x, 0.05, o.z, { kind: 'outdoor' });
      const s = sw.snap(o.x, o.z); walk.link(id, s);
    });
    sw.finalize();

    // ---------- roads ----------
    const rd = new LineNet(road, 'rd', 0.12);
    const zR0 = G.zMin - 60, zR1 = G.zMax + 60;
    [G.AV.second, G.AV.first, G.AV.york].forEach((x) => rd.line(x, G.zMin - 10, x, G.zMax + 10, 'avenue'));
    rd.line(G.AV.fdr, zR0, G.AV.fdr, zR1, 'fdr');
    G.streetsWest.forEach((n) => rd.line(G.xMin, G.ST(n), G.AV.york, G.ST(n), 'street'));
    G.streetsEast.forEach((n) => rd.line(G.AV.york, G.ST(n), G.AV.fdr - (G.fdrRamps.includes(n) ? 0 : 14), G.ST(n), 'street'));
    rd.intersectAll();
    Object.values(MSK.campus.outdoor).forEach((o) => {
      const id = 'r:' + o.key; road.add(id, o.x, 0.12, o.z, { kind: 'curb' });
      const s = rd.snap(o.x, o.z); road.link(id, s);
    });
    rd.finalize();
    return { walk, road };
  }

  function nodeFor(graph, key, mode) {
    if (!key) return null;
    if (mode === 'drive') return 'r:' + key;
    if (MSK.campus.outdoor[key]) return 'o:' + key;
    const parts = key.split('/');
    if (parts.length === 1) { const b = MSK.campus.buildingMap[key]; return b ? b.entrances[0].roomKey : null; }
    if (parts.length === 2) { const b = MSK.campus.buildingMap[parts[0]]; return b ? `core:${b.id}:${b.cores[0].id}:${parts[1]}` : null; }
    return key;
  }

  MSK.nav = {
    init() { const g = build(); this.walk = g.walk; this.road = g.road; return this; },
    // returns [{x,y,z,level,b}] or null
    path(from, to, mode = 'walk') {
      const graph = mode === 'drive' ? this.road : this.walk;
      const a = nodeFor(graph, from, mode), b = nodeFor(graph, to, mode);
      const costFn = mode === 'robot'
        ? (e) => (e.tag === 'elevator:A' ? e.c * 4 : e.tag === 'stair' ? 1e6 : e.tag === 'crosswalk' ? e.c * 3 : e.c)
        : mode === 'walk' ? (e) => (e.tag === 'elevator:S' ? e.c * 2.5 : e.c)
        : mode === 'stairs' ? (e) => (e.tag && e.tag.startsWith('elevator') ? 1e6 : e.c) : null;
      const p = graph.route(a, b, costFn);
      if (!p) { console.warn('[nav] no path', from, '→', to, mode); return null; }
      return p.map((n) => ({ x: n.x, y: n.y, z: n.z, level: n.level, b: n.b, kind: n.kind }));
    },
    length(path) { let L = 0; for (let i = 1; i < path.length; i++) L += Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y, path[i].z - path[i - 1].z); return L; },
    walkSeconds(path) { return this.length(path) / WALK; },
  };
})();
