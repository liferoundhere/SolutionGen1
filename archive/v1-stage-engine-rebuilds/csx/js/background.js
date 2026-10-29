import * as THREE from 'three';
import { damp } from './core.js';

// Camera-following sky sphere. Each scene supplies three colors and a pattern mix;
// the sky eases between them so every scene change reads as a new environment.
export function createSky() {
  const uniforms = {
    uTime: { value: 0 },
    uA: { value: new THREE.Color('#020611') },
    uB: { value: new THREE.Color('#06213f') },
    uC: { value: new THREE.Color('#00bceb') },
    uMix: { value: new THREE.Vector4(1, 0, 0, 0) },
    uWarp: { value: 0 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
    vertexShader: /* glsl */`
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */`
      uniform float uTime; uniform vec3 uA; uniform vec3 uB; uniform vec3 uC;
      uniform vec4 uMix; uniform float uWarp;
      varying vec3 vDir;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      float noise(vec2 p){
        vec2 i = floor(p), f = fract(p);
        float a = hash(i), b = hash(i+vec2(1,0)), c = hash(i+vec2(0,1)), d = hash(i+vec2(1,1));
        vec2 u = f*f*(3.0-2.0*f);
        return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
      }
      float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.03; a*=0.5; } return v; }
      void main(){
        vec3 d = normalize(vDir);
        float h = d.y;
        float az = atan(d.z, d.x);
        vec2 uv = vec2(az * 1.6, h * 3.0);
        vec3 base = mix(uB, uA, smoothstep(-0.15, 0.75, h));
        base = mix(base, uA * 0.6, smoothstep(0.0, -0.6, h));

        // 0: aurora curtains
        float n = fbm(uv * 1.2 + vec2(uTime * 0.03, 0.0));
        float curtain = smoothstep(0.45, 0.95, fbm(vec2(az * 3.0 + uTime * 0.05, h * 1.5 + n)));
        vec3 aurora = uC * curtain * smoothstep(-0.1, 0.5, h) * (1.0 - smoothstep(0.55, 1.0, h)) * 0.55;

        // 1: horizon grid glow
        vec2 g = vec2(az * 24.0, 1.0 / max(0.04, abs(h) + 0.04) * 1.5 + uTime * 0.4);
        vec2 gf = abs(fract(g) - 0.5);
        float grid = (1.0 - smoothstep(0.0, 0.04, min(gf.x, gf.y))) * smoothstep(0.02, -0.5, h);
        vec3 horizon = uC * (grid * 0.35 + exp(-abs(h) * 14.0) * 0.6);

        // 2: data rain
        float col = floor(az * 60.0);
        float speed = 0.2 + hash(vec2(col, 1.0)) * 0.6;
        float y = fract(h * 2.0 + uTime * speed * 0.2 + hash(vec2(col, 7.0)));
        float drop = smoothstep(0.0, 0.03, y) * (1.0 - smoothstep(0.03, 0.35, y));
        float lane = 1.0 - smoothstep(0.0, 0.25, abs(fract(az * 60.0) - 0.5));
        vec3 rain = uC * drop * lane * 0.45 * step(0.55, hash(vec2(col, 3.0)));

        // 3: deep starfield + nebula
        vec2 sp = vec2(az * 90.0, h * 90.0);
        float star = step(0.9965, hash(floor(sp))) * (0.6 + 0.4 * sin(uTime * 2.0 + hash(floor(sp)) * 40.0));
        vec3 neb = mix(uB, uC, fbm(uv * 0.8 - uTime * 0.01)) * 0.35 * fbm(uv * 2.0 + 3.0);
        vec3 space = vec3(star) * 0.9 + neb;

        vec3 col3 = base + aurora * uMix.x + horizon * uMix.y + rain * uMix.z + space * uMix.w;

        // warp streaks during scene travel
        float streak = step(0.985, hash(vec2(floor(az * 140.0), 2.0))) * smoothstep(0.6, 0.0, abs(h)) * uWarp;
        col3 += uC * streak * 0.9 + vec3(uWarp * 0.04);
        // subtle vignette in sky
        col3 *= 0.92 + 0.08 * smoothstep(-0.8, 0.4, h);
        gl_FragColor = vec4(col3, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1500, 48, 32), mat);
  mesh.renderOrder = -1000;
  mesh.frustumCulled = false;

  const target = { a: new THREE.Color(), b: new THREE.Color(), c: new THREE.Color(), mix: new THREE.Vector4(1, 0, 0, 0) };
  target.a.copy(uniforms.uA.value); target.b.copy(uniforms.uB.value); target.c.copy(uniforms.uC.value);

  return {
    mesh,
    uniforms,
    set(bg) {
      target.a.set(bg.a); target.b.set(bg.b); target.c.set(bg.c);
      target.mix.set(...bg.mix);
    },
    snap() {
      uniforms.uA.value.copy(target.a); uniforms.uB.value.copy(target.b); uniforms.uC.value.copy(target.c);
      uniforms.uMix.value.copy(target.mix);
    },
    update(dt, t, camPos, warp) {
      uniforms.uTime.value = t;
      const k = 1 - Math.exp(-2.2 * dt);
      uniforms.uA.value.lerp(target.a, k);
      uniforms.uB.value.lerp(target.b, k);
      uniforms.uC.value.lerp(target.c, k);
      uniforms.uMix.value.lerp(target.mix, k);
      uniforms.uWarp.value = damp(uniforms.uWarp.value, warp, 6, dt);
      mesh.position.copy(camPos);
    },
  };
}
