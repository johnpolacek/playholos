import { useEffect, useState } from "react";
import { round } from "@/lib/about/dials";
import {
  COLD,
  peak,
  SAY,
  SEARCHES,
  SOURCES,
  verdict,
  WARM,
  type Verdict,
} from "@/lib/about/quiet";
import { Stat } from "./ages";
import { color, KICK, Sources, useCanvas } from "./dials";

// Why the sky is quiet, on /about/research: turn how cold a mind runs and how far it is, and see which telescopes have
// looked at its glow. Warm minds glow where WISE searched the whole sky. Cold ones glow where only a few hundred
// nearby stars were checked.

const STEPS = 1000,
  NEAR = 10,
  FAR = 30000;
const logSlider = (v: number, lo: number, hi: number) =>
  Math.round((Math.log(v / lo) / Math.log(hi / lo)) * STEPS);
const fromLog = (n: number, lo: number, hi: number) =>
  lo * (hi / lo) ** (n / STEPS);

/** The glow's tint: orange at our computers' warmth, deepening to a dim violet near the coldest space allows. */
function tint(T: number): [number, number, number] {
  const f = Math.log(T / COLD) / Math.log(WARM / COLD);
  return [
    Math.round(110 + 145 * f),
    Math.round(40 + 90 * f ** 2),
    Math.round(150 - 110 * f),
  ];
}

/** The mind, a glowing ball, smaller the farther it is, its heat rippling out. */
function Orb({ T, ly }: { T: number; ly: number }) {
  const ref = useCanvas((c, w, h, t) => {
    const [r, g, b] = tint(T);
    const size = 10 + 46 * (1 - Math.log(ly / NEAR) / Math.log(FAR / NEAR));
    const cx = w / 2,
      cy = h / 2 - 8;
    // Ripples of heat, leaving the ball.
    for (let i = 0; i < 4; i++) {
      const k = (t * 0.35 + i / 4) % 1;
      c.strokeStyle = `rgba(${r},${g},${b},${0.35 * (1 - k)})`;
      c.lineWidth = 1.5;
      c.beginPath();
      c.arc(cx, cy, size + k * (Math.min(w, h) / 2 - size), 0, 2 * Math.PI);
      c.stroke();
    }
    const glow = c.createRadialGradient(cx, cy, 0, cx, cy, size * 1.6);
    glow.addColorStop(0, `rgba(${r},${g},${b},0.95)`);
    glow.addColorStop(0.6, `rgba(${r},${g},${b},0.35)`);
    glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
    c.fillStyle = glow;
    c.beginPath();
    c.arc(cx, cy, size * 1.6, 0, 2 * Math.PI);
    c.fill();
    c.fillStyle = color("--muted");
    c.font = "10.5px var(--font-plex-mono), monospace";
    const label = `ITS GLOW PEAKS NEAR ${round(peak(T))} MICRONS`;
    c.fillText(label, cx - c.measureText(label).width / 2, h - 4);
  });
  useEffect(
    () => void ref.current?.dispatchEvent(new Event("dials")),
    [T, ly, ref],
  );
  return <canvas ref={ref} aria-hidden className="h-[260px] w-full" />;
}

const PILL: Record<Verdict, string> = {
  searched: "border-other text-other",
  few: "border-other text-other",
  aimed: "border-faint text-ink",
  far: "border-faint text-muted",
  wrong: "border-faint text-muted",
  planned: "border-dashed border-faint text-muted",
};

function Dial(p: {
  label: string;
  lo: number;
  hi: number;
  value: number;
  set: (v: number) => void;
  left: string;
  right: string;
  show: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[15px] font-semibold">{p.label}</span>
        <span className="font-mono text-[14px] tabular-nums">{p.show}</span>
      </div>
      <input
        type="range"
        min={0}
        max={STEPS}
        value={logSlider(p.value, p.lo, p.hi)}
        aria-label={p.label}
        aria-valuetext={p.show}
        onChange={(e) => p.set(fromLog(+e.target.value, p.lo, p.hi))}
        className="mt-2 w-full accent-[var(--other)]"
      />
      <div className="mt-1 flex justify-between font-mono text-[10.5px] tracking-[.05em] text-muted">
        <span>{p.left}</span>
        <span>{p.right}</span>
      </div>
    </div>
  );
}

export function Quiet() {
  const [T, setT] = useState(12);
  const [ly, setLy] = useState(100);
  const rows = SEARCHES.map((s) => ({ s, v: verdict(s, T, ly) }));
  const names = (v: Verdict) =>
    rows
      .filter((r) => r.v === v)
      .map((r) => r.s.name)
      .join(" and ");
  const answer = names("searched")
    ? `${names("searched")} looked for this glow across the whole sky, and found nothing confirmed.`
    : names("few")
      ? `Only ${names("few")} looked for this glow, and only at a few hundred nearby stars.`
      : "No survey has looked for this glow this far out. Only a telescope aimed at this one star could catch it.";
  return (
    <section
      id="quiet"
      aria-label="Why is the sky quiet"
      className="mx-auto max-w-[1180px] scroll-mt-16 px-4 pb-16"
    >
      <h2
        data-a
        className="text-[28px] leading-[1.15] font-semibold text-balance wide:text-[34px]"
      >
        Why is the sky quiet?
      </h2>
      <p
        data-a
        className="mt-4 max-w-[60ch] text-[16px] leading-[1.6] text-page-ink2"
      >
        A mind that thinks cold glows faintly, in a kind of light we have barely
        searched.
      </p>
      <dl data-a className="mt-8 flex flex-wrap gap-x-10 gap-y-5">
        <Stat value="None" label="Galaxies turning most starlight to heat" />
        <Stat
          value="5 million"
          label="Stars screened, no warm build confirmed"
        />
        <Stat value="5 to 28 K" label="Where a mature mind may run" />
      </dl>

      <div className="mt-10 grid gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div data-a>
          <Orb T={T} ly={ly} />
          <div className="mt-6 flex flex-col gap-6">
            <Dial
              label="How cold it runs"
              lo={COLD}
              hi={WARM}
              value={T}
              set={setT}
              left="NEAR THE COLDEST SPACE ALLOWS"
              right="AS WARM AS OUR COMPUTERS"
              show={`${round(T)} K`}
            />
            <Dial
              label="How far away"
              lo={NEAR}
              hi={FAR}
              value={ly}
              set={setLy}
              left="10 LY"
              right="ACROSS THE GALAXY"
              show={`${round(ly)} ly`}
            />
          </div>
        </div>

        <div data-a>
          <div className={KICK}>WHO HAS LOOKED FOR THIS GLOW</div>
          <ul className="mt-3 flex flex-col">
            {rows.map(({ s, v }) => (
              <li
                key={s.name}
                className={`flex items-center justify-between gap-4 border-b border-rowline py-3 transition-opacity ${v === "searched" || v === "few" || v === "aimed" ? "" : "opacity-45"}`}
              >
                <div>
                  <div className="text-[15px] font-semibold">{s.name}</div>
                  <div className="text-[13px] text-muted">{s.reach}</div>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-3 py-1 font-mono text-[10.5px] tracking-[.1em] ${PILL[v]}`}
                >
                  {SAY[v].toUpperCase()}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[15px] leading-[1.55]">{answer}</p>
          <p className="mt-3 text-[13.5px] leading-[1.5] text-muted">
            Colder thinking costs less: each thought takes {round(WARM / T)}{" "}
            times less heat than at our computers’ warmth. The catch is shedding
            it, which takes {round((WARM / T) ** 4)} times the radiator for each
            watt.
          </p>
          <Sources list={SOURCES} />
        </div>
      </div>
    </section>
  );
}
