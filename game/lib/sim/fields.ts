// What our Far-Side Array hears of a world's magnetic field: a port of calcs/senses.py's field_flux() and heard_at(),
// checked against it in sim.test.mts. A world with a field makes radio where its star's wind strikes it, as Earth's
// aurora does, under 2 MHz for a field like Earth's, which only an array off Earth hears. The array sees the whole sky
// at once, so every red dwarf's world within its reach gathers together, and what it has gathered grows as its ground
// squared times its hours. Settled 2026-11-11, sources in HOLOS_RESEARCH.md, "The far side as a reader of worlds".
import { CATALOG } from "./works.ts";

export const FIELDS = CATALOG.fields;

/** A world's radio from its field, in µJy: its orbit in AU, its distance in ly. Scaled from Proxima b's in a quiet
 *  wind, Vidotto, Feeney and Groh 2019. */
export const fieldFlux = (a: number, d: number) => FIELDS.flux0 * (a / FIELDS.au0) ** -FIELDS.fall * (FIELDS.ly0 / d) ** 2;

/** The Year the array has gathered enough to hear a world this bright, given the Year each fifth of it was done, in
 *  order. Null with no fifth standing. */
export function fieldHeardAt(flux: number, fifths: readonly number[]): number | null {
  const need = (FIELDS.noise0 / flux) ** 2;
  let have = 0;
  for (let n = 1; n <= fifths.length; n++) {
    const start = fifths[n - 1], end = n < fifths.length ? fifths[n] : Infinity;
    const rate = (((n * FIELDS.fifthKm2) / FIELDS.km0) ** 2 * FIELDS.listenH) / FIELDS.hours0;
    if (have + rate * (end - start) >= need) return start + (need - have) / rate;
    have += rate * (end - start);
  }
  return null;
}

/** How much likelier air is on a world heard to have a field, and on one heard to have none, as odds: the shares of
 *  fields among worlds that kept their air against those that did not. */
export const FIELD_ODDS = { has: FIELDS.ifAir / FIELDS.ifBare, none: (1 - FIELDS.ifAir) / (1 - FIELDS.ifBare) };
