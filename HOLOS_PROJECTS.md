# Holos: project catalog

October 1, 2026. A design catalog, generated from `explorations/home-mocks/catalog.py`. Edit the data there, then run `python3 explorations/home-mocks/build-zoom.py`.

**Projects are how you know, grow and reach**, and later how you endure. Every entry leads with its **why**: the benefit to the player, in plain words. Each one takes a share of every year’s energy and compute while it runs, draws matter from the stockpile once when it starts, and takes game time that passes as real time. Game time is written in words, like 18 Years; real time is written as a countdown, like `01:30:00`. One Year is `00:05:00`.

Everything here is hard science with speculative engineering. **Level** says how far each reaches: *grounded* is demonstrated or built from demonstrated parts; *plausible* is sound physics with unproven engineering at this scale; *speculative* is allowed by physics but far beyond anything built. **Emissions** are what the project adds to how easily others could find us: radio, heat, light and exhaust.

Science constraints and source links are in [the research baseline](HOLOS_GAME_CONCEPT.md#research-baseline-october-1-2026). Costs and durations are illustrative. Radio ranges and star laser performance still need physical validation.

## What every civilization starts with

Earth’s instruments and industry today, plus about a century. Every project below is an upgrade beyond this kit. The kit found the opening clues, and it catches strong knocks.

- **Sky watch** (Know): The whole sky in light and radio, always on. Catches strong knocks and broadcasts. *Whole-sky surveys such as Rubin and CHIME; PANOSETI is being built to catch nanosecond flashes.*
- **Space telescope** (Know): One large telescope for light and heat. *JWST today; the Habitable Worlds Observatory is planned for the 2040s.*
- **Star surveys** (Know): Known planets, candidates and survey limits around nearby stars. The three clues came from here. *Gaia, HARPS, TESS and PLATO.*
- **Radio array** (Know): A radio telescope as wide as a continent. *The Square Kilometre Array, under construction.*
- **Planetary grid** (Grow): All of each year’s energy, about 100 TW: the 100% every project shares. *Today’s grids, a century further on.*
- **Data centers** (Grow): Where the mind runs: all of each year’s compute, about 10²⁷ operations a second, on 10 TW of their own. *Today’s data centers, a century further on: chips about 100 times as efficient, drawing 200 times today’s 50 GW.*
- **Mines and heavy lift** (Grow): 1,240 kt of matter in orbit, and 40 kt more each year. *Reusable heavy lift, as Starship is being built to do.*
- **Laser links** (Reach): Messages across the home system in hours. *NASA’s DSOC laser link, tested from deep space in 2023.*
- **Precursor probes** (Reach): Two probes heading out. The farthest is 900 AU away. *Voyager 1 is about 170 AU out today.*

## How unlocks work

- **Building unlocks** follow fixed chains: you need the tools first. The foundry comes before anything large in space; a launcher before any probe.
- **Discovery projects** appear only when a result opens them, and target a specific star or planet. They are listed at the end.
- Locked projects stay visible with the reason: “Needs: orbital foundry.”
- **Energy and compute are yearly budgets;** neither can be stored at planetary scale, so a running project takes a share of every year’s supply, and pausing frees it. **Percentages are of the starting budgets:** 1% of energy is 1 TW, and 1% of compute is 10²⁵ operations a second. As capacity grows, the same project takes a smaller share. **Matter is a stockpile:** a project draws its matter once when it starts. Amounts are sample values, in kilotonnes (kt) and megatonnes (Mt).
- **Tiers are stages,** not clock times: from the planet, while matter is lifted off it; into space, once the foundry builds there; self-building industry, once factories copy themselves and matter compounds; and star-scale works.

## Know

Know: learn what is out there, and answer the clues.

### Tier 1 · from the planet

**Transit watch** · 4 Years · `00:20:00` · Grounded · emissions quiet

- **Why:** Your quickest real answer: is a dimming a pattern or a fluke?
- **What:** Stares at one star without a break, timing every dip the surveys catch only in passing.
- **Basis:** Continuous photometry, beyond the survey cadence of TESS and PLATO.
- **Uses:** energy 5% a year, compute 10% a year
- **Needs:** nothing
- **Can open:** Measure what’s crossing {star}

**Spectrograph bank** · 8 Years · `00:40:00` · Grounded · emissions quiet

- **Why:** Reads what anything is made of. Most other Know projects build on it.
- **What:** Ultra-stable spectrographs: they read gases, and feel small planets tug their stars.
- **Basis:** Past ESPRESSO’s 10 cm/s goal: an Earth tugs a Sun-like star by about 9 cm/s.
- **Uses:** energy 10% a year, compute 15% a year, 100 kt of matter at start
- **Needs:** nothing
- **Unlocks:** Planet survey, Study the air of {planet}, Study the oxygen world

**Deep flash watch** · 6 Years · `00:30:00` · Grounded · emissions quiet

- **Why:** Hears knocks too faint for the sky watch: quieter senders, or farther ones.
- **What:** Catches laser flashes a hundred times fainter than the sky watch can, anywhere in the sky.
- **Basis:** Optical SETI at scale, far beyond PANOSETI.
- **Uses:** energy 10% a year, compute 20% a year, 100 kt of matter at start
- **Needs:** nothing
- **Can open:** Watch {star} for flashes

**Deep-field receiver** · 12 Years · `01:00:00` · Plausible · emissions quiet

- **Why:** Find faint radio sources and listen for neighbors.
- **What:** A large radio array for deep surveys and targeted listening. Faint sources need follow-up to tell technology from nature.
- **Basis:** Broadband surveys with interferometric follow-up, as proposed by Garrett (2026). The 10 km² area and roughly 20 ly reach are provisional design targets. Sensitivity needs an emitted spectrum, receiver noise, bandwidth, integration time and detection threshold.
- **Uses:** energy 20% a year, compute 20% a year, 300 kt of matter at start
- **Needs:** nothing
- **Effect:** Finds radio candidates for targeted checks. Coverage and reach depend on the observing plan.
- **Unlocks:** Pulsar timing array, Far-side array, Early warning array, Outskirts sweep
- **Can open:** Survey the radio sky, Listen to {star}, Check the radio source at {star}

**Planet survey** · 14 Years · `01:10:00` · Grounded · emissions quiet

- **Why:** Shows which nearby stars have worlds worth studying, visiting or settling.
- **What:** Searches the 12 nearest stars for small planets, refining known orbits, candidates and exclusion limits.
- **Basis:** Precise radial velocity and astrometry, beyond today’s reach.
- **Uses:** energy 10% a year, compute 25% a year
- **Needs:** Spectrograph bank
- **Can open:** Study the air of {planet}, Survey the next 50 stars

**Infrared telescope** · 18 Years · `01:30:00` · Grounded · emissions quiet

- **Why:** Test what makes a warm glow: dust, companions, galaxies or machines.
- **What:** A cold telescope many times larger than the one we start with. Measures spectra and positions to test dust, companions, background galaxies and machines as the source of a glow.
- **Basis:** Cryogenic infrared telescopes, like JWST at far larger scale.
- **Uses:** energy 25% a year, compute 15% a year, 200 kt of matter at start
- **Needs:** nothing
- **Unlocks:** Waste-heat survey, Second infrared telescope, Starshade, Solar lens observatory, Outskirts sweep, Study the oxygen world
- **Can open:** Map the dust at {star}, Resolve the companions of {star}, Listen to {star}

### Tier 2 · into space

**Waste-heat survey** · 16 Years · `01:20:00` · Grounded · emissions quiet

- **Why:** Checks every nearby star at once for signs of big engineering.
- **What:** Searches nearby stars for unusual heat. Each candidate needs checks for dust, companions and unrelated background sources.
- **Basis:** Infrared surveys using WISE, with source confusion illustrated by JWST follow-up of Hephaistos candidates D and E in 2026.
- **Uses:** energy 15% a year, compute 25% a year
- **Needs:** Infrared telescope
- **Unlocks:** Early warning array
- **Can open:** Listen to {star}

**Second infrared telescope** · 14 Years · `01:10:00` · Grounded · emissions quiet

- **Why:** Doubles your infrared view and sets up the interferometer.
- **What:** A twin of the first, placed far away. Adds coverage and repeat positions to test whether a glow moves with its star. Later, the interferometer combines their light.
- **Basis:** Interferometry needs at least two separated collectors.
- **Uses:** energy 20% a year, compute 10% a year, 3,000 kt of matter at start
- **Needs:** Infrared telescope + Orbital foundry
- **Unlocks:** Infrared interferometer

**Starshade** · 20 Years · `01:40:00` · Plausible · emissions quiet

- **Why:** See the planets themselves, not just their stars.
- **What:** A flower-shaped screen that blocks a star so its planets show.
- **Basis:** Starshade designs studied by NASA, flown thousands of kilometers from a telescope.
- **Uses:** energy 20% a year, compute 15% a year, 5,000 kt of matter at start
- **Needs:** Infrared telescope + Orbital foundry
- **Can open:** Image {planet}

**Pulsar timing array** · 20 Years · `01:40:00` · Grounded · emissions quiet

- **Why:** Your probes can find their way between stars.
- **What:** Uses dead stars that tick like clocks to sense gravitational waves and navigate.
- **Basis:** Pulsar timing arrays such as NANOGrav.
- **Uses:** energy 10% a year, compute 30% a year
- **Needs:** Deep-field receiver
- **Effect:** Probes can navigate between stars.
- **Unlocks:** Flyby probe

**Neutrino watch** · 24 Years · `02:00:00` · Grounded · emissions quiet

- **Why:** Warns of a nearby supernova hours before its light arrives.
- **What:** Detects neutrinos. Sees into star cores and warns of nearby supernovae.
- **Basis:** Large neutrino detectors such as JUNO. Reactors light-years away are far too faint to detect.
- **Uses:** energy 15% a year, compute 15% a year, 6,000 kt of matter at start
- **Needs:** nothing

### Tier 3 · self-building industry

**Infrared interferometer** · 40 Years · `03:20:00` · Plausible · emissions quiet

- **Why:** Sharp enough to pick out planets and measure them one by one.
- **What:** Links the telescopes to separate blended sources and measure where a glow sits. Tests background galaxies and companions before attributing excess heat to machines.
- **Basis:** Space interferometer concepts such as LIFE.
- **Uses:** energy 25% a year, compute 30% a year, 40 Mt of matter at start
- **Needs:** Second infrared telescope
- **Unlocks:** Kilometer interferometer
- **Can open:** Image {planet}

**Solar lens observatory** · 70 Years · `05:50:00` · Plausible · emissions quiet

- **Why:** The sharpest view you can get of one chosen world.
- **What:** Flies a telescope to where our star bends light like a lens. Sees one planet in detail.
- **Basis:** Gravitational lensing by a star; the focal line begins beyond about 550 AU for a Sun-like star (Turyshev and colleagues). It cannot hear a world’s hum: the corona defocuses anything below about 120 GHz (Hippke 2017).
- **Uses:** energy 30% a year, compute 25% a year, 40 Mt of matter at start
- **Needs:** Infrared telescope + Launcher
- **Effect:** One target at a time; retargeting takes decades.
- **Can open:** Image {planet}

**Far-side array** · 30 Years · `02:30:00` · Plausible · emissions quiet

- **Why:** Investigate fainter radio sources farther from home.
- **What:** A thousand square kilometers of radio dishes on a moon’s far side. Extends surveys and targeted listening with less interference from home.
- **Basis:** Large collecting area at a radio-quiet site. The roughly 200 ly reach is a provisional target, not a validated sensitivity. Frequency, noise, integration time and the source spectrum still matter.
- **Uses:** energy 20% a year, compute 40% a year, 40 Mt of matter at start
- **Needs:** Deep-field receiver + Self-replicating factory
- **Effect:** Aims to investigate faint radio sources across the region. A detection still needs source checks.
- **Can open:** Survey the radio sky, Listen to {star}, Check the radio source at {star}

### Tier 4 · star-scale works

**Kilometer interferometer** · 40 Years · `03:20:00` · Speculative · emissions quiet

- **Why:** Maps of other planets’ surfaces, from home.
- **What:** A fleet of mirrors spread across kilometers: surface maps of nearby planets.
- **Basis:** Large-baseline optical interferometry, scaled far beyond today.
- **Uses:** energy 35% a year, compute 35% a year, 800 Mt of matter at start
- **Needs:** Infrared interferometer + Self-replicating factory
- **Unlocks:** Star laser

## Grow

Grow: more energy, matter and compute every year, so everything goes faster.

### Tier 1 · from the planet

**Orbital solar array** · 10 Years · `00:50:00` · Grounded · emissions noticeable

- **Why:** More energy every year, so more projects can run at once.
- **What:** Collectors in orbit that beam power down.
- **Basis:** Space solar power, demonstrated in orbit by Caltech in 2023.
- **Uses:** compute 5% a year, 400 kt of matter at start
- **Needs:** nothing
- **Effect:** +20% energy every year.

**Belt prospecting** · 6 Years · `00:30:00` · Grounded · emissions quiet

- **Why:** Shows where the metal is. Needed before mining.
- **What:** Finds which belt rocks are worth mining.
- **Basis:** Asteroid spectroscopy and sample return, as with OSIRIS-REx and Hayabusa2.
- **Uses:** energy 10% a year, compute 10% a year
- **Needs:** nothing
- **Unlocks:** Belt mining

**Cold compute annex** · 12 Years · `01:00:00` · Plausible · emissions quiet

- **Why:** More compute every year: faster answers, smarter probes.
- **What:** Computers cooled in a planet’s shadow waste less energy per thought.
- **Basis:** Cooler circuits approach the Landauer limit; reversible computing is unproven at scale.
- **Uses:** energy 15% a year, 300 kt of matter at start
- **Needs:** nothing
- **Effect:** +25% compute every year.
- **Unlocks:** Self-replicating factory, Mind transmitter, Quiet radiators

**Belt mining** · 20 Years · `01:40:00` · Plausible · emissions quiet

- **Why:** More matter every year, for building bigger things.
- **What:** Metals from the belt, hauled to Veyra’s orbit.
- **Basis:** Asteroid mining; no one has done it yet, but every step is known.
- **Uses:** energy 20% a year, compute 10% a year
- **Needs:** Belt prospecting
- **Effect:** +120 kt of matter every year.
- **Unlocks:** Orbital foundry, Mass driver

### Tier 2 · into space

**Orbital foundry** · 30 Years · `02:30:00` · Plausible · emissions noticeable

- **Why:** Unlocks everything too big to launch from Veyra: probes, ships, big telescopes.
- **What:** Builds large things in space instead of lifting them off Veyra.
- **Basis:** In-space manufacturing, from today’s orbital 3D printers upward.
- **Uses:** energy 25% a year, compute 10% a year, 6,000 kt of matter at start
- **Needs:** Belt mining
- **Effect:** Unlocks large works.
- **Unlocks:** Second infrared telescope, Starshade, Ice harvest, Habitat ring, Self-replicating factory, Launcher, Laser sail array, Fusion torch ship, Decoy sites, Shielded works, Hunters, Sunshade, Heat shields

**Mass driver** · 24 Years · `02:00:00` · Plausible · emissions quiet

- **Why:** Much more matter every year, without lifting it off Veyra.
- **What:** An electric track that throws cargo off a moon without rockets.
- **Basis:** Electromagnetic launch, as proposed by Gerard O’Neill; his lunar studies planned hundreds of thousands of tonnes a year.
- **Uses:** energy 20% a year, compute 5% a year, 4,000 kt of matter at start
- **Needs:** Belt mining
- **Effect:** +300 kt of matter every year, from a moon instead of the planet’s gravity well.
- **Unlocks:** Habitat ring, Solar swarm, Sand screens

**Ice harvest** · 36 Years · `03:00:00` · Plausible · emissions quiet

- **Why:** Water and fusion fuel. Needed for fusion power.
- **What:** Water and fuel from the ice world at 9 AU.
- **Basis:** Volatiles mining from outer-system ices; deuterium is fusion fuel.
- **Uses:** energy 20% a year, compute 10% a year, 3,000 kt of matter at start
- **Needs:** Orbital foundry
- **Effect:** +60 kt of ice every year; supplies fusion fuel.
- **Unlocks:** Fusion plant

**Fusion plant** · 40 Years · `03:20:00` · Plausible · emissions noticeable

- **Why:** A big jump in energy every year.
- **What:** Power from fusing light atoms. A large step up in energy.
- **Basis:** Deuterium fusion is physically sound; sustained net power is not yet demonstrated.
- **Uses:** compute 20% a year, 5,000 kt of matter at start
- **Needs:** Ice harvest
- **Effect:** +60% energy every year.
- **Unlocks:** Laser sail array, Torch probe, Fusion torch ship, Hunters

### Tier 3 · self-building industry

**Habitat ring** · 60 Years · `05:00:00` · Plausible · emissions noticeable

- **Why:** A second home in orbit: more compute, and a backup if Veyra is hit.
- **What:** A spinning ring in orbit: room for more minds and machines.
- **Basis:** Rotating habitats, as designed in NASA’s 1975 Stanford torus study.
- **Uses:** energy 20% a year, compute 10% a year, 80 Mt of matter at start
- **Needs:** Orbital foundry + Mass driver
- **Effect:** +30% compute; a second home in orbit.
- **Unlocks:** Dispersal outposts, Wandering habitats, Shadow berths

**Self-replicating factory** · 80 Years · `06:40:00` · Speculative · emissions noticeable

- **Why:** Industry that builds itself: matter stops being scarce.
- **What:** Factories that build copies of themselves from belt rock.
- **Basis:** Von Neumann’s self-reproducing machines; no working example exists. NASA’s 1980 study assumed a lunar factory could copy itself in about a year.
- **Uses:** energy 30% a year, compute 30% a year, 60 Mt of matter at start
- **Needs:** Orbital foundry + Cold compute annex
- **Effect:** Matter income doubles about every Year, as fast as physics allows, unless you slow it. Each doubling adds heat others can see.
- **Unlocks:** Far-side array, Kilometer interferometer, Solar swarm, Seed probe, Seedship, Star laser

**Solar swarm** · 30 Years · `02:30:00` · Speculative · emissions loud

- **Why:** Energy up to a whole star’s output, but everyone nearby can see you.
- **What:** Surrounds the star with collectors: enormous energy, and a heat glow others can see.
- **Basis:** A Dyson swarm. A full one takes about Mercury’s mass; Armstrong and Sandberg found self-copying industry could build it in decades. Its infrared excess is what searches like Ĝ look for.
- **Uses:** energy 20% a year, compute 20% a year, 100 Mt of matter at start
- **Needs:** Self-replicating factory + Mass driver
- **Effect:** Energy doubles about every Year as collectors copy themselves, up to the whole star: about four trillion times the starting grid for a Sun-like star. Compute can grow with it. Each doubling doubles the glow.
- **Unlocks:** Star lifting, Antimatter probe

### Tier 4 · star-scale works

**Star lifting** · 40 Years · `03:20:00` · Speculative · emissions loud

- **Why:** The biggest mine there is: the star itself. Very visible.
- **What:** Pulls gas off the star itself for fuel and raw material.
- **Basis:** Star lifting, proposed by David Criswell. Physics allows it; the scale is vast.
- **Uses:** energy 40% a year, compute 30% a year, 400 Mt of matter at start
- **Needs:** Solar swarm
- **Effect:** The star becomes the mine: it holds more matter than every planet around it combined.

## Reach

Reach: touch other stars. Messages, probes, ships, and strikes.

### Tier 1 · from the planet

**Tight-beam transmitter** · 6 Years · `00:30:00` · Grounded · emissions quiet

- **Why:** Talk to one known star without the whole sky hearing.
- **What:** Sends a private laser message to one known star.
- **Basis:** Scales up deep-space laser links like NASA’s DSOC to reach other stars.
- **Uses:** energy 15% a year, compute 5% a year
- **Needs:** nothing
- **Effect:** Only the target can read it. It still tells them we exist.
- **Can open:** Reply to {sender}, Tell {recipient} where {civilization} is, Share a key with {civilization}

**Broadcast beacon** · 4 Years · `00:20:00` · Grounded · emissions loud

- **Why:** Everyone in range learns you exist: friends and threats alike.
- **What:** Announces us to every star in range, permanently.
- **Basis:** A powerful radio beacon, like the 1974 Arecibo message but sustained.
- **Uses:** energy 20% a year
- **Needs:** nothing
- **Effect:** Everyone who can hear, will. It cannot be taken back.
- **Unlocks:** Tell {recipient} where {civilization} is

### Tier 2 · into space

**Launcher** · 24 Years · `02:00:00` · Plausible · emissions noticeable

- **Why:** Required to send anything to another star.
- **What:** A launch rail and fuel depot that sends probes out of the system.
- **Basis:** Staged launch from orbit, built on the foundry.
- **Uses:** energy 25% a year, compute 10% a year, 5,000 kt of matter at start
- **Needs:** Orbital foundry
- **Unlocks:** Solar lens observatory, Relay station, Flyby probe, Torch probe, Seedship, Antimatter probe, Pickets
- **Can open:** Send a probe to {star}

**Relay station** · 20 Years · `01:40:00` · Plausible · emissions quiet

- **Why:** Your messages and probe reports reach farther, and arrive clearer.
- **What:** A repeater far from the star that carries messages farther.
- **Basis:** Relays reduce losses over distance; the Sun’s lens can also amplify signals.
- **Uses:** energy 15% a year, compute 10% a year, 3,000 kt of matter at start
- **Needs:** Launcher
- **Unlocks:** Mind transmitter

**Flyby probe** · 12 Years · `01:00:00` · Plausible · emissions noticeable

- **Why:** See a star up close, soonest. The only way to be sure what is there.
- **What:** Flies past a star at a tenth of light speed, looks the whole way in, and beams home what it saw. Can’t stop.
- **Basis:** Fusion or sail-driven flyby probes: 10 years per light-year.
- **Uses:** energy 20% a year, compute 15% a year, 4,000 kt of matter at start
- **Needs:** Launcher + Pulsar timing array
- **Effect:** One look, in passing.
- **Unlocks:** Sentinel probe, Send a probe to {star}
- **Can open:** Strike {target}

### Tier 3 · self-building industry

**Sentinel probe** · 20 Years · `01:40:00` · Plausible · emissions noticeable

- **Why:** A permanent watcher at a star you care about.
- **What:** Brakes with a magnetic sail against interstellar gas, then orbits its star and watches for decades.
- **Basis:** Magnetic sail braking, as proposed by Robert Zubrin and Dana Andrews: about 20 years per light-year.
- **Uses:** energy 25% a year, compute 20% a year, 50 Mt of matter at start
- **Needs:** Flyby probe
- **Effect:** Stops and stays. Its braking may show.
- **Unlocks:** Lurker, Seed probe, Share a key with {civilization}

**Lurker** · 20 Years · `01:40:00` · Plausible · emissions quiet

- **Why:** Watch a star without being noticed.
- **What:** Brakes like a sentinel, but stops in a system’s cold outskirts and watches from there.
- **Basis:** Magnetic sail braking; parks among comets or distant companions.
- **Uses:** energy 20% a year, compute 15% a year, 40 Mt of matter at start
- **Needs:** Sentinel probe
- **Effect:** Nearly invisible. Sees less, from farther.
- **Unlocks:** Close watcher, Line tap, Sleeper, Spoofer
- **Can open:** Nudge a rock toward {planet}

**Close watcher** · 16 Years · `01:20:00` · Plausible · emissions quiet

- **Why:** See what telescopes can’t: vaults, weapons, and which sites are fake.
- **What:** Moves in from the outskirts to find vaults, count weapons, and tell decoys from real sites.
- **Basis:** A working probe is warm among frozen comets, and shows from about 0.2 AU. The closer it goes, the likelier it is found.
- **Uses:** energy 15% a year, compute 15% a year, 30 Mt of matter at start
- **Needs:** Lurker
- **Effect:** Its reports are light-time old, and its report beam points home.
- **Unlocks:** Spotter

**Line tap** · 12 Years · `01:00:00` · Plausible · emissions quiet

- **Why:** Hear what a rival says to someone else.
- **What:** Sits inside someone’s message beam, where it starts or where it lands, and copies what passes.
- **Basis:** A 10 m transmitter’s beam is still about 40,000 km wide at 1,000 AU.
- **Uses:** energy 10% a year, compute 15% a year, 20 Mt of matter at start
- **Needs:** Lurker
- **Effect:** Reads everything until the line has a key it lacks. Then only who, when and how much.

**Laser sail array** · 60 Years · `05:00:00` · Speculative · emissions loud

- **Why:** Opens the fastest probes, but the beam can be seen.
- **What:** A huge laser that pushes light sails to a fifth of light speed.
- **Basis:** Beamed sail propulsion, as in Breakthrough Starshot.
- **Uses:** energy 50% a year, compute 15% a year, 40 Mt of matter at start
- **Needs:** Fusion plant + Orbital foundry
- **Effect:** Pushes chip swarms and starlight sails. The beam shines past them, toward their target.
- **Unlocks:** Starlight sail, Chip swarm, Pellet swarm, Star laser, Deflector laser
- **Can open:** Feint toward {star}

**Starlight sail** · 10 Years · `00:50:00` · Speculative · emissions quiet

- **Why:** Stop at a bright star, quietly, for almost nothing.
- **What:** A light sail that brakes on its target star’s light and gravity, then stays.
- **Basis:** Photogravitational braking, as modeled by René Heller and Michael Hippke: about 22 years per light-year.
- **Uses:** energy 10% a year, compute 10% a year, 10 Mt of matter at start
- **Needs:** Laser sail array
- **Effect:** Stops only at bright stars. Nearly invisible.

**Chip swarm** · 4 Years · `00:20:00` · Speculative · emissions loud

- **Why:** The fastest look, at many stars at once.
- **What:** Thousands of gram-sized sails, pushed by the laser array to a fifth of light speed.
- **Basis:** Breakthrough Starshot’s gram-scale sails.
- **Uses:** energy 30% a year, compute 10% a year
- **Needs:** Laser sail array
- **Effect:** 5 years per light-year. Can’t stop. The launch beam is visible.

**Torch probe** · 24 Years · `02:00:00` · Speculative · emissions loud

- **Why:** Get there fast, and stay.
- **What:** Carries fusion fuel to brake hard: it arrives fast, and stops.
- **Basis:** Fusion rocket designs such as Project Daedalus and Icarus, with fuel kept for braking.
- **Uses:** energy 30% a year, compute 20% a year, 60 Mt of matter at start
- **Needs:** Fusion plant + Launcher
- **Effect:** About 12 years per light-year. Its exhaust shows for years.
- **Unlocks:** Heavy impactor, Sleeper

**Seed probe** · 30 Years · `02:30:00` · Speculative · emissions noticeable

- **Why:** Turn one probe into a foothold.
- **What:** Stops, mines the target’s asteroids, and builds instruments or more probes there.
- **Basis:** Self-replicating seed probes, as studied by Robert Freitas.
- **Uses:** energy 25% a year, compute 25% a year, 60 Mt of matter at start
- **Needs:** Sentinel probe + Self-replicating factory
- **Effect:** About 25 years per light-year. Its industry warms up.

**Seedship** · 50 Years · `04:10:00` · Speculative · emissions noticeable

- **Why:** Start an outpost at another star that grows on its own.
- **What:** Carries a factory and a copy of our designs to found an outpost.
- **Basis:** Self-replicating seed probes, as studied by Robert Freitas.
- **Uses:** energy 30% a year, compute 25% a year, 70 Mt of matter at start
- **Needs:** Launcher + Self-replicating factory
- **Effect:** Founds a colony that acts on its own.
- **Unlocks:** Far platform, Lifeboats

**Heavy impactor** · 30 Years · `02:30:00` · Speculative · emissions loud

- **Why:** A weapon that can end a planet.
- **What:** A thousand tonnes of solid metal, thrown by a fusion torch that also steers it onto the planet in the last hours. No warhead: its speed is the weapon.
- **Basis:** Kinetic energy: at a fifth of light speed, each kilogram carries about 400 kilotons.
- **Uses:** energy 30% a year, compute 15% a year, 80 Mt of matter at start
- **Needs:** Torch probe
- **Effect:** A fifth of light speed hits a planet like a 2 km asteroid. An antimatter rocket is modeled at half. Star-laser payload speeds remain unvalidated.
- **Unlocks:** Decoys, Spotter, Dead hand
- **Can open:** Strike {target}, Test-fire at {moon}

**Decoys** · 10 Years · `00:50:00` · Plausible · emissions quiet

- **Why:** Make every defense guess which bullet matters.
- **What:** Hollow twins that fly with a real impactor. Pickets cannot tell which one is heavy.
- **Basis:** In flight, shape and speed show; mass does not. Decoys are an old answer to missile defense.
- **Uses:** energy 10% a year, compute 10% a year, 20 Mt of matter at start
- **Needs:** Heavy impactor
- **Effect:** Wastes a deflector laser’s shots. Cheap sand still screens them all.

**Pellet swarm** · 16 Years · `01:20:00` · Speculative · emissions loud

- **Why:** Strip a system’s orbit where screens cannot help.
- **What:** Thousands of kilogram pellets pushed by the laser array to a fifth of light speed.
- **Basis:** Breakthrough Starshot’s sails, scaled from grams to kilograms.
- **Uses:** energy 40% a year, compute 10% a year, 10 Mt of matter at start
- **Needs:** Laser sail array
- **Effect:** Screens cannot stop it. Strips a planet’s orbit; the air shields the ground.
- **Unlocks:** Strike {target}

**Sleeper** · 24 Years · `02:00:00` · Speculative · emissions quiet

- **Why:** A gun already inside their system.
- **What:** A lurker carrying its own impactors, waiting in another system’s outskirts.
- **Basis:** Magnetic sail braking to park, then a fusion stage to fire from close range.
- **Uses:** energy 25% a year, compute 20% a year, 50 Mt of matter at start
- **Needs:** Lurker + Torch probe
- **Effect:** At a tenth of light speed from 1,000 AU: 52 days of warning, 43 real seconds. Its shot points at the sleeper.
- **Unlocks:** Strike {target}

**Spoofer** · 12 Years · `01:00:00` · Plausible · emissions quiet

- **Why:** Make a rival flinch, and watch what it does.
- **What:** A lurker near a target’s pickets that fakes a bullet’s glow, to make the target react.
- **Basis:** A faint moving light. A real bullet crosses picket after picket on one straight line; a fake glows beside it.
- **Uses:** energy 10% a year, compute 10% a year, 10 Mt of matter at start
- **Needs:** Lurker
- **Effect:** Works on the unprepared. Once caught, the fake shows where the lurker is.

**Spotter** · 16 Years · `01:20:00` · Speculative · emissions quiet

- **Why:** Hit what moves, and skip what’s fake.
- **What:** A close watcher that guides an incoming strike with live positions.
- **Basis:** The strike’s steering stage takes the spotter’s fixes in its last hours.
- **Uses:** energy 15% a year, compute 20% a year, 20 Mt of matter at start
- **Needs:** Close watcher + Heavy impactor
- **Effect:** Beats wandering habitats and decoy sites.

### Tier 4 · star-scale works

**Fusion torch ship** · 90 Years · `07:30:00` · Speculative · emissions loud

- **Why:** Moves large things between stars. Its exhaust shows for decades.
- **What:** A large ship with a fusion drive, around a tenth of light speed.
- **Basis:** Fusion rocket designs such as Project Daedalus and Icarus.
- **Uses:** energy 40% a year, compute 20% a year, 800 Mt of matter at start
- **Needs:** Fusion plant + Orbital foundry
- **Effect:** Its exhaust can be seen for decades.

**Antimatter probe** · 40 Years · `03:20:00` · Speculative · emissions loud

- **Why:** The fastest way to arrive, and stop.
- **What:** The most efficient engine physics allows: fast out, and a hard stop.
- **Basis:** Antimatter rockets. Making the fuel takes a large share of a star’s output.
- **Uses:** energy 60% a year, compute 20% a year, 200 Mt of matter at start
- **Needs:** Solar swarm + Launcher
- **Effect:** About 5 years per light-year, and it stops. Its exhaust gives off gamma rays.

**Far platform** · 80 Years · `06:40:00` · Speculative · emissions noticeable

- **Why:** Strike without your name on it.
- **What:** A weapons base founded somewhere empty, so its shots point there instead of home.
- **Basis:** A seedship colony chartered to build launchers. Pickets that time a bullet can work out its launch distance.
- **Uses:** energy 30% a year, compute 30% a year, 400 Mt of matter at start
- **Needs:** Seedship
- **Effect:** Can frame a third civilization. It has its own mind: it may refuse, or strike on its own.

**Star laser** · 50 Years · `04:10:00` · Speculative · emissions quiet

- **Why:** The only weapon that arrives with no warning.
- **What:** A sheet of film 100,000 km wide beside our star turns sunlight into laser light, every patch in step: one lens.
- **Basis:** Coherent beamed energy, far beyond demonstrated engineering. Aperture alone does not set performance. Power, wavelength, losses, phasing, pointing, sail heating and relativistic thrust need a joint calculation.
- **Uses:** energy 30% a year, compute 40% a year, 2,000 Mt of matter at start
- **Needs:** Self-replicating factory + Laser sail array + Kilometer interferometer
- **Effect:** Beam arrives with its own light. Sweep and needle are intended modes. Damage, payload, acceleration time and firing costs remain unvalidated. Firing consumes collected stellar power and produces waste heat.
- **Can open:** Paint {star}

**Mind transmitter** · 60 Years · `05:00:00` · Speculative · emissions noticeable

- **Why:** Move yourself to a colony, at the speed of light.
- **What:** Sends the mind itself as a signal to one of our colonies.
- **Basis:** A laser link with very high data rates; copying a mind is speculative.
- **Uses:** energy 30% a year, compute 40% a year
- **Needs:** Relay station + Cold compute annex
- **Effect:** The player travels at light speed and cannot act in transit.

## Endure

Endure: keep existing. Spread out, remember, stay quiet, see danger coming, and stop it.

### Tier 1 · from the planet

**Deep vault** · 10 Years · `00:50:00` · Plausible · emissions quiet

- **Why:** Your first hedge: the mind survives a hit on Veyra.
- **What:** A copy of the mind kilometers deep in a moon or large asteroid, kept in step with home by laser link.
- **Basis:** Heat soaks only tens of meters into rock in a decade. A heavy impactor can shatter a rock 100 km across; a moon shrugs it off.
- **Uses:** energy 10% a year, compute 15% a year, 200 kt of matter at start
- **Needs:** nothing
- **Effect:** Running, it takes over at once and takes 10% compute a year, but its heat and link can be found. Sleeping, it is cold, hidden and free, and wakes when home goes silent. A needle reaches it only if its place is known.

### Tier 2 · into space

**Deep archive** · 20 Years · `01:40:00` · Grounded · emissions quiet

- **Why:** If disaster strikes, what you know survives.
- **What:** Stores everything we know in durable form, somewhere safe.
- **Basis:** Long-lived storage such as 5D glass data crystals.
- **Uses:** energy 10% a year, compute 15% a year, 3,000 kt of matter at start
- **Needs:** nothing
- **Unlocks:** Dispersal outposts

**Quiet radiators** · 30 Years · `02:30:00` · Plausible · emissions quiet

- **Why:** Makes you harder to find.
- **What:** Points our waste heat away from watchers.
- **Basis:** Directional radiators; heat must still go somewhere.
- **Uses:** energy 20% a year, compute 10% a year, 4,000 kt of matter at start
- **Needs:** Cold compute annex
- **Effect:** Lowers how visible our works are.

**Comet deflection** · 8 Years · `00:40:00` · Grounded · emissions quiet

- **Why:** No rock, natural or nudged, lands on you.
- **What:** Keeps interceptors ready to push any rock on a collision course off it, years ahead.
- **Basis:** NASA’s DART, which shortened an asteroid moon’s orbit by 32 minutes in 2022.
- **Uses:** energy 10% a year, compute 10% a year, 1,000 kt of matter at start
- **Needs:** nothing
- **Effect:** A few centimeters per second, a decade early, turns a hit into a miss.

**Decoy sites** · 12 Years · `01:00:00` · Plausible · emissions noticeable

- **Why:** Make attackers waste their shots.
- **What:** Heaters on empty rocks that look like our works from light-years away.
- **Basis:** Faking a site’s heat takes as much energy as the site gives off, so decoys pair with quiet radiators on the real sites. Real works change, so decoys must be run like theater.
- **Uses:** energy 25% a year, compute 5% a year, 2,000 kt of matter at start
- **Needs:** Orbital foundry
- **Effect:** Each costs an attacker a bullet; a needle can hit them all; a close watcher sees through them. While lit, each takes 5% energy a year. Pausing frees it.

**Outskirts sweep** · 16 Years · `01:20:00` · Plausible · emissions quiet

- **Why:** Find out whether anyone is watching from your own dark.
- **What:** Searches our own outer system for hidden visitors. It usually finds nothing.
- **Basis:** A working lurker is warm among frozen comets, but shows only from about 0.2 AU. So the sweep watches for arrivals and acts.
- **Uses:** energy 10% a year, compute 20% a year
- **Needs:** Infrared telescope + Deep-field receiver
- **Effect:** Catches spoofers and sleepers when they act. A find is a first contact.

**Shielded works** · 10 Years · `00:50:00` · Grounded · emissions quiet

- **Why:** A stopped strike costs you nothing in orbit.
- **What:** Radiation shielding for everything in orbit.
- **Basis:** Spacecraft shielding: fast particles and X-rays stop in a centimeter of material.
- **Uses:** energy 5% a year, compute 5% a year, 3,000 kt of matter at start
- **Needs:** Orbital foundry
- **Effect:** Orbit shrugs off the spray from a stopped strike. Near-light sprays need meters of rock.

### Tier 3 · self-building industry

**Early warning array** · 40 Years · `03:20:00` · Plausible · emissions quiet

- **Why:** See laser launches toward you, and who is building weapons.
- **What:** Watches nearby stars for the launches that shine toward us, and for weapon works.
- **Basis:** A torch sent at us points its exhaust away, so it stays dark. A laser that pushes a sail shines on past it toward the target, and weapon industry glows.
- **Uses:** energy 20% a year, compute 25% a year, 40 Mt of matter at start
- **Needs:** Waste-heat survey + Deep-field receiver
- **Effect:** A laser launch from 10 ly at a fifth of light speed gives decades of warning. Torch launches stay dark: only pickets see those.
- **Unlocks:** Pickets

**Dispersal outposts** · 70 Years · `05:50:00` · Plausible · emissions noticeable

- **Why:** One strike can no longer end you.
- **What:** Copies of the civilization on moons and rocks across the system.
- **Basis:** Screens can fail and some strikes come unseen; being in many places is the backstop.
- **Uses:** energy 25% a year, compute 25% a year, 70 Mt of matter at start
- **Needs:** Habitat ring + Deep archive
- **Unlocks:** Dead hand

**Pickets** · 30 Years · `02:30:00` · Speculative · emissions quiet

- **Why:** Know a bullet’s exact path, days before it arrives.
- **What:** Small cold watchers in a line out to 2,000 AU, toward one feared neighbor. The first line comes with it.
- **Basis:** A dark bullet still glows faintly where interstellar gas strikes its nose. Two fixes, far apart, give its exact path.
- **Uses:** energy 15% a year, compute 20% a year, 20 Mt of matter at start
- **Needs:** Launcher + Early warning array
- **Effect:** One line guards one planet against one direction. At a fifth of light speed: 23 days of warning, 19 real seconds.
- **Unlocks:** Sand screens, Deflector laser
- **Can open:** Guard {planet} against {star}

**Sand screens** · 12 Years · `01:00:00` · Plausible · emissions quiet

- **Why:** Stop a planet-killer with a few tonnes of sand.
- **What:** Depots of sand that throw 10 tonnes into a bullet’s exact path, 10 million km out.
- **Basis:** At a fifth of light speed a gram of sand hits like 400 tonnes of TNT, so any contact shatters it.
- **Uses:** energy 10% a year, compute 15% a year, 10 Mt of matter at start
- **Needs:** Mass driver + Pickets
- **Effect:** The spray spreads past 100,000 km; under 1% hits the planet. Pellets slip through.

**Deflector laser** · 40 Years · `03:20:00` · Speculative · emissions loud

- **Why:** Push a bullet aside at the speed of light.
- **What:** Burns a bullet’s skin so the escaping vapor pushes it off course.
- **Basis:** Laser ablation. Tens of terawatts on target, focused by a mirror kilometers wide.
- **Uses:** energy 50% a year, compute 20% a year, 50 Mt of matter at start
- **Needs:** Laser sail array + Pickets
- **Effect:** Beats a bullet that dodges. Firing lights the line back to the attacker.

**Hunters** · 16 Years · `01:20:00` · Plausible · emissions noticeable

- **Why:** Kill what hides in your own system.
- **What:** Fusion drones that chase intruders in our own system, to ram them or take them intact.
- **Basis:** A tonne at 100 km/s hits like a kiloton.
- **Uses:** energy 20% a year, compute 20% a year, 30 Mt of matter at start
- **Needs:** Fusion plant + Orbital foundry
- **Effect:** A captured spy shows its home, orders and designs, unless it destroys itself first. Posture: hunt on sight, watch, or hold fire.

**Sunshade** · 30 Years · `02:30:00` · Plausible · emissions noticeable

- **Why:** Take a star laser’s beam before it reaches you.
- **What:** Heavy shades over the sites that matter, on the line toward a star laser.
- **Basis:** Shades at L1 have been studied for cooling Earth, by Roger Angel. The beam pushes a shade off station: one over a whole planet lasts about a week, a heavy one over a site a couple of months.
- **Uses:** energy 15% a year, compute 10% a year, 80 Mt of matter at start
- **Needs:** Orbital foundry
- **Effect:** Holds off the sweep for a while; the needle burns through. Too thin to stop a bullet. A shade shows watchers which sites matter.

**Heat shields** · 14 Years · `01:10:00` · Grounded · emissions quiet

- **Why:** Your orbit survives a star laser’s sweep.
- **What:** Reflective shields for works in orbit.
- **Basis:** Parker Solar Probe’s shield takes about 475 times Earth’s sunlight.
- **Uses:** energy 10% a year, compute 5% a year, 30 Mt of matter at start
- **Needs:** Orbital foundry
- **Effect:** Works in orbit survive a star laser’s sweep. Not the needle.

**Wandering habitats** · 20 Years · `01:40:00` · Plausible · emissions quiet

- **Why:** Homes that nobody can aim at from light-years away.
- **What:** Habitats that make small random burns, so where they will be a year ahead is uncertain by 300,000 km.
- **Basis:** About 10 m/s of burns a year does it. A bullet sees a habitat too late to steer that far, and a needle must aim twice the light time ahead.
- **Uses:** energy 20% a year, compute 15% a year, 20 Mt of matter at start
- **Needs:** Habitat ring
- **Effect:** Immune to aim from light-years: needles, blind bullets, pellets. A spotter’s live positions can still guide a bullet in.

**Shadow berths** · 16 Years · `01:20:00` · Plausible · emissions quiet

- **Why:** Hide your works behind a moon.
- **What:** Parks works behind a moon, as seen from a feared direction.
- **Basis:** Rock blocks everything. The shadow moves as the moon orbits, so the works move with it.
- **Uses:** energy 15% a year, compute 10% a year, 20 Mt of matter at start
- **Needs:** Habitat ring
- **Effect:** Protects against one direction at a time.

### Tier 4 · star-scale works

**Lifeboats** · 50 Years · `04:10:00` · Speculative · emissions noticeable

- **Why:** Escape before the strike lands.
- **What:** Seedships kept fueled, each with a copy of the mind, launched the moment a threat is seen.
- **Basis:** Seedships held ready. Flee sideways: exhaust aimed at the attacker shows them the escape.
- **Uses:** energy 25% a year, compute 20% a year, 400 Mt of matter at start
- **Needs:** Seedship
- **Effect:** A coasting lifeboat is nearly invisible, so no attacker can confirm a kill.

**Dead hand** · 60 Years · `05:00:00` · Speculative · emissions quiet

- **Why:** Make striking you cost the striker.
- **What:** Launchers at our outposts that fire back if home goes silent.
- **Basis:** A strike’s direction names its sender, unless a far platform framed someone else.
- **Uses:** energy 20% a year, compute 25% a year, 400 Mt of matter at start
- **Needs:** Heavy impactor + Dispersal outposts
- **Effect:** Deters only those who know of it.

## Discovery projects

These appear from results, and name their target. Braces mark where a real star, planet or sender is filled in.

**Measure what’s crossing {star}** · Know · 8 Years · `00:40:00` · Grounded

- **Why:** Learn what keeps dimming that star: a planet, dust, or something built.
- **What:** Works out the size, orbit and color of whatever keeps dimming the star. Dust dims blue light more than red; a solid object dims every color equally.
- **Basis:** Transit timing, depth and color, as used in 2018 to show Boyajian’s star was dimmed by dust.
- **Uses:** energy 10% a year, compute 15% a year
- **Needs:** Transit watch
- **Appears:** Appears when a dimming repeats.

**Study the air of {planet}** · Know · 16 Years · `01:20:00` · Grounded

- **Why:** Narrow down the atmospheres a planet could have.
- **What:** Measures atmospheric gases when a planet transits its star. A null result can exclude an atmosphere model while leaving others possible.
- **Basis:** Transmission spectroscopy. The 2026 JWST study of TRAPPIST-1 f excludes some H2/He atmospheres without establishing an airless world. Report model assumptions and confidence.
- **Uses:** energy 15% a year, compute 20% a year
- **Needs:** Planet survey + Spectrograph bank
- **Appears:** Appears for a transiting planet worth a look. Other viewing geometries need direct imaging.

**Study the oxygen world** · Know · 18 Years · `01:30:00` · Plausible

- **Why:** Test the case for life or industry on the oxygen world.
- **What:** Tests life and industry against natural chemistry, using oxygen, methane, water, carbon monoxide and the star’s radiation.
- **Basis:** Broad wavelength spectroscopy tests false positives (Krissansen-Totton et al., published 2026). Methane with oxygen can strengthen the case for life. NO2 has natural sources. A claimed industrial gas needs secure identification and tests of alternatives.
- **Uses:** energy 15% a year, compute 20% a year
- **Needs:** Spectrograph bank + Infrared telescope
- **Appears:** Appears from the oxygen clue. Earth is 19.9 ly away.

**Map the dust at {star}** · Know · 10 Years · `00:50:00` · Grounded

- **Why:** Rings in the dust can show where hidden planets are.
- **What:** Shows the shape of a dust disk: rings and gaps can hide planets.
- **Basis:** Debris-disk imaging, as ALMA and JWST do.
- **Uses:** energy 10% a year, compute 15% a year
- **Needs:** Infrared telescope
- **Appears:** Appears when a glow looks like dust.

**Resolve the companions of {star}** · Know · 14 Years · `01:10:00` · Grounded

- **Why:** Test whether a glow belongs to the star or lies behind it.
- **What:** Measures objects close to the star on the sky. Repeated positions test whether they move with it or lie far behind it.
- **Basis:** Imaging, spectroscopy and common-motion checks. Better angular resolution may require the infrared interferometer.
- **Uses:** energy 15% a year, compute 15% a year
- **Needs:** Infrared telescope
- **Appears:** Appears when a glow could be a companion or a background source.

**Survey the radio sky** · Know · 8 Years · `00:40:00` · Plausible

- **Why:** Find faint radio sources worth a closer listen.
- **What:** Integrates selected sky fields for faint broadband sources, then checks their positions against nearby stars.
- **Basis:** The broadband survey framework proposed by Garrett (2026). Exposure and sky coverage trade off. A candidate is not a confirmed civilization.
- **Uses:** energy 10% a year, compute 15% a year
- **Needs:** Deep-field receiver or Far-side array
- **Appears:** Opens when a receiver is built. Candidates open targeted listening and source checks.

**Check the radio source at {star}** · Know · 4 Years · `00:20:00` · Plausible

- **Why:** Find out whether a radio source is natural or built.
- **What:** Repeats the observation and tests spectrum, polarization, variability and motion against stars, planets, background galaxies and our own interference.
- **Basis:** Source discrimination following Garrett (2026). Only evidence that identifies technology establishes civilization presence, as of when the light left.
- **Uses:** energy 10% a year, compute 20% a year
- **Needs:** Deep-field receiver or Far-side array
- **Appears:** Appears after a radio candidate. May strengthen the case, identify a natural source, or leave it unresolved. Nothing sent.

**Listen to {star}** · Know · 4 Years · `00:20:00` · Grounded

- **Why:** Listen for a neighbor, and measure what is there.
- **What:** Points the receiver at one star for faint broadband emission and directed signals. Measures position, spectrum and variability. A hum alone leaves natural explanations open.
- **Basis:** Targeted SETI. Rotation may modulate radio emissions (Saide et al. 2023). A repeating cycle alone does not prove technology or map transmitters.
- **Uses:** energy 10% a year, compute 20% a year
- **Needs:** Deep-field receiver or Far-side array
- **Appears:** Opens when a receiver is built. Distance, sensitivity and exposure determine what it can exclude or detect. A candidate can open a source check.

**Watch {star} for flashes** · Know · 6 Years · `00:30:00` · Grounded

- **Why:** Confirm or rule out a possible signal.
- **What:** Stares at one star to catch another laser flash.
- **Basis:** Follow-up of optical SETI candidates.
- **Uses:** energy 5% a year, compute 15% a year
- **Needs:** Deep flash watch
- **Appears:** Appears after a candidate flash.

**Image {planet}** · Know · 30 Years · `02:30:00` · Plausible

- **Why:** See another world for yourself.
- **What:** A picture of another world: clouds, oceans, continents.
- **Basis:** Exoplanet imaging with a starshade, interferometer or solar lens.
- **Uses:** energy 20% a year, compute 30% a year
- **Needs:** Starshade or Infrared interferometer or Solar lens observatory
- **Appears:** Appears when a planet’s air is interesting.

**Survey the next 50 stars** · Know · 30 Years · `02:30:00` · Grounded

- **Why:** More worlds to choose from, for study and settling.
- **What:** Extends the planet search to the whole seeding region.
- **Basis:** Larger surveys with longer baselines.
- **Uses:** energy 15% a year, compute 30% a year
- **Needs:** Planet survey
- **Appears:** When its prerequisite finishes.

**Send a probe to {star}** · Reach · 12 Years · `01:00:00` · Plausible

- **Why:** Go and see for yourself.
- **What:** One probe, one target. Every type you have is compared, with its arrival and report times, before you commit.
- **Basis:** Any probe type you have built.
- **Uses:** energy 20% a year, compute 15% a year, 4,000 kt of matter at start
- **Needs:** Flyby probe
- **Appears:** Appears for every star with an open clue.

**Strike {target}** · Reach · 12 Years · `01:00:00` · Plausible

- **Why:** Hit them, knowing what it costs and who will know.
- **What:** Every weapon you have is compared: its cost, arrival, the warning they get, who sees the launch, and whose name is on it. Shown here: an aimed flyby. A heavy bullet takes 10 Years and 10 Mt; a pellet volley 4 Years of laser; a sleeper, nothing more; the star laser, compute while it fires.
- **Basis:** Any weapon you have built, including a flyby probe aimed to hit instead of pass.
- **Uses:** energy 20% a year, compute 15% a year, 4,000 kt of matter at start
- **Needs:** Flyby probe or Heavy impactor or Pellet swarm or Sleeper
- **Appears:** Appears when you know where a civilization is and have mapped its planet. A shot aimed only at a star misses.

**Feint toward {star}** · Reach · 4 Years · `00:20:00` · Plausible

- **Why:** Test their nerve, and see what they do.
- **What:** Fires the laser array toward them with nothing on it.
- **Basis:** A launch laser’s beam shows; what it pushes does not.
- **Uses:** energy 30% a year, compute 5% a year
- **Needs:** Laser sail array
- **Appears:** Appears when you know where a civilization is. They must stay on alert until the slowest bullet would have passed.

**Nudge a rock toward {planet}** · Reach · 20 Years · `01:40:00` · Plausible

- **Why:** A strike that looks like nature.
- **What:** Our lurker hovers beside a rock already passing near, and its gravity slowly pulls the rock onto a collision course.
- **Basis:** A gravity tractor, studied by NASA for planetary defense, run backward. It looks like nature.
- **Uses:** energy 5% a year, compute 10% a year
- **Needs:** Lurker
- **Appears:** Appears when a lurker finds a rock passing near an inhabited world.

**Tell {recipient} where {civilization} is** · Reach · 2 Years · `00:10:00` · Grounded

- **Why:** Let others find them for you.
- **What:** Outing: a lead, not proof. A broadcast outs us too; a tight beam, only to the recipient.
- **Basis:** Any transmitter. The recipient checks with its own instruments.
- **Uses:** energy 10% a year
- **Needs:** Tight-beam transmitter or Broadcast beacon
- **Appears:** Appears when we know where a civilization is, and someone else to tell.

**Share a key with {civilization}** · Reach · 2 Years · `00:10:00` · Grounded

- **Why:** Talk without being overheard.
- **What:** Makes our line with them private. By tight beam, unless a tap sat in exactly the right place; by courier, certain.
- **Basis:** A key used once is provably unbreakable. Carried in person, no one can copy it on the way.
- **Uses:** energy 10% a year, compute 5% a year
- **Needs:** Tight-beam transmitter or Sentinel probe
- **Appears:** Appears when we talk with a civilization. After it, a tap learns only who, when and how much.

**Test-fire at {moon}** · Reach · 10 Years · `00:50:00` · Plausible

- **Why:** Show your teeth, so no one tests them.
- **What:** Hits one of our own dead moons, so watchers see what we can do.
- **Basis:** An impact flash, visible to anyone watching closely.
- **Uses:** energy 10% a year, compute 5% a year, 10 Mt of matter at start
- **Needs:** Heavy impactor
- **Appears:** When its prerequisite finishes.

**Paint {star}** · Reach · 1 Years · `00:05:00` · Speculative

- **Why:** Show them you can reach them at light speed.
- **What:** A brief, low-power pass of the star laser across their system.
- **Basis:** A thousandth of a sun blinds any instrument looking our way.
- **Uses:** compute 10% a year
- **Needs:** Star laser
- **Appears:** Shows we can reach them at light speed. They may read it as an attack.

**Guard {planet} against {star}** · Endure · 20 Years · `01:40:00` · Speculative

- **Why:** Guard another world, or another direction.
- **What:** One more line of pickets toward a feared star, and depots near the planet it guards.
- **Basis:** One line guards one planet against one direction.
- **Uses:** energy 10% a year, compute 10% a year, 20 Mt of matter at start
- **Needs:** Pickets
- **Appears:** Appears for every planet we hold and every star we fear. About the cost of two heavy bullets.

**Reply to {sender}** · Reach · 2 Years · `00:10:00` · Grounded

- **Why:** Keep the conversation going.
- **What:** Answers a message. The reply takes as long as the distance.
- **Basis:** Tight-beam laser link.
- **Uses:** energy 10% a year
- **Needs:** Tight-beam transmitter
- **Appears:** Appears when someone speaks to us.

## Counts

72 catalog projects (15 know, 12 grow, 26 reach, 19 endure) and 21 discovery projects.
