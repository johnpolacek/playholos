import { yearText } from "@/lib/game/clock";

// When we would hear back, each way to engage side by side: a bar from now to the Year its word reaches us, on a
// ruler of tens so a message's decades and a sentinel's tens of thousands of Years both read. Ours already chosen is
// lit and marked. Each way's Year sat at its row's right, five rows apart, and what we had chosen said so only at the
// foot of its own row. Playtest 2026-11-13.

export interface HearRow {
  key: string;
  label: string;
  /** The Year its first word reaches us, or null if it never does from here. */
  home: number | null;
  /** Why it never does, said where its bar would be. */
  never?: string;
  /** Already chosen. */
  ours: boolean;
  /** What comes home: pictures, an answer. */
  brings: string;
}

const span = (years: number) =>
  years < 1 ? "under a Year" : years < 10 ? `${years.toFixed(1)} Years` : `${Math.round(years).toLocaleString("en-US")} Years`;

export function HearBack({ rows, now, onPick }: { rows: HearRow[]; now: number; onPick(key: string): void }) {
  const live = rows.filter((r) => r.home !== null);
  if (!live.length) return null;
  const waits = live.map((r) => r.home! - now);
  const longest = Math.max(...waits, 1);
  // A plain ruler when the waits are of a size, so 20,000 Years reads as a fifth of 100,000. Tens apart, a ruler of
  // tens, so a message's decades and a sentinel's millennia both show.
  const log = longest / Math.max(Math.min(...waits), 0.1) > 50;
  const top = Math.ceil(Math.log10(longest));
  const step = (() => {
    const raw = longest / 4;
    const p = 10 ** Math.floor(Math.log10(raw));
    return [1, 2, 2.5, 5, 10].map((m) => m * p).find((x) => x >= raw)!;
  })();
  const end = log ? 10 ** top : Math.ceil(longest / step) * step;
  const at = (years: number) =>
    log ? Math.max(0.02, (Math.log10(Math.max(years, 0.1)) + 1) / (top + 1)) : Math.max(0.01, years / end);
  const sorted = [...rows].sort((a, b) => (a.home ?? Infinity) - (b.home ?? Infinity));
  const ticks = log
    ? Array.from({ length: top + 1 }, (_, k) => 10 ** k)
    : Array.from({ length: Math.round(end / step) + 1 }, (_, k) => k * step);
  const tick = (y: number) => (y >= 1e6 ? `${y / 1e6}M` : y >= 1000 ? `${(y / 1000).toLocaleString("en-US")}k` : `${y}`);
  return (
    <section data-m aria-label="When we would hear back" className="mt-5 rounded-xl border border-faint bg-paper px-3 pt-2.5 pb-3">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] tracking-[.1em] text-muted uppercase">When we would hear back</span>
        <span className="font-mono text-[10px] text-muted">from now</span>
      </div>
      <ul className="mt-2 flex flex-col gap-2">
        {sorted.map((r) => {
          const wait = r.home === null ? null : r.home - now;
          return (
            <li key={r.key}>
              <button onClick={() => onPick(r.key)} className="group block w-full text-left">
                <div className="flex items-baseline justify-between gap-2 text-[12.5px] leading-snug">
                  <span className={r.ours ? "font-semibold text-you" : "text-ink group-hover:text-you"}>
                    {r.label}
                    {r.ours && <span className="ml-1.5 rounded-full bg-you px-1.5 py-px align-[1px] font-mono text-[8.5px] tracking-[.08em] text-paper">CHOSEN</span>}
                  </span>
                  <span className="shrink-0 font-mono text-[11px] text-muted tabular-nums">
                    {wait === null ? (r.never ?? "never") : <><span className={r.ours ? "text-you" : "text-ink"}>{span(wait)}</span> · Year {yearText(r.home!)}</>}
                  </span>
                </div>
                <div className="relative mt-1 h-[6px] rounded-full bg-track">
                  {wait !== null && (
                    <span
                      className={`absolute inset-y-0 left-0 rounded-full ${r.ours ? "bg-you shadow-[0_0_8px_var(--you)]" : "bg-page-ink2/50 group-hover:bg-you/60"}`}
                      style={{ width: `${at(wait) * 100}%` }}
                    />
                  )}
                </div>
                <span className="mt-0.5 block text-[11px] text-muted">{r.brings}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {/* The ruler, under the bars. */}
      <div className="relative mt-1.5 h-3 font-mono text-[9px] text-muted">
        {ticks.map((y) => (
          <span key={y} className={`absolute ${y === ticks.at(-1) ? "-translate-x-full" : y === ticks[0] ? "" : "-translate-x-1/2"}`} style={{ left: `${at(y) * 100}%` }}>
            {tick(y)}
          </span>
        ))}
      </div>
      <p className="mt-1 text-center font-mono text-[9px] text-muted">{log ? "Years, each step ten times longer" : "Years from now"}</p>
    </section>
  );
}
