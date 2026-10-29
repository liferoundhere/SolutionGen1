// MetLife x Cisco Cloud Control, AgenticOps 4D: one 3D world per scene.
// Contract (see references/stage-engine.md):
//   { id, bg, bgSteps?, cams: [{ p, t }...one per step], build() -> { group, update(dt, t, step), reset?, leave? } }
// Every dollar figure drawn here is a modeled estimate from the original example and says so.
import * as THREE from 'three';
import {
  C, damp, smooth, clamp01, rr, glowSprite, label, canvasPanel, roundRect, wireBox,
  gridFloor, points, setOpacity, emissiveMat, edgeLines, person, drawTube, arc,
} from './core.js';
import { BLOCKS, LENSES, MISSIONS, MINOR_SITES } from './content.js';
import { bridgeBars } from './kit.js';
import { LAND } from './land.js';

// Decode the land mask once into lat/lon cell centers.
const LAND_CELLS = (() => {
  const raw = atob(LAND.bits), out = [];
  for (let i = 0; i < LAND.w * LAND.h; i++) if (raw.charCodeAt(i >> 3) & (1 << (i & 7))) out.push([90 - (Math.floor(i / LAND.w) + 0.5) * 180 / LAND.h, -180 + ((i % LAND.w) + 0.5) * 360 / LAND.w]);
  return out;
})();

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const col = (h) => new THREE.Color(h).getHex();
const isMobile = () => innerWidth <= 900;
const money = (v) => `$${v.toFixed(1)}M`;
const FONT = '"CiscoSansTT", Inter, "Segoe UI", Helvetica, Arial, sans-serif';
const MONO = '"JetBrains Mono", Menlo, Consolas, monospace';

// Shared state the workshop form writes into (main.js owns the DOM). Unused in this deck.
export const workshopState = { filled: new Array(8).fill(0), timer: 0 };

// ---------------------------------------------------------------------------
// Canvas helpers for the 3D glass panels (drawn on the OVERLAY layer, so they stay crisp).
function wrapText(g, text, x, y, maxW, lh, maxLines = 3) {
  const words = String(text).split(/\s+/);
  let line = '', n = 0;
  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i];
    if (g.measureText(test).width > maxW && line) {
      if (n === maxLines - 1) {
        let l = line;
        while (g.measureText(`${l}...`).width > maxW && l.length) l = l.slice(0, -1);
        g.fillText(`${l}...`, x, y + n * lh);
        return n + 1;
      }
      g.fillText(line, x, y + n * lh); n++; line = words[i];
    } else line = test;
  }
  if (line) { g.fillText(line, x, y + n * lh); n++; }
  return n;
}
function cardBg(g, w, h, color, alpha = 0.92, bar = true) {
  g.fillStyle = `rgba(4,10,26,${alpha})`;
  roundRect(g, 6, 6, w - 12, h - 12, Math.min(40, h * 0.08)); g.fill();
  g.strokeStyle = color; g.lineWidth = 5; g.stroke();
  if (bar) { g.fillStyle = color; g.fillRect(6, h * 0.14, 12, h * 0.72); }
}
const font = (g, wt, px, mono = false) => { g.font = `${wt} ${Math.round(px)}px ${mono ? MONO : FONT}`; };
const pill = (text, color = '#00bceb', size = 0.5) => label(text, { size, color: '#ffffff', bg: 'rgba(3,10,22,0.82)', border: color });

// Damp an object toward a pose [x, y, z, scale]. Meshes and groups only (not sprites).
function poseTo(o, p, dt, l = 4) {
  o.position.x = damp(o.position.x, p[0], l, dt);
  o.position.y = damp(o.position.y, p[1], l, dt);
  o.position.z = damp(o.position.z, p[2], l, dt);
  const s = damp(o.scale.x, p[3], l, dt);
  o.scale.setScalar(Math.max(0.001, s));
}
function snapTo(o, p) { o.position.set(p[0], p[1], p[2]); o.scale.setScalar(Math.max(0.001, p[3])); }
// Lat/lon to a point on a sphere of radius r (three-globe convention).
function ll(lat, lon, r) {
  const phi = (90 - lat) * Math.PI / 180, th = (lon + 180) * Math.PI / 180;
  return V(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
}
const faceLon = (lon) => (-90 - lon) * Math.PI / 180;
// Great circle arc between two lat/lon points, lifted off the surface.
function globeArc(a, b, r, lift = 0.22) {
  const va = ll(a[0], a[1], 1), vb = ll(b[0], b[1], 1);
  const pts = [];
  const ang = va.angleTo(vb);
  for (let i = 0; i <= 40; i++) {
    const u = i / 40;
    const s = Math.sin(ang) || 1;
    const p = va.clone().multiplyScalar(Math.sin((1 - u) * ang) / s).add(vb.clone().multiplyScalar(Math.sin(u * ang) / s));
    pts.push(p.normalize().multiplyScalar(r * (1 + lift * Math.sin(Math.PI * u) * Math.min(1, ang))));
  }
  return new THREE.CatmullRomCurve3(pts);
}

// Label nudges (east, north) so the close-together U.S. east coast pins do not collide.
const LABEL_NUDGE = { enrollment: [1.9, 0.9], mim: [-2.4, 0.7], change: [2.0, -0.1], hurricane: [1.2, -0.9], xcelerator: [-1.4, -0.5], resilience: [-1.2, 0.8], ransomware: [1.2, 0.2], voice: [1.0, -0.3], japan: [1.1, 0.4], pensions: [0.6, -0.6] };

// A dotted, gridded globe with mission pins. Returns the group and its pin records.
function makeGlobe(r, { pins = true, minor = true, labels = true } = {}) {
  const g = new THREE.Group();
  const spin = new THREE.Group(); g.add(spin);
  const core = new THREE.Mesh(new THREE.SphereGeometry(r, 64, 48), new THREE.MeshBasicMaterial({ color: 0x041530, transparent: true, opacity: 0.94 }));
  spin.add(core);
  const grat = [];
  for (let lat = -60; lat <= 60; lat += 30) for (let lon = 0; lon < 360; lon += 4) { grat.push(ll(lat, lon, r * 1.002), ll(lat, lon + 4, r * 1.002)); }
  for (let lon = 0; lon < 360; lon += 30) for (let lat = -84; lat < 84; lat += 4) { grat.push(ll(lat, lon, r * 1.002), ll(lat + 4, lon, r * 1.002)); }
  const gl = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(grat), new THREE.LineBasicMaterial({ color: C.sky, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false }));
  spin.add(gl);
  // Continents as dots, from the land mask (one dot per 1.5 degree land cell, lightly jittered).
  const dots = points(LAND_CELLS.length, (i) => { const [la, lo] = LAND_CELLS[i]; const v = ll(la + rr(-0.5, 0.5), lo + rr(-0.5, 0.5), r * 1.005); return [v.x, v.y, v.z]; }, { size: Math.max(0.07, r * 0.016), color: C.ice, opacity: 0.8 });
  spin.add(dots);
  const halo = glowSprite(C.sky, r * 3.6, 0.32); halo.position.z = -r * 0.4; g.add(halo);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r * 1.02, 0.04, 8, 160), new THREE.MeshBasicMaterial({ color: C.sky, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending }));
  g.add(rim);
  const pinList = [];
  if (pins) MISSIONS.forEach((m) => {
    const n = ll(m.lat, m.lon, 1);
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1, 6), emissiveMat(C.green, 1.6));
    stalk.position.copy(n.clone().multiplyScalar(r + 0.45));
    stalk.quaternion.setFromUnitVectors(V(0, 1, 0), n);
    stalk.scale.y = 0.9;
    const head = glowSprite(C.green, 0.9, 0.95); head.position.copy(n.clone().multiplyScalar(r + 0.95));
    spin.add(stalk, head);
    let lb = null;
    if (labels) {
      lb = pill(`${m.code} ${m.city}`, '#6cc04a', 0.34);
      const east = V(0, 1, 0).cross(n).normalize(), north = n.clone().cross(east);
      const [dx, dy] = LABEL_NUDGE[m.id] || [0, 0];
      lb.position.copy(n.clone().multiplyScalar(r + 1.3)).addScaledVector(east, dx).addScaledVector(north, dy);
      spin.add(lb);
    }
    pinList.push({ m, n, stalk, head, lb });
  });
  if (minor) MINOR_SITES.forEach(([, lat, lon]) => {
    const d = glowSprite(C.ice, 0.42, 0.75); d.position.copy(ll(lat, lon, r * 1.01)); spin.add(d);
  });
  return { group: g, spin, pins: pinList, r, halo, rim };
}
// Fade globe pin labels on the far side. Uses the spin group's world matrix.
const _n = new THREE.Vector3(), _q = new THREE.Quaternion();
function fadePinLabels(globe, base = 1) {
  const q = globe.spin.getWorldQuaternion(_q);
  globe.pins.forEach((p) => {
    _n.copy(p.n).applyQuaternion(q);
    const f = smooth((_n.z - 0.05) / 0.35) * base;
    if (p.lb) setOpacity(p.lb, f);
    p.head.material.opacity = 0.25 + 0.7 * smooth((_n.z + 0.2) / 0.4);
  });
}

// ---------------------------------------------------------------------------
// 00 Hero: the Cisco bridge bars rise above the limb of a dotted planet.
export const title = {
  id: 'title',
  bg: { a: '#01040b', b: '#062a4d', c: '#00bceb', mix: [1, 0.6, 0, 0.5] },
  cams: [{ p: [0, 7, 30], t: [0, 6.2, 0] }],
  build() {
    const group = new THREE.Group();
    const planet = makeGlobe(46, { pins: false, minor: false, labels: false });
    planet.group.position.set(0, -44.5, -26);
    planet.halo.scale.setScalar(150); planet.halo.material.opacity = 0.28;
    planet.rim.visible = false;
    group.add(planet.group);
    const lift = new THREE.Group(); lift.position.set(0, 5.2, 0); group.add(lift);
    const bars = bridgeBars({ spacing: 2.0, unit: 2.2, radius: 0.4 });
    lift.add(bars);
    const rings = [];
    for (let i = 0; i < 3; i++) {
      const r = new THREE.Mesh(new THREE.TorusGeometry(12 + i * 4.2, 0.03, 8, 200), new THREE.MeshBasicMaterial({ color: i === 1 ? C.green : C.sky, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending }));
      r.rotation.x = Math.PI / 2 + 0.16 * (i - 1); r.position.y = 8; group.add(r); rings.push(r);
    }
    // Ten mission sparks orbiting: ten missions, one vantage point.
    const sparks = MISSIONS.map((m, i) => { const s = glowSprite(i % 3 ? C.sky : C.green, 1.1, 0.9); group.add(s); return s; });
    const tag = pill('MetLife  x  Cisco Cloud Control', '#00bceb', 0.62); tag.position.set(0, 15.6, 0); group.add(tag);
    let k = 0;
    return {
      group,
      update(dt, t) {
        k = damp(k, 1, 1.4, dt);
        bars.userData.setHeights(smooth(k), t);
        planet.spin.rotation.y = t * 0.02;
        rings.forEach((r, i) => { r.rotation.z = t * (0.05 + i * 0.03) * (i % 2 ? -1 : 1); });
        sparks.forEach((s, i) => { const a = t * 0.18 + (i / 10) * Math.PI * 2; s.position.set(Math.cos(a) * 16, 8 + Math.sin(a * 2) * 1.2, Math.sin(a) * 16 * 0.32 - 2); });
        setOpacity(tag, smooth(k * 1.4 - 0.3));
      },
      reset() { k = 0; },
    };
  },
};

// ---------------------------------------------------------------------------
// 01 Globe: ten mission pins at real MetLife locations. Each click turns the planet and
// adds a layer: New Frontier commitments, the Data Fabric arcs, the Cloud Control ring.
export const globe = {
  id: 'globe',
  bg: { a: '#020812', b: '#0a3048', c: '#9be7ff', mix: [0.7, 0.3, 0, 1] },
  bgSteps: [null, { a: '#060510', b: '#1f1a3a', c: '#ffd95a', mix: [0.8, 0.4, 0, 0.9] }, { a: '#02070f', b: '#0a2a3a', c: '#2de2c5', mix: [0.6, 0.6, 0.5, 0.8] }, { a: '#030312', b: '#0e1c48', c: '#00bceb', mix: [1, 0.4, 0.2, 0.9] }],
  cams: [{ p: [2, 7.5, 27], t: [7.4, 6.4, 0] }, { p: [4, 8.5, 26], t: [7.4, 6.6, 0] }, { p: [1, 6.5, 26], t: [7.4, 6.2, 0] }, { p: [0, 10, 31], t: [7.4, 7.6, 0] }],
  build() {
    const group = new THREE.Group();
    const world = new THREE.Group(); group.add(world);
    const G = makeGlobe(5.4);
    world.add(G.group);
    const R = G.r;
    const LONS = [-62, 18, 100, -35];
    // Data Fabric arcs: every mission site to the North Greenbush data center.
    const hub = [42.687, -73.68];
    const arcs = MISSIONS.map((m, i) => {
      const tube = drawTube(globeArc(hub, [m.lat, m.lon], R * 1.01, 0.3), { radius: 0.035, color: i % 2 ? C.teal : C.sky, seg: 120, opacity: 0.95 });
      G.spin.add(tube); return tube;
    });
    const hubGlow = glowSprite(C.teal, 1.6, 0); hubGlow.position.copy(ll(hub[0], hub[1], R * 1.02)); G.spin.add(hubGlow);
    // New Frontier commitments orbit at step 1.
    const nf = new THREE.Group(); world.add(nf);
    const nfLabels = ['Double-digit earnings growth', '15 to 17% ROE', '100 bps lower expense ratio', '$25B+ free cash flow'].map((s, i) => {
      const lb = pill(s, '#ffd95a', 0.44); nf.add(lb); lb.userData.a = (i / 4) * Math.PI * 2 + 0.4; return lb;
    });
    const nfRing = new THREE.Mesh(new THREE.TorusGeometry(R + 2.6, 0.03, 6, 180), new THREE.MeshBasicMaterial({ color: C.gold, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending }));
    nfRing.rotation.x = Math.PI / 2 - 0.25; nf.add(nfRing);
    // Data Fabric domains orbit at step 2.
    const df = new THREE.Group(); world.add(df);
    const dfLabels = ['Network', 'Internet and cloud', 'Applications', 'Identity and security', 'Business events', 'External signals'].map((s, i) => {
      const lb = pill(s, '#2de2c5', 0.4); df.add(lb); lb.userData.a = (i / 6) * Math.PI * 2; return lb;
    });
    const dfTag = pill('Cisco Data Fabric · powered by Splunk', '#2de2c5', 0.5); dfTag.position.set(0, -R - 1.6, 1); df.add(dfTag);
    // Cloud Control vantage ring at step 3.
    const vp = new THREE.Group(); vp.position.y = R + 2.8; world.add(vp);
    const vring = new THREE.Mesh(new THREE.TorusGeometry(R * 1.15, 0.07, 8, 200), emissiveMat(C.sky, 1.8));
    vring.rotation.x = Math.PI / 2; vp.add(vring);
    const agents = [];
    for (let i = 0; i < 24; i++) { const a = glowSprite(i % 4 ? C.sky : C.green, 0.55, 0.9); vp.add(a); agents.push(a); }
    const cone = new THREE.Mesh(new THREE.ConeGeometry(R * 1.15, R + 2.8, 48, 1, true), new THREE.MeshBasicMaterial({ color: C.sky, transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
    cone.rotation.x = Math.PI; cone.position.y = -(R + 2.8) / 2; vp.add(cone);
    const vtag = pill('Cisco Cloud Control · AgenticOps', '#00bceb', 0.55); vtag.position.set(0, 1.4, 0); vp.add(vtag);
    let ry = faceLon(LONS[0]), nk = 0, ak = 0, vk = 0, intro = 0;
    G.spin.rotation.y = ry;
    return {
      group,
      update(dt, t, step) {
        const M = isMobile();
        poseTo(world, M ? [6.6, 9.8, -2, 0.62] : [8.6, 6.2, -2, 1], dt, 3);
        intro = damp(intro, 1, 1.5, dt);
        ry = damp(ry, faceLon(LONS[Math.min(step, 3)]), 1.6, dt);
        G.spin.rotation.y = ry + Math.sin(t * 0.25) * 0.04;
        G.spin.rotation.x = 0.28;
        G.pins.forEach((p, i) => { p.stalk.scale.y = Math.max(0.01, smooth(intro * 1.6 - i * 0.05)) * 0.9; });
        fadePinLabels(G, step === 0 ? 1 : 0.5);
        nk = damp(nk, step === 1 ? 1 : 0, 3, dt);
        ak = damp(ak, step >= 2 ? 1 : 0, 1.4, dt);
        vk = damp(vk, step >= 3 ? 1 : 0, 2, dt);
        nfLabels.forEach((lb) => { const a = lb.userData.a + t * 0.12; lb.position.set(Math.cos(a) * (R + 2.6), Math.sin(a) * 0.25 * (R + 2.6) * 0.95, Math.sin(a) * (R + 2.6) * 0.97); setOpacity(lb, nk * (0.35 + 0.65 * smooth((Math.sin(a) + 0.3) / 0.6))); });
        setOpacity(nfRing, nk);
        arcs.forEach((a, i) => a.userData.setProgress(clamp01(ak * 1.5 - i * 0.05)));
        hubGlow.material.opacity = ak * 0.9;
        const dk = ak * (1 - vk);
        dfLabels.forEach((lb) => { const a = lb.userData.a - t * 0.1; lb.position.set(Math.cos(a) * (R + 3.3), Math.sin(a * 2) * 0.6 + Math.sin(a) * 1.4, Math.sin(a) * (R + 2.2)); setOpacity(lb, dk * (0.3 + 0.7 * smooth((Math.sin(a) + 0.2) / 0.5))); });
        setOpacity(dfTag, dk);
        vp.scale.setScalar(Math.max(0.001, smooth(vk)));
        vp.visible = vk > 0.01;
        vring.rotation.z = t * 0.3;
        agents.forEach((a, i) => { const an = (i / 24) * Math.PI * 2 + t * 0.4; a.position.set(Math.cos(an) * R * 1.15, Math.sin(t * 2 + i) * 0.1, Math.sin(an) * R * 1.15); });
      },
      reset() { intro = 0; },
    };
  },
};

// ---------------------------------------------------------------------------
// Mission scenes: step 0 the signal (problem sky), step 1 the decision point (two choice
// panels), step 2 the outcome (KPI panel, healed diorama, the running modeled counter grows).
const MISSION_ORDER = ['enrollment', 'change', 'hurricane', 'resilience', 'ransomware', 'mim'];
const MV = Object.fromEntries(MISSIONS.map((m) => [m.id, m]));
const prevTotal = (id) => MISSION_ORDER.slice(0, MISSION_ORDER.indexOf(id)).reduce((a, k) => a + MV[k].value, 0);
const MCAMS = [{ p: [0, 7.5, 27], t: [5, 5.5, 0] }, { p: [4, 6.6, 25], t: [6.6, 5.5, 0] }, { p: [-1, 9, 28], t: [5, 6, 0] }];

function signalPanel(cfg) {
  return canvasPanel(7, 3.9, (g, w, h) => {
    cardBg(g, w, h, '#fbab18');
    font(g, 700, h * 0.07, true); g.fillStyle = '#fbab18'; g.fillText(`SIGNAL · ${cfg.detect}`, 48, h * 0.15);
    font(g, 800, h * 0.096); g.fillStyle = '#ffffff'; wrapText(g, cfg.signalTitle, 48, h * 0.29, w - 96, h * 0.105, 2);
    font(g, 500, h * 0.066);
    cfg.signals.forEach((s, i) => { g.fillStyle = '#fbab18'; g.fillRect(50, h * (0.545 + i * 0.112) - h * 0.02, 13, 13); g.fillStyle = 'rgba(226,236,248,0.95)'; g.fillText(s, 78, h * (0.545 + i * 0.112)); });
    font(g, 500, h * 0.052, true); g.fillStyle = 'rgba(155,231,255,0.8)'; g.fillText(cfg.agent, 48, h * 0.92);
  }, 256);
}
function choicePanel(ch, tag) {
  return canvasPanel(7.4, 4, (g, w, h, state = 'neutral') => {
    const c = state === 'best' ? '#6cc04a' : state === 'other' ? '#5a6b80' : '#9be7ff';
    cardBg(g, w, h, c, 0.94);
    font(g, 700, h * 0.065, true); g.fillStyle = c; g.fillText(state === 'best' ? `${tag} · BEST CALL` : `OPTION ${tag}`, 48, h * 0.16);
    font(g, 800, h * 0.092); g.fillStyle = state === 'other' ? 'rgba(255,255,255,0.55)' : '#ffffff';
    const n = wrapText(g, ch.label, 48, h * 0.33, w - 96, h * 0.105, 2);
    font(g, 500, h * 0.06); g.fillStyle = 'rgba(214,228,245,0.85)';
    wrapText(g, ch.detail, 48, h * (0.36 + n * 0.105), w - 96, h * 0.075, 3);
    font(g, 600, h * 0.052, true); g.fillStyle = 'rgba(155,231,255,0.7)';
    g.fillText(ch.kind, 48, h * 0.9);
  }, 256);
}
function kpiPanel(cfg) {
  return canvasPanel(7, 3.9, (g, w, h) => {
    cardBg(g, w, h, '#6cc04a');
    font(g, 700, h * 0.065, true); g.fillStyle = '#6cc04a'; g.fillText('OUTCOME · MODELED', 48, h * 0.15);
    cfg.kpis.forEach(([lab, before, after], i) => {
      const y = h * (0.32 + i * 0.165);
      font(g, 500, h * 0.06); g.fillStyle = 'rgba(214,228,245,0.88)'; g.fillText(lab, 48, y);
      font(g, 700, h * 0.074); g.fillStyle = '#ff5a4f';
      const bw = g.measureText(before).width;
      g.fillText(before, 48, y + h * 0.075);
      g.fillRect(48, y + h * 0.075 - h * 0.022, bw, 4);
      g.fillStyle = '#9fb3c8'; g.fillText('  to  ', 48 + bw, y + h * 0.075);
      const tw = g.measureText('  to  ').width;
      g.fillStyle = '#6cc04a'; g.fillText(after, 48 + bw + tw, y + h * 0.075);
    });
    font(g, 800, h * 0.075); g.fillStyle = '#ffffff'; g.fillText(`${money(cfg.value)} protected`, 48, h * 0.9);
    const ww = g.measureText(`${money(cfg.value)} protected`).width;
    font(g, 600, h * 0.05, true); g.fillStyle = 'rgba(155,231,255,0.8)'; g.fillText(' (modeled estimate)', 52 + ww, h * 0.9);
  }, 256);
}
function counterPanel() {
  return canvasPanel(6.4, 2.3, (g, w, h, v = 0, n = 0, glow = 0) => {
    cardBg(g, w, h, glow > 0.5 ? '#6cc04a' : '#00bceb', 0.9, false);
    font(g, 700, h * 0.1, true); g.fillStyle = '#9be7ff'; g.fillText('MODELED VALUE PROTECTED', 40, h * 0.24);
    font(g, 800, h * 0.36); g.fillStyle = glow > 0.5 ? '#6cc04a' : '#ffffff'; g.fillText(money(v), 40, h * 0.63);
    font(g, 600, h * 0.1); g.fillStyle = 'rgba(214,228,245,0.85)';
    g.fillText(`${n} of 6 missions · modeled estimate`, 40, h * 0.86);
  }, 200);
}

function mission(cfg) {
  const m = MV[cfg.id];
  const prev = prevTotal(cfg.id);
  const idx = MISSION_ORDER.indexOf(cfg.id) + 1;
  return {
    id: cfg.id,
    bg: cfg.bg,
    bgSteps: cfg.bgSteps,
    cams: cfg.cams || MCAMS,
    build() {
      const group = new THREE.Group();
      group.add(gridFloor(160, 80, col(cfg.floor || '#00bceb'), 0.1));
      const root = new THREE.Group(); group.add(root);
      const dio = cfg.diorama(root);
      const tag = pill(`${m.code} · ${m.city}`, cfg.tagColor || '#00bceb', 0.46);
      tag.position.set(...(cfg.tagPos || [3.4, 10.8, 0])); group.add(tag);
      const sig = signalPanel(cfg); group.add(sig);
      const chs = cfg.choices.map((ch, i) => { const p = choicePanel(ch, i ? 'B' : 'A'); group.add(p); return p; });
      const bestI = cfg.choices.findIndex((c) => c.best);
      const kpi = kpiPanel({ ...cfg, value: m.value }); group.add(kpi);
      const ctr = counterPanel(); group.add(ctr);
      const chosen = glowSprite(C.green, 4, 0); group.add(chosen);
      const D = {
        sig: [[12.7, 6.4, 1, 1.18], [12.8, 6.4, -3, 0.8], [12.8, 6.4, -3, 0.8]],
        ch: [[[4.4, 4.4, 0, 0.6], [12, 4.4, 0, 0.6]], [[4.3, 5.6, 4, 1], [12, 5.6, 4, 1]], [[3.4, 11.4, 0, 0.55], [12, 1.5, 2, 0.6]]],
        kpi: [[12.8, 5, -2, 0.8], [12.8, 5, -2, 0.8], [12.7, 6.2, 1, 1.18]],
        ctr: [[13.1, 12.5, -1, 1.12], [13.1, 12.5, -1, 1.12], [13.1, 12.5, -1, 1.12]],
        root: [cfg.dpos || [2.5, 0, -1], 1],
      };
      const Mo = {
        sig: [[5, 9.2, 2, 1.2], [5, 9.2, -2, 0.7], [5, 9.2, -2, 0.7]],
        ch: [[[6.6, 11.2, 0, 0.6], [6.6, 7, 0, 0.6]], [[6.6, 11.3, 2, 1], [6.6, 7.1, 2, 1]], [[5, 16, 0, 0.3], [5, 4, 0, 0.5]]],
        kpi: [[5, 8, -2, 0.7], [5, 8, -2, 0.7], [5, 9.2, 2, 1.2]],
        ctr: [[5, 13.9, 0, 0.82], [5, 13.9, 0, 0.82], [5, 13.9, 0, 0.82]],
        root: [[5, 2.2, -5], 0.72],
      };
      // Which panels show at each step.
      const OP = { sig: [1, 0, 0], ch: [[0, 0], [1, 1], [1, 0]], kpi: [0, 0, 1], ctr: [1, 1, 1] };
      const op = { sig: 0, ch: [0, 0], kpi: 0, ctr: 0, tag: 1 };
      let a = 1, f = 0, vshow = prev, lastStr = '', chState = '';
      function layout(dt, step, snap = false) {
        const L = isMobile() ? Mo : D;
        const go = snap ? snapTo : (o, p) => poseTo(o, p, dt, 3.5);
        go(sig, L.sig[step]); go(kpi, L.kpi[step]); go(ctr, L.ctr[step]);
        // Steps 0 and 1: panel A left, B right. Step 2: the best call rises to the tag, the other drops.
        chs.forEach((p, i) => go(p, step === 2 ? L.ch[2][i === bestI ? 0 : 1] : L.ch[step][i]));
        const rp = L.root;
        root.position.set(rp[0][0], rp[0][1], rp[0][2]); root.scale.setScalar(rp[1]);
      }
      return {
        group,
        update(dt, t, step) {
          const M = isMobile();
          layout(dt, step);
          a = damp(a, step === 0 ? 1 : step === 1 ? 0.55 : 0, 2.5, dt);
          f = damp(f, step >= 2 ? 1 : 0, 2, dt);
          dio.update(dt, t, step, a, f);
          op.sig = damp(op.sig, OP.sig[step], 4, dt); setOpacity(sig, op.sig);
          op.kpi = damp(op.kpi, OP.kpi[step], 4, dt); setOpacity(kpi, op.kpi);
          const ctrOn = M && step === 1 ? 0 : OP.ctr[step];
          op.ctr = damp(op.ctr, ctrOn, 4, dt); setOpacity(ctr, op.ctr);
          chs.forEach((p, i) => {
            const want = step === 2 ? (i === bestI ? (M ? 0 : 1) : 0) : OP.ch[step][i];
            op.ch[i] = damp(op.ch[i], want, 4, dt); setOpacity(p, op.ch[i]);
          });
          const st = step === 2 ? 'done' : 'neutral';
          if (st !== chState) { chState = st; chs.forEach((p, i) => p.userData.redraw(st === 'done' ? (i === bestI ? 'best' : 'other') : 'neutral')); }
          const best = chs[bestI];
          chosen.position.set(best.position.x, best.position.y, best.position.z - 0.1);
          chosen.material.opacity = f * 0.5 * op.ch[bestI];
          // Count toward the target at a steady pace, so the total always lands exactly.
          const tgt = step >= 2 ? prev + m.value : prev, dv = tgt - vshow;
          vshow += Math.sign(dv) * Math.min(Math.abs(dv), Math.max(Math.abs(dv) * 3, 9) * dt);
          const shown = vshow;
          const str = `${shown.toFixed(1)}|${step >= 2 ? 1 : 0}`;
          if (str !== lastStr) { lastStr = str; ctr.userData.redraw(shown, step >= 2 ? idx : idx - 1, step >= 2 ? 1 : 0); }
          op.tag = damp(op.tag, M || step === 2 ? 0 : 1, 4, dt); setOpacity(tag, op.tag);
        },
        reset() { a = 1; f = 0; vshow = prev; layout(0, 0, true); },
      };
    },
  };
}

// Shared colors for alarm and fix states.
const RED = new THREE.Color(C.red), AMB = new THREE.Color(C.amber), GRN = new THREE.Color(C.green), SKY = new THREE.Color(C.sky);
const mixState = (out, a, f, warn = RED) => out.copy(SKY).lerp(warn, clamp01(a)).lerp(GRN, clamp01(f));

// 02 M-01 New York: the enrollment portal tower, a queue of employees, a WAN arc to the data center.
export const enrollment = mission({
  id: 'enrollment', detect: 'T-48h', agent: 'Capacity Agent · Splunk Observability · ThousandEyes',
  signalTitle: 'SLO breach forecast at the opening bell',
  signals: ['Synthetic login p95 up 38% under rehearsal', 'Auth token service is the shared bottleneck', 'WAN egress at North Greenbush near limit'],
  choices: [
    { label: 'Approve the agent plan in AI Canvas', detail: 'Policy-checked scaling and traffic shift, verified by synthetic tests.', kind: 'Governed agent · human approval', best: true },
    { label: 'Open a ticket for the capacity team', detail: 'Route it through the normal change queue for next week.', kind: 'Traditional path' },
  ],
  kpis: [['Login p95 at peak', '9.1 s', '1.2 s'], ['Enrollment completion rate', '71%', '98%'], ['Employer escalations', '40+', 'None']],
  floor: '#fbab18', tagColor: '#fbab18',
  bg: { a: '#0a0602', b: '#3a2208', c: '#fbab18', mix: [0.5, 1, 0.2, 0.3] },
  bgSteps: [null, { a: '#05040f', b: '#1d1840', c: '#8e7cff', mix: [0.9, 0.5, 0, 0.5] }, { a: '#020a08', b: '#0a3024', c: '#6cc04a', mix: [1, 0.6, 0, 0.5] }],
  diorama(root) {
    const d = new THREE.Group(); root.add(d);
    const floors = [];
    for (let i = 0; i < 8; i++) { const fl = wireBox(3.2, 0.95, 3.2, C.sky, 0.07, 0.75); fl.position.set(0, 0.55 + i * 1.05, 0); d.add(fl); floors.push(fl); }
    const roof = glowSprite(C.sky, 5, 0.5); roof.position.set(0, 9, 0); d.add(roof);
    const gate = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.09, 8, 80), new THREE.MeshBasicMaterial({ color: C.red, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending }));
    gate.rotation.x = Math.PI / 2; gate.position.y = 0.2; d.add(gate);
    const gateLb = pill('Auth token service', '#fbab18', 0.36); gateLb.position.set(-3.6, 1.6, 2.2); d.add(gateLb);
    const towerLb = pill('Enrollment portal', '#9be7ff', 0.4); towerLb.position.set(0, 9.8, 0); d.add(towerLb);
    const N = 360;
    const crowd = points(N, () => [0, 0, 0], { size: 0.22, color: C.ice, opacity: 0.85 });
    d.add(crowd);
    const seeds = Array.from({ length: N }, () => [Math.random(), Math.random() < 0.5 ? -1 : 1, rr(-0.8, 0.8)]);
    const dc = wireBox(1.3, 2.4, 1.3, C.teal, 0.1, 0.9); dc.position.set(7.4, 1.2, -3.5); d.add(dc);
    const dcLb = pill('North Greenbush DC', '#2de2c5', 0.34); dcLb.position.set(7.4, 3.3, -3.5); d.add(dcLb);
    const wan = drawTube(arc(V(7.4, 2.4, -3.5), V(0, 6, 0), 4), { radius: 0.06, color: C.amber, opacity: 0.9 }); wan.userData.setProgress(1); d.add(wan);
    const pulse = glowSprite(C.amber, 1.2, 0.9); d.add(pulse);
    const sec = new THREE.Group(); sec.position.set(-5.4, 0, -3.5); d.add(sec);
    for (let i = 0; i < 5; i++) { const fl = wireBox(2.2, 0.9, 2.2, C.green, 0.08, 0.85); fl.position.y = 0.5 + i * 1.0; sec.add(fl); }
    const secLb = pill('Secondary region · 30%', '#6cc04a', 0.34); secLb.position.set(0, 6.2, 0); sec.add(secLb);
    const shift = drawTube(arc(V(-1.6, 4, 0), V(-5.4, 4.4, -3.5), 2.5), { radius: 0.06, color: C.green }); d.add(shift);
    const ring = new THREE.Color(), wc = new THREE.Color();
    const curveW = arc(V(7.4, 2.4, -3.5), V(0, 6, 0), 4);
    const pos = crowd.geometry.attributes.position.array;
    return {
      update(dt, t, step, a, f) {
        mixState(ring, a, f); gate.material.color.copy(ring);
        gate.scale.setScalar(1 + Math.sin(t * 6) * 0.04 * a);
        wc.copy(AMB).lerp(GRN, f); wan.material.color.copy(wc); pulse.material.color.copy(wc);
        curveW.getPoint((t * (0.25 + f * 0.5)) % 1, pulse.position);
        floors.forEach((fl, i) => setOpacity(fl, 0.55 + 0.45 * (f > 0.5 ? 1 : Math.abs(Math.sin(t * 2 + i)) * (1 - a * 0.5))));
        const speed = 0.05 + f * 0.22;
        for (let i = 0; i < N; i++) {
          const s = seeds[i];
          let u = (s[0] + t * speed) % 1;
          u = u * (1 - a * 0.55) + a * 0.55 * Math.pow(u, 0.25);
          const x = s[1] * (10 - u * 7.2), z = 3.2 - u * 3 + s[2];
          pos[i * 3] = x; pos[i * 3 + 1] = 0.3 + (1 - u) * 0.1; pos[i * 3 + 2] = z;
        }
        crowd.geometry.attributes.position.needsUpdate = true;
        setOpacity(sec, f); shift.userData.setProgress(f);
        roof.material.color.copy(ring);
      },
    };
  },
});

// 03 M-02 Cary: a spine and leaf fabric, one drifted leaf, 41 applications in the blast radius,
// and a digital twin that verifies the corrected change.
export const change = mission({
  id: 'change', detect: 'T-20h', agent: 'Change Agent · Nexus Dashboard · Isovalent flows',
  signalTitle: 'Saturday change rated risk 92',
  signals: ['New ACL collides with drift on one leaf', 'Would block policy cluster DB replication', 'Blast radius: 41 applications'],
  choices: [
    { label: 'Proceed as approved', detail: 'The change board already signed off.', kind: 'Traditional path' },
    { label: 'Accept the agent-corrected change', detail: 'Fix the drift, revise the ACL, verify in the digital twin.', kind: 'Governed agent · human approval', best: true },
  ],
  kpis: [['Core platform downtime', '4.5 hours', '0 minutes'], ['Engineer hours on recovery', '220', '6 (review)'], ['Change risk score', 'Unknown', '92 to 11']],
  floor: '#8e7cff', tagColor: '#e2231a',
  bg: { a: '#0a0306', b: '#3a0a14', c: '#e2231a', mix: [0.3, 0.9, 0.5, 0.3] },
  bgSteps: [null, { a: '#02060f', b: '#0c2240', c: '#9be7ff', mix: [0.6, 0.8, 0, 0.5] }, { a: '#04030f', b: '#1a1446', c: '#8e7cff', mix: [1, 0.5, 0, 0.6] }],
  diorama(root) {
    const d = new THREE.Group(); root.add(d);
    const fab = new THREE.Group(); d.add(fab);
    const spines = [-2.6, 2.6].map((x) => { const b = wireBox(2.6, 0.7, 1.2, C.violet, 0.14, 0.95); b.position.set(x, 7.2, 0); fab.add(b); return b; });
    const leaves = [];
    for (let i = 0; i < 6; i++) { const b = wireBox(1.5, 0.55, 1.1, C.sky, 0.12, 0.95); b.position.set(-6 + i * 2.4, 4.2, 0); fab.add(b); leaves.push(b); }
    const lp = [];
    spines.forEach((s) => leaves.forEach((l) => lp.push(s.position.clone().add(V(0, -0.35, 0)), l.position.clone().add(V(0, 0.28, 0)))));
    const links = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(lp), new THREE.LineBasicMaterial({ color: C.ice, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending }));
    fab.add(links);
    // The digital twin is a ghost copy of the clean fabric, cloned before the drift markers are added.
    const twin = fab.clone(); twin.position.set(0, 0.3, -5.5); d.add(twin);
    twin.traverse((n) => { if (n.material) { n.material = n.material.clone(); n.material.color = new THREE.Color(C.violet); } });
    const bad = leaves[4];
    const badGlow = glowSprite(C.red, 3.5, 0); badGlow.position.copy(bad.position); fab.add(badGlow);
    const driftLb = pill('Leaf drift + new ACL', '#e2231a', 0.34); driftLb.position.set(bad.position.x + 0.6, 5.5, 1); fab.add(driftLb);
    const apps = new THREE.InstancedMesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }), 41);
    const mtx = new THREE.Matrix4();
    for (let i = 0; i < 41; i++) { mtx.makeTranslation(-6 + (i % 14) * 0.92, 0.35 + Math.floor(i / 14) * 0.62, 1.4); apps.setMatrixAt(i, mtx); apps.setColorAt(i, new THREE.Color(C.sky)); }
    d.add(apps);
    const appsLb = pill('41 applications', '#9be7ff', 0.34); appsLb.position.set(-7.6, 2.6, 1.6); d.add(appsLb);
    const blast = new THREE.Mesh(new THREE.TorusGeometry(7.6, 0.06, 6, 120), new THREE.MeshBasicMaterial({ color: C.red, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }));
    blast.rotation.x = Math.PI / 2; blast.position.set(0, 0.1, 1); blast.scale.set(1, 0.42, 1); d.add(blast);
    const twinLb = pill('Digital twin · verified', '#8e7cff', 0.38); twinLb.position.set(0, 9.4, -5.5); d.add(twinLb);
    const riskA = pill('Change risk 92', '#e2231a', 0.42), riskB = pill('Change risk 11', '#6cc04a', 0.42);
    riskA.position.set(4.5, 9.2, 0); riskB.position.set(4.5, 9.2, 0); d.add(riskA, riskB);
    const c = new THREE.Color(), lastK = { v: -1 };
    return {
      update(dt, t, step, a, f) {
        badGlow.material.opacity = a * (0.6 + 0.4 * Math.sin(t * 6));
        mixState(c, a, f);
        bad.userData.lines.material.color.copy(c); bad.userData.fill.material.color.copy(c);
        const k = Math.round((a * 10 + f * 100));
        if (k !== lastK.v) {
          lastK.v = k;
          for (let i = 0; i < 41; i++) { c.copy(SKY).lerp(RED, a * (0.6 + 0.4 * ((i * 7) % 5) / 4)).lerp(GRN, f); apps.setColorAt(i, c); }
          apps.instanceColor.needsUpdate = true;
        }
        blast.material.opacity = 0.8 * a; blast.scale.x = blast.scale.z = 1 + Math.sin(t * 3) * 0.02;
        setOpacity(driftLb, a);
        setOpacity(twin, f * 0.9); twin.position.y = 0.3 + (1 - f) * -2; setOpacity(twinLb, f);
        setOpacity(riskA, 1 - f); setOpacity(riskB, f);
      },
    };
  },
});

// 04 M-03 Tampa: a hurricane spiral moves in on the coast. Two of three carrier circuits share
// one central office inside the flood zone. At the fix, 5G backup and a voice reroute light up.
export const hurricane = mission({
  id: 'hurricane', detect: 'T-72h', agent: 'Resilience Agent · Catalyst SD-WAN · Webex Contact Center',
  signalTitle: 'Two of three circuits share one flood-zone office',
  signals: ['NOAA storm track joined with circuit paths', 'Claims calls forecast to surge six-fold', 'DR plan assumes diversity that is not there'],
  choices: [
    { label: 'Run the agent resilience playbook', detail: '5G SD-WAN backup, pre-shift voice, scale claims intake, rehearse failover.', kind: 'Governed agent · human approval', best: true },
    { label: 'Rely on the existing DR plan', detail: 'The plan was tested last year.', kind: 'Traditional path' },
  ],
  kpis: [['Call abandonment at peak', '48%', '6%'], ['Claim intake backlog', '3.5 days', 'Same day'], ['Customer-facing outage', '30 hours', 'None']],
  floor: '#2de2c5', tagColor: '#fbab18',
  bg: { a: '#03080a', b: '#2a2a10', c: '#fbab18', mix: [0.2, 0.6, 1, 0.2] },
  bgSteps: [null, { a: '#060310', b: '#24123e', c: '#f25c9a', mix: [0.8, 0.6, 0.4, 0.4] }, { a: '#020a0c', b: '#06323a', c: '#2de2c5', mix: [1, 0.6, 0, 0.5] }],
  dpos: [3, 0, -1],
  diorama(root) {
    const d = new THREE.Group(); root.add(d);
    const coast = drawTube(new THREE.CatmullRomCurve3([V(-9, 0.05, 5), V(-5, 0.05, 2), V(-3, 0.05, -1), V(-4, 0.05, -5), V(-2, 0.05, -8)]), { radius: 0.08, color: C.teal, opacity: 0.8 });
    coast.userData.setProgress(1); d.add(coast);
    const site = wireBox(2.8, 2.2, 2.2, C.sky, 0.12, 0.95); site.position.set(5, 1.1, 0); d.add(site);
    const siteLb = pill('Tampa claims and care', '#9be7ff', 0.36); siteLb.position.set(5, 3.1, 0); d.add(siteLb);
    const cos = [V(-0.6, 0.45, 2.2), V(0.6, 0.45, -1.4), V(2.2, 0.45, -5.5)];
    const coBoxes = cos.map((p, i) => { const b = wireBox(0.9, 0.9, 0.9, i < 2 ? C.amber : C.sky, 0.15, 0.95); b.position.copy(p); d.add(b); return b; });
    const flood = new THREE.Mesh(new THREE.CircleGeometry(3, 64), new THREE.MeshBasicMaterial({ color: C.sky, transparent: true, opacity: 0.12, depthWrite: false }));
    flood.rotation.x = -Math.PI / 2; flood.position.set(0, 0.04, 0.4); d.add(flood);
    const floodRing = new THREE.Mesh(new THREE.TorusGeometry(3, 0.05, 6, 80), new THREE.MeshBasicMaterial({ color: C.amber, transparent: true, opacity: 0.8 }));
    floodRing.rotation.x = Math.PI / 2; floodRing.position.copy(flood.position); d.add(floodRing);
    const floodLb = pill('Flood zone · shared central office', '#fbab18', 0.32); floodLb.position.set(-0.4, 2.2, 3.6); d.add(floodLb);
    const circuits = cos.map((p, i) => { const tb = drawTube(arc(V(5, 0.4, 0), p, 1.2), { radius: 0.05, color: i < 2 ? C.amber : C.sky }); tb.userData.setProgress(1); d.add(tb); return tb; });
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 4.5, 6), emissiveMat(C.green, 1.4)); mast.position.set(7.4, 2.25, 1.2); d.add(mast);
    const fiveG = drawTube(arc(V(7.4, 4.5, 1.2), V(9.5, 9.5, -4), 2), { radius: 0.06, color: C.green }); d.add(fiveG);
    const fiveLb = pill('5G SD-WAN backup', '#6cc04a', 0.34); fiveLb.position.set(8.2, 5.4, 1.4); d.add(fiveLb);
    const voice = drawTube(arc(V(5, 2.2, 0), V(11, 1, -8), 5), { radius: 0.06, color: C.teal }); d.add(voice);
    const voiceLb = pill('Voice pre-shifted to Noida + remote', '#2de2c5', 0.32); voiceLb.position.set(3.6, 5.6, -6); d.add(voiceLb);
    const storm = new THREE.Group(); d.add(storm);
    const swirl = points(1400, (i) => { const arm = i % 3, r = Math.pow(Math.random(), 0.7) * 4.6 + 0.4, an = r * 0.9 + arm * 2.09 + rr(-0.25, 0.25); return [Math.cos(an) * r, rr(0, 0.9) + r * 0.08, Math.sin(an) * r]; }, { size: 0.16, color: 0xe8f6ff, opacity: 0.75 });
    storm.add(swirl);
    const eye = glowSprite(C.ice, 2.4, 0.6); eye.position.y = 0.6; storm.add(eye);
    const stLb = pill('Storm track · landfall', '#ffffff', 0.34); stLb.position.set(0, 2.6, 0); storm.add(stLb);
    let sx = -11;
    return {
      update(dt, t, step, a, f) {
        sx = damp(sx, step === 0 ? -11 : step === 1 ? -6.5 : 0, 1.2, dt);
        storm.position.set(-1.5 - sx * 0.12, 0.5, sx + Math.sin(t * 0.4) * 0.3);
        swirl.rotation.y = -t * 0.7;
        circuits.forEach((c, i) => { c.material.opacity = i < 2 ? 0.95 * (1 - f * 0.85) * (0.6 + 0.4 * Math.sin(t * 7 + i) * a + 0.4 * (1 - a)) : 0.95; });
        coBoxes.forEach((b, i) => { if (i < 2) setOpacity(b, 1 - f * 0.7); });
        floodRing.material.opacity = 0.35 + 0.5 * a;
        fiveG.userData.setProgress(f); voice.userData.setProgress(clamp01(f * 1.3 - 0.2));
        setOpacity(fiveLb, f); setOpacity(voiceLb, f); setOpacity(mast, Math.max(0.15, f));
      },
    };
  },
});

// 05 M-07 Brighton: an important business service map inside its impact tolerance ring. The
// third-party provider degrades; the contracted secondary takes over and an evidence pack appears.
export const resilience = mission({
  id: 'resilience', detect: 'T-18h', agent: 'Resilience Agent · ThousandEyes · Splunk ITSI',
  signalTitle: 'Third-party identity provider degrading',
  signals: ['Status page says "minor degradation"', 'Service map: new retiree payments stall', 'Impact tolerance breach forecast'],
  choices: [
    { label: 'Trust the status page', detail: 'Minor degradation only.', kind: 'Traditional path' },
    { label: 'Activate the secondary provider path now', detail: 'Agent-orchestrated, with an evidence pack for the resilience register.', kind: 'Governed agent · human approval', best: true },
  ],
  kpis: [['Time outside tolerance', 'Near breach', '0'], ['New retiree payments delayed', '3,400', '0'], ['Evidence pack effort', '3 weeks', 'Automatic']],
  floor: '#c792ea', tagColor: '#f25c9a',
  bg: { a: '#08030c', b: '#2e0a30', c: '#f25c9a', mix: [0.9, 0.6, 0, 0.4] },
  bgSteps: [null, { a: '#020a10', b: '#062e40', c: '#00bceb', mix: [0.6, 0.8, 0, 0.5] }, { a: '#030a04', b: '#10300c', c: '#6cc04a', mix: [1, 0.5, 0, 0.5] }],
  dpos: [2, 0, -1],
  diorama(root) {
    const d = new THREE.Group(); root.add(d);
    const svc = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 1), new THREE.MeshStandardMaterial({ color: 0x06122a, emissive: C.sky, emissiveIntensity: 0.9, flatShading: true }));
    svc.position.set(0, 4.2, 0); d.add(svc);
    const svcLb = pill('Retiree income payments', '#9be7ff', 0.38); svcLb.position.set(0, 6.2, 0); d.add(svcLb);
    const deps = [V(-3.2, 2.2, 1), V(-1.2, 1.2, 2.4), V(1.6, 1.4, 2.2)];
    const depNames = ['Payments engine', 'Portal', 'Firewall egress'];
    deps.forEach((p, i) => {
      const n = new THREE.Mesh(new THREE.OctahedronGeometry(0.42), emissiveMat(C.ice, 0.9)); n.position.copy(p); d.add(n);
      const tb = drawTube(arc(svc.position, p, 0.3), { radius: 0.03, color: C.ice, opacity: 0.6 }); tb.userData.setProgress(1); d.add(tb);
      const lb = label(depNames[i], { size: 0.28, color: '#cfe8ff' }); lb.position.set(p.x, p.y - 0.75, p.z); d.add(lb);
    });
    const tol = new THREE.Mesh(new THREE.TorusGeometry(4.6, 0.08, 8, 120), new THREE.MeshBasicMaterial({ color: C.green, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending }));
    tol.rotation.x = Math.PI / 2; tol.position.set(0, 0.15, 0.6); d.add(tol);
    const tolLb = pill('Impact tolerance', '#6cc04a', 0.32); tolLb.position.set(-4.6, 0.9, 3); d.add(tolLb);
    const prim = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.3, 1.3), new THREE.MeshStandardMaterial({ color: 0x0a0a14, emissive: C.red, emissiveIntensity: 1 }));
    prim.position.set(5, 7.4, -2.5); d.add(prim);
    const primLb = pill('Third-party provider', '#f25c9a', 0.32); primLb.position.set(5, 8.8, -2.5); d.add(primLb);
    const sec = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.3, 1.3), new THREE.MeshStandardMaterial({ color: 0x0a0a14, emissive: C.green, emissiveIntensity: 1 }));
    sec.position.set(5.6, 1.6, 1.4); d.add(sec);
    const secLb = pill('Contracted secondary', '#6cc04a', 0.32); secLb.position.set(5.6, 2.9, 1.4); d.add(secLb);
    const toPrim = drawTube(arc(svc.position, prim.position, 1), { radius: 0.06, color: C.pink }); toPrim.userData.setProgress(1); d.add(toPrim);
    const toSec = drawTube(arc(svc.position, sec.position, 0.6), { radius: 0.07, color: C.green }); d.add(toSec);
    const probes = points(80, () => [rr(1.5, 4.6), rr(5.2, 7.4), rr(-2.4, -0.6)], { size: 0.18, color: C.sky, opacity: 0.8 }); d.add(probes);
    const pack = new THREE.Group(); pack.position.set(-4.8, 0, 2.6); d.add(pack);
    for (let i = 0; i < 4; i++) { const s = wireBox(1.6, 0.08, 2.1, C.green, 0.25, 0.9); s.position.set(i * 0.08, 0.2 + i * 0.22, -i * 0.05); s.rotation.y = i * 0.06; pack.add(s); }
    const packLb = pill('Evidence pack', '#6cc04a', 0.32); packLb.position.set(0, 1.7, 0); pack.add(packLb);
    const c = new THREE.Color();
    return {
      update(dt, t, step, a, f) {
        svc.rotation.y = t * 0.4;
        prim.material.emissiveIntensity = (0.3 + 0.7 * Math.abs(Math.sin(t * (2 + a * 6)))) * (1 - f * 0.75);
        prim.material.emissive.copy(c.copy(AMB).lerp(RED, a));
        toPrim.material.opacity = (0.95 - f * 0.85) * (0.6 + 0.4 * Math.sin(t * 8) * a + 0.4 * (1 - a));
        toSec.userData.setProgress(f);
        sec.material.emissiveIntensity = 0.2 + f * 1.2;
        mixState(c, a * 0.8, f, AMB); tol.material.color.copy(c);
        tol.scale.setScalar(1 - a * 0.06 * (1 + Math.sin(t * 3)));
        probes.rotation.y = Math.sin(t) * 0.05;
        setOpacity(pack, f); pack.position.y = (1 - f) * -1;
      },
    };
  },
});

// 06 M-08 Dubai: the kill chain as five hex stages. The attacker advances; at the fix it is
// pushed back to the identity stage behind a Hypershield segmentation wall.
export const ransomware = mission({
  id: 'ransomware', detect: 'T-95 min', agent: 'Security Agent · Cisco XDR · Splunk Enterprise Security',
  signalTitle: 'Three weak signals, one attack chain',
  signals: ['Click on a targeted phishing lure', 'Impossible-travel Duo push, new device', 'Unusual file share enumeration'],
  choices: [
    { label: 'Run the SOAR containment playbook', detail: 'Revoke sessions, Duo re-enroll, isolate endpoints, Hypershield segment.', kind: 'Governed agent · within policy', best: true },
    { label: 'Escalate to tier 2 for review', detail: 'Human triage in the morning shift.', kind: 'Traditional path' },
  ],
  kpis: [['Mean time to contain', '25+ hours', '15 minutes'], ['Systems encrypted', 'Claims shares', 'None'], ['Breach notification', 'Likely', 'Not required']],
  floor: '#ff6b4a', tagColor: '#ff6b4a',
  bg: { a: '#0c0202', b: '#40080a', c: '#ff6b4a', mix: [0.2, 0.8, 0.9, 0.2] },
  bgSteps: [null, { a: '#06040f', b: '#201a40', c: '#ffd95a', mix: [0.7, 0.7, 0.3, 0.4] }, { a: '#020810', b: '#082a44', c: '#02c8ff', mix: [1, 0.6, 0, 0.6] }],
  diorama(root) {
    const d = new THREE.Group(); root.add(d);
    const names = ['Email lure', 'Identity · Duo', 'Endpoint', 'File shares', 'Encryption'];
    const xs = [-5.4, -2.6, 0.2, 3, 5.8];
    const nodes = names.map((n, i) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.5, 6), new THREE.MeshStandardMaterial({ color: 0x08101e, emissive: C.sky, emissiveIntensity: 0.8, flatShading: true }));
      m.rotation.x = Math.PI / 2; m.position.set(xs[i], 3.6, 0); d.add(m);
      m.add(edgeLines(m.geometry, C.ice, 0.8));
      const lb = label(n, { size: 0.32, color: '#ffffff', bg: 'rgba(3,10,22,0.78)' }); lb.position.set(xs[i], 2.2, 0.4); d.add(lb);
      return m;
    });
    const line = drawTube(new THREE.CatmullRomCurve3([V(-5.4, 3.6, -0.1), V(5.8, 3.6, -0.1)]), { radius: 0.05, color: C.ice, opacity: 0.5 }); line.userData.setProgress(1); d.add(line);
    const atk = new THREE.Mesh(new THREE.OctahedronGeometry(0.42), emissiveMat(C.red, 2.2)); d.add(atk);
    const atkGlow = glowSprite(C.red, 2.4, 0.9); d.add(atkGlow);
    const wall = new THREE.Group(); wall.position.set(-1.2, 3.6, 0); d.add(wall);
    const hexes = [];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) {
      const h = new THREE.Mesh(new THREE.CircleGeometry(0.42, 6), new THREE.MeshBasicMaterial({ color: C.sky, transparent: true, opacity: 0.35, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
      h.position.set(0, (r - 2) * 0.74, (c - 1) * 0.86 + (r % 2) * 0.43); h.rotation.y = Math.PI / 2; wall.add(h); hexes.push(h);
    }
    const wallLb = pill('Hypershield segment · sessions revoked', '#02c8ff', 0.32); wallLb.position.set(-1.2, 6.1, 0); d.add(wallLb);
    const chainLb = pill('Splunk ES + Cisco XDR: one attack chain', '#ff6b4a', 0.32); chainLb.position.set(0.2, 6.1, 0); d.add(chainLb);
    const c = new THREE.Color();
    let ax = 1.6;
    return {
      update(dt, t, step, a, f) {
        ax = damp(ax, step === 0 ? 1.6 : step === 1 ? 2.6 : -2.0, 1.4, dt);
        atk.position.set(ax + Math.sin(t * 3) * 0.08, 3.6 + Math.sin(t * 2) * 0.15, 0.9);
        atk.rotation.y = t * 2; atkGlow.position.copy(atk.position);
        atkGlow.material.opacity = 0.9 - f * 0.4;
        nodes.forEach((n, i) => {
          const hit = ax > n.position.x - 0.6 ? 1 : 0;
          c.copy(SKY).lerp(RED, hit * (1 - f)).lerp(GRN, f * (i >= 2 ? 1 : 0)).lerp(AMB, f * (i < 2 ? 0.7 : 0));
          n.material.emissive.copy(c);
          n.material.emissiveIntensity = 0.7 + hit * 0.5 * Math.abs(Math.sin(t * 5)) * (1 - f);
        });
        hexes.forEach((h, i) => { h.material.opacity = f * (0.25 + 0.25 * Math.sin(t * 3 + i)); });
        wall.scale.setScalar(Math.max(0.001, smooth(f)));
        setOpacity(wallLb, f); setOpacity(chainLb, a > 0.3 ? 1 : a * 3);
      },
    };
  },
});

// 07 M-10 Whippany: market data as an equalizer. Five-minute averages stay flat while sub-second
// microbursts spike; a shared uplink splits into feeds and analytics at the fix.
export const mim = mission({
  id: 'mim', detect: 'T-70 min', agent: 'Markets Agent · Nexus Dashboard · market calendar',
  signalTitle: 'Microbursts will drop packets at 14:00',
  signals: ['5-minute averages look perfect', 'Sub-second telemetry: buffers filling', 'Analytics shares the feed handler uplink'],
  choices: [
    { label: 'Averages are fine, so carry on', detail: 'Utilization is only 30%.', kind: 'Traditional path' },
    { label: 'Approve QoS and workload separation', detail: 'Protect feed handlers, move analytics, pre-warm the OMS.', kind: 'Governed agent · desk head approval', best: true },
  ],
  kpis: [['Feed latency at peak', 'Spikes 40x', 'Flat'], ['Rebalance window', 'Missed', 'Completed'], ['Execution slippage', 'Material', 'In tolerance']],
  floor: '#ffd95a', tagColor: '#ffd95a',
  bg: { a: '#070602', b: '#30280a', c: '#ffd95a', mix: [0.6, 1, 0.3, 0.4] },
  bgSteps: [null, { a: '#05030f', b: '#1e1240', c: '#f25c9a', mix: [0.9, 0.5, 0, 0.5] }, { a: '#01060f', b: '#05264a', c: '#00bceb', mix: [1, 0.7, 0.2, 0.5] }],
  diorama(root) {
    const d = new THREE.Group(); root.add(d);
    const NB = 34;
    const bars = [];
    for (let i = 0; i < NB; i++) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1, 0.22), emissiveMat(C.sky, 1.3));
      b.position.set(-5.6 + i * 0.34, 0, 1); d.add(b); bars.push(b);
    }
    const avg = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.05, 0.05), emissiveMat(C.green, 1.4)); avg.position.set(0, 1.5, 1.2); d.add(avg);
    const avgLb = pill('5-minute average: looks fine', '#6cc04a', 0.3); avgLb.position.set(-3.4, 2.1, 1.6); d.add(avgLb);
    const burstLb = pill('Sub-second microbursts', '#ffd95a', 0.32); burstLb.position.set(2.6, 7.6, 1); d.add(burstLb);
    const sw = wireBox(1.8, 1, 1.4, C.sky, 0.12, 0.95); sw.position.set(7.6, 1.4, -2.2); d.add(sw);
    const swLb = pill('Market data leaf', '#9be7ff', 0.3); swLb.position.set(7.6, 2.5, -2.2); d.add(swLb);
    const an = wireBox(1.6, 0.9, 1.3, C.amber, 0.12, 0.95); an.position.set(4.6, 1.2, -7.4); d.add(an);
    const anLb = pill('Analytics uplink', '#fbab18', 0.3); anLb.position.set(4.6, 2.3, -7.4); d.add(anLb);
    const pipeA = new THREE.CatmullRomCurve3([V(5.8, 0.4, 1), V(6.6, 0.8, -0.6), V(7.6, 1.2, -2.2)]);
    const pipeB = new THREE.CatmullRomCurve3([V(5.8, 0.4, 1), V(5.6, 0.8, -3.6), V(4.6, 1.1, -7.4)]);
    const tA = drawTube(pipeA, { radius: 0.12, color: C.sky, opacity: 0.5 }); tA.userData.setProgress(1); d.add(tA);
    const tB = drawTube(pipeB, { radius: 0.12, color: C.amber, opacity: 0.5 }); d.add(tB);
    const NP = 120;
    const flow = points(NP, () => [0, 0, 0], { size: 0.24, color: 0xffffff, opacity: 0.95 });
    const fc = new Float32Array(NP * 3);
    for (let i = 0; i < NP; i++) { const ca = i % 3 === 0 ? AMB : SKY; fc[i * 3] = ca.r; fc[i * 3 + 1] = ca.g; fc[i * 3 + 2] = ca.b; }
    flow.geometry.setAttribute('color', new THREE.BufferAttribute(fc, 3)); flow.material.vertexColors = true; flow.material.color.set(0xffffff); flow.material.needsUpdate = true;
    d.add(flow);
    const fp = flow.geometry.attributes.position.array, tmp = new THREE.Vector3();
    const ann = pill('14:00 announcement', '#ffffff', 0.3); ann.position.set(-4.8, 7.6, 1); d.add(ann);
    return {
      update(dt, t, step, a, f) {
        bars.forEach((b, i) => {
          const base = 0.5 + 0.35 * Math.abs(Math.sin(t * 2.2 + i * 0.7));
          const burst = Math.pow(Math.max(0, Math.sin(t * 3.1 + i * 0.9) * Math.sin(t * 0.7 + i * 0.21)), 8) * 6.5 * (1 - f) * (0.4 + a * 0.6);
          const h = base + burst;
          b.scale.y = h; b.position.y = h / 2;
          b.material.emissive.copy(burst > 1.2 ? AMB : SKY);
        });
        setOpacity(burstLb, 1 - f); tB.userData.setProgress(f);
        for (let i = 0; i < NP; i++) {
          const u = (i / NP + t * 0.25) % 1;
          const toB = i % 3 === 0 && f > 0.5;
          (toB ? pipeB : pipeA).getPoint(u, tmp);
          fp[i * 3] = tmp.x; fp[i * 3 + 1] = tmp.y + (i % 3 === 0 ? 0 : 0.05); fp[i * 3 + 2] = tmp.z;
        }
        flow.geometry.attributes.position.needsUpdate = true;
      },
    };
  },
});

// ---------------------------------------------------------------------------
// 08 The mission rail: ten columns, height = modeled value at stake, colored by business
// function. Each click filters by function, then pulls forward the four missions not walked.
export const rail = {
  id: 'rail',
  bg: { a: '#030a04', b: '#132a0c', c: '#a4ce4e', mix: [0.4, 1, 0, 0.3] },
  bgSteps: [null, { a: '#040a02', b: '#1e2c08', c: '#a4ce4e', mix: [0.8, 0.8, 0, 0.4] }, { a: '#08040c', b: '#26123a', c: '#c792ea', mix: [0.9, 0.6, 0, 0.4] }, { a: '#02080c', b: '#0a2a36', c: '#5ec8f2', mix: [1, 0.6, 0.2, 0.5] }],
  cams: [{ p: [3, 8, 25], t: [9.4, 4.6, 0] }, { p: [5, 7, 24], t: [9.4, 4.6, 0] }, { p: [1, 9, 25], t: [9.4, 4.6, 0] }, { p: [6, 7, 23.5], t: [9.4, 4.6, 0] }],
  build() {
    const group = new THREE.Group();
    group.add(gridFloor(140, 70, C.green, 0.12));
    const chart = new THREE.Group(); group.add(chart);
    const lensC = Object.fromEntries(LENSES.map((l) => [l.key, l.color]));
    const cols = MISSIONS.map((m, i) => {
      const g = new THREE.Group();
      const x = 1.9 + i * 1.8, z = -Math.pow(i - 4.5, 2) * 0.12;
      g.position.set(x, 0, z); chart.add(g);
      const h = m.value * 0.62;
      const mat = new THREE.MeshStandardMaterial({ color: 0x06101e, emissive: col(lensC[m.lenses[0]]), emissiveIntensity: 0.5, transparent: true, opacity: 0.85, roughness: 0.4 });
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.95, h, 0.95), mat); box.position.y = h / 2; g.add(box);
      const edge = edgeLines(box.geometry, col(lensC[m.lenses[0]]), 0.9); edge.position.y = h / 2; g.add(edge);
      m.lenses.slice(1).forEach((l, k) => { const dot = glowSprite(col(lensC[l]), 0.6, 0.9); dot.position.set(-0.25 + k * 0.5, h + 0.25, 0.55); g.add(dot); });
      const vl = label(money(m.value), { size: 0.34, color: '#ffffff', bg: 'rgba(3,10,22,0.75)' }); vl.position.set(0, h + 0.85, 0); g.add(vl);
      const nl = label(`${m.code}\n${m.city.replace(', NJ', '').replace(', NC', '').replace(', FL', '')}`, { size: 0.3, color: '#e6eef8' }); nl.position.set(0, -0.85 - (i % 2) * 0.75, 0.6); g.add(nl);
      return { g, box, mat, m, h, k: 1, z, vl };
    });
    const total = canvasPanel(6.4, 2.4, (g, w, h, title = 'All functions', v = 80.2, sub = 'ten missions') => {
      cardBg(g, w, h, '#a4ce4e', 0.9, false);
      font(g, 700, h * 0.1, true); g.fillStyle = '#c8f0a0'; g.fillText(`MODELED VALUE AT STAKE · ${title.toUpperCase()}`, 36, h * 0.24);
      font(g, 800, h * 0.36); g.fillStyle = '#ffffff'; g.fillText(money(v), 36, h * 0.63);
      font(g, 500, h * 0.085); g.fillStyle = 'rgba(214,228,245,0.75)'; g.fillText(`${sub} · modeled estimates`, 36, h * 0.85);
    }, 200);
    group.add(total);
    const FILT = [
      { t: 'All functions', f: () => true, sub: 'ten missions' },
      { t: 'Revenue and growth', f: (m) => m.lenses.includes('revenue'), sub: 'four missions' },
      { t: 'Risk and security', f: (m) => m.lenses.includes('risk') || m.lenses.includes('security'), sub: 'six missions' },
      { t: 'Four more missions', f: (m) => ['japan', 'xcelerator', 'pensions', 'voice'].includes(m.id), sub: 'not walked today' },
    ];
    FILT.forEach((F) => { F.v = MISSIONS.filter(F.f).reduce((a, m) => a + m.value, 0); });
    let lastStep = -1;
    return {
      group,
      update(dt, t, step) {
        const M = isMobile();
        poseTo(chart, M ? [3.4, 4.6, -2, 0.62] : [0, 0, 0, 1], dt, 3);
        poseTo(total, M ? [9.4, 12, 0, 0.82] : [13.6, 12.6, -1.5, 1], dt, 3);
        const F = FILT[Math.min(step, 3)];
        if (step !== lastStep) { lastStep = step; total.userData.redraw(F.t, F.v, F.sub); }
        cols.forEach((c, i) => {
          const on = F.f(c.m) ? 1 : 0;
          c.k = damp(c.k, on, 4, dt);
          c.mat.emissiveIntensity = 0.08 + c.k * 0.5 + (step === 3 && on ? 0.2 * Math.sin(t * 3 + i) : 0);
          c.mat.opacity = 0.25 + 0.65 * c.k;
          c.g.position.z = c.z + (step === 3 ? c.k * 2.2 : 0) + Math.sin(t * 0.8 + i) * 0.04;
          c.g.position.y = c.k * 0.3;
          setOpacity(c.vl, 0.25 + 0.75 * c.k);
        });
      },
    };
  },
};

// ---------------------------------------------------------------------------
// 09 Academy (focus): five chain links climb from the IT floor to the boardroom. Each click
// lights the next link, pulls it forward, and sends a pulse up the chain.
export const academy = {
  id: 'academy',
  bg: { a: '#030312', b: '#101a44', c: '#8e7cff', mix: [1, 0.3, 0.2, 0.7] },
  cams: [{ p: [3, 7.5, 29], t: [8.6, 6.8, 0] }],
  build() {
    const group = new THREE.Group();
    const world = new THREE.Group(); group.add(world);
    const floor = gridFloor(60, 30, C.sky, 0.14); world.add(floor);
    const pos = BLOCKS.map((_, i) => V(3.4 + i * 2.9, 1.6 + i * 2.5, -i * 0.6));
    const curve = new THREE.CatmullRomCurve3(pos.map((p) => p.clone().add(V(0, 0, -0.3))));
    const spine = drawTube(curve, { radius: 0.06, color: C.violet, opacity: 0.7 }); spine.userData.setProgress(1); world.add(spine);
    const lit = drawTube(curve, { radius: 0.1, color: C.white, opacity: 0.9 }); world.add(lit);
    const pulse = glowSprite(C.white, 1.6, 0); world.add(pulse);
    const tiles = BLOCKS.map((b, i) => {
      const tile = canvasPanel(5, 1.9, (g, w, h, on = 0) => {
        g.fillStyle = 'rgba(4,10,26,0.9)'; roundRect(g, 6, 6, w - 12, h - 12, 26); g.fill();
        g.strokeStyle = b.color; g.globalAlpha = 0.5 + on * 0.5; g.lineWidth = 6; g.stroke(); g.globalAlpha = 1;
        g.fillStyle = b.color; g.fillRect(6, 6, 16, h - 12);
        font(g, 700, h * 0.12, true); g.fillText(String(i + 1).padStart(2, '0'), 44, h * 0.27);
        font(g, 800, h * 0.2); g.fillStyle = '#ffffff'; g.fillText(b.label, 44, h * 0.56);
        font(g, 400, h * 0.13); g.fillStyle = 'rgba(220,230,245,0.8)'; g.fillText(b.hint, 44, h * 0.8);
      }, 200);
      tile.position.copy(pos[i]); world.add(tile);
      const node = glowSprite(col(b.color), 2.2, 0.4); node.position.copy(pos[i]).add(V(0, 0, -0.4)); world.add(node);
      return { tile, node, k: 0, on: -1 };
    });
    const itLb = pill('IT and network', '#00bceb', 0.4); itLb.position.set(3.4, -0.2, 1); world.add(itLb);
    const brLb = pill('Boardroom', '#6cc04a', 0.46); brLb.position.set(15.2, 14.6, -2.4); world.add(brLb);
    const table = wireBox(4, 0.2, 1.8, C.green, 0.15, 0.9); table.position.set(15.2, 13.6, -2.8); world.add(table);
    const chairs = [];
    for (let i = 0; i < 6; i++) { const p = person(C.ice, 0.55); p.position.set(13.6 + (i % 3) * 1.6, 13.1, -3.9 + Math.floor(i / 3) * 2.2); world.add(p); chairs.push(p); }
    let feed = 0;
    return {
      group,
      update(dt, t, step) {
        const M = isMobile();
        poseTo(world, M ? [3.6, 5.6, -2, 0.6] : [0, 0, 0, 1], dt, 3);
        const focus = step - 1;
        feed = damp(feed, Math.max(0, step), 2.4, dt);
        lit.userData.setProgress(clamp01((feed - 1) / 4 + (step > 0 ? 0.02 : 0)));
        const u = (t * 0.35) % 1;
        if (step > 0) { curve.getPoint(Math.min(u, clamp01((feed - 1) / 4)), pulse.position); pulse.material.opacity = 0.8; } else pulse.material.opacity = 0;
        tiles.forEach((T, i) => {
          const isF = i === focus;
          T.k = damp(T.k, isF ? 1 : 0, 4, dt);
          const on = step === 0 ? 0.5 : i <= focus ? 1 : 0;
          if (on !== T.on) { T.on = on; T.tile.userData.redraw(on); }
          T.tile.position.set(pos[i].x - T.k * 1.4, pos[i].y + T.k * 0.4, pos[i].z + T.k * 5);
          T.tile.scale.setScalar(1 + T.k * 0.4);
          T.tile.material.opacity = step === 0 ? 0.9 : isF ? 1 : i < focus ? 0.7 : 0.35;
          T.node.material.opacity = (i <= focus ? 0.7 : 0.15) + T.k * 0.3;
        });
        const top = clamp01(feed - 4.6) * 2;
        table.userData.lines.material.opacity = 0.3 + 0.7 * top;
        chairs.forEach((p) => p.scale.setScalar(0.5 + 0.08 * top));
      },
    };
  },
};

// ---------------------------------------------------------------------------
// 10 Discovery: four executives on a turntable. Each click turns the next one to the front,
// raises a spotlight, and floats their question card.
export const discovery = {
  id: 'discovery',
  bg: { a: '#02090a', b: '#0a2a2a', c: '#2de2c5', mix: [0.8, 0.5, 0, 0.5] },
  bgSteps: [null, { a: '#03070f', b: '#0c2240', c: '#00bceb', mix: [0.8, 0.5, 0, 0.5] }, { a: '#08040c', b: '#26123a', c: '#c792ea', mix: [0.8, 0.5, 0, 0.5] }, { a: '#0a0306', b: '#300a14', c: '#ff6b4a', mix: [0.8, 0.6, 0.2, 0.5] }],
  cams: [{ p: [3, 8, 26], t: [8.4, 5.6, 0] }],
  build() {
    const group = new THREE.Group();
    group.add(gridFloor(120, 60, C.teal, 0.12));
    const table = new THREE.Group(); table.position.set(8.4, 0, -3); group.add(table);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(6.2, 6.2, 0.2, 64), new THREE.MeshStandardMaterial({ color: 0x06121e, emissive: C.teal, emissiveIntensity: 0.15, transparent: true, opacity: 0.8 }));
    table.add(disc); disc.add(edgeLines(disc.geometry, C.teal, 0.5));
    const QS = [
      ['Head of Group Benefits', 'How did the last open enrollment go? How many employer escalations were tied to portal performance?', '#a4ce4e'],
      ['CIO and change board', 'What share of your major incidents last year started with a change?', '#00bceb'],
      ['Chief risk officer', 'How long does it take to produce operational resilience evidence for a regulator?', '#c792ea'],
      ['CISO', 'How many alerts does your SOC handle a day, and how many are investigated within an hour?', '#ff6b6b'],
    ];
    const seats = QS.map(([who, q, c], i) => {
      const s = new THREE.Group(); const a = (i / 4) * Math.PI * 2;
      s.position.set(Math.sin(a) * 4.6, 0.1, Math.cos(a) * 4.6); s.rotation.y = a; table.add(s);
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.6, 24), new THREE.MeshStandardMaterial({ color: 0x06101e, emissive: col(c), emissiveIntensity: 0.4 }));
      ped.position.y = 0.3; s.add(ped);
      const p = person(col(c), 1.5); p.position.y = 0.6; s.add(p);
      const spot = new THREE.Mesh(new THREE.ConeGeometry(1.4, 6, 32, 1, true), new THREE.MeshBasicMaterial({ color: col(c), transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      spot.position.y = 3.6; s.add(spot);
      const name = pill(who, c, 0.36); name.position.set(0, 3.2, 0.4); s.add(name);
      return { s, ped, spot, name, a, k: 0 };
    });
    const cards = QS.map(([who, q, c]) => {
      const p = canvasPanel(7.6, 2.9, (g, w, h) => {
        cardBg(g, w, h, c);
        font(g, 700, h * 0.085, true); g.fillStyle = c; g.fillText(`ASK · ${who.toUpperCase()}`, 48, h * 0.2);
        font(g, 700, h * 0.105); g.fillStyle = '#ffffff'; wrapText(g, q, 48, h * 0.42, w - 96, h * 0.135, 4);
      }, 220);
      group.add(p); return { p, k: 0 };
    });
    let rot = 0;
    return {
      group,
      update(dt, t, step) {
        const M = isMobile();
        const tp = M ? [8.4, 6.4, -6, 0.55] : [8.4, 0, -3, 1];
        poseTo(table, tp, dt, 3);
        rot = damp(rot, -step * Math.PI / 2, 2.2, dt);
        table.rotation.y = rot;
        seats.forEach((S, i) => {
          S.k = damp(S.k, i === step ? 1 : 0, 3, dt);
          S.spot.material.opacity = S.k * 0.12;
          S.ped.material.emissiveIntensity = 0.3 + S.k * 1.2;
          setOpacity(S.name, 0.35 + 0.65 * S.k);
        });
        cards.forEach((C2, i) => {
          C2.k = damp(C2.k, i === step ? 1 : 0, 3.5, dt);
          const done = i < step;
          const P = M
            ? (i === step ? [8.4, 12.6, 1, 1.02] : [8.4, 17, -2, 0.5])
            : (i === step ? [12.8, 9.8, 1, 1.15] : done ? [15, 14.8 - (step - 1 - i) * 1.25, -3, 0.42] : [12.6, 6, -4, 0.6]);
          poseTo(C2.p, P, dt, 3.5);
          setOpacity(C2.p, i === step ? C2.k : done ? (M ? 0 : 0.55) : 0);
        });
      },
    };
  },
};

// ---------------------------------------------------------------------------
// 11 Quiz: a question board above three answer slabs on pedestals. Reveal steps raise the
// correct pedestal in green and sink the others.
const QUIZ = [
  { q: 'Why does an enrollment portal slowdown matter to the CFO?', options: ['It raises cloud spend', 'It threatens employer renewals and group benefits revenue', 'It slows down code releases'], answer: 1 },
  { q: 'In the Santiago pension run, what did "green" mean in the scheduler?', options: ['On time', 'Running, but not necessarily on time', 'Finished'], answer: 1 },
];
export const quiz = {
  id: 'quiz',
  bg: { a: '#080602', b: '#2a1e06', c: '#ffd95a', mix: [0.5, 0.9, 0, 0.4] },
  bgSteps: [null, { a: '#020a06', b: '#0a3018', c: '#6cc04a', mix: [1, 0.6, 0, 0.5] }, { a: '#08040a', b: '#2a1206', c: '#fbab18', mix: [0.6, 0.9, 0.2, 0.4] }, { a: '#020a0c', b: '#06323a', c: '#2de2c5', mix: [1, 0.6, 0, 0.5] }],
  cams: [{ p: [4, 7.5, 27], t: [8.6, 6.2, 0] }],
  build() {
    const group = new THREE.Group();
    group.add(gridFloor(120, 60, C.gold, 0.12));
    const board = new THREE.Group(); group.add(board);
    const qp = canvasPanel(13.4, 2.4, (g, w, h, qi = 0) => {
      cardBg(g, w, h, '#ffd95a', 0.92, false);
      font(g, 700, h * 0.11, true); g.fillStyle = '#ffd95a'; g.fillText(`ACADEMY QUIZ · QUESTION ${qi + 1} OF 2`, 40, h * 0.26);
      font(g, 800, h * 0.2); g.fillStyle = '#ffffff'; wrapText(g, QUIZ[qi].q, 40, h * 0.58, w - 80, h * 0.24, 2);
    }, 200);
    qp.position.set(8.6, 11.6, 0); board.add(qp);
    const xs = [3.6, 8.6, 13.6];
    const slots = xs.map((x, i) => {
      const ped = new THREE.Mesh(new THREE.BoxGeometry(3.8, 3, 1.6), new THREE.MeshStandardMaterial({ color: 0x08101e, emissive: C.gold, emissiveIntensity: 0.25, transparent: true, opacity: 0.85 }));
      ped.position.set(x, 1.5, -0.6); board.add(ped);
      const edge = edgeLines(ped.geometry, C.gold, 0.6); ped.add(edge);
      const p = canvasPanel(4.5, 2.6, (g, w, h, qi = 0, state = 'neutral') => {
        const c = state === 'right' ? '#6cc04a' : state === 'wrong' ? '#5a6b80' : '#ffd95a';
        cardBg(g, w, h, c, 0.94, false);
        font(g, 800, h * 0.14, true); g.fillStyle = c; g.fillText(String.fromCharCode(65 + i), 36, h * 0.26);
        if (state === 'right') { font(g, 700, h * 0.1, true); g.fillText('CORRECT', w - 36 - g.measureText('CORRECT').width, h * 0.26); }
        font(g, 700, h * 0.13); g.fillStyle = state === 'wrong' ? 'rgba(255,255,255,0.45)' : '#ffffff';
        wrapText(g, QUIZ[qi].options[i], 36, h * 0.5, w - 72, h * 0.16, 3);
      }, 200);
      p.position.set(x, 4.6, 0.4); board.add(p);
      const glow = glowSprite(C.green, 6, 0); glow.position.set(x, 4.6, -0.2); board.add(glow);
      return { ped, edge, p, glow, k: 0, state: '' };
    });
    let lastQ = -1;
    return {
      group,
      update(dt, t, step) {
        const M = isMobile();
        poseTo(board, M ? [2.4, 5.6, -2, 0.72] : [0, 0, 0, 1], dt, 3);
        const qi = step >= 2 ? 1 : 0, reveal = step % 2 === 1;
        if (qi !== lastQ) { lastQ = qi; qp.userData.redraw(qi); }
        slots.forEach((S, i) => {
          const right = i === QUIZ[qi].answer;
          const st = reveal ? (right ? 'right' : 'wrong') : 'neutral';
          if (st + qi !== S.state) { S.state = st + qi; S.p.userData.redraw(qi, st); }
          S.k = damp(S.k, reveal ? (right ? 1 : -1) : 0, 3, dt);
          S.ped.position.y = 1.5 + S.k * 0.9;
          S.p.position.y = 4.6 + S.k * 0.9;
          S.p.position.z = 0.4 + Math.max(0, S.k) * 1.2;
          S.ped.material.emissive.set(S.k > 0.3 ? C.green : C.gold);
          S.ped.material.emissiveIntensity = 0.2 + Math.max(0, S.k) * 1;
          S.glow.position.y = S.p.position.y; S.glow.material.opacity = Math.max(0, S.k) * 0.5;
          S.p.material.opacity = 1 - Math.max(0, -S.k) * 0.45;
        });
        qp.position.y = 11.6 + Math.sin(t * 0.8) * 0.08;
      },
    };
  },
};

// ---------------------------------------------------------------------------
// 12 Sources and method: a stack of source sheets stamped MODELED fans out into a wall.
const SHEETS = [
  ['Public filings', 'MetLife investor relations'],
  ['New Frontier strategy', 'Public strategy commitments'],
  ['Public site locations', 'Ten mission sites, real addresses'],
  ['Industry benchmarks', 'About $40K per minute of downtime'],
  ['Breach cost studies', 'About $6M per financial-sector breach'],
  ['Regulation', 'U.K. impact tolerances and EU DORA'],
];
export const sources = {
  id: 'sources',
  bg: { a: '#03060f', b: '#0b1d36', c: '#9be7ff', mix: [0.4, 0.6, 0.6, 0.3] },
  bgSteps: [null, { a: '#040312', b: '#16123e', c: '#8e7cff', mix: [0.8, 0.5, 0.3, 0.5] }],
  cams: [{ p: [2, 7, 27], t: [8, 6, 0] }, { p: [4, 8, 28], t: [8.4, 6.4, 0] }],
  build() {
    const group = new THREE.Group();
    group.add(gridFloor(120, 60, C.ice, 0.1));
    const wall = new THREE.Group(); group.add(wall);
    const sheets = SHEETS.map(([h1, sub], i) => {
      const p = canvasPanel(4.6, 2.5, (g, w, h) => {
        cardBg(g, w, h, i >= 3 ? '#fbab18' : '#9be7ff', 0.94);
        font(g, 600, h * 0.09, true); g.fillStyle = i >= 3 ? '#fbab18' : '#9be7ff'; g.fillText(i >= 3 ? 'MODEL INPUT' : 'PUBLIC SOURCE', 44, h * 0.24);
        font(g, 800, h * 0.15); g.fillStyle = '#ffffff'; g.fillText(h1, 44, h * 0.52);
        font(g, 500, h * 0.1); g.fillStyle = 'rgba(214,228,245,0.85)'; wrapText(g, sub, 44, h * 0.76, w - 80, h * 0.12, 2);
      }, 180);
      wall.add(p);
      return { p, stack: [9 + i * 0.12, 3.8 + i * 0.32, -i * 0.25, 1], grid: [4.4 + (i % 3) * 5, 9.4 - Math.floor(i / 3) * 3.2, 0, 1], i };
    });
    const stamp = canvasPanel(6.4, 1.8, (g, w, h) => {
      g.strokeStyle = '#fbab18'; g.lineWidth = 12; roundRect(g, 12, 12, w - 24, h - 24, 30); g.stroke();
      font(g, 800, h * 0.44, true); g.fillStyle = '#fbab18'; g.textAlign = 'center'; g.fillText('MODELED', w / 2, h * 0.5);
      font(g, 600, h * 0.14); g.fillText('FOR DISCUSSION ONLY', w / 2, h * 0.8);
    }, 160);
    stamp.rotation.z = 0.12; wall.add(stamp);
    const noData = pill('No MetLife internal data used', '#fbab18', 0.42); group.add(noData);
    let k = 0;
    return {
      group,
      update(dt, t, step) {
        const M = isMobile();
        poseTo(wall, M ? [0.6, 6.8, -2, 0.62] : [0, 0, 0, 1], dt, 3);
        k = damp(k, step >= 1 ? 1 : 0, 2.2, dt);
        sheets.forEach((S) => {
          const a = S.stack, b = S.grid, e = smooth(k * 1.3 - S.i * 0.05);
          S.p.position.set(a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e);
          S.p.rotation.z = (1 - e) * (S.i - 2.5) * 0.05;
        });
        stamp.position.set(9.6 + k * 0.4, 7.6 - k * 4.6 + Math.sin(t) * 0.05, 1.2 + k * 0.6);
        stamp.scale.setScalar(1 - k * 0.25);
        if (M) noData.position.set(5.6, 14.6, 0); else noData.position.set(9.4, 13.2 + k * 0.4, 0);
      },
    };
  },
};

// ---------------------------------------------------------------------------
// 13 Hero close: the bridge bars return above a small planet with all ten pins; at step 1 the
// six walked missions' modeled total appears and an audio-wave floor answers.
export const close = {
  id: 'close',
  bg: { a: '#01040b', b: '#062a4d', c: '#00bceb', mix: [1, 0.6, 0, 0.5] },
  bgSteps: [null, { a: '#02070a', b: '#0c2a24', c: '#6cc04a', mix: [1, 0.6, 0.2, 0.6] }],
  cams: [{ p: [0, 7, 32], t: [0, 7.4, 0] }, { p: [0, 7.6, 35], t: [0, 7.8, 0] }],
  build() {
    const group = new THREE.Group();
    const G = makeGlobe(3, { labels: false });
    G.group.position.set(0, 17.2, -10); group.add(G.group);
    const lift = new THREE.Group(); lift.position.y = 4.6; group.add(lift);
    const bars = bridgeBars({ spacing: 1.8, unit: 2, radius: 0.36 }); lift.add(bars);
    group.add(gridFloor(220, 110, C.sky, 0.14));
    const wave = [];
    for (let i = 0; i < 64; i++) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1, 0.18), emissiveMat(i % 2 ? C.sky : C.green, 1.4));
      b.position.set((i - 31.5) * 0.5, 0, 4); group.add(b); wave.push(b);
    }
    const sum = canvasPanel(7.6, 2.2, (g, w, h) => {
      cardBg(g, w, h, '#6cc04a', 0.88, false);
      font(g, 700, h * 0.1, true); g.fillStyle = '#c8f0a0'; g.fillText('SIX MISSIONS WALKED TODAY', 40, h * 0.25);
      font(g, 800, h * 0.34); g.fillStyle = '#ffffff'; g.fillText(`${money(MISSION_ORDER.reduce((a, k) => a + MV[k].value, 0))}`, 40, h * 0.62);
      const ww = g.measureText(money(61.1)).width;
      font(g, 600, h * 0.11); g.fillStyle = '#6cc04a'; g.fillText(' modeled value protected', 48 + ww, h * 0.62);
      font(g, 500, h * 0.085); g.fillStyle = 'rgba(214,228,245,0.75)'; g.fillText('Modeled estimates, for discussion only. Replace with your numbers.', 40, h * 0.85);
    }, 200);
    group.add(sum);
    let k = 0, wk = 0;
    return {
      group,
      update(dt, t, step) {
        const M = isMobile();
        k = damp(k, 1, 1.4, dt); wk = damp(wk, step >= 1 ? 1 : 0, 2, dt);
        bars.userData.setHeights(smooth(k), t);
        G.spin.rotation.y = t * 0.15; G.spin.rotation.x = 0.3;
        wave.forEach((b, i) => {
          const h = 0.1 + wk * (0.4 + Math.abs(Math.sin(t * 3 + i * 0.35) * Math.sin(i * 0.12 + t)) * 2.4);
          b.scale.y = h; b.position.y = h / 2;
        });
        snapTo(sum, M ? [0, 17.4, -2, 0.7] : [12.6, 14.2, -2, 1.45]);
        setOpacity(sum, wk);
        lift.position.y = M ? 5.6 : 4.6;
      },
      reset() { k = 0; },
    };
  },
};
