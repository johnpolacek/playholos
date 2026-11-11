import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
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
import { properGlows, starName, WINDOWS } from "@/lib/game/leads";
import { moonSearchEnds, tourEnds } from "@/lib/sim/minds";
import { type NewsItem, pickNews, unquoted } from "@/lib/mind/news";

// The Mind speaks unasked. Pressing Begin felt like nothing happened, a playtest found 2026-10-31, so Year 0 opens on
// a moment of its own with the Mind's first words, and from then the Mind tells us what lands as it lands: a build
// done, a signal heard, a message of ours reaching its star. Its words are its own, asked of it as news from Earth,
// so they need the Mind open. Locked, Year 0 still has its moment, in words written here.

const BEGUN = "Year 0 has begun.";
/** The most news told at once, as after a night away or a skip. Those that matter most are told, and the rest counted. */
const MOST = 6;

/** What landed after Year `from`, up to `to`, as news from Earth, or "" if nothing did. */
function newsBetween(from: number, to: number, plan: Plan | undefined, done: Record<string, number | null>, heard: Heard[], sent: Sent[], firstGlow?: { ranged?: number; range?: [number, number] }, watcher?: { by: string } | null, firstCold?: { seen: number; d: number; n: number }) {
  const within = (at: number | null | undefined): at is number => typeof at === "number" && at > from && at <= to;
  const named = new Set([...(plan?.builds ?? []), ...(plan?.later ?? []).map((o) => o.name)]);
  // How much each matters, 0 most: what we hear, then what we find, then our own work, then our messages arriving.
  const items: NewsItem[] = [];
  for (const name of named) if (within(done[name])) items.push({ at: done[name]!, say: `our ${name} is done`, rank: 2 });
  for (const h of heard) {
    const at = h.found ?? h.arrived;
    if (!within(at)) continue;
    if (h.ours) items.push({ at, say: `word from our colony: it chose to ${h.ours.chose}`, rank: 0 });
    else {
      const text = h.text ? `, which reads: “${h.text.slice(0, 280)}”` : "";
      items.push({ at, say: `${kindOf(h).toLowerCase()} reached us from ${h.star}${h.found !== undefined ? ", found in old recordings" : ""}${text}`, rank: 0 });
    }
  }
  // Our first warm glow, once placed. Later ones gather on Scan: there are hundreds. 2026-11-03.
  if (firstGlow?.range && within(firstGlow.ranged))
    items.push({ at: firstGlow.ranged!, say: `our first new warm glow, Warm glow 1, was ranged at ${firstGlow.range[0].toLocaleString("en-US")} to ${firstGlow.range[1].toLocaleString("en-US")} ly, where nothing shone before`, rank: 1 });
  // Our first cold glow too: it came while the clock ran, no jump card named it, and a blind first-timer learned of it
  // only when the Mind compared Cold glow 2 to it. 2026-11-07.
  if (firstCold && within(firstCold.seen))
    items.push({ at: firstCold.seen, say: `our Halo Survey found its first cold glow, Cold glow ${firstCold.n}, beside a star ${Math.round(firstCold.d * 10) / 10} ly away`, rank: 1 });
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
    if (within(end)) items.push({ at: end, say: `our ${x.name} ended and found nothing made at ${x.where}`, rank: 2 });
  }
  // A reply window opening on one of the stars we messaged before Year 0. 2026-11-01.
  for (const w of WINDOWS) if (within(w.at)) items.push({ at: w.at, say: `the first window for a reply from ${w.star} opened`, rank: 1 });
  // A message lands at a Year we can name only when its star's distance is known, not a range.
  for (const s of sent) {
    if (s.to === "everywhere" || s.d === undefined || target(s.to)?.range) continue;
    if (within(s.y + s.d)) items.push({ at: s.y + s.d, say: `our message to ${s.to} reached it`, rank: 3 });
  }
  if (!items.length) return "";
  const { told, more } = pickNews(items, MOST);
  const lines = told.map((i) => `Year ${yearText(i.at)}: ${i.say}.`);
  if (more) lines.push(`And ${more} more since.`);
  return lines.join(" ");
}

/** Where the news points, read back from the lines `newsBetween` writes: a build done opens its page, and a star
 *  heard from, reached or with a window open opens its lead. So each note ends on something to do. 2026-11-02. A
 *  search ended opens its build, a glow or any lead's star named opens its lead, word from our colony opens the lead
 *  where it lives, and a message reaching a star with no lead opens our messages. News of each sat with no way to it.
 *  2026-11-08. */
function newsLinks(told: string, leads: { star: string; slug: string }[], colony?: string) {
  // From Earth's words, never a signal's: a stranger's words naming a star linked to it. 2026-11-08.
  const news = unquoted(told);
  const links: { to: string; label: string; at: number; lead?: string }[] = [];
  const add = (to: string, label: string, at: number, lead?: string) => !links.some((k) => k.to === to) && links.push({ to, label, at, lead });
  const open = (lead: { star: string; slug: string }, at: number) => add(`/play/lead/${lead.slug}`, `Open ${starName(lead.star)}`, at, lead.slug);
  for (const m of news.matchAll(/our ([^.:,“”]+?) (?:is done|ended and found)/g)) add(`/play/build/${buildSlug(m[1])}`, `See ${m[1]}`, m.index);
  for (const m of news.matchAll(/(?:reached us from|reply from|our message to) (.+?)(?:,| opened| reached)/g)) {
    const lead = leads.find((l) => l.star === m[1]);
    if (lead) open(lead, m.index);
    else if (m[0].startsWith("our message to")) add("/play#messages", "See our messages", m.index);
  }
  for (const m of news.matchAll(/\b(Warm|Cold) glow (\d+)\b/g)) {
    const lead = leads.find((l) => l.slug === `${m[1].toLowerCase()}-glow-${m[2]}`);
    if (lead) open(lead, m.index);
  }
  if (colony) {
    const at = news.indexOf("word from our colony");
    const lead = leads.find((l) => l.star === colony);
    if (at >= 0 && lead) open(lead, at);
  }
  // Any other lead whose star the news names, as a cold glow's beside a star.
  for (const lead of leads) {
    const at = news.search(new RegExp(`\\b${lead.star.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`));
    if (at >= 0) open(lead, at);
  }
  return links.sort((a, b) => a.at - b.at);
}

// The news a jump landed on. The Mind's words on it belong to the jump's card: they show there, and go with it when it
// is put away, come or not. Put away before they came, they opened a note of their own a few seconds on, over the
// map. Then they wait on the Mind tab, marked unread. Playtest 2026-11-10.
let jumpNews: string | null = null;
const heedJump = new Set<() => void>();
function setJumpNews(news: string) {
  jumpNews = news;
  heedJump.forEach((f) => f());
}
const useJumpNews = () =>
  useSyncExternalStore(
    (f) => (heedJump.add(f), () => void heedJump.delete(f)),
    () => jumpNews,
    () => null,
  );

/** Always there: keeps our talk, and hands the Mind news as it lands, once each tenth of a Year, never twice. */
export function MindNews() {
  useKeepTalk();
  const { save, year, tell: told } = useGame();
  // Our latest jump in this game, kept once its card is put away, so news it landed on is known as its own.
  const leap = useLeap();
  const seed = save?.seed;
  const jumped = useRef<{ seed?: number; from: number; to: number } | null>(null);
  useEffect(() => {
    if (leap) jumped.current = { seed, from: leap.from, to: leap.to };
  }, [leap, seed]);
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
    const jump = jumped.current?.seed === save.seed ? jumped.current : null;
    if (news && jump && tenth > jump.from && tenth <= jump.to + 1e-6) setJumpNews(news);
    if (news) tell(news);
  }, [save, tenth, from, dark, open, known, busy, done, heard, firstGlow, minds?.watcher, firstCold, told, tell]);
  return null;
}

/** The Mind's words without a card's line. */
const said = (text: string) => properGlows(readOffer(readBuildOffer(text).words).words);

/** While the Mind's first words are on their way: a line of light, rippling as a signal does, under three faint lines
 *  where the words will stand, brightening in turn. Asked for 2026-11-07: Year 0 sat on "…" for a while. */
function Gathering() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // Each dot repeats on its own, so the ripple keeps travelling down the line.
      gsap.to("[data-g=dot]", { y: -6, opacity: 1, duration: 0.55, ease: "sine.inOut", stagger: { each: 0.07, repeat: -1, yoyo: true } });
      gsap.to("[data-g=line]", { opacity: 0.35, duration: 0.9, ease: "sine.inOut", stagger: { each: 0.3, repeat: -1, yoyo: true } });
    },
    { scope: root },
  );
  return (
    <div ref={root} role="status" aria-label="The Mind is gathering its words" className="py-1">
      <div className="flex h-4 items-end gap-[5px]">
        {Array.from({ length: 22 }, (_, i) => (
          <span key={i} data-g="dot" className="size-[3px] rounded-full bg-you opacity-30" />
        ))}
      </div>
      <div className="mt-3 space-y-2">
        {[92, 84, 58].map((w) => (
          <div key={w} data-g="line" className="h-[9px] rounded-full bg-ink/10" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

/** Year 0's moment: once Begin is pressed, the screen turns to the start of our age, and the Mind's first words. */
export function YearZero() {
  const { save, year, read } = useGame();
  const open = useAccess();
  const { tell, last, words, news, handed, busy, error } = useMindNews();
  const [on, setOn] = useState(false);
  /** Year 0's news, not yet handed to the Mind. */
  const owed = useRef(false);
  const was = useRef(year);
  // Only on the press itself, never on a reload into a game under way.
  useEffect(() => {
    const now = year;
    if (was.current === null && now !== null && save?.beganAt && Date.now() - save.beganAt < 10_000) {
      setOn(true);
      owed.current = true;
    }
    was.current = now;
    // The Mind finishes what it is saying first, as with all its news. Told over a queue read still on its way, that
    // read's answer landed after Year 0's news and showed as its words, then the true words never showed. 2026-11-10.
    if (!owed.current || !open || busy) return;
    owed.current = false;
    tell(BEGUN);
  }, [year, save?.beganAt, open, busy, tell]);
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
  // A failure of what the Mind was saying before isn't Year 0's: its news is still to come.
  const failed = !!error && handed === BEGUN && !ours;
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
      className="fixed inset-0 z-[90] flex flex-col items-center overflow-y-auto bg-paper/80 px-4 pt-[max(32px,calc(50dvh-330px))] pb-8 backdrop-blur-[3px]"
    >
      {/* Anchored from the top, with room kept for the Mind's words, so nothing moves as they arrive. 2026-11-08. */}
      <svg aria-hidden viewBox="-100 -100 200 200" className="w-[min(260px,60vw)] shrink-0">
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
      <div data-z="item" className="mt-6 min-h-[168px] w-full max-w-[440px]">
        <MindNote still={!busy} className="text-[15px] leading-[1.5]">
          <span aria-live="polite">
            {!open || failed
              ? "The clock runs now, a Year every five minutes, even while we’re away, and it pauses when nothing is building. What we queued has started. We will tell you as it lands."
              : ours && said(words)
                ? said(words)
                : null}
          </span>
          {open && !failed && !(ours && said(words)) && <Gathering />}
        </MindNote>
      </div>
      <button data-z="item" onClick={close} className="mt-6 h-[46px] rounded-full bg-ink px-8 text-[15px] font-medium text-paper">
        Continue
      </button>
    </div>
  );
}

/** The Mind's words on what a jump brought, said inside its note on the jump, after `since`, its latest before it. Putting
 *  the note away counts them as read, so they don't come again as a note of their own. 2026-11-04. */
export function useJumpWords(since: string | undefined) {
  const { save, read } = useGame();
  const { last, words, news, handed, busy } = useMindNews();
  const jumpNews = useJumpNews();
  const fresh = !!last && news !== null && news !== BEGUN && last !== since && last !== save?.read;
  // Handed the jump's news and yet to speak: the card says words are coming, so the Will can wait for them.
  const coming = !fresh && busy && handed !== null && handed === jumpNews;
  return { fresh, coming, busy: (fresh || coming) && busy, words: fresh ? said(words) : "", read: () => void (fresh && read(last)) };
}

/** What the Mind just told us unasked, over the map, until we read it or put it away. Not on the Mind tab, where the
 *  talk shows it. Drawn by IdleNote, in its corner, when that has no word of its own. */
export function MindSays() {
  const { save, year, read } = useGame();
  const path = useLocation().pathname;
  const { last, words, news, busy } = useMindNews();
  const { leads, dials } = useLeads();
  const [away, setAway] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  // During a jump these words sit in the note that tells it, one voice in one place. 2026-11-04.
  const leap = useLeap();
  const jumpNews = useJumpNews();
  // Whole, once the Mind has said it: opened on its first word, the note grew a line at a time as it rose. 2026-11-10.
  const shown = !leap && !busy && year !== null && !!last && news !== null && news !== BEGUN && news !== jumpNews && last !== save?.read && last !== away && path !== "/play/mind";
  const colony = save?.plan?.colony?.name;
  const links = useMemo(() => (news ? newsLinks(news, leads, colony) : []), [news, leads, colony]);
  // On Scan's map, the first lead the news names is in view while the note shows, and put away it goes back. The map
  // sat on Earth under news of a star. 2026-11-08.
  const named = links.find((k) => k.lead)?.lead;
  useEffect(() => {
    if (!shown || path !== "/play" || !named) return;
    const i = leads.findIndex((l) => l.slug === named);
    if (i < 0) return;
    const before = dials.focus ?? 0;
    Object.assign(dials, { focus: i + 1 });
    return () => {
      if (dials.focus === i + 1) Object.assign(dials, { focus: before });
    };
  }, [shown, path, named, leads, dials]);
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
      className="absolute top-10 left-2.5 z-20 max-h-[calc(100%-3.5rem)] w-[min(400px,calc(100%-20px))] overflow-y-auto rounded-xl border border-faint bg-paper/90 pt-2 pr-2 backdrop-blur-sm"
    >
      <button onClick={() => setAway(last)} aria-label="Put away" className="absolute top-0 right-0 z-10 flex size-9 items-center justify-center text-muted hover:text-ink">
        <svg aria-hidden width="10" height="10" viewBox="0 0 12 12">
          <path d="M1.5 1.5l9 9m0-9l-9 9" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>
      <MindNote still edge={false} className="pr-6 text-[13.5px] leading-[1.45]">
        <p className="mb-1 font-mono text-[10px] leading-snug tracking-[.06em] text-muted">{properGlows(news)}</p>
        {said(words) || "…"}
        <span className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]">
          {links.slice(0, 2).map((k) => (
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
