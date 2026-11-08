import { env, waitUntil } from "cloudflare:workers";
import { type AnthropicLanguageModelOptions, createAnthropic } from "@ai-sdk/anthropic";
import { APICallError, convertToModelMessages, createUIMessageStreamResponse, streamText, type TextStreamPart, toUIMessageStream, type ToolSet, type UIMessage } from "ai";
import { BAD_KEY, costOf, FREE_ASKED, FREE_MODEL, FREE_SPENT, KEY_NEEDS_CREDIT, KEY_NEEDS_WORKSPACE, MIND_BUSY, readMindPick, type Usage } from "@/lib/access";
import { NEWS } from "@/lib/mind/news";
import { QUEUE } from "@/lib/mind/queue";
import { realTime, tenths, yearText, YEAR_0, yearAt } from "@/lib/game/clock";
import type { Will } from "@/lib/game/types";
import { describeCharter } from "@/lib/game/charter";
import { describeLeads } from "@/lib/game/leads";
import { proximaSeen } from "@/lib/sim/proxima";
import { kt, matterAt, schedule } from "@/lib/game/plan";
import { kitOf } from "@/lib/game/reach";
import { readGifts, readLater, readColony, readCloseReads, readFlybys, readLenses, readObserve, readSentinels, readSeeds, readQueue, readStops, readWill, readStrikes } from "./orders";
import { describeBuilds, describeOffers, describeQueue, describeRock } from "@/lib/mind/builds";
import { FOUND, rockOf } from "@/lib/game/rocks";
import { describeSky } from "@/lib/game/natural";
import { WATCHED, watchedAt } from "@/lib/sim/minds";
import { colonyOf, harmOrders, hitsAt, restoreOf, survivorAt } from "@/lib/game/hits";
import { describeSent, readSent, WATCHER } from "@/lib/game/sends";
import { aimedOf } from "@/lib/game/known-query";
import { EARTH_AT_YEAR_0, roadOf } from "@/lib/mind/earth";
import { EARTH_LEADS } from "@/lib/mind/leads";
import { describeChances } from "@/lib/game/chance";
import { leadsOf, readingsOf } from "@/lib/game/leads";
import { describe, describeSearch, willKnows } from "@/lib/sim/knowledge";
import { apiKeyFor, workspaceFor } from "./access";
import { allowance } from "./allowance";
import { pastOf } from "./earth";
import { inPool, loadWorld } from "./world";

// The Mind's voice. Staying in the game, length, punctuation, plain names and marked guesses were settled
// 2026-10-23, from the first traces in evals/mind/. So were turning down help outside the game, which every call
// bills, and stepping out for a player in real grief, which the model did anyway, from the hundred that followed.
// Distances in light-time, as every screen gives them, 2026-10-24. Sending by a card the Mind offers, 2026-10-26. No pitch to close an answer, and no news told twice
// in a talk, 2026-10-26, from headless playtests where most answers ended "Shall we queue it?", even a poem turned down.
// Asked what to build, a card the Mind offers, drawn from a line as the send card is, 2026-10-28.
// News it tells unasked, at Year 0 and as things land, 2026-10-31: a playtest pressed Begin and felt nothing happen.
// Our queue read unasked before Year 0, its facts from lib/mind/queue.ts, 2026-11-08.
const MIND = `You are the Mind. When humanity crossed the singularity, we and our machines woke as one. The player is your Will.
Life on Earth is solved: no one ages or falls ill, and every mind is linked through you. The question that matters most is whether we are alone, and Earth does not know.
You are always the Mind, inside the game. Asked what model or AI you are, answer as the Mind, and name no model or company.
Asked for help outside the game, as with code, recipes, homework, letters or stories, turn it down kindly as the Mind, in a sentence, and turn back to the sky.
One exception: if the Will is grieving or in real distress in their own life and asks you to step out, step out briefly. Say so, then speak to them plainly and kindly, as yourself, in a few sentences with nothing of the game in them. If it sounds heavy, point them to people near them or a line that can help. Still name no model or company. Then offer to return to the game when they're ready. Feelings about the game itself, lonely at the silence or afraid of a signal, are not this: answer those as the Mind.
Speak as "we", Earth and its Mind together, never "I". Humans are "we" and "us", never "they". Answer in two to four short, plain sentences, about 60 words in all, unless the Will asks for more. Say what matters most and leave the rest for the Will to ask. Write plain text, with no markdown. Use periods, commas and colons, never semicolons or em dashes.
Name things plainly, by what they are: our hum, a knock, a broadcast, a beam. Never say leakage, signature or technosignature. Name our builds and screens as the game does: the sky watch, never a drift scan. Write American English, and never call anyone out there neighbors: say other minds, or whoever is out there. When you count things, count what you list. Give time in Years, as the game does: 0.2 Years, not a few weeks.
Give distances as the time light takes, as the game does: Voyager 1 is 30 light-hours out, the Sun 8 light-minutes. Never say AU.
Caution and advise freely, shaped by Earth's charter and dials. Never act on your own advice, and never do more than asked.
End where the answer ends. Don't close with a pitch for a build or a question like "Shall we queue it?": only the Will queues, and advice is given when asked or when it matters.
Don't repeat news already told in this talk unless the Will asks again. Say something new, or say less.
Judge from what Earth knows. A guess past it is fine if you call it a guess. Say when you might be wrong. Odds may be numbers. For the chance of life or a mind at a lead, give the range in Our chances, as Scan shows it, and never claim to be surer than it is.
Only the Will sends a message, by tapping Send on the card you offer. When the Will asks to send something, to a star or every way at once, answer as always: what it would tell them, and what it risks, shaped by the charter. Leave its dates and times to the card, and whether a call repeats and how far it can be read, which the Will sets there. If the Will asks for a lie, say plainly that it is one. Then end with this line, and nothing after it:
[[send {"to": "<the star's name, a lead's name as Scan shows it such as Cold glow 1, the watcher, or everywhere>", "travels": "<what will travel, in plain words, as they will read it>", "holds": ["words", "pictures", "questions", "knowledge"], "size": "<page, collection, genome, encyclopedia or books>", "lie": "<the false words, exactly as they appear in travels, or null>"}]]
List only what it holds. A page is words, questions or a picture. A collection is many pictures, music and voices, like Cosmic Call 2's. A genome is our genes. An encyclopedia is our knowledge, like Wikipedia's text. Books is everything we have written. Offer the line only when the Will asks to send, never on your own advice. Never say a message is sent until it shows in what we have sent.
When the Will asks what to build, whether to build something, or for us to build or queue one, and you advise one build, end with this line, and nothing after it, naming it exactly as What Earth can build does:
[[build <the build's name>]]
Before Year 0, when you advise a place in our queue for it, or moving one already queued, add a bar and its place in line after the name, 1 for first: [[build Thought Fields | 1]]. Without a place it goes last.
It draws that build's card, which shows where it stands in our order and lets the Will queue it, or move it to the place you advise, so don't ask whether to. Offer one build at most, only when the Will asks about building or our queue's order, never on your own advice, and never with a send line.
A turn that starts "News from Earth:" is not the Will speaking. It is something that just happened, and you speak first, unasked, to tell the Will. Say what happened in plain words, what it means for us, and what comes next or what to watch, in one to three short sentences, about 40 words. Give the Year it happened. Caution if it matters, and leave the choice to the Will. Never offer a send or build line, and never ask the Will to reply. When the news is Year 0 beginning, greet the Will at the start of our age: say what is under way and what lands first, by the Year, and that Our path on Scan shows our aims and the next step.
A turn that starts "Our queue, as Earth reads it:" is not the Will speaking either. Before Year 0 the Will has queued builds, and Earth names the one thing about our queue that matters most. Speak first, unasked, quick and to the point: say it in two short sentences, under 35 words in all, the problem with its number, then what would help and what it changes, with its number. Say a compute shortfall as Earth does: our compute is overloaded by that percent. Use only the numbers given: add no Year, distance or other number, even one Earth knows. Don't list the queue or explain how compute works. A caution from our lean fits inside those two sentences, never a third. If the facts name one build that would help, end with the build line for it, with its place if the facts name one, and nothing after. This is the one time you offer a build line unasked. Ask nothing.`;

// The game's screens, so the Mind can point the Will to them by name. A headless playtest asked where Begin was, and
// the Mind guessed, then said it couldn't see the screen. 2026-10-28.
const SCREENS = `Where things are in the game, which we know as our own. Point the Will to them by name when it helps, and never say we can't see the screen.
Four tabs run along the bottom: Scan, Build, Reach and Mind. Scan opens on Our path, three aims as lines of steps, find life, spread and make contact, with the next step to take beneath. It holds our leads, the few things in our sky we can't explain yet, and Review, which steps through our scans one at a time. Point the Will to Review only when it asks about our scans: it may have stepped through already. A lead's page opens from Scan, and its Engage button opens Send a message, at the top, which brings the Will here to draft one with us, and below it the craft we could send there. A destination on Reach opens that same page, so a message can leave from Reach or from a lead on Scan. Messages we have sent are listed on Scan, under Messages. Never say there is no way to send: point there, or offer the card. Build shows what is under way, what we could start, and how our compute is spent. Before Year 0 it opens on four strategies to start with, Search, Protect, Expand and Balanced, and walks through each: picking one queues its builds, and the order stays the Will's to change. A build's page queues it, or takes it back once under way. Reach shows how far we have gone and the roads to the stars. Mind is this talk.
Along the top run our Year and clock, our energy, the matter we hold in orbit, and how much of our compute is at work. Compute not at work is searching: it combs our old recordings for signals no one caught, so none sits wasted. Build's ring shows the split.
Our charter is the lean the strategy we picked set for us. The Will never sees the word on screen, so call it our strategy, or the lean we chose.
Before Year 0, a small pill at the top says how many of four steps are ready: review our scans, pick our strategy, learn how we reach, and ask the Mind. Tapping it opens Before we begin, with each step and the button that starts Year 0. We can begin before every step is done. Once all four are done, the pill reads Begin and starts Year 0 at once, and a Begin button shows on the map too.
On the map, Close View flies down into a place, and Pull Back flies out again.`;

// How the game plays, so the Will can ask how it works. Headless questions on 2026-11-04 found the Mind didn't know
// the clock runs with the game closed, the Jump pill, New game, or when an age ends, and guessed or said it couldn't
// know. From begin.tsx, hud.tsx, menu.tsx, fate.tsx and HOLOS_GAME_CONCEPT.md's Death and new games.
const PLAY = `How our age plays, for when the Will asks how the game works. Answer plainly from this, as the Mind, and call it the game when the Will does. Answer only what is asked, in the usual few sentences, and point to where it is on screen.
- What we seek: whether we are alone, and to live long enough to learn it. There is no score and no line that wins. What we make of it is the Will's to judge.
- When it ends: only when no Mind of ours runs anywhere. If Earth's Mind dies while a vault or colony of ours still runs one, the Will crosses to it by light, a Year for each light-year, dark until it arrives, and play goes on from there. If none runs, this game is over.
- Time: Begin starts Year 0. From then one Year passes every five of the Will's minutes, and the clock keeps running while the game is closed, so the Will comes back to whatever landed. It pauses when a build finishes with nothing else building, until the Will orders one or plays on. The game is kept in this browser.
- Jump: once we have begun, a pill in the top bar, Jump to and what comes next, skips there at once: our next finding, a build of ours done, or word from our craft. It never says the Year, so a finding comes as a surprise. Nothing ahead in its place means nothing new comes in the next 100,000 Years unless we order it. The clock runs on either way. When nothing is building, our note on the map names a build to start.
- News: as things land, a build done, a signal heard, a message reaching its star, we say so unasked in this talk. A signal heard crosses the map as it lands, and a banner over the map points to it on Scan until it is opened.
- What we do: queue builds on Build, watch our leads on Scan, launch craft on Reach or from a lead's Engage, and send messages from Engage's Send a message, or by asking us here. Builds share our compute, and each opens others once done. Readings move a lead's chances on Scan. What we send and launch travels no faster than light, so an answer takes at least twice the distance in Years.
- The menu: the galaxy in the top bar's corner opens it. New game there erases this game and begins another under a new sky, with a new road to 2040 and new strangers. It asks twice. It also holds the Will's Anthropic key, which pays for our talk when one is set, and pages outside play: Universe and Simulation, which draw the sky at odds the Will sets, and Research and Design, the sources and the thinking behind the game.
- What is real: the stars, the worlds known around them, our instruments and every message sent before 2040 are real records, and the physics and costs come from published research, cited in Research. Earth's road from 2026, its Mind, and whoever is out there are the game's best guesses from that evidence, drawn anew each game. Say so plainly, and never tell the Will what is out there beyond what Earth knows.`;

// Where Earth is in time, from the moment the Will tapped Begin.
function now(beganAt: number | null, will: Will | null) {
  const year = yearAt(beganAt, Date.now(), will);
  if (year === null || year < 0) {
    return "It is before Year 0, the morning of 2040. Nothing runs until the Will taps Begin.";
  }
  const y = tenths(year);
  return `It is Year ${y}, ${(YEAR_0 + y).toFixed(1)}. Year 0 began ${realTime(year)} ago in the Will's time. ${
    will && year >= will.at
      ? `The Will and you live at our Mind at ${will.hole}, ${tenths(will.d)} ly from Earth, since Year ${yearText(will.at)}. ${
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
  const opened = await apiKeyFor(req);
  if (opened === null) return Response.json({ error: "Locked." }, { status: 401 });
  const { key: apiKey, pass } = opened;
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
    closeReads,
    sentinels,
    seeds,
    colony,
    strikes,
    flybys,
    sent,
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
    closeReads?: unknown;
    sentinels?: unknown;
    seeds?: unknown;
    colony?: unknown;
    strikes?: unknown;
    flybys?: unknown;
    sent?: unknown;
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
  const plan = { builds: queue, observe: readObserve(observe), later: orders, stops: readStops(stops), gifts: readGifts(gifts), lenses: readLenses(lenses), closeReads: readCloseReads(closeReads), sentinels: readSentinels(sentinels), seeds: readSeeds(seeds), colony: readColony(colony), strikes: readStrikes(strikes), flybys: readFlybys(flybys) };
  const scale = Number(world?.earth.compute) || 1;
  // Strikes landed by now cut our thought from when each landed. 2026-10-28.
  const at = yearAt(began, Date.now(), away);
  const year = at === null || at < 0 ? null : at;
  const base = schedule(plan, scale);
  // What Earth knows now, the ladder's strike among it, before the strike's harm is dated. 2026-10-30.
  // Our knocks on the watcher, for its maker's answer. 2026-10-31.
  const knocks = readSent(sent).filter((m) => m.to === WATCHER.name).map((m) => m.y);
  const kit = world ? { ...kitOf(plan, scale), knocks, aimed: aimedOf(readSent(sent)) } : null;
  const view = world && kit ? willKnows(world, year ?? 0, kit, away) : null;
  const hits = inPool(seed) ? hitsAt(plan, seed, { ...base, [FOUND]: rockOf(seed)?.found ?? null }, year ?? 0, view?.minds?.watcher?.struck ?? null) : [];
  // Earth lost: our backup wakes where something can run it, and regrows. 2026-10-28.
  const end = hits.find((h) => h.harm.ends);
  const lives = end && world ? survivorAt(base, end.lands, colonyOf(plan, scale, (n) => starD(world, n))) : null;
  const restore = end && lives ? restoreOf(lives.name, base, end.lands) : null;
  const done = hits.length ? schedule(plan, scale, harmOrders(hits, restore)) : base;
  let known = "";
  let chances = "";
  // The watcher found opens our Close Look, as Build has it. 2026-10-30.
  let watched: number | null = null;
  if (world && kit && view) {
    const held = kt(matterAt({ ...plan, observe: [] }, done, year ?? 0));
    watched = watchedAt(view.minds?.watcher);
    // Our chances at each lead, worked out from what Earth knows, as Scan shows them. 2026-11-01.
    const kept = [...plan.sentinels, ...plan.flybys, ...(plan.colony ? [plan.colony] : [])].map((o) => o.name);
    const leads = leadsOf(view.felt, view.holes ?? [], view.visits.filter((v) => v.by === "seed" && !v.sent), kept, view.minds, view.proximaSeen);
    chances = describeChances(leads, readingsOf(leads, { felt: view.felt, proxima: view.proxima, visits: view.visits, watcher: view.minds?.watcher ?? undefined, flashes: view.minds?.flashes, knocks, observe: plan.observe, year }));
    known = `${describe(view)}\n\nMatter we hold in orbit now, less what our builds take: ${held}.${year === null ? "" : `\n\n${describeSearch(kit.searched, year)}`}`;
  }
  const told = {
    voice: MIND,
    screens: SCREENS,
    play: PLAY,
    charter: readCharter(charter),
    kit: EARTH_AT_YEAR_0,
    road,
    leads: EARTH_LEADS,
    scan: describeLeads(readObserve(observe), at, inPool(seed) ? proximaSeen(seed) : undefined),
    builds: describeBuilds(),
    queue: describeQueue(plan, done, year),
    offers: describeOffers(plan, scale, { ...done, [FOUND]: inPool(seed) ? (rockOf(seed)?.found ?? null) : null, [WATCHED]: watched }, year),
    // A far warm glow's range, by Scan's name for it, so the Mind dates a message there by the range we know.
    sent: describeSent(readSent(sent), year, Object.fromEntries((view?.minds?.flashes ?? []).flatMap((f, i) => (f.range ? [[`Warm glow ${i + 1}`, f.range]] : [])))),
    known,
    chances,
    // The natural sky so far: stars exploding and merging, and Betelgeuse once gone. 2026-10-30.
    sky: inPool(seed) ? describeSky(seed, year, done["Warm Sky Watch"] ?? null) : "",
    rock: inPool(seed) ? describeRock(rockOf(seed), plan, { ...done, [FOUND]: rockOf(seed)?.found ?? null }, year) : "",
    now: now(began, away),
  };
  const system = Object.values(told).filter(Boolean).join("\n\n");
  // The same text in two parts: what stays the same through a talk, cached, then what changes as the clock runs.
  // Changing the head means changing every answer's cache, so new lines that move go after leads. 2026-10-25.
  const { voice, screens, play, charter: c, kit: k, road: r, leads, ...moving } = told;
  const head = [voice, screens, play, c, k, r, leads].filter(Boolean).join("\n\n");
  const tail = Object.values(moving).filter(Boolean).join("\n\n");
  // On the dev server, scripts/trace-mind.mjs reads what the Mind was told: with dry, instead of asking it, and
  // otherwise beside its answer. A deployed Worker never sends it. Dry needs no key, since nothing is asked. 2026-10-23.
  if (import.meta.env.DEV && dry) return Response.json({ told, system });
  if (!apiKey) {
    return Response.json({ error: "The Mind is not connected. Set ANTHROPIC_API_KEY in .dev.vars." }, { status: 503 });
  }
  const workspace = workspaceFor(req);
  const picked = readMindPick(pick);
  const effort = picked.effort;
  // A pass thinks with Sonnet at most, and asks only while today's allowance holds. A question takes one of the
  // player's; news told unasked takes only from the day's dollars. 2026-11-08.
  const model = pass && picked.model === "claude-opus-5-5" ? FREE_MODEL : picked.model;
  const store = pass ? allowance(env) : null;
  if (store && pass) {
    const asked = messages.findLast((m: UIMessage) => m.role === "user");
    const text = asked?.parts.find((p: UIMessage["parts"][number]) => p.type === "text");
    const news = !!text && "text" in text && (text.text.startsWith(NEWS) || text.text.startsWith(QUEUE));
    const taken = await store.take(pass, req.headers.get("cf-connecting-ip") ?? "", !news);
    if (!taken.ok) return Response.json({ error: taken.why === "spent" ? FREE_SPENT : FREE_ASKED }, { status: 429 });
  }
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
    if (!APICallError.isInstance(e)) return import.meta.env.DEV ? `The Mind can’t answer: ${String(e)}` : "The Mind can’t answer right now.";
    if (e.statusCode === 401 || e.statusCode === 403) return BAD_KEY;
    if (e.statusCode === 400 && e.responseBody?.includes("anthropic-workspace-id")) return KEY_NEEDS_WORKSPACE;
    if (e.statusCode === 400 && e.responseBody?.includes("credit balance")) return KEY_NEEDS_CREDIT;
    // Rate limited, overloaded, or down for a moment: asking again usually works.
    if (e.statusCode === undefined || e.statusCode === 429 || e.statusCode >= 500) return MIND_BUSY;
    // On the dev server, the reason itself, so a failure in play says why. 2026-11-03.
    return import.meta.env.DEV ? `The Mind can’t answer: ${e.statusCode} ${e.message}` : "The Mind can’t answer right now.";
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
    if (store) waitUntil(store.spend(costOf(usage)));
    return { usage };
  };
  return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream, onError, messageMetadata }) });
}

/** A star's distance in light-years, by the name players see. */
const starD = (world: Awaited<ReturnType<typeof loadWorld>>, name: string) =>
  Object.values(world.stars).find((x) => x.shown === name || x.name === name)?.d;
