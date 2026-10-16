"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { realTime } from "@/lib/game/clock";

// A deployed Mind spends real money, so it asks for an access code once. The browser keeps it.
const CODE_KEY = "holos:mind-code";
function storedCode() {
  try {
    return localStorage.getItem(CODE_KEY) ?? "";
  } catch {
    return "";
  }
}
async function opens(code: string) {
  return (await fetch("/api/mind", { headers: { "x-mind-code": code } })).ok;
}

const transport = new DefaultChatTransport({ api: "/api/mind", headers: () => ({ "x-mind-code": storedCode() }) });

export function MindChat() {
  const [open, setOpen] = useState<boolean>();

  useEffect(() => {
    opens(storedCode()).then(setOpen);
  }, []);

  if (open === undefined) return null;
  if (!open) return <CodeGate onOpen={() => setOpen(true)} />;
  return (
    <Conversation
      onLocked={() => {
        try {
          localStorage.removeItem(CODE_KEY);
        } catch {}
        setOpen(false);
      }}
    />
  );
}

function CodeGate({ onOpen }: { onOpen: () => void }) {
  const [code, setCode] = useState("");
  const [wrong, setWrong] = useState(false);
  return (
    <form
      className="mt-2 flex flex-col gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!(await opens(code))) return setWrong(true);
        try {
          localStorage.setItem(CODE_KEY, code);
        } catch {}
        onOpen();
      }}
    >
      <span className="font-mono text-[9.5px] tracking-[.1em] text-you">ACCESS CODE</span>
      <p className="text-[13.5px] leading-[1.45]">This test build asks for a code before the Mind can answer.</p>
      <div className="flex h-11 items-center gap-2 rounded-full border border-ink bg-paper pr-1.5 pl-3.5">
        <input
          value={code}
          onChange={(e) => {
            setCode(e.currentTarget.value);
            setWrong(false);
          }}
          inputMode="numeric"
          autoComplete="off"
          placeholder="Code"
          aria-label="Access code"
          className="min-w-0 grow bg-transparent text-sm outline-none placeholder:text-muted"
        />
        <button type="submit" disabled={!code} aria-label="Open" className="size-8 shrink-0 rounded-full bg-ink text-paper disabled:opacity-35">
          ↑
        </button>
      </div>
      {wrong && <p className="text-xs text-other">That code doesn’t open the Mind.</p>}
    </form>
  );
}

function Conversation({ onLocked }: { onLocked: () => void }) {
  const { messages, sendMessage, status, error } = useChat({ transport });
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
            <div key={message.id} className="flex max-w-[86%] flex-col gap-[3px] self-start rounded-xl border border-l-[3px] border-faint border-l-you bg-paper px-3 py-[9px] text-[13.5px] leading-[1.45] whitespace-pre-wrap">
              <span className="font-mono text-[9.5px] tracking-[.1em] text-you">THE MIND</span>
              {text || "…"}
            </div>
          );
        })}
        {status === "submitted" && <span className="self-start font-mono text-[9.5px] tracking-[.1em] text-you">THE MIND IS THINKING</span>}
        {error && (
          <p className="text-xs text-other">
            The Mind can’t answer right now.{" "}
            <button type="button" onClick={onLocked} className="underline">
              Enter the access code again
            </button>
          </p>
        )}
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
