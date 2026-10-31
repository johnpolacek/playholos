import { round } from "@/lib/about/dials";
import { NEARBY_STARS, ruledAbove, STARS_PER_MIND } from "@/lib/about/haystack";
import { COLD, peak, SOURCES, WARM } from "@/lib/about/quiet";
import { Stat } from "./ages";
import { behave } from "@/lib/about/behave";
import { useBehave, verdictLine } from "./behave";
import { CheckedStars } from "./checked";
import { Sources } from "./dials";
import { HeatChart, RadioChart } from "./haystack";

// Why the sky is quiet, on /about/research: what our searches rule out, and what is still possible. Heat, by how cold
// a mind runs. Radio, by how loud.

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
  const b = useBehave();
  const T = b.cold;
  const setT = (cold: number) => behave.set({ cold });
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
        <Stat value="1,327" label="Nearby stars listened to, no steady tone" />
      </dl>

      <Part
        title="Heat"
        says="Every mind gives off heat. The solid region is ruled out at every star: the whole-sky maps would have seen it. The hatched region was checked more deeply, but only at a few hundred nearby stars. The colder a mind runs, the higher the lines climb."
      >
        <HeatChart b={b} />
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
        <p className="mt-2 max-w-[60ch] text-[15px] leading-[1.55]">
          At one mind per {STARS_PER_MIND.toLocaleString("en-US")} stars, the{" "}
          {NEARBY_STARS} stars checked deeply would hold about{" "}
          {(NEARBY_STARS / STARS_PER_MIND).toFixed(1)} minds. Finding none there
          is what we would expect, however bright minds are.
        </p>
        <p className="mt-2 max-w-[60ch] text-[15px] leading-[1.55]">
          The dots are awake minds at the power set on{" "}
          <a
            href="#dials"
            className="underline decoration-faint underline-offset-2"
          >
            The Dials
          </a>
          , a tenfold spread either way, or at Holos’s marks as the game draws
          them. A full ring would have been seen. A half ring would have been
          seen if its star was one the nearby surveys checked. {verdictLine(b)}
        </p>
      </Part>

      <Part
        title="Radio"
        says="Breakthrough Listen listened to 1,327 nearby stars for steady tones, about 15 minutes each. A tone louder than the line, from one of those stars, would have been heard. Those stars would hold about 0.8 minds, and old minds speak by tight beams aimed at each other, which never sweep past us."
      >
        <RadioChart />
      </Part>

      <Part
        title="Star by star"
        says="Every star within 20 light-years, and what each search found there. Bright stars were searched closely, dim ones only passed over by the whole-sky maps. Tap a star for its record."
      >
        <CheckedStars />
      </Part>

      <Sources list={SOURCES} />
    </section>
  );
}
