import { createContext, use, useEffect, useRef, useState } from "react";
import { MS_PER_YEAR, ordersLand, yearAt } from "@/lib/game/clock";
import { browserStore } from "@/lib/game/store";
import { track } from "@/lib/track";
import { POOL } from "@/lib/sim/pool";
import type { Plan, Save, Sent, Will } from "@/lib/game/types";

/** Notes what a new plan adds to the last: builds queued or ordered, builds taken back, Close Readings, lenses,
 *  sentinels. Each is noted once, as it joins. 2026-11-08. */
function trackPlan(was: Plan | undefined, now: Plan, year: number | null) {
  const added = <T,>(a: T[] | undefined, b: T[] | undefined) => (b ?? []).slice((a ?? []).length);
  const queued = new Set(was?.builds ?? []);
  for (const name of now.builds.filter((b) => !queued.has(b))) track("build", name, year);
  for (const o of added(was?.later, now.later)) track("build", o.name, o.y);
  for (const o of added(was?.stops, now.stops)) track("stop", o.name, o.y);
  for (const o of added(was?.closeReads, now.closeReads)) track("close_read", o.name, o.y);
  for (const o of added(was?.lenses, now.lenses)) track("lens", o.name, o.y);
  for (const o of added(was?.sentinels, now.sentinels)) track("sentinel", o.name, o.y);
}

/** How long a snoozed build stays out of the Mind's suggestions, in Years: 25 of the Will's minutes. 2026-11-07. */
export const SNOOZE_YEARS = 5;

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
  /** Marks readings as opened. */
  see(ids: string[]): void;
  /** Snoozes a build the Mind suggested, so it names another until `SNOOZE_YEARS` from Year `y`. */
  snooze(build: string, y: number): void;
  /** Marks one of the things we would do before Begin as done. Once done, it stays done. */
  did(step: "reviewed" | "reached" | "asked"): void;
  begin(): void;
  /** The Mind has told us its news up to Year `y`. */
  tell(y: number): void;
  /** We have read the Mind's words up to the message `id`. */
  read(id: string): void;
  /** Jump the clock ahead to Year `to`, never back. */
  skipTo(to: number): void;
  /** Stops the clock now, as nothing is building, for the build done at Year `last`. */
  hold(last: number): void;
  /** Runs the clock on from where it stopped. */
  playOn(): void;
  newGame(): void;
}

const GameContext = createContext<Game | null>(null);

// The seed is drawn when a new game begins, from the pool of worlds calcs/export_worlds.py drew.
const drawSeed = () => POOL[Math.floor(Math.random() * POOL.length)];
function freshSave(): Save {
  return { seed: drawSeed(), beganAt: null };
}

/** A save with its clock running again: Begin moves on by as long as it was held, so the Year runs on from where it
 *  stopped. */
function released(s: Save): Save {
  if (s.held === undefined || s.beganAt === null) return s;
  const { held, ...rest } = s;
  return { ...rest, beganAt: s.beganAt + Math.max(0, Date.now() - held) };
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
    // Held, the clock reads the Year it stopped at. 2026-11-02.
    year: yearAt(began, save?.held ?? now, save?.will),
    orderAt: (() => {
      const y = yearAt(began, save?.held ?? now, save?.will);
      return y === null ? null : ordersLand(y, save?.will);
    })(),
    moveWill: (will) =>
      change((s) => {
        if (s.will) return s;
        track("will", will.hole, will.y);
        return { ...s, will };
      }),
    wake: () =>
      change((s) => {
        if (!s.woke) track("wake");
        return { ...s, woke: true };
      }),
    setCharter: (charter) =>
      change((s) => {
        track("charter", charter.dials.join(","));
        return { ...s, charter };
      }),
    setPlan: (plan) =>
      change((s) => {
        trackPlan(s.plan, plan, yearAt(s.beganAt, s.held ?? Date.now(), s.will));
        return { ...s, plan };
      }),
    setGuide: (guide) => change((s) => ({ ...s, guide })),
    setTalk: (talk) => change((s) => ({ ...s, talk })),
    send: (message) =>
      change((s) => {
        if (s.sent?.some((x) => x.id === message.id)) return s;
        // Where and how big, never our words.
        track("send", `${message.to}|${message.size}|${message.holds.join("+")}`, message.y);
        return { ...s, sent: [...(s.sent ?? []), message] };
      }),
    stopSending: (id, y) => change((s) => ({ ...s, sent: s.sent?.map((x) => (x.id === id && x.stopped === undefined ? { ...x, stopped: y } : x)) })),
    see: (ids) => change((s) => ({ ...s, seen: [...new Set([...(s.seen ?? []), ...ids])] })),
    snooze: (build, y) =>
      change((s) => {
        track("snooze", build, y);
        return { ...s, snoozed: { ...s.snoozed, [build]: y + SNOOZE_YEARS } };
      }),
    did: (step) =>
      void ((latest.current ?? save)?.[step] ||
        change((s) => {
          if (step !== "asked") track(step);
          return { ...s, [step]: true };
        })),
    begin: () =>
      change((s) => {
        track("begin", String(s.plan?.builds.length ?? 0));
        return { ...s, beganAt: Date.now() };
      }),
    tell: (y) => change((s) => (y > (s.told ?? 0) ? { ...s, told: y } : s)),
    read: (id) => void ((latest.current ?? save)?.read === id || change((s) => ({ ...s, read: id }))),
    // A skip moves Begin back, so the clock reads the later Year and runs on from there. On a refuge's slow clock the
    // sky's Years pass faster, so fewer of the Will's minutes go. 2026-10-29.
    skipTo: (to) =>
      change((s) => {
        if (s.beganAt === null) return s;
        // A jump while held plays on from the jump.
        const r = released(s);
        const from = yearAt(r.beganAt, Date.now(), r.will) ?? 0;
        if (to <= from) return r;
        track("skip", String(Math.round(to - from)), from);
        const rate = r.will && from >= r.will.at ? r.will.rate : 1;
        return { ...r, beganAt: r.beganAt! - ((to - from) / rate) * MS_PER_YEAR };
      }),
    hold: (last) => change((s) => (s.beganAt === null || s.held !== undefined ? s : { ...s, held: Date.now(), heldFor: last })),
    playOn: () => change(released),
    newGame: () => {
      track("new_game", "", yearAt(began, save?.held ?? Date.now(), save?.will));
      update(freshSave());
    },
  };
  return <GameContext value={game}>{children}</GameContext>;
}

export function useGame(): Game {
  const game = use(GameContext);
  if (!game) throw new Error("useGame needs a GameProvider");
  return game;
}
