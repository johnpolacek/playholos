"use client";

import { createContext, use, useEffect, useState } from "react";
import { yearAt } from "@/lib/game/clock";
import { browserStore } from "@/lib/game/store";
import { POOL } from "@/lib/sim/pool";
import type { Save } from "@/lib/game/types";

interface Game {
  /** Undefined until the save loads. */
  save?: Save;
  /** Game Years since Begin. Null before Begin, or while loading. */
  year: number | null;
  wake(): void;
  setCharter(charter: NonNullable<Save["charter"]>): void;
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

  function update(game: Save) {
    setSave(game);
    setNow(Date.now());
    browserStore.save(game);
  }

  const game: Game = {
    save,
    year: yearAt(began, now),
    wake: () => save && update({ ...save, woke: true }),
    setCharter: (charter) => save && update({ ...save, charter }),
    begin: () => save && update({ ...save, beganAt: Date.now() }),
    newGame: () => update(freshSave()),
  };
  return <GameContext value={game}>{children}</GameContext>;
}

export function useGame(): Game {
  const game = use(GameContext);
  if (!game) throw new Error("useGame needs a GameProvider");
  return game;
}
