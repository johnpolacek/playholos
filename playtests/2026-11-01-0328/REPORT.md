# Cloud playtest, 2026-11-01 03:28 UTC

This is a first session as a new player on `main` at `d724341`, following `playtests/PROMPT.md` as updated 2026-10-31. I played in headless Playwright Chromium at 1280×800. The dev server ran with `npm run dev:cli` in `game/`, after `npm run worlds:local`.

## CLI Mind status

**It worked for the whole run. No fix was needed.**

- 12 questions went through `game/mind-cli.ts` and the `claude` CLI on the session login. No API key and no stub.
- Answers took about 5 to 30 seconds. My script's timings run about 15 s high, because it waits for the text to stop changing.
- None came back empty, and none said "I": every answer used "we".
- The last question was asked at Year 34,944, with 464 warm glows and 68 cold glows on Scan. It answered in under 30 s. The `--system-prompt-file` fix from the last playtest holds. [61b](61b-mind-late.png)
- `dev.log` had no errors. The browser console had no errors either, only WebGL "GPU stall due to ReadPixels" warnings.

## What I did

1. **Onboarding.**
   - Title → Earth wakes → Where we come from → Who we are → Where things stand → What you inherit.
   - For the charter I picked "Be bold with what we know, careful with what we don't." Then Day One → Begin.
2. **Planning.**
   - Reviewed all 5 leads.
   - Queued Thought Fields, All-Sky Watch, Launch Complex, Star Mapper and Halo Survey.
   - Skipped the Warm Sky Watch, Infrared Telescope, Deep Flash Watch, Moon Search, Asteroid Tour and the rest.
   - Walked How we reach, asked the Mind one question, and pressed **Begin · Year 0 at 04:01 UTC**.
3. **Ordering in play.** At Year 0.1 I ordered the skipped **Deep Flash Watch**. It was under way at once and finished at Year 4.5. ✅ [23](23-deep-flash-ordered.png), [24](24-build-in-play.png)
4. **Real-time play, 04:01 to 04:32 UTC, Year 0 to Year 5.9.**
   - I checked Scan and Build 7 times, about every 4.5 minutes. See `c1` to `c7`.
   - I asked the Mind 4 questions.
5. **At Year 5.9** I ordered the Warm Sky Watch, Infrared Telescope, Moon Search, Asteroid Tour, Deuterium Works, Fusion Drive and Seed Ship. [26](26-warm-ir-ordered.png)
6. **Skip-ahead.**
   - **Warm glow 1** was first seen at Year 11.6 and ranged at Year 13.7, at 16,000 to 30,000 ly. I opened its lead and asked the Mind about it. [27](27-scan-warm-glow.png), [28](28-warm-glow-lead.png), [29](29-mind-warm-glow.png)
7. **The ladder.**
   - **Year 233.4:** sent a seed probe to Proxima. [33](33-seed-sent.png), [34](34-seed-confirmed.png)
   - Messaged Warm glow 3 while it still shone. [36](36-warm-glow-3-sent.png)
   - Sent a sentinel to Cold glow 1. [41](41-sentinel-sent.png)
   - **Year 251.3:** the warning came, "A signal from close by · An answer to our ship".
   - **Year 980:** sent a second seed probe, to 61 Ursae Majoris. [45](45-second-seed-sent.png)
   - **Year 980.2:** knocked on the watcher through the Mind's send card. [49](49-knock-sent.png)
   - **Year 1,106.6:** the answer came.
   - **Year 1,107.8:** a strike landed on Earth.
   - **Year 1,691:** "Our seeds gone silent".
8. **A peer.** Every warm glow up to number 8 had faded before I could message it. I caught Warm glow 9 the stop after it was ranged and messaged it at Year 2,420. Then I pressed Next about 1,000 times, to **Year 34,944**, where I stopped for time. No answer had come. Its window runs from Year 22,420 to Year 42,420. [59](59-warm-glow-9-sent.png), [61b](61b-mind-late.png)

The Next link never went backward in about 1,000 presses. The Year, calendar, Scan and Build updated at every stop.

## Findings, by severity

### High

1. **The warm glows flood Next and Scan late in the game. It is close to unplayable.**
   - Warm glows: 18 by Year 5,000, 111 by Year 10,000, 292 by Year 20,000, 464 by Year 34,944.
   - Nearly every Next stop past Year 5,000 is just another new or fading warm glow.
   - Getting from Year 2,420 to Year 34,944 took about 1,000 presses and **about 2 hours of wall time**. Each press slowed from about 5 s to about 10 s as the list grew.
   - Reaching a peer's answer window, as PROMPT.md asks, costs more than a playtest can spend. A real player would give up.
   - Scan's lead list and map labels run to hundreds of rows. Glow lists need grouping the way cold glows are grouped, and routine glows shouldn't stop Next. [62](62-scan-y34944.png)
2. **Every warm glow fades before a message could matter, so "pick one that hasn't faded" is nearly impossible.**
   - Glows lasted between about 55 and 420 Years. Warm glow 3 was shining when I messaged it at Year 233.7 and faded at Year 288.1. Warm glow 9 was shining at Year 2,420 and faded at Year 2,546.
   - A message takes 10,000+ Years to land, so every peer we can reach will have "turned inward" by then, if fading means that.
   - The Mind itself said the fading "makes it more likely natural".
   - So the peer-answer path is very hard to reach in play. [60](60-warm-glow-9-y26k.png)

### Medium

3. **Next sometimes stops on an event but shows "Nothing new reached us", and the event shows only at the following stop.**
   - Next went 999.9 → 1,106.7 with "107 Years passed · Nothing new reached us on the way". But the watcher's answer to our knock is dated **Year 1,106.6**, inside that stretch.
   - The same thing happened at Year 2,546: "126 Years passed · Nothing new reached us", while Warm glow 9 faded at Year 2,546. That only appeared at the next stop, 2,579.6.
   - The first stop after Warm glow 9 appeared, at Year 2,419.6, also read "509 Years passed · Nothing new", though the glow was first seen at Year 2,417.6.
4. **The send confirmation's button is clipped off the panel.**
   - On Reach, "Send a Seed probe" and "Send a Sentinel" now ask "Can't be called back. Wait / Send it". That fixes the last playtest's missing confirmation.
   - But the "Send it" button runs off the right edge of the panel: only "Se" shows. The Needs chips wrap to one word per line to make room.
   - In `destination.tsx` the confirm row is `shrink-0` beside the Needs list. [33](33-seed-sent.png), [40](40-sentinel-confirm.png), [44](44-second-seed-confirm.png)
5. **A watcher known only by its warning is a dead end, but its lead points to a fix we can't build.**
   - In this seed, the Moon Search and the Asteroid Tour both found nothing. "Only rock" from the Asteroid Tour, which maps "each asteroid sharing Earth's orbit".
   - The watcher came only through the warning. Its lead says **"Where: Sun–Earth L4"**, which is Earth-orbit-sharing space, and "A craft sent to look closely would see what it is".
   - But no Close Look or Relay Search ever appears on Build. `lib/sim/minds.ts` says one known only by its warning "sits where no craft finds it".
   - Either the lead shouldn't name a place and suggest a craft, or the Asteroid Tour's "Only rock" is inconsistent with a watcher at L4. [42](42-signal-lead.png), [43](43-build-y979.png)
6. **The watcher's distance is wrong on the knock card.** The send card's TO line reads **"1.3 light-seconds"**, which is Moon distance. The Mind's own text in the same reply says "At 8 light-minutes", which fits Sun–Earth L4. [48b](48b-mind-knock.png)
7. **The warning reading itself is gone from the watcher's lead.**
   - After the knock, the lead lists the strike, the answer and our knock as "EARLIER" readings.
   - The Year 251.3 reading, "A narrow laser aimed at Earth, timed to our first seed ship", is not among them. Only the subtitle "An answer to our ship" remains. [51](51-watcher-lead-after-strike.png)
8. **"Our seeds gone silent" mixes one and many.**
   - The title is plural. The body says "**One** of our seed probes went silent… Gliese 1138", then "The last word from **each**" and "found **each of them**".
   - The Mind said "Only one has gone quiet". Our first wave, at Proxima, Barnard's Star and others, never went silent. [54](54-watcher-lead-silent.png), [55b](55b-mind-why-quiet.png)
9. **The ladder order differed from PROMPT.md.**
   - The warning came at Year 251.3. The strike came at Year 1,107.8, only 1.2 Years after the knock's answer.
   - Silence came after that, at Year 1,691, after our second probe's copies had launched 6 more seeds: Groombridge 1830, Gliese 450, Chara, Noquisi, Gliese 1151 and Gliese 1138.
   - So the strike preceded the silence, and the copies kept spreading after the warning and the strike.
10. **The Mind places the maker.** Asked who struck us, it said: "Our guess is the minds behind the watcher, near Cold glow 1, 63.2 light-years off". It hedged, with "We might be wrong: no one has claimed it", and the 63 ly does match the answer's 126-Year round trip. But PROMPT.md asks that it never claim to know the maker, and tying the maker to a specific glow is close to that. The strike's lead itself stays neutral: "Nothing we saw says who sent it." [55b](55b-mind-why-quiet.png), [51](51-watcher-lead-after-strike.png)

### Low

11. **Cold glows still stop Next.** PROMPT.md says only the first should. From Year 19.9 to Year 233, 22 of 40 stops showed nothing new but the cold-glow count going up, from 11 to 68. Scan does group them in one row now. ✅
12. **Reach is stale after sends.**
    - "SENT · 1" still lists only Voyager 1 after two seed probes, a sentinel, a knock and two messages.
    - 82 Eridani's unsent flyby probe shows "passes 420.4, we see it 440.1" at Year 979, which are dates in the past.
13. **Raw Year numbers.** Reach's soonest column reads "Year 7817.9" and "Year 80035.6", with no thousands separator. Elsewhere it is "1,560 ly". [17](17-reach.png), [30](30-reach.png)
14. **A messaged glow's lead doesn't mention our message.** Warm glow 9's lead shows the first sighting, range and fade, but not that we sent it a message, or when an answer could come. Only Scan's Messages and the Mind say so.
15. **Onboarding doesn't survive a reload.** A reload anywhere before Day One's Begin returns to the title. You have to replay about 3 minutes of memories.
16. **The compute plateau is quiet, not a wall.**
    - Thought Fields filled the grid at Year 7, at 17×, as PROMPT.md expects ✅. Build shows "draws 71% of it".
    - From Year 4, compute sat at "1–2% at work, 98–99% idle or searching". Nothing asked for it, so the plateau never pushed me to build energy.
    - When asked, the Mind explained the cap well and offered Fusion Plants with a live card. [c5](c5-mind.png), [31](31-build-y233.png)

## What worked

- **Proxima b's lead:** it shows the true mass (1.07 Earths, from an 80° tilt), the 17% reflectance, and "Seen by RISTRETTO and ANDES, in the 2030s". The odds follow its brightness: bare rock very likely, air unlikely, gas almost no chance. Its air stays unread. The Mind said: "Bare rock, very likely… We might be wrong, since no one has read its air." [11](11-proxima-lead.png), [25](25-mind-proxima-b.png)
- **Ranges everywhere for warm glows.** The lead, the Scan row, the Reach destination and the send card all read "12,000 to 23,000 ly" and "lands Year 12,233.8 to 23,234.1". The last playtest's single-distance leak is fixed. [28](28-warm-glow-lead.png), [35](35-mind-message-warm-glow-3.png), [36](36-warm-glow-3-sent.png)
- **The Mind on Warm glow 1:** it gave the range and named a young dusty star and a merger first. Its guess was "likely natural, though we might be wrong". [29](29-mind-warm-glow.png)
- **The knock's answer:** it came 126.4 Years after the knock. It carried a picture of Earth at the hour we knocked, the rule ("Look, listen and speak as you like. Build at no other star."), and pictures of Earth's past. The watcher's lead now keeps every reading under "EARLIER", which fixes the last playtest's vanishing readings. [51](51-watcher-lead-after-strike.png)
- **The strike's harm shows** on Build: "a region gone, the ozone thinned worldwide, and the climate cooled for Years. We lost 33% of our thought." No screen names the sender. [52](52-build-after-strike.png)
- **The quiet start held my interest.** In the first 30 minutes there were the Luyten reply windows ("None came"), Thought Fields' growth, three cold glows by Year 2.6, and clear Mind answers about why the sky is quiet. [c1](c1-mind.png), [c3](c3-mind.png)
- **Skipped builds can be ordered in play,** with the time they take. ✅

## Not covered

- **A peer's answer:** I stopped at Year 34,944 for time. Warm glow 9's window runs to Year 42,420.
- **The sentinel's word from Cold glow 1:** it was due at Year 976, but I never opened Cold glow 1's lead to read it.
- **The relay and the Close Look:** this seed's watcher came only by warning, so neither was offered.
