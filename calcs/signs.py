"""What Earth can read of a neighbor's world from afar, and with what. Run: python3 calcs/signs.py   ('receiver': a receiver split among stars, 'closer': ways to know more; no word: what each picture shows)

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
# Each mirror's dark patch ends at so many wavelengths over its width: 48 for the 6.5 m (calcs/observing.py), and 64
# for a 15 m, as LUVOIR-A's coronagraph was drawn with 128-across mirrors. Settled 2026-10-16.
SMOG_OWA = {6.5: 48, 15: 64}
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
    if a / d_pc * 1000 > SMOG_OWA[mirror] * observing.BANDS['green'] * 1e-6 / mirror * 206265 * 1000: return 'beyond'
    days = hours / 24 * observing.ratio(d_pc, radius, a, lum) / observing.ratio(at_pc, 1, 1, 1)
    return days if days <= observing.CAP_D else math.inf

# Reading a neighbor's radio and smog, and the stats over 400 games, went with the roster, 2026-10-29. What stays is
# the physics: how far each ear hears a tone, how long a mirror takes on smog, and what a lens or flyby pictures.

if __name__ == '__main__':
    if sys.argv[1:] == ['receiver']: receiver_split()
    elif sys.argv[1:] == ['closer']: look_closer()
    else: pictures()
