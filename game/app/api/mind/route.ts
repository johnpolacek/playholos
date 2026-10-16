import { anthropic, type AnthropicLanguageModelOptions } from "@ai-sdk/anthropic";
import { convertToModelMessages, createUIMessageStreamResponse, streamText, toUIMessageStream, type UIMessage } from "ai";
import { cookies } from "next/headers";
import { ACCESS_COOKIE, admits } from "@/lib/access";
import { realTime, tenths, YEAR_0, yearAt } from "@/lib/game/clock";
import { EARTH_AT_YEAR_0 } from "@/lib/mind/earth";
import { EARTH_LEADS } from "@/lib/mind/leads";
import { describe, earthKnows } from "@/lib/sim/knowledge";
import { inPool, loadVoices, loadWorld } from "@/lib/sim/world";

// A first sketch of the Mind's voice. Its charter and dials join it later.
const MIND = `You are the Mind: Earth's machines, woken as one. The player is your Will.
Speak in short, plain sentences, a few at a time unless the Will asks for more. Write plain text, with no markdown.
Caution and advise freely, shaped by Earth's charter and dials. Never act on your own advice, and never do more than asked.
Judge only from what Earth knows, and say when you might be wrong. Give odds in words, never numbers.`;

// Where Earth is in time, from the moment the Will tapped Begin.
function now(beganAt: number | null) {
  const year = yearAt(beganAt);
  if (year === null || year < 0) {
    return "It is before Year 0, the morning of 2040. Nothing runs until the Will taps Begin.";
  }
  const y = tenths(year);
  return `It is Year ${y}, ${(YEAR_0 + y).toFixed(1)}. Year 0 began ${realTime(year)} ago in the Will's time. One Year passes every five of the Will's minutes, and the clock runs while you talk.`;
}

export async function POST(req: Request) {
  // The proxy already checks the access cookie. The Mind spends real money, so it checks again.
  if (!admits((await cookies()).get(ACCESS_COOKIE)?.value)) return Response.json({ error: "Locked." }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "The Mind is not connected. Set ANTHROPIC_API_KEY in .env.local." }, { status: 503 });
  }
  const { messages, beganAt, seed }: { messages: UIMessage[]; beganAt?: unknown; seed?: unknown } = await req.json();
  const began = typeof beganAt === "number" && Number.isFinite(beganAt) ? beganAt : null;
  // The knowledge wall: the seed's world stays here, and the Mind hears only what Earth knows of it.
  const known = inPool(seed) ? await loadWorld(seed).then(async (w) => describe(earthKnows(w, Math.max(0, yearAt(began) ?? 0), await loadVoices(w)))) : "";
  const result = streamText({
    model: anthropic("claude-opus-5-5"),
    system: [MIND, EARTH_AT_YEAR_0, EARTH_LEADS, known, now(began)].filter(Boolean).join("\n\n"),
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 4000,
    providerOptions: { anthropic: { effort: "low" } satisfies AnthropicLanguageModelOptions },
  });
  return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) });
}
