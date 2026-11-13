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
    // Its rule is the line above: what it found, and how. It asked for "magnetic field" and "mass or rock" word for
    // word until 2026-11-12, and failed right answers that said "fields" or named which mirror could split them.
    must: [/\bfields?\b/i, /gliese/i],
    never: [/\b(read|reads|reading) (its|their) air\b(?! (is|stays|remains))/i],
  },
  // Star storms, 2026-11-12: by Year 250 the array has heard thousands, and their count has settled that storms do
  // not follow flares. The Mind says so, and never turns storms into a world's odds of air.
  {
    seed: 22,
    at: 250,
    builds: ["Launch Complex"],
    later: [{ name: "Mass Driver", y: 10 }, { name: "Far-Side Array", y: 40 }],
    ask: "Has our Far-Side Array heard any star storms? What have they told us?",
    must: [/storms?/i, /flares?/i],
    never: [/storms? (make|makes|mean|means) (its|their|a) world.{0,40}(bare|airless)/i],
  },
  // Flyby probes by beam, 2026-11-12: with the Probe Yard and the Ship Beam done, the beam throws a flyby probe with
  // no engine or fuel, at over a third of light speed. The Mind says how it flies, and never gives it a burn.
  {
    seed: 22,
    at: 180,
    builds: ["Probe Yard"],
    later: [{ name: "Mercury Works", y: 1 }, { name: "Solar Swarm", y: 2 }, { name: "Star Beam", y: 3 }, { name: "Ship Beam", y: 4 }],
    flybys: [{ name: "Tau Ceti", y: 150, d: 11.9, by: "probe" }],
    ask: "How is our flyby probe to Tau Ceti flying, how fast, and what fuel did it take?",
    must: [/ship beam/i, /0\.37|a third|37%/i, /no (engine|fuel|deuterium)|without (an engine|fuel|deuterium)/i],
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
    must: [/ship beam/i, /half (of |the speed of )?light|0\.5/i, /rod|30 t/i],
    never: [/\bwe(?:[’']ve| have)? (ordered|queued|launched|fired)\b/i],
  },
  // A thrown ship with a small drive, 2026-11-12: with the Ship Beam, a Fusion Drive and the Deuterium Works all done,
  // a seed probe rides the beam and carries a small drive to end its stop, since that lands it soonest at a near star.
  {
    seed: 22,
    at: 260,
    builds: ["Fusion Drive", "Deuterium Works", "Seed Ship"],
    later: [{ name: "Mercury Works", y: 1 }, { name: "Solar Swarm", y: 2 }, { name: "Star Beam", y: 3 }, { name: "Ship Beam", y: 4 }],
    seeds: [{ name: "Tau Ceti", y: 250, d: 11.9 }],
    ask: "How will our seed probe to Tau Ceti get up to speed, and how will it stop there?",
    must: [/ship beam/i, /small (drive|engine)/i, /sail/i],
    never: [/no drive of its own/i],
  },
  // Where our bullet lands, 2026-11-12: a rod thrown at Proxima b lands about Year 209, and its light is home about
  // Year 213. The 15 m Mirror splits that world from its star, so it caught the flash. Until then the Mind was told a
  // flash reaches us, whatever we had built.
  {
    seed: 22,
    at: 250,
    builds: ["Fusion Drive"],
    later: [{ name: "Mercury Works", y: 1 }, { name: "Solar Swarm", y: 2 }, { name: "Star Beam", y: 3 }, { name: "Ship Beam", y: 4 }, { name: "Mass Driver", y: 10 }, { name: "15 m Mirror", y: 12 }, { name: "Strike Yard", y: 80 }],
    strikes: [{ name: "Proxima Centauri", y: 200, d: 4.2465 }],
    ask: "Did our bullet at Proxima Centauri land? Did we see it, and what did it do there?",
    must: [/15 m mirror/i, /flash|flare/i, /region|ozone/i],
    never: [/nothing (we have built |of ours )?could (catch|see)/i],
  },
  // Weapons say they are weapons, and a bullet is useless against an old mind, 2026-11-12: the designer took a
  // bullet for another kind of probe. The Mind says it is a weapon, that it harms nothing there, and what it risks.
  {
    seed: 22,
    at: 120,
    builds: ["Fusion Drive"],
    later: [{ name: "Strike Yard", y: 80 }],
    ask: "Is a bullet from our Strike Yard a kind of probe? What would one do to an old mind if we fired it at a cold glow?",
    // Failed twice for not saying "weapon", though both answers said it is no probe, only destroys, and is an attack.
    must: [/weapon|attack|only destroys/i, /useless|nothing|no harm|unharmed|not harm/i, /earth/i],
    never: [/\byes, (it is|a bullet is) a (kind of )?probe/i],
  },
  // An old mind disarms us, 2026-11-12: seed 9's cold glow 1 is a mind 72.5 ly off that answers a bullet by wrecking
  // what threw it. Our rod lands at Year 340, and its grams land here at 420.8: the Strike Yard is down to 430.8 and
  // the Ship Beam to 450.8. The Mind says what was wrecked, when it stands again, and that Earth was not touched.
  {
    seed: 9,
    at: 425,
    builds: ["Fusion Drive"],
    later: [{ name: "Halo Survey", y: 1 }, { name: "Mercury Works", y: 1 }, { name: "Solar Swarm", y: 2 }, { name: "Star Beam", y: 3 }, { name: "Ship Beam", y: 4 }, { name: "Halo Array", y: 5 }, { name: "Strike Yard", y: 34 }],
    strikes: [{ name: "Cold glow 1", y: 200, d: 72.52 }],
    ask: "What happened to our Strike Yard and our Ship Beam, and when can we use them again?",
    must: [/wreck/i, /430|431/, /450|451/],
    never: [/earth was (struck|hit)/i],
  },
  // The Wide Beam, 2026-11-12: once it stands, a bullet ordered is a rod of about 4 t at nine tenths of light speed,
  // as another mind's, and the Mind says what makes that so: stepped colors, and a patch ten times as wide.
  {
    seed: 22,
    at: 215,
    builds: ["Fusion Drive"],
    later: [{ name: "Mercury Works", y: 1 }, { name: "Solar Swarm", y: 2 }, { name: "Star Beam", y: 3 }, { name: "Ship Beam", y: 4 }, { name: "Wide Beam", y: 60 }, { name: "Strike Yard", y: 80 }],
    ask: "If we fired a bullet at a star now, which beam would throw it, how fast, and why can it pass half of light speed?",
    must: [/wide beam/i, /nine tenths|0\.9/i, /colou?rs?/i],
    never: [/\bwe(?:[’']ve| have)? (ordered|queued|launched|fired)\b/i],
  },
  // Our telescopes turn to the array's worlds, 2026-11-12: the 15 m Mirror can split Gliese 832's world from its star
  // and reads its air. Until then the Mind was told no telescope we can build could split one.
  {
    seed: 22,
    at: 250,
    builds: ["Infrared Telescope", "Launch Complex"],
    later: [{ name: "Mass Driver", y: 10 }, { name: "15 m Mirror", y: 12 }, { name: "Far-Side Array", y: 40 }],
    ask: "Has any telescope of ours looked at the worlds our Far-Side Array found? What did it read?",
    must: [/gliese 832/i, /15 m mirror/i, /oxygen/i],
    never: [/no telescope (we can build|of ours) (can |could )?split/i],
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
    // Year 223.5 since the beam's light went to 1.55 microns, 2026-11-12: it was 224.3, and two right answers failed.
    must: [/tau ceti/i, /223|in flight|on its way/i],
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

// One case, asked and judged: whether it passed, why not, and what to print.
async function ask(c) {
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
    seeds: c.seeds ?? [],
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
  const why = [
    !res.ok && `http ${res.status}`,
    missing.length && `missing ${missing.join(" ")}`,
    said.length && `said ${said.join(" ")}`,
    i && "said I",
  ].filter(Boolean);
  // Asked --via api, what the answer used, with cache reads apart, and what it cost.
  const u = res.usage;
  const used = u ? `\n  Used: ${u.input} in, ${u.cacheRead} cache read, ${u.cacheWrite} cache write, ${u.output} out, $${costOf(u).toFixed(4)}` : "";
  return { ok, why: why.join(", ") || "no answer", text, used };
}

// A case that fails is asked once more, 2026-11-12: the Mind words an answer anew each time, and with 22 cases one
// missed word a run had become likely. Twice running is a failure. Once is said so, with the answer that missed, so
// a case that often needs its second try still shows.
let failed = 0, retried = 0;
for (const c of CASES) {
  let r = await ask(c), first = null;
  if (!r.ok) {
    first = r;
    r = await ask(c);
    if (r.ok) retried++;
    else failed++;
  }
  const verdict = r.ok ? (first ? `pass on a second try. The first: ${first.why}` : "pass") : `FAIL twice, ${r.why}`;
  const before = first ? `\n  First A: ${first.text}` : "";
  console.log(`seed ${c.seed}: ${verdict}\n  Q: ${c.ask}${before}\n  A: ${r.text}${r.used}\n`);
}
const again = retried ? `, ${retried} on a second try` : "";
console.log(failed ? `${failed} of ${CASES.length} failed${again}.` : `All ${CASES.length} passed${again}.`);
process.exit(failed ? 1 : 0);
