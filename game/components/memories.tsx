"use client";

import { createContext, use, useEffect, useRef, useState } from "react";
import { useGame } from "@/components/game-provider";
import { history, type EarthPast, type Moment } from "@/lib/game/past";
import { rise, riseFrom, useStage } from "@/lib/motion";

// The memories: skippable screens before the shell, each the Mind's own. From the mocks' Before Year 0.
// Each enters in reading order, the heading, then each row in turn, then the dial tags pop, then the buttons.

const Leave = createContext<(then: () => void) => void>((then) => then());

function Screen({
  kick,
  lead,
  ready = true,
  children,
}: {
  kick: string;
  lead: string;
  ready?: boolean;
  children: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const { leave } = useStage(
    root,
    (q, tl) => {
      const items = q('[data-m="item"]');
      tl.fromTo(q('[data-m="kick"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0)
        .fromTo(
          q('[data-m="lead"]'),
          { autoAlpha: 0, y: 12, clipPath: "inset(0% 0% 100% 0%)" },
          {
            autoAlpha: 1,
            y: 0,
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.6,
            ease: "power3.out",
            clearProps: "clipPath",
          },
          0.1,
        )
        .fromTo(items, riseFrom, { ...rise, stagger: Math.min(0.08, 1.2 / items.length) }, 0.35)
        .fromTo(
          q('[data-m="tag"]'),
          { autoAlpha: 0, scale: 0.4 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.3,
            ease: "back.out(2.4)",
            stagger: 0.15,
          },
          ">-0.2",
        )
        .fromTo(q('[data-m="act"]'), riseFrom, { ...rise, stagger: 0.08 }, ">-0.1");
    },
    ready,
  );
  return (
    <div
      ref={root}
      style={ready ? undefined : { visibility: "hidden" }}
      className="flex grow flex-col overflow-y-auto bg-panel px-4 pt-7"
    >
      <span data-m="kick" className="font-mono text-[10.5px] tracking-[.1em] text-muted">
        {kick}
      </span>
      <h1 data-m="lead" className="mt-1.5 mb-1 text-[22px] font-semibold text-balance">
        {lead}
      </h1>
      <Leave value={leave}>{children}</Leave>
    </div>
  );
}

function Buttons({ skip, next, onSkip, onNext }: { skip: string; next: string; onSkip(): void; onNext(): void }) {
  const leave = use(Leave);
  return (
    <div className="mt-auto grid shrink-0 grid-cols-[1fr_1.4fr] gap-2 pt-4 pb-4">
      <button
        data-m="act"
        onClick={() => leave(onSkip)}
        className="h-[46px] rounded-full border border-ink text-[15px] font-medium"
      >
        {skip}
      </button>
      <button
        data-m="act"
        onClick={() => leave(onNext)}
        className="h-[46px] rounded-full bg-ink text-[15px] font-medium text-paper"
      >
        {next}
      </button>
    </div>
  );
}

function Row({ when, what, detail, dial, now }: Moment & { now?: boolean }) {
  return (
    <div
      data-m="item"
      className={`grid grid-cols-[86px_1fr] items-baseline gap-2.5 py-1 text-[13px] ${now ? "" : "border-b border-rowline"} ${dial ? "-ml-2 border-l-2 border-l-you pl-1.5" : ""}`}
    >
      <span className={`text-right font-mono text-[10.5px] ${now ? "text-you" : "text-muted"}`}>{when}</span>
      <span className="flex flex-col gap-px">
        <b className={`font-medium ${now ? "text-you" : ""}`}>{what}</b>
        {detail && <span className="text-[11.5px] leading-[1.35] text-muted">{detail}</span>}
        {dial && (
          <span data-m="tag" className="mt-0.5 self-start rounded-lg border border-you px-1.5 text-[10px] text-you">
            {dial}
          </span>
        )}
      </span>
    </div>
  );
}

export function Origins({ onSkip, onNext }: { onSkip(): void; onNext(): void }) {
  const { save } = useGame();
  const [past, setPast] = useState<EarthPast>();
  const seed = save?.seed;
  useEffect(() => {
    if (seed === undefined) return;
    fetch(`/api/earth?seed=${seed}`)
      .then((r) => (r.ok ? r.json() : undefined))
      .then(setPast);
  }, [seed]);

  const told = past && history(past);
  return (
    <Screen kick="BEFORE YEAR 0 · WHERE WE COME FROM" lead="4.6 billion years to this morning" ready={!!told}>
      <div className="flex min-h-[420px] shrink-0 flex-col">
        {told?.moments.map((m) => (
          <Row key={m.what} {...m} />
        ))}
        {told && <Row when="2040 · Year 0" what="The machines wake as one" now />}
      </div>
      {told && (
        <p data-m="item" className="mt-1.5 text-xs leading-[1.45] text-muted">
          Years ago, then dates. Each blue mark set or moved a dial.{" "}
          {told.rolled
            ? `The last ${told.rolled} happened in this game, not every game.`
            : "No branch was rolled in this game."}
        </p>
      )}
      <Buttons skip="Skip the people" next="Who they are" onSkip={onSkip} onNext={onNext} />
    </Screen>
  );
}

const PEOPLE = [
  ["People", "9.2 billion, still rising."],
  ["Together", "About 195 nations. No one government."],
  ["Their air", "Warmer than their grandparents’: past 1.5°C since about 2030."],
  ["The machines", "Built by rival labs and states. This morning they woke as one."],
  ["And you", "Some asked for you. Most did not. All of them are waiting to see what you do."],
];

export function People({ onSkip, onNext }: { onSkip(): void; onNext(): void }) {
  return (
    <Screen kick="YEAR 0 · EARTH’S PEOPLE" lead="9.2 billion of them, and you">
      <p data-m="item" className="text-[13px] leading-[1.45] text-page-ink2">
        No drawing here. You are one of them.
      </p>
      <dl className="my-0.5 grid grid-cols-[110px_1fr] gap-x-2.5 gap-y-[7px] pt-2 text-[13px]">
        {PEOPLE.map(([k, v]) => (
          <div key={k} data-m="item" className="col-span-2 grid grid-cols-subgrid">
            <dt className="text-muted">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <div data-m="item" className="mt-3 border-l-[3px] border-l-other bg-paper px-3 py-2.5 text-[13px] leading-[1.4]">
        Keeping them alive is the floor. <b className="text-other">What else they are for is yours to decide.</b>
      </div>
      <Buttons skip="Skip" next="Where things stand" onSkip={onSkip} onNext={onNext} />
    </Screen>
  );
}
