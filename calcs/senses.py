"""Senses: great instruments that each settle one open question. Run: python3 calcs/senses.py

Settled 2026-11-11, the designer's picks. Sources in HOLOS_RESEARCH.md, "New senses". Each number is from a published
estimate or marked a sample.
"""
import math

# ── The Deep Ice Watch ──
# MICA, Boser et al. 2015: 127 strings of 300 light sensors each, 2,150 to 2,450 m down in the South Pole's ice, inside
# IceCube. About 10 Mt of ice that counts, and about 5 years to build.
STRINGS, MODULES_A_STRING, ICE_MT = 127, 300, 10
ICE_YEARS = 5
# Its price is ours: the paper gives none. IceCube's 5,160 sensors on 86 strings cost $279 million to build (IceCube,
# NSF). By the sensor that is about $2 billion, a fifth of a flagship. MICA wants cheaper sensors than IceCube's, so this
# is a ceiling, held as a sample.
ICECUBE_USD, ICECUBE_MODULES, FLAGSHIP_USD = 279e6, 5160, 11e9
ICE_USD = ICECUBE_USD / ICECUBE_MODULES * STRINGS * MODULES_A_STRING
ICE_WANT = round(ICE_USD / FLAGSHIP_USD, 1)

# How far it hears. A star that explodes: 6.6 to 9.3 Mpc. One that dies dark runs hotter, so 25.5 Mpc (Boser et al. 2015).
BRIGHT_MPC, DARK_MPC = 9.3, 25.5
# Stars it hears explode: 10 to 41 a decade (Boser et al. 2015). A sample: 2 a Year, where 1 to 2 a Year are seen
# within 10 to 11 Mpc (Botticella et al. 2012, Horiuchi et al. 2013).
BRIGHT_A_YEAR = 2.0
# The share of heavy stars that die dark, straight to a black hole with no flash. The designer's pick, 2026-11-11: 1 in
# 6. Stars seen to vanish give 0.16 (Neustadt et al. 2021), black hole masses 0.18 (Kochanek 2015), simple models 0.18
# to 0.29 (Kresse et al. 2021). The evidence runs from about none to about 4 in 10.
DARK_SHARE = 1 / 6
# Dark deaths it hears: MICA's 17 to 35 a decade assume 1 in 10. Scaled to our share, ours.
MICA_DARK_DECADE, MICA_SHARE = (17, 35), 0.10
DARK_A_YEAR = sum(MICA_DARK_DECADE) / 2 / 10 * DARK_SHARE / MICA_SHARE
# Dark deaths near enough to read, within the reach of a star that explodes: there a dark death gives about 20
# neutrinos or more, enough to see them run hot and stop short. By the share itself, so what we measure near is the share.
NEAR_A_YEAR = BRIGHT_A_YEAR * DARK_SHARE / (1 - DARK_SHARE)
# A dark death is sure only once a telescope finds the star gone. A Year, a sample: N6946-BH1 faded over several.
CONFIRM_YEARS = 1
# The share is settled once its 90% range is within a third of itself, ours: so many dark deaths read near.
SETTLE_AT = math.ceil((1.645 * 3) ** 2 * (1 - DARK_SHARE))

# The galaxies that give most of the deaths within 5 Mpc: collapses a century and distance in Mpc, from their H-alpha
# light (Nakamura et al. 2016, online table 3). Right ascension in hours, for the drawing. The table's sum falls far
# under what is seen, since dust hides star formation, so it sets which galaxy, never how often.
HOSTS = [  # name, Mpc, a century, RA hours
    ('LMC', 0.05, 0.28, 5.39), ('SMC', 0.06, 0.035, 0.88), ('IC 10', 0.66, 0.021, 0.34), ('M31', 0.79, 0.37, 0.71),
    ('M33', 0.84, 0.32, 1.56), ('Circinus', 2.80, 0.13, 14.22), ('IC 342', 3.03, 0.65, 3.78), ('NGC 2403', 3.22, 0.63, 7.61),
    ('Maffei 2', 3.30, 0.78, 2.70), ('M82', 3.53, 1.2, 9.93), ('NGC 4945', 3.60, 0.64, 13.09), ('M81', 3.63, 0.79, 9.93),
    ('Centaurus A', 3.66, 0.92, 13.42), ('NGC 253', 3.94, 1.2, 0.79), ('M83', 4.47, 2.4, 13.62),
]
HOSTS_MPC = 5.0

# ── The far side as a reader of worlds ──
# Settled 2026-11-11, the designer's picks. A world with a magnetic field makes radio where its star's wind strikes
# it, as Earth's aurora does, at 2.8 MHz a gauss: under 2 MHz for a field like Earth's, which only an array off Earth
# hears (Burns et al. 2019, FARSIDE). Our Far-Side Array listens for it at every red dwarf within 10 pc.
#
# Which worlds have a field. No rocky world's has been caught, so the share is a sample: about half, as Earth, Mercury
# and Ganymede have one and Venus and Mars do not. Whether a field helps a world keep its air is disputed, from not at
# all to twice as often. The designer's pick: about 1.2 times as often. So a world that kept its air has a field a
# little oftener than a bare one. The field is drawn after the air, on its own key, so no other draw moves.
FIELD_IF_AIR, FIELD_IF_BARE = 0.55, 0.48
# How far the array hears one: 10 pc, FARSIDE's own reach for the worlds of red dwarfs. A world of a Sun-like star is
# hundreds of times too faint, since its star's wind is thin where it orbits.
FIELD_REACH_LY = 10 * 3.2616
# How bright. Vidotto, Feeney and Groh 2019: a world gives back as radio a hundred-thousandth of the wind's power on
# its field, and Proxima b comes to 180 uJy in a quiet wind. Scaled from there, ours: the wind's push thins as the
# square of the orbit, and the field's reach swells as its sixth root, so the power falls as the orbit to the 4/3.
# Every red dwarf is given Proxima's wind, a sample: no other's is measured.
FLUX0_UJY, FLUX0_AU, FLUX0_LY, FLUX_FALL = 180.0, 0.0485, 4.2465, 4 / 3
# How faint it hears. The agent's arithmetic from FARSIDE's noise: below 1 MHz the ground an array covers sets its
# reach, and 200 km2 gives 120 uJy at 5 sigma in 2,500 hours. Ours covers about 1,000 km2 a fifth, a sample, of
# Daedalus's 6,900 km2 floor. It listens through the lunar night, half the hours of a Year, a sample, and sees the
# whole sky at once, so every world gathers together. What it has gathered grows as ground squared times hours.
NOISE0_UJY, NOISE0_KM2, NOISE0_H = 120.0, 200.0, 2500.0
FIFTH_KM2, LISTEN_H = 1000.0, 4383.0

def field_flux(a, d):
    """A world's radio from its field, in uJy: its orbit in AU, its distance in ly."""
    return FLUX0_UJY * (a / FLUX0_AU) ** -FLUX_FALL * (FLUX0_LY / d) ** 2

def heard_at(flux, fifths):
    """The Year the array has gathered enough to hear a world this bright, given the Year each fifth was done, in
    order. None with no fifth standing."""
    need, have = (NOISE0_UJY / flux) ** 2, 0.0
    for n, start in enumerate(fifths, 1):
        rate = (n * FIFTH_KM2 / NOISE0_KM2) ** 2 * LISTEN_H / NOISE0_H
        end = fifths[n] if n < len(fifths) else math.inf
        if have + rate * (end - start) >= need: return start + (need - have) / rate
        have += rate * (end - start)
    return None

# ── Star storms, heard by the far side ──
# Settled 2026-11-12, at the designer's word to pick by the science. A star throws off a storm of gas, and its shock
# makes a radio burst that drifts lower as it climbs. From a red dwarf the shock forms far out, so the burst falls to
# and below what Earth's air lets through (Alvarado-Gomez et al. 2020): the far side's to hear. Two have been caught
# from other stars, both at 150 MHz (Callingham et al. 2025, Konijn et al. 2025).
# How often. Konijn's count over 107 star-years: a star gives one burst a year brighter than 6.8e13 erg/s/Hz, and
# fewer by the 0.7 power of the brightness, close to the Sun's own curve. Carried down to the array's band, a stretch,
# ours. A burst is in the band about 10 minutes, a sample between Callingham's 2 and Konijn's 13.
STORM_L0, STORM_SLOPE, STORM_MINUTES = 6.8e13, -0.7, 10.0
PC_CM, LY_PC, MJY = 3.0857e18, 3.2616, 1e-26
def storm_floor(fifths=1):
    """The faintest burst the array hears, in mJy at 5 sigma: its noise over the minutes a burst lasts."""
    return NOISE0_UJY / 1000 * NOISE0_KM2 / (fifths * FIFTH_KM2) * math.sqrt(NOISE0_H / (STORM_MINUTES / 60))
def storms_a_year(d_ly, fifths=1):
    """Storms the array hears a Year from one star d_ly away: Konijn's law above the brightness it can hear from
    there, for the half of the hours it listens."""
    lum = 4 * math.pi * (d_ly / LY_PC * PC_CM) ** 2 * storm_floor(fifths) * MJY
    return (lum / STORM_L0) ** STORM_SLOPE * LISTEN_H / 8766
# The question it settles: do a red dwarf's storms follow its flares? About 3 red dwarfs in 10 near us are active, and
# flare hundreds of times oftener than the rest (Medina et al. 2020, Pass et al. 2023: 123 of 413 within 15 pc). If
# storms followed flares, nearly every storm heard would come from those. Our universe's answer, by the evidence: they
# do not. Konijn's curve for all stars sits at the Sun's, though a third of them out-flare the Sun by hundreds. Fields
# of 75 G and more hold all but the strongest storms in (Alvarado-Gomez et al. 2018), and what does leave an active
# star carries a hundredth of what its flare would give the Sun's (Moschou et al. 2019). One of the two bursts caught
# came from a quiet star. So each red dwarf storms by the one law, active or quiet, and the active ones give their
# share of stars, 3 storms in 10.
# Settled as the Deep Ice Watch's share is: once the share's 90% range is within a third of itself, ours.
STORM_ACTIVE = 123 / 413
STORM_SETTLE = math.ceil((1.645 * 3) ** 2 * (1 - STORM_ACTIVE) / STORM_ACTIVE)
# What it says of a world's air: nothing we can put a number to. A storm lifts a world's loss of ions 2 to 10 times
# while it lasts (Venus and Mars, in Airapetian et al. 2020), but steady light strips far more (Brain et al. 2026), and
# the shoreline already counts that. So no world's odds move. No source gives how much likelier a stormy star's world
# is to be bare.
def storm_stars():
    """Every red dwarf within 50 ly, the game's own hosts: its name and distance in ly."""
    import neighbors
    return [(h['name'], h['distance_ly']) for h in neighbors.load_hosts() if h['kind'] == 'M']
def storms_heard(fifths, year, stars=None):
    """Storms heard by a Year from all those stars, given the Year each fifth of the array was done, in order."""
    stars = storm_stars() if stars is None else stars
    total = 0.0
    for n, start in enumerate(fifths, 1):
        end = min(year, fifths[n]) if n < len(fifths) else year
        if end > start: total += (end - start) * sum(storms_a_year(d, n) for _, d in stars)
    return total

def golden_storms():
    """Storms heard by a Year, with the array's fifths done at these Years, and one star's a Year, for
    game/lib/game/natural.ts to reproduce."""
    stars = storm_stars()
    fifths = [30, 36, 42, 48, 54]
    return dict(heard=[dict(fifths=f, year=y, heard=storms_heard(f, y, stars)) for f in (fifths, fifths[:1], fifths[:3]) for y in (29, 30.2, 31, 40, 60, 500)],
                star=[dict(ly=d, fifths=n, aYear=storms_a_year(d, n)) for d in (4.2465, 10, 16.2, 32.6, 50) for n in (1, 3, 5)])

def catalog():
    """What the game takes from here, through calcs/export_worlds.py into game/data/works.json."""
    works = {'Deep ice watch': dict(years=ICE_YEARS, want=ICE_WANT)}
    return works, dict(ice=dict(bright=BRIGHT_A_YEAR, dark=round(DARK_A_YEAR, 2), near=round(NEAR_A_YEAR, 2), brightMpc=BRIGHT_MPC,
                                darkMpc=DARK_MPC, share=round(DARK_SHARE, 4), confirm=CONFIRM_YEARS, settle=SETTLE_AT,
                                hostsMpc=HOSTS_MPC, hosts=[dict(name=n, mpc=d, rate=r, ra=ra) for n, d, r, ra in HOSTS]),
                       fields=dict(ifAir=FIELD_IF_AIR, ifBare=FIELD_IF_BARE, reachLy=FIELD_REACH_LY, flux0=FLUX0_UJY, au0=FLUX0_AU,
                                   ly0=FLUX0_LY, fall=FLUX_FALL, noise0=NOISE0_UJY, km0=NOISE0_KM2, hours0=NOISE0_H,
                                   fifthKm2=FIFTH_KM2, listenH=LISTEN_H),
                       # Star storms: how many the array hears a Year from every red dwarf within 50 ly with one fifth
                       # standing, and from one star 10 ly off, how each grows with the fifths and falls with the star's
                       # distance, how many red dwarfs those are, the share of them that are active, and how many storms
                       # settle whether storms follow flares.
                       storms=dict(perYear=sum(storms_a_year(d) for _, d in storm_stars()), at10=storms_a_year(10.0), grow=-STORM_SLOPE,
                                   fall=-2 * STORM_SLOPE, stars=len(storm_stars()), active=STORM_ACTIVE, settle=STORM_SETTLE,
                                   floor=storm_floor()))

if __name__ == '__main__':
    print(f'Deep Ice Watch: {STRINGS} strings of {MODULES_A_STRING} sensors, {ICE_MT} Mt of ice, {ICE_YEARS} Years.')
    print(f'  Its price, ours: ${ICE_USD / 1e9:.1f} billion at IceCube\'s cost a sensor, {ICE_WANT} flagships.')
    print(f'  It hears {BRIGHT_A_YEAR:.0f} stars explode a Year, out to {BRIGHT_MPC} Mpc, a sample.')
    print(f'  With 1 in {1 / DARK_SHARE:.0f} dying dark, it hears {DARK_A_YEAR:.1f} dark deaths a Year, out to {DARK_MPC} Mpc.')
    print(f'  {NEAR_A_YEAR:.1f} a Year are near enough to read: the first in about {1 / NEAR_A_YEAR:.1f} Years, sure a Year later.')
    lo, hi = DARK_SHARE * (1 - 1 / 3), DARK_SHARE * (1 + 1 / 3)
    print(f'  The share is settled after {SETTLE_AT} of them, about {SETTLE_AT / NEAR_A_YEAR:.0f} Years: between 1 in {1 / hi:.1f} and 1 in {1 / lo:.0f}.')
    within = sum(r for _, d, r, _ in HOSTS if d <= HOSTS_MPC) / 100
    print(f'  The {len(HOSTS)} galaxies named give {within:.2f} a Year by their H-alpha light, far under what is seen.')
    print(f'  In 100,000 Years: about {BRIGHT_A_YEAR * 1e5:,.0f} stars heard exploding and {DARK_A_YEAR * 1e5:,.0f} dying dark.')
    # The far side as a reader of worlds, over the pool's games.
    import seed as seed_mod, neighbors as nb, export_worlds
    rows = nb.load_hosts()
    games = [seed_mod.draw(s, rows) for s in export_worlds.POOL]
    red = [w for g in games for w in g['worlds'] if w['host']['kind'] == 'M' and w['d'] <= FIELD_REACH_LY]
    n = len(games)
    airy = [w for w in red if w['rung'] != seed_mod.RUNGS[0]]
    held = [w for w in red if w['field']]
    with_air = lambda ws: sum(w['rung'] != seed_mod.RUNGS[0] for w in ws) / max(1, len(ws))
    print(f'Far side as a reader of worlds, over {n} games: {len(red) / n:.1f} warm worlds of red dwarfs within {FIELD_REACH_LY:.0f} ly a game, '
          f'{len(airy) / n:.1f} with air, {len(held) / n:.1f} with a field.')
    print(f'  Of those with a field {with_air(held):.0%} kept air, of those without {with_air([w for w in red if not w["field"]]):.0%}: '
          f'{with_air(held) / with_air([w for w in red if not w["field"]]):.2f} times as often.')
    print(f'  Proxima b at 0.1 G: {field_flux(FLUX0_AU, FLUX0_LY):.0f} uJy. A world 0.1 AU out at 33 ly: {field_flux(0.1, 32.6):.2f} uJy.')
    fifths = [0, 6, 12, 18, 24]                                         # a fifth every 6 Years, the array's standard pace
    years = sorted(heard_at(field_flux(w['a'], w['d']), fifths) for w in held)
    by = lambda y: sum(t <= y for t in years) / n
    print(f'  With a fifth done every 6 Years from Year 0: {by(1):.1f} heard a game within a Year, {by(10):.1f} by 10, {by(30):.1f} by 30, '
          f'{by(100):.1f} by 100, {by(300):.1f} by 300, of {len(years) / n:.1f}. The last at Year {years[-1]:,.0f}.')
