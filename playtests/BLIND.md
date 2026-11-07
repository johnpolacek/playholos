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

- Read nothing in `game/`, `lib/`, `scripts/` or the docs. Don't open `playtests/BLIND-KEY.md` until the quiz is written.
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

## The quiz

When you stop, answer in `playtests/<run>/quiz.md`, in your own words, a few sentences each:

1. What is this game about, and who are you in it?
2. What are Scan, Build, Reach and Mind each for?
3. What is the most important open question in your game right now?
4. What would you do next if you kept playing, and why?
5. What confused you most?

Then open `playtests/BLIND-KEY.md` and grade each of answers 1 to 4 against it, from 0 to 10, in `scores.json` under `"blind"`, as `"understood"`, with your grades averaged into one score and a short why. Quote what you got wrong.

## Deliver

- Run `node scripts/blind.mjs stop`, delete `blind/profile`, and stop the dev server.
- Run `npm run playtest:score playtests/<run>`.
- Commit the folder with `git add -f`, and push the branch.
- Report what confused you, ranked by how long it held you up, with screenshot numbers. End with the blind scores.
