import * as THREE from 'three';

export const C = {
  blue: 0x049fd9,
  sky: 0x00bceb,
  midnight: 0x050e1d,
  navy: 0x07182d,
  ice: 0x9be7ff,
  deep: 0x030a16,
  green: 0x6cc04a,
  amber: 0xfbab18,
  red: 0xe2231a,
  pink: 0xf25c9a,
  violet: 0x8e7cff,
  teal: 0x2de2c5,
  gold: 0xffd95a,
  white: 0xffffff,
};

// Text and screenshots render after bloom so they stay crisp.
export const OVERLAY = 1;

export const damp = (a, b, lambda, dt) => a + (b - a) * (1 - Math.exp(-lambda * dt));
export const clamp01 = (x) => Math.min(1, Math.max(0, x));
export const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
export const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const lerp = (a, b, t) => a + (b - a) * t;

let seed = 1337;
export const rand = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};
export const rr = (a, b) => a + (b - a) * rand();

let glowTex;
export function glowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.18, 'rgba(255,255,255,0.85)');
  grd.addColorStop(0.45, 'rgba(255,255,255,0.22)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  glowTex = new THREE.CanvasTexture(c);
  glowTex.colorSpace = THREE.SRGBColorSpace;
  return glowTex;
}

export function glowSprite(color, size = 4, opacity = 1) {
  const m = new THREE.SpriteMaterial({
    map: glowTexture(), color, transparent: true, opacity,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const s = new THREE.Sprite(m);
  s.scale.set(size, size, 1);
  return s;
}

const FONT = '"CiscoSansTT", Inter, "Segoe UI", Helvetica, Arial, sans-serif';
const MONO = '"JetBrains Mono", Menlo, Consolas, monospace';

// Canvas-backed text sprite. Height is in world units; width follows text aspect.
export function label(text, opts = {}) {
  const {
    size = 1.2, color = '#ffffff', bg = null, border = null, weight = 600,
    mono = false, pad = 18, font = null, opacity = 1, depthTest = true, glow = false,
  } = opts;
  const lines = String(text).split('\n');
  const px = 64;
  const c = document.createElement('canvas');
  const g = c.getContext('2d');
  const f = font || `${weight} ${px}px ${mono ? MONO : FONT}`;
  g.font = f;
  const w = Math.ceil(Math.max(...lines.map((l) => g.measureText(l).width)) + pad * 2);
  const lh = px * 1.18;
  const h = Math.ceil(lh * lines.length + pad * 1.4);
  c.width = w; c.height = h;
  g.font = f;
  if (bg) {
    g.fillStyle = bg;
    roundRect(g, 2, 2, w - 4, h - 4, 22);
    g.fill();
  }
  if (border) {
    g.strokeStyle = border; g.lineWidth = 4;
    roundRect(g, 3, 3, w - 6, h - 6, 22);
    g.stroke();
  }
  g.fillStyle = color;
  g.textBaseline = 'middle';
  if (glow) { g.shadowColor = color; g.shadowBlur = 18; }
  lines.forEach((l, i) => g.fillText(l, pad, pad * 0.7 + lh * (i + 0.5)));
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const m = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity, depthWrite: false, depthTest, fog: false, toneMapped: false });
  const s = new THREE.Sprite(m);
  s.layers.set(OVERLAY);
  const worldH = size * lines.length * 1.18 + size * 0.4;
  s.scale.set((worldH * w) / h, worldH, 1);
  s.userData.baseScale = s.scale.clone();
  return s;
}

// Flat panel with canvas content, drawn by a callback. Returns mesh plus redraw fn.
export function canvasPanel(w, h, draw, res = 256) {
  const c = document.createElement('canvas');
  c.width = Math.round(res * w / h * 2);
  c.height = res * 2;
  const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: false, toneMapped: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  mesh.layers.set(OVERLAY);
  const redraw = (...args) => { g.clearRect(0, 0, c.width, c.height); draw(g, c.width, c.height, ...args); tex.needsUpdate = true; };
  redraw();
  mesh.userData.redraw = redraw;
  return mesh;
}

export function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

export function glassMat(color = C.sky, opacity = 0.18) {
  return new THREE.MeshPhysicalMaterial({
    color, transparent: true, opacity, roughness: 0.15, metalness: 0.1,
    transmission: 0, depthWrite: false, side: THREE.DoubleSide,
  });
}

export function emissiveMat(color, intensity = 1.6) {
  return new THREE.MeshStandardMaterial({ color: 0x000000, emissive: color, emissiveIntensity: intensity, roughness: 0.4 });
}

export function edgeLines(geo, color = C.sky, opacity = 0.9) {
  return new THREE.LineSegments(
    new THREE.EdgesGeometry(geo),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false })
  );
}

export function wireBox(w, h, d, color = C.sky, fillOpacity = 0.08, lineOpacity = 0.9) {
  const g = new THREE.Group();
  const geo = new THREE.BoxGeometry(w, h, d);
  const fill = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: fillOpacity, depthWrite: false }));
  const lines = edgeLines(geo, color, lineOpacity);
  g.add(fill, lines);
  g.userData.fill = fill; g.userData.lines = lines;
  return g;
}

export function gridFloor(size = 200, div = 80, color = C.sky, opacity = 0.18) {
  const grid = new THREE.GridHelper(size, div, color, color);
  grid.material.transparent = true;
  grid.material.opacity = opacity;
  grid.material.depthWrite = false;
  grid.material.blending = THREE.AdditiveBlending;
  return grid;
}

export function points(count, fill, { size = 0.25, color = C.sky, opacity = 0.9 } = {}) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const v = fill(i);
    pos[i * 3] = v[0]; pos[i * 3 + 1] = v[1]; pos[i * 3 + 2] = v[2];
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    size, color, map: glowTexture(), transparent: true, opacity,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
  });
  return new THREE.Points(geo, mat);
}

// A tube along a curve that "draws" itself via drawRange as progress goes 0..1.
export function drawTube(curve, { radius = 0.08, color = C.sky, seg = 200, opacity = 1 } = {}) {
  const geo = new THREE.TubeGeometry(curve, seg, radius, 6, false);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
  const mesh = new THREE.Mesh(geo, mat);
  const total = geo.index.count;
  mesh.userData.setProgress = (p) => {
    const n = Math.floor(clamp01(p) * seg) * 6 * 6;
    geo.setDrawRange(0, Math.min(total, n));
  };
  mesh.userData.setProgress(0);
  return mesh;
}

export function arc(a, b, lift = 4) {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  mid.y += lift;
  return new THREE.QuadraticBezierCurve3(a.clone(), mid, b.clone());
}

export function setOpacity(obj, o) {
  obj.traverse((n) => {
    if (n.material) {
      const mats = Array.isArray(n.material) ? n.material : [n.material];
      mats.forEach((m) => {
        if (m.userData.baseOpacity === undefined) m.userData.baseOpacity = m.opacity;
        m.transparent = true;
        m.opacity = m.userData.baseOpacity * o;
      });
    }
  });
  obj.visible = o > 0.003;
}

// Simple low-poly person: capsule body + head sphere.
export function person(color = C.white, scale = 1) {
  const g = new THREE.Group();
  const mat = emissiveMat(color, 0.9);
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.6, 4, 8), mat);
  body.position.y = 0.55;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), mat);
  head.position.y = 1.15;
  g.add(body, head);
  g.scale.setScalar(scale);
  return g;
}

export function plane(color = C.white, scale = 1) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xdfe8f2, emissive: color, emissiveIntensity: 0.25, roughness: 0.5, metalness: 0.3 });
  const fus = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 3.2, 4, 10), mat);
  fus.rotation.z = Math.PI / 2;
  const wing = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 4.2), mat);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 1.5), mat);
  tail.position.x = -1.7;
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.9, 0.06), mat);
  fin.position.set(-1.75, 0.45, 0);
  g.add(fus, wing, tail, fin);
  g.scale.setScalar(scale);
  return g;
}

export function hexColor(n) { return '#' + n.toString(16).padStart(6, '0'); }
