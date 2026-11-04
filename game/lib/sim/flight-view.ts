// Simulation mode's flight, 2026-11-03: a camera that travels through our neighborhood instead of turning round it.
// Gaia's census of every star within 326 ly and HYG's brighter stars beyond, each as bright as it looks from where the
// camera is. The minds, peers and worlds the dials drew are living lights sized in light-years, so a mind is a point far
// off and fills the view as we arrive. Far out, a drawn disk stands in for the Galaxy's other stars. Its own canvas, apart
// from lib/drift.ts, so the Universe section's map is untouched.
import * as THREE from "three";
import { CENTER } from "./tour.ts";

type Vec = [number, number, number];
export type BodyKind = "star" | "sol" | "awake" | "asleep" | "peer" | "fills" | "animals" | "oxygen" | "microbes" | "lifeless";

/** Something the flight draws and names. Stars are named only: their light is the catalog's. */
export interface Body {
  id: string;
  pos: Vec;
  kind: BodyKind;
  label: string;
  /** Its halo's radius, light-years. */
  size: number;
  /** 1 lit, down to 0.2 faded: a peer whose glow is not reaching us at the chosen time. */
  lit?: number;
}

/** Where to fly: a place, and how far off to stand from it, light-years. */
export interface Target {
  id: string;
  pos: Vec;
  stand: number;
  /** Which way from it to stand, if not on our side of it. */
  dir?: Vec;
  /** The body to name and ring as the place in view, if not the one at `pos`. */
  mark?: string;
}

export interface Flight {
  bodies(b: Body[]): void;
  fly(t: Target): void;
  /** A drag, as shares of the frame's width and height. */
  turn(dx: number, dy: number): void;
  /** Closer under 1, farther over. */
  zoom(k: number): void;
  /** The body nearest a point on screen, within reach, or null. */
  pick(x: number, y: number): string | null;
  /** Our light's shell round Sol, light-years, or null for none. */
  light(ly: number | null): void;
  /** A dashed line from Sol to a place, with its distance, or null for none. */
  thread(to: Vec | null): void;
  dispose(): void;
}

const LY_PER_PC = 3.2616;
/** The census's reach: HYG's stars inside it are Gaia's already. */
const CENSUS_LY = 326;
const KIND_N: Record<BodyKind, number> = { star: 0, sol: 1, awake: 2, asleep: 3, peer: 4, fills: 5, animals: 6, oxygen: 7, microbes: 8, lifeless: 9 };
/** Each kind's words on the map. Old minds are gold, peers amber, worlds as icons.tsx colors them. */
const INK: Record<BodyKind, string> = {
  star: "rgba(230,227,219,.9)",
  sol: "#ffffff",
  awake: "#f6c47e",
  asleep: "#d9917a",
  peer: "#e0a24a",
  fills: "#ff7e94",
  animals: "rgb(255,206,150)",
  oxygen: "rgb(255,206,150)",
  microbes: "rgb(168,198,255)",
  lifeless: "rgba(230,227,219,.7)",
};
/** How near the camera a body must come before the map names it unasked, light-years. */
const NAME_WITHIN: Record<BodyKind, number> = { star: 30, sol: Infinity, awake: 110, asleep: 60, peer: 900, fills: 900, animals: 20, oxygen: 20, microbes: 20, lifeless: 12 };

// A star's color from B − V, as the eye sees it.
const BV: [number, number, number, number][] = [
  [-0.4, 0.61, 0.69, 1], [0, 0.79, 0.84, 1], [0.4, 0.97, 0.97, 1], [0.65, 1, 0.96, 0.92],
  [0.9, 1, 0.85, 0.66], [1.4, 1, 0.73, 0.45], [2.0, 1, 0.58, 0.32],
];
function colorOf(bv: number): [number, number, number] {
  if (!Number.isFinite(bv)) return [1, 0.96, 0.9];
  if (bv <= BV[0][0]) return [BV[0][1], BV[0][2], BV[0][3]];
  for (let i = 1; i < BV.length; i++)
    if (bv <= BV[i][0]) {
      const [a, b] = [BV[i - 1], BV[i]], k = (bv - a[0]) / (b[0] - a[0]);
      return [a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k, a[3] + (b[3] - a[3]) * k];
    }
  const l = BV[BV.length - 1];
  return [l[1], l[2], l[3]];
}

const STAR_VERT = /* glsl */ `
attribute float aAbs;
attribute vec3 aColor;
uniform float uDpr;
varying vec3 vColor;
varying float vA;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vColor = aColor;
  if (mv.z > -0.002) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); vA = 0.0; return; }
  float pc = max(length(mv.xyz) / ${LY_PER_PC}, 1e-4);
  // As bright as it looks from here: its absolute magnitude, moved to the camera's distance.
  float m = aAbs + 5.0 * log(pc) / log(10.0) - 5.0;
  float f = pow(10.0, -0.4 * (m - 7.0));
  vA = clamp(0.1 + pow(f, 0.5), 0.0, 1.0) * step(0.004, f);
  gl_PointSize = clamp(1.4 + 1.5 * pow(f, 0.33), 1.0, 30.0) * uDpr;
  gl_Position = projectionMatrix * mv;
}`;
const STAR_FRAG = /* glsl */ `
varying vec3 vColor;
varying float vA;
void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  float a = smoothstep(1.0, 0.0, r);
  gl_FragColor = vec4(vColor, a * a * vA);
}`;

// The Galaxy beyond our reach, drawn: each point stands for many stars, a soft glow sized in light-years.
const DISK_VERT = /* glsl */ `
attribute vec3 aColor;
uniform float uFocal, uDpr;
varying vec3 vColor;
varying float vA;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vColor = aColor;
  float z = -mv.z;
  if (z < 1.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); vA = 0.0; return; }
  float px = 90.0 * uFocal / z;
  // Points close by would swell to fog, so they fade as they near.
  vA = 0.045 * smoothstep(250.0, 1500.0, z) * clamp(px / 2.0, 0.25, 1.0);
  gl_PointSize = clamp(px, 1.5, 9.0) * uDpr;
  gl_Position = projectionMatrix * mv;
}`;
const DISK_FRAG = /* glsl */ `
varying vec3 vColor;
varying float vA;
void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  gl_FragColor = vec4(vColor, exp(-r * r * 3.0) * vA);
}`;

// The bodies: quads facing the camera, each a halo of its own radius in light-years, never smaller than a few pixels.
const BODY_VERT = /* glsl */ `
attribute vec3 iPos;
attribute float iSize, iKind, iPhase, iLit;
uniform vec2 uRes;
uniform float uFocal;
varying vec2 vUv;
varying float vKind, vPhase, vLit, vPx;
const float REACH = 2.4;
void main() {
  vec4 mv = modelViewMatrix * vec4(iPos, 1.0);
  float z = -mv.z;
  vKind = iKind; vPhase = iPhase; vLit = iLit;
  if (z < 0.01 || iSize <= 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
  float lo = iKind == 1.0 ? 5.0 : iKind >= 6.0 ? 3.5 : iKind == 3.0 ? 3.5 : 5.5;
  float px = clamp(max(iSize * uFocal / z, lo), 0.0, 2600.0);
  vPx = px;
  vUv = position.xy * REACH;
  vec4 clip = projectionMatrix * mv;
  clip.xy += position.xy * REACH * px * 2.0 / uRes * clip.w;
  gl_Position = clip;
}`;
const BODY_FRAG = /* glsl */ `
uniform float uTime;
varying vec2 vUv;
varying float vKind, vPhase, vLit, vPx;
float ring(float r, float at, float w) { return smoothstep(w, 0.0, abs(r - at)); }
void main() {
  float r = length(vUv);
  float px = 1.4 / max(vPx, 1.0);
  // Rings need room to read: below about ten pixels a body is its glow alone.
  float roomy = smoothstep(9.0, 26.0, vPx);
  vec3 col; float a = 0.0;
  // A core a few pixels across however near, so a body up close is a bright point in a wide glow, not a disk.
  float core = exp(-pow(r * vPx / 4.0, 2.0)) + 0.35 * exp(-pow(r * vPx / 14.0, 2.0));
  if (vKind == 1.0) {
    col = vec3(1.0);
    a = core + 0.3 * exp(-r * r * 2.5) + 0.06 * exp(-r);
  } else if (vKind == 2.0) {
    // Awake: a heartbeat, two rings going out in turn, and a slow dashed ring round its core.
    col = vec3(1.0, 0.77, 0.47);
    a = max(core, exp(-r * r * 60.0)) + 0.3 * exp(-r * r * 3.5) + 0.1 * exp(-r * 1.3);
    for (int j = 0; j < 2; j++) {
      float ph = fract(uTime * 0.28 + vPhase + float(j) * 0.5);
      a += roomy * (1.0 - ph) * 0.5 * ring(r, 0.12 + ph * 2.0, px * 1.5);
    }
    float ang = atan(vUv.y, vUv.x);
    a += roomy * 0.32 * ring(r, 0.45, px * 1.2) * step(0.5, fract(ang * 3.8197 + uTime * 0.12));
  } else if (vKind == 3.0) {
    // Asleep: an ember that breathes.
    col = vec3(1.0, 0.36, 0.22);
    float b = 0.4 + 0.3 * sin(uTime * 0.8 + vPhase * 6.2832);
    a = b * (max(core, exp(-r * r * 40.0)) + 0.35 * exp(-r * r * 4.0));
  } else if (vKind == 4.0 || vKind == 5.0) {
    // A peer, young as we are and building out: hot at the core, rays, and a quicker pulse.
    col = vKind == 5.0 ? vec3(1.0, 0.49, 0.58) : vec3(1.0, 0.72, 0.36);
    float rays = exp(-abs(vUv.x) * 18.0) * exp(-abs(vUv.y) * 1.6) + exp(-abs(vUv.y) * 18.0) * exp(-abs(vUv.x) * 1.6);
    a = max(core, exp(-r * r * 50.0)) * 1.2 + 0.35 * exp(-r * r * 3.0) + 0.35 * rays;
    // Pulsing only while its glow reaches us at the chosen time; otherwise a quieter light.
    for (int j = 0; j < 3; j++) {
      float ph = fract(uTime * 0.5 + vPhase + float(j) / 3.0);
      a += step(0.9, vLit) * roomy * (1.0 - ph) * 0.45 * ring(r, 0.1 + ph * 2.2, px * 1.6);
    }
    a *= 0.4 + 0.6 * vLit;
  } else {
    // A world: a small lit disk, and its orbit round its star.
    col = vKind == 8.0 ? vec3(0.66, 0.78, 1.0) : vKind == 9.0 ? vec3(0.8, 0.78, 0.74) : vec3(1.0, 0.81, 0.59);
    a = core + 0.12 * exp(-r * r * 6.0) + roomy * 0.45 * ring(r, 0.85, px * 1.2);
  }
  // Soft to nothing before the quad's edge, so a small body never shows a square.
  a *= smoothstep(2.4, 1.5, r);
  gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
}`;

// Our light, out since our first radio: a shell whose rim glows where we see it edge-on.
const SHELL_VERT = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const SHELL_FRAG = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
void main() {
  float rim = pow(1.0 - abs(dot(vN, vV)), 3.0);
  gl_FragColor = vec4(0.6, 0.85, 1.0, 0.04 + rim * 0.5);
}`;

function diskOf(): THREE.BufferGeometry {
  // An exponential disk, 2.6 kpc long and 0.3 kpc high (Bland-Hawthorn & Gerhard 2016), with four arms and a bulge. Drawn:
  // no catalog reaches this far. Out of 3,300 ly from us, where HYG's real stars stop.
  const N = 140_000, pos: number[] = [], col: number[] = [];
  const HR = 2.6 * 3261.56, HZ = 0.3 * 3261.56, BULGE = 3261.56;
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(2 * Math.PI * rnd());
  const [cx, cy, cz] = CENTER;
  while (pos.length < N * 3) {
    let x: number, y: number, z: number, c: [number, number, number];
    if (rnd() < 0.2) {
      x = gauss() * BULGE * 0.8; z = gauss() * BULGE * 0.45; y = gauss() * BULGE * 0.35;
      c = [1, 0.84, 0.64];
    } else {
      const R = -HR * Math.log(rnd() * rnd() + 1e-9), th = rnd() * Math.PI * 2;
      const phase = th - Math.log(R / 13000 + 1e-6) / Math.tan((12 * Math.PI) / 180);
      const arm = (0.5 + 0.5 * Math.cos(4 * phase)) ** 4;
      if (rnd() > 0.3 + 0.7 * arm) continue;
      x = R * Math.cos(th); z = R * Math.sin(th); y = HZ * Math.log(rnd() + 1e-9) * (rnd() < 0.5 ? -1 : 1) * 0.35;
      c = arm > 0.5 ? [0.78, 0.85, 1] : [0.98, 0.92, 0.84];
    }
    const [px, py, pz] = [cx + x, cy + y, cz + z];
    if (Math.hypot(px, py, pz) < 3300) continue;
    pos.push(px, py, pz);
    col.push(...c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aColor", new THREE.Float32BufferAttribute(col, 3));
  return g;
}

/** Out past the catalogs, the stars round a place are drawn: as dense as round us, in the same mix of kinds. */
const FIELD = { past: 3000, n: 24_000, r: 120 };
const KINDS_MIX: [number, number, number, number][] = [
  // share, faintest and brightest absolute magnitude, B − V
  [0.75, 15, 9, 1.5], [0.13, 8, 6, 1.0], [0.07, 6, 4, 0.65], [0.03, 4, 2.5, 0.4], [0.02, 2, -1, 0.0],
];
function fieldOf(at: Vec, seed: number): THREE.BufferGeometry {
  let s = seed % 2147483646 || 1;
  const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const pos = new Float32Array(FIELD.n * 3), abs = new Float32Array(FIELD.n), col = new Float32Array(FIELD.n * 3);
  for (let i = 0; i < FIELD.n; i++) {
    let x, y, z;
    do [x, y, z] = [rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1];
    while (x * x + y * y + z * z > 1);
    pos.set([at[0] + x * FIELD.r, at[1] + y * FIELD.r, at[2] + z * FIELD.r], i * 3);
    let u = rnd(), k = KINDS_MIX[0];
    for (const m of KINDS_MIX) if ((u -= m[0]) <= 0) { k = m; break; }
    abs[i] = k[1] + (k[2] - k[1]) * rnd();
    col.set(colorOf(k[3] + (rnd() - 0.5) * 0.2), i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aAbs", new THREE.BufferAttribute(abs, 1));
  g.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
  return g;
}

const v3 = (p: Vec) => new THREE.Vector3(p[0], p[1], p[2]);
const ease = (k: number) => (k <= 0 ? 0 : k >= 1 ? 1 : k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);
const UP = new THREE.Vector3(0, 1, 0);

export function mountFlight(
  el: HTMLElement,
  opts: { still?: boolean; onArrive?(id: string): void; onTouch?(): void } = {},
): Flight {
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
  renderer.setClearColor(0x0a0b0d, 1);
  const dpr = Math.min(2, devicePixelRatio || 1);
  renderer.setPixelRatio(dpr);
  const gl = renderer.domElement;
  gl.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
  el.appendChild(gl);
  const over = document.createElement("canvas");
  over.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
  el.appendChild(over);
  const g2 = over.getContext("2d")!;
  const mono = `${getComputedStyle(document.body).getPropertyValue("--font-plex-mono").trim() || "ui-monospace"}, ui-monospace, monospace`;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.001, 3e5);
  const focal = { value: 1 };
  const res = new THREE.Vector2(1, 1);
  const time = { value: 0 };
  const blend = { transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending } as const;

  // The far Galaxy, then the real stars, then the shell and the bodies, in that order.
  const disk = new THREE.Points(
    diskOf(),
    new THREE.ShaderMaterial({ vertexShader: DISK_VERT, fragmentShader: DISK_FRAG, uniforms: { uFocal: focal, uDpr: { value: dpr } }, ...blend }),
  );
  disk.frustumCulled = false;
  scene.add(disk);

  const starMat = new THREE.ShaderMaterial({ vertexShader: STAR_VERT, fragmentShader: STAR_FRAG, uniforms: { uDpr: { value: dpr } }, ...blend });
  let gone = false;
  Promise.all(
    [new URL("../../../data/stars.bin", import.meta.url), new URL("../../../data/gcns-326ly.bin", import.meta.url)].map((u) =>
      fetch(u).then((r) => r.arrayBuffer()),
    ),
  ).then(([hyg, gaia]) => {
    if (gone) return;
    const rows: number[] = [];
    const far = new Float32Array(hyg);
    for (let i = 0; i < far.length; i += 5) if (Math.hypot(far[i], far[i + 1], far[i + 2]) > CENSUS_LY) rows.push(i);
    const near = new Float32Array(gaia);
    const n = rows.length + near.length / 5;
    const pos = new Float32Array(n * 3), abs = new Float32Array(n), col = new Float32Array(n * 3);
    const put = (k: number, src: Float32Array, i: number) => {
      const [x, y, z, mag, bv] = [src[i], src[i + 1], src[i + 2], src[i + 3], src[i + 4]];
      const ly = Math.max(Math.hypot(x, y, z), 1e-3);
      pos.set([x, y, z], k * 3);
      abs[k] = mag - 5 * Math.log10(ly / LY_PER_PC) + 5;
      col.set(colorOf(bv), k * 3);
    };
    rows.forEach((i, k) => put(k, far, i));
    for (let i = 0, k = rows.length; i < near.length; i += 5, k++) {
      if (Math.hypot(near[i], near[i + 1], near[i + 2]) < 1e-3) {
        abs[k] = 99;
        continue;
      }
      put(k, near, i);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aAbs", new THREE.BufferAttribute(abs, 1));
    geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    const stars = new THREE.Points(geo, starMat);
    stars.frustumCulled = false;
    scene.add(stars);
  });

  const field = new THREE.Points(new THREE.BufferGeometry(), starMat);
  field.frustumCulled = false;
  field.visible = false;
  scene.add(field);

  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 32),
    new THREE.ShaderMaterial({ vertexShader: SHELL_VERT, fragmentShader: SHELL_FRAG, ...blend, side: THREE.DoubleSide }),
  );
  shell.visible = false;
  shell.frustumCulled = false;
  scene.add(shell);

  const quad = new THREE.InstancedBufferGeometry();
  quad.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3));
  quad.setIndex([0, 1, 2, 0, 2, 3]);
  const bodyMat = new THREE.ShaderMaterial({
    vertexShader: BODY_VERT,
    fragmentShader: BODY_FRAG,
    uniforms: { uRes: { value: res }, uFocal: focal, uTime: time },
    ...blend,
  });
  const bodyMesh = new THREE.Mesh(quad, bodyMat);
  bodyMesh.frustumCulled = false;
  scene.add(bodyMesh);
  let list: Body[] = [];

  // The flight: from where the camera is to a place, its distance from the place easing in the log, so a long leg
  // pulls back to see the way and a short one glides. Then it holds there, turning slowly round it.
  const cam = { pos: new THREE.Vector3(0, 6, -36), look: new THREE.Vector3(0, 0, 0) };
  let leg: {
    to: Target; t0: number; dur: number; from: THREE.Vector3; look0: THREE.Vector3;
    dir0: THREE.Vector3; dir1: THREE.Vector3; d0: number; arc: number; arrived: boolean;
  } | null = null;
  const user = { yaw: 0, pitch: 0, zoom: 1 };
  let drift = 0;

  function fly(t: Target) {
    const T = v3(t.pos), now = performance.now() / 1000;
    if (T.length() > FIELD.past && t.stand < 1000) {
      field.geometry.dispose();
      let h = 7;
      for (const ch of t.id) h = (h * 31 + ch.charCodeAt(0)) % 2147483646;
      field.geometry = fieldOf(t.pos, h);
      field.visible = true;
    }
    const from = cam.pos.clone(), back = from.clone().sub(T);
    const d0 = Math.max(back.length(), 1e-3);
    // Stand on our side of it, turned a little aside, so Sol and the way we came stay in the frame.
    const home = T.lengthSq() > 1e-6 ? T.clone().negate().normalize() : back.clone().normalize();
    const dir1 = t.dir ? v3(t.dir).normalize() : back.clone().normalize().lerp(home, 0.5).normalize().applyAxisAngle(UP, 0.45);
    if (dir1.lengthSq() < 1e-6) dir1.set(0, 0.2, -1).normalize();
    const span = from.distanceTo(T.clone().addScaledVector(dir1, t.stand));
    leg = {
      to: t, t0: now, from, look0: cam.look.clone(), dir0: back.normalize(), dir1, d0,
      dur: opts.still ? 0.001 : Math.min(15, 4.5 + 1.5 * Math.log(1 + span / Math.max(t.stand, 1))),
      arc: span > 200 ? span * 0.22 : 0, arrived: false,
    };
    user.yaw = user.pitch = 0;
    user.zoom = 1;
    drift = 0;
  }

  function pose(now: number, dt: number) {
    if (!leg) return;
    const T = v3(leg.to.pos);
    const s = Math.min(1, (now - leg.t0) / leg.dur), e = ease(s);
    if (s >= 1 && !opts.still) drift += dt * 0.03;
    const dir1 = leg.dir1.clone().applyAxisAngle(UP, user.yaw + drift);
    const side = new THREE.Vector3().crossVectors(UP, dir1).normalize();
    dir1.applyAxisAngle(side, user.pitch).normalize();
    const d1 = leg.to.stand * user.zoom;
    const d = Math.exp(Math.log(leg.d0) + (Math.log(d1) - Math.log(leg.d0)) * e);
    const dir = leg.dir0.clone().lerp(dir1, e).normalize();
    cam.pos.copy(T).addScaledVector(dir, d).addScaledVector(UP, Math.sin(Math.PI * e) * leg.arc);
    cam.look.copy(leg.look0).lerp(T, ease(Math.min(1, s / 0.45)));
    if (s >= 1 && !leg.arrived) {
      leg.arrived = true;
      opts.onArrive?.(leg.to.id);
    }
  }

  function bodies(b: Body[]) {
    list = b;
    const n = b.length;
    const P = new Float32Array(n * 3), S = new Float32Array(n), K = new Float32Array(n), F = new Float32Array(n), L = new Float32Array(n);
    b.forEach((x, i) => {
      P.set(x.pos, i * 3);
      S[i] = x.kind === "star" ? 0 : x.size;
      K[i] = KIND_N[x.kind];
      let h = 0;
      for (const ch of x.id) h = (h * 31 + ch.charCodeAt(0)) % 9973;
      F[i] = h / 9973;
      L[i] = x.lit ?? 1;
    });
    quad.setAttribute("iPos", new THREE.InstancedBufferAttribute(P, 3));
    quad.setAttribute("iSize", new THREE.InstancedBufferAttribute(S, 1));
    quad.setAttribute("iKind", new THREE.InstancedBufferAttribute(K, 1));
    quad.setAttribute("iPhase", new THREE.InstancedBufferAttribute(F, 1));
    quad.setAttribute("iLit", new THREE.InstancedBufferAttribute(L, 1));
    quad.instanceCount = n;
  }

  // Where a place falls on screen, in CSS pixels, with its depth, or null behind us.
  const tmp = new THREE.Vector3();
  function screen(p: Vec, W: number, H: number): [number, number, number] | null {
    tmp.set(p[0], p[1], p[2]).applyMatrix4(camera.matrixWorldInverse);
    if (tmp.z > -0.01) return null;
    const z = -tmp.z;
    tmp.applyMatrix4(camera.projectionMatrix);
    return [(tmp.x * 0.5 + 0.5) * W, (-tmp.y * 0.5 + 0.5) * H, z];
  }

  // The line from Sol to the place in view, cut where it passes behind the camera, its distance at its middle.
  let threaded = false;
  let end: Vec | null = null;
  const va = new THREE.Vector3(), vb = new THREE.Vector3();
  function thread(W: number, H: number) {
    if (!threaded || !leg || !end) return;
    va.set(0, 0, 0).applyMatrix4(camera.matrixWorldInverse);
    vb.set(...end).applyMatrix4(camera.matrixWorldInverse);
    const NEAR = -0.02;
    if (va.z > NEAR && vb.z > NEAR) return;
    if (va.z > NEAR) va.lerp(vb, (va.z - NEAR) / (va.z - vb.z));
    if (vb.z > NEAR) vb.lerp(va, (vb.z - NEAR) / (vb.z - va.z));
    const toScreen = (v: THREE.Vector3) => {
      const p = v.clone().applyMatrix4(camera.projectionMatrix);
      return [(p.x * 0.5 + 0.5) * W, (-p.y * 0.5 + 0.5) * H] as const;
    };
    const [ax, ay] = toScreen(va), [bx, by] = toScreen(vb);
    g2.globalAlpha = 0.8;
    g2.strokeStyle = "#ffffff";
    g2.lineWidth = 1.2;
    g2.setLineDash([5, 5]);
    g2.lineDashOffset = performance.now() / 90;
    g2.beginPath();
    g2.moveTo(ax, ay);
    g2.lineTo(bx, by);
    g2.stroke();
    g2.setLineDash([]);
    const d = Math.hypot(...end);
    const words = `${d < 100 ? d.toFixed(1) : Math.round(d).toLocaleString("en-US")} ly from Sol · light takes ${Math.round(d).toLocaleString("en-US")} years`;
    const mx = Math.min(W - 12, Math.max(12, (ax + bx) / 2)), my = Math.min(H - 12, Math.max(12, (ay + by) / 2));
    g2.font = `11px ${mono}`;
    g2.textAlign = "center";
    g2.textBaseline = "bottom";
    g2.globalAlpha = 1;
    g2.fillStyle = "#ffffff";
    g2.shadowColor = "#000";
    g2.shadowBlur = 6;
    g2.fillText(words, mx, my - 6);
    g2.shadowBlur = 0;
  }

  function names(W: number, H: number) {
    g2.setTransform(dpr, 0, 0, dpr, 0, 0);
    g2.clearRect(0, 0, W, H);
    thread(W, H);
    const target = leg?.to.mark ?? leg?.to.id;
    const want: { b: Body; x: number; y: number; z: number; main: boolean }[] = [];
    for (const b of list) {
      const main = b.id === target;
      const at = screen(b.pos, W, H);
      if (!at) continue;
      const [x, y] = at;
      if (x < -40 || x > W + 40 || y < -40 || y > H + 40) continue;
      const dz = cam.pos.distanceTo(tmp.set(...b.pos));
      if (!main && b.kind !== "sol" && dz > NAME_WITHIN[b.kind]) continue;
      want.push({ b, x, y, z: dz, main });
    }
    want.sort((p, q) => Number(q.main) - Number(p.main) || Number(q.b.kind === "sol") - Number(p.b.kind === "sol") || p.z - q.z);
    const taken: [number, number, number, number][] = [];
    let shown = 0;
    // The place in view: a thin ring round it, so a faint star still reads as where we are going.
    const aim = want.find((w) => w.main);
    if (aim) {
      g2.globalAlpha = 0.55;
      g2.strokeStyle = INK[aim.b.kind];
      g2.lineWidth = 1;
      g2.setLineDash([2, 4]);
      g2.lineDashOffset = -performance.now() / 160;
      g2.beginPath();
      g2.arc(aim.x, aim.y, 11, 0, Math.PI * 2);
      g2.stroke();
      g2.setLineDash([]);
      g2.globalAlpha = 1;
    }
    for (const { b, x, y, z, main } of want) {
      if (shown >= 9) break;
      const size = main ? 13 : 11;
      g2.font = `${size}px ${mono}`;
      const w = g2.measureText(b.label).width;
      // Off to the upper right, or the left near the right edge, along a dashed line.
      const left = x > W - w - 60;
      const ex = x + (left ? -20 : 20), ey = y - 16;
      const box: [number, number, number, number] = [left ? ex - w - 6 : ex + 4, ey - size, w + 4, size * 1.6];
      if (!main && taken.some(([a, b2, c, d]) => box[0] < a + c && a < box[0] + box[2] && box[1] < b2 + d && b2 < box[1] + box[3])) continue;
      taken.push(box);
      shown++;
      const fade = main || b.kind === "sol" ? 1 : Math.min(1, 1.6 * (1 - z / NAME_WITHIN[b.kind]));
      g2.globalAlpha = 0.75 * fade;
      g2.strokeStyle = INK[b.kind];
      g2.lineWidth = 1;
      g2.setLineDash([3, 3]);
      g2.beginPath();
      g2.moveTo(x, y);
      g2.lineTo(ex, ey);
      g2.stroke();
      g2.setLineDash([]);
      g2.globalAlpha = fade;
      g2.fillStyle = INK[b.kind];
      g2.textBaseline = "middle";
      g2.textAlign = left ? "right" : "left";
      g2.shadowColor = "#000";
      g2.shadowBlur = 6;
      g2.fillText(b.label, left ? ex - 5 : ex + 5, ey);
      g2.shadowBlur = 0;
    }
    g2.globalAlpha = 1;
  }

  let W = 0, H = 0;
  const fit = () => {
    W = el.clientWidth;
    H = el.clientHeight;
    if (!W || !H) return;
    renderer.setSize(W, H, false);
    over.width = W * dpr;
    over.height = H * dpr;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    res.set(W, H);
    focal.value = H / 2 / Math.tan((camera.fov * Math.PI) / 360);
  };
  const ro = new ResizeObserver(fit);
  ro.observe(el);
  fit();

  let raf = 0, last = performance.now();
  const frame = (ms: number) => {
    raf = requestAnimationFrame(frame);
    const now = ms / 1000, dt = Math.min(0.05, (ms - last) / 1000);
    last = ms;
    time.value = now;
    pose(now, dt);
    camera.position.copy(cam.pos);
    camera.up.copy(UP);
    camera.lookAt(cam.look);
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
    names(W, H);
  };
  raf = requestAnimationFrame(frame);

  return {
    bodies,
    fly,
    turn(dx, dy) {
      user.yaw -= dx * Math.PI;
      user.pitch = Math.max(-1.3, Math.min(1.3, user.pitch + dy * 2));
      opts.onTouch?.();
    },
    zoom(k) {
      user.zoom = Math.max(0.25, Math.min(12, user.zoom * k));
      opts.onTouch?.();
    },
    pick(x, y) {
      let best: string | null = null, gap = 26;
      for (const b of list) {
        const at = screen(b.pos, W, H);
        if (!at) continue;
        const d = Math.hypot(at[0] - x, at[1] - y);
        if (d < gap) [best, gap] = [b.id, d];
      }
      return best;
    },
    thread(to) {
      threaded = !!to;
      end = to;
    },
    light(ly) {
      shell.visible = ly !== null && ly > 0;
      if (ly) shell.scale.setScalar(ly);
    },
    dispose() {
      gone = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        (m.material as THREE.Material | undefined)?.dispose?.();
      });
      renderer.dispose();
      gl.remove();
      over.remove();
    },
  };
}
