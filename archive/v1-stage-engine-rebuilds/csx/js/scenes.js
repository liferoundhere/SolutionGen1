// CSX wayside briefing scenes, part 1: open, network, wayside, and the first four scenarios.
// Contract (see references/stage-engine.md):
//   { id, bg, bgSteps?, cams: [{ p, t }...one per step], build() -> { group, update(dt, t, step), reset?, leave? } }
// Scenario scenes: step 0 is "Without Cisco" (warm sky, blind spots), step 1 is "With Cisco" (cool sky, telemetry to Sentinel).
import * as THREE from 'three';
import {
  C, damp, smooth, clamp01, rr, glowSprite, label, wireBox, gridFloor, points, setOpacity, edgeLines, drawTube, arc, person,
} from './core.js';
import { bridgeBars } from './kit.js';
import {
  V, col, TAGC, RED, GREEN, SENT, LIME, PINK, pill, tag, qmark, track, bungalow, signalMast, mast, radioRings, device, flow,
  pathLine, groundRing, laptop, truck, train, sentinelPanel, kpiPanel, infoPanel,
} from './csxkit.js';
import { STATES, CORRIDORS, PLACES } from './mapdata.js';

export * from './scenes2.js';

// The engine's workshop panel reads this; this deck has no workshop.
export const workshopState = { filled: new Array(8).fill(0), timer: 0 };

const SKY = {
  red: { a: '#0a0204', b: '#3a0a10', c: '#e2231a', mix: [0.5, 1, 0.3, 0.2] },
  teal: { a: '#02080a', b: '#06302a', c: '#2de2c5', mix: [1, 0.6, 0.2, 0.4] },
};

// ---------------------------------------------------------------------------
// 00 Hero: a main line runs to the horizon, every bungalow along it sends a beam of
// telemetry up, and the Cisco bridge bars rise where the rails meet the sky.
export const open = {
  id: 'open',
  bg: { a: '#01040b', b: '#062a4d', c: '#00bceb', mix: [1, 0.6, 0, 0.5] },
  cams: [{ p: [0, 8, 34], t: [0, 4.5, -20] }],
  build() {
    const group = new THREE.Group();
    group.add(gridFloor(260, 130, C.sky, 0.1));
    const rails = track(-260, 30, { color: C.sky, gauge: 1.6, opacity: 0.55 });
    rails.rotation.y = Math.PI / 2; group.add(rails);
    const bars = bridgeBars({ spacing: 3.2, unit: 4.2, radius: 0.7 });
    bars.position.set(0, 27, -80); bars.traverse((n) => { if (n.material) n.material.fog = false; }); group.add(bars);
    const halo = glowSprite(C.sky, 90, 0.28); halo.position.set(0, 33, -90); group.add(halo);
    const sites = [];
    for (let i = 0; i < 14; i++) {
      const side = i % 2 ? 1 : -1;
      const z = 8 - i * 13;
      const b = bungalow(2.6, 2.0, 2.0, C.sky, 0.08);
      b.position.set(side * (6 + (i % 3)), 0, z); group.add(b);
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1, 6), new THREE.MeshBasicMaterial({ color: C.teal, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false }));
      beam.position.set(b.position.x, 0, z); group.add(beam);
      const tip = glowSprite(C.teal, 2.2, 0.8); tip.position.set(b.position.x, 2.6, z); group.add(tip);
      sites.push({ beam, tip, z, d: i * 0.18 });
    }
    const dust = points(1200, () => [rr(-80, 80), rr(0, 40), rr(-200, 20)], { size: 0.3, color: C.sky, opacity: 0.45 });
    group.add(dust);
    let k = 0;
    return {
      group,
      update(dt, t) {
        k = damp(k, 1, 1.2, dt);
        bars.userData.setHeights(smooth(k), t);
        sites.forEach((s, i) => {
          const h = 1 + smooth(k * 2 - s.d) * (10 + 4 * Math.sin(t * 1.5 + i));
          s.beam.scale.y = h; s.beam.position.y = h / 2 + 2;
          s.tip.position.y = 2.2 + h; s.tip.material.opacity = 0.5 + 0.4 * Math.sin(t * 3 + i);
        });
        dust.rotation.y = Math.sin(t * 0.05) * 0.05;
      },
      reset() { k = 0; },
    };
  },
};

// ---------------------------------------------------------------------------
// 01 Network map: the eastern states, schematic corridors (modeled), Jacksonville,
// pressure points, then the unmonitored wayside sites in red.
const proj = (lon, lat) => [(lon + 80.5) * 1.215, -(lat - 35.5) * 1.5];
export const network = {
  id: 'network',
  bg: { a: '#03060c', b: '#1a1406', c: '#fbab18', mix: [0.3, 0.9, 0, 0.6] },
  bgSteps: [null, { a: '#02060f', b: '#0a2440', c: '#00bceb', mix: [0.6, 0.9, 0, 0.6] }, { a: '#05040c', b: '#221238', c: '#a78bfa', mix: [0.8, 0.6, 0, 0.6] }, { a: '#0a0306', b: '#2a0a0e', c: '#e2231a', mix: [0.5, 1, 0, 0.4] }],
  cams: [
    { p: [1, 34, 25], t: [0.5, 0, -1] },
    { p: [7, 17, 21], t: [8.2, 0, 6] },
    { p: [3, 25, 18], t: [1.5, 0, -3] },
    { p: [1, 36, 27], t: [0.5, 0, -1] },
  ],
  build() {
    const group = new THREE.Group(); group.position.x = 6;
    const map = new THREE.Group(); group.add(map);
    const fillMat = new THREE.MeshBasicMaterial({ color: 0x0b2a4a, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide });
    const lineMat = new THREE.LineBasicMaterial({ color: C.sky, transparent: true, opacity: 0.45 });
    STATES.forEach((poly) => {
      const pts = poly.map(([lo, la]) => { const [x, z] = proj(lo, la); return new THREE.Vector2(x, -z); });
      const shape = new THREE.Shape(pts);
      const m = new THREE.Mesh(new THREE.ShapeGeometry(shape), fillMat); m.rotation.x = -Math.PI / 2; m.position.y = -0.05; m.renderOrder = -2; map.add(m);
      const lg = new THREE.BufferGeometry().setFromPoints(poly.map(([lo, la]) => { const [x, z] = proj(lo, la); return V(x, 0, z); }));
      { const ll = new THREE.LineLoop(lg, lineMat); ll.renderOrder = -1; map.add(ll); }
    });
    const corridors = CORRIDORS.map((c) => {
      const pts = c.pts.map(([lo, la]) => { const [x, z] = proj(lo, la); return V(x, 0.12, z); });
      const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.2);
      const color = c.special === 'blueridge' ? 0xf43f5e : 0xf5b301;
      const tube = drawTube(curve, { radius: c.main ? 0.11 : 0.07, color, seg: 160, opacity: c.main ? 0.95 : 0.7 });
      map.add(tube);
      return { tube, curve, c };
    });
    const P = Object.fromEntries(PLACES.map((p) => [p.id, p]));
    const at = (id, y = 0.3) => { const [x, z] = proj(...P[id].ll); return V(x, y, z); };
    // Yards: small gold dots, a few named.
    const yards = PLACES.filter((p) => p.kind === 'yard').map((p) => {
      const s = glowSprite(0xfacc15, 1.1, 0.9); s.position.copy(at(p.id)); map.add(s); return s;
    });
    const yardLabels = [['waycross', 'Rice Yard, Waycross', [-3.2, 0, 0.2]], ['selkirk', 'Selkirk Yard', [0, 0, -1]], ['nwoh', 'NW Ohio Intermodal', [-1, 0, -1]], ['cumberland', 'Cumberland Yard', [0.6, 0, 0.9]]].map(([id, n, o]) => {
      const l = label(n, { size: 0.42, color: '#fde68a', bg: 'rgba(3,10,22,0.75)' }); l.position.copy(at(id, 1.1)).add(V(...o)); map.add(l); return l;
    });
    // Jacksonville trio (PUBLIC).
    const jax = at('hq', 0.3);
    const jaxGlow = glowSprite(C.sky, 3, 0.9); jaxGlow.position.copy(jax); map.add(jaxGlow);
    const jaxRing = groundRing(1, C.sky, 0.8); jaxRing.position.copy(jax); map.add(jaxRing);
    const jaxLabels = [['CSX Headquarters · 500 Water St', '#38bdf8'], ['West JAX command center', '#f59e0b'], ['CSX data center · Southpoint Pkwy', '#06b6d4']].map(([n, c], i) => {
      const l = pill(n, c, 0.42); l.position.copy(jax).add(V(2.6 + l.scale.x / 2, 2.8 + i * 1.05, 0)); map.add(l); return l;
    });
    const jaxTag = tag('PUBLIC', 0.3, 'Jacksonville'); jaxTag.position.copy(jax).add(V(2.2 + jaxTag.scale.x / 2, 1.6, 0)); map.add(jaxTag);
    const jaxStem = pathLine(new THREE.LineCurve3(jax.clone(), jax.clone().add(V(2.4, 4.6, 0))), C.sky, 0.7); map.add(jaxStem);
    // Pressure points.
    const br = at('blueridge'), hst = at('hst');
    const brRing = groundRing(1, 0xf43f5e, 0.9, 0.06); brRing.position.copy(br); map.add(brRing);
    const hstRing = groundRing(1, C.amber, 0.9, 0.06); hstRing.position.copy(hst); map.add(hstRing);
    const brLb = pill('Blue Ridge Sub · Helene, about 60 miles', '#f43f5e', 0.42); brLb.position.copy(br).add(V(-brLb.scale.x / 2 - 0.6, 1.8, 0)); map.add(brLb);
    const hstLb = pill('Howard Street Tunnel · double-stack, May 2026', '#fbab18', 0.42); hstLb.position.copy(hst).add(V(0.2, 2.2, -1.2)); map.add(hstLb);
    const presTag = tag('PUBLIC', 0.3, 'CSX.com, Trains'); presTag.position.copy(br).add(V(-presTag.scale.x / 2 - 0.6, 0.9, 0)); map.add(presTag);
    // Unmonitored wayside sites along the corridors (MODELED markers).
    const siteN = 150; const sitePos = [];
    for (let i = 0; i < siteN; i++) { const c = corridors[i % corridors.length]; sitePos.push(c.curve.getPointAt(((i * 0.618) % 1))); }
    const sites = points(siteN, (i) => [sitePos[i].x, 0.3, sitePos[i].z], { size: 0.9, color: 0xff3b30, opacity: 0 });
    map.add(sites);
    const siteLb = pill('Without: unmonitored wayside sites', RED, 0.5); siteLb.position.set(6, 1.4, 9); map.add(siteLb);
    const siteTag = tag('MODELED', 0.3, 'site markers'); siteTag.position.set(6, 0.5, 9); map.add(siteTag);
    const tsaLb = pill('TSA SD 1580-21-01E · SD 1580/82-2022-01E', '#ff9d3a', 0.42); tsaLb.position.copy(jax).add(V(4.6, 4.2, -3)); map.add(tsaLb);
    const cisaLb = pill('CISA ICSA-25-191-10 · rail RF protocol', '#ff9d3a', 0.42); cisaLb.position.copy(jax).add(V(4.6, 3.1, -3)); map.add(cisaLb);
    const corTag = tag('MODELED', 0.32, 'schematic corridors'); corTag.position.set(-7.5, 0.8, 15.5); map.add(corTag);
    const states = label('26 states · DC · Ontario · Quebec', { size: 0.5, color: '#fde68a', bg: 'rgba(3,10,22,0.75)' }); states.position.set(9, 1.2, -16); map.add(states);
    const statesTag = tag('PUBLIC', 0.3, 'FY2025 10-K'); statesTag.position.set(9, 0.35, -16); map.add(statesTag);
    const st = { draw: 0, j: 0, p: 0, w: 0 };
    return {
      group,
      update(dt, t, step) {
        st.draw = damp(st.draw, 1, 0.9, dt);
        st.j = damp(st.j, step === 1 ? 1 : step === 2 ? 0.35 : 0, 3, dt);
        st.p = damp(st.p, step === 2 ? 1 : 0, 3, dt);
        st.w = damp(st.w, step === 3 ? 1 : 0, 3, dt);
        corridors.forEach((c, i) => {
          c.tube.userData.setProgress(clamp01(st.draw * 1.6 - (i % 6) * 0.1));
          c.tube.material.opacity = (c.c.main ? 0.95 : 0.7) * (1 - st.w * 0.55);
        });
        const base = step === 0 ? 1 : step === 1 ? 0 : 0.35;
        yardLabels.forEach((l) => setOpacity(l, smooth(st.draw) * base));
        yards.forEach((y, i) => { y.material.opacity = 0.5 + 0.4 * Math.sin(t * 2 + i); });
        jaxLabels.forEach((l, i) => setOpacity(l, smooth(clamp01(st.j * 2 - i * 0.3))));
        setOpacity(jaxTag, st.j); jaxStem.material.opacity = 0.7 * st.j;
        jaxRing.scale.setScalar(1 + ((t * 0.6) % 1) * 3); jaxRing.material.opacity = (1 - ((t * 0.6) % 1)) * (0.4 + st.j * 0.6);
        jaxGlow.material.opacity = 0.6 + st.j * 0.4;
        brRing.scale.setScalar(1 + ((t * 0.7) % 1) * 3.5); brRing.material.opacity = (1 - ((t * 0.7) % 1)) * st.p;
        hstRing.scale.setScalar(1 + ((t * 0.7 + 0.5) % 1) * 3.5); hstRing.material.opacity = (1 - ((t * 0.7 + 0.5) % 1)) * st.p;
        [brLb, hstLb, presTag].forEach((l) => setOpacity(l, st.p));
        sites.material.opacity = st.w * (0.6 + 0.4 * Math.sin(t * 4));
        [siteLb, siteTag, tsaLb, cisaLb].forEach((l) => setOpacity(l, st.w));
        setOpacity(states, smooth(st.draw) * (1 - st.w) * (step === 1 ? 0.3 : 1)); setOpacity(statesTag, smooth(st.draw) * (1 - st.w) * (step === 1 ? 0.3 : 1));
      },
      reset() { st.draw = 0; },
    };
  },
};

// ---------------------------------------------------------------------------
// 02 Wayside control point (MODELED): track, signals, crossing, detector, switch,
// bungalow, PTC WIU and radio, fiber and cellular backhaul, and a passing train.
export const wayside = {
  id: 'wayside',
  bg: { a: '#020814', b: '#0a2440', c: '#9be7ff', mix: [0.8, 0.7, 0, 0.6] },
  bgSteps: [null, { a: '#030a10', b: '#0a2a3a', c: '#2de2c5', mix: [0.9, 0.7, 0, 0.6] }, { a: '#04050f', b: '#18204a', c: '#8e7cff', mix: [1, 0.5, 0, 0.6] }, { a: '#020a08', b: '#0a3024', c: '#6cc04a', mix: [0.8, 0.9, 0.2, 0.5] }],
  cams: [
    { p: [1.5, 15, 30], t: [1.8, 2, -2] },
    { p: [-2, 9, 18], t: [-2, 5, -5] },
    { p: [0, 6, 9.5], t: [-0.5, 2.2, -5.5] },
    { p: [6, 20, 30], t: [3, 2, -9] },
  ],
  build() {
    const group = new THREE.Group(); group.position.x = 4;
    group.add(gridFloor(120, 60, C.sky, 0.1));
    const main = track(-22, 22, { color: C.sky }); group.add(main);
    const siding = track(0, 12, { color: C.sky, opacity: 0.6 }); siding.position.set(11, 0, -1.4); siding.rotation.y = 0.13; group.add(siding);
    // Signals
    const sigA = signalMast(4.2); sigA.position.set(-11, 0, 1.8); group.add(sigA);
    const sigB = signalMast(4.2); sigB.position.set(12, 0, 1.8); group.add(sigB);
    // Bungalow with electronics inside
    const bung = bungalow(4.2, 3.0, 3.0, C.sky, 0.1); bung.position.set(-2, 0, -5.5); group.add(bung);
    const inside = new THREE.Group(); inside.position.set(-2, 0, -5.5); group.add(inside);
    const ie = device('', C.sky, 1.2, 0.5, 0.3); ie.position.set(-0.9, 2.1, 0.2); inside.add(ie);
    const ir = device('', 0x34d399, 1.2, 0.5, 0.3); ir.position.set(0.8, 2.1, 0.2); inside.add(ir);
    const ctl = device('', C.violet, 2.6, 0.7, 0.3); ctl.position.set(0, 1.1, 0.2); inside.add(ctl);
    // PTC WIU and 220 MHz radio mast
    const radio = mast(9, C.teal); radio.position.set(-8, 0, -6.5); group.add(radio);
    const wiu = device('', C.teal, 1.1, 1.4, 0.8); wiu.position.set(-6.4, 0.7, -5.2); group.add(wiu);
    const waves = radioRings(C.teal, 3, 3); waves.position.set(-8, 9.2, -6.5); group.add(waves);
    // Grade crossing: road, two gates with lights
    const road = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 30), new THREE.MeshBasicMaterial({ color: 0x0e2238, transparent: true, opacity: 0.8, depthWrite: false }));
    road.rotation.x = -Math.PI / 2; road.position.set(5, 0.02, 0); group.add(road);
    const gates = [[3.1, 2.2, 1], [6.9, -2.2, -1]].map(([x, z, s]) => {
      const g = new THREE.Group(); g.position.set(x, 0, z); group.add(g);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4, 6), new THREE.MeshStandardMaterial({ color: 0x223a55 })); post.position.y = 1.2; g.add(post);
      const armPivot = new THREE.Group(); armPivot.position.y = 1.6; g.add(armPivot);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 3.6), new THREE.MeshStandardMaterial({ color: 0x1a0a0a, emissive: 0xff3b30, emissiveIntensity: 0.6 }));
      arm.position.z = -1.8 * s; armPivot.add(arm);
      const l1 = glowSprite(0xff3b30, 1, 0.2); l1.position.set(-0.3, 2.4, 0); g.add(l1);
      const l2 = glowSprite(0xff3b30, 1, 0.2); l2.position.set(0.3, 2.4, 0); g.add(l2);
      return { armPivot, l1, l2, s };
    });
    // Hot box detector: a box between the rails and a trackside cabinet
    const hbd = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.6), new THREE.MeshStandardMaterial({ color: 0x0b1626, emissive: C.amber, emissiveIntensity: 0.8 }));
    hbd.position.set(-8.5, 0.2, 0); group.add(hbd);
    const hbdCab = device('', C.amber, 0.8, 1.2, 0.6); hbdCab.position.set(-8.5, 0.6, 2.4); group.add(hbdCab);
    // Power switch machine
    const sw = device('', C.pink, 1.0, 0.5, 0.6); sw.position.set(9.6, 0.25, 1.4); group.add(sw);
    // Backhaul: fiber conduit to the back, and a cell site
    const fiberCurve = new THREE.CatmullRomCurve3([V(-2, 0.2, -7), V(-3, 0.2, -14), V(-6, 0.2, -24), V(-10, 0.2, -36)]);
    const fiber = drawTube(fiberCurve, { radius: 0.12, color: C.sky, seg: 120 }); group.add(fiber);
    const fiberFlow = flow(fiberCurve, 16, C.sky, 0.6); group.add(fiberFlow);
    const cell = mast(10, C.green); cell.position.set(9, 0, -14); group.add(cell);
    const cellCurve = arc(V(-1, 3.4, -5.5), V(9, 10.2, -14), 5);
    const cellPath = drawTube(cellCurve, { radius: 0.06, color: C.green, seg: 100 }); group.add(cellPath);
    const cellFlow = flow(cellCurve, 10, C.green, 0.5); group.add(cellFlow);
    // Passing train
    const tr = train(4, C.ice); tr.position.y = 0; group.add(tr);
    // Labels
    const L = (txt, c, pos, size = 0.42) => { const l = pill(txt, c, size); l.position.set(...pos); group.add(l); return l; };
    const lbSig = L('Signals', '#9be7ff', [-11, 6.3, 1.8]);
    const lbCross = L('Grade crossing', '#ff8a80', [5, 3.6, 3.6]);
    const lbHbd = L('Hot box detector', '#fbab18', [-8.5, 2.6, 3.4]);
    const lbSw = L('Power switch', '#f25c9a', [9.8, 1.8, 2.6]);
    const lbWiu = L('PTC WIU · 220 MHz radio', '#2de2c5', [-8, 11.4, -6.5], 0.5);
    const lbWiuTag = tag('PUBLIC', 0.32, '2,500+ WIUs in 2015'); lbWiuTag.position.set(-8, 10.5, -6.5); group.add(lbWiuTag);
    const lbBung = L('Bungalow · signal, crossing and detector electronics', '#00bceb', [-2, 5.2, -5.5], 0.4);
    const lbFiber = L('Fiber primary · to Jacksonville', '#00bceb', [-8, 1.5, -26], 0.55);
    const lbCell = L('Cellular secondary', '#6cc04a', [9, 12.2, -14], 0.55);
    const siteTag = tag('MODELED', 0.36, 'representative site, not a CSX location'); siteTag.position.set(-2, 0.6, 6.5); group.add(siteTag);
    const st = { a: 0, b: 0, c: 0, d: 0, tx: -40 };
    return {
      group,
      update(dt, t, step) {
        st.a = damp(st.a, step === 0 ? 1 : step === 3 ? 0.3 : 0, 3, dt);
        st.b = damp(st.b, step === 1 ? 1 : 0, 3, dt);
        st.c = damp(st.c, step === 2 ? 1 : 0, 3, dt);
        st.d = damp(st.d, step === 3 ? 1 : 0, 3, dt);
        // train loop and crossing gates
        st.tx += dt * 6; if (st.tx > 40) st.tx = -40;
        tr.position.x = st.tx;
        const near = Math.abs(st.tx - 5) < 14 ? 1 : 0;
        gates.forEach((g, i) => {
          g.armPivot.rotation.x = damp(g.armPivot.rotation.x, near ? 0 : g.s * -1.35, 3, dt);
          const blink = near ? (Math.sin(t * 8 + i) > 0 ? 1 : 0) : 0;
          g.l1.material.opacity = 0.15 + 0.85 * blink; g.l2.material.opacity = 0.15 + 0.85 * (1 - blink) * near;
        });
        sigA.userData.setAspect(st.tx > -20 && st.tx < 20 ? 0 : 2); sigB.userData.setAspect(st.tx > -10 ? 0 : 1);
        [lbSig, lbCross, lbHbd, lbSw].forEach((l) => setOpacity(l, st.a));
        setOpacity(siteTag, 0.4 + 0.6 * st.a);
        hbd.material.emissiveIntensity = 0.4 + 0.6 * Math.abs(Math.sin(t * 2));
        // WIU and radio
        waves.userData.update(t, 0.3 + st.b * 0.9);
        wiu.userData.mat.emissiveIntensity = 0.25 + st.b * 1.2;
        setOpacity(lbWiu, 0.2 + st.b * 0.8); setOpacity(lbWiuTag, st.b);
        // bungalow
        bung.userData.box.userData.fill.material.opacity = 0.08 + st.c * 0.12;
        [ie, ir, ctl].forEach((d, i) => { d.userData.mat.emissiveIntensity = 0.2 + st.c * (0.9 + 0.3 * Math.sin(t * 3 + i)); });
        setOpacity(lbBung, 0.15 + st.c * 0.85);
        // backhaul
        fiber.userData.setProgress(st.d * 1.05); cellPath.userData.setProgress(st.d * 1.05);
        fiberFlow.userData.update(t, st.d, 0.35); cellFlow.userData.update(t, st.d * 0.9, 0.3);
        setOpacity(lbFiber, st.d); setOpacity(lbCell, st.d);
        cell.userData.tip.material.opacity = 0.3 + st.d * 0.6;
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Shared bits for scenario scenes.
function scenarioTags(group, pos) {
  const t = tag('ILLUSTRATIVE', 0.32, 'scenario'); t.position.set(...pos); group.add(t); return t;
}
function modeLabel(group, pos) {
  const w = pill('WITHOUT CISCO', '#ff5a4a', 0.5, { weight: 800 }); w.position.set(...pos); group.add(w);
  const c = pill('WITH CISCO', '#6cc04a', 0.5, { weight: 800 }); c.position.set(...pos); group.add(c);
  return (k, vis = 1) => { setOpacity(w, (1 - k) * vis); setOpacity(c, k * vis); };
}

// ---------------------------------------------------------------------------
// 03 Scenario 1: an unknown laptop inside the bungalow.
export const rogue = {
  id: 'rogue',
  bg: SKY.red,
  bgSteps: [null, SKY.teal, { a: '#020a06', b: '#0a2e18', c: '#6cc04a', mix: [1, 0.5, 0.2, 0.5] }],
  cams: [{ p: [2, 7, 26], t: [2.9, 3.8, -1] }, { p: [2.5, 8, 27], t: [3.2, 4.4, -1] }, { p: [5, 8.5, 28], t: [5.5, 4.8, -1] }],
  build() {
    const group = new THREE.Group(); group.position.x = 3;
    group.add(gridFloor(60, 40, C.sky, 0.1));
    const room = wireBox(15, 7.5, 8, C.sky, 0.03, 0.35); room.position.set(0, 3.75, -1); group.add(room);
    const rack = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 0.2), new THREE.MeshStandardMaterial({ color: 0x06101e, roughness: 0.8 }));
    rack.position.set(-1.5, 3.2, -4.6); group.add(rack);
    const rail1 = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: C.sky })); rail1.position.set(-1.5, 4.25, -4.4); group.add(rail1);
    const rail2 = rail1.clone(); rail2.position.y = 2.35; group.add(rail2);
    const devs = [
      ['IE3500 switch', C.sky, 1.8, 4.3], ['PTC WIU', C.teal, -1.4, 4.3], ['Signal controller', C.violet, -4.6, 4.3],
      ['Crossing controller', C.amber, -1.4, 2.4], ['Detector electronics', C.pink, 1.8, 2.4],
    ].map(([n, c, x, y]) => { const d = device(n, c, 2.3, 1.0, 0.5, 0.3); d.position.set(x, y, -4.2); group.add(d); return d; });
    const ie = devs[0];
    const lap = laptop(RED); lap.position.set(4.6, 1.2, 1.2); group.add(lap);
    const desk = wireBox(2.4, 1.1, 1.6, C.sky, 0.05, 0.4); desk.position.set(4.6, 0.55, 1.2); group.add(desk);
    const cable = drawTube(new THREE.CatmullRomCurve3([V(4.6, 1.3, 0.8), V(4.2, 0.4, -1.5), V(3.2, 0.6, -3.6), V(2.6, 3.9, -3.9)]), { radius: 0.05, color: 0xff5a4a, seg: 60 });
    cable.userData.setProgress(1); group.add(cable);
    const lapLb = pill('Unknown laptop · spare port', RED, 0.4); lapLb.position.set(4.6, 2.8, 1.8); group.add(lapLb);
    // Without: scans to every device
    const scans = devs.slice(1).map((d) => {
      const c = arc(V(4.6, 1.8, 1.0), d.position.clone().add(V(0, 0, 0.4)), 2.5);
      const f = flow(c, 10, 0xff5a4a, 0.45); group.add(f);
      const ln = pathLine(c, 0xff5a4a, 0.5); group.add(ln);
      const q = qmark(RED, 0.8); q.position.copy(d.position).add(V(0.9, 1.2, 0.3)); group.add(q);
      return { f, ln, q };
    });
    const flat = pill('Flat VLAN · no inventory', '#ff9d3a', 0.42); flat.position.set(-1.5, 6.5, -4.2); group.add(flat);
    // With: ISE cage, Cyber Vision flag, telemetry to Sentinel
    const cage = wireBox(2.8, 2.6, 2.2, 0xff5a4a, 0.08, 0.9); cage.position.set(4.6, 1.4, 1.2); group.add(cage);
    const cageLb = pill('ISE · restricted TrustSec group', '#60a5fa', 0.38); cageLb.position.set(4.6, 3.4, 2.2); group.add(cageLb);
    const cvRing = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.05, 8, 64), new THREE.MeshBasicMaterial({ color: col(PINK), transparent: true, opacity: 0, blending: THREE.AdditiveBlending }));
    cvRing.position.copy(ie.position).add(V(0, 0, 0.4)); group.add(cvRing);
    const cvLb = pill('Cyber Vision · new component, abnormal scan', PINK, 0.36); cvLb.position.copy(ie.position).add(V(-1.6, 1.65, 0.6)); group.add(cvLb);
    const sent = sentinelPanel(6.6, 3.4); sent.position.set(8.6, 6.9, -1.5); sent.rotation.y = -0.3; group.add(sent);
    const rows = [['ISE', 'Unknown endpoint restricted', '#60a5fa'], ['Cyber Vision', 'New component, scan (CEF)', PINK], ['XDR', 'Incident summary exported', '#fb7185']];
    const upCurve = new THREE.CatmullRomCurve3([ie.position.clone().add(V(0, 0.5, 0.3)), V(3, 7.4, -3.6), V(5, 8.2, -2.6), V(6.2, 7.0, -1.6)]);
    const up = flow(upCurve, 18, col(SENT), 0.55); group.add(up);
    const upLine = pathLine(upCurve, col(SENT), 0.6); group.add(upLine);
    const kpi = kpiPanel([['Time to detect', 'Weeks', 'Minutes'], ['Visibility', 'About 40%', 'About 100%'], ['Field impact', '3 trips', '1 trip']]);
    kpi.position.set(11, 1.9, 1.8); kpi.rotation.y = -0.3; group.add(kpi);
    const mode = modeLabel(group, [-1.5, 8.4, -4.4]);
    const ill = scenarioTags(group, [-1.5, 7.6, -4.4]);
    const st = { k: 0, o: 0, lit: -1 };
    return {
      group,
      update(dt, t, step) {
        st.k = damp(st.k, step >= 1 ? 1 : 0, 3, dt);
        st.o = damp(st.o, step >= 2 ? 1 : 0, 3, dt);
        const w = 1 - st.k;
        mode(smooth(st.k));
        scans.forEach((s, i) => { s.f.userData.update(t + i * 0.3, w, 0.45); s.ln.material.opacity = 0.5 * w; setOpacity(s.q, w * (0.6 + 0.4 * Math.sin(t * 3 + i))); });
        setOpacity(flat, w); setOpacity(lapLb, w);
        lap.userData.scr.material.emissiveIntensity = 0.5 + 0.5 * Math.sin(t * 6) * w + 0.2;
        setOpacity(cage, st.k); setOpacity(cageLb, st.k);
        cvRing.material.opacity = st.k * (0.5 + 0.4 * Math.sin(t * 4)); cvRing.rotation.z = t;
        setOpacity(cvLb, st.k);
        ie.userData.mat.emissiveIntensity = 0.25 + st.k * 0.8;
        up.userData.update(t, st.k, 0.35); upLine.material.opacity = 0.6 * st.k;
        setOpacity(sent, 0.2 + st.k * 0.8);
        const lit = step >= 2 ? 3 : step >= 1 ? 2 : 0;
        if (lit !== st.lit) { st.lit = lit; sent.userData.redraw(rows, lit); }
        setOpacity(kpi, st.o);
        setOpacity(ill, 1);
      },
      reset() { st.lit = -1; },
    };
  },
};

// ---------------------------------------------------------------------------
// 04 Scenario 2: the WIU goes quiet on the backhaul. A hop chain from bungalow to the
// PTC back office; ThousandEyes finds the carrier hop, the IR1101 fails over to 5G.
export const backhaul = {
  id: 'backhaul',
  bg: { a: '#0a0602', b: '#3a2006', c: '#fbab18', mix: [0.3, 1, 0, 0.3] },
  bgSteps: [null, { a: '#020610', b: '#0a2850', c: '#00bceb', mix: [0.8, 0.8, 0.4, 0.4] }, { a: '#04030f', b: '#141a4a', c: '#a78bfa', mix: [1, 0.6, 0.2, 0.5] }],
  cams: [{ p: [1, 10.5, 30], t: [1.4, 3.8, -1] }, { p: [1, 11, 30], t: [1.4, 4.3, -1] }, { p: [1, 14, 25], t: [1.4, 9.6, -2] }],
  build() {
    const group = new THREE.Group(); group.position.x = 3;
    group.add(gridFloor(80, 40, C.amber, 0.08));
    const hopX = [-9, -4, 1, 6, 11];
    const names = ['Bungalow · IR1101', 'Carrier cell site', 'Carrier core', 'CSX data center', 'PTC back office'];
    const nodes = [];
    const b = bungalow(2.6, 2.0, 2.0, C.sky); b.position.set(hopX[0], 0, 0); group.add(b); nodes.push(b);
    const ir = device('', 0x34d399, 1.0, 0.4, 0.3); ir.position.set(hopX[0], 1.4, 1.05); group.add(ir);
    const cell = mast(6, C.amber); cell.position.set(hopX[1], 0, 0); group.add(cell); nodes.push(cell);
    const core = new THREE.Group(); core.position.set(hopX[2], 3.2, 0); group.add(core); nodes.push(core);
    for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.9 + (i % 3) * 0.25, 12, 10), new THREE.MeshBasicMaterial({ color: C.ice, wireframe: true, transparent: true, opacity: 0.25 })); s.position.set(Math.cos(i) * 1.1, Math.sin(i * 2) * 0.4, Math.sin(i) * 0.6); core.add(s); }
    const dc = new THREE.Group(); dc.position.set(hopX[3], 0, 0); group.add(dc); nodes.push(dc);
    for (let i = 0; i < 3; i++) { const r = wireBox(0.9, 3.2, 1.2, C.sky, 0.1, 0.9); r.position.set((i - 1) * 1.1, 1.6, 0); dc.add(r); }
    const po = device('', C.violet, 2.4, 1.6, 1.2); po.position.set(hopX[4], 1.2, 0); group.add(po); nodes.push(po);
    names.forEach((n, i) => { const l = label(n, { size: 0.38, color: '#e6f6ff', bg: 'rgba(3,10,22,0.8)' }); l.position.set(hopX[i], i === 2 ? 5.0 : i === 1 ? 7.2 : 4.0, 0.4); group.add(l); });
    const pts = [V(hopX[0], 2.6, 0), V(hopX[1], 5.8, 0), V(hopX[2], 3.4, 0), V(hopX[3], 3.4, 0), V(hopX[4], 2.4, 0)];
    const primary = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.3);
    const pLine = pathLine(primary, C.sky, 0.6); group.add(pLine);
    const pFlow = flow(primary, 26, C.sky, 0.5); group.add(pFlow);
    const alt = new THREE.CatmullRomCurve3([V(hopX[0], 2.6, 0), V(-6, 9.5, -2), V(-1, 10.5, -2.5), V(3, 8, -1), V(hopX[3], 3.4, 0), V(hopX[4], 2.4, 0)], false, 'catmullrom', 0.3);
    const aTube = drawTube(alt, { radius: 0.08, color: C.green, seg: 140 }); group.add(aTube);
    const aFlow = flow(alt, 24, C.green, 0.55); group.add(aFlow);
    const altLb = pill('IR1101 fails over: second SIM, 5G path', GREEN, 0.4); altLb.position.set(-2, 11.6, -2.5); group.add(altLb);
    // Without: red break on the carrier hop, a ticket, a truck three hours out
    const breakRing = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.07, 8, 48), new THREE.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }));
    breakRing.position.set(-1.5, 4.6, 0); group.add(breakRing);
    const qCore = qmark(RED, 0.9); qCore.position.set(hopX[2] + 1.7, 5.3, 0.4); group.add(qCore);
    const qB = qmark(RED, 0.9); qB.position.set(hopX[0] + 1.6, 3.6, 0.4); group.add(qB);
    const nofault = pill('Carrier: no problem found', '#ff9d3a', 0.38); nofault.position.set(hopX[2], 6.6, 0.4); group.add(nofault);
    const road = new THREE.CatmullRomCurve3([V(hopX[3], 0.1, 6), V(1, 0.1, 7), V(-5, 0.1, 6.5), V(hopX[0], 0.1, 4)]);
    group.add(pathLine(road, C.amber, 0.35, true));
    const trk = truck(C.amber); group.add(trk);
    const trkLb = pill('Truck roll · three hours out', '#fbab18', 0.38); group.add(trkLb);
    // With: ThousandEyes hop markers
    const hops = pts.map((p, i) => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.05, 8, 48), new THREE.MeshBasicMaterial({ color: i === 1 ? C.amber : col(LIME), transparent: true, opacity: 0, blending: THREE.AdditiveBlending })); r.position.copy(p); group.add(r); return r; });
    const teLb = pill('ThousandEyes on the IR1101 · loss on the carrier hop', LIME, 0.38); teLb.position.set(0, 8.3, 3); group.add(teLb);
    // Step 2: Cloud Control and Sentinel, plus KPIs
    const cc = infoPanel('Cisco Cloud Control', ['IR1101 health', 'ThousandEyes path', 'Affected sites, one view'], '#c084fc', 5.2, 2.6);
    cc.position.set(-6, 13.6, -3); group.add(cc);
    const sent = sentinelPanel(5.6, 2.9); sent.position.set(0, 13.8, -3); group.add(sent);
    sent.userData.redraw([['ThousandEyes', 'Webhook to ingestion endpoint', LIME], ['Audit', 'Path alert, custom table', SENT]], 2);
    const kpi = kpiPanel([['Time to detect', 'Hours', 'Under 5 min'], ['Visibility', 'Core only', 'Hop by hop'], ['Field impact', '1 to 2 trips', '0 trips']], 5.6, 2.6);
    kpi.position.set(6.2, 13.8, -3); group.add(kpi);
    const mode = modeLabel(group, [1, 9.9, -1]);
    scenarioTags(group, [1, 9.1, -1]);
    const st = { k: 0, o: 0, tp: 0 };
    return {
      group,
      update(dt, t, step) {
        st.k = damp(st.k, step >= 1 ? 1 : 0, 3, dt);
        st.o = damp(st.o, step >= 2 ? 1 : 0, 3, dt);
        const w = 1 - st.k;
        mode(smooth(st.k));
        pFlow.userData.update(t, 1 - st.k * 0.75, 0.18, (u, i) => w > 0.5 && u > 0.22 && u < 0.5 && (i % 3 !== 0));
        pLine.material.color.setHex(w > 0.5 ? 0xff9d3a : C.sky);
        breakRing.material.opacity = w * (0.5 + 0.5 * Math.sin(t * 5)); breakRing.scale.setScalar(1 + 0.15 * Math.sin(t * 5));
        [qCore, qB].forEach((q, i) => setOpacity(q, w * (0.6 + 0.4 * Math.sin(t * 3 + i))));
        setOpacity(nofault, w);
        st.tp = (st.tp + dt * 0.06) % 1;
        const tp = road.getPointAt(st.tp); trk.position.copy(tp);
        const ahead = road.getPointAt(Math.min(1, st.tp + 0.01)); trk.rotation.y = Math.atan2(-(ahead.z - tp.z), ahead.x - tp.x);
        setOpacity(trk, w); trkLb.position.copy(tp).add(V(0, 1.9, 0)); setOpacity(trkLb, w);
        aTube.userData.setProgress(st.k * 1.05); aFlow.userData.update(t, st.k, 0.22);
        setOpacity(altLb, st.k);
        hops.forEach((h, i) => { h.material.opacity = st.k * (i === 1 ? 0.6 + 0.4 * Math.sin(t * 6) : 0.75); h.rotation.y = t * 0.8 + i; });
        setOpacity(teLb, st.k * (1 - st.o * 0.6));
        cell.userData.tip.material.opacity = w > 0.5 ? 0.3 + 0.7 * (Math.sin(t * 9) > 0 ? 1 : 0) : 0.9;
        ir.userData.mat.emissiveIntensity = 0.3 + st.k * 0.9;
        setOpacity(cc, st.o); setOpacity(sent, st.o); setOpacity(kpi, st.o);
      },
    };
  },
};

// ---------------------------------------------------------------------------
// 05 Scenario 3: IT to OT. Enterprise towers on the left, the wayside on the right,
// a TrustSec shield wall with one approved conduit in between.
export const lateral = {
  id: 'lateral',
  bg: { a: '#0a0208', b: '#33081e', c: '#f25c9a', mix: [0.6, 0.8, 0.6, 0.2] },
  bgSteps: [null, { a: '#04030f', b: '#141a4a', c: '#8e7cff', mix: [1, 0.5, 0.3, 0.6] }, { a: '#020611', b: '#0a1f4a', c: '#5aa0ff', mix: [1, 0.6, 0.2, 0.5] }],
  cams: [{ p: [0, 12, 32], t: [0.4, 3.8, -1] }, { p: [0, 12, 32], t: [0.4, 4.2, -1] }, { p: [0, 15, 34], t: [0.4, 7, -2] }],
  build() {
    const group = new THREE.Group(); group.position.x = 3;
    group.add(gridFloor(80, 40, C.pink, 0.08));
    const itZone = new THREE.Group(); itZone.position.set(-9, 0, 0); group.add(itZone);
    for (let i = 0; i < 6; i++) { const h = 2 + (i * 5) % 4 + 1.5; const tw = wireBox(1.6, h, 1.6, C.ice, 0.06, 0.7); tw.position.set((i % 3) * 2.2 - 2.2, h / 2, Math.floor(i / 3) * -2.4); itZone.add(tw); }
    const itLb = pill('Enterprise IT', '#9be7ff', 0.5); itLb.position.set(-9, 7.4, -1); group.add(itLb);
    const ws = device('', 0xff3b30, 1.2, 0.8, 0.8); ws.position.set(-7.2, 0.5, 2.4); group.add(ws);
    const wsLb = pill('Compromised workstation', RED, 0.38); wsLb.position.set(-7.2, 1.7, 2.6); group.add(wsLb);
    const otZone = new THREE.Group(); otZone.position.set(9, 0, 0); group.add(otZone);
    const bungs = [];
    for (let i = 0; i < 4; i++) { const b = bungalow(1.9, 1.5, 1.5, C.sky, 0.08); b.position.set((i % 2) * 3 - 1.5, 0, Math.floor(i / 2) * -3 + 1); otZone.add(b); bungs.push(b); }
    const ot = track(-4, 4, { color: C.sky, opacity: 0.6 }); ot.position.set(0, 0, 3); otZone.add(ot);
    const otLb = pill('Wayside OT', '#00bceb', 0.5); otLb.position.set(9, 5, -1); group.add(otLb);
    // Routes from IT to OT
    const routes = [-1.5, 0.5, 2.2].map((z, i) => new THREE.CatmullRomCurve3([V(-7.2, 1.0, 2.4), V(-3, 2 + i, z), V(0, 2.4 + i * 0.6, z), V(3, 2 + i, z), V(bungs[i].position.x + 9, 1.4, bungs[i].position.z)]));
    const reds = routes.map((r) => { const f = flow(r, 14, 0xff3b30, 0.55); group.add(f); return f; });
    const routeLines = routes.map((r) => { const l = pathLine(r, 0xff5a4a, 0.4); group.add(l); return l; });
    const flatLb = pill('Flat routing between enterprise and field', '#ff9d3a', 0.4); flatLb.position.set(0, 6.4, 0); group.add(flatLb);
    // Shield wall of hexes (TrustSec) with one approved conduit
    const wall = new THREE.Group(); wall.position.set(0.2, 0, 0); group.add(wall);
    const hexes = [];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) {
      const y = 0.8 + r * 1.3, z = -4 + c * 1.5 + (r % 2) * 0.75;
      const conduit = r === 1 && c === 3;
      const h = new THREE.Mesh(new THREE.CircleGeometry(0.72, 6), new THREE.MeshBasicMaterial({ color: conduit ? C.green : C.violet, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
      h.position.set(0, y, z); h.rotation.y = Math.PI / 2; wall.add(h);
      const e = edgeLines(h.geometry, conduit ? C.green : C.violet, 0); e.position.copy(h.position); e.rotation.copy(h.rotation); wall.add(e);
      hexes.push({ h, e, conduit });
    }
    const wallLb = pill('ISE TrustSec · approved conduits only', '#8e7cff', 0.4); wallLb.position.set(0.2, 8.0, 0); group.add(wallLb);
    const okCurve = new THREE.CatmullRomCurve3([V(-6, 2.2, 1.5), V(0.2, 2.1, 0.5), V(6, 1.6, 1)]);
    const okFlow = flow(okCurve, 10, C.green, 0.5); group.add(okFlow);
    const cvLb = pill('Cyber Vision · new IT to OT pattern, to XDR', PINK, 0.38); cvLb.position.set(9, 7.3, 2); group.add(cvLb);
    const cvRing = groundRing(4.4, col(PINK), 0); cvRing.position.set(9, 0.1, -0.5); group.add(cvRing);
    const xdr = device('Cisco XDR', 0xfb7185, 1.8, 1.0, 0.6, 0.34); xdr.position.set(6.5, 9.4, -2.5); group.add(xdr);
    const toX = arc(V(9, 2.4, -0.5), V(6.5, 9.0, -2.5), 2); const toXF = flow(toX, 10, col(PINK), 0.5); group.add(toXF);
    const sent = sentinelPanel(6.4, 3.3); sent.position.set(-4.5, 11.2, -3.5); group.add(sent);
    const toS = arc(V(5.6, 9.6, -2.5), V(-1.4, 11.2, -3.5), 2); const toSF = flow(toS, 12, col(SENT), 0.55); group.add(toSF);
    const cage = wireBox(2.0, 1.8, 1.8, 0xff3b30, 0.08, 0.9); cage.position.set(-7.2, 0.9, 2.4); group.add(cage);
    const kpi = kpiPanel([['Time to detect', 'Days', 'Minutes'], ['Visibility', 'IT only', 'IT plus OT'], ['Impact', 'Broad outage risk', 'Contained']], 6.2, 2.9);
    kpi.position.set(4, 13.6, -4); group.add(kpi);
    const mode = modeLabel(group, [0.2, 10.6, -1]);
    scenarioTags(group, [0.2, 9.8, -1]);
    const st = { k: 0, o: 0, lit: -1 };
    return {
      group,
      update(dt, t, step) {
        st.k = damp(st.k, step >= 1 ? 1 : 0, 3, dt);
        st.o = damp(st.o, step >= 2 ? 1 : 0, 3, dt);
        const w = 1 - st.k;
        mode(smooth(st.k));
        reds.forEach((f, i) => f.userData.update(t + i * 0.37, 1 - st.o, 0.2, (u) => st.k > 0.5 && u > 0.5));
        routeLines.forEach((l) => { l.material.opacity = 0.4 * w + 0.1; });
        bungs.forEach((b, i) => { b.userData.box.userData.lines.material.color.setHex(w > 0.5 && Math.sin(t * 5 + i) > 0 ? 0xff3b30 : C.sky); });
        setOpacity(flatLb, w);
        hexes.forEach(({ h, e, conduit }, i) => {
          const on = smooth(clamp01(st.k * 2 - (i % 6) * 0.12));
          h.material.opacity = on * (conduit ? 0.5 : 0.16 + 0.06 * Math.sin(t * 3 + i));
          e.material.opacity = on * 0.9;
        });
        setOpacity(wallLb, st.k);
        okFlow.userData.update(t, st.k, 0.25);
        setOpacity(cvLb, st.k); cvRing.material.opacity = st.k * 0.6; cvRing.scale.setScalar(1 + 0.05 * Math.sin(t * 3));
        toXF.userData.update(t, st.k, 0.4); setOpacity(xdr, st.k);
        toSF.userData.update(t, st.o, 0.4);
        setOpacity(sent, 0.25 + st.k * 0.75);
        const lit = step >= 2 ? 3 : step >= 1 ? 1 : 0;
        if (lit !== st.lit) {
          st.lit = lit;
          sent.userData.redraw(step === 0 ? [['Endpoint', 'Alert with no OT context', '#ff9d3a']] : [['Cyber Vision', 'IT to OT pattern via XDR', PINK], ['XDR', 'Correlated incident export', '#fb7185'], ['ISE', 'Quarantine via playbook', '#60a5fa']], step === 0 ? 1 : lit);
        }
        setOpacity(cage, st.o); ws.userData.mat.emissiveIntensity = 0.4 + 0.6 * Math.abs(Math.sin(t * 4)) * (1 - st.o);
        setOpacity(kpi, st.o);
      },
      reset() { st.lit = -1; },
    };
  },
};

// ---------------------------------------------------------------------------
// 06 Scenarios 4 and 5: vendor access to a hot box detector (left), then a grade
// crossing controller acting strangely (right). The camera moves between them.
export const trackside = {
  id: 'trackside',
  bg: { a: '#0b0303', b: '#3a1208', c: '#ff6b4a', mix: [0.4, 1, 0, 0.3] },
  bgSteps: [null, { a: '#030a06', b: '#0c2a14', c: '#6cc04a', mix: [1, 0.6, 0, 0.5] }, { a: '#0a0702', b: '#33240a', c: '#ffd95a', mix: [0.3, 1, 0.2, 0.3] }, { a: '#02070a', b: '#073038', c: '#2de2c5', mix: [1, 0.7, 0, 0.5] }],
  cams: [
    { p: [-3, 8.5, 24], t: [-2.5, 3, -1] }, { p: [-3, 8.5, 24], t: [-2.5, 3, -1] },
    { p: [10.5, 8.5, 24], t: [11, 3, -1] }, { p: [10.5, 8.5, 24], t: [11, 3, -1] },
  ],
  build() {
    const group = new THREE.Group(); group.position.x = 3;
    group.add(gridFloor(90, 45, C.amber, 0.08));
    group.add(track(-26, 26, { color: C.sky }));
    // Left: detector, small bungalow with IE3500, vendor far away
    const hbd = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.6), new THREE.MeshStandardMaterial({ color: 0x0b1626, emissive: C.amber, emissiveIntensity: 0.9 }));
    hbd.position.set(-4, 0.2, 0); group.add(hbd);
    const hbdCab = device('Hot box detector', C.amber, 1.1, 1.5, 0.8, 0.34); hbdCab.position.set(-4, 0.75, -2); group.add(hbdCab);
    const bungL = bungalow(2.6, 2.1, 2.0, C.sky); bungL.position.set(-9, 0, -3.5); group.add(bungL);
    const sigL = signalMast(3.6); sigL.position.set(-12.5, 0, -1.4); group.add(sigL);
    const others = [V(-9, 1.4, -3.5), V(-12.5, 3.6, -1.4), V(0.5, 1, -2)];
    const modem = device('Always-on modem', 0xff3b30, 0.8, 0.5, 0.4, 0.3); modem.position.set(-2.8, 1.8, -2); group.add(modem);
    const vendor = person(C.amber, 1.2); vendor.position.set(-11.5, 0, 4.5); group.add(vendor);
    const vLap = laptop(C.amber); vLap.scale.setScalar(0.7); vLap.position.set(-10.7, 1.2, 4.9); group.add(vLap);
    const vLb = pill('Detector vendor', '#fbab18', 0.38); vLb.position.set(-11.5, 2.7, 4.5); group.add(vLb);
    const vpn = arc(V(-10.7, 1.6, 4.7), V(-2.8, 1.9, -2), 4);
    const vpnF = flow(vpn, 14, 0xff3b30, 0.5); group.add(vpnF);
    const fan = others.map((p) => { const c = arc(V(-2.8, 1.9, -2), p, 2); const f = flow(c, 8, 0xff5a4a, 0.4); group.add(f); return f; });
    const vpnLb = pill('Shared VPN · no recording, no time limit', RED, 0.38); vpnLb.position.set(-6, 6, 0); group.add(vpnLb);
    const sea = new THREE.CatmullRomCurve3([V(-10.7, 1.6, 4.7), V(-9.6, 3.4, 2), V(-9, 2.4, -2.6), V(-6, 2.4, -2.4), V(-4, 1.7, -1.8)]);
    const seaT = drawTube(sea, { radius: 0.09, color: C.green, seg: 120 }); group.add(seaT);
    const seaF = flow(sea, 12, C.green, 0.5); group.add(seaF);
    const seaLb = pill('Secure Equipment Access · time-boxed, one detector', GREEN, 0.38); seaLb.position.set(-6, 6, 0); group.add(seaLb);
    const seaS = pill('Access events to Sentinel via CEF', SENT, 0.34); seaS.position.set(-6, 5.1, 0); group.add(seaS);
    const clock = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.06, 8, 48), new THREE.MeshBasicMaterial({ color: C.green, transparent: true, opacity: 0 }));
    clock.position.set(-9.6, 4.4, 2); group.add(clock);
    // Right: crossing with gates and controller cabinet
    const road = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 26), new THREE.MeshBasicMaterial({ color: 0x0e2238, transparent: true, opacity: 0.8, depthWrite: false }));
    road.rotation.x = -Math.PI / 2; road.position.set(9, 0.02, 0); group.add(road);
    const gates = [[7.1, 2.2, 1], [10.9, -2.2, -1]].map(([x, z, s]) => {
      const g = new THREE.Group(); g.position.set(x, 0, z); group.add(g);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4, 6), new THREE.MeshStandardMaterial({ color: 0x223a55 })); post.position.y = 1.2; g.add(post);
      const pv = new THREE.Group(); pv.position.y = 1.6; g.add(pv);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 3.6), new THREE.MeshStandardMaterial({ color: 0x1a0a0a, emissive: 0xff3b30, emissiveIntensity: 0.6 })); arm.position.z = -1.8 * s; pv.add(arm);
      const l = glowSprite(0xff3b30, 1.2, 0.2); l.position.set(0, 2.5, 0); g.add(l);
      return { pv, l, s };
    });
    const ctl = device('Crossing controller', C.amber, 1.2, 1.5, 0.8, 0.34); ctl.position.set(12.5, 0.75, 2.6); group.add(ctl);
    const bungR = bungalow(2.4, 2.0, 2.0, C.sky); bungR.position.set(14.5, 0, -3.5); group.add(bungR);
    const phone = pill('Public calls in a gate problem', '#ffd95a', 0.38); phone.position.set(6.5, 4.8, 3); group.add(phone);
    const q1 = qmark('#ffd95a', 0.9); q1.position.set(12.5, 2.6, 2.8); group.add(q1);
    const trk = truck(C.amber); trk.position.set(9, 0, 9); trk.rotation.y = Math.PI / 2; group.add(trk);
    const trkLb = pill('Power, network or controller?', '#ffd95a', 0.36); trkLb.position.set(9, 2.2, 9.5); group.add(trkLb);
    const cvRing = groundRing(1.5, col(PINK), 0); cvRing.position.set(12.5, 0.1, 2.6); group.add(cvRing);
    const cvLb = pill('Cyber Vision · change in its communications', PINK, 0.36); cvLb.position.set(12.5, 3.0, 3.2); group.add(cvLb);
    const tePath = arc(V(14.5, 2.2, -3.5), V(18, 9, -6), 2); const teF = flow(tePath, 10, col(LIME), 0.5); group.add(teF);
    const teLb = pill('ThousandEyes · backhaul ruled in or out', LIME, 0.36); teLb.position.set(15.5, 6.6, -3.5); group.add(teLb);
    const okLb = pill('Right part, right diagnosis, one trip', GREEN, 0.38); okLb.position.set(9, 2.2, 9.5); group.add(okLb);
    const kpi1 = kpiPanel([['Time to detect', 'Unknown', 'Real time'], ['Visibility', 'None', 'Per session'], ['Access', 'Standing', 'Just in time']], 5.4, 2.5);
    kpi1.position.set(2.6, 6.4, -4); group.add(kpi1);
    const kpi2 = kpiPanel([['Time to detect', 'Public report', 'Proactive'], ['Visibility', 'None', 'Device level'], ['Field impact', '2 trips', '1 trip']], 5.4, 2.5);
    kpi2.position.set(15.5, 9.8, -5); group.add(kpi2);
    const modeL = modeLabel(group, [-3, 8.6, -2]); const tL = scenarioTags(group, [-3, 7.8, -2]);
    const modeR = modeLabel(group, [9, 8.4, -2]); const tR = scenarioTags(group, [9, 7.6, -2]);
    const st = { v: 0, c: 0, side: 0 };
    return {
      group,
      update(dt, t, step) {
        st.v = damp(st.v, step >= 1 ? 1 : 0, 3, dt);
        st.c = damp(st.c, step >= 3 ? 1 : 0, 3, dt);
        st.side = damp(st.side, step >= 2 ? 1 : 0, 3, dt);
        const L = 1 - st.side, R = st.side;
        // vendor side
        const vw = 1 - st.v;
        vpnF.userData.update(t, vw * L, 0.25); fan.forEach((f, i) => f.userData.update(t + i * 0.2, vw * L, 0.4));
        setOpacity(vpnLb, vw * L); setOpacity(modem, 0.15 + vw * 0.85);
        seaT.userData.setProgress(st.v * 1.05); seaF.userData.update(t, st.v, 0.25);
        setOpacity(seaLb, st.v * L); setOpacity(seaS, st.v * L);
        clock.material.opacity = st.v * L; clock.rotation.z = -t * 2;
        modeL(smooth(st.v), L); setOpacity(tL, L);
        // crossing side
        const cw = 1 - st.c;
        gates.forEach((g, i) => {
          const glitch = cw * R > 0.3 ? (Math.sin(t * 2.3 + i * 2) > 0.2 ? 1 : 0) : 0;
          g.pv.rotation.x = damp(g.pv.rotation.x, glitch ? 0 : g.s * -1.35, 4, dt);
          g.l.material.opacity = 0.15 + 0.85 * glitch * (Math.sin(t * 9) > 0 ? 1 : 0);
        });
        setOpacity(phone, cw * R); setOpacity(q1, cw * R * (0.6 + 0.4 * Math.sin(t * 3))); setOpacity(trkLb, cw * R);
        trk.position.z = 9 - st.c * 3;
        cvRing.material.opacity = st.c * 0.7; cvRing.scale.setScalar(1 + 0.08 * Math.sin(t * 3));
        setOpacity(cvLb, st.c); teF.userData.update(t, st.c, 0.35); setOpacity(teLb, st.c); setOpacity(okLb, st.c);
        modeR(smooth(st.c), R); setOpacity(tR, R);
        setOpacity(kpi1, L * st.v); setOpacity(kpi2, R * st.c);
      },
    };
  },
};
