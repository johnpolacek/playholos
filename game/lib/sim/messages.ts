// What our messages cost and carry, ported from calcs/messages.py and tested against it. Settled 2026-10-26: a message
// is noticed farther than it is read. Reading takes energy for every bit, twice Shannon's floor of ln 2 times the noise
// in one hertz, so twice as far takes four times the energy. Aimed messages are free, at AIMED_W along the beam. Sent
// every way at once, it costs power for as long as it runs: one copy a day, read as far as the Will's dial, and a
// listener who keeps hearing it reads it farther, never past where it would notice it in that time.

const LY = 9.4607e15, JY = 1e-26, DAY = 86400;
export const YEAR_S = 3.156e7;
/** Earth's energy at Year 0, W. */
export const GRID_2040 = 24e12;
const READ_MARGIN = 2;
/** W along the beam from Earth's dishes at Year 0: ten times Arecibo's 1974 message, a sample. */
export const AIMED_W = 1e14;
/** The listener's ear, in Jy: an all-sky watch like Earth's, as every awake neighbor keeps. */
export const WATCH_SEFD = 12;
const SNR = 10, CHAN = 1;

/** Bits in each size the Mind labels by, real where calcs/messages.py marks them: a page of words, Cosmic Call 2's
 *  220 MB, one genome, Wikipedia's text in 2026, and every book counted in 2010. */
export const SIZES = {
  page: 8 * 3000,
  collection: 8 * 220e6,
  genome: 2 * 3.1e9,
  encyclopedia: 8 * 26.8e9,
  books: 8 * 129_864_880 * 0.5e6,
} as const;

/** What a gift of each size does for our thinking, in steps of a data center's half again. Yardstick: our own methods
 *  for language models need half the compute every 8 months, Ho et al. 2024, so three steps, 3.4 times, is about 14
 *  months of our own progress, given in every book. An encyclopedia carries two steps, a collection one.
 *  A page is a letter and a genome is biology, with no methods for thinking in them. A sample, settled 2026-10-26,
 *  since no one knows what another mind's knowledge is worth to ours. */
export const GIFT_STEPS = { page: 0, collection: 1, genome: 0, encyclopedia: 2, books: 3 } as const;

const bitEnergy = (sefd: number) => (READ_MARGIN * Math.log(2) * sefd * JY) / 2;
const sphere = (ly: number) => 4 * Math.PI * (ly * LY) ** 2;

/** Bits a second read at `ly` from `watts` along the line to the listener. */
export const rate = (watts: number, ly: number, sefd = WATCH_SEFD) => watts / (sphere(ly) * bitEnergy(sefd));

/** Years to send `bits` aimed at a star `ly` away, read by its watch. */
export const aimedYears = (bits: number, ly: number, sefd = WATCH_SEFD) => bits / rate(AIMED_W, ly, sefd) / YEAR_S;

/** Light-years at which a steady tone of `watts` every way is noticed in a stare of `stare` seconds. */
export function noticeReach(watts: number, sefd = WATCH_SEFD, stare = DAY) {
  const fMin = SNR * sefd * JY * Math.sqrt(CHAN / (2 * stare));
  return Math.sqrt(watts / (4 * Math.PI * fMin)) / LY;
}

/** Light-years at which a message of `bits`, a copy each `seconds` at `watts` every way, is read after `passes`. Never
 *  past where it is noticed in that time. */
export function readReach(watts: number, bits: number, seconds = DAY, passes = 1, sefd = WATCH_SEFD) {
  const read = Math.sqrt((watts * seconds * passes) / (4 * Math.PI * bits * bitEnergy(sefd))) / LY;
  return Math.min(read, noticeReach(watts, sefd, seconds * passes));
}

/** Watts every way at once for a message of `bits`, a copy a day, to be read at `ly` from its first copy. */
export const powerFor = (ly: number, bits: number, seconds = DAY, sefd = WATCH_SEFD) =>
  (sphere(ly) * bits * bitEnergy(sefd)) / seconds;
