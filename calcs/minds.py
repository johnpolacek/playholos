"""The realistic premise's minds for one seed: old minds near us, young peers across the Galaxy, and the watcher.
Run: python3 calcs/minds.py [seed]

Settled 2026-10-28 and 2026-10-29 in HOLOS_GAME_CONCEPT.md, The realistic premise. One mind per million stars, all
older than us and inward. About 7 peers woke within 100,000 years of us. A watcher sits in every game, sent by a maker
that cares about spreaders. Drawn beside the old neighbors until the rework retires them (rework step 5).

Positions are in the atlas frame, light-years: (Galactic X toward the center, Galactic Z north, -Galactic Y), as
data/gcns-326ly.bin. Times are game Years, Year 0 = 2040. Every draw is keyed on the seed and a name of its own, so
adding a draw never moves another.
"""
import math, random, struct, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PC_LY = 3.261563777

STARS_PER_MIND = 1e6                    # one mind per million stars, the best guess (concept, the realistic premise)
CATALOG_LY = 326                        # real stars inside, data/gcns-326ly.bin. Seeded beyond
OLD_MINDS_LY = 1000                     # old minds drawn one by one out to here. Beyond, the Galaxy's count only
PEERS = 7                               # mean young minds within PEER_WINDOW of us, Galaxy-wide, from HEAD_START below
PEER_WINDOW = 1e5                       # years either side of our waking
ASLEEP_SHARE = 0.5                      # as calcs/neighbors.py, a sample
# How much older than us a mind is, settled 2026-10-30: its world's age less the time its mind took. Lineweaver 2001
# and Lineweaver, Fenner and Gibson 2004: 3 in 4 Earth-like worlds are older than Earth, by 1.8 ± 0.9 billion years on
# average, drawn as a gamma of that mean and spread. The rest are younger, evenly. A mind takes Earth's 4.54 billion
# years, faster or slower by calcs/seed.py's pace, 1.6 times at one sigma. Over 2 million draws: a median head start
# of 2.3 billion years, two thirds between 0.8 and 3.9. Minds within 100,000 years of us are 1.6e-5 of all, so
# about 7 across the Galaxy, either side. It was 10^N(9, 0.5) capped at 5 billion, with peers from an even pace over
# 8 billion years, and the two disagreed.
EARTH_GYR, OLDER_SHARE, OLDER_K, OLDER_THETA, PACE = 4.54, 0.75, 4, 0.45, math.log(1.6)
OLDEST_GYR = 10.5                       # the thin disk's oldest stars, as calcs/seed.py
REST_AU = (30, 2000)                    # where a sleeping mind rests from its star, evenly in log (concept, way 4)
REPLY_C = 0.1                           # what a mind sends travels at a tenth of light's speed, as our own bullets

# The Galaxy's shape: an exponential thin disk through the Sun's neighborhood, and a bulge. This project's model,
# as HOLOS_RESEARCH.md, star counts. The disk alone holds about 60 billion stars. Peers are counted by PEERS, so the
# shape only places them.
N0, HZ, HR, R0 = 0.1, 300.0, 2600.0, 8200.0     # stars per cubic parsec here, scale height, scale length, Sun's radius (pc)
BULGE_SHARE, BULGE_PC = 0.2, 1000.0             # share of peers in the bulge and bar, its spread (pc)

# Where a watcher could sit unseen, after Benford 2019.
WATCHER_PLACES = ('an Earth co-orbital asteroid', 'Sun–Earth L4', 'Sun–Earth L5', 'Earth–Moon L4', 'Earth–Moon L5')
# The Earth co-orbital asteroids known by 2026, in the order an asteroid tour visits them. Kamoʻoalewa first, as
# Tianwen-2. Cruithne's horseshoe path ranges farther, so last.
CO_ORBITALS = ('Kamoʻoalewa', '2023 FW13', '2002 AA29', '2004 GU9', '2006 FV35', 'Cruithne')

# A young mind's outward time: building out its home, then spreading if it does (concept, 2026-10-29).
BUILD_YEARS = (50, 1000)                        # evenly in log
SPREAD = (('home', 0.25, 0), ('near', 0.65, 50), ('far', 0.10, 200))   # kind, share, farthest reach (ly)
SEED_C = (0.01, 0.2)                            # seed ships' speed, evenly in log


def rng(seed, *key):
    return random.Random(':'.join(str(k) for k in (seed, 'minds') + key))

def log_between(r, lo, hi):
    return lo * (hi / lo) ** r.random()

def poisson(r, mean):
    """Knuth's method, fine for the small means here."""
    limit, k, p = math.exp(-mean), 0, r.random()
    while p > limit:
        k += 1; p *= r.random()
    return k


# ---------- Stars ----------
_CATALOG = []
def catalog():
    """The real census out to 326 ly: (x, y, z) atlas light-years for each object."""
    if not _CATALOG:
        b = (ROOT / 'data/gcns-326ly.bin').read_bytes()
        v = struct.unpack('<' + 'f' * (len(b) // 4), b)
        _CATALOG.extend((v[i], v[i + 1], v[i + 2]) for i in range(0, len(v), 5))
    return _CATALOG

def disk_density(x, y, z):
    """Stars per cubic parsec at an atlas position in light-years from the Sun, the thin disk only."""
    gx, gz, gy = x / PC_LY, y / PC_LY, -z / PC_LY
    R = math.hypot(R0 - gx, gy)
    return N0 * math.exp(-abs(gz) / HZ - (R - R0) / HR)

def disk_stars(r_ly, steps=120, m=48):
    """Thin-disk stars within r_ly of the Sun, integrated over shells, as density.py."""
    tot, dr = 0.0, r_ly / PC_LY / steps
    for i in range(steps):
        r = (i + .5) * dr; s = 0.0
        for j in range(m):
            mu = -1 + (j + .5) * 2 / m; a = r * math.sqrt(1 - mu * mu) / HR
            s += N0 * math.exp(-abs(r * mu) / HZ) * sum((a / 2) ** (2 * k) / math.factorial(k) ** 2 for k in range(12)) / m
        tot += 4 * math.pi * r * r * s * dr
    return tot

def in_shell(r, lo, hi):
    """A position between lo and hi light-years, weighted by the disk's density."""
    top = disk_density(0, 0, 0) * math.exp(hi / PC_LY / HR)
    while True:
        d = (lo ** 3 + (hi ** 3 - lo ** 3) * r.random()) ** (1 / 3)
        mu, phi = r.uniform(-1, 1), r.uniform(0, 2 * math.pi)
        s = math.sqrt(1 - mu * mu)
        p = (d * s * math.cos(phi), d * mu, d * s * math.sin(phi))
        if r.random() * top < disk_density(*p): return p

def in_galaxy(r):
    """A position anywhere in the Galaxy, by its shape: disk or bulge."""
    if r.random() < BULGE_SHARE:
        g = [r.gauss(0, BULGE_PC) for _ in range(3)]
        gx, gy, gz = R0 + g[0], g[1], g[2] * 0.5
    else:
        R = r.gammavariate(2, HR); phi = r.uniform(0, 2 * math.pi)
        gx, gy = R0 - R * math.cos(phi), R * math.sin(phi)      # Galactic X runs from the Sun toward the center
        gz = (1 if r.random() < .5 else -1) * r.expovariate(1 / HZ)
    return (gx * PC_LY, gz * PC_LY, -gy * PC_LY)


# ---------- Old minds ----------
def old_mind(seed, i, pos, star=None):
    """How much older than us (about 2.3 billion years, typically), whether it sleeps, and how bright its cold glow is. Awake, it stays under what the shallow all-sky
    maps would catch at its distance, 0.3% of a Sun at 400 ly, since none has been seen."""
    r = rng(seed, 'old', i)
    d = math.hypot(*pos)
    asleep = r.random() < ASLEEP_SHARE
    limit = 0.003 * 3.828e26 * (d / 400) ** 2
    age = head_start(r)
    glow = None if asleep else float(f'{log_between(r, 1e18, limit):.3g}')
    # Asleep, it folds up small and rests in the cold: 12 K lies about 540 AU from a Sun, 54 AU from a dim red dwarf.
    rest = round(log_between(r, *REST_AU)) if asleep else None
    return dict(id=f'old-{i}', pos=[round(c, 3) for c in pos], d=round(d, 2), star=star, age=age, asleep=asleep,
                glowW=glow, restAU=rest)

def head_start(r):
    """Years an old mind woke before us: its world's age less the time its mind took, past the peers' window."""
    while True:
        world = min(OLDEST_GYR, EARTH_GYR + r.gammavariate(OLDER_K, OLDER_THETA)) if r.random() < OLDER_SHARE else r.uniform(0, EARTH_GYR)
        took = EARTH_GYR * math.exp(r.gauss(0, PACE))
        if (world - took) * 1e9 > PEER_WINDOW: return round((world - took) * 1e9)

def old_minds(seed):
    """Every old mind out to OLD_MINDS_LY: on real stars inside the catalog, at seeded places beyond."""
    stars = catalog()
    r = rng(seed, 'old')
    inside = [('star', k) for k in (int(r.random() * len(stars)) for _ in range(poisson(r, len(stars) / STARS_PER_MIND)))]
    beyond = poisson(r, (disk_stars(OLD_MINDS_LY) - disk_stars(CATALOG_LY)) / STARS_PER_MIND)
    out = []
    for i, (_, k) in enumerate(inside):
        out.append(old_mind(seed, i, stars[k], star=k))
    for j in range(beyond):
        i = len(inside) + j
        out.append(old_mind(seed, i, in_shell(rng(seed, 'old', i, 'place'), CATALOG_LY, OLD_MINDS_LY)))
    return sorted(out, key=lambda m: m['d'])


# ---------- Peers ----------
def peer(seed, i):
    """A young mind: where, when it woke, how long it stays outward, and what Earth could see of it."""
    r = rng(seed, 'peer', i)
    pos = in_galaxy(r)
    d = math.hypot(*pos)
    wake = r.uniform(-PEER_WINDOW, PEER_WINDOW)                 # game Years, before (negative) or after our waking
    build = log_between(r, *BUILD_YEARS)
    u, kind, reach = r.random(), None, 0.0
    for k, share, top in SPREAD:
        if u < share: kind = k; break
        u -= share
    kind = kind or SPREAD[-1][0]
    top = dict((k, t) for k, _, t in SPREAD)[kind]
    if top: reach = r.uniform(4, top)                            # the nearest stars sit about 4 ly apart
    speed = log_between(r, *SEED_C) if reach else None
    outward = build + (reach / speed if reach else 0)
    contact = wake + outward < d and 'inward' or wake <= d and 'outward' or 'unborn'
    return dict(id=f'peer-{i}', pos=[round(c, 1) for c in pos], d=round(d, 1), wake=round(wake, 1),
                buildYears=round(build, 1), spread=kind, reachLy=round(reach, 1), seedC=speed and round(speed, 4),
                outwardYears=round(outward, 1), asleep=r.random() < ASLEEP_SHARE,
                flash=[round(wake + d, 1), round(wake + outward + d, 1)],   # its warm phase, as its light reaches us
                ourLight=round(d, 1),                                       # our waking reaches it in Year d
                atContact=contact)

def peers(seed):
    return sorted((peer(seed, i) for i in range(poisson(rng(seed, 'peers'), PEERS))), key=lambda p: p['d'])


# ---------- The watcher ----------
def watcher(seed, olds):
    """Always here, its maker cares (concept, 2026-10-29). The maker is the nearest old mind: if several watch,
    the nearest answers first. The ladder is data, so it can vary per mind later."""
    r = rng(seed, 'watcher')
    maker = olds[0]
    d = maker['d']
    place = WATCHER_PLACES[int(r.random() * len(WATCHER_PLACES))]
    rock = int(rng(seed, 'watcher', 'rock').random() * len(CO_ORBITALS)) if place == WATCHER_PLACES[0] else None
    return dict(place=place, rock=None if rock is None else CO_ORBITALS[rock], kg=1,
                arrivedYearsAgo=round(log_between(r, 1e6, min(1e9, maker['age']))), maker=maker['id'],
                ladder=[dict(rung='warn', on='our first seed launches', by='watcher', delay=0),
                        dict(rung='contain', on='we launch another seed after the warning', by='maker', delay=round(d + d / REPLY_C)),
                        dict(rung='strike', on='our colonies launch seeds of their own', by='maker', delay=round(d + d / REPLY_C))])


def draw(seed):
    olds = old_minds(seed)
    if not olds:                                                # about 1 game in 5,000: the nearest lies beyond
        olds = [old_mind(seed, 'far', in_shell(rng(seed, 'old', 'far'), OLD_MINDS_LY, 2 * OLD_MINDS_LY))]
    return dict(old=olds, peers=peers(seed), watcher=watcher(seed, olds))


if __name__ == '__main__':
    seed = int(sys.argv[1]) if len(sys.argv) > 1 else 10
    m = draw(seed)
    print(f'seed {seed}: {len(m["old"])} old minds within {OLD_MINDS_LY} ly, {len(m["peers"])} peers')
    for o in m['old']:
        print(f"  {o['id']:>7} {o['d']:7.1f} ly  {'real star ' + str(o['star']) if o['star'] is not None else 'seeded':>16}  "
              f"{o['age'] / 1e9:4.2f} Gyr  {'asleep' if o['asleep'] else 'awake, %.2g W' % o['glowW']}")
    for p in m['peers']:
        print(f"  {p['id']:>7} {p['d']:9.0f} ly  woke {p['wake']:+9.0f}  outward {p['outwardYears']:8.0f} y ({p['spread']})  "
              f"flash Years {p['flash'][0]:.0f} to {p['flash'][1]:.0f}  at contact: {p['atContact']}")
    w = m['watcher']
    print(f"  watcher at {w['place']}, from {w['maker']}, here {w['arrivedYearsAgo']:.2g} years. "
          f"Contain or strike arrive {w['ladder'][1]['delay']:,} Years after we act.")
