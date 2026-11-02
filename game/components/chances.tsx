import type { Lead, Reading } from "@/lib/game/leads";
import { chancesOf, type Range, rangeText } from "@/lib/game/chance";

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

export function Chances({ lead, readings, className = "" }: { lead: Lead; readings: readonly Reading[]; className?: string }) {
  const c = chancesOf(lead, readings);
  if (!c) return null;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`} aria-label={`Chance of life ${c.life ? rangeText(c.life) : "none"}, of a mind ${c.mind === "unknown" ? "unknown" : c.mind ? rangeText(c.mind) : "none"}, ${c.basis}`}>
      {c.life && <Band label="LIFE" range={c.life} sure={c.sure} color="var(--see)" />}
      {c.mind && <Band label="MIND" range={c.mind} sure={c.sure} color="var(--other)" />}
      <span className="pl-[48px] text-[11.5px] leading-none text-muted">{c.basis}</span>
    </div>
  );
}
