// Globe and facility (building close-up) scenes. Three.js r186 + GSAP 3.15.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { gsap } from 'gsap';
import { feature } from 'topojson-client';
import LAND from './data/land-topo.json';
import { SITES, SITE } from './content.js';

const D2R = Math.PI / 180;
export const SHELL_R = 1.55; // Cloud Control vantage shell radius (globe radius = 1)

export function latLon(lat, lon, r = 1, out = new THREE.Vector3()) {
  const phi = (90 - lat) * D2R, th = (lon + 180) * D2R;
  return out.set(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
}
function toLatLon(v) {
  const r = v.length();
  const lat = 90 - Math.acos(THREE.MathUtils.clamp(v.y / r, -1, 1)) / D2R;
  let lon = Math.atan2(v.z, -v.x) / D2R - 180;
  if (lon < -180) lon += 360;
  return { lat, lon, r };
}

// Rasterize the land topology to a mask, then keep Fibonacci-sphere points that fall on land.
function landMask(w = 2048, h = 1024) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.fillStyle = '#000'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff';
  const fc = feature(LAND, LAND.objects.land);
  const feats = fc.features ?? [fc];
  const X = (lon) => (lon + 180) / 360 * w, Y = (lat) => (90 - lat) / 180 * h;
  for (const f of feats) {
    const geo = f.geometry;
    const polys = geo.type === 'Polygon' ? [geo.coordinates] : geo.type === 'MultiPolygon' ? geo.coordinates : [];
    for (const poly of polys) {
      g.beginPath();
      for (const ring of poly) ring.forEach(([lon, lat], i) => (i ? g.lineTo(X(lon), Y(lat)) : g.moveTo(X(lon), Y(lat))));
      g.closePath(); g.fill('evenodd');
    }
  }
  return { w, h, data: g.getImageData(0, 0, w, h).data };
}
function isLand(m, lat, lon) {
  const x = Math.min(m.w - 1, Math.max(0, Math.floor((lon + 180) / 360 * m.w)));
  const y = Math.min(m.h - 1, Math.max(0, Math.floor((90 - lat) / 180 * m.h)));
  return m.data[(y * m.w + x) * 4] > 127;
}
function landPoints(n) {
  const m = landMask(), pts = [], ga = Math.PI * (3 - Math.sqrt(5)), v = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), t = ga * i;
    v.set(Math.cos(t) * r, y, Math.sin(t) * r);
    const { lat, lon } = toLatLon(v);
    if (lat >= -62 && isLand(m, lat, lon)) pts.push(v.x, v.y, v.z);
  }
  return new Float32Array(pts);
}
function glowTexture(size = 128) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'), gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export const STATE_COLORS = {
  idle: new THREE.Color('#3fb6ff'), signal: new THREE.Color('#ffd166'), warning: new THREE.Color('#ffb020'),
  critical: new THREE.Color('#ff3b4f'), recovering: new THREE.Color('#ff9f43'), protected: new THREE.Color('#7cf29c'),
};
const SILO = ['#049fd9', '#a4ce4e', '#c792ea', '#ff6b6b'].map((c) => new THREE.Color(c));
const FAC = {
  glass: new THREE.Color('#16365e'), edge: new THREE.Color('#3f86c9'), metlife: new THREE.Color('#1aa3ff'), zone: new THREE.Color('#7fe7ff'),
  warn: new THREE.Color('#ffb020'), crit: new THREE.Color('#ff3b4f'), good: new THREE.Color('#7cf29c'), signal: new THREE.Color('#ffd166'),
};
const FOG = new THREE.Color('#030a18');

const UV_VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
// Arc pulse: a bright head travelling along the tube, faint tail.
const ARC_FRAG = `uniform float uTime; uniform float uSpeed; uniform float uOpacity; uniform vec3 uColor; uniform float uPhase; varying vec2 vUv;
void main(){ float p = fract(vUv.x*2.0 - uTime*uSpeed + uPhase); float head = smoothstep(0.82,1.0,p); float tail = smoothstep(0.0,0.82,p)*0.18;
float ends = smoothstep(0.0,0.06,vUv.x)*smoothstep(1.0,0.94,vUv.x); float a = (0.14 + head*0.9 + tail)*ends*uOpacity;
gl_FragColor = vec4(uColor*(0.6+head*1.6), a); }`;
const FLOW_FRAG = `uniform float uTime; uniform vec3 uColor; uniform float uOpacity; uniform float uSpeed; varying vec2 vUv;
void main(){ float p = fract(vUv.x*6.0 - uTime*uSpeed); float pulse = smoothstep(0.75,1.0,p); float ends = smoothstep(0.0,0.05,vUv.x)*smoothstep(1.0,0.85,vUv.x);
gl_FragColor = vec4(uColor*(0.8+pulse*1.8), (0.25+pulse*0.75)*ends*uOpacity); }`;
const BEAM_FRAG = (rate, fadeTop) => `uniform float uTime; uniform float uOpacity; uniform vec3 uColor; varying vec2 vUv;
void main(){ float stripes = 0.55 + 0.45*sin(vUv.y*${rate}.0 + uTime*${rate === 60 ? '14.0' : '10.0'}); float edge = pow(1.0-abs(vUv.x-0.5)*2.0, 1.4);
float fade = smoothstep(0.0,0.15,vUv.y)${fadeTop ? '*smoothstep(1.0,0.7,vUv.y)' : ''};
gl_FragColor = vec4(uColor*1.7, edge*stripes*fade*uOpacity); }`;

function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---------------------------------------------------------------------------------------------
// Facility: a procedural city block, the real building(s) with floors as stacked glass slabs, the
// mission floor highlighted, and an interior with desks, a room and device beacons.
// ---------------------------------------------------------------------------------------------
const CITY_VERT = `attribute float aSeed; varying vec3 vPos; varying vec3 vN; varying float vSeed; varying float vDist;
void main(){ vec4 wp = modelMatrix*instanceMatrix*vec4(position,1.0); vPos = wp.xyz; vN = normalize(mat3(modelMatrix*instanceMatrix)*normal);
vSeed = aSeed; vec4 mv = viewMatrix*wp; vDist = -mv.z; gl_Position = projectionMatrix*mv; }`;
const CITY_FRAG = `uniform vec3 uFog; uniform float uDensity; uniform float uDim; varying vec3 vPos; varying vec3 vN; varying float vSeed; varying float vDist;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
void main(){ vec3 base = vec3(0.035,0.07,0.13); float side = 1.0 - step(0.6, abs(vN.y)); float u = abs(vN.x) > 0.5 ? vPos.z : vPos.x;
float fl = floor(vPos.y*2.6); float col = floor(u*1.7); float win = step(0.35, fract(vPos.y*2.6))*step(0.3, fract(u*1.7));
float lit = step(0.7, hash(vec2(fl,col)+vSeed*17.0))*win*side; vec3 c = base + lit*vec3(1.0,0.8,0.52)*0.42 + side*win*vec3(0.02,0.05,0.09);
c += (1.0-side)*vec3(0.05,0.09,0.16); c *= uDim; float f = 1.0 - exp(-pow(vDist*uDensity,2.0)); gl_FragColor = vec4(mix(c,uFog,f),1.0); }`;
const GROUND_VERT = `varying vec3 vPos; varying float vDist; void main(){ vec4 wp = modelMatrix*vec4(position,1.0); vPos = wp.xyz; vec4 mv = viewMatrix*wp; vDist = -mv.z; gl_Position = projectionMatrix*mv; }`;
const GROUND_FRAG = `uniform vec3 uFog; uniform float uDensity; uniform float uStreet; uniform float uTime; varying vec3 vPos; varying float vDist;
float line(float x, float w){ float d = abs(fract(x)-0.5); float fw = fwidth(x); return 1.0 - smoothstep(w-fw, w+fw, 0.5-d); }
void main(){ vec2 p = vPos.xz; float minor = max(line(p.x,0.02), line(p.y,0.02))*0.12; float major = max(line(p.x/uStreet,0.03), line(p.y/uStreet,0.03));
float r = length(p); float ring = smoothstep(0.08,0.0, abs(fract(r*0.05 - uTime*0.08)-0.5)-0.46)*0.15*smoothstep(80.0,10.0,r);
vec3 c = vec3(0.012,0.03,0.06) + vec3(0.05,0.16,0.3)*(minor+major*0.5) + vec3(0.1,0.45,0.8)*ring;
float f = 1.0 - exp(-pow(vDist*uDensity,2.0)); gl_FragColor = vec4(mix(c,uFog,f),1.0); }`;

class Facility {
  scene = new THREE.Scene(); root = new THREE.Group(); interior = new THREE.Group();
  buildings = new Map(); flows = []; deviceLabels = []; deviceSprites = [];
  facility = null; zone = null; focus = 'site'; state = 'idle'; pulse = 0; time = 0;
  hoverFloor = null; raycaster = new THREE.Raycaster(); zoneTag = null; beam = null; beamMat = null; shield = null; alarm = null;
  onFloorHover = () => {};
  constructor(glow) {
    this.glow = glow;
    this.scene.background = FOG.clone();
    this.scene.add(this.root);
    this.groundMat = new THREE.ShaderMaterial({ uniforms: { uFog: { value: FOG }, uDensity: { value: 0.012 }, uStreet: { value: 8 }, uTime: { value: 0 } }, vertexShader: GROUND_VERT, fragmentShader: GROUND_FRAG });
    this.cityMat = new THREE.ShaderMaterial({ uniforms: { uFog: { value: FOG }, uDensity: { value: 0.012 }, uDim: { value: 1 } }, vertexShader: CITY_VERT, fragmentShader: CITY_FRAG });
  }
  build(fac, zone) {
    this.clear(); this.facility = fac; this.zone = zone; this.focus = 'site';
    const r = rng([...fac.siteId].reduce((a, c) => a * 31 + c.charCodeAt(0), 7));
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), this.groundMat);
    ground.rotation.x = -Math.PI / 2; this.root.add(ground);
    const ctx = fac.context;
    this.groundMat.uniforms.uStreet.value = ctx === 'manhattan' ? 6 : ctx === 'tokyo' ? 5 : ['campus', 'suburban', 'datacenter'].includes(ctx) ? 20 : 9;
    this.buildContext(ctx, r, fac);
    if (fac.lake) this.addWater(fac.lake.x, fac.lake.z, fac.lake.rx, fac.lake.rz);
    fac.ponds?.forEach((p) => this.addWater(p.x, p.z, p.r, p.r * 0.75));
    if (ctx === 'brighton') this.addWater(0, 60, 120, 28);
    fac.parking?.forEach((p) => this.addParking(p));
    fac.landmarks?.forEach((l) => this.addLandmark(l));
    if (fac.trees) this.addTrees(fac.trees, r);
    if (fac.mountains) this.addMountains(r);
    for (const b of fac.buildings) this.addBuilding(b, zone);
    this.addLinks(fac);
    this.root.add(this.interior);
    if (zone) this.buildInterior(zone);
    this.buildEffects();
    this.setState('idle');
  }
  clear() {
    this.root.traverse((o) => {
      o.geometry?.dispose();
      const m = o.material;
      if (m && m !== this.groundMat && m !== this.cityMat) (Array.isArray(m) ? m : [m]).forEach((x) => x.dispose());
      if (o.isCSS2DObject) o.element.remove();
    });
    this.scene.remove(this.root); this.root = new THREE.Group(); this.scene.add(this.root);
    this.interior = new THREE.Group(); this.buildings.clear(); this.flows = []; this.deviceLabels = []; this.deviceSprites = [];
    this.zoneTag = null; this.beam = this.shield = this.alarm = null; this.beamMat = null; this.hoverFloor = null;
  }
  buildContext(ctx, r, fac) {
    const keep = [
      ...fac.buildings.map((b) => ({ x: b.x, z: b.z, r: Math.max(b.w, b.d) * 0.9 + 2.5 })),
      ...(fac.landmarks ?? []).map((b) => ({ x: b.x, z: b.z, r: Math.max(b.w, b.d) * 0.7 + 1.5 })),
    ];
    if (fac.lake) keep.push({ x: fac.lake.x, z: fac.lake.z, r: Math.max(fac.lake.rx, fac.lake.rz) + 2 });
    fac.parking?.forEach((p) => keep.push({ x: p.x, z: p.z, r: Math.max(p.w, p.d) * 0.7 + 1 }));
    fac.ponds?.forEach((p) => keep.push({ x: p.x, z: p.z, r: p.r + 1.5 }));
    const out = [], free = (x, z, w, d) => keep.every((k) => Math.hypot(x - k.x, z - k.z) > k.r + Math.max(w, d) * 0.5);
    const grid = (bx, bz, ext, fill, hMin, hMax, falloff) => {
      for (let x = -ext; x <= ext; x += bx) for (let z = -ext; z <= ext; z += bz) {
        if (r() > fill) continue;
        const dist = Math.hypot(x, z), n = r() < 0.5 ? 1 : 2;
        for (let k = 0; k < n; k++) {
          const w = (bx - 1.6) / n - 0.3, d = bz - 1.6 - r() * 0.8, px = x - bx / 2 + 0.8 + (k + 0.5) * (bx - 1.6) / n;
          if (!free(px, z, w, d)) continue;
          const h = hMin + (hMax - hMin) * r() ** 2.2 * (0.35 + Math.exp(-dist / falloff));
          out.push({ x: px, z, w, d, h });
        }
      }
    };
    const scatter = (count, rMin, rMax, sMin, sMax, hMin, hMax) => {
      for (let i = 0; i < count; i++) {
        const a = r() * Math.PI * 2, rad = rMin + Math.sqrt(r()) * (rMax - rMin), x = Math.cos(a) * rad, z = Math.sin(a) * rad;
        const w = sMin + r() * (sMax - sMin), d = sMin + r() * (sMax - sMin);
        if (free(x, z, w, d)) out.push({ x, z, w, d, h: hMin + r() ** 2 * (hMax - hMin) });
      }
    };
    switch (ctx) {
      case 'manhattan': grid(6.2, 2.9, 70, 0.92, 2.5, 34, 30); break;
      case 'tokyo': grid(5, 4, 60, 0.85, 1.5, 18, 25); break;
      case 'cdmx': grid(7, 6, 60, 0.7, 1, 9, 30); scatter(10, 15, 60, 3, 5, 6, 14); break;
      case 'santiago': grid(8, 7, 55, 0.6, 1, 8, 25); scatter(14, 12, 50, 3, 5, 6, 16); break;
      case 'dubai': grid(9, 8, 60, 0.6, 1, 7, 30); scatter(18, 12, 60, 3, 5, 8, 24); break;
      case 'noida': scatter(40, 18, 80, 3, 6, 3, 9); scatter(60, 30, 90, 2, 5, 0.5, 2); break;
      case 'brighton': grid(6, 5, 50, 0.7, 0.6, 3.2, 30); break;
      default: scatter(26, 26, 90, 3, 7, 0.5, 2.2);
    }
    if (!out.length) return;
    const geo = new THREE.BoxGeometry(1, 1, 1); geo.translate(0, 0.5, 0);
    const mesh = new THREE.InstancedMesh(geo, this.cityMat, out.length), seeds = new Float32Array(out.length), m = new THREE.Matrix4();
    out.forEach((b, i) => { m.compose(new THREE.Vector3(b.x, 0, b.z), new THREE.Quaternion(), new THREE.Vector3(b.w, b.h, b.d)); mesh.setMatrixAt(i, m); seeds[i] = r(); });
    geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));
    this.root.add(mesh);
  }
  addWater(x, z, rx, rz) {
    const g = new THREE.CircleGeometry(1, 64); g.rotateX(-Math.PI / 2);
    const mat = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 } }, vertexShader: UV_VERT, transparent: true, depthWrite: false,
      fragmentShader: `uniform float uTime; varying vec2 vUv; void main(){ float w = sin(vUv.x*80.0+uTime*1.2)*sin(vUv.y*60.0-uTime)*0.5+0.5;
      vec3 c = mix(vec3(0.01,0.05,0.11), vec3(0.03,0.14,0.26), w*0.6); float e = smoothstep(0.5,0.47, distance(vUv, vec2(0.5))); gl_FragColor = vec4(c, 0.92*e); }` });
    this.flows.push(mat);
    const mesh = new THREE.Mesh(g, mat); mesh.scale.set(rx, 1, rz); mesh.position.set(x, 0.02, z); this.root.add(mesh);
  }
  addParking(p) {
    const g = new THREE.Group();
    for (let i = 0; i < p.levels; i++) {
      const slab = new THREE.Mesh(new THREE.BoxGeometry(p.w, 0.06, p.d), new THREE.MeshBasicMaterial({ color: '#203048', transparent: true, opacity: 0.85 }));
      slab.position.y = i * 0.32 + 0.03; g.add(slab);
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(slab.geometry), new THREE.LineBasicMaterial({ color: '#3a5272', transparent: true, opacity: 0.6 }));
      e.position.copy(slab.position); g.add(e);
    }
    g.position.set(p.x, 0, p.z); this.root.add(g);
  }
  addLandmark(l) {
    const g = new THREE.Group(), col = new THREE.Color(l.color ?? '#6b7b94');
    const box = new THREE.Mesh(new THREE.BoxGeometry(l.w, l.h, l.d), new THREE.MeshBasicMaterial({ color: col.clone().multiplyScalar(0.25), transparent: true, opacity: 0.92 }));
    box.position.y = l.h / 2; g.add(box);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(box.geometry), new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.55 }));
    e.position.copy(box.position); g.add(e);
    if (l.arch) {
      const vault = new THREE.Mesh(new THREE.CylinderGeometry(l.d * 0.32, l.d * 0.32, l.w * 0.8, 24, 1, false, 0, Math.PI), new THREE.MeshBasicMaterial({ color: col.clone().multiplyScalar(0.3), transparent: true, opacity: 0.9 }));
      vault.position.y = l.h; vault.rotation.set(0, 0, Math.PI / 2); g.add(vault);
      const ve = new THREE.LineSegments(new THREE.EdgesGeometry(vault.geometry, 20), new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.5 }));
      ve.rotation.copy(vault.rotation); ve.position.copy(vault.position); g.add(ve);
    }
    g.position.set(l.x, 0, l.z);
    g.add(this.label(l.label, new THREE.Vector3(0, l.h + (l.arch ? l.d * 0.35 : 0) + 0.4, 0), 'fac-label minor'));
    this.root.add(g);
  }
  addTrees(n, r) {
    const fac = this.facility, geo = new THREE.ConeGeometry(0.5, 1.4, 6); geo.translate(0, 0.7, 0);
    const mesh = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color: '#0f3a2a', transparent: true, opacity: 0.9 }), n), m = new THREE.Matrix4();
    let k = 0;
    for (let i = 0; i < n * 3 && k < n; i++) {
      const a = r() * Math.PI * 2, rad = 8 + Math.sqrt(r()) * 46, x = Math.cos(a) * rad, z = Math.sin(a) * rad;
      const blocked = fac.buildings.some((b) => Math.hypot(x - b.x, z - b.z) < Math.max(b.w, b.d) * 0.8 + 1.5)
        || (fac.parking ?? []).some((p) => Math.abs(x - p.x) < p.w / 2 + 0.8 && Math.abs(z - p.z) < p.d / 2 + 0.8)
        || (fac.lake && ((x - fac.lake.x) / fac.lake.rx) ** 2 + ((z - fac.lake.z) / fac.lake.rz) ** 2 < 1.1)
        || (fac.ponds ?? []).some((p) => Math.hypot(x - p.x, z - p.z) < p.r + 0.6)
        || (fac.landmarks ?? []).some((l) => Math.abs(x - l.x) < l.w / 2 + 0.6 && Math.abs(z - l.z) < l.d / 2 + 0.6);
      if (blocked) continue;
      const s = 0.6 + r() * 0.9;
      m.compose(new THREE.Vector3(x, 0, z), new THREE.Quaternion(), new THREE.Vector3(s, s * (0.8 + r() * 0.6), s)); mesh.setMatrixAt(k++, m);
    }
    mesh.count = k; this.root.add(mesh);
  }
  addMountains(r) {
    const mat = new THREE.ShaderMaterial({ uniforms: { uFog: { value: FOG } }, vertexShader: GROUND_VERT,
      fragmentShader: `uniform vec3 uFog; varying vec3 vPos; varying float vDist; void main(){ float snow = smoothstep(16.0,24.0,vPos.y);
      vec3 c = mix(vec3(0.05,0.08,0.15), vec3(0.55,0.65,0.8), snow); float f = 1.0 - exp(-pow(vDist*0.006,2.0)); gl_FragColor = vec4(mix(c,uFog,f*0.8),1.0); }` });
    for (let i = 0; i < 16; i++) {
      const h = 14 + r() * 18, m = new THREE.Mesh(new THREE.ConeGeometry(16 + r() * 14, h, 5 + Math.floor(r() * 3)), mat);
      m.position.set(-120 + i * 16 + r() * 8, h / 2, -95 - r() * 25); m.rotation.y = r() * Math.PI; this.root.add(m);
    }
  }
  footprint(b, scale = 1) {
    const w = b.w * scale, d = b.d * (b.shape === 'faceted' ? 0.6 + 0.4 * scale : scale), s = new THREE.Shape();
    if (b.shape === 'octagon') {
      const c = d * 0.3, p = [[-w / 2 + c, -d / 2], [w / 2 - c, -d / 2], [w / 2, -d / 2 + c * 0.9], [w / 2, d / 2 - c * 0.9], [w / 2 - c, d / 2], [-w / 2 + c, d / 2], [-w / 2, d / 2 - c * 0.9], [-w / 2, -d / 2 + c * 0.9]];
      s.moveTo(...p[0]); p.slice(1).forEach((q) => s.lineTo(...q));
    } else if (b.shape === 'faceted') {
      s.moveTo(-w / 2, -d / 2); s.lineTo(w / 2, -d / 2); s.lineTo(w / 2 - w * 0.12, d / 2); s.lineTo(-w / 2 + w * 0.2, d / 2);
    } else { s.moveTo(-w / 2, -d / 2); s.lineTo(w / 2, -d / 2); s.lineTo(w / 2, d / 2); s.lineTo(-w / 2, d / 2); }
    s.closePath(); return s;
  }
  floorStyle(b, floor, zone) {
    if (zone && zone.buildingId === b.id && zone.floor === floor) return { color: FAC.zone.clone(), opacity: 0.8 };
    if (b.metlife?.some(([a, z]) => floor >= a && floor <= z)) return { color: FAC.metlife.clone(), opacity: 0.55 };
    const band = b.bands?.find((x) => floor >= x.from && floor <= x.to);
    return band ? { color: new THREE.Color(band.color).multiplyScalar(0.75), opacity: 0.42 } : { color: FAC.glass.clone(), opacity: 0.34 };
  }
  addBuilding(b, zone) {
    const g = new THREE.Group(); g.position.set(b.x, 0, b.z); g.rotation.y = b.rot ?? 0;
    const floors = [], base = b.podium ? b.podium.h : 0;
    if (b.podium) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(b.podium.w, b.podium.h, b.podium.d), new THREE.MeshBasicMaterial({ color: '#10233f', transparent: true, opacity: 0.9 }));
      p.position.y = b.podium.h / 2; g.add(p);
      const pe = new THREE.LineSegments(new THREE.EdgesGeometry(p.geometry), new THREE.LineBasicMaterial({ color: '#2e5d8f', transparent: true, opacity: 0.7 }));
      pe.position.copy(p.position); g.add(pe);
    }
    let shared = null, sharedEdges = null;
    const slabH = b.floorH * (b.shape === 'datacenter' ? 0.92 : 0.84);
    for (let f = 1; f <= b.floors; f++) {
      let geo, edges;
      if (b.shape === 'faceted') {
        geo = new THREE.ExtrudeGeometry(this.footprint(b, 1 - 0.42 * ((f - 1) / b.floors)), { depth: slabH, bevelEnabled: false });
        geo.rotateX(-Math.PI / 2); edges = new THREE.EdgesGeometry(geo);
      } else {
        if (!shared) { shared = new THREE.ExtrudeGeometry(this.footprint(b), { depth: slabH, bevelEnabled: false }); shared.rotateX(-Math.PI / 2); sharedEdges = new THREE.EdgesGeometry(shared); }
        geo = shared; edges = sharedEdges;
      }
      const st = this.floorStyle(b, f, zone), y = base + (f - 1) * b.floorH;
      const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: st.color, transparent: true, opacity: st.opacity * 0.55, depthWrite: false, side: THREE.DoubleSide }));
      mesh.position.y = y; mesh.userData = { building: b.id, floor: f };
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: st.color.clone().lerp(FAC.edge, 0.3), transparent: true, opacity: Math.min(1, st.opacity + 0.25) }));
      line.position.y = y; g.add(mesh, line);
      floors.push({ index: f, mesh, edges: line, baseColor: st.color.clone(), baseOpacity: st.opacity, y });
    }
    const height = base + b.floors * b.floorH;
    const core = new THREE.Mesh(new THREE.BoxGeometry(Math.min(b.w, b.d) * 0.22, height, Math.min(b.w, b.d) * 0.22), new THREE.MeshBasicMaterial({ color: '#0d2442', transparent: true, opacity: 0.6, depthWrite: false }));
    core.position.y = height / 2; g.add(core);
    if (b.id === 'metlife-building') this.addSign(g, b, height);
    if (b.shape === 'datacenter') this.addRacks(g, b);
    const label = this.label(b.label, new THREE.Vector3(0, height + 0.8, 0), 'fac-label');
    g.add(label); this.root.add(g);
    this.buildings.set(b.id, { spec: b, group: g, floors, height, label, center: new THREE.Vector3(b.x, height / 2, b.z) });
  }
  addSign(g, b, h) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 96;
    const x = c.getContext('2d'); x.font = 'bold 76px Inter, Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.shadowColor = '#7fd0ff'; x.shadowBlur = 18; x.fillStyle = '#e8f6ff'; x.fillText('MetLife', 256, 52);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    for (const side of [-1, 1]) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(b.w * 0.55, b.w * 0.1), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
      m.position.set(0, h - 0.9, (b.d / 2 + 0.05) * side); if (side < 0) m.rotation.y = Math.PI; g.add(m);
    }
  }
  addRacks(g, b) {
    const geo = new THREE.BoxGeometry(0.28, 0.42, 0.5); geo.translate(0, 0.21, 0);
    const racks = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color: '#0b1d36' }), 180), m = new THREE.Matrix4(); let k = 0;
    for (let row = 0; row < 9; row++) for (let col = 0; col < 20; col++) { m.makeTranslation(-b.w / 2 + 1 + col * ((b.w - 2) / 20), 0.03, -b.d / 2 + 1.2 + row * ((b.d - 2.4) / 8)); racks.setMatrixAt(k++, m); }
    g.add(racks);
    const pts = [];
    for (let i = 0; i < 540; i++) { const r = Math.floor(i / 3), row = Math.floor(r / 20), col = r % 20; pts.push(-b.w / 2 + 1 + col * ((b.w - 2) / 20) + 0.15, 0.1 + (i % 3) * 0.1, -b.d / 2 + 1.2 + row * ((b.d - 2.4) / 8) + 0.26); }
    g.add(new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)), new THREE.PointsMaterial({ color: '#4fd1ff', size: 0.06, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })));
  }
  label(text, pos, cls) {
    const el = document.createElement('div'); el.className = cls; el.innerHTML = `<span>${text}</span>`;
    const o = new CSS2DObject(el); o.position.copy(pos); return o;
  }
  addLinks(fac) {
    const hub = this.buildings.get(this.zone?.buildingId ?? fac.buildings[0].id) ?? [...this.buildings.values()][0];
    if (!hub) return;
    const top = new THREE.Vector3(hub.spec.x, hub.height, hub.spec.z);
    for (const l of fac.links ?? []) {
      const a = l.bearing * D2R, dir = new THREE.Vector3(Math.sin(a), 0, -Math.cos(a));
      const end = top.clone().add(dir.clone().multiplyScalar(70)).setY(hub.height * 0.4 + 6);
      const mid = top.clone().add(dir.clone().multiplyScalar(30)).setY(hub.height + 14);
      const curve = new THREE.QuadraticBezierCurve3(top.clone().setY(hub.height + 0.2), mid, end);
      const mat = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color('#2fb4ff') }, uOpacity: { value: 0.9 }, uSpeed: { value: 0.35 } }, vertexShader: UV_VERT, fragmentShader: FLOW_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
      this.flows.push(mat);
      this.root.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.08, 6, false), mat));
      this.root.add(this.label(l.label, curve.getPoint(0.72).add(new THREE.Vector3(0, 1.2, 0)), 'fac-label link'));
    }
  }
  buildInterior(zone) {
    const b = this.buildings.get(zone.buildingId); if (!b) return;
    const fl = b.floors[zone.floor - 1]; if (!fl) return;
    const s = b.spec, g = new THREE.Group(); g.position.copy(b.group.position); g.rotation.copy(b.group.rotation);
    const y = fl.y + 0.02, sc = s.shape === 'faceted' ? 1 - 0.42 * ((zone.floor - 1) / s.floors) : 1;
    const plate = new THREE.ShapeGeometry(this.footprint(s, sc * 0.98)); plate.rotateX(-Math.PI / 2);
    const pm = new THREE.Mesh(plate, new THREE.MeshBasicMaterial({ color: '#0b2546', transparent: true, opacity: 0.95, side: THREE.DoubleSide })); pm.position.y = y; g.add(pm);
    const W = s.w * sc * 0.8, Dp = s.d * sc * 0.7, desk = new THREE.BoxGeometry(0.34, 0.07, 0.16); desk.translate(0, 0.035, 0);
    const nx = Math.max(4, Math.floor(W / 0.55)), nz = Math.max(3, Math.floor(Dp / 0.5));
    const desks = new THREE.InstancedMesh(desk, new THREE.MeshBasicMaterial({ color: '#2a5d92' }), nx * nz), m = new THREE.Matrix4(); let k = 0;
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      const x = -W / 2 + (i + 0.5) * (W / nx), z = -Dp / 2 + (j + 0.5) * (Dp / nz);
      if (Math.abs(x) < s.w * 0.14 && Math.abs(z) < s.d * 0.14) continue;
      m.makeTranslation(x, y, z); desks.setMatrixAt(k++, m);
    }
    desks.count = k; g.add(desks);
    const rw = W * 0.38, rd = Dp * 0.55, rx = W / 2 - rw / 2;
    const room = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(rw, s.floorH * 0.7, rd)), new THREE.LineBasicMaterial({ color: FAC.zone, transparent: true, opacity: 0.95 }));
    room.position.set(rx, y + s.floorH * 0.35, 0); g.add(room);
    const fill = new THREE.Mesh(new THREE.PlaneGeometry(rw, rd), new THREE.MeshBasicMaterial({ color: FAC.zone, transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false }));
    fill.rotation.x = -Math.PI / 2; fill.position.set(rx, y + 0.01, 0); g.add(fill);
    const spots = [[rx - rw * 0.25, -rd * 0.25], [rx + rw * 0.25, rd * 0.25], [-W * 0.3, -Dp * 0.3], [-W * 0.05, Dp * 0.32], [-W * 0.35, Dp * 0.25], [rx, rd * 0.6]];
    zone.devices.forEach((d, i) => {
      const [x, z] = spots[i % spots.length];
      const col = d.kind === 'firewall' ? '#ff8a65' : d.kind === 'te' ? '#ffd166' : d.kind === 'endpoint' ? '#c792ea' : d.kind === 'phone' ? '#a4ce4e' : '#7fe7ff';
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glow, color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      sp.position.set(x, y + 0.35, z); sp.scale.setScalar(0.55); g.add(sp); this.deviceSprites.push({ sprite: sp, phase: Math.random() * 6, kind: d.kind });
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.35, 6), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.7 }));
      stem.position.set(x, y + 0.17, z); g.add(stem);
      const lab = this.label(d.label, new THREE.Vector3(x, y + 0.65, z), `fac-label device k-${d.kind}`); lab.visible = false; g.add(lab); this.deviceLabels.push(lab);
      const fm = new THREE.ShaderMaterial({ uniforms: { uTime: { value: Math.random() * 3 }, uColor: { value: new THREE.Color(col) }, uOpacity: { value: 0.8 }, uSpeed: { value: 0.6 } }, vertexShader: UV_VERT, fragmentShader: FLOW_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
      this.flows.push(fm);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(x, y + 0.05, z), new THREE.Vector3(x * 0.4, y + 0.05, z * 0.4), new THREE.Vector3(0, y + 0.05, 0)]), 20, 0.018, 4, false), fm));
    });
    g.visible = false; this.interior = g; this.root.add(g);
    this.zoneTag = this.label(`Floor ${zone.floor} · ${zone.room}`, new THREE.Vector3(s.w * 0.5 + 0.4, fl.y + s.floorH * 0.5, 0), 'fac-label zone');
    b.group.add(this.zoneTag);
  }
  buildEffects() {
    const b = this.zone ? this.buildings.get(this.zone.buildingId) : [...this.buildings.values()][0]; if (!b) return;
    this.beamMat = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 }, uColor: { value: new THREE.Color('#7fe7ff') } }, vertexShader: UV_VERT, fragmentShader: BEAM_FRAG(40, false), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const fy = this.zone ? b.floors[this.zone.floor - 1]?.y ?? b.height : b.height;
    this.beam = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.9, 60, 24, 1, true), this.beamMat);
    this.beam.position.set(b.spec.x, fy + 30, b.spec.z); this.beam.visible = false; this.root.add(this.beam);
    const r = Math.max(b.spec.w, b.spec.d, b.height * 0.5) * 0.9 + 2;
    this.shield = new THREE.Mesh(new THREE.SphereGeometry(r, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: FAC.good, wireframe: true, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.shield.scale.y = Math.max(1, (b.height + 2) / r); this.shield.position.set(b.spec.x, 0, b.spec.z); this.shield.visible = false; this.root.add(this.shield);
    const ring = new THREE.RingGeometry(r * 0.9, r, 64); ring.rotateX(-Math.PI / 2);
    this.alarm = new THREE.Mesh(ring, new THREE.MeshBasicMaterial({ color: FAC.crit, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    this.alarm.position.set(b.spec.x, 0.05, b.spec.z); this.root.add(this.alarm);
  }
  setState(st) {
    this.state = st;
    if (this.beam) {
      const on = st === 'warning'; if (on) this.beam.visible = true;
      gsap.to(this.beamMat.uniforms.uOpacity, { value: on ? 1 : 0, duration: 0.8, onComplete: () => { if (!on && this.beam) this.beam.visible = false; } });
    }
    if (this.shield) {
      const m = this.shield.material;
      if (st === 'protected') {
        this.shield.visible = true; this.shield.scale.x = this.shield.scale.z = 0.2;
        gsap.to(this.shield.scale, { x: 1, z: 1, duration: 1.4, ease: 'back.out(1.4)' }); gsap.to(m, { opacity: 0.16, duration: 1 });
      } else gsap.to(m, { opacity: 0, duration: 0.6, onComplete: () => { if (this.shield) this.shield.visible = false; } });
    }
    const z = this.zone; if (!z) return;
    const fl = this.buildings.get(z.buildingId)?.floors[z.floor - 1]; if (!fl) return;
    const c = st === 'critical' || st === 'recovering' ? FAC.crit : st === 'warning' ? FAC.warn : st === 'signal' ? FAC.signal : st === 'protected' ? FAC.good : FAC.zone;
    fl.baseColor.copy(c);
    if (this.zoneTag) this.zoneTag.element.dataset.state = st;
  }
  pose(level) {
    const z = this.zone, b = (z && this.buildings.get(z.buildingId)) || [...this.buildings.values()][0];
    if (!b) return { pos: new THREE.Vector3(30, 30, 30), target: new THREE.Vector3() };
    const s = b.spec, dir = new THREE.Vector3(Math.cos((s.rot ?? 0) + 0.7), 0, -Math.sin((s.rot ?? 0) + 0.7));
    if (level === 'floor' && z) {
      const t = new THREE.Vector3(s.x, (b.floors[z.floor - 1]?.y ?? 0) + 0.2, s.z), d = Math.max(s.w, s.d) * 1.15 + 3;
      return { pos: t.clone().add(dir.clone().multiplyScalar(d)).add(new THREE.Vector3(0, d * 0.75, 0)), target: t };
    }
    if (level === 'building') {
      const t = new THREE.Vector3(s.x, b.height * 0.45, s.z), d = Math.max(b.height * 1.25, Math.max(s.w, s.d) * 2.6) + 6;
      return { pos: t.clone().add(dir.clone().multiplyScalar(d)).add(new THREE.Vector3(0, b.height * 0.25 + d * 0.25, 0)), target: t };
    }
    const all = [...this.buildings.values()], cx = all.reduce((a, x) => a + x.spec.x, 0) / all.length, cz = all.reduce((a, x) => a + x.spec.z, 0) / all.length;
    const hMax = Math.max(...all.map((x) => x.height)), spread = Math.max(...all.map((x) => Math.hypot(x.spec.x - cx, x.spec.z - cz) + Math.max(x.spec.w, x.spec.d) / 2));
    const t = new THREE.Vector3(cx, hMax * 0.3, cz), d = Math.max(hMax * 1.6, spread * 1.6 + 10);
    return { pos: t.clone().add(dir.clone().multiplyScalar(d)).add(new THREE.Vector3(0, d * 0.55, 0)), target: t };
  }
  setFocus(level) {
    this.focus = level;
    const z = this.zone, zb = z ? this.buildings.get(z.buildingId) : null;
    this.interior.visible = level === 'floor';
    this.deviceLabels.forEach((l) => (l.visible = level === 'floor'));
    this.buildings.forEach((b) => {
      b.label.visible = level !== 'floor' || b !== zb;
      b.floors.forEach((f) => {
        const above = level === 'floor' && b === zb && z && f.index > z.floor, isZone = b === zb && z && f.index === z.floor, other = level === 'floor' && b !== zb;
        const k = above ? 0.06 : other ? 0.3 : isZone && level === 'floor' ? 0.25 : 1;
        gsap.to(f.mesh.material, { opacity: f.baseOpacity * 0.55 * k, duration: 0.8 });
        gsap.to(f.edges.material, { opacity: Math.min(1, f.baseOpacity + 0.25) * (above ? 0.12 : other ? 0.4 : 1), duration: 0.8 });
      });
    });
    gsap.to(this.cityMat.uniforms.uDim, { value: level === 'floor' ? 0.45 : 1, duration: 1 });
  }
  anchor(kind) {
    const z = this.zone, b = (z && this.buildings.get(z.buildingId)) || [...this.buildings.values()][0];
    if (!b) return null;
    if (kind === 'zone' && z) return new THREE.Vector3(b.spec.x, (b.floors[z.floor - 1]?.y ?? 0) + b.spec.floorH * 0.5, b.spec.z);
    return kind === 'top' ? new THREE.Vector3(b.spec.x, b.height, b.spec.z) : b.center.clone();
  }
  pickFloor(rc) {
    const meshes = []; this.buildings.forEach((b) => b.floors.forEach((f) => meshes.push(f.mesh)));
    const hit = rc.intersectObjects(meshes, false)[0]; return hit ? hit.object.userData : null;
  }
  hover(rc) {
    const hit = this.pickFloor(rc), fl = hit ? this.buildings.get(hit.building)?.floors[hit.floor - 1] ?? null : null;
    if (fl === this.hoverFloor) return;
    this.hoverFloor = fl;
    if (!hit || !fl) return this.onFloorHover(null);
    const b = this.buildings.get(hit.building), ml = b.spec.metlife?.some(([a, z]) => hit.floor >= a && hit.floor <= z);
    const band = b.spec.bands?.find((x) => hit.floor >= x.from && hit.floor <= x.to);
    const isZone = this.zone && this.zone.buildingId === hit.building && this.zone.floor === hit.floor ? this.zone : null;
    const text = isZone ? `${isZone.room}. ${isZone.basis}` : ml ? 'MetLife-occupied floor (public source)' : band ? band.label : b.spec.heightVerified ? 'Office floor' : 'Illustrative floor';
    this.onFloorHover({ building: b.spec.label, floor: hit.floor, text });
  }
  update(dt) {
    this.time += dt; const t = this.time;
    this.groundMat.uniforms.uTime.value = t;
    this.flows.forEach((m) => (m.uniforms.uTime.value += dt));
    if (this.beamMat) this.beamMat.uniforms.uTime.value = t;
    this.pulse = (Math.sin(t * (this.state === 'critical' ? 7 : 3.2)) + 1) / 2;
    const white = new THREE.Color('#ffffff');
    this.buildings.forEach((b) => b.floors.forEach((f) => {
      const isZone = this.zone && b.spec.id === this.zone.buildingId && f.index === this.zone.floor, hov = f === this.hoverFloor;
      f.mesh.material.color.copy(f.baseColor);
      f.edges.material.color.copy(f.baseColor).lerp(FAC.edge, isZone ? 0 : 0.3);
      if (isZone) f.edges.material.color.multiplyScalar(0.7 + this.pulse * 0.9);
      if (hov) { f.mesh.material.color.lerp(white, 0.35); f.edges.material.color.lerp(white, 0.5); }
    }));
    if (this.alarm) {
      const m = this.alarm.material, crit = this.state === 'critical';
      m.opacity += ((crit ? 0.25 + this.pulse * 0.5 : 0) - m.opacity) * Math.min(1, dt * 4);
      const s = 1 + ((t * 0.6) % 1) * 0.5; this.alarm.scale.set(s, 1, s);
    }
    if (this.shield?.visible) this.shield.rotation.y += dt * 0.3;
    for (const d of this.deviceSprites) d.sprite.material.opacity = 0.65 + 0.35 * Math.sin(t * (this.state === 'critical' && d.kind !== 'te' ? 9 : 2.5) + d.phase);
    if (this.zoneTag) this.zoneTag.visible = this.focus !== 'site';
  }
}

// ---------------------------------------------------------------------------------------------
// World: the globe view and the switch into the facility view.
// ---------------------------------------------------------------------------------------------
export class World {
  scene = new THREE.Scene(); globe = new THREE.Group(); shell = new THREE.Group();
  rings = []; agents = []; beacons = new Map(); fabricArcs = []; blastArcs = []; flashes = [];
  raycaster = new THREE.Raycaster(); pointer = new THREE.Vector2(-10, -10); hovered = null;
  last = performance.now(); elapsed = 0; glow = glowTexture();
  layerState = { fabric: 1, streams: 1, reach: 1, silo: 0, shell: 1 };
  camTween = null; idleSpin = true; view = 'globe'; localTween = null; center = null; offset = { x: 0, y: 0 }; offsetTween = null;
  onSiteClick = () => {}; onSiteHover = () => {}; onFloorClick = () => {};

  constructor(container, labelEl) {
    this.container = container;
    const w = container.clientWidth, h = container.clientHeight;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h); this.renderer.setClearColor('#02050c');
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.05;
    container.appendChild(this.renderer.domElement);
    this.labelEl = labelEl;
    this.labels = new CSS2DRenderer({ element: labelEl }); this.labels.setSize(w, h);
    this.localLabelEl = document.createElement('div'); this.localLabelEl.id = 'labelsLocal'; labelEl.after(this.localLabelEl);
    this.localLabels = new CSS2DRenderer({ element: this.localLabelEl }); this.localLabels.setSize(w, h); this.localLabelEl.style.display = 'none';
    this.warpEl = document.createElement('div'); this.warpEl.className = 'warp'; document.body.appendChild(this.warpEl);

    this.camera = new THREE.PerspectiveCamera(42, w / h, 0.01, 200);
    this.camera.position.copy(latLon(25, -40, 3.8));
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    Object.assign(this.controls, { enableDamping: true, dampingFactor: 0.06, enablePan: false, minDistance: 1.35, maxDistance: 7, rotateSpeed: 0.5, zoomSpeed: 0.7 });
    this.controls.addEventListener('start', () => { this.camTween?.kill(); this.idleSpin = false; });
    this.localCam = new THREE.PerspectiveCamera(45, w / h, 0.1, 900);
    this.localControls = new OrbitControls(this.localCam, this.renderer.domElement);
    Object.assign(this.localControls, { enableDamping: true, dampingFactor: 0.07, maxPolarAngle: 1.48, minDistance: 3, maxDistance: 220, enabled: false });
    this.localControls.addEventListener('start', () => this.localTween?.kill());
    this.facility = new Facility(this.glow);

    this.scene.add(this.globe);
    this.buildStars(); this.buildOcean(); this.buildDots(); this.buildAtmosphere(); this.buildBeacons(); this.buildFabric(); this.buildStreams(); this.buildShell();

    this.beamMat = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 }, uColor: { value: new THREE.Color('#7fe7ff') } }, vertexShader: UV_VERT, fragmentShader: BEAM_FRAG(60, true), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    this.beam = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.022, 0.55, 24, 1, true), this.beamMat); this.beam.visible = false; this.globe.add(this.beam);
    this.shockMat = new THREE.MeshBasicMaterial({ color: '#7cf29c', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const sg = new THREE.RingGeometry(0.02, 0.026, 64); sg.rotateX(-Math.PI / 2);
    this.shock = new THREE.Mesh(sg, this.shockMat); this.shock.visible = false; this.globe.add(this.shock);

    this.renderPass = new RenderPass(this.scene, this.camera);
    this.bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.62, 0.5, 0.32);
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(this.renderPass); this.composer.addPass(this.bloom); this.composer.addPass(new OutputPass());

    window.addEventListener('resize', () => this.resize());
    this.renderer.domElement.addEventListener('pointermove', (e) => this.onPointerMove(e));
    this.renderer.domElement.addEventListener('click', () => {
      if (this.view === 'local') {
        this.facility.raycaster.setFromCamera(this.pointer, this.localCam);
        const hit = this.facility.pickFloor(this.facility.raycaster);
        if (hit) this.onFloorClick(hit.building, hit.floor);
      } else if (this.hovered) this.onSiteClick(this.hovered);
    });
    this.setSun(-40);
  }
  buildStars() {
    const n = 2600, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), v = new THREE.Vector3();
    for (let i = 0; i < n; i++) { v.randomDirection().multiplyScalar(40 + Math.random() * 60); pos.set([v.x, v.y, v.z], i * 3); const b = 0.5 + Math.random() * 0.5; col.set([b * 0.8, b * 0.9, b], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    this.scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 0.18, map: this.glow, vertexColors: true, transparent: true, depthWrite: false, opacity: 0.8 })));
  }
  buildOcean() {
    this.oceanMat = new THREE.ShaderMaterial({ uniforms: { uSun: { value: new THREE.Vector3(1, 0, 0) } },
      vertexShader: `varying vec3 vN; varying vec3 vWN; varying vec3 vView; void main(){ vN = normalize(normalMatrix*normal); vWN = normalize((modelMatrix*vec4(normal,0.0)).xyz);
        vec4 mv = modelViewMatrix*vec4(position,1.0); vView = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `uniform vec3 uSun; varying vec3 vN; varying vec3 vWN; varying vec3 vView; void main(){ float fres = pow(1.0-max(dot(vN,vView),0.0),3.0);
        float day = smoothstep(-0.2,0.4,dot(vWN,uSun)); vec3 deep = mix(vec3(0.005,0.012,0.03), vec3(0.012,0.04,0.085), day);
        gl_FragColor = vec4(deep + vec3(0.05,0.35,0.7)*fres*0.55, 1.0); }` });
    this.globe.add(new THREE.Mesh(new THREE.SphereGeometry(0.995, 96, 64), this.oceanMat));
  }
  buildDots() {
    const pos = landPoints(95000), n = pos.length / 3, rnd = new Float32Array(n);
    for (let i = 0; i < n; i++) rnd[i] = Math.random();
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 1));
    this.dotsMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uSun: { value: new THREE.Vector3(1, 0, 0) }, uPixelRatio: { value: this.renderer.getPixelRatio() }, uFocus: { value: new THREE.Vector3() }, uFocusStrength: { value: 0 },
        uScan: { value: 0 }, uScanStrength: { value: 0 }, uIncident: { value: new THREE.Vector3() }, uIncidentColor: { value: new THREE.Color('#ff3b4f') }, uIncidentRadius: { value: 0 }, uIncidentStrength: { value: 0 } },
      vertexShader: `uniform float uTime; uniform vec3 uSun; uniform float uPixelRatio; uniform vec3 uFocus; uniform float uFocusStrength; uniform float uScan; uniform float uScanStrength;
        uniform vec3 uIncident; uniform vec3 uIncidentColor; uniform float uIncidentRadius; uniform float uIncidentStrength; attribute float aRnd; varying vec3 vColor; varying float vAlpha;
        void main(){ vec3 p = position; float day = smoothstep(-0.12,0.3,dot(normalize(p),uSun)); vec3 c = mix(vec3(0.05,0.11,0.24), vec3(0.2,0.46,0.78), day);
          float lights = step(0.965,aRnd)*(1.0-day)*(0.6+0.4*sin(uTime*2.0+aRnd*50.0)); c += vec3(1.0,0.72,0.35)*lights*0.9;
          float df = distance(p,uFocus); c += vec3(0.25,0.7,1.0)*uFocusStrength*smoothstep(0.32,0.0,df)*0.7;
          float ring = smoothstep(0.03,0.0,abs(df-uScan))*uScanStrength; c += vec3(0.4,0.95,1.0)*ring*1.6;
          float di = distance(p,uIncident); float inc = smoothstep(uIncidentRadius, uIncidentRadius*0.2, di)*uIncidentStrength;
          c = mix(c, uIncidentColor*(0.75+0.35*sin(uTime*5.0-di*40.0)), clamp(inc,0.0,1.0)*0.8);
          vec4 mv = modelViewMatrix*vec4(p*1.002,1.0); gl_PointSize = (0.0062+ring*0.005+inc*0.003)*uPixelRatio*(900.0/-mv.z);
          vColor = c; vAlpha = 0.65+day*0.35+ring; gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `varying vec3 vColor; varying float vAlpha; void main(){ float d = length(gl_PointCoord-0.5); if(d>0.5) discard; gl_FragColor = vec4(vColor, smoothstep(0.5,0.18,d)*vAlpha); }`,
      transparent: true, depthWrite: false });
    this.globe.add(new THREE.Points(g, this.dotsMat));
  }
  buildAtmosphere() {
    this.atmosphereMat = new THREE.ShaderMaterial({ uniforms: { uColor: { value: new THREE.Color('#1d8fff') }, uIntensity: { value: 1 } },
      vertexShader: `varying vec3 vN; varying vec3 vView; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vView = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `uniform vec3 uColor; uniform float uIntensity; varying vec3 vN; varying vec3 vView; void main(){ float d = clamp(-dot(vN,vView)*1.95,0.0,1.0); float i = pow(d,2.6)*0.95*uIntensity; gl_FragColor = vec4(uColor*i, i); }`,
      side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), this.atmosphereMat); m.scale.setScalar(1.16); this.scene.add(m);
  }
  buildBeacons() {
    const up = new THREE.Vector3(0, 1, 0);
    for (const s of SITES) {
      const hub = !!s.hub, n = latLon(s.lat, s.lon, 1), g = new THREE.Group();
      g.position.copy(n); g.quaternion.setFromUnitVectors(up, n);
      const color = STATE_COLORS.idle.clone(), h = hub ? 0.07 : 0.032;
      const sg = new THREE.CylinderGeometry(0.0012, 0.0028, h, 8); sg.translate(0, h / 2, 0);
      const spike = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })); g.add(spike);
      const head = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glow, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      head.position.y = h; head.scale.setScalar(hub ? 0.055 : 0.03); g.add(head);
      const bg = new THREE.RingGeometry(hub ? 0.012 : 0.007, hub ? 0.016 : 0.009, 48); bg.rotateX(-Math.PI / 2);
      const base = new THREE.Mesh(bg, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); base.position.y = 0.002; g.add(base);
      const pg = new THREE.RingGeometry(0.014, 0.017, 48); pg.rotateX(-Math.PI / 2);
      const pulse = new THREE.Mesh(pg, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); pulse.position.y = 0.003; g.add(pulse);
      const shield = new THREE.Mesh(new THREE.SphereGeometry(0.085, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: STATE_COLORS.protected, wireframe: true, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
      shield.visible = false; g.add(shield);
      const hit = new THREE.Mesh(new THREE.SphereGeometry(hub ? 0.045 : 0.03, 8, 8), new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.y = h * 0.6; hit.userData.siteId = s.id; g.add(hit);
      const el = document.createElement('div');
      el.className = `site-label ${hub ? 'hub' : 'minor'}${['whippany', 'dublin', 'hongkong'].includes(s.id) ? ' left' : ''}`;
      el.innerHTML = `<span class="dot"></span><span class="txt">${s.city}<em class="note"></em></span>`;
      el.addEventListener('click', () => this.onSiteClick(s.id));
      const label = new CSS2DObject(el); label.position.set(0, h + 0.012, 0); g.add(label);
      this.globe.add(g);
      this.beacons.set(s.id, { site: s, group: g, normal: n, head, spike, base, pulse, shield, hit, label, state: 'idle', color, pulseT: Math.random() });
    }
  }
  makeArc(a, b, color, opacity, speed, radius = 0.0022) {
    const dist = a.distanceTo(b), lift = 0.03 + Math.min(dist, 1.3) * 0.17, q0 = new THREE.Quaternion(), q1 = new THREE.Quaternion().setFromUnitVectors(a.clone().normalize(), b.clone().normalize()), pts = [];
    for (let i = 0; i <= 48; i++) { const t = i / 48; pts.push(a.clone().normalize().applyQuaternion(q0.clone().slerp(q1, t)).multiplyScalar(1.003 + Math.sin(Math.PI * t) * lift)); }
    const mat = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uSpeed: { value: speed }, uOpacity: { value: opacity }, uColor: { value: color.clone() }, uPhase: { value: Math.random() } }, vertexShader: UV_VERT, fragmentShader: ARC_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 72, radius, 6, false), mat);
    this.globe.add(mesh); return { mesh, mat };
  }
  buildFabric() {
    const pairs = [['nyc', 'cary'], ['cary', 'tampa'], ['nyc', 'whippany'], ['cary', 'cdmx'], ['cdmx', 'santiago'], ['santiago', 'saopaulo'], ['cdmx', 'saopaulo'], ['nyc', 'london'], ['london', 'dublin'], ['london', 'paris'], ['paris', 'warsaw'], ['warsaw', 'istanbul'], ['istanbul', 'dubai'], ['london', 'dubai'], ['dubai', 'noida'], ['noida', 'mumbai'], ['noida', 'hongkong'], ['hongkong', 'shanghai'], ['shanghai', 'seoul'], ['seoul', 'tokyo'], ['tokyo', 'sydney'], ['hongkong', 'sydney'], ['tokyo', 'cary'], ['cary', 'noida'], ['cary', 'london'], ['tampa', 'cdmx'], ['nyc', 'greenbush'], ['cary', 'greenbush'], ['london', 'brighton'], ['brighton', 'dublin']];
    const c = new THREE.Color('#2fb4ff');
    for (const [a, b] of pairs) if (this.beacons.has(a) && this.beacons.has(b)) this.fabricArcs.push(this.makeArc(this.beacons.get(a).normal, this.beacons.get(b).normal, c, 0.75, 0.12 + Math.random() * 0.12));
  }
  buildStreams() {
    const per = 26, n = SITES.length * per, pos = new Float32Array(n * 3), ph = new Float32Array(n), sp = new Float32Array(n), col = new Float32Array(n * 3);
    let k = 0;
    for (const s of SITES) {
      const nrm = this.beacons.get(s.id).normal;
      for (let i = 0; i < per; i++, k++) {
        const p = nrm.clone().add(new THREE.Vector3().randomDirection().multiplyScalar(0.012)).normalize();
        pos.set([p.x, p.y, p.z], k * 3); ph[k] = Math.random(); sp[k] = 0.12 + Math.random() * 0.18;
        const c = SILO[i % SILO.length]; col.set([c.r, c.g, c.b], k * 3);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1)); g.setAttribute('aSpeed', new THREE.BufferAttribute(sp, 1)); g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    this.streamsMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uReach: { value: 1 }, uOpacity: { value: 1 }, uSilo: { value: 0 }, uPixelRatio: { value: this.renderer.getPixelRatio() }, uShell: { value: SHELL_R } },
      vertexShader: `uniform float uTime; uniform float uReach; uniform float uOpacity; uniform float uSilo; uniform float uPixelRatio; uniform float uShell;
        attribute float aPhase; attribute float aSpeed; attribute vec3 aColor; varying vec3 vColor; varying float vAlpha;
        void main(){ float f = fract(uTime*aSpeed+aPhase); float r = mix(1.01, 1.01+(uShell-1.01)*uReach, f); vec3 p = normalize(position)*r;
          vec4 mv = modelViewMatrix*vec4(p,1.0); gl_PointSize = 0.009*uPixelRatio*(900.0/-mv.z); vColor = mix(vec3(0.45,0.9,1.0), aColor, uSilo);
          vAlpha = sin(f*3.14159)*uOpacity; gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `varying vec3 vColor; varying float vAlpha; void main(){ float d = length(gl_PointCoord-0.5); if(d>0.5) discard; gl_FragColor = vec4(vColor*1.4, smoothstep(0.5,0.0,d)*vAlpha); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    this.globe.add(new THREE.Points(g, this.streamsMat));
  }
  buildShell() {
    this.shellLines = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(SHELL_R, 3)), new THREE.LineBasicMaterial({ color: '#2fb4ff', transparent: true, opacity: 0.045, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.shell.add(this.shellLines);
    [new THREE.Euler(Math.PI / 2.2, 0, 0.3), new THREE.Euler(Math.PI / 3, 0.9, -0.2), new THREE.Euler(Math.PI / 1.7, -0.7, 0.5)].forEach((e, i) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(SHELL_R + i * 0.035, 0.0016, 6, 320), new THREE.MeshBasicMaterial({ color: i === 0 ? '#7fe7ff' : '#2fb4ff', transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }));
      ring.rotation.copy(e); this.rings.push(ring); this.shell.add(ring);
    });
    const geo = new THREE.OctahedronGeometry(0.018, 0);
    for (let i = 0; i < 9; i++) {
      const g = new THREE.Group(), core = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: '#bff6ff' }));
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glow, color: '#49d3ff', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      halo.scale.setScalar(0.06); g.add(core, halo); this.shell.add(g);
      this.agents.push({ mesh: g, ring: i % 3, speed: 0.08 + Math.random() * 0.06, phase: (i / 9) * Math.PI * 2 });
    }
    this.scene.add(this.shell);
  }
  setSun(lon, lat = -11) { const v = latLon(lat, lon, 1); this.dotsMat.uniforms.uSun.value.copy(v); this.oceanMat.uniforms.uSun.value.copy(v); }
  // Story layers: how strongly fabric arcs, data streams, silo colouring and the vantage shell show.
  setLayer(name) {
    const L = { sites: { fabric: 0.25, streams: 0.35, reach: 0.25, silo: 0, shell: 0.15 }, silos: { fabric: 0, streams: 1.3, reach: 0.32, silo: 1, shell: 0 },
      fabric: { fabric: 1.2, streams: 1, reach: 0.45, silo: 0, shell: 0.2 }, agents: { fabric: 0.8, streams: 1, reach: 1, silo: 0, shell: 1.4 }, all: { fabric: 0.8, streams: 0.9, reach: 1, silo: 0, shell: 1 } }[name];
    gsap.to(this.layerState, { ...L, duration: 2.2, ease: 'power2.inOut' });
  }
  // Great-circle camera flight with a lift in the middle of long moves.
  flyTo(lat, lon, dist, dur = 2.6) {
    this.camTween?.kill(); this.idleSpin = false;
    const cur = toLatLon(this.camera.position); let dl = lon - cur.lon; if (dl > 180) dl -= 360; if (dl < -180) dl += 360;
    const o = { lat: cur.lat, lon: cur.lon, r: cur.r }, lift = Math.min(1.2, Math.abs(dl) / 120 + Math.abs(lat - cur.lat) / 120);
    return new Promise((res) => {
      this.camTween = gsap.to(o, { lat, lon: cur.lon + dl, r: dist, duration: dur, ease: 'power2.inOut',
        onUpdate: () => { const p = this.camTween ? this.camTween.progress() : 1; latLon(o.lat, o.lon, o.r + Math.sin(p * Math.PI) * lift, this.camera.position); this.camera.lookAt(0, 0, 0); },
        onComplete: res, onInterrupt: res });
    });
  }
  focusSite(id, dist = 2.15, dur = 2.6) {
    const b = this.beacons.get(id); if (!b) return Promise.resolve();
    this.dotsMat.uniforms.uFocus.value.copy(b.normal);
    gsap.to(this.dotsMat.uniforms.uFocusStrength, { value: 1, duration: 1.5 });
    this.beacons.forEach((x) => x.label.element.classList.toggle('focused', x.site.id === id));
    return this.flyTo(b.site.lat - 6, b.site.lon, dist, dur);
  }
  clearFocus() { gsap.to(this.dotsMat.uniforms.uFocusStrength, { value: 0, duration: 1.2 }); this.beacons.forEach((b) => b.label.element.classList.remove('focused')); }
  setIdleSpin(on) { this.idleSpin = on; }
  scan(id) {
    const b = this.beacons.get(id); if (!b) return;
    const u = this.dotsMat.uniforms; u.uFocus.value.copy(b.normal);
    gsap.fromTo(u.uScan, { value: 0 }, { value: 0.9, duration: 2.4, ease: 'power1.out' });
    gsap.fromTo(u.uScanStrength, { value: 1 }, { value: 0, duration: 2.4, ease: 'power2.in' });
  }
  setSiteState(id, st) {
    const b = this.beacons.get(id); if (!b || b.state === st) return;
    b.state = st; const c = STATE_COLORS[st];
    gsap.to(b.color, { r: c.r, g: c.g, b: c.b, duration: 0.6 }); b.label.element.dataset.state = st;
    const m = b.shield.material;
    if (st === 'protected') { b.shield.visible = true; b.shield.scale.setScalar(0.2); gsap.to(b.shield.scale, { x: 1, y: 1, z: 1, duration: 1.2, ease: 'back.out(1.6)' }); gsap.to(m, { opacity: 0.22, duration: 0.8 }); }
    else if (b.shield.visible) gsap.to(m, { opacity: 0, duration: 0.5, onComplete: () => (b.shield.visible = false) });
  }
  setLabelNote(id, text = '') { this.beacons.forEach((b) => (b.label.element.querySelector('.note').textContent = b.site.id === id ? text : '')); }
  resetSites() { this.beacons.forEach((_, id) => this.setSiteState(id, 'idle')); this.setBeam(null); this.setIncident(null); this.setBlast(null, []); }
  setIncident(id, kind = 'critical', radius = 0.22, strength) {
    const u = this.dotsMat.uniforms;
    if (!id) { gsap.to(u.uIncidentStrength, { value: 0, duration: 0.8 }); return; }
    u.uIncident.value.copy(this.beacons.get(id).normal);
    const c = kind === 'critical' ? STATE_COLORS.critical : kind === 'warning' ? STATE_COLORS.warning : STATE_COLORS.protected;
    gsap.to(u.uIncidentColor.value, { r: c.r, g: c.g, b: c.b, duration: 0.6 });
    gsap.to(u.uIncidentRadius, { value: radius, duration: 1.2 });
    gsap.to(u.uIncidentStrength, { value: strength ?? (kind === 'protected' ? 0.42 : kind === 'warning' ? 0.7 : 1), duration: 0.8 });
  }
  setBlast(id, targets) {
    for (const a of this.blastArcs) { this.globe.remove(a.mesh); a.mesh.geometry.dispose(); a.mat.dispose(); }
    this.blastArcs = []; if (!id) return;
    const from = this.beacons.get(id).normal;
    for (const t of targets) { const b = this.beacons.get(t); if (b) this.blastArcs.push(this.makeArc(from, b.normal, STATE_COLORS.critical, 1.4, 0.5, 0.0035)); }
  }
  setBeam(id) {
    if (!id) { gsap.to(this.beamMat.uniforms.uOpacity, { value: 0, duration: 0.6, onComplete: () => (this.beam.visible = false) }); return; }
    const b = this.beacons.get(id);
    this.beam.position.copy(b.normal).multiplyScalar(1.275); this.beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.normal);
    this.beam.visible = true; gsap.to(this.beamMat.uniforms.uOpacity, { value: 1, duration: 0.6 });
    const dest = b.normal.clone().multiplyScalar(SHELL_R), agent = this.agents[0];
    agent.speed = 0; gsap.to(agent.mesh.position, { x: dest.x, y: dest.y, z: dest.z, duration: 1.2, ease: 'power2.out' });
  }
  releaseAgent() { this.agents[0].speed = 0.1; }
  shockwave(id, color = '#7cf29c') {
    const b = this.beacons.get(id); if (!b) return;
    this.shock.position.copy(b.normal).multiplyScalar(1.003); this.shock.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.normal);
    this.shock.visible = true; this.shockMat.color.set(color);
    gsap.fromTo(this.shock.scale, { x: 1, y: 1, z: 1 }, { x: 9, y: 9, z: 9, duration: 1.6, ease: 'power2.out' });
    gsap.fromTo(this.shockMat, { opacity: 1 }, { opacity: 0, duration: 1.6, ease: 'power1.in' });
  }
  flash(id, color = '#7cf29c') {
    const b = this.beacons.get(id); if (!b) return;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glow, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.position.copy(b.normal).multiplyScalar(1.02); s.scale.setScalar(0.01); this.globe.add(s); this.flashes.push({ sprite: s, t: 0 });
  }
  warp() {
    return new Promise((res) => { this.warpEl.classList.remove('on'); void this.warpEl.offsetWidth; this.warpEl.classList.add('on'); setTimeout(res, 420); setTimeout(() => this.warpEl.classList.remove('on'), 1100); });
  }
  useLocal(on) {
    this.view = on ? 'local' : 'globe'; this.controls.enabled = !on; this.localControls.enabled = on;
    this.renderPass.scene = on ? this.facility.scene : this.scene; this.renderPass.camera = on ? this.localCam : this.camera;
    this.labelEl.style.display = on ? 'none' : ''; this.localLabelEl.style.display = on ? '' : 'none';
    this.bloom.strength = on ? 0.5 : 0.62; this.hovered = null; this.onSiteHover(null);
  }
  async enterFacility(fac, zone, level = 'building') {
    if (this.view === 'local' && this.facility.facility?.siteId === fac.siteId && this.facility.zone === zone) return this.setLocalFocus(level);
    if (this.view === 'globe') { const s = SITE[fac.siteId]; this.idleSpin = false; await this.flyTo(s.lat, s.lon, 1.32, 1.5); }
    await this.warp(); this.facility.build(fac, zone); this.useLocal(true);
    const p = this.facility.pose(level);
    this.localCam.position.copy(p.target).add(new THREE.Vector3(6, 160, 40)); this.localControls.target.copy(p.target); this.localCam.lookAt(p.target);
    this.facility.setFocus(level); await this.tweenLocal(level, 2.6);
  }
  tweenLocal(level, dur = 1.8) {
    const p = this.facility.pose(level); this.localTween?.kill();
    return new Promise((res) => {
      const tl = gsap.timeline({ onComplete: res, onInterrupt: res });
      tl.to(this.localCam.position, { x: p.pos.x, y: p.pos.y, z: p.pos.z, duration: dur, ease: 'power3.inOut' }, 0);
      tl.to(this.localControls.target, { x: p.target.x, y: p.target.y, z: p.target.z, duration: dur, ease: 'power3.inOut', onUpdate: () => this.localCam.lookAt(this.localControls.target) }, 0);
      this.localTween = tl;
    });
  }
  async setLocalFocus(level) { if (this.view === 'local') { this.facility.setFocus(level); await this.tweenLocal(level, 1.8); } }
  setLocalState(st) { this.facility.setState(st); }
  async exitFacility(dur = 2.4) {
    if (this.view !== 'local') return;
    const id = this.facility.facility?.siteId; this.localTween?.kill();
    await new Promise((res) => gsap.to(this.localCam.position, { y: this.localCam.position.y + 120, duration: 0.9, ease: 'power2.in', onUpdate: () => this.localCam.lookAt(this.localControls.target), onComplete: res }));
    await this.warp(); this.useLocal(false);
    if (id) { const s = SITE[id]; latLon(s.lat - 2, s.lon, 1.3, this.camera.position); this.camera.lookAt(0, 0, 0); await this.flyTo(s.lat - 6, s.lon, dur, 1.8); }
  }
  // Screen position of a site (globe) or of the building / zone (facility), for panel leader lines.
  project(key) {
    const rect = this.renderer.domElement.getBoundingClientRect(); let p = null, cam = this.camera, visible = true;
    if (this.view === 'local') { p = this.facility.anchor(key === 'top' ? 'top' : key === 'building' ? 'building' : 'zone'); cam = this.localCam; }
    else { const b = this.beacons.get(key); if (b) { p = b.normal.clone().multiplyScalar(1.05); visible = b.normal.dot(this.camera.position.clone().normalize()) > 0.12; } }
    if (!p) return { x: 0, y: 0, visible: false };
    const v = p.project(cam); if (v.z > 1) visible = false;
    return { x: rect.left + (v.x + 1) / 2 * rect.width, y: rect.top + (1 - v.y) / 2 * rect.height, visible };
  }
  onPointerMove(e) { const r = this.renderer.domElement.getBoundingClientRect(); this.pointer.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); }
  pick() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects([...this.beacons.values()].map((b) => b.hit), false), cam = this.camera.position.clone().normalize();
    const h = hits.find((x) => this.beacons.get(x.object.userData.siteId).normal.dot(cam) > 0.1), id = h ? h.object.userData.siteId : null;
    if (id !== this.hovered) { this.hovered = id; this.renderer.domElement.style.cursor = id ? 'pointer' : 'grab'; this.onSiteHover(id ? SITE[id] : null); }
  }
  resize() {
    const w = this.container.clientWidth, h = this.container.clientHeight;
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.renderer.setSize(w, h); this.composer.setSize(w, h); this.bloom.setSize(w, h);
    this.labels.setSize(w, h); this.localLabels.setSize(w, h); this.localCam.aspect = w / h; this.localCam.updateProjectionMatrix(); this.applyOffset();
  }
  // Keep the globe centred in the free space between the side panels (view offset).
  setCenter(x, y) {
    this.center = { x, y };
    const w = this.container.clientWidth, h = this.container.clientHeight;
    const ox = THREE.MathUtils.clamp(w / 2 - x, -w * 0.2, w * 0.2), oy = THREE.MathUtils.clamp(h / 2 - y, -h * 0.2, h * 0.2);
    this.offsetTween?.kill(); this.offsetTween = gsap.to(this.offset, { x: ox, y: oy, duration: 0.6, ease: 'power2.out', onUpdate: () => this.applyOffset() });
  }
  applyOffset() {
    const w = this.container.clientWidth, h = this.container.clientHeight;
    for (const c of [this.camera, this.localCam]) {
      if (this.center && (Math.abs(this.offset.x) > 0.5 || Math.abs(this.offset.y) > 0.5)) c.setViewOffset(w, h, this.offset.x, this.offset.y, w, h); else c.clearViewOffset();
    }
  }
  start() { const loop = () => { requestAnimationFrame(loop); this.frame(); }; loop(); }
  frame() {
    const now = performance.now(), dt = Math.min((now - this.last) / 1000, 0.05); this.last = now; this.elapsed += dt;
    const t = this.elapsed, L = this.layerState;
    this.dotsMat.uniforms.uTime.value = t;
    this.streamsMat.uniforms.uTime.value = t; this.streamsMat.uniforms.uReach.value = L.reach; this.streamsMat.uniforms.uOpacity.value = L.streams; this.streamsMat.uniforms.uSilo.value = L.silo;
    this.beamMat.uniforms.uTime.value = t;
    for (const a of this.fabricArcs) { a.mat.uniforms.uTime.value = t; a.mat.uniforms.uOpacity.value = 0.55 * L.fabric; }
    for (const a of this.blastArcs) a.mat.uniforms.uTime.value = t;
    const near = THREE.MathUtils.clamp((this.camera.position.length() - 1.9) / 1.6, 0.18, 1);
    this.shellLines.material.opacity = 0.05 * L.shell * near;
    this.rings.forEach((r, i) => { r.rotation.z += dt * (0.03 + i * 0.015) * (i % 2 ? -1 : 1); r.material.opacity = 0.35 * L.shell * near; });
    this.shell.rotation.y += dt * 0.01;
    const v = new THREE.Vector3();
    for (const a of this.agents) {
      a.mesh.visible = L.shell > 0.05; a.mesh.children[0].rotation.y += dt * 2;
      if (a.speed === 0) continue;
      a.phase += dt * a.speed; const ring = this.rings[a.ring], R = SHELL_R + a.ring * 0.035;
      v.set(Math.cos(a.phase) * R, Math.sin(a.phase) * R, 0).applyEuler(ring.rotation); a.mesh.position.lerp(v, Math.min(1, dt * 4));
    }
    const cam = this.camera.position.clone().normalize();
    this.beacons.forEach((b) => {
      const d = b.normal.dot(cam);
      b.label.visible = d > 0.15; b.label.element.style.opacity = String(THREE.MathUtils.clamp((d - 0.15) * 4, 0, 1));
      b.spike.material.color.copy(b.color); b.head.material.color.copy(b.color); b.base.material.color.copy(b.color); b.pulse.material.color.copy(b.color);
      const rate = b.state === 'critical' ? 1.6 : b.state === 'warning' || b.state === 'signal' ? 1 : 0.45;
      b.pulseT = (b.pulseT + dt * rate) % 1;
      const grow = b.state === 'critical' ? 5 : b.state === 'idle' ? 2.2 : 3.5;
      b.pulse.scale.setScalar(1 + b.pulseT * grow); b.pulse.material.opacity = (1 - b.pulseT) * (b.state === 'idle' ? 0.35 : 0.9);
      const flick = b.state === 'signal' ? 0.6 + 0.4 * Math.sin(t * 18) : 1, base = b.site.hub ? 0.055 : 0.03;
      b.head.scale.setScalar(base * (b.state === 'critical' ? 1.4 + 0.25 * Math.sin(t * 10) : 1) * flick);
      if (b.shield.visible) b.shield.rotation.y += dt * 0.6;
    });
    for (let i = this.flashes.length - 1; i >= 0; i--) {
      const f = this.flashes[i]; f.t += dt; const k = f.t / 1.4;
      f.sprite.scale.setScalar(0.02 + k * 0.12); f.sprite.material.opacity = Math.max(0, 1 - k);
      if (k >= 1) { this.globe.remove(f.sprite); f.sprite.material.dispose(); this.flashes.splice(i, 1); }
    }
    if (this.view === 'local') {
      this.facility.update(dt);
      if (!this.localTween?.isActive()) this.localControls.update();
      this.facility.raycaster.setFromCamera(this.pointer, this.localCam); this.facility.hover(this.facility.raycaster);
      this.composer.render(); this.localLabels.render(this.facility.scene, this.localCam);
    } else {
      if (this.idleSpin && !this.camTween?.isActive()) { const c = toLatLon(this.camera.position); latLon(c.lat, c.lon + dt * 3, c.r, this.camera.position); this.camera.lookAt(0, 0, 0); }
      if (!this.camTween?.isActive()) this.controls.update();
      this.pick(); this.composer.render(); this.labels.render(this.scene, this.camera);
    }
  }
}
