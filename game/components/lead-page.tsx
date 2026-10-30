import { Link, useNavigate } from "react-router";
import { useEffect, useRef } from "react";
import { useGame } from "@/components/game-provider";
import { BackBar } from "@/components/back-bar";
import { LeadArt } from "@/components/lead-art";
import { SystemArt } from "@/components/system-art";
import { LeadMark } from "@/components/marks";
import { useLeads } from "@/components/scan";
import { span, lyOf } from "@/lib/game/clock";
import { ODDS, type Odds, type Reading } from "@/lib/game/leads";
import { VisitArt } from "@/components/visit-art";
import { gsap, prefersReducedMotion, rise, riseFrom, useGSAP } from "@/lib/motion";

// One lead, as a report: drawn, then what we measured, what it could be with the Mind's word for each, and what would
// tell us. Its latest reading, once one lands, comes first, and the words it moved show what they were. The map flies
// to its star while it is open, and back out when we leave. Asking the Mind is the last step. Beside its distance, a link to its destination on Reach, and every
// way we could go there, as that page links back here, 2026-10-19. A lead about a world is drawn as its whole system,
// every world known there on its orbit. Luyten's Star's messages keep their own drawing, and
// their systems follow under what we measured, 2026-10-19.

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

/** The bands our telescopes read, in microns, as lib/sim/observing.ts has them. */
const BANDS = [
  { band: "ozone", um: 0.6 },
  { band: "oxygen", um: 0.76 },
  { band: "water", um: 0.94 },
] as const;

/** A world's light, as our telescope spreads it, from green to past red. A gas in its air drinks its own band, so each
 *  found shows as a dark line. One looked for and missing leaves its band whole, one still being read flickers, and
 *  one past this mirror's reach is marked out of reach, since 2026-10-23. Unsplit or too faint, the light is its
 *  star's, dimmed. 2026-10-22. */
function AirBands({ air }: { air: NonNullable<Reading["air"]> }) {
  const x = (um: number) => `${((um - 0.5) / 0.5) * 100}%`;
  const seen = air.split && air.readable;
  return (
    <div className="mt-2.5">
      <div
        className={`relative h-6 overflow-hidden rounded-[3px] ${seen ? "" : "opacity-35"}`}
        style={{
          background:
            "linear-gradient(90deg, #4f9d5a 0%, #b9b54a 18%, #d98a3a 30%, #b8432f 44%, #6d2a2a 56%, #3a2224 78%, #261c1f 100%)",
        }}
      >
        {seen &&
          BANDS.filter(({ band }) => !air.beyond?.includes(band)).map(({ band, um }) => {
            const v = air[band];
            return (
              <span
                key={band}
                className={`absolute inset-y-0 w-[5px] -translate-x-1/2 ${v === true ? "bg-paper" : v === false ? "border-x border-dashed border-ink/50" : "animate-pulse bg-paper/40 motion-reduce:animate-none"}`}
                style={{ left: x(um) }}
              />
            );
          })}
      </div>
      <div className="relative mt-1 h-7 font-mono text-[9.5px] leading-tight text-muted">
        {BANDS.map(({ band, um }) => {
          const v = air[band];
          return (
            <span key={band} className="absolute -translate-x-1/2 text-center whitespace-nowrap" style={{ left: x(um) }}>
              <span className={v === true ? "text-ink" : ""}>
                {!seen ? band : air.beyond?.includes(band) ? "out of reach" : v === true ? band : v === false ? `no ${band}` : "reading"}
              </span>
              <br />
              {um} µm
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function LeadPage({ slug }: { slug: string }) {
  const { leads, dials, readings, fresh, setLook } = useLeads();
  const { see } = useGame();
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

  // The map turns to the lead, and its system, if we know it, is open to the map's Close View.
  useEffect(() => {
    if (i < 0) return;
    Object.assign(dials, { focus: i + 1 });
    setLook(leads[i]);
    return () => {
      Object.assign(dials, { focus: 0 });
      setLook(null);
    };
  }, [dials, i, leads, setLook]);

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
        <BackBar to="/" label="All leads" />
      </div>
      <div data-m className="mt-1 flex items-start gap-2.5">
        <span className={`mt-[4px] shrink-0 ${lead.reply ? "text-other" : "text-you"}`}>
          <LeadMark art={lead.art} size={18} />
        </span>
        <h1 className="text-[19px] leading-snug font-medium">{lead.star}</h1>
      </div>
      <p data-m className="mt-0.5 text-[13.5px] text-page-ink2">
        {lead.art.kind === "near" ? (
          // Here at home: no light-years, and no road to it on Reach. 2026-10-30.
          <>{lead.what}</>
        ) : (
          <>
            {lead.what} · {lead.range ? `${lyOf(lead.range[0])} to ${lyOf(lead.range[1])}` : lyOf(lead.ly)} ly · reached in{" "}
            <span className="font-mono tabular-nums">{lead.range ? `${span(lead.range[0])} to ${span(lead.range[1])}` : span(lead.ly)}</span> ·{" "}
            <Link to={`/reach/${lead.slug}`} className="whitespace-nowrap text-you">
              Ways to go ›
            </Link>
          </>
        )}
      </p>

      {read && (
        <section data-m className="mt-3 rounded-xl border border-you/60 bg-you/[.06] px-3 py-2.5">
          <span className="font-mono text-[10px] tracking-[.1em] text-you">
            READING · YEAR {read.at} · {read.by.toUpperCase()}
          </span>
          <h2 className="mt-1 text-[16px] leading-snug font-semibold">{read.title}</h2>
          <p className="mt-0.5 text-[13.5px] leading-snug">{read.line}</p>
          {read.air && <AirBands air={read.air} />}
          {read.sight && (
            <div className="mt-2.5 flex justify-center">
              <VisitArt sight={read.sight} elder={read.elder} />
            </div>
          )}
          <p className="mt-2 text-[13.5px] leading-snug text-page-ink2">
            <span className="mr-1.5 font-mono text-[10px] tracking-[.1em] text-you">THE MIND</span>
            {read.mind}
          </p>
        </section>
      )}

      <div data-m className="mt-3 rounded-xl border border-faint bg-paper px-2 py-1">
        {lead.system && lead.art.kind === "orbit" ? (
          <SystemArt system={lead.system} />
        ) : (
          <LeadArt art={lead.art} />
        )}
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

      {lead.system && lead.art.kind !== "orbit" && (
        <>
          <h2 data-m className={`mt-5 ${HEAD}`}>Its system</h2>
          <div data-m className="mt-1.5 rounded-xl border border-faint bg-paper px-2 py-1">
            <SystemArt system={lead.system} />
          </div>
        </>
      )}

      {/* A rock coming has nothing to weigh: these headings show only over something. 2026-10-30. */}
      {lead.could.length > 0 && <h2 data-m className={`mt-5 ${HEAD}`}>What it could be</h2>}
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

      {(read?.tells ?? lead.tells).length > 0 && <h2 data-m className={`mt-4 ${HEAD}`}>What would tell us</h2>}
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
