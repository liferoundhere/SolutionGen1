// Canvas 2D animated narrator. Stylised, clearly synthetic, driven by audio level and the current letter.
const lerp = (a, b, k) => a + (b - a) * k;
const shade = (hex, f) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) => Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f)));
  return `rgb(${ch(n >> 16)},${ch((n >> 8) & 255)},${ch(n & 255)})`;
};
const VISEME = (c) => {
  if (!c) return [0.15, 0.5];
  c = c.toLowerCase();
  if ('mbp'.includes(c)) return [0.02, 0.45];
  if ('fv'.includes(c)) return [0.18, 0.62];
  if ('ou'.includes(c)) return [0.7, 0.28];
  if ('wq'.includes(c)) return [0.45, 0.3];
  if (c === 'a') return [1, 0.72];
  if ('ei'.includes(c)) return [0.55, 0.9];
  if ('y'.includes(c)) return [0.45, 0.8];
  if ('lnt d'.includes(c)) return [0.35, 0.66];
  return [0.4, 0.6];
};

export function createAvatar(canvas, { mode = 'person', look } = {}) {
  const ctx = canvas.getContext('2d');
  const st = { mode, look, open: 0, wide: 0.5, blink: 0, nextBlink: 2, gaze: [0, 0], gazeT: [0, 0], nextGaze: 1, brow: 0, nod: 0, amp: 0, hist: new Array(28).fill(0) };

  function size() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(40, Math.round(r.width * dpr)), h = Math.max(30, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    return [w, h];
  }

  function backdrop(w, h, t, speaking) {
    const g = ctx.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.45, h * 0.9);
    g.addColorStop(0, '#14406e'); g.addColorStop(0.5, '#0a2446'); g.addColorStop(1, '#050e1d');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.strokeStyle = 'rgba(0,188,235,0.10)'; ctx.lineWidth = 1;
    const hz = h * 0.72;
    for (let i = -8; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(w / 2 + i * w * 0.03, hz); ctx.lineTo(w / 2 + i * w * 0.2, h); ctx.stroke(); }
    for (let k = 0; k < 6; k++) { const y = hz + Math.pow(k / 6, 1.8) * (h - hz) + ((t * 6) % 6) / 6 * 4; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    const halo = ctx.createRadialGradient(w * 0.5, h * 0.4, h * 0.05, w * 0.5, h * 0.4, h * 0.55);
    halo.addColorStop(0, `rgba(0,188,235,${0.16 + speaking * 0.14})`); halo.addColorStop(1, 'rgba(0,188,235,0)');
    ctx.fillStyle = halo; ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  function overlay(w, h, t) {
    ctx.save();
    ctx.fillStyle = 'rgba(155,231,255,0.035)';
    for (let y = (t * 18) % 4; y < h; y += 4) ctx.fillRect(0, y, w, 1);
    const bw = w * 0.006, gap = w * 0.011, x0 = w * 0.05, y0 = h * 0.07;
    st.hist.forEach((v, i) => {
      const bh = Math.max(h * 0.008, v * h * 0.07);
      ctx.fillStyle = `rgba(0,188,235,${0.35 + v * 0.6})`;
      ctx.fillRect(x0 + i * gap, y0 + h * 0.04 - bh / 2, bw, bh);
    });
    ctx.restore();
  }

  function hairBack(L, s, cx, cy, hr) {
    ctx.fillStyle = L.hair;
    if (L.style === 'long') {
      ctx.beginPath();
      ctx.moveTo(cx - hr * 1.05, cy - hr * 0.2);
      ctx.bezierCurveTo(cx - hr * 1.25, cy + hr * 1.2, cx - hr * 1.1, cy + hr * 1.9, cx - hr * 0.55, cy + hr * 2.05);
      ctx.lineTo(cx + hr * 0.55, cy + hr * 2.05);
      ctx.bezierCurveTo(cx + hr * 1.1, cy + hr * 1.9, cx + hr * 1.25, cy + hr * 1.2, cx + hr * 1.05, cy - hr * 0.2);
      ctx.closePath(); ctx.fill();
    } else if (L.style === 'bob') {
      ctx.beginPath();
      ctx.moveTo(cx - hr * 1.08, cy - hr * 0.3);
      ctx.bezierCurveTo(cx - hr * 1.2, cy + hr * 0.6, cx - hr * 1.12, cy + hr * 1.0, cx - hr * 0.8, cy + hr * 1.05);
      ctx.lineTo(cx + hr * 0.8, cy + hr * 1.05);
      ctx.bezierCurveTo(cx + hr * 1.12, cy + hr * 1.0, cx + hr * 1.2, cy + hr * 0.6, cx + hr * 1.08, cy - hr * 0.3);
      ctx.closePath(); ctx.fill();
    }
  }

  function hairFront(L, cx, cy, hr) {
    ctx.fillStyle = L.hair;
    ctx.beginPath();
    if (L.style === 'short') {
      ctx.moveTo(cx - hr * 0.98, cy - hr * 0.15);
      ctx.bezierCurveTo(cx - hr * 1.05, cy - hr * 1.25, cx + hr * 1.05, cy - hr * 1.25, cx + hr * 0.98, cy - hr * 0.15);
      ctx.bezierCurveTo(cx + hr * 0.8, cy - hr * 0.6, cx - hr * 0.8, cy - hr * 0.62, cx - hr * 0.98, cy - hr * 0.15);
    } else if (L.style === 'side') {
      ctx.moveTo(cx - hr * 1.0, cy - hr * 0.05);
      ctx.bezierCurveTo(cx - hr * 1.15, cy - hr * 1.3, cx + hr * 1.1, cy - hr * 1.35, cx + hr * 1.0, cy - hr * 0.1);
      ctx.bezierCurveTo(cx + hr * 0.6, cy - hr * 0.75, cx - hr * 0.1, cy - hr * 0.5, cx - hr * 0.35, cy - hr * 0.85);
      ctx.bezierCurveTo(cx - hr * 0.6, cy - hr * 0.5, cx - hr * 0.85, cy - hr * 0.4, cx - hr * 1.0, cy - hr * 0.05);
    } else {
      ctx.moveTo(cx - hr * 1.05, cy + hr * 0.1);
      ctx.bezierCurveTo(cx - hr * 1.15, cy - hr * 1.3, cx + hr * 1.15, cy - hr * 1.3, cx + hr * 1.05, cy + hr * 0.1);
      ctx.bezierCurveTo(cx + hr * 0.85, cy - hr * 0.5, cx + hr * 0.2, cy - hr * 0.62, cx - hr * 0.15, cy - hr * 0.6);
      ctx.bezierCurveTo(cx - hr * 0.6, cy - hr * 0.55, cx - hr * 0.95, cy - hr * 0.35, cx - hr * 1.05, cy + hr * 0.1);
    }
    ctx.fill();
  }

  function person(w, h, t, dt) {
    const L = st.look;
    const breathe = Math.sin(t * 1.1) * h * 0.006;
    const cx = w * 0.5 + Math.sin(t * 0.37) * w * 0.006;
    const hr = h * 0.2;
    const nod = st.nod * h * 0.012;
    const cy = h * 0.42 + breathe * 0.6 + nod + Math.sin(t * 0.8) * h * 0.004;
    const tilt = Math.sin(t * 0.43) * 0.035 + st.gaze[0] * 0.04;

    const by = h * 0.8 + breathe;
    ctx.fillStyle = L.blazer;
    ctx.beginPath();
    ctx.moveTo(w * 0.08, h); ctx.bezierCurveTo(w * 0.1, by - h * 0.02, w * 0.26, by - h * 0.12, cx - hr * 0.55, by - h * 0.14);
    ctx.lineTo(cx + hr * 0.55, by - h * 0.14); ctx.bezierCurveTo(w * 0.74, by - h * 0.12, w * 0.9, by - h * 0.02, w * 0.92, h);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = L.shirt;
    ctx.beginPath(); ctx.moveTo(cx - hr * 0.5, by - h * 0.14); ctx.lineTo(cx, h * 0.99); ctx.lineTo(cx + hr * 0.5, by - h * 0.14); ctx.closePath(); ctx.fill();
    ctx.fillStyle = shade(L.blazer, 0.12);
    ctx.beginPath(); ctx.moveTo(cx - hr * 0.55, by - h * 0.14); ctx.lineTo(cx - hr * 0.1, h); ctx.lineTo(cx - hr * 0.85, h); ctx.lineTo(cx - hr * 0.95, by - h * 0.08); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx + hr * 0.55, by - h * 0.14); ctx.lineTo(cx + hr * 0.1, h); ctx.lineTo(cx + hr * 0.85, h); ctx.lineTo(cx + hr * 0.95, by - h * 0.08); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#00bceb';
    for (let i = 0; i < 5; i++) { const bh = [0.4, 0.7, 1, 0.7, 0.4][i] * h * 0.03; ctx.fillRect(cx + hr * 1.15 + i * w * 0.008, by - h * 0.02 - bh, w * 0.004, bh); }

    ctx.fillStyle = shade(L.skin, -0.18);
    ctx.fillRect(cx - hr * 0.3, cy + hr * 0.6, hr * 0.6, by - h * 0.12 - (cy + hr * 0.6));

    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(tilt); ctx.translate(-cx, -cy);
    hairBack(L, st, cx, cy, hr);
    ctx.fillStyle = shade(L.skin, -0.08);
    ctx.beginPath(); ctx.ellipse(cx - hr * 0.86, cy + hr * 0.05, hr * 0.13, hr * 0.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + hr * 0.86, cy + hr * 0.05, hr * 0.13, hr * 0.2, 0, 0, Math.PI * 2); ctx.fill();
    const fg = ctx.createRadialGradient(cx - hr * 0.3, cy - hr * 0.3, hr * 0.1, cx, cy, hr * 1.1);
    fg.addColorStop(0, shade(L.skin, 0.12)); fg.addColorStop(1, shade(L.skin, -0.12));
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.moveTo(cx, cy - hr);
    ctx.bezierCurveTo(cx + hr * 0.95, cy - hr, cx + hr * 0.92, cy + hr * 0.45, cx + hr * 0.5, cy + hr * 0.85);
    ctx.quadraticCurveTo(cx, cy + hr * 1.12, cx - hr * 0.5, cy + hr * 0.85);
    ctx.bezierCurveTo(cx - hr * 0.92, cy + hr * 0.45, cx - hr * 0.95, cy - hr, cx, cy - hr);
    ctx.fill();
    ctx.save();
    ctx.shadowColor = 'rgba(0,188,235,0.9)'; ctx.shadowBlur = hr * 0.25;
    ctx.strokeStyle = 'rgba(155,231,255,0.55)'; ctx.lineWidth = Math.max(1, hr * 0.025);
    ctx.beginPath(); ctx.moveTo(cx + hr * 0.2, cy - hr * 0.98); ctx.bezierCurveTo(cx + hr * 0.92, cy - hr * 0.9, cx + hr * 0.92, cy + hr * 0.45, cx + hr * 0.5, cy + hr * 0.85); ctx.stroke();
    ctx.restore();
    if (L.beard) {
      ctx.fillStyle = shade(L.hair, 0.08); ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.moveTo(cx - hr * 0.78, cy + hr * 0.2);
      ctx.bezierCurveTo(cx - hr * 0.7, cy + hr * 0.95, cx - hr * 0.3, cy + hr * 1.1, cx, cy + hr * 1.1);
      ctx.bezierCurveTo(cx + hr * 0.3, cy + hr * 1.1, cx + hr * 0.7, cy + hr * 0.95, cx + hr * 0.78, cy + hr * 0.2);
      ctx.bezierCurveTo(cx + hr * 0.6, cy + hr * 0.55, cx + hr * 0.3, cy + hr * 0.42, cx, cy + hr * 0.42);
      ctx.bezierCurveTo(cx - hr * 0.3, cy + hr * 0.42, cx - hr * 0.6, cy + hr * 0.55, cx - hr * 0.78, cy + hr * 0.2);
      ctx.fill(); ctx.globalAlpha = 1;
    }
    hairFront(L, cx, cy, hr);

    const ey = cy - hr * 0.08, ex = hr * 0.36, eo = Math.max(0.08, 1 - st.blink);
    [-1, 1].forEach((side) => {
      const x = cx + side * ex;
      ctx.fillStyle = '#f4f8fc';
      ctx.beginPath(); ctx.ellipse(x, ey, hr * 0.16, hr * 0.095 * eo, 0, 0, Math.PI * 2); ctx.fill();
      if (eo > 0.2) {
        ctx.save(); ctx.beginPath(); ctx.ellipse(x, ey, hr * 0.16, hr * 0.095 * eo, 0, 0, Math.PI * 2); ctx.clip();
        const gx = x + st.gaze[0] * hr * 0.06, gy = ey + st.gaze[1] * hr * 0.03;
        ctx.fillStyle = '#3a2a1e'; ctx.beginPath(); ctx.arc(gx, gy, hr * 0.075, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0b0b0f'; ctx.beginPath(); ctx.arc(gx, gy, hr * 0.038, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(gx + hr * 0.025, gy - hr * 0.025, hr * 0.018, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      ctx.strokeStyle = shade(L.skin, -0.45); ctx.lineWidth = Math.max(1, hr * 0.022);
      ctx.beginPath(); ctx.ellipse(x, ey, hr * 0.16, hr * 0.095 * eo, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
      const bry = ey - hr * (0.2 + st.brow * 0.06);
      ctx.strokeStyle = shade(L.hair, 0.05); ctx.lineWidth = Math.max(1.5, hr * 0.045); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x - hr * 0.15, bry + hr * 0.02); ctx.quadraticCurveTo(x, bry - hr * 0.04, x + hr * 0.15 * side * side, bry + hr * 0.01); ctx.stroke();
    });
    ctx.strokeStyle = shade(L.skin, -0.3); ctx.lineWidth = Math.max(1, hr * 0.022);
    ctx.beginPath(); ctx.moveTo(cx + hr * 0.02, cy + hr * 0.0); ctx.quadraticCurveTo(cx + hr * 0.1, cy + hr * 0.26, cx - hr * 0.04, cy + hr * 0.3); ctx.stroke();

    const my = cy + hr * 0.55, mw = hr * (0.22 + st.wide * 0.16), mh = hr * (0.02 + st.open * 0.2);
    ctx.fillStyle = '#3a1418';
    ctx.beginPath(); ctx.ellipse(cx, my, mw, Math.max(hr * 0.012, mh), 0, 0, Math.PI * 2); ctx.fill();
    if (st.open > 0.25) {
      ctx.save(); ctx.beginPath(); ctx.ellipse(cx, my, mw, mh, 0, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = '#f2f2f2'; ctx.fillRect(cx - mw, my - mh, mw * 2, mh * 0.45);
      ctx.fillStyle = '#c0485a'; ctx.beginPath(); ctx.ellipse(cx, my + mh * 0.8, mw * 0.6, mh * 0.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = shade(L.skin, -0.35); ctx.lineWidth = Math.max(1, hr * 0.03);
    ctx.beginPath(); ctx.ellipse(cx, my, mw, Math.max(hr * 0.012, mh), 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  function orb(w, h, t) {
    const cx = w / 2, cy = h * 0.45, r = h * 0.2 * (1 + st.amp * 0.25);
    ctx.save();
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `rgba(0,188,235,${0.5 - i * 0.13})`; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let a = 0; a <= 64; a++) {
        const th = (a / 64) * Math.PI * 2;
        const rr = r * (1 + i * 0.18) + Math.sin(th * 5 + t * (2 + i)) * st.amp * h * 0.03;
        ctx.lineTo(cx + Math.cos(th) * rr, cy + Math.sin(th) * rr);
      }
      ctx.closePath(); ctx.stroke();
    }
    ctx.restore();
  }

  function frame(dt, t, { amp = 0, letter = '' } = {}) {
    const [w, h] = size();
    st.amp = lerp(st.amp, amp, Math.min(1, dt * 18));
    st.hist.push(st.amp); st.hist.shift();
    const [vo, vw] = VISEME(letter);
    const talking = st.amp > 0.04;
    st.open = lerp(st.open, talking ? Math.min(1, vo * (0.45 + st.amp * 1.1)) : 0, Math.min(1, dt * 22));
    st.wide = lerp(st.wide, talking ? vw : 0.5, Math.min(1, dt * 14));
    st.brow = lerp(st.brow, st.amp > 0.55 ? 1 : 0, Math.min(1, dt * 5));
    st.nod = lerp(st.nod, talking ? Math.sin(t * 5.2) * st.amp : 0, Math.min(1, dt * 6));
    st.nextBlink -= dt;
    if (st.nextBlink < 0) { st.blink = 1; st.nextBlink = 2.2 + Math.random() * 3.6; }
    st.blink = Math.max(0, st.blink - dt * 7);
    st.nextGaze -= dt;
    if (st.nextGaze < 0) { st.gazeT = [(Math.random() - 0.5) * 1.4, (Math.random() - 0.5) * 0.8]; if (Math.random() < 0.5) st.gazeT = [0, 0]; st.nextGaze = 0.8 + Math.random() * 2.4; }
    st.gaze[0] = lerp(st.gaze[0], st.gazeT[0], Math.min(1, dt * 10)); st.gaze[1] = lerp(st.gaze[1], st.gazeT[1], Math.min(1, dt * 10));
    backdrop(w, h, t, st.amp);
    if (st.mode === 'person' && st.look) person(w, h, t, dt); else orb(w, h, t);
    overlay(w, h, t);
  }

  return {
    frame,
    set(o) { Object.assign(st, o); },
    get mode() { return st.mode; },
  };
}
