var h_ = [{ id: `nyc`, name: `Global Headquarters, 200 Park Avenue`, city: `New York`, country: `United States`, lat: 40.7533, lon: -73.9767, role: `Corporate headquarters in the MetLife Building above Grand Central`, hub: true }, { id: `cary`, name: `Global Technology Campus`, city: `Cary, NC`, country: `United States`, lat: 35.8299, lon: -78.799, role: `Technology hub: engineering, software deve ...[TRUNC 4176]
function v_(e44) {
  return e44;
}
function y_(e44) {
  if (e44 == null) return v_;
  var t2, n2, r2 = e44.scale[0], i2 = e44.scale[1], a2 = e44.translate[0], o2 = e44.translate[1];
  return function(e45, s2) {
    s2 || (t2 = n2 = 0);
    var c2 = 2, l2 = e45.length, u2 = Array(l2);
    for (u2[0] = (t2 += e45[0]) * r2 + a2, u2[1] = (n2 += e45[1]) * i2 + o2; c2 < l2; ) u2[c2] = e45[c2], ++c2;
    return u2;
  };
}
function b_(e44, t2) {
  for (var n2, r2 = e44.length, i2 = r2 - t2; i2 < --r2; ) n2 = e44[i2], e44[i2++] = e44[r2], e44[r2] = n2;
}
function x_(e44, t2) {
  return typeof t2 == `string` && (t2 = e44.objects[t2]), t2.type === `GeometryCollection` ? { type: `FeatureCollection`, features: t2.geometries.map(function(t3) {
    return S_(e44, t3);
  }) } : S_(e44, t2);
}
function S_(e44, t2) {
  var n2 = t2.id, r2 = t2.bbox, i2 = t2.properties == null ? {} : t2.properties, a2 = C_(e44, t2);
  return n2 == null && r2 == null ? { type: `Feature`, properties: i2, geometry: a2 } : r2 == null ? { type: `Feature`, id: n2, properties: i2, geometry: a2 } : { type: `Feature`, id: n2, bbox: r2, properties: i2, geometry: a2 };
}
function C_(e44, t2) {
  var n2 = y_(e44.transform), r2 = e44.arcs;
  function i2(e45, t3) {
    t3.length && t3.pop();
    for (var i3 = r2[e45 < 0 ? ~e45 : e45], a3 = 0, o3 = i3.length; a3 < o3; ++a3) t3.push(n2(i3[a3], a3));
    e45 < 0 && b_(t3, o3);
  }
  function a2(e45) {
    return n2(e45);
  }
  function o2(e45) {
    for (var t3 = [], n3 = 0, r3 = e45.length; n3 < r3; ++n3) i2(e45[n3], t3);
    return t3.length < 2 && t3.push(t3[0]), t3;
  }
  function s2(e45) {
    for (var t3 = o2(e45); t3.length < 4; ) t3.push(t3[0]);
    return t3;
  }
  function c2(e45) {
    return e45.map(s2);
  }
  function l2(e45) {
    var t3 = e45.type, n3;
    switch (t3) {
      case `GeometryCollection`:
        return { type: t3, geometries: e45.geometries.map(l2) };
      case `Point`:
        n3 = a2(e45.coordinates);
        break;
      case `MultiPoint`:
        n3 = e45.coordinates.map(a2);
        break;
      case `LineString`:
        n3 = o2(e45.arcs);
        break;
      case `MultiLineString`:
        n3 = e45.arcs.map(o2);
        break;
      case `Polygon`:
        n3 = c2(e45.arcs);
        break;
      case `MultiPolygon`:
        n3 = e45.arcs.map(c2);
        break;
      default:
        return null;
    }
    return { type: t3, coordinates: n3 };
  }
  return l2(t2);
}
var w_ = { type: `Topology`, objects: { land: { type: `GeometryCollection`, geometries: [{ type: `MultiPolygon`, arcs: [[[0]], [[1]], [[2]], [[3]], [[4]], [[5]], [[6]], [[7]], [[8]], [[9]], [[10]], [[11]], [[12]], [[13]], [[14]], [[15]], [[16, 18]], [[19]], [[20]], [[21]], [[22]], [[23]], [[24]], [[25]], [[26]], [[27]], [[28]], [[29]], [[30]], [[31]], [[32]], [[33]], [[34]], [[35]], [[36]], [[37]] ...[TRUNC 65630]
function E_(e44, t2, n2 = 1, r2 = new G()) {
  let i2 = (90 - e44) * T_, a2 = (t2 + 180) * T_;
  return r2.set(-n2 * Math.sin(i2) * Math.cos(a2), n2 * Math.cos(i2), n2 * Math.sin(i2) * Math.sin(a2));
}
function D_(e44) {
  let t2 = e44.length(), n2 = 90 - Math.acos(Et.clamp(e44.y / t2, -1, 1)) / T_, r2 = Math.atan2(e44.z, -e44.x) / T_ - 180;
  return r2 < -180 && (r2 += 360), { lat: n2, lon: r2, r: t2 };
}
function O_(e44 = 2048, t2 = 1024) {
  let n2 = document.createElement(`canvas`);
  n2.width = e44, n2.height = t2;
  let r2 = n2.getContext(`2d`, { willReadFrequently: true });
  r2.fillStyle = `#000`, r2.fillRect(0, 0, e44, t2), r2.fillStyle = `#fff`;
  let i2 = w_, a2 = x_(i2, i2.objects.land), o2 = `features` in a2 ? a2.features : [a2], s2 = (t3) => (t3 + 180) / 360 * e44, c2 = (e45) => (90 - e45) / 180 * t2;
  for (let e45 of o2) {
    let t3 = e45.geometry, n3 = t3.type === `Polygon` ? [t3.coordinates] : t3.type === `MultiPolygon` ? t3.coordinates : [];
    for (let e46 of n3) {
      r2.beginPath();
      for (let t4 of e46) t4.forEach(([e47, t5], n4) => {
        n4 === 0 ? r2.moveTo(s2(e47), c2(t5)) : r2.lineTo(s2(e47), c2(t5));
      }), r2.closePath();
      r2.fill(`evenodd`);
    }
  }
  return { width: e44, height: t2, data: r2.getImageData(0, 0, e44, t2).data, canvas: n2 };
}
function k_(e44, t2, n2) {
  let r2 = Math.min(e44.width - 1, Math.max(0, Math.floor((n2 + 180) / 360 * e44.width))), i2 = Math.min(e44.height - 1, Math.max(0, Math.floor((90 - t2) / 180 * e44.height)));
  return e44.data[(i2 * e44.width + r2) * 4] > 127;
}
function A_(e44, t2) {
  let n2 = [], r2 = Math.PI * (3 - Math.sqrt(5)), i2 = new G();
  for (let a2 = 0; a2 < t2; a2++) {
    let o2 = 1 - a2 / (t2 - 1) * 2, s2 = Math.sqrt(1 - o2 * o2), c2 = r2 * a2;
    i2.set(Math.cos(c2) * s2, o2, Math.sin(c2) * s2);
    let { lat: l2, lon: u2 } = D_(i2);
    l2 < -62 || k_(e44, l2, u2) && n2.push(i2.x, i2.y, i2.z);
  }
  return new Float32Array(n2);
}
function j_(e44 = 128, t2 = `rgba(255,255,255,1)`, n2 = `rgba(255,255,255,0.35)`) {
  let r2 = document.createElement(`canvas`);
  r2.width = r2.height = e44;
  let i2 = r2.getContext(`2d`), a2 = i2.createRadialGradient(e44 / 2, e44 / 2, 0, e44 / 2, e44 / 2, e44 / 2);
  a2.addColorStop(0, t2), a2.addColorStop(0.25, n2), a2.addColorStop(1, `rgba(255,255,255,0)`), i2.fillStyle = a2, i2.fillRect(0, 0, e44, e44);
  let o2 = new Qi(r2);
  return o2.colorSpace = Le, o2;
}
var M_ = { glass: new q(`#16365e`), edge: new q(`#3f86c9`), metlife: new q(`#1aa3ff`), zone: new q(`#7fe7ff`), warn: new q(`#ffb020`), crit: new q(`#ff3b4f`), good: new q(`#7cf29c`), signal: new q(`#ffd166`) }, N_ = new q(`#030a18`);
function P_(e44) {
  let t2 = e44 >>> 0;
  return () => {
    t2 = t2 + 1831565813 >>> 0;
    let e45 = t2;
    return e45 = Math.imul(e45 ^ e45 >>> 15, e45 | 1), e45 ^= e45 + Math.imul(e45 ^ e45 >>> 7, e45 | 61), ((e45 ^ e45 >>> 14) >>> 0) / 4294967296;
  };
}
var F_ = `
  attribute float aSeed;
  varying vec3 vPos;
  varying vec3 vN;
  varying float vSeed;
  varying float vDist;
  void main() {
    vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vPos = wp.xyz;
    vN = normalize(mat3(modelMatrix * instanceMatrix) * normal);
    vSeed = aSeed;
    vec4 mv = viewMatrix * wp;
    vDist = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`, I_ = `
  uniform vec3 uFog;
  uniform float uDensity;
  uniform float uDim;
  varying vec3 vPos;
  varying vec3 vN;
  varying float vSeed;
  varying float vDist;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    vec3 base = vec3(0.035, 0.07, 0.13);
    float side = 1.0 - step(0.6, abs(vN.y));
    float u = abs(vN.x) > 0.5 ? vPos.z : vPos.x;
    float fl = floor(vPos.y * 2.6);
    float col = floor(u * 1.7);
    float win = step(0.35, fract(vPos.y * 2.6)) * step(0.3, fract(u * 1.7));
    float lit = step(0.7, hash(vec2(fl, col) + vSeed * 17.0)) * win * side;
    vec3 c = base + lit * vec3(1.0, 0.8, 0.52) * 0.42 + side * win * vec3(0.02, 0.05, 0.09);
    c += (1.0 - side) * vec3(0.05, 0.09, 0.16);
    c *= uDim;
    float f = 1.0 - exp(-pow(vDist * uDensity, 2.0));
    gl_FragColor = vec4(mix(c, uFog, f), 1.0);
  }
`, L_ = `
  uniform vec3 uFog;
  uniform float uDensity;
  uniform float uStreet;
  uniform float uTime;
  varying vec3 vPos;
  varying float vDist;
  float line(float x, float w) {
    float d = abs(fract(x) - 0.5);
    float fw = fwidth(x);
    return 1.0 - smoothstep(w - fw, w + fw, 0.5 - d);
  }
  void main() {
    vec2 p = vPos.xz;
    float minor = max(line(p.x, 0.02), line(p.y, 0.02)) * 0.12;
    float major = max(line(p.x / uStreet, 0.03), line(p.y / uStreet, 0.03));
    float r = length(p);
    float ring = smoothstep(0.08, 0.0, abs(fract(r * 0.05 - uTime * 0.08) - 0.5) - 0.46) * 0.15 * smoothstep(80.0, 10.0, r);
    vec3 c = vec3(0.012, 0.03, 0.06) + vec3(0.05, 0.16, 0.3) * (minor + major * 0.5) + vec3(0.1, 0.45, 0.8) * ring;
    float f = 1.0 - exp(-pow(vDist * uDensity, 2.0));
    gl_FragColor = vec4(mix(c, uFog, f), 1.0);
  }
`, R_ = `
  varying vec3 vPos;
  varying float vDist;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vPos = wp.xyz;
    vec4 mv = viewMatrix * wp;
    vDist = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`, z_ = `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`, B_ = `
  uniform float uTime; uniform vec3 uColor; uniform float uOpacity; uniform float uSpeed;
  varying vec2 vUv;
  void main() {
    float p = fract(vUv.x * 6.0 - uTime * uSpeed);
    float pulse = smoothstep(0.75, 1.0, p);
    float ends = smoothstep(0.0, 0.05, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
    gl_FragColor = vec4(uColor * (0.8 + pulse * 1.8), (0.25 + pulse * 0.75) * ends * uOpacity);
  }
`, V_ = class {
  scene = new Nn();
  facility = null;
  zone = null;
  focus = `site`;
  root = new Tn();
  buildings = /* @__PURE__ */ new Map();
  flows = [];
  groundMat;
  cityMat;
  interior = new Tn();
  zoneTag = null;
  deviceLabels = [];
  beam = null;
  beamMat = null;
  shield = null;
  alarm = null;
  state = `idle`;
  pulse = 0;
  hoverFloor = null;
  raycaster = new Ks();
  glow;
  time = 0;
  deviceSprites = [];
  onFloorHover = () => {
  };
  constructor(e44) {
    this.glow = e44, this.scene.background = N_.clone(), this.scene.add(this.root), this.groundMat = new Yo({ uniforms: { uFog: { value: N_ }, uDensity: { value: 0.012 }, uStreet: { value: 8 }, uTime: { value: 0 } }, vertexShader: R_, fragmentShader: L_ }), this.cityMat = new Yo({ uniforms: { uFog: { value: N_ }, uDensity: { value: 0.012 }, uDim: { value: 1 } }, vertexShader: F_, fragmentShader: I_ });
  }
  build(e44, t2) {
    this.clear(), this.facility = e44, this.zone = t2, this.focus = `site`;
    let n2 = P_([...e44.siteId].reduce((e45, t3) => e45 * 31 + t3.charCodeAt(0), 7)), r2 = new Y(new Mo(600, 600), this.groundMat);
    r2.rotation.x = -Math.PI / 2, this.root.add(r2), this.groundMat.uniforms.uStreet.value = e44.context === `manhattan` ? 6 : e44.context === `tokyo` ? 5 : e44.context === `campus` || e44.context === `suburban` || e44.context === `datacenter` ? 20 : 9, this.buildContext(e44.context, n2, e44), e44.lake && this.addWater(e44.lake.x, e44.lake.z, e44.lake.rx, e44.lake.rz), e44.ponds?.forEach((e45) => this.addWater(e45.x, e45.z, e45.r, e45.r * 0.75)), e44.context === `brighton` && this.addWater(0, 60, 120, 28), e44.parking?.forEach((e45) => this.addParking(e45.x, e45.z, e45.w, e45.d, e45.levels)), e44.landmarks?.forEach((e45) => this.addLandmark(e45)), e44.trees && this.addTrees(e44.trees, n2), e44.mountains && this.addMountains(n2);
    for (let n3 of e44.buildings) this.addBuilding(n3, t2);
    this.addLinks(e44), this.root.add(this.interior), t2 && this.buildInterior(t2), this.buildEffects(), this.setState(`idle`);
  }
  clear() {
    this.root.traverse((e44) => {
      let t2 = e44;
      t2.geometry && t2.geometry.dispose();
      let n2 = t2.material;
      n2 && n2 !== this.groundMat && n2 !== this.cityMat && (Array.isArray(n2) ? n2 : [n2]).forEach((e45) => e45.dispose()), e44 instanceof $d && e44.element.remove();
    }), this.scene.remove(this.root), this.root = new Tn(), this.scene.add(this.root), this.interior = new Tn(), this.buildings.clear(), this.flows = [], this.deviceLabels = [], this.deviceSprites = [], this.zoneTag = null, this.beam = this.shield = this.alarm = null, this.beamMat = null, this.hoverFloor = null;
  }
  buildContext(e44, t2, n2) {
    let r2 = [...n2.buildings.map((e45) => ({ x: e45.x, z: e45.z, r: Math.max(e45.w, e45.d) * 0.9 + 2.5 })), ...(n2.landmarks ?? []).map((e45) => ({ x: e45.x, z: e45.z, r: Math.max(e45.w, e45.d) * 0.7 + 1.5 }))];
    n2.lake && r2.push({ x: n2.lake.x, z: n2.lake.z, r: Math.max(n2.lake.rx, n2.lake.rz) + 2 }), n2.parking?.forEach((e45) => r2.push({ x: e45.x, z: e45.z, r: Math.max(e45.w, e45.d) * 0.7 + 1 })), n2.ponds?.forEach((e45) => r2.push({ x: e45.x, z: e45.z, r: e45.r + 1.5 }));
    let i2 = [], a2 = (e45, t3, n3, i3) => r2.every((r3) => Math.hypot(e45 - r3.x, t3 - r3.z) > r3.r + Math.max(n3, i3) * 0.5), o2 = (e45, n3, r3, o3, s3, c3, l3) => {
      for (let u3 = -r3; u3 <= r3; u3 += e45) for (let d3 = -r3; d3 <= r3; d3 += n3) {
        if (t2() > o3) continue;
        let r4 = Math.hypot(u3, d3), f2 = t2() < 0.5 ? 1 : 2;
        for (let o4 = 0; o4 < f2; o4++) {
          let p2 = (e45 - 1.6) / f2 - 0.3, m2 = n3 - 1.6 - t2() * 0.8, h2 = u3 - e45 / 2 + 0.8 + (o4 + 0.5) * (e45 - 1.6) / f2, g2 = d3;
          if (!a2(h2, g2, p2, m2)) continue;
          let _2 = Math.exp(-r4 / l3), v2 = s3 + (c3 - s3) * t2() ** 2.2 * (0.35 + _2);
          i2.push({ x: h2, z: g2, w: p2, d: m2, h: v2 });
        }
      }
    }, s2 = (e45, n3, r3, o3, s3, c3, l3) => {
      for (let u3 = 0; u3 < e45; u3++) {
        let e46 = t2() * Math.PI * 2, u4 = n3 + Math.sqrt(t2()) * (r3 - n3), d3 = Math.cos(e46) * u4, f2 = Math.sin(e46) * u4, p2 = o3 + t2() * (s3 - o3), m2 = o3 + t2() * (s3 - o3);
        a2(d3, f2, p2, m2) && i2.push({ x: d3, z: f2, w: p2, d: m2, h: c3 + t2() ** 2 * (l3 - c3) });
      }
    };
    switch (e44) {
      case `manhattan`:
        o2(6.2, 2.9, 70, 0.92, 2.5, 34, 30);
        break;
      case `tokyo`:
        o2(5, 4, 60, 0.85, 1.5, 18, 25);
        break;
      case `cdmx`:
        o2(7, 6, 60, 0.7, 1, 9, 30), s2(10, 15, 60, 3, 5, 6, 14);
        break;
      case `santiago`:
        o2(8, 7, 55, 0.6, 1, 8, 25), s2(14, 12, 50, 3, 5, 6, 16);
        break;
      case `dubai`:
        o2(9, 8, 60, 0.6, 1, 7, 30), s2(18, 12, 60, 3, 5, 8, 24);
        break;
      case `noida`:
        s2(40, 18, 80, 3, 6, 3, 9), s2(60, 30, 90, 2, 5, 0.5, 2);
        break;
      case `brighton`:
        o2(6, 5, 50, 0.7, 0.6, 3.2, 30);
        break;
      case `campus`:
      case `suburban`:
      case `datacenter`:
        s2(26, 26, 90, 3, 7, 0.5, 2.2);
    }
    if (!i2.length) return;
    let c2 = new na(1, 1, 1);
    c2.translate(0, 0.5, 0);
    let l2 = new Ei(c2, this.cityMat, i2.length), u2 = new Float32Array(i2.length), d2 = new Xt();
    i2.forEach((e45, n3) => {
      d2.compose(new G(e45.x, 0, e45.z), new Dt(), new G(e45.w, e45.h, e45.d)), l2.setMatrixAt(n3, d2), u2[n3] = t2();
    }), c2.setAttribute(`aSeed`, new vi(u2, 1)), this.root.add(l2);
  }
  addWater(e44, t2, n2, r2) {
    let i2 = new ra(1, 64);
    i2.rotateX(-Math.PI / 2);
    let a2 = new Yo({ uniforms: { uTime: { value: 0 } }, vertexShader: z_, fragmentShader: `
        uniform float uTime; varying vec2 vUv;
        void main() {
          float w = sin(vUv.x * 80.0 + uTime * 1.2) * sin(vUv.y * 60.0 - uTime) * 0.5 + 0.5;
          vec3 c = mix(vec3(0.01, 0.05, 0.11), vec3(0.03, 0.14, 0.26), w * 0.6);
          float e = smoothstep(0.5, 0.47, distance(vUv, vec2(0.5)));
          gl_FragColor = vec4(c, 0.92 * e);
        }`, transparent: true, depthWrite: false });
    this.flows.push(a2);
    let o2 = new Y(i2, a2);
    o2.scale.set(n2, 1, r2), o2.position.set(e44, 0.02, t2), this.root.add(o2);
  }
  addParking(e44, t2, n2, r2, i2) {
    let a2 = new Tn();
    for (let e45 = 0; e45 < i2; e45++) {
      let t3 = new Y(new na(n2, 0.06, r2), new ri({ color: `#203048`, transparent: true, opacity: 0.85 }));
      t3.position.y = e45 * 0.32 + 0.03, a2.add(t3);
      let i3 = new Ui(new da(t3.geometry), new ji({ color: `#3a5272`, transparent: true, opacity: 0.6 }));
      i3.position.copy(t3.position), a2.add(i3);
    }
    a2.position.set(e44, 0, t2), this.root.add(a2);
  }
  addLandmark(e44) {
    let t2 = new Tn(), n2 = new q(e44.color ?? `#6b7b94`), r2 = new Y(new na(e44.w, e44.h, e44.d), new ri({ color: n2.clone().multiplyScalar(0.25), transparent: true, opacity: 0.92 }));
    r2.position.y = e44.h / 2, t2.add(r2);
    let i2 = new Ui(new da(r2.geometry), new ji({ color: n2, transparent: true, opacity: 0.55 }));
    if (i2.position.copy(r2.position), t2.add(i2), e44.arch) {
      let r3 = new Y(new ia(e44.d * 0.32, e44.d * 0.32, e44.w * 0.8, 24, 1, false, 0, Math.PI), new ri({ color: n2.clone().multiplyScalar(0.3), transparent: true, opacity: 0.9 }));
      r3.rotation.z = Math.PI / 2, r3.rotation.y = Math.PI / 2, r3.position.y = e44.h, r3.rotation.set(0, 0, Math.PI / 2), t2.add(r3);
      let i3 = new Ui(new da(r3.geometry, 20), new ji({ color: n2, transparent: true, opacity: 0.5 }));
      i3.rotation.copy(r3.rotation), i3.position.copy(r3.position), t2.add(i3);
    }
    t2.position.set(e44.x, 0, e44.z), t2.add(this.label(e44.label, new G(0, e44.h + (e44.arch ? e44.d * 0.35 : 0) + 0.4, 0), `fac-label minor`)), this.root.add(t2);
  }
  addTrees(e44, t2) {
    let n2 = this.facility, r2 = new aa(0.5, 1.4, 6);
    r2.translate(0, 0.7, 0);
    let i2 = new Ei(r2, new ri({ color: `#0f3a2a`, transparent: true, opacity: 0.9 }), e44), a2 = new Xt(), o2 = 0;
    for (let r3 = 0; r3 < e44 * 3 && o2 < e44; r3++) {
      let e45 = t2() * Math.PI * 2, r4 = 8 + Math.sqrt(t2()) * 46, s2 = Math.cos(e45) * r4, c2 = Math.sin(e45) * r4;
      if (n2.buildings.some((e46) => Math.hypot(s2 - e46.x, c2 - e46.z) < Math.max(e46.w, e46.d) * 0.8 + 1.5) || (n2.parking ?? []).some((e46) => Math.abs(s2 - e46.x) < e46.w / 2 + 0.8 && Math.abs(c2 - e46.z) < e46.d / 2 + 0.8) || n2.lake && ((s2 - n2.lake.x) / n2.lake.rx) ** 2 + ((c2 - n2.lake.z) / n2.lake.rz) ** 2 < 1.1 || (n2.ponds ?? []).some((e46) => Math.hypot(s2 - e46.x, c2 - e46.z) < e46.r + 0.6) || (n2.landmarks ?? []).some((e46) => Math.abs(s2 - e46.x) < e46.w / 2 + 0.6 && Math.abs(c2 - e46.z) < e46.d / 2 + 0.6)) continue;
      let l2 = 0.6 + t2() * 0.9;
      a2.compose(new G(s2, 0, c2), new Dt(), new G(l2, l2 * (0.8 + t2() * 0.6), l2)), i2.setMatrixAt(o2++, a2);
    }
    i2.count = o2, this.root.add(i2);
  }
  addMountains(e44) {
    let t2 = new Yo({ uniforms: { uFog: { value: N_ } }, vertexShader: R_, fragmentShader: `
        uniform vec3 uFog; varying vec3 vPos; varying float vDist;
        void main() {
          float snow = smoothstep(16.0, 24.0, vPos.y);
          vec3 c = mix(vec3(0.05, 0.08, 0.15), vec3(0.55, 0.65, 0.8), snow);
          float f = 1.0 - exp(-pow(vDist * 0.006, 2.0));
          gl_FragColor = vec4(mix(c, uFog, f * 0.8), 1.0);
        }` });
    for (let n2 = 0; n2 < 16; n2++) {
      let r2 = 14 + e44() * 18, i2 = new Y(new aa(16 + e44() * 14, r2, 5 + Math.floor(e44() * 3)), t2);
      i2.position.set(-120 + n2 * 16 + e44() * 8, r2 / 2, -95 - e44() * 25), i2.rotation.y = e44() * Math.PI, this.root.add(i2);
    }
  }
  footprint(e44, t2 = 1) {
    let n2 = e44.w * t2, r2 = e44.d * (e44.shape === `faceted` ? 0.6 + 0.4 * t2 : t2), i2 = new Ha();
    if (e44.shape === `octagon`) {
      let e45 = r2 * 0.3, t3 = [[-n2 / 2 + e45, -r2 / 2], [n2 / 2 - e45, -r2 / 2], [n2 / 2, -r2 / 2 + e45 * 0.9], [n2 / 2, r2 / 2 - e45 * 0.9], [n2 / 2 - e45, r2 / 2], [-n2 / 2 + e45, r2 / 2], [-n2 / 2, r2 / 2 - e45 * 0.9], [-n2 / 2, -r2 / 2 + e45 * 0.9]];
      i2.moveTo(...t3[0]), t3.slice(1).forEach((e46) => i2.lineTo(...e46));
    } else e44.shape === `faceted` ? (i2.moveTo(-n2 / 2, -r2 / 2), i2.lineTo(n2 / 2, -r2 / 2), i2.lineTo(n2 / 2 - n2 * 0.12, r2 / 2), i2.lineTo(-n2 / 2 + n2 * 0.2, r2 / 2)) : (i2.moveTo(-n2 / 2, -r2 / 2), i2.lineTo(n2 / 2, -r2 / 2), i2.lineTo(n2 / 2, r2 / 2), i2.lineTo(-n2 / 2, r2 / 2));
    return i2.closePath(), i2;
  }
  floorStyle(e44, t2, n2) {
    if (n2 && n2.buildingId === e44.id && n2.floor === t2) return { color: M_.zone.clone(), opacity: 0.8 };
    if (e44.metlife?.some(([e45, n3]) => t2 >= e45 && t2 <= n3)) return { color: M_.metlife.clone(), opacity: 0.55 };
    let r2 = e44.bands?.find((e45) => t2 >= e45.from && t2 <= e45.to);
    return r2 ? { color: new q(r2.color).multiplyScalar(0.75), opacity: 0.42 } : { color: M_.glass.clone(), opacity: 0.34 };
  }
  addBuilding(e44, t2) {
    let n2 = new Tn();
    n2.position.set(e44.x, 0, e44.z), n2.rotation.y = e44.rot ?? 0;
    let r2 = [], i2 = e44.podium ? e44.podium.h : 0;
    if (e44.podium) {
      let t3 = new Y(new na(e44.podium.w, e44.podium.h, e44.podium.d), new ri({ color: `#10233f`, transparent: true, opacity: 0.9 }));
      t3.position.y = e44.podium.h / 2, n2.add(t3);
      let r3 = new Ui(new da(t3.geometry), new ji({ color: `#2e5d8f`, transparent: true, opacity: 0.7 }));
      r3.position.copy(t3.position), n2.add(r3);
    }
    let a2 = null, o2 = null, s2 = e44.floorH * (e44.shape === `datacenter` ? 0.92 : 0.84);
    for (let c3 = 1; c3 <= e44.floors; c3++) {
      let l3, u3;
      if (e44.shape === `faceted`) {
        let t3 = 1 - 0.42 * ((c3 - 1) / e44.floors);
        l3 = new Do(this.footprint(e44, t3), { depth: s2, bevelEnabled: false }), l3.rotateX(-Math.PI / 2), u3 = new da(l3);
      } else a2 || (a2 = new Do(this.footprint(e44), { depth: s2, bevelEnabled: false }), a2.rotateX(-Math.PI / 2), o2 = new da(a2)), l3 = a2, u3 = o2;
      let d2 = this.floorStyle(e44, c3, t2), f2 = new Y(l3, new ri({ color: d2.color, transparent: true, opacity: d2.opacity * 0.55, depthWrite: false, side: 2 })), p2 = i2 + (c3 - 1) * e44.floorH;
      f2.position.y = p2, f2.userData = { building: e44.id, floor: c3 };
      let m2 = new Ui(u3, new ji({ color: d2.color.clone().lerp(M_.edge, 0.3), transparent: true, opacity: Math.min(1, d2.opacity + 0.25) }));
      m2.position.y = p2, n2.add(f2, m2), r2.push({ index: c3, mesh: f2, edges: m2, baseColor: d2.color.clone(), baseOpacity: d2.opacity, y: p2 });
    }
    let c2 = i2 + e44.floors * e44.floorH, l2 = new Y(new na(Math.min(e44.w, e44.d) * 0.22, c2, Math.min(e44.w, e44.d) * 0.22), new ri({ color: `#0d2442`, transparent: true, opacity: 0.6, depthWrite: false }));
    l2.position.y = c2 / 2, n2.add(l2), e44.id === `metlife-building` && this.addSign(n2, e44, c2), e44.shape === `datacenter` && this.addRacks(n2, e44);
    let u2 = this.label(e44.label, new G(0, c2 + 0.8, 0), `fac-label`);
    n2.add(u2), this.root.add(n2), this.buildings.set(e44.id, { spec: e44, group: n2, floors: r2, height: c2, label: u2, center: new G(e44.x, c2 / 2, e44.z) });
  }
  addSign(e44, t2, n2) {
    let r2 = document.createElement(`canvas`);
    r2.width = 512, r2.height = 96;
    let i2 = r2.getContext(`2d`);
    i2.fillStyle = `rgba(0,0,0,0)`, i2.fillRect(0, 0, 512, 96), i2.font = `bold 76px Inter, Arial, sans-serif`, i2.textAlign = `center`, i2.textBaseline = `middle`, i2.shadowColor = `#7fd0ff`, i2.shadowBlur = 18, i2.fillStyle = `#e8f6ff`, i2.fillText(`MetLife`, 256, 52);
    let a2 = new Qi(r2);
    a2.colorSpace = Le;
    for (let r3 of [-1, 1]) {
      let i3 = new Y(new Mo(t2.w * 0.55, t2.w * 0.1), new ri({ map: a2, transparent: true, depthWrite: false, side: 2 }));
      i3.position.set(0, n2 - 0.9, (t2.d / 2 + 0.05) * r3), r3 < 0 && (i3.rotation.y = Math.PI), e44.add(i3);
    }
  }
  addRacks(e44, t2) {
    let n2 = new na(0.28, 0.42, 0.5);
    n2.translate(0, 0.21, 0);
    let r2 = new Ei(n2, new ri({ color: `#0b1d36` }), 180), i2 = new Xt(), a2 = 0;
    for (let e45 = 0; e45 < 9; e45++) for (let n3 = 0; n3 < 20; n3++) i2.makeTranslation(-t2.w / 2 + 1 + n3 * ((t2.w - 2) / 20), 0.03, -t2.d / 2 + 1.2 + e45 * ((t2.d - 2.4) / 8)), r2.setMatrixAt(a2++, i2);
    e44.add(r2);
    let o2 = new Yi(new Er().setAttribute(`position`, new J(Array.from({ length: 540 }, (e45, n3) => {
      let r3 = Math.floor(n3 / 3), i3 = Math.floor(r3 / 20), a3 = r3 % 20;
      return [-t2.w / 2 + 1 + a3 * ((t2.w - 2) / 20) + 0.15, 0.1 + n3 % 3 * 0.1, -t2.d / 2 + 1.2 + i3 * ((t2.d - 2.4) / 8) + 0.26];
    }).flat(), 3)), new Wi({ color: `#4fd1ff`, size: 0.06, transparent: true, opacity: 0.9, blending: 2, depthWrite: false }));
    e44.add(o2);
  }
  label(e44, t2, n2) {
    let r2 = document.createElement(`div`);
    r2.className = n2, r2.innerHTML = `<span>${e44}</span>`;
    let i2 = new $d(r2);
    return i2.position.copy(t2), i2;
  }
  addLinks(e44) {
    let t2 = this.buildings.get(this.zone?.buildingId ?? e44.buildings[0].id) ?? [...this.buildings.values()][0];
    if (!t2) return;
    let n2 = new G(t2.spec.x, t2.height, t2.spec.z);
    for (let r2 of e44.links) {
      let e45 = Et.degToRad(r2.bearing), i2 = new G(Math.sin(e45), 0, -Math.cos(e45)), a2 = n2.clone().add(i2.clone().multiplyScalar(70)).setY(t2.height * 0.4 + 6), o2 = n2.clone().add(i2.clone().multiplyScalar(30)).setY(t2.height + 14), s2 = new La(n2.clone().setY(t2.height + 0.2), o2, a2), c2 = new Yo({ uniforms: { uTime: { value: 0 }, uColor: { value: new q(`#2fb4ff`) }, uOpacity: { value: 0.9 }, uSpeed: { value: 0.35 } }, vertexShader: z_, fragmentShader: B_, transparent: true, depthWrite: false, blending: 2 });
      this.flows.push(c2);
      let l2 = new Y(new Ro(s2, 64, 0.08, 6, false), c2);
      l2.userData.link = r2.to, this.root.add(l2), this.root.add(this.label(`${r2.label}`, s2.getPoint(0.72).add(new G(0, 1.2, 0)), `fac-label link`));
    }
  }
  buildInterior(e44) {
    let t2 = this.buildings.get(e44.buildingId);
    if (!t2) return;
    let n2 = t2.floors[e44.floor - 1];
    if (!n2) return;
    let r2 = t2.spec, i2 = new Tn();
    i2.position.copy(t2.group.position), i2.rotation.copy(t2.group.rotation);
    let a2 = n2.y + 0.02, o2 = r2.shape === `faceted` ? 1 - 0.42 * ((e44.floor - 1) / r2.floors) : 1, s2 = new Po(this.footprint(r2, o2 * 0.98));
    s2.rotateX(-Math.PI / 2);
    let c2 = new Y(s2, new ri({ color: `#0b2546`, transparent: true, opacity: 0.95, side: 2 }));
    c2.position.y = a2, i2.add(c2);
    let l2 = r2.w * o2 * 0.8, u2 = r2.d * o2 * 0.7, d2 = new na(0.34, 0.07, 0.16);
    d2.translate(0, 0.035, 0);
    let f2 = Math.max(4, Math.floor(l2 / 0.55)), p2 = Math.max(3, Math.floor(u2 / 0.5)), m2 = new Ei(d2, new ri({ color: `#2a5d92` }), f2 * p2), h2 = new Xt(), g2 = 0;
    for (let e45 = 0; e45 < f2; e45++) for (let t3 = 0; t3 < p2; t3++) {
      let n3 = -l2 / 2 + (e45 + 0.5) * (l2 / f2), i3 = -u2 / 2 + (t3 + 0.5) * (u2 / p2);
      Math.abs(n3) < r2.w * 0.14 && Math.abs(i3) < r2.d * 0.14 || (h2.makeTranslation(n3, a2, i3), m2.setMatrixAt(g2++, h2));
    }
    m2.count = g2, i2.add(m2);
    let _2 = l2 * 0.38, v2 = u2 * 0.55, y2 = l2 / 2 - _2 / 2, b2 = new Ui(new da(new na(_2, r2.floorH * 0.7, v2)), new ji({ color: M_.zone, transparent: true, opacity: 0.95 }));
    b2.position.set(y2, a2 + r2.floorH * 0.35, 0), i2.add(b2);
    let x2 = new Y(new Mo(_2, v2), new ri({ color: M_.zone, transparent: true, opacity: 0.14, side: 2, depthWrite: false }));
    x2.rotation.x = -Math.PI / 2, x2.position.set(y2, a2 + 0.01, 0), x2.userData.roomFill = true, i2.add(x2);
    let S2 = [[y2 - _2 * 0.25, -v2 * 0.25], [y2 + _2 * 0.25, v2 * 0.25], [-l2 * 0.3, -u2 * 0.3], [-l2 * 0.05, u2 * 0.32], [-l2 * 0.35, u2 * 0.25], [y2, v2 * 0.6]];
    e44.devices.forEach((e45, t3) => {
      let [n3, r3] = S2[t3 % S2.length], o3 = e45.kind === `firewall` ? `#ff8a65` : e45.kind === `te` ? `#ffd166` : e45.kind === `endpoint` ? `#c792ea` : e45.kind === `phone` ? `#a4ce4e` : `#7fe7ff`, s3 = new Xr(new Ir({ map: this.glow, color: o3, transparent: true, depthWrite: false, blending: 2 }));
      s3.position.set(n3, a2 + 0.35, r3), s3.scale.setScalar(0.55), i2.add(s3), this.deviceSprites.push({ sprite: s3, phase: Math.random() * 6, kind: e45.kind });
      let c3 = new Y(new ia(0.012, 0.012, 0.35, 6), new ri({ color: o3, transparent: true, opacity: 0.7 }));
      c3.position.set(n3, a2 + 0.17, r3), i2.add(c3);
      let l3 = this.label(e45.label, new G(n3, a2 + 0.65, r3), `fac-label device k-${e45.kind}`);
      l3.visible = false, i2.add(l3), this.deviceLabels.push(l3);
      let u3 = [new G(n3, a2 + 0.05, r3), new G(n3 * 0.4, a2 + 0.05, r3 * 0.4), new G(0, a2 + 0.05, 0)], d3 = new Yo({ uniforms: { uTime: { value: Math.random() * 3 }, uColor: { value: new q(o3) }, uOpacity: { value: 0.8 }, uSpeed: { value: 0.6 } }, vertexShader: z_, fragmentShader: B_, transparent: true, depthWrite: false, blending: 2 });
      this.flows.push(d3), i2.add(new Y(new Ro(new xa(u3), 20, 0.018, 4, false), d3));
    }), i2.visible = false, this.interior = i2, this.root.add(i2);
    let C2 = this.label(`Floor ${e44.floor} \xB7 ${e44.room}`, new G(r2.w * 0.5 + 0.4, n2.y + r2.floorH * 0.5, 0), `fac-label zone`);
    t2.group.add(C2), this.zoneTag = C2;
  }
  buildEffects() {
    let e44 = this.zone ? this.buildings.get(this.zone.buildingId) : [...this.buildings.values()][0];
    if (!e44) return;
    let t2 = e44.height;
    this.beamMat = new Yo({ uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 }, uColor: { value: new q(`#7fe7ff`) } }, vertexShader: z_, fragmentShader: `
        uniform float uTime; uniform float uOpacity; uniform vec3 uColor; varying vec2 vUv;
        void main() {
          float stripes = 0.55 + 0.45 * sin(vUv.y * 40.0 + uTime * 10.0);
          float edge = pow(1.0 - abs(vUv.x - 0.5) * 2.0, 1.2);
          gl_FragColor = vec4(uColor * 1.6, edge * stripes * uOpacity * smoothstep(0.0, 0.2, vUv.y));
        }`, transparent: true, depthWrite: false, blending: 2, side: 2 });
    let n2 = this.zone ? e44.floors[this.zone.floor - 1]?.y ?? t2 : t2;
    this.beam = new Y(new ia(0.25, 0.9, 60, 24, 1, true), this.beamMat), this.beam.position.set(e44.spec.x, n2 + 30, e44.spec.z), this.beam.visible = false, this.root.add(this.beam);
    let r2 = Math.max(e44.spec.w, e44.spec.d, t2 * 0.5) * 0.9 + 2;
    this.shield = new Y(new Io(r2, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), new ri({ color: M_.good, wireframe: true, transparent: true, opacity: 0, depthWrite: false, blending: 2 })), this.shield.scale.y = Math.max(1, (t2 + 2) / r2), this.shield.position.set(e44.spec.x, 0, e44.spec.z), this.shield.visible = false, this.root.add(this.shield);
    let i2 = new No(r2 * 0.9, r2, 64);
    i2.rotateX(-Math.PI / 2), this.alarm = new Y(i2, new ri({ color: M_.crit, transparent: true, opacity: 0, depthWrite: false, blending: 2, side: 2 })), this.alarm.position.set(e44.spec.x, 0.05, e44.spec.z), this.root.add(this.alarm);
  }
  setState(e44) {
    this.state = e44;
    let t2 = this.zone;
    if (this.beamMat && this.beam) {
      let t3 = e44 === `warning`;
      t3 && (this.beam.visible = true), m_.to(this.beamMat.uniforms.uOpacity, { value: +!!t3, duration: 0.8, onComplete: () => void (!t3 && this.beam && (this.beam.visible = false)) });
    }
    if (this.shield) {
      let t3 = this.shield.material;
      e44 === `protected` ? (this.shield.visible = true, this.shield.scale.x = this.shield.scale.z = 0.2, m_.to(this.shield.scale, { x: 1, z: 1, duration: 1.4, ease: `back.out(1.4)` }), m_.to(t3, { opacity: 0.16, duration: 1 })) : m_.to(t3, { opacity: 0, duration: 0.6, onComplete: () => void (this.shield && (this.shield.visible = false)) });
    }
    if (!t2) return;
    let n2 = this.buildings.get(t2.buildingId)?.floors[t2.floor - 1];
    if (!n2) return;
    let r2 = e44 === `critical` || e44 === `recovering` ? M_.crit : e44 === `warning` ? M_.warn : e44 === `signal` ? M_.signal : e44 === `protected` ? M_.good : M_.zone;
    n2.baseColor.copy(r2), this.zoneTag && (this.zoneTag.element.dataset.state = e44);
  }
  pose(e44) {
    let t2 = this.zone, n2 = t2 && this.buildings.get(t2.buildingId) || [...this.buildings.values()][0];
    if (!n2) return { pos: new G(30, 30, 30), target: new G() };
    let r2 = n2.spec, i2 = r2.rot ?? 0, a2 = new G(Math.cos(i2 + 0.7), 0, -Math.sin(i2 + 0.7));
    if (e44 === `floor` && t2) {
      let e45 = n2.floors[t2.floor - 1], i3 = new G(r2.x, (e45?.y ?? 0) + 0.2, r2.z), o3 = Math.max(r2.w, r2.d) * 1.15 + 3;
      return { pos: i3.clone().add(a2.clone().multiplyScalar(o3)).add(new G(0, o3 * 0.75, 0)), target: i3 };
    }
    if (e44 === `building`) {
      let e45 = new G(r2.x, n2.height * 0.45, r2.z), t3 = Math.max(n2.height * 1.25, Math.max(r2.w, r2.d) * 2.6) + 6;
      return { pos: e45.clone().add(a2.clone().multiplyScalar(t3)).add(new G(0, n2.height * 0.25 + t3 * 0.25, 0)), target: e45 };
    }
    let o2 = [...this.buildings.values()], s2 = o2.reduce((e45, t3) => e45 + t3.spec.x, 0) / o2.length, c2 = o2.reduce((e45, t3) => e45 + t3.spec.z, 0) / o2.length, l2 = Math.max(...o2.map((e45) => e45.height)), u2 = Math.max(...o2.map((e45) => Math.hypot(e45.spec.x - s2, e45.spec.z - c2) + Math.max(e45.spec.w, e45.spec.d) / 2)), d2 = new G(s2, l2 * 0.3, c2), f2 = Math.max(l2 * 1.6, u2 * 1.6 + 10);
    return { pos: d2.clone().add(a2.clone().multiplyScalar(f2)).add(new G(0, f2 * 0.55, 0)), target: d2 };
  }
  setFocus(e44) {
    this.focus = e44;
    let t2 = this.zone, n2 = t2 ? this.buildings.get(t2.buildingId) : null;
    this.interior.visible = e44 === `floor`, this.deviceLabels.forEach((t3) => t3.visible = e44 === `floor`), this.buildings.forEach((r2) => {
      r2.label.visible = e44 !== `floor` || r2 !== n2, r2.floors.forEach((i2) => {
        let a2 = e44 === `floor` && r2 === n2 && t2 && i2.index > t2.floor, o2 = r2 === n2 && t2 && i2.index === t2.floor, s2 = e44 === `floor` && r2 !== n2, c2 = a2 ? 0.06 : s2 ? 0.3 : o2 && e44 === `floor` ? 0.25 : 1;
        m_.to(i2.mesh.material, { opacity: i2.baseOpacity * 0.55 * c2, duration: 0.8 }), m_.to(i2.edges.material, { opacity: Math.min(1, i2.baseOpacity + 0.25) * (a2 ? 0.12 : s2 ? 0.4 : 1), duration: 0.8 });
      });
    }), m_.to(this.cityMat.uniforms.uDim, { value: e44 === `floor` ? 0.45 : 1, duration: 1 });
  }
  anchor(e44) {
    let t2 = this.zone, n2 = t2 && this.buildings.get(t2.buildingId) || [...this.buildings.values()][0];
    if (!n2) return null;
    if (e44 === `zone` && t2) {
      let e45 = n2.floors[t2.floor - 1];
      return new G(n2.spec.x, (e45?.y ?? 0) + n2.spec.floorH * 0.5, n2.spec.z);
    }
    return e44 === `top` ? new G(n2.spec.x, n2.height, n2.spec.z) : n2.center.clone();
  }
  pickFloor(e44) {
    let t2 = [];
    this.buildings.forEach((e45) => e45.floors.forEach((e46) => t2.push(e46.mesh)));
    let n2 = e44.intersectObjects(t2, false)[0];
    return n2 ? n2.object.userData : null;
  }
  hover(e44) {
    let t2 = this.pickFloor(e44), n2 = t2 ? this.buildings.get(t2.building)?.floors[t2.floor - 1] ?? null : null;
    if (n2 === this.hoverFloor) return;
    if (this.hoverFloor = n2, !t2 || !n2) return this.onFloorHover(null);
    let r2 = this.buildings.get(t2.building), i2 = r2.spec.metlife?.some(([e45, n3]) => t2.floor >= e45 && t2.floor <= n3), a2 = r2.spec.bands?.find((e45) => t2.floor >= e45.from && t2.floor <= e45.to), o2 = this.zone && this.zone.buildingId === t2.building && this.zone.floor === t2.floor ? this.zone : null, s2 = o2 ? `${o2.room}. ${o2.basis}` : i2 ? `MetLife-occupied floor (public source)` : a2 ? a2.label : r2.spec.heightVerified ? `Office floor` : `Illustrative floor`;
    this.onFloorHover({ building: r2.spec.label, floor: t2.floor, text: s2 });
  }
  get raycast() {
    return this.raycaster;
  }
  update(e44) {
    this.time += e44;
    let t2 = this.time;
    if (this.groundMat.uniforms.uTime.value = t2, this.flows.forEach((t3) => t3.uniforms.uTime.value += e44), this.beamMat && (this.beamMat.uniforms.uTime.value = t2), this.pulse = (Math.sin(t2 * (this.state === `critical` ? 7 : 3.2)) + 1) / 2, this.buildings.forEach((e45) => e45.floors.forEach((t3) => {
      let n2 = t3.mesh.material, r2 = t3.edges.material, i2 = this.zone && e45.spec.id === this.zone.buildingId && t3.index === this.zone.floor, a2 = t3 === this.hoverFloor;
      n2.color.copy(t3.baseColor), r2.color.copy(t3.baseColor).lerp(M_.edge, i2 ? 0 : 0.3), i2 && r2.color.multiplyScalar(0.7 + this.pulse * 0.9), a2 && (n2.color.lerp(new q(`#ffffff`), 0.35), r2.color.lerp(new q(`#ffffff`), 0.5));
    })), this.alarm) {
      let n2 = this.alarm.material, r2 = this.state === `critical`;
      n2.opacity += ((r2 ? 0.25 + this.pulse * 0.5 : 0) - n2.opacity) * Math.min(1, e44 * 4);
      let i2 = 1 + t2 * 0.6 % 1 * 0.5;
      this.alarm.scale.set(i2, 1, i2);
    }
    this.shield?.visible && (this.shield.rotation.y += e44 * 0.3);
    for (let e45 of this.deviceSprites) {
      let n2 = this.state === `critical` && e45.kind !== `te`, r2 = e45.sprite.material;
      r2.opacity = 0.65 + 0.35 * Math.sin(t2 * (n2 ? 9 : 2.5) + e45.phase);
    }
    this.zoneTag && (this.zoneTag.visible = this.focus !== `site`);
  }
}, H_ = 1.55, U_ = { idle: new q(`#3fb6ff`), signal: new q(`#ffd166`), warning: new q(`#ffb020`), critical: new q(`#ff3b4f`), recovering: new q(`#ff9f43`), protected: new q(`#7cf29c`) }, W_ = [`#049fd9`, `#a4ce4e`, `#c792ea`, `#ff6b6b`].map((e44) => new q(e44)), G_ = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`, K_ = `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uOpacity;
  uniform vec3 uColor;
  uniform float uPhase;
  varying vec2 vUv;
  void main() {
    float p = fract(vUv.x * 2.0 - uTime * uSpeed + uPhase);
    float head = smoothstep(0.82, 1.0, p);
    float tail = smoothstep(0.0, 0.82, p) * 0.18;
    float ends = smoothstep(0.0, 0.06, vUv.x) * smoothstep(1.0, 0.94, vUv.x);
    float a = (0.14 + head * 0.9 + tail) * ends * uOpacity;
    gl_FragColor = vec4(uColor * (0.6 + head * 1.6), a);
  }
`, q_ = class {
  container;
  scene = new Nn();
  camera;
  renderer;
  controls;
  composer;
  bloom;
  labelRenderer;
  globe = new Tn();
  dotsMat;
  atmosphereMat;
  oceanMat;
  streamsMat;
  shell = new Tn();
  shellLines;
  rings = [];
  agents = [];
  beacons = /* @__PURE__ */ new Map();
  fabricArcs = [];
  blastArcs = [];
  beam;
  beamMat;
  shock;
  shockMat;
  raycaster = new Ks();
  pointer = new W(-10, -10);
  hovered = null;
  last = performance.now();
  elapsed = 0;
  glow = j_();
  layerState = { fabric: 1, streams: 1, reach: 1, silo: 0, shell: 1 };
  camTween = null;
  idleSpin = true;
  flashes = [];
  onSiteClick = () => {
  };
  onSiteHover = () => {
  };
  onFloorClick = () => {
  };
  facility;
  view = `globe`;
  localCam;
  localControls;
  localLabels;
  localLabelEl;
  labelEl;
  renderPass;
  localTween = null;
  warpEl;
  center = null;
  offset = { x: 0, y: 0 };
  offsetTween = null;
  constructor(e44, t2) {
    this.container = e44, this.renderer = new hd({ antialias: true, alpha: false, powerPreference: `high-performance`, preserveDrawingBuffer: true }), this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)), this.renderer.setSize(e44.clientWidth, e44.clientHeight), this.renderer.setClearColor(`#02050c`), this.renderer.toneMapping = 4, this.renderer.toneMappingExposure = 1.05, e44.appendChild(this.renderer.domElement), this.labelRenderer = new of({ element: t2 }), this.labelRenderer.setSize(e44.clientWidth, e44.clientHeight), this.labelEl = t2, this.localLabelEl = document.createElement(`div`), this.localLabelEl.id = `labelsLocal`, t2.after(this.localLabelEl), this.localLabels = new of({ element: this.localLabelEl }), this.localLabels.setSize(e44.clientWidth, e44.clientHeight), this.localLabelEl.style.display = `none`, this.warpEl = document.createElement(`div`), this.warpEl.className = `warp`, document.body.appendChild(this.warpEl), this.camera = new Ts(42, e44.clientWidth / e44.clientHeight, 0.01, 200), this.camera.position.copy(E_(25, -40, 3.8)), this.controls = new Ed(this.camera, this.renderer.domElement), this.controls.enableDamping = true, this.controls.dampingFactor = 0.06, this.controls.enablePan = false, this.controls.minDistance = 1.35, this.controls.maxDistance = 7, this.controls.rotateSpeed = 0.5, this.controls.zoomSpeed = 0.7, this.controls.addEventListener(`start`, () => {
      this.camTween?.kill(), this.idleSpin = false;
    }), this.localCam = new Ts(45, e44.clientWidth / e44.clientHeight, 0.1, 900), this.localControls = new Ed(this.localCam, this.renderer.domElement), this.localControls.enableDamping = true, this.localControls.dampingFactor = 0.07, this.localControls.maxPolarAngle = 1.48, this.localControls.minDistance = 3, this.localControls.maxDistance = 220, this.localControls.enabled = false, this.localControls.addEventListener(`start`, () => this.localTween?.kill()), this.facility = new V_(this.glow), this.scene.add(this.globe), this.buildStars(), this.buildOcean(), this.buildDots(), this.buildAtmosphere(), this.buildBeacons(), this.buildFabric(), this.buildStreams(), this.buildShell(), this.beamMat = new Yo({ uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 }, uColor: { value: new q(`#7fe7ff`) } }, vertexShader: G_, fragmentShader: `
        uniform float uTime; uniform float uOpacity; uniform vec3 uColor; varying vec2 vUv;
        void main() {
          float stripes = 0.55 + 0.45 * sin(vUv.y * 60.0 + uTime * 14.0);
          float edge = pow(1.0 - abs(vUv.x - 0.5) * 2.0, 1.5);
          float fade = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
          gl_FragColor = vec4(uColor * 1.8, edge * stripes * fade * uOpacity);
        }`, transparent: true, depthWrite: false, blending: 2, side: 2 }), this.beam = new Y(new ia(4e-3, 0.022, 0.55, 24, 1, true), this.beamMat), this.beam.visible = false, this.globe.add(this.beam), this.shockMat = new ri({ color: `#7cf29c`, transparent: true, opacity: 0, depthWrite: false, blending: 2, side: 2 });
    let n2 = new No(0.02, 0.026, 64);
    n2.rotateX(-Math.PI / 2), this.shock = new Y(n2, this.shockMat), this.shock.visible = false, this.globe.add(this.shock);
    let r2 = new Jd(this.scene, this.camera);
    this.renderPass = r2, this.bloom = new Xd(new W(e44.clientWidth, e44.clientHeight), 0.62, 0.5, 0.32), this.composer = new qd(this.renderer), this.composer.addPass(r2), this.composer.addPass(this.bloom), this.composer.addPass(new Qd()), window.addEventListener(`resize`, () => this.resize()), this.renderer.domElement.addEventListener(`pointermove`, (e45) => this.onPointerMove(e45)), this.renderer.domElement.addEventListener(`click`, () => {
      if (this.view === `local`) {
        this.facility.raycast.setFromCamera(this.pointer, this.localCam);
        let e45 = this.facility.pickFloor(this.facility.raycast);
        e45 && this.onFloorClick(e45.building, e45.floor);
      } else this.hovered && this.onSiteClick(this.hovered);
    }), this.setSun(-40);
  }
  buildStars() {
    let e44 = 2600, t2 = new Float32Array(e44 * 3), n2 = new Float32Array(e44 * 3), r2 = new G();
    for (let i3 = 0; i3 < e44; i3++) {
      r2.randomDirection().multiplyScalar(40 + Math.random() * 60), t2.set([r2.x, r2.y, r2.z], i3 * 3);
      let e45 = 0.5 + Math.random() * 0.5;
      n2.set([e45 * 0.8, e45 * 0.9, e45], i3 * 3);
    }
    let i2 = new Er();
    i2.setAttribute(`position`, new fr(t2, 3)), i2.setAttribute(`color`, new fr(n2, 3));
    let a2 = new Wi({ size: 0.18, map: this.glow, vertexColors: true, transparent: true, depthWrite: false, opacity: 0.8 });
    this.scene.add(new Yi(i2, a2));
  }
  buildOcean() {
    this.oceanMat = new Yo({ uniforms: { uSun: { value: new G(1, 0, 0) } }, vertexShader: `
        varying vec3 vN; varying vec3 vWN; varying vec3 vView;
        void main() {
          vN = normalize(normalMatrix * normal);
          vWN = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vView = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }`, fragmentShader: `
        uniform vec3 uSun; varying vec3 vN; varying vec3 vWN; varying vec3 vView;
        void main() {
          float fres = pow(1.0 - max(dot(vN, vView), 0.0), 3.0);
          float day = smoothstep(-0.2, 0.4, dot(vWN, uSun));
          vec3 deep = mix(vec3(0.005, 0.012, 0.03), vec3(0.012, 0.04, 0.085), day);
          vec3 col = deep + vec3(0.05, 0.35, 0.7) * fres * 0.55;
          gl_FragColor = vec4(col, 1.0);
        }` }), this.globe.add(new Y(new Io(0.995, 96, 64), this.oceanMat));
  }
  buildDots() {
    let e44 = A_(O_(), 95e3), t2 = e44.length / 3, n2 = new Float32Array(t2);
    for (let e45 = 0; e45 < t2; e45++) n2[e45] = Math.random();
    let r2 = new Er();
    r2.setAttribute(`position`, new fr(e44, 3)), r2.setAttribute(`aRnd`, new fr(n2, 1)), this.dotsMat = new Yo({ uniforms: { uTime: { value: 0 }, uSun: { value: new G(1, 0, 0) }, uPixelRatio: { value: this.renderer.getPixelRatio() }, uFocus: { value: new G(0, 0, 0) }, uFocusStrength: { value: 0 }, uScan: { value: 0 }, uScanStrength: { value: 0 }, uIncident: { value: new G(0, 0, 0) }, uIncidentColor: { value: new q(`#ff3b4f`) }, uIncidentRadius: { value: 0 }, uIncidentStrength: { value: 0 } }, vertexShader: `
        uniform float uTime; uniform vec3 uSun; uniform float uPixelRatio;
        uniform vec3 uFocus; uniform float uFocusStrength; uniform float uScan; uniform float uScanStrength;
        uniform vec3 uIncident; uniform vec3 uIncidentColor; uniform float uIncidentRadius; uniform float uIncidentStrength;
        attribute float aRnd;
        varying vec3 vColor; varying float vAlpha;
        void main() {
          vec3 p = position;
          float sun = dot(normalize(p), uSun);
          float day = smoothstep(-0.12, 0.3, sun);
          vec3 night = vec3(0.05, 0.11, 0.24);
          vec3 dayc = vec3(0.2, 0.46, 0.78);
          vec3 c = mix(night, dayc, day);
          // City-light glints on the night side
          float lights = step(0.965, aRnd) * (1.0 - day) * (0.6 + 0.4 * sin(uTime * 2.0 + aRnd * 50.0));
          c += vec3(1.0, 0.72, 0.35) * lights * 0.9;
          float df = distance(p, uFocus);
          c += vec3(0.25, 0.7, 1.0) * uFocusStrength * smoothstep(0.32, 0.0, df) * 0.7;
          float ring = smoothstep(0.03, 0.0, abs(df - uScan)) * uScanStrength;
          c += vec3(0.4, 0.95, 1.0) * ring * 1.6;
          float di = distance(p, uIncident);
          float inc = smoothstep(uIncidentRadius, uIncidentRadius * 0.2, di) * uIncidentStrength;
          c = mix(c, uIncidentColor * (0.75 + 0.35 * sin(uTime * 5.0 - di * 40.0)), clamp(inc, 0.0, 1.0) * 0.8);
          vec4 mv = modelViewMatrix * vec4(p * 1.002, 1.0);
          gl_PointSize = (0.0062 + ring * 0.005 + inc * 0.003) * uPixelRatio * (900.0 / -mv.z);
          vColor = c;
          vAlpha = 0.65 + day * 0.35 + ring;
          gl_Position = projectionMatrix * mv;
        }`, fragmentShader: `
        varying vec3 vColor; varying float vAlpha;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          if (d > 0.5) discard;
          float a = smoothstep(0.5, 0.18, d);
          gl_FragColor = vec4(vColor, a * vAlpha);
        }`, transparent: true, depthWrite: false }), this.globe.add(new Yi(r2, this.dotsMat));
  }
  buildAtmosphere() {
    this.atmosphereMat = new Yo({ uniforms: { uColor: { value: new q(`#1d8fff`) }, uIntensity: { value: 1 } }, vertexShader: `
        varying vec3 vN; varying vec3 vView;
        void main() {
          vN = normalize(normalMatrix * normal);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vView = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }`, fragmentShader: `
        uniform vec3 uColor; uniform float uIntensity; varying vec3 vN; varying vec3 vView;
        void main() {
          // Back faces: dot is 0 at the outer rim and about -0.5 where the shell meets the globe limb.
          float d = clamp(-dot(vN, vView) * 1.95, 0.0, 1.0);
          float i = pow(d, 2.6) * 0.95 * uIntensity;
          gl_FragColor = vec4(uColor * i, i);
        }`, side: 1, transparent: true, depthWrite: false, blending: 2 });
    let e44 = new Y(new Io(1, 64, 48), this.atmosphereMat);
    e44.scale.setScalar(1.16), this.scene.add(e44);
  }
  buildBeacons() {
    let e44 = new G(0, 1, 0);
    for (let t2 of h_) {
      let n2 = !!t2.hub, r2 = E_(t2.lat, t2.lon, 1), i2 = new Tn();
      i2.position.copy(r2), i2.quaternion.setFromUnitVectors(e44, r2);
      let a2 = U_.idle.clone(), o2 = n2 ? 0.07 : 0.032, s2 = new ia(12e-4, 28e-4, o2, 8);
      s2.translate(0, o2 / 2, 0);
      let c2 = new Y(s2, new ri({ color: a2, transparent: true, opacity: 0.9, blending: 2, depthWrite: false }));
      i2.add(c2);
      let l2 = new Xr(new Ir({ map: this.glow, color: a2, transparent: true, depthWrite: false, blending: 2 }));
      l2.position.y = o2, l2.scale.setScalar(n2 ? 0.055 : 0.03), i2.add(l2);
      let u2 = new No(n2 ? 0.012 : 7e-3, n2 ? 0.016 : 9e-3, 48);
      u2.rotateX(-Math.PI / 2);
      let d2 = new Y(u2, new ri({ color: a2, transparent: true, opacity: 0.9, side: 2, depthWrite: false, blending: 2 }));
      d2.position.y = 2e-3, i2.add(d2);
      let f2 = new No(0.014, 0.017, 48);
      f2.rotateX(-Math.PI / 2);
      let p2 = new Y(f2, new ri({ color: a2, transparent: true, opacity: 0, side: 2, depthWrite: false, blending: 2 }));
      p2.position.y = 3e-3, i2.add(p2);
      let m2 = new Y(new Io(0.085, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new ri({ color: U_.protected, wireframe: true, transparent: true, opacity: 0, depthWrite: false, blending: 2 }));
      m2.visible = false, i2.add(m2);
      let h2 = new Y(new Io(n2 ? 0.045 : 0.03, 8, 8), new ri({ visible: false }));
      h2.position.y = o2 * 0.6, h2.userData.siteId = t2.id, i2.add(h2);
      let g2 = document.createElement(`div`);
      g2.className = `site-label ${n2 ? `hub` : `minor`}${t2.id === `whippany` || t2.id === `dublin` || t2.id === `hongkong` ? ` left` : ``}`, g2.innerHTML = `<span class="dot"></span><span class="txt">${t2.city}<em class="note"></em></span>`, g2.addEventListener(`click`, () => this.onSiteClick(t2.id));
      let _2 = new $d(g2);
      _2.position.set(0, o2 + 0.012, 0), i2.add(_2), this.globe.add(i2), this.beacons.set(t2.id, { site: t2, group: i2, normal: r2, head: l2, spike: c2, base: d2, pulse: p2, shield: m2, hit: h2, label: _2, state: `idle`, color: a2, pulseT: Math.random() });
    }
  }
  makeArc(e44, t2, n2, r2, i2, a2 = 22e-4) {
    let o2 = e44.distanceTo(t2), s2 = 0.03 + Math.min(o2, 1.3) * 0.17, c2 = new Dt(), l2 = new Dt().setFromUnitVectors(e44.clone().normalize(), t2.clone().normalize()), u2 = [];
    for (let t3 = 0; t3 <= 48; t3++) {
      let n3 = t3 / 48, r3 = c2.clone().slerp(l2, n3);
      u2.push(e44.clone().normalize().applyQuaternion(r3).multiplyScalar(1.003 + Math.sin(Math.PI * n3) * s2));
    }
    let d2 = new xa(u2), f2 = new Yo({ uniforms: { uTime: { value: 0 }, uSpeed: { value: i2 }, uOpacity: { value: r2 }, uColor: { value: n2.clone() }, uPhase: { value: Math.random() } }, vertexShader: G_, fragmentShader: K_, transparent: true, depthWrite: false, blending: 2 }), p2 = new Y(new Ro(d2, 72, a2, 6, false), f2);
    return this.globe.add(p2), { mesh: p2, mat: f2 };
  }
  buildFabric() {
    let e44 = [[`nyc`, `cary`], [`cary`, `tampa`], [`nyc`, `whippany`], [`cary`, `cdmx`], [`cdmx`, `santiago`], [`santiago`, `saopaulo`], [`cdmx`, `saopaulo`], [`nyc`, `london`], [`london`, `dublin`], [`london`, `paris`], [`paris`, `warsaw`], [`warsaw`, `istanbul`], [`istanbul`, `dubai`], [`london`, `dubai`], [`dubai`, `noida`], [`noida`, `mumbai`], [`noida`, `hongkong`], [`hongkong`, `shanghai`], [`shanghai`, `seoul`], [`seoul`, `tokyo`], [`tokyo`, `sydney`], [`hongkong`, `sydney`], [`tokyo`, `cary`], [`cary`, `noida`], [`cary`, `london`], [`tampa`, `cdmx`], [`nyc`, `greenbush`], [`cary`, `greenbush`], [`london`, `brighton`], [`brighton`, `dublin`]], t2 = new q(`#2fb4ff`);
    for (let [n2, r2] of e44) this.fabricArcs.push(this.makeArc(this.beacons.get(n2).normal, this.beacons.get(r2).normal, t2, 0.75, 0.12 + Math.random() * 0.12));
  }
  buildStreams() {
    let e44 = h_.length * 26, t2 = new Float32Array(e44 * 3), n2 = new Float32Array(e44), r2 = new Float32Array(e44), i2 = new Float32Array(e44 * 3), a2 = 0;
    for (let e45 of h_) {
      let o3 = this.beacons.get(e45.id).normal;
      for (let e46 = 0; e46 < 26; e46++, a2++) {
        let s2 = new G().randomDirection().multiplyScalar(0.012), c2 = o3.clone().add(s2).normalize();
        t2.set([c2.x, c2.y, c2.z], a2 * 3), n2[a2] = Math.random(), r2[a2] = 0.12 + Math.random() * 0.18;
        let l2 = W_[e46 % W_.length];
        i2.set([l2.r, l2.g, l2.b], a2 * 3);
      }
    }
    let o2 = new Er();
    o2.setAttribute(`position`, new fr(t2, 3)), o2.setAttribute(`aPhase`, new fr(n2, 1)), o2.setAttribute(`aSpeed`, new fr(r2, 1)), o2.setAttribute(`aColor`, new fr(i2, 3)), this.streamsMat = new Yo({ uniforms: { uTime: { value: 0 }, uReach: { value: 1 }, uOpacity: { value: 1 }, uSilo: { value: 0 }, uPixelRatio: { value: this.renderer.getPixelRatio() }, uShell: { value: H_ } }, vertexShader: `
        uniform float uTime; uniform float uReach; uniform float uOpacity; uniform float uSilo; uniform float uPixelRatio; uniform float uShell;
        attribute float aPhase; attribute float aSpeed; attribute vec3 aColor;
        varying vec3 vColor; varying float vAlpha;
        void main() {
          float f = fract(uTime * aSpeed + aPhase);
          float r = mix(1.01, 1.01 + (uShell - 1.01) * uReach, f);
          vec3 p = normalize(position) * r;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = 0.009 * uPixelRatio * (900.0 / -mv.z);
          vColor = mix(vec3(0.45, 0.9, 1.0), aColor, uSilo);
          vAlpha = sin(f * 3.14159) * uOpacity;
          gl_Position = projectionMatrix * mv;
        }`, fragmentShader: `
        varying vec3 vColor; varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          gl_FragColor = vec4(vColor * 1.4, smoothstep(0.5, 0.0, d) * vAlpha);
        }`, transparent: true, depthWrite: false, blending: 2 }), this.globe.add(new Yi(o2, this.streamsMat));
  }
  buildShell() {
    let e44 = new zo(new Ao(H_, 3));
    this.shellLines = new Ui(e44, new ji({ color: `#2fb4ff`, transparent: true, opacity: 0.045, depthWrite: false, blending: 2 })), this.shell.add(this.shellLines), [new sn(Math.PI / 2.2, 0, 0.3), new sn(Math.PI / 3, 0.9, -0.2), new sn(Math.PI / 1.7, -0.7, 0.5)].forEach((e45, t3) => {
      let n2 = new Y(new Lo(H_ + t3 * 0.035, 16e-4, 6, 320), new ri({ color: t3 === 0 ? `#7fe7ff` : `#2fb4ff`, transparent: true, opacity: 0.5, depthWrite: false, blending: 2 }));
      n2.rotation.copy(e45), this.rings.push(n2), this.shell.add(n2);
    });
    let t2 = new jo(0.018, 0);
    for (let e45 = 0; e45 < 9; e45++) {
      let n2 = new Tn(), r2 = new Y(t2, new ri({ color: `#bff6ff` })), i2 = new Xr(new Ir({ map: this.glow, color: `#49d3ff`, transparent: true, depthWrite: false, blending: 2 }));
      i2.scale.setScalar(0.06), n2.add(r2, i2), this.shell.add(n2), this.agents.push({ mesh: n2, ring: e45 % 3, speed: 0.08 + Math.random() * 0.06, phase: e45 / 9 * Math.PI * 2 });
    }
    this.scene.add(this.shell);
  }
  setSun(e44, t2 = -11) {
    let n2 = E_(t2, e44, 1);
    this.dotsMat.uniforms.uSun.value.copy(n2), this.oceanMat.uniforms.uSun.value.copy(n2);
  }
  setLayer(e44) {
    let t2 = { sites: { fabric: 0.25, streams: 0.35, reach: 0.25, silo: 0, shell: 0.15 }, silos: { fabric: 0, streams: 1.3, reach: 0.32, silo: 1, shell: 0 }, fabric: { fabric: 1.2, streams: 1, reach: 0.45, silo: 0, shell: 0.2 }, agents: { fabric: 0.8, streams: 1, reach: 1, silo: 0, shell: 1.4 }, all: { fabric: 0.8, streams: 0.9, reach: 1, silo: 0, shell: 1 } }[e44];
    m_.to(this.layerState, { ...t2, duration: 2.2, ease: `power2.inOut` });
  }
  flyTo(e44, t2, n2, r2 = 2.6) {
    this.camTween?.kill(), this.idleSpin = false;
    let i2 = D_(this.camera.position), a2 = t2 - i2.lon;
    a2 > 180 && (a2 -= 360), a2 < -180 && (a2 += 360);
    let o2 = { lat: i2.lat, lon: i2.lon, r: i2.r, lift: 0 }, s2 = Math.min(1.2, Math.abs(a2) / 120 + Math.abs(e44 - i2.lat) / 120);
    return new Promise((t3) => {
      this.camTween = m_.to(o2, { lat: e44, lon: i2.lon + a2, r: n2, duration: r2, ease: `power2.inOut`, onUpdate: () => {
        let e45 = this.camTween ? this.camTween.progress() : 1, t4 = Math.sin(e45 * Math.PI) * s2;
        E_(o2.lat, o2.lon, o2.r + t4, this.camera.position), this.camera.lookAt(0, 0, 0);
      }, onComplete: () => t3() });
    });
  }
  focusSite(e44, t2 = 2.15, n2 = 2.6) {
    let r2 = this.beacons.get(e44);
    return r2 ? (this.dotsMat.uniforms.uFocus.value.copy(r2.normal), m_.to(this.dotsMat.uniforms.uFocusStrength, { value: 1, duration: 1.5 }), this.beacons.forEach((t3) => t3.label.element.classList.toggle(`focused`, t3.site.id === e44)), this.flyTo(r2.site.lat - 6, r2.site.lon, t2, n2)) : Promise.resolve();
  }
  clearFocus() {
    m_.to(this.dotsMat.uniforms.uFocusStrength, { value: 0, duration: 1.2 }), this.beacons.forEach((e44) => e44.label.element.classList.remove(`focused`));
  }
  setIdleSpin(e44) {
    this.idleSpin = e44;
  }
  scan(e44) {
    let t2 = this.beacons.get(e44);
    if (!t2) return;
    this.dotsMat.uniforms.uFocus.value.copy(t2.normal);
    let n2 = this.dotsMat.uniforms;
    m_.fromTo(n2.uScan, { value: 0 }, { value: 0.9, duration: 2.4, ease: `power1.out` }), m_.fromTo(n2.uScanStrength, { value: 1 }, { value: 0, duration: 2.4, ease: `power2.in` });
  }
  setSiteState(e44, t2) {
    let n2 = this.beacons.get(e44);
    if (!n2 || n2.state === t2) return;
    n2.state = t2;
    let r2 = U_[t2];
    m_.to(n2.color, { r: r2.r, g: r2.g, b: r2.b, duration: 0.6 }), n2.label.element.dataset.state = t2;
    let i2 = n2.shield.material;
    t2 === `protected` ? (n2.shield.visible = true, n2.shield.scale.setScalar(0.2), m_.to(n2.shield.scale, { x: 1, y: 1, z: 1, duration: 1.2, ease: `back.out(1.6)` }), m_.to(i2, { opacity: 0.22, duration: 0.8 })) : n2.shield.visible && m_.to(i2, { opacity: 0, duration: 0.5, onComplete: () => void (n2.shield.visible = false) });
  }
  setLabelNote(e44, t2 = ``) {
    this.beacons.forEach((n2) => {
      let r2 = n2.label.element.querySelector(`.note`);
      r2.textContent = n2.site.id === e44 ? t2 : ``;
    });
  }
  resetSites() {
    this.beacons.forEach((e44, t2) => this.setSiteState(t2, `idle`)), this.setBeam(null), this.setIncident(null), this.setBlast(null, []);
  }
  setIncident(e44, t2 = `critical`, n2 = 0.22, r2) {
    let i2 = this.dotsMat.uniforms;
    if (!e44) {
      m_.to(i2.uIncidentStrength, { value: 0, duration: 0.8 });
      return;
    }
    let a2 = this.beacons.get(e44);
    i2.uIncident.value.copy(a2.normal);
    let o2 = t2 === `critical` ? U_.critical : t2 === `warning` ? U_.warning : U_.protected;
    m_.to(i2.uIncidentColor.value, { r: o2.r, g: o2.g, b: o2.b, duration: 0.6 }), m_.to(i2.uIncidentRadius, { value: n2, duration: 1.2 }), m_.to(i2.uIncidentStrength, { value: r2 ?? (t2 === `protected` ? 0.42 : t2 === `warning` ? 0.7 : 1), duration: 0.8 });
  }
  setBlast(e44, t2) {
    for (let e45 of this.blastArcs) this.globe.remove(e45.mesh), e45.mesh.geometry.dispose(), e45.mat.dispose();
    if (this.blastArcs = [], !e44) return;
    let n2 = this.beacons.get(e44).normal;
    for (let e45 of t2) {
      let t3 = this.beacons.get(e45);
      if (!t3) continue;
      let r2 = this.makeArc(n2, t3.normal, U_.critical, 1.4, 0.5, 35e-4);
      this.blastArcs.push(r2);
    }
  }
  setBeam(e44) {
    if (!e44) {
      m_.to(this.beamMat.uniforms.uOpacity, { value: 0, duration: 0.6, onComplete: () => void (this.beam.visible = false) });
      return;
    }
    let t2 = this.beacons.get(e44);
    this.beam.position.copy(t2.normal).multiplyScalar(1.275), this.beam.quaternion.setFromUnitVectors(new G(0, 1, 0), t2.normal), this.beam.visible = true, m_.to(this.beamMat.uniforms.uOpacity, { value: 1, duration: 0.6 });
    let n2 = t2.normal.clone().multiplyScalar(H_), r2 = this.agents[0];
    r2.speed = 0, m_.to(r2.mesh.position, { x: n2.x, y: n2.y, z: n2.z, duration: 1.2, ease: `power2.out` });
  }
  releaseAgent() {
    this.agents[0].speed = 0.1;
  }
  shockwave(e44, t2 = `#7cf29c`) {
    let n2 = this.beacons.get(e44);
    n2 && (this.shock.position.copy(n2.normal).multiplyScalar(1.003), this.shock.quaternion.setFromUnitVectors(new G(0, 1, 0), n2.normal), this.shock.visible = true, this.shockMat.color.set(t2), this.shock.scale.setScalar(1), m_.fromTo(this.shock.scale, { x: 1, y: 1, z: 1 }, { x: 9, y: 9, z: 9, duration: 1.6, ease: `power2.out` }), m_.fromTo(this.shockMat, { opacity: 1 }, { opacity: 0, duration: 1.6, ease: `power1.in` }));
  }
  flash(e44, t2 = `#7cf29c`) {
    let n2 = this.beacons.get(e44);
    if (!n2) return;
    let r2 = new Xr(new Ir({ map: this.glow, color: t2, transparent: true, depthWrite: false, blending: 2 }));
    r2.position.copy(n2.normal).multiplyScalar(1.02), r2.scale.setScalar(0.01), this.globe.add(r2), this.flashes.push({ sprite: r2, t: 0 });
  }
  siteIds() {
    return [...this.beacons.keys()];
  }
  warp() {
    return new Promise((e44) => {
      this.warpEl.classList.remove(`on`), this.warpEl.offsetWidth, this.warpEl.classList.add(`on`), setTimeout(e44, 420), setTimeout(() => this.warpEl.classList.remove(`on`), 1100);
    });
  }
  useLocal(e44) {
    this.view = e44 ? `local` : `globe`, this.controls.enabled = !e44, this.localControls.enabled = e44, this.renderPass.scene = e44 ? this.facility.scene : this.scene, this.renderPass.camera = e44 ? this.localCam : this.camera, this.labelEl.style.display = e44 ? `none` : ``, this.localLabelEl.style.display = e44 ? `` : `none`, this.bloom.strength = e44 ? 0.5 : 0.62, this.hovered = null, this.onSiteHover(null);
  }
  async enterFacility(e44, t2, n2 = `building`) {
    if (this.view === `local` && this.facility.facility?.siteId === e44.siteId && this.facility.zone === t2) return this.setLocalFocus(n2);
    if (this.view === `globe`) {
      let t3 = g_[e44.siteId];
      this.idleSpin = false, await this.flyTo(t3.lat, t3.lon, 1.32, 1.5);
    }
    await this.warp(), this.facility.build(e44, t2), this.useLocal(true);
    let r2 = this.facility.pose(n2);
    this.localCam.position.copy(r2.target).add(new G(6, 160, 40)), this.localControls.target.copy(r2.target), this.localCam.lookAt(r2.target), this.facility.setFocus(n2), await this.tweenLocal(n2, 2.6);
  }
  tweenLocal(e44, t2 = 1.8) {
    let n2 = this.facility.pose(e44);
    return this.localTween?.kill(), new Promise((e45) => {
      let r2 = m_.timeline({ onComplete: () => e45(), onInterrupt: () => e45() });
      r2.to(this.localCam.position, { x: n2.pos.x, y: n2.pos.y, z: n2.pos.z, duration: t2, ease: `power3.inOut` }, 0), r2.to(this.localControls.target, { x: n2.target.x, y: n2.target.y, z: n2.target.z, duration: t2, ease: `power3.inOut`, onUpdate: () => this.localCam.lookAt(this.localControls.target) }, 0), this.localTween = r2;
    });
  }
  async setLocalFocus(e44) {
    this.view === `local` && (this.facility.setFocus(e44), await this.tweenLocal(e44, 1.8));
  }
  setLocalState(e44) {
    this.facility.setState(e44);
  }
  async exitFacility(e44 = 2.4) {
    if (this.view !== `local`) return;
    let t2 = this.facility.facility?.siteId;
    if (this.localTween?.kill(), await new Promise((e45) => {
      m_.to(this.localCam.position, { y: this.localCam.position.y + 120, duration: 0.9, ease: `power2.in`, onUpdate: () => this.localCam.lookAt(this.localControls.target), onComplete: () => e45() });
    }), await this.warp(), this.useLocal(false), t2) {
      let n2 = g_[t2];
      E_(n2.lat - 2, n2.lon, 1.3, this.camera.position), this.camera.lookAt(0, 0, 0), await this.flyTo(n2.lat - 6, n2.lon, e44, 1.8);
    }
  }
  project(e44) {
    let t2 = this.renderer.domElement.getBoundingClientRect(), n2 = null, r2 = this.camera, i2 = true;
    if (this.view === `local`) n2 = this.facility.anchor(e44 === `top` ? `top` : e44 === `building` ? `building` : `zone`), r2 = this.localCam;
    else {
      let t3 = this.beacons.get(e44);
      t3 && (n2 = t3.normal.clone().multiplyScalar(1.05), i2 = t3.normal.dot(this.camera.position.clone().normalize()) > 0.12);
    }
    if (!n2) return { x: 0, y: 0, visible: false };
    let a2 = n2.project(r2);
    return a2.z > 1 && (i2 = false), { x: t2.left + (a2.x + 1) / 2 * t2.width, y: t2.top + (1 - a2.y) / 2 * t2.height, visible: i2 };
  }
  onPointerMove(e44) {
    let t2 = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set((e44.clientX - t2.left) / t2.width * 2 - 1, -((e44.clientY - t2.top) / t2.height) * 2 + 1);
  }
  pick() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    let e44 = this.raycaster.intersectObjects([...this.beacons.values()].map((e45) => e45.hit), false), t2 = this.camera.position.clone().normalize(), n2 = e44.find((e45) => this.beacons.get(e45.object.userData.siteId).normal.dot(t2) > 0.1), r2 = n2 ? n2.object.userData.siteId : null;
    r2 !== this.hovered && (this.hovered = r2, this.renderer.domElement.style.cursor = r2 ? `pointer` : `grab`, this.onSiteHover(r2 ? g_[r2] : null));
  }
  resize() {
    let e44 = this.container.clientWidth, t2 = this.container.clientHeight;
    this.camera.aspect = e44 / t2, this.camera.updateProjectionMatrix(), this.renderer.setSize(e44, t2), this.composer.setSize(e44, t2), this.bloom.setSize(e44, t2), this.labelRenderer.setSize(e44, t2), this.localLabels.setSize(e44, t2), this.localCam.aspect = e44 / t2, this.localCam.updateProjectionMatrix(), this.applyOffset();
  }
  setCenter(e44, t2) {
    this.center = { x: e44, y: t2 };
    let n2 = this.container.clientWidth, r2 = this.container.clientHeight, i2 = Et.clamp(n2 / 2 - e44, -n2 * 0.2, n2 * 0.2), a2 = Et.clamp(r2 / 2 - t2, -r2 * 0.2, r2 * 0.2);
    this.offsetTween?.kill(), this.offsetTween = m_.to(this.offset, { x: i2, y: a2, duration: 0.6, ease: `power2.out`, onUpdate: () => this.applyOffset() });
  }
  applyOffset() {
    let e44 = this.container.clientWidth, t2 = this.container.clientHeight;
    for (let n2 of [this.camera, this.localCam]) n2 && (this.center && (Math.abs(this.offset.x) > 0.5 || Math.abs(this.offset.y) > 0.5) ? n2.setViewOffset(e44, t2, this.offset.x, this.offset.y, e44, t2) : n2.clearViewOffset());
  }
  start() {
    let e44 = () => {
      requestAnimationFrame(e44), this.frame();
    };
    e44();
  }
  frame() {
    let e44 = performance.now(), t2 = Math.min((e44 - this.last) / 1e3, 0.05);
    this.last = e44, this.elapsed += t2;
    let n2 = this.elapsed, r2 = this.layerState;
    this.dotsMat.uniforms.uTime.value = n2, this.streamsMat.uniforms.uTime.value = n2, this.streamsMat.uniforms.uReach.value = r2.reach, this.streamsMat.uniforms.uOpacity.value = r2.streams, this.streamsMat.uniforms.uSilo.value = r2.silo, this.beamMat.uniforms.uTime.value = n2;
    for (let e45 of this.fabricArcs) e45.mat.uniforms.uTime.value = n2, e45.mat.uniforms.uOpacity.value = 0.55 * r2.fabric;
    for (let e45 of this.blastArcs) e45.mat.uniforms.uTime.value = n2;
    let i2 = Et.clamp((this.camera.position.length() - 1.9) / 1.6, 0.18, 1);
    this.shellLines.material.opacity = 0.05 * r2.shell * i2, this.rings.forEach((e45, n3) => {
      e45.rotation.z += t2 * (0.03 + n3 * 0.015) * (n3 % 2 ? -1 : 1), e45.material.opacity = 0.35 * r2.shell * i2;
    }), this.shell.rotation.y += t2 * 0.01;
    let a2 = new G();
    for (let e45 of this.agents) {
      if (e45.mesh.visible = r2.shell > 0.05, e45.mesh.children[0].rotation.y += t2 * 2, e45.speed === 0) continue;
      e45.phase += t2 * e45.speed;
      let n3 = this.rings[e45.ring], i3 = H_ + e45.ring * 0.035;
      a2.set(Math.cos(e45.phase) * i3, Math.sin(e45.phase) * i3, 0).applyEuler(n3.rotation), e45.mesh.position.lerp(a2, Math.min(1, t2 * 4));
    }
    let o2 = this.camera.position.clone().normalize();
    this.beacons.forEach((e45) => {
      let r3 = e45.normal.dot(o2);
      e45.label.visible = r3 > 0.15, e45.label.element.style.opacity = String(Et.clamp((r3 - 0.15) * 4, 0, 1)), e45.spike.material.color.copy(e45.color), e45.head.material.color.copy(e45.color), e45.base.material.color.copy(e45.color);
      let i3 = e45.pulse.material;
      i3.color.copy(e45.color);
      let a3 = e45.state === `critical` ? 1.6 : e45.state === `warning` || e45.state === `signal` ? 1 : 0.45;
      e45.pulseT = (e45.pulseT + t2 * a3) % 1;
      let s2 = e45.state === `critical` ? 5 : e45.state === `idle` ? 2.2 : 3.5;
      e45.pulse.scale.setScalar(1 + e45.pulseT * s2), i3.opacity = (1 - e45.pulseT) * (e45.state === `idle` ? 0.35 : 0.9);
      let c2 = e45.state === `signal` ? 0.6 + 0.4 * Math.sin(n2 * 18) : 1, l2 = e45.site.hub ? 0.055 : 0.03;
      e45.head.scale.setScalar(l2 * (e45.state === `critical` ? 1.4 + 0.25 * Math.sin(n2 * 10) : 1) * c2), e45.shield.visible && (e45.shield.rotation.y += t2 * 0.6);
    });
    for (let e45 = this.flashes.length - 1; e45 >= 0; e45--) {
      let n3 = this.flashes[e45];
      n3.t += t2;
      let r3 = n3.t / 1.4;
      n3.sprite.scale.setScalar(0.02 + r3 * 0.12), n3.sprite.material.opacity = Math.max(0, 1 - r3), r3 >= 1 && (this.globe.remove(n3.sprite), n3.sprite.material.dispose(), this.flashes.splice(e45, 1));
    }
    if (this.view === `local`) this.facility.update(t2), this.localTween?.isActive() || this.localControls.update(), this.facility.raycast.setFromCamera(this.pointer, this.localCam), this.facility.hover(this.facility.raycast), this.composer.render(), this.localLabels.render(this.facility.scene, this.localCam);
    else {
      if (this.idleSpin && !this.camTween?.isActive()) {
        let e45 = D_(this.camera.position);
        E_(e45.lat, e45.lon + t2 * 3, e45.r, this.camera.position), this.camera.lookAt(0, 0, 0);
      }
      this.camTween?.isActive() || this.controls.update(), this.pick(), this.composer.render(), this.labelRenderer.render(this.scene, this.camera);
    }
  }
}, J_ = (e44) => {
  let t2 = Math.sin(e44 * 127.1 + 311.7) * 43758.5453;
  return t2 - Math.floor(t2);
}, Y_ = (e44, t2, n2) => {
  let r2 = Math.min(1, Math.max(0, (n2 - e44) / (t2 - e44)));
  return r2 * r2 * (3 - 2 * r2);
}, X_ = class {
  scenario = null;
  t = 0;
  view = `compare`;
  tween = null;
  listeners = /* @__PURE__ */ new Set();
  viewListeners = /* @__PURE__ */ new Set();
  load(e44) {
    this.stop(), this.scenario = e44, this.t = e44.range[0], this.emit();
  }
  onChange(e44) {
    this.listeners.add(e44);
  }
  onView(e44) {
    this.viewListeners.add(e44);
  }
  setView(e44) {
    this.view = e44, this.viewListeners.forEach((t2) => t2(e44)), this.emit();
  }
  emit() {
    this.listeners.forEach((e44) => e44(this.t));
  }
  scrub(e44) {
    if (!this.scenario) return;
    this.stop();
    let [t2, n2] = this.scenario.range;
    this.t = Math.min(n2, Math.max(t2, e44)), this.emit();
  }
  playTo(e44, t2) {
    return this.stop(), new Promise((n2) => {
      let r2 = { t: this.t };
      this.tween = m_.to(r2, { t: e44, duration: Math.max(0.1, t2), ease: `none`, onUpdate: () => {
        this.t = r2.t, this.emit();
      }, onComplete: () => {
        this.tween = null, n2();
      }, onInterrupt: () => n2() });
    });
  }
  get playing() {
    return !!this.tween && this.tween.isActive();
  }
  get hasTween() {
    return !!this.tween;
  }
  pause() {
    this.tween?.pause();
  }
  resume() {
    this.tween?.resume();
  }
  stop() {
    if (this.tween) {
      let e44 = this.tween;
      this.tween = null, e44.kill();
      let t2 = e44.vars.onInterrupt;
      t2?.();
    }
  }
  metric(e44, t2) {
    let n2 = this.scenario, r2 = (J_(Math.floor(t2 * 4)) - 0.5) * 1.6;
    if (e44 === `traditional`) {
      let e45 = n2.tradRecover - n2.impact, i3 = n2.impact + Math.max(e45 * 0.08, 0.01), a3 = n2.tradDetect + (n2.tradRecover - n2.tradDetect) * 0.45, o3 = 0;
      return t2 >= n2.impact && t2 < i3 ? o3 = Y_(n2.impact, i3, t2) : t2 >= i3 && t2 < a3 ? o3 = 1 : t2 >= a3 && t2 < n2.tradRecover && (o3 = 1 - Y_(a3, n2.tradRecover, t2)), 100 - Y_(n2.agentDetect, n2.impact, t2) * 4 * (t2 < n2.impact) - o3 * n2.tradDip * 100 + r2;
    }
    let i2 = (n2.agentDetect + n2.agentRemediate) / 2, a2 = Math.max(0.01, (n2.agentRemediate - n2.agentDetect) / 2), o2 = Math.max(0, 1 - Math.abs(t2 - i2) / a2), s2 = t2 < n2.agentDetect ? Y_(n2.agentDetect - (n2.agentDetect - n2.range[0]) * 0.5, n2.agentDetect, t2) * 3 : 0, c2 = t2 > n2.agentRemediate ? Y_(n2.agentRemediate, n2.range[1], t2) * 2 : 0;
    return 100 - s2 - o2 * n2.agentDip * 100 + c2 + r2 * 0.6;
  }
  forecast(e44) {
    return e44 < this.scenario.agentDetect ? null : this.metric(`traditional`, e44);
  }
  siteState(e44, t2) {
    let n2 = this.scenario;
    return e44 === `traditional` ? t2 < n2.agentDetect ? `idle` : t2 < n2.impact ? `signal` : t2 < n2.tradDetect + (n2.tradRecover - n2.tradDetect) * 0.6 ? `critical` : t2 < n2.tradRecover ? `recovering` : `idle` : t2 < n2.agentDetect ? `idle` : t2 < n2.agentRemediate ? `warning` : `protected`;
  }
  events(e44, t2) {
    return this.scenario.events.filter((n2) => n2.branch === e44 && n2.t <= t2).sort((e45, t3) => e45.t - t3.t);
  }
  exposureAt(e44) {
    let t2 = this.scenario, n2 = Y_(t2.impact, t2.tradRecover, e44);
    return t2.exposure * n2;
  }
  format(e44) {
    let t2 = this.scenario;
    if (!t2) return `T-00h 00m`;
    let n2 = t2.unit === `h` ? e44 * 60 : e44, r2 = n2 < 0 ? `-` : `+`, i2 = Math.abs(Math.round(n2)), a2 = Math.floor(i2 / 60), o2 = i2 % 60;
    return `T${r2}${String(a2).padStart(2, `0`)}h ${String(o2).padStart(2, `0`)}m`;
  }
  formatLead() {
    let e44 = this.scenario, t2 = e44.impact - e44.agentDetect;
    return e44.unit === `h` ? `${t2} hours` : `${t2} minutes`;
  }
}, Z_ = { base: `audio`, voices: JSON.parse(`{"heart":["0184d0b3","0226a789","03022e1b","0329bdda","03584788","04110b53","06e85c57","080fc544","08d20fd7","094de920","09f40a1a","0c9241f8","0ce68555","0d7c6621","0e2865c8","0e45686c","0ecde47d","0f2501e9","0fa88e3f","105e5a0b","10625f39","108b8f3b","10bb2587","1127cb67","11497398","11f1e36e","1231d5f2","124b4367","124e0d37","1314214c","14843736","165 ...[TRUNC 15625]
function Q_(e44) {
  let t2 = e44.replace(/\s+/g, ` `).trim();
  return t2 ? t2.split(/(?<=[.!?]["')\]]?)\s+(?=["'(A-Z0-9])/).map((e45) => e45.trim()).filter(Boolean) : [];
}
function $_(e44) {
  let t2 = e44.replace(/\s+/g, ` `).trim(), n2 = 2166136261;
  for (let e45 = 0; e45 < t2.length; e45++) n2 ^= t2.charCodeAt(e45), n2 = Math.imul(n2, 16777619);
  return (n2 >>> 0).toString(16).padStart(8, `0`);
}
var ev = [{ id: `heart`, label: `Heart`, detail: `US English, warm presenter` }, { id: `michael`, label: `Michael`, detail: `US English, steady narrator` }, { id: `emma`, label: `Emma`, detail: `British English, crisp` }, { id: `george`, label: `George`, detail: `British English, documentary` }], tv = /(natural|neural|premium|enhanced|online|google|siri)/i, nv = `metlife-agenticops-voice`, rv = class {
  enabled = true;
  rate = 1;
  voiceId = `studio:heart`;
  synth = typeof window < `u` && `speechSynthesis` in window ? window.speechSynthesis : null;
  deviceVoices = [];
  studio = /* @__PURE__ */ new Map();
  base = Z_.base;
  sentences = [];
  idx = 0;
  token = 0;
  paused = false;
  resolveFn = null;
  timer = null;
  audio = typeof Audio < `u` ? new Audio() : null;
  mode = `timer`;
  sentenceStart = 0;
  sentenceDur = 1;
  elapsedBeforePause = 0;
  blocked = false;
  onCaption = () => {
  };
  onSpeaking = () => {
  };
  onSentence = () => {
  };
  onState = () => {
  };
  onVoicesChanged = () => {
  };
  onBlocked = () => {
  };
  constructor() {
    for (let [e44, t2] of Object.entries(Z_.voices)) this.studio.set(e44, new Set(t2));
    if (this.synth) {
      let e44 = () => {
        this.deviceVoices = this.synth.getVoices().filter((e45) => /^en/i.test(e45.lang)), this.onVoicesChanged();
      };
      e44(), this.synth.addEventListener?.(`voiceschanged`, e44);
    }
    try {
      let e44 = JSON.parse(localStorage.getItem(nv) ?? `null`);
      e44?.voiceId && (this.voiceId = e44.voiceId), e44?.rate && (this.rate = e44.rate);
    } catch {
    }
    !this.studioAvailable && this.voiceId.startsWith(`studio:`) && (this.voiceId = `auto`), this.audio && (this.audio.preload = `auto`);
  }
  get studioAvailable() {
    return [...this.studio.values()].some((e44) => e44.size > 0);
  }
  voices() {
    let e44 = [];
    for (let t3 of ev) this.studio.get(t3.id)?.size && e44.push({ id: `studio:${t3.id}`, label: t3.label, detail: `${t3.detail}. Studio neural voice.`, kind: `studio`, premium: true });
    let t2 = [...this.deviceVoices].sort((e45, t3) => Number(tv.test(t3.name)) - Number(tv.test(e45.name)));
    for (let n2 of t2) e44.push({ id: `device:${n2.voiceURI}`, label: n2.name.replace(/^Microsoft /, ``).replace(/ - English.*$/, ``), detail: `${n2.lang}${n2.localService ? `, on this device` : `, cloud`}`, kind: `device`, premium: tv.test(n2.name), device: n2 });
    return e44;
  }
  get currentVoice() {
    return this.voices().find((e44) => e44.id === this.resolvedVoiceId()) ?? null;
  }
  resolvedVoiceId() {
    if (this.voiceId !== `auto`) return this.voiceId;
    let e44 = this.voices();
    return (e44.find((e45) => e45.kind === `studio`) ?? e44.find((e45) => e45.premium) ?? e44[0])?.id ?? ``;
  }
  setVoice(e44) {
    this.voiceId = e44, this.persist(), this.onState(), this.resolveFn && !this.paused && this.restartSentence();
  }
  setRate(e44) {
    this.rate = e44, this.audio && (this.audio.playbackRate = e44), this.persist(), this.onState();
  }
  persist() {
    try {
      localStorage.setItem(nv, JSON.stringify({ voiceId: this.voiceId, rate: this.rate }));
    } catch {
    }
  }
  estimate(e44) {
    return e44.split(/\s+/).length / 2.6 / this.rate + 0.5;
  }
  get active() {
    return !!this.resolveFn;
  }
  get isPaused() {
    return this.paused;
  }
  get index() {
    return this.idx;
  }
  get total() {
    return this.sentences.length;
  }
  get lines() {
    return this.sentences;
  }
  get sentenceProgress() {
    if (!this.resolveFn) return 0;
    if (this.mode === `audio` && this.audio && this.audio.duration > 0) return Math.min(1, this.audio.currentTime / this.audio.duration);
    let e44 = this.paused ? this.elapsedBeforePause : this.elapsedBeforePause + (performance.now() - this.sentenceStart) / 1e3;
    return Math.min(1, e44 / this.sentenceDur);
  }
  speak(e44) {
    this.cancel();
    let t2 = ++this.token;
    return this.sentences = Q_(e44), this.idx = 0, this.paused = false, this.sentences.length ? new Promise((e45) => {
      this.resolveFn = e45, this.play(t2), this.onState();
    }) : Promise.resolve(true);
  }
  stopOutput() {
    this.timer && clearTimeout(this.timer), this.timer = null, this.audio && (this.audio.onended = null, this.audio.onerror = null, this.audio.pause()), this.synth?.cancel();
  }
  play(e44) {
    if (e44 !== this.token || this.paused) return;
    if (this.stopOutput(), this.idx >= this.sentences.length) {
      this.onCaption(null), this.onSpeaking(false);
      let e45 = this.resolveFn;
      this.resolveFn = null, this.onState(), e45?.(true);
      return;
    }
    let t2 = this.sentences[this.idx];
    this.onCaption(t2), this.onSentence(this.idx, this.sentences.length), this.onState(), this.elapsedBeforePause = 0, this.sentenceStart = performance.now(), this.sentenceDur = this.estimate(t2);
    let n2 = () => {
      e44 !== this.token || this.paused || (this.idx++, this.play(e44));
    }, r2 = this.resolvedVoiceId(), i2 = $_(t2), a2 = r2.startsWith(`studio:`) ? r2.slice(7) : null;
    if (this.enabled && a2 && this.studio.get(a2)?.has(i2) && this.audio && !this.blocked) {
      this.mode = `audio`;
      let t3 = this.audio;
      t3.src = `${this.base}/${a2}/${i2}.mp3`, t3.playbackRate = this.rate, t3.onended = () => n2(), t3.onerror = () => {
        e44 === this.token && (this.studio.get(a2)?.delete(i2), this.restartSentence());
      }, this.onSpeaking(true), t3.play().catch((t4) => {
        e44 === this.token && (t4?.name === `NotAllowedError` && (this.blocked = true, this.onBlocked()), this.fallbackTimer(e44, n2));
      }), this.prefetch(a2);
      return;
    }
    let o2 = r2.startsWith(`device:`) ? this.deviceVoices.find((e45) => `device:${e45.voiceURI}` === r2) : this.deviceVoices.find((e45) => tv.test(e45.name)) ?? this.deviceVoices[0];
    if (this.enabled && this.synth && (o2 || !a2)) {
      this.mode = `speech`;
      let r3 = new SpeechSynthesisUtterance(t2);
      o2 && (r3.voice = o2), r3.rate = this.rate;
      let i3 = false, a3 = () => {
        i3 || (i3 = true, n2());
      };
      r3.onend = a3, r3.onerror = (e45) => {
        e45.error !== `interrupted` && e45.error !== `canceled` && a3();
      }, this.timer = window.setTimeout(a3, this.sentenceDur * 1e3 * 1.8 + 2500), this.onSpeaking(true), setTimeout(() => {
        e44 === this.token && !this.paused && this.synth.speak(r3);
      }, 40);
    } else this.fallbackTimer(e44, n2);
  }
  fallbackTimer(e44, t2) {
    if (e44 !== this.token) return;
    this.mode = `timer`, this.onSpeaking(false);
    let n2 = Math.max(0.3, this.sentenceDur - this.elapsedBeforePause);
    this.sentenceStart = performance.now(), this.timer = window.setTimeout(t2, n2 * 1e3);
  }
  prefetch(e44) {
    let t2 = this.sentences[this.idx + 1];
    if (!t2) return;
    let n2 = $_(t2);
    if (!this.studio.get(e44)?.has(n2)) return;
    let r2 = new Audio();
    r2.preload = `auto`, r2.src = `${this.base}/${e44}/${n2}.mp3`;
  }
  unblock() {
    this.blocked && (this.blocked = false, this.resolveFn && !this.paused && this.mode === `timer` && this.restartSentence());
  }
  restartSentence() {
    this.token++, this.play(this.token);
  }
  pause() {
    !this.paused && this.resolveFn && (this.paused = true, this.elapsedBeforePause += (performance.now() - this.sentenceStart) / 1e3, this.timer && clearTimeout(this.timer), this.mode === `audio` ? this.audio?.pause() : this.synth?.cancel(), this.onSpeaking(false), this.onState());
  }
  resume() {
    if (this.paused) {
      if (this.paused = false, this.mode === `audio` && this.audio && this.audio.src && !this.audio.ended) {
        let e44 = this.token;
        this.onSpeaking(true), this.audio.play().catch(() => this.fallbackTimer(e44, () => {
          e44 === this.token && (this.idx++, this.play(e44));
        }));
      } else if (this.mode === `timer`) {
        let e44 = this.token;
        this.sentenceStart = performance.now(), this.timer = window.setTimeout(() => {
          e44 !== this.token || this.paused || (this.idx++, this.play(e44));
        }, Math.max(0.2, this.sentenceDur - this.elapsedBeforePause) * 1e3);
      } else this.restartSentence();
      this.onState();
    }
  }
  toggle() {
    this.paused ? this.resume() : this.pause();
  }
  seek(e44) {
    return !this.resolveFn || (e44 < 0 && (e44 = 0), e44 >= this.sentences.length) ? false : (this.idx = e44, this.paused = false, this.token++, this.play(this.token), true);
  }
  skip(e44) {
    return this.seek(this.idx + e44);
  }
  cancel() {
    this.token++, this.paused = false, this.stopOutput(), this.onCaption(null), this.onSpeaking(false);
    let e44 = this.resolveFn;
    this.resolveFn = null, this.onState(), e44?.(false);
  }
  setEnabled(e44) {
    this.enabled = e44, this.resolveFn && !this.paused && this.restartSentence(), this.onState();
  }
  preview(e44, t2) {
    let n2 = e44.startsWith(`studio:`) ? e44.slice(7) : null, r2 = $_(t2);
    if (n2 && this.studio.get(n2)?.has(r2)) {
      let e45 = new Audio(`${this.base}/${n2}/${r2}.mp3`);
      e45.playbackRate = this.rate, e45.play().catch(() => void 0);
      return;
    }
    let i2 = this.deviceVoices.find((t3) => `device:${t3.voiceURI}` === e44);
    if (this.synth && i2) {
      let e45 = new SpeechSynthesisUtterance(t2);
      e45.voice = i2, e45.rate = this.rate, this.synth.speak(e45);
    }
  }
}, iv = `Welcome to the MetLife and Cisco Cloud Control experience.`, av = [{ title: `A global promise`, short: `Promise`, text: `MetLife has been a trusted source of financial security since 1868. Today it serves customers in more than forty markets, from group benefits for most of the Fortune 500 to retirement income, asset management, and fast-growing markets like Mexico, Brazil and India.`, ca ...[TRUNC 76885]
  s;
  onChange = () => {
  };
  onBadge = () => {
  };
  constructor() {
    this.s = { value: 0, xp: 0, badges: [], missions: {}, compared: [], quizzes: {} };
    try {
      let e44 = localStorage.getItem(dv);
      e44 && (this.s = { ...this.s, ...JSON.parse(e44) });
    } catch {
    }
  }
  save() {
    try {
      localStorage.setItem(dv, JSON.stringify(this.s));
    } catch {
    }
    this.onChange();
  }
  reset() {
    this.s = { value: 0, xp: 0, badges: [], missions: {}, compared: [], quizzes: {} }, this.save();
  }
  complete(e44, t2) {
    let n2 = Math.round(e44.exposure * fv[t2]), r2 = pv[t2], i2 = this.s.missions[e44.id];
    return (!i2 || n2 > i2.value) && (this.s.value += n2 - (i2?.value ?? 0), this.s.missions[e44.id] = { quality: t2, value: n2 }), this.s.xp += r2, this.checkBadges(), this.save(), { value: n2, xp: r2 };
  }
  compare(e44) {
    this.s.compared.includes(e44) || (this.s.compared.push(e44), this.s.xp += 20, this.checkBadges(), this.save());
  }
  quiz(e44, t2, n2) {
    let r2 = Math.round(t2 / n2 * 100);
    this.s.quizzes[e44] = Math.max(this.s.quizzes[e44] ?? 0, r2), this.s.xp += t2 * 30, this.checkBadges(), this.save();
  }
  award(e44) {
    if (this.s.badges.includes(e44)) return;
    this.s.badges.push(e44);
    let t2 = cv.find((t3) => t3.id === e44);
    t2 && this.onBadge(t2);
  }
  checkBadges() {
    let e44 = this.s.missions, t2 = (t3) => t3.every((t4) => e44[t4]);
    Object.values(e44).some((e45) => e45.value > 0) && this.award(`first-save`), Object.values(e44).filter((e45) => e45.quality === `best`).length >= 3 && this.award(`perfect-call`);
    for (let e45 of [`Americas`, `Asia`, `EMEA`]) t2(lv.filter((t3) => t3.region === e45).map((e46) => e46.id)) && this.award(e45.toLowerCase());
    Object.values(this.s.quizzes).filter((e45) => e45 === 100).length >= 3 && this.award(`scholar`), this.s.compared.length >= 5 && this.award(`time-traveler`), t2(lv.map((e45) => e45.id)) && this.award(`architect`);
  }
  rank() {
    let e44 = 0;
    for (; e44 + 1 < sv.length && this.s.xp >= sv[e44 + 1].xp; ) e44++;
    let t2 = sv[e44], n2 = sv[e44 + 1];
    return { name: t2.name, progress: n2 ? (this.s.xp - t2.xp) / (n2.xp - t2.xp) : 1, next: n2?.xp ?? null };
  }
};
function hv(e44) {
  return e44 >= 1e9 ? `$${(e44 / 1e9).toFixed(2)}B` : e44 >= 1e6 ? `$${(e44 / 1e6).toFixed(1)}M` : e44 >= 1e3 ? `$${Math.round(e44 / 1e3)}K` : `$${Math.round(e44)}`;
}
var gv = class {
  ctx = null;
  master = null;
  ambient = null;
  ambientOn = false;
  duck = 1;
  init() {
    if (this.ctx) {
      this.ctx.resume();
      return;
    }
    let e44 = window.AudioContext || window.webkitAudioContext;
    if (!e44) return;
    this.ctx = new e44(), this.master = this.ctx.createGain(), this.master.gain.value = 0.9, this.master.connect(this.ctx.destination), this.ambient = this.ctx.createGain(), this.ambient.gain.value = 0;
    let t2 = this.ctx.createBiquadFilter();
    t2.type = `lowpass`, t2.frequency.value = 520, t2.Q.value = 0.7, this.ambient.connect(t2).connect(this.master);
    let n2 = this.ctx.createOscillator(), r2 = this.ctx.createGain();
    n2.frequency.value = 0.05, r2.gain.value = 260, n2.connect(r2).connect(t2.frequency), n2.start();
    for (let [e45, t3, n3] of [[73.42, `sine`, 0.5], [110, `triangle`, 0.18], [146.83, `sine`, 0.22], [164.81, `sine`, 0.12], [220, `sine`, 0.08]]) for (let r3 of [-6, 6]) {
      let i2 = this.ctx.createOscillator();
      i2.type = t3, i2.frequency.value = e45, i2.detune.value = r3;
      let a2 = this.ctx.createGain();
      a2.gain.value = n3 * 0.5, i2.connect(a2).connect(this.ambient), i2.start();
    }
    this.applyAmbient();
  }
  applyAmbient() {
    if (!this.ctx || !this.ambient) return;
    let e44 = this.ambientOn ? 0.05 * this.duck : 0;
    this.ambient.gain.setTargetAtTime(e44, this.ctx.currentTime, 0.8);
  }
  setAmbient(e44) {
    this.ambientOn = e44, this.applyAmbient();
  }
  setDucked(e44) {
    this.duck = e44 ? 0.45 : 1, this.applyAmbient();
  }
  cue(e44) {
    let t2 = this.ctx;
    if (!t2 || !this.master) return;
    let n2 = t2.currentTime, r2 = (e45, r3, i2, a2 = `sine`, o2 = 0.08) => {
      let s2 = t2.createOscillator(), c2 = t2.createGain();
      s2.type = a2, s2.frequency.setValueAtTime(e45, n2 + r3), c2.gain.setValueAtTime(0, n2 + r3), c2.gain.linearRampToValueAtTime(o2, n2 + r3 + 0.015), c2.gain.exponentialRampToValueAtTime(1e-4, n2 + r3 + i2), s2.connect(c2).connect(this.master), s2.start(n2 + r3), s2.stop(n2 + r3 + i2 + 0.05);
    };
    switch (e44) {
      case `info`:
        r2(880, 0, 0.18, `sine`, 0.04);
        break;
      case `select`:
        r2(660, 0, 0.12, `triangle`, 0.05), r2(990, 0.06, 0.14, `sine`, 0.04);
        break;
      case `warn`:
        r2(587, 0, 0.22, `triangle`, 0.06), r2(466, 0.18, 0.3, `triangle`, 0.06);
        break;
      case `crit`:
        r2(196, 0, 0.5, `sawtooth`, 0.05), r2(185, 0.25, 0.6, `sawtooth`, 0.05);
        break;
      case `good`:
        r2(523, 0, 0.3, `sine`, 0.06), r2(659, 0.1, 0.3, `sine`, 0.06), r2(784, 0.2, 0.5, `sine`, 0.06);
        break;
      case `badge`:
        [523, 659, 784, 1046].forEach((e45, t3) => r2(e45, t3 * 0.09, 0.45, `triangle`, 0.06));
    }
  }
}, _v = { trad: `#ff4d5e`, agent: `#6ff09a`, forecast: `#ffc14d`, grid: `rgba(120,170,255,0.10)`, text: `rgba(200,220,255,0.72)`, lead: `rgba(63,182,255,0.10)`, outage: `rgba(255,77,94,0.10)` }, vv = [{ id: `te`, label: `ThousandEyes, network`, color: `#38c6f4`, panel: `path` }, { id: `splunk`, label: `Splunk Data Fabric`, color: `#f99d1c`, panel: `splunk` }, { id: `cc`, label: `Cloud Control agents`, color: `#5191f0`, panel: `canvas` }, { id: `xdr`, label: `Security, XDR`, color: `#ff6a8a`, panel: `xdr` }, { id: `biz`, label: `People and business`, color: `#a4ce4e`, panel: `impact` }];
function yv(e44) {
  return /XDR|SOAR|Email Security|SOC|Security Agent|Incident response|Duo|Firewall/i.test(e44) ? `xdr` : /Agent|AI Canvas|Cloud Control/i.test(e44) ? `cc` : /Data Fabric|Splunk|Monitoring|Siloed|Scheduler|Market data|File servers|Employee portal|Policy admin/i.test(e44) ? `splunk` : /ThousandEyes|Network|SD-WAN|Nexus|NOC|site|Facilities|Engineering/i.test(e44) ? `te` : `biz`;
}
var bv = class {
  canvas;
  tl;
  ctx;
  dragging = false;
  pad = { l: 132, r: 12, t: 14, b: 15 };
  hits = [];
  hoverE = null;
  onScrub = () => {
  };
  onEvent = () => {
  };
  onHover = () => {
  };
  constructor(e44, t2) {
    this.canvas = e44, this.tl = t2, this.ctx = e44.getContext(`2d`), new ResizeObserver(() => this.draw()).observe(e44), e44.addEventListener(`pointerdown`, (t3) => {
      if (!this.tl.scenario) return;
      let n2 = this.hitAt(t3.offsetX, t3.offsetY);
      n2 ? this.onEvent(n2.e) : t3.offsetX < this.pad.l - 4 || (this.dragging = true, e44.setPointerCapture(t3.pointerId), this.onScrub(this.xToT(t3.offsetX)));
    }), e44.addEventListener(`pointermove`, (t3) => {
      if (this.dragging) return this.onScrub(this.xToT(t3.offsetX));
      let n2 = this.tl.scenario ? this.hitAt(t3.offsetX, t3.offsetY) : null;
      if (e44.style.cursor = n2 ? `pointer` : t3.offsetX > this.pad.l ? `ew-resize` : `default`, (n2?.e ?? null) !== this.hoverE) {
        this.hoverE = n2?.e ?? null;
        let t4 = e44.getBoundingClientRect();
        this.onHover(this.hoverE, t4.left + (n2?.x ?? 0), t4.top + (n2?.y ?? 0)), this.draw();
      }
    }), e44.addEventListener(`pointerleave`, () => {
      this.hoverE && (this.hoverE = null, this.onHover(null, 0, 0), this.draw());
    }), e44.addEventListener(`pointerup`, () => this.dragging = false), e44.addEventListener(`pointercancel`, () => this.dragging = false);
  }
  hitAt(e44, t2) {
    let n2 = null, r2 = 64;
    for (let i2 of this.hits) {
      let a2 = (i2.x - e44) ** 2 + (i2.y - t2) ** 2;
      a2 < r2 && (r2 = a2, n2 = i2);
    }
    return n2;
  }
  get w() {
    return this.canvas.clientWidth;
  }
  get h() {
    return this.canvas.clientHeight;
  }
  get metricBottom() {
    return Math.round(this.pad.t + (this.h - this.pad.t - this.pad.b) * 0.4);
  }
  get laneTop() {
    return this.metricBottom + 5;
  }
  get laneH() {
    return (this.h - this.pad.b - this.laneTop) / vv.length;
  }
  tToX(e44) {
    let [t2, n2] = this.tl.scenario.range;
    return this.pad.l + (e44 - t2) / (n2 - t2) * (this.w - this.pad.l - this.pad.r);
  }
  xToT(e44) {
    let [t2, n2] = this.tl.scenario.range, r2 = (e44 - this.pad.l) / (this.w - this.pad.l - this.pad.r);
    return t2 + Math.min(1, Math.max(0, r2)) * (n2 - t2);
  }
  vToY(e44) {
    return this.pad.t + (1 - (e44 - 0) / 110) * (this.metricBottom - this.pad.t);
  }
  draw() {
    let e44 = Math.min(window.devicePixelRatio || 1, 2), t2 = this.w, n2 = this.h;
    (this.canvas.width !== Math.round(t2 * e44) || this.canvas.height !== Math.round(n2 * e44)) && (this.canvas.width = Math.round(t2 * e44), this.canvas.height = Math.round(n2 * e44));
    let r2 = this.ctx;
    r2.setTransform(e44, 0, 0, e44, 0, 0), r2.clearRect(0, 0, t2, n2), this.hits = [];
    let i2 = this.tl.scenario;
    if (!i2) return;
    let [a2, o2] = i2.range, s2 = this.tl.t, c2 = this.tl.view, l2 = c2 !== `agentic`, u2 = c2 !== `traditional`, d2 = this.metricBottom, f2 = n2 - this.pad.b;
    r2.font = `10.5px Inter, system-ui, sans-serif`, r2.textBaseline = `middle`, u2 && s2 >= i2.agentDetect && (r2.fillStyle = _v.lead, r2.fillRect(this.tToX(i2.agentDetect), this.pad.t, this.tToX(Math.min(s2, i2.impact)) - this.tToX(i2.agentDetect), f2 - this.pad.t)), l2 && s2 >= i2.impact && (r2.fillStyle = _v.outage, r2.fillRect(this.tToX(i2.impact), this.pad.t, this.tToX(Math.min(s2, i2.tradRecover)) - this.tToX(i2.impact), f2 - this.pad.t)), r2.fillStyle = _v.text, r2.textAlign = `left`, r2.font = `600 10px Inter, system-ui, sans-serif`, r2.fillText(`BUSINESS KPI`, 10, this.pad.t + 2), r2.font = `9.5px Inter, system-ui, sans-serif`, r2.fillStyle = `rgba(200,220,255,0.5)`;
    let p2 = i2.metricName.length > 22 ? `${i2.metricName.slice(0, 21)}\u2026` : i2.metricName;
    d2 - this.pad.t > 24 && r2.fillText(p2, 10, this.pad.t + 15), r2.strokeStyle = _v.grid, r2.lineWidth = 1;
    for (let e45 of [0, 50, 100]) {
      let n3 = this.vToY(e45);
      r2.beginPath(), r2.moveTo(this.pad.l, n3), r2.lineTo(t2 - this.pad.r, n3), r2.stroke(), r2.textAlign = `right`, r2.fillStyle = _v.text, r2.fillText(String(e45), this.pad.l - 6, n3);
    }
    let m2 = xv((o2 - a2) / 10);
    r2.textAlign = `center`;
    for (let e45 = Math.ceil(a2 / m2) * m2; e45 <= o2; e45 += m2) {
      let t3 = this.tToX(e45);
      r2.beginPath(), r2.moveTo(t3, this.pad.t), r2.lineTo(t3, f2), r2.stroke(), r2.fillStyle = _v.text, r2.fillText(`${e45 > 0 ? `+` : ``}${e45}${i2.unit}`, t3, f2 + 10);
    }
    let h2 = this.laneH;
    vv.forEach((e45, n3) => {
      let i3 = this.laneTop + n3 * h2;
      r2.fillStyle = n3 % 2 ? `rgba(255,255,255,0.018)` : `rgba(255,255,255,0.035)`, r2.fillRect(this.pad.l, i3, t2 - this.pad.l - this.pad.r, h2 - 1), r2.fillStyle = e45.color, r2.beginPath(), r2.arc(14, i3 + h2 / 2, 3.2, 0, Math.PI * 2), r2.fill(), r2.fillStyle = `rgba(220,232,255,0.82)`, r2.textAlign = `left`, r2.font = `${Math.min(10.5, Math.max(8.5, h2 - 2))}px Inter, system-ui, sans-serif`, r2.fillText(e45.label, 24, i3 + h2 / 2);
    });
    let g2 = this.tToX(i2.impact);
    r2.strokeStyle = `rgba(255,255,255,0.45)`, r2.setLineDash([3, 4]), r2.beginPath(), r2.moveTo(g2, this.pad.t - 6), r2.lineTo(g2, f2), r2.stroke(), r2.setLineDash([]), r2.fillStyle = `rgba(255,255,255,0.8)`, r2.textAlign = `left`, r2.fillText(`T-0  business moment`, g2 + 6, this.pad.t - 8);
    let _2 = (e45, t3, n3, i3 = [], c3 = 0) => {
      r2.save(), r2.strokeStyle = t3, r2.lineWidth = n3, r2.setLineDash(i3), r2.shadowColor = t3, r2.shadowBlur = c3, r2.beginPath();
      let l3 = false, u3 = Math.min(s2, o2);
      for (let t4 = 0; t4 <= 260; t4++) {
        let n4 = a2 + t4 / 260 * (o2 - a2);
        if (n4 > u3) break;
        let i4 = e45(n4);
        if (i4 === null) {
          l3 = false;
          continue;
        }
        let s3 = this.tToX(n4), c4 = this.vToY(i4);
        l3 ? r2.lineTo(s3, c4) : (r2.moveTo(s3, c4), l3 = true);
      }
      r2.stroke(), r2.restore();
    };
    c2 === `agentic` && _2((e45) => this.tl.forecast(e45), _v.forecast, 1.4, [4, 4]), l2 && _2((e45) => this.tl.metric(`traditional`, e45), _v.trad, c2 === `compare` ? 1.8 : 2.4, [], 8), u2 && _2((e45) => this.tl.metric(`agentic`, e45), _v.agent, c2 === `compare` ? 1.8 : 2.4, [], 8);
    for (let e45 of i2.events) {
      if (e45.branch === `traditional` && !l2 || e45.branch === `agentic` && !u2) continue;
      let t3 = vv.findIndex((t4) => t4.id === yv(e45.source)), n3 = this.laneTop + t3 * h2 + h2 / 2 + (c2 === `compare` ? e45.branch === `agentic` ? -h2 * 0.2 : h2 * 0.2 : 0), i3 = this.tToX(e45.t), a3 = e45.t <= s2, o3 = e45.branch === `agentic` ? _v.agent : _v.trad, d3 = this.hoverE === e45, f3 = d3 ? 6 : 4.2;
      r2.save(), r2.fillStyle = a3 ? o3 : `rgba(255,255,255,0.16)`, a3 && (r2.shadowColor = o3, r2.shadowBlur = d3 ? 14 : 6), r2.beginPath(), e45.branch === `agentic` ? (r2.moveTo(i3, n3 - f3), r2.lineTo(i3 + f3, n3), r2.lineTo(i3, n3 + f3), r2.lineTo(i3 - f3, n3), r2.closePath()) : r2.arc(i3, n3, f3 * 0.85, 0, Math.PI * 2), r2.fill(), e45.sev === `crit` && a3 && (r2.strokeStyle = `#fff`, r2.lineWidth = 1, r2.stroke()), r2.restore(), this.hits.push({ e: e45, x: i3, y: n3 });
    }
    let v2 = this.tToX(s2);
    if (r2.strokeStyle = `#ffffff`, r2.lineWidth = 1.5, r2.shadowColor = `#7fe7ff`, r2.shadowBlur = 10, r2.beginPath(), r2.moveTo(v2, this.pad.t - 4), r2.lineTo(v2, f2), r2.stroke(), r2.shadowBlur = 0, r2.fillStyle = `#ffffff`, r2.beginPath(), r2.arc(v2, d2, 3.5, 0, Math.PI * 2), r2.fill(), u2 && s2 >= i2.agentDetect) {
      let e45 = this.tToX(i2.agentDetect);
      r2.fillStyle = `#7fe7ff`, r2.textAlign = `left`, r2.fillText(`Agent lead time: ${this.tl.formatLead()}`, e45 + 6, d2 - 8);
    }
  }
};
function xv(e44) {
  return [1, 2, 4, 6, 8, 10, 12, 15, 20, 24, 30, 48, 60].find((t2) => t2 >= e44) ?? 60;
}
var Q = (e44) => {
  let t2 = document.querySelector(e44);
  if (!t2) throw Error(`Missing element ${e44}`);
  return t2;
}, Sv = (e44, t2 = ``) => {
  let n2 = document.createElement(e44);
  return t2 && (n2.className = t2), n2;
}, $ = (e44) => e44.replace(/[&<>"']/g, (e45) => ({ "&": `&amp;`, "<": `&lt;`, ">": `&gt;`, '"': `&quot;`, "'": `&#39;` })[e45]), Cv = { prevSec: `<svg viewBox="0 0 24 24"><path d="M6 5h2v14H6zM20 5v14L9 12z"/></svg>`, back: `<svg viewBox="0 0 24 24"><path d="M11 6v12l-8-6zM21 6v12l-8-6z"/></svg>`, play: `<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg>`, pause: `<svg viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>`, fwd: `<svg viewBox="0 0 24 24"><path d="M3 6v12l8-6zM13 6v12l8-6z"/></svg>`, nextSec: `<svg viewBox="0 0 24 24"><path d="M16 5h2v14h-2zM4 5v14l11-7z"/></svg>`, voice: `<svg viewBox="0 0 24 24"><path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zm-7 9h2a5 5 0 0 0 10 0h2a7 7 0 0 1-6 6.9V21h-2v-2.1A7 7 0 0 1 5 12z"/></svg>`, speaker: `<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4zM16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>` }, wv = class {
  n;
  onPlayPause = () => {
  };
  onPrevSection = () => {
  };
  onNextSection = () => {
  };
  onSkipEnd = () => {
  };
  beforeSeek = () => {
  };
  captions = true;
  bar = Q(`#dkBar`);
  paused = false;
  section = ``;
  constructor(e44) {
    this.n = e44, Q(`#dkPrevSec`).innerHTML = Cv.prevSec, Q(`#dkBack`).innerHTML = Cv.back, Q(`#dkFwd`).innerHTML = Cv.fwd, Q(`#dkNextSec`).innerHTML = Cv.nextSec, Q(`#dkPlay`).innerHTML = Cv.pause, Q(`#dkVoiceIc`).innerHTML = Cv.voice, Q(`#dkPrevSec`).addEventListener(`click`, () => this.onPrevSection()), Q(`#dkNextSec`).addEventListener(`click`, () => this.onNextSection()), Q(`#dkPlay`).addEventListener(`click`, () => this.onPlayPause()), Q(`#dkBack`).addEventListener(`click`, () => this.skip(-1)), Q(`#dkFwd`).addEventListener(`click`, () => this.skip(1)), Q(`#dkVoice`).addEventListener(`click`, (e45) => {
      e45.stopPropagation(), this.togglePop();
    }), Q(`#voiceBtn`).addEventListener(`click`, (e45) => {
      e45.stopPropagation(), this.togglePop();
    }), Q(`#voicePop`).addEventListener(`click`, (e45) => e45.stopPropagation()), document.addEventListener(`click`, () => Q(`#voicePop`).classList.add(`hidden`)), this.bar.addEventListener(`click`, (e45) => {
      let t3 = e45.target.closest(`.seg`);
      t3 && (this.beforeSeek(), this.n.seek(Number(t3.dataset.i)));
    }), e44.onState = () => this.render(), e44.onVoicesChanged = () => {
      this.renderPop(), this.render();
    };
    try {
      this.captions = localStorage.getItem(`metlife-agenticops-captions`) !== `off`;
    } catch {
    }
    document.body.classList.toggle(`no-captions`, !this.captions);
    let t2 = () => {
      requestAnimationFrame(t2);
      let e45 = this.bar.querySelector(`.seg.on i`);
      e45 && (e45.style.width = `${Math.round(this.n.sentenceProgress * 100)}%`);
    };
    t2(), this.renderPop(), this.render();
  }
  skip(e44) {
    this.n.active ? (this.beforeSeek(), !this.n.skip(e44) && e44 > 0 && (this.n.cancel(), this.onSkipEnd())) : e44 > 0 && this.onSkipEnd();
  }
  setSection(e44) {
    this.section = e44, Q(`#dkSec`).textContent = e44;
  }
  setPaused(e44) {
    this.paused = e44, Q(`#dkPlay`).innerHTML = e44 ? Cv.play : Cv.pause, Q(`#dkPlay`).title = e44 ? `Resume (Space)` : `Pause (Space)`, Q(`#dock`).classList.toggle(`paused`, e44);
  }
  caption(e44) {
    let t2 = Q(`#captionText`);
    e44 ? (t2.textContent = e44, t2.classList.remove(`fade`), t2.offsetWidth, t2.classList.add(`in`)) : t2.classList.add(`fade`);
  }
  render() {
    let e44 = this.n, t2 = e44.total, n2 = e44.index;
    (this.bar.childElementCount !== t2 || this.bar.dataset.key !== e44.lines[0]) && (this.bar.dataset.key = e44.lines[0] ?? ``, this.bar.innerHTML = e44.lines.map((e45, t3) => `<span class="seg" data-i="${t3}" title="${$(e45.slice(0, 120))}" style="flex:${Math.max(1, e45.length)}"><i></i></span>`).join(``)), this.bar.querySelectorAll(`.seg`).forEach((t3, r3) => {
      t3.classList.toggle(`done`, !e44.active || r3 < n2), t3.classList.toggle(`on`, e44.active && r3 === n2), t3.querySelector(`i`).style.width = e44.active ? r3 < n2 ? `100%` : `0%` : `100%`;
    }), Q(`#dkCount`).textContent = t2 ? `${Math.min(n2 + 1, t2)} / ${t2}` : ``;
    let r2 = e44.currentVoice, i2 = e44.enabled ? r2 ? r2.label : `Captions` : `Voice off`;
    Q(`#dkVoiceName`).textContent = i2, Q(`#voiceBtn`).textContent = e44.enabled ? `Voice: ${i2}` : `Voice: Off`, Q(`#dkSec`).textContent = this.section, this.setPaused(this.paused);
  }
  togglePop() {
    let e44 = Q(`#voicePop`);
    e44.classList.toggle(`hidden`), e44.classList.contains(`hidden`) || this.renderPop();
  }
  renderPop() {
    let e44 = this.n, t2 = e44.voices(), n2 = e44.currentVoice?.id, r2 = t2.filter((e45) => e45.kind === `studio`), i2 = t2.filter((e45) => e45.kind === `device` && e45.premium), a2 = t2.filter((e45) => e45.kind === `device` && !e45.premium).slice(0, 14), o2 = (e45) => `<div class="vp-row ${e45.id === n2 ? `on` : ``}" data-id="${$(e45.id)}"><button class="vp-pick"><b>${$(e45.label)}</b><span>${$(e45.detail)}</span></button>${e45.premium ? `<em class="vp-badge">Premium</em>` : ``}<button class="vp-prev" title="Preview">${Cv.speaker}</button></div>`, s2 = (e45, t3, n3 = ``) => t3.length ? `<h6>${e45}</h6>${n3 ? `<p class="vp-note">${n3}</p>` : ``}${t3.map(o2).join(``)}` : ``, c2 = r2.length ? `` : `<p class="vp-note">Studio neural voices (${ev.map((e45) => e45.label).join(`, `)}) are available in the hosted version. This copy uses the best voices on your device.</p>`;
    Q(`#voicePop`).innerHTML = `
      <div class="vp-head"><b>Narration voice</b><label class="vp-tog"><input type="checkbox" id="vpOn" ${e44.enabled ? `checked` : ``}/> Voice</label><label class="vp-tog"><input type="checkbox" id="vpCap" ${this.captions ? `checked` : ``}/> Captions</label></div>
      <div class="vp-speed"><span>Speed</span>${[0.85, 1, 1.15, 1.3, 1.5].map((t3) => `<button data-r="${t3}" class="${Math.abs(e44.rate - t3) < 0.01 ? `on` : ``}">${t3}x</button>`).join(``)}</div>
      <div class="vp-list">${s2(`Studio neural voices`, r2)}${c2}${s2(`Premium voices on this device`, i2)}${s2(`Other device voices`, a2)}</div>`;
    let l2 = Q(`#voicePop`);
    l2.querySelectorAll(`.vp-row`).forEach((t3) => {
      let n3 = t3.dataset.id;
      t3.querySelector(`.vp-pick`).addEventListener(`click`, () => {
        e44.setVoice(n3), e44.enabled || e44.setEnabled(true), this.renderPop();
      }), t3.querySelector(`.vp-prev`).addEventListener(`click`, () => e44.preview(n3, iv));
    }), l2.querySelectorAll(`.vp-speed button`).forEach((t3) => t3.addEventListener(`click`, () => {
      e44.setRate(Number(t3.dataset.r)), this.renderPop();
    })), Q(`#vpOn`).addEventListener(`change`, (t3) => e44.setEnabled(t3.target.checked)), Q(`#vpCap`).addEventListener(`change`, (e45) => {
      this.captions = e45.target.checked, document.body.classList.toggle(`no-captions`, !this.captions);
      try {
        localStorage.setItem(`metlife-agenticops-captions`, this.captions ? `on` : `off`);
      } catch {
      }
    });
  }
}, Tv = class {
  el = document.createElement(`div`);
  status = `Live`;
  update(e44) {
  }
  beat(e44) {
  }
  destroy() {
  }
}, Ev = { splunk: { name: `Splunk`, cls: `p-splunk` }, te: { name: `ThousandEyes`, cls: `p-te` }, cc: { name: `Cisco Cloud Control`, cls: `p-cc` }, xdr: { name: `Cisco XDR`, cls: `p-xdr` }, nexus: { name: `Nexus Dashboard`, cls: `p-nexus` }, webex: { name: `Webex`, cls: `p-webex` }, metlife: { name: `MetLife`, cls: `p-metlife` }, trad: { name: `Traditional operations`, cls: `p-trad` }, fabric: { name: `Cisco Data Fabric`, cls: `p-fabric` }, assistant: { name: `Cisco AI Assistant`, cls: `p-assistant` } }, Dv = [`nw`, `ne`, `sw`, `se`, `w`, `e`, `center`, `n`, `s`, `mid`], Ov = { nw: [`w`, `n`, `center`, `mid`], ne: [`e`, `n`, `center`, `mid`], sw: [`w`, `s`, `center`, `mid`], se: [`e`, `s`, `center`, `mid`], w: [`nw`, `sw`, `n`, `s`, `center`, `mid`], e: [`ne`, `se`, `n`, `s`, `center`, `mid`], n: [`nw`, `ne`, `w`, `e`, `center`, `mid`], s: [`sw`, `se`, `w`, `e`, `center`, `mid`], center: Dv, mid: Dv }, kv = class {
  root;
  svg;
  wins = /* @__PURE__ */ new Map();
  ctx = null;
  project = () => ({ x: 0, y: 0, visible: false });
  onChange = () => {
  };
  constructor() {
    this.root = document.createElement(`div`), this.root.id = `stageLayer`, this.svg = document.createElementNS(`http://www.w3.org/2000/svg`, `svg`), this.svg.id = `leaders`, document.body.append(this.svg, this.root);
    let e44 = () => {
      requestAnimationFrame(e44), this.drawLeaders();
    };
    e44();
  }
  has(e44) {
    return this.wins.has(e44);
  }
  get(e44) {
    return this.wins.get(e44)?.panel;
  }
  ids() {
    return [...this.wins.keys()];
  }
  show(e44, t2, n2 = {}) {
    let r2 = this.wins.get(e44.id);
    if (r2) return r2.slot !== t2 && this.move(e44.id, t2), e44.destroy(), r2.panel;
    for (let e45 of this.wins.values()) (e45.slot === t2 || Ov[t2].includes(e45.slot)) && this.hide(e45.panel.id);
    let i2 = Ev[e44.product], a2 = document.createElement(`section`);
    a2.className = `win slot-${t2} ${i2.cls}`, a2.dataset.id = e44.id, a2.innerHTML = `<header class="win-head"><span class="win-brand"><i></i>${i2.name}</span><span class="win-title"></span><span class="win-status"><b class="live"></b><em></em></span><button class="win-btn" data-a="max" title="Expand">\u2922</button><button class="win-btn" data-a="close" title="Close">\xD7</button></header><div class="win-body"></div>`, a2.querySelector(`.win-title`).textContent = e44.title, a2.querySelector(`.win-status em`).textContent = e44.status, a2.querySelector(`.win-body`).appendChild(e44.el), a2.querySelector(`[data-a="close"]`).addEventListener(`click`, () => this.hide(e44.id)), a2.querySelector(`[data-a="max"]`).addEventListener(`click`, () => a2.classList.toggle(`maxed`)), this.root.appendChild(a2), requestAnimationFrame(() => a2.classList.add(`in`));
    let o2 = document.createElementNS(`http://www.w3.org/2000/svg`, `path`);
    o2.setAttribute(`class`, `leader ${i2.cls}`);
    let s2 = document.createElementNS(`http://www.w3.org/2000/svg`, `circle`);
    return s2.setAttribute(`r`, `4`), s2.setAttribute(`class`, `leader-dot ${i2.cls}`), this.svg.append(o2, s2), this.wins.set(e44.id, { panel: e44, slot: t2, el: a2, anchor: n2.anchor, line: o2, dot: s2 }), this.ctx && e44.update(this.ctx), this.onChange(), e44;
  }
  move(e44, t2) {
    let n2 = this.wins.get(e44);
    n2 && (n2.el.classList.remove(`slot-${n2.slot}`), n2.slot = t2, n2.el.classList.add(`slot-${t2}`));
  }
  setAnchor(e44, t2) {
    let n2 = this.wins.get(e44);
    n2 && (n2.anchor = t2);
  }
  hide(e44) {
    let t2 = this.wins.get(e44);
    t2 && (this.wins.delete(e44), t2.el.classList.remove(`in`), t2.el.classList.add(`out`), t2.line.remove(), t2.dot.remove(), setTimeout(() => {
      t2.el.remove(), t2.panel.destroy();
    }, 450), this.onChange());
  }
  clear(e44 = []) {
    for (let t2 of [...this.wins.keys()]) e44.includes(t2) || this.hide(t2);
  }
  status(e44, t2) {
    let n2 = this.wins.get(e44);
    n2 && (n2.el.querySelector(`.win-status em`).textContent = t2);
  }
  beat(e44, t2) {
    this.wins.get(e44)?.panel.beat(t2);
  }
  update(e44) {
    this.ctx = e44;
    for (let t2 of this.wins.values()) {
      t2.panel.update(e44);
      let n2 = t2.el.querySelector(`.win-status em`);
      n2.textContent !== t2.panel.status && (n2.textContent = t2.panel.status), t2.el.dataset.state = e44.state;
    }
  }
  resetCtx() {
    this.ctx = null;
  }
  drawLeaders() {
    for (let e44 of this.wins.values()) {
      if (!e44.anchor || e44.el.classList.contains(`maxed`) || !e44.el.classList.contains(`in`)) {
        e44.line.style.opacity = `0`, e44.dot.style.opacity = `0`;
        continue;
      }
      let t2 = this.project(e44.anchor), n2 = e44.el.getBoundingClientRect();
      if (!t2.visible || n2.width === 0) {
        e44.line.style.opacity = `0`, e44.dot.style.opacity = `0`;
        continue;
      }
      let r2 = t2.x < n2.left ? n2.left : t2.x > n2.right ? n2.right : n2.left + n2.width / 2, i2 = t2.y < n2.top ? n2.top : t2.y > n2.bottom ? n2.bottom : n2.top + n2.height / 2;
      if (t2.x > n2.left && t2.x < n2.right && t2.y > n2.top && t2.y < n2.bottom) {
        e44.line.style.opacity = `0`, e44.dot.style.opacity = `0`;
        continue;
      }
      let a2 = (r2 + t2.x) / 2;
      e44.line.setAttribute(`d`, `M${r2},${i2} C${a2},${i2} ${a2},${t2.y} ${t2.x},${t2.y}`), e44.dot.setAttribute(`cx`, String(t2.x)), e44.dot.setAttribute(`cy`, String(t2.y)), e44.line.style.opacity = `1`, e44.dot.style.opacity = `1`;
    }
  }
}, Av = (e44, t2, n2) => e44 + (t2 - e44) * n2, jv = (e44, t2 = 0, n2 = 1) => Math.min(n2, Math.max(t2, e44)), Mv = (e44) => e44 > 0.66 ? `crit` : e44 > 0.4 ? `high` : e44 > 0.18 ? `med` : `ok`;
function Nv(e44, t2) {
  let n2 = e44.dec ?? +(Math.abs(t2) < 10 && !Number.isInteger(e44.good)), r2 = Math.abs(t2) >= 1e3 ? Math.round(t2).toLocaleString() : t2.toFixed(n2);
  return `${t2 > 0 && (e44.unit === `pts` || e44.name.includes(`vs`) && e44.unit === `%` || e44.name.includes(`change`)) ? `+` : ``}${r2}`;
}
function Pv(e44, t2 = 120, n2 = 28, r2, i2) {
  if (e44.length < 2) return ``;
  let a2 = r2 ?? Math.min(...e44), o2 = (i2 ?? Math.max(...e44)) - a2 || 1;
  return e44.map((r3, i3) => `${(i3 / (e44.length - 1) * t2).toFixed(1)},${(n2 - (r3 - a2) / o2 * (n2 - 4) - 2).toFixed(1)}`).join(` `);
}
function Fv(e44, t2, n2 = 55) {
  return new Promise((r2) => {
    let i2 = 0;
    e44.textContent = ``;
    let a2 = () => {
      if (!e44.isConnected) return r2();
      i2 = Math.min(t2.length, i2 + Math.max(1, Math.round(n2 / 30))), e44.textContent = t2.slice(0, i2), i2 < t2.length ? setTimeout(a2, 33) : r2();
    };
    a2();
  });
}
var Iv = class extends Tv {
  v;
  id = `splunk`;
  product = `splunk`;
  title;
  status = `Live \xB7 adaptive thresholds`;
  hist;
  last = 0;
  series = [];
  constructor(e44) {
    super(), this.v = e44, this.title = `IT Service Intelligence \xB7 ${e44.service}`, this.hist = e44.kpis.map(() => []), this.el.className = `pnl splunk`, this.el.innerHTML = `
      <div class="sp-top">
        <div class="sp-score"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="27" class="trk"/><circle cx="32" cy="32" r="27" class="val"/></svg><b>100</b><label>Service health</label></div>
        <div class="sp-pred"><label>Predicted ahead</label><b>100</b><small>ITSI predictive analytics</small></div>
        <div class="sp-episode">No active episodes</div>
      </div>
      <div class="sp-kpis">${e44.kpis.map((e45, t2) => `<div class="sp-kpi" data-i="${t2}"><label>${$(e45.name)}</label><div><b>${Nv(e45, e45.good)}</b><em>${$(e45.unit)}</em></div><svg viewBox="0 0 120 28" preserveAspectRatio="none"><polyline points=""/></svg></div>`).join(``)}</div>
      <div class="sp-chart"><div class="sp-chart-h">${$(e44.kpis[0].name)} with adaptive threshold</div><svg viewBox="0 0 300 70" preserveAspectRatio="none"><path class="band"/><polyline class="line" points=""/></svg></div>
      <div class="sp-tree">${e44.tree.map((e45, t2) => `<div class="sp-node ${t2 === 0 ? `root` : ``}" data-i="${t2}"><i></i><span>${$(e45)}</span></div>`).join(``)}</div>`;
  }
  update(e44) {
    let t2 = Math.round(100 - e44.h * 72), n2 = Math.round(100 - e44.hPred * 72), r2 = (e45) => this.el.querySelector(e45);
    r2(`.sp-score b`).textContent = String(t2);
    let i2 = this.el.querySelector(`.sp-score .val`);
    i2.style.strokeDashoffset = String(170 * (1 - t2 / 100)), this.el.dataset.sev = Mv(e44.h), r2(`.sp-pred b`).textContent = String(n2), r2(`.sp-pred`).dataset.sev = Mv(e44.hPred);
    let a2 = r2(`.sp-episode`);
    e44.state === `protected` ? (a2.textContent = `Episode resolved by agent action. Service healthy.`, a2.dataset.sev = `good`) : e44.h > 0.5 ? (a2.textContent = `Critical episode: ${12 + Math.round(e44.h * 60)} correlated notable events`, a2.dataset.sev = `crit`) : e44.hPred > 0.35 ? (a2.textContent = `Episode: predicted service degradation within 30 minutes`, a2.dataset.sev = `high`) : (a2.textContent = `No active episodes`, a2.dataset.sev = `ok`);
    let o2 = performance.now(), s2 = o2 - this.last > 140;
    if (s2 && (this.last = o2), this.v.kpis.forEach((t3, n3) => {
      let r3 = (Math.random() - 0.5) * 0.04, i3 = Av(t3.good, t3.bad, jv(e44.h + r3 * (e44.h > 0.05 ? 1 : 0.3))), a3 = this.el.querySelector(`.sp-kpi[data-i="${n3}"]`);
      a3.querySelector(`b`).textContent = Nv(t3, i3), a3.dataset.sev = Mv(e44.h), s2 && (this.hist[n3].push(i3), this.hist[n3].length > 40 && this.hist[n3].shift(), a3.querySelector(`polyline`).setAttribute(`points`, Pv(this.hist[n3], 120, 28, Math.min(t3.good, t3.bad), Math.max(t3.good, t3.bad))));
    }), s2) {
      let t3 = this.v.kpis[0];
      this.series.push(Av(t3.good, t3.bad, jv(e44.h + (Math.random() - 0.5) * 0.03))), this.series.length > 70 && this.series.shift();
      let n3 = Math.min(t3.good, t3.bad), r3 = Math.max(t3.good, t3.bad);
      this.el.querySelector(`.sp-chart .line`).setAttribute(`points`, Pv(this.series, 300, 70, n3, r3));
      let i3 = 70 - (Av(t3.good, t3.bad, 0.12) - n3) / (r3 - n3 || 1) * 66 - 2, a3 = 70 - (Av(t3.good, t3.bad, -0.06) - n3) / (r3 - n3 || 1) * 66 - 2, [o3, s3] = t3.bad > t3.good ? [i3, a3] : [a3, i3];
      this.el.querySelector(`.sp-chart .band`).setAttribute(`d`, `M0,${o3} L300,${o3} L300,${s3} L0,${s3} Z`);
    }
    this.el.querySelectorAll(`.sp-node`).forEach((t3, n3) => {
      let r3 = n3 === this.v.rootNode, i3 = n3 === 0 ? e44.h : r3 ? Math.max(e44.h, e44.hPred * 0.9) : e44.h * (0.3 + n3 * 37 % 5 / 10);
      t3.dataset.sev = Mv(i3), t3.classList.toggle(`cause`, r3 && (e44.h > 0.2 || e44.hPred > 0.3) && e44.state !== `protected`);
    });
  }
}, Lv = { user: `U`, agent: `TE`, switch: `SW`, edge: `E`, isp: `ISP`, carrier: `CO`, cloud: `C`, dc: `DC`, app: `APP`, saas: `SaaS`, db: `DB` }, Rv = class extends Tv {
  v;
  id = `path`;
  product;
  title;
  status = `Path trace \xB7 1 min interval`;
  constructor(e44) {
    super(), this.v = e44;
    let t2 = e44.path.source;
    this.product = t2 === `ThousandEyes` ? `te` : t2 === `Nexus Dashboard` ? `nexus` : t2 === `Cisco XDR` ? `xdr` : `splunk`, this.title = t2 === `ThousandEyes` ? `Path Visualization \xB7 ${e44.path.title}` : e44.path.title, t2 !== `ThousandEyes` && (this.status = t2 === `Cisco XDR` ? `Attack path` : `Live`);
    let n2 = e44.path.hops.length, r2 = e44.path.hops.map((e45, t3) => 38 + t3 * 424 / (n2 - 1)), i2 = e44.path.bad, a2 = r2[i2], o2 = r2.slice(0, -1).map((e45, t3) => `<path class="lk ${t3 === i2 - 1 || t3 === i2 ? `near-bad` : ``} ${t3 === i2 - 1 ? `into-bad` : ``}" d="M${e45 + 16},58 L${r2[t3 + 1] - 16},58"/>`).join(``), s2 = `<path class="lk alt" d="M${r2[i2 - 1] + 14},66 Q${a2 - 30},128 ${a2 - 18},128"/><path class="lk alt" d="M${a2 + 18},128 Q${a2 + 30},128 ${r2[i2 + 1] - 14},66"/>`, c2 = e44.path.hops.map((e45, t3) => `<g class="nd ${t3 === i2 ? `bad` : ``}" transform="translate(${r2[t3]},58)"><circle r="16"/><text class="g" dy="4">${Lv[e45.kind]}</text><text class="t" dy="34">${$(e45.name)}</text><text class="s" dy="47">${$(e45.sub ?? ``)}</text></g>`).join(``), l2 = `<g class="nd altn" transform="translate(${a2},128)"><circle r="16"/><text class="g" dy="4">${Lv[e44.path.alt.kind]}</text><text class="t" dy="34">${$(e44.path.alt.name)}</text><text class="s" dy="47">${$(e44.path.alt.sub ?? ``)}</text></g>`;
    this.el.className = `pnl path`, this.el.innerHTML = `
      <div class="pt-metrics"><div><label>Loss</label><b class="m-loss">0.0%</b></div><div><label>Latency</label><b class="m-lat">24 ms</b></div><div><label>Jitter</label><b class="m-jit">2 ms</b></div><div class="pt-verdict"></div></div>
      <svg viewBox="0 0 500 190" class="pt-svg">${o2}${s2}${c2}${l2}<g class="bad-tag" transform="translate(${(r2[i2 - 1] + r2[i2]) / 2},32)"><rect x="-92" y="-12" width="184" height="20" rx="6"/><text dy="3">${$(e44.path.badMetric)}</text></g></svg>`;
  }
  update(e44) {
    let t2 = e44.state === `protected` && e44.branch === `agentic`, n2 = !t2 && (e44.h > 0.12 || e44.hPred > 0.3);
    this.el.dataset.mode = t2 ? `fixed` : n2 ? `bad` : `ok`;
    let r2 = t2 ? 0.02 : Math.max(e44.h, e44.hPred * 0.7);
    this.el.querySelector(`.m-loss`).textContent = `${(r2 * 9).toFixed(1)}%`, this.el.querySelector(`.m-lat`).textContent = `${Math.round(24 + r2 * 180)} ms`, this.el.querySelector(`.m-jit`).textContent = `${Math.round(2 + r2 * 46)} ms`, this.el.querySelector(`.pt-verdict`).textContent = t2 ? `Validated: ${this.v.path.goodMetric}` : n2 ? `Degradation detected` : `Path healthy`, this.status = t2 ? `Validated after change` : n2 ? `Alerting` : `Path trace \xB7 1 min interval`;
  }
}, zv = class extends Tv {
  v;
  id = `canvas`;
  product = `cc`;
  title = `AI Canvas`;
  status = `Deep Reasoning`;
  stage = -1;
  timers = [];
  onApprove = () => {
  };
  onPick = () => {
  };
  constructor(e44, t2) {
    super(), this.v = e44, this.title = `AI Canvas \xB7 ${t2.title}`, this.el.className = `pnl canvas`;
    let n2 = e44.canvas;
    this.el.innerHTML = `
      <div class="cv-top">
        <div class="cv-prompt"><span class="cv-ic">\u2726</span><span class="cv-text"></span><span class="cv-caret"></span></div>
        <div class="cv-mode"><span class="on">Deep Reasoning</span><span>Default</span></div>
        <div class="cv-presence"><b title="MetLife operator">OP</b><b class="ag" title="Monitoring agent">MA</b><b class="ag" title="Diagnostic agent">DA</b><b class="ag" title="Remediation agent">RA</b><b class="ag" title="Learning agent">LA</b></div>
      </div>
      <div class="cv-grid">
        <div class="cv-card plan"><h5>Investigation plan <em>${n2.plan.length} agents in parallel</em></h5>${n2.plan.map((e45, t3) => `<div class="cv-step" data-i="${t3}"><i class="st"></i><span class="ag">${$(e45.agent)}</span><span class="tk">${$(e45.task)}</span><span class="src">${$(e45.source)}</span></div>`).join(``)}<div class="cv-plan-actions"><button class="cv-btn ghost" tabindex="-1">Revise plan</button><button class="cv-btn" tabindex="-1">Run plan</button></div></div>
        <div class="cv-card widget"><h5>Generated widget <em>${$(e44.kpis[0].name)}</em></h5><svg viewBox="0 0 220 80" preserveAspectRatio="none"><path class="fc-band" d=""/><polyline class="hist" points=""/><polyline class="fc" points=""/><line class="now" x1="120" x2="120" y1="0" y2="80"/></svg><div class="cv-wfoot"><span>Drill down</span><span>Export</span><span>Add to next step</span></div></div>
        <div class="cv-card finding"><h5>Root cause <em>sourced answer</em></h5><p>${$(n2.finding.title)}</p><ul>${n2.finding.evidence.map((e45) => `<li>${$(e45)}</li>`).join(``)}</ul></div>
        <div class="cv-card action"><h5>Proposed action <em>${$(n2.action.policy)}</em></h5><p class="cv-at">${$(n2.action.title)}</p><ol>${n2.action.steps.map((e45) => `<li>${$(e45)}</li>`).join(``)}</ol>
          <div class="cv-approve"><button class="cv-btn ok" data-a="approve">Approve</button><button class="cv-btn ghost" data-a="revise">Revise</button><button class="cv-btn ghost" data-a="reject">Reject</button></div>
          <div class="cv-decision"></div>
          <div class="cv-result"></div></div>
        <div class="cv-card trail"><h5>Reasoning trail <em>Splunk AI Agent Monitoring</em></h5><div class="cv-trail"></div></div>
      </div>`, this.el.querySelector(`[data-a="approve"]`).addEventListener(`click`, () => this.onApprove()), this.el.querySelector(`[data-a="revise"]`).addEventListener(`click`, () => this.flashNote(`Plan sent back to the agent with your notes.`)), this.el.querySelector(`[data-a="reject"]`).addEventListener(`click`, () => this.flashNote(`Rejected. The agent will keep monitoring and escalate if the forecast worsens.`)), this.drawWidget(0.45);
  }
  flashNote(e44) {
    let t2 = this.el.querySelector(`.cv-result`);
    t2.textContent = e44, t2.className = `cv-result note`;
  }
  drawWidget(e44) {
    let t2 = this.v.kpis[0], n2 = [];
    for (let r3 = 0; r3 <= 12; r3++) n2.push(Av(t2.good, t2.bad, 0.05 + Math.sin(r3 * 1.3) * 0.02 + r3 / 12 * e44 * 0.4));
    let r2 = [n2[12]];
    for (let i3 = 1; i3 <= 8; i3++) r2.push(Av(n2[12], Av(t2.good, t2.bad, e44), i3 / 8));
    let i2 = Math.min(t2.good, t2.bad), a2 = Math.max(t2.good, t2.bad), o2 = (e45) => 76 - (e45 - i2) / (a2 - i2 || 1) * 70;
    this.el.querySelector(`.hist`).setAttribute(`points`, n2.map((e45, t3) => `${t3 * 10},${o2(e45).toFixed(1)}`).join(` `)), this.el.querySelector(`.fc`).setAttribute(`points`, r2.map((e45, t3) => `${120 + t3 * 12.5},${o2(e45).toFixed(1)}`).join(` `));
    let s2 = r2.map((e45, t3) => `${120 + t3 * 12.5},${(o2(e45) - t3 * 2.2).toFixed(1)}`), c2 = r2.map((e45, t3) => `${120 + t3 * 12.5},${(o2(e45) + t3 * 2.2).toFixed(1)}`).reverse();
    this.el.querySelector(`.fc-band`).setAttribute(`d`, `M${s2.join(` L`)} L${c2.join(` L`)} Z`);
  }
  trail(e44, t2) {
    let n2 = this.el.querySelector(`.cv-trail`), r2 = document.createElement(`div`);
    for (r2.className = `cv-tr`, r2.innerHTML = `<span>${$(e44)}</span><em>${t2} ms</em>`, n2.appendChild(r2); n2.children.length > 6; ) n2.firstElementChild?.remove();
  }
  later(e44, t2) {
    this.timers.push(window.setTimeout(() => this.el.isConnected && t2(), e44));
  }
  beat(e44) {
    for (; this.stage < e44; ) this.stage++, this.reveal(this.stage);
  }
  reveal(e44) {
    this.el.dataset.stage = String(e44);
    let t2 = this.v.canvas;
    if (e44 === 0) Fv(this.el.querySelector(`.cv-text`), t2.prompt, 70), this.trail(`Intent parsed: cross-domain investigation`, 180);
    else if (e44 === 1) this.el.querySelector(`.plan`).classList.add(`show`), this.trail(`Plan generated: ${t2.plan.length} steps`, 640);
    else if (e44 === 2) this.el.querySelectorAll(`.cv-step`).forEach((e45, n2) => {
      e45.classList.add(`run`), this.later(500 + n2 * 520, () => {
        e45.classList.remove(`run`), e45.classList.add(`done`), this.trail(`Tool call: ${t2.plan[n2].source}`, 220 + n2 * 173 % 400);
      });
    });
    else if (e44 === 3) this.el.querySelector(`.widget`).classList.add(`show`), this.later(500, () => this.el.querySelector(`.finding`).classList.add(`show`)), this.trail(`Model: Deep Network Model + frontier LLM`, 1220), this.el.querySelectorAll(`.cv-step`).forEach((e45) => e45.classList.add(`done`));
    else if (e44 === 4) this.el.querySelector(`.action`).classList.add(`show`), this.later(300, () => this.el.querySelector(`.action`).scrollIntoView({ block: `end`, behavior: `smooth` })), this.trail(`Policy check: ${t2.action.policy.split(`:`)[0]}`, 90);
    else if (e44 === 5) {
      this.el.querySelector(`.action`).classList.add(`approved`);
      let e45 = this.el.querySelector(`.cv-result`);
      e45.className = `cv-result ok`, e45.textContent = `Approved by operator. Remediation agent executing under policy.`, this.trail(`Human approval recorded`, 40), this.status = `Executing`;
    } else if (e44 === 6) {
      let e45 = this.el.querySelector(`.cv-result`);
      e45.className = `cv-result ok done`, e45.textContent = `Validated: ${t2.action.validation}`, this.drawWidget(0.02), this.trail(`ThousandEyes validation passed`, 860), this.status = `Resolved`;
    }
  }
  setDecision(e44, t2) {
    let n2 = this.el.querySelector(`.cv-decision`);
    this.el.classList.add(`deciding`), n2.innerHTML = `<label>Your call</label>${e44.map((e45, n3) => `<button class="cv-opt ${t2 === n3 ? e45.quality : ``}" data-i="${n3}" ${t2 === null ? `` : `disabled`}><b>${$(e45.label)}</b><span>${$(e45.detail)}</span></button>`).join(``)}`, n2.querySelectorAll(`.cv-opt`).forEach((e45) => e45.addEventListener(`click`, () => this.onPick(Number(e45.dataset.i)))), this.later(500, () => n2.scrollIntoView({ block: `end`, behavior: `smooth` }));
  }
  clearDecision() {
    this.el.classList.remove(`deciding`), this.el.querySelector(`.cv-decision`).innerHTML = ``;
  }
  update(e44) {
    e44.branch === `agentic` && (e44.state === `protected` ? this.beat(6) : e44.state === `warning` && this.beat(2));
  }
  destroy() {
    this.timers.forEach(clearTimeout);
  }
}, Bv = class extends Tv {
  v;
  s;
  id = `assistant`;
  product = `assistant`;
  title = `Ask across every domain`;
  status = `Agent mode`;
  stage = -1;
  log;
  busy = false;
  onCanvas = () => {
  };
  constructor(e44, t2) {
    super(), this.v = e44, this.s = t2, this.el.className = `pnl assistant`, this.el.innerHTML = `<div class="as-log"></div><div class="as-chips"></div><form class="as-input"><input placeholder="Ask about this mission, for example: what is the business impact?" /><button>Ask</button></form>`, this.log = this.el.querySelector(`.as-log`), this.el.querySelector(`form`).addEventListener(`submit`, (e45) => {
      e45.preventDefault();
      let t3 = this.el.querySelector(`input`), n2 = t3.value.trim();
      n2 && (t3.value = ``, this.ask(n2, this.answerFor(n2)));
    });
  }
  answerFor(e44) {
    let t2 = e44.toLowerCase().split(/\W+/).filter((e45) => e45.length > 3), n2 = null, r2 = 0;
    for (let e45 of this.v.assistant.followups) {
      let i2 = t2.filter((t3) => e45.q.toLowerCase().includes(t3) || e45.a.toLowerCase().includes(t3)).length;
      i2 > r2 && (r2 = i2, n2 = e45);
    }
    return n2 && r2 > 0 ? n2.a : /impact|cost|revenue|business|money/i.test(e44) ? `Modeled exposure if nobody acts: about $${(this.s.exposure / 1e6).toFixed(1)}M. ${this.s.exposureBasis}` : /site|where|location|blast/i.test(e44) ? `The blast radius reaches ${this.s.blast.map((e45) => g_[e45]?.city ?? e45).join(`, `)}.` : `Here is what I found across ${this.s.signals.slice(0, 3).join(`, `)}: ${this.v.assistant.a}`;
  }
  bubble(e44, t2) {
    let n2 = document.createElement(`div`);
    return n2.className = `as-msg ${e44}`, n2.innerHTML = t2, this.log.appendChild(n2), this.log.scrollTop = this.log.scrollHeight, n2;
  }
  async ask(e44, t2, n2 = ``) {
    if (this.busy) return;
    this.busy = true, await Fv(this.bubble(`user`, `<span></span>`).querySelector(`span`), e44, 90);
    let r2 = this.bubble(`bot thinking`, `<span class="dots"><i></i><i></i><i></i></span> Reasoning across ${this.s.signals.slice(0, 3).map($).join(`, `)}`);
    await new Promise((e45) => setTimeout(e45, 900)), r2.remove();
    let i2 = this.bubble(`bot`, `<span class="ans"></span>` + n2);
    await Fv(i2.querySelector(`.ans`), t2, 160), i2.classList.add(`done`), this.log.scrollTop = this.log.scrollHeight, /AI Canvas/i.test(t2) && this.onCanvas(), this.busy = false;
  }
  beat(e44) {
    for (; this.stage < e44; ) if (this.stage++, this.stage === 0) {
      let e45 = this.v.assistant, t2 = `<details class="as-spl" open><summary>Generated SPL2 \xB7 federated search</summary><pre>${$(e45.spl)}</pre></details><table class="as-tbl">${e45.rows.map((e46) => `<tr><td>${$(e46[0])}</td><td>${$(e46[1])}</td><td>${$(e46[2])}</td></tr>`).join(``)}</table>`;
      this.ask(e45.q, e45.a, t2);
    } else this.stage >= 1 && this.showChips();
  }
  showChips() {
    let e44 = this.el.querySelector(`.as-chips`);
    e44.childElementCount || (e44.innerHTML = this.v.assistant.followups.map((e45, t2) => `<button data-i="${t2}">${$(e45.q)}</button>`).join(``), e44.querySelectorAll(`button`).forEach((e45) => e45.addEventListener(`click`, () => {
      let t2 = this.v.assistant.followups[Number(e45.dataset.i)];
      e45.disabled = true, this.ask(t2.q, t2.a);
    })));
  }
}, Vv = class extends Tv {
  v;
  s;
  id = `storm`;
  product = `trad`;
  title = `12 tools, 6 teams, 1 bridge call`;
  status = `P1 open`;
  list;
  lastAdd = 0;
  k = 0;
  constructor(e44, t2) {
    super(), this.v = e44, this.s = t2, this.el.className = `pnl storm`;
    let n2 = [`Investigating`, `Checking logs`, `Not our domain`, `Waiting on vendor`, `Rebooting`, `Joining bridge`];
    this.el.innerHTML = `
      <div class="st-counters"><div><b class="c-al">0</b><label>Alerts</label></div><div><b class="c-tk">0</b><label>Tickets</label></div><div><b class="c-tm">0</b><label>Teams on bridge</label></div><div><b class="c-br">00:00</b><label>Bridge time</label></div></div>
      <div class="st-body"><div class="st-list"></div>
      <div class="st-bridge"><h5>P1 bridge</h5>${e44.teams.map((e45, t3) => `<div class="st-team" data-i="${t3}"><b>${$(e45.split(` `).map((e46) => e46[0]).join(``).slice(0, 2).toUpperCase())}</b><span>${$(e45)}</span><em>${n2[t3 % n2.length]}</em></div>`).join(``)}<div class="st-rc">Root cause: <b>unknown</b></div></div></div>`, this.list = this.el.querySelector(`.st-list`);
  }
  update(e44) {
    let t2 = this.s, n2 = e44.branch === `traditional`, r2 = n2 && e44.t >= t2.impact, i2 = t2.tradRecover - t2.impact || 1, a2 = r2 ? jv((e44.t - t2.impact) / i2) : 0;
    this.el.dataset.active = String(r2);
    let o2 = (e45) => this.el.querySelector(e45);
    o2(`.c-al`).textContent = r2 ? Math.round(40 + a2 * 1400 + Math.sin(e44.t) * 5).toLocaleString() : n2 ? `3` : `0`, o2(`.c-tk`).textContent = r2 ? Math.round(12 + a2 * 340).toLocaleString() : `0`;
    let s2 = r2 ? Math.min(this.v.teams.length, 1 + Math.floor(a2 * 14)) : 0;
    o2(`.c-tm`).textContent = String(s2);
    let c2 = r2 ? Math.round(t2.unit === `h` ? (e44.t - t2.impact) * 60 : e44.t - t2.impact) : 0;
    o2(`.c-br`).textContent = `${String(Math.floor(c2 / 60)).padStart(2, `0`)}:${String(c2 % 60).padStart(2, `0`)}`, this.el.querySelectorAll(`.st-team`).forEach((e45, t3) => e45.classList.toggle(`on`, t3 < s2));
    let l2 = r2 && e44.t >= t2.tradDetect + (t2.tradRecover - t2.tradDetect) * 0.45;
    o2(`.st-rc`).innerHTML = l2 ? `Root cause: <b>found by hand, ${$(this.v.tree[this.v.rootNode])}</b>` : `Root cause: <b>unknown</b>`, this.status = n2 ? r2 ? e44.t >= t2.tradRecover ? `Recovered, after the damage` : `P1 open` : `Signals scattered across tools` : `Not used on this timeline`;
    let u2 = performance.now();
    if (u2 - this.lastAdd > (r2 ? 380 : 2600) && (r2 || n2 && e44.t > t2.agentDetect)) {
      this.lastAdd = u2;
      let e45 = r2 ? this.v.alerts[this.k++ % this.v.alerts.length] : { tool: `Siloed tool`, text: `Low-priority warning, no context` }, t3 = document.createElement(`div`);
      for (t3.className = `st-al ${r2 ? `hot` : `cold`}`, t3.innerHTML = `<span class="tool">${$(e45.tool)}</span><span>${$(e45.text)}</span><em>${r2 ? `P` + (1 + this.k % 3) : `P4`}</em>`, this.list.prepend(t3); this.list.children.length > 9; ) this.list.lastElementChild?.remove();
    }
  }
}, Hv = class extends Tv {
  v;
  id = `xdr`;
  product = `xdr`;
  title = `Incident \xB7 Instant Attack Verification`;
  status = `Investigating`;
  constructor(e44) {
    super(), this.v = e44;
    let t2 = e44.security;
    this.el.className = `pnl xdr`, this.el.innerHTML = `
      <div class="xd-verdict"><b>${$(t2.verdict)}</b><span>Sources: Splunk ES, Duo, Secure Email, Secure Endpoint, Hypershield</span></div>
      <div class="xd-tactics">${t2.tactics.map((e45, t3) => `<span data-i="${t3}">${$(e45)}</span>`).join(``)}</div>
      <div class="xd-story">${t2.story.map((e45, t3) => `<div class="xd-node" data-i="${t3}"><b>${$(e45.stage)}</b><span>${$(e45.text)}</span></div>`).join(`<i class="xd-arrow"></i>`)}</div>
      <div class="xd-resp"><h5>Response \xB7 Splunk SOAR playbook</h5>${t2.responses.map((e45, t3) => `<div class="xd-task" data-i="${t3}"><i></i><span>${$(e45)}</span></div>`).join(``)}</div>
      <div class="xd-stamp">Contained at the identity stage</div>`;
  }
  update(e44) {
    let t2 = e44.s, n2 = this.v.security, r2 = n2.story.length, i2 = 0, a2 = false;
    if (e44.branch === `traditional`) {
      let n3 = jv((e44.t - (t2.agentDetect - 10)) / (t2.impact + (t2.tradDetect - t2.impact) * 0.5 - (t2.agentDetect - 10)));
      i2 = Math.ceil(n3 * r2);
    } else i2 = e44.t >= t2.agentDetect ? 2 : +(e44.t >= t2.agentDetect - 15), a2 = e44.t >= t2.agentRemediate;
    this.el.dataset.contained = String(a2), this.el.dataset.branch = e44.branch, this.el.querySelectorAll(`.xd-node`).forEach((e45, t3) => {
      e45.classList.toggle(`lit`, t3 < i2), e45.classList.toggle(`blocked`, a2 && t3 >= i2);
    }), this.el.querySelectorAll(`.xd-tactics span`).forEach((e45, t3) => e45.classList.toggle(`lit`, t3 < i2));
    let o2 = e44.branch === `agentic` ? jv((e44.t - (t2.agentDetect + 3)) / (t2.agentRemediate - t2.agentDetect - 3)) : 0;
    this.el.querySelectorAll(`.xd-task`).forEach((e45, t3) => e45.classList.toggle(`done`, o2 * n2.responses.length > t3 + 0.2)), this.status = a2 ? `Contained` : e44.branch === `traditional` && i2 >= r2 ? `Impact: encryption` : i2 ? `Attack in progress` : `Monitoring`;
  }
}, Uv = class extends Tv {
  s;
  id = `impact`;
  product = `metlife`;
  title = `Business impact`;
  status = `Modeled`;
  constructor(e44) {
    super(), this.s = e44, this.el.className = `pnl impact`, this.el.innerHTML = `
      <div class="im-pillar"><label>New Frontier priority</label><b>${$(e44.pillar)}</b></div>
      <div class="im-big"><div class="trad"><label>Exposure realized, traditional</label><b class="im-exp">$0.0M</b></div><div class="agent"><label>Protected with AgenticOps</label><b class="im-prot">$0.0M</b></div></div>
      <div class="im-metric"><label>${$(e44.metricName)}</label><div class="im-bars"><div class="b trad"><i></i><span>Traditional</span></div><div class="b agent"><i></i><span>AgenticOps</span></div></div></div>
      <table class="im-kpi">${e44.kpis.map((e45) => `<tr><td>${$(e45.label)}</td><td class="t">${$(e45.traditional)}</td><td class="a">${$(e45.agentic)}</td></tr>`).join(``)}</table>`;
  }
  update(e44) {
    let t2 = this.s, n2 = e44.tl.exposureAt(e44.t), r2 = e44.view !== `agentic`;
    this.el.querySelector(`.im-exp`).textContent = `$${((r2 ? n2 : 0) / 1e6).toFixed(1)}M`;
    let i2 = e44.t >= t2.agentRemediate && e44.view !== `traditional` ? t2.exposure * jv((e44.t - t2.agentRemediate) / Math.max(1, t2.range[1] - t2.agentRemediate) * 2) : 0;
    this.el.querySelector(`.im-prot`).textContent = `$${(i2 / 1e6).toFixed(1)}M`;
    let a2 = e44.tl.metric(`traditional`, e44.t), o2 = e44.tl.metric(`agentic`, e44.t);
    this.el.querySelector(`.b.trad i`).style.width = `${jv(a2 / 105) * 100}%`, this.el.querySelector(`.b.agent i`).style.width = `${jv(o2 / 105) * 100}%`;
  }
}, Wv = class extends Tv {
  id = `facility`;
  product = `metlife`;
  title;
  status = `Public sources`;
  onLevel = () => {
  };
  constructor(e44, t2) {
    super(), this.title = e44.title, this.el.className = `pnl facility`, this.el.innerHTML = `
      <div class="fc-addr"><b>${$(e44.entity)}</b><span>${$(e44.address)}</span></div>
      ${t2 ? `<div class="fc-zone ${t2.verified ? `v` : ``}"><label>Mission location</label><b>Floor ${t2.floor} \xB7 ${$(t2.room)}</b><span>${$(t2.basis)}</span></div>` : ``}
      <ul class="fc-facts">${e44.facts.map((e45) => `<li class="${e45.verified ? `v` : `i`}"><em>${e45.verified ? `Public source` : `Illustrative`}</em><b>${$(e45.k)}</b><span>${$(e45.v)}</span></li>`).join(``)}</ul>
      <div class="fc-drill"><button data-l="globe">Globe</button>${e44.buildings.length > 1 ? `<button data-l="site">Campus</button>` : ``}<button data-l="building">Building</button>${t2 ? `<button data-l="floor">Floor ${t2.floor}</button>` : ``}</div>
      <div class="fc-src">Sources: ${e44.sources.map($).join(` \xB7 `)}</div>`, this.el.querySelectorAll(`[data-l]`).forEach((e45) => e45.addEventListener(`click`, () => this.onLevel(e45.dataset.l)));
  }
}, Gv = [{ k: `net`, label: `Network`, sub: `Catalyst, Meraki, SD-WAN, Nexus`, match: /SD-WAN|Meraki|Nexus|WAN|network|circuit|Catalyst/i }, { k: `inet`, label: `Internet and cloud`, sub: `ThousandEyes agents`, match: /ThousandEyes|ISP|path|synthetic/i }, { k: `app`, label: `Applications`, sub: `Splunk Observability, AppDynamics`, match: /Observability|APM|AppDynamics|RUM|trace|batch|API/i }, { k: `sec`, label: `Identity and security`, sub: `Duo, XDR, Firewall, Hypershield`, match: /Duo|XDR|Security|Firewall|Hypershield|Identity|identity/i }, { k: `biz`, label: `Business events`, sub: `Quotes, claims, payments, CSAT`, match: /business|Business|CSAT|quote|claims|payment|Webex|events/i }, { k: `ext`, label: `External signals`, sub: `Weather, market calendar, vendors`, match: /weather|NOAA|hurricane|market|calendar|vendor|third|season/i }], Kv = [`Catalyst SD-WAN`, `Nexus Dashboard`, `Secure Access`, `Hypershield`, `Webex Contact Center`, `ServiceNow`], qv = class extends Tv {
  id = `fabric`;
  product = `fabric`;
  title = `Powered by Splunk \xB7 into Cisco Cloud Control`;
  status = `Federated`;
  constructor(e44, t2 = `full`) {
    super();
    let n2 = e44 ? [...e44.signals, ...e44.products].join(` `) : ``, r2 = Gv.map((t3) => !e44 || t3.match.test(n2)), i2 = Kv.map((t3) => !e44 || e44.products.some((e45) => e45.includes(t3.split(` `)[0])) || n2.includes(t3));
    this.el.className = `pnl fabric mode-${t2}`;
    let a2 = (e45) => 22 + e45 * 54, o2 = Gv.map((e45, t3) => `<g class="fb-src ${r2[t3] ? `lit` : ``}" transform="translate(8,${a2(t3)})"><rect width="170" height="42" rx="8"/><text x="10" y="18" class="t">${$(e45.label)}</text><text x="10" y="33" class="s">${$(e45.sub)}</text></g>`).join(``), s2 = `<g class="fb-df" transform="translate(232,20)"><rect width="190" height="316" rx="12"/><text x="95" y="24" class="h">Cisco Data Fabric</text>${[`Machine Data Lake`, `Federated Search (SPL2)`, `Cisco Time Series Model`, `Context layer, knowledge graph`, `Splunk MCP Server`].map((e45, t3) => `<g transform="translate(12,${44 + t3 * 52})"><rect width="166" height="40" rx="7" class="in"/><text x="83" y="25" class="c">${$(e45)}</text></g>`).join(``)}</g>`, c2 = `<g class="fb-cc" transform="translate(476,20)"><rect width="190" height="316" rx="12"/><text x="95" y="24" class="h">Cisco Cloud Control</text>${[`AI Canvas`, `Cisco AI Assistant`, `Agents: monitor, diagnose`, `Agents: remediate, learn`, `AI Defense governance`].map((e45, t3) => `<g transform="translate(12,${44 + t3 * 52})"><rect width="166" height="40" rx="7" class="in"/><text x="83" y="25" class="c">${$(e45)}</text></g>`).join(``)}</g>`, l2 = Kv.map((e45, t3) => `<g class="fb-act ${i2[t3] ? `lit` : ``}" transform="translate(720,${a2(t3)})"><rect width="150" height="42" rx="8"/><text x="75" y="26" class="c">${$(e45)}</text></g>`).join(``), u2 = [...Gv.map((e45, t3) => `M178,${a2(t3) + 21} C205,${a2(t3) + 21} 205,178 232,178`), `M422,178 L476,178`, ...Kv.map((e45, t3) => `M666,178 C693,178 693,${a2(t3) + 21} 720,${a2(t3) + 21}`)], d2 = u2.map((e45, t3) => `<path id="fbp${t3}" class="fb-w ${t3 < Gv.length ? r2[t3] ? `lit` : `` : t3 === Gv.length ? `lit` : i2[t3 - Gv.length - 1] ? `lit act` : ``}" d="${e45}"/>`).join(``), f2 = u2.map((e45, t3) => (t3 < Gv.length ? r2[t3] : t3 === Gv.length || i2[t3 - Gv.length - 1]) ? [0, 1].map((e46) => `<circle r="3" class="fb-dot ${t3 > Gv.length ? `act` : ``}"><animateMotion dur="${2.2 + t3 % 3 * 0.4}s" begin="${e46 * 1.1 + t3 * 0.13}s" repeatCount="indefinite"><mpath href="#fbp${t3}"/></animateMotion></circle>`).join(``) : ``).join(``);
    this.el.innerHTML = `<svg viewBox="0 0 880 350" class="fb-svg">${d2}${o2}${s2}${c2}${l2}${f2}<text x="200" y="345" class="cap">Signals</text><text x="440" y="345" class="cap">One federated, AI-ready picture</text><text x="690" y="345" class="cap">Governed action</text></svg>`;
  }
}, Jv = class extends Tv {
  s;
  id = `global`;
  product = `cc`;
  title = `Topology \xB7 all MetLife locations`;
  status = `Tenant group: MetLife Global`;
  onPick = () => {
  };
  constructor(e44) {
    super(), this.s = e44, this.el.className = `pnl global`;
    let t2 = h_.filter((e45) => e45.hub || e45.id === `greenbush`);
    this.el.innerHTML = `<div class="go-sum"><div><b>${h_.length}</b><label>Sites</label></div><div><b class="go-ag">128</b><label>Agents</label></div><div><b class="go-imp">0</b><label>Impacted</label></div><div><b class="go-act">0</b><label>Actions pending</label></div></div>
      <div class="go-list">${t2.map((e45) => `<div class="go-row" data-id="${e45.id}"><i></i><b>${$(e45.city)}</b><span>${$(e45.name)}</span><em>Healthy</em></div>`).join(``)}</div>`, this.el.querySelectorAll(`.go-row`).forEach((e45) => e45.addEventListener(`click`, () => this.onPick(e45.dataset.id)));
  }
  update(e44) {
    let t2 = this.s, n2 = 0;
    this.el.querySelectorAll(`.go-row`).forEach((r2) => {
      let i2 = r2.dataset.id, a2 = `ok`, o2 = `Healthy`;
      t2 && i2 === t2.siteId ? (a2 = e44.state === `critical` ? `crit` : e44.state === `warning` || e44.state === `signal` || e44.state === `recovering` ? `warn` : e44.state === `protected` ? `good` : `ok`, o2 = { idle: `Healthy`, signal: `Weak signal`, warning: `Agent acting`, critical: `Business impact`, recovering: `Recovering`, protected: `Protected` }[e44.state]) : t2 && t2.blast.includes(i2) && e44.state === `critical` && (a2 = `crit`, o2 = `Blast radius`), a2 === `crit` && n2++, r2.dataset.st = a2, r2.querySelector(`em`).textContent = o2;
    }), this.el.querySelector(`.go-imp`).textContent = String(n2), this.el.querySelector(`.go-act`).textContent = e44.state === `warning` ? `1` : `0`;
  }
}, Yv = class extends Tv {
  id = `facts`;
  product = `metlife`;
  title = `MetLife at a glance`;
  status = `Public information`;
  constructor() {
    super(), this.el.className = `pnl facts`, this.el.innerHTML = `<div class="fa-grid">
      <div><b>1868</b><label>Founded in New York</label></div>
      <div><b>40+</b><label>Markets served</label></div>
      <div><b>#1</b><label>U.S. group benefits provider</label></div>
      <div><b>200 Park Ave</b><label>Global headquarters above Grand Central</label></div></div>
      <p>The locations in this experience are real MetLife offices: New York, Cary, Tampa, Whippany, North Greenbush, Tokyo, Mexico City, Santiago, Brighton, Dubai and Noida.</p>`;
  }
}, Xv = class extends Tv {
  id = `frontier`;
  product = `metlife`;
  title = `New Frontier commitments`;
  status = `Investor Day strategy`;
  constructor() {
    super(), this.el.className = `pnl frontier`, this.el.innerHTML = `<div class="nf-grid">${[[`Double-digit`, `Adjusted EPS growth`], [`15% to 17%`, `Adjusted return on equity`], [`100 bps`, `Lower direct expense ratio`], [`$25B+`, `Free cash flow`]].map(([e44, t2], n2) => `<div style="--i:${n2}"><b>${e44}</b><label>${t2}</label><span class="nf-run">Runs on technology</span></div>`).join(``)}</div>`;
  }
}, Zv = class extends Tv {
  id = `silos`;
  product = `trad`;
  title = `Each team sees a slice`;
  status = `7 consoles`;
  timer = 0;
  constructor() {
    super(), this.el.className = `pnl silos`;
    let e44 = [`Network NMS`, `Cloud console`, `APM`, `Security SIEM`, `Identity`, `Contact center`, `Service desk`];
    this.el.innerHTML = `<div class="sl-grid">${e44.map((e45, t2) => `<div class="sl-tool" style="--i:${t2}"><h6>${e45}</h6><b>${30 + t2 * 47 % 180}</b><label>open alerts</label><div class="sl-lines"><i></i><i></i><i></i></div></div>`).join(``)}</div><div class="sl-foot">No shared context. No business view. Alerts arrive after customers feel it.</div>`, this.timer = window.setInterval(() => {
      this.el.querySelectorAll(`.sl-tool b`).forEach((e45) => e45.textContent = String(Number(e45.textContent) + Math.floor(Math.random() * 4)));
    }, 500);
  }
  destroy() {
    clearInterval(this.timer);
  }
}, Qv = class extends Tv {
  id = `shell`;
  product = `cc`;
  title = `One login, one view, humans and agents together`;
  status = `Generally available (U.S.)`;
  constructor() {
    super(), this.el.className = `pnl shell`, this.el.innerHTML = `<div class="sh-wrap"><nav>${[`Inventory`, `Topology`, `Actions`, `AI Canvas`, `Studio`, `Marketplace`].map((e44, t2) => `<span class="${t2 === 2 ? `on` : ``}">${e44}</span>`).join(``)}</nav>
      <div class="sh-main">
        <h6>Actions \xB7 correlated and prioritized</h6>
        ${[[`P1`, `Predicted capacity breach, Group Benefits portal`, `ThousandEyes \xB7 Splunk \xB7 SD-WAN`, `Agent proposed`], [`P2`, `Config drift on leaf-14 conflicts with CHG-48211`, `Nexus Dashboard \xB7 ServiceNow`, `Awaiting CAB`], [`P2`, `Carrier diversity risk, Tampa`, `SD-WAN \xB7 NOAA`, `Playbook ready`]].map((e44) => `<div class="sh-act"><b class="pr">${e44[0]}</b><span>${e44[1]}</span><em>${e44[2]}</em><i>${e44[3]}</i></div>`).join(``)}
        <h6>Agents</h6>
        <div class="sh-agents">${[[`Ambient`, `Monitoring agent`, `Published v3.2`], [`Ambient`, `Diagnostic agent`, `Published v2.8`], [`Live`, `Remediation agent`, `Approval required`], [`Ambient`, `Learning agent`, `Published v1.9`]].map((e44) => `<div><em>${e44[0]}</em><b>${e44[1]}</b><span>${e44[2]}</span></div>`).join(``)}</div>
        <div class="sh-gov">Agents propose. Humans approve before anything changes in production. Policy enforced by Cisco AI Defense; every LLM and tool call traced in Splunk.</div>
      </div></div>`;
  }
}, $v = class extends Tv {
  id = `loop`;
  product = `cc`;
  title = `From signal to action`;
  status = `Closed-loop operations`;
  constructor() {
    super(), this.el.className = `pnl loop`, this.el.innerHTML = `<div class="lp-row">${[[`Spot trouble`, `Data Fabric and ThousandEyes`], [`Identify cause`, `Cross-domain agents`], [`Fix`, `Governed change, human approval`], [`Test before deploy`, `Digital twin, policy check`], [`Confirm recovery`, `ThousandEyes validation`]].map((e44, t2) => `<div class="lp-step" style="--i:${t2}"><b>${t2 + 1}</b><h6>${e44[0]}</h6><span>${e44[1]}</span></div>`).join(`<i class="lp-arrow"></i>`)}</div>`;
  }
}, ey = { nyc: { siteId: `nyc`, title: `The MetLife Building, 200 Park Avenue`, entity: `MetLife, Inc. global headquarters`, address: `200 Park Avenue, New York, NY 10166`, context: `manhattan`, buildings: [{ id: `metlife-building`, label: `MetLife Building`, shape: `octagon`, w: 9.2, d: 4.6, floors: 59, floorH: 0.417, x: 0, z: 0, metlife: [[3, 6]], heightVerified: true }], landmarks: [{ label: `G ...[TRUNC 21546]
| predict "p95(login.duration)" future_timespan=192
| join _time [| inputlookup enrollment_seasons.csv]`, a: `No. Login p95 is forecast to reach 9.1 s at T-0, past the 2 s SLO. The shared bottleneck is the auth token service plus WAN egress at North Greenbush.`, rows: [[`Login p95 (rehearsal)`, `1.5 s`, `+38%`], [`Forecast peak load`, `3.1x`, `T-0`], [`Egress at peak`, `97%`, `Breach`]], followups: [{ q: `Which employers are most exposed?`, a: `The ...[TRUNC 3668]
| join device [| nexus_intent_check change=CHG-48211]
| lookup app_dependencies device OUTPUT app business_service`, a: `The new ACL on the leaf pair, combined with undocumented drift on leaf-14, blocks database replication for policy administration. 41 applications depend on it.`, rows: [[`Change risk score`, `92`, `High`], [`Drift on leaf-14`, `3 lines`, `Unrecorded`], [`Apps in blast radius`, `41`, `Incl. claims intake`]], followups: [{ q: `Who ow ...[TRUNC 3630]
| geom circuits_tampa featureIdField=co_id
| join co_id [| search index=sdwan sourcetype=circuit_inventory site=TPA]
| stats count by carrier, flood_zone`, a: `Two of the three Tampa carrier circuits run through one central office inside the flood zone. If it floods, voice for the claims floor goes down just as call volume rises 6x.`, rows: [[`Circuits in flood zone`, `2 of 3`, `Shared CO`], [`Landfall forecast`, `84 h`, `Cat 3`], [`Claims call surge`, `6x`, `Forecast`]], followups: [{ q: `Can Noida absorb the o ...[TRUNC 3580]
| join session_id [| search index=te_endpoint]
| stats perc95(duration) count by isp, edge_pop`, a: `Tablets on one consumer ISP are seeing 7.8% packet loss at its Osaka peering toward the Secure Access edge. 18% of field tablets are affected, right before Monday's quarter-end push.`, rows: [[`Tablets affected`, `18%`, `One ISP`], [`E-sign p95`, `41 s`, `vs 6 s`], [`Quarter-end push`, `Monday`, `T-26 h`]], followups: [{ q: `Is it our app relea ...[TRUNC 3491]
| join trace_id [| search index=apm service="quote-api"]
| stats p99(duration_ms) as p99, count(eval(event="bind")) as binds by partner`, a: `All APIs return 200, but quote p99 for one e-wallet partner rose from 380 ms to 1.9 s. Their checkout gives up at 2 s, so binds are dropping without a single error.`, rows: [[`Quote p99 (partner)`, `1.9 s`, `Timeout 2 s`], [`HTTP success`, `99.9%`, `Green`], [`Quote-to-bind`, `-11%`, `Falling`]], followups: [{ q:  ...[TRUNC 3396]
| join job [| inputlookup batch_baselines.csv]
| eval ratio=duration/baseline | predict end_time`, a: `Not at the current pace. Job 14 is running 2.7x slower than its history, and the forecast misses the bank cutoff by about 3 hours. Every job still shows green in the scheduler.`, rows: [[`Job 14 runtime`, `2.7x`, `vs baseline`], [`Forecast end`, `09:00`, `Cutoff 06:00`], [`Retirees affected`, `~640k`, `Monthly run`]], followups: [{ q: `Why is ...[TRUNC 3322]
| predict availability future_timespan=72
| lookup ibs_map dependency OUTPUT ibs, tolerance_hours`, a: `Yes. ThousandEyes shows a steady decline at the third-party identity verification provider. If it fails, new retiree income payments stall and breach the 24-hour tolerance.`, rows: [[`Provider trend`, `-28%`, `18 h to outage`], [`Tolerance`, `24 h`, `Pay retirement income`], [`Status page`, `Minor`, `Understated`]], followups: [{ q: `Do ...[TRUNC 3587]
| join risk_object [| search index=duo action=push result=approved new_device=true]
| stats values(mitre_technique) sum(risk_score) by risk_object`, a: `Yes. A click on a targeted lure, an impossible-travel Duo approval from a new device and unusual SMB enumeration belong to one attack chain. Cisco XDR rates it a true positive with high confidence.`, rows: [[`Risk score`, `186`, `Critical`], [`MITRE techniques`, `4`, `T1566, T1078, T1135, T1021`], [`Users clicked`, `2 of 40`, `Cl ...[TRUNC 4134]
| join site [| search index=te_metrics test="Noida-US media"]
| predict mos future_timespan=40 | where mos < 3.6`, a: `Yes. Jitter on the media path from Noida to the U.S. voice cluster is rising, and MOS is forecast below 3.6 for the U.S. peak. That predicts repeat calls and longer handle times.`, rows: [[`Forecast MOS`, `3.1`, `Below 3.6`], [`Jitter`, `48 ms`, `Rising`], [`Queues at risk`, `6`, `U.S. peak`]], followups: [{ q: `Is it the network or Webex?`, ...[TRUNC 3378]
| join _time [| inputlookup market_calendar.csv]
| predict "max(buffer.util)" future_timespan=70`, a: `No. Five-minute averages look perfect, but sub-second telemetry shows buffers filling on the market data leaf. At announcement volume, packets will drop.`, rows: [[`Peak buffer (100 ms)`, `91%`, `Rising`], [`5-min average`, `23%`, `Looks fine`], [`Announcement`, `14:00`, `T-70 min`]], followups: [{ q: `What is sharing the uplink?`, a: `A new an ...[TRUNC 4149]
function sy(e44) {
  let t2 = ty[e44.id];
  return t2 ? `We drop inside to floor ${t2.floor}, ${t2.room.charAt(0).toLowerCase()}${t2.room.slice(1)}.` : ``;
}
function cy(e44) {
  return [ey[e44.siteId]?.intro ?? ``, sy(e44), e44.narration.briefing].filter(Boolean).join(` `);
}
function ly(e44) {
  return `${ay} ${e44.talkTrack.join(` `)}`;
}
var uy = (e44) => new Promise((t2) => setTimeout(t2, e44)), dy = (e44, t2 = 0, n2 = 1) => Math.min(n2, Math.max(t2, e44));
function fy(e44) {
  return e44 < -30 ? `Americas` : e44 < 60 ? `Europe, Middle East and Africa` : `Asia Pacific`;
}
new class {
  world;
  tl = new X_();
  chart;
  narrator = new rv();
  dock;
  stage = new kv();
  audio = new gv();
  game = new mv();
  mode = `explore`;
  steps = [];
  stepIdx = 0;
  run = 0;
  paused = false;
  scenario = null;
  choice = null;
  loc = { siteId: null, level: `globe` };
  cues = [];
  cueNext = 0;
  ctx = null;
  prevState = null;
  prevBranch = null;
  logKey = ``;
  lensFilter = null;
  resolvedToday = 1240 + Math.floor(Math.random() * 200);
  tooltip = Sv(`div`, `site-tip hidden`);
  params = new URLSearchParams(location.search);
  drillToken = 0;
  constructor() {
    this.world = new q_(Q(`#stage`), Q(`#labels`)), this.chart = new bv(Q(`#tlCanvas`), this.tl), this.dock = new wv(this.narrator), document.body.appendChild(this.tooltip), this.tl.onChange(() => this.applyWorld()), this.tl.onView((e45) => this.renderBranchToggle(e45)), this.chart.onScrub = (e45) => this.tl.scrub(e45), this.chart.onEvent = (e45) => this.openEvent(e45), this.chart.onHover = (e45, t3, n3) => this.eventTip(e45, t3, n3), this.stage.project = (e45) => e45 === `site` ? this.world.view === `local` ? this.world.project(`zone`) : this.scenario ? this.world.project(this.scenario.siteId) : { x: 0, y: 0, visible: false } : this.world.project(e45), this.narrator.onCaption = (e45) => this.dock.caption(e45), this.narrator.onSpeaking = (e45) => this.audio.setDucked(e45), this.narrator.onSentence = (e45, t3) => this.fireCues(t3 ? e45 / t3 : 1), this.narrator.onBlocked = () => this.toast(`Your browser blocked audio. Click anywhere to turn the narration voice on.`, 5e3), this.dock.onPlayPause = () => this.togglePause(), this.dock.onPrevSection = () => this.prev(), this.dock.onNextSection = () => this.next(), this.dock.onSkipEnd = () => this.next(), this.dock.beforeSeek = () => {
      this.paused && (this.setPaused(false), this.tl.resume());
    }, this.world.onSiteClick = (e45) => this.siteClick(e45), this.world.onSiteHover = (e45) => {
      if (!e45) return this.tooltip.classList.add(`hidden`);
      let t3 = lv.find((t4) => t4.siteId === e45.id), n3 = ey[e45.id];
      this.tooltip.innerHTML = `<b>${$(e45.city)}</b><span>${$(e45.name)}</span><em>${$(n3?.address ?? e45.role)}</em>${t3 ? `<i>${t3.code} | ${$(t3.title)}. Click to start.</i>` : n3 ? `<i>Click to walk into the building.</i>` : ``}`, this.tooltip.classList.remove(`hidden`);
    }, this.world.facility.onFloorHover = (e45) => {
      if (!e45) return this.tooltip.classList.add(`hidden`);
      this.tooltip.innerHTML = `<b>${$(e45.building)}</b><span>Floor ${e45.floor}</span><em>${$(e45.text)}</em>`, this.tooltip.classList.remove(`hidden`);
    }, this.world.onFloorClick = (e45, t3) => this.floorClick(e45, t3), window.addEventListener(`pointermove`, (e45) => {
      this.tooltip.style.transform = `translate(${e45.clientX + 16}px, ${e45.clientY + 12}px)`;
    }), this.game.onChange = () => this.renderHud(), this.game.onBadge = (e45) => {
      this.audio.cue(`badge`), this.toast(`Badge unlocked: <b>${$(e45.name)}</b>. ${$(e45.desc)}`, 4200);
    };
    let e44 = () => {
      this.audio.init(), this.narrator.unblock();
    };
    window.addEventListener(`pointerdown`, e44), window.addEventListener(`keydown`, e44), this.wireUi(), this.renderMissions(), this.renderHud(), this.buildTicker(), this.world.start(), this.world.setLayer(`all`), this.vantageLoop(), window.setInterval(() => this.ctx && this.stage.update(this.ctx), 250), window.setInterval(() => {
      let e45 = this.narrator;
      e45.active && !e45.isPaused && e45.total && this.fireCues((e45.index + e45.sentenceProgress) / e45.total);
    }, 150);
    let t2 = () => {
      let e45 = this.stage.root.getBoundingClientRect();
      e45.width > 0 && this.world.setCenter(e45.left + e45.width / 2, e45.top + e45.height / 2);
    };
    new ResizeObserver(t2).observe(this.stage.root), window.addEventListener(`resize`, t2), window.__app = this;
    let n2 = this.params.get(`voice`);
    n2 === `off` ? this.setVoice(false) : n2?.startsWith(`studio:`) && this.narrator.setVoice(n2);
    let r2 = this.params.get(`mode`);
    r2 && [`tour`, `explore`, `academy`].includes(r2) && this.begin(r2, this.params.get(`mission`) ?? void 0);
  }
  wireUi() {
    document.querySelectorAll(`[data-start]`).forEach((e45) => e45.addEventListener(`click`, () => this.begin(e45.dataset.start))), document.querySelectorAll(`#modeTabs button`).forEach((e45) => e45.addEventListener(`click`, () => this.setMode(e45.dataset.mode))), document.querySelectorAll(`#branchToggle button`).forEach((e45) => e45.addEventListener(`click`, () => {
      this.tl.setView(e45.dataset.branch), this.scenario && e45.dataset.branch === `compare` && this.game.compare(this.scenario.id);
    })), Q(`#playBtn`).addEventListener(`click`, () => this.togglePause()), Q(`#nextStep`).addEventListener(`click`, () => this.next()), Q(`#prevStep`).addEventListener(`click`, () => this.prev()), Q(`#overviewBtn`).addEventListener(`click`, () => this.playOverview()), Q(`#introReplay`).addEventListener(`click`, () => this.startIntroOnly()), Q(`#mpCollapse`).addEventListener(`click`, () => document.body.classList.toggle(`mp-collapsed`));
    let e44 = (e45) => {
      document.body.classList.toggle(`tl-folded`, e45);
      try {
        localStorage.setItem(`metlife-agenticops-tl`, e45 ? `folded` : `open`);
      } catch {
      }
    };
    try {
      localStorage.getItem(`metlife-agenticops-tl`) === `folded` && document.body.classList.add(`tl-folded`);
    } catch {
    }
    Q(`#tlFold`).addEventListener(`click`, () => e44(true)), Q(`#tlShow`).addEventListener(`click`, () => e44(false)), Q(`#ambientBtn`).addEventListener(`click`, () => {
      this.audio.init(), this.audio.setAmbient(!this.audio.ambientOn), Q(`#ambientBtn`).textContent = `Ambient: ${this.audio.ambientOn ? `On` : `Off`}`;
    }), Q(`#badgesBtn`).addEventListener(`click`, () => this.showBadges()), Q(`#modal`).addEventListener(`click`, (e45) => {
      e45.target === Q(`#modal`) && this.closeModal();
    }), window.addEventListener(`keydown`, (e45) => {
      let t3 = e45.target.tagName;
      t3 !== `SELECT` && t3 !== `INPUT` && t3 !== `TEXTAREA` && (e45.code === `Space` ? (e45.preventDefault(), this.togglePause()) : e45.code === `ArrowRight` ? e45.shiftKey ? this.next() : this.dock.skip(1) : e45.code === `ArrowLeft` ? e45.shiftKey ? this.prev() : this.dock.skip(-1) : e45.code === `PageDown` ? this.next() : e45.code === `PageUp` ? this.prev() : e45.code === `Escape` && (this.closeModal(), Q(`#voicePop`).classList.add(`hidden`)));
    });
    let t2 = Q(`#lensRow`);
    t2.innerHTML = `<button class="chip active" data-lens="">All functions</button>` + __.map((e45) => `<button class="chip" data-lens="${e45.id}" style="--c:${e45.color}">${$(e45.label)}</button>`).join(``), t2.querySelectorAll(`button`).forEach((e45) => e45.addEventListener(`click`, () => {
      this.lensFilter = e45.dataset.lens || null, t2.querySelectorAll(`button`).forEach((t3) => t3.classList.toggle(`active`, t3 === e45)), this.renderMissions(), lv.filter((e46) => !this.lensFilter || e46.lenses.includes(this.lensFilter)).forEach((e46, t3) => setTimeout(() => this.world.flash(e46.siteId, `#7fe7ff`), t3 * 120));
    }));
  }
  setVoice(e44) {
    this.narrator.setEnabled(e44);
  }
  begin(e44, t2) {
    this.audio.init(), Q(`#intro`).classList.add(`gone`), [`#topbar`, `#missionList`, `#missionPanel`, `#timeline`, `#ticker`, `#dock`, `#crumbs`].forEach((e45) => Q(e45).classList.remove(`hidden`)), this.setMode(e44, t2);
  }
  setMode(e44, t2) {
    if (this.mode = e44, document.querySelectorAll(`#modeTabs button`).forEach((t3) => t3.classList.toggle(`active`, t3.dataset.mode === e44)), document.body.dataset.mode = e44, e44 === `tour`) {
      this.steps = [...this.introSteps(), ...lv.flatMap((e46) => this.missionSteps(e46, `tour`)), this.finaleStep()];
      let e45 = t2 ? this.steps.findIndex((e46) => e46.scenario?.id === t2) : 0;
      this.goto(Math.max(0, e45));
    } else t2 && uv[t2] ? this.openMission(t2) : this.idleHome();
  }
  idleHome() {
    this.cancelRun(), this.scenario = null, this.ctx = null, this.stage.resetCtx(), this.stage.clear(), this.steps = [], this.dock.setSection(``), document.body.classList.remove(`directing`), this.world.resetSites(), this.world.clearFocus(), this.world.setLabelNote(null), this.world.setLayer(`all`), this.drill(null, `globe`).then(() => this.world.setIdleSpin(true)), Q(`#timeline`).classList.add(`empty`), document.body.classList.add(`no-mission`), Q(`#mpKicker`).textContent = this.mode === `academy` ? `Account Team Academy` : `Explore`, Q(`#mpTitle`).textContent = this.mode === `academy` ? `Learn the business connections` : `Choose a mission`, Q(`#mpSub`).textContent = ``, Q(`#mpTags`).innerHTML = ``, Q(`#mpSteps`).innerHTML = ``, Q(`#mpLog`).innerHTML = ``, Q(`#mpBody`).innerHTML = this.mode === `academy` ? `<p class="lead">Each Academy mission traces one path: <b>IT signal</b>, then <b>domain</b>, then <b>Cisco capability</b>, then <b>business KPI</b>, then <b>executive outcome</b>. After the walkthrough you get the talk track, discovery questions and a short quiz.</p><p>Choose a mission on the left, or click any glowing MetLife location on the globe.</p>` : `<p class="lead">Ten real MetLife locations. Ten business moments. At each one, a weak signal shows up long before the business would feel it.</p><p>Choose a mission on the left, or click a location on the globe to walk into the building. Make the call at the decision point and protect as much business value as you can.</p><p class="muted">Tip: drag to orbit, scroll to zoom. Space pauses; the arrow keys skip sentences and Shift plus an arrow key skips sections.</p>`, this.updateNav();
  }
  async drill(e44, t2) {
    let n2 = ++this.drillToken, r2 = e44 ? g_[e44] : null, i2 = e44 ? ey[e44] : void 0;
    r2 || (t2 = `globe`), (t2 === `site` || t2 === `building` || t2 === `floor`) && !i2 && (t2 = `city`);
    let a2 = this.scenario && this.scenario.siteId === e44 ? ty[this.scenario.id] ?? null : null;
    t2 === `floor` && !a2 && (t2 = `building`), t2 === `site` && i2 && i2.buildings.length < 2 && (t2 = `building`), this.loc = { siteId: r2 ? r2.id : null, level: t2 }, this.renderCrumbs(), this.world.setIdleSpin(false), t2 === `site` || t2 === `building` || t2 === `floor` ? (await this.world.enterFacility(i2, a2, t2), n2 === this.drillToken && this.world.setLocalState(this.ctx && a2 ? this.ctx.state : `idle`)) : (this.world.view === `local` && await this.world.exitFacility(t2 === `city` ? 2.2 : 3.2), n2 === this.drillToken && (t2 === `globe` ? await this.world.flyTo(22, -50, 3.7, 2.2) : t2 === `region` ? await this.world.flyTo(r2.lat - 6, r2.lon, 3.25, 2.2) : await this.world.focusSite(r2.id, 2.2, 2.2)));
  }
  renderCrumbs() {
    let { siteId: e44, level: t2 } = this.loc, n2 = e44 ? g_[e44] : null, r2 = e44 ? ey[e44] : void 0, i2 = this.scenario && this.scenario.siteId === e44 ? ty[this.scenario.id] : void 0, a2 = [{ label: `Globe`, lv: `globe` }];
    if (n2 && (a2.push({ label: fy(n2.lon), lv: `region` }), a2.push({ label: n2.city, lv: `city` }), r2)) {
      r2.buildings.length > 1 && a2.push({ label: r2.title, lv: `site` });
      let e45 = i2 ? r2.buildings.find((e46) => e46.id === i2.buildingId) : r2.buildings[0];
      a2.push({ label: e45?.label ?? r2.title, lv: `building` }), i2 && a2.push({ label: `Floor ${i2.floor}`, lv: `floor`, sub: i2.room });
    }
    let o2 = [`globe`, `region`, `city`, `site`, `building`, `floor`], s2 = o2.indexOf(t2);
    Q(`#crumbs`).innerHTML = a2.map((e45) => {
      let n3 = o2.indexOf(e45.lv);
      return `<button class="cr ${e45.lv === t2 ? `on` : n3 < s2 ? `up` : `down`}" data-lv="${e45.lv}">${$(e45.label)}${e45.sub && e45.lv === t2 ? `<em>${$(e45.sub)}</em>` : ``}</button>`;
    }).join(`<i>\u203A</i>`), Q(`#crumbs`).querySelectorAll(`button`).forEach((t3) => t3.addEventListener(`click`, () => void this.drill(e44, t3.dataset.lv)));
  }
  siteClick(e44) {
    let t2 = lv.find((t3) => t3.siteId === e44);
    if (t2 && (!this.scenario || this.scenario.id !== t2.id)) return this.openMission(t2.id);
    let n2 = ey[e44];
    if (n2) {
      this.drill(e44, this.scenario?.siteId === e44 ? `floor` : `building`);
      let t3 = this.stage.show(new Wv(n2, this.scenario?.siteId === e44 ? ty[this.scenario.id] ?? null : null), `ne`, { anchor: `building` });
      t3.onLevel = (t4) => void this.drill(t4 === `globe` ? null : e44, t4);
    } else this.toast(`${$(g_[e44].name)}: monitored by AgenticOps. No active mission here.`);
  }
  floorClick(e44, t2) {
    let n2 = this.loc.siteId ? ey[this.loc.siteId] : void 0;
    if (!n2) return;
    let r2 = n2.buildings.find((t3) => t3.id === e44), i2 = this.scenario && this.scenario.siteId === n2.siteId ? ty[this.scenario.id] : void 0;
    if (i2 && i2.buildingId === e44 && i2.floor === t2) {
      this.drill(n2.siteId, `floor`);
      return;
    }
    let a2 = r2?.metlife?.some(([e45, n3]) => t2 >= e45 && t2 <= n3);
    this.toast(`<b>${$(r2?.label ?? n2.title)}, floor ${t2}.</b> ${a2 ? `MetLife space, per public sources.` : `Not identified as MetLife space in public sources.`}${i2 ? ` This mission plays out on floor ${i2.floor}.` : ``}`, 3600);
  }
  show(e44, t2, n2) {
    return this.stage.show(e44, t2, { anchor: n2 });
  }
  facilityPanel(e44, t2 = `ne`) {
    let n2 = ey[e44.siteId];
    if (!n2) return;
    let r2 = this.show(new Wv(n2, ty[e44.id] ?? null), t2, `building`);
    r2.onLevel = (t3) => void this.drill(t3 === `globe` ? null : e44.siteId, t3);
  }
  globalPanel(e44, t2) {
    let n2 = this.show(new Jv(e44), t2);
    n2.onPick = (t3) => {
      ey[t3] ? this.drill(t3, e44?.siteId === t3 ? `floor` : `building`) : this.drill(t3, `city`);
    };
  }
  canvas(e44, t2 = `w`) {
    let n2 = this.show(new zv(ny[e44.id], e44), t2, `site`);
    return n2.onApprove = () => n2.beat(5), n2.onPick = (t3) => this.decide(e44, t3), n2;
  }
  assistant(e44, t2 = `sw`) {
    let n2 = this.show(new Bv(ny[e44.id], e44), t2);
    return n2.onCanvas = () => {
      this.stage.has(`canvas`) || this.canvas(e44, `w`).beat(1);
    }, n2;
  }
  signalPanel(e44, t2) {
    let n2 = ny[e44.id];
    return n2.security ? this.show(new Hv(n2), t2, `site`) : this.show(new Iv(n2), t2, `site`);
  }
  openEvent(e44) {
    let t2 = this.scenario;
    if (!t2) return;
    let n2 = ny[t2.id], r2 = yv(e44.source);
    r2 === `te` ? this.show(new Rv(n2), `nw`, `site`) : r2 === `splunk` ? this.show(new Iv(n2), `ne`, `site`) : r2 === `cc` ? (this.stage.get(`canvas`) ?? this.canvas(t2, `w`)).beat(e44.t >= t2.agentRemediate ? 6 : e44.t >= t2.agentDetect ? 4 : 1) : r2 === `xdr` ? this.signalPanel(t2, `ne`) : e44.branch === `traditional` ? this.show(new Vv(n2, t2), `nw`, `site`) : this.show(new Uv(t2), `se`), this.tl.playing || this.tl.scrub(e44.t);
    let i2 = vv.find((e45) => e45.id === r2);
    this.toast(`<b style="color:${i2.color}">${$(e44.source)}</b> ${$(this.tl.format(e44.t))}: ${$(e44.text)}`, 3600);
  }
  eventTip(e44, t2, n2) {
    let r2 = Q(`#evTip`);
    if (!e44) return r2.classList.add(`hidden`);
    let i2 = vv.find((t3) => t3.id === yv(e44.source));
    r2.innerHTML = `<b style="color:${i2.color}">${$(e44.source)}</b><span>${$(this.tl.format(e44.t))} \xB7 ${e44.branch === `agentic` ? `AgenticOps` : `Traditional`}</span><p>${$(e44.text)}</p><em>Click to open ${$(i2.label)}</em>`, r2.style.left = `${t2}px`, r2.style.top = `${n2}px`, r2.classList.remove(`hidden`);
  }
  introSteps() {
    let e44 = [() => [[0, () => this.show(new Yv(), `ne`)]], () => [[0, () => this.show(new Xv(), `ne`)]], () => [[0, () => this.show(new Zv(), `n`)]], () => [[0.2, () => this.show(new qv(), `s`)]], () => [[0, () => this.show(new Qv(), `n`)], [0.5, () => this.show(new $v(), `s`)]], () => [[0.3, () => this.globalPanel(null, `ne`)]]];
    return av.map((t2, n2) => {
      let r2 = { id: `intro-${n2}`, label: t2.short, title: t2.title, narration: t2.text, scenario: null, wait: `auto`, enter: async (i2) => {
        this.scenario = null, this.ctx = null, this.stage.resetCtx(), this.stage.clear(), r2.cues = e44[n2](i2), Q(`#timeline`).classList.add(`empty`), this.world.resetSites(), this.world.clearFocus(), this.world.view === `local` && await this.world.exitFacility(3.4), this.loc = { siteId: null, level: `globe` }, this.renderCrumbs(), this.world.setLayer(t2.layer), t2.layer === `agents` && lv.forEach((e45, t3) => setTimeout(() => this.world.flash(e45.siteId), t3 * 180)), await this.world.flyTo(t2.cam.lat, t2.cam.lon, t2.cam.dist, 3.2);
      }, render: () => `<p class="lead">${$(t2.text)}</p>${n2 === av.length - 1 ? this.legendHtml() : ``}` };
      return r2;
    });
  }
  legendHtml() {
    return `<div class="legend">
      <div><span class="sw" style="--c:#3fb6ff"></span>MetLife location, healthy</div>
      <div><span class="sw" style="--c:#ffb020"></span>Weak signal detected by an agent</div>
      <div><span class="sw" style="--c:#ff3b4f"></span>Business impact and blast radius</div>
      <div><span class="sw" style="--c:#7cf29c"></span>Protected by AgenticOps</div>
      <div><span class="sw line" style="--c:#2fb4ff"></span>Data Fabric telemetry</div>
      <div><span class="sw ring" style="--c:#7fe7ff"></span>Cisco Cloud Control vantage layer</div>
    </div>`;
  }
  finaleStep() {
    return { id: `finale`, label: `Close`, title: `The vantage point, everywhere`, narration: ov, scenario: null, wait: `manual`, cues: [[0, () => this.globalPanel(null, `ne`)], [0.4, () => this.show(new qv(), `s`)]], enter: async () => {
      this.scenario = null, this.ctx = null, this.stage.resetCtx(), this.stage.clear(), Q(`#timeline`).classList.add(`empty`), this.world.clearFocus(), this.world.setLayer(`all`), lv.forEach((e44) => this.world.setSiteState(e44.siteId, `protected`)), await this.drill(null, `globe`), await this.world.flyTo(28, -30, 4.6, 3), this.world.setIdleSpin(true);
    }, render: () => {
      let e44 = lv.reduce((e45, t2) => e45 + t2.exposure, 0);
      return `<p class="lead">${$(ov)}</p>
          <div class="big-number"><span>${hv(e44)}</span><label>modeled business value protected across 10 missions</label></div>
          <table class="kpi"><thead><tr><th>Mission</th><th>Business outcome</th><th>Value</th></tr></thead><tbody>
          ${lv.map((e45) => `<tr><td>${e45.code} ${$(e45.subtitle.split(`|`)[0])}</td><td>${$(e45.chain.outcome)}</td><td>${hv(e45.exposure)}</td></tr>`).join(``)}
          </tbody></table>
          <div class="row-btns"><button class="btn" data-act="explore">Explore missions</button><button class="btn ghost" data-act="academy">Open Academy</button></div>`;
    }, after: () => {
      document.querySelectorAll(`#mpBody [data-act]`).forEach((e44) => e44.addEventListener(`click`, () => this.setMode(e44.dataset.act)));
    } };
  }
  tradCues(e44) {
    let t2 = ny[e44.id];
    return [[0, () => this.show(new Vv(t2, e44), `nw`, `site`)], [0.34, () => {
      this.drill(e44.siteId, `region`), this.globalPanel(e44, `ne`);
    }], [0.67, () => this.show(new Uv(e44), `se`, e44.siteId)]];
  }
  agentCues(e44, t2 = false) {
    let n2 = null, r2 = () => n2 = n2 && this.stage.get(`canvas`) === n2 ? n2 : this.canvas(e44, `w`);
    return [[0, () => r2().beat(t2 ? 4 : 0)], [0.14, () => r2().beat(1)], [0.28, () => {
      r2().beat(2), this.signalPanel(e44, `ne`);
    }], [0.46, () => r2().beat(3)], [0.62, () => {
      r2().beat(4), this.show(new Rv(ny[e44.id]), `se`, `site`);
    }], [0.78, () => r2().beat(5)]];
  }
  missionSteps(e44, t2) {
    let n2 = e44.narration, r2 = ny[e44.id], i2 = ey[e44.siteId], a2 = [], o2 = (e45, t3 = 7) => Math.max(t3, this.narrator.estimate(e45) * 0.92);
    t2 !== `tour` && a2.push({ id: `overview`, label: `Overview`, title: `Audio overview`, narration: n2.overview, scenario: e44, wait: `auto`, cues: [[0, () => this.facilityPanel(e44, `ne`)], [0.3, () => this.globalPanel(e44, `nw`)], [0.6, () => this.show(new qv(e44), `s`)]], enter: async () => {
      this.stage.clear(), this.tl.setView(`compare`), this.tl.scrub(e44.range[0]), this.world.resetSites(), this.world.setLayer(`all`), await this.drill(e44.siteId, `city`);
    }, render: () => `<p class="lead">${$(n2.overview)}</p>${this.chainHtml(e44)}` });
    let s2 = cy(e44), c2 = Q_(s2).length || 1, l2 = i2 ? Q_(i2.intro).length : 0;
    if (a2.push({ id: `briefing`, label: `Briefing`, title: `Mission briefing`, narration: s2, scenario: e44, wait: `auto`, cues: [[0, () => this.facilityPanel(e44, `ne`)], [l2 / c2, () => void this.drill(e44.siteId, `floor`)], [(l2 + 1) / c2, () => this.show(new qv(e44), `sw`)], [Math.min(0.95, (l2 + 2) / c2), () => this.show(new Uv(e44), `nw`, `site`)]], enter: async () => {
      this.stage.clear([`facility`]), this.tl.setView(`compare`), this.tl.scrub(e44.range[0]), this.world.resetSites(), this.world.setLayer(`all`), await this.drill(e44.siteId, i2 && i2.buildings.length > 1 ? `site` : `building`);
    }, render: () => `
        <p class="lead">${$(n2.briefing)}</p>
        ${i2 ? `<div class="card"><h4>Where it happens</h4><p><b>${$(i2.title)}</b>, ${$(i2.address)}</p>${ty[e44.id] ? `<p class="muted">Floor ${ty[e44.id].floor}: ${$(ty[e44.id].room)}. ${$(ty[e44.id].basis)}</p>` : ``}</div>` : ``}
        <div class="card"><h4>Known industry challenge</h4><p>${$(e44.industryChallenge)}</p></div>
        <div class="card"><h4>New Frontier priority at stake</h4><p class="pillar">${$(e44.pillar)}</p></div>
        <div class="card"><h4>Data Fabric sources joined</h4><ul class="src">${e44.signals.map((e45) => `<li>${$(e45)}</li>`).join(``)}</ul></div>` }), a2.push({ id: `signal`, label: `Signal`, title: `The weak signal`, narration: n2.signal, scenario: e44, wait: `auto`, cues: r2.security ? [[0, () => this.show(new Hv(r2), `nw`, `site`)], [0.25, () => this.show(new Iv(r2), `ne`, `site`)], [0.5, () => this.assistant(e44, `sw`).beat(0)], [0.8, () => this.stage.beat(`assistant`, 1)]] : [[0, () => this.show(new Rv(r2), `nw`, `site`)], [0.25, () => this.show(new Iv(r2), `ne`, `site`)], [0.5, () => this.assistant(e44, `sw`).beat(0)], [0.8, () => this.stage.beat(`assistant`, 1)]], enter: async (t3) => {
      this.stage.clear(), this.tl.setView(`agentic`), this.tl.scrub(e44.range[0]), this.drill(e44.siteId, `floor`), await this.tl.playTo(e44.agentDetect + (e44.agentRemediate - e44.agentDetect) * 0.3, o2(n2.signal, 6) * 0.7), t3 === this.run && this.world.view === `globe` && this.world.scan(e44.siteId);
    }, render: () => `
        <p class="lead">${$(n2.signal)}</p>
        <div class="callout"><span>Agent lead time before business impact</span><b>${$(this.tl.scenario === e44 ? this.tl.formatLead() : `${e44.impact - e44.agentDetect}${e44.unit}`)}</b></div>
        <div class="card"><h4>Metric that matters</h4><p>${$(e44.metricName)}</p></div>` }), t2 === `explore`) {
      a2.push({ id: `decision`, label: `Decision`, title: `Make the call`, narration: e44.decision.prompt, scenario: e44, wait: `manual`, cues: [[0, () => {
        let t4 = this.canvas(e44, `w`);
        t4.beat(4), t4.setDecision(e44.decision.options, null);
      }], [0.3, () => this.signalPanel(e44, `ne`)]], enter: async () => {
        this.choice = null, this.tl.stop(), this.stage.clear(), await this.drill(e44.siteId, `floor`);
      }, render: () => `
          <p class="lead">${$(e44.decision.prompt)}</p>
          <div class="options">${e44.decision.options.map((e45, t4) => `<button class="option" data-opt="${t4}"><b>${$(e45.label)}</b><span>${$(e45.detail)}</span></button>`).join(``)}</div>
          <div class="feedback" id="feedback"></div>`, after: () => {
        document.querySelectorAll(`#mpBody [data-opt]`).forEach((t4) => t4.addEventListener(`click`, () => this.decide(e44, Number(t4.dataset.opt)))), this.updateNav();
      } });
      let t3 = (t4) => {
        let r3 = () => t4 === ((this.choice?.quality ?? `best`) === `best`) ? `agentic` : `traditional`, i3 = { id: t4 ? `consequence` : `counterfactual`, label: t4 ? `Your outcome` : `Other timeline`, title: t4 ? `Your outcome` : `The other timeline`, narration: ``, scenario: e44, wait: `auto`, enter: async () => {
          let a3 = r3();
          i3.title = a3 === `agentic` ? `The AgenticOps timeline` : `The traditional IT timeline`, i3.narration = (t4 ? `${this.choice?.feedback ?? ``} ` : `${iy} `) + (a3 === `agentic` ? n2.agentic : n2.traditional), i3.cues = a3 === `agentic` ? this.agentCues(e44, t4) : this.tradCues(e44), this.stage.clear(), a3 === `agentic` && this.drill(e44.siteId, `floor`), await this.playBranch(e44, a3, o2(i3.narration, 9)), t4 || this.game.compare(e44.id);
        }, render: () => i3.narration ? `<p class="lead">${$(i3.narration)}</p>${this.branchSummary(e44, r3())}` : `` };
        return i3;
      };
      a2.push(t3(true), t3(false));
    } else a2.push({ id: `traditional`, label: `Traditional`, title: `Timeline A: traditional IT`, narration: n2.traditional, scenario: e44, wait: `auto`, cues: this.tradCues(e44), enter: async () => {
      this.stage.clear(), await this.playBranch(e44, `traditional`, o2(n2.traditional, 9));
    }, render: () => `<p class="lead">${$(n2.traditional)}</p>${this.branchSummary(e44, `traditional`)}` }), a2.push({ id: `agentic`, label: `AgenticOps`, title: `Timeline B: AgenticOps`, narration: n2.agentic, scenario: e44, wait: `auto`, cues: this.agentCues(e44), enter: async () => {
      this.stage.clear(), this.drill(e44.siteId, `floor`), await this.playBranch(e44, `agentic`, o2(n2.agentic, 9));
    }, render: () => `<p class="lead">${$(n2.agentic)}</p>${this.branchSummary(e44, `agentic`)}` });
    return a2.push({ id: `outcome`, label: `Outcome`, title: `Business outcome`, narration: n2.outcome, scenario: e44, wait: t2 === `explore` ? `manual` : `auto`, cues: [[0, () => this.show(new Uv(e44), `ne`, e44.siteId)], [0.3, () => this.globalPanel(e44, `nw`)], [0.6, () => this.show(new qv(e44), `s`)]], enter: async () => {
      this.stage.clear(), this.tl.setView(`compare`), this.tl.scrub(e44.range[1]);
      let n3 = t2 === `explore` ? this.choice?.quality ?? `poor` : `best`, r3 = this.game.complete(e44, n3);
      this.floatXp(r3.xp, r3.value), this.renderMissions(), await this.drill(e44.siteId, `region`), this.world.setSiteState(e44.siteId, `protected`), this.world.setIncident(e44.siteId, `protected`, 0.16), this.world.setBlast(null, []), this.world.shockwave(e44.siteId);
    }, render: () => this.outcomeHtml(e44, t2), after: () => {
      document.querySelectorAll(`#mpBody [data-act]`).forEach((t3) => t3.addEventListener(`click`, () => {
        let n3 = t3.dataset.act;
        n3 === `replay` ? this.openMission(e44.id) : n3 === `next` ? this.openMission(this.nextMissionId(e44.id)) : n3 === `home` && this.idleHome();
      }));
    } }), t2 === `academy` && (a2.push({ id: `connect`, label: `Connections`, title: `Connect IT to the business`, narration: ly(e44), scenario: e44, wait: `manual`, cues: [[0, () => this.show(new qv(e44), `s`)], [0.5, () => this.show(new Uv(e44), `ne`)]], enter: async () => {
      this.stage.clear(), this.tl.setView(`compare`), this.tl.scrub(e44.range[1]);
    }, render: () => `
          ${this.chainHtml(e44, true)}
          <div class="card"><h4>Talk track</h4><ol>${e44.talkTrack.map((e45) => `<li>${$(e45)}</li>`).join(``)}</ol></div>
          <div class="card"><h4>Discovery questions to ask</h4><ul class="q">${e44.discovery.map((e45) => `<li>${$(e45)}</li>`).join(``)}</ul></div>
          <div class="card"><h4>Cisco and Splunk capabilities in play</h4><div class="chips">${e44.products.map((e45) => `<span class="pchip">${$(e45)}</span>`).join(``)}</div></div>` }), a2.push({ id: `quiz`, label: `Quiz`, title: `Check your understanding`, narration: oy, scenario: e44, wait: `manual`, enter: async () => {
      this.stage.clear(), this.tl.setView(`compare`), this.tl.scrub(e44.range[1]);
    }, render: () => `<div class="quiz">${e44.quiz.map((e45, t3) => `<div class="qz" data-q="${t3}"><p><b>Q${t3 + 1}.</b> ${$(e45.q)}</p>${e45.options.map((e46, n3) => `<button class="qopt" data-q="${t3}" data-o="${n3}">${$(e46)}</button>`).join(``)}<div class="why"></div></div>`).join(``)}</div><div class="quiz-score" id="quizScore"></div>
            <div class="row-btns"><button class="btn" data-act="next">Next mission</button><button class="btn ghost" data-act="home">All missions</button></div>`, after: () => this.wireQuiz(e44) })), a2;
  }
  nextMissionId(e44) {
    return lv[(lv.findIndex((t2) => t2.id === e44) + 1) % lv.length].id;
  }
  async playBranch(e44, t2, n2) {
    this.tl.setView(t2), this.world.resetSites();
    let r2 = t2 === `traditional` ? e44.range[0] + (e44.agentDetect - e44.range[0]) * 0.4 : e44.range[0] + (e44.agentDetect - e44.range[0]) * 0.6;
    this.tl.scrub(r2), this.world.view === `globe` && this.world.focusSite(e44.siteId, t2 === `traditional` ? 3.1 : 2.35, 2.2);
    let i2 = t2 === `agentic` ? [[e44.agentRemediate, 0.66], [e44.range[1], 0.34]] : [[e44.impact, 0.3], [e44.tradRecover, 0.55], [e44.range[1], 0.15]], a2 = this.run;
    for (let [e45, t3] of i2) {
      if (a2 !== this.run) return;
      e45 > this.tl.t && await this.tl.playTo(e45, n2 * t3);
    }
  }
  openMission(e44) {
    let t2 = uv[e44];
    if (t2) {
      if (this.mode === `tour`) {
        let t3 = this.steps.findIndex((t4) => t4.scenario?.id === e44);
        if (t3 >= 0) return void this.goto(t3);
      }
      this.steps = this.missionSteps(t2, this.mode), this.goto(0);
    }
  }
  cancelRun() {
    this.run++, this.narrator.cancel(), this.tl.stop(), this.setPaused(false);
  }
  fireCues(e44) {
    for (; this.cueNext < this.cues.length && this.cues[this.cueNext][0] <= e44 + 1e-6; ) {
      let e45 = this.cues[this.cueNext++][1];
      try {
        e45();
      } catch (e46) {
        console.error(e46);
      }
    }
  }
  async goto(e44) {
    if (e44 < 0 || e44 >= this.steps.length) return;
    this.cancelRun();
    let t2 = this.run;
    this.stepIdx = e44;
    let n2 = this.steps[e44];
    this.world.setIdleSpin(false), document.body.classList.add(`directing`), n2.scenario && n2.scenario !== this.scenario && this.loadScenario(n2.scenario), n2.scenario || this.renderIntroHeader(n2.id === `finale`), this.refreshPanel(n2);
    let r2 = n2.enter(t2);
    this.refreshPanel(n2), this.cues = [...n2.cues ?? []].sort((e45, t3) => e45[0] - t3[0]), this.cueNext = 0;
    let i2 = n2.scenario;
    this.dock.setSection(i2 ? `${i2.code} \xB7 ${n2.title}` : n2.title);
    let a2 = this.narrator.speak(n2.narration);
    if (n2.narration || this.fireCues(1), await Promise.all([r2, a2]), t2 === this.run && (this.fireCues(1), this.updateNav(true), n2.wait === `auto`)) {
      for (await uy(1400); this.paused && t2 === this.run; ) await uy(200);
      t2 === this.run && this.next();
    }
  }
  refreshPanel(e44) {
    Q(`#mpBody`).innerHTML = `<h3 class="step-title">${$(e44.title)}</h3>${e44.render()}`, Q(`#mpBody`).scrollTop = 0, e44.after?.(), this.renderStepDots(), this.updateNav();
  }
  next() {
    let e44 = this.steps[this.stepIdx];
    e44 && (e44.id === `decision` && !this.choice ? this.toast(`Make the call first. Pick one of the options on the AI Canvas.`) : this.stepIdx + 1 < this.steps.length ? this.goto(this.stepIdx + 1) : this.mode === `tour` ? this.setMode(`explore`) : this.scenario && this.openMission(this.nextMissionId(this.scenario.id)));
  }
  prev() {
    this.stepIdx > 0 && this.goto(this.stepIdx - 1);
  }
  togglePause() {
    this.steps.length && (this.setPaused(!this.paused), this.paused ? (this.narrator.pause(), this.tl.pause()) : (this.narrator.resume(), this.tl.resume()));
  }
  setPaused(e44) {
    this.paused = e44, Q(`#playBtn`).textContent = e44 ? `Resume` : `Pause`, document.body.classList.toggle(`paused`, e44), this.dock.setPaused(e44);
  }
  playOverview() {
    let e44 = this.scenario;
    if (!e44) {
      this.toast(`Choose a mission to hear its audio overview.`);
      return;
    }
    if (this.mode !== `tour`) {
      let e45 = this.steps.findIndex((e46) => e46.id === `overview`);
      if (e45 >= 0) return void this.goto(e45);
    }
    let t2 = this.stepIdx;
    this.cancelRun();
    let n2 = this.run;
    Q(`#mpBody`).innerHTML = `<h3 class="step-title">Audio overview</h3><p class="lead">${$(e44.narration.overview)}</p>${this.chainHtml(e44)}`, this.dock.setSection(`${e44.code} \xB7 Audio overview`), this.narrator.speak(e44.narration.overview).then((e45) => {
      e45 && n2 === this.run && this.goto(t2);
    });
  }
  startIntroOnly() {
    if (this.mode !== `tour`) {
      this.steps = [...this.introSteps()];
      let e44 = this.steps[this.steps.length - 1];
      e44.wait = `manual`;
      let t2 = e44.after;
      e44.render = () => `<p class="lead">${$(av[av.length - 1].text)}</p>${this.legendHtml()}<div class="row-btns"><button class="btn" data-act="home">Choose a mission</button></div>`, e44.after = () => {
        t2?.(), document.querySelector(`#mpBody [data-act="home"]`)?.addEventListener(`click`, () => this.idleHome());
      };
    }
    this.goto(0);
  }
  decide(e44, t2) {
    if (this.choice) return;
    let n2 = e44.decision.options[t2];
    if (!n2) return;
    this.choice = n2, document.querySelectorAll(`#mpBody .option`).forEach((e45) => e45.classList.add(`locked`)), document.querySelector(`#mpBody [data-opt="${t2}"]`)?.classList.add(n2.quality);
    let r2 = e44.decision.options.findIndex((e45) => e45.quality === `best`);
    document.querySelector(`#mpBody [data-opt="${r2}"]`)?.classList.add(`best-mark`);
    let i2 = document.querySelector(`#feedback`);
    i2 && (i2.className = `feedback ${n2.quality}`, i2.innerHTML = `<b>${n2.quality === `best` ? `Great call.` : n2.quality === `partial` ? `Partial save.` : `Business impact ahead.`}</b> ${$(n2.feedback)}`), this.stage.get(`canvas`)?.setDecision(e44.decision.options, t2), this.audio.cue(n2.quality === `best` ? `good` : n2.quality === `partial` ? `warn` : `crit`), this.narrator.cancel(), this.updateNav(true);
    let a2 = this.run;
    setTimeout(() => {
      a2 === this.run && this.next();
    }, 2600);
  }
  wireQuiz(e44) {
    let t2 = /* @__PURE__ */ new Map();
    document.querySelectorAll(`#mpBody .qopt`).forEach((n2) => n2.addEventListener(`click`, () => {
      let r2 = Number(n2.dataset.q);
      if (t2.has(r2)) return;
      let i2 = Number(n2.dataset.o), a2 = e44.quiz[r2], o2 = i2 === a2.answer;
      t2.set(r2, o2);
      let s2 = n2.closest(`.qz`);
      if (s2.querySelectorAll(`.qopt`).forEach((e45, t3) => {
        e45.classList.add(`locked`), t3 === a2.answer && e45.classList.add(`right`);
      }), o2 || n2.classList.add(`wrong`), s2.querySelector(`.why`).innerHTML = `${o2 ? `Correct.` : `Not quite.`} ${$(a2.why)}`, this.audio.cue(o2 ? `good` : `warn`), t2.size === e44.quiz.length) {
        let n3 = [...t2.values()].filter(Boolean).length;
        this.game.quiz(e44.id, n3, e44.quiz.length), Q(`#quizScore`).innerHTML = `Score: <b>${n3}/${e44.quiz.length}</b>. +${n3 * 30} XP`, this.renderMissions();
      }
    })), document.querySelectorAll(`#mpBody [data-act]`).forEach((t3) => t3.addEventListener(`click`, () => t3.dataset.act === `next` ? this.openMission(this.nextMissionId(e44.id)) : this.idleHome()));
  }
  loadScenario(e44) {
    document.body.classList.remove(`no-mission`), this.scenario = e44, this.choice = null, this.prevState = null, this.prevBranch = null, this.logKey = ``, this.stage.resetCtx(), Q(`#mpLog`).innerHTML = ``, Q(`#timeline`).classList.remove(`empty`), this.tl.load(e44);
    let t2 = g_[e44.siteId];
    Q(`#mpKicker`).textContent = `${e44.code} | ${t2.city}, ${t2.country}`, Q(`#mpTitle`).textContent = e44.title, Q(`#mpSub`).textContent = e44.subtitle, Q(`#mpTags`).innerHTML = e44.lenses.map((e45) => {
      let t3 = __.find((t4) => t4.id === e45);
      return `<span class="tag" style="--c:${t3.color}">${$(t3.label)}</span>`;
    }).join(``), Q(`#tlMetric`).innerHTML = ``, this.renderMissions();
  }
  renderIntroHeader(e44 = false) {
    document.body.classList.add(`no-mission`), this.world.setLabelNote(null), Q(`#mpKicker`).textContent = e44 ? `Close | Ten missions, one pattern` : `Opening | The change in network operations`, Q(`#mpTitle`).textContent = e44 ? `Business outcomes, everywhere` : `From IT signals to business outcomes`, Q(`#mpSub`).textContent = `Cisco Cloud Control, AgenticOps and the Cisco Data Fabric`, Q(`#mpTags`).innerHTML = ``, Q(`#mpLog`).innerHTML = ``;
  }
  applyWorld() {
    let e44 = this.scenario;
    if (!e44 || this.tl.scenario !== e44) return;
    let t2 = this.tl.t, n2 = this.tl.view, r2 = n2 === `compare` ? `agentic` : n2, i2 = this.tl.siteState(r2, t2);
    if (r2 !== this.prevBranch && (this.prevState = null, this.world.setBlast(null, []), e44.blast.forEach((e45) => this.world.setSiteState(e45, `idle`)), this.world.setBeam(null), this.world.releaseAgent(), this.world.setIncident(null)), i2 !== this.prevState) {
      this.world.setSiteState(e44.siteId, i2), this.world.view === `local` && this.loc.siteId === e44.siteId && this.world.setLocalState(i2);
      let t3 = this.prevState !== null;
      switch (i2) {
        case `idle`:
          this.world.setIncident(null), this.world.setBlast(null, []), this.world.setBeam(null), e44.blast.forEach((e45) => this.world.setSiteState(e45, `idle`));
          break;
        case `signal`:
          this.world.setIncident(e44.siteId, `warning`, 0.08);
          break;
        case `critical`:
          this.world.setIncident(e44.siteId, `critical`, 0.34), this.world.setBlast(e44.siteId, e44.blast), e44.blast.forEach((e45) => this.world.setSiteState(e45, `critical`)), t3 && this.audio.cue(`crit`);
          break;
        case `recovering`:
          this.world.setIncident(e44.siteId, `warning`, 0.2), this.world.setBlast(null, []), e44.blast.forEach((e45) => this.world.setSiteState(e45, `recovering`));
          break;
        case `warning`:
          this.world.setIncident(e44.siteId, `warning`, 0.14), this.world.setBeam(e44.siteId), t3 && (this.world.view === `globe` && this.world.scan(e44.siteId), this.audio.cue(`warn`));
          break;
        case `protected`:
          this.world.setBeam(null), this.world.releaseAgent(), this.world.setIncident(e44.siteId, `protected`, 0.16), e44.blast.forEach((e45) => this.world.setSiteState(e45, `idle`)), t3 && (this.world.shockwave(e44.siteId), this.audio.cue(`good`));
      }
      this.prevState = i2;
    }
    this.prevBranch = r2;
    let a2 = { idle: t2 < e44.impact ? `Normal operations` : `Recovered`, signal: `Unseen weak signal`, warning: `Agent acting`, critical: `Business impact`, recovering: `Recovering`, protected: `Protected` };
    this.world.setLabelNote(e44.siteId, `${this.tl.format(t2)} | ${a2[i2]}`);
    let o2 = e44.unit === `h` ? t2 : t2 / 60;
    this.world.setSun(g_[e44.siteId].lon + 30 - o2 * 15), Q(`#tlClock`).textContent = this.tl.format(t2);
    let s2 = this.tl.metric(`traditional`, t2), c2 = this.tl.metric(`agentic`, t2), l2 = n2 !== `agentic`, u2 = n2 !== `traditional`;
    Q(`#tlMetric`).innerHTML = `<span class="m-name">${$(e44.metricName)}</span>${l2 ? `<span class="m-val trad">Traditional ${s2.toFixed(0)}</span>` : ``}${u2 ? `<span class="m-val agent">AgenticOps ${c2.toFixed(0)}</span>` : ``}${l2 && t2 > e44.impact ? `<span class="m-val exp">Exposure ${hv(this.tl.exposureAt(t2))}</span>` : ``}`;
    let d2 = (e45, t3) => dy((100 - this.tl.metric(e45, t3)) / 60), f2 = d2(r2, t2), p2 = Math.max(e44.unit === `h` ? 0.5 : 30, (e44.impact - e44.agentDetect) * 0.6), m2 = r2 === `agentic` && i2 === `warning` ? Math.max(f2, d2(`traditional`, t2 + p2)) : f2;
    this.ctx = { t: t2, view: n2, branch: r2, state: i2, h: f2, hPred: m2, s: e44, v: ny[e44.id], tl: this.tl }, this.stage.update(this.ctx), this.renderLog(r2 === `agentic` && n2 === `compare` ? this.tl.events(`agentic`, t2) : this.tl.events(r2, t2), r2), this.chart.draw();
  }
  renderLog(e44, t2) {
    let n2 = `${t2}:${e44.length}`;
    if (n2 === this.logKey) return;
    let r2 = this.logKey;
    this.logKey = n2;
    let [i2, a2] = r2.split(`:`), o2 = i2 === t2 && Number(a2) < e44.length, s2 = Q(`#mpLog`);
    s2.innerHTML = e44.slice().reverse().map((e45, t3) => {
      let n3 = vv.find((t4) => t4.id === yv(e45.source));
      return `<div class="log-row ${e45.sev} ${o2 && t3 === 0 ? `new` : ``}"><span class="lt">${this.tl.format(e45.t)}</span><span class="ls" style="--lc:${n3.color}">${$(e45.source)}</span><span class="lx">${$(e45.text)}</span></div>`;
    }).join(``), o2 && e44.length && e44[e44.length - 1].sev === `info` && this.audio.cue(`info`);
  }
  renderBranchToggle(e44) {
    document.querySelectorAll(`#branchToggle button`).forEach((t2) => t2.classList.toggle(`active`, t2.dataset.branch === e44));
  }
  renderStepDots() {
    let e44 = this.steps[this.stepIdx]?.scenario ?? null, t2 = this.steps.map((e45, t3) => ({ x: e45, i: t3 })).filter(({ x: t3 }) => t3.scenario === e44);
    Q(`#mpSteps`).innerHTML = t2.map(({ x: e45, i: t3 }) => `<button class="sdot ${t3 === this.stepIdx ? `on` : t3 < this.stepIdx ? `done` : ``}" data-i="${t3}" title="${$(e45.title)}">${$(e45.label)}</button>`).join(``), Q(`#mpSteps`).querySelectorAll(`button`).forEach((e45) => e45.addEventListener(`click`, () => void this.goto(Number(e45.dataset.i))));
  }
  updateNav(e44 = false) {
    let t2 = this.steps[this.stepIdx], n2 = Q(`#nextStep`), r2 = Q(`#prevStep`);
    r2.disabled = !t2 || this.stepIdx === 0, n2.disabled = !t2 || t2.id === `decision` && !this.choice, n2.classList.toggle(`pulse`, e44 && !!t2 && t2.wait === `manual`), n2.textContent = t2 && this.stepIdx === this.steps.length - 1 ? this.mode === `tour` ? `Done` : `Next mission` : `Next`;
  }
  renderMissions() {
    let e44 = this.game.s.missions, t2 = lv.filter((e45) => !this.lensFilter || e45.lenses.includes(this.lensFilter));
    Q(`#missions`).innerHTML = t2.map((t3) => {
      let n2 = e44[t3.id], r2 = this.game.s.quizzes[t3.id], i2 = n2 ? n2.quality === `best` ? `Protected` : n2.quality === `partial` ? `Partial` : `Impacted` : `Not started`;
      return `<button class="mission ${this.scenario?.id === t3.id ? `active` : ``} ${n2 ? n2.quality : ``}" data-id="${t3.id}" title="${$(t3.title)}">
          <span class="m-code">${t3.code}</span>
          <span class="m-main"><b>${$(t3.title)}</b><span>${$(t3.subtitle)}</span>
          <span class="m-lens">${t3.lenses.map((e45) => `<i style="--c:${__.find((t4) => t4.id === e45).color}" title="${e45}"></i>`).join(``)}</span></span>
          <span class="m-status"><em>${i2}</em>${n2 ? `<small>${hv(n2.value)}</small>` : `<small>${hv(t3.exposure)} at stake</small>`}${r2 === void 0 ? `` : `<small>Quiz ${r2}%</small>`}</span>
        </button>`;
    }).join(``), Q(`#missions`).querySelectorAll(`.mission`).forEach((e45) => e45.addEventListener(`click`, () => this.openMission(e45.dataset.id)));
  }
  renderHud() {
    Q(`#scoreValue`).textContent = hv(this.game.s.value);
    let e44 = this.game.rank();
    Q(`#rankName`).textContent = e44.name, Q(`#xpFill`).style.width = `${Math.round(e44.progress * 100)}%`, Q(`#xpText`).textContent = `${this.game.s.xp} XP${e44.next ? ` / ${e44.next}` : ``}`, Q(`#badgeCount`).textContent = String(this.game.s.badges.length);
  }
  chainHtml(e44, t2 = false) {
    let n2 = e44.chain, r2 = [[`IT signal`, n2.signal], [`Domains`, n2.domain], [`Cisco capability`, n2.capability], [`Business KPI`, n2.kpi], [`Executive outcome`, n2.outcome]];
    return `<div class="chain ${t2 ? `big` : ``}">${r2.map(([e45, t3], n3) => `<div class="link" style="--i:${n3}"><label>${e45}</label><span>${$(t3)}</span></div>`).join(`<div class="arrow"></div>`)}</div>`;
  }
  branchSummary(e44, t2) {
    let n2 = e44.events.filter((e45) => e45.branch === t2);
    return `<div class="card ${t2}"><h4>${t2 === `agentic` ? `What the agents did` : `What happened`}</h4><ul class="tl-list">${n2.map((e45) => `<li class="${e45.sev}"><span>${this.tl.format(e45.t)}</span>${$(e45.text)}</li>`).join(``)}</ul></div>`;
  }
  outcomeHtml(e44, t2) {
    let n2 = this.game.s.missions[e44.id], r2 = t2 === `explore` ? this.choice?.quality ?? n2?.quality ?? `poor` : `best`, i2 = r2 === `best` ? e44.exposure : r2 === `partial` ? e44.exposure * 0.4 : 0;
    return `
      <p class="lead">${$(e44.narration.outcome)}</p>
      <div class="big-number ${r2}"><span>${hv(i2)}</span><label>${r2 === `best` ? `modeled business value protected` : r2 === `partial` ? `protected out of ${hv(e44.exposure)} at stake` : `protected. ${hv(e44.exposure)} of modeled exposure realized`}</label></div>
      <p class="basis">${$(e44.exposureBasis)}</p>
      <table class="kpi"><thead><tr><th>Business KPI</th><th>Traditional IT</th><th>AgenticOps</th></tr></thead>
      <tbody>${e44.kpis.map((e45) => `<tr><td>${$(e45.label)}</td><td class="trad">${$(e45.traditional)}</td><td class="agent">${$(e45.agentic)}</td></tr>`).join(``)}</tbody></table>
      ${this.chainHtml(e44)}
      <div class="card"><h4>Capabilities in play</h4><div class="chips">${e44.products.map((e45) => `<span class="pchip">${$(e45)}</span>`).join(``)}</div></div>
      ${t2 === `explore` ? `<div class="row-btns"><button class="btn" data-act="next">Next mission</button>${r2 === `best` ? `` : `<button class="btn ghost" data-act="replay">Replay and make a better call</button>`}<button class="btn ghost" data-act="home">All missions</button></div>` : ``}`;
  }
  floatXp(e44, t2) {
    let n2 = Sv(`div`, `float-xp`);
    n2.innerHTML = `+${e44} XP${t2 ? `<br><b>+${hv(t2)}</b>` : ``}`, document.body.appendChild(n2), setTimeout(() => n2.remove(), 2600);
  }
  toast(e44, t2 = 2800) {
    let n2 = Q(`#toast`);
    n2.innerHTML = e44, n2.classList.add(`show`), clearTimeout(n2._h), n2._h = window.setTimeout(() => n2.classList.remove(`show`), t2);
  }
  showBadges() {
    let e44 = new Set(this.game.s.badges);
    Q(`#modalCard`).innerHTML = `<h2>Badges</h2><div class="badges">${cv.map((t2) => `<div class="badge ${e44.has(t2.id) ? `got` : ``}"><div class="medal"></div><b>${$(t2.name)}</b><span>${$(t2.desc)}</span></div>`).join(``)}</div><div class="row-btns"><button class="btn ghost" id="resetProgress">Reset progress</button><button class="btn" id="closeModal">Close</button></div>`, Q(`#modal`).classList.remove(`hidden`), Q(`#closeModal`).addEventListener(`click`, () => this.closeModal()), Q(`#resetProgress`).addEventListener(`click`, () => {
      this.game.reset(), this.renderMissions(), this.showBadges();
    });
  }
  closeModal() {
    Q(`#modal`).classList.add(`hidden`);
  }
  buildTicker() {
    let e44 = [...ry, ...ry];
    Q(`#tickerTrack`).innerHTML = e44.map((e45) => `<span><i></i>${$(e45)}</span>`).join(``);
  }
  vantageLoop() {
    let e44 = h_.map((e45) => e45.id), t2 = 24e5;
    setInterval(() => {
      let n2 = e44[Math.floor(Math.random() * e44.length)];
      (!this.scenario || n2 !== this.scenario.siteId) && this.world.flash(n2, Math.random() < 0.85 ? `#7cf29c` : `#7fe7ff`), this.resolvedToday += +(Math.random() < 0.6), t2 += (Math.random() - 0.5) * 6e4, Q(`#vpSignals`).textContent = `${(t2 / 1e6).toFixed(2)}M`, Q(`#vpAgents`).textContent = String(124 + Math.floor(Math.random() * 9)), Q(`#vpResolved`).textContent = this.resolvedToday.toLocaleString();
    }, 1300);
  }
}();
