import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { useGame } from "@/components/game-provider";
import { MindChat, MindSettings } from "@/components/mind-chat";
import { MindTab } from "@/components/mind-tab";
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
  return (
    <MindTab locked={open === null} settings={open && <MindSettings keyed={open === "key"} free={open === "free"} />}>
      {open ? <MindChat ask={question} /> : open === null && <Unlock />}
    </MindTab>
  );
}
