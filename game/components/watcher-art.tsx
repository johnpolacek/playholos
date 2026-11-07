import { useMemo, useRef } from "react";
import { useTicks } from "@/components/lead-art";
import { CO_ORBITALS, MOON_SEARCH_YEARS } from "@/lib/sim/minds";

// The watcher, found and seen, drawn as we came to see it. 2026-11-07: the find was a dot on a dotted circle, "Something
// has been watching us" said in text, and nothing to look at.

const W = 320;
const H = 220;

/** A small seeded random, so each drawing is the same each time it opens. */
function rand(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1e6) / 1e6;
  };
}

/** The six rocks that share Earth's orbit, as we know them in 2026: about how wide, and the path each traces as seen
 *  from Earth going round the Sun with it. Four loop round Earth all year, as quasi-moons do. 2002 AA29 and Cruithne
 *  swing along our orbit in a horseshoe, ahead of us and back. Kamoʻoalewa about 20 m, from Tianwen-2's first close
 *  image, July 2026. The rest from their brightness, at a rock's usual darkness. */
export const ROCKS: Record<
  string,
  { size: string; path: "loop" | "horseshoe" }
> = {
  Kamoʻoalewa: { size: "about 20 m", path: "loop" },
  "2023 FW13": { size: "about 15 m", path: "loop" },
  "2002 AA29": { size: "about 60 m", path: "horseshoe" },
  "2004 GU9": { size: "about 250 m", path: "loop" },
  "2006 FV35": { size: "about 200 m", path: "loop" },
  Cruithne: { size: "about 5 km", path: "horseshoe" },
};

// ── The Moon Search's find ──
// How a deep search finds something too faint for any one picture: it takes thousands, each following the Moon's L4 or
// L5 point as it crosses the sky, and adds them up. The stars drift through each frame, so they smear into fading
// trails. The grain of the sky averages away. Anything holding at the point lands on the same spot every frame, and
// rises out of the grain. A dark 10 cm body there, 384,000 km off, shines at about magnitude 28, as the search reaches.

const SW = 160;
const SH = 96;
/** Frames stacked over the search, and the share of its loop spent stacking, then holding on the find. */
const FRAMES = 4000;
const LOOP = 14;
const STACKING = 10;

export function MoonStack({ L }: { L: "L4" | "L5" }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const year = useRef<HTMLSpanElement>(null);
  const found = useRef<SVGGElement>(null);
  // Stars in the field: where each sits on the first frame, and how bright. They drift right to left as the frames
  // follow the point.
  const stars = useMemo(() => {
    const r = rand(7);
    return Array.from({ length: 9 }, () => ({
      x: r() * SW * 1.6,
      y: 4 + r() * (SH - 8),
      // Faint field stars, as a stack this deep holds: bright ones would drown the find in their trails.
      f: 4 + r() * 16,
    }));
  }, []);
  const img = useRef<ImageData | null>(null);
  const last = useRef(-1);

  const draw = (t: number) => {
    const c = canvas.current?.getContext("2d");
    if (!c) return;
    const s = t % LOOP;
    // Stacked frames grow fast at first and slow later, as the grain shrinks only with their square root.
    const n = Math.max(1, Math.round(FRAMES ** Math.min(1, s / STACKING)));
    if (n === last.current && s < STACKING) return;
    last.current = n;
    const data = (img.current ??= c.createImageData(SW, SH));
    const px = data.data;
    const r = rand(1 + Math.floor(t * 12));
    // Shown in steps of the grain, as a stack is stretched to read: the grain stays, what is real rises.
    const root = Math.sqrt(n);
    const sig = new Float32Array(SW * SH);
    // The find: the same spot in every frame, 0.16 of the grain in one, so ten times it in all 4,000.
    const amp = 0.16 * root;
    const [tx, ty] = [SW / 2, SH / 2];
    for (let y = -2; y <= 2; y++)
      for (let x = -2; x <= 2; x++)
        sig[(ty + y) * SW + tx + x] += amp * Math.exp(-(x * x + y * y) / 1.4);
    // Each star smears along its drift: a trail as long as the frames carried it, its light shared along it.
    const drift = 0.06;
    for (const st of stars) {
      const len = Math.max(1, Math.min(SW * 1.6, n * drift));
      const per = (st.f * root) / len;
      for (let k = 0; k < len; k++) {
        const x = Math.round(st.x - k) % (SW * 2);
        if (x < 0 || x >= SW) continue;
        for (let dy = -1; dy <= 1; dy++) {
          const y = Math.round(st.y) + dy;
          if (y >= 0 && y < SH) sig[y * SW + x] += per * (dy === 0 ? 1 : 0.35);
        }
      }
    }
    for (let i = 0; i < SW * SH; i++) {
      // A rough bell of grain, in units of itself.
      const g = (r() + r() + r() - 1.5) * 2;
      const v = Math.max(0, Math.min(1, 0.1 + 0.055 * (g + sig[i])));
      const k = i * 4;
      px[k] = 255 * v * 0.92;
      px[k + 1] = 255 * v * 0.96;
      px[k + 2] = 255 * v;
      px[k + 3] = 255;
    }
    c.putImageData(data, 0, 0);
    if (count.current) count.current.textContent = n.toLocaleString("en-US");
    if (year.current)
      year.current.textContent = ((MOON_SEARCH_YEARS * n) / FRAMES).toFixed(1);
    found.current?.setAttribute(
      "opacity",
      s >= STACKING ? String(Math.min(1, (s - STACKING) * 2)) : "0",
    );
  };
  useTicks(draw, STACKING + 2);

  return (
    <div>
      <div className="relative">
        <canvas
          ref={canvas}
          width={SW}
          height={SH}
          className="block w-full rounded-md bg-black [image-rendering:pixelated]"
          aria-label={`Thousands of deep pictures of the Moon’s ${L} point stacked into one: the stars smear into trails, and one faint point holds still at the center`}
          role="img"
        />
        <svg
          viewBox={`0 0 ${SW} ${SH}`}
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden
        >
          {/* Where the frames follow: the point itself, marked from the first frame, as the search knows where to look. */}
          {[
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1],
          ].map(([a, b]) => (
            <path
              key={`${a}${b}`}
              d={`M${SW / 2 + a * 10},${SH / 2 + b * 6}h${-a * 3}M${SW / 2 + a * 10},${SH / 2 + b * 6}v${-b * 3}`}
              stroke="#8a8f99"
              strokeWidth={0.5}
              fill="none"
            />
          ))}
          <g ref={found} opacity={0}>
            <circle
              cx={SW / 2}
              cy={SH / 2}
              r={5.5}
              fill="none"
              stroke="var(--other)"
              strokeWidth={0.7}
            />
            <text
              x={SW / 2 + 9}
              y={SH / 2 - 7}
              className="fill-[var(--other)] font-mono text-[4.6px]"
            >
              SOMETHING HOLDING
            </text>
          </g>
          <text x={4} y={7} className="fill-[#8a8f99] font-mono text-[4.4px]">
            THE MOON’S {L}, FOLLOWED ACROSS THE SKY
          </text>
        </svg>
      </div>
      <div className="mt-1 flex justify-between font-mono text-[9.5px] tracking-[.06em] text-muted">
        <span>
          <span ref={count} className="tabular-nums">
            1
          </span>{" "}
          FRAMES STACKED
        </span>
        <span>
          YEAR{" "}
          <span ref={year} className="tabular-nums">
            0.0
          </span>{" "}
          OF {MOON_SEARCH_YEARS}
        </span>
      </div>
      <p className="mt-1 text-[12px] leading-snug text-page-ink2">
        No single picture shows it. Each frame follows the point, so stars drift
        through and smear to trails, and the grain of the sky averages away.
        Something holding there falls on the same spot every time, and rises.
      </p>
    </div>
  );
}

// ── The rock it rides ──
// Seen from Earth as we both go round the Sun, with Earth held still at the top. A quasi-moon loops round us once a
// Year. A horseshoe rock creeps along our orbit to just behind us, turns, and creeps back to just ahead.

export function CoOrbitArt({ rock }: { rock: string }) {
  const known = ROCKS[rock] ?? { size: "", path: "loop" as const };
  const dot = useRef<SVGCircleElement>(null);
  const [cx, cy] = [W / 2, H / 2 + 8];
  const R = 70;
  // A point at angle along our orbit from Earth, and out from it, in px.
  const at = (th: number, dr: number) =>
    [cx + (R + dr) * Math.sin(th), cy - (R + dr) * Math.cos(th)] as const;
  const loop = known.path === "loop";
  const path = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 200; i++) {
      const u = (i / 200) * 2 * Math.PI;
      const [x, y] = loop
        ? at(0.3 * Math.sin(u), 11 * Math.cos(u))
        : at(Math.PI + (Math.PI - 0.22) * Math.cos(u), 7 * Math.sin(u));
      pts.push(`${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loop]);
  useTicks((t) => {
    // A loop a Year, 6 seconds. A horseshoe takes centuries to swing: shown in 16.
    const u = loop ? -(t / 6) * 2 * Math.PI : (t / 16) * 2 * Math.PI;
    const [x, y] = loop
      ? at(0.3 * Math.sin(u), 11 * Math.cos(u))
      : at(Math.PI + (Math.PI - 0.22) * Math.cos(u), 7 * Math.sin(u));
    dot.current?.setAttribute("cx", String(x));
    dot.current?.setAttribute("cy", String(y));
  }, 1.2);
  const [ex, ey] = at(0, 0);
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label={`${rock}, ${loop ? "looping round Earth as we both go round the Sun" : "swinging along Earth’s orbit, ahead of us and back"}`}
    >
      <circle
        cx={cx}
        cy={cy}
        r={R}
        fill="none"
        stroke="var(--muted)"
        strokeWidth={0.6}
        strokeDasharray="1 3"
      />
      <circle cx={cx} cy={cy} r={7} fill="#f4e9c8" opacity={0.9} />
      <text
        x={cx}
        y={cy + 18}
        textAnchor="middle"
        className="fill-muted font-mono text-[7px]"
      >
        SUN
      </text>
      <path
        d={path}
        fill="none"
        stroke="var(--other)"
        strokeWidth={0.7}
        opacity={0.55}
      />
      <circle cx={ex} cy={ey} r={4.5} fill="var(--you)" />
      <text
        x={ex}
        y={ey - 9}
        textAnchor="middle"
        className="fill-muted font-mono text-[7px]"
      >
        EARTH
      </text>
      <circle ref={dot} cx={ex} cy={ey} r={2.4} fill="var(--other)" />
      <text x={16} y={H - 22} className="fill-muted font-mono text-[7px]">
        {rock.toUpperCase()}, {known.size.toUpperCase()} ACROSS
      </text>
      <text x={16} y={H - 12} className="fill-muted font-mono text-[7px]">
        {loop
          ? "LOOPS ROUND US ONCE A YEAR AS WE BOTH ROUND THE SUN"
          : "SWINGS ALONG OUR ORBIT, AHEAD OF US AND BACK, OVER CENTURIES"}
      </text>
    </svg>
  );
}

// ── The Asteroid Tour's find ──
// Our probe maps the rock's whole surface patch by patch, to centimeters. Rock and boulders, patch after patch, until
// one patch holds something smooth and dark that is not of the rock.

const TW = 160;
const TH = 100;
const COLS = 10;
const ROWS = 6;

export function TourMap({ rock }: { rock: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const label = useRef<SVGTextElement>(null);
  const find = useRef<SVGGElement>(null);
  // The rock's outline, a lumpy round, and its boulders, the same each time it opens.
  const shape = useMemo(() => {
    // Seeded by its name, so each rock has its own shape.
    const r = rand([...rock].reduce((h, ch) => h * 31 + ch.charCodeAt(0), 7));
    const k = Array.from(
      { length: 5 },
      () => [r() * 0.12, r() * 6.28] as const,
    );
    const pts: string[] = [];
    for (let i = 0; i <= 72; i++) {
      const a = (i / 72) * 2 * Math.PI;
      const rr =
        1 + k.reduce((s, [m, p], j) => s + m * Math.sin((j + 2) * a + p), 0);
      pts.push(
        `${i ? "L" : "M"}${(TW / 2 + 58 * rr * Math.cos(a)).toFixed(1)},${(TH / 2 + 36 * rr * Math.sin(a)).toFixed(1)}`,
      );
    }
    const stones = Array.from({ length: 70 }, () => ({
      x: TW / 2 + (r() - 0.5) * 100,
      y: TH / 2 + (r() - 0.5) * 58,
      r: 0.6 + r() * r() * 3.2,
      l: 0.35 + r() * 0.4,
    }));
    const pits = Array.from({ length: 6 }, () => ({
      x: TW / 2 + (r() - 0.5) * 80,
      y: TH / 2 + (r() - 0.5) * 44,
      r: 3 + r() * 6,
    }));
    // The patch it lies in, mapped last, as the tour came to it.
    return { d: pts.join("") + "Z", stones, pits, at: { c: 7, r: 3 } };
  }, [rock]);
  // Back and forth, row by row, as a probe maps.
  const order = useMemo(() => {
    const all: [number, number][] = [];
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) all.push([r % 2 ? COLS - 1 - c : c, r]);
    return all;
  }, []);
  useTicks((t) => {
    const s = t % 12;
    // The patches fill row by row over 8 seconds, the find's patch last of all, then it holds.
    const done = Math.min(order.length, Math.floor((s / 8) * order.length));
    const mask = svg.current?.querySelectorAll<SVGRectElement>("[data-patch]");
    mask?.forEach((el) => {
      const i = Number(el.dataset.patch);
      el.setAttribute("opacity", i < done ? "0" : "1");
    });
    find.current?.setAttribute(
      "opacity",
      s >= 8 ? String(Math.min(1, (s - 8) * 2)) : "0",
    );
    if (label.current)
      label.current.textContent = `${Math.round((done / order.length) * 100)}% MAPPED`;
  }, 11);
  // Its patch moves to the end of the order.
  const seq = useMemo(() => {
    const rest = order.filter(
      ([c, r]) => !(c === shape.at.c && r === shape.at.r),
    );
    return [...rest, [shape.at.c, shape.at.r] as [number, number]];
  }, [order, shape]);
  const pw = TW / COLS,
    ph = TH / ROWS;
  const [fx, fy] = [shape.at.c * pw + pw / 2, shape.at.r * ph + ph / 2];
  const n = CO_ORBITALS.indexOf(rock);
  return (
    <div>
      <svg
        ref={svg}
        viewBox={`0 0 ${TW} ${TH}`}
        className="block w-full rounded-md bg-black"
        role="img"
        aria-label={`Our probe mapping ${rock} patch by patch, until one patch shows something smooth and dark that isn’t rock`}
      >
        <defs>
          <clipPath id="rock-clip">
            <path d={shape.d} />
          </clipPath>
          <radialGradient id="rock-light" cx="35%" cy="30%" r="80%">
            <stop offset="0" stopColor="#8d8378" />
            <stop offset="1" stopColor="#2b2723" />
          </radialGradient>
        </defs>
        <path d={shape.d} fill="url(#rock-light)" />
        <g clipPath="url(#rock-clip)">
          {shape.pits.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={p.r} fill="#1f1c19" opacity={0.45} />
              <circle
                cx={p.x - p.r * 0.2}
                cy={p.y - p.r * 0.2}
                r={p.r * 0.8}
                fill="none"
                stroke="#a69a8c"
                strokeWidth={0.3}
                opacity={0.5}
              />
            </g>
          ))}
          {shape.stones.map((st, i) => (
            <g key={i}>
              <ellipse
                cx={st.x + st.r * 0.4}
                cy={st.y + st.r * 0.3}
                rx={st.r}
                ry={st.r * 0.6}
                fill="#000"
                opacity={0.35}
              />
              <circle
                cx={st.x}
                cy={st.y}
                r={st.r}
                fill={`hsl(30 8% ${Math.round(st.l * 100)}%)`}
              />
            </g>
          ))}
        </g>
        {/* The find: small, smooth and near black, a glint where the rock has none. */}
        <g ref={find} opacity={0}>
          <ellipse
            cx={fx}
            cy={fy}
            rx={1.6}
            ry={1.1}
            fill="#08090b"
            stroke="#3a3f47"
            strokeWidth={0.25}
          />
          <circle cx={fx - 0.5} cy={fy - 0.4} r={0.35} fill="#e8ecf2" />
          <circle
            cx={fx}
            cy={fy}
            r={5}
            fill="none"
            stroke="var(--other)"
            strokeWidth={0.6}
          />
          <text
            x={fx - 7}
            y={fy - 6}
            textAnchor="end"
            className="fill-[var(--other)] font-mono text-[4.4px]"
          >
            NOT OF THE ROCK
          </text>
        </g>
        {/* Patches not yet mapped. */}
        {seq.map(([c, r], i) => (
          <rect
            key={`${c},${r}`}
            data-patch={i}
            x={c * pw}
            y={r * ph}
            width={pw + 0.2}
            height={ph + 0.2}
            fill="#000"
            opacity={1}
          />
        ))}
        <text x={4} y={7} className="fill-[#8a8f99] font-mono text-[4.4px]">
          {rock.toUpperCase()}, {(ROCKS[rock]?.size ?? "").toUpperCase()} ACROSS
        </text>
        <text
          ref={label}
          x={TW - 4}
          y={7}
          textAnchor="end"
          className="fill-[#8a8f99] font-mono text-[4.4px]"
        >
          0% MAPPED
        </text>
      </svg>
      <div className="mt-1.5 flex flex-wrap gap-x-2.5 gap-y-0.5 font-mono text-[9.5px] tracking-[.04em]">
        {CO_ORBITALS.map((name, i) => (
          <span
            key={name}
            className={
              i === n ? "text-other" : i < n ? "text-muted" : "text-faint"
            }
          >
            {i < n ? "✓ " : i === n ? "◉ " : "· "}
            {name}
          </span>
        ))}
      </div>
      <p className="mt-1 text-[12px] leading-snug text-page-ink2">
        Our probe maps each rock to centimeters, a patch at a time.{" "}
        {n > 0
          ? `${n === 1 ? "The first was" : `The first ${n} were`} rock and boulders and nothing else.`
          : ""}{" "}
        On {rock}, one patch held something smooth and near black, about 10 cm
        across, that the rock didn’t make.
      </p>
    </div>
  );
}

// ── Our Close Look's word ──
// The watcher up close: near black, about 10 cm, a 2 cm mirror on its face. Earth and the Moon turn round it, and it
// turns to keep that mirror on one point of the sky.

export function WatcherClose({ ra, dec }: { ra: number; dec: number }) {
  const body = useRef<SVGGElement>(null);
  const earth = useRef<SVGGElement>(null);
  const glint = useRef<SVGCircleElement>(null);
  const [cx, cy] = [W / 2, H / 2 + 4];
  // Where its mirror points on this drawing: up and to the right, toward the point named.
  const aim = -0.75;
  useTicks((t) => {
    // Earth and the Moon swing round behind it. Its body turns with them, and its mirror holds.
    const a = t * 0.25;
    earth.current?.setAttribute(
      "transform",
      `rotate(${(a * 180) / Math.PI} ${cx} ${cy})`,
    );
    body.current?.setAttribute(
      "transform",
      `rotate(${(Math.sin(t * 0.25) * 30).toFixed(2)} ${cx} ${cy})`,
    );
    glint.current?.setAttribute(
      "opacity",
      String(0.65 + 0.35 * Math.sin(t * 3.1)),
    );
  }, 2);
  const far = 150;
  const [ax, ay] = [cx + far * Math.cos(aim), cy + far * Math.sin(aim)];
  const sky = `RA ${((Math.round(ra * 10) / 10) % 24).toFixed(1)} h, DEC ${dec.toFixed(0)}°`;
  // Facets of a dark, smooth body: a rounded hexagon.
  const hex = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * 2 * Math.PI + 0.2;
    return `${(cx + 40 * Math.cos(a)).toFixed(1)},${(cy + 34 * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label={`The watcher up close: near black, about 10 cm across, holding a small mirror on one point of the sky, ${sky}`}
    >
      <defs>
        <radialGradient id="watcher-skin" cx="40%" cy="35%" r="75%">
          <stop offset="0" stopColor="#1d2026" />
          <stop offset="1" stopColor="#050607" />
        </radialGradient>
      </defs>
      {/* Earth and the Moon far behind, turning round it. */}
      <g ref={earth}>
        <circle
          cx={cx - 120}
          cy={cy + 60}
          r={9}
          fill="var(--you)"
          opacity={0.75}
        />
        <circle cx={cx + 110} cy={cy + 72} r={3} fill="#c9c9c9" opacity={0.6} />
      </g>
      {/* The line its mirror holds, out to the point named. */}
      <line
        x1={cx}
        y1={cy}
        x2={ax}
        y2={ay}
        stroke="var(--other)"
        strokeWidth={0.6}
        strokeDasharray="2 3"
        opacity={0.7}
      />
      <circle cx={ax - 6} cy={ay + 5} r={1.6} fill="var(--other)" />
      <text
        x={ax - 10}
        y={ay + 16}
        textAnchor="end"
        className="fill-[var(--other)] font-mono text-[7px]"
      >
        {sky}
      </text>
      <g ref={body}>
        <polygon
          points={hex}
          fill="url(#watcher-skin)"
          stroke="#2c313a"
          strokeWidth={0.6}
          strokeLinejoin="round"
        />
        <polygon
          points={hex}
          fill="none"
          stroke="#3a404b"
          strokeWidth={0.3}
          transform={`translate(${cx} ${cy}) scale(0.7) translate(${-cx} ${-cy})`}
        />
      </g>
      {/* The mirror, about 2 cm: held, while the body turns round it. */}
      <g transform={`rotate(${(aim * 180) / Math.PI + 90} ${cx} ${cy})`}>
        <rect
          x={cx - 8}
          y={cy - 2}
          width={16}
          height={4}
          rx={1}
          fill="#9aa3b2"
        />
        <rect
          x={cx - 8}
          y={cy - 2}
          width={16}
          height={1.4}
          rx={0.7}
          fill="#e6ebf2"
          opacity={0.8}
        />
      </g>
      <circle ref={glint} cx={cx + 3} cy={cy - 2} r={1.4} fill="#fff" />
      {/* For scale. */}
      <path
        d={`M${cx - 40},${cy + 52}h80M${cx - 40},${cy + 49}v6M${cx + 40},${cy + 49}v6`}
        stroke="var(--muted)"
        strokeWidth={0.6}
      />
      <text
        x={cx}
        y={cy + 63}
        textAnchor="middle"
        className="fill-muted font-mono text-[7px]"
      >
        ABOUT 10 CM
      </text>
      <text x={16} y={18} className="fill-muted font-mono text-[7px]">
        ITS BODY TURNS. ITS MIRROR HOLDS ON ONE POINT.
      </text>
    </svg>
  );
}
