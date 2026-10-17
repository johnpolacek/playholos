// The drift behind the first screen: a slow flight out from Earth past the Moon, the planets, the Oort cloud and the
// nearby stars to the Milky Way and the Local Group, then home. Real data throughout: today's Earth, Moon and planets
// from the atlas's ephemeris, NASA's night lights, the HYG stars, the Local Volume galaxies, and a Milky Way drawn to
// the measured arms and bar. Sources in HOLOS_RESEARCH.md, The drift. Client only.
import * as THREE from "three";
import earthDaymap from "../../assets/earth_daymap.jpg";
import { PC_LY, PLANETS, julianDate, orbitPath, seededRandom } from "../../src/astronomy.js";
import { bodyOrientation, bodyPosition, moonOffset } from "../../src/ephemeris.js";
import { GALAXIES, galaxyExtent, galaxyPosition, galaxyViewRadius } from "../../src/galaxies.js";
import { GALACTIC_CENTER, LY_AU, eclipticToGalactic } from "../../src/navigation.js";
import { DEG, LIFT, R_E_AU, band, createFlight, ramp, smooth } from "./flight";

export type Scheme = "light" | "dark";

export interface Drift {
  setTheme(scheme: Scheme): void;
  /** Dives home to Earth. Returns the dive's length in seconds. */
  home(): number;
  dispose(): void;
}

const KLY_AU = 1000 * LY_AU;

// The Milky Way's measured arms, Reid et al. 2019, Table 2: a log spiral with a kink, over the azimuths where masers
// pin it down. β is galactocentric azimuth, 0 toward the Sun, growing with the Galaxy's turn. Degrees and kpc, at their
// R0 of 8.15 kpc. Past the measured range each arm runs on at 12°, a typical pitch, and fades: our extrapolation.
const ARMS = [
  { lo: 5, hi: 54, kink: 18, r: 4.46, a: -1.0, b: 19.5, w: 0.14, ext: 80, share: 0.9 }, // Norma
  { lo: 0, hi: 104, kink: 23, r: 4.91, a: 14.1, b: 12.1, w: 0.23, ext: 90, share: 1.4 }, // Scutum–Centaurus
  { lo: 2, hi: 97, kink: 24, r: 6.04, a: 17.1, b: 1.0, w: 0.27, ext: 80, share: 1.1 }, // Sagittarius–Carina
  { lo: -8, hi: 34, kink: 9, r: 8.26, a: 11.4, b: 11.4, w: 0.31, ext: 20, share: 0.45 }, // Local
  { lo: -23, hi: 115, kink: 40, r: 8.87, a: 10.3, b: 8.7, w: 0.35, ext: 90, share: 1.4 }, // Perseus
  { lo: -16, hi: 71, kink: 18, r: 12.24, a: 3.0, b: 9.4, w: 0.65, ext: 70, share: 0.9 }, // Outer
];
const REID_R0 = 8.15;
/** Sgr A*, GRAVITY Collaboration 2022, as the atlas has it. */
const R0 = 8.277;
/** The long bar: half-length 5 kpc, its near end 28° from the Sun–center line, at positive longitude. Wegg et al. 2015. */
const BAR = { half: 5.0, angle: 28 };
/** Thin disk scale length and height, kpc. Bland-Hawthorn & Gerhard 2016. */
const DISK = { length: 2.6, height: 0.3 };

const KINDS = ["ink", "warm", "young", "rose", "lamp", "mind", "sun", "dust"] as const;
type Kind = (typeof KINDS)[number];
const K = Object.fromEntries(KINDS.map((k, i) => [k, i])) as Record<Kind, number>;

// Dark keeps the night: chalk and warm light that add up on slate. Light draws in ink on paper, as the memory
// screens' canvases do, and the dust lanes lift the ink.
const PALETTES: Record<Scheme, { bg: string; gain: number; additive: boolean } & Record<Kind, string>> = {
  dark: {
    bg: "#121314",
    gain: 1,
    additive: true,
    ink: "230,227,219",
    warm: "255,206,150",
    young: "168,198,255",
    rose: "255,126,148",
    lamp: "232,180,92",
    mind: "91,184,214",
    sun: "255,236,190",
    dust: "18,19,20",
  },
  light: {
    bg: "#fbfaf7",
    gain: 0.55,
    additive: false,
    ink: "23,23,22",
    warm: "168,98,15",
    young: "38,70,112",
    rose: "168,58,58",
    lamp: "168,98,15",
    mind: "31,122,150",
    sun: "214,140,40",
    dust: "251,250,247",
  },
};

const GLOW_VERT = /* glsl */ `
uniform vec3 uPal[8];
uniform float uFocal, uDpr, uOpacity, uMinPx, uMaxPx, uFixed;
uniform vec2 uNear;
attribute float aSize, aBright, aKind;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float depth = max(-mv.z, 1e-12);
  float a = aBright * uOpacity;
  float px;
  if (uFixed > 0.5) px = aSize * uDpr;
  else {
    // World-sized, and a point too small to see dims into the smallest dot instead. Linearly, not by area, so a far
    // galaxy's many faint points still add up in an 8-bit buffer.
    px = aSize * uFocal / depth;
    float lo = uMinPx * uDpr;
    if (px < lo) { a *= px / lo; px = lo; }
    px = min(px, uMaxPx * uDpr);
  }
  if (uNear.y > 0.0) a *= smoothstep(uNear.x, uNear.y, depth);
  vColor = uPal[int(aKind + 0.5)];
  vAlpha = a;
  gl_PointSize = px;
  if (a < 0.0015 || mv.z > 0.0) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
}`;

const GLOW_FRAG = /* glsl */ `
uniform float uGain;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(p, p);
  if (r2 > 1.0) discard;
  gl_FragColor = vec4(vColor, min(1.0, vAlpha * uGain * (exp(-r2 * 4.5) - 0.011)));
}`;

// The HYG stars, as bright as they look from wherever the camera is: each star's absolute magnitude, moved to the
// camera's distance. 6.5, the naked eye's limit, is a faint dot.
const STAR_VERT = /* glsl */ `
uniform vec3 uPal[8];
uniform float uDpr, uOpacity;
attribute float aAbs, aBV;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float pc = max(length(position - cameraPosition) / 3.261564, 1e-7);
  float m = aAbs + 5.0 * log2(pc) * 0.30103 - 5.0;
  float L = exp2(-1.3287712 * (m - 6.5));
  float a = clamp(L * 0.3, 0.0, 1.0) * uOpacity;
  gl_PointSize = clamp(1.15 * pow(L, 0.18), 1.0, 6.5) * uDpr;
  float t = clamp((aBV + 0.25) / 1.85, 0.0, 1.0);
  vColor = t < 0.3 ? mix(uPal[2], uPal[0], t / 0.3) : mix(uPal[0], uPal[1], (t - 0.3) / 0.7);
  vAlpha = a;
  if (a < 0.004 || mv.z > 0.0) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
}`;

// A globe in two tones: the paper, inked a little on one side of the terminator, and a rim.
const GLOBE_VERT = /* glsl */ `
varying vec3 vN;
varying vec3 vW;
void main() {
  vN = normalize(mat3(modelMatrix) * normal);
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const GLOBE_FRAG = /* glsl */ `
uniform vec3 uBg, uInk, uRimColor, uSun;
uniform float uDay, uNight, uRim;
varying vec3 vN;
varying vec3 vW;
void main() {
  vec3 n = normalize(vN);
  vec3 v = normalize(cameraPosition - vW);
  float lit = smoothstep(-0.12, 0.3, dot(n, uSun));
  float rim = pow(1.0 - max(dot(n, v), 0.0), 2.5);
  vec3 c = mix(uBg, uInk, uDay * lit + uNight * (1.0 - lit));
  c = mix(c, uRimColor, clamp(rim * uRim * (0.35 + 0.65 * lit), 0.0, 1.0));
  gl_FragColor = vec4(c, 1.0);
}`;

// The air: a shell's back faces, brightest at the planet's limb and gone at the shell's edge, on the day side.
const AIR_VERT = /* glsl */ `
varying vec3 vNv;
varying vec3 vNw;
void main() {
  vNv = normalize(normalMatrix * normal);
  vNw = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const AIR_FRAG = /* glsl */ `
uniform vec3 uColor, uSun;
uniform float uOpacity, uEdge;
varying vec3 vNv;
varying vec3 vNw;
void main() {
  float k = clamp(-normalize(vNv).z / uEdge, 0.0, 1.0);
  float lit = smoothstep(-0.35, 0.45, dot(normalize(vNw), uSun));
  gl_FragColor = vec4(uColor, k * k * k * lit * uOpacity);
}`;

// Earth's land in dots, lit by the Sun, and its night lights where the Sun is down.
const SURFACE_VERT = /* glsl */ `
uniform vec3 uPal[8];
uniform vec3 uSun;
uniform float uFocal, uDpr, uOpacity, uLights, uNightLand, uLamp;
attribute float aSize, aBright, aKind;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vec4 mv = viewMatrix * w;
  gl_Position = projectionMatrix * mv;
  vec3 n = normalize(mat3(modelMatrix) * position);
  float sun = dot(n, uSun);
  float a = aKind < 0.5
    ? aBright * mix(uNightLand, 0.85, smoothstep(-0.1, 0.25, sun))
    : aBright * (1.0 - smoothstep(-0.18, 0.04, sun)) * uLights * uLamp;
  float px = aSize * uFocal / max(-mv.z, 1e-6);
  float lo = 0.6 * uDpr;
  if (px < lo) { a *= px * px / (lo * lo); px = lo; }
  gl_PointSize = min(px, 5.0 * uDpr);
  a *= smoothstep(0.0, 0.22, dot(n, normalize(cameraPosition - w.xyz)));
  vColor = uPal[int(aKind + 0.5)];
  vAlpha = a * uOpacity;
  if (vAlpha < 0.002) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
}`;

const LINE_VERT = /* glsl */ `void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const LINE_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
void main() { gl_FragColor = vec4(uColor, uOpacity); }`;

/** A cloud of points under construction: position, size, brightness and palette kind for each. */
class Cloud {
  p: number[] = [];
  size: number[] = [];
  bright: number[] = [];
  kind: number[] = [];
  add(x: number, y: number, z: number, size: number, bright: number, kind: number) {
    this.p.push(x, y, z);
    this.size.push(size);
    this.bright.push(bright);
    this.kind.push(kind);
  }
  points(material: THREE.Material) {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute("aSize", new THREE.Float32BufferAttribute(this.size, 1));
    g.setAttribute("aBright", new THREE.Float32BufferAttribute(this.bright, 1));
    g.setAttribute("aKind", new THREE.Float32BufferAttribute(this.kind, 1));
    const pts = new THREE.Points(g, material);
    pts.frustumCulled = false;
    return pts;
  }
}

interface Layer {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** The layer's origin in the galactic frame, in AU. */
  origin: THREE.Vector3;
  /** AU per layer unit. */
  unit: number;
  near(d: number): number;
  far(d: number): number;
  on: boolean;
}

export function mountDrift(
  parent: HTMLElement,
  {
    theme,
    still,
    epoch,
    onFrame,
  }: { theme: Scheme; still: boolean; epoch?: number; onFrame?(fromEarthAU: number): void },
): Drift {
  const flight = createFlight({ still, epoch });
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.autoClear = false;
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
  parent.append(renderer.domElement);

  const rand = seededRandom(2040);
  const gauss = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());

  // One palette, one gain and one lens, shared by every material.
  const pal = KINDS.map(() => new THREE.Color());
  const shared = {
    uPal: { value: pal },
    uGain: { value: 1 },
    uFocal: { value: 1 },
    uDpr: { value: 1 },
  };
  const bg = new THREE.Color();
  // Raw sRGB numbers: these shaders write their colors as given.
  const paint = (rgb: string, c: THREE.Color) => {
    const [r, g, b] = rgb.split(",").map(Number);
    return c.setRGB(r / 255, g / 255, b / 255, THREE.LinearSRGBColorSpace);
  };

  const glows: THREE.ShaderMaterial[] = [];
  function glow({
    minPx = 1,
    maxPx = 64,
    near = [0, 0] as [number, number],
    fixed = false,
    dust = false,
    depthTest = false,
  } = {}) {
    const m = new THREE.ShaderMaterial({
      uniforms: {
        ...shared,
        uOpacity: { value: 1 },
        uMinPx: { value: minPx },
        uMaxPx: { value: maxPx },
        uFixed: { value: fixed ? 1 : 0 },
        uNear: { value: new THREE.Vector2(...near) },
      },
      vertexShader: GLOW_VERT,
      fragmentShader: GLOW_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest,
    });
    m.userData.dust = dust;
    glows.push(m);
    return m;
  }
  function line(kind: Kind, opacity: number, depthTest = false) {
    return new THREE.ShaderMaterial({
      uniforms: { uColor: { value: pal[K[kind]] }, uOpacity: { value: opacity } },
      vertexShader: LINE_VERT,
      fragmentShader: LINE_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest,
    });
  }
  const loop = (pts: THREE.Vector3[], material: THREE.Material) => {
    const l = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), material);
    l.frustumCulled = false;
    return l;
  };

  const layer = (unit: number, origin: THREE.Vector3, near: Layer["near"], far: Layer["far"]): Layer => ({
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(45, 1, 1, 2),
    origin,
    unit,
    near,
    far,
    on: true,
  });

  // Today's sky. The positions hold still, and Earth turns once a minute, as on the map.
  const { date, earthAU, sunDir, eX, eN, eZ } = flight;

  // Four scales, each in its own units and drawn far to near, so a float never has to span Earth to Andromeda.
  const cosmos = layer(
    KLY_AU,
    new THREE.Vector3(),
    (d) => Math.max(d * 1e-3, 1e-6),
    (d) => d * 10 + 8000,
  );
  const stars = layer(
    LY_AU,
    new THREE.Vector3(),
    (d) => Math.max(d * 1e-3, 1e-5),
    (d) => d * 10 + 5000,
  );
  const solar = layer(
    1,
    new THREE.Vector3(),
    (d) => Math.max(d * 1e-3, 1e-7),
    (d) => d * 10 + 3e5,
  );
  const earth = layer(
    R_E_AU,
    earthAU,
    (d) => d * 0.02,
    (d) => d + 150,
  );
  const layers = [cosmos, stars, solar, earth];

  // ── Earth and the Moon, in Earth radii ──
  const globeUniforms = () => ({
    uBg: { value: bg },
    uInk: { value: pal[K.ink] },
    uRimColor: { value: pal[K.ink] },
    uSun: { value: sunDir },
    uDay: { value: 0 },
    uNight: { value: 0 },
    uRim: { value: 0 },
  });
  const earthGlobe = new THREE.ShaderMaterial({
    uniforms: globeUniforms(),
    vertexShader: GLOBE_VERT,
    fragmentShader: GLOBE_FRAG,
  });
  const moonGlobe = new THREE.ShaderMaterial({
    uniforms: globeUniforms(),
    vertexShader: GLOBE_VERT,
    fragmentShader: GLOBE_FRAG,
  });
  const spin = new THREE.Group();
  spin.add(new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), earthGlobe));
  earth.scene.add(spin);

  const AIR = 1.06;
  const air = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: pal[K.mind] },
      uSun: { value: sunDir },
      uOpacity: { value: 0.6 },
      uEdge: { value: Math.sqrt(1 - 1 / (AIR * AIR)) },
    },
    vertexShader: AIR_VERT,
    fragmentShader: AIR_FRAG,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
  });
  earth.scene.add(new THREE.Mesh(new THREE.SphereGeometry(AIR, 96, 64), air));

  const surface = new THREE.ShaderMaterial({
    uniforms: {
      ...shared,
      uSun: { value: sunDir },
      uOpacity: { value: 0 },
      uLights: { value: 1 },
      uNightLand: { value: 0.12 },
      uLamp: { value: 1 },
    },
    vertexShader: SURFACE_VERT,
    fragmentShader: GLOW_FRAG,
    transparent: true,
    depthWrite: false,
  });
  glows.push(surface);
  let surfaceAt = Infinity;

  const moonAt = new THREE.Vector3().copy(moonOffset(date)).divideScalar(R_E_AU);
  const moon = new THREE.Mesh(new THREE.SphereGeometry(1737.4 / 6371.0084, 48, 32), moonGlobe);
  moon.position.copy(moonAt);
  earth.scene.add(moon);
  // The Moon's orbit, drawn through where it is today.
  const moonU = moonAt.clone().normalize();
  const moonV = moonU.clone().cross(eN).normalize();
  const moonRing = loop(
    Array.from({ length: 180 }, (_, i) =>
      moonU
        .clone()
        .multiplyScalar(Math.cos((i / 180) * 2 * Math.PI))
        .addScaledVector(moonV, Math.sin((i / 180) * 2 * Math.PI))
        .multiplyScalar(moonAt.length()),
    ),
    line("ink", 0.3, true),
  );
  earth.scene.add(moonRing);
  // Earth and the Moon as points of light, once they are too small to see as globes.
  const pair = new Cloud();
  pair.add(0, 0, 0, 8, 1, K.mind);
  pair.add(moonAt.x, moonAt.y, moonAt.z, 6, 0.85, K.ink);
  const pairGlow = glow({ fixed: true });
  earth.scene.add(pair.points(pairGlow));

  // ── The Sun's family, in AU ──
  const sun = new Cloud();
  sun.add(0, 0, 0, 1.4, 0.32, K.sun);
  sun.add(0, 0, 0, 0.18, 0.7, K.sun);
  sun.add(0, 0, 0, 0.02, 1, K.sun);
  const sunGlow = glow({ minPx: 2.5, maxPx: 190 });
  solar.scene.add(sun.points(sunGlow));

  const jd = julianDate(date);
  const planets = new Cloud();
  const PLANET_KIND: Kind[] = ["ink", "ink", "mind", "rose", "warm", "warm", "young", "young"];
  const PLANET_PX = [2.2, 2.8, 3.2, 2.5, 4.2, 3.8, 3.1, 3.1];
  const orbits = PLANETS.map((p: { name: string }, i: number) => {
    const at = bodyPosition(p.name, date);
    planets.add(at.x, at.y, at.z, PLANET_PX[i], 1, K[PLANET_KIND[i]]);
    const path = orbitPath(p, jd, 256).map((v: number[]) => eclipticToGalactic(new THREE.Vector3(v[0], v[1], v[2])));
    return loop(path, line(i === 2 ? "mind" : "ink", 0));
  });
  orbits.forEach((o: THREE.LineLoop) => solar.scene.add(o));
  const planetGlow = glow({ fixed: true });
  solar.scene.add(planets.points(planetGlow));

  // The belts, in the ecliptic. Asteroids skip the Kirkwood gaps, Jupiter's 3:1, 5:2 and 7:3, and the Trojans keep
  // 60° ahead of and behind Jupiter.
  const ecliptic = (r: number, angle: number, incl: number) =>
    eclipticToGalactic(
      new THREE.Vector3(
        r * Math.cos(angle) * Math.cos(incl),
        r * Math.sin(incl),
        -r * Math.sin(angle) * Math.cos(incl),
      ),
    );
  const belt = new Cloud();
  for (let n = 0; n < 7000;) {
    const a = 2.1 + rand() * 1.2;
    if ([2.5, 2.82, 2.95].some((gap) => Math.abs(a - gap) < 0.025)) continue;
    const v = ecliptic(a * (1 + gauss() * 0.06), rand() * 2 * Math.PI, gauss() * 8 * DEG);
    belt.add(v.x, v.y, v.z, 0.012, 0.35 + rand() * 0.3, rand() < 0.3 ? K.warm : K.ink);
    n++;
  }
  const jupiter = new THREE.Vector3().copy(bodyPosition("Jupiter", date));
  const jupiterAngle = Math.atan2(-jupiter.dot(eZ), jupiter.dot(eX));
  for (let n = 0; n < 900; n++) {
    const v = ecliptic(
      5.2 * (1 + gauss() * 0.03),
      jupiterAngle + (n % 2 ? 1 : -1) * (60 * DEG + gauss() * 0.22),
      gauss() * 10 * DEG,
    );
    belt.add(v.x, v.y, v.z, 0.014, 0.6, K.warm);
  }
  const beltGlow = glow({ minPx: 0.8, maxPx: 2.5 });
  solar.scene.add(belt.points(beltGlow));

  // The Kuiper belt, thickest at 42 to 48 AU, with Pluto's kin at 39.4 AU.
  const kuiper = new Cloud();
  for (let n = 0; n < 8000; n++) {
    const r = rand() < 0.2 ? 39.4 + gauss() * 0.6 : rand() < 0.6 ? 42 + rand() * 6 : 30 + rand() * 25;
    const v = ecliptic(r, rand() * 2 * Math.PI, gauss() * (rand() < 0.5 ? 3 : 14) * DEG);
    kuiper.add(v.x, v.y, v.z, 0.12, 0.5 + rand() * 0.4, rand() < 0.6 ? K.young : K.ink);
  }
  const kuiperGlow = glow({ minPx: 0.8, maxPx: 2.5 });
  solar.scene.add(kuiper.points(kuiperGlow));

  // The Oort cloud, a shell from about 2,000 to 100,000 AU. No one has seen it: it is inferred from long-period comets.
  const oort = new Cloud();
  for (let n = 0; n < 9000; n++) {
    const r = 2000 * Math.pow(50, rand());
    const v = new THREE.Vector3(gauss(), gauss(), gauss()).normalize().multiplyScalar(r);
    oort.add(v.x, v.y, v.z, r * 0.004, 0.35 + rand() * 0.3, rand() < 0.5 ? K.young : K.ink);
  }
  const oortGlow = glow({ minPx: 0.8, maxPx: 2.2, near: [80, 900] });
  solar.scene.add(oort.points(oortGlow));

  // ── The stars, in light-years: HYG, loaded when it comes ──
  const starMat = new THREE.ShaderMaterial({
    uniforms: { ...shared, uOpacity: { value: 0 } },
    vertexShader: STAR_VERT,
    fragmentShader: GLOW_FRAG,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });
  glows.push(starMat);
  let starsAt = Infinity;

  // ── The Milky Way and the Local Group, in thousands of light-years ──
  const kpc = PC_LY; // kly per kpc
  const gc = new THREE.Vector3().copy(GALACTIC_CENTER).divideScalar(KLY_AU);
  const scale = R0 / REID_R0;
  /** A point in the disk: galactocentric radius and azimuth, height above the plane. kpc and radians. */
  const inDisk = (R: number, beta: number, z: number): [number, number, number] => [
    gc.x - R * kpc * Math.cos(beta),
    gc.y + z * kpc,
    gc.z - R * kpc * Math.sin(beta),
  ];
  const armR = (arm: (typeof ARMS)[number], beta: number) => {
    const b = Math.min(arm.hi, Math.max(arm.lo, beta));
    const psi = b < arm.kink ? arm.a : arm.b;
    let ln = Math.log(arm.r) - (b - arm.kink) * DEG * Math.tan(psi * DEG);
    if (beta !== b) ln -= (beta - b) * DEG * Math.tan(12 * DEG);
    return Math.exp(ln) * scale;
  };
  const shares = ARMS.reduce((s, a) => s + a.share, 0);
  /** A random place along a random arm, fewer where it runs past what is measured. */
  function onArm(): [R: number, beta: number, arm: (typeof ARMS)[number]] {
    for (;;) {
      let pick = rand() * shares;
      const arm = ARMS.find((a) => (pick -= a.share) < 0) ?? ARMS[0];
      const beta = arm.lo - arm.ext + rand() * (arm.hi - arm.lo + 2 * arm.ext);
      const over = Math.max(arm.lo - beta, beta - arm.hi, 0) / arm.ext;
      if (rand() < over * 0.9) continue;
      const R = armR(arm, beta);
      if (R > 2.9 && R < 17) return [R, beta * DEG, arm];
    }
  }

  const mw = new Cloud();
  // The old disk.
  for (let n = 0; n < 46000;) {
    const R = -DISK.length * Math.log(rand() * rand());
    if (R > 16) continue;
    const [x, y, z] = inDisk(R, rand() * 2 * Math.PI, gauss() * DISK.height * (0.7 + R / 10));
    mw.add(x, y, z, 0.34, 0.15, rand() < 0.55 ? K.warm : K.ink);
    n++;
  }
  // The arms' young stars.
  for (let n = 0; n < 62000; n++) {
    const [R, beta, arm] = onArm();
    const [x, y, z] = inDisk(R + gauss() * (0.22 + arm.w * 0.5), beta + gauss() * 0.01, gauss() * 0.09);
    const k = rand();
    mw.add(x, y, z, 0.3, 0.3, k < 0.55 ? K.young : k < 0.9 ? K.ink : K.warm);
  }
  // Star-forming knots along the arms.
  for (let c = 0; c < 170; c++) {
    const [R, beta] = onArm();
    const count = 8 + Math.floor(rand() * 18);
    for (let n = 0; n < count; n++) {
      const [x, y, z] = inDisk(R + gauss() * 0.07, beta + (gauss() * 0.07) / R, gauss() * 0.03);
      mw.add(x, y, z, 0.12, 0.85, n % 5 ? K.rose : K.young);
    }
  }
  // The bulge and the long bar.
  const along = new THREE.Vector3(-Math.cos(BAR.angle * DEG), 0, -Math.sin(BAR.angle * DEG));
  const across = new THREE.Vector3(Math.sin(BAR.angle * DEG), 0, -Math.cos(BAR.angle * DEG));
  const inBar = (a: number, c: number, z: number): [number, number, number] => [
    gc.x + (along.x * a + across.x * c) * kpc,
    gc.y + z * kpc,
    gc.z + (along.z * a + across.z * c) * kpc,
  ];
  for (let n = 0; n < 13000; n++) {
    const [x, y, z] = inBar(gauss() * 0.95, gauss() * 0.5, gauss() * 0.4);
    mw.add(x, y, z, 0.5, 0.15, K.warm);
  }
  for (let n = 0; n < 8000; n++) {
    const [x, y, z] = inBar(BAR.half * (rand() - rand()), gauss() * 0.3, gauss() * 0.12);
    mw.add(x, y, z, 0.4, 0.2, rand() < 0.7 ? K.warm : K.ink);
  }
  for (let n = 0; n < 1600; n++) {
    const [x, y, z] = inBar(gauss() * 0.15, gauss() * 0.15, gauss() * 0.1);
    mw.add(x, y, z, 0.3, 0.3, K.warm);
  }
  const mwGlow = glow({ maxPx: 3.5, near: [0.5, 2.6] });
  cosmos.scene.add(mw.points(mwGlow));

  // Dust along the arms' inner edges, which dims the light behind it.
  const dust = new Cloud();
  for (let n = 0; n < 16000; n++) {
    const [R, beta] = onArm();
    const [x, y, z] = inDisk(R * 0.975 + gauss() * 0.14, beta, gauss() * 0.04);
    dust.add(x, y, z, 0.5, 0.32, K.dust);
  }
  const dustGlow = glow({ maxPx: 4, near: [0.5, 2.6], dust: true });
  const dustPts = dust.points(dustGlow);
  dustPts.renderOrder = 1;
  cosmos.scene.add(dustPts);

  // About 157 globular clusters in the halo, thinning as r^-3.5. Harris 2010.
  const globulars = new Cloud();
  for (let n = 0; n < 157; n++) {
    const r = Math.min(40, 0.6 * Math.pow(1 - rand(), -2));
    const v = new THREE.Vector3(gauss(), gauss(), gauss())
      .normalize()
      .multiplyScalar(r * kpc)
      .add(gc);
    globulars.add(v.x, v.y, v.z, 0.05, 0.9, K.warm);
  }
  cosmos.scene.add(globulars.points(glow({ minPx: 1.1, maxPx: 3 })));

  // The Local Group: each galaxy where the Local Volume Database puts it, its disk tilted as its outline shows.
  const others = new Cloud();
  // Each big galaxy's glow, so the Local Group reads from afar. The Milky Way's first.
  const halos = new Cloud();
  halos.add(gc.x, gc.y, gc.z, 120, 0.18, K.warm);
  type Basis = { u: THREE.Vector3; v: THREE.Vector3; n: THREE.Vector3; size: number };
  function basisOf(g: (typeof GALAXIES)[number]): Basis {
    const e = galaxyExtent(g);
    if (!e) {
      // No outline: a blob, square to our line of sight.
      const radial = new THREE.Vector3().copy(galaxyPosition(g)).normalize();
      const u = new THREE.Vector3(0, 1, 0).cross(radial).normalize();
      return { u, v: radial.clone().cross(u), n: radial, size: galaxyViewRadius(g) / 1000 };
    }
    const q = e.minorLy / e.majorLy;
    const u = new THREE.Vector3().copy(e.major);
    const v = new THREE.Vector3()
      .copy(e.minor)
      .multiplyScalar(q)
      .addScaledVector(new THREE.Vector3().copy(e.radial), Math.sqrt(1 - q * q));
    return { u, v, n: u.clone().cross(v).normalize(), size: e.majorLy / 1000 };
  }
  for (const g of GALAXIES) {
    const at = new THREE.Vector3().copy(galaxyPosition(g)).divideScalar(1000);
    const { u, v, n, size } = basisOf(g);
    const put = (x: number, y: number, z: number, s: number, b: number, k: number) => {
      const p = at.clone().addScaledVector(u, x).addScaledVector(v, y).addScaledVector(n, z);
      others.add(p.x, p.y, p.z, s, b, k);
    };
    const disk = (count: number, length: number, edge: number, b: number, kinds: number[]) => {
      for (let i = 0; i < count;) {
        const R = -length * Math.log(rand() * rand());
        if (R > edge) continue;
        const t = rand() * 2 * Math.PI;
        put(R * Math.cos(t), R * Math.sin(t), gauss() * 0.3, 0.6, b, kinds[i % kinds.length]);
        i++;
      }
    };
    if (g.id === "m31" || g.id === "m33") halos.add(at.x, at.y, at.z, size * 1.6, 0.22, K.warm);
    if (g.id === "m31") {
      // Andromeda: a big bulge, a disk of scale length 5.3 kpc, and the star-forming ring at 10 kpc.
      for (let i = 0; i < 5000; i++) put(gauss() * 3.2, gauss() * 3.2, gauss() * 2.4, 0.7, 0.3, K.warm);
      disk(9000, 5.3 * kpc, size, 0.22, [K.ink, K.warm, K.young]);
      for (let i = 0; i < 7000; i++) {
        const R = 10 * kpc + gauss() * 2.4;
        const t = rand() * 2 * Math.PI;
        put(R * Math.cos(t), R * Math.sin(t), gauss() * 0.3, 0.5, 0.3, i % 4 ? K.young : K.rose);
      }
    } else if (g.id === "m33") {
      // Triangulum: a loose two-armed disk.
      for (let i = 0; i < 6000; i++) {
        const R = -1.4 * kpc * Math.log(rand() * rand());
        if (R > size) continue;
        const t = (i % 2) * Math.PI + Math.log(R + 0.5) / Math.tan(30 * DEG) + gauss() * (i % 3 ? 0.35 : 1.6);
        put(R * Math.cos(t), R * Math.sin(t), gauss() * 0.2, 0.5, 0.28, i % 3 ? K.young : K.ink);
      }
    } else if (g.id === "lmc") {
      // The Large Magellanic Cloud: an off-center bar in a disk, and the Tarantula's fire at the bar's end.
      for (let i = 0; i < 2000; i++) put(1.2 + gauss() * 2.4, gauss() * 0.7, gauss() * 0.4, 0.4, 0.3, K.warm);
      disk(3500, 1.5 * kpc, size, 0.22, [K.young, K.ink]);
      for (let i = 0; i < 300; i++) put(3.6 + gauss() * 0.4, 1.6 + gauss() * 0.4, gauss() * 0.2, 0.25, 0.7, K.rose);
    } else if (g.id === "smc") {
      // The Small Magellanic Cloud runs deep along our line of sight.
      for (let i = 0; i < 2600; i++) put(gauss() * 2.2, gauss() * 1.4, gauss() * 5, 0.5, 0.28, i % 3 ? K.young : K.ink);
    } else {
      const s = Math.min(4, Math.max(0.4, size * 0.5));
      const old = g.id === "m32" || g.id === "ngc205";
      for (let i = 0; i < 600; i++)
        put(gauss() * s, gauss() * s * 0.7, gauss() * s * 0.6, 0.4, 0.3, old ? K.warm : K.young);
    }
  }
  const othersGlow = glow({ minPx: 0.8, maxPx: 3.5 });
  cosmos.scene.add(others.points(othersGlow));
  const halosGlow = glow({ minPx: 2, maxPx: 160 });
  cosmos.scene.add(halos.points(halosGlow));

  // Home: a marker where the Sun is, once it is too small to see.
  const homeCloud = new Cloud();
  homeCloud.add(0, 0, 0, 7, 1, K.mind);
  const homeGlow = glow({ fixed: true });
  cosmos.scene.add(homeCloud.points(homeGlow));

  // The nearby stars as a map: each star within 20 light-years on a stalk down to the Galaxy's plane, and rings every
  // five light-years around the Sun. Built when the stars come.
  const mapDots = glow({ fixed: true });
  const stalks = line("ink", 0);
  const rings = line("ink", 0);
  for (let r = 5; r <= 20; r += 5)
    stars.scene.add(
      loop(
        Array.from(
          { length: 128 },
          (_, i) => new THREE.Vector3(r * Math.cos((i / 128) * 2 * Math.PI), 0, r * Math.sin((i / 128) * 2 * Math.PI)),
        ),
        rings,
      ),
    );

  // ── Data that comes later: Earth's land and lights, and the stars ──
  let gone = false;
  Promise.all([landMask(), import("./game/lights.json")]).then(([isLand, { default: lights }]) => {
    if (gone) return;
    const ground = new Cloud();
    const N = 52000;
    for (let i = 0; i < N; i++) {
      const y = 1 - (2 * (i + 0.5)) / N;
      const t = i * Math.PI * (3 - Math.sqrt(5));
      const lat = Math.asin(y) / DEG;
      const lon = Math.atan2(-Math.sin(t), Math.cos(t)) / DEG;
      if (!isLand(lat, lon)) continue;
      const [x, yy, z] = onGlobe(lat, lon, 1.002);
      ground.add(x, yy, z, 0.011, 0.9, K.ink);
    }
    for (const [lat, lon, b] of lights as [number, number, number][]) {
      const [x, y, z] = onGlobe(lat, lon, 1.004);
      ground.add(x, y, z, 0.007 + b * 0.0022, 0.3 + b * 0.08, K.lamp);
    }
    spin.add(ground.points(surface));
    surfaceAt = clock;
    dirty = true;
  });
  fetch(new URL("../../data/stars.bin", import.meta.url))
    .then((r) => r.arrayBuffer())
    .then((buf) => {
      if (gone) return;
      const raw = new Float32Array(buf);
      const n = raw.length / 5;
      const pos = new Float32Array(n * 3);
      const abs = new Float32Array(n);
      const bv = new Float32Array(n);
      const near = new Cloud();
      const stalk: number[] = [];
      for (let i = 0; i < n; i++) {
        const [x, y, z, mag, color] = [raw[i * 5], raw[i * 5 + 1], raw[i * 5 + 2], raw[i * 5 + 3], raw[i * 5 + 4]];
        const ly = Math.hypot(x, y, z);
        if (ly > 1e-3 && ly < 20) {
          near.add(x, y, z, 2.6, 0.9, color < 0.3 ? K.young : color > 1.2 ? K.warm : K.ink);
          stalk.push(x, y, z, x, 0, z);
        }
        pos[i * 3] = x;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = z;
        const pc = Math.hypot(x, y, z) / PC_LY;
        // HYG lists the Sun at the origin: give it its own absolute magnitude.
        abs[i] = pc < 1e-6 ? 4.83 : mag - 5 * Math.log10(pc) + 5;
        bv[i] = pc < 1e-6 ? 0.65 : Number.isFinite(color) ? color : 0.6;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      g.setAttribute("aAbs", new THREE.BufferAttribute(abs, 1));
      g.setAttribute("aBV", new THREE.BufferAttribute(bv, 1));
      const pts = new THREE.Points(g, starMat);
      pts.frustumCulled = false;
      stars.scene.add(pts);
      stars.scene.add(near.points(mapDots));
      const segs = new THREE.LineSegments(
        new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(stalk, 3)),
        stalks,
      );
      segs.frustumCulled = false;
      stars.scene.add(segs);
      starsAt = clock;
      dirty = true;
    });

  // ── Theme ──
  function setTheme(scheme: Scheme) {
    const p = PALETTES[scheme];
    KINDS.forEach((k, i) => paint(p[k], pal[i]));
    paint(p.dust, bg);
    shared.uGain.value = p.gain;
    renderer.setClearColor(p.bg);
    for (const m of glows) m.blending = p.additive && !m.userData.dust ? THREE.AdditiveBlending : THREE.NormalBlending;
    const dark = scheme === "dark";
    const set = (m: THREE.ShaderMaterial, values: Record<string, unknown>) => {
      for (const [k, v] of Object.entries(values)) m.uniforms[k].value = v;
    };
    set(earthGlobe, {
      uDay: dark ? 0.07 : 0,
      uNight: dark ? 0 : 0.08,
      uRim: dark ? 0.8 : 0.9,
      uRimColor: pal[dark ? K.mind : K.ink],
    });
    // On paper, the land stays drawn through the night, and the lamps take more ink to show.
    set(surface, { uNightLand: dark ? 0.12 : 0.4, uLamp: dark ? 1 : 1.8 });
    set(moonGlobe, { uDay: dark ? 0.42 : 0, uNight: dark ? 0 : 0.16, uRim: dark ? 0.15 : 0.85 });
    air.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
    air.uniforms.uOpacity.value = dark ? 0.6 : 0.3;
    dirty = true;
  }

  // ── Size ──
  function fit() {
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    const fov = flight.lens(w, h);
    for (const L of layers) {
      L.camera.fov = fov / DEG;
      L.camera.aspect = w / h;
      L.camera.setViewOffset(w, h, 0, h * LIFT, w, h);
    }
    shared.uFocal.value = (h * dpr) / (2 * Math.tan(fov / 2));
    shared.uDpr.value = dpr;
    dirty = true;
  }
  const ro = new ResizeObserver(fit);
  ro.observe(parent);

  let clock = 0;
  let dirty = true;
  const look = new THREE.Vector3();

  /** Data fades in when it arrives, or shows at once in a still. */
  const arrived = (at: number) => (still ? Number(at < Infinity) : smooth((clock - at) / 1.6));

  function draw() {
    const { logD, D, target, cam, up } = flight.at(clock);

    for (const L of layers) {
      const d = D / L.unit;
      L.camera.position.copy(cam).sub(L.origin).divideScalar(L.unit);
      L.camera.up.copy(up);
      L.camera.lookAt(look.copy(target).sub(L.origin).divideScalar(L.unit));
      L.camera.near = L.near(d);
      L.camera.far = L.far(d);
      L.camera.updateProjectionMatrix();
    }

    // What shows at this scale.
    const x = logD;
    earth.on = x < -0.2;
    solar.on = x < 7;
    stars.on = x < 9.4;
    spin.quaternion.copy(bodyOrientation("Earth", new Date(date.getTime() + clock * 1436e3)));
    surface.uniforms.uOpacity.value = arrived(surfaceAt);
    surface.uniforms.uLights.value = 1 - ramp(x, -2.7, -1.9);
    (moonRing.material as THREE.ShaderMaterial).uniforms.uOpacity.value = 0.3 * band(x, -3.4, -2.6, -1.2, -0.5);
    planetGlow.uniforms.uOpacity.value = band(x, -2.1, -1.2, 3.6, 4.6);
    orbits.forEach((o: THREE.LineLoop, i: number) => {
      (o.material as THREE.ShaderMaterial).uniforms.uOpacity.value =
        (i === 2 ? 0.55 : 0.2) * band(x, -1.6, -0.5, 3.3, 4.4);
    });
    beltGlow.uniforms.uOpacity.value = band(x, -0.8, 0.1, 2.6, 3.4);
    kuiperGlow.uniforms.uOpacity.value = band(x, 0.6, 1.5, 3.8, 4.6);
    oortGlow.uniforms.uOpacity.value = band(x, 2.6, 3.6, 5.2, 6.0);
    pairGlow.uniforms.uOpacity.value = band(x, -3.1, -2.5, -0.9, -0.4);
    // From inside the Milky Way, the other galaxies are faint smudges.
    othersGlow.uniforms.uOpacity.value = 0.3 + 0.7 * ramp(x, 9.5, 10.6);
    halosGlow.uniforms.uOpacity.value = ramp(x, 10.4, 11.1);
    const map = arrived(starsAt) * band(x, 5.6, 6.2, 7.0, 7.6);
    mapDots.uniforms.uOpacity.value = map;
    stalks.uniforms.uOpacity.value = 0.2 * map;
    rings.uniforms.uOpacity.value = 0.16 * map;
    starMat.uniforms.uOpacity.value = arrived(starsAt) * (1 - ramp(x, 8.6, 9.3));
    // From inside, the Milky Way is a soft band across the sky.
    mwGlow.uniforms.uOpacity.value = dustGlow.uniforms.uOpacity.value = 0.4 + 0.6 * ramp(x, 7.5, 9);
    mwGlow.uniforms.uMaxPx.value = 1.6 + 1.9 * ramp(x, 7.5, 9);
    homeGlow.uniforms.uOpacity.value = band(x, 5.4, 6.1) * (0.65 + 0.35 * Math.sin(clock * 2.2));

    renderer.clear();
    for (const L of layers) {
      if (!L.on) continue;
      renderer.clearDepth();
      renderer.render(L.scene, L.camera);
    }
    onFrame?.(Math.max(0, cam.distanceTo(earthAU) - R_E_AU));
  }

  let raf = 0;
  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    // A still is one frame, redrawn only when something changes.
    if (still && !dirty) return;
    clock = flight.clock(now);
    dirty = false;
    draw();
  }

  setTheme(theme);
  fit();
  raf = requestAnimationFrame(frame);

  return {
    setTheme,
    home: () => flight.home(clock),
    dispose() {
      gone = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      flight.dispose();
      for (const L of layers)
        L.scene.traverse((o) => {
          if (o instanceof THREE.Mesh || o instanceof THREE.Points || o instanceof THREE.Line) {
            o.geometry.dispose();
            (o.material as THREE.Material).dispose();
          }
        });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}

/** A point on Earth in the globe's frame: +Y north, +X the prime meridian, as the atlas orients it. */
function onGlobe(lat: number, lon: number, r: number): [number, number, number] {
  const φ = lat * DEG;
  const λ = lon * DEG;
  return [r * Math.cos(φ) * Math.cos(λ), r * Math.sin(φ), -r * Math.cos(φ) * Math.sin(λ)];
}

/** Land or sea, read off the atlas's day map: the sea is the blue. */
async function landMask() {
  const img = new Image();
  img.src = earthDaymap.src;
  await img.decode();
  const W = 1024;
  const H = 512;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d", { willReadFrequently: true })!;
  g.drawImage(img, 0, 0, W, H);
  const d = g.getImageData(0, 0, W, H).data;
  return (lat: number, lon: number) => {
    const x = Math.min(W - 1, Math.floor((lon / 360 + 0.5) * W));
    const y = Math.min(H - 1, Math.floor((0.5 - lat / 180) * H));
    const i = (y * W + x) * 4;
    return !(d[i + 2] > d[i] * 1.25 + 4 && d[i + 2] >= d[i + 1] * 0.9);
  };
}
