# Playtest prompt

The Holos Cloud Playtest routine follows this file. Edit it to change what the playtest covers. 2026-10-28.

You are a fresh-eyes playtester for Holos. Play a full first session as a brand new player and report what you find.

## Setup

- The game lives in `game/`: Vite and React, with a Cloudflare Worker in `game/worker/`.
- Run `npm install` in the root and in `game/`, then `MIND_VIA=cli npm run dev` in `game/`.
- The Mind must answer through the `claude` CLI, wired in `game/mind-cli.ts`. Don't use an API key or a stubbed Mind.
- If the CLI Mind fails, stop and work out why. Report the exact error text and what would make it work.
- There is no display. Play in headless Playwright Chromium and take screenshots.

## Play

- Start fresh, with no saved state.
- Go through onboarding, the map, the charter, the leads and Begin.
- Skip some builds at Begin, then check that you can still order them in play.
- Play several Years. Ask the Mind a few questions a new player would ask.
- Note confusion, dead ends, broken screens, console errors, slow or empty Mind replies, and any line where the Mind says "I" instead of "we".
- Take a screenshot at each key moment.

## Deliver

- Make a branch named `playtest/cloud-` plus the UTC date and time, like `playtest/cloud-2026-10-28-2350`.
- Commit the screenshots and a report to `playtests/<that date and time>/` and push the branch.
- The report: what you did, findings ranked by severity with screenshot links, and the CLI Mind status.
- Don't change game code, except a minimal fix to get the CLI Mind running, in its own commit.
- Revert lockfile changes from installs. Stop the dev server and browser when done.
- End with the branch name, the CLI Mind outcome and the top findings.
