import * as THREE from 'three';
import { glowTexture } from './core.js';

// One shared particle field that morphs into a meaningful formation for every
// scene (cisco-branded skill: one field, new shape, adjacent scenes never repeat).
const N = 7000;
const TAU = Math.PI * 2;
const R = (a, b) => a + (b - a) * Math.random();

const F = {
  // Bridge wave: a rolling plane, the opening horizon.
  wave: (i) => { const x = R(-80, 80), z = R(-50, 10); return [x, Math.sin(x * 0.08) * 4 + Math.cos(z * 0.1) * 3 - 6, z]; },
  // Slide frames: outlines of a wall of rectangles.
  frames: (i) => {
    const c = i % 12, col = c % 4, row = Math.floor(c / 4), w = 16, h = 9;
    const ox = (col - 1.5) * 19, oy = (row - 1) * 11 + 6;
    const t = Math.random(), e = Math.floor(Math.random() * 4);
    const p = e === 0 ? [t * w, 0] : e === 1 ? [t * w, h] : e === 2 ? [0, t * h] : [w, t * h];
    return [ox + p[0] - w / 2, oy + p[1] - h / 2, -20];
  },
  sphere: (i) => { const u = R(-1, 1), a = R(0, TAU), s = Math.sqrt(1 - u * u), r = 30 + R(-0.6, 0.6); return [r * s * Math.cos(a), r * u + 6, r * s * Math.sin(a) - 25]; },
  // Inverted pyramid: the escalation shape before the flip.
  invPyr: (i) => { const y = R(0, 1), a = Math.floor(R(0, 4)), t = R(-1, 1), s = 4 + y * 30; const p = [[t * s, s], [t * s, -s], [s, t * s], [-s, t * s]][a]; return [p[0], y * 36 - 14, p[1] - 30]; },
  pyr: (i) => { const y = R(0, 1), a = Math.floor(R(0, 4)), t = R(-1, 1), s = (1 - y) * 32; const p = [[t * s, s], [t * s, -s], [s, t * s], [-s, t * s]][a]; return [p[0], y * 34 - 12, p[1] - 30]; },
  rings: (i) => { const k = i % 8, a = R(0, TAU), r = 14 + k * 3.2; const tilt = (k - 3.5) * 0.12; return [Math.cos(a) * r, Math.sin(a) * r * Math.cos(tilt) + 4, Math.sin(a) * r * Math.sin(tilt) - 28]; },
  spiral: (i) => { const arm = i % 4, r = Math.pow(Math.random(), 0.6) * 70 + 6, a = r * 0.09 + arm * (TAU / 4) + R(-0.3, 0.3); return [Math.cos(a) * r, R(-1.5, 1.5) - 10, Math.sin(a) * r - 20]; },
  runways: (i) => { const lane = i % 9; return [R(-90, 90), -0.5 + R(-0.1, 0.1), -14 - lane * 6 + R(-0.2, 0.2)]; },
  halo: (i) => { const a = R(0, TAU), b = R(0, TAU), r = 34, tr = 3; return [(r + tr * Math.cos(b)) * Math.cos(a), tr * Math.sin(b) + 26, (r + tr * Math.cos(b)) * Math.sin(a) - 20]; },
  columns: (i) => { const c = i % 24, gx = (c % 6) - 2.5, gz = Math.floor(c / 6); const a = R(0, TAU); return [gx * 14 + Math.cos(a) * 1.4, R(-4, 40), -24 - gz * 12 + Math.sin(a) * 1.4]; },
  city: (i) => { const b = i % 40, bx = (b % 8) - 3.5, bz = Math.floor(b / 8); const h = 6 + ((b * 7919) % 23); const f = Math.floor(R(0, 3)); const x = bx * 11 + (f === 0 ? R(-3, 3) : (R(0, 1) > 0.5 ? 3 : -3)); const z = -20 - bz * 11 + (f === 1 ? R(-3, 3) : (R(0, 1) > 0.5 ? 3 : -3)); return [x, R(0, h) - 2, z]; },
  lattice: (i) => { const s = 6; return [Math.round(R(-7, 7)) * s + R(-0.15, 0.15), Math.round(R(-1, 6)) * s + R(-0.15, 0.15), -24 - Math.round(R(0, 4)) * s]; },
  mapPlane: (i) => { const cx = R(-1, 1), cz = R(-1, 1); return [cx * 70 + Math.sin(cz * 9) * 3, -3 + R(-0.2, 0.2), cz * 30 - 30]; },
  latRings: (i) => { const k = i % 14, lat = (k / 13 - 0.5) * Math.PI * 0.9, a = R(0, TAU), r = 36; return [Math.cos(lat) * Math.cos(a) * r, Math.sin(lat) * r + 6, Math.cos(lat) * Math.sin(a) * r - 30]; },
  helix: (i) => { const s = i % 2, t = R(0, 1), a = t * TAU * 4 + s * Math.PI; return [(t - 0.5) * 120, Math.cos(a) * 9 + 6, Math.sin(a) * 9 - 30]; },
  knot: (i) => { const t = R(0, TAU), p = 2, q = 3, r = 12 * (2 + Math.cos(q * t)); return [r * Math.cos(p * t) + R(-0.6, 0.6), r * Math.sin(p * t) + 4, 12 * Math.sin(q * t) - 34]; },
  hex: (i) => { const s = Math.floor(R(0, 6)), t = R(0, 1), a0 = s * TAU / 6, a1 = a0 + TAU / 6, r = 30; const x = Math.cos(a0) * r * (1 - t) + Math.cos(a1) * r * t, y = Math.sin(a0) * r * (1 - t) + Math.sin(a1) * r * t; return [x, y + 4, -30 - Math.floor(R(0, 3)) * 8]; },
  bars: (i) => { const H = [1, 2, 3, 2, 1, 2, 3, 2, 1]; const b = i % 9; const a = R(0, TAU); return [(b - 4) * 9 + Math.cos(a) * 1.6, R(0, H[b] * 11) - 4, -34 + Math.sin(a) * 1.6]; },
  // CSX formations, designed from the content.
  // Rails: two steel lines and the sleepers between them, running to the horizon.
  rails: (i) => { const z = R(-260, 30), lane = (i % 3) - 1, ox = lane * 14, k = Math.floor(i / 3) % 10; if (k < 4) return [ox + (k % 2 ? 1.6 : -1.6) + R(-0.05, 0.05), -1.6, z]; const zz = Math.round(z / 2.2) * 2.2; return [ox + R(-2.6, 2.6), -1.7, zz + R(-0.15, 0.15)]; },
  // Radio: concentric wave fronts rising from a mast, the 220 MHz and cellular backhaul.
  radio: (i) => { const k = i % 9, a = R(0, Math.PI), r = 6 + k * 6; return [Math.cos(a) * r, Math.sin(a) * r * 0.75 - 4, -34 + R(-0.4, 0.4)]; },
  // Crossbuck: the X of a grade crossing sign, repeated down the line.
  crossbuck: (i) => { const c = i % 5, t = R(-1, 1), s = i % 2 ? 1 : -1; return [(c - 2) * 22 + t * 7, t * s * 7 + 8, -30 - c * 4]; },
  // Ridge: a mountain gorge surface for the Blue Ridge rebuild.
  ridge: (i) => { const x = R(-90, 90), z = R(-70, 0); const v = Math.abs(x) / 90; return [x, v * v * 26 + Math.sin(z * 0.15 + x * 0.05) * 2.5 - 6, z - 10]; },
  // Funnel: everything flows into one place, the SOC's existing queue.
  funnel: (i) => { const t = Math.pow(Math.random(), 0.7), a = R(0, TAU) + t * 6, r = 3 + (1 - t) * 34; return [Math.cos(a) * r, t * 30 - 8, Math.sin(a) * r - 30]; },
};

// Scene id -> [formation, color]. Adjacent scenes never share a formation.
export const FORMATIONS = {
  open: ['rails', '#00bceb'],
  network: ['mapPlane', '#fbab18'],
  wayside: ['radio', '#9be7ff'],
  rogue: ['lattice', '#ff6b4a'],
  backhaul: ['halo', '#2de2c5'],
  lateral: ['hex', '#8e7cff'],
  trackside: ['crossbuck', '#fbab18'],
  fleet: ['city', '#6cc04a'],
  helene: ['ridge', '#9be7ff'],
  tsa: ['columns', '#ffd95a'],
  people: ['rings', '#f25c9a'],
  adds: ['funnel', '#5aa0ff'],
  sources: ['frames', '#9be7ff'],
  close: ['bars', '#00bceb'],
};

export function createField() {
  const geo = new THREE.BufferGeometry();
  const from = new Float32Array(N * 3), to = new Float32Array(N * 3), delay = new Float32Array(N), seed = new Float32Array(N);
  for (let i = 0; i < N; i++) { delay[i] = Math.random() * 0.45; seed[i] = Math.random(); }
  geo.setAttribute('position', new THREE.BufferAttribute(to, 3));
  geo.setAttribute('aFrom', new THREE.BufferAttribute(from, 3));
  geo.setAttribute('aDelay', new THREE.BufferAttribute(delay, 1));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const uniforms = {
    uP: { value: 1 }, uTime: { value: 0 }, uColor: { value: new THREE.Color('#00bceb') },
    uMap: { value: glowTexture() }, uScale: { value: 300 }, uOpacity: { value: 0.75 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    vertexShader: /* glsl */`
      attribute vec3 aFrom; attribute float aDelay; attribute float aSeed;
      uniform float uP; uniform float uTime; uniform float uScale;
      varying float vA;
      void main(){
        float p = clamp((uP - aDelay) / 0.55, 0.0, 1.0);
        p = p * p * (3.0 - 2.0 * p);
        vec3 pos = mix(aFrom, position, p);
        pos += sin(p * 3.14159) * vec3(sin(aSeed * 40.0), cos(aSeed * 31.0), sin(aSeed * 17.0)) * 6.0;
        pos.y += sin(uTime * 0.6 + aSeed * 30.0) * 0.35;
        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (0.35 + aSeed * 0.5) * uScale / -mv.z;
        vA = 0.45 + 0.55 * fract(aSeed * 7.0 + uTime * 0.05);
        float dist = length(mv.xyz);
        vA *= exp(-pow(dist * 0.006, 2.0));
      }`,
    fragmentShader: /* glsl */`
      uniform sampler2D uMap; uniform vec3 uColor; uniform float uOpacity;
      varying float vA;
      void main(){
        vec4 t = texture2D(uMap, gl_PointCoord);
        gl_FragColor = vec4(uColor * 1.2, t.a * vA * uOpacity);
      }`,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  let p = 1;
  const target = new THREE.Color('#00bceb');
  return {
    points: pts,
    morph(id, origin) {
      const [kind, color] = FORMATIONS[id] || FORMATIONS.open;
      const pos = geo.attributes.position.array, fr = geo.attributes.aFrom.array;
      for (let i = 0; i < N; i++) {
        const q = Math.min(1, Math.max(0, (p - delay[i]) / 0.55));
        const e = q * q * (3 - 2 * q);
        for (let k = 0; k < 3; k++) fr[i * 3 + k] = fr[i * 3 + k] + (pos[i * 3 + k] - fr[i * 3 + k]) * e;
        const v = F[kind](i);
        pos[i * 3] = v[0] + origin.x; pos[i * 3 + 1] = v[1] + origin.y; pos[i * 3 + 2] = v[2] + origin.z;
      }
      geo.attributes.position.needsUpdate = true; geo.attributes.aFrom.needsUpdate = true;
      target.set(color);
      p = 0;
    },
    update(dt, t, h) {
      p = Math.min(1.5, p + dt / 1.6);
      uniforms.uP.value = p; uniforms.uTime.value = t;
      uniforms.uScale.value = h * 0.45;
      uniforms.uColor.value.lerp(target, 1 - Math.exp(-2 * dt));
    },
  };
}
