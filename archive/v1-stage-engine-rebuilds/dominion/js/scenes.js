// Dominion Energy and Splunk briefing: one 3D world per scene.
// Contract (see references/stage-engine.md):
//   { id, bg, bgSteps?, cams: [{ p, t }...one per step], build() -> { group, update(dt, t, step), reset?, leave? } }
// Site positions on the territory are schematic, not survey grade. Dashboard values are illustrative.
import * as THREE from 'three';
import {
  C, damp, smooth, clamp01, rr, glowSprite, label, canvasPanel, roundRect, wireBox,
  gridFloor, points, setOpacity, emissiveMat, edgeLines, person, drawTube, arc,
} from './core.js';
import { BLOCKS, SOURCE_SHORT } from './content.js';
import { bridgeBars } from './kit.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const col = (h) => new THREE.Color(h).getHex();
const FONT = 'Inter, "Segoe UI", Arial, sans-serif';
const MONO = '"JetBrains Mono", Menlo, monospace';

// Shared state the (unused) workshop form writes into. main.js expects it.
export const workshopState = { filled: new Array(8).fill(0), timer: 0 };

// ---------------------------------------------------------------- helpers
function wrap(g, text, x, y, maxW, lh, maxLines = 99) {
  const words = String(text).split(' ');
  let line = '', n = 0;
  for (let i = 0; i < words.length; i++) {
    const test = line ? line + ' ' + words[i] : words[i];
    if (g.measureText(test).width > maxW && line) {
      if (n === maxLines - 1) { g.fillText(line + ' ...', x, y); return y + lh; }
      g.fillText(line, x, y); y += lh; n++; line = words[i];
    } else line = test;
  }
  if (line) { g.fillText(line, x, y); y += lh; }
  return y;
}
const pill = (text, color = '#00bceb', size = 0.42, ink = '#ffffff') =>
  label(text, { size, color: ink, bg: 'rgba(3,10,22,0.84)', border: color, weight: 600 });

function glass(g, w, h, accent, r = 26, alpha = 0.9) {
  g.fillStyle = `rgba(5,14,29,${alpha})`; roundRect(g, 4, 4, w - 8, h - 8, r); g.fill();
  g.strokeStyle = accent; g.lineWidth = 4; g.stroke();
}

// Flat-top hex outline facing +z (for shields) or lying on the floor.
function hexRing(r, color, opacity = 0.9, lying = true) {
  const pts = [];
  for (let i = 0; i <= 6; i++) { const a = (i / 6) * Math.PI * 2; pts.push(lying ? V(Math.cos(a) * r, 0, Math.sin(a) * r) : V(Math.cos(a) * r, Math.sin(a) * r, 0)); }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  return new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
}

// A field of hex tiles inside a mask, as one instanced mesh plus one merged outline.
function hexField(mask, { r = 0.9, gap = 0.12, h = 0.25, colorOf, line = C.sky, lineOpacity = 0.35, bounds = [-20, 20, -15, 15] } = {}) {
  const cells = [];
  const w = Math.sqrt(3) * r;
  for (let row = 0, z = bounds[2]; z <= bounds[3]; row++, z += 1.5 * r) {
    for (let x = bounds[0] + (row % 2 ? w / 2 : 0); x <= bounds[1]; x += w) if (mask(x, z)) cells.push([x, z]);
  }
  const geo = new THREE.CylinderGeometry(r - gap, r - gap, h, 6); geo.rotateY(Math.PI / 6);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
  const mesh = new THREE.InstancedMesh(geo, mat, cells.length);
  const m4 = new THREE.Matrix4(), c = new THREE.Color();
  cells.forEach(([x, z], i) => {
    m4.makeTranslation(x, 0, z); mesh.setMatrixAt(i, m4);
    c.set(colorOf ? colorOf(x, z) : '#0b2340'); mesh.setColorAt(i, c);
  });
  const lp = [];
  cells.forEach(([x, z]) => {
    for (let k = 0; k < 6; k++) {
      const a0 = (k / 6) * Math.PI * 2 + Math.PI / 6, a1 = ((k + 1) / 6) * Math.PI * 2 + Math.PI / 6, rr2 = r - gap * 0.5;
      lp.push(x + Math.cos(a0) * rr2, h / 2 + 0.01, z + Math.sin(a0) * rr2, x + Math.cos(a1) * rr2, h / 2 + 0.01, z + Math.sin(a1) * rr2);
    }
  });
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
  const lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: line, transparent: true, opacity: lineOpacity, blending: THREE.AdditiveBlending, depthWrite: false }));
  const g = new THREE.Group(); g.add(mesh, lines);
  g.userData = { mesh, lines, cells };
  return g;
}

function lineFrom(curve, color, opacity = 0.7, n = 48) {
  const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(n));
  return new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
}

// ---------------------------------------------------------------- territory model
// Schematic Virginia (north), North Carolina (middle), South Carolina (south). x east, z south.
function inTerritory(x, z) {
  if (z < -13 || z > 13) return false;
  if (z < -3) { const west = -17 + Math.max(0, -z - 8) * 1.6; return x > west && x < 10; }
  if (z < 4) return x > -18 && x < 10 - (z + 3) * 0.6;
  return x > -11 + (z - 4) * 0.5 && x < 5.8 - (z - 4) * 0.7;
}
const stateOf = (z) => (z < -3 ? 0 : z < 4 ? 1 : 2);
const SITES = [
  { n: 'Data Center Alley', x: 1.5, z: -11.6, c: '#fbab18' },
  { n: 'Pentagon / JBM-HH', x: 6.8, z: -11, c: '#8e7cff' },
  { n: 'Bath County', x: -12, z: -8, c: '#2de2c5' },
  { n: 'North Anna', x: 1, z: -8.2, c: '#ffd95a' },
  { n: 'Richmond HQ', x: 4.6, z: -6.2, c: '#00bceb' },
  { n: 'Chesterfield', x: 2, z: -4, c: '#ff6b4a' },
  { n: 'Surry', x: 7.4, z: -4.6, c: '#ffd95a' },
  { n: 'Hampton Roads DoD', x: 9.2, z: -7.6, c: '#8e7cff' },
  { n: 'CVOW Offshore Wind', x: 15, z: -4.5, c: '#2de2c5', off: true },
  { n: 'Solar + Storage', x: -6.5, z: -4.2, c: '#6cc04a' },
  { n: 'Customer Ops', x: -3.5, z: 1, c: '#9be7ff' },
  { n: 'V.C. Summer', x: -8.5, z: 7, c: '#ffd95a' },
  { n: 'DESC Cayce', x: -5, z: 9.4, c: '#00bceb' },
  { n: 'Canadys', x: -1.6, z: 11.6, c: '#ff6b4a' },
];
const siteIx = (n) => SITES.findIndex((s) => s.n === n);

// ================================================================== 00 title
export const title = {
  id: 'title',
  bg: { a: '#01040b', b: '#062a4d', c: '#00bceb', mix: [1, 0.6, 0, 0.5] },
  cams: [{ p: [0, 7, 30], t: [0, 6, 0] }],
  build() {
    const group = new THREE.Group();
    const lift = new THREE.Group(); lift.position.y = 4.5; group.add(lift);
    const bars = bridgeBars({ spacing: 2.0, unit: 2.4, radius: 0.42 }); lift.add(bars);
    const floor = hexField((x, z) => Math.hypot(x, z * 1.4) < 26, { r: 1.3, colorOf: (x, z) => (Math.hypot(x, z) < 8 ? '#0e3358' : '#081a30'), lineOpacity: 0.28, bounds: [-30, 30, -24, 14] });
    group.add(floor);
    const rings = [];
    for (let i = 0; i < 3; i++) {
      const r = new THREE.Mesh(new THREE.TorusGeometry(13 + i * 4.5, 0.03, 8, 200), new THREE.MeshBasicMaterial({ color: [C.sky, C.pink, C.teal][i], transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending }));
      r.rotation.x = Math.PI / 2 + 0.18 * (i - 1); r.position.y = 9; group.add(r); rings.push(r);
    }
    const dust = points(1400, () => { const a = rr(0, Math.PI * 2), rad = rr(8, 70); return [Math.cos(a) * rad, rr(0, 30), Math.sin(a) * rad]; }, { size: 0.35, color: C.sky, opacity: 0.5 });
    group.add(dust);
    const core = glowSprite(C.sky, 34, 0.32); core.position.set(0, 8, -4); group.add(core);
    let k = 0;
    return {
      group,
      update(dt, t) {
        k = damp(k, 1, 1.6, dt);
        bars.userData.setHeights(smooth(k), t);
        rings.forEach((r, i) => { r.rotation.z = t * (0.05 + i * 0.03) * (i % 2 ? -1 : 1); });
        dust.rotation.y = t * 0.02;
        floor.position.y = -0.3 + Math.sin(t * 0.5) * 0.05;
      },
      reset() { k = 0; },
    };
  },
};

// ================================================================== 01 digital twin
const AGENTS = [
  ['Storm Surge Agent', 'Chesterfield'], ['CIP Evidence Agent', 'Richmond HQ'], ['Vendor Compromise Agent', 'Surry'],
  ['Large-Load Readiness Agent', 'Data Center Alley'], ['CVOW Weather-Window Agent', 'CVOW Offshore Wind'],
  ['Mission Assurance Agent', 'Pentagon / JBM-HH'], ['Nuclear Media Agent', 'North Anna'], ['Integration Overlap Agent', 'Customer Ops'],
];
const ATTACKS = ['Data Center Alley', 'Richmond HQ', 'North Anna', 'Solar + Storage', 'Hampton Roads DoD', 'V.C. Summer'];

export const twin = {
  id: 'twin',
  bg: { a: '#020814', b: '#0a2240', c: '#2de2c5', mix: [0.5, 1, 0, 0.6] },
  bgSteps: [
    null,
    { a: '#07030c', b: '#2a0c30', c: '#f25c9a', mix: [0.7, 1, 0.3, 0.5] },
    { a: '#04031a', b: '#18164a', c: '#8e7cff', mix: [1, 0.6, 0, 0.6] },
    { a: '#0c0306', b: '#3a0a12', c: '#e2231a', mix: [0.5, 1, 0.4, 0.3] },
    { a: '#020a10', b: '#06385a', c: '#6cc04a', mix: [1, 0.8, 0.1, 0.5] },
  ],
  cams: [
    { p: [3, 25, 25], t: [1, -1, -1] },
    { p: [6, 11, 31], t: [2, -2, 0] },
    { p: [3, 22, 32], t: [2, 3, -2] },
    { p: [7, 27, 21], t: [2, -1, -3] },
    { p: [2, 28, 30], t: [2, 1, -1] },
  ],
  build() {
    const group = new THREE.Group(); group.position.set(3, 0, 0);
    const map = new THREE.Group(); map.scale.setScalar(0.9); group.add(map);
    const tint = ['#0d2a4c', '#0b2442', '#0a2038'];
    const land = hexField(inTerritory, { r: 0.85, colorOf: (x, z) => tint[stateOf(z)], line: C.pink, lineOpacity: 0.3, bounds: [-19, 12, -14, 14] });
    map.add(land);
    const sea = hexField((x, z) => !inTerritory(x, z) && x > 0 && z < 8 && z > -14, { r: 0.85, colorOf: () => '#04101f', line: C.sky, lineOpacity: 0.12, h: 0.05, bounds: [-2, 20, -14, 10] });
    sea.position.y = -0.2; map.add(sea);
    [['VIRGINIA', -6, -10], ['NORTH CAROLINA', -10, 0.5], ['SOUTH CAROLINA', -6, 5.6], ['ATLANTIC OCEAN', 15, 2]].forEach(([n, x, z]) => {
      const l = label(n, { size: 0.5, color: 'rgba(155,231,255,0.55)', weight: 700 }); l.position.set(x, 0.4, z); map.add(l);
    });

    const pins = SITES.map((s) => {
      const g = new THREE.Group(); g.position.set(s.x, 0, s.z); map.add(g);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.6, 8), emissiveMat(col(s.c), 1.6)); stem.position.y = 0.8; g.add(stem);
      const glow = glowSprite(col(s.c), 2.6, 0.7); glow.position.y = 1.7; g.add(glow);
      if (s.off) { const base = hexRing(0.9, col(s.c), 0.8); g.add(base); }
      const lb = pill(s.n, s.c, 0.36); lb.position.set(0, 2.55, 0); g.add(lb);
      return { g, stem, glow, lb, s, hit: 0 };
    });

    // Splunk fabric under the map
    const fabric = new THREE.Group(); fabric.position.y = -3.4; map.add(fabric);
    const fabPlane = hexField((x, z) => Math.hypot(x + 2, z) < 16, { r: 1.6, colorOf: () => '#2a0c30', line: C.pink, lineOpacity: 0.5, h: 0.05, bounds: [-20, 16, -17, 17] });
    fabric.add(fabPlane);
    const fabLb = pill('splunk>  Cisco Data Fabric · Core · ES Premier · SOAR · ITSI · Edge Processor · Federated Search', '#f25c9a', 0.42);
    fabLb.position.set(-5, -0.6, 9); fabric.add(fabLb);
    const beams = pins.map((p) => {
      const geo = new THREE.BufferGeometry().setFromPoints([V(p.s.x, -3.4, p.s.z), V(p.s.x, 0.1, p.s.z)]);
      const l = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: C.pink, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }));
      map.add(l); return l;
    });
    const drops = points(SITES.length * 6, (i) => { const s = SITES[i % SITES.length]; return [s.x, 0, s.z]; }, { size: 0.5, color: C.pink, opacity: 0 });
    map.add(drops);

    // Cloud Control ring above
    const cc = new THREE.Group(); cc.position.set(-1, 9, -3); map.add(cc);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(9, 0.05, 8, 200), new THREE.MeshBasicMaterial({ color: C.violet, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }));
    ring.rotation.x = Math.PI / 2; cc.add(ring);
    const ccCore = glowSprite(C.violet, 4, 0.55); cc.add(ccCore);
    const ccLb = pill('Cisco Cloud Control · AgenticOps', '#8e7cff', 0.5); ccLb.position.set(0, 2, 0); cc.add(ccLb);
    const agents = AGENTS.map(([n, site], i) => {
      const a = (i / AGENTS.length) * Math.PI * 2 + 0.3;
      const node = new THREE.Group(); node.position.set(Math.cos(a) * 9, 0, Math.sin(a) * 9); cc.add(node);
      const orb = glowSprite([C.gold, C.teal, C.pink, C.amber, C.sky, C.violet, C.ice, C.green][i], 2.2, 0.9); node.add(orb);
      const lb = pill(n, '#8e7cff', 0.3); lb.position.y = 1.0; node.add(lb);
      const tgt = SITES[siteIx(site)];
      const from = V(cc.position.x + node.position.x, cc.position.y, cc.position.z + node.position.z);
      const link = lineFrom(new THREE.QuadraticBezierCurve3(from, V((from.x + tgt.x) / 2, 6, (from.z + tgt.z) / 2), V(tgt.x, 1.8, tgt.z)), C.violet, 0);
      map.add(link);
      return { node, lb, link, orb };
    });

    // Attack paths from outside the territory
    const attacks = ATTACKS.map((n, i) => {
      const s = SITES[siteIx(n)];
      const from = i % 2 ? V(22, 7, -14 + i * 2) : V(-22 + i * 3, 8, -18);
      const tube = drawTube(arc(from, V(s.x, 1.2, s.z), 6), { radius: 0.09, color: C.red, opacity: 0.95 });
      map.add(tube);
      const shield = hexRing(1.4, C.green, 0); shield.position.set(s.x, 0.3, s.z); map.add(shield);
      return { tube, shield, ix: siteIx(n) };
    });

    const st = { fab: 0, cc: 0, atk: 0, fix: 0 };
    return {
      group,
      update(dt, t, step) {
        st.fab = damp(st.fab, step >= 1 ? 1 : 0, 2.5, dt);
        st.cc = damp(st.cc, step >= 2 ? 1 : 0, 2.5, dt);
        st.atk = damp(st.atk, step >= 3 ? 1 : 0, 1.6, dt);
        st.fix = damp(st.fix, step >= 4 ? 1 : 0, 2, dt);
        setOpacity(fabric, st.fab);
        beams.forEach((b, i) => { b.material.opacity = st.fab * (0.35 + 0.3 * Math.sin(t * 3 + i)); });
        const dp = drops.geometry.attributes.position.array;
        for (let i = 0; i < SITES.length * 6; i++) { const u = (t * 0.4 + i * 0.37) % 1; dp[i * 3 + 1] = -u * 3.4; }
        drops.geometry.attributes.position.needsUpdate = true; drops.material.opacity = st.fab * 0.9;
        setOpacity(cc, st.cc); cc.rotation.y = t * 0.05; cc.position.y = 9 + (1 - st.cc) * 4;
        agents.forEach((a, i) => { a.link.material.opacity = st.cc * (step === 2 || step === 4 ? 0.55 : 0.12); a.lb.material.opacity = st.cc * (step >= 3 ? 0.55 : 1); });
        const hitSet = new Set(attacks.map((a) => a.ix));
        pins.forEach((p, i) => {
          const hit = hitSet.has(i) ? st.atk * (1 - st.fix) : 0;
          p.stem.material.emissive.set(p.s.c).lerp(new THREE.Color(C.red), hit);
          p.glow.material.color.set(p.s.c).lerp(new THREE.Color(C.red), hit);
          p.glow.scale.setScalar(2.6 + hit * (1.5 + Math.sin(t * 8) * 0.8));
          p.lb.material.opacity = step === 2 ? 0.45 : 1;
        });
        attacks.forEach((a, i) => {
          a.tube.userData.setProgress(smooth(st.atk * 1.4 - i * 0.08));
          a.tube.material.color.set(C.red).lerp(new THREE.Color(C.green), st.fix);
          a.tube.material.opacity = 0.95 - st.fix * 0.55;
          a.shield.material.opacity = st.fix * 0.9; a.shield.rotation.y = t * 0.6; a.shield.scale.setScalar(1 + Math.sin(t * 2 + i) * 0.06);
        });
      },
    };
  },
};

// ================================================================== 02 story (focus)
export const story = {
  id: 'story',
  bg: { a: '#030312', b: '#141a44', c: '#8e7cff', mix: [1, 0.3, 0.2, 0.7] },
  cams: Array.from({ length: 10 }, (_, k) => {
    const a = -0.35 + k * 0.07;
    return { p: [Math.sin(a) * 25 + 7, 12 - k * 0.25, Math.cos(a) * 25], t: [7, 1.5, 0] };
  }),
  build() {
    const group = new THREE.Group(); group.position.set(7.5, 0, 0);
    const disc = hexField((x, z) => Math.hypot(x, z) < 6.5, { r: 0.8, colorOf: () => '#0d1d44', line: C.violet, lineOpacity: 0.35, bounds: [-8, 8, -8, 8] });
    group.add(disc);
    const core = glowSprite(C.violet, 9, 0.5); core.position.y = 1.5; group.add(core);
    const coreLb = pill('One territory', '#8e7cff', 0.42); coreLb.position.y = 3.6; group.add(coreLb);
    const chapters = [{ label: 'Prologue', color: '#ffffff' }, ...BLOCKS].map((b, i) => {
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const g = new THREE.Group(); g.position.set(Math.cos(a) * 8.6, 0, Math.sin(a) * 8.6 * 0.75); group.add(g);
      const geo = new THREE.CylinderGeometry(0.9, 0.9, 1, 6);
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x050e1d, emissive: col(b.color), emissiveIntensity: 0.25, transparent: true, opacity: 0.7 }));
      m.add(edgeLines(geo, col(b.color), 0.9)); g.add(m);
      const lb = pill(b.label, b.color, 0.36); g.add(lb);
      const glow = glowSprite(col(b.color), 4, 0); g.add(glow);
      return { g, m, lb, glow, h: 0.6, k: 0 };
    });
    const path = new THREE.CatmullRomCurve3([V(0, 1.5, 0), ...chapters.map((c) => V(c.g.position.x, 1.2, c.g.position.z))]);
    const tube = drawTube(path, { radius: 0.06, color: C.ice, opacity: 0.8, seg: 400 }); group.add(tube);
    let prog = 0;
    return {
      group,
      update(dt, t, step) {
        prog = damp(prog, step / 9, 2.2, dt);
        tube.userData.setProgress(prog);
        chapters.forEach((c, i) => {
          c.k = damp(c.k, i === step ? 1 : 0, 3, dt);
          const done = i < step ? 1 : 0;
          c.h = damp(c.h, 0.6 + c.k * 3.4 + done * 0.6, 3, dt);
          c.m.scale.y = c.h; c.m.position.y = c.h / 2;
          c.m.material.emissiveIntensity = 0.2 + c.k * 1.1 + done * 0.3;
          c.lb.position.y = c.h + 0.9; c.lb.material.opacity = i <= step ? 1 : 0.4;
          c.glow.position.y = c.h; c.glow.material.opacity = c.k * 0.8;
        });
        core.material.opacity = 0.35 + Math.sin(t * 1.5) * 0.1;
      },
    };
  },
};

// ================================================================== 03 KPIs
const KPIS = [
  ['$65B', '2026 to 2030 capital plan', '[1] [2]', '#00bceb'],
  ['53.8 GW', 'Data center capacity in contracting', '[3] [4]', '#fbab18'],
  ['3.6M', 'Electric customers (VA, NC, SC)', '[54]', '#6cc04a'],
  ['81%', 'CVOW complete (176 turbines, 2.6 GW)', '[10]', '#2de2c5'],
  ['2H 2027', 'Expected close: NextEra combination', '[7]', '#8e7cff'],
  ['10/1/2028', 'NERC CIP-015 INSM effective', '[29]', '#f25c9a'],
];
export const kpis = {
  id: 'kpis',
  bg: { a: '#040a06', b: '#0c2a1a', c: '#6cc04a', mix: [0.6, 1, 0, 0.4] },
  cams: [{ p: [3, 7, 26], t: [8, 5, 0] }, { p: [6, 7, 25], t: [8.5, 5, 0] }, { p: [9, 7, 26], t: [9, 5, 0] }],
  build() {
    const group = new THREE.Group(); group.position.set(10, 0, 0);
    group.add(gridFloor(120, 60, C.green, 0.12));
    const tiles = KPIS.map(([v, l, cite, c], i) => {
      const colI = Math.floor(i / 2), row = i % 2;
      const g = new THREE.Group(); g.position.set((colI - 1) * 6.6, 7.4 - row * 4.1, 0); group.add(g);
      const p = canvasPanel(6, 3.5, (gg, w, h) => {
        glass(gg, w, h, c, 30, 0.88);
        gg.fillStyle = c; gg.fillRect(4, 30, 12, h - 60);
        gg.fillStyle = '#ffffff'; gg.font = `800 ${h * 0.3}px ${FONT}`; gg.textBaseline = 'top';
        gg.fillText(v, 48, h * 0.13);
        gg.fillStyle = 'rgba(220,232,245,0.9)'; gg.font = `500 ${h * 0.1}px ${FONT}`;
        wrap(gg, l, 48, h * 0.52, w - 96, h * 0.13, 2);
        gg.font = `700 ${h * 0.085}px ${MONO}`; gg.fillStyle = c; gg.textAlign = 'right';
        gg.fillText(cite, w - 40, h * 0.8);
      }, 220);
      g.add(p);
      const halo = glowSprite(col(c), 10, 0); halo.position.z = -0.5; g.add(halo);
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1, 8), emissiveMat(col(c), 2)); g.add(beam);
      return { g, p, halo, beam, colI, k: 0 };
    });
    const pads = [0, 1, 2].map((i) => { const r = hexRing(2.6, C.green, 0.5); r.position.set((i - 1) * 6.6, 0.02, 0); group.add(r); return r; });
    return {
      group,
      update(dt, t, step) {
        tiles.forEach((tl) => {
          const on = tl.colI === step ? 1 : 0, past = tl.colI < step;
          tl.k = damp(tl.k, on, 3, dt);
          tl.g.position.z = tl.k * 1.4;
          tl.p.material.opacity = on ? 1 : past ? 0.75 : 0.3;
          tl.halo.material.opacity = tl.k * 0.35;
          const h = tl.g.position.y - 1.75; tl.beam.scale.y = Math.max(0.01, h * (0.2 + tl.k * 0.8)); tl.beam.position.y = -1.75 - tl.beam.scale.y / 2;
          tl.beam.visible = tl.k > 0.05;
        });
        pads.forEach((r, i) => { r.material.opacity = i === step ? 0.9 : 0.25; r.rotation.y = t * 0.3; });
      },
    };
  },
};

// ================================================================== 04 leadership
const OUTCOMES = [
  [0, 'More value from ES Premier and SOAR', 'Builds on what you run', '#6cc04a'],
  [1, 'CIP-015 ready by Oct 2028 [28] [29]', 'Supports our current work', '#00bceb'],
  [1, 'Retention without runaway cost', 'Supports our current work', '#00bceb'],
  [2, 'Resilient digital services', 'Extends the platform', '#8e7cff'],
  [2, 'Governed AI and agents [37]', 'Extends the platform', '#8e7cff'],
  [2, 'Integration-ready for NextEra [7]', 'Extends the platform', '#8e7cff'],
];
export const leadership = {
  id: 'leadership',
  bg: { a: '#06040a', b: '#2a1a08', c: '#fbab18', mix: [0.5, 0.7, 0, 0.4] },
  cams: [{ p: [6.5, 5, 19], t: [9, 3, 0] }, { p: [6.5, 5.5, 21], t: [9, 4, 0] }, { p: [6.5, 6, 25], t: [9, 4.8, 0] }],
  build() {
    const group = new THREE.Group(); group.position.set(9.6, 0, 0);
    const coreGeo = new THREE.CylinderGeometry(2.6, 2.9, 1.2, 6);
    const core = new THREE.Mesh(coreGeo, new THREE.MeshStandardMaterial({ color: 0x050e1d, emissive: C.green, emissiveIntensity: 0.6, transparent: true, opacity: 0.8 }));
    core.add(edgeLines(coreGeo, C.green, 1)); core.position.y = 0.6; group.add(core);
    const coreLb = pill('What you run: Splunk Core · ES Premier · SOAR', '#6cc04a', 0.42); coreLb.position.set(0, 0.2, 3.6); group.add(coreLb);
    const ringCols = [C.green, C.sky, C.violet];
    const rings = [4.6, 8, 11.4].map((r, i) => { const h = hexRing(r, ringCols[i], 0.2); group.add(h); return h; });
    const per = [0, 0, 0];
    const tiles = OUTCOMES.map(([ring, t1, tag, c]) => {
      const n = OUTCOMES.filter((o) => o[0] === ring).length, j = per[ring]++;
      const p = canvasPanel(4.8, 1.65, (g, w, h) => {
        glass(g, w, h, c, 22, 0.92);
        g.fillStyle = c; g.font = `700 ${h * 0.15}px ${FONT}`; g.textBaseline = 'top'; g.fillText(tag.toUpperCase(), 30, h * 0.14);
        g.fillStyle = '#fff'; g.font = `700 ${h * 0.2}px ${FONT}`; wrap(g, t1, 30, h * 0.4, w - 60, h * 0.24, 2);
      }, 160);
      p.position.set((j - (n - 1) / 2) * 5.1, 0, 2.2);
      group.add(p);
      const glow = glowSprite(col(c), 7, 0); glow.position.copy(p.position); glow.position.z -= 0.3; group.add(glow);
      return { p, glow, ring, k: 0 };
    });
    return {
      group,
      update(dt, t, step) {
        rings.forEach((r, i) => { r.material.opacity = i <= step ? (i === step ? 0.95 : 0.5) : 0.12; r.rotation.y = t * 0.05 * (i % 2 ? -1 : 1); });
        tiles.forEach((tl, i) => {
          tl.k = damp(tl.k, tl.ring <= step ? 1 : 0, 3, dt);
          tl.p.position.y = -1 + smooth(tl.k) * (3.4 + tl.ring * 2.25) + Math.sin(t + i) * 0.04;
          tl.p.material.opacity = smooth(tl.k) * (tl.ring === step ? 1 : 0.7);
          tl.p.visible = tl.k > 0.02;
          tl.glow.position.y = tl.p.position.y; tl.glow.material.opacity = tl.ring === step ? tl.k * 0.3 : 0;
        });
        core.rotation.y = t * 0.2;
      },
    };
  },
};

// ================================================================== 05 our work together (CIP-015 storage)
const STAGES = [
  ['Collect · inside the ESP', '#2de2c5'],
  ['Detect · R1 · DDAS', '#00bceb'],
  ['Retain · R2 · Dominion S3', '#fbab18'],
  ['Prove · R3 · DDAA + Object Lock', '#f25c9a'],
  ['Act · CIP Evidence Agent', '#8e7cff'],
];
export const account = {
  id: 'account',
  bg: { a: '#02060f', b: '#06264a', c: '#00bceb', mix: [0.3, 1, 0.6, 0.3] },
  cams: [-10, -5, 0, 5, 10].map((x) => ({ p: [x * 0.35 + 3, 9, 22], t: [x * 0.25 + 6, 2.5, 0] })),
  build() {
    const group = new THREE.Group(); group.position.set(5.5, 0, 0); group.scale.setScalar(0.7);
    group.add(gridFloor(120, 60, C.sky, 0.1));
    const xs = [-10, -5, 0, 5, 10];
    const tag = pill('Our work together · in progress', '#6cc04a', 0.55); tag.position.set(8, 12, -2); group.add(tag);
    const st = STAGES.map(([n, c], i) => {
      const g = new THREE.Group(); g.position.set(xs[i], 0, 0); group.add(g);
      let body;
      if (i === 0) { body = new THREE.Group(); for (let k = 0; k < 3; k++) { const b = wireBox(0.7, 1.6 + k * 0.5, 0.7, col(c), 0.12); b.position.set((k - 1) * 1.1, (1.6 + k * 0.5) / 2, 0); body.add(b); } const esp = wireBox(4.2, 3.4, 3, col(c), 0.03, 0.35); esp.position.y = 1.7; body.add(esp); }
      else if (i === 1) { body = wireBox(2.4, 3.6, 2.4, col(c), 0.14); body.position.y = 1.8; }
      else if (i === 2) { const geo = new THREE.CylinderGeometry(1.5, 1.2, 2.8, 24, 1, true); body = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col(c), transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false })); body.add(edgeLines(new THREE.CylinderGeometry(1.5, 1.2, 2.8, 12, 1), col(c), 0.8)); body.position.y = 1.4; }
      else if (i === 3) { body = new THREE.Group(); const box = wireBox(2.2, 2.2, 2.2, col(c), 0.12); box.position.y = 1.1; const shackle = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.12, 8, 24, Math.PI), emissiveMat(col(c), 1.4)); shackle.position.y = 2.2; body.add(box, shackle); }
      else { body = new THREE.Group(); const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 1), new THREE.MeshStandardMaterial({ color: 0x050e1d, emissive: col(c), emissiveIntensity: 0.8, flatShading: true })); orb.position.y = 2.2; body.add(orb); const p = person(C.green, 0.8); p.position.set(1.5, 0, 0.6); body.add(p); }
      g.add(body);
      const lb = pill(n, c, 0.56); lb.position.set(0, i % 2 ? 6.6 : 4.9, 0); g.add(lb);
      const glow = glowSprite(col(c), 6, 0); glow.position.y = 1.8; g.add(glow);
      return { g, body, lb, glow, k: 0 };
    });
    const curve = new THREE.CatmullRomCurve3(xs.map((x, i) => V(x, 0.6 + (i % 2) * 0.4, 1.6)));
    const tube = drawTube(curve, { radius: 0.07, color: C.sky, opacity: 0.9, seg: 300 }); group.add(tube);
    const flow = points(160, () => [0, 0, 0], { size: 0.35, color: C.ice, opacity: 0.9 }); group.add(flow);
    const rec = canvasPanel(8.4, 2.3, (g, w, h) => {
      glass(g, w, h, '#fbab18', 22, 0.92);
      g.fillStyle = '#fbab18'; g.font = `700 ${h * 0.15}px ${FONT}`; g.textBaseline = 'top'; g.fillText('OUR RECOMMENDATION', 30, h * 0.12);
      g.fillStyle = '#fff'; g.font = `500 ${h * 0.15}px ${FONT}`;
      wrap(g, 'Pair the write bucket with versioning and replication to a separate Object Lock bucket, so R3 immutability holds without breaking the pipeline. [63]', 30, h * 0.36, w - 60, h * 0.19, 3);
    }, 170);
    rec.position.set(3, 9.6, 1); group.add(rec);
    let prog = 0, rk = 0;
    const tmp = new THREE.Vector3();
    return {
      group,
      update(dt, t, step) {
        prog = damp(prog, step / 4, 2, dt);
        tube.userData.setProgress(prog + 0.02);
        const fp = flow.geometry.attributes.position.array;
        for (let i = 0; i < 160; i++) { const u = ((t * 0.12 + i / 160) % 1) * Math.max(0.02, prog); curve.getPointAt(u, tmp); fp[i * 3] = tmp.x; fp[i * 3 + 1] = tmp.y + Math.sin(i) * 0.15; fp[i * 3 + 2] = tmp.z + Math.cos(i) * 0.15; }
        flow.geometry.attributes.position.needsUpdate = true;
        st.forEach((s, i) => {
          s.k = damp(s.k, i === step ? 1 : i < step ? 0.55 : 0.12, 3, dt);
          setOpacity(s.body, 0.3 + s.k * 0.7);
          s.glow.material.opacity = (i === step ? 0.55 : 0) * s.k;
          s.lb.material.opacity = 0.35 + s.k * 0.65;
          s.body.rotation.y = i === 4 ? t * 0.4 : 0;
        });
        rk = damp(rk, step === 3 ? 1 : 0, 3, dt);
        rec.material.opacity = rk; rec.visible = rk > 0.02; rec.position.y = 9.6 - (1 - rk);
      },
    };
  },
};

// ================================================================== 06 thesis: layers
const LAYERS = [
  ['Dominion Energy business functions', '#fbab18', ['Generation', 'T&D', 'Large load', 'Customer', 'Federal', 'Security']],
  ['Cisco infrastructure and security', '#00bceb', ['Cyber Vision', 'Industrial Ethernet', 'ISE', 'Secure Firewall', 'Duo', 'ThousandEyes', 'Talos']],
  ['splunk> Data Fabric', '#f25c9a', ['Core *', 'ES Premier *', 'SOAR *', 'ITSI', 'Observability', 'Edge Processor', 'Federated Search']],
  ['Cisco Cloud Control', '#8e7cff', ['AI Canvas', 'Agent Builder', 'App Builder', 'AI Defense', 'AI Agent Monitoring']],
];
export const thesis = {
  id: 'thesis',
  bg: { a: '#050310', b: '#24123a', c: '#f25c9a', mix: [1, 0.4, 0, 0.6] },
  cams: [{ p: [1, 11, 27], t: [6, 5, 0] }, { p: [-1, 6, 27], t: [6, 3, 0] }, { p: [3, 15, 30], t: [6, 6, 0] }],
  build() {
    const group = new THREE.Group(); group.position.set(7, 0, 0);
    const slabs = LAYERS.map(([n, c, chips], i) => {
      const g = new THREE.Group(); g.position.y = i * 2.8; group.add(g);
      const geo = new THREE.BoxGeometry(16, 0.4, 7);
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x050e1d, emissive: col(c), emissiveIntensity: 0.15, transparent: true, opacity: 0.55, depthWrite: false }));
      m.add(edgeLines(geo, col(c), 0.9)); g.add(m);
      const lb = pill(n, c, 0.46); lb.position.set(-8.5, 0.9, 3.4); lb.center.set(0, 0.5); g.add(lb);
      const chipLbs = chips.map((tx, j) => {
        const inPlace = tx.endsWith('*');
        const l = label(inPlace ? tx.replace(' *', ' · in place') : tx, { size: 0.3, color: inPlace ? '#c8f5b0' : '#e6f4ff', bg: 'rgba(3,10,22,0.8)', border: inPlace ? '#6cc04a' : c });
        l.position.set(-6 + (j % 4) * 4.1, 0.75, -1.4 + Math.floor(j / 4) * 1.6); g.add(l); return l;
      });
      return { g, m, lb, chipLbs, k: 0 };
    });
    const counts = canvasPanel(6.4, 2.4, (g, w, h) => {
      glass(g, w, h, '#6cc04a', 24, 0.9);
      [['13', 'run on what you own', '#6cc04a'], ['20', 'extend with add-on or Cisco', '#00bceb'], ['20', 'need new capability', '#8e7cff']].forEach(([n, tx, c], i) => {
        const x = 30 + i * (w - 60) / 3;
        g.fillStyle = c; g.font = `800 ${h * 0.36}px ${FONT}`; g.textBaseline = 'top'; g.fillText(n, x, h * 0.12);
        g.fillStyle = '#e6f4ff'; g.font = `500 ${h * 0.1}px ${FONT}`; wrap(g, tx, x, h * 0.58, (w - 60) / 3 - 20, h * 0.13, 2);
      });
    }, 170);
    counts.position.set(3, 11.8, -3); group.add(counts);
    const why = ['Build-out at scale [2]', 'Adversaries pre-positioning [23]', 'Security already converged [14]', 'AI already in production [33]'].map((tx, i) => {
      const l = pill(tx, '#fbab18', 0.36); l.position.set(-6 + i * 4.2, -0.8, 4.4); group.add(l); return l;
    });
    const arrows = [-6, -1.8, 2.4, 6.6].map((x) => { const tb = drawTube(new THREE.LineCurve3(V(x, -1.2, 3.8), V(x, 5.6, 1)), { radius: 0.05, color: C.amber, opacity: 0.8 }); group.add(tb); return tb; });
    const cats = [['NextEra combination [7]', -9], ['Federal mission customers [18]', 9]].map(([tx, x]) => {
      const g = new THREE.Group(); g.position.set(x, 0, -3.5); group.add(g);
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 12, 8), emissiveMat(C.violet, 2)); beam.position.y = 6; g.add(beam);
      const l = pill(tx, '#8e7cff', 0.4); l.position.y = 12.8; g.add(l);
      return g;
    });
    const st = { a: 0, b: 0, c: 0 };
    return {
      group,
      update(dt, t, step) {
        st.a = damp(st.a, 1, 3, dt); st.b = damp(st.b, step >= 1 ? 1 : 0, 2.5, dt); st.c = damp(st.c, step >= 2 ? 1 : 0, 2.5, dt);
        const lit = [0.2 + st.b * 0.9, 0.35, 1.0, 0.1 + st.c * 1.0];
        slabs.forEach((s, i) => {
          s.m.material.emissiveIntensity = lit[i] * 0.6;
          s.g.position.y = i * 2.8 + (i === 3 ? (1 - st.c) * 2.5 : 0);
          setOpacity(s.g, i === 3 ? 0.25 + st.c * 0.75 : 1);
          if (i === 3) { s.chipLbs.forEach((l) => { l.material.opacity = st.c; }); s.lb.material.opacity = 0.3 + st.c * 0.7; }
        });
        counts.material.opacity = (1 - st.b * 0.5) * (1 - st.c); counts.visible = st.c < 0.98;
        why.forEach((l, i) => { l.material.opacity = clamp01(st.b * 2 - i * 0.25); });
        arrows.forEach((a, i) => a.userData.setProgress(st.b * 1.2 - i * 0.05 + Math.sin(t * 2 + i) * 0));
        cats.forEach((c) => setOpacity(c, st.c));
      },
    };
  },
};

// ================================================================== 07 alignment matrix
const PRODUCTS = ['ITSI', 'AITK', 'FED', 'CCC', 'TE', 'OT', 'ARI', 'CV', 'IE', 'ISE', 'EDGE', 'ES', 'SEA', 'AB', 'OBS', 'CORE', 'AID', 'UEBA', 'DUO', 'FW', 'ESP', 'SOAR', 'TALOS', 'MERAKI', 'SSE', 'AIAM', 'APPB'];
const PNAME = { CV: 'Cyber Vision', CCC: 'Cloud Control', ITSI: 'ITSI', FED: 'Federated Search', ES: 'Enterprise Security', CORE: 'Splunk Core', OT: 'OT Security Add-on', UEBA: 'UEBA' };
const INITS = [
  ['Data center demand', ['ITSI', 'AITK', 'FED', 'CCC', 'TE'], []],
  ['$65B capital plan', ['OT', 'ARI', 'CV', 'IE', 'ISE'], []],
  ['Complete and operate CVOW', ['EDGE', 'OT', 'ES', 'SEA', 'AB'], ['ES']],
  ['Grid Transformation Plan', ['ITSI', 'OBS', 'CORE', 'AID', 'CCC'], ['CORE']],
  ['Nuclear life extension', ['UEBA', 'ES', 'FED', 'CV', 'DUO'], ['UEBA', 'ES']],
  ['Reliability generation', ['AITK', 'CORE', 'FW', 'CV'], ['CORE']],
  ['Clean energy mandates', ['OT', 'CORE', 'IE', 'CV'], ['CORE']],
  ['Converged security', ['ESP', 'SOAR', 'UEBA', 'TALOS', 'MERAKI'], ['ESP', 'SOAR', 'UEBA']],
  ['NextEra readiness', ['FED', 'UEBA', 'CCC', 'DUO', 'SSE'], ['UEBA']],
  ['AI in operations', ['AIAM', 'OBS', 'AID'], []],
  ['Mission customers', ['CORE', 'ITSI', 'APPB'], ['CORE']],
  ['NERC CIP-015 and TSA', ['OT', 'ES', 'CV', 'FW'], ['ES']],
];
export const alignment = {
  id: 'alignment',
  bg: { a: '#020a0c', b: '#0a2e30', c: '#2de2c5', mix: [0.4, 1, 0.3, 0.3] },
  cams: [{ p: [7, 15, 18], t: [10, 0, -1.5] }, { p: [7, 15, 18], t: [10, 0, -0.5] }, { p: [7, 15, 19], t: [10, 0, 0.5] }, { p: [7, 16, 20], t: [10, 0, 1] }],
  build() {
    const group = new THREE.Group(); group.position.set(13.5, 0, 0); group.scale.setScalar(0.82);
    const cw = 0.62, rh = 1.0, x0 = -((PRODUCTS.length - 1) * cw) / 2, z0 = -((INITS.length - 1) * rh) / 2;
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(PRODUCTS.length * cw + 1, INITS.length * rh + 0.6), new THREE.MeshBasicMaterial({ color: 0x041a1c, transparent: true, opacity: 0.6, depthWrite: false }));
    plate.rotation.x = -Math.PI / 2; group.add(plate);
    group.add(edgeLines(new THREE.BoxGeometry(PRODUCTS.length * cw + 1, 0.01, INITS.length * rh + 0.6), C.teal, 0.5));
    const dots = points(PRODUCTS.length * INITS.length, (i) => [x0 + (i % PRODUCTS.length) * cw, 0.05, z0 + Math.floor(i / PRODUCTS.length) * rh], { size: 0.12, color: C.teal, opacity: 0.35 });
    group.add(dots);
    const cellGeo = new THREE.BoxGeometry(0.42, 1, 0.6);
    const rows = INITS.map(([n, prods, inPlace], r) => {
      const g = new THREE.Group(); group.add(g);
      const cells = prods.map((p) => {
        const c = PRODUCTS.indexOf(p);
        const on = inPlace.includes(p);
        const m = new THREE.Mesh(cellGeo, emissiveMat(on ? C.green : C.sky, on ? 1.5 : 1.0));
        m.position.set(x0 + c * cw, 0, z0 + r * rh); g.add(m); return m;
      });
      const lb = label(n, { size: 0.4, color: '#e6fffb', bg: 'rgba(3,14,16,0.82)', border: '#2de2c5' }); lb.center.set(1, 0.5); lb.position.set(x0 - 0.6, 0.3, z0 + r * rh); g.add(lb);
      return { g, cells, lb, k: 0, grp: Math.floor(r / 3) };
    });
    Object.entries(PNAME).forEach(([k, n]) => {
      const c = PRODUCTS.indexOf(k);
      const l = label(n, { size: 0.32, color: ['ES', 'CORE', 'UEBA'].includes(k) ? '#c8f5b0' : '#9be7ff' }); l.center.set(0.5, 0); l.position.set(x0 + c * cw, 0.3 + (c % 3) * 0.75, z0 - 0.9); group.add(l);
    });
    const legend = pill('Green: in place today · Blue: extends or adds', '#6cc04a', 0.32); legend.position.set(0, 0.5, z0 + INITS.length * rh + 0.4); group.add(legend);
    return {
      group,
      update(dt, t, step) {
        rows.forEach((r, i) => {
          r.k = damp(r.k, r.grp <= step ? 1 : 0, 3, dt);
          const now = r.grp === step;
          const h = 0.05 + smooth(r.k) * (now ? 1.2 : 0.55);
          r.cells.forEach((m, j) => { m.scale.y = h * (1 + (now ? Math.sin(t * 3 + j + i) * 0.08 : 0)); m.position.y = (m.scale.y) / 2; });
          r.lb.material.opacity = r.grp <= step ? (now ? 1 : 0.55) : 0.25;
        });
      },
    };
  },
};

// ================================================================== 08 threats
const THREATS = [
  ['critical', 'VOLTZITE / Volt Typhoon at ICS Stage 2', 'Engineering workstation baselines (UEBA), Cyber Vision INSM, LOTL hunts in ES.', '[23]'],
  ['critical', 'SYLVANITE inside a U.S. electric utility', 'Edge-device exploit detections, AD credential-theft analytics, Triage Agent for fast disposition.', '[23] [24]'],
  ['high', 'KAMACITE mapping U.S. control loops', 'ARI exposure analytics; Secure Firewall and ISE segmentation; Talos-informed blocking.', '[24]'],
  ['high', 'ELECTRUM attack on Distributed Energy Resources', 'DER telemetry monitoring at Edge Hub; aggregator API anomaly detection.', '[24] [32]'],
  ['high', 'OT-capable ransomware, up 64%', 'ES Premier + SOAR containment; Splunk Attack Analyzer on initial lures.', '[23]'],
  ['medium', '24-day exploit window', 'ARI + Cyber Vision vulnerability matching; risk-based prioritization of internet-reachable assets.', '[24]'],
  ['high', 'Physical attacks and drones', 'Converged correlation of PACS, Meraki MV, gunshot and UAS detection with cyber events.', '[25] [27]'],
  ['medium', 'GridEx VIII: heat dome over Data Center Alley', 'ITSI cross-domain service health; UEBA insider analytics; out-of-band verification agents.', '[26]'],
  ['medium', 'Agentic AI privilege creep', 'AI Defense policy, human approval gates, Splunk AI Agent Monitoring traces.', '[50]'],
  ['high', 'AI in OT: drift and safety bypass', 'Model evaluation and drift detection; advisory-only agents for OT; DefenseClaw fail-closed at the edge.', '[51]'],
  ['high', 'Third-party and vendor compromise', 'SOAR playbook implementing the Vendor Compromise Response Plan; SEA session control.', '[13] [14]'],
  ['medium', 'Merger-window social engineering (sector pattern)', 'Malware Reversing and Phishing agent; brand-impersonation detections; Duo phishing-resistant MFA.', '[7]'],
];
const SEV = { critical: '#e2231a', high: '#ff6b4a', medium: '#fbab18' };
const GROUPS = [[], [0, 1], [2, 3, 4], [5, 6, 7], [8, 9], [10, 11]];
const groupOf = (i) => GROUPS.findIndex((g) => g.includes(i));
export const threats = {
  id: 'threats',
  bg: { a: '#0c0306', b: '#3a0810', c: '#e2231a', mix: [0.6, 1, 0.2, 0.3] },
  bgSteps: [
    null, null,
    { a: '#0c0604', b: '#3a1a08', c: '#ff6b4a', mix: [0.6, 1, 0.2, 0.3] },
    { a: '#0a0804', b: '#33240a', c: '#fbab18', mix: [0.6, 0.9, 0.1, 0.4] },
    { a: '#04031a', b: '#16184a', c: '#8e7cff', mix: [0.9, 0.6, 0, 0.5] },
    { a: '#020a12', b: '#063052', c: '#00bceb', mix: [1, 0.6, 0, 0.6] },
  ],
  cams: [{ p: [3, 4.5, 25], t: [7, 4.6, 0] }, { p: [4, 6, 22.5], t: [7.6, 6.2, 0] }, { p: [3, 5, 22.5], t: [7, 5, 0] }, { p: [4, 4, 22.5], t: [7, 4, 0] }, { p: [5, 3, 22.5], t: [7.5, 3.4, 0] }, { p: [3, 4.5, 25], t: [7, 4.6, 0] }],
  build() {
    const group = new THREE.Group(); group.position.set(7.5, 0.6, 0); group.scale.setScalar(0.86);
    const R = 2.45, W = Math.sqrt(3) * R;
    const shields = THREATS.map(([sev, name, counter, cite], i) => {
      const row = Math.floor(i / 4), c4 = i % 4;
      const g = new THREE.Group(); g.position.set((c4 - 1.5) * (W + 0.25) + (row % 2 ? (W + 0.25) / 2 : 0) - 1, 8.6 - row * (1.5 * R + 0.25), 0); group.add(g);
      const flip = new THREE.Group(); g.add(flip);
      const hex = new THREE.Mesh(new THREE.CircleGeometry(R, 6), new THREE.MeshBasicMaterial({ color: 0x050e1d, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false }));
      hex.rotation.z = Math.PI / 6; flip.add(hex);
      const ring = hexRing(R, col(SEV[sev]), 1, false); ring.rotation.z = Math.PI / 6; flip.add(ring);
      const front = canvasPanel(3.5, 2.5, (gg, w, h) => {
        gg.textBaseline = 'top';
        gg.fillStyle = SEV[sev]; roundRect(gg, w * 0.04, h * 0.06, w * 0.34, h * 0.15, 14); gg.fill();
        gg.fillStyle = '#fff'; gg.font = `800 ${h * 0.09}px ${FONT}`; gg.fillText(sev.toUpperCase(), w * 0.07, h * 0.09);
        gg.font = `800 ${h * 0.125}px ${FONT}`; gg.fillStyle = '#ffffff';
        wrap(gg, name, w * 0.04, h * 0.3, w * 0.92, h * 0.15, 4);
        gg.font = `600 ${h * 0.08}px ${MONO}`; gg.fillStyle = SEV[sev]; gg.fillText(cite, w * 0.04, h * 0.88);
      }, 200);
      front.material.side = THREE.FrontSide; front.position.z = 0.02; flip.add(front);
      const back = canvasPanel(3.5, 2.5, (gg, w, h) => {
        gg.textBaseline = 'top';
        gg.fillStyle = '#00bceb'; gg.font = `800 ${h * 0.09}px ${FONT}`; gg.fillText('COUNTER', w * 0.04, h * 0.07);
        gg.fillStyle = '#9be7ff'; gg.font = `600 ${h * 0.075}px ${FONT}`; wrap(gg, name, w * 0.04, h * 0.2, w * 0.92, h * 0.09, 2);
        gg.fillStyle = '#ffffff'; gg.font = `600 ${h * 0.098}px ${FONT}`;
        wrap(gg, counter, w * 0.04, h * 0.42, w * 0.92, h * 0.12, 5);
      }, 200);
      back.material.side = THREE.FrontSide; back.rotation.y = Math.PI; back.position.z = -0.02; flip.add(back);
      const glow = glowSprite(col(SEV[sev]), 7, 0.25); glow.position.z = -0.6; g.add(glow);
      return { g, flip, ring, glow, sev, k: 0, grp: groupOf(i) };
    });
    const core = points(500, () => { const a = rr(0, Math.PI * 2), r = rr(9, 16); return [Math.cos(a) * r - 1, Math.sin(a) * r * 0.7 + 5, rr(-6, -2)]; }, { size: 0.3, color: C.red, opacity: 0.5 });
    group.add(core);
    const blue = new THREE.Color(C.sky), green = new THREE.Color(C.green);
    return {
      group,
      update(dt, t, step) {
        shields.forEach((s, i) => {
          const done = s.grp <= step && step > 0;
          s.k = damp(s.k, done ? 1 : 0, 3.2, dt);
          s.flip.rotation.y = Math.PI * smooth(s.k);
          const c = new THREE.Color(SEV[s.sev]).lerp(step >= 5 ? green : blue, smooth(s.k));
          s.ring.material.color.copy(c); s.glow.material.color.copy(c);
          s.glow.material.opacity = 0.18 + (s.grp === step ? 0.25 : 0) + (1 - s.k) * Math.max(0, Math.sin(t * 3 + i)) * 0.15;
          s.g.position.z = s.grp === step ? 1.2 : 0;
        });
        core.material.color.set(C.red).lerp(blue, clamp01(step / 5));
        core.rotation.z = t * 0.03;
      },
    };
  },
};

// ================================================================== 09 departments city
const DEPTS = ['Security Operations Center', 'OT / ICS and NERC CIP', 'Grid Operations', 'Offshore Wind (CVOW)', 'Nuclear Generation', 'Large Load', 'Customer Experience and IT', 'Physical Security', 'Executive, Risk, Compliance', 'Integration Office', 'Federal Mission Assurance', 'AI Governance'];
export const departments = {
  id: 'departments',
  bg: { a: '#03070f', b: '#10223a', c: '#9be7ff', mix: [0.4, 0.8, 0, 0.6] },
  cams: [{ p: [3, 17, 25], t: [8, 2, -3] }, { p: [5, 9, 21], t: [8, 3, 2] }, { p: [6, 10, 21], t: [8.5, 3.6, 1.5] }],
  build() {
    const group = new THREE.Group(); group.position.set(8.5, 0, 0);
    group.add(gridFloor(120, 60, C.ice, 0.1));
    const H = [6, 3.5, 4.5, 3, 5, 3.8, 4.2, 2.8, 5.5, 3.2, 4.6, 3.6];
    const blds = DEPTS.map((n, i) => {
      const gx = (i % 4) - 1.5, gz = Math.floor(i / 4) - 1;
      const pos = i === 0 ? V(-1.5, 0, 3.5) : V(gx * 5, 0, gz * 5 - 4);
      const b = wireBox(2.6, H[i], 2.6, i === 0 ? C.sky : C.ice, 0.08, 0.8); b.position.set(pos.x, H[i] / 2, pos.z); group.add(b);
      const lb = label(n, { size: 0.32, color: '#e6f4ff', bg: 'rgba(3,10,22,0.8)', border: i === 0 ? '#00bceb' : '#4a6380' }); lb.position.set(pos.x, H[i] + 0.8, pos.z); group.add(lb);
      return { b, lb, pos, h: H[i] };
    });
    const personas = [['Director, Cyber Defense', C.sky], ['Tier 1/2 SOC Analyst', C.green], ['Threat Hunter / CTI', C.amber]].map(([n, c], i) => {
      const g = new THREE.Group(); g.position.set(-2.4 + i * 3.1, 0, 6.6); group.add(g);
      const p = person(c, 1.1); g.add(p);
      const l = pill(n, '#' + new THREE.Color(c).getHexString(), 0.32); l.position.y = i === 1 ? 2.7 : 2.1; g.add(l);
      return g;
    });
    const UC = [1, 1, 0, 0, 0, 1, 0, 1, 0]; // 1 = new use case on what you already run
    const cubes = UC.map((u, i) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.55, 1.1), emissiveMat(u ? C.green : C.sky, u ? 1.4 : 0.9));
      m.add(edgeLines(m.geometry, u ? C.green : C.sky, 0.9));
      m.userData.home = V(1.6 + (i % 3) * 1.3, 0.3 + Math.floor(i / 3) * 0.7, 3.5); group.add(m); return m;
    });
    const legend = [pill('4 new use cases on what you already run', '#6cc04a', 0.32), pill('5 extend what you run', '#00bceb', 0.32)];
    legend[0].position.set(3, 3.4, 3.5); legend[1].position.set(3, 2.75, 3.5); legend.forEach((l) => group.add(l));
    let pk = 0, ck = 0;
    return {
      group,
      update(dt, t, step) {
        pk = damp(pk, step >= 1 ? 1 : 0, 3, dt); ck = damp(ck, step >= 2 ? 1 : 0, 2.5, dt);
        blds.forEach((b, i) => { setOpacity(b.b, i === 0 ? 1 : 1 - pk * 0.6); b.lb.material.opacity = i === 0 ? 1 : 1 - pk * 0.88; });
        personas.forEach((p, i) => { p.scale.setScalar(Math.max(0.001, smooth(pk * 3 - i))); });
        cubes.forEach((c, i) => {
          const k = smooth(ck * 2.5 - i * 0.15);
          c.position.copy(c.userData.home); c.position.y += (1 - k) * 6; c.scale.setScalar(Math.max(0.001, k));
          c.rotation.y = (1 - k) * 2;
        });
        legend.forEach((l) => { l.material.opacity = ck; });
      },
    };
  },
};

// ================================================================== 10 dashboards
function drawDash(g, w, h, focus) {
  const s = h / 1080;
  g.fillStyle = '#0b0f17'; roundRect(g, 0, 0, w, h, 26 * s); g.fill();
  g.strokeStyle = '#8e7cff'; g.lineWidth = 4 * s; g.stroke();
  g.fillStyle = '#121826'; g.fillRect(0, 0, w, 74 * s);
  g.textBaseline = 'middle';
  g.fillStyle = '#ffffff'; g.font = `800 ${30 * s}px ${FONT}`; g.fillText('splunk>', 30 * s, 37 * s);
  g.fillStyle = '#9fb3c8'; g.font = `500 ${24 * s}px ${FONT}`; g.fillText('Enterprise Security Premier  ·  Dashboards  ·  Search  ·  Findings  ·  AI Assistant', 180 * s, 37 * s);
  g.fillStyle = '#fbab18'; roundRect(g, w - 300 * s, 18 * s, 270 * s, 40 * s, 20 * s); g.fill();
  g.fillStyle = '#1a1206'; g.font = `800 ${20 * s}px ${FONT}`; g.fillText('ILLUSTRATIVE DATA', w - 278 * s, 38 * s);
  g.fillStyle = '#ffffff'; g.font = `800 ${40 * s}px ${FONT}`; g.textBaseline = 'top'; g.fillText('SOC Command Center', 30 * s, 100 * s);
  g.fillStyle = '#9fb3c8'; g.font = `500 ${22 * s}px ${FONT}`; g.fillText('Last 24 hours · All business units · Converged: cyber + physical · Runs on ES Premier (owned)', 30 * s, 152 * s);
  const kp = [['Findings ingested', '18,442', '-6%'], ['Triage Agent auto-dispositioned', '71%', '+9 pts'], ['Mean time to triage', '3.8 min', '-62%'], ['Mean time to respond', '41 min', '-28%'], ['Analyst hours returned (30d)', '1,236', '+18%'], ['Open risk notables (critical)', '7', '+2']];
  const kw = (w - 60 * s - 5 * 16 * s) / 6;
  kp.forEach(([l, v, d], i) => {
    const x = 30 * s + i * (kw + 16 * s), y = 200 * s;
    g.fillStyle = '#141b29'; roundRect(g, x, y, kw, 170 * s, 14 * s); g.fill();
    g.fillStyle = '#9fb3c8'; g.font = `500 ${19 * s}px ${FONT}`; g.fillText(l, x + 16 * s, y + 16 * s);
    g.fillStyle = '#ffffff'; g.font = `800 ${54 * s}px ${FONT}`; g.fillText(v, x + 16 * s, y + 52 * s);
    g.fillStyle = d.startsWith('-') && i !== 0 ? '#6cc04a' : '#00bceb'; g.font = `700 ${22 * s}px ${FONT}`; g.fillText(d, x + 16 * s, y + 124 * s);
  });
  // dispositions donut
  const dx = 30 * s, dy = 400 * s, dw = 560 * s, dh = 640 * s;
  g.fillStyle = '#141b29'; roundRect(g, dx, dy, dw, dh, 14 * s); g.fill();
  g.fillStyle = '#ffffff'; g.font = `700 ${24 * s}px ${FONT}`; g.fillText('Triage Agent dispositions', dx + 20 * s, dy + 18 * s);
  const parts = [['Benign / false positive', 8120, '#00bceb'], ['Escalated to analyst', 3110, '#fbab18'], ['Auto-contained (SOAR)', 1510, '#6cc04a'], ['Needs more context', 360, '#8e7cff']];
  const tot = parts.reduce((a, p) => a + p[1], 0); let a0 = -Math.PI / 2;
  const cx = dx + dw / 2, cy = dy + 250 * s, rO = 150 * s, rI = 95 * s;
  parts.forEach(([, v, c]) => { const a1 = a0 + (v / tot) * Math.PI * 2; g.beginPath(); g.arc(cx, cy, rO, a0, a1); g.arc(cx, cy, rI, a1, a0, true); g.closePath(); g.fillStyle = c; g.fill(); a0 = a1; });
  g.fillStyle = '#fff'; g.font = `800 ${40 * s}px ${FONT}`; g.textAlign = 'center'; g.fillText('13.1K', cx, cy - 26 * s); g.font = `500 ${20 * s}px ${FONT}`; g.fillStyle = '#9fb3c8'; g.fillText('findings', cx, cy + 20 * s); g.textAlign = 'left';
  parts.forEach(([n, v, c], i) => { const y = dy + 440 * s + i * 46 * s; g.fillStyle = c; g.fillRect(dx + 24 * s, y + 6 * s, 18 * s, 18 * s); g.fillStyle = '#dbe6f2'; g.font = `500 ${21 * s}px ${FONT}`; g.fillText(n, dx + 54 * s, y); g.font = `800 ${21 * s}px ${FONT}`; g.textAlign = 'right'; g.fillText(v.toLocaleString('en-US'), dx + dw - 24 * s, y); g.textAlign = 'left'; });
  // findings by domain
  const bx = 610 * s, bw = 640 * s;
  g.fillStyle = '#141b29'; roundRect(g, bx, dy, bw, dh, 14 * s); g.fill();
  g.fillStyle = '#fff'; g.font = `700 ${24 * s}px ${FONT}`; g.fillText('Findings by domain', bx + 20 * s, dy + 18 * s);
  const dom = [['Identity (Entra, AD, Duo)', 5210], ['Endpoint', 4380], ['Network / Secure Firewall', 3120], ['Email / phishing', 2440], ['OT (Cyber Vision)', 1630], ['Physical (PACS, Meraki MV)', 980], ['Cloud (AWS)', 682]];
  dom.forEach(([n, v], i) => { const y = dy + 80 * s + i * 76 * s; g.fillStyle = '#dbe6f2'; g.font = `500 ${20 * s}px ${FONT}`; g.fillText(n, bx + 20 * s, y); g.fillStyle = i === 4 ? '#2de2c5' : '#00bceb'; g.fillRect(bx + 20 * s, y + 30 * s, (v / 5210) * (bw - 140 * s), 22 * s); g.fillStyle = '#fff'; g.font = `700 ${20 * s}px ${FONT}`; g.fillText(v.toLocaleString('en-US'), bx + 30 * s + (v / 5210) * (bw - 140 * s), y + 30 * s); });
  // top risk entities
  const tx = 1270 * s, tw = w - tx - 30 * s;
  g.fillStyle = '#141b29'; roundRect(g, tx, dy, tw, dh, 14 * s); g.fill();
  g.fillStyle = '#fff'; g.font = `700 ${24 * s}px ${FONT}`; g.fillText('Top risk entities', tx + 20 * s, dy + 18 * s);
  const ent = [['ews-ctrl-ric-04', 182, 'Config export + new RDP'], ['svc_historian', 141, 'Kerberoast pattern'], ['vpn-edge-02', 128, 'Ivanti IOC match (Talos)'], ['contractor.jdoe', 96, 'Badge + VPN impossible travel'], ['ami-headend-01', 88, 'Bulk command outside window']];
  ent.forEach(([e, r, d], i) => { const y = dy + 80 * s + i * 108 * s; g.fillStyle = '#e2231a'; g.globalAlpha = 0.25 + (r / 182) * 0.75; roundRect(g, tx + 20 * s, y, 74 * s, 40 * s, 8 * s); g.fill(); g.globalAlpha = 1; g.fillStyle = '#fff'; g.font = `800 ${22 * s}px ${MONO}`; g.fillText(String(r), tx + 30 * s, y + 8 * s); g.font = `700 ${22 * s}px ${MONO}`; g.fillText(e, tx + 110 * s, y + 2 * s); g.fillStyle = '#9fb3c8'; g.font = `500 ${19 * s}px ${FONT}`; g.fillText(d, tx + 110 * s, y + 36 * s); });
  // focus outline
  const boxes = [[22 * s, 190 * s, w - 44 * s, 190 * s], [22 * s, 392 * s, 1236 * s, dh + 16 * s], [tx - 8 * s, 392 * s, tw + 16 * s, dh + 16 * s]];
  const fb = boxes[focus];
  if (fb) { g.strokeStyle = '#7fe3ff'; g.lineWidth = 6 * s; g.shadowColor = '#00bceb'; g.shadowBlur = 24 * s; roundRect(g, fb[0], fb[1], fb[2], fb[3], 18 * s); g.stroke(); g.shadowBlur = 0; }
}
export const dashboards = {
  id: 'dashboards',
  bg: { a: '#050712', b: '#1a1440', c: '#8e7cff', mix: [0.2, 0.6, 0.8, 0.3] },
  cams: [{ p: [7.5, 6, 22], t: [9.6, 5.6, 0] }, { p: [7.5, 5.8, 21], t: [9.6, 5.5, 0] }, { p: [8.3, 5.8, 21], t: [9.9, 5.5, 0] }],
  build() {
    const group = new THREE.Group(); group.position.set(10.8, 0, 0);
    const screen = canvasPanel(14.4, 8.1, (g, w, h, f = 0) => drawDash(g, w, h, f), 540);
    screen.position.set(0, 5.6, 0); group.add(screen);
    const halo = glowSprite(C.violet, 30, 0.2); halo.position.set(0, 5.6, -1); group.add(halo);
    const others = ['NERC CIP Compliance Scorecard', 'Storm Restoration and OMS Service Health', 'CVOW Construction-to-Operations', 'Federal Mission Assurance', 'AI Agent Governance', 'Executive Cyber and Physical Risk'].map((n, i) => {
      const p = canvasPanel(4.4, 2.5, (g, w, h) => {
        glass(g, w, h, '#8e7cff', 20, 0.85);
        g.fillStyle = '#9fb3c8'; g.font = `600 ${h * 0.1}px ${FONT}`; g.textBaseline = 'top'; g.fillText('DASHBOARD STUDIO · ILLUSTRATIVE', 24, h * 0.1);
        g.fillStyle = '#fff'; g.font = `700 ${h * 0.14}px ${FONT}`; wrap(g, n, 24, h * 0.3, w - 48, h * 0.17, 2);
        for (let k = 0; k < 5; k++) { g.fillStyle = ['#00bceb', '#6cc04a', '#fbab18', '#8e7cff', '#2de2c5'][k]; g.fillRect(24 + k * (w - 48) / 5, h * 0.88 - (0.2 + ((k * 37 + i * 11) % 10) / 30) * h, (w - 48) / 5 - 12, (0.2 + ((k * 37 + i * 11) % 10) / 30) * h); }
      }, 140);
      const a = (i - 1) * 0.22;
      p.position.set(-1 + i * 3.6, 9.4 + (i % 2) * 1.6, -7 - i * 0.4);
      p.rotation.y = -a * 0.5; p.material.opacity = 0.6; group.add(p); return p;
    });
    let last = -1;
    return {
      group,
      update(dt, t, step) {
        if (step !== last) { last = step; screen.userData.redraw(step); }
        screen.position.y = 5.6 + Math.sin(t * 0.7) * 0.08;
        others.forEach((p, i) => { p.position.y += Math.sin(t * 0.6 + i) * 0.002; });
      },
    };
  },
};

// ================================================================== 11 Cloud Control ecosystem
const ECO = [
  ['Cisco', '#00bceb', ['Cyber Vision', 'Secure Firewall', 'ISE', 'Duo', 'XDR', 'Secure Access', 'ThousandEyes', 'Meraki', 'Webex', 'Talos', 'AI Defense'], [-11, 5.5, -3]],
  ['Splunk', '#f25c9a', ['Cloud Platform', 'ES Premier', 'SOAR', 'UEBA', 'ITSI', 'Observability Cloud', 'Edge Hub', 'Federated Search', 'AI Toolkit', 'AI Agent Monitoring'], [11, 5.5, -3]],
  ['Third party', '#fbab18', ['ServiceNow', 'PagerDuty', 'Microsoft', 'AWS', 'Google Cloud + Wiz', 'Slack', 'Linear', 'Confluence', 'Infoblox / BlueCat'], [-10, -0.5, 4]],
  ['Dominion via MCP (examples)', '#6cc04a', ['SAP', 'Esri ArcGIS', 'Amazon Connect', 'Salesforce', 'Snowflake', 'Primavera', 'Plant historians', 'ADMS / OMS'], [10, -0.5, 4]],
];
const STORM = ['Signal: meters last-gasp', 'Reason: recloser lockouts', 'Tool: ArcGIS feeder trace', 'Tool: ServiceNow orders', 'Proposal: crews + texts', 'Human: dispatcher approves', 'Action: crews dispatched', 'Verify: ITSI KPIs green'];
export const cloud = {
  id: 'cloud',
  bg: { a: '#01060c', b: '#032c3a', c: '#00bceb', mix: [1, 0.5, 0, 0.6] },
  cams: [{ p: [3, 10, 21], t: [6, 3.6, 0] }, { p: [3, 8, 19], t: [6, 4.2, 0] }, { p: [3, 13, 32], t: [6, 3.5, 0] }, { p: [5.5, 8, 22], t: [7.8, 2.6, 4] }],
  build() {
    const group = new THREE.Group(); group.position.set(6.5, 0, 0);
    const disc = hexField((x, z) => Math.hypot(x, z) < 6, { r: 0.8, colorOf: () => '#2a0c30', line: C.pink, lineOpacity: 0.55, bounds: [-7, 7, -7, 7] });
    group.add(disc);
    const discLb = pill('splunk>  the data fabric underneath', '#f25c9a', 0.38); discLb.position.set(0, 1.2, 4.6); group.add(discLb);
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 2), new THREE.MeshStandardMaterial({ color: 0x041226, emissive: C.sky, emissiveIntensity: 0.35, flatShading: true }));
    core.add(edgeLines(core.geometry, C.ice, 0.6)); core.position.y = 4.5; group.add(core);
    const coreGlow = glowSprite(C.sky, 10, 0.22); coreGlow.position.y = 4.5; group.add(coreGlow);
    const coreLb = pill('Cisco Cloud Control · one login, one data layer', '#00bceb', 0.44); coreLb.position.set(0, 7.2, 0); group.add(coreLb);
    const builders = new THREE.Group(); builders.position.y = 4.5; group.add(builders);
    const orbs = Array.from({ length: 6 }, (_, i) => { const o = glowSprite([C.gold, C.teal, C.pink, C.green, C.violet, C.ice][i], 1.8, 0.95); builders.add(o); return o; });
    const bLb = pill('Agent Builder · App Builder · AI Defense governs', '#8e7cff', 0.36); bLb.position.set(0, -2.1, 3.2); builders.add(bLb);
    const clusters = ECO.map(([n, c, chips, pos]) => {
      const g = new THREE.Group(); g.position.set(...pos); group.add(g);
      const head = pill(n, c, 0.46); head.position.y = 2.4; g.add(head);
      chips.forEach((tx, j) => { const l = label(tx, { size: 0.28, color: '#e6f4ff', bg: 'rgba(3,10,22,0.8)', border: c }); l.position.set(((j % 3) - 1) * 2.6, 1.4 - Math.floor(j / 3) * 0.75, 0); g.add(l); });
      const ln = lineFrom(new THREE.QuadraticBezierCurve3(V(...pos), V(pos[0] * 0.4, 6.5, pos[2] * 0.4), V(0, 4.5, 0)), col(c), 0.6);
      group.add(ln);
      return { g, ln };
    });
    const path = new THREE.Group(); path.position.set(1.5, 0, 6); group.add(path);
    const stormNodes = STORM.map((tx, i) => {
      const x = (i - 3.5) * 2.3, y = 0.6 + (i % 2) * 1.8;
      const isHuman = i === 5;
      const orb = glowSprite(isHuman ? C.green : C.sky, 1.6, 0.3); orb.position.set(x, y, 0); path.add(orb);
      const l = label(`${i + 1}  ${tx}`, { size: 0.27, color: '#ffffff', bg: 'rgba(3,10,22,0.86)', border: isHuman ? '#6cc04a' : '#00bceb' }); l.position.set(x, y + (i % 2 ? 0.75 : -0.75), 0); path.add(l);
      return { orb, l };
    });
    const pathLb = pill('Storm Surge Agent · scenario replay · human in the loop', '#6cc04a', 0.36); pathLb.position.set(0, 3.8, 0); path.add(pathLb);
    const st = { b: 0, e: 0, p: 0 };
    return {
      group,
      update(dt, t, step) {
        st.b = damp(st.b, step >= 1 ? 1 : 0, 3, dt); st.e = damp(st.e, step >= 2 ? 1 : 0, 2.5, dt); st.p = damp(st.p, step >= 3 ? 1 : 0, 2.5, dt);
        core.rotation.y = t * 0.3; core.rotation.x = t * 0.15;
        orbs.forEach((o, i) => { const a = t * 0.6 + (i / 6) * Math.PI * 2; o.position.set(Math.cos(a) * 3.6, Math.sin(a * 2) * 0.4, Math.sin(a) * 3.6); o.material.opacity = st.b; });
        bLb.material.opacity = st.b * (1 - st.p); discLb.material.opacity = 1 - st.p;
        clusters.forEach((c, i) => { setOpacity(c.g, clamp01(st.e * 1.6 - i * 0.15) * (1 - st.p)); c.ln.material.opacity = st.e * 0.5 * (1 - st.p * 0.8); });
        const live = Math.floor((t * 0.9) % 9);
        stormNodes.forEach((n, i) => { n.l.material.opacity = st.p * (i <= live ? 1 : 0.45); n.orb.material.opacity = st.p * (i === live ? 1 : 0.35); n.orb.scale.setScalar(i === live ? 2.4 : 1.4); });
        pathLb.material.opacity = st.p;
      },
    };
  },
};

// ================================================================== 12 federal mission assurance
const BASES = [['Fort Gregg-Adams [19]', -8, 2], ['NWS Yorktown [21]', 7.5, 3], ['Fort Belvoir', -6, -5.5], ['Fort Myer', 2, -7], ['JEB Little Creek-Fort Story', 9, -3.5], ['JBLE-Eustis', 5, 6.5], ['DC-area federal agencies', -3.5, 7]];
export const federal = {
  id: 'federal',
  bg: { a: '#04060a', b: '#1e2430', c: '#ffd95a', mix: [0.5, 0.9, 0, 0.7] },
  cams: [{ p: [4, 15, 22], t: [7.5, 1, 0] }, { p: [4, 11, 18], t: [7.5, 1.5, 0] }, { p: [5, 17, 25], t: [7.5, 3, 0] }],
  build() {
    const group = new THREE.Group(); group.position.set(8.5, 0, 0);
    group.add(gridFloor(100, 50, C.gold, 0.1));
    const pentGeo = new THREE.CylinderGeometry(2.6, 2.6, 0.9, 5);
    const pent = new THREE.Mesh(pentGeo, new THREE.MeshStandardMaterial({ color: 0x0a0d14, emissive: C.violet, emissiveIntensity: 0.5, transparent: true, opacity: 0.85 }));
    pent.add(edgeLines(pentGeo, C.violet, 1)); pent.position.y = 0.45; group.add(pent);
    const inner = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.95, 5), new THREE.MeshBasicMaterial({ color: 0x02040a })); inner.position.y = 0.46; group.add(inner);
    const pLb = pill('Pentagon / JBM-HH · main electric system owned by Dominion [18]', '#8e7cff', 0.38); pLb.position.set(0, 2.2, 0); group.add(pLb);
    const sub = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), emissiveMat(C.gold, 1.2)); sub.position.set(0, 0.6, -3.6); group.add(sub);
    const feeders = BASES.map(([n, x, z], i) => {
      const node = new THREE.Mesh(new THREE.OctahedronGeometry(0.5), emissiveMat(C.gold, 1.4)); node.position.set(x, 0.6, z); group.add(node);
      const l = label(n, { size: 0.3, color: '#fff6d6', bg: 'rgba(10,10,6,0.82)', border: '#ffd95a' }); l.position.set(x, 1.6, z); group.add(l);
      const tb = drawTube(arc(V(0, 0.6, -3.6), V(x, 0.6, z), 2), { radius: 0.05, color: C.gold, opacity: 0.85 }); group.add(tb);
      return { node, tb };
    });
    const days = Array.from({ length: 14 }, (_, i) => {
      const a0 = (i / 14) * Math.PI * 2;
      const m = new THREE.Mesh(new THREE.RingGeometry(3.3, 3.9, 12, 1, a0 + 0.03, Math.PI * 2 / 14 - 0.06), new THREE.MeshBasicMaterial({ color: C.green, transparent: true, opacity: 0.1, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
      m.rotation.x = -Math.PI / 2; m.position.y = 0.05; group.add(m); return m;
    });
    const dLb = pill('14 days: critical buildings sustained [18]', '#6cc04a', 0.34); dLb.position.set(0, 0.6, 4.6); group.add(dLb);
    const auth = pill('Splunk Cloud: FedRAMP High · DoD IL5 PA [45] [46] · SOAR FedRAMP Moderate [47]', '#00bceb', 0.34); auth.position.set(0, 3.2, 0); group.add(auth);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(10.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: C.sky, wireframe: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    dome.scale.y = 0.55; group.add(dome);
    const agent = new THREE.Group(); agent.position.set(0, 6.8, 0); group.add(agent);
    agent.add(glowSprite(C.green, 3.5, 0.9));
    const sit = pill('Mission Assurance Agent drafts SITREPs · federal programs team approves', '#6cc04a', 0.36); sit.position.y = 1.3; agent.add(sit);
    const encl = pill('Authorized enclave: approved fields only for installation energy managers', '#00bceb', 0.34); encl.position.set(2, 5.2, 4); group.add(encl);
    let k1 = 0, k2 = 0;
    return {
      group,
      update(dt, t, step) {
        k1 = damp(k1, step >= 1 ? 1 : 0, 2.5, dt); k2 = damp(k2, step >= 2 ? 1 : 0, 2.5, dt);
        feeders.forEach((f, i) => { f.tb.userData.setProgress(smooth(Math.min(1, t * 0.4) * 1.2 - i * 0.03)); f.node.rotation.y = t + i; });
        days.forEach((d, i) => { d.material.opacity = 0.08 + smooth(k1 * 15 - i) * 0.6; });
        dLb.material.opacity = k1; auth.material.opacity = k1 * (1 - k2);
        dome.material.opacity = k2 * 0.18; dome.rotation.y = t * 0.05;
        setOpacity(agent, k2); agent.position.y = 6.8 + Math.sin(t) * 0.2; encl.material.opacity = k2;
      },
    };
  },
};

// ================================================================== 13 roadmap
const OPTIONS = [
  [1, 'Full value from ES Premier and SOAR', 3, 9, 0],
  [2, 'CIP-015 readiness', 6, 9, 2],
  [3, 'Digital resilience', 5, 8, 0],
  [4, 'Offshore wind security', 5, 7, 1],
  [5, 'Integration-ready fabric', 3, 8, 0],
  [6, 'Mission assurance', 6, 8, 1],
  [7, 'Trusted AI governance', 3, 7, 0],
  [8, 'One workspace with Cloud Control', 5, 9, 1],
];
export const roadmap = {
  id: 'roadmap',
  bg: { a: '#020a06', b: '#0c2a14', c: '#6cc04a', mix: [1, 0.6, 0, 0.4] },
  cams: [{ p: [5, 7, 22], t: [8.5, 4.6, 0] }, { p: [5, 10, 25], t: [8.5, 3.5, 2] }, { p: [6, 10, 25], t: [8.5, 3.5, 2] }, { p: [7, 10, 25], t: [8.5, 3.5, 2] }],
  build() {
    const group = new THREE.Group(); group.position.set(10, 0, 0);
    const ex = (e) => (e - 4.5) * 3.6, iy = (im) => (im - 6) * 2.4 + 1.5;
    const axes = new THREE.Group(); group.add(axes);
    axes.add(drawTube(new THREE.LineCurve3(V(ex(2), iy(6.4), -2), V(ex(7), iy(6.4), -2)), { radius: 0.04, color: C.ice, opacity: 0.7 }));
    axes.add(drawTube(new THREE.LineCurve3(V(ex(2), iy(6.4), -2), V(ex(2), iy(9.7), -2)), { radius: 0.04, color: C.ice, opacity: 0.7 }));
    axes.children.forEach((c) => c.userData.setProgress(1));
    const xl = label('Effort and time to value', { size: 0.34, color: '#9be7ff' }); xl.position.set(ex(4.5), iy(6.4) - 0.8, -2); axes.add(xl);
    const yl = label('Business impact', { size: 0.34, color: '#9be7ff' }); yl.position.set(ex(2) - 1.6, iy(9.7) + 0.3, -2); axes.add(yl);
    const qw = new THREE.Mesh(new THREE.PlaneGeometry(ex(3.6) - ex(2), iy(9.6) - iy(6.6)), new THREE.MeshBasicMaterial({ color: C.green, transparent: true, opacity: 0.12, depthWrite: false }));
    qw.position.set((ex(3.6) + ex(2)) / 2, (iy(9.6) + iy(6.6)) / 2, -2.1); axes.add(qw);
    const qwl = label('Quick wins', { size: 0.36, color: '#c8f5b0' }); qwl.position.set(ex(2.8), iy(9.6) + 0.4, -2); axes.add(qwl);
    const lanes = ['Now · Q4 2026 to Q1 2027', 'Next · 2027', 'Then · to Oct 2028'].map((n, i) => {
      const g = new THREE.Group(); g.position.set((i - 1) * 6.6 + 1, 0, 5); group.add(g);
      const geo = new THREE.BoxGeometry(6.8, 0.3, 3.2);
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x050e1d, emissive: [C.green, C.sky, C.violet][i], emissiveIntensity: 0.3, transparent: true, opacity: 0.6 }));
      m.add(edgeLines(geo, [C.green, C.sky, C.violet][i], 0.9)); g.add(m);
      const l = pill(n, ['#6cc04a', '#00bceb', '#8e7cff'][i], 0.36); l.position.set(0, 0.6, 2.2); g.add(l);
      return g;
    });
    const per = [0, 0, 0];
    const balls = OPTIONS.map(([n, name, eff, imp, lane]) => {
      const g = new THREE.Group(); group.add(g);
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.45, 20, 14), emissiveMat(lane === 0 ? C.green : lane === 1 ? C.sky : C.violet, 1.5)); g.add(m);
      const l = label(`${n}  ${name}`, { size: 0.28, color: '#ffffff', bg: 'rgba(3,10,22,0.85)', border: lane === 0 ? '#6cc04a' : lane === 1 ? '#00bceb' : '#8e7cff' }); l.center.set(0, 0.5); l.position.set(0.65, 0, 0); g.add(l);
      const j = per[lane]++;
      const chart = V(ex(eff), iy(imp) + (n === 8 ? -0.9 : n === 4 ? -0.5 : n === 6 ? -0.45 : 0), -2 + (n % 3) * 0.3);
      const laneP = V((lane - 1) * 6.6 + 1 - 2.6, 0.9 + j * 0.85, 4.4);
      return { g, chart, laneP, lane, k: 0 };
    });
    return {
      group,
      update(dt, t, step) {
        balls.forEach((b, i) => {
          b.k = damp(b.k, step >= b.lane + 1 ? 1 : 0, 2.6, dt);
          b.g.position.lerpVectors(b.chart, b.laneP, smooth(b.k));
          b.g.position.y += Math.sin(t * 2 + i) * 0.05 + Math.sin(smooth(b.k) * Math.PI) * 2;
        });
        lanes.forEach((l, i) => setOpacity(l, step >= i + 1 ? 1 : 0.25));
        setOpacity(axes, step === 0 ? 1 : 0.45);
      },
    };
  },
};

// ================================================================== 14 sources wall
export const sources = {
  id: 'sources',
  bg: { a: '#030510', b: '#10183a', c: '#9be7ff', mix: [0.2, 0.4, 0.2, 1] },
  cams: [{ p: [7, 6, 23], t: [9.5, 5.5, 0] }],
  build() {
    const group = new THREE.Group(); group.position.set(12.6, 0, 0); group.scale.setScalar(0.78);
    const per = 13;
    const panels = [0, 1, 2, 3, 4].map((c) => {
      const rows = SOURCE_SHORT.slice(c * per, c * per + per);
      const p = canvasPanel(4.4, 9.6, (g, w, h) => {
        glass(g, w, h, '#9be7ff', 22, 0.9);
        g.textBaseline = 'top';
        rows.forEach(([n, pub, tt], i) => {
          const y = 24 + i * (h - 40) / per;
          g.fillStyle = '#00bceb'; g.font = `800 ${h * 0.017}px ${MONO}`; g.fillText(String(n).padStart(2, '0'), 22, y + 2);
          g.fillStyle = '#9be7ff'; g.font = `700 ${h * 0.0145}px ${FONT}`; g.fillText(pub.slice(0, 34), 76, y);
          g.fillStyle = '#e6f4ff'; g.font = `500 ${h * 0.0135}px ${FONT}`; wrap(g, tt, 76, y + h * 0.021, w - 96, h * 0.017, 3);
        });
      }, 420);
      const a = (c - 2) * 0.2;
      p.position.set(Math.sin(a) * 26 - 0.5, 5.6, Math.cos(a) * 26 - 26 - Math.abs(c - 2) * 0.4);
      p.position.x = (c - 2) * 4.7;
      p.rotation.y = -a * 0.6;
      group.add(p); return p;
    });
    const dust = points(900, () => [rr(-16, 16), rr(-2, 14), rr(-10, -2)], { size: 0.22, color: C.ice, opacity: 0.4 }); group.add(dust);
    const badge = pill('Public sources · research current as of Oct 22, 2026', '#9be7ff', 0.38); badge.position.set(0, 11.2, 0.2); group.add(badge);
    let k = 0;
    return {
      group,
      update(dt, t) {
        k = damp(k, 1, 2, dt);
        panels.forEach((p, i) => { p.material.opacity = smooth(k * 3 - i * 0.3); p.position.y = 5.6 + Math.sin(t * 0.6 + i) * 0.06; });
        dust.rotation.y = t * 0.01;
      },
      reset() { k = 0; },
    };
  },
};

// ================================================================== 15 close
export const close = {
  id: 'close',
  bg: { a: '#01040b', b: '#062a4d', c: '#00bceb', mix: [1, 0.6, 0, 0.5] },
  bgSteps: [null, { a: '#02070a', b: '#0c2a24', c: '#6cc04a', mix: [1, 0.6, 0.2, 0.6] }],
  cams: [{ p: [0, 6, 34], t: [0, 4, 0] }, { p: [0, 7, 38], t: [0, 4.6, 0] }],
  build() {
    const group = new THREE.Group();
    const bars = bridgeBars({ spacing: 2.0, unit: 2.4, radius: 0.42 });
    const lift = new THREE.Group(); lift.position.y = 5; lift.add(bars); group.add(lift);
    const terr = hexField(inTerritory, { r: 0.85, colorOf: (x, z) => ['#0d2a4c', '#0b2442', '#0a2038'][stateOf(z)], line: C.sky, lineOpacity: 0.25, bounds: [-19, 12, -14, 14] });
    terr.scale.setScalar(0.9); terr.position.set(0, 0, -6); group.add(terr);
    const steps4 = ['ES Premier and SOAR adoption review', 'CIP-015 storage design checkpoint', 'Cloud Control executive session', 'Prioritize two roadmap options'].map((n, i) => {
      const l = pill(`${i + 1}  ${n}`, i < 2 ? '#00bceb' : '#6cc04a', 0.5); l.position.set((i % 2 ? 1 : -1) * 5.6, i < 2 ? 14.4 : 13, -4); group.add(l); return l;
    });
    const wave = [];
    for (let i = 0; i < 64; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1, 0.18), emissiveMat(i % 2 ? C.sky : C.green, 1.4)); b.position.set((i - 31.5) * 0.5, 0, 5); group.add(b); wave.push(b); }
    let k = 0, wk = 0;
    return {
      group,
      update(dt, t, step) {
        k = damp(k, 1, 1.4, dt); wk = damp(wk, step >= 1 ? 1 : 0, 2, dt);
        bars.userData.setHeights(smooth(k), t);
        steps4.forEach((l, i) => { l.material.opacity = i < 2 ? 1 : wk; });
        wave.forEach((b, i) => { b.visible = wk > 0.03; const h = 0.1 + wk * (0.4 + Math.abs(Math.sin(t * 3 + i * 0.35) * Math.sin(i * 0.12 + t)) * 2.4); b.scale.y = h; b.position.y = h / 2; });
      },
      reset() { k = 0; },
    };
  },
};
