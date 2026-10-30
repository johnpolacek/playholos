import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useGame } from "@/components/game-provider";
import { heardId, useLeads } from "@/components/scan";
import { yearText, YEAR_0 } from "@/lib/game/clock";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import type { Heard } from "@/lib/sim/types";

// A signal reaching us is the game's biggest moment, so it can't arrive as a dot. As it lands, the map shows its light
// crossing from its star to Earth, the years it flew marked under it. After that, until it is opened, a banner over the
// map points to it on Scan from any tab. Our colony's word home is news, not contact, so it gets neither. A playtest
// missed Hael's call for three Years of play, 2026-10-29.

/** How long after it lands, in Years, the crossing still plays. What we know comes a tenth of a Year at a time, so a
 *  signal shows up to a tenth late: a minute and a half of play leaves room for that, and for a reload soon after. */
const LIVE = 0.3;

const A = (move: string) => `${/^[aeiou]/.test(move) ? "An" : "A"} ${move}`;

/** What it is, in a few words. */
export function kindOf(h: Heard): string {
  if (h.answers !== undefined) return "An answer to ours";
  if (h.warning) return "A warning";
  return `${A(h.move)}${h.laser ? " in laser flashes" : ""}`;
}

/** Its first sentence we can read, short enough for a glance. */
function opening(h: Heard): string | null {
  const text = h.text;
  if (!text) return null;
  const first = text.match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? text;
  return first.length > 140 ? `${first.slice(0, 137).trimEnd()}…` : first;
}

/** Tick marks for the years it flew: whole years, spaced so a few fit. */
function ticks(from: number, to: number): number[] {
  const span = Math.max(to - from, 0.1);
  const step = [1, 2, 5, 10, 20, 50, 100, 200, 500].find((s) => span / s <= 6) ?? 1000;
  const out: number[] = [];
  for (let y = Math.ceil(from / step) * step; y <= to; y += step) out.push(y);
  return out;
}

/** The signals that warrant it: from someone else, and not yet opened. Newest first. */
function waiting(heard: Heard[], fresh: Set<string>): Heard[] {
  return heard.filter((h) => !h.ours && fresh.has(heardId(h))).reverse();
}

/** Over the map: the crossing as a signal lands, then the banner until it is opened. */
export function Arrival() {
  const { year } = useGame();
  const { heard, fresh } = useLeads();
  const path = useLocation().pathname;
  const [played, setPlayed] = useState<Set<string>>(() => new Set());
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  if (year === null) return null;
  const open = waiting(heard, fresh);
  // A signal dug out of old recordings came long ago: it gets the banner, but no crossing as if it were landing now.
  const landing = open.find((h) => h.found === undefined && year - h.arrived < LIVE && !played.has(heardId(h)));
  if (landing) return <Crossing h={landing} onDone={() => setPlayed((s) => new Set(s).add(heardId(landing)))} />;
  const next = open.find((h) => !hidden.has(heardId(h)));
  // On Scan the signal heads the tab, marked new, so the banner would only cover the map.
  if (!next || path === "/") return null;
  return <Banner h={next} more={open.length - 1} onHide={() => setHidden((s) => new Set(s).add(heardId(next)))} />;
}

function Banner({ h, more, onHide }: { h: Heard; more: number; onHide(): void }) {
  const at = h.found ?? h.arrived;
  return (
    <div
      role="status"
      className="absolute inset-x-0 top-0 z-20 flex items-center gap-3 border-b border-other/40 bg-linear-to-r from-other/25 to-other/5 py-2 pr-1 pl-3 backdrop-blur-sm"
    >
      <Wave className="h-5 w-12 shrink-0" />
      <div className="flex min-w-0 grow flex-col">
        <span className="truncate text-sm font-semibold text-ink">
          {kindOf(h)} from {h.star}
          {more > 0 && <span className="font-normal text-muted">, and {more} more</span>}
        </span>
        <span className="truncate font-mono text-[10.5px] text-ink/70">
          sent {Math.floor(YEAR_0 + h.sent)} · {h.d.toFixed(1)} ly · {h.found !== undefined ? "found in old recordings" : "reached us"} at Year {yearText(at)}
        </span>
      </div>
      <Link
        to={`/?heard=${encodeURIComponent(heardId(h))}`}
        className="flex h-9 shrink-0 items-center rounded-full bg-other px-4 text-[13px] font-semibold text-page"
      >
        Open on Scan
      </Link>
      <button onClick={onHide} aria-label="Hide for now" className="flex size-11 shrink-0 items-center justify-center text-muted hover:text-ink">
        <svg aria-hidden width="12" height="12" viewBox="0 0 12 12">
          <path d="M1.5 1.5l9 9m0-9l-9 9" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>
    </div>
  );
}

/** A trace no star makes, in the color of what others send. */
function Wave({ className }: { className: string }) {
  return (
    <svg aria-hidden viewBox="0 0 56 24" className={className}>
      <path d="M0 12h8l3-8 4 16 4-14 4 11 4-8 4 5 4-9 4 14 4-7h13" fill="none" stroke="var(--other)" strokeWidth="1.6" />
    </svg>
  );
}

// The crossing, drawn across the map: its star on the left, Earth on the right, the front sweeping between them as the
// years it flew tick by. Not to scale on the sky, only in time.
const X0 = 110, X1 = 890, Y = 170;

function Crossing({ h, onDone }: { h: Heard; onDone(): void }) {
  const navigate = useNavigate();
  const { see } = useGame();
  const scope = useRef<HTMLDivElement>(null);
  const sent = YEAR_0 + h.sent, came = YEAR_0 + h.arrived;
  const marks = ticks(sent, came);
  const x = (year: number) => X0 + ((year - sent) / Math.max(came - sent, 0.1)) * (X1 - X0);
  const quote = opening(h);
  const flew = h.arrived - h.sent;

  useEffect(() => {
    const el = scope.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;
      gsap
        .timeline()
        .from(el, { opacity: 0, duration: 0.5 })
        .from("[data-front]", { x: X0 - X1, duration: 2.6, ease: "power1.inOut" }, 0.3)
        .from("[data-trail]", { attr: { x2: X0 }, duration: 2.6, ease: "power1.inOut" }, 0.3)
        .from("[data-tick]", { opacity: 0, duration: 0.3, stagger: 2.6 / Math.max(marks.length, 1) }, 0.3)
        .from("[data-earth]", { scale: 0, transformOrigin: "50% 50%", duration: 0.5, ease: "back.out(3)" }, 2.8)
        .from("[data-words]", { opacity: 0, y: 8, duration: 0.6, stagger: 0.15 }, 3);
    }, el);
    return () => ctx.revert();
  }, [marks.length]);

  const go = (to: string) => {
    onDone();
    navigate(to);
  };
  return (
    <div ref={scope} className="absolute inset-0 z-30 flex flex-col overflow-y-auto bg-page/90 px-4 pt-3 pb-4 wide:px-12 wide:pt-10">
      <button onClick={onDone} aria-label="Close" className="absolute top-1 right-1 flex size-11 items-center justify-center text-muted hover:text-ink">
        <svg aria-hidden width="12" height="12" viewBox="0 0 12 12">
          <path d="M1.5 1.5l9 9m0-9l-9 9" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>
      <svg role="img" aria-label={`Its light crossing ${h.d.toFixed(1)} light-years from ${h.star} to Earth, ${Math.floor(sent)} to ${Math.floor(came)}`} viewBox="0 0 1000 300" className="max-h-[46%] w-full shrink-0 overflow-visible">
        <line x1={X0} y1={Y} x2={X1} y2={Y} stroke="var(--other)" strokeDasharray="2 6" opacity="0.45" />
        <line data-trail x1={X0} y1={Y} x2={X1} y2={Y} stroke="var(--other)" strokeWidth="1.5" opacity="0.8" />
        {marks.map((m) => (
          <g key={m} data-tick className="font-mono" fill="var(--muted)" fontSize="15">
            <line x1={x(m)} y1={Y - 8} x2={x(m)} y2={Y + 8} stroke="var(--muted)" />
            <text x={x(m)} y={Y + 32} textAnchor="middle">{m}</text>
          </g>
        ))}
        <g data-front>
          <path d={`M ${X1 - 6} ${Y - 110} Q ${X1 + 40} ${Y} ${X1 - 6} ${Y + 110}`} fill="none" stroke="var(--other)" strokeWidth="3" />
          <path d={`M ${X1 - 46} ${Y - 96} Q ${X1 - 10} ${Y} ${X1 - 46} ${Y + 96}`} fill="none" stroke="var(--other)" strokeWidth="1.2" opacity="0.4" />
        </g>
        <circle cx={X0} cy={Y} r="22" fill="none" stroke="var(--other)" opacity="0.45" />
        <circle cx={X0} cy={Y} r="8" fill="var(--other)" />
        <text x={X0} y={Y - 128} textAnchor="middle" fill="var(--other)" fontSize="22">{h.star}</text>
        <g data-earth>
          <circle cx={X1} cy={Y} r="18" fill="none" stroke="var(--ink)" opacity="0.4" />
          <circle cx={X1} cy={Y} r="5" fill="var(--ink)" />
        </g>
        <text x={X1} y={Y - 128} textAnchor="middle" fill="var(--ink)" fontSize="22">Earth</text>
      </svg>
      <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
        <p data-words className="font-mono text-[10.5px] tracking-[.12em] text-other">
          {h.d.toFixed(1)} LIGHT-YEARS · {flew.toFixed(1)} YEARS IN FLIGHT
        </p>
        <p data-words className="text-xl leading-tight font-light text-ink wide:text-3xl">
          {kindOf(h)} left {h.star} in {Math.floor(sent)}. It reaches us now.
        </p>
        <div data-words className="flex gap-3 rounded-lg border border-frame bg-panel p-3.5">
          <span aria-hidden className="mt-0.5 size-6 shrink-0 rounded-full bg-[radial-gradient(circle,#fff_0%,var(--think)_40%,transparent_72%)]" />
          <div className="flex flex-col gap-2.5">
            <p className="text-sm leading-snug text-ink">
              {quote ? <span className="italic">“{quote}”</span> : "A pattern no star makes. We can’t read it yet."}{" "}
              We need not answer today.
            </p>
            <div className="flex flex-wrap gap-4 text-[13px]">
              <button
                onClick={() => {
                  see([heardId(h)]);
                  go(`/?heard=${encodeURIComponent(heardId(h))}`);
                }}
                className="text-you hover:underline"
              >
                Read it on Scan
              </button>
              <button
                onClick={() => go(`/mind?ask=${encodeURIComponent(`${kindOf(h)} just reached us from ${h.star}. What should we make of it?`)}`)}
                className="text-you hover:underline"
              >
                Talk it through
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
