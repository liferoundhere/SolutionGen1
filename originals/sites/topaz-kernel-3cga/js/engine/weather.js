/* Weather: rain, storm (lightning), snow, heat haze, fog and East River / FDR flooding. */
(function () {
  const MSK = (window.MSK = window.MSK || {});
  const WX = (MSK.weather = { state: { type: 'clear', intensity: 0, wind: 0, flood: 0 }, cur: { rain: 0, snow: 0, dark: 0, haze: 0, flood: 0, fog: 0 } });
  let THREE, W, scene, rain, snow, flash = 0;
  const RN = 14000, SN = 9000, BOX = 620, H = 380;

  WX.init = function () {
    THREE = window.THREE; W = MSK.world; scene = W.scene;
    // rain: line segments
    const rp = new Float32Array(RN * 6); const r = MSK.util.rng('rain');
    for (let i = 0; i < RN; i++) { const x = (r() - 0.5) * BOX, y = r() * H, z = (r() - 0.5) * BOX; rp.set([x, y, z, x, y - 6, z], i * 6); }
    const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(rp, 3));
    rain = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: 0xd2e2f6, transparent: true, opacity: 0, depthWrite: false }));
    rain.frustumCulled = false; scene.add(rain); WX.rain = rain;
    const sp = new Float32Array(SN * 3); for (let i = 0; i < SN; i++) sp.set([(r() - 0.5) * BOX, r() * H, (r() - 0.5) * BOX], i * 3);
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    snow = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false }));
    snow.frustumCulled = false; scene.add(snow); WX.snow = snow;
    W.ticks.push(update);
  };

  WX.set = function (s) {
    WX.state = Object.assign({ type: 'clear', intensity: 0, wind: 0, flood: 0 }, s);
    MSK.bus.emit('weather', WX.state);
  };
  WX.snap = function () { // jump straight to target (used when scrubbing)
    const t = target(); Object.assign(WX.cur, t); apply(0);
  };
  function target() {
    const s = WX.state, k = s.intensity ?? 0.6;
    return {
      rain: s.type === 'rain' ? k * 0.7 : s.type === 'storm' ? Math.max(0.5, k) : 0,
      snow: s.type === 'snow' ? Math.max(0.3, k) : 0,
      dark: s.type === 'storm' ? 0.55 * Math.max(0.6, k) : s.type === 'rain' ? 0.35 * k : s.type === 'snow' ? 0.3 * k : s.type === 'fog' ? 0.25 : 0,
      haze: s.type === 'heat' ? Math.max(0.4, k) : 0,
      flood: s.flood || 0,
      fog: s.type === 'fog' ? 0.0022 : s.type === 'snow' ? 0.0014 * k + 0.0006 : s.type === 'storm' ? 0.0012 : s.type === 'heat' ? 0.0011 : s.type === 'rain' ? 0.0009 : 0.00062,
      ground: s.type === 'snow' ? Math.min(1, k * 1.1) : 0,
    };
  }
  let groundSnow = 0;
  function apply(dt) {
    const c = WX.cur;
    rain.material.opacity = Math.min(0.85, c.rain * 0.9); rain.visible = c.rain > 0.01;
    snow.material.opacity = c.snow * 0.95; snow.visible = c.snow > 0.01;
    W.weatherTint.dark = c.dark; W.weatherTint.haze = c.haze; W.weatherTint.snow = groundSnow;
    W.setFogDensity(c.fog);
    W.floodLevel = c.flood;
    W.flood.material.opacity = c.flood > 0.02 ? 0.55 + c.flood * 0.25 : 0;
    W.flood.position.y = -0.6 + c.flood * 2.4; W.flood.scale.x = 1 + c.flood * 0.25;
    W.weatherSlow = 1 - Math.max(c.rain * 0.3, c.snow * 0.55);
    W.pedCount = Math.round(260 * (1 - Math.max(c.rain * 0.6, c.snow * 0.75, c.haze * 0.4)));
    W.carCount = Math.round(110 * (1 - Math.max(c.snow * 0.7, c.flood * 0.3)));
    W.bloom.strength = 0.55 + c.haze * 0.25;
    W.setClock(W.clockMin);
  }
  function update(dt, time) {
    const t = target(), c = WX.cur, k = Math.min(1, dt * 0.8);
    ['rain', 'snow', 'dark', 'haze', 'flood', 'fog'].forEach((key) => { c[key] += (t[key] - c[key]) * k; });
    groundSnow += (t.ground - groundSnow) * Math.min(1, dt * 0.15);
    // follow camera
    const cam = W.camera.position, tg = W.controls.target;
    const cx = (cam.x + tg.x) / 2, cz = (cam.z + tg.z) / 2;
    const wind = WX.state.wind || 0;
    if (rain.visible) {
      const pos = rain.geometry.attributes.position.array; const fall = dt * 260;
      for (let i = 0; i < RN; i++) { const o = i * 6; pos[o + 1] -= fall; pos[o + 4] -= fall; pos[o] += wind * fall * 0.35; pos[o + 3] = pos[o] + wind * 1.1;
        if (pos[o + 4] < 0) { pos[o + 1] = H; pos[o + 4] = H - 6; } if (pos[o] > BOX / 2) { pos[o] -= BOX; pos[o + 3] -= BOX; } }
      rain.geometry.attributes.position.needsUpdate = true; rain.position.set(cx, 0, cz);
    }
    if (snow.visible) {
      const pos = snow.geometry.attributes.position.array; const fall = dt * 22;
      for (let i = 0; i < SN; i++) { const o = i * 3; pos[o + 1] -= fall * (0.7 + (i % 5) * 0.12); pos[o] += Math.sin(time + i) * dt * 4 + wind * dt * 30; if (pos[o + 1] < 0) pos[o + 1] = H; if (pos[o] > BOX / 2) pos[o] -= BOX; }
      snow.geometry.attributes.position.needsUpdate = true; snow.position.set(cx, 0, cz);
    }
    // lightning
    if (WX.state.type === 'storm' && Math.random() < dt * 0.12 * (WX.state.intensity || 0.6)) flash = 1;
    if (flash > 0) { flash -= dt * 3.5; W.amb.intensity = (W.ambBase ?? 0.25) + Math.max(0, flash) * 1.1; } else W.amb.intensity = W.ambBase ?? 0.25;
    if (Math.abs(t.dark - c.dark) > 0.002 || Math.abs(t.haze - c.haze) > 0.002 || Math.abs(t.fog - c.fog) > 0.00001 || Math.abs(t.flood - c.flood) > 0.002 || Math.abs(t.ground - groundSnow) > 0.002 || rain.visible || snow.visible) apply(dt);
  }
  WX.label = function () { const s = WX.state; return { clear: 'Clear', rain: 'Rain', storm: 'Storm', snow: 'Snow', heat: 'Heat', fog: 'Fog' }[s.type] || 'Clear'; };
})();
