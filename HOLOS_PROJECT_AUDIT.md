# Holos · Project audit

Last updated: October 11, 2026.

Every v1 project's cost and effect, checked against physics and real designs, at Earth's 2040 scale. This is the working basis for v2's project catalog. Nothing here is settled until [HOLOS_GAME_CONCEPT.md](HOLOS_GAME_CONCEPT.md) says so. v1's catalog is in [legacy/v1/HOLOS_PROJECTS.md](legacy/v1/HOLOS_PROJECTS.md). Sources are in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md).

**Method.** Matter is v1's, from its tier points: 20 kt a point at tier 1, then 200 kt, 2 Mt and 20 Mt. Energy is v1's share of the grid, now 0.24 TW a percent. Compute shares are left out: v1 made them a choice of how much thought goes into the work, not a physical draw. Each verdict is an order of magnitude, not a design.

**Verdicts.** *OK*: within a few times of a real design or calculation. *Heavy ×N* or *Light ×N*: off by about that factor. *Ground*: built on Earth from Earth's own industry, so it shouldn't spend matter in orbit. *Slow*: real trends deliver it faster. *Calc*: needs a calculation before it can be priced.

## What the audit found

- **v1's matter was a pacing currency, not mass.** Each tier multiplied the price by ten, whatever the thing was. Real masses run from 100 kg to gigatonnes, so 28 projects are too heavy, many by a thousand to a million times. A starshade costs 5 Mt in v1. The Starshade Rendezvous design weighs 3.8 t.
- **On Earth, ground builds don't need matter in orbit.** Earth's economy moves about 106 Gt of materials a year (UNEP, 2024). Five v1 projects are ground builds: spectrographs, flash domes, radio arrays, neutrino tanks and fusion plants.
- **A few effects are far off.** The orbital solar array delivers 10 to 150 times more than its mass allows. One fusion plant project adds 14 TW, the output of about 36,000 first-generation plants. A ground data center's +25% compute takes 8 Years, while chip stock now grows about threefold a year.
- **Energy-hungry acts need real calculations.** Antimatter production, the deflector laser, the mind transmitter and the laser sail array. The beacon's range is now worked, below. v1 had already flagged the star laser and radio ranges.
- **14 hold up.** The cold compute annex, the habitat ring, star lifting, chip swarms and the starting instruments are within a few times of real designs.

**Counts at first pass:** 14 OK, 28 Heavy, 1 Light, 1 Slow, 5 Ground, 25 Calc. Every Calc item has since been worked except one new project, the helium-3 harvest.

## What it means for pacing

Matter is now real mass in space (settled 2026-10-06). Most instruments and probes become cheap in matter, so build time, compute shares, lift and propellant pace them. The big works stay expensive.

- **Early probes are affordable.** A flyby probe is about 100 t and a sentinel about 500 t, against 20 kt spare in orbit and 15 kt a year of spare lift. v1 made them megatonnes.
- **The self-replicating factory is a 100 t seed.** Its prerequisite chain is now the gate: belt prospecting, belt mining and the foundry, so it finishes no sooner than Year 136, about 11 real hours in. Once it runs, matter stops being scarce.
- **Fuel gates the fast bullets.** A 1,000 t bullet at 0.2c needs about 0.66 Mt of helium-3 from a gas giant, so it waits for outer-system industry, later than v1's day and a quarter. A slow D-D bullet at 0.05c needs only ocean deuterium and can come after the prerequisite chain, about Year 186, but it hits like a 0.8 km asteroid, not a 1.9 km one, and pickets see it for years. v1 set no floor on early death and said to revisit only if playtests show early deaths.
- **Proposed prices keep v1's Years** except where real trends say otherwise. Build time is now the main pacing lever, and the mocks will test it.

## Calculations

Worked in [calcs/early_game.py](calcs/early_game.py). Orders of magnitude from published numbers, not designs.

**The broadcast beacon is cheap.** A steady tone sent every way at once, heard when its flux beats a receiver's floor: SNR × SEFD × √(channel ÷ (2 × stare)). The same form puts a big dish's 5-minute floor at 10 ly near 10¹⁰ W, as Breakthrough Listen reports.

| Receiver | 0.1% of energy | 1% | 10% |
| --- | --- | --- | --- |
| Big dish, 5 minutes, SEFD 10 Jy | 17 ly | 55 ly | 174 ly |
| SKA-Mid, 1 hour, SEFD 1.1 Jy | 128 ly | 406 ly | 1,283 ly |
| Year 0 sky watch, CHORD-class drift scan, 10 minutes a day, SEFD 12 Jy | 25 ly | 78 ly | 248 ly |
| All-sky watch project, every direction for a day, SEFD 12 Jy | 86 ly | 272 ly | 860 ly |

- v1 charged 10% of energy for a beacon a sky watch hears at 10 ly. A hundredth of that reaches 25 ly even with Year 0's drift-scan watch.
- So speaking costs almost nothing in energy. What it costs is being found.
- Year 0's sky watch is a drift scan like CHORD, finished in 2028: each northern direction passes through it for about 10 minutes a day. v1's always-on watch of the whole sky becomes a project, below.

**Compute grows as fast as chips are made, until energy runs out.** From 3×10²² operations a second in 2026 to 10²⁵ in 2040 is 1.51 times a year. One ground data center a Year at +50% keeps that pace. Thinking draws 0.25 TW of 24 at Year 0, and the draw grows with the chips: a tenth of the grid after 6 data centers, nine tenths after 11. The twelfth doesn't fit, about Year 11.

**Belt mining passes.** Metal-rich rock needs melting, about 2 GJ a tonne. Hauling it home by solar-electric thrust, 7.5 km/s at 30 km/s exhaust, costs about 166 GJ a tonne. 120 kt a year takes about 0.6 GW at the belt, about 5 kt of arrays at 137 W/kg. A 10 kt fleet fits.

**The far-side array is a lunar industry project.** 1,000 km² of mesh dishes at an assumed 1 kg/m² is about 1 Mt of lunar metal, made in place as FarView plans. Its SEFD would be about 2×10⁻⁴ Jy, about 60,000 times a big dish. Its reach for a world's hum is worked below.

**Fusion fuel is the gate for every fast craft.** Worked in [calcs/late_game.py](calcs/late_game.py). Fuel per tonne of payload comes from the rocket equation, scaled up 3.9 times because Daedalus needed that much more than one ideal stage. D-He3 exhausts at about 0.035c, D-D at about 0.016c, because most of D-D's energy leaves as neutrons.

| Trip | D-He3, t of fuel per t | D-D |
| --- | --- | --- |
| Bullet, 0.2c | 1,101 | about a million |
| Bullet, 0.1c | 61 | 1,957 |
| Bullet, 0.05c | 12 | 83 |
| Probe, 0.08c and stop | 353 | 82,394 |
| Probe, 0.04c and stop | 33 | 560 |

- A 1,000 t bullet at 0.2c needs about 0.66 Mt of He3. That is 22 Gt of Jupiter's air, 22 times everything Daedalus planned to harvest in 20 Years.
- D-D can't reach 0.2c. At 0.05c, a 1,000 t bullet needs 83 kt of deuterium from Earth's oceans and hits like a 0.8 km asteroid. At 0.2c it hits like a 1.9 km one.
- So the fast heavy bullet is a late weapon, after an outer-system industry. The early weapon is slow, and pickets see it for longer.

**The deflector laser works with a big enough mirror.** Ablation pushes about 10⁻⁴ N per watt that lands (Phipps and colleagues). Moving a 1,000 t bullet at 0.2c one Earth radius aside takes about 9 TW with a 1 km aperture, at any range: the spot grows with range as fast as the time to push does. A 10 km aperture needs about 0.1 TW.

**The antimatter probe needs the swarm.** A 10 t probe to 0.2c and back to rest needs about 1 t of antimatter. Today's production is 10⁻⁹ efficient. Even at 1%, it is 12 Years of all of Earth's 2040 energy.

**Sending a mind is cheap with big optics.** A diffraction-limited laser at 1 µm, 10 photons a bit, an assumed 100 PB mind, 10 ly: with 100 m optics at both ends, about 1.4×10¹⁴ J, under two days at 1 GW. With 10 m optics, 45 Years. v1 charged 30% of energy.

**Smaller rules.** Wandering habitats spend about 0.03% of their mass a Year on 10 m/s of random burns. Shadow berths spend 3 to 10% once. Shade and reflective film run near 1 g/m²: all of Earth is 128 Mt. A full solar swarm near 1 AU is about 0.09% of Mercury, 48 doublings from a 1 kt seed.

**A world's hum is heard by its tones, not its roar.** v1's faint hum, 40 MW spread over 1 GHz, is about 36 pJy per hertz at 10 ly, lost under the radio sources behind it. What carries is a pure tone: a digital TV station keeps a pilot tone of about 7% of its power, so a 1 MW station carries one near 70 kW. For a 100 kW tone, unwound once the world's day and year are known:

| Receiver | 1 day of listening | 1 Year |
| --- | --- | --- |
| Big dish | 0.2 ly | 0.8 ly |
| SKA-Mid | 0.6 ly | 2.5 ly |
| Far-side array | 47 ly | 206 ly |

- The far-side array's Year of listening matches v1's provisional 200 ly reach.
- v1's deep-field receiver heard a neighbor at 9 ly within a dozen Years. At SKA-Mid's sensitivity that needs tones near 30 MW for a day's listening, or near 2 MW for a Year's. How loud each neighbor's tones are is set in open question 4.

**An all-sky watch is a project, and cheap in compute.** Elements every 12.5 cm, as the EMBRACE demonstrator uses near 1.2 GHz, over a 100 m square: about 640,000 elements, 1.4 million beams, an SEFD near 12 Jy in every direction above its horizon. Forming every beam and searching each for drifting tones takes about 2×10¹⁹ operations a second, two millionths of Earth's 2040 compute. Two sites cover both hemispheres. EMBRACE's demonstrators reached about 100 m², so this is a hundredfold step.

**The projects that raise a pace, priced.** Each follows the same pattern: a standard pace from the science, and a project that raises it. Compute shares are samples, as v1 set them: how much thought goes into the work.

- *Chip fabs, 3 Years.* Eleven data centers fit under the grid. One line of fabs fills them by Year 11, a second line by Year 7, a third by Year 6.7. So one extra line is worth building and a third is not, until energy grows.
- *Factory-built works, 3 Years, a third off ground builds.* Settled 2026-10-11: a speed-up helps whatever is not yet built, so also the part left of works under way. A work of T Years begun with the factory at Year 0 is done at 3 + ⅔ × (T − 3). The all-sky watch, 6 Years, is done at Year 5. The deep-field receiver, 12, at Year 9. Fusion plants, 40, at Year 27.7. Starting at once is never worse than waiting.
- *Orbital yard, 5 Years, a quarter off builds in orbit.* By the same rule the Habitable Worlds Observatory, 8 Years left, is done at Year 7.25. The launcher, 24, at Year 19.25. The foundry, 30, at Year 23.75. Its other worth is size: works too large to launch whole.
- *All-sky watch, 6 Years.* 1.28 million elements at two sites: ten times SKA-Low's antenna count and 1,250 times CHIME's receivers, on 2.5 times CHIME's area. CHIME took 2 years to build and SKA-Low takes about 8. Six is a sample between them.

**The helium-3 harvest is about 150 kt.** Palaszewski's 100 t craft gather 500 kg of helium-3 from Uranus in 38 to 95 days, where it is 1.5×10⁻⁵ of the air, and Uranus's gravity well is far shallower than Jupiter's. That is 13 to 48 kg a Year per tonne of craft, about 10 per tonne once bases and tankers are counted. Daedalus's 1.5 kt a Year needs about 150 kt of system. One fast bullet's 660 kt would take 440 Years at that rate, so fast bullets wait for self-copying industry.

## Kinds of matter

Settled 2026-10-06: metal, rock, ice and helium-3. Every proposed mass splits by these rules.

- **Metal by default:** instruments, craft structure, film, factories, launchers and every payload.
- **Rock:** shielding, sand, and anything built on the Moon from its soil. The habitat ring is 95% rock, 5% metal. The far-side array is lunar metal smelted from rock, so it counts as rock.
- **Ice:** water, propellant for small burns, and deuterium. A slow D-D bullet's fuel is all ice.
- **D-He3 fusion fuel:** 60% helium-3, 40% deuterium as ice, by mass. A torch probe's 1 kt is about 0.6 kt of helium-3 and 0.4 kt of ice.
- **Ground builds:** none. They draw on Earth's own industry.

## Project by project

Proposed prices are matter in orbit, on the Moon or in the belt. Ground builds spend none. Compute shares stay as v1 set them.

### Know

| Project | v1 matter | Verdict | Proposed for 2040 | Basis |
| --- | --- | --- | --- | --- |
| Transit watch | 0 | OK | 2 t | A PLATO-class space telescope, about 2 t. |
| Spectrograph bank | 100 kt | Ground | 0, ground | Spectrographs on ground telescopes, tonnes each. |
| Deep flash watch | 100 kt | Ground | 0, ground | PANOSETI-style ground domes. |
| Deep-field receiver | 300 kt | Ground | 0, ground | An SKA-class ground array. |
| All-sky watch, new | none | Sample | 0, ground. 6 Years, 1% of compute. Two sites, 1.28 million elements. Every direction at every hour. Priced 2026-10-11. | CHIME was built in 2 years and DSA-2000 plans about 2. SKA-Low takes about 8 for 131,000 antennas. The watch has ten times SKA-Low's count, in elements a tenth the size. See the calculation above. |
| Planet survey | 0 | OK | 0 | Existing telescopes and archives. |
| Infrared telescope | 200 kt | Heavy ×5,000 | 40 t. 18 Years new. On Earth the Habitable Worlds Observatory is under way at Year 0: about 8 Years left. | LUVOIR-A, the largest studied, 28 to 37 t. JWST 6.2 t. |
| Waste-heat survey | 0 | OK | 0 | Existing telescopes and archives. |
| Second infrared telescope | 3,000 kt | Heavy ×100,000 | 60 t, with the stage to reach its far station | A LUVOIR-class twin, tens of tonnes. |
| Starshade | 5,000 kt | Heavy ×1,000,000 | 10 t | Starshade Rendezvous design, 3.8 t at launch. |
| Pulsar timing array | 0 | OK | 0, ground | Ground radio telescopes. |
| Neutrino watch | 6,000 kt | Ground | 0, ground | Hyper-Kamiokande holds 260 kt of water, underground. |
| Infrared interferometer | 40 Mt | Heavy ×100,000 | 200 t | A few LUVOIR-class mirrors flying in formation, about 100 t. |
| Solar lens observatory | 40 Mt | Heavy ×100,000+ | 5 t. 30 Years, not 70: about 25 AU a year gets there in about 25. | NASA concept: small sailcraft, about 100 kg each. |
| Far-side array | 40 Mt | OK, recalculated | About 1 Mt of lunar metal made in place, as FarView plans, at an assumed 1 kg/m². Needs the mass driver line. Hears a 100 kW tone to 47 ly in a day. | Depends on the antenna design. Thin wire antennas weigh little, steel dishes a great deal. |
| Kilometer interferometer | 800 Mt | Heavy ×100,000+ | 1 kt | A fleet of large mirrors, thousands of tonnes at most. |

From 2026-10-13, Planet survey and Waste-heat survey are searches: standing orders for instruments Earth already has, not builds. See [How Earth learns](HOLOS_GAME_CONCEPT.md#how-earth-learns).

### Grow

| Project | v1 matter | Verdict | Proposed for 2040 | Basis |
| --- | --- | --- | --- | --- |
| Orbital solar array | 400 kt | Light ×10 to 150 | Split in two. A ground solar build-out: 0 matter, +20% energy in 10 Years, about 5× today's install rate. An orbital array at tier 2: 10 Mt for +20%, at 1 kW/kg and half lost beaming it down. | Flown arrays 75 to 218 W/kg, target 1 kW/kg. +20% of 24 TW is 4.8 TW: 5 to 60 Mt. |
| Belt prospecting | 0 | OK | 5 t | Small survey probes. |
| Ground data center | 0 | Slow ×10 | 0, ground. 1 Year, not 8, for +50% compute. One at a time: the fabs' output. Each draws its share of energy, 0.5% of the grid for the first. Settled 2026-10-10. | Compute grew 1.5× a year from 2026 to 2040, fabs included. Thinking draws 1% of energy at Year 0, so the twelfth data center would need more than the grid. |
| Factory-built works, new | none | Sample | 0, ground. 3 Years, 5% of compute. A third off ground builds, and off the part left of any under way. Data centers keep the fabs' pace. Priced 2026-10-11. | Modular building cuts schedules 20 to 50% (McKinsey 2019). Liberty ships took over six months each at first and thirty days by late 1943. Kaiser's first Richmond yard laid a keel four months after it was begun. |
| Orbital yard, new | none | Sample | 1 kt. 5 Years, 10% of compute. A quarter off builds in orbit, and off the part left of any under way. Works too large to launch whole become possible. It assembles what Earth lifts. The foundry, later, makes parts in space. Priced 2026-10-11. | The ISS, almost 400 t, took over 40 flights from 1998 to 2011. Tiangong, about 100 t, took three launches in 18 months. 1 kt is under a month of Earth's spare lift, so fitting out sets the time, not lift. NASA's 2019 study: assembly in space is workable, and the only way past 15 m mirrors. The speed-up is speculation. |
| Chip fabs, new | none | Sample | 0, ground. 3 Years, 10% of compute. A second line: two data centers a Year. The eleven that fit are full by Year 7, not 11. A third line gains a third of a Year. Priced 2026-10-11. | A leading-edge fab takes 2 to 4 years. One firm makes the tools that print the finest chips, about 90 a year. The chip stock grew 3.4× a year in 2026, so two lines' 2.25× has been seen. |
| Launch complex | 0 | OK | 0, ground. 2 Years. +40 kt a Year of lift, all of it spare. One at a time. Settled 2026-10-10: Earth's spare lift starts at 15 kt a Year. | Starship cadence growth. Propellant is about 400 GJ a tonne lifted: half a gigawatt for 40 kt a year. |
| Cold compute annex | 300 kt | OK | 100 kt | +25% compute is about 25 GW in orbit. Solar at 0.2 to 1 kW/kg is 25 to 125 kt, plus chips and radiators. Google Suncatcher is testing it. |
| Belt mining | 0 | OK, recalculated | 10 kt fleet for +120 kt a year. Hauling takes about 0.6 GW at the belt, about 5 kt of solar arrays. | Unproven. A mining fleet weighs something, so zero matter is too light. |
| Orbital foundry | 6,000 kt | Heavy ×100+ | 1 kt | NASA 1980: a 100 t seed factory grows itself. |
| Mass driver | 4,000 kt | Heavy ×20,000 | 1 kt with its power plant, for +600 kt a year, as O'Neill estimated. | O'Neill: a 100 to 200 t driver throws 600 kt a year. |
| Ice harvest | 3,000 kt | OK, recalculated | 5 kt fleet for +60 kt a year of belt ice. About 0.3 GW at the belt. Saturn is too dim for solar power. | Earth's nearest ice at 9 AU is Saturn's rings and moons. |
| Fusion plant | 5,000 kt | Ground, effect ×35,000 too big | 0, ground. +5% energy over 40 Years: about 3,000 ARC-class plants. | The first ARC plant gives 400 MW. +60% of 24 TW is 14 TW, about 36,000 such plants, built on the ground. |
| Habitat ring | 80 Mt | OK | 10 Mt, mostly lunar soil, so it needs the mass driver. | Stanford torus: 10 Mt, 95% of it shielding, for 10,000 people. |
| Self-replicating factory | 60 Mt | Heavy ×600,000 | 100 t seed. Its 80 Years stay: they are the work of making copying possible. | NASA 1980: a 100 t seed copies itself in about a year. |
| Solar swarm | 100 Mt | OK, recalculated | About 1 kt seed. A full swarm at 1 g/m² near 1 AU is 2.8×10²⁰ kg, 0.09% of Mercury, about 48 doublings. | Collectors copy themselves, so the seed can be small. |
| Star lifting | 400 Mt | OK, recalculated | Built by the swarm's own industry. The gate is about 2×10¹⁸ W. | Lifting 300 Gt a year off the Sun takes about 2×10¹⁸ W against its gravity. |
| Helium-3 harvest, new | none | OK, recalculated | About 150 kt of craft, bases and tankers at Uranus for about 1.5 kt of He3 a year, as Palaszewski's craft scale. | Daedalus planned 30 kt over 20 Years from Jupiter. Uranus's shallower gravity is easier. Every fusion probe, ship and fast bullet draws on it. |

### Reach

From 2026-10-13, a mission sent to find out is an inquiry, and what it sends home is a dispatch. The craft below keep their names. See [How Earth learns](HOLOS_GAME_CONCEPT.md#how-earth-learns).

| Project | v1 matter | Verdict | Proposed for 2040 | Basis |
| --- | --- | --- | --- | --- |
| Tight-beam transmitter | 0 | OK | 0, ground | Laser links like DSOC, scaled up. |
| Broadcast beacon | 0 | OK, recalculated | 0, ground. Sending 0.1% of energy, not 10%: a sky watch hears it to 44 ly in a day, a big dish to 17 ly in 5 minutes. See Calculations. | Sending is 10% of energy, now 2.4 TW. Range needs a receiver calculation. |
| Launcher | 5,000 kt | OK | 10 kt of yard and fuel depot. | Depends on what it launches. |
| Relay station | 3,000 kt | Heavy ×1,000+ | 50 t | A repeater is tonnes, not megatonnes. |
| Flyby probe | 4,000 kt | Heavy ×100+ | 100 t for a 1 t payload | Daedalus: 54 kt for 450 t to 0.12c. A one-tonne payload needs about 100 t. |
| Sentinel probe | 50 Mt | Heavy ×1,000 | 500 t: 5 t payload, fusion out, magnetic sail in. | Daedalus-class out, magnetic-sail braking in. |
| Lurker | 40 Mt | Heavy ×1,000 | 500 t | As sentinel. |
| Close watcher | 30 Mt | Heavy ×1,000 | 500 t | As sentinel. |
| Line tap | 20 Mt | Heavy ×1,000 | 500 t | As sentinel. |
| Laser sail array | 40 Mt | OK, recalculated | 0, ground, as Starshot plans. About 100 GW for 10 minutes per gram chip, about 6×10¹³ J, stored. | Starshot: 100 GW for minutes per gram chip. Array mass depends on design. |
| Starlight sail | 10 Mt | Heavy ×1,000,000+ | 1 t | Heller and Hippke: gram to kilogram sails. |
| Chip swarm | 0 | OK | 0 | Starshot gram chips. |
| Torch probe | 60 Mt | Heavy ×60, recalculated | About 1 kt for a 3 t payload, 0.6 kt of it He3. | About 0.08c, then stops: a mass ratio near 120, so about 120 t per tonne of payload. |
| Seed probe | 60 Mt | Heavy ×20, recalculated | About 3.3 kt: a 100 t seed and 2 kt of He3. Or 56 kt of ocean deuterium at D-D. | About 0.04c, then stops, carrying a seed factory of about 100 t. |
| Seedship | 70 Mt | Heavy ×2, recalculated | About 33 kt for a 1 kt factory and designs. | A 100 t seed factory plus fuel for 0.04c and a stop. |
| Fusion torch ship | 800 Mt | OK, recalculated | About 1.1 Mt per kt of payload at 0.1c and a stop, 0.66 Mt of it He3. | A crewed or mind-carrying ship. Size is a design choice. |
| Antimatter probe | 200 Mt | Recalculated: needs the swarm | About 1 t of antimatter for a 10 t probe. Even at 1% production efficiency, ten million times today's, that is 12 Years of all 2040 energy. Needs the solar swarm. | Today 10⁹ joules in per joule of antimatter. Needs about 10⁻⁴ efficiency to fit, unproven. |
| Heavy impactor | 80 Mt | Recalculated: fuel is the gate | At 0.2c, 1.1 Mt of D-He3 per bullet, 0.66 Mt of it He3: 22 times Daedalus's whole harvest. At 0.1c, 61 kt. A D-D bullet at 0.05c needs 83 kt of ocean deuterium and hits like a 0.8 km asteroid. | 1,000 t at 0.2c with Daedalus-class exhaust: about 0.4 Mt per bullet. v1 says 10 Mt. |
| Decoys | 20 Mt | Heavy ×4,000, recalculated | About 5.5 kt each: a 5 t shell with fuel for the bullet's 0.2c. | Each decoy must match the bullet's speed, so its fuel scales with its mass. |
| Pellet swarm | 10 Mt | Heavy ×1,000 | 5 t of pellets. Energy fits: 1.2 TW for 16 Years. | Thousands of kilogram pellets weigh a few tonnes. Energy fits: 1.2 TW for 16 Years. |
| Sleeper | 50 Mt | Heavy ×12, recalculated | About 4 Mt: two 1,000 t bullets with fuel for 0.1c, carried there at 0.04c and stopped. | A lurker plus a few bullets. |
| Spoofer | 10 Mt | Heavy ×1,000 | 500 t | A lurker with a lamp. |
| Far platform | 400 Mt | Heavy ×12, recalculated | A seedship, about 33 kt, that builds its own launchers and fuel on site over decades. | A weapons base far away. Size is a design choice. |
| Spotter | 20 Mt | Heavy ×1,000 | 500 t | A close watcher. |
| Star laser | 2,000 Mt | OK, physics still open | 2 Gt. Physics still open. | A 100,000 km film covers about 8×10¹⁵ m². At 0.25 g/m² that is 2 Gt. |
| Mind transmitter | 0 | Recalculated: cheap | About 1 GW for under two days with 100 m optics at both ends, for an assumed 100 PB mind. Needs a receiver at the colony. | Depends on how many bits a mind is, and the link. |

### Endure

| Project | v1 matter | Verdict | Proposed for 2040 | Basis |
| --- | --- | --- | --- | --- |
| Deep vault | 200 kt | OK | 10 kt | A data center dug into rock, with local rock as shielding. |
| Deep archive | 3,000 kt | Heavy ×1,000+ | 10 t | Archives in fused silica store petabytes in grams. |
| Quiet radiators | 4,000 kt | OK, a rule | About a tenth of the works it hides, as radiator panels. | Scales with the works it hides. |
| Early warning array | 40 Mt | Heavy ×1,000+ | 200 t | A few telescopes watching nearby stars. |
| Dispersal outposts | 70 Mt | OK, a rule | 100 kt: ten vault-sized outposts. | Copies of the civilization. Size is a design choice. |
| Comet deflection | 1,000 kt | Heavy ×10,000 | 50 t | DART weighed about 0.6 t at impact. A ready fleet is tens of tonnes. |
| Decoy sites | 2,000 kt | OK, a rule | 1 kt. While lit, each draws what the works it mimics draw. | Heaters drawing what they mimic: 5% of energy is now 1.2 TW. |
| Outskirts sweep | 0 | OK | 0 | Telescopes and a few probes. |
| Shielded works | 3,000 kt | OK, a rule | As much as the works it shields: a centimeter of aluminum is 27 kg/m². | About a centimeter of shielding over everything in orbit. |
| Pickets | 20 Mt | Heavy ×1,000+ | 100 t | Small cold watchers, tonnes each. |
| Sand screens | 10 Mt | OK | 1 kt of depots and sand. | 10 t of sand per throw, plus depots. |
| Deflector laser | 50 Mt | OK, recalculated | About 9 TW for under an hour per bullet with a 1 km aperture, at any range. A 10 km aperture needs about 0.1 TW. A 1 km mirror at 1 kg/m² is about 1 kt. | 50% of energy is now 12 TW. |
| Hunters | 30 Mt | Heavy ×1,000 | 200 t | Fusion drones, tonnes to tens of tonnes each. |
| Sunshade | 80 Mt | OK, a rule | 1 g/m² of shade: all of Earth 128 Mt, one 100 km site about 8 kt. | Scales with the area shaded. |
| Heat shields | 30 Mt | OK, a rule | Reflective film near 1 g/m² over the works' area. | Scales with the area shielded. |
| Wandering habitats | 20 Mt | OK, a rule | 0.03% of the habitat's mass in propellant a year, for 10 m/s of random burns. | Scales with the habitats moved. |
| Shadow berths | 20 Mt | OK, a rule | 3 to 10% of the works' mass in propellant, once. | Parking orbits behind a moon cost fuel, not structure. |
| Lifeboats | 400 Mt | OK, recalculated | About 165 kt: five seedships. | Several seedships kept fueled. |
| Dead hand | 400 Mt | OK, a rule | Each ready bullet as the heavy impactor, plus about 10 kt of launcher at each outpost. | Launchers at outposts. |
