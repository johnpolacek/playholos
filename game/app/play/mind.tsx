import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { useGame } from "@/components/game-provider";
import { Dials } from "@/components/icons";
import { MindChat, MindSettings } from "@/components/mind-chat";
import { TabHead } from "@/components/tab-head";
import { Unlock } from "@/components/unlock";
import { useAccess } from "@/lib/key";

// The rest of the game is open. Only the Mind runs on AI, so only the Mind asks for a key or the code. `ask` is a
// question from Meeting the Mind, sent once the chat opens, and kept through the unlock.
export default function Mind() {
  const ask = useSearchParams()[0].get("ask");
  const question = ask ? ask.slice(0, 200) : undefined;
  const open = useAccess();
  // Reaching the Mind, open to us, is Begin's fourth step done. We need not ask it anything. 2026-10-31.
  const { did } = useGame();
  useEffect(() => {
    if (open) did("asked");
  }, [open, did]);
  // The model, effort, cost and key sit behind one button, so play never shows them unasked.
  const [settings, setSettings] = useState(false);
  const tool = open ? (
    <button
      type="button"
      aria-label="Mind settings"
      aria-expanded={settings}
      onClick={() => setSettings((s) => !s)}
      className={`p-2.5 transition-colors hover:text-ink ${settings ? "text-ink" : ""}`}
    >
      <Dials />
    </button>
  ) : undefined;
  return (
    <>
      <TabHead title="MIND" right={open === null ? "LOCKED" : undefined} tool={tool} />
      {open ? (
        <>
          {settings && <MindSettings keyed={open === "key"} free={open === "free"} />}
          <MindChat ask={question} />
        </>
      ) : (
        open === null && <Unlock />
      )}
    </>
  );
}
