import { Link } from "react-router";
import { Queueing, Waits } from "@/components/build-page";
import { BuildMark, buildTone } from "@/components/marks";
import { usePlan, useSchedule } from "@/components/picks";
import { type Build, buildSlug, LATER, type Later, matter, ordered } from "@/lib/game/plan";

// The card the Mind offers when the Will asks what to build: the build it advises, drawn as on its page, where it
// stands in our order, and the same button that queues it there. Nothing is queued until the Will taps. Under it, the
// way to its whole page, to weigh it beside the rest, which comes back here. Settled 2026-10-28.
export function BuildCard({
  build,
  how,
  back = { to: "/play/mind", label: "The Mind" },
  place,
}: {
  build: Build | Later;
  /** What it would do for the thing we're looking at, in place of its usual line. The review's, 2026-11-08. */
  how?: string;
  /** Where its page's back leads, with any state to open there as we left it. */
  back?: { to: string; label: string; state?: unknown };
  /** The place in our queue the Mind advised, 1 for first. */
  place?: number;
}) {
  const { plan } = usePlan();
  const { scale, done } = useSchedule();
  const later = LATER.find((b) => b.name === build.name);
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-rowline bg-paper p-3.5">
      <div className="flex items-start gap-2.5">
        <span className={`mt-[2px] shrink-0 ${buildTone(build.name, ordered(plan).includes(build.name))}`}>
          <BuildMark name={build.name} size={20} />
        </span>
        <div className="flex flex-col">
          <span className="text-[15px] leading-snug font-medium">{build.name}</span>
          <span className="text-[13px] leading-snug text-page-ink2">
            {how ?? build.what}
            {matter(plan, build.name)}
          </span>
        </div>
      </div>
      {later ? <Waits build={later} scale={scale} done={done} /> : <Queueing name={build.name} scale={scale} done={done} place={place} />}
      <Link
        to={`/play/build/${buildSlug(build.name)}`}
        state={{ back }}
        className="mt-1.5 self-start font-mono text-[11px] tracking-[.06em] text-muted uppercase transition-colors hover:text-ink"
      >
        See it on Build ›
      </Link>
    </div>
  );
}
