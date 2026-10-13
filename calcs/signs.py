"""What Earth can read of a neighbor's world from afar, and with what. Run: python3 calcs/signs.py 10   ('stats': 400 games)

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
SMOG = ((6.5, 300, 5.71 / 3.2616), (15, 400, 10))           # mirror in metres, its published hours, and at how many parsecs
LOOK = 9.0                               # the Year the first pass ends

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
    for label, b in (('all living neighbors', tot), ('those the first pass sees', homes)):
        L = b['living']; share = lambda k: 'none' if not b[k] else f'1 in {L / b[k]:,.0f}' if b[k] / L < 0.02 else f'{b[k] / L:.0%}'
        print(f"Across {n} games, {label}: {L / n:.1f} a game, as Earth sees them at Year {LOOK:.0f}.")
        print(f"  Radio, within a Year of listening: the held array hears {share('held')}, a deep-field receiver {share('deep')}, a far-side array {share('far')}.")
        print(f"  Smog, within two months: the 6.5 m mirror reads {share('smog6')}, a 15 m mirror {share('smog15')}.")
        print(f"  Not yet using radio: {share('silent')}. Out of reach of every one of these: {share('none')}.")

if __name__ == '__main__':
    rows = nb.load_hosts()
    if sys.argv[1:] == ['stats']: stats(rows)
    else: report(seed.draw(int(sys.argv[1]) if sys.argv[1:] else 10, rows))
