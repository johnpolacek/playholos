"""How long the infrared telescope takes to find a warm world and to read its air. Run: python3 calcs/observing.py

Settled 2026-10-13: physics sets it. A nearer or larger world is brighter, so its reading comes sooner. Seasons, when a
star sits too near the Sun to point at, are left out on purpose. Sources are in HOLOS_RESEARCH.md, "Reading air".

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
- Outer edge. Its dark patch ends at about half its deformable mirror's actuators across, in wavelengths over the
  mirror's width. Settled 2026-10-16: 96 across, as in HWO's first design case (Feinberg et al. 2026), so 48. For
  6.5 m that is 0.76 arcseconds in green, 0.91 at ozone's band, 1.16 at oxygen's and 1.43 at water's. Only Alpha
  Centauri A's and B's warm zones reach past it, so their worlds are read in red light. B's own light is taken to be
  cancelled by controlling for both stars at once: shown in labs to a millionth, not yet to the ten-billionth needed.

- A wider mirror. The 15 m Mirror, LUVOIR-A's width, reaches 15 / 6.5 times closer in, and its dark patch ends at 64
  wavelengths over its width, as calcs/signs.py settled 2026-10-16. By Stark et al. 2014's equation 7, the planet's and
  the leaked starlight's photons both grow with the mirror's area, and the dust's in the planet's patch of sky does
  not, since that patch shrinks as the mirror grows. So the planet's and the starlight's share of the time falls as the
  width squared, and the dust's as its fourth power. Added 2026-10-23. A check: Stark et al. 2024 find a water search
  falls from 22 days at 6 m to 3.5 at 9 m. This gives 8 for an Earth twin, so it errs slow, as the 9 m's first targets
  are also nearer.

The split of the noise at the calibration point is this project's estimate: leaked starlight at a raw contrast of
1e-10 is about 0.87 of an Earth twin's light, and dust about 0.75. Both are samples. The mirror is not fixed yet either.
"""
import math

K_LEAK, K_DUST = 0.87, 0.75              # leaked starlight and dust, each over the planet's light, for an Earth twin at 10 pc
SEEN_H, WATER_D = 3.2, 22.0              # hours to first see an Earth twin at 10 pc, and days to search it for water
OXYGEN, OZONE = 4.0, 7.8                 # times water's exposure: S/N 10 for oxygen, S/N 14 for ozone's weak green band, against 5
CAP_D = 61                               # no target gets more than two months
MIRROR, WIDE = 6.5, 15                   # metres, inscribed: the Infrared Telescope and the 15 m Mirror
EDGE = {MIRROR: 48, WIDE: 64}            # the dark patch's edge, in wavelengths over each mirror's width
OWA_LD = EDGE[MIRROR]
BANDS = {'green': 0.50, 'ozone': 0.60, 'oxygen': 0.76, 'water': 0.94}            # microns

def iwa(microns, mirror=MIRROR): return 3.5 * microns * 1e-6 / mirror * 206265 * 1000           # thousandths of an arcsecond
def owa(microns, mirror=MIRROR): return EDGE[mirror] * microns * 1e-6 / mirror * 206265 * 1000

def ratio(d_pc, radius, a_au, lum, mirror=MIRROR):
    """Exposure time over that of an Earth twin of a Sun twin at 10 pc, on the Infrared Telescope."""
    f = radius ** 2 * (lum / a_au ** 2) * (10 / d_pc) ** 2
    area = (mirror / MIRROR) ** 2
    return ((1 + 2 * K_LEAK * a_au ** 2 / radius ** 2) / f / area + 2 * K_DUST / f ** 2 / area ** 2) / (1 + 2 * K_LEAK + 2 * K_DUST)

def observe(d_pc, radius, a_au, lum, mirror=MIRROR):
    r, sep = ratio(d_pc, radius, a_au, lum, mirror), a_au / d_pc * 1000
    inside = lambda band: iwa(BANDS[band], mirror) < sep < owa(BANDS[band], mirror)
    out = dict(sep=sep, seen_h=SEEN_H * r if iwa(BANDS['green'], mirror) < sep < owa(BANDS['water'], mirror) else None)   # seen in its reddest band if need be
    for gas, mult, band in (('water', 1, 'water'), ('oxygen', OXYGEN, 'oxygen'), ('ozone', OZONE, 'ozone')):
        days = WATER_D * r * mult
        out[gas] = None if not inside(band) else days if days <= CAP_D else float('inf')
    return out

def tell(x, unit='d'):
    if x is None: return 'out of reach'
    if x == float('inf'): return 'over two months'
    return f'{x * 24:.0f} hours' if x < 2 else f'{x:.0f} days'

if __name__ == '__main__':
    print('Inner working angle, thousandths of an arcsecond: ' + ', '.join(f'{k} {iwa(v):.0f}' for k, v in BANDS.items()))
    print('Outer working angle, thousandths of an arcsecond: ' + ', '.join(f'{k} {owa(v):.0f}' for k, v in BANDS.items()))
    print(f"{'world':34} {'ly':>5} {'apart':>7} {'first seen':>12} {'water':>16} {'oxygen':>16} {'ozone':>16}")
    for name, ly, radius, a, lum in (('An Earth twin of a Sun twin, 10 pc', 32.6, 1.0, 1.0, 1.0),
                                     ('Alpha Centauri A, this game’s world', 4.32, 0.97, 1.447, 1.52),
                                     ('82 Eridani d, if 2 Earths wide', 19.7, 2.0, 1.354, 0.66),
                                     ('Gliese 432 A’s world', 31.18, 1.5, 0.702, 0.362),
                                     ('12 Ophiuchi’s world', 32.27, 1.0, 0.744, 0.45)):
        o = observe(ly / 3.2616, radius, a, lum)
        seen = 'inside the glare' if o['seen_h'] is None else f"{o['seen_h']:.1f} hours" if o['seen_h'] < 48 else f"{o['seen_h'] / 24:.0f} days"
        print(f"{name:34} {ly:5.1f} {o['sep']:5.0f}   {seen:>12} {tell(o['water']):>16} {tell(o['oxygen']):>16} {tell(o['ozone']):>16}")
    print(f'The 15 m Mirror. Inner working angle: ' + ', '.join(f'{k} {iwa(v, WIDE):.0f}' for k, v in BANDS.items()))
    for name, ly, radius, a, lum in (('An Earth twin of a Sun twin, 10 pc', 32.6, 1.0, 1.0, 1.0),
                                     ('Proxima b, if rock', 4.24, 1.07 ** (1 / 3.7), 0.0485, 0.00157),
                                     ('Gliese 432 A’s world', 31.18, 1.5, 0.702, 0.362),
                                     ('12 Ophiuchi’s world', 32.27, 1.0, 0.744, 0.45)):
        o = observe(ly / 3.2616, radius, a, lum, WIDE)
        seen = 'inside the glare' if o['seen_h'] is None else f"{o['seen_h']:.1f} hours" if o['seen_h'] < 48 else f"{o['seen_h'] / 24:.0f} days"
        print(f"{name:34} {ly:5.1f} {o['sep']:5.0f}   {seen:>12} {tell(o['water']):>16} {tell(o['oxygen']):>16} {tell(o['ozone']):>16}")
    print('One Year is 5 minutes of play, so a day is under a second and two months are 50 seconds.')
    import neighbors as nb, seed
    stars, days = seed.first_pass(nb.load_hosts())
    print(f"The search: this mirror can split the middle of the warm zone at {stars} of the hosts within 50 ly. Up to {seed.PASS_H} hours each, enough to "
          f"see an Earth twin there, a first pass takes {days:.0f} days.")
