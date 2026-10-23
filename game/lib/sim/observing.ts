// How long a telescope takes to see a warm world and read its air: the Infrared Telescope, and the 15 m Mirror. A port of
// calcs/observing.py, which holds the sources and settled dates. Physics sets it: nearer and larger worlds read
// sooner, the coronagraph's dark patch reaches from 3.5 wavelengths over the mirror's width to 48, or 64 on the 15 m,
// and a wider mirror gathers more light.

const K_LEAK = 0.87, K_DUST = 0.75;              // leaked starlight and dust, each over an Earth twin's light at 10 pc
const SEEN_H = 3.2, WATER_D = 22.0;              // hours to first see an Earth twin at 10 pc, and days to search it for water
const OXYGEN = 4.0, OZONE = 7.8;                 // times water's exposure
export const CAP_D = 61;                         // no target gets more than two months
export const MIRROR = 6.5, WIDE = 15;            // metres: the Infrared Telescope and the 15 m Mirror
const EDGE: Record<number, number> = { [MIRROR]: 48, [WIDE]: 64 };   // the dark patch's edge, in wavelengths over the width
export const BANDS = { green: 0.5, ozone: 0.6, oxygen: 0.76, water: 0.94 } as const;   // microns

// Thousandths of an arcsecond.
const angle = (ld: number, microns: number, mirror: number) => ((ld * microns * 1e-6) / mirror) * 206265 * 1000;
export const iwa = (microns: number, mirror = MIRROR) => angle(3.5, microns, mirror);
export const owa = (microns: number, mirror = MIRROR) => angle(EDGE[mirror], microns, mirror);

/** Exposure time over that of an Earth twin of a Sun twin at 10 pc, on the Infrared Telescope. On a wider mirror the
 *  planet's and the starlight's share falls as its area, and the dust's as its area squared. */
export function ratio(dPc: number, radius: number, aAu: number, lum: number, mirror = MIRROR): number {
  const f = radius ** 2 * (lum / aAu ** 2) * (10 / dPc) ** 2;
  const area = (mirror / MIRROR) ** 2;
  return ((1 + (2 * K_LEAK * aAu ** 2) / radius ** 2) / f / area + (2 * K_DUST) / f ** 2 / area ** 2) / (1 + 2 * K_LEAK + 2 * K_DUST);
}

export interface Reading {
  /** The world's distance from its star in our sky, thousandths of an arcsecond. */
  sep: number;
  /** Hours to first see it, or null if the mirror can't split it. */
  seenH: number | null;
  /** Days to read each, null if out of the dark patch, Infinity if over two months. */
  water: number | null;
  oxygen: number | null;
  ozone: number | null;
}

export function observe(dPc: number, radius: number, aAu: number, lum: number, mirror = MIRROR): Reading {
  const r = ratio(dPc, radius, aAu, lum, mirror), sep = (aAu / dPc) * 1000;
  const days = (mult: number, band: number) =>
    !(iwa(band, mirror) < sep && sep < owa(band, mirror)) ? null : WATER_D * r * mult <= CAP_D ? WATER_D * r * mult : Infinity;
  return {
    sep,
    seenH: iwa(BANDS.green, mirror) < sep && sep < owa(BANDS.water, mirror) ? SEEN_H * r : null,
    water: days(1, BANDS.water),
    oxygen: days(OXYGEN, BANDS.oxygen),
    ozone: days(OZONE, BANDS.ozone),
  };
}
