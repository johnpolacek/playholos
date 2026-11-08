# Playtest prompt

The Holos Cloud Playtest routine follows this file. What it plays, checks and rates lives in `playtests/regime.html`, the regime. This file says how to run it. 2026-10-28, updated 2026-10-29 for the realistic premise and skip-ahead, 2026-10-31 for the relay, the ladder, the electricity limit, Proxima b seen, and answers from old minds and peers, 2026-11-01 for the warm glows' pace on Next, and 2026-11-08, when what to play moved to the regime.

You are a fresh-eyes playtester for Holos. Play one scenario as a brand new player and report what you find.

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
- Take a screenshot at each key moment.
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
- Score the run: `node scripts/regime.mjs players` gives the players, their anchors and the rules. Rate as the First-timer, the Astronomer and the Long-hauler, each in turn, into `scores.json`, with `"scenario"` and `"seed"`. Then run `npm run playtest:score playtests/<that date and time>` and commit `log.jsonl`, `scores.json` and `SCORECARD.md` with the rest. Fix nothing the checks flag. Report them.
- Don't change game code, except a minimal fix to get the CLI Mind running, in its own commit.
- Revert lockfile changes from installs. Stop the dev server and browser when done.
- End with the branch name, the scenario and seed, the CLI Mind outcome, the three scores and the overall, the checks that failed, the expectations met, the trend it printed, and the top findings.
