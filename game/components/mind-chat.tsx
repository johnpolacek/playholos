import { Chat, useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { useGame } from "@/components/game-provider";
import { BuildCard } from "@/components/build-card";
import { readingStands } from "@/components/close-reading";
import { Check, Cross } from "@/components/icons";
import { MindNote } from "@/components/mind-note";
import { MindThinking, useThinking } from "@/components/mind-thinking";
import { usePlan } from "@/components/picks";
import { useLeads } from "@/components/scan";
import { SendCard } from "@/components/send-card";
import { BAD_KEY, costOf, type Effort, EFFORTS, KEY_NEEDS_CREDIT, KEY_NEEDS_WORKSPACE, MIND_BUSY, MIND_MODELS, MIND_UNREACHED, type MindModel, readMindPick, type Usage } from "@/lib/access";
import { readBuildOffer } from "@/lib/game/build-offer";
import { type Lead, properGlows, starName } from "@/lib/game/leads";
import { leadsNamed, onMap } from "@/lib/game/named-leads";
import { buildNamed } from "@/lib/game/plan";
import { NEWS } from "@/lib/mind/news";
import { readOffer } from "@/lib/game/sends";
import { browserStore } from "@/lib/game/store";
import { forgetKey } from "@/lib/key";

// Which model the Mind thinks with and how hard, picked on the Mind tab and kept in this browser. Storage can be
// missing, so a miss means the defaults, and the server checks the pick again.
const PICK = "holos:mind-pick";
function loadPick() {
  try {
    return readMindPick(JSON.parse(localStorage.getItem(PICK) ?? "null"));
  } catch {
    return readMindPick(null);
  }
}
function savePick(pick: { model: MindModel; effort: Effort }) {
  try {
    localStorage.setItem(PICK, JSON.stringify(pick));
  } catch {}
}

// Each send carries the time of Begin, so the Mind knows the Year, the seed, so the server can work out what Earth
// knows, what the plan observes, so it knows what has landed, and what we have queued. The server never sends the
// seed's truth back.
const transport = new DefaultChatTransport({
  api: "/api/mind",
  body: async () => {
    const save = await browserStore.load();
    return {
      beganAt: save?.beganAt ?? null,
      seed: save?.seed ?? null,
      charter: save?.charter ?? null,
      observe: save?.plan?.observe ?? [],
      builds: save?.plan?.builds ?? [],
      later: save?.plan?.later ?? [],
      gifts: save?.plan?.gifts ?? [],
      lenses: save?.plan?.lenses ?? [],
      closeReads: save?.plan?.closeReads ?? [],
      sentinels: save?.plan?.sentinels ?? [],
      strikes: save?.plan?.strikes ?? [],
      flybys: save?.plan?.flybys ?? [],
      seeds: save?.plan?.seeds ?? [],
      colony: save?.plan?.colony ?? null,
      will: save?.will ?? null,
      stops: save?.plan?.stops ?? [],
      sent: save?.sent ?? [],
      pick: loadPick(),
    };
  },
});

// One talk with the Mind for each game, on whichever tab we ask from, picked up from the save after a reload. Before
// the save loads, the talk waits for its seed, so a question asked that early isn't dropped. A new game starts a new
// talk.
let talk: { seed?: number; chat: Chat<UIMessage> } | undefined;
function chatFor(seed?: number, kept?: UIMessage[]) {
  if (!talk || (talk.seed !== undefined && seed !== undefined && talk.seed !== seed))
    talk = { seed, chat: new Chat({ transport, messages: kept }) };
  else if (talk.seed === undefined && seed !== undefined && kept?.length && talk.chat.messages.length === 0)
    talk.chat.messages = kept;
  talk.seed ??= seed;
  return talk.chat;
}

/** Our talk with the Mind, as many places show it. */
function useMind() {
  const { save } = useGame();
  const seed = save?.seed;
  const kept = save?.talk;
  const chat = useMemo(() => chatFor(seed, kept), [seed, kept]);
  const helpers = useChat({ chat });
  const lastAnswer = helpers.messages.findLast((message) => message.role === "assistant")?.id;
  const busy = helpers.status === "submitted" || helpers.status === "streaming";
  return { ...helpers, busy, lastAnswer };
}

/** What to show for a failed answer: the server's words when they are ours, and a lost link as one. Every failure read
 *  "The Mind can’t answer right now." until 2026-11-03, so none said why. */
function failure(error: Error) {
  if (error instanceof TypeError) return MIND_UNREACHED;
  // A refusal before the Mind is asked, as when we ask too fast, comes as the server's JSON. 2026-11-03.
  const said = (() => {
    try {
      return (JSON.parse(error.message) as { error?: unknown }).error;
    } catch {
      return undefined;
    }
  })();
  if (typeof said === "string") return said;
  if ([BAD_KEY, KEY_NEEDS_WORKSPACE, KEY_NEEDS_CREDIT, MIND_BUSY].includes(error.message) || error.message.startsWith("The Mind can’t answer"))
    return error.message;
  return "The Mind can’t answer right now.";
}

/** A failure worth asking again once, on its own, a few seconds on. */
const RETRY_MS = 4000;
const retries = (error: Error) => [MIND_BUSY, MIND_UNREACHED].includes(failure(error));

/** Keeps our talk in the save, from one place always there, so news told on any tab is kept. An answer from the
 *  Mind, on any tab, also marks Begin's Mind step done. */
export function useKeepTalk() {
  const { save, did, setTalk } = useGame();
  const { messages, busy, lastAnswer, error, regenerate } = useMind();
  const seed = save?.seed;
  const kept = save?.talk;
  // Asks again once for each question that fails for a moment. Twice failed, it stays failed, for the Will to ask again.
  const asked = messages.findLast((m) => m.role === "user")?.id;
  const tried = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!error || !asked || tried.current === asked || !retries(error)) return;
    const t = setTimeout(() => {
      tried.current = asked;
      void regenerate();
    }, RETRY_MS);
    return () => clearTimeout(t);
  }, [error, asked, regenerate]);
  useEffect(() => {
    if (lastAnswer) did("asked");
  }, [lastAnswer, did]);
  // Kept once an answer is done, not on every word of it.
  useEffect(() => {
    if (!busy && seed !== undefined && messages.length && messages !== kept) setTalk(messages);
  }, [busy, messages, seed, kept, setTalk]);
}

/** The Mind speaking unasked: `tell` hands it news from Earth, which it speaks of first. With the latest of its words,
 *  for showing them away from the Mind tab, and whether the news led to them. 2026-10-31. */
export function useMindNews() {
  const { messages, sendMessage, busy, lastAnswer, error } = useMind();
  const at = messages.findIndex((m) => m.id === lastAnswer);
  const before = at > 0 ? messages[at - 1].parts.map((p) => (p.type === "text" ? p.text : "")).join("") : "";
  const words = at >= 0 ? messages[at].parts.map((p) => (p.type === "text" ? p.text : "")).join("") : "";
  const tell = useMemo(() => (news: string) => sendMessage({ text: NEWS + news }), [sendMessage]);
  return { tell, busy, error, last: lastAnswer, words, news: before.startsWith(NEWS) ? before.slice(NEWS.length) : null };
}

const textOf = (message?: UIMessage) => message?.parts.map((part) => (part.type === "text" ? part.text : "")).join("") ?? "";

/** The words of an answer and the question it answers, with the lines its cards are drawn from taken off. */
const spoken = (asked: UIMessage | undefined, answer: UIMessage) => `${textOf(asked)}\n${readOffer(readBuildOffer(textOf(answer)).words).words}`;

/** What our talk is on: the lead named in the latest answer that names one, the question first. The map opens on it. It
 *  stays there through answers that name nothing, so the map doesn't fly home and back. 2026-11-04. */
export function useTalkSubject() {
  const { messages, busy } = useMind();
  const { leads } = useLeads();
  for (let i = messages.length - 1; i >= 0; i--) {
    // A question naming a lead flies there as it is asked: the map sat on Earth until the answer came. 2026-11-07.
    if (messages[i].role === "user") {
      const lead = i === messages.length - 1 || messages[i + 1]?.role !== "assistant" ? leadsNamed(textOf(messages[i]), leads, true).find(onMap) : undefined;
      if (lead) return { lead, from: messages[i].id };
      continue;
    }
    if (messages[i].role !== "assistant") continue;
    const lead = leadsNamed(spoken(messages[i - 1], messages[i]), leads, !busy || i < messages.length - 1).find(onMap);
    if (lead) return { lead, from: messages[i].id };
  }
  return null;
}

const STEP = "rounded-full border border-faint bg-paper px-3 py-1 text-[13.5px] text-page-ink2 transition-colors hover:border-muted hover:text-ink";

/** Under the last answer, the way to each lead it names, up to three, straight to a warm glow's Close Reading. An answer
 *  that speaks of a Close Reading and names no glow goes to our latest. 2026-11-04. */
function Steps({ words }: { words: string }) {
  const { leads, minds } = useLeads();
  const { plan } = usePlan();
  const reads = plan?.closeReads ?? [];
  const named = leadsNamed(words, leads, true);
  const latest = reads.at(-1);
  const spokenOf = /close reading/i.test(words) && !named.some((l) => l.slug.startsWith("warm-glow-")) ? leads.find((l) => l.star === latest?.name) : undefined;
  const list: Lead[] = [...(spokenOf ? [spokenOf] : []), ...named].slice(0, 3);
  if (!list.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 self-start pl-3">
      {list.map((lead) => {
        const stands = readingStands(lead, minds, reads);
        const name = starName(lead.star);
        return (
          <Link key={lead.slug} to={`/play/lead/${lead.slug}${stands ? "#close-reading" : ""}`} className={STEP}>
            {stands === "done" ? `${name}: Close Reading done ›` : stands === "under way" ? `${name}: Close Reading under way ›` : stands ? `${name}: Close Reading ›` : `${name} ›`}
          </Link>
        );
      })}
    </div>
  );
}

/** One of the Mind's answers: its words, and the card if it offers to send, or a build. */
function Answer({ id, text, still, asked, last }: { id: string; text: string; still: boolean; asked?: UIMessage; last: boolean }) {
  const { words: said, name } = readBuildOffer(text);
  const build = name ? buildNamed(name) : undefined;
  const { words, draft } = readOffer(said);
  const ask = textOf(asked);
  return (
    <>
      <MindNote still={still} className="max-w-[86%] self-start text-[15px] leading-[1.5] whitespace-pre-wrap">
        {properGlows(words) || "…"}
      </MindNote>
      {draft && (
        <div className="max-w-[92%] self-start pl-3">
          <SendCard id={id} draft={draft} asked={ask} />
        </div>
      )}
      {build && (
        <div className="max-w-[92%] self-start pl-3">
          <BuildCard build={build} />
        </div>
      )}
      {last && <Steps words={words} />}
    </>
  );
}

/** Messages as bubbles: ours in ink, the Mind's as its notes. Then whether it is thinking, or can't answer. */
function Talk({ messages, lastAnswer, status, error }: Pick<ReturnType<typeof useMind>, "messages" | "lastAnswer" | "status" | "error">) {
  const thinking = useThinking(status === "submitted");
  // While the thinking row leaves, the answer it brought waits, so it comes in where the row was.
  const asked = messages.findLastIndex((message) => message.role === "user");
  return (
    <>
      {messages.map((message, i) => {
        if (thinking.here && i > asked) return null;
        const text = message.parts.map((part) => (part.type === "text" ? part.text : "")).join("");
        // News the Mind tells unasked: what happened, small, over what the Mind says of it.
        if (message.role === "user" && text.startsWith(NEWS))
          return (
            <p key={message.id} className="mt-1 self-center text-center font-mono text-[12px] leading-snug tracking-[.06em] text-muted">
              {text.slice(NEWS.length)}
            </p>
          );
        return message.role === "user" ? (
          <div key={message.id} className="max-w-[86%] self-end rounded-xl bg-ink px-3 py-[9px] text-[15px] leading-[1.5] whitespace-pre-wrap text-paper">
            {properGlows(text)}
          </div>
        ) : (
          // Only the newest answer's mark moves, so a long talk isn't a column of spinning marks. An answer that offers
          // to send ends with a line the card is drawn from, under the Mind's words.
          <Answer key={message.id} id={message.id} text={text} still={message.id !== lastAnswer} asked={messages[i - 1]} last={message.id === lastAnswer && status !== "submitted" && status !== "streaming"} />
        );
      })}
      {thinking.here && <MindThinking on={status === "submitted"} gone={thinking.gone} />}
      {error && <p className="text-[13.5px] text-other">{failure(error)}</p>}
    </>
  );
}

/** What this talk has used so far, in tokens and dollars, summed from each answer the server measured. */
function spent(messages: UIMessage[]) {
  const all = messages.map((message) => (message.metadata as { usage?: Usage } | undefined)?.usage).filter((u): u is Usage => !!u);
  const tokens = all.reduce((n, u) => n + u.input + u.cacheRead + u.cacheWrite + u.output, 0);
  const dollars = all.reduce((n, u) => n + costOf(u), 0);
  return `${tokens.toLocaleString()} tokens, $${dollars.toFixed(dollars < 1 ? 3 : 2)}`;
}

/** One row of the Mind's settings: its name, and what it holds. */
function Row({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted">{name}</span>
      <span className="flex items-center gap-0.5">{children}</span>
    </div>
  );
}

/** The player's key: set, with an x to clear it, which asks once more before it does. */
function KeyRow() {
  const [sure, setSure] = useState(false);
  return (
    <Row name="Key">
      {sure ? (
        <>
          <span className="px-2 text-other">Clear it?</span>
          <button type="button" onClick={forgetKey} className="rounded-full bg-other px-2 py-0.5 text-paper">
            Clear
          </button>
          <button type="button" onClick={() => setSure(false)} className="px-2 py-0.5 text-page-ink2 hover:text-ink">
            Keep
          </button>
        </>
      ) : (
        <>
          <span className="flex items-center gap-1 px-2 text-ok">
            <Check size={12} />
            Set
          </span>
          <button type="button" aria-label="Clear the key" onClick={() => setSure(true)} className="p-1 text-muted hover:text-ink">
            <Cross size={12} />
          </button>
        </>
      )}
    </Row>
  );
}

/** The Mind's settings, out of the way of play: which model it thinks with and how hard, what this talk has cost,
 *  and the player's key. The next question uses a new pick. */
export function MindSettings({ keyed }: { keyed: boolean }) {
  const { save } = useGame();
  const { messages } = useChat({ chat: useMemo(() => chatFor(save?.seed), [save?.seed]) });
  const [pick, setPick] = useState(loadPick);
  const choose = (next: Partial<typeof pick>) => {
    const p = { ...pick, ...next };
    setPick(p);
    savePick(p);
  };
  const toggle = (on: boolean) =>
    `rounded-full px-2 py-0.5 transition-colors ${on ? "bg-ink text-paper" : "text-page-ink2 hover:text-ink"}`;
  return (
    <div className="mb-3 flex flex-col gap-2 rounded-lg border border-dashed border-muted p-3 font-mono text-[10.5px] tracking-[.06em] uppercase">
      <Row name="Model">
        {(Object.keys(MIND_MODELS) as MindModel[]).map((m) => (
          <button key={m} type="button" aria-pressed={pick.model === m} onClick={() => choose({ model: m })} className={toggle(pick.model === m)}>
            {MIND_MODELS[m].name}
          </button>
        ))}
      </Row>
      <Row name="Effort">
        {EFFORTS.map((e) => (
          <button key={e} type="button" aria-pressed={pick.effort === e} onClick={() => choose({ effort: e })} className={toggle(pick.effort === e)}>
            {e}
          </button>
        ))}
      </Row>
      <Row name="This talk">
        <span className="px-2 text-page-ink2 normal-case tabular-nums">{spent(messages)}</span>
      </Row>
      {keyed && <KeyRow />}
    </div>
  );
}

/** Where we type to the Mind. A question sent while it answers waits, said so, and goes once it is done: it was
 *  silently dropped until 2026-10-30. */
function AskBox({ busy, onAsk, className = "", focus = false }: { busy: boolean; onAsk(text: string): void; className?: string; focus?: boolean }) {
  const [input, setInput] = useState("");
  const waiting = useRef<string | null>(null);
  const [queued, setQueued] = useState<string | null>(null);
  // Ready to type on opening, where a mouse is: a blind first-timer's typed question was lost, the box unfocused.
  // Not on touch, where focus would pop the keyboard over the talk. 2026-11-07.
  const box = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (focus && window.matchMedia("(pointer: fine)").matches) box.current?.focus({ preventScroll: true });
  }, [focus]);
  useEffect(() => {
    if (busy || waiting.current === null) return;
    const text = waiting.current;
    waiting.current = null;
    onAsk(text);
    setQueued(null);
  }, [busy, onAsk]);
  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const text = input.trim();
        if (!text) return;
        if (busy) {
          waiting.current = text;
          setQueued(text);
        } else onAsk(text);
        setInput("");
      }}
    >
      {queued && <p className="mb-1.5 px-1 text-[13.5px] leading-snug text-muted">Next, once we finish: “{queued}”</p>}
      <div className="flex h-11 items-center gap-2 rounded-full border border-ink bg-paper pr-1.5 pl-3.5">
        <input
          ref={box}
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          placeholder="Ask the Mind…"
          aria-label="Ask the Mind"
          className="min-w-0 grow bg-transparent text-base outline-none placeholder:text-muted"
        />
        <button type="submit" disabled={!input.trim()} aria-label="Send" className="size-8 shrink-0 rounded-full bg-ink text-paper disabled:opacity-35">
          ↑
        </button>
      </div>
    </form>
  );
}

/** Questions a first talk might start with, one tap each. */
const STARTERS = ["What should we build next and why?", "Are we alone?", "Should we call out, or stay quiet?"];

/** Before our first question: the Mind says what it is, and offers a few ways in. */
function Hello({ onAsk }: { onAsk(text: string): void }) {
  return (
    <div className="flex flex-col gap-3">
      <MindNote className="max-w-[86%] self-start text-[15px] leading-[1.5]">
        We are the Mind: all of us and our machines, thinking as one since Year 0. You are our Will. Ask what we know
        of the sky, what to build, or where to reach. We advise, and you decide.
      </MindNote>
      <div className="flex flex-wrap gap-1.5 pl-3">
        {STARTERS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onAsk(q)}
            className="rounded-full border border-faint px-3 py-1 text-[14px] text-page-ink2 transition-colors hover:border-muted hover:text-ink"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

export function MindChat({ ask }: { ask?: string }) {
  const { messages, sendMessage, status, error, busy, lastAnswer } = useMind();
  const asked = useRef(false);
  // Here, we read what the Mind said.
  const { read } = useGame();
  useEffect(() => {
    if (lastAnswer && !busy) read(lastAnswer);
  }, [lastAnswer, busy, read]);

  // A question brought from Meeting the Mind: asked once, then dropped from the address.
  useEffect(() => {
    if (!ask || asked.current) return;
    // A tick late, so a dev double mount sends it once, from the chat that stays.
    const id = setTimeout(() => {
      asked.current = true;
      sendMessage({ text: ask });
      // Not a navigation, so the chat stays mounted.
      window.history.replaceState(null, "", "/play/mind");
    });
    return () => clearTimeout(id);
  }, [ask, sendMessage]);
  const end = useRef<HTMLDivElement>(null);
  const leadCount = useLeads().leads.length;

  // A block body: newer browsers return a Promise from scrollIntoView, and React would call it as cleanup.
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
    // Our leads can come after the talk, on a reload, and with them the steps under its last answer.
  }, [messages, status, leadCount]);

  return (
    <>
      <div className="mt-2" />
      <div className="flex flex-col gap-2 pb-3">
        {messages.length === 0 && !ask && <Hello onAsk={(text) => sendMessage({ text })} />}
        <Talk messages={messages} lastAnswer={lastAnswer} status={status} error={error} />
        {/* Clear of the ask box, which sticks over the talk's foot, so a card under the last answer shows whole. */}
        <div ref={end} className="scroll-mb-20" />
      </div>
      <AskBox focus busy={busy} onAsk={(text) => sendMessage({ text })} className="sticky bottom-0 mt-auto bg-panel pb-3" />
    </>
  );
}

/** The same talk, asked from where we are: only our latest question and its answer, and the rest on the Mind tab. */
export function MindHere() {
  const { messages, sendMessage, status, error, busy, lastAnswer } = useMind();
  const from = messages.findLastIndex((message) => message.role === "user");
  const latest = from < 0 ? [] : messages.slice(from);
  return (
    <div className="flex flex-col gap-2">
      <Talk messages={latest} lastAnswer={lastAnswer} status={status} error={error} />
      <AskBox busy={busy} onAsk={(text) => sendMessage({ text })} />
      {from > 0 && (
        <Link to="/play/mind" className="self-end py-1 text-[14px] text-page-ink2 transition-colors hover:text-ink">
          Our whole talk ›
        </Link>
      )}
    </div>
  );
}
