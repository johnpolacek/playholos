import type { Chances } from "./chance";
import type { Lead } from "./leads";
import { buildSlug } from "./plan";
import { inOrder, sentinelNeeds } from "./reach";
import type { Plan } from "./types";
import type { Visit } from "@/lib/sim/types";

// Each lead's next move, said as a verb on its row: nine new worlds landed on Scan with nothing to say what to do about
// any of them. Playtest 2026-11-13. A lead with nothing worth doing, or with something of ours already on its way, has
// none: its silence says it can wait.

export interface NextMove {
  /** What we could do, in a few words. */
  label: string;
  /** Where that is done. */
  to: string;
  /** Lands Reach on how we send, as the lead page's Engage does, or on one way to send by its name. */
  engage?: boolean | string;
  /** Other ways there are to compare, on Reach. */
  more?: boolean;
}

export interface NextContext {
  plan: Plan;
  visits: readonly Visit[];
  /** Our chances there, as the row shows them. */
  chances: Chances | null;
  /** Something of ours on its way there, or due back. */
  waiting: boolean;
  /** A warm glow we could order a Close Reading of now. */
  readable: boolean;
  /** Stars we have messaged, by name. */
  messaged: ReadonlySet<string>;
  /** We have knocked on the watcher. */
  knocked: boolean;
  /** Of the craft that could go and look, the one whose word would reach us first, and when: the row named a sentinel
   *  for every world, though a flyby probe would tell us centuries sooner. Playtest 2026-11-13. */
  best?: { label: string; key: string; home: number } | null;
  now: number;
}

const years = (y: number) => (y < 10 ? `${y.toFixed(1)} Years` : `${Math.round(y).toLocaleString("en-US")} Years`);

const faded = (l: Lead) => l.facts.some(([k, v]) => k === "Faded" || (k === "Its light" && v.startsWith("Dust")));

/** The craft whose word reaches us first, or a sentinel and the build it waits on first. */
function look(l: Lead, c: NextContext, again: boolean): NextMove {
  if (c.best) return { label: `${c.best.label}: word in ${years(c.best.home - c.now)}`, to: `/play/reach/${l.slug}`, engage: c.best.key, more: true };
  return sentinel(l, c.plan, again);
}

/** A sentinel there, or the build it waits on first. */
function sentinel(l: Lead, plan: Plan, again: boolean): NextMove {
  const missing = sentinelNeeds(plan).find((n) => !inOrder(plan, n));
  if (missing) return { label: `A sentinel could look. First, the ${missing}`, to: `/play/build/${buildSlug(missing)}` };
  return { label: again ? "Send a sentinel for a closer look" : "Send a sentinel to look", to: `/play/reach/${l.slug}`, engage: "sentinel" };
}

export function nextMove(l: Lead, c: NextContext): NextMove | null {
  if (c.readable) return { label: "Order its Close Reading", to: `/play/lead/${l.slug}#close-reading` };
  if (c.waiting) return null;
  if (l.slug === "small-dark-body")
    return c.knocked || inOrder(c.plan, "Close Look") ? null : { label: "Knock on it, or look closer", to: `/play/lead/${l.slug}` };
  switch (l.art.kind) {
    case "warm":
      return faded(l) || c.messaged.has(l.star) ? null : { label: "Call out to it", to: `/play/reach/${l.slug}`, engage: true };
    case "reply":
      return c.messaged.has(l.star) ? null : { label: "Send a message", to: `/play/reach/${l.slug}`, engage: true };
    case "orbit":
    case "glow":
    case "dark":
    case "pair": {
      if (c.chances?.ruledOut) return null;
      const seen = c.visits.filter((v) => v.star === l.star);
      const stayed = seen.some((v) => v.by === "sentinel");
      const life = c.chances?.life?.hi ?? 0;
      if (stayed)
        // Seen up close, a living world is somewhere our Mind could go. Staying small draws no warning.
        return l.art.kind === "orbit" && life >= 0.4 && !c.plan.colony ? { label: "Send our Mind to stay", to: `/play/reach/${l.slug}`, engage: "mind" } : null;
      // A world worth a look: one that may hold life. Bare rock can wait. A glow or a hole is always worth one.
      if (l.art.kind === "orbit" && life < 0.1) return null;
      return look(l, c, seen.length > 0);
    }
    default:
      return null;
  }
}
