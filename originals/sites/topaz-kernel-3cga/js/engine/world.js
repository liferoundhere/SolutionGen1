/* three.js world: renderer, camera, city context, MSK buildings with cutaway floors, rooms, time of day. */
(function () {
  const MSK = (window.MSK = window.MSK || {});
  const W = (MSK.world = { ticks: [], pickables: [], buildings: {}, focus: { b: null, level: null }, overlay: { spaces: false, ai: true, flows: true, labels: true }, spacesMetric: 'occupancy' });
  // 'light' = daylight street map (default), 'dark' = night operations view; set before boot by index.html
  W.theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  const isLight = () => W.theme === 'light';
  let THREE, A, scene, camera, renderer, labelRenderer, controls, composer, bloom;
  const G = () => MSK.geo;
  const U = () => MSK.util;

  // shared shader uniforms
  const SU = { uNight: { value: 0 }, uSnow: { value: 0 }, uWet: { value: 0 }, uCutOn: { value: 0 }, uCutA: { value: null }, uCutB: { value: null }, uCutR: { value: 14 } };
  // x-ray cone: fragments between the camera and the focus point are discarded so buildings never hide the subject
  const CUT_GLSL = `
        float cutRim = 0.0;
        if (uCutOn > 0.01) {
          vec3 cab = uCutB - uCutA; float cL = length(cab);
          if (cL > 1.0) {
            vec3 cd = cab / cL; float tp = dot(vWPos - uCutA, cd);
            if (tp > 0.0 && tp < cL - 3.0) {
              float r = uCutR * (0.25 + 0.75 * tp / cL) * uCutOn;
              float cdist = length(vWPos - (uCutA + cd * tp)); if (cdist < r) discard;
              cutRim = smoothstep(r * 1.18, r, cdist) * uCutOn;
            }
          }
        }`;

  function windowMaterial(opts) {
    const m = new THREE.MeshLambertMaterial({ color: opts.color, emissive: 0x000000, transparent: !!opts.transparent, opacity: opts.opacity ?? 1 });
    const uWin = { value: new THREE.Color(opts.win || 0xffd9a0) }, uLit = { value: opts.lit ?? 0.5 }, uFloorH = { value: opts.floorH || 3.4 };
    m.userData.u = { uWin, uLit, uFloorH };
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, { uNight: SU.uNight, uSnow: SU.uSnow, uWin, uLit, uFloorH, uCutOn: SU.uCutOn, uCutA: SU.uCutA, uCutB: SU.uCutB, uCutR: SU.uCutR });
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWPos; varying vec3 vWN;')
        .replace('#include <project_vertex>', '#include <project_vertex>\n vWPos = (modelMatrix * vec4(transformed,1.0)).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
        uniform float uNight; uniform float uSnow; uniform vec3 uWin; uniform float uLit; uniform float uFloorH;
        uniform float uCutOn; uniform vec3 uCutA; uniform vec3 uCutB; uniform float uCutR;
        varying vec3 vWPos; varying vec3 vWN;
        float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }`)
        .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>' + CUT_GLSL)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        totalEmissiveRadiance += cutRim * vec3(0.08, 0.55, 0.75);
        float isSide = 1.0 - step(0.6, abs(vWN.y));
        float uu = abs(vWN.x) > 0.5 ? vWPos.z : vWPos.x;
        vec2 cell = vec2(uu / 3.1, vWPos.y / uFloorH);
        vec2 f = fract(cell);
        float win = step(0.14, f.x) * step(f.x, 0.86) * step(0.24, f.y) * step(f.y, 0.80) * step(2.2, vWPos.y);
        float aa = clamp(1.25 - length(fwidth(cell)) * 0.9, 0.3, 1.0); win *= aa;
        float r = h21(floor(cell) + floor(vWPos.xz * 0.021) * 7.0);
        float lit = step(1.0 - uLit, r);
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.5 + vec3(0.03,0.05,0.08), isSide*win*0.85);
        totalEmissiveRadiance += isSide * win * lit * uWin * (0.05 + 0.95*uNight) * (0.55 + 0.45*r);
        float roof = step(0.6, vWN.y);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.9,0.93,0.98), roof * uSnow);`);
    };
    return m;
  }

  // street names painted on the asphalt; redrawn when the theme changes (white map lettering by day, soft blue by night)
  function textTexture(text, opts) {
    const light = W.theme === 'light';
    const c = document.createElement('canvas'); const ctx = c.getContext('2d');
    const font = `${light ? 700 : opts.weight || 600} 64px Inter, system-ui, sans-serif`; ctx.font = font;
    const w = Math.ceil(ctx.measureText(text).width) + 40; c.width = w; c.height = 96;
    ctx.font = font; ctx.textBaseline = 'middle'; ctx.letterSpacing = '4px';
    if (light) { ctx.lineJoin = 'round'; ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(38,46,58,0.55)'; ctx.strokeText(text, 20, 50); ctx.fillStyle = '#ffffff'; }
    else ctx.fillStyle = opts.color || 'rgba(170,190,220,0.75)';
    ctx.fillText(text, 20, 50);
    const tex = new THREE.CanvasTexture(c); tex.anisotropy = 8; tex.colorSpace = THREE.SRGBColorSpace; return { tex, w };
  }
  W.streetLabels = [];
  function textPlane(text, opts = {}) {
    const size = opts.size || 6; const { tex, w } = textTexture(text, opts);
    const m = new THREE.Mesh(new THREE.PlaneGeometry((w / 96) * size, size), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.renderOrder = 2; m.userData.text = { text, opts }; W.streetLabels.push(m); return m;
  }
  function redrawStreetLabels() { W.streetLabels.forEach((m) => { const { text, opts } = m.userData.text; const old = m.material.map; m.material.map = textTexture(text, opts).tex; m.material.needsUpdate = true; old.dispose(); }); }

  function css2d(html, cls) {
    const d = document.createElement('div'); d.className = cls || 'lbl'; d.innerHTML = html;
    const o = new A.CSS2DObject(d); o.userData.el = d; return o;
  }
  W.css2d = (h, c) => css2d(h, c);
  // materials that change color between the daylight map and the night view
  W.themedMats = [];
  function applyMatTheme(m) { const t = m.userData.theme; m.color.copy(isLight() ? t.light : t.dark); m.opacity = isLight() ? t.lightOpacity : t.darkOpacity; }
  W.themed = function (m, dark, light, o = {}) {
    m.userData.theme = { dark: new THREE.Color(dark), light: new THREE.Color(light), darkOpacity: m.opacity, lightOpacity: o.lightOpacity ?? m.opacity };
    applyMatTheme(m); W.themedMats.push(m); return m;
  };
  const roomBase = (type) => new THREE.Color(ROOM_COLORS[type] || 0x334155).lerp(new THREE.Color(0xffffff), isLight() ? 0.22 : 0.18);
  const tileOpacity = () => (isLight() ? 0.62 : 0.78);
  // CSS2D labels nested in a removed group keep their DOM node unless we detach them explicitly
  W.dropLabels = function (obj) { obj.traverse((o) => { if (o.isCSS2DObject && o.element && o.element.parentNode) o.element.parentNode.removeChild(o.element); }); };

  // ---------------------------------------------------------------- init
  W.init = function (container) {
    THREE = window.THREE; A = window.THREE_ADDONS; W.THREE = THREE; W.A = A;
    SU.uCutA.value = new THREE.Vector3(); SU.uCutB.value = new THREE.Vector3();
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    labelRenderer = new A.CSS2DRenderer(); labelRenderer.setSize(container.clientWidth, container.clientHeight);
    labelRenderer.domElement.className = 'label-layer'; container.appendChild(labelRenderer.domElement);

    scene = new THREE.Scene(); W.scene = scene;
    scene.fog = new THREE.FogExp2(0x0b1424, 0.00062);
    camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 1, 9000); W.camera = camera;
    camera.position.set(360, 330, 420);
    controls = new A.OrbitControls(camera, renderer.domElement); W.controls = controls;
    controls.target.set(-40, 0, -60); controls.enableDamping = true; controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI * 0.47; controls.minDistance = 12; controls.maxDistance = 2600;
    controls.screenSpacePanning = false; controls.zoomSpeed = 1.1;

    // lights
    W.hemi = new THREE.HemisphereLight(0xbcd2ff, 0x1a2230, 0.8); scene.add(W.hemi);
    W.sun = new THREE.DirectionalLight(0xffffff, 1.2); W.sun.position.set(300, 500, 200); scene.add(W.sun); scene.add(W.sun.target);
    W.amb = new THREE.AmbientLight(0x405070, 0.25); scene.add(W.amb);
    // sun shadows (daylight map): a 2K shadow map whose frustum follows the camera target and scales with zoom
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    W.sun.shadow.mapSize.set(2048, 2048); W.sun.shadow.bias = -0.0004; W.sun.shadow.normalBias = 0.6;
    W.sun.shadow.camera.near = 10; W.sun.shadow.camera.far = 2400; W.sunDir = new THREE.Vector3(0.5, 0.8, -0.3).normalize();

    // post
    composer = new A.EffectComposer(renderer);
    composer.addPass(new A.RenderPass(scene, camera));
    bloom = new A.UnrealBloomPass(new THREE.Vector2(container.clientWidth, container.clientHeight), 0.55, 0.5, 0.82);
    composer.addPass(bloom); composer.addPass(new A.OutputPass());
    W.bloom = bloom; W.renderer = renderer;

    buildSky(); buildGround(); buildContext(); buildMSK(); buildLandmarks(); buildRiverAndBridge(); buildStreetTrees();
    W.setTheme(W.theme);
    W.setClock(9 * 60);

    // resize
    const ro = new ResizeObserver(() => {
      const w = container.clientWidth, h = container.clientHeight; if (!w || !h) return;
      renderer.setSize(w, h); labelRenderer.setSize(w, h); composer.setSize(w, h);
      camera.aspect = w / h; applyView();
    });
    W.container = container;
    ro.observe(container);
    setupPicking(container);
    const clock = new THREE.Clock();
    W.time = 0;
    renderer.setAnimationLoop(() => {
      const dt = Math.min(clock.getDelta(), 0.1); W.time += dt;
      tweenStep(dt);
      W.ticks.forEach((f) => f(dt, W.time));
      // x-ray cone on while a story is being told or the camera follows someone
      const want = (MSK.director && MSK.director.current()) || W.follow || W.cutForce ? 1 : 0;
      SU.uCutOn.value += (want - SU.uCutOn.value) * Math.min(1, dt * 3);
      SU.uCutA.value.copy(camera.position); SU.uCutB.value.copy(controls.target);
      SU.uCutR.value = Math.max(10, camera.position.distanceTo(controls.target) * 0.11);
      if (W.sun.castShadow) {
        const T = controls.target, S = Math.min(900, Math.max(70, camera.position.distanceTo(T) * 0.85)), sc = W.sun.shadow.camera;
        W.sun.position.copy(T).addScaledVector(W.sunDir, 1000); W.sun.target.position.copy(T); W.sun.target.updateMatrixWorld();
        if (Math.abs(sc.right - S) > S * 0.08) { sc.left = -S; sc.right = S; sc.top = S; sc.bottom = -S; sc.updateProjectionMatrix(); }
      }
      controls.update();
      composer.render(); labelRenderer.render(scene, camera);
    });
  };

  // shift the projection so the camera target sits in the visible area above the dock
  W.viewShift = 0;
  function applyView() {
    const w = W.container.clientWidth, h = W.container.clientHeight;
    if (W.viewShift > 0) camera.setViewOffset(w, h, 0, W.viewShift, w, h); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }
  W.setViewShift = function (px) { W.viewShift = Math.max(0, px | 0); if (camera) applyView(); };

  // ---------------------------------------------------------------- sky & ground
  function buildSky() {
    const geo = new THREE.SphereGeometry(4200, 32, 16);
    W.skyU = { top: { value: new THREE.Color(0x0a1630) }, bot: { value: new THREE.Color(0x1c2a44) }, sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunCol: { value: new THREE.Color(0xffc080) }, sunAmt: { value: 0 }, under: { value: new THREE.Color(0x080b12) } };
    const mat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: W.skyU,
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: `uniform vec3 top; uniform vec3 bot; uniform vec3 sunDir; uniform vec3 sunCol; uniform float sunAmt; uniform vec3 under; varying vec3 vP;
        void main(){ float h = clamp(vP.y*1.6+0.12, 0.0, 1.0); vec3 c = mix(bot, top, pow(h, 0.8)); c = mix(under, c, smoothstep(-0.12, 0.0, vP.y));
        float s = max(dot(vP, normalize(sunDir)), 0.0); c += sunCol * (pow(s, 64.0)*1.2 + pow(s, 6.0)*0.25) * sunAmt;
        gl_FragColor = vec4(c, 1.0); }` });
    W.sky = new THREE.Mesh(geo, mat); scene.add(W.sky);
    // stars
    const n = 900, pos = new Float32Array(n * 3); const r = U().rng('stars');
    for (let i = 0; i < n; i++) { const th = r() * Math.PI * 2, ph = Math.acos(r() * 0.85 + 0.12); pos.set([Math.cos(th) * Math.sin(ph) * 4000, Math.cos(ph) * 4000, Math.sin(th) * Math.sin(ph) * 4000], i * 3); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    W.stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xcfe0ff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0.8, fog: false, depthWrite: false }));
    scene.add(W.stars);
  }

  function buildGround() {
    const g = G();
    W.groundMat = new THREE.MeshLambertMaterial({ color: 0x141b27, transparent: true, opacity: 1 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000), W.groundMat);
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.05; ground.receiveShadow = true; scene.add(ground); W.ground = ground;
    // blocks (sidewalk slabs)
    const geos = [];
    const westCols = [[g.xMin - 200, g.AV.second - 12], [g.AV.second + 12, g.AV.first - 12], [g.AV.first + 12, g.AV.york - 12]];
    const eastCol = [g.AV.york + 12, g.AV.fdr - 12];
    const zs = [g.zMin - 400, ...g.streetsWest.slice().reverse().map((n) => g.ST(n)), g.zMax + 400].sort((a, b) => a - b);
    const addSlab = (x0, x1, z0, z1) => { if (x1 - x0 < 2 || z1 - z0 < 2) return; const b = new THREE.BoxGeometry(x1 - x0, 0.3, z1 - z0); b.translate((x0 + x1) / 2, 0.12, (z0 + z1) / 2); geos.push(b); };
    westCols.forEach(([x0, x1]) => { for (let i = 1; i < zs.length; i++) addSlab(x0, x1, zs[i - 1] + 7, zs[i] - 7); });
    const ze = [g.zMin - 400, ...g.streetsEast.map((n) => g.ST(n)), g.zMax + 400].sort((a, b) => a - b);
    for (let i = 1; i < ze.length; i++) addSlab(eastCol[0], eastCol[1], ze[i - 1] + 7, ze[i] - 7);
    // FDR median & esplanade
    addSlab(g.AV.fdr + 11, g.riverX, g.zMin - 400, g.zMax + 400);
    W.blockMat = new THREE.MeshLambertMaterial({ color: 0x1f2836 });
    const blocks = new THREE.Mesh(A.mergeGeometries(geos), W.blockMat); blocks.receiveShadow = true; scene.add(blocks); W.blocks = blocks;
    // lane markings
    const marks = [];
    const dash = (x, z, w, d) => { const b = new THREE.BoxGeometry(w, 0.05, d); b.translate(x, 0.02, z); marks.push(b); };
    [g.AV.first, g.AV.york, g.AV.second].forEach((x) => { for (let z = g.zMin - 300; z < g.zMax + 300; z += 9) dash(x, z, 0.25, 4.5); });
    for (let z = g.zMin - 600; z < g.zMax + 600; z += 9) dash(g.AV.fdr, z, 0.25, 4.5);
    g.streetsWest.forEach((n) => { for (let x = g.xMin - 200; x < g.AV.york - 12; x += 9) dash(x, g.ST(n), 4.5, 0.25); });
    g.streetsEast.forEach((n) => { for (let x = g.AV.york + 12; x < g.AV.fdr - 12; x += 9) dash(x, g.ST(n), 4.5, 0.25); });
    // crosswalks at York
    g.streetsWest.forEach((n) => { for (let k = -10; k <= 10; k += 2) dash(-14.5 + 0, g.ST(n) + k * 0.6, 3, 0.6); });
    // zebra crosswalks across every cross street and every avenue (white paint on the daylight map)
    [[g.AV.second, [-1, 1], g.streetsWest], [g.AV.first, [-1, 1], g.streetsWest], [g.AV.york, [1], g.streetsEast]].forEach(([a, sides, sts]) => sts.forEach((n) => sides.forEach((sd) => { for (let k = -10; k <= 10; k += 2) dash(a + sd * 14.5, g.ST(n) + k * 0.6, 3, 0.6); })));
    [g.AV.second, g.AV.first, g.AV.york].forEach((a) => g.streetsWest.forEach((n) => [-9.6, 9.6].forEach((dz) => { if (a === g.AV.york && dz < 0 && !g.streetsEast.includes(n)) return; for (let k = -18; k <= 18; k += 2) dash(a + k * 0.62, g.ST(n) + dz, 0.6, 3); })));
    W.markMat = W.themed(new THREE.MeshBasicMaterial(), 0x3c4a60, 0xf4f2ec);
    scene.add(new THREE.Mesh(A.mergeGeometries(marks), W.markMat));
    // labels
    const lab = (t, x, z, rot, size) => { const p = textPlane(t, { size: size || 6 }); p.position.set(x, 0.35, z); p.rotation.z = rot || 0; scene.add(p); return p; };
    g.streetsWest.forEach((n) => { if (n % 1 === 0) lab(`E ${n}${n === 61 || n === 71 ? 'st' : n === 62 || n === 72 ? 'nd' : n === 63 || n === 73 ? 'rd' : 'th'} St`, -120 + (n % 2 ? -50 : 0), g.ST(n), 0, 4.2); });
    for (let z = g.zMin + 40; z < g.zMax; z += 260) { lab('YORK AVE', 0, z, Math.PI / 2, 5); lab('1ST AVE', g.AV.first, z + 120, Math.PI / 2, 5); }
    for (let z = g.zMin; z < g.zMax + 200; z += 340) lab('FDR DRIVE', g.AV.fdr, z, Math.PI / 2, 5);
  }

  // ---------------------------------------------------------------- context buildings
  function inRect(x0, x1, z0, z1, r, pad = 3) { return !(x1 < r.x0 - pad || x0 > r.x1 + pad || z1 < r.z0 - pad || z0 > r.z1 + pad); }
  function buildContext() {
    const g = G(); const rnd = U().rng('city');
    const excl = [...MSK.campus.buildings.map((b) => ({ x0: b.x0, x1: b.x1, z0: b.z0, z1: b.z1 })), ...MSK.campus.landmarks.map((l) => l)];
    const geos = [];
    const addB = (x0, x1, z0, z1, h) => { const b = new THREE.BoxGeometry(x1 - x0, h, z1 - z0); b.translate((x0 + x1) / 2, h / 2 + 0.2, (z0 + z1) / 2); geos.push(b); };
    const fillBlock = (bx0, bx1, bz0, bz1, edgeAve) => {
      // split block into two rows (north/south half) of lots along x
      const halves = [[bz0, (bz0 + bz1) / 2 - 1], [(bz0 + bz1) / 2 + 1, bz1]];
      halves.forEach(([z0, z1]) => {
        let x = bx0;
        while (x < bx1 - 6) {
          const w = Math.min(bx1 - x, 14 + rnd() * 34);
          const lot = { x0: x + 1, x1: x + w - 1, z0: z0 + 1, z1: z1 - 1 };
          x += w;
          if (excl.some((r) => inRect(lot.x0, lot.x1, lot.z0, lot.z1, r))) continue;
          const nearAve = Math.min(Math.abs(lot.x1 - edgeAve), Math.abs(lot.x0 - edgeAve)) < 30;
          let h = 14 + rnd() * 30; if (nearAve && rnd() < 0.45) h = 50 + rnd() * 90; if (rnd() < 0.04) h = 150 + rnd() * 60;
          // keep the MSK buildings readable: context near the campus stays lower
          const cx = (lot.x0 + lot.x1) / 2, cz = (lot.z0 + lot.z1) / 2;
          const dMSK = Math.min(...MSK.campus.buildings.map((b) => Math.hypot(cx - (b.x0 + b.x1) / 2, cz - (b.z0 + b.z1) / 2)));
          h = Math.min(h, dMSK < 160 ? 42 : dMSK < 320 ? 70 : 220);
          addB(lot.x0, lot.x1, lot.z0, lot.z1, h);
        }
      });
    };
    const zs = [g.zMin - 300, ...g.streetsWest.map((n) => g.ST(n)), g.zMax + 300].sort((a, b) => a - b);
    for (let i = 1; i < zs.length; i++) {
      const z0 = zs[i - 1] + 11, z1 = zs[i] - 11;
      fillBlock(g.AV.first + 17, g.AV.york - 17, z0, z1, g.AV.york);
      fillBlock(g.AV.second + 17, g.AV.first - 17, z0, z1, g.AV.first);
      fillBlock(g.xMin - 200, g.AV.second - 17, z0, z1, g.AV.second);
    }
    const ze = [g.zMin - 300, ...g.streetsEast.map((n) => g.ST(n)), g.zMax + 300].sort((a, b) => a - b);
    for (let i = 1; i < ze.length; i++) fillBlock(g.AV.york + 17, g.AV.fdr - 14, ze[i - 1] + 11, ze[i] - 11, g.AV.york);
    W.cityMat = windowMaterial({ color: 0x2a3446, win: 0xffcf8a, lit: 0.42, floorH: 3.3 }); W.cityMat.vertexColors = true;
    const city = new THREE.Mesh(paintFacades(A.mergeGeometries(geos), 'city'), W.cityMat); city.castShadow = city.receiveShadow = true; scene.add(city); W.city = city;
    // rooftop edge glow
    const eg = new THREE.EdgesGeometry(city.geometry, 30);
    W.cityEdges = new THREE.LineSegments(eg, new THREE.LineBasicMaterial({ color: 0x33415a, transparent: true, opacity: 0.35 }));
    scene.add(W.cityEdges);
  }

  // facade palette for the daylight map: one tone per building box (towers lean to glass & limestone, walk-ups to brick & brownstone)
  W.facadeGeos = [];
  const FACADES_LOW = [0xc99a80, 0xb7866c, 0xd9c3a5, 0xe6dccb, 0xa77d66, 0xcfc6b8, 0xd4b49a];
  const FACADES_TALL = [0xeae5dc, 0xd8dde3, 0xc3d0dd, 0xe2d6c2, 0xf2efe9, 0xb9c6d3];
  function paintFacades(geo, seed) {
    const rnd = U().rng('facade-' + seed); const pos = geo.attributes.position; const n = pos.count;
    const light = new Float32Array(n * 3), dark = new Float32Array(n * 3).fill(1); const c = new THREE.Color();
    for (let i = 0; i < n; i += 24) { // BoxGeometry = 24 vertices per box
      let top = 0; for (let k = i; k < Math.min(n, i + 24); k++) top = Math.max(top, pos.getY(k));
      const pal = top > 55 ? FACADES_TALL : FACADES_LOW; c.setHex(pal[Math.floor(rnd() * pal.length)]);
      const j = 0.94 + rnd() * 0.1; for (let k = i; k < Math.min(n, i + 24); k++) light.set([c.r * j, c.g * j, c.b * j], k * 3);
    }
    geo.userData.facade = { light: new THREE.BufferAttribute(light, 3), dark: new THREE.BufferAttribute(dark, 3) };
    geo.setAttribute('color', isLight() ? geo.userData.facade.light : geo.userData.facade.dark); W.facadeGeos.push(geo); return geo;
  }

  function buildLandmarks() {
    const geos = [];
    MSK.campus.landmarks.forEach((L) => {
      L.masses.forEach((m) => { const b = new THREE.BoxGeometry(m.x1 - m.x0, m.h, m.z1 - m.z0); b.translate((m.x0 + m.x1) / 2, m.h / 2 + 0.2, (m.z0 + m.z1) / 2); geos.push(b);
        if (m.crown) { const c = new THREE.BoxGeometry((m.x1 - m.x0) * 0.6, 14, (m.z1 - m.z0) * 0.6); c.translate((m.x0 + m.x1) / 2, m.h + 7, (m.z0 + m.z1) / 2); geos.push(c); const c2 = new THREE.BoxGeometry((m.x1 - m.x0) * 0.3, 16, (m.z1 - m.z0) * 0.3); c2.translate((m.x0 + m.x1) / 2, m.h + 22, (m.z0 + m.z1) / 2); geos.push(c2); } });
      const lbl = css2d(`<span>${U().esc(L.name)}</span>`, 'lbl lbl-context'); const top = Math.max(...L.masses.map((m) => m.h));
      lbl.position.set((L.x0 + L.x1) / 2, top + 14, (L.z0 + L.z1) / 2); scene.add(lbl);
      if (L.campus) { const lawn = new THREE.Mesh(new THREE.BoxGeometry(L.x1 - L.x0, 0.4, L.z1 - L.z0), W.themed(new THREE.MeshLambertMaterial(), 0x1b3326, 0x9cc78a)); lawn.receiveShadow = true; lawn.position.set((L.x0 + L.x1) / 2, 0.3, (L.z0 + L.z1) / 2); scene.add(lawn); W.lawn = lawn;
        // trees
        const r = U().rng('trees'); const tg = [];
        for (let i = 0; i < 80; i++) { const x = L.x0 + 8 + r() * (L.x1 - L.x0 - 16), z = L.z0 + 8 + r() * (L.z1 - L.z0 - 16); if (L.masses.some((m) => inRect(x - 4, x + 4, z - 4, z + 4, m, 2))) continue; const s = new THREE.IcosahedronGeometry(3 + r() * 2.5, 0); s.translate(x, 6 + r() * 2, z); tg.push(s); }
        W.trees = new THREE.Mesh(A.mergeGeometries(tg), W.themed(new THREE.MeshLambertMaterial({ flatShading: true }), 0x24533a, 0x4f8f45)); W.trees.castShadow = true; scene.add(W.trees); }
      if (L.dome) { const d = new THREE.Mesh(new THREE.SphereGeometry(L.dome.r, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), W.themed(new THREE.MeshLambertMaterial(), 0x55657c, 0xc9ced6)); d.castShadow = true; d.position.set(L.dome.x, 0.5, L.dome.z); d.scale.y = 0.8; scene.add(d); }
    });
    W.landMat = windowMaterial({ color: 0x323d52, win: 0xffe2b0, lit: 0.6, floorH: 4 });
    W.landMesh = new THREE.Mesh(A.mergeGeometries(geos), W.landMat); W.landMesh.castShadow = W.landMesh.receiveShadow = true; scene.add(W.landMesh);
  }

  function buildRiverAndBridge() {
    const g = G();
    W.riverU = { t: { value: 0 }, col: { value: new THREE.Color(0x0d2236) }, hi: { value: new THREE.Color(0x2a5a7c) } };
    const river = new THREE.Mesh(new THREE.PlaneGeometry(2400, 6000, 1, 1), new THREE.ShaderMaterial({ uniforms: Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog), W.riverU), transparent: false, fog: true,
      vertexShader: '#include <fog_pars_vertex>\nvarying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; vec4 mvPosition = viewMatrix*w; gl_Position = projectionMatrix*mvPosition; \n#include <fog_vertex>\n}',
      fragmentShader: `#include <fog_pars_fragment>
        uniform float t; uniform vec3 col; uniform vec3 hi; varying vec3 vW;
        void main(){ float a = sin(vW.z*0.045 + t*0.8 + sin(vW.x*0.02)*2.0)*0.5+0.5; float b = sin(vW.z*0.13 - t*1.3 + vW.x*0.05)*0.5+0.5;
        float n = sin(vW.x*0.031 + vW.z*0.017 + t*0.4) * sin(vW.z*0.053 - vW.x*0.023 - t*0.7); vec3 c = mix(col, hi, smoothstep(0.55, 1.0, a*b) * 0.22 + n * 0.06); gl_FragColor = vec4(c,1.0);
        #include <fog_fragment>
        }` }));
    river.rotation.x = -Math.PI / 2; river.position.set(g.riverX + 1200, 0.02, 0); scene.add(river); W.river = river;
    W.ticks.push((dt, t) => { W.riverU.t.value = t; });
    // Roosevelt Island
    const ri = new THREE.Mesh(new THREE.BoxGeometry(150, 1.2, 2600), W.themed(new THREE.MeshLambertMaterial(), 0x1d2d25, 0xa9c99a)); ri.receiveShadow = true; ri.position.set(g.riverX + 260, 0.4, -200); scene.add(ri);
    const rg = []; const r = U().rng('ri');
    for (let i = 0; i < 26; i++) { const z = -1400 + i * 95 + r() * 30, h = 10 + r() * 50; const b = new THREE.BoxGeometry(30 + r() * 30, h, 26 + r() * 40); b.translate(g.riverX + 240 + r() * 40, h / 2, z); rg.push(b); }
    const riB = new THREE.Mesh(paintFacades(A.mergeGeometries(rg), 'ri'), W.cityMat); riB.castShadow = riB.receiveShadow = true; scene.add(riB);
    // Queens shore
    const qs = new THREE.Mesh(new THREE.BoxGeometry(1400, 1, 6000), W.themed(new THREE.MeshLambertMaterial(), 0x161d29, 0xd9d5cc)); qs.position.set(g.riverX + 1150, 0.3, 0); scene.add(qs);
    // Queensboro Bridge (stylized cantilever truss) near E 59th–60th St
    const bz = g.ST(59) + 45, bridge = new THREE.Group();
    const steel = W.themed(new THREE.MeshLambertMaterial(), 0x5b6676, 0x8f9aa6);
    const deck = new THREE.Mesh(new THREE.BoxGeometry(1500, 3, 26), steel); deck.position.set(g.riverX + 150, 40, bz); bridge.add(deck);
    [g.AV.york + 120, g.riverX + 60, g.riverX + 300, g.riverX + 540].forEach((x) => {
      [-11, 11].forEach((dz) => { const tw = new THREE.Mesh(new THREE.BoxGeometry(8, 105, 6), steel); tw.position.set(x, 52, bz + dz); bridge.add(tw); const sp = new THREE.Mesh(new THREE.ConeGeometry(4, 18, 4), steel); sp.position.set(x, 113, bz + dz); bridge.add(sp); });
    });
    const tr = []; for (let x = -540; x <= 960; x += 24) { [-12, 12].forEach((dz) => { const y = 66 + Math.cos((((x + 540) % 240) / 240) * Math.PI * 2) * 22; const v = new THREE.BoxGeometry(1.2, y - 40, 1.2); v.translate(g.riverX + 150 + x - 750 + 540, 40 + (y - 40) / 2, bz + dz); tr.push(v); }); }
    bridge.add(new THREE.Mesh(A.mergeGeometries(tr), steel));
    bridge.traverse((o) => { if (o.isMesh) o.castShadow = true; }); scene.add(bridge);
    const bl = css2d('<span>Queensboro Bridge</span>', 'lbl lbl-context'); bl.position.set(g.riverX + 150, 130, bz); scene.add(bl);
    const rl = css2d('<span>East River</span>', 'lbl lbl-water'); rl.position.set(g.riverX + 90, 4, -300); scene.add(rl);
    const rl2 = css2d('<span>Roosevelt Island</span>', 'lbl lbl-context'); rl2.position.set(g.riverX + 260, 40, -500); scene.add(rl2);
    // flood plane (raised by weather)
    W.flood = new THREE.Mesh(new THREE.BoxGeometry(g.riverX - g.AV.fdr + 36, 1, 2600), new THREE.MeshLambertMaterial({ color: 0x1e4d72, transparent: true, opacity: 0.0, depthWrite: false }));
    W.flood.position.set((g.AV.fdr - 22 + g.riverX) / 2, -0.6, 0); scene.add(W.flood);
  }

  // ---------------------------------------------------------------- street trees (instanced) along every sidewalk
  function buildStreetTrees() {
    const g = G(); const r = U().rng('street-trees'); const pts = [];
    const excl = [...MSK.campus.buildings.map((b) => ({ x0: b.x0, x1: b.x1, z0: b.z0, z1: b.z1 })), ...MSK.campus.landmarks];
    const doors = []; MSK.campus.buildings.forEach((b) => b.entrances.forEach((e) => doors.push(e.door)));
    const ok = (x, z) => !excl.some((R) => inRect(x - 2.5, x + 2.5, z - 2.5, z + 2.5, R, 0.5)) && !doors.some((d) => Math.hypot(d.x - x, d.z - z) < 11);
    const aves = [g.AV.second, g.AV.first, g.AV.york];
    const crossZ = [...new Set([...g.streetsWest, ...g.streetsEast])].map((n) => g.ST(n));
    const row = (x0, x1, z) => { for (let x = x0; x < x1; x += 8.5 + r() * 3) { if (aves.some((a) => Math.abs(x - a) < 19) || r() < 0.16) continue; if (ok(x, z)) pts.push([x, z]); } };
    g.streetsWest.forEach((n) => [-9.3, 9.3].forEach((dz) => row(g.xMin + 10, g.AV.york - 16, g.ST(n) + dz)));
    g.streetsEast.forEach((n) => [-9.3, 9.3].forEach((dz) => row(g.AV.york + 16, g.AV.fdr - 16, g.ST(n) + dz)));
    aves.forEach((a) => [-14.8, 14.8].forEach((dx) => { for (let z = g.zMin; z < g.zMax; z += 9.5 + r() * 3) { if (crossZ.some((cz) => Math.abs(z - cz) < 15) || r() < 0.2) continue; if (ok(a + dx, z)) pts.push([a + dx, z]); } }));
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 3.4, 6); trunkGeo.translate(0, 1.7, 0);
    const crownGeo = new THREE.IcosahedronGeometry(2.4, 1); crownGeo.translate(0, 5.2, 0);
    const trunks = new THREE.InstancedMesh(trunkGeo, W.themed(new THREE.MeshLambertMaterial(), 0x2a2420, 0x6b5340), pts.length);
    const crowns = new THREE.InstancedMesh(crownGeo, W.themed(new THREE.MeshLambertMaterial({ flatShading: true }), 0x4a6a55, 0xffffff), pts.length);
    const greens = [0x4f8f45, 0x5c9a4c, 0x427f3c, 0x6aa452, 0x56894a]; const d = new THREE.Object3D();
    pts.forEach(([x, z], i) => { const sc = 0.8 + r() * 0.45; d.position.set(x, 0.2, z); d.rotation.set(0, r() * 6.3, 0); d.scale.set(sc, sc * (0.9 + r() * 0.25), sc); d.updateMatrix(); trunks.setMatrixAt(i, d.matrix); crowns.setMatrixAt(i, d.matrix); crowns.setColorAt(i, new THREE.Color(greens[Math.floor(r() * greens.length)])); });
    trunks.castShadow = crowns.castShadow = true; crowns.receiveShadow = true;
    scene.add(trunks, crowns); W.streetTrees = { trunks, crowns, count: pts.length };
  }

  // ---------------------------------------------------------------- theme: daylight street map <-> night operations view
  W.LCFG = { hemi: 1.55, sun: 3.1, amb: 0.3, road: 0x80868f, walk: 0xdcd8cf, city: 0xf2f2f2, land: 0xd8cfc0, msk: 0x86b4e0, fog: 0.6 };
  W.setTheme = function (t) {
    W.theme = t === 'dark' ? 'dark' : 'light'; const L = isLight();
    document.documentElement.dataset.theme = W.theme;
    W.themedMats.forEach(applyMatTheme);
    W.facadeGeos.forEach((geo) => geo.setAttribute('color', L ? geo.userData.facade.light : geo.userData.facade.dark));
    redrawStreetLabels();
    W.riverU.col.value.setHex(L ? 0x3d7fb6 : 0x0d2236); W.riverU.hi.value.setHex(L ? 0xa4d0ec : 0x2a5a7c);
    W.skyU.under.value.setHex(L ? 0xcdd8e3 : 0x080b12);
    W.cityEdges.material.color.setHex(L ? 0x7a746b : 0x33415a); W.cityEdges.material.opacity = L ? 0.2 : 0.35;
    bloom.strength = L ? 0.16 : 0.55; bloom.threshold = L ? 0.98 : 0.82;
    renderer.toneMappingExposure = L ? 1.0 : 1.05;
    W.sun.castShadow = L;
    W.hemi.color.setHex(L ? 0xeaf2ff : 0xbcd2ff); W.hemi.groundColor.setHex(L ? 0xbcb2a0 : 0x1a2230);
    W.amb.color.setHex(L ? 0xffffff : 0x405070); W.ambBase = L ? W.LCFG.amb : 0.25; W.amb.intensity = W.ambBase;
    if (!L) W.sun.color.set(0xffffff);
    W.setFogDensity(W.fogD ?? 0.00062);
    Object.values(W.buildings).forEach((rec) => Object.values(rec.levels).forEach((lv) => { if (lv.rooms) lv.rooms.tiles.forEach((tile) => { tile.userData.base = roomBase(tile.userData.rtype); }); }));
    W.refreshSpaces(); Object.values(W.buildings).forEach((rec) => Object.values(rec.levels).forEach((lv) => { if (lv.rooms) reapplyHighlights(lv); }));
    if (W.clockMin != null) W.setClock(W.clockMin);
    if (MSK.bus) MSK.bus.emit('theme', W.theme);
  };

  // ---------------------------------------------------------------- MSK buildings
  const ROOM_COLORS = {
    patient: 0x2f6fb5, icu: 0x8b5cf6, or: 0x10b981, pacu: 0x14b8a6, preop: 0x0ea5e9, ucc: 0xef4444, waiting: 0x64748b, lobby: 0x475569, admin: 0x6366f1,
    security: 0xf59e0b, retail: 0xa16207, clinical: 0x0891b2, pharmacy: 0xdb2777, imaging: 0x7c3aed, kitchen: 0xd97706, robot: 0x94a3b8, storage: 0x4b5563,
    support: 0x52525b, it: 0x0284c7, ops: 0x7c3aed, office: 0x3f3f46, lounge: 0x15803d, stair: 0x27272a, utility: 0x3f3f46, mech: 0x78350f, dock: 0x57534e,
    lab: 0x0f766e, exam: 0x1d4ed8, infusion: 0x0e7490,
  };
  W.ROOM_COLORS = ROOM_COLORS;
  function buildMSK() {
    MSK.campus.buildings.forEach((b) => {
      const grp = new THREE.Group(); grp.userData.building = b.id; scene.add(grp);
      const mat = windowMaterial({ color: 0x24456e, win: 0xbfe6ff, lit: 0.62, floorH: b.floorH });
      const rec = { b, group: grp, mat, levels: {}, ghost: W.themed(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.07, depthWrite: false }), 0x5fd4ff, 0x2b7bbf, { lightOpacity: 0.1 }) };
      b.levels.forEach((L) => {
        const r = L.rect, h = b.floorH - 0.12;
        const shell = new THREE.Mesh(new THREE.BoxGeometry(r.x1 - r.x0, h, r.z1 - r.z0), mat);
        shell.position.set((r.x0 + r.x1) / 2, L.y + h / 2, (r.z0 + r.z1) / 2);
        shell.userData = { building: b.id, level: L.n, pick: 'building' };
        if (L.n < 0) shell.visible = false; shell.castShadow = shell.receiveShadow = true;
        grp.add(shell); W.pickables.push(shell);
        rec.levels[L.n] = { L, shell, rooms: null };
      });
      // outline edges per mass
      const masses = b.tower ? [{ x0: b.x0, x1: b.x1, z0: b.z0, z1: b.z1, y0: 0, y1: (b.tower.from - 1) * b.floorH }, { ...b.tower, y0: (b.tower.from - 1) * b.floorH, y1: b.height }] : [{ x0: b.x0, x1: b.x1, z0: b.z0, z1: b.z1, y0: 0, y1: b.height }];
      const eg = [];
      masses.forEach((m) => { const g = new THREE.EdgesGeometry(new THREE.BoxGeometry(m.x1 - m.x0, m.y1 - m.y0, m.z1 - m.z0)); g.translate((m.x0 + m.x1) / 2, (m.y0 + m.y1) / 2, (m.z0 + m.z1) / 2); eg.push(g); });
      // floor lines
      const pts = [];
      b.levels.forEach((L) => { if (L.n < 1) return; const r = L.rect, y = L.y; pts.push(r.x0, y, r.z0, r.x1, y, r.z0, r.x1, y, r.z0, r.x1, y, r.z1, r.x1, y, r.z1, r.x0, y, r.z1, r.x0, y, r.z1, r.x0, y, r.z0); });
      const fl = new THREE.BufferGeometry(); fl.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      rec.edges = new THREE.LineSegments(A.mergeGeometries(eg), W.themed(new THREE.LineBasicMaterial({ transparent: true, opacity: 0.9 }), 0x5fd4ff, 0x0b5f94));
      rec.floorLines = new THREE.LineSegments(fl, W.themed(new THREE.LineBasicMaterial({ transparent: true, opacity: 0.35 }), 0x3aa5d8, 0x1d6fa5));
      grp.add(rec.edges, rec.floorLines);
      // rooftop units
      const top = b.levels.filter((l) => l.n > 0).slice(-1)[0], tr = top.rect;
      const ru = []; const rr = U().rng(b.id);
      for (let i = 0; i < 6; i++) { const w = 4 + rr() * 8, d = 4 + rr() * 8, h = 2 + rr() * 4; const x = tr.x0 + 6 + rr() * (tr.x1 - tr.x0 - 12), z = tr.z0 + 6 + rr() * (tr.z1 - tr.z0 - 12); const g = new THREE.BoxGeometry(w, h, d); g.translate(x, b.height + h / 2, z); ru.push(g); }
      rec.roof = new THREE.Mesh(A.mergeGeometries(ru), W.themed(new THREE.MeshLambertMaterial(), 0x3b4a5e, 0xb4bcc7)); rec.roof.castShadow = true; grp.add(rec.roof);
      // label
      const lbl = css2d(`<b>${U().esc(b.short)}</b><small>${U().esc(b.address)}</small>`, 'lbl lbl-msk');
      lbl.position.set((tr.x0 + tr.x1) / 2, b.height + 12, (tr.z0 + tr.z1) / 2);
      lbl.userData.el.addEventListener('click', (e) => { e.stopPropagation(); MSK.bus.emit('pick:building', { b: b.id }); });
      grp.add(lbl); rec.label = lbl;
      // entrances markers
      b.entrances.forEach((e) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(e.side === 'east' || e.side === 'west' ? 0.6 : 6, 3.4, e.side === 'east' || e.side === 'west' ? 6 : 0.6), new THREE.MeshBasicMaterial({ color: 0x7dd3fc }));
        m.position.set(e.door.x, 1.7, e.door.z); grp.add(m);
        const canopy = new THREE.Mesh(new THREE.BoxGeometry(e.side === 'east' || e.side === 'west' ? 4 : 9, 0.4, e.side === 'east' || e.side === 'west' ? 9 : 4), new THREE.MeshLambertMaterial({ color: 0x9fb4cc }));
        const o = { east: [2, 0], west: [-2, 0], north: [0, -2], south: [0, 2] }[e.side]; canopy.position.set(e.door.x + o[0], 4.2, e.door.z + o[1]); grp.add(canopy);
      });
      W.buildings[b.id] = rec;
    });
  }

  // ---------------------------------------------------------------- room build per level
  function buildRooms(rec, L) {
    const b = rec.b; const g = new THREE.Group(); const y = L.y; const r = L.rect;
    const slab = new THREE.Mesh(new THREE.BoxGeometry(r.x1 - r.x0, 0.35, r.z1 - r.z0), W.themed(new THREE.MeshLambertMaterial(), 0x0e1726, 0xe9edf2));
    slab.position.set((r.x0 + r.x1) / 2, y - 0.17, (r.z0 + r.z1) / 2); g.add(slab);
    const corr = new THREE.Mesh(new THREE.PlaneGeometry(r.x1 - r.x0 - 2, MSK.geo.corrW), W.themed(new THREE.MeshBasicMaterial(), 0x1b2a40, 0xd3dbe5));
    corr.rotation.x = -Math.PI / 2; corr.position.set((r.x0 + r.x1) / 2, y + 0.03, L.zc); g.add(corr);
    const wallGeos = [], furn = [], tiles = [];
    const WH = 2.4, T = 0.22;
    const wall = (x0, z0, x1, z1) => { const len = Math.hypot(x1 - x0, z1 - z0); const bg = new THREE.BoxGeometry(Math.abs(x1 - x0) > 0.01 ? len : T, WH, Math.abs(z1 - z0) > 0.01 ? len : T); bg.translate((x0 + x1) / 2, y + WH / 2, (z0 + z1) / 2); wallGeos.push(bg); };
    const fbox = (x, z, w, d, h, yo = 0) => { const bg = new THREE.BoxGeometry(w, h, d); bg.translate(x, y + yo + h / 2, z); furn.push(bg); };
    L.rooms.forEach((rm) => {
      const w = rm.x1 - rm.x0, d = rm.z1 - rm.z0;
      const mat = new THREE.MeshBasicMaterial({ color: roomBase(rm.type), transparent: true, opacity: 0.78, depthWrite: false });
      const tile = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.5, d - 0.5), mat);
      tile.rotation.x = -Math.PI / 2; tile.position.set(rm.cx, y + 0.06, rm.cz);
      tile.userData = { pick: 'room', room: rm.key, rtype: rm.type, base: tile.material.color.clone() };
      g.add(tile); tiles.push(tile); W.pickables.push(tile);
      // walls: back wall + side walls + corridor wall with door gap
      const back = rm.side === 'n' ? rm.z0 : rm.z1, front = rm.side === 'n' ? rm.z1 : rm.z0;
      wall(rm.x0, back, rm.x1, back); wall(rm.x0, rm.z0, rm.x0, rm.z1); wall(rm.x1, rm.z0, rm.x1, rm.z1);
      const gap = Math.min(2.2, w * 0.35); wall(rm.x0, front, rm.cx - gap / 2, front); wall(rm.cx + gap / 2, front, rm.x1, front);
      // furniture by type
      const inward = rm.side === 'n' ? 1 : -1;
      if (rm.type === 'patient' || rm.type === 'icu' || rm.type === 'pacu' && w < 12) { fbox(rm.cx - w * 0.15, back + inward * 3, 1.1, 2.2, 0.7); fbox(rm.cx + w * 0.25, back + inward * 1.2, 0.9, 0.6, 1.3); }
      else if (rm.type === 'or') { fbox(rm.cx, rm.cz, 0.9, 2.2, 1.0); fbox(rm.cx + 2.5, rm.cz - 1, 0.8, 0.8, 1.6); fbox(rm.cx - 2.6, rm.cz + 1, 1.2, 0.8, 1.4); }
      else if (rm.type === 'waiting' || rm.type === 'lobby' || rm.type === 'lounge') { for (let i = 0; i < Math.floor(w / 3); i++) for (let j = 0; j < 2; j++) fbox(rm.x0 + 1.8 + i * 3, rm.cz + (j - 0.5) * 4, 2.2, 0.7, 0.5); }
      else if (rm.type === 'kitchen') { fbox(rm.cx, rm.cz, w * 0.7, 1.2, 1.0); fbox(rm.cx, back + inward * 1, w * 0.85, 0.8, 1.1); }
      else if (rm.type === 'it') { for (let i = 0; i < Math.max(1, Math.floor(w / 2.4)); i++) fbox(rm.x0 + 1.2 + i * 2.4, rm.cz, 0.7, 1.1, 2.1); }
      else if (rm.type === 'ops') { for (let i = 0; i < Math.floor(w / 4); i++) fbox(rm.x0 + 2 + i * 4, rm.cz, 3, 1, 0.8); fbox(rm.cx, back + inward * 0.4, w * 0.8, 0.3, 2.2, 0.4); }
      else if (rm.type === 'infusion' || rm.type === 'exam' || rm.type === 'preop' || rm.type === 'ucc') { fbox(rm.cx, rm.cz, 1.0, 1.9, 0.8); }
      else if (rm.type === 'lab') { fbox(rm.cx, rm.cz - 2, w * 0.7, 1, 1); fbox(rm.cx, rm.cz + 2, w * 0.7, 1, 1); }
      else if (rm.type === 'mech') { fbox(rm.cx - w * 0.2, rm.cz, w * 0.3, d * 0.5, 3); fbox(rm.cx + w * 0.22, rm.cz, w * 0.2, d * 0.4, 2.2); }
      // label
      const isNum = /^\d+$/.test(rm.code);
      const lb = css2d(`<span>${U().esc(isNum ? rm.code : rm.name.replace(/ \(.*\)/, ''))}</span>`, 'lbl lbl-room' + (isNum ? ' num' : ''));
      lb.position.set(rm.cx, y + 3.2, rm.cz); lb.userData.el.addEventListener('click', (e) => { e.stopPropagation(); MSK.bus.emit('pick:room', { key: rm.key }); });
      g.add(lb);
    });
    // cores
    b.cores.forEach((c) => {
      // elevator lobby floor (the glass shaft and cars are drawn by MSK.elevators)
      const lob = new THREE.Mesh(new THREE.PlaneGeometry(10, 6), W.themed(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.85, depthWrite: false }), 0x16324d, 0xb9d3ea));
      lob.rotation.x = -Math.PI / 2; lob.position.set(c.x, y + 0.05, L.zc - 4.6); g.add(lob);
      const lb = css2d(`<span>⇅ ${U().esc(c.label)}</span>`, 'lbl lbl-core'); lb.position.set(c.x, y + 0.6, L.zc - 4.2); g.add(lb);
    });
    const wallGeo = A.mergeGeometries(wallGeos); const walls = new THREE.Mesh(wallGeo, W.themed(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.2, depthWrite: false }), 0x8cc4f0, 0x9fb2c6, { lightOpacity: 0.42 })); g.add(new THREE.LineSegments(new THREE.EdgesGeometry(wallGeo, 20), W.themed(new THREE.LineBasicMaterial({ transparent: true, opacity: 0.55 }), 0x7dd3fc, 0x3d5875)));
    g.add(walls);
    if (furn.length) g.add(new THREE.Mesh(A.mergeGeometries(furn), W.themed(new THREE.MeshLambertMaterial(), 0xc7d2e0, 0x8996a6)));
    // access points (Cisco Wi-Fi 7) along corridor + room centers of large rooms
    const aps = [];
    for (let x = r.x0 + 8; x < r.x1 - 4; x += 16) aps.push([x, L.zc]);
    L.rooms.forEach((rm) => { if ((rm.x1 - rm.x0) > 14) aps.push([rm.cx, rm.cz]); });
    const apG = new THREE.Group();
    aps.forEach(([x, z]) => {
      const ap = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.12, 16), new THREE.MeshBasicMaterial({ color: 0xe8f4ff })); ap.position.set(x, y + b.floorH - 0.6, z); apG.add(ap);
      const ring = new THREE.Mesh(new THREE.RingGeometry(1, 1.2, 32), new THREE.MeshBasicMaterial({ color: 0x4f8cff, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2; ring.position.set(x, y + 0.12, z); ring.userData.ring = true; apG.add(ring);
    });
    apG.visible = W.overlay.spaces; g.add(apG);
    // ambient occupants (patients in beds, staff, visitors) from Spaces occupancy
    const occ = []; const rr = U().rng(L.key + 'occ');
    L.rooms.forEach((rm) => {
      if (/^(SUP|STW|STE|IDF|MDF|ELEVM|GEN|CHILL|AHU)/.test(rm.code)) return;
      const d = W.roomData(rm.key, 600); const n = Math.min(rm.type === 'waiting' || rm.type === 'lobby' || rm.type === 'retail' ? 8 : 3, d.people);
      for (let i = 0; i < n; i++) {
        const isPatient = (rm.type === 'patient' || rm.type === 'icu') && i === 0;
        occ.push({ x: rm.x0 + 1.2 + rr() * (rm.x1 - rm.x0 - 2.4), z: rm.z0 + 1.2 + rr() * (rm.z1 - rm.z0 - 2.4), c: isPatient ? 0x93c5fd : rm.type === 'clinical' || rm.type === 'or' || rm.type === 'pacu' ? 0x6ee7b7 : 0xb6c2d4, lie: isPatient });
      }
    });
    if (occ.length) {
      const geo = new THREE.CapsuleGeometry(0.3, 0.85, 3, 6); geo.translate(0, 0.75, 0);
      const im = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color: 0xffffff }), occ.length);
      const dm = new THREE.Object3D();
      occ.forEach((o, i) => { dm.position.set(o.x, y + (o.lie ? 0.7 : 0), o.z); dm.rotation.set(o.lie ? Math.PI / 2 : 0, rr() * 6, 0); dm.scale.setScalar(1.45); dm.updateMatrix(); im.setMatrixAt(i, dm.matrix); im.setColorAt(i, new THREE.Color(o.c)); });
      g.add(im);
    }
    rec.levels[L.n].rooms = { group: g, tiles, apG };
    rec.group.add(g);
    applySpacesColors(rec.levels[L.n]);
    return rec.levels[L.n].rooms;
  }

  // ---------------------------------------------------------------- Spaces room data (deterministic + time-varying)
  W.roomData = function (key, minutes) {
    const loc = MSK.loc(key); if (!loc) return null; const rm = loc.room || { type: 'outdoor' };
    if (!loc.room) {
      const r0 = U().rng(key); const t0 = (minutes ?? W.clockMin ?? 600) / 60; const dc = Math.max(0.05, Math.sin(((t0 - 6) / 16) * Math.PI));
      const occ = Math.min(1, dc * (0.35 + r0() * 0.5)); const cap = loc.kind === 'garage' ? 400 : 40;
      const wx = MSK.weather ? MSK.weather.state.type : 'clear';
      return { key, label: loc.label, sub: 'Outdoor zone · Cisco Spaces (Wi-Fi 7 + OpenRoaming at the curb)', type: 'outdoor', people: Math.round(occ * cap), cap, occ,
        temp: wx === 'snow' ? 27 : wx === 'heat' ? 101 : 58 + r0() * 6, hum: wx === 'storm' || wx === 'rain' ? 92 : 55, co2: 420, noise: Math.round(62 + r0() * 10), light: 0, dwell: Math.round(2 + r0() * 6),
        assets: loc.kind === 'curb' ? ['Wheelchairs at curb ×' + (1 + Math.floor(r0() * 4))] : [], aps: 2, clients: Math.round(occ * cap * 1.6), rssi: -(58 + Math.round(r0() * 10)), health: 95, lastClean: 0,
        status: `${Math.round(occ * 22)} arrivals / 10 min`, outdoor: true };
    }
    const r = U().rng(key); const t = (minutes ?? W.clockMin ?? 600) / 60;
    const cap = { patient: 2, icu: 3, or: 9, pacu: 18, waiting: 40, lobby: 80, retail: 20, kitchen: 18, ops: 22, it: 6, lounge: 12, ucc: 3, preop: 3, exam: 3, infusion: 3 }[rm.type] || 6;
    const dayCurve = Math.max(0, Math.sin(((t - 6) / 16) * Math.PI));
    const base = rm.type === 'patient' || rm.type === 'icu' ? 0.75 + r() * 0.25 : rm.type === 'stair' || rm.type === 'mech' ? 0.02 : dayCurve * (0.3 + r() * 0.6);
    const occ = Math.max(0, Math.min(1, base + Math.sin(t * 1.7 + r() * 6) * 0.08));
    const people = Math.round(occ * cap);
    const temp = (rm.type === 'or' ? 67.5 : rm.type === 'it' || rm.type === 'mech' ? 74 : 71) + (r() - 0.5) * 2.4 + Math.sin(t + r() * 5) * 0.4;
    const hum = (rm.type === 'or' ? 46 : 42) + (r() - 0.5) * 8;
    const co2 = Math.round(420 + occ * 520 + r() * 60);
    const assetPool = { patient: ['Infusion pump', 'Vitals monitor', 'IV pole'], icu: ['Ventilator', 'Infusion pump ×3', 'Monitor'], or: ['Surgical robot', 'Anesthesia machine', 'Video tower'], storage: ['Wheelchair ×2', 'Infusion pump ×4', 'Bladder scanner'], imaging: ['Portable ultrasound'], ucc: ['Infusion pump', 'ECG cart'], preop: ['Warming blanket unit'], pacu: ['Monitor ×6', 'Infusion pump ×5'], infusion: ['Infusion pump ×2', 'Recliner sensor'], kitchen: ['Tray cart ×6', 'Hot cart'], robot: ['Relay robots ×5'], it: ['Switches ×4', 'UPS'], clinical: ['Workstation on wheels ×3'], pharmacy: ['Med fridge ×4 (MT-tagged)'] }[rm.type] || [];
    const lastClean = Math.round(20 + r() * 300);
    return {
      key, label: loc.label, sub: loc.sub, type: rm.type, people, cap, occ, temp, hum, co2,
      noise: Math.round(38 + occ * 22 + r() * 6), light: Math.round(240 + r() * 300), dwell: Math.round(6 + r() * 50),
      assets: assetPool, aps: 1 + Math.floor(r() * 3), clients: Math.round(people * 2.3 + r() * 6 + (rm.type === 'it' ? 40 : 0)),
      rssi: -(48 + Math.round(r() * 14)), health: Math.round(92 + r() * 8), lastClean,
      status: rm.type === 'patient' ? (occ > 0.85 ? 'Occupied' : occ > 0.78 ? 'Dirty · EVS queued' : 'Clean · Ready') : null,
    };
  };
  function heatColor(v, metric) {
    const c = new THREE.Color();
    if (metric === 'temp') { const t = U().clamp((v - 64) / 14, 0, 1); c.setHSL(0.62 - t * 0.62, 0.85, 0.5); }
    else { const t = U().clamp(v, 0, 1); c.setHSL(0.55 - t * 0.55, 0.9, 0.48 + t * 0.06); }
    return c;
  }
  function applySpacesColors(lv) {
    if (!lv || !lv.rooms) return;
    lv.rooms.tiles.forEach((tile) => {
      if (tile.userData.hl) return;
      if (!W.overlay.spaces) { tile.material.color.copy(tile.userData.base); tile.material.opacity = tileOpacity(); return; }
      const d = W.roomData(tile.userData.room);
      const v = W.spacesMetric === 'temp' ? d.temp : W.spacesMetric === 'air' ? (d.co2 - 400) / 700 : d.occ;
      tile.material.color.copy(heatColor(v, W.spacesMetric)); tile.material.opacity = 0.72;
    });
    lv.rooms.apG.visible = W.overlay.spaces;
  }
  W.refreshSpaces = function () { Object.values(W.buildings).forEach((rec) => Object.values(rec.levels).forEach(applySpacesColors)); };
  W.setOverlay = function (k, v) { W.overlay[k] = v; if (k === 'spaces') W.refreshSpaces(); MSK.bus.emit('overlay', { k, v }); };
  W.highlightRoom = function (key, color) {
    const loc = MSK.loc(key); if (!loc || !loc.room) return;
    const rec = W.buildings[loc.b]; const lv = rec.levels[loc.level];
    const store = (W._hl = W._hl || {}); store[key] = color;
    if (lv.rooms) lv.rooms.tiles.forEach((t) => { if (t.userData.room === key) { t.userData.hl = !!color; if (color) { t.material.color.set(color); t.material.opacity = 0.85; } else applySpacesColors(lv); } });
  };
  function reapplyHighlights(lv) { const s = W._hl || {}; Object.entries(s).forEach(([k, c]) => { if (c) W.highlightRoom(k, c); }); }

  // ---------------------------------------------------------------- focus / cutaway
  W.focusLevel = function (bid, n) {
    if (W.focus.b === bid && W.focus.level === n) return;
    W.focus = { b: bid, level: n };
    Object.values(W.buildings).forEach((rec) => {
      const isB = rec.b.id === bid;
      rec.label.visible = !isB;
      rec.roof.visible = !isB;
      rec.edges.visible = !isB; rec.floorLines.visible = true;
      Object.values(rec.levels).forEach((lv) => {
        const ln = lv.L.n;
        if (!isB) { lv.shell.visible = ln >= 1; lv.shell.material = rec.mat; if (lv.rooms) lv.rooms.group.visible = false; return; }
        if (ln > n) { lv.shell.visible = false; if (lv.rooms) lv.rooms.group.visible = false; }
        else if (ln === n) { lv.shell.visible = false; if (!lv.rooms) buildRooms(rec, lv.L); lv.rooms.group.visible = true; reapplyHighlights(lv); }
        else { lv.shell.visible = n < 1 ? false : ln >= 1; lv.shell.material = rec.ghost; if (lv.rooms) lv.rooms.group.visible = false; }
      });
    });
    W.groundMat.opacity = n < 1 && bid ? 0.18 : 1; W.blocks.visible = !(n < 1 && bid);
    MSK.bus.emit('focus:level', { b: bid, level: n });
  };
  W.clearFocus = function () {
    if (!W.focus.b) return;
    W.focus = { b: null, level: null };
    Object.values(W.buildings).forEach((rec) => {
      rec.label.visible = true; rec.roof.visible = true; rec.edges.visible = true;
      Object.values(rec.levels).forEach((lv) => { lv.shell.visible = lv.L.n >= 1; lv.shell.material = rec.mat; if (lv.rooms) lv.rooms.group.visible = false; });
    });
    W.groundMat.opacity = 1; W.blocks.visible = true;
    MSK.bus.emit('focus:level', { b: null, level: null });
  };

  // ---------------------------------------------------------------- camera tween
  let tween = null;
  W.flyTo = function (target, dist, opts = {}) {
    const T = new THREE.Vector3(target.x, target.y || 0, target.z);
    const dir = camera.position.clone().sub(controls.target);
    let az = Math.atan2(dir.x, dir.z); if (opts.az != null) az = opts.az;
    const polar = opts.polar ?? Math.min(1.15, Math.max(0.55, Math.acos(dir.y / dir.length())));
    const d = dist || dir.length();
    const P = new THREE.Vector3(T.x + d * Math.sin(polar) * Math.sin(az), T.y + d * Math.cos(polar), T.z + d * Math.sin(polar) * Math.cos(az));
    tween = { t: 0, dur: opts.dur ?? 1.4, fromT: controls.target.clone(), toT: T, fromP: camera.position.clone(), toP: P, track: opts.track || null, toT0: T.clone(), toP0: P.clone(), trackStart: opts.track && opts.track() ? opts.track().clone() : null };
  };
  // choose an orbit azimuth with the clearest line of sight to the target (fewest buildings in the way)
  const _ray = () => (W._ray = W._ray || new THREE.Raycaster());
  W.bestAz = function (target, dist, polar) {
    const T = new THREE.Vector3(target.x, (target.y || 0) + 1.5, target.z);
    const dir = camera.position.clone().sub(controls.target); const cur = Math.atan2(dir.x, dir.z);
    const occ = [W.city, W.landMesh]; Object.values(W.buildings).forEach((rec) => Object.values(rec.levels).forEach((lv) => { if (lv.shell.visible && lv.shell.material === rec.mat) occ.push(lv.shell); }));
    let best = cur, bestScore = Infinity; const ray = _ray();
    for (let k = 0; k < 16; k++) {
      const az = cur + (k / 16) * Math.PI * 2;
      const P = new THREE.Vector3(T.x + dist * Math.sin(polar) * Math.sin(az), T.y + dist * Math.cos(polar), T.z + dist * Math.sin(polar) * Math.cos(az));
      const d = T.clone().sub(P); const len = d.length(); ray.set(P, d.normalize()); ray.far = len - 2;
      const hits = ray.intersectObjects(occ.filter(Boolean), false);
      let diff = Math.abs(((az - cur + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI);
      const score = hits.length * 10 + (hits.length ? (len - hits[0].distance) / len * 10 : 0) + diff * 1.2;
      if (score < bestScore) { bestScore = score; best = az; }
    }
    return best;
  };
  W.frame = function (target, dist, polar, opts = {}) { const az = W.bestAz(target, dist, polar); W.flyTo(target, dist, { ...opts, az, polar }); };
  W.follow = null; // {getPos: fn}
  function tweenStep(dt) {
    if (tween) {
      if (tween.track && tween.trackStart) { const p = tween.track(); if (p) { const off = p.clone().sub(tween.trackStart); tween.toT.copy(tween.toT0).add(off); tween.toP.copy(tween.toP0).add(off); } }
      tween.t += dt / tween.dur; const k = U().smooth(Math.min(1, tween.t));
      controls.target.lerpVectors(tween.fromT, tween.toT, k); camera.position.lerpVectors(tween.fromP, tween.toP, k);
      if (tween.t >= 1) tween = null;
    } else if (W.follow) {
      const p = W.follow(); if (p) { const gap = new THREE.Vector3(p.x, p.y, p.z).sub(controls.target); const k = gap.length() > 8 ? 10 : 4; const delta = gap.multiplyScalar(Math.min(1, dt * k)); controls.target.add(delta); camera.position.add(delta); }
    }
  }
  W.stopTween = () => { tween = null; };
  W.home = function (dur) { W.follow = null; W.clearFocus(); W.flyTo({ x: -95, y: 70, z: -60 }, 560, { az: 0.95, polar: 1.02, dur: dur || 1.6 }); };

  // ---------------------------------------------------------------- picking
  function setupPicking(container) {
    const ray = new THREE.Raycaster(); const v = new THREE.Vector2(); let down = null;
    renderer.domElement.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; });
    renderer.domElement.addEventListener('pointerup', (e) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
      const rect = renderer.domElement.getBoundingClientRect();
      v.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      ray.setFromCamera(v, camera);
      const objs = W.pickables.filter((o) => { let p = o; while (p) { if (!p.visible) return false; p = p.parent; } return true; });
      const hits = ray.intersectObjects(objs, false);
      const hit = hits.find((h) => h.object.userData.pick);
      if (!hit) { MSK.bus.emit('pick:none'); return; }
      const u = hit.object.userData;
      if (u.pick === 'actor') MSK.bus.emit('pick:actor', { id: u.actor });
      else if (u.pick === 'room') MSK.bus.emit('pick:room', { key: u.room });
      else if (u.pick === 'asset') MSK.bus.emit('pick:asset', { id: u.asset });
      else if (u.pick === 'building') MSK.bus.emit('pick:building', { b: u.building, level: u.level });
    });
    renderer.domElement.addEventListener('pointermove', (e) => {
      // lightweight hover cursor
      if (e.buttons) return;
      const rect = renderer.domElement.getBoundingClientRect();
      v.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      ray.setFromCamera(v, camera);
      const hit = ray.intersectObjects(W.pickables.filter((o) => o.visible && (!o.parent || o.parent.visible)), false)[0];
      renderer.domElement.style.cursor = hit && hit.object.userData.pick ? 'pointer' : '';
    });
  }

  // ---------------------------------------------------------------- positions
  W.posOf = function (key) {
    const l = MSK.loc(key); if (!l) return null;
    return new THREE.Vector3(l.x, (l.y || 0) + 0.1, l.z);
  };

  // ---------------------------------------------------------------- time of day
  const C = (h) => new THREE.Color(h);
  let SKY = null;
  const SKYDEF = () => [
    { h: 0, top: C(0x040812), bot: C(0x0d1628), ground: C(0x0b111c), block: C(0x151d2b), hemi: 0.35, sun: 0.1, fog: C(0x0b1322), night: 1 },
    { h: 5.5, top: C(0x0a1430), bot: C(0x2a2f4a), ground: C(0x0f1520), block: C(0x182131), hemi: 0.45, sun: 0.2, fog: C(0x1b2238), night: 0.95 },
    { h: 7, top: C(0x27477a), bot: C(0xd99a6c), ground: C(0x1a222f), block: C(0x283243), hemi: 0.75, sun: 0.9, fog: C(0x6a6a7a), night: 0.45 },
    { h: 9, top: C(0x3c6aa8), bot: C(0xa7bfd8), ground: C(0x222b38), block: C(0x343f52), hemi: 1.0, sun: 1.5, fog: C(0x8fa4bd), night: 0.06 },
    { h: 15, top: C(0x3a66a3), bot: C(0xb4c6da), ground: C(0x222b38), block: C(0x353f52), hemi: 1.0, sun: 1.5, fog: C(0x95a8bf), night: 0.08 },
    { h: 17.6, top: C(0x2b3f74), bot: C(0xe08c5a), ground: C(0x1b2330), block: C(0x2a3445), hemi: 0.7, sun: 0.9, fog: C(0x75667a), night: 0.5 },
    { h: 19, top: C(0x0b1530), bot: C(0x2c2a48), ground: C(0x0f1520), block: C(0x182131), hemi: 0.45, sun: 0.2, fog: C(0x1b2038), night: 0.95 },
    { h: 24, top: C(0x040812), bot: C(0x0d1628), ground: C(0x0b111c), block: C(0x151d2b), hemi: 0.35, sun: 0.1, fog: C(0x0b1322), night: 1 },
  ];
  W.weatherTint = { dark: 0, snow: 0, haze: 0 };
  W.setClock = function (min) {
    if (!SKY) SKY = SKYDEF();
    W.clockMin = ((min % 1440) + 1440) % 1440; const h = W.clockMin / 60;
    let i = 0; while (i < SKY.length - 2 && SKY[i + 1].h <= h) i++;
    const a = SKY[i], b = SKY[i + 1], k = U().smooth((h - a.h) / (b.h - a.h || 1));
    const mix = (p, q) => p.clone().lerp(q, k);
    const wt = W.weatherTint; const gray = C(0x5a6372);
    if (isLight()) {
      const LC = W.LCFG; const warm = U().clamp((U().lerp(a.night, b.night, k) - 0.1) * 1.4, 0, 1);
      const top = C(0x4a8bd6).lerp(C(0x6c86b6), warm * 0.5).lerp(gray, wt.dark * 0.55), bot = C(0xe4eef7).lerp(C(0xf4dcc4), warm * 0.55).lerp(C(0xc3c9d1), wt.dark * 0.6);
      if (wt.haze) bot.lerp(C(0xe8c08a), wt.haze * 0.45);
      W.skyU.top.value.copy(top); W.skyU.bot.value.copy(bot);
      const sunAng = 0.5 + U().clamp((h - 6) / 12, 0, 1) * (Math.PI - 1.0); // the sun stays well above the horizon so shadows stay short
      W.sunDir.set(Math.cos(sunAng) * 0.7, Math.sin(sunAng) * 0.85 + 0.3, -0.5).normalize();
      W.skyU.sunDir.value.copy(W.sunDir); W.skyU.sunAmt.value = 0.55 * (1 - wt.dark);
      W.sun.intensity = LC.sun * (1 - wt.dark * 0.55); W.sun.color.set(0xffffff).lerp(C(0xffd0a0), warm * 0.45);
      W.hemi.intensity = LC.hemi * (1 - wt.dark * 0.25);
      W.groundMat.color.copy(C(LC.road).lerp(C(0xe9eef5), wt.snow * 0.85)); W.blockMat.color.copy(C(LC.walk).lerp(C(0xf4f7fb), wt.snow * 0.9));
      scene.fog.color.copy(C(0xdfe8f1).lerp(gray, wt.dark * 0.5));
      SU.uNight.value = Math.min(0.35, warm * 0.3 + wt.dark * 0.2);
      W.stars.material.opacity = 0;
      if (W.cityMat) { W.cityMat.color.setHex(LC.city); W.landMat.color.setHex(LC.land); }
      Object.values(W.buildings).forEach((rec) => rec.mat.color.setHex(LC.msk));
      SU.uSnow.value = wt.snow;
      MSK.bus.emit('clock', W.clockMin); return;
    }
    const top = mix(a.top, b.top).lerp(gray, wt.dark * 0.6), bot = mix(a.bot, b.bot).lerp(gray, wt.dark * 0.7);
    if (wt.haze) { bot.lerp(C(0xd9a066), wt.haze * 0.5); top.lerp(C(0x8ab0d0), wt.haze * 0.2); }
    W.skyU.top.value.copy(top); W.skyU.bot.value.copy(bot);
    const sunAng = ((h - 6) / 12) * Math.PI; W.skyU.sunDir.value.set(Math.cos(sunAng) * 0.8, Math.sin(sunAng), -0.4);
    W.skyU.sunAmt.value = Math.max(0, Math.sin(sunAng)) * (1 - wt.dark);
    W.sun.position.set(Math.cos(sunAng) * 500, Math.max(60, Math.sin(sunAng) * 600), -200);
    W.sun.intensity = U().lerp(a.sun, b.sun, k) * (1 - wt.dark * 0.65);
    W.hemi.intensity = U().lerp(a.hemi, b.hemi, k) * (1 - wt.dark * 0.3);
    const ground = mix(a.ground, b.ground).lerp(C(0xdfe7f2), wt.snow * 0.85), block = mix(a.block, b.block).lerp(C(0xeef3fa), wt.snow * 0.9);
    W.groundMat.color.copy(ground); W.blockMat.color.copy(block);
    const fog = mix(a.fog, b.fog).lerp(gray, wt.dark * 0.6); scene.fog.color.copy(fog);
    SU.uNight.value = Math.min(1, U().lerp(a.night, b.night, k) + wt.dark * 0.35);
    W.stars.material.opacity = Math.max(0, SU.uNight.value - 0.4) * (1 - wt.dark);
    const day = 1 - Math.min(1, SU.uNight.value);
    if (W.cityMat) { W.cityMat.color.copy(C(0x1a212e).lerp(C(0x4b5566), day)); W.landMat.color.copy(C(0x252e40).lerp(C(0x6b7890), day)); }
    Object.values(W.buildings).forEach((rec) => rec.mat.color.copy(C(0x1f4a78).lerp(C(0x6aaee6), day)));
    SU.uSnow.value = wt.snow;
    MSK.bus.emit('clock', W.clockMin);
  };
  W.setFogDensity = (d) => { W.fogD = d; scene.fog.density = d * (isLight() ? W.LCFG.fog : 1); };
  W.shaderU = SU;
})();
