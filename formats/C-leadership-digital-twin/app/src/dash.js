// Illustrative Splunk Dashboard Studio panels rendered as inline SVG. Seeded so values are stable.
const PAL = ['#00bceb', '#e5007e', '#f7931e', '#2ecc9a', '#a78bfa', '#ffcc00', '#ff6b6b', '#60a5fa'];
const lcg = (seed = 1) => { let t = seed >>> 0; return () => ((t = (t * 1664525 + 1013904223) >>> 0), t / 4294967296); };
const series = (seed, n, base, vol, trend = 0, wave = 0) => { const r = lcg(seed); let v = base; return Array.from({ length: n }, (_, i) => ((v = Math.max(0, v + (r() - 0.5) * vol + trend)), +(v + Math.sin(i / 3.2) * wave).toFixed(2))); };
const path = (vals, w, h, min, max, pad = 4) => { const r = max - min || 1; return vals.map((v, i) => `${i ? 'L' : 'M'}${(pad + (i / (vals.length - 1)) * (w - pad * 2)).toFixed(1)},${(h - pad - ((v - min) / r) * (h - pad * 2)).toFixed(1)}`).join(' '); };
const fmt = (n) => (n >= 1000 ? n.toLocaleString('en-US') : String(n));

function spark(vals, c = PAL[0], h = 34) {
  const d = path(vals, 160, h, Math.min(...vals), Math.max(...vals), 2);
  return `<svg viewBox="0 0 160 ${h}" preserveAspectRatio="none" class="spark"><path d="${d}" fill="none" stroke="${c}" stroke-width="1.8" vector-effect="non-scaling-stroke"/><path d="${d} L158,${h} L2,${h} Z" fill="${c}" opacity=".12"/></svg>`;
}
function kpi(p) {
  const [s, b, v, tr] = p.sp || [1, 10, 2];
  return `<div class="kv">${p.v}</div><div class="kd ${p.good ? 'up' : 'down'}">${p.d || ''}</div>${spark(series(s, 24, b, v, tr || 0), p.good === false ? '#ff6b6b' : PAL[0])}`;
}
function line(p, h) {
  const W = 600; const ser = p.series.map((s, i) => ({ ...s, c: s.c || PAL[i % 8], v: s.v || series(s.s, 40, s.b, s.vol, s.trend || 0) }));
  const all = ser.flatMap((s) => s.v); if (p.thresh != null) all.push(p.thresh);
  const min = Math.min(0, ...all), max = Math.max(...all) * 1.1;
  const gl = [0.25, 0.5, 0.75].map((m) => `<line x1="0" x2="${W}" y1="${h * m}" y2="${h * m}" class="gl"/>`).join('');
  const paths = ser.map((s) => { const d = path(s.v, W, h, min, max); return `${p.area ? `<path d="${d} L${W - 4},${h - 4} L4,${h - 4} Z" fill="${s.c}" opacity=".16"/>` : ''}<path d="${d}" fill="none" stroke="${s.c}" stroke-width="2" vector-effect="non-scaling-stroke"/>`; }).join('');
  const th = p.thresh != null ? (() => { const y = h - 4 - ((p.thresh - min) / (max - min)) * (h - 8); return `<line x1="0" x2="${W}" y1="${y}" y2="${y}" stroke="#ff4d4f" stroke-dasharray="6 4" stroke-width="1.2" vector-effect="non-scaling-stroke"/>`; })() : '';
  const leg = ser.length > 1 || ser[0].n ? `<div class="legend">${ser.map((s) => `<span><i style="background:${s.c}"></i>${s.n || ''}</span>`).join('')}</div>` : '';
  const xl = p.labels ? `<div class="xl">${p.labels.map((l) => `<span>${l}</span>`).join('')}</div>` : '';
  return `${leg}<svg viewBox="0 0 ${W} ${h}" preserveAspectRatio="none" class="chart" style="height:${h}px">${gl}${paths}${th}</svg>${xl}`;
}
function bars(p, h) {
  const items = p.items, n = items[0].v.length || 1, cols = p.colors || PAL;
  const tot = items.map((it) => (Array.isArray(it.v) ? it.v.reduce((a, b) => a + b, 0) : it.v)), max = Math.max(...tot) * 1.1, bw = 600 / items.length;
  const rects = items.map((it, i) => { let y = h; const vs = Array.isArray(it.v) ? it.v : [it.v]; return vs.map((v, k) => { const hh = (v / max) * (h - 6); y -= hh; return `<rect x="${i * bw + bw * 0.2}" y="${y}" width="${bw * 0.6}" height="${hh}" fill="${it.c || cols[k % cols.length]}" opacity="${0.55 + 0.45 * ((k + 1) / n)}"/>`; }).join(''); }).join('');
  const leg = p.stacked ? `<div class="legend">${p.stacked.map((s, k) => `<span><i style="background:${cols[k % cols.length]}"></i>${s}</span>`).join('')}</div>` : '';
  return `${leg}<svg viewBox="0 0 600 ${h}" preserveAspectRatio="none" class="chart" style="height:${h}px">${rects}</svg><div class="xl">${items.map((it) => `<span>${it.l}</span>`).join('')}</div>`;
}
function hbars(p) {
  const max = Math.max(...p.items.map((i) => i.v));
  return `<div class="hb">${p.items.map((i) => `<div class="hb-r"><span class="hb-l">${i.l}</span><span class="hb-t"><i style="width:${(i.v / max) * 100}%;background:${i.c || PAL[0]}"></i></span><b>${fmt(i.v)}${p.unit || ''}</b></div>`).join('')}</div>`;
}
function donut(p) {
  const tot = p.items.reduce((a, b) => a + b.v, 0); let a0 = -Math.PI / 2; const R = 46, r = 30;
  const arcs = p.items.map((it, i) => { const a1 = a0 + (it.v / tot) * Math.PI * 2; const L = a1 - a0 > Math.PI ? 1 : 0; const P = (a, rr) => `${60 + Math.cos(a) * rr},${60 + Math.sin(a) * rr}`; const d = `M${P(a0, R)} A${R},${R} 0 ${L} 1 ${P(a1, R)} L${P(a1, r)} A${r},${r} 0 ${L} 0 ${P(a0, r)} Z`; a0 = a1; return `<path d="${d}" fill="${it.c || PAL[i % 8]}"/>`; }).join('');
  return `<div class="donut"><svg viewBox="0 0 120 120">${arcs}<text x="60" y="60" class="dc">${p.center || ''}</text><text x="60" y="74" class="ds">${p.sub || ''}</text></svg><div class="legend col">${p.items.map((it, i) => `<span><i style="background:${it.c || PAL[i % 8]}"></i>${it.l}<b>${fmt(it.v)}</b></span>`).join('')}</div></div>`;
}
function gauge(p) {
  const max = p.max || 100, k = Math.min(1, p.v / max), a = Math.PI * (1 - k), unit = p.unit ?? '%';
  const good = p.good === 'low' ? k < 0.5 : k > 0.8; const c = good ? '#2ecc9a' : k > 0.5 ? '#f7931e' : '#ff4d4f';
  return `<svg viewBox="0 0 120 70" class="gauge"><path d="M10,62 A50,50 0 0 1 110,62" fill="none" stroke="#1d2c40" stroke-width="10"/><path d="M10,62 A50,50 0 0 1 ${60 + Math.cos(a) * 50},${62 - Math.sin(a) * 50}" fill="none" stroke="${c}" stroke-width="10"/><text x="60" y="58" class="gv">${p.v}${unit}</text></svg><div class="gl-l">${p.label || ''}</div>`;
}
function heat(p) {
  const r = lcg(p.seed || 1), sc = p.scale || 20;
  return `<table class="heat"><thead><tr><th></th>${p.cols.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${p.rows.map((row) => `<tr><td>${row}</td>${p.cols.map(() => { const v = Math.round(r() * r() * sc); return `<td style="background:rgba(0,188,235,${(0.08 + (v / sc) * 0.85).toFixed(2)})">${v}</td>`; }).join('')}</tr>`).join('')}</tbody></table>`;
}
function table(p) {
  const cell = (c) => { const m = /^!(\w+)\|(.*)$/.exec(c); return m ? `<span class="sev ${m[1]}">${m[2]}</span>` : c; };
  return `<table class="tbl"><thead><tr>${p.cols.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${p.rows.map((r) => `<tr>${r.map((c) => `<td>${cell(String(c))}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
const tiles = (p) => `<div class="tiles">${p.items.map((i) => `<div class="tile ${i.s}"><span>${i.n}</span><b>${i.v}</b></div>`).join('')}</div>`;
const feed = (p) => `<ul class="feed">${p.items.map((i) => `<li class="${i.k || ''}"><span class="ft">${i.t}</span><span class="fa">${i.a}</span><span class="fm">${i.m}</span></li>`).join('')}</ul>`;
const spl = (p) => `<pre class="spl"><code>${p.q.replace(/</g, '&lt;')}</code></pre>`;

function panel(p) {
  const h = p.h === 2 ? 190 : 110; let body = '';
  switch (p.type) {
    case 'kpi': body = kpi(p); break; case 'line': body = line(p, h); break; case 'bars': body = bars(p, h - 10); break;
    case 'hbars': body = hbars(p); break; case 'donut': body = donut(p); break; case 'gauge': body = gauge(p); break;
    case 'heat': body = heat(p); break; case 'table': body = table(p); break; case 'tiles': body = tiles(p); break;
    case 'feed': body = feed(p); break; case 'spl': body = spl(p); break;
  }
  return `<div class="panel ptype-${p.type}" style="--w:${p.w || 4}"><div class="pt">${p.t}</div>${body}</div>`;
}

export function renderDash(d, ownTag) {
  if (!d) return '';
  const brand = /Cisco|Meraki/.test(d.app) && !/Splunk/.test(d.app.split('+')[0]) ? '<span class="mini-cisco">cisco</span>' : '<span class="mini-splunk">splunk<b>&gt;</b></span>';
  return `<div class="dash">
    <div class="dash-bar"><div class="dash-brand">${brand}<span class="dash-app">${d.app}</span></div>
      <div class="dash-nav"><span class="on">Dashboards</span><span>Search</span><span>Findings</span><span>AI Assistant</span></div>
      <div class="dash-user">${d.persona}</div></div>
    <div class="dash-head"><div><h3>${d.title}</h3><div class="dash-filters">${d.filters.map((f) => `<span>${f}</span>`).join('')}</div></div>
      <div class="dash-tags">${ownTag}<div class="dash-tag">Illustrative data</div></div></div>
    <div class="dash-grid">${d.panels.map(panel).join('')}</div></div>`;
}
