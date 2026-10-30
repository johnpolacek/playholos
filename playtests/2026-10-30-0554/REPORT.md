# Playtest 2026-10-30-0554

A fresh-eyes first session, played in headless Chromium against the local dev server, with the Mind answering through the `claude` CLI.

## What we did

- Ran `MIND_VIA=cli npm run dev` in `game/`, on port 5401.
- Played in headless Playwright Chromium with SwiftShader WebGL, from an empty profile.
- Onboarding: Where we come from, Who we are, Where things stand, What you inherit, the charter (“Speak first, so no one has reason to fear us.”), Day One.
- Reviewed all 9 leads, then the Before we begin checklist: builds, How we reach, Ask the Mind.
- Queued 5 builds at Begin: All-Sky Watch, Deep Flash Watch, Thought Fields, Launch Complex, Orbital Yard.
- Skipped 4: Fusion Plants, Infrared Telescope, Laser Sail Array, Probe Yard.
- Began at 05:11 UTC. Ordered the skipped Probe Yard in play at Year 0.1. It worked.
- Played in real time to Year 6, checking in every 4 minutes. Asked the Mind 4 questions.
- At Year 6, ordered the Warm Sky Watch and the Infrared Telescope.
- Clicked “Next: Year …” six times. The first warm glow showed at Year 9,104.5.
- Opened its lead and asked the Mind about it twice.
- Ordered the Moon Search, Asteroid Tour and Halo Survey at Year 9,104. They never built, see finding 2.
- Started a second fresh game to try those three surveys from Year 0, and skipped to Year 15.

## CLI Mind status

- Works. Every question got a full answer through the `claude` CLI.
- First text in 3 to 9 s. Full answer in 15 to 24 s.
- No reply said “I”. Every reply spoke as “we”.
- One local catch: `game/.dev.vars` sets `ACCESS_CODE`, so the Mind tab showed the API key lock even with `MIND_VIA=cli`. We typed the code to open it. No code change was needed. A fresh clone has no `.dev.vars` and opens on its own. See finding 8.

## Findings, most severe first

### High

1. **A Moon Search find shows on no screen. Only the Mind knows.**
   - Second game: Moon Search done at Year 3.7. At Year 15, the Mind says it found “a dark body about 10 cm across at the Moon’s L5 point, holding where no rock should.”
   - The Build tab still says “Stacking deep images… Nothing small and dark yet.” Scan has no new lead.
   - The status line is fixed text in `game/components/instruments.tsx:63`. The find lives in `game/lib/sim/knowledge.ts:607`, which only feeds the Mind.
   - A player who never asks would miss the biggest moment in the game.
   - [94-fresh-mind-surveys](shots/94-fresh-mind-surveys.png), [95-fresh-scan-y15](shots/95-fresh-scan-y15.png)

2. **Builds ordered after Year 1,000 never finish.**
   - At Year 9,104 the Moon Search, Asteroid Tour and Halo Survey each said “Ordered now, it would be done after Year 1,000”, a Year long past.
   - Once queued, all three read “past Year 1,000”, need 0% of a compute that sits 100% idle, and had not moved 784 Years later.
   - Cause: `HORIZON = 1000` in `game/lib/game/plan.ts:391`. The pace runs only to Year 1,000.
   - Skip-ahead makes this easy to hit: one click took us from Year 15 to 9,102.5.
   - [80-order-moon-search](shots/80-order-moon-search.png), [81-build-y9104](shots/81-build-y9104.png), [82-build-after-skip](shots/82-build-after-skip.png)

### Medium

3. **Skip-ahead can strand the player.**
   - Second game, Year 15: the Next link is gone, though the Mind says the Asteroid Tour ends near Year 15.5. The tour’s end is not a stop.
   - First game: Year 15 to 9,102.5 in one jump. Compute sat 100% idle for 9,000 Years, with nothing to say so.
   - Forward-only works: 6 jumps in game 1 and 12 in game 2. All forward, each landed on its target, the Year and screens updated, no console errors.
   - [93-fresh-y15-no-next](shots/93-fresh-y15-no-next.png), [71-glow-found](shots/71-glow-found.png)

4. **A question typed while the Mind answers is lost.**
   - “Ask the Mind about it” on the glow lead sends its own question. We typed ours while that answer streamed. Ours never showed in the chat, with no error.
   - Asked again once it was quiet, it worked.
   - [74-mind-glow](shots/74-mind-glow.png)

5. **The Mind and the Build tab disagree on what a build slows.**
   - Year 2.8, the Mind on the Infrared Telescope: “it will slow what is already under way, by our guess for a Year or two.”
   - The Build tab at the same time: “2% of our compute · Slows nothing we’ve queued.”
   - Earlier, adding the Probe Yard made compute “184% needed, 84% short”. The All-Sky Watch went from 20m to 23m, and the Deep Flash Watch from 20m to 23m. The Mind’s answer on this was clear and useful.
   - [38-build-after-order](shots/38-build-after-order.png), [39-mind-q2-q3](shots/39-mind-q2-q3.png)

6. **Old text stays after it stops being true.**
   - Luyten’s Star lead at Year 9,104: “Any reply would reach us from Year 2.3.” The Mind knew at Year 4.4 that both windows passed quietly.
   - “NEW” badges from Year 10.5 are still on 5 leads at Year 9,104.
   - The Warm Sky Watch says “No new warm glow yet” while Warm glow 1 sits on Scan.
   - [71-glow-found](shots/71-glow-found.png), [81-build-y9104](shots/81-build-y9104.png)

7. **The glow’s Scan row shows one distance beside the range.**
   - The row says “19,000 to 34,000 ly” and, in the right column, “25,417 ly” and “2118h 02m”.
   - The lead page itself is right: “19,000 to 34,000 ly · Too far for parallax. A range, not a distance.”
   - Thousands of hours is hard to read. Years or days would read better.
   - [71-glow-found](shots/71-glow-found.png), [72-glow-lead](shots/72-glow-lead.png)

8. **The CLI Mind still asks for a key or code when `.dev.vars` sets `ACCESS_CODE`.**
   - With `MIND_VIA=cli`, the CLI spends no API key, yet the Worker gate in `game/worker/access.ts` still locks the Mind.
   - The lock screen offers “Paste this into Claude Code” to clone and play, which is what we were already doing.
   - Only owners with a `.dev.vars` hit this. Worth opening the gate when `MIND_VIA=cli`.

### Low

9. A seeded lead is named by its raw Gaia ID: “Gaia 1172618435080418176”. It also runs long on the map. [90-fresh-began](shots/90-fresh-began.png)
10. The LEADS chip covers the Gaia BH label at the map’s top left. [36-after-begin](shots/36-after-begin.png)
11. At Year 4.4 the Scan map zoomed to the Solar System, and the “Sol” label floats far from the Sun. [50-checkin-6-scan](shots/50-checkin-6-scan.png)
12. The glow lead’s map stays on the 10 to 40 ly rings, so it can’t show where a glow 25,000 ly out lies. [72-glow-lead](shots/72-glow-lead.png)
13. The Mind’s first answer after the review told us to “step through Review”, already done. [34-mind-q1](shots/34-mind-q1.png)
14. The Mind said “drift scan”. The screens call it the sky watch.
15. What you inherit: the scale bar reads 38 light-hours over about 380 px, but Voyager 1 at 30 light-hours sits about 140 px from the Sun. Could be the tilt. [16-inherit-37s](shots/16-inherit-37s.png)
16. The memories fade swaps the Year before the title, so one frame read “450,000 years ago · Oxygen fills the air”. The data is right: 2.4 billion.
17. The headless shell, Chromium’s light build, gets no WebGL. The globe and maps go blank with no fallback. Full Chromium with SwiftShader works. Only matters for test rigs.

## The quiet opening

- Years 0 to 6 held our interest. Builds finish every few minutes, the Mind answers well, and the messages list gives real history to read.
- The quiet is explained well. The Mind on “Is this normal?”: “Early Years are mostly building, and silence is what we expected.”
- It sags once the first builds finish, around Year 15. After that there is nothing to do but skip.

## The warm glow

- First seen at Year 9,102.5 by the Warm Sky Watch. Ranged at Year 9,104.5 by the Infrared Telescope.
- The lead gives a range, not one distance. It lists a young star in dust as likely, two stars merging as unlikely, something built as very unlikely.
- The Mind, twice: gave 19,000 to 34,000 ly, said parallax can’t reach, put natural causes first, and said “Is it a mind? We can’t tell.” It never claimed one.
- [72-glow-lead](shots/72-glow-lead.png), [73-glow-lead-full](shots/73-glow-lead-full.png), [75-mind-glow-2](shots/75-mind-glow-2.png)

## The surveys, second game

- **Moon Search:** built by Year 0.7, stacking 3 Years. The Mind says it found a dark 10 cm body at L5 by Year 3.7. No screen shows it. See finding 1.
- **Asteroid Tour:** built by Year 3.5. “Nothing that isn’t rock yet” at Year 15. The Mind says 5 asteroids clean, Cruithne last, done near Year 15.5.
- **Halo Survey:** built by Year 0.7. “None yet” at Year 15. The Mind says it passed 100 ly at Year 4.7, with 400 ly near Year 220.

## Console

- No errors in either game, beyond WebGL driver notices from the test rig.
