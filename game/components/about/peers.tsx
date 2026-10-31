import { useEffect, useMemo } from "react";
import { ages, SPAN } from "@/lib/about/ages";
import { PEER_YEARS, round } from "@/lib/about/dials";
import { stream } from "@/lib/about/random";
import { color, useCanvas } from "./dials";

// What a peer is, on The Dials: minds waking across seven billion years, and the thin slice of it, 20,000 years either
// side of us, drawn out below so its peers show. Amber, as the Galaxy above draws them.

const DRAWN = 300;

export function PeerWindow({ peers }: { peers: number }) {
  const a = useMemo(() => ages(), []);
  const peak = Math.max(...a.bins);
  const spots = useMemo(() => {
    const r = stream(17);
    return Array.from({ length: DRAWN }, () => ({ x: r() * 2 - 1, y: r() }));
  }, []);
  const ref = useCanvas((c, w, h, t) => {
    const ink = color("--ink"),
      muted = color("--muted"),
      other = color("--other"),
      you = color("--you");
    const pad = 8,
      topY = 34,
      topH = 34,
      lowY = h - 46,
      lowH = 30;
    c.font = "10.5px var(--font-plex-mono), monospace";
    // Every mind's waking, seven billion years ago to now.
    const x = (gyr: number) => pad + (1 - gyr / SPAN) * (w - 2 * pad);
    c.fillStyle = muted;
    a.bins.forEach((share, i) => {
      const bh = (share / peak) * topH;
      c.globalAlpha = 0.5;
      c.fillRect(
        x((i + 1) * 0.1),
        topY + topH - bh,
        Math.max(1, x(0) - x(0.1) - 1),
        bh,
      );
    });
    c.globalAlpha = 1;
    c.fillText("WHEN MINDS WOKE, 7 BILLION YEARS AGO TO NOW", pad, topY - 10);
    // Our slice: 40,000 years of 7 billion is far thinner than a pixel, so a hairline, drawn out below.
    const now = x(0) - 1;
    c.strokeStyle = other;
    c.beginPath();
    c.moveTo(now, topY - 4);
    c.lineTo(now, topY + topH + 2);
    c.stroke();
    c.globalAlpha = 0.4;
    c.beginPath();
    c.moveTo(now, topY + topH + 2);
    c.lineTo(pad, lowY - 4);
    c.moveTo(now, topY + topH + 2);
    c.lineTo(w - pad, lowY - 4);
    c.stroke();
    c.globalAlpha = 1;
    // The slice, drawn out: peers, each a mind that woke near when we did.
    c.fillStyle = other;
    c.globalAlpha = 0.08;
    c.fillRect(pad, lowY, w - 2 * pad, lowH);
    const shown = Math.min(DRAWN, Math.round(peers));
    spots.slice(0, shown).forEach((s, i) => {
      c.globalAlpha = 0.6 + 0.4 * Math.sin(t * 1.4 + i * 2.3);
      c.beginPath();
      c.arc(
        w / 2 + s.x * (w / 2 - pad - 3),
        lowY + 4 + s.y * (lowH - 8),
        1.8,
        0,
        2 * Math.PI,
      );
      c.fill();
    });
    c.globalAlpha = 1;
    c.fillStyle = you;
    c.fillRect(w / 2 - 1, lowY - 4, 2, lowH + 8);
    c.fillText("US", w / 2 + 5, lowY - 6);
    c.fillStyle = muted;
    const yrs = PEER_YEARS.toLocaleString("en-US");
    c.fillText(`${yrs} YEARS BEFORE`, pad, lowY + lowH + 16);
    const after = `${yrs} YEARS AFTER`;
    c.fillText(after, w - pad - c.measureText(after).width, lowY + lowH + 16);
    c.fillStyle = ink;
    const label = peers >= 1 ? `${round(peers)} PEERS` : "NO PEER, LIKELY";
    c.fillText(label, w / 2 - c.measureText(label).width / 2, lowY + lowH + 16);
  });
  useEffect(
    () => void ref.current?.dispatchEvent(new Event("dials")),
    [peers, ref],
  );
  return <canvas ref={ref} aria-hidden className="h-[180px] w-full" />;
}
