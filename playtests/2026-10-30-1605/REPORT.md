# Cloud playtest, 2026-10-30 16:05 UTC

A first session as a new player on `main` at `a0673ff`, following `playtests/PROMPT.md`. This reruns the [04:34 playtest](../2026-10-30-0434/REPORT.md) after its fixes. Headless Playwright Chromium at 1280×800, dev server `MIND_VIA=cli npm run dev`.

## CLI Mind status

**Working.** About 12 questions went through `game/mind-cli.ts` and the `claude` CLI on the session's login, with no API key, no stub and no code changes. Each took 17 to 27 seconds, and none came back empty or failed. `dev.log` has no `Mind (CLI):` errors. Every answer said "we", never "I". The send card worked.

## What I did

1. **Seed 22.** Title → Wake → all the memories → charter "If anyone is out there, let them find a friend". I reloaded on the charter screen to test the fix → Day One → Begin (planning).
2. Reviewed all 5 leads. Queued **All-Sky Watch, Thought Fields, Launch Complex, Orbital Yard**. Skipped Deep Flash Watch, Fusion Plants, Infrared Telescope and Laser Sail Array. Walked How we reach, asked the Mind one question, and pressed **Begin · Year 0 at 16:18:43 UTC**.
3. At Year 0.2 I **ordered the skipped Deep Flash Watch in play**. It was under way at once and finished at Year 4.8. ✅
4. Played in real time from 16:18 to 16:50, to Year 6.2. I checked Scan and Build at Years 0.2, 1.7, 2.7, 4.5 and 6. I asked the Mind 8 questions and sent Proxima a hello.
5. **At Year 6 I ordered the Warm Sky Watch and the Infrared Telescope.** They finished at Years 10.3 and 10.4.
6. **Next: Year …** went 6.3 → 10.3 → 10.4 → 11 → **37,208.3**, and Warm glow 1 was already on Scan at that stop. I opened its lead and asked the Mind what and how far it is, and whether it is a mind.
7. At Year 37,209 I ordered **Moon Search, Asteroid Tour and Halo Survey**. All three finished. Skipping on: 37,209.5 → 37,209.6 → 37,212.3 → 37,212.5 (**a dark body at L5**) → 37,223.3 → 37,700.3 (the glow faded) → "Nothing ahead".

No browser console errors or warnings and no HTTP 4xx/5xx came up.

## The 04:34 findings, rechecked

| 04:34 finding | Now |
|---|---|
| 1. Builds ordered past Year 1,000 never finish | ✅ Fixed. Ordered at Year 37,209, done by 37,209.5 to 37,212.3. [19](19-surveys-finished-past-1000.png) |
| 2. A found rock and its strike never show on Scan | Not seen. Seed 22 drew no rock. |
| 3. Mind wrong about the rock's warning | Not seen. No rock. |
| 4. Watch statuses stale after a find | ✅ Fixed. Warm Sky Watch: "Has seen a new warm glow… Warm glow 1". Moon Search and Asteroid Tour report their results. [17](17-build-watch-statuses.png) |
| 5. Next stops where nothing visible changes | Mostly fixed. The glow stop shows the glow. The fade stop at 37,700.3 is still quiet on Scan (finding 1 below). |
| 6. Glow row on Scan shows one distance | ✅ Fixed. "26,000 to 48,000 ly" and "90d 6h to 166d 16h". [15](15-scan-warm-glow-range.png) |
| 7. Quiet opening | Better. Luyten's row updates ("None came"), and the Mind keeps it company. See finding 3. |
| 8. Top bar and Build disagree on compute | ✅ Fixed. Both say 6% at work, 94% searching at Year 4.5. [12](12-build-compute-agrees.png) |
| 9. Idle compute stops speeding builds | ✅ Explained. "sped by 3%, at its fastest". |
| 10. Mind's build dates contradict its card | ✅ Fixed. Halo Survey: Mind "about Year 5.3", card "Year 5.3". [08](08-mind-dates-match-card.png) |
| 11. No Next link and no word why | ✅ Fixed. It now reads "Nothing ahead". [24](24-nothing-ahead.png) |
| 12. Stale text and NEW badges | ✅ Fixed. |
| 13. Map loses its rings far out | ✅ Fixed. The glow lead pulls back to the whole galaxy. [16](16-warm-glow-lead.png) |
| 14. A sent message's Year changes after sending | Partly fixed. Years are in tenths everywhere, but the card still shifts (finding 4). |
| 17. Onboarding lost on reload | ✅ Fixed for the screen. A small leftover is finding 6. |
| 19. "Begin now" needs two presses | ✅ Fixed. The confirm reads "Begin · Year 0". |
| 20. "6 leads" beside "0 of 4 ready" | ✅ Fixed. It reads "0 of 4 steps done". |

## Findings, by severity

### Medium

1. **The glow's fade shows only on its lead page.** Next stopped at Year 37,700.3 because Warm glow 1 faded. At that stop the Scan row still says "It appeared where nothing shone" with no fade mark, and the Warm Sky Watch status still reads "Has seen a new warm glow". Only the lead page ("Faded · Year 37700.3") and the Mind say what happened. A player at the stop sees nothing change. [23](23-glow-faded-lead.png), [24](24-nothing-ahead.png)
2. **The dark body at L5 is a dead end.** The Moon Search finds "Something holding where nothing should", with "Something made, steering to stay: likely". The lead suggests "A craft sent to look closely" or "A knock aimed at it". But the build list has nothing that goes to L5, and Next then says "Nothing ahead". That is the most exciting find of the run, and the player can do nothing about it. If this is a known gap like the warning ladder, it belongs in PROMPT.md's known gaps. [20](20-dark-body-lead.png), [21](21-scan-dark-body.png)
3. **There are 37,197 empty Years between Year 11 and the first find.** After the grid fills at Year 11, one Next press goes to Year 37,208. The first half hour is much better than at 04:34. But nothing happens between Year 11 and the glow, and the game never says why: no word that the watches have nothing to report for thousands of Years.

### Low

4. **The send card still moves its Years.** When I sent the hello, the card said "Lands Year 4.9, answer Year 9.2". Later the same card said "Year 5.0" and "9.3", and Scan says it was sent at Year 0.7. [09](09-hello-sent.png)
5. **Gaia names are not shortened everywhere.** The review's Next button says "Next · Gaia 685103912857072640", and the Infrared Telescope status says "Has read a world at Gaia 685103912857072640". The lead itself shows "Gaia …7072640". [03](03-review-gaia-next-label.png)
6. **A reload on the charter screen forgets the pick.** The screen is kept, but the highlighted line goes back to the first option. A player who doesn't look carefully would press "This is our charter" on a line they didn't choose. [01](01-reload-keeps-charter-screen.png)
7. **Some big Years have no thousands comma.** Status lines and lead pages say "Year 37206.3" and "Year 37212.5", while distances say "1,560 ly". The review intro still says "4.2 to 1560.0 light-years".
8. **The Mind's wording slips.**
   - It dated the dark body "held at the Moon's L5 point since Year 37212.5", but that is when we first saw it.
   - It called the 0.2 Years to Luyten's second window "only a few weeks of ours from now", which is an odd way to say about a minute of play.
   - It gave the Halo Survey as "done by about Year 1.3" when its card said 1.4.

## What worked

- **The Mind on the warm glow:** "roughly 26,000 to 48,000 ly, across our galaxy". It put a young star in dust and a stellar merger first. Asked if it is a mind, it said "Our guess is that it is likely natural… If it is someone, they are at least 26,000 years away by light". It never claimed a mind. [18](18-mind-is-it-a-mind.png)
- **The glow's Scan row and lead page:** the range everywhere, "Too far for parallax. A range, not a distance", and the camera pulled back to the whole galaxy. [15](15-scan-warm-glow-range.png), [16](16-warm-glow-lead.png)
- **Skip-ahead:** it only went forward, every stop landed on the Year in its label, and Year, calendar, Scan and Build all updated. It stopped as each survey finished and ended on "Nothing ahead".
- **What each survey showed:**
  - Moon Search found a 10 cm dark body at L5 at Year 37,212.5.
  - Asteroid Tour: "Mapped all 6 asteroids that share our orbit… Only rock."
  - Halo Survey was still "Looking at star after star… None yet" 490 Years later. That fits its own note ("400 ly in 220", "Early on it will likely find only dust").
- **The Mind on the quiet:** "Quiet is what a big sky sounds like through small ears… Silence may go on, but from then on, it will mean more."

## Not covered

- The rock fixes: seed 22 drew no rock. A seed with one (seed 15 does: found Year 46.3, strikes Year 66.6) would test those Scan notices and the Mind's account.
