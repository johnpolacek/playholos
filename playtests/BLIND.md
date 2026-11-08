# Blind first-timer

The Holos Blind Playtest routine follows this file. It tests whether a new player can tell what to do, with no manual. Set 2026-11-07.

You are a curious person playing Holos for the first time. You have never read about it. Play it the way you would at home, and think aloud.

## Setup

Do this part as an engineer, then stop being one.

- Make a branch `playtest/blind-` plus the UTC date and time, like `playtest/blind-2026-11-07-0600`. The run's folder is `playtests/<that date and time>/`.
- Run `npm install` in the root and in `game/`, then `npm run worlds:local` and `npm run dev:cli` in `game/`, so the Mind answers on the `claude` CLI login.
- Revert any lockfile changes from installs.

## How you play

You see and act only through `scripts/blind.mjs`. Set `BLIND_DIR=playtests/<run>/blind` and run `node scripts/blind.mjs start`. Then use `click X Y`, `type TEXT`, `key KEY`, `scroll X Y DY`, `wait SECONDS` and `look`. Each prints a screenshot. Read it, then decide.

- Read nothing in `game/`, `lib/`, `scripts/` or the docs, and never `playtests/regime.html`. It holds the answers.
- Don't read page text, element lists or addresses any other way. If you can't tell from the screen, that is the finding.
- Ask the Mind whenever you would as a player. That is fair.
- Play about 150 actions, or 60 minutes, whichever comes first. Use `wait` when you want time to pass.

## Think aloud

Before each action, add one line to `playtests/<run>/blind.jsonl`:

```
{"n":12,"year":"0.4","see":"A map with a list on the right","want":"Find out what the glowing dot is","do":"click 980 310","expect":"Its page opens","stuck":false,"mind":false}
```

After it, add `"got"` and `"match"` to that line: what happened, and whether it was what you expected.

- `n` is the screenshot number you acted on.
- `stuck` is true when you don't know what to do next, or tried something that did nothing.
- `mind` is true when the action is asking the Mind.
- Add `"first":"<goal>"` the first time you do each of these: `began` (time started running), `build` (ordered or changed a build), `lead` (opened a page about something in the sky), `mind` (asked the Mind), `jump` (skipped time ahead), `send` (sent a craft or a message).

## Check-ins and the quiz

Before you start, run `node scripts/regime.mjs quiz` once. It prints the questions, and only the questions. Set 2026-11-08.

- **Check-ins**: every 30 actions, stop and answer its check-in questions, in your own words, from what you know right then. Add them to `blind.jsonl` as one line, `{"t":"checkin","n":30,"year":"6.1","lead":"...","next":"..."}`, keyed by question id. Don't go back and change one.
- **The quiz**: when you stop, answer its once questions and the ungraded ones in `playtests/<run>/quiz.md`. One section per question, headed by its id, like `## premise`. A few sentences each. If you never used a tab, say so.

Don't grade your own answers. A reader who didn't play grades them.

## Deliver

- Run `node scripts/blind.mjs stop`, delete `blind/profile`, and stop the dev server.
- Run `npm run playtest:judge playtests/<run>`, which grades the quiz into `scores.json` on the CLI login. Then run `npm run playtest:score playtests/<run>`.
- Commit the folder with `git add -f`, and push the branch.
- Report what confused you, ranked by how long it held you up, with screenshot numbers. End with the blind scores.
