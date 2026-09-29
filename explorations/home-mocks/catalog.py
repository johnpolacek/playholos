"""The Holos project catalog: one source for HOLOS_PROJECTS.md and the mocks page.

Hard science, speculative engineering. Every entry names a physical basis; the
`level` says how far past today's engineering it reaches:
  grounded     demonstrated, or built from demonstrated parts
  plausible    physics is sound; the engineering is unproven at this scale
  speculative  physics allows it; far beyond anything built
Energy and compute are yearly budgets: they cannot be stored at planetary
scale, so a running project takes a share of each year's supply. Matter is a
stockpile: a project draws its matter once, when it starts. In `cost`, E and C
are fixed amounts, as percents of the starting grid and data centers (1% of energy is
1 TW); as capacity grows, the same project takes a smaller share of each year.
M is converted to kilotonnes by tier (see matter_tonnes).
One game year is 5 real minutes. Visibility is what the project adds
to how detectable the civilization is: quiet, noticeable, or loud.
"""

PURPOSES = {
    'know': 'Know: learn what is out there, and answer the clues.',
    'grow': 'Grow: more energy, matter and compute every year, so everything goes faster.',
    'reach': 'Reach: touch other stars. Messages, probes, ships, and strikes.',
    'endure': 'Endure: keep existing. Spread out, remember, stay quiet, see danger coming, and stop it.',
}
TIERS = {1: 'Tier 1 · from the planet', 2: 'Tier 2 · into space', 3: 'Tier 3 · self-building industry', 4: 'Tier 4 · star-scale works'}

def P(id, name, purpose, tier, years, cost, what, basis, level, visibility, needs=(), effect=None, reveals=()):
    return dict(id=id, name=name, purpose=purpose, tier=tier, years=years, cost=cost, what=what, basis=basis,
                level=level, visibility=visibility, needs=list(needs), effect=effect, reveals=list(reveals))

# What every civilization starts with: Earth's instruments and industry today, plus about a century.
# Catalog projects are upgrades beyond it. (purpose, name, icon key, what it gives you, basis)
STARTING_KIT = [
    ('know', 'Sky watch', 'skywatch', 'The whole sky in light and radio, always on. Catches strong knocks and broadcasts.',
     'Whole-sky surveys such as Rubin and CHIME; PANOSETI is being built to catch nanosecond flashes.'),
    ('know', 'Space telescope', 'ir', 'One large telescope for light and heat.', 'JWST today; the Habitable Worlds Observatory is planned for the 2040s.'),
    ('know', 'Star surveys', 'survey', 'The big planets of the nearest stars, already mapped. The three clues came from here.', 'Gaia, HARPS, TESS and PLATO.'),
    ('know', 'Radio array', 'receiver', 'A radio telescope as wide as a continent.', 'The Square Kilometre Array, under construction.'),
    ('grow', 'Planetary grid', 'grid', 'All of each year’s energy: the 100% every project shares.', 'Today’s grids, a century further on.'),
    ('grow', 'Data centers', 'annex', 'Where the mind runs. All of each year’s compute.', 'Today’s data centers, a century further on.'),
    ('grow', 'Mines and heavy lift', 'lift', '1,240 kt of matter in orbit, and 40 kt more each year.', 'Reusable heavy lift, as Starship is being built to do.'),
    ('reach', 'Laser links', 'beam', 'Messages across the home system in hours.', 'NASA’s DSOC laser link, tested from deep space in 2023.'),
    ('reach', 'Precursor probes', 'probe', 'Two probes heading out. The farthest is 900 AU away.', 'Voyager 1 is about 170 AU out today.'),
]

PROJECTS = [
    # ---------- KNOW ----------
    P('transit-watch', 'Transit watch', 'know', 1, 4, 'E5 C10',
      'Stares at one star without a break, timing every dip the surveys catch only in passing.',
      'Continuous photometry, beyond the survey cadence of TESS and PLATO.', 'grounded', 'quiet',
      reveals=['measure-crossing']),
    P('spectrograph-bank', 'Spectrograph bank', 'know', 1, 8, 'E10 M5 C15',
      'Ultra-stable spectrographs: they read gases, and feel small planets tug their stars.',
      'Past ESPRESSO’s 10 cm/s goal: an Earth tugs a Sun-like star by about 9 cm/s.', 'grounded', 'quiet'),
    P('optical-flash-watch', 'Deep flash watch', 'know', 1, 6, 'E10 M5 C20',
      'Catches laser flashes a hundred times fainter than the sky watch can, anywhere in the sky.',
      'Optical SETI at scale, far beyond PANOSETI.', 'grounded', 'quiet',
      reveals=['watch-flashes']),
    P('deep-field-receiver', 'Deep-field receiver', 'know', 1, 12, 'E20 M15 C20',
      'A radio array far beyond the one we start with. Quiet neighbors stay hidden until you have it.',
      'Sensitivity grows with collecting area; this is many times the Square Kilometre Array.', 'grounded', 'quiet',
      effect='Lowers the detection floor for radio.', reveals=['listen-to']),
    P('planet-survey', 'Planet survey', 'know', 1, 14, 'E10 C25',
      'Finds Earth-sized planets around the 12 nearest stars. The big ones are already known.',
      'Precise radial velocity and astrometry, beyond today’s reach.', 'grounded', 'quiet',
      needs=['spectrograph-bank'], reveals=['study-air', 'survey-wider']),
    P('infrared-telescope', 'Infrared telescope', 'know', 1, 18, 'E25 M10 C15',
      'A cold telescope many times larger than the one we start with. Tells cold dust from warm companions, and by its spectrum dust, with its mineral bumps, from the smooth glow of machines.',
      'Cryogenic infrared telescopes, like JWST at far larger scale.', 'grounded', 'quiet',
      reveals=['map-dust', 'resolve-companions', 'listen-to']),
    P('waste-heat-survey', 'Waste-heat survey', 'know', 2, 16, 'E15 C25',
      'Checks every star in range for heat that nature does not explain.',
      'Infrared searches for megastructures, as in the Ĝ survey using WISE.', 'grounded', 'quiet',
      needs=['infrared-telescope'], reveals=['listen-to']),
    P('second-telescope', 'Second infrared telescope', 'know', 2, 14, 'E20 M15 C10',
      'A twin of the first, placed far away, so the two can work as one.',
      'Interferometry needs at least two separated collectors.', 'grounded', 'quiet',
      needs=['infrared-telescope', 'orbital-foundry']),
    P('starshade', 'Starshade', 'know', 2, 20, 'E20 M25 C15',
      'A flower-shaped screen that blocks a star so its planets show.',
      'Starshade designs studied by NASA, flown thousands of kilometers from a telescope.', 'plausible', 'quiet',
      needs=['infrared-telescope', 'orbital-foundry'], reveals=['image-planet']),
    P('pulsar-timing-array', 'Pulsar timing array', 'know', 2, 20, 'E10 C30',
      'Uses dead stars that tick like clocks to sense gravitational waves and navigate.',
      'Pulsar timing arrays such as NANOGrav.', 'grounded', 'quiet',
      needs=['deep-field-receiver'], effect='Probes can navigate between stars.'),
    P('neutrino-watch', 'Neutrino watch', 'know', 2, 24, 'E15 M30 C15',
      'Detects neutrinos. Sees into star cores and warns of nearby supernovae.',
      'Large neutrino detectors such as JUNO. Reactors light-years away are far too faint to detect.', 'grounded', 'quiet'),
    P('interferometer', 'Infrared interferometer', 'know', 3, 40, 'E25 M20 C30',
      'Links the two telescopes into one eye as wide as the gap between them. It pins down where a glow sits, so its temperature can be checked against what its star alone could make.',
      'Space interferometer concepts such as LIFE.', 'plausible', 'quiet',
      needs=['second-telescope'], reveals=['image-planet']),
    P('solar-lens-observatory', 'Solar lens observatory', 'know', 3, 70, 'E30 M20 C25',
      'Flies a telescope to where our star bends light like a lens. Sees one planet in detail.',
      'Gravitational lensing by a star; the focal line begins beyond about 550 AU for a Sun-like star (Turyshev and colleagues).', 'plausible', 'quiet',
      needs=['infrared-telescope', 'launcher'], effect='One target at a time; retargeting takes decades.',
      reveals=['image-planet']),
    P('kilometer-array', 'Kilometer interferometer', 'know', 4, 40, 'E35 M40 C35',
      'A fleet of mirrors spread across kilometers: surface maps of nearby planets.',
      'Large-baseline optical interferometry, scaled far beyond today.', 'speculative', 'quiet',
      needs=['interferometer', 'self-replicating-factory']),

    # ---------- GROW ----------
    P('orbital-solar-array', 'Orbital solar array', 'grow', 1, 10, 'M20 C5',
      'Collectors in orbit that beam power down.',
      'Space solar power, demonstrated in orbit by Caltech in 2023.', 'grounded', 'noticeable',
      effect='+20% energy every year.'),
    P('belt-prospecting', 'Belt prospecting', 'grow', 1, 6, 'E10 C10',
      'Finds which belt rocks are worth mining.',
      'Asteroid spectroscopy and sample return, as with OSIRIS-REx and Hayabusa2.', 'grounded', 'quiet'),
    P('cold-compute-annex', 'Cold compute annex', 'grow', 1, 12, 'E15 M15',
      'Computers cooled in a planet’s shadow waste less energy per thought.',
      'Cooler circuits approach the Landauer limit; reversible computing is unproven at scale.', 'plausible', 'quiet',
      effect='+25% compute every year.'),
    P('belt-mining', 'Belt mining', 'grow', 1, 20, 'E20 C10',
      'Metals from the belt, hauled to Veyra’s orbit.',
      'Asteroid mining; no one has done it yet, but every step is known.', 'plausible', 'quiet',
      needs=['belt-prospecting'], effect='+120 kt of matter every year.'),
    P('orbital-foundry', 'Orbital foundry', 'grow', 2, 30, 'E25 M30 C10',
      'Builds large things in space instead of lifting them off Veyra.',
      'In-space manufacturing, from today’s orbital 3D printers upward.', 'plausible', 'noticeable',
      needs=['belt-mining'], effect='Unlocks large works.'),
    P('mass-driver', 'Mass driver', 'grow', 2, 24, 'E20 M20 C5',
      'An electric track that throws cargo off a moon without rockets.',
      'Electromagnetic launch, as proposed by Gerard O’Neill; his lunar studies planned hundreds of thousands of tonnes a year.', 'plausible', 'quiet',
      needs=['belt-mining'], effect='+300 kt of matter every year, from a moon instead of the planet’s gravity well.'),
    P('ice-harvest', 'Ice harvest', 'grow', 2, 36, 'E20 M15 C10',
      'Water and fuel from the ice world at 9 AU.',
      'Volatiles mining from outer-system ices; deuterium is fusion fuel.', 'plausible', 'quiet',
      needs=['orbital-foundry'], effect='+60 kt of ice every year; supplies fusion fuel.'),
    P('fusion-plant', 'Fusion plant', 'grow', 2, 40, 'M25 C20',
      'Power from fusing light atoms. A large step up in energy.',
      'Deuterium fusion is physically sound; sustained net power is not yet demonstrated.', 'plausible', 'noticeable',
      needs=['ice-harvest'], effect='+60% energy every year.'),
    P('habitat-ring', 'Habitat ring', 'grow', 3, 60, 'E20 M40 C10',
      'A spinning ring in orbit: room for more minds and machines.',
      'Rotating habitats, as designed in NASA’s 1975 Stanford torus study.', 'plausible', 'noticeable',
      needs=['orbital-foundry', 'mass-driver'], effect='+30% compute; a second home in orbit.'),
    P('self-replicating-factory', 'Self-replicating factory', 'grow', 3, 80, 'E30 M30 C30',
      'Factories that build copies of themselves from belt rock.',
      'Von Neumann’s self-reproducing machines; no working example exists. NASA’s 1980 study assumed a lunar factory could copy itself in about a year.', 'speculative', 'noticeable',
      needs=['orbital-foundry', 'cold-compute-annex'], effect='Matter income doubles about every Year, as fast as physics allows, unless you slow it. Each doubling adds heat others can see.'),
    P('solar-swarm', 'Solar swarm', 'grow', 3, 30, 'E20 M50 C20',
      'Surrounds the star with collectors: enormous energy, and a heat glow others can see.',
      'A Dyson swarm. A full one takes about Mercury’s mass; Armstrong and Sandberg found self-copying industry could build it in decades. Its infrared excess is what searches like Ĝ look for.', 'speculative', 'loud',
      needs=['self-replicating-factory', 'mass-driver'], effect='Energy doubles about every Year as collectors copy themselves, up to the whole star: about four trillion times the starting grid for a Sun-like star. Compute can grow with it. Each doubling doubles the glow.'),
    P('star-lifting', 'Star lifting', 'grow', 4, 40, 'E40 M20 C30',
      'Pulls gas off the star itself for fuel and raw material.',
      'Star lifting, proposed by David Criswell. Physics allows it; the scale is vast.', 'speculative', 'loud',
      needs=['solar-swarm'], effect='The star becomes the mine: it holds more matter than every planet around it combined.'),

    # ---------- REACH ----------
    P('tight-beam', 'Tight-beam transmitter', 'reach', 1, 6, 'E15 C5',
      'Sends a private laser message to one known star.',
      'Scales up deep-space laser links like NASA’s DSOC to reach other stars.', 'grounded', 'quiet',
      effect='Only the target can read it. It still tells them we exist.', reveals=['reply-to', 'out-to', 'share-key']),
    P('broadcast-beacon', 'Broadcast beacon', 'reach', 1, 4, 'E20',
      'Announces us to every star in range, permanently.',
      'A powerful radio beacon, like the 1974 Arecibo message but sustained.', 'grounded', 'loud',
      effect='Everyone who can hear, will. It cannot be taken back.'),
    P('launcher', 'Launcher', 'reach', 2, 24, 'E25 M25 C10',
      'A launch rail and fuel depot that sends probes out of the system.',
      'Staged launch from orbit, built on the foundry.', 'plausible', 'noticeable',
      needs=['orbital-foundry'], reveals=['assay-to', 'feint-at']),
    P('relay-station', 'Relay station', 'reach', 2, 20, 'E15 M15 C10',
      'A repeater far from the star that carries messages farther.',
      'Relays reduce losses over distance; the Sun’s lens can also amplify signals.', 'plausible', 'quiet',
      needs=['launcher']),
    P('assay-probe', 'Flyby probe', 'reach', 2, 12, 'E20 M20 C15',
      'Flies past a star at a tenth of light speed, looks the whole way in, and beams home what it saw. Can’t stop.',
      'Fusion or sail-driven flyby probes: 10 years per light-year.', 'plausible', 'noticeable',
      needs=['launcher', 'pulsar-timing-array'], effect='One look, in passing.', reveals=['strike-at']),
    P('sentinel-probe', 'Sentinel probe', 'reach', 3, 20, 'E25 M25 C20',
      'Brakes with a magnetic sail against interstellar gas, then orbits its star and watches for decades.',
      'Magnetic sail braking, as proposed by Robert Zubrin and Dana Andrews: about 20 years per light-year.', 'plausible', 'noticeable',
      needs=['assay-probe'], effect='Stops and stays. Its braking may show.'),
    P('lurker-probe', 'Lurker', 'reach', 3, 20, 'E20 M20 C15',
      'Brakes like a sentinel, but stops in a system’s cold outskirts and watches from there.',
      'Magnetic sail braking; parks among comets or distant companions.', 'plausible', 'quiet',
      needs=['sentinel-probe'], effect='Nearly invisible. Sees less, from farther.', reveals=['nudge-rock']),
    P('close-watcher', 'Close watcher', 'reach', 3, 16, 'E15 M15 C15',
      'Moves in from the outskirts to find vaults, count weapons, and tell decoys from real sites.',
      'A working probe is warm among frozen comets, and shows from about 0.2 AU. The closer it goes, the likelier it is found.', 'plausible', 'quiet',
      needs=['lurker-probe'], effect='Its reports are light-time old, and its report beam points home.'),
    P('line-tap', 'Line tap', 'reach', 3, 12, 'E10 M10 C15',
      'Sits inside someone’s message beam, where it starts or where it lands, and copies what passes.',
      'A 10 m transmitter’s beam is still about 40,000 km wide at 1,000 AU.', 'plausible', 'quiet',
      needs=['lurker-probe'], effect='Reads everything until the line has a key it lacks. Then only who, when and how much.'),
    P('laser-sail-array', 'Laser sail array', 'reach', 3, 60, 'E50 M20 C15',
      'A huge laser that pushes light sails to a fifth of light speed.',
      'Beamed sail propulsion, as in Breakthrough Starshot.', 'speculative', 'loud',
      needs=['fusion-plant', 'orbital-foundry'], effect='Pushes chip swarms and starlight sails. The beam is visible.'),
    P('starlight-sail', 'Starlight sail', 'reach', 3, 10, 'E10 M5 C10',
      'A light sail that brakes on its target star’s light and gravity, then stays.',
      'Photogravitational braking, as modeled by René Heller and Michael Hippke: about 22 years per light-year.', 'speculative', 'quiet',
      needs=['laser-sail-array'], effect='Stops only at bright stars. Nearly invisible.'),
    P('chip-swarm', 'Chip swarm', 'reach', 3, 4, 'E30 C10',
      'Thousands of gram-sized sails, pushed by the laser array to a fifth of light speed.',
      'Breakthrough Starshot’s gram-scale sails.', 'speculative', 'loud',
      needs=['laser-sail-array'], effect='5 years per light-year. Can’t stop. The launch beam is visible.'),
    P('torch-probe', 'Torch probe', 'reach', 3, 24, 'E30 M30 C20',
      'Carries fusion fuel to brake hard: it arrives fast, and stops.',
      'Fusion rocket designs such as Project Daedalus and Icarus, with fuel kept for braking.', 'speculative', 'loud',
      needs=['fusion-plant', 'launcher'], effect='About 12 years per light-year. Its exhaust shows for years.'),
    P('seed-probe', 'Seed probe', 'reach', 3, 30, 'E25 M30 C25',
      'Stops, mines the target’s asteroids, and builds instruments or more probes there.',
      'Self-replicating seed probes, as studied by Robert Freitas.', 'speculative', 'noticeable',
      needs=['sentinel-probe', 'self-replicating-factory'], effect='About 25 years per light-year. Its industry warms up.'),
    P('seedship', 'Seedship', 'reach', 3, 50, 'E30 M35 C25',
      'Carries a factory and a copy of our designs to found an outpost.',
      'Self-replicating seed probes, as studied by Robert Freitas.', 'speculative', 'noticeable',
      needs=['launcher', 'self-replicating-factory'], effect='Founds a colony that acts on its own.'),
    P('fusion-torch-ship', 'Fusion torch ship', 'reach', 4, 90, 'E40 M40 C20',
      'A large ship with a fusion drive, around a tenth of light speed.',
      'Fusion rocket designs such as Project Daedalus and Icarus.', 'speculative', 'loud',
      needs=['fusion-plant', 'orbital-foundry'], effect='Its exhaust can be seen for decades.'),
    P('antimatter-probe', 'Antimatter probe', 'reach', 4, 40, 'E60 M10 C20',
      'The most efficient engine physics allows: fast out, and a hard stop.',
      'Antimatter rockets. Making the fuel takes a large share of a star’s output.', 'speculative', 'loud',
      needs=['solar-swarm', 'launcher'], effect='About 5 years per light-year, and it stops. Its exhaust gives off gamma rays.'),
    P('heavy-impactor', 'Heavy impactor', 'reach', 3, 30, 'E30 M40 C15',
      'A thousand tonnes of solid metal, thrown by a fusion torch that also steers it onto the planet in the last hours. No warhead: its speed is the weapon.',
      'Kinetic energy: at a fifth of light speed, each kilogram carries about 400 kilotons.', 'speculative', 'loud',
      needs=['torch-probe'], reveals=['strike-at', 'test-fire'],
      effect='A fifth of light speed hits a planet like a 2 km asteroid. An antimatter rocket reaches half; the star laser, nine tenths.'),
    P('decoys', 'Decoys', 'reach', 3, 10, 'E10 M10 C10',
      'Hollow twins that fly with a real impactor. Pickets cannot tell which one is heavy.',
      'In flight, shape and speed show; mass does not. Decoys are an old answer to missile defense.', 'plausible', 'quiet',
      needs=['heavy-impactor'], effect='Wastes a deflector laser’s shots. Cheap sand still screens them all.'),
    P('pellet-swarm', 'Pellet swarm', 'reach', 3, 16, 'E40 M5 C10',
      'Thousands of kilogram pellets pushed by the laser array to a fifth of light speed.',
      'Breakthrough Starshot’s sails, scaled from grams to kilograms.', 'speculative', 'loud',
      needs=['laser-sail-array'], effect='Screens cannot stop it. Strips a planet’s orbit; the air shields the ground.'),
    P('sleeper', 'Sleeper', 'reach', 3, 24, 'E25 M25 C20',
      'A lurker carrying its own impactors, waiting in another system’s outskirts.',
      'Magnetic sail braking to park, then a fusion stage to fire from close range.', 'speculative', 'quiet',
      needs=['lurker-probe', 'torch-probe'],
      effect='At a tenth of light speed from 1,000 AU: 52 days of warning, 43 real seconds. Its shot points at the sleeper.'),
    P('spoofer', 'Spoofer', 'reach', 3, 12, 'E10 M5 C10',
      'A lurker that fakes a launch flare from close by, to make a target react.',
      'A laser flash. Two telescopes far apart see it beside the star, not on it.', 'plausible', 'quiet',
      needs=['lurker-probe'], effect='Works on the unprepared. Once caught, the flash shows where the lurker is.'),
    P('far-platform', 'Far platform', 'reach', 4, 80, 'E30 M20 C30',
      'A weapons base founded somewhere empty, so its shots point there instead of home.',
      'A seedship colony chartered to build launchers. Pickets that time a bullet can work out its launch distance.', 'speculative', 'noticeable',
      needs=['seedship'], effect='Can frame a third civilization. It has its own mind: it may refuse, or strike on its own.'),
    P('spotter', 'Spotter', 'reach', 3, 16, 'E15 M10 C20',
      'A close watcher that guides an incoming strike with live positions.',
      'The strike’s steering stage takes the spotter’s fixes in its last hours.', 'speculative', 'quiet',
      needs=['close-watcher', 'heavy-impactor'], effect='Beats wandering habitats and decoy sites.'),
    P('star-laser', 'Star laser', 'reach', 4, 50, 'E30 M100 C40',
      'A sheet of film 100,000 km wide beside our star turns sunlight into laser light, every patch in step: one lens.',
      'Diffraction: an aperture that wide holds a beam to 4 km across 16 ly. Forward’s crewed sail design needed a laser this size.', 'speculative', 'quiet',
      needs=['self-replicating-factory', 'laser-sail-array', 'kilometer-array'], reveals=['paint'],
      effect='Arrives with its own light: no warning. Sweep heats a planet; needle hits one known site. Loud when it fires. Firing costs only compute to aim.'),
    P('mind-transmitter', 'Mind transmitter', 'reach', 4, 60, 'E30 C40',
      'Sends the mind itself as a signal to one of our colonies.',
      'A laser link with very high data rates; copying a mind is speculative.', 'speculative', 'noticeable',
      needs=['relay-station', 'cold-compute-annex'], effect='The player travels at light speed and cannot act in transit.'),

    # ---------- ENDURE ----------
    P('deep-vault', 'Deep vault', 'endure', 1, 10, 'E10 M10 C15',
      'A copy of the mind kilometers deep in a moon or large asteroid, kept in step with home by laser link.',
      'Heat soaks only tens of meters into rock in a decade. A heavy impactor can shatter a rock 100 km across; a moon shrugs it off.', 'plausible', 'quiet',
      effect='Running, it takes over at once and takes 10% compute a year, but its heat and link can be found. Sleeping, it is cold, hidden and free, and wakes when home goes silent. A needle reaches it only if its place is known.'),
    P('deep-archive', 'Deep archive', 'endure', 2, 20, 'E10 M15 C15',
      'Stores everything we know in durable form, somewhere safe.',
      'Long-lived storage such as 5D glass data crystals.', 'grounded', 'quiet'),
    P('quiet-radiators', 'Quiet radiators', 'endure', 2, 30, 'E20 M20 C10',
      'Points our waste heat away from watchers.',
      'Directional radiators; heat must still go somewhere.', 'plausible', 'quiet',
      needs=['cold-compute-annex'], effect='Lowers how visible our works are.'),
    P('early-warning-array', 'Early warning array', 'endure', 3, 40, 'E20 M20 C25',
      'Watches nearby stars for the flare of ships launching toward us.',
      'Fusion and laser launches are bright. The faster the strike, the less warning its flare gives.', 'plausible', 'quiet',
      needs=['waste-heat-survey', 'deep-field-receiver'], effect='Gives a launch’s direction, not its speed.'),
    P('dispersal-outposts', 'Dispersal outposts', 'endure', 3, 70, 'E25 M35 C25',
      'Copies of the civilization on moons and rocks across the system.',
      'Screens can fail and some strikes come unseen; being in many places is the backstop.', 'plausible', 'noticeable',
      needs=['habitat-ring', 'deep-archive']),
    P('comet-deflection', 'Comet deflection', 'endure', 2, 8, 'E10 M5 C10',
      'Keeps interceptors ready to push any rock on a collision course off it, years ahead.',
      'NASA’s DART, which shortened an asteroid moon’s orbit by 32 minutes in 2022.', 'grounded', 'quiet',
      effect='A few centimeters per second, a decade early, turns a hit into a miss.'),
    P('decoy-sites', 'Decoy sites', 'endure', 2, 12, 'E25 M10 C5',
      'Heaters on empty rocks that look like our works from light-years away.',
      'Faking a site’s heat takes as much energy as the site gives off, so decoys pair with quiet radiators on the real sites. Real works change, so decoys must be run like theater.', 'plausible', 'noticeable',
      needs=['orbital-foundry'], effect='Each costs an attacker a bullet; a needle can hit them all; a close watcher sees through them. While lit, each takes 5% energy a year. Pausing frees it.'),
    P('outskirts-sweep', 'Outskirts sweep', 'endure', 2, 16, 'E10 C20',
      'Searches our own outer system for hidden visitors. It usually finds nothing.',
      'A working lurker is warm among frozen comets, but shows only from about 0.2 AU. So the sweep watches for arrivals and acts.', 'plausible', 'quiet',
      needs=['infrared-telescope', 'deep-field-receiver'], effect='Catches spoofers and sleepers when they act. A find is a first contact.'),
    P('shielded-works', 'Shielded works', 'endure', 2, 10, 'E5 M15 C5',
      'Radiation shielding for everything in orbit.',
      'Spacecraft shielding: fast particles and X-rays stop in a centimeter of material.', 'grounded', 'quiet',
      needs=['orbital-foundry'], effect='Orbit shrugs off the spray from a stopped strike. Near-light sprays need meters of rock.'),
    P('pickets', 'Pickets', 'endure', 3, 30, 'E15 M10 C20',
      'Small cold watchers in a line out to 2,000 AU, toward one feared neighbor. The first line comes with it.',
      'A dark bullet still glows faintly where interstellar gas strikes its nose. Two fixes, far apart, give its exact path.', 'speculative', 'quiet',
      needs=['launcher', 'early-warning-array'], reveals=['guard-line'],
      effect='One line guards one planet against one direction. At a fifth of light speed: 23 days of warning, 19 real seconds.'),
    P('sand-screens', 'Sand screens', 'endure', 3, 12, 'E10 M5 C15',
      'Depots of sand that throw 10 tonnes into a bullet’s exact path, 10 million km out.',
      'At a fifth of light speed a gram of sand hits like 400 tonnes of TNT, so any contact shatters it.', 'plausible', 'quiet',
      needs=['mass-driver', 'pickets'],
      effect='The spray spreads past 100,000 km; under 1% hits the planet. Pellets slip through.'),
    P('deflector-laser', 'Deflector laser', 'endure', 3, 40, 'E50 M25 C20',
      'Burns a bullet’s skin so the escaping vapor pushes it off course.',
      'Laser ablation. Tens of terawatts on target, focused by a mirror kilometers wide.', 'speculative', 'loud',
      needs=['laser-sail-array', 'pickets'], effect='Beats a bullet that dodges. Firing lights the line back to the attacker.'),
    P('hunters', 'Hunters', 'endure', 3, 16, 'E20 M15 C20',
      'Fusion drones that chase intruders in our own system, to ram them or take them intact.',
      'A tonne at 100 km/s hits like a kiloton.', 'plausible', 'noticeable',
      needs=['fusion-plant', 'orbital-foundry'], effect='A captured spy shows its home, orders and designs, unless it destroys itself first. Posture: hunt on sight, watch, or hold fire.'),
    P('sunshade', 'Sunshade', 'endure', 3, 30, 'E15 M40 C10',
      'Heavy shades over the sites that matter, on the line toward a star laser.',
      'Shades at L1 have been studied for cooling Earth, by Roger Angel. The beam pushes a shade off station: one over a whole planet lasts about a week, a heavy one over a site a couple of months.', 'plausible', 'noticeable',
      needs=['orbital-foundry'], effect='Holds off the sweep for a while; the needle burns through. Too thin to stop a bullet. A shade shows watchers which sites matter.'),
    P('heat-shields', 'Heat shields', 'endure', 3, 14, 'E10 M15 C5',
      'Reflective shields for works in orbit.',
      'Parker Solar Probe’s shield takes about 475 times Earth’s sunlight.', 'grounded', 'quiet',
      needs=['orbital-foundry'], effect='Works in orbit survive a star laser’s sweep. Not the needle.'),
    P('wandering-habitats', 'Wandering habitats', 'endure', 3, 20, 'E20 M10 C15',
      'Habitats that make small random burns, so where they will be a year ahead is uncertain by 300,000 km.',
      'About 10 m/s of burns a year does it. A bullet sees a habitat too late to steer that far, and a needle must aim twice the light time ahead.', 'plausible', 'quiet',
      needs=['habitat-ring'], effect='Immune to aim from light-years: needles, blind bullets, pellets. A spotter’s live positions can still guide a bullet in.'),
    P('shadow-berths', 'Shadow berths', 'endure', 3, 16, 'E15 M10 C10',
      'Parks works behind a moon, as seen from a feared direction.',
      'Rock blocks everything. The shadow moves as the moon orbits, so the works move with it.', 'plausible', 'quiet',
      needs=['habitat-ring'], effect='Protects against one direction at a time.'),
    P('lifeboats', 'Lifeboats', 'endure', 4, 50, 'E25 M20 C20',
      'Seedships kept fueled, each with a copy of the mind, launched the moment a threat is seen.',
      'Seedships held ready. Flee sideways: exhaust aimed at the attacker shows them the escape.', 'speculative', 'noticeable',
      needs=['seedship'], effect='A coasting lifeboat is nearly invisible, so no attacker can confirm a kill.'),
    P('dead-hand', 'Dead hand', 'endure', 4, 60, 'E20 M20 C25',
      'Launchers at our outposts that fire back if home goes silent.',
      'A strike’s direction names its sender, unless a far platform framed someone else.', 'speculative', 'quiet',
      needs=['heavy-impactor', 'dispersal-outposts'], effect='Deters only those who know of it.'),
]

# Discovery projects: they appear only when a result opens them.
DISCOVERIES = [
    P('measure-crossing', 'Measure what’s crossing {star}', 'know', 1, 8, 'E10 C15',
      'Works out the size, orbit and color of whatever keeps dimming the star. Dust dims blue light more than red; a solid object dims every color equally.',
      'Transit timing, depth and color, as used in 2018 to show Boyajian’s star was dimmed by dust.', 'grounded', 'quiet', needs=['transit-watch'],
      effect='Appears when a dimming repeats.'),
    P('study-air', 'Study the air of {planet}', 'know', 2, 16, 'E15 C20',
      'Reads a planet’s atmosphere from the starlight passing through it.',
      'Transmission spectroscopy, as JWST does today.', 'grounded', 'quiet', needs=['planet-survey', 'spectrograph-bank'],
      effect='Appears when the survey finds a planet worth a look.'),
    P('study-sol', 'Study the oxygen world', 'know', 2, 18, 'E15 C20',
      'Oxygen, methane, water: and maybe gases only industry makes.',
      'Methane beside oxygen means life; CFCs or nitrogen dioxide mean industry. Earth-level nitrogen dioxide takes hundreds of hours to see at this distance.', 'plausible', 'quiet',
      needs=['spectrograph-bank', 'infrared-telescope'], effect='Appears from the oxygen clue. Earth is 19.9 ly away.'),
    P('map-dust', 'Map the dust at {star}', 'know', 1, 10, 'E10 C15',
      'Shows the shape of a dust disk: rings and gaps can hide planets.',
      'Debris-disk imaging, as ALMA and JWST do.', 'grounded', 'quiet', needs=['infrared-telescope'],
      effect='Appears when a glow looks like dust.'),
    P('resolve-companions', 'Resolve the companions of {star}', 'know', 2, 14, 'E15 C15',
      'Separates cold objects near a star and measures each one.',
      'Brown-dwarf imaging and spectroscopy.', 'grounded', 'quiet', needs=['infrared-telescope'],
      effect='Appears when a glow looks like companions.'),
    P('listen-to', 'Listen to {star}', 'know', 1, 12, 'E15 C20',
      'Points every receiver at one star for years.',
      'Targeted radio and optical SETI.', 'grounded', 'quiet', needs=['deep-field-receiver'],
      effect='Appears when heat or light at a star is unexplained.'),
    P('watch-flashes', 'Watch {star} for flashes', 'know', 1, 6, 'E5 C15',
      'Stares at one star to catch another laser flash.',
      'Follow-up of optical SETI candidates.', 'grounded', 'quiet', needs=['optical-flash-watch'],
      effect='Appears after a candidate flash.'),
    P('image-planet', 'Image {planet}', 'know', 3, 30, 'E20 C30',
      'A picture of another world: clouds, oceans, continents.',
      'Exoplanet imaging with a starshade, interferometer or solar lens.', 'plausible', 'quiet',
      needs=['starshade|interferometer|solar-lens-observatory'], effect='Appears when a planet’s air is interesting.'),
    P('survey-wider', 'Survey the next 50 stars', 'know', 2, 30, 'E15 C30',
      'Extends the planet search to the whole seeding region.',
      'Larger surveys with longer baselines.', 'grounded', 'quiet', needs=['planet-survey']),
    P('assay-to', 'Send a probe to {star}', 'reach', 2, 12, 'E20 M20 C15',
      'One probe, one target. Every type you have is compared, with its arrival and report times, before you commit.',
      'Any probe type you have built.', 'plausible', 'noticeable', needs=['assay-probe'],
      effect='Appears for every star with an open clue.'),
    P('strike-at', 'Strike {target}', 'reach', 2, 12, 'E20 M20 C15',
      'Every weapon you have is compared: its cost, arrival, the warning they get, who sees the launch, and whose name is on it. Shown here: an aimed flyby. A heavy bullet takes 10 Years and 10 Mt; a pellet volley 4 Years of laser; a sleeper, nothing more; the star laser, compute while it fires.',
      'Any weapon you have built, including a flyby probe aimed to hit instead of pass.', 'plausible', 'loud',
      needs=['assay-probe|heavy-impactor|pellet-swarm|sleeper'], effect='Appears when you know where a civilization is and have mapped its planet. A shot aimed only at a star misses.'),
    P('feint-at', 'Feint toward {star}', 'reach', 2, 4, 'E30 C5',
      'A real launch flare with nothing behind it.',
      'A launch’s power shows; its payload does not.', 'plausible', 'loud', needs=['launcher'],
      effect='Appears when you know where a civilization is. They must stay on alert until the slowest bullet would have passed.'),
    P('nudge-rock', 'Nudge a rock toward {planet}', 'reach', 3, 20, 'E5 C10',
      'Our lurker hovers beside a rock already passing near, and its gravity slowly pulls the rock onto a collision course.',
      'A gravity tractor, studied by NASA for planetary defense, run backward. It looks like nature.', 'plausible', 'quiet',
      needs=['lurker-probe'], effect='Appears when a lurker finds a rock passing near an inhabited world.'),
    P('out-to', 'Tell {recipient} where {civilization} is', 'reach', 1, 2, 'E10',
      'Outing: a lead, not proof. A broadcast outs us too; a tight beam, only to the recipient.',
      'Any transmitter. The recipient checks with its own instruments.', 'grounded', 'noticeable',
      needs=['tight-beam|broadcast-beacon'], effect='Appears when we know where a civilization is, and someone else to tell.'),
    P('share-key', 'Share a key with {civilization}', 'reach', 1, 2, 'E10 C5',
      'Makes our line with them private. By tight beam, unless a tap sat in exactly the right place; by courier, certain.',
      'A key used once is provably unbreakable. Carried in person, no one can copy it on the way.', 'grounded', 'quiet',
      needs=['tight-beam|sentinel-probe'], effect='Appears when we talk with a civilization. After it, a tap learns only who, when and how much.'),
    P('test-fire', 'Test-fire at {moon}', 'reach', 3, 10, 'E10 M5 C5',
      'Hits one of our own dead moons, so watchers see what we can do.',
      'An impact flash, visible to anyone watching closely.', 'plausible', 'loud', needs=['heavy-impactor']),
    P('paint', 'Paint {star}', 'reach', 4, 1, 'C10',
      'A brief, low-power pass of the star laser across their system.',
      'A thousandth of a sun blinds any instrument looking our way.', 'speculative', 'loud', needs=['star-laser'],
      effect='Shows we can reach them at light speed. They may read it as an attack.'),
    P('guard-line', 'Guard {planet} against {star}', 'endure', 3, 20, 'E10 M10 C10',
      'One more line of pickets toward a feared star, and depots near the planet it guards.',
      'One line guards one planet against one direction.', 'speculative', 'quiet', needs=['pickets'],
      effect='Appears for every planet we hold and every star we fear. About the cost of two heavy bullets.'),
    P('reply-to', 'Reply to {sender}', 'reach', 1, 2, 'E10',
      'Answers a message. The reply takes as long as the distance.',
      'Tight-beam laser link.', 'grounded', 'quiet', needs=['tight-beam'], effect='Appears when someone speaks to us.'),
]

# Why: the benefit to the player, in plain words.
WHY = {
    'transit-watch': 'Your quickest real answer: is a dimming a pattern or a fluke?',
    'spectrograph-bank': 'Reads what anything is made of. Most other Know projects build on it.',
    'optical-flash-watch': 'Hears knocks too faint for the sky watch: quieter senders, or farther ones.',
    'deep-field-receiver': 'Hear civilizations quieter than you. Without it, the sky stays silent.',
    'planet-survey': 'Shows which nearby stars have worlds worth studying, visiting or settling.',
    'infrared-telescope': 'Tells you whether a warm glow is natural, or someone’s machines.',
    'waste-heat-survey': 'Checks every nearby star at once for signs of big engineering.',
    'second-telescope': 'Doubles your infrared view and sets up the interferometer.',
    'starshade': 'See the planets themselves, not just their stars.',
    'pulsar-timing-array': 'Your probes can find their way between stars.',
    'neutrino-watch': 'Warns of a nearby supernova hours before its light arrives.',
    'interferometer': 'Sharp enough to pick out planets and measure them one by one.',
    'solar-lens-observatory': 'The sharpest view you can get of one chosen world.',
    'kilometer-array': 'Maps of other planets’ surfaces, from home.',
    'orbital-solar-array': 'More energy every year, so more projects can run at once.',
    'belt-prospecting': 'Shows where the metal is. Needed before mining.',
    'cold-compute-annex': 'More compute every year: faster answers, smarter probes.',
    'belt-mining': 'More matter every year, for building bigger things.',
    'orbital-foundry': 'Unlocks everything too big to launch from Veyra: probes, ships, big telescopes.',
    'mass-driver': 'Much more matter every year, without lifting it off Veyra.',
    'ice-harvest': 'Water and fusion fuel. Needed for fusion power.',
    'fusion-plant': 'A big jump in energy every year.',
    'habitat-ring': 'A second home in orbit: more compute, and a backup if Veyra is hit.',
    'self-replicating-factory': 'Industry that builds itself: matter stops being scarce.',
    'solar-swarm': 'Energy up to a whole star’s output, but everyone nearby can see you.',
    'star-lifting': 'The biggest mine there is: the star itself. Very visible.',
    'tight-beam': 'Talk to one known star without the whole sky hearing.',
    'broadcast-beacon': 'Everyone in range learns you exist: friends and threats alike.',
    'launcher': 'Required to send anything to another star.',
    'relay-station': 'Your messages and probe reports reach farther, and arrive clearer.',
    'assay-probe': 'See a star up close, soonest. The only way to be sure what is there.',
    'sentinel-probe': 'A permanent watcher at a star you care about.',
    'lurker-probe': 'Watch a star without being noticed.',
    'starlight-sail': 'Stop at a bright star, quietly, for almost nothing.',
    'chip-swarm': 'The fastest look, at many stars at once.',
    'torch-probe': 'Get there fast, and stay.',
    'seed-probe': 'Turn one probe into a foothold.',
    'antimatter-probe': 'The fastest way to arrive, and stop.',
    'laser-sail-array': 'Opens the fastest probes, but the beam can be seen.',
    'seedship': 'Start an outpost at another star that grows on its own.',
    'fusion-torch-ship': 'Moves large things between stars. Its exhaust shows for decades.',
    'mind-transmitter': 'Move yourself to a colony, at the speed of light.',
    'heavy-impactor': 'A weapon that can end a planet.',
    'decoys': 'Make every defense guess which bullet matters.',
    'pellet-swarm': 'Strip a system’s orbit where screens cannot help.',
    'sleeper': 'A gun already inside their system.',
    'spoofer': 'Make a rival flinch, and watch what it does.',
    'far-platform': 'Strike without your name on it.',
    'star-laser': 'The only weapon that arrives with no warning.',
    'deep-archive': 'If disaster strikes, what you know survives.',
    'quiet-radiators': 'Makes you harder to find.',
    'early-warning-array': 'See ships launch toward you, years before they could arrive.',
    'dispersal-outposts': 'One strike can no longer end you.',
    'deep-vault': 'Your first hedge: the mind survives a hit on Veyra.',
    'close-watcher': 'See what telescopes can’t: vaults, weapons, and which sites are fake.',
    'line-tap': 'Hear what a rival says to someone else.',
    'spotter': 'Hit what moves, and skip what’s fake.',
    'share-key': 'Talk without being overheard.',
    'guard-line': 'Guard another world, or another direction.',
    'comet-deflection': 'No rock, natural or nudged, lands on you.',
    'decoy-sites': 'Make attackers waste their shots.',
    'outskirts-sweep': 'Find out whether anyone is watching from your own dark.',
    'shielded-works': 'A stopped strike costs you nothing in orbit.',
    'pickets': 'Know a bullet’s exact path, days before it arrives.',
    'sand-screens': 'Stop a planet-killer with a few tonnes of sand.',
    'deflector-laser': 'Push a bullet aside at the speed of light.',
    'hunters': 'Kill what hides in your own system.',
    'sunshade': 'Take a star laser’s beam before it reaches you.',
    'heat-shields': 'Your orbit survives a star laser’s sweep.',
    'wandering-habitats': 'Homes that nobody can aim at from light-years away.',
    'shadow-berths': 'Hide your works behind a moon.',
    'lifeboats': 'Escape before the strike lands.',
    'dead-hand': 'Make striking you cost the striker.',
    'measure-crossing': 'Learn what keeps dimming that star: a planet, dust, or something built.',
    'study-air': 'Find out whether a planet has life, or could.',
    'study-sol': 'Learn whether the oxygen world has a civilization.',
    'map-dust': 'Rings in the dust can show where hidden planets are.',
    'resolve-companions': 'Rule companions in or out as the source of a glow.',
    'listen-to': 'Your best chance to hear a quiet neighbor.',
    'watch-flashes': 'Confirm or rule out a possible signal.',
    'image-planet': 'See another world for yourself.',
    'survey-wider': 'More worlds to choose from, for study and settling.',
    'assay-to': 'Go and see for yourself.',
    'reply-to': 'Keep the conversation going.',
    'strike-at': 'Hit them, knowing what it costs and who will know.',
    'feint-at': 'Test their nerve, and see what they do.',
    'nudge-rock': 'A strike that looks like nature.',
    'out-to': 'Let others find them for you.',
    'test-fire': 'Show your teeth, so no one tests them.',
    'paint': 'Show them you can reach them at light speed.',
}
for p_ in PROJECTS + DISCOVERIES: p_['why'] = WHY[p_['id']]

LEVEL_WORDS = {'grounded': 'Grounded', 'plausible': 'Plausible', 'speculative': 'Speculative'}

def real_time(years):
    """Real time as a countdown: one game year is 5 real minutes."""
    total = years * 5 * 60
    days, rest = divmod(total, 86400); h, rest = divmod(rest, 3600); m, sec = divmod(rest, 60)
    return (f'{days}d ' if days else '') + f'{h:02d}:{m:02d}:{sec:02d}'

TONNES_PER_POINT = {1: 20, 2: 200, 3: 2000, 4: 20000}   # kilotonnes per point of M
def matter_tonnes(p):
    """Matter drawn once at start, in kilotonnes. Sample amounts, scaled by tier."""
    points = sum(int(c[1:]) for c in p['cost'].split() if c[0] == 'M')
    return points * TONNES_PER_POINT[p['tier']]

def tonnes(kt):
    return f'{kt / 1000:,.0f} Mt' if kt >= 10000 else f'{kt:,} kt'

def cost_text(p):
    parts = [f'{"energy" if c[0] == "E" else "compute"} {c[1:]}% a year' for c in p['cost'].split() if c[0] in 'EC']
    if matter_tonnes(p): parts.append(f'{tonnes(matter_tonnes(p))} of matter at start')
    return ', '.join(parts)

def cost_chips(p):
    parts = [f'{c[0]} {c[1:]}%' for c in p['cost'].split() if c[0] in 'EC']
    if matter_tonnes(p): parts.append(tonnes(matter_tonnes(p)))
    return ' · '.join(parts)

def unlocks(pid):
    everything = PROJECTS + DISCOVERIES
    return [p['name'] for p in everything if any(pid in n.split('|') for n in p['needs'])]

def card(p, names):
    need = ' + '.join(' or '.join(names[x] for x in n.split('|')) for n in p['needs'])
    opens = unlocks(p['id'])
    return (f'<article class="ccard {p["purpose"]}"><header><b>{p["name"]}</b><span class="ctime"><span class="gy">{p["years"]} Years</span> <span class="rtime">{real_time(p["years"])}</span></span></header>'
            f'<p class="why">{p["why"]}</p><p>{p["what"]}</p><p class="basis">{p["basis"]}</p>'
            f'<div class="tags"><span class="lvl {p["level"]}">{LEVEL_WORDS[p["level"]]}</span><span class="vis {p["visibility"]}">{p["visibility"]}</span><span class="mono">{cost_chips(p)}</span></div>'
            + (f'<p class="rel"><b>Needs</b> {need}</p>' if need else '')
            + (f'<p class="rel"><b>Unlocks</b> {", ".join(opens)}</p>' if opens else '')
            + (f'<p class="rel"><b>Effect</b> {p["effect"]}</p>' if p['effect'] else '') + '</article>')

def html():
    names = {p['id']: p['name'] for p in PROJECTS + DISCOVERIES}
    out = ['<div class="catalog">']
    for purpose, blurb in PURPOSES.items():
        out.append(f'<h3 class="cp">{blurb}</h3>')
        for tier in (1, 2, 3, 4):
            group = [p for p in PROJECTS if p['purpose'] == purpose and p['tier'] == tier]
            if group: out.append(f'<h4>{TIERS[tier]}</h4><div class="cgrid">' + ''.join(card(p, names) for p in group) + '</div>')
    out.append('<h3 class="cp">Discovery projects: they appear when a result opens them, and name their target.</h3><div class="cgrid">'
               + ''.join(card(p, names) for p in DISCOVERIES) + '</div></div>')
    return ''.join(out)

def sections():
    """The catalog as page sections: one per purpose, then discoveries."""
    names = {p['id']: p['name'] for p in PROJECTS + DISCOVERIES}
    out = []
    for purpose, blurb in PURPOSES.items():
        body = ''.join(f'<h4>{TIERS[tier]}</h4><div class="cgrid">' + ''.join(card(p, names) for p in group) + '</div>'
                       for tier in (1, 2, 3, 4) for group in [[p for p in PROJECTS if p['purpose'] == purpose and p['tier'] == tier]] if group)
        out.append((purpose, purpose.title(), blurb, f'<div class="catalog">{body}</div>'))
    out.append(('discoveries', 'Discoveries', 'Discovery projects appear when a result opens them, and name their target.',
                '<div class="catalog"><div class="cgrid">' + ''.join(card(p, names) for p in DISCOVERIES) + '</div></div>'))
    return out

def markdown():
    names = {p['id']: p['name'] for p in PROJECTS + DISCOVERIES}
    need_names = lambda needs: ' + '.join(' or '.join(names[x] for x in n.split('|')) for n in needs) or 'nothing'
    out = ['# Holos: project catalog', '',
           'September 28, 2026. A design catalog, generated from `explorations/home-mocks/catalog.py`. Edit the data there, then run `python3 explorations/home-mocks/build-zoom.py`.', '',
           '**Projects are how you know, grow and reach**, and later how you endure. Every entry leads with its **why**: the benefit to the player, in plain words. Each one takes a share of every year’s energy and compute while it runs, draws matter from the stockpile once when it starts, and takes game time that passes as real time. Game time is written in words, like 18 Years; real time is written as a countdown, like `01:30:00`. One Year is `00:05:00`.', '',
           'Everything here is hard science with speculative engineering. **Level** says how far each reaches: *grounded* is demonstrated or built from demonstrated parts; *plausible* is sound physics with unproven engineering at this scale; *speculative* is allowed by physics but far beyond anything built. **Visibility** is what the project adds to how easily others could detect us.', '',
           '## What every civilization starts with', '',
           'Earth’s instruments and industry today, plus about a century. Every project below is an upgrade beyond this kit. The kit found the opening clues, and it catches strong knocks.', '']
    out += [f'- **{name}** ({purpose.title()}): {what} *{basis}*' for purpose, name, _, what, basis in STARTING_KIT]
    out += ['',
           '## How unlocks work', '',
           '- **Building unlocks** follow fixed chains: you need the tools first. The foundry comes before anything large in space; a launcher before any probe.',
           '- **Discovery projects** appear only when a result opens them, and target a specific star or planet. They are listed at the end.',
           '- Locked projects stay visible with the reason: “Needs: orbital foundry.”',
           '- **Energy and compute are yearly budgets;** neither can be stored at planetary scale, so a running project takes a share of every year’s supply, and pausing frees it. **Percentages are of the starting budgets:** 1% of energy is 1 TW. As capacity grows, the same project takes a smaller share. **Matter is a stockpile:** a project draws its matter once when it starts. Amounts are sample values, in kilotonnes (kt) and megatonnes (Mt).',
           '- **Tiers are stages,** not clock times: from the planet, while matter is lifted off it; into space, once the foundry builds there; self-building industry, once factories copy themselves and matter compounds; and star-scale works.', '']
    for purpose, blurb in PURPOSES.items():
        out += [f'## {purpose.title()}', '', blurb, '']
        for tier in (1, 2, 3, 4):
            group = [p for p in PROJECTS if p['purpose'] == purpose and p['tier'] == tier]
            if not group: continue
            out += [f'### {TIERS[tier]}', '']
            for p in group:
                out += [f'**{p["name"]}** · {p["years"]} Years · `{real_time(p["years"])}` · {LEVEL_WORDS[p["level"]]} · {p["visibility"]}', '',
                        f'- **Why:** {p["why"]}',
                        f'- **What:** {p["what"]}',
                        f'- **Basis:** {p["basis"]}',
                        f'- **Uses:** {cost_text(p)}',
                        f'- **Needs:** {need_names(p["needs"])}']
                if p['effect']: out.append(f'- **Effect:** {p["effect"]}')
                opens = [n for n in unlocks(p['id']) if n not in {names[r] for r in p['reveals']}]
                if opens: out.append(f'- **Unlocks:** {", ".join(opens)}')
                if p['reveals']: out.append(f'- **Can open:** {", ".join(names[r] for r in p["reveals"])}')
                out.append('')
    out += ['## Discovery projects', '', 'These appear from results, and name their target. Braces mark where a real star, planet or sender is filled in.', '']
    for p in DISCOVERIES:
        out += [f'**{p["name"]}** · {p["purpose"].title()} · {p["years"]} Years · `{real_time(p["years"])}` · {LEVEL_WORDS[p["level"]]}', '',
                f'- **Why:** {p["why"]}', f'- **What:** {p["what"]}', f'- **Basis:** {p["basis"]}', f'- **Uses:** {cost_text(p)}',
                f'- **Needs:** {need_names(p["needs"])}', f'- **Appears:** {p["effect"] or "When its prerequisite finishes."}', '']
    counts = {k: sum(p['purpose'] == k for p in PROJECTS) for k in PURPOSES}
    out += ['## Counts', '', f'{len(PROJECTS)} catalog projects ({", ".join(f"{v} {k}" for k, v in counts.items())}) and {len(DISCOVERIES)} discovery projects.', '']
    return '\n'.join(out)
