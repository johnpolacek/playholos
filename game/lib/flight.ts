// The first screen's flight: where the camera is at each moment of the drift, in the atlas's galactic frame and AU.
// Shared by both of the screen's looks, lib/drift.ts and the map's line art, so each draws the same flight. Two
// flights given the same epoch are at the same place at the same moment. Client only.
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
/** Up from a to b, down from c to d. */
export const band = (x: number, a: number, b: number, c = Infinity, d = Infinity) =>
  ramp(x, a, b) * (1 - ramp(x, c, d));

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

export type Flight = ReturnType<typeof createFlight>;

/** Flights given the same epoch, as side by side for comparison, dive home together. */
const flocks = new Map<number, Set<(clock: number) => number>>();

/** `epoch` is when the loop starts, on performance.now()'s clock: now, unless given. */
export function createFlight({ still, epoch }: { still: boolean; epoch?: number }) {
  const start = epoch ?? performance.now();
  // Today's sky. The positions hold still.
  const date = new Date();
  const earthAU = new THREE.Vector3().copy(bodyPosition("Earth", date));
  const sunDir = earthAU.clone().negate().normalize();
  const eX = new THREE.Vector3().copy(eclipticToGalactic(new THREE.Vector3(1, 0, 0))).normalize();
  const eN = new THREE.Vector3().copy(eclipticToGalactic(new THREE.Vector3(0, 1, 0))).normalize();
  const eZ = new THREE.Vector3().copy(eclipticToGalactic(new THREE.Vector3(0, 0, 1))).normalize();
  const gX = new THREE.Vector3(1, 0, 0);
  const gN = new THREE.Vector3(0, 1, 0);
  const gZ = new THREE.Vector3(0, 0, 1);
  /** The camera starts 100° round from the Sun, so the terminator crosses Earth and its lights are on. */
  const AZ0 = Math.atan2(sunDir.dot(eZ), sunDir.dot(eX)) + 1.75;

  // The Local Group from behind the Milky Way, 45° off the line to Andromeda, so Andromeda shows clear of its disk. The
  // view stays on the Milky Way's center the whole way out.
  const m31 = GALAXIES.find((g: { id: string }) => g.id === "m31")!;
  const mwAU = new THREE.Vector3().copy(GALACTIC_CENTER);
  const toUs = mwAU
    .clone()
    .sub(new THREE.Vector3().copy(galaxyPosition(m31)).multiplyScalar(LY_AU))
    .normalize();
  const lift = gN.clone().addScaledVector(toUs, -gN.dot(toUs)).normalize();
  const aside = toUs.clone().cross(lift);

  // A touch or the pointer leans the view a little: by where it is on the whole page, so side-by-side looks agree.
  const lean = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPointer = (e: PointerEvent) => {
    lean.tx = (e.clientX / window.innerWidth) * 2 - 1;
    lean.ty = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener("pointermove", onPointer);

  const logAt = track(KEYS);
  let dive: { from: number; to: number; at: number; secs: number } | null = null;
  let last = 0;
  const view = {
    logD: KEYS[0][1],
    D: 10 ** KEYS[0][1],
    target: new THREE.Vector3(),
    cam: new THREE.Vector3(),
    dir: new THREE.Vector3(),
    up: new THREE.Vector3(),
  };
  const diveHome = (clock: number) => {
    if (still) return 0;
    const to = Math.log10(2.3 * R_E_AU);
    const secs = Math.min(2.3, Math.max(1.1, 0.9 + Math.abs(view.logD - to) * 0.1));
    dive = { from: view.logD, to, at: clock, secs };
    return secs;
  };
  const flock = epoch === undefined ? undefined : (flocks.get(epoch) ?? flocks.set(epoch, new Set()).get(epoch)!);
  flock?.add(diveHome);
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

  return {
    date,
    earthAU,
    sunDir,
    eX,
    eN,
    eZ,

    /** Seconds since the epoch. A still holds at one moment. */
    clock: (now = performance.now()) => (still ? 10 : (now - start) / 1000),

    /** The vertical field of view, in radians, for a screen of this shape. */
    lens: (w: number, h: number) => 2 * Math.atan(Math.tan((FOV * DEG) / 2) * Math.max(1, h / w)),

    /** Where the camera is at this clock, around Earth where it is now. The vectors are reused from call to call. */
    at(clock: number, earth: THREE.Vector3 = earthAU) {
      const dt = Math.min(0.1, Math.max(0, clock - last));
      last = clock;
      const { up, dir } = view;
      if (dive) {
        const s = Math.min(1, (clock - dive.at) / dive.secs);
        view.logD = dive.from + (dive.to - dive.from) * (s < 0.5 ? 4 * s * s * s : 1 - (-2 * s + 2) ** 3 / 2);
      } else view.logD = logAt(still ? STILL_T : clock % LOOP);
      const logD = view.logD;
      const D = (view.D = 10 ** logD);

      lean.x += (lean.tx - lean.x) * (1 - Math.exp(-dt * 1.5));
      lean.y += (lean.ty - lean.y) * (1 - Math.exp(-dt * 1.5));
      const [, el0, roll] = poseAt(logD);
      const az = AZ0 + (2 * Math.PI * (still ? STILL_T : clock)) / LOOP + lean.x * 0.12;
      const el = el0 + lean.y * 0.08;
      const w = ramp(logD, 3, 6);
      aim(eX, eN, eZ, az, el, ecl);
      aim(gX, gN, gZ, az, el, gal);
      dir.copy(ecl).lerp(gal, w).normalize();
      const wg = ramp(logD, 10.15, 10.55);
      if (wg > 0) {
        const sway = Math.sin((2 * Math.PI * clock) / LOOP) * 0.12 + lean.x * 0.05;
        group
          .copy(toUs)
          .multiplyScalar(Math.cos(45 * DEG))
          .addScaledVector(lift, -Math.sin(45 * DEG) + lean.y * 0.03)
          .addScaledVector(aside, sway)
          .normalize();
        dir.lerp(group, wg).normalize();
      }
      up.copy(eN).lerp(gN, w).normalize();
      up.addScaledVector(dir, -up.dot(dir)).normalize();
      side.crossVectors(dir, up);
      up.multiplyScalar(Math.cos(roll)).addScaledVector(side, Math.sin(roll));

      view.target.copy(homeTarget(D, earth)).lerp(mwAU, wg);
      view.cam.copy(view.target).addScaledVector(dir, D);
      return view;
    },

    /** Dives home to Earth from wherever the flight is. Returns the dive's length in seconds. */
    home(clock: number) {
      return Math.max(...[...(flock ?? [diveHome])].map((go) => go(clock)));
    },

    dispose() {
      window.removeEventListener("pointermove", onPointer);
      flock?.delete(diveHome);
    },
  };
}
