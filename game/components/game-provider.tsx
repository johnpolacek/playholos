import { createContext, use, useEffect, useRef, useState } from "react";
import { ordersLand, yearAt } from "@/lib/game/clock";
import { browserStore } from "@/lib/game/store";
import { POOL } from "@/lib/sim/pool";
import type { Reaction, Save, Sent, Will } from "@/lib/game/types";

interface Game {
  /** Undefined until the save loads. */
  save?: Save;
  /** Game Years since Begin. Null before Begin, or while loading. */
  year: number | null;
  /** The Year an order given now lands on Earth: now, or a light-time on while the Will lives at our Mind far away. */
  orderAt: number | null;
  wake(): void;
  setCharter(charter: NonNullable<Save["charter"]>): void;
  setPlan(plan: NonNullable<Save["plan"]>): void;
  setGuide(guide: NonNullable<Save["guide"]>): void;
  setTalk(talk: NonNullable<Save["talk"]>): void;
  /** Sends the Will to live at our Mind at a hole or a star, once, for good. It is dark while it crosses. */
  moveWill(will: Will): void;
  /** Sends a message: it joins what we have sent, for good. */
  send(message: Sent): void;
  /** Stops a message sent every way at once from repeating, at Year `y`. What has left keeps going. */
  stopSending(id: string, y: number): void;
  /** Keeps how neighbors took our messages. Each is decided once: one already kept is never replaced. */
  addReactions(list: Reaction[]): void;
  /** Marks readings as opened. */
  see(ids: string[]): void;
  /** Marks one of the things we would do before Begin as done. Once done, it stays done. */
  did(step: "reviewed" | "reached" | "asked"): void;
  begin(): void;
  newGame(): void;
}

const GameContext = createContext<Game | null>(null);

// The seed is drawn when a new game begins, from the pool of worlds calcs/export_worlds.py drew.
const drawSeed = () => POOL[Math.floor(Math.random() * POOL.length)];
function freshSave(): Save {
  return { seed: drawSeed(), beganAt: null };
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [save, setSave] = useState<Save>();
  const [now, setNow] = useState(0);

  useEffect(() => {
    browserStore.load().then((loaded) => {
      // A save from before the pool keeps its clock and takes a seed the server has a world for.
      const game = !loaded ? freshSave() : POOL.includes(loaded.seed) ? loaded : { ...loaded, seed: drawSeed() };
      if (game !== loaded) browserStore.save(game);
      setSave(game);
      setNow(Date.now());
    });
  }, []);

  // The clock is the time since Begin, so it is right after a reload or a night away. The tick only redraws it.
  const began = save?.beganAt ?? null;
  useEffect(() => {
    if (began === null) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [began]);

  // The latest save, so two changes in one tap both land.
  const latest = useRef<Save>(undefined);
  function update(game: Save) {
    latest.current = game;
    setSave(game);
    setNow(Date.now());
    browserStore.save(game);
  }

  const change = (f: (s: Save) => Save) => {
    const s = latest.current ?? save;
    if (s) update(f(s));
  };
  const game: Game = {
    save,
    year: yearAt(began, now, save?.will),
    orderAt: (() => {
      const y = yearAt(began, now, save?.will);
      return y === null ? null : ordersLand(y, save?.will);
    })(),
    moveWill: (will) => change((s) => (s.will ? s : { ...s, will })),
    wake: () => change((s) => ({ ...s, woke: true })),
    setCharter: (charter) => change((s) => ({ ...s, charter })),
    setPlan: (plan) => change((s) => ({ ...s, plan })),
    setGuide: (guide) => change((s) => ({ ...s, guide })),
    setTalk: (talk) => change((s) => ({ ...s, talk })),
    send: (message) => change((s) => (s.sent?.some((x) => x.id === message.id) ? s : { ...s, sent: [...(s.sent ?? []), message] })),
    addReactions: (list) =>
      change((s) => {
        const had = new Set((s.reactions ?? []).map((r) => r.key));
        const fresh = list.filter((r) => !had.has(r.key));
        // A gift of knowledge speeds our thinking once all of it has reached us: one a star, in our plan's pacing.
        const given = new Set((s.plan?.gifts ?? []).map((g) => g.name));
        const gifts = fresh.filter((r) => r.move === "gift" && r.arrives !== undefined && !given.has(r.star) && !!given.add(r.star));
        const plan = s.plan ?? { builds: [], observe: [] };
        return {
          ...s,
          reactions: [...(s.reactions ?? []), ...fresh],
          ...(gifts.length ? { plan: { ...plan, gifts: [...(plan.gifts ?? []), ...gifts.map((r) => ({ name: r.star, y: r.arrives!, ...(r.size ? { size: r.size } : {}) }))] } } : {}),
        };
      }),
    stopSending: (id, y) => change((s) => ({ ...s, sent: s.sent?.map((x) => (x.id === id && x.stopped === undefined ? { ...x, stopped: y } : x)) })),
    see: (ids) => change((s) => ({ ...s, seen: [...new Set([...(s.seen ?? []), ...ids])] })),
    did: (step) => void ((latest.current ?? save)?.[step] || change((s) => ({ ...s, [step]: true }))),
    begin: () => change((s) => ({ ...s, beganAt: Date.now() })),
    newGame: () => update(freshSave()),
  };
  return <GameContext value={game}>{children}</GameContext>;
}

export function useGame(): Game {
  const game = use(GameContext);
  if (!game) throw new Error("useGame needs a GameProvider");
  return game;
}
