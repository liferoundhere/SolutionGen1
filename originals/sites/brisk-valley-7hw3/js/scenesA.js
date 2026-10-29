import * as THREE from 'three';
import {
  C, damp, smooth, clamp01, rr, glowSprite, label, canvasPanel, roundRect, wireBox,
  gridFloor, points, drawTube, setOpacity, emissiveMat, edgeLines, hexColor,
} from './core.js';
import { BLOCKS } from './content.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);

// Cisco bridge mark: nine bars, two tall peaks.
const BAR_H = [1, 2, 3, 2, 1, 2, 3, 2, 1];

export function bridgeBars({ spacing = 1.6, unit = 2.2, radius = 0.32, color = C.sky } = {}) {
  const g = new THREE.Group();
  const bars = [];
  BAR_H.forEach((h, i) => {
    const mat = new THREE.MeshStandardMaterial({ color: 0x0a2440, emissive: color, emissiveIntensity: 1.4, roughness: 0.3, metalness: 0.4 });
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(radius, 1, 6, 16), mat);
    m.position.x = (i - 4) * spacing;
    m.userData.h = h * unit;
    g.add(m);
    bars.push(m);
  });
  g.userData.bars = bars;
  g.userData.setHeights = (k, t) => {
    bars.forEach((b, i) => {
      const wave = 1 + 0.08 * Math.sin(t * 2.2 + i * 0.7);
      const h = Math.max(0.01, b.userData.h * k * wave);
      b.scale.y = h;
      b.position.y = h / 2 + radius;
    });
  };
  return g;
}

// ---------------------------------------------------------------------------
export const title = {
  id: 'title',
  bg: { a: '#01040b', b: '#062a4d', c: '#00bceb', mix: [1, 0.6, 0, 0.5] },
  cams: [{ p: [0, 6, 30], t: [0, 5, 0] }],
  build() {
    const group = new THREE.Group();
    const bars = bridgeBars({ spacing: 2.0, unit: 2.4, radius: 0.42 });
    group.add(bars);
    const refl = bridgeBars({ spacing: 2.0, unit: 2.4, radius: 0.42, color: C.blue });
    refl.scale.y = -1;
    refl.traverse((n) => { if (n.material) { n.material = n.material.clone(); n.material.transparent = true; n.material.opacity = 0.18; n.material.emissiveIntensity = 0.5; } });
    group.add(refl);
    const floor = gridFloor(220, 110, C.sky, 0.16);
    group.add(floor);

    const rings = [];
    for (let i = 0; i < 3; i++) {
      const r = new THREE.Mesh(
        new THREE.TorusGeometry(13 + i * 4.5, 0.03, 8, 200),
        new THREE.MeshBasicMaterial({ color: i === 1 ? C.teal : C.sky, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending })
      );
      r.rotation.x = Math.PI / 2 + 0.18 * (i - 1);
      r.position.y = 5;
      group.add(r);
      rings.push(r);
    }
    const dust = points(1600, () => {
      const a = rr(0, Math.PI * 2), rad = rr(8, 70);
      return [Math.cos(a) * rad, rr(0, 30), Math.sin(a) * rad];
    }, { size: 0.35, color: C.sky, opacity: 0.55 });
    group.add(dust);
    const core = glowSprite(C.sky, 36, 0.35);
    core.position.set(0, 5, -4);
    group.add(core);

    let k = 0;
    return {
      group,
      update(dt, t) {
        k = damp(k, 1, 1.6, dt);
        bars.userData.setHeights(smooth(k), t);
        refl.userData.setHeights(smooth(k), t);
        rings.forEach((r, i) => { r.rotation.z = t * (0.05 + i * 0.03) * (i % 2 ? -1 : 1); });
        dust.rotation.y = t * 0.02;
      },
      reset() { k = 0; },
    };
  },
};

// ---------------------------------------------------------------------------
function slideTexture(i) {
  const c = document.createElement('canvas');
  c.width = 640; c.height = 360;
  const g = c.getContext('2d');
  g.fillStyle = '#f4f6f9'; g.fillRect(0, 0, 640, 360);
  g.fillStyle = '#0d274d'; g.fillRect(0, 0, 640, 62);
  g.fillStyle = '#ffffff'; g.font = '600 30px Inter, Arial';
  const titles = ['Agenda', 'Customer Challenges', 'Our Portfolio', 'Architecture', 'Why Cisco', 'Next Steps'];
  g.fillText(titles[i % titles.length], 26, 42);
  g.fillStyle = '#6b7785';
  for (let b = 0; b < 4; b++) {
    g.beginPath(); g.arc(44, 112 + b * 56, 7, 0, Math.PI * 2); g.fill();
    g.fillRect(64, 104 + b * 56, 380 - (b * 47) % 120, 16);
  }
  g.fillStyle = '#049fd9';
  g.fillRect(470, 100, 140, 200);
  g.fillStyle = '#9aa7b4'; g.font = '16px Arial';
  g.fillText('CONFIDENTIAL', 26, 346);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export const slides = {
  id: 'slides',
  bg: { a: '#04070d', b: '#1a2230', c: '#8aa4c0', mix: [0.2, 0.9, 0, 0.2] },
  bgSteps: [
    null,
    { a: '#080306', b: '#2a0d16', c: '#ff6b4a', mix: [0.4, 0.3, 0.6, 0.2] },
    { a: '#010712', b: '#04345a', c: '#00bceb', mix: [1, 0.6, 0, 0.6] },
  ],
  cams: [
    { p: [6, 4, 26], t: [2, 3, 0] },
    { p: [0, 6, 34], t: [1, 3, 0] },
    { p: [-14, 22, 36], t: [2, 2, 0] },
  ],
  build() {
    const group = new THREE.Group();
    const N = 6;
    const slideMeshes = [];
    for (let i = 0; i < N; i++) {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(12, 6.75),
        new THREE.MeshBasicMaterial({ map: slideTexture(i), transparent: true, side: THREE.DoubleSide })
      );
      m.userData.rest = { x: 4 + i * 0.5, y: 3.5 + i * 0.25, z: -i * 1.6, ry: -0.35 };
      group.add(m);
      slideMeshes.push(m);
    }

    // Particle morph: slides -> explosion -> a city.
    const COUNT = 9000;
    const from = new Float32Array(COUNT * 3), mid = new Float32Array(COUNT * 3), to = new Float32Array(COUNT * 3), col = new Float32Array(COUNT * 3);
    const towers = [];
    for (let i = 0; i < 46; i++) {
      const gx = Math.round(rr(-7, 7)) * 2.6, gz = Math.round(rr(-6, 6)) * 2.6;
      towers.push({ x: gx, z: gz, w: rr(1, 2), h: Math.pow(rr(0.2, 1), 2) * 14 + 1.5 });
    }
    const palette = [new THREE.Color(C.sky), new THREE.Color(C.teal), new THREE.Color(C.white), new THREE.Color(C.blue)];
    for (let i = 0; i < COUNT; i++) {
      const s = slideMeshes[i % N].userData.rest;
      const lx = rr(-6, 6), ly = rr(-3.37, 3.37);
      const cs = Math.cos(s.ry), sn = Math.sin(s.ry);
      from[i * 3] = s.x + lx * cs; from[i * 3 + 1] = s.y + ly; from[i * 3 + 2] = s.z - lx * sn;
      const dir = V(rr(-1, 1), rr(-0.6, 1), rr(-1, 1)).normalize().multiplyScalar(rr(8, 30));
      mid[i * 3] = from[i * 3] + dir.x; mid[i * 3 + 1] = from[i * 3 + 1] + dir.y; mid[i * 3 + 2] = from[i * 3 + 2] + dir.z;
      let p;
      if (i % 5 === 0) {
        const a = rr(0, Math.PI * 2);
        p = [Math.cos(a) * 22, 0.1, Math.sin(a) * 22];
      } else {
        const tw = towers[i % towers.length];
        const face = Math.floor(rr(0, 4));
        const u = rr(-tw.w / 2, tw.w / 2), y = rr(0, tw.h);
        p = face === 0 ? [tw.x + u, y, tw.z + tw.w / 2] : face === 1 ? [tw.x + u, y, tw.z - tw.w / 2] : face === 2 ? [tw.x + tw.w / 2, y, tw.z + u] : [tw.x - tw.w / 2, y, tw.z + u];
        if (rand01() < 0.1) p[1] = tw.h;
      }
      to[i * 3] = p[0]; to[i * 3 + 1] = p[1]; to[i * 3 + 2] = p[2];
      const pc = palette[i % palette.length];
      col[i * 3] = pc.r; col[i * 3 + 1] = pc.g; col[i * 3 + 2] = pc.b;
    }
    function rand01() { return Math.random(); }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(from.slice(), 3));
    geo.setAttribute('aFrom', new THREE.BufferAttribute(from, 3));
    geo.setAttribute('aMid', new THREE.BufferAttribute(mid, 3));
    geo.setAttribute('aTo', new THREE.BufferAttribute(to, 3));
    geo.setAttribute('aCol', new THREE.BufferAttribute(col, 3));
    const pmat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uP1: { value: 0 }, uP2: { value: 0 }, uTime: { value: 0 }, uOp: { value: 0 } },
      vertexShader: /* glsl */`
        attribute vec3 aFrom; attribute vec3 aMid; attribute vec3 aTo; attribute vec3 aCol;
        uniform float uP1; uniform float uP2; uniform float uTime;
        varying vec3 vCol;
        void main(){
          vec3 p = mix(mix(aFrom, aMid, uP1), aTo, uP2);
          p.y += sin(uTime * 1.5 + aFrom.x * 2.0) * 0.15 * uP1 * (1.0 - uP2);
          vCol = mix(vec3(0.85,0.9,1.0), aCol, max(uP1, uP2));
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = (1.0 + uP2 * 0.8) * 90.0 / -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */`
        uniform float uOp; varying vec3 vCol;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(vCol, a * uOp);
        }`,
    });
    const cloud = new THREE.Points(geo, pmat);
    cloud.frustumCulled = false;
    group.add(cloud);

    const city = new THREE.Group();
    towers.forEach((tw) => {
      const b = wireBox(tw.w, tw.h, tw.w, C.sky, 0.05, 0.55);
      b.position.set(tw.x, tw.h / 2, tw.z);
      city.add(b);
    });
    const floor = gridFloor(80, 40, C.sky, 0.25);
    city.add(floor);
    group.add(city);

    const st = { slide: 1, p1: 0, p2: 0, city: 0 };
    return {
      group,
      update(dt, t, step) {
        const tSlide = step === 0 ? 1 : 0;
        const tP1 = step >= 1 ? 1 : 0;
        const tP2 = step >= 2 ? 1 : 0;
        st.slide = damp(st.slide, tSlide, 5, dt);
        st.p1 = damp(st.p1, tP1, 2.2, dt);
        st.p2 = damp(st.p2, tP2, 1.4, dt);
        st.city = damp(st.city, tP2, 1.2, dt);
        slideMeshes.forEach((m, i) => {
          const r = m.userData.rest;
          m.position.set(r.x, r.y + Math.sin(t * 0.8 + i) * 0.15, r.z);
          m.rotation.y = r.ry + Math.sin(t * 0.4 + i) * 0.03;
          m.material.opacity = st.slide;
          m.visible = st.slide > 0.01;
        });
        pmat.uniforms.uP1.value = smooth(st.p1);
        pmat.uniforms.uP2.value = smooth(st.p2);
        pmat.uniforms.uTime.value = t;
        pmat.uniforms.uOp.value = clamp01(1 - st.slide) * 0.9;
        setOpacity(city, smooth(st.city));
        city.rotation.y = t * 0.03;
        cloud.rotation.y = city.rotation.y * smooth(st.p2);
      },
    };
  },
};

// ---------------------------------------------------------------------------
export const google = {
  id: 'google',
  bg: { a: '#05050a', b: '#15182a', c: '#6f7fa8', mix: [0.1, 0.4, 0.2, 0.3] },
  bgSteps: [null, { a: '#030312', b: '#1d0f45', c: '#8e7cff', mix: [1, 0.2, 0, 0.8] }, { a: '#030312', b: '#0b2a55', c: '#2de2c5', mix: [1, 0.4, 0, 0.8] }],
  cams: [{ p: [3, 2, 22], t: [3, 1, 0] }, { p: [0, 7, 30], t: [2, 1, 0] }, { p: [-6, 12, 28], t: [2, 0, 0] }],
  build() {
    const group = new THREE.Group();
    group.position.x = 3;
    const query = 'cisco cloud control datasheet';
    const pill = canvasPanel(14, 1.8, (g, w, h, n = 0) => {
      g.fillStyle = 'rgba(255,255,255,0.96)';
      roundRect(g, 4, 4, w - 8, h - 8, h / 2 - 4); g.fill();
      g.strokeStyle = '#c9d3df'; g.lineWidth = 4; g.stroke();
      g.fillStyle = '#5f6b78';
      g.beginPath(); g.arc(h * 0.5, h / 2, h * 0.16, 0, Math.PI * 2); g.lineWidth = 8; g.strokeStyle = '#5f6b78'; g.stroke();
      g.fillStyle = '#20262e'; g.font = `500 ${h * 0.36}px Inter, Arial`;
      g.textBaseline = 'middle';
      g.fillText(query.slice(0, n) + ((Math.floor(performance.now() / 400) % 2) ? '|' : ''), h * 0.9, h / 2);
    });
    pill.position.y = 4.5;
    group.add(pill);
    const links = [];
    for (let i = 0; i < 8; i++) {
      const l = canvasPanel(12, 0.7, (g, w, h) => {
        g.fillStyle = '#8ab4f8'; g.font = `500 ${h * 0.5}px Arial`; g.textBaseline = 'middle';
        g.fillText(['Cisco Cloud Control Data Sheet', 'Cloud Control FAQ', 'Ordering Guide (PDF)', 'At-a-Glance', 'Release Notes', 'Licensing Overview', 'Community Thread', 'Video: Overview'][i], 8, h * 0.35);
        g.fillStyle = 'rgba(200,210,225,0.55)'; g.fillRect(8, h * 0.68, w * (0.5 + (i % 3) * 0.15), h * 0.12);
      }, 64);
      l.position.set(-1, 2.6 - i * 0.95, 0);
      group.add(l);
      links.push(l);
    }
    const coreGroup = new THREE.Group();
    group.add(coreGroup);
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(2.2, 1), new THREE.MeshStandardMaterial({ color: 0x120a30, emissive: C.violet, emissiveIntensity: 0.9, flatShading: true, roughness: 0.3 }));
    const coreWire = edgeLines(new THREE.IcosahedronGeometry(2.6, 1), C.teal, 0.8);
    const coreGlow = glowSprite(C.violet, 16, 0.7);
    coreGroup.add(core, coreWire, coreGlow);
    const tools = ['Researcher', 'Architect', 'Storyteller', 'Artist', 'Analyst', 'Engineer', 'Narrator', 'Comedian'];
    const toolCols = [C.violet, C.sky, C.amber, C.pink, C.teal, C.blue, C.gold, C.green];
    const sats = tools.map((name, i) => {
      const s = new THREE.Group();
      const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), emissiveMat(toolCols[i], 2));
      const gl = glowSprite(toolCols[i], 3.2, 0.8);
      const lb = label(name, { size: 0.55, color: hexColor(toolCols[i]) });
      lb.position.y = 1.1;
      s.add(orb, gl, lb);
      s.userData = { a: (i / tools.length) * Math.PI * 2, r: 8 + (i % 2) * 1.6, y: (i % 3 - 1) * 1.6, orb };
      coreGroup.add(s);
      return s;
    });
    const linkGeo = new THREE.BufferGeometry();
    const linkPos = new Float32Array(tools.length * 2 * 3 * 2);
    linkGeo.setAttribute('position', new THREE.BufferAttribute(linkPos, 3));
    const linkLines = new THREE.LineSegments(linkGeo, new THREE.LineBasicMaterial({ color: C.teal, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending }));
    coreGroup.add(linkLines);

    const st = { search: 1, core: 0, web: 0, typed: 0 };
    return {
      group,
      update(dt, t, step) {
        st.search = damp(st.search, step === 0 ? 1 : 0, 4, dt);
        st.core = damp(st.core, step >= 1 ? 1 : 0, 2.5, dt);
        st.web = damp(st.web, step >= 2 ? 1 : 0, 2, dt);
        if (step === 0) st.typed = Math.min(query.length, st.typed + dt * 14); else st.typed = 0;
        pill.userData.redraw(Math.floor(st.typed));
        const sc = 0.2 + 0.8 * st.search;
        pill.scale.setScalar(sc);
        pill.material.opacity = st.search;
        pill.position.y = 4.5 * st.search;
        links.forEach((l, i) => {
          const show = clamp01(st.typed / query.length * 1.4 - i * 0.08);
          l.material.opacity = st.search * show * (0.7 + 0.3 * Math.sin(t * 3 + i));
          l.position.y = (2.6 - i * 0.95) * st.search;
          l.scale.setScalar(sc);
        });
        const k = smooth(st.core);
        coreGroup.scale.setScalar(Math.max(0.001, k));
        coreGroup.visible = k > 0.01;
        core.rotation.y = t * 0.3; core.rotation.x = t * 0.17;
        coreWire.rotation.y = -t * 0.2;
        coreGlow.material.opacity = 0.5 + 0.2 * Math.sin(t * 2);
        let li = 0;
        sats.forEach((s, i) => {
          const u = s.userData;
          const a = u.a + t * 0.18;
          s.position.set(Math.cos(a) * u.r, u.y + Math.sin(t + i) * 0.3, Math.sin(a) * u.r);
          u.orb.rotation.y = t * 1.5;
          linkPos[li++] = 0; linkPos[li++] = 0; linkPos[li++] = 0;
          linkPos[li++] = s.position.x * st.web; linkPos[li++] = s.position.y * st.web; linkPos[li++] = s.position.z * st.web;
          const n = sats[(i + 3) % sats.length].position;
          linkPos[li++] = s.position.x; linkPos[li++] = s.position.y; linkPos[li++] = s.position.z;
          linkPos[li++] = lerpN(s.position.x, n.x, st.web); linkPos[li++] = lerpN(s.position.y, n.y, st.web); linkPos[li++] = lerpN(s.position.z, n.z, st.web);
        });
        linkGeo.attributes.position.needsUpdate = true;
        linkLines.material.opacity = 0.55 * st.web;
      },
    };
  },
};
const lerpN = (a, b, t) => a + (b - a) * t;

// ---------------------------------------------------------------------------
// Pyramid of three square frustum tiers inside a pivot so it can flip in place.
export function makePyramid(colors, names, { scale = 1 } = {}) {
  const pivot = new THREE.Group();
  const inner = new THREE.Group();
  pivot.add(inner);
  const tiers = [
    { rb: 9, rt: 6.8, h: 3.2, y: 0 },
    { rb: 6.4, rt: 4.3, h: 3.0, y: 3.5 },
    { rb: 3.9, rt: 0.5, h: 3.8, y: 6.8 },
  ];
  const meshes = tiers.map((tr, i) => {
    const geo = new THREE.CylinderGeometry(tr.rt, tr.rb, tr.h, 4, 1);
    geo.rotateY(Math.PI / 4);
    const g = new THREE.Group();
    const fill = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x041226, emissive: colors[i], emissiveIntensity: 0.25, transparent: true, opacity: 0.55, roughness: 0.4, depthWrite: false }));
    const edges = edgeLines(geo, colors[i], 1);
    g.add(fill, edges);
    g.position.y = tr.y + tr.h / 2;
    const lb = label(names[i], { size: 0.62, color: '#ffffff', bg: 'rgba(3,10,22,0.7)', border: hexColor(colors[i]) });
    lb.position.set(tr.rb * 0.72 + 2.6, 0, 0);
    g.add(lb);
    g.userData = { fill, edges, lb, tr };
    inner.add(g);
    return g;
  });
  inner.position.y = -5.3;
  pivot.position.y = 5.3;
  pivot.scale.setScalar(scale);
  return { pivot, inner, tiers: meshes };
}

export const flip = {
  id: 'flip',
  bg: { a: '#07030a', b: '#2b0b12', c: '#e2231a', mix: [0.3, 0.8, 0, 0.2] },
  bgSteps: [null, { a: '#010812', b: '#043a5e', c: '#00bceb', mix: [1, 0.6, 0, 0.4] }, { a: '#010a0c', b: '#05403f', c: '#2de2c5', mix: [1, 0.6, 0.3, 0.4] }],
  cams: [{ p: [-4, 7, 31], t: [3, 5, 0] }, { p: [-6, 14, 33], t: [3, 6, 0] }, { p: [-8, 8, 31], t: [3, 4.5, 0] }],
  build() {
    const group = new THREE.Group();
    group.position.x = 3;
    const pyr = makePyramid([C.amber, C.pink, C.red], ['Tier 1 engineer', 'Senior engineer', 'Architect']);
    group.add(pyr.pivot);
    const floor = gridFloor(120, 60, C.sky, 0.12);
    floor.position.y = -2.5;
    group.add(floor);

    const clock = label('Time to resolve  00h 00m', { size: 0.9, color: '#ffd5cf', bg: 'rgba(40,6,10,0.75)', border: '#e2231a', mono: true });
    clock.position.set(0, 15, 0);
    group.add(clock);
    let clockText = '';
    const setClock = (txt, good) => {
      if (txt === clockText) return;
      clockText = txt;
      const n = label(txt, { size: 0.9, color: good ? '#d9fff7' : '#ffd5cf', bg: good ? 'rgba(2,30,30,0.8)' : 'rgba(40,6,10,0.75)', border: good ? '#2de2c5' : '#e2231a', mono: true });
      clock.material.map.dispose();
      clock.material.map = n.material.map;
      clock.scale.copy(n.scale);
    };

    // Agentic reach: orbiting agent nodes over the flipped Tier 1 layer.
    const agentsG = new THREE.Group();
    agentsG.position.y = 14;
    group.add(agentsG);
    const agentNames = ['AI Assistant', 'AI Canvas', 'ThousandEyes', 'Splunk', 'Agents'];
    const agentCols = [C.sky, C.teal, C.green, C.pink, C.violet];
    const agents = agentNames.map((n, i) => {
      const a = new THREE.Group();
      const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 1), emissiveMat(agentCols[i], 2.2));
      const gl = glowSprite(agentCols[i], 3, 0.9);
      const lb = label(n, { size: 0.5, color: hexColor(agentCols[i]) });
      lb.position.y = 1;
      a.add(orb, gl, lb);
      a.userData.a = (i / agentNames.length) * Math.PI * 2;
      agentsG.add(a);
      return a;
    });

    const beamGeo = new THREE.BufferGeometry();
    const beamPos = new Float32Array(60 * 6);
    beamGeo.setAttribute('position', new THREE.BufferAttribute(beamPos, 3));
    const beams = new THREE.LineSegments(beamGeo, new THREE.LineBasicMaterial({ color: C.sky, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }));
    group.add(beams);

    // Ticket pool
    const tickets = [];
    for (let i = 0; i < 40; i++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), new THREE.MeshStandardMaterial({ color: 0x220000, emissive: C.red, emissiveIntensity: 1.6 }));
      m.visible = false;
      m.userData = { live: false };
      group.add(m);
      tickets.push(m);
    }
    const trailCurve = new THREE.CatmullRomCurve3([V(1.5, 11.5, 1), V(0.6, 8, 0.4), V(0.2, 4.5, 0), V(0, 0.6, 0)]);
    const trail = drawTube(trailCurve, { radius: 0.12, color: C.teal });
    group.add(trail);
    const ctxLabel = label('Context travels with it:\nevidence · timeline · hypotheses', { size: 0.5, color: '#d9fff7', bg: 'rgba(2,24,26,0.8)', border: '#2de2c5' });
    ctxLabel.position.set(-8, 3, 0);
    group.add(ctxLabel);

    const st = { flip: 0, agents: 0, trail: 0, oldClock: 0, spawn: 0, mode: -1, burst: [] };
    const sparks = points(400, () => [0, -999, 0], { size: 0.35, color: C.green, opacity: 0.95 });
    group.add(sparks);
    const sparkV = new Float32Array(400 * 3);
    const sparkLife = new Float32Array(400);
    let sparkI = 0;
    const burst = (p) => {
      for (let k = 0; k < 18; k++) {
        const i = sparkI++ % 400;
        const pos = sparks.geometry.attributes.position.array;
        pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z;
        sparkV[i * 3] = rr(-3, 3); sparkV[i * 3 + 1] = rr(1, 5); sparkV[i * 3 + 2] = rr(-3, 3);
        sparkLife[i] = 1;
      }
    };

    function resetTickets() { tickets.forEach((tk) => { tk.visible = false; tk.userData.live = false; }); }

    return {
      group,
      update(dt, t, step) {
        const mode = step === 0 ? 0 : 1;
        if (mode !== st.mode) { resetTickets(); st.mode = mode; st.spawn = 0; st.oldClock = 0; }
        st.flip = damp(st.flip, mode, 2.4, dt);
        st.agents = damp(st.agents, mode, 2, dt);
        st.trail = damp(st.trail, step >= 2 ? 1 : 0, 1.5, dt);
        pyr.pivot.rotation.z = smooth(st.flip) * Math.PI;
        // Labels on a flipped pivot still face the camera; just mirror their x offset.
        pyr.tiers.forEach((tg) => { tg.userData.lb.position.x = (tg.userData.tr.rb * 0.72 + 2.6) * (st.flip > 0.5 ? -1 : 1); });
        setOpacity(agentsG, smooth(st.agents));
        agents.forEach((a, i) => {
          const ang = a.userData.a + t * 0.35;
          a.position.set(Math.cos(ang) * 7.5, Math.sin(t * 1.3 + i) * 0.4, Math.sin(ang) * 4.5);
        });
        trail.userData.setProgress(st.trail);
        setOpacity(ctxLabel, smooth(st.trail));

        let bi = 0;
        if (mode === 0) {
          st.oldClock += dt;
          const mins = Math.min(640, Math.floor(st.oldClock * 38));
          setClock(`Time to resolve  ${String(Math.floor(mins / 60)).padStart(2, '0')}h ${String(mins % 60).padStart(2, '0')}m${mins >= 600 ? '+' : ''}`, false);
          // Tickets climb the escalation ladder with long stalls at each tier.
          st.spawn -= dt;
          if (st.spawn <= 0) {
            const tk = tickets.find((x) => !x.userData.live);
            if (tk) { tk.userData = { live: true, p: 0, x: rr(-4, 4), z: rr(-2, 2) }; tk.visible = true; tk.material.emissive.setHex(C.red); tk.scale.setScalar(1); }
            st.spawn = 1.6;
          }
          tickets.forEach((tk) => {
            if (!tk.userData.live) return;
            const u = tk.userData;
            u.p += dt * 0.11;
            const stage = Math.floor(u.p * 3);
            const local = (u.p * 3) % 1;
            const climb = smooth((local - 0.75) / 0.25);
            const ys = [1.6, 5.0, 8.6, 12];
            const y = ys[Math.min(3, stage)] + (ys[Math.min(3, stage + 1)] - ys[Math.min(3, stage)]) * climb;
            const shrink = [1, 0.7, 0.35, 0.2][Math.min(3, stage)];
            tk.position.set(u.x * shrink * (1 - climb * 0.3), y, u.z * shrink);
            tk.rotation.y = t + u.x;
            tk.material.emissive.setHex(stage === 0 ? C.amber : stage === 1 ? C.pink : C.red);
            if (u.p >= 1) { u.live = false; tk.visible = false; }
          });
        } else {
          setClock(step >= 2 ? 'Escalations arrive with context' : 'Time to resolve  < 10 min', true);
          st.spawn -= dt;
          if (st.spawn <= 0) {
            const tk = tickets.find((x) => !x.userData.live);
            if (tk) {
              const hard = Math.random() < 0.14;
              tk.userData = { live: true, x: rr(-5, 5), z: rr(-4, 4), y: 24, vy: 0, landed: -1, hard, phase: 0 };
              tk.visible = true; tk.scale.setScalar(1);
              tk.material.emissive.setHex(hard ? C.violet : C.amber);
            }
            st.spawn = 0.28;
          }
          const topY = 10.6 * smooth(st.flip) + 1.6 * (1 - smooth(st.flip));
          tickets.forEach((tk) => {
            const u = tk.userData;
            if (!u.live) return;
            if (u.landed < 0) {
              u.vy -= 30 * dt; u.y += u.vy * dt;
              if (u.y <= topY + 0.35) { u.y = topY + 0.35; u.landed = 0; }
              tk.position.set(u.x, u.y, u.z);
            } else {
              u.landed += dt;
              if (!u.hard) {
                if (u.landed > 0.55 && u.phase === 0) { u.phase = 1; tk.material.emissive.setHex(C.green); }
                if (u.landed > 0.8) { burst(tk.position); u.live = false; tk.visible = false; }
                if (bi < 60) {
                  const ag = agents[(Math.abs(Math.floor(u.x * 10)) % agents.length)];
                  const ap = ag.getWorldPosition(new THREE.Vector3()); group.worldToLocal(ap);
                  beamPos.set([ap.x, ap.y, ap.z, tk.position.x, tk.position.y, tk.position.z], bi * 6); bi++;
                }
              } else {
                const k = Math.min(1, u.landed / 2.2);
                const p = trailCurve.getPoint(k);
                tk.position.lerpVectors(V(u.x, u.y, u.z), p, smooth(k * 1.6));
                tk.rotation.x += dt * 3;
                if (k >= 1) { u.live = false; tk.visible = false; }
              }
            }
          });
        }
        for (let i = bi; i < 60; i++) beamPos.fill(0, i * 6, i * 6 + 6);
        beamGeo.attributes.position.needsUpdate = true;
        beams.visible = mode === 1;

        const sp = sparks.geometry.attributes.position.array;
        for (let i = 0; i < 400; i++) {
          if (sparkLife[i] <= 0) continue;
          sparkLife[i] -= dt * 1.4;
          sparkV[i * 3 + 1] -= 9 * dt;
          sp[i * 3] += sparkV[i * 3] * dt; sp[i * 3 + 1] += sparkV[i * 3 + 1] * dt; sp[i * 3 + 2] += sparkV[i * 3 + 2] * dt;
          if (sparkLife[i] <= 0) sp[i * 3 + 1] = -999;
        }
        sparks.geometry.attributes.position.needsUpdate = true;
      },
    };
  },
};

// ---------------------------------------------------------------------------
export const pyramid = {
  id: 'pyramid',
  bg: { a: '#06040a', b: '#2a1a08', c: '#fbab2c', mix: [0.4, 0.7, 0, 0.3] },
  bgSteps: [null, { a: '#03040e', b: '#14204a', c: '#8e7cff', mix: [1, 0.5, 0, 0.6] }, { a: '#020a10', b: '#06385a', c: '#ffd95a', mix: [1, 0.8, 0, 0.5] }],
  cams: [{ p: [-3, 6, 30], t: [3, 6, 0] }, { p: [-6, 10, 32], t: [3, 4, 0] }, { p: [-10, 16, 36], t: [3, 6, 0] }],
  build() {
    const group = new THREE.Group();
    group.position.x = 3;
    const floor = gridFloor(140, 70, C.amber, 0.12);
    group.add(floor);

    // Old way: inverted stack of question bricks balanced on a point.
    const wobble = new THREE.Group();
    group.add(wobble);
    const qs = ['what is cloud control?', 'ok, for a hospital', 'add splunk too', 'can it be visual?', 'no, more like a map', 'who is the audience again?'];
    const bricks = qs.map((q, i) => {
      const w = 1.4 + i * 1.7;
      const b = wireBox(w, 1.3, 2.4, C.amber, 0.12, 0.9);
      b.position.y = 0.65 + i * 1.45;
      const lb = label(q, { size: 0.42, color: '#ffe2b0' });
      lb.position.set(0, 0, 1.4);
      b.add(lb);
      wobble.add(b);
      return b;
    });

    // New way: solid foundation of eight colored blocks, iterations narrowing to a peak.
    const upright = new THREE.Group();
    group.add(upright);
    const base = new THREE.Group();
    upright.add(base);
    const bw = 18;
    BLOCKS.forEach((bk, i) => {
      const col = new THREE.Color(bk.color).getHex();
      const seg = wireBox(bw / 8 - 0.1, 2, 7, col, 0.35, 1);
      seg.position.set(-bw / 2 + (i + 0.5) * (bw / 8), 1, 0);
      base.add(seg);
    });
    const baseLb = label('One-shot foundation: 8 blocks + research', { size: 0.6, color: '#ffffff', bg: 'rgba(5,10,30,0.75)', border: '#8e7cff' });
    baseLb.position.set(0, 1, 5.2);
    base.add(baseLb);
    const iters = ['Iteration 1 · debug the map', 'Iteration 2 · add focus mode', 'Iteration 3 · add narration'];
    const layers = iters.map((name, i) => {
      const w = 14 - i * 4;
      const l = wireBox(w, 1.8, 5.5 - i * 1.2, C.sky, 0.14, 0.9);
      l.position.y = 2 + 0.9 + i * 2;
      const lb = label(name, { size: 0.5, color: '#cdefff' });
      lb.position.set(w / 2 + 3.6, 0, 0);
      l.add(lb);
      upright.add(l);
      return l;
    });
    const peak = new THREE.Mesh(new THREE.OctahedronGeometry(1.1, 0), emissiveMat(C.gold, 2.5));
    peak.position.y = 9.6;
    const peakGlow = glowSprite(C.gold, 7, 0.9);
    peak.add(peakGlow);
    const peakLb = label('Your outcome', { size: 0.6, color: '#fff3c4' });
    peakLb.position.y = 1.9;
    peak.add(peakLb);
    upright.add(peak);

    const track = new THREE.Mesh(new THREE.TorusGeometry(15, 0.06, 6, 200), new THREE.MeshBasicMaterial({ color: C.gold, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending }));
    track.rotation.x = Math.PI / 2; track.position.y = 0.05;
    group.add(track);
    const car = new THREE.Group();
    const carBody = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 0.8), emissiveMat(C.gold, 2));
    car.add(carBody, glowSprite(C.gold, 3, 0.9));
    const carTrail = points(60, () => [0, -999, 0], { size: 0.5, color: C.gold, opacity: 0.8 });
    group.add(car, carTrail);
    const trailHist = [];

    const st = { old: 1, up: 0, it: 0, track: 0 };
    return {
      group,
      update(dt, t, step) {
        st.old = damp(st.old, step === 0 ? 1 : 0, 3, dt);
        st.up = damp(st.up, step >= 1 ? 1 : 0, 2.2, dt);
        st.it = damp(st.it, step >= 1 ? (step >= 2 ? 3 : 1.2) : 0, 1.4, dt);
        st.track = damp(st.track, step >= 2 ? 1 : 0, 2, dt);
        const shown = Math.min(qs.length, Math.floor(t * 1.6) + 1);
        bricks.forEach((b, i) => setOpacity(b, (i < shown ? 1 : 0) * st.old));
        wobble.rotation.z = Math.sin(t * 1.7) * 0.12 * st.old;
        wobble.position.y = -8 * (1 - st.old);
        wobble.visible = st.old > 0.01;
        const k = smooth(st.up);
        upright.position.y = 18 * (1 - k);
        setOpacity(base, k);
        layers.forEach((l, i) => {
          const s = clamp01(st.it - i);
          l.scale.set(1, Math.max(0.001, smooth(s)), 1);
          setOpacity(l, smooth(s));
        });
        setOpacity(peak, smooth(clamp01(st.it - 2.2)));
        peak.rotation.y = t;
        setOpacity(track, st.track);
        const a = t * 1.3;
        car.position.set(Math.cos(a) * 15, 0.4, Math.sin(a) * 15);
        car.rotation.y = -a - Math.PI / 2;
        setOpacity(car, st.track);
        trailHist.unshift(car.position.clone());
        if (trailHist.length > 60) trailHist.pop();
        const tp = carTrail.geometry.attributes.position.array;
        for (let i = 0; i < 60; i++) {
          const p = trailHist[i] || car.position;
          tp[i * 3] = p.x; tp[i * 3 + 1] = st.track > 0.05 ? p.y : -999; tp[i * 3 + 2] = p.z;
        }
        carTrail.geometry.attributes.position.needsUpdate = true;
      },
    };
  },
};

// ---------------------------------------------------------------------------
export const anatomy = {
  id: 'anatomy',
  bg: { a: '#030312', b: '#101a44', c: '#8e7cff', mix: [1, 0.3, 0.2, 0.7] },
  cams: [{ p: [0, 3, 30], t: [4, 1, 0] }],
  build() {
    const group = new THREE.Group();
    group.position.x = 4;
    const core = new THREE.Group();
    group.add(core);
    const heart = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 2), new THREE.MeshStandardMaterial({ color: 0x050816, emissive: C.white, emissiveIntensity: 0.4, flatShading: true }));
    const heartGlow = glowSprite(C.white, 10, 0.5);
    core.add(heart, heartGlow);
    const promptLb = label('PROMPT', { size: 0.5, color: '#ffffff', mono: true });
    promptLb.position.y = -2.6;
    core.add(promptLb);

    const rings = BLOCKS.map((b, i) => {
      const col = new THREE.Color(b.color).getHex();
      const r = new THREE.Mesh(new THREE.TorusGeometry(2.6 + i * 0.42, 0.05, 6, 160), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending }));
      r.rotation.set(rr(-1, 1), rr(-1, 1), 0);
      r.userData.spin = V(rr(-0.6, 0.6), rr(-0.6, 0.6), rr(-0.3, 0.3));
      core.add(r);
      return r;
    });

    const short = [
      'Three.js 3D world', 'the account', 'who + what', 'ingredients', 'look it up', 'decide, don\u2019t ask', '5 hours', 'raise the bar',
    ];
    const tiles = BLOCKS.map((b, i) => {
      const tile = canvasPanel(5.2, 2.2, (g, w, h) => {
        g.fillStyle = 'rgba(4,10,26,0.88)';
        roundRect(g, 6, 6, w - 12, h - 12, 28); g.fill();
        g.strokeStyle = b.color; g.lineWidth = 6; g.stroke();
        g.fillStyle = b.color; g.fillRect(6, 6, 16, h - 12);
        g.font = `700 ${h * 0.11}px "JetBrains Mono", monospace`;
        g.fillText(String(i + 1).padStart(2, '0'), 44, h * 0.24);
        g.fillStyle = '#ffffff';
        g.font = `700 ${h * 0.17}px Inter, Arial`;
        g.fillText(b.label, 44, h * 0.5);
        g.fillStyle = 'rgba(220,230,245,0.8)';
        g.font = `400 ${h * 0.13}px Inter, Arial`;
        g.fillText(short[i], 44, h * 0.76);
      }, 200);
      const ang = (i / BLOCKS.length) * Math.PI * 2;
      tile.userData = { ang, glow: glowSprite(new THREE.Color(b.color).getHex(), 9, 0) };
      tile.add(tile.userData.glow);
      tile.userData.glow.position.z = -0.2;
      group.add(tile);
      return tile;
    });

    const st = { focus: -1, feed: 0 };
    tiles.forEach((tl) => { tl.userData.k = 0; });
    return {
      group,
      update(dt, t, step) {
        const focus = step - 1;
        st.feed = damp(st.feed, Math.max(0, step), 2.5, dt);
        heart.rotation.y = t * 0.4; heart.rotation.x = t * 0.2;
        heart.material.emissiveIntensity = 0.3 + st.feed * 0.12;
        heartGlow.scale.setScalar(8 + st.feed * 1.2);
        rings.forEach((r, i) => {
          const on = clamp01(st.feed - i);
          r.scale.setScalar(Math.max(0.001, smooth(on)));
          r.visible = on > 0.01;
          r.rotation.x += r.userData.spin.x * dt; r.rotation.y += r.userData.spin.y * dt;
        });
        tiles.forEach((tl, i) => {
          const u = tl.userData;
          const isF = i === focus;
          u.k = damp(u.k, isF ? 1 : 0, 4, dt);
          const done = i < focus;
          const a = u.ang + t * 0.08;
          const rx = 10.5, rz = 5.5;
          const ox = Math.cos(a) * rx, oy = Math.sin(a * 2) * 0.6 + Math.sin(a) * 3.2, oz = Math.sin(a) * rz - 1;
          const fx = 0, fy = 0, fz = 9;
          tl.position.set(ox + (fx - ox) * u.k, oy + (fy - oy) * u.k, oz + (fz - oz) * u.k);
          tl.scale.setScalar(0.8 + u.k * 0.75);
          tl.lookAt(group.position.x + tl.position.x * 0.2, group.position.y + tl.position.y * 0.2, group.position.z + 40);
          tl.material.opacity = focus < 0 ? 1 : isF ? 1 : done ? 0.55 : 0.32;
          u.glow.material.opacity = u.k * 0.6;
        });
      },
    };
  },
};
