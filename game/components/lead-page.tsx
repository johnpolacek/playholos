import { before, ChanceTag, Chances, movedBy, verdictOf } from "@/components/chances";
import { Link, useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import { useGame } from "@/components/game-provider";
import { usePlan, useSchedule } from "@/components/picks";
import { flybyRoad, sentinelRoad } from "@/lib/game/reach";
import { BackBar } from "@/components/back-bar";
import { CloseReading } from "@/components/close-reading";
import { LeadArt } from "@/components/lead-art";
import { WatcherClose } from "@/components/watcher-art";
import { SystemArt } from "@/components/system-art";
import { LeadMark } from "@/components/marks";
import { useLeads } from "@/components/scan";
import { span, lyOf, yearText } from "@/lib/game/clock";
import { chancesOf } from "@/lib/game/chance";
import { ODDS, type Odds, type Reading, starName } from "@/lib/game/leads";
import { dates } from "@/lib/game/sends";
import { VisitArt } from "@/components/visit-art";
import { WatcherVoice } from "@/components/watcher-voice";
import { WreckCard } from "@/components/wreck-card";
import { VOICED } from "@/lib/game/watcher-voice";
import { glowNamed } from "@/lib/game/glow-names";
import { UnrangedGlow, WARM_WHAT } from "@/components/unranged-glow";
import { gsap, prefersReducedMotion, rise, riseFrom, useGSAP } from "@/lib/motion";

// One lead, as a report: drawn, then what we measured, what it could be with the Mind's word for each, and what would
// tell us. Its latest reading, once one lands, comes first, and the words it moved show what they were. The map flies
// to its star while it is open, and back out when we leave. Asking the Mind is the last step. Beside its distance, a link to its destination on Reach, and every
// way we could go there, as that page links back here, 2026-10-19. A lead about a world is drawn as its whole system,
// every world known there on its orbit. Luyten's Star's messages keep their own drawing, and
// their systems follow under what we measured, 2026-10-19.

/** Each step of the Mind's scale, said as a range: "Life is unlikely" beside a band of 14 to 41% read as a
 *  contradiction to a blind first-timer, so the page speaks in numbers only. The Will's call, 2026-11-08. */
const SPAN: Record<Odds, string> = {
  "almost no chance": "under 5%",
  "very unlikely": "5–15%",
  unlikely: "15–35%",
  "roughly even": "35–65%",
  likely: "65–85%",
  "very likely": "85–95%",
  "almost certain": "over 95%",
};

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
          <span className="text-muted">{SPAN[was!]} →</span> {SPAN[odds]}
        </span>
      ) : (
        <span className="w-[64px] font-mono text-[10.5px] text-ink">{SPAN[odds]}</span>
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

/** A way back to the watcher's voice. */
function ListenButton({ onClick }: { onClick(): void }) {
  return (
    <button
      onClick={onClick}
      className="mt-2 inline-flex h-8 items-center gap-2 self-start rounded-full border border-other/70 px-3.5 text-[13px] text-other transition-colors hover:bg-other/10"
    >
      <svg viewBox="0 0 16 10" className="h-2.5 w-4" aria-hidden>
        <path d="M0 5h2l1-3 2 6 2-8 2 10 2-7 1 4 1-2h3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
      Hear its voice
    </button>
  );
}


/** Where a warm glow stands, in one line at the top of its page: ruled out, worth a closer look, open, or lost. A
 *  playtest read "nothing more for us to do here" beside an Engage button and a 0.8 to 5% mind, and couldn't tell
 *  which to believe. 2026-11-07. */
function GlowVerdict({ flash }: { flash: { read?: { saw: string }; imaged?: { saw: string }; faded?: number } }) {
  const saw = flash.read?.saw;
  const shining = flash.faded === undefined;
  // Our Glow Imager's word comes first: its shape settles a glow, whatever its light did or didn't tell. A ring's
  // page read "LOST. It faded before we read its light." above "resolved from home". 2026-11-11.
  const [tag, line, tone] =
    flash.imaged?.saw === "ring"
      ? ["MADE", "A ring round a star, set in place. Someone built it.", "border-other/60 text-other"]
      : flash.imaged?.saw === "cloud"
        ? ["RULED OUT", "Its shape is a cloud of dust. No life or mind here.", "border-faint text-muted"]
        : saw === "dust"
      ? ["RULED OUT", "Its light is dust. No life or mind here.", "border-faint text-muted"]
      : saw === "smooth"
        ? shining
          ? ["WORTH A CLOSER LOOK", "Plain heat, not dust. A mind might be making it.", "border-other/60 text-other"]
          : ["UNSETTLED", "Plain heat, not dust, but it faded before we could look closer.", "border-faint text-page-ink2"]
        : saw
          ? ["LOST", "It faded before our reading was done.", "border-faint text-muted"]
          : shining
            ? ["OPEN", "Most glows like this are dust. Reading its light will tell.", "border-faint text-page-ink2"]
            : ["LOST", "It faded before we read its light.", "border-faint text-muted"];
  return (
    <p data-m className={`mt-2 self-start rounded-lg border px-2.5 py-1.5 text-[13px] leading-snug ${tone}`}>
      <span className="mr-2 font-mono text-[10px] tracking-[.1em]">{tag}</span>
      {line}
    </p>
  );
}

export function LeadPage({ slug }: { slug: string }) {
  const { leads, dials, readings, fresh, setLook, minds } = useLeads();
  const { see, save, year: now } = useGame();
  const { plan } = usePlan();
  const { scale } = useSchedule();
  const navigate = useNavigate();
  const root = useRef<HTMLDivElement>(null);
  const i = leads.findIndex((l) => l.slug === slug);
  const lead = leads[i];
  // Our flyby probe there, if one is sent. 2026-11-05.
  const probe = lead ? plan.flybys?.find((o) => o.by === "probe" && o.name === lead.star) : undefined;
  const probeRoad = probe ? flybyRoad(plan, scale, probe.y, probe) : null;
  // Our sentinel there, sent by hand or by our standing order for glows. Prometheus had one on its way since Year 46.7,
  // and its page said nothing of it. Playtest 2026-11-13.
  const stayer = lead ? plan.sentinels?.find((o) => o.name === lead.star) : undefined;
  const going = stayer && !probeRoad ? sentinelRoad(plan, scale, stayer.y, stayer.name, stayer.d ?? lead!.ly) : null;
  // Only until its first word is home: after that, its readings say what it found.
  const stayRoad = going && (going.home === null || (now ?? 0) < going.home) ? going : null;
  // What we sent it, when it lands and when an answer could come, here as on Scan's Messages. A warm glow's page never
  // said we had messaged it until a playtest, 2026-11-01.
  const ours: [string, string][] = !lead
    ? []
    : (save?.sent ?? [])
        .filter((m) => m.to === lead.star)
        .map((m) => {
          const ds = (lead.range ?? [lead.ly, lead.ly]).map((d) => dates(m.y, d, m.size));
          const when = (f: (x: (typeof ds)[number]) => number) =>
            ds[0] === ds[1] || f(ds[0]) === f(ds[1]) ? `Year ${yearText(f(ds[0]))}` : `Year ${yearText(f(ds[0]))} to ${yearText(f(ds[1]))}`;
          return ["Our message", `Sent Year ${yearText(m.y)}. It lands ${when((x) => x.lands)}, and an answer could come ${when((x) => x.back)}.`];
        });
  const all = (lead && readings[lead.slug]) || [];
  const read = all.at(-1);
  // What came before the latest stays on the page, newest first: the watcher's answer and its relay were gone once a
  // strike landed. Playtest 2026-11-01.
  const earlier = all.slice(0, -1).reverse();
  const verdict = lead ? verdictOf(lead, all) : null;
  const hasChances = !!lead && !!chancesOf(lead, all);

  // Opening the page reads what landed on it.
  // Every one not yet opened, however old: the Mind's word on the watcher waits on it. 2026-11-05.
  const unread = all.filter((r) => fresh.has(r.id) || !(save?.seen ?? []).includes(r.id)).map((r) => r.id).join(" ");
  // The watcher's voice opens on its own the first time we come to it, and stays a tap away after. 2026-11-05.
  const [voice, setVoice] = useState(false);
  const firstVoice = unread.split(" ").some((id) => VOICED.has(id));
  const [opened, setOpened] = useState(false);
  if (firstVoice && !opened) {
    setOpened(true);
    setVoice(true);
  }
  useEffect(() => {
    if (unread) see(unread.split(" "));
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
    const back = (e: KeyboardEvent) => e.key === "Escape" && navigate("/play");
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
  // A warm glow seen but not yet ranged has its page here too, at the address its full page takes once ranged.
  const glow = slug.match(/^warm-glow-(\d+)$/)?.[1];
  const flash = glow ? minds?.flashes[Number(glow) - 1] : undefined;
  if (!lead && flash) return <UnrangedGlow n={Number(glow)} flash={flash} />;
  if (!lead)
    return (
      <p className="mt-2 text-sm text-muted">
        We have no lead by that name. <Link to="/play" className="text-ink underline underline-offset-2">Back to Scan</Link>
      </p>
    );

  return (
    <div ref={root} className="flex flex-col pb-4">
      {voice && <WatcherVoice onClose={() => setVoice(false)} />}
      {/* The way back stays in reach while the page scrolls. */}
      <div className="sticky -top-3 z-10 -mx-4 bg-panel px-4 pt-3 pb-2">
        <BackBar to="/play" label="All leads" />
      </div>
      <div data-m className="mt-1 flex items-start gap-2.5">
        <span className={`mt-[4px] shrink-0 ${lead.reply || lead.art.kind === "warm" ? "text-other" : "text-you"}`}>
          <LeadMark art={lead.art} size={18} />
        </span>
        <h1 className={`text-[19px] leading-snug font-medium ${lead.art.kind === "warm" ? "text-other" : ""}`}>{starName(lead.star)}
          {/* A glow that earned a name says which it was: a blind first-timer worked out Prometheus was Warm Glow 1 only from
              its distance. 2026-11-07. */}
          {glowNamed(lead.star) && <span className="ml-2 font-mono text-[10.5px] font-normal tracking-[.06em] text-muted">ONCE {lead.star.toUpperCase()}</span>}
        </h1>
      </div>
      <p data-m className="mt-0.5 text-[13.5px] text-page-ink2">
        {lead.art.kind === "near" ? (
          // Here at home: no light-years, and no road to it on Reach. 2026-10-30.
          <>{lead.what}</>
        ) : (
          <>
            {lead.what} · {lead.range ? `${lyOf(lead.range[0])} to ${lyOf(lead.range[1])}` : lyOf(lead.ly)} ly · reached in{" "}
            <span className="font-mono tabular-nums">{lead.range ? `${span(lead.range[0])} to ${span(lead.range[1])}` : span(lead.ly)}</span>
          </>
        )}
      </p>
      {/* The answer first: our chance of life and of a mind, and what the latest reading means for them, said in a line.
          They sat below two readings, near the fold, and a playtest found the page's point buried. 2026-11-07. */}
      {lead.art.kind !== "warm" && (verdict || hasChances) && (
        <div data-m className="mt-2.5 flex flex-col gap-2">
          {verdict && <p className="text-[14.5px] leading-snug font-medium">{verdict}</p>}
          <Chances lead={lead} readings={all} was={read ? before(all, read) : undefined} />
        </div>
      )}
      {/* A way to go there, as a button: a link at the end of this line went unseen. Playtest 2026-11-05. Once a probe of
          ours is on its way, as our standing order sends to each warm glow, it says so in its place. */}
      {lead.art.kind !== "near" && (probeRoad || stayRoad) && (
        <p data-m className="mt-2 text-[13px] leading-snug text-page-ink2">
          <span className="text-you">{probeRoad ? "A flyby probe of ours is on its way." : "A sentinel of ours is on its way."}</span>{" "}
          {probeRoad && probeRoad.arrives !== null && probeRoad.home !== null && `It passes in Year ${yearText(probeRoad.arrives)}, and its pictures reach us by Year ${yearText(probeRoad.home)}.`}
          {stayRoad && stayRoad.arrives !== null && stayRoad.home !== null && `It arrives in Year ${yearText(stayRoad.arrives)}, and its first word reaches us by Year ${yearText(stayRoad.home)}.`}{" "}
          <Link to={`/play/reach/${lead.slug}`} className="whitespace-nowrap text-you hover:underline">
            Other ways to engage ›
          </Link>
        </p>
      )}
      {lead.art.kind === "warm" && flash && <GlowVerdict flash={flash} />}
      {/* Engage holds at the panel's foot while the page under it scrolls: on a phone the tab bar cut it in half. On a
          bar of its own, so what scrolls under it hides whole rather than showing half under the button. Screen critic,
          2026-11-09. */}
      {lead.art.kind !== "near" && !probeRoad && !stayRoad && !(lead.art.kind === "warm" && flash?.read?.saw === "dust") && (
        <div data-m className="sticky bottom-0 z-10 -mx-4 mt-1.5 bg-panel px-4 pt-1 pb-3">
          <Link
            to={`/play/reach/${lead.slug}`}
            state={{ engage: true }}
            className="inline-flex h-8 items-center rounded-full bg-you px-4 text-[13px] font-medium text-paper transition-[filter] hover:brightness-110"
          >
            Engage {starName(lead.star)}: send a craft or a message ›
          </Link>
        </div>
      )}

      {/* What we can do comes first, above what we know. It sat two screens down until a playtest, 2026-11-04. */}
      {lead.art.kind === "warm" && <CloseReading lead={lead} />}
      {lead.art.kind === "warm" && (
        <div data-m className="mt-3">
          <Chances lead={lead} readings={all} />
        </div>
      )}

      {read && (
        <section data-m className="mt-3 rounded-xl border border-you/60 bg-you/[.06] px-3 py-2.5">
          <span className="font-mono text-[10px] tracking-[.1em] text-you">
            READING · YEAR {yearText(read.at)} · {read.by.toUpperCase()}
          </span>
          <h2 className="mt-1 text-[16px] leading-snug font-semibold">{read.title}</h2>
          <p className="mt-0.5 text-[13.5px] leading-snug">{read.line}</p>
          <ChanceTag shift={movedBy(lead, all, read)} className="mt-1 block" />
          {VOICED.has(read.id) && <ListenButton onClick={() => setVoice(true)} />}
          {read.air && <AirBands air={read.air} />}
          {read.sight && (
            <div className="mt-2.5 flex justify-center">
              <VisitArt sight={read.sight} />
            </div>
          )}
          {/* The watcher up close, drawn: its mirror held on one point of the sky. 2026-11-07. */}
          {read.close && (
            <div className="mt-2.5 rounded-lg border border-faint bg-paper px-2 py-1">
              <WatcherClose {...read.close} />
            </div>
          )}
          <p className="mt-2 text-[13.5px] leading-snug text-page-ink2">
            <span className="mr-1.5 font-mono text-[10px] tracking-[.1em] text-you">THE MIND</span>
            {read.mind}
          </p>
        </section>
      )}

      {earlier.length > 0 && (
        <section data-m className="mt-2 flex flex-col">
          {earlier.map((r) => (
            <div key={r.id} className="border-t border-faint py-2 first:border-t-0">
              <span className="font-mono text-[10px] tracking-[.1em] text-muted">
                EARLIER · YEAR {yearText(r.at)} · {r.by.toUpperCase()}
              </span>
              <h3 className="mt-0.5 text-[14.5px] leading-snug font-semibold">{r.title}</h3>
              <p className="mt-0.5 text-[13.5px] leading-snug text-page-ink2">{r.line}</p>
              <ChanceTag shift={movedBy(lead, all, r)} className="mt-1 block" />
              {VOICED.has(r.id) && <ListenButton onClick={() => setVoice(true)} />}
              {r.sight && (
                <div className="mt-2 flex justify-center">
                  <VisitArt sight={r.sight} />
                </div>
              )}
              {r.close && (
                <div className="mt-2 rounded-lg border border-faint bg-paper px-2 py-1">
                  <WatcherClose {...r.close} />
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      <div data-m className="mt-3 rounded-xl border border-faint bg-paper px-2 py-1">
        {lead.system && lead.art.kind === "orbit" ? (
          <SystemArt system={lead.system} />
        ) : (
          <LeadArt art={lead.art} />
        )}
      </div>

      {lead.art.kind === "warm" && (
        <>
          <h2 data-m className={`mt-5 ${HEAD}`}>What a warm glow is</h2>
          <p data-m className="mt-1.5 text-[13.5px] leading-snug text-page-ink2">
            {WARM_WHAT}
          </p>
        </>
      )}
      {/* Cold glows had no words of their own, only "a cold grey glow" and an unexplained 12 K. 2026-11-07. */}
      {lead.slug.startsWith("cold-glow-") && (
        <>
          <h2 data-m className={`mt-5 ${HEAD}`}>What a cold glow is</h2>
          <p data-m className="mt-1.5 text-[13.5px] leading-snug text-page-ink2">
            This is how an old mind might look. A faint spot of heat beside a star, far colder than any planet: about 12 degrees above the coldest anything can be. It holds steady. An old mind that stopped growing would spend its time thinking, and the colder it computes, the less power each thought costs. So it might set its works far out from its star and shed its heat there, cold. Most cold glows are plainer, odd dust far out or a fault in our looking. The rare one could be the oldest neighbor we will ever meet.
          </p>
        </>
      )}
      <h2 data-m className={`mt-5 ${HEAD}`}>What we measured</h2>
      <dl data-m className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13.5px] leading-snug">
        {[...lead.facts, ...ours].map(([label, value]) => (
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

      {/* Our one weapon, on the watcher found where a craft can reach it. 2026-11-13. */}
      {lead.slug === "small-dark-body" && lead.art.kind === "near" && (lead.art.where === "moon" || lead.art.where === "co-orbital") && (
        <WreckCard where={lead.art.where} />
      )}

      <button
        data-m
        // What it is, then what we could do: asked only what it was, the Mind restated a cold glow and a blind first-timer
        // was left with no next step. 2026-11-07.
        onClick={() => navigate(`/play/mind?ask=${encodeURIComponent(`${lead.ask} What could we do next?`)}`)}
        className="mt-6 h-[46px] shrink-0 rounded-full border border-ink text-[15px] font-medium"
      >
        Ask the Mind about it
      </button>
    </div>
  );
}
