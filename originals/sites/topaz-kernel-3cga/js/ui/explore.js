/* Explorer: use cases & scenarios filtered by technology, vertical and leader; the per-leader map; and the AI Canvas view of the
   infrastructure Cisco Cloud Control manages with the AI workloads running on it. Opened from the top bar (⌖ Explore), the persona
   bar (Leader map) and any technology card. */
(function () {
  const MSK = (window.MSK = window.MSK || {});
  const U = MSK.util; const { $, esc } = U;
  const EX = (MSK.explore = {});
  const F = { tech: new Set(), lens: null, leader: null, run: null, cat: null, q: '' };
  let tab = 'explore';

  // ---------------------------------------------------------------- derived links
  let scTechCache = null;
  EX.scenarioTech = function (s) {
    if (!scTechCache) {
      scTechCache = {};
      MSK.scenarios.forEach((sc) => {
        const t = new Set(sc.tech || []);
        const steps = sc.variants ? Object.values(sc.variants).flatMap((v) => v.steps) : sc.steps;
        steps.forEach((st) => { (st.tech || []).forEach((x) => t.add(x)); (st.actions || []).forEach((a) => { if (a.source) t.add(a.source); if (a.packet && a.tech) t.add(a.tech); }); (st.ai || []).forEach((x) => x && x.tech && t.add(x.tech)); });
        (sc.aiSummary || []).forEach((x) => x && x.tech && t.add(x.tech));
        MSK.useCases.filter((u) => u.scenarios.includes(sc.id)).forEach((u) => u.tech.forEach((x) => t.add(x)));
        scTechCache[sc.id] = [...t].filter((x) => MSK.cisco.map[x]);
      });
    }
    return scTechCache[s.id || s] || [];
  };
  const leaders = () => {
    const real = MSK.leaders || [];
    // verticals without a publicly verified leader fall back to the fictional persona (marked as a composite)
    const fill = MSK.lenses.filter((l) => !real.some((x) => x.lens === l.id)).map((l) => { const p = MSK.people[l.persona] || {}; return { id: 'persona-' + l.id, name: p.name, title: p.role, lens: l.id, lead: true, roles: l.roles || [], composite: true }; });
    return [...real, ...fill];
  };
  EX.leaders = leaders;
  const inLens = (ld, lens) => ld.lens === lens || (ld.also || []).includes(lens);
  EX.inLens = inLens;
  EX.useCasesFor = (ld) => (ld.useCases ? MSK.useCases.filter((u) => ld.useCases.includes(u.id)) : MSK.useCases.filter((u) => u.roles.some((r) => (ld.roles || []).includes(r)) || (ld.composite && u.lenses.includes(ld.lens))));
  EX.scenariosFor = (ld) => { const ids = new Set(EX.useCasesFor(ld).flatMap((u) => u.scenarios)); MSK.scenarios.forEach((s) => { if ((s.lenses || [])[0] === ld.lens) ids.add(s.id); }); return MSK.scenarios.filter((s) => ids.has(s.id) && s.id !== 'campus-tour'); };
  EX.dashboardsFor = (ld) => {
    const n = {}; EX.useCasesFor(ld).forEach((u) => u.dashboards.forEach((d) => (n[d] = (n[d] || 0) + 1)));
    n['lens:' + ld.lens] = (n['lens:' + ld.lens] || 0) + 2;
    return Object.entries(n).sort((a, b) => b[1] - a[1]).map(([k, c]) => ({ key: k, count: c, ...(MSK.dashboardKeys[k] || { name: k, icon: '▤' }) }));
  };

  // ---------------------------------------------------------------- filtering
  function matchUC(u) {
    if (F.tech.size && ![...F.tech].every((t) => u.tech.includes(t))) return false;
    if (F.lens && !u.lenses.includes(F.lens)) return false;
    if (F.leader) { const ld = leaders().find((x) => x.id === F.leader); if (ld && !EX.useCasesFor(ld).includes(u)) return false; }
    if (F.run && u.run !== F.run) return false;
    if (F.cat && u.cat !== F.cat) return false;
    if (F.q && !(u.name + ' ' + u.outcome + ' ' + u.how).toLowerCase().includes(F.q)) return false;
    return true;
  }
  function matchSC(s) {
    if (s.id === 'campus-tour') return false;
    const t = EX.scenarioTech(s);
    if (F.tech.size && ![...F.tech].every((x) => t.includes(x))) return false;
    if (F.lens && !(s.lenses || []).includes(F.lens)) return false;
    if (F.leader) { const ld = leaders().find((x) => x.id === F.leader); if (ld && !EX.scenariosFor(ld).includes(s)) return false; }
    if (F.run || F.cat) { const ucs = MSK.useCases.filter((u) => u.scenarios.includes(s.id) && (!F.run || u.run === F.run) && (!F.cat || u.cat === F.cat)); if (!ucs.length) return false; }
    if (F.q && !(s.title + ' ' + (s.summary || '')).toLowerCase().includes(F.q)) return false;
    return true;
  }

  // ---------------------------------------------------------------- building blocks
  const chip = (id, on) => { const t = MSK.tech(id); return `<button class="xt ${on ? 'on' : ''}" data-tf="${id}" style="--c:${MSK.techColor(id)}" title="${esc(t.name)}"><i>${t.icon || '•'}</i>${esc(MSK.techShort(id))}</button>`; };
  const runBadge = (r) => `<span class="xr r-${r}">${r === 'edge' ? '⬢ ' : r === 'onprem' ? '▣ ' : r === 'device' ? '◫ ' : '☁ '}${esc(MSK.runLabels[r])}</span>`;
  const storyBtns = (scid) => {
    const S = MSK.stories; const j = S.JOURNEYS.find((x) => x.scenario === scid); const kind = j ? 'journey' : S.SCENARIO_STORIES[scid] ? 'scenario' : null; const id = j ? j.id : scid;
    const ready = kind && MSK.story.ready(kind, id, 'compare');
    return `${ready ? `<button class="pbtn" data-story="${kind}:${id}:with">▶ Story</button><button class="pbtn red" data-story="${kind}:${id}:without">▶ Without Cisco</button>` : ''}<button class="pbtn ghost" data-walk="${scid}">🚶 Walk it</button>`;
  };
  const leaderNames = (u) => leaders().filter((ld) => EX.useCasesFor(ld).includes(u)).map((ld) => `<span class="xl ${ld.composite ? 'comp' : ''}" data-ld="${ld.id}">${esc(ld.name)}</span>`).join('');
  function ucCard(u) {
    const scs = u.scenarios.map((id) => MSK.scenarios.find((s) => s.id === id)).filter(Boolean);
    return `<div class="xcard uc c-${u.cat}"><div class="xh"><span class="xcat">${esc(MSK.catLabels[u.cat])}</span>${runBadge(u.run)}</div>
      <b>${esc(u.name)}</b><p class="xo">${esc(u.outcome)}</p><p class="xw">${esc(u.how)}</p>
      <div class="xchips">${u.tech.map((t) => chip(t, F.tech.has(t))).join('')}</div>
      ${scs.length ? `<div class="xsub">In the stories: ${scs.map((s) => `<a data-scn="${s.id}">${esc(s.title)}</a>`).join(' · ')}</div>` : '<div class="xsub">Not yet in a story.</div>'}
      ${u.evidence ? `<div class="xev"><span class="fact-badge">Sourced</span> ${esc(u.evidence.text)} <a href="${esc(u.evidence.url)}" target="_blank" rel="noopener">source ↗</a></div>` : '<div class="xev"><span class="gen-badge">Illustrative</span> Generated for this demo; not a confirmed MSK deployment.</div>'}
      <div class="xsub">Aligned leaders: ${leaderNames(u) || '—'}</div></div>`;
  }
  function scCard(s) {
    const t = EX.scenarioTech(s); const ucs = MSK.useCases.filter((u) => u.scenarios.includes(s.id));
    return `<div class="xcard sc" id="xs-${s.id}"><div class="xh"><span class="xcat">${esc(s.category || 'Scenario')}</span><span class="xr">${t.length} technologies</span></div>
      <b>${s.icon || ''} ${esc(s.title)}</b><p class="xw">${esc((s.summary || '').split('. ').slice(0, 2).join('. ').replace(/\.?$/, '.'))}</p>
      <div class="xchips">${t.map((x) => chip(x, F.tech.has(x))).join('')}</div>
      ${ucs.length ? `<div class="xsub">AI use cases: ${ucs.map((u) => esc(u.name)).join(' · ')}</div>` : ''}
      <div class="jp-play">${storyBtns(s.id)}</div></div>`;
  }

  // ---------------------------------------------------------------- tabs
  function renderExplore() {
    const allTech = [...new Set(MSK.useCases.flatMap((u) => u.tech).concat(MSK.scenarios.flatMap((s) => EX.scenarioTech(s))))];
    const layers = Object.keys(MSK.cisco.layers);
    const ucs = MSK.useCases.filter(matchUC), scs = MSK.scenarios.filter(matchSC);
    const lds = leaders().filter((ld) => !F.lens || inLens(ld, F.lens));
    const active = F.tech.size + (F.lens ? 1 : 0) + (F.leader ? 1 : 0) + (F.run ? 1 : 0) + (F.cat ? 1 : 0) + (F.q ? 1 : 0);
    return `<div class="xgrid"><aside class="xf">
        <input class="xq" id="xq" placeholder="Search use cases and scenarios" value="${esc(F.q)}">
        <h6>Vertical</h6><div class="xchips">${MSK.lenses.map((l) => `<button class="xv ${F.lens === l.id ? 'on' : ''}" data-lf="${l.id}" style="--lc:${l.color}">${l.icon} ${esc(l.short || l.name)}</button>`).join('')}</div>
        <h6>Leader${F.lens ? '' : ' (pick a vertical to narrow)'}</h6><div class="xchips">${lds.map((ld) => `<button class="xv ${F.leader === ld.id ? 'on' : ''}" data-ldf="${ld.id}" title="${esc(ld.title || '')}">${esc(ld.name)}${ld.composite ? ' *' : ''}</button>`).join('')}</div>
        <h6>Where the AI runs</h6><div class="xchips">${Object.keys(MSK.runLabels).map((r) => `<button class="xv ${F.run === r ? 'on' : ''}" data-rf="${r}">${esc(MSK.runLabels[r])}</button>`).join('')}</div>
        <h6>Category</h6><div class="xchips">${Object.keys(MSK.catLabels).map((c) => `<button class="xv ${F.cat === c ? 'on' : ''}" data-cf="${c}">${esc(MSK.catLabels[c])}</button>`).join('')}</div>
        <h6>Technology <small>(choose several to narrow)</small></h6>${layers.map((ly) => { const ts = allTech.filter((t) => (MSK.cisco.map[t] || {}).layer === ly); return ts.length ? `<div class="xly"><span style="color:${MSK.cisco.layers[ly].color}">${esc(MSK.cisco.layers[ly].name)}</span><div class="xchips">${ts.map((t) => chip(t, F.tech.has(t))).join('')}</div></div>` : ''; }).join('')}
        ${active ? '<button class="pbtn ghost" id="xclear" style="margin-top:10px">Clear all filters</button>' : ''}
        <div class="xnote">* No publicly verified leader for this vertical yet; a fictional composite persona stands in. See Sources.</div>
      </aside><section class="xres">
        <div class="xcount"><b>${ucs.length}</b> AI use cases · <b>${scs.length}</b> scenarios${active ? ' match your filters' : ''}</div>
        <h4>AI use cases</h4><div class="xcards">${ucs.map(ucCard).join('') || '<div class="empty">No use case matches every filter. Remove one to widen the search.</div>'}</div>
        <h4>Scenarios & stories</h4><div class="xcards">${scs.map(scCard).join('') || '<div class="empty">No scenario matches every filter.</div>'}</div>
      </section></div>`;
  }
  function renderLeaders() {
    const lens = F.lens || MSK.state.lens; const lds = leaders().filter((ld) => inLens(ld, lens)).sort((a, b) => Number(!!(b.lead && b.lens === lens)) - Number(!!(a.lead && a.lens === lens)));
    const ld = lds.find((x) => x.id === F.leader) || lds[0];
    const L = MSK.lensMap[lens];
    let h = `<div class="xlv">${MSK.lenses.map((l) => `<button class="xv ${l.id === lens ? 'on' : ''}" data-lv="${l.id}" style="--lc:${l.color}">${l.icon} ${esc(l.short || l.name)}</button>`).join('')}</div>
      <div class="xlgrid"><aside class="xll">${lds.map((x) => `<button class="xlc ${ld && x.id === ld.id ? 'on' : ''}" data-lpick="${x.id}" style="--lc:${L.color}"><b>${esc(x.name)}</b><small>${esc(x.title || '')}</small>${x.composite ? '<em class="gen">Fictional composite</em>' : '<em class="fact">Verified name & title</em>'}</button>`).join('')}</aside>`;
    if (ld) {
      const ucs = EX.useCasesFor(ld), scs = EX.scenariosFor(ld), ds = EX.dashboardsFor(ld);
      const techs = [...new Set(ucs.flatMap((u) => u.tech))];
      h += `<section class="xld"><div class="xldh" style="--lc:${L.color}"><div><div class="cat" style="color:${L.color}">${L.icon} ${esc(L.name)}</div><h3>${esc(ld.name)}</h3><div class="sub">${esc(ld.title || '')}</div>
          ${ld.source ? `<div class="xsrc"><span class="fact-badge">Verified name & title</span> Source: <a href="${esc(ld.source.url)}" target="_blank" rel="noopener">${esc(ld.source.label || ld.source.url)}</a>${ld.source.date ? ' · ' + esc(ld.source.date) : ''}</div>` : '<div class="xsrc">Fictional composite persona. No real person is depicted.</div>'}</div>
          <div class="xstat"><span><b>${ds.length}</b> dashboards</span><span><b>${ucs.length}</b> use cases</span><span><b>${scs.length}</b> scenarios</span></div></div>
        <p class="xgen">Outcomes this role typically owns <em>(our illustrative alignment, not a statement by ${esc(ld.composite ? 'this persona' : ld.name)})</em>: ${esc(ld.focus || L.focus)}</p>
        <h4>Dashboards that matter most</h4><div class="xdash">${ds.map((d, i) => `<button class="xdb" data-dash="${d.key}"><i>${d.icon}</i><span><b>${esc(d.name)}</b><small>${d.count} aligned use case${d.count === 1 ? '' : 's'}${i === 0 ? ' · start here' : ''}</small></span></button>`).join('')}</div>
        <h4>Aligned AI use cases</h4><div class="xmini">${ucs.map((u) => `<div class="xm c-${u.cat}"><b>${esc(u.name)}</b><small>${esc(u.outcome)}</small><div>${runBadge(u.run)}</div></div>`).join('')}</div>
        <h4>Scenarios & stories</h4><div class="xmini">${scs.map((s) => `<div class="xm"><b>${s.icon || ''} ${esc(s.title)}</b><div class="jp-play">${storyBtns(s.id)}</div></div>`).join('')}</div>
        <h4>Technology behind these outcomes</h4><div class="xchips">${techs.map((t) => chip(t, false)).join('')}</div></section>`;
    }
    return h + '</div>';
  }
  // AI Canvas view: the infrastructure Cisco Cloud Control manages, and the AI workloads running on each piece of it
  function renderCanvas() {
    const loc = (key) => { const l = MSK.loc(key); return l ? l.label : key; };
    const edge = {}; MSK.useCases.filter((u) => u.run === 'edge').forEach((u) => { (edge[u.site] = edge[u.site] || []).push(u); });
    const onprem = MSK.useCases.filter((u) => u.run === 'onprem'); const cloud = MSK.useCases.filter((u) => u.run === 'cloud' || u.run === 'device');
    const node = (title, sub, ucs, tech, health, managed) => `<div class="xnode"><div class="xnh"><span class="dot" style="background:var(--ok)"></span><b>${esc(title)}</b><span class="xr">${esc(managed)}</span></div><small>${esc(sub)}</small>
      <div class="xnm">${health.map(([k, v]) => `<span><small>${esc(k)}</small><b>${esc(v)}</b></span>`).join('')}</div>
      <div class="xchips">${tech.map((t) => chip(t, F.tech.has(t))).join('')}</div>
      <div class="xwl">${ucs.map((u) => `<span class="c-${u.cat}">${esc(u.name)}</span>`).join('')}</div></div>`;
    return `<div class="xcanvas"><div class="xch"><b>◎ AI Canvas · Cisco Cloud Control</b><span>The infrastructure the IT, network and security teams see in Cloud Control (the network and security fabric directly; Unified Edge and AI PODs through its Intersight integration), and the AI workloads running on each. In AI Canvas, engineers and AI agents investigate any of it together. Inventory, health and numbers are illustrative.</span></div>
      <h4>⬢ Edge · Cisco Unified Edge (inference next to the patient)</h4><div class="xnodes">${Object.entries(edge).map(([site, ucs], i) => node(`Unified Edge node · ${loc(site)}`, 'Compute, networking, storage and security in one chassis on the unit', ucs, ['unified-edge', 'ise', 'wifi7'], [['Inference p95', `${38 + i * 9} ms`], ['GPU', `${41 + i * 13}%`], ['Model', 'current']], 'Intersight · in Cloud Control')).join('')}</div>
      <h4>▣ On-prem · Secure AI Factory (PHI-heavy models in the Zuckerman data center)</h4><div class="xnodes">${node('AI POD cluster · Zuckerman B1', 'UCS GPU servers on a Nexus Hyperfabric AI network, guarded by AI Defense', onprem, ['ai-factory', 'nexus', 'ai-defense', 'splunk-obs'], [['GPU utilization', '71%'], ['Tokens / sec', '41K'], ['On-prem token share', '68%']], 'Intersight · in Cloud Control')}</div>
      <h4>⌁ Network & security fabric the AI depends on</h4><div class="xnodes">${node('Campus Wi-Fi 7 & switching', '4,000+ access points; IoT and BLE radios feed Cisco Spaces', MSK.useCases.filter((u) => u.tech.includes('wifi7')), ['wifi7', 'ise', 'cyber-vision'], [['Client health', '98%'], ['IoMT profiled', '40,212']], 'Managed in Cloud Control')}
        ${node('WAN, carriers & paths to cloud AI', 'Catalyst SD-WAN with ThousandEyes tests to Epic hosting, Webex and AI endpoints', MSK.useCases.filter((u) => u.tech.some((t) => ['sdwan', 'thousandeyes'].includes(t))), ['sdwan', 'thousandeyes', 'secure-access'], [['Path loss', '0.0%'], ['Epic RTT', '18 ms']], 'Managed in Cloud Control')}</div>
      <h4>☁ Cloud services observed alongside (data flows into Splunk)</h4><div class="xnodes">${node('Splunk, Webex & Cisco Spaces clouds', 'Signals and outcomes from every workflow land in Splunk', cloud, ['splunk', 'webex-cc', 'spaces', 'meraki-mv'], [['Events / sec', '182K'], ['Workflows measured', String(cloud.length)]], 'Observed in Splunk')}</div></div>`;
  }

  // ---------------------------------------------------------------- open & bind
  EX.open = function (t, opts = {}) {
    if (MSK.story && MSK.story.active) MSK.story.stop();
    tab = t || tab;
    if (opts.tech) { F.tech = new Set([opts.tech]); F.lens = null; F.leader = null; }
    if (opts.lens) { F.lens = opts.lens; F.leader = opts.leader || null; }
    if (opts.reset) { F.tech.clear(); F.lens = null; F.leader = null; F.run = null; F.cat = null; F.q = ''; }
    $('#modal-title').textContent = '⌖ Explore: AI use cases, technology & leaders';
    $('#modal-sub').textContent = 'Every use case and scenario tied to the technology behind it · illustrative, see Sources for what is factual';
    render(); $('#modal').classList.add('on');
  };
  function render() {
    const body = $('#modal-body');
    body.innerHTML = `<div class="jp-tabs"><span data-xt="explore" class="${tab === 'explore' ? 'on' : ''}">⌖ Use cases & scenarios</span><span data-xt="leaders" class="${tab === 'leaders' ? 'on' : ''}">◆ Leader map</span><span data-xt="canvas" class="${tab === 'canvas' ? 'on' : ''}">◎ AI Canvas · Cloud Control</span></div>
      ${tab === 'explore' ? renderExplore() : tab === 'leaders' ? renderLeaders() : renderCanvas()}`;
    body.querySelectorAll('[data-xt]').forEach((n) => (n.onclick = () => { tab = n.dataset.xt; render(); }));
    body.querySelectorAll('[data-tf]').forEach((n) => (n.onclick = () => { const t = n.dataset.tf; F.tech.has(t) ? F.tech.delete(t) : F.tech.add(t); tab = 'explore'; render(); }));
    body.querySelectorAll('[data-lf]').forEach((n) => (n.onclick = () => { F.lens = F.lens === n.dataset.lf ? null : n.dataset.lf; F.leader = null; render(); }));
    body.querySelectorAll('[data-ldf]').forEach((n) => (n.onclick = () => { F.leader = F.leader === n.dataset.ldf ? null : n.dataset.ldf; render(); }));
    body.querySelectorAll('[data-rf]').forEach((n) => (n.onclick = () => { F.run = F.run === n.dataset.rf ? null : n.dataset.rf; render(); }));
    body.querySelectorAll('[data-cf]').forEach((n) => (n.onclick = () => { F.cat = F.cat === n.dataset.cf ? null : n.dataset.cf; render(); }));
    body.querySelectorAll('[data-lv]').forEach((n) => (n.onclick = () => { F.lens = n.dataset.lv; F.leader = null; render(); }));
    body.querySelectorAll('[data-lpick]').forEach((n) => (n.onclick = () => { F.leader = n.dataset.lpick; render(); }));
    body.querySelectorAll('[data-ld]').forEach((n) => (n.onclick = () => { const ld = leaders().find((x) => x.id === n.dataset.ld); F.lens = ld.lens; F.leader = ld.id; tab = 'leaders'; render(); }));
    body.querySelectorAll('[data-scn]').forEach((n) => (n.onclick = () => { const el = document.getElementById('xs-' + n.dataset.scn); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }));
    body.querySelectorAll('[data-story]').forEach((n) => (n.onclick = () => { const [k, id, m] = n.dataset.story.split(':'); MSK.story.start(k, id, m); }));
    body.querySelectorAll('[data-walk]').forEach((n) => (n.onclick = () => { MSK.dash.close(); MSK.director.load(n.dataset.walk); }));
    body.querySelectorAll('[data-dash]').forEach((n) => (n.onclick = () => { const k = n.dataset.dash;
      if (k === 'canvas') { tab = 'canvas'; return render(); }
      if (k.startsWith('lens:')) { MSK.dash.close(); MSK.state.leftTab = 'dash'; MSK.panels.setLens(k.slice(5)); $('#app').classList.remove('left-collapsed'); return; }
      MSK.dash.open(k); }));
    const xc = body.querySelector('#xclear'); if (xc) xc.onclick = () => { F.tech.clear(); F.lens = null; F.leader = null; F.run = null; F.cat = null; F.q = ''; render(); };
    const q = body.querySelector('#xq'); if (q) { q.oninput = () => { F.q = q.value.trim().toLowerCase(); const pos = q.selectionStart; render(); const q2 = $('#modal-body #xq'); q2.focus(); q2.setSelectionRange(pos, pos); }; }
  }
  EX.bind = function () {
    $('#btn-explore').addEventListener('click', () => EX.open('explore'));
    document.addEventListener('click', (e) => { if (e.target.closest('#btn-leadermap')) EX.open('leaders', { lens: MSK.state.lens }); });
  };
})();
