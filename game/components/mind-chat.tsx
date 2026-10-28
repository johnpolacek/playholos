import { Chat, useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { useGame } from "@/components/game-provider";
import { BuildCard } from "@/components/build-card";
import { Check, Cross } from "@/components/icons";
import { MindNote } from "@/components/mind-note";
import { MindThinking, useThinking } from "@/components/mind-thinking";
import { SendCard } from "@/components/send-card";
import { BAD_KEY, costOf, type Effort, EFFORTS, KEY_NEEDS_CREDIT, KEY_NEEDS_WORKSPACE, MIND_MODELS, type MindModel, readMindPick, type Usage } from "@/lib/access";
import { readBuildOffer } from "@/lib/game/build-offer";
import { buildNamed } from "@/lib/game/plan";
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
      sentinels: save?.plan?.sentinels ?? [],
      pickets: save?.plan?.pickets ?? [],
      strikes: save?.plan?.strikes ?? [],
      seeds: save?.plan?.seeds ?? [],
      colony: save?.plan?.colony ?? null,
      will: save?.will ?? null,
      stops: save?.plan?.stops ?? [],
      sent: save?.sent ?? [],
      reactions: save?.reactions ?? [],
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

/** Our talk with the Mind. An answer from the Mind is one of the things we would have before Begin. */
function useMind() {
  const { save, did, setTalk } = useGame();
  const seed = save?.seed;
  const kept = save?.talk;
  const chat = useMemo(() => chatFor(seed, kept), [seed, kept]);
  const helpers = useChat({ chat });
  const lastAnswer = helpers.messages.findLast((message) => message.role === "assistant")?.id;
  useEffect(() => {
    if (lastAnswer) did("asked");
  }, [lastAnswer, did]);
  const busy = helpers.status === "submitted" || helpers.status === "streaming";
  // Kept once an answer is done, not on every word of it.
  const { messages } = helpers;
  useEffect(() => {
    if (!busy && seed !== undefined && messages.length && messages !== kept) setTalk(messages);
  }, [busy, messages, seed, kept, setTalk]);
  return { ...helpers, busy, lastAnswer };
}

/** One of the Mind's answers: its words, and the card if it offers to send, or a build. */
function Answer({ id, text, still, asked }: { id: string; text: string; still: boolean; asked?: UIMessage }) {
  const { words: said, name } = readBuildOffer(text);
  const build = name ? buildNamed(name) : undefined;
  const { words, draft } = readOffer(said);
  const ask = asked?.parts.map((part) => (part.type === "text" ? part.text : "")).join("") ?? "";
  return (
    <>
      <MindNote still={still} className="max-w-[86%] self-start text-[13.5px] leading-[1.45] whitespace-pre-wrap">
        {words || "…"}
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
        return message.role === "user" ? (
          <div key={message.id} className="max-w-[86%] self-end rounded-xl bg-ink px-3 py-[9px] text-[13.5px] leading-[1.45] whitespace-pre-wrap text-paper">
            {text}
          </div>
        ) : (
          // Only the newest answer's mark moves, so a long talk isn't a column of spinning marks. An answer that offers
          // to send ends with a line the card is drawn from, under the Mind's words.
          <Answer key={message.id} id={message.id} text={text} still={message.id !== lastAnswer} asked={messages[i - 1]} />
        );
      })}
      {thinking.here && <MindThinking on={status === "submitted"} gone={thinking.gone} />}
      {error && <p className="text-xs text-other">{[BAD_KEY, KEY_NEEDS_WORKSPACE, KEY_NEEDS_CREDIT].includes(error.message) ? error.message : "The Mind can’t answer right now."}</p>}
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

/** Where we type to the Mind. */
function AskBox({ busy, onAsk, className = "" }: { busy: boolean; onAsk(text: string): void; className?: string }) {
  const [input, setInput] = useState("");
  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || busy) return;
        onAsk(text);
        setInput("");
      }}
    >
      <div className="flex h-11 items-center gap-2 rounded-full border border-ink bg-paper pr-1.5 pl-3.5">
        <input
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          placeholder="Ask the Mind…"
          aria-label="Ask the Mind"
          className="min-w-0 grow bg-transparent text-sm outline-none placeholder:text-muted"
        />
        <button type="submit" disabled={busy || !input.trim()} aria-label="Send" className="size-8 shrink-0 rounded-full bg-ink text-paper disabled:opacity-35">
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
      <MindNote className="max-w-[86%] self-start text-[13.5px] leading-[1.45]">
        We are the Mind: all of us and our machines, thinking as one since Year 0. You are our Will. Ask what we know
        of the sky, what to build, or where to reach. We advise, and you decide.
      </MindNote>
      <div className="flex flex-wrap gap-1.5 pl-3">
        {STARTERS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onAsk(q)}
            className="rounded-full border border-faint px-3 py-1 text-[12.5px] text-page-ink2 transition-colors hover:border-muted hover:text-ink"
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

  // A question brought from Meeting the Mind: asked once, then dropped from the address.
  useEffect(() => {
    if (!ask || asked.current) return;
    // A tick late, so a dev double mount sends it once, from the chat that stays.
    const id = setTimeout(() => {
      asked.current = true;
      sendMessage({ text: ask });
      // Not a navigation, so the chat stays mounted.
      window.history.replaceState(null, "", "/mind");
    });
    return () => clearTimeout(id);
  }, [ask, sendMessage]);
  const end = useRef<HTMLDivElement>(null);

  // A block body: newer browsers return a Promise from scrollIntoView, and React would call it as cleanup.
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [messages, status]);

  return (
    <>
      <div className="mt-2" />
      <div className="flex flex-col gap-2 pb-3">
        {messages.length === 0 && !ask && <Hello onAsk={(text) => sendMessage({ text })} />}
        <Talk messages={messages} lastAnswer={lastAnswer} status={status} error={error} />
        {/* Clear of the ask box, which sticks over the talk's foot, so a card under the last answer shows whole. */}
        <div ref={end} className="scroll-mb-20" />
      </div>
      <AskBox busy={busy} onAsk={(text) => sendMessage({ text })} className="sticky bottom-0 mt-auto bg-panel pb-3" />
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
        <Link to="/mind" className="self-end py-1 text-[12.5px] text-page-ink2 transition-colors hover:text-ink">
          Our whole talk ›
        </Link>
      )}
    </div>
  );
}
