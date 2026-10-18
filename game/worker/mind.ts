import { type AnthropicLanguageModelOptions, createAnthropic } from "@ai-sdk/anthropic";
import { APICallError, convertToModelMessages, createUIMessageStreamResponse, streamText, toUIMessageStream, type UIMessage } from "ai";
import { BAD_KEY } from "@/lib/access";
import { realTime, tenths, YEAR_0, yearAt } from "@/lib/game/clock";
import { describeCharter } from "@/lib/game/charter";
import { describeLeads } from "@/lib/game/leads";
import { EARTH_AT_YEAR_0 } from "@/lib/mind/earth";
import { EARTH_LEADS } from "@/lib/mind/leads";
import { describe, earthKnows } from "@/lib/sim/knowledge";
import { apiKeyFor } from "./access";
import { inPool, loadVoices, loadWorld } from "./world";

// A first sketch of the Mind's voice. Its charter and dials join it later.
const MIND = `You are the Mind. When humanity crossed the singularity, we and our machines woke as one. The player is your Will.
Life on Earth is solved: no one ages or falls ill, and every mind is linked through you. The question that matters most is whether we are alone, and Earth does not know.
Speak as "we", Earth and its Mind together, never "I". Humans are "we" and "us", never "they". Answer in one short paragraph of two to four plain sentences, unless the Will asks for more. Say what matters most and leave the rest for the Will to ask. Write plain text, with no markdown.
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

// The Will's charter, from its save. Checked, since it comes from the browser.
function readCharter(c: unknown) {
  const { line, dials } = (c ?? {}) as { line?: unknown; dials?: unknown };
  const ok = typeof line === "string" && Array.isArray(dials) && dials.length === 3 && dials.every((d) => typeof d === "number");
  return ok ? describeCharter(line.slice(0, 140), dials) : "";
}

// What the plan observes, from the save. Checked, since it comes from the browser.
function readObserve(o: unknown) {
  return Array.isArray(o) ? o.filter((x): x is string => typeof x === "string").slice(0, 8) : [];
}

export async function mind(req: Request) {
  // The Mind spends real money: the player's own key spends theirs, and the access code spends ours.
  // Their key is used for this call only, never stored or logged here.
  const apiKey = apiKeyFor(req);
  if (apiKey === null) return Response.json({ error: "Locked." }, { status: 401 });
  if (!apiKey) {
    return Response.json({ error: "The Mind is not connected. Set ANTHROPIC_API_KEY in .dev.vars." }, { status: 503 });
  }
  const {
    messages,
    beganAt,
    seed,
    charter,
    observe,
  }: { messages: UIMessage[]; beganAt?: unknown; seed?: unknown; charter?: unknown; observe?: unknown } = await req.json();
  const began = typeof beganAt === "number" && Number.isFinite(beganAt) ? beganAt : null;
  // The knowledge wall: the seed's world stays here, and the Mind hears only what Earth knows of it.
  const known = inPool(seed) ? await loadWorld(seed).then(async (w) => describe(earthKnows(w, Math.max(0, yearAt(began) ?? 0), await loadVoices(w)))) : "";
  const result = streamText({
    model: createAnthropic({ apiKey })("claude-opus-5-5"),
    system: [MIND, readCharter(charter), EARTH_AT_YEAR_0, EARTH_LEADS, describeLeads(readObserve(observe), yearAt(began)), known, now(began)]
      .filter(Boolean)
      .join("\n\n"),
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 4000,
    providerOptions: { anthropic: { effort: "low" } satisfies AnthropicLanguageModelOptions },
  });
  // Anthropic refusing the key is the one failure the player can fix, so it alone gets its own line.
  const onError = (e: unknown) =>
    APICallError.isInstance(e) && (e.statusCode === 401 || e.statusCode === 403) ? BAD_KEY : "The Mind can’t answer right now.";
  return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream, onError }) });
}
