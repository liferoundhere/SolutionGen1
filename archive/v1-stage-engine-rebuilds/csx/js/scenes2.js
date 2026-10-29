// CSX wayside briefing scenes, part 2: the fleet, the Blue Ridge, the board, the people,
// what it adds up to, sources and assumptions, and the close.
import * as THREE from 'three';
import {
  C, damp, smooth, clamp01, rr, glowSprite, label, canvasPanel, roundRect, wireBox, gridFloor, points, setOpacity, edgeLines,
  drawTube, arc, person, emissiveMat,
} from './core.js';
import { bridgeBars } from './kit.js';
import {
  V, col, TAGC, RED, GREEN, SENT, LIME, PINK, pill, tag, qmark, track, bungalow, mast, device, flow, pathLine, groundRing,
  sentinelPanel, kpiPanel, infoPanel,
} from './csxkit.js';
import { BLOCKS, SOURCES, ASSUMPTIONS } from './content.js';

function modeLabel(group, pos) {
  const w = pill('WITHOUT CISCO', '#ff5a4a', 0.5, { weight: 800 }); w.position.set(...pos); group.add(w);
  const c = pill('WITH CISCO', '#6cc04a', 0.5, { weight: 800 }); c.position.set(...pos); group.add(c);
  return (k, vis = 1) => { setOpacity(w, (1 - k) * vis); setOpacity(c, k * vis); };
}
function illTag(group, pos, extra = 'scenario') { const t = tag('ILLUSTRATIVE', 0.32, extra); t.position.set(...pos); group.add(t); return t; }

// Wrap text into lines that fit a width on a 2D canvas.
function wrap(g, text, maxW) {
  const words = String(text).split(' '); const lines = []; let line = '';
  words.forEach((w) => { const tst = line ? line + ' ' + w : w; if (g.measureText(tst).width > maxW && line) { lines.push(line); line = w; } else line = tst; });
  if (line) lines.push(line);
  return lines;
}

// ---------------------------------------------------------------------------
// 07 Scenario 6: the fleet. Hundreds of bungalows; some drifted; Catalyst Center
// compliance sweeps the fleet; staged updates turn them green.
export const fleet = {
  id: 'fleet',
  bg: { a: '#0a0802', b: '#2a2408', c: '#e8c13a', mix: [0.2, 0.7, 0.8, 0.3] },
  bgSteps: [null, { a: '#03070f', b: '#0b2440', c: '#00bceb', mix: [0.6, 1, 0.2, 0.4] }, { a: '#020a05', b: '#0a3018', c: '#6cc04a', mix: [0.8, 0.9, 0, 0.4] }],
  cams: [{ p: [-2, 20, 30], t: [-2.4, 0, -6] }, { p: [-2, 21, 30], t: [-2.2, 0.8, -6] }, { p: [-1.5, 21, 31], t: [-2, 1.5, -6] }],
  build() {
    const group = new THREE.Group(); group.position.x = 0;
    group.add(gridFloor(80, 40, C.amber, 0.07));
    const NX = 12, NZ = 7, N = NX * NZ;
    const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1.1, 0.8, 0.9), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }), N);
    const roofs = new THREE.InstancedMesh(new THREE.ConeGeometry(0.8, 0.35, 4).rotateY(Math.PI / 4), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 }), N);
    const m4 = new THREE.Matrix4();
    const cells = [];
    for (let i = 0; i < N; i++) {
      const x = (i % NX) * 2.2 - (NX - 1) * 1.1, z = Math.floor(i / NX) * 2.4 - NZ * 1.2 - 2;
      m4.makeTranslation(x, 0.4, z); mesh.setMatrixAt(i, m4);
      m4.makeTranslation(x, 0.98, z); roofs.setMatrixAt(i, m4);
      const drift = ((i * 37) % 11) < 2;
      cells.push({ x, z, drift, k: 0, g: 0 });
    }
    group.add(mesh, roofs);
    { const c0 = new THREE.Color('#2b3a4c'); for (let i = 0; i < N; i++) { mesh.setColorAt(i, c0); roofs.setColorAt(i, c0); } }
    const cA = new THREE.Color('#1c5a86'), cU = new THREE.Color('#2b3a4c'), cD = new THREE.Color('#fbab18'), cG = new THREE.Color('#6cc04a'), tmp = new THREE.Color();
    const drifted = cells.filter((c) => c.drift);
    const rings = drifted.map((c) => { const r = groundRing(0.95, C.amber, 0); r.position.set(c.x, 0.05, c.z); group.add(r); return r; });
    const qs = [3, 9, 15].map((j) => { const c = drifted[j % drifted.length]; const q = qmark('#ffd95a', 0.8); q.position.set(c.x, 2.0, c.z); group.add(q); return q; });
    // Without: spreadsheets and SSH
    const papers = new THREE.Group(); papers.position.set(5, 0, 7.5); group.add(papers);
    for (let i = 0; i < 5; i++) { const p = wireBox(2.6, 0.04, 1.8, C.amber, 0.12, 0.8); p.position.set(rr(-0.2, 0.2), 0.3 + i * 0.22, rr(-0.2, 0.2)); p.rotation.y = rr(-0.3, 0.3); papers.add(p); }
    const papLb = pill('Spreadsheets and SSH sessions', '#ffd95a', 0.42); papLb.position.set(5, 2.6, 7.5); group.add(papLb);
    const unkLb = pill('Drift unknown until an outage', '#ff9d3a', 0.6); unkLb.position.set(-1, 4.6, -11); group.add(unkLb);
    // With: compliance sweep
    const sweep = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.2, NZ * 2.4 + 2), new THREE.MeshBasicMaterial({ color: C.sky, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    sweep.position.set(0, 1.6, -NZ * 1.2 - 3.2); group.add(sweep);
    const sweepGlow = glowSprite(C.sky, 6, 0); group.add(sweepGlow);
    const cc = infoPanel('Catalyst Center compliance', ['Image', 'Critical security advisories (PSIRT)', 'Running versus startup config'], '#fbbf24', 7.4, 3.4, 'EVERY IE3500, FLEET-WIDE');
    cc.position.set(-1.5, 9.4, -4); cc.rotation.x = -0.35; group.add(cc);
    const cvLb = pill('Cyber Vision · vulnerable OT assets behind each switch', PINK, 0.5); cvLb.position.set(-1, 4.6, -11); group.add(cvLb);
    const stageLb = pill('Staged per maintenance window, with approvals', GREEN, 0.55); stageLb.position.set(-1, 4.6, -11); group.add(stageLb);
    const ev = infoPanel('Evidence report', ['For the CISO', 'For the auditors'], '#6cc04a', 5.4, 2.6);
    ev.position.set(5, 3.4, 7.5); group.add(ev);
    const kpi = kpiPanel([['Time to fix', 'Months', 'Same day'], ['Visibility', 'Sampled', 'Fleet-wide'], ['Truck rolls', 'Many', 'Few']], 6.8, 3.1);
    kpi.position.set(9.5, 9.0, -3); kpi.rotation.set(-0.35, -0.15, 0); group.add(kpi);
    const mode = modeLabel(group, [-7, 6.0, -1]); illTag(group, [-7, 5.2, -1]);
    const st = { k: 0, o: 0 };
    return {
      group,
      update(dt, t, step) {
        st.k = damp(st.k, step >= 1 ? 1 : 0, 3, dt);
        st.o = damp(st.o, step >= 2 ? 1 : 0, 2.5, dt);
        mode(smooth(st.k));
        const sx = ((t * 0.18) % 1) * (NX * 2.2 + 4) - NX * 1.1 - 2;
        sweep.position.x = sx; sweep.material.opacity = st.k * (1 - st.o) * 0.45;
        sweepGlow.position.set(sx, 3.4, -NZ * 1.2 - 2); sweepGlow.material.opacity = st.k * (1 - st.o) * 0.6;
        cells.forEach((c, i) => {
          c.k = damp(c.k, step >= 1 ? 1 : 0, 2 + (i % 5) * 0.4, dt);
          const col0 = step === 0 ? (c.drift ? (Math.sin(t * 2.5 + i) > 0.4 ? cD : cU) : cU) : null;
          if (col0) tmp.copy(col0);
          else {
            tmp.copy(cA);
            if (c.drift) tmp.lerp(cD, c.k);
          }
          const wave = clamp01(st.o * 1.6 - ((c.x + NX * 1.1) / (NX * 2.2)) * 0.6);
          c.g = wave;
          if (step >= 2) tmp.lerp(c.drift ? cG : cA, c.g).lerp(cG, c.drift ? 0 : 0.15 * c.g);
          mesh.setColorAt(i, tmp); roofs.setColorAt(i, tmp);
        });
        mesh.instanceColor.needsUpdate = true; roofs.instanceColor.needsUpdate = true;
        rings.forEach((r, i) => { const c = drifted[i]; r.material.opacity = st.k * (1 - c.g) * (0.5 + 0.4 * Math.sin(t * 4 + i)); r.material.color.setHex(C.amber); });
        qs.forEach((q, i) => setOpacity(q, (1 - st.k) * (0.6 + 0.4 * Math.sin(t * 3 + i))));
        setOpacity(papers, 1 - st.k); setOpacity(papLb, 1 - st.k); setOpacity(unkLb, 1 - st.k);
        papers.children.forEach((p, i) => { p.position.y = 0.3 + i * 0.22 + Math.sin(t * 2 + i) * 0.05; });
        setOpacity(cc, st.k); setOpacity(cvLb, st.k * (1 - st.o)); setOpacity(stageLb, st.o);
        setOpacity(ev, st.o); setOpacity(kpi, st.o);
      },
    };
  },
};

// ---------------------------------------------------------------------------
// 08 Scenario 7: the Blue Ridge. A gorge, the rebuilt line, new bungalows that wait
// for fiber (without) or come up on 5G and call home (with).
const zc = (x) => Math.sin(x * 0.11) * 4.5 - 3;
const hAt = (x, z) => { const d = z - zc(x); const far = d < 0; return (far ? Math.min(7, d * d * 0.06) : Math.min(1.4, d * d * 0.015)) + Math.sin(x * 0.4 + z * 0.3) * 0.3; };
export const helene = {
  id: 'helene',
  bg: { a: '#05040c', b: '#1c1838', c: '#9be7ff', mix: [0.4, 0.3, 0.9, 0.4] },
  bgSteps: [null, { a: '#0a0304', b: '#2c0c12', c: '#e2231a', mix: [0.3, 0.8, 0.7, 0.2] }, { a: '#020a0a', b: '#063028', c: '#2de2c5', mix: [1, 0.6, 0, 0.5] }],
  cams: [{ p: [2, 21, 27], t: [3, 1, -4] }, { p: [2, 20, 26], t: [3, 1, -4] }, { p: [2.5, 21, 27], t: [3.4, 2, -4] }],
  build() {
    const group = new THREE.Group(); group.position.x = 0;
    const geo = new THREE.PlaneGeometry(76, 44, 76, 44); geo.rotateX(-Math.PI / 2);
    const pa = geo.attributes.position;
    for (let i = 0; i < pa.count; i++) { const x = pa.getX(i), z = pa.getZ(i) - 4; pa.setY(i, hAt(x, z)); pa.setZ(i, z); }
    geo.computeVertexNormals();
    const land = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x0a1626, roughness: 0.9, flatShading: true }));
    land.renderOrder = -2;
    group.add(land);
    const wire = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: C.ice, wireframe: true, transparent: true, opacity: 0.035, depthWrite: false }));
    wire.renderOrder = -1;
    group.add(wire);
    const riverPts = [], railPts = [];
    for (let x = -36; x <= 36; x += 2) { riverPts.push(V(x, 0.5, zc(x) + 1.0)); railPts.push(V(x, hAt(x, zc(x) - 1.2) + 0.7, zc(x) - 1.2)); }
    const river = drawTube(new THREE.CatmullRomCurve3(riverPts), { radius: 0.25, color: 0x2a6fb0, seg: 200, opacity: 0.8 }); river.userData.setProgress(1); group.add(river);
    const railCurve = new THREE.CatmullRomCurve3(railPts);
    const rail = drawTube(railCurve, { radius: 0.22, color: 0xffd27a, seg: 240 }); group.add(rail);
    const rain = points(1500, () => [rr(-36, 36), rr(0, 26), rr(-26, 18)], { size: 0.22, color: C.ice, opacity: 0.5 });
    group.add(rain);
    const brLb = pill('Blue Ridge Subdivision · Nolichucky Gorge, NC and TN', '#f5b301', 0.55); brLb.position.set(6, 9.4, -8); group.add(brLb);
    const brTag = tag('PUBLIC', 0.32, 'about 60 miles destroyed, reopened Sep 25, 2025'); brTag.position.set(6, 8.5, -8); group.add(brTag);
    const sites = [-5, 1.5, 8, 14.5].map((x, i) => {
      const z = zc(x) - 3.2, y = hAt(x, z);
      const b = bungalow(2.4, 1.9, 1.9, C.sky, 0.1); b.position.set(x, y, z); group.add(b);
      const q = qmark(RED, 0.8); q.position.set(x, y + 3.1, z); group.add(q);
      const ok = groundRing(1.4, C.green, 0); ok.position.set(x, y + 0.08, z); group.add(ok);
      const glow = glowSprite(C.teal, 3, 0); glow.position.set(x, y + 2.4, z); group.add(glow);
      return { b, q, ok, glow, k: 0, d: i * 0.15, pos: V(x, y + 1.8, z) };
    });
    const towerX = 4.5, towerZ = zc(4.5) - 11, towerY = hAt(towerX, towerZ);
    const tower = mast(7, C.green); tower.position.set(towerX, towerY, towerZ); group.add(tower);
    const beams = sites.map((s) => { const c = arc(V(towerX, towerY + 7, towerZ), s.pos, 3); const f = flow(c, 8, C.green, 0.5); group.add(f); return f; });
    const fiber = drawTube(new THREE.CatmullRomCurve3(railPts.slice(0, 14).map((p) => p.clone().add(V(0, 0.15, -0.8)))), { radius: 0.08, color: C.amber, seg: 120 }); group.add(fiber);
    const waitLb = pill('Fiber not ready · sites wait', '#ff9d3a', 0.55); waitLb.position.set(0, 6.6, -8); group.add(waitLb);
    const specLb = pill('Specialist hand-configures each bungalow', RED, 0.55); specLb.position.set(11, 5.0, -5); group.add(specLb);
    const w1 = pill('IR1101 · 5G first, calls home', GREEN, 0.55); w1.position.set(towerX, towerY + 10.2, towerZ); group.add(w1);
    const w2 = pill('Catalyst Center Plug and Play · site template', '#fbbf24', 0.5); w2.position.set(-1, 5.4, -4); group.add(w2);
    const w3 = pill('ThousandEyes proves the path to the PTC back office', LIME, 0.5); w3.position.set(11, 4.0, -1); group.add(w3);
    const kpi = kpiPanel([['Bring-up', 'Days per site', 'Hours per site'], ['Visibility', 'Per tech', 'Fleet'], ['Who installs', 'Specialist', 'Any tech']], 6, 2.7);
    kpi.position.set(14, 11, -10); group.add(kpi);
    const mode = modeLabel(group, [2.5, 12.6, -12]); const it = illTag(group, [2.5, 11.8, -12], 'future rebuild story');
    const st = { r: 0, a: 0, b: 0 };
    return {
      group,
      update(dt, t, step) {
        st.r = damp(st.r, 1, 0.8, dt);
        st.a = damp(st.a, step >= 1 ? 1 : 0, 3, dt);
        st.b = damp(st.b, step >= 2 ? 1 : 0, 2.5, dt);
        rail.userData.setProgress(st.r * 1.05);
        rain.material.opacity = 0.45 * (1 - st.a); rain.position.y = -((t * 6) % 6);
        setOpacity(brLb, 1 - st.a); setOpacity(brTag, 1 - st.a * 0.7);
        mode(smooth(st.b), st.a); setOpacity(it, st.a);
        sites.forEach((s, i) => {
          s.k = damp(s.k, st.b > clamp01(s.d) ? 1 : 0, 3, dt);
          s.b.visible = st.a > 0.01; setOpacity(s.b, st.a);
          s.b.userData.box.userData.lines.material.color.setHex(st.b > 0.5 ? C.teal : 0x5b6b7c);
          setOpacity(s.q, st.a * (1 - st.b) * (0.6 + 0.4 * Math.sin(t * 3 + i)));
          s.ok.material.opacity = s.k * 0.8; s.ok.scale.setScalar(1 + 0.1 * Math.sin(t * 3 + i));
          s.glow.material.opacity = s.k * 0.7;
          beams[i].userData.update(t + i * 0.2, s.k * st.b, 0.3);
        });
        setOpacity(tower, st.b * 0.9 + 0.1);
        fiber.userData.setProgress(st.a * (1 - st.b) * 0.55);
        setOpacity(waitLb, st.a * (1 - st.b)); setOpacity(specLb, st.a * (1 - st.b));
        [w1, w2, w3, kpi].forEach((o) => setOpacity(o, st.b));
      },
      reset() { st.r = 0; },
    };
  },
};

// ---------------------------------------------------------------------------
// 09 Scenario 8: the board. Paper and slides become a live inventory, then one view.
export const tsa = {
  id: 'tsa',
  bg: { a: '#0a0603', b: '#2a1606', c: '#ff9d3a', mix: [0.3, 0.9, 0, 0.3] },
  bgSteps: [null, { a: '#06050a', b: '#2a2208', c: '#ffd95a', mix: [1, 0.6, 0, 0.6] }, { a: '#03060f', b: '#0b2440', c: '#00bceb', mix: [1, 0.7, 0.2, 0.5] }],
  cams: [{ p: [0, 10, 23], t: [3, 4.5, -2] }, { p: [1, 11, 23], t: [3.5, 5.5, -2] }, { p: [2, 12, 25], t: [4, 6.5, -2] }],
  build() {
    const group = new THREE.Group(); group.position.x = 5;
    group.add(gridFloor(60, 30, C.amber, 0.08));
    const table = new THREE.Mesh(new THREE.BoxGeometry(11, 0.3, 3.6), new THREE.MeshStandardMaterial({ color: 0x0c1a2c, emissive: C.amber, emissiveIntensity: 0.08, roughness: 0.6 }));
    table.position.set(0, 1.6, 0); group.add(table); { const e = edgeLines(table.geometry, C.amber, 0.5); e.position.copy(table.position); group.add(e); }
    for (let i = 0; i < 8; i++) { const p = person(C.ice, 1.3); const sx = (i % 4) * 2.8 - 4.2; p.position.set(sx, 0, i < 4 ? 2.8 : -2.8); group.add(p); }
    const slides = [];
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) { const f = wireBox(3.4, 1.9, 0.06, 0xffc27a, 0.08, 0.8); f.position.set((c - 1) * 3.8, 5.2 + r * 2.3, -6); group.add(f); slides.push(f); }
    const papers = [];
    for (let i = 0; i < 9; i++) { const p = wireBox(1.3, 0.03, 0.9, 0xffc27a, 0.2, 0.8); p.userData.home = V(rr(-3.5, 3.5), 1.8 + i * 0.05, rr(-0.8, 0.8)); p.userData.up = V((i % 3 - 1) * 2, 8.5 + Math.floor(i / 3) * 0.6, -1); p.position.copy(p.userData.home); group.add(p); papers.push(p); }
    const handLb = pill('Asset lists assembled by hand · board briefed from slides', '#ff9d3a', 0.42); handLb.position.set(0, 10.4, -6); group.add(handLb);
    const tsaLb = pill('TSA SD 1580-21-01E · SD 1580/82-2022-01E', '#ffd95a', 0.42); tsaLb.position.set(-4.6, 12.4, -6); group.add(tsaLb);
    const tsaTag = tag('PUBLIC', 0.3, 'TSA security directives'); tsaTag.position.set(-4.6, 11.6, -6); group.add(tsaTag);
    const gc = infoPanel('Cyber Vision Global Center', ['Live OT inventory, all sites', 'Vulnerability posture', 'Zones and conduits (ISE TrustSec)'], PINK, 6.4, 3.0, 'LIVE, NOT SAMPLED');
    gc.position.set(0, 7.4, -2); group.add(gc);
    const cols = [];
    for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 0.5), emissiveMat(i % 3 ? C.sky : C.green, 1.2)); m.position.set((i - 6.5) * 0.9, 3, -6); group.add(m); cols.push(m); }
    const topo = canvasPanel(5.2, 3.0, (g, W, H) => {
      g.fillStyle = 'rgba(5,14,32,0.92)'; roundRect(g, 4, 4, W - 8, H - 8, 26); g.fill(); g.strokeStyle = '#c084fc'; g.lineWidth = 4; g.stroke();
      g.fillStyle = '#c084fc'; g.font = `700 ${H * 0.085}px Inter, Arial`; g.textBaseline = 'middle'; g.fillText('Cisco Cloud Control', 30, H * 0.15);
      g.fillStyle = '#9fb3c8'; g.font = `600 ${H * 0.05}px "JetBrains Mono", monospace`; g.fillText('ONE INVENTORY · ONE TOPOLOGY', 30, H * 0.27);
      const nodes = [[0.5, 0.5], [0.25, 0.68], [0.75, 0.68], [0.15, 0.88], [0.35, 0.88], [0.65, 0.88], [0.85, 0.88], [0.5, 0.36]];
      g.strokeStyle = 'rgba(192,132,252,0.6)'; g.lineWidth = 3;
      [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [0, 7]].forEach(([a, b]) => { g.beginPath(); g.moveTo(nodes[a][0] * W, nodes[a][1] * H); g.lineTo(nodes[b][0] * W, nodes[b][1] * H); g.stroke(); });
      nodes.forEach(([x, y], i) => { g.fillStyle = i === 0 ? '#c084fc' : '#00bceb'; g.beginPath(); g.arc(x * W, y * H, H * 0.03, 0, Math.PI * 2); g.fill(); });
    }, 220);
    topo.position.set(-6, 9.6, -3); topo.rotation.y = 0.2; group.add(topo);
    const sent = sentinelPanel(5.8, 3.0); sent.position.set(6.3, 9.8, -3); sent.rotation.y = -0.2; group.add(sent);
    sent.userData.redraw([['Workbook', 'TSA reporting timeline', SENT], ['Workbook', 'CISA reporting timeline', SENT], ['Incidents', 'Tracked with OT context', PINK]], 3);
    const kpi = kpiPanel([['Cadence', 'Quarterly', 'Continuous'], ['Visibility', 'Sampled', 'Full fleet'], ['Evidence', 'Manual', 'Automated']], 5.8, 2.7);
    kpi.position.set(6.3, 5.6, -1); kpi.rotation.y = -0.2; group.add(kpi);
    const mode = modeLabel(group, [4.6, 12.4, -6]); illTag(group, [4.6, 11.6, -6]);
    const st = { k: 0, o: 0 };
    return {
      group,
      update(dt, t, step) {
        st.k = damp(st.k, step >= 1 ? 1 : 0, 2.5, dt);
        st.o = damp(st.o, step >= 2 ? 1 : 0, 3, dt);
        const w = 1 - st.k;
        mode(smooth(st.k));
        slides.forEach((f, i) => { f.rotation.z = Math.sin(t * 2 + i) * 0.04 * w; setOpacity(f, w * 0.9 + 0.05); });
        papers.forEach((p, i) => {
          p.position.lerpVectors(p.userData.home, p.userData.up, smooth(st.k));
          p.rotation.set(Math.sin(t + i) * 0.1 * w, i * 0.3 + st.k * 2, 0);
          setOpacity(p, 1 - smooth(clamp01(st.k * 1.4 - 0.4)));
        });
        setOpacity(handLb, w);
        setOpacity(gc, smooth(clamp01(st.k * 1.5 - 0.4)));
        cols.forEach((m, i) => { const h = 0.05 + st.k * (1.2 + Math.abs(Math.sin(t * 1.3 + i * 0.7)) * 2.4); m.scale.y = h; m.position.y = 3.4 + h / 2; m.visible = st.k > 0.02; });
        setOpacity(topo, st.o); setOpacity(sent, st.o); setOpacity(kpi, st.o);
      },
    };
  },
};

// ---------------------------------------------------------------------------
// 10 The people (focus layout): seven persona tiles orbit a bungalow; each click
// pulls one forward.
export const people = {
  id: 'people',
  bg: { a: '#08030c', b: '#2a0c2a', c: '#f25c9a', mix: [1, 0.3, 0.1, 0.7] },
  cams: [{ p: [2, 3, 30], t: [6, 1, 0] }],
  build() {
    const group = new THREE.Group(); group.position.x = 7;
    const core = new THREE.Group(); group.add(core);
    const b = bungalow(2.6, 2.0, 2.0, C.ice, 0.1); b.position.y = -1.2; core.add(b);
    const halo = glowSprite(C.pink, 12, 0.4); core.add(halo);
    const tiles = BLOCKS.map((bk, i) => {
      const tile = canvasPanel(5.2, 2.2, (g, w, h) => {
        g.fillStyle = 'rgba(4,10,26,0.9)'; roundRect(g, 6, 6, w - 12, h - 12, 28); g.fill();
        g.strokeStyle = bk.color; g.lineWidth = 6; g.stroke();
        g.fillStyle = bk.color; g.beginPath(); g.arc(h * 0.36, h * 0.5, h * 0.22, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#04101e'; g.font = `800 ${h * 0.16}px Inter, Arial`; g.textAlign = 'center'; g.textBaseline = 'middle';
        const ini = bk.label.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).slice(0, 2).map((x) => x[0]).join('').toUpperCase();
        g.fillText(ini, h * 0.36, h * 0.52); g.textAlign = 'left';
        g.fillStyle = '#ffffff'; g.font = `700 ${h * 0.15}px Inter, Arial`; g.fillText(bk.label, h * 0.7, h * 0.4);
        const pub = bk.hint.startsWith('PUBLIC');
        g.fillStyle = pub ? TAGC.PUBLIC : TAGC.MODELED; g.font = `700 ${h * 0.11}px "JetBrains Mono", monospace`; g.fillText(bk.hint.toUpperCase(), h * 0.7, h * 0.66);
      }, 200);
      const ang = (i / BLOCKS.length) * Math.PI * 2;
      tile.userData = { ang, k: 0, glow: glowSprite(col(bk.color), 9, 0) };
      tile.add(tile.userData.glow); tile.userData.glow.position.z = -0.2;
      group.add(tile);
      return tile;
    });
    const rings = BLOCKS.map((bk, i) => {
      const r = new THREE.Mesh(new THREE.TorusGeometry(2.8 + i * 0.4, 0.04, 6, 140), new THREE.MeshBasicMaterial({ color: col(bk.color), transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }));
      r.rotation.set(rr(-1, 1), rr(-1, 1), 0); r.userData.spin = V(rr(-0.5, 0.5), rr(-0.5, 0.5), 0); core.add(r); return r;
    });
    let feed = 0;
    return {
      group,
      update(dt, t, step) {
        const focus = step - 1;
        feed = damp(feed, Math.max(0, step), 2.5, dt);
        b.rotation.y = t * 0.3;
        rings.forEach((r, i) => { const on = clamp01(feed - i); r.scale.setScalar(Math.max(0.001, smooth(on))); r.visible = on > 0.01; r.rotation.x += r.userData.spin.x * dt; r.rotation.y += r.userData.spin.y * dt; });
        tiles.forEach((tl, i) => {
          const u = tl.userData; const isF = i === focus;
          u.k = damp(u.k, isF ? 1 : 0, 4, dt);
          const a = u.ang + t * 0.08;
          const ox = Math.cos(a) * 10.5, oy = Math.sin(a * 2) * 0.6 + Math.sin(a) * 3.2, oz = Math.sin(a) * 5.5 - 1;
          tl.position.set(ox + (0 - ox) * u.k, oy + (0 - oy) * u.k, oz + (9 - oz) * u.k);
          tl.scale.setScalar(0.8 + u.k * 0.75);
          tl.lookAt(group.position.x + tl.position.x * 0.2, group.position.y + tl.position.y * 0.2, group.position.z + 40);
          tl.material.opacity = focus < 0 ? 1 : isF ? 1 : i < focus ? 0.55 : 0.32;
          u.glow.material.opacity = u.k * 0.6;
        });
      },
    };
  },
};

// ---------------------------------------------------------------------------
// 11 What it adds up to: the bungalow at the center, Cisco pieces around it, and the
// documented paths into Sentinel (solid) versus patterns to validate (dashed).
export const adds = {
  id: 'adds',
  bg: { a: '#020611', b: '#0a1f4a', c: '#5aa0ff', mix: [0.8, 0.6, 0.7, 0.5] },
  bgSteps: [null, { a: '#020814', b: '#08284a', c: '#00bceb', mix: [1, 0.6, 0.5, 0.5] }, { a: '#06050a', b: '#22200a', c: '#fbbf24', mix: [0.8, 0.6, 0.3, 0.5] }],
  cams: [{ p: [3, 10, 29], t: [3.5, 4.5, -1] }, { p: [3, 12, 30], t: [3.5, 6, -1] }, { p: [3, 12, 30], t: [3.5, 6, -1] }],
  build() {
    const group = new THREE.Group(); group.position.x = 3;
    group.add(gridFloor(70, 35, C.sky, 0.08));
    const bung = bungalow(5, 3.4, 3.4, C.sky, 0.08); bung.position.set(-2, 0, 0); group.add(bung);
    const ie = device('IE3500', 0x22d3ee, 1.6, 0.6, 0.4, 0.32); ie.position.set(-3.1, 1.9, 1.75); group.add(ie);
    const ir = device('IR1101', 0x34d399, 1.6, 0.6, 0.4, 0.32); ir.position.set(-0.9, 1.9, 1.75); group.add(ir);
    const cvRing = groundRing(3.6, col(PINK), 0.6); cvRing.position.set(-2, 0.1, 0); group.add(cvRing);
    const cvLb = pill('Cyber Vision sensor in both · no appliance per site', PINK, 0.38); cvLb.position.set(-2, 5.4, 0.6); group.add(cvLb);
    const teLb = pill('ThousandEyes agent on the IR1101', LIME, 0.36); teLb.position.set(-0.4, 4.5, 1.2); group.add(teLb);
    const sent = sentinelPanel(6.4, 3.6); sent.position.set(10.5, 10.8, -3); sent.rotation.y = -0.25; group.add(sent);
    const rowsDoc = [['ISE', 'Sentinel ISE solution, syslog', '#60a5fa'], ['Cyber Vision', 'CEF via AMA connector', PINK], ['XDR', 'Incident and findings export', '#fb7185'], ['ThousandEyes', 'Custom webhook ingestion', LIME]];
    const sIn = V(7.6, 10.4, -2.2);
    const nodes = [
      ['Cisco ISE', '#60a5fa', V(-6.5, 7.5, -3), false, 'ISE solution'],
      ['Cyber Vision Center', PINK, V(-3.5, 10.6, -4), false, 'CEF via AMA'],
      ['Cisco XDR', '#fb7185', V(1.5, 12.2, -4.5), false, 'Incident export'],
      ['ThousandEyes', LIME, V(4.4, 6.6, 1), false, 'Webhook'],
      ['Device syslog', '#93c5fd', V(-2, 3.6, 0), false, 'IOS XE syslog'],
      ['Catalyst Center', '#fbbf24', V(4, 2.6, 4), true, 'Pattern to validate'],
      ['Cloud Control', '#c084fc', V(11, 3.2, 3), true, 'Studio, to validate'],
    ].map(([n, c, p, pattern, how]) => {
      const nd = n === 'Device syslog' ? null : device(n, c, 2.2, 0.9, 0.5, 0.34);
      if (nd) { nd.position.copy(p); group.add(nd); }
      const curve = arc(p.clone().add(V(0, 0.6, 0)), sIn, pattern ? 2.5 : 4);
      const line = pathLine(curve, col(c), 0, pattern); group.add(line);
      const f = pattern ? null : flow(curve, 12, col(c), 0.5); if (f) group.add(f);
      const mid = curve.getPointAt(n === 'Cisco ISE' ? 0.62 : 0.38);
      const lb = label(how, { size: 0.3, color: c, bg: 'rgba(3,10,22,0.85)', mono: true }); lb.position.copy(mid).add(V(0, 0.6, 0)); group.add(lb);
      return { nd, line, f, lb, pattern };
    });
    const valLb = pill('Patterns to validate, not documented connectors', '#fbbf24', 0.34); valLb.position.set(9.2, 7.0, 2.5); group.add(valLb);
    const st = { a: 0, b: 0, c: 0, lit: -1 };
    return {
      group,
      update(dt, t, step) {
        st.a = damp(st.a, 1, 2, dt);
        st.b = damp(st.b, step >= 1 ? 1 : 0, 3, dt);
        st.c = damp(st.c, step >= 2 ? 1 : 0, 3, dt);
        cvRing.material.opacity = 0.4 + 0.3 * Math.sin(t * 3); cvRing.scale.setScalar(1 + 0.04 * Math.sin(t * 2));
        [ie, ir].forEach((d, i) => { d.userData.mat.emissiveIntensity = 0.5 + 0.4 * Math.sin(t * 3 + i); });
        setOpacity(cvLb, 1 - st.b * 0.6); setOpacity(teLb, 1 - st.b * 0.6);
        nodes.forEach((n, i) => {
          const vis = n.pattern ? st.c : st.b;
          if (n.nd) setOpacity(n.nd, 0.25 + 0.75 * (n.pattern ? st.c : st.b));
          n.line.material.opacity = vis * (n.pattern ? 0.9 : 0.5);
          if (n.f) n.f.userData.update(t + i * 0.3, vis, 0.3);
          setOpacity(n.lb, vis);
        });
        setOpacity(valLb, st.c);
        setOpacity(sent, 0.3 + st.b * 0.7);
        const lit = step >= 1 ? 4 : 0;
        if (lit !== st.lit) { st.lit = lit; sent.userData.redraw(rowsDoc, lit); }
      },
      reset() { st.lit = -1; },
    };
  },
};

// ---------------------------------------------------------------------------
// 12 Sources and assumptions: five source cards by group, then six assumption cards
// come forward, verbatim from the original briefing.
export const sources = {
  id: 'sources',
  bg: { a: '#03050a', b: '#141c2a', c: '#9be7ff', mix: [0.4, 0.5, 0, 0.8] },
  bgSteps: [null, { a: '#07040a', b: '#24122a', c: '#f25c9a', mix: [0.6, 0.5, 0, 0.8] }],
  cams: [{ p: [0, 6, 25], t: [4, 5.6, 0] }, { p: [0, 6, 24], t: [4, 5.6, 0] }],
  build() {
    const group = new THREE.Group(); group.position.x = 4;
    const groups = {};
    SOURCES.forEach((s) => { (groups[s[2]] = groups[s[2]] || []).push(s[0]); });
    const gc = { CSX: '#00bceb', 'Rail and PTC': '#2de2c5', 'Regulatory and threat': '#fbab18', Cisco: '#6cc04a', 'Microsoft Sentinel': '#5aa0ff' };
    const keys = Object.keys(groups);
    const cards = keys.map((k, i) => {
      const list = groups[k];
      const card = canvasPanel(5.4, 5.2, (g, W, H) => {
        g.fillStyle = 'rgba(5,14,32,0.92)'; roundRect(g, 4, 4, W - 8, H - 8, 26); g.fill();
        g.strokeStyle = gc[k]; g.lineWidth = 4; g.stroke(); g.textBaseline = 'middle';
        g.fillStyle = gc[k]; g.font = `700 ${H * 0.06}px Inter, Arial`; g.fillText(k, 28, H * 0.08);
        g.fillStyle = '#9fb3c8'; g.font = `600 ${H * 0.036}px "JetBrains Mono", monospace`; g.fillText(`${list.length} PUBLIC SOURCES`, 28, H * 0.15);
        g.fillStyle = '#dce8f5'; g.font = `500 ${H * 0.031}px Inter, Arial`;
        let y = H * 0.23;
        for (const s of list) { const ls = wrap(g, s, W - 64); for (const l of ls.slice(0, 2)) { if (y > H * 0.95) break; g.fillText(l, 40, y); y += H * 0.043; } y += H * 0.012; if (y > H * 0.95) break; }
      }, 300);
      const col3 = i % 3, row = Math.floor(i / 3);
      card.userData.home = V((col3 - 1) * 5.9 + (row ? 2.95 : 0), 8.6 - row * 5.5, 0);
      card.position.copy(card.userData.home); group.add(card);
      return card;
    });
    const picks = [2, 3, 5, 6, 10, 11];
    const acards = picks.map((idx, j) => {
      const text = ASSUMPTIONS[idx];
      const c = canvasPanel(6.2, 2.7, (g, W, H) => {
        g.fillStyle = 'rgba(8,10,28,0.95)'; roundRect(g, 4, 4, W - 8, H - 8, 22); g.fill();
        g.strokeStyle = '#f25c9a'; g.lineWidth = 4; g.stroke(); g.textBaseline = 'middle';
        g.fillStyle = '#f25c9a'; g.font = `700 ${H * 0.085}px "JetBrains Mono", monospace`; g.fillText(`ASSUMPTION ${String(idx + 1).padStart(2, '0')} OF ${ASSUMPTIONS.length}`, 26, H * 0.14);
        g.fillStyle = '#eef3fb'; g.font = `500 ${H * 0.072}px Inter, Arial`;
        const ls = wrap(g, text, W - 52); ls.slice(0, 6).forEach((l, n) => g.fillText(l, 26, H * 0.3 + n * H * 0.115));
      }, 240);
      c.userData.home = V((j % 2 ? 3.4 : -3.4), 9.4 - Math.floor(j / 2) * 3.0, 4);
      group.add(c); return c;
    });
    const st = { k: 0 };
    return {
      group,
      update(dt, t, step) {
        st.k = damp(st.k, step >= 1 ? 1 : 0, 3, dt);
        cards.forEach((c, i) => {
          c.position.set(c.userData.home.x, c.userData.home.y + Math.sin(t * 0.8 + i) * 0.08, -st.k * 6);
          setOpacity(c, 1 - st.k * 0.8);
        });
        acards.forEach((c, j) => {
          const k = smooth(clamp01(st.k * 2 - j * 0.15));
          c.position.set(c.userData.home.x, c.userData.home.y - (1 - k) * 2, c.userData.home.z - (1 - k) * 4);
          setOpacity(c, k);
        });
      },
    };
  },
};

// ---------------------------------------------------------------------------
// 13 Hero close: the bridge bars return over a ring of bungalows; every beam bends
// toward Jacksonville at the center. Step 1: an audio-wave floor answers.
export const close = {
  id: 'close',
  bg: { a: '#01040b', b: '#062a4d', c: '#00bceb', mix: [1, 0.6, 0, 0.5] },
  bgSteps: [null, { a: '#02070a', b: '#0c2a24', c: '#6cc04a', mix: [1, 0.6, 0.2, 0.6] }],
  cams: [{ p: [0, 14, 40], t: [0, 6, 0] }, { p: [0, 14.5, 42], t: [0, 6.2, 0] }],
  build() {
    const group = new THREE.Group();
    group.add(gridFloor(220, 110, C.sky, 0.12));
    const bars = bridgeBars({ spacing: 2.0, unit: 2.4, radius: 0.42 });
    const lift = new THREE.Group(); lift.position.y = 12; lift.add(bars); group.add(lift);
    const center = V(0, 12, 0);
    const ringN = 16; const beams = [];
    for (let i = 0; i < ringN; i++) {
      const a = (i / ringN) * Math.PI * 2, r = 22;
      const p = V(Math.cos(a) * r, 0, Math.sin(a) * r - 6);
      const b = bungalow(1.8, 1.4, 1.4, C.sky, 0.04); b.position.copy(p); b.rotation.y = -a; setOpacity(b, 0.45); group.add(b);
      const c = new THREE.QuadraticBezierCurve3(p.clone().add(V(0, 1.8, 0)), V(p.x * 0.5, 16, p.z * 0.5), center.clone().add(V(0, 2.5, -2)));
      const f = flow(c, 10, C.teal, 0.45); group.add(f);
      beams.push({ f, b });
    }
    const wave = [];
    for (let i = 0; i < 64; i++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1, 0.18), emissiveMat(i % 2 ? C.sky : C.green, 1.4));
      m.position.set((i - 31.5) * 0.6, 0, 16); group.add(m); wave.push(m);
    }
    let k = 0, wk = 0;
    return {
      group,
      update(dt, t, step) {
        k = damp(k, 1, 1.4, dt); wk = damp(wk, step >= 1 ? 1 : 0, 2, dt);
        bars.userData.setHeights(smooth(k), t);
        beams.forEach((b, i) => { b.f.userData.update(t + i * 0.13, smooth(k) * 0.9, 0.25); b.f.material.color.setHex(wk > 0.5 ? C.green : C.teal); });
        wave.forEach((m, i) => { const h = 0.1 + wk * (0.4 + Math.abs(Math.sin(t * 3 + i * 0.35) * Math.sin(i * 0.12 + t)) * 2.4); m.scale.y = h; m.position.y = h / 2; });
      },
      reset() { k = 0; },
    };
  },
};
