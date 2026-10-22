import { Chat, useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { useGame } from "@/components/game-provider";
import { MindNote } from "@/components/mind-note";
import { BAD_KEY, KEY_NEEDS_WORKSPACE } from "@/lib/access";
import { realTime } from "@/lib/game/clock";
import { browserStore } from "@/lib/game/store";

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
    };
  },
});

// One talk with the Mind for each game, on whichever tab we ask from. Before the save loads, the talk waits for its
// seed, so a question asked that early isn't dropped. A new game starts a new talk.
let talk: { seed?: number; chat: Chat<UIMessage> } | undefined;
function chatFor(seed?: number) {
  if (!talk || (talk.seed !== undefined && seed !== undefined && talk.seed !== seed))
    talk = { seed, chat: new Chat({ transport }) };
  talk.seed ??= seed;
  return talk.chat;
}

/** Our talk with the Mind. An answer from the Mind is one of the things we would have before Begin. */
function useMind() {
  const { save, did } = useGame();
  const seed = save?.seed;
  const chat = useMemo(() => chatFor(seed), [seed]);
  const helpers = useChat({ chat });
  const lastAnswer = helpers.messages.findLast((message) => message.role === "assistant")?.id;
  useEffect(() => {
    if (lastAnswer) did("asked");
  }, [lastAnswer, did]);
  const busy = helpers.status === "submitted" || helpers.status === "streaming";
  return { ...helpers, busy, lastAnswer };
}

/** Messages as bubbles: ours in ink, the Mind's as its notes. Then whether it is thinking, or can't answer. */
function Talk({ messages, lastAnswer, status, error }: Pick<ReturnType<typeof useMind>, "messages" | "lastAnswer" | "status" | "error">) {
  return (
    <>
      {messages.map((message) => {
        const text = message.parts.map((part) => (part.type === "text" ? part.text : "")).join("");
        return message.role === "user" ? (
          <div key={message.id} className="max-w-[86%] self-end rounded-xl bg-ink px-3 py-[9px] text-[13.5px] leading-[1.45] whitespace-pre-wrap text-paper">
            {text}
          </div>
        ) : (
          // Only the newest answer's mark moves, so a long talk isn't a column of spinning marks.
          <MindNote
            key={message.id}
            still={message.id !== lastAnswer}
            className="max-w-[86%] self-start text-[13.5px] leading-[1.45] whitespace-pre-wrap"
          >
            {text || "…"}
          </MindNote>
        );
      })}
      {status === "submitted" && <span className="self-start font-mono text-[9.5px] tracking-[.1em] text-you">THE MIND IS THINKING</span>}
      {error && <p className="text-xs text-other">{error.message === BAD_KEY || error.message === KEY_NEEDS_WORKSPACE ? error.message : "The Mind can’t answer right now."}</p>}
    </>
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
      <p className="mt-2 mb-1 text-[11px] text-muted">
        The clock runs while you talk: 1 Year every <span className="font-mono tabular-nums">{realTime(1)}</span>.
      </p>
      <div className="flex flex-col gap-2 pb-3">
        <Talk messages={messages} lastAnswer={lastAnswer} status={status} error={error} />
        <div ref={end} />
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
