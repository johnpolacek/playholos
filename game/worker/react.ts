import { type AnthropicLanguageModelOptions, createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { readMindPick } from "@/lib/access";
import { yearAt } from "@/lib/game/clock";
import { kitOf } from "@/lib/game/reach";
import { readSent } from "@/lib/game/sends";
import type { Size } from "@/lib/game/types";
import { aimedYears, SIZES } from "@/lib/sim/messages";
import type { Reaction } from "@/lib/game/types";
import { between, CALL_REACH, describeMove, type Landing, landings, SOL, SPEAKS, sendsTo, budgetAt } from "@/lib/sim/answers";
import { actsOf, strikesOnUs } from "@/lib/sim/conflict";
import { crafts, ends, type Notice } from "@/lib/sim/meetings";
import type { World } from "@/lib/sim/types";
import { apiKeyFor, workspaceFor } from "./access";
import { readColony, readWill, readGifts, readLater, readObserve, readQueue, readSentinels, readStops, readPickets, readStrikes } from "./orders";
import { inPool, loadWorld } from "./world";

// How a neighbor takes a message, ours or another neighbor's, decided on the fly once the game reaches the Year it
// lands. Settled 2026-10-26, HOLOS_GAME_CONCEPT.md's How neighbors play: its table offers a few moves by their odds,
// fresh each game, and the model, playing the neighbor, picks one in its character from all that has reached it, and
// writes what it sends. What it sends lands on others in turn. Sending needs the Mind, so this needs a key too. On the dev server with MIND_VIA=cli, the model is the claude CLI on your own login,
// through mind-cli.ts.

const DIAL: Record<string, string> = {
  O: "open: speaks, shares and lets itself be seen", H: "hidden: stays quiet and conceals",
  E: "expanding: reaches outward", D: "deepening: turns inward, to thought and knowledge",
  C: "cautious: looks before it acts", B: "bold: acts first and accepts danger",
};
const dials = (s: string) =>
  s.split(" ").map((d) => `${d[1] === "2" ? "strongly" : "leans"} ${DIAL[d[0]] ?? d}`).join(", ");

const VOICES = import.meta.glob<{ calls_sol?: string; hail?: string[]; close?: string[] }>("../../data/voices/*.json", { import: "default" });

/** How a neighbor names another world: Earth, which it knows by our messages' name, or by how far off it is. */
const nameFor = (world: World, star: string, other: string) =>
  other === SOL ? "Earth" : other === "everywhere" ? "every way at once" : `the world ${between(world, star, other).toFixed(1)} ly from you`;

/** The neighbor's side of it, for the model: who it is, all that has reached it, the message, and its choices. */
async function prompt(world: World, l: Landing, record: Reaction[]) {
  const p = l.neighbor;
  const voice = await VOICES[`../../data/voices/${p.name.toLowerCase()}.json`]?.();
  const awake = l.at >= p.waking;
  const one = (y: number) => (2040 + y).toFixed(1);
  const named = (x: string) => nameFor(world, l.star, x);
  const theirs = p.inbound.filter((i) => i.sent <= l.at).map((i) => `- ${i.what}, sent to Earth ${one(i.sent)}: you ${i.move}ed.`);
  // What reached it, from Earth or another world, what it chose, and what it sent where.
  const said = new Map(record.map((r) => [r.key, r.text]));
  const before = record
    .filter((r) => r.star === l.star && r.move !== "unheard")
    .map((r) => {
      // News of a craft at a dark mass, not a message. 2026-10-26.
      if (r.about) {
        const what = r.sent.startsWith("colony:") ? "a ship not yours that came to stay" : "a craft not yours";
        const hole = world.holes?.some((h) => `colony:${h.id}` === r.sent || `sentinel:${h.id}` === r.sent);
        return `- News reached you in ${one(r.at)} of ${what} ${hole ? "at a dark mass your craft watch" : "at a star where you live"}. You chose: ${r.move}.${r.text ? ` You sent to it: "${r.text}"` : ""}`;
      }
      const from = r.from ?? SOL;
      if (r.sent.startsWith("glow:"))
        return `- In ${one(r.at)} your watch found a grey glow at ${named(from)}: someone computing cold. You chose: ${r.move}.${r.text ? ` You sent to it: "${r.text}"` : ""}`;
      const words = from === SOL ? "" : said.get(r.sent) ? ` It read: "${said.get(r.sent)!.slice(0, 240)}"` : "";
      const to = sendsTo(r);
      return `- A message from ${named(from)} reached you in ${one(r.at)}.${words} You chose: ${r.move}.${r.doubts ? ` You doubted: ${r.doubts}` : ""}${r.text ? ` You sent ${to === from ? "back" : `to ${named(to)}`}: "${r.text}"` : ""}`;
    });
  const from = l.signal.from;
  const msg = l.signal.move === "glow"
    ? ""
    : !l.read
    ? `It is a call ${named(from)} sends every way at once. You notice it, but it is too faint here to read its words.`
    : `It reads: "${l.signal.text}"${l.signal.to === "everywhere" ? " It was sent every way at once, not to you alone." : " It was aimed at you."}`;
  // An elder knows its own age, and how it rests. 2026-10-28.
  const old = p.elder
    ? ` You are old: your Mind woke ${Math.round(-p.waking).toLocaleString("en-US")} years before Earth's, grew, and stopped growing long ago. ${p.elder.asleep ? "It has slept since, waiting for a colder universe, keeping only a watch for anything that comes into your system. What has reached you now has woken it." : "It computes cold and steady, far out from your star, and has for millennia."}`
    : "";
  const system = `You play a neighbor of Earth's in Holos, a game about whether Earth is alone. You are ${awake ? `the Mind of the world at ${l.star}` : `the people of the world at ${l.star}, whose Mind has not woken`}, ${p.d} light-years from Earth.${old} Other worlds may live around you too. Nothing travels faster than light.
Your character: ${dials(p.dials)}. Toward others you are a ${p.disposition}${(p as { style?: string }).style ? `, and your way is the ${(p as { style?: string }).style}` : ""}.${voice?.calls_sol ? ` You call Earth's Sun "${voice.calls_sol}".` : ""}${voice?.hail?.length ? `\nYour voice, from your own messages: ${[...voice.hail.slice(0, 2), ...(voice.close ?? []).slice(0, 1)].map((x) => `"${x}"`).join(" ")}` : ""}
You don't know Earth's names for stars, or yours. Judge only from what has reached you. Earth's radar has reached you since ${Math.round(1950 + p.d)}${p.heard ? ", and you heard it" : ""}.
What you can see of Earth for yourself, to weigh any claim against: ${p.heard ? "its radio is the noise of a whole world, radars and broadcasts from many places, loud enough to mean billions of voices and an industry to match. Its radars sweep as a planet turns, and a long listen gives its day and its year. " : "nothing but its star, until it sends. "}No craft of Earth's has come near your world, and nothing it sends travels faster than light, so it could not reach you in less than ${p.d} years. Of any other world you see only its star, and what it sends. A claim that fits none of this may be a lie, a hope, or a threat. Take it as you would.
A message is built to be read, but it takes time to send: a page goes in seconds, an archive takes Years. What you send is read once all of it has arrived, so write it as whole, never as still on its way.`;
  // Our acts, as they feel them. 2026-10-28.
  // Whose bullet, theirs or Earth's: neighbors strike each other too, by the same physics. 2026-10-28.
  const shooter = l.signal.from === SOL ? "Earth's Sun" : named(l.signal.from);
  const act: Record<string, string> = {
    struck: `A bullet from ${shooter}, ${l.d.toFixed(1)} light-years away, has struck your world at a tenth of light speed with about 110,000 Mt. A region of yours is gone, and the high air is torn worldwide. Its track points back to ${shooter}.`,
    screened: `A bullet from ${shooter}, ${l.d.toFixed(1)} light-years away, has burst on the pellet screen you set on that line, a flash high in your air and no harm. It came at a tenth of light speed with about 110,000 Mt.`,
    strike_seen: `Your probe watching ${shooter}, ${l.d.toFixed(1)} light-years away, has seen a launch flame there: a mass of about 1,000 t driven to a tenth of light speed, toward ${named(l.signal.to)}. That is a bullet, and it will land with about 110,000 Mt. No one farther off could have seen it.`,
    caught: "The probe you sent to Earth's Sun has gone dark as it braked in. Earth's craft met it there.",
    quiet: "Earth's radars, which you have heard sweep for decades, have stopped. A world that wakes may silence them, and so may one that dies. From here you can't tell which.",
  };
  const news = act[l.signal.move ?? ""] ?? (l.notice ? `${sighting(world, l.notice)}\nWhat you send goes to that ${l.notice.craft.kind === "sentinel" ? "craft" : "ship"}, ${l.notice.craft.atStar ? "at that star" : "at the dark mass"}.` : l.signal.move === "glow"
      ? `Your watch has found a grey glow at ${named(from)}, ${l.d.toFixed(1)} light-years away: heat near 12 K with no line in it, a color no dust gives. Cold computing far from a star would glow so: someone's Mind, most likely, and ${world.neighbors.some((n) => n.elder && (world.stars[n.star]?.shown ?? n.star) === from) ? "holding steady, not growing: an old one" : "growing"}. It carries no words, and says nothing of who they are.`
      : `A message from ${named(from)}, ${l.d.toFixed(1)} light-years away, has just reached you. ${msg}`);
  const user = `It is ${one(l.at)} on Earth's calendar. What has passed between you and others:
${[...theirs, ...before].join("\n") || "- Nothing yet."}

${news}

Choose one of these moves, and no other:
${l.offers.map((m) => `- ${m}: ${describeMove(m)}`).join("\n")}

Answer with JSON only: {"move": "<one of the moves>", "text": "<if the move sends something, the message itself, in your own voice, under 80 words, as it will be read, else null>", "size": "<what you send: page, collection, genome, encyclopedia or books, as big as what it carries>", "doubts": "<anything in the message you doubt, and why, from what you can see, else null>"}`;
  return { system, user };
}

/** What their craft at a black hole saw of ours, as news to the Mind that decides. Who came first decides what it
 *  could see: braking in, a fusion flame points back along its track, so its sender's star is plain. A craft found
 *  already there shows nothing of where it came from. 2026-10-26. */
function sighting(world: World, n: Notice) {
  const c = n.craft;
  if (c.atStar) return settling(n);
  const mass = world.holes?.find((h) => h.id === c.holeId)?.mass;
  const where = n.local
    ? `Your Mind that stays at the dark mass, a black hole of ${mass?.toFixed(0)} Suns, has seen something there.`
    : `News has just reached you from your craft at the dark mass ${n.hop.toFixed(1)} light-years from you, a black hole of ${mass?.toFixed(0)} Suns.`;
  const track = `Its track runs back to Earth's Sun, ${c.d.toFixed(1)} light-years from the hole.`;
  const saw =
    c.kind === "sentinel"
      ? n.first === "them"
        ? `A craft not yours braked to a stop there, a probe of a few hundred tonnes, its fusion flame pointed ahead as it slowed. ${track} It stays, and watches the hole. It has sent nothing to you.`
        : "Your craft, braking in, found a craft not yours already keeping station there, a probe of a few hundred tonnes, watching the hole. It came before you, so you never saw its flame, nor where it came from."
      : n.first === "them"
        ? `A ship not yours braked to a stop there, its fusion flame far bigger than a probe's, a ship of tens of thousands of tonnes. ${track} It has stayed. A ship that size carries a factory, or a Mind.`
        : c.mode === "furnace"
          ? "Your craft, braking in, found someone already living there: a disk of matter glowing round the hole, hot enough to shine in X-rays, and works round it taking its light. They are not yours. You never saw them come, nor where from."
          : "Your craft, braking in, found works not yours hidden in the hole's shadow: cold radiators and collectors, dark against the sky, dumping their heat into the hole. You never saw them come, nor where from.";
  return `${where} ${saw}`;
}

/** What a neighbor at a star saw of our Mind settling there: braking in on a flame far bigger than a probe's, its track
 *  back to Earth's Sun, then mining and building on the star's light. At their home, under their own sky. 2026-10-27. */
function settling(n: Notice) {
  const c = n.craft;
  const home = n.neighbor.star === c.holeId;
  const where = home
    ? "Over your own world, under your own sky, something has come."
    : n.local
      ? "Your Mind that stays at a star you settled has seen something there."
      : `News has just reached you from your colony at a star ${n.hop.toFixed(1)} light-years from you.`;
  const track = `Its track runs back to Earth's Sun, ${c.d.toFixed(1)} light-years away.`;
  const saw =
    n.first === "them"
      ? `A ship not yours braked to a stop ${home ? "in your system" : "there"}, its fusion flame far bigger than a probe's, a ship of tens of thousands of tonnes. ${track} It has stayed, and is mining the asteroids and building on the star's light. A ship that size carries a factory, or a Mind.`
      : "Your ship, braking in, found someone already living there: works not yours mining the asteroids and taking the star's light, and growing. You never saw them come, nor where from.";
  return `${where} ${saw}`;
}

/** The model's pick, checked against the offers. Anything else falls to the first offer, the likeliest. */
function readPick(text: string, l: Landing) {
  let d: { move?: unknown; text?: unknown; size?: unknown; doubts?: unknown } = {};
  try {
    d = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
  } catch {}
  const move = typeof d.move === "string" && l.offers.includes(d.move) ? d.move : l.offers[0];
  const said = SPEAKS.has(move) && typeof d.text === "string" && d.text.trim() ? d.text.trim().slice(0, 800) : undefined;
  const size: Size = typeof d.size === "string" && d.size in SIZES ? (d.size as Size) : move === "gift" ? "encyclopedia" : "page";
  const doubts = typeof d.doubts === "string" && d.doubts.trim() && d.doubts.trim() !== "null" ? d.doubts.trim().slice(0, 300) : undefined;
  // A call goes every way at once. All else goes back to the sender.
  const to = move === "call" ? "everywhere" : undefined;
  return { move, said, size, doubts, to };
}

/** Reactions from the save, checked, since they come from the browser. */
export const readReactions = (list: unknown): Reaction[] =>
  Array.isArray(list)
    ? list.filter((r): r is Reaction => !!r && typeof r.key === "string" && typeof r.star === "string" && typeof r.at === "number" && typeof r.d === "number" && typeof r.move === "string" && (r.text === undefined || typeof r.text === "string") && (r.doubts === undefined || typeof r.doubts === "string") && (r.from === undefined || typeof r.from === "string") && (r.to === undefined || typeof r.to === "string")).slice(0, 1024)
    : [];

export async function react(req: Request) {
  const apiKey = apiKeyFor(req);
  if (apiKey === null) return Response.json({ error: "Locked." }, { status: 401 });
  const { seed, beganAt, sent, reactions, pick, roll, builds, observe, later, stops, gifts, sentinels, colony, will, pickets, strikes } = (await req.json()) as Record<string, unknown>;
  if (!inPool(seed)) return Response.json({ error: "No such game." }, { status: 404 });
  const now = yearAt(typeof beganAt === "number" ? beganAt : null, Date.now(), readWill(will));
  if (now === null || now < 0) return Response.json({ reactions: [] });
  const done = readReactions(reactions);
  const world = await loadWorld(seed);
  // A test replays a game by holding its rolls. In play, each roll is fresh, and kept in the save once made.
  const held = import.meta.env.DEV && typeof roll === "string" ? roll : null;
  // A few at a time, oldest first, so one long night away doesn't ask a hundred at once.
  // Our craft at black holes, from our order as Build dates it, which their craft there may see. 2026-10-26.
  const plan = { builds: readQueue(builds), observe: readObserve(observe), later: readLater(later), stops: readStops(stops), gifts: readGifts(gifts), sentinels: readSentinels(sentinels), colony: readColony(colony) , pickets: readPickets(pickets), strikes: readStrikes(strikes) };
  const ours = crafts(world, kitOf(plan, Number(world.earth.compute) || 1));
  const kit = kitOf(plan, Number(world.earth.compute) || 1);
  const due = landings(world, readSent(sent), done, now, held, ours, actsOf(world, done, kit)).slice(0, 4);
  if (!due.length) return Response.json({ reactions: [] });
  const cli = import.meta.env.DEV && req.headers.get("x-holos-cli") === "1";
  if (!apiKey && !cli) return Response.json({ error: "The Mind is not connected. Set ANTHROPIC_API_KEY in .dev.vars." }, { status: 503 });
  const { model, effort } = readMindPick(pick);
  const workspace = workspaceFor(req);
  const ask = async (system: string, user: string) => {
    if (cli) {
      const res = await fetch(new URL("/__holos/cli", req.url), { method: "POST", body: JSON.stringify({ system, user, model, effort }) });
      return ((await res.json()) as { text: string }).text;
    }
    const { text } = await generateText({
      model: createAnthropic({ apiKey, headers: workspace ? { "anthropic-workspace-id": workspace } : undefined })(model),
      system,
      prompt: user,
      maxOutputTokens: 2000,
      providerOptions: { anthropic: { effort } satisfies AnthropicLanguageModelOptions },
    });
    return text;
  };
  const out: Reaction[] = [];
  // Moves the model has made on neighbors' news this game, against the budget.
  let spent = done.filter((r) => r.from && r.move !== "unheard").length;
  try {
    for (const l of due) {
      const from = l.signal.from === SOL ? {} : { from: l.signal.from };
      const n = l.notice;
      const about = n ? { about: `${n.craft.kind === "sentinel" ? "Our sentinel" : "Our Mind"} at ${n.craft.hole}` } : {};
      const base = { key: l.key, sent: l.signal.id, star: l.star, d: l.neighbor.d, at: l.at, ...from, ...about };
      if (l.missed) {
        out.push({ ...base, move: "unheard" });
        continue;
      }
      // Past the budget, a neighbor still moves by its odds, but what it says goes unwritten, so nothing spreads.
      if (l.signal.from !== SOL && spent >= budgetAt(now)) {
        out.push({ ...base, move: l.offers[0] });
        continue;
      }
      if (l.signal.from !== SOL) spent++;
      const { system, user } = await prompt(world, l, [...done, ...out]);
      const { move, said, size, doubts, to } = readPick(await ask(system, user), l);
      const r: Reaction = { ...base, move, ...(to ? { to } : {}), ...(doubts ? { doubts } : {}) };
      // A catch or a strike ends our craft at the hole.
      const end = n ? ends(n, move) : null;
      if (end !== null) r.ends = end;
      if (said && n && !to) {
        // Sent to our craft at the hole, which passes it home: their dishes' time over the hop, the hop, and the hole's
        // light-time to us.
        const hop = Math.max(n.hop, 0.01);
        Object.assign(r, { text: said, size, via: { star: n.craft.hole, d: n.craft.d }, arrives: l.at + l.neighbor.thinks + aimedYears(SIZES[size], hop) + n.hop + n.craft.d });
      } else if (said) {
        // What they send takes their dishes as long as ours, taken to be as strong. Earth hears it if aimed at us, or
        // sent every way at once from near enough: all of it, that much later. 2026-10-26.
        const target = sendsTo(r);
        const heard = target === SOL || (target === "everywhere" && l.neighbor.d <= CALL_REACH);
        const sending = target === "everywhere" ? 0 : aimedYears(SIZES[size], target === SOL ? l.neighbor.d : between(world, l.star, target));
        Object.assign(r, { text: said, size, ...(heard ? { arrives: l.at + l.neighbor.thinks + sending + l.neighbor.d } : {}) });
      }
      out.push(r);
    }
  } catch (e) {
    console.error("React:", String(e));
    if (!out.length) return Response.json({ error: "The neighbors can’t be asked right now." }, { status: 502 });
  }
  // A bullet a neighbor fires at us: when it lands, and how hard. The Year stays in the save, but nothing shows it
  // until it lands: a coasting bullet is dark. 2026-10-28.
  for (const s of strikesOnUs(world, out)) {
    const r = out.find((x) => x.star === s.star && x.move === "strike" && x.lands === undefined && !x.about);
    if (r) Object.assign(r, { lands: s.lands, mt: s.mt });
  }
  return Response.json({ reactions: out });
}
