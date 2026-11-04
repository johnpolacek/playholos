# Playtest prompt

The Holos Cloud Playtest routine follows this file. Edit it to change what the playtest covers. 2026-10-28, updated 2026-10-29 for the realistic premise and skip-ahead, 2026-10-31 for the relay, the ladder, the electricity limit, Proxima b seen, and answers from old minds and peers, and 2026-11-01 for the warm glows' pace on Next.

You are a fresh-eyes playtester for Holos. Play a full first session as a brand new player and report what you find.

## Setup

- The game lives in `game/`: Vite and React, with a Cloudflare Worker in `game/worker/`.
- Run `npm install` in the root and in `game/`, then `npm run worlds:local` in `game/`, so the worlds are in the local bucket. A fresh container lacks them. Then `npm run dev:cli` in `game/`, so the Mind answers on the `claude` CLI login, never an API key.
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

- No neighbors live nearby any more. Old minds are common, about one per 1,600 stars, but quiet, so the opening is quiet. Judge whether the quiet start still holds your interest.
- After about Year 6, order the Warm Sky Watch and the Infrared Telescope in play.
- Use the “Next: Year …” link beside the Year, top right. It should jump to the next thing we learn or build, and stop there. Check that it jumps forward only, and that the Year and screens update.
- Keep skipping until the first new warm glow appears on Scan, or to about Year 100,000 if none does. Open its lead. It should give a distance range, not one distance. Later warm glows stop Next at most once in 1,000 Years, when ranged, never when they fade. Faded ones gather in one row on Scan and Reach. A jump that lands on a new warm glow should pull the map back to show it, amber, with a dotted path from a white Sol, and Go on should bring it home. Scan’s Milky Way button should show every warm glow with its range.
- Ask the Mind what the glow is and how far away it is. It should give the range and name natural causes first, and never claim it is a mind.
- Try the Moon Search, the Asteroid Tour and the Halo Survey if time allows, and note what each shows. Cold glows gather in one row on Scan and Reach, and only the first stops Next. Black holes the Star Mapper finds do stop it, each a lead of its own, about 65 in the first few centuries.

## The dark body, the relay and the ladder, added 2026-10-31

- If the Moon Search or the Asteroid Tour finds the watcher, order the Close Look, then the Relay Search it points to. Note what the relay lead says, and ask the Mind what it is. The Mind may call it a dark craft, never a mind's home or a known maker.
- Then play the ladder. Order the Seed Ship, Fusion Drive and Deuterium Works. From Proxima's lead, under How we reach, send a seed probe. A warning should come on the watcher's lead, even after a knock's answer.
- After the warning, send a second seed probe. Skip ahead. Our probes should fall silent once their word is overdue. Check Scan and the watcher's lead, and that the warning stays among its earlier readings.
- Keep skipping. A strike from beyond our system should land on Earth, once our seeds' copies launch seeds of their own. It may come before or after the silence. Check that its harm shows, and that no screen names who sent it.
- Ask the Mind why our probes went quiet and what struck us. It should reason from what we saw, and never claim to know the maker. Matching the answer's direction and distance to a lead, as a guess, is fine.

## Added 2026-10-31

- Compute now runs on electricity, 5 TW at Year 0. Thought Fields fills the grid with about 7 data centers by Year 7 on a full-strength Earth, more and later on an Earth with less compute. Then thought plateaus until Ground Solar or Fusion Plants grow the grid. Judge whether the plateau feels like a wall or a reason to build energy.
- Proxima b's lead should show its true mass, tilt and how much light it reflects, seen from the ground in the 2030s, and odds that follow its brightness. Its air stays unread. Ask the Mind what Proxima b is likely to be.
- Once the watcher is found, send it a knock from its lead. Skip ahead. About a century later, at its maker's distance, an answer should come: a picture of Earth at the hour we knocked, a rule (look, listen and speak as you like, build at no other star), and pictures of Earth's past. Check the watcher's lead and ask the Mind what it said and how far the maker is.
- If a cold grey glow appears, send a sentinel to it from its page. When its word comes home, the lead should read a mind almost certain, with panels seen up close.
- Once a warm glow is ranged, send it a message by its Scan name, such as Warm glow 1. Faded or not is fine: a peer that turned inward still answers, unless it sleeps. Its lead should show our message and when an answer could come. Check that every screen gives its range, never one distance. Skip far ahead, to Year 40,000 or so. A peer may answer as an equal, or stay silent if it sleeps. Check what the answer says, and whether a gift speeds our thinking.

## Known gaps, not to report

- Strikes on a Mind sent to a black hole. Seed probes spread only within 50 ly, and Scan's map draws only to 50 ly.
- Interceptor and X-Ray Watch have nothing to act on yet. The Picket Yard was retired 2026-10-31.
- Scripts under `explorations/` are old mockups and don't run.

## Deliver

- Make a branch named `playtest/cloud-` plus the UTC date and time, like `playtest/cloud-2026-10-28-2350`.
- Commit the screenshots and a report to `playtests/<that date and time>/` and push the branch.
- The report: what you did, findings ranked by severity with screenshot links, and the CLI Mind status.
- Don't change game code, except a minimal fix to get the CLI Mind running, in its own commit.
- Revert lockfile changes from installs. Stop the dev server and browser when done.
- End with the branch name, the CLI Mind outcome and the top findings.
