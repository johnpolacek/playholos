import type { Metadata } from "next";
import { PageHead } from "@/components/about/doc-page";
import log from "@/data/build-log.json";

export const metadata: Metadata = {
  title: "Building",
  description: "How Holos is built: evidence first, then rules, numbers, mocks, a real map, and the game.",
};

type Part = (typeof log.parts)[number];

// The method, in the order the work runs. Each step names the log parts it fills.
const STEPS: { title: string; text: string; parts: string[] }[] = [
  {
    title: "Evidence first",
    text: "Each question starts from what has been measured and published, the newest included. Every source goes into the research log with what it found, why it matters, and where the game uses it. Preliminary results are marked, with what would change if the full paper differs.",
    parts: ["research"],
  },
  {
    title: "One question at a time",
    text: "The rules are settled one question at a time, and each answer is dated in the design doc. Improbable is fine, contradicted is not. When a newer result changes an answer, the correction is written beside it.",
    parts: ["design"],
  },
  {
    title: "Work the numbers",
    text: "Python draws a whole game from a seed, and runs hundreds of games to see what a rule does. A checker keeps every neighbor below what Earth could have seen by 2040.",
    parts: ["numbers"],
  },
  {
    title: "Play it on paper",
    text: "Before code, the design is played as mock screens drawn from one seeded game, minute by minute, to find the quiet stretches and the missing choices.",
    parts: ["mocks"],
  },
  {
    title: "A real map",
    text: "The planets where an ephemeris puts them today, 109,400 stars, Gaia's census of the 9,494 objects within 100 light-years, and the nearby galaxies, in one continuous scene.",
    parts: ["atlas"],
  },
  {
    title: "Build the game",
    text: "Next.js and Three.js. The simulation is ported from the Python a piece at a time, with CPython's own random generator, and tests check each roll against the Python. Earth's Mind is a language model told only what Earth knows at that moment, never the seed's truth.",
    parts: ["sky", "opening", "mind", "sim", "shell", "look"],
  },
];

const SHOWN = 5;

function Changes({ part }: { part: Part }) {
  const item = (text: string) => (
    <li
      key={text}
      className="relative pl-4 before:absolute before:top-[.6em] before:left-0 before:h-1 before:w-1 before:rounded-full before:bg-faint"
    >
      {text}
    </li>
  );
  const more = part.items.slice(SHOWN);
  return (
    <section data-a id={`part-${part.key}`} className="scroll-mt-16 border-t border-rowline py-7">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[18px] font-semibold">{part.title}</h3>
        <span className="font-mono text-[10.5px] tracking-[.1em] text-muted tabular-nums">
          {part.items.length} {part.items.length === 1 ? "CHANGE" : "CHANGES"}
        </span>
      </div>
      <p className="mt-1.5 text-[14px] leading-[1.5] text-muted">{part.about}</p>
      <ul className="mt-4 flex flex-col gap-1.5 text-[14.5px] leading-[1.45]">
        {part.items.slice(0, SHOWN).map(item)}
      </ul>
      {more.length > 0 && (
        <details className="group mt-3">
          <summary className="cursor-pointer list-none font-mono text-[10.5px] tracking-[.1em] text-you group-open:mb-1.5 [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">ALL {part.items.length} ↓</span>
            <span className="hidden group-open:inline">FEWER ↑</span>
          </summary>
          <ul className="flex flex-col gap-1.5 text-[14.5px] leading-[1.45]">{more.map(item)}</ul>
        </details>
      )}
    </section>
  );
}

export default function Building() {
  const parts = new Map(log.parts.map((p) => [p.key, p]));
  const total = log.parts.reduce((n, p) => n + p.items.length, 0);
  return (
    <main>
      <PageHead
        kicker="HOW IT IS BUILT"
        title="Evidence, then rules, then the game"
        stats={[
          [total, "changes"],
          [log.parts.length, "parts of the work"],
        ]}
      >
        Holos is built one question at a time. Here is the method, step by step, and every change made so far, filed
        under the part of the work it touched.
      </PageHead>

      <div className="mx-auto grid max-w-[1180px] gap-x-14 px-4 pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section aria-label="The method">
          <div data-a className="mb-5 font-mono text-[10.5px] tracking-[.1em] text-muted">
            THE METHOD
          </div>
          <ol className="relative">
            {STEPS.map((step, i) => {
              const count = step.parts.reduce((n, k) => n + (parts.get(k)?.items.length ?? 0), 0);
              return (
                <li key={step.title} data-a className="relative pb-7 pl-9 last:pb-0">
                  {i < STEPS.length - 1 && (
                    <span aria-hidden className="absolute top-6 bottom-0 left-[11px] w-px bg-faint" />
                  )}
                  <span
                    aria-hidden
                    className="absolute top-0.5 left-0 flex h-[23px] w-[23px] items-center justify-center rounded-full border border-faint bg-page font-mono text-[10.5px] text-muted"
                  >
                    {i + 1}
                  </span>
                  <h2 className="text-[17px] font-semibold">{step.title}</h2>
                  <p className="mt-1.5 text-[14.5px] leading-[1.55] text-page-ink2">{step.text}</p>
                  <a
                    href={`#part-${step.parts[0]}`}
                    className="mt-2 inline-block font-mono text-[10.5px] tracking-[.1em] text-you"
                  >
                    {count} CHANGES ↓
                  </a>
                </li>
              );
            })}
          </ol>
        </section>

        <section aria-label="Every change" className="mt-14 lg:mt-0">
          <div data-a className="mb-1 font-mono text-[10.5px] tracking-[.1em] text-muted">
            EVERY CHANGE, PART BY PART
          </div>
          {log.parts.map((part) => (
            <Changes key={part.key} part={part} />
          ))}
        </section>
      </div>
    </main>
  );
}
