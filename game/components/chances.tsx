import { useEffect, useState } from "react";
import { type Lead, lifeOf, type Reading } from "@/lib/game/leads";
import { type Chances as ChanceSet, chancesOf, type Range, rangeText } from "@/lib/game/chance";
import { prefersReducedMotion } from "@/lib/motion";

// A lead's chance of life and of a mind, each a glowing band on a track from none to certain. A wide, soft band is a
// guess, a narrow, sharp one a reading, and under it what the chance rests on. A reading landing slides the band to
// its new place. Chosen 2026-11-01 over a "?" mark.

function Band({ label, range, sure, color }: { label: string; range: Range | "unknown"; sure: number; color: string }) {
  // Unknown spans the whole track, faint: anywhere from none to certain.
  const unknown = range === "unknown";
  const left = unknown ? 0 : range.lo * 100;
  const width = unknown ? 100 : Math.max(1.2, (range.hi - range.lo) * 100);
  // Soft edges fade over most of a guess's band, and barely at all once we have read.
  const soft = Math.round(42 - 36 * sure);
  return (
    <div className="grid grid-cols-[38px_1fr_auto] items-center gap-2.5">
      <span className="font-mono text-[9.5px] tracking-[.1em] text-muted">{label}</span>
      <span className="relative h-[6px] rounded-full bg-track">
        <span
          className="absolute inset-y-0 rounded-full transition-[left,width] duration-700 ease-out"
          style={{
            left: `${left}%`,
            width: `${width}%`,
            background: unknown
              ? `linear-gradient(90deg, transparent, color-mix(in srgb, ${color} 35%, transparent) 30%, color-mix(in srgb, ${color} 35%, transparent) 70%, transparent)`
              : `linear-gradient(90deg, transparent, ${color} ${soft}%, ${color} ${100 - soft}%, transparent)`,
            boxShadow: unknown ? "none" : `0 0 ${4 + 6 * sure}px color-mix(in srgb, ${color} ${Math.round(30 + 30 * sure)}%, transparent)`,
          }}
        />
      </span>
      <span className="min-w-[64px] text-right font-mono text-[12px] tabular-nums" style={{ color }}>
        {unknown ? "unknown" : rangeText(range)}
      </span>
    </div>
  );
}

/** The readings that came before `r`, in the order lifeOf weighs them: earlier Years first, then list order. */
export function before(readings: readonly Reading[], r: Reading) {
  const i = readings.indexOf(r);
  return readings.filter((x, j) => x !== r && (x.at < r.at || (x.at === r.at && j < i)));
}

const same = (a?: Range | "unknown", b?: Range | "unknown") =>
  a === b || (!!a && !!b && a !== "unknown" && b !== "unknown" && rangeText(a) === rangeText(b));

/** How one reading moved our chances, said short: "life 20–35% → 44–56%", or where it stands when it moved nothing.
 *  Life when we weigh life, else a mind. A reading never said what it did to the odds, so its worth was buried.
 *  Playtest 2026-11-07. */
export function movedBy(lead: Lead, readings: readonly Reading[], r: Reading) {
  const now = chancesOf(lead, [...before(readings, r), r]);
  if (!now) return null;
  const was = chancesOf(lead, before(readings, r));
  return chanceShift(was, now, mindFirst(lead));
}

/** A glow in the sky, whose chance we give as a mind's. */
export const isGlow = (l: Lead) => l.art.kind === "glow" || l.art.kind === "warm";

/** A lead whose question is a mind, not life: a glow, or the watcher, a made thing 10 cm across. Its warning read
 *  "life 5–20%" until a playtest, 2026-11-14, "why does it say life?" */
export const mindFirst = (l: Lead) => isGlow(l) || l.slug === "small-dark-body";

export function chanceShift(was: ChanceSet | null, now: ChanceSet, mindFirst = false) {
  if (now.ruledOut) return { label: "mind", from: was?.ruledOut || !was?.mind || was.mind === "unknown" ? null : rangeText(was.mind), to: "ruled out", up: false };
  // A glow is a question of minds, not life: Cold Glow 1 read "life 12–45%" on the jump card beside "Life is unlikely"
  // on its page and a mind at 0.07 to 2% in the Mind's word, and a blind first-timer couldn't square them. 2026-11-08.
  const hasMind = !!now.mind && now.mind !== "unknown";
  const pick = mindFirst && hasMind ? "mind" : now.life ? "life" : hasMind ? "mind" : null;
  if (!pick) return null;
  const to = now[pick] as Range;
  const from = was?.[pick];
  const moved = from && from !== "unknown" && !same(from, to);
  return { label: pick, from: moved ? rangeText(from) : null, to: rangeText(to), up: !!moved && (to.lo + to.hi) / 2 > (from.lo + from.hi) / 2 };
}

/** A chance in a row, as on Scan and the jump card: "life 44–56%", with where it was when the last reading moved it. */
export function ChanceTag({ shift, className = "" }: { shift: ReturnType<typeof chanceShift>; className?: string }) {
  if (!shift) return null;
  const color = shift.label === "life" ? "var(--see)" : "var(--other)";
  return (
    <span className={`font-mono text-[11px] whitespace-nowrap tabular-nums ${className}`}>
      <span className="text-muted">{shift.label} </span>
      {shift.from && <span className="text-muted">{shift.from} → </span>}
      <span style={{ color }}>{shift.to}</span>
    </span>
  );
}


/** The page's answer in a line: what we last learned. Its word on life left 2026-11-08, as the bands beside it say it
 *  in numbers, and "Life is unlikely" over 14 to 41% read as a contradiction. Null where life isn't the question. */
export function verdictOf(lead: Lead, readings: readonly Reading[]) {
  const c = chancesOf(lead, readings);
  if (!c) return null;
  const read = readings.at(-1);
  if (c.ruledOut) return `${read ? `${read.title}. ` : ""}No mind here.`;
  const word = lifeOf(lead, readings);
  if (!word) return null;
  return read ? `${read.title}.` : null;
}

/** `was`: the readings before the latest, so the bands open where they stood and slide to where it put them. */
export function Chances({ lead, readings, was, className = "" }: { lead: Lead; readings: readonly Reading[]; was?: readonly Reading[]; className?: string }) {
  const end = chancesOf(lead, readings);
  const start = was ? chancesOf(lead, was) : null;
  const [slid, setSlid] = useState(!start || prefersReducedMotion());
  useEffect(() => {
    if (slid) return;
    const t = setTimeout(() => setSlid(true), 450);
    return () => clearTimeout(t);
  }, [slid]);
  // Opens where the last reading found them, only when that held the same bands.
  const c = !slid && start && !!start.life === !!end?.life && !start.ruledOut ? start : end;
  if (!c) return null;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`} aria-label={`Chance of life ${c.life ? rangeText(c.life) : "none"}, of a mind ${c.ruledOut ? "ruled out" : c.mind === "unknown" ? "unknown" : c.mind ? rangeText(c.mind) : "none"}, ${c.basis}`}>
      {c.life && <Band label="LIFE" range={c.life} sure={c.sure} color="var(--see)" />}
      {c.ruledOut ? (
        <div className="grid grid-cols-[38px_1fr_auto] items-center gap-2.5">
          <span className="font-mono text-[9.5px] tracking-[.1em] text-muted">MIND</span>
          <span className="h-[6px] rounded-full bg-track" />
          <span className="min-w-[64px] text-right font-mono text-[12px] text-muted">ruled out</span>
        </div>
      ) : (
        c.mind && <Band label="MIND" range={c.mind} sure={c.sure} color="var(--other)" />
      )}
      <span className="pl-[48px] text-[11.5px] leading-none text-muted">{c.basis}</span>
    </div>
  );
}
