import { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/components/game-provider";
import { realTime, tenths, YEAR_0 } from "@/lib/game/clock";
import type { EarthPast } from "@/lib/game/past";
import { BUILDS, EMPTY, events, FOMALHAUT, schedule, SEARCHES, STUDIES } from "@/lib/game/plan";
import { gsap, prefersReducedMotion, rise, riseFrom, useGSAP } from "@/lib/motion";

// The queue: what Planning saved, and what is already on its way, each on its whole journey. A message's thread
// starts the year we sent it, decades back, with a notch at Year 0, and a reply runs out and back. A build's starts at
// Year 0. Below, the same light in spacetime: distance across, Years up, our messages on the slants. Before Begin
// now waits at Year 0. After, it moves at 5 real minutes a Year, and what it passes is done. Pointing at a row lights
// its light in the drawing, and pointing at a mark lights its row. Chosen from explorations/projects-timeline.html, 13.

interface Row {
  key: string;
  name: string;
  note: string;
  /** Years from Year 0. Null past 40 Years. */
  at: number | null;
  kind: "build" | "look" | "send" | "reply";
  /** A message's name, the decimal year we sent it, and its star's distance in light-years. */
  msg?: string;
  sent?: number;
  ly?: number;
}

/** The axis runs to the last thing queued, at least 5 Years, at most 16. */
const span = (rows: Row[]) => Math.min(16, Math.max(5, Math.ceil(Math.max(0, ...rows.map((r) => r.at ?? 16)))));
const ticks = (t: number) => Array.from({ length: Math.floor(t / (t > 8 ? 2 : 1)) + 1 }, (_, i) => i * (t > 8 ? 2 : 1));
const over = (row: Row, now: number) => row.at !== null && now >= row.at;

/** One row lit in both the list and the drawing. A mouse lights it by pointing, keys by focus. A tap or click pins
 *  it until the same row is tapped again, the drawing's empty space is tapped, or Escape. */
function useLink() {
  const [hover, setHover] = useState<string | null>(null);
  const [pin, setPin] = useState<string | null>(null);
  const on = (key: string) => ({
    onPointerEnter: (e: React.PointerEvent) => void (e.pointerType === "mouse" && setHover(key)),
    onPointerLeave: () => setHover(null),
    onClick: () => setPin((p) => (p === key ? null : key)),
  });
  return { lit: hover ?? pin, on, focus: setHover, clear: () => setPin(null) };
}
type Link = ReturnType<typeof useLink>;

function rowsOf(plan: typeof EMPTY, done: Record<string, number | null>): Row[] {
  const builds: Row[] = plan.builds.map((name, i) => ({
    key: name,
    name: `${i + 1} · ${name}`,
    note: BUILDS.find((b) => b.name === name)?.what ?? "",
    at: done[name] ?? null,
    kind: "build",
  }));
  const looks: Row[] = plan.observe.length
    ? [{ key: "look", name: FOMALHAUT.name, note: FOMALHAUT.what, at: FOMALHAUT.lands, kind: "look" }]
    : [];
  return [...builds, ...looks];
}

/** One row's whole journey, from the year we sent it or from Year 0. The head glows where the light is now. */
function Journey({ row, now }: { row: Row; now: number }) {
  const start = row.sent ?? YEAR_0;
  const total = YEAR_0 + (row.at ?? 40) - start;
  const p = Math.min(1, (YEAR_0 + now - start) / total);
  const zero = (YEAR_0 - start) / total;
  const done = over(row, now);
  const reply = row.kind === "reply";
  // A reply's first leg is ours going out, the second theirs coming home.
  const head = reply && p < 0.5 ? "you" : reply ? "other" : "you";
  const run = (from: number, to: number, c: string) => (
    <span
      className={`absolute top-[5.5px] h-[2px] rounded-full bg-linear-to-r ${c}`}
      style={{ left: `${from * 100}%`, width: `${Math.max(0, to - from) * 100}%` }}
    />
  );
  return (
    <>
      <div className="relative mt-[7px] h-[13px]">
        <span
          className={`absolute inset-x-0 top-1.5 border-t border-dashed ${row.at === null ? "border-muted/60" : "border-muted/30"}`}
        />
        {reply ? (
          <>
            {run(0, Math.min(p, 0.5), "from-you/5 to-you/95")}
            {run(0.5, p, "from-other/5 to-other/95")}
            <span
              className="absolute top-[6.5px] size-[7px] -translate-1/2 rounded-full bg-ink"
              style={{ left: "50%" }}
            />
          </>
        ) : (
          run(0, p, row.kind === "send" ? "from-you/5 to-you/95" : "from-you/20 to-you/95")
        )}
        {row.sent !== undefined && (
          <span className="absolute top-px h-[11px] border-l border-muted" style={{ left: `${zero * 100}%` }} />
        )}
        {row.at !== null && (
          <span
            className={`absolute top-[6.5px] left-full size-[9px] -translate-1/2 rotate-45 border transition-colors duration-700 ${done ? (reply ? "border-other bg-other" : "border-you bg-you") : "border-muted bg-panel"}`}
          />
        )}
        {!done && (
          <span className="absolute top-[6.5px] -translate-1/2" style={{ left: `${p * 100}%` }}>
            <span
              className={`absolute top-1/2 left-1/2 size-[15px] -translate-1/2 animate-pulse rounded-full ${head === "you" ? "bg-you/25" : "bg-other/25"}`}
            />
            <span
              className={`relative block size-[7px] rounded-full ${head === "you" ? "bg-you shadow-[0_0_10px_var(--you)]" : "bg-other shadow-[0_0_10px_var(--other)]"}`}
            />
          </span>
        )}
      </div>
      <div className="mt-[3px] flex justify-between gap-2.5 font-mono text-[9.5px] text-muted">
        <span>{row.sent !== undefined ? `sent ${Math.floor(row.sent)} · ${row.msg}` : "from Year 0"}</span>
        {row.ly !== undefined && <span>{`${row.ly.toFixed(1)} ly${reply ? " there and back" : ""}`}</span>}
      </div>
    </>
  );
}

/** A lit row's wash reaches past its edges without moving them. */
const WASH = "bg-ink/[.04] shadow-[-10px_0_0_rgb(230_227_219/.04),10px_0_0_rgb(230_227_219/.04)]";

function Item({ row, now, began, link }: { row: Row; now: number; began: boolean; link: Link }) {
  const done = over(row, now);
  const when =
    row.at === null
      ? "past Year 40"
      : done
        ? row.kind === "build"
          ? "done"
          : "landed"
        : began
          ? `in ${realTime(row.at - now)}`
          : `Year ${tenths(row.at)}`;
  return (
    <li
      data-q="row"
      tabIndex={0}
      {...link.on(row.key)}
      onFocus={(e) => e.currentTarget.matches(":focus-visible") && link.focus(row.key)}
      onBlur={() => link.focus(null)}
      className={`border-t border-rowline py-2 outline-none transition-[background-color,box-shadow] duration-200 ${link.lit === row.key ? WASH : ""}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 text-[13.5px] leading-snug">
          <b className={`font-medium ${row.kind === "reply" ? "text-other" : ""}`}>{row.name}</b>
          <span className="block text-[12px] text-muted">{row.note}</span>
        </span>
        <span
          className={`shrink-0 text-right font-mono text-[11px] tabular-nums ${done ? "text-you" : "text-page-ink2"}`}
        >
          {when}
        </span>
      </div>
      <Journey row={row} now={now} />
    </li>
  );
}

/** Labels keep the drawing's lines from showing through them. */
const HALO = "[paint-order:stroke] stroke-panel stroke-4 [stroke-linejoin:round]";
/** The width of a character of the 10.5px star names, for keeping them apart. */
const CH = 5.6;

/** Each mark's shape: a square for a build, a circle for a look, a diamond for a message or a reply. */
function Mark({ row, x, y, on }: { row: Row; x: number; y: number; on: boolean }) {
  const fill = on ? (row.kind === "reply" ? "fill-other stroke-other" : "fill-you stroke-you") : "fill-panel";
  const cls = `${fill} ${on ? "" : row.kind === "reply" ? "stroke-other" : "stroke-muted"} transition-colors duration-700`;
  if (row.kind === "build") return <rect x={x - 3.5} y={y - 3.5} width={7} height={7} className={cls} />;
  if (row.kind === "look") return <circle cx={x} cy={y} r={3.5} className={cls} />;
  return <path d={`M${x} ${y - 4.5}L${x + 4.5} ${y}L${x} ${y + 4.5}L${x - 4.5} ${y}Z`} className={cls} />;
}

/** Where our messages are: distance from Earth across, Years up. Our light runs on the slants, out from Earth, and a
 *  reply that could come runs back in. Stars are named above the plot and Years sit in the margin, so no line crosses
 *  a word. Now rises like a tide. */
function Spacetime(props: { rows: Row[]; coming: Row[]; now: number; began: boolean; t: number; link: Link }) {
  const { rows, coming, now, began, t, link } = props;
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(400);
  useEffect(() => {
    const el = box.current!;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The plot's left edge leaves a margin for Years, its top a band for star names.
  const H = 290;
  const X0 = 58;
  const X1 = w - 14;
  const Yb = 262;
  const Yt = 60;
  const LY = Math.max(20, ...coming.map((r) => (r.ly ?? 0) * 1.07));
  const x = (ly: number) => X0 + (ly / LY) * (X1 - X0);
  const y = (yr: number) => Yb - (Math.min(yr, t) / t) * (Yb - Yt);
  const ny = y(now);

  // Star names on up to three levels, each clear of the names beside it and of the lines dropping past it.
  const stars = [{ name: "Earth", ly: 0 }];
  for (const r of coming) if (!stars.some((s) => s.name === r.name)) stars.push({ name: r.name, ly: r.ly ?? 0 });
  stars.sort((a, b) => a.ly - b.ly);
  const placed: { name: string; ly: number; x: number; a: number; b: number; l: number; end: boolean }[] = [];
  for (const s of stars) {
    const sx = x(s.ly);
    const wide = s.name.length * CH;
    const end = sx + wide / 2 > w - 2;
    const a = end ? sx + 8 - wide : sx - wide / 2;
    const b = end ? sx + 8 : sx + wide / 2;
    const fits = (l: number) =>
      placed.every((p) =>
        p.l === l ? b + 6 < p.a || a - 6 > p.b : p.l < l ? p.x < a - 3 || p.x > b + 3 : sx < p.a - 3 || sx > p.b + 3,
      );
    placed.push({ ...s, x: sx, a, b, end, l: [0, 1, 2].find(fits) ?? 2 });
  }

  // Light: each send spreading out from where it is at Year 0, and each reply that could come heading home.
  const fronts: { key: string; ly0: number; dir: 1 | -1; out: boolean }[] = [];
  for (const sent of new Set(coming.map((r) => r.sent!)))
    fronts.push({ key: `out${sent}`, ly0: YEAR_0 - sent, dir: 1, out: true });
  for (const r of coming) if (r.kind === "reply") fronts.push({ key: `in${r.key}`, ly0: r.at!, dir: -1, out: false });

  // The lit row in the drawing: its mark, its star's line, and the light it rides on. The rest step back.
  const lit = rows.find((r) => r.key === link.lit);
  const message = (r: Row) => r.kind === "send" || r.kind === "reply";
  const litStar = lit ? (message(lit) ? lit.name : "Earth") : null;
  const litFront = lit?.kind === "send" ? `out${lit.sent}` : lit?.kind === "reply" ? `in${lit.key}` : null;
  const litY = lit && lit.at !== null ? y(lit.at) : null;
  const fade = (on: boolean, least = 0.3) => ({ opacity: lit && !on ? least : 1, transition: "opacity 200ms" });
  const markX = (r: Row) => (r.kind === "send" ? x(r.ly!) : x(0));
  const tone = (r: Row) => (r.kind === "reply" ? "other" : "you");

  const years = ticks(t);
  return (
    <div ref={box} data-q="row" className="relative w-full">
      <h3 className="mt-3 pb-1.5 text-[10.5px] tracking-[.08em] text-muted">WHERE OUR MESSAGES ARE</h3>
      <svg
        width={w}
        height={H}
        className="mt-2.5 block text-[10.5px]"
        onClick={(e) => (e.target as Element).closest("[data-link]") || link.clear()}
      >
        <rect x={X0} y={ny} width={Math.max(0, X1 - X0)} height={Yb - ny} className="fill-you/5" />
        {years.map((yr) => (
          <line key={yr} x1={X0} x2={X1} y1={y(yr)} y2={y(yr)} className="stroke-rowline" />
        ))}
        {placed.map((s) => {
          const ly = 16 + s.l * 14;
          const on = s.name === litStar;
          const row = rows.find((r) => message(r) && r.name === s.name);
          return (
            <g key={s.name} style={fade(on, 0.45)}>
              <line
                x1={s.x}
                x2={s.x}
                y1={ly + 6}
                y2={Yb}
                className={on ? "stroke-muted" : s.ly ? "stroke-faint" : "stroke-muted/60"}
                strokeDasharray={s.ly ? "2 3" : undefined}
              />
              <text
                x={s.end ? s.x + 8 : s.x}
                y={ly}
                textAnchor={s.end ? "end" : "middle"}
                className="fill-ink"
                {...(row && { "data-link": true, ...link.on(row.key) })}
              >
                {s.name}
              </text>
            </g>
          );
        })}
        {fronts.map((f) => {
          const end = Math.min(t, f.dir > 0 ? LY - f.ly0 : f.ly0);
          if (end <= 0) return null;
          const P = (yr: number) => `${x(f.ly0 + f.dir * yr)} ${y(yr)}`;
          const k = Math.min(now, end);
          const stroke = f.out ? "stroke-you" : "stroke-other";
          return (
            <g key={f.key} fill="none" strokeWidth={f.key === litFront ? 1.8 : 1.2} style={fade(f.key === litFront)}>
              <path d={`M${P(0)} L${P(end)}`} strokeDasharray="2 4" className={`${stroke} opacity-50`} />
              {k > 0 && <path d={`M${P(0)} L${P(k)}`} className={stroke} />}
              {now < end && (
                <circle
                  cx={x(f.ly0 + f.dir * now)}
                  cy={ny}
                  r={2.4}
                  className={`${f.out ? "fill-you" : "fill-other"} stroke-0`}
                />
              )}
            </g>
          );
        })}
        <line x1={X0} x2={X1} y1={ny} y2={ny} className={`stroke-you/70 ${began ? "" : "animate-pulse"}`} />
        {lit && litY !== null && (
          <line
            x1={X0}
            x2={markX(lit)}
            y1={litY}
            y2={litY}
            strokeDasharray="2 3"
            className={tone(lit) === "you" ? "stroke-you/60" : "stroke-other/60"}
          />
        )}
        {/* Each mark answers to a finger's width around it, and lights its row. */}
        {rows.map((r) => {
          if (r.at === null) return null;
          const on = r.key === link.lit;
          return (
            <g key={r.key} data-link {...link.on(r.key)} style={fade(on)}>
              <circle cx={markX(r)} cy={y(r.at)} r={14} className="fill-transparent" />
              {on && (
                <circle
                  cx={markX(r)}
                  cy={y(r.at)}
                  r={8}
                  className={`animate-pulse fill-none ${tone(r) === "you" ? "stroke-you/70" : "stroke-other/70"}`}
                />
              )}
              <Mark row={r} x={markX(r)} y={y(r.at)} on={over(r, now)} />
            </g>
          );
        })}
        <g className="font-mono text-[9px]">
          {years.map((yr) =>
            Math.abs(y(yr) - ny) > 10 && (litY === null || Math.abs(y(yr) - litY) > 10) ? (
              <text key={yr} x={X0 - 8} y={y(yr) + 3} textAnchor="end" className="fill-muted">
                {yr ? yr : "Year 0"}
              </text>
            ) : null,
          )}
          <text x={X0 - 8} y={ny + 3} textAnchor="end" className={`fill-you ${HALO}`}>
            Year {began ? tenths(now).toFixed(1) : 0}
          </text>
          {lit && litY !== null && Math.abs(litY - ny) > 10 && (
            <text
              x={X0 - 8}
              y={litY + 3}
              textAnchor="end"
              className={`${tone(lit) === "you" ? "fill-you" : "fill-other"} ${HALO}`}
            >
              {tenths(lit.at!).toFixed(1)}
            </text>
          )}
          {[10, 20, 30, 40, 50]
            .filter((d) => d < LY - 2)
            .map((d) => (
              <text key={d} x={x(d)} y={Yb + 16} textAnchor="middle" className="fill-muted">
                {d} ly
              </text>
            ))}
        </g>
      </svg>
    </div>
  );
}

export function Queue() {
  const { save, year } = useGame();
  const root = useRef<HTMLDivElement>(null);
  const [past, setPast] = useState<EarthPast>();
  const seed = save?.seed;
  useEffect(() => {
    if (seed === undefined) return;
    fetch(`/api/earth?seed=${seed}`)
      .then((r) => (r.ok ? r.json() : undefined))
      .then(setPast, () => setPast(undefined));
  }, [seed]);

  const plan = save?.plan ?? EMPTY;
  const scale = past?.compute ?? 1;
  const done = useMemo(() => schedule(plan, scale), [plan, scale]);
  const queued = useMemo(() => rowsOf(plan, done), [plan, done]);
  const t = span(queued);
  const coming: Row[] = useMemo(
    () =>
      events(t).map((e) => ({
        key: `${e.star}${e.at}`,
        name: e.star,
        note: e.reply ? "A reply could come, at the soonest" : "Our message arrives",
        at: e.at,
        kind: e.reply ? "reply" : "send",
        msg: e.msg,
        sent: e.sent,
        ly: e.ly,
      })),
    [t],
  );
  const began = year !== null;
  const now = year ?? 0;
  const link = useLink();

  useGSAP(
    () => {
      if (!past || prefersReducedMotion()) return;
      gsap.fromTo(root.current!.querySelectorAll('[data-q="row"]'), riseFrom, { ...rise, stagger: 0.06 });
    },
    { scope: root, dependencies: [!!past] },
  );

  if (!past) return <div className="min-h-[120px]" />;
  const studies = STUDIES.find(([s]) => s === plan.studies)?.[1] ?? `${plan.studies}`;
  const search = SEARCHES.find((s) => s.id === plan.search)!;

  return (
    <div ref={root} className="relative" onKeyDown={(e) => e.key === "Escape" && link.clear()}>
      <h3 className="mt-2 text-[10.5px] tracking-[.08em] text-muted">
        {began ? "UNDER WAY" : "QUEUED"} · {queued.length}
      </h3>
      {queued.length ? (
        <ul>
          {queued.map((r) => (
            <Item key={r.key} row={r} now={now} began={began} link={link} />
          ))}
        </ul>
      ) : (
        <p data-q="row" className="border-t border-rowline py-2 text-[13px] text-muted">
          Nothing queued. Our instruments keep watch, and the Mind keeps studying.
        </p>
      )}

      <h3 className="mt-3 text-[10.5px] tracking-[.08em] text-muted">ALREADY ON ITS WAY</h3>
      <ul>
        {coming.map((r) => (
          <Item key={r.key} row={r} now={now} began={began} link={link} />
        ))}
      </ul>

      <Spacetime rows={[...queued, ...coming]} coming={coming} now={now} began={began} t={t} link={link} />

      <dl
        data-q="row"
        className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t border-rowline pt-2 text-[12.5px]"
      >
        <dt className="text-muted">Studies</dt>
        <dd>{plan.studies ? `${studies} of our thought` : "None"}</dd>
        <dt className="text-muted">When idle</dt>
        <dd>{search.label}</dd>
      </dl>
    </div>
  );
}
