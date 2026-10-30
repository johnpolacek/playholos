import { Link } from "react-router";
import { useSchedule } from "@/components/picks";
import { strikesOf } from "@/lib/game/reach";
import { BULLET } from "@/lib/sim/conflict";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useGame } from "@/components/game-provider";
import { SkyArt } from "@/components/sky";
import { LeadMark } from "@/components/marks";
import { Face } from "@/components/tab-head";
import type { Dials, Mark, Show } from "@/lib/drift";
import { span, YEAR_0, lyOf, yearText } from "@/lib/game/clock";
import { target, WATCHER } from "@/lib/game/sends";
import { type Lead, lineAt, type Reading, starName } from "@/lib/game/leads";
import { type System, worldName } from "@/lib/game/systems";
import { placeLabel } from "@/components/place-label";

// Earth's leads, drawn for Scan. The stars within 50 light-years from above, and Earth's real leads lit, each with a
// thread out from Sol: a world on a stretched orbit, every world the planet hunters felt by 2040, nearest first,
// and the first star that could answer our messages. Beside each, how long a message takes to
// reach it, in play time, and its distance: what a call would cost. Picking one shows its path out from Sol in depth
// and opens what we measured of it.

/** How long a message takes to reach a star, one way, in play time, and under it how far it is: 1h 38m, 19.7 ly.
 *  Stacked, so on a phone the names keep their one line. A range where Earth has one, and what is here at home said
 *  so. 2026-10-30. */
const reach = (l: Lead) => (
  <span className="flex flex-col items-end">
    <span>{l.art.kind === "near" ? "here" : l.range ? `${span(l.range[0])} to ${span(l.range[1])}` : span(l.ly)}</span>
    <span className="mt-[3px] text-[10px] text-muted/80">
      {l.art.kind === "near" ? "by Earth" : l.range ? `${lyOf(l.range[0])} to ${lyOf(l.range[1])}` : lyOf(l.ly)}{l.art.kind === "near" ? "" : " ly"}
    </span>
  </span>
);

/** The stars within 50 light-years from above, with Earth's leads lit as the dials say, each named. */
export function LeadsMap({
  dials,
  ids,
  system,
  life,
  onReady,
  className,
}: {
  dials: Dials;
  ids: string[];
  /** The Mind's word that something lives at each lead, by its place in ids, as ODDS counts it. -1 for none. */
  life: number[];
  /** The system of the lead in view, which its Close View flies into, its worlds named there. */
  system?: System;
  onReady(flight: number): void;
  className: string;
}) {
  const names = useRef<Record<string, HTMLSpanElement | null>>({});
  // What we sent in play, drawn as it goes. The lists are filled in place, so the map reads them each frame and a new
  // message never turns the camera. The dials carry the year. 2026-10-26.
  const { save, year } = useGame();
  const [sent] = useState<NonNullable<Show["sent"]>>(() => []);
  const [calls] = useState<NonNullable<Show["calls"]>>(() => []);
  const [theirs] = useState<NonNullable<Show["theirCalls"]>>(() => []);
  // The Mind's word on life at each lead, filled in place, so a reading landing brightens its lead without a new scene.
  const [warm] = useState<number[]>(() => []);
  useEffect(() => void warm.splice(0, warm.length, ...life), [warm, life]);
  useEffect(() => void Object.assign(dials, { year: YEAR_0 + (year ?? 0) }), [dials, year]);
  useEffect(() => {
    const list = save?.sent ?? [];
    sent.splice(0, sent.length, ...list.flatMap((m) => {
      // A knock on the watcher stays home: the map has no line to draw for it. 2026-10-30.
      const t = m.to === "everywhere" ? null : target(m.to);
      return t && t !== WATCHER ? [{ name: t.name, ra: t.ra, dec: t.dec, ly: t.d, sent: YEAR_0 + m.y }] : [];
    }));
    calls.splice(0, calls.length, ...list.filter((m) => m.to === "everywhere").map((m) => ({
      sent: YEAR_0 + m.y,
      until: m.repeat ? (m.stopped === undefined ? null : YEAR_0 + m.stopped) : YEAR_0 + m.y + 1 / 365,
      reach: m.reach!,
      once: !m.repeat,
    })));
  }, [save?.sent, sent, calls]);
  const tenth = year === null ? null : Math.floor(year * 10) / 10;
  // A strike's flash, as a ring of its light spreading: one on Earth from Sol as it lands, and ours from its star once
  // that light has reached us. 2026-10-28.
  const { hits, scale } = useSchedule();
  const plan = save?.plan;
  useEffect(() => {
    const onUs = hits.filter((h) => !h.screened).map((h) => ({ name: "Earth", ra: 0, dec: 0, ly: 0, sent: YEAR_0 + h.lands, flash: true }));
    const ours = (plan ? strikesOf(plan, scale) : []).flatMap((s) => {
      const t = target(s.star);
      const lands = s.fired === null || !t ? null : s.fired + t.d / BULLET.v;
      return lands !== null && tenth !== null && lands + t!.d <= tenth ? [{ name: t!.name, ra: t!.ra, dec: t!.dec, ly: t!.d, sent: YEAR_0 + lands, flash: true }] : [];
    });
    theirs.splice(0, theirs.length, ...onUs, ...ours);
  }, [tenth, theirs, hits, plan, scale]);
  const named = [...new Set(sent.map((m) => m.name))].filter((n) => !ids.includes(n));
  const onMarks = useCallback(
    (marks: Mark[]) => {
      const focus = ids[(dials.focus ?? 0) - 1];
      // Leads and Sol first, then what we sent, then calls and flashes, and the rings' distances last, so the
      // later give way.
      const rank = (id: string) => (ids.includes(id) || id === "Sol" ? 0 : id.startsWith("sent:") ? 1 : id.startsWith("ring:") ? 3 : 2);
      // The LEADS chip sits at the top left, and covered Gaia BH1's name there until 2026-10-30.
      const taken: Parameters<typeof placeLabel>[4] = [{ l: 0, t: 0, r: 76, b: 36 }];
      for (const { id, x, y, a } of [...marks].sort((p, q) => rank(p.id) - rank(q.id))) {
        const n = names.current[id];
        if (!n) continue;
        if (a <= 0) { n.style.opacity = "0"; continue; }
        const ring = id.startsWith("ring:") || id.startsWith("call:") || (id.startsWith("theirs:") && theirs[Number(id.slice(7))]?.ly === 0);
        const lead = ids.includes(id);
        const clear = placeLabel(n, x, y, ring ? (id.startsWith("call:") ? 16 : 4) : null, taken);
        // A lead's name stays, faint, where it can't be clear. Any other gives way whole: a star we sent to sat over
        // Proxima Centauri's name until 2026-10-30.
        n.style.opacity = String(a * (lead || id === "Sol" ? clear : clear === 1 ? 1 : 0) * (focus && lead && id !== focus ? 0.45 : 1));
      }
    },
    [dials, ids, theirs],
  );
  return (
    <SkyArt
      mode="leads"
      dials={dials}
      leads={ids}
      sent={sent}
      calls={calls}
      theirCalls={theirs}
      life={warm}
      system={system}
      onReady={onReady}
      onMarks={onMarks}
      className={className}
    >
      {calls.map((c, i) => (
        <span
          key={`call:${i}`}
          ref={(el) => {
            names.current[`call:${i}`] = el;
          }}
          className="pointer-events-none absolute top-0 left-0 font-mono text-[9px] whitespace-nowrap text-you opacity-0"
        >
          {`our call · ${Math.max(0, YEAR_0 + (year ?? 0) - c.sent).toFixed(1)} ly${c.once ? ", sent once" : c.until === null ? "" : ", stopped"}`}
        </span>
      ))}
      {theirs.map((c, i) => (
        <span
          key={`theirs:${i}`}
          ref={(el) => {
            names.current[`theirs:${i}`] = el;
          }}
          className="pointer-events-none absolute top-0 left-0 font-mono text-[9px] whitespace-nowrap text-other opacity-0"
        >
          {c.flash
            ? `${c.name === "Earth" ? "the strike on Earth" : `our strike on ${c.name}`}, its flash · ${Math.max(0, YEAR_0 + (year ?? 0) - c.sent).toFixed(1)} ly out`
            : `${c.name}’s call · ${Math.max(0, YEAR_0 + (year ?? 0) - c.sent).toFixed(1)} ly`}
        </span>
      ))}
      {named.map((n) => (
        <span
          key={`sent:${n}`}
          ref={(el) => {
            names.current[`sent:${n}`] = el;
          }}
          className="pointer-events-none absolute top-0 left-0 font-mono text-[9px] whitespace-nowrap text-you opacity-0"
        >
          {n}
        </span>
      ))}
      {[...ids, "Sol", "ring:10", "ring:20", "ring:30", "ring:40"].map((id) => (
        <span
          key={id}
          ref={(n) => {
            names.current[id] = n;
          }}
          className={`pointer-events-none absolute top-0 left-0 font-mono text-[9px] whitespace-nowrap opacity-0 ${id === "Luyten's Star" ? "text-other" : id.startsWith("ring:") || id === "Sol" ? "text-muted" : "text-you"}`}
        >
          {id.startsWith("ring:") ? `${id.slice(5)} ly` : starName(id)}
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
  const { year } = useGame();
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
            <b className="font-semibold">{starName(l.star)}</b> · {l.what}
          </>
        }
        line={
          read ? (
            <span className="text-ink">
              {isNew && (
                <span className="mr-1.5 rounded-full bg-you px-1.5 py-px font-mono text-[9px] tracking-[.08em] text-paper">NEW</span>
              )}
              {read.title}, Year {yearText(read.at)}.
            </span>
          ) : (
            lineAt(l, year)
          )
        }
        right={reach(l)}
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
                  <b className="font-semibold">{starName(l.star)}</b> · {l.what}
                </span>
                <span className="shrink-0 font-mono text-[11px] text-muted tabular-nums">{reach(l)}</span>
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
                    <p className="text-[13.5px] leading-snug text-page-ink2">{lineAt(l, year)}</p>
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
