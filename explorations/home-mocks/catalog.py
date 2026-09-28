"""The Holos project catalog: one source for HOLOS_PROJECTS.md and the mocks page.

Hard science, speculative engineering. Every entry names a physical basis; the
`level` says how far past today's engineering it reaches:
  grounded     demonstrated, or built from demonstrated parts
  plausible    physics is sound; the engineering is unproven at this scale
  speculative  physics allows it; far beyond anything built
Energy and compute are yearly budgets: they cannot be stored at planetary
scale, so a running project takes a share of each year's supply. Matter is a
stockpile: a project draws its matter once, when it starts. In `cost`, E and C
are percent shares; M is converted to kilotonnes by tier (see matter_tonnes).
One game year is 5 real minutes. Visibility is what the project adds
to how detectable the civilization is: quiet, noticeable, or loud.
"""

PURPOSES = {
    'know': 'Know: learn what is out there, and answer the clues.',
    'grow': 'Grow: more energy, matter and compute every year, so everything goes faster.',
    'reach': 'Reach: touch other stars. Messages, probes, ships.',
    'endure': 'Endure: keep existing. Spread out, remember, stay quiet, see danger coming.',
}
TIERS = {1: 'Tier 1 · the first session', 2: 'Tier 2 · the first day', 3: 'Tier 3 · the first week', 4: 'Tier 4 · the long works'}

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
      'A cold telescope many times larger than the one we start with. Tells cold dust from warm companions.',
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
      'Links the two telescopes into one eye as wide as the gap between them.',
      'Space interferometer concepts such as LIFE.', 'plausible', 'quiet',
      needs=['second-telescope'], reveals=['image-planet']),
    P('solar-lens-observatory', 'Solar lens observatory', 'know', 3, 70, 'E30 M20 C25',
      'Flies a telescope to where our star bends light like a lens. Sees one planet in detail.',
      'Gravitational lensing by a star; the focal line begins beyond about 550 AU for a Sun-like star (Turyshev and colleagues).', 'plausible', 'quiet',
      needs=['infrared-telescope', 'launcher'], effect='One target at a time; retargeting takes decades.',
      reveals=['image-planet']),
    P('kilometer-array', 'Kilometer interferometer', 'know', 4, 160, 'E35 M40 C35',
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
      'Electromagnetic launch, as proposed by Gerard O’Neill.', 'plausible', 'quiet',
      needs=['belt-mining'], effect='Halves the matter cost of works in orbit.'),
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
      'Von Neumann’s self-reproducing machines; no working example exists.', 'speculative', 'noticeable',
      needs=['orbital-foundry', 'cold-compute-annex'], effect='Every Grow project after this is 40% faster.'),
    P('solar-swarm', 'Solar swarm', 'grow', 3, 120, 'E20 M50 C20',
      'Surrounds the star with collectors: enormous energy, and a heat glow others can see.',
      'A Dyson swarm. Its infrared excess is exactly what searches like Ĝ look for.', 'speculative', 'loud',
      needs=['self-replicating-factory', 'mass-driver'], effect='Energy ×4. Visible as warm glow for light-years.'),
    P('star-lifting', 'Star lifting', 'grow', 4, 240, 'E40 M20 C30',
      'Pulls gas off the star itself for fuel and raw material.',
      'Star lifting, proposed by David Criswell. Physics allows it; the scale is vast.', 'speculative', 'loud',
      needs=['solar-swarm'], effect='Triples matter income.'),

    # ---------- REACH ----------
    P('tight-beam', 'Tight-beam transmitter', 'reach', 1, 6, 'E15 C5',
      'Sends a private laser message to one known star.',
      'Scales up deep-space laser links like NASA’s DSOC to reach other stars.', 'grounded', 'quiet',
      effect='Only the target can read it. It still tells them we exist.', reveals=['reply-to']),
    P('broadcast-beacon', 'Broadcast beacon', 'reach', 1, 4, 'E20',
      'Announces us to every star in range, permanently.',
      'A powerful radio beacon, like the 1974 Arecibo message but sustained.', 'grounded', 'loud',
      effect='Everyone who can hear, will. It cannot be taken back.'),
    P('launcher', 'Launcher', 'reach', 2, 24, 'E25 M25 C10',
      'A launch rail and fuel depot that sends probes out of the system.',
      'Staged launch from orbit, built on the foundry.', 'plausible', 'noticeable',
      needs=['orbital-foundry'], reveals=['assay-to']),
    P('relay-station', 'Relay station', 'reach', 2, 20, 'E15 M15 C10',
      'A repeater far from the star that carries messages farther.',
      'Relays reduce losses over distance; the Sun’s lens can also amplify signals.', 'plausible', 'quiet',
      needs=['launcher']),
    P('assay-probe', 'Assay probe', 'reach', 2, 12, 'E20 M20 C15',
      'Flies to a star, looks, and reports back. Travel adds 10 years per light-year.',
      'Fusion or sail-driven flyby probes at a tenth of light speed.', 'plausible', 'noticeable',
      needs=['launcher', 'pulsar-timing-array']),
    P('sentinel-probe', 'Sentinel probe', 'reach', 3, 20, 'E25 M25 C20',
      'Parks at a star and watches for decades.',
      'Decelerating probes need far more energy than flybys; magnetic sails can help.', 'plausible', 'noticeable',
      needs=['assay-probe']),
    P('laser-sail-array', 'Laser sail array', 'reach', 3, 60, 'E50 M20 C15',
      'A huge laser that pushes light sails to a fifth of light speed.',
      'Beamed sail propulsion, as in Breakthrough Starshot.', 'speculative', 'loud',
      needs=['fusion-plant', 'orbital-foundry'], effect='Probes travel 5 years per light-year. The beam is visible.'),
    P('seedship', 'Seedship', 'reach', 3, 50, 'E30 M35 C25',
      'Carries a factory and a copy of our designs to found an outpost.',
      'Self-replicating seed probes, as studied by Robert Freitas.', 'speculative', 'noticeable',
      needs=['launcher', 'self-replicating-factory'], effect='Founds a colony that acts on its own.'),
    P('fusion-torch-ship', 'Fusion torch ship', 'reach', 4, 90, 'E40 M40 C20',
      'A large ship with a fusion drive, around a tenth of light speed.',
      'Fusion rocket designs such as Project Daedalus and Icarus.', 'speculative', 'loud',
      needs=['fusion-plant', 'orbital-foundry'], effect='Its exhaust can be seen for decades.'),
    P('mind-transmitter', 'Mind transmitter', 'reach', 4, 60, 'E30 C40',
      'Sends the mind itself as a signal to one of our colonies.',
      'A laser link with very high data rates; copying a mind is speculative.', 'speculative', 'noticeable',
      needs=['relay-station', 'cold-compute-annex'], effect='The player travels at light speed and cannot act in transit.'),

    # ---------- ENDURE ----------
    P('deep-archive', 'Deep archive', 'endure', 2, 20, 'E10 M15 C15',
      'Stores everything we know in durable form, somewhere safe.',
      'Long-lived storage such as 5D glass data crystals.', 'grounded', 'quiet'),
    P('quiet-radiators', 'Quiet radiators', 'endure', 2, 30, 'E20 M20 C10',
      'Points our waste heat away from watchers.',
      'Directional radiators; heat must still go somewhere.', 'plausible', 'quiet',
      needs=['cold-compute-annex'], effect='Lowers how visible our works are.'),
    P('early-warning-array', 'Early warning array', 'endure', 3, 40, 'E20 M20 C25',
      'Watches nearby stars for the flare of ships launching toward us.',
      'Fusion and laser launches are bright; a relativistic strike still arrives almost unannounced.', 'plausible', 'quiet',
      needs=['waste-heat-survey', 'deep-field-receiver']),
    P('dispersal-outposts', 'Dispersal outposts', 'endure', 3, 70, 'E25 M35 C25',
      'Copies of the civilization on moons and rocks across the system.',
      'The only real defense against a strike is being in many places.', 'plausible', 'noticeable',
      needs=['habitat-ring', 'deep-archive']),
]

# Discovery projects: they appear only when a result opens them.
DISCOVERIES = [
    P('measure-crossing', 'Measure what’s crossing {star}', 'know', 1, 8, 'E10 C15',
      'Works out the size and orbit of whatever keeps dimming the star.',
      'Transit timing and depth analysis.', 'grounded', 'quiet', needs=['transit-watch'],
      effect='Appears when a dimming repeats.'),
    P('study-air', 'Study the air of {planet}', 'know', 2, 16, 'E15 C20',
      'Reads a planet’s atmosphere from the starlight passing through it.',
      'Transmission spectroscopy, as JWST does today.', 'grounded', 'quiet', needs=['planet-survey', 'spectrograph-bank'],
      effect='Appears when the survey finds a planet worth a look.'),
    P('study-sol', 'Study the oxygen world', 'know', 2, 18, 'E15 C20',
      'Oxygen, methane, water: and maybe gases only industry makes.',
      'Biosignatures and technosignatures such as CFCs and nitrogen dioxide.', 'plausible', 'quiet',
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
    P('assay-to', 'Send an assay probe to {star}', 'reach', 2, 12, 'E20 M20 C15',
      'A probe with one target. Arrival and report times are shown before you commit.',
      'Flyby probe at a tenth of light speed.', 'plausible', 'noticeable', needs=['assay-probe'],
      effect='Appears for every star with an open clue.'),
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
    'mass-driver': 'Makes building in orbit much cheaper.',
    'ice-harvest': 'Water and fusion fuel. Needed for fusion power.',
    'fusion-plant': 'A big jump in energy every year.',
    'habitat-ring': 'A second home in orbit: more compute, and a backup if Veyra is hit.',
    'self-replicating-factory': 'Every growth project after it goes much faster.',
    'solar-swarm': 'Four times the energy, but everyone nearby can see you.',
    'star-lifting': 'Three times the matter, from the star itself. Very visible.',
    'tight-beam': 'Talk to one known star without the whole sky hearing.',
    'broadcast-beacon': 'Everyone in range learns you exist: friends and threats alike.',
    'launcher': 'Required to send anything to another star.',
    'relay-station': 'Your messages and probe reports reach farther, and arrive clearer.',
    'assay-probe': 'See a star up close. The only way to be sure what is there.',
    'sentinel-probe': 'A permanent watcher at a star you care about.',
    'laser-sail-array': 'Probes arrive twice as fast, but the beam can be seen.',
    'seedship': 'Start an outpost at another star that grows on its own.',
    'fusion-torch-ship': 'Moves large things between stars. Its exhaust shows for decades.',
    'mind-transmitter': 'Move yourself to a colony, at the speed of light.',
    'deep-archive': 'If disaster strikes, what you know survives.',
    'quiet-radiators': 'Makes you harder to find.',
    'early-warning-array': 'See ships launch toward you, years before they could arrive.',
    'dispersal-outposts': 'One strike can no longer end you.',
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
           'September 26, 2026. A design catalog, generated from `explorations/home-mocks/catalog.py`. Edit the data there, then run `python3 explorations/home-mocks/build-zoom.py`.', '',
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
           '- **Energy and compute are yearly budgets;** neither can be stored at planetary scale, so a running project takes a share of every year’s supply, and pausing frees it. **Matter is a stockpile:** a project draws its matter once when it starts. Amounts are sample values, in kilotonnes (kt) and megatonnes (Mt).',
           '- Tiers group projects by how far into a game they usually come.', '']
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
