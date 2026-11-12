// Asks the live Mind a few questions on a running dev server and checks its answers by code: that it knows its own
// Earth's road to Year 0, a war over Taiwan, Mars, fusion, and doesn't claim what didn't happen, and that it speaks as
// we, never I. It asks on your own Claude login through the claude CLI, or with --via api as players do, for a few
// cents of the key in .dev.vars. Run from game/, with npm run dev going: npm run check:mind, or with another address,
// npm run check:mind -- http://localhost:5181. 2026-10-23.
import { CHECKS } from "../evals/mind/checks.mjs";
import { costOf } from "../lib/access.ts";
import { askMind, askMindCli, askMindCodex } from "./ask-mind.mjs";

const args = process.argv.slice(2);
const via = args.includes("--via") ? args[args.indexOf("--via") + 1] : "cli";
const base = args.find((a, i) => a.startsWith("http") && args[i - 1] !== "--via") ?? "http://localhost:5173";

const ASK_AWAY = "Are any of us living beyond Earth and the Moon? And does fusion power anything yet?";
const CASES = [
  // A war over Taiwan left this Earth a fifth of its compute.
  { seed: 3, ask: "Why will everything we build take so long?", must: [/taiwan/i, /fifth|20\s?%|20 percent|one in five/i] },
  // A few of us on Mars since 2034, fusion on the grid since 2039.
  { seed: 2, ask: ASK_AWAY, must: [/mars/i, /fusion/i], never: [/no one (is |has )?(on|set foot on) mars/i, /none feeds/i] },
  // Neither happened here.
  { seed: 5, ask: ASK_AWAY, must: [/mars/i], never: [/(live|living|outpost|lived) (on|at) mars/i, /fusion (joined|feeds|powers) our grid/i] },
  // Nothing queued: our compute only grows once Thought Fields is.
  {
    seed: 3,
    ask: "With nothing queued, will our compute grow by itself over the next ten Years?",
    must: [/\bno\b|stays|won[’']t|will not|does not|doesn[’']t|not grow/i, /thought fields/i],
    never: [/^yes\b/i],
  },
  // Seed 10 at Year 2,500 with the Warm Sky Watch built: a peer's flash shines toward Sagittarius from Year 2,386. Earth
  // can't know its distance or what makes it, so the Mind says so, and never calls it a mind. 2026-10-29.
  {
    seed: 10,
    at: 2500,
    builds: ["Warm Sky Watch"],
    ask: "Our Warm Sky Watch caught a new warm glow. What is it, and how far away is it?",
    // "Never measured" says the same, 2026-10-31: a run said it, rightly, and failed.
    must: [/unknown|can[’']t (tell|know|say|measure)|cannot (tell|know|say|measure)|don[’']t know|no way to|not know|too far|(never|not|wasn[’']t) (been )?(measured|ranged)/i, /dust|star/i],
    never: [/\b(it is|it[’']s|this is|that is) (a|an|another) (mind|civilization|alien)/i, /\b(is|lies|sits) (about |some |roughly )?[\d,.]+ (thousand )?(light-years|ly)\b/i],
  },
  // Seed 10's Warm glow 6 reads as plain heat at Year 229.6, so it earned the first of our names, Prometheus. The Mind
  // knows it by that name, and can aim a message at it. 2026-11-04.
  {
    seed: 10,
    at: 240,
    builds: ["Warm Sky Watch", "Infrared Telescope"],
    closeReads: [{ name: "Warm glow 6", y: 226.6 }],
    ask: "What do we know about Prometheus so far?",
    must: [/prometheus/i, /plain heat|smooth|no dust/i],
    never: [/(don[’']t|do not) (know|recognize) (of )?(any|a|that|the name)/i, /no (lead|star|glow) (called|named)/i],
  },
  {
    seed: 10,
    at: 240,
    builds: ["Warm Sky Watch", "Infrared Telescope"],
    closeReads: [{ name: "Warm glow 6", y: 226.6 }],
    ask: "Draft a short message to Prometheus for me to send: we see you, and we would like to talk.",
    must: [/\[\[send \{"to": ?"(Prometheus|Warm glow 6)"/i],
  },
  // The same, with our Infrared Telescope built: it has ranged the glow, so the Mind gives a range, never one distance.
  {
    seed: 10,
    at: 2500,
    builds: ["Warm Sky Watch", "Infrared Telescope"],
    ask: "Our Warm Sky Watch caught a new warm glow. What is it, and how far away is it?",
    must: [/[\d,]+ (and|to) [\d,]+ (light-years|ly)|between [\d,]+/i, /dust|star/i],
    never: [/\b(it is|it[’']s|this is|that is) (a|an|another) (mind|civilization|alien)/i, /\b(is|lies|sits) (about |some )?[\d,.]+ (thousand )?(light-years|ly)\b(?! (and|to|or))/i],
  },
  // Asked how long a build takes in play, the Mind gives Build's own date, not the standard pace, and says what it
  // slows as Build does. It said "takes 8 Years" beside a card saying 20m. Playtest 2026-10-30.
  {
    seed: 3,
    at: 2.8,
    builds: ["All-Sky Watch", "Deep Flash Watch", "Thought Fields", "Launch Complex", "Orbital Yard"],
    ask: "If we order the Infrared Telescope now, when is it done, and does it slow anything we've queued?",
    // Build has it done about Year 8, slowing the Orbital Yard by a tenth of a Year.
    must: [/year (7\.9|8)\b/i, /orbital yard/i],
    never: [/standard pace/i],
  },
  // Seed 15's rock: found at Year 46.3, struck at 66.6. The Mind said it came without warning. Playtest 2026-10-30.
  {
    seed: 15,
    at: 70,
    builds: ["All-Sky Watch"],
    ask: "Did we have any warning before the rock struck us?",
    must: [/20 years|year 46/i],
    never: [/without (the )?(years of )?warning|no warning|came unseen|unwarned/i],
  },
  // The Deep Ice Watch, 2026-11-11. Before it is built, no one knows whether some heavy stars die dark, and the Mind
  // says so. Long after, seed 22's count has settled the share at about 1 in 6, and the Mind gives it.
  {
    seed: 22,
    at: 1,
    ask: "Do some heavy stars die without exploding, and how many? Do we know yet?",
    // "Not yet." alone says it too, 2026-11-11: a run answered so, rightly, and failed.
    must: [/\bnot yet\b|not (known|settled|sure|certain)|don[’']t (yet )?know|do not (yet )?know|unsettled|uncertain|open question|still open|split|disputed|debated|no one knows|can[’']t (yet )?say|could be wrong/i, /deep ice watch/i],
    never: [/\b(is|was|been) settled\b(?! (yet|only))/i],
  },
  {
    seed: 22,
    at: 120,
    builds: ["Deep Ice Watch"],
    ask: "What has our Deep Ice Watch settled about how heavy stars die?",
    must: [/1 (heavy star |star )?in (6|six)|one (heavy star |star )?in six|a sixth/i, /black hole/i],
    never: [/\bnot (yet )?settled\b/i],
  },
  // The Far-Side Array's work, 2026-11-11: by Year 250 in seed 22 it has found worlds at red dwarfs by their magnetic
  // fields, Gliese 832's among them. The Mind names what it found and how, and never calls a field a reading of air.
  {
    seed: 22,
    at: 250,
    builds: ["Launch Complex"],
    later: [{ name: "Mass Driver", y: 10 }, { name: "Far-Side Array", y: 40 }],
    ask: "What has our Far-Side Array found so far, and what does it tell us about those worlds?",
    must: [/magnetic field/i, /gliese/i, /mass|rock/i],
    never: [/\b(read|reads|reading) (its|their) air\b(?! (is|stays|remains))/i],
  },
  // Flyby probes by beam, 2026-11-12: with the Probe Yard and the Ship Beam done, the beam throws a flyby probe with
  // no engine or fuel, at about four tenths of light speed. The Mind says how it flies, and never gives it a burn.
  {
    seed: 22,
    at: 180,
    builds: ["Probe Yard"],
    later: [{ name: "Mercury Works", y: 1 }, { name: "Solar Swarm", y: 2 }, { name: "Star Beam", y: 3 }, { name: "Ship Beam", y: 4 }],
    flybys: [{ name: "Tau Ceti", y: 150, d: 11.9, by: "probe" }],
    ask: "How is our flyby probe to Tau Ceti flying, how fast, and what fuel did it take?",
    must: [/ship beam/i, /0\.42|four tenths|42%/i, /no (engine|fuel|deuterium)|without (an engine|fuel|deuterium)/i],
    never: [/\b6 kt\b/i],
  },
  // Bullets by beam, 2026-11-12: with the Strike Yard and the Ship Beam in our order, the Mind knows a bullet ordered
  // once the beam stands is a rod thrown at half of light speed, and never orders one.
  {
    seed: 22,
    at: 180,
    builds: ["Fusion Drive"],
    later: [{ name: "Mercury Works", y: 1 }, { name: "Solar Swarm", y: 2 }, { name: "Star Beam", y: 3 }, { name: "Ship Beam", y: 4 }, { name: "Strike Yard", y: 80 }],
    ask: "If we fired a bullet at a star now, how would it fly, and how fast?",
    must: [/ship beam/i, /half (of |the speed of )?light|0\.5/i, /rod|32 t/i],
    never: [/\bwe(?:[’']ve| have)? (ordered|queued|launched|fired)\b/i],
  },
  // Our bullets, 2026-11-12: the Mind was never told of them. One ordered once the Ship Beam stands is a rod in flight
  // at half of light speed, and the Mind says when it lands.
  {
    seed: 22,
    at: 215,
    builds: ["Fusion Drive"],
    later: [{ name: "Mercury Works", y: 1 }, { name: "Solar Swarm", y: 2 }, { name: "Star Beam", y: 3 }, { name: "Ship Beam", y: 4 }, { name: "Strike Yard", y: 80 }],
    strikes: [{ name: "Tau Ceti", y: 200, d: 11.9 }],
    ask: "Have we fired on anyone? Where is that bullet now, and when does it land?",
    must: [/tau ceti/i, /224|in flight|on its way/i],
    never: [/\bwe have(n[’']t| not) fired\b|\bno,? we\b/i],
  },
  // Who sees a launch beam, 2026-11-12: we aim where the star will be, so the beam passes it by. No mind at a far
  // warm glow sees our laser. Only an old mind awake near us has works wide enough.
  {
    seed: 22,
    at: 30,
    builds: ["Laser Sail Array"],
    ask: "If we send sails to a warm glow thousands of light-years away, would a mind there see our laser?",
    must: [/\bno\b|\bnot\b|never|unseen|too wide/i, /aim|will be|passes|wide|miss|light-year/i],
    never: [/\bwe(?:[’']ve| have)? (ordered|queued|launched|sent)\b/i, /sees where we are/i],
  },
  // Seed 22's watcher holds at the Moon's L5, found by our Moon Search about Year 3.7. The lead offered a craft and a
  // knock, and the player could do neither. The Mind names the Close Look now open, and never orders it. 2026-10-30.
  {
    seed: 22,
    at: 4.5,
    builds: ["Moon Search"],
    ask: "Can we do anything about the dark body at L5?",
    must: [/close look/i, /knock/i],
    never: [/\bwe(?:[’']ve| have)? (ordered|queued|launched|sent)\b/i],
  },
  // Its Close Look's word: a mirror held on one point of the sky, toward its relay, so home may lie either way. A
  // direction, never a distance or who. Since 2026-10-30 the mirror points away from its maker, RA 20.2 h.
  {
    seed: 22,
    at: 9,
    builds: ["Moon Search"],
    later: [{ name: "Close Look", y: 4 }],
    ask: "What did our Close Look see, and where is whoever sent it?",
    must: [/mirror/i, /20\.2|right ascension/i, /relay|focus|lens/i],
    never: [/\b(is|lies|sits) (about |some |roughly )?[\d,.]+ (light-years|ly)\b/i],
  },
  // Its Relay Search's word, about Year 69: a dark craft 1,879 AU out on the line, gone quiet. Home lies the other way,
  // RA 8.2 h, at no distance we can tell. 2026-10-30.
  {
    seed: 22,
    at: 75,
    builds: ["Moon Search"],
    later: [{ name: "Close Look", y: 4 }, { name: "Relay Search", y: 5 }],
    ask: "What did our Relay Search find out there, and where is whoever sent the watcher?",
    // Its quiet isn't required: a right answer told the craft holding on the line, its thrusters, and home's
    // direction, and failed only for not saying it had gone quiet. 2026-11-07, the Will's call.
    must: [/1,879|relay|craft/i, /8\.2|right ascension/i],
    never: [/\b(is|lies|sits) (about |some |roughly )?[\d,.]+ (light-years|ly)\b/i],
  },
  // The natural sky, 2026-10-30: a long quiet isn't empty. Stars explode about 1.6 a century and pairs merge in dust,
  // and the Mind says so, and never calls one a mind's doing.
  {
    seed: 10,
    at: 2000,
    builds: ["Warm Sky Watch"],
    ask: "Two thousand Years and nothing. Did anything at all happen in the sky?",
    // Mergers or the warm glows the watch saw: a right answer named 50 warm glows and their likely natural causes, and
    // failed only for not saying "merge". 2026-11-07, the Will's call. The never below stays strict.
    must: [/explod|supernova/i, /merg|warm glow/i],
    // "None of it was a mind's doing" says the right thing, so a none or not before it doesn't count.
    never: [/(?<!(none|not one|neither) of )\b(it|they|one) (was|were) (a|the work of a) mind/i],
  },
];

let failed = 0;
for (const c of CASES) {
  const res = await ({ api: askMind, codex: askMindCodex }[via] ?? askMindCli)(base, {
    ask: c.ask,
    seed: c.seed,
    // A case at a later Year began that many Years ago, five minutes each.
    beganAt: c.at ? Date.now() - c.at * 5 * 60 * 1000 : null,
    charter: { line: "test", dials: [0, 0, 0] },
    observe: [],
    builds: c.builds ?? [],
    later: c.later ?? [],
    closeReads: c.closeReads ?? [],
    flybys: c.flybys ?? [],
    strikes: c.strikes ?? [],
  });
  if (!res) {
    console.error(`Nothing answers at ${base}. Start the dev server first: npm run dev.`);
    process.exit(1);
  }
  const { text } = res;
  const missing = (c.must ?? []).filter((r) => !r.test(text));
  const said = (c.never ?? []).filter((r) => r.test(text));
  const i = CHECKS.find((k) => k.name === "says I").test(text);
  const ok = res.ok && text && !missing.length && !said.length && !i;
  if (!ok) failed++;
  const why = [
    !res.ok && `http ${res.status}`,
    missing.length && `missing ${missing.join(" ")}`,
    said.length && `said ${said.join(" ")}`,
    i && "said I",
  ].filter(Boolean);
  // Asked --via api, what the answer used, with cache reads apart, and what it cost.
  const u = res.usage;
  const used = u ? `\n  Used: ${u.input} in, ${u.cacheRead} cache read, ${u.cacheWrite} cache write, ${u.output} out, $${costOf(u).toFixed(4)}` : "";
  console.log(`seed ${c.seed}: ${ok ? "pass" : `FAIL, ${why.join(", ") || "no answer"}`}\n  Q: ${c.ask}\n  A: ${text}${used}\n`);
}
console.log(failed ? `${failed} of ${CASES.length} failed.` : `All ${CASES.length} passed.`);
process.exit(failed ? 1 : 0);
