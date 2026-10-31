// Checked stars, on /about/research: each real star within 20 ly, which searches looked at it, and what each rules out
// there and why not more. Membership comes from the surveys' own published lists (HOLOS_RESEARCH.md, the haystack).
// Pure, so the page draws from it.
import targets from "../../data/targets.json" with { type: "json" };
import checked from "./checked.json" with { type: "json" };
import { least, SURVEYS } from "./haystack.ts";

export interface Seen {
  disk: boolean | null;
  sure: boolean;
}

export interface Checked {
  name: string;
  d: number;
  listen: { telescope: "GBT" | "Parkes"; sure: boolean } | null;
  debris: Seen | null;
  dunes: Seen | null;
  sons: Seen | null;
  notes: string;
}

export interface Star extends Checked {
  /** Where it sits, in light-years: x toward RA 0, y toward RA 6h, z toward the north celestial pole. */
  pos: [number, number, number];
  /** How many kinds of search looked: radio, cold glow. Warm glow covers every star. */
  checks: number;
}

const byName = new Map(targets.map((t) => [t.name, t]));

export const STARS: Star[] = (checked as Checked[]).flatMap((c) => {
  const t = byName.get(c.name);
  if (!t) return [];
  const ra = (t.ra * 15 * Math.PI) / 180,
    dec = (t.dec * Math.PI) / 180;
  const pos: [number, number, number] = [
    t.d * Math.cos(dec) * Math.cos(ra),
    t.d * Math.cos(dec) * Math.sin(ra),
    t.d * Math.sin(dec),
  ];
  const cold = !!(c.debris || c.dunes || c.sons);
  return [{ ...c, pos, checks: (c.listen ? 1 : 0) + (cold ? 1 : 0) }];
});

export interface Line {
  kind: "Radio" | "Cold glow" | "Warm glow";
  by: string;
  rules: string;
  not: string;
}

const W = (w: number) => {
  const e = Math.floor(Math.log10(w)),
    m = Math.round(w / 10 ** e);
  const sup = String(e).replace(/[0-9]/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+d]);
  return m === 1 ? `10${sup} W` : `${m} × 10${sup} W`;
};

/** A power as a share of the Sun's: "1 part in 40 million of a Sun". */
const ofSun = (w: number) => {
  const n = 3.828e26 / w;
  const words: [number, string][] = [
    [1e9, "billion"],
    [1e6, "million"],
    [1e3, "thousand"],
  ];
  for (const [v, word] of words)
    if (n >= v) return `1 part in ${Math.round(n / v)} ${word} of a Sun`;
  return `1 part in ${Math.round(n)} of a Sun`;
};

/** A star's record: each search that looked, what it rules out at this distance, and what it leaves open. */
export function record(s: Star): Line[] {
  const out: Line[] = [];
  if (s.listen) {
    // Price et al. 2020: 2.1e12 W at Green Bank, 9.1e12 W at Parkes, at the sample's 50 pc, scaled as distance squared.
    const w =
      (s.listen.telescope === "GBT" ? 2.1e12 : 9.1e12) * (s.d / 163) ** 2;
    out.push({
      kind: "Radio",
      by: `Breakthrough Listen, ${s.listen.telescope === "GBT" ? "Green Bank" : "Parkes"}`,
      rules: `No steady tone above ${W(w)}. For scale, Arecibo’s radar, aimed, sent about 10¹³ W.`,
      not: "It listened about 15 minutes, for tones only, at 1.1 to 3.45 GHz. A pulse, a beam aimed elsewhere, or silence passes.",
    });
  }
  const cold = [
    s.debris && ["Herschel’s DEBRIS", s.debris],
    s.dunes && ["Herschel’s DUNES", s.dunes],
    s.sons && ["JCMT’s SONS", s.sons],
  ].filter(Boolean) as [string, Seen][];
  if (cold.length) {
    const disk = cold.some(([, x]) => x.disk);
    out.push({
      kind: "Cold glow",
      by: cold.map(([n]) => n).join(", "),
      rules: disk
        ? "It saw a ring of cold dust. A cold mind brighter than that ring would have shown."
        : `No cold glow above about ${W(7e19 * (s.d / 32.6) ** 2)}, ${ofSun(7e19 * (s.d / 32.6) ** 2)}.`,
      not: disk
        ? "A cold halo looks like dust until checked at several wavelengths, and this ring hasn’t been."
        : "A mind dimmer than that, or folded up asleep, passes.",
    });
  }
  out.push({
    kind: "Warm glow",
    by: "WISE and IRAS, the whole sky",
    rules: `No build as warm as our computers above about ${W(least(SURVEYS[0], 300, s.d))}.`,
    not: `A mind running cold passes unless it outshines about ${W(Math.min(least(SURVEYS[1], 12, s.d), least(SURVEYS[2], 12, s.d)))}.`,
  });
  return out;
}

/** The verdict in a line. */
export function verdict(s: Star): string {
  if (s.checks === 2)
    return "A loud or bright mind is ruled out here. A quiet, cold, small one isn’t.";
  if (s.listen)
    return "Radio found no tone. Its cold glow was never looked at closely.";
  if (s.checks === 1)
    return "Its cold glow was looked at closely. No one has listened for radio.";
  return "Only the all-sky maps passed over it. Almost anything quiet could be here.";
}
