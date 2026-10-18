import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";

// The Mind's mark beside its name: Sol, in ink, circling the Mind's blue core, which breathes. Plainer than the
// corner's mark, so it reads at the size of the name. Drawn on a 16-unit grid around the center.
function MindMark() {
  const root = useRef<SVGSVGElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.to('[data-mark="sol"]', { rotation: 360, svgOrigin: "0 0", duration: 9, ease: "none", repeat: -1 });
      const breath = { svgOrigin: "0 0", duration: 2, ease: "sine.inOut", yoyo: true, repeat: -1 };
      gsap.fromTo('[data-mark="core"]', { scale: 0.85 }, { scale: 1.1, ...breath });
      gsap.fromTo('[data-mark="halo"]', { scale: 1.1 }, { scale: 0.85, ...breath });
    },
    { scope: root },
  );
  return (
    <svg ref={root} width={15} height={15} viewBox="-8 -8 16 16" overflow="visible" aria-hidden className="shrink-0">
      <circle r={6.5} fill="none" className="stroke-faint" />
      <circle data-mark="halo" r={3.8} className="fill-you/20" />
      <circle data-mark="core" r={2.2} className="fill-you" />
      <g data-mark="sol">
        <circle cx={6.5} r={1.3} className="fill-ink" />
      </g>
    </svg>
  );
}

// The Mind's words, set off by one corner. Its mark and name sit in the top edge, the top fades out to the right, and
// the side fades down. Settled 2026-10-18, from explorations/mind-voice-edge.html.
export function MindNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative pr-1 pb-3 pl-3 text-[12.5px] leading-[1.4]">
      <span
        aria-hidden
        className="absolute top-2 bottom-0 left-0 w-[9px] rounded-tl-xl border-t border-l border-you/40 [mask-image:linear-gradient(black,transparent)]"
      />
      <div className="mb-1.5 flex h-4 items-center gap-[7px]">
        <MindMark />
        <span className="font-mono text-[9.5px] tracking-[.1em] whitespace-nowrap text-you">THE MIND</span>
        <span aria-hidden className="mt-2 h-px flex-1 self-start bg-linear-to-r from-you/40 to-transparent to-90%" />
      </div>
      {children}
    </div>
  );
}
