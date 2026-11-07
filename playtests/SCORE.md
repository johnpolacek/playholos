# Playtest scores

How a playtest scores the game. Three players, four ratings each, every rating 0 to 10. Set 2026-11-06.

The playtest in `PROMPT.md` plays once. Then each player reads that one run, its screenshots and `log.jsonl`, and rates it. The same run for all three, so a change in score comes from the build, not the luck of the run.

## Rules for every rating

- Rate from the anchors below, so a 6 means the same every run.
- Cite evidence for every rating: a screenshot file or a `log.jsonl` line. No evidence, no rating.
- Write one short line on why. Name the worst moment, not an average feeling.
- Rate only what the run showed. If the run never reached it, write `null` and say why.
- Ratings marked **code** are computed by `npm run playtest:score`. Leave them out of `scores.json`.

## First-timer

A new player, curious, no manual.

- **clarity**: do we know what to do next, and why?
  - 0–2: stuck, no idea what to do. 3–5: often unsure, guessed. 6–8: mostly clear, a few guesses. 9–10: always knew.
- **feedback**: does each action visibly change something?
  - 0–2: actions vanish. 3–5: some land, some don't show. 6–8: most show, a few late or stale. 9–10: every action shows at once.
- **pull**: do we want to keep going after each stop?
  - 0–2: wanted to quit. 3–5: kept going out of duty. 6–8: curious most of the time. 9–10: couldn't stop.
- **friction**: dead ends, clipped or broken screens, console errors, lost progress.
  - 0–2: blocked the run. 3–5: several, each costing minutes. 6–8: one or two small ones. 9–10: none.

## Astronomer

Knows the real sky and the research. Checks every number.

- **accuracy**: distances, masses and odds match real data and the newest research.
  - 0–2: a contradicted fact. 3–5: several loose numbers. 6–8: one small slip. 9–10: all hold up.
- **honest doubt**: ranges not one distance, natural causes first, never a claimed mind or maker.
  - 0–2: claims what we can't know. 3–5: leans past the evidence. 6–8: one overreach. 9–10: always honest.
- **consistency**: the same fact reads the same on every screen and in the Mind.
  - 0–2: screens contradict on key facts. 3–5: several mismatches. 6–8: one. 9–10: none.
- **reasoning**: the Mind's answers follow from what we saw, and say how sure we are.
  - 0–2: made up or wrong. 3–5: vague or padded. 6–8: sound, a little loose. 9–10: sharp and earned.

## Long-hauler

Plays deep, past Year 10,000, pressing Next a lot.

- **pacing** (**code**): share of Next stops with something new.
  - Score is that share times 10, rounded.
- **scale**: do Scan, Reach and leads stay readable with hundreds of glows?
  - 0–2: unreadable. 3–5: hard to find what matters. 6–8: busy but workable. 9–10: clear at any count.
- **agency**: can we still act in time, before glows fade or windows close?
  - 0–2: always too late. 3–5: mostly too late. 6–8: usually in time. 9–10: always a fair chance.
- **payoff**: do long waits end in answers, gifts or harm that feel earned?
  - 0–2: waits lead nowhere. 3–5: rare payoff. 6–8: most waits pay. 9–10: every wait pays.

## Files the playtest writes

`log.jsonl`, one JSON object per line, written as we play:

```
{"t":"next","year":233.4,"news":true,"what":"Warm glow 3 ranged"}
{"t":"next","year":240.1,"news":false,"what":"Nothing new reached us"}
{"t":"mind","year":12.0,"q":"What is that glow?","a":"...","secs":14}
{"t":"error","year":5.1,"text":"console error text"}
```

`news` is true only when the stop shows something we didn't know before. A count going up alone is not news.

`scores.json`:

```
{
  "build": "8f02c79",
  "first-timer": { "clarity": { "score": 7, "why": "...", "evidence": ["12-scan.png"] }, ... },
  "astronomer": { ... },
  "long-hauler": { "scale": { ... }, "agency": { ... }, "payoff": { ... } }
}
```

Then run `npm run playtest:score playtests/<folder>`. It adds the code ratings, writes `SCORECARD.md` in the folder and prints the trend across past runs.
