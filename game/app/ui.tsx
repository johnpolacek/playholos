import { useState } from "react";
import { Link } from "react-router";
import { BackBar } from "@/components/back-bar";
import { Check, Cross, Dials, Globe, KeyMark, Lens, Prompt } from "@/components/icons";
import { BuildMark, buildBlue, buildTone, LeadMark, LockMark } from "@/components/marks";
import { MindNote } from "@/components/mind-note";
import { Thread } from "@/components/review";
import { Face, ListHead, TabHead } from "@/components/tab-head";
import { VisitArt } from "@/components/visit-art";
import { type Art, WINDOWS } from "@/lib/game/leads";
import { BUILDS } from "@/lib/game/plan";

// The game's kit, laid out as SPEC-01/HARDWARE lays out its own (spec-01.vercel.app): a bar of accents and sections
// over a grid of numbered cards, each one part drawn live. A first pass, 2026-11-14, from the parts /design already
// draws. It grows a card at a time.

// The accents a card's number can take: our blue, theirs, and what each build does.
const ACCENTS = ["you", "other", "think", "see", "lift", "reach", "keep"] as const;

const STOPS = ["How we reach", "Voyager 1", "Send a sail", "Send a flyby probe", "More roads"].map((name) => ({ name }));

const LEADS: Art[] = [
  { kind: "orbit", a: 1, e: 0 },
  { kind: "orbit", a: 1.35, e: 0.45 },
  { kind: "reply", windows: WINDOWS },
  { kind: "dark", mass: 9.6, ly: 1560 },
  { kind: "glow", ly: 30 },
  { kind: "seed", sight: "seas" },
];

const SIGHTS = ["bare", "seas", "green", "ice"] as const;

/** One part: its number and name on a ruled line, and it drawn below. `span` widens it across the grid. */
function Card({ n, name, span = 1, children }: { n: number; name: string; span?: 1 | 2; children: React.ReactNode }) {
  return (
    <section className={`flex min-h-[156px] flex-col rounded-2xl border border-rowline bg-panel p-3.5 ${span === 2 ? "sm:col-span-2" : ""}`}>
      <header className="flex items-center gap-2 font-mono text-[10px] tracking-[.1em] uppercase">
        <span className="text-[var(--accent)]">{String(n).padStart(2, "0")}</span>
        <span className="text-muted">{name}</span>
        <span className="h-px flex-1 bg-rowline" />
      </header>
      <div className="flex flex-1 items-center justify-center py-4">{children}</div>
    </section>
  );
}

export default function Kit() {
  const [accent, setAccent] = useState<(typeof ACCENTS)[number]>("you");
  const [at, setAt] = useState(2);
  const [closer, setCloser] = useState(true);
  return (
    <div style={{ "--accent": `var(--${accent})` } as React.CSSProperties} className="min-h-dvh bg-page text-ink">
      <nav className="sticky top-2 z-10 mx-auto flex max-w-5xl items-center justify-between gap-4 rounded-2xl border border-rowline bg-paper/90 px-4 py-2.5 backdrop-blur max-sm:mx-4">
        <div className="flex gap-1.5" role="radiogroup" aria-label="Accent">
          {ACCENTS.map((a) => (
            <button
              key={a}
              role="radio"
              aria-checked={a === accent}
              aria-label={a}
              onClick={() => setAccent(a)}
              className={`size-4 rounded-full ${a === accent ? "ring-2 ring-ink/70 ring-offset-2 ring-offset-paper" : ""}`}
              style={{ background: `var(--${a})` }}
            />
          ))}
        </div>
        <div className="flex gap-4 font-mono text-[10px] tracking-[.08em] uppercase">
          <span className="flex items-center gap-1.5 text-ink">
            <i className="size-1.5 rounded-full bg-[var(--accent)]" />
            Components
          </span>
          <Link to="/design" className="flex items-center gap-1.5 text-muted hover:text-ink">
            <i className="size-1.5 rounded-full bg-faint" />
            Design
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-[52rem] px-4 pt-14 pb-24">
        <h1 className="font-mono text-[clamp(34px,7vw,56px)] leading-none font-light tracking-[-.02em]">HOLOS/UI</h1>
        <p className="mt-4 max-w-[46ch] font-mono text-[12.5px] leading-relaxed text-page-ink2">
          The game’s kit. Every part here is drawn live from the game’s own code. Start a screen from these, not a copy of them.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <Card n={1} name="Button" span={2}>
            <div className="flex w-full max-w-72 flex-col gap-2.5">
              <button className="h-[46px] rounded-full bg-button text-[15px] font-medium text-paper">Add to Queue</button>
              <button className="h-[46px] rounded-full border border-ink text-[15px] font-medium">Ask the Mind about it</button>
            </div>
          </Card>
          <Card n={2} name="Row button">
            <div className="flex flex-col items-center gap-2">
              <button className="h-8 rounded-full bg-button px-3.5 text-[13px] font-medium text-paper">Feed It</button>
              <button className="h-8 rounded-full border border-faint px-3.5 text-[13px] font-medium text-muted">Sent, to hide</button>
            </div>
          </Card>
          <Card n={3} name="Map pill">
            <button
              onClick={() => setCloser(!closer)}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-faint bg-paper pr-3 pl-2.5 text-xs"
            >
              <Lens closer={closer} />
              {closer ? "Close View" : "Pull Back"}
            </button>
          </Card>

          <Card n={4} name="Back bar" span={2}>
            <div className="flex w-full flex-col gap-3">
              <BackBar to="/ui" label="All builds" />
              <BackBar to="/ui" label="More roads" stops={{ n: 5, at: 4 }} />
            </div>
          </Card>
          <Card n={5} name="Thread" span={2}>
            <div className="w-full">
              <Thread stops={STOPS} at={at} go={setAt} />
            </div>
          </Card>

          <Card n={6} name="Tab head" span={2}>
            <div className="w-full">
              <TabHead title="BUILD" walk={{ to: "/ui", label: "Explore" }} />
            </div>
          </Card>
          <Card n={7} name="List row" span={2}>
            <div className="w-full">
              <ListHead left="Ways to engage · 2" right="Passes" />
              <ul className="mt-1">
                {["Laser Sail Array", "Probe Yard"].map((b, i) => (
                  <li key={b} style={buildBlue(b)} className="border-t border-faint py-2.5">
                    <Face
                      mark={<BuildMark name={b} />}
                      tone={buildTone(b)}
                      name={<b className="font-semibold">{["Send a sail", "Send a flyby probe"][i]}</b>}
                      line={["A fifth of light’s speed.", "A tenth of light’s speed."][i]}
                      right={["Year 33.2", "Year 52.8"][i]}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <Card n={8} name="Mind note" span={2}>
            <MindNote className="text-[14.5px] leading-snug">
              A flyby is past a world in minutes. To stay, a craft must slow, and that takes a fusion drive no one has flown yet.
            </MindNote>
          </Card>
          <Card n={9} name="Icons" span={2}>
            <div className="flex flex-wrap justify-center gap-5 text-ink">
              <Lens closer />
              <Lens closer={false} />
              <Globe />
              <Dials />
              <Check />
              <Cross />
              <KeyMark />
              <Prompt />
            </div>
          </Card>

          <Card n={10} name="Build marks" span={2}>
            <div className="flex flex-wrap justify-center gap-4">
              {BUILDS.map((b) => (
                <span key={b.name} title={b.name} className={buildTone(b.name)}>
                  <BuildMark name={b.name} size={24} />
                </span>
              ))}
            </div>
          </Card>
          <Card n={11} name="Lead marks" span={2}>
            <div className="flex flex-wrap justify-center gap-4">
              {LEADS.map((art, i) => (
                <span key={i} className={art.kind === "reply" ? "text-other" : "text-you"}>
                  <LeadMark art={art} size={24} />
                </span>
              ))}
              <span className="text-muted">
                <LockMark size={24} />
              </span>
            </div>
          </Card>

          <Card n={12} name="Visit art" span={2}>
            <div className="flex flex-wrap justify-center gap-3">
              {SIGHTS.map((s) => (
                <VisitArt key={s} sight={s} size={64} />
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
