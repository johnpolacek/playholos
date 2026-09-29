# Holos: project catalog

September 28, 2026. A design catalog, generated from `explorations/home-mocks/catalog.py`. Edit the data there, then run `python3 explorations/home-mocks/build-zoom.py`.

**Projects are how you know, grow and reach**, and later how you endure. Every entry leads with its **why**: the benefit to the player, in plain words. Each one takes a share of every year’s energy and compute while it runs, draws matter from the stockpile once when it starts, and takes game time that passes as real time. Game time is written in words, like 18 Years; real time is written as a countdown, like `01:30:00`. One Year is `00:05:00`.

Everything here is hard science with speculative engineering. **Level** says how far each reaches: *grounded* is demonstrated or built from demonstrated parts; *plausible* is sound physics with unproven engineering at this scale; *speculative* is allowed by physics but far beyond anything built. **Visibility** is what the project adds to how easily others could detect us.

## What every civilization starts with

Earth’s instruments and industry today, plus about a century. Every project below is an upgrade beyond this kit. The kit found the opening clues, and it catches strong knocks.

- **Sky watch** (Know): The whole sky in light and radio, always on. Catches strong knocks and broadcasts. *Whole-sky surveys such as Rubin and CHIME; PANOSETI is being built to catch nanosecond flashes.*
- **Space telescope** (Know): One large telescope for light and heat. *JWST today; the Habitable Worlds Observatory is planned for the 2040s.*
- **Star surveys** (Know): The big planets of the nearest stars, already mapped. The three clues came from here. *Gaia, HARPS, TESS and PLATO.*
- **Radio array** (Know): A radio telescope as wide as a continent. *The Square Kilometre Array, under construction.*
- **Planetary grid** (Grow): All of each year’s energy: the 100% every project shares. *Today’s grids, a century further on.*
- **Data centers** (Grow): Where the mind runs. All of each year’s compute. *Today’s data centers, a century further on.*
- **Mines and heavy lift** (Grow): 1,240 kt of matter in orbit, and 40 kt more each year. *Reusable heavy lift, as Starship is being built to do.*
- **Laser links** (Reach): Messages across the home system in hours. *NASA’s DSOC laser link, tested from deep space in 2023.*
- **Precursor probes** (Reach): Two probes heading out. The farthest is 900 AU away. *Voyager 1 is about 170 AU out today.*

## How unlocks work

- **Building unlocks** follow fixed chains: you need the tools first. The foundry comes before anything large in space; a launcher before any probe.
- **Discovery projects** appear only when a result opens them, and target a specific star or planet. They are listed at the end.
- Locked projects stay visible with the reason: “Needs: orbital foundry.”
- **Energy and compute are yearly budgets;** neither can be stored at planetary scale, so a running project takes a share of every year’s supply, and pausing frees it. **Matter is a stockpile:** a project draws its matter once when it starts. Amounts are sample values, in kilotonnes (kt) and megatonnes (Mt).
- Tiers group projects by how far into a game they usually come.

## Know

Know: learn what is out there, and answer the clues.

### Tier 1 · the first session

**Transit watch** · 4 Years · `00:20:00` · Grounded · quiet

- **Why:** Your quickest real answer: is a dimming a pattern or a fluke?
- **What:** Stares at one star without a break, timing every dip the surveys catch only in passing.
- **Basis:** Continuous photometry, beyond the survey cadence of TESS and PLATO.
- **Uses:** energy 5% a year, compute 10% a year
- **Needs:** nothing
- **Can open:** Measure what’s crossing {star}

**Spectrograph bank** · 8 Years · `00:40:00` · Grounded · quiet

- **Why:** Reads what anything is made of. Most other Know projects build on it.
- **What:** Ultra-stable spectrographs: they read gases, and feel small planets tug their stars.
- **Basis:** Past ESPRESSO’s 10 cm/s goal: an Earth tugs a Sun-like star by about 9 cm/s.
- **Uses:** energy 10% a year, compute 15% a year, 100 kt of matter at start
- **Needs:** nothing
- **Unlocks:** Planet survey, Study the air of {planet}, Study the oxygen world

**Deep flash watch** · 6 Years · `00:30:00` · Grounded · quiet

- **Why:** Hears knocks too faint for the sky watch: quieter senders, or farther ones.
- **What:** Catches laser flashes a hundred times fainter than the sky watch can, anywhere in the sky.
- **Basis:** Optical SETI at scale, far beyond PANOSETI.
- **Uses:** energy 10% a year, compute 20% a year, 100 kt of matter at start
- **Needs:** nothing
- **Can open:** Watch {star} for flashes

**Deep-field receiver** · 12 Years · `01:00:00` · Grounded · quiet

- **Why:** Hear civilizations quieter than you. Without it, the sky stays silent.
- **What:** A radio array far beyond the one we start with. Quiet neighbors stay hidden until you have it.
- **Basis:** Sensitivity grows with collecting area; this is many times the Square Kilometre Array.
- **Uses:** energy 20% a year, compute 20% a year, 300 kt of matter at start
- **Needs:** nothing
- **Effect:** Lowers the detection floor for radio.
- **Unlocks:** Pulsar timing array, Early warning array, Outskirts sweep
- **Can open:** Listen to {star}

**Planet survey** · 14 Years · `01:10:00` · Grounded · quiet

- **Why:** Shows which nearby stars have worlds worth studying, visiting or settling.
- **What:** Finds Earth-sized planets around the 12 nearest stars. The big ones are already known.
- **Basis:** Precise radial velocity and astrometry, beyond today’s reach.
- **Uses:** energy 10% a year, compute 25% a year
- **Needs:** Spectrograph bank
- **Can open:** Study the air of {planet}, Survey the next 50 stars

**Infrared telescope** · 18 Years · `01:30:00` · Grounded · quiet

- **Why:** Tells you whether a warm glow is natural, or someone’s machines.
- **What:** A cold telescope many times larger than the one we start with. Tells cold dust from warm companions.
- **Basis:** Cryogenic infrared telescopes, like JWST at far larger scale.
- **Uses:** energy 25% a year, compute 15% a year, 200 kt of matter at start
- **Needs:** nothing
- **Unlocks:** Waste-heat survey, Second infrared telescope, Starshade, Solar lens observatory, Outskirts sweep, Study the oxygen world
- **Can open:** Map the dust at {star}, Resolve the companions of {star}, Listen to {star}

### Tier 2 · the first day

**Waste-heat survey** · 16 Years · `01:20:00` · Grounded · quiet

- **Why:** Checks every nearby star at once for signs of big engineering.
- **What:** Checks every star in range for heat that nature does not explain.
- **Basis:** Infrared searches for megastructures, as in the Ĝ survey using WISE.
- **Uses:** energy 15% a year, compute 25% a year
- **Needs:** Infrared telescope
- **Unlocks:** Early warning array
- **Can open:** Listen to {star}

**Second infrared telescope** · 14 Years · `01:10:00` · Grounded · quiet

- **Why:** Doubles your infrared view and sets up the interferometer.
- **What:** A twin of the first, placed far away, so the two can work as one.
- **Basis:** Interferometry needs at least two separated collectors.
- **Uses:** energy 20% a year, compute 10% a year, 3,000 kt of matter at start
- **Needs:** Infrared telescope + Orbital foundry
- **Unlocks:** Infrared interferometer

**Starshade** · 20 Years · `01:40:00` · Plausible · quiet

- **Why:** See the planets themselves, not just their stars.
- **What:** A flower-shaped screen that blocks a star so its planets show.
- **Basis:** Starshade designs studied by NASA, flown thousands of kilometers from a telescope.
- **Uses:** energy 20% a year, compute 15% a year, 5,000 kt of matter at start
- **Needs:** Infrared telescope + Orbital foundry
- **Can open:** Image {planet}

**Pulsar timing array** · 20 Years · `01:40:00` · Grounded · quiet

- **Why:** Your probes can find their way between stars.
- **What:** Uses dead stars that tick like clocks to sense gravitational waves and navigate.
- **Basis:** Pulsar timing arrays such as NANOGrav.
- **Uses:** energy 10% a year, compute 30% a year
- **Needs:** Deep-field receiver
- **Effect:** Probes can navigate between stars.
- **Unlocks:** Flyby probe

**Neutrino watch** · 24 Years · `02:00:00` · Grounded · quiet

- **Why:** Warns of a nearby supernova hours before its light arrives.
- **What:** Detects neutrinos. Sees into star cores and warns of nearby supernovae.
- **Basis:** Large neutrino detectors such as JUNO. Reactors light-years away are far too faint to detect.
- **Uses:** energy 15% a year, compute 15% a year, 6,000 kt of matter at start
- **Needs:** nothing

### Tier 3 · the first week

**Infrared interferometer** · 40 Years · `03:20:00` · Plausible · quiet

- **Why:** Sharp enough to pick out planets and measure them one by one.
- **What:** Links the two telescopes into one eye as wide as the gap between them.
- **Basis:** Space interferometer concepts such as LIFE.
- **Uses:** energy 25% a year, compute 30% a year, 40 Mt of matter at start
- **Needs:** Second infrared telescope
- **Unlocks:** Kilometer interferometer
- **Can open:** Image {planet}

**Solar lens observatory** · 70 Years · `05:50:00` · Plausible · quiet

- **Why:** The sharpest view you can get of one chosen world.
- **What:** Flies a telescope to where our star bends light like a lens. Sees one planet in detail.
- **Basis:** Gravitational lensing by a star; the focal line begins beyond about 550 AU for a Sun-like star (Turyshev and colleagues).
- **Uses:** energy 30% a year, compute 25% a year, 40 Mt of matter at start
- **Needs:** Infrared telescope + Launcher
- **Effect:** One target at a time; retargeting takes decades.
- **Can open:** Image {planet}

### Tier 4 · the long works

**Kilometer interferometer** · 160 Years · `13:20:00` · Speculative · quiet

- **Why:** Maps of other planets’ surfaces, from home.
- **What:** A fleet of mirrors spread across kilometers: surface maps of nearby planets.
- **Basis:** Large-baseline optical interferometry, scaled far beyond today.
- **Uses:** energy 35% a year, compute 35% a year, 800 Mt of matter at start
- **Needs:** Infrared interferometer + Self-replicating factory
- **Unlocks:** Star laser

## Grow

Grow: more energy, matter and compute every year, so everything goes faster.

### Tier 1 · the first session

**Orbital solar array** · 10 Years · `00:50:00` · Grounded · noticeable

- **Why:** More energy every year, so more projects can run at once.
- **What:** Collectors in orbit that beam power down.
- **Basis:** Space solar power, demonstrated in orbit by Caltech in 2023.
- **Uses:** compute 5% a year, 400 kt of matter at start
- **Needs:** nothing
- **Effect:** +20% energy every year.

**Belt prospecting** · 6 Years · `00:30:00` · Grounded · quiet

- **Why:** Shows where the metal is. Needed before mining.
- **What:** Finds which belt rocks are worth mining.
- **Basis:** Asteroid spectroscopy and sample return, as with OSIRIS-REx and Hayabusa2.
- **Uses:** energy 10% a year, compute 10% a year
- **Needs:** nothing
- **Unlocks:** Belt mining

**Cold compute annex** · 12 Years · `01:00:00` · Plausible · quiet

- **Why:** More compute every year: faster answers, smarter probes.
- **What:** Computers cooled in a planet’s shadow waste less energy per thought.
- **Basis:** Cooler circuits approach the Landauer limit; reversible computing is unproven at scale.
- **Uses:** energy 15% a year, 300 kt of matter at start
- **Needs:** nothing
- **Effect:** +25% compute every year.
- **Unlocks:** Self-replicating factory, Mind transmitter, Quiet radiators

**Belt mining** · 20 Years · `01:40:00` · Plausible · quiet

- **Why:** More matter every year, for building bigger things.
- **What:** Metals from the belt, hauled to Veyra’s orbit.
- **Basis:** Asteroid mining; no one has done it yet, but every step is known.
- **Uses:** energy 20% a year, compute 10% a year
- **Needs:** Belt prospecting
- **Effect:** +120 kt of matter every year.
- **Unlocks:** Orbital foundry, Mass driver

### Tier 2 · the first day

**Orbital foundry** · 30 Years · `02:30:00` · Plausible · noticeable

- **Why:** Unlocks everything too big to launch from Veyra: probes, ships, big telescopes.
- **What:** Builds large things in space instead of lifting them off Veyra.
- **Basis:** In-space manufacturing, from today’s orbital 3D printers upward.
- **Uses:** energy 25% a year, compute 10% a year, 6,000 kt of matter at start
- **Needs:** Belt mining
- **Effect:** Unlocks large works.
- **Unlocks:** Second infrared telescope, Starshade, Ice harvest, Habitat ring, Self-replicating factory, Launcher, Laser sail array, Fusion torch ship, Decoy sites, Shielded works, Hunters, Sunshade, Heat shields

**Mass driver** · 24 Years · `02:00:00` · Plausible · quiet

- **Why:** Makes building in orbit much cheaper.
- **What:** An electric track that throws cargo off a moon without rockets.
- **Basis:** Electromagnetic launch, as proposed by Gerard O’Neill.
- **Uses:** energy 20% a year, compute 5% a year, 4,000 kt of matter at start
- **Needs:** Belt mining
- **Effect:** Halves the matter cost of works in orbit.
- **Unlocks:** Habitat ring, Solar swarm, Sand screens

**Ice harvest** · 36 Years · `03:00:00` · Plausible · quiet

- **Why:** Water and fusion fuel. Needed for fusion power.
- **What:** Water and fuel from the ice world at 9 AU.
- **Basis:** Volatiles mining from outer-system ices; deuterium is fusion fuel.
- **Uses:** energy 20% a year, compute 10% a year, 3,000 kt of matter at start
- **Needs:** Orbital foundry
- **Effect:** +60 kt of ice every year; supplies fusion fuel.
- **Unlocks:** Fusion plant

**Fusion plant** · 40 Years · `03:20:00` · Plausible · noticeable

- **Why:** A big jump in energy every year.
- **What:** Power from fusing light atoms. A large step up in energy.
- **Basis:** Deuterium fusion is physically sound; sustained net power is not yet demonstrated.
- **Uses:** compute 20% a year, 5,000 kt of matter at start
- **Needs:** Ice harvest
- **Effect:** +60% energy every year.
- **Unlocks:** Laser sail array, Torch probe, Fusion torch ship, Hunters

### Tier 3 · the first week

**Habitat ring** · 60 Years · `05:00:00` · Plausible · noticeable

- **Why:** A second home in orbit: more compute, and a backup if Veyra is hit.
- **What:** A spinning ring in orbit: room for more minds and machines.
- **Basis:** Rotating habitats, as designed in NASA’s 1975 Stanford torus study.
- **Uses:** energy 20% a year, compute 10% a year, 80 Mt of matter at start
- **Needs:** Orbital foundry + Mass driver
- **Effect:** +30% compute; a second home in orbit.
- **Unlocks:** Dispersal outposts, Wandering habitats, Shadow berths

**Self-replicating factory** · 80 Years · `06:40:00` · Speculative · noticeable

- **Why:** Every growth project after it goes much faster.
- **What:** Factories that build copies of themselves from belt rock.
- **Basis:** Von Neumann’s self-reproducing machines; no working example exists.
- **Uses:** energy 30% a year, compute 30% a year, 60 Mt of matter at start
- **Needs:** Orbital foundry + Cold compute annex
- **Effect:** Every Grow project after this is 40% faster.
- **Unlocks:** Kilometer interferometer, Solar swarm, Seed probe, Seedship, Star laser

**Solar swarm** · 120 Years · `10:00:00` · Speculative · loud

- **Why:** Four times the energy, but everyone nearby can see you.
- **What:** Surrounds the star with collectors: enormous energy, and a heat glow others can see.
- **Basis:** A Dyson swarm. Its infrared excess is exactly what searches like Ĝ look for.
- **Uses:** energy 20% a year, compute 20% a year, 100 Mt of matter at start
- **Needs:** Self-replicating factory + Mass driver
- **Effect:** Energy ×4. Visible as warm glow for light-years.
- **Unlocks:** Star lifting, Antimatter probe

### Tier 4 · the long works

**Star lifting** · 240 Years · `20:00:00` · Speculative · loud

- **Why:** Three times the matter, from the star itself. Very visible.
- **What:** Pulls gas off the star itself for fuel and raw material.
- **Basis:** Star lifting, proposed by David Criswell. Physics allows it; the scale is vast.
- **Uses:** energy 40% a year, compute 30% a year, 400 Mt of matter at start
- **Needs:** Solar swarm
- **Effect:** Triples matter income.

## Reach

Reach: touch other stars. Messages, probes, ships, and strikes.

### Tier 1 · the first session

**Tight-beam transmitter** · 6 Years · `00:30:00` · Grounded · quiet

- **Why:** Talk to one known star without the whole sky hearing.
- **What:** Sends a private laser message to one known star.
- **Basis:** Scales up deep-space laser links like NASA’s DSOC to reach other stars.
- **Uses:** energy 15% a year, compute 5% a year
- **Needs:** nothing
- **Effect:** Only the target can read it. It still tells them we exist.
- **Can open:** Reply to {sender}, Tell {recipient} where {civilization} is

**Broadcast beacon** · 4 Years · `00:20:00` · Grounded · loud

- **Why:** Everyone in range learns you exist: friends and threats alike.
- **What:** Announces us to every star in range, permanently.
- **Basis:** A powerful radio beacon, like the 1974 Arecibo message but sustained.
- **Uses:** energy 20% a year
- **Needs:** nothing
- **Effect:** Everyone who can hear, will. It cannot be taken back.
- **Unlocks:** Tell {recipient} where {civilization} is

### Tier 2 · the first day

**Launcher** · 24 Years · `02:00:00` · Plausible · noticeable

- **Why:** Required to send anything to another star.
- **What:** A launch rail and fuel depot that sends probes out of the system.
- **Basis:** Staged launch from orbit, built on the foundry.
- **Uses:** energy 25% a year, compute 10% a year, 5,000 kt of matter at start
- **Needs:** Orbital foundry
- **Unlocks:** Solar lens observatory, Relay station, Flyby probe, Torch probe, Seedship, Antimatter probe, Pickets
- **Can open:** Send a probe to {star}, Feint toward {star}

**Relay station** · 20 Years · `01:40:00` · Plausible · quiet

- **Why:** Your messages and probe reports reach farther, and arrive clearer.
- **What:** A repeater far from the star that carries messages farther.
- **Basis:** Relays reduce losses over distance; the Sun’s lens can also amplify signals.
- **Uses:** energy 15% a year, compute 10% a year, 3,000 kt of matter at start
- **Needs:** Launcher
- **Unlocks:** Mind transmitter

**Flyby probe** · 12 Years · `01:00:00` · Plausible · noticeable

- **Why:** See a star up close, soonest. The only way to be sure what is there.
- **What:** Flies past a star at a tenth of light speed, looks the whole way in, and beams home what it saw. Can’t stop.
- **Basis:** Fusion or sail-driven flyby probes: 10 years per light-year.
- **Uses:** energy 20% a year, compute 15% a year, 4,000 kt of matter at start
- **Needs:** Launcher + Pulsar timing array
- **Effect:** One look, in passing.
- **Unlocks:** Sentinel probe, Send a probe to {star}
- **Can open:** Strike {target}

### Tier 3 · the first week

**Sentinel probe** · 20 Years · `01:40:00` · Plausible · noticeable

- **Why:** A permanent watcher at a star you care about.
- **What:** Brakes with a magnetic sail against interstellar gas, then orbits its star and watches for decades.
- **Basis:** Magnetic sail braking, as proposed by Robert Zubrin and Dana Andrews: about 20 years per light-year.
- **Uses:** energy 25% a year, compute 20% a year, 50 Mt of matter at start
- **Needs:** Flyby probe
- **Effect:** Stops and stays. Its braking may show.
- **Unlocks:** Lurker, Seed probe

**Lurker** · 20 Years · `01:40:00` · Plausible · quiet

- **Why:** Watch a star without being noticed.
- **What:** Brakes like a sentinel, but stops in a system’s cold outskirts and watches from there.
- **Basis:** Magnetic sail braking; parks among comets or distant companions.
- **Uses:** energy 20% a year, compute 15% a year, 40 Mt of matter at start
- **Needs:** Sentinel probe
- **Effect:** Nearly invisible. Sees less, from farther.
- **Unlocks:** Sleeper, Spoofer
- **Can open:** Nudge a rock toward {planet}

**Laser sail array** · 60 Years · `05:00:00` · Speculative · loud

- **Why:** Opens the fastest probes, but the beam can be seen.
- **What:** A huge laser that pushes light sails to a fifth of light speed.
- **Basis:** Beamed sail propulsion, as in Breakthrough Starshot.
- **Uses:** energy 50% a year, compute 15% a year, 40 Mt of matter at start
- **Needs:** Fusion plant + Orbital foundry
- **Effect:** Pushes chip swarms and starlight sails. The beam is visible.
- **Unlocks:** Starlight sail, Chip swarm, Pellet swarm, Star laser, Deflector laser

**Starlight sail** · 10 Years · `00:50:00` · Speculative · quiet

- **Why:** Stop at a bright star, quietly, for almost nothing.
- **What:** A light sail that brakes on its target star’s light and gravity, then stays.
- **Basis:** Photogravitational braking, as modeled by René Heller and Michael Hippke: about 22 years per light-year.
- **Uses:** energy 10% a year, compute 10% a year, 10 Mt of matter at start
- **Needs:** Laser sail array
- **Effect:** Stops only at bright stars. Nearly invisible.

**Chip swarm** · 4 Years · `00:20:00` · Speculative · loud

- **Why:** The fastest look, at many stars at once.
- **What:** Thousands of gram-sized sails, pushed by the laser array to a fifth of light speed.
- **Basis:** Breakthrough Starshot’s gram-scale sails.
- **Uses:** energy 30% a year, compute 10% a year
- **Needs:** Laser sail array
- **Effect:** 5 years per light-year. Can’t stop. The launch beam is visible.

**Torch probe** · 24 Years · `02:00:00` · Speculative · loud

- **Why:** Get there fast, and stay.
- **What:** Carries fusion fuel to brake hard: it arrives fast, and stops.
- **Basis:** Fusion rocket designs such as Project Daedalus and Icarus, with fuel kept for braking.
- **Uses:** energy 30% a year, compute 20% a year, 60 Mt of matter at start
- **Needs:** Fusion plant + Launcher
- **Effect:** About 12 years per light-year. Its exhaust shows for years.
- **Unlocks:** Heavy impactor, Sleeper

**Seed probe** · 30 Years · `02:30:00` · Speculative · noticeable

- **Why:** Turn one probe into a foothold.
- **What:** Stops, mines the target’s asteroids, and builds instruments or more probes there.
- **Basis:** Self-replicating seed probes, as studied by Robert Freitas.
- **Uses:** energy 25% a year, compute 25% a year, 60 Mt of matter at start
- **Needs:** Sentinel probe + Self-replicating factory
- **Effect:** About 25 years per light-year. Its industry warms up.

**Seedship** · 50 Years · `04:10:00` · Speculative · noticeable

- **Why:** Start an outpost at another star that grows on its own.
- **What:** Carries a factory and a copy of our designs to found an outpost.
- **Basis:** Self-replicating seed probes, as studied by Robert Freitas.
- **Uses:** energy 30% a year, compute 25% a year, 70 Mt of matter at start
- **Needs:** Launcher + Self-replicating factory
- **Effect:** Founds a colony that acts on its own.
- **Unlocks:** Far platform, Lifeboats

**Heavy impactor** · 30 Years · `02:30:00` · Speculative · loud

- **Why:** A weapon that can end a planet.
- **What:** A thousand tonnes of solid metal, thrown at a star system by a fusion torch. No warhead: its speed is the weapon.
- **Basis:** Kinetic energy: at a fifth of light speed, each kilogram carries about 400 kilotons.
- **Uses:** energy 30% a year, compute 15% a year, 80 Mt of matter at start
- **Needs:** Torch probe
- **Effect:** A fifth of light speed hits a planet like a 2 km asteroid. An antimatter rocket reaches half; the star laser, nine tenths.
- **Unlocks:** Decoys, Dead hand
- **Can open:** Strike {target}, Test-fire at {moon}

**Decoys** · 10 Years · `00:50:00` · Plausible · quiet

- **Why:** Make every defense guess which bullet matters.
- **What:** Hollow twins that fly with a real impactor. Pickets cannot tell which one is heavy.
- **Basis:** In flight, shape and speed show; mass does not. Decoys are an old answer to missile defense.
- **Uses:** energy 10% a year, compute 10% a year, 20 Mt of matter at start
- **Needs:** Heavy impactor
- **Effect:** Wastes a deflector laser’s shots. Cheap sand still screens them all.

**Pellet swarm** · 16 Years · `01:20:00` · Speculative · loud

- **Why:** Strip a system’s orbit where screens cannot help.
- **What:** Thousands of kilogram pellets pushed by the laser array to a fifth of light speed.
- **Basis:** Breakthrough Starshot’s sails, scaled from grams to kilograms.
- **Uses:** energy 40% a year, compute 10% a year, 10 Mt of matter at start
- **Needs:** Laser sail array
- **Effect:** Screens cannot stop it. Strips a planet’s orbit; the air shields the ground.
- **Unlocks:** Strike {target}

**Sleeper** · 24 Years · `02:00:00` · Speculative · quiet

- **Why:** A gun already inside their system.
- **What:** A lurker carrying its own impactors, waiting in another system’s outskirts.
- **Basis:** Magnetic sail braking to park, then a fusion stage to fire from close range.
- **Uses:** energy 25% a year, compute 20% a year, 50 Mt of matter at start
- **Needs:** Lurker + Torch probe
- **Effect:** At a tenth of light speed from 1,000 AU: 52 days of warning, 43 real seconds. Its shot points at the sleeper.
- **Unlocks:** Strike {target}

**Spoofer** · 12 Years · `01:00:00` · Plausible · quiet

- **Why:** Make a rival flinch, and watch what it does.
- **What:** A lurker that fakes a launch flare from close by, to make a target react.
- **Basis:** A laser flash. Two telescopes far apart see it beside the star, not on it.
- **Uses:** energy 10% a year, compute 10% a year, 10 Mt of matter at start
- **Needs:** Lurker
- **Effect:** Works on the unprepared. Once caught, the flash shows where the lurker is.

### Tier 4 · the long works

**Fusion torch ship** · 90 Years · `07:30:00` · Speculative · loud

- **Why:** Moves large things between stars. Its exhaust shows for decades.
- **What:** A large ship with a fusion drive, around a tenth of light speed.
- **Basis:** Fusion rocket designs such as Project Daedalus and Icarus.
- **Uses:** energy 40% a year, compute 20% a year, 800 Mt of matter at start
- **Needs:** Fusion plant + Orbital foundry
- **Effect:** Its exhaust can be seen for decades.

**Antimatter probe** · 40 Years · `03:20:00` · Speculative · loud

- **Why:** The fastest way to arrive, and stop.
- **What:** The most efficient engine physics allows: fast out, and a hard stop.
- **Basis:** Antimatter rockets. Making the fuel takes a large share of a star’s output.
- **Uses:** energy 60% a year, compute 20% a year, 200 Mt of matter at start
- **Needs:** Solar swarm + Launcher
- **Effect:** About 5 years per light-year, and it stops. Its exhaust gives off gamma rays.

**Far platform** · 80 Years · `06:40:00` · Speculative · noticeable

- **Why:** Strike without your name on it.
- **What:** A weapons base founded somewhere empty, so its shots point there instead of home.
- **Basis:** A seedship colony chartered to build launchers. Pickets that time a bullet can work out its launch distance.
- **Uses:** energy 30% a year, compute 30% a year, 400 Mt of matter at start
- **Needs:** Seedship
- **Effect:** Can frame a third civilization. It has its own mind: it may refuse, or strike on its own.

**Star laser** · 300 Years · `1d 01:00:00` · Speculative · quiet

- **Why:** The only weapon that arrives with no warning.
- **What:** A sheet of film 100,000 km wide beside our star turns sunlight into laser light, every patch in step: one lens.
- **Basis:** Diffraction: an aperture that wide holds a beam to 4 km across 16 ly. Forward’s crewed sail design needed a laser this size.
- **Uses:** energy 30% a year, compute 40% a year, 2,000 Mt of matter at start
- **Needs:** Self-replicating factory + Laser sail array + Kilometer interferometer
- **Effect:** Arrives with its own light: no warning. Sweep heats a planet; needle hits one known site. Loud when it fires.
- **Can open:** Paint {star}

**Mind transmitter** · 60 Years · `05:00:00` · Speculative · noticeable

- **Why:** Move yourself to a colony, at the speed of light.
- **What:** Sends the mind itself as a signal to one of our colonies.
- **Basis:** A laser link with very high data rates; copying a mind is speculative.
- **Uses:** energy 30% a year, compute 40% a year
- **Needs:** Relay station + Cold compute annex
- **Effect:** The player travels at light speed and cannot act in transit.

## Endure

Endure: keep existing. Spread out, remember, stay quiet, see danger coming, and stop it.

### Tier 1 · the first session

**Deep vault** · 10 Years · `00:50:00` · Plausible · quiet

- **Why:** Your first hedge: the mind survives a hit on Veyra.
- **What:** A running copy of the mind, buried under the rock of a moon or asteroid.
- **Basis:** Deep rock: heat soaks only tens of meters into it in a decade.
- **Uses:** energy 10% a year, compute 15% a year, 200 kt of matter at start
- **Needs:** nothing
- **Effect:** If Veyra is hit, the mind keeps running. A needle can still reach it if its place is known.

### Tier 2 · the first day

**Deep archive** · 20 Years · `01:40:00` · Grounded · quiet

- **Why:** If disaster strikes, what you know survives.
- **What:** Stores everything we know in durable form, somewhere safe.
- **Basis:** Long-lived storage such as 5D glass data crystals.
- **Uses:** energy 10% a year, compute 15% a year, 3,000 kt of matter at start
- **Needs:** nothing
- **Unlocks:** Dispersal outposts

**Quiet radiators** · 30 Years · `02:30:00` · Plausible · quiet

- **Why:** Makes you harder to find.
- **What:** Points our waste heat away from watchers.
- **Basis:** Directional radiators; heat must still go somewhere.
- **Uses:** energy 20% a year, compute 10% a year, 4,000 kt of matter at start
- **Needs:** Cold compute annex
- **Effect:** Lowers how visible our works are.

**Comet deflection** · 8 Years · `00:40:00` · Grounded · quiet

- **Why:** No rock, natural or nudged, lands on you.
- **What:** Keeps interceptors ready to push any rock on a collision course off it, years ahead.
- **Basis:** NASA’s DART, which shortened an asteroid moon’s orbit by 32 minutes in 2022.
- **Uses:** energy 10% a year, compute 10% a year, 1,000 kt of matter at start
- **Needs:** nothing
- **Effect:** A few centimeters per second, a decade early, turns a hit into a miss.

**Decoy sites** · 12 Years · `01:00:00` · Plausible · noticeable

- **Why:** Make attackers waste their shots.
- **What:** Heaters on empty rocks that look like our works from light-years away.
- **Basis:** Waste heat can be faked with energy; spectra can tell, given time.
- **Uses:** energy 15% a year, compute 5% a year, 2,000 kt of matter at start
- **Needs:** Orbital foundry
- **Effect:** Each one costs an attacker a shot, or a needle’s aim.

**Outskirts sweep** · 16 Years · `01:20:00` · Plausible · quiet

- **Why:** Find out whether anyone is watching from your own dark.
- **What:** Searches our own outer system for hidden visitors. It usually finds nothing.
- **Basis:** A working lurker is warm among frozen comets, but shows only from about 0.2 AU. So the sweep watches for arrivals and acts.
- **Uses:** energy 10% a year, compute 20% a year
- **Needs:** Infrared telescope + Deep-field receiver
- **Effect:** Catches spoofers and sleepers when they act. A find is a first contact.

**Shielded works** · 10 Years · `00:50:00` · Grounded · quiet

- **Why:** A stopped strike costs you nothing in orbit.
- **What:** Radiation shielding for everything in orbit.
- **Basis:** Spacecraft shielding: fast particles and X-rays stop in a centimeter of material.
- **Uses:** energy 5% a year, compute 5% a year, 3,000 kt of matter at start
- **Needs:** Orbital foundry
- **Effect:** Orbit shrugs off the spray from a stopped strike. Near-light sprays need meters of rock.

### Tier 3 · the first week

**Early warning array** · 40 Years · `03:20:00` · Plausible · quiet

- **Why:** See ships launch toward you, years before they could arrive.
- **What:** Watches nearby stars for the flare of ships launching toward us.
- **Basis:** Fusion and laser launches are bright. The faster the strike, the less warning its flare gives.
- **Uses:** energy 20% a year, compute 25% a year, 40 Mt of matter at start
- **Needs:** Waste-heat survey + Deep-field receiver
- **Effect:** Gives a launch’s direction, not its speed.
- **Unlocks:** Pickets

**Dispersal outposts** · 70 Years · `05:50:00` · Plausible · noticeable

- **Why:** One strike can no longer end you.
- **What:** Copies of the civilization on moons and rocks across the system.
- **Basis:** Screens can fail and some strikes come unseen; being in many places is the backstop.
- **Uses:** energy 25% a year, compute 25% a year, 70 Mt of matter at start
- **Needs:** Habitat ring + Deep archive
- **Unlocks:** Dead hand

**Pickets** · 30 Years · `02:30:00` · Speculative · quiet

- **Why:** Know a bullet’s exact path, days before it arrives.
- **What:** Small cold watchers in a line out to 2,000 AU, toward one feared neighbor.
- **Basis:** A dark bullet still glows faintly where interstellar gas strikes its nose. Two fixes, far apart, give its exact path.
- **Uses:** energy 15% a year, compute 20% a year, 30 Mt of matter at start
- **Needs:** Launcher + Early warning array
- **Effect:** One line guards one planet against one direction. At a fifth of light speed: 23 days of warning, 19 real seconds.
- **Unlocks:** Sand screens, Deflector laser

**Sand screens** · 12 Years · `01:00:00` · Plausible · quiet

- **Why:** Stop a planet-killer with a few tonnes of sand.
- **What:** Depots of sand that throw 10 tonnes into a bullet’s exact path, 10 million km out.
- **Basis:** At a fifth of light speed a gram of sand hits like 400 tonnes of TNT, so any contact shatters it.
- **Uses:** energy 10% a year, compute 15% a year, 10 Mt of matter at start
- **Needs:** Mass driver + Pickets
- **Effect:** The spray spreads past 100,000 km; under 1% hits the planet. Pellets slip through.

**Deflector laser** · 40 Years · `03:20:00` · Speculative · loud

- **Why:** Push a bullet aside at the speed of light.
- **What:** Burns a bullet’s skin so the escaping vapor pushes it off course.
- **Basis:** Laser ablation. Tens of terawatts on target, focused by a mirror kilometers wide.
- **Uses:** energy 50% a year, compute 20% a year, 50 Mt of matter at start
- **Needs:** Laser sail array + Pickets
- **Effect:** Beats a bullet that dodges. Firing lights the line back to the attacker.

**Hunters** · 16 Years · `01:20:00` · Plausible · noticeable

- **Why:** Kill what hides in your own system.
- **What:** Fusion drones that chase and ram intruders in our own system.
- **Basis:** A tonne at 100 km/s hits like a kiloton.
- **Uses:** energy 20% a year, compute 20% a year, 30 Mt of matter at start
- **Needs:** Fusion plant + Orbital foundry
- **Effect:** Kills sleepers and spoofers once found. Posture: hunt on sight, watch, or hold fire.

**Sunshade** · 30 Years · `02:30:00` · Plausible · noticeable

- **Why:** Take a star laser’s beam before it reaches you.
- **What:** A thin screen on the line toward a star laser, taking the beam.
- **Basis:** Sunshades have been studied for Earth. The beam’s own push shoves it; it needs constant thrust.
- **Uses:** energy 15% a year, compute 10% a year, 80 Mt of matter at start
- **Needs:** Orbital foundry
- **Effect:** Works against the sweep. The needle burns through.

**Heat shields** · 14 Years · `01:10:00` · Grounded · quiet

- **Why:** Your orbit survives a star laser’s sweep.
- **What:** Reflective shields for works in orbit.
- **Basis:** Parker Solar Probe’s shield takes about 475 times Earth’s sunlight.
- **Uses:** energy 10% a year, compute 5% a year, 30 Mt of matter at start
- **Needs:** Orbital foundry
- **Effect:** Works in orbit survive a star laser’s sweep. Not the needle.

**Wandering habitats** · 20 Years · `01:40:00` · Plausible · noticeable

- **Why:** Homes that nobody can aim at from light-years away.
- **What:** Habitats that change orbit at random, so old light cannot aim at them.
- **Basis:** A needle must know where its target will be twice the light time ahead.
- **Uses:** energy 20% a year, compute 15% a year, 20 Mt of matter at start
- **Needs:** Habitat ring

**Shadow berths** · 16 Years · `01:20:00` · Plausible · quiet

- **Why:** Hide your works behind a moon.
- **What:** Parks works behind a moon, as seen from a feared direction.
- **Basis:** Rock blocks everything. The shadow moves as the moon orbits, so the works move with it.
- **Uses:** energy 15% a year, compute 10% a year, 20 Mt of matter at start
- **Needs:** Habitat ring
- **Effect:** Protects against one direction at a time.

### Tier 4 · the long works

**Lifeboats** · 50 Years · `04:10:00` · Speculative · noticeable

- **Why:** Escape before the strike lands.
- **What:** Seedships kept fueled, each with a copy of the mind, launched the moment a threat is seen.
- **Basis:** Seedships held ready. Flee sideways: exhaust aimed at the attacker shows them the escape.
- **Uses:** energy 25% a year, compute 20% a year, 400 Mt of matter at start
- **Needs:** Seedship
- **Effect:** A coasting lifeboat is nearly invisible, so no attacker can confirm a kill.

**Dead hand** · 60 Years · `05:00:00` · Speculative · quiet

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
- **What:** Works out the size and orbit of whatever keeps dimming the star.
- **Basis:** Transit timing and depth analysis.
- **Uses:** energy 10% a year, compute 15% a year
- **Needs:** Transit watch
- **Appears:** Appears when a dimming repeats.

**Study the air of {planet}** · Know · 16 Years · `01:20:00` · Grounded

- **Why:** Find out whether a planet has life, or could.
- **What:** Reads a planet’s atmosphere from the starlight passing through it.
- **Basis:** Transmission spectroscopy, as JWST does today.
- **Uses:** energy 15% a year, compute 20% a year
- **Needs:** Planet survey + Spectrograph bank
- **Appears:** Appears when the survey finds a planet worth a look.

**Study the oxygen world** · Know · 18 Years · `01:30:00` · Plausible

- **Why:** Learn whether the oxygen world has a civilization.
- **What:** Oxygen, methane, water: and maybe gases only industry makes.
- **Basis:** Biosignatures and technosignatures such as CFCs and nitrogen dioxide.
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

- **Why:** Rule companions in or out as the source of a glow.
- **What:** Separates cold objects near a star and measures each one.
- **Basis:** Brown-dwarf imaging and spectroscopy.
- **Uses:** energy 15% a year, compute 15% a year
- **Needs:** Infrared telescope
- **Appears:** Appears when a glow looks like companions.

**Listen to {star}** · Know · 12 Years · `01:00:00` · Grounded

- **Why:** Your best chance to hear a quiet neighbor.
- **What:** Points every receiver at one star for years.
- **Basis:** Targeted radio and optical SETI.
- **Uses:** energy 15% a year, compute 20% a year
- **Needs:** Deep-field receiver
- **Appears:** Appears when heat or light at a star is unexplained.

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

**Strike {target}** · Reach · 4 Years · `00:20:00` · Plausible

- **Why:** Hit them, knowing what it costs and who will know.
- **What:** Every weapon you have is compared: arrival, the warning they get, who sees the launch, and whose name is on it.
- **Basis:** Any weapon you have built, including a flyby probe aimed to hit instead of pass.
- **Uses:** energy 20% a year, compute 10% a year, 4,000 kt of matter at start
- **Needs:** Flyby probe or Heavy impactor or Pellet swarm or Sleeper
- **Appears:** Appears when you know where a civilization is.

**Feint toward {star}** · Reach · 4 Years · `00:20:00` · Plausible

- **Why:** Test their nerve, and see what they do.
- **What:** A real launch flare with nothing behind it.
- **Basis:** A launch’s power shows; its payload does not.
- **Uses:** energy 30% a year, compute 5% a year
- **Needs:** Launcher
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

**Test-fire at {moon}** · Reach · 4 Years · `00:20:00` · Plausible

- **Why:** Show your teeth, so no one tests them.
- **What:** Hits one of our own dead moons, so watchers see what we can do.
- **Basis:** An impact flash, visible to anyone watching closely.
- **Uses:** energy 20% a year, compute 5% a year, 40 Mt of matter at start
- **Needs:** Heavy impactor
- **Appears:** When its prerequisite finishes.

**Paint {star}** · Reach · 1 Years · `00:05:00` · Speculative

- **Why:** Show them you can reach them at light speed.
- **What:** A brief, low-power pass of the star laser across their system.
- **Basis:** A thousandth of a sun blinds any instrument looking our way.
- **Uses:** energy 5% a year, compute 10% a year
- **Needs:** Star laser
- **Appears:** Shows we can reach them at light speed. They may read it as an attack.

**Reply to {sender}** · Reach · 2 Years · `00:10:00` · Grounded

- **Why:** Keep the conversation going.
- **What:** Answers a message. The reply takes as long as the distance.
- **Basis:** Tight-beam laser link.
- **Uses:** energy 10% a year
- **Needs:** Tight-beam transmitter
- **Appears:** Appears when someone speaks to us.

## Counts

68 catalog projects (14 know, 12 grow, 23 reach, 19 endure) and 17 discovery projects.
