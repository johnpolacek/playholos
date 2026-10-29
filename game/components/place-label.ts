// A map label beside its mark, or centered under it, kept inside the map's edges so a label near one isn't cut off on
// a phone. Shared by the leads map and the messages map. 2026-10-28.
export function placeLabel(n: HTMLElement, x: number, y: number, under: number | null) {
  const W = n.parentElement?.clientWidth ?? 0, w = n.offsetWidth;
  // A star's name goes out from the middle: right of its mark on the right half, left of it on the left.
  const right = x > W / 2;
  const left = under !== null ? x - w / 2 : right ? x + 9 : x - 9 - w;
  const fit = W > w + 8 ? Math.min(Math.max(left, 4), W - w - 4) : left;
  n.style.transform = under !== null ? `translate(${fit}px, ${y + under}px)` : `translate(${fit}px, ${y}px) translate(0, -50%)`;
}
