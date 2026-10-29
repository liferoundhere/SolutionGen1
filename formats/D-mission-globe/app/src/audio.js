// WebAudio: a quiet ambient pad (off by default) that ducks under narration, and short UI cues.
export class Sound {
  ctx = null; master = null; ambient = null; ambientOn = false; duck = 1;
  init() {
    if (this.ctx) { this.ctx.resume(); return; }
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; // wait for a real gesture
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    this.ctx = new AC(); this.master = this.ctx.createGain(); this.master.gain.value = 0.9; this.master.connect(this.ctx.destination);
    this.ambient = this.ctx.createGain(); this.ambient.gain.value = 0;
    const lp = this.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520; lp.Q.value = 0.7; this.ambient.connect(lp).connect(this.master);
    const lfo = this.ctx.createOscillator(), depth = this.ctx.createGain(); lfo.frequency.value = 0.05; depth.gain.value = 260; lfo.connect(depth).connect(lp.frequency); lfo.start();
    for (const [f, type, g] of [[73.42, 'sine', 0.5], [110, 'triangle', 0.18], [146.83, 'sine', 0.22], [164.81, 'sine', 0.12], [220, 'sine', 0.08]]) for (const det of [-6, 6]) {
      const o = this.ctx.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = det;
      const gn = this.ctx.createGain(); gn.gain.value = g * 0.5; o.connect(gn).connect(this.ambient); o.start();
    }
    this.apply();
  }
  apply() { if (this.ctx && this.ambient) this.ambient.gain.setTargetAtTime(this.ambientOn ? 0.05 * this.duck : 0, this.ctx.currentTime, 0.8); }
  setAmbient(on) { this.ambientOn = on; this.apply(); }
  setDucked(on) { this.duck = on ? 0.45 : 1; this.apply(); }
  cue(kind) {
    const c = this.ctx; if (!c || !this.master) return; const t0 = c.currentTime;
    const tone = (f, at, len, type = 'sine', vol = 0.08) => {
      const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t0 + at);
      g.gain.setValueAtTime(0, t0 + at); g.gain.linearRampToValueAtTime(vol, t0 + at + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t0 + at + len);
      o.connect(g).connect(this.master); o.start(t0 + at); o.stop(t0 + at + len + 0.05);
    };
    switch (kind) {
      case 'info': tone(880, 0, 0.18, 'sine', 0.04); break;
      case 'select': tone(660, 0, 0.12, 'triangle', 0.05); tone(990, 0.06, 0.14, 'sine', 0.04); break;
      case 'warn': tone(587, 0, 0.22, 'triangle', 0.06); tone(466, 0.18, 0.3, 'triangle', 0.06); break;
      case 'crit': tone(196, 0, 0.5, 'sawtooth', 0.05); tone(185, 0.25, 0.6, 'sawtooth', 0.05); break;
      case 'good': tone(523, 0, 0.3, 'sine', 0.06); tone(659, 0.1, 0.3, 'sine', 0.06); tone(784, 0.2, 0.5, 'sine', 0.06); break;
      case 'badge': [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.09, 0.45, 'triangle', 0.06)); break;
    }
  }
}
