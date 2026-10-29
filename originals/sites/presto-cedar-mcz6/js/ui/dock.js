/* Scenario dock (timeline, narrator, lens view, AI & metrics), phone, alerts, timer, cascade diagram. */
(function () {
  const MSK = (window.MSK = window.MSK || {});
  const U = MSK.util; const { esc, $, $$ } = U;
  const DK = (MSK.dock = {});
  const D = () => MSK.director;

  // ---------------------------------------------------------------- dock
  function renderDock(S) {
    const sc = S.sc; const vars = D().variants(sc);
    const dock = $('#dock'); dock.classList.add('on');
    dock.innerHTML = `
      <div class="dock-head">
        <span class="sc-icon">${sc.icon || '•'}</span><span class="cat">${esc(sc.category)}</span><h4>${esc(sc.title)}</h4>
        ${vars.length ? `<div class="seg" id="dk-var">${vars.map((v, i) => `<button data-v="${v.id}" class="${S.variant === v.id ? 'on' : ''} ${i === 0 ? 'with' : 'without'}">${esc(v.label)}</button>`).join('')}</div>` : ''}
        <div class="ctrls">
          <div class="seg" id="dk-speed">${[1, 2, 4].map((s) => `<button data-s="${s}" class="${D().speed() === s ? 'on' : ''}">${s}×</button>`).join('')}</div>
          <button class="cbtn" id="dk-prev" title="Previous step (←)">⏮</button>
          <button class="cbtn play" id="dk-play" title="Play / pause (space)">⏸</button>
          <button class="cbtn" id="dk-next" title="Next step (→)">⏭</button>
          <button class="cbtn" id="dk-info" title="Scenario overview">ⓘ</button>
          <button class="cbtn" id="dk-min" title="Minimize">▾</button>
          <button class="cbtn" id="dk-close" title="Close scenario">✕</button>
        </div>
      </div>
      <div class="steps" id="dk-steps">${S.steps.map((st, i) => `<button class="stp" data-i="${i}"><small>${esc(st.t || '')}</small><span>${esc(st.title)}</span><i class="pb"></i></button>`).join('')}</div>
      <div class="dock-body"><div class="narr" id="dk-narr"></div><div class="side" id="dk-side"></div></div>`;
    dock.querySelector('#dk-play').addEventListener('click', () => D().toggle());
    dock.querySelector('#dk-prev').addEventListener('click', () => D().prev());
    dock.querySelector('#dk-next').addEventListener('click', () => D().next());
    dock.querySelector('#dk-close').addEventListener('click', () => { D().unload(); });
    dock.querySelector('#dk-info').addEventListener('click', () => MSK.inspector.scenario(sc.id));
    dock.querySelector('#dk-min').addEventListener('click', (e) => { dock.classList.toggle('dock-min'); e.target.textContent = dock.classList.contains('dock-min') ? '▴' : '▾'; });
    dock.querySelector('#dk-steps').addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) D().goto(Number(b.dataset.i), true); });
    const sp = dock.querySelector('#dk-speed'); sp.addEventListener('click', (e) => { const b = e.target.closest('[data-s]'); if (!b) return; D().setSpeed(Number(b.dataset.s)); sp.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); });
    const vv = dock.querySelector('#dk-var'); if (vv) vv.addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b && b.dataset.v !== S.variant) D().load(sc.id, b.dataset.v); });
  }
  function renderStep({ idx, step, S }) {
    $$('#dk-steps .stp').forEach((b, i) => { b.classList.toggle('on', i === idx); b.classList.toggle('done', i < idx); b.querySelector('.pb').style.width = i < idx ? '100%' : '0'; });
    const on = $(`#dk-steps .stp[data-i="${idx}"]`); if (on) on.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    const lens = MSK.state.lens; const L = MSK.lensMap[lens];
    const lv = step.lens || {};
    const otherLenses = Object.keys(lv).filter((k) => k !== lens && MSK.lensMap[k]);
    const isWithout = S.sc.variants && S.variant !== Object.keys(S.sc.variants)[0];
    $('#dk-narr').innerHTML = `
      <div class="when">${esc(step.t || '')} · Step ${idx + 1} of ${S.steps.length}${isWithout ? ' · <span style="color:var(--crit)">WITHOUT CISCO</span>' : ''}</div>
      <h3>${esc(step.title)}</h3>
      <div class="narrator">Narrator</div><p>${esc(step.narration || '')}</p>
      ${lv[lens] ? `<div class="lensview" style="--lc:${L.color}"><b>${L.icon} ${esc(L.name)} lens · ${esc(MSK.people[L.persona].name)}</b>${esc(lv[lens])}</div>` : ''}
      ${otherLenses.length ? `<div class="lens-others"><span class="cat" style="align-self:center">Other views:</span>${otherLenses.map((k) => `<button data-lensv="${k}" title="${esc(lv[k])}">${MSK.lensMap[k].icon} ${esc(MSK.lensMap[k].name)}</button>`).join('')}</div>` : ''}
      ${step.without ? `<div class="without"><b>Without Cisco:</b> ${esc(step.without)}</div>` : ''}`;
    $('#dk-narr').querySelectorAll('[data-lensv]').forEach((b) => b.addEventListener('click', () => { MSK.panels.setLens(b.dataset.lensv); }));
    const tech = step.tech || [];
    $('#dk-side').innerHTML = `
      ${tech.length ? `<div><h6>Cisco technology in this step</h6><div class="chips">${tech.map(MSK.panels.techChip).join('')}</div></div>` : ''}
      ${(step.ai || []).length ? `<div><h6>AI at work · metrics collected</h6>${step.ai.map((a) => `<div class="aicard"><b>✦ ${esc(a.name)}</b><p>${esc(a.does || '')}</p><div class="mtags">${(a.metrics || []).map((m) => `<span>${esc(m)}</span>`).join('')}</div></div>`).join('')}</div>` : ''}
      ${(step.metrics || []).length ? `<div><h6>Splunk metrics</h6><div class="metrics">${step.metrics.map((m) => `<div class="metric ${m.good ? 'good' : ''}"><small>${esc(m.label)}</small><b>${esc(m.value)}</b></div>`).join('')}</div></div>` : ''}
      <div id="dk-kpis"></div>`;
    $('#dk-side').querySelectorAll('[data-tech]').forEach((b) => b.addEventListener('click', () => MSK.inspector.tech(b.dataset.tech)));
    renderKpis(S.kpis);
  }
  function renderKpis(kpis) {
    const box = $('#dk-kpis'); if (!box) return;
    const list = Object.values(kpis || {});
    box.innerHTML = list.length ? `<h6>Live KPIs</h6><div class="kpis-live">${list.map((k) => `<span class="kpi-live">${esc(k.label)}<b style="color:var(--${k.tone === 'crit' ? 'crit' : k.tone === 'warn' ? 'warn' : 'ok'})">${esc(k.value)}</b></span>`).join('')}</div>` : '';
  }

  // ---------------------------------------------------------------- phone
  const APPS = { sms: ['Messages', '#22c55e', '✉'], webex: ['Webex', '#0e7490', '◍'], mychart: ['MyChart', '#b91c1c', '✚'], uber: ['Uber Eats', '#111', 'U'], wayfinding: ['MSK Wayfinding', '#2563eb', '●'], call: ['Phone', '#16a34a', '☏'], alert: ['Alert', '#dc2626', '!'], esign: ['MSK Discharge', '#7c3aed', '✍'] };
  let phoneWho = null;
  function renderPhone(S, focusWho) {
    const ph = $('#phone'); const people = Object.keys(S.phones || {});
    if (!people.length) { ph.classList.remove('on'); $('#app').classList.remove('phone-on'); return; }
    phoneWho = focusWho || (people.includes(phoneWho) ? phoneWho : people[people.length - 1]);
    const msgs = S.phones[phoneWho] || []; const last = msgs[msgs.length - 1] || {}; const app = APPS[last.app] || APPS.sms;
    const p = MSK.people[phoneWho];
    ph.innerHTML = `<div class="notch"></div><button class="x" title="Hide phone">✕</button>
      <div class="sb"><span>${U.timeStr(MSK.world.clockMin || 0)}</span><span>5G ▮▮▮ 82%</span></div>
      <div class="who">${people.map((id) => `<button data-who="${id}" class="${id === phoneWho ? 'on' : ''}">${esc(MSK.people[id] ? MSK.people[id].name.split(' ')[0].replace(/,$/, '') : id)}’s phone</button>`).join('')}</div>
      <div class="app"><span class="ai" style="background:${app[1]}">${app[2]}</span><span><b>${esc(app[0])}</b><small>${esc(p ? p.name : '')}</small></span></div>
      <div class="msgs">${msgs.map((m) => `<div class="msg app-${m.app || 'sms'}"><div class="from">${esc(m.from || '')}</div>${esc(m.text)}${/blue-dot|directions|Route|Map|Show owner/i.test(m.cta || '') ? '<div class="map"></div>' : ''}${m.cta ? `<span class="cta">${esc(m.cta)}</span>` : ''}</div>`).join('')}</div>
      <div class="home"></div>`;
    ph.classList.add('on'); $('#app').classList.add('phone-on');
    const box = ph.querySelector('.msgs'); box.scrollTop = box.scrollHeight;
    ph.querySelector('.x').addEventListener('click', () => { ph.classList.remove('on'); $('#app').classList.remove('phone-on'); });
    ph.querySelectorAll('[data-who]').forEach((b) => b.addEventListener('click', () => renderPhone(S, b.dataset.who)));
  }

  // ---------------------------------------------------------------- alerts
  DK.alert = function (a) {
    const box = $('#alerts'); const t = MSK.tech(a.source || 'splunk'); const c = a.level === 'crit' ? 'var(--crit)' : a.level === 'warn' ? 'var(--warn)' : a.level === 'ok' ? 'var(--ok)' : MSK.techColor(a.source || 'splunk');
    const div = U.el('div', 'alert'); div.style.setProperty('--c', c);
    const text = a.alert || a.text || '';
    const parts = text.split(' · '); const src = a.source ? t.name.replace(/^Cisco /, '') : parts.length > 1 ? parts[0] : 'Cisco Cloud Control';
    div.innerHTML = `<span class="ic">${t.icon || '!'}</span><div><div class="src">${esc(src)} ${a.level ? '· ' + esc(a.level) : ''}</div>${esc(text)}</div>`;
    box.prepend(div);
    while (box.children.length > 4) box.lastChild.remove();
    setTimeout(() => { div.classList.add('out'); setTimeout(() => div.remove(), 400); }, 8000 / Math.max(1, D().speed() * 0.7));
  };

  // ---------------------------------------------------------------- timer
  let timerT = null;
  function showTimer(a) {
    const box = $('#timer'); const c = a.tone === 'crit' ? 'var(--crit)' : a.tone === 'warn' ? 'var(--warn)' : 'var(--ok)';
    box.style.setProperty('--c', c); box.innerHTML = `<div><small>${esc(a.timer)}</small><br><b id="tm-v">0</b></div>`; box.classList.add('on');
    // count-up animation on numeric parts
    const target = String(a.value); const nums = target.match(/\d+(\.\d+)?/g) || []; let k = 0;
    clearInterval(timerT);
    timerT = setInterval(() => { k = Math.min(1, k + 0.06); let i = 0; const v = target.replace(/\d+(\.\d+)?/g, () => { const n = Number(nums[i++]); return String(Math.round(n * k)); }); const e = $('#tm-v'); if (e) e.textContent = v; if (k >= 1) clearInterval(timerT); }, 40);
  }

  // ---------------------------------------------------------------- cascade
  const STC = { ok: '#34d399', watch: '#22d3ee', warn: '#fbbf24', crit: '#f87171', restored: '#a7f3d0' };
  function renderCascade(S) {
    const box = $('#cascade'); const nodes = S.sc.cascadeNodes;
    if (!nodes || !nodes.length) { box.classList.remove('on'); return; }
    const edges = S.sc.cascadeEdges || [];
    // layered layout by longest path from roots
    const depth = {}; nodes.forEach((n) => (depth[n.id] = 0));
    for (let it = 0; it < nodes.length; it++) edges.forEach(([a, b]) => { if (depth[a] != null && depth[b] != null && depth[b] < depth[a] + 1) depth[b] = Math.min(depth[a] + 1, 6); });
    const layers = {}; nodes.forEach((n) => (layers[depth[n.id]] = layers[depth[n.id]] || []).push(n));
    const L = Object.keys(layers).map(Number).sort((a, b) => a - b);
    const W = 440, colW = W / L.length, rowH = 28; const maxRows = Math.max(...L.map((l) => layers[l].length));
    const H = maxRows * rowH + 10; const pos = {};
    L.forEach((l, ci) => layers[l].forEach((n, ri) => { pos[n.id] = { x: ci * colW + 4, y: 6 + ri * rowH + (maxRows - layers[l].length) * rowH / 2, w: colW - 10 }; }));
    let svg = '';
    edges.forEach(([a, b]) => { const A = pos[a], B = pos[b]; if (!A || !B) return; const st = S.cascade[a] || 'ok'; svg += `<path d="M ${A.x + A.w} ${A.y + 11} C ${A.x + A.w + 14} ${A.y + 11}, ${B.x - 14} ${B.y + 11}, ${B.x} ${B.y + 11}" fill="none" stroke="${STC[st] || '#475569'}" stroke-opacity="${st === 'ok' ? 0.25 : 0.8}" stroke-width="${st === 'crit' ? 2 : 1.2}"/>`; });
    nodes.forEach((n) => { const p = pos[n.id]; const st = S.cascade[n.id] || 'ok'; const c = STC[st] || '#475569';
      svg += `<g><rect x="${p.x}" y="${p.y}" width="${p.w}" height="22" rx="6" fill="${c}" fill-opacity="${st === 'ok' ? 0.08 : 0.2}" stroke="${c}" stroke-opacity="${st === 'ok' ? 0.35 : 0.95}"/>${st === 'crit' ? `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="22" rx="6" fill="none" stroke="${c}"><animate attributeName="stroke-opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite"/></rect>` : ''}<text x="${p.x + 6}" y="${p.y + 14.5}" fill="#e6edf7" font-size="10">${esc(((n.icon ? n.icon + ' ' : '') + n.label).slice(0, Math.floor(p.w / 5.4)))}</text></g>`; });
    const counts = Object.values(S.cascade).reduce((m, s) => ((m[s] = (m[s] || 0) + 1), m), {});
    box.innerHTML = `<h5><span>System cascade · propagation</span><span>${['crit', 'warn', 'watch', 'restored'].filter((k) => counts[k]).map((k) => `<span class="st ${k === 'restored' ? 'ok' : k === 'watch' ? 'info' : k}">${counts[k]} ${k}</span>`).join(' ')}</span></h5><svg viewBox="0 0 ${W} ${H}" width="100%">${svg}</svg>`;
    box.classList.add('on');
  }

  // ---------------------------------------------------------------- bind
  DK.bind = function () {
    const ro = new ResizeObserver(() => { const d = $('#dock'); const h = d.classList.contains('on') ? d.offsetHeight + 12 : 0; $('#stage').style.setProperty('--dock-h', h + 'px'); MSK.world.setViewShift(h / 2); });
    ro.observe($('#dock'));
    MSK.bus.on('director:load', () => MSK.inspector.close());
    MSK.bus.on('director:load', (S) => { renderDock(S); renderCascade(S); $('#phone').classList.remove('on'); $('#app').classList.remove('phone-on'); $('#timer').classList.remove('on'); MSK.panels.renderLeft(); });
    MSK.bus.on('director:rebuilt', (S) => { renderCascade(S); renderPhone(S); $('#timer').classList.remove('on'); $('#alerts').innerHTML = ''; });
    MSK.bus.on('director:step', (e) => { renderStep(e); if (e.idx === 0 || !e.S.steps[e.idx].actions.some((a) => 'timer' in a)) $('#timer').classList.remove('on'); });
    MSK.bus.on('director:tick', ({ t, dur, idx }) => { const b = $(`#dk-steps .stp[data-i="${idx}"] .pb`); if (b) b.style.width = Math.min(100, (t / dur) * 100) + '%'; });
    MSK.bus.on('director:play', (p) => { const b = $('#dk-play'); if (b) b.textContent = p ? '⏸' : '▶'; });
    MSK.bus.on('director:end', () => MSK.ui.toast('Scenario complete. Open ⓘ for the value summary, or switch lens to replay from another persona’s view.'));
    MSK.bus.on('director:unload', () => { $('#dock').classList.remove('on'); $('#phone').classList.remove('on'); $('#app').classList.remove('phone-on'); $('#timer').classList.remove('on'); $('#cascade').classList.remove('on'); MSK.panels.renderLeft(); });
    MSK.bus.on('ui:phone', ({ a, S }) => renderPhone(S, a.phone));
    MSK.bus.on('ui:alert', DK.alert);
    MSK.bus.on('ui:timer', showTimer);
    MSK.bus.on('ui:kpi', ({ kpis }) => renderKpis(kpis));
    MSK.bus.on('ui:cascade', () => renderCascade(D().current()));
    MSK.bus.on('lens', () => { const S = D().current(); if (S && S.idx >= 0) renderStep({ idx: S.idx, step: S.steps[S.idx], S }); });
  };
})();
