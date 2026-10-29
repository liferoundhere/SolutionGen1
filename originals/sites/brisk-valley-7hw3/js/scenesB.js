import * as THREE from 'three';
import {
  C, damp, smooth, clamp01, rr, glowSprite, label, canvasPanel, roundRect, wireBox,
  gridFloor, points, drawTube, setOpacity, emissiveMat, edgeLines, hexColor, arc, person, plane, OVERLAY,
} from './core.js';
import { BLOCKS, VERSES } from './content.js';
import { bridgeBars, makePyramid } from './scenesA.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const col = (h) => new THREE.Color(h).getHex();

// Shared state the workshop form writes into (main.js owns the DOM).
export const workshopState = { filled: new Array(8).fill(0), timer: 0 };

// ---------------------------------------------------------------------------
// Media screen: a glass framed 16:9 display that crossfades screenshots and can
// play a muted looping clip from the verse. Texture loading needs http(s).
const loader = new THREE.TextureLoader();
const texCache = new Map();
function tex(file) {
  if (!texCache.has(file)) {
    const t = loader.load(`media/${file}`);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    texCache.set(file, t);
  }
  return texCache.get(file);
}

function mediaScreen({ w = 10.5, accent = C.sky, url = '' } = {}) {
  const h = w * 9 / 16;
  const g = new THREE.Group();
  const frame = canvasPanel(w + 0.9, h + 1.5, (c, W, H) => {
    c.fillStyle = 'rgba(7,24,45,0.78)';
    roundRect(c, 4, 4, W - 8, H - 8, 30); c.fill();
    c.strokeStyle = hexColor(accent); c.globalAlpha = 0.85; c.lineWidth = 4; c.stroke(); c.globalAlpha = 1;
    ['#e2231a', '#fbab18', '#6cc04a'].forEach((d, i) => { c.fillStyle = d; c.beginPath(); c.arc(34 + i * 30, 34, 9, 0, Math.PI * 2); c.fill(); });
    c.fillStyle = 'rgba(155,231,255,0.10)'; roundRect(c, 140, 18, W - 280, 34, 17); c.fill();
    c.fillStyle = '#9fb3c8'; c.font = '500 22px "JetBrains Mono", monospace';
    c.fillText(url.replace('https://', ''), 160, 43);
  }, 220);
  frame.position.set(0, 0.3, -0.06);
  g.add(frame);
  const mats = [0, 1].map(() => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, toneMapped: false, fog: false }));
  const planes = mats.map((m, i) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
    p.position.set(0, -0.1, i * 0.01);
    p.layers.set(OVERLAY);
    g.add(p);
    return p;
  });
  const halo = glowSprite(accent, w * 1.6, 0.18);
  halo.position.z = -0.4;
  g.add(halo);
  let video = null, vtex = null;
  let cur = -1, front = 0, k = 1;
  const api = {
    group: g,
    show(src) {
      if (src === cur) return;
      cur = src;
      front = 1 - front;
      let map;
      if (typeof src === 'string' && src.endsWith('.mp4')) {
        if (!video) {
          video = document.createElement('video');
          video.src = `media/${src}`; video.muted = true; video.loop = true; video.playsInline = true; video.crossOrigin = 'anonymous';
          vtex = new THREE.VideoTexture(video); vtex.colorSpace = THREE.SRGBColorSpace;
        }
        video.currentTime = 0; video.play().catch(() => {});
        map = vtex;
      } else {
        if (video) video.pause();
        map = src ? tex(src) : null;
      }
      mats[front].map = map; mats[front].needsUpdate = true;
      planes[front].position.z = 0.01; planes[1 - front].position.z = 0;
      k = 0;
    },
    update(dt, vis = 1) {
      k = damp(k, 1, 5, dt);
      mats[front].opacity = (mats[front].map ? 1 : 0) * vis * smooth(k);
      mats[1 - front].opacity = (mats[1 - front].map ? 1 : 0) * vis * (1 - smooth(k));
      setOpacity(frame, vis);
      halo.material.opacity = 0.18 * vis;
    },
    stop() { if (video) video.pause(); cur = -1; },
  };
  return api;
}

const VCAMS = [{ p: [-3, 12, 31], t: [3, 3.5, 0] }, { p: [3, 8, 27], t: [3.5, 3.5, 0] }, { p: [-9, 10, 27], t: [2.5, 3.5, 0] }, { p: [1, 15, 29], t: [3, 3, 0] }];

// Wraps a diorama with a media screen. step -> media source.
function verseScene(cfg) {
  const verse = VERSES.find((v) => v.key === cfg.verse);
  return {
    id: cfg.id,
    bg: cfg.bg,
    bgSteps: cfg.bgSteps,
    cams: cfg.cams || VCAMS,
    build() {
      const group = new THREE.Group();
      const d = cfg.diorama(group);
      const root = group.children[0];
      const sc = cfg.scale ?? 0.7;
      root.position.set(...(cfg.dpos || [-1, 0, -2]));
      root.scale.setScalar(sc);
      root.traverse((n) => {
        if (n.isSprite && n.userData.baseScale) { n.scale.multiplyScalar(0.82 / sc); n.userData.baseScale.copy(n.scale); }
      });
      let screen = null;
      if (cfg.media) {
        screen = mediaScreen({ accent: col(verse.color), url: verse.url, w: cfg.screenW || 10.5 });
        const sp = cfg.screenPos || [9.5, 7.4, -1];
        screen.group.position.set(...sp);
        screen.group.rotation.y = cfg.screenRot ?? -0.3;
        group.add(screen.group);
      }
      const seq = cfg.media ? [cfg.media[0], cfg.video || cfg.media[1], ...cfg.media.slice(1)] : [];
      let vis = 0;
      return {
        group,
        update(dt, t, step) {
          vis = damp(vis, 1, 2.5, dt);
          d.update(dt, t, step);
          if (screen) {
            screen.show(seq[Math.min(step, seq.length - 1)]);
            screen.update(dt, vis);
            screen.group.position.y = (cfg.screenPos ? cfg.screenPos[1] : 7.4) + Math.sin(t * 0.8) * 0.15;
          }
        },
        reset() { vis = 0; if (screen) screen.stop(); d.reset?.(); },
        leave() { if (screen) screen.stop(); },
      };
    },
  };
}

function pulseRing(color, r = 1) {
  const m = new THREE.Mesh(new THREE.RingGeometry(r * 0.92, r, 64), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  return m;
}

// ---------------------------------------------------------------------------
// The multiverse: lineage spiral around the method core.
export const galaxy = {
  id: 'galaxy',
  bg: { a: '#02030c', b: '#140c3a', c: '#00bceb', mix: [0.6, 0, 0, 1] },
  cams: [{ p: [0, 18, 40], t: [0, 0, 0] }, { p: [4, 12, 34], t: [0, 1, 0] }],
  build() {
    const group = new THREE.Group();
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(2.2, 3), new THREE.MeshStandardMaterial({ color: 0x050e1d, emissive: C.sky, emissiveIntensity: 0.7, flatShading: true }));
    group.add(core, glowSprite(C.sky, 16, 0.55));
    const coreLb = label('8-block method', { size: 0.6, color: '#9be7ff', mono: true });
    coreLb.position.y = -3.3; group.add(coreLb);
    BLOCKS.forEach((b, i) => {
      const r = new THREE.Mesh(new THREE.TorusGeometry(3 + i * 0.18, 0.025, 6, 140), new THREE.MeshBasicMaterial({ color: col(b.color), transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending }));
      r.rotation.set(Math.PI / 2 + rr(-0.5, 0.5), rr(-0.5, 0.5), 0);
      group.add(r);
    });
    const arms = points(5200, (i) => {
      const arm = i % 3, rad = Math.pow(rr(0, 1), 0.7) * 30 + 4;
      const a = rad * 0.22 + arm * (Math.PI * 2 / 3) + rr(-0.35, 0.35);
      return [Math.cos(a) * rad, rr(-0.6, 0.6) * (1 - rad / 40), Math.sin(a) * rad];
    }, { size: 0.28, color: 0x7fe3ff, opacity: 0.55 });
    group.add(arms);
    const order = ['delta', 'nyu', 'msk', 'gary', 'anu', 'allen', 'se'];
    const planets = order.map((key, i) => {
      const v = VERSES.find((x) => x.key === key);
      const a = -2.4 + i * 0.95, rad = 9 + i * 2.1;
      const p = new THREE.Group();
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.75 + (key === 'allen' ? 0.35 : 0), 28, 20), new THREE.MeshStandardMaterial({ color: 0x050e1d, emissive: col(v.color), emissiveIntensity: 1.2, roughness: 0.4 }));
      p.add(ball, glowSprite(col(v.color), 5, 0.7));
      const lb = label(`${v.name}\n${v.gen}`, { size: 0.36, color: '#e8f1fb', bg: 'rgba(5,14,29,0.72)', border: v.color });
      lb.position.y = 2.1; p.add(lb);
      p.position.set(Math.cos(a) * rad, 0.6 + i * 0.25, Math.sin(a) * rad);
      group.add(p);
      return p;
    });
    const links = [];
    [[0, 3], [1, 3], [2, 3], [3, 4], [4, 5], [5, 6]].forEach(([a, b]) => {
      const tb = drawTube(arc(planets[a].position, planets[b].position, 3), { radius: 0.05, color: C.ice, opacity: 0.75 });
      group.add(tb); links.push(tb);
    });
    const cost = label('$544 · nights + weekends', { size: 0.9, color: '#ffffff', bg: 'rgba(5,14,29,0.8)', border: '#6cc04a' });
    cost.position.set(0, 6.5, 0); group.add(cost);
    let k = 0, ck = 0;
    return {
      group,
      update(dt, t, step) {
        k = damp(k, 1, 0.9, dt); ck = damp(ck, step >= 1 ? 1 : 0, 3, dt);
        core.rotation.y = t * 0.3;
        arms.rotation.y = -t * 0.02;
        planets.forEach((p, i) => { p.scale.setScalar(Math.max(0.001, smooth(k * 7 - i))); p.children[0].rotation.y = t; });
        links.forEach((l, i) => l.userData.setProgress(smooth(k * 7 - 1.5 - i)));
        setOpacity(cost, ck);
        cost.scale.copy(cost.userData.baseScale).multiplyScalar(0.6 + ck * 0.4);
      },
      reset() { k = 0; },
    };
  },
};

// ---------------------------------------------------------------------------
export const delta = verseScene({
  id: 'delta', verse: 'delta',
  bg: { a: '#04060f', b: '#2a0c18', c: '#e2231a', mix: [0.3, 1, 0, 0.4] },
  bgSteps: [null, { a: '#03070f', b: '#0b2440', c: '#00bceb', mix: [0.5, 1, 0, 0.4] }, { a: '#05070f', b: '#20243a', c: '#9be7ff', mix: [0.2, 0.6, 0.8, 0.3] }],
  media: ['delta-hero.jpg', 'delta-tour.jpg', 'delta-tour-2.jpg'], video: 'delta-tour.mp4',
  scale: 0.66, dpos: [0, 1, 0],
  diorama(group) {
    const d = new THREE.Group(); d.position.set(-6, 0, -2); group.add(d);
    d.add(gridFloor(80, 40, C.sky, 0.12));
    const term = wireBox(5, 1.6, 9, C.ice, 0.1, 0.8); term.position.set(-13, 0.8, 0); d.add(term);
    const tl = label('Domestic terminal', { size: 0.42, color: '#9be7ff' }); tl.position.set(-13, 2.4, 0); d.add(tl);
    const names = ['T', 'A', 'B', 'C', 'D', 'E', 'F'];
    const kiosks = [];
    names.forEach((n, i) => {
      const x = -8 + i * 3.4;
      const cc = wireBox(1.1, 0.8, 14, i === 6 ? C.amber : C.sky, 0.1, 0.85); cc.position.set(x, 0.4, 0); d.add(cc);
      const lb = label(n, { size: 0.7, color: '#ffffff', weight: 800 }); lb.position.set(x, 2, -7.6); d.add(lb);
      for (let s = -1; s <= 1; s += 2) {
        const pl = plane(i % 2 ? C.sky : C.red, 0.32);
        pl.position.set(x + s * 1.4, 0.35, rr(-5, 5)); pl.rotation.y = s > 0 ? 0 : Math.PI; d.add(pl);
      }
      const k = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), emissiveMat(C.red, 2));
      k.position.set(x, 1.1, 5.5); d.add(k); kiosks.push(k);
    });
    const train = new THREE.Mesh(new THREE.BoxGeometry(32, 0.06, 0.18), emissiveMat(C.teal, 1.4));
    train.position.set(-2.8, -0.4, 0); d.add(train);
    const pod = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.9, 4, 8), emissiveMat(C.white, 2));
    pod.rotation.z = Math.PI / 2; pod.position.y = -0.4; d.add(pod);
    const ptl = label('Plane Train', { size: 0.38, color: '#2de2c5' }); ptl.position.set(-2.8, -1.2, 1.6); d.add(ptl);
    const runway = new THREE.Mesh(new THREE.PlaneGeometry(40, 1.6), new THREE.MeshBasicMaterial({ color: 0x0d274d, transparent: true, opacity: 0.8 }));
    runway.rotation.x = -Math.PI / 2; runway.position.set(-2, 0.02, -11); d.add(runway);
    const flyer = plane(C.red, 0.5); d.add(flyer);
    const clouds = points(900, () => [rr(-25, 20), rr(7, 12), rr(-14, 10)], { size: 1.4, color: 0x9fb3c8, opacity: 0.0 });
    d.add(clouds);
    const wx = label('KATL live weather', { size: 0.45, color: '#e8f1fb', bg: 'rgba(5,14,29,0.75)', border: '#9be7ff' }); wx.position.set(-12, 9, 0); d.add(wx);
    const personas = [];
    for (let i = 0; i < 12; i++) {
      const p = person(i % 3 === 0 ? C.green : C.ice, 0.55);
      const a = (i / 12) * Math.PI * 2;
      p.position.set(-13 + Math.cos(a) * 3.2, 1.6, Math.sin(a) * 3.2);
      d.add(p); personas.push(p);
    }
    let pk = 0, wk = 0;
    return {
      update(dt, t, step) {
        pod.position.x = -2.8 + Math.sin(t * 0.6) * 15;
        const ft = (t * 0.08) % 1;
        flyer.position.set(-20 + ft * 44, 0.3 + Math.max(0, ft - 0.45) * 14, -11);
        flyer.rotation.z = ft > 0.45 ? 0.2 : 0;
        kiosks.forEach((k, i) => k.material.emissive.setHex(step >= 1 ? C.green : (i === 1 && Math.sin(t * 6) > 0 ? C.red : C.amber)));
        pk = damp(pk, step >= 1 ? 1 : 0, 3, dt);
        personas.forEach((p, i) => { p.scale.setScalar(0.001 + 0.55 * smooth(pk * 12 - i)); p.position.y = 1.6 + Math.sin(t * 2 + i) * 0.1; });
        wk = damp(wk, step >= 2 ? 1 : 0, 2, dt);
        clouds.material.opacity = 0.18 * wk; clouds.position.x = Math.sin(t * 0.1) * 3;
        setOpacity(wx, wk);
      },
    };
  },
});

// ---------------------------------------------------------------------------
export const nyu = verseScene({
  id: 'nyu', verse: 'nyu',
  bg: { a: '#06030f', b: '#1d0d3d', c: '#a66bff', mix: [1, 0.4, 0, 0.5] },
  bgSteps: [null, { a: '#03060f', b: '#0d274d', c: '#a66bff', mix: [1, 0.2, 0.5, 0.5] }, { a: '#05050c', b: '#2a1b08', c: '#fbab18', mix: [0.6, 0.6, 0, 0.4] }],
  media: ['nyu-hero.jpg', 'nyu-tour.jpg', 'nyu-cart.jpg'], video: 'nyu-cart.mp4',
  scale: 0.62, dpos: [0, 0, -2],
  diorama(group) {
    const d = new THREE.Group(); d.position.set(-7, 0, -1); group.add(d);
    d.add(gridFloor(70, 35, 0xa66bff, 0.12));
    const ave = new THREE.Mesh(new THREE.PlaneGeometry(2, 40), new THREE.MeshBasicMaterial({ color: 0x0d274d, transparent: true, opacity: 0.8 }));
    ave.rotation.x = -Math.PI / 2; ave.position.set(5, 0.01, 0); d.add(ave);
    const al = label('First Avenue', { size: 0.4, color: '#9fb3c8' }); al.position.set(5, 0.6, 12); d.add(al);
    const blds = [[-6, -6, 3, 9], [-1, -7, 2.5, 6], [-6, 0, 3.5, 12], [-1, 0, 2.6, 8], [-6, 6, 3, 7], [-1, 6, 2.2, 10], [1.8, -3, 1.8, 5], [1.8, 3, 1.8, 4]];
    const floors = [];
    blds.forEach(([x, z, w, h], i) => {
      const b = wireBox(w, h, w, i === 2 ? 0xa66bff : C.ice, 0.08, 0.7); b.position.set(x, h / 2, z); d.add(b);
      for (let f = 1; f < h; f += 1.2) {
        const fl = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.96, w * 0.96), new THREE.MeshBasicMaterial({ color: 0xa66bff, transparent: true, opacity: 0.06, side: THREE.DoubleSide, depthWrite: false }));
        fl.rotation.x = -Math.PI / 2; fl.position.set(x, f, z); d.add(fl); floors.push(fl);
      }
    });
    const halo = new THREE.Group(); halo.position.set(-2.5, 15, 0); d.add(halo);
    halo.add(new THREE.Mesh(new THREE.TorusGeometry(9, 0.05, 8, 200), new THREE.MeshBasicMaterial({ color: 0xa66bff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending })));
    const tech = ['Epic', 'Webex', 'Cisco Spaces', 'Splunk', 'ThousandEyes', 'Secure Access', 'Cloud Control', 'Meraki', 'XDR'];
    const techLb = tech.map((n, i) => { const l = label(n, { size: 0.45, color: '#e8f1fb', bg: 'rgba(5,14,29,0.7)', border: '#a66bff' }); halo.add(l); return l; });
    halo.rotation.x = 0.12;
    const lenses = ['Leadership', 'Clinical', 'Labs', 'Network + Security', 'Facilities', 'Patients'];
    const lensLb = lenses.map((n, i) => { const l = label(n, { size: 0.42, color: '#ffffff', bg: 'rgba(25,12,50,0.8)', border: '#a66bff' }); l.position.set(-9 + i * 3.6, 0.6, 11); d.add(l); return l; });
    const cartPts = [V(-6, 4.2, 3), V(-3, 4.2, 3), V(-1, 4.2, 1), V(-1, 4.2, -2)];
    const manualPts = [V(-6, 4.2, 3), V(-8, 4.2, -2), V(-4, 6.6, -6), V(1, 2.6, -6), V(2, 1.4, 2), V(-4, 8, 1), V(-1, 4.2, -2)];
    const fast = drawTube(new THREE.CatmullRomCurve3(cartPts), { radius: 0.12, color: C.green });
    const slow = drawTube(new THREE.CatmullRomCurve3(manualPts), { radius: 0.09, color: C.amber });
    d.add(fast, slow);
    const lf = label('With Cisco · Spaces finds it', { size: 0.42, color: '#d8ffd0', bg: 'rgba(8,30,10,0.8)', border: '#6cc04a' }); lf.position.set(-2, 6.5, 3); d.add(lf);
    const ls = label('Manual · the hunt', { size: 0.42, color: '#ffe8bf', bg: 'rgba(40,24,4,0.8)', border: '#fbab18' }); ls.position.set(-5, 9.6, -6); d.add(ls);
    let hk = 0, lk = 0, ck = 0;
    return {
      update(dt, t, step) {
        hk = damp(hk, 1, 1.2, dt); lk = damp(lk, step >= 1 ? 1 : 0, 2.5, dt); ck = damp(ck, step >= 2 ? 1 : 0, 0.9, dt);
        halo.rotation.y = t * 0.12; halo.scale.setScalar(Math.max(0.001, smooth(hk)));
        techLb.forEach((l, i) => { const a = (i / tech.length) * Math.PI * 2 - t * 0.12 * 0; l.position.set(Math.cos(a) * 9, 0.4, Math.sin(a) * 9); });
        lensLb.forEach((l, i) => setOpacity(l, smooth(lk * 6 - i)));
        floors.forEach((f, i) => { f.material.opacity = 0.05 + 0.12 * lk * (0.5 + 0.5 * Math.sin(t * 2 + i)); });
        fast.userData.setProgress(ck * 1.6); slow.userData.setProgress(ck * 0.75);
        setOpacity(lf, clamp01(ck * 1.6 - 0.6)); setOpacity(ls, clamp01(ck * 1.2 - 0.3));
      },
    };
  },
});

// ---------------------------------------------------------------------------
export const msk = verseScene({
  id: 'msk', verse: 'msk',
  bg: { a: '#020a0c', b: '#06302f', c: '#2de2c5', mix: [0.8, 0.5, 0.4, 0.3] },
  bgSteps: [null, { a: '#020a0c', b: '#0a2a3a', c: '#2de2c5', mix: [0.6, 0.3, 0.8, 0.3] }, { a: '#08040a', b: '#2a0610', c: '#e2231a', mix: [0.4, 0.6, 0.2, 0.3] }],
  media: ['msk-hero.jpg', 'msk-tour.jpg', 'msk-scenario.jpg'], video: 'msk-scenario.mp4',
  scale: 0.6, dpos: [0, 0, -2],
  diorama(group) {
    const d = new THREE.Group(); d.position.set(-8, 0, -2); group.add(d);
    d.add(gridFloor(70, 35, C.teal, 0.12));
    const towers = [[-4, 0, 4.5, 16], [1.5, -1, 3.6, 12], [-2, 6, 3.4, 9], [4.5, 5, 2.8, 7]];
    const cars = [], ai = [];
    towers.forEach(([x, z, w, h], ti) => {
      for (let f = 0; f < h; f += 0.9) {
        const slab = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, w), new THREE.MeshBasicMaterial({ color: C.teal, transparent: true, opacity: 0.16, depthWrite: false }));
        slab.position.set(x, f, z); d.add(slab);
      }
      const shell = wireBox(w, h, w, C.ice, 0.04, 0.55); shell.position.set(x, h / 2, z); d.add(shell);
      for (let e = 0; e < 2; e++) {
        const ex = x - w / 2 + 0.6 + e * 0.7;
        const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.06, h, 0.06), emissiveMat(C.sky, 1));
        shaft.position.set(ex, h / 2, z + w / 2); d.add(shaft);
        const car = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.2), emissiveMat(C.white, 1.6));
        car.position.set(ex, 0, z + w / 2); car.userData = { h, ph: rr(0, 6), sp: rr(0.25, 0.5) }; d.add(car); cars.push(car);
      }
      for (let a = 0; a < 3; a++) {
        const dot = glowSprite(C.green, 1.4, 0); dot.position.set(x + rr(-w / 3, w / 3), rr(1, h - 1), z + rr(-w / 3, w / 3)); d.add(dot); ai.push(dot);
      }
    });
    const lenses = ['Leadership', 'Hospital Ops', 'Clinical Ops', 'Network + Sec', 'Facilities', 'Public Safety', 'Patient + Family'];
    const lensRing = new THREE.Group(); lensRing.position.set(-1, 0.4, 2); d.add(lensRing);
    const lensLb = lenses.map((n, i) => {
      const l = label(n, { size: 0.4, color: '#e8fffb', bg: 'rgba(2,26,26,0.8)', border: '#2de2c5' });
      const a = (i / lenses.length) * Math.PI * 2; l.position.set(Math.cos(a) * 10, 0.6, Math.sin(a) * 10); lensRing.add(l); return l;
    });
    const cart = glowSprite(C.red, 2.4, 0); cart.position.set(1.5, 7.2, -1); d.add(cart);
    const ring = pulseRing(C.red, 1.6); ring.position.set(1.5, 7.2, -1); d.add(ring);
    const t3 = label('With Cisco · 3 min', { size: 0.55, color: '#d8ffd0', bg: 'rgba(8,30,10,0.85)', border: '#6cc04a' }); t3.position.set(1.5, 14, 2); d.add(t3);
    const t47 = label('Without · 47 min', { size: 0.55, color: '#ffd5cf', bg: 'rgba(40,6,10,0.85)', border: '#e2231a' }); t47.position.set(1.5, 12.6, 2); d.add(t47);
    let lk = 0, ck = 0;
    return {
      update(dt, t, step) {
        cars.forEach((c) => { c.position.y = (0.5 + 0.5 * Math.sin(t * c.userData.sp + c.userData.ph)) * (c.userData.h - 0.5); });
        lk = damp(lk, step >= 1 ? 1 : 0, 2.2, dt); ck = damp(ck, step >= 2 ? 1 : 0, 2, dt);
        lensLb.forEach((l, i) => setOpacity(l, smooth(lk * 7 - i)));
        lensRing.rotation.y = t * 0.05;
        ai.forEach((a, i) => { a.material.opacity = (0.4 + lk * 0.6) * (0.6 + 0.4 * Math.sin(t * 3 + i)); });
        cart.material.opacity = ck * (0.6 + 0.4 * Math.sin(t * 8));
        const rp = (t * 0.7) % 1; ring.scale.setScalar(1 + rp * 3 * ck); ring.material.opacity = ck * (1 - rp);
        setOpacity(t3, ck); setOpacity(t47, clamp01(ck * 2 - 1));
      },
    };
  },
});

// ---------------------------------------------------------------------------
export const gary = verseScene({
  id: 'gary', verse: 'gary',
  bg: { a: '#0a0603', b: '#2c1a05', c: '#fbab18', mix: [0.7, 0.3, 0, 0.5] },
  bgSteps: [null, { a: '#060a12', b: '#0d274d', c: '#00bceb', mix: [0.5, 0.8, 0, 0.4] }, { a: '#050a07', b: '#0c2a14', c: '#6cc04a', mix: [1, 0.3, 0, 0.4] }],
  media: ['trowe-hero.jpg', 'trowe-tour.jpg', 'trowe-helps.jpg'], video: 'trowe-tour.mp4',
  scale: 0.62, dpos: [0, 0, -2],
  diorama(group) {
    const d = new THREE.Group(); d.position.set(-7, 0, -2); group.add(d);
    d.add(gridFloor(70, 35, C.amber, 0.1));
    const galaxyPts = points(1800, () => { const r = rr(1, 9), a = rr(0, Math.PI * 2); return [Math.cos(a) * r, rr(-0.4, 0.4) + 6, Math.sin(a) * r]; }, { size: 0.3, color: C.amber, opacity: 0.7 });
    d.add(galaxyPts);
    const tgeo = new THREE.BoxGeometry(9, 0.22, 3.2);
    const table = new THREE.Mesh(tgeo, new THREE.MeshStandardMaterial({ color: 0x07182d, emissive: C.sky, emissiveIntensity: 0.12, roughness: 0.2, metalness: 0.6 }));
    table.add(edgeLines(tgeo, C.amber, 0.9)); table.position.set(0, 1.4, 0);
    const room = new THREE.Group(); room.add(table); d.add(room);
    for (let i = 0; i < 10; i++) {
      const s = i < 5 ? -1 : 1, j = i % 5;
      const p = person(i === 2 ? C.amber : C.ice, 0.75); p.position.set(-3.4 + j * 1.7, 0, s * 2.2); room.add(p);
    }
    const places = [['Boardroom', 0, 0], ['Offices', -9, -5], ['Client at home', 9, -6], ['Data center', -9, 6], ['Branch', 9, 6]];
    places.slice(1).forEach(([n, x, z], i) => {
      const b = i === 1 ? wireBox(2.6, 2, 2.6, C.amber, 0.1, 0.85) : wireBox(2.4, 3 + i * 1.3, 2.4, C.ice, 0.08, 0.75);
      b.position.set(x, (i === 1 ? 1 : (3 + i * 1.3) / 2), z); room.add(b);
      const l = label(n, { size: 0.4, color: '#ffe8bf' }); l.position.set(x, 5.6 + i * 0.4, z); room.add(l);
    });
    const canvasP = canvasPanel(7.5, 4.2, (g, w, h) => {
      g.fillStyle = 'rgba(5,14,29,0.9)'; roundRect(g, 4, 4, w - 8, h - 8, 26); g.fill();
      g.strokeStyle = '#6cc04a'; g.lineWidth = 4; g.stroke();
      g.fillStyle = '#9be7ff'; g.font = '700 30px Inter, Arial'; g.fillText('AI Canvas', 30, 52);
      g.fillStyle = 'rgba(0,188,235,0.2)'; roundRect(g, w - 470, 80, 440, 62, 20); g.fill();
      g.fillStyle = '#ffffff'; g.font = '500 26px Inter, Arial'; g.fillText('Where do we stand?', w - 445, 120);
      const lines = [['Client portal latency: recovering', '#6cc04a'], ['Cause: WAN path loss, Baltimore', '#fbab18'], ['Business impact: 2% of logins slowed', '#e8f1fb'], ['Engineers: still on the fix', '#9fb3c8']];
      lines.forEach(([s, c], i) => { g.fillStyle = c; g.font = '500 25px Inter, Arial'; g.fillText(s, 34, 196 + i * 46); });
    }, 220);
    canvasP.position.set(0, 7, 0); canvasP.rotation.y = -0.12; d.add(canvasP);
    const depts = ['NetOps', 'Leadership', 'Customer', 'Partners', 'Operations', 'Facilities'];
    const deptLb = depts.map((n, i) => { const l = label(n, { size: 0.45, color: '#ffffff', bg: 'rgba(40,24,4,0.8)', border: '#fbab18' }); d.add(l); return l; });
    let gk = 1, rk = 0, ak = 0;
    return {
      update(dt, t, step) {
        gk = damp(gk, step === 0 ? 1 : 0, 2, dt); rk = damp(rk, step >= 1 ? 1 : 0, 2, dt); ak = damp(ak, step >= 2 ? 1 : 0, 2.5, dt);
        galaxyPts.material.opacity = 0.7 * gk; galaxyPts.rotation.y = t * 0.2; galaxyPts.visible = gk > 0.01;
        room.scale.setScalar(Math.max(0.001, smooth(rk))); room.visible = rk > 0.01;
        canvasP.material.opacity = ak; canvasP.visible = ak > 0.01; canvasP.position.y = 7 + Math.sin(t) * 0.15;
        deptLb.forEach((l, i) => { const a = (i / 6) * Math.PI * 2 + t * 0.1; l.position.set(Math.cos(a) * 11, 1 + gk * 5, Math.sin(a) * 7); setOpacity(l, 0.35 + 0.65 * gk); });
      },
    };
  },
});

// ---------------------------------------------------------------------------
// Rough continental US outline (lon, lat) used to scatter CSL centers.
const US = [[-124.6, 48.4], [-123, 46], [-124.3, 42], [-120.5, 34.5], [-117.1, 32.5], [-111, 31.3], [-106.5, 31.8], [-103, 29], [-97.4, 25.9], [-97.3, 27.8], [-94, 29.6], [-89.6, 29.3], [-88, 30.5], [-84.5, 29.8], [-82.7, 27.5], [-81, 25.2], [-80, 26.8], [-81.3, 30.5], [-79, 33.6], [-75.5, 35.3], [-76, 37.3], [-74, 40.5], [-70, 41.5], [-70.6, 43], [-67, 44.8], [-69, 47.3], [-71.5, 45], [-75, 45], [-79, 43.3], [-83, 42], [-84.5, 46.5], [-89, 48], [-95.2, 49], [-123, 49]];
function inPoly(x, y, poly) {
  let ins = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)) ins = !ins;
  }
  return ins;
}
const proj = (lon, lat) => V((lon + 96) * 0.62, 0, -(lat - 38) * 0.78);

export const anu = verseScene({
  id: 'anu', verse: 'anu',
  bg: { a: '#030a05', b: '#0b2a12', c: '#6cc04a', mix: [1, 0.4, 0, 0.5] },
  bgSteps: [null, { a: '#050806', b: '#16300a', c: '#6cc04a', mix: [0.7, 0.8, 0, 0.4] }, { a: '#04070e', b: '#0b1f3a', c: '#00bceb', mix: [1, 0.2, 0.4, 0.4] }, { a: '#050a10', b: '#13284a', c: '#9be7ff', mix: [0.4, 0.4, 0, 0.9] }],
  cams: [{ p: [0, 20, 22], t: [3.5, 1, -1] }, { p: [3, 13, 18], t: [4.5, 1, 1] }, { p: [0, 19, 22], t: [3.5, 1.5, -1] }, { p: [6, 12, 19], t: [5, 1.5, -1] }],
  scale: 0.48, dpos: [0, 0, 0],
  media: ['cslmain-hero.jpg', 'cslmain-ripple.jpg', 'cslchamp-story.jpg', 'cslchamp-story-2.jpg'], video: 'cslmain-ripple.mp4',
  screenPos: [10.5, 6, -5],
  diorama(group) {
    const d = new THREE.Group(); d.position.set(-8, 0, -1); group.add(d);
    const outline = new THREE.Line(new THREE.BufferGeometry().setFromPoints([...US, US[0]].map(([lo, la]) => proj(lo, la))), new THREE.LineBasicMaterial({ color: C.green, transparent: true, opacity: 0.6 }));
    d.add(outline);
    const centers = [];
    while (centers.length < 339) { const lo = rr(-124, -67), la = rr(25, 49); if (inPoly(lo, la, US)) centers.push(proj(lo, la)); }
    const cp = points(339, (i) => [centers[i].x, 0.15, centers[i].z], { size: 0.75, color: C.green, opacity: 1 });
    d.add(cp);
    const mobile = proj(-88.04, 30.69), pens = proj(-87.22, 30.42);
    const r1 = pulseRing(C.red, 0.6); r1.position.copy(mobile).setY(0.2); d.add(r1);
    const r2 = pulseRing(C.amber, 0.6); r2.position.copy(pens).setY(0.2); d.add(r2);
    const flow = drawTube(arc(mobile.clone().setY(0.2), pens.clone().setY(0.2), 2.2), { radius: 0.08, color: C.amber });
    d.add(flow);
    const lm = label('Mobile · down', { size: 0.42, color: '#ffd5cf', bg: 'rgba(40,6,10,0.8)', border: '#e2231a' }); lm.position.copy(mobile).setY(2.4).add(V(-2.4, 0, 0)); d.add(lm);
    const lp = label('Pensacola · donors arrive', { size: 0.42, color: '#ffe8bf', bg: 'rgba(40,24,4,0.8)', border: '#fbab18' }); lp.position.copy(pens).setY(3.2).add(V(2.8, 0, 0)); d.add(lp);
    const champ = label('"Every donation depends on the network."', { size: 0.6, color: '#ffffff', bg: 'rgba(5,14,29,0.82)', border: '#6cc04a' }); champ.position.set(0, 6, 0); d.add(champ);
    const dom = new THREE.Group(); const va = proj(-75.6, 36.85); dom.position.copy(va).add(V(3, 0, 0)); d.add(dom);
    const turbines = [];
    for (let i = 0; i < 9; i++) {
      const tg = new THREE.Group();
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.09, 3.2, 8), emissiveMat(C.ice, 0.8)); mast.position.y = 1.6; tg.add(mast);
      const rot = new THREE.Group(); rot.position.y = 3.2;
      for (let b = 0; b < 3; b++) { const bl = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.4, 0.03), emissiveMat(C.white, 1)); bl.position.y = 0.7; const piv = new THREE.Group(); piv.rotation.z = (b / 3) * Math.PI * 2; piv.add(bl); rot.add(piv); }
      tg.add(rot); tg.userData.rot = rot;
      tg.position.set((i % 3) * 1.6, 0, Math.floor(i / 3) * 1.6 - 1.6); dom.add(tg); turbines.push(tg);
    }
    const domLb = label('Dominion Energy · director reporting to the CIO', { size: 0.42, color: '#e8f1fb', bg: 'rgba(5,14,29,0.82)', border: '#00bceb' }); domLb.position.set(1.6, 5.4, 0); dom.add(domLb);
    const grid = drawTube(new THREE.CatmullRomCurve3([va.clone().add(V(3, 0.3, 0)), proj(-77.4, 37.5).setY(0.3), proj(-80, 38.4).setY(0.3), proj(-82, 37.2).setY(0.3)]), { radius: 0.07, color: C.sky });
    d.add(grid);
    let mk = 0, rk = 0, ck = 0, dk = 0;
    return {
      update(dt, t, step) {
        mk = damp(mk, 1, 1.2, dt); rk = damp(rk, step >= 1 ? 1 : 0, 2, dt); ck = damp(ck, step === 2 ? 1 : 0, 3, dt); dk = damp(dk, step >= 3 ? 1 : 0, 2, dt);
        cp.geometry.setDrawRange(0, Math.floor(339 * smooth(mk)));
        outline.material.opacity = 0.6 * mk;
        const p = (t * 0.6) % 1;
        r1.scale.setScalar(1 + p * 4); r1.material.opacity = rk * (1 - p);
        r2.scale.setScalar(1 + ((p + 0.5) % 1) * 3); r2.material.opacity = rk * (1 - ((p + 0.5) % 1)) * 0.8;
        flow.userData.setProgress(rk * 1.2);
        setOpacity(lm, rk * (1 - dk)); setOpacity(lp, rk * (1 - dk));
        setOpacity(champ, ck);
        dom.scale.setScalar(Math.max(0.001, smooth(dk))); dom.visible = dk > 0.01;
        turbines.forEach((tb, i) => { tb.userData.rot.rotation.z = t * (1.2 + i * 0.05); });
        grid.userData.setProgress(dk);
      },
    };
  },
});

// ---------------------------------------------------------------------------
const MISSIONS = [['New York', 40.75, -73.98], ['Cary, NC', 35.79, -78.78], ['Tampa', 27.95, -82.46], ['Tokyo', 35.68, 139.69], ['Mexico City', 19.43, -99.13], ['Santiago', -33.45, -70.67], ['Brighton', 50.82, -0.14], ['Dubai', 25.2, 55.27], ['Noida', 28.54, 77.39], ['Whippany, NJ', 40.82, -74.42]];
function ll(lat, lon, r) {
  const phi = (90 - lat) * Math.PI / 180, th = (lon + 180) * Math.PI / 180;
  return V(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
}
export const allen = verseScene({
  id: 'allen', verse: 'allen',
  bg: { a: '#02060f', b: '#062a4d', c: '#00bceb', mix: [0.8, 0.2, 0.6, 0.7] },
  bgSteps: [null, { a: '#03050c', b: '#0d1f44', c: '#9be7ff', mix: [0.5, 0.3, 0, 1] }, { a: '#030a08', b: '#0b2a24', c: '#6cc04a', mix: [1, 0.5, 0, 0.5] }],
  media: ['metlife-hero.jpg', 'metlife-mission.jpg', 'metlife-timeline.jpg', 'metlife-academy.jpg'], video: 'metlife-mission.mp4',
  dpos: [1, 4, -2], scale: 0.72,
  diorama(group) {
    const d = new THREE.Group(); d.position.set(-7, 4, -2); group.add(d);
    const R = 6;
    const globe = new THREE.Group(); d.add(globe);
    globe.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.985, 48, 32), new THREE.MeshBasicMaterial({ color: 0x07182d, transparent: true, opacity: 0.85 })));
    globe.add(new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(R, 24, 16)), new THREE.LineBasicMaterial({ color: C.sky, transparent: true, opacity: 0.16 })));
    const dots = points(2600, () => { const u = rr(-1, 1), a = rr(0, Math.PI * 2), s = Math.sqrt(1 - u * u); return [R * s * Math.cos(a), R * u, R * s * Math.sin(a)]; }, { size: 0.12, color: C.ice, opacity: 0.6 });
    globe.add(dots);
    const pins = MISSIONS.map(([n, la, lo], i) => {
      const p = new THREE.Group(); const pos = ll(la, lo, R);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6), emissiveMat(C.green, 1.6));
      stem.position.y = 0.6; p.add(stem);
      const head = glowSprite(C.green, 1.4, 1); head.position.y = 1.3; p.add(head);
      const l = label(`M-${String(i + 1).padStart(2, '0')} ${n}`, { size: 0.34, color: '#e8f1fb', bg: 'rgba(5,14,29,0.75)', border: '#6cc04a' }); l.position.y = 2; p.add(l);
      p.position.copy(pos); p.quaternion.setFromUnitVectors(V(0, 1, 0), pos.clone().normalize());
      globe.add(p); return p;
    });
    const ringT = new THREE.Group(); d.add(ringT); ringT.rotation.x = 1.2;
    ringT.add(new THREE.Mesh(new THREE.TorusGeometry(9, 0.04, 8, 220), new THREE.MeshBasicMaterial({ color: C.sky, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending })));
    const tick = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), emissiveMat(C.white, 2)); ringT.add(tick);
    const tLb = label('4D timeline · traditional IT vs AgenticOps', { size: 0.42, color: '#9be7ff' }); tLb.position.set(0, -9.2, 0); ringT.add(tLb);
    const modes = ['Present', 'Play', 'Learn'].map((n, i) => { const l = label(n, { size: 0.8, color: '#ffffff', weight: 800, bg: 'rgba(5,14,29,0.8)', border: ['#00bceb', '#6cc04a', '#fbab18'][i] }); l.position.set(-4 + i * 4, -6.6, 4); d.add(l); return l; });
    let pk = 0, tk = 0, mk = 0;
    return {
      update(dt, t, step) {
        pk = damp(pk, 1, 1, dt); tk = damp(tk, step >= 1 ? 1 : 0, 2, dt); mk = damp(mk, step >= 2 ? 1 : 0, 2.5, dt);
        globe.rotation.y = t * 0.08 + 1.6;
        pins.forEach((p, i) => p.scale.setScalar(Math.max(0.001, smooth(pk * 10 - i))));
        ringT.scale.setScalar(Math.max(0.001, tk)); ringT.visible = tk > 0.01;
        const a = t * 0.5; tick.position.set(Math.cos(a) * 9, Math.sin(a) * 9, 0);
        modes.forEach((m, i) => setOpacity(m, smooth(mk * 3 - i)));
      },
    };
  },
});

// ---------------------------------------------------------------------------
// SEVerse: the brand system itself, as cards fanning out of the explainer.
export const severse = {
  id: 'severse',
  bg: { a: '#08030a', b: '#2a0a24', c: '#f25c9a', mix: [1, 0.2, 0, 0.6] },
  bgSteps: [null, { a: '#050e1d', b: '#07182d', c: '#00bceb', mix: [0.6, 0.6, 0, 0.6] }, { a: '#050e1d', b: '#0d274d', c: '#6cc04a', mix: [1, 0.3, 0.3, 0.5] }],
  cams: [{ p: [0, 4, 28], t: [3, 3, 0] }, { p: [3, 5, 27], t: [4, 3, 0] }, { p: [2, 2, 27], t: [4, 2, 0] }],
  build() {
    const group = new THREE.Group();
    const book = canvasPanel(11, 6.2, (g, w, h) => {
      g.fillStyle = 'rgba(5,14,29,0.92)'; roundRect(g, 4, 4, w - 8, h - 8, 30); g.fill();
      g.strokeStyle = '#f25c9a'; g.lineWidth = 4; g.stroke();
      g.fillStyle = '#9be7ff'; g.font = '600 24px Inter, Arial'; g.fillText('01 · AI LEADERSHIP EXPLAINER', 48, 80);
      g.fillStyle = '#e8f1fb'; g.font = '800 64px Inter, Arial'; g.fillText('From boxes', 48, 180);
      const gr = g.createLinearGradient(48, 0, 700, 0); gr.addColorStop(0, '#7fe3ff'); gr.addColorStop(0.5, '#00bceb'); gr.addColorStop(1, '#6cc04a');
      g.fillStyle = gr; g.fillText('to business outcomes.', 48, 255);
      g.fillStyle = '#9fb3c8'; g.font = '400 28px Inter, Arial'; g.fillText('Narrated · password protected · seven twins as proof', 48, 330);
      g.fillStyle = 'rgba(155,231,255,0.12)'; roundRect(g, 48, 380, 360, 64, 32); g.fill();
      g.fillStyle = '#9be7ff'; g.font = '500 24px "JetBrains Mono", monospace'; g.fillText('sonic-karma-7gzp.here.now', 70, 420);
    }, 240);
    book.position.set(5, 4, -1); group.add(book);
    const cards = [
      ['Colorway', 'midnight · blue · green'], ['Typography', 'Inter · two-clause heads'], ['Particles', 'one field, new shape'], ['Glass', 'panels · topbar · progress'],
      ['Components', 'chain · KPI · canvas'], ['Copy rules', 'no em dashes'], ['Narration', 'neural voice, captions'], ['Formations', 'meaning per section'], ['Bridge bars', 'the signature close'],
    ];
    const sw = ['#050e1d', '#00bceb', '#6cc04a', '#9be7ff', '#fbab18', '#e2231a', '#f25c9a', '#8e7cff', '#00bceb'];
    const cs = cards.map(([h, p], i) => {
      const c = canvasPanel(3.6, 2.1, (g, w, H) => {
        g.fillStyle = 'rgba(10,30,58,0.9)'; roundRect(g, 4, 4, w - 8, H - 8, 22); g.fill();
        g.strokeStyle = 'rgba(155,231,255,0.4)'; g.lineWidth = 3; g.stroke();
        g.fillStyle = sw[i]; roundRect(g, 26, 26, 54, 54, 14); g.fill(); g.strokeStyle = '#9be7ff'; g.stroke();
        g.fillStyle = '#e8f1fb'; g.font = '700 40px Inter, Arial'; g.fillText(h, 100, 66);
        g.fillStyle = '#9fb3c8'; g.font = '400 30px Inter, Arial'; g.fillText(p, 28, 150);
      }, 180);
      c.userData.i = i; group.add(c); return c;
    });
    const skillLb = label('cisco-branded skill', { size: 0.45, color: '#ffffff', bg: 'rgba(5,14,29,0.85)', border: '#6cc04a', mono: true });
    skillLb.position.set(5, -0.4, 1); group.add(skillLb);
    const bars = bridgeBars({ spacing: 0.7, unit: 0.9, radius: 0.16 }); bars.position.set(5, -3.4, 0); group.add(bars);
    let fk = 0, bk = 0;
    return {
      group,
      update(dt, t, step) {
        fk = damp(fk, step >= 1 ? 1 : 0, 2.2, dt); bk = damp(bk, step >= 2 ? 1 : 0, 2, dt);
        book.position.y = 4 + Math.sin(t * 0.8) * 0.15; book.position.z = -1 - fk * 6;
        book.material.opacity = 1 - fk; book.visible = fk < 0.99;
        cs.forEach((c, i) => {
          const k = smooth(fk * 2 - i * 0.12);
          const gx = 1 + (i % 3) * 4, gy = 7.4 - Math.floor(i / 3) * 2.5;
          c.position.set(5 + (gx - 5) * k, 4 + (gy - 4) * k, -1 + k * 2);
          c.rotation.z = (1 - k) * 0.3; c.rotation.y = -0.12 * k;
          c.material.opacity = k; c.visible = k > 0.01;
        });
        setOpacity(skillLb, fk);
        bars.userData.setHeights(Math.max(0.01, bk), t); bars.visible = bk > 0.01;
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Workshop: the eight-block base fills in as the room types.
export const workshop = {
  id: 'workshop',
  bg: { a: '#030712', b: '#0a2a2a', c: '#2de2c5', mix: [0.6, 1, 0, 0.3] },
  bgSteps: [null, { a: '#08040a', b: '#2a1206', c: '#fbab18', mix: [0.5, 1, 0.3, 0.3] }, { a: '#030a06', b: '#0c2a14', c: '#6cc04a', mix: [1, 0.5, 0, 0.5] }],
  cams: [{ p: [0, 10, 24], t: [0, 2, 0] }, { p: [0, 10, 24], t: [0, 2, 0] }, { p: [6, 14, 22], t: [0, 3, 0] }],
  build() {
    const group = new THREE.Group(); group.position.set(3, 0, 0);
    group.add(gridFloor(60, 30, C.teal, 0.12));
    const slabs = BLOCKS.map((b, i) => {
      const row = i < 4 ? 0 : 1, j = i % 4;
      const w = row === 0 ? 3.2 : 2.6;
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, 1, 2.6), new THREE.MeshStandardMaterial({ color: 0x050e1d, emissive: col(b.color), emissiveIntensity: 0.15, roughness: 0.35, transparent: true, opacity: 0.35 }));
      const x = row === 0 ? -5.1 + j * 3.4 : -3.9 + j * 2.6;
      m.position.set(x, 0.5 + row * 1.05, 0); m.userData = { home: m.position.clone(), k: 0 };
      m.add(edgeLines(m.geometry, col(b.color), 0.9));
      group.add(m); return m;
    });
    const tip = new THREE.Mesh(new THREE.ConeGeometry(2.4, 3.4, 4), new THREE.MeshStandardMaterial({ color: 0x050e1d, emissive: C.gold, emissiveIntensity: 0.6, flatShading: true, transparent: true, opacity: 0.25 }));
    tip.rotation.y = Math.PI / 4; tip.position.set(0, 3.8, 0); group.add(tip);
    const tipLb = label('Your verse', { size: 0.6, color: '#ffe9a6' }); tipLb.position.set(0, 6.4, 0); group.add(tipLb);
    const clockP = canvasPanel(5.6, 2.2, (g, w, h, txt = '10:00', c = '#2de2c5') => {
      g.fillStyle = 'rgba(5,14,29,0.85)'; roundRect(g, 4, 4, w - 8, h - 8, 26); g.fill();
      g.strokeStyle = c; g.lineWidth = 5; g.stroke();
      g.fillStyle = c; g.font = `700 ${h * 0.5}px "JetBrains Mono", monospace`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h * 0.55);
    }, 160);
    clockP.position.set(0, 9.4, 0); group.add(clockP);
    const sparks = points(600, () => [rr(-7, 7), rr(0, 9), rr(-2, 2)], { size: 0.3, color: C.gold, opacity: 0 });
    group.add(sparks);
    let lastTxt = '', ck = 0, sk = 0;
    return {
      group,
      update(dt, t, step) {
        const f = workshopState.filled;
        slabs.forEach((s, i) => {
          const on = step >= 1 ? 1 : f[i];
          s.userData.k = damp(s.userData.k, on, 3, dt);
          const k = s.userData.k;
          s.material.emissiveIntensity = 0.12 + k * 1.1; s.material.opacity = 0.35 + k * 0.6;
          s.position.y = s.userData.home.y + Math.sin(t * 2 + i) * 0.05 * (1 - k);
        });
        const all = f.reduce((a, b) => a + b, 0) / 8;
        tip.material.opacity = 0.2 + (step >= 1 ? 0.7 : all * 0.5);
        tip.rotation.y = Math.PI / 4 + t * 0.3;
        ck = damp(ck, step >= 1 ? 1 : 0, 3, dt);
        clockP.visible = ck > 0.01; clockP.material.opacity = ck;
        const rem = Math.max(0, workshopState.timer);
        const txt = `${String(Math.floor(rem / 60)).padStart(2, '0')}:${String(Math.floor(rem % 60)).padStart(2, '0')}`;
        if (txt !== lastTxt) { lastTxt = txt; clockP.userData.redraw(txt, rem < 60 ? '#fbab18' : '#2de2c5'); }
        sk = damp(sk, step >= 2 ? 1 : 0, 2, dt);
        sparks.material.opacity = sk * 0.8; sparks.rotation.y = t * 0.3; sparks.position.y = Math.sin(t) * 0.3;
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Fuel: conversation -> context -> world, a loop that compounds.
export const fuel = {
  id: 'fuel',
  bg: { a: '#06040f', b: '#1b0f3a', c: '#8e7cff', mix: [0.4, 0, 1, 0.4] },
  bgSteps: [null, { a: '#03070f', b: '#0d274d', c: '#00bceb', mix: [0.6, 0.2, 1, 0.4] }, { a: '#030a06', b: '#0c2a14', c: '#6cc04a', mix: [1, 0.2, 0.5, 0.4] }],
  cams: [{ p: [0, 7, 26], t: [3, 1, 0] }, { p: [0, 7, 26], t: [3, 1, 0] }, { p: [4, 14, 22], t: [3, 0, 0] }],
  build() {
    const group = new THREE.Group(); group.position.x = 3;
    const R = 7;
    const loop = new THREE.Mesh(new THREE.TorusGeometry(R, 0.06, 8, 240), new THREE.MeshBasicMaterial({ color: C.violet, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending }));
    group.add(loop);
    const nodes = [['Conversation', '#8e7cff'], ['Context', '#00bceb'], ['World', '#6cc04a']].map(([n, c], i) => {
      const a = Math.PI / 2 + (i / 3) * Math.PI * 2;
      const g = new THREE.Group(); g.position.set(Math.cos(a) * R, Math.sin(a) * R, 0);
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.9, 24, 18), new THREE.MeshStandardMaterial({ color: 0x050e1d, emissive: col(c), emissiveIntensity: 0.3 }));
      g.add(orb, glowSprite(col(c), 5, 0.6));
      const l = label(n, { size: 0.6, color: '#ffffff', bg: 'rgba(5,14,29,0.8)', border: c }); l.position.y = -1.9; g.add(l);
      g.userData.orb = orb; group.add(g); return g;
    });
    const flowPts = points(900, (i) => { const a = (i / 900) * Math.PI * 2; return [Math.cos(a) * R, Math.sin(a) * R, rr(-0.3, 0.3)]; }, { size: 0.25, color: C.ice, opacity: 0.7 });
    group.add(flowPts);
    const pages = [];
    for (let i = 0; i < 7; i++) {
      const p = canvasPanel(1.6, 2.1, (g, w, h) => {
        g.fillStyle = 'rgba(232,241,251,0.92)'; roundRect(g, 4, 4, w - 8, h - 8, 14); g.fill();
        g.fillStyle = '#0d274d'; g.font = '700 26px Inter, Arial'; g.fillText(['Scott', 'Anu', 'Keith', 'Steve', 'Customer', 'BU', 'TAC'][i], 20, 46);
        for (let l = 0; l < 9; l++) { g.fillStyle = l % 3 === 0 ? '#00bceb' : '#9fb3c8'; g.fillRect(20, 70 + l * 30, rr(60, w - 50), 10); }
      }, 120);
      p.userData = { ph: rr(0, 1), x: rr(-16, -9), y: rr(-4, 6) };
      group.add(p); pages.push(p);
    }
    const narrow = makePyramid([C.violet, C.sky, C.green], ['', '', ''], { scale: 0.45 }).pivot;
    narrow.position.set(0, -1.5, 0); group.add(narrow);
    let k1 = 0, k2 = 0, k3 = 0;
    return {
      group,
      update(dt, t, step) {
        k1 = damp(k1, 1, 2, dt); k2 = damp(k2, step >= 1 ? 1 : 0, 2, dt); k3 = damp(k3, step >= 2 ? 1 : 0, 2, dt);
        [k1, k2, k3].forEach((k, i) => { nodes[i].userData.orb.material.emissiveIntensity = 0.2 + k * 1.3; nodes[i].scale.setScalar(0.6 + k * 0.4); });
        flowPts.rotation.z = -t * (0.15 + k3 * 0.35);
        loop.material.opacity = 0.3 + k3 * 0.6;
        pages.forEach((p) => {
          const u = (t * 0.12 + p.userData.ph) % 1;
          const target = nodes[0].position;
          p.position.set(p.userData.x + (target.x - p.userData.x) * u, p.userData.y + (target.y - p.userData.y) * u, -u * 0.5);
          p.material.opacity = Math.sin(u * Math.PI) * k1; p.rotation.z = (1 - u) * 0.4;
        });
        narrow.scale.setScalar(Math.max(0.001, 0.45 * k3)); narrow.visible = k3 > 0.01; narrow.rotation.y = t * 0.4;
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Guardrails: three hex layers the verse passes through before it ships.
export const guardrails = {
  id: 'guardrails',
  bg: { a: '#0a0703', b: '#2a1a06', c: '#fbab18', mix: [0.3, 1, 0, 0.4] },
  bgSteps: [null, { a: '#060a12', b: '#0d274d', c: '#00bceb', mix: [0.4, 1, 0.3, 0.4] }, { a: '#030a06', b: '#0c2a14', c: '#6cc04a', mix: [0.8, 0.8, 0, 0.4] }],
  cams: [{ p: [-10, 5, 24], t: [3, 1, 0] }, { p: [-6, 6, 22], t: [3, 1, 0] }, { p: [-14, 8, 18], t: [3, 1, 0] }],
  build() {
    const group = new THREE.Group(); group.position.x = 4;
    const cfg = [['Mock data, real sources', C.amber], ['Where did you get that?', C.sky], ['Account team + BU vet it', C.green]];
    const layers = cfg.map(([n, c], i) => {
      const g = new THREE.Group(); g.position.z = 4 - i * 4;
      const hex = new THREE.Mesh(new THREE.RingGeometry(4.6, 4.85, 6), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.9, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
      const fill = new THREE.Mesh(new THREE.CircleGeometry(4.6, 6), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.06, side: THREE.DoubleSide, depthWrite: false }));
      g.add(hex, fill);
      const l = label(n, { size: 0.5, color: '#ffffff', bg: 'rgba(5,14,29,0.85)', border: hexColor(c) }); l.position.set(0, 5.6, 0); g.add(l);
      g.userData = { hex, fill, l }; group.add(g); return g;
    });
    const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8, 2), new THREE.MeshStandardMaterial({ color: 0x050e1d, emissive: C.white, emissiveIntensity: 1, flatShading: true }));
    group.add(orb);
    const og = glowSprite(C.white, 4, 0.6); orb.add(og);
    let k = [0, 0, 0];
    return {
      group,
      update(dt, t, step) {
        k = k.map((v, i) => damp(v, step >= i ? 1 : 0, 2.5, dt));
        layers.forEach((g, i) => {
          g.rotation.z = t * 0.1 * (i % 2 ? -1 : 1);
          g.userData.hex.material.opacity = 0.2 + 0.75 * k[i];
          g.userData.fill.material.opacity = 0.02 + 0.08 * k[i];
          setOpacity(g.userData.l, 0.25 + 0.75 * k[i]);
        });
        const z = 8 - (k[0] + k[1] + k[2]) * 4 - 1;
        orb.position.set(0, Math.sin(t * 2) * 0.2, z);
        orb.rotation.y = t;
        orb.material.emissive.setHex(step >= 2 ? C.green : C.white);
      },
    };
  },
};

// ---------------------------------------------------------------------------
export const close = {
  id: 'close',
  bg: { a: '#01040b', b: '#062a4d', c: '#00bceb', mix: [1, 0.6, 0, 0.5] },
  bgSteps: [null, { a: '#02070a', b: '#0c2a24', c: '#6cc04a', mix: [1, 0.6, 0.2, 0.6] }],
  cams: [{ p: [0, 5, 34], t: [0, 2, 0] }, { p: [0, 6, 38], t: [0, 2.6, 0] }],
  build() {
    const group = new THREE.Group();
    const bars = bridgeBars({ spacing: 2.0, unit: 2.4, radius: 0.42 });
    const lift = new THREE.Group(); lift.position.y = 3.8; lift.add(bars); group.add(lift);
    group.add(gridFloor(220, 110, C.sky, 0.14));
    const pyr = makePyramid([C.green, C.sky, C.ice], ['', '', ''], { scale: 0.5 }).pivot;
    pyr.rotation.z = Math.PI; pyr.position.set(0, 18.5, -8); group.add(pyr);
    const wave = [];
    for (let i = 0; i < 64; i++) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1, 0.18), emissiveMat(i % 2 ? C.sky : C.green, 1.4));
      b.position.set((i - 31.5) * 0.5, 0, 4); group.add(b); wave.push(b);
    }
    let k = 0, wk = 0;
    return {
      group,
      update(dt, t, step) {
        k = damp(k, 1, 1.4, dt); wk = damp(wk, step >= 1 ? 1 : 0, 2, dt);
        bars.userData.setHeights(smooth(k), t);
        pyr.rotation.y = t * 0.3; pyr.scale.setScalar(Math.max(0.001, 0.5 * (1 - wk * 0.6)));
        wave.forEach((b, i) => {
          const h = 0.1 + wk * (0.4 + Math.abs(Math.sin(t * 3 + i * 0.35) * Math.sin(i * 0.12 + t)) * 2.4);
          b.scale.y = h; b.position.y = h / 2;
        });
      },
      reset() { k = 0; },
    };
  },
};
