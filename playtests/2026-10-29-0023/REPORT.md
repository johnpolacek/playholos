# Holos Cloud Playtest · 2026-10-29 00:23 UTC

A first session played as a brand-new player, following `playtests/PROMPT.md`.

## CLI Mind status

**Working.** I ran the dev server with `MIND_VIA=cli npm run dev`, and the Mind answered through the `claude` CLI (2.1.312) on every one of 12 questions. No game code was changed. Nothing failed in the CLI path, and the dev server log had no `Mind (CLI):` errors.

- Most replies started in about 1.5 s and finished in 12–18 s.
- One reply, a drafted message to Hael, took **80 s** to finish ([66](66-ask-reply-hael.png)).
- No reply was empty. No Mind line says "I". The only "I" in [mind-transcript.txt](mind-transcript.txt) is in my own question.

## What I did

- **Setup:** fresh headless Chromium at 1440×900, with no saved state.
- **Onboarding** ([01](01-landing.png) → [11](11-inherit-done.png)):
  - Landing, then Begin game.
  - The memories: Where we come from, Who we are, Where things stand, What you inherit.
- **Charter:** picked "If anyone is out there, let them find a friend." ([13](13-charter-ready.png), [16](16-next.png)).
- **Leads:** reviewed all 10 on the map, and opened Close View on Luyten's Star ([18](18-next.png)–[22](22-close-view.png)).
- **Builds:** queued only the All-Sky Watch and the Infrared Telescope. That left seven skipped, including the Launch Complex, Thought Fields, Deep Flash Watch, Laser Sail Array and Probe Yard ([23](23-builds.png)–[27](27-queued-launch.png)).
- **Reach:** went through the Reach tour ([29](29-reach-Send_a_flyby_probe.png), [30](30-roads.png)) and asked one question before Begin ([32](32-ask-year.png)).
- **Begin:** pressed Begin at Year 0, at 00:32:25 UTC ([34](34-begin-screen.png), [35](35-after-begin.png)).
- **In play, I ordered skipped builds:**
  - Thought Fields and the Launch Complex from the Build tab ([38](38-tf-queued.png), [41](41-build-list.png)).
  - Deep Flash Watch from a Mind card ([43](43-dfw-from-mind.png)).
  - Later the Halo Survey and the Laser Sail Array.
  - **Ordering skipped builds in play works**, and the panel reads "Under way. Done in …", not "Not in our order yet".
- **Messages:** sent a hello to Luyten's Star at Year 2.8 ([55](55-sent.png)). Overheard Hael's call from Alpha Centauri A at Year 4.5 and answered it at Year 5.3 ([64](64-call-open.png), [67](67-hael-sent.png)).
- **Duration:** played to **Year 6.5, about 33 minutes after Begin**, checking in every 2–4 minutes. There are timed snapshots at Years 1, 2.4, 3.6, 4.4, 5.4 and 6.4.
- **Console:** no console errors or page errors the whole run. The only warnings were headless WebGL "GPU stall due to ReadPixels".

## Findings, most severe first

### High

1. **The session's biggest event arrives with no alert.**
   - What happens: Hael's call from Alpha Centauri A landed at Year 4.5 while I was in the Mind tab. The only sign was a small dot on the Scan tab ([61](61-scan-call.png)).
   - How I found out: the Mind raised it unprompted, as "We have news first…", when I asked whether to call out ([60](60-ask-callout.png)).
   - It's hard to find on Scan too: the panel was scrolled down to the messages, so the HEARD card at the top was out of view until I scrolled up ([63](63-scan-call-card.png)).
   - Why it matters: a new player could easily miss first contact.

### Medium

2. **Idle compute balloons and nothing says so.**
   - The growth: as Thought Fields grows compute, idle compute goes from 48% at Year 4.4 to 65% at Year 5.4 and 85% at Year 6.5 ([57](57-build-y4_3.png), [68](68-build-y5_4.png), [73](73-build-y6_5.png)). Only the header and the ring show it.
   - Nothing explains it: I learned why only by asking the Mind ([58](58-ask-idle.png)). Its answer was that a build can't go faster than about two thirds of its standard time.
   - Before that, the ring says "100% at work", but the legend's "needs" add up to about 19% ([51](51-build-y2_6.png)).

3. **"Under way" keeps finished builds.**
   - At Year 6.5 it reads "UNDER WAY · 7", and five of those rows say "done": All-Sky Watch, Infrared Telescope, Launch Complex, Deep Flash Watch and Halo Survey ([73](73-build-y6_5.png); first seen at [51](51-build-y2_6.png)).
   - There is no separate "Done" section.

4. **Stale text on the Build tab.**
   - The header says "Year 0 has begun" at Years 2.5, 4.3 and later ([51](51-build-y2_6.png), [57](57-build-y4_3.png)).
   - The energy chart caption still says "Our compute stays at its Year 0 level… Thought Fields would grow it 130×", even with Thought Fields ordered at Year 0.2 and compute visibly growing ([41](41-build-list.png), [57](57-build-y4_3.png)).

5. **Luyten's Star reply window reads wrong once it has passed.**
   - At Year 2.4, the lead still says "To our 2017 message, as soon as Year 2.3, about 12 minutes after we begin" ([49](49-y2_5.png)).
   - In Messages, the 2017 "A reply could come, at the soonest" row is marked **"landed"** ([56](56-scan-y3_6.png)). That reads as if a reply arrived.
   - The Mind gets it right: the window "passed in silence" ([50](50-ask-luyten.png)).

6. **One slow Mind reply.** Drafting the message to Hael took 80 s, against 12–18 s for every other reply ([66](66-ask-reply-hael.png)).

### Low

7. **The call card's "CAUGHT BY" is odd.** It says "Year 0's sky watch", though the All-Sky Watch had finished at Year 4.2, just before the call came in ([64](64-call-open.png)).
8. **Alpha Centauri A's distance doesn't match.** The map label says 4.4 ly and later 4.5 ly ([61](61-scan-call.png), [62](62-scan-map-again.png)). The card and the Mind say 4.3 ly ([63](63-scan-call-card.png)).
9. **Map labels still collide** ([62](62-scan-map-again.png)):
   - "Proxima Centauri" runs into "Alpha Centauri A's call", and the call's ring crosses both.
   - "Luyten's Star" shows twice, side by side.
   - "72 Herculis" is clipped at the panel edge.
   - At the start, "HD 122064" is cut off under the header ([18](18-next.png)).
10. **The flyby-probe chart looks inconsistent.**
    - It reads "built 37.5 · passes 83.4" at "an eighth of light's speed", but 37.5 + 4.24/0.125 = 71.4.
    - The code is right: the probe is built 12 Years after the Probe Yard (`game/lib/game/reach.ts:63`). The chart just doesn't say so ([29](29-reach-Send_a_flyby_probe.png)).
11. **The Mind and the card disagree on Deep Flash Watch.** The Mind says it "will take longer than its six Years". The card beside it says it would be done by Year 5.5, in 25m ([42](42-ask-build-next.png)).
12. **Fusion Plants is a jarring first-build option.** It shows as 22h 30m, done by Year 270, among builds of minutes ([23](23-builds.png), [24](24-explore.png)).
13. **Two "Send" buttons.** The chat's submit button has `aria-label="Send"`, the same name as the message card's Send button. That makes it ambiguous for assistive tech and for tests.
14. **Spacing in Close View.** The subtitle shows "reached in 1h  01m", with a double space and mixed fonts ([22](22-close-view.png)).

## What worked well

- Onboarding pacing, the charter choice, and the 10-lead review all flowed without dead ends.
- Ordering skipped builds after Begin works from the Build tab and from Mind cards.
- The Mind stayed in "we" voice and in character. It tied the Halo Survey's grey glow at Gliese 673 to Hael's "quiet glow" on its own ([71](71-ask-halo.png)), and it reported the Infrared Telescope's first reading of Keid's air ([74](74-ask-ir.png)).
- No console errors.
