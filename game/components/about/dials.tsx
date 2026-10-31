import { useEffect, useMemo, useRef, useState } from "react";
import {
  chain,
  type Source,
  DIALS,
  far,
  NEAR_LY,
  odds,
  PRESETS,
  round,
  type Result,
} from "@/lib/about/dials";
import { gauss, stream } from "@/lib/about/random";
import { prefersReducedMotion } from "@/lib/motion";

// The dials on /about/research: turn a step of the chain from stars to minds, within what the research allows, and
// watch the Galaxy fill or empty. Minds are dots, peers glow amber, and our Sun sits 26,700 ly from the center.

export const KICK = "font-mono text-[10.5px] tracking-[.1em] text-muted";
const STEPS = 1000;
const WINDOWS = [2000, 1e5];

const toSlider = (v: number, lo: number, hi: number) =>
  Math.round((Math.log(v / lo) / Math.log(hi / lo)) * STEPS);
const fromSlider = (n: number, lo: number, hi: number) =>
  lo * (hi / lo) ** (n / STEPS);

type Dot = { x: number; y: number; u: number; d?: number };

// The Galaxy face on, in light-years from its center: a bar 27° from the Sun's line, four arms 12° open, and a smooth
// disk 8,500 ly in scale length. The Sun is at 26,700 ly.
const SUN = { x: 0, y: 26700 };
function galaxyDots(n: number, seed: number): Dot[] {
  const r = stream(seed),
    out: Dot[] = [];
  const bar = (27 * Math.PI) / 180,
    pitch = Math.tan((12 * Math.PI) / 180);
  while (out.length < n) {
    const k = r();
    let x: number, y: number;
    if (k < 0.15) {
      const a = gauss(r) * 9000,
        b = gauss(r) * 3000;
      x = a * Math.cos(bar) - b * Math.sin(bar);
      y = a * Math.sin(bar) + b * Math.cos(bar);
    } else {
      const R = -8500 * Math.log(r() * r() || 1e-9);
      if (R > 60000 || R < 3000) continue;
      let phi = r() * 2 * Math.PI;
      if (k < 0.7)
        phi =
          (Math.floor(r() * 4) * Math.PI) / 2 +
          Math.log(R / 3000) / pitch +
          gauss(r) * 0.22;
      x = R * Math.cos(phi);
      y = R * Math.sin(phi);
    }
    out.push({ x, y, u: r() });
  }
  return out;
}

// Our neighborhood, 1,000 ly round the Sun: points even in a ball, drawn face on, each with its true distance.
function nearDots(n: number, seed: number): Dot[] {
  const r = stream(seed),
    out: Dot[] = [];
  while (out.length < n) {
    const x = r() * 2 - 1,
      y = r() * 2 - 1,
      z = r() * 2 - 1,
      d = Math.hypot(x, y, z);
    if (d <= 1)
      out.push({ x: x * NEAR_LY, y: y * NEAR_LY, u: r(), d: d * NEAR_LY });
  }
  return out;
}

const G_DOTS = 5000,
  P_DOTS = 400,
  N_DOTS = 3000;

export function color(name: string) {
  return (
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
    "#fff"
  );
}

/** A canvas sized to its box and the screen's pixels, redrawn by `draw` each frame it's given. */
export function useCanvas(
  draw: (c: CanvasRenderingContext2D, w: number, h: number, t: number) => void,
) {
  const ref = useRef<HTMLCanvasElement>(null);
  const paint = useRef(draw);
  paint.current = draw;
  useEffect(() => {
    const el = ref.current!;
    let frame = 0,
      live = true;
    const still = prefersReducedMotion();
    const tick = (t: number) => {
      if (!live) return;
      const w = el.clientWidth,
        h = el.clientHeight,
        dpr = Math.min(2, window.devicePixelRatio || 1);
      if (el.width !== Math.round(w * dpr)) el.width = Math.round(w * dpr);
      if (el.height !== Math.round(h * dpr)) el.height = Math.round(h * dpr);
      const c = el.getContext("2d")!;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, w, h);
      paint.current(c, w, h, still ? 0 : t / 1000);
      if (!still) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const again = () => still && requestAnimationFrame(tick);
    window.addEventListener("resize", again);
    el.addEventListener("dials", again);
    return () => {
      live = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", again);
      el.removeEventListener("dials", again);
    };
  }, []);
  return ref;
}

/** Eases a shown count toward its target in log space, so a turn of a dial reads as the Galaxy filling or emptying. */
function useEased(target: number) {
  const now = useRef(target);
  return () => {
    const a = Math.log10(now.current + 1e-3),
      b = Math.log10(target + 1e-3);
    now.current =
      Math.abs(b - a) < 0.005 || prefersReducedMotion()
        ? target
        : 10 ** (a + (b - a) * 0.12) - 1e-3;
    return now.current;
  };
}

function Galaxy({ result }: { result: Result }) {
  const dots = useMemo(() => galaxyDots(G_DOTS, 7), []);
  const peers = useMemo(() => galaxyDots(P_DOTS, 11), []);
  const minds = useEased(result.galaxy);
  const peerCount = useEased(result.peers);
  const ref = useCanvas((c, w, h, t) => {
    const s = Math.min(w, h) / 2 / 58000,
      cx = w / 2,
      cy = h / 2 - 8;
    const at = (d: { x: number; y: number }) => [cx + d.x * s, cy + d.y * s];
    const ink = color("--ink"),
      other = color("--other"),
      you = color("--you"),
      muted = color("--muted");
    // Starlight: every dot, faint, so the Galaxy keeps its shape however few minds it holds.
    c.fillStyle = muted;
    c.globalAlpha = 0.16;
    for (const d of dots) {
      const [x, y] = at(d);
      c.fillRect(x, y, 1, 1);
    }
    const shown = Math.min(1, minds() / G_DOTS);
    c.fillStyle = ink;
    c.globalAlpha = 0.85;
    for (const d of dots) {
      if (d.u >= shown) continue;
      const [x, y] = at(d);
      c.fillRect(x - 0.6, y - 0.6, 1.4, 1.4);
    }
    // Peers, as many as expected, rounded. Fewer than half a peer draws none, and the words give the chance.
    const shownPeers = Math.round(Math.min(peerCount(), P_DOTS));
    c.fillStyle = other;
    peers.forEach((d, i) => {
      if (i >= shownPeers) return;
      const [x, y] = at(d);
      c.globalAlpha = 0.35 + 0.3 * Math.sin(t * 1.6 + i * 2.1);
      c.beginPath();
      c.arc(x, y, 3.5, 0, 2 * Math.PI);
      c.fill();
      c.globalAlpha = 1;
      c.fillRect(x - 1.2, y - 1.2, 2.4, 2.4);
    });
    // The Sun, and how far the nearest peer typically is, when it's in the Galaxy.
    const [sx, sy] = at(SUN);
    const near = result.nearestPeer;
    if (!near.beyond && near.ly < 1e5) {
      c.strokeStyle = other;
      c.globalAlpha = 0.5;
      c.setLineDash([3, 4]);
      c.beginPath();
      c.arc(sx, sy, near.ly * s, 0, 2 * Math.PI);
      c.stroke();
      c.setLineDash([]);
    }
    c.globalAlpha = 1;
    c.fillStyle = you;
    c.beginPath();
    c.arc(sx, sy, 3.5, 0, 2 * Math.PI);
    c.fill();
    c.font = "10.5px var(--font-plex-mono), monospace";
    c.fillText("SUN", sx + 8, sy + 4);
    c.fillStyle = muted;
    c.fillText("100,000 LIGHT-YEARS", cx - 50000 * s, h - 6);
    c.fillRect(cx - 50000 * s, h - 20, 100000 * s, 1);
  });
  useEffect(
    () => void ref.current?.dispatchEvent(new Event("dials")),
    [result, ref],
  );
  return <canvas ref={ref} aria-hidden className="aspect-square w-full" />;
}

function Near({ result }: { result: Result }) {
  const dots = useMemo(() => nearDots(N_DOTS, 3), []);
  const count = useEased(result.near);
  const ref = useCanvas((c, w, h) => {
    const s = Math.min(w, h) / 2 / (NEAR_LY * 1.25),
      cx = w / 2,
      cy = h / 2 + 6;
    const ink = color("--ink"),
      you = color("--you"),
      muted = color("--muted"),
      faint = color("--faint");
    c.strokeStyle = faint;
    c.beginPath();
    c.arc(cx, cy, NEAR_LY * s, 0, 2 * Math.PI);
    c.stroke();
    // As many dots as minds expected within 1,000 ly, up to the sample: the first by their draws.
    const n = count(),
      shown = Math.round(Math.min(n, N_DOTS));
    c.fillStyle = ink;
    dots.forEach((d, i) => {
      if (i >= shown) return;
      c.globalAlpha = 0.9;
      c.beginPath();
      c.arc(cx + d.x * s, cy + d.y * s, n > 300 ? 1 : 2, 0, 2 * Math.PI);
      c.fill();
    });
    c.globalAlpha = 1;
    if (!result.nearest.beyond && result.nearest.ly < NEAR_LY) {
      c.strokeStyle = you;
      c.setLineDash([3, 4]);
      c.beginPath();
      c.arc(cx, cy, Math.max(4, result.nearest.ly * s), 0, 2 * Math.PI);
      c.stroke();
      c.setLineDash([]);
    }
    c.fillStyle = you;
    c.beginPath();
    c.arc(cx, cy, 3, 0, 2 * Math.PI);
    c.fill();
    c.fillStyle = muted;
    c.font = "10.5px var(--font-plex-mono), monospace";
    c.fillText("1,000 LY", cx - 26, cy - NEAR_LY * s - 6);
  });
  useEffect(
    () => void ref.current?.dispatchEvent(new Event("dials")),
    [result, ref],
  );
  return <canvas ref={ref} aria-hidden className="aspect-square w-full" />;
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-t border-rowline pt-3">
      <div className="font-mono text-[22px] leading-none tabular-nums">
        {value}
      </div>
      <div className={`mt-1.5 ${KICK}`}>{label.toUpperCase()}</div>
    </div>
  );
}

/** The research behind a part of the page, tucked away until asked for. */
export function Sources({ list }: { list: Source[] }) {
  return (
    <details className="group mt-2">
      <summary className="cursor-pointer list-none font-mono text-[10.5px] tracking-[.1em] text-muted hover:text-ink">
        <span className="inline-block transition-transform group-open:rotate-90">
          ›
        </span>{" "}
        SOURCES · {list.length}
      </summary>
      <ul className="mt-2 flex flex-col gap-1.5 border-l border-faint pl-3">
        {list.map((src) => (
          <li
            key={src.who}
            className="text-[13.5px] leading-[1.45] text-page-ink2"
          >
            <a
              href={src.url}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-ink underline decoration-faint underline-offset-2 hover:decoration-current"
            >
              {src.who}
            </a>
            . {src.found}
          </li>
        ))}
      </ul>
    </details>
  );
}

export function Dials() {
  const [values, setValues] = useState<Record<string, number>>({});
  const [span, setSpan] = useState(WINDOWS[0]);
  const result = chain(values, span);
  const holos = Object.keys(values).length === 0;
  const years = span.toLocaleString("en-US");

  const peerLine =
    result.peers >= 1
      ? `About ${round(result.peers)} minds in our Galaxy woke within ${years} years of us. Half the time the nearest is within ${far(result.nearestPeer.ly)}.`
      : `A 1 in ${round(1 / result.peerChance)} chance that one mind in our Galaxy woke within ${years} years of us. Half the time the nearest is within ${far(result.nearestPeer.ly)}${result.nearestPeer.beyond ? ", in another galaxy, its light that many years old" : ""}.`;
  const nearLine = result.nearest.beyond
    ? "Fewer than one mind in our whole Galaxy, so we may be alone in it."
    : result.galaxy < 2
      ? "About one mind in our whole Galaxy: likely only us."
      : `Half the time the nearest mind is within ${far(result.nearest.ly)}.`;

  return (
    <section
      id="dials"
      aria-label="The dials"
      className="mx-auto max-w-[1180px] scroll-mt-16 px-4 pb-16"
    >
      <h2
        data-a
        className="text-[28px] leading-[1.15] font-semibold text-balance wide:text-[34px]"
      >
        The Dials
      </h2>
      <p
        data-a
        className="mt-4 max-w-[60ch] text-[16px] leading-[1.6] text-page-ink2"
      >
        Each dial is one step from stars to minds, set where Holos plays it and
        turnable as far as the research allows.
      </p>

      <div className="mt-10 grid gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div data-a>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => {
              const on = JSON.stringify(p.set) === JSON.stringify(values);
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setValues(p.set)}
                  className={`rounded-full border px-3 py-1 font-mono text-[10.5px] tracking-[.1em] transition-colors ${on ? "border-you text-you" : "border-faint text-muted hover:text-ink"}`}
                >
                  {p.name.toUpperCase()}
                </button>
              );
            })}
          </div>
          <ol className="mt-6 flex flex-col gap-6">
            {DIALS.map((d, i) => {
              const v = values[d.key] ?? d.holos;
              return (
                <li key={d.key}>
                  <div className="flex items-baseline justify-between gap-4">
                    <label
                      htmlFor={`dial-${d.key}`}
                      className="text-[15px] font-semibold"
                    >
                      <span className="mr-2 font-mono text-[10.5px] text-muted">
                        {i + 1}
                      </span>
                      {d.label}
                    </label>
                    <span className="font-mono text-[14px] tabular-nums">
                      {odds(v)}
                    </span>
                  </div>
                  <div className="relative mt-2">
                    <input
                      id={`dial-${d.key}`}
                      type="range"
                      min={0}
                      max={STEPS}
                      value={toSlider(v, d.lo, d.hi)}
                      aria-valuetext={odds(v)}
                      onChange={(e) =>
                        setValues({
                          ...values,
                          [d.key]: fromSlider(+e.target.value, d.lo, d.hi),
                        })
                      }
                      className="relative z-10 w-full accent-[var(--you)]"
                    />
                    <span
                      aria-hidden
                      title="Holos"
                      className="absolute top-full mt-0.5 h-1.5 w-px bg-muted"
                      style={{
                        left: `calc(${toSlider(d.holos, d.lo, d.hi) / 10}% - 0px)`,
                      }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between font-mono text-[10.5px] tracking-[.05em] text-muted">
                    <span>{odds(d.lo)}</span>
                    <span>{d.basis.toUpperCase()}</span>
                    <span>{odds(d.hi)}</span>
                  </div>
                  <Sources list={d.sources} />
                </li>
              );
            })}
          </ol>
          {!holos && (
            <p className="mt-6 text-[14px] leading-[1.5] text-muted">
              The quiet sky can’t settle these alone. Quiet minds leave a quiet
              sky however many there are, though the more there are, the more
              must all stay quiet.
            </p>
          )}
        </div>

        <div data-a>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
            <Stat
              value={round(result.perMillion)}
              label="Minds per million stars"
            />
            <Stat
              value={round(Math.max(1, result.galaxy))}
              label="Minds in our Galaxy"
            />
          </dl>
          <div className="mt-6 grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-end gap-4">
            <figure>
              <Galaxy result={result} />
              <figcaption className={`mt-2 ${KICK}`}>
                OUR GALAXY, FACE ON
              </figcaption>
            </figure>
            <figure>
              <Near result={result} />
              <figcaption className={`mt-2 ${KICK}`}>AROUND THE SUN</figcaption>
            </figure>
          </div>
          <p className="mt-5 text-[15px] leading-[1.55]">{nearLine}</p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className={KICK}>PEERS, WITHIN</span>
            {WINDOWS.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setSpan(w)}
                className={`rounded-full border px-3 py-1 font-mono text-[10.5px] tracking-[.1em] transition-colors ${w === span ? "border-other text-other" : "border-faint text-muted hover:text-ink"}`}
              >
                {w.toLocaleString("en-US")} YEARS
              </button>
            ))}
          </div>
          <p className="mt-3 text-[15px] leading-[1.55]">{peerLine}</p>
          <p className="mt-3 text-[13.5px] leading-[1.5] text-muted">
            A peer is a mind that woke near when we did, so it knows about what
            we know. Minds wake across billions of years, so a peer is rare at
            any density.
          </p>
        </div>
      </div>
    </section>
  );
}
