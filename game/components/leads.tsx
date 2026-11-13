import { ChanceTag, chanceShift, isGlow } from "@/components/chances";
import { chancesOf } from "@/lib/game/chance";
import { Link } from "react-router";
import { useSchedule } from "@/components/picks";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useGame } from "@/components/game-provider";
import { SkyArt } from "@/components/sky";
import { LeadMark } from "@/components/marks";
import { Face, ListHead } from "@/components/tab-head";
import type { Standing } from "@/components/scan";
import type { Dials, Mark, Show } from "@/lib/drift";
import { span, YEAR_0, lyOf, yearText } from "@/lib/game/clock";
import { target, WATCHER } from "@/lib/game/sends";
import { type Lead, lineAt, type Reading, starName } from "@/lib/game/leads";
import { type System, worldName } from "@/lib/game/systems";
import { placeLabel } from "@/components/place-label";

const n = (x: number) => x.toLocaleString("en-US");

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
  quiet,
  notes,
  onReady,
  className,
}: {
  dials: Dials;
  ids: string[];
  /** Words after a lead's name on the map, by its id: a warm glow's distance. 2026-11-03. */
  notes?: Record<string, string>;
  /** 1 for each lead, by its place in ids, with nothing for us to do: once the calm dial rises it steps back to a dot,
   *  its name gone until pointed at. 2026-11-02. */
  quiet: number[];
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
  const [hush] = useState<number[]>(() => []);
  useEffect(() => void hush.splice(0, hush.length, ...quiet), [hush, quiet]);
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
  // A strike's flash on Earth, as a ring of its light spreading from Sol as it lands. 2026-10-28. Ours at their stars
  // went with our bullets, 2026-11-13.
  const { hits } = useSchedule();
  useEffect(() => {
    theirs.splice(0, theirs.length, ...hits.map((h) => ({ name: "Earth", ra: 0, dec: 0, ly: 0, sent: YEAR_0 + h.lands, flash: true })));
  }, [theirs, hits]);
  const named = [...new Set(sent.map((m) => m.name))].filter((n) => !ids.includes(n));
  // Where the pointer is over the map, so the lead under it is named, even one stepped back. A settled map showed dots
  // with no names and no way to learn them. Playtest 2026-11-03.
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const onMarks = useCallback(
    (marks: Mark[]) => {
      const focus = ids[(dials.focus ?? 0) - 1];
      const p = pointer.current;
      let pointed: string | null = null;
      let near = 18 * 18;
      if (p)
        for (const m of marks) {
          const d = (m.x - p.x) ** 2 + (m.y - p.y) ** 2;
          if (m.a > 0 && d < near && ids.includes(m.id)) [near, pointed] = [d, m.id];
        }
      // Over the Milky Way, only our warm glows and Sol are named: all else is a smudge round Sol. 2026-11-03.
      const warmName = (id: string) => /^Warm glow \d+$/.test(id);
      // Looking out at one warm glow, too: nearby stars' names would crowd Sol's.
      const wide = !!dials.wide || (!!focus && warmName(focus));
      const shining = (id: string) => warmName(id) && !dials.faded?.has(id);
      // Leads and Sol first, then what we sent, then calls and flashes, and the rings' distances last, so the
      // later give way.
      // A glow's name ranks after the other leads and gives way whole when crowded, unless in view: hundreds of glows
      // covered the map in a playtest, 2026-11-01.
      const glow = (id: string) => /^(Warm|Cold) glow \d+$/.test(id) && id !== focus && !(wide && shining(id));
      const rank = (id: string) => (id === pointed ? -1 : glow(id) ? 0.5 : ids.includes(id) || id === "Sol" ? 0 : id.startsWith("sent:") ? 1 : id.startsWith("ring:") ? 3 : 2);
      // The LEADS chip sits at the top left, and covered Gaia BH1's name there until 2026-10-30.
      const taken: Parameters<typeof placeLabel>[4] = [{ l: 0, t: 0, r: 76, b: 36 }];
      for (const { id, x, y, a } of [...marks].sort((p, q) => rank(p.id) - rank(q.id))) {
        const n = names.current[id];
        if (!n) continue;
        // In the Mind's shot, only the lead our talk is on and Sol are named, unless pointed at. 2026-11-04.
        const shot = !!dials.chart && !!focus && id !== focus && id !== pointed && id !== "Sol";
        if (a <= 0 || shot || (wide && id !== focus && id !== pointed && id !== "Sol" && !warmName(id))) { n.style.opacity = "0"; continue; }
        if (id === pointed) {
          placeLabel(n, x, y, null, taken);
          n.style.opacity = String(a);
          continue;
        }
        const ring = id.startsWith("ring:") || id.startsWith("call:") || (id.startsWith("theirs:") && theirs[Number(id.slice(7))]?.ly === 0);
        const lead = ids.includes(id) && !glow(id);
        if (id === "Sol") n.style.color = wide ? "var(--ink)" : "";
        const clear = placeLabel(n, x, y, ring ? (id.startsWith("call:") ? 16 : 4) : null, taken);
        // A lead's name stays, faint, where it can't be clear. Any other gives way whole: a star we sent to sat over
        // Proxima Centauri's name until 2026-10-30.
        // A quiet lead's name goes as the map calms, unless it is the one in view.
        const back = id !== focus && !(wide && warmName(id)) && hush[ids.indexOf(id)] ? (dials.calm ?? 0) : 0;
        n.style.opacity = String(a * (1 - back) * (id === "Sol" && wide ? Math.max(clear, 0.9) : lead || id === "Sol" ? clear : clear === 1 ? 1 : 0) * (focus && ids.includes(id) && id !== focus ? 0.45 : 1) * (wide && warmName(id) && !shining(id) ? 0.6 : 1));
      }
    },
    [dials, ids, theirs, hush],
  );
  return (
    <div
      className={className}
      onPointerMove={(e) => {
        const box = e.currentTarget.getBoundingClientRect();
        pointer.current = { x: e.clientX - box.left, y: e.clientY - box.top };
      }}
      onPointerLeave={() => void (pointer.current = null)}
    >
    <SkyArt
      mode="leads"
      dials={dials}
      leads={ids}
      sent={sent}
      calls={calls}
      theirCalls={theirs}
      life={warm}
      hush={hush}
      system={system}
      onReady={onReady}
      onMarks={onMarks}
      className="absolute inset-0"
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
            ? `the strike on Earth, its flash · ${Math.max(0, YEAR_0 + (year ?? 0) - c.sent).toFixed(1)} ly out`
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
          className={`pointer-events-none absolute top-0 left-0 font-mono text-[9px] whitespace-nowrap opacity-0 ${id.startsWith("ring:") || id === "Sol" ? "text-muted" : /^Warm glow \d+$/.test(id) ? "rounded-sm bg-paper/80 px-1 text-[10px] text-other" : "text-you"}`}
        >
          {id.startsWith("ring:") ? `${id.slice(5)} ly` : starName(id)}
          {notes?.[id] && ` · ${notes[id]}`}
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
    </div>
  );
}

/** What the map's marks mean, drawn as the map draws them: a lead on its drop to the Galaxy's plane, a thread from
 *  Sol, and a message of ours on its way. Dots and lines with no key left the Will guessing. Playtest 2026-11-03. */
export function MapKey({ className = "" }: { className?: string }) {
  return (
    <div aria-label="Map key" className={`pointer-events-none flex flex-col gap-1 rounded-md bg-paper/70 px-2 py-1.5 font-mono text-[9.5px] text-muted backdrop-blur-[2px] ${className}`}>
      <span className="flex items-center gap-2">
        <svg aria-hidden width="18" height="12" viewBox="0 0 18 12">
          <line x1="9" y1="3" x2="9" y2="11" stroke="var(--muted)" strokeWidth="1" />
          <circle cx="9" cy="3" r="2.2" fill="var(--you)" />
          <circle cx="9" cy="11" r="0.9" fill="var(--muted)" />
        </svg>
        a lead, dropped to the plane
      </span>
      <span className="flex items-center gap-2">
        <svg aria-hidden width="18" height="12" viewBox="0 0 18 12">
          <line x1="2" y1="10" x2="16" y2="2" stroke="var(--you)" strokeOpacity="0.6" strokeWidth="1" />
          <circle cx="2" cy="10" r="1.8" fill="var(--ink)" />
        </svg>
        from Sol: a thread, or our message
      </span>
      <span className="text-muted/80">Point at a star for its name</span>
    </div>
  );
}

/** What the words mean, where a player first meets them. Asked for in play, 2026-11-03. */
/** The same for cold glows, shown as their row opens. 2026-11-07. */
const COLD_WORDS = <p className="mt-1 mb-1.5 text-[13px] leading-snug text-page-ink2">A cold glow is how an old mind might look: faint heat beside a star, far colder than any planet, from thinking done far out where the cold makes it cheap. Most are odd dust.</p>;

const GLOW_WORDS = <p className="mt-1.5 text-[13px] leading-snug text-page-ink2">A warm glow is warmth where nothing shone before. Dust can do this, and so can a mind building around its star. Dust fades.</p>;

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
  standing,
  readable,
  headClass = "",
}: {
  leads: Lead[];
  dials: Dials;
  fold?: boolean;
  readings?: Record<string, Reading[]>;
  fresh?: Set<string>;
  /** Warm glows we could order a Close Reading of now, each row saying so. 2026-11-04. */
  readable?: Lead[];
  /** Where each lead stands, by slug: the list splits on it. Quiet folds shut. 2026-11-02. */
  standing?: Record<string, Standing>;
  headClass?: string;
}) {
  const { year, save } = useGame();
  // Glows we have messaged keep their own rows. 2026-11-01.
  const messaged = new Set((save?.sent ?? []).map((m) => m.to));
  // The lead in view: the one the Will points at, or else the one they picked, which stays until picked again.
  const [picked, setPicked] = useState<number | null>(null);
  const [peeked, setPeeked] = useState<number | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [quietOpen, setQuietOpen] = useState(false);
  const shown = peeked ?? picked;
  // The focus held before a row was pointed at, put back when the pointer leaves: leaving set it to none, and wiped the
  // lead a jump's card had turned the map to. 2026-11-08.
  const before = useRef<number | null>(null);
  const look = (peek: number | null, pick = picked) => {
    if (peek !== null && before.current === null) before.current = dials.focus ?? 0;
    setPeeked(peek);
    Object.assign(dials, { focus: peek !== null ? peek + 1 : pick !== null ? pick + 1 : (before.current ?? 0) });
    if (peek === null) before.current = null;
  };
  const pick = (i: number | null) => {
    setPicked(i);
    look(null, i);
  };

  const chance = (l: Lead) => {
    const c = chancesOf(l, readings[l.slug] ?? []);
    return c && !(c.mind === "unknown" && !c.life) ? chanceShift(null, c, isGlow(l)) : null;
  };
  const row = (l: Lead) => {
    const read = readings[l.slug]?.at(-1);
    const isNew = !!read && !!fresh?.has(read.id);
    // A warm glow is gold, on the list as on the map: our hottest kind of lead. Dimmer once faded. 2026-11-03.
    const warm = l.art.kind === "warm";
    const faded = warm && l.facts.some(([k, v]) => k === "Faded" || (k === "Its light" && v.startsWith("Dust")));
    return (
      <Face
        mark={<LeadMark art={l.art} />}
        tone={faded ? "text-other/60" : warm || l.reply ? "text-other" : "text-you"}
        name={
          <>
            <b className={`font-semibold ${faded ? "text-other/70" : warm ? "text-other" : ""}`}>{starName(l.star)}</b> · {l.what}
          </>
        }
        line={
          <>
            {read ? (
              <span className="text-ink">
                {isNew && (
                  <span className="mr-1.5 rounded-full bg-you px-1.5 py-px font-mono text-[9px] tracking-[.08em] text-paper">NEW</span>
                )}
                {read.title}, Year {yearText(read.at)}.
              </span>
            ) : (
              lineAt(l, year)
            )}
            {/* Our chance at it, on its row: the main thing about a world sat on its page, below the fold. 2026-11-07. */}
            {chance(l) && <ChanceTag shift={chance(l)} className="mt-0.5 block" />}
            {readable?.includes(l) && <span className="mt-0.5 block font-medium text-other">Ready for a Close Reading</span>}
          </>
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

  if (!fold) {
    const link = (l: Lead, i: number) => (
      <Link to={`/play/lead/${l.slug}`} {...peek(i)} className="block py-2.5 text-left">
        {row(l)}
      </Link>
    );
    // Cold glows our craft hasn't seen up close gather in one row, where the first stood. The Halo Survey finds
    // hundreds, and they buried the watcher and the strike. Playtest 2026-11-01. Faded warm glows we haven't messaged
    // gather too: the Warm Sky Watch finds hundreds over the Years. Playtest 2026-11-01, 464 by Year 34,944.
    const unread = (l: Lead) => !(fresh && readings[l.slug]?.some((r) => fresh.has(r.id)));
    const has = (l: Lead, fact: string) => l.facts.some(([k]) => k === fact);
    const glows = [
      {
        key: "cold-glows",
        title: "Cold glows",
        // Said as the odds have it, and that each can wait: a blind first-timer learned only from the Mind that these
        // could be let pass. 2026-11-07, the Will's call.
        line: (latest: Lead) => `Most are odd dust. The rare one could be an old mind. Each can wait, or a sentinel there would tell us. The latest, ${starName(latest.star)}.`,
        test: (l: Lead) => l.slug.startsWith("cold-glow-") && !has(l, "Up close") && !has(l, "Resolved") && unread(l),
      },
      {
        key: "faded-glows",
        title: "Faded warm glows",
        line: (latest: Lead) => `Each shone a few centuries, then dimmed. The latest, ${starName(latest.star)}.`,
        test: (l: Lead) => l.slug.startsWith("warm-glow-") && has(l, "Faded") && !messaged.has(l.star) && unread(l),
      },
    ];
    // Quiet leads whose latest reading says the same gather too: six worlds read "Too close to its star to split" in
    // a row. Playtest 2026-11-02.
    const latest = (l: Lead) => readings[l.slug]?.at(-1)?.title;
    const said = [...new Set(leads.map(latest))].flatMap((title) =>
      title
        ? [{
            key: `said:${title}`,
            title,
            line: (_: Lead, all: Lead[]) => `${all.slice(0, 3).map((c) => starName(c.star)).join(", ")}${all.length > 3 ? ` and ${all.length - 3} more` : ""}.`,
            test: (l: Lead) => latest(l) === title && !glows.some((g) => g.test(l)),
          }]
        : [],
    );
    const stand = (l: Lead) => standing?.[l.slug] ?? "quiet";
    const groups = [...glows, ...said].map((g) => ({ ...g, members: leads.filter((l) => stand(l) === "quiet" && g.test(l)) }));
    const groupOf = (l: Lead) => (stand(l) === "quiet" ? groups.find((g) => g.members.length > 1 && g.test(l)) : undefined);
    const rows = (part: Standing) =>
      leads.map((l, i) => {
        if (stand(l) !== part) return null;
        const g = groupOf(l);
        if (!g)
          return (
            <li key={l.star} className="border-t border-faint">
              {link(l, i)}
            </li>
          );
        if (l !== g.members[0]) return null;
        const open = openGroup === g.key;
        return (
          <li key={g.key} className="border-t border-faint">
            <button onClick={() => setOpenGroup(open ? null : g.key)} aria-expanded={open} className="block w-full py-2.5 text-left">
              <Face
                mark={<LeadMark art={l.art} />}
                tone="text-you"
                name={
                  <>
                    <b className="font-semibold">{g.title}</b> · {n(g.members.length)}
                  </>
                }
                line={g.line(g.members.at(-1)!, g.members)}
                right={
                  <span className="flex flex-col items-end">
                    <span>
                      {lyOf(Math.min(...g.members.map((c) => c.range?.[0] ?? c.ly)))} to {lyOf(Math.max(...g.members.map((c) => c.range?.[1] ?? c.ly)))}
                    </span>
                    <span className="mt-[3px] text-[10px] text-muted/80">ly</span>
                  </span>
                }
                more={false}
              />
            </button>
            {open && g.key === "cold-glows" && <div className="pl-5">{COLD_WORDS}</div>}
            {open && (
              <ul className="mb-1 flex flex-col pl-5">
                {leads.map((c, j) => g.members.includes(c) && <li key={c.star} className="border-t border-faint">{link(c, j)}</li>)}
              </ul>
            )}
          </li>
        );
      });
    const count = (part: Standing) => leads.filter((l) => stand(l) === part).length;
    const needs = count("needs");
    const watching = count("watching");
    const waiting = count("waiting");
    const quiet = count("quiet");
    return (
      <>
        {/* Only a choice needs us: a glow to read, or the watcher. A new reading alone is news to read. "Needs us · 3"
            listed three new worlds with nothing to decide, under a note saying nothing needs us. Blind playtest 2026-11-07. */}
        <ListHead
          left={`${readable?.length || leads.some((l) => l.slug === "small-dark-body" && stand(l) === "needs") ? "Needs us" : "New to read"} · ${needs}`}
          right="Reached in"
          className={headClass}
        />
        {needs ? (
          <>
            <ul className="mt-1 flex flex-col">{rows("needs")}</ul>
            {readable?.length ? GLOW_WORDS : null}
          </>
        ) : (
          <p className="mt-1 border-t border-faint py-2.5 text-[13.5px] text-page-ink2">Nothing new to read.</p>
        )}
        {watching > 0 && (
          <>
            <ListHead left={`Warm glows, still shining · ${watching}`} right="" className="mt-5" />
            {!readable?.length && GLOW_WORDS}
            <ul className="mt-1 flex flex-col">{rows("watching")}</ul>
          </>
        )}
        {waiting > 0 && (
          <>
            <ListHead left={`Waiting · ${waiting}`} right="" className="mt-5" />
            <ul className="mt-1 flex flex-col">{rows("waiting")}</ul>
          </>
        )}
        {quiet > 0 && (
          <>
            <button
              onClick={() => setQuietOpen(!quietOpen)}
              aria-expanded={quietOpen}
              className="mt-5 flex w-full items-baseline justify-between pr-5 text-left font-mono text-[10px] tracking-[.1em] text-muted uppercase hover:text-ink"
            >
              <span>Quiet · {quiet}</span>
              <span className={`transition-transform duration-300 ${quietOpen ? "rotate-90" : ""}`}>›</span>
            </button>
            {quietOpen ? (
              <ul className="mt-1 flex flex-col">{rows("quiet")}</ul>
            ) : (
              <p className="mt-1 border-t border-faint py-2.5 text-[13.5px] text-page-ink2">Nothing for us to do at these yet.</p>
            )}
          </>
        )}
      </>
    );
  }

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
