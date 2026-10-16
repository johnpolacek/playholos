"use client";

import { createContext, use, useEffect, useState } from "react";
import { yearAt } from "@/lib/game/clock";
import { browserStore } from "@/lib/game/store";
import type { Save } from "@/lib/game/types";

interface Game {
  /** Undefined until the save loads. */
  save?: Save;
  /** Game Years since Begin. Null before Begin, or while loading. */
  year: number | null;
  begin(): void;
  newGame(): void;
}

const GameContext = createContext<Game | null>(null);

// The seed is drawn when a new game begins. A stand-in until calcs/seed.py is ported.
function freshSave(): Save {
  return { seed: Math.floor(Math.random() * 2 ** 31), beganAt: null };
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [save, setSave] = useState<Save>();
  const [now, setNow] = useState(0);

  useEffect(() => {
    browserStore.load().then((loaded) => {
      const game = loaded ?? freshSave();
      if (!loaded) browserStore.save(game);
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
