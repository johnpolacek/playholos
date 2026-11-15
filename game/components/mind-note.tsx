import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";

// The Mind's mark beside its name: Sol, in ink, circling the Mind's blue core, which breathes. Plainer than the
// corner's mark, so it reads at the size of the name. A still mark rests, Sol to the right. Drawn on a 16-unit grid
// around the center.
function MindMark({ still }: { still: boolean }) {
  const root = useRef<SVGSVGElement>(null);
  useGSAP(
    () => {
      if (still || prefersReducedMotion()) return;
      gsap.to('[data-mark="sol"]', { rotation: 360, svgOrigin: "0 0", duration: 9, ease: "none", repeat: -1 });
      const breath = { svgOrigin: "0 0", duration: 2, ease: "sine.inOut", yoyo: true, repeat: -1 };
      gsap.fromTo('[data-mark="core"]', { scale: 0.85 }, { scale: 1.1, ...breath });
      gsap.fromTo('[data-mark="halo"]', { scale: 1.1 }, { scale: 0.85, ...breath });
    },
    { scope: root, dependencies: [still], revertOnUpdate: true },
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
// the side fades down. Settled 2026-10-18, from explorations/mind-voice-edge.html. The caller sets the words' size.
// Inside a card that has its own rounded edge, the corner goes: two rounded corners read as a doubled line. 2026-11-02.
// Under the Instrument skin, 2026-11-15, a note is a strip of a teleprinter's tape, hw-tape in app/globals.css, and
// the corner and its line go: the paper's own edge sets the words off.
// Under the Log skin, 2026-11-15, a note is an annotation in the margin, in a quieter hand: italic, in the paler ink,
// hw-tape in app/globals.css, and the corner is a straight rule down the margin, with no line along its top.
// While the Mind is still writing it, a note says so with data-thinking, 2026-11-15. Under the Infrared skin it glows
// faintly warm then, behind its words, hw-tape in app/globals.css. No skin says it aloud: the words arriving do.
export function MindNote({
  className = "",
  still = false,
  edge = true,
  thinking = false,
  children,
}: {
  className?: string;
  still?: boolean;
  edge?: boolean;
  /** The Mind is still writing it. */
  thinking?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div data-thinking={thinking || undefined} className={`hw-tape relative pr-1 pb-3 pl-3 instrument:pt-2 instrument:pr-3 instrument:pb-4 instrument:pl-6 ${className}`}>
      {edge && (
        <span
          aria-hidden
          className="absolute top-2 bottom-0 left-0 w-[9px] rounded-tl-xl instrument:hidden border-t border-l border-you/40 [mask-image:linear-gradient(black,transparent)] log:top-1 log:rounded-none log:border-t-transparent log:[mask-image:linear-gradient(black_60%,transparent)]"
        />
      )}
      <div className="mb-1.5 flex h-4 items-center gap-[7px]">
        <MindMark still={still} />
        <span className="font-mono text-[9.5px] tracking-[.1em] whitespace-nowrap text-you">THE MIND</span>
        <span aria-hidden className="mt-2 h-px flex-1 self-start instrument:hidden log:invisible bg-linear-to-r from-you/40 to-transparent to-90%" />
      </div>
      {children}
    </div>
  );
}
