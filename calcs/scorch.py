"""White dwarf companions of possible hosts within 50 ly: how hard each one's giant phase lit the host's warm zone,
and how long ago. Run: python3 calcs/scorch.py

A white dwarf was a giant first. At the tip of its giant life it shone thousands of times the Sun, from closer in
than the pair sits today, because the orbit widened as it shed mass. No published paper works out that light on
the other star's warm zone, so this does, to an order of magnitude.

- Tip luminosity from the core it left: L = 59,250 x (M - 0.522) Suns (Paczynski 1970, as given by Karakas and
  Lattanzio 2014), and never under about 2,500, the tip of the first giant branch for a star that began under about
  1.5 Suns (Kalirai et al. 2014). Heavier stars top out lower there, but their cores put them above the floor anyway.
  A dying star shines above 2,500 Suns for 1 to 2 million years.
- Orbit then: a0 = a x (M_host + M_wd) / (M_host + M_progenitor), for slow mass loss (Hadjidemetriou 1963).
- Light on the zone: L / a0^2 in Earth sunlights, averaged over the orbit where its shape is known.
- A warm zone runs from about 1.06 Earth sunlights at its inner edge to 0.35 at its outer (Kopparapu et al. 2013).
  So 0.7 more pushes every orbit in it past the runaway limit.

Sources for each row are in HOLOS_RESEARCH.md, "Where neighbors can live". Separations marked projected are what
the sky shows today, not orbits, and the true size may be up to twice that.
"""
import math
import hosts

RUNAWAY = 1.06 - 0.35       # Earth sunlights that tip even the zone's outer edge into runaway
CLOCK = 1.0                 # Gyr after a scorching before minds, the same clock as a young star. Settled 2026-10-11.

# host Gaia DR3 id: (name, white dwarf, separation AU, eccentricity or None if projected, white dwarf mass,
#                    progenitor mass, Gyr since it became a white dwarf)
PAIRS = {
    'HIP 37279': ('Procyon', 'Procyon B', 15.0, 0.40, 0.592, 2.0, 1.37),
    '1355264565043431040': ('GJ 3991', 'G 203-47 B', 0.11, 0.07, 0.5, 1.4, 4.0),
    '4937000898856156288': ('Gliese 86', 'Gliese 86 B', 23.7, 0.43, 0.57, 1.6, 1.25),
    '3195919254111314816': ('40 Eridani C', '40 Eridani B', 34.5, 0.43, 0.573, 1.8, 0.12),
    '470826482637310080': ('Stein 2051 A', 'Stein 2051 B', 56.6, None, 0.675, 2.6, 1.9),
    '3478127463341507072': ('HD 100623', 'VB 4', 146.0, None, 0.60, 1.7, 5.6),
    '5717278911884264576': ('Gliese 283 B', 'Gliese 283 A', 186.0, None, 0.64, 2.0, 1.5),
    '6009538585839374336': ('HD 140901', 'Gliese 599 B', 220.1, None, 0.58, 1.5, 0.5),
    '4201781696994082944': ('LDS 678 B', 'WD 1917-077', 285.4, None, 0.62, 1.9, 0.6),
    '1431176943768690816': ('CM Draconis', 'WD 1633+572', 396.8, None, 0.58, 1.7, 2.6),
    '3195919528989223040': ('40 Eridani A', '40 Eridani B', 417.3, None, 0.573, 1.8, 0.12),
    '6558208838138808576': ('Gliese 841 A', 'WD 2154-512', 426.2, None, 0.58, 1.7, 1.7),
    '6478328150150225664': ('WT 766', 'WT 765', 857.9, None, 0.57, 1.3, 4.9),
    '975968718869126144': ('G 107-69', 'G 107-70 A and B', 1161.5, None, 0.63, 2.3, 4.7),
    '1251824607045654016': ('GJ 1179 A', 'WD 1345+238', 2231.0, None, 0.52, 1.0, 4.7),
    '5588607120530408832': ('171 Puppis A', 'VB 3', 13429.0, None, 0.55, 1.5, 7.3),
}

def tip(m_wd):
    return max(2500.0, 59250 * (m_wd - 0.522))

def judge(star, pair, zone=None):
    """Light on the zone at the giant's tip, the orbit then, and whether the zone held its planets then and now."""
    name, wd, a, e, m_wd, m_prog, since = pair
    m = hosts.mass_from_gabs(star['gabs'])
    a0 = a * (m + m_wd) / (m + m_prog)
    light = tip(m_wd) / a0 ** 2 / (math.sqrt(1 - e * e) if e is not None else 1)
    inner, outer = zone or hosts.hz(star.get('lum') or 10 ** (-0.4 * (star['gabs'] - 4.67)))
    ecc = e if e is not None else 0.5
    held_then = hosts.critical_a(m_prog / (m + m_prog), ecc) * a0 > outer
    held_now = hosts.critical_a(m_wd / (m + m_wd), ecc) * a > outer
    why = ('a close white dwarf leaves no stable warm zone' if not held_now else
           'its warm zone held no planets while its companion was a giant' if not held_then else
           'a giant companion scorched the warm zone under 1 Gyr ago' if light >= RUNAWAY and since < CLOCK else None)
    return dict(name=name, wd=wd, a=a, a0=a0, projected=e is None, light=light, since=since, held_then=held_then, held_now=held_now,
                scorched=light >= RUNAWAY, why=why)

def table():
    by = {s['id']: s for s in hosts.stars()}
    return {i: judge(by[i], p) for i, p in PAIRS.items() if i in by}

if __name__ == '__main__':
    print(f"{'host':14} {'white dwarf':17} {'apart now':>11} {'then':>7} {'light at the tip':>17} {'Gyr since':>10}  zone held planets")
    for i, j in sorted(table().items(), key=lambda kv: -kv[1]['light']):
        mark = ('DROPPED: ' + j['why']) if j['why'] else 'scorched, and over a billion years since' if j['scorched'] else ''
        print(f"{j['name']:14} {j['wd']:17} {j['a']:8,.1f} AU{'*' if j['projected'] else ' '} {j['a0']:6,.1f} {j['light']:13,.2f} x Earth {j['since']:9.2f}  "
              f"{'yes' if j['held_then'] else 'NO then'}{'' if j['held_now'] else ', NO now'}  {mark}")
    print('* projected on the sky, not an orbit.')
