# Holos · Project audit

Last updated: October 6, 2026.

Every v1 project's cost and effect, checked against physics and real designs, at Earth's 2040 scale. This is the working basis for v2's project catalog. Nothing here is settled until [HOLOS_GAME_CONCEPT.md](HOLOS_GAME_CONCEPT.md) says so. v1's catalog is in [legacy/v1/HOLOS_PROJECTS.md](legacy/v1/HOLOS_PROJECTS.md). Sources are in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md).

**Method.** Matter is v1's, from its tier points: 20 kt a point at tier 1, then 200 kt, 2 Mt and 20 Mt. Energy is v1's share of the grid, now 0.24 TW a percent. Compute shares are left out: v1 made them a choice of how much thought goes into the work, not a physical draw. Each verdict is an order of magnitude, not a design.

**Verdicts.** *OK*: within a few times of a real design or calculation. *Heavy ×N* or *Light ×N*: off by about that factor. *Ground*: built on Earth from Earth's own industry, so it shouldn't spend matter in orbit. *Slow*: real trends deliver it faster. *Calc*: needs a calculation before it can be priced.

## What the audit found

- **v1's matter was a pacing currency, not mass.** Each tier multiplied the price by ten, whatever the thing was. Real masses run from 100 kg to gigatonnes, so 28 projects are too heavy, many by a thousand to a million times. A starshade costs 5 Mt in v1. The Starshade Rendezvous design weighs 3.8 t.
- **On Earth, ground builds don't need matter in orbit.** Earth's economy moves about 106 Gt of materials a year (UNEP, 2024). Five v1 projects are ground builds: spectrographs, flash domes, radio arrays, neutrino tanks and fusion plants.
- **A few effects are far off.** The orbital solar array delivers 10 to 150 times more than its mass allows. One fusion plant project adds 14 TW, the output of about 36,000 first-generation plants. A ground data center's +25% compute takes 8 Years, while chip stock now grows about threefold a year.
- **Energy-hungry acts need real calculations.** The beacon's range, antimatter production, the deflector laser, the mind transmitter and the laser sail array. v1 had already flagged the star laser and radio ranges.
- **14 hold up.** The cold compute annex, the habitat ring, star lifting, chip swarms and the starting instruments are within a few times of real designs.

**Counts:** 14 OK, 28 Heavy, 1 Light, 1 Slow, 5 Ground, 25 Calc.

## What it means for pacing

If matter becomes real mass, most instruments and probes become nearly free in matter. Build time, compute, lift and propellant would limit them instead, and the big works stay expensive. That is the decision in open question 2.

## Project by project

### Know

| Project | Matter | Energy in 2040 | Physical reference | Verdict |
| --- | --- | --- | --- | --- |
| Transit watch | 0 |  | A PLATO-class space telescope, about 2 t. | OK |
| Spectrograph bank | 100 kt |  | Spectrographs on ground telescopes, tonnes each. | Ground |
| Deep flash watch | 100 kt |  | PANOSETI-style ground domes. | Ground |
| Deep-field receiver | 300 kt |  | An SKA-class ground array. | Ground |
| Planet survey | 0 |  | Existing telescopes and archives. | OK |
| Infrared telescope | 200 kt |  | LUVOIR-A, the largest studied, 28 to 37 t. JWST 6.2 t. | Heavy ×5,000 |
| Waste-heat survey | 0 |  | Existing telescopes and archives. | OK |
| Second infrared telescope | 3,000 kt |  | A LUVOIR-class twin, tens of tonnes. | Heavy ×100,000 |
| Starshade | 5,000 kt |  | Starshade Rendezvous design, 3.8 t at launch. | Heavy ×1,000,000 |
| Pulsar timing array | 0 |  | Ground radio telescopes. | OK |
| Neutrino watch | 6,000 kt |  | Hyper-Kamiokande holds 260 kt of water, underground. | Ground |
| Infrared interferometer | 40 Mt |  | A few LUVOIR-class mirrors flying in formation, about 100 t. | Heavy ×100,000 |
| Solar lens observatory | 40 Mt |  | NASA concept: small sailcraft, about 100 kg each. | Heavy ×100,000+ |
| Far-side array | 40 Mt |  | Depends on the antenna design. Thin wire antennas weigh little, steel dishes a great deal. | Calc |
| Kilometer interferometer | 800 Mt |  | A fleet of large mirrors, thousands of tonnes at most. | Heavy ×100,000+ |

### Grow

| Project | Matter | Energy in 2040 | Physical reference | Verdict |
| --- | --- | --- | --- | --- |
| Orbital solar array | 400 kt |  | Flown arrays 75 to 218 W/kg, target 1 kW/kg. +20% of 24 TW is 4.8 TW: 5 to 60 Mt. | Light ×10 to 150 |
| Belt prospecting | 0 |  | Small survey probes. | OK |
| Ground data center | 0 |  | Chip stock grows about 3× a year now. +25% takes months, not 8 Years. Energy is 0.25%, not 3%. | Slow ×10 |
| Second launch complex | 0 |  | Starship cadence growth. | OK |
| Cold compute annex | 300 kt |  | +25% compute is about 25 GW in orbit. Solar at 0.2 to 1 kW/kg is 25 to 125 kt, plus chips and radiators. Google Suncatcher is testing it. | OK |
| Belt mining | 0 |  | Unproven. A mining fleet weighs something, so zero matter is too light. | Calc |
| Orbital foundry | 6,000 kt |  | NASA 1980: a 100 t seed factory grows itself. | Heavy ×100+ |
| Mass driver | 4,000 kt |  | O'Neill: a 100 to 200 t driver throws 600 kt a year. | Heavy ×20,000 |
| Ice harvest | 3,000 kt |  | Earth's nearest ice at 9 AU is Saturn's rings and moons. | Calc |
| Fusion plant | 5,000 kt |  | The first ARC plant gives 400 MW. +60% of 24 TW is 14 TW, about 36,000 such plants, built on the ground. | Ground, effect ×35,000 too big |
| Habitat ring | 80 Mt |  | Stanford torus: 10 Mt, 95% of it shielding, for 10,000 people. | OK |
| Self-replicating factory | 60 Mt |  | NASA 1980: a 100 t seed copies itself in about a year. | Heavy ×600,000 |
| Solar swarm | 100 Mt |  | Collectors copy themselves, so the seed can be small. | Calc |
| Star lifting | 400 Mt | 1.2 EW | Lifting 300 Gt a year off the Sun takes about 2×10¹⁸ W against its gravity. | OK |

### Reach

| Project | Matter | Energy in 2040 | Physical reference | Verdict |
| --- | --- | --- | --- | --- |
| Tight-beam transmitter | 0 |  | Laser links like DSOC, scaled up. | OK |
| Broadcast beacon | 0 |  | Sending is 10% of energy, now 2.4 TW. Range needs a receiver calculation. | Calc |
| Launcher | 5,000 kt |  | Depends on what it launches. | Calc |
| Relay station | 3,000 kt |  | A repeater is tonnes, not megatonnes. | Heavy ×1,000+ |
| Flyby probe | 4,000 kt |  | Daedalus: 54 kt for 450 t to 0.12c. A one-tonne payload needs about 100 t. | Heavy ×100+ |
| Sentinel probe | 50 Mt |  | Daedalus-class out, magnetic-sail braking in. | Heavy ×1,000 |
| Lurker | 40 Mt |  | As sentinel. | Heavy ×1,000 |
| Close watcher | 30 Mt |  | As sentinel. | Heavy ×1,000 |
| Line tap | 20 Mt |  | As sentinel. | Heavy ×1,000 |
| Laser sail array | 40 Mt |  | Starshot: 100 GW for minutes per gram chip. Array mass depends on design. | Calc |
| Starlight sail | 10 Mt |  | Heller and Hippke: gram to kilogram sails. | Heavy ×1,000,000+ |
| Chip swarm | 0 |  | Starshot gram chips. | OK |
| Torch probe | 60 Mt |  | About 0.08c, then stops: a mass ratio near 120, so about 120 t per tonne of payload. | Heavy ×1,000+ |
| Seed probe | 60 Mt |  | About 0.04c, then stops, carrying a seed factory of about 100 t. | Heavy ×1,000 |
| Seedship | 70 Mt |  | A 100 t seed factory plus fuel for 0.04c and a stop. | Heavy ×100+ |
| Fusion torch ship | 800 Mt |  | A crewed or mind-carrying ship. Size is a design choice. | Calc |
| Antimatter probe | 200 Mt | 14.4 TW | Today 10⁹ joules in per joule of antimatter. Needs about 10⁻⁴ efficiency to fit, unproven. | Calc |
| Heavy impactor | 80 Mt |  | 1,000 t at 0.2c with Daedalus-class exhaust: about 0.4 Mt per bullet. v1 says 10 Mt. | Heavy ×25 per bullet |
| Decoys | 20 Mt |  | Each decoy must match the bullet's speed, so its fuel scales with its mass. | Calc |
| Pellet swarm | 10 Mt | 1.2 TW | Thousands of kilogram pellets weigh a few tonnes. Energy fits: 1.2 TW for 16 Years. | Heavy ×1,000 |
| Sleeper | 50 Mt |  | A lurker plus a few bullets. | Calc |
| Spoofer | 10 Mt |  | A lurker with a lamp. | Heavy ×1,000 |
| Far platform | 400 Mt |  | A weapons base far away. Size is a design choice. | Calc |
| Spotter | 20 Mt |  | A close watcher. | Heavy ×1,000 |
| Star laser | 2,000 Mt |  | A 100,000 km film covers about 8×10¹⁵ m². At 0.25 g/m² that is 2 Gt. | OK, physics still open |
| Mind transmitter | 0 | 7.2 TW | Depends on how many bits a mind is, and the link. | Calc |

### Endure

| Project | Matter | Energy in 2040 | Physical reference | Verdict |
| --- | --- | --- | --- | --- |
| Deep vault | 200 kt |  | A data center dug into rock, with local rock as shielding. | OK |
| Deep archive | 3,000 kt |  | Archives in fused silica store petabytes in grams. | Heavy ×1,000+ |
| Quiet radiators | 4,000 kt |  | Scales with the works it hides. | Calc |
| Early warning array | 40 Mt |  | A few telescopes watching nearby stars. | Heavy ×1,000+ |
| Dispersal outposts | 70 Mt |  | Copies of the civilization. Size is a design choice. | Calc |
| Comet deflection | 1,000 kt |  | DART weighed about 0.6 t at impact. A ready fleet is tens of tonnes. | Heavy ×10,000 |
| Decoy sites | 2,000 kt |  | Heaters drawing what they mimic: 5% of energy is now 1.2 TW. | Calc |
| Outskirts sweep | 0 |  | Telescopes and a few probes. | OK |
| Shielded works | 3,000 kt |  | About a centimeter of shielding over everything in orbit. | Calc |
| Pickets | 20 Mt |  | Small cold watchers, tonnes each. | Heavy ×1,000+ |
| Sand screens | 10 Mt |  | 10 t of sand per throw, plus depots. | Calc |
| Deflector laser | 50 Mt | 12.0 TW | 50% of energy is now 12 TW. | Calc |
| Hunters | 30 Mt |  | Fusion drones, tonnes to tens of tonnes each. | Heavy ×1,000 |
| Sunshade | 80 Mt |  | Scales with the area shaded. | Calc |
| Heat shields | 30 Mt |  | Scales with the area shielded. | Calc |
| Wandering habitats | 20 Mt |  | Scales with the habitats moved. | Calc |
| Shadow berths | 20 Mt |  | Parking orbits behind a moon cost fuel, not structure. | Calc |
| Lifeboats | 400 Mt |  | Several seedships kept fueled. | Calc |
| Dead hand | 400 Mt |  | Launchers at outposts. | Calc |
