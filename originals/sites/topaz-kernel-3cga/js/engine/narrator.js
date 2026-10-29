/* Narrator: plays the pre-rendered voice track for whichever scenario step is on screen.
   - follows skips/scrubbing (every director:step restarts the matching segment)
   - pauses/resumes with playback, honors speed (up to 2x), can be muted ("play without audio")
   - holds a step open until its narration has finished
   - falls back to the browser's speech synthesis when a segment has no recorded audio */
(function () {
  const MSK = (window.MSK = window.MSK || {});
  const N = (MSK.narrator = {});
  const store = { get(k, d) { try { const v = localStorage.getItem('msk.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } }, set(k, v) { try { localStorage.setItem('msk.' + k, JSON.stringify(v)); } catch {} } };
  N.enabled = store.get('narration', true);
  N.voice = store.get('voice', 'auto');
  N.blocked = false;
  const audio = new Audio(); audio.preload = 'auto'; N.audio = audio;
  let segId = null, mode = null, synthUtter = null, startedAt = 0, estDur = 0;

  const man = () => MSK.narrationManifest || { voices: {}, segments: {} };
  const PRIORITY = ['patrick', 'ryan', 'heart', 'michael'];
  // a voice is only used for a scenario when it covers every step, so the narrator never changes voice mid-story
  function coverage(S) {
    const ids = S.steps.map((_, i) => `${S.sc.id}__${S.variant || 'main'}__${i}`); const out = {};
    Object.keys(man().voices).forEach((v) => { out[v] = ids.every((id) => (man().segments[id] || {})[v]); });
    return out;
  }
  N.voices = function () {
    const S = MSK.director.current(); const cov = S ? coverage(S) : null;
    return Object.entries(man().voices).filter(([id]) => !cov || cov[id]).map(([id, o]) => ({ id, ...o }));
  };
  function pickVoice(id) {
    if (N.voice === 'browser') return null;
    const avail = man().segments[id] || {};
    const S = MSK.director.current();
    if (S && id.startsWith(S.sc.id + '__')) {
      const cov = coverage(S);
      if (N.voice !== 'auto' && cov[N.voice]) return N.voice;
      const v = PRIORITY.find((k) => cov[k]); if (v) return v;
    }
    if (N.voice !== 'auto' && avail[N.voice]) return N.voice;
    return PRIORITY.find((k) => avail[k]) || Object.keys(avail)[0] || null;
  }
  const rate = () => Math.min(2, Math.max(1, MSK.director.speed()));
  function spokenText() {
    const S = MSK.director.current(); if (!S) return ''; const st = S.steps[S.idx];
    return `${st.title}. ${st.narration || ''}`;
  }

  N.stop = function () {
    audio.pause(); audio.removeAttribute('src');
    if (window.speechSynthesis) speechSynthesis.cancel();
    synthUtter = null; mode = null; segId = null; MSK.bus.emit('narrator:state', N.state());
  };
  N.state = function () { return { enabled: N.enabled, speaking: mode && !N.paused(), mode, voice: N.voice, blocked: N.blocked, progress: N.progress(), segId }; };
  // true while this step's voice is still loading or speaking, and for a short breath after it ends
  let endedAt = 0;
  N.holding = function () {
    if (!N.enabled || N.suspended || N.blocked || N.personId) return false;
    if (mode === 'audio') return !audio.ended && (audio.readyState < 3 || !audio.paused);
    if (mode === 'synth') return !!(window.speechSynthesis && speechSynthesis.speaking);
    return performance.now() - endedAt < 700;
  };
  N.paused = function () { return mode === 'audio' ? audio.paused : mode === 'synth' ? speechSynthesis.paused || !speechSynthesis.speaking : true; };
  N.progress = function () {
    if (mode === 'audio' && audio.duration) return Math.min(1, audio.currentTime / audio.duration);
    if (mode === 'synth' && estDur) return Math.min(1, ((performance.now() - startedAt) / 1000) / estDur);
    return 0;
  };

  function playStep() {
    const id = MSK.director.stepKey(); if (!id) return; N.personId = null; N.lastEnded = null;
    N.stop(); segId = id;
    if (!N.enabled) { MSK.director.resetDuration(); return; }
    const v = pickVoice(id);
    if (v) {
      mode = 'audio'; N.currentVoice = v;
      const dur = (man().segments[id] || {})[v];
      audio.src = `audio/narration/${v}/${id}.mp3?v=${dur || 0}`; // the recorded duration doubles as a cache-busting version
      audio.playbackRate = rate(); audio.defaultPlaybackRate = rate();
      if (dur) MSK.director.ensureDuration(dur / rate() + 0.9);
      if (!MSK.director.paused()) tryPlay();
      // warm the cache with the next step's narration for a gapless hand-off
      const S = MSK.director.current();
      if (S && S.idx + 1 < S.steps.length) { const nid = `${S.sc.id}__${S.variant || 'main'}__${S.idx + 1}`; const nv = pickVoice(nid); if (nv) fetch(`audio/narration/${nv}/${nid}.mp3?v=${(man().segments[nid] || {})[nv] || 0}`, { cache: 'force-cache' }).catch(() => {}); }
    } else speakSynth(id);
    MSK.bus.emit('narrator:state', N.state());
  }
  function tryPlay() {
    const p = audio.play();
    if (p && p.catch) p.then(() => { N.blocked = false; MSK.bus.emit('narrator:state', N.state()); }).catch((e) => {
      if (e && e.name === 'NotAllowedError') { N.blocked = true; MSK.bus.emit('narrator:state', N.state()); }
      else if (e && e.name !== 'AbortError' && segId && (audio.getAttribute('src') || '').includes(segId)) { if (N.personId) personSynth(N.personId); else speakSynth(segId); } // missing file → browser voice
    });
  }
  function bestSynthVoice() {
    const vs = (window.speechSynthesis && speechSynthesis.getVoices()) || [];
    const prefs = [/Ava.*Natural/i, /Andrew.*Natural/i, /Aria.*Natural/i, /Jenny.*Natural/i, /Guy.*Natural/i, /Natural/i, /Google US English/i, /Samantha/i, /en-US/i];
    for (const p of prefs) { const v = vs.find((x) => p.test(x.name + ' ' + x.lang) && /^en/i.test(x.lang)); if (v) return v; }
    return vs.find((x) => /^en/i.test(x.lang)) || null;
  }
  function speakSynth(id) {
    if (!window.speechSynthesis) return;
    audio.pause(); mode = 'synth'; N.currentVoice = 'browser';
    const u = new SpeechSynthesisUtterance(spokenText()); const v = bestSynthVoice(); if (v) u.voice = v;
    u.rate = Math.min(1.6, 0.98 * rate()); synthUtter = u; startedAt = performance.now();
    estDur = spokenText().length / (14.5 * u.rate);
    MSK.director.ensureDuration(estDur + 1);
    u.onend = () => { if (synthUtter === u) { mode = null; MSK.bus.emit('narrator:state', N.state()); } };
    speechSynthesis.cancel(); speechSynthesis.speak(u);
    if (MSK.director.paused()) speechSynthesis.pause();
    MSK.bus.emit('narrator:state', N.state());
  }

  N.setEnabled = function (on) {
    N.enabled = !!on; store.set('narration', N.enabled);
    if (!N.enabled) { N.stop(); MSK.director.resetDuration(); }
    else if (MSK.director.current()) playStep();
    MSK.bus.emit('narrator:state', N.state());
  };
  N.setVoice = function (v) { N.voice = v; store.set('voice', v); if (MSK.director.current() && N.enabled) playStep(); };
  N.unblock = function () { N.blocked = false; if (mode === 'audio') tryPlay(); else playStep(); };
  N.replay = function () { playStep(); };
  // a story (js/ui/story.js) owns the voice while it plays: the step narrator stays silent and holds no steps open
  N.suspended = false;
  N.suspend = function (on) { N.suspended = !!on; if (on) { N.stop(); N.personId = null; } };
  // person stories (from the inspector): pauses any scenario while the story is told
  N.personId = null;
  N.playPerson = function (pid) {
    const id = 'person__' + pid; const avail = man().segments[id] || {};
    if (N.personId === pid && mode) { N.stop(); N.personId = null; return false; }
    if (MSK.director.current() && !MSK.director.paused()) MSK.director.pause();
    N.stop(); N.personId = pid; segId = id;
    const v = N.voice !== 'auto' && avail[N.voice] ? N.voice : PRIORITY.find((k) => avail[k]);
    if (v) { mode = 'audio'; N.currentVoice = v; audio.src = `audio/narration/${v}/${id}.mp3?v=${avail[v] || 0}`; audio.playbackRate = 1; tryPlay(); }
    else personSynth(pid);
    MSK.bus.emit('narrator:state', N.state()); return true;
  };
  function personSynth(pid) {
    if (window.speechSynthesis) {
      const p = MSK.people[pid]; mode = 'synth';
      const u = new SpeechSynthesisUtterance(`${p.name}. ${p.why || ''} ${p.narrator || ''}`); const bv = bestSynthVoice(); if (bv) u.voice = bv;
      u.onend = () => { mode = null; N.personId = null; MSK.bus.emit('narrator:state', N.state()); };
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    }
    MSK.bus.emit('narrator:state', N.state());
  }

  N.init = function () {
    MSK.bus.on('director:step', () => { if (!N.suspended) playStep(); });
    MSK.bus.on('director:unload', () => N.stop());
    MSK.bus.on('director:play', (p) => {
      if (N.suspended) return;
      if (p && N.personId) { N.stop(); N.personId = null; playStep(); return; }
      if (!N.enabled || !mode) { if (p && N.enabled && MSK.director.current() && !mode && N.lastEnded !== MSK.director.stepKey()) playStep(); return; }
      if (mode === 'audio') { if (p) tryPlay(); else audio.pause(); }
      else if (mode === 'synth') { if (p) speechSynthesis.resume(); else speechSynthesis.pause(); }
      MSK.bus.emit('narrator:state', N.state());
    });
    MSK.bus.on('director:speed', () => {
      if (mode === 'audio' && !N.personId && MSK.director.current()) { audio.playbackRate = rate(); const id = segId; const dur = (man().segments[id] || {})[N.currentVoice]; if (dur) MSK.director.ensureDuration(MSK.director.current().t + (dur - audio.currentTime) / rate() + 0.9); }
    });
    audio.addEventListener('ended', () => { endedAt = performance.now(); if (!N.personId) N.lastEnded = segId; mode = null; N.personId = null; MSK.bus.emit('narrator:state', N.state()); MSK.bus.emit('narrator:progress', 1); });
    ['play', 'pause'].forEach((ev) => audio.addEventListener(ev, () => MSK.bus.emit('narrator:state', N.state())));
    audio.addEventListener('error', () => { const s = audio.getAttribute('src') || ''; if (!(segId && mode === 'audio' && s.includes(segId))) return; if (N.personId) { const pid = N.personId; N.stop(); N.personId = pid; personSynth(pid); } else speakSynth(segId); });
    if (window.speechSynthesis) speechSynthesis.onvoiceschanged = () => {};
    setInterval(() => {
      if (mode) MSK.bus.emit('narrator:progress', N.progress());
      else if (!N.enabled) { const S = MSK.director.current(); if (S && S.dur) MSK.bus.emit('narrator:progress', Math.min(0.999, S.t / Math.max(1, S.dur - 0.8))); } // silent captions follow the step clock
    }, 200);
  };
})();
