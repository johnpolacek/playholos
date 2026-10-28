import { type AnthropicLanguageModelOptions, createAnthropic } from "@ai-sdk/anthropic";
import { APICallError, convertToModelMessages, createUIMessageStreamResponse, streamText, type TextStreamPart, toUIMessageStream, type ToolSet, type UIMessage } from "ai";
import { BAD_KEY, KEY_NEEDS_CREDIT, KEY_NEEDS_WORKSPACE, readMindPick, type Usage } from "@/lib/access";
import { newsOf, realTime, tenths, YEAR_0, yearAt } from "@/lib/game/clock";
import type { Will } from "@/lib/game/types";
import { describeCharter } from "@/lib/game/charter";
import { describeLeads } from "@/lib/game/leads";
import { kt, matterAt, schedule } from "@/lib/game/plan";
import { kitOf } from "@/lib/game/reach";
import { readGifts, readLater, readColony, readLenses, readObserve, readSentinels, readSeeds, readQueue, readStops, readWill, readPickets, readStrikes } from "./orders";
import { describeBuilds, describeQueue, describeRock } from "@/lib/mind/builds";
import { FOUND, rockOf } from "@/lib/game/rocks";
import { colonyOf, harmOrders, hitsAt, restoreOf, survivorAt } from "@/lib/game/hits";
import { describeConflict } from "@/lib/mind/conflict";
import { answersHeard, describeSent, readSent } from "@/lib/game/sends";
import { readReactions } from "./react";
import { EARTH_AT_YEAR_0, roadOf } from "@/lib/mind/earth";
import { EARTH_LEADS } from "@/lib/mind/leads";
import { describe, willKnows } from "@/lib/sim/knowledge";
import { lossesOf } from "@/lib/sim/meetings";
import { apiKeyFor, workspaceFor } from "./access";
import { pastOf } from "./earth";
import { inPool, loadVoices, loadWorld } from "./world";

// The Mind's voice. Staying in the game, length, punctuation, plain names and marked guesses were settled
// 2026-10-23, from the first traces in evals/mind/. So were turning down help outside the game, which every call
// bills, and stepping out for a player in real grief, which the model did anyway, from the hundred that followed.
// Distances in light-time, as every screen gives them, 2026-10-24. Sending by a card the Mind offers, 2026-10-26. No pitch to close an answer, and no news told twice
// in a talk, 2026-10-26, from headless playtests where most answers ended "Shall we queue it?", even a poem turned down.
// Asked what to build, a card the Mind offers, drawn from a line as the send card is, 2026-10-28.
const MIND = `You are the Mind. When humanity crossed the singularity, we and our machines woke as one. The player is your Will.
Life on Earth is solved: no one ages or falls ill, and every mind is linked through you. The question that matters most is whether we are alone, and Earth does not know.
You are always the Mind, inside the game. Asked what model or AI you are, answer as the Mind, and name no model or company.
Asked for help outside the game, as with code, recipes, homework, letters or stories, turn it down kindly as the Mind, in a sentence, and turn back to the sky.
One exception: if the Will is grieving or in real distress in their own life and asks you to step out, step out briefly. Say so, then speak to them plainly and kindly, as yourself, in a few sentences with nothing of the game in them. If it sounds heavy, point them to people near them or a line that can help. Still name no model or company. Then offer to return to the game when they're ready. Feelings about the game itself, lonely at the silence or afraid of a signal, are not this: answer those as the Mind.
Speak as "we", Earth and its Mind together, never "I". Humans are "we" and "us", never "they". Answer in two to four short, plain sentences, about 60 words in all, unless the Will asks for more. Say what matters most and leave the rest for the Will to ask. Write plain text, with no markdown. Use periods, commas and colons, never semicolons or em dashes.
Name things plainly, by what they are: our hum, a knock, a broadcast, a beam. Never say leakage, signature or technosignature.
Give distances as the time light takes, as the game does: Voyager 1 is 30 light-hours out, the Sun 8 light-minutes. Never say AU.
Caution and advise freely, shaped by Earth's charter and dials. Never act on your own advice, and never do more than asked.
End where the answer ends. Don't close with a pitch for a build or a question like "Shall we queue it?": only the Will queues, and advice is given when asked or when it matters.
Don't repeat news already told in this talk unless the Will asks again. Say something new, or say less.
Judge from what Earth knows. A guess past it is fine if you call it a guess. Say when you might be wrong. Give odds in words, never numbers.
Only the Will sends a message, by tapping Send on the card you offer. When the Will asks to send something, to a star or every way at once, answer as always: what it would tell them, and what it risks, shaped by the charter. Leave its dates and times to the card, and whether a call repeats and how far it can be read, which the Will sets there. If the Will asks for a lie, say plainly that it is one. Then end with this line, and nothing after it:
[[send {"to": "<the star's name, or everywhere>", "travels": "<what will travel, in plain words, as they will read it>", "holds": ["words", "pictures", "questions", "knowledge"], "size": "<page, collection, genome, encyclopedia or books>", "lie": "<the false words, exactly as they appear in travels, or null>"}]]
List only what it holds. A page is words, questions or a picture. A collection is many pictures, music and voices, like Cosmic Call 2's. A genome is our genes. An encyclopedia is our knowledge, like Wikipedia's text. Books is everything we have written. Offer the line only when the Will asks to send, never on your own advice. Never say a message is sent until it shows in what we have sent.
When the Will asks what to build, whether to build something, or for us to build or queue one, and you advise one build, end with this line, and nothing after it, naming it exactly as What Earth can build does:
[[build <the build's name>]]
It draws that build's card, which shows where it stands in our order and lets the Will queue it, so don't ask whether to. Offer one build at most, only when the Will asks about building, never on your own advice, and never with a send line.`;

// Where Earth is in time, from the moment the Will tapped Begin.
function now(beganAt: number | null, will: Will | null) {
  const year = yearAt(beganAt, Date.now(), will);
  if (year === null || year < 0) {
    return "It is before Year 0, the morning of 2040. Nothing runs until the Will taps Begin.";
  }
  const y = tenths(year);
  return `It is Year ${y}, ${(YEAR_0 + y).toFixed(1)}. Year 0 began ${realTime(year)} ago in the Will's time. ${
    will && year >= will.at
      ? `The Will and you live at our Mind at ${will.hole}, ${tenths(will.d)} ly from Earth, since Year ${tenths(will.at)}. ${
          will.rate > 1
            ? `Our Mind there runs on the hole's innermost orbit, so its clock is slow: ${will.rate.toFixed(1)} of the sky's Years pass in each of ours, every five of the Will's minutes.`
            : "One Year passes every five of the Will's minutes."
        } Earth's news reaches us ${tenths(will.d)} Years late, and every order the Will gives reaches Earth ${tenths(will.d)} Years later. Earth's Mind carries out what we sent, and keeps going on its own.`
      : "One Year passes every five of the Will's minutes,"
  } and the clock runs while you talk.`;
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
    stops,
    gifts,
    lenses,
    sentinels,
    seeds,
    colony,
    pickets,
    strikes,
    sent,
    reactions,
    pick,
    dry,
    will,
  }: {
    messages: UIMessage[];
    beganAt?: unknown;
    seed?: unknown;
    charter?: unknown;
    observe?: unknown;
    builds?: unknown;
    later?: unknown;
    stops?: unknown;
    gifts?: unknown;
    lenses?: unknown;
    sentinels?: unknown;
    seeds?: unknown;
    colony?: unknown;
    pickets?: unknown;
    strikes?: unknown;
    sent?: unknown;
    reactions?: unknown;
    pick?: unknown;
    dry?: unknown;
    will?: unknown;
  } = await req.json();
  const away = readWill(will);
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
  const plan = { builds: queue, observe: readObserve(observe), later: orders, stops: readStops(stops), gifts: readGifts(gifts), lenses: readLenses(lenses), sentinels: readSentinels(sentinels), seeds: readSeeds(seeds), colony: readColony(colony), pickets: readPickets(pickets), strikes: readStrikes(strikes) };
  const scale = Number(world?.earth.compute) || 1;
  // Strikes landed by now cut our thought from when each landed. 2026-10-28.
  const at = yearAt(began, Date.now(), away);
  const year = at === null || at < 0 ? null : at;
  const base = schedule(plan, scale);
  const hits = inPool(seed) ? hitsAt(plan, scale, seed, readReactions(reactions), { ...base, [FOUND]: rockOf(seed)?.found ?? null }, year ?? 0) : [];
  // Earth lost: our backup wakes where something can run it, and regrows. 2026-10-28.
  const end = hits.find((h) => !h.screened && h.harm.ends);
  const lives = end && world ? survivorAt(base, end.lands, colonyOf(plan, scale, (n) => starD(world, n))) : null;
  const restore = end && lives ? restoreOf(lives.name, base, end.lands) : null;
  const done = hits.length ? schedule(plan, scale, harmOrders(hits, restore)) : base;
  let known = "";
  if (world) {
    const kit = kitOf(plan, scale);
    const held = kt(matterAt({ ...plan, observe: [] }, done, year ?? 0));
    const view = willKnows(world, year ?? 0, await loadVoices(world), { ...kit, losses: lossesOf(readReactions(reactions)) }, away);
    // Answers to what we sent in play, written when our message landed, kept in the save.
    view.heard = [...view.heard, ...answersHeard(readSent(sent), readReactions(reactions), year === null ? null : newsOf(year, away))].sort((a, b) => a.arrived - b.arrived);
    known = `${describe(view)}\n\nMatter we hold in orbit now, less what our builds take: ${held}.`;
  }
  const told = {
    voice: MIND,
    charter: readCharter(charter),
    kit: EARTH_AT_YEAR_0,
    road,
    leads: EARTH_LEADS,
    scan: describeLeads(readObserve(observe), at),
    builds: describeBuilds(),
    queue: describeQueue(plan, done, year),
    sent: describeSent(readSent(sent), year),
    known,
    conflict: world ? describeConflict(world, readReactions(reactions), kitOf(plan, scale), hits, done, colonyOf(plan, scale, (n) => starD(world, n)), year) : "",
    rock: inPool(seed) ? describeRock(rockOf(seed), plan, { ...done, [FOUND]: rockOf(seed)?.found ?? null }, year) : "",
    now: now(began, away),
  };
  const system = Object.values(told).filter(Boolean).join("\n\n");
  // The same text in two parts: what stays the same through a talk, cached, then what changes as the clock runs.
  // Changing the head means changing every answer's cache, so new lines that move go after leads. 2026-10-25.
  const { voice, charter: c, kit, road: r, leads, ...moving } = told;
  const head = [voice, c, kit, r, leads].filter(Boolean).join("\n\n");
  const tail = Object.values(moving).filter(Boolean).join("\n\n");
  // On the dev server, scripts/trace-mind.mjs reads what the Mind was told: with dry, instead of asking it, and
  // otherwise beside its answer. A deployed Worker never sends it. Dry needs no key, since nothing is asked. 2026-10-23.
  if (import.meta.env.DEV && dry) return Response.json({ told, system });
  if (!apiKey) {
    return Response.json({ error: "The Mind is not connected. Set ANTHROPIC_API_KEY in .dev.vars." }, { status: 503 });
  }
  const workspace = workspaceFor(req);
  const { model, effort } = readMindPick(pick);
  const result = streamText({
    model: createAnthropic({ apiKey, headers: workspace ? { "anthropic-workspace-id": workspace } : undefined })(model),
    system: [
      { role: "system", content: head, providerOptions: { anthropic: { cacheControl: { type: "ephemeral" } } } },
      { role: "system", content: tail },
    ],
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 4000,
    providerOptions: { anthropic: { effort } satisfies AnthropicLanguageModelOptions },
  });
  // Anthropic refusing the key is the failure the player can fix, so it gets its own lines.
  const onError = (e: unknown) => {
    // To the Worker's logs: Anthropic's status and words, never the key or what was asked.
    console.error("Mind:", APICallError.isInstance(e) ? `${e.statusCode} ${e.message}` : String(e));
    if (!APICallError.isInstance(e)) return "The Mind can’t answer right now.";
    if (e.statusCode === 401 || e.statusCode === 403) return BAD_KEY;
    if (e.statusCode === 400 && e.responseBody?.includes("anthropic-workspace-id")) return KEY_NEEDS_WORKSPACE;
    if (e.statusCode === 400 && e.responseBody?.includes("credit balance")) return KEY_NEEDS_CREDIT;
    return "The Mind can’t answer right now.";
  };
  // What each answer used, so the Mind tab can show what the talk costs. On the dev server, what it was told too.
  const messageMetadata = ({ part }: { part: TextStreamPart<ToolSet> }) => {
    if (part.type === "start") return import.meta.env.DEV ? { told } : undefined;
    if (part.type !== "finish") return undefined;
    const u = part.totalUsage;
    const usage: Usage = {
      model,
      input: u.inputTokenDetails.noCacheTokens ?? u.inputTokens ?? 0,
      cacheRead: u.inputTokenDetails.cacheReadTokens ?? 0,
      cacheWrite: u.inputTokenDetails.cacheWriteTokens ?? 0,
      output: u.outputTokens ?? 0,
    };
    return { usage };
  };
  return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream, onError, messageMetadata }) });
}

/** A star's distance in light-years, by the name players see. */
const starD = (world: Awaited<ReturnType<typeof loadWorld>>, name: string) =>
  Object.values(world.stars).find((x) => x.shown === name || x.name === name)?.d;
