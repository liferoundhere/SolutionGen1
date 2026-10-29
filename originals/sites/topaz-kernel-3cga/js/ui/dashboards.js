/* Lens dashboards (left panel), full-screen dashboards (Leadership Command, AI & Tokenomics, Splunk Ops), Cisco stack library, wayfinding, help. */
(function () {
  const MSK = (window.MSK = window.MSK || {});
  const U = MSK.util; const { esc, $ } = U; const C = MSK.chart;
  const DB = (MSK.dash = {});
  const src = (id) => `<span class="src-tag" style="background:color-mix(in srgb, ${MSK.techColor(id)} 18%, transparent);color:${MSK.techColor(id)}">${esc(MSK.techShort(id))}</span>`;
  const card = (title, body, tag, link) => `<div class="card"><h5><span>${title}</span><span>${tag || ''}${link ? ` <a data-open="${link[0]}">${link[1]} →</a>` : ''}</span></h5>${body}</div>`;
  const toneVar = (t) => (t === 'ok' ? 'var(--ok)' : t === 'warn' ? 'var(--warn)' : t === 'crit' ? 'var(--crit)' : 'var(--info)');
  const tiles = (list) => `<div class="tiles">${list.map((k) => `<div class="tile" style="--tc:${toneVar(k.tone)}"><small>${esc(k.l)}</small><b>${esc(k.v)}</b><em>${esc(k.d || '')}</em>${k.s ? C.spark(k.s, { w: 64, h: 22, color: toneVar(k.tone) }) : ''}</div>`).join('')}</div>`;
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // ---------------------------------------------------------------- lens dashboards (compact)
  DB.lensDashboard = function (lens) {
    const box = U.el('div', 'dash'); let h = tiles(MSK.lensKPIs[lens] || []);
    const LD = MSK.leadership;
    if (lens === 'leadership') {
      h += card('Priority milestones', `<div class="list">${LD.milestones.slice(0, 7).map((m) => `<div class="li"><span class="grow">${esc(m.name)}<small>${esc(m.owner)} · ${esc(m.target)}</small><div class="prog"><i style="width:${m.pct}%;background:${m.status === 'at-risk' ? 'var(--warn)' : 'var(--ok)'}"></i></div></span><span class="st ${m.status}">${m.status.replace('-', ' ')}</span></div>`).join('')}</div>`, src('splunk'), ['lead', 'Command']);
      h += card('AI insights for today', LD.insights.slice(0, 3).map((i) => `<div class="insight"><b>${i.icon} ${esc(i.title)}</b><p>${esc(i.text)}</p><div class="row">${i.src.map(src).join('')}<span class="conf">conf ${i.conf}</span></div></div>`).join(''), src('splunk'));
      h += card('Lines of business', `<div class="list">${LD.lob.map((l) => `<div class="li"><span class="grow">${esc(l.name)}<small>${esc(l.sub)}</small></span><b style="font-family:var(--mono);font-size:11.5px">${esc(l.kpi)}</b></div>`).join('')}</div>`);
    } else if (lens === 'hospital') {
      const units = ['7 Gyn/Surg', '8 Thoracic', '9 MSK Kids', '11 GI', '12 Urology', '14 Med Onc', '15 Leukemia', '17 BMT'];
      h += card('Room wait by unit (min) · today vs baseline', C.bars(units.map((u, i) => ({ label: u, value: 22 + ((i * 37) % 41), ghost: 80 + ((i * 23) % 60), color: '#a78bfa' })), { fmt: (v) => v.toFixed(0) }), src('splunk'));
      h += card('Admissions vs discharges · forecast (24 h)', C.lines([{ name: 'Admissions', values: U.series('adm', 24, 9, 6, { season: 1, min: 0 }), color: '#a78bfa', area: true }, { name: 'Discharges', values: U.series('dis', 24, 8, 7, { season: 1.2, min: 0 }), color: '#34d399' }], { h: 150, xlabels: ['00', '06', '12', '18', '23'], marker: 10 }), src('splunk'), ['splunk', 'Splunk Ops']);
      h += card('EVS queue (Spaces-detected vacates)', `<div class="list">${[['1214', 'Urology', 'Admission waiting (UCC)', 'crit'], ['1608', 'Lymphoma', 'Clean in progress · Grace', 'warn'], ['1103', 'GI', 'Queued · 6 min', 'info'], ['717', 'Gyn', 'Queued · 11 min', 'info']].map(([r, u, s, t]) => `<div class="li"><span class="dot" style="background:${toneVar(t)}"></span><span class="grow">Room ${r} · ${u}<small>${s}</small></span></div>`).join('')}</div>`, src('spaces'));
    } else if (lens === 'clinical') {
      h += card('Nursing minutes searching per shift', C.bars([{ label: 'Without Spaces', value: 38, color: '#f87171' }, { label: 'With Spaces', value: 6, color: '#34d399' }], { fmt: (v) => v + ' min' }) + `<p class="sub" style="margin:8px 0 0">≈ 32 min per nurse per shift returned to patients (illustrative).</p>`, src('spaces'));
      h += card('First-case on-time starts', C.lines([{ name: 'On-time %', values: [78, 79, 81, 83, 84, 86, 88, 89, 90, 91, 91, 91], color: '#34d399', area: true }], { h: 130, min: 60, max: 100, xlabels: ['Nov', 'Feb', 'May', 'Aug', 'Oct'], fmt: (v) => v.toFixed(0) + '%' }), src('splunk'));
      h += card('At-risk patients (Spaces wristbands)', `<div class="list">${[['Harold Bennett · 1406', 'Elopement risk · in room', 'ok'], ['Room 1712 · BMT', 'Fall risk · bed-exit armed', 'info'], ['Room 918 · MSK Kids', 'Infant/child security tag', 'info'], ['Room 1903', 'Elopement risk · family present', 'ok']].map(([a, b, t]) => `<div class="li"><span class="dot" style="background:${toneVar(t)}"></span><span class="grow">${a}<small>${b}</small></span></div>`).join('')}</div>`, src('spaces'));
    } else if (lens === 'network') {
      const svc = [['Epic Inpatient (Hyperspace)', 99], ['Epic OpTime', 98], ['PACS / Imaging', 97], ['Webex Contact Center', 99], ['MyChart', 98], ['Nurse call & badges', 100], ['Pharmacy dispensing', 96], ['Cisco Spaces', 99]];
      h += card('Splunk ITSI · clinical service health', `<div class="list">${svc.map(([n, v]) => `<div class="li"><span class="dot" style="background:${v >= 98 ? 'var(--ok)' : 'var(--warn)'}"></span><span class="grow">${n}</span><b style="font-family:var(--mono)">${v}</b></div>`).join('')}</div>`, src('splunk-itsi'));
      const paths = [['Epic hosting (Carrier A)', '18 ms', '0.0%', 'ok'], ['Epic hosting (Carrier B)', '32 ms', '0.1%', 'warn'], ['Webex media', '21 ms', '0.0%', 'ok'], ['Azure OpenAI (eastus)', '24 ms', '0.0%', 'ok'], ['Surescripts e-Rx', '41 ms', '0.0%', 'ok'], ['Payer portal (EDI)', '66 ms', '0.4%', 'warn']];
      h += card('ThousandEyes · paths that matter', `<table class="tbl"><tr><th>Path</th><th class="n">Latency</th><th class="n">Loss</th></tr>${paths.map(([a, b, c, t]) => `<tr><td><span class="dot" style="display:inline-block;margin-right:6px;background:${toneVar(t)}"></span>${a}</td><td class="n">${b}</td><td class="n">${c}</td></tr>`).join('')}</table>`, src('thousandeyes'));
      const g = MSK.aiGovernance;
      h += card('AI & identity security (24 h)', `<div class="kv"><div><small>Prompts inspected</small><b>${U.compact(g.guard.inspected)}</b></div><div><small>Injections blocked</small><b>${g.guard.injection}</b></div><div><small>PHI redactions</small><b>${U.fmt(g.guard.phi)}</b></div><div><small>Over-priv. NHIs</small><b>${g.astrix.overPriv}</b></div></div>`, src('ai-defense') + ' ' + src('astrix'), ['ai', 'AI & Tokens']);
    } else if (lens === 'facilities') {
      h += card('Plant status', `<div class="list">${[['Chiller plant (MH 20)', '3 of 4 running · 71% load', 'warn'], ['AHU-1 (OR supply)', 'Humidity 46% · valve OK', 'ok'], ['Emergency generators', '4 ready · last test Sat', 'ok'], ['Elevators', '27 of 28 in service (S2 PM)', 'warn'], ['Water sensors (B1, MDF)', '0 alarms', 'ok'], ['Cold chain (212 units)', '0 excursions', 'ok']].map(([a, b, t]) => `<div class="li"><span class="dot" style="background:${toneVar(t)}"></span><span class="grow">${a}<small>${b}</small></span></div>`).join('')}</div>`, src('meraki-mt'));
      h += card('Mobile asset fleet utilization', C.bars([['Infusion pumps', 71], ['Wheelchairs', 58], ['Portable ultrasound', 44], ['Bladder scanners', 61], ['High-flow O₂', 66], ['Telemetry packs', 53]].map(([l, v]) => ({ label: l, value: v, color: '#fb923c' })), { fmt: (v) => v + '%', max: 100 }), src('spaces'));
      h += card('OR humidity · 24 h (all ORs)', C.lines([{ name: 'Max %RH', values: U.series('orh', 24, 48, 6, { season: 1 }), color: '#fb923c' }, { name: 'Limit 60%', values: hours.map(() => 60), color: '#f87171', dash: true }], { h: 120, min: 30, max: 65, xlabels: ['00', '06', '12', '18', '23'] }), src('meraki-mt'));
    } else if (lens === 'security') {
      h += card('Live Public Safety queue', `<div class="list">${[['Unattended item · Café 1275', 'Owner matched · returned', 'ok'], ['Visitor out of zone · Fl 17 BMT', 'Directions offered', 'info'], ['Duress drill · UCC', 'Response 1 m 41 s', 'ok'], ['Elopement geofence · Fl 14', 'Armed overnight · 23 wristbands', 'info']].map(([a, b, t]) => `<div class="li"><span class="dot" style="background:${toneVar(t)}"></span><span class="grow">${a}<small>${b}</small></span></div>`).join('')}</div>`, src('spaces') + ' ' + src('meraki-mv'));
      h += card('Incidents by type (30 d)', C.bars([['Lost/unattended items', 42], ['Visitor assistance', 118], ['Elopement alerts', 17], ['Duress calls', 9], ['Tailgating (labs)', 6]].map(([l, v]) => ({ label: l, value: v, color: '#f59e0b' }))), src('splunk'));
      h += card('Duress → officer on scene (min)', C.lines([{ name: 'Median', values: [7, 6.4, 5.1, 4.2, 3.3, 2.5, 2.1, 1.8], color: '#f59e0b', area: true }], { h: 120, min: 0, xlabels: ['Mar', 'May', 'Jul', 'Oct'], fmt: (v) => v.toFixed(1) }), src('spaces'));
    } else if (lens === 'patient') {
      h += card('Journey moments · median time', C.bars([['Curb → check-in', 9, 24], ['Check-in → pre-op', 14, 31], ['PACU → bed', 90, 225], ['Meal order → door', 24, 52], ['Discharge → car', 52, 190]].map(([l, v, g]) => ({ label: l, value: v, ghost: g, color: '#60a5fa' })), { fmt: (v) => v + 'm' }) + '<p class="sub" style="margin:6px 0 0">Bar = with Cisco · tick = baseline</p>', src('splunk'));
      h += card('Messages sent today', C.donut([{ label: 'Arrival & wayfinding', value: 3120, color: '#4f8cff' }, { label: 'Family updates', value: 2410, color: '#34d399' }, { label: 'Visitor passes', value: 1290, color: '#a78bfa' }, { label: 'Discharge & e-sign', value: 640, color: '#f472b6' }], { center: '7.5K', sub: 'texts', fmt: (v) => U.compact(v) }), src('webex-connect'));
      h += card('Top blue-dot destinations', `<div class="list">${[['Surgical Waiting (MH 2)', 812], ['Koch Center Infusion (3–5)', 744], ['Imaging (MH 4)', 512], ['Inpatient rooms (visitors)', 1904], ['UCC (MH 1)', 233]].map(([a, b]) => `<div class="li"><span class="grow">${a}</span><b style="font-family:var(--mono)">${b}</b></div>`).join('')}</div>`, src('spaces'));
    }
    const ps = MSK.prioritySystems.filter((s) => s.lens === lens || lens === 'leadership' || (lens === 'hospital' && s.tier === 1));
    if (ps.length) h += card('Priority systems · ' + (lens === 'leadership' ? 'all' : 'this lens'), `<div class="list">${ps.slice(0, 8).map((s) => `<div class="li"><span class="dot" style="background:${toneVar(s.status === 'ok' ? 'ok' : s.status === 'watch' ? 'info' : s.status)}"></span><span class="grow">${esc(s.sys)}<small>${esc(s.note)}</small></span><b style="font-family:var(--mono)">${s.health}</b></div>`).join('')}</div>`, src('splunk-itsi'), ['systems', 'All systems']);
    h += `<button class="pbtn ghost" data-open="${lens === 'leadership' ? 'lead' : lens === 'network' ? 'ai' : 'splunk'}" style="width:100%">Open full ${lens === 'leadership' ? 'Leadership Command' : lens === 'network' ? 'AI & Tokenomics' : 'Splunk Operations'} dashboard →</button>`;
    box.innerHTML = h;
    box.addEventListener('click', (e) => { const o = e.target.closest('[data-open]'); if (o) DB.open(o.dataset.open); });
    return box;
  };

  // ---------------------------------------------------------------- modal helpers
  function modal(title, sub, html) {
    $('#modal-title').textContent = title; $('#modal-sub').textContent = sub; $('#modal-body').innerHTML = html; $('#modal').classList.add('on'); $('#modal-body').scrollTop = 0;
  }
  DB.close = () => $('#modal').classList.remove('on');
  DB.open = function (k) { ({ lead: leadership, ai: aiDash, splunk: splunkDash, tech: techLib, help, wayfind: wayfindModal, systems, sources })[k](); };
  // Sources & methodology: the clear line between what is factual (with its source) and what is generated
  function sources() {
    const S = MSK.sources; const ids = Object.keys(S.refs); const n = (id) => ids.indexOf(id) + 1;
    const cite = (list) => list.map((id) => `<a class="cite" href="#src-${id}">[${n(id)}]</a>`).join('');
    modal('Sources & Methodology', `What is factual and what is generated · research as of ${S.asOf}`, `
      <div class="card src-intro"><p>${esc(S.intro)}</p></div>
      <div class="src-cols">
        <div class="src-col fact"><h3><span class="fact-badge">Factual</span> From public sources</h3>
          ${S.factual.map((g) => `<h5>${esc(g.area)}</h5><ul>${g.items.map(([t, r]) => `<li>${esc(t)} ${cite(r)}</li>`).join('')}</ul>`).join('')}</div>
        <div class="src-col gen"><h3><span class="gen-badge">Generated</span> Illustrative, created for this demo</h3>
          <ul>${S.generated.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
          <h5>How to tell them apart in the app</h5><ul><li>Leader cards and the Leader map mark verified names and titles <span class="fact-badge">Verified</span>; fictional composites are marked with *.</li><li>AI use-case cards marked <span class="fact-badge">Sourced</span> link to the published fact they build on; cards marked <span class="gen-badge">Illustrative</span> are generated.</li><li>Stories, scenarios, people in them and every number on screen are generated.</li></ul></div>
      </div>
      <h4 class="src-h">References</h4><ol class="src-refs">${ids.map((id) => `<li id="src-${id}"><a href="${S.refs[id][1]}" target="_blank" rel="noopener">${esc(S.refs[id][0])}</a> <small>${esc(S.refs[id][1])}</small></li>`).join('')}</ol>`);
  }

  // ---------------------------------------------------------------- Leadership Command
  function leadership() {
    const LD = MSK.leadership;
    const val = LD.value.map((v) => `<div class="tile" style="--tc:var(--ok)"><small>${esc(v.label)}</small><b>${v.fmt === '$' ? U.money(v.v) : v.fmt === 'n' ? U.compact(v.v) : U.fmt(v.v) + ' ' + v.fmt}</b><em>${src(v.tech)}</em></div>`).join('');
    const ms = `<table class="tbl"><tr><th>Milestone</th><th>Owner</th><th>Target</th><th style="width:160px">Progress</th><th>Status</th></tr>${LD.milestones.map((m) => `<tr title="${esc(m.detail)}"><td><b>${esc(m.name)}</b><div class="sub" style="margin:2px 0 0;font-size:11px">${esc(m.detail)}</div></td><td>${esc(m.owner)}</td><td>${esc(m.target)}</td><td><div class="prog"><i style="width:${m.pct}%;background:${m.status === 'at-risk' ? 'var(--warn)' : m.status === 'watch' ? 'var(--info)' : 'var(--ok)'}"></i></div><small style="font-family:var(--mono);color:var(--muted)">${m.pct}%</small></td><td><span class="st ${m.status}">${m.status.replace('-', ' ')}</span><div style="margin-top:4px">${m.tech.map(src).join(' ')}</div></td></tr>`).join('')}</table>`;
    const tasks = `<div class="list">${LD.tasks.map((t) => `<div class="li"><span class="dot" style="background:${t.pri === 'high' ? 'var(--crit)' : t.pri === 'med' ? 'var(--warn)' : 'var(--info)'}"></span><span class="grow">${esc(t.t)}<small>${esc(t.owner)} · due ${esc(t.due)}</small></span><span class="st ${t.state === 'Needs decision' ? 'warn' : 'info'}">${esc(t.state)}</span></div>`).join('')}</div>`;
    const ins = LD.insights.map((i) => `<div class="insight"><b>${i.icon} ${esc(i.title)}</b><p>${esc(i.text)}</p><div class="row">${i.src.map(src).join('')}<span class="conf">confidence ${i.conf}</span><button class="pbtn ghost" style="padding:4px 9px;font-size:11px" data-act="${esc(i.action)}">${esc(i.action)}</button></div></div>`).join('');
    const lob = LD.lob.map((l) => `<div class="tile" style="--tc:${toneVar(l.tone)}"><small>${esc(l.name)}</small><b style="font-size:16px">${esc(l.kpi)}</b><em>${esc(l.sub)}</em>${C.spark(l.trend, { w: 70, h: 24, color: toneVar(l.tone) })}</div>`).join('');
    const capacity = C.heat(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], ['00', '03', '06', '09', '12', '15', '18', '21'], (i, j) => U.clamp(0.35 + Math.sin(j / 2.2) * 0.3 + (i < 5 ? 0.15 : -0.1) + (i === 0 && j >= 4 && j <= 6 ? 0.25 : 0), 0, 1), { color: (v) => `rgba(244,114,182,${0.08 + v * 0.8})`, show: true, fmt: (v) => Math.round(70 + v * 30) + '' });
    modal('Leadership Command · FY27 Operations Priorities', 'Catherine Wells, EVP & COO · milestones, tasks & AI insights from Splunk · illustrative', `
      <div class="g3" style="grid-template-columns:repeat(6,1fr)">${val}</div>
      <div class="g2" style="margin-top:12px;grid-template-columns:1.6fr 1fr">${card('Priority operations milestones', ms, src('splunk'))}<div style="display:flex;flex-direction:column;gap:12px">${card('AI-generated insights · act now', ins, src('splunk') + ' ' + src('ai-canvas'))}</div></div>
      <div class="g2" style="margin-top:12px">${card('Open leadership tasks', tasks, src('cloud-control'))}${card('Forecast occupancy % · next 7 days (Splunk)', capacity, src('splunk'))}</div>
      <h5 class="layerhead">Lines of business</h5><div class="g4">${lob}</div>
      ${card('Resilience scorecard · this quarter', C.vbars([[310, 0], [260, 40], [190, 70], [120, 120], [80, 160], [55, 190], [41, 220]], { h: 150, colors: ['#f87171', '#34d399'], xlabels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'] }) + '<div class="legend"><span><i style="background:#f87171"></i>Clinical outage minutes</span><span><i style="background:#34d399"></i>Minutes avoided by early detection (ThousandEyes + ITSI)</span></div>', src('thousandeyes'))}`);
    $('#modal-body').querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => { b.textContent = '✓ Sent'; b.disabled = true; MSK.ui.toast(`“${b.dataset.act}”: a ServiceNow task was opened and the owner was notified in Webex.`); }));
  }

  // ---------------------------------------------------------------- AI & Tokenomics
  function aiDash() {
    const g = MSK.aiGovernance; const D = MSK.aiDepts;
    const tot = D.reduce((a, d) => a + d.tokens, 0), onp = D.reduce((a, d) => a + d.tokens * d.onprem, 0);
    const cost = D.reduce((a, d) => a + (d.tokens / 1e6) * d.cost1m, 0);
    const cloudOnly = D.reduce((a, d) => a + (d.tokens / 1e6) * Math.max(d.cost1m, g.factory.cloudCost1m), 0);
    const trendOn = U.series('tok-on', 30, onp / 1e6, onp / 1e6 * 0.15, { trend: 0.6 }), trendCl = U.series('tok-cl', 30, (tot - onp) / 1e6, (tot - onp) / 1e6 * 0.2, { trend: 0.2 });
    const table = `<table class="tbl"><tr><th>Department</th><th class="n">Tokens/day</th><th class="n">On-prem</th><th class="n">$ / 1M</th><th class="n">$ / day</th><th>Cost per outcome</th><th class="n">Guardrail blocks</th><th class="n">Galileo ground.</th></tr>${D.map((d) => `<tr><td>${esc(d.dept)}</td><td class="n">${U.compact(d.tokens)}</td><td class="n">${Math.round(d.onprem * 100)}%</td><td class="n">$${d.cost1m.toFixed(2)}</td><td class="n">${U.money((d.tokens / 1e6) * d.cost1m)}</td><td><span style="font-family:var(--mono)">$${d.perOutcome < 1 ? d.perOutcome.toFixed(4) : d.perOutcome.toFixed(0)}</span> <small style="color:var(--muted)">${esc(d.outcome)}</small></td><td class="n">${d.blocks}</td><td class="n" style="color:${d.ground == null ? 'var(--muted)' : d.ground >= 0.95 ? 'var(--ok)' : 'var(--warn)'}">${d.ground == null ? 'n/a' : d.ground.toFixed(2)}</td></tr>`).join('')}</table>`;
    const sites = (MSK.aiSites || []).map((s) => `<div class="li" style="cursor:pointer" data-site="${s.id}"><span class="lbl-ai" style="pointer-events:none"><i>AI</i></span><span class="grow">${esc(s.name)}<small>${esc(s.dept)} · ${esc(MSK.locLabel(s.at))} · ${esc(s.runs)}</small></span><span class="mtags">${s.metrics.slice(0, 2).map((m) => `<span>${esc(m)}</span>`).join('')}</span></div>`).join('');
    modal('AI Usage, Safety & Tokenomics', 'Dr. Elena Petrova, Chief AI Officer · Splunk Agent Observability + Cisco AI Defense + Galileo + Astrix + Secure AI Factory · illustrative', `
      <div class="g4" style="grid-template-columns:repeat(6,1fr)">
        <div class="tile"><small>Tokens / day</small><b>${U.compact(tot)}</b><em>${D.length} departments</em></div>
        <div class="tile" style="--tc:var(--ok)"><small>Spend / day</small><b>${U.money(cost)}</b><em>vs ${U.money(cloudOnly)} all-cloud</em></div>
        <div class="tile" style="--tc:var(--ok)"><small>On-prem share</small><b>${Math.round((onp / tot) * 100)}%</b><em>Secure AI Factory</em></div>
        <div class="tile"><small>Prompts guarded</small><b>${U.compact(g.guard.inspected)}</b><em>${g.guard.injection} injections blocked</em></div>
        <div class="tile" style="--tc:var(--ok)"><small>Groundedness</small><b>${g.galileo.ground.toFixed(3)}</b><em>hallucination ${(g.galileo.halluc * 100).toFixed(1)}%</em></div>
        <div class="tile" style="--tc:var(--warn)"><small>Non-human identities</small><b>${U.fmt(g.astrix.nhi)}</b><em>${g.astrix.overPriv} over-privileged</em></div>
      </div>
      <div class="g3" style="margin-top:12px">
        ${card('Tokens per day by department', C.bars(D.map((d) => ({ label: d.dept, value: d.tokens, color: d.onprem > 0.5 ? '#84cc16' : '#38bdf8' }))) + '<div class="legend" style="margin-top:6px"><span><i style="background:#84cc16"></i>Mostly on-prem (AI Factory)</span><span><i style="background:#38bdf8"></i>Mostly cloud API</span></div>', src('splunk-obs'))}
        ${card('Token mix & cost', C.donut([{ label: 'On-prem (AI Factory)', value: onp, color: '#84cc16' }, { label: 'Cloud APIs', value: tot - onp, color: '#38bdf8' }], { center: U.compact(tot), sub: 'tokens/day', fmt: (v) => U.compact(v) }) + `<div class="kv" style="margin-top:10px"><div><small>On-prem $/1M</small><b>$${g.factory.cost1m}</b></div><div><small>Cloud $/1M (blended)</small><b>$${g.factory.cloudCost1m}</b></div></div>`, src('ai-factory'))}
        ${card('Secure AI Factory', `<div style="display:flex;gap:12px;align-items:center">${C.gauge(g.factory.util * 100, { label: Math.round(g.factory.util * 100) + '%', sub: 'GPU utilization', ok: 0.8, warn: 0.95 })}<div class="kv" style="flex:1"><div><small>GPUs</small><b>${g.factory.gpus}</b></div><div><small>Peak tokens/sec</small><b>${U.compact(g.factory.tps)}</b></div></div></div><p class="sub" style="margin:8px 0 0">Batch fine-tuning is shifted to night hours; inference keeps p95 under 1.2 s.</p>`, src('ai-factory'))}
      </div>
      <div class="g2" style="margin-top:12px">
        ${card('Token trend · 30 days (millions/day)', C.lines([{ name: 'On-prem', values: trendOn, color: '#84cc16', area: true }, { name: 'Cloud API', values: trendCl, color: '#38bdf8' }], { h: 170, xlabels: ['Sep 18', 'Sep 28', 'Oct 8', 'Oct 17'] }), src('splunk-obs'))}
        ${card('Governance stack (24 h)', `<div class="g2" style="gap:8px">
          <div class="kv" style="grid-template-columns:1fr"><div><small>AI Defense · AI BOM</small><b>${g.bom.models} models · ${g.bom.agents} agents · ${g.bom.mcp} MCP servers</b></div><div><small>AI Defense · runtime</small><b>${U.fmt(g.guard.phi)} PHI redactions · ${g.guard.jailbreak} jailbreaks · ${g.guard.shadow} shadow-AI apps</b></div></div>
          <div class="kv" style="grid-template-columns:1fr"><div><small>Galileo · evaluations</small><b>${U.compact(g.galileo.evaluated)} traces · tool-selection ${g.galileo.toolSel}</b></div><div><small>Astrix · NHIs</small><b>${U.fmt(g.astrix.rotated)} secrets rotated · ${g.astrix.agentsGoverned} agents governed</b></div></div></div>`, src('ai-defense') + ' ' + src('galileo') + ' ' + src('astrix'))}
      </div>
      <div style="margin-top:12px">${card('Department tokenomics · cost per outcome', table, src('splunk-obs'))}</div>
      <div style="margin-top:12px">${card('Where AI runs on campus · tap to fly there', `<div class="list">${sites}</div>`, src('cloud-control'))}</div>`);
    $('#modal-body').querySelectorAll('[data-site]').forEach((e) => e.addEventListener('click', () => { const s = MSK.aiSites.find((x) => x.id === e.dataset.site); DB.close(); MSK.ui.flyToKey(s.at); MSK.inspector.ai(s.id); }));
  }

  // ---------------------------------------------------------------- Splunk Ops
  function splunkDash() {
    const units = ['7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    modal('Splunk · Hospital Operations Analytics', 'The data layer · Epic ADT, Spaces, Webex, Meraki, network, robots, BMS · every outcome measured · illustrative', `
      <div class="g4">${tiles(MSK.lensKPIs.hospital).replace('<div class="tiles">', '').replace(/<\/div>$/, '')}</div>
      <div class="g2" style="margin-top:12px">
        ${card('Room wait time by inpatient floor (min) · today vs 90-day baseline', C.bars(units.map((u, i) => ({ label: 'Floor ' + u + ' · ' + MSK.campus.buildingMap.MH.levelMap[Number(u)].name.split(' ')[0], value: 18 + ((i * 29) % 44), ghost: 70 + ((i * 31) % 70), color: '#ff5ca8' })), { fmt: (v) => v + 'm' }) + `<div class="spl" style="margin-top:8px">index=epic_adt event=bed_assigned | eval wait=assigned_time-request_time | stats avg(wait) as room_wait by unit</div>`, src('splunk'))}
        ${card('Admissions vs discharges · actual & forecast', C.lines([{ name: 'Admissions (actual)', values: U.series('a1', 48, 8, 6, { season: 2, min: 0 }), color: '#a78bfa' }, { name: 'Discharges (actual)', values: U.series('d1', 48, 7.5, 7, { season: 2.2, min: 0 }), color: '#34d399' }, { name: 'Forecast (Cisco TSFM)', values: U.series('f1', 48, 8, 4, { season: 2, min: 0 }), color: '#fbbf24', dash: true }], { h: 190, band: [30, 47], xlabels: ['Yesterday', '12:00', 'Now', '12:00', '+24 h'] }) + `<div class="spl" style="margin-top:8px">| mstats avg(census) WHERE index=flow span=1h | fit TimeSeriesFoundationModel census horizon=24</div>`, src('splunk'))}
      </div>
      <div class="g3" style="margin-top:12px">
        ${card('UCC arrivals forecast · hour × day', C.heat(days, ['08', '10', '12', '14', '16', '18', '20', '22'], (i, j) => U.clamp(0.2 + Math.sin((j + 1) / 2.6) * 0.45 + (i === 0 ? 0.2 : 0) - (i > 4 ? 0.15 : 0), 0, 1), { show: true, fmt: (v) => Math.round(2 + v * 12), color: (v) => `rgba(255,92,168,${0.08 + v * 0.85})` }), src('splunk'))}
        ${card('EVS turnaround (min) · Spaces-detected vacate → clean', C.lines([{ name: 'Median', values: [78, 74, 69, 61, 55, 49, 46, 44, 41], color: '#2dd4bf', area: true }], { h: 150, min: 0, xlabels: ['Feb', 'Apr', 'Jun', 'Aug', 'Oct'] }), src('spaces'))}
        ${card('Discharge before noon %', C.vbars([34, 36, 39, 41, 44, 47, 49], { h: 150, colors: ['#a78bfa'], xlabels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'], fmt: (v) => v.toFixed(0) + '%', hi: 6 }) + '<p class="sub" style="margin:4px 0 0">Goal 55% · pickup geofencing pilot on Fl 12 = 71%</p>', src('splunk'))}
      </div>
      <div class="g3" style="margin-top:12px">
        ${card('Meal order → door by floor (min)', C.bars(['B1→5', '7', '9 Kids', '12', '14', '17 BMT', 'Koch 3'].map((f, i) => ({ label: f, value: 17 + ((i * 7) % 13), color: '#fbbf24' })), { fmt: (v) => v + 'm' }), src('webex-cc'))}
        ${card('Transport job time (min) · request → complete', C.lines([{ name: 'With Spaces (find nearest)', values: [31, 29, 26, 24, 22, 20, 19, 18], color: '#c084fc', area: true }, { name: 'Target', values: Array(8).fill(25), color: '#64748b', dash: true }], { h: 140, min: 0, xlabels: ['Mar', 'Jun', 'Oct'] }), src('spaces'))}
        ${card('Service elevator wait (s) · robots vs people', C.vbars([[42, 18], [55, 22], [61, 25], [48, 20], [38, 16], [30, 12]], { h: 140, colors: ['#94a3b8', '#22d3ee'], xlabels: ['07', '10', '12', '14', '17', '20'] }) + '<div class="legend"><span><i style="background:#94a3b8"></i>Staff & transport</span><span><i style="background:#22d3ee"></i>Robots (scheduled by the fleet manager)</span></div>', src('cloud-control'))}
      </div>`);
  }

  // ---------------------------------------------------------------- Priority systems
  function systems() {
    const S = MSK.prioritySystems; const layers = ['orchestration', 'data', 'location', 'assurance', 'security', 'ai', 'collab', 'network'];
    const tiers = [1, 2, 3];
    const count = (st) => S.filter((s) => s.status === st).length;
    const row = (s) => `<tr><td><b>${esc(s.sys)}</b><div class="sub" style="margin:2px 0 0;font-size:11px">${esc(s.deps)}</div></td><td>${esc(s.owner)}</td><td style="width:120px"><div class="prog"><i style="width:${s.health}%;background:${toneVar(s.status === 'ok' ? 'ok' : s.status === 'watch' ? 'info' : s.status)}"></i></div><small style="font-family:var(--mono);color:var(--muted)">${s.health}</small></td><td><span class="st ${s.status === 'watch' ? 'info' : s.status}">${s.status}</span></td><td class="n">${esc(s.rto)}</td><td>${s.tech.map(src).join(' ')}</td><td style="font-size:11.5px;color:#b9c5d8">${esc(s.note)}</td></tr>`;
    const matrix = C.heat(S.map((s) => s.sys.split(' (')[0].split(',')[0].slice(0, 26)), layers.map((l) => MSK.cisco.layers[l].name.split(' ')[0]), (i, j) => S[i].tech.filter((t) => MSK.tech(t).layer === layers[j]).length ? 1 : 0, { color: (v) => (v ? 'rgba(0,188,235,.55)' : 'rgba(255,255,255,.03)'), show: false });
    modal('Operations Priority Systems', 'Every life-critical and priority system, its health, recovery target and the Cisco technology watching it · data in Splunk; infrastructure run in Cisco Cloud Control · illustrative', `
      <div class="g4">
        <div class="tile" style="--tc:var(--ok)"><small>Priority systems</small><b>${S.length}</b><em>${S.filter((s) => s.tier === 1).length} Tier 1 (life-critical)</em></div>
        <div class="tile" style="--tc:var(--ok)"><small>Healthy</small><b>${count('ok')}</b><em>within SLO</em></div>
        <div class="tile" style="--tc:var(--info)"><small>Watch</small><b>${count('watch')}</b><em>predictive alerts open</em></div>
        <div class="tile" style="--tc:var(--warn)"><small>Warning</small><b>${count('warn')}</b><em>owner assigned in ServiceNow</em></div>
      </div>
      ${tiers.map((t) => `<div style="margin-top:12px">${card(`Tier ${t} · ${t === 1 ? 'life-critical (minutes matter)' : t === 2 ? 'operations-critical' : 'experience & research'}`, `<table class="tbl"><tr><th>System</th><th>Owner</th><th>Health</th><th>Status</th><th class="n">RTO</th><th>Watched by</th><th>Now</th></tr>${S.filter((s) => s.tier === t).map(row).join('')}</table>`, src('splunk-itsi'))}</div>`).join('')}
      <div class="g2" style="margin-top:12px">${card('Cisco coverage matrix · system × layer', matrix, src('cloud-control'))}
      ${card('How remediation flows', `<ol class="turns"><li>Signals from every system land in Splunk (logs, metrics, traces, sensor and location events).</li><li>Splunk ITSI and the Cisco time-series model score health and predict degradation.</li><li>ThousandEyes says whether the fault is inside or outside MSK; Cyber Vision and ISE add device context.</li><li>For IT, network and security faults, Cloud Control’s AI Canvas assembles evidence and proposes a fix; an engineer approves and Cloud Control applies it (SD-WAN steer, ISE quarantine).</li><li>Clinical and patient actions stay with the systems that own them: Webex Connect texts patients, Webex Calling pages teams, Security dispatches officers, ServiceNow opens work orders.</li><li>Every outcome flows back into Splunk, which verifies recovery and measures the result.</li></ol>`, src('splunk'))}</div>`);
  }

  // ---------------------------------------------------------------- Tech library
  function techLib() {
    const by = {}; MSK.cisco.list.forEach((t) => (by[t.layer] = by[t.layer] || []).push(t));
    const order = ['orchestration', 'data', 'location', 'assurance', 'security', 'ai', 'collab', 'network'];
    modal('The Cisco Stack Behind the Twin', 'Webex and Cisco Spaces run patient and clinical workflows with Epic; Cisco Cloud Control runs IT, network and security operations; Splunk is the data layer for everything. Tap any card for details, AI usage, metrics and value.', `
      <div class="card" style="margin-bottom:6px"><p style="margin:0;color:var(--text2);line-height:1.6">Signals flow <b style="color:var(--spaces)">up</b> from the edge (Wi-Fi 7 & Spaces, Meraki cameras and sensors, IoMT, robots, phones) into <b style="color:var(--splunk)">Splunk</b>, where they become analytics, forecasts and AI-ready data. The systems that own each outcome act on those insights: <b style="color:var(--collab)">Webex</b> texts patients, answers calls and pages teams, integrated with Epic; <b style="color:var(--spaces)">Cisco Spaces</b> finds people and equipment; <b style="color:var(--cisco)">Cisco Cloud Control</b> runs IT, network and security operations (SD-WAN steering, quarantines) with humans in the loop. Every result flows back into Splunk. <b style="color:var(--ai)">AI Defense, Galileo and Astrix</b> keep every AI agent safe, accurate and accountable.</p></div>
      ${order.map((l) => by[l] ? `<div class="layerhead"><i style="background:${MSK.cisco.layers[l].color}"></i>${esc(MSK.cisco.layers[l].name)}</div><div class="techgrid">${by[l].map((t) => `<button class="techcard" data-tech="${t.id}" style="--c:${MSK.cisco.layers[l].color}"><div class="ic">${t.icon}</div><b>${esc(t.name)}</b><p>${esc(t.tagline)}</p></button>`).join('')}</div>` : '').join('')}`);
    $('#modal-body').querySelectorAll('[data-tech]').forEach((b) => b.addEventListener('click', () => { DB.close(); MSK.inspector.tech(b.dataset.tech); }));
  }

  // ---------------------------------------------------------------- help
  function help() {
    modal('About this twin', 'How to explore', `<div class="g2">
      <div class="card"><h5>What you’re looking at</h5><p style="color:var(--text2);line-height:1.6">An illustrative 3D operations twin of Memorial Sloan Kettering’s York Avenue campus on Manhattan’s Upper East Side: Memorial Hospital (1275 York Ave), the Zuckerman Research Center, Rockefeller Research Laboratories, the David H. Koch Center for Cancer Care and the Josie Robertson Surgery Center, in context with the East River, FDR Drive and the Queensboro Bridge. Interiors, people and metrics are schematic and simulated.</p>
      <p style="color:var(--text2);line-height:1.6">Above the campus, <b style="color:var(--splunk)">Splunk</b> is the data layer every signal and outcome flows into, and <b style="color:var(--cisco)">Cisco Cloud Control</b> is where IT, network and security teams run the infrastructure. Patient and clinical workflows run in <b style="color:var(--collab)">Webex</b> and <b style="color:var(--spaces)">Cisco Spaces</b>, integrated with Epic. Animated packets show signals flowing up and results flowing back.</p></div>
      <div class="card"><h5>How to use it</h5><ul style="color:var(--text2);line-height:1.7;padding-left:18px;margin:0">
        <li><b>Pick a persona lens</b> at the top: Leadership, Hospital Ops, Clinical Ops, Network & Security, Facilities, Public Safety, Patient & Family.</li>
        <li><b>Open a scenario</b> on the left, then press ▶. Use <span class="kbd">Space</span> to play or pause and <span class="kbd">←</span> <span class="kbd">→</span> to step. Toggle <b>With / Without Cisco</b> where available.</li>
        <li><b>Click any person</b> (in 3D, in the cast or on the People tab) to read their story and the narrator’s note on how Cisco supports them.</li>
        <li><b>Click a building</b> to open it and use the floor strip to visit any floor. <b>Click a room</b> for live Cisco Spaces data.</li>
        <li>Turn on <b>Spaces data</b> for occupancy, temperature or air-quality heatmaps, the <b>AI map</b> to see where AI runs, and <b>Blue-dot wayfinding</b> to route between any two places.</li>
        <li>Press <b>⛶ Focus</b> (or <span class="kbd">F</span>) to collapse every panel and give the map the full screen.</li>
        <li>Open <b>Command</b>, <b>AI & Tokens</b>, <b>Splunk Ops</b> and <b>Cisco Stack</b> for the dashboards.</li></ul></div></div>
      <div class="card" style="margin-top:12px"><h5>Disclaimer</h5><p style="color:var(--muted);margin:0;line-height:1.6">Concept demonstration only. Not affiliated with, endorsed by or representative of Memorial Sloan Kettering Cancer Center, its operations or its data. All people are fictional composites; all figures are illustrative. Cisco product descriptions reflect public announcements through 2026; some capabilities (e.g. Galileo, Astrix integrations) are recent acquisitions whose integration timelines may vary.</p></div>`);
  }

  // ---------------------------------------------------------------- Wayfinding
  function turnByTurn(path, fromKey, toKey) {
    const out = []; let prev = null; let walk = 0;
    const flush = () => { if (walk > 4) out.push(`Walk ${Math.round(walk)} m`); walk = 0; };
    for (let i = 0; i < path.length; i++) {
      const n = path[i];
      if (prev) {
        const d = Math.hypot(n.x - prev.x, n.z - prev.z);
        if (n.kind === 'core' && prev.kind === 'core' && n.level !== prev.level) {
          let j = i; while (j + 1 < path.length && path[j + 1].kind === 'core' && path[j + 1].level !== path[j].level) j++;
          flush(); const b = MSK.campus.buildingMap[n.b]; const core = b.cores.find((c) => Math.abs(c.x - n.x) < 1);
          const lab = (lv) => (b.levelMap[lv] || {}).label;
          out.push(`Take the ${core ? core.label : 'elevator'} from Floor ${lab(prev.level)} to Floor ${lab(path[j].level)}`); prev = path[j]; i = j; continue;
        }
        if (n.kind === 'room' && prev.kind === 'room' && n.level !== prev.level) { flush(); out.push(`Take the stairs to Floor ${n.level}`); }
        else if (n.kind === 'entrance' && prev.kind !== 'door') { flush(); const b = MSK.campus.buildingMap[n.b]; const e = b && b.entrances.find((x) => Math.abs(x.outside.x - n.x) < 1 && Math.abs(x.outside.z - n.z) < 1); out.push(`Enter ${b ? b.short : 'the building'}${e ? ' via ' + e.label : ''}`); }
        else if (n.kind === 'entrance' && prev.kind === 'door') { flush(); out.push('Exit the building'); }
        else walk += d;
      }
      prev = n;
    }
    flush(); out.push(`Arrive at ${MSK.locLabel(toKey)}`);
    return out;
  }
  DB.wayfindTo = function (from, to) {
    const path = MSK.nav.path(from, to, 'walk'); if (!path) { MSK.ui.toast('No accessible route found.'); return; }
    MSK.registerPeople([{ id: 'you', name: 'You', kind: 'visitor', lens: 'patient', role: 'Visitor using blue-dot wayfinding', color: '#3b82f6', why: 'You are exploring the campus with Cisco Spaces blue-dot wayfinding.', narrator: 'Cisco Spaces computes the route on the hospital’s AI-built indoor map using Wi-Fi 7 access points with BLE and UWB radios: no app download, just a link.' }]);
    MSK.actors.remove('you'); MSK.actors.ensure('you'); MSK.actors.place('you', from);
    const secs = MSK.nav.walkSeconds(path);
    const fx = MSK.fx.wayfind(path, { color: 0x3b82f6 });
    MSK.actors.moveAlong('you', path, Math.min(26, Math.max(6, secs / 9)), { toKey: to, onDone: () => { MSK.fx.endPath(fx, 6); MSK.actors.setStatus('you', 'Arrived ✓'); const tok = (DB._wf = (DB._wf || 0) + 1); setTimeout(() => { if (DB._wf === tok && !MSK.director.current()) MSK.actors.remove('you'); }, 15000); } });
    MSK.actors.setStatus('you', `→ ${MSK.locLabel(to)}`);
    const lv = MSK.director.levelAt(MSK.actors.get('you').pos); if (lv) MSK.world.focusLevel(lv.b, lv.level); else MSK.world.clearFocus();
    MSK.world.flyTo(MSK.world.posOf(from), 110, { polar: 0.85 });
    MSK.director.follow('you');
    const steps = turnByTurn(path, from, to);
    DB.close();
    MSK.ui.toast(`Blue dot: ${Math.round(MSK.nav.length(path))} m · about ${Math.max(1, Math.round(secs / 60))} min walk · ${steps.length} steps`);
    MSK.dash.lastRoute = { from, to, steps, len: MSK.nav.length(path), secs };
  };
  function wayfindModal() {
    const all = MSK.allRooms();
    const lr = DB.lastRoute;
    modal('Blue-dot wayfinding · Cisco Spaces', 'Route between any two places on campus: curbs, lobbies, any room on any floor. Uses the same routing engine as the scenarios.', `
      <div class="wf"><div><label>From</label><input id="wf-from" value="${esc(MSK.locLabel('curb/main'))}" data-key="curb/main" autocomplete="off"/><div class="sugg" id="sg-from"></div></div>
      <div><label>To</label><input id="wf-to" placeholder="Search: room 1214, surgical waiting, infusion, café…" autocomplete="off"/><div class="sugg" id="sg-to"></div></div>
      <button class="pbtn" id="wf-go" style="height:38px">● Start blue dot</button></div>
      <div class="g2" style="margin-top:14px"><div class="card"><h5>Popular destinations</h5><div class="chips">${['MH/2/SURGWAIT', 'MH/12/1214', 'MH/1/UCCW', 'KOCH/3/INF04', 'MH/4/MRI1', 'JRSC/2/SURGWAIT', 'MH/1/CAFE', 'KOCH/1/LOBBY', 'MH/14/FAM', 'MH/9/FAM'].map((k) => { const l = MSK.loc(k); return `<button class="tchip" style="--c:#3b82f6" data-dest="${k}"><i>●</i>${esc(l.label)} · ${esc(MSK.campus.buildingMap[l.b].short)} ${l.level}</button>`; }).join('')}</div></div>
      <div class="card"><h5>Last route</h5>${lr ? `<p class="sub">${esc(MSK.locLabel(lr.from))} → ${esc(MSK.locLabel(lr.to))} · ${Math.round(lr.len)} m · ~${Math.max(1, Math.round(lr.secs / 60))} min</p><ol class="turns">${lr.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>` : '<p class="sub">No route yet.</p>'}</div></div>`);
    const bindSearch = (inp, box) => {
      inp.addEventListener('input', () => {
        const q = inp.value.toLowerCase().trim(); if (!q) { box.classList.remove('on'); return; }
        const res = all.filter((r) => (r.label + ' ' + r.sub + ' ' + r.key).toLowerCase().includes(q)).slice(0, 40);
        box.innerHTML = res.map((r) => `<button data-k="${r.key}">${esc(r.label)}<small>${esc(r.sub)}</small></button>`).join('') || '<div class="empty">No match</div>'; box.classList.add('on');
      });
      box.addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (!b) return; inp.value = MSK.locLabel(b.dataset.k); inp.dataset.key = b.dataset.k; box.classList.remove('on'); });
    };
    bindSearch($('#wf-from'), $('#sg-from')); bindSearch($('#wf-to'), $('#sg-to'));
    $('#wf-go').addEventListener('click', () => { const f = $('#wf-from').dataset.key, t = $('#wf-to').dataset.key; if (!f || !t) { MSK.ui.toast('Choose a destination from the list.'); return; } DB.wayfindTo(f, t); });
    $('#modal-body').querySelectorAll('[data-dest]').forEach((b) => b.addEventListener('click', () => DB.wayfindTo($('#wf-from').dataset.key || 'curb/main', b.dataset.dest)));
  }

  DB.bind = function () {
    $('#modal-close').addEventListener('click', DB.close);
    $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') DB.close(); });
    $('#modal-body').addEventListener('click', (e) => { const o = e.target.closest('[data-open]'); if (o) DB.open(o.dataset.open); });
    $('#btn-lead').addEventListener('click', () => DB.open('lead'));
    $('#btn-ai').addEventListener('click', () => DB.open('ai'));
    $('#btn-splunk').addEventListener('click', () => DB.open('splunk'));
    $('#btn-tech').addEventListener('click', () => DB.open('tech'));
    $('#btn-help').addEventListener('click', () => DB.open('help'));
    $('#btn-sys').addEventListener('click', () => DB.open('systems'));
    $('#btn-wayfind').addEventListener('click', () => DB.open('wayfind'));
  };
})();
