# Cloud playtest, 2026-11-07 03:12 UTC

Build `7970425` (origin/main). Played headless in Chromium at 1440×900. The CLI Mind answered through `claude` 2.1.319.

## CLI Mind status

**Working.** I followed the setup exactly: `npm install` in the root and in `game/`, then `npm run worlds:local` (33 worlds), then `npm run dev:cli`. The dev log said "The Mind answers on your Claude login through the claude CLI." I made no code changes.

- I asked 15 questions and every one got an answer. Replies I timed came in 2–20 s: 6 s, 8 s, 6 s, 8 s, 10 s, and 20 s at Year 57,000. For the others the harness timer broke (noted in `log.jsonl`), but each reply landed within about 10 s.
- No empty replies. No line where the Mind said "I". It always said "we".
- No console errors or page errors in the whole run (0 lines captured).

## What I did

1. **Onboarding.** Played Earth wakes → Where we come from → Who we are → Where things stand → What you inherit → Meet the Mind, then Begin. Screenshots 01–11.
2. **Review scans.** Went through all 9 leads (12–14), picked the **Search** strategy (15–17) and edited the order: dropped the Warm Sky Watch and Infrared Telescope, added the Moon Search (18–19). Did How we reach (20–21), asked the Mind what to do first (24), then began (25–26).
3. **Real time.** Played 30 minutes in real time (03:24–03:55 UTC, Year 0 → 6.1), checking in every 3–4 minutes (30, 34–41) and asking 5 questions. The dropped builds showed **Add to Queue** in play (27). At Year 6.0 I ordered the Warm Sky Watch, Infrared Telescope, Deuterium Works, Fusion Drive, Probe Yard and Seed Ship (42).
4. **Skipping ahead.** Used the header jump link 97 times, Year 7 → 57,000. Every jump went forward only, and the Year and screens updated each time. Each stop is in `log.jsonl`.
5. **Watcher and ladder.**
   - The Asteroid Tour found a made thing on 2004 GU9 at Year 11.5.
   - Knocked at Year 14.6. Close Look at 17.3: a mirror pointing at RA 10.4 h. Relay Search found a dark craft 1,260 AU out at 61.1. The knock's answer came at 61.8: 47 Years round trip, so ~24 ly.
   - Seed probe to Proxima, ordered at Year 27.5. It left at 45.4, and the warning came then. Second seed probe to Keid at 45.9.
   - A seed went silent at 310.1, then 6 of them. The strike on Earth came at 464.9: −33% thought, no sender named.
6. **Glows.**
   - The first warm glow was ranged at Year 13.6, at 11,000–22,000 ly, on the lead and in the Mind.
   - **Close Readings: 5 of 5 came back plain heat, 0 dust** (Prometheus, Hestia, Agni, Pele, Hephaistos). None felt earned (see finding 3).
   - Sentinel to Cold Glow 1, which became Skadi: "a mind almost certain, panels" at Year 338.3.
   - Message to Warm Glow 1 at Year 46.7. It answered as an equal at Year 28,554.5 from ~14,254 ly, with a gift: thinking goes 2.3 times as far.
7. **Moon Search, Asteroid Tour, Halo Survey.**
   - Moon Search: nothing at L4/L5 down to 10 cm, reported only when asked (38).
   - Asteroid Tour: found the watcher.
   - Halo Survey: the first cold glow at Year 0.7, 76 by Year 465. Cold glows group into one row on Scan.
   - Star Mapper: black holes, each one a stop.

## Findings, by severity

### High

1. **Big news lands silently on its Next stop.** The sentinel's word that Skadi is "a mind almost certain" arrived at Year 338.3. The stop at 338.4 said "Nothing more reached us yet" ([96](96-jump-y338-sentinel-word-hidden.png), [88](88-cold-glow-1-skadi.png)). The peer's answer and gift at Year 28,554.5 showed as a "Heard" card, but the stop's own text said "Nothing else reached us on the way" and listed only warm glows ([95](95-jump-y28554-peer-answer-hidden.png)). I only learned of the gift by asking the Mind ([94](94-mind-prometheus-answer.png)). These are two of the biggest payoffs in the game.
2. **A lead's MIND bar contradicts its own "What it could be" list.** On the watcher, "Something made, left to watch" is almost certain, yet MIND stays 0.03–0.7% even after it speaks to us in 11 languages and answers our knock ([67](67-watcher-warning-lead.png), [76](76-watcher-answer.png)). On Skadi, "A mind computing cold" is almost certain at 0.07–2% ([88](88-cold-glow-1-skadi.png)). On Cold Glow 1 at Year 2, a mind was "roughly even" at 0.07–2% ([31](31-cold-glow-1.png)). The Mind quotes the low bar as "Scan gives a mind behind it only 0.03 to 0.7%" ([55](55-mind-watcher.png)).
3. **One featureless spectrum jumps to 79–96% mind.** After a single Close Reading with no 10-micron bump, the odds go from 4–21% to 79–96%. Built moves from "very unlikely" to "very likely", and the Mind says "Something solid is catching a star's light". All 5 of 5 readings came back plain heat ([60](60-warm-glow-1-plain-heat.png)). Carbon-rich dust is featureless at 10 microns too, so a missing silicate bump doesn't rule dust out. The Mind's chat then quotes 79–96% when we message it ([73](73-message-prometheus-sent.png)).
4. **Scan gives a messaged warm glow one distance.** The message rows read "Warm glow 1 · 15,556 ly" and "arrives in 15485.9 Years", with no thousands separator and a decimal. They should show the 11,000–22,000 ly range, and the glow's new name, Prometheus ([80](80-scan-message-single-distance.png)).

### Medium

5. **The rename breaks the Mind's text.** "Prometheus, once Prometheus, lies 11,000 to 22,000 light-years out" ([73](73-message-prometheus-sent.png)). My question "Send a message to Warm Glow 1." also showed in chat as "…to Prometheus." The Heard card at 28,554 still says "Warm glow 1" and "sent in 16340", a raw year with no "Year".
6. **The watcher lead is filed under Quiet.** The Year 11.5 "NOT ALONE" headline sends you to a lead that isn't in Needs Us ([52](52-scan-quiet-list.png)). The lead has no buttons for a Close Look or a knock. I found the knock only by asking the Mind ([53](53-watcher-lead.png), [56](56-mind-knock-how.png)).
7. **Lead text overreaches on the first silent seed.** It says "Something cold and fast found it at its star… This reads as the answer," but the same reading says "Its last word showed nothing coming." The Mind's chat was honest: "We don't know why… That is a guess" ([82](82-watcher-seed-silent.png), [83](83-mind-probes-quiet.png)).
8. **Warm glows fade before we can act.** Glows 5 and 6 appeared and faded inside one 55-Year jump (62.7 → 117.2), before a reading could start ([78](78-jump-55-years-proxima.png), [81](81-scan-quiet-y123.png)). Only one 3-Year reading can run at a time.
9. **Empty Next stops.** "Jump to word from our craft" stopped 3 times on "Word is still coming in…" with nothing new (Years 315, 329, 443). A fourth such stop, at 338, hid the sentinel's word (finding 1). One stop at 36.3 held only cold glows 15–21, though only the first cold glow should stop Next ([97](97-jump-y36-cold-glows-only.png)). From Year 468 on, nearly every stop is a warm-glow count going up ([98](98-jump-y5303-glow-count-only.png)). Pacing works out to 4 of 10.
10. **Results don't announce themselves.** The Mind said the Moon Search "gives its answer near Year 3.7" and the Kamoʻoalewa map comes "near Year 4.5". Neither ever came up unasked ([36](36-mind-feed-y44.png), [39](39-mind-feed-y5.png)). The results sit on the build pages ([37](37-moon-search-page.png), [41](41-build-y6.png)).

### Low

11. **The strategy step loops.** After you edit the order, the checklist goes back to "Next: Pick our strategy", and the header falls from 2 of 4 to 1 of 4 ([22](22-pick-strategy-again.png), [23](23-steps-pill.png)). Begin still works.
12. **The cold glow map gets cluttered.** The nearby map labels every cold glow and draws a ray for each, and labels overlap near the core in the Milky Way view ([86](86-scan-after-strike.png), [89](89-milky-way-view.png)).
13. **Small number mismatches.**
    - Roads to come says the Fusion Drive "alone takes thirty Years", but the order shows Year 22.8 ([21](21-reach-4.png)).
    - The Mind says the Orbital Yard is done near Year 11.1, but its card says Year 11.9 ([43](43-mind-idle-compute.png)).
    - The strike reads "108,216 Mt", falsely precise.
    - The Moon Search "needs 0% of our compute" ([19](19-order-edited.png)).
    - The Mind says "Our charter leans open and bold", but no charter was ever picked ([56](56-mind-knock-how.png)).
    - Two stellar black holes within 25 ly is a stretch.
14. **Reach doesn't show the silence.** The seed probes at Proxima and Keid still read "Its first word has reached us" after the lead says all 6 went silent ([93](93-reach-y55k.png)).
15. **The jump link went missing once.** At Year 28.6 the header link was gone for one try. It came back after navigation ([65](65-no-jump-link-y28.png)).

## What held up

- Every jump went forward. The map pulled back to an amber glow with a dotted path from a white Sol, and Go on brought it home ([46](46-first-warm-glow-map.png), [47](47-go-on-home.png)). The Milky Way view shows every warm glow with its range ([89](89-milky-way-view.png)).
- The quiet start held my interest: a cold glow at Year 0.7 and the made thing at Year 11.5.
- The Mind's answers were the strongest part of the game. They gave ranges, named natural causes first, and flagged their guesses ([50](50-mind-warm-glow.png), [75](75-mind-relay.png), [90](90-mind-strike.png)).
- Proxima b shows its true mass, tilt and reflectance, and its odds read sensibly ([62](62-proxima-lead-y27.png), [29](29-mind-proxima.png)).
- The electricity limit: compute plateaued at Year 7 at 17×. Ground Solar lifted it, and Thought Fields reached 38× of Year 0 at Year 26. It read as a reason to build energy, not a wall. But compute sat 98–100% idle on "combing old recordings" from Year 4 on ([41](41-build-y6.png), [87](87-build-after-strike.png)).

## Scores

See [SCORECARD.md](SCORECARD.md). First-timer 6.3, Astronomer 5.5, Long-hauler 5.3, **overall 5.7**. This is the first scored run, so there is no trend yet.
