// Planning, on the Build tab: what Earth can start at Year 0, and what the Mind would start with. The builds are the first hour's works
// from data/works.json, paced by lib/sim/works.ts from the player's own order, so every date on the screen is the
// game's. The Mind advises from the charter's strongest lean and never queues anything itself.
import { KNOCKS } from "./knocks";
import { YEAR_0 } from "./clock";
import type { Plan } from "./types";
import { CATALOG, pace, type Order } from "@/lib/sim/works";

/** What a build does, which gives it its color: listening, thinking, seeing, lifting, reaching or keeping us. */
export type Does = "listen" | "think" | "see" | "lift" | "reach" | "keep";

export interface Build {
  name: string;
  /** What it gives us, in a line. */
  what: string;
  does: Does;
  /** Matter it takes from the 20 kt we hold, if any worth naming. */
  kt?: number;
}

export const BUILDS: Build[] = [
  { name: "All-Sky Watch", what: "Hears a knock or a broadcast from anywhere, at any hour.", does: "listen" },
  { name: "Deep Flash Watch", what: "Catches laser knocks too faint for the sky watch.", does: "listen" },
  { name: "Thought Fields", what: "Half again as much thought, for good.", does: "think" },
  { name: "Infrared Telescope", what: "Reads the air of the nearest worlds.", does: "see" },
  { name: "Launch Complex", what: "Doubles what we lift to orbit.", does: "lift" },
  { name: "Orbital Yard", what: "Builds in orbit a quarter faster.", does: "lift" },
  { name: "Moon Vault", what: "A second home for our Mind, in the Moon’s rock.", kt: 10, does: "keep" },
  // The two roads to the nearest star, open at Year 0 since 2026-10-18. Even last in line, the probe yard's large want
  // takes the thought that would have pushed the builds before it, and slows them by Years.
  { name: "Laser Sail Array", what: "Light from the ground, to push sails to a fifth of light speed.", does: "reach" },
  {
    name: "Probe Yard",
    what: "Builds and fuels probes in orbit. The first flies 12 Years after.",
    kt: 10,
    does: "reach",
  },
  // The longest roads: what a craft needs to stay at a star, and a copy of our Mind to send. The catalog had them, and
  // Reach's locked ways now name them, so they can be queued at Year 0 too, last in line, 2026-10-19. Paces settled
  // 2026-10-15 in HOLOS_GAME_CONCEPT.md: a drive 30 Years at standard pace, a seed ship 18, about 1,500 t.
  { name: "Deuterium Works", what: "Draws heavy hydrogen from seawater, to fuel fusion.", does: "reach" },
  { name: "Fusion Drive", what: "An engine that lets a craft slow at a star, and stay.", does: "reach" },
  { name: "Seed Ship", what: "Carries a copy of our Mind to a star, to stay.", kt: 1.5, does: "reach" },
];

/** What the Mind says of each build, on its page and in the tour, whichever lean picks it. */
export const SAYS: Record<string, string> = {
  "All-Sky Watch":
    "Our sky watch sees each star about ten minutes a day, and a knock lasts hours. This would hear the whole sky, all the time.",
  "Deep Flash Watch":
    "A laser knock could last a billionth of a second. Only a watch built for flashes that short would ever see one.",
  "Thought Fields": "Half again as much thought, for good. Every build after it goes faster, and so do our studies.",
  "Infrared Telescope":
    "It would read the air of the nearest worlds. Oxygen and methane together would be hard to explain without life.",
  "Launch Complex": "It doubles what we lift to orbit. Everything we build up there waits on lift.",
  "Orbital Yard": "It builds in orbit a quarter faster. It pays most if we mean to build a lot up there.",
  "Moon Vault": "A copy of us, out of reach of anything that hits Earth. It takes half the matter we hold in orbit.",
  "Laser Sail Array":
    "Our soonest road to the nearest star, and it takes no matter. Last in line, it barely slows what is before it.",
  "Probe Yard":
    "It builds and fuels probes in orbit. Its want is large: even last in line, it slows every build before it.",
  "Deuterium Works":
    "Fusion burns heavy hydrogen, and the sea holds plenty: about one hydrogen atom in 6,400. It takes little, and pays only once a drive is coming.",
  "Fusion Drive":
    "No one has flown one yet. It is how a craft slows at a star and stays, where a flyby passes in minutes. Thirty Years at standard pace, for the longest roads.",
  "Seed Ship":
    "A copy of our Mind that goes and stays, about 1,500 tonnes with its seed. It flies only on a Fusion Drive, fed by the Deuterium Works.",
};

/** A build's page on the Build tab, by its name. */
export const buildSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/** The one observation open at Year 0: thirty seconds of the space telescope. */
export const FOMALHAUT = { name: "Image Fomalhaut again", what: "Has the new cloud moved?", lands: 0.1 };

export const EMPTY: Plan = { builds: [], observe: [] };

/** The charter's strongest lean: which dial, and whether it leans low. */
export function lean(dials: number[]) {
  const i = dials.reduce((best, v, k) => (Math.abs(v - 50) > Math.abs(dials[best] - 50) ? k : best), 0);
  return { i, low: dials[i] < 50 };
}

/** What the Mind would start with, from the charter's strongest lean: its words, and the builds it means. */
export function advice(dials: number[]): { words: string; builds: string[] } {
  const { i, low } = lean(dials);
  if (i === 0)
    return low
      ? {
          words:
            "Ears first. Our sky watch sees each star for ten minutes a day, and a knock lasts hours. One could pass and we would never know. We would build both watches, and Thought Fields.",
          builds: ["All-Sky Watch", "Deep Flash Watch", "Thought Fields"],
        }
      : {
          words: "Ears first, and nothing new sent. We would build both watches.",
          builds: ["All-Sky Watch", "Deep Flash Watch"],
        };
  if (i === 1)
    return low
      ? {
          // Lift isn't what holds probes back, so no launch complex. Listening first, and the array last, costs the sails
          // about a Year and keeps the sky watch at full pace. Settled 2026-10-18.
          words:
            "Reach first. Sails are our soonest road to the nearest star, and the array takes no matter. We would listen first, build a yard for the probes to come, and queue the array last.",
          builds: ["All-Sky Watch", "Orbital Yard", "Laser Sail Array"],
        }
      : {
          words: "Think first. Thought Fields, then the sky watch.",
          builds: ["Thought Fields", "All-Sky Watch"],
        };
  return low
    ? {
        words:
          "Safety first. A vault in the Moon would let our Mind outlive a hit on Earth. We would listen meanwhile.",
        builds: ["Moon Vault", "All-Sky Watch", "Deep Flash Watch"],
      }
    : {
        words: "Move first. Thought, a telescope that reads air, and a way to orbit, all at once.",
        builds: ["Thought Fields", "Infrared Telescope", "Launch Complex"],
      };
}

/** A build's name in the pace and its worlds, which keep the names they were first given: in sentence case, and
 *  Thought Fields as a data center. */
const PACED = Object.fromEntries(Object.keys(CATALOG.works).map((k) => [k.toLowerCase(), k]));
export const pacedName = (name: string) =>
  name === "Thought Fields" ? "Data center" : (PACED[name.toLowerCase()] ?? name);

/** The plan as the player's orders at Year 0, and the thought its observation sets aside. The Mind's studies keep
 *  the pace's own tenth. */
export function ordersOf(plan: Plan) {
  const orders: Order[] = plan.builds.map((b) => ({ y: 0, begin: pacedName(b) }));
  const aside = plan.observe.length ? ([[0, FOMALHAUT.lands, 0.05]] as const) : [];
  return { orders, aside };
}

/** When each queued build is done, in Years from Year 0, with this game's thought. Null past 40 Years. */
export function schedule(plan: Plan, scale: number): Record<string, number | null> {
  const { orders, aside } = ordersOf(plan);
  const p = pace(orders, 40, { scale, aside });
  return Object.fromEntries(
    plan.builds.map((b) => [b, b === "Thought Fields" ? (p.dataCenters[0] ?? null) : (p.done[pacedName(b)] ?? null)]),
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
