// Sample scenes. Each export is one scene definition, keyed by the id used in content.js.
// Contract (see references/stage-engine.md):
//   { id, bg, bgSteps?, cams: [{ p, t }...one per step], build() -> { group, update(dt, t, step), reset?, leave? } }
// Replace these with scenes designed from your own content. Keep the patterns, not the subjects.
import * as THREE from 'three';
import {
  C, damp, smooth, clamp01, rr, glowSprite, label, canvasPanel, roundRect, wireBox,
  gridFloor, points, setOpacity, emissiveMat, edgeLines, person,
} from './core.js';
import { BLOCKS } from './content.js';
import { bridgeBars, makePyramid, worldScene } from './kit.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const col = (h) => new THREE.Color(h).getHex();

// Shared state the workshop form writes into (main.js owns the DOM).
export const workshopState = { filled: new Array(8).fill(0), timer: 0 };

// ---------------------------------------------------------------------------
// Hero: Cisco bridge bars rising out of a reflective grid.
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
// Stack layout, three steps: a wall of flat rectangles, they tilt and break, then
// fold into one sphere you could step inside. Pattern: the old medium becomes the new one.
export const shift = {
  id: 'shift',
  bg: { a: '#03060f', b: '#0b1d36', c: '#9be7ff', mix: [0.6, 0.4, 0, 0.3] },
  bgSteps: [null, { a: '#08040a', b: '#2a0c18', c: '#e2231a', mix: [0.4, 1, 0, 0.3] }, { a: '#02060f', b: '#062a4d', c: '#00bceb', mix: [1, 0.6, 0.2, 0.5] }],
  cams: [{ p: [0, 7, 30], t: [4, 5, 0] }, { p: [-4, 9, 28], t: [4, 5, 0] }, { p: [2, 10, 34], t: [4, 6, 0] }],
  build() {
    const group = new THREE.Group(); group.position.x = 4;
    group.add(gridFloor(120, 60, C.sky, 0.12));
    const frames = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
      const f = wireBox(4.2, 2.4, 0.08, C.ice, 0.06, 0.8);
      f.userData.home = V((c - 1.5) * 4.8, 2 + r * 3, 0);
      f.userData.sph = V(rr(-1, 1), rr(-1, 1), rr(-1, 1)).normalize().multiplyScalar(6).add(V(0, 6, 0));
      f.position.copy(f.userData.home); group.add(f); frames.push(f);
    }
    const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(6, 3), new THREE.MeshBasicMaterial({ color: C.sky, wireframe: true, transparent: true, opacity: 0 }));
    orb.position.y = 6; group.add(orb);
    const glow = glowSprite(C.sky, 22, 0); glow.position.y = 6; group.add(glow);
    const tag = label('Step inside', { size: 0.6, color: '#9be7ff' }); tag.position.set(0, 13.5, 0); group.add(tag);
    let bk = 0, sk = 0;
    return {
      group,
      update(dt, t, step) {
        bk = damp(bk, step >= 1 ? 1 : 0, 2.5, dt); sk = damp(sk, step >= 2 ? 1 : 0, 2, dt);
        frames.forEach((f, i) => {
          const wob = Math.sin(t * 3 + i) * 0.25 * bk * (1 - sk);
          f.position.lerpVectors(f.userData.home, f.userData.sph, smooth(sk));
          f.rotation.set(wob, wob * 0.6 + sk * i, bk * (i % 2 ? 0.2 : -0.2) * (1 - sk));
          setOpacity(f, 1 - sk * 0.7);
        });
        orb.material.opacity = 0.5 * sk; orb.rotation.y = t * 0.2; glow.material.opacity = 0.35 * sk;
        setOpacity(tag, sk);
      },
      reset() { bk = 0; sk = 0; },
    };
  },
};

// ---------------------------------------------------------------------------
// Stack layout, three steps: an inverted pyramid balanced on its point flips onto a
// solid base, then the tiers light from the bottom up. Pattern: the escalation flip.
export const flip = {
  id: 'flip',
  bg: { a: '#06040a', b: '#2a1a08', c: '#fbab2c', mix: [0.4, 0.7, 0, 0.3] },
  bgSteps: [null, { a: '#03040e', b: '#14204a', c: '#8e7cff', mix: [1, 0.5, 0, 0.6] }, { a: '#020a10', b: '#06385a', c: '#6cc04a', mix: [1, 0.8, 0, 0.5] }],
  cams: [{ p: [-3, 6, 30], t: [3, 5, 0] }, { p: [-6, 10, 32], t: [3, 4, 0] }, { p: [-10, 14, 34], t: [3, 5, 0] }],
  build() {
    const group = new THREE.Group(); group.position.x = 4;
    group.add(gridFloor(140, 70, C.amber, 0.12));
    const pyr = makePyramid([C.green, C.sky, C.ice], ['Foundation', 'Iterate', 'Peak'], { scale: 1 });
    group.add(pyr.pivot);
    let fk = 0, lk = 0;
    return {
      group,
      update(dt, t, step) {
        fk = damp(fk, step >= 1 ? 1 : 0, 2.2, dt); lk = damp(lk, step >= 2 ? 1 : 0, 2, dt);
        pyr.pivot.rotation.z = Math.PI * (1 - smooth(fk)) + Math.sin(t * 2) * 0.05 * (1 - fk);
        pyr.pivot.rotation.y = t * 0.15;
        pyr.tiers.forEach((tr, i) => {
          tr.userData.fill.material.emissiveIntensity = 0.25 + clamp01(lk * 3 - i) * 1.2;
          tr.userData.lb.visible = fk > 0.9;
        });
      },
      reset() { fk = 0; lk = 0; },
    };
  },
};

// ---------------------------------------------------------------------------
// Stack layout with a live link: a small diorama of the subject's world beside a glass
// media screen that steps through screenshots (and an optional muted clip).
export const world = worldScene({
  id: 'world', accent: '#6cc04a', url: 'https://example.com/',
  bg: { a: '#030a06', b: '#0c2a14', c: '#6cc04a', mix: [0.6, 1, 0, 0.4] },
  bgSteps: [null, { a: '#03070f', b: '#0b2440', c: '#00bceb', mix: [0.5, 1, 0, 0.4] }, { a: '#05070f', b: '#20243a', c: '#9be7ff', mix: [0.2, 0.6, 0.8, 0.3] }],
  media: ['placeholder-1.jpg', 'placeholder-2.jpg', 'placeholder-3.jpg'],
  scale: 0.7, dpos: [-1, 0, -2],
  diorama(group) {
    const d = new THREE.Group(); d.position.set(-6, 0, -2); group.add(d);
    d.add(gridFloor(80, 40, C.green, 0.12));
    const blocks = [];
    for (let i = 0; i < 16; i++) {
      const h = 1 + ((i * 7) % 5);
      const b = wireBox(1.6, h, 1.6, i % 5 === 0 ? C.green : C.sky, 0.1, 0.85);
      b.position.set((i % 4) * 3 - 4.5, h / 2, Math.floor(i / 4) * 3 - 4.5); d.add(b); blocks.push(b);
    }
    const lb = label('Their world', { size: 0.6, color: '#c8f5b0' }); lb.position.set(0, 7.5, 0); d.add(lb);
    const people = [];
    for (let i = 0; i < 10; i++) { const p = person(i % 3 ? C.ice : C.green, 0.5); d.add(p); people.push(p); }
    let pk = 0;
    return {
      update(dt, t, step) {
        pk = damp(pk, step >= 1 ? 1 : 0, 3, dt);
        people.forEach((p, i) => {
          const a = t * 0.3 + (i / 10) * Math.PI * 2;
          p.position.set(Math.cos(a) * 7, 0.8, Math.sin(a) * 7);
          p.scale.setScalar(0.001 + 0.5 * smooth(pk * 10 - i));
        });
        blocks.forEach((b, i) => setOpacity(b, step >= 2 ? 0.5 + 0.5 * Math.abs(Math.sin(t * 2 + i)) : 1));
      },
    };
  },
});

// ---------------------------------------------------------------------------
// Focus layout: eight blocks orbit a core; each step pulls one block to the front.
export const method = {
  id: 'method',
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
        g.fillText(b.hint, 44, h * 0.76);
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

// ---------------------------------------------------------------------------
// Workshop layout: the form fills the base blocks live; a 3D timer appears at step 1.
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
// Hero close: the bridge bars return, an audio-wave floor answers at step 1.
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
