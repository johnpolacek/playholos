import { useState } from "react";
import { BackBar } from "@/components/back-bar";
import { Check, Cross, Dials, Globe, KeyMark, Lens, Prompt } from "@/components/icons";
import { BuildMark, buildBlue, buildTone, LeadMark, LockMark } from "@/components/marks";
import { MindNote } from "@/components/mind-note";
import { WalkHead } from "@/components/reach-tour";
import { Thread } from "@/components/review";
import { Face, ListHead, TabHead } from "@/components/tab-head";
import { VisitArt } from "@/components/visit-art";
import type { Art } from "@/lib/game/leads";
import { BUILDS, LATER } from "@/lib/game/plan";

// The game's parts, in one place: its colors, its type, and each shared piece drawn live, with the file it lives in
// and when to reach for it. Built 2026-10-28, so a new screen starts from what we have, not a copy of it. When a part
// is shared by two screens or more, it belongs here, and in game/README.md's Shared UI.

const COLORS: { name: string; v: string; use: string }[] = [
  { name: "page", v: "#0b0c0d", use: "Behind everything." },
  { name: "paper", v: "#121314", use: "Pills and cards on the map, and text on a light button." },
  { name: "panel", v: "#17181a", use: "The tab page." },
  { name: "rowline", v: "#26282b", use: "Lines between list rows." },
  { name: "frame", v: "#2a2b2e", use: "Frames and quiet borders." },
  { name: "track", v: "#2a2b2e", use: "A thread’s or a bar’s empty track." },
  { name: "faint", v: "#34363a", use: "Borders, the rail’s top, unlit parts." },
  { name: "muted", v: "#9c988f", use: "Mono labels and counts." },
  { name: "page-ink2", v: "#a9a59c", use: "A row’s line, a page’s subtitle." },
  { name: "fill2", v: "#bdb9af", use: "Belts and fills in the art." },
  { name: "ink", v: "#e6e3db", use: "Words, and the primary button." },
  { name: "you", v: "#5bb8d6", use: "Us: our Mind, our messages, what is ours. Listening builds." },
  { name: "other", v: "#e0a24a", use: "Them: another mind, a signal, what is not ours." },
  { name: "ok", v: "#70d1a9", use: "A thing set and working, as a key." },
];

// What each build does, from explorations/accent-palette.html, B.
const DOES: { name: string; does: string; v: string }[] = [
  { name: "you", does: "Listen", v: "#5bb8d6" },
  { name: "think", does: "Think", v: "#b39ef2" },
  { name: "see", does: "See", v: "#70d1a9" },
  { name: "lift", does: "Lift", v: "#c2d766" },
  { name: "reach", does: "Reach", v: "#e48ebf" },
  { name: "keep", does: "Keep", v: "#c1ccd7" },
];

const TYPE: { cls: string; spec: string; use: string; text: string }[] = [
  { cls: "text-[19px] leading-snug font-medium", spec: "SUSE 19 / 500", use: "A page’s title", text: "Fusion Drive" },
  { cls: "text-[15px] leading-snug", spec: "SUSE 15", use: "A row’s name", text: "Send a sail" },
  { cls: "text-[14.5px] leading-snug", spec: "SUSE 14.5", use: "The Mind’s words", text: "No one has flown one yet." },
  { cls: "text-[13.5px] leading-snug text-page-ink2", spec: "SUSE 13.5, ink2", use: "A row’s line, a subtitle", text: "A fifth of light’s speed." },
  { cls: "text-[11px] tracking-[.08em] text-muted", spec: "SUSE 11, tracked", use: "A tab’s head", text: "REACH · 4 OF 4" },
  { cls: "font-mono text-[10px] tracking-[.1em] text-muted uppercase", spec: "Plex Mono 10, tracked", use: "A list’s head, labels", text: "Ways to go · 5" },
  { cls: "font-mono text-[11px] text-muted tabular-nums", spec: "Plex Mono 11", use: "Counts and Years", text: "Year 22.4 · 1h 52m" },
];

const LEADS: { name: string; art: Art }[] = [
  { name: "A world felt", art: { kind: "orbit", a: 1, e: 0 } },
  { name: "A stretched orbit", art: { kind: "orbit", a: 1.35, e: 0.45 } },
  { name: "A reply", art: { kind: "reply", sent: [], ly: 12 } },
  { name: "A black hole", art: { kind: "dark", mass: 9.6, ly: 1560 } },
  { name: "A grey glow", art: { kind: "glow", ly: 30 } },
  { name: "A seed’s star", art: { kind: "seed", sight: "seas" } },
];

const SIGHTS = ["bare", "seas", "green", "ice", "haze", "cities", "dark", "rocks"] as const;
const STOPS = ["How we reach", "Voyager 1", "Send a sail", "Send a flyby probe", "Roads to come"].map((name) => ({ name }));

/** One part: its name, its file, when to use it, and it drawn. */
function Part({ name, file, use, children }: { name: string; file: string; use: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-rowline py-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-[15px] font-semibold">{name}</h3>
        <code className="font-mono text-[11px] text-muted">{file}</code>
      </div>
      <p className="mt-1 max-w-[62ch] text-[13.5px] leading-snug text-page-ink2">{use}</p>
      <div className="mt-4 rounded-2xl border border-rowline bg-panel p-4">{children}</div>
    </section>
  );
}

function Head({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <h2 id={id} className="mt-14 mb-2 font-mono text-[11px] tracking-[.12em] text-muted uppercase">
      {children}
    </h2>
  );
}

export default function Design() {
  const [at, setAt] = useState(2);
  const [walk, setWalk] = useState(4);
  const [closer, setCloser] = useState(true);
  return (
    <main className="mx-auto max-w-4xl px-4 pt-10 pb-24 text-ink">
      <p className="font-mono text-[11px] tracking-[.12em] text-you">HOLOS · DESIGN</p>
      <h1 className="mt-2 text-[26px] leading-tight font-semibold">The game’s parts</h1>
      <p className="mt-2 max-w-[62ch] text-[14.5px] leading-snug text-page-ink2">
        Colors, type, and every piece two screens or more share, drawn live from the game’s own code. Start a new screen from these,
        not a copy of them. The game is always dark.
      </p>
      <nav className="mt-5 flex flex-wrap gap-2 font-mono text-[11px] tracking-[.06em]">
        {["Colors", "Type", "Buttons", "Navigation", "Lists", "The Mind", "Marks", "Art"].map((s) => (
          <a key={s} href={`#${s.toLowerCase().replace(" ", "-")}`} className="rounded-full border border-faint px-3 py-1 text-muted hover:text-ink">
            {s.toUpperCase()}
          </a>
        ))}
      </nav>

      <Head id="colors">Colors · app/globals.css</Head>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {COLORS.map((c) => (
          <div key={c.name} className="overflow-hidden rounded-xl border border-rowline">
            <div className="h-16" style={{ background: `var(--${c.name})` }} />
            <div className="bg-panel p-2.5">
              <div className="flex justify-between font-mono text-[11px]">
                <span>--{c.name}</span>
                <span className="text-muted">{c.v}</span>
              </div>
              <p className="mt-1 text-[12px] leading-snug text-page-ink2">{c.use}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 mb-2 text-[13.5px] text-page-ink2">What each build does. A build’s mark and its lines take its color.</p>
      <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
        {DOES.map((c) => (
          <div key={c.name} className="rounded-xl border border-rowline bg-panel p-2.5">
            <div className="h-8 rounded-md" style={{ background: c.v }} />
            <div className="mt-2 text-[13px]">{c.does}</div>
            <div className="font-mono text-[10.5px] text-muted">--{c.name}</div>
          </div>
        ))}
      </div>

      <Head id="type">Type · SUSE for words, IBM Plex Mono for labels and numbers</Head>
      <div className="rounded-2xl border border-rowline bg-panel">
        {TYPE.map((t) => (
          <div key={t.spec} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-rowline px-4 py-3 first:border-t-0">
            <span className={t.cls}>{t.text}</span>
            <span className="font-mono text-[10.5px] text-muted">
              {t.spec} · {t.use}
            </span>
          </div>
        ))}
      </div>

      <Head id="buttons">Buttons · class patterns, no component yet</Head>
      <Part
        name="Primary and outline"
        file="bg-ink text-paper · border border-ink"
        use="Rounded full. Primary, light on dark, for the one thing a page asks: Add to Queue, Send. Outline for the rest: Ask the Mind, Close View. 46px tall in a page’s column, 32px inside a row."
      >
        <div className="flex flex-col gap-2.5">
          <button className="h-[46px] rounded-full bg-ink text-[15px] font-medium text-paper">Add to Queue</button>
          <button className="h-[46px] rounded-full border border-ink text-[15px] font-medium">Ask the Mind about it</button>
          <div className="flex gap-2">
            <button className="h-8 rounded-full bg-ink px-3.5 text-[13px] font-medium text-paper">Feed It</button>
            <button className="h-8 rounded-full border border-faint px-3.5 text-[13px] font-medium text-muted">Sent, to hide</button>
          </div>
        </div>
      </Part>
      <Part name="Map pill" file="components/map-strip.tsx" use="On the map, over the sky: a small pill on paper, with an icon. Close View, Pull Back, Back to Earth.">
        <div className="flex gap-1.5">
          <button onClick={() => setCloser(!closer)} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-faint bg-paper pr-3 pl-2.5 text-xs">
            <Lens closer={closer} />
            {closer ? "Close View" : "Pull Back"}
          </button>
          <button className="inline-flex h-8 items-center gap-1.5 rounded-full border border-faint bg-paper pr-3 pl-2.5 text-xs">
            <Globe />
            Back to Earth
          </button>
        </div>
      </Part>

      <Head id="navigation">Navigation</Head>
      <Part
        name="BackBar"
        file="components/back-bar.tsx"
        use="Every way back from a page to where it was opened. Never a pill. Opened from a walk, the walk’s stops sit at its end, the one it goes back to ringed."
      >
        <div className="flex flex-col gap-3">
          <BackBar to="/design" label="All builds" />
          <BackBar to="/design" label="Roads to come" stops={{ n: 5, at: 4 }} />
        </div>
      </Part>
      <Part name="TabHead" file="components/tab-head.tsx" use="The top line of a tab: its name, and on the right the walk through it and the ⓘ that opens its real record.">
        <TabHead title="BUILD" walk={{ to: "/design", label: "Explore" }} />
      </Part>
      <Part name="Thread" file="components/review.tsx" use="The stops of a walk: Scan’s review, Build’s tour, How we reach. Passed and current stops are lit. A stop is tapped to go to it.">
        <Thread stops={STOPS} at={at} go={setAt} />
      </Part>
      <Part name="WalkHead" file="components/reach-tour.tsx" use="A walk’s head, held at the top: where we are, back and on, close, and its Thread. A page opened from the walk keeps it.">
        <WalkHead at={walk} go={setWalk} back={() => setWalk(Math.max(0, walk - 1))} next={() => setWalk(Math.min(4, walk + 1))} onClose={() => setWalk(0)} />
      </Part>

      <Head id="lists">Lists</Head>
      <Part name="ListHead and Face" file="components/tab-head.tsx" use="Every list on Scan, Build and Reach. ListHead says what it holds and what its right column counts. Face is a row: its mark, name, line, count, and a › when it opens a page.">
        <ListHead left="Ways to go · 3" right="Passes" />
        <ul className="mt-1">
          {["Laser Sail Array", "Probe Yard", "Fusion Drive"].map((b, i) => (
            <li key={b} style={buildBlue(b)} className="border-t border-faint py-2.5">
              <Face
                mark={<BuildMark name={b} />}
                tone={buildTone(b, i < 2)}
                name={<b className="font-semibold">{["Send a sail", "Send a flyby probe", "A sentinel that stays"][i]}</b>}
                line={["A fifth of light’s speed.", "An eighth of light’s speed.", "Brakes on its fusion flame to stay."][i]}
                right={["Year 33.2", "Year 52.8", "Not yet"][i]}
              />
            </li>
          ))}
        </ul>
      </Part>

      <Head id="the-mind">The Mind</Head>
      <Part name="MindNote" file="components/mind-note.tsx" use="The Mind’s words on any page, set off by one corner with its mark and name. Always “we”, never “I”. The caller sets the words’ size.">
        <MindNote className="text-[14.5px] leading-snug">
          A flyby is past a world in minutes. To stay, a craft must slow, and that takes a fusion drive no one has flown yet.
        </MindNote>
      </Part>

      <Head id="marks">Marks · components/marks.tsx, icons.tsx</Head>
      <Part name="BuildMark" file="components/marks.tsx" use="Each build drawn, moving, in what it does’ color by buildTone. Dimmer until it is in our order. buildBlue gives a row the build’s color in place of our blue.">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3">
          {[...BUILDS, ...LATER].map((b) => (
            <div key={b.name} className="flex items-center gap-2.5 text-[13px]">
              <span className={buildTone(b.name)}>
                <BuildMark name={b.name} size={18} />
              </span>
              {b.name}
            </div>
          ))}
        </div>
      </Part>
      <Part name="LeadMark and LockMark" file="components/marks.tsx" use="A lead drawn as its page draws it. LockMark, still, for a way no build offers yet.">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-4">
          {LEADS.map((l) => (
            <div key={l.name} className="flex items-center gap-2.5 text-[13px]">
              <span className={l.art.kind === "reply" ? "text-other" : "text-you"}>
                <LeadMark art={l.art} size={18} />
              </span>
              {l.name}
            </div>
          ))}
          <div className="flex items-center gap-2.5 text-[13px] text-muted">
            <LockMark size={18} />
            Locked
          </div>
        </div>
      </Part>
      <Part name="Icons" file="components/icons.tsx" use="Small line icons for controls, at the size of the words beside them.">
        <div className="flex flex-wrap gap-5 text-[12px] text-page-ink2">
          {[
            ["Lens +", <Lens key="l" closer />],
            ["Lens −", <Lens key="m" closer={false} />],
            ["Globe", <Globe key="g" />],
            ["Dials", <Dials key="d" />],
            ["Check", <Check key="c" />],
            ["Cross", <Cross key="x" />],
            ["KeyMark", <KeyMark key="k" />],
            ["Prompt", <Prompt key="p" />],
          ].map(([n, icon]) => (
            <span key={n as string} className="flex items-center gap-1.5 text-ink">
              {icon}
              <span className="text-page-ink2">{n}</span>
            </span>
          ))}
        </div>
      </Part>

      <Head id="art">Art</Head>
      <Part name="VisitArt" file="components/visit-art.tsx" use="What our craft saw of a world up close, by its sight. On a lead’s page, a destination, and a reading.">
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {SIGHTS.map((s) => (
            <div key={s} className="flex flex-col items-center gap-1">
              <VisitArt sight={s} size={72} />
              <span className="font-mono text-[10px] text-muted">{s}</span>
            </div>
          ))}
        </div>
      </Part>
      <p className="mt-8 text-[13px] leading-snug text-page-ink2">
        Not drawn here, since each needs the game around it: <code className="font-mono text-[12px]">Spread</code> lays out the screens before
        the shell, <code className="font-mono text-[12px]">SkyArt</code> frames a screen’s subject in the one sky, and Reach’s road{" "}
        <code className="font-mono text-[12px]">Thread</code>, <code className="font-mono text-[12px]">Years</code> and{" "}
        <code className="font-mono text-[12px]">Key</code> draw a way to go on its Years.
      </p>
    </main>
  );
}
