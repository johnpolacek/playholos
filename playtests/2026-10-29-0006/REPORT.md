# Cloud playtest 2026-10-29-0006

## CLI Mind status
Works. `MIND_VIA=cli npm run dev` answered on the `claude` CLI (2.1.312) with no code change. Replies took roughly 10-25 s. Every line spoke as "we", never "I". Answers were relevant and used live state (queue, messages sent, Luyten's Star window).

## What I did
Title, Wake, Where we come from, Who we are, Where things stand, What you inherit, Charter ("If anyone is out there, let them find a friend"), Year 0 leads (all 7 reviewed), queued All-Sky Watch and Thought Fields only, asked the Mind 3 questions, Begin anyway. In play I ordered the skipped Infrared Telescope (from the Mind's card) and Launch Complex (Build tab); both started. Asked the Mind about winning, danger of broadcasting, who it is, status, and undoing the charter. Sent a message to Luyten's Star (lands Year 12.9). Reached only Year ~1.4 (about 17 min of wall clock; the clock may be throttled in a headless tab), so no long-term play and no Year 2.3 reply window.

## Findings (most severe first)
1. **Low-medium: stale order label after Begin.** After ordering a skipped build in play, the button flips to "Take back" and the build starts (it shows under UNDER WAY), but the page text still reads "Not in our order yet." Shots 21, 22-build-play, 23-launch-ordered.
2. **Low: stale Mind text.** "Nothing runs until you tap Begin." stays in the chat after Begin (shots 19, 20).
3. **Low: checklist ambiguity.** "Queue our first builds" stays NEXT, not DONE, after queuing two builds at 35% compute. It is unclear what finishes it (shot 16-ready).
4. **Low: the Mind warns All-Sky Watch (Year 4.2) misses Luyten's Star's Year 2.3 window,** but a new player has no way to speed it up. Shot 31.
5. **Cosmetic:** apostrophes differ ("Luyten's Star" on the map, "Luyten’s Star" in lists). The header briefly showed "2029" at the charter-to-Year-0 change (shot 09).
6. **Note:** the clock ran slower than 1 Year per 5 min of wall time in headless Chromium (Year 1.4 after ~17 min). Likely tab throttling; not verified.
7. Console: no errors, only WebGL swiftshader performance warnings.

Not tested: later Years, neighbor replies, Year 2.3, mobile layout. Shots are in this folder.
