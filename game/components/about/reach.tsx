import { useState } from "react";
import { round } from "@/lib/about/dials";
import { CRAFT, PLACES, SOURCES, trip } from "@/lib/about/reach";
import { Stat } from "./ages";
import { color, KICK, Sources, useCanvas } from "./dials";

// How far can we reach, on /about/research: every craft leaves the Sun together, and a clock runs from a year to ten
// billion, each step ten times the last, so the slow ones crawl and light races to Andromeda.

const NEAR = 1,
  FAR = 4e6,
  SWEEP = 22,
  REST = 3,
  PAD = 12,
  TOP = 40,
  ROW = 30;

const years = (y: number) =>
  `${round(y)} ${Math.round(y) === 1 ? "year" : "years"}`;

function Race({ pick }: { pick: string }) {
  const ref = useCanvas((c, w, h, t) => {
    const x = (ly: number) =>
      PAD +
      (Math.log(Math.max(NEAR, ly) / NEAR) / Math.log(FAR / NEAR)) *
        (w - 2 * PAD - 90);
    const ink = color("--ink"),
      other = color("--other"),
      you = color("--you"),
      muted = color("--muted");
    // The clock: years since launch, a tenfold step every couple of seconds, held a moment at ten billion.
    const loop = t % (SWEEP + REST);
    const age = t === 0 ? 1e4 : 10 ** (10 * Math.min(1, loop / SWEEP));
    c.font = "10.5px var(--font-plex-mono), monospace";
    // The places, a line down through every row.
    const bottom = TOP + CRAFT.length * ROW;
    PLACES.forEach((p, i) => {
      const px = x(p.ly),
        mind = p.name === "Nearest mind";
      c.fillStyle = mind ? other : muted;
      c.globalAlpha = mind ? 0.6 : 0.3;
      c.fillRect(px, TOP - 8, 1, bottom - TOP);
      c.globalAlpha = 1;
      c.fillText(p.name.toUpperCase(), px - 4, i % 2 ? TOP - 26 : TOP - 14);
    });
    // The Sun, where all leave from.
    c.fillStyle = you;
    c.beginPath();
    c.arc(x(NEAR), TOP + (CRAFT.length * ROW) / 2 - ROW / 2, 4, 0, 2 * Math.PI);
    c.fill();
    // Each craft, its row, its trail, where it is now.
    CRAFT.forEach((k, i) => {
      const y = TOP + i * ROW,
        on = k.key === pick;
      const flown = Math.max(0, age - k.extra) * k.c;
      const at = x(Math.min(FAR, flown));
      c.fillStyle = on ? other : ink;
      c.globalAlpha = on ? 0.5 : 0.18;
      c.fillRect(x(NEAR), y, at - x(NEAR), on ? 2 : 1);
      c.globalAlpha = flown >= NEAR ? 1 : 0.3;
      c.beginPath();
      c.arc(at, y, on ? 4 : 3, 0, 2 * Math.PI);
      c.fill();
      c.globalAlpha = 1;
      c.fillStyle = on ? ink : muted;
      c.fillText(k.name.toUpperCase(), w - PAD - 84, y + 4);
    });
    // Light-years, and the clock.
    c.fillStyle = muted;
    c.fillRect(PAD, bottom + 4, x(FAR) - PAD, 1);
    for (const ly of [1, 10, 100, 1e3, 1e4, 1e5, 1e6]) {
      c.fillRect(x(ly), bottom + 4, 1, 4);
      c.fillText(round(ly), x(ly) - 3, bottom + 20);
    }
    c.fillText("LIGHT-YEARS", x(FAR) - 60, bottom + 34);
    c.fillStyle = ink;
    c.font = "14px var(--font-plex-mono), monospace";
    c.fillText(`${years(age).toUpperCase()} AFTER LAUNCH`, PAD, h - 6);
  });
  return (
    <canvas
      ref={ref}
      aria-hidden
      className="w-full"
      style={{ height: TOP + CRAFT.length * ROW + 64 }}
    />
  );
}

export function Reach() {
  const [pick, setPick] = useState("seed");
  const k = CRAFT.find((x) => x.key === pick)!;
  const mind = PLACES.find((p) => p.name === "Nearest mind")!;
  const seed = CRAFT.find((x) => x.key === "seed")!;
  const voyager = CRAFT.find((x) => x.key === "voyager")!;
  return (
    <section
      id="reach"
      aria-label="How far can we reach"
      className="mx-auto max-w-[1180px] scroll-mt-16 px-4 pb-16"
    >
      <h2
        data-a
        className="text-[28px] leading-[1.15] font-semibold text-balance wide:text-[34px]"
      >
        How far can we reach?
      </h2>
      <p
        data-a
        className="mt-4 max-w-[60ch] text-[16px] leading-[1.6] text-page-ink2"
      >
        The stars are within reach, but slowly: even at a tenth of light speed,
        the nearest mind is thousands of years away.
      </p>
      <dl data-a className="mt-8 flex flex-wrap gap-x-10 gap-y-5">
        <Stat
          value={years(trip(voyager, PLACES[0].ly))}
          label="To the nearest star, at Voyager’s pace"
        />
        <Stat
          value={years(trip(seed, PLACES[0].ly))}
          label="To the nearest star, by our seed ship"
        />
        <Stat
          value={years(trip(seed, mind.ly))}
          label={`To the nearest mind, about ${round(mind.ly)} light-years`}
        />
      </dl>
      <div data-a className="mt-8">
        <Race pick={pick} />
        <div className="mt-4 flex flex-wrap gap-2">
          {CRAFT.map((x) => (
            <button
              key={x.key}
              type="button"
              onClick={() => setPick(x.key)}
              className={`rounded-full border px-3 py-1 font-mono text-[10.5px] tracking-[.1em] transition-colors ${x.key === pick ? "border-other text-other" : "border-faint text-muted hover:text-ink"}`}
            >
              {x.name.toUpperCase()}
            </button>
          ))}
        </div>
        <p className="mt-4 max-w-[60ch] text-[15px] leading-[1.55]">
          {k.name}, {k.note}:{" "}
          {PLACES.map(
            (p, i) =>
              `${i === PLACES.length - 1 ? "and " : ""}${p.name === "Nearest mind" || p.name.startsWith("Galaxy") ? `the ${p.name.replace("Nearest", "nearest")}` : p.name} in ${years(trip(k, p.ly))}`,
          ).join(", ")}
          .
        </p>
        <p className={`mt-3 ${KICK}`}>
          THE CLOCK STEPS TENFOLD EVERY FEW SECONDS
        </p>
        <Sources list={SOURCES} />
      </div>
    </section>
  );
}
