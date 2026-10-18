// Planning: what Earth can start at Year 0, and what the Mind would start with. The builds are the first hour's works
// from data/works.json, paced by lib/sim/works.ts from the player's own order, so every date on the screen is the
// game's. The Mind advises from the charter's strongest lean and never queues anything itself.
import { KNOCKS } from "./knocks";
import { YEAR_0 } from "./clock";
import type { Plan } from "./types";
import { pace, type Order } from "@/lib/sim/works";

export interface Build {
  name: string;
  /** What it gives us, in a line. */
  what: string;
  /** Matter it takes from the 20 kt we hold, if any worth naming. */
  kt?: number;
}

export const BUILDS: Build[] = [
  { name: "All-sky watch", what: "Hears a knock or a broadcast from anywhere, at any hour." },
  { name: "Deep flash watch", what: "Catches laser knocks too faint for the sky watch." },
  { name: "Data center", what: "Half again as much thought, for good." },
  { name: "Infrared telescope", what: "Reads the air of the nearest worlds." },
  { name: "Launch complex", what: "Lifts 40 kt a Year to orbit." },
  { name: "Orbital yard", what: "Builds in orbit a quarter faster." },
  { name: "Moon vault", what: "A second home for our Mind, in the Moon’s rock.", kt: 10 },
];

/** Thought for the Mind's own studies, as a share of Year 0's. */
export const STUDIES: [share: number, label: string][] = [
  [0, "None"],
  [0.05, "A twentieth"],
  [0.1, "A tenth"],
  [0.2, "A fifth"],
];

export const SEARCHES: { id: Plan["search"]; label: string; line: string }[] = [
  { id: "near", label: "Sweep the near stars", line: "Space telescope: cold worlds and dust. Radio array: tones." },
  { id: "leads", label: "Hold on our leads", line: "Both stay on the leads’ stars, and listen longer at each." },
];

/** The one observation open at Year 0: thirty seconds of the space telescope. */
export const FOMALHAUT = { name: "Image Fomalhaut again", what: "Has the new cloud moved?", lands: 0.1 };

export const EMPTY: Plan = { builds: [], observe: [], studies: 0.1, search: "near" };

/** What the Mind would start with, from the charter's strongest lean: its words, and the builds it means. */
export function advice(dials: number[]): { words: string; builds: string[]; studies?: number } {
  const i = dials.reduce((best, v, k) => (Math.abs(v - 50) > Math.abs(dials[best] - 50) ? k : best), 0);
  const low = dials[i] < 50;
  if (i === 0)
    return low
      ? {
          words:
            "Ears first. Our sky watch sees each star for ten minutes a day, and a knock lasts hours. One could pass and we would never know. We would build both watches, and a data center.",
          builds: ["All-sky watch", "Deep flash watch", "Data center"],
        }
      : {
          words:
            "Ears first, and nothing new sent. We would build both watches, and give the records we hold a fifth of our thought.",
          builds: ["All-sky watch", "Deep flash watch"],
          studies: 0.2,
        };
  if (i === 1)
    return low
      ? {
          words: "Reach first. A launch complex and a yard carry everything after them. We would add the sky watch.",
          builds: ["Launch complex", "Orbital yard", "All-sky watch"],
        }
      : {
          words: "Think first. A data center, and a fifth of our thought on the records we hold. Then the sky watch.",
          builds: ["Data center", "All-sky watch"],
          studies: 0.2,
        };
  return low
    ? {
        words:
          "Safety first. A vault in the Moon would let our Mind outlive a hit on Earth. We would listen meanwhile.",
        builds: ["Moon vault", "All-sky watch", "Deep flash watch"],
      }
    : {
        words: "Move first. Thought, a telescope that reads air, and a way to orbit, all at once.",
        builds: ["Data center", "Infrared telescope", "Launch complex"],
      };
}

/** When each queued build is done, in Years from Year 0, with this game's thought. Null past 40 Years. */
export function schedule(plan: Plan, scale: number): Record<string, number | null> {
  const orders: Order[] = [{ y: 0, studies: plan.studies }, ...plan.builds.map((begin) => ({ y: 0, begin }))];
  const aside = plan.observe.length ? ([[0, FOMALHAUT.lands, 0.05]] as const) : [];
  const p = pace(orders, 40, { scale, aside });
  return Object.fromEntries(
    plan.builds.map((b) => [b, b === "Data center" ? (p.dataCenters[0] ?? null) : (p.done[b] ?? null)]),
  );
}

/** What is already on its way, in Years from Year 0: our messages arriving, and the first replies that could come.
 *  Each keeps the message it rides on, the decimal year we sent it, and the star's distance in light-years. */
export function events(until: number) {
  const out: { at: number; star: string; reply: boolean; msg: string; sent: number; ly: number }[] = [];
  const seen = new Set<string>();
  for (const [msg, sent, star, ly] of KNOCKS) {
    const arrive = sent + ly - YEAR_0;
    if (arrive > 0 && arrive <= until) out.push({ at: arrive, star, reply: false, msg, sent, ly });
    const reply = sent + 2 * ly - YEAR_0;
    if (reply > 0 && reply <= until && !seen.has(star)) {
      seen.add(star);
      out.push({ at: reply, star, reply: true, msg, sent, ly });
    }
  }
  return out.sort((a, b) => a.at - b.at);
}
