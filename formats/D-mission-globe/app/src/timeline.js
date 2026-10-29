// The 4D timeline: one mission clock, two branches (traditional vs AgenticOps), a business KPI
// curve per branch, and event markers in five swim lanes. Time is in hours ('h') or minutes ('m')
// relative to T-0, the business moment.
import { gsap } from 'gsap';
import { LANES } from './content.js';

const noise = (x) => { const s = Math.sin(x * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

export class Timeline {
  scenario = null; t = 0; view = 'compare'; tween = null; listeners = new Set(); viewListeners = new Set();
  load(s) { this.stop(); this.scenario = s; this.t = s.range[0]; this.emit(); }
  onChange(fn) { this.listeners.add(fn); }
  onView(fn) { this.viewListeners.add(fn); }
  setView(v) { this.view = v; this.viewListeners.forEach((f) => f(v)); this.emit(); }
  emit() { this.listeners.forEach((f) => f(this.t)); }
  scrub(t) { if (!this.scenario) return; this.stop(); const [a, b] = this.scenario.range; this.t = Math.min(b, Math.max(a, t)); this.emit(); }
  playTo(t, dur) {
    this.stop();
    return new Promise((res) => {
      const o = { t: this.t };
      this.tween = gsap.to(o, { t, duration: Math.max(0.1, dur), ease: 'none', onUpdate: () => { this.t = o.t; this.emit(); }, onComplete: () => { this.tween = null; res(); }, onInterrupt: res });
    });
  }
  get playing() { return !!this.tween && this.tween.isActive(); }
  pause() { this.tween?.pause(); }
  resume() { this.tween?.resume(); }
  stop() { if (this.tween) { const tw = this.tween; this.tween = null; tw.kill(); tw.vars.onInterrupt?.(); } }
  // KPI health 0..100 (100 = normal). Traditional: dips by tradDip after T-0 until tradRecover.
  // AgenticOps: a small dip of agentDip while the agent acts, then a slight improvement.
  metric(branch, t) {
    const s = this.scenario, jitter = (noise(Math.floor(t * 4)) - 0.5) * 1.6;
    if (branch === 'traditional') {
      const fall = s.impact + Math.max((s.tradRecover - s.impact) * 0.08, 0.01), mid = s.tradDetect + (s.tradRecover - s.tradDetect) * 0.45;
      let dip = 0;
      if (t >= s.impact && t < fall) dip = smooth(s.impact, fall, t); else if (t >= fall && t < mid) dip = 1; else if (t >= mid && t < s.tradRecover) dip = 1 - smooth(mid, s.tradRecover, t);
      return 100 - smooth(s.agentDetect, s.impact, t) * 4 * (t < s.impact) - dip * s.tradDip * 100 + jitter;
    }
    const c = (s.agentDetect + s.agentRemediate) / 2, half = Math.max(0.01, (s.agentRemediate - s.agentDetect) / 2), tri = Math.max(0, 1 - Math.abs(t - c) / half);
    const pre = t < s.agentDetect ? smooth(s.agentDetect - (s.agentDetect - s.range[0]) * 0.5, s.agentDetect, t) * 3 : 0;
    const post = t > s.agentRemediate ? smooth(s.agentRemediate, s.range[1], t) * 2 : 0;
    return 100 - pre - tri * s.agentDip * 100 + post + jitter * 0.6;
  }
  forecast(t) { return t < this.scenario.agentDetect ? null : this.metric('traditional', t); }
  siteState(branch, t) {
    const s = this.scenario;
    if (branch === 'traditional') return t < s.agentDetect ? 'idle' : t < s.impact ? 'signal' : t < s.tradDetect + (s.tradRecover - s.tradDetect) * 0.6 ? 'critical' : t < s.tradRecover ? 'recovering' : 'idle';
    return t < s.agentDetect ? 'idle' : t < s.agentRemediate ? 'warning' : 'protected';
  }
  events(branch, t) { return this.scenario.events.filter((e) => e.branch === branch && e.t <= t).sort((a, b) => a.t - b.t); }
  exposureAt(t) { const s = this.scenario; return s.exposure * smooth(s.impact, s.tradRecover, t); }
  format(t) {
    const s = this.scenario; if (!s) return 'T-00h 00m';
    const mins = s.unit === 'h' ? t * 60 : t, sign = mins < 0 ? '-' : '+', a = Math.abs(Math.round(mins));
    return `T${sign}${String(Math.floor(a / 60)).padStart(2, '0')}h ${String(a % 60).padStart(2, '0')}m`;
  }
  formatLead() { const s = this.scenario, d = s.impact - s.agentDetect; return s.unit === 'h' ? `${d} hours` : `${d} minutes`; }
}

export const laneOf = (src) =>
  /XDR|SOAR|Email Security|SOC|Security Agent|Incident response|Duo|Firewall/i.test(src) ? 'xdr'
  : /Agent|AI Canvas|Cloud Control/i.test(src) ? 'cc'
  : /Data Fabric|Splunk|Monitoring|Siloed|Scheduler|Market data|File servers|Employee portal|Policy admin/i.test(src) ? 'splunk'
  : /ThousandEyes|Network|SD-WAN|Nexus|NOC|site|Facilities|Engineering/i.test(src) ? 'te' : 'biz';

const COL = { trad: '#ff4d5e', agent: '#6ff09a', forecast: '#ffc14d', grid: 'rgba(120,170,255,0.10)', text: 'rgba(200,220,255,0.72)', lead: 'rgba(63,182,255,0.10)', outage: 'rgba(255,77,94,0.10)' };
const step = (x) => [1, 2, 4, 6, 8, 10, 12, 15, 20, 24, 30, 48, 60].find((s) => s >= x) ?? 60;

// Canvas chart: KPI band on top (40% of height), five swim lanes below, a draggable playhead.
export class TimelineChart {
  pad = { l: 132, r: 12, t: 14, b: 15 }; hits = []; hoverE = null; dragging = false;
  onScrub = () => {}; onEvent = () => {}; onHover = () => {};
  constructor(canvas, tl) {
    this.canvas = canvas; this.tl = tl; this.ctx = canvas.getContext('2d');
    new ResizeObserver(() => this.draw()).observe(canvas);
    canvas.addEventListener('pointerdown', (e) => {
      if (!this.tl.scenario) return;
      const h = this.hitAt(e.offsetX, e.offsetY);
      if (h) this.onEvent(h.e); else if (e.offsetX >= this.pad.l - 4) { this.dragging = true; canvas.setPointerCapture(e.pointerId); this.onScrub(this.xToT(e.offsetX)); }
    });
    canvas.addEventListener('pointermove', (e) => {
      if (this.dragging) return this.onScrub(this.xToT(e.offsetX));
      const h = this.tl.scenario ? this.hitAt(e.offsetX, e.offsetY) : null;
      canvas.style.cursor = h ? 'pointer' : e.offsetX > this.pad.l ? 'ew-resize' : 'default';
      if ((h?.e ?? null) !== this.hoverE) { this.hoverE = h?.e ?? null; const r = canvas.getBoundingClientRect(); this.onHover(this.hoverE, r.left + (h?.x ?? 0), r.top + (h?.y ?? 0)); this.draw(); }
    });
    canvas.addEventListener('pointerleave', () => { if (this.hoverE) { this.hoverE = null; this.onHover(null, 0, 0); this.draw(); } });
    canvas.addEventListener('pointerup', () => (this.dragging = false));
    canvas.addEventListener('pointercancel', () => (this.dragging = false));
  }
  hitAt(x, y) { let best = null, d0 = 64; for (const h of this.hits) { const d = (h.x - x) ** 2 + (h.y - y) ** 2; if (d < d0) { d0 = d; best = h; } } return best; }
  get w() { return this.canvas.clientWidth; }
  get h() { return this.canvas.clientHeight; }
  get metricBottom() { return Math.round(this.pad.t + (this.h - this.pad.t - this.pad.b) * 0.4); }
  get laneTop() { return this.metricBottom + 5; }
  get laneH() { return (this.h - this.pad.b - this.laneTop) / LANES.length; }
  tToX(t) { const [a, b] = this.tl.scenario.range; return this.pad.l + (t - a) / (b - a) * (this.w - this.pad.l - this.pad.r); }
  xToT(x) { const [a, b] = this.tl.scenario.range; return a + Math.min(1, Math.max(0, (x - this.pad.l) / (this.w - this.pad.l - this.pad.r))) * (b - a); }
  vToY(v) { return this.pad.t + (1 - v / 110) * (this.metricBottom - this.pad.t); }
  draw() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2), W = this.w, H = this.h;
    if (this.canvas.width !== Math.round(W * dpr) || this.canvas.height !== Math.round(H * dpr)) { this.canvas.width = Math.round(W * dpr); this.canvas.height = Math.round(H * dpr); }
    const g = this.ctx; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H); this.hits = [];
    const s = this.tl.scenario; if (!s || W < 10) return;
    const [a, b] = s.range, now = this.tl.t, view = this.tl.view, showT = view !== 'agentic', showA = view !== 'traditional', mb = this.metricBottom, bottom = H - this.pad.b;
    g.font = '10.5px Inter, system-ui, sans-serif'; g.textBaseline = 'middle';
    if (showA && now >= s.agentDetect) { g.fillStyle = COL.lead; g.fillRect(this.tToX(s.agentDetect), this.pad.t, this.tToX(Math.min(now, s.impact)) - this.tToX(s.agentDetect), bottom - this.pad.t); }
    if (showT && now >= s.impact) { g.fillStyle = COL.outage; g.fillRect(this.tToX(s.impact), this.pad.t, this.tToX(Math.min(now, s.tradRecover)) - this.tToX(s.impact), bottom - this.pad.t); }
    g.fillStyle = COL.text; g.textAlign = 'left'; g.font = '600 10px Inter, system-ui, sans-serif'; g.fillText('BUSINESS KPI', 10, this.pad.t + 2);
    g.font = '9.5px Inter, system-ui, sans-serif'; g.fillStyle = 'rgba(200,220,255,0.5)';
    const name = s.metricName.length > 22 ? `${s.metricName.slice(0, 21)}…` : s.metricName;
    if (mb - this.pad.t > 24) g.fillText(name, 10, this.pad.t + 15);
    g.strokeStyle = COL.grid; g.lineWidth = 1;
    for (const v of [0, 50, 100]) { const y = this.vToY(v); g.beginPath(); g.moveTo(this.pad.l, y); g.lineTo(W - this.pad.r, y); g.stroke(); g.textAlign = 'right'; g.fillStyle = COL.text; g.fillText(String(v), this.pad.l - 6, y); }
    const st = step((b - a) / 10); g.textAlign = 'center';
    for (let t = Math.ceil(a / st) * st; t <= b; t += st) { const x = this.tToX(t); g.beginPath(); g.moveTo(x, this.pad.t); g.lineTo(x, bottom); g.stroke(); g.fillStyle = COL.text; g.fillText(`${t > 0 ? '+' : ''}${t}${s.unit}`, x, bottom + 10); }
    const lh = this.laneH;
    LANES.forEach((lane, i) => {
      const y = this.laneTop + i * lh;
      g.fillStyle = i % 2 ? 'rgba(255,255,255,0.018)' : 'rgba(255,255,255,0.035)'; g.fillRect(this.pad.l, y, W - this.pad.l - this.pad.r, lh - 1);
      g.fillStyle = lane.color; g.beginPath(); g.arc(14, y + lh / 2, 3.2, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(220,232,255,0.82)'; g.textAlign = 'left'; g.font = `${Math.min(10.5, Math.max(8.5, lh - 2))}px Inter, system-ui, sans-serif`; g.fillText(lane.label, 24, y + lh / 2);
    });
    const x0 = this.tToX(s.impact);
    g.strokeStyle = 'rgba(255,255,255,0.45)'; g.setLineDash([3, 4]); g.beginPath(); g.moveTo(x0, this.pad.t - 6); g.lineTo(x0, bottom); g.stroke(); g.setLineDash([]);
    g.fillStyle = 'rgba(255,255,255,0.8)'; g.textAlign = 'left'; g.fillText('T-0  business moment', x0 + 6, this.pad.t - 8);
    const curve = (fn, color, width, dash = [], blur = 0) => {
      g.save(); g.strokeStyle = color; g.lineWidth = width; g.setLineDash(dash); g.shadowColor = color; g.shadowBlur = blur; g.beginPath();
      let on = false; const end = Math.min(now, b);
      for (let i = 0; i <= 260; i++) { const t = a + (i / 260) * (b - a); if (t > end) break; const v = fn(t); if (v === null) { on = false; continue; } const x = this.tToX(t), y = this.vToY(v); on ? g.lineTo(x, y) : (g.moveTo(x, y), (on = true)); }
      g.stroke(); g.restore();
    };
    if (view === 'agentic') curve((t) => this.tl.forecast(t), COL.forecast, 1.4, [4, 4]);
    if (showT) curve((t) => this.tl.metric('traditional', t), COL.trad, view === 'compare' ? 1.8 : 2.4, [], 8);
    if (showA) curve((t) => this.tl.metric('agentic', t), COL.agent, view === 'compare' ? 1.8 : 2.4, [], 8);
    for (const e of s.events) {
      if ((e.branch === 'traditional' && !showT) || (e.branch === 'agentic' && !showA)) continue;
      const li = LANES.findIndex((l) => l.id === laneOf(e.source)), y = this.laneTop + li * lh + lh / 2 + (view === 'compare' ? (e.branch === 'agentic' ? -lh * 0.2 : lh * 0.2) : 0);
      const x = this.tToX(e.t), past = e.t <= now, col = e.branch === 'agentic' ? COL.agent : COL.trad, hov = this.hoverE === e, r = hov ? 6 : 4.2;
      g.save(); g.fillStyle = past ? col : 'rgba(255,255,255,0.16)'; if (past) { g.shadowColor = col; g.shadowBlur = hov ? 14 : 6; }
      g.beginPath();
      if (e.branch === 'agentic') { g.moveTo(x, y - r); g.lineTo(x + r, y); g.lineTo(x, y + r); g.lineTo(x - r, y); g.closePath(); } else g.arc(x, y, r * 0.85, 0, Math.PI * 2);
      g.fill(); if (e.sev === 'crit' && past) { g.strokeStyle = '#fff'; g.lineWidth = 1; g.stroke(); } g.restore();
      this.hits.push({ e, x, y });
    }
    const px = this.tToX(now);
    g.strokeStyle = '#ffffff'; g.lineWidth = 1.5; g.shadowColor = '#7fe7ff'; g.shadowBlur = 10; g.beginPath(); g.moveTo(px, this.pad.t - 4); g.lineTo(px, bottom); g.stroke();
    g.shadowBlur = 0; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(px, mb, 3.5, 0, Math.PI * 2); g.fill();
    if (showA && now >= s.agentDetect) { g.fillStyle = '#7fe7ff'; g.textAlign = 'left'; g.fillText(`Agent lead time: ${this.tl.formatLead()}`, this.tToX(s.agentDetect) + 6, mb - 8); }
  }
}
