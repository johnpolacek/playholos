// npm run events [days]: how people played playholos.com, from the rows lib/track.ts sends. Players a day, how far
// they got, what they built, and where they came from. Reads Analytics Engine's SQL API with a token that can read
// Account Analytics, from CLOUDFLARE_API_TOKEN or .dev.vars. Rows are kept 90 days. 2026-11-08.
import { readFileSync } from "node:fs";

const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID ?? "712b6921d7579b8ab047b7303a5afd62";
const days = Math.max(1, Math.min(90, Number(process.argv[2]) || 7));

function token() {
  if (process.env.CLOUDFLARE_API_TOKEN) return process.env.CLOUDFLARE_API_TOKEN;
  try {
    return readFileSync(new URL("../.dev.vars", import.meta.url), "utf8").match(/^CLOUDFLARE_API_TOKEN\s*=\s*"?([^"\n]+)"?/m)?.[1];
  } catch {
    return undefined;
  }
}

const key = token();
if (!key) {
  console.error("Needs a Cloudflare API token that can read Account Analytics.");
  console.error("Make one at https://dash.cloudflare.com/profile/api-tokens, then put CLOUDFLARE_API_TOKEN=... in game/.dev.vars.");
  process.exit(1);
}

async function sql(query) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/analytics_engine/sql`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: query,
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return (await res.json()).data;
}

const since = `timestamp > NOW() - INTERVAL '${days}' DAY`;
const from = `FROM holos_events WHERE ${since}`;

const [daily, steps, builds, pages, countries, errors] = await Promise.all([
  sql(`SELECT toDate(timestamp) AS day, count(DISTINCT index1) AS players, SUM(_sample_interval) AS events ${from} GROUP BY day ORDER BY day`),
  sql(`SELECT blob1 AS step, count(DISTINCT index1) AS players, SUM(_sample_interval) AS times ${from} GROUP BY step ORDER BY players DESC`),
  sql(`SELECT blob2 AS build, count(DISTINCT index1) AS players ${from} AND blob1 = 'build' GROUP BY build ORDER BY players DESC LIMIT 15`),
  sql(`SELECT blob2 AS page, SUM(_sample_interval) AS views ${from} AND blob1 = 'page' GROUP BY page ORDER BY views DESC LIMIT 15`),
  sql(`SELECT blob3 AS country, count(DISTINCT index1) AS players ${from} GROUP BY country ORDER BY players DESC LIMIT 10`),
  sql(`SELECT blob2 AS error, SUM(_sample_interval) AS times ${from} AND blob1 = 'mind_error' GROUP BY error ORDER BY times DESC LIMIT 5`),
]);

const by = Object.fromEntries(steps.map((s) => [s.step, s]));
const PATH = ["page", "wake", "charter", "reviewed", "reached", "ask", "begin", "build", "close_read", "send", "will"];
const top = Number(by.page?.players ?? 0) || 1;
const bar = (n) => "▓".repeat(Math.round((n / top) * 20)).padEnd(20, "░");

console.log(`\nplayholos.com, the last ${days} day${days === 1 ? "" : "s"}\n`);
console.log("Players a day");
for (const d of daily) console.log(`  ${d.day}  ${String(d.players).padStart(5)} players  ${String(d.events).padStart(6)} events`);
console.log("\nHow far players got");
for (const step of PATH) {
  const n = Number(by[step]?.players ?? 0);
  console.log(`  ${step.padEnd(11)} ${bar(n)} ${String(n).padStart(5)}  ${Math.round((n / top) * 100)}%`);
}
const other = steps.filter((s) => !PATH.includes(s.step));
if (other.length) console.log("\nOther events\n" + other.map((s) => `  ${s.step.padEnd(11)} ${s.players} players, ${s.times} times`).join("\n"));
if (builds.length) console.log("\nBuilds ordered, by players\n" + builds.map((b) => `  ${String(b.players).padStart(5)}  ${b.build}`).join("\n"));
if (pages.length) console.log("\nPages\n" + pages.map((p) => `  ${String(p.views).padStart(6)}  ${p.page}`).join("\n"));
if (countries.length) console.log("\nCountries\n" + countries.map((c) => `  ${String(c.players).padStart(5)}  ${c.country || "?"}`).join("\n"));
if (errors.length) console.log("\nThe Mind’s failures\n" + errors.map((e) => `  ${String(e.times).padStart(5)}  ${e.error}`).join("\n"));
console.log();
