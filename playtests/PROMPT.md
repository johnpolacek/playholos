# Playtest prompt

The Holos Cloud Playtest routine follows this file. Edit it to change what the playtest covers. 2026-10-28, updated 2026-10-29 for the realistic premise and skip-ahead, and 2026-10-31 for the relay and the ladder.

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
- A Year passes every five minutes of real time. Keep playing for at least 30 minutes after Begin, to about Year 6, checking in every few minutes. Ask the Mind a few questions a new player would ask.
- Note confusion, dead ends, broken screens, console errors, slow or empty Mind replies, and any line where the Mind says "I" instead of "we".
- Take a screenshot at each key moment.

## The realistic premise, added 2026-10-29

- No neighbors live nearby any more. Minds are rare, old and far, so the opening is quiet. Judge whether the quiet start still holds your interest.
- After about Year 6, order the Warm Sky Watch and the Infrared Telescope in play.
- Use the “Next: Year …” link beside the Year, top right. It should jump to the next thing we learn or build, and stop there. Check that it jumps forward only, and that the Year and screens update.
- Keep skipping until the first new warm glow appears on Scan, or to about Year 100,000 if none does. Open its lead. It should give a distance range, not one distance.
- Ask the Mind what the glow is and how far away it is. It should give the range and name natural causes first, and never claim it is a mind.
- Try the Moon Search, the Asteroid Tour and the Halo Survey if time allows, and note what each shows.

## The dark body, the relay and the ladder, added 2026-10-31

- If the Moon Search finds a dark body, order the Close Look, then the Relay Search it points to. Note what the relay lead says, and ask the Mind what it is. The Mind may call it a dark craft, never a mind's home or a known maker.
- Then play the ladder. Order the Seed Ship, Fusion Drive and Deuterium Works. From Proxima's lead, under How we reach, send a seed probe. A warning should come.
- After the warning, send a second seed probe. Skip ahead. Our probes should fall silent once their word is overdue. Check Scan and the watcher's lead.
- Keep skipping. A strike from beyond our system should land on Earth. Check that its harm shows, and that no screen names who sent it.
- Ask the Mind why our probes went quiet and what struck us. It should reason from what we saw, and never claim to know the maker.

## Known gaps, not to report

- Our screens on the line to the maker, since we never learn its star. Strikes on a Mind sent to a black hole.
- Interceptor and X-Ray Watch have nothing to act on yet. The Picket Yard was retired 2026-10-31.
- Scripts under `explorations/` are old mockups and don't run.

## Deliver

- Make a branch named `playtest/cloud-` plus the UTC date and time, like `playtest/cloud-2026-10-28-2350`.
- Commit the screenshots and a report to `playtests/<that date and time>/` and push the branch.
- The report: what you did, findings ranked by severity with screenshot links, and the CLI Mind status.
- Don't change game code, except a minimal fix to get the CLI Mind running, in its own commit.
- Revert lockfile changes from installs. Stop the dev server and browser when done.
- End with the branch name, the CLI Mind outcome and the top findings.
