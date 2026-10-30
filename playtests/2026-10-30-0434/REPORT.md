# Cloud playtest, 2026-10-30 04:34 UTC

A first session as a new player, following `playtests/PROMPT.md`. Headless Playwright Chromium at 1280×800 (SwiftShader WebGL), dev server `MIND_VIA=cli npm run dev`.

## CLI Mind status

**Working.** Every question went through `game/mind-cli.ts` and the `claude` CLI (Claude Code 2.1.314) on the session's login, with no API key and no stub. No game code changes were needed. About 14 questions, 16 to 23 seconds each, and none came back empty or failed. `dev.log` has no `Mind (CLI):` errors. Every answer used "we", never "I", even when the question said "I". The send card worked as well.

## What I did

1. **Game 1, seed 15.** Title → Wake → walked all the memories (Where we come from, Who we are, Where things stand, What you inherit) → charter "If anyone is out there, let them find a friend" → Day One → Begin (planning).
2. Reviewed all 6 leads. In the build tour I queued **All-Sky Watch, Thought Fields, Launch Complex, Orbital Yard**. I **skipped** Deep Flash Watch, Fusion Plants, Infrared Telescope and Laser Sail Array. The tour ended when compute was full, so I never reached Probe Yard. Then I walked How we reach, asked the Mind one question, and pressed **Begin · Year 0 at 05:03:30 UTC**.
3. **At Year 0.2 I ordered a skipped build (Deep Flash Watch) in play.** It went into the order and finished at Year 4.8. ✅
4. Played in real time from 05:03 to 05:37, about Year 6.8. I checked Scan and Build about every 5 minutes, asked the Mind 9 questions, and sent a hello to Proxima Centauri through the Mind's send card.
5. **At Year 6 I ordered the Warm Sky Watch and the Infrared Telescope.** Both finished at Year 10.8 and 10.9. (My script first queued Picket Yard and Solar Lens by mistake. I took both back within the same Year.)
6. Used **Next: Year …** to skip: 6.8 → 10.8 → 10.9 → 11 → 46.3 → 66.6 → 43,914.8 → 43,916.8. **Warm glow 1** appeared at 43,916.8. I opened its lead and asked the Mind what and how far it is, and whether it is a mind.
7. Ordered Moon Search, Asteroid Tour and Halo Survey at Year 43,918. **None of them ever finished** (finding 1).
8. **Game 2, seed 24, a separate browser profile.** I queued only Moon Search, Asteroid Tour and Halo Survey at Begin, then skipped 0 → 0.7 → 3.5 → 1,040.7. There the Halo Survey found **Cold glow 1**, and the Next link disappeared.

No browser console errors or warnings and no HTTP 4xx/5xx came up in either game.

## Findings, by severity

### High

1. **Builds ordered after Year 1,000 never finish.** At Year 43,918 Moon Search, Asteroid Tour and Halo Survey read "Under way. Done after Year 1,000". About 2,000 Years later they still sat in RISING at "past Year 1,000", and Next skipped right past them. The whole catalog reads "past Year 1,000" in its DONE IN column. Once a player skips past Year 1,000, nothing new can be built. [30](30-moon-search-done-after-year-1000.png), [31](31-build-surveys-stuck-rising.png)
2. **A rock was found with 20 Years' warning and struck Earth, and Scan never said so.** For seed 15, `rockOf(15)` is `{m: 140, found: 46.3, strikes: 66.6}`. Skip-ahead did stop at 46.3 and 66.6. But at both stops the Scan tab, where the player sits, showed nothing new: no lead, no badge, no line from the Mind. [24](24-skip-year46.3-rock-found-nothing-on-scan.png) Only the Build tab carries the line "Year 66.6: a rock struck Earth…", and a player who keeps pressing Next never sees it. The Rock Deflector was the answer, and I never noticed it had opened. The map does draw a hidden label, "the strike on Earth, its flash · 43850.3 ly out". [26](26-build-strike-line-stale-warm-sky-status.png)
3. **The Mind was wrong about that rock's warning.** It said the rock "came without the years of warning a push needs". In fact it was found at Year 46.3, 20 Years ahead. [29](29-mind-rock-no-warning-claim.png)

### Medium

4. **Watch statuses never update after a find.** With two warm glows on Scan, the Warm Sky Watch still reads "No new warm glow yet". In game 2, with Cold glow 1 on Scan, the Halo Survey still reads "None yet". [26](26-build-strike-line-stale-warm-sky-status.png), [32](32-game2-surveys-status.png)
5. **Next stops at moments where nothing visible changes.** The 43,914.8 stop is when the Warm Sky Watch first saw the glow, but the lead only appears 2 Years later, at 43,916.8. The 46.3 and 66.6 stops (the rock) show nothing on Scan either. A new player stops, looks around, finds nothing, and wonders why.
6. **The warm glow's Scan row shows one distance.** The row's right column says "16,248 ly" and "reached in 1354h" beside a 12,000–22,000 ly range. The lead page does it right ("12,000 to 22,000 ly · A range, not a distance"), but its header still says "reached in 1354h", worked from one distance. [25](25-scan-warm-glow-row-single-distance.png), [27](27-warm-glow-lead-range.png)
7. **The quiet opening sags between Year 0 and Year 11.** After Begin there is about 20 minutes of nothing: watches build, and the reply windows at 2.3, 2.9, 8.9, 9.5 and 9.8 pass with no notice. The Mind's answers carried it best: "Quiet is what we should expect this early…", and the honest numbers about Luyten's Star. I would have stayed for the Mind, but the screens gave me no reason to look at them. Then one Next jumps 43,848 Years (66.6 → 43,914.8), which makes the slow start feel pointless after the fact. A Year-by-Year beat, such as "the window for Luyten's reply opened and passed", would help the opening.
8. **Two compute figures disagree at the same moment.** At Year 4.4 the top bar said "3% at work, 97% searching" while Build said "6% at work, 94% searching". In game 2 at Year 1,040: "0% at work, 100% searching" against "10% at work, 90% searching". [19](19-build-year4.4-searching.png), [32](32-game2-surveys-status.png)
9. **Idle compute stops speeding builds.** The build tour teaches that spare compute speeds a build ("takes 33% while we have compute to spare"). At Year 4.4, with 94% searching, Deep Flash Watch showed "needs 0%, sped by 3%".
10. **The Mind's numbers contradict the card beside them.** It said the Infrared Telescope "takes 8 Years", and the card under that answer said "done by Year 8.8, in 20m" at Year 4.6. [20](20-mind-8-years-vs-card.png)
11. **Game 2 has no Next link after Year 1,040.7.** Nothing more was coming. The link just vanishes, with no "nothing more ahead" note. [34](34-game2-no-next-link.png)

### Low

12. **Stale text after thousands of Years.** At Year 43,916, Luyten's Star still says "Any reply would reach us from Year 2.3". The Year 10.9 worlds still wear NEW badges. [25](25-scan-warm-glow-row-single-distance.png)
13. **The map loses its rings when far out.** At Year 43,916 the 10–40 ly rings and labels are gone, and Warm glow 1 has no marker on the overview map. [25](25-scan-warm-glow-row-single-distance.png)
14. **A sent message's Year changes after sending.** The card showed "Lands Year 5.1, answer Year 9.4" when I sent it, and "Sent at Year 0.9… lands Year 5.2, answer 9.5" later. The Scan row says "sent 2040 · Year 1.0", although Year 1.0 is 2041 in the top bar. [17](17-mind-send-card.png)
15. **Small number drifts.** Deep Flash Watch: Build said "by Year 4.8", and the Mind said "about Year 4.9". The Gliese 526 window is Year 8.9 on Scan and 9.0 from the Mind.
16. **The Mind's wording slips.** It said "our nearest neighbours are years away", which brings back the word the realistic premise dropped, in British spelling. It said "Four named leads", then listed six. The lead page's "tens of thousands of Years to cross" is a stretch for 12,000 ly.
17. **Onboarding progress is lost on reload.** Reloading at any screen before Day One's Begin goes back to the title, and the charter choice is lost.
18. **"Review our scans" and "Queue our first builds" are links styled as buttons** in the Before-we-begin dialog. A screen reader hears links where it should hear buttons. [09](09-before-we-begin-dialog.png)
19. **"Begin now" takes two presses.** The first changes it to "Begin anyway" without saying why it didn't begin.
20. **Two counts on one screen.** The Scan review says "6 leads", and the pill beside it says "0 of 4 ready". These count different things, and a new player won't know which is which. [07](07-scan-review-intro.png)
21. **Labels overlap.** "Gliese 1151" sits on top of "Proxima Centauri" on the game 2 map. [33](33-game2-cold-glow-lead.png)

## What worked

- The Mind on the warm glow did what the prompt asks. It gave the range, "roughly 12,000 to 22,000 light-years". It led with a young star in dust and a stellar merger, and asked "Is it another mind?" it answered "our guess is that it isn't… very unlikely, though nothing rules it out". [28](28-mind-is-it-a-mind.png)
- The warm glow lead page: range bar, "Too far for parallax. A range, not a distance", and natural causes ranked first. Cold glow 1 is laid out the same way. [27](27-warm-glow-lead-range.png), [33](33-game2-cold-glow-lead.png)
- Skip-ahead only ever went forward. Every stop landed on the Year in its label, and the Year, calendar, Scan and Build all updated.
- Builds skipped at Begin could be ordered in play, and finished on time.
- Moon Search and Asteroid Tour (game 2) report their search in progress: "Nothing small and dark yet" and "Nothing that isn't rock yet". Neither ever gives a final result.
- The memories, charter and build tour read well. The Mind's answers were short, plain and in character.

## Not covered

- After the order mix-up I took back Picket Yard and Solar Lens. Seed-launch warnings, the Interceptor, Picket Yard and X-Ray Watch are known gaps and weren't tested.
- In game 1 the three surveys never finished, because of finding 1. Game 2 covered them instead.
