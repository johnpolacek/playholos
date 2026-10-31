import { useRef } from "react";
import { round } from "@/lib/about/dials";
import {
  COLD,
  FROM,
  glow,
  peak,
  SEARCHES,
  SOURCES,
  TO,
  WARM,
  where,
} from "@/lib/about/quiet";
import { Stat } from "./ages";
import { color, KICK, Sources, useCanvas } from "./dials";

// Why the sky is quiet, on /about/research: a mind's glow slides from where we searched to where we barely have, as it
// runs colder. It drifts on its own until a reader takes the slider.

const STEPS = 1000,
  DRIFT = 18,
  PAD = 12,
  TOP = 20;
const toSlider = (T: number) =>
  Math.round((Math.log(T / COLD) / Math.log(WARM / COLD)) * STEPS);
const fromSlider = (n: number) => COLD * (WARM / COLD) ** (n / STEPS);

function Glow() {
  const held = useRef<number | null>(null);
  const slider = useRef<HTMLInputElement>(null);
  const said = useRef<HTMLParagraphElement>(null);
  const shown = useRef("");
  const ref = useCanvas((c, w, h, t) => {
    // The temperature: the reader's, or a slow drift between warm and cold, or Garrett's 12 K when nothing moves.
    const swing = 0.5 - 0.5 * Math.cos((2 * Math.PI * t) / DRIFT);
    const T =
      held.current ??
      (t === 0 ? 12 : WARM * (COLD / WARM) ** (0.08 + 0.84 * swing));
    const x = (um: number) =>
      PAD + (Math.log(um / FROM) / Math.log(TO / FROM)) * (w - 2 * PAD);
    const rows = SEARCHES.length,
      rowH = 18,
      base = h - rows * rowH - 34;
    const ink = color("--ink"),
      other = color("--other"),
      muted = color("--muted");
    c.font = "10.5px var(--font-plex-mono), monospace";
    // The searches, a row each, beneath the curve, with their reach drawn up faintly.
    SEARCHES.forEach((s, i) => {
      const y = base + 30 + i * rowH,
        a = x(s.from),
        b = x(s.to);
      c.fillStyle = muted;
      c.globalAlpha = 0.06;
      c.fillRect(a, TOP, b - a, base - TOP);
      c.globalAlpha = 0.7;
      c.fillRect(a, y, b - a, 3);
      c.globalAlpha = 1;
      const label = `${s.name.toUpperCase()} · ${s.reach.toUpperCase()}`,
        lw = c.measureText(label).width;
      c.fillText(label, b + 6 + lw > w - PAD ? a - 6 - lw : b + 6, y + 4);
    });
    // Microns.
    c.fillStyle = muted;
    c.fillRect(PAD, base, w - 2 * PAD, 1);
    for (const um of [1, 10, 100, 1000]) {
      c.fillRect(x(um), base, 1, 4);
      c.fillText(um.toLocaleString("en-US"), x(um) - 4, base + 16);
    }
    c.fillText("MICRONS", w - PAD - c.measureText("MICRONS").width, base + 16);
    // A warm build, as Earth's own works would glow, for scale.
    const curve = (temp: number) => {
      c.beginPath();
      for (let i = 0; i <= 240; i++) {
        const um = FROM * (TO / FROM) ** (i / 240),
          y = base - glow(temp, um) * (base - TOP - 10);
        if (i) c.lineTo(x(um), y);
        else c.moveTo(x(um), y);
      }
    };
    c.strokeStyle = muted;
    c.globalAlpha = 0.5;
    c.setLineDash([3, 4]);
    curve(WARM);
    c.stroke();
    c.setLineDash([]);
    c.globalAlpha = 1;
    c.fillText("ROOM TEMPERATURE", x(peak(WARM)) - 50, TOP + 2);
    // The mind's glow, filled.
    curve(T);
    c.lineTo(x(TO), base);
    c.lineTo(x(FROM), base);
    c.closePath();
    c.fillStyle = other;
    c.globalAlpha = 0.18;
    c.fill();
    c.globalAlpha = 1;
    c.strokeStyle = other;
    c.lineWidth = 1.5;
    curve(T);
    c.stroke();
    c.lineWidth = 1;
    c.fillStyle = ink;
    const tag = `${round(T)} K`;
    c.fillText(tag, x(peak(T)) - c.measureText(tag).width / 2, TOP + 14);
    // The slider and the words follow the drift, set only when they change.
    if (held.current === null && slider.current)
      slider.current.value = String(toSlider(T));
    const k = WARM / T;
    const line = `At ${round(T)} K, a mind’s glow peaks near ${round(peak(T))} microns, ${where(peak(T))}. Each thought costs ${round(k)} times less heat than at room temperature, but shedding each watt takes ${round(k ** 4)} times the radiator.`;
    if (said.current && line !== shown.current) {
      said.current.textContent = line;
      shown.current = line;
    }
  });
  return (
    <div data-a>
      <canvas ref={ref} aria-hidden className="h-[340px] w-full" />
      <label className="mt-4 flex items-center gap-4">
        <span className={KICK}>WARM</span>
        <input
          ref={slider}
          type="range"
          min={0}
          max={STEPS}
          defaultValue={toSlider(12)}
          aria-label="How cold a mind runs"
          onInput={(e) => (held.current = fromSlider(+e.currentTarget.value))}
          className="w-full max-w-[420px] accent-[var(--other)]"
          style={{ direction: "rtl" }}
        />
        <span className={KICK}>COLD</span>
      </label>
      <p
        ref={said}
        className="mt-4 min-h-[4.5em] max-w-[60ch] text-[15px] leading-[1.55]"
      />
    </div>
  );
}

export function Quiet() {
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
        A mind that thinks cold glows faintly, at wavelengths we have barely
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
      <div className="mt-8">
        <Glow />
        <Sources list={SOURCES} />
      </div>
    </section>
  );
}
