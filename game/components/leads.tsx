import { Link, useNavigate } from "react-router";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/components/game-provider";
import { SkyArt } from "@/components/sky";
import { FILL, Spread } from "@/components/spread";
import type { Dials, Mark } from "@/lib/drift";
import { realTime } from "@/lib/game/clock";
import { type Lead, leadsOf, type Reading, skyId } from "@/lib/game/leads";
import { LEADS_SOURCES } from "@/lib/game/sources";
import type { FeltWorld } from "@/lib/sim/types";
import { prefersReducedMotion, rise, riseFrom, useStage } from "@/lib/motion";

// "What doesn't fit?": the Mind's answer, drawn. The stars within 50 light-years from above, and Earth's real leads
// lit one by one, each with a thread out from Sol: a world on a stretched orbit, every world the planet hunters felt
// by 2040, nearest first, Fomalhaut's collisions, and the first star that could answer our messages. Beside each, how
// long light takes to get there, in play time: what a call would cost. Picking one shows its path out from Sol in
// depth and opens what we measured of it.

/** The stars within 50 light-years from above, with Earth's leads lit as the dials say, each named. */
export function LeadsMap({
  dials,
  ids,
  onReady,
  className,
}: {
  dials: Dials;
  ids: string[];
  onReady(flight: number): void;
  className: string;
}) {
  const names = useRef<Record<string, HTMLSpanElement | null>>({});
  const onMarks = useCallback(
    (marks: Mark[]) => {
      const focus = ids[(dials.focus ?? 0) - 1];
      for (const { id, x, y, a } of marks) {
        const n = names.current[id];
        if (!n) continue;
        const ring = id.startsWith("ring:");
        const right = ring || x > (n.parentElement?.clientWidth ?? 0) / 2;
        n.style.transform = ring
          ? `translate(${x}px, ${y + 4}px) translate(-50%, 0)`
          : `translate(${x + (right ? 9 : -9)}px, ${y}px) translate(${right ? "0" : "-100%"}, -50%)`;
        n.style.opacity = String(a * (focus && id !== focus && id !== "Sol" && !ring ? 0.45 : 1));
      }
    },
    [dials, ids],
  );
  return (
    <SkyArt
      mode="leads"
      dials={dials}
      leads={ids}
      onReady={onReady}
      onMarks={onMarks}
      className={className}
    >
      {[...ids, "Sol", "ring:10", "ring:20", "ring:30", "ring:40"].map((id) => (
        <span
          key={id}
          ref={(n) => {
            names.current[id] = n;
          }}
          className={`pointer-events-none absolute top-0 left-0 font-mono text-[9px] whitespace-nowrap opacity-0 ${id === "Luyten's Star" ? "text-other" : id.startsWith("ring:") || id === "Sol" ? "text-muted" : "text-you"}`}
        >
          {id.startsWith("ring:") ? `${id.slice(5)} ly` : id}
        </span>
      ))}
    </SkyArt>
  );
}

/**
 * Earth's leads as rows. Pointing at one turns the map to it. In the opening, each is a line, pointing at one opens
 * what we measured, and picking one holds it open and the map there. On Scan, each opens its own page, and a row
 * shows its latest reading, marked new until opened.
 */
export function LeadList({
  leads,
  dials,
  fold = false,
  readings = {},
  fresh,
}: {
  leads: Lead[];
  dials: Dials;
  fold?: boolean;
  readings?: Record<string, Reading[]>;
  fresh?: Set<string>;
}) {
  // The lead in view: the one the Will points at, or else the one they picked, which stays until picked again.
  const [picked, setPicked] = useState<number | null>(null);
  const [peeked, setPeeked] = useState<number | null>(null);
  const shown = peeked ?? picked;
  const look = (peek: number | null, pick = picked) => {
    setPeeked(peek);
    Object.assign(dials, { focus: (peek ?? pick ?? -1) + 1 });
  };
  const pick = (i: number | null) => {
    setPicked(i);
    look(null, i);
  };

  const row = (l: Lead) => {
    const read = readings[l.slug]?.at(-1);
    const isNew = !!read && !!fresh?.has(read.id);
    return (
    <>
      <span className={`size-2 shrink-0 translate-y-[-1px] rounded-full ${l.reply ? "bg-other" : "bg-you"}`} />
      <span className="flex min-w-0 grow flex-col">
        <span className="text-[15px] leading-snug">
          <b className="font-semibold">{l.what}</b> · {l.star}
        </span>
        {read ? (
          <span className="text-[13.5px] leading-snug text-ink">
            {isNew && (
              <span className="mr-1.5 rounded-full bg-you px-1.5 py-px font-mono text-[9px] tracking-[.08em] text-paper">NEW</span>
            )}
            {read.title}, Year {read.at}.
          </span>
        ) : (
          <span className="text-[13.5px] leading-snug text-page-ink2">{l.line}</span>
        )}
      </span>
      <span className="shrink-0 text-right font-mono text-[11px] text-muted tabular-nums">{realTime(l.ly)}</span>
      <span className="shrink-0 self-center text-muted">›</span>
    </>
    );
  };
  const peek = (i: number) => ({
    onPointerEnter: (e: React.PointerEvent) => e.pointerType === "mouse" && look(i),
    onPointerLeave: (e: React.PointerEvent) => e.pointerType === "mouse" && look(null),
    onFocus: (e: React.FocusEvent) => e.target.matches(":focus-visible") && look(i),
    onBlur: () => look(null),
  });

  if (!fold)
    return (
      <ul className="mt-1 flex flex-col">
        {leads.map((l, i) => (
          <li key={l.star} className="border-t border-faint">
            <Link to={`/lead/${l.slug}`} {...peek(i)} className="flex items-baseline gap-3 py-2.5 text-left">
              {row(l)}
            </Link>
          </li>
        ))}
      </ul>
    );

  return (
    <ul className="mt-1 flex flex-col" onKeyDown={(e) => e.key === "Escape" && pick(null)}>
      {leads.map((l, i) => {
        const open = shown === i;
        return (
          <li key={l.star} data-m="lead" className="border-t border-faint">
            <div
              {...peek(i)}
              className={`transition-opacity duration-300 ${picked !== null && !open ? "opacity-50" : ""}`}
            >
              <button
                onClick={() => pick(picked === i ? null : i)}
                aria-expanded={open}
                className="flex w-full items-baseline gap-3 py-2.5 text-left"
              >
                <span
                  className={`size-2 shrink-0 translate-y-[-1px] rounded-full ${l.reply ? "bg-other" : "bg-you"}`}
                />
                <span className="min-w-0 grow truncate text-[15px] leading-snug">
                  <b className="font-semibold">{l.what}</b> · {l.star}
                </span>
                <span className="shrink-0 font-mono text-[11px] text-muted tabular-nums">{realTime(l.ly)}</span>
                <span className={`shrink-0 text-muted transition-transform duration-300 ${open ? "rotate-90" : ""}`}>
                  ›
                </span>
              </button>
              <div
                aria-hidden={!open}
                className={`grid transition-[grid-template-rows] duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="pb-3 pl-5">
                    <p className="text-[13.5px] leading-snug text-page-ink2">{l.line}</p>
                    <dl className="mt-2 grid grid-cols-[auto_1fr] items-baseline gap-x-3 gap-y-1 text-[13px] leading-snug">
                      {l.facts.map(([label, value]) => (
                        <Fragment key={label}>
                          <dt className="font-mono text-[9.5px] tracking-[.08em] text-muted uppercase">{label}</dt>
                          <dd>{value}</dd>
                        </Fragment>
                      ))}
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// A button answers the pointer: it brightens on hover and gives under a press, quick in and slower out. Only
// scale and color move here, since the stage's own tweens own transform and opacity.
const PRESS =
  "transition-[scale,background-color,border-color,box-shadow] duration-150 ease-out active:scale-[.97] active:duration-75 [-webkit-tap-highlight-color:transparent]";

export function Leads({ onNext }: { onSkip(): void; onNext(): void }) {
  const { save, wake } = useGame();
  const navigate = useNavigate();
  const root = useRef<HTMLDivElement>(null);
  const [felt, setFelt] = useState<FeltWorld[]>();
  const [dials] = useState<Dials>(() => ({ found: 0, grid: 0, focus: 0 }));
  const [flown, setFlown] = useState(false);
  const lead = useRef(0);
  const onReady = useCallback((flight: number) => {
    lead.current = performance.now() / 1000 + flight;
    setFlown(true);
  }, []);
  const seed = save?.seed;
  useEffect(() => {
    if (seed === undefined) return;
    fetch(`/api/leads?seed=${seed}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setFelt, () => setFelt([]));
  }, [seed]);
  const leads = useMemo(() => (felt ? leadsOf(felt) : []), [felt]);
  const ids = useMemo(() => leads.map((l) => skyId(l.star)), [leads]);
  const ready = flown && !!felt;

  const { leave, hurry } = useStage(
    root,
    (q, tl) => {
      tl.delay(Math.max(0, lead.current - performance.now() / 1000 - 0.6));
      // However many there are, they all come on in about five seconds.
      const step = Math.min(0.8, 5 / leads.length);
      tl.fromTo(q('[data-m="kick"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0)
        .to(dials, { grid: 1, duration: 1 }, 0.1)
        .fromTo(q('[data-m="who"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0.3)
        .fromTo(q('[data-m="open"]'), riseFrom, { ...rise, duration: 0.6 }, 0.5)
        .fromTo(q('[data-m="head"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 1.3);
      q('[data-m="lead"]').forEach((row, i) => {
        const at = 1.5 + i * step;
        tl.to(dials, { found: i + 1, duration: step * 1.4, ease: "power1.inOut" }, at).fromTo(
          row,
          riseFrom,
          { ...rise, duration: 0.5 },
          at + step * 0.7,
        );
      });
      const end = 1.5 + leads.length * step + 0.6;
      tl.fromTo(q('[data-m="last"]'), riseFrom, { ...rise, duration: 0.7 }, end).fromTo(
        q('[data-m="act"]'),
        riseFrom,
        { ...rise, stagger: 0.08 },
        end + 0.6,
      );
    },
    ready,
  );

  const ask = (question: string) =>
    leave(() => {
      navigate(`/mind?ask=${encodeURIComponent(question)}`);
      wake();
    });

  useEffect(() => {
    if (ready && prefersReducedMotion()) Object.assign(dials, { found: leads.length, grid: 1 });
  }, [ready, dials, leads]);

  return (
    <div
      ref={root}
      onPointerDown={hurry}
      style={ready ? undefined : { visibility: "hidden" }}
      className="flex min-h-0 grow flex-col overflow-hidden bg-paper px-5 text-ink wide:overflow-y-auto wide:px-10"
    >
      <Spread
        pinned
        sources={LEADS_SOURCES}
        head={
          <span data-m="kick" className="font-mono text-[10.5px] tracking-[.1em] text-muted">
            2040 · WHAT DOESN’T FIT?
          </span>
        }
        art={
          ids.length ? (
            <LeadsMap
              dials={dials}
              ids={ids}
              onReady={onReady}
              className={`relative mx-auto block aspect-square max-h-[42dvh] w-full max-w-[420px] shrink-0 sm:max-w-[520px] wide:aspect-auto wide:max-h-none ${FILL}`}
            />
          ) : (
            <div className="aspect-square w-full" />
          )
        }
      >
        <span data-m="who" className="mt-1 font-mono text-[10px] tracking-[.1em] text-you wide:mt-3">
          THE MIND
        </span>
        <p data-m="open" className="mt-1.5 text-[19px] leading-snug font-medium wide:text-[22px]">
          The sky near us is quiet. These are the few things in it we can’t explain yet.
        </p>
        <div
          data-m="head"
          className="mt-4 flex justify-between font-mono text-[10px] tracking-[.1em] text-muted uppercase"
        >
          <span>Leads · {leads.length}</span>
          <span>Light takes</span>
        </div>
        <LeadList leads={leads} dials={dials} fold />
        <p data-m="last" className="mt-3 text-[15px] leading-snug text-page-ink2">
          A call to any of them takes as long as its light, and an answer as long again. Which we look at first is
          yours.
        </p>
        <div className="mt-auto grid shrink-0 grid-cols-[1fr_1.4fr] gap-2 pt-5 pb-4 wide:pt-8">
          <button
            data-m="act"
            onClick={() => ask("What doesn’t fit?")}
            className={`${PRESS} h-[46px] rounded-full border border-ink/70 text-[15px] font-medium hover:border-ink hover:bg-ink/10`}
          >
            Ask the Mind
          </button>
          <button
            data-m="act"
            onClick={() => leave(onNext)}
            className={`${PRESS} h-[46px] rounded-full bg-ink text-[15px] font-medium text-paper hover:bg-ink/90 hover:shadow-[0_0_28px_-6px_var(--color-you)]`}
          >
            Plan Our Waking
          </button>
        </div>
      </Spread>
    </div>
  );
}
