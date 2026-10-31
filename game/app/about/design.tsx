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

export default function Design() {
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
      <DocBody doc={doc} />
    </main>
  );
}
