/* Right-hand inspector: scenario overview, person story, room (Cisco Spaces), tech, AI site, asset, building. */
(function () {
  const MSK = (window.MSK = window.MSK || {});
  const U = MSK.util; const { esc, $ } = U;
  const I = (MSK.inspector = { stack: [] });
  const av = (p, c) => MSK.panels.avatar(p, c);
  const chip = (id) => MSK.panels.techChip(id);

  function open(crumb, html, entry) {
    $('#right').classList.add('on'); $('#insp-crumb').textContent = crumb; $('#insp').innerHTML = html; $('#insp').scrollTop = 0;
    if (entry) { const last = I.stack[I.stack.length - 1]; if (!last || last.k !== entry.k || last.id !== entry.id) I.stack.push(entry); }
    $('#insp-back').style.visibility = I.stack.length > 1 ? 'visible' : 'hidden';
  }
  I.close = () => { $('#right').classList.remove('on'); I.stack = []; };
  I.back = () => { I.stack.pop(); const e = I.stack.pop(); if (e) I[e.k](e.id); else I.close(); };

  // ---------------------------------------------------------------- scenario
  I.scenario = function (id) {
    const s = MSK.scenarios.find((x) => x.id === id); if (!s) return;
    const lens = MSK.state.lens; const vars = MSK.director.variants(s);
    const steps = s.variants ? Object.values(s.variants)[0].steps : s.steps;
    const aiS = s.aiSummary || [];
    const html = `
      <div class="cat">${s.icon || ''} ${esc(s.category)} · ${esc(s.when || '')}</div>
      <h2>${esc(s.title)}</h2><div class="sub">${esc(s.subtitle || '')}</div>
      <div class="btnrow">${vars.length ? vars.map((v, i) => `<button class="pbtn ${i ? 'red' : ''}" data-play="${s.id}" data-var="${v.id}">▶ ${esc(v.label)}</button>`).join('') : `<button class="pbtn" data-play="${s.id}">▶ Play scenario · ${steps.length} steps</button>`}</div>
      <h5>Summary</h5><p>${esc(s.summary)}</p>
      ${s.problem ? `<h5>Why it matters</h5><p>${esc(s.problem)}</p>` : ''}
      ${(s.outcomes || []).length ? `<h5>Outcomes · with vs without Cisco</h5><div class="cmp"><div class="h">Measure</div><div class="h">With Cisco</div><div class="h">Without</div>${s.outcomes.map((o) => `<div>${esc(o.label)}</div><div class="w">${esc(o.with)}</div><div class="wo">${esc(o.without)}</div>`).join('')}</div>` : ''}
      <h5>People in this story · tap to read their story</h5>
      <div class="castlist">${(s.cast || []).map((pid) => { const p = MSK.people[pid]; return p ? `<button class="castitem" data-person="${pid}">${av(p, 'sm')}<span><b>${esc(p.name)}</b><small>${esc(p.role || '')}</small></span></button>` : ''; }).join('')}</div>
      <h5>Value to hospital outcomes</h5>${(s.value || []).map((v) => `<div class="valcard"><b>${esc(v.title)}</b><p>${esc(v.text)}</p>${v.metric ? `<div class="mv">▲ ${esc(v.metric)}</div>` : ''}</div>`).join('')}
      ${aiS.length ? `<h5>Where AI is used & what it measures</h5>${aiS.map((a) => `<div class="aicard"><b>${esc(a.where)}</b><p>${esc(a.what)}</p><div class="mtags">${(a.metrics || []).map((m) => `<span>${esc(m)}</span>`).join('')}</div></div>`).join('')}` : ''}
      <h5>Cisco technology in play</h5><div class="chips">${(s.tech || []).map(chip).join('')}</div>
      <h5>Steps</h5><div class="list">${steps.map((st, i) => `<div class="li" style="cursor:pointer" data-goto="${i}"><span class="st info">${esc(st.t || i + 1)}</span><span class="grow">${esc(st.title)}${st.lens && st.lens[lens] ? `<small>${esc(MSK.lensMap[lens].name)}: ${esc(st.lens[lens])}</small>` : ''}</span></div>`).join('')}</div>`;
    open('Scenario', html, { k: 'scenario', id });
    $('#insp').querySelectorAll('[data-goto]').forEach((e) => e.addEventListener('click', () => { const cur = MSK.director.current(); if (!cur || cur.sc.id !== s.id) MSK.director.load(s.id); MSK.director.goto(Number(e.dataset.goto), true); }));
  };

  // ---------------------------------------------------------------- person
  I.person = function (id) {
    const p = MSK.people[id]; if (!p) return;
    const L = MSK.lensMap[p.lens];
    const appears = MSK.scenarios.filter((s) => (s.cast || []).includes(id) || JSON.stringify(s.steps || s.variants || []).includes(`"${id}"`));
    const a = MSK.actors.get(id);
    const html = `
      <div style="display:flex;gap:12px;align-items:center">${av(p, 'lg')}<div><h2>${esc(p.name)}</h2><div class="sub">${esc(p.role || '')}${p.age ? ` · ${p.age}` : ''}${p.home ? ` · ${esc(p.home)}` : ''}</div>${L ? `<span class="st info" style="background:color-mix(in srgb, ${L.color} 18%, transparent);color:${L.color}">${L.icon} ${esc(L.name)}</span>` : ''}</div></div>
      <div class="btnrow"><button class="pbtn listen" data-listen="${id}">🔊 Listen to their story</button>${a && a.group.visible ? `<button class="pbtn ghost" data-locate="${id}">⌖ Locate in 3D${a.status ? ` · ${esc(a.status)}` : ''}</button>` : ''}</div>
      <h5>Why they’re here</h5><p>${esc(p.why || '')}</p>
      ${(p.story || []).length ? `<h5>Their story</h5>${p.story.map((t) => `<p>${esc(t)}</p>`).join('')}` : ''}
      ${p.narrator ? `<div class="narrator-box"><div class="lb">◎ Narrator · How Cisco supports ${esc(p.name.split(' ')[0] === 'Dr.' || p.name.startsWith('Capt.') || p.name.startsWith('Officer') ? p.name : p.name.split(' ')[0])}’s journey</div><p>${esc(p.narrator)}</p></div>` : ''}
      ${p.quote ? `<div class="quote">${esc(p.quote)}</div>` : ''}
      ${(p.devices || []).length ? `<h5>Connected devices & identities</h5><div class="chips">${p.devices.map((d) => `<span class="tchip" style="--c:#4f8cff"><i>⌁</i>${esc(d)}</span>`).join('')}</div>` : ''}
      ${(p.cares || []).length ? `<h5>What matters to them</h5><ul>${p.cares.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
      ${appears.length ? `<h5>Appears in</h5><div class="list">${appears.map((s) => `<div class="li" style="cursor:pointer" data-sc="${s.id}"><span class="sc-icon">${s.icon || '•'}</span><span class="grow">${esc(s.title)}<small>${esc(s.category)}</small></span></div>`).join('')}</div>` : ''}`;
    open('Person', html, { k: 'person', id });
  };

  // ---------------------------------------------------------------- room (Cisco Spaces)
  I.room = function (key) {
    const d = MSK.world.roomData(key); if (!d) return;
    const l = MSK.loc(key);
    const occSeries = Array.from({ length: 24 }, (_, h) => MSK.world.roomData(key, h * 60).occ * 100);
    const sites = (MSK.aiSites || []).filter((s) => s.at === key);
    const assetsHere = []; MSK.actors.map.forEach((a) => { if (a.type === 'asset' && a.loc === key) assetsHere.push(a); });
    const peopleHere = []; MSK.actors.map.forEach((a) => { if (a.type === 'person' && a.loc === key && a.group.visible) peopleHere.push(a); });
    const html = `
      <div class="cat" style="color:var(--spaces)">⌖ Cisco Spaces · live room data</div>
      <h2>${esc(d.label)}</h2><div class="sub">${esc(d.sub || '')}</div>
      ${d.status ? `<span class="st ${/Occupied/.test(d.status) ? 'info' : /Dirty/.test(d.status) ? 'warn' : 'ok'}">${esc(d.status)}</span>` : ''}
      <div class="btnrow"><button class="pbtn" data-wayto="${key}">● Blue-dot here from Main Entrance</button></div>
      <h5>Occupancy & environment</h5>
      <div style="display:flex;gap:10px;align-items:center">${MSK.chart.gauge(d.occ * 100, { label: d.people + '/' + d.cap, sub: 'people / capacity', max: 100 })}
      <div class="kv" style="flex:1"><div><small>Temperature</small><b>${d.temp.toFixed(1)} °F</b></div><div><small>Humidity</small><b>${d.hum.toFixed(0)} %RH</b></div><div><small>CO₂</small><b>${d.co2} ppm</b></div><div><small>Noise</small><b>${d.noise} dB</b></div></div></div>
      <h5>Occupancy · last 24 h</h5>${MSK.chart.spark(occSeries, { w: 360, h: 50, color: '#4f8cff', min: 0, max: 100 })}
      <h5>Wireless & location fabric</h5>
      <div class="kv"><div><small>Wi-Fi 7 APs (BLE/UWB)</small><b>${d.aps}</b></div><div><small>Connected clients</small><b>${d.clients}</b></div><div><small>Avg RSSI</small><b>${d.rssi} dBm</b></div><div><small>Client health</small><b>${d.health}%</b></div><div><small>Avg dwell</small><b>${d.dwell} min</b></div>${d.outdoor ? `<div><small>Curb flow</small><b style="font-size:12px">${esc(d.status)}</b></div>` : `<div><small>Last EVS clean</small><b>${Math.floor(d.lastClean / 60)}h ${d.lastClean % 60}m ago</b></div>`}</div>
      <h5>Tagged assets seen here</h5>${(d.assets.length || assetsHere.length) ? `<div class="chips">${assetsHere.map((a) => `<span class="tchip" style="--c:#4f8cff"><i>⌖</i>${esc(a.name)}</span>`).join('')}${d.assets.map((a) => `<span class="tchip" style="--c:#64748b"><i>⌖</i>${esc(a)}</span>`).join('')}</div>` : '<p class="sub">No tagged assets in this room.</p>'}
      ${peopleHere.length ? `<h5>People here now</h5><div class="castlist">${peopleHere.map((a) => `<button class="castitem" data-person="${a.id}">${av(a.person, 'sm')}<span><b>${esc(a.name)}</b><small>${esc(a.status || a.person.role || '')}</small></span></button>`).join('')}</div>` : ''}
      ${sites.length ? `<h5>AI running here</h5>${sites.map((s) => `<div class="aicard" data-ai="${s.id}" style="cursor:pointer"><b>${esc(s.name)}</b><p>${esc(s.does)}</p><div class="mtags">${s.metrics.map((m) => `<span>${esc(m)}</span>`).join('')}</div></div>`).join('')}` : ''}
      <h5>Data path</h5><p class="sub">Spaces location & Meraki MT telemetry → Splunk (data layer) → insight acted on by the owning workflow (Webex Connect, Security, nurse call, ServiceNow) → outcome back into Splunk. Location is consent-based for people; assets are tracked by tag.</p>
      <div class="spl">| tstats latest(occupancy) latest(temp_f) latest(co2) where index=spaces room="${esc(d.label)}" by _time span=5m</div>`;
    open('Room · Cisco Spaces', html, { k: 'room', id: key });
  };

  // ---------------------------------------------------------------- tech
  I.tech = function (id) {
    const t = MSK.tech(id); const layer = MSK.cisco.layers[t.layer] || {};
    const used = MSK.scenarios.filter((s) => (s.tech || []).includes(id));
    const html = `
      <div class="cat" style="color:${layer.color}">${t.icon || ''} ${esc(layer.name || '')}</div>
      <h2>${esc(t.name)}</h2><div class="sub">${esc(t.tagline || '')}</div>${I.useCaseLink(id)}
      <h5>What it is</h5><p>${esc(t.what || '')}</p>
      ${(t.hospital || []).length ? `<h5>In this hospital</h5><ul>${t.hospital.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}
      ${t.ai ? `<h5>How AI is used</h5><div class="aicard"><p style="margin:0">${esc(t.ai)}</p></div>` : ''}
      ${(t.metrics || []).length ? `<h5>Metrics it produces</h5><div class="mtags">${t.metrics.map((m) => `<span>${esc(m)}</span>`).join('')}</div>` : ''}
      ${t.value ? `<h5>Why it matters to hospital outcomes</h5><div class="valcard"><p style="margin:0">${esc(t.value)}</p></div>` : ''}
      ${(t.facts || []).length ? `<h5>Notes</h5><ul>${t.facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
      ${used.length ? `<h5>Scenarios using it (${used.length})</h5><div class="list">${used.map((s) => `<div class="li" style="cursor:pointer" data-sc="${s.id}"><span class="sc-icon">${s.icon || '•'}</span><span class="grow">${esc(s.title)}<small>${esc(s.category)}</small></span></div>`).join('')}</div>` : ''}`;
    open('Cisco technology', html, { k: 'tech', id });
  };

  // ---------------------------------------------------------------- AI site
  I.ai = function (id) {
    const s = (MSK.aiSites || []).find((x) => x.id === id); if (!s) return;
    const series = U.series('ai' + id, 30, 1, 0.25, { trend: 0.01 }).map((v) => v * (s.tokens || 1e6));
    const html = `
      <div class="cat" style="color:var(--ai)">✦ AI in use · ${esc(s.dept)}</div>
      <h2>${esc(s.name)}</h2><div class="sub">${esc(MSK.locLabel(s.at))} · ${esc((MSK.loc(s.at) || {}).sub || '')}</div>
      <div class="btnrow"><button class="pbtn ghost" data-flyto="${s.at}">⌖ Show on map</button><button class="pbtn ghost" data-open="ai">Open AI & Tokenomics</button></div>
      <div class="kv" style="margin-top:10px"><div><small>Runs on</small><b style="font-size:12px;font-family:var(--font)">${esc(s.runs)}</b></div><div><small>Tokens / day</small><b>${s.tokens ? U.compact(s.tokens) : 'n/a (vision/TS)'}</b></div></div>
      <h5>Model</h5><p>${esc(s.model)}</p>
      <h5>What it does</h5><p>${esc(s.does)}</p>
      <h5>Metrics the AI collects</h5><div class="mtags">${s.metrics.map((m) => `<span>${esc(m)}</span>`).join('')}</div>
      ${s.tokens ? `<h5>Token volume · 30 days</h5>${MSK.chart.spark(series, { w: 360, h: 50, color: '#84cc16' })}` : ''}
      <h5>Guardrails & governance</h5><p>${esc(s.guard)}</p>
      <h5>Why it matters</h5><div class="valcard"><p style="margin:0">${esc(s.value)}</p></div>
      <h5>Cisco technology</h5><div class="chips">${chip(s.tech)}${s.runs.includes('AI Factory') ? chip('ai-factory') : ''}${chip('ai-defense')}${chip('splunk-obs')}</div>`;
    open('AI site', html, { k: 'ai', id });
  };

  // ---------------------------------------------------------------- asset
  I.asset = function (id) {
    const a = MSK.actors.get(id); if (!a) return;
    const r = U.rng(id);
    const html = `<div class="cat" style="color:var(--spaces)">⌖ Cisco Spaces · tracked asset</div><h2>${esc(a.name)}</h2>
      <div class="sub">${esc(a.kind)} · ${a.holder ? 'with ' + esc(a.holder.name) : esc(MSK.locLabel(a.loc) || '')}</div>
      <div class="kv"><div><small>Tag</small><b style="font-size:12px">${a.tagged ? 'BLE + UWB' : 'Untagged'}</b></div><div><small>Location accuracy</small><b>${a.tagged ? '< 1 m' : 'n/a'}</b></div><div><small>Utilization (30 d)</small><b>${Math.round(40 + r() * 45)}%</b></div><div><small>Last seen</small><b>just now</b></div><div><small>PM due</small><b>${Math.round(r() * 90)} d</b></div><div><small>Battery</small><b>${Math.round(60 + r() * 40)}%</b></div></div>
      <div class="btnrow"><button class="pbtn" data-flyactor="${id}">⌖ Locate</button></div>`;
    open('Asset', html, { k: 'asset', id });
  };

  // ---------------------------------------------------------------- building
  I.useCaseLink = (id) => `<div class="btnrow"><button class="pbtn" data-explore-tech="${id}">⌖ Use cases & scenarios with ${MSK.util.esc(MSK.techShort(id))} →</button></div>`;
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-explore-tech]'); if (b) MSK.explore.open('explore', { tech: b.dataset.exploreTech }); });
  I.building = function (id) {
    const b = MSK.campus.buildingMap[id]; if (!b) return;
    const rooms = b.levels.reduce((n, L) => n + L.rooms.length, 0);
    const sites = (MSK.aiSites || []).filter((s) => (MSK.loc(s.at) || {}).b === id);
    const html = `<div class="cat" style="color:var(--cisco)">MSK building</div><h2>${esc(b.name)}</h2><div class="sub">${esc(b.address)}</div>
      <p>${esc(b.blurb)}</p>
      <div class="kv"><div><small>Floors modeled</small><b>${b.levels.length}</b></div><div><small>Rooms & spaces</small><b>${rooms}</b></div><div><small>Entrances</small><b>${b.entrances.length}</b></div><div><small>Elevator cores</small><b>${b.cores.length}</b></div></div>
      ${sites.length ? `<h5 id="ai-in-b">AI running in this building (${sites.length})</h5>${sites.map((s) => `<div class="aicard" data-ai="${s.id}" style="cursor:pointer"><b>✦ ${esc(s.name)}</b><p>${esc(MSK.locLabel(s.at))} · ${esc(s.runs)}</p><div class="mtags">${s.metrics.map((m) => `<span>${esc(m)}</span>`).join('')}</div></div>`).join('')}` : ''}
      <h5>Entrances</h5><ul>${b.entrances.map((e) => `<li>${esc(e.label)}</li>`).join('')}</ul>
      <h5>Floors · tap to open</h5><div class="list">${b.levels.slice().sort((x, y) => y.n - x.n).map((L) => `<div class="li" style="cursor:pointer" data-level="${b.id}/${L.n}"><span class="st info" style="font-family:var(--mono)">${esc(L.label)}</span><span class="grow">${esc(L.name)}<small>${L.rooms.length} spaces</small></span></div>`).join('')}</div>`;
    open('Building', html, { k: 'building', id });
  };

  I.bind = function () {
    MSK.bus.on('narrator:state', () => {
      document.querySelectorAll('[data-listen]').forEach((b) => {
        const on = MSK.narrator.personId === b.dataset.listen && MSK.narrator.state().mode;
        b.textContent = on ? '■ Stop the story' : '🔊 Listen to their story'; b.classList.toggle('red', !!on);
      });
    });
    $('#insp-close').addEventListener('click', I.close);
    $('#insp-back').addEventListener('click', I.back);
    $('#insp').addEventListener('click', (e) => {
      const t = e.target.closest('[data-tech]'); if (t) return I.tech(t.dataset.tech);
      const p = e.target.closest('[data-person]'); if (p) return I.person(p.dataset.person);
      const sc = e.target.closest('[data-sc]'); if (sc) return I.scenario(sc.dataset.sc);
      const pl = e.target.closest('[data-play]'); if (pl) { MSK.director.load(pl.dataset.play, pl.dataset.var); return; }
      const ls = e.target.closest('[data-listen]'); if (ls) { MSK.narrator.playPerson(ls.dataset.listen); return; }
      const ai = e.target.closest('[data-ai]'); if (ai) return I.ai(ai.dataset.ai);
      const loc = e.target.closest('[data-locate],[data-flyactor]'); if (loc) { const a = MSK.actors.get(loc.dataset.locate || loc.dataset.flyactor); if (a) { const lv = MSK.director.levelAt(a.pos); if (lv) MSK.world.focusLevel(lv.b, lv.level); else MSK.world.clearFocus(); MSK.world.flyTo(a.pos, 70); } return; }
      const fly = e.target.closest('[data-flyto]'); if (fly) { MSK.ui.flyToKey(fly.dataset.flyto); return; }
      const op = e.target.closest('[data-open]'); if (op) { MSK.dash.open(op.dataset.open); return; }
      const wt = e.target.closest('[data-wayto]'); if (wt) { MSK.dash.wayfindTo('MH/1/LOBBY', wt.dataset.wayto); return; }
      const lv = e.target.closest('[data-level]'); if (lv) { MSK.ui.flyToKey(lv.dataset.level); return; }
    });
  };
})();
