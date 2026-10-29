/* Left panel (persona, scenario library, lens dashboard, people), lens tabs, floor strip, toolbar. */
(function () {
  const MSK = (window.MSK = window.MSK || {});
  const U = MSK.util; const { esc, el, $, $$ } = U;
  const P = (MSK.panels = {});
  MSK.state = MSK.state || { lens: 'hospital', leftTab: 'sc', catFilter: 'All', showAll: false };

  P.avatar = function (p, cls = '') {
    if (!p) return '';
    const ic = p.kind === 'robot' ? '🤖' : U.initials(p.name);
    return `<span class="avatar ${cls}" style="background:${p.color}" title="${esc(p.name)}">${ic}</span>`;
  };
  P.techChip = (id) => { const t = MSK.tech(id); return `<button class="tchip" data-tech="${id}" style="--c:${MSK.techColor(id)}"><i>${t.icon || '•'}</i>${esc(t.name.replace(/^Cisco /, ''))}</button>`; };

  // ---------------------------------------------------------------- lenses
  P.renderLenses = function () {
    // persona cards: lens + the person whose outcomes it represents (real leaders where publicly verified, see Sources)
    $('#lenses').innerHTML = MSK.lenses.map((l) => {
      const who = P.lensLead(l);
      return `<button class="lens-btn lens-card ${MSK.state.lens === l.id ? 'on' : ''}" data-lens="${l.id}" style="--lc:${l.color}" title="${esc(l.name)} lens · ${esc(who.name)}${who.title ? ', ' + esc(who.title) : ''}"><i>${l.icon}</i><span><b>${esc(l.short || l.name)}</b><small>${esc(who.name)}${who.real ? '' : l.id === 'patient' ? ' · patient persona' : ' · persona *'}</small></span></button>`;
    }).join('') + `<button class="lens-map" id="btn-leadermap" title="Leader map: which use cases, scenarios and dashboards matter to each leader">⌖ Leader map</button>`;
  };
  // the lead person for a lens: a verified MSK leader when one is listed (MSK.leaders), otherwise the fictional persona
  P.lensLead = function (l) {
    const real = (MSK.leaders || []).find((x) => x.lens === l.id && x.lead);
    if (real) return { name: real.name, title: real.title, real: true, leader: real };
    const p = MSK.people[l.persona] || {}; return { name: p.name || '', title: p.role || '', real: false };
  };
  P.setLens = function (id) {
    MSK.state.lens = id; document.documentElement.style.setProperty('--lc', MSK.lensMap[id].color);
    P.renderLenses(); P.renderPersona(); P.renderLeft(); MSK.bus.emit('lens', id);
  };

  P.renderPersona = function () {
    const L = MSK.lensMap[MSK.state.lens]; const p = MSK.people[L.persona];
    const box = $('#persona'); box.style.setProperty('--lc', L.color);
    const lead = P.lensLead(L);
    if (lead.real) {
      // a verified MSK leader: only the name, title and source are factual; the lens focus is this demo's framing
      const ini = lead.name.replace(/,.*$/, '').split(/\s+/).filter((w) => /^[A-Z]/.test(w)).map((w) => w[0]).slice(0, 2).join('');
      box.innerHTML = `<div class="persona-row"><div class="avatar" style="background:${L.color}">${esc(ini)}</div><div><div class="cat" style="color:${L.color}">${L.icon} ${esc(L.name)} lens</div><h3>${esc(lead.name)}</h3><div class="role">${esc(lead.title)} <span class="fact-badge" style="font-size:9px;padding:1px 5px;border-radius:5px">verified</span></div></div></div><p>${esc(L.focus)}</p><div class="btnrow" style="margin-top:6px"><button class="pbtn ghost" data-open-leader="${lead.leader.id}">◆ Leader map: use cases & dashboards →</button></div>`;
      box.querySelector('[data-open-leader]').addEventListener('click', () => MSK.explore.open('leaders', { lens: L.id, leader: lead.leader.id }));
      return;
    }
    box.innerHTML = `<div class="persona-row">${P.avatar(p, '')}<div><div class="cat" style="color:${L.color}">${L.icon} ${esc(L.name)} lens</div><h3>${esc(p.name)}</h3><div class="role">${esc(p.role)}</div></div></div><p>${esc(L.focus)}</p>`;
    box.querySelector('.avatar').addEventListener('click', () => MSK.inspector.person(p.id));
    box.querySelector('.avatar').style.cursor = 'pointer';
  };

  // ---------------------------------------------------------------- left body
  P.renderLeft = function () {
    $$('.tabs .tab').forEach((t) => t.classList.toggle('on', t.dataset.tab === MSK.state.leftTab));
    const body = $('#left-body');
    if (MSK.state.leftTab === 'sc') renderScenarios(body);
    else if (MSK.state.leftTab === 'dash') { body.innerHTML = ''; body.appendChild(MSK.dash.lensDashboard(MSK.state.lens)); }
    else renderPeople(body);
  };

  function scenarioList() {
    const lens = MSK.state.lens;
    return MSK.scenarios.filter((s) => MSK.state.showAll || (s.lenses || []).includes(lens))
      .filter((s) => MSK.state.catFilter === 'All' || s.category === MSK.state.catFilter)
      .sort((a, b) => ((a.lenses || [])[0] === lens ? -1 : 0) - ((b.lenses || [])[0] === lens ? -1 : 0));
  }
  function renderScenarios(body) {
    const cats = ['All', ...Array.from(new Set(MSK.scenarios.map((s) => s.category)))];
    const list = scenarioList();
    $('#sc-n').textContent = list.length;
    const cur = MSK.director.current();
    body.innerHTML = `<div class="filter-row">${cats.map((c) => `<button class="chipf ${MSK.state.catFilter === c ? 'on' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}
      <button class="chipf ${MSK.state.showAll ? 'on' : ''}" data-all="1" title="Show scenarios from every lens">${MSK.state.showAll ? 'All lenses' : 'This lens only'}</button></div>
      <div class="pad">${list.length ? list.map((s) => card(s, cur && cur.sc.id === s.id)).join('') : '<div class="empty">No scenarios in this category for this lens.</div>'}</div>`;
  }
  function narratedMinutes(s) {
    const man = MSK.narrationManifest; if (!man) return 0;
    const v = s.variants ? Object.keys(s.variants)[0] : 'main'; const steps = s.variants ? s.variants[v].steps : s.steps;
    let sum = 0; steps.forEach((_, i) => { const e = man.segments[`${s.id}__${v}__${i}`] || {}; const d = e.ryan || e.heart || e.michael; if (d) sum += d + 1; });
    return sum / 60;
  }
  function card(s, active) {
    const o = (s.outcomes || [])[0];
    const mins = narratedMinutes(s);
    const cast = (s.cast || []).slice(0, 6).map((id) => P.avatar(MSK.people[id], 'sm')).join('');
    return `<button class="sc-card ${active ? 'active' : ''}" data-sc="${s.id}">
      ${s.variants ? '<span class="badge-v">with / without</span>' : ''}
      <div class="sc-top"><span class="sc-icon">${s.icon || '•'}</span><span class="cat">${esc(s.category)}</span>${mins ? `<span class="narr-badge" title="Narrated by a premium AI voice">🔊 ${Math.max(1, Math.round(mins))} min</span>` : ''}</div>
      <h4>${esc(s.title)}</h4><p>${esc(s.summary)}</p>
      <div class="sc-meta"><span class="cast-row">${cast}</span>${o ? `<span class="vs">${esc(o.label)}<br><b>${esc(o.with)}</b> vs <s>${esc(o.without)}</s></span>` : ''}</div></button>`;
  }
  function renderPeople(body) {
    const groups = {};
    Object.values(MSK.people).forEach((p) => { const k = MSK.lensMap[p.lens] ? MSK.lensMap[p.lens].name : 'Other'; (groups[k] = groups[k] || []).push(p); });
    const order = MSK.lenses.map((l) => l.name).concat(['Other']);
    body.innerHTML = `<div class="pad">${order.filter((k) => groups[k]).map((k) => `<div class="cat" style="margin:10px 0 6px">${esc(k)} · ${groups[k].length}</div><div class="castlist">${groups[k].map((p) => `<button class="castitem" data-person="${p.id}">${P.avatar(p, 'sm')}<span><b>${esc(p.name)}</b><small>${esc(p.role || '')}</small></span></button>`).join('')}</div>`).join('')}</div>`;
  }

  // ---------------------------------------------------------------- floor strip
  P.renderFloorStrip = function () {
    const f = MSK.world.focus; const box = $('#floorstrip');
    if (!f.b) { box.classList.remove('on'); $('#app').classList.remove('has-floorstrip'); return; }
    const b = MSK.campus.buildingMap[f.b];
    const occupied = new Set(); MSK.actors.map.forEach((a) => { if (a.group.visible) { const lv = MSK.director.levelAt(a.pos); if (lv && lv.b === b.id) occupied.add(lv.level); } });
    const lv = b.levels.slice().sort((x, y) => y.n - x.n);
    box.innerHTML = `<header><b>${esc(b.short)}</b><small>${esc(b.address)}</small></header>
      <div class="fl-list">${lv.map((L) => `<button class="fl ${L.n === f.level ? 'on' : ''} ${occupied.has(L.n) ? 'has' : ''}" data-fl="${L.n}" title="${esc(L.name)}"><b>${esc(L.label)}</b><span>${esc(L.name)}</span></button>`).join('')}</div>
      <footer><button class="tbtn" id="fl-info">Info</button><button class="tbtn" id="fl-exit">Exit ✕</button></footer>`;
    box.classList.add('on'); $('#app').classList.add('has-floorstrip');
    const on = box.querySelector('.fl.on'); if (on) on.scrollIntoView({ block: 'nearest' });
  };

  P.bind = function () {
    $('#lenses').addEventListener('click', (e) => { const b = e.target.closest('[data-lens]'); if (b) P.setLens(b.dataset.lens); });
    $$('.tabs .tab').forEach((t) => t.addEventListener('click', () => { MSK.state.leftTab = t.dataset.tab; P.renderLeft(); }));
    $('#left-body').addEventListener('click', (e) => {
      const c = e.target.closest('[data-cat]'); if (c) { MSK.state.catFilter = c.dataset.cat; P.renderLeft(); return; }
      if (e.target.closest('[data-all]')) { MSK.state.showAll = !MSK.state.showAll; P.renderLeft(); return; }
      const s = e.target.closest('[data-sc]'); if (s) { MSK.inspector.scenario(s.dataset.sc); return; }
      const p = e.target.closest('[data-person]'); if (p) { MSK.inspector.person(p.dataset.person); return; }
      const t = e.target.closest('[data-tech]'); if (t) { MSK.inspector.tech(t.dataset.tech); return; }
    });
    $('#floorstrip').addEventListener('click', (e) => {
      const f = e.target.closest('[data-fl]'); const W = MSK.world;
      if (f) { const n = Number(f.dataset.fl); const b = MSK.campus.buildingMap[W.focus.b]; const L = b.levelMap[n]; W.follow = null; W.focusLevel(b.id, n); W.flyTo({ x: (L.rect.x0 + L.rect.x1) / 2, y: L.y, z: L.zc }, Math.max(150, (L.rect.x1 - L.rect.x0) * 1.15), { polar: 0.78 }); return; }
      if (e.target.id === 'fl-exit') { W.follow = null; W.clearFocus(); const b = MSK.campus.buildingMap[MSK.world.lastB]; if (b) W.flyTo({ x: (b.x0 + b.x1) / 2, y: 30, z: (b.z0 + b.z1) / 2 }, 340); }
      if (e.target.id === 'fl-info') MSK.inspector.building(W.focus.b);
    });
    MSK.bus.on('focus:level', ({ b }) => { if (b) MSK.world.lastB = b; P.renderFloorStrip(); });
    // toolbar
    $('#toolbar').addEventListener('click', (e) => {
      const b = e.target.closest('[data-ov]'); if (!b) return;
      const k = b.dataset.ov; const v = !b.classList.contains('on'); b.classList.toggle('on', v);
      if (k === 'labels') { $('#app').classList.toggle('no-labels', !v); MSK.actors.labelsVisible(v); return; }
      if (k === 'ai') $('#app').classList.toggle('no-ai', !v);
      MSK.world.setOverlay(k, v);
      if (k === 'spaces') { $('#legend-spaces').classList.toggle('on', v); if (v && !MSK.world.focus.b) MSK.ui.toast('Cisco Spaces fabric: ' + U.fmt(MSK.fx.apCount) + ' Wi-Fi 7 access points with BLE/UWB. Open any building to see room-level data.'); }
    });
    $('#spaces-metric').addEventListener('change', (e) => { MSK.world.spacesMetric = e.target.value; $('#lg-metric').textContent = e.target.selectedOptions[0].textContent; if (!MSK.world.overlay.spaces) $('[data-ov="spaces"]').click(); else MSK.world.refreshSpaces(); });
    $('#btn-home').addEventListener('click', () => MSK.world.home());
    $('#btn-left').addEventListener('click', () => { $('#app').classList.toggle('left-collapsed'); });
  };
})();
