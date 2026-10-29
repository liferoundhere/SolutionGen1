// Scenes for "A spoken word away", the FutureSE talk. Each export is one scene definition,
// keyed by the id used in content.js.
// Contract (see references/stage-engine.md):
//   { id, bg, bgSteps?, cams: [{ p, t }...one per step], build() -> { group, update(dt, t, step), reset?, leave? } }
import * as THREE from 'three';
import {
  C, damp, smooth, clamp01, rr, glowSprite, label, canvasPanel, roundRect, wireBox,
  gridFloor, points, setOpacity, emissiveMat, edgeLines, person, plane, drawTube, arc, hexColor,
} from './core.js';
import { BLOCKS } from './content.js';
import { bridgeBars, makePyramid, worldScene } from './kit.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const col = (h) => new THREE.Color(h).getHex();
const pill = (text, color = '#ffffff', size = 0.5, border = null) =>
  label(text, { size, color: '#ffffff', bg: 'rgba(3,10,22,0.78)', border: border || color });
const tag = (text, color = '#c4d3e3', size = 0.42) => label(text, { size, color, bg: 'rgba(3,10,22,0.7)' });

// Shared state the workshop form writes into (main.js owns the DOM).
export const workshopState = { filled: new Array(8).fill(0), timer: 0 };

// ---------------------------------------------------------------------------
// 00 Hero: Cisco bridge bars rising out of a reflective grid, rings orbit, dust drifts.
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
    group.add(gridFloor(220, 110, C.sky, 0.16));
    const rings = [];
    for (let i = 0; i < 3; i++) {
      const r = new THREE.Mesh(
        new THREE.TorusGeometry(13 + i * 4.5, 0.03, 8, 200),
        new THREE.MeshBasicMaterial({ color: i === 1 ? C.teal : C.sky, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending })
      );
      r.rotation.x = Math.PI / 2 + 0.18 * (i - 1);
      r.position.y = 5;
      group.add(r); rings.push(r);
    }
    const dust = points(1600, () => { const a = rr(0, Math.PI * 2), rad = rr(8, 70); return [Math.cos(a) * rad, rr(0, 30), Math.sin(a) * rad]; }, { size: 0.35, color: C.sky, opacity: 0.55 });
    group.add(dust);
    const core = glowSprite(C.sky, 36, 0.35); core.position.set(0, 5, -4); group.add(core);
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
// 01 The old medium breaks: a wall of slides tilts and wobbles, then folds into a sphere.
export const slides = {
  id: 'slides',
  bg: { a: '#03060f', b: '#0b1d36', c: '#9be7ff', mix: [0.6, 0.4, 0, 0.3] },
  bgSteps: [null, { a: '#08040a', b: '#2a0c18', c: '#e2231a', mix: [0.4, 1, 0, 0.3] }, { a: '#02060f', b: '#062a4d', c: '#00bceb', mix: [1, 0.6, 0.2, 0.5] }],
  cams: [{ p: [1, 7, 31], t: [5, 5, 0] }, { p: [-3, 9, 29], t: [5, 5, 0] }, { p: [3, 10, 34], t: [5, 6, 0] }],
  build() {
    const group = new THREE.Group(); group.position.x = 7;
    group.add(gridFloor(120, 60, C.sky, 0.12));
    const words = ['Title', 'Agenda', 'Problem', 'Bullets', 'Bullets', 'Architecture', 'Bullets', 'Logo', 'Bullets', 'Roadmap', 'Bullets', 'Next steps'];
    const frames = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
      const i = r * 4 + c;
      const f = new THREE.Group();
      const box = wireBox(4.2, 2.4, 0.08, C.ice, 0.06, 0.8); f.add(box);
      const w = canvasPanel(3.8, 2.0, (g, W, H) => {
        g.fillStyle = 'rgba(155,231,255,0.9)'; g.font = `700 ${H * 0.18}px Inter, Arial`; g.fillText(words[i], W * 0.07, H * 0.26);
        g.fillStyle = 'rgba(155,231,255,0.35)';
        for (let k = 0; k < 3; k++) { roundRect(g, W * 0.07, H * (0.45 + k * 0.16), W * (0.75 - k * 0.15), H * 0.07, 8); g.fill(); }
      }, 90);
      w.position.z = 0.06; f.add(w);
      f.userData.home = V((c - 1.5) * 4.8, 2 + (2 - r) * 3, 0);
      f.userData.sph = V(rr(-1, 1), rr(-1, 1), rr(-1, 1)).normalize().multiplyScalar(6).add(V(0, 6, 0));
      f.position.copy(f.userData.home); group.add(f); frames.push(f);
    }
    const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(6, 3), new THREE.MeshBasicMaterial({ color: C.sky, wireframe: true, transparent: true, opacity: 0 }));
    orb.position.y = 6; group.add(orb);
    const glow = glowSprite(C.sky, 22, 0); glow.position.y = 6; group.add(glow);
    const lb = pill('A world you step inside', '#00bceb', 0.55); lb.position.set(0, 13.6, 0); group.add(lb);
    const broken = pill('2 AM · rush hour · donors waiting', '#e2231a', 0.5); broken.position.set(0, 11.2, 1); group.add(broken);
    let bk = 0, sk = 0;
    return {
      group,
      update(dt, t, step) {
        bk = damp(bk, step >= 1 ? 1 : 0, 2.5, dt); sk = damp(sk, step >= 2 ? 1 : 0, 2, dt);
        frames.forEach((f, i) => {
          const wob = Math.sin(t * 3 + i) * 0.25 * bk * (1 - sk);
          f.position.lerpVectors(f.userData.home, f.userData.sph, smooth(sk));
          f.position.y -= bk * (1 - sk) * (i % 3) * 0.3;
          f.rotation.set(wob, wob * 0.6 + sk * i, bk * (i % 2 ? 0.2 : -0.2) * (1 - sk));
          setOpacity(f, 1 - sk * 0.7);
        });
        orb.material.opacity = 0.5 * sk; orb.rotation.y = t * 0.2; glow.material.opacity = 0.35 * sk;
        setOpacity(lb, sk); setOpacity(broken, bk * (1 - sk));
      },
      reset() { bk = 0; sk = 0; },
    };
  },
};

// ---------------------------------------------------------------------------
// 02 Search versus brief: a tiny query orb spits out ten links; a teammate orb with eight
// roles; then context, intent, freedom and a bar stream in and the outcome grows.
export const google = {
  id: 'google',
  bg: { a: '#04040c', b: '#1a1a2e', c: '#9fb3c8', mix: [0.3, 0.5, 0.4, 0.4] },
  bgSteps: [null, { a: '#030312', b: '#101a44', c: '#8e7cff', mix: [1, 0.4, 0, 0.6] }, { a: '#020a10', b: '#06385a', c: '#2de2c5', mix: [1, 0.7, 0, 0.5] }],
  cams: [{ p: [-2, 6, 28], t: [3, 4.5, 0] }, { p: [0, 8, 30], t: [4, 5, 0] }, { p: [-4, 10, 32], t: [4, 5, 0] }],
  build() {
    const group = new THREE.Group(); group.position.x = 4;
    group.add(gridFloor(120, 60, C.violet, 0.1));
    // the search box
    const box = canvasPanel(7, 1.2, (g, W, H) => {
      g.fillStyle = 'rgba(5,14,29,0.9)'; roundRect(g, 4, 4, W - 8, H - 8, H / 2 - 4); g.fill();
      g.strokeStyle = '#9fb3c8'; g.lineWidth = 4; g.stroke();
      g.fillStyle = '#c4d3e3'; g.font = `500 ${H * 0.36}px "JetBrains Mono", monospace`; g.textBaseline = 'middle'; g.fillText('datasheet for ...', H * 0.5, H / 2);
    }, 70);
    box.position.set(-5.5, 9.5, 0); group.add(box);
    const qOrb = glowSprite(C.white, 2.4, 0.9); qOrb.position.set(-5.5, 7.6, 0); group.add(qOrb);
    const links = [];
    for (let i = 0; i < 10; i++) {
      const l = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.22, 0.05), new THREE.MeshBasicMaterial({ color: C.sky, transparent: true, opacity: 0.55 }));
      l.position.set(-5.5, 6.6 - i * 0.55, 0); group.add(l); links.push(l);
    }
    const linksLb = tag('10 words in, 10 links out'); linksLb.position.set(-5.5, 0.6, 0.5); group.add(linksLb);
    // the teammate
    const mate = new THREE.Group(); mate.position.set(5, 5.5, 0); group.add(mate);
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(2, 2), new THREE.MeshStandardMaterial({ color: 0x050816, emissive: C.violet, emissiveIntensity: 0.8, flatShading: true }));
    mate.add(core);
    const coreGlow = glowSprite(C.violet, 12, 0.5); mate.add(coreGlow);
    const roles = ['Researcher', 'Architect', 'Storyteller', 'Artist', 'Analyst', 'Engineer', 'Narrator', 'Comedian'];
    const roleSp = roles.map((r, i) => {
      const s = pill(r, BLOCKS[i].color, 0.42); mate.add(s);
      s.userData.a = (i / roles.length) * Math.PI * 2; return s;
    });
    const inputs = [['Context', '#00bceb'], ['Intent', '#6cc04a'], ['Freedom', '#fbab18'], ['A bar to clear', '#ffd95a']].map(([n, c], i) => {
      const s = pill(n, c, 0.45); s.position.set(-7 + i * 0.4, 11.5 - i * 2.4, 2); group.add(s);
      const tube = drawTube(arc(s.position.clone(), V(5, 5.5, 0), 3), { radius: 0.05, color: col(c) }); group.add(tube);
      return { s, tube };
    });
    const out = new THREE.Mesh(new THREE.OctahedronGeometry(1.6, 0), new THREE.MeshStandardMaterial({ color: 0x041226, emissive: C.teal, emissiveIntensity: 1.2, flatShading: true }));
    out.position.set(5, 12, 0); group.add(out);
    const outLb = pill('Outcome', '#2de2c5', 0.5); outLb.position.set(5, 14.4, 0); group.add(outLb);
    let mk = 0, bk = 0;
    return {
      group,
      update(dt, t, step) {
        mk = damp(mk, step >= 1 ? 1 : 0, 2.5, dt); bk = damp(bk, step >= 2 ? 1 : 0, 2, dt);
        links.forEach((l, i) => { l.scale.x = 0.4 + 0.6 * Math.abs(Math.sin(i * 1.7)); l.material.opacity = 0.55 * (1 - mk * 0.6); });
        qOrb.scale.setScalar(2.4 + Math.sin(t * 3) * 0.2);
        setOpacity(box, 1 - mk * 0.5);
        mate.scale.setScalar(0.25 + 0.75 * smooth(mk));
        core.rotation.y = t * 0.4; core.rotation.x = t * 0.2;
        roleSp.forEach((s, i) => {
          const a = s.userData.a + t * 0.12;
          s.position.set(Math.cos(a) * 5.2, Math.sin(a) * 3.6, Math.sin(a * 2) * 0.8);
          setOpacity(s, smooth(mk * 1.4 - i * 0.05));
        });
        inputs.forEach(({ s, tube }, i) => { setOpacity(s, smooth(bk * 2 - i * 0.2)); tube.userData.setProgress(bk * 1.2 - i * 0.05); });
        out.scale.setScalar(Math.max(0.001, smooth(bk)));
        out.rotation.y = t * 0.6;
        setOpacity(outLb, bk);
      },
      reset() { mk = 0; bk = 0; },
    };
  },
};

// ---------------------------------------------------------------------------
// 03 Pyramid flip: the escalation climb, then Cloud Control flips it so the wide tier is the
// capable tier, and escalations arrive with context.
export const flip = {
  id: 'flip',
  bg: { a: '#08040a', b: '#2a0c18', c: '#e2231a', mix: [0.4, 0.8, 0, 0.3] },
  bgSteps: [null, { a: '#03040e', b: '#0b2440', c: '#00bceb', mix: [1, 0.5, 0, 0.6] }, { a: '#020a10', b: '#06385a', c: '#6cc04a', mix: [1, 0.8, 0, 0.5] }],
  cams: [{ p: [-3, 7, 31], t: [3, 5, 0] }, { p: [-6, 11, 32], t: [3, 6, 0] }, { p: [-9, 13, 33], t: [3, 6, 0] }],
  build() {
    const group = new THREE.Group(); group.position.x = 4;
    group.add(gridFloor(140, 70, C.sky, 0.1));
    const pyr = makePyramid([C.amber, C.pink, C.red], ['Tier 1 engineer', 'Senior engineer', 'Architect'], { scale: 1 });
    group.add(pyr.pivot);
    // the ticket
    const ticket = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), emissiveMat(C.gold, 2));
    group.add(ticket);
    const clock = canvasPanel(9, 1.6, (g, W, H, txt = '', c = '#fbab18') => {
      g.fillStyle = 'rgba(5,14,29,0.86)'; roundRect(g, 4, 4, W - 8, H - 8, 24); g.fill();
      g.strokeStyle = c; g.lineWidth = 5; g.stroke();
      g.fillStyle = '#ffffff'; g.font = `700 ${H * 0.3}px "JetBrains Mono", monospace`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, W / 2, H * 0.54);
    }, 110);
    clock.position.set(0, 15.2, 0); group.add(clock);
    // agentic tools above the flipped base
    const tools = [['AI Assistant', '#00bceb'], ['AI Canvas', '#8e7cff'], ['ThousandEyes', '#2de2c5'], ['Splunk', '#f25c9a'], ['Agents', '#ffd95a']].map(([n, c], i) => {
      const g = new THREE.Group();
      const o = glowSprite(col(c), 2.6, 0.9); g.add(o);
      const lb = label(n, { size: 0.42, color: '#ffffff', bg: 'rgba(3,10,22,0.78)', border: c }); lb.position.y = 1.1; g.add(lb);
      g.position.set((i - 2) * 3.4, 12.6, 0); group.add(g);
      return g;
    });
    const ctx = pill('Evidence · timeline · hypotheses', '#6cc04a', 0.45); group.add(ctx);
    let fk = 0, tk = 0, ek = 0, last = '';
    return {
      group,
      update(dt, t, step) {
        fk = damp(fk, step >= 1 ? 1 : 0, 2.2, dt); ek = damp(ek, step >= 2 ? 1 : 0, 2, dt);
        pyr.pivot.rotation.x = Math.PI * smooth(fk);
        pyr.pivot.rotation.y = 0.3 + Math.sin(t * 0.3) * 0.15;
        pyr.tiers.forEach((tr, i) => {
          const lit = step === 0 ? 0.35 : i === 0 ? 1.4 : 0.2 + ek * 0.6;
          tr.userData.fill.material.emissiveIntensity = damp(tr.userData.fill.material.emissiveIntensity, lit, 3, dt);
        });
        // ticket: climbs tier by tier today; stays at the wide tier when flipped; drops to the tip with context
        if (step === 0) {
          tk = (t * 0.22) % 1;
          const y = 1.6 + tk * 9; ticket.position.set(Math.sin(tk * 18) * 1.2, y, 4 - tk * 2.5);
        } else {
          const yTop = 9.0, yTip = 1.2;
          const y = yTop + (yTip - yTop) * smooth(ek);
          ticket.position.x = damp(ticket.position.x, 0, 3, dt); ticket.position.y = damp(ticket.position.y, y, 3, dt); ticket.position.z = damp(ticket.position.z, 7, 3, dt);
        }
        ticket.rotation.set(t, t * 1.3, 0);
        ctx.position.set(ticket.position.x + 4.2, ticket.position.y + 0.2, ticket.position.z);
        setOpacity(ctx, ek);
        tools.forEach((g, i) => { setOpacity(g, smooth(fk * 1.6 - i * 0.12)); g.position.y = 12.6 + Math.sin(t * 2 + i) * 0.2; });
        const txt = step === 0 ? 'Time between handoffs: ?' : 'Time to resolve: < 10 min';
        if (txt !== last) { last = txt; clock.userData.redraw(txt, step === 0 ? '#fbab18' : '#6cc04a'); }
      },
      reset() { fk = 0; ek = 0; },
    };
  },
};

// ---------------------------------------------------------------------------
// 04 Prompt pyramid: follow-up bricks balanced on a point, then the eight blocks become a
// solid one-shot foundation, then iterations narrow toward the outcome.
export const pyramid = {
  id: 'pyramid',
  bg: { a: '#06060a', b: '#1e1808', c: '#ffd95a', mix: [0.6, 0.35, 0, 0.4] },
  bgSteps: [null, { a: '#05060c', b: '#1c1608', c: '#fbab18', mix: [0.8, 0.45, 0, 0.4] }, { a: '#060708', b: '#221e0e', c: '#ffd95a', mix: [1, 0.5, 0, 0.5] }],
  cams: [{ p: [-2, 8, 28], t: [3, 4.5, 0] }, { p: [-4, 11, 27], t: [3, 3.5, 0] }, { p: [-6, 13, 30], t: [3, 5, 0] }],
  build() {
    const group = new THREE.Group(); group.position.x = 4;
    group.add(gridFloor(120, 60, C.gold, 0.12));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(11, 0.05, 6, 200), new THREE.MeshBasicMaterial({ color: C.gold, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending }));
    ring.rotation.x = Math.PI / 2; group.add(ring);
    // eight blocks. Step 0: inverted stack on a point (rows of 1, 2, 2, 3). Step 1+: a solid base row.
    const rows = [[0], [1, 2], [3, 4], [5, 6, 7]];
    const blocks = BLOCKS.map((b, i) => {
      const geo = new THREE.BoxGeometry(1.7, 1.2, 2.2);
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x050e1d, emissive: col(b.color), emissiveIntensity: 0.35, transparent: true, opacity: 0.55, depthWrite: false }));
      m.add(edgeLines(geo, col(b.color), 0.95));
      const r = rows.findIndex((rw) => rw.includes(i)); const j = rows[r].indexOf(i); const n = rows[r].length;
      m.userData.a = V((j - (n - 1) / 2) * 1.8, 0.6 + r * 1.25, 0);
      m.userData.b = V((i - 3.5) * 1.8, 0.6, 0);
      group.add(m); return m;
    });
    const qLb = tag('One narrow question', '#ffe9a6'); qLb.position.set(0, -0.6, 2); group.add(qLb);
    const fLb = pill('One-shot foundation: 8 blocks + research', '#ffd95a', 0.48); fLb.position.set(0, -0.9, 2.4); group.add(fLb);
    const its = ['Iteration 1 · fix the map', 'Iteration 2 · add focus mode', 'Iteration 3 · add narration'].map((n, i) => {
      const w = 12 - i * 3.2;
      const b = wireBox(w, 1.0, 2.0, i === 2 ? C.ice : C.sky, 0.08, 0.85); b.position.set(0, 1.9 + i * 1.15, 0); group.add(b);
      const lb = tag(n, '#d7f3ff', 0.38); lb.position.set(w / 2 + 3.4, 1.9 + i * 1.15, 0); group.add(lb);
      return { b, lb };
    });
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.9, 0), new THREE.MeshStandardMaterial({ color: 0x111111, emissive: C.gold, emissiveIntensity: 2, flatShading: true }));
    gem.position.set(0, 7.2, 0); group.add(gem);
    const gemLb = tag('Your outcome', '#ffe9a6', 0.42); gemLb.position.set(0, 8.7, 0); group.add(gemLb);
    const stack = new THREE.Group(); group.add(stack);
    let fk = 0, ik = 0;
    return {
      group,
      update(dt, t, step) {
        fk = damp(fk, step >= 1 ? 1 : 0, 2.2, dt); ik = damp(ik, step >= 2 ? 1 : 0, 2, dt);
        const wob = Math.sin(t * 1.8) * 0.16 * (1 - fk);
        blocks.forEach((m, i) => {
          const p = m.userData.a.clone();
          // rotate the inverted stack around its tip point
          const x = p.x * Math.cos(wob) - (p.y - 0.0) * Math.sin(wob), y = p.x * Math.sin(wob) + p.y * Math.cos(wob);
          p.set(x, y, 0);
          m.position.lerpVectors(p, m.userData.b, smooth(fk));
          m.rotation.z = wob * (1 - fk);
          m.material.emissiveIntensity = 0.35 + fk * 0.6;
        });
        setOpacity(qLb, 1 - fk); setOpacity(fLb, fk);
        its.forEach(({ b, lb }, i) => { const k = smooth(ik * 2.2 - i * 0.5); setOpacity(b, k); setOpacity(lb, k); b.scale.y = Math.max(0.001, k); });
        gem.scale.setScalar(Math.max(0.001, smooth(ik * 1.5 - 0.4))); gem.rotation.y = t; setOpacity(gemLb, smooth(ik * 1.5 - 0.4));
        ring.rotation.z = t * 0.05;
      },
      reset() { fk = 0; ik = 0; },
    };
  },
};

// ---------------------------------------------------------------------------
// 05 Anatomy focus: eight blocks orbit a prompt core; each click pulls one forward.
export const anatomy = {
  id: 'anatomy',
  bg: { a: '#030312', b: '#101a44', c: '#8e7cff', mix: [1, 0.3, 0.2, 0.7] },
  cams: [{ p: [0, 3, 30], t: [4, 1, 0] }],
  build() {
    const group = new THREE.Group(); group.position.x = 4;
    const core = new THREE.Group(); group.add(core);
    const heart = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 2), new THREE.MeshStandardMaterial({ color: 0x050816, emissive: C.white, emissiveIntensity: 0.4, flatShading: true }));
    const heartGlow = glowSprite(C.white, 10, 0.5);
    core.add(heart, heartGlow);
    const promptLb = label('PROMPT', { size: 0.5, color: '#ffffff', mono: true }); promptLb.position.y = -2.6; core.add(promptLb);
    const rings = BLOCKS.map((b, i) => {
      const r = new THREE.Mesh(new THREE.TorusGeometry(2.6 + i * 0.42, 0.05, 6, 160), new THREE.MeshBasicMaterial({ color: col(b.color), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending }));
      r.rotation.set(rr(-1, 1), rr(-1, 1), 0);
      r.userData.spin = V(rr(-0.6, 0.6), rr(-0.6, 0.6), rr(-0.3, 0.3));
      core.add(r); return r;
    });
    const tiles = BLOCKS.map((b, i) => {
      const tile = canvasPanel(5.2, 2.2, (g, w, h) => {
        g.fillStyle = 'rgba(4,10,26,0.88)'; roundRect(g, 6, 6, w - 12, h - 12, 28); g.fill();
        g.strokeStyle = b.color; g.lineWidth = 6; g.stroke();
        g.fillStyle = b.color; g.fillRect(6, 6, 16, h - 12);
        g.font = `700 ${h * 0.11}px "JetBrains Mono", monospace`; g.fillText(String(i + 1).padStart(2, '0'), 44, h * 0.24);
        g.fillStyle = '#ffffff'; g.font = `700 ${h * (b.label.length > 18 ? 0.135 : 0.17)}px Inter, Arial`; g.fillText(b.label, 44, h * 0.5);
        g.fillStyle = 'rgba(220,230,245,0.8)'; g.font = `400 ${h * 0.13}px Inter, Arial`; g.fillText(b.hint, 44, h * 0.76);
      }, 200);
      tile.userData = { ang: (i / BLOCKS.length) * Math.PI * 2, glow: glowSprite(col(b.color), 9, 0), k: 0 };
      tile.add(tile.userData.glow); tile.userData.glow.position.z = -0.2;
      group.add(tile); return tile;
    });
    const st = { feed: 0 };
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
          r.scale.setScalar(Math.max(0.001, smooth(on))); r.visible = on > 0.01;
          r.rotation.x += r.userData.spin.x * dt; r.rotation.y += r.userData.spin.y * dt;
        });
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
// 06 Lineage galaxy: seven worlds as glowing nodes on a spiral around the method core,
// connected by arcs in creation order. Step 1 reveals the honest cost.
const LINEAGE = [
  ['Deltaverse', 'Original', '#e2231a'], ['NYULH Verse', 'Original', '#8e7cff'], ['MSK Operations Twin', 'Original', '#2de2c5'],
  ['GaryVerse', 'Evolution', '#fbab18'], ['AnuVerse', 'Evolution', '#6cc04a'], ['AllenVerse', 'Latest evolution', '#00bceb'], ['SEVerse', 'The method, packaged', '#f25c9a'],
];
export const galaxy = {
  id: 'galaxy',
  bg: { a: '#02040c', b: '#0a1a3a', c: '#00bceb', mix: [0.5, 0.3, 0, 1] },
  bgSteps: [null, { a: '#020810', b: '#0b2a36', c: '#6cc04a', mix: [0.7, 0.3, 0, 1] }],
  cams: [{ p: [0, 7, 30], t: [2.5, 4, 0] }, { p: [0, 9, 35], t: [2.5, 4.5, 0] }],
  build() {
    const group = new THREE.Group(); group.position.x = 4;
    const core = new THREE.Mesh(new THREE.SphereGeometry(1.8, 32, 24), new THREE.MeshStandardMaterial({ color: 0x041226, emissive: C.ice, emissiveIntensity: 0.9 }));
    core.position.y = 3; group.add(core);
    const coreGlow = glowSprite(C.sky, 12, 0.5); coreGlow.position.y = 3; group.add(coreGlow);
    const orbits = [0, 1, 2].map((i) => {
      const r = new THREE.Mesh(new THREE.TorusGeometry(2.6 + i * 0.3, 0.03, 6, 120), new THREE.MeshBasicMaterial({ color: [C.pink, C.violet, C.amber][i], transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending }));
      r.position.y = 3; r.rotation.set(1.2 + i * 0.4, i, 0); group.add(r); return r;
    });
    const coreLb = label('8-block method', { size: 0.45, color: '#d7f3ff', mono: true, bg: 'rgba(3,10,22,0.7)' }); coreLb.position.set(0, 0.4, 2.2); group.add(coreLb);
    const POS = [[-5, 6.5, -1], [-1, 9, -3], [4.5, 8.6, -2], [9, 5.6, 0], [8, 0.8, 3], [2.5, -1, 4], [-4, 0.4, 3]];
    const nodes = LINEAGE.map(([n, g, c], i) => {
      const p = V(...POS[i]);
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.55 + (i === 6 ? 0.2 : 0), 24, 16), emissiveMat(col(c), 1.6));
      m.position.copy(p); group.add(m);
      const gl = glowSprite(col(c), 4, 0.5); gl.position.copy(p); group.add(gl);
      const lb = label(`${n}\n${g}`, { size: 0.36, color: '#ffffff', bg: 'rgba(3,10,22,0.78)', border: c }); lb.position.copy(p).add(V(0, 1.3, 0)); group.add(lb);
      return { m, gl, lb, p };
    });
    const arcs = nodes.slice(1).map((nd, i) => {
      const tube = drawTube(arc(nodes[i].p, nd.p, 2), { radius: 0.05, color: C.ice }); group.add(tube); return tube;
    });
    const spokes = nodes.map((nd) => { const tube = drawTube(arc(V(0, 3, 0), nd.p, 1), { radius: 0.025, color: C.sky, opacity: 0.4 }); group.add(tube); return tube; });
    const dust = points(1400, () => { const arm = Math.floor(rr(0, 3)); const r = rr(2, 16); const a = r * 0.35 + arm * 2.1 + rr(-0.3, 0.3); return [Math.cos(a) * r, rr(-0.6, 0.6) + 2, Math.sin(a) * r * 0.7]; }, { size: 0.18, color: C.ice, opacity: 0.6 });
    group.add(dust);
    const cost = pill('$544 · nights + weekends', '#6cc04a', 0.7); cost.position.set(2, 12, 0); group.add(cost);
    let k = 0, ck = 0;
    return {
      group,
      update(dt, t, step) {
        k = damp(k, 1, 2.2, dt); ck = damp(ck, step >= 1 ? 1 : 0, 2.5, dt);
        arcs.forEach((a, i) => a.userData.setProgress(k * 7.5 - i));
        spokes.forEach((s) => s.userData.setProgress(k));
        nodes.forEach((n, i) => {
          const on = smooth(k * 7.5 - i + 1);
          n.m.scale.setScalar(Math.max(0.001, on * (1 + ck * 0.15 * Math.sin(t * 3 + i))));
          n.gl.material.opacity = 0.5 * on; setOpacity(n.lb, on);
        });
        orbits.forEach((o, i) => { o.rotation.z = t * (0.3 + i * 0.15); });
        core.rotation.y = t * 0.2; dust.rotation.y = t * 0.03;
        setOpacity(cost, ck); cost.position.y = 12 + Math.sin(t) * 0.15;
      },
      reset() { k = 0; },
    };
  },
};

// ---------------------------------------------------------------------------
// 07 Deltaverse: ATL as a diorama, domestic terminal, concourses T through F, the Plane Train.
export const delta = worldScene({
  id: 'delta', accent: '#e2231a', url: 'https://dapper-ginger-cs9a.here.now/',
  bg: { a: '#02060f', b: '#0a2a4a', c: '#00bceb', mix: [0.3, 1, 0, 0.3] },
  bgSteps: [null, { a: '#0a0408', b: '#2a1018', c: '#e2231a', mix: [0.4, 1, 0, 0.3] }, { a: '#03070f', b: '#123150', c: '#9be7ff', mix: [0.2, 0.8, 1, 0.3] }],
  media: ['delta-1.jpg', 'delta-2.jpg', 'delta-3.jpg'],
  scale: 0.62, dpos: [-2, 0, -1],
  diorama(group) {
    const d = new THREE.Group(); group.add(d);
    d.add(gridFloor(70, 35, C.sky, 0.14));
    const term = wireBox(5, 1.4, 3.2, C.ice, 0.08, 0.7); term.position.set(-12, 0.7, 0); d.add(term);
    const termLb = tag('Domestic terminal', '#d7f3ff', 0.45); termLb.position.set(-12, 2.6, 0); d.add(termLb);
    const names = ['T', 'A', 'B', 'C', 'D', 'E', 'F'];
    const conc = names.map((n, i) => {
      const x = -7 + i * 3.4;
      const b = wireBox(1.3, 1.0, 12, i === 6 ? C.amber : C.sky, 0.1, 0.85); b.position.set(x, 0.5, 0); d.add(b);
      const lb = label(n, { size: 0.9, color: '#ffffff', weight: 700 }); lb.position.set(x, 2.4, -6.5); d.add(lb);
      for (let k = 0; k < 3; k++) {
        const p = plane(C.ice, 0.42); p.position.set(x + (k % 2 ? 1.6 : -1.6), 0.3, -4 + k * 3.5); p.rotation.y = k % 2 ? 0 : Math.PI; d.add(p);
      }
      return b;
    });
    const trainPath = new THREE.LineCurve3(V(-12, 0.1, 0), V(14, 0.1, 0));
    const rail = drawTube(trainPath, { radius: 0.09, color: C.teal }); rail.userData.setProgress(1); d.add(rail);
    const trainLb = tag('Plane Train', '#8ff5e3', 0.42); trainLb.position.set(1, -0.9, 2.5); d.add(trainLb);
    const cars = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.35, 0.4), emissiveMat(C.teal, 1.8)); d.add(m); return m; });
    const kiosk = glowSprite(C.red, 2.2, 0.9); kiosk.position.set(-12, 2, 2); d.add(kiosk);
    const kioskLb = tag('Kiosk blind spot', '#ffb3ae', 0.4); kioskLb.position.set(-12, -1.2, 3.2); d.add(kioskLb);
    const crew = [];
    for (let i = 0; i < 12; i++) { const p = person(i % 3 ? C.ice : C.amber, 0.7); d.add(p); crew.push(p); }
    const rain = points(900, () => [rr(-16, 16), rr(0, 14), rr(-8, 8)], { size: 0.12, color: C.ice, opacity: 0 });
    d.add(rain);
    const wxLb = pill('Live KATL weather', '#9be7ff', 0.5); wxLb.position.set(0, 9, 0); d.add(wxLb);
    let pk = 0, wk = 0;
    return {
      update(dt, t, step) {
        pk = damp(pk, step >= 1 ? 1 : 0, 3, dt); wk = damp(wk, step >= 2 ? 1 : 0, 2, dt);
        cars.forEach((c, i) => { const u = ((t * 0.08 + i * 0.03) % 1); c.position.set(-12 + u * 26, 0.25, 0); });
        crew.forEach((p, i) => {
          const x = -7 + (i % 7) * 3.4 + (i > 6 ? 0.8 : -0.8);
          p.position.set(x, 1.0, -3 + (i % 4) * 2 + Math.sin(t + i) * 0.4);
          p.scale.setScalar(0.001 + 0.7 * smooth(pk * 10 - i * 0.6));
        });
        kiosk.material.color.setHex(step >= 1 ? C.green : C.red);
        setOpacity(kioskLb, pk);
        rain.material.opacity = 0.7 * wk;
        rain.position.y = -((t * 6) % 14) * wk;
        setOpacity(wxLb, wk);
        conc.forEach((b, i) => setOpacity(b, 0.75 + 0.25 * Math.sin(t * 2 + i)));
      },
    };
  },
});

// ---------------------------------------------------------------------------
// 08 NYULH Verse: a campus with a halo of the ecosystem it publishes, six lenses, the lost cart.
export const nyu = worldScene({
  id: 'nyu', accent: '#8e7cff', url: 'https://mighty-orbit-f3r4.here.now/',
  bg: { a: '#04030f', b: '#1a1440', c: '#8e7cff', mix: [1, 0.4, 0, 0.6] },
  bgSteps: [null, { a: '#030612', b: '#0e2348', c: '#00bceb', mix: [0.8, 0.6, 0, 0.5] }, { a: '#03080a', b: '#0c2a1c', c: '#6cc04a', mix: [0.6, 0.8, 0, 0.4] }],
  media: ['nyu-1.jpg', 'nyu-2.jpg', 'nyu-3.jpg'],
  scale: 0.66, dpos: [-2, 0, -1],
  diorama(group) {
    const d = new THREE.Group(); group.add(d);
    d.add(gridFloor(60, 30, C.violet, 0.14));
    for (let i = 0; i < 9; i++) {
      const h = 2 + ((i * 5) % 5) * 1.2;
      const b = wireBox(2.4, h, 2.4, i === 4 ? C.ice : C.violet, 0.1, 0.85);
      b.position.set((i % 3) * 3.4 - 3.4, h / 2, Math.floor(i / 3) * 3.4 - 3.4); d.add(b);
    }
    const halo = new THREE.Mesh(new THREE.TorusGeometry(8, 0.08, 8, 200), new THREE.MeshBasicMaterial({ color: C.violet, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending }));
    halo.rotation.x = Math.PI / 2; halo.position.y = 9; d.add(halo);
    const nodes = [];
    for (let i = 0; i < 14; i++) { const s = glowSprite(i % 2 ? C.violet : C.sky, 1.2, 0.9); d.add(s); nodes.push(s); }
    const haloLb = pill('The ecosystem NYU publishes', '#8e7cff', 0.5); haloLb.position.set(0, 11, 0); d.add(haloLb);
    const lenses = ['Leadership', 'Clinical', 'Labs', 'Network and security', 'Facilities', 'Patients'].map((n, i) => {
      const a = (i / 6) * Math.PI * 2;
      const g = new THREE.Group(); g.position.set(Math.cos(a) * 11, 0, Math.sin(a) * 7);
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4, 8), emissiveMat(col(BLOCKS[i].color), 1.6)); beam.position.y = 2; g.add(beam);
      const lb = tag(n, '#ffffff', 0.42); lb.position.y = 4.8; g.add(lb);
      d.add(g); return g;
    });
    const cartA = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.6), emissiveMat(C.green, 2)); d.add(cartA);
    const cartB = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.6), emissiveMat(C.red, 2)); d.add(cartB);
    const aLb = pill('With Cisco · minutes', '#6cc04a', 0.42); d.add(aLb);
    const bLb = pill('Manual · the shift', '#e2231a', 0.42); d.add(bLb);
    let lk = 0, ck = 0;
    return {
      update(dt, t, step) {
        lk = damp(lk, step >= 1 ? 1 : 0, 2.5, dt); ck = damp(ck, step >= 2 ? 1 : 0, 2.5, dt);
        nodes.forEach((s, i) => { const a = (i / nodes.length) * Math.PI * 2 + t * 0.15; s.position.set(Math.cos(a) * 8, 9, Math.sin(a) * 8); });
        halo.rotation.z = t * 0.1;
        lenses.forEach((g, i) => { setOpacity(g, smooth(lk * 3 - i * 0.3)); });
        const u = (t * 0.2) % 1;
        cartA.position.set(-3 + Math.min(1, u * 3) * 6, 0.4, 7.5);
        cartB.position.set(-1 + Math.sin(t * 0.9) * 4, 0.4, 10.5 + Math.cos(t * 1.3) * 1.2);
        aLb.position.copy(cartA.position).add(V(0, 1.4, 0)); bLb.position.copy(cartB.position).add(V(0, 1.4, 0));
        [cartA, cartB, aLb, bLb].forEach((o) => setOpacity(o, ck));
      },
    };
  },
});

// ---------------------------------------------------------------------------
// 09 MSK Operations Twin: towers of floors with elevator shafts and moving cars,
// seven leader lenses, and the missing medication cart.
export const msk = worldScene({
  id: 'msk', accent: '#2de2c5', url: 'https://topaz-kernel-3cga.here.now/',
  bg: { a: '#020a0c', b: '#082a2e', c: '#2de2c5', mix: [0.7, 0.7, 0, 0.4] },
  bgSteps: [null, { a: '#030712', b: '#0b2440', c: '#00bceb', mix: [0.8, 0.6, 0.2, 0.4] }, { a: '#08040a', b: '#2a1408', c: '#fbab18', mix: [0.5, 1, 0, 0.3] }],
  media: ['msk-1.jpg', 'msk-2.jpg', 'msk-3.jpg'],
  scale: 0.62, dpos: [-2, 0, -1],
  diorama(group) {
    const d = new THREE.Group(); group.add(d);
    d.add(gridFloor(60, 30, C.teal, 0.14));
    const floors = [];
    const cars = [];
    for (let tw = 0; tw < 3; tw++) {
      const x = -7 + tw * 7;
      for (let f = 0; f < 10; f++) {
        const fl = wireBox(4.4, 0.9, 3.4, C.teal, 0.06, 0.6); fl.position.set(x, 0.5 + f * 1.05, 0); d.add(fl);
        fl.userData = { ...fl.userData, home: fl.position.clone(), tw, f }; floors.push(fl);
      }
      const shaft = wireBox(0.9, 10.6, 0.9, C.ice, 0.04, 0.5); shaft.position.set(x + 2.8, 5.3, 0); d.add(shaft);
      const car = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.7), emissiveMat(C.ice, 1.8)); car.position.set(x + 2.8, 1, 0); d.add(car);
      car.userData.ph = tw * 1.7; cars.push(car);
    }
    const elLb = tag('Elevator shafts, moving cars', '#bdf7ee', 0.42); elLb.position.set(0, 12.2, 0); d.add(elLb);
    const lenses = ['Leadership', 'Hospital ops', 'Clinical ops', 'Network and security', 'Facilities', 'Public safety', 'Patient and family'].map((n, i) => {
      const lb = pill(n, BLOCKS[i].color, 0.4); const a = -0.3 + (i / 6) * (Math.PI + 0.6);
      lb.position.set(Math.cos(a) * 10 + 3, 1.2 + (i % 2) * 1.2, Math.sin(a) * 6 + 2); d.add(lb); return lb;
    });
    const cart = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.6), emissiveMat(C.amber, 2.2)); d.add(cart);
    const with_ = pill('With Cisco · 3 min', '#6cc04a', 0.5); with_.position.set(-4, 13.6, 2); d.add(with_);
    const without = pill('Without · 47 min', '#e2231a', 0.5); without.position.set(5, 13.6, 2); d.add(without);
    let lk = 0, ck = 0;
    return {
      update(dt, t, step) {
        lk = damp(lk, step >= 1 ? 1 : 0, 2.5, dt); ck = damp(ck, step >= 2 ? 1 : 0, 2.5, dt);
        cars.forEach((c) => { c.position.y = 1 + (Math.sin(t * 0.5 + c.userData.ph) * 0.5 + 0.5) * 9.4; });
        floors.forEach((fl) => {
          const drill = fl.userData.tw === 1 && fl.userData.f === 6 ? lk : 0;
          fl.position.z = fl.userData.home.z + drill * 3.2;
          setOpacity(fl.userData.lines ? fl : fl, 0.7 + drill * 0.3);
        });
        lenses.forEach((lb, i) => setOpacity(lb, smooth(lk * 3 - i * 0.25)));
        cart.position.set(Math.sin(t * 0.8) * 6, 0.5 + 6 * 1.05, 2.4 + Math.cos(t * 0.8) * 0.6);
        setOpacity(cart, ck); setOpacity(with_, ck); setOpacity(without, ck);
      },
    };
  },
});

// ---------------------------------------------------------------------------
// 10 GaryVerse: 40 sources orbit, then round two steers to literal places, then AI Canvas.
export const gary = worldScene({
  id: 'gary', accent: '#fbab18', url: 'https://scarlet-iris-csv8.here.now/',
  bg: { a: '#050806', b: '#1a2a10', c: '#6cc04a', mix: [0.4, 1, 0.5, 0.3] },
  bgSteps: [null, { a: '#0a0804', b: '#2a1e08', c: '#fbab18', mix: [0.4, 1, 0.6, 0.3] }, { a: '#030712', b: '#0b2440', c: '#00bceb', mix: [0.6, 0.9, 0.3, 0.4] }],
  media: ['gary-1.jpg', 'gary-2.jpg', 'gary-3.jpg'],
  scale: 0.66, dpos: [-2, 0, -1],
  diorama(group) {
    const d = new THREE.Group(); group.add(d);
    d.add(gridFloor(60, 30, C.amber, 0.12));
    const src = points(40, (i) => { const a = (i / 40) * Math.PI * 2; return [Math.cos(a) * 7, 6 + Math.sin(i * 1.7) * 1.5, Math.sin(a) * 7]; }, { size: 0.7, color: C.gold, opacity: 0.9 });
    d.add(src);
    const srcLb = pill('40 sources · 19 Cloud Control use cases', '#ffd95a', 0.48); srcLb.position.set(0, 9.6, 0); d.add(srcLb);
    const places = [['Boardroom', 0, 0, 1.0], ['Offices', -6, -4, 5], ['Data center', 6, -4, 4], ['Client at home', -7, 4, 1.6], ['Branch', 7, 4, 3], ['Facilities', 0, -7, 2]].map(([n, x, z, h], i) => {
      const g = new THREE.Group(); g.position.set(x, 0, z);
      const b = wireBox(i === 0 ? 5 : 2.6, h, i === 0 ? 1.6 : 2.6, i === 0 ? C.sky : C.ice, 0.1, 0.85); b.position.y = h / 2; g.add(b);
      if (i === 0) for (let k = 0; k < 5; k++) { const p = person(C.ice, 0.55); p.position.set(-2 + k, 0, 1.6); g.add(p); }
      const lb = tag(n, '#ffffff', 0.44); lb.position.y = h + 1.1; g.add(lb);
      d.add(g); return g;
    });
    const canvasP = canvasPanel(6, 3, (g, W, H) => {
      g.fillStyle = 'rgba(5,14,29,0.92)'; roundRect(g, 4, 4, W - 8, H - 8, 26); g.fill();
      g.strokeStyle = '#8e7cff'; g.lineWidth = 5; g.stroke();
      g.fillStyle = '#ffffff'; g.font = `700 ${H * 0.11}px Inter, Arial`; g.fillText('AI Canvas', W * 0.05, H * 0.18);
      g.fillStyle = 'rgba(0,188,235,0.35)'; roundRect(g, W * 0.4, H * 0.27, W * 0.55, H * 0.16, 14); g.fill();
      g.fillStyle = '#ffffff'; g.font = `600 ${H * 0.08}px Inter, Arial`; g.fillText('Where do we stand?', W * 0.43, H * 0.38);
      g.fillStyle = '#6cc04a'; g.font = `600 ${H * 0.075}px Inter, Arial`; g.fillText('Answered from live evidence', W * 0.05, H * 0.58);
      g.fillStyle = 'rgba(155,231,255,0.3)';
      for (let k = 0; k < 3; k++) { roundRect(g, W * 0.05, H * (0.66 + k * 0.09), W * (0.8 - k * 0.15), H * 0.05, 6); g.fill(); }
    }, 140);
    canvasP.position.set(0, 6.4, 1.5); d.add(canvasP);
    let pk = 0, ak = 0;
    return {
      update(dt, t, step) {
        pk = damp(pk, step >= 1 ? 1 : 0, 2.5, dt); ak = damp(ak, step >= 2 ? 1 : 0, 2.5, dt);
        src.rotation.y = t * 0.2; src.material.opacity = 0.9 * (1 - pk * 0.8);
        setOpacity(srcLb, 1 - pk);
        places.forEach((g, i) => { const k = smooth(pk * 3 - i * 0.3); g.scale.setScalar(Math.max(0.001, k)); });
        setOpacity(canvasP, ak); canvasP.position.y = 6.4 + Math.sin(t) * 0.12;
      },
    };
  },
});

// ---------------------------------------------------------------------------
// 11 Workshop builder: the form fills the eight base slabs live; a 3D timer appears at step 1.
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
// 12 AnuVerse: every donation center on one living map, the Ripple between Mobile and
// Pensacola, the champion edition on a phone, and the Dominion audience correction.
const US = [[-15, -4], [-9, -6.5], [0, -6], [8, -7], [15, -5.5], [15.5, -1], [13, 2.5], [10.5, 6.5], [7.5, 6], [4.6, 8.8], [3.4, 5.6], [0, 6.2], [-4.6, 8], [-8, 4.4], [-13.4, 3], [-15.5, -0.5]];
function inside(x, z) {
  let c = false;
  for (let i = 0, j = US.length - 1; i < US.length; j = i++) {
    const [xi, zi] = US[i], [xj, zj] = US[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
}
export const anu = worldScene({
  id: 'anu', accent: '#6cc04a', url: 'https://ancient-vault-4jt8.here.now/',
  bg: { a: '#020804', b: '#0a2a10', c: '#6cc04a', mix: [0.5, 1, 0.2, 0.5] },
  bgSteps: [null, { a: '#0a0406', b: '#2a0c10', c: '#e2231a', mix: [0.4, 1, 0, 0.4] }, { a: '#020a06', b: '#0c2a1c', c: '#6cc04a', mix: [1, 0.6, 0, 0.5] }, { a: '#030712', b: '#0b2440', c: '#00bceb', mix: [0.8, 0.7, 0, 0.5] }],
  media: ['anu-1.jpg', 'anu-2.jpg', 'anu-3.jpg', 'anu-4.jpg'],
  scale: 0.6, dpos: [-2, 0, 0],
  screenPos: [10, 7.6, -2],
  diorama(group) {
    const d = new THREE.Group(); group.add(d);
    const outline = new THREE.BufferGeometry().setFromPoints([...US, US[0]].map(([x, z]) => V(x, 0, z)));
    d.add(new THREE.Line(outline, new THREE.LineBasicMaterial({ color: C.green, transparent: true, opacity: 0.6 })));
    const pts = [];
    while (pts.length < 300) { const x = rr(-15.5, 15.5), z = rr(-7, 8.8); if (inside(x, z)) pts.push([x, 0.15, z]); }
    const centers = points(300, (i) => pts[i], { size: 0.5, color: C.green, opacity: 0.95 });
    d.add(centers);
    const mapLb = pill('About 300 donation centers', '#6cc04a', 0.5); mapLb.position.set(-2, 3, -6); d.add(mapLb);
    const mobile = V(6.4, 0.3, 5.2), pens = V(8.2, 0.3, 5.0);
    const mDot = glowSprite(C.red, 1.8, 0); mDot.position.copy(mobile); d.add(mDot);
    const pDot = glowSprite(C.amber, 1.8, 0); pDot.position.copy(pens); d.add(pDot);
    const ripples = [0, 1, 2].map(() => { const r = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.0, 48), new THREE.MeshBasicMaterial({ color: C.red, transparent: true, opacity: 0, side: THREE.DoubleSide })); r.rotation.x = -Math.PI / 2; r.position.copy(mobile); d.add(r); return r; });
    const drive = drawTube(arc(mobile, pens, 1.4), { radius: 0.07, color: C.amber }); d.add(drive);
    const mLb = pill('Mobile · down', '#e2231a', 0.45); mLb.position.copy(mobile).add(V(-2, 2.2, 0)); d.add(mLb);
    const pLb = pill('Pensacola · donors arrive', '#fbab18', 0.45); pLb.position.copy(pens).add(V(2.6, 3.4, 0)); d.add(pLb);
    const phone = canvasPanel(2.6, 4.6, (g, W, H) => {
      g.fillStyle = 'rgba(5,14,29,0.94)'; roundRect(g, 6, 6, W - 12, H - 12, 50); g.fill();
      g.strokeStyle = '#c4d3e3'; g.lineWidth = 6; g.stroke();
      g.fillStyle = '#6cc04a'; g.font = `700 ${W * 0.07}px Inter, Arial`; g.fillText('CHAMPION EDITION', W * 0.12, H * 0.14);
      g.fillStyle = '#ffffff'; g.font = `800 ${W * 0.105}px Inter, Arial`;
      ['"Every', 'donation', 'depends on', 'the network."'].forEach((l, k) => g.fillText(l, W * 0.12, H * (0.34 + k * 0.08)));
      g.fillStyle = '#9fb3c8'; g.font = `500 ${W * 0.065}px Inter, Arial`; g.fillText('3 minute narrated story', W * 0.12, H * 0.72);
      g.strokeStyle = '#6cc04a'; g.lineWidth = 6; g.beginPath(); g.arc(W / 2, H * 0.85, W * 0.09, 0, Math.PI * 2); g.stroke();
    }, 160);
    phone.position.set(-6, 4.2, 4); d.add(phone);
    const dom = canvasPanel(7, 2.6, (g, W, H) => {
      g.fillStyle = 'rgba(5,14,29,0.92)'; roundRect(g, 4, 4, W - 8, H - 8, 26); g.fill();
      g.strokeStyle = '#00bceb'; g.lineWidth = 5; g.stroke();
      g.fillStyle = '#00bceb'; g.font = `700 ${H * 0.12}px Inter, Arial`; g.fillText('DOMINION · ONE SENTENCE OF AUDIENCE', W * 0.05, H * 0.2);
      g.fillStyle = '#9fb3c8'; g.font = `600 ${H * 0.13}px Inter, Arial`; g.fillText('Internal Splunk leader', W * 0.05, H * 0.46);
      g.strokeStyle = '#e2231a'; g.lineWidth = 6; g.beginPath(); g.moveTo(W * 0.04, H * 0.42); g.lineTo(W * 0.62, H * 0.42); g.stroke();
      g.fillStyle = '#ffffff'; g.font = `700 ${H * 0.14}px Inter, Arial`; g.fillText('Director reporting to the CIO', W * 0.05, H * 0.7);
      g.fillStyle = '#6cc04a'; g.font = `600 ${H * 0.1}px Inter, Arial`; g.fillText('One rerun, about 31 minutes', W * 0.05, H * 0.9);
    }, 140);
    dom.position.set(-1, 6, 2); d.add(dom);
    let rk = 0, ck = 0, dk = 0;
    return {
      update(dt, t, step) {
        rk = damp(rk, step >= 1 ? 1 : 0, 2.5, dt); ck = damp(ck, step === 2 ? 1 : 0, 3, dt); dk = damp(dk, step >= 3 ? 1 : 0, 3, dt);
        mDot.material.opacity = rk; pDot.material.opacity = rk;
        ripples.forEach((r, i) => { const u = (t * 0.5 + i / 3) % 1; r.scale.setScalar(1 + u * 4); r.material.opacity = rk * (1 - u) * 0.8; });
        drive.userData.setProgress(rk * ((t * 0.4) % 1.3));
        setOpacity(mLb, rk); setOpacity(pLb, rk); setOpacity(mapLb, 1 - rk * 0.6);
        centers.material.opacity = 0.95 - dk * 0.5;
        setOpacity(phone, ck); phone.position.y = 4.2 + Math.sin(t) * 0.15;
        setOpacity(dom, dk);
      },
    };
  },
});

// ---------------------------------------------------------------------------
// 13 AllenVerse: a globe with ten mission sites, the same day two ways, three modes.
export const allen = worldScene({
  id: 'allen', accent: '#00bceb', url: 'https://rosy-beacon-q5c8.here.now/',
  bg: { a: '#02040c', b: '#0a1f44', c: '#00bceb', mix: [0.8, 0.5, 0, 0.7] },
  bgSteps: [null, { a: '#06040a', b: '#20102a', c: '#f25c9a', mix: [0.6, 0.8, 0, 0.5] }, { a: '#020a10', b: '#06385a', c: '#6cc04a', mix: [1, 0.6, 0, 0.5] }],
  media: ['allen-1.jpg', 'allen-2.jpg', 'allen-3.jpg'],
  scale: 0.66, dpos: [-2, 0, -1],
  diorama(group) {
    const d = new THREE.Group(); group.add(d);
    d.add(gridFloor(60, 30, C.sky, 0.1));
    const globe = new THREE.Group(); globe.position.y = 6; d.add(globe);
    globe.add(new THREE.Mesh(new THREE.SphereGeometry(5, 32, 20), new THREE.MeshBasicMaterial({ color: C.sky, wireframe: true, transparent: true, opacity: 0.18 })));
    for (let k = 1; k < 7; k++) {
      const lat = (k / 7 - 0.5) * Math.PI; const r = Math.cos(lat) * 5.05;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.02, 4, 100), new THREE.MeshBasicMaterial({ color: C.ice, transparent: true, opacity: 0.45 }));
      ring.rotation.x = Math.PI / 2; ring.position.y = Math.sin(lat) * 5.05; globe.add(ring);
    }
    const sites = [];
    for (let i = 0; i < 10; i++) {
      const lat = rr(-0.6, 0.9), lon = rr(0, Math.PI * 2);
      const p = V(Math.cos(lat) * Math.cos(lon) * 5.2, Math.sin(lat) * 5.2, Math.cos(lat) * Math.sin(lon) * 5.2);
      const s = glowSprite(C.gold, 1.3, 0.95); s.position.copy(p); globe.add(s);
      const lb = label(`M${i + 1}`, { size: 0.36, color: '#ffe9a6', weight: 700 }); lb.position.copy(p).multiplyScalar(1.12); globe.add(lb);
      sites.push(s);
    }
    const sitesLb = pill('Ten missions · ten real locations', '#ffd95a', 0.48); sitesLb.position.set(0, 12.6, 0); d.add(sitesLb);
    const rails = [['Traditional IT', C.red, '#e2231a', 8], ['AgenticOps', C.green, '#6cc04a', 3]].map(([n, c, hx, beats], j) => {
      const g = new THREE.Group(); g.position.set(0, 0.2, 7 + j * 2.4);
      const tube = drawTube(new THREE.LineCurve3(V(-8, 0, 0), V(8, 0, 0)), { radius: 0.06, color: c }); tube.userData.setProgress(1); g.add(tube);
      const lb = tag(n, hx, 0.42); lb.position.set(10.5, 0.4, 0); g.add(lb);
      const dots = []; for (let k = 0; k < beats; k++) { const s = glowSprite(c, 0.9, 0.95); s.position.set(-8 + (k + 0.5) * (16 / beats), 0, 0); g.add(s); dots.push(s); }
      const pulse = glowSprite(C.white, 1.4, 0.9); g.add(pulse); g.userData.pulse = pulse;
      d.add(g); return g;
    });
    const modes = [['Present', '#00bceb'], ['Play', '#6cc04a'], ['Learn', '#fbab18']].map(([n, c], i) => {
      const lb = pill(n, c, 0.7); lb.position.set(-1 + i * 5.5, 1.5, 3); d.add(lb); return lb;
    });
    let rk = 0, mk = 0;
    return {
      update(dt, t, step) {
        rk = damp(rk, step >= 1 ? 1 : 0, 2.5, dt); mk = damp(mk, step >= 2 ? 1 : 0, 2.5, dt);
        globe.rotation.y = t * 0.12;
        sites.forEach((s, i) => s.scale.setScalar(1.1 + Math.sin(t * 3 + i) * 0.25));
        rails.forEach((g, j) => { setOpacity(g, rk); g.userData.pulse.position.x = -8 + ((t * (j ? 0.35 : 0.12)) % 1) * 16; });
        modes.forEach((lb, i) => { setOpacity(lb, smooth(mk * 3 - i * 0.4)); lb.position.y = 1.5 + smooth(mk * 3 - i * 0.4) * 1.2; });
      },
    };
  },
});

// ---------------------------------------------------------------------------
// 14 SEVerse: a leadership explainer, then the design breaks into skill cards that
// settle into a grid over the bridge bars.
export const severse = {
  id: 'severse',
  bg: { a: '#02060c', b: '#062a2e', c: '#2de2c5', mix: [0.4, 0.8, 0.8, 0.4] },
  bgSteps: [null, { a: '#06040c', b: '#20102a', c: '#f25c9a', mix: [0.6, 0.6, 0.6, 0.5] }, { a: '#02060f', b: '#062a4d', c: '#00bceb', mix: [0.8, 0.8, 0.7, 0.5] }],
  cams: [{ p: [-2, 7, 28], t: [3.5, 5.5, 0] }, { p: [0, 8, 28], t: [4, 7, 0] }, { p: [-3, 7.5, 31], t: [4, 6.5, 0] }],
  build() {
    const group = new THREE.Group(); group.position.x = 4;
    group.add(gridFloor(120, 60, C.teal, 0.1));
    const explainer = canvasPanel(10, 5.6, (g, W, H) => {
      g.fillStyle = 'rgba(5,14,29,0.92)'; roundRect(g, 6, 6, W - 12, H - 12, 30); g.fill();
      g.strokeStyle = '#2de2c5'; g.lineWidth = 5; g.stroke();
      g.fillStyle = '#2de2c5'; g.font = `700 ${H * 0.045}px Inter, Arial`; g.fillText('AI LEADERSHIP EXPLAINER · NARRATED · PASSWORD PROTECTED', W * 0.06, H * 0.14);
      g.fillStyle = '#ffffff'; g.font = `800 ${H * 0.12}px Inter, Arial`; g.fillText('From Boxes to', W * 0.06, H * 0.36); g.fillText('Business Outcomes', W * 0.06, H * 0.5);
      g.fillStyle = '#9fb3c8'; g.font = `500 ${H * 0.055}px Inter, Arial`; g.fillText('The whole multiverse as proof the unit of value changed', W * 0.06, H * 0.64);
      ['#e2231a', '#8e7cff', '#2de2c5', '#fbab18', '#6cc04a', '#00bceb', '#f25c9a'].forEach((c, k) => { g.fillStyle = c; g.beginPath(); g.arc(W * (0.09 + k * 0.07), H * 0.82, H * 0.035, 0, Math.PI * 2); g.fill(); });
      g.strokeStyle = '#ffd95a'; g.lineWidth = 6; roundRect(g, W * 0.84, H * 0.72, W * 0.08, H * 0.13, 8); g.stroke();
      g.beginPath(); g.arc(W * 0.88, H * 0.72, W * 0.025, Math.PI, 0); g.stroke();
    }, 150);
    explainer.position.set(0, 6, 0); group.add(explainer);
    const cards = [['Colorway', 'midnight · blue · green', '#ffffff'], ['Typography', 'Inter · two-clause heads', '#00bceb'], ['Particles', 'one field, new shape', '#6cc04a'], ['Glass', 'panels · topbar · progress', '#9be7ff'], ['Components', 'chips · KPIs · canvas', '#fbab18'], ['Copy rules', 'no em dashes', '#e2231a'], ['Narration', 'neural voice, captions', '#f25c9a'], ['Formations', 'meaning per section', '#8e7cff'], ['Bridge bars', 'the signature close', '#00bceb']].map(([n, s, c], i) => {
      const p = canvasPanel(3.4, 2.0, (g, W, H) => {
        g.fillStyle = 'rgba(7,24,45,0.9)'; roundRect(g, 4, 4, W - 8, H - 8, 20); g.fill();
        g.strokeStyle = 'rgba(155,231,255,0.45)'; g.lineWidth = 3; g.stroke();
        g.fillStyle = c; roundRect(g, W * 0.07, H * 0.13, H * 0.14, H * 0.14, 6); g.fill();
        g.fillStyle = '#ffffff'; g.font = `700 ${H * 0.14}px Inter, Arial`; g.fillText(n, W * 0.07 + H * 0.2, H * 0.25);
        g.fillStyle = '#9fb3c8'; g.font = `500 ${H * 0.1}px Inter, Arial`; g.fillText(s, W * 0.07, H * 0.48);
      }, 110);
      p.userData.grid = V(((i % 3) - 1) * 3.8, 11.8 - Math.floor(i / 3) * 2.3, 0);
      p.userData.from = V(rr(-3, 3), rr(4, 8), rr(-1, 1));
      group.add(p); return p;
    });
    const bars = bridgeBars({ spacing: 0.9, unit: 0.9, radius: 0.2 }); bars.position.set(0, 0, 1); group.add(bars);
    const skillLb = label('cisco-branded skill', { size: 0.5, color: '#ffffff', mono: true, bg: 'rgba(3,10,22,0.8)', border: '#2de2c5' }); skillLb.position.set(0, 4.2, 1); group.add(skillLb);
    let ek = 0, ck = 0, bk = 0;
    return {
      group,
      update(dt, t, step) {
        ek = damp(ek, step === 0 ? 1 : 0, 6, dt); ck = damp(ck, step >= 1 ? 1 : 0, 2.2, dt); bk = damp(bk, step >= 2 ? 1 : 0, 2.2, dt);
        setOpacity(explainer, ek); explainer.position.y = 6 + Math.sin(t * 0.8) * 0.15; explainer.scale.setScalar(0.85 + 0.15 * ek);
        cards.forEach((p, i) => {
          const k = smooth(ck * 1.6 - i * 0.07);
          p.position.lerpVectors(p.userData.from, p.userData.grid, k);
          setOpacity(p, k * (0.85 + 0.15 * Math.sin(t * 2 + i) * bk));
        });
        bars.userData.setHeights(Math.max(0.01, smooth(bk)), t); bars.visible = bk > 0.02;
        setOpacity(skillLb, bk);
      },
      reset() { ek = 1; ck = 0; bk = 0; },
    };
  },
};

// ---------------------------------------------------------------------------
// 15 The loop: conversation, context and world as three nodes on a ring; transcripts flow.
export const fuel = {
  id: 'fuel',
  bg: { a: '#020804', b: '#0a2a14', c: '#6cc04a', mix: [0.6, 0.6, 1, 0.3] },
  bgSteps: [null, { a: '#04030f', b: '#1a1440', c: '#8e7cff', mix: [0.6, 0.6, 1, 0.4] }, { a: '#020a06', b: '#0c2a1c', c: '#6cc04a', mix: [1, 0.6, 1, 0.4] }],
  cams: [{ p: [-2, 6, 28], t: [4, 5, 0] }, { p: [0, 8, 27], t: [4, 5, 0] }, { p: [-4, 10, 30], t: [4, 5, 0] }],
  build() {
    const group = new THREE.Group(); group.position.x = 4;
    const R = 7.5, cy = 5.5;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R, 0.08, 8, 200), new THREE.MeshBasicMaterial({ color: C.violet, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending }));
    ring.position.y = cy; group.add(ring);
    const nodeDefs = [['Conversation', C.violet, '#8e7cff', Math.PI / 2], ['Context', C.sky, '#00bceb', Math.PI * 1.17], ['World', C.green, '#6cc04a', -Math.PI * 0.17]];
    const nodes = nodeDefs.map(([n, c, hx, a]) => {
      const p = V(Math.cos(a) * R, cy + Math.sin(a) * R, 0);
      const m = new THREE.Mesh(new THREE.SphereGeometry(1.1, 24, 16), emissiveMat(c, 1.5)); m.position.copy(p); group.add(m);
      const lb = pill(n, hx, 0.6); lb.position.copy(p).add(V(0, -1.9, 0.5)); group.add(lb);
      return { m, lb, a };
    });
    const docs = ['Customer', 'Keith', 'Steve', 'Anu', 'TAC notes'].map((n, i) => {
      const p = canvasPanel(1.6, 2.0, (g, W, H) => {
        g.fillStyle = 'rgba(200,215,235,0.92)'; roundRect(g, 4, 4, W - 8, H - 8, 12); g.fill();
        g.fillStyle = '#0d274d'; g.font = `700 ${H * 0.11}px Inter, Arial`; g.fillText(n, W * 0.1, H * 0.18);
        g.fillStyle = 'rgba(0,120,180,0.6)';
        for (let k = 0; k < 5; k++) { roundRect(g, W * 0.1, H * (0.3 + k * 0.12), W * (0.75 - (k % 2) * 0.2), H * 0.05, 4); g.fill(); }
      }, 70);
      p.userData.ph = i / 5; group.add(p); return p;
    });
    const world = makePyramid([C.violet, C.sky, C.green], ['', '', ''], { scale: 0.42 });
    world.pivot.position.set(0, cy - 3, 0); group.add(world.pivot);
    const pulse = glowSprite(C.white, 2.4, 0.9); group.add(pulse);
    let wk = 0, lk = 0;
    return {
      group,
      update(dt, t, step) {
        wk = damp(wk, step >= 1 ? 1 : 0, 2.2, dt); lk = damp(lk, step >= 2 ? 1 : 0, 2.2, dt);
        ring.rotation.z = t * 0.05;
        docs.forEach((p) => {
          // step 0: from the left into Conversation; step 2: around the whole ring
          const u = (t * 0.12 + p.userData.ph) % 1;
          const a0 = Math.PI / 2;
          const inflow = V(-5.5 + u * 4.5, cy + 7.4 - u * 0.4 + Math.sin(u * 6) * 0.3, 2);
          const around = V(Math.cos(a0 - u * Math.PI * 2) * (R + 1.8), cy + Math.sin(a0 - u * Math.PI * 2) * (R + 1.8), 1.5);
          p.position.lerpVectors(inflow, around, smooth(lk));
          p.rotation.z = Math.sin(t + p.userData.ph * 6) * 0.2;
          setOpacity(p, Math.min(1, Math.sin(u * Math.PI) * 2 + lk));
        });
        world.pivot.scale.setScalar(Math.max(0.001, 0.42 * smooth(wk)));
        world.pivot.rotation.y = t * 0.3;
        world.tiers.forEach((tr, i) => { tr.userData.fill.material.emissiveIntensity = 0.3 + wk * 0.6 + lk * 0.3 * Math.sin(t * 2 + i); });
        nodes.forEach((n, i) => { n.m.scale.setScalar(1 + 0.12 * Math.sin(t * 2 + i) * (i === 0 ? 1 : i === 1 ? wk : lk)); });
        const pa = Math.PI / 2 - (t * 0.5 % (Math.PI * 2));
        pulse.position.set(Math.cos(pa) * R, cy + Math.sin(pa) * R, 0.2);
        pulse.material.opacity = 0.9 * lk;
      },
    };
  },
};

// ---------------------------------------------------------------------------
// 16 Guardrails: hex shields light around the idea core, two per click.
export const guardrails = {
  id: 'guardrails',
  bg: { a: '#06060a', b: '#1e1a10', c: '#fbab18', mix: [0.5, 0.8, 0, 0.4] },
  bgSteps: [null, { a: '#08040a', b: '#2a0c18', c: '#f25c9a', mix: [0.5, 0.8, 0, 0.4] }, { a: '#02060f', b: '#062a4d', c: '#00bceb', mix: [0.8, 0.8, 0, 0.5] }],
  cams: [{ p: [-2, 6, 28], t: [4, 5, 0] }, { p: [0, 7, 27], t: [4, 5, 0] }, { p: [-3, 8, 30], t: [4, 5, 0] }],
  build() {
    const group = new THREE.Group(); group.position.x = 4;
    group.add(gridFloor(120, 60, C.amber, 0.1));
    const cy = 5.5;
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.8, 1), new THREE.MeshStandardMaterial({ color: 0x050816, emissive: C.gold, emissiveIntensity: 0.22, flatShading: true }));
    core.position.y = cy; group.add(core);
    const coreGlow = glowSprite(C.gold, 8, 0.18); coreGlow.position.y = cy; group.add(coreGlow);
    const coreLb = pill('Idea generator', '#ffd95a', 0.5); coreLb.position.set(0, cy - 2.8, 1); group.add(coreLb);
    const names = ['Modeled, and labeled', 'Public sources', 'Ask where it got that', 'Vet with the account team', 'Internal first', 'No secrets in prompts'];
    const colors = ['#6cc04a', '#00bceb', '#f25c9a', '#8e7cff', '#fbab18', '#e2231a'];
    const shields = names.map((n, i) => {
      const a = Math.PI / 2 - (i / 6) * Math.PI * 2;
      const g = new THREE.Group(); g.position.set(Math.cos(a) * 6.4, cy + Math.sin(a) * 5.2, 0);
      const geo = new THREE.CylinderGeometry(1.5, 1.5, 0.25, 6); geo.rotateX(Math.PI / 2);
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x050e1d, emissive: col(colors[i]), emissiveIntensity: 0.1, transparent: true, opacity: 0.6 }));
      m.add(edgeLines(geo, col(colors[i]), 0.9)); g.add(m);
      const lb = label(n, { size: 0.38, color: '#ffffff', bg: 'rgba(3,10,22,0.8)', border: colors[i] }); lb.position.set(0, -1.9, 0.4); g.add(lb);
      g.userData = { m, lb, k: 0 }; group.add(g); return g;
    });
    return {
      group,
      update(dt, t, step) {
        core.rotation.y = t * 0.3; core.rotation.x = t * 0.15;
        shields.forEach((g, i) => {
          const on = Math.floor(i / 2) <= step ? 1 : 0;
          g.userData.k = damp(g.userData.k, on, 3, dt);
          const k = g.userData.k;
          g.userData.m.material.emissiveIntensity = 0.1 + k * 1.1 + (on ? 0.15 * Math.sin(t * 2 + i) : 0);
          g.userData.m.rotation.z = t * 0.2 * (i % 2 ? 1 : -1);
          setOpacity(g.userData.lb, 0.25 + 0.75 * k);
        });
      },
    };
  },
};

// ---------------------------------------------------------------------------
// 17 Hero close: the bridge bars return, an inverted pyramid shrinks above, an audio-wave
// floor answers at step 1.
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
    pyr.rotation.z = Math.PI; pyr.position.set(0, 16.5, -8); group.add(pyr);
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
          b.scale.y = h; b.position.y = h / 2; b.visible = wk > 0.02;
        });
      },
      reset() { k = 0; },
    };
  },
};
