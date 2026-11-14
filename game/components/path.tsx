import { useState } from "react";
import { Link } from "react-router";
import { useOpenReadings } from "@/components/close-reading";
import { useGame } from "@/components/game-provider";
import { usePlan, useSchedule } from "@/components/picks";
import { useLeads } from "@/components/scan";
import { buildSlug } from "@/lib/game/plan";
import { inOrder } from "@/lib/game/reach";

// Our path: what the game is for, in three stages, each a trail of steps lit as we take them, with the next one named
// and a way to take it. At Year 4,200 a player had built everything they knew of, asked "what should I be doing?",
// and didn't know the Seed Ship could carry us to a star. Playtest 2026-11-05.

type Step = {
  label: string;
  /** Done, under way, or not yet. */
  at: "done" | "going" | "todo";
  /** Where to take it. A step only time brings, as an answer, has none. */
  to?: string;
  /** Why it can't be taken yet, said under it: a blind first-timer tapped "Read a glow’s light", got nothing, and
   *  learned only from the Mind that it needs a warm glow and our Infrared Telescope. 2026-11-07. */
  waits?: string;
  /** The way to land on when it opens a star on Reach, as a Scan row's next move does. */
  engage?: boolean | string;
};
type Stage = { name: string; steps: Step[] };

export function usePath(): { stages: Stage[]; next: Step | null } {
  const { save, year } = useGame();
  const { plan } = usePlan();
  const { done } = useSchedule();
  const { leads, minds, visits, heard } = useLeads();
  const open = useOpenReadings();
  const now = year ?? 0;
  const scope = done["Infrared Telescope"] != null && done["Infrared Telescope"]! <= now;
  const build = (name: string, label = `Build the ${name}`): Step => ({
    label,
    at: done[name] != null && done[name]! <= now ? "done" : inOrder(plan, name) ? "going" : "todo",
    to: `/play/build/${buildSlug(name)}`,
  });
  const warm = (name: string) => name.startsWith("Warm glow ");
  const firstGlow = leads.find((l) => l.slug.startsWith("warm-glow-"));
  const read = !!minds?.flashes.some((f) => f.read);
  const close = (plan.sentinels ?? []).some((o) => warm(o.name)) || (plan.flybys ?? []).some((o) => warm(o.name));
  const found =
    visits.some((v) => v.sight === "works") || !!minds?.watcher || (minds?.sleepers.length ?? 0) > 0 || !!minds?.glows.some((g) => g.near !== undefined || g.imaged !== undefined);
  // Where our Mind could stay: the nearest world we have felt, or the world next door.
  const home = leads.find((l) => l.what === "A new world") ?? leads.find((l) => l.slug === "proxima-centauri");
  const colony = plan.colony ? leads.find((l) => l.star === plan.colony!.name) : undefined;
  const stages: Stage[] = [
    {
      name: "Find life",
      steps: [
        build("Warm Sky Watch", "Watch for warm glows"),
        build("Infrared Telescope", "Range each glow"),
        { label: "Read a warm glow’s light", at: read ? "done" : (plan.closeReads ?? []).length ? "going" : "todo", // With no glow to read yet, only time brings one: no link, so Next skips it. It linked to Scan itself, and a blind
        // first-timer tapped it twice to no effect. 2026-11-07. Warm, since a cold glow has no such reading.
        to: open[0] ? `/play/lead/${open[0].slug}#close-reading` : undefined,
        waits: scope ? "Waits for a warm glow, ranged and still shining." : "Needs our Infrared Telescope, and a warm glow to read." },
        // To a glow we have, once we have one: with none, it opened Reach's list and a blind first-timer tapped it twice
        // for nothing at Year 0. 2026-11-07.
        { label: "Send a craft to a glow", at: close ? "done" : "todo", to: firstGlow ? `/play/reach/${firstGlow.slug}` : undefined, engage: true, waits: "Waits for a warm glow, ranged by our Infrared Telescope." },
        { label: "Find a mind", at: found ? "done" : close ? "going" : "todo" },
      ],
    },
    {
      name: "Spread",
      steps: [
        build("Deuterium Works"),
        build("Fusion Drive"),
        build("Seed Ship"),
        { label: "Send our Mind to stay", at: plan.colony ? "done" : "todo", to: home ? `/play/reach/${home.slug}` : "/play/reach", engage: home ? "mind" : undefined },
        { ...build("Mind Link", "Move the Will there"), at: save?.will ? "done" : inOrder(plan, "Mind Link") ? "going" : "todo", to: colony ? `/play/reach/${colony.slug}` : `/play/build/${buildSlug("Mind Link")}` },
      ],
    },
    // Calling out last, as Next takes it: calling tells others where we are, so Next never points a new player there
    // before we go. Shown between, it read as the step after the telescope and Next skipped it. The Will's call,
    // 2026-11-07.
    {
      name: "Make contact",
      steps: [
        { label: "Call out to a star", at: (save?.sent ?? []).length ? "done" : "todo", to: "/play/reach" },
        { label: "Hear an answer", at: heard.length ? "done" : (save?.sent ?? []).length ? "going" : "todo" },
      ],
    },
  ];
  // The next step we can take, in the order shown. A step only time brings is skipped.
  const next = stages.flatMap((s) => s.steps).find((s) => s.at === "todo" && s.to) ?? null;
  return { stages, next };
}

const DOT: Record<Step["at"], string> = {
  done: "bg-you border-you",
  going: "bg-panel border-you",
  todo: "bg-panel border-track",
};

/** Each stage as a trail: its steps as dots on a line, lit as we take them, the next one ringed and breathing. Tapped,
 *  it opens to name each step, with a way to take it. */
function Trail({ stage, next, open, toggle }: { stage: Stage; next: Step | null; open: boolean; toggle(): void }) {
  const lit = stage.steps.filter((s) => s.at === "done").length;
  const n = stage.steps.length;
  // The line runs lit only as far as the steps behind it are all done.
  const first = stage.steps.findIndex((s) => s.at !== "done");
  const run = first < 0 ? n : first;
  return (
    <div>
      <button onClick={toggle} aria-expanded={open} className="grid w-full grid-cols-[96px_1fr_34px] items-center gap-3 py-1 text-left">
        <span className="font-mono text-[10px] tracking-[.1em] text-muted uppercase">{stage.name}</span>
        <span className="relative flex h-4 items-center justify-between">
          <span className="absolute inset-x-1 top-1/2 h-px -translate-y-1/2 bg-track" />
          {run > 1 && (
            <span className="absolute top-1/2 left-1 h-[1.5px] -translate-y-1/2 bg-you" style={{ width: `calc(${((run - 1) / Math.max(1, n - 1)) * 100}% - 8px)` }} />
          )}
          {stage.steps.map((s) => (
            <span key={s.label} title={s.label} className="relative flex size-4 items-center justify-center">
              {s === next && <span className="absolute inset-0 animate-ping rounded-full border border-other motion-reduce:animate-none" />}
              <span className={`size-2.5 rounded-full border-[1.5px] ${DOT[s.at]}`} />
            </span>
          ))}
        </span>
        <span className="text-right font-mono text-[10.5px] text-muted tabular-nums">
          {lit}/{n}
        </span>
      </button>
      {open && (
        <ul className="mb-1 ml-[108px] flex flex-col gap-0.5">
          {stage.steps.map((s) => {
            const mark = s.at === "done" ? "✓" : s.at === "going" ? "◐" : "○";
            const words = (
              <>
                <span className={`mr-1.5 inline-block w-3 ${s.at === "todo" ? "text-muted" : "text-you"}`}>{mark}</span>
                {s.label}
                {s.at === "going" && <span className="text-muted"> · under way</span>}
              </>
            );
            return (
              <li key={s.label} className={`text-[12.5px] ${s.at === "done" ? "text-muted" : "text-ink"}`}>
                {s.to && s.at !== "done" ? (
                  <Link to={s.to} className="hover:underline">
                    {words} <span className="text-you">›</span>
                  </Link>
                ) : (
                  <>
                    {words}
                    {s.at === "todo" && s.waits && <span className="block pl-[18px] text-[11.5px] leading-snug text-muted">{s.waits}</span>}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Our path, on Scan: the three stages, and the next step to take. */
export function Path() {
  const { stages, next } = usePath();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <section className="mt-1 mb-3 rounded-xl border border-faint px-3 py-2.5">
      {/* Said what it is: a blind first-timer saw no goal until Year 11, then read these dots as decoration. 2026-11-07. */}
      <p className="mb-1.5 text-[12.5px] leading-snug text-page-ink2">
        <span className="mr-1.5 font-mono text-[10px] tracking-[.1em] text-muted uppercase">Our path</span>
        Find life, spread, make contact. Tap one for its steps.
      </p>
      <div className="flex flex-col">
        {stages.map((s) => (
          <Trail key={s.name} stage={s} next={next} open={open === s.name} toggle={() => setOpen(open === s.name ? null : s.name)} />
        ))}
      </div>
      {next?.to && (
        <Link to={next.to} className="mt-2.5 flex items-center justify-between gap-2 rounded-lg border border-you/40 bg-you/5 px-3 py-2 text-[13px] text-you transition-colors hover:border-you hover:bg-you/15">
          <span>
            <span className="mr-1.5 font-mono text-[10px] tracking-[.1em] text-other uppercase">Next</span>
            {next.label}
          </span>
          <span aria-hidden>›</span>
        </Link>
      )}
    </section>
  );
}
