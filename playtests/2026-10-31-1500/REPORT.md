# Cloud playtest, 2026-10-31 15:00 UTC

This was a first session as a new player on `main` at `85746da`, following `playtests/PROMPT.md` as updated for the relay and the ladder. I played in headless Playwright Chromium at 1280×800, with the dev server run as `MIND_VIA=cli npm run dev`.

## CLI Mind status

**Working.** I asked 14 questions through `game/mind-cli.ts` and the `claude` CLI on the session's login. I used no API key, no stub and changed no code.
- Text started after 3 to 9 seconds, and each answer was complete after 10 to 19 seconds.
- No answer came back empty or failed, and `dev.log` has no `Mind (CLI):` errors.
- No reply said "I", "me" or "my".

## What I did

1. **Seed.** The first draw was seed 23. Its watcher sits at Sun–Earth L4, where no survey can find it. To reach the dark body and relay steps, I cleared storage and reloaded, which drew 30, then 15, then **seed 21**, whose watcher is at Earth–Moon L4. Note that only 11 of the 33 seeds put the watcher where the Moon Search can find it.
2. **Onboarding.** Title → Wake → memories (this seed has the Taiwan war: 20% compute) → people → where things stand → what you inherit. I chose the charter "We have always called out. Now find who answers", then Day One → Begin.
3. **Planning.**
   - I reviewed all 9 leads and queued **All-Sky Watch, Thought Fields, Launch Complex and Orbital Yard**.
   - I skipped Deep Flash Watch, Fusion Plants, Infrared Telescope, Laser Sail Array and Probe Yard.
   - I walked How we reach and asked the Mind one question, then pressed **Yes, begin at 15:17:33 UTC**.
4. **Ordering a skipped build in play.** At Year 0.1 I ordered the skipped **Deep Flash Watch**. It was under way at once and finished at Year 6.2. ✅ [18](18-skipped-ordered-in-play.png)
5. **Real time.** I played from 15:17 to 15:48, to Year 6.1, checking Scan and Build at Years 0.3, 1.1, 2.5, 3.2, 4, 4.7 and 5.8. I asked the Mind 7 questions along the way.
6. **Year 6.** I ordered the **Warm Sky Watch and the Infrared Telescope**. They finished at Years 10.2 and 10.3. [30](30-year6-ordered-warm-ir.png)
7. **Next: Year …** went 6.3 → 10.2 → 10.3 → 10.4 → 10.5 → 15 → **311.7**, where a 54 m rock was found, then **349.9**, where it struck. It went on to **39,272.2**, where Warm glow 1 was on Scan, and then 39,665.3 → 48,046.2 (Warm glow 2) → 48,149.
8. **Surveys.** At Year 48,149 I ordered the **Moon Search, Asteroid Tour and Halo Survey**.
   - The Moon Search found **a dark body at L4** at Year 48,153.3.
   - The Asteroid Tour mapped all 6 co-orbitals and found "Only rock".
   - The Halo Survey found **Cold glow 1, 502 ly**, at Year 48,571.5.
9. **Relay.** I ordered the **Close Look** at Year 48,571, which saw the watcher's mirror at Year 48,573.7. Then I ordered the **Relay Search** at Year 55,582, which found the relay at Year 55,631.5.
10. **Ladder.** I ordered the Deuterium Works, Fusion Drive and Seed Ship.
    - At Year 63,344.6 I sent a seed probe from Proxima's lead, under Ways to go. **No warning came** (finding 1).
    - At Year 63,434.8 I sent a second seed probe, to Keid.
    - I kept skipping. The copies spread to 14 stars, and **Tabit's probe found seas and forests**.
    - The seeds went silent from Year 68,879.3, and **a strike from beyond hit Earth at Year 69,048.8**.
    - I stopped at Year 83,250.

There were no browser console errors and no HTTP 4xx/5xx. The only console output was 4 WebGL "GPU stall due to ReadPixels" warnings.

## Findings, by severity

### High

1. **The watcher's warning never comes if the Moon Search found it first.**
   - **What happened:** I sent the first seed probe at Year 63,344.6, and it left at 63,362.6. No screen showed a warning: not Scan, not Build, not the watcher's lead, and no notice. Next did not stop at the launch either. It went straight from 63,344 to 63,417.
   - **What the Mind said:**
     - Right after sending, it said "the watcher at L4 has said nothing". [58](58-mind-after-seed-probe.png)
     - After the silence, asked whether we were warned, it said "Not in words… the watcher has sent us nothing. Our own record sets the silence after its warning, so we take the warning to be the watcher itself". It is making up a warning it never saw. [68](68-mind-warning.png)
   - **What the silence reading says:** "went silent after we launched another seed past the watcher's warning". A player has no idea which warning that means. [62](62-watcher-lead-seeds-silent.png)
   - **Likely cause:** in `lib/sim/minds.ts` `watcherOf()`, "its warning" is only one of the ways the watcher can first be found. When the Moon Search or Asteroid Tour came first, the warning is dropped. `watcherReadings()` in `lib/game/leads.ts` has no reading for a warning to a watcher we already know.
   - **Why it matters:** this is the path PROMPT.md walks (Moon Search → Close Look → Relay → ladder). In every seed where the Moon Search or Asteroid Tour finds the watcher, the player loses the first rung of the ladder.

### Medium

2. **Scan, and the lead pages, lag one stop behind the event Next stopped for.** Each time Next stopped for a fade or a Close Look result, Scan didn't show it until the next stop or a reload:
   - Warm glow 1's fade at Year 39,665.3.
   - Warm glow 2's fade at 48,149. At Year 48,149.4 the Scan row and lead still said "It appeared where nothing shone", yet the Mind said it "had faded by 48,149". After a reload, both showed "faded by Year 48,149". [36](36-warm-glow-2-after-fade.png), [37](37-warm-glow-2-lead-after-reload.png), [35](35-mind-warm-glow.png)
   - Warm glow 3's fade at 55,582.5.
   - Warm glow 4's fade at 63,417.
   - The Close Look's "Seen up close" at 48,573.7.

   New finds, like a glow appearing, the rock or the relay, did show at their own stop. This brings back the 16:05 finding 1 in a new form.
3. **The long-quiet card contradicts what just arrived, and it covers the tab bar.**
   - At Year 311.7 a rock was found heading for Earth, with "Our push must land by Year 349.7". The card at that stop said "Nothing new reached us on the way" and, from the Mind, "A quiet sky is what we expected."
   - At Year 48,571.6 it said the same while the Halo Survey had just found Cold glow 1.
   - At 1280×800 the card reaches over the Scan/Build/Reach/Mind tabs, so they can't be tapped until you press "Go on". [39](39-long-quiet-card.png)
   - The card also says "Meanwhile 1 stars exploded… saw 1 pairs of stars merge" (at Year 48,149).
4. **Next stops where nothing visible changes, and skips stops that matter.**
   - From Years 68,979.1 to 69,048.7 there were 9 stops in a row with no change on Scan. These are likely more probes going silent, but the Scan row only ever shows the first silence Year.
   - Next skipped the seed probe's launch at 63,362.6, where the warning should be.
   - It skipped the first silence at 68,879.3, going from 68,868 to 68,926.5.
   - It skipped the rock's push deadline at 349.7, going from 311.7 straight to the strike at 349.9.
5. **The strike from beyond barely shows on Scan or its lead.**
   - The harm is stated only on Build: "a region gone, the ozone thinned worldwide… We lost 33% of our thought, won back over about 20 Years." [64](64-build-after-strike.png)
   - On Scan it is only a line under "A dark body at L4": "Struck from beyond, Year 69,048.8." The 54 m rock got its own "The rock that struck" row. [63](63-scan-after-strike.png)
   - The lead's reading gives the energy (108,216 Mt) but says nothing of the damage. [65](65-watcher-lead-struck.png)
   - ✅ No screen names who sent it.
6. **Our seed probes are hard to follow.**
   - The 14 seed-probe rows on Scan never say "silent". Each still shows its last word, like "Only rock". [61](61-scan-seeds-silent.png)
   - Reach's **Sent** list shows only Voyager 1 after we had sent two seed probes. [59](59-reach-sent-list.png)
   - Luyten's Star and 82 Eridani offer no seed probe, and nothing says why. They are likely copy targets already.
   - Tabit's probe found **"Seas and forests"**, a living world, and it is just one short line on Scan.
7. **Reach timeline labels pile up at far Years.** At Year 63,000 the "built / stays / we see it" labels sit on top of each other at the right edge ("bstilys634", "stainds 6338"). The Years on Reach cards also have no thousands commas ("Year 63383.3"). [55](55-reach-timeline-labels-overlap.png), [54](54-after-send-seed-probe.png)
8. **The dark body's art says L5 for an L4 body.** The lead says "The Moon's L4 point" everywhere, but its diagram reads "THE MOON'S L5: 60° BEHIND IT, HOLDING". L4 is 60° ahead. The galaxy map beside it also highlights a line to Luyten's Star. [42](42-dark-body-lead.png)
9. **The Halo Survey finds the maker's home, and the Mind leans on it.**
   - In seed 21, Cold glow 1 (502 ly, found by the Halo Survey) is the watcher's maker, `old-4`. The relay line points exactly at it, RA 22.1 h, Dec 27°.
   - The cold glow's lead rates "A mind computing cold" *unlikely*. But the Mind, asked whether the relay points at it, said "We think the glow being them is likely, not certain". After the strike it said "Our guess is whoever sent the watcher, toward the cold glow". [49](49-mind-relay-cold-glow.png), [47](47-cold-glow-lead.png), [67](67-mind-what-struck.png)
   - It never claims to know the maker, so the rule holds. But its odds go past the lead's.
   - PROMPT.md's known gap assumes "we never learn its star". In this seed the player can line them up. This is a design call to make.

### Low

10. **The Mind's build Year doesn't match the card.** It said the Halo Survey would be done "by about Year 2". Its own card, in the same reply, said "Year 1.2". [20](20-mind-what-next.png)
11. **Internal wording leaks into the Mind.** It said "Our words say one is very unlikely" and "Our words still say no one heard". "Our words" is the prompt's label for the odds on leads (`lib/game/leads.ts:1229`). [24](24-mind-luyten.png)
12. **The rock's toll reads oddly:** "We lost 0% of our thought, won back over about 2 Years." [64](64-build-after-strike.png)
13. **Queueing one build too many un-does a step.** Adding the 4th build put the queue at 106%. The pill went from "2 of 4 steps done" back to "1 of 4", and "Queue our first builds" showed NEXT with 4 builds queued. [11](11-queued.png), [15](15-before-we-begin.png)
14. **The catalog shows huge percentages at Year 0:** "Fusion Plants… 7594% of our compute" and "Probe Yard… 759%". [17](17-build-catalog-year0.png)
15. **The Seed Ship finished before the drive it needs.** It finished at Year 63,338.1, before the Fusion Drive at 63,344.3, though "Roads to come" lists it as "after the Fusion Drive".
16. **Big numbers are missing commas.** The calendar year has none ("41312.2"), and neither do the map's flash labels ("the strike on Earth, its flash · 82900.4 ly out"). Reach's destination list gives glows one distance ("Warm glow 4 · 19,748 ly") where Scan gives a range. [59](59-reach-sent-list.png)

## The quiet start

**It holds, just.** The first half hour has something every few minutes:
- the Launch Complex at Year 2;
- Luyten's Star reply windows at 2.3 and 2.9, after which the row reads "None came";
- the All-Sky Watch at 4.5, the Deep Flash Watch at 6.2, and the compute bar filling.

The Mind keeps it company. On "Nothing seems to be happening" it said "We are waiting on the slow parts: light and building… the next news is close." [22](22-mind-waiting.png) Nothing in the sky changes for 30 minutes, though. After Year 15, one Next press goes to Year 311.7, and the first glow comes at 39,272.

## What worked

- **The warm glow.**
  - The lead gives a range, "22,000 to 40,000 ly", with "Too far for parallax. A range, not a distance". [34](34-warm-glow-2-lead.png)
  - The Mind gave the range, put a dusty young star or a merger first, and said "We think a natural cause is more likely". [35](35-mind-warm-glow.png)
- **The relay.** The Mind called it "a dark craft a few meters across, about 8.5 light-days out… That the two line up is our guess, not proof. It went quiet when we came." It never called it a mind's home. [48](48-mind-relay.png)
- **The Mind after the ladder.**
  - On the probes: "We can't say for sure. All 14 stopped within about 220 Years… Our guess is that whoever sent the watcher saw our seeds copying themselves." [66](66-mind-why-quiet.png)
  - On the strike: "A bullet, most likely… Who fired it, we can't tell." [67](67-mind-what-struck.png)
  - It reasoned from what we saw and never claimed to know the maker.
- **The strike's harm on Build, and nothing names the sender.** I searched Scan, Build, Reach and both leads for any naming of the sender and found none.
- **Skip-ahead only went forward.** Every stop landed on the Year in its label, and the Year, calendar and Build updated. The 16:05 fade fix works once Scan refreshes (finding 2).
- **What each survey showed:**
  - Moon Search: "Found a dark body about 10 cm across at the Moon's L4, at Year 48,153.3."
  - Asteroid Tour: "Mapped all 6 asteroids that share our orbit by Year 48,164.1. Only rock."
  - Halo Survey: "Found a cold glow… Cold glow 1, at Year 48,571.5", 420 Years after it was ordered.
  - [40](40-after-surveys-build.png)

## Not covered

- I didn't test the warning in a seed where only the warning can find the watcher (Sun–Earth L4 or L5, like seed 23). Finding 1 says that is the path where the warning should still work.
- I didn't send the watcher a knock, push the rock away, or send a hello message.
