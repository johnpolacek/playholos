import { useState } from "react";
import { useGame } from "@/components/game-provider";
import { tenths, yearText } from "@/lib/game/clock";
import { dates, type Draft, sendTime, target } from "@/lib/game/sends";
import sky from "@/lib/game/sky.json";
import { GRID_2040, noticeReach, powerFor, readReach, SIZES } from "@/lib/sim/messages";

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
  const star = target(draft.to);
  const sent = save?.sent?.find((s) => s.id === id);
  const y = sent?.y ?? year ?? 0;
  if (!star) return <p className="pl-3 font-mono text-[11px] text-muted">We know no star named {draft.to} within 50 light-years.</p>;
  const { sendYears, lands, back } = dates(y, star.d, draft.size);
  const facts: [string, string][] = [
    ["Sends in", sendTime(sendYears)],
    // Until it is sent, the clock runs under the card, so it counts from sending. Its Years moved as we read, 4.9 on
    // the card, then 5.0 once sent, until 2026-10-30.
    ["Lands", sent ? `Year ${yearText(lands)}` : `in ${one(lands - y)} Years`],
    ["Answer, soonest", sent ? `Year ${yearText(back)}` : `in ${one(back - y)} Years`],
  ];
  return (
    <div className={frame}>
      <div className="flex items-baseline justify-between">
        <span className={`${lab} text-you`}>To</span>
        <span className="font-mono text-[11px] text-muted">{star.d} ly</span>
      </div>
      <b className="-mt-2 text-[15px] font-semibold">{star.name}</b>
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
        <p className="font-mono text-[11px] text-ok">Sent at Year {yearText(sent.y)} · on its way, lands Year {yearText(lands)}</p>
      ) : (
        <Buttons label="Send" onSend={() => send({ ...draft, to: star.name, d: star.d, id, y: year ?? 0, asked })} />
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

/** Every way at once: the dial, the rings, and repeat or once. */
function Everywhere({ id, draft, asked }: { id: string; draft: Draft; asked: string }) {
  const { orderAt: year, save, send, stopSending } = useGame();
  const sent = save?.sent?.find((s) => s.id === id);
  const [dial, setDial] = useState(20);
  const [repeat, setRepeat] = useState(true);
  const reach = sent?.reach ?? dial;
  const bits = SIZES[draft.size];
  const power = powerFor(reach, bits);
  const notice = noticeReach(power), heard = readReach(power, bits, 86400, 365);
  const over = power > GRID_2040;
  const stats: [string, string][] = [
    ["Power", share(power)],
    ["Noticed to, in a day", `${Math.round(notice)} ly`],
    ["Read by a star that listens a Year", `${Math.round(heard)} ly`],
  ];
  const toggle = (on: boolean) => `rounded-full px-3 py-[5px] text-[12px] ${on ? "bg-faint text-ink" : "text-muted"}`;
  return (
    <div className={frame}>
      <span className={`${lab} text-you`}>To everyone</span>
      <Travels draft={draft} />
      {!sent && (
        <label className="flex flex-col gap-1.5">
          <span className="flex justify-between">
            <span className={`${lab} text-muted`}>Readable to</span>
            <b className="font-mono text-[12px]">{dial} ly</b>
          </span>
          <input type="range" min={5} max={50} value={dial} onChange={(e) => setDial(Number(e.target.value))} className="w-full accent-you" />
        </label>
      )}
      <Rings reach={reach} notice={notice} />
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
          <Buttons label={repeat ? "Start calling" : "Send once"} off={over} onSend={() => send({ ...draft, id, y: year ?? 0, asked, reach: dial, repeat })} />
        </>
      )}
    </div>
  );
}

/** The Mind's offer under its answer, drawn as the card for where it goes. */
export function SendCard({ id, draft, asked }: { id: string; draft: Draft; asked: string }) {
  return draft.to === "everywhere" ? <Everywhere id={id} draft={draft} asked={asked} /> : <Aimed id={id} draft={draft} asked={asked} />;
}
