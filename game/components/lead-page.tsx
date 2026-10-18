import { Link, useNavigate } from "react-router";
import { useEffect, useRef } from "react";
import { useGame } from "@/components/game-provider";
import { LeadArt } from "@/components/lead-art";
import { useLeads } from "@/components/scan";
import { realTime } from "@/lib/game/clock";
import { ODDS, type Odds } from "@/lib/game/leads";
import { gsap, prefersReducedMotion, rise, riseFrom, useGSAP } from "@/lib/motion";

// One lead, as a report: drawn, then what we measured, what it could be with the Mind's word for each, and what would
// tell us. Its latest reading, once one lands, comes first, and the words it moved show what they were. The map flies
// to its star while it is open, and back out when we leave. Asking the Mind is the last step.

/** The Mind's word, on its seven-step scale. A word a reading moved shows where it was, ringed, and what it was. */
function Scale({ odds, was }: { odds: Odds; was?: Odds }) {
  const at = ODDS.indexOf(odds);
  const from = was && was !== odds ? ODDS.indexOf(was) : -1;
  return (
    <span className="flex shrink-0 items-center gap-2">
      <span className="flex gap-[3px]" aria-hidden>
        {ODDS.map((o, i) => (
          <span
            key={o}
            className={`h-[7px] w-[7px] rounded-full ${i <= at ? "bg-you" : "bg-track"} ${i === from ? "ring-1 ring-ink ring-offset-1 ring-offset-panel" : ""}`}
          />
        ))}
      </span>
      {from >= 0 ? (
        <span className="font-mono text-[10.5px] text-ink">
          <span className="text-muted">{was} →</span> {odds}
        </span>
      ) : (
        <span className="w-[104px] font-mono text-[10.5px] text-ink">{odds}</span>
      )}
    </span>
  );
}

const HEAD = "font-mono text-[10px] tracking-[.1em] text-muted uppercase";

export function LeadPage({ slug }: { slug: string }) {
  const { leads, dials, readings, fresh } = useLeads();
  const { see, did } = useGame();
  const navigate = useNavigate();
  const root = useRef<HTMLDivElement>(null);
  const i = leads.findIndex((l) => l.slug === slug);
  const lead = leads[i];
  const read = lead && readings[lead.slug]?.at(-1);

  // Opening the page reads what landed on it.
  const unread = read && fresh.has(read.id) ? read.id : null;
  useEffect(() => {
    if (unread) see([unread]);
  }, [unread, see]);

  // Opening any lead is one of the things we would do before Begin.
  const found = !!lead;
  useEffect(() => {
    if (found) did("openedLead");
  }, [found, did]);

  useEffect(() => {
    if (i < 0) return;
    Object.assign(dials, { focus: i + 1 });
    return () => void Object.assign(dials, { focus: 0 });
  }, [dials, i]);

  useEffect(() => {
    const back = (e: KeyboardEvent) => e.key === "Escape" && navigate("/");
    window.addEventListener("keydown", back);
    return () => window.removeEventListener("keydown", back);
  }, [navigate]);

  useGSAP(
    () => {
      if (!lead || prefersReducedMotion()) return;
      gsap.fromTo("[data-m]", riseFrom, { ...rise, stagger: 0.05 });
    },
    { scope: root, dependencies: [lead?.slug] },
  );

  if (!leads.length) return null;
  if (!lead)
    return (
      <p className="mt-2 text-sm text-muted">
        We have no lead by that name. <Link to="/" className="text-ink underline underline-offset-2">Back to Scan</Link>
      </p>
    );

  return (
    <div ref={root} className="flex flex-col pb-4">
      {/* The way back stays in reach while the page scrolls. */}
      <div className="sticky -top-3 z-10 -mx-4 bg-panel px-4 pt-3 pb-2">
        <Link
          to="/"
          data-m
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink bg-paper pr-4 pl-3 text-[14px] font-medium text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          <span aria-hidden className="text-[18px] leading-none">‹</span>
          All leads
        </Link>
      </div>
      <div data-m className="mt-1 flex items-baseline gap-2.5">
        <span className={`size-2.5 shrink-0 translate-y-[-1px] rounded-full ${lead.reply ? "bg-other" : "bg-you"}`} />
        <h1 className="text-[19px] leading-snug font-medium">{lead.what}</h1>
      </div>
      <p data-m className="mt-0.5 text-[13.5px] text-page-ink2">
        {lead.star} · {lead.ly.toFixed(1)} ly · light takes <span className="font-mono tabular-nums">{realTime(lead.ly)}</span>
      </p>

      {read && (
        <section data-m className="mt-3 rounded-xl border border-you/60 bg-you/[.06] px-3 py-2.5">
          <span className="font-mono text-[10px] tracking-[.1em] text-you">
            READING · YEAR {read.at} · {read.by.toUpperCase()}
          </span>
          <h2 className="mt-1 text-[16px] leading-snug font-semibold">{read.title}</h2>
          <p className="mt-0.5 text-[13.5px] leading-snug">{read.line}</p>
          <p className="mt-2 text-[13.5px] leading-snug text-page-ink2">
            <span className="mr-1.5 font-mono text-[10px] tracking-[.1em] text-you">THE MIND</span>
            {read.mind}
          </p>
        </section>
      )}

      <div data-m className="mt-3 rounded-xl border border-faint bg-paper px-2 py-1">
        <LeadArt art={lead.art} read={read?.id} />
      </div>

      <h2 data-m className={`mt-5 ${HEAD}`}>What we measured</h2>
      <dl data-m className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13.5px] leading-snug">
        {lead.facts.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <h2 data-m className={`mt-5 ${HEAD}`}>What it could be</h2>
      <ul className="mt-1 flex flex-col">
        {lead.could.map((c, k) => (
          <li key={c.what} data-m className="border-t border-faint py-2.5 first:border-t-0">
            <div className={`flex gap-x-3 gap-y-1 ${read ? "flex-col items-start" : "items-center justify-between"}`}>
              <span className="text-[15px] leading-snug font-semibold">{c.what}</span>
              <Scale odds={read?.now[k] ?? c.odds} was={read && c.odds} />
            </div>
            <p className="mt-0.5 text-[13.5px] leading-snug text-page-ink2">{c.why}</p>
          </li>
        ))}
      </ul>

      <h2 data-m className={`mt-4 ${HEAD}`}>What would tell us</h2>
      {(read?.tells ?? lead.tells).map((t) => (
        <p key={t} data-m className="mt-1.5 text-[13.5px] leading-snug">
          {t}
        </p>
      ))}

      <button
        data-m
        onClick={() => navigate(`/mind?ask=${encodeURIComponent(lead.ask)}`)}
        className="mt-6 h-[46px] shrink-0 rounded-full border border-ink text-[15px] font-medium"
      >
        Ask the Mind about it
      </button>
    </div>
  );
}
