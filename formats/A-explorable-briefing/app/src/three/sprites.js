import * as THREE from 'three';

let glowTex = null;
function glowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)');
  r.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  glowTex = new THREE.CanvasTexture(c);
  glowTex.colorSpace = THREE.SRGBColorSpace;
  return glowTex;
}

/** Additive radial glow sprite. */
export function glow(color, size = 1, opacity = 1) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture(), color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  s.scale.set(size, size, 1);
  return s;
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

const FONT = 'Inter, system-ui, sans-serif';
/** Canvas-texture label sprite: title (60px) plus optional sub line (40px), rounded glass pill. */
export function label(text, opts = {}) {
  const {
    size = 0.5, color = '#e6f0ff', bg = 'rgba(8,16,32,0.78)', border = 'rgba(120,180,255,0.55)',
    weight = 600, sub = null, subColor = '#93a4c3', depthTest = true,
  } = opts;
  const c = document.createElement('canvas');
  const g = c.getContext('2d');
  g.font = `${weight} 60px ${FONT}`;
  let w = g.measureText(text).width;
  if (sub) { g.font = `500 40px ${FONT}`; w = Math.max(w, g.measureText(sub).width); }
  const h = 60 + (sub ? 52 : 0) + 40;
  c.width = Math.ceil(w + 72);
  c.height = Math.ceil(h);
  if (bg) {
    g.fillStyle = bg;
    roundRect(g, 1, 1, c.width - 2, c.height - 2, 24);
    g.fill();
    g.strokeStyle = border;
    g.lineWidth = 4;
    g.stroke();
  }
  g.font = `${weight} 60px ${FONT}`;
  g.fillStyle = color;
  g.textBaseline = 'top';
  g.fillText(text, 36, 20);
  if (sub) { g.font = `500 40px ${FONT}`; g.fillStyle = subColor; g.fillText(sub, 36, 92); }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest }));
  const aspect = c.width / c.height;
  s.scale.set(size * aspect * (c.height / 100), size * (c.height / 100), 1);
  s.renderOrder = 10;
  return s;
}

/** Standard-material box. */
export function box(w, h, d, color, o = {}) {
  const m = new THREE.MeshStandardMaterial({
    color, roughness: o.rough ?? 0.7, metalness: o.metal ?? 0.1, emissive: o.emissive ?? 0,
    emissiveIntensity: o.ei ?? 1, transparent: !!o.opacity, opacity: o.opacity ?? 1,
  });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  mesh.castShadow = o.shadow ?? true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Standard-material cylinder. */
export function cyl(rt, rb, h, color, o = {}) {
  const m = new THREE.MeshStandardMaterial({
    color, roughness: o.rough ?? 0.6, metalness: o.metal ?? 0.3, emissive: o.emissive ?? 0, emissiveIntensity: o.ei ?? 1,
  });
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, o.seg ?? 16), m);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** A thin tube along a curve with glowing beads that travel along it. group.userData.tick(t) animates. */
export function flow(points, color, { beads = 14, size = 0.25, speed = 0.25, tube = 0.02, opacity = 0.35 } = {}) {
  const g = new THREE.Group();
  const curve = new THREE.CatmullRomCurve3(points);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 64, tube, 6, false),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false })));
  const list = [];
  for (let i = 0; i < beads; i++) {
    const s = glow(color, size, 0.95);
    g.add(s);
    list.push({ s, o: i / beads });
  }
  g.userData.tick = (t) => {
    for (const b of list) b.s.position.copy(curve.getPointAt((b.o + t * speed) % 1));
  };
  return g;
}

/** Arc control points from a to b with a lift in the middle. */
export const arc = (a, b, lift = 4) => [a, a.clone().lerp(b, 0.5).add(new THREE.Vector3(0, lift, 0)), b];

const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
/** Fly camera and orbit target to a pose with an arcing lift. */
export function fly(camera, controls, pos, target, secs = 1.6) {
  const p0 = camera.position.clone();
  const t0 = controls.target.clone();
  const start = performance.now();
  const lift = p0.distanceTo(pos) * 0.18;
  return new Promise((resolve) => {
    const step = () => {
      const k = Math.min(1, (performance.now() - start) / (secs * 1000));
      const e = ease(k);
      camera.position.lerpVectors(p0, pos, e);
      camera.position.y += Math.sin(Math.PI * e) * lift;
      controls.target.lerpVectors(t0, target, e);
      controls.update();
      if (k < 1) requestAnimationFrame(step); else resolve();
    };
    step();
  });
}

/** Deterministic PRNG (mulberry32). */
export function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
