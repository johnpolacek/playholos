"""Draw one game from a seed number: Earth's branches to 2040, who is out there, where, when each wakes, what
each already knows of Earth, and the natural warm worlds at other stars. Run: python3 calcs/seed.py 7   (no number: one line for each of the first 40 seeds.
'stats': what 400 games look like.)

The rules are HOLOS_GAME_CONCEPT.md's: Year 0 and Earth's road to it, The neighbors, Stars Earth knocked on, How
neighbors play. Every placement passes calcs/neighbors.py. The same seed always gives the same game.
"""
import hashlib, math, random, sys
import branches, neighbors as nb, observing

Y0 = nb.EARTH_WAKES
# Earth's branches, odds read from Metaculus on 2026-10-10. Taiwan's three outcomes share one roll:
# invasion 26%, blockade alone 20%, neither 54%.
NUCLEAR, MARS, FUSION = 0.24, 0.15, 0.45
# Moves that send something Earth could catch. The opening must be silent: Earth heard nothing by Year 0. A signal
# that reached Earth before then was either one Earth would have caught, which never happened, or one it missed.
SENDS = ('knock', 'answer', 'call', 'gift', 'mask')

# ---------- What reaches Earth, and what Year 0's kit would catch of it ----------
# A neighbor's knock is taken to be like Earth's own. Cosmic Call sent about 150 kW from a 70 m dish at 5 GHz, about
# 1e12 W along the beam, for about four hours a star. Earth sent its knocks again a Year or so later, so a knock is
# sent twice. A call is a steady broadcast at 1% of an Earth-scale grid, a sample. Hael's Long Call is its own 10 GW.
# Year 0's sky watch is a drift scan: each direction north of -20 degrees, ten minutes a day. The all-sky watch, once
# built, sees every direction at every hour.
KNOCK_W, KNOCK_HOURS, AGAIN, CALL_W = 1e12, 4, 1.0, 2.4e11
# Settled 2026-10-20: some senders aim their short sends as laser flashes, not radio. With Earth's own technology of
# 2000, a flash a billionth of a second long outshines the Sun ten thousand times (Howard et al. 2004), so any flash
# aimed at Earth from our neighbors' 50 ly is bright enough. A narrow beam is seen only near its target, so a Hidden
# Mind takes to it more: odds by its Open or Hidden dial, samples. Its calls stay radio, as does a dead world's last
# broadcast. Earth's radio watches never hear a flash. Only the deep flash watch sees one, at night, under clear sky,
# with the star in its domes' fields, each about a fifth of the sky at once (Wright et al. 2018): FLASH_SEEN a send, a
# sample. The draws are keyed, so no other roll moves. The silent opening still checks a laser sender's early sends as
# radio, which is stricter than it need be, and keeps every roll where it was.
# The draw's key is the first that leaves the mocks' seeds 10, 11 and 62 as they were, as the mocks' seed itself was
# chosen. Elsewhere a flash can take a knock a radio watch would have caught, so the two watches hear different things.
LASER = {'O2': 0.1, 'O1': 0.2, 'H1': 0.4, 'H2': 0.6}
LASER_KEY, FLASH_SEEN = 'laser 1', 0.3
# ---------- What Earth's listening caught before Year 0 ----------
# A steady call lasts Years, so the searches that found nothing by 2040 would have found it. A knock lasts hours.
# Before the sky watch, finished in 2028, Earth's searches gave each star minutes in decades, so a knock was caught
# about one time in a hundred. From 2028 the drift scan sees each northern direction ten minutes a day.
SKYWATCH_FROM, BEFORE_IT, PATIENCE = 2028.0, 0.01, 1.0
# ---------- A neighbor's probe ----------
# Settled 2026-10-14: every probe is a rocket, v1's sentinel: 20 Years to build, a tenth of light speed. Its braking
# flame points at Sol, but a fusion flame is X-rays. A wide-field X-ray watch like Einstein Probe sees a drive of a
# terawatt only within about 3 AU, and Zubrin's own 60 TW ship within about 22: its last weeks (this project's
# arithmetic). No such watch is confirmed past about 2031, so Earth must build one.
# Set aside the same day, to keep the game simple: small dark sails that brake on the Sun's light. Physics allows
# them, but the Sun catches a sail only below 3.8% of light speed (Heller and Hippke 2017), so they take about 115
# Years from Alpha Centauri and almost never arrive in play.
# Settled 2026-10-14: where a probe ends its burn is set by its sender's Open or Hidden dial, as odds. One burns all
# the way in to watch from close, so an X-ray sky watch can see its last weeks. The other ends its burn past 100 AU,
# beyond any watch's reach, and watches from the outskirts, as v1's lurker did. The odds are samples.
# Settled 2026-10-15 with the fusion drive's price: speeding up and slowing down take time. A rocket at a hundredth of a
# gravity takes 9.7 Years to reach a tenth of light speed, over half a light-year, and as long to stop. Each costs
# about 5 Years over cruising that stretch, so a probe's trip is ROCKET_BURNS Years longer.
ROCKET_V, ROCKET_BUILD, ROCKET_BURNS = 0.1, 20, 10
BURN_IN = {'O2': 0.9, 'O1': 0.7, 'H1': 0.3, 'H2': 0.1}
# ---------- What an X-ray sky watch sees of a probe burning in ----------
# Proposed 2026-10-14, samples: a probe of 1,000 t braking at a hundredth of a gravity, exhaust 10,600 km/s as
# Daedalus's, so about 0.5 TW of jet. A tenth of that leaks as X-rays, as Zubrin 1995 assumed. 6% of a fusion flame's
# X-rays fall in Einstein Probe's band, whose limit is 2.6e-11 erg/s/cm2 in 1,000 s. A day's looks stacked reach about
# three times as far, as the fourth root of the time. The watch: Einstein Probe's class, 6 Years at standard pace, as it
# took from approval in 2018 to launch in 2024, and Swift 5.
PROBE_T, BRAKE_G, PROBE_VE, XRAY_SHARE = 1000, 0.01, 1.06e7, 0.1
WXT_BAND, WXT_LIMIT, XRAY_WATCH_YEARS = 0.06, 2.6e-11, 6
AU_M = 1.496e11
# ---------- Spreading ----------
# Settled 2026-10-14: neighbors may spread by the same physics and prices as Earth. The seed rolls whether a Mind
# sends colonies, weighted by its Expand or Deepen dial, and each colony, once it stands alone as a Mind, rolls again
# with its parent's dials. That is Landis's percolation (1998): some branches stop, and quiet pockets form.
# Samples, all of them: the odds; a first seed ship 40 Years after waking, as Earth's own probe yard and a sentinel take;
# one more every 20 Years, to the nearest free star in the census; a tenth of light speed, v1's; and a colony standing
# alone 20 Years after it lands, as Metzger et al. 2013 bootstrap the Moon's industry. No colony goes to Sol, or to a
# star another neighbor holds. Targets come from the census to 100 ly, so a neighbor near 50 ly isn't pushed inward.
# Settled 2026-10-14: a colony ship brakes on a magnetic sail, a loop that drags on the gas between stars, with no
# fuel. Gros 2017's case: a 1,500 t craft, half of it a loop 1,600 km across, stops from a tenth of light speed in
# 0.37 ly and about 19 years, at 0.1 protons per cubic cm. The star's wind finishes the last 100 km/s. So a trip is
# BRAKE Years longer than its cruise. Corrected the same day: this said a Mind finishes on its rocket from 2% of light
# speed, from a case far smaller than Gros's.
# Settled 2026-10-14: every seed stands alone, so a seed ship weighs about 1,500 t: Freitas 1980's 443 t seed, Gros's
# sail, a shield and a frame. The pace above assumes a seed that grows faster than Freitas's: a sample.
# The sail's radio is born just above the gas's own cutoff, so the gas swallows it within a few thousand AU (Redfield
# and Falcon 2008, and this project's arithmetic). Zubrin 1995's range left that out. Earth never hears one brake.
CENSUS_PC = 100 / 3.2616
SPREAD = {'E2': 0.8, 'E1': 0.6, 'D1': 0.25, 'D2': 0.1}
# Settled 2026-10-15: a seed ship burns deuterium for 20 Years to reach a tenth of light speed, as Firefly's engine
# allows (calcs/early_game.py seed_ship). At half speed on average, the burn costs BURN Years over cruising. Hops under
# 1.4 ly never reach full speed, so they come out a little long. A sample.
FIRST_SHIP, EVERY, SHIP_V, BRAKE, BURN, STANDS, HORIZON = 40, 20, 0.1, 15, 10, 20, Y0 + 300
# Settled 2026-10-26: Earth's seed probe is a seed ship with no Mind on board, at the same pace as a neighbor's: it brakes
# on its sail, mines its new star's moons and asteroids, and sends its first copy STANDS + FIRST_SHIP Years after it
# lands, the next EVERY later. Unlike a neighbor's colonies, ours copy only so far, by our choice: PROBE_COPIES each,
# for PROBE_GENERATIONS generations, so at most 7 craft. Sagan and Newman 1983 warn against copies without end, and the
# newest picture of spreading is slow and quiet (Ivliev 2026). Its yard builds one in PROBE_BUILD Years, as long as the
# Seed Ship. All samples.
PROBE_BUILD, PROBE_COPIES, PROBE_GENERATIONS = 18, 2, 3
_CENSUS = []
def census():
    if not _CENSUS:
        import hosts
        st = hosts.stars(CENSUS_PC); hosts.name_from_hyg(st, CENSUS_PC); hosts.hipparcos(st)
        for x in st:
            ra, de, d = math.radians(x['ra']), math.radians(x['dec']), x['d_pc'] * 3.2616
            _CENSUS.append(dict(id=x['id'], name=x['name'], kind=x['kind'], d=d, xyz=(d * math.cos(de) * math.cos(ra), d * math.cos(de) * math.sin(ra), d * math.sin(de))))
    return _CENSUS
_CELLS = {}
def nearest(star, reach=20):
    """Census stars by distance from star: those within reach ly first, from a grid, then the rest, rarely needed."""
    if not _CELLS:
        for x in census(): _CELLS.setdefault(tuple(int(c // 10) for c in x['xyz']), []).append(x)
    cx, k = [int(c // 10) for c in star['xyz']], reach // 10 + 1
    near = [x for i in range(-k, k + 1) for j in range(-k, k + 1) for l in range(-k, k + 1) for x in _CELLS.get((cx[0] + i, cx[1] + j, cx[2] + l), ())]
    near = sorted((x for x in near if math.dist(x['xyz'], star['xyz']) <= reach), key=lambda x: math.dist(x['xyz'], star['xyz']))
    yield from near
    seen = {x['id'] for x in near}
    yield from (x for x in sorted(census(), key=lambda x: math.dist(x['xyz'], star['xyz'])) if x['id'] not in seen)
def keyed(*parts):
    """A number between 0 and 1 that depends only on its parts. Placement uses it with each star's id, so a star
    leaving the host list moves only a neighbor that lived there."""
    return (int.from_bytes(hashlib.blake2b(':'.join(map(str, parts)).encode(), digest_size=8).digest(), 'big') + 1) / (2 ** 64 + 2)

# ---------- Natural warm worlds ----------
# Settled 2026-10-13: the seed draws them at the real rate. NASA plans its telescope on 0.24 rocky worlds in each
# star's warm zone, 0.6 to 1.4 Earths wide, the same at every kind of star (Stark et al. 2019, from the SAG13 average
# of Kepler's counts: 0.08 to 0.70). Small ones are commoner, and so are wide orbits: per step of ln R as R^-0.19, per
# step of ln P as P^0.26. A world narrower than 0.8 / sqrt(a) Earths, a in Sun-twin AU, can't hold its air and is not
# counted. Orbits are circular. Rock's mass grows as R^3.7 (Zeng et al. 2016).
# A sample: at most one to a star, and none beside a neighbor's world.
ETA, R_MIN, R_MAX = 0.24, 0.6, 1.4
def power(u, lo, hi, k): return (lo ** k + u * (hi ** k - lo ** k)) ** (1 / k)
def warm_world(seed, host):
    """This star's natural warm world, or None. It passes the checks a neighbor's world does: a stable orbit, no
    transit seen from Sol, no tug in 2026 data. One draw, on the star's own stream, so no other star moves it."""
    if keyed(seed, 'natural', host['id']) >= ETA: return None
    rng = random.Random(f"{seed}:natural:{host['id']}")
    while True:
        x, radius = power(rng.random(), 0.95, 1.67, 0.39), power(rng.random(), R_MIN, R_MAX, -0.19)
        if radius >= 0.8 * x ** -0.5: break
    a, mass, pole = x * math.sqrt(host['luminosity']), radius ** 3.7, math.degrees(math.acos(rng.uniform(-1, 1)))
    fails, k = nb.orbit_fails(host, mass, a, 0, pole)
    w = dict(host=host, d=host['distance_ly'], a=a, radius=radius, mass=mass, pole=pole, tug=k, fails=fails,
             felt=k > nb.rv_2040(host), **sight(host, radius, a))
    return dict(w, **rung(seed, w))

# ---------- What lives on a natural world ----------
# Settled 2026-10-13: alive is a ladder, and a natural world climbs no higher than animals and forests. Its star's age
# sets the rung, on Earth's schedule with scatter. Whether it kept its air comes from physics. Sources are in
# HOLOS_RESEARCH.md, "Kinds of worlds".
# - Air. The cosmic shoreline (Zahnle and Catling 2017, as written by Pass et al. 2025): a world keeps its air when
#   4 log10(escape speed in km/s) - log10(lifetime dose of far ultraviolet and X-rays, Earth = 1) - 3.16 is above zero.
#   Mars sits on the line. The dose is L^0.4 / a^2, and 3.1 times that at a fully convective red dwarf, one fainter
#   than absolute G 10 (Pass et al. 2025). The line is broad (Ji et al. 2025), so each world has its own luck: 0.5 in
#   the log, a sample. Checked 2026-10-16: Nguyen et al. 2026 put this line between their nominal and volatile-poor
#   Sun-like cases, so it stays a middle case, and the luck stands for each world's unknown volatiles.
# - Life. Kipping 2025 gives 13 to 1 that life starts fast where conditions allow, and not how often they allow. Here
#   it started on 3 airy worlds in 4: a sample. It later died out on 1 in 2 of those, settled 2026-10-30. Chopra and
#   Lineweaver 2016 argue almost all early life dies before it can steady its world's climate, and models of the idea
#   (Nicholson et al. 2018, Arthur and Nicholson 2023) give no rate. The range runs from about 1 in 5 to 9 in 10, so
#   this takes its middle. It was 1 in 5, a sample with no source.
# - Pace. Earth had lasting oxygen at 2.3 billion years old (Poulton et al. 2021), and air rich enough to read, with
#   animals and forests, at about 4.0 (Reinhard et al. 2017). Each world runs faster or slower by its own factor, 1.6
#   at one sigma: a sample. Settled 2026-10-15: Earth's pace is typical, with no hard steps, as Mills et al. 2025 argue.
#   Oxygen as a long shot would leave about 3 natural worlds with animals a game, fewer than its minds.
# - Age. A published age from asteroseismology or spin (Ware et al. 2026). Where none exists, drawn evenly from 1 to
#   10.5 billion years (Cukanovaite et al. 2023), and no more than the star's main-sequence life.
# - Born frozen. Settled 2026-10-16: a star brightens as it ages, as the Sun has (Gough 1981, with time counted in the
#   star's main-sequence life, which matches Baraffe et al. 2015 within about 10% from 0.8 to 1.2 Suns). A world that
#   got less than the warm zone's outer light at its star's birth, 1 / 1.67^2 of Earth's, froze. It thaws only once its
#   light reaches 62% of Earth's (Turbet et al. 2017), and life's clock starts then. Henry et al. 2026 find 37 of 143
#   real warm-zone planets born frozen, and here about a quarter at Sun-like stars are. Red dwarfs barely brighten, so
#   they are left out. Their bright youth held their warm worlds too hot first, settled 2026-10-16 as left out too: the
#   shoreline strips the worst, the rest were too hot for a median of 32 million years, and water kept in the rock can
#   refill the seas (Godolt et al. 2019).
RUNGS = ('bare rock', 'airy and lifeless', 'hiding microbes', 'showing oxygen', 'with animals and forests', 'where life died', 'frozen')
ALIVE = RUNGS[2:5]
SHORE_LUCK, STARTED, DIED, PACE = 0.5, 0.75, 0.5, math.log(1.6)
OXYGEN_AT, RICH_AT, OLDEST = 2.3, 4.0, 10.5
OUTER_LIGHT, THAW_LIGHT = 1 / 1.67 ** 2, 0.62
def brightness(x): return 1 / (1.4 - 0.875 * min(1.0, max(0.0, x)))    # Gough 1981, x in main-sequence lives
def thawed(host, a, age):
    """When life's clock could start, in billions of years after the star's birth: 0 for a world warm from the start,
    None for one still frozen."""
    if host['kind'] == 'M': return 0.0
    life, now = 10 * host['luminosity'] ** -0.75, host['luminosity'] / a ** 2
    if now * brightness(0) / brightness(age / life) >= OUTER_LIGHT: return 0.0
    if now < THAW_LIGHT: return None
    return (1.4 - now / (THAW_LIGHT * brightness(age / life))) / 0.875 * life
def shoreline(host, radius, mass, a):
    """How far a world sits on the airy side of the cosmic shoreline, in the log. Negative: its air is probably gone."""
    dose = host['luminosity'] ** 0.4 / a ** 2 * (3.1 if host['kind'] == 'M' and host['gabs'] > 10 else 1)
    return 4 * math.log10(11.19 * math.sqrt(mass / radius)) - math.log10(dose) - 3.16
def rung(seed, w):
    """The truth of a natural world: its age, whether it kept its air, and how far its life has come."""
    host = w['host']; rng = random.Random(f"{seed}:rung:{host['id']}")
    u_age, luck, u_start, u_died, pace = rng.random(), rng.gauss(0, SHORE_LUCK), rng.random(), rng.random(), math.exp(rng.gauss(0, PACE))
    age = host['age'] or 1 + u_age * (min(OLDEST, max(2.0, 10 * host['luminosity'] ** -0.75)) - 1)
    shore, thaw = shoreline(host, w['radius'], w['mass'], w['a']), thawed(host, w['a'], age)
    if shore + luck <= 0: r = RUNGS[0]
    elif thaw is None: r = RUNGS[6]
    elif u_start >= STARTED: r = RUNGS[1]
    elif u_died < DIED: r = RUNGS[5]
    else: r = RUNGS[2] if age - thaw < OXYGEN_AT * pace else RUNGS[3] if age - thaw < RICH_AT * pace else RUNGS[4]
    return dict(age=age, age_by=host['age_by'] or 'drawn', shore=shore, thaw=thaw, rung=r)

# The infrared telescope's search. Its first pass gives a star up to a day, a sample: enough to see an Earth twin of a
# Sun twin out to about 50 ly. A fainter world waits for a deeper pass.
PASS_H = 24
def first_pass(rows):
    """How many hosts the mirror can split at the middle of the warm zone, and the days one pass of them takes."""
    hours = [observing.observe(h['distance_ly'] / 3.2616, 1.0, 1.31 * math.sqrt(h['luminosity']), h['luminosity'])['seen_h'] for h in rows]
    return sum(t is not None for t in hours), sum(min(t, PASS_H) for t in hours if t is not None) / 24
def sight(host, radius, a):
    o = observing.observe(host['distance_ly'] / 3.2616, radius, a, host['luminosity'])
    return dict(sep=o['sep'], seen_h=o['seen_h'], split=o['seen_h'] is not None, swept=o['seen_h'] is not None and o['seen_h'] <= PASS_H)

def draw(seed, rows=None):
    rows = rows or nb.load_hosts()
    rng = random.Random(seed)
    r = rng.random()
    earth = dict(taiwan=next((k for k, p in (('invasion', 0.26), ('blockade', 0.46)) if r < p), None),
                 nuclear=rng.random() < NUCLEAR, mars=rng.random() < MARS, fusion=rng.random() < FUSION)
    # When each branch happened, and what a Taiwan branch left of Earth's compute (calcs/branches.py). Fabs either
    # catch up to the old trend or the whole curve slides back: an even roll, until better evidence.
    earth['years'] = dict(taiwan=rng.randint(2027, 2034), nuclear=rng.randint(2027, 2034), mars=rng.randint(2033, 2035), fusion=rng.randint(2037, 2039))
    catch_up = rng.random() < 0.5
    earth['compute'] = 1.0 if not earth['taiwan'] else branches.stock_2040(
        earth['years']['taiwan'], outage=4 if earth['taiwan'] == 'invasion' else 1, catch_up=catch_up) / branches.stock_2040()
    # The neighbor roster and the elder, retired 2026-10-29: one mind per million stars leaves none within 50 ly. The
    # minds a game holds come from calcs/minds.py.
    drawn = [w for w in (warm_world(seed, h) for h in rows) if w]
    worlds = sorted((w for w in drawn if not w['fails']), key=lambda w: w['d'])
    # Earth's finds at Year 0: every natural world whose tug shows by 2040. If the draw gives none, the seed adds a
    # natural world at a Terra Hunting star, so the opening always has a find.
    felt = [w for w in worlds if w['felt']]
    natural = None
    if not felt:
        taken = {w['host']['id'] for w in drawn}
        pool = [h for h in rows if h['north'] and h['kind'] in 'GK' and h['luminosity'] > 0.3 and h['id'] not in taken and not h['planets']
                and not h['name'].startswith('Gaia ')]                      # the planet hunters' stars are bright, so they have names
        natural = max(pool, key=lambda h: keyed(seed, 'find', h['id']))
    return dict(seed=seed, earth=earth, neighbors=[], found=[], natural=natural, colonies=[],
                worlds=worlds, felt=felt, ruled_out=[w for w in drawn if w['fails']])

def year(t): return f"Year {t - Y0:.1f}" if t >= Y0 else f'{t:.0f}'

def report(g):
    e = g['earth']
    print(f"Seed {g['seed']}. Earth: Taiwan {e['taiwan'] or 'neither'}, nuclear use {'yes' if e['nuclear'] else 'no'}, "
          f"Mars {'yes' if e['mars'] else 'no'}, fusion on the grid {'yes' if e['fusion'] else 'no'}, compute {e['compute']:.0%}.")
    if g['natural']: print(f"  Seeded find: a natural world at {g['natural']['name']}, {g['natural']['distance_ly']:.1f} ly.")
    w = g['worlds']; first = [x for x in w if x['swept'] and not x['felt']]
    print(f"  Natural warm worlds: {len(w)}, {sum(x['host']['kind'] == 'M' for x in w)} of them at red dwarfs. {len(g['ruled_out'])} more drawn and ruled out by what Earth already knows.")
    print('  Felt by Year 0: ' + (', '.join(f"{x['host']['name']} ({x['d']:.1f} ly, {x['tug']:.2f} m/s)" for x in g['felt']) or 'none') + '.')
    print(f"  The telescope can split {sum(x['split'] for x in w)} from their stars. Its first pass sees {len(first)} not felt before: "
          + ', '.join(f"{x['host']['name']} ({x['d']:.1f} ly, {x['radius']:.2f} Earths wide)" for x in first) + '.')
    for x in first: print(f"    {x['host']['name']:22} {x['host']['kind']} {x['d']:5.1f} ly  {x['age']:4.1f} Gyr ({x['age_by']})  shoreline {x['shore']:+.2f}  {x['rung']}")
    print('  All natural worlds: ' + ', '.join(f"{sum(x['rung'] == r for x in w)} {r}" for r in RUNGS) + '.')

def stats(rows, n=400):
    """What many draws look like: the natural warm worlds, what Earth feels by Year 0, and what the first pass sees."""
    warm, felt, first = [], [], []
    rungs = {r: 0 for r in RUNGS}
    for s in range(1, n + 1):
        g = draw(s, rows); w = g['worlds']
        warm.append(len(w)); felt.append(len(g['felt'])); first.append(sum(x['swept'] and not x['felt'] for x in w))
        for x in w: rungs[x['rung']] += 1
    print(f"{n} games. Natural warm worlds: mean {sum(warm) / n:.1f}. Felt by Year 0: mean {sum(felt) / n:.1f}. "
          f"Seen first on the telescope's first pass: mean {sum(first) / n:.1f}.")
    print('  Rungs, per game: ' + ', '.join(f"{rungs[r] / n:.1f} {r}" for r in RUNGS) + '.')

if __name__ == '__main__':
    rows = nb.load_hosts()
    if sys.argv[1:] == ['stats']: stats(rows)
    elif len(sys.argv) > 1: report(draw(int(sys.argv[1]), rows))
    else:
        for s in range(1, 41):
            g = draw(s, rows)
            print(f"{s:3}: {len(g['worlds']):2} natural warm worlds, {len(g['felt'])} felt by Year 0" + (f", seeded find at {g['natural']['name']}" if g['natural'] else ''))
