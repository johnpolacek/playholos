import { useSyncExternalStore } from "react";
import {
  behave,
  HOLOS,
  isHolos,
  RANGES,
  seen,
  type Behave,
} from "@/lib/about/behave";
import { round } from "@/lib/about/dials";

// How minds behave, on The Dials: power, temperature and sleep, shared with the quiet sky's heat chart, and a verdict
// against what our searches would already have seen.

const STEPS = 1000;

export const useBehave = () =>
  useSyncExternalStore(behave.subscribe, behave.get, behave.get);

function watts(w: number): string {
  const e = Math.floor(Math.log10(w)),
    m = +(w / 10 ** e).toFixed(1);
  const sup = String(e).replace(/[0-9]/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+d]);
  return m === 1 ? `10${sup} W` : `${m} × 10${sup} W`;
}

const SHOW: Record<keyof Behave, (v: number) => string> = {
  power: watts,
  cold: (v) => `${round(v)} K`,
  asleep: (v) => `${Math.round(v * 100)}%`,
};
const LABEL: Record<keyof Behave, string> = {
  power: "An awake mind’s power",
  cold: "How cold it runs",
  asleep: "Share asleep",
};
const LOG: Record<keyof Behave, boolean> = {
  power: true,
  cold: true,
  asleep: false,
};

const toSlider = (k: keyof Behave, v: number) => {
  const { lo, hi } = RANGES[k];
  return Math.round(
    (LOG[k] ? Math.log(v / lo) / Math.log(hi / lo) : (v - lo) / (hi - lo)) *
      STEPS,
  );
};
const fromSlider = (k: keyof Behave, n: number) => {
  const { lo, hi } = RANGES[k];
  return LOG[k] ? lo * (hi / lo) ** (n / STEPS) : lo + ((hi - lo) * n) / STEPS;
};

/** The verdict: how many awake minds our searches would already have seen. */
export function verdictLine(b: Behave): string {
  if (isHolos(b))
    return "These are the game’s own minds. It keeps each under what our searches would have seen at its distance, checked star or not, so none would have shown.";
  const n = seen(b);
  if (n >= 1.5)
    return `About ${round(n)} awake minds would already shine in our searches. We see none, so minds like this are ruled out.`;
  if (n >= 0.05)
    return `About a 1 in ${round(1 / n)} chance that our searches would already have caught one. Unlikely, not ruled out.`;
  return "Our searches would almost surely have missed every one. Minds like this are still possible.";
}

export function BehaveDials() {
  const b = useBehave();
  const holos = (Object.keys(HOLOS) as (keyof Behave)[]).every(
    (k) => b[k] === HOLOS[k],
  );
  return (
    <div className="mt-10">
      <div className="flex items-baseline justify-between gap-4">
        <div className="font-mono text-[10.5px] tracking-[.1em] text-muted">
          HOW MINDS BEHAVE
        </div>
        {!holos && (
          <button
            type="button"
            onClick={() => behave.set(HOLOS)}
            className="rounded-full border border-faint px-3 py-1 font-mono text-[10.5px] tracking-[.1em] text-muted hover:text-ink"
          >
            HOLOS
          </button>
        )}
      </div>
      <ol className="mt-4 flex flex-col gap-6">
        {(Object.keys(RANGES) as (keyof Behave)[]).map((k) => (
          <li key={k}>
            <div className="flex items-baseline justify-between gap-4">
              <label
                htmlFor={`behave-${k}`}
                className="text-[15px] font-semibold"
              >
                {LABEL[k]}
              </label>
              <span className="font-mono text-[14px] tabular-nums">
                {SHOW[k](b[k])}
              </span>
            </div>
            <div className="relative mt-2">
              <input
                id={`behave-${k}`}
                type="range"
                min={0}
                max={STEPS}
                value={toSlider(k, b[k])}
                aria-valuetext={SHOW[k](b[k])}
                onChange={(e) =>
                  behave.set({ [k]: fromSlider(k, +e.target.value) })
                }
                className="relative z-10 w-full accent-[var(--other)]"
              />
              <span
                aria-hidden
                title="Holos"
                className="absolute top-full mt-0.5 h-1.5 w-px bg-muted"
                style={{ left: `${toSlider(k, HOLOS[k]) / 10}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10.5px] tracking-[.05em] text-muted">
              <span>{RANGES[k].left}</span>
              <span>{RANGES[k].right}</span>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-[15px] leading-[1.55]">{verdictLine(b)}</p>
      <p className="mt-2 text-[13.5px] leading-[1.5] text-muted">
        Holos’s marks are the game’s own: its awake old minds glow about 4 ×
        10²¹ W at the median, though from 10¹⁹ to 4 × 10²⁴ W, at 12 K, with half
        asleep. Their glow shows on the quiet sky’s heat chart, below.
      </p>
    </div>
  );
}
