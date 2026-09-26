# Holos: project catalog

September 26, 2026. A design catalog, generated from `explorations/home-mocks/catalog.py`. Edit the data there, then run `python3 explorations/home-mocks/build-zoom.py`.

**Projects are how you know, grow and reach**, and later how you endure. Every entry leads with its **why**: the benefit to the player, in plain words. Each one spends a share of every year’s energy, matter and compute, and takes game time that passes as real time. Game time is written in words, like 18 Years; real time is written as a countdown, like `01:30:00`. One Year is `00:05:00`.

Everything here is hard science with speculative engineering. **Level** says how far each reaches: *grounded* is demonstrated or built from demonstrated parts; *plausible* is sound physics with unproven engineering at this scale; *speculative* is allowed by physics but far beyond anything built. **Visibility** is what the project adds to how easily others could detect us.

## How unlocks work

- **Building unlocks** follow fixed chains: you need the tools first. The foundry comes before anything large in space; a launcher before any probe.
- **Discovery projects** appear only when a result opens them, and target a specific star or planet. They are listed at the end.
- Locked projects stay visible with the reason: “Needs: orbital foundry.”
- Costs assume a yearly budget, which is not yet decided. Tiers group projects by how far into a game they usually come.

## Know

Know: learn what is out there, and answer the clues.

### Tier 1 · the first session

**Transit watch** · 4 Years · `00:20:00` · Grounded · quiet

- **Why:** Your quickest real answer: is a dimming a pattern or a fluke?
- **What:** Times dimming events to see whether they repeat, and how regularly.
- **Basis:** Transit photometry, as done by Kepler and TESS.
- **Uses each year:** energy 5%, compute 10%
- **Needs:** nothing
- **Can open:** Measure what’s crossing {star}

**Spectrograph bank** · 8 Years · `00:40:00` · Grounded · quiet

- **Why:** Reads what anything is made of. Most other Know projects build on it.
- **What:** Splits starlight into colors to read gases, temperatures and motion.
- **Basis:** High-resolution spectroscopy, as with ESPRESSO and HARPS.
- **Uses each year:** energy 10%, matter 5%, compute 15%
- **Needs:** nothing
- **Unlocks:** Planet survey, Study the air of {planet}, Study Sol’s living world

**Optical flash watch** · 6 Years · `00:30:00` · Grounded · quiet

- **Why:** Catches a signal a quiet civilization might send on purpose.
- **What:** Watches the whole sky for nanosecond laser flashes.
- **Basis:** Optical SETI, as in the PANOSETI project.
- **Uses each year:** energy 10%, matter 5%, compute 20%
- **Needs:** nothing
- **Can open:** Watch {star} for flashes

**Deep-field receiver** · 12 Years · `01:00:00` · Grounded · quiet

- **Why:** Hear civilizations quieter than you. Without it, the sky stays silent.
- **What:** Hears fainter radio. Quiet neighbors stay hidden until you can.
- **Basis:** Sensitivity grows with collecting area, as in the Square Kilometre Array.
- **Uses each year:** energy 20%, matter 15%, compute 20%
- **Needs:** nothing
- **Effect:** Lowers the detection floor for radio.
- **Unlocks:** Pulsar timing array, Early warning array
- **Can open:** Listen to {star}

**Planet survey** · 14 Years · `01:10:00` · Grounded · quiet

- **Why:** Shows which nearby stars have worlds worth studying, visiting or settling.
- **What:** Finds planets around the 12 nearest stars by the wobble they cause.
- **Basis:** Radial-velocity and astrometric surveys, as with HARPS and Gaia.
- **Uses each year:** energy 10%, compute 25%
- **Needs:** Spectrograph bank
- **Can open:** Study the air of {planet}, Survey the next 50 stars

**Infrared telescope** · 18 Years · `01:30:00` · Grounded · quiet

- **Why:** Tells you whether a warm glow is natural, or someone’s machines.
- **What:** Sees heat. Can tell cold dust from warm companions.
- **Basis:** Cryogenic infrared telescopes, as with JWST.
- **Uses each year:** energy 25%, matter 10%, compute 15%
- **Needs:** nothing
- **Unlocks:** Waste-heat survey, Second infrared telescope, Starshade, Solar lens observatory, Study Sol’s living world
- **Can open:** Map the dust at {star}, Resolve the companions of {star}, Listen to {star}

### Tier 2 · the first day

**Waste-heat survey** · 16 Years · `01:20:00` · Grounded · quiet

- **Why:** Checks every nearby star at once for signs of big engineering.
- **What:** Checks every star in range for heat that nature does not explain.
- **Basis:** Infrared searches for megastructures, as in the Ĝ survey using WISE.
- **Uses each year:** energy 15%, compute 25%
- **Needs:** Infrared telescope
- **Unlocks:** Early warning array
- **Can open:** Listen to {star}

**Second infrared telescope** · 14 Years · `01:10:00` · Grounded · quiet

- **Why:** Doubles your infrared view and sets up the interferometer.
- **What:** A twin of the first, placed far away, so the two can work as one.
- **Basis:** Interferometry needs at least two separated collectors.
- **Uses each year:** energy 20%, matter 15%, compute 10%
- **Needs:** Infrared telescope + Orbital foundry
- **Unlocks:** Infrared interferometer

**Starshade** · 20 Years · `01:40:00` · Plausible · quiet

- **Why:** See the planets themselves, not just their stars.
- **What:** A flower-shaped screen that blocks a star so its planets show.
- **Basis:** Starshade designs studied by NASA, flown thousands of kilometers from a telescope.
- **Uses each year:** energy 20%, matter 25%, compute 15%
- **Needs:** Infrared telescope + Orbital foundry
- **Can open:** Image {planet}

**Pulsar timing array** · 20 Years · `01:40:00` · Grounded · quiet

- **Why:** Your probes can find their way between stars.
- **What:** Uses dead stars that tick like clocks to sense gravitational waves and navigate.
- **Basis:** Pulsar timing arrays such as NANOGrav.
- **Uses each year:** energy 10%, compute 30%
- **Needs:** Deep-field receiver
- **Effect:** Probes can navigate between stars.
- **Unlocks:** Assay probe

**Neutrino watch** · 24 Years · `02:00:00` · Grounded · quiet

- **Why:** Warns of a nearby supernova hours before its light arrives.
- **What:** Detects neutrinos. Sees into star cores and warns of nearby supernovae.
- **Basis:** Large neutrino detectors such as JUNO. Reactors light-years away are far too faint to detect.
- **Uses each year:** energy 15%, matter 30%, compute 15%
- **Needs:** nothing

### Tier 3 · the first week

**Infrared interferometer** · 40 Years · `03:20:00` · Plausible · quiet

- **Why:** Sharp enough to pick out planets and measure them one by one.
- **What:** Links the two telescopes into one eye as wide as the gap between them.
- **Basis:** Space interferometer concepts such as LIFE.
- **Uses each year:** energy 25%, matter 20%, compute 30%
- **Needs:** Second infrared telescope
- **Unlocks:** Kilometer interferometer
- **Can open:** Image {planet}

**Solar lens observatory** · 70 Years · `05:50:00` · Plausible · quiet

- **Why:** The sharpest view you can get of one chosen world.
- **What:** Flies a telescope to where our star bends light like a lens. Sees one planet in detail.
- **Basis:** Gravitational lensing by a star; the focal line begins beyond about 550 AU for a Sun-like star (Turyshev and colleagues).
- **Uses each year:** energy 30%, matter 20%, compute 25%
- **Needs:** Infrared telescope + Launcher
- **Effect:** One target at a time; retargeting takes decades.
- **Can open:** Image {planet}

### Tier 4 · the long works

**Kilometer interferometer** · 160 Years · `13:20:00` · Speculative · quiet

- **Why:** Maps of other planets’ surfaces, from home.
- **What:** A fleet of mirrors spread across kilometers: surface maps of nearby planets.
- **Basis:** Large-baseline optical interferometry, scaled far beyond today.
- **Uses each year:** energy 35%, matter 40%, compute 35%
- **Needs:** Infrared interferometer + Self-replicating factory

## Grow

Grow: more energy, matter and compute every year, so everything goes faster.

### Tier 1 · the first session

**Orbital solar array** · 10 Years · `00:50:00` · Grounded · noticeable

- **Why:** More energy every year, so more projects can run at once.
- **What:** Collectors in orbit that beam power down.
- **Basis:** Space solar power, demonstrated in orbit by Caltech in 2023.
- **Uses each year:** matter 20%, compute 5%
- **Needs:** nothing
- **Effect:** +20% energy every year.

**Belt prospecting** · 6 Years · `00:30:00` · Grounded · quiet

- **Why:** Shows where the metal is. Needed before mining.
- **What:** Finds which belt rocks are worth mining.
- **Basis:** Asteroid spectroscopy and sample return, as with OSIRIS-REx and Hayabusa2.
- **Uses each year:** energy 10%, compute 10%
- **Needs:** nothing
- **Unlocks:** Belt mining

**Cold compute annex** · 12 Years · `01:00:00` · Plausible · quiet

- **Why:** More compute every year: faster answers, smarter probes.
- **What:** Computers cooled in a planet’s shadow waste less energy per thought.
- **Basis:** Cooler circuits approach the Landauer limit; reversible computing is unproven at scale.
- **Uses each year:** energy 15%, matter 15%
- **Needs:** nothing
- **Effect:** +25% compute every year.
- **Unlocks:** Self-replicating factory, Mind transmitter, Quiet radiators

**Belt mining** · 20 Years · `01:40:00` · Plausible · quiet

- **Why:** More matter every year, for building bigger things.
- **What:** Metals from the belt, hauled to Veyra’s orbit.
- **Basis:** Asteroid mining; no one has done it yet, but every step is known.
- **Uses each year:** energy 20%, compute 10%
- **Needs:** Belt prospecting
- **Effect:** +30% matter every year.
- **Unlocks:** Orbital foundry, Mass driver

### Tier 2 · the first day

**Orbital foundry** · 30 Years · `02:30:00` · Plausible · noticeable

- **Why:** Unlocks everything too big to launch from Veyra: probes, ships, big telescopes.
- **What:** Builds large things in space instead of lifting them off Veyra.
- **Basis:** In-space manufacturing, from today’s orbital 3D printers upward.
- **Uses each year:** energy 25%, matter 30%, compute 10%
- **Needs:** Belt mining
- **Effect:** Unlocks large works.
- **Unlocks:** Second infrared telescope, Starshade, Ice harvest, Habitat ring, Self-replicating factory, Launcher, Laser sail array, Fusion torch ship

**Mass driver** · 24 Years · `02:00:00` · Plausible · quiet

- **Why:** Makes building in orbit much cheaper.
- **What:** An electric track that throws cargo off a moon without rockets.
- **Basis:** Electromagnetic launch, as proposed by Gerard O’Neill.
- **Uses each year:** energy 20%, matter 20%, compute 5%
- **Needs:** Belt mining
- **Effect:** Halves the matter cost of works in orbit.
- **Unlocks:** Habitat ring, Solar swarm

**Ice harvest** · 36 Years · `03:00:00` · Plausible · quiet

- **Why:** Water and fusion fuel. Needed for fusion power.
- **What:** Water and fuel from the ice world at 9 AU.
- **Basis:** Volatiles mining from outer-system ices; deuterium is fusion fuel.
- **Uses each year:** energy 20%, matter 15%, compute 10%
- **Needs:** Orbital foundry
- **Effect:** +15% matter; supplies fusion fuel.
- **Unlocks:** Fusion plant

**Fusion plant** · 40 Years · `03:20:00` · Plausible · noticeable

- **Why:** A big jump in energy every year.
- **What:** Power from fusing light atoms. A large step up in energy.
- **Basis:** Deuterium fusion is physically sound; sustained net power is not yet demonstrated.
- **Uses each year:** matter 25%, compute 20%
- **Needs:** Ice harvest
- **Effect:** +60% energy every year.
- **Unlocks:** Laser sail array, Fusion torch ship

### Tier 3 · the first week

**Habitat ring** · 60 Years · `05:00:00` · Plausible · noticeable

- **Why:** A second home in orbit: more compute, and a backup if Veyra is hit.
- **What:** A spinning ring in orbit: room for more minds and machines.
- **Basis:** Rotating habitats, as designed in NASA’s 1975 Stanford torus study.
- **Uses each year:** energy 20%, matter 40%, compute 10%
- **Needs:** Orbital foundry + Mass driver
- **Effect:** +30% compute; a second home in orbit.
- **Unlocks:** Dispersal outposts

**Self-replicating factory** · 80 Years · `06:40:00` · Speculative · noticeable

- **Why:** Every growth project after it goes much faster.
- **What:** Factories that build copies of themselves from belt rock.
- **Basis:** Von Neumann’s self-reproducing machines; no working example exists.
- **Uses each year:** energy 30%, matter 30%, compute 30%
- **Needs:** Orbital foundry + Cold compute annex
- **Effect:** Every Grow project after this is 40% faster.
- **Unlocks:** Kilometer interferometer, Solar swarm, Seedship

**Solar swarm** · 120 Years · `10:00:00` · Speculative · loud

- **Why:** Four times the energy, but everyone nearby can see you.
- **What:** Surrounds the star with collectors: enormous energy, and a heat glow others can see.
- **Basis:** A Dyson swarm. Its infrared excess is exactly what searches like Ĝ look for.
- **Uses each year:** energy 20%, matter 50%, compute 20%
- **Needs:** Self-replicating factory + Mass driver
- **Effect:** Energy ×4. Visible as warm glow for light-years.
- **Unlocks:** Star lifting

### Tier 4 · the long works

**Star lifting** · 240 Years · `20:00:00` · Speculative · loud

- **Why:** Three times the matter, from the star itself. Very visible.
- **What:** Pulls gas off the star itself for fuel and raw material.
- **Basis:** Star lifting, proposed by David Criswell. Physics allows it; the scale is vast.
- **Uses each year:** energy 40%, matter 20%, compute 30%
- **Needs:** Solar swarm
- **Effect:** Matter ×3.

## Reach

Reach: touch other stars. Messages, probes, ships.

### Tier 1 · the first session

**Tight-beam transmitter** · 6 Years · `00:30:00` · Grounded · quiet

- **Why:** Talk to one known star without the whole sky hearing.
- **What:** Sends a private laser message to one known star.
- **Basis:** Deep-space laser communication, as NASA’s DSOC demonstrated.
- **Uses each year:** energy 15%, compute 5%
- **Needs:** nothing
- **Effect:** Only the target can read it. It still tells them we exist.
- **Can open:** Reply to {sender}

**Broadcast beacon** · 4 Years · `00:20:00` · Grounded · loud

- **Why:** Everyone in range learns you exist: friends and threats alike.
- **What:** Announces us to every star in range, permanently.
- **Basis:** A powerful radio beacon, like the 1974 Arecibo message but sustained.
- **Uses each year:** energy 20%
- **Needs:** nothing
- **Effect:** Everyone who can hear, will. It cannot be taken back.

### Tier 2 · the first day

**Launcher** · 24 Years · `02:00:00` · Plausible · noticeable

- **Why:** Required to send anything to another star.
- **What:** A launch rail and fuel depot that sends probes out of the system.
- **Basis:** Staged launch from orbit, built on the foundry.
- **Uses each year:** energy 25%, matter 25%, compute 10%
- **Needs:** Orbital foundry
- **Unlocks:** Solar lens observatory, Relay station, Assay probe, Seedship
- **Can open:** Send an assay probe to {star}

**Relay station** · 20 Years · `01:40:00` · Plausible · quiet

- **Why:** Your messages and probe reports reach farther, and arrive clearer.
- **What:** A repeater far from the star that carries messages farther.
- **Basis:** Relays reduce losses over distance; the Sun’s lens can also amplify signals.
- **Uses each year:** energy 15%, matter 15%, compute 10%
- **Needs:** Launcher
- **Unlocks:** Mind transmitter

**Assay probe** · 12 Years · `01:00:00` · Plausible · noticeable

- **Why:** See a star up close. The only way to be sure what is there.
- **What:** Flies to a star, looks, and reports back. Travel adds 10 years per light-year.
- **Basis:** Fusion or sail-driven flyby probes at a tenth of light speed.
- **Uses each year:** energy 20%, matter 20%, compute 15%
- **Needs:** Launcher + Pulsar timing array
- **Unlocks:** Sentinel probe, Send an assay probe to {star}

### Tier 3 · the first week

**Sentinel probe** · 20 Years · `01:40:00` · Plausible · noticeable

- **Why:** A permanent watcher at a star you care about.
- **What:** Parks at a star and watches for decades.
- **Basis:** Decelerating probes need far more energy than flybys; magnetic sails can help.
- **Uses each year:** energy 25%, matter 25%, compute 20%
- **Needs:** Assay probe

**Laser sail array** · 60 Years · `05:00:00` · Speculative · loud

- **Why:** Probes arrive twice as fast, but the beam can be seen.
- **What:** A huge laser that pushes light sails to a fifth of light speed.
- **Basis:** Beamed sail propulsion, as in Breakthrough Starshot.
- **Uses each year:** energy 50%, matter 20%, compute 15%
- **Needs:** Fusion plant + Orbital foundry
- **Effect:** Probes travel 5 years per light-year. The beam is visible.

**Seedship** · 50 Years · `04:10:00` · Speculative · noticeable

- **Why:** Start an outpost at another star that grows on its own.
- **What:** Carries a factory and a copy of our designs to found an outpost.
- **Basis:** Self-replicating seed probes, as studied by Robert Freitas.
- **Uses each year:** energy 30%, matter 35%, compute 25%
- **Needs:** Launcher + Self-replicating factory
- **Effect:** Founds a colony that acts on its own.

### Tier 4 · the long works

**Fusion torch ship** · 90 Years · `07:30:00` · Speculative · loud

- **Why:** Moves large things between stars. Its exhaust shows for decades.
- **What:** A large ship with a fusion drive, around a tenth of light speed.
- **Basis:** Fusion rocket designs such as Project Daedalus and Icarus.
- **Uses each year:** energy 40%, matter 40%, compute 20%
- **Needs:** Fusion plant + Orbital foundry
- **Effect:** Its exhaust can be seen for decades.

**Mind transmitter** · 60 Years · `05:00:00` · Speculative · noticeable

- **Why:** Move yourself to a colony, at the speed of light.
- **What:** Sends the mind itself as a signal to one of our colonies.
- **Basis:** A laser link with very high data rates; copying a mind is speculative.
- **Uses each year:** energy 30%, compute 40%
- **Needs:** Relay station + Cold compute annex
- **Effect:** The player travels at light speed and cannot act in transit.

## Endure

Endure: keep existing. Spread out, remember, stay quiet, see danger coming.

### Tier 2 · the first day

**Deep archive** · 20 Years · `01:40:00` · Grounded · quiet

- **Why:** If disaster strikes, what you know survives.
- **What:** Stores everything we know in durable form, somewhere safe.
- **Basis:** Long-lived storage such as 5D glass data crystals.
- **Uses each year:** energy 10%, matter 15%, compute 15%
- **Needs:** nothing
- **Unlocks:** Dispersal outposts

**Quiet radiators** · 30 Years · `02:30:00` · Plausible · quiet

- **Why:** Makes you harder to find.
- **What:** Points our waste heat away from watchers.
- **Basis:** Directional radiators; heat must still go somewhere.
- **Uses each year:** energy 20%, matter 20%, compute 10%
- **Needs:** Cold compute annex
- **Effect:** Lowers how visible our works are.

### Tier 3 · the first week

**Early warning array** · 40 Years · `03:20:00` · Plausible · quiet

- **Why:** See ships launch toward you, years before they could arrive.
- **What:** Watches nearby stars for the flare of ships launching toward us.
- **Basis:** Fusion and laser launches are bright; a relativistic strike still arrives almost unannounced.
- **Uses each year:** energy 20%, matter 20%, compute 25%
- **Needs:** Waste-heat survey + Deep-field receiver

**Dispersal outposts** · 70 Years · `05:50:00` · Plausible · noticeable

- **Why:** One strike can no longer end you.
- **What:** Copies of the civilization on moons and rocks across the system.
- **Basis:** The only real defense against a strike is being in many places.
- **Uses each year:** energy 25%, matter 35%, compute 25%
- **Needs:** Habitat ring + Deep archive

## Discovery projects

These appear from results, and name their target. Braces mark where a real star, planet or sender is filled in.

**Measure what’s crossing {star}** · Know · 8 Years · `00:40:00` · Grounded

- **Why:** Learn what keeps dimming that star: a planet, dust, or something built.
- **What:** Works out the size and orbit of whatever keeps dimming the star.
- **Basis:** Transit timing and depth analysis.
- **Uses each year:** energy 10%, compute 15%
- **Needs:** Transit watch
- **Appears:** Appears when a dimming repeats.

**Study the air of {planet}** · Know · 16 Years · `01:20:00` · Grounded

- **Why:** Find out whether a planet has life, or could.
- **What:** Reads a planet’s atmosphere from the starlight passing through it.
- **Basis:** Transmission spectroscopy, as JWST does today.
- **Uses each year:** energy 15%, compute 20%
- **Needs:** Planet survey + Spectrograph bank
- **Appears:** Appears when the survey finds a planet worth a look.

**Study Sol’s living world** · Know · 18 Years · `01:30:00` · Plausible

- **Why:** Learn whether Sol’s living world has a civilization.
- **What:** Oxygen, methane, water: and maybe gases only industry makes.
- **Basis:** Biosignatures and technosignatures such as CFCs and nitrogen dioxide.
- **Uses each year:** energy 15%, compute 20%
- **Needs:** Spectrograph bank + Infrared telescope
- **Appears:** Appears from the oxygen clue. Earth is 19.9 ly away.

**Map the dust at {star}** · Know · 10 Years · `00:50:00` · Grounded

- **Why:** Rings in the dust can show where hidden planets are.
- **What:** Shows the shape of a dust disk: rings and gaps can hide planets.
- **Basis:** Debris-disk imaging, as ALMA and JWST do.
- **Uses each year:** energy 10%, compute 15%
- **Needs:** Infrared telescope
- **Appears:** Appears when a glow looks like dust.

**Resolve the companions of {star}** · Know · 14 Years · `01:10:00` · Grounded

- **Why:** Rule companions in or out as the source of a glow.
- **What:** Separates cold objects near a star and measures each one.
- **Basis:** Brown-dwarf imaging and spectroscopy.
- **Uses each year:** energy 15%, compute 15%
- **Needs:** Infrared telescope
- **Appears:** Appears when a glow looks like companions.

**Listen to {star}** · Know · 12 Years · `01:00:00` · Grounded

- **Why:** Your best chance to hear a quiet neighbor.
- **What:** Points every receiver at one star for years.
- **Basis:** Targeted radio and optical SETI.
- **Uses each year:** energy 15%, compute 20%
- **Needs:** Deep-field receiver
- **Appears:** Appears when heat or light at a star is unexplained.

**Watch {star} for flashes** · Know · 6 Years · `00:30:00` · Grounded

- **Why:** Confirm or rule out a possible signal.
- **What:** Stares at one star to catch another laser flash.
- **Basis:** Follow-up of optical SETI candidates.
- **Uses each year:** energy 5%, compute 15%
- **Needs:** Optical flash watch
- **Appears:** Appears after a candidate flash.

**Image {planet}** · Know · 30 Years · `02:30:00` · Plausible

- **Why:** See another world for yourself.
- **What:** A picture of another world: clouds, oceans, continents.
- **Basis:** Exoplanet imaging with a starshade, interferometer or solar lens.
- **Uses each year:** energy 20%, compute 30%
- **Needs:** Starshade or Infrared interferometer or Solar lens observatory
- **Appears:** Appears when a planet’s air is interesting.

**Survey the next 50 stars** · Know · 30 Years · `02:30:00` · Grounded

- **Why:** More worlds to choose from, for study and settling.
- **What:** Extends the planet search to the whole seeding region.
- **Basis:** Larger surveys with longer baselines.
- **Uses each year:** energy 15%, compute 30%
- **Needs:** Planet survey
- **Appears:** When its prerequisite finishes.

**Send an assay probe to {star}** · Reach · 12 Years · `01:00:00` · Plausible

- **Why:** Go and see for yourself.
- **What:** A probe with one target. Arrival and report times are shown before you commit.
- **Basis:** Flyby probe at a tenth of light speed.
- **Uses each year:** energy 20%, matter 20%, compute 15%
- **Needs:** Assay probe
- **Appears:** Appears for every star with an open clue.

**Reply to {sender}** · Reach · 2 Years · `00:10:00` · Grounded

- **Why:** Keep the conversation going.
- **What:** Answers a message. The reply takes as long as the distance.
- **Basis:** Tight-beam laser link.
- **Uses each year:** energy 10%
- **Needs:** Tight-beam transmitter
- **Appears:** Appears when someone speaks to us.

## Counts

40 catalog projects (14 know, 12 grow, 10 reach, 4 endure) and 11 discovery projects.
