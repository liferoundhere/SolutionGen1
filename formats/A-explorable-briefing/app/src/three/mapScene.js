import * as THREE from 'three';
import { feature } from 'topojson-client';
import { glow, label, flow } from './sprites.js';
import { STATES_TOPO, HIGHLIGHT_STATES, CORRIDORS, HUB, ORIGIN } from '../data/geo.js';
import { PLACES } from '../data/content.js';

const COS = Math.cos((ORIGIN.lat * Math.PI) / 180);
/** lon/lat to scene units: 1 unit is about 1 degree of latitude. */
export const ll = (lon, lat, y = 0) => new THREE.Vector3((lon - ORIGIN.lon) * COS, y, -(lat - ORIGIN.lat));
const flat = (lon, lat) => new THREE.Vector2((lon - ORIGIN.lon) * COS, lat - ORIGIN.lat);

export const KIND_COLOR = { hq: 0x38bdf8, ops: 0xf59e0b, dc: 0x06b6d4, yard: 0xfacc15, project: 0xa78bfa, event: 0xf43f5e, wayside: 0x22c55e };

export function createMapScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050a16);
  scene.fog = new THREE.FogExp2(0x050a16, 0.018);
  scene.add(new THREE.HemisphereLight(0x8fb4ff, 0x0a0f1e, 0.9));
  const sun = new THREE.DirectionalLight(0xffffff, 1.4);
  sun.position.set(-10, 30, 15);
  scene.add(sun);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: 0x060d1d, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  scene.add(ground);
  const grid = new THREE.GridHelper(200, 200, 0x10203f, 0x0b1830);
  grid.position.y = -0.01;
  scene.add(grid);

  // States: operating states raised and lit, others flat and dark.
  const states = feature(STATES_TOPO, STATES_TOPO.objects.states).features;
  const onMat = new THREE.MeshStandardMaterial({ color: 0x12305a, emissive: 0x0b2a55, emissiveIntensity: 0.45, roughness: 0.6, metalness: 0.2 });
  const offMat = new THREE.MeshStandardMaterial({ color: 0x0c1528, roughness: 0.9 });
  const onLine = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.7 });
  const offLine = new THREE.LineBasicMaterial({ color: 0x1e2c4a, transparent: true, opacity: 0.6 });
  const land = new THREE.Group();
  for (const f of states) {
    const on = HIGHLIGHT_STATES.includes(f.id);
    const depth = on ? 0.16 : 0.05;
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    const shapes = [];
    const seg = [];
    for (const poly of polys) {
      const outer = poly[0];
      if (outer[0][0] < -125 || outer[0][0] > -60) continue; // lower 48 plus New England only
      const shape = new THREE.Shape(outer.map(([x, y]) => flat(x, y)));
      for (let i = 1; i < poly.length; i++) shape.holes.push(new THREE.Path(poly[i].map(([x, y]) => flat(x, y))));
      shapes.push(shape);
      for (let i = 0; i < outer.length - 1; i++) seg.push(ll(outer[i][0], outer[i][1], depth + 0.005), ll(outer[i + 1][0], outer[i + 1][1], depth + 0.005));
    }
    if (!shapes.length) continue;
    const geo = new THREE.ExtrudeGeometry(shapes, { depth, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(geo, on ? onMat : offMat);
    mesh.receiveShadow = true;
    land.add(mesh);
    land.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(seg), on ? onLine : offLine));
  }
  scene.add(land);

  // Corridors: core tube plus additive halo; gold trains travel along them.
  const curves = [];
  const lines = new THREE.Group();
  for (const c of CORRIDORS) {
    const pts = c.coords.map(([x, y]) => ll(x, y, 0.24));
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.2);
    curves.push({ curve, c });
    const special = c.special === 'blueridge';
    const color = special ? 0xf43f5e : 0xf5b301;
    const segs = Math.max(24, pts.length * 20);
    lines.add(new THREE.Mesh(new THREE.TubeGeometry(curve, segs, c.main ? 0.055 : 0.038, 6, false),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: special ? 0.95 : 0.85 })));
    lines.add(new THREE.Mesh(new THREE.TubeGeometry(curve, segs, c.main ? 0.16 : 0.11, 6, false),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.12, depthWrite: false, blending: THREE.AdditiveBlending })));
  }
  scene.add(lines);

  const trains = [];
  curves.forEach(({ curve, c }, i) => {
    const n = c.main ? 3 : 1;
    for (let k = 0; k < n; k++) {
      const s = glow(0xffe08a, c.main ? 0.55 : 0.4, 1);
      scene.add(s);
      trains.push({ s, curve, o: (k / n + i * 0.137) % 1, sp: 0.012 + (i % 5) * 0.003, len: curve.getLength() });
    }
  });

  // Wayside sample points along every corridor.
  const sites = [];
  for (const { curve } of curves) {
    const n = Math.max(2, Math.floor(curve.getLength() / 1.1));
    for (let i = 1; i < n; i++) sites.push(curve.getPointAt(i / n));
  }

  // WITHOUT: unmonitored sites (pulsing red rings, "?" on every 4th).
  const without = new THREE.Group();
  const redMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide });
  const ringGeo = new THREE.RingGeometry(0.12, 0.2, 20);
  sites.forEach((p, i) => {
    const r = new THREE.Mesh(ringGeo, redMat);
    r.rotation.x = -Math.PI / 2;
    r.position.copy(p).setY(0.27);
    without.add(r);
    if (i % 4 === 0) {
      const q = label('?', { size: 0.32, color: '#fecaca', bg: 'rgba(80,10,10,0.75)', border: 'rgba(248,113,113,0.8)' });
      q.position.copy(p).setY(0.75);
      without.add(q);
    }
  });
  scene.add(without);

  // WITH: every site is a sensor; every 3rd sends telemetry to the Jacksonville hub.
  const withG = new THREE.Group();
  const hub = ll(HUB[0], HUB[1], 0.3);
  const arcs = [];
  sites.forEach((p, i) => {
    const d = glow(0x2dd4bf, 0.38, 0.9);
    d.position.copy(p).setY(0.3);
    withG.add(d);
    if (i % 3 === 0) {
      const mid = p.clone().lerp(hub, 0.5);
      mid.y = 1.5 + p.distanceTo(hub) * 0.22;
      const curve = new THREE.QuadraticBezierCurve3(p.clone().setY(0.3), mid, hub);
      withG.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.012, 4, false),
        new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending })));
      const bead = glow(0x67e8f9, 0.22, 1);
      withG.add(bead);
      arcs.push({ curve, bead, o: (i * 0.618) % 1 });
    }
  });
  const hubGlow = glow(0x22d3ee, 3.2, 0.8);
  hubGlow.position.copy(hub).setY(0.6);
  withG.add(hubGlow);
  scene.add(withG);

  // Places: pin, ground ring, top glow, label, invisible pick sphere.
  const markers = [];
  const pickables = [];
  const nudge = { noc: [-1.6, -1.2], dc: [1.5, -1], hq: [0, 0.1], wayside: [-1.4, 0.2] };
  for (const p of PLACES) {
    const color = KIND_COLOR[p.kind] ?? 0xffffff;
    const g = new THREE.Group();
    g.position.copy(ll(p.ll[0], p.ll[1], 0.2));
    const h = p.kind === 'hq' ? 2.2 : p.kind === 'yard' ? 1.1 : 1.5;
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, h, 8),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending }));
    pin.position.y = h / 2;
    g.add(pin);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.24, 32),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.06;
    g.add(ring);
    const top = glow(color, 0.7, 1);
    top.position.y = h;
    g.add(top);
    const big = p.kind === 'hq';
    const lbl = label(p.name, {
      size: big ? 0.44 : ['noc', 'dc', 'wayside'].includes(p.id) ? 0.27 : 0.36,
      sub: ['hq', 'event', 'project'].includes(p.kind) ? p.sub.split(',')[0] : null,
      border: `#${color.toString(16).padStart(6, '0')}`,
    });
    lbl.position.y = h + 0.45;
    lbl.center.set(0.5, 0);
    if (nudge[p.id]) { lbl.position.x += nudge[p.id][0]; lbl.position.y += nudge[p.id][1]; }
    g.add(lbl);
    const pick = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 8), new THREE.MeshBasicMaterial({ visible: false }));
    pick.position.y = h / 2;
    pick.userData.placeId = p.id;
    g.add(pick);
    pickables.push(pick);
    scene.add(g);
    markers.push({ p, ring, lbl, top });
  }

  let mode = 'without';
  function applyMode(m) {
    mode = m;
    without.visible = m === 'without';
    withG.visible = m === 'with';
  }
  applyMode('without');

  let selected = null;
  function select(id) {
    selected = id;
    for (const m of markers) {
      const on = m.p.id === id;
      m.lbl.material.opacity = !id || on ? 1 : 0.55;
      m.top.scale.setScalar(on ? 1.3 : 0.7);
    }
  }

  function tick(t) {
    for (const tr of trains) tr.s.position.copy(tr.curve.getPointAt((tr.o + (t * tr.sp * 18) / tr.len) % 1)).setY(0.3);
    for (const a of arcs) a.bead.position.copy(a.curve.getPoint((a.o + t * 0.35) % 1));
    const pulse = 1 + 0.25 * Math.sin(t * 3);
    for (const m of markers) m.ring.scale.setScalar(m.p.id === selected ? pulse * 1.8 : pulse);
    hubGlow.material.opacity = 0.55 + 0.25 * Math.sin(t * 2);
    redMat.opacity = 0.35 + 0.25 * Math.sin(t * 2.4);
  }

  function placePose(id) {
    const p = PLACES.find((x) => x.id === id);
    const target = ll(p.ll[0], p.ll[1], 0.4);
    const d = ['hq', 'noc', 'dc', 'wayside'].includes(id) ? 5 : 8;
    return { pos: target.clone().add(new THREE.Vector3(0, d * 0.9, d)), target };
  }

  return {
    scene, applyMode, tick, select, placePose, pickables,
    overview: { pos: new THREE.Vector3(0.8, 15, 15.5), target: new THREE.Vector3(1.4, 0, 2.2) },
    get mode() { return mode; },
  };
}
