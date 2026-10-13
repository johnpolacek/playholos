"""How long the infrared telescope takes to find a warm world and to read its air. Run: python3 calcs/observing.py

Settled 2026-10-13: physics sets it. A nearer or larger world is brighter, so its reading comes sooner. Seasons, when a
star sits too near the Sun to point at, are left out for now. Sources are in HOLOS_RESEARCH.md, "Reading air".

- Brightness. A world in reflected light gives off sunlight in proportion to its area and the light it receives:
  f = R^2 x S x (10 / d)^2, in units of an Earth twin of a Sun twin at 10 pc. R in Earths, S in Earth sunlights, d in pc.
- Time. tau = (S/N)^2 x (planet + 2 x background) / planet^2 (Stark et al. 2014, equation 7). The planet's light and the
  star's leaked light both fall as d^-2. Zodiacal dust, ours and theirs, does not. So time grows as d^2 where starlight
  or the planet's own photons set the noise, and as d^4 where dust does.
- Calibration. An Earth twin at 10 pc is first seen in 3.2 hours (Alei et al. 2025, a 7.9 m mirror, 3 zodis of dust).
  A search for water takes 22 days on average for the first 18 candidates of a 6 m telescope (Stark et al. 2024).
  Oxygen needs twice the signal to noise, so four times as long. No published time exists for carbon dioxide or
  methane on an Earth twin, and methane at Earth's level is not detectable at all (Latouf et al. 2024).
- Reach. A coronagraph can't split a world closer to its star than about 3.5 wavelengths over the mirror's width
  (Stark et al. 2024). For a 6.5 m mirror that is 56 thousandths of an arcsecond in green light, 84 at oxygen's band
  and 104 at water's. And no single target gets more than two months (Stark et al. 2019).

The split of the noise at the calibration point is this project's estimate: leaked starlight at a raw contrast of
1e-10 is about 0.87 of an Earth twin's light, and dust about 0.75. Both are samples. The mirror is not fixed yet either.
"""
import math

K_LEAK, K_DUST = 0.87, 0.75              # leaked starlight and dust, each over the planet's light, for an Earth twin at 10 pc
SEEN_H, WATER_D = 3.2, 22.0              # hours to first see an Earth twin at 10 pc, and days to search it for water
OXYGEN, OZONE = 4.0, 7.8                 # times water's exposure: S/N 10 for oxygen, S/N 14 for ozone's weak green band, against 5
CAP_D = 61                               # no target gets more than two months
MIRROR = 6.5                             # metres, inscribed
BANDS = {'green': 0.50, 'ozone': 0.60, 'oxygen': 0.76, 'water': 0.94}            # microns

def iwa(microns): return 3.5 * microns * 1e-6 / MIRROR * 206265 * 1000           # thousandths of an arcsecond

def ratio(d_pc, radius, a_au, lum):
    """Exposure time over that of an Earth twin of a Sun twin at 10 pc."""
    f = radius ** 2 * (lum / a_au ** 2) * (10 / d_pc) ** 2
    return ((1 + 2 * K_LEAK * a_au ** 2 / radius ** 2) / f + 2 * K_DUST / f ** 2) / (1 + 2 * K_LEAK + 2 * K_DUST)

def observe(d_pc, radius, a_au, lum):
    r, sep = ratio(d_pc, radius, a_au, lum), a_au / d_pc * 1000
    out = dict(sep=sep, seen_h=SEEN_H * r if sep > iwa(BANDS['green']) else None)
    for gas, mult, band in (('water', 1, 'water'), ('oxygen', OXYGEN, 'oxygen'), ('ozone', OZONE, 'ozone')):
        days = WATER_D * r * mult
        out[gas] = None if sep < iwa(BANDS[band]) else days if days <= CAP_D else float('inf')
    return out

def tell(x, unit='d'):
    if x is None: return 'inside the glare'
    if x == float('inf'): return 'over two months'
    return f'{x * 24:.0f} hours' if x < 2 else f'{x:.0f} days'

if __name__ == '__main__':
    print('Inner working angle, thousandths of an arcsecond: ' + ', '.join(f'{k} {iwa(v):.0f}' for k, v in BANDS.items()))
    print(f"{'world':34} {'ly':>5} {'apart':>7} {'first seen':>12} {'water':>16} {'oxygen':>16} {'ozone':>16}")
    for name, ly, radius, a, lum in (('An Earth twin of a Sun twin, 10 pc', 32.6, 1.0, 1.0, 1.0),
                                     ('Alpha Centauri A, this game’s world', 4.32, 0.97, 1.447, 1.52),
                                     ('82 Eridani d, if 2 Earths wide', 19.7, 2.0, 1.354, 0.66),
                                     ('Gliese 432 A’s world', 31.18, 1.5, 0.702, 0.362),
                                     ('12 Ophiuchi’s world', 32.27, 1.0, 0.744, 0.45)):
        o = observe(ly / 3.2616, radius, a, lum)
        seen = 'inside the glare' if o['seen_h'] is None else f"{o['seen_h']:.1f} hours" if o['seen_h'] < 48 else f"{o['seen_h'] / 24:.0f} days"
        print(f"{name:34} {ly:5.1f} {o['sep']:5.0f}   {seen:>12} {tell(o['water']):>16} {tell(o['oxygen']):>16} {tell(o['ozone']):>16}")
    print('One Year is 5 minutes of play, so a day is under a second and two months are 50 seconds.')
