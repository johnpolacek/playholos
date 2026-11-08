# Playtest prompt

The Holos Cloud Playtest routine follows this file. What it plays, checks and rates lives in `playtests/regime.html`, the regime. This file says how to run it. 2026-10-28, updated 2026-10-29 for the realistic premise and skip-ahead, 2026-10-31 for the relay, the ladder, the electricity limit, Proxima b seen, and answers from old minds and peers, 2026-11-01 for the warm glows' pace on Next, and 2026-11-08, when what to play moved to the regime, a reader who didn't play took over the ratings, and the run began shooting the named screens.

You are a fresh-eyes playtester for Holos. Play one scenario as a brand new player and report what you find. You rate nothing. A reader who didn't play rates the run from what you leave: your log and your screenshots.

## Setup

- The game lives in `game/`: Vite and React, with a Cloudflare Worker in `game/worker/`.
- Run `npm install` in the root and in `game/`, then `npm run worlds:local` in `game/`, so the worlds are in the local bucket. A fresh container lacks them. Then `npm run dev:cli` in `game/`, so the Mind answers on the `claude` CLI login, never an API key.
- The Mind must answer through the `claude` CLI, wired in `game/mind-cli.ts`. Don't use an API key or a stubbed Mind.
- If the CLI Mind fails, stop and work out why. Report the exact error text and what would make it work.
- There is no display. Play in headless Playwright Chromium and take screenshots.

## Pick a scenario

- Each run plays one scenario. `node scripts/regime.mjs scenarios` lists them in turn.
- If the trigger's prompt names a scenario, play that one. Otherwise run `npm run playtest:score`, find the newest cloud run's scenario, and play the next in turn. With none yet, play the first.
- `node scripts/regime.mjs scenario <id>` prints its steps and expectations. Follow its steps, check each expectation, and stop where it says.

## Play

- Start fresh, with no saved state. The game draws the world's seed at random, as for any player. Don't pick one.
- Read the seed once the game is open: `JSON.parse(localStorage.getItem("holos:save")).seed`. Put it in `scores.json`.
- Note confusion, dead ends, broken screens, console errors, slow or empty Mind replies, and any line where the Mind says "I" instead of "we".
- Take a screenshot at each key moment. Name each for what it shows, like `27-scan-warm-glow.png`. Cite it in the log line it belongs to, as `"shot"`.
- At a moment no saved state reaches yet, like the watcher found or the strike landed, save it: write `localStorage.getItem("holos:save")` to a file, then `node scripts/capture.mjs snap <id> --from <file> --path <the page's path>`. Commit `playtests/states/<id>.json` and say in the report what screen it should show.
- Write `log.jsonl` in the run's folder as you play: every Next stop, every Mind question and answer, every console error, every expectation checked. `node scripts/regime.mjs formats` gives the format. Log the Mind's words as they show. Put your own notes in a `note` field, never inside `a`.

## Replay

Only to check a fix on the world a finding came from, when the trigger's prompt gives a `SEED`. Before the game first loads, seed the save, then play as usual:

```
await page.addInitScript((seed) => {
  if (!localStorage.getItem("holos:save")) localStorage.setItem("holos:save", JSON.stringify({ seed, beganAt: null }));
}, SEED);
```

A replay goes in `scores.json` with `"replay": true`, so the trend can tell it from a fresh world.

## Known gaps, not to report

`node scripts/regime.mjs gaps` lists them.

## Deliver

- Make a branch named `playtest/cloud-` plus the UTC date and time, like `playtest/cloud-2026-10-28-2350`.
- Commit the screenshots and a report to `playtests/<that date and time>/` and push the branch. Git ignores that folder, so add it with `git add -f`.
- The report: what you did, findings ranked by severity with screenshot links, and the CLI Mind status.
- Write `scores.json` with only `"build"`, `"scenario"` and `"seed"`, and `"replay": true` for a replay. Don't rate the run.
- Run `npm run playtest:rate playtests/<that date and time>`. A reader who didn't play rates the three players from your log and screenshots, on the CLI login. Then run `npm run playtest:score playtests/<that date and time>` and commit `log.jsonl`, `scores.json` and `SCORECARD.md` with the rest. Fix nothing the checks flag. Report them.
- Shoot the named screens: `npm run playtest:capture -- --run <that date and time>`, then `npm run playtest:critic <that date and time>`. Commit `playtests/captures/<that date and time>/` with `git add -f`. Report any shot that failed and any rating the critic says fell.
- Last, from this same session, run `node scripts/run-cost.mjs playtests/<that date and time>`. It records how long the run took and how many tokens it spent, yours and the readers'. Then run `npm run playtest:score` on the run again, so the scorecard shows it, and commit.
- Don't change game code, except a minimal fix to get the CLI Mind running, in its own commit.
- Revert lockfile changes from installs. Stop the dev server and browser when done.
- End with the branch name, the scenario and seed, the CLI Mind outcome, the rater's three scores and the overall, the checks that failed, the expectations met, the trend it printed, what the screen critic said fell, the minutes and tokens, and the top findings.
