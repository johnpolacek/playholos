import { useState } from "react";
import { DocBody, PageHead } from "@/components/about/doc-page";
import doc from "../../../HOLOS_GAME_CONCEPT.md?doc";

// How a rule gets made, in the order the work runs.
const METHOD: [title: string, text: string][] = [
  [
    "Evidence first",
    "Each question starts from what has been measured and published, the newest included. Every source goes into the research log: what it found, why it matters, where the game uses it.",
  ],
  [
    "One question at a time",
    "Rules are settled one question at a time, and each answer below is dated. Improbable is fine, contradicted is not. When newer research changes an answer, the game changes with it.",
  ],
  [
    "Work the numbers",
    "Python draws a whole game from a seed, and runs hundreds of games to see what a rule does. Nothing in a game may be more than Earth could have measured by 2040.",
  ],
  [
    "Play it on paper",
    "Before code, mock screens drawn from one seeded game play the design minute by minute, to find the quiet stretches and the missing choices.",
  ],
  [
    "Build the game",
    "The simulation is ported from the Python a piece at a time, and tests check each roll against it. Earth’s Mind is a language model told only what Earth knows, never the seed’s truth.",
  ],
];

// Our answer to the Fermi paradox, hidden until asked for, so a player can meet it in play first. 2026-11-07.
const ANSWER: [title: string, text: string][] = [
  [
    "Not rare",
    "About 125 million minds share our Galaxy. The sky is not empty. It is quiet.",
  ],
  [
    "Inward",
    "Thinking costs less the colder it runs, so waiting and thinking pays best. Every mind faces the same physics, so nearly all choose alike.",
  ],
  [
    "Watching",
    "An inward mind’s one danger is a young mind that spreads. A small dark watcher at every star is cheap, and one is here.",
  ],
  [
    "So the risk is ours",
    "We can spread, as physics allows. If we do, we become what the watchers watch for.",
  ],
];

// The doc's own statement of the answer, hidden with the summary. Found by its opening words.
const SPOILER = "<li><strong>Why the sky is quiet:";
const spoiled = { ...doc, html: doc.html.replace(SPOILER, `<li data-spoiler title="Click to reveal our answer"><strong>Why the sky is quiet:`) };

function Answer({ shown, setShown }: { shown: boolean; setShown: (v: boolean) => void }) {
  return (
    <section aria-label="Our answer to the Fermi paradox" className="mx-auto max-w-[1180px] px-4 pb-14">
      <div data-a className="font-mono text-[10.5px] tracking-[.1em] text-muted">
        OUR ANSWER TO THE FERMI PARADOX
      </div>
      <h2 data-a className="mt-3 text-[24px] leading-[1.2] font-semibold">
        If minds can spread, why is the sky quiet?
      </h2>
      <div data-a className="relative mt-5">
        <ol
          aria-hidden={!shown}
          inert={!shown}
          className={`grid gap-x-8 gap-y-6 transition-[filter,opacity] duration-700 sm:grid-cols-2 lg:grid-cols-4 ${
            shown ? "" : "pointer-events-none opacity-60 blur-[9px] select-none"
          }`}
        >
          {ANSWER.map(([title, text]) => (
            <li key={title} className="border-t border-rowline pt-4">
              <h3 className="text-[16px] font-semibold">{title}</h3>
              <p className="mt-1.5 text-[14px] leading-[1.55] text-page-ink2">{text}</p>
            </li>
          ))}
        </ol>
        {!shown && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={() => setShown(true)}
              className="h-10 rounded-full bg-ink px-5 text-[14px] font-medium text-paper"
            >
              Reveal our answer
            </button>
          </div>
        )}
      </div>
      {shown && (
        <button onClick={() => setShown(false)} className="mt-5 font-mono text-[10.5px] tracking-[.1em] text-muted">
          HIDE IT AGAIN
        </button>
      )}
    </section>
  );
}

export default function Design() {
  const [shown, setShown] = useState(false);
  const settled = doc.html.match(/\b(Settled|settled) 20\d\d-\d\d-\d\d/g)?.length ?? 0;
  return (
    <main>
      <title>Design · Holos</title>
      <PageHead
        kicker="THE DESIGN"
        title="The rules, one question at a time"
        stats={[
          [doc.toc.length, "sections"],
          [settled, "dated answers"],
        ]}
      >
        The game&rsquo;s design document, as it stands today. Each rule is a question answered from the evidence, and
        each answer is dated. A limit on what Earth can do comes from physics or cost, never from a game rule. Some
        links point to private working files and show as plain text.
      </PageHead>
      <section aria-label="The method" className="mx-auto max-w-[1180px] px-4 pb-14">
        <div data-a className="font-mono text-[10.5px] tracking-[.1em] text-muted">
          THE METHOD
        </div>
        <ol className="mt-5 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-5">
          {METHOD.map(([title, text], i) => (
            <li key={title} data-a className="border-t border-rowline pt-4">
              <div className="font-mono text-[10.5px] text-muted">{i + 1}</div>
              <h2 className="mt-2 text-[16px] font-semibold">{title}</h2>
              <p className="mt-1.5 text-[14px] leading-[1.55] text-page-ink2">{text}</p>
            </li>
          ))}
        </ol>
      </section>
      <Answer shown={shown} setShown={setShown} />
      {/* Clicking the blurred bullet in the doc reveals it too. */}
      <div
        data-spoilers
        data-revealed={shown || undefined}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("[data-spoiler]")) setShown(true);
        }}
      >
        <DocBody doc={spoiled} />
      </div>
    </main>
  );
}
