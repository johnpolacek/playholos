import { useState } from "react";
import { round } from "@/lib/about/dials";
import { ruledAbove } from "@/lib/about/haystack";
import { COLD, peak, SOURCES, WARM } from "@/lib/about/quiet";
import { Stat } from "./ages";
import { KICK, Sources } from "./dials";
import { Gauge, HeatChart, RadioChart } from "./haystack";

// Why the sky is quiet, on /about/research: what our searches rule out, and what is still possible. Heat, by how cold
// a mind runs. Radio, by how loud. And how much of the haystack we have searched at all.

const STEPS = 1000,
  SUN = 3.828e26;

/** A share of the Sun's power as people say it: "a ten-thousandth", "a third", "40 times". */
function share(f: number): string {
  if (f >= 1.5) return `${round(f)} times`;
  if (f >= 0.95) return "about all";
  if (f >= 0.01) return `about ${Math.round(f * 100)}%`;
  return `1 part in ${round(1 / f)}`;
}
const toSlider = (T: number) =>
  Math.round((Math.log(T / COLD) / Math.log(WARM / COLD)) * STEPS);
const fromSlider = (n: number) => COLD * (WARM / COLD) ** (n / STEPS);

function Part({
  title,
  says,
  children,
}: {
  title: string;
  says: string;
  children: React.ReactNode;
}) {
  return (
    <div data-a className="mt-14">
      <h3 className="text-[20px] leading-[1.25] font-semibold">{title}</h3>
      <p className="mt-2 max-w-[60ch] text-[15px] leading-[1.55] text-page-ink2">
        {says}
      </p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

export function Quiet() {
  const [T, setT] = useState(12);
  const warm = peak(T) < 30;
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
        Our searches rule out the loud and the bright. Cold, quiet minds fit in
        everything we have not yet looked at.
      </p>
      <dl data-a className="mt-8 flex flex-wrap gap-x-10 gap-y-5">
        <Stat value="None" label="Galaxies turning most starlight to heat" />
        <Stat
          value="5 million"
          label="Stars screened, no warm build confirmed"
        />
        <Stat value="6 × 10⁻¹⁸" label="Of the radio haystack searched" />
      </dl>

      <Part
        title="Heat"
        says="Every mind gives off heat. Above each line, a survey would have seen it. The colder a mind runs, the higher the lines climb, and the more room is left beneath them."
      >
        <HeatChart T={T} />
        <div className="mt-4 max-w-[560px]">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-[15px] font-semibold">How cold it runs</span>
            <span className="font-mono text-[14px] tabular-nums">
              {round(T)} K
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={STEPS}
            value={toSlider(T)}
            aria-label="How cold it runs"
            aria-valuetext={`${round(T)} K`}
            onChange={(e) => setT(fromSlider(+e.target.value))}
            className="mt-2 w-full accent-[var(--other)]"
            style={{ direction: "rtl" }}
          />
          <div className="mt-1 flex justify-between font-mono text-[10.5px] tracking-[.05em] text-muted">
            <span>AS WARM AS OUR COMPUTERS</span>
            <span>NEAR THE COLDEST SPACE ALLOWS</span>
          </div>
        </div>
        <p className="mt-4 max-w-[60ch] text-[15px] leading-[1.55]">
          {`At ${round(T)} K a mind glows near ${round(peak(T))} microns${warm ? ", where WISE mapped the whole sky" : ""}. 400 light-years away, it stays hidden under ${share(ruledAbove(T, 400) / SUN)} of the Sun’s power.`}
        </p>
        <p className={`mt-2 ${KICK}`}>
          DOTS: OLD MINDS AS THE GAME DRAWS THEM, ALL STILL UNSEEN
        </p>
      </Part>

      <Part
        title="Radio"
        says="Radio searches listened for steady tones from nearby stars. A tone louder than the line, from one of those stars, would have been heard. Old minds speak by tight beams aimed at each other, which never sweep past us."
      >
        <RadioChart />
      </Part>

      <Part
        title="How much we have searched"
        says="If every way a radio signal could hide were Earth’s oceans, all our searches together have checked about a hot tub’s worth."
      >
        <div className="max-w-[520px]">
          <Gauge />
        </div>
      </Part>

      <Sources list={SOURCES} />
    </section>
  );
}
