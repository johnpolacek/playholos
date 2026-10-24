import { Link } from "react-router";
import { Fragment, useCallback, useRef, useState } from "react";
import { SkyArt } from "@/components/sky";
import { LeadMark } from "@/components/marks";
import { Face } from "@/components/tab-head";
import type { Dials, Mark } from "@/lib/drift";
import { span } from "@/lib/game/clock";
import { type Lead, type Reading } from "@/lib/game/leads";
import { type System, worldName } from "@/lib/game/systems";

// Earth's leads, drawn for Scan. The stars within 50 light-years from above, and Earth's real leads lit, each with a
// thread out from Sol: a world on a stretched orbit, every world the planet hunters felt by 2040, nearest first,
// Fomalhaut's collisions, and the first star that could answer our messages. Beside each, how long a message takes to
// reach it, in play time, and its distance: what a call would cost. Picking one shows its path out from Sol in depth
// and opens what we measured of it.

/** How long a message takes to reach a star, one way, in play time, and under it how far it is: 1h 38m, 19.7 ly.
 *  Stacked, so on a phone the names keep their one line. */
const reach = (ly: number) => (
  <span className="flex flex-col items-end">
    <span>{span(ly)}</span>
    <span className="mt-[3px] text-[10px] text-muted/80">{ly.toFixed(1)} ly</span>
  </span>
);

/** The stars within 50 light-years from above, with Earth's leads lit as the dials say, each named. */
export function LeadsMap({
  dials,
  ids,
  system,
  onReady,
  className,
}: {
  dials: Dials;
  ids: string[];
  /** The system of the lead in view, which its Close View flies into, its worlds named there. */
  system?: System;
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
        const lead = ids.includes(id);
        const right = ring || x > (n.parentElement?.clientWidth ?? 0) / 2;
        n.style.transform = ring
          ? `translate(${x}px, ${y + 4}px) translate(-50%, 0)`
          : `translate(${x + (right ? 9 : -9)}px, ${y}px) translate(${right ? "0" : "-100%"}, -50%)`;
        n.style.opacity = String(a * (focus && lead && id !== focus ? 0.45 : 1));
      }
    },
    [dials, ids],
  );
  return (
    <SkyArt
      mode="leads"
      dials={dials}
      leads={ids}
      system={system}
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
      {system?.worlds.map((w, i) => (
        <span
          key={`w${i}`}
          ref={(n) => {
            names.current[`w${i}`] = n;
          }}
          className="pointer-events-none absolute top-0 left-0 font-mono text-[9px] whitespace-nowrap text-muted opacity-0"
        >
          {worldName(w)}
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
      <Face
        mark={<LeadMark art={l.art} />}
        tone={l.reply ? "text-other" : "text-you"}
        name={
          <>
            <b className="font-semibold">{l.what}</b> · {l.star}
          </>
        }
        line={
          read ? (
            <span className="text-ink">
              {isNew && (
                <span className="mr-1.5 rounded-full bg-you px-1.5 py-px font-mono text-[9px] tracking-[.08em] text-paper">NEW</span>
              )}
              {read.title}, Year {read.at}.
            </span>
          ) : (
            l.line
          )
        }
        right={reach(l.ly)}
      />
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
            <Link to={`/lead/${l.slug}`} {...peek(i)} className="block py-2.5 text-left">
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
                <span className={`shrink-0 self-center ${l.reply ? "text-other" : "text-you"}`}>
                  <LeadMark art={l.art} />
                </span>
                <span className="min-w-0 grow truncate text-[15px] leading-snug">
                  <b className="font-semibold">{l.what}</b> · {l.star}
                </span>
                <span className="shrink-0 font-mono text-[11px] text-muted tabular-nums">{reach(l.ly)}</span>
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
