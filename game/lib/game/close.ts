// What a build would look like up close, for the map's Close View: drawn in lines and lights at its place, in km, x
// east, y north and z up. In orbit, x is the way it goes and z is away from Earth. At L2, z is away from the Sun.
// Real where we know it, our own where no one has said. Sources in HOLOS_RESEARCH.md, "Close views". Settled
// 2026-10-18.

export interface Close {
  /** Where the camera stands: how far from the middle in km, its angle above the ground, and which way it looks
   *  from, in degrees east of north. It looks at the middle, or at `at`, km east, north and up from it. */
  view: { km: number; el: number; az: number; at?: [number, number, number?] };
  /** What stands there already in 2040, as line segments: drawn dim and whole. */
  have: number[];
  /** The build, as line segments in the order it goes up. */
  build: number[];
  /** Its lights: x, y, z, size in km, and when each comes on as the build goes up, 0 to 1. */
  lights: number[];
  /** What stood there already, lit: x, y, z and size in km. */
  haveLights: number[];
  /** Once it is done: faint lines of the sky it watches, or the paths its craft fly. */
  sky?: number[];
  /** Once it is done: a light running each path, x, y, z a point, over `secs`, starting `offset` of the way along.
   *  One that lands, as a flash does, comes in bright. The rest rise and fade, as craft do. */
  runs?: { pts: number[]; secs: number; offset?: number; lands?: boolean }[];
  /** How often its lights beat, in seconds, if they do. */
  beat?: number;
  /** Towns around it, with about how many people: their lights show at night. */
  towns?: [name: string, lat: number, lon: number, people: number][];
  /** The shore, from one point to another, by latitude and longitude. The sea lies to its right. */
  shore?: [[number, number], [number, number]];
}

type V = [number, number, number];

const cross = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: V): V => {
  const l = Math.hypot(...a);
  return [a[0] / l, a[1] / l, a[2] / l];
};
/** Two directions across a face that looks along `n`. */
function across(n: V): [V, V] {
  const z = unit(n);
  const u = unit(cross(Math.abs(z[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0], z));
  return [u, cross(z, u)];
}
/** A point on a circle round `c`, facing `n`, at angle t. */
function on(c: V, r: number, t: number, n: V = [0, 0, 1]): V {
  const [u, v] = across(n);
  return [0, 1, 2].map((j) => c[j] + r * (Math.cos(t) * u[j] + Math.sin(t) * v[j])) as V;
}
/** A circle round `c`, facing `n`, in `k` segments. */
function circle(c: V, r: number, n: V = [0, 0, 1], k = 24) {
  const out: number[] = [];
  for (let i = 0; i < k; i++)
    out.push(...on(c, r, (i / k) * 2 * Math.PI, n), ...on(c, r, ((i + 1) / k) * 2 * Math.PI, n));
  return out;
}
/** A line through points, as segments. */
function path(pts: V[]) {
  return pts.slice(1).flatMap((q, i) => [...pts[i], ...q]);
}
/** A box's twelve edges, `w` along x, `d` along y and `h` tall, its base centered at x, y, z. */
function box(x: number, y: number, w: number, d: number, h: number, z = 0) {
  const [x0, x1, y0, y1] = [x - w / 2, x + w / 2, y - d / 2, y + d / 2];
  const out: number[] = [];
  for (const zz of [z, z + h])
    out.push(x0, y0, zz, x1, y0, zz, x1, y0, zz, x1, y1, zz, x1, y1, zz, x0, y1, zz, x0, y1, zz, x0, y0, zz);
  for (const [cx, cy] of [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ])
    out.push(cx, cy, z, cx, cy, z + h);
  return out;
}
/** A rectangle flat at height z, `w` along x and `d` along y, from its corner at x, y. */
const panel = (x: number, y: number, w: number, d: number, z = 0) =>
  path([
    [x, y, z],
    [x + w, y, z],
    [x + w, y + d, z],
    [x, y + d, z],
    [x, y, z],
  ]);
/** A square flat on the ground, centered at x, y. */
const square = (x: number, y: number, s: number, z = 0) => panel(x - s / 2, y - s / 2, s, s, z);
/** A mast: a line up from the ground. */
const stack = (x: number, y: number, h: number, z = 0) => [x, y, z, x, y, z + h];
/** A tube along x, from x0 to x1, round y, z: its two ends and four sides. */
function tube(x0: number, x1: number, y: number, z: number, r: number) {
  const out = [...circle([x0, y, z], r, [1, 0, 0], 16), ...circle([x1, y, z], r, [1, 0, 0], 16)];
  for (let k = 0; k < 4; k++) {
    const t = (k * Math.PI) / 2;
    out.push(x0, y + r * Math.cos(t), z + r * Math.sin(t), x1, y + r * Math.cos(t), z + r * Math.sin(t));
  }
  return out;
}
/** An arc over a place, from the ground on one side to the other, `h` high at its middle. */
function arc(c: V, r: number, az: number, h = r, k = 24) {
  const pts: V[] = [];
  for (let i = 0; i <= k; i++) {
    const t = (i / k) * Math.PI;
    pts.push([c[0] + r * Math.cos(t) * Math.cos(az), c[1] + r * Math.cos(t) * Math.sin(az), c[2] + h * Math.sin(t)]);
  }
  return path(pts);
}
/** The sky over a place: its horizon, rings at 30° and 60°, and three arcs over the top. */
function hemisphere(c: V, r: number) {
  const out: number[] = [];
  for (const el of [0, 30, 60]) {
    const e = (el * Math.PI) / 180;
    out.push(...circle([c[0], c[1], c[2] + r * Math.sin(e)], r * Math.cos(e), [0, 0, 1], 48));
  }
  for (let k = 0; k < 3; k++) out.push(...arc(c, r, (k * Math.PI) / 3));
  return out;
}
/** A regular hexagon flat at height z. */
function hexagon(x: number, y: number, z: number, r: number) {
  const pts: V[] = [];
  for (let k = 0; k <= 6; k++) pts.push([x + r * Math.cos((k * Math.PI) / 3), y + r * Math.sin((k * Math.PI) / 3), z]);
  return path(pts);
}
/** The same numbers every time, for a scatter. */
function seeded(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** A build as it goes up: its lines in order, and lights that come on as the lines before them are drawn. */
class Rising {
  build: number[] = [];
  lights: number[] = [];
  add(...pts: number[][]) {
    for (const p of pts) this.build.push(...p);
    return this;
  }
  /** Lights that come on once everything drawn so far is. */
  lit(...pts: V[]) {
    for (const [x, y, z] of pts) this.lights.push(x, y, z, 0, this.build.length / 6);
    return this;
  }
  /** Each light's size, and its turn as a share of the whole build. */
  done(size: number) {
    const n = this.build.length / 6;
    for (let i = 0; i < this.lights.length; i += 5) {
      this.lights[i + 3] = size;
      this.lights[i + 4] /= n;
    }
    return { build: this.build, lights: this.lights };
  }
}

// ── Thought Fields ──
// Hyperion, Meta's campus at Holly Ridge in Richland Parish: 11 data centers planned on about 13.6 km², fed by three
// gas plants Entergy is building. Its first plan was 4 million sq ft in nine buildings, about 41,000 m² each, so each
// is drawn as a hall 370 by 110 m and 20 m tall. The layout is ours: no plan has been published. Our new campus is its
// twin, beside it to the east, tapping the same power lines.
const HALL = { w: 0.37, d: 0.11, h: 0.02 };

/** Eleven halls in rows of four, four and three, from the middle of the campus, in the order they go up. */
const halls = (cx: number, cy: number) =>
  Array.from({ length: 11 }, (_, i) => {
    const row = Math.floor(i / 4);
    return [cx + ((i % 4) - (row < 2 ? 1.5 : 1)) * 0.55, cy + (1 - row) * 0.36] as const;
  });

function thoughtFields(): Close {
  const have: number[] = [];
  const haveLights: number[] = [];
  for (const [x, y] of halls(-1.4, 0)) {
    have.push(...box(x, y, HALL.w, HALL.d, HALL.h));
    for (let k = 0; k < 8; k++) haveLights.push(x - HALL.w / 2 + 0.03 + k * 0.044, y, HALL.h + 0.002, 0.012);
  }
  // Three gas plants south of Hyperion, each a turbine hall and two stacks, and the substation between.
  for (const x of [-2.1, -1.4, -0.7])
    have.push(...box(x, -1.5, 0.16, 0.07, 0.03), ...stack(x - 0.05, -1.45, 0.06), ...stack(x + 0.05, -1.45, 0.06));
  have.push(...box(-0.2, -0.75, 0.22, 0.15, 0.008));
  // Two power lines north and south through the land, pylons 350 m apart, their wires slung between.
  for (const x of [-0.05, 0.05]) {
    for (let y = -9.8; y <= 9.8; y += 0.35) have.push(...stack(x, y, 0.05));
    have.push(x, -9.8, 0.05, x, 9.8, 0.05);
  }
  // Its own substation on the power lines first, then the halls one by one, each lit once its last line is drawn,
  // the chillers on its roof in two rows of twelve.
  const b = new Rising().add(box(0.35, -0.55, 0.2, 0.14, 0.008));
  for (const [x, y] of halls(1.4, 0.2)) {
    b.add(box(x, y, HALL.w, HALL.d, HALL.h));
    for (const row of [-0.025, 0.025])
      for (let k = 0; k < 12; k++) b.lit([x - HALL.w / 2 + 0.02 + (k * (HALL.w - 0.04)) / 11, y + row, HALL.h + 0.002]);
  }
  return {
    view: { km: 5, el: 12, az: 200 },
    have,
    ...b.done(0.012),
    haveLights,
    beat: 0.9,
    towns: [
      ["Rayville", 32.4744, -91.7553, 3500],
      ["Delhi", 32.4575, -91.4931, 2800],
      ["Monroe", 32.5094, -92.1194, 60000],
    ],
  };
}

// ── All-Sky Watch ──
// At Green Bank, beside the Green Bank Telescope: a dish 100 by 110 m, its top 148 m up, its arm reaching over the dish
// to its receivers. Our half of the watch is 640,000 small antennas in 100 stations of 6,400, each 25 m square, about
// ten to the square meter. The stations and their spacing are ours.
function allSkyWatch(): Close {
  const dish: V = [0, 0.01, 0.1];
  const facing: V = [0, -0.6, 0.8];
  const back: V = [dish[0] - 0.012 * facing[0], dish[1] - 0.012 * facing[1], dish[2] - 0.012 * facing[2]];
  const focus: V = [0, dish[1] + 0.06 * facing[1] - 0.03, dish[2] + 0.06 * facing[2] - 0.01];
  const have = [
    ...box(0, 0, 0.07, 0.035, 0.07),
    ...circle(dish, 0.052, facing, 40),
    ...path([on(dish, 0.052, -Math.PI / 2, facing), [0, -0.04, 0.12], focus]),
    ...box(focus[0], focus[1], 0.008, 0.008, 0.006, focus[2] - 0.003),
  ];
  for (let k = 0; k < 4; k++) have.push(...on(dish, 0.052, (k * Math.PI) / 2, facing), ...back);

  const [fx, fy] = [0.75, 0.15];
  const b = new Rising().add(box(fx, fy - 0.36, 0.04, 0.02, 0.006));
  for (let i = 0; i < 100; i++) {
    const [x, y] = [fx + ((i % 10) - 4.5) * 0.055, fy + (4.5 - Math.floor(i / 10)) * 0.055];
    b.add(square(x, y, 0.025));
    for (let k = 0; k < 16; k++) b.lit([x - 0.009 + (k % 4) * 0.006, y - 0.009 + Math.floor(k / 4) * 0.006, 0.0015]);
  }
  return {
    view: { km: 1.7, el: 12, az: 205, at: [0.4, 0.1] },
    have,
    ...b.done(0.003),
    haveLights: [...focus, 0.004, 0, 0, 0.148, 0.004],
    sky: hemisphere([fx, fy, 0], 0.7),
    towns: [
      ["Marlinton", 38.2233, -80.0933, 1000],
      ["Elkins", 38.9256, -79.8469, 7000],
    ],
  };
}

// ── Deep Flash Watch ──
// On Palomar Mountain, by the Hale Telescope's dome, 41.8 m across. PANOSETI's domes are geodesic, 4.988 m across and
// 1.827 m high, each with 45 telescopes of 0.48 m, two of them 1 km apart. A laser knock lands on both at once, or it
// was a flash in our own air. Their places on the mountain are ours.
function deepFlashWatch(): Close {
  const r = 0.0209;
  const have = [...circle([0, 0, 0], r, [0, 0, 1], 32), ...circle([0, 0, 0.016], r, [0, 0, 1], 32)];
  for (let k = 0; k < 8; k++) {
    const t = (k * Math.PI) / 4;
    have.push(r * Math.cos(t), r * Math.sin(t), 0, r * Math.cos(t), r * Math.sin(t), 0.016);
  }
  for (let k = 0; k < 3; k++) have.push(...arc([0, 0, 0.016], r, (k * Math.PI) / 3, r, 16));

  const domes: V[] = [
    [-0.5, -0.4, 0],
    [0.5, -0.4, 0],
  ];
  const b = new Rising();
  for (const at of domes) {
    const [x, y] = at;
    b.add(square(x, y, 0.012), box(x + 0.006, y - 0.006, 0.004, 0.003, 0.0025), circle(at, 0.0025, [0, 0, 1], 18));
    for (let k = 0; k < 3; k++) b.add(arc(at, 0.0025, (k * Math.PI) / 3, 0.0018, 10));
    // Its 45 telescopes, on three rings up the dome.
    for (const [n, s, z] of [
      [24, 0.0021, 0.0009],
      [15, 0.0014, 0.0014],
      [6, 0.0006, 0.0017],
    ])
      for (let k = 0; k < n; k++) {
        const t = (k / n) * 2 * Math.PI;
        b.lit([x + s * Math.cos(t), y + s * Math.sin(t), z]);
      }
  }
  // The line between them, which times each flash.
  b.add([domes[0][0], domes[0][1], 0.0005, domes[1][0], domes[1][1], 0.0005]);
  const star = unit([0.25, 0.35, 0.9]);
  return {
    view: { km: 0.05, el: 9, az: 262, at: [-0.5, -0.4] },
    have,
    ...b.done(0.0012),
    haveLights: [0, 0, 0.03, 0.006],
    sky: [...hemisphere(domes[0], 0.3), ...hemisphere(domes[1], 0.3)],
    runs: domes.map(([x, y]) => ({
      pts: [x + 3 * star[0], y + 3 * star[1], 3 * star[2], x, y, 0.002],
      secs: 4,
      lands: true,
    })),
    towns: [
      ["Temecula", 33.4936, -117.1484, 110000],
      ["Escondido", 33.1192, -117.0864, 150000],
      ["Valley Center", 33.2184, -117.0342, 26000],
    ],
  };
}

// ── Launch Complex ──
// At Kourou, by Ariane 5's old pad, ELA-3, and Ariane 6's, ELA-4, at their real places. Our four new pads for heavy
// reusable lift stand in a line 1.8 km in from the sea, 1.2 km apart, each with its tower, mount, tanks and a ring
// for boosters coming home. The shore is drawn straight, from Kourou's beach toward Sinnamary, 3 km out to sea of
// both: our reading. Rockets climb east, over open sea.
function launchComplex(): Close {
  const have: number[] = [];
  const pad = (x: number, y: number, s: number, h: number) => {
    have.push(...square(x, y, s));
    for (const [dx, dy] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ])
      have.push(...stack(x + (dx * s) / 2.4, y + (dy * s) / 2.4, h));
  };
  pad(0.11, 0.33, 0.12, 0.08);
  have.push(...box(0.11, 0.33, 0.02, 0.02, 0.01));
  pad(-2.0, 2.21, 0.15, 0.1);
  have.push(...box(-1.95, 2.21, 0.03, 0.02, 0.09));

  // Along the shore, and out to sea.
  const [along, out] = [unit([-0.816, 0.578, 0]), unit([0.578, 0.816, 0])];
  const pads = [0, 1, 2, 3].map((k): [number, number] => [
    0.11 + 1.8 * out[0] + (k * 1.2 - 0.6) * along[0],
    0.33 + 1.8 * out[1] + (k * 1.2 - 0.6) * along[1],
  ]);
  const b = new Rising();
  for (const [x, y] of pads) {
    const [lx, ly] = [x + 0.6 * out[0], y + 0.6 * out[1]];
    const [tx, ty] = [x - 0.15 * out[0], y - 0.15 * out[1]];
    b.add(
      square(x, y, 0.12),
      circle([x, y, 0.01], 0.012),
      box(x - 0.025, y, 0.012, 0.012, 0.145),
      circle([lx, ly, 0], 0.03, [0, 0, 1], 32),
      circle([tx - 0.02, ty, 0], 0.008),
      circle([tx, ty, 0], 0.008),
      circle([tx + 0.02, ty, 0], 0.008),
    );
    b.lit(...[0.03, 0.06, 0.09, 0.12, 0.145].map((z): V => [x - 0.025, y, z]));
    for (let k = 0; k < 8; k++)
      b.lit([lx + 0.03 * Math.cos((k * Math.PI) / 4), ly + 0.03 * Math.sin((k * Math.PI) / 4), 0.001]);
  }
  // Up and east over the sea, leveling out 60 km up.
  const climbs = pads.map(([x, y]): V[] => [
    [x, y, 0.15],
    [x, y, 2],
    [x + 2.5, y + 0.6, 7],
    [x + 10, y + 2.3, 22],
    [x + 30, y + 7, 55],
  ]);
  return {
    view: { km: 3.6, el: 9, az: 225, at: [0, 1.6] },
    have,
    ...b.done(0.004),
    haveLights: [0.11, 0.33, 0.012, 0.006, -1.95, 2.21, 0.09, 0.006],
    sky: climbs.flatMap(path),
    runs: climbs.map((pts, k) => ({ pts: pts.flat(), secs: 16, offset: k * 0.25 })),
    towns: [
      ["Kourou", 5.159, -52.65, 26000],
      ["Sinnamary", 5.377, -52.957, 3000],
      ["Cayenne", 4.922, -52.313, 60000],
    ],
    shore: [
      [5.181, -52.634],
      [5.399, -52.941],
    ],
  };
}

// ── Orbital Yard ──
// A kiloton in orbit, a little over twice the ISS, which is 109 m by 73 m: drawn as a truss 200 m long with arms,
// solar wings and a hull being joined below it. Spent stages drift near, the spare metal it works from. The shape is
// ours.
function orbitalYard(): Close {
  const s = 0.006;
  const corners: [number, number][] = [
    [-s, -s],
    [s, -s],
    [s, s],
    [-s, s],
  ];
  const b = new Rising();
  for (const [y, z] of corners) b.add([-0.1, y, z, 0.1, y, z]);
  for (let i = 0; i <= 10; i++) {
    const x = -0.1 + i * 0.02;
    b.add(path([...corners, corners[0]].map(([y, z]): V => [x, y, z])));
    // One brace across each face of the bay, corner to the next corner on.
    if (i < 10) for (const [y, z] of corners) b.add([x, y, z, x + 0.02, -z, y]);
    b.lit([x, s, s], [x, -s, s]);
  }
  for (const side of [-1, 1]) {
    b.add([0, side * s, 0, 0, side * 0.075, 0]);
    for (const y0 of [0.012, 0.045]) b.add(panel(-0.015, side > 0 ? y0 : -y0 - 0.028, 0.03, 0.028));
  }
  for (const x of [-0.04, 0.04])
    b.add(
      path([
        [x, 0, -s],
        [x + 0.01, 0.004, -0.02],
        [x - 0.005, 0.002, -0.03],
      ]),
    );
  b.add(tube(-0.06, 0.03, 0, -0.03, 0.012));
  for (let x = -0.045; x < 0.03; x += 0.015) b.add(circle([x, 0, -0.03], 0.012, [1, 0, 0], 16));
  b.lit([-0.06, 0, -0.03], [0.03, 0, -0.03], [-0.015, 0.012, -0.03], [-0.015, -0.012, -0.03]);
  return {
    view: { km: 0.4, el: 12, az: 200 },
    have: [...tube(0.28, 0.32, -0.13, 0.02, 0.0045), ...tube(-0.35, -0.315, 0.16, -0.03, 0.004)],
    ...b.done(0.0015),
    haveLights: [0.3, -0.13, 0.025, 0.002],
    runs: [{ pts: [0.28, -0.13, 0.02, 0.1, -0.01, 0], secs: 12 }],
  };
}

// ── Infrared Telescope ──
// Webb's shade is 21 by 14 m in five layers, its mirror 6.5 m in 18 segments. Ours is drawn larger, a shade 30 by 20 m
// and an 8 m mirror of 18 segments, as built in orbit: our scale-up. The shade lies under it, toward the Sun, and the
// mirror looks out into the dark.
function infraredTelescope(): Close {
  const b = new Rising();
  for (let k = 0; k < 5; k++) {
    const [w, d, z] = [0.015 * (1 - 0.04 * k), 0.01 * (1 - 0.04 * k), 0.0006 * k];
    b.add(
      path([
        [w, 0, z],
        [w / 2, d, z],
        [-w / 2, d, z],
        [-w, 0, z],
        [-w / 2, -d, z],
        [w / 2, -d, z],
        [w, 0, z],
      ]),
    );
  }
  b.add(box(0, 0, 0.004, 0.004, 0.0015, -0.0018), [0, 0, 0.0024, 0, 0.004, 0.009]);
  // Two rings of segments round an open middle, as Webb's are, walked side by side round each ring.
  const R = 0.00092;
  const [mx, my, mz] = [0, 0.004, 0.009];
  const step = Math.sqrt(3) * R;
  for (let ring = 1; ring <= 2; ring++)
    for (let k = 0; k < 6 * ring; k++) {
      const a = (Math.floor(k / ring) * Math.PI) / 3 + Math.PI / 6;
      const t = k % ring;
      const [x, y] = [
        ring * Math.cos(a) + t * Math.cos(a + (2 * Math.PI) / 3),
        ring * Math.sin(a) + t * Math.sin(a + (2 * Math.PI) / 3),
      ];
      b.add(hexagon(mx + step * x, my + step * y, mz, R * 0.97));
    }
  const top: V = [mx, my, mz + 0.0075];
  b.add(hexagon(top[0], top[1], top[2], 0.0004));
  for (let k = 0; k < 3; k++) {
    const a = (k * 2 * Math.PI) / 3;
    b.add([mx + 0.0042 * Math.cos(a), my + 0.0042 * Math.sin(a), mz, ...top]);
  }
  b.lit(top, [mx, my, mz - 0.0008]);
  return {
    view: { km: 0.075, el: 18, az: 210, at: [0, 0.002, 0.005] },
    have: [],
    ...b.done(0.0004),
    haveLights: [],
    runs: [{ pts: [-0.03, 0.06, 0.12, mx, my, mz, ...top], secs: 3, lands: true }],
  };
}

// ── Moon Vault ──
// The Mare Tranquillitatis pit: a funnel 140 to 146 m across and about 20 m deep, then a pit 88 to 100 m across and
// about 105 m deep. Radar shows a cave running west from its floor, at least 45 m wide and tens of meters long. Our
// vault sits in it: four modules, a lift down the wall, a solar field and a dish home. Earth stands about 56° up in
// the west-southwest, our reckoning from where the pit is. Craters round it are ours.
function moonVault(): Close {
  const have = [
    ...circle([0, 0, 0], 0.072, [0, 0, 1], 48),
    ...circle([0, 0, -0.02], 0.047, [0, 0, 1], 40),
    ...circle([0, 0, -0.125], 0.042, [0, 0, 1], 40),
    ...box(-0.081, 0, 0.078, 0.045, 0.04, -0.17),
  ];
  for (let k = 0; k < 16; k++) {
    const [c, s] = [Math.cos((k / 16) * 2 * Math.PI), Math.sin((k / 16) * 2 * Math.PI)];
    have.push(0.072 * c, 0.072 * s, 0, 0.047 * c, 0.047 * s, -0.02);
    have.push(0.047 * c, 0.047 * s, -0.02, 0.042 * c, 0.042 * s, -0.125);
  }
  const rnd = seeded(1969);
  for (let k = 0; k < 7; k++)
    have.push(...circle([(rnd() - 0.5) * 0.05, (rnd() - 0.5) * 0.05, -0.124], 0.003 + rnd() * 0.005, [0, 0, 1], 10));
  for (let k = 0; k < 14; k++) {
    const [a, d] = [rnd() * 2 * Math.PI, 0.25 + rnd() * 1.3];
    have.push(...circle([d * Math.cos(a), d * Math.sin(a), 0], 0.01 + rnd() * 0.12, [0, 0, 1], 32));
  }

  const home = unit([-0.551, -0.097, 0.829]);
  const dish: V = [0.09, 0.06, 0.008];
  const b = new Rising();
  b.add(box(-0.04, 0, 0.006, 0.006, 0.135, -0.125), [-0.04, 0, 0.01, -0.06, 0, 0.012]);
  b.lit([-0.04, 0, 0.005], [-0.04, 0, -0.06], [-0.04, 0, -0.12]);
  b.add(
    path([
      [0.15, 0, 0.001],
      [0.08, 0, 0.001],
      [-0.037, 0, 0.001],
    ]),
  );
  for (const [x, y] of [
    [-0.075, -0.01],
    [-0.075, 0.01],
    [-0.102, -0.01],
    [-0.102, 0.01],
  ]) {
    b.add(tube(x - 0.012, x + 0.012, y, -0.164, 0.006));
    b.lit([x - 0.006, y, -0.158], [x + 0.006, y, -0.158]);
  }
  for (let i = 0; i < 12; i++)
    b.add(panel(0.16 + (i % 4) * 0.025, -0.03 + Math.floor(i / 4) * 0.03, 0.02, 0.012, 0.002));
  b.add(circle(dish, 0.004, home, 16), [dish[0], dish[1], 0, ...dish]);
  b.lit(dish);
  return {
    view: { km: 0.5, el: 11, az: 95, at: [-0.03, 0] },
    have,
    ...b.done(0.0025),
    haveLights: [],
    beat: 1.28,
    runs: [{ pts: [...dish, dish[0] + 3 * home[0], dish[1] + 3 * home[1], dish[2] + 3 * home[2]], secs: 1.28 }],
  };
}

// ── Laser Sail Array ──
// Starshot's plan: a phased array of lasers about a square kilometer, up to 100 GW, high and dry. Ours stands on the
// Chajnantor plateau, 5 km east of ALMA's 66 dishes, drawn in a compact cluster round its real middle. The array's
// 400 tiles of 50 m and its hall are ours. Its light converges on a sail far above.
function laserSailArray(): Close {
  const have: number[] = [];
  const rnd = seeded(2016);
  const [ax, ay] = [-5.45, 1.18];
  for (let k = 0; k < 66; k++) {
    const [a, d] = [rnd() * 2 * Math.PI, 0.5 * Math.sqrt(rnd())];
    const [x, y] = [ax + d * Math.cos(a), ay + d * Math.sin(a)];
    const r = k < 54 ? 0.006 : 0.0035;
    have.push(...stack(x, y, 0.008), ...circle([x, y, 0.008 + r], r, [rnd() - 0.5, rnd() - 0.5, 1], 12));
  }
  const b = new Rising().add(box(0, -0.65, 0.08, 0.03, 0.008));
  for (let i = 0; i < 400; i++) {
    const [x, y] = [((i % 20) - 9.5) * 0.05, (9.5 - Math.floor(i / 20)) * 0.05];
    b.add(square(x, y, 0.045));
    b.lit([x, y, 0.002]);
  }
  const sky: number[] = [];
  for (let k = 0; k < 8; k++) {
    const t = (k * Math.PI) / 4;
    sky.push(0.5 * Math.cos(t), 0.5 * Math.sin(t), 0, 0, 0, 40);
  }
  return {
    view: { km: 3, el: 13, az: 215 },
    have,
    ...b.done(0.006),
    haveLights: [ax, ay, 0.01, 0.01],
    sky,
    runs: [0, 1 / 3, 2 / 3].map((offset) => ({ pts: [0, 0, 0.01, 0, 0, 60], secs: 2.5, offset })),
    towns: [
      ["San Pedro de Atacama", -22.911, -68.2, 5000],
      ["Toconao", -23.19, -68.01, 900],
    ],
  };
}

// ── Probe Yard ──
// Daedalus, the flyby probe it follows, was 190 m long and 54,000 t fueled, in two stages of fusion engines: drawn
// here in a dock 240 m long, the first stage's tanks and engine, then the second and its payload. Spent stages drift
// near. The dock and tanks are ours.
function probeYard(): Close {
  const b = new Rising().add(box(0, 0, 0.24, 0.06, 0.06, -0.03));
  b.lit([-0.12, -0.03, 0.03], [0.12, -0.03, 0.03], [-0.12, 0.03, 0.03], [0.12, 0.03, 0.03]);
  b.add(circle([-0.11, 0, 0], 0.025, [1, 0, 0], 24), circle([-0.07, 0, 0], 0.007, [1, 0, 0], 12));
  for (let k = 0; k < 8; k++) {
    const t = (k * Math.PI) / 4;
    b.add([-0.11, 0.025 * Math.cos(t), 0.025 * Math.sin(t), -0.07, 0.007 * Math.cos(t), 0.007 * Math.sin(t)]);
  }
  b.add([-0.07, 0, 0, 0.1, 0, 0]);
  for (const [y, z] of [
    [0.016, 0.016],
    [-0.016, 0.016],
    [0.016, -0.016],
    [-0.016, -0.016],
  ])
    b.add(circle([-0.035, y, z], 0.014, [1, 0, 0], 20), circle([-0.035, y, z], 0.014, [0, 1, 0], 20));
  b.lit([-0.035, 0, 0.03]);
  for (const y of [0.009, -0.009])
    b.add(circle([0.04, y, 0], 0.008, [1, 0, 0], 16), circle([0.04, y, 0], 0.008, [0, 1, 0], 16));
  b.add(circle([0.1, 0, 0], 0.012, [1, 0, 0], 20));
  b.lit([0.1, 0, 0.012]);
  return {
    view: { km: 0.62, el: 13, az: 210 },
    have: [...tube(-0.3, -0.26, 0.15, 0.03, 0.0045), ...tube(0.25, 0.29, -0.16, -0.02, 0.004)],
    ...b.done(0.0018),
    haveLights: [-0.28, 0.15, 0.035, 0.002],
    runs: [{ pts: [-0.26, 0.15, 0.03, -0.12, 0.03, 0], secs: 12 }],
  };
}

/** Each build with a close view, by name. */
export const CLOSE: Record<string, Close> = {
  "Thought Fields": thoughtFields(),
  "All-Sky Watch": allSkyWatch(),
  "Deep Flash Watch": deepFlashWatch(),
  "Launch Complex": launchComplex(),
  "Orbital Yard": orbitalYard(),
  "Infrared Telescope": infraredTelescope(),
  "Moon Vault": moonVault(),
  "Laser Sail Array": laserSailArray(),
  "Probe Yard": probeYard(),
};
