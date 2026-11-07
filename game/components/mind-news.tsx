import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { kindOf } from "@/components/arrival";
import { useGame } from "@/components/game-provider";
import { useLeap } from "@/components/jump";
import { useKeepTalk, useMindNews } from "@/components/mind-chat";
import { MindNote } from "@/components/mind-note";
import { useSchedule } from "@/components/picks";
import { useLeads } from "@/components/scan";
import { readBuildOffer } from "@/lib/game/build-offer";
import { yearText, YEAR_0 } from "@/lib/game/clock";
import { buildSlug } from "@/lib/game/plan";
import type { Plan, Sent } from "@/lib/game/types";
import { readOffer, target } from "@/lib/game/sends";
import { useAccess } from "@/lib/key";
import { gsap, prefersReducedMotion, rise, riseFrom, useGSAP } from "@/lib/motion";
import type { Heard } from "@/lib/sim/types";
import { properGlows, WINDOWS } from "@/lib/game/leads";
import { moonSearchEnds, tourEnds } from "@/lib/sim/minds";

// The Mind speaks unasked. Pressing Begin felt like nothing happened, a playtest found 2026-10-31, so Year 0 opens on
// a moment of its own with the Mind's first words, and from then the Mind tells us what lands as it lands: a build
// done, a signal heard, a message of ours reaching its star. Its words are its own, asked of it as news from Earth,
// so they need the Mind open. Locked, Year 0 still has its moment, in words written here.

const BEGUN = "Year 0 has begun.";
/** The most news told at once, as after a night away or a skip. The rest is counted. */
const MOST = 6;

/** What landed after Year `from`, up to `to`, as news from Earth, or "" if nothing did. */
function newsBetween(from: number, to: number, plan: Plan | undefined, done: Record<string, number | null>, heard: Heard[], sent: Sent[], firstGlow?: { ranged?: number; range?: [number, number] }, watcher?: { by: string } | null, firstCold?: { seen: number; d: number; n: number }) {
  const within = (at: number | null | undefined): at is number => typeof at === "number" && at > from && at <= to;
  const named = new Set([...(plan?.builds ?? []), ...(plan?.later ?? []).map((o) => o.name)]);
  const items: { at: number; say: string }[] = [];
  for (const name of named) if (within(done[name])) items.push({ at: done[name]!, say: `our ${name} is done` });
  for (const h of heard) {
    const at = h.found ?? h.arrived;
    if (!within(at)) continue;
    if (h.ours) items.push({ at, say: `word from our colony: it chose to ${h.ours.chose}` });
    else {
      const text = h.text ? `, which reads: “${h.text.slice(0, 280)}”` : "";
      items.push({ at, say: `${kindOf(h).toLowerCase()} reached us from ${h.star}${h.found !== undefined ? ", found in old recordings" : ""}${text}` });
    }
  }
  // Our first warm glow, once placed. Later ones gather on Scan: there are hundreds. 2026-11-03.
  if (firstGlow?.range && within(firstGlow.ranged))
    items.push({ at: firstGlow.ranged!, say: `our first new warm glow, Warm glow 1, was ranged at ${firstGlow.range[0].toLocaleString("en-US")} to ${firstGlow.range[1].toLocaleString("en-US")} ly, where nothing shone before` });
  // Our first cold glow too: it came while the clock ran, no jump card named it, and a blind first-timer learned of it
  // only when the Mind compared Cold glow 2 to it. 2026-11-07.
  if (firstCold && within(firstCold.seen))
    items.push({ at: firstCold.seen, say: `our Halo Survey found its first cold glow, Cold glow ${firstCold.n}, beside a star ${Math.round(firstCold.d * 10) / 10} ly away` });
  // A search near Earth ending empty is news too: it rules places out. The Moon Search and the asteroid maps ended in
  // silence, and players wondered if they had run at all. Playtests 2026-11-06 and 2026-11-07.
  const searches = [
    { name: "Moon Search", by: "moon search", ends: moonSearchEnds, where: "the Moon’s L4 and L5 points, down to about 10 cm" },
    { name: "Asteroid Tour", by: "asteroid tour", ends: tourEnds, where: "the six asteroids that share Earth’s orbit" },
  ];
  for (const x of searches) {
    const built = done[x.name];
    if (built == null || !named.has(x.name) || watcher?.by === x.by) continue;
    const end = x.ends(built);
    if (within(end)) items.push({ at: end, say: `our ${x.name} ended and found nothing made at ${x.where}` });
  }
  // A reply window opening on one of the stars we messaged before Year 0. 2026-11-01.
  for (const w of WINDOWS) if (within(w.at)) items.push({ at: w.at, say: `the first window for a reply from ${w.star} opened` });
  // A message lands at a Year we can name only when its star's distance is known, not a range.
  for (const s of sent) {
    if (s.to === "everywhere" || s.d === undefined || target(s.to)?.range) continue;
    if (within(s.y + s.d)) items.push({ at: s.y + s.d, say: `our message to ${s.to} reached it` });
  }
  if (!items.length) return "";
  items.sort((a, b) => a.at - b.at);
  const told = items.slice(0, MOST).map((i) => `Year ${yearText(i.at)}: ${i.say}.`);
  if (items.length > MOST) told.push(`And ${items.length - MOST} more since.`);
  return told.join(" ");
}

/** Where the news points, read back from the lines `newsBetween` writes: a build done opens its page, and a star
 *  heard from, reached or with a window open opens its lead. So each note ends on something to do. 2026-11-02. */
function newsLinks(news: string, leads: { star: string; slug: string }[]) {
  const links: { to: string; label: string }[] = [];
  for (const [, name] of news.matchAll(/our (.+?) is done\./g)) links.push({ to: `/play/build/${buildSlug(name)}`, label: `See ${name}` });
  for (const [, star] of news.matchAll(/(?:reached us from|reply from|our message to) (.+?)(?:,| opened| reached)/g)) {
    const lead = leads.find((l) => l.star === star);
    if (lead && !links.some((k) => k.to === `/play/lead/${lead.slug}`)) links.push({ to: `/play/lead/${lead.slug}`, label: `Open ${star}` });
  }
  return links.slice(0, 2);
}

/** Always there: keeps our talk, and hands the Mind news as it lands, once each tenth of a Year, never twice. */
export function MindNews() {
  useKeepTalk();
  const { save, year, tell: told } = useGame();
  const open = useAccess();
  const { tell, busy } = useMindNews();
  const { done } = useSchedule();
  const { heard, known, minds } = useLeads();
  const firstGlow = minds?.flashes[0];
  const glows = minds?.glows;
  const firstCold = useMemo(() => {
    if (!glows?.length) return undefined;
    const i = glows.reduce((b, g, k) => (g.seen < glows[b].seen ? k : b), 0);
    return { seen: glows[i].seen, d: glows[i].d, n: i + 1 };
  }, [glows]);
  const tenth = year === null ? null : Math.floor(year * 10) / 10;
  const from = save?.told ?? 0;
  const will = save?.will;
  // The Will hears nothing while it crosses, and hears it all once it wakes.
  const dark = !!will && tenth !== null && tenth >= will.y && tenth < will.at;
  useEffect(() => {
    if (!save || tenth === null || tenth <= from || dark) return;
    // Locked, the Mind can't speak, and unlocking later doesn't bring old news.
    if (open === null) return told(tenth);
    // What we know must be read at this Year, so a signal isn't passed over before it loads. And the Mind finishes
    // what it is saying first.
    if (open === undefined || known !== tenth || busy) return;
    const news = newsBetween(from, tenth, save.plan, done, heard, save.sent ?? [], firstGlow, minds?.watcher, firstCold);
    told(tenth);
    if (news) tell(news);
  }, [save, tenth, from, dark, open, known, busy, done, heard, firstGlow, minds?.watcher, firstCold, told, tell]);
  return null;
}

/** The Mind's words without a card's line. */
const said = (text: string) => properGlows(readOffer(readBuildOffer(text).words).words);

/** Year 0's moment: once Begin is pressed, the screen turns to the start of our age, and the Mind's first words. */
export function YearZero() {
  const { save, year, read } = useGame();
  const open = useAccess();
  const { tell, last, words, news, busy, error } = useMindNews();
  const [on, setOn] = useState(false);
  const was = useRef(year);
  // Only on the press itself, never on a reload into a game under way.
  useEffect(() => {
    const now = year;
    if (was.current === null && now !== null && save?.beganAt && Date.now() - save.beganAt < 10_000) {
      setOn(true);
      if (open) tell(BEGUN);
    }
    was.current = now;
  }, [year, save?.beganAt, open, tell]);
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (!on || prefersReducedMotion()) return;
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(root.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 })
        .fromTo("[data-z=ring]", { scale: 0.2, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.6, stagger: 0.25, transformOrigin: "50% 50%" }, 0)
        .fromTo("[data-z=item]", riseFrom, { ...rise, stagger: 0.15 }, 0.5);
      gsap.to("[data-z=core]", { scale: 1.25, duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "50% 50%" });
    },
    { scope: root, dependencies: [on] },
  );
  useEffect(() => {
    if (!on) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });
  if (!on) return null;
  const ours = news === BEGUN;
  function close() {
    if (ours && last) read(last);
    setOn(false);
  }
  return (
    <div
      ref={root}
      role="dialog"
      aria-modal
      aria-label="Year 0"
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center overflow-y-auto bg-paper/80 px-4 backdrop-blur-[3px]"
    >
      <svg aria-hidden viewBox="-100 -100 200 200" className="w-[min(260px,60vw)]">
        {[92, 70, 48].map((r, i) => (
          <circle key={r} data-z="ring" r={r} fill="none" stroke="var(--you)" strokeOpacity={0.15 + i * 0.15} strokeWidth={0.8} />
        ))}
        <circle data-z="core" r={14} fill="var(--you)" fillOpacity={0.25} />
        <circle r={5} fill="var(--you)" />
      </svg>
      <p data-z="item" className="mt-4 font-mono text-[11px] tracking-[.14em] text-muted">
        {YEAR_0}
      </p>
      <h1 data-z="item" className="mt-1 text-[34px] leading-none font-medium tracking-tight">
        Year 0
      </h1>
      <div data-z="item" className="mt-6 w-full max-w-[440px]">
        <MindNote still={!busy} className="text-[15px] leading-[1.5]">
          <span aria-live="polite">
            {!open || (error && !ours)
              ? "The clock runs now, a Year every five minutes, even while we’re away. What we queued has started. We will tell you as it lands."
              : ours
                ? said(words) || "…"
                : "…"}
          </span>
        </MindNote>
      </div>
      <button data-z="item" onClick={close} className="mt-6 h-[46px] rounded-full bg-ink px-8 text-[15px] font-medium text-paper">
        Continue
      </button>
    </div>
  );
}

/** The Mind's words on what a jump brought, said inside its note on the jump, after `since`, its latest before it. Go on
 *  counts them as read, so they don't come again as a note of their own. 2026-11-04. */
export function useJumpWords(since: string | undefined) {
  const { save, read } = useGame();
  const { last, words, news, busy } = useMindNews();
  const fresh = !!last && news !== null && news !== BEGUN && last !== since && last !== save?.read;
  return { fresh, busy: fresh && busy, words: fresh ? said(words) : "", read: () => void (fresh && read(last)) };
}

/** What the Mind just told us unasked, over the map, until we read it or put it away. Not on the Mind tab, where the
 *  talk shows it. */
export function MindSays() {
  const { save, year, read } = useGame();
  const path = useLocation().pathname;
  const { last, words, news, busy } = useMindNews();
  const { leads } = useLeads();
  const [away, setAway] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  // During a jump these words sit in the note that tells it, one voice in one place. 2026-11-04.
  const leap = useLeap();
  const shown = !leap && year !== null && !!last && news !== null && news !== BEGUN && last !== save?.read && last !== away && path !== "/play/mind";
  useGSAP(
    () => {
      if (shown && !prefersReducedMotion()) gsap.fromTo(root.current, riseFrom, rise);
    },
    { dependencies: [shown, last] },
  );
  if (!shown) return null;
  return (
    <div
      ref={root}
      role="status"
      className="absolute bottom-3 left-2.5 z-20 w-[min(420px,calc(100%-20px))] rounded-xl border border-faint bg-paper/90 pt-2 pr-2 backdrop-blur-sm"
    >
      <button onClick={() => setAway(last)} aria-label="Put away" className="absolute top-0 right-0 z-10 flex size-9 items-center justify-center text-muted hover:text-ink">
        <svg aria-hidden width="10" height="10" viewBox="0 0 12 12">
          <path d="M1.5 1.5l9 9m0-9l-9 9" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>
      <MindNote still={!busy} edge={false} className="pr-6 text-[13.5px] leading-[1.45]">
        <p className="mb-1 font-mono text-[10px] leading-snug tracking-[.06em] text-muted">{properGlows(news)}</p>
        {said(words) || "…"}
        <span className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]">
          {newsLinks(news, leads).map((k) => (
            <Link key={k.to} to={k.to} onClick={() => read(last)} className="font-medium text-you hover:underline">
              {k.label} ›
            </Link>
          ))}
          <Link to="/play/mind" onClick={() => read(last)} className="text-you hover:underline">
            Reply ›
          </Link>
        </span>
      </MindNote>
    </div>
  );
}

/** Whether the Mind has said something we haven't read, for the Mind tab's mark. */
export function useMindUnread() {
  const { save } = useGame();
  const { last, news, busy } = useMindNews();
  return !busy && !!last && news !== null && last !== save?.read;
}
