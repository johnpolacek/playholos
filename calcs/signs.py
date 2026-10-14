"""What Earth can read of a neighbor's world from afar, and with what. Run: python3 calcs/signs.py 10   ('stats': 400 games, 'receiver': a receiver split among stars, 'closer': ways to know more, 'pictures': what each shows)

Settled 2026-10-13: physics alone. Each sign of minds needs its real instrument, however long that takes. Nothing is
hurried, and nothing guarantees a neighbor is known by any Year. Sources are in HOLOS_RESEARCH.md, "Reading air".

- Radio. A steady tone of P watts is heard to a range that grows as the square root of P and the fourth root of the
  listening time (calcs/early_game.py). Earth's own phone networks would be heard to 4 ly by its best array, and its
  aimed radars across the galaxy's near side (Sheikh et al. 2025).
- Smog. Nitrogen dioxide at today's level, on an Earth twin of a Sun twin at 10 pc, shows in about 400 hours on a 15 m
  mirror (Kopparapu et al. 2021). On a mirror like the Habitable Worlds Observatory's, 300 hours reach 5.7 ly for Earth's
  1980 peak, two to three times today's level (Sheikh et al. 2025). Lightning and soil make it too, and clouds can mimic
  it, so it moves the Mind's word and proves nothing.
- City lights. 300 hours on a 6 m mirror reach 0.036 ly at Earth's level (Sheikh et al. 2025). Out of reach.
- Industrial gases. In the mid-infrared, for an interferometer, at levels well above Earth's (Schwieterman et al. 2024,
  Haqq-Misra et al. 2025). No time is published for Earth's level, so none is modelled.
- Going. A flyby or a probe is the most conclusive way (Haqq-Misra et al. 2025).

This project's own: a neighbor's smog is taken to be like Earth's from its first radio on. Each mirror uses its own
published point, so the first telescope's times are for Earth's peak and the 15 m mirror's for today's level, which
makes the 15 m times the slower of the two. Times at other distances and worlds scale as an observation does in
calcs/observing.py. A listening campaign is capped at a Year. All are samples.
"""
import math, sys
import early_game as eg, neighbors as nb, observing, seed

# name, SEFD in Jy: the radio array Earth holds at Year 0, the SKA-class ground build, and the Moon's far side
EARS = (('Radio array, held', 10), ('Deep-field receiver', 1.1), ('Far-side array', 2 * 1380 * 30 / 5e8))
LISTEN_CAP = 365.25                      # days: the longest single listening campaign, a sample
# Settled 2026-10-13: the far-side array grows in stages. Each fifth takes 6 Years, FarView's builders say 4 to 8 for
# an array that size, and each hears farther: reach grows as the square root of the collecting area.
FAR_FIFTHS, FIFTH_YEARS = 5, 6
def far_sefd(fifths): return EARS[2][1] * FAR_FIFTHS / fifths
SMOG = ((6.5, 300, 5.71 / 3.2616), (15, 400, 10))           # mirror in metres, its published hours, and at how many parsecs
LOOK = 9.0                               # the Year the first pass ends

# Settled 2026-10-14: when the sweep marks a world, the Mind advises a deep-field receiver, and the player decides.
# Settled 2026-10-14: the receiver is split. The player names the stars it holds, and each part hears less far. It is
# the full SKA-Mid, a dish array, and real dish arrays split into parts this way (the SKA plans up to 16). Each part has
# a share of the area, so reach falls as the square root of the number of stars held. A dish array can't hold scattered
# stars at full reach: the beams it forms at once must lie inside each dish's view, about a degree at 1.4 GHz for a
# 15 m dish. Arrays of fixed antennas can (LOFAR), at low frequencies, sharing their bandwidth. Like every ground ear,
# a part hears its star only while that star is above the horizon.
RECEIVER_YEARS = 12                      # the first mock's price for a deep-field receiver
def held_reach(watts, seconds, stars=1):
    """Light-years at which a deep-field receiver split among `stars` hears a knock of `watts` lasting `seconds`."""
    return eg.beacon_range_ly(watts, EARS[1][1] * stars, 1, seconds)

def receiver_split(watts=1e10, seconds=4 * 3600):
    watch = eg.beacon_range_ly(watts, 12, 1, seconds)
    print(f'A deep-field receiver split among the stars it holds. A {watts:.0e} W knock lasting {seconds / 3600:g} hours is heard to:')
    for n in (1, 2, 4, 8, 11, 18):
        print(f'  {n:2} star{"s" if n > 1 else " "}: {held_reach(watts, seconds, n):4.0f} ly, {held_reach(watts, seconds, n) / watch:.1f} times the all-sky watch\'s {watch:.0f} ly')
    print(f'  Held on more than {(held_reach(watts, seconds) / watch) ** 2:.0f} stars, it hears no farther than the watch, which hears every star at every hour.')

# Settled 2026-10-14: a suspicion opens the whole kit. The player may do anything v1 allows, at any world, and the Mind
# says what it knows and what each act risks. The ways to know more, and when each answers:
# - A solar lens: a craft at the Sun's focal line, beyond 548 AU, pictures one world's surface. For an exo-Earth at 30 pc,
#   about 25 km a pixel in six months of looking, from a perihelion at about 150 km/s (Turyshev, NASA NIAC Phase III,
#   2020). One craft serves one star. Its build, 8 Years, and its want are samples. The flight is physics.
# - An infrared interferometer: gases only industry makes, at a few times Earth's level. v1's 40 Years, unchecked.
# - Sails from the laser array, and a knock: light-speed arithmetic.
AU_KM, LENS_AU, LENS_KMS = 1.496e8, 548, 150
LENS_BUILD, LENS_LOOK, INTERFEROMETER_YEARS = 8, 0.5, 40
LENS_FLIGHT = LENS_AU * AU_KM / LENS_KMS / 3.156e7                      # Years from perihelion to the focal line
def lens_km(d_pc): return 25 * d_pc / 30                               # a pixel's width on the world: it scales with distance

def ways_to_know(d, now, array_done, pace=1.0):
    """When each way answers for a world d ly away, from Year `now`. `pace`: the share of standard time a build takes."""
    lens = now + LENS_BUILD * pace + LENS_FLIGHT + LENS_LOOK
    return dict(lens=lens, interferometer=now + INTERFEROMETER_YEARS * pace, sails=max(now, array_done) + d / 0.2 + d,
                knock_lands=now + d, reply=now + 2 * d)

def look_closer(now=22.3, array_done=27.7):
    print(f'Ways to know more about a suspected world, from Year {now}. A lens flies {LENS_FLIGHT:.1f} Years to {LENS_AU} AU and looks for half a Year.')
    for star, d in (('Gliese 216 B', 29.4), ('Gliese 432 A', 31.2), ('12 Ophiuchi', 32.3), ('Gliese 1021', 49.1)):
        w = ways_to_know(d, now, array_done)
        print(f'  {star:13} {d:4.1f} ly · lens Year {w["lens"]:.0f}, {lens_km(d / 3.2616):.0f} km a pixel · interferometer Year {w["interferometer"]:.0f} · '
              f'sails\' word Year {w["sails"]:.0f} · a knock lands Year {w["knock_lands"]:.0f}, a reply from Year {w["reply"]:.0f}')

# Settled 2026-10-14: what a picture shows. Physics sets the pixel size, and the seed's world fills the pixels. The Mind
# names only what is larger than a pixel.
# - A lens: about 25 km a pixel for an exo-Earth at 30 pc (NASA NIAC 2020), scaling with distance.
# - A sail flyby: sub-arcsecond optics, about 0.4 arcseconds, so about 20 m from 10,000 km. With about 300 sails and the
#   target's orbit known to 100,000 km, at least one passes within a world's diameter. The swarm's sails aimed at other
#   planets miss by up to 100,000 km: about 200 m (Eubanks et al. 2026). The closest pass lasts under a minute.
# - Earth's own telescopes: a world is less than one pixel. They read its light, never its shapes.
# The sizes below are round figures from Earth's own surface: how wide each thing is.
FLYBY_ARCSEC = 0.4
def flyby_km(miss_km): return miss_km * FLYBY_ARCSEC / 206265
FEATURES = (  # what, how wide in km, the kinds of world that have it
    ('continents and seas', 1000, 'all'), ('cloud and ice', 300, 'air'), ('land colored by life', 100, 'life'),
    ('cleared land with straight edges', 30, 'industry'), ('cities', 30, 'industry'),
    ('lakes behind dams', 10, 'built'), ('dams', 1, 'built'), ('street grids', 0.1, 'built'), ('roads', 0.03, 'built'), ('single buildings', 0.01, 'built'))
KINDS = dict(bare={'all'}, airy={'all', 'air'}, living={'all', 'air', 'life'}, industrial={'all', 'air', 'life', 'industry', 'built'},
             collapsed={'all', 'air', 'life', 'built'})        # a world whose minds are gone: cleared land and grey cities grow over
def shows(kind, pixel_km):
    """What a picture shows of a world of this kind, at this pixel size: everything larger than a pixel."""
    return [what for what, km, has in FEATURES if has in KINDS[kind] and km > pixel_km]

def pictures():
    print('What a picture shows: everything larger than a pixel.')
    for way, px in (('Lens, 31 ly', lens_km(31 / 3.2616)), ('Lens, 49 ly', lens_km(49 / 3.2616)), ('Sails, typical pass', flyby_km(1e5)), ('Sails, nearest pass', flyby_km(1e4))):
        print(f'  {way:20} {px * 1000:7,.0f} m a pixel')
        for kind in ('living', 'industrial', 'collapsed'):
            print(f'    {kind:11} ' + ', '.join(shows(kind, px)))

def listen_days(watts, ly, sefd):
    """Days of listening to hear a steady tone, or None if a Year is not enough."""
    if not watts: return None
    days = (ly / eg.beacon_range_ly(watts, sefd, 1, 86400)) ** 4
    return days if days <= LISTEN_CAP else None

def smog_days(mirror, hours, at_pc, d_pc, radius, a, lum):
    """Days to read Earth-level smog: 'glare' if the mirror can't split the world, inf if over two months."""
    if a / d_pc * 1000 < 3.5 * observing.BANDS['green'] * 1e-6 / mirror * 206265 * 1000: return 'glare'
    days = hours / 24 * observing.ratio(d_pc, radius, a, lum) / observing.ratio(at_pc, 1, 1, 1)
    return days if days <= observing.CAP_D else math.inf

def read(p, year=LOOK):
    """One living neighbor as Earth sees it in a given Year: the light and radio arriving then left d years before."""
    n, d = p['n'], p['d']; left = seed.Y0 + year - d
    watts = nb.tone_at(n, p['waking'], left, p['targeted'])
    radius = n['world']['mass'] ** (1 / 3.7)
    industry = left >= p['waking'] - n['radio_since']
    out = dict(name=p['name'], star=p['host']['name'], d=d, left=left - p['waking'], watts=watts, industry=industry)
    for name, sefd in EARS: out[name] = listen_days(watts, d, sefd)
    for mirror, hours, at in SMOG:
        out[f'smog {mirror:g} m'] = smog_days(mirror, hours, at, d / 3.2616, radius, p['a'], p['host']['luminosity']) if industry else None
    return out

def tell(x):
    if x is None: return 'no'
    if x == 'glare': return 'in the glare'
    if x == math.inf: return 'over 2 months'
    return f'{x * 24:.0f} hours' if x < 2 else f'{x:.0f} days'

def report(g):
    rows = [read(p) for p in g['neighbors'] if not p['dead']]
    print(f"Seed {g['seed']}: what Earth could read of each living neighbor at Year {LOOK:.0f}. Times are how long each instrument must listen or look.")
    print(f"{'who':8} {'star':16} {'ly':>5} {'seen as':>24} {'tone':>9}  " + ''.join(f'{k:>20}' for k in rows[0] if k.startswith(('Radio', 'Deep', 'Far', 'smog'))))
    for r in sorted(rows, key=lambda r: r['d']):
        when = f"{-r['left']:.0f} y before waking" if r['left'] < 0 else f"{r['left']:.0f} y after waking"
        print(f"{r['name']:8} {r['star'][:16]:16} {r['d']:5.1f} {when:>24} {r['watts']:9.0e}  " + ''.join(f'{tell(v):>20}' for k, v in r.items() if k.startswith(('Radio', 'Deep', 'Far', 'smog'))))

def stats(rows, n=400):
    tot = dict(living=0, silent=0, held=0, deep=0, far=0, smog6=0, smog15=0, none=0)
    homes = dict(tot)
    for s in range(1, n + 1):
        g = seed.draw(s, rows)
        for p in g['neighbors']:
            if p['dead']: continue
            r = read(p)
            for bag in (tot, homes) if p['swept'] else (tot,):
                bag['living'] += 1; bag['silent'] += not r['watts']
                bag['held'] += r['Radio array, held'] is not None; bag['deep'] += r['Deep-field receiver'] is not None; bag['far'] += r['Far-side array'] is not None
                six, fifteen = (isinstance(r[k], float) and r[k] < math.inf for k in ('smog 6.5 m', 'smog 15 m'))
                bag['smog6'] += six; bag['smog15'] += fifteen
                bag['none'] += r['Far-side array'] is None and not fifteen
    stage = {k: [0, 0] for k in range(1, FAR_FIFTHS + 1)}
    for s in range(1, n + 1):
        for p in seed.draw(s, rows)['neighbors']:
            if p['dead']: continue
            watts = read(p)['watts']
            for k in stage:
                ok = listen_days(watts, p['d'], far_sefd(k)) is not None
                stage[k][0] += ok; stage[k][1] += ok and p['swept']
    print(f"The far-side array in fifths, {FIFTH_YEARS} Years each. Heard within a Year, of all living neighbors and of those the first pass sees:")
    for k, (a, b) in stage.items():
        print(f"  {k} fifth{'s' if k > 1 else ' '}: {a / tot['living']:4.0%} and {b / homes['living']:4.0%} · a 100 kW tone to {eg.beacon_range_ly(1e5, far_sefd(k), 1, 86400):3.0f} ly in a day, "
              f"a 10 kW tone to {eg.beacon_range_ly(1e4, far_sefd(k), 1, eg.YEAR):3.0f} ly in a Year")
    for label, b in (('all living neighbors', tot), ('those the first pass sees', homes)):
        L = b['living']; share = lambda k: 'none' if not b[k] else f'1 in {L / b[k]:,.0f}' if b[k] / L < 0.02 else f'{b[k] / L:.0%}'
        print(f"Across {n} games, {label}: {L / n:.1f} a game, as Earth sees them at Year {LOOK:.0f}.")
        print(f"  Radio, within a Year of listening: the held array hears {share('held')}, a deep-field receiver {share('deep')}, a far-side array {share('far')}.")
        print(f"  Smog, within two months: the 6.5 m mirror reads {share('smog6')}, a 15 m mirror {share('smog15')}.")
        print(f"  Not yet using radio: {share('silent')}. Out of reach of every one of these: {share('none')}.")

if __name__ == '__main__':
    rows = nb.load_hosts()
    if sys.argv[1:] == ['stats']: stats(rows)
    elif sys.argv[1:] == ['receiver']: receiver_split()
    elif sys.argv[1:] == ['closer']: look_closer()
    elif sys.argv[1:] == ['pictures']: pictures()
    else: report(seed.draw(int(sys.argv[1]) if sys.argv[1:] else 10, rows))
