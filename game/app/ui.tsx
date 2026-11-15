import { Button } from "@ui-sdk/react/button";
import { useState } from "react";
import { BackBar } from "@/components/back-bar";
import { Meter } from "@/components/hud";
import { Check, Cross, Dials, Globe, KeyMark, Lens, Prompt } from "@/components/icons";
import { BuildMark, buildBlue, buildColor, buildTone, LeadMark, LockMark } from "@/components/marks";
import { MindNote } from "@/components/mind-note";
import { RailTab } from "@/components/rail";
import { RunLocal } from "@/components/run-local";
import { Thread } from "@/components/review";
import { Sources } from "@/components/sources";
import { Face, ListHead, TabHead } from "@/components/tab-head";
import { Tip } from "@/components/tip";
import { VisitArt } from "@/components/visit-art";
import { type Art, WINDOWS } from "@/lib/game/leads";
import { BUILDS, SWITCHED } from "@/lib/game/plan";
import { MIND_SOURCES } from "@/lib/game/sources";
import { CATALOG } from "@/lib/sim/works";
import { Btn, MapPill } from "@/components/kit/button";
import { Choice } from "@/components/kit/choice";
import { Range } from "@/components/kit/range";
import { COUNT, StepsTo } from "@/components/begin";
import { ADD, CatalogRow } from "@/components/catalog";
import { IDEAS } from "@/components/guide";
import { JumpPill } from "@/components/hud";
import { Chips } from "@/components/kit/chips";
import { Fold } from "@/components/kit/fold";
import { Pick } from "@/components/kit/pick";
import { AskBox, Hello, KeyRow, Ours, SettingsCard } from "@/components/mind-chat";
import { CallCard } from "@/components/send-card";
import { KindTag } from "@/components/marks";
import { MIND_MODELS, type MindModel } from "@/lib/access";
import type { Draft } from "@/lib/game/sends";

// The game's kit, laid out as SPEC-01/HARDWARE lays out its own (spec-01.vercel.app): a bar of accents and sections
// over a grid of numbered cards, each one part drawn live. A first pass, 2026-11-14. Since 2026-11-15, every card draws
// the game's own part, never a copy of its markup, grouped by kind, and the views beside it compose them. The bar over it is app/kit-layout.tsx, which sets the cards' --accent.

const STOPS = ["How we reach", "Voyager 1", "Send a sail", "Send a flyby probe", "More roads"].map((name) => ({ name }));

const LEADS: Art[] = [
  { kind: "orbit", a: 1, e: 0 },
  { kind: "orbit", a: 1.35, e: 0.45 },
  { kind: "reply", windows: WINDOWS },
  { kind: "dark", mass: 9.6, ly: 1560 },
  { kind: "glow", ly: 30 },
  { kind: "seed", sight: "seas" },
];

const LENSES = [
  { value: "all", label: "All" },
  { value: "minds", label: "Minds" },
  { value: "homes", label: "Homes" },
];
const FAR = [
  { value: "near", label: "The stars near us" },
  { value: "galaxy", label: "The Galaxy" },
];
// The Interceptor's two sides, in its own color, as its page draws them.
const STAND = [
  { value: "on", label: SWITCHED.Interceptor.on, on: "bg-(--c) text-paper" },
  { value: "off", label: SWITCHED.Interceptor.off },
];

const SIGHTS = ["bare", "seas", "green", "ice"] as const;

// The nearest stars, with their distances, as the research page's picker lists them.
const STARS = [
  ["Proxima Centauri", 4.24],
  ["Barnard’s Star", 5.96],
  ["Wolf 359", 7.86],
  ["Lalande 21185", 8.31],
  ["Sirius A", 8.6],
].map(([name, d]) => ({ value: String(name), label: `${name}, ${d} ly` }));

const QUIET = [
  { name: "Ross 128", art: LEADS[0], line: "Warm world, nothing heard.", right: "11.0 ly" },
  { name: "Tau Ceti", art: LEADS[1], line: "Dusty, and quiet so far.", right: "11.9 ly" },
  { name: "Gliese 1061", art: LEADS[4], line: "A glow we could not range yet.", right: "12.0 ly" },
];

const MODELS = (Object.keys(MIND_MODELS) as MindModel[]).map((m) => ({ value: m, label: MIND_MODELS[m].name }));

const CALL: Draft = {
  to: "everywhere",
  travels: "We are here, round a yellow star. We count, we draw, and we listen.",
  holds: ["words", "pictures"],
  size: "page",
};

/** One part: its number and name on a ruled line, and it drawn below. Three to a row on a wide screen, since
 *  2026-11-15, each as wide as a phone's column, so a part shows at the width the game draws it. */
function Card({ n, name, children }: { n: number; name: string; children: React.ReactNode }) {
  return (
    <section className="hw-panel flex min-h-[156px] flex-col rounded-2xl border border-rowline bg-panel p-3.5 instrument:rounded-lg">
      <header className="engrave flex items-center gap-2 font-mono text-[10px] tracking-[.1em] uppercase">
        <span className="text-[var(--accent)]">{String(n).padStart(2, "0")}</span>
        <span className="text-muted">{name}</span>
        <span className="h-px flex-1 bg-rowline" />
      </header>
      <div className="flex flex-1 items-center justify-center py-4">{children}</div>
    </section>
  );
}

export default function Kit() {
  const [at, setAt] = useState(2);
  const [closer, setCloser] = useState(true);
  const [lens, setLens] = useState("all");
  const [far, setFar] = useState("near");
  const [stand, setStand] = useState("on");
  const [dial, setDial] = useState(20);
  const [cold, setCold] = useState(30);
  const [idea, setIdea] = useState("idle");
  const [star, setStar] = useState(STARS[0].value);
  const [quiet, setQuiet] = useState(false);
  const [model, setModel] = useState<string>("claude-sonnet-5-5");
  const [effort, setEffort] = useState("medium");
  return (
    <>
      <main className="mx-auto max-w-6xl px-4 pt-14 pb-24">
        <h1 className="font-mono text-[clamp(34px,7vw,56px)] leading-none font-light tracking-[-.02em]">HOLOS/UI</h1>
        <p className="mt-4 max-w-[46ch] font-mono text-[12.5px] leading-relaxed text-page-ink2">
          The game’s kit. Every part here is drawn live from the game’s own code. Start a screen from these, not a copy of them.
        </p>

        <h2 className="mt-10 mb-3 engrave font-mono text-[10.5px] tracking-[.14em] text-muted">CONTROLS</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Card n={1} name="Button">
            <div className="flex w-full max-w-72 flex-col gap-2.5">
              <Btn size="page">Add to Queue</Btn>
              <Btn size="page" fill="line">Ask the Mind about it</Btn>
            </div>
          </Card>
          <Card n={2} name="Row button">
            <div className="flex flex-col items-center gap-2">
              <Btn>Feed It</Btn>
              <Btn fill="faint" className="text-muted">
                Sent, to hide
              </Btn>
            </div>
          </Card>
          <Card n={3} name="Map pill">
<MapPill onClick={() => setCloser(!closer)}>
              <Lens closer={closer} />
              {closer ? "Close View" : "Pull Back"}
            </MapPill>
          </Card>
          <Card n={4} name="Choice">
            <div className="flex flex-col items-center gap-3">
              <Choice look="lens" label="What we look for" value={lens} onChange={setLens} options={LENSES} />
              <Choice label="How far" value={far} onChange={setFar} options={FAR} />
              <div style={{ "--c": buildColor("Interceptor") } as React.CSSProperties} className="w-64">
                <Choice look="switch" label="How the Interceptor stands" value={stand} onChange={setStand} options={STAND} />
              </div>
            </div>
          </Card>
          <Card n={5} name="Chips">
            <Chips
              head="IDEAS MET · 4 OF 9"
              label="Ideas met"
              value={idea}
              onChange={setIdea}
              options={(["intro", "more", "idle", "share"] as const).map((k) => ({ value: k, label: IDEAS[k] }))}
            />
          </Card>
          <Card n={6} name="Range">
            <div className="flex w-full max-w-80 flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="flex justify-between font-mono text-[10px] tracking-[.1em] text-muted">
                  READABLE TO <b className="text-[12px] font-normal text-ink">{dial} ly</b>
                </span>
                <Range label="Readable to" min={5} max={50} value={dial} onChange={setDial} valueText={(v) => `${v} light-years`} />
              </label>
              <Range label="How cold it runs" tone="var(--other)" reverse value={cold} onChange={setCold} />
            </div>
          </Card>
          <Card n={7} name="Knob">
            {/* Range as a knob, where a dial is one of a bank. A knob under Instrument, and a line in chalk. */}
            <div className="flex w-full max-w-80 items-center gap-4 instrument:w-auto">
              <Range knob label="Readable to" min={5} max={50} value={dial} onChange={setDial} valueText={(v) => `${v} light-years`} marks={[{ at: 20 }]} className="w-full instrument:w-14" />
              <Range knob label="How cold it runs" tone="var(--other)" reverse value={cold} onChange={setCold} className="w-full instrument:w-14" />
            </div>
          </Card>
          <Card n={8} name="Select">
            <Pick label="OR CHOOSE" labelClass="font-mono text-[10px] tracking-[.1em] text-muted" value={star} onChange={setStar} options={STARS} />
          </Card>
          <Card n={9} name="Fold">
            <div className="w-full">
              <Fold label={`Quiet · ${QUIET.length}`} open={quiet} onOpenChange={setQuiet} shut="Nothing for us to do at these yet." className="mt-0">
                {QUIET.map((l) => (
                  <li key={l.name} className="border-t border-faint py-2.5">
                    <Face mark={<LeadMark art={l.art} />} tone="text-you" name={<b className="font-semibold">{l.name}</b>} line={l.line} right={l.right} more={false} />
                  </li>
                ))}
              </Fold>
            </div>
          </Card>
          <Card n={10} name="Tooltip">
            <Tip
              toggleable
              text="Nothing new comes in the next 100,000 Years unless we order it. The clock runs on."
              trigger={<Button type="button" className="text-[13px] text-muted">Nothing ahead</Button>}
            />
          </Card>
        </div>
        <h2 className="mt-10 mb-3 engrave font-mono text-[10.5px] tracking-[.14em] text-muted">SHEETS</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Card n={11} name="Dialog">
            <div className="flex items-center gap-2 font-mono text-[10.5px] tracking-[.08em] text-muted uppercase">
              The real record
              <Sources sources={MIND_SOURCES} />
            </div>
          </Card>
          <Card n={12} name="Sheet">
            <RunLocal className="inline-flex h-8 items-center gap-1.5 rounded-full border border-faint bg-paper px-3.5 text-[13px]">
              Run locally
              <span className="text-muted">↓</span>
            </RunLocal>
          </Card>
        </div>
        <h2 className="mt-10 mb-3 engrave font-mono text-[10.5px] tracking-[.14em] text-muted">ROWS AND HEADS</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Card n={13} name="Back bar">
            <div className="flex w-full flex-col gap-3">
              <BackBar to="/ui" label="All builds" />
              <BackBar to="/ui" label="More roads" stops={{ n: 5, at: 4 }} />
            </div>
          </Card>
          <Card n={14} name="Thread">
            <div className="w-full">
              <Thread stops={STOPS} at={at} go={setAt} />
            </div>
          </Card>
          <Card n={15} name="Tab head">
            <div className="w-full">
              <TabHead title="BUILD" walk={{ to: "/ui", label: "Explore" }} />
            </div>
          </Card>
          <Card n={16} name="List row">
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
          <Card n={17} name="Catalog row">
            <ul className="w-full">
              <CatalogRow
                name="All-Sky Watch"
                tags={<KindTag name="All-Sky Watch" className="ml-2 align-[2px]" />}
                line={BUILDS.find((b) => b.name === "All-Sky Watch")?.what}
                right="21m"
                action={<Button className={ADD}>Add to Queue</Button>}
              />
            </ul>
          </Card>
        </div>
        <h2 className="mt-10 mb-3 engrave font-mono text-[10.5px] tracking-[.14em] text-muted">THE MIND</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Card n={18} name="Mind note">
            <MindNote className="text-[14.5px] leading-snug">
              A flyby is past a world in minutes. To stay, a craft must slow, and that takes a fusion drive no one has flown yet.
            </MindNote>
          </Card>
          <Card n={19} name="Talk">
            <div className="flex w-full flex-col gap-2">
              <Ours>Are we alone?</Ours>
              <MindNote className="max-w-[86%] self-start text-[15px] leading-[1.5]">
                We can’t say yet. We have heard nothing we cannot explain.
              </MindNote>
            </div>
          </Card>
          <Card n={20} name="Starters">
            <div className="w-full">
              <Hello onAsk={() => {}} />
            </div>
          </Card>
          <Card n={21} name="Settings">
            <div className="w-full">
              <SettingsCard
                models={MODELS}
                model={model}
                onModel={setModel}
                effort={effort}
                onEffort={setEffort}
                spent="4,812 tokens, $0.031"
                keyRow={<KeyRow onClear={() => {}} />}
              />
            </div>
          </Card>
          <Card n={22} name="Ask">
            <div className="w-full">
              <AskBox busy={false} onAsk={() => {}} />
            </div>
          </Card>
          <Card n={23} name="Call card">
            <div className="w-full">
              <CallCard draft={CALL} canCall onSend={() => {}} onStop={() => {}} />
            </div>
          </Card>
        </div>
        <h2 className="mt-10 mb-3 engrave font-mono text-[10.5px] tracking-[.14em] text-muted">THE TOP BAR</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Card n={24} name="Meter">
            {/* The top bar at Year 0: our thinking draws about a hundredth of Earth's grid, and nothing is yet in orbit. */}
            <div className="grid w-full grid-cols-3 gap-2.5">
              <Meter label="ENERGY" at={0.01} value="1%" sub="of the grid" />
              <Meter label="MATTER" value="0 kt" sub="in orbit" />
              <Meter label="DEUTERIUM" at={0} value="0 kt" sub="Works not done" late />
            </div>
          </Card>
          <Card n={25} name="Begin count">
            <Button className={COUNT}>
              <StepsTo done={[true, true, false, false]} next="How we reach" />
            </Button>
          </Card>
          <Card n={26} name="Jump">
            <JumpPill why="a probe’s word home" onJump={() => {}} />
          </Card>
          <Card n={27} name="Tabs">
            <nav aria-label="Tabs" className="grid h-16 w-full grid-cols-4 rounded-xl border border-faint bg-paper">
              <RailTab to="/ui" label="Scan" on={false} calls={2} />
              <RailTab to="/ui" label="Build" on />
              <RailTab to="/ui" label="Reach" on={false} />
              <RailTab to="/ui" label="Mind" on={false} dot />
            </nav>
          </Card>
          <Card n={28} name="Readout">
            <div className="flex flex-col items-end gap-1">
              <span className="text-[15px] font-medium">Year 0.00</span>
              <span className="font-mono text-[11px] text-muted tabular-nums">+{Math.round(CATALOG.deuterium.perYear)} kt a Year</span>
            </div>
          </Card>
        </div>
        <h2 className="mt-10 mb-3 engrave font-mono text-[10.5px] tracking-[.14em] text-muted">MARKS</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Card n={29} name="Icons">
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
          <Card n={30} name="Build marks">
            <div className="flex flex-wrap justify-center gap-4">
              {BUILDS.map((b) => (
                <span key={b.name} title={b.name} className={buildTone(b.name)}>
                  <BuildMark name={b.name} size={24} />
                </span>
              ))}
            </div>
          </Card>
          <Card n={31} name="Lead marks">
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
          <Card n={32} name="Visit art">
            <div className="flex flex-wrap justify-center gap-3">
              {SIGHTS.map((s) => (
                <VisitArt key={s} sight={s} size={64} />
              ))}
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}
