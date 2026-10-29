// A map label beside its mark, or centered under it, kept inside the map's edges so a label near one isn't cut off on
// a phone, and clear of labels placed before it: it tries the other side, or above, and fades if no spot is clear.
// Place the most important first. Shared by the leads map and the messages map. 2026-10-28.
type Box = { l: number; t: number; r: number; b: number };
/** Two labels collide when they come within a few pixels of each other. */
const GAP = 4;
const hits = (a: Box, taken: Box[]) => taken.some((o) => a.l < o.r + GAP && a.r + GAP > o.l && a.t < o.b + GAP && a.b + GAP > o.t);

export function placeLabel(n: HTMLElement, x: number, y: number, under: number | null, taken: Box[] = []) {
  const W = n.parentElement?.clientWidth ?? 0, w = n.offsetWidth, h = n.offsetHeight;
  const fit = (left: number) => (W > w + 8 ? Math.min(Math.max(left, 4), W - w - 4) : left);
  // A star's name goes out from the middle: right of its mark on the right half, left of it on the left.
  const right = x > W / 2;
  const spots: Box[] = (
    under !== null
      ? [[x - w / 2, y + under], [x - w / 2, y - under - h], [x - w / 2, y + under + h]]
      : [right ? [x + 9, y - h / 2] : [x - 9 - w, y - h / 2], right ? [x - 9 - w, y - h / 2] : [x + 9, y - h / 2], [x - w / 2, y + 6], [x - w / 2, y - 6 - h]]
  ).map(([l, t]) => ({ l: fit(l), t, r: fit(l) + w, b: t + h }));
  const spot = spots.find((s) => !hits(s, taken));
  const at = spot ?? spots[0];
  n.style.transform = `translate(${at.l}px, ${at.t}px)`;
  taken.push(at);
  // Seen whole where clear, faint where it can't be.
  return spot ? 1 : 0.25;
}
