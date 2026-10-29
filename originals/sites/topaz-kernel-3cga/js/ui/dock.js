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
        <div class="narr-ctl" id="dk-voice"></div>
        <div class="ctrls">
          <div class="seg" id="dk-speed">${[1, 2, 4].map((s) => `<button data-s="${s}" class="${D().speed() === s ? 'on' : ''}">${s}×</button>`).join('')}</div>
          <button class="cbtn" id="dk-prev" title="Previous step (←)">⏮</button>
          <button class="cbtn play" id="dk-play" title="Play / pause (space)">⏸</button>
          <button class="cbtn" id="dk-next" title="Next step (→)">⏭</button>
          <button class="cbtn" id="dk-cine" title="Cinema mode: full-screen scene with captions (C)">🎬</button>
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
    dock.querySelector('#dk-cine').addEventListener('click', () => DK.cinema());
    dock.querySelector('#dk-min').addEventListener('click', (e) => { dock.classList.toggle('dock-min'); e.target.textContent = dock.classList.contains('dock-min') ? '▴' : '▾'; });
    dock.querySelector('#dk-steps').addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) D().goto(Number(b.dataset.i), true); });
    const sp = dock.querySelector('#dk-speed'); sp.addEventListener('click', (e) => { const b = e.target.closest('[data-s]'); if (!b) return; D().setSpeed(Number(b.dataset.s)); sp.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); });
    const vv = dock.querySelector('#dk-var'); if (vv) vv.addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b && b.dataset.v !== S.variant) D().load(sc.id, b.dataset.v); });
    renderVoice();
  }

  // ---------------------------------------------------------------- narration controls
  function renderVoice() {
    const box = $('#dk-voice'); if (!box) return; const N = MSK.narrator; const st = N.state();
    const voices = N.voices();
    box.innerHTML = `
      <button class="cbtn narr-tog ${st.enabled ? 'on' : ''}" id="nv-tog" title="${st.enabled ? 'Narration on: click to play without audio' : 'Narration off: click to turn the narrator on'}">${st.enabled ? '🔊' : '🔇'}</button>
      <span class="eq ${st.speaking ? 'on' : ''}" title="Narrator speaking"><i></i><i></i><i></i><i></i></span>
      <select id="nv-voice" title="Narrator voice" ${st.enabled ? '' : 'disabled'}>
        <option value="auto" ${N.voice === 'auto' ? 'selected' : ''}>Narrator: Auto (best available)</option>
        ${voices.map((v) => `<option value="${v.id}" ${N.voice === v.id ? 'selected' : ''}>${esc(v.label)} · ${esc(v.note.split(' · ')[0])}</option>`).join('')}
        <option value="browser" ${N.voice === 'browser' ? 'selected' : ''}>Browser voice</option>
      </select>
      ${st.blocked && st.enabled ? '<button class="pbtn" id="nv-unblock" style="padding:5px 10px;font-size:11px">▶ Enable narration audio</button>' : ''}`;
    box.querySelector('#nv-tog').addEventListener('click', () => N.setEnabled(!N.enabled));
    box.querySelector('#nv-voice').addEventListener('change', (e) => N.setVoice(e.target.value));
    const ub = box.querySelector('#nv-unblock'); if (ub) ub.addEventListener('click', () => N.unblock());
  }
  function captionHTML(step) {
    const parts = String(step.narration || '').match(/[^.!?]+[.!?]+["”’)]*\s*|[^.!?]+$/g) || [];
    return parts.map((p, i) => `<span class="cap" data-c="${i}">${esc(p)}</span>`).join('');
  }
  function highlightCaption(prog) {
    const S = D().current(); const box = $('#dk-cap'); if (!S || !box) return;
    const st = S.steps[S.idx]; const pre = (st.title || '').length + 22; const body = String(st.narration || '').length;
    const pos = prog * (pre + body) - pre; let acc = 0; let on = -1;
    box.querySelectorAll('.cap').forEach((s, i) => { const L = s.textContent.length; if (pos >= acc - 2) on = i; acc += L; });
    box.querySelectorAll('.cap').forEach((s, i) => { s.classList.toggle('now', i === on && prog > 0 && prog < 0.995); s.classList.toggle('said', i < on || prog >= 0.995); });
    const cc = document.getElementById('cinecap'); if (cc) { const cur = box.querySelectorAll('.cap')[Math.max(0, on)]; const txt = prog > 0 && prog < 0.995 && cur ? cur.textContent.trim() : ''; if (cc.dataset.t !== txt) { cc.dataset.t = txt; cc.innerHTML = txt ? '<span>' + esc(txt) + '</span>' : ''; } }
  }
  function renderStep({ idx, step, S }) {
    let ct = document.getElementById('cinetitle'); if (!ct) { ct = U.el('div', 'cinetitle'); ct.id = 'cinetitle'; $('#stage').appendChild(ct); }
    ct.innerHTML = '<small>' + esc(S.sc.category) + ' · ' + esc(step.t || '') + ' · Step ' + (idx + 1) + ' of ' + S.steps.length + '</small><b>' + esc(S.sc.title) + '</b><span>' + esc(step.title) + '</span>';
    $$('#dk-steps .stp').forEach((b, i) => { b.classList.toggle('on', i === idx); b.classList.toggle('done', i < idx); b.querySelector('.pb').style.width = i < idx ? '100%' : '0'; });
    const on = $(`#dk-steps .stp[data-i="${idx}"]`); if (on) on.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    const lens = MSK.state.lens; const L = MSK.lensMap[lens];
    const lv = step.lens || {};
    const otherLenses = Object.keys(lv).filter((k) => k !== lens && MSK.lensMap[k]);
    const isWithout = S.sc.variants && S.variant !== Object.keys(S.sc.variants)[0];
    $('#dk-narr').innerHTML = `
      <div class="when">${esc(step.t || '')} · Step ${idx + 1} of ${S.steps.length}${isWithout ? ' · <span style="color:var(--crit)">WITHOUT CISCO</span>' : ''}</div>
      <h3>${esc(step.title)}</h3>
      <div class="narrator">Narrator</div><p id="dk-cap">${captionHTML(step)}</p>
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
  let phoneWho = null, phoneS = null;
  // who made each message possible: Cisco-powered workflows vs. hand-offs to non-Cisco systems
  function poweredBy(m) {
    const f = m.from || '';
    if (m.app === 'mychart') return ['x', 'non-Cisco: Epic MyChart'];
    if (m.app === 'uber') return ['x', 'non-Cisco: Uber Eats'];
    if (/ServiceNow/i.test(f)) return ['x', 'non-Cisco: ServiceNow'];
    if (m.app === 'wayfinding') return ['c', 'Powered by Cisco: Spaces + Webex Connect'];
    if (m.app === 'webex' || /Webex/i.test(f)) return ['c', /Calling|page/i.test(f + (m.text || '')) ? 'Powered by Cisco: Webex Calling' : 'Powered by Cisco: Webex'];
    if (m.app === 'esign') return ['c', 'Powered by Cisco: Webex Connect · e-sign link'];
    if (m.app === 'call') return ['x', 'Phone call'];
    if (/Splunk/i.test(f)) return ['c', 'Powered by Cisco: Splunk alert, via Webex'];
    if (/Spaces/i.test(f)) return ['c', 'Powered by Cisco: Spaces'];
    return ['c', 'Powered by Cisco: Webex Connect'];
  }
  function renderPhone(S, focusWho, open) {
    const ph = $('#phone'); phoneS = S; const people = Object.keys((S && S.phones) || {});
    updateBadge();
    if (!people.length) { ph.innerHTML = '<div class="notch"></div><button class="x" title="Hide phone">✕</button><div class="sb"><span>' + U.timeStr(MSK.world.clockMin || 0) + '</span><span>5G ▮▮▮ 82%</span></div><div class="msgs"><div class="ph-empty">No messages yet. When a story or scenario sends a text, page or alert, it lands here, labeled with who made it possible.</div></div><div class="home"></div>'; bindPhone(ph); return; }
    phoneWho = focusWho || (people.includes(phoneWho) ? phoneWho : people[people.length - 1]);
    const msgs = S.phones[phoneWho] || []; const last = msgs[msgs.length - 1] || {}; const app = APPS[last.app] || APPS.sms;
    const p = MSK.people[phoneWho];
    ph.innerHTML = `<div class="notch"></div><button class="x" title="Hide phone">✕</button>
      <div class="sb" title="Drag to move the phone"><span>${U.timeStr((S.steps[S.idx] && S.steps[S.idx].clock != null) ? S.steps[S.idx].clock : (MSK.world.clockMin || 0))}</span><span>5G ▮▮▮ 82%</span></div>
      <div class="who">${people.map((id) => `<button data-who="${id}" class="${id === phoneWho ? 'on' : ''}">${esc(MSK.people[id] ? MSK.people[id].name.split(' ')[0].replace(/,$/, '') : id)}’s phone</button>`).join('')}</div>
      <div class="app"><span class="ai" style="background:${app[1]}">${app[2]}</span><span><b>${esc(app[0])}</b><small>${esc(p ? p.name : '')}</small></span></div>
      <div class="msgs">${msgs.map((m) => { const pw = poweredBy(m); return `<div class="msg app-${m.app || 'sms'}"><div class="from">${esc(m.from || '')}</div>${esc(m.text)}${/blue-dot|directions|Route|Map|Show owner/i.test(m.cta || '') ? '<div class="map"></div>' : ''}${m.cta ? `<span class="cta">${esc(m.cta)}</span>` : ''}<div class="pw ${pw[0]}">${esc(pw[1])}</div></div>`; }).join('')}</div>
      <div class="home"></div>`;
    const box = ph.querySelector('.msgs'); box.scrollTop = box.scrollHeight;
    bindPhone(ph);
    ph.querySelectorAll('[data-who]').forEach((b) => b.addEventListener('click', () => renderPhone(S, b.dataset.who, true)));
    if (open) { if (document.body.classList.contains('narrating')) PH.pulse(); else PH.open(); }
  }
  function bindPhone(ph) {
    ph.querySelector('.x').addEventListener('click', () => PH.close());
    const sb = ph.querySelector('.sb'); if (sb) dragHandle(sb);
  }
  function updateBadge() {
    const b = $('#phbtn'); if (!b) return; const S = phoneS; const n = S && S.phones ? Object.values(S.phones).reduce((a, l) => a + l.length, 0) : 0;
    b.querySelector('em').textContent = n ? String(n) : ''; b.classList.toggle('has', n > 0);
  }
  // draggable phone button; the phone opens beside it. Position persists per browser; double-click resets.
  const PH = (DK.phone = {});
  const POS_KEY = 'msk.phone';
  function savedPos() { try { return JSON.parse(localStorage.getItem(POS_KEY) || 'null'); } catch (e) { return null; } }
  function placeButton() {
    const b = $('#phbtn'), stage = $('#stage'); if (!b) return;
    const sw = stage.clientWidth, sh = stage.clientHeight; const pos = savedPos();
    const dockH = document.body.classList.contains('narrating') ? 60 : (parseFloat(stage.style.getPropertyValue('--dock-h')) || 0);
    let x = pos ? pos.x * sw : sw - 64, y = pos ? pos.y * sh : sh - dockH - 72;
    x = Math.max(8, Math.min(sw - 56, x)); y = Math.max(60, Math.min(sh - 56, y));
    b.style.left = x + 'px'; b.style.top = y + 'px';
    placePhone();
  }
  DK.placePhoneButton = placeButton;
  function placePhone() {
    const b = $('#phbtn'), ph = $('#phone'), stage = $('#stage'); if (!b || !ph.classList.contains('on')) return;
    const sw = stage.clientWidth, sh = stage.clientHeight; const k = window.innerWidth < 820 ? 0.58 : 0.84;
    const pw = 270 * k, phh = 520 * k; const bx = b.offsetLeft, by = b.offsetTop, bw = b.offsetWidth, bh = b.offsetHeight;
    let x = bx - pw - 12; if (x < 8) x = bx + bw + 12; x = Math.max(8, Math.min(sw - pw - 8, x));
    const y = Math.max(8, Math.min(sh - phh - 8, by + bh - phh));
    ph.style.left = x + 'px'; ph.style.top = y + 'px'; ph.style.right = 'auto'; ph.style.bottom = 'auto';
  }
  let drag = null;
  function dragHandle(node) {
    node.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || (e.target.closest('button') && e.target.closest('button').id !== 'phbtn')) return;
      const b = $('#phbtn'); drag = { sx: e.clientX, sy: e.clientY, bx: b.offsetLeft, by: b.offsetTop, moved: false, node };
      node.setPointerCapture(e.pointerId); e.preventDefault();
    });
    node.addEventListener('pointermove', (e) => {
      if (!drag || drag.node !== node) return; const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
      if (!drag.moved && Math.hypot(dx, dy) < 5) return;
      drag.moved = true; document.body.classList.add('ph-dragging');
      const stage = $('#stage'); const b = $('#phbtn');
      const x = Math.max(8, Math.min(stage.clientWidth - 56, drag.bx + dx)), y = Math.max(60, Math.min(stage.clientHeight - 56, drag.by + dy));
      b.style.left = x + 'px'; b.style.top = y + 'px'; placePhone();
    });
    node.addEventListener('pointerup', () => {
      if (!drag || drag.node !== node) return; const moved = drag.moved; drag = null; document.body.classList.remove('ph-dragging');
      const stage = $('#stage'); const b = $('#phbtn');
      if (moved) { try { localStorage.setItem(POS_KEY, JSON.stringify({ x: b.offsetLeft / stage.clientWidth, y: b.offsetTop / stage.clientHeight })); } catch (e) {} }
      else if (node.id === 'phbtn') PH.toggle();
    });
  }
  PH.open = function () { const ph = $('#phone'); if (!ph.innerHTML) renderPhone(phoneS, null, false); ph.classList.add('on'); $('#app').classList.add('phone-on'); $('#phbtn').classList.add('on'); placePhone(); };
  PH.close = function () { $('#phone').classList.remove('on'); $('#app').classList.remove('phone-on'); const b = $('#phbtn'); if (b) b.classList.remove('on'); };
  PH.toggle = function () { if ($('#phone').classList.contains('on')) PH.close(); else { renderPhone(phoneS || D().current(), phoneWho, false); PH.open(); } };
  PH.reset = function () { PH.close(); phoneS = null; phoneWho = null; $('#phone').innerHTML = ''; updateBadge(); };
  PH.pulse = function () { const b = $('#phbtn'); if (!b) return; b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse'); };
  PH.bind = function () {
    const b = U.el('button', 'phone-btn', '📱<em></em>'); b.id = 'phbtn'; b.title = 'Phone: messages people receive (drag to move, double-click to reset)';
    $('#stage').appendChild(b); dragHandle(b);
    b.addEventListener('dblclick', () => { try { localStorage.removeItem(POS_KEY); } catch (e) {} placeButton(); });
    new ResizeObserver(placeButton).observe($('#stage'));
    placeButton();
  };

  // ---------------------------------------------------------------- alerts
  DK.alert = function (a) {
    const box = $('#alerts'); const t = MSK.tech(a.source || 'splunk'); const c = a.level === 'crit' ? 'var(--crit)' : a.level === 'warn' ? 'var(--warn)' : a.level === 'ok' ? 'var(--ok)' : MSK.techColor(a.source || 'splunk');
    const div = U.el('div', 'alert'); div.style.setProperty('--c', c);
    const text = a.alert || a.text || '';
    const parts = text.split(' · '); const src = a.source ? t.name.replace(/^Cisco /, '') : parts.length > 1 ? parts[0] : 'Splunk';
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
    // readable flow: cause at the top, impact at the bottom; one row per layer, full labels that wrap, curved connectors drawn after layout
    const WORD = { ok: 'Normal', watch: 'Watching', warn: 'Degraded', crit: 'Down', restored: 'Restored' };
    const rows = L.map((l) => `<div class="cz-row${layers[l].length >= 4 ? ' wide' : ''}">${layers[l].map((n) => { const st = S.cascade[n.id] || 'ok';
      return `<div class="cz-n st-${st}" data-cz="${esc(n.id)}"><i>${esc(n.icon || '•')}</i><span>${esc(n.label)}</span><em>${WORD[st] || st}</em></div>`; }).join('')}</div>`).join('');
    const counts = Object.values(S.cascade).reduce((m, s) => ((m[s] = (m[s] || 0) + 1), m), {});
    box.innerHTML = `<h5><span>System cascade · propagation</span><span>${['crit', 'warn', 'watch', 'restored'].filter((k) => counts[k]).map((k) => `<span class="st ${k === 'restored' ? 'ok' : k === 'watch' ? 'info' : k}">${counts[k]} ${WORD[k].toLowerCase()}</span>`).join(' ')}</span></h5>
      <div class="cz"><svg class="cz-lines"></svg>${rows}</div><div class="cz-foot">Cause at the top, clinical impact at the bottom</div>`;
    box.classList.add('on');
    cascadeEdgesNow = { edges, S }; requestAnimationFrame(drawCascadeLines);
  }
  let cascadeEdgesNow = null;
  function drawCascadeLines() {
    const box = $('#cascade'); const wrap = box && box.querySelector('.cz'); if (!wrap || !cascadeEdgesNow) return;
    const svg = wrap.querySelector('.cz-lines'); const R = wrap.getBoundingClientRect(); if (!R.width) return;
    svg.setAttribute('viewBox', `0 0 ${R.width} ${R.height}`); svg.setAttribute('width', R.width); svg.setAttribute('height', R.height);
    const at = (id) => { const e = wrap.querySelector(`[data-cz="${CSS.escape(id)}"]`); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.left - R.left + b.width / 2, top: b.top - R.top, bot: b.bottom - R.top }; };
    const { edges, S } = cascadeEdgesNow;
    svg.innerHTML = '<defs><marker id="cz-ah" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="context-stroke"/></marker></defs>' + edges.map(([a, b]) => {
      const A = at(a), B = at(b); if (!A || !B) return ''; const st = S.cascade[a] || 'ok'; const my = (A.bot + B.top) / 2;
      return `<path d="M ${A.x} ${A.bot} C ${A.x} ${my}, ${B.x} ${my}, ${B.x} ${B.top - 1}" class="cz-e st-${st}" marker-end="url(#cz-ah)"/>`;
    }).join('');
  }
  window.addEventListener('resize', () => requestAnimationFrame(drawCascadeLines));

  // ---------------------------------------------------------------- bind
  DK.cinema = function (on) {
    const app = $('#app'); const v = on != null ? on : !app.classList.contains('cinema');
    app.classList.toggle('cinema', v); $('#dock').classList.toggle('dock-min', v); MSK.inspector.close();
    if (v) app.classList.add('left-collapsed'); else if (window.innerWidth >= 820) app.classList.remove('left-collapsed');
    if (!document.getElementById('cinecap')) { const d = U.el('div', 'cinecap'); d.id = 'cinecap'; $('#stage').appendChild(d); }
    MSK.ui.toast(v ? 'Cinema mode: captions on screen. Press C or 🎬 to exit.' : 'Cinema mode off.');
  };
  DK.bind = function () {
    const ro = new ResizeObserver(() => { const d = $('#dock'); const h = d.classList.contains('on') ? d.offsetHeight + 12 : 0; $('#stage').style.setProperty('--dock-h', h + 'px'); MSK.world.setViewShift(h / 2); });
    ro.observe($('#dock'));
    MSK.bus.on('director:load', () => MSK.inspector.close());
    MSK.bus.on('director:load', (S) => { renderDock(S); renderCascade(S); PH.reset(); phoneS = S; $('#timer').classList.remove('on'); MSK.panels.renderLeft(); });
    MSK.bus.on('director:rebuilt', (S) => { renderCascade(S); const wasOpen = $('#phone').classList.contains('on'); renderPhone(S, null, wasOpen); $('#timer').classList.remove('on'); $('#alerts').innerHTML = ''; });
    MSK.bus.on('director:step', (e) => { renderStep(e); if (e.idx === 0 || !e.S.steps[e.idx].actions.some((a) => 'timer' in a)) $('#timer').classList.remove('on'); });
    MSK.bus.on('director:tick', ({ t, dur, idx }) => { const b = $(`#dk-steps .stp[data-i="${idx}"] .pb`); if (b) b.style.width = Math.min(100, (t / dur) * 100) + '%'; });
    MSK.bus.on('director:play', (p) => { const b = $('#dk-play'); if (b) b.textContent = p ? '⏸' : '▶'; });
    MSK.bus.on('director:end', () => MSK.ui.toast('Scenario complete. Open ⓘ for the value summary, or switch lens to replay from another persona’s view.'));
    MSK.bus.on('director:unload', () => { $('#dock').classList.remove('on'); PH.reset(); $('#timer').classList.remove('on'); $('#cascade').classList.remove('on'); MSK.panels.renderLeft(); });
    MSK.bus.on('ui:phone', ({ a, S }) => renderPhone(S, a.phone, true));
    PH.bind();
    MSK.bus.on('ui:alert', DK.alert);
    MSK.bus.on('ui:timer', showTimer);
    MSK.bus.on('ui:kpi', ({ kpis }) => renderKpis(kpis));
    MSK.bus.on('ui:cascade', () => renderCascade(D().current()));
    MSK.bus.on('lens', () => { const S = D().current(); if (S && S.idx >= 0) renderStep({ idx: S.idx, step: S.steps[S.idx], S }); });
    MSK.bus.on('narrator:state', () => renderVoice());
    MSK.bus.on('narrator:progress', (p) => highlightCaption(p));
  };
})();
