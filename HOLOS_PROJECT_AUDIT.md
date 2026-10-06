# Holos · Project audit

Last updated: October 6, 2026.

Every v1 project's cost and effect, checked against physics and real designs, at Earth's 2040 scale. This is the working basis for v2's project catalog. Nothing here is settled until [HOLOS_GAME_CONCEPT.md](HOLOS_GAME_CONCEPT.md) says so. v1's catalog is in [legacy/v1/HOLOS_PROJECTS.md](legacy/v1/HOLOS_PROJECTS.md). Sources are in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md).

**Method.** Matter is v1's, from its tier points: 20 kt a point at tier 1, then 200 kt, 2 Mt and 20 Mt. Energy is v1's share of the grid, now 0.24 TW a percent. Compute shares are left out: v1 made them a choice of how much thought goes into the work, not a physical draw. Each verdict is an order of magnitude, not a design.

**Verdicts.** *OK*: within a few times of a real design or calculation. *Heavy ×N* or *Light ×N*: off by about that factor. *Ground*: built on Earth from Earth's own industry, so it shouldn't spend matter in orbit. *Slow*: real trends deliver it faster. *Calc*: needs a calculation before it can be priced.

## What the audit found

- **v1's matter was a pacing currency, not mass.** Each tier multiplied the price by ten, whatever the thing was. Real masses run from 100 kg to gigatonnes, so 28 projects are too heavy, many by a thousand to a million times. A starshade costs 5 Mt in v1. The Starshade Rendezvous design weighs 3.8 t.
- **On Earth, ground builds don't need matter in orbit.** Earth's economy moves about 106 Gt of materials a year (UNEP, 2024). Five v1 projects are ground builds: spectrographs, flash domes, radio arrays, neutrino tanks and fusion plants.
- **A few effects are far off.** The orbital solar array delivers 10 to 150 times more than its mass allows. One fusion plant project adds 14 TW, the output of about 36,000 first-generation plants. A ground data center's +25% compute takes 8 Years, while chip stock now grows about threefold a year.
- **Energy-hungry acts need real calculations.** Antimatter production, the deflector laser, the mind transmitter and the laser sail array. The beacon's range is now worked, below. v1 had already flagged the star laser and radio ranges.
- **14 hold up.** The cold compute annex, the habitat ring, star lifting, chip swarms and the starting instruments are within a few times of real designs.

**Counts:** 21 OK, 28 Heavy, 1 Light, 1 Slow, 5 Ground, 18 Calc. Seven Calc items have since been worked.

## What it means for pacing

Matter is now real mass in space (settled 2026-10-06). Most instruments and probes become cheap in matter, so build time, compute shares, lift and propellant pace them. The big works stay expensive.

- **Early probes are affordable.** A flyby probe is about 100 t and a sentinel about 500 t, against 250 kt in orbit and 40 kt a year. v1 made them megatonnes.
- **The self-replicating factory is a 100 t seed.** Its prerequisite chain is now the gate: belt prospecting, belt mining and the foundry, so it finishes no sooner than Year 136, about 11 real hours in. Once it runs, matter stops being scarce.
- **Heavy bullets are about 0.4 Mt each,** after a fuel works. With no matter to save up, the chain alone gates them: the first heavy impactor is ready by Year 186, about 15.5 real hours in, against v1's day and a quarter. v1 set no floor on early death and said to revisit only if playtests show early deaths.
- **Proposed prices keep v1's Years** except where real trends say otherwise. Build time is now the main pacing lever, and the mocks will test it.

## Calculations

Worked in [calcs/early_game.py](calcs/early_game.py). Orders of magnitude from published numbers, not designs.

**The broadcast beacon is cheap.** A steady tone sent every way at once, heard when its flux beats a receiver's floor: SNR × SEFD × √(channel ÷ (2 × stare)). The same form puts a big dish's 5-minute floor at 10 ly near 10¹⁰ W, as Breakthrough Listen reports.

| Receiver | 0.1% of energy | 1% | 10% |
| --- | --- | --- | --- |
| Big dish, 5 minutes, SEFD 10 Jy | 17 ly | 55 ly | 174 ly |
| SKA-Mid, 1 hour, SEFD 1.1 Jy | 128 ly | 406 ly | 1,283 ly |
| Sky watch, 1 day, SEFD 45 Jy | 44 ly | 140 ly | 444 ly |

- v1 charged 10% of energy for a beacon a sky watch hears at 10 ly. A hundredth of that reaches 44 ly.
- So speaking costs almost nothing in energy. What it costs is being found.
- The sky watch row assumes CHIME's sensitivity in every direction at once. CHIME itself sees about 200 square degrees.

**Belt mining passes.** Metal-rich rock needs melting, about 2 GJ a tonne. Hauling it home by solar-electric thrust, 7.5 km/s at 30 km/s exhaust, costs about 166 GJ a tonne. 120 kt a year takes about 0.6 GW at the belt, about 5 kt of arrays at 137 W/kg. A 10 kt fleet fits.

**The far-side array is a lunar industry project.** 1,000 km² of mesh dishes at an assumed 1 kg/m² is about 1 Mt of lunar metal, made in place as FarView plans. Its SEFD would be about 2×10⁻⁴ Jy, about 60,000 times a big dish. Its reach for a world's hum is still v1's open radio question.

**Still to calculate:** star lifting's matter, the solar swarm's seed, the launcher, the fusion torch ship, antimatter production, the heavy impactor's fuel supply, decoys, the far platform, the mind transmitter, dispersal outposts, the deflector laser, the sunshade, heat shields, wandering habitats, shadow berths and the dead hand.

## Project by project

Proposed prices are matter in orbit, on the Moon or in the belt. Ground builds spend none. Compute shares stay as v1 set them.

### Know

| Project | v1 matter | Verdict | Proposed for 2040 | Basis |
| --- | --- | --- | --- | --- |
| Transit watch | 0 | OK | 2 t | A PLATO-class space telescope, about 2 t. |
| Spectrograph bank | 100 kt | Ground | 0, ground | Spectrographs on ground telescopes, tonnes each. |
| Deep flash watch | 100 kt | Ground | 0, ground | PANOSETI-style ground domes. |
| Deep-field receiver | 300 kt | Ground | 0, ground | An SKA-class ground array. |
| Planet survey | 0 | OK | 0 | Existing telescopes and archives. |
| Infrared telescope | 200 kt | Heavy ×5,000 | 40 t | LUVOIR-A, the largest studied, 28 to 37 t. JWST 6.2 t. |
| Waste-heat survey | 0 | OK | 0 | Existing telescopes and archives. |
| Second infrared telescope | 3,000 kt | Heavy ×100,000 | 60 t, with the stage to reach its far station | A LUVOIR-class twin, tens of tonnes. |
| Starshade | 5,000 kt | Heavy ×1,000,000 | 10 t | Starshade Rendezvous design, 3.8 t at launch. |
| Pulsar timing array | 0 | OK | 0, ground | Ground radio telescopes. |
| Neutrino watch | 6,000 kt | Ground | 0, ground | Hyper-Kamiokande holds 260 kt of water, underground. |
| Infrared interferometer | 40 Mt | Heavy ×100,000 | 200 t | A few LUVOIR-class mirrors flying in formation, about 100 t. |
| Solar lens observatory | 40 Mt | Heavy ×100,000+ | 5 t. 30 Years, not 70: about 25 AU a year gets there in about 25. | NASA concept: small sailcraft, about 100 kg each. |
| Far-side array | 40 Mt | OK, recalculated | About 1 Mt of lunar metal made in place, as FarView plans, at an assumed 1 kg/m². Needs the mass driver line. | Depends on the antenna design. Thin wire antennas weigh little, steel dishes a great deal. |
| Kilometer interferometer | 800 Mt | Heavy ×100,000+ | 1 kt | A fleet of large mirrors, thousands of tonnes at most. |

### Grow

| Project | v1 matter | Verdict | Proposed for 2040 | Basis |
| --- | --- | --- | --- | --- |
| Orbital solar array | 400 kt | Light ×10 to 150 | Split in two. A ground solar build-out: 0 matter, +20% energy in 10 Years, about 5× today's install rate. An orbital array at tier 2: 10 Mt for +20%, at 1 kW/kg and half lost beaming it down. | Flown arrays 75 to 218 W/kg, target 1 kW/kg. +20% of 24 TW is 4.8 TW: 5 to 60 Mt. |
| Belt prospecting | 0 | OK | 5 t | Small survey probes. |
| Ground data center | 0 | Slow ×10 | 0, ground. 1 Year, not 8. Draws 0.25% of energy. | Chip stock grows about 3× a year now. +25% takes months, not 8 Years. Energy is 0.25%, not 3%. |
| Second launch complex | 0 | OK | 0, ground. Unchanged. | Starship cadence growth. |
| Cold compute annex | 300 kt | OK | 100 kt | +25% compute is about 25 GW in orbit. Solar at 0.2 to 1 kW/kg is 25 to 125 kt, plus chips and radiators. Google Suncatcher is testing it. |
| Belt mining | 0 | OK, recalculated | 10 kt fleet for +120 kt a year. Hauling takes about 0.6 GW at the belt, about 5 kt of solar arrays. | Unproven. A mining fleet weighs something, so zero matter is too light. |
| Orbital foundry | 6,000 kt | Heavy ×100+ | 1 kt | NASA 1980: a 100 t seed factory grows itself. |
| Mass driver | 4,000 kt | Heavy ×20,000 | 1 kt with its power plant, for +600 kt a year, as O'Neill estimated. | O'Neill: a 100 to 200 t driver throws 600 kt a year. |
| Ice harvest | 3,000 kt | OK, recalculated | 5 kt fleet for +60 kt a year of belt ice. About 0.3 GW at the belt. Saturn is too dim for solar power. | Earth's nearest ice at 9 AU is Saturn's rings and moons. |
| Fusion plant | 5,000 kt | Ground, effect ×35,000 too big | 0, ground. +5% energy over 40 Years: about 3,000 ARC-class plants. | The first ARC plant gives 400 MW. +60% of 24 TW is 14 TW, about 36,000 such plants, built on the ground. |
| Habitat ring | 80 Mt | OK | 10 Mt, mostly lunar soil, so it needs the mass driver. | Stanford torus: 10 Mt, 95% of it shielding, for 10,000 people. |
| Self-replicating factory | 60 Mt | Heavy ×600,000 | 100 t seed. Its 80 Years stay: they are the work of making copying possible. | NASA 1980: a 100 t seed copies itself in about a year. |
| Solar swarm | 100 Mt | Calc | 10 kt seed. Calc. | Collectors copy themselves, so the seed can be small. |
| Star lifting | 400 Mt | OK | Energy is the gate, about 2×10¹⁸ W. Matter Calc. | Lifting 300 Gt a year off the Sun takes about 2×10¹⁸ W against its gravity. |

### Reach

| Project | v1 matter | Verdict | Proposed for 2040 | Basis |
| --- | --- | --- | --- | --- |
| Tight-beam transmitter | 0 | OK | 0, ground | Laser links like DSOC, scaled up. |
| Broadcast beacon | 0 | OK, recalculated | 0, ground. Sending 0.1% of energy, not 10%: a sky watch hears it to 44 ly in a day, a big dish to 17 ly in 5 minutes. See Calculations. | Sending is 10% of energy, now 2.4 TW. Range needs a receiver calculation. |
| Launcher | 5,000 kt | Calc | 10 kt | Depends on what it launches. |
| Relay station | 3,000 kt | Heavy ×1,000+ | 50 t | A repeater is tonnes, not megatonnes. |
| Flyby probe | 4,000 kt | Heavy ×100+ | 100 t for a 1 t payload | Daedalus: 54 kt for 450 t to 0.12c. A one-tonne payload needs about 100 t. |
| Sentinel probe | 50 Mt | Heavy ×1,000 | 500 t: 5 t payload, fusion out, magnetic sail in. | Daedalus-class out, magnetic-sail braking in. |
| Lurker | 40 Mt | Heavy ×1,000 | 500 t | As sentinel. |
| Close watcher | 30 Mt | Heavy ×1,000 | 500 t | As sentinel. |
| Line tap | 20 Mt | Heavy ×1,000 | 500 t | As sentinel. |
| Laser sail array | 40 Mt | Calc | 0, ground, as Starshot plans. Bursts of 100 GW per gram chip. | Starshot: 100 GW for minutes per gram chip. Array mass depends on design. |
| Starlight sail | 10 Mt | Heavy ×1,000,000+ | 1 t | Heller and Hippke: gram to kilogram sails. |
| Chip swarm | 0 | OK | 0 | Starshot gram chips. |
| Torch probe | 60 Mt | Heavy ×1,000+ | 500 t for a 3 t payload: about 0.08c, then a stop. | About 0.08c, then stops: a mass ratio near 120, so about 120 t per tonne of payload. |
| Seed probe | 60 Mt | Heavy ×1,000 | 1.1 kt: a 100 t seed factory, 0.04c, then a stop. | About 0.04c, then stops, carrying a seed factory of about 100 t. |
| Seedship | 70 Mt | Heavy ×100+ | 10 kt: a 1 kt factory and designs, 0.04c, then a stop. | A 100 t seed factory plus fuel for 0.04c and a stop. |
| Fusion torch ship | 800 Mt | Calc | About 0.4 Mt per kt of payload for 0.1c and a stop. Calc. | A crewed or mind-carrying ship. Size is a design choice. |
| Antimatter probe | 200 Mt | Calc | 10 t. Energy is the gate. Calc. | Today 10⁹ joules in per joule of antimatter. Needs about 10⁻⁴ efficiency to fit, unproven. |
| Heavy impactor | 80 Mt | Heavy ×25 per bullet | 1 Mt fuel works, then about 0.4 Mt per 1,000 t bullet. Fuel supply Calc. | 1,000 t at 0.2c with Daedalus-class exhaust: about 0.4 Mt per bullet. v1 says 10 Mt. |
| Decoys | 20 Mt | Calc | About 20 kt each: a 50 t shell needs the bullet's speed. Calc. | Each decoy must match the bullet's speed, so its fuel scales with its mass. |
| Pellet swarm | 10 Mt | Heavy ×1,000 | 5 t of pellets. Energy fits: 1.2 TW for 16 Years. | Thousands of kilogram pellets weigh a few tonnes. Energy fits: 1.2 TW for 16 Years. |
| Sleeper | 50 Mt | Calc | About 1 Mt: a lurker and two bullets. | A lurker plus a few bullets. |
| Spoofer | 10 Mt | Heavy ×1,000 | 500 t | A lurker with a lamp. |
| Far platform | 400 Mt | Calc | Calc | A weapons base far away. Size is a design choice. |
| Spotter | 20 Mt | Heavy ×1,000 | 500 t | A close watcher. |
| Star laser | 2,000 Mt | OK, physics still open | 2 Gt. Physics still open. | A 100,000 km film covers about 8×10¹⁵ m². At 0.25 g/m² that is 2 Gt. |
| Mind transmitter | 0 | Calc | 0. Energy Calc. | Depends on how many bits a mind is, and the link. |

### Endure

| Project | v1 matter | Verdict | Proposed for 2040 | Basis |
| --- | --- | --- | --- | --- |
| Deep vault | 200 kt | OK | 10 kt | A data center dug into rock, with local rock as shielding. |
| Deep archive | 3,000 kt | Heavy ×1,000+ | 10 t | Archives in fused silica store petabytes in grams. |
| Quiet radiators | 4,000 kt | OK, a rule | About a tenth of the works it hides, as radiator panels. | Scales with the works it hides. |
| Early warning array | 40 Mt | Heavy ×1,000+ | 200 t | A few telescopes watching nearby stars. |
| Dispersal outposts | 70 Mt | Calc | 100 kt: ten vault-sized outposts. Calc. | Copies of the civilization. Size is a design choice. |
| Comet deflection | 1,000 kt | Heavy ×10,000 | 50 t | DART weighed about 0.6 t at impact. A ready fleet is tens of tonnes. |
| Decoy sites | 2,000 kt | OK, a rule | 1 kt. While lit, each draws what the works it mimics draw. | Heaters drawing what they mimic: 5% of energy is now 1.2 TW. |
| Outskirts sweep | 0 | OK | 0 | Telescopes and a few probes. |
| Shielded works | 3,000 kt | OK, a rule | As much as the works it shields: a centimeter of aluminum is 27 kg/m². | About a centimeter of shielding over everything in orbit. |
| Pickets | 20 Mt | Heavy ×1,000+ | 100 t | Small cold watchers, tonnes each. |
| Sand screens | 10 Mt | Calc | 1 kt of depots and sand | 10 t of sand per throw, plus depots. |
| Deflector laser | 50 Mt | Calc | Calc. 12 TW. | 50% of energy is now 12 TW. |
| Hunters | 30 Mt | Heavy ×1,000 | 200 t | Fusion drones, tonnes to tens of tonnes each. |
| Sunshade | 80 Mt | Calc | Calc. Shading all of Earth at 1 g/m² is 130 Mt. | Scales with the area shaded. |
| Heat shields | 30 Mt | Calc | Calc | Scales with the area shielded. |
| Wandering habitats | 20 Mt | Calc | Calc, fuel for the burns. | Scales with the habitats moved. |
| Shadow berths | 20 Mt | Calc | Calc, fuel only. | Parking orbits behind a moon cost fuel, not structure. |
| Lifeboats | 400 Mt | Calc | 50 kt: five seedships. | Several seedships kept fueled. |
| Dead hand | 400 Mt | Calc | Calc, launchers plus bullets. | Launchers at outposts. |
