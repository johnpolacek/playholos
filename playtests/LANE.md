# Lane playtest

A lane is a focused playtest: one question, one persona, one kind of finding. Your lane, its question, who you are, its steps and what is out of it are given above this file. The lanes and their groups live in `playtests/regime.html`. Set 2026-11-09.

You find and log. You rate nothing. A reader who didn't play rates the lane from what you leave.

## Play

- The game runs at `HOLOS_URL`. Play it in headless Playwright Chromium, as the note above says, and take screenshots.
- If the lane starts from a saved state, load it before the game first loads:

```
import { fixture, seedPage } from "./scripts/states.mjs";
await seedPage(page, fixture("<state>"));
```

- Otherwise start fresh, with no saved state. Read the seed once the game is open: `JSON.parse(localStorage.getItem("holos:save")).seed`.
- Follow the lane's steps in order. Stay inside the lane's question. Note anything outside it in one line of REPORT.md, never as a finding.
- Take a screenshot at each moment a finding rests on. Name it for what it shows, like `07-sail-ready-before-array.png`, in the run's folder.
- Keep to the lane's minutes. Stop when the steps are done or the time is up.

## Log

Write `log.jsonl` in the run's folder as you play, in the format `node scripts/regime.mjs formats` gives: every Next stop, every Mind question and answer whole, every console error. Lane notes are lines like `{"t":"note","year":4.2,"note":"...","shot":"07-x.png"}`. Log the Mind's words exactly as they show.

## Findings

Write `findings.jsonl` in the run's folder, one line per finding:

```
{"title":"Send a Sail is clickable while the Laser Sail Array is only queued","impact":"misleads","where":"Reach, 61 UMa","saw":"The button was lit and opened a send card","expected":"Greyed, saying it waits on the array","shot":"07-sail-ready-before-array.png","log":14}
```

- impact is one of: `blocks`, `misleads`, `slows`, `cosmetic`. `node scripts/regime.mjs lanes` defines them. Judge by what it does to a player, not how it looks.
- Every finding cites a screenshot or a log line. No evidence, no finding.
- One finding per fault. If it shows in many places, name the clearest and count the rest in `saw`.
- `node scripts/regime.mjs gaps` lists known gaps, and `node scripts/regime.mjs settled` design calls already made. Don't report those.

## Report

Write `REPORT.md` in the run's folder: the lane, the seed or state, how far you got, the findings ranked worst first with their screenshots, and one line for anything you noticed outside the lane.

Write `scores.json` with only `"lane"`, and `"seed"` or `"from"`.

Don't change game code. Close the browser when done.
