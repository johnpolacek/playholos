"use client";

import { useState } from "react";
import { Drift, type Look } from "@/components/drift";

function Phone({ look, name, epoch, restart }: { look: Look; name: string; epoch: number; restart(): void }) {
  return (
    <figure className="flex flex-col items-center gap-2">
      <figcaption className="font-mono text-[10.5px] tracking-[.1em] text-muted">{name}</figcaption>
      <div className="flex h-[min(844px,calc(100dvh-64px))] w-[390px] flex-col overflow-hidden rounded-[28px] bg-paper shadow-[0_0_0_1px_var(--frame),0_12px_32px_var(--shadow)]">
        <Drift key={epoch} look={look} epoch={epoch} onSkip={() => {}} onNext={restart} />
      </div>
    </figure>
  );
}

// Both phones fly one flight from one start, so each moment can be compared. Begin game in either plays its dive,
// then both start over together.
export function Compare() {
  const [epoch, setEpoch] = useState(() => performance.now());
  const restart = () => setEpoch(performance.now());
  return (
    <main className="flex min-h-dvh flex-wrap items-start justify-center gap-8 p-6">
      <Phone look="drift" name="THE DRIFT · LIB/DRIFT.TS" epoch={epoch} restart={restart} />
      <Phone look="atlas" name="THE MAP'S LINE ART · SRC/STRIP.JS" epoch={epoch} restart={restart} />
    </main>
  );
}
