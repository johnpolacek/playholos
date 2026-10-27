"""Who among the neighbors could have heard whom: each one's radio, as calcs/neighbors.py times it, at every other's
world, against a big array's floor. Run: python3 calcs/kin.py

Asked 2026-10-26, before letting neighbors warn each other in play: a warning needs a third world it knows of. A
listener is taken to stare as Earth's SKA-Mid would, an hour at 1 Hz, from when its arrays begin until Year 200 of
play, with its odds of looking left out, so this counts the most that could be heard. Aimed knocks count only at Sol.
"""
import collections, gzip, json, math, os
from pathlib import Path
import neighbors as nb

ROOT = Path(__file__).resolve().parents[1]
WORLDS = ROOT / 'game' / 'data' / 'worlds'
ROSTER = {n['name']: n for n in nb.ROSTER}
END = 2040 + 200

def place(s):
    ra, dec = math.radians(s['ra'] * 15), math.radians(s['dec'])
    return (s['d'] * math.cos(dec) * math.cos(ra), s['d'] * math.cos(dec) * math.sin(ra), s['d'] * math.sin(dec))

def first_heard(w, a, b):
    """The Earth-calendar year b could first hear a's radio, or None."""
    na, nb_ = ROSTER[a['name']], ROSTER[b['name']]
    wa, wb = 2040 + a['waking'], 2040 + b['waking']
    d = math.dist(place(w['stars'][a['star']]), place(w['stars'][b['star']]))
    floor = nb.floor_watts(1.1, 1, 3600, d)
    for y in range(int(max(wb - nb_.get('arrays_since', 60), 1700)), END):
        if nb.tone_at(na, wa, y - d, False) > floor: return y
    return None

# Earth's own glow, asked 2026-10-26: could a neighbor see our Cold Annex, 1,200 GW shed at 77 K from about
# 300,000 km2 of radiators at L2? Its glow is set beside Earth's own heat at 255 K and the Sun's, at three wavelengths,
# and beside the Halo Survey's floor moved from 12 K to 77 K: for the same power, a warmer glow has less submillimetre
# light, as 1/T^3 on the Rayleigh-Jeans side.
H, C, KB = 6.626e-34, 2.998e8, 1.381e-23
def planck(lam, t): return 2 * H * C ** 2 / lam ** 5 / (math.exp(H * C / (lam * KB * t)) - 1)
def earth_glow():
    annex_m2, r_earth, r_sun = 3e11, 6.371e6, 6.957e8
    for um in (38, 100, 850):
        lam = um * 1e-6
        annex = annex_m2 * math.pi * planck(lam, 77)
        earth = 2 * math.pi * r_earth ** 2 * math.pi * planck(lam, 255)
        sun = 2 * math.pi * r_sun ** 2 * math.pi * planck(lam, 5772)
        print(f'At {um} um the annex is {annex / earth:.0e} of Earth\'s own glow and {annex / sun:.0e} of the Sun\'s.')
    print(f'The floor at 10 pc for a 77 K glow: {3e18 * (77 / 12) ** 3:.0e} W, against the annex\'s 1.2e12.')

if __name__ == '__main__':
    pairs, before, after, loud = 0, set(), set(), collections.Counter()
    files = sorted(os.listdir(WORLDS))
    for f in files:
        w = json.load(gzip.open(WORLDS / f))
        for b in w['neighbors']:
            if b['dead']: continue
            for a in w['neighbors']:
                if a is b: continue
                pairs += 1
                y = first_heard(w, a, b)
                if y is None: continue
                loud[a['name']] += 1
                (before if y <= 2040 else after).add(w['seed'])
    print(f'{pairs} ordered pairs in {len(files)} games. Audible at all: {sum(loud.values())}, from {dict(loud)}.')
    earth_glow()
    print(f'Games with a pair audible by Year 0: {len(before)}. Only after Year 0, by Year 200: {len(after - before)}.')
