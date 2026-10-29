// Hex digital twin: Three.js r169 + CSS2DRenderer labels + UnrealBloom.
import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

const LON0 = -78.2, LAT0 = 36, KX = 4.6, KZ = 5;
export const project = (lon, lat) => new THREE.Vector3((lon - LON0) * KX, 0, (LAT0 - lat) * KZ);

function inPoly(x, z, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
}
const hash = (x, z) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };
const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function lbl(cls, html, extra) {
  const d = document.createElement('div');
  d.className = cls; d.innerHTML = html;
  if (extra) Object.assign(d.style, extra);
  return d;
}

function glowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'); const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export function createScene(stage, labelsEl, cfg) {
  const { regions, ocean, assets, agents, depts, where, chapter0 } = cfg;
  const deptColor = Object.fromEntries(depts.map((d) => [d.id, d.color]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.domElement.dataset.engine = 'three.js r' + THREE.REVISION;
  stage.append(renderer.domElement);
  const css = new CSS2DRenderer();
  css.domElement.className = 'label-layer';
  labelsEl.append(css.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#011a30');
  scene.fog = new THREE.Fog('#013a60', 80, 230);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 700);
  camera.position.set(...chapter0.p);
  const target = new THREE.Vector3(...chapter0.t);
  camera.lookAt(target);

  scene.add(new THREE.HemisphereLight('#4fc3ff', '#001020', 0.55));
  const dl = new THREE.DirectionalLight('#9fd8ff', 0.6); dl.position.set(-20, 40, 30); scene.add(dl);

  // Background sky gradient dome
  const sky = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {},
    vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'varying vec3 vP; void main(){ float h = clamp(vP.y/200.,0.,1.); vec3 c = mix(vec3(0.0,0.20,0.34), vec3(0.0,0.03,0.08), pow(h,.5)); gl_FragColor = vec4(c,1.); }',
  }));
  scene.add(sky);

  // ---------- Layer groups
  const G = { ops: new THREE.Group(), fabric: new THREE.Group(), agentic: new THREE.Group(), threat: new THREE.Group() };
  Object.values(G).forEach((g) => scene.add(g));

  // ---------- Floor: fabric grid (always faintly visible, bright in fabric layer)
  const grid = new THREE.GridHelper(480, 240, '#1597cc', '#0f7fb0');
  grid.position.y = -0.02;
  grid.material.transparent = true; grid.material.opacity = 0.3;
  scene.add(grid);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(420, 420), new THREE.MeshBasicMaterial({ color: '#012a45' }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.08; scene.add(floor);

  // ---------- Hex territory
  const R = 0.78, W = Math.sqrt(3) * R, H = 1.5 * R;
  const polys = regions.map((r) => ({ ...r, xz: r.poly.map(([lo, la]) => { const p = project(lo, la); return [p.x, p.z]; }) }));
  const cells = [];
  for (let row = -48; row < 48; row++) {
    for (let col = -55; col < 55; col++) {
      const x = col * W + (row & 1 ? W / 2 : 0), z = row * H;
      const reg = polys.find((p) => inPoly(x, z, p.xz));
      if (reg) cells.push({ x, z, reg });
    }
  }
  const prism = new THREE.CylinderGeometry(R * 0.96, R * 0.96, 1, 6, 1);
  prism.translate(0, 0.5, 0); prism.rotateY(Math.PI / 6);
  const prismMat = new THREE.MeshStandardMaterial({ color: '#05080f', roughness: 0.55, metalness: 0.4, emissive: '#020814' });
  const hexes = new THREE.InstancedMesh(prism, prismMat, cells.length);
  const ringGeo = new THREE.RingGeometry(R * 0.86, R * 0.95, 6, 1); ringGeo.rotateX(-Math.PI / 2); ringGeo.rotateY(Math.PI / 6);
  const ringMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const rims = new THREE.InstancedMesh(ringGeo, ringMat, cells.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color();
  const heights = [];
  cells.forEach((c, i) => {
    const n = hash(c.x * 0.13, c.z * 0.17), n2 = hash(c.x * 0.05 + 3, c.z * 0.05 + 7);
    const h = 0.25 + n * 0.5 + (n2 > 0.82 ? n2 * 1.6 : 0);
    heights.push(h);
    m4.compose(new THREE.Vector3(c.x, 0, c.z), q, new THREE.Vector3(1, h, 1)); hexes.setMatrixAt(i, m4);
    m4.compose(new THREE.Vector3(c.x, h + 0.01, c.z), q, new THREE.Vector3(1, 1, 1)); rims.setMatrixAt(i, m4);
    col.set(c.reg.edge);
    // cyan toward the coast, dim inland variation
    const coast = THREE.MathUtils.clamp((c.x - 6) / 10, 0, 1);
    col.lerp(new THREE.Color('#00bceb'), coast * 0.8).multiplyScalar(0.6 + n * 0.8);
    rims.setColorAt(i, col);
  });
  G.ops.add(hexes, rims);
  const hexAt = (x, z) => { let best = 0.3, bd = 9; cells.forEach((c, i) => { const d = (c.x - x) ** 2 + (c.z - z) ** 2; if (d < bd) { bd = d; best = heights[i]; } }); return bd < 2 ? best : 0.1; };

  // Region labels
  polys.filter((p) => p.label).forEach((p) => { const v = project(...p.lbl); const o = new CSS2DObject(lbl('state-lbl', p.label)); o.position.set(v.x, 0.6, v.z); G.ops.add(o); });
  { const v = project(...ocean.at); const o = new CSS2DObject(lbl('state-lbl', ocean.label)); o.position.set(v.x, 0.2, v.z); G.ops.add(o); }

  // ---------- Sites
  const tex = glowTex();
  const pick = [];
  const sites = {};
  assets.forEach((a) => {
    const p = project(a.lon, a.lat);
    const c = new THREE.Color(deptColor[a.dept] || '#00bceb');
    const y = hexAt(p.x, p.z) + 0.55;
    const g = new THREE.Group(); g.position.set(p.x, 0, p.z);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 14), new THREE.MeshBasicMaterial({ color: c.clone().multiplyScalar(1.45), toneMapped: false }));
    orb.position.y = y; orb.userData.asset = a.id; pick.push(orb);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: c, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
    halo.scale.setScalar(2.2); halo.position.y = y;
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.38, 48), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, side: THREE.DoubleSide, toneMapped: false }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = y - 0.3;
    g.add(orb, halo, ring);
    if (a.type === 'beacon') {
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.5, 9, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#7fe6ff', transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
      beam.position.y = 4.5; g.add(beam);
      const gr = new THREE.Mesh(new THREE.RingGeometry(2.2, 2.5, 64), new THREE.MeshBasicMaterial({ color: '#9ff0ff', transparent: true, opacity: 0.8, side: THREE.DoubleSide, toneMapped: false }));
      gr.rotation.x = -Math.PI / 2; gr.position.y = 0.05; g.add(gr);
    }
    const whereTxt = where[a.id] ? ` <em>${where[a.id]}</em>` : '';
    const el = lbl('asset-lbl', `<i></i><span>${a.short}${whereTxt}</span>`, { '--c': deptColor[a.dept] || '#00bceb' });
    el.style.setProperty('--c', deptColor[a.dept] || '#00bceb');
    el.title = a.name;
    el.addEventListener('click', () => api.select(a.id, true));
    const o = new CSS2DObject(el); o.position.y = y + 1.1; g.add(o);
    G.ops.add(g);
    sites[a.id] = { g, orb, ring, y, color: c, p };
  });

  // ---------- Fabric layer: ingest streams + callout
  const streamPts = [], streamMeta = [];
  Object.values(sites).forEach((s) => { for (let k = 0; k < 14; k++) { streamPts.push(s.p.x, 0, s.p.z); streamMeta.push({ s, off: Math.random(), dx: (Math.random() - 0.5) * 0.6, dz: (Math.random() - 0.5) * 0.6 }); } });
  const streamGeo = new THREE.BufferGeometry(); streamGeo.setAttribute('position', new THREE.Float32BufferAttribute(streamPts, 3));
  const streams = new THREE.Points(streamGeo, new THREE.PointsMaterial({ color: '#f7931e', size: 0.32, map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  G.fabric.add(streams);
  const fabricGrid = new THREE.GridHelper(90, 45, '#22d3ee', '#22d3ee');
  fabricGrid.material.transparent = true; fabricGrid.material.opacity = 0.16; fabricGrid.material.blending = THREE.AdditiveBlending; fabricGrid.position.y = 0.01;
  G.fabric.add(fabricGrid);
  { const o = new CSS2DObject(lbl('layer-lbl splunk', '<b>splunk&gt;</b> Cisco Data Fabric <span>Core platform, ES Premier, SOAR, ITSI, Observability, Edge Processor, Federated Search</span>')); o.position.set(7, 0.5, 11); G.fabric.add(o); }

  // ---------- Agentic layer: core, rings, agent orbs, action arcs
  const CORE = new THREE.Vector3(1, 12, -7);
  const core = new THREE.Mesh(new THREE.SphereGeometry(1.5, 32, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color('#bff4ff').multiplyScalar(1.7), toneMapped: false }));
  core.position.copy(CORE);
  const coreHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: '#4fd8ff', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
  coreHalo.scale.setScalar(9); coreHalo.material.opacity = 0.7; coreHalo.position.copy(CORE);
  G.agentic.add(core, coreHalo);
  const RINGS = [8.5, 6, 10.5].map((r, i) => {
    const curve = new THREE.EllipseCurve(0, 0, r, r * 0.62, 0, Math.PI * 2);
    const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(160).map((p) => new THREE.Vector3(p.x, 0, p.y)));
    const line = new THREE.LineLoop(geo, new THREE.LineBasicMaterial({ color: i === 0 ? '#7fe6ff' : '#2bb7e6', transparent: true, opacity: i === 0 ? 0.9 : 0.45, toneMapped: false }));
    line.position.copy(CORE); line.rotation.z = (i - 1) * 0.06; line.rotation.x = i === 2 ? 0.08 : 0;
    G.agentic.add(line); return r;
  });
  const orbs = agents.map((a, i) => {
    const c = new THREE.Color(deptColor[a.dept] || '#00bceb');
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.62, 20, 14), new THREE.MeshBasicMaterial({ color: c.clone().multiplyScalar(1.4), toneMapped: false }));
    m.userData.agent = a.id; pick.push(m);
    const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: c, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
    h.scale.setScalar(3.2); m.add(h);
    const el = lbl('agent-lbl', a.name); el.addEventListener('click', () => agentCb && agentCb(a.id));
    const o = new CSS2DObject(el); o.position.y = 1.3; m.add(o);
    G.agentic.add(m);
    // action arc to the first site of the agent's department
    const site = sites[(assets.find((x) => x.dept === a.dept) || {}).id];
    const arcGeo = new THREE.BufferGeometry(); arcGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(3 * 40), 3));
    const arc = new THREE.Line(arcGeo, new THREE.LineBasicMaterial({ color: '#22d3ee', transparent: true, opacity: 0.55, toneMapped: false }));
    G.agentic.add(arc);
    return { m, a: (i / agents.length) * Math.PI * 2, site, arc };
  });
  { const o = new CSS2DObject(lbl('layer-lbl cisco', '<b>Cisco Cloud Control</b> AgenticOps <span>AI Canvas, Agent Builder, App Builder, AI Defense, Splunk AI Agent Monitoring</span>')); o.position.set(9, 12.5, -1); G.agentic.add(o); }

  // ---------- Threat layer: red arcs from off-territory origins to OT/grid sites
  const threatTargets = ['grid', 'hq', 'chesterfield', 'northanna', 'cvow', 'dca', 'desc'].filter((id) => sites[id]);
  const origins = [[-40, -30], [40, -32], [45, 10], [-44, 20], [30, 30], [-10, -42], [10, 40]];
  const threats = threatTargets.map((id, i) => {
    const s = sites[id]; const o = new THREE.Vector3(origins[i][0], 0, origins[i][1]);
    const tgt = new THREE.Vector3(s.p.x, s.y, s.p.z);
    const mid = o.clone().lerp(tgt, 0.5); mid.y = 14 + i;
    const curve = new THREE.QuadraticBezierCurve3(o, mid, tgt);
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(60)), new THREE.LineBasicMaterial({ color: '#ff4d4f', transparent: true, opacity: 0.75, toneMapped: false }));
    const head = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: '#ff6b6b', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    head.scale.setScalar(2.2);
    const pulse = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.05, 48), new THREE.MeshBasicMaterial({ color: '#ff4d4f', transparent: true, side: THREE.DoubleSide, toneMapped: false }));
    pulse.rotation.x = -Math.PI / 2; pulse.position.set(tgt.x, s.y - 0.2, tgt.z);
    G.threat.add(line, head, pulse);
    return { curve, head, pulse, off: i * 0.17 };
  });
  G.threat.visible = false;

  // ---------- Post
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.95, 0.55, 0.42);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  function resize() {
    const w = stage.clientWidth || innerWidth, h = stage.clientHeight || innerHeight;
    renderer.setSize(w, h); composer.setSize(w, h); css.setSize(w, h);
    camera.aspect = w / h;
    // keep the territory framed on narrow screens
    camera.fov = w / h < 0.8 ? 40 : 30;
    const shift = w > 900 ? Math.max(0, 600 - w * 0.31) : 0;
    if (shift) camera.setViewOffset(w, h, -shift, 0, w, h); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage); resize();

  // ---------- Camera control: flyTo + gentle drag orbit + idle drift
  let fly = null, yaw = 0, pitch = 0, dragging = false, lx = 0, ly = 0, idle = 0;
  const basePos = camera.position.clone();
  stage.addEventListener('pointerdown', (e) => { dragging = true; lx = e.clientX; ly = e.clientY; });
  addEventListener('pointerup', () => (dragging = false));
  addEventListener('pointermove', (e) => { if (!dragging) return; yaw -= (e.clientX - lx) * 0.004; pitch = THREE.MathUtils.clamp(pitch + (e.clientY - ly) * 0.002, -0.3, 0.25); lx = e.clientX; ly = e.clientY; });

  // ---------- Picking
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let downAt = 0;
  stage.addEventListener('pointerdown', () => (downAt = performance.now()));
  stage.addEventListener('click', (e) => {
    if (performance.now() - downAt > 300) return;
    const r = stage.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(pick.filter((m) => m.parent.visible || m.parent.parent?.visible), false)[0];
    if (!hit) return;
    if (hit.object.userData.asset) api.select(hit.object.userData.asset, true);
    else if (hit.object.userData.agent && agentCb) agentCb(hit.object.userData.agent);
  });

  // ---------- Loop
  let running = true, selected = null, selCb = null, agentCb = null, threatOn = false;
  const clock = new THREE.Clock();
  const tmp = new THREE.Vector3();
  function frame() {
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    if (fly) {
      fly.k = Math.min(1, fly.k + dt / fly.d); const e = easeIO(fly.k);
      basePos.lerpVectors(fly.p0, fly.p1, e); target.lerpVectors(fly.t0, fly.t1, e);
      if (fly.k >= 1) fly = null;
    }
    if (!reduce && !dragging) { idle += dt; yaw += Math.sin(idle * 0.12) * 0.00035; }
    tmp.copy(basePos).sub(target).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    tmp.y += pitch * tmp.length();
    camera.position.copy(target).add(tmp); camera.lookAt(target);

    // ingest streams
    if (G.fabric.visible) {
      const pos = streamGeo.attributes.position;
      streamMeta.forEach((m, i) => { const k = (t * 0.35 + m.off) % 1; pos.setXYZ(i, m.s.p.x + m.dx, m.s.y + 0.5 + k * 8, m.s.p.z + m.dz); });
      pos.needsUpdate = true;
    }
    // orbit agents
    if (G.agentic.visible) {
      const sp = reduce ? 0 : 0.06;
      orbs.forEach((o, i) => {
        const a = o.a + t * sp; o.m.position.set(CORE.x + Math.cos(a) * RINGS[0], CORE.y + Math.sin(a * 2) * 0.4, CORE.z + Math.sin(a) * RINGS[0] * 0.62);
        if (o.site) {
          const p = o.arc.geometry.attributes.position; const a0 = o.m.position, b = new THREE.Vector3(o.site.p.x, o.site.y, o.site.p.z);
          const mid = a0.clone().lerp(b, 0.5); mid.y += 3;
          const cv = new THREE.QuadraticBezierCurve3(a0, mid, b);
          for (let j = 0; j < 40; j++) { const v = cv.getPoint(j / 39); p.setXYZ(j, v.x, v.y, v.z); }
          p.needsUpdate = true;
        }
      });
      core.scale.setScalar(1 + Math.sin(t * 2) * 0.04);
    }
    if (G.threat.visible) threats.forEach((th) => { const k = (t * 0.28 + th.off) % 1; th.head.position.copy(th.curve.getPoint(k)); const s = 1 + ((t * 0.9 + th.off) % 1) * 2.2; th.pulse.scale.setScalar(s); th.pulse.material.opacity = 1 - ((t * 0.9 + th.off) % 1); });
    Object.entries(sites).forEach(([id, s]) => {
      if (id === selected) { const k = (t * 0.8) % 1; s.ring.scale.setScalar(1 + k * 1.6); s.ring.material.opacity = 1 - k; }
      else s.ring.material.opacity = 0;
    });
    composer.render();
    css.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  const api = {
    onSelect(cb) { selCb = cb; },
    onAgent(cb) { agentCb = cb; },
    pause(p) { if (p === !running) return; running = !p; if (running) { clock.getDelta(); requestAnimationFrame(frame); } },
    flyTo(p, t, d = 2.6) { yaw = 0; pitch = 0; fly = { p0: basePos.clone(), p1: new THREE.Vector3(...p), t0: target.clone(), t1: new THREE.Vector3(...t), d: reduce ? 0.01 : d, k: 0 }; },
    setLayer(l) {
      G.ops.visible = true;
      G.fabric.visible = l === 'all' || l === 'fabric';
      G.agentic.visible = l === 'all' || l === 'agentic';
      grid.material.opacity = G.fabric.visible ? 0.42 : 0.22;
    },
    setThreat(on) { threatOn = on; G.threat.visible = on; },
    select(id, fromUser) {
      selected = id && sites[id] ? id : null;
      document.querySelectorAll('.asset-lbl.on').forEach((e) => e.classList.remove('on'));
      if (selected) sites[selected].g.children.find((c) => c.isCSS2DObject)?.element.classList.add('on');
      if (fromUser && selCb) selCb(selected);
      else if (selCb && !fromUser) selCb(selected);
    },
    get threat() { return threatOn; },
  };
  api.setLayer('all');
  return api;
}
