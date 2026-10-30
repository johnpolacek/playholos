# Playtests 2026-10-30, combined

Two first-session playtests run on the same night from `playtests/PROMPT.md`, merged here.

- **Run A**, 04:34 UTC, cloud session. [Report](../2026-10-30-0434/REPORT.md). Game 1 seed 15, game 2 seed 24.
- **Run B**, 05:54 UTC, local session. [Report](../2026-10-30-0554/REPORT.md). Two fresh games.

Both played in headless Playwright Chromium with SwiftShader WebGL, against `MIND_VIA=cli npm run dev`. No game code was changed in either.

Shots are linked as `A/name` or `B/name`. A’s live in `../2026-10-30-0434/`, B’s in `../2026-10-30-0554/shots/`.

## CLI Mind

- Works in both. Every question went through the `claude` CLI, with no API key and no stub.
- Full answers took 15 to 24 s in both. B saw first text in 3 to 9 s.
- About 18 questions in all. None empty, none failed.
- Every reply said “we”, never “I”, even when the question said “I”.
- B only: `game/.dev.vars` sets `ACCESS_CODE`, so the Worker gate locked the Mind even under `MIND_VIA=cli`. A, on a fresh clone, never saw the lock.

## Findings both runs hit

These are the surest, found on their own by two separate players.

1. **High. Builds ordered after Year 1,000 never finish.**
   - A ordered three surveys at Year 43,918. B at Year 9,104. All read “Done after Year 1,000”, then sat in RISING at “past Year 1,000” for thousands of Years.
   - The whole catalog’s DONE IN column reads “past Year 1,000”. Past that Year, nothing new can be built.
   - Cause: `HORIZON = 1000` in `game/lib/game/plan.ts:391`.
   - [A/30](../2026-10-30-0434/30-moon-search-done-after-year-1000.png), [A/31](../2026-10-30-0434/31-build-surveys-stuck-rising.png), [B/81](../2026-10-30-0554/shots/81-build-y9104.png), [B/82](../2026-10-30-0554/shots/82-build-after-skip.png)
2. **Medium. Watch and survey statuses never update after a find.**
   - Warm Sky Watch says “No new warm glow yet” with a warm glow on Scan. Both runs.
   - A: Halo Survey says “None yet” with Cold glow 1 on Scan.
   - B: Moon Search says “Nothing small and dark yet” after the Mind reports a find. See B1 below.
   - [A/26](../2026-10-30-0434/26-build-strike-line-stale-warm-sky-status.png), [A/32](../2026-10-30-0434/32-game2-surveys-status.png), [B/81](../2026-10-30-0554/shots/81-build-y9104.png)
3. **Medium. Skip-ahead can strand the player.**
   - The Next link vanishes with no “nothing more ahead” note. A at Year 1,040.7. B at Year 15, before the Asteroid Tour ends near 15.5.
   - One click jumps thousands of Years with compute idle. A: 66.6 to 43,914.8. B: 15 to 9,102.5. That makes the slow opening feel pointless after the fact.
   - Every jump went forward and landed on its target. A made 8 jumps, B made 18.
   - [A/34](../2026-10-30-0434/34-game2-no-next-link.png), [B/93](../2026-10-30-0554/shots/93-fresh-y15-no-next.png)
4. **Medium. The warm glow’s Scan row shows one distance beside the range.**
   - A: “16,248 ly”, “reached in 1354h” beside 12,000 to 22,000 ly. B: “25,417 ly”, “2118h 02m” beside 19,000 to 34,000 ly.
   - The lead page gets the range right, but A notes its header still says “reached in 1354h”.
   - Thousands of hours is hard to read.
   - [A/25](../2026-10-30-0434/25-scan-warm-glow-row-single-distance.png), [B/71](../2026-10-30-0554/shots/71-glow-found.png)
5. **Medium. The Mind’s numbers clash with the card or tab beside them.**
   - A: Mind says the Infrared Telescope “takes 8 Years”. The card says done in 20m. [A/20](../2026-10-30-0434/20-mind-8-years-vs-card.png)
   - B: Mind says the telescope slows current builds. Build says “Slows nothing we’ve queued”. [B/39](../2026-10-30-0554/shots/39-mind-q2-q3.png)
   - A: Build says Deep Flash Watch done “by Year 4.8”, Mind says “about Year 4.9”.
6. **Low. Stale text after thousands of Years.**
   - Luyten’s Star still says “Any reply would reach us from Year 2.3”. Both runs.
   - NEW badges from Year 10.5 to 10.9 stay on. Both runs.
7. **Low. The map loses its place far out.**
   - The 10 to 40 ly rings can’t show a glow thousands of ly away. A saw no glow marker on the overview map.
   - [A/25](../2026-10-30-0434/25-scan-warm-glow-row-single-distance.png), [B/72](../2026-10-30-0554/shots/72-glow-lead.png)
8. **Low. Map labels overlap.** A: Gliese 1151 on Proxima Centauri. B: the LEADS chip on the Gaia BH label.
9. **Low. The Mind’s wording slips.** A: “neighbours”, a dropped word in British spelling, and “Four named leads” then six. B: “drift scan”, a term no screen uses.

## Found by Run A only

1. **High. A rock struck Earth and Scan never said so.** Seed 15: rock found at Year 46.3, strikes at 66.6. Next stopped at both, but Scan showed no lead, badge or Mind line. Only the Build tab says it. The Rock Deflector opened unnoticed. [A/24](../2026-10-30-0434/24-skip-year46.3-rock-found-nothing-on-scan.png)
2. **High. The Mind was wrong about that rock.** It said the rock “came without the years of warning a push needs”. It had 20 Years. [A/29](../2026-10-30-0434/29-mind-rock-no-warning-claim.png)
3. **Medium. Next stops where nothing visible changes.** The 43,914.8 stop is when the watch saw the glow, but the lead appears at 43,916.8. The rock stops show nothing on Scan.
4. **Medium. Two compute figures disagree.** Top bar “3% at work”, Build “6% at work”, same moment. [A/19](../2026-10-30-0434/19-build-year4.4-searching.png)
5. **Medium. Idle compute stops speeding builds.** The tour teaches spare compute speeds a build. At 94% searching, Deep Flash Watch showed “sped by 3%”.
6. **Low. A sent message’s Year shifts after sending.** “Lands Year 5.1” became “lands Year 5.2”. Scan says “sent 2040 · Year 1.0”, but Year 1.0 is 2041. [A/17](../2026-10-30-0434/17-mind-send-card.png)
7. **Low. Onboarding progress is lost on reload**, charter choice included.
8. **Low. “Review our scans” and “Queue our first builds” are links styled as buttons.** [A/09](../2026-10-30-0434/09-before-we-begin-dialog.png)
9. **Low. “Begin now” takes two presses** and doesn’t say why.
10. **Low. “6 leads” beside “0 of 4 ready”** on one screen. [A/07](../2026-10-30-0434/07-scan-review-intro.png)

## Found by Run B only

1. **High. A Moon Search find shows on no screen. Only the Mind knows.** The Mind reports a dark 10 cm body at the Moon’s L5 by Year 3.7. Build keeps fixed text, `game/components/instruments.tsx:63`. The find lives in `game/lib/sim/knowledge.ts:607`. A’s seed 24 Moon Search only ever said “Nothing small and dark yet”, so this may depend on seed. [B/94](../2026-10-30-0554/shots/94-fresh-mind-surveys.png), [B/95](../2026-10-30-0554/shots/95-fresh-scan-y15.png)
2. **Medium. A question typed while the Mind answers is lost.** Typed during the auto “Ask the Mind about it” answer, it never showed, with no error. [B/74](../2026-10-30-0554/shots/74-mind-glow.png)
3. **Medium. The CLI Mind is locked when `.dev.vars` sets `ACCESS_CODE`.** Worth opening the gate in `game/worker/access.ts` when `MIND_VIA=cli`.
4. **Low. A lead is named by its raw ID**, “Gaia 1172618435080418176”. [B/90](../2026-10-30-0554/shots/90-fresh-began.png)
5. **Low. “Sol” floats away from the Sun** in the zoomed map. [B/50](../2026-10-30-0554/shots/50-checkin-6-scan.png)
6. **Low. The Mind advised “step through Review”**, already done. [B/34](../2026-10-30-0554/shots/34-mind-q1.png)
7. **Low. The inherit screen’s scale bar may not match the drawing.** [B/16](../2026-10-30-0554/shots/16-inherit-37s.png)
8. **Low. One memories fade frame reads “450,000 years ago · Oxygen fills the air”.**
9. **Low. Chromium’s headless shell has no WebGL** and no fallback. Test rigs only.

## The quiet opening

- The runs split on it. B: Years 0 to 6 held, and it sags after the first builds finish, near Year 15. A: about 20 minutes of nothing between Year 0 and 11.
- Both agree the Mind carries it. A: “I would have stayed for the Mind, but the screens gave me no reason to look at them.”
- A’s fix idea: a beat when each reply window opens and passes, such as Luyten’s at Year 2.3.

## The warm glow

- A: first lead at Year 43,916.8, 12,000 to 22,000 ly. B: first seen at 9,102.5, ranged at 9,104.5, 19,000 to 34,000 ly.
- In both, the lead page gives a range and ranks natural causes first.
- In both, the Mind gave the range, led with a young star in dust, and never claimed a mind. A: “our guess is that it isn’t… very unlikely, though nothing rules it out.” B: “Is it a mind? We can’t tell.”
- [A/27](../2026-10-30-0434/27-warm-glow-lead-range.png), [A/28](../2026-10-30-0434/28-mind-is-it-a-mind.png), [B/72](../2026-10-30-0554/shots/72-glow-lead.png), [B/75](../2026-10-30-0554/shots/75-mind-glow-2.png)

## The surveys, fresh games

| Survey | Run A, seed 24 | Run B |
|---|---|---|
| Moon Search | “Nothing small and dark yet”, no result | Mind reports an L5 find, no screen shows it |
| Asteroid Tour | “Nothing that isn’t rock yet”, no result | Same at Year 15, Mind says done near 15.5 |
| Halo Survey | Found Cold glow 1 by Year 1,040.7, status still “None yet” | “None yet” at Year 15 |

## What worked in both

- Builds skipped at Begin could be ordered in play and finished on time.
- Skip-ahead only went forward and every screen updated.
- The memories, charter and build tour read well.
- No console errors and no HTTP 4xx or 5xx.

## Suggested order to fix

1. The Year 1,000 build horizon. It blocks everything late.
2. Finds that only the Mind knows: the Moon Search find, the rock strike, the survey and watch statuses.
3. The Mind’s rock warning claim, and its numbers clashing with cards.
4. Skip-ahead: a “nothing more ahead” note, stops only where something shows, and a stop at each build’s end.
5. Single distances and hours beside ranges.
6. Stale text, then the low items.
