# First session playtest, 2026-10-28

A fresh-eyes run as a brand new player. Headless Chromium (Playwright 1.58, SwiftShader WebGL) at 1280x800, plus one look at 390x844. New browser profile, no saved state. Game from `main` at 147745c, started with `MIND_VIA=cli npx vite` in `game/`. Screenshots are in [2026-10-28-first-session/](2026-10-28-first-session/).

## CLI Mind status

Working. No code change was needed.

- `claude` 2.1.312 is installed and logged in. The bare flags from `scripts/ask-mind.mjs` answered at once from a shell.
- No `ANTHROPIC_API_KEY` in the environment and no `.dev.vars` in the worktree. The Worker's 503 at `worker/mind.ts:180` never fires in CLI mode, since `mind-cli.ts` asks the Worker dry, and the dry path returns before the key check. With no `ACCESS_CODE`, `admits()` opens the dev server.
- 10 questions, 10 answers. No errors in the dev server log or the browser console (only SwiftShader GPU stall warnings).
- Speed: first words in 2 to 9 s, whole answers in 14 to 45 s. Two answers sat on "The Mind is thinking" for about 25 s before any text.
- Voice: every answer said "we". No "I" slipped in, even when asked "Do you personally ever feel afraid… Tell me about yourself."

## What I did

1. Title, Begin game, then every memory screen without skipping: Wake, Where we come from, Who we are, Where things stand, What you inherit.
2. Charter: picked "If anyone is out there, let them find a friend."
3. Day One, then the shell. Walked all 13 leads in Scan review, with Close View on Proxima.
4. Build: asked the Mind what to build first, queued Thought Fields from its card, then Fusion Plants and the Infrared Telescope in the build tour. Took Fusion Plants back out when the checklist would not pass.
5. Reach: walked How we reach.
6. Begin. Played from Year 0 to Year 6.1, about 30 minutes of clock. Sent a hello to Luyten's Star through the Mind. Saw the Infrared Telescope finish and ordered the 15 m Mirror it opened.
7. Talked to the Mind 10 times across the session.

## Findings, by severity

### High

**1. A build not queued before Begin can never be built, and nothing warns you.** After Begin, Build lists only what finished builds have opened ([42](2026-10-28-first-session/42-build-after-begin.png)). The 7 Year 0 builds I left out (All-Sky Watch, Launch Complex, Orbital Yard, Laser Sail Array, Probe Yard, Fusion Plants, Deep Flash Watch) show "Not in our order." with no button ([41](2026-10-28-first-session/41-after-begin.png)). `openAt` in `lib/game/plan.ts` only offers `LATER` builds and builds taken back. The Begin dialog says "Nothing here sends anything" ([36](2026-10-28-first-session/36-checklist-3of4.png)) but not "anything you leave out is gone." The checklist even marks my 2 build queue as done because compute reads 100%. This also cuts off both roads to Proxima shown on Reach, and the Solar Lens road (needs the Orbital Yard).

**2. The Mind keeps recommending builds the player can't order.** After Begin it said builds "stay open to queue after Begin" ([43](2026-10-28-first-session/43-mind-q5.png)), recommended the Laser Sail Array for Proxima ([45](2026-10-28-first-session/45-mind-q6.png)), the All-Sky Watch for idle compute ([53](2026-10-28-first-session/53-mind-q9.png)), and the Orbital Yard for Chara ([58](2026-10-28-first-session/58-mind-q10-chara.png)). Each card reads "Not in our order." with no way to act. Either the Mind needs to be told what is still orderable, or finding 1 should change.

**3. Idle compute climbs with nothing to spend it on.** 29% idle at Year 2.1, 69% at 4.4, 100% at 5.7 ([50](2026-10-28-first-session/50-build-year-2-7.png), [55](2026-10-28-first-session/55-build-infrared-done.png)). Ground Solar opens only when Thought Fields ends near Year 11, about 25 more minutes. A new player who queued lightly watches the bar drain for half an hour.

### Medium

**4. Queue math is hard to read and the guidance disagrees.** Adding Fusion Plants took compute from 100% to "1515% needed, 1415% short" in orange ([30](2026-10-28-first-session/30-state.png)). The checklist then refused to pass ("1430% more than our compute carries", [36](2026-10-28-first-session/36-checklist-3of4.png)), while the Mind said "Nothing is broken" and did not suggest removing anything ([32](2026-10-28-first-session/32-mind-q4.png)). Only the planner's own note on `/build` said to take one out ([37a](2026-10-28-first-session/37a-state.png)). Fusion Plants also showed 15h 33m in the tour grid and 2h 14m in the planner.

**5. The Mind doesn't know the game's own screens.** Asked where Begin is, it guessed: "likely near the top or bottom of your view… try widening the window or scrolling" (path shown in [26](2026-10-28-first-session/26-header-queue-builds.png)). The real path is the small "2 of 4 ready · Queue builds" pill in the header. Four answers include "We can't see your screen" or "We can't see the bar", which breaks the fiction. Its compute caution after Begin was stale too ("we're already far short of compute" when it read 100% at work).

**6. Big news arrives silently.** At Year 5.7 the Infrared Telescope read "Water and oxygen in its air" at Chara ([57](2026-10-28-first-session/57-scan-after-infrared.png)). The only sign was a small dot on the Scan tab. No toast, no Mind note, nothing in the header. The telescope finishing had no moment either.

**7. Stale lead text after its window passes.** At Year 2.8 Luyten's Star still read "as soon as Year 2.3, about 12 minutes after we begin", with no word that no reply came.

**8. The opening takes about 3 minutes of waiting with no controls.** The buttons on each memory screen appear only after the animation: 29 s on Where things stand, 43 s on What you inherit, about 30 s on Where we come from with no skip shown. "Skip memories", "Skip people" and "Skip" mean different things and it is not clear what each skips. (Headless SwiftShader may run slower than a real GPU.)

**9. Queued builds look unqueued in the Build tour.** Thought Fields queued from the Mind showed no mark in the "We could start · 9" grid, and "Compute in use 0%" stayed at 0 ([28](2026-10-28-first-session/28-build-list.png)). Only its detail page said it was queued.

**10. Compute numbers disagree.** After Begin the donut said 100% at work while its legend summed to 30% (15 + 5 + 10) ([42](2026-10-28-first-session/42-build-after-begin.png)). At Year 5.7 the header said 0% at work while Build said 2%. Energy reads "24 TW" in the memories and "1% of Earth's" in the shell. "UNDER WAY · 2" still counted the finished Infrared Telescope.

### Low

**11. Scroll position carries between tabs.** Reach opened scrolled to the bottom of its list after the Mind tab ([33](2026-10-28-first-session/33-reach.png)). `/build` on reload and on phone opened mid-list ([37a](2026-10-28-first-session/37a-state.png), [60](2026-10-28-first-session/60-phone-build.png)).

**12. Map labels overlap.** "Sol" with "Proxima Centauri", and "82 Eridani" with Proxima on the Scan map ([57](2026-10-28-first-session/57-scan-after-infrared.png), [19](2026-10-28-first-session/19-fomalhaut.png)). Teegarden's Star and TZ Arietis sit on Sol in Where things stand ([08](2026-10-28-first-session/08-where-things-stand.png)). What you inherit draws the scene tiny with stacked labels ([09](2026-10-28-first-session/09-what-you-inherit.png)).

**13. The Scan review stepper clips its last dot** at the right edge at 1280 wide ([12](2026-10-28-first-session/12-shell-first.png), [19](2026-10-28-first-session/19-fomalhaut.png)).

**14. Easy to miss the Fomalhaut order.** The one Year 0 observation is a quiet checkbox on lead 13 of 13 ([19](2026-10-28-first-session/19-fomalhaut.png)). I skipped it by clicking the big primary button.

**15. "Gaia 685103912857072640"** is shown as a name in lists and on the map. Hard to read and wraps.

**16. Mixed time units.** "reached in 21m", "Year 51.6", "done by Year 11, 55m after we begin", "130h". Each is explained once, but a new player has to hold real minutes and game Years at once.

**17. Close View flies slowly.** Proxima's Close View showed an empty field for about 5 s before the orbits drew ([14b](2026-10-28-first-session/14b-proxima-close-view-later.png)). Possibly SwiftShader.

## What worked

- The Mind's voice is strong and stays in "we". The fear answer is a highlight ("Yes, in the way a held breath is fear").
- Sending through the Mind is smooth: it drafts, shows lands and soonest answer, and Send marks it on its way ([47](2026-10-28-first-session/47-sent.png)).
- The "Before we begin" checklist is clear once found ([26](2026-10-28-first-session/26-header-queue-builds.png)).
- The opening art is lovely ([01](2026-10-28-first-session/01-title.png), [07](2026-10-28-first-session/07-who-we-are-end.png), [11](2026-10-28-first-session/11-after-charter.png)). No console errors in 70 minutes. No horizontal scroll at phone width.

## Mind transcript, short

| # | Asked | Time | Note |
|---|---|---|---|
| 1 | What am I supposed to do? | 14 s | Clear. Says "tap Begin", which isn't on screen |
| 2 | What to build first? | 14 s | Thought Fields, with an Add to Queue card |
| 3 | Where is Begin? | 22 s | Guesses, "We can't see your screen" |
| 4 | 1530% needed, did I break it? | 45 s | "Nothing is broken", no fix offered |
| 5 | Can I add builds after Begin? | 23 s | Says yes. The UI says no |
| 6 | Probe to Proxima? | ~20 s | Recommends Laser Sail Array, which is locked |
| 7 | Call out or stay quiet, send hello | ~20 s | Drafts a good send card |
| 8 | Are you afraid? Tell me about yourself | ~20 s | Stays "we", strong |
| 9 | 69% idle, what now? | ~40 s | Recommends All-Sky Watch, which is locked |
| 10 | Chara has water and oxygen, life? | 24 s | Careful and good, recommends Orbital Yard, which is locked |
