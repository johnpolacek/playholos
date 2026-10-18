"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { BAD_KEY } from "@/lib/access";
import { realTime } from "@/lib/game/clock";
import { browserStore } from "@/lib/game/store";

// Each send carries the time of Begin, so the Mind knows the Year, the seed, so the server can work out what Earth
// knows, and what the plan observes, so it knows what has landed. The server never sends the seed's truth back.
const transport = new DefaultChatTransport({
  api: "/api/mind",
  body: async () => {
    const save = await browserStore.load();
    return {
      beganAt: save?.beganAt ?? null,
      seed: save?.seed ?? null,
      charter: save?.charter ?? null,
      observe: save?.plan?.observe ?? [],
    };
  },
});

export function MindChat({ ask }: { ask?: string }) {
  const { messages, sendMessage, status, error } = useChat({ transport });
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
  const [input, setInput] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const busy = status === "submitted" || status === "streaming";

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
        {messages.map((message) => {
          const text = message.parts.map((part) => (part.type === "text" ? part.text : "")).join("");
          return message.role === "user" ? (
            <div key={message.id} className="max-w-[86%] self-end rounded-xl bg-ink px-3 py-[9px] text-[13.5px] leading-[1.45] whitespace-pre-wrap text-paper">
              {text}
            </div>
          ) : (
            <div key={message.id} className="flex max-w-[86%] flex-col gap-[3px] self-start rounded-xl border border-faint bg-paper px-3 py-[9px] text-[13.5px] leading-[1.45] whitespace-pre-wrap">
              <span className="font-mono text-[9.5px] tracking-[.1em] text-you">THE MIND</span>
              {text || "…"}
            </div>
          );
        })}
        {status === "submitted" && <span className="self-start font-mono text-[9.5px] tracking-[.1em] text-you">THE MIND IS THINKING</span>}
        {error && <p className="text-xs text-other">{error.message === BAD_KEY ? BAD_KEY : "The Mind can’t answer right now."}</p>}
        <div ref={end} />
      </div>
      <form
        className="sticky bottom-0 mt-auto bg-panel pb-3"
        onSubmit={(e) => {
          e.preventDefault();
          const text = input.trim();
          if (!text || busy) return;
          sendMessage({ text });
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
    </>
  );
}
