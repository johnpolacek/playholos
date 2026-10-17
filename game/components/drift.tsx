"use client";

import { useEffect, useRef } from "react";
import { ScreenBar } from "@/components/screen-bar";
import { currentScheme, useScheme } from "@/components/theme-toggle";
import type { Drift as Scene } from "@/lib/drift";
import { gsap, prefersReducedMotion, rise, riseFrom, useGSAP, useStage } from "@/lib/motion";

const AU_KM = 149597870.7;
const LIGHT_KMS = 299792.458;

// Where the view is, by its distance from Earth in AU. The map's own stage names, with the Moon and the Oort cloud.
const PLACES: [upTo: number, name: string][] = [
  [0.0035, "EARTH"],
  [0.06, "EARTH AND MOON"],
  [400, "SOLAR SYSTEM"],
  [1.2e5, "OORT CLOUD"],
  [2e8, "NEARBY STARS"],
  [2.5e10, "MILKY WAY"],
  [Infinity, "LOCAL GROUP"],
];

/** A distance as the time light takes to cross it: kilometers up close, then light-seconds out to light-years. */
function lightTime(au: number) {
  const km = au * AU_KM;
  const s = km / LIGHT_KMS;
  const fixed = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: n < 10 ? 1 : 0 });
  if (s < 1) return `${fixed(Number(km.toPrecision(2)))} km`;
  if (s < 60) return `${fixed(s)} light-seconds`;
  if (s < 3600) return `${fixed(s / 60)} light-minutes`;
  if (s < 172800) return `${fixed(s / 3600)} light-hours`;
  const days = s / 86400;
  if (days < 365.25) return `${fixed(days)} light-days`;
  const years = days / 365.25;
  if (years < 1e6) return `${fixed(Number(years.toPrecision(years < 1000 ? 3 : 2)))} light-years`;
  return `${fixed(years / 1e6)} million light-years`;
}

export type Look = "drift" | "atlas";

// The first screen, before Earth wakes. No title, only the sky: the view drifts out from Earth past the Moon, the
// planets and the nearby stars to the Milky Way and the Local Group, then home, and says where it is and how far light
// takes to get there. Begin game dives home to Earth. For comparison, `look` "atlas", or ?look=atlas in the address,
// draws the same flight with the map's own line-art scene instead. Screens given one `epoch` fly in step.
export function Drift({ onNext, look, epoch }: { onSkip(): void; onNext(): void; look?: Look; epoch?: number }) {
  const root = useRef<HTMLDivElement>(null);
  const sky = useRef<HTMLDivElement>(null);
  const place = useRef<HTMLSpanElement>(null);
  const far = useRef<HTMLSpanElement>(null);
  const scene = useRef<Scene>(undefined);
  const going = useRef(false);
  const scheme = useScheme();

  const { leave } = useStage(root, (q, tl) => {
    tl.fromTo(q('[data-m="sky"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 2.8, ease: "power1.inOut" }, 0)
      .fromTo(q('[data-m="kick"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 1.4)
      .fromTo(q('[data-m="where"]'), riseFrom, { ...rise, duration: 0.7, stagger: 0.15 }, 1.8)
      .fromTo(q('[data-m="act"]'), riseFrom, { ...rise, duration: 0.7 }, 2.4);
  });
  const { contextSafe } = useGSAP({ scope: root });

  useEffect(() => {
    const el = sky.current;
    if (!el) return;
    let gone = false;
    let mounted: Scene | undefined;
    // Written straight to the page each frame, not through React.
    const show = (au: number) => {
      const name = PLACES.find(([upTo]) => au < upTo)![1];
      const away = au < 1e-9 ? "" : `${lightTime(au)} from Earth`;
      if (place.current && place.current.textContent !== name) {
        place.current.textContent = name;
        gsap.fromTo(place.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, overwrite: true });
      }
      if (far.current && far.current.textContent !== away) far.current.textContent = away;
    };
    const atlas = (look ?? new URLSearchParams(location.search).get("look")) === "atlas";
    const options = { theme: currentScheme(), still: prefersReducedMotion(), epoch, onFrame: show };
    const mount = async (): Promise<Scene | undefined> => {
      if (!atlas) return (await import("@/lib/drift")).mountDrift(el, options);
      const { mountAtlasDrift } = await import("@/lib/atlas");
      return gone ? undefined : mountAtlasDrift(el, options);
    };
    mount()
      .then((made) => {
        if (!made) return;
        if (gone) return made.dispose();
        mounted = made;
        scene.current = made;
      })
      // No WebGL: the screen keeps its button on the plain page.
      .catch(() => {});
    return () => {
      gone = true;
      mounted?.dispose();
      scene.current = undefined;
    };
  }, [look, epoch]);

  useEffect(() => scene.current?.setTheme(scheme), [scheme]);

  // The words leave, the view falls home to Earth, then the sky goes and Earth wakes.
  const begin = () =>
    contextSafe(() => {
      if (going.current) return;
      going.current = true;
      const secs = scene.current?.home() ?? 0;
      if (!secs) return leave(onNext);
      gsap.to(gsap.utils.toArray('[data-m="act"], [data-m="where"], [data-m="kick"]', root.current), {
        autoAlpha: 0,
        y: -8,
        duration: 0.3,
        ease: "power2.in",
        stagger: 0.05,
        overwrite: true,
      });
      gsap.delayedCall(Math.max(0, secs - 0.4), () => leave(onNext));
    })();

  return (
    <div ref={root} className="relative flex grow flex-col overflow-hidden bg-paper">
      <div ref={sky} data-m="sky" aria-hidden className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-linear-to-t from-paper/85 to-transparent" />
      <div className="relative px-6 wide:px-10">
        <ScreenBar />
      </div>
      <div className="relative mt-auto flex flex-col items-center px-6 pb-12">
        <div data-m="where" className="font-mono text-[10.5px] tracking-[.1em] text-muted">
          <span ref={place}>EARTH</span>
        </div>
        <div data-m="where" className="mt-1 mb-7 h-4 font-mono text-[10.5px] text-muted tabular-nums">
          <span ref={far} />
        </div>
        <button
          data-m="act"
          onClick={begin}
          className="h-[46px] w-[220px] rounded-full border border-ink text-[15px] font-medium transition-colors duration-300 hover:bg-ink hover:text-paper"
        >
          Begin game
        </button>
      </div>
    </div>
  );
}
