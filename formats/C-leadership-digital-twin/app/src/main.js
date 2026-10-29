import './fonts.css';
import './styles.css';
import D from './data/data.json';
import * as S from './data/static.js';
import { renderDash } from './dash.js';

const AUDIO_MODE = 'speech'; // 'mp3' when ./audio/{chapterId}.mp3 + briefing.mp3 ship beside the page
const $ = (q) => document.querySelector(q);
const $$ = (q) => [...document.querySelectorAll(q)];
const el = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; };

// ---------- citations
const ORD = Object.fromEntries(D.sources.map((s, i) => [s.id, i + 1]));
const SRC = Object.fromEntries(D.sources.map((s) => [s.id, s]));
const esc = (s) => String(s).replace(/"/g, '&quot;');
const cite = (ids = []) => (ids || []).map((id) => `<a class="cite" href="#src-${id}" title="${esc(SRC[id]?.title || '')}">${ORD[id] ?? '?'}</a>`).join('');

// ---------- products and ownership
const P = D.products;
const isOwn = (k) => P[k] && (P[k].owned || P[k].incl);
const classify = (ps) => { const own = ps.filter(isOwn), add = ps.filter((k) => !isOwn(k)); return { own, add, kind: own.length ? (add.length ? 'extend' : 'owned') : 'new' }; };
const chip = (k) => { const t = P[k]; if (!t) return ''; return t.owned ? `<span class="chip ${t.fam} owned" title="Dominion already runs this">${t.name}</span>` : t.incl ? `<span class="chip ${t.fam} incl" title="Included with ${t.incl}, which Dominion owns">${t.name}</span>` : `<span class="chip ${t.fam}">${t.name}</span>`; };
const OWN_K = { owned: 'New use case on what you already run', extend: 'Extends what you run', new: 'New capability' };
const ownLine = (ps, short = false) => { const c = classify(ps); return `<div class="own-line ${c.kind}"><span class="ol-k">${OWN_K[c.kind]}</span>${c.own.length && !short ? `<span class="ol-o">In place today: ${c.own.map((k) => P[k].name).join(', ')}</span>` : ''}${c.add.length ? `<span class="ol-a">Adds: ${c.add.map((k) => P[k].name).join(', ')}</span>` : ''}</div>`; };
const DEPT = Object.fromEntries(D.depts.map((d) => [d.id, d]));
const flash = (node) => { if (!node) return; node.scrollIntoView({ behavior: 'smooth', block: 'center' }); node.classList.add('flash'); setTimeout(() => node.classList.remove('flash'), 1600); };
const go = (sel) => document.querySelector(sel)?.scrollIntoView({ behavior: 'smooth' });

// ---------- hero KPIs
$('#kpis').innerHTML = D.kpis.map((k) => `<div class="kpi" title="${esc(k.v + ': ' + k.l)}"><b>${k.v}</b><span>${k.l}${cite(k.s)}</span></div>`).join('');

// ---------- scene (lazy chunk)
let W = null;
const hasGL = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
async function bootScene() {
  if (!hasGL) { $('#stage').innerHTML = '<div class="nogl">WebGL is not available in this browser. The brief below is fully readable.</div>'; return; }
  const { createScene } = await import('./scene.js');
  W = createScene($('#stage'), $('#labels'), { regions: S.REGIONS, ocean: S.OCEAN_LABEL, assets: D.assets, agents: D.agents, depts: D.depts, where: S.SITE_WHERE, chapter0: D.chapters[0].cam });
  W.onSelect(openAsset);
  W.onAgent((id) => { go('#agentic'); showAgent(id); });
  new IntersectionObserver(([e]) => W.pause(!e.isIntersecting), { threshold: 0.02 }).observe($('#twin'));
}

function openAsset(id) {
  const a = D.assets.find((x) => x.id === id), panel = $('#assetPanel');
  if (!a) { panel.classList.remove('open'); return; }
  const d = DEPT[a.dept];
  panel.innerHTML = `<button class="x" aria-label="Close">&times;</button>
    <div class="ap-dept" style="--c:${d?.color || '#00bceb'}">${d?.name || ''}</div>
    <h3>${a.name}</h3><div class="ap-fn">${a.fn}</div>
    <h4>What the public record says</h4><ul class="facts">${a.facts.map((f) => `<li>${f.t}${cite(f.s)}</li>`).join('')}</ul>
    <h4>Where Splunk and Cisco help</h4><ul class="plays">${a.plays.map((p) => `<li>${p}</li>`).join('')}</ul>
    <div class="ap-actions"><button data-go="dept" data-id="${a.dept}">Personas and use cases</button>${d ? `<button data-go="dash" data-id="${d.personas[0].dash}">Open mock dashboard</button>` : ''}</div>`;
  panel.classList.add('open');
  panel.querySelector('.x').onclick = () => { panel.classList.remove('open'); W && W.select(null); };
  panel.querySelectorAll('[data-go]').forEach((b) => (b.onclick = () => (b.dataset.go === 'dept' ? openDept(b.dataset.id) : openDash(b.dataset.id))));
}

// ---------- story + audio
const CH = D.chapters;
let ci = 0, playing = false, timer = null, briefing = false, utter = null, progT = null;
const audio = AUDIO_MODE === 'mp3' ? new Audio() : null;
const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
const words = (s) => s.split(/\s+/).length;
const totalSec = Math.round(CH.reduce((a, c) => a + words(S.SAY[c.id] || c.body), 0) / 150 * 60);
const mmss = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const NOMINAL = AUDIO_MODE === 'mp3' ? '5:40' : mmss(totalSec);
if (AUDIO_MODE !== 'mp3') document.querySelector('#heroListen span:last-child').textContent = `${Math.round(totalSec / 60)} minute narrated overview`;

function speak() {
  const c = CH[ci];
  if (AUDIO_MODE === 'mp3') { audio.src = `./audio/${c.id}.mp3`; audio.play().catch(() => stopBriefing()); return; }
  if (!synth) { openScript(); stopBriefing(); return; }
  synth.cancel();
  utter = new SpeechSynthesisUtterance(S.SAY[c.id] || c.body.replace(/<[^>]+>/g, ''));
  const v = synth.getVoices().find((x) => /en-US/.test(x.lang) && /Natural|Neural|Google|Samantha|Aria|Guy/.test(x.name)) || synth.getVoices().find((x) => /^en/.test(x.lang));
  if (v) utter.voice = v;
  utter.rate = 1;
  const dur = words(utter.text) / 150 * 60, t0 = performance.now();
  clearInterval(progT);
  progT = setInterval(() => { const k = Math.min(1, (performance.now() - t0) / 1000 / dur); const p = $('#ccProg'); if (p) p.style.width = k * 100 + '%'; const tm = $('#ccTime'); if (tm) tm.textContent = `${mmss(k * dur)} / ${mmss(dur)}`; }, 250);
  utter.onend = () => { clearInterval(progT); if (!briefing) return; ci < CH.length - 1 ? goTo(ci + 1, true) : stopBriefing(); };
  synth.speak(utter);
}
if (audio) {
  audio.addEventListener('ended', () => briefing && (ci < CH.length - 1 ? goTo(ci + 1, true) : stopBriefing()));
  audio.addEventListener('timeupdate', () => { const p = $('#ccProg'); if (p && audio.duration) { p.style.width = (audio.currentTime / audio.duration) * 100 + '%'; $('#ccTime').textContent = `${mmss(audio.currentTime)} / ${mmss(audio.duration)}`; } });
}
function startBriefing() { if (playing) togglePlay(); briefing = true; document.body.classList.add('briefing'); goTo(ci === CH.length - 1 ? 0 : ci, true); }
function stopBriefing() { briefing = false; clearInterval(progT); audio?.pause(); synth?.cancel(); document.body.classList.remove('briefing'); renderCard(); }

function renderCard() {
  const c = CH[ci];
  document.body.classList.toggle('story', ci > 0 || briefing || playing);
  const dl = AUDIO_MODE === 'mp3' ? '<a class="cc-dl" href="./audio/briefing.mp3" download title="Download the full audio briefing">MP3</a>' : '<button class="cc-dl" id="ccScript" title="Read the narration script (MP3 ships with the published edition)">Script</button>';
  const listenLbl = !synth && AUDIO_MODE !== 'mp3' ? 'Read script' : briefing ? 'Stop briefing' : 'Audio briefing';
  $('#chapterCard').innerHTML = `
    <div class="cc-kicker">${c.kicker} <span>${ci + 1} / ${CH.length}</span></div>
    <h2>${c.title}</h2>
    <p>${c.body}${cite(c.s)}</p>
    <div class="cc-audio ${briefing ? 'on' : ''}">
      <button id="ccListen" class="listen" aria-label="${briefing ? 'Stop audio briefing' : 'Play audio briefing'}"><span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>${listenLbl}</button>
      <div class="cc-track"><div id="ccProg"></div></div>
      <span id="ccTime" class="cc-time">${briefing ? '' : NOMINAL}</span>${dl}
    </div>
    <div class="cc-ctrl">
      <button id="ccPrev" aria-label="Previous chapter">&#8592;</button>
      <button id="ccPlay" class="play">${playing ? 'Pause story' : 'Play story'}</button>
      <button id="ccNext" aria-label="Next chapter">&#8594;</button>
      <div class="dots">${CH.map((_, i) => `<i class="${i === ci ? 'on' : ''}" data-i="${i}" title="${esc(CH[i].title)}"></i>`).join('')}</div>
    </div>`;
  $('#ccPrev').onclick = () => goTo(ci - 1, briefing);
  $('#ccNext').onclick = () => goTo(ci + 1, briefing);
  $('#ccPlay').onclick = () => { if (briefing) stopBriefing(); togglePlay(); };
  $('#ccListen').onclick = () => (!synth && AUDIO_MODE !== 'mp3' ? openScript() : briefing ? stopBriefing() : startBriefing());
  $('#ccScript') && ($('#ccScript').onclick = openScript);
  $$('#chapterCard .dots i').forEach((d) => (d.onclick = () => goTo(+d.dataset.i, briefing)));
  $$('#chapterCard .cc-link').forEach((a) => (a.onclick = (e) => { e.preventDefault(); go(a.getAttribute('href')); }));
}
function goTo(i, keepAudio = false) {
  ci = (i + CH.length) % CH.length;
  if (!keepAudio && playing) togglePlay();
  renderCard();
  if (briefing) speak();
  if (!W) return;
  const c = CH[ci];
  W.flyTo(c.cam.p, c.cam.t, 2.6);
  setLayer(c.layers === 'threat' ? 'all' : c.layers);
  W.setThreat(c.layers === 'threat');
  $('#threatBtn').classList.toggle('on', c.layers === 'threat');
  W.select(c.focus || null);
}
function togglePlay() {
  playing = !playing; clearInterval(timer);
  if (playing) { goTo(ci + (ci === 0 ? 0 : 1), true); timer = setInterval(() => goTo(ci + 1, true), 9000); }
  renderCard();
}
function setLayer(l) { $$('#layerToggle [data-layer]').forEach((b) => b.classList.toggle('on', b.dataset.layer === l)); W && W.setLayer(l); }
$$('#layerToggle [data-layer]').forEach((b) => (b.onclick = () => setLayer(b.dataset.layer)));
$('#threatBtn').onclick = (e) => { const on = !e.currentTarget.classList.contains('on'); e.currentTarget.classList.toggle('on', on); W && W.setThreat(on); };
$('#heroListen').onclick = () => (!synth && AUDIO_MODE !== 'mp3' ? openScript() : briefing ? stopBriefing() : ((ci = 0), startBriefing()));
function openScript() {
  $('#scriptBody').innerHTML = CH.map((c) => `<h4>${c.kicker}: ${c.title}</h4><p>${S.SAY[c.id]}</p>`).join('') + `<p class="note">Estimated length ${mmss(totalSec)} at 150 words per minute.</p>`;
  $('#scriptDlg').showModal();
}
renderCard();

// ---------- leadership
$('#leadOutcomes').innerHTML = S.LEAD.map((e) => `<div class="lead-card ${e.tag}" data-go="${e.go}" role="link" tabindex="0"><span class="lc-k">${S.LEAD_TAGS[e.tag]}</span><h3>${e.t}</h3><p>${e.d}${cite(e.s)}</p><span class="lc-go">Explore &#8594;</span></div>`).join('');
$$('.lead-card').forEach((c) => { c.onclick = (e) => { if (!e.target.closest('a')) go(c.dataset.go); }; c.onkeydown = (e) => e.key === 'Enter' && go(c.dataset.go); });
$('#leadNext').innerHTML = S.NEXT_STEPS.map(([t, d]) => `<li><b>${t}</b><span>${d}</span></li>`).join('');

// ---------- account
const RS = Object.fromEntries(D.research.map((r) => [r.id, r]));
const rlinks = (ids) => { const w = el('div', 'rlinks'); ids.filter((i) => RS[i]).forEach((i) => { const a = el('a', 'rlink', RS[i].tag); a.href = '#' + i; a.onclick = (e) => { e.preventDefault(); flash(document.getElementById(i)); }; w.append(a); }); return w; };
{
  const A = D.account, counts = {};
  const st = el('div', 'loaded'); st.append(el('span', 'prov a', 'Our work together'), el('b', null, A.meeting.title), el('span', null, A.meeting.source)); $('#acctStatus').replaceChildren(st);
  const THEME = Object.fromEntries(D.themes.map((t) => [t.id, t])), groups = {};
  A.points.forEach((p) => (groups[p.theme] = groups[p.theme] || []).push(p));
  const box = $('#acctPoints');
  Object.entries(groups).forEach(([th, pts]) => {
    THEME[th].research.forEach((r) => (counts[r] = (counts[r] || 0) + pts.length));
    const det = el('details', 'tgroup'); det.open = true;
    const sum = el('summary'); sum.append(el('b', null, THEME[th].name), el('span', 'cnt', String(pts.length)));
    det.append(sum, rlinks(THEME[th].research));
    pts.forEach((p) => { const d = el('div', 'cpoint'), m = el('div', 'tq-meta'); m.append(el('span', 'prov a sm', 'Known insight'), el('b', null, p.t)); d.append(m, el('p', null, p.d)); det.append(d); });
    box.append(det);
  });
  const acts = $('#acctActivities');
  A.activities.forEach((a) => {
    a.research.forEach((r) => (counts[r] = (counts[r] || 0) + 1));
    const art = el('article', 'act'), h = el('div', 'act-h');
    h.append(el('span', 'prov a sm', 'Current activity'), el('b', null, a.owner || '')); a.status && h.append(el('span', 'auto', a.status));
    const sup = el('div', 'act-sup'); sup.append(el('span', 'prov i sm', 'How we can help'));
    const ul = el('ul', 'sup-list'); a.support.forEach((s) => { const li = el('li'); li.append(el('span', null, s.d), rlinks(s.research || [])); ul.append(li); }); sup.append(ul);
    const enh = el('div', 'act-enh'); enh.append(el('span', 'prov r sm', 'Backed by public sources'), rlinks(a.research));
    art.append(h, el('p', 'act-t', a.t), sup, enh); acts.append(art);
  });
  $('#acctTiers').innerHTML = D.tiers.map((t, i) => `<div class="tier" style="--i:${i}"><div class="tk"><em>${i + 1}</em>${t.k}</div><div><b>${t.t}</b><p>${t.d}${cite(t.s)}</p><div class="chips">${t.p.map(chip).join('')}</div></div></div>`).join('');
  $('#acctResearch').innerHTML = D.research.map((r) => { const rec = r.so.startsWith('Recommendation'); return `<article class="rcard" id="${r.id}"><div class="rc-top"><span class="rtag">${r.tag}</span>${counts[r.id] ? '<span class="prov a sm">Supports our current work</span>' : ''}</div><h4>${r.title}</h4><p>${r.body}${cite(r.s)}</p><div class="so"><span class="prov ${rec ? 'i' : 'r'} sm">${rec ? 'Our recommendation' : 'What it means'}</span> ${r.so.replace(/^Recommendation:\s*/, '')}</div></article>`; }).join('');
  $('#acctQuestions').innerHTML = D.questions.map((q) => `<li>${q}</li>`).join('');
}

// ---------- story: owned base, stack, thesis
{
  const uses = D.depts.flatMap((d) => d.personas.flatMap((p) => p.uses)), t = { owned: 0, extend: 0, new: 0 };
  uses.forEach((u) => t[classify(u.p).kind]++);
  $('#owned').innerHTML = `<div class="ob-head"><div><span class="prov a">Known insight</span><h3>What you already run</h3><p>Dominion already runs Splunk Core, Enterprise Security Premier and SOAR. Everything in this briefing starts from that investment: first more value from what is in place, then what extends it.</p></div>
    <div class="ob-stats"><div class="o"><b>${t.owned}</b><span>use cases run entirely on what you already run</span></div><div class="e"><b>${t.extend}</b><span>extend your platform with an add-on or Cisco</span></div><div class="n"><b>${t.new}</b><span>need new capability</span></div></div></div>
    <div class="ob-items">${D.owned.items.map((i) => `<div class="ob-item"><span class="chip splunk owned">${i.n}</span><p>${i.d}</p></div>`).join('')}</div>
    <div class="ob-motions">${S.MOTIONS.map(([b, s]) => `<div><b>${b}</b><span>${s}</span></div>`).join('')}</div>
    <p class="caveat">${D.owned.note}</p>`;
  $('#stack').innerHTML = S.STACK.map((l) => `<div class="layer ${l.cls}"><div class="l-name"><b>${l.name}</b><span>${l.sub}</span></div><div class="l-items">${l.items.map((x) => (x[0] === '*' ? `<span class="own">${x.slice(1)}</span>` : `<span>${x}</span>`)).join('')}</div><div class="l-cite">${cite(l.s)}</div></div>`).join('');
  $('#thesis').innerHTML = S.THESIS.map((x) => `<div class="th"><b>${x.t}</b><p>${x.d}${cite(x.s)}${x.d2 || ''}</p></div>`).join('');
}

// ---------- alignment
$('#alignCards').innerHTML = D.initiatives.map((e) => `<article class="init"><div class="init-h"><span class="ico">${e.icon}</span><h3>${e.name}</h3></div>
  <div class="ev"><b>Evidence</b> ${e.evidence}${cite(e.s)}</div><div class="ch"><b>Challenge</b> ${e.challenge}${cite(e.s2)}</div>
  <div class="cols"><div><b class="sp">Splunk</b><ul>${e.splunk.map((t) => `<li>${t}</li>`).join('')}</ul></div><div><b class="cs">Cisco</b><ul>${e.cisco.map((t) => `<li>${t}</li>`).join('')}</ul></div></div>
  <div class="chips">${e.products.map(chip).join('')}</div>${ownLine(e.products)}</article>`).join('');
{
  const cols = [...new Set(D.initiatives.flatMap((t) => t.products))];
  $('#alignMatrix').innerHTML = `<table class="matrix"><thead><tr><th>Initiative</th>${cols.map((k) => `<th><span class="${P[k].fam}${P[k].owned ? ' owned' : ''}">${P[k].name}${P[k].owned ? ' (in place)' : ''}</span></th>`).join('')}</tr></thead><tbody>${D.initiatives.map((t) => `<tr><td>${t.icon} ${t.name}</td>${cols.map((k) => `<td>${t.products.includes(k) ? `<i class="dot ${P[k].fam}"></i>` : ''}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
$$('.align-tabs button').forEach((b) => (b.onclick = () => { $$('.align-tabs button').forEach((x) => x.classList.toggle('on', x === b)); $('#alignCards').classList.toggle('hidden', b.dataset.view !== 'cards'); $('#alignMatrix').classList.toggle('hidden', b.dataset.view !== 'matrix'); }));

// ---------- threats
$('#threatGrid').innerHTML = D.threats.map((e) => `<article class="threat sev-${e.sev}"><div class="tsev">${e.sev}${e.inferred ? ' <em>sector pattern</em>' : ''}</div><h3>${e.name}</h3><p>${e.body}${cite(e.s)}</p><div class="counter"><b>Counter</b> ${e.counter}</div></article>`).join('');

// ---------- departments
let curDept = D.depts[0].id;
const initials = (role) => role.split(/[ ,/]+/).filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join('');
function renderDept() {
  $('#deptTabs').innerHTML = D.depts.map((d) => `<button class="${d.id === curDept ? 'on' : ''}" data-id="${d.id}" style="--c:${d.color}">${d.name}</button>`).join('');
  $$('#deptTabs button').forEach((b) => (b.onclick = () => { curDept = b.dataset.id; renderDept(); }));
  const d = DEPT[curDept];
  $('#deptBody').innerHTML = `<div class="dept-head" style="--c:${d.color}"><h3>${d.name}</h3><span>${d.sub}</span></div>
    <div class="persona-grid">${d.personas.map((p) => `<article class="persona" style="--c:${d.color}"><div class="p-top"><div class="avatar">${initials(p.role)}</div><div><h4>${p.role}</h4><p>${p.goal}</p></div></div>
      <ol class="uses">${p.uses.map((u) => `<li><b>${u.t}</b><span>${u.d}${cite(u.s)}</span><div class="chips">${u.p.map(chip).join('')}</div>${ownLine(u.p, true)}</li>`).join('')}</ol>
      <button class="open-dash" data-id="${p.dash}">Open "${D.dashboards[p.dash]?.title}" dashboard &#8594;</button></article>`).join('')}</div>`;
  $$('#deptBody .open-dash').forEach((b) => (b.onclick = () => openDash(b.dataset.id)));
}
renderDept();
function openDept(id) { curDept = id; renderDept(); go('#personas'); }

// ---------- dashboards
let curDash = 'soc-command';
const ownTag = (app) => /Premier/.test(app) ? '<div class="dash-own">Runs on ES Premier (owned)</div>' : /^Splunk (Enterprise Security|Cloud|SOAR)/.test(app) ? '<div class="dash-own">Runs on Splunk Core (owned)</div>' : `<div class="dash-own add">Adds: ${app}</div>`;
function renderDashList() {
  const g = {}; Object.entries(D.dashboards).forEach(([id, d]) => (g[d.dept] = g[d.dept] || []).push([id, d]));
  $('#dashList').innerHTML = Object.entries(g).map(([dept, list]) => `<div class="dl-group"><div class="dl-dept" style="--c:${DEPT[dept]?.color}">${DEPT[dept]?.name}</div>${list.map(([id, d]) => `<button class="${id === curDash ? 'on' : ''}" data-id="${id}"><b>${d.title}</b><span>${d.persona}</span></button>`).join('')}</div>`).join('');
  $$('#dashList button').forEach((b) => (b.onclick = () => { curDash = b.dataset.id; renderDashList(); $('#dashView').innerHTML = renderDash(D.dashboards[curDash], ownTag(D.dashboards[curDash].app)); }));
}
renderDashList();
$('#dashView').innerHTML = renderDash(D.dashboards[curDash], ownTag(D.dashboards[curDash].app));
function openDash(id) { curDash = id; renderDashList(); $('#dashView').innerHTML = renderDash(D.dashboards[id], ownTag(D.dashboards[id].app)); go('#dashboards'); }

// ---------- Cloud Control
$('#pillars').innerHTML = S.PILLARS.map((p) => `<div class="pillar"><h4>${p.t}</h4><p>${p.d}${cite(p.s)}</p></div>`).join('');
{
  const C = S.CONSTELLATION;
  $('#constellation').innerHTML = `<div class="con-col c-cisco"><h5>Cisco</h5>${C.cisco.map((x) => `<span class="cs">${x}</span>`).join('')}</div>
  <div class="con-core"><div class="ring r1"></div><div class="ring r2"></div><div class="core-txt"><b>Cisco Cloud Control</b><span>on the Splunk data fabric</span></div></div>
  <div class="con-col c-splunk"><h5>Splunk</h5>${C.splunk.map((x) => `<span class="sp${C.splunkOwned.includes(x) ? ' own' : C.splunkIncl.includes(x) ? ' incl' : ''}">${x}</span>`).join('')}</div>
  <div class="con-col c-third"><h5>Third party ${cite(['s36', 's37'])}</h5>${C.third.map((x) => `<span>${x}</span>`).join('')}<h5 class="mt">Dominion-relevant targets via MCP (examples)</h5>${C.targets.map((x) => `<span class="ex">${x}</span>`).join('')}</div>`;
}
let runT = null;
function showAgent(id) {
  const a = D.agents.find((x) => x.id === id) || D.agents[0], d = DEPT[a.dept];
  $$('#agentList button').forEach((b) => b.classList.toggle('on', b.dataset.id === a.id));
  $('#agentRun').innerHTML = `<div class="ar-head" style="--c:${d?.color}"><div><div class="ar-k">${d?.name} agent</div><h4>${a.name}</h4></div><button id="replay">Replay run</button></div>
    <div class="ar-meta"><div><b>Trigger</b>${a.trigger}</div><div><b>Splunk data</b>${a.data.map((x) => `<code>index=${x}</code>`).join(' ')}</div><div><b>Tools</b>${a.tools.join(', ')}</div><div><b>Guardrail (AI Defense)</b>${a.guard}</div></div>
    <ol class="ar-steps">${a.steps.map((s) => { const [k, ...r] = s.split(':'); return `<li data-k="${k.trim().toLowerCase()}"><span class="k">${k}</span><span>${r.join(':').trim()}</span></li>`; }).join('')}</ol>
    <div class="ar-foot"><span>Traced in Splunk AI Agent Monitoring</span><span>Versioned in Cloud Control Studio</span><span>Human in the loop</span></div>`;
  const li = $$('.ar-steps li'); clearInterval(runT); let i = 0;
  runT = setInterval(() => (i < li.length ? li[i++].classList.add('done') : clearInterval(runT)), 650);
  $('#replay').onclick = () => showAgent(a.id);
}
$('#agentList').innerHTML = D.agents.map((a) => `<button data-id="${a.id}" style="--c:${DEPT[a.dept]?.color}"><b>${a.name}</b><span>${a.trigger}</span></button>`).join('');
$$('#agentList button').forEach((b) => (b.onclick = () => showAgent(b.dataset.id)));
showAgent('a1');

// ---------- federal
$('#federalBody').innerHTML = `<div class="fed-col"><h4>Installations and relationships</h4><ul class="fed-list">${D.federal.installations.map((e) => `<li><b>${e.n}</b><span>${e.d}${cite(e.s)}</span></li>`).join('')}</ul></div>
  <div class="fed-col"><h4>What mission customers need</h4><ul class="fed-list">${D.federal.needs.map((e) => `<li><b>${e.t}</b><span>${e.d}${cite(e.s)}</span></li>`).join('')}</ul>
  <h4>How we help Dominion serve them</h4><ol class="fed-help">${S.FED_HELP.map(([b, t, s]) => `<li><b>${b}</b> ${t}${cite(s)}</li>`).join('')}</ol>
  <p class="caveat">Authorization levels (FedRAMP, DoD IL) vary by product and region; we will confirm current status for each workload during design.</p>
  <button class="open-dash" id="fedDash">Open "Federal Mission Assurance" dashboard &#8594;</button></div>`;
$('#fedDash').onclick = () => openDash('mission');

// ---------- roadmap
{
  const x = (e) => 44 + ((e - 2) / 6) * 432, y = (i) => 296 - ((i - 6) / 3.5) * 252;
  $('#bubble').innerHTML = `<h4>Value vs. effort</h4><svg viewBox="0 0 520 340" role="img" aria-label="Roadmap options by business impact and effort">
    <rect x="44" y="22" width="216" height="137" fill="#2ecc9a" opacity=".06"/>
    <line x1="44" y1="296" x2="498" y2="296" stroke="#2a3a52"/><line x1="44" y1="296" x2="44" y2="14" stroke="#2a3a52"/>
    <text x="260" y="330" class="ax">Effort and time to value &#8594;</text><text x="14" y="170" class="ax" transform="rotate(-90 14 170)">Business impact &#8594;</text>
    <text x="52" y="38" class="qd">Quick wins</text>
    ${D.plays.map((a, r) => { const cy = y(a.impact) + (r % 2 ? 8 : -8); return `<g class="bub" data-id="${a.id}" tabindex="0"><circle cx="${x(a.effort)}" cy="${cy}" r="${10 + a.products.length * 2.4}" fill="${S.BUBBLE_COLORS[r]}" opacity=".8"/><text x="${x(a.effort)}" y="${cy + 4}" class="bt">${r + 1}</text></g>`; }).join('')}
  </svg><div class="bub-leg">${D.plays.map((a, r) => `<span><b style="--c:${S.BUBBLE_COLORS[r]}">${r + 1}</b>${a.name}</span>`).join('')}</div>`;
  $('#roadmap').innerHTML = `<h4>Sequencing</h4><div class="rm">${S.ROADMAP.map((c, i) => `<div class="rm-col c${i}"><div class="rm-h">${c.h}</div>${c.items.map((t) => `<span>${t}</span>`).join('')}</div>`).join('')}</div>
    <p class="caveat">Dates anchored to sources: NextEra close ${cite(['s7'])}, CVOW completion ${cite(['s10'])}, CIP-015 ${cite(['s28', 's29'])}.</p>`;
  $('#playCards').innerHTML = D.plays.map((a, r) => `<article class="play" id="play-${a.id}" style="--c:${S.BUBBLE_COLORS[r]}">
    <div class="pl-h"><span class="num">${r + 1}</span><div><h3>${a.name}</h3><span class="hz">${a.horizon} | impact ${a.impact}/10 | effort ${a.effort}/10</span></div></div>
    <p class="why">${a.why}${cite(a.s)}</p>
    <div class="pl-cols"><div><b>How we would start</b><ol>${a.motion.map((m) => `<li>${m}</li>`).join('')}</ol></div><div><b>Questions for a working session</b><p>${a.ask}</p><b>How you would measure it</b><p>${a.metric}</p></div></div>
    <div class="chips">${a.products.map(chip).join('')}</div>${ownLine(a.products)}</article>`).join('');
  $$('.bub').forEach((b) => { const f = () => flash(document.getElementById('play-' + b.dataset.id)); b.onclick = f; b.onkeydown = (e) => e.key === 'Enter' && f(); });
}

// ---------- sources
$('#method').innerHTML = S.METHOD.map(([b, t]) => `<div><b>${b}</b> ${t}</div>`).join('');
$('#sourceList').innerHTML = D.sources.map((s) => `<li id="src-${s.id}"><a href="${s.url}" target="_blank" rel="noopener">${s.title}</a><span>${s.org}, ${s.date}</span></li>`).join('');
document.addEventListener('click', (e) => { const a = e.target.closest('a.cite'); if (!a) return; e.preventDefault(); flash(document.querySelector(a.getAttribute('href'))); });

bootScene();
