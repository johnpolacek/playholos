// A glow earns a name, settled 2026-11-04. Warm Glow 3 keeps its number until a Close Reading finds plain heat, and a cold
// glow until a sentinel of ours sees what makes it. Since 2026-11-11 our Glow Imager earns one too: a warm glow it
// shows as a made ring, and a cold glow it shows the panels of. Most glows are dust, so a name marks the rare one that matters. Warm
// ones take fire from Earth's myths, as the real search for built heat around stars, Project Hephaistos, did. Cold ones
// take winter. Names go in the order we earned them. "Warm glow 3" stays the id in saves, on the server and in orders.

const FIRE: [string, string][] = [
  ["Prometheus", "the Titan who brought us fire"],
  ["Hestia", "the Greek keeper of the hearth"],
  ["Agni", "the Hindu god of fire"],
  ["Pele", "the Hawaiian goddess of fire and volcanoes"],
  ["Hephaistos", "the Greek god of the forge"],
  ["Brigid", "the Irish goddess of the sacred flame"],
  ["Kagutsuchi", "the Japanese god of fire"],
  ["Zhurong", "the Chinese god of fire"],
  ["Gibil", "the Mesopotamian god of fire"],
  ["Xiuhtecuhtli", "the Aztec lord of fire"],
  ["Svarog", "the Slavic god of the forge"],
  ["Atar", "the sacred fire of ancient Persia"],
];

const WINTER: [string, string][] = [
  ["Skadi", "the Norse goddess of winter"],
  ["Boreas", "the Greek north wind"],
  ["Morana", "the Slavic goddess of winter"],
  ["Cailleach", "the Gaelic queen of winter"],
  ["Khione", "the Greek goddess of snow"],
  ["Yuki-onna", "the snow spirit of Japan"],
  ["Ullr", "the Norse god of snow and skis"],
];

const NUMERALS = ["", " II", " III", " IV", " V", " VI", " VII", " VIII", " IX", " X"];

export type GlowName = { name: string; after: string };

function nth(list: [string, string][], i: number): GlowName {
  const [name, after] = list[i % list.length];
  const round = Math.floor(i / list.length);
  return { name: name + (NUMERALS[round] ?? ` ${round + 1}`), after };
}

/** Each named glow by its id, in the order we earned the names, so a name never moves once given. */
export function glowNames(
  minds?: { flashes: { read?: { at: number; saw: string }; imaged?: { at: number; saw: string } }[]; glows: { near?: number; imaged?: number }[] } | null,
) {
  const out: Record<string, GlowName> = {};
  if (!minds) return out;
  // The sooner of the two ways it earned one. A cloud earns none, and takes back none: a name never moves once given.
  const soonest = (...ys: (number | undefined)[]) => { const xs = ys.filter((y): y is number => y !== undefined); return xs.length ? Math.min(...xs) : undefined; };
  minds.flashes
    .flatMap((f, i) => { const at = soonest(f.read?.saw === "smooth" ? f.read.at : undefined, f.imaged?.saw === "ring" ? f.imaged.at : undefined); return at !== undefined ? [{ at, i }] : []; })
    .sort((p, q) => p.at - q.at || p.i - q.i)
    .forEach(({ i }, k) => (out[`Warm glow ${i + 1}`] = nth(FIRE, k)));
  minds.glows
    .flatMap((g, i) => { const at = soonest(g.near, g.imaged); return at !== undefined ? [{ at, i }] : []; })
    .sort((p, q) => p.at - q.at || p.i - q.i)
    .forEach(({ i }, k) => (out[`Cold glow ${i + 1}`] = nth(WINTER, k)));
  return out;
}

/** This game's names, set by Scan as its leads come. Empty on the server, where ids are what's wanted. */
let known: Record<string, GlowName> = {};
export function knowGlowNames(names: Record<string, GlowName>) {
  known = names;
}
export const glowNamed = (id: string) => known[id];

/** A glow's name wherever we read it: the one it earned, or Warm Glow 3 in title case. A glow with no number is a plain
 *  noun, left be. */
export const properGlows = (text: string) =>
  text.replace(/\b(warm|cold) glow (\d+)\b/gi, (_, kind: string, n: string) => {
    const k = `${kind[0].toUpperCase()}${kind.slice(1).toLowerCase()}`;
    return known[`${k} glow ${n}`]?.name ?? `${k} Glow ${n}`;
  });

/** The id behind a name, for an order the Mind drafts by the name Scan shows. Any other name comes back as it is. */
export function glowIdOf(name: string) {
  const n = name.trim().toLowerCase();
  return Object.entries(known).find(([, v]) => v.name.toLowerCase() === n)?.[0] ?? name;
}
