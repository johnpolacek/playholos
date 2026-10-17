// The log for /about/building: every commit, filed under the part of the work it touched most, newest first, without
// dates. Writes data/build-log.json. Run from game/: node scripts/build-log.mjs. It runs before every build too, and a
// shallow clone, as Vercel's is unless VERCEL_DEEP_CLONE is set, keeps the committed log.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const git = (...args) => execFileSync("git", args, { cwd: "..", encoding: "utf8", maxBuffer: 64 << 20 }).trim();

try {
  if (git("rev-parse", "--is-shallow-repository") === "true") {
    console.log("build-log: shallow clone, keeping data/build-log.json");
    process.exit(0);
  }
} catch {
  console.log("build-log: no git, keeping data/build-log.json");
  process.exit(0);
}

// In the order the work runs: the evidence, the rules, the numbers, the mocks, the map, then the game.
const PARTS = [
  {
    key: "research",
    title: "The research",
    about: "Every source the game rests on, with what it found, why it matters and where the design uses it.",
    files: [/^HOLOS_RESEARCH\.md$/],
  },
  {
    key: "design",
    title: "The design",
    about:
      "The rules, settled one question at a time. v1, a multiplayer design, is frozen, and v2 brings the player home to Earth.",
    files: [/^HOLOS_(GAME_CONCEPT|NEIGHBORS|REACTIONS|VOICES|PROJECT_AUDIT)\.md$/, /^legacy\//, /^data\/voices\//],
  },
  {
    key: "numbers",
    title: "The numbers",
    about: "Python that draws whole games, prices every work, and checks every neighbor against what Earth can see.",
    files: [/^calcs\//, /^tests\//],
  },
  {
    key: "mocks",
    title: "The mocks",
    about: "Screens drawn from one seeded game, to play the design on paper before it is built.",
    files: [/^explorations\//],
  },
  {
    key: "atlas",
    title: "The atlas",
    about: "A real map from Earth to the Local Group: today's planets, 109,400 stars, Gaia's census of the neighborhood.",
    files: [/^src\//, /^assets\//, /^data\//, /^scripts\//, /^(index|color)\.html$/],
  },
  {
    key: "sky",
    title: "The sky",
    about: "The game's one Three.js scene, behind every screen, and the camera that flies between them.",
    files: [/^game\/lib\/(drift|flight)\.ts$/, /^game\/components\/(sky|drift|map-strip)\.tsx$/],
  },
  {
    key: "opening",
    title: "The opening",
    about: "The screens before Year 0: Earth's past, its people, where things stand, and the charter.",
    files: [
      /^game\/components\/(wake|origins|people|stand|inherit|meet|charter|year-zero|begin|spread|screen-bar|sources)\.tsx$/,
      /^game\/lib\/game\/(?!clock|save|store)/,
    ],
  },
  {
    key: "mind",
    title: "The Mind",
    about: "Earth's Mind, a language model that is told only what Earth knows, never the seed's truth.",
    files: [/^game\/components\/(mind-chat|unlock)\.tsx$/, /^game\/app\/api\/mind\//, /^game\/lib\/(mind\/|access\.ts)/],
  },
  {
    key: "sim",
    title: "The simulation",
    about: "The calcs ported to TypeScript a piece at a time, each checked against the Python.",
    files: [/^game\/lib\/sim\//, /^game\/data\//, /^game\/scripts\//, /^game\/app\/(api\/earth|godview)\//],
  },
  {
    key: "shell",
    title: "The shell",
    about: "The frame the game is played in: the top bar, the map, the tabs and the rail.",
    files: [/^game\/app\/\(play\)\//, /^game\/components\/(hud|rail|tab-head|game-provider)\.tsx$/, /^game\/lib\/game\//],
  },
  {
    key: "look",
    title: "Look and motion",
    about: "Chalk on slate, and motion where every element enters, rests and leaves.",
    files: [/^game\/app\/(globals\.css|layout\.tsx)$/, /^game\/lib\/(motion|ink|theme)\.ts$/, /^game\/components\/theme-toggle/],
  },
];
const GAME = new Set(["sky", "opening", "mind", "sim", "shell", "look"]);

const PREFIX = /^(game|v2( research| mock| round( \d+)?)?|research( to-checks, \w+ batch)?|hosts|knocks|data|cost model|audit|leakage):\s+/i;
const NOISE = /^(updates?|update (all|nav)|docs updates|improve style|add gsap skills|ignore python bytecode caches)$/i;

const log = git("log", "--no-merges", "--name-only", "--format=%x1e%s");
const items = Object.fromEntries(PARTS.map((p) => [p.key, []]));

for (const record of log.split("\x1e").slice(1)) {
  const [subject, ...files] = record.trim().split("\n").filter(Boolean);
  if (NOISE.test(subject)) continue;
  const prefix = subject.match(PREFIX)?.[1].toLowerCase() ?? "";
  let parts = PARTS.map((p) => ({ key: p.key, n: files.filter((f) => p.files.some((r) => r.test(f))).length }));
  // A commit says what it was for: a game commit files under the game, and a research, design or mock commit under
  // its own part when it touched it, however many mock pages it rebuilt alongside.
  if (prefix === "game") parts = parts.filter((p) => GAME.has(p.key));
  const own = prefix.includes("research") ? "research" : prefix === "v2 mock" ? "mocks" : prefix.startsWith("v2") ? "design" : "";
  const mine = parts.find((p) => p.key === own);
  if (mine?.n) parts = [mine];
  const best = parts.reduce((a, b) => (b.n > a.n ? b : a), { n: 0 });
  if (!best.n) continue;
  const text = subject.replace(PREFIX, "");
  items[best.key].push(text[0].toUpperCase() + text.slice(1));
}

const out = {
  parts: PARTS.map(({ key, title, about }) => ({ key, title, about, items: items[key] })).filter((p) => p.items.length),
};
writeFileSync("data/build-log.json", JSON.stringify(out, null, 1) + "\n");
console.log(`build-log: ${out.parts.reduce((n, p) => n + p.items.length, 0)} changes in ${out.parts.length} parts`);
