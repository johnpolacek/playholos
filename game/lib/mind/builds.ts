// What Earth can build, and how far our order has come, for the Mind. Without it the Mind named builds that don't
// exist, guessed whether a watch was done, and called the drift scan our only ear at Year 40 with the All-Sky Watch long
// built. Times are Build's: a build's standard pace, and each one in our order as schedule dates it. 2026-10-23.
import { BUILDS, kt, LATER, ordered, takenAt, takes } from "@/lib/game/plan";
import type { Plan } from "@/lib/game/types";

const tenth = (y: number) => Number(y.toFixed(1));

/** Every build, what it does, how long it takes at standard pace, and the matter it takes. */
export function describeBuilds(): string {
  const the = (name: string) => (name === "Thought Fields" ? name : `the ${name}`);
  const line = (b: { name: string; what: string; kt?: number }, after?: string) => {
    const { years, rock } = takes(b.name);
    const time = years ? `${tenth(years)} Years at standard pace` : rock ? `As fast as ${kt(rock)} of rock comes` : "";
    const more = [time, b.kt && `${b.kt} kt of our matter`, after && `opens once ${the(after)} is done`].filter(Boolean).join(", ");
    return `- ${b.name}: ${b.what}${more ? ` ${more[0].toUpperCase()}${more.slice(1)}.` : ""}`;
  };
  return `What Earth can build. Only the Will queues a build, on the Build tab. Name no build or observation that isn't here. Less compute than the kit says slows every build:
${BUILDS.map((b) => line(b)).join("\n")}
${LATER.map((b) => line(b, b.after)).join("\n")}`;
}

/** Our order, in line, with where each build stands at Year `year`: done, under way and when it will be, or past Year
 *  40. Before Begin, `year` is null and each says when it would be done. Then what the Will took back, and when, its
 *  work kept, since 2026-10-23. */
export function describeQueue(plan: Plan, done: Record<string, number | null>, year: number | null): string {
  const names = ordered(plan);
  const back = [...new Set([...plan.builds, ...(plan.later ?? []).map((o) => o.name)])].filter((b) => takenAt(plan, b) !== null);
  if (!names.length && !back.length) return "The Will has queued nothing yet.";
  const at = (name: string) => {
    const d = done[name];
    const fields = name === "Thought Fields";
    if (d == null) return `${name}: not done by Year 40.`;
    if (year === null) return fields ? `${name}: would fill the grid about Year ${tenth(d)}.` : `${name}: would be done about Year ${tenth(d)}.`;
    if (d <= year) return fields ? `${name}: its campuses filled the grid at Year ${tenth(d)}.` : `${name}: done at Year ${tenth(d)}.`;
    return fields ? `${name}: a campus a Year, filling the grid about Year ${tenth(d)}.` : `${name}: under way, done about Year ${tenth(d)}.`;
  };
  // Ordered in play: the Year of its last order.
  const since = (name: string) => (plan.later ?? []).filter((o) => o.name === name).at(-1)?.y;
  return [
    "The Will's order, in line, and where each build stands:",
    ...names.map((b) => (since(b) === undefined ? `- ${at(b)}` : `- ${at(b)} Ordered at Year ${since(b)}.`)),
    ...back.map((b) => `- ${b}: taken back at Year ${takenAt(plan, b)}, its work kept. Ordered again, it picks up there.`),
  ].join("\n");
}
