// CSX building blocks: track, bungalow, signals, masts, flowing telemetry, evidence tags,
// the Microsoft Sentinel panel and the illustrative KPI panel. Built on core.js.
import * as THREE from 'three';
import { C, label, canvasPanel, roundRect, wireBox, glowSprite, glowTexture, emissiveMat, edgeLines, damp, smooth, setOpacity } from './core.js';

export const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const col = (h) => new THREE.Color(h).getHex();
export const TAGC = { PUBLIC: '#00bceb', MODELED: '#fbab18', ILLUSTRATIVE: '#f25c9a' };
export const RED = '#ff5a4a', GREEN = '#6cc04a', SENT = '#5aa0ff', LIME = '#a3e635', PINK = '#f472b6';

// Dark pill label with a colored border, readable over glowing geometry.
export function pill(text, color = '#9be7ff', size = 0.5, opts = {}) {
  return label(text, { size, color: '#ffffff', bg: 'rgba(3,10,22,0.82)', border: color, ...opts });
}
// Evidence tag: PUBLIC, MODELED or ILLUSTRATIVE, in the original's colors.
export function tag(kind, size = 0.34, extra = '') {
  const c = TAGC[kind];
  return label(extra ? `${kind} · ${extra}` : kind, { size, color: c, bg: 'rgba(3,10,22,0.88)', border: c, weight: 700, mono: true });
}
export function qmark(color = RED, size = 1.1) {
  return label('?', { size, color, weight: 800, glow: true, pad: 10 });
}

// Two rails and sleepers along x, from x0 to x1.
export function track(x0, x1, { color = C.sky, gauge = 1.0, opacity = 0.9, sleepers = true } = {}) {
  const g = new THREE.Group();
  const len = x1 - x0;
  const railMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
  [-gauge / 2, gauge / 2].forEach((z) => {
    const r = new THREE.Mesh(new THREE.BoxGeometry(len, 0.07, 0.07), railMat);
    r.position.set(x0 + len / 2, 0.16, z); g.add(r);
  });
  if (sleepers) {
    const n = Math.floor(len / 0.7);
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 0.08, gauge + 0.7), new THREE.MeshStandardMaterial({ color: 0x0b1a2c, emissive: color, emissiveIntensity: 0.12, roughness: 0.8 }), n);
    const m = new THREE.Matrix4();
    for (let i = 0; i < n; i++) { m.makeTranslation(x0 + 0.35 + i * 0.7, 0.06, 0); im.setMatrixAt(i, m); }
    g.add(im);
  }
  g.userData.railMat = railMat;
  return g;
}

// The signal bungalow: an equipment house with a pitched roof outline.
export function bungalow(w = 3, h = 2.4, d = 2.4, color = C.sky, fill = 0.1) {
  const g = new THREE.Group();
  const box = wireBox(w, h, d, color, fill, 0.95);
  box.position.y = h / 2; g.add(box);
  const roofGeo = new THREE.ConeGeometry(Math.max(w, d) * 0.75, h * 0.35, 4, 1);
  roofGeo.rotateY(Math.PI / 4); roofGeo.scale(w / Math.max(w, d), 1, d / Math.max(w, d));
  const roof = edgeLines(roofGeo, color, 0.7);
  roof.position.y = h + h * 0.175; g.add(roof);
  const door = edgeLines(new THREE.PlaneGeometry(w * 0.26, h * 0.62), color, 0.7);
  door.position.set(-w * 0.2, h * 0.31, d / 2 + 0.01); g.add(door);
  g.userData = { box, roof, w, h, d };
  return g;
}

// Signal mast with three aspects. setAspect(0 red, 1 amber, 2 green).
export function signalMast(h = 4.2) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, h, 8), new THREE.MeshStandardMaterial({ color: 0x1d3550, emissive: C.sky, emissiveIntensity: 0.15 }));
  pole.position.y = h / 2; g.add(pole);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.5, 0.4), new THREE.MeshStandardMaterial({ color: 0x06101e, roughness: 0.5 }));
  head.position.set(0, h + 0.3, 0); g.add(head);
  const cols = [0xff3b30, 0xfbab18, 0x6cc04a];
  const lamps = cols.map((c, i) => {
    const s = glowSprite(c, 0.9, 0.25); s.position.set(0, h + 0.8 - i * 0.48, 0.3); g.add(s); return s;
  });
  g.userData.lamps = lamps;
  g.userData.setAspect = (a, k = 1) => lamps.forEach((l, i) => { l.material.opacity = i === a ? 0.95 * k + 0.1 : 0.12; });
  return g;
}

// Lattice radio mast with a blinking tip.
export function mast(h = 8, color = C.sky) {
  const g = new THREE.Group();
  const geo = new THREE.CylinderGeometry(0.15, 0.55, h, 3, 6, true);
  const lines = edgeLines(geo, color, 0.8); lines.position.y = h / 2; g.add(lines);
  const wire = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.25 }));
  wire.position.y = h / 2; g.add(wire);
  const tip = glowSprite(color, 1.6, 0.9); tip.position.y = h + 0.2; g.add(tip);
  g.userData = { tip, h };
  return g;
}

// Expanding radio rings from a point (vertical, facing the camera roughly).
export function radioRings(color = C.sky, n = 3, r = 2.2) {
  const g = new THREE.Group();
  const rings = [];
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.03, 6, 64, Math.PI), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
    g.add(m); rings.push(m);
  }
  g.userData.update = (t, k = 1) => rings.forEach((m, i) => {
    const u = (t * 0.5 + i / n) % 1;
    m.scale.setScalar(0.3 + u * r); m.material.opacity = (1 - u) * 0.7 * k;
  });
  return g;
}

// A small equipment box with an emissive face and a name label above it.
export function device(name, color = C.sky, w = 2.1, h = 1.0, d = 0.55, labelSize = 0.3) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x07182d, emissive: col(typeof color === 'number' ? '#' + color.toString(16).padStart(6, '0') : color), emissiveIntensity: 0.25, roughness: 0.4 });
  const box = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  g.add(box);
  const e = edgeLines(box.geometry, typeof color === 'number' ? color : col(color), 0.9); g.add(e);
  const leds = [];
  for (let i = 0; i < 4; i++) {
    const l = glowSprite(i % 2 ? C.green : (typeof color === 'number' ? color : col(color)), 0.32, 0.8);
    l.position.set(-w / 2 + 0.3 + i * 0.25, -h / 2 + 0.22, d / 2 + 0.02); g.add(l); leds.push(l);
  }
  let lb = null;
  if (name) { lb = label(name, { size: labelSize, color: '#e6f6ff', bg: 'rgba(3,10,22,0.8)' }); lb.position.set(0, h / 2 + 0.36, 0.1); g.add(lb); }
  g.userData = { box, mat, leds, lb, edges: e };
  return g;
}

// Telemetry dots that run along a curve. update(t, k, speed) with k as visibility.
export function flow(curve, n = 18, color = C.sky, size = 0.45) {
  const pos = new Float32Array(n * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ size, color, map: glowTexture(), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  const tmp = new THREE.Vector3();
  pts.userData.update = (t, k = 1, speed = 0.25, drop = null) => {
    mat.opacity = k;
    pts.visible = k > 0.01;
    if (!pts.visible) return;
    for (let i = 0; i < n; i++) {
      const u = (t * speed + i / n) % 1;
      curve.getPointAt(u, tmp);
      if (drop && drop(u, i)) tmp.y -= 1000;
      pos[i * 3] = tmp.x; pos[i * 3 + 1] = tmp.y; pos[i * 3 + 2] = tmp.z;
    }
    geo.attributes.position.needsUpdate = true;
  };
  return pts;
}

// A thin line along a curve (cheap, for paths that should not bloom much).
export function pathLine(curve, color = C.sky, opacity = 0.5, dashed = false) {
  const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(80));
  const mat = dashed
    ? new THREE.LineDashedMaterial({ color, transparent: true, opacity, dashSize: 0.5, gapSize: 0.35, depthWrite: false })
    : new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending });
  const l = new THREE.Line(geo, mat);
  if (dashed) l.computeLineDistances();
  return l;
}

export function groundRing(r = 1.5, color = C.sky, opacity = 0.7, tube = 0.04) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 6, 96), new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
  m.rotation.x = Math.PI / 2;
  return m;
}

export function laptop(color = RED) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 1.0), new THREE.MeshStandardMaterial({ color: 0x0b1626, emissive: col(color), emissiveIntensity: 0.2 }));
  const scr = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.05), new THREE.MeshStandardMaterial({ color: 0x0b1626, emissive: col(color), emissiveIntensity: 0.9 }));
  scr.position.set(0, 0.47, -0.5); scr.rotation.x = -0.25;
  g.add(base, scr);
  g.userData = { scr };
  return g;
}

export function truck(color = C.amber) {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: 0x0d1b2c, emissive: color, emissiveIntensity: 0.5, roughness: 0.5 });
  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 1.0), m); cab.position.set(0.95, 0.55, 0);
  const bed = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 1.0), m); bed.position.set(-0.3, 0.4, 0);
  g.add(cab, bed);
  const hl = glowSprite(0xfff3c4, 0.7, 0.9); hl.position.set(1.45, 0.5, 0); g.add(hl);
  return g;
}

export function train(cars = 3, color = C.sky) {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: 0x0a1a2e, emissive: color, emissiveIntensity: 0.35, roughness: 0.5 });
  for (let i = 0; i < cars; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(i === 0 ? 3.0 : 3.4, i === 0 ? 1.5 : 1.3, 1.25), m);
    b.position.set(-i * 3.6, 0.95, 0); g.add(b);
    { const e = edgeLines(b.geometry, color, 0.6); e.position.copy(b.position); g.add(e); }
  }
  const hl = glowSprite(0xfff3c4, 2.2, 0.9); hl.position.set(1.6, 1.1, 0); g.add(hl);
  return g;
}

// Microsoft Sentinel panel: four-square mark, an ASSUMED SIEM tag, and event rows.
// redraw(rows, lit) where rows = [[source, text, color], ...] and lit = number of rows shown.
export function sentinelPanel(w = 6.4, h = 3.4, title = 'Microsoft Sentinel') {
  return canvasPanel(w, h, (g, W, H, rows = [], lit = 0, note = 'ASSUMED SIEM · not publicly confirmed') => {
    g.fillStyle = 'rgba(5,14,32,0.92)'; roundRect(g, 4, 4, W - 8, H - 8, 26); g.fill();
    g.strokeStyle = SENT; g.lineWidth = 4; g.stroke();
    const s = H * 0.055, x0 = 34, y0 = 30;
    [['#f25022', 0, 0], ['#7fba00', 1, 0], ['#00a4ef', 0, 1], ['#ffb900', 1, 1]].forEach(([c, i, j]) => { g.fillStyle = c; g.fillRect(x0 + i * (s + 4), y0 + j * (s + 4), s, s); });
    g.fillStyle = '#ffffff'; g.font = `700 ${H * 0.085}px Inter, Arial`; g.textBaseline = 'middle';
    g.fillText(title, x0 + s * 2 + 22, y0 + s + 2);
    g.fillStyle = '#9fb3c8'; g.font = `600 ${H * 0.045}px "JetBrains Mono", monospace`;
    g.fillText(note, x0, y0 + s * 2 + 34);
    rows.forEach(([src, txt, c], i) => {
      const y = H * 0.42 + i * H * 0.165;
      const on = i < lit;
      g.globalAlpha = on ? 1 : 0.25;
      g.fillStyle = 'rgba(90,160,255,0.10)'; roundRect(g, x0 - 8, y - H * 0.065, W - x0 * 2 + 16, H * 0.13, 12); g.fill();
      g.fillStyle = c || SENT; g.fillRect(x0 - 8, y - H * 0.065, 8, H * 0.13);
      g.font = `700 ${H * 0.05}px "JetBrains Mono", monospace`; g.fillText(src.toUpperCase(), x0 + 12, y);
      g.fillStyle = '#e6f0ff'; g.font = `500 ${H * 0.058}px Inter, Arial`;
      g.fillText(txt, x0 + 12 + g.measureText('X').width * 0 + W * 0.25, y);
      g.globalAlpha = 1;
    });
  }, 220);
}

// Illustrative KPI panel: rows = [[metric, without, with], ...].
export function kpiPanel(rows, w = 6.2, h = 2.9) {
  return canvasPanel(w, h, (g, W, H) => {
    g.fillStyle = 'rgba(5,14,32,0.92)'; roundRect(g, 4, 4, W - 8, H - 8, 26); g.fill();
    g.strokeStyle = TAGC.ILLUSTRATIVE; g.lineWidth = 4; g.stroke();
    g.textBaseline = 'middle';
    g.fillStyle = TAGC.ILLUSTRATIVE; g.font = `700 ${H * 0.07}px "JetBrains Mono", monospace`;
    g.fillText('ILLUSTRATIVE · MODELED KPIS', 34, H * 0.13);
    g.fillStyle = '#9fb3c8'; g.font = `600 ${H * 0.06}px Inter, Arial`;
    g.fillText('Without Cisco', W * 0.42, H * 0.28); g.fillText('With Cisco', W * 0.71, H * 0.28);
    rows.forEach(([m, a, b], i) => {
      const y = H * 0.44 + i * H * 0.17;
      g.fillStyle = '#e6f0ff'; g.font = `600 ${H * 0.07}px Inter, Arial`; g.fillText(m, 34, y);
      g.fillStyle = '#ff7a6a'; g.font = `700 ${H * 0.08}px Inter, Arial`; g.fillText(a, W * 0.42, y);
      g.fillStyle = '#9be37a'; g.fillText(b, W * 0.71, y);
    });
  }, 220);
}

// Generic glass info card: title line plus up to five text rows.
export function infoPanel(title, rows, color = '#00bceb', w = 6, h = 3.2, sub = '') {
  return canvasPanel(w, h, (g, W, H, lit = rows.length) => {
    g.fillStyle = 'rgba(5,14,32,0.9)'; roundRect(g, 4, 4, W - 8, H - 8, 26); g.fill();
    g.strokeStyle = color; g.lineWidth = 4; g.stroke();
    g.textBaseline = 'middle';
    g.fillStyle = color; g.font = `700 ${H * 0.085}px Inter, Arial`; g.fillText(title, 34, H * 0.15);
    if (sub) { g.fillStyle = '#9fb3c8'; g.font = `600 ${H * 0.05}px "JetBrains Mono", monospace`; g.fillText(sub, 34, H * 0.27); }
    rows.forEach((r, i) => {
      const y = H * (sub ? 0.42 : 0.36) + i * H * 0.14;
      g.globalAlpha = i < lit ? 1 : 0.25;
      g.fillStyle = color; g.beginPath(); g.arc(44, y, H * 0.018, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#e6f0ff'; g.font = `500 ${H * 0.062}px Inter, Arial`; g.fillText(r, 64, y);
      g.globalAlpha = 1;
    });
  }, 220);
}

// Make a mesh face the camera direction (+z of the world) from a group with a world position.
export function faceFront(obj, yaw = 0) { obj.rotation.set(0, yaw, 0); }

// Fade helper: damp a value and apply opacity to a subtree in one call.
export function fader(obj, start = 0) {
  let k = start;
  return (target, dt, rate = 3) => { k = damp(k, target, rate, dt); setOpacity(obj, smooth(k)); return k; };
}

export { emissiveMat };
