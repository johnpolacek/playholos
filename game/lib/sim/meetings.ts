// The helium-3 harvest that fuels a bullet, and the bullet's pace: our Strike Yard waits on both. The neighbors who
// noticed our craft at holes are retired, and that part went 2026-10-29. Pure, so it tests fast.

/** Helium-3 for a bullet, and where it comes from: 61 t of fusion fuel a tonne, 60% of it helium-3, so 36.6 kt for
 *  1,000 t. A harvest in an ice giant's air gathers about 1.5 kt a Year once built, Palaszewski's craft at about
 *  150 kt, the project audit's. Built in 20 Years, a sample. Its craft copy themselves from the moons' rock and ice,
 *  doubling every 5 Years, Metzger's pace with help from home, slower than Mercury's 2 since sunlight there is a
 *  370th of ours: so its rate doubles too, until held. Every star's bullets wait on it. 2026-10-29. */
export const HE3 = { bullet: 36.6, perYear: 1.5, build: 20, doubling: 5 };

/** Helium-3 gathered by Year t, kt, from a harvest growing over these spans of Years, the first from the Year it was
 *  done. Held, it gathers at its size. */
export function he3By(spans: readonly [number, number | null][], t: number) {
  if (!spans.length || t <= spans[0][0]) return 0;
  // Years grown by a moment, and the moments its rate changes: each doubling, and each hold or release.
  const grown = (at: number) => spans.reduce((y, [a, b]) => y + Math.max(0, Math.min(b ?? at, at) - a), 0);
  const edges = new Set<number>([spans[0][0], t]);
  for (const [a, b] of spans) {
    edges.add(a);
    if (b !== null) edges.add(b);
    for (let k = HE3.doubling; ; k += HE3.doubling) {
      const at = a + k - grown(a);
      if (at >= Math.min(b ?? t, t)) break;
      if (at > a) edges.add(at);
    }
  }
  const cut = [...edges].filter((x) => x <= t).sort((x, y) => x - y);
  let kt = 0;
  for (let i = 1; i < cut.length; i++) {
    const mid = (cut[i - 1] + cut[i]) / 2;
    kt += HE3.perYear * 2 ** Math.floor(grown(mid) / HE3.doubling + 1e-9) * (cut[i] - cut[i - 1]);
  }
  return kt;
}

/** The Year a harvest growing over these spans has gathered `kt`, or null if never within 2,000 Years. */
export function he3When(spans: readonly [number, number | null][], kt: number) {
  if (!spans.length) return null;
  let [lo, hi] = [spans[0][0], spans[0][0] + 2000];
  if (he3By(spans, hi) < kt) return null;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (he3By(spans, mid) >= kt) hi = mid;
    else lo = mid;
  }
  return hi;
}

/** A strike: a bullet built and fired once its weapons are ready, at a tenth of light speed, the audit's heavy
 *  impactor. The bullet itself takes 20 Years, a sample, as long as a sentinel's. A neighbor that chooses to strike
 *  starts its harvest then, with none in store, a sample: 20 Years to build it and about 12.4 for its growing harvest
 *  to fill one bullet, so it fires about 32.4 Years on. 2026-10-29. */
export const STRIKE_BUILD = 20;
export const STRIKE_READY = Math.max(STRIKE_BUILD, HE3.build + he3When([[0, null]], HE3.bullet)!), STRIKE_V = 0.1;
