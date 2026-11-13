// What a bullet of ours does where it lands, and what we can see of it from home. A port of calcs/strikes.py, which
// holds the sources. Every bullet lands with about 108,000 Mt. About 3% of that leaves as light, over about 200
// seconds: a little more than the sunlight an Earth reflects, so a world struck about doubles in light for three
// minutes. Only a telescope that splits the world from its star, watching as that light arrives, sees it: a mirror by
// the relation that times its first sight of the world, the Hypertelescope where the flash fills its one pixel as a
// 30 minute picture would. Or a sentinel of ours that stays there. Seeing it changes nothing there. 2026-11-12.
import catalog from "../../data/works.json" with { type: "json" };
import { MIRROR, observe, planetShare } from "./observing.ts";

const { strike: S, hyper: HYPER } = catalog;

/** A bullet's megatons, and the Years its world's ozone stays under half. */
export const STRIKE_MT = S.mt;
export const OZONE_YEARS = S.ozone;
/** How long the flash lasts, in seconds. */
export const FLASH_S = S.seconds;

/** The flash's light, in W. */
export const flashW = (mt = S.mt) => (S.share * mt * S.mtJ) / S.seconds;
/** A strike's flash over the world's own reflected light: its width in Earths, its orbit in AU, its star in Suns. */
export const flashRatio = (radius: number, aAu: number, lum: number, mt = S.mt) => flashW(mt) / ((S.earthW * radius ** 2 * lum) / aAu ** 2);

/** Hours a mirror would need to see the flash as surely as it first sees the world, with the flash as the signal and
 *  the world's own light joining the noise. Null if it can't split the world from its star. */
export function flashHours(dPc: number, radius: number, aAu: number, lum: number, mirror = MIRROR, mt = S.mt): number | null {
  const seen = observe(dPc, radius, aAu, lum, mirror).seenH;
  if (seen === null) return null;
  const k = flashRatio(radius, aAu, lum, mt);
  return (seen * (1 + k * planetShare(dPc, radius, aAu, lum, mirror))) / k ** 2;
}
/** Whether a mirror watching catches the flash: only if it lasts as long as the mirror needs. */
export function mirrorSees(dPc: number, radius: number, aAu: number, lum: number, mirror = MIRROR, mt = S.mt) {
  const h = flashHours(dPc, radius, aAu, lum, mirror, mt);
  return h !== null && h * 3600 <= S.seconds;
}

/** The flash's light in its one pixel of the Hypertelescope's picture, over what a 30 minute picture gives a pixel of
 *  that world. */
export function hyperFlash(dLy: number, radius: number, aAu: number, lum: number, mt = S.mt) {
  const pixels = (Math.PI / 4) * ((S.earthKm * radius) / (HYPER.kmPerLy * dLy)) ** 2;
  return ((flashRatio(radius, aAu, lum, mt) * S.seconds) / (S.hyperMin * 60)) * pixels;
}
export const hyperSees = (dLy: number, radius: number, aAu: number, lum: number, mt = S.mt) => dLy <= HYPER.reach && hyperFlash(dLy, radius, aAu, lum, mt) >= 1;

// At an old mind's star, 2026-11-12: a weapon is useless there. With no picture of what glows we can aim only at its
// star, which sheds a bullet's whole energy as light in a millionth of a second. With one, at a panel: thin, so the
// bullet passes through, leaves a hundred-millionth of its energy and a hole in one sheet, and flies on.
/** Seconds a star of `lum` Suns takes to shed a bullet's energy as light. */
export const starSeconds = (lum: number, mt = S.mt) => (mt * S.mtJ) / (lum * S.sunW);
/** The panels that shed a cold glow's watts from both faces at 12 K, in Earth's whole surfaces. */
export const panelEarths = (watts: number) => watts / S.panelW / S.earthFace;
/** The share of its energy a bullet leaves in a panel it passes through. */
export const PANEL_TAKES = S.panelTakes;
/** A strike that ends Earth as our home: Chicxulub's, in megatons. */
export const END_MT = S.endMt;
