// Stage windows: floating product "screens" that dock into slots around the globe and draw a
// curved leader line to the site (or building floor) they describe. Each panel is a small class
// with el, title, status, product and update(ctx) / beat(n) hooks.
import { esc, SITES, SITE, FABRIC_SOURCES, FABRIC_ACTIONS, CUSTOMER } from './content.js';

export const PRODUCTS = {
  splunk: { name: 'Splunk', cls: 'p-splunk' }, te: { name: 'ThousandEyes', cls: 'p-te' }, cc: { name: 'Cisco Cloud Control', cls: 'p-cc' },
  xdr: { name: 'Cisco XDR', cls: 'p-xdr' }, nexus: { name: 'Nexus Dashboard', cls: 'p-nexus' }, webex: { name: 'Webex', cls: 'p-webex' },
  customer: { name: CUSTOMER, cls: 'p-customer' }, trad: { name: 'Traditional operations', cls: 'p-trad' }, fabric: { name: 'Cisco Data Fabric', cls: 'p-fabric' },
  assistant: { name: 'Cisco AI Assistant', cls: 'p-assistant' },
};
const SLOTS = ['nw', 'ne', 'sw', 'se', 'w', 'e', 'center', 'n', 's', 'mid'];
// Opening a window in a slot closes windows in overlapping slots.
const CONFLICTS = { nw: ['w', 'n', 'center', 'mid'], ne: ['e', 'n', 'center', 'mid'], sw: ['w', 's', 'center', 'mid'], se: ['e', 's', 'center', 'mid'], w: ['nw', 'sw', 'n', 's', 'center', 'mid'], e: ['ne', 'se', 'n', 's', 'center', 'mid'], n: ['nw', 'ne', 'w', 'e', 'center', 'mid'], s: ['sw', 'se', 'w', 'e', 'center', 'mid'], center: SLOTS, mid: SLOTS };

const lerp = (a, b, t) => a + (b - a) * t, clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const sev = (h) => (h > 0.66 ? 'crit' : h > 0.4 ? 'high' : h > 0.18 ? 'med' : 'ok');
function fmtKpi(k, v) {
  const dec = k.dec ?? +(Math.abs(v) < 10 && !Number.isInteger(k.good)), s = Math.abs(v) >= 1000 ? Math.round(v).toLocaleString() : v.toFixed(dec);
  return `${v > 0 && (k.unit === 'pts' || (k.name.includes('vs') && k.unit === '%') || k.name.includes('change')) ? '+' : ''}${s}`;
}
function spark(vals, w = 120, h = 28, lo, hi) {
  if (vals.length < 2) return '';
  const a = lo ?? Math.min(...vals), r = (hi ?? Math.max(...vals)) - a || 1;
  return vals.map((v, i) => `${((i / (vals.length - 1)) * w).toFixed(1)},${(h - ((v - a) / r) * (h - 4) - 2).toFixed(1)}`).join(' ');
}
export function typeInto(el, text, cps = 55) {
  return new Promise((res) => {
    let i = 0; el.textContent = '';
    const tick = () => { if (!el.isConnected) return res(); i = Math.min(text.length, i + Math.max(1, Math.round(cps / 30))); el.textContent = text.slice(0, i); i < text.length ? setTimeout(tick, 33) : res(); };
    tick();
  });
}

class Panel { el = document.createElement('div'); status = 'Live'; update() {} beat() {} destroy() {} }

// Splunk ITSI: service health ring, predicted health, KPI sparklines, adaptive-threshold chart, service tree.
export class SplunkPanel extends Panel {
  id = 'splunk'; product = 'splunk'; status = 'Live · adaptive thresholds'; last = 0; series = [];
  constructor(v) {
    super(); this.v = v; this.title = `IT Service Intelligence · ${v.service}`; this.hist = v.kpis.map(() => []); this.el.className = 'pnl splunk';
    this.el.innerHTML = `
      <div class="sp-top"><div class="sp-score"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="27" class="trk"/><circle cx="32" cy="32" r="27" class="val"/></svg><b>100</b><label>Service health</label></div>
        <div class="sp-pred"><label>Predicted ahead</label><b>100</b><small>ITSI predictive analytics</small></div><div class="sp-episode">No active episodes</div></div>
      <div class="sp-kpis">${v.kpis.map((k, i) => `<div class="sp-kpi" data-i="${i}"><label>${esc(k.name)}</label><div><b>${fmtKpi(k, k.good)}</b><em>${esc(k.unit)}</em></div><svg viewBox="0 0 120 28" preserveAspectRatio="none"><polyline points=""/></svg></div>`).join('')}</div>
      <div class="sp-chart"><div class="sp-chart-h">${esc(v.kpis[0].name)} with adaptive threshold</div><svg viewBox="0 0 300 70" preserveAspectRatio="none"><path class="band"/><polyline class="line" points=""/></svg></div>
      <div class="sp-tree">${v.tree.map((n, i) => `<div class="sp-node ${i === 0 ? 'root' : ''}" data-i="${i}"><i></i><span>${esc(n)}</span></div>`).join('')}</div>`;
  }
  update(c) {
    const q = (s) => this.el.querySelector(s), health = Math.round(100 - c.h * 72), pred = Math.round(100 - c.hPred * 72);
    q('.sp-score b').textContent = String(health); q('.sp-score .val').style.strokeDashoffset = String(170 * (1 - health / 100));
    this.el.dataset.sev = sev(c.h); q('.sp-pred b').textContent = String(pred); q('.sp-pred').dataset.sev = sev(c.hPred);
    const ep = q('.sp-episode');
    if (c.state === 'protected') { ep.textContent = 'Episode resolved by agent action. Service healthy.'; ep.dataset.sev = 'good'; }
    else if (c.h > 0.5) { ep.textContent = `Critical episode: ${12 + Math.round(c.h * 60)} correlated notable events`; ep.dataset.sev = 'crit'; }
    else if (c.hPred > 0.35) { ep.textContent = 'Episode: predicted service degradation within 30 minutes'; ep.dataset.sev = 'high'; }
    else { ep.textContent = 'No active episodes'; ep.dataset.sev = 'ok'; }
    const now = performance.now(), tick = now - this.last > 140; if (tick) this.last = now;
    this.v.kpis.forEach((k, i) => {
      const val = lerp(k.good, k.bad, clamp(c.h + (Math.random() - 0.5) * 0.04 * (c.h > 0.05 ? 1 : 0.3))), row = q(`.sp-kpi[data-i="${i}"]`);
      row.querySelector('b').textContent = fmtKpi(k, val); row.dataset.sev = sev(c.h);
      if (tick) { this.hist[i].push(val); if (this.hist[i].length > 40) this.hist[i].shift(); row.querySelector('polyline').setAttribute('points', spark(this.hist[i], 120, 28, Math.min(k.good, k.bad), Math.max(k.good, k.bad))); }
    });
    if (tick) {
      const k = this.v.kpis[0]; this.series.push(lerp(k.good, k.bad, clamp(c.h + (Math.random() - 0.5) * 0.03))); if (this.series.length > 70) this.series.shift();
      const lo = Math.min(k.good, k.bad), hi = Math.max(k.good, k.bad);
      q('.sp-chart .line').setAttribute('points', spark(this.series, 300, 70, lo, hi));
      const y1 = 70 - ((lerp(k.good, k.bad, 0.12) - lo) / (hi - lo || 1)) * 66 - 2, y2 = 70 - ((lerp(k.good, k.bad, -0.06) - lo) / (hi - lo || 1)) * 66 - 2, [a, b] = k.bad > k.good ? [y1, y2] : [y2, y1];
      q('.sp-chart .band').setAttribute('d', `M0,${a} L300,${a} L300,${b} L0,${b} Z`);
    }
    this.el.querySelectorAll('.sp-node').forEach((n, i) => {
      const root = i === this.v.rootNode, h = i === 0 ? c.h : root ? Math.max(c.h, c.hPred * 0.9) : c.h * (0.3 + ((i * 37) % 5) / 10);
      n.dataset.sev = sev(h); n.classList.toggle('cause', root && (c.h > 0.2 || c.hPred > 0.3) && c.state !== 'protected');
    });
  }
}

// ThousandEyes-style path visualization (or Nexus / XDR path) with the bad hop and the alternate path.
const GLYPH = { user: 'U', agent: 'TE', switch: 'SW', edge: 'E', isp: 'ISP', carrier: 'CO', cloud: 'C', dc: 'DC', app: 'APP', saas: 'SaaS', db: 'DB' };
export class PathPanel extends Panel {
  id = 'path'; status = 'Path trace · 1 min interval';
  constructor(v) {
    super(); this.v = v; const p = v.path, src = p.source;
    this.product = src === 'ThousandEyes' ? 'te' : src === 'Nexus Dashboard' ? 'nexus' : src === 'Cisco XDR' ? 'xdr' : 'splunk';
    this.title = src === 'ThousandEyes' ? `Path Visualization · ${p.title}` : p.title;
    if (src !== 'ThousandEyes') this.status = src === 'Cisco XDR' ? 'Attack path' : 'Live';
    const n = p.hops.length, xs = p.hops.map((_, i) => 38 + (i * 424) / (n - 1)), bad = p.bad, bx = xs[bad];
    const links = xs.slice(0, -1).map((x, i) => `<path class="lk ${i === bad - 1 || i === bad ? 'near-bad' : ''} ${i === bad - 1 ? 'into-bad' : ''}" d="M${x + 16},58 L${xs[i + 1] - 16},58"/>`).join('');
    const alt = `<path class="lk alt" d="M${xs[bad - 1] + 14},66 Q${bx - 30},128 ${bx - 18},128"/><path class="lk alt" d="M${bx + 18},128 Q${bx + 30},128 ${xs[bad + 1] - 14},66"/>`;
    const node = (h, x, y, cls) => `<g class="nd ${cls}" transform="translate(${x},${y})"><circle r="16"/><text class="g" dy="4">${GLYPH[h.kind] ?? '•'}</text><text class="t" dy="34">${esc(h.name)}</text><text class="s" dy="47">${esc(h.sub ?? '')}</text></g>`;
    this.el.className = 'pnl path';
    this.el.innerHTML = `<div class="pt-metrics"><div><label>Loss</label><b class="m-loss">0.0%</b></div><div><label>Latency</label><b class="m-lat">24 ms</b></div><div><label>Jitter</label><b class="m-jit">2 ms</b></div><div class="pt-verdict"></div></div>
      <svg viewBox="0 0 500 190" class="pt-svg">${links}${alt}${p.hops.map((h, i) => node(h, xs[i], 58, i === bad ? 'bad' : '')).join('')}${node(p.alt, bx, 128, 'altn')}
      <g class="bad-tag" transform="translate(${(xs[bad - 1] + xs[bad]) / 2},32)"><rect x="-92" y="-12" width="184" height="20" rx="6"/><text dy="3">${esc(p.badMetric)}</text></g></svg>`;
  }
  update(c) {
    const fixed = c.state === 'protected' && c.branch === 'agentic', bad = !fixed && (c.h > 0.12 || c.hPred > 0.3);
    this.el.dataset.mode = fixed ? 'fixed' : bad ? 'bad' : 'ok';
    const k = fixed ? 0.02 : Math.max(c.h, c.hPred * 0.7), q = (s) => this.el.querySelector(s);
    q('.m-loss').textContent = `${(k * 9).toFixed(1)}%`; q('.m-lat').textContent = `${Math.round(24 + k * 180)} ms`; q('.m-jit').textContent = `${Math.round(2 + k * 46)} ms`;
    q('.pt-verdict').textContent = fixed ? `Validated: ${this.v.path.goodMetric}` : bad ? 'Degradation detected' : 'Path healthy';
    this.status = fixed ? 'Validated after change' : bad ? 'Alerting' : 'Path trace · 1 min interval';
  }
}

// AI Canvas: typed prompt, multi-agent plan, generated forecast widget, sourced root cause, proposed
// action with Approve / Revise / Reject, the decision options ("Your call"), and a reasoning trail.
export class CanvasPanel extends Panel {
  id = 'canvas'; product = 'cc'; status = 'Deep Reasoning'; stage = -1; timers = []; onApprove = () => {}; onPick = () => {};
  constructor(v, m) {
    super(); this.v = v; this.title = `AI Canvas · ${m.title}`; this.el.className = 'pnl canvas'; const c = v.canvas;
    this.el.innerHTML = `
      <div class="cv-top"><div class="cv-prompt"><span class="cv-ic">✦</span><span class="cv-text"></span><span class="cv-caret"></span></div>
        <div class="cv-mode"><span class="on">Deep Reasoning</span><span>Default</span></div>
        <div class="cv-presence"><b title="${CUSTOMER} operator">OP</b><b class="ag" title="Monitoring agent">MA</b><b class="ag" title="Diagnostic agent">DA</b><b class="ag" title="Remediation agent">RA</b><b class="ag" title="Learning agent">LA</b></div></div>
      <div class="cv-grid">
        <div class="cv-card plan"><h5>Investigation plan <em>${c.plan.length} agents in parallel</em></h5>${c.plan.map((p, i) => `<div class="cv-step" data-i="${i}"><i class="st"></i><span class="ag">${esc(p.agent)}</span><span class="tk">${esc(p.task)}</span><span class="src">${esc(p.source)}</span></div>`).join('')}</div>
        <div class="cv-card widget"><h5>Generated widget <em>${esc(v.kpis[0].name)}</em></h5><svg viewBox="0 0 220 80" preserveAspectRatio="none"><path class="fc-band" d=""/><polyline class="hist" points=""/><polyline class="fc" points=""/><line class="now" x1="120" x2="120" y1="0" y2="80"/></svg></div>
        <div class="cv-card finding"><h5>Root cause <em>sourced answer</em></h5><p>${esc(c.finding.title)}</p><ul>${c.finding.evidence.map((e) => `<li>${esc(e)}</li>`).join('')}</ul></div>
        <div class="cv-card action"><h5>Proposed action <em>${esc(c.action.policy)}</em></h5><p class="cv-at">${esc(c.action.title)}</p><ol>${c.action.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
          <div class="cv-approve"><button class="cv-btn ok" data-a="approve">Approve</button><button class="cv-btn ghost" data-a="revise">Revise</button><button class="cv-btn ghost" data-a="reject">Reject</button></div>
          <div class="cv-decision"></div><div class="cv-result"></div></div>
        <div class="cv-card trail"><h5>Reasoning trail <em>Splunk AI Agent Monitoring</em></h5><div class="cv-trail"></div></div>
      </div>`;
    this.el.querySelector('[data-a="approve"]').addEventListener('click', () => this.onApprove());
    this.el.querySelector('[data-a="revise"]').addEventListener('click', () => this.note('Plan sent back to the agent with your notes.'));
    this.el.querySelector('[data-a="reject"]').addEventListener('click', () => this.note('Rejected. The agent will keep monitoring and escalate if the forecast worsens.'));
    this.drawWidget(0.45);
  }
  note(t) { const r = this.el.querySelector('.cv-result'); r.textContent = t; r.className = 'cv-result note'; }
  drawWidget(k) {
    const kp = this.v.kpis[0], hist = [];
    for (let i = 0; i <= 12; i++) hist.push(lerp(kp.good, kp.bad, 0.05 + Math.sin(i * 1.3) * 0.02 + (i / 12) * k * 0.4));
    const fc = [hist[12]]; for (let i = 1; i <= 8; i++) fc.push(lerp(hist[12], lerp(kp.good, kp.bad, k), i / 8));
    const lo = Math.min(kp.good, kp.bad), hi = Math.max(kp.good, kp.bad), y = (v) => 76 - ((v - lo) / (hi - lo || 1)) * 70;
    this.el.querySelector('.hist').setAttribute('points', hist.map((v, i) => `${i * 10},${y(v).toFixed(1)}`).join(' '));
    this.el.querySelector('.fc').setAttribute('points', fc.map((v, i) => `${120 + i * 12.5},${y(v).toFixed(1)}`).join(' '));
    const up = fc.map((v, i) => `${120 + i * 12.5},${(y(v) - i * 2.2).toFixed(1)}`), dn = fc.map((v, i) => `${120 + i * 12.5},${(y(v) + i * 2.2).toFixed(1)}`).reverse();
    this.el.querySelector('.fc-band').setAttribute('d', `M${up.join(' L')} L${dn.join(' L')} Z`);
  }
  trail(text, ms) {
    const box = this.el.querySelector('.cv-trail'), r = document.createElement('div'); r.className = 'cv-tr'; r.innerHTML = `<span>${esc(text)}</span><em>${ms} ms</em>`;
    box.appendChild(r); while (box.children.length > 6) box.firstElementChild?.remove();
  }
  later(ms, fn) { this.timers.push(window.setTimeout(() => this.el.isConnected && fn(), ms)); }
  beat(n) { while (this.stage < n) { this.stage++; this.reveal(this.stage); } }
  reveal(n) {
    this.el.dataset.stage = String(n); const c = this.v.canvas, q = (s) => this.el.querySelector(s);
    if (n === 0) { typeInto(q('.cv-text'), c.prompt, 70); this.trail('Intent parsed: cross-domain investigation', 180); }
    else if (n === 1) { q('.plan').classList.add('show'); this.trail(`Plan generated: ${c.plan.length} steps`, 640); }
    else if (n === 2) this.el.querySelectorAll('.cv-step').forEach((s, i) => { s.classList.add('run'); this.later(500 + i * 520, () => { s.classList.remove('run'); s.classList.add('done'); this.trail(`Tool call: ${c.plan[i].source}`, 220 + ((i * 173) % 400)); }); });
    else if (n === 3) { q('.widget').classList.add('show'); this.later(500, () => q('.finding').classList.add('show')); this.trail('Model: Deep Network Model + frontier LLM', 1220); this.el.querySelectorAll('.cv-step').forEach((s) => s.classList.add('done')); }
    else if (n === 4) { q('.action').classList.add('show'); this.trail(`Policy check: ${c.action.policy.split(':')[0]}`, 90); }
    else if (n === 5) { q('.action').classList.add('approved'); const r = q('.cv-result'); r.className = 'cv-result ok'; r.textContent = 'Approved by operator. Remediation agent executing under policy.'; this.trail('Human approval recorded', 40); this.status = 'Executing'; }
    else if (n === 6) { const r = q('.cv-result'); r.className = 'cv-result ok done'; r.textContent = `Validated: ${c.action.validation}`; this.drawWidget(0.02); this.trail('ThousandEyes validation passed', 860); this.status = 'Resolved'; }
  }
  setDecision(opts, picked) {
    const box = this.el.querySelector('.cv-decision'); this.el.classList.add('deciding');
    box.innerHTML = `<label>Your call</label>${opts.map((o, i) => `<button class="cv-opt ${picked === i ? o.quality : ''}" data-i="${i}" ${picked === null ? '' : 'disabled'}><b>${esc(o.label)}</b><span>${esc(o.detail)}</span></button>`).join('')}`;
    box.querySelectorAll('.cv-opt').forEach((b) => b.addEventListener('click', () => this.onPick(Number(b.dataset.i))));
    this.later(400, () => { const body = this.el.closest('.win-body'); if (body) body.scrollTop = body.scrollHeight; });
  }
  update(c) { if (c.branch === 'agentic') { if (c.state === 'protected') this.beat(6); else if (c.state === 'warning') this.beat(2); } }
  destroy() { this.timers.forEach(clearTimeout); }
}

// Cisco AI Assistant: natural-language question, generated SPL2, result table, follow-up chips.
export class AssistantPanel extends Panel {
  id = 'assistant'; product = 'assistant'; title = 'Ask across every domain'; status = 'Agent mode'; stage = -1; busy = false; onCanvas = () => {};
  constructor(v, m) {
    super(); this.v = v; this.m = m; this.el.className = 'pnl assistant';
    this.el.innerHTML = '<div class="as-log"></div><div class="as-chips"></div><form class="as-input"><input placeholder="Ask about this mission, for example: what is the business impact?" /><button>Ask</button></form>';
    this.log = this.el.querySelector('.as-log');
    this.el.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); const i = this.el.querySelector('input'), t = i.value.trim(); if (t) { i.value = ''; this.ask(t, this.answerFor(t)); } });
  }
  answerFor(q) {
    const words = q.toLowerCase().split(/\W+/).filter((w) => w.length > 3); let best = null, score = 0;
    for (const f of this.v.assistant.followups) { const n = words.filter((w) => f.q.toLowerCase().includes(w) || f.a.toLowerCase().includes(w)).length; if (n > score) { score = n; best = f; } }
    if (best && score > 0) return best.a;
    if (/impact|cost|revenue|business|money/i.test(q)) return `Modeled exposure if nobody acts: about $${(this.m.exposure / 1e6).toFixed(1)}M. ${this.m.exposureBasis}`;
    if (/site|where|location|blast/i.test(q)) return `The blast radius reaches ${this.m.blast.map((b) => SITE[b]?.city ?? b).join(', ')}.`;
    return `Here is what I found across ${this.m.signals.slice(0, 3).join(', ')}: ${this.v.assistant.a}`;
  }
  bubble(kind, html) { const d = document.createElement('div'); d.className = `as-msg ${kind}`; d.innerHTML = html; this.log.appendChild(d); this.log.scrollTop = this.log.scrollHeight; return d; }
  async ask(q, a, extra = '') {
    if (this.busy) return; this.busy = true;
    await typeInto(this.bubble('user', '<span></span>').querySelector('span'), q, 90);
    const th = this.bubble('bot thinking', `<span class="dots"><i></i><i></i><i></i></span> Reasoning across ${this.m.signals.slice(0, 3).map(esc).join(', ')}`);
    await new Promise((r) => setTimeout(r, 900)); th.remove();
    const b = this.bubble('bot', `<span class="ans"></span>${extra}`); await typeInto(b.querySelector('.ans'), a, 160); b.classList.add('done');
    this.log.scrollTop = this.log.scrollHeight; if (/AI Canvas/i.test(a)) this.onCanvas(); this.busy = false;
  }
  beat(n) {
    while (this.stage < n) {
      this.stage++;
      if (this.stage === 0) { const a = this.v.assistant; this.ask(a.q, a.a, `<details class="as-spl" open><summary>Generated SPL2 · federated search</summary><pre>${esc(a.spl)}</pre></details><table class="as-tbl">${a.rows.map((r) => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')}</table>`); }
      else this.chips();
    }
  }
  chips() {
    const box = this.el.querySelector('.as-chips'); if (box.childElementCount) return;
    box.innerHTML = this.v.assistant.followups.map((f, i) => `<button data-i="${i}">${esc(f.q)}</button>`).join('');
    box.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { const f = this.v.assistant.followups[Number(b.dataset.i)]; b.disabled = true; this.ask(f.q, f.a); }));
  }
}

// Traditional path: alert storm, ticket counters, P1 bridge with teams joining, root cause found late.
export class StormPanel extends Panel {
  id = 'storm'; product = 'trad'; title = '12 tools, 6 teams, 1 bridge call'; status = 'P1 open'; lastAdd = 0; k = 0;
  constructor(v, m) {
    super(); this.v = v; this.m = m; this.el.className = 'pnl storm';
    const moods = ['Investigating', 'Checking logs', 'Not our domain', 'Waiting on vendor', 'Rebooting', 'Joining bridge'];
    this.el.innerHTML = `<div class="st-counters"><div><b class="c-al">0</b><label>Alerts</label></div><div><b class="c-tk">0</b><label>Tickets</label></div><div><b class="c-tm">0</b><label>Teams on bridge</label></div><div><b class="c-br">00:00</b><label>Bridge time</label></div></div>
      <div class="st-body"><div class="st-list"></div><div class="st-bridge"><h5>P1 bridge</h5>${v.teams.map((t, i) => `<div class="st-team" data-i="${i}"><b>${esc(t.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase())}</b><span>${esc(t)}</span><em>${moods[i % moods.length]}</em></div>`).join('')}<div class="st-rc">Root cause: <b>unknown</b></div></div></div>`;
    this.list = this.el.querySelector('.st-list');
  }
  update(c) {
    const s = this.m, trad = c.branch === 'traditional', live = trad && c.t >= s.impact, k = live ? clamp((c.t - s.impact) / (s.tradRecover - s.impact || 1)) : 0, q = (x) => this.el.querySelector(x);
    this.el.dataset.active = String(live);
    q('.c-al').textContent = live ? Math.round(40 + k * 1400 + Math.sin(c.t) * 5).toLocaleString() : trad ? '3' : '0';
    q('.c-tk').textContent = live ? Math.round(12 + k * 340).toLocaleString() : '0';
    const teams = live ? Math.min(this.v.teams.length, 1 + Math.floor(k * 14)) : 0; q('.c-tm').textContent = String(teams);
    const mins = live ? Math.round(s.unit === 'h' ? (c.t - s.impact) * 60 : c.t - s.impact) : 0;
    q('.c-br').textContent = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
    this.el.querySelectorAll('.st-team').forEach((t, i) => t.classList.toggle('on', i < teams));
    const found = live && c.t >= s.tradDetect + (s.tradRecover - s.tradDetect) * 0.45;
    q('.st-rc').innerHTML = found ? `Root cause: <b>found by hand, ${esc(this.v.tree[this.v.rootNode])}</b>` : 'Root cause: <b>unknown</b>';
    this.status = trad ? (live ? (c.t >= s.tradRecover ? 'Recovered, after the damage' : 'P1 open') : 'Signals scattered across tools') : 'Not used on this timeline';
    const now = performance.now();
    if (now - this.lastAdd > (live ? 380 : 2600) && (live || (trad && c.t > s.agentDetect))) {
      this.lastAdd = now;
      const a = live ? this.v.alerts[this.k++ % this.v.alerts.length] : { tool: 'Siloed tool', text: 'Low-priority warning, no context' }, row = document.createElement('div');
      row.className = `st-al ${live ? 'hot' : 'cold'}`; row.innerHTML = `<span class="tool">${esc(a.tool)}</span><span>${esc(a.text)}</span><em>${live ? 'P' + (1 + (this.k % 3)) : 'P4'}</em>`;
      this.list.prepend(row); while (this.list.children.length > 9) this.list.lastElementChild?.remove();
    }
  }
}

// Cisco XDR incident: verdict, MITRE tactics, attack story, SOAR response tasks, "contained" stamp.
export class XdrPanel extends Panel {
  id = 'xdr'; product = 'xdr'; title = 'Incident · Instant Attack Verification'; status = 'Investigating';
  constructor(v) {
    super(); this.v = v; const s = v.security; this.el.className = 'pnl xdr';
    this.el.innerHTML = `<div class="xd-verdict"><b>${esc(s.verdict)}</b><span>Sources: Splunk ES, Duo, Secure Email, Secure Endpoint, Hypershield</span></div>
      <div class="xd-tactics">${s.tactics.map((t, i) => `<span data-i="${i}">${esc(t)}</span>`).join('')}</div>
      <div class="xd-story">${s.story.map((n, i) => `<div class="xd-node" data-i="${i}"><b>${esc(n.stage)}</b><span>${esc(n.text)}</span></div>`).join('<i class="xd-arrow"></i>')}</div>
      <div class="xd-resp"><h5>Response · Splunk SOAR playbook</h5>${s.responses.map((r, i) => `<div class="xd-task" data-i="${i}"><i></i><span>${esc(r)}</span></div>`).join('')}</div>
      <div class="xd-stamp">Contained at the identity stage</div>`;
  }
  update(c) {
    const s = c.s, sec = this.v.security, n = sec.story.length; let lit = 0, contained = false;
    if (c.branch === 'traditional') lit = Math.ceil(clamp((c.t - (s.agentDetect - 10)) / (s.impact + (s.tradDetect - s.impact) * 0.5 - (s.agentDetect - 10))) * n);
    else { lit = c.t >= s.agentDetect ? 2 : +(c.t >= s.agentDetect - 15); contained = c.t >= s.agentRemediate; }
    this.el.dataset.contained = String(contained); this.el.dataset.branch = c.branch;
    this.el.querySelectorAll('.xd-node').forEach((e, i) => { e.classList.toggle('lit', i < lit); e.classList.toggle('blocked', contained && i >= lit); });
    this.el.querySelectorAll('.xd-tactics span').forEach((e, i) => e.classList.toggle('lit', i < lit));
    const prog = c.branch === 'agentic' ? clamp((c.t - (s.agentDetect + 3)) / (s.agentRemediate - s.agentDetect - 3)) : 0;
    this.el.querySelectorAll('.xd-task').forEach((e, i) => e.classList.toggle('done', prog * sec.responses.length > i + 0.2));
    this.status = contained ? 'Contained' : c.branch === 'traditional' && lit >= n ? 'Impact: encryption' : lit ? 'Attack in progress' : 'Monitoring';
  }
}

// Business impact: strategic pillar, realized exposure vs protected value (modeled), KPI bars and table.
export class ImpactPanel extends Panel {
  id = 'impact'; product = 'customer'; title = 'Business impact'; status = 'Modeled';
  constructor(m) {
    super(); this.m = m; this.el.className = 'pnl impact';
    this.el.innerHTML = `<div class="im-pillar"><label>New Frontier priority</label><b>${esc(m.pillar)}</b></div>
      <div class="im-big"><div class="trad"><label>Exposure realized, traditional</label><b class="im-exp">$0.0M</b></div><div class="agent"><label>Protected with AgenticOps</label><b class="im-prot">$0.0M</b></div></div>
      <div class="im-metric"><label>${esc(m.metricName)}</label><div class="im-bars"><div class="b trad"><i></i><span>Traditional</span></div><div class="b agent"><i></i><span>AgenticOps</span></div></div></div>
      <table class="im-kpi">${m.kpis.map((k) => `<tr><td>${esc(k.label)}</td><td class="t">${esc(k.traditional)}</td><td class="a">${esc(k.agentic)}</td></tr>`).join('')}</table>
      <div class="im-note">Modeled estimate, for discussion only.</div>`;
  }
  update(c) {
    const s = this.m, exp = c.tl.exposureAt(c.t), showT = c.view !== 'agentic';
    this.el.querySelector('.im-exp').textContent = `$${((showT ? exp : 0) / 1e6).toFixed(1)}M`;
    const prot = c.t >= s.agentRemediate && c.view !== 'traditional' ? s.exposure * clamp(((c.t - s.agentRemediate) / Math.max(1, s.range[1] - s.agentRemediate)) * 2) : 0;
    this.el.querySelector('.im-prot').textContent = `$${(prot / 1e6).toFixed(1)}M`;
    this.el.querySelector('.b.trad i').style.width = `${clamp(c.tl.metric('traditional', c.t) / 105) * 100}%`;
    this.el.querySelector('.b.agent i').style.width = `${clamp(c.tl.metric('agentic', c.t) / 105) * 100}%`;
  }
}

// The real building: address, mission floor and basis, public facts vs illustrative, drill buttons.
export class FacilityPanel extends Panel {
  id = 'facility'; product = 'customer'; status = 'Public sources'; onLevel = () => {};
  constructor(f, zone) {
    super(); this.title = f.title; this.el.className = 'pnl facility';
    this.el.innerHTML = `<div class="fc-addr"><b>${esc(f.entity)}</b><span>${esc(f.address)}</span></div>
      ${zone ? `<div class="fc-zone ${zone.verified ? 'v' : ''}"><label>Mission location</label><b>Floor ${zone.floor} · ${esc(zone.room)}</b><span>${esc(zone.basis)}</span></div>` : ''}
      <ul class="fc-facts">${f.facts.map((x) => `<li class="${x.verified ? 'v' : 'i'}"><em>${x.verified ? 'Public source' : 'Illustrative'}</em><b>${esc(x.k)}</b><span>${esc(x.v)}</span></li>`).join('')}</ul>
      <div class="fc-drill"><button data-l="globe">Globe</button>${f.buildings.length > 1 ? '<button data-l="site">Campus</button>' : ''}<button data-l="building">Building</button>${zone ? `<button data-l="floor">Floor ${zone.floor}</button>` : ''}</div>
      <div class="fc-src">Sources: ${f.sources.map(esc).join(' · ')}</div>`;
    this.el.querySelectorAll('[data-l]').forEach((b) => b.addEventListener('click', () => this.onLevel(b.dataset.l)));
  }
}

// Cisco Data Fabric diagram: signal sources (lit when this mission uses them) -> Data Fabric -> Cloud Control -> actions.
export class FabricPanel extends Panel {
  id = 'fabric'; product = 'fabric'; title = 'Powered by Splunk · into Cisco Cloud Control'; status = 'Federated';
  constructor(m) {
    super(); const text = m ? [...m.signals, ...m.products].join(' ') : '';
    const litSrc = FABRIC_SOURCES.map((s) => !m || s.match.test(text)), litAct = FABRIC_ACTIONS.map((a) => !m || m.products.some((p) => p.includes(a.split(' ')[0])) || text.includes(a));
    const y = (i) => 22 + i * 54; this.el.className = 'pnl fabric';
    const src = FABRIC_SOURCES.map((s, i) => `<g class="fb-src ${litSrc[i] ? 'lit' : ''}" transform="translate(8,${y(i)})"><rect width="170" height="42" rx="8"/><text x="10" y="18" class="t">${esc(s.label)}</text><text x="10" y="33" class="s">${esc(s.sub)}</text></g>`).join('');
    const col = (x, head, items, cls) => `<g class="${cls}" transform="translate(${x},20)"><rect width="190" height="316" rx="12"/><text x="95" y="24" class="h">${head}</text>${items.map((t, i) => `<g transform="translate(12,${44 + i * 52})"><rect width="166" height="40" rx="7" class="in"/><text x="83" y="25" class="c">${esc(t)}</text></g>`).join('')}</g>`;
    const df = col(232, 'Cisco Data Fabric', ['Machine Data Lake', 'Federated Search (SPL2)', 'Cisco Time Series Model', 'Context layer, knowledge graph', 'Splunk MCP Server'], 'fb-df');
    const cc = col(476, 'Cisco Cloud Control', ['AI Canvas', 'Cisco AI Assistant', 'Agents: monitor, diagnose', 'Agents: remediate, learn', 'AI Defense governance'], 'fb-cc');
    const act = FABRIC_ACTIONS.map((a, i) => `<g class="fb-act ${litAct[i] ? 'lit' : ''}" transform="translate(720,${y(i)})"><rect width="150" height="42" rx="8"/><text x="75" y="26" class="c">${esc(a)}</text></g>`).join('');
    const paths = [...FABRIC_SOURCES.map((_, i) => `M178,${y(i) + 21} C205,${y(i) + 21} 205,178 232,178`), 'M422,178 L476,178', ...FABRIC_ACTIONS.map((_, i) => `M666,178 C693,178 693,${y(i) + 21} 720,${y(i) + 21}`)];
    const N = FABRIC_SOURCES.length, lit = (i) => (i < N ? litSrc[i] : i === N ? true : litAct[i - N - 1]);
    const wires = paths.map((d, i) => `<path id="fbp${i}" class="fb-w ${lit(i) ? 'lit' : ''} ${i > N && lit(i) ? 'act' : ''}" d="${d}"/>`).join('');
    const dots = paths.map((_, i) => (lit(i) ? [0, 1].map((k) => `<circle r="3" class="fb-dot ${i > N ? 'act' : ''}"><animateMotion dur="${2.2 + (i % 3) * 0.4}s" begin="${k * 1.1 + i * 0.13}s" repeatCount="indefinite"><mpath href="#fbp${i}"/></animateMotion></circle>`).join('') : '')).join('');
    this.el.innerHTML = `<svg viewBox="0 0 880 350" class="fb-svg">${wires}${src}${df}${cc}${act}${dots}<text x="200" y="345" class="cap">Signals</text><text x="440" y="345" class="cap">One federated, AI-ready picture</text><text x="690" y="345" class="cap">Governed action</text></svg>`;
  }
}

// Cloud Control topology: counts and per-site state rows.
export class GlobalPanel extends Panel {
  id = 'global'; product = 'cc'; title = `Topology · all ${CUSTOMER} locations`; status = `Tenant group: ${CUSTOMER} Global`; onPick = () => {};
  constructor(m) {
    super(); this.m = m; this.el.className = 'pnl global';
    const rows = SITES.filter((s) => s.hub || s.id === 'greenbush');
    this.el.innerHTML = `<div class="go-sum"><div><b>${SITES.length}</b><label>Sites</label></div><div><b>128</b><label>Agents</label></div><div><b class="go-imp">0</b><label>Impacted</label></div><div><b class="go-act">0</b><label>Actions pending</label></div></div>
      <div class="go-list">${rows.map((s) => `<div class="go-row" data-id="${s.id}"><i></i><b>${esc(s.city)}</b><span>${esc(s.name)}</span><em>Healthy</em></div>`).join('')}</div>`;
    this.el.querySelectorAll('.go-row').forEach((r) => r.addEventListener('click', () => this.onPick(r.dataset.id)));
  }
  update(c) {
    const m = this.m; let hit = 0;
    this.el.querySelectorAll('.go-row').forEach((r) => {
      const id = r.dataset.id; let st = 'ok', txt = 'Healthy';
      if (m && id === m.siteId) { st = c.state === 'critical' ? 'crit' : ['warning', 'signal', 'recovering'].includes(c.state) ? 'warn' : c.state === 'protected' ? 'good' : 'ok'; txt = { idle: 'Healthy', signal: 'Weak signal', warning: 'Agent acting', critical: 'Business impact', recovering: 'Recovering', protected: 'Protected' }[c.state]; }
      else if (m && m.blast.includes(id) && c.state === 'critical') { st = 'crit'; txt = 'Blast radius'; }
      if (st === 'crit') hit++; r.dataset.st = st; r.querySelector('em').textContent = txt;
    });
    this.el.querySelector('.go-imp').textContent = String(hit); this.el.querySelector('.go-act').textContent = c.state === 'warning' ? '1' : '0';
  }
}

// Tour opening panels.
export class FactsPanel extends Panel {
  id = 'facts'; product = 'customer'; title = `${CUSTOMER} at a glance`; status = 'Public information';
  constructor() {
    super(); this.el.className = 'pnl facts';
    this.el.innerHTML = `<div class="fa-grid"><div><b>1868</b><label>Founded in New York</label></div><div><b>40+</b><label>Markets served</label></div><div><b>#1</b><label>U.S. group benefits provider</label></div><div><b>200 Park Ave</b><label>Global headquarters above Grand Central</label></div></div>
      <p>The locations in this experience are real MetLife offices: New York, Cary, Tampa, Whippany, North Greenbush, Tokyo, Mexico City, Santiago, Brighton, Dubai and Noida.</p>`;
  }
}
export class FrontierPanel extends Panel {
  id = 'frontier'; product = 'customer'; title = 'New Frontier commitments'; status = 'Investor Day strategy';
  constructor() {
    super(); this.el.className = 'pnl frontier';
    this.el.innerHTML = `<div class="nf-grid">${[['Double-digit', 'Adjusted EPS growth'], ['15% to 17%', 'Adjusted return on equity'], ['100 bps', 'Lower direct expense ratio'], ['$25B+', 'Free cash flow']].map(([a, b], i) => `<div style="--i:${i}"><b>${a}</b><label>${b}</label><span class="nf-run">Runs on technology</span></div>`).join('')}</div>`;
  }
}
export class SilosPanel extends Panel {
  id = 'silos'; product = 'trad'; title = 'Each team sees a slice'; status = '7 consoles';
  constructor() {
    super(); this.el.className = 'pnl silos';
    const tools = ['Network NMS', 'Cloud console', 'APM', 'Security SIEM', 'Identity', 'Contact center', 'Service desk'];
    this.el.innerHTML = `<div class="sl-grid">${tools.map((t, i) => `<div class="sl-tool" style="--i:${i}"><h6>${t}</h6><b>${30 + ((i * 47) % 180)}</b><label>open alerts</label><div class="sl-lines"><i></i><i></i><i></i></div></div>`).join('')}</div><div class="sl-foot">No shared context. No business view. Alerts arrive after customers feel it.</div>`;
    this.timer = window.setInterval(() => this.el.querySelectorAll('.sl-tool b').forEach((b) => (b.textContent = String(Number(b.textContent) + Math.floor(Math.random() * 4)))), 500);
  }
  destroy() { clearInterval(this.timer); }
}
export class ShellPanel extends Panel {
  id = 'shell'; product = 'cc'; title = 'One login, one view, humans and agents together'; status = 'Generally available (U.S.)';
  constructor() {
    super(); this.el.className = 'pnl shell';
    this.el.innerHTML = `<div class="sh-wrap"><nav>${['Inventory', 'Topology', 'Actions', 'AI Canvas', 'Studio', 'Marketplace'].map((t, i) => `<span class="${i === 2 ? 'on' : ''}">${t}</span>`).join('')}</nav><div class="sh-main">
      <h6>Actions · correlated and prioritized</h6>${[['P1', 'Predicted capacity breach, Group Benefits portal', 'ThousandEyes · Splunk · SD-WAN', 'Agent proposed'], ['P2', 'Config drift on leaf-14 conflicts with CHG-48211', 'Nexus Dashboard · ServiceNow', 'Awaiting CAB'], ['P2', 'Carrier diversity risk, Tampa', 'SD-WAN · NOAA', 'Playbook ready']].map((a) => `<div class="sh-act"><b class="pr">${a[0]}</b><span>${a[1]}</span><em>${a[2]}</em><i>${a[3]}</i></div>`).join('')}
      <h6>Agents</h6><div class="sh-agents">${[['Ambient', 'Monitoring agent', 'Published v3.2'], ['Ambient', 'Diagnostic agent', 'Published v2.8'], ['Live', 'Remediation agent', 'Approval required'], ['Ambient', 'Learning agent', 'Published v1.9']].map((a) => `<div><em>${a[0]}</em><b>${a[1]}</b><span>${a[2]}</span></div>`).join('')}</div>
      <div class="sh-gov">Agents propose. Humans approve before anything changes in production. Policy enforced by Cisco AI Defense; every LLM and tool call traced in Splunk.</div></div></div>`;
  }
}
export class LoopPanel extends Panel {
  id = 'loop'; product = 'cc'; title = 'From signal to action'; status = 'Closed-loop operations';
  constructor() {
    super(); this.el.className = 'pnl loop';
    this.el.innerHTML = `<div class="lp-row">${[['Spot trouble', 'Data Fabric and ThousandEyes'], ['Identify cause', 'Cross-domain agents'], ['Fix', 'Governed change, human approval'], ['Test before deploy', 'Digital twin, policy check'], ['Confirm recovery', 'ThousandEyes validation']].map((s, i) => `<div class="lp-step" style="--i:${i}"><b>${i + 1}</b><h6>${s[0]}</h6><span>${s[1]}</span></div>`).join('<i class="lp-arrow"></i>')}</div>`;
  }
}

// Window manager: slots, open/close animation, expand, and SVG leader lines to a projected anchor.
export class Stage {
  wins = new Map(); ctx = null; project = () => ({ x: 0, y: 0, visible: false }); onChange = () => {};
  constructor() {
    this.root = document.createElement('div'); this.root.id = 'stageLayer';
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); this.svg.id = 'leaders';
    document.body.append(this.svg, this.root);
    const loop = () => { requestAnimationFrame(loop); this.drawLeaders(); }; loop();
  }
  has(id) { return this.wins.has(id); }
  get(id) { return this.wins.get(id)?.panel; }
  show(panel, slot, opts = {}) {
    const ex = this.wins.get(panel.id);
    if (ex) { if (ex.slot !== slot) this.move(panel.id, slot); panel.destroy(); return ex.panel; }
    for (const w of this.wins.values()) if (w.slot === slot || CONFLICTS[slot].includes(w.slot)) this.hide(w.panel.id);
    const p = PRODUCTS[panel.product], el = document.createElement('section');
    el.className = `win slot-${slot} ${p.cls}`; el.dataset.id = panel.id;
    el.innerHTML = `<header class="win-head"><span class="win-brand"><i></i>${p.name}</span><span class="win-title"></span><span class="win-status"><b class="live"></b><em></em></span><button class="win-btn" data-a="max" title="Expand" aria-label="Expand">⤢</button><button class="win-btn" data-a="close" title="Close" aria-label="Close">×</button></header><div class="win-body"></div>`;
    el.querySelector('.win-title').textContent = panel.title; el.querySelector('.win-status em').textContent = panel.status;
    el.querySelector('.win-body').appendChild(panel.el);
    el.querySelector('[data-a="close"]').addEventListener('click', () => this.hide(panel.id));
    el.querySelector('[data-a="max"]').addEventListener('click', () => el.classList.toggle('maxed'));
    this.root.appendChild(el); requestAnimationFrame(() => el.classList.add('in'));
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path'); line.setAttribute('class', `leader ${p.cls}`);
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); dot.setAttribute('r', '4'); dot.setAttribute('class', `leader-dot ${p.cls}`);
    this.svg.append(line, dot);
    this.wins.set(panel.id, { panel, slot, el, anchor: opts.anchor, line, dot });
    if (this.ctx) panel.update(this.ctx); this.onChange(); return panel;
  }
  move(id, slot) { const w = this.wins.get(id); if (w) { w.el.classList.remove(`slot-${w.slot}`); w.slot = slot; w.el.classList.add(`slot-${slot}`); } }
  hide(id) {
    const w = this.wins.get(id); if (!w) return;
    this.wins.delete(id); w.el.classList.remove('in'); w.el.classList.add('out'); w.line.remove(); w.dot.remove();
    setTimeout(() => { w.el.remove(); w.panel.destroy(); }, 450); this.onChange();
  }
  clear(keep = []) { for (const id of [...this.wins.keys()]) if (!keep.includes(id)) this.hide(id); }
  beat(id, n) { this.wins.get(id)?.panel.beat(n); }
  update(ctx) {
    this.ctx = ctx;
    for (const w of this.wins.values()) { w.panel.update(ctx); const em = w.el.querySelector('.win-status em'); if (em.textContent !== w.panel.status) em.textContent = w.panel.status; w.el.dataset.state = ctx.state; }
  }
  resetCtx() { this.ctx = null; }
  drawLeaders() {
    for (const w of this.wins.values()) {
      const hideL = () => { w.line.style.opacity = '0'; w.dot.style.opacity = '0'; };
      if (!w.anchor || w.el.classList.contains('maxed') || !w.el.classList.contains('in')) { hideL(); continue; }
      const a = this.project(w.anchor), r = w.el.getBoundingClientRect();
      if (!a.visible || r.width === 0 || (a.x > r.left && a.x < r.right && a.y > r.top && a.y < r.bottom)) { hideL(); continue; }
      const x = a.x < r.left ? r.left : a.x > r.right ? r.right : r.left + r.width / 2, y = a.y < r.top ? r.top : a.y > r.bottom ? r.bottom : r.top + r.height / 2, mx = (x + a.x) / 2;
      w.line.setAttribute('d', `M${x},${y} C${mx},${y} ${mx},${a.y} ${a.x},${a.y}`); w.dot.setAttribute('cx', String(a.x)); w.dot.setAttribute('cy', String(a.y));
      w.line.style.opacity = '1'; w.dot.style.opacity = '1';
    }
  }
}
