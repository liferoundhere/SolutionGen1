// Reusable stage building blocks: the Cisco bridge bars, a tiered pyramid, a glass media
// screen that crossfades screenshots or plays a muted clip, and a wrapper that turns any
// diorama into a stepped "world" scene with that screen beside it.
import * as THREE from 'three';
import { C, damp, smooth, label, canvasPanel, roundRect, setOpacity, edgeLines, hexColor, glowSprite, OVERLAY } from './core.js';

const col = (h) => new THREE.Color(h).getHex();
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

export function mediaScreen({ w = 10.5, accent = C.sky, url = '' } = {}) {
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

export const VCAMS = [{ p: [-3, 12, 31], t: [3, 3.5, 0] }, { p: [3, 8, 27], t: [3.5, 3.5, 0] }, { p: [-9, 10, 27], t: [2.5, 3.5, 0] }, { p: [1, 15, 29], t: [3, 3, 0] }];

// Wraps a diorama with a media screen. step -> media source.
export function worldScene(cfg) {
  const verse = { color: cfg.accent || '#00bceb', url: cfg.url || '' };
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
      // With a clip: [still, clip, ...rest]. Without one: one still per step.
      const seq = cfg.media ? (cfg.video ? [cfg.media[0], cfg.video, ...cfg.media.slice(1)] : cfg.media) : [];
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
