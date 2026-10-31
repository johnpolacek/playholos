# Holos · Realism audit

Started October 28, 2026, after [The realistic premise](HOLOS_GAME_CONCEPT.md#the-realistic-premise) replaced peers in our century. Three read-only checks covered the concept doc (Earth sections, later sections) and the game code with the Mind’s text. Each item is a finding to confirm, not a settled change. Worked one at a time. Numbers already in [To recheck at a wider scale](HOLOS_GAME_CONCEPT.md#to-recheck-at-a-wider-scale) are not repeated.

**Status words.** *Open*: not yet decided. *Fixed*: changed, with the date. *Kept*: checked and left as is, with why.

## 1. Premise level, decide first

- **1.1 Almost no mind has heard us.** Decided 2026-10-28: Earth is unheard at Year 0, and quieting shapes the radio front ahead. Docs and code not yet changed. Probes already here are a separate question, 1.5. Earth’s radar began in the 1950s, so by 2040 it reaches about 90 ly. The nearest mind is typically 400 ly. The chance one lies inside 90 ly is about 1%.
  - Touches: [Earth’s loud past](HOLOS_GAME_CONCEPT.md#earths-loud-past) (“physics lets every neighbor hear Earth”, “about 70% heard”), [Quieting Earth’s radars](HOLOS_GAME_CONCEPT.md#quieting-earths-radars), [Hostility](HOLOS_GAME_CONCEPT.md#hostility) (“Earth is the loud one”), builds.ts and plan.ts Quiet Radars, sites.ts:237.
  - Likely fix: Earth is almost surely unheard. Quieting shapes the radio front that reaches minds over the centuries ahead.
- **1.5 A silent watcher is here.** Decided 2026-10-28: every game has one, small and dark, in our system for millions of years. One of about 100,000 old minds in our galaxy is enough, and a galaxy-wide launch of 1 kg watchers is trivial for them and needs no self-copying. More likely than not, about 2 in 3, low confidence. Its maker may not care. Docs and code not yet changed.
- **1.6 The Fermi answer: rare, inward, watching.** Decided 2026-10-28. Rare: about 100,000 minds in our galaxy. Inward: cold computing and waiting pay best, the same incentive for every mind (Sandberg 2016). Watching: cheap insurance against young minds that spread. By parity we can spread, and then we are what they watch for. The simulation idea stays out of the premise.
- **1.7 Peers are galaxy-wide.** Decided 2026-10-28: the map becomes the whole galaxy and a game can run 100,000 Years or more. About 5 young minds woke within 100,000 years of us, 10,000 to 50,000 ly away. Old minds are late-game finds. Replaces the 1,000 ly map in [The realistic premise](HOLOS_GAME_CONCEPT.md#the-realistic-premise). Docs not yet changed.
- **1.2 Life on “3 airy worlds in 4” is our sample, not Kipping’s.** Fixed 2026-10-28: labeled the project’s sample in the concept doc and research log. Kipping 2025’s 13 to 1 is the odds that life starts fast in general, not a share of worlds. Drawing each world on its own also rules out the case where life is rare everywhere.
  - Likely fix: label 3 in 4 a sample, or draw one life rate per game.
- **1.3 Where the rare step sits.** Fixed 2026-10-28: Watson 2025 is now cited as the view set aside. The rare step stays after animals, as decided in 7a. 7a put it after animals and cited Watson 2025. Watson puts hard steps earlier, at oxygen and the great ice ages. The citation is wrong, and oxygen as the hard step needs weighing again now that minds are rare.
  - *Complex cells, kept 2026-10-31.* Weighed as the early hard step: Lane and Martin 2010 and Mills et al. 2022 for, Booth and Doolittle 2015 and Coale et al. 2024 against. The rare step stays after animals. Moving it leaves the count of minds alone but strips animals from most living worlds near us. Reasoning in [Step 7](HOLOS_MODELING_ALIENS.md#step-7-from-animals-to-a-mind-that-builds).
  - *Oxygen, kept 2026-10-31.* Weighed as a hard step: Watson 2025 for, Horne, Goldblatt and Kump 2025 against. Oxygen-making life came early, and the planet set the long wait. Oxygen stays a clock in step 6. Ozaki and Reinhard 2021 fit the window Holos uses, so no number moves. Reasoning in [Step 7](HOLOS_MODELING_ALIENS.md#step-7-from-animals-to-a-mind-that-builds). Item 1.3 is closed.
- **1.4 A grey glow’s first odds.** Fixed 2026-10-31. The live lead, the realistic premise’s cold glow in leads.ts `mindLeads`, already ranks something natural likely, a measuring error unlikely, and a mind unlikely, since minds are rare. The old path that rated a mind likely, `glowLead` and `glowReading` with `EarthView.glows`, had nothing feeding it since the rework, so it is removed. Before: leads.ts:661 rated “a Mind computing cold” likely and “something natural” unlikely.

## 2. Physics errors

- **2.1 Screens can’t stop a bullet as designed.** Fixed 2026-10-31 by retiring the Picket Yard, the designer’s pick. A working screen needs about 2.6 Gt over Earth’s face, held near 0.4 AU out, by a spread no paper models, chasing a line that sweeps as Earth orbits. The watcher sees what we build, and no code ever marked a strike screened. The Interceptor and Strike Yard stay. Removed from plan.ts, builds.ts, sites.ts, marks.tsx, reach.ts, reach.tsx, destination.tsx, types.ts, hits.ts, works.json, the worker and the calcs. Before: Open. A screen must cover Earth’s whole disc, about 12,700 km, not 10 km, so about 2 Gt. It spreads a bullet’s energy but doesn’t remove it: about 3 MJ/m² still lands, not 3.5 kJ/m². Concept L853, HOLOS_RESEARCH.md L2262.
- **2.2 A gram at a tenth of light speed carries 450 GJ, not 450 MJ.** Fixed 2026-10-28. sites.ts:257. Checked: ½ × 10⁻³ kg × (3×10⁷ m/s)² = 4.5×10¹¹ J.
- **2.3 Hiding heat in a black hole hides at most about half.** Fixed 2026-10-31. Gates, Hadar and Lupsasca 2021: about 55% of light escapes even from the innermost orbit at top spin. Without spin about 85% escapes, our arithmetic. A refuge still stays unseen, since it stays at our 2040 scale. Changed: the concept’s Hide in It, the research log, knowledge.ts’s refuge line, leads.ts’s “a dark place to put heat”. Also fixed knowledge.ts’s furnace threshold, 10^19 W left over from 2.4. Before: Open. At the innermost orbit most light escapes. Concept L1277.
- **2.4 The soft X-ray threshold is about 2×10²⁰ W at 20 ly, not 10¹⁹.** Fixed 2026-10-31. eRASS1’s 5×10⁻¹⁴ erg/s/cm² at 20 ly is 2.2×10¹⁹ W in the band, and a tenth in the band makes 2.2×10²⁰ W in all. Our own furnace now shows about 230 Years on, not 200. No code used the number: the concept, calcs/holes.py’s comment and the research log. leads.ts’s “about a millionth of the Sun” holds, at 0.6 millionths. Before: Open. The source’s 2×10¹⁹ W assumes all light in the band. With a tenth in the band, multiply by 10.
- **2.5 The (77/12)³ glow scaling is about 135, not 264.** Fixed 2026-10-31. `halo_floor(77) / halo_floor(12)` in calcs/early_game.py gives 134.5 at 850 µm. Our 77 K glow shows past about 4×10²⁰ W at 10 pc, not 8×10²⁰, so about 25 doublings for a watcher 10 ly out, not 26. Only text used it: the concept, builds.ts and plan.ts. Before: “about 120”. At 12 K, 850 µm isn’t on the long tail. Our 77 K glow is about twice as easy to see as stated. Concept L883, L1337.
- **2.6 Rocks.** Fixed 2026-10-28 in rocks.ts: four sizes, up to 1 km darkening the sky. 300 m wrecks a region, not a continent. Dimming the sky needs about 1 km (Toon et al. 1997). 100 m is about 40 Mt. rocks.ts:95-96.
- **2.7 The black hole furnace gives 6% to about 30%, not 42%.** Fixed 2026-10-28. The code caps spin at 0.998. builds.ts:22, leads.ts:617.
- **2.8 A vault seed doubles about every 5 Years, not 2.** Fixed 2026-10-31. A vault wakes with Earth gone, so no chips come from home: the Moon Vault doubles every 5 Years and the Trojan Vault every 7, a sample. Our colony keeps 2, since it has its own industry. hits.ts `restoreOf`, the concept and the research log. Metzger’s 41 t case doubles about every 2.0 years, also with Earth’s help. The Solar Swarm’s 2 Years is Earth-backed, inside the 1 to 5 Years of the peers’ build-out, so it stays. Before: Open. Metzger et al. 2013 grow 12 t to 156 t in about 20 years, and lean on Earth for parts. Concept L867.
- **2.9 The Strike Yard has no helium-3 gate.** Fixed 2026-10-29, marked 2026-10-31. A bullet now waits on the Helium-3 Harvest: 36.6 kt of helium-3 in its 61 kt of fuel, from Uranus at 1.5 kt a Year, doubling every 5 Years. First bullet about 12 Years after the harvest is done. meetings.ts `HE3`, conflict.ts, reach.ts, and concept “Bullets wait on helium-3”. Before: One bullet needs 61 kt of fuel, but helium-3 comes from Uranus at 5,000 t a haul. Concept L854, L891, L1271.
- **2.10 Tritium limits fusion’s doubling to about 4 to 5 Years, not 2.** Open. Fuel-cycle studies, and the project’s own note on France’s fastest build-out. Concept L505-506.

## 3. Stale or overstated facts

- **3.1 Compute’s cap uses all primary energy, 24 TW, not electricity.** Open. Electricity is about 3.5 TW today, about 5 TW by 2040. Concept L372, L388-390, L507, L1188.
- **3.2 Chips can get 50 to 1,000 times more efficient than 2023’s, not exactly 200.** Open. 200 is the geometric mean (Epoch). Concept L394.
- **3.3 Proxima b’s reflected light is likely seen from the ground before 2040.** Open. RISTRETTO on the VLT about 55 hours (A&A 702, A230, 2025). ANDES on the ELT about 320 hours for oxygen. Concept L555, L308.
- **3.4 The 15 m Mirror pitch counts homes from the old premise.** Fixed 2026-10-31. It now pitches oxygen, not smog. Over the 32 seeded games, about 12 worlds a game hold oxygen in their air. Within two months, the 6.5 m reads 8 of 382, about 1 in 50, and the 15 m reads 72, about 1 in 5, by lib/sim/observing.ts. builds.ts:43 already agreed. plan.ts. Before: Open. “Smog at about 1 living world in 12” came from about 4 homes a game. It also clashes with builds.ts:19. plan.ts:199.
- **3.5 Voyager 1 is about 215 AU out at Year 0, not 170.** Fixed 2026-10-28. sites.ts:468.
- **3.6 82 Eridani d is at least 5.8 Earth masses, not 5.** Fixed 2026-10-28. mind/leads.ts:266.
- **3.7 Luyten’s Star b sits at the warm zone’s hot edge, not in it.** Fixed 2026-10-28. 0.091 AU against an inner edge of 0.098. leads.ts:802.
- **3.8 Luyten’s reasons.** Fixed 2026-10-28: rests on rarity, and a quiet old mind is the likelier of the two unlikely cases. “No one heard” should rest on rarity, not “no search has found anyone”. An old mind that heard would most likely stay quiet, so “heard and stays quiet” should rank at least as high as “a reply”. leads.ts:806-808.
- **3.9 “None is coming” should be “none known to be coming”.** Open. Rocks no survey mapped strike in 12 of 33 seeds. Concept L368, L524.
- **3.10 About 90 lithography tools a year is capacity, not shipments.** Open. Shipments have run about 45 to 55, unchecked. Concept L438.
- **3.11 Fusion timing reads three ways.** Open. earth.ts:211, sites.ts:309, plan.ts:178.
- **3.12 First life by 3.7 billion years ago or earlier, not 3.5.** Fixed 2026-10-28. past.ts:28.
- **3.13 The Solar Lens in 6 months is a best case.** Open. Others estimate 14 months to years. Concept L754, L757.
- **3.14 A young Mind’s doubling is a tuned number stated as fact.** Open. leads.ts:673-676, 687.
- **3.15 Labels.** Open. The 77 K choice is about radiator area, not where chips stop gaining (L882). 10⁸ Mt as the end of Earth’s Mind is a design line (L860). A 100 PB Mind is a sample (L1286).

## 4. Still assumes the old premise

For the rework, not decided one by one. **2026-10-29:** the roster is retired, so the neighbor items below lose their source. Each is fixed as its code is deleted or reworded.

- **50 ly reach:** sends.ts:51 and 85, send-card.tsx:59, leads.tsx:32, scan.tsx:218, sources.ts:182, the Halo Survey in builds.ts:21, sites.ts:126 and concept L1305-1312, the 50 ly census for seed probes at L1199.
- **Black holes:** the region stays 100 ly and no neighbor woke more than a century before Earth, L1255-1260. A 1,000 ly map holds about 76,000 holes, and any old mind reached the near ones long ago.
- **Homes on a first pass:** concept L655-657, L682, L687, L710, L726, L768.
- **Hand-written minds the seed never draws:** L660-663.
- **Neighbors who shoot, probe, race or warn us:** sites.ts:267, builds.ts:27-33, mind/conflict.ts, plan.ts:176 and 217, leads.ts:519-551, 618, 633.
- **Cities and ruins in reach:** leads.ts:373-388, 427-436, 568.
- **Neighbors near:** charter.ts:110, earth.ts:24, sites.ts:99, leads.ts:600.
- **Ordinary neighbors at Earth’s 2040 scale, a quiet sky from neighbors’ choices:** concept L1149-1171, L1302, Hostility L892-901.

## Kept

- **“Life on Earth is solved” at Year 0** (worker/mind.ts:30). A check flagged it as past current evidence. Kept: it is the setting’s singularity, set by the user on 2026-10-17. Year 0 is humanity crossing the singularity, and life is solved.

## Checked and sound

Radar powers and reach, cell tower leakage, the aimed messages, the transit-zone stars, energy and population forecasts, Webb and Hubble build times, learning rates, the coronagraph limit, Cold Annex radiators, bullet energy at 0.1c, braking, probe jets, seed ship laser energy, deuterium, drive mass ratios, the Cold Halo floor, ALMA depth, the Herschel limit, black hole counts within 100 ly, tides, the Mind Link’s photon budget, crew and seed figures, sail travel times, Breakthrough Listen and Hephaistos, the cosmic shoreline, and Suncatcher’s 2026 launch.
