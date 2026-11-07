// Standing orders for glows, settled 2026-11-07 (m:235): "For each new glow within ___ ly, send ___". One card on Reach,
// a row for warm glows and one for cold. Warm glows can take sails, a flyby probe or a sentinel. A cold glow takes only
// a sentinel, since a pass is too quick to learn more there than we knew. Each craft shows its price per glow and when
// its word comes home at the order's distance: a sail's flash, or the deuterium a probe or sentinel draws from the
// Works, in the order sent. It replaced the warm glows' one switch, a flyby probe to each, of 2026-11-05.
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { usePlan, useSchedule } from "@/components/picks";
import { useLeads } from "@/components/scan";
import { yearText } from "@/lib/game/clock";
import type { Lead } from "@/lib/game/leads";
import { buildSlug } from "@/lib/game/plan";
import { fuelReady, inOrder, PROBE_NEEDS, roads, SENTINEL_NEEDS } from "@/lib/game/reach";
import type { GlowOrder, Plan } from "@/lib/game/types";
import type { MindsSeen } from "@/lib/sim/minds";
import { CATALOG } from "@/lib/sim/works";

type Kind = "warm" | "cold";
type By = GlowOrder["by"];
const WITHIN = [25, 50, 100] as const;
const NEEDS: Record<By, string[]> = { sails: ["Laser Sail Array"], probe: PROBE_NEEDS, sentinel: SENTINEL_NEEDS };
const NAME: Record<By, string> = { sails: "Sails", probe: "A flyby probe", sentinel: "A sentinel" };
const t = (kt: number) => `${(kt * 1000).toLocaleString("en-US", { maximumFractionDigits: 0 })} t`;

/** What each costs a glow, in words. */
const PRICE: Record<By, string> = {
  sails: "Hours of a small grid’s power, but the laser flashes at the glow. A mind there awake sees where we are.",
  probe: `${t(CATALOG.probe.fuel)} of deuterium, under a Year of the Works. It passes, pictures a world, and reads its air.`,
  sentinel: `${t(CATALOG.sentinel.fuel)} of deuterium, about ${Math.round(CATALOG.sentinel.fuel / CATALOG.deuterium.perYear)} Years of the Works. It brakes unseen, stays, and sees what makes the heat.`,
};

/** Years from leaving until its word is home, `d` light-years out. */
const homeAfter = (by: By, d: number) =>
  by === "sails" ? d / 0.2 + d : by === "probe" ? d / CATALOG.probe.speed + CATALOG.probe.burn + d : d / CATALOG.sentinel.speed + CATALOG.sentinel.burns + CATALOG.sentinel.brake + d;

/** Our orders, reading the warm glows' first switch as a probe to each, at any distance. */
export function ordersOf(plan: Plan): Partial<Record<Kind, GlowOrder>> {
  const o = { ...(plan.glowOrders ?? {}) };
  if (!o.warm && plan.probeGlows !== undefined) o.warm = { since: plan.probeGlows, by: "probe", within: Infinity };
  return o;
}

/** The card: a row for each kind of glow we have found. */
export function GlowOrderCard({ from }: { from: number }) {
  const { leads, minds } = useLeads();
  const { plan, change } = usePlan();
  const orders = ordersOf(plan);
  const count = (k: Kind) => leads.filter((l) => l.slug.startsWith(`${k}-glow-`)).length;
  const set = (k: Kind, o: GlowOrder | undefined) =>
    change((p) => ({ ...p, glowOrders: { ...ordersOf(p), [k]: o }, ...(k === "warm" ? { probeGlows: undefined } : {}) }));
  const kinds = (["warm", "cold"] as const).filter((k) => count(k) > 0);
  if (!kinds.length) return null;
  return (
    <section className="mt-1 rounded-xl border border-other/50 bg-other/[.05] px-3 py-2.5">
      <span className="font-mono text-[10px] tracking-[.1em] text-other uppercase">Standing orders</span>
      {kinds.map((k) => (
        <Row key={k} kind={k} found={count(k)} leads={leads} minds={minds} order={orders[k]} plan={plan} from={from} set={(o) => set(k, o)} />
      ))}
    </section>
  );
}

/** The glows of a kind within `within` that have no craft of that kind from us yet. */
function unsent(plan: Plan, leads: Lead[], kind: Kind, by: By, within: number) {
  const have = new Set(by === "sentinel" ? (plan.sentinels ?? []).map((s) => s.name) : (plan.flybys ?? []).filter((f) => f.by === by).map((f) => f.name));
  return leads.filter((l) => l.slug.startsWith(`${kind}-glow-`) && !have.has(l.star) && l.ly <= within);
}

/** How often we have found glows of a kind within `within`, a Year, over the Years since our first, and the nearest. */
function findRate(minds: MindsSeen | undefined, kind: Kind, within: number, now: number) {
  const found =
    kind === "warm"
      ? (minds?.flashes ?? []).flatMap((f) => (f.range ? [{ seen: f.seen, ly: Math.sqrt(f.range[0] * f.range[1]) }] : []))
      : (minds?.glows ?? []).map((g) => ({ seen: g.seen, ly: g.d }));
  if (!found.length) return null;
  const start = Math.min(...found.map((f) => f.seen));
  const span = Math.max(1, now - start);
  return { found, start, span, perYear: found.filter((f) => f.ly <= within).length / span, nearest: Math.min(...found.map((f) => f.ly)) };
}

/** The projection, drawn: each find on a line of the Years we have looked, lit if it falls in range, and the deuterium
 *  it would draw a Year against what the Works makes. 2026-11-07, the Will asked for it at the top. */
function Projection({ pace, now, within, by }: { pace: NonNullable<ReturnType<typeof findRate>>; now: number; within: number; by: By }) {
  const far = Number.isFinite(within) ? `${within} ly` : "any distance";
  const inside = pace.found.filter((f) => f.ly <= within).length;
  const fuel = by === "sails" ? 0 : CATALOG[by].fuel;
  const draw = pace.perYear * fuel;
  const share = draw / CATALOG.deuterium.perYear;
  const r = pace.perYear;
  const value = !r ? "None yet" : by === "sails" ? (r >= 1 ? `${Math.round(r)} a Year` : `1 every ${Math.round(1 / r)} Years`) : `${t(draw)} a Year`;
  const x = (y: number) => 4 + ((y - pace.start) / Math.max(1, now - pace.start)) * 92;
  return (
    <div className="mt-2 rounded-lg border border-faint bg-paper/40 px-2.5 py-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[10px] tracking-[.1em] text-muted uppercase">Projected</span>
        <b className={`font-mono text-[13px] font-semibold ${share > 1 ? "text-other" : "text-ink"}`}>{value}</b>
      </div>
      <div className="relative mt-1.5 h-3.5" aria-hidden>
        <i className="absolute inset-x-[4%] top-1/2 h-px bg-faint" />
        {pace.found.map((f, i) => {
          const near = f.ly <= within;
          return (
            <i
              key={i}
              className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 animate-fade rounded-full motion-reduce:animate-none ${near ? "size-2 bg-other" : "size-1 bg-muted/60"}`}
              style={{ left: `${x(f.seen)}%`, animationDelay: `${i * 40}ms` }}
            />
          );
        })}
      </div>
      <div className="mt-0.5 flex justify-between font-mono text-[10px] text-muted">
        <span>Year {Math.round(pace.start)}</span>
        <span>
          {inside} of {pace.found.length} within {far}
          {!inside ? `, nearest ${Math.round(pace.nearest).toLocaleString("en-US")} ly` : ""}
        </span>
        <span>now</span>
      </div>
      {by !== "sails" && (
        <>
          <b className="relative mt-2 block h-1.5 overflow-hidden rounded-full bg-track">
            <s
              className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 motion-reduce:transition-none ${share > 1 ? "bg-other" : "bg-fill2"}`}
              style={{ width: `${Math.min(1, share) * 100}%` }}
            />
          </b>
          <p className="mt-1 text-[11.5px] leading-snug text-muted">
            {r
              ? `${Math.round(share * 100)}% of the Works’ ${t(CATALOG.deuterium.perYear)} a Year, at about one find every ${r >= 1 ? "Year or less" : `${Math.round(1 / r)} Years`}.`
              : `No cost yet at this pace. The Works makes ${t(CATALOG.deuterium.perYear)} a Year.`}
          </p>
        </>
      )}
    </div>
  );
}

/** Our deuterium, in words: what the Works makes, and how far ahead it is spoken for or what it holds. 2026-11-07. */
function stockLine(plan: Plan, works: number | null, from: number) {
  const rate = t(CATALOG.deuterium.perYear);
  if (!inOrder(plan, "Deuterium Works")) return `We have no Deuterium Works yet. Once built, it makes ${rate} a Year.`;
  if (works === null) return `Our Deuterium Works makes ${rate} a Year, once it is done.`;
  const free = fuelReady(plan, works, "stock", 0, Infinity) ?? works;
  if (works > from) return `Our Deuterium Works is done in Year ${yearText(works)}, then makes ${rate} a Year${free > works ? `, spoken for until Year ${yearText(free)}` : ""}.`;
  if (free > from) return `Our Deuterium Works makes ${rate} a Year, spoken for until Year ${yearText(free)}.`;
  return `Our Deuterium Works makes ${rate} a Year, with ${t((from - free) * CATALOG.deuterium.perYear)} in hand.`;
}

function Row({ kind, found, leads, minds, order, plan, from, set }: { kind: Kind; found: number; leads: Lead[]; minds?: MindsSeen; order?: GlowOrder; plan: Plan; from: number; set(o?: GlowOrder): void }) {
  const { scale } = useSchedule();
  const works = useMemo(() => roads(plan, scale, from)[1].works ?? null, [plan, scale, from]);
  const choices: By[] = kind === "warm" ? ["sails", "probe", "sentinel"] : ["sentinel"];
  const [by, setBy] = useState<By>(order?.by ?? (kind === "warm" ? "probe" : "sentinel"));
  const [within, setWithin] = useState<number>(order?.within ?? 50);
  const [asking, setAsking] = useState(false);
  const missing = NEEDS[by].find((n) => !inOrder(plan, n));
  const sent =
    (plan.flybys ?? []).filter((o) => o.name.startsWith(`${kind === "warm" ? "Warm" : "Cold"} glow `)).length +
    (plan.sentinels ?? []).filter((o) => o.name.startsWith(`${kind === "warm" ? "Warm" : "Cold"} glow `)).length;
  const chip = (on: boolean) => `h-7 rounded-full border px-2.5 text-[12.5px] ${on ? "border-ink text-ink" : "border-faint text-muted"}`;
  const far = Number.isFinite(within) ? within : 100;
  const fuel = by === "sails" ? 0 : CATALOG[by].fuel;
  const now = unsent(plan, leads, kind, by, within).length;
  const allIn = now && fuel ? fuelReady(plan, works, "order", now * fuel, Infinity) : null;
  const glows = (n: number) => `${n} ${kind} glow${n === 1 ? "" : "s"}`;
  const pace = findRate(minds, kind, order?.within ?? within, from);
  // What setting it now would send at once, and when its deuterium is all in. 2026-11-07, the Will asked.
  const estimate = !now
    ? `No ${kind} glow we have found is within ${far} ly yet.`
    : by === "sails"
      ? `Set now, it sends sails past the ${glows(now)} we have found within ${far} ly.`
      : `Set now, it sends ${NAME[by].toLowerCase()} to each of the ${glows(now)} we have found within ${far} ly: ${t(now * fuel)} of deuterium${allIn === null ? "" : `, all in by Year ${yearText(Math.max(from, allIn))}`}.`;
  return (
    <div className="mt-2 border-t border-faint pt-2">
      <div className="flex items-center justify-between gap-3">
        <b className="text-[14px] font-semibold">{kind === "warm" ? "Warm glows" : "Cold glows"} · {found}</b>
        <span className="font-mono text-[10px] tracking-[.1em] text-muted uppercase">Sent · {sent}</span>
      </div>
      {pace && <Projection pace={pace} now={from} within={order?.within ?? within} by={order?.by ?? by} />}
      {order ? (
        <>
          <p className="mt-1 text-[13.5px] leading-snug text-page-ink2">
            For each new {kind} glow within {Number.isFinite(order.within) ? `${order.within} ly` : "any distance"}, we send{" "}
            {NAME[order.by].toLowerCase()}. {PRICE[order.by]}
          </p>
          {order.by !== "sails" && <p className="mt-1 text-[12.5px] leading-snug text-muted">{stockLine(plan, works, from)}</p>}
          <button onClick={() => set(undefined)} className="mt-2 h-8 rounded-full border border-faint px-3.5 text-[13px] font-medium">
            Stop sending to new ones
          </button>
        </>
      ) : (
        <>
          <p className="mt-1 text-[13.5px] leading-snug text-page-ink2">For each {kind} glow within</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {WITHIN.map((w) => (
              <button key={w} onClick={() => setWithin(w)} className={chip(within === w)}>
                {w} ly
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[13.5px] leading-snug text-page-ink2">send</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {choices.map((c) => (
              <button key={c} onClick={() => setBy(c)} className={chip(by === c)}>
                {NAME[c]}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[12.5px] leading-snug text-muted">
            Each: {PRICE[by]} At {far} ly, its word comes home about {Math.round(homeAfter(by, far))} Years after it leaves.
          </p>
          {by !== "sails" && <p className="mt-1 text-[12.5px] leading-snug text-muted">{stockLine(plan, works, from)}</p>}
          <p className="mt-1 text-[12.5px] leading-snug text-page-ink2">{estimate}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {missing ? (
              <Link to={`/play/build/${buildSlug(missing)}`} className="text-[12.5px] text-you hover:underline">
                Needs the {missing} ›
              </Link>
            ) : asking ? (
              <>
                <span className="text-[12.5px] text-muted">A craft sent can’t be called back.</span>
                <button onClick={() => setAsking(false)} className="h-8 rounded-full border border-faint px-3.5 text-[13px] font-medium">
                  Wait
                </button>
                <button
                  onClick={() => {
                    set({ since: from, by, within });
                    setAsking(false);
                  }}
                  className="h-8 rounded-full bg-ink px-3.5 text-[13px] font-medium text-paper"
                >
                  Send them
                </button>
              </>
            ) : (
              <button onClick={() => setAsking(true)} className="h-8 rounded-full bg-ink px-3.5 text-[13px] font-medium text-paper">
                Set this order
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/** Our standing orders at work: each glow of the kind, within reach and without a craft of that kind from us, gets one,
 *  dated from when we ranged it or the order began, whichever is later, so a jump past a find sends it as if we had
 *  been there. A craft waits on its builds and its fuel as any other. 2026-11-05, every kind 2026-11-07. */
export function GlowOrders() {
  const { plan, change } = usePlan();
  const { leads, minds } = useLeads();
  const orders = ordersOf(plan);
  const want: { kind: Kind; by: By; name: string; y: number; d: number }[] = [];
  for (const kind of ["warm", "cold"] as const) {
    const o = orders[kind];
    if (!o || NEEDS[o.by].some((n) => !inOrder(plan, n))) continue;
    const have = new Set(o.by === "sentinel" ? (plan.sentinels ?? []).map((s) => s.name) : (plan.flybys ?? []).filter((f) => f.by === o.by).map((f) => f.name));
    for (const l of leads) {
      if (!l.slug.startsWith(`${kind}-glow-`) || have.has(l.star) || l.ly > o.within) continue;
      const ranged = kind === "warm" ? minds?.flashes[Number(l.slug.slice("warm-glow-".length)) - 1]?.ranged : undefined;
      want.push({ kind, by: o.by, name: l.star, y: Math.max(o.since, Math.floor((ranged ?? o.since) * 10) / 10), d: Math.round(l.ly) });
    }
  }
  const key = want.map((w) => `${w.by}:${w.name}`).join("|");
  useEffect(() => {
    if (!want.length) return;
    change((p) => {
      const flybys = [...(p.flybys ?? [])];
      const sentinels = [...(p.sentinels ?? [])];
      for (const w of want) {
        if (w.by === "sentinel") {
          if (!sentinels.some((s) => s.name === w.name)) sentinels.push({ name: w.name, y: w.y });
        } else if (!flybys.some((f) => f.by === w.by && f.name === w.name)) flybys.push({ name: w.name, y: w.y, d: w.d, by: w.by });
      }
      return { ...p, flybys, sentinels };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return null;
}
