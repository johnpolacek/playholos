import { useSearchParams } from "react-router";
import { MindChat } from "@/components/mind-chat";
import { TabHead } from "@/components/tab-head";
import { ForgetKey, Unlock } from "@/components/unlock";
import { useAccess } from "@/lib/key";

// The rest of the game is open. Only the Mind runs on AI, so only the Mind asks for a key or the code. `ask` is a
// question from Meeting the Mind, sent once the chat opens, and kept through the unlock.
export default function Mind() {
  const ask = useSearchParams()[0].get("ask");
  const question = ask ? ask.slice(0, 200) : undefined;
  const open = useAccess();
  return (
    <>
      <TabHead title="MIND" right={open === undefined ? undefined : open ? "ASKING" : "LOCKED"} />
      {open ? (
        <>
          {open === "key" && <ForgetKey />}
          <MindChat ask={question} />
        </>
      ) : (
        open === null && <Unlock />
      )}
    </>
  );
}
