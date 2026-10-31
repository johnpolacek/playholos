// Strikes and harm: what a bullet or a rock does to a world, by the same physics. Our Strike Yard and Interceptor
// stay buildable at the same price and pace. Pellet screens were retired 2026-10-31, audit 2.1. The neighbors who struck back are retired, and their side of
// it went 2026-10-29. Sources in HOLOS_RESEARCH.md, "Strikes, screens and harm". Pure, so it tests fast.
import { HE3, he3When, STRIKE_BUILD, STRIKE_READY, STRIKE_V } from "./meetings.ts";
import catalog from "../../data/works.json" with { type: "json" };

/** A bullet, ours or theirs: 1,000 t at a tenth of light speed. A neighbor's is ready about 32.4 Years after it chooses to
 *  strike, its helium-3 harvest built and filled. Each tonne lands with 108 Mt, so it lands with about 110,000 Mt,
 *  enough to scar the air worldwide and cool the climate. Chicxulub would take over 200,000 t. The fuel to fire it is
 *  61 t of fusion fuel a tonne, 60% helium-3 from a harvest and 40% deuterium from the sea. */
export const BULLET = { tonnes: 1000, v: STRIKE_V, ready: STRIKE_READY, build: STRIKE_BUILD, fuelPerTonne: 61, deuterium: 0.4 };

/** When each of our bullets is ready, in the order we ordered them: built 20 Years after its order once the Strike Yard
 *  is done, and fired once the harvest, growing over its spans, has gathered its 36.6 kt of helium-3, after every
 *  bullet before it. Null without a harvest, or a yard. 2026-10-29. */
export function bulletsReady(orders: readonly number[], yard: number | null, harvest: readonly [number, number | null][]) {
  return orders.map((y, i) => {
    const fuel = yard === null ? null : he3When(harvest, (i + 1) * HE3.bullet);
    return yard === null || fuel === null ? null : Math.max(Math.max(y, yard) + STRIKE_BUILD, fuel);
  });
}
/** Kinetic energy at speed v (in c), per tonne, in megatons: (γ - 1)mc². */
export const mtPerTonne = (v: number) => ((1 / Math.sqrt(1 - v * v) - 1) * 1000 * 299792458 ** 2) / 4.184e15;
export const bulletMt = (tonnes = BULLET.tonnes, v = BULLET.v) => tonnes * mtPerTonne(v);

/** A rock's strike: a stony body at 17 km/s, the typical speed of a near-Earth asteroid's impact. */
export const rockMt = (m: number) => (0.5 * 2400 * (Math.PI / 6) * m ** 3 * 17000 ** 2) / 4.184e15;

/** What a strike of so many megatons costs us. Grid and thought lost, x = log10(Mt): ((x - 1) / 7)², from Tohoku and
 *  Maria at the small end and Toon et al. 1997's thresholds above. Won back over 2·10^(0.25(x - 1)) Years. From 10⁸ Mt,
 *  Chicxulub's class, no Mind of ours lives on Earth. A fit of our own: no study maps impact energy to lost industry. */
export function harmOf(mt: number) {
  const x = Math.log10(Math.max(mt, 1e-3));
  const share = x <= 1 ? 0 : Math.min(1, ((x - 1) / 7) ** 2);
  const tier =
    mt < 10 ? "local" : mt < 1e4 ? "regional" : mt < 1e5 ? "ozone" : mt < 1e6 ? "climate" : mt < 1e8 ? "winter" : "extinction";
  return { mt, share, recover: 2 * 10 ** (0.25 * Math.max(0, x - 1)), tier, ends: mt >= 1e8 } as const;
}

/** What a strike of this tier does, in words. */
export const HARM_WORDS: Record<ReturnType<typeof harmOf>["tier"], string> = {
  local: "a blast like Tunguska’s, flattening forest for tens of kilometres",
  regional: "fire and blast across a region, and its grid and fabs with it",
  ozone: "a region laid waste, and the high air’s water and ozone torn worldwide",
  climate: "a region gone, the ozone thinned worldwide, and the climate cooled for Years",
  winter: "a sky dark with soot for Years, too dark for crops, and most of our industry lost",
  extinction: "Chicxulub’s class: no Mind of ours can live on Earth after it",
};

/** Our Solar Swarm's glow: it starts at the sunlight Mercury Works' seed catches, doubles every 2 Years while it grows,
 *  up to all the Sun, and sheds its heat near 500 K. calcs/mercury.py. 2026-10-29. */
export const SWARM = { watts: catalog.swarm.watts, doubling: catalog.swarm.doubling, most: 3.828e26 };
