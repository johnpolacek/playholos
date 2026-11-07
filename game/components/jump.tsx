import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Link } from "react-router";
import { watcherWords } from "@/lib/game/watcher-words";
import { useGame } from "@/components/game-provider";
import { BuildMark, buildColor, LeadMark } from "@/components/marks";
import { useMindNews } from "@/components/mind-chat";
import { usePlan, useSchedule } from "@/components/picks";
import { heardId, useLeads } from "@/components/scan";
import { yearText } from "@/lib/game/clock";
import { starName } from "@/lib/game/leads";
import { buildSlug, ordered } from "@/lib/game/plan";
import { gsap, prefersReducedMotion } from "@/lib/motion";

// A jump, felt and said, settled 2026-11-01: the Year counts up as the stars streak past, and a card says what reached
// us at the Year we stopped, each thing a link to its page. A jump to a bare Year read as unexplained, and once there
// nothing on screen said what had changed.

const JUMP = "holos:jump";

/** Tells the Year and the sky a jump has begun. */
export const announceJump = (from: number, to: number) => window.dispatchEvent(new CustomEvent(JUMP, { detail: { from, to } }));

/** What Scan knew just before a jump, so the card can say what is new after it. */
export interface Snap {
  slugs: Set<string>;
  reads: Set<string>;
  heard: Set<string>;
  /** Leads our craft had seen up close, so word from a sentinel at a cold glow counts as news. Playtest 2026-11-07. */
  close: Set<string>;
  /** The Mind's latest words, so its note tells only what it says after the jump. */
  said: string | undefined;
}

/** A lead our sentinel has seen up close. A cold glow keeps that word as a fact, not a reading. */
const upClose = (l: { facts: [string, string][] }) => l.facts.some(([k]) => k === "Up close");

export function useSnap() {
  const { leads, readings, heard } = useLeads();
  const { last } = useMindNews();
  return (): Snap => ({
    slugs: new Set(leads.map((l) => l.slug)),
    reads: new Set(Object.values(readings).flatMap((rs) => rs.map((r) => r.id))),
    heard: new Set(heard.map(heardId)),
    close: new Set(leads.filter(upClose).map((l) => l.slug)),
    said: last,
  });
}

/** The jump the Mind is telling us about, kept here so its note outlives the top bar swapping the Jump pill out: a jump
 *  that finished our last build paused the clock and lost the telling with it. 2026-11-04. */
export interface Leap {
  from: number;
  to: number;
  snap: Snap;
}
let leap: Leap | null = null;
const heed = new Set<() => void>();
export function setLeap(l: Leap | null) {
  leap = l;
  heed.forEach((f) => f());
}
/** The jump being told. One left over from a save we've left stays silent. */
export function useLeap() {
  const { year } = useGame();
  const now = useSyncExternalStore(
    (f) => (heed.add(f), () => void heed.delete(f)),
    () => leap,
    () => null,
  );
  return now && year !== null && year >= now.from ? now : null;
}

/** The Year shown, counting up through a jump over about a second, then the clock's own. */
export function useJumpYear(year: number | null) {
  const [shown, setShown] = useState<number | null>(null);
  useEffect(() => {
    const on = (e: Event) => {
      const { from, to } = (e as CustomEvent<{ from: number; to: number }>).detail;
      if (prefersReducedMotion()) return;
      const v = { y: from };
      gsap.to(v, {
        y: to,
        duration: Math.min(1.4, 0.5 + Math.log10(Math.max(1, to - from)) * 0.25),
        ease: "power2.inOut",
        onUpdate: () => setShown(v.y),
        onComplete: () => setShown(null),
      });
    };
    window.addEventListener(JUMP, on);
    return () => window.removeEventListener(JUMP, on);
  }, []);
  return shown ?? year;
}

/** Stars streaking out from the map's middle while a jump runs, longer the more Years it spans. */
export function Warp() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const on = (e: Event) => {
      const el = canvas.current;
      const ctx = el?.getContext("2d");
      if (!el || !ctx || prefersReducedMotion()) return;
      const { from, to } = (e as CustomEvent<{ from: number; to: number }>).detail;
      const map = document.querySelector('[data-shell="map"]')?.getBoundingClientRect();
      if (!map) return;
      const dpr = window.devicePixelRatio || 1;
      el.width = window.innerWidth * dpr;
      el.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const color = getComputedStyle(el).getPropertyValue("--you").trim() || "#5bb8d6";
      const cx = map.left + map.width / 2;
      const cy = map.top + map.height / 2;
      const reach = Math.hypot(map.width, map.height) / 2;
      // A longer jump, a stronger rush: 1 Year a light one, 10,000 Years the full streak.
      const pull = Math.min(1, 0.35 + Math.log10(Math.max(1, to - from)) / 6);
      const stars = Array.from({ length: Math.round(90 + 160 * pull) }, () => ({
        a: Math.random() * Math.PI * 2,
        r: Math.random() * reach * 0.6,
        v: (0.4 + Math.random()) * reach * 1.6 * pull,
        size: 0.5 + Math.random() * 1.2,
      }));
      const length = Math.min(1.4, 0.5 + Math.log10(Math.max(1, to - from)) * 0.25);
      const start = performance.now();
      let frame = 0;
      const tick = (t: number) => {
        const k = (t - start) / 1000 / length;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        if (k >= 1) return;
        // In fast, then easing out: brightest in the middle of the jump.
        const glow = Math.sin(Math.PI * k);
        ctx.save();
        ctx.beginPath();
        ctx.rect(map.left, map.top, map.width, map.height);
        ctx.clip();
        ctx.strokeStyle = color;
        ctx.lineCap = "round";
        for (const s of stars) {
          const r0 = s.r + s.v * k * k;
          const r1 = r0 + s.v * 0.12 * glow;
          ctx.globalAlpha = glow * Math.min(1, r0 / (reach * 0.25)) * 0.9;
          ctx.lineWidth = s.size;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(s.a) * r0, cy + Math.sin(s.a) * r0);
          ctx.lineTo(cx + Math.cos(s.a) * r1, cy + Math.sin(s.a) * r1);
          ctx.stroke();
        }
        ctx.restore();
        frame = requestAnimationFrame(tick);
      };
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tick);
    };
    window.addEventListener(JUMP, on);
    return () => window.removeEventListener(JUMP, on);
  }, []);
  return <canvas ref={canvas} aria-hidden className="pointer-events-none fixed inset-0 z-20 h-full w-full" />;
}

/** How long the card waits for Scan's word before saying nothing else came. */
const LISTEN_MS = 4000;
/** Shown at most, then the rest are counted. */
const SHOW = 6;

interface Item {
  key: string;
  /** Biggest news first: the watcher, then word from other minds, then what our craft and readings found, then builds,
   *  then new leads. A playtest's peer answer and sentinel word sat under six new warm glows, cut off. 2026-11-07. */
  rank: number;
  to: string;
  mark: React.ReactNode;
  title: string;
  line: string;
}

/** How many times as far a gift takes our thinking, said to a tenth, or null when it holds nothing for it. */
const gifted = (h: { gift?: number }) => (h.gift && h.gift > 1 ? h.gift.toFixed(1).replace(/\.0$/, "") : null);

/** What reached us at the Year we jumped to: builds done, leads new to Scan, readings landed, signals heard. */
export function Arrived({ from, to, snap }: { from: number; to: number; snap: Snap }) {
  const { leads, readings, heard, dials } = useLeads();
  const { plan } = usePlan();
  const { done } = useSchedule();
  const [listening, setListening] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setListening(false), LISTEN_MS);
    return () => clearTimeout(t);
  }, []);
  const items = useMemo(() => {
    const out: Item[] = [];
    for (const n of ordered(plan)) {
      const at = done[n];
      if (at != null && at > from + 1e-6 && at <= to + 1e-6)
        out.push({
          key: `build:${n}`,
          rank: 3,
          to: `/play/build/${buildSlug(n)}`,
          mark: (
            <span style={{ color: buildColor(n) }}>
              <BuildMark name={n} size={16} />
            </span>
          ),
          title: `${n} done`,
          line: `Year ${yearText(at)}`,
        });
    }
    for (const l of leads) {
      const fresh = (readings[l.slug] ?? []).filter((r) => !snap.reads.has(r.id));
      const isNew = !snap.slugs.has(l.slug);
      const close = !snap.close.has(l.slug) && l.facts.find(([k]) => k === "Up close");
      if (!isNew && !fresh.length && !close) continue;
      const read = fresh.at(-1);
      // Each new warm glow says how many we have found: the count is the story. 2026-11-03.
      const nth = l.slug.match(/^warm-glow-(\d+)$/)?.[1];
      out.push({
        key: `lead:${l.slug}`,
        rank: l.slug === "small-dark-body" ? 0 : read || close ? 2 : 4,
        to: `/play/lead/${l.slug}`,
        mark: <LeadMark art={l.art} />,
        title: starName(l.star),
        line: isNew && nth && nth !== "1" ? `A new warm glow, ${nth} found so far` : read ? `${read.title}, Year ${yearText(read.at)}` : close ? `Seen up close, ${close[1]}` : l.what,
      });
    }
    for (const h of heard)
      if (!snap.heard.has(heardId(h)))
        out.push({
          key: `heard:${heardId(h)}`,
          rank: 1,
          to: "/play",
          mark: <span className="text-other">◉</span>,
          title: `${h.answers !== undefined ? "An answer" : h.warning ? "A warning" : "A signal"} from ${starName(h.star)}`,
          line: `Year ${yearText(h.arrived)}${gifted(h) ? `, and a gift: our thinking goes ${gifted(h)} times as far` : ""}`,
        });
    // The watcher first: word of a mind beside us leads the report, above any glow. Playtest 2026-11-05.
    return out.sort((x, y) => x.rank - y.rank);
  }, [plan, done, leads, readings, heard, snap, from, to]);

  // The map turns to the first new lead. 2026-11-01.
  // A new warm glow first: the map pulls back across the Galaxy to show it, and comes home on Go on. 2026-11-03.
  const first = items.find((x) => x.key === "lead:small-dark-body") ?? items.find((x) => x.key.startsWith("lead:warm-glow-")) ?? items.find((x) => x.key.startsWith("lead:"));
  useEffect(() => {
    if (!first) return;
    const i = leads.findIndex((l) => `lead:${l.slug}` === first.key);
    if (i < 0) return;
    Object.assign(dials, { focus: i + 1 });
    return () => {
      if (dials.focus === i + 1) Object.assign(dials, { focus: 0 });
    };
  }, [first, leads, dials]);

  // Our first warm glow is the game's first real sign, so it gets its own word. 2026-11-03.
  const firstWarm = leads.find((l) => l.slug === "warm-glow-1" && !snap.slugs.has(l.slug));
  // And word of the watcher gets its own, the biggest news there is. 2026-11-05.
  const watcher = items.some((x) => x.key === "lead:small-dark-body") ? leads.find((l) => l.slug === "small-dark-body") : undefined;
  const { minds } = useLeads();
  // Another mind answering us is the game's rarest news, so it gets its own word too. A playtest learned of a peer's
  // answer and gift only by asking the Mind. 2026-11-07.
  const answer = heard.find((h) => h.answers !== undefined && !snap.heard.has(heardId(h)));
  return (
    <div className="flex flex-col gap-1.5">
      {watcher && (
        <Link to={`/play/lead/${watcher.slug}`} className="mb-1.5 block rounded-lg border border-other p-2.5">
          <span className="font-mono text-[10px] tracking-[.1em] text-other uppercase">Not alone</span>
          <p className="mt-1 text-[13.5px] leading-snug">
            <b className="font-semibold">{watcherWords(watcher, !!minds?.watcher?.warned).head}</b> {watcherWords(watcher, !!minds?.watcher?.warned).tail}{" "}
            <span className="text-you">Read it ›</span>
          </p>
        </Link>
      )}
      {answer && (
        <div className="mb-1.5 rounded-lg border border-other p-2.5">
          <span className="font-mono text-[10px] tracking-[.1em] text-other uppercase">An answer</span>
          <p className="mt-1 text-[13.5px] leading-snug">
            <b className="font-semibold">{starName(answer.star)} answered us.</b>{" "}
            {gifted(answer) ? `They sent a gift of what they know, and our thinking now goes ${gifted(answer)} times as far.` : "Its words are ours to read."}
          </p>
        </div>
      )}
      {firstWarm?.range && (
        <div className="mb-1.5 rounded-lg border border-other/50 p-2.5">
          <span className="font-mono text-[10px] tracking-[.1em] text-other uppercase">Our first warm glow</span>
          <p className="mt-1 text-[13.5px] leading-snug">
            A warm light where none shone, {firstWarm.range[0].toLocaleString("en-US")} to {firstWarm.range[1].toLocaleString("en-US")} ly away. Most lights like this are natural. If this one doesn’t fade, we may not be alone.
          </p>
        </div>
      )}
      <span className="font-mono text-[10px] tracking-[.1em] text-you uppercase">What reached us</span>
      {items.length === 0 ? (
        <p className="text-[13px] leading-snug text-muted">{listening ? "Word is still coming in…" : "Nothing more reached us yet."}</p>
      ) : (
        <ul className="flex flex-col">
          {items.slice(0, SHOW).map((x) => (
            <li key={x.key} className="border-t border-faint first:border-t-0">
              <Link to={x.to} className="flex items-center gap-2.5 py-1.5 text-left">
                <span className="flex w-4 shrink-0 justify-center">{x.mark}</span>
                <span className="flex min-w-0 flex-col">
                  <b className="truncate text-[13.5px] font-semibold">{x.title}</b>
                  <span className="truncate text-[12px] text-muted">{x.line}</span>
                </span>
                <span className="ml-auto text-muted">›</span>
              </Link>
            </li>
          ))}
          {items.length > SHOW && <li className="pt-1 text-[12px] text-muted">And {items.length - SHOW} more on Scan.</li>}
        </ul>
      )}
    </div>
  );
}

/** The Jump button's hover: a few faint specks drifting in to its edge. Begin's sparks, quieter, since this button sits
 *  in the top bar all game long and Begin's rush overpowered it. 2026-11-01. Off when motion is reduced. */
const SPILL = 14;
/** `tone` is the color variable the specks take: on a filled pill, the paper's. */
export function Specks({ on, tone = "--you" }: { on: boolean; tone?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const live = useRef(on);
  const running = useRef(false);
  useEffect(() => {
    live.current = on;
    if (!on || running.current || prefersReducedMotion()) return;
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    running.current = true;
    const color = getComputedStyle(el).getPropertyValue(tone).trim() || "#5bb8d6";
    const dpr = window.devicePixelRatio || 1;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    el.width = w * dpr;
    el.height = h * dpr;
    ctx.scale(dpr, dpr);
    const specks: { a: number; k: number; fall: number; size: number }[] = [];
    let last = performance.now();
    let due = 0;
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      // About eight a second, where Begin draws over a hundred.
      due += dt * 8;
      while (live.current && due >= 1) {
        due -= 1;
        specks.push({ a: Math.random() * Math.PI * 2, k: 1.35 + Math.random() * 0.2, fall: 0.35 + Math.random() * 0.25, size: 0.4 + Math.random() * 0.5 });
      }
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      for (let i = specks.length - 1; i >= 0; i--) {
        const s = specks[i];
        s.k -= s.fall * dt;
        if (s.k <= 1) {
          specks.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.min(1, (1.55 - s.k) * 2.5) * 0.6;
        ctx.beginPath();
        ctx.arc(w / 2 + Math.cos(s.a) * (w / 2 - SPILL) * s.k, h / 2 + Math.sin(s.a) * (h / 2 - SPILL) * s.k, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (live.current || specks.length) requestAnimationFrame(tick);
      else {
        ctx.clearRect(0, 0, w, h);
        running.current = false;
      }
    };
    requestAnimationFrame(tick);
  }, [on, tone]);
  useEffect(() => () => void (live.current = false), []);
  return <canvas ref={canvas} aria-hidden style={{ inset: -SPILL }} className="pointer-events-none absolute h-[calc(100%+28px)] w-[calc(100%+28px)]" />;
}
