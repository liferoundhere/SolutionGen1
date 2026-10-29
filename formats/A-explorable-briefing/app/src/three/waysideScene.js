import * as THREE from 'three';
import { glow, label, flow, arc, box, cyl, rng } from './sprites.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);

/**
 * Representative wayside control point (MODELED). Signal, bungalow with rack, PTC radio,
 * grade crossing, hot box detector, power switch, pole line, carrier tower, trees, looping train.
 * Without: legacy rack, intruder, red threat flows and "?" callouts.
 * With: IE3500/IR1101, sensor dome, control-plane labels and telemetry flows into the SIEM.
 */
export function createWaysideScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a1424);
  scene.fog = new THREE.Fog(0x0a1424, 45, 110);
  scene.add(new THREE.HemisphereLight(0xbcd4ff, 0x1a2414, 0.75));
  const key = new THREE.DirectionalLight(0xfff0d6, 2);
  key.position.set(-25, 40, 20);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 120 });
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x6ea8ff, 0.6);
  fill.position.set(30, 20, -30);
  scene.add(fill);

  const ground = new THREE.Mesh(new THREE.CircleGeometry(90, 64), new THREE.MeshStandardMaterial({ color: 0x1d2b1c, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Track: ballast, rails, instanced sleepers, diverging siding.
  const ballast = box(120, 0.35, 4.2, 0x5b5850, { rough: 1 });
  ballast.position.y = 0.17;
  scene.add(ballast);
  const steel = new THREE.MeshStandardMaterial({ color: 0xb8c0c8, metalness: 0.9, roughness: 0.35 });
  for (const z of [-0.72, 0.72]) {
    const r = new THREE.Mesh(new THREE.BoxGeometry(120, 0.16, 0.09), steel);
    r.position.set(0, 0.5, z);
    r.castShadow = true;
    scene.add(r);
  }
  const sleepers = new THREE.InstancedMesh(new THREE.BoxGeometry(0.25, 0.14, 2.6), new THREE.MeshStandardMaterial({ color: 0x3d2f24, roughness: 1 }), 200);
  const mtx = new THREE.Matrix4();
  for (let i = 0; i < 200; i++) { mtx.makeTranslation(-60 + i * 0.6, 0.38, 0); sleepers.setMatrixAt(i, mtx); }
  sleepers.receiveShadow = true;
  scene.add(sleepers);
  const siding = new THREE.CatmullRomCurve3([V(10, 0.5, 0), V(16, 0.5, 0.6), V(22, 0.5, 2.6), V(32, 0.5, 6.5), V(50, 0.5, 13)]);
  for (const z of [-0.72, 0.72]) {
    const c = new THREE.CatmullRomCurve3(siding.getPoints(40).map((p) => p.clone().add(V(0, 0, z))));
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(c, 80, 0.06, 4, false), steel));
  }
  const sidingBed = new THREE.Mesh(new THREE.TubeGeometry(siding, 60, 1.6, 4, false), new THREE.MeshStandardMaterial({ color: 0x55524b, roughness: 1 }));
  sidingBed.scale.y = 0.15;
  sidingBed.position.y = 0.05;
  scene.add(sidingBed);

  const objects = {};
  const addLabel = (text, pos, sub, color = '#e6f0ff') => {
    const s = label(text, { size: 0.8, sub, color });
    s.position.copy(pos);
    s.center.set(0.5, 0);
    scene.add(s);
    return s;
  };

  // Signal mast with three aspects.
  const signal = new THREE.Group();
  const mast = cyl(0.12, 0.14, 6, 0x9aa3ad);
  mast.position.y = 3;
  signal.add(mast);
  const head = box(0.8, 2.2, 0.5, 0x15181c);
  head.position.set(0, 5.6, 0.2);
  signal.add(head);
  const aspects = [[0x22ff66, 6.3], [0xffcc00, 5.6], [0xff3344, 4.9]].map(([c, y], i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i === 0 ? 2.5 : 0.1 }));
    m.position.set(0, y, 0.48);
    signal.add(m);
    return m;
  });
  const aspectGlow = glow(0x22ff66, 1.6, 0.8);
  aspectGlow.position.set(0, 6.3, 0.7);
  signal.add(aspectGlow);
  signal.position.set(-7, 0, -2.4);
  scene.add(signal);
  objects.signal = { pos: V(-7, 4, -2.4) };
  addLabel('Signal', V(-7, 7.3, -2.4), 'Wayside signal');

  // Bungalow: walls, translucent front, edges, roof, rack.
  const bung = new THREE.Group();
  const wall = new THREE.MeshStandardMaterial({ color: 0xc9c3b8, roughness: 0.85 });
  const back = new THREE.Mesh(new THREE.BoxGeometry(4.4, 3, 0.15), wall);
  back.position.set(0, 1.5, -1.6);
  bung.add(back);
  const side = new THREE.Mesh(new THREE.BoxGeometry(0.15, 3, 3.2), wall);
  side.position.set(-2.2, 1.5, 0);
  bung.add(side);
  const side2 = side.clone();
  side2.position.x = 2.2;
  bung.add(side2);
  const floor = box(4.4, 0.2, 3.2, 0x6d6a63);
  floor.position.y = 0.1;
  bung.add(floor);
  const front = new THREE.Mesh(new THREE.BoxGeometry(4.4, 3, 0.08), new THREE.MeshStandardMaterial({ color: 0xc9c3b8, transparent: true, opacity: 0.18, roughness: 0.2, depthWrite: false }));
  front.position.set(0, 1.5, 1.6);
  bung.add(front);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(4.4, 3, 3.2)), new THREE.LineBasicMaterial({ color: 0x9fb6d0, transparent: true, opacity: 0.6 }));
  edges.position.y = 1.5;
  bung.add(edges);
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 2.8, 1.1, 4, 1), new THREE.MeshStandardMaterial({ color: 0x5f6b77, roughness: 0.6, metalness: 0.4 }));
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(1.15, 1, 0.85);
  roof.position.y = 3.55;
  roof.castShadow = true;
  bung.add(roof);
  const rack = box(2.6, 2.4, 0.5, 0x2a2f36, { metal: 0.6 });
  rack.position.set(0, 1.4, -1.2);
  bung.add(rack);
  for (const y of [2, 1.25]) {
    const rail = box(2.4, 0.06, 0.06, 0xd0d6dc, { metal: 0.9 });
    rail.position.set(0, y, -0.92);
    bung.add(rail);
  }
  // Legacy kit (without).
  const legacy = new THREE.Group();
  const oldSw = box(0.9, 0.5, 0.35, 0x777777);
  oldSw.position.set(-0.6, 2, -0.78);
  legacy.add(oldSw);
  const modem = box(0.7, 0.45, 0.35, 0x6b5f50);
  modem.position.set(0.6, 2, -0.78);
  legacy.add(modem);
  bung.add(legacy);
  // Cisco kit (with): IE3500 and IR1101 with lit bezels and port LEDs.
  const cisco = new THREE.Group();
  const ie = box(0.7, 0.75, 0.42, 0x1f2a36, { metal: 0.5, emissive: 0x22d3ee, ei: 0.25 });
  ie.position.set(-0.6, 2, -0.75);
  cisco.add(ie);
  const ieBar = box(0.72, 0.08, 0.44, 0x22d3ee, { emissive: 0x22d3ee, ei: 2 });
  ieBar.position.set(-0.6, 2.3, -0.75);
  cisco.add(ieBar);
  const ir = box(0.6, 0.6, 0.42, 0x1f2a36, { metal: 0.5, emissive: 0x34d399, ei: 0.25 });
  ir.position.set(0.6, 2, -0.75);
  cisco.add(ir);
  const irBar = box(0.62, 0.08, 0.44, 0x34d399, { emissive: 0x34d399, ei: 2 });
  irBar.position.set(0.6, 2.25, -0.75);
  cisco.add(irBar);
  const leds = [];
  for (let i = 0; i < 8; i++) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.02), new THREE.MeshBasicMaterial({ color: 0x4ade80 }));
    l.position.set(-0.85 + i * 0.07, 1.8, -0.53);
    cisco.add(l);
    leds.push(l);
  }
  bung.add(cisco);
  const wiu = box(0.9, 0.55, 0.35, 0x40464f, { metal: 0.4 });
  wiu.position.set(-0.6, 1.25, -0.8);
  bung.add(wiu);
  const ctrl = box(0.9, 0.55, 0.35, 0x3a4048, { metal: 0.4 });
  ctrl.position.set(0.6, 1.25, -0.8);
  bung.add(ctrl);
  const battery = box(1.6, 0.5, 0.6, 0x1d1f22);
  battery.position.set(1.2, 0.45, 0.6);
  bung.add(battery);
  bung.position.set(-1, 0, -6.2);
  scene.add(bung);
  objects.bungalow = { pos: V(-1, 1.8, -6.2) };
  objects.ie3500 = { pos: V(-1.6, 2, -6.9) };
  objects.ir1101 = { pos: V(-0.4, 2, -6.9) };
  objects.wiu = { pos: V(-1.6, 1.25, -6.9) };
  addLabel('Signal bungalow', V(-1, 4.4, -6.2), 'Signal logic, PTC WIU, network');

  const ciscoLabels = new THREE.Group();
  const lab = (g, text, pos, o) => { const s = label(text, o); s.position.copy(pos); g.add(s); };
  lab(ciscoLabels, 'IE3500', V(-1.6, 2.65, -6.4), { size: 0.28, color: '#a5f3fc', border: '#22d3ee' });
  lab(ciscoLabels, 'IR1101', V(-0.4, 2.65, -6.4), { size: 0.28, color: '#a7f3d0', border: '#34d399' });
  lab(ciscoLabels, 'PTC WIU', V(-1.6, 0.85, -6.4), { size: 0.24 });
  lab(ciscoLabels, 'Signal controller', V(-0.4, 0.85, -6.4), { size: 0.24 });
  scene.add(ciscoLabels);
  const legacyLabels = new THREE.Group();
  lab(legacyLabels, 'Unmanaged switch', V(-1.6, 2.65, -6.4), { size: 0.24, color: '#fecaca', border: '#ef4444' });
  lab(legacyLabels, 'Legacy modem', V(-0.4, 2.65, -6.4), { size: 0.24, color: '#fecaca', border: '#ef4444' });
  scene.add(legacyLabels);

  // PTC 220 MHz radio tower.
  const radio = new THREE.Group();
  const rMast = cyl(0.12, 0.25, 11, 0x9aa3ad, { metal: 0.6 });
  rMast.position.y = 5.5;
  radio.add(rMast);
  for (let i = 0; i < 5; i++) {
    const brace = box(0.9, 0.05, 0.05, 0x9aa3ad);
    brace.position.y = 1.5 + i * 2;
    brace.rotation.z = 0.5;
    radio.add(brace);
  }
  const ant = cyl(0.04, 0.04, 2.4, 0xe5e7eb);
  ant.position.y = 12.2;
  radio.add(ant);
  const beacon = glow(0xf59e0b, 1.2, 0.9);
  beacon.position.y = 12.8;
  radio.add(beacon);
  radio.position.set(3.2, 0, -8.5);
  scene.add(radio);
  objects.radio = { pos: V(3.2, 6, -8.5) };
  addLabel('PTC 220 MHz radio', V(3.2, 13.8, -8.5), 'WIU status to locomotives');

  // Grade crossing: road, gates, flashers, cabinet.
  const road = box(7, 0.06, 40, 0x2b2d31, { rough: 0.95 });
  road.position.set(-18, 0.03, 0);
  scene.add(road);
  const deck = box(7, 0.62, 3.2, 0x3a3c40);
  deck.position.set(-18, 0.3, 0);
  scene.add(deck);
  for (const z of [-10, -5, 5, 10]) {
    const dash = box(0.2, 0.07, 2.5, 0xe5e7eb);
    dash.position.set(-18, 0.07, z);
    scene.add(dash);
  }
  const gates = [];
  const flashers = [];
  for (const sideSign of [-1, 1]) {
    const g = new THREE.Group();
    const post = cyl(0.12, 0.12, 4, 0xe5e7eb);
    post.position.y = 2;
    g.add(post);
    const xb = box(1.6, 0.18, 0.05, 0xf8fafc);
    xb.position.y = 3.8;
    xb.rotation.z = 0.6;
    g.add(xb);
    const xb2 = xb.clone();
    xb2.rotation.z = -0.6;
    g.add(xb2);
    for (const x of [-0.35, 0.35]) {
      const f = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 12), new THREE.MeshStandardMaterial({ color: 0xff2233, emissive: 0xff2233, emissiveIntensity: 0.1 }));
      f.position.set(x, 3.1, 0.18 * sideSign);
      g.add(f);
      flashers.push(f);
    }
    const pivot = new THREE.Group();
    pivot.position.set(0, 1.3, 0);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 0.12), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    arm.position.x = 1.8 * -sideSign;
    pivot.add(arm);
    for (let i = 0; i < 3; i++) {
      const stripe = box(0.45, 0.13, 0.13, 0xdc2626);
      stripe.position.x = (0.5 + i * 1.1) * -sideSign;
      pivot.add(stripe);
    }
    g.add(pivot);
    gates.push({ pivot, side: sideSign });
    g.position.set(sideSign < 0 ? -21.8 : -14.2, 0, sideSign * 3.2);
    scene.add(g);
  }
  const xCab = box(1.6, 2.2, 1.6, 0xb9b3a5);
  xCab.position.set(-23.5, 1.1, -4.5);
  scene.add(xCab);
  objects.crossing = { pos: V(-18, 2, 0) };
  addLabel('Grade crossing', V(-18, 5.4, -3.2), 'Gates, flashers, crossing controller');

  // Hot box detector.
  const det = new THREE.Group();
  for (const z of [-0.95, 0.95]) {
    const s = box(0.6, 0.3, 0.3, 0xf59e0b, { emissive: 0xf59e0b, ei: 0.3 });
    s.position.set(0, 0.45, z);
    det.add(s);
  }
  const dCab = box(1.8, 2.2, 1.6, 0xa8a293);
  dCab.position.set(0, 1.1, -4.2);
  det.add(dCab);
  const dAnt = cyl(0.05, 0.05, 3, 0xd1d5db);
  dAnt.position.set(0.6, 3.6, -4.2);
  det.add(dAnt);
  det.position.set(22, 0, 0);
  scene.add(det);
  objects.detector = { pos: V(22, 1.2, -2) };
  addLabel('Hot box detector', V(22, 4.8, -4.2), 'Defect detector and talker');

  // Power switch machine.
  const sm = box(1.4, 0.6, 0.9, 0x4b5563, { metal: 0.5 });
  sm.position.set(10.5, 0.55, -2);
  scene.add(sm);
  const rod = box(0.08, 0.08, 1.6, 0xd1d5db);
  rod.position.set(10.5, 0.5, -1);
  scene.add(rod);
  objects.switch = { pos: V(11, 0.6, -1) };
  addLabel('Power switch', V(10.5, 2, -2.2), 'Switch machine');

  // Pole line with sagging wires.
  const tops = [];
  for (let x = -50; x <= 50; x += 8) {
    const pole = cyl(0.1, 0.13, 6, 0x5b4636);
    pole.position.set(x, 3, -11);
    scene.add(pole);
    tops.push(V(x, 5.8, -11));
  }
  for (let i = 0; i < tops.length - 1; i++) {
    const a = tops[i], b = tops[i + 1], m = a.clone().lerp(b, 0.5);
    m.y -= 0.5;
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, m, b), 12, 0.025, 4, false), new THREE.MeshBasicMaterial({ color: 0x111111 })));
  }
  // Carrier 5G/LTE tower.
  const cell = new THREE.Group();
  const cMast = cyl(0.18, 0.45, 20, 0xb6bcc7, { metal: 0.6 });
  cMast.position.y = 10;
  cell.add(cMast);
  for (let i = 0; i < 3; i++) {
    const panel = box(0.4, 1.4, 0.15, 0xe5e7eb);
    const a = (i / 3) * Math.PI * 2;
    panel.position.set(Math.cos(a) * 0.6, 19, Math.sin(a) * 0.6);
    panel.rotation.y = -a;
    cell.add(panel);
  }
  const cellGlow = glow(0xa3e635, 1.6, 0.8);
  cellGlow.position.y = 20.5;
  cell.add(cellGlow);
  cell.position.set(32, 0, -20);
  scene.add(cell);
  objects.backhaul = { pos: V(12, 6, -14) };
  addLabel('Backhaul', V(-30, 7.2, -11), 'Fiber pole line');
  addLabel('Carrier 5G / LTE', V(32, 22, -20), 'Secondary backhaul');

  // Trees (seeded, kept clear of the track corridor).
  const leaf = new THREE.MeshStandardMaterial({ color: 0x1f3d24, roughness: 1 });
  const bark = new THREE.MeshStandardMaterial({ color: 0x3b2a1e });
  const rand = rng(7);
  for (let i = 0; i < 140; i++) {
    const x = (rand() - 0.5) * 150, z = (rand() - 0.5) * 150;
    if (Math.abs(z) < 16 && Math.abs(x) < 60) continue;
    const h = 3 + rand() * 5;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.9 + rand(), h, 7), leaf);
    cone.position.set(x, h / 2 + 0.8, z);
    cone.castShadow = true;
    scene.add(cone);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1, 5), bark);
    trunk.position.set(x, 0.5, z);
    scene.add(trunk);
  }

  // Train: locomotive plus six cars, loops along the main line.
  const train = new THREE.Group();
  const loco = box(14, 3.6, 2.9, 0x1d4ed8, { metal: 0.5, rough: 0.4 });
  loco.position.set(0, 2.4, 0);
  train.add(loco);
  const stripe = box(14.05, 0.4, 2.95, 0xfacc15);
  stripe.position.set(0, 1.4, 0);
  train.add(stripe);
  const cab = box(3, 1, 2.8, 0x1e3a8a);
  cab.position.set(5, 4.6, 0);
  train.add(cab);
  const headlight = glow(0xfff4c4, 2.4, 1);
  headlight.position.set(7.2, 3.6, 0);
  train.add(headlight);
  [0x7c2d12, 0x334155, 0x7c2d12, 0x475569, 0x14532d, 0x334155].forEach((c, i) => {
    const car = box(13, 3.2, 2.9, c, { rough: 0.8 });
    car.position.set(-14.5 - i * 14, 2.2, 0);
    train.add(car);
  });
  train.position.set(-200, 0, 0);
  scene.add(train);

  // ---------- WITHOUT layer: intruder, threat flows, blind-spot callouts ----------
  const withoutG = new THREE.Group();
  const intruder = new THREE.Group();
  const redMat = () => new THREE.MeshStandardMaterial({ color: 0x7f1d1d, emissive: 0xef4444, emissiveIntensity: 0.4 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 1, 4, 8), redMat());
  body.position.y = 1;
  intruder.add(body);
  const headM = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), redMat());
  headM.position.y = 1.95;
  intruder.add(headM);
  const laptop = box(0.6, 0.05, 0.4, 0x111827, { emissive: 0xef4444, ei: 0.8 });
  laptop.position.set(0.4, 1.2, 0.2);
  intruder.add(laptop);
  intruder.position.set(3.4, 0, -3.4);
  intruder.scale.setScalar(0.8);
  withoutG.add(intruder);
  const threatFlows = [
    flow([V(3.6, 1, -3.3), V(1.6, 1.6, -4.8), V(-1.6, 2, -6.6)], 0xef4444, { beads: 8, size: 0.35, speed: 0.5, opacity: 0.5 }),
    flow([V(60, 8, -40), V(40, 9, -20), V(22, 3, -3.2)], 0xef4444, { beads: 10, size: 0.45, speed: 0.2, opacity: 0.35 }),
    flow([V(-60, 10, -50), V(-20, 10, -20), V(-1, 3, -6.2)], 0xef4444, { beads: 12, size: 0.45, speed: 0.18, opacity: 0.3 }),
  ];
  threatFlows.forEach((f) => withoutG.add(f));
  const warnings = [];
  const warn = (text, pos) => {
    const s = label(text, { size: 0.42, color: '#fecaca', bg: 'rgba(60,8,8,0.85)', border: '#ef4444' });
    s.position.copy(pos);
    s.center.set(0.5, 0);
    withoutG.add(s);
    warnings.push(s);
  };
  warn('? Unknown device on spare port', V(2.6, 3, -3.2));
  warn('? Shared vendor VPN, standing access', V(26, 6.8, -3));
  warn('? IT-to-OT path not segmented', V(-10, 10.5, -16));
  warn('? Backhaul fault: drive out to find it', V(12, 8.6, -12));
  warn('? No asset inventory', V(-1, 6, -6.2));
  scene.add(withoutG);

  // ---------- WITH layer: sensor dome, asset rings, control plane, telemetry ----------
  const withG = new THREE.Group();
  const domeGeo = new THREE.SphereGeometry(4.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const dome = new THREE.Mesh(domeGeo, new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.07, depthWrite: false, side: THREE.DoubleSide }));
  dome.position.set(-1, 0, -6.2);
  withG.add(dome);
  const wire = new THREE.Mesh(domeGeo, new THREE.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true, transparent: true, opacity: 0.15 }));
  wire.position.copy(dome.position);
  withG.add(wire);
  const assetRings = ['signal', 'crossing', 'detector', 'switch', 'radio'].map((id) => {
    const r = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.3, 40), new THREE.MeshBasicMaterial({ color: 0x2dd4bf, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false }));
    r.rotation.x = -Math.PI / 2;
    r.position.copy(objects[id].pos).setY(0.62);
    withG.add(r);
    return r;
  });

  const PLANE = [
    { id: 'catc', text: 'Catalyst Center', sub: 'Automation, PnP, compliance', color: '#fbbf24', pos: V(-13, 11, -10) },
    { id: 'cv', text: 'Cyber Vision Center', sub: 'OT inventory, anomalies', color: '#f472b6', pos: V(-4.5, 12, -11) },
    { id: 'ise', text: 'Identity Services Engine', sub: '802.1X, TrustSec, pxGrid', color: '#60a5fa', pos: V(4.5, 12, -11) },
    { id: 'te', text: 'ThousandEyes', sub: 'Path assurance from the bungalow', color: '#a3e635', pos: V(13, 11, -10) },
    { id: 'cc', text: 'Cisco Cloud Control', sub: 'One inventory, topology, AI Canvas', color: '#c084fc', pos: V(-8, 17.5, -13) },
    { id: 'xdr', text: 'Cisco XDR', sub: 'OT + IT correlation', color: '#fb7185', pos: V(2, 17.5, -13) },
    { id: 'sentinel', text: 'Microsoft Sentinel', sub: 'CSX SOC (assumed SIEM)', color: '#93c5fd', pos: V(8.5, 21, -14) },
  ];
  const plane = {};
  for (const n of PLANE) {
    const s = label(n.text, { size: 0.9, sub: n.sub, border: n.color, color: '#ffffff', bg: n.id === 'sentinel' ? 'rgba(12,30,70,0.92)' : 'rgba(8,16,32,0.88)' });
    s.position.copy(n.pos);
    withG.add(s);
    const g = glow(n.color, 6, 0.25);
    g.position.copy(n.pos).add(V(0, 0, -0.5));
    withG.add(g);
    plane[n.id] = { sprite: s, glow: g, pos: n.pos };
    objects[n.id] = { pos: n.pos.clone() };
  }

  const ieP = V(-1.6, 2.4, -6.7), irP = V(-0.4, 2.4, -6.7);
  const flows = [];
  const addFlow = (pts, color, o = {}) => { const f = flow(pts, color, o); withG.add(f); flows.push(f); };
  const below = (id) => plane[id].pos.clone().add(V(0, -0.8, 0));
  addFlow(arc(ieP, below('cv')), 0xf472b6);
  addFlow(arc(ieP, below('ise')), 0x60a5fa);
  addFlow(arc(ieP, below('catc')), 0xfbbf24);
  addFlow(arc(irP, below('te')), 0xa3e635);
  addFlow(arc(plane.cv.pos, plane.xdr.pos, 1.5), 0xfb7185, { beads: 8 });
  addFlow(arc(plane.xdr.pos, plane.sentinel.pos, 1.2), 0x93c5fd, { beads: 8 });
  addFlow(arc(plane.ise.pos, plane.sentinel.pos, 2.5), 0x93c5fd, { beads: 8 });
  addFlow(arc(plane.te.pos, plane.sentinel.pos, 2), 0x93c5fd, { beads: 6 });
  addFlow(arc(plane.catc.pos, plane.cc.pos, 1.5), 0xc084fc, { beads: 6 });
  addFlow(arc(plane.te.pos, plane.cc.pos, 4), 0xc084fc, { beads: 6 });
  addFlow(arc(plane.cv.pos, plane.ise.pos, 1), 0x60a5fa, { beads: 5 });
  addFlow(arc(plane.cv.pos, plane.sentinel.pos, 4.5), 0x93c5fd, { beads: 8 });
  addFlow([irP, V(0, 5.8, -11), V(16, 5.8, -11), V(32, 19, -20)], 0xa3e635, { beads: 16, size: 0.3, speed: 0.35 });
  const hops = [V(0, 5.8, -11), V(16, 5.8, -11), V(32, 19, -20)].map((p) => { const h = glow(0xa3e635, 1.1, 0.9); h.position.copy(p); withG.add(h); return h; });
  for (const id of ['signal', 'crossing', 'detector', 'switch']) {
    const p = objects[id].pos;
    addFlow([p.clone().setY(1.2), p.clone().lerp(V(-1, 1, -6), 0.5).add(V(0, 2, 0)), ieP], 0x2dd4bf, { beads: 6, size: 0.22, speed: 0.4, opacity: 0.25 });
  }
  const good = (text, pos) => {
    const s = label(text, { size: 0.38, color: '#ccfbf1', bg: 'rgba(4,40,40,0.85)', border: '#2dd4bf' });
    s.position.copy(pos);
    s.center.set(0.5, 0);
    withG.add(s);
  };
  good('Profiled: signal controller, WIU, crossing controller', V(-1, 6, -3.4));
  good('Vendor session: just in time, recorded', V(26, 6.8, -3));
  good('5G failover ready (dual SIM)', V(16, 8.2, -9));
  scene.add(withG);

  // Highlight ring plus glow for the focused object.
  const hiRing = new THREE.Mesh(new THREE.RingGeometry(1.6, 1.85, 48), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }));
  hiRing.rotation.x = -Math.PI / 2;
  hiRing.visible = false;
  scene.add(hiRing);
  const hiGlow = glow(0xffffff, 4, 0.35);
  hiGlow.visible = false;
  scene.add(hiGlow);
  let focus = null;
  function highlight(id) {
    focus = id && objects[id] ? id : null;
    hiRing.visible = hiGlow.visible = !!focus;
    if (focus) {
      const p = objects[focus].pos;
      const high = p.y > 8;
      hiRing.position.set(p.x, high ? p.y - 1.4 : 0.66, p.z);
      hiRing.rotation.x = high ? 0 : -Math.PI / 2;
      hiGlow.position.copy(p);
    }
    for (const k in plane) plane[k].sprite.material.opacity = !focus || k === focus ? 1 : 0.45;
  }

  let mode = 'without';
  function applyMode(m) {
    mode = m;
    const on = m === 'with';
    withG.visible = on;
    withoutG.visible = !on;
    cisco.visible = on;
    legacy.visible = !on;
    ciscoLabels.visible = on;
    legacyLabels.visible = !on;
  }
  applyMode('without');

  let trainX = -200;
  function tick(t, dt) {
    trainX += dt * 14;
    if (trainX > 170) trainX = -190;
    train.position.x = trainX;
    const atCrossing = trainX > -40 && trainX < 30;
    for (const g of gates) {
      const target = atCrossing ? 0 : (Math.PI / 2.05) * -g.side;
      g.pivot.rotation.z += (target - g.pivot.rotation.z) * Math.min(1, dt * 2.5);
    }
    const phase = Math.floor(t * 2.5) % 2;
    flashers.forEach((f, i) => { f.material.emissiveIntensity = atCrossing && i % 2 === phase ? 3 : 0.1; });
    const occupied = trainX > -100 && trainX < 40;
    aspects[0].material.emissiveIntensity = occupied ? 0.1 : 2.5;
    aspects[2].material.emissiveIntensity = occupied ? 2.5 : 0.1;
    aspectGlow.material.color.set(occupied ? 0xff3344 : 0x22ff66);
    aspectGlow.position.y = occupied ? 4.9 : 6.3;
    beacon.material.opacity = 0.5 + 0.4 * Math.abs(Math.sin(t * 3));
    leds.forEach((l, i) => l.material.color.set(Math.sin(t * 9 + i * 1.7) > 0 ? 0x4ade80 : 0x14532d));
    for (const f of flows) f.userData.tick(t);
    for (const f of threatFlows) f.userData.tick(t);
    dome.material.opacity = 0.06 + 0.03 * Math.sin(t * 2);
    assetRings.forEach((r, i) => r.scale.setScalar(1 + 0.08 * Math.sin(t * 3 + i)));
    hops.forEach((h, i) => { h.material.opacity = 0.5 + 0.4 * Math.sin(t * 4 + i); });
    intruder.rotation.y = Math.sin(t) * 0.4;
    warnings.forEach((w, i) => { w.material.opacity = 0.75 + 0.25 * Math.sin(t * 3 + i); });
    if (focus) {
      hiRing.scale.setScalar(1 + 0.12 * Math.sin(t * 4));
      hiGlow.material.opacity = 0.25 + 0.15 * Math.sin(t * 4);
    }
    for (const k in plane) plane[k].glow.material.opacity = 0.18 + 0.08 * Math.sin(t * 2 + k.length);
  }

  const POSES = {
    overview: { pos: V(25, 17, 29), target: V(0, 4, -4) },
    bungalow: { pos: V(6.5, 6.5, 7.5), target: V(-1, 2.4, -6.4) },
    ie3500: { pos: V(0.6, 3.4, -0.6), target: V(-1.2, 2.1, -6.8) },
    ir1101: { pos: V(1.2, 3.4, -0.6), target: V(-0.4, 2.1, -6.8) },
    radio: { pos: V(16, 9, 12), target: V(3, 6, -8) },
    crossing: { pos: V(-8, 7, 14), target: V(-18, 1.5, 0) },
    detector: { pos: V(30, 6, 10), target: V(22, 1.2, -1.5) },
    switch: { pos: V(16, 5, 7), target: V(11, 0.6, -1) },
    signal: { pos: V(-1, 6, 6), target: V(-7, 4, -2.4) },
    backhaul: { pos: V(10, 14, 22), target: V(16, 8, -14) },
    control: { pos: V(-1, 14, 24), target: V(-0.5, 14, -11) },
  };
  for (const id of Object.keys(plane)) {
    const p = plane[id].pos;
    POSES[id] = { pos: V(p.x * 0.6, p.y - 1, p.z + 17), target: p.clone() };
  }

  return { scene, applyMode, tick, highlight, POSES, objects, get mode() { return mode; } };
}
