// Where the camera is, in the atlas's galactic frame and AU, for the scene in lib/drift.ts. Two pilots: the title's
// flight, a loop out to the Local Group and home, and the map's voyage between five stops. Both frame each scale the
// same way. Client only.
import * as THREE from "three";
import { AU_KM } from "../../src/astronomy.js";
import { bodyPosition } from "../../src/ephemeris.js";
import { GALAXIES, galaxyPosition } from "../../src/galaxies.js";
import { GALACTIC_CENTER, LY_AU, eclipticToGalactic, homeTarget } from "../../src/navigation.js";

export const DEG = Math.PI / 180;
export const R_E_AU = 6371.0084 / AU_KM;
/** The lens across the screen's short side, in degrees: a phone's width, or a wide screen's height. */
const FOV = 32;
/** How far the view's center sits above the screen's, as a share of its height: room for the button below. */
export const LIFT = 0.06;

// log10 of the camera's distance in AU, at seconds into the loop. Each stage drifts slowly before the next pull. The
// last key dives home, and the loop starts over.
const LOOP = 148;
const KEYS: [t: number, logD: number][] = [
  [0, -3.7], // Earth, 23,000 km up
  [9, -3.58],
  [18, -1.98], // Earth and the Moon
  [25, -1.86],
  [36, 0.78], // the inner planets
  [43, 0.9],
  [53, 2.1], // the outer planets and the Kuiper belt
  [59, 2.22],
  [72, 6.55], // past the Oort cloud to the nearby stars
  [79, 6.7],
  [92, 10.05], // the Milky Way
  [102, 10.2],
  [116, 10.52], // the Local Group: the Milky Way, and Andromeda beyond
  [124, 10.62],
  [LOOP, -3.7],
];
/** The still for reduced motion: the Milky Way. */
const STILL_T = 97;

// How the view leans at each scale: elevation above the plane and roll, in radians. Up close the plane is the
// ecliptic, and from the stars outward the Milky Way's.
const POSE: [logD: number, el: number, roll: number][] = [
  [-3.7, 0.2, 0.12],
  [-1.9, 0.42, 0.28],
  [0.85, 0.66, 0.42],
  [2.2, 0.5, 0.38],
  [6.6, 0.45, 0.15],
  [10.1, 0.92, 0.5],
  [11.5, 0.5, 0.3],
];

export const smooth = (t: number) => {
  t = Math.min(1, Math.max(0, t));
  return t * t * (3 - 2 * t);
};
export const ramp = (x: number, a: number, b: number) => smooth((x - a) / (b - a));
/** Up from a to b, and down from c to d when given. */
export const band = (x: number, a: number, b: number, c?: number, d?: number) =>
  ramp(x, a, b) * (c === undefined || d === undefined ? 1 : 1 - ramp(x, c, d));

/** A monotone cubic through the keys: smooth, and never overshooting a stage. */
function track(keys: [number, number][]) {
  const n = keys.length;
  const d = keys.slice(1).map(([t, y], i) => (y - keys[i][1]) / (t - keys[i][0]));
  const m = keys.map((_, i) =>
    i === 0 || i === n - 1 || d[i - 1] * d[i] <= 0 ? 0 : (2 * d[i - 1] * d[i]) / (d[i - 1] + d[i]),
  );
  return (t: number) => {
    let i = 0;
    while (i < n - 2 && t > keys[i + 1][0]) i++;
    const [t0, y0] = keys[i];
    const [t1, y1] = keys[i + 1];
    const h = t1 - t0;
    const s = Math.min(1, Math.max(0, (t - t0) / h));
    const s2 = s * s;
    const s3 = s2 * s;
    return (
      (2 * s3 - 3 * s2 + 1) * y0 + (s3 - 2 * s2 + s) * h * m[i] + (-2 * s3 + 3 * s2) * y1 + (s3 - s2) * h * m[i + 1]
    );
  };
}

function poseAt(x: number) {
  if (x <= POSE[0][0]) return POSE[0];
  for (let i = 0; i < POSE.length - 1; i++) {
    const [a, ea, ra] = POSE[i];
    const [b, eb, rb] = POSE[i + 1];
    if (x <= b) {
      const s = smooth((x - a) / (b - a));
      return [x, ea + (eb - ea) * s, ra + (rb - ra) * s];
    }
  }
  return POSE[POSE.length - 1];
}

/** How far above the plane the view leans at a scale, before any tilt. */
export const leanAt = (logD: number) => poseAt(logD)[1];

/** The vertical field of view, in radians, for a screen of this shape. */
export const lens = (w: number, h: number) => 2 * Math.atan(Math.tan((FOV * DEG) / 2) * Math.max(1, h / w));

/** The map's stops, as log10 of the camera's distance in AU: the same places the title's flight rests. */
export const STOPS = { earth: -3.62, solar: 2.12, stars: 6.6, galaxy: 10.1, group: 10.57 } as const;
export type Stop = keyof typeof STOPS;

/** Today's sky, and the frames the camera turns in. The positions hold still. */
function today() {
  const date = new Date();
  const earthAU = new THREE.Vector3().copy(bodyPosition("Earth", date));
  const sunDir = earthAU.clone().negate().normalize();
  const eX = new THREE.Vector3().copy(eclipticToGalactic(new THREE.Vector3(1, 0, 0))).normalize();
  const eN = new THREE.Vector3().copy(eclipticToGalactic(new THREE.Vector3(0, 1, 0))).normalize();
  const eZ = new THREE.Vector3().copy(eclipticToGalactic(new THREE.Vector3(0, 0, 1))).normalize();
  return { date, earthAU, sunDir, eX, eN, eZ };
}
export type Sky = ReturnType<typeof today>;

/**
 * The camera at a distance and a turn, the same for the title and the map. `az` turns round the plane, `tilt` adds to
 * the elevation for the scale, and `swing` turns the Local Group view round the Milky Way.
 */
function framer({ earthAU, sunDir, eX, eN, eZ }: Sky) {
  const gX = new THREE.Vector3(1, 0, 0);
  const gN = new THREE.Vector3(0, 1, 0);
  const gZ = new THREE.Vector3(0, 0, 1);
  /** The camera starts 100° round from the Sun, so the terminator crosses Earth and its lights are on. */
  const az0 = Math.atan2(sunDir.dot(eZ), sunDir.dot(eX)) + 1.75;

  // The Local Group from behind the Milky Way, 45° off the line to Andromeda, so Andromeda shows clear of its disk. The
  // view stays on the Milky Way's center the whole way out.
  const m31 = GALAXIES.find((g: { id: string }) => g.id === "m31")!;
  const mwAU = new THREE.Vector3().copy(GALACTIC_CENTER);
  const toUs = mwAU
    .clone()
    .sub(new THREE.Vector3().copy(galaxyPosition(m31)).multiplyScalar(LY_AU))
    .normalize();
  const lift = gN.clone().addScaledVector(toUs, -gN.dot(toUs)).normalize();

  const view = {
    logD: 0,
    D: 1,
    target: new THREE.Vector3(),
    cam: new THREE.Vector3(),
    dir: new THREE.Vector3(),
    up: new THREE.Vector3(),
  };
  const ecl = new THREE.Vector3();
  const gal = new THREE.Vector3();
  const group = new THREE.Vector3();
  const side = new THREE.Vector3();
  const aim = (x: THREE.Vector3, n: THREE.Vector3, z: THREE.Vector3, az: number, el: number, out: THREE.Vector3) =>
    out
      .copy(x)
      .multiplyScalar(Math.cos(el) * Math.cos(az))
      .addScaledVector(z, Math.cos(el) * Math.sin(az))
      .addScaledVector(n, Math.sin(el));

  const frame = (logD: number, az: number, tilt: number, swing: number) => {
    const { up, dir } = view;
    const D = 10 ** logD;
    view.logD = logD;
    view.D = D;
    const [, el0, roll] = poseAt(logD);
    const el = Math.max(-1.35, Math.min(1.35, el0 + tilt));
    const w = ramp(logD, 3, 6);
    aim(eX, eN, eZ, az0 + az, el, ecl);
    aim(gX, gN, gZ, az0 + az, el, gal);
    dir.copy(ecl).lerp(gal, w).normalize();
    const wg = ramp(logD, 10.15, 10.55);
    if (wg > 0) {
      group
        .copy(toUs)
        .multiplyScalar(Math.cos(45 * DEG))
        .addScaledVector(lift, -Math.sin(45 * DEG) + tilt * 0.4)
        .normalize()
        .applyAxisAngle(gN, swing);
      dir.lerp(group, wg).normalize();
    }
    up.copy(eN).lerp(gN, w).normalize();
    up.addScaledVector(dir, -up.dot(dir)).normalize();
    side.crossVectors(dir, up);
    up.multiplyScalar(Math.cos(roll)).addScaledVector(side, Math.sin(roll));

    view.target.copy(homeTarget(D, earthAU)).lerp(mwAU, wg);
    view.cam.copy(view.target).addScaledVector(dir, D);
    return view;
  };
  return Object.assign(frame, { az0 });
}

export const easeInOut = (s: number) => (s < 0.5 ? 4 * s * s * s : 1 - (-2 * s + 2) ** 3 / 2);
const seconds = (now = performance.now()) => now / 1000;

/** A view: log10 of the distance in AU, the turn round the plane, the tilt, and the Local Group's swing. */
export type Pose = (clock: number) => [logD: number, az: number, tilt: number, swing: number];

/**
 * The game's one camera, from the title through the screens before the shell to the map, so the view never cuts. The
 * title flies its loop, each screen gives a pose, and the map rests at its stops and turns with a drag. Between them the
 * camera flies: distance, turn and tilt each eased from where it was to where the next view looks, so it zooms, pans
 * and orbits instead of fading.
 */
export function createDirector({ still }: { still: boolean }) {
  const sky = today();
  const frame = framer(sky);
  const start = seconds();
  const lean = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPointer = (e: PointerEvent) => {
    lean.tx = (e.clientX / window.innerWidth) * 2 - 1;
    lean.ty = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener("pointermove", onPointer);

  // The title's loop, from when the title is shown, and its dive home when the game begins.
  const logAt = track(KEYS);
  let titleAt = 0;
  let dive: { from: number; to: number; at: number; secs: number } | null = null;
  const title: Pose = (clock) => {
    const t = clock - titleAt;
    const logD = dive
      ? dive.from + (dive.to - dive.from) * easeInOut(Math.min(1, (clock - dive.at) / dive.secs))
      : logAt(still ? STILL_T : t % LOOP);
    const turn = (2 * Math.PI * (still ? STILL_T : t)) / LOOP;
    return [logD, turn + lean.x * 0.12, lean.y * 0.08, Math.sin(turn) * 0.12 + lean.x * 0.05];
  };

  // The map: it rests at a stop, turning slowly, flies to another when asked, and turns with a drag.
  let stop = { from: STOPS.earth as number, to: STOPS.earth as number, at: 0, secs: 0 };
  const turned = { az: 0, tilt: 0 };
  const map: Pose = (clock) => {
    const s = stop.secs ? Math.min(1, (clock - stop.at) / stop.secs) : 1;
    const drift = still ? 0 : (2 * Math.PI * clock) / 240;
    return [stop.from + (stop.to - stop.from) * easeInOut(s), drift + turned.az, turned.tilt, drift + turned.az];
  };

  let pose: Pose = title;
  let last: [number, number, number, number] = [KEYS[0][1], 0, 0, 0];
  let leg: { from: [number, number, number, number]; at: number; span: number } | null = null;
  let progress = 1;
  let seen = 0;

  return {
    sky,
    clock: (now?: number) => (still ? 10 : seconds(now) - start),
    /** How far the camera is between one screen's view and the next, 0 to 1. */
    progress: () => progress,
    /** The seconds left in the camera's flight to the current view. */
    remaining: (clock: number) => (leg ? Math.max(0, leg.at + leg.span - clock) : 0),
    /**
     * Flies to a screen's pose, the title's loop, or the map, which opens on Earth. `instant` starts there, as when the
     * game opens. Returns the flight's length in seconds.
     */
    fly(next: Pose | "title" | "map", clock: number, instant = false) {
      if (next === "title") {
        titleAt = clock;
        dive = null;
      }
      if (next === "map") {
        stop = { from: STOPS.earth, to: STOPS.earth, at: clock, secs: 0 };
        turned.az = turned.tilt = 0;
      }
      pose = next === "title" ? title : next === "map" ? map : next;
      const to = pose(clock);
      if (instant) last = to;
      const span = still || instant ? 0 : Math.min(4.5, Math.max(1.8, 1.8 + 0.28 * Math.abs(to[0] - last[0])));
      leg = span ? { from: [...last], at: clock, span } : null;
      progress = span ? 0 : 1;
      return span;
    },
    at(clock: number) {
      const dt = Math.min(0.1, Math.max(0, clock - seen));
      seen = clock;
      lean.x += (lean.tx - lean.x) * (1 - Math.exp(-dt * 1.5));
      lean.y += (lean.ty - lean.y) * (1 - Math.exp(-dt * 1.5));
      const to = pose(clock);
      if (leg) {
        progress = Math.min(1, (clock - leg.at) / leg.span);
        const s = easeInOut(progress);
        const turn = ((((to[1] - leg.from[1] + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;
        last = [
          leg.from[0] + (to[0] - leg.from[0]) * s,
          leg.from[1] + turn * s,
          leg.from[2] + (to[2] - leg.from[2]) * s,
          leg.from[3] + (to[3] - leg.from[3]) * s,
        ];
        if (progress >= 1) leg = null;
      } else last = to;
      return frame(...last);
    },
    /** The turn that puts the camera off toward x, z in the plane the view turns in: the Milky Way's from the stars
     *  outward, and nearer, the ecliptic's, given as x along eX and z along eZ. */
    facing: (x: number, z: number) => Math.atan2(z, x) - frame.az0,
    /** The map: flies to a stop. Returns the flight's length in seconds. */
    go(to: Stop, clock: number) {
      const from = map(clock)[0];
      const secs = still ? 0 : Math.min(4.5, Math.max(1.4, 1.4 + Math.abs(from - STOPS[to]) * 0.22));
      stop = { from, to: STOPS[to], at: clock, secs };
      return secs;
    },
    /** The map: turns the view by a drag, as shares of the view's width and height. */
    turnBy(dx: number, dy: number) {
      turned.az -= dx * Math.PI;
      turned.tilt = Math.max(-1.2, Math.min(1.2, turned.tilt + dy * 1.4));
    },
    /** The title's dive home to Earth when the game begins. Returns its length in seconds. */
    home(clock: number) {
      if (still) return 0;
      const to = Math.log10(2.3 * R_E_AU);
      const secs = Math.min(2.3, Math.max(1.1, 0.9 + Math.abs(last[0] - to) * 0.1));
      dive = { from: last[0], to, at: clock, secs };
      return secs;
    },
    dispose() {
      window.removeEventListener("pointermove", onPointer);
    },
  };
}

/** log10 of the km across half the view's short side, per AU of camera distance. */
export const HALF_VIEW_KM = Math.log10(AU_KM * Math.tan((FOV * DEG) / 2));
