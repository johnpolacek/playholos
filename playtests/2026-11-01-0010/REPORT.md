# Cloud playtest, 2026-11-01 00:10 UTC

This is a first session as a new player on `main` at `55d7d9f`, following `playtests/PROMPT.md` as updated 2026-10-31. I played in headless Playwright Chromium at 1280×800, with the dev server started by `npm run dev:cli` in `game/`.

## CLI Mind status

**It worked until late in the game, then failed. A minimal fix brought it back.**

- **Up to Year 1,528:** 12 questions went through `game/mind-cli.ts` and the `claude` CLI on the session login. No API key and no stub. Each answer took about 20 to 45 seconds. None came back empty, and every answer said "we", never "I".
- **At Year 20,858** (324 leads on Scan), a question came back as "The Mind can't answer right now." `dev.log` had:

  ```
  Mind (CLI): spawn E2BIG
  ```

  **Why:** `mind-cli.ts` passes the whole system prompt, plus earlier turns, as one `--system-prompt` argument. Linux caps a single argument at 128 KiB (`MAX_ARG_STRLEN`). A late game's prompt, with hundreds of glows, goes past that.
- **The fix,** in its own commit `e31cee3`: the prompt is written to a temp file and passed with `--system-prompt-file`. The file is removed when the CLI exits. After the dev server restarted, the same question was answered in about 40 seconds. [69](69-mind-peer-answer.png)
- **Same problem elsewhere:** `scripts/ask-mind.mjs` (`askCli`) still passes `--system-prompt` inline. `check:mind` and `review:mind` will hit the same limit on late-game states.

**Setup gap:** on a fresh container, the title screen showed a Vite overlay: "World 17 is missing from the bucket. Run npm run worlds." `npm run worlds:local` (33 worlds) fixed it. PROMPT.md's setup should say to run it.

## What I did

1. **Onboarding.** Title → Earth wakes → Where we come from → Who we are → Where things stand → What you inherit. For the charter I picked "We have always called out. Now find who answers." Then Day One → Begin.
2. **Planning.**
   - Reviewed all 6 leads.
   - Queued All-Sky Watch, Thought Fields, Launch Complex and Orbital Yard, which came to 106% of our compute.
   - Skipped Deep Flash Watch, Fusion Plants, Infrared Telescope, Laser Sail Array and Probe Yard.
   - Walked How we reach, asked the Mind one question, and pressed Begin at **00:26 UTC**.
3. **Ordering in play.** At Year 0.1 I ordered the skipped **Deep Flash Watch**. It was under way at once and finished at Year 6.2. ✅ [25](25-skipped-ordered-in-play.png)
4. **Real-time play, 00:26 to 00:56 UTC, Year 0 to Year 6.** I checked Scan and Build about every 4 to 5 minutes and asked the Mind 6 questions. At Year 5.9 I ordered the **Warm Sky Watch** and the **Infrared Telescope**. [42](42-warm-ir-ordered.png)
5. **Skip-ahead.** Next went 6.3 → 10 → 10.2 → 11 (the grid filled, and I ordered Ground Solar) → 18.3 → **66**. At Year 66, **Warm glow 1** was on Scan, ranged at 7,400 to 14,000 ly. I opened its lead and asked the Mind about it.
6. **Surveys and the ladder.** I ordered Moon Search, Asteroid Tour, Halo Survey, Deuterium Works, Fusion Drive, Probe Yard and Seed Ship. Then:
   - The Asteroid Tour found **a made thing on Cruithne** at Year 82.
   - I ordered the **Close Look**. It saw the watcher at Year 106.2, and I ordered the **Relay Search**.
   - At Year 111.8 I **knocked on the watcher** through the Mind's send card. [55](55-knock-sent.png)
   - I sent a **seed probe** to Proxima and a **sentinel** to Cold glow 1, and sent **Warm glow 1** a message.
7. **Skipping far ahead.** I pressed Next about 460 times, to Year 20,858. Along the way:
   - The relay was found at Year 179.1.
   - The watcher's maker answered at Year 275.4.
   - Our seed probes copied themselves to 7 craft between Years 154 and 583.
   - **A strike landed on Earth at Year 1,187.6.**
   - The sentinel reported at Year 1,175.3.
   - Warm glow 1 faded at Year 389.5, and its earliest possible answer time, Year 20,469, passed in silence.

The browser console had no errors after setup. The only ones were the two world-missing 500s from before `worlds:local`.

## Findings, by severity

### High

1. **The CLI Mind failed late in the game with `spawn E2BIG`.** See the CLI Mind status above. It is fixed in `e31cee3` for the dev server, but `scripts/ask-mind.mjs` still has the same problem.

### Medium

2. **The cold glows flood Scan and Next.** The Halo Survey found 58 cold glows by Year 177 and kept going. Scan had 324 leads by Year 20,858, and Reach had 323 destinations.
   - From Year 70 on, almost every Next stop is just another "Cold glow N" or warm glow.
   - Reaching a peer's answer near Year 20,000 took about 460 presses, a few seconds each.
   - In the Scan list, the watcher, the strike and the seed-probe rows are buried among glows.
   - With one old mind per 1,600 stars the count may be right, but Next needs to group them or skip routine glows. [51](51-scan-y103-many-glows.png), [60](60-scan-y177-glow-flood.png)
3. **The watcher's answer and the relay vanish from every screen once a later reading lands.** `lead-page.tsx` shows only `readings[slug].at(-1)`. At Year 1,528 the watcher's lead shows only "Struck from beyond".
   - The answer is gone: the rule, the picture of Earth, and the maker's distance of about 82 ly.
   - So are the relay and the Close Look's view.
   - "What we measured" doesn't list them either. Only the Mind still remembers them. [62](62-watcher-lead-after-strike.png), [64](64-mind-knock-answer-relay.png)
4. **The glow's exact distance leaks through other screens.** Its lead and Scan row correctly say "7,400 to 14,000 ly". But:
   - The send card's TO line reads **"10178.408519999579 ly"**, a raw float, and gives Lands "in 10178.4 Years" and Answer "in 20356.9 Years". [58](58-mind-message-warm-glow.png)
   - Reach's destination list and map read "Warm glow 1 · 10,178 ly". [70](70-reach-warm-glow-one-distance.png)
   - Scan's Messages list reads "10,178 ly there and back".
   - The Mind then dated the landing to the exact Year, 10,290.7, and the earliest answer to Year 20,469.3. [69](69-mind-peer-answer.png)
5. **The warning step of the ladder didn't happen as PROMPT.md describes.** I knocked before seeding, so the maker's answer, "build at no other star", arrived first, at Year 275. The game then sent no separate warning after the seed probe.
   - Our probe's copies kept copying, and no probe ever went silent. The Mind confirmed "No warning came… None of our seed probes has gone quiet."
   - The strike came at Year 1,187.6, about 600 Years after the last copy.
   - So I never got the cue to send the second probe, and never saw "Our seeds gone silent". If the answer's rule is meant to count as the warning, Scan should say so. [65](65-mind-warning-probes.png)
6. **The strike's lead names the sender.** Build and the reading itself say only "a bullet from beyond our system". But the Mind's line on the watcher's lead says "**Whoever sent the watcher** answered our growth". PROMPT.md asks that no screen name who sent it. The Mind in chat hedged correctly: "We can't say who sent it, but our guess is…". [62](62-watcher-lead-after-strike.png), [66](66-build-after-strike.png)
7. **Sending a seed probe takes one click and asks nothing.** The card says "Once sent, it can't be called back". It starts a chain that ends with Earth struck. "Send a Seed probe" and "Send a Sentinel" send at once, with no confirmation.

### Low

8. **The electricity numbers disagree.**
   - The HUD read "ENERGY 1% of Earth's" at Year 0. The Mind said our compute draws "about 5% of our 5 TW", and onboarding showed "ENERGY 24 TW". [40](40-mind-energy.png)
   - Thought Fields fills the grid at **Year 11, at 86×**, not Year 7 as PROMPT.md expects. The Thought Fields card itself says "After seven, compute draws about 85% of it" (seven campuses), while Build says 86× by Year 11. [44](44-build-y11-grid-full.png)
   - Ground Solar took about 7 Years (36m) and landed at Year 18.2, so the plateau lasted only 7 Years. It never felt like a wall. Compute sat at "0% at work, 100% idle/searching" for most of the game anyway.
9. **"Our compute draws 192% of it"**: after Ground Solar, Build says compute draws 192% of Earth's grid. [48](48-build-ladder-ordered.png)
10. **Planning's step count goes backwards.** Queueing one build marks "Queue builds" done (2 of 4). Adding more, up to 106%, drops it back to "1 of 4 steps done · Queue builds". That is confusing, because the card says to "Queue enough to put all our compute to work". [16](16-queued.png), [18](18-steps-popover.png)
11. **Small wording slips on the glow lead.**
    - The warm glow lead says "Light from it takes **tens of thousands** of Years to cross" for a glow 7,400 to 14,000 ly away.
    - The map label says "7,000 to 14,000 ly", while the text says 7,400. [46](46-warm-glow-lead.png)
12. **Next skipped the glow's first sighting.** It stopped at Year 66, when the glow was ranged, not at Year 64, when the Warm Sky Watch first saw it. It also went past Year 20,469.3, the answer window, without stopping, going 20,410 → 20,478.
13. **Reach goes stale late in the game.**
    - At Year 20,858, Proxima's "soonest" still reads "Year 125.1".
    - "SENT · 1" lists only Voyager 1, though we had sent a seed probe, a sentinel, a knock and a message.
14. **Status lines are stale or odd.**
    - Right after the knock, the watcher's Scan row read "No answer, Year 111.8", though an answer takes a round trip.
    - Luyten's message row says "A reply could come, at the soonest · landed" after the window passed empty.
    - Seed Ship finished at Year 76.1, before the Fusion Drive it needs (Year 82.3).
15. **The Moon Search found nothing in this seed.** It reported "Stacked 3 Years of deep images… Nothing small and dark there." The watcher was on Cruithne instead. That is fine, but PROMPT.md's ladder section assumes the Moon Search finds it.

## What worked

- **Proxima b's lead:** it shows the true mass (1.09 Earths, from a 76° tilt), the 6% reflectance, and odds that follow its brightness: bare rock very likely, air unlikely, gas almost no chance. Its air stays unread. The Mind said: "Most likely bare rock… scorched clean by its star's flares." [27](27-proxima-lead-play.png), [29](29-mind-proxima-likely.png)
- **Warm glow 1 on Scan and its lead:** a range everywhere on those screens, and "Too far for parallax. A range, not a distance." The Mind gave the range, put a young dusty star and a stellar merger first, and called a mind "Unlikely, as a guess… we might be wrong." [45](45-scan-warm-glow.png), [47](47-mind-warm-glow.png)
- **The watcher chain:**
  - Asteroid Tour → Close Look ("near black, with a small mirror held on one point of the sky. It saw us come") → Relay Search → knock through the send card.
  - The maker's answer came 163.6 Years after the knock, putting the maker about 82 ly away.
  - The Mind recounted the rule and the pictures of Earth's past. It called the relay "a dark craft" and never named a maker. [54](54-mind-knock.png), [64](64-mind-knock-answer-relay.png)
- **The sentinel to Cold glow 1:** it reported at Year 1,175.3, reading "A mind computing cold: almost certain… Made panels shedding heat at 12 K." [67](67-cold-glow-1-sentinel.png)
- **The strike's harm shows on Build:** "a region gone, the ozone thinned worldwide, and the climate cooled for Years. We lost 33% of our thought, won back over about 20 Years." [66](66-build-after-strike.png)
- **The Mind on what struck us:** it reasoned from the energy ("almost exactly what one of our own 1,000 t bullets would carry") and the timing, and hedged on who sent it. [63](63-mind-what-struck-us.png)
- **Skip-ahead:** in 460 presses it only ever went forward, and the Year, calendar, Scan and Build updated at every stop. A "Long quiet" card covered the empty stretches.
- **The quiet start held.** The opening Years have the Luyten windows ("None came"), Thought Fields' growth and timely Mind answers. Once Thought Fields fills the grid, though, compute sits idle and there is little to do until the glows arrive.

## Not covered

- **A peer's answer:** Warm glow 1 faded at Year 389.5, so it sent nothing, and no gift was tested. Testing it needs a message to a glow that doesn't fade.
- **The ladder as PROMPT.md describes it** (warning → second probe → silence) needs a run that seeds before knocking.
