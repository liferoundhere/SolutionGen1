/* MSK Ops Twin — core utilities (classic script, attaches to window.MSK) */
(function () {
  const MSK = (window.MSK = window.MSK || {});
  MSK.scenarios = MSK.scenarios || [];
  MSK.registerScenario = function (s) { MSK.scenarios.push(s); };

  // ---------- deterministic randomness ----------
  function hashStr(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const U = (MSK.util = {
    hashStr, mulberry32,
    rng(seed) { return mulberry32(typeof seed === 'string' ? hashStr(seed) : seed); },
    clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
    lerp: (a, b, t) => a + (b - a) * t,
    smooth: (t) => t * t * (3 - 2 * t),
    pick(arr, r) { return arr[Math.floor((r ? r() : Math.random()) * arr.length)]; },
    fmt(n, d = 0) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); },
    money(n) {
      const a = Math.abs(n);
      if (a >= 1e6) return '$' + (n / 1e6).toFixed(a >= 1e7 ? 1 : 2) + 'M';
      if (a >= 1e3) return '$' + (n / 1e3).toFixed(a >= 1e5 ? 0 : 1) + 'K';
      return '$' + n.toFixed(0);
    },
    compact(n) {
      const a = Math.abs(n);
      if (a >= 1e9) return (n / 1e9).toFixed(2) + 'B';
      if (a >= 1e6) return (n / 1e6).toFixed(a >= 1e7 ? 1 : 2) + 'M';
      if (a >= 1e3) return (n / 1e3).toFixed(a >= 1e4 ? 0 : 1) + 'K';
      return String(Math.round(n));
    },
    esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); },
    el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; },
    $(sel, root) { return (root || document).querySelector(sel); },
    $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); },
    initials(name) { return name.replace(/^(Dr\.|Capt\.|Chef)\s+/, '').split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase(); },
    // series generator: smooth noisy series for charts
    series(seed, n, base, amp, opts = {}) {
      const r = U.rng(seed); const out = []; let v = base;
      for (let i = 0; i < n; i++) {
        const trend = opts.trend ? opts.trend * i : 0;
        const season = opts.season ? Math.sin((i / n) * Math.PI * 2 * opts.season) * amp * 0.6 : 0;
        v = v * 0.55 + (base + trend + season + (r() - 0.5) * amp) * 0.45;
        out.push(Math.max(opts.min ?? -Infinity, v));
      }
      return out;
    },
    timeStr(minutes) {
      const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
      const h = Math.floor(m / 60), mm = m % 60;
      return String(h).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
    },
  });

  // ---------- tiny event bus ----------
  const handlers = {};
  MSK.bus = {
    on(ev, fn) { (handlers[ev] = handlers[ev] || []).push(fn); return () => MSK.bus.off(ev, fn); },
    off(ev, fn) { handlers[ev] = (handlers[ev] || []).filter((f) => f !== fn); },
    emit(ev, data) { (handlers[ev] || []).slice().forEach((f) => { try { f(data); } catch (e) { console.error('[bus]', ev, e); } }); },
  };

  // ---------- SVG mini chart kit ----------
  const C = (MSK.chart = {});
  const NS = 'http://www.w3.org/2000/svg';
  C.spark = function (vals, opt = {}) {
    const w = opt.w || 120, h = opt.h || 32, col = opt.color || 'var(--accent)';
    const min = opt.min ?? Math.min(...vals), max = opt.max ?? Math.max(...vals);
    const sx = (i) => (i / (vals.length - 1)) * (w - 2) + 1;
    const sy = (v) => h - 2 - ((v - min) / (max - min || 1)) * (h - 4);
    const d = vals.map((v, i) => (i ? 'L' : 'M') + sx(i).toFixed(1) + ' ' + sy(v).toFixed(1)).join(' ');
    const area = d + ` L ${sx(vals.length - 1)} ${h} L ${sx(0)} ${h} Z`;
    const gid = 'g' + Math.random().toString(36).slice(2, 8);
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="none">
      <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".35"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs>
      <path d="${area}" fill="url(#${gid})"/><path d="${d}" fill="none" stroke="${col}" stroke-width="1.6" vector-effect="non-scaling-stroke"/>
      <circle cx="${sx(vals.length - 1)}" cy="${sy(vals[vals.length - 1])}" r="2.4" fill="${col}"/></svg>`;
  };
  // multi-series line chart with axes
  C.lines = function (series, opt = {}) {
    const w = opt.w || 520, h = opt.h || 180, pad = { l: 36, r: 10, t: 10, b: 22 };
    const all = series.flatMap((s) => s.values);
    const min = opt.min ?? Math.min(0, ...all), max = opt.max ?? Math.max(...all) * 1.08;
    const n = series[0].values.length;
    const sx = (i) => pad.l + (i / (n - 1)) * (w - pad.l - pad.r);
    const sy = (v) => h - pad.b - ((v - min) / (max - min || 1)) * (h - pad.t - pad.b);
    let g = '';
    for (let k = 0; k <= 4; k++) {
      const v = min + ((max - min) * k) / 4, y = sy(v);
      g += `<line x1="${pad.l}" x2="${w - pad.r}" y1="${y}" y2="${y}" class="gridl"/><text x="${pad.l - 6}" y="${y + 3}" class="axt" text-anchor="end">${opt.fmt ? opt.fmt(v) : U.compact(v)}</text>`;
    }
    (opt.xlabels || []).forEach((lb, i, arr) => {
      const x = pad.l + (i / (arr.length - 1)) * (w - pad.l - pad.r);
      g += `<text x="${x}" y="${h - 6}" class="axt" text-anchor="middle">${lb}</text>`;
    });
    if (opt.band) { const [a, b] = opt.band; g += `<rect x="${sx(a)}" y="${pad.t}" width="${sx(b) - sx(a)}" height="${h - pad.t - pad.b}" class="band"/>`; }
    if (opt.marker != null) g += `<line x1="${sx(opt.marker)}" x2="${sx(opt.marker)}" y1="${pad.t}" y2="${h - pad.b}" class="markl"/>`;
    series.forEach((s) => {
      const d = s.values.map((v, i) => (i ? 'L' : 'M') + sx(i).toFixed(1) + ' ' + sy(v).toFixed(1)).join(' ');
      if (s.area) g += `<path d="${d} L ${sx(n - 1)} ${sy(min)} L ${sx(0)} ${sy(min)} Z" fill="${s.color}" opacity=".12"/>`;
      g += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.width || 2}" ${s.dash ? 'stroke-dasharray="4 4"' : ''} stroke-linejoin="round"/>`;
    });
    let leg = '';
    if (opt.legend !== false) leg = `<div class="legend">${series.map((s) => `<span><i style="background:${s.color}"></i>${U.esc(s.name)}</span>`).join('')}</div>`;
    return `<div class="chart">${leg}<svg viewBox="0 0 ${w} ${h}" width="100%" preserveAspectRatio="xMidYMid meet">${g}</svg></div>`;
  };
  C.bars = function (items, opt = {}) {
    const max = opt.max || Math.max(...items.map((i) => i.value)) * 1.05;
    return `<div class="hbars">${items.map((it) => `
      <div class="hbar"><span class="hb-l">${U.esc(it.label)}</span>
      <span class="hb-t"><span class="hb-f" style="width:${(it.value / max) * 100}%;background:${it.color || opt.color || 'var(--accent)'}"></span>${it.ghost != null ? `<span class="hb-g" style="left:${(it.ghost / max) * 100}%"></span>` : ''}</span>
      <span class="hb-v">${opt.fmt ? opt.fmt(it.value) : U.compact(it.value)}</span></div>`).join('')}</div>`;
  };
  C.vbars = function (vals, opt = {}) {
    const w = opt.w || 520, h = opt.h || 150, pad = { l: 30, r: 6, t: 8, b: 20 };
    const max = opt.max || Math.max(...vals.map((v) => (Array.isArray(v) ? v.reduce((a, b) => a + b, 0) : v))) * 1.1;
    const bw = (w - pad.l - pad.r) / vals.length;
    const cols = opt.colors || ['var(--accent)'];
    let g = '';
    for (let k = 0; k <= 3; k++) { const v = (max * k) / 3; const y = h - pad.b - (v / max) * (h - pad.t - pad.b); g += `<line x1="${pad.l}" x2="${w - pad.r}" y1="${y}" y2="${y}" class="gridl"/><text x="${pad.l - 4}" y="${y + 3}" class="axt" text-anchor="end">${opt.fmt ? opt.fmt(v) : U.compact(v)}</text>`; }
    vals.forEach((v, i) => {
      const stack = Array.isArray(v) ? v : [v]; let acc = 0;
      stack.forEach((sv, k) => {
        const bh = (sv / max) * (h - pad.t - pad.b);
        const y = h - pad.b - ((acc + sv) / max) * (h - pad.t - pad.b);
        g += `<rect x="${pad.l + i * bw + bw * 0.15}" y="${y}" width="${bw * 0.7}" height="${Math.max(0, bh)}" rx="2" fill="${cols[k % cols.length]}" ${opt.hi === i ? 'stroke="#fff" stroke-width="1"' : ''}/>`;
        acc += sv;
      });
      if (opt.xlabels && opt.xlabels[i] != null) g += `<text x="${pad.l + i * bw + bw / 2}" y="${h - 6}" class="axt" text-anchor="middle">${opt.xlabels[i]}</text>`;
    });
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" class="chart-svg">${g}</svg>`;
  };
  C.donut = function (parts, opt = {}) {
    const size = opt.size || 120, r = size / 2 - 8, cx = size / 2, cy = size / 2, sw = opt.stroke || 14;
    const tot = parts.reduce((a, p) => a + p.value, 0); let acc = 0; const circ = 2 * Math.PI * r;
    const arcs = parts.map((p) => { const len = (p.value / tot) * circ; const s = `<circle r="${r}" cx="${cx}" cy="${cy}" fill="none" stroke="${p.color}" stroke-width="${sw}" stroke-dasharray="${len} ${circ - len}" stroke-dashoffset="${-acc}" transform="rotate(-90 ${cx} ${cy})"/>`; acc += len; return s; }).join('');
    return `<div class="donut"><svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><circle r="${r}" cx="${cx}" cy="${cy}" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="${sw}"/>${arcs}<text x="${cx}" y="${cy - 2}" text-anchor="middle" class="dn-v">${opt.center || ''}</text><text x="${cx}" y="${cy + 14}" text-anchor="middle" class="dn-l">${opt.sub || ''}</text></svg>
      <div class="legend col">${parts.map((p) => `<span><i style="background:${p.color}"></i>${U.esc(p.label)} <b>${opt.fmt ? opt.fmt(p.value) : Math.round((p.value / tot) * 100) + '%'}</b></span>`).join('')}</div></div>`;
  };
  C.gauge = function (v, opt = {}) {
    const size = opt.size || 110, r = size / 2 - 10, cx = size / 2, cy = size / 2 + 6;
    const a0 = Math.PI * 0.8, a1 = Math.PI * 2.2, t = U.clamp(v / (opt.max || 100), 0, 1);
    const pt = (a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    const arc = (from, to) => { const [x0, y0] = pt(from), [x1, y1] = pt(to); return `M ${x0} ${y0} A ${r} ${r} 0 ${to - from > Math.PI ? 1 : 0} 1 ${x1} ${y1}`; };
    const col = opt.color || (t > (opt.warn || 0.85) ? 'var(--crit)' : t > (opt.ok || 0.7) ? 'var(--warn)' : 'var(--ok)');
    return `<svg viewBox="0 0 ${size} ${size * 0.86}" width="${size}" class="gauge"><path d="${arc(a0, a1)}" stroke="rgba(255,255,255,.08)" stroke-width="9" fill="none" stroke-linecap="round"/><path d="${arc(a0, a0 + (a1 - a0) * Math.max(0.001, t))}" stroke="${col}" stroke-width="9" fill="none" stroke-linecap="round"/><text x="${cx}" y="${cy + 2}" text-anchor="middle" class="g-v">${opt.label || Math.round(v)}</text><text x="${cx}" y="${cy + 17}" text-anchor="middle" class="g-l">${opt.sub || ''}</text></svg>`;
  };
  C.heat = function (rows, cols, valFn, opt = {}) {
    let html = `<div class="heat" style="grid-template-columns: 90px repeat(${cols.length}, 1fr)"><span></span>${cols.map((c) => `<span class="hh">${c}</span>`).join('')}`;
    rows.forEach((r, i) => { html += `<span class="hr">${r}</span>`; cols.forEach((c, j) => { const v = valFn(i, j); html += `<span class="hc" style="background:${opt.color ? opt.color(v) : `rgba(34,211,238,${0.08 + v * 0.8})`}" title="${r} · ${c}: ${opt.fmt ? opt.fmt(v) : (v * 100).toFixed(0)}">${opt.show ? (opt.fmt ? opt.fmt(v) : '') : ''}</span>`; }); });
    return html + '</div>';
  };
})();
