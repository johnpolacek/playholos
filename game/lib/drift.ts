// The drift behind the first screen: a slow flight out from Earth past the Moon, the planets, the Oort cloud and the
// nearby stars to the Milky Way and the Local Group, then home. Real data throughout: today's Earth, Moon and planets
// from the atlas's ephemeris, NASA's night lights, the HYG stars, the Local Volume galaxies, and a Milky Way drawn to
// the measured arms and bar. Sources in HOLOS_RESEARCH.md, The drift. Client only.
import * as THREE from "three";
import earthDaymap from "../../assets/earth_daymap.jpg";
import moonMap from "../../assets/moon.jpg";
import { PC_LY, PLANETS, julianDate, orbitPath, seededRandom } from "../../src/astronomy.js";
import { bodyOrientation, bodyPosition, moonOffset } from "../../src/ephemeris.js";
import { GALAXIES, galaxyExtent, galaxyPosition, galaxyViewRadius } from "../../src/galaxies.js";
import { GALACTIC_CENTER, LY_AU, eclipticToGalactic } from "../../src/navigation.js";
import { skyBasis } from "../../src/coordinates.js";
import { AGE, WHOLE_ROAD, agoAt, place as placeOf, roadZoom } from "./game/road";
import { YEAR_0 } from "./game/clock";
import { KNOCKS, RADARS_SINCE, TARGET_DEC } from "./game/knocks";
import SKY from "./game/sky.json";
import LEADS from "./game/leads.json";
import { MACHINES, type MachineKind } from "./game/machines";
import {
  DEG,
  LIFT,
  STOPS,
  R_E_AU,
  type Stop,
  band,
  type Pose,
  HALF_VIEW_KM,
  createDirector,
  easeInOut,
  leanAt,
  lens,
  ramp,
  smooth,
} from "./flight";

/** The memory screens' dials, tweened by their intros and read every frame. 0 to 1. */
export interface Dials {
  /** The lights come on, cities first. */
  lit?: number;
  /** Threads rise from the cities to one point. */
  threads?: number;
  /** The point glows: the Mind. */
  mind?: number;
  /** The scale: log10 of the km across half the view's short side. */
  zoom?: number;
  /** The Sun rises over Earth's edge. */
  rise?: number;
  /** How far the Sun's light has come on its road, in log time: 0 at its birth to 1 at this morning. */
  u?: number;
  /** Earth wakes, and the Sun's light on the road fades. */
  earth?: number;
  /** The year, as Earth's radar shell spreads from 1950, as our messages fly, or as our builds go up. */
  year?: number;
  /** The map's rings and stars come in. */
  grid?: number;
  /** The stars Earth knocked on are named. */
  labels?: number;
  /** Meeting the Mind: Earth's dishes, telescopes and data centers come on, one by one. */
  dish?: number;
  scope?: number;
  compute?: number;
  /** What doesn't fit: how many of Earth's leads are lit, one by one, from 0 to all of them. */
  found?: number;
  /** The lead the Will is looking at, the message, or the build, counted from 1. 0 for none. */
  focus?: number;
}

/** What the sky shows: the title, the map, or one of the screens before the shell. */
export type Mode =
  | "title"
  | "map"
  | "wake"
  | "origins"
  | "people"
  | "stand"
  | "inherit"
  | "charter"
  | "mind"
  | "leads"
  | "beams"
  | "works";

/** One screen's view of the sky. */
export interface Show {
  mode: Mode;
  /** The screen's intro dials. */
  dials?: Dials;
  /** For "origins": the moments on the Sun's road, by when they fall in its log time. */
  moments?: { u: number; dial: boolean }[];
  /** Where the screen's art sits in the sky's frame, in CSS pixels, each frame. The whole frame when not given. */
  rect?: () => { x: number; y: number; w: number; h: number } | null;
  /** For "title": the camera's distance from Earth's surface in AU, each frame. */
  onFrame?(fromEarthAU: number): void;
  /** For "leads": the stars of Earth's leads, by the names players see, in the order they are lit. */
  leads?: string[];
  /** For "beams": our messages on their way, each by its star, the decimal year we sent it, the light-years it goes,
   *  and whether it is the reply that could come back. */
  beams?: { star: string; sent: number; ly: number; reply: boolean }[];
  /** For "works": our builds with places, each by its name, where it stands on Earth or the Moon, whether it is
   *  queued, and when it is done, in Years from Year 0. */
  works?: {
    name: string;
    site: { on: "earth" | "moon"; places: { lat: number; lon: number }[] };
    queued: boolean;
    done: number | null;
  }[];
  /** For "people" and "mind": where the Mind is on screen, in CSS pixels, each frame. */
  onMind?(x: number, y: number): void;
  /** For "inherit", "stand", "leads", "beams" and "works": where their labeled places are on screen, each frame. */
  onMarks?(marks: Mark[]): void;
  /** For "inherit": km per CSS pixel at the art's center, and the art's size. */
  onScale?(kmPerPx: number, w: number, h: number): void;
}

/** A labeled place on screen, in CSS pixels, and how much it shows. */
export interface Mark {
  id: string;
  x: number;
  y: number;
  a: number;
}

export interface Drift {
  /** Turns to another screen's view. The camera flies there. Returns the flight's length in seconds. */
  show(next: Show): number;
  /** The title: dives home to Earth. Returns the dive's length in seconds. */
  home(): number;
  /** The map: flies to a stop. */
  go(stop: Stop): void;
  /** The map: turns the view by a drag, as shares of the map's width and height. */
  turn(dx: number, dy: number): void;
  dispose(): void;
}

const KLY_AU = 1000 * LY_AU;
/** The Moon's radius, in Earth radii. */
const MOON_R = 1737.4 / 6371.0084;
/** How near a build on the Moon is seen: log10 of AU from the middle of its view, about 7,800 km. */
const NEAR_WORK = -4.28;
/** How near builds on Earth are seen, from its middle: about 53,000 km, so their domes clear its edge. */
const EARTH_WORK = -3.45;

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

// The night: chalk and warm light that add up on slate, and dust that dims them.
const PALETTE: { bg: string } & Record<Kind, string> = {
  bg: "#121314",
  ink: "230,227,219",
  warm: "255,206,150",
  young: "168,198,255",
  rose: "255,126,148",
  lamp: "232,180,92",
  mind: "91,184,214",
  sun: "255,236,190",
  dust: "18,19,20",
};

const GLOW_VERT = /* glsl */ `
uniform vec3 uPal[8];
uniform float uFocal, uDpr, uOpacity, uMinPx, uMaxPx, uFixed, uReveal;
uniform vec2 uNear;
attribute float aSize, aBright, aKind, aRank;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float depth = max(-mv.z, 1e-12);
  // A point waits for its turn, where a screen reveals them in order.
  float a = aBright * uOpacity * clamp((uReveal - aRank) * 400.0 + 1.0, 0.0, 1.0);
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
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(p, p);
  if (r2 > 1.0) discard;
  gl_FragColor = vec4(vColor, min(1.0, vAlpha * (exp(-r2 * 4.5) - 0.011)));
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

// A globe in two tones: the night, a little lighter where the Sun is up, and a rim.
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
uniform float uDay, uRim;
varying vec3 vN;
varying vec3 vW;
void main() {
  vec3 n = normalize(vN);
  vec3 v = normalize(cameraPosition - vW);
  float lit = smoothstep(-0.12, 0.3, dot(n, uSun));
  float rim = pow(1.0 - max(dot(n, v), 0.0), 2.5);
  vec3 c = mix(uBg, uInk, uDay * lit);
  c = mix(c, uRimColor, clamp(rim * uRim * (0.35 + 0.65 * lit), 0.0, 1.0));
  gl_FragColor = vec4(c, 1.0);
}`;

// The air: a shell's back faces, brightest at the planet's limb and gone at the shell's edge, on the day side.
const AIR_VERT = /* glsl */ `
varying vec3 vNv;
varying vec3 vNw;
varying vec3 vW;
void main() {
  vNv = normalize(normalMatrix * normal);
  vNw = normalize(mat3(modelMatrix) * normal);
  vW = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

// Looking toward the Sun through the air, it scatters forward and burns gold: dawn from space.
const AIR_FRAG = /* glsl */ `
uniform vec3 uColor, uSun, uDawn;
uniform float uOpacity, uEdge;
varying vec3 vNv;
varying vec3 vNw;
varying vec3 vW;
void main() {
  float k = clamp(-normalize(vNv).z / uEdge, 0.0, 1.0);
  float lit = smoothstep(-0.35, 0.45, dot(normalize(vNw), uSun));
  float dawn = pow(max(dot(normalize(vW - cameraPosition), uSun), 0.0), 40.0);
  gl_FragColor = vec4(mix(uColor, uDawn, min(1.0, dawn * 2.0)), k * k * k * (lit + dawn * 3.0) * uOpacity);
}`;

// Earth's land in dots, lit by the Sun, and its night lights where the Sun is down.
const SURFACE_VERT = /* glsl */ `
uniform vec3 uPal[8];
uniform vec3 uSun;
uniform float uFocal, uDpr, uOpacity, uLights, uLit;
attribute float aSize, aBright, aKind, aRank;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vec4 mv = viewMatrix * w;
  gl_Position = projectionMatrix * mv;
  vec3 n = normalize(mat3(modelMatrix) * position);
  float sun = dot(n, uSun);
  float a = aKind < 0.5
    ? aBright * mix(0.12, 0.85, smoothstep(-0.1, 0.25, sun))
    : aBright * (1.0 - smoothstep(-0.18, 0.04, sun)) * uLights * clamp((uLit - aRank) * 12.0, 0.0, 1.0);
  float px = aSize * uFocal / max(-mv.z, 1e-6);
  float lo = 0.6 * uDpr;
  if (px < lo) { a *= px * px / (lo * lo); px = lo; }
  gl_PointSize = min(px, 5.0 * uDpr);
  a *= smoothstep(0.0, 0.22, dot(n, normalize(cameraPosition - w.xyz)));
  vColor = uPal[int(aKind + 0.5)];
  vAlpha = a * uOpacity;
  if (vAlpha < 0.002) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
}`;

// A sphere seen from outside, brightest where we look along its skin: Earth's radar shell.
const SHELL_VERT = /* glsl */ `
varying vec3 vN;
varying vec3 vW;
void main() {
  vN = normalize(mat3(modelMatrix) * normal);
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;
const SHELL_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying vec3 vN;
varying vec3 vW;
void main() {
  float edge = 1.0 - abs(dot(normalize(vN), normalize(cameraPosition - vW)));
  gl_FragColor = vec4(uColor, (0.025 + 0.5 * pow(edge, 4.0)) * uOpacity);
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
  /** When each comes on, 0 to 1, where a screen lights them in turn. */
  rank: number[] = [];
  add(x: number, y: number, z: number, size: number, bright: number, kind: number, rank = 0) {
    this.p.push(x, y, z);
    this.size.push(size);
    this.bright.push(bright);
    this.kind.push(kind);
    this.rank.push(rank);
  }
  points(material: THREE.Material) {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute("aSize", new THREE.Float32BufferAttribute(this.size, 1));
    g.setAttribute("aBright", new THREE.Float32BufferAttribute(this.bright, 1));
    g.setAttribute("aKind", new THREE.Float32BufferAttribute(this.kind, 1));
    g.setAttribute("aRank", new THREE.Float32BufferAttribute(this.rank, 1));
    const pts = new THREE.Points(g, material);
    pts.frustumCulled = false;
    return pts;
  }
}

const leadsAt = new Map<string, THREE.Vector3 | null>();
/** Where a lead's star is, in light-years from Sol in the galactic frame. None for a star scripts/leads.mjs lacks. */
function leadAt(id: string) {
  if (!leadsAt.has(id)) {
    const at = (LEADS as unknown as Record<string, [ra: number, dec: number, ly: number]>)[id];
    leadsAt.set(id, at ? new THREE.Vector3().copy(skyBasis(at[0] * 15, at[1]).radial).multiplyScalar(at[2]) : null);
  }
  return leadsAt.get(id)!;
}

const targetsAt = new Map<string, THREE.Vector3>();
/** Where a star Earth knocked on is, in light-years from Sol in the galactic frame. */
function targetAt(name: string) {
  if (!targetsAt.has(name)) {
    const [ra, ly] = (SKY.targets as unknown as Record<string, [ra: number, ly: number]>)[name];
    targetsAt.set(name, new THREE.Vector3().copy(skyBasis(ra * 15, TARGET_DEC[name] ?? 0).radial).multiplyScalar(ly));
  }
  return targetsAt.get(name)!;
}

/** An angle brought round to between -π and π. */
const wrap = (a: number) => ((((a + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;

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

export function mountDrift(parent: HTMLElement, { still, ...first }: Show & { still: boolean }): Drift {
  // The game's one sky: the title's loop, each screen's view and the map, with the camera flying between them.
  let spec: Show = first;
  const pilot = createDirector({ still });
  /** Where the Moon is today, from Earth, in Earth radii. */
  const moonAt = new THREE.Vector3().copy(moonOffset(pilot.sky.date)).divideScalar(R_E_AU);
  /** Each screen's last dials, so its extras can fade out on them after it has gone. */
  const dialsOf: Partial<Record<Mode, Dials>> = { [first.mode]: first.dials };
  const drift = (t: number, period: number) => (still ? 0 : (2 * Math.PI * t) / period);
  /** What doesn't fit: the lead the Will is looking at, counted from 0, once all are lit. -1 for none. */
  const looking = () => {
    const n = spec.leads?.length ?? 0;
    return (dialsOf.leads?.found ?? n) < n ? -1 : (dialsOf.leads?.focus ?? 0) - 1;
  };
  /** Our message in view, counted from 0. -1 for none. */
  const aimed = () => (dialsOf.beams?.focus ?? 0) - 1;
  /** Our build in view, counted from 0. -1 for none. */
  const aimedWork = () => (dialsOf.works?.focus ?? 0) - 1;
  /** A place on the Moon as a direction from its middle: latitude, and longitude east from the middle of the side that
   *  faces Earth. Its north is the ecliptic's, within the Moon's 1.5° tilt, and its sway toward and away from us is left
   *  out. */
  function onMoon(lat: number, lon: number) {
    const { eN } = pilot.sky;
    const toEarth = moonAt.clone().negate().normalize();
    const north = eN.clone().addScaledVector(toEarth, -eN.dot(toEarth)).normalize();
    const east = north.clone().cross(toEarth);
    const [φ, λ] = [lat * DEG, lon * DEG];
    return toEarth
      .multiplyScalar(Math.cos(φ) * Math.cos(λ))
      .addScaledVector(east, Math.cos(φ) * Math.sin(λ))
      .addScaledVector(north, Math.sin(φ));
  }
  const sitesAt = new Map<string, THREE.Vector3>();
  /** Where a build on the Moon stands, as a direction from its middle. */
  const siteAt = (w: NonNullable<Show["works"]>[number]) => {
    if (!sitesAt.has(w.name)) sitesAt.set(w.name, onMoon(w.site.places[0].lat, w.site.places[0].lon));
    return sitesAt.get(w.name)!;
  };
  /** Where it is, the lead or the message's star, in light-years from Sol. */
  const lookedAt = () => {
    if (spec.mode === "beams") {
      const b = spec.beams?.[aimed()];
      return b ? targetAt(b.star) : null;
    }
    const id = spec.leads?.[looking()];
    return id ? leadAt(id) : null;
  };
  /** How fast the view eases to a lead and back, per second. */
  const LOOK = 1.6;
  // What doesn't fit's view: from high above, turning slowly. Looking at one lead, the camera comes round to its side,
  // down near the plane, and in close, so its path out from Sol shows in depth: how far, and how high or low. Our
  // messages are seen the same way, each on its path out to its star.
  function leadsPose(): Pose {
    let at: number | null = null;
    let [logD, az, tilt] = [7.0, 0, 0.75];
    return (t) => {
      if (still) return [7.0, 1.1, 0.75, 0];
      if (at === null) az = 1.1 + drift(t, 600);
      const dt = at === null ? 0 : Math.min(0.1, Math.max(0, t - at));
      at = t;
      const k = 1 - Math.exp(-dt * LOOK);
      const P = lookedAt();
      if (P) {
        // Whichever side is nearer, about 9° above the plane, near enough that the path fills the view.
        const turns = [pilot.facing(-P.z, P.x), pilot.facing(P.z, -P.x)].map((a) => wrap(a - az));
        az += (Math.abs(turns[0]) < Math.abs(turns[1]) ? turns[0] : turns[1]) * k;
        logD += (Math.min(7.0, Math.max(6.3, Math.log10(2.5 * P.length() * LY_AU))) - logD) * k;
        tilt += (-0.3 - tilt) * k;
      } else {
        az += drift(dt, 600);
        logD += (7.0 - logD) * k;
        tilt += (0.75 - tilt) * k;
      }
      return [logD, az, tilt, 0];
    };
  }

  // Our builds' view. On the Moon: from off the site's side, away from the line to Earth, and a little above, so the
  // Moon fills the view and the thread home runs out across it. It sways a little. On Earth: the whole globe, as it
  // turns, each place coming round under its dome. Turning to another eases round, as the leads' view does.
  function worksPose(): Pose {
    let at: number | null = null;
    let [az, tilt] = [0, 0];
    return (t) => {
      const w = spec.works?.[aimedWork()];
      if (!w) return [STOPS.earth, az, tilt, 0];
      if (w.site.on === "earth") {
        const k = at === null || still ? 1 : 1 - Math.exp(-Math.min(0.1, Math.max(0, t - at)) * LOOK);
        at = t;
        tilt += (0.12 - tilt) * k;
        return [EARTH_WORK, az, tilt, 0];
      }
      const { eX, eN, eZ } = pilot.sky;
      const s = siteAt(w);
      const toEarth = moonAt.clone().negate().normalize();
      const side = s.clone().addScaledVector(toEarth, -s.dot(toEarth));
      const v = s
        .clone()
        .addScaledVector(side.lengthSq() > 1e-6 ? side.normalize() : eX, 0.75)
        .addScaledVector(eN, 0.25)
        .normalize();
      const [toAz, toTilt] = [pilot.facing(v.dot(eX), v.dot(eZ)), Math.asin(v.dot(eN)) - leanAt(NEAR_WORK)];
      const k = at === null || still ? 1 : 1 - Math.exp(-Math.min(0.1, Math.max(0, t - at)) * LOOK);
      at = t;
      az += wrap(toAz - az) * k;
      tilt += (toTilt - tilt) * k;
      return [NEAR_WORK, az + 0.08 * Math.sin(drift(t, 70)), tilt, 0];
    };
  }

  /** Where each screen looks. */
  function poseFor({ mode, dials: d }: Show): Pose | "title" | "map" {
    switch (mode) {
      // Wake: on the night side, in line with the Sun, which rises past Earth's edge.
      case "wake":
        return () => [-3.59, 1.222 + (1 - (d?.rise ?? 1)) * 0.105, -0.2, 0];
      // Where we come from: the camera follows the Sun's light from the whole galaxy down to Earth. A still shows the
      // whole road.
      case "origins":
        return (t) => [still ? WHOLE_ROAD : roadZoom(d?.u ?? 1), 0.6 + drift(t, 360), 0, 0];
      // Who we are: 150° round from the Sun, a little above the equator.
      case "people":
        return () => [-3.6, 0.9, 0.18, 0];
      // Where things stand: the stars within 50 light-years, seen from well above.
      case "stand":
        return (t) => [7.08, 0.4 + drift(t, 600), 0.55, 0];
      // What you inherit: out from Earth's night side, as far as its intro has flown.
      case "inherit":
        return (t) => [(d?.zoom ?? 4.15) - HALF_VIEW_KM, 0.9 + drift(t, 300), 0.18, 0];
      // Meeting the Mind: Earth close, turning, its machines lit, toward the dawn.
      case "mind":
        return () => [-3.62, 0.7, 0.22, 0];
      // What doesn't fit: the same stars from higher, so each lead's height off the Galaxy's plane shows.
      case "leads":
        return leadsPose();
      // Our messages: the same, from beside the one in view.
      case "beams":
        return leadsPose();
      // Our builds: close by the one in view.
      case "works":
        return worksPose();
      // The charter: Earth and the Moon, small and far.
      case "charter":
        return (t) => [-1.95, 0.5 + drift(t, 400), 0.3, 0];
      // The map rests at its stops, and turns with a drag.
      case "map":
        return "map";
      default:
        return "title";
    }
  }
  // The sky opens wherever the game opens: on the title for a new game, or on the map for one already begun.
  pilot.fly(poseFor(first), 0, true);
  /** Where each screen's subject sits in its art, as a share of the art's height: up for the title's button. */
  const LIFTS: Partial<Record<Mode, number>> = { title: LIFT, people: -0.14, wake: -0.04, mind: -0.14 };
  /** Real seconds per Earth turn: a minute, or two while a screen holds still on it. Added up, so a change never jumps. */
  const turnOf = () => (spec.mode === "people" || spec.mode === "wake" || spec.mode === "mind" ? 120 : 60);
  let turned = 0;
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.autoClear = false;
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
  parent.append(renderer.domElement);

  const rand = seededRandom(2040);
  const gauss = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());

  // One palette and one lens, shared by every material.
  const pal = KINDS.map(() => new THREE.Color());
  const shared = {
    uPal: { value: pal },
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
        uReveal: { value: 1 },
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
  const { date, earthAU, sunDir, eX, eN, eZ } = pilot.sky;

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
      uDawn: { value: pal[K.sun] },
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
      uLit: { value: 1 },
    },
    vertexShader: SURFACE_VERT,
    fragmentShader: GLOW_FRAG,
    transparent: true,
    depthWrite: false,
  });
  glows.push(surface);
  let surfaceAt = Infinity;

  const moon = new THREE.Mesh(new THREE.SphereGeometry(MOON_R, 48, 32), moonGlobe);
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

  // ── Who we are: threads from the brightest cities rise to one point above Earth, the Mind ──
  const MIND_UP = 1.6;
  const threads: { at: THREE.Vector3; line: THREE.Line; mat: THREE.ShaderMaterial }[] = [];
  const mindCloud = new Cloud();
  mindCloud.add(0, 0, 0, 52, 0.5, K.mind);
  mindCloud.add(0, 0, 0, 7, 1, K.mind);
  const mindGlow = glow({ fixed: true });
  const mindPts = mindCloud.points(mindGlow);
  mindPts.renderOrder = 2;
  function weave(lights: Light[]) {
    for (const [lat, lon] of hubs(lights, 18, 14)) {
      const mat = line("mind", 0, true);
      const geo = new THREE.BufferGeometry().setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(25 * 3), 3),
      );
      const l = new THREE.Line(geo, mat);
      l.frustumCulled = false;
      earth.scene.add(l);
      threads.push({ at: new THREE.Vector3(...onGlobe(lat, lon, 1.004)), line: l, mat });
    }
    earth.scene.add(mindPts);
  }
  const mind = new THREE.Vector3();
  const city = new THREE.Vector3();
  const bend = new THREE.Vector3();
  const toCam = new THREE.Vector3();
  let woven = false;
  function people(up: THREE.Vector3, p: number) {
    const dials = dialsOf.people;
    if (!woven && lightsData) {
      weave(lightsData);
      woven = true;
    }
    mind.copy(up).multiplyScalar(MIND_UP);
    mindPts.position.copy(mind);
    mindGlow.uniforms.uOpacity.value = p * (dials?.mind ?? 0) * (still ? 1 : 0.85 + 0.15 * Math.sin(clock * 2.4));
    const steps = Math.round(24 * (dials?.threads ?? 0));
    for (const { at, line: l, mat } of threads) {
      city.copy(at).applyQuaternion(spin.quaternion);
      // Fade the threads of cities turning away, and bow each one out toward us so it clears the globe.
      toCam.copy(earth.camera.position).sub(city).normalize();
      mat.uniforms.uOpacity.value = 0.7 * p * smooth(city.clone().normalize().dot(toCam) * 4);
      bend.copy(city).add(mind).multiplyScalar(0.5);
      bend.setLength(Math.max(bend.length() * 1.25, 1.4));
      const pos = l.geometry.attributes.position as THREE.BufferAttribute;
      for (let k = 0; k <= 24; k++) {
        const t = k / 24;
        const a = (1 - t) ** 2;
        const b = 2 * (1 - t) * t;
        const c = t * t;
        pos.setXYZ(
          k,
          a * city.x + b * bend.x + c * mind.x,
          a * city.y + b * bend.y + c * mind.y,
          a * city.z + b * bend.z + c * mind.z,
        );
      }
      pos.needsUpdate = true;
      l.geometry.setDrawRange(0, steps > 0 ? steps + 1 : 0);
    }
    if (spec.mode === "people" && spec.onMind) {
      const q = mind.clone().project(earth.camera);
      spec.onMind(((q.x + 1) / 2) * parent.clientWidth, ((1 - q.y) / 2) * parent.clientHeight);
    }
  }

  // ── Meeting the Mind: Earth's real machines come on, kind by kind, and threads rise from each to the Mind ──
  function meeting() {
    const kinds: Record<MachineKind, Kind> = { dish: "mind", scope: "ink", compute: "lamp" };
    const lamps = {} as Record<MachineKind, THREE.ShaderMaterial>;
    for (const kind of ["dish", "scope", "compute"] as const) {
      const c = new Cloud();
      // Each comes on at its own moment in its kind's turn: a bright point in a soft halo, to stand out from the lights.
      for (const m of MACHINES.filter((m) => m.kind === kind)) {
        const at = onGlobe(m.lat, m.lon, 1.006);
        const rank = 0.02 + rand() * 0.9;
        c.add(...at, 18, 0.45, K[kinds[kind]], rank);
        c.add(...at, 5.5, 1, K[kinds[kind]], rank);
      }
      lamps[kind] = glow({ fixed: true, depthTest: true });
      lamps[kind].blending = THREE.AdditiveBlending;
      spin.add(c.points(lamps[kind]));
    }
    const strands = MACHINES.map((m) => {
      const mat = line(kinds[m.kind], 0, true);
      const geo = new THREE.BufferGeometry().setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(25 * 3), 3),
      );
      const l = new THREE.Line(geo, mat);
      l.frustumCulled = false;
      earth.scene.add(l);
      return { at: new THREE.Vector3(...onGlobe(m.lat, m.lon, 1.006)), line: l, mat };
    });
    const core = new Cloud();
    core.add(0, 0, 0, 60, 0.55, K.mind);
    core.add(0, 0, 0, 8, 1, K.mind);
    const coreGlow = glow({ fixed: true });
    const corePts = core.points(coreGlow);
    corePts.renderOrder = 2;
    earth.scene.add(corePts);
    const top = new THREE.Vector3();
    const site = new THREE.Vector3();
    const arc = new THREE.Vector3();
    const eye = new THREE.Vector3();
    return (up: THREE.Vector3, p: number) => {
      const d = dialsOf.mind;
      for (const kind of ["dish", "scope", "compute"] as const) {
        lamps[kind].uniforms.uOpacity.value = p;
        lamps[kind].uniforms.uReveal.value = d?.[kind] ?? 0;
      }
      top.copy(up).multiplyScalar(MIND_UP);
      corePts.position.copy(top);
      coreGlow.uniforms.uOpacity.value = p * (d?.mind ?? 0) * (still ? 1 : 0.8 + 0.2 * Math.sin(clock * 2.4));
      const steps = Math.round(24 * (d?.threads ?? 0));
      for (const { at, line: l, mat } of strands) {
        site.copy(at).applyQuaternion(spin.quaternion);
        eye.copy(earth.camera.position).sub(site).normalize();
        mat.uniforms.uOpacity.value = 0.55 * p * smooth(site.clone().normalize().dot(eye) * 4);
        // Lift each thread off its site before it bends to the Mind, the farther from the Mind the higher, so none
        // cuts through the globe.
        const w = (1 - site.dot(top) / (site.length() * top.length())) / 2;
        arc.copy(site).setLength(1.1 + 2.6 * w).add(top).multiplyScalar(0.5);
        const pos = l.geometry.attributes.position as THREE.BufferAttribute;
        for (let k = 0; k <= 24; k++) {
          const t = k / 24;
          const a = (1 - t) ** 2;
          const b = 2 * (1 - t) * t;
          const c = t * t;
          pos.setXYZ(
            k,
            a * site.x + b * arc.x + c * top.x,
            a * site.y + b * arc.y + c * top.y,
            a * site.z + b * arc.z + c * top.z,
          );
        }
        pos.needsUpdate = true;
        l.geometry.setDrawRange(0, steps > 0 ? steps + 1 : 0);
      }
      if (spec.mode === "mind" && spec.onMind) {
        const q = top.clone().project(earth.camera);
        spec.onMind(((q.x + 1) / 2) * parent.clientWidth, ((1 - q.y) / 2) * parent.clientHeight);
      }
    };
  }

  // ── What you inherit: Earth's kit at Year 0, each piece where it is ──
  function inheritance() {
    const north = new THREE.Vector3(0, 1, 0).applyQuaternion(bodyOrientation("Earth", date));
    // Spare matter in orbit: depots, spent stages and dead craft. Most low, on the planes launches favor, and some at
    // geostationary height, which keeps pace with the turning Earth.
    const debrisGlow = glow({ fixed: true });
    const rings: { group: THREE.Group; rate: number }[] = [];
    const ring = (incl: number, r: number, n: number, rate: number) => {
      const node = new THREE.Vector3(1, 0, 0).applyAxisAngle(north, rand() * 2 * Math.PI);
      node.addScaledVector(north, -node.dot(north)).normalize();
      const normal = north.clone().applyAxisAngle(node, incl * DEG);
      const c = new Cloud();
      for (let i = 0; i < n; i++) {
        const t = rand() * 2 * Math.PI;
        const rr = r * (1 + gauss() * 0.02);
        c.add(rr * Math.cos(t), gauss() * 0.01, rr * Math.sin(t), 1.6, 0.55 + rand() * 0.3, K.ink);
      }
      const group = new THREE.Group();
      group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      group.add(c.points(debrisGlow));
      earth.scene.add(group);
      rings.push({ group, rate });
    };
    // The station's plane, broadband shells, sun-synchronous orbits, and a few others, by inclination and height in km.
    for (const [incl, alt] of [
      [51.6, 420],
      [53, 550],
      [97.6, 700],
      [98.2, 800],
      [43, 1100],
      [70, 600],
      [28.5, 350],
      [86.4, 780],
    ])
      ring(incl, 1 + alt / 6371, 28, 0.5 * (1 + 1000 / (6371 + alt)));
    ring(0, 42164 / 6371, 140, -1);
    // The geostationary belt itself, drawn faintly, where the far debris keeps station.
    const belt = line("ink", 0, true);
    const geo = loop(
      Array.from(
        { length: 180 },
        (_, i) =>
          new THREE.Vector3(
            (42164 / 6371) * Math.cos((i / 180) * 2 * Math.PI),
            0,
            (42164 / 6371) * Math.sin((i / 180) * 2 * Math.PI),
          ),
      ),
      belt,
    );
    geo.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), north);
    earth.scene.add(geo);

    // Lift: rockets climbing from real pads. Cape Canaveral, Boca Chica, Kourou, Baikonur, Jiuquan, Wenchang.
    const lifts = (
      [
        [28.5, -80.6],
        [26.0, -97.2],
        [5.2, -52.8],
        [45.9, 63.3],
        [40.96, 100.3],
        [19.6, 110.95],
      ] as const
    ).map(([lat, lon]) => {
      const mat = line("lamp", 0, true);
      const geo = new THREE.BufferGeometry().setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(6), 3),
      );
      const l = new THREE.Line(geo, mat);
      l.frustumCulled = false;
      spin.add(l);
      return { at: new THREE.Vector3(...onGlobe(lat, lon, 1)), l, mat };
    });

    // The Moon's south-pole stations, and the telescopes at L2, 1.5 million km out on the night side.
    const pole = moonAt.clone().addScaledVector(eN, -0.29);
    const l2 = sunDir.clone().multiplyScalar(-1.5e6 / 6371);
    const beside = sunDir.clone().cross(eN).normalize().multiplyScalar(2.5);
    const stations = new Cloud();
    stations.add(pole.x, pole.y, pole.z, 3.2, 1, K.mind);
    const poleGlow = glow({ fixed: true });
    earth.scene.add(stations.points(poleGlow));
    const scopes = new Cloud();
    for (const side of [1, -1])
      scopes.add(l2.x + beside.x * side, l2.y + beside.y * side, l2.z + beside.z * side, 2.4, 1, K.ink);
    const l2Glow = glow({ fixed: true });
    earth.scene.add(scopes.points(l2Glow));
    const moonLine = line("mind", 0, true);
    const l2Line = line("mind", 0, true);
    for (const [to, mat] of [
      [moonAt, moonLine],
      [l2, l2Line],
    ] as const) {
      const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), to]), mat);
      l.frustumCulled = false;
      earth.scene.add(l);
    }

    // The far probes, where they head, at the distances they reach by Year 0: Voyager 1 toward Ophiuchus and New
    // Horizons toward Sagittarius. Each on a dotted road from the Sun.
    const probeAt = (ra: number, dec: number, au: number) =>
      new THREE.Vector3().copy(skyBasis(ra, dec).radial).multiplyScalar(au);
    const voyager = probeAt(258.75, 12.4, 220);
    const horizons = probeAt(290, -20.1, 100);
    const probes = new Cloud();
    const roads = new Cloud();
    for (const p of [voyager, horizons]) {
      probes.add(p.x, p.y, p.z, 4, 1, K.ink);
      for (let i = 1; i < 90; i++) {
        const q = p.clone().multiplyScalar(i / 90);
        roads.add(q.x, q.y, q.z, 1.4, 0.6, K.ink);
      }
    }
    const probeGlow = glow({ fixed: true });
    const roadGlow = glow({ fixed: true });
    solar.scene.add(probes.points(probeGlow), roads.points(roadGlow));

    const origin = new THREE.Vector3();
    const moonBand = (x: number) => band(x, -2.6, -2.1, -0.9, -0.5);
    const l2Band = (x: number) => band(x, -1.7, -1.3, -0.3, 0.2);
    const farBand = (x: number) => band(x, 1.2, 2.0);
    const marks: [id: string, layer: Layer, at: THREE.Vector3, show: (x: number) => number][] = [
      ["earth", earth, origin, (x) => band(x, -2.5, -2.1, 1.4, 2.0)],
      ["moon", earth, moonAt, moonBand],
      ["l2", earth, l2, l2Band],
      ["sun", solar, origin, (x) => ramp(x, -0.3, 0.3)],
      ["horizons", solar, horizons, farBand],
      ["voyager", solar, voyager, farBand],
    ];
    const v = new THREE.Vector3();
    let last = clock;

    return (x: number, p: number) => {
      const dt = Math.min(0.1, Math.max(0, clock - last));
      last = clock;
      debrisGlow.uniforms.uOpacity.value = p * band(x, -3.8, -3.4, -2.2, -1.7);
      belt.uniforms.uOpacity.value = 0.14 * p * band(x, -3.4, -3.0, -2.2, -1.7);
      for (const { group, rate } of rings) group.rotateY((rate < 0 ? (2 * Math.PI) / turnOf() : rate) * dt);
      const lift = p * band(x, -3.9, -3.6, -3.0, -2.7);
      lifts.forEach(({ at, l, mat }, i) => {
        const phase = (clock * 0.35 + i / lifts.length) % 1;
        const pos = l.geometry.attributes.position as THREE.BufferAttribute;
        pos.setXYZ(0, at.x, at.y, at.z);
        pos.setXYZ(1, at.x * (1 + 0.3 * phase), at.y * (1 + 0.3 * phase), at.z * (1 + 0.3 * phase));
        pos.needsUpdate = true;
        mat.uniforms.uOpacity.value = 0.8 * lift * (1 - phase);
      });
      poleGlow.uniforms.uOpacity.value = p * moonBand(x);
      moonLine.uniforms.uOpacity.value = 0.35 * p * moonBand(x);
      l2Glow.uniforms.uOpacity.value = p * l2Band(x);
      l2Line.uniforms.uOpacity.value = 0.4 * p * l2Band(x);
      probeGlow.uniforms.uOpacity.value = roadGlow.uniforms.uOpacity.value = p * farBand(x);

      if (spec.mode === "inherit" && spec.onMarks) {
        const w = parent.clientWidth;
        const h = parent.clientHeight;
        spec.onMarks(
          marks.map(([id, layer, at, show]) => {
            v.copy(at).project(layer.camera);
            return { id, x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h, a: v.z < 1 ? show(x) : 0 };
          }),
        );
      }
    };
  }

  // ── Where we come from: the Sun's road around the Milky Way, 4.6 billion years to this morning ──
  function sunsRoad(moments: { u: number; dial: boolean }[]) {
    // About 236 km/s round the center (Reid et al. 2019), in kpc a year. Born near 7 kpc, the Sun drifted out to today's
    // 8.28. Estimates of where it was born run from about 5 to 7 kpc. It bobs through the disk too, about 85 pc up and
    // down about 2.7 times a lap, and is 21 pc up and rising now.
    const v = (236 / 3.0857e16) * 3.15576e7;
    const k = (7 - R0) / AGE;
    const radius = (ago: number) => R0 + k * ago;
    const behind = (ago: number) => (v / k) * Math.log(radius(ago) / R0);
    const bob = Math.asin(0.0208 / 0.085);
    const height = (ago: number) => 0.085 * Math.sin(bob - (2 * Math.PI * ago) / 8e7);
    const now = new THREE.Vector3(...inDisk(R0, 0, height(0)));
    /** Where the Sun was, from where it is, in kly. */
    const road = (ago: number, out = new THREE.Vector3()) =>
      out.set(...inDisk(radius(ago), -behind(ago), height(ago))).sub(now);

    // Its laps, drawn as its light passes, and the last million years, close to home.
    const laps = new Cloud();
    for (let ago = AGE; ago > 1e6; ago -= 4e5) {
      const p = road(ago);
      laps.add(p.x, p.y, p.z, 2.2, 0.85, K.warm, placeOf(ago));
    }
    const near = new Cloud();
    for (let i = 0; i <= 700; i++) {
      const ago = 10 ** (6 - (6 * i) / 700);
      const p = road(ago);
      near.add(p.x, p.y, p.z, 2.2, 0.85, K.warm, placeOf(ago));
    }
    // Each moment, a knot on the road where the Sun was then. The ones that set a dial glow blue.
    const deep = new Cloud();
    const recent = new Cloud();
    for (const { u, dial } of moments) {
      const p = road(agoAt(u));
      const c = agoAt(u) > 1e6 ? deep : recent;
      c.add(p.x, p.y, p.z, 7, 1, dial ? K.mind : K.sun, u);
      c.add(p.x, p.y, p.z, 20, 0.4, dial ? K.mind : K.warm, u);
    }
    const lapsGlow = glow({ fixed: true });
    const nearGlow = glow({ fixed: true });
    const deepGlow = glow({ fixed: true });
    const recentGlow = glow({ fixed: true });
    // The Sun's light, traveling the road.
    const sun = new Cloud();
    sun.add(0, 0, 0, 34, 0.6, K.sun);
    sun.add(0, 0, 0, 9, 1, K.sun);
    const sunGlow2 = glow({ fixed: true });
    const sunPts = sun.points(sunGlow2);
    cosmos.scene.add(
      laps.points(lapsGlow),
      near.points(nearGlow),
      deep.points(deepGlow),
      recent.points(recentGlow),
      sunPts,
    );
    const at = new THREE.Vector3();
    return (x: number, p: number) => {
      const dials = dialsOf.origins;
      const u = dials?.u ?? 1;
      for (const m of [lapsGlow, nearGlow, deepGlow, recentGlow]) m.uniforms.uReveal.value = u;
      // The laps and the deep past while the galaxy is in view, the last million years once it is not.
      lapsGlow.uniforms.uOpacity.value = deepGlow.uniforms.uOpacity.value = p * ramp(x, 8.2, 9.2);
      nearGlow.uniforms.uOpacity.value = recentGlow.uniforms.uOpacity.value = p * (1 - ramp(x, 9.0, 9.8));
      sunPts.position.copy(road(agoAt(u), at));
      sunGlow2.uniforms.uOpacity.value = p * (1 - (dials?.earth ?? 0));
    };
  }

  // ── Where things stand: ninety years of Earth's noise across the stars within 50 light-years ──
  function standing() {
    // The radar shell, spreading at the speed of light since 1950: bright at its edge, faint inside.
    const shellMat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: pal[K.lamp] }, uOpacity: { value: 0 } },
      vertexShader: SHELL_VERT,
      fragmentShader: SHELL_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 72, 48), shellMat);
    shell.frustumCulled = false;
    stars.scene.add(shell);
    // Rings every ten light-years in the Galaxy's plane.
    const ringMat = line("ink", 0);
    for (let r = 10; r <= 50; r += 10)
      stars.scene.add(
        loop(
          Array.from(
            { length: 128 },
            (_, i) =>
              new THREE.Vector3(r * Math.cos((i / 128) * 2 * Math.PI), 0, r * Math.sin((i / 128) * 2 * Math.PI)),
          ),
          ringMat,
        ),
      );
    // The twelve stars Earth knocked on, at their real places.
    const targets = Object.entries(SKY.targets as unknown as Record<string, [ra: number, ly: number]>).map(
      ([name, [ra, ly]]) => ({
        name,
        ly,
        at: new THREE.Vector3().copy(skyBasis(ra * 15, TARGET_DEC[name] ?? 0).radial).multiplyScalar(ly),
      }),
    );
    const marks = new Cloud();
    for (const t of targets) marks.add(t.at.x, t.at.y, t.at.z, 6, 0.9, K.ink);
    const marksGlow = glow({ fixed: true });
    stars.scene.add(marks.points(marksGlow));
    // Each aimed message: a beam toward its star, and a pulse moving out along it at the speed of light.
    const beams = KNOCKS.map(([, sent, target, ly]) => {
      const to = targets
        .find((t) => t.name === target)!
        .at.clone()
        .normalize();
      const mat = line("lamp", 0);
      const l = new THREE.Line(
        new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3)),
        mat,
      );
      l.frustumCulled = false;
      stars.scene.add(l);
      return { sent, ly, to, l, mat };
    });
    const pulses = new Cloud();
    for (let i = 0; i < beams.length; i++) pulses.add(0, 0, 0, 7, 1, K.sun);
    const pulsePts = pulses.points(glow({ fixed: true }));
    stars.scene.add(pulsePts);
    // The stars themselves come in with the stars' points once the HYG list has come.
    let lit: THREE.ShaderMaterial | null = null;
    let dim: THREE.ShaderMaterial | null = null;
    const v = new THREE.Vector3();

    return (x: number, p: number) => {
      const d = dialsOf.stand;
      const year = d?.year ?? 2040;
      const grid = d?.grid ?? 1;
      const shellLy = Math.max(0, year - RADARS_SINCE);
      if (!lit && within50.length) {
        // Unswept, faint in ink. Swept, warm, from the moment the shell passes.
        const cold = new Cloud();
        const warm = new Cloud();
        for (let i = 0; i < within50.length; i += 4) {
          const [sx, sy, sz, ly] = within50.slice(i, i + 4);
          cold.add(sx, sy, sz, 2, 0.5, K.ink);
          warm.add(sx, sy, sz, 2.8, 1, K.lamp, ly / 100);
        }
        dim = glow({ fixed: true });
        lit = glow({ fixed: true });
        stars.scene.add(cold.points(dim), warm.points(lit));
      }
      if (dim && lit) {
        dim.uniforms.uOpacity.value = p * grid;
        lit.uniforms.uOpacity.value = p;
        lit.uniforms.uReveal.value = shellLy / 100;
      }
      shell.scale.setScalar(Math.max(0.01, shellLy));
      // Past the map's edge the shell runs on unseen, as on the old map, so it never washes the view.
      shellMat.uniforms.uOpacity.value = p * ramp(shellLy, 0, 2) * (1 - 0.9 * ramp(shellLy, 46, 64));
      ringMat.uniforms.uOpacity.value = 0.12 * p * grid;
      marksGlow.uniforms.uOpacity.value = p * grid;
      const bright = pulsePts.geometry.attributes.aBright as THREE.BufferAttribute;
      const pos = pulsePts.geometry.attributes.position as THREE.BufferAttribute;
      beams.forEach(({ sent, ly, to, l, mat }, i) => {
        const gone = Math.max(0, Math.min(year - sent, ly));
        const head = v.copy(to).multiplyScalar(gone);
        const line = l.geometry.attributes.position as THREE.BufferAttribute;
        line.setXYZ(1, head.x, head.y, head.z);
        line.needsUpdate = true;
        mat.uniforms.uOpacity.value = year > sent ? 0.4 * p : 0;
        pos.setXYZ(i, head.x, head.y, head.z);
        bright.setX(i, year > sent && year - sent < ly ? 1 : 0);
      });
      pos.needsUpdate = true;
      bright.needsUpdate = true;
      (pulsePts.material as THREE.ShaderMaterial).uniforms.uOpacity.value = p * (0.8 + 0.2 * Math.sin(clock * 6));

      if (spec.mode === "stand" && spec.onMarks) {
        const w = parent.clientWidth;
        const h = parent.clientHeight;
        spec.onMarks(
          [...targets.map((t) => ({ id: t.name, at: t.at })), { id: "Sol", at: new THREE.Vector3() }].map(
            ({ id, at }) => {
              v.copy(at).project(stars.camera);
              return { id, x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h, a: v.z < 1 ? p * grid : 0 };
            },
          ),
        );
      }
    };
  }

  // ── What doesn't fit: Earth's leads among the stars within 50 light-years ──
  function leading(ids: string[]) {
    const leads = ids.filter(leadAt).map((id) => ({ id, at: leadAt(id)! }));
    const v = new THREE.Vector3();
    // Rings every ten light-years in the Galaxy's plane, as on Where things stand.
    const ringMat = line("ink", 0);
    const RINGS = [10, 20, 30, 40, 50];
    const ringAt = (r: number, i: number, n: number) =>
      new THREE.Vector3(r * Math.cos((i / n) * 2 * Math.PI), 0, r * Math.sin((i / n) * 2 * Math.PI));
    for (const r of RINGS) stars.scene.add(loop(Array.from({ length: 128 }, (_, i) => ringAt(r, i, 128)), ringMat));
    // Each lead: a point, a halo that breathes, a stalk down to the plane, and a thread out from Sol.
    const core = new Cloud();
    const halo = new Cloud();
    const feet = new Cloud();
    const stalk: number[] = [];
    const threads = leads.map(({ id, at }) => {
      const kind = id === "Luyten's Star" ? K.lamp : K.mind;
      core.add(at.x, at.y, at.z, 6.5, 1, kind);
      halo.add(at.x, at.y, at.z, 26, 0, kind);
      feet.add(at.x, 0, at.z, 2.5, 0.7, K.ink);
      stalk.push(at.x, at.y, at.z, at.x, 0, at.z);
      const mat = line(id === "Luyten's Star" ? "lamp" : "mind", 0);
      const l = new THREE.Line(
        new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3)),
        mat,
      );
      l.frustumCulled = false;
      stars.scene.add(l);
      return { l, mat };
    });
    core.add(0, 0, 0, 8, 1, K.sun);
    const coreGlow = glow({ fixed: true });
    const haloGlow = glow({ fixed: true });
    const feetGlow = glow({ fixed: true });
    const corePts = core.points(coreGlow);
    const haloPts = halo.points(haloGlow);
    stars.scene.add(haloPts, corePts, feet.points(feetGlow));
    const stalkMat = line("ink", 0);
    const stalks = new THREE.LineSegments(
      new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(stalk, 3)),
      stalkMat,
    );
    stalks.frustumCulled = false;
    stars.scene.add(stalks);
    // The lead the Will looks at, in depth: its shadow on the plane and its stalk, square to each other, and a bead at
    // each light-year along its thread.
    const beads = new Cloud();
    const paths = leads.map(({ id, at }) => {
      const from = beads.size.length;
      const ly = at.length();
      for (let y = 1; y < ly; y++) {
        v.copy(at).multiplyScalar(y / ly);
        beads.add(v.x, v.y, v.z, 4.5, 0, id === "Luyten's Star" ? K.lamp : K.mind);
      }
      const mat = line("ink", 0);
      const legs = new THREE.LineSegments(
        new THREE.BufferGeometry().setAttribute(
          "position",
          new THREE.Float32BufferAttribute([0, 0, 0, at.x, 0, at.z, at.x, 0, at.z, at.x, at.y, at.z], 3),
        ),
        mat,
      );
      legs.frustumCulled = false;
      stars.scene.add(legs);
      return { from, to: beads.size.length, mat };
    });
    const beadGlow = glow({ fixed: true });
    const beadPts = beads.points(beadGlow);
    // And a pulse of light along it, sped up: out to the star, a breath there, and back. A call, and an answer.
    const LIGHT = 10;
    const TRAIL = 8;
    const pulse = new Cloud();
    pulse.add(0, 0, 0, 34, 0, K.mind);
    for (let j = 0; j <= TRAIL; j++) pulse.add(0, 0, 0, 10 - j * 0.8, 0, K.mind);
    const pulseGlow = glow({ fixed: true });
    const pulsePts = pulse.points(pulseGlow);
    stars.scene.add(beadPts, pulsePts);
    const looked = leads.map(() => 0);
    let pulseOf = -1;
    let pulseAt = 0;
    let then = clock;
    // The other stars, faint, once the catalog has come.
    let dim: THREE.ShaderMaterial | null = null;

    return (p: number) => {
      const d = dialsOf.leads;
      const found = d?.found ?? leads.length;
      const grid = d?.grid ?? 1;
      const focus = looking();
      const dt = Math.min(0.1, Math.max(0, clock - then));
      then = clock;
      const ease = still ? 1 : 1 - Math.exp(-dt * LOOK * 2);
      looked.forEach((l, i) => (looked[i] = l + ((i === focus ? 1 : 0) - l) * ease));
      const any = Math.max(0, ...looked);
      if (!dim && within50.length) {
        const cold = new Cloud();
        for (let i = 0; i < within50.length; i += 4) cold.add(within50[i], within50[i + 1], within50[i + 2], 2, 0.45, K.ink);
        dim = glow({ fixed: true });
        stars.scene.add(cold.points(dim));
      }
      if (dim) dim.uniforms.uOpacity.value = p * grid;
      ringMat.uniforms.uOpacity.value = 0.12 * p * grid;
      coreGlow.uniforms.uOpacity.value = p;
      haloGlow.uniforms.uOpacity.value = p;
      feetGlow.uniforms.uOpacity.value = p;
      beadGlow.uniforms.uOpacity.value = p;
      pulseGlow.uniforms.uOpacity.value = p;
      stalkMat.uniforms.uOpacity.value = 0.22 * p;
      // Lit in turn: the thread runs out from Sol, then the star comes on with a flare, then breathes.
      const shown = leads.map((_, i) => Math.min(1, Math.max(0, found - i)));
      const coreB = corePts.geometry.attributes.aBright as THREE.BufferAttribute;
      const haloB = haloPts.geometry.attributes.aBright as THREE.BufferAttribute;
      const beadB = beadPts.geometry.attributes.aBright as THREE.BufferAttribute;
      // The pulse starts out from Sol each time the Will looks at another lead.
      if (focus !== pulseOf) [pulseOf, pulseAt] = [focus, clock];
      const run = leads[focus];
      let u = -1;
      let back = false;
      let arrive = 0;
      if (run && !still) {
        const go = run.at.length() / LIGHT;
        const t = (clock - pulseAt) % (2 * go + 1.6);
        if (t < go) u = t / go;
        else if (t < go + 0.5) arrive = Math.sin((Math.PI * (t - go)) / 0.5);
        else if (t < 2 * go + 0.5) [u, back] = [1 - (t - go - 0.5) / go, true];
      }
      const pos = pulsePts.geometry.attributes.position as THREE.BufferAttribute;
      const pulseB = pulsePts.geometry.attributes.aBright as THREE.BufferAttribute;
      const pulseK = pulsePts.geometry.attributes.aKind as THREE.BufferAttribute;
      for (let j = 0; j < pos.count; j++) {
        const lag = (Math.max(0, j - 1) * 0.5) / (run?.at.length() ?? 1);
        const uj = back ? u + lag : u - lag;
        const on = u >= 0 && uj >= 0 && uj <= 1;
        if (on) v.copy(run.at).multiplyScalar(uj);
        pos.setXYZ(j, v.x, v.y, v.z);
        const b = j === 0 ? 0.45 : (1 - (j - 1) / (TRAIL + 1)) ** 2;
        pulseB.setX(j, on ? b * looked[focus] * (back ? 0.7 : 1) : 0);
        pulseK.setX(j, back ? K.lamp : K.mind);
      }
      pos.needsUpdate = pulseB.needsUpdate = pulseK.needsUpdate = true;
      leads.forEach(({ at }, i) => {
        const k = shown[i];
        const reach = easeInOut(Math.min(1, k / 0.6));
        const lit = ramp(k, 0.5, 1);
        const pos = threads[i].l.geometry.attributes.position as THREE.BufferAttribute;
        v.copy(at).multiplyScalar(reach);
        pos.setXYZ(1, v.x, v.y, v.z);
        pos.needsUpdate = true;
        const seen = looked[i];
        threads[i].mat.uniforms.uOpacity.value =
          (0.3 + 0.4 * seen - 0.15 * any * (1 - seen)) * p * Math.min(1, shown[i] * 4);
        paths[i].mat.uniforms.uOpacity.value = 0.3 * seen * lit * p;
        for (let b = paths[i].from; b < paths[i].to; b++) beadB.setX(b, 0.9 * seen * lit);
        coreB.setX(i, lit);
        const flare = 4 * lit * (1 - lit);
        const breathe = 0.35 + 0.15 * Math.sin(clock * 1.8 + i * 1.7);
        haloB.setX(i, lit * (breathe + (0.9 - breathe) * seen) + flare + (i === focus ? 0.8 * arrive : 0));
      });
      coreB.needsUpdate = true;
      haloB.needsUpdate = true;
      beadB.needsUpdate = true;

      if (spec.mode === "leads" && spec.onMarks) {
        const w = parent.clientWidth;
        const h = parent.clientHeight;
        const onScreen = (at: THREE.Vector3) => {
          v.copy(at).project(stars.camera);
          return { x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h, z: v.z };
        };
        const marks: Mark[] = leads.map(({ id, at }, i) => {
          const s = onScreen(at);
          return { id, x: s.x, y: s.y, a: s.z < 1 ? p * ramp(shown[i], 0.6, 1) : 0 };
        });
        const sol = onScreen(new THREE.Vector3());
        marks.push({ id: "Sol", x: sol.x, y: sol.y, a: p });
        // Each ring is named where it is lowest on screen, nearest the viewer, and not while a lead's path is shown,
        // where the rings lie nearly edge on.
        for (const r of RINGS) {
          let best = { x: 0, y: -Infinity, z: 2 };
          for (let i = 0; i < 24; i++) {
            const s = onScreen(ringAt(r, i, 24));
            if (s.y > best.y) best = s;
          }
          marks.push({ id: `ring:${r}`, x: best.x, y: best.y, a: best.z < 1 ? p * grid * (1 - any) : 0 });
        }
        spec.onMarks(marks);
      }
    };
  }

  // ── Our messages on their way: each a path from Earth to its star, lit as far as its light has come ──
  function sending() {
    const origin = new THREE.Vector3();
    // Each path starts at Earth, so the view can start there too: from Earth a path is a point on the sky, and it
    // opens out as the camera pulls back.
    const home = earthAU.clone().divideScalar(LY_AU);
    const head = new THREE.Vector3();
    const v = new THREE.Vector3();
    // Rings every ten light-years in the Galaxy's plane, as on What doesn't fit, once past the Oort cloud.
    const ringMat = line("ink", 0);
    for (let r = 10; r <= 50; r += 10)
      stars.scene.add(
        loop(
          Array.from(
            { length: 128 },
            (_, i) =>
              new THREE.Vector3(r * Math.cos((i / 128) * 2 * Math.PI), 0, r * Math.sin((i / 128) * 2 * Math.PI)),
          ),
          ringMat,
        ),
      );
    const seg = (kind: Kind) => {
      const mat = line(kind, 0);
      const l = new THREE.Line(
        new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3)),
        mat,
      );
      l.frustumCulled = false;
      stars.scene.add(l);
      return { l, mat };
    };
    const set = ({ l }: { l: THREE.Line }, a: THREE.Vector3, b: THREE.Vector3) => {
      const pos = l.geometry.attributes.position as THREE.BufferAttribute;
      pos.setXYZ(0, a.x, a.y, a.z);
      pos.setXYZ(1, b.x, b.y, b.z);
      pos.needsUpdate = true;
    };
    // Each aimed message: its whole path, faint, the stretch its light has run, and the stretch home a reply has run.
    const knocks = KNOCKS.map(([, sent, star, ly]) => ({
      sent,
      star,
      ly,
      at: targetAt(star),
      path: seg("ink"),
      out: seg("mind"),
      back: seg("lamp"),
    }));
    for (const k of knocks) set(k.path, home, k.at);
    // The stars, each a point and a halo, and Sol. Each message has two heads, its light going out and a reply's
    // coming home, each a point in a glow.
    const names = [...new Set(knocks.map((k) => k.star))];
    const core = new Cloud();
    const halo = new Cloud();
    for (const n of names) {
      const at = targetAt(n);
      core.add(at.x, at.y, at.z, 6.5, 0, K.ink);
      halo.add(at.x, at.y, at.z, 26, 0, K.mind);
    }
    core.add(0, 0, 0, 8, 1, K.sun);
    const heads = new Cloud();
    for (let i = 0; i < knocks.length; i++)
      for (const kind of [K.mind, K.lamp]) {
        heads.add(0, 0, 0, 8, 0, kind);
        heads.add(0, 0, 0, 30, 0, kind);
      }
    const coreGlow = glow({ fixed: true });
    const haloGlow = glow({ fixed: true });
    const headGlow = glow({ fixed: true });
    const corePts = core.points(coreGlow);
    const haloPts = halo.points(haloGlow);
    const headPts = heads.points(headGlow);
    stars.scene.add(haloPts, corePts, headPts);
    // The other stars, faint, once the catalog has come.
    let dim: THREE.ShaderMaterial | null = null;
    // Fading out, the view keeps the messages it last had.
    let list: NonNullable<Show["beams"]> = [];
    const lit = new Map<string, number>();

    return (x: number, p: number) => {
      if (spec.mode === "beams") list = spec.beams ?? [];
      const year = dialsOf.beams?.year ?? YEAR_0;
      const focus = list[aimed()];
      if (!dim && within50.length) {
        const cold = new Cloud();
        for (let i = 0; i < within50.length; i += 4) cold.add(within50[i], within50[i + 1], within50[i + 2], 2, 0.45, K.ink);
        dim = glow({ fixed: true });
        stars.scene.add(cold.points(dim));
      }
      if (dim) dim.uniforms.uOpacity.value = p;
      ringMat.uniforms.uOpacity.value = 0.12 * p * ramp(x, 5, 6);
      coreGlow.uniforms.uOpacity.value = p;
      haloGlow.uniforms.uOpacity.value = p;
      headGlow.uniforms.uOpacity.value = p * (0.8 + 0.2 * Math.sin(clock * 3));
      const coreB = corePts.geometry.attributes.aBright as THREE.BufferAttribute;
      const haloB = haloPts.geometry.attributes.aBright as THREE.BufferAttribute;
      const haloK = haloPts.geometry.attributes.aKind as THREE.BufferAttribute;
      const headB = headPts.geometry.attributes.aBright as THREE.BufferAttribute;
      const headP = headPts.geometry.attributes.position as THREE.BufferAttribute;
      const put = (j: number, at: THREE.Vector3, b: number) => {
        headP.setXYZ(j, at.x, at.y, at.z);
        headP.setXYZ(j + 1, at.x, at.y, at.z);
        headB.setX(j, b);
        headB.setX(j + 1, 0.35 * b);
      };
      // The message in view bright, the others on their way faint, the rest of Earth's messages not at all.
      lit.clear();
      let aim: THREE.Vector3 | null = null;
      knocks.forEach((k, i) => {
        const mine = (reply: boolean) => list.find((b) => b.star === k.star && b.sent === k.sent && b.reply === reply);
        const [out, rep] = [mine(false), mine(true)];
        const seen = (b: typeof out) => (b ? (b === focus ? 1 : 0.35) : 0);
        const s = Math.max(seen(out), seen(rep));
        // How far out its light is, and how far home a reply sent the day it arrived would be, as shares of the way.
        const gone = Math.min(1, Math.max(0, (year - k.sent) / k.ly));
        const back = Math.min(1, Math.max(0, (year - k.sent - k.ly) / k.ly));
        head.copy(k.at).sub(home).multiplyScalar(gone).add(home);
        v.copy(home).sub(k.at).multiplyScalar(back).add(k.at);
        set(k.out, home, head);
        set(k.back, k.at, v);
        k.path.mat.uniforms.uOpacity.value = 0.22 * s * p;
        k.out.mat.uniforms.uOpacity.value = 0.75 * s * p;
        k.back.mat.uniforms.uOpacity.value = back > 0 ? 0.85 * seen(rep) * p : 0;
        put(i * 4, head, gone < 1 ? seen(out) : 0);
        put(i * 4 + 2, v, back > 0 && back < 1 ? seen(rep) : 0);
        lit.set(k.star, Math.max(lit.get(k.star) ?? 0, s));
        if (focus && (focus === out || focus === rep)) aim = (focus.reply ? v : head).clone();
      });
      names.forEach((n, j) => {
        const s = lit.get(n) ?? 0;
        coreB.setX(j, s);
        haloB.setX(j, s >= 1 ? 0.45 + 0.2 * Math.sin(clock * 1.8) : 0);
        haloK.setX(j, focus?.reply && focus.star === n ? K.lamp : K.mind);
      });
      coreB.needsUpdate = haloB.needsUpdate = haloK.needsUpdate = true;
      headP.needsUpdate = headB.needsUpdate = true;

      if (spec.mode === "beams" && spec.onMarks) {
        const w = parent.clientWidth;
        const h = parent.clientHeight;
        const onScreen = (at: THREE.Vector3, id: string, a: number): Mark => {
          v.copy(at).project(stars.camera);
          return { id, x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h, a: v.z < 1 ? a : 0 };
        };
        const marks = names.map((n) => onScreen(targetAt(n), n, p * Math.min(1, 2 * (lit.get(n) ?? 0))));
        marks.push(onScreen(origin, "Sol", p * ramp(x, 4, 5)));
        // Where the light in view is now, for its words.
        if (aim) marks.push(onScreen(aim, "head", p));
        spec.onMarks(marks);
      }
    };
  }

  // ── Our builds: each where it would stand, dashed while it waits, drawn round as it goes up, lit once done ──
  function building() {
    const g = new THREE.Group();
    g.position.copy(moonAt);
    earth.scene.add(g);
    // The Moon in dots, its seas dark: the atlas's Moon map, read as Earth's land is. They come once the map has.
    const ground = new THREE.ShaderMaterial({
      uniforms: { ...shared, uSun: { value: sunDir }, uOpacity: { value: 0 }, uLights: { value: 0 }, uLit: { value: 1 } },
      vertexShader: SURFACE_VERT,
      fragmentShader: GLOW_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    let groundAt = Infinity;
    moonFace().then((face) => {
      if (gone) return;
      const dots = new Cloud();
      const scatter = seededRandom(1969);
      const N = 9000;
      for (let i = 0; i < N; i++) {
        const y = 1 - (2 * (i + 0.5)) / N;
        const t = i * Math.PI * (3 - Math.sqrt(5));
        // A little scatter, so the spiral the points are laid on doesn't show.
        const lat = Math.asin(y) / DEG + (scatter() - 0.5) * 0.9;
        const lon = Math.atan2(Math.sin(t), Math.cos(t)) / DEG + (scatter() - 0.5) * 0.9;
        const at = onMoon(lat, lon).multiplyScalar(MOON_R * 1.003);
        const tone = Math.min(1, Math.max(0, (face(lat, lon) - 70) / 120));
        dots.add(at.x, at.y, at.z, 0.0075, 0.05 + 0.85 * tone ** 3, K.ink);
      }
      g.add(dots.points(ground));
      groundAt = clock;
      dirty = true;
    });

    // Each place: drawn lines on the ground, dashed for the plan and turning slowly, and drawn solid as it is built. On
    // the Moon, a ring round the site, and a thread home to Earth. On Earth, a dome over each place, the sky it
    // watches, turning with Earth. Each place is a point in a glow, which on the Moon beats each time light could
    // cross from Earth.
    const RING = 64;
    const beat = (moonAt.length() * 6371.0084) / 299792.458;
    const up = new THREE.Vector3(0, 0, 1);
    /** A ring, as line segments round the place: in its own frame, z up. */
    const ring = (r: number) => {
      const pts: number[] = [];
      for (let i = 0; i < RING; i++) {
        const [a, b] = [(i / RING) * 2 * Math.PI, ((i + 1) / RING) * 2 * Math.PI];
        pts.push(r * Math.sin(a), r * Math.cos(a), 0, r * Math.sin(b), r * Math.cos(b), 0);
      }
      return pts;
    };
    /** A dome: its ground ring, then three arcs over the top, from the ground up. */
    const dome = (r: number) => {
      const pts = ring(r);
      const N = RING / 2;
      for (const φ of [0, Math.PI / 3, (2 * Math.PI) / 3])
        for (const side of [1, -1])
          for (let i = 0; i < N / 2; i++) {
            const [a, b] = [(i / N) * Math.PI, ((i + 1) / N) * Math.PI];
            const at = (t: number) => [
              r * Math.cos(t) * Math.cos(φ) * side,
              r * Math.cos(t) * Math.sin(φ) * side,
              r * Math.sin(t),
            ];
            pts.push(...at(a), ...at(b));
          }
      return pts;
    };
    /** Lines at a place, dashed or solid, in a frame set flat on the ground there. */
    function lines(pts: number[], dashed: boolean, parent: THREE.Object3D, at: THREE.Vector3, flat: THREE.Quaternion) {
      const kept = dashed ? pts.filter((_, i) => Math.floor(i / 6) % 2 === 0) : pts;
      const mat = line(dashed ? "ink" : "mind", 0, true);
      const l = new THREE.LineSegments(
        new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(kept, 3)),
        mat,
      );
      l.frustumCulled = false;
      const holder = new THREE.Group();
      holder.position.copy(at);
      holder.quaternion.copy(flat);
      holder.add(l);
      parent.add(holder);
      return { l, holder, mat, n: kept.length / 6 };
    }
    function mark(w: NonNullable<Show["works"]>[number]) {
      const moon = w.site.on === "moon";
      const places = w.site.places.map((pl, k) => {
        const s =
          moon && k === 0
            ? siteAt(w)
            : moon
              ? onMoon(pl.lat, pl.lon)
              : new THREE.Vector3(...onGlobe(pl.lat, pl.lon, 1));
        const parent = moon ? g : spin;
        const at = s.clone().multiplyScalar(moon ? MOON_R * 1.004 : 1.003);
        const flat = new THREE.Quaternion().setFromUnitVectors(up, s);
        const pts = moon ? ring(MOON_R * 0.15) : dome(0.3);
        const spot = new Cloud();
        spot.add(at.x, at.y, at.z, 4.5, 1, K.mind);
        spot.add(at.x, at.y, at.z, 22, 0.5, K.mind);
        const spotGlow = glow({ fixed: true, depthTest: true });
        spotGlow.blending = THREE.AdditiveBlending;
        const dots = spot.points(spotGlow);
        parent.add(dots);
        return {
          at,
          parent,
          dashed: lines(pts, true, parent, at, flat),
          solid: lines(pts, false, parent, at, flat),
          dots,
          spotGlow,
        };
      });
      let threadMat: THREE.ShaderMaterial | null = null;
      if (moon) {
        threadMat = line("mind", 0, true);
        const thread = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([places[0].at.clone().add(moonAt), new THREE.Vector3()]),
          threadMat,
        );
        thread.frustumCulled = false;
        earth.scene.add(thread);
      }
      return { moon, places, threadMat };
    }
    const made = new Map<string, ReturnType<typeof mark>>();
    const v = new THREE.Vector3();
    const n = new THREE.Vector3();
    // Fading out, the view keeps the builds it last had.
    let list: NonNullable<Show["works"]> = [];

    return (x: number, p: number, dt: number) => {
      if (spec.mode === "works") list = spec.works ?? [];
      const years = (dialsOf.works?.year ?? YEAR_0) - YEAR_0;
      const focus = list[aimedWork()];
      ground.uniforms.uOpacity.value = p * arrived(groundAt) * Number(focus?.site.on !== "earth");
      const flash = still ? 0 : Math.exp(-((clock % beat) / beat) * 5);
      for (const w of list) {
        if (!made.has(w.name)) made.set(w.name, mark(w));
        const m = made.get(w.name)!;
        const seen = w.name === focus?.name ? p : 0;
        const built = w.queued && w.done !== null ? Math.min(1, Math.max(0, years / w.done)) : 0;
        const beats = m.moon ? flash : 0;
        for (const pl of m.places) {
          pl.dashed.mat.uniforms.uOpacity.value = seen * (built >= 1 ? 0 : w.queued ? 0.8 : 0.45);
          if (!still) pl.dashed.holder.rotateZ(dt * 0.12);
          pl.solid.l.geometry.setDrawRange(0, 2 * Math.round(pl.solid.n * built));
          pl.solid.mat.uniforms.uOpacity.value = 0.9 * seen;
          const b = pl.dots.geometry.attributes.aBright as THREE.BufferAttribute;
          b.setX(0, 0.45 + 0.55 * built);
          b.setX(1, (0.25 + 0.35 * built) * (0.7 + (0.3 + 0.7 * built) * beats));
          b.needsUpdate = true;
          pl.spotGlow.uniforms.uOpacity.value = seen;
        }
        if (m.threadMat) m.threadMat.uniforms.uOpacity.value = seen * (0.14 + 0.3 * built);
      }

      if (spec.mode === "works" && spec.onMarks) {
        const w = parent.clientWidth;
        const h = parent.clientHeight;
        const marks: Mark[] = [];
        const m = focus && made.get(focus.name);
        m?.places.forEach((pl, k) => {
          // A place on Earth's far side, turned away from us, is not named.
          pl.parent.localToWorld(v.copy(pl.at));
          const facing = m.moon || n.copy(v).normalize().dot(n.clone().subVectors(earth.camera.position, v)) > 0;
          v.project(earth.camera);
          const a = v.z < 1 && facing ? p : 0;
          marks.push({ id: `site:${focus.name}:${k}`, x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h, a });
        });
        // Earth, from the Moon, often behind us: then its way across the screen is the other side of the middle, far
        // off.
        if (m?.moon) {
          const behind = v.set(0, 0, 0).applyMatrix4(earth.camera.matrixWorldInverse).z > 0;
          v.set(0, 0, 0).project(earth.camera);
          const k = behind ? -1000 : 1;
          const a = p * ramp(-x, 2.4, 3.2);
          marks.push({ id: "earth", x: ((v.x * k + 1) / 2) * w, y: ((1 - v.y * k) / 2) * h, a });
        }
        spec.onMarks(marks);
      }
    };
  }

  // ── Data that comes later: Earth's land and lights, and the stars ──
  let gone = false;
  let lightsData: Light[] | null = null;
  /** The stars within 50 light-years, for Where things stand: x, y, z and distance, in ly. */
  const within50: number[] = [];
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
    // Cities first, then towns, for a screen that lights them in turn.
    const all = lights as Light[];
    const order = all.map((l, i) => ({ k: l[2] + rand() * 2.5, i })).sort((a, b) => b.k - a.k);
    const rank = new Float32Array(all.length);
    order.forEach((o, r) => (rank[o.i] = r / all.length));
    all.forEach(([lat, lon, b], i) => {
      const [x, y, z] = onGlobe(lat, lon, 1.004);
      ground.add(x, y, z, 0.007 + b * 0.0022, 0.3 + b * 0.08, K.lamp, rank[i]);
    });
    spin.add(ground.points(surface));
    lightsData = all;
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
        if (ly > 1e-3 && ly < 50) within50.push(x, y, z, ly);
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

  // ── Colors ──
  KINDS.forEach((k, i) => paint(PALETTE[k], pal[i]));
  paint(PALETTE.dust, bg);
  renderer.setClearColor(PALETTE.bg);
  for (const m of glows) m.blending = m.userData.dust ? THREE.NormalBlending : THREE.AdditiveBlending;
  earthGlobe.uniforms.uDay.value = 0.07;
  earthGlobe.uniforms.uRim.value = 0.8;
  earthGlobe.uniforms.uRimColor.value = pal[K.mind];
  moonGlobe.uniforms.uDay.value = 0.42;
  moonGlobe.uniforms.uRim.value = 0.15;
  air.blending = THREE.AdditiveBlending;

  // ── Size ──
  let dpr = 1;
  function fit() {
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (!w || !h) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    shared.uDpr.value = dpr;
    dirty = true;
  }

  // The lens frames the screen's art, wherever it sits in the sky's frame: the art's short side spans the same angle
  // everywhere, the subject sits at its center, and the sky runs on past it to the frame's edges. Between screens the
  // framing eases from one art to the next with the camera.
  type Framing = { cx: number; cy: number; w: number; h: number };
  let framing: Framing | null = null;
  let framingFrom: Framing | null = null;
  let focal = 1;
  function framingOf(s: Show): Framing {
    const W = parent.clientWidth;
    const H = parent.clientHeight;
    const r = s.rect?.();
    // A screen's art box gone, as between one screen and the next: the framing holds where it was until the next
    // screen places its own. A screen with no art, or a hidden one, frames the whole sky.
    if (r === null && framing) return framing;
    const box = r && r.w > 8 && r.h > 8 ? r : { x: 0, y: 0, w: W, h: H };
    return { cx: box.x + box.w / 2, cy: box.y + box.h / 2 - (LIFTS[s.mode] ?? 0) * box.h, w: box.w, h: box.h };
  }
  function frameLens() {
    const W = parent.clientWidth;
    const H = parent.clientHeight;
    if (!W || !H) return;
    const to = framingOf(spec);
    const k = framingFrom ? easeInOut(pilot.progress()) : 1;
    const f: Framing = framingFrom
      ? {
          cx: framingFrom.cx + (to.cx - framingFrom.cx) * k,
          cy: framingFrom.cy + (to.cy - framingFrom.cy) * k,
          w: framingFrom.w + (to.w - framingFrom.w) * k,
          h: framingFrom.h + (to.h - framingFrom.h) * k,
        }
      : to;
    if (k >= 1) framingFrom = null;
    framing = f;
    focal = f.h / (2 * Math.tan(lens(f.w, f.h) / 2));
    const VW = 2 * Math.max(f.cx, W - f.cx, 1);
    const VH = 2 * Math.max(f.cy, H - f.cy, 1);
    for (const L of layers) {
      L.camera.fov = (2 * Math.atan(VH / (2 * focal))) / DEG;
      L.camera.aspect = VW / VH;
      L.camera.setViewOffset(VW, VH, VW / 2 - f.cx, VH / 2 - f.cy, W, H);
    }
    shared.uFocal.value = focal * dpr;
  }
  const ro = new ResizeObserver(fit);
  ro.observe(parent);

  let clock = 0;
  let dirty = true;
  const look = new THREE.Vector3();
  const shift = new THREE.Vector3();
  /** The view's move toward the path in view, eased in time. It shows in full only out among the stars. */
  const aimShift = new THREE.Vector3();
  const mid = new THREE.Vector3();
  // Each screen's extras: built when first shown, and faded in and out as their screen comes and goes.
  let kit: ReturnType<typeof inheritance> | null = null;
  let road: ReturnType<typeof sunsRoad> | null = null;
  let noise: ReturnType<typeof standing> | null = null;
  let machines: ReturnType<typeof meeting> | null = null;
  let clues: ReturnType<typeof leading> | null = null;
  let sent: ReturnType<typeof sending> | null = null;
  let builds: ReturnType<typeof building> | null = null;
  /** Our builds: where the view's middle has moved to, in AU from Earth, and its hop there from where it was. */
  const workShift = new THREE.Vector3();
  const hop = { from: new THREE.Vector3(), to: new THREE.Vector3(), at: 0, secs: 0 };
  const goal = new THREE.Vector3();
  const presence: Partial<Record<Mode, number>> = {};
  let lastClock = 0;
  function present(mode: Mode, dt: number) {
    const target = spec.mode === mode ? 1 : 0;
    const p = still ? target : (presence[mode] ?? 0) + (target - (presence[mode] ?? 0)) * (1 - Math.exp(-dt * 2.5));
    presence[mode] = p < 0.002 && !target ? 0 : p;
    return presence[mode]!;
  }
  /** Where we come from's moments, which can come after its screen does: the road is built once they are here. */
  let momentsOf = first.moments ?? [];

  /** Data fades in when it arrives, or shows at once in a still. */
  const arrived = (at: number) => (still ? Number(at < Infinity) : smooth((clock - at) / 1.6));

  function draw() {
    const dt = Math.min(0.1, Math.max(0, clock - lastClock));
    lastClock = clock;
    const view = pilot.at(clock);
    const { target, cam, up } = view;
    // Our builds: the view's middle hops to the one in view, near its site, and home after. On the way the view backs
    // off, so where it left and where it goes show together.
    const work = spec.mode === "works" ? spec.works?.[aimedWork()] : undefined;
    if (work?.site.on === "moon")
      goal.copy(siteAt(work)).multiplyScalar(MOON_R * 0.45).add(moonAt).multiplyScalar(R_E_AU);
    else goal.set(0, 0, 0);
    if (!goal.equals(hop.to)) {
      hop.from.copy(workShift);
      hop.to.copy(goal);
      hop.at = clock;
      hop.secs = still ? 0 : 2.8;
    }
    const h = hop.secs ? easeInOut(Math.min(1, (clock - hop.at) / hop.secs)) : 1;
    workShift.lerpVectors(hop.from, hop.to, h);
    const back = 2 * hop.from.distanceTo(hop.to) * 4 * h * (1 - h);
    target.add(workShift);
    cam.add(workShift).addScaledVector(view.dir, back);
    const D = view.D + back;
    const logD = back ? Math.log10(D) : view.logD;
    // What doesn't fit and our messages: the view moves over to the middle of the path in view. Nearer than the stars
    // it stays on Earth, so a flight out to a path starts from Earth, and a flight home ends there.
    const P = (spec.mode === "leads" || spec.mode === "beams") && !still ? lookedAt() : null;
    aimShift.lerp(P ? mid.copy(P).multiplyScalar(0.5 * LY_AU) : mid.set(0, 0, 0), 1 - Math.exp(-dt * LOOK));
    shift.copy(aimShift).multiplyScalar(ramp(logD, 5.2, 6.3));
    target.add(shift);
    cam.add(shift);
    frameLens();

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
    turned += (dt * 86164e3) / turnOf();
    spin.quaternion.copy(bodyOrientation("Earth", new Date(date.getTime() + turned)));
    const pPeople = present("people", dt);
    const pInherit = present("inherit", dt);
    const pOrigins = present("origins", dt);
    const pStand = present("stand", dt);
    const pMind = present("mind", dt);
    const pLeads = present("leads", dt);
    const pBeams = present("beams", dt);
    const pWorks = present("works", dt);
    // Close by our builds, the Moon's dots carry its face, so its globe goes dark under them.
    moonGlobe.uniforms.uDay.value = 0.42 * (1 - 0.75 * pWorks);
    surface.uniforms.uOpacity.value = arrived(surfaceAt);
    // Who we are lights the cities in turn. Elsewhere they are all lit.
    surface.uniforms.uLit.value = 1 + ((dialsOf.people?.lit ?? 1) - 1) * pPeople;
    surface.uniforms.uLights.value = 1 - ramp(x, -2.7, -1.9);
    (moonRing.material as THREE.ShaderMaterial).uniforms.uOpacity.value = 0.3 * band(x, -3.4, -2.6, -1.2, -0.5);
    planetGlow.uniforms.uOpacity.value = band(x, -2.1, -1.2, 2.6, 3.0);
    orbits.forEach((o: THREE.LineLoop, i: number) => {
      (o.material as THREE.ShaderMaterial).uniforms.uOpacity.value =
        (i === 2 ? 0.55 : 0.2) * band(x, -1.6, -0.5, 3.3, 4.4);
    });
    beltGlow.uniforms.uOpacity.value = band(x, -0.8, 0.1, 2.6, 3.4);
    kuiperGlow.uniforms.uOpacity.value = band(x, 0.6, 1.5, 3.8, 4.6);
    oortGlow.uniforms.uOpacity.value = band(x, 2.6, 3.6, 5.2, 6.0);
    pairGlow.uniforms.uOpacity.value = band(x, -2.7, -2.3, -0.9, -0.4);
    // From inside the Milky Way, the other galaxies are faint smudges.
    othersGlow.uniforms.uOpacity.value = 0.3 + 0.7 * ramp(x, 9.5, 10.6);
    halosGlow.uniforms.uOpacity.value = ramp(x, 10.4, 11.1);
    // The star map's stalks and rings, on the title's flight and the map, not on the screens between.
    const pTitle = present("title", dt);
    const map = arrived(starsAt) * band(x, 5.6, 6.2, 7.0, 7.6) * (spec.mode === "map" ? 1 : pTitle);
    mapDots.uniforms.uOpacity.value = map;
    stalks.uniforms.uOpacity.value = 0.2 * map;
    rings.uniforms.uOpacity.value = 0.16 * map;
    starMat.uniforms.uOpacity.value = arrived(starsAt) * (1 - ramp(x, 8.6, 9.3));
    // From inside, the Milky Way is a soft band across the sky.
    mwGlow.uniforms.uOpacity.value = dustGlow.uniforms.uOpacity.value = 0.4 + 0.6 * ramp(x, 7.5, 9);
    mwGlow.uniforms.uMaxPx.value = 1.6 + 1.9 * ramp(x, 7.5, 9);
    homeGlow.uniforms.uOpacity.value = band(x, 5.4, 6.1) * (0.65 + 0.35 * Math.sin(clock * 2.2));

    if (pPeople > 0) people(up, pPeople);
    if (pInherit > 0) (kit ??= inheritance())(x, pInherit);
    if (pOrigins > 0) {
      if (!road && momentsOf.length) road = sunsRoad(momentsOf);
      road?.(x, pOrigins);
    }
    if (pStand > 0) (noise ??= standing())(x, pStand);
    if (pMind > 0) (machines ??= meeting())(up, pMind);
    if (pLeads > 0) {
      if (!clues && spec.mode === "leads" && spec.leads?.length) clues = leading(spec.leads);
      clues?.(pLeads);
    }
    if (pBeams > 0) (sent ??= sending())(x, pBeams);
    if (pWorks > 0) (builds ??= building())(x, pWorks, dt);
    if (spec.onScale && framing) spec.onScale((D * 149597870.7) / focal, framing.w, framing.h);

    renderer.clear();
    for (const L of layers) {
      if (!L.on) continue;
      renderer.clearDepth();
      renderer.render(L.scene, L.camera);
    }
    if (spec.mode === "title") spec.onFrame?.(Math.max(0, cam.distanceTo(earthAU) - R_E_AU));
  }

  let raf = 0;
  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    // A still is one frame, redrawn only when something changes.
    if (still && !dirty) return;
    clock = pilot.clock(now);
    dirty = false;
    draw();
  }

  fit();
  raf = requestAnimationFrame(frame);

  return {
    show(next) {
      // The same screen again, as on a remount or once its data comes: take its new callbacks, keep flying, and say
      // how long is left.
      if (next.moments?.length) momentsOf = next.moments;
      if (next.mode === spec.mode && next.dials === spec.dials) {
        spec = next;
        return pilot.remaining(clock);
      }
      if (framing) framingFrom = framing;
      spec = next;
      if (next.dials) dialsOf[next.mode] = next.dials;
      dirty = true;
      return pilot.fly(poseFor(next), clock);
    },
    home: () => pilot.home(clock),
    go(stop) {
      pilot.go(stop, clock);
      dirty = true;
    },
    turn(dx, dy) {
      pilot.turnBy(dx, dy);
      dirty = true;
    },
    dispose() {
      gone = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      pilot.dispose();
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

/** A night light: latitude, longitude, and brightness from 1 to 9. NASA's Black Marble, via scripts/lights.mjs. */
type Light = [lat: number, lon: number, b: number];

/** The brightest cities, spread apart: where the threads start. */
function hubs(lights: Light[], n: number, apart: number) {
  const out: Light[] = [];
  for (const l of [...lights].sort((a, b) => b[2] - a[2])) {
    if (out.every((h) => Math.hypot(h[0] - l[0], (h[1] - l[1]) * Math.cos(l[0] * DEG)) > apart)) out.push(l);
    if (out.length === n) break;
  }
  return out;
}

/** A point on Earth in the globe's frame: +Y north, +X the prime meridian, as the atlas orients it. */
function onGlobe(lat: number, lon: number, r: number): [number, number, number] {
  const φ = lat * DEG;
  const λ = lon * DEG;
  return [r * Math.cos(φ) * Math.cos(λ), r * Math.sin(φ), -r * Math.cos(φ) * Math.sin(λ)];
}

/** The Moon's face, read off the atlas's Moon map: how bright it is at a latitude and east longitude, 0 to 255. The
 *  seas are dark. */
async function moonFace() {
  const img = new Image();
  img.src = moonMap;
  await img.decode();
  const W = 512;
  const H = 256;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d", { willReadFrequently: true })!;
  g.drawImage(img, 0, 0, W, H);
  const d = g.getImageData(0, 0, W, H).data;
  return (lat: number, lon: number) => {
    const x = Math.min(W - 1, Math.floor((((lon / 360 + 0.5) % 1) + 1) % 1 * W));
    const y = Math.min(H - 1, Math.max(0, Math.floor((0.5 - lat / 180) * H)));
    const i = (y * W + x) * 4;
    return (d[i] + d[i + 1] + d[i + 2]) / 3;
  };
}

/** Land or sea, read off the atlas's day map: the sea is the blue. */
async function landMask() {
  const img = new Image();
  img.src = earthDaymap;
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
