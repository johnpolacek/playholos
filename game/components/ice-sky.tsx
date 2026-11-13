import { useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { tenths, yearText } from "@/lib/game/clock";
import { type Death, ICE, iceBetween, iceFirsts, iceLatest, iceRange, MLY } from "@/lib/game/natural";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";

// What our Deep Ice Watch hears, drawn: us at the middle, the galaxies round us out to 83 million ly, and each star's
// death where its neutrinos place it. A star that exploded is a point. One that died dark, with no flash, is a ring.
// The watch gives how far, never where: a death in a galaxy we can name sits on it, and a farther one at a drawn
// direction, as our telescopes later place it. Distances are drawn by their square root, so the near galaxies, where
// most of what we can name lies, don't crowd the middle. lib/game/natural.ts, 2026-11-11.

const [CX, CY, R] = [150, 96, 88];
const out = (mpc: number) => R * Math.sqrt(mpc / ICE.darkMpc);
const at = (mpc: number, ra: number) => {
  const a = (ra / 24) * 2 * Math.PI;
  return [CX + out(mpc) * Math.cos(a), CY - out(mpc) * Math.sin(a)] as const;
};
const mly = (mpc: number) => Math.round(mpc * MLY);
/** The galaxies named on the drawing: those that give the most deaths, and are far enough apart to read. */
const NAMED = new Set(["M31", "M83", "NGC 253", "M82", "IC 342"]);
/** How many Years back the drawing shows. */
const BACK = 20;

/** The galaxies round us, with the deaths our Deep Ice Watch heard after `from` and by `to`, at most the latest 20
 *  Years of them. `mark`, the first dark death made sure, is drawn however long ago it came, ringed. 2026-11-13. */
export function IceSky({ seed, since, from, to, mark }: { seed: number; since: number; from: number; to: number; mark?: Death }) {
  const root = useRef<SVGSVGElement>(null);
  const deaths = useMemo(() => iceLatest(seed, since, from, to, BACK), [seed, since, from, to]);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo("[data-death]", { autoAlpha: 0, scale: 3.5, transformOrigin: "50% 50%" }, { autoAlpha: 1, scale: 1, duration: 0.5, stagger: { amount: 1.8 }, ease: "power2.out" });
      gsap.fromTo("[data-mark-pulse]", { scale: 1, autoAlpha: 0.8, transformOrigin: "50% 50%" }, { scale: 3.2, autoAlpha: 0, duration: 2.4, repeat: -1, ease: "power1.out" });
    },
    { scope: root, dependencies: [seed, since, from, to, mark] },
  );
  const bright = deaths.filter((d) => !d.dark).length;
  return (
    <svg
      ref={root}
      viewBox="0 0 300 192"
      className="w-full"
      role="img"
      aria-label={`The galaxies round us, with ${bright} stars that exploded and ${deaths.length - bright} that died dark`}
    >
      <defs>
        <radialGradient id="ice-reach">
          <stop offset="0" stopColor="var(--ink)" stopOpacity=".1" />
          <stop offset="1" stopColor="var(--ink)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={CX} cy={CY} r={R} fill="url(#ice-reach)" />
      {[ICE.brightMpc, ICE.darkMpc].map((mpc) => (
        <circle key={mpc} cx={CX} cy={CY} r={out(mpc)} fill="none" stroke="var(--ink)" strokeOpacity=".22" strokeDasharray="1.5 3" />
      ))}
      {ICE.hosts.map((h) => {
        const [x, y] = at(h.mpc, h.ra);
        return <circle key={h.name} cx={x} cy={y} r={1.2 + 1.6 * Math.sqrt(h.rate)} fill="var(--ink)" fillOpacity=".16" />;
      })}
      {deaths.map((d, i) => {
        const [x, y] = at(d.mpc, d.ra);
        return d.dark ? (
          <circle key={i} data-death cx={x} cy={y} r="2" fill="none" stroke="var(--other)" strokeWidth="1" />
        ) : (
          <circle key={i} data-death cx={x} cy={y} r="1.3" fill="var(--ink)" fillOpacity=".85" />
        );
      })}
      {mark &&
        (() => {
          const [x, y] = at(mark.mpc, mark.ra);
          return (
            <g>
              <circle data-mark-pulse cx={x} cy={y} r="3" fill="none" stroke="var(--other)" strokeWidth=".8" />
              <circle cx={x} cy={y} r="3" fill="none" stroke="var(--other)" strokeWidth="1.4" />
              <circle cx={x} cy={y} r="5.5" fill="none" stroke="var(--other)" strokeOpacity=".5" strokeWidth=".6" strokeDasharray="1 1.6" />
            </g>
          );
        })()}
      {/* Words last and outlined in the page's own dark, so the deaths drawn under them never hide them. */}
      <g stroke="var(--panel)" strokeWidth="2.4" paintOrder="stroke" strokeLinejoin="round">
        {[ICE.brightMpc, ICE.darkMpc].map((mpc) => (
          <text key={mpc} x={CX} y={CY - out(mpc) + 9} textAnchor="middle" className="fill-muted font-mono" fontSize="7">
            {mly(mpc)} million ly
          </text>
        ))}
        {ICE.hosts.filter((h) => NAMED.has(h.name)).map((h) => {
          const [x, y] = at(h.mpc, h.ra);
          return (
            <text key={h.name} x={x + 5} y={y + 2.5} className="fill-muted font-mono" fontSize="6.5">
              {h.name}
            </text>
          );
        })}
        <text x={CX + 5} y={CY + 3} className="fill-muted font-mono" fontSize="8">
          us
        </text>
        {mark &&
          (() => {
            const [x, y] = at(mark.mpc, mark.ra);
            const left = x > CX;
            return (
              <text x={left ? x - 8 : x + 8} y={y - 6} textAnchor={left ? "end" : "start"} className="fill-other font-mono" fontSize="6.5">
                the first sure
              </text>
            );
          })()}
      </g>
      <circle cx={CX} cy={CY} r="2.4" fill="var(--you)" />
    </svg>
  );
}

/** The drawing's key: a point for a star that exploded, a ring for one that died dark. */
export function IceKey() {
  return (
    <p className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] tracking-[.06em] text-muted uppercase">
      <span className="flex items-center gap-1.5">
        <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden>
          <circle cx="4" cy="4" r="2" fill="var(--ink)" />
        </svg>
        Exploded
      </span>
      <span className="flex items-center gap-1.5">
        <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden>
          <circle cx="4" cy="4" r="2.6" fill="none" stroke="var(--other)" />
        </svg>
        Died dark, no flash
      </span>
    </p>
  );
}

/** On the Deep Ice Watch's page once it is done: the last 20 Years of what it heard, its counts, and its firsts. */
export function IceHeard({ seed, since, now }: { seed: number; since: number; now: number }) {
  const to = tenths(now);
  const { bright, dark } = useMemo(() => iceBetween(seed, since, since, to), [seed, since, to]);
  const f = iceFirsts(seed, since);
  const n = (x: number) => x.toLocaleString("en-US");
  const range = iceRange();
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-mono text-[10px] tracking-[.1em] text-muted uppercase">
        What it has heard · {to - since > BACK ? `the last ${BACK} Years` : `since Year ${yearText(since)}`}
      </h2>
      <IceSky seed={seed} since={since} from={since} to={to} mark={to >= f.sure ? f.dark : undefined} />
      <IceKey />
      <p className="text-[13px] leading-snug text-page-ink2">
        Since Year {yearText(since)} it has heard {n(bright)} star{bright === 1 ? "" : "s"} explode and{" "}
        <span className="text-other">{n(dark)}</span> burst{dark === 1 ? "" : "s"} that no flash followed.{" "}
        {to >= f.settled
          ? `About 1 heavy star in ${range.mid} dies dark, between 1 in ${range.low} and 1 in ${range.high}. Settled at Year ${yearText(f.settled)}.`
          : to >= f.sure
            ? `One is sure, since Year ${yearText(f.sure)}: a telescope found the star gone. How large a share die dark isn’t settled yet.`
            : "None is sure yet. That takes one near enough to read, and a telescope to find the star gone."}
      </p>
      {to >= f.sure && f.dark && <FirstDark death={f.dark} sure={f.sure} />}
    </section>
  );
}

/** The first dark death made sure, told: where, when, what it means, and the Mind to ask. A jump's row for it led only
 *  to this page, which gave it one line. Playtest 2026-11-13. Its id is the row's anchor. */
function FirstDark({ death, sure }: { death: Death; sure: number }) {
  const box = useRef<HTMLDivElement>(null);
  const { hash } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (hash === "#dark") box.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
  }, [hash]);
  const far = `about ${mly(death.mpc).toLocaleString("en-US")} million ly away`;
  const where = death.host ? `the galaxy ${death.host}, ${far}` : `a galaxy ${far}`;
  return (
    <div id="dark" ref={box} className="mt-2 scroll-mt-4 rounded-lg border border-other/50 p-3">
      <span className="font-mono text-[10px] tracking-[.1em] text-other uppercase">The first dark death</span>
      <p className="mt-1.5 text-[13.5px] leading-snug">
        At Year {yearText(death.at)} a burst of neutrinos reached us from {where}. They ran hot, then stopped short. That is how a
        heavy star sounds when its core falls straight into a black hole. No flash followed.
      </p>
      <p className="mt-1.5 text-[13.5px] leading-snug">
        At Year {yearText(sure)} our telescopes looked where the star had been. It was gone. Before, there were only two
        candidates, N6946-BH1 and M31-2014-DS1, and both were disputed. Now we know some heavy stars end in silence.
      </p>
      <p className="mt-1.5 text-[13px] leading-snug text-page-ink2">
        It tells us how many black holes the stars make, and so how many lie dark between them. None of it is a mind.
      </p>
      <button
        onClick={() =>
          navigate(`/play/mind?ask=${encodeURIComponent(`A star died dark in ${death.host ?? "a galaxy " + far}. What does it tell us?`)}`)
        }
        className="mt-3 h-[40px] w-full rounded-full border border-other text-[14px] font-medium text-other"
      >
        Ask the Mind what it means
      </button>
    </div>
  );
}
