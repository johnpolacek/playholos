import { useRef } from "react";
import { Link, useNavigate } from "react-router";
import { useGame } from "@/components/game-provider";
import { announceJump, setLeap, useSnap } from "@/components/jump";
import { RangingArt } from "@/components/lead-art";
import { LeadMark } from "@/components/marks";
import { useSchedule } from "@/components/picks";
import { BackBar } from "@/components/back-bar";
import { yearText } from "@/lib/game/clock";
import { buildSlug } from "@/lib/game/plan";
import { RANGE_HOURS, rangedAt, type FlashSeen } from "@/lib/sim/minds";
import { gsap, prefersReducedMotion, rise, riseFrom, useGSAP } from "@/lib/motion";

// A warm glow from first sight, before our Infrared Telescope ranges it. It had no page until then, so its row on the
// jump card led to the Mind with nothing to do. Now it has one at the address its full page takes once ranged: where it
// is, how long till its range, a jump there, and the chance it fades first. Playtest 2026-11-07.

/** What a warm glow is, said on its page whether ranged or not. */
export const WARM_WHAT =
  "A spot in the sky that turned warm, about as warm as a planet, where nothing shone before. Dust around a newborn star or two merging stars can glow like this, and it fades. So can collectors built around a star: they catch its light and must shed it as heat. That glow lasts as long as they stay. This is how a young mind might look, still building. An old one might glow cold instead.";

const HEAD = "font-mono text-[10px] tracking-[.1em] text-muted uppercase";

export function UnrangedGlow({ n, flash }: { n: number; flash: FlashSeen }) {
  const { year, skipTo } = useGame();
  const { done } = useSchedule();
  const snapshot = useSnap();
  const navigate = useNavigate();
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo("[data-m]", riseFrom, { ...rise, stagger: 0.05 });
    },
    { scope: root, dependencies: [n] },
  );
  const now = year ?? flash.seen;
  const tenth = Math.floor(now * 10) / 10;
  const telescope = done["Infrared Telescope"] ?? null;
  // Ranged once our telescope is done and the glow is out of the Sun's glare, in a few hours of looking. lib/sim/minds.ts.
  const at = telescope === null ? null : rangedAt(flash, flash.seen, telescope);
  const to = at === null ? null : Math.max(Math.ceil(at * 10 - 1e-9) / 10, tenth + 0.1);
  const gone = flash.faded !== undefined;
  const jump = () => {
    if (to === null) return;
    setLeap({ from: tenth, to, snap: snapshot() });
    announceJump(now, to);
    skipTo(to);
  };
  const sky = `RA ${(Math.round(flash.ra * 10) / 10 % 24).toFixed(1)} h, Dec ${flash.dec.toFixed(0)}°`;
  const name = `Warm glow ${n}`;
  return (
    <div ref={root} className="flex flex-col pb-4">
      <div className="sticky -top-3 z-10 -mx-4 bg-panel px-4 pt-3 pb-2">
        <BackBar to="/play" label="All leads" />
      </div>
      <div data-m className="mt-1 flex items-start gap-2.5">
        <span className="mt-[4px] shrink-0 text-other">
          <LeadMark art={{ kind: "warm", near: 0, far: 0 }} size={18} />
        </span>
        <h1 className="text-[19px] leading-snug font-medium text-other">{name}</h1>
      </div>
      <p data-m className="mt-0.5 text-[13.5px] text-page-ink2">
        A new warm glow · {gone ? "faded before we found how far" : "how far, not yet known"}
      </p>

      <section data-m className={`mt-3 rounded-xl border px-3 py-2.5 ${gone ? "border-faint" : "border-other/60 bg-other/[.06]"}`}>
        <span className={`font-mono text-[10px] tracking-[.1em] ${gone ? "text-muted" : "text-other"}`}>
          {gone ? `FADED · YEAR ${yearText(flash.faded!)}` : at === null ? "WAITING ON A TELESCOPE" : `RANGING · READY BY YEAR ${yearText(to!)}`}
        </span>
        <p className="mt-1 text-[13.5px] leading-snug">
          {gone
            ? "It faded before our Infrared Telescope could range it. We may never know how far it was. A glow that fades this fast is most likely natural, not something built."
            : at === null
              ? "Our Infrared Telescope can range it by its reddening and the star behind it. We have none yet."
              : telescope !== null && telescope > now
                ? `Our Infrared Telescope is done Year ${yearText(telescope)}, and ranges it in ${RANGE_HOURS} hours once the glow is out of the Sun’s glare, if it still shines.`
                : `It sits too near the Sun for our Infrared Telescope to look. Once out of the glare, ${RANGE_HOURS} hours on its reddening and the star behind it tell how far it is, by Year ${yearText(to!)}, if it still shines. If it fades first, it was most likely natural.`}
        </p>
        {!gone && at === null && (
          <Link
            to={`/play/build/${buildSlug("Infrared Telescope")}`}
            className="mt-2.5 inline-flex h-8 items-center rounded-full bg-you px-4 text-[13px] font-medium text-paper transition-[filter] hover:brightness-110"
          >
            Build our Infrared Telescope ›
          </Link>
        )}
        {!gone && to !== null && (
          <button
            onClick={jump}
            className="mt-2.5 inline-flex h-8 items-center rounded-full bg-other px-4 text-[13px] font-medium text-paper transition-[filter] hover:brightness-110"
          >
            Jump to its ranging ›
          </button>
        )}
      </section>

      <div data-m className="mt-3 rounded-xl border border-faint bg-paper px-2 py-1">
        <RangingArt seen={flash.seen} at={at} now={now} faded={flash.faded} />
      </div>

      <h2 data-m className={`mt-5 ${HEAD}`}>What a warm glow is</h2>
      <p data-m className="mt-1.5 text-[13.5px] leading-snug text-page-ink2">
        {WARM_WHAT}
      </p>

      <h2 data-m className={`mt-5 ${HEAD}`}>What we measured</h2>
      <dl data-m className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13.5px] leading-snug">
        {(
          [
            ["First seen", `Year ${yearText(flash.seen)}, by our Warm Sky Watch`],
            ["Where", sky],
            ["Its warmth", "Near room temperature, like a planet's, far cooler than any star"],
            ["Its distance", gone ? "Never found" : "Not yet known"],
            ...(gone ? [["Faded", `Year ${yearText(flash.faded!)}`]] : []),
          ] as [string, string][]
        ).map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <button
        data-m
        onClick={() => navigate(`/play/mind?ask=${encodeURIComponent(`What is ${name.toLowerCase()}, and what could we do while we range it?`)}`)}
        className="mt-6 h-[46px] shrink-0 rounded-full border border-ink text-[15px] font-medium"
      >
        Ask the Mind about it
      </button>
    </div>
  );
}
