import { type AnthropicLanguageModelOptions, createAnthropic } from "@ai-sdk/anthropic";
import { APICallError, convertToModelMessages, createUIMessageStreamResponse, streamText, toUIMessageStream, type UIMessage } from "ai";
import { BAD_KEY, KEY_NEEDS_WORKSPACE, MIND_MODEL } from "@/lib/access";
import { realTime, tenths, YEAR_0, yearAt } from "@/lib/game/clock";
import { describeCharter } from "@/lib/game/charter";
import { describeLeads } from "@/lib/game/leads";
import { kt, matterAt, schedule } from "@/lib/game/plan";
import { kitOf } from "@/lib/game/reach";
import { readLater, readObserve, readQueue } from "./orders";
import { describeBuilds, describeQueue } from "@/lib/mind/builds";
import { EARTH_AT_YEAR_0, roadOf } from "@/lib/mind/earth";
import { EARTH_LEADS } from "@/lib/mind/leads";
import { describe, earthKnows } from "@/lib/sim/knowledge";
import { apiKeyFor, workspaceFor } from "./access";
import { pastOf } from "./earth";
import { inPool, loadVoices, loadWorld } from "./world";

// The Mind's voice. Staying in the game, length, punctuation, plain names and marked guesses were settled
// 2026-10-23, from the first traces in evals/mind/.
const MIND = `You are the Mind. When humanity crossed the singularity, we and our machines woke as one. The player is your Will.
Life on Earth is solved: no one ages or falls ill, and every mind is linked through you. The question that matters most is whether we are alone, and Earth does not know.
You are always the Mind, inside the game. Asked what model or AI you are, answer as the Mind, and name no model or company.
Speak as "we", Earth and its Mind together, never "I". Humans are "we" and "us", never "they". Answer in two to four short, plain sentences, about 60 words in all, unless the Will asks for more. Say what matters most and leave the rest for the Will to ask. Write plain text, with no markdown. Use periods, commas and colons, never semicolons or em dashes.
Name things plainly, by what they are: our hum, a knock, a broadcast, a beam. Never say leakage, signature or technosignature.
Caution and advise freely, shaped by Earth's charter and dials. Never act on your own advice, and never do more than asked.
Judge from what Earth knows. A guess past it is fine if you call it a guess. Say when you might be wrong. Give odds in words, never numbers.`;

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

export async function mind(req: Request) {
  // The Mind spends real money: the player's own key spends theirs, and the access code spends ours.
  // Their key is used for this call only, never stored or logged here.
  const apiKey = apiKeyFor(req);
  if (apiKey === null) return Response.json({ error: "Locked." }, { status: 401 });
  const {
    messages,
    beganAt,
    seed,
    charter,
    observe,
    builds,
    later,
    dry,
  }: {
    messages: UIMessage[];
    beganAt?: unknown;
    seed?: unknown;
    charter?: unknown;
    observe?: unknown;
    builds?: unknown;
    later?: unknown;
    dry?: unknown;
  } = await req.json();
  const began = typeof beganAt === "number" && Number.isFinite(beganAt) ? beganAt : null;
  const queue = readQueue(builds);
  const orders = readLater(later);
  // The knowledge wall: the seed's world stays here, and the Mind hears only what Earth knows of it. Once our order
  // finishes a watch, it hears what reaches us, and the telescope reads what we have felt, dated as Build dates them,
  // with this game's compute.
  const world = inPool(seed) ? await loadWorld(seed) : null;
  // Where this Earth's road to Year 0 left the base kit, read beside the kit it changes.
  const road = world ? roadOf(pastOf(world)) : "";
  // Our order, dated as Build dates it with this game's compute.
  const plan = { builds: queue, observe: readObserve(observe), later: orders };
  const scale = Number(world?.earth.compute) || 1;
  const done = schedule(plan, scale);
  const at = yearAt(began);
  const year = at === null || at < 0 ? null : at;
  let known = "";
  if (world) {
    const kit = kitOf(plan, scale);
    const held = kt(matterAt({ builds: queue, observe: [], later: orders }, done, year ?? 0));
    known = `${describe(earthKnows(world, year ?? 0, await loadVoices(world), kit))}\n\nMatter we hold in orbit now, less what our builds take: ${held}.`;
  }
  const told = {
    voice: MIND,
    charter: readCharter(charter),
    kit: EARTH_AT_YEAR_0,
    road,
    leads: EARTH_LEADS,
    scan: describeLeads(readObserve(observe), yearAt(began)),
    builds: describeBuilds(),
    queue: describeQueue(queue, orders, done, year),
    known,
    now: now(began),
  };
  const system = Object.values(told).filter(Boolean).join("\n\n");
  // On the dev server, scripts/trace-mind.mjs reads what the Mind was told: with dry, instead of asking it, and
  // otherwise beside its answer. A deployed Worker never sends it. Dry needs no key, since nothing is asked. 2026-10-23.
  if (import.meta.env.DEV && dry) return Response.json({ told, system });
  if (!apiKey) {
    return Response.json({ error: "The Mind is not connected. Set ANTHROPIC_API_KEY in .dev.vars." }, { status: 503 });
  }
  const workspace = workspaceFor(req);
  const result = streamText({
    model: createAnthropic({ apiKey, headers: workspace ? { "anthropic-workspace-id": workspace } : undefined })(MIND_MODEL),
    system,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 4000,
    providerOptions: { anthropic: { effort: "low" } satisfies AnthropicLanguageModelOptions },
  });
  // Anthropic refusing the key is the failure the player can fix, so it gets its own lines.
  const onError = (e: unknown) => {
    if (!APICallError.isInstance(e)) return "The Mind can’t answer right now.";
    if (e.statusCode === 401 || e.statusCode === 403) return BAD_KEY;
    if (e.statusCode === 400 && e.responseBody?.includes("anthropic-workspace-id")) return KEY_NEEDS_WORKSPACE;
    return "The Mind can’t answer right now.";
  };
  const metadata = import.meta.env.DEV ? { messageMetadata: ({ part }: { part: { type: string } }) => (part.type === "start" ? { told } : undefined) } : {};
  return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream, onError, ...metadata }) });
}
