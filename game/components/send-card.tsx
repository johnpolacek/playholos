import { useEffect, useRef, useState } from "react";
import { useBeams } from "@/components/beams";
import { starName } from "@/lib/game/leads";
import { useGame } from "@/components/game-provider";
import { useLeads } from "@/components/scan";
import { tenths, yearText, YEAR_0 } from "@/lib/game/clock";
import { dates, type Draft, farText, sendTime, target, WATCHER, watcherAway } from "@/lib/game/sends";
import sky from "@/lib/game/sky.json";
import { useSchedule } from "@/components/picks";
import { CALL, callPasses, callReach, GRID_2040, noticeReach, powerFor, readReach, SIZES } from "@/lib/sim/messages";

// The card the Mind offers when the Will asks to send. Aimed at a star, the ledger: where it goes, what travels, when
// it is done sending, lands, and the soonest an answer could be home. Every way at once, a dial for how far it can be
// read, over the real stars within 50 ly. Nothing goes until Send. Settled 2026-10-26, from
// explorations/send-card.html, cards 01 and 04. A lie is marked here, for us only.

const lab = "font-mono text-[9.5px] leading-none tracking-[.1em] uppercase";
const one = (y: number) => tenths(y).toFixed(1);

/** What travels, with the lie marked, for us only. */
function Travels({ draft }: { draft: Draft }) {
  const at = draft.lie ? draft.travels.indexOf(draft.lie) : -1;
  return (
    <div className="flex flex-col gap-1.5">
      <span className={`${lab} text-muted`}>What travels</span>
      <p className="text-[13.5px] leading-[1.45]">
        {at < 0 ? draft.travels : (
          <>
            {draft.travels.slice(0, at)}
            <span className="border-b border-dashed border-other">{draft.lie}</span>
            {draft.travels.slice(at + draft.lie!.length)}
          </>
        )}
      </p>
      {draft.lie && <span className="font-mono text-[10px] text-other">◆ A lie, marked for us only: {at < 0 ? draft.lie : "they read it as true"}</span>}
    </div>
  );
}

function Buttons({ label, onSend, off }: { label: string; onSend(): void; off?: boolean }) {
  const [shut, setShut] = useState(false);
  if (shut) return <p className="font-mono text-[11px] text-muted">Not sent. Tell us what to change.</p>;
  return (
    <div className="flex items-center gap-2">
      <button type="button" disabled={off} onClick={onSend} className="rounded-full bg-you px-4 py-2 text-[13px] font-semibold text-paper disabled:opacity-35">
        {label}
      </button>
      <button type="button" onClick={() => setShut(true)} className="rounded-full border border-frame px-3.5 py-[7px] text-[13px] text-muted transition-colors hover:text-ink">
        Change it
      </button>
    </div>
  );
}

const frame = "flex flex-col gap-3 rounded-xl border border-rowline bg-paper p-3.5";

/** Aimed at one star: the ledger. */
function Aimed({ id, draft, asked }: { id: string; draft: Draft; asked: string }) {
  const { orderAt: year, save, send } = useGame();
  const away = watcherAway(useLeads().minds?.watcher?.place);
  const star = target(draft.to);
  const sent = save?.sent?.find((s) => s.id === id);
  const y = sent?.y ?? year ?? 0;
  // Sent, the map shows it going: our light on its way to the star. It stayed on Earth or the lead we talked of.
  // Leaving the Mind puts it away. 2026-11-07.
  const { pick } = useBeams();
  const shown = useRef(false);
  useEffect(() => () => void (shown.current && pick([], null)), [pick]);
  const show = () => {
    if (!star || star === WATCHER) return;
    shown.current = true;
    pick([{ key: `sent:${id}`, star: star.name, sent: YEAR_0 + (year ?? 0), ly: star.d, reply: false }], 0);
  };
  if (!star) return <p className="pl-3 font-mono text-[11px] text-muted">We know no star named {draft.to} on our leads or within 50 light-years.</p>;
  const { sendYears, lands, back } = dates(y, star.d, draft.size);
  // Only a range for a far warm glow: it lands, and an answer could come, somewhere across it. Playtest 2026-11-01.
  const r = star.range;
  const span2 = (f: (x: ReturnType<typeof dates>) => number, rel: boolean) => {
    const [a, b] = [f(dates(y, r![0], draft.size)), f(dates(y, r![1], draft.size))].map((t) => (rel ? Math.round(t - y).toLocaleString("en-US") : yearText(t)));
    return rel ? `in ${a} to ${b} Years` : `Year ${a} to ${b}`;
  };
  // A knock on the watcher lands in seconds, and it answers on its own terms. 2026-10-30.
  const near = star === WATCHER;
  const facts: [string, string][] = near ? [
    sent ? ["Sent", `Year ${yearText(sent.y)}`] : ["Sends in", sendTime(sendYears)],
    ["Lands", sent ? `Year ${yearText(lands)}` : away.lands],
    ["Answer", "If it chooses"],
  ] : [
    // Once sent, it says so: "Sends in 3.4 seconds" stayed on a card already sent. Blind playtest 2026-11-07.
    sent ? ["Sent", `Year ${yearText(sent.y)}`] : ["Sends in", sendTime(sendYears)],
    // Until it is sent, the clock runs under the card, so it counts from sending. Its Years moved as we read, 4.9 on
    // the card, then 5.0 once sent, until 2026-10-30.
    ["Lands", r ? span2((d) => d.lands, !sent) : sent ? `Year ${yearText(lands)}` : `in ${one(lands - y)} Years`],
    ["Answer, soonest", r ? span2((d) => d.back, !sent) : sent ? `Year ${yearText(back)}` : `in ${one(back - y)} Years`],
  ];
  return (
    <div className={frame}>
      <div className="flex items-baseline justify-between">
        <span className={`${lab} text-you`}>To</span>
        <span className="font-mono text-[11px] text-muted">{star === WATCHER ? away.far : farText(star)}</span>
      </div>
      <b className="-mt-2 text-[15px] font-semibold">{starName(star.name)}</b>
      <Travels draft={draft} />
      <div className="grid grid-cols-3 border-y border-rowline">
        {facts.map(([k, v], i) => (
          <div key={k} className={`flex flex-col gap-[5px] py-[9px] ${i ? "border-l border-rowline pl-2.5" : ""}`}>
            <span className={`${lab} text-muted`}>{k}</span>
            <b className="font-mono text-[13px] font-semibold">{v}</b>
          </div>
        ))}
      </div>
      {sent ? (
        <p className="font-mono text-[11px] text-ok">Sent at Year {yearText(sent.y)} · on its way, lands {r ? span2((d) => d.lands, false) : `Year ${yearText(lands)}`}</p>
      ) : (
        <Buttons label="Send" onSend={() => {
          send({ ...draft, to: star.name, d: star.d, ...(star.range ? { range: star.range } : {}), ...(star.d > 50 ? { ra: star.ra, dec: star.dec } : {}), id, y: year ?? 0, asked });
          show();
        }} />
      )}
    </div>
  );
}

// The stars within 50 ly, by right ascension and distance, and the ones Earth has messaged. scripts/sky.mjs.
const STARS = sky.stars as [number, number, number][];
const MESSAGED = Object.values(sky.targets as Record<string, number[]>);

/** The real stars around Sol, seen from above Earth's pole: inside the ring that reads it, the ring that notices it,
 *  or beyond. */
function Rings({ reach, notice }: { reach: number; notice: number }) {
  const r = (ly: number) => Math.min(ly, 52) * 2;
  const at = (ra: number, ly: number) => [Math.cos((ra / 24) * 2 * Math.PI) * r(ly), -Math.sin((ra / 24) * 2 * Math.PI) * r(ly)];
  return (
    <svg viewBox="-110 -108 220 216" className="h-[210px] w-full" role="img" aria-label={`Readable to ${reach} light-years, noticed to ${Math.round(notice)}`}>
      <circle r={r(50)} fill="none" className="stroke-rowline" />
      <circle r={r(25)} fill="none" className="stroke-rowline" />
      <circle r={Math.min(r(notice), 104)} className="fill-muted/5 stroke-muted/40" strokeDasharray="2 3" />
      <circle r={r(reach)} className="fill-you/10 stroke-you/70" />
      <circle r={r(reach)} fill="none" className="stroke-you/60 motion-reduce:hidden">
        <animate attributeName="r" from="2" to={r(reach)} dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" from=".8" to="0" dur="3s" repeatCount="indefinite" />
      </circle>
      {STARS.map(([ra, ly], i) => {
        const [x, y] = at(ra, ly);
        return <circle key={i} cx={x} cy={y} r={1.1} className={ly <= reach ? "fill-you" : ly <= notice ? "fill-muted" : "fill-faint"} />;
      })}
      {MESSAGED.map(([ra, ly], i) => {
        const [x, y] = at(ra, ly);
        return <circle key={i} cx={x} cy={y} r={2.4} fill="none" className="stroke-other" strokeWidth={0.8} />;
      })}
      <circle r={3} className="fill-ink" />
      <text y={-r(reach) - 4} textAnchor="middle" className="fill-you font-mono text-[7px]">READ {reach} LY</text>
      <text y={r(50) + 9} textAnchor="middle" className="fill-muted font-mono text-[7px]">50 LY</text>
    </svg>
  );
}

const share = (p: number) => {
  const pc = (p / GRID_2040) * 100;
  return pc > 100 ? `${Math.round(pc / 100)} times Earth’s` : `${pc < 0.01 ? pc.toFixed(3) : pc < 1 ? pc.toFixed(2) : Math.round(pc)}% of Earth’s`;
};

/** The Galaxy seen from above its pole, the Sun 27,000 ly from its center, and how far a call through our Galaxy
 *  Broadcast Array is read: on its first pass, and after a hundred Years of repeats. Its beam sweeps round the plane. */
function GalaxyReach({ first, later }: { first: number; later: number | null }) {
  const r = (ly: number) => (ly / 50000) * 96;
  const sun = -r(27000);
  const n = (ly: number) => Math.round(ly).toLocaleString("en-US");
  return (
    <svg viewBox="-110 -108 220 216" className="h-[210px] w-full" role="img" aria-label={`Read on the first pass to ${n(first)} light-years`}>
      <defs>
        <clipPath id="disk">
          <circle r={r(50000)} />
        </clipPath>
      </defs>
      <circle r={r(50000)} className="fill-muted/5 stroke-muted/40" strokeDasharray="2 3" />
      {/* Two spiral arms, hinted: where the stars are. */}
      {[0, Math.PI].map((turn) => (
        <path
          key={turn}
          d={Array.from({ length: 60 }, (_, k) => { const a = turn + k * 0.11, rr = 8 + k * 1.45; return `${k ? "L" : "M"}${(rr * Math.cos(a)).toFixed(1)},${(rr * Math.sin(a)).toFixed(1)}`; }).join(" ")}
          fill="none" className="stroke-faint" strokeWidth={5} strokeLinecap="round" opacity={0.5}
        />
      ))}
      <circle r={5} className="fill-muted/40" />
      <g clipPath="url(#disk)">
        {/* Kept up, it is read as far as the Galaxy's center: the ring that reaches it. */}
        {later !== null && <circle cy={sun} r={r(later)} className="fill-you/5 stroke-you/30" strokeDasharray="3 3" />}
        <circle cy={sun} r={r(first)} className="fill-you/15 stroke-you/70" />
        <g className="motion-reduce:hidden">
          <line y1={sun} x2={0} y2={sun - 200} className="stroke-you/60" strokeWidth={0.8}>
            <animateTransform attributeName="transform" type="rotate" from={`0 0 ${sun}`} to={`360 0 ${sun}`} dur="9s" repeatCount="indefinite" />
          </line>
        </g>
      </g>
      <circle cy={sun} r={2.4} className="fill-ink" />
      <text y={sun - r(first) - 4} textAnchor="middle" className="fill-you font-mono text-[7px]">READ {n(first)} LY</text>
      <text y={12} textAnchor="middle" className="fill-muted font-mono text-[7px]">THE GALAXY’S CENTER</text>
      <text y={r(50000) + 9} textAnchor="middle" className="fill-muted font-mono text-[7px]">NOTICED ACROSS THE GALAXY</text>
    </svg>
  );
}

/** Every way at once: the dial, the rings, and repeat or once. With our Galaxy Broadcast Array done, the Will picks
 *  the stars near us or the Galaxy's plane: the array sends nothing unless we send it here. 2026-11-11. */
function Everywhere({ id, draft, asked }: { id: string; draft: Draft; asked: string }) {
  const { orderAt: year, save, send, stopSending } = useGame();
  const sent = save?.sent?.find((s) => s.id === id);
  const { done } = useSchedule();
  const array = done["Galaxy Broadcast Array"];
  const canCall = array != null && array <= (year ?? 0);
  const [dial, setDial] = useState(20);
  const [repeat, setRepeat] = useState(true);
  const [far, setFar] = useState(false);
  const galaxy = sent ? !!sent.galaxy : far && canCall;
  const bits = SIZES[draft.size];
  const reach = galaxy ? Math.round(callReach(bits)) : (sent?.reach ?? dial);
  const power = galaxy ? CALL.watts : powerFor(reach, bits);
  const notice = noticeReach(power), heard = readReach(power, bits, 86400, 365);
  const over = !galaxy && power > GRID_2040;
  const n = (ly: number) => Math.round(ly).toLocaleString("en-US");
  const stats: [string, string][] = galaxy
    ? [
        ["Power", `${share(power)}, in pulses`],
        ["Each star gets", "About a second a Year"],
        ["Noticed", "Across the Galaxy, first pass"],
        ["Read on the first pass to", `${n(reach)} ly`],
        ["Read at the Galaxy’s center", (sent ? sent.repeat : repeat) ? `After ${callPasses(bits, 27000).toLocaleString("en-US")} Years` : "Only if it repeats"],
      ]
    : [
        ["Power", share(power)],
        ["Noticed to, in a day", `${Math.round(notice)} ly`],
        ["Read by a star that listens a Year", `${Math.round(heard)} ly`],
      ];
  const toggle = (on: boolean) => `rounded-full px-3 py-[5px] text-[12px] ${on ? "bg-faint text-ink" : "text-muted"}`;
  return (
    <div className={frame}>
      <span className={`${lab} text-you`}>To everyone</span>
      <Travels draft={draft} />
      {!sent && canCall && (
        <div className="inline-flex self-start rounded-full border border-frame p-0.5" role="group" aria-label="How far">
          <button type="button" aria-pressed={!far} onClick={() => setFar(false)} className={toggle(!far)}>
            The stars near us
          </button>
          <button type="button" aria-pressed={far} onClick={() => setFar(true)} className={toggle(far)}>
            The Galaxy
          </button>
        </div>
      )}
      {!sent && !galaxy && (
        <label className="flex flex-col gap-1.5">
          <span className="flex justify-between">
            <span className={`${lab} text-muted`}>Readable to</span>
            <b className="font-mono text-[12px]">{dial} ly</b>
          </span>
          <input type="range" min={5} max={50} value={dial} onChange={(e) => setDial(Number(e.target.value))} className="w-full accent-you" />
        </label>
      )}
      {galaxy ? <GalaxyReach first={reach} later={(sent ? sent.repeat : repeat) ? 27000 : null} /> : <Rings reach={reach} notice={notice} />}
      {galaxy && draft.size !== "page" && (
        <p className="text-[12.5px] text-other">Only a page of words reads far in a second a Year. This is larger, so it is read only near us.</p>
      )}
      <div>
        {stats.map(([k, v]) => (
          <div key={k} className="flex justify-between border-t border-rowline py-1.5 text-[12.5px]">
            <span>{k}</span>
            <b className={`font-mono text-[12px] font-semibold ${k === "Power" && over ? "text-other" : ""}`}>{v}</b>
          </div>
        ))}
      </div>
      {sent ? (
        <p className="font-mono text-[11px] text-ok">
          {sent.repeat && sent.stopped === undefined ? (
            <>
              Calling since Year {yearText(sent.y)} ·{" "}
              <button type="button" onClick={() => stopSending(id, year ?? sent.y)} className="underline">
                Stop
              </button>
            </>
          ) : sent.repeat ? `Called from Year ${one(sent.y)} to ${one(sent.stopped!)}` : `Sent once at Year ${one(sent.y)}`}
        </p>
      ) : (
        <>
          <div className="inline-flex self-start rounded-full border border-frame p-0.5" role="group" aria-label="Repeat">
            <button type="button" aria-pressed={repeat} onClick={() => setRepeat(true)} className={toggle(repeat)}>
              Repeat until stopped
            </button>
            <button type="button" aria-pressed={!repeat} onClick={() => setRepeat(false)} className={toggle(!repeat)}>
              Once
            </button>
          </div>
          {over && <p className="text-[12.5px] text-other">More power than Earth makes. Send less, or not as far.</p>}
          <Buttons label={repeat ? "Start calling" : "Send once"} off={over} onSend={() => send({ ...draft, id, y: year ?? 0, asked, reach: galaxy ? reach : dial, repeat, ...(galaxy ? { galaxy: true } : {}) })} />
        </>
      )}
    </div>
  );
}

/** The Mind's offer under its answer, drawn as the card for where it goes. */
export function SendCard({ id, draft, asked }: { id: string; draft: Draft; asked: string }) {
  return draft.to === "everywhere" ? <Everywhere id={id} draft={draft} asked={asked} /> : <Aimed id={id} draft={draft} asked={asked} />;
}
