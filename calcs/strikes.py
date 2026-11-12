"""What a bullet of ours does where it lands, and what we can see of it from home. Run: python3 calcs/strikes.py

Settled 2026-11-12. Until then a bullet we fired was dated and nothing happened when it landed. Sources are in
HOLOS_RESEARCH.md, "A strike seen from home".

- The energy. Every bullet of ours lands with the same harm, about 108,000 Mt, 4.5e20 J: 1,000 t at a tenth of light
  speed, or the same energy in a rod of 30 t or 4 t a beam throws (calcs/speeds.py).
- Where it goes. No one has published on a body of tonnes entering air this fast. The nearest physics: a fast body
  slows and bursts where the air it has swept weighs what it does (Siraj and Loeb 2020, for bodies to 10 cm). A
  1,000 t ball shows 17 t a m2 against 10 t a m2 of air, and a rod end on 100 to 200, so each reaches low air or the
  ground as a slug of plasma: a fireball low down and a shallow crater. A single nucleon stops in the air at all three
  speeds (NIST PSTAR), and X-rays from below 30 km never leave it (Glasstone and Dolan 1977). So no flash of X-rays
  goes to space, only light.
- The flash. The share of the energy that leaves as light runs from 0.3% for a strike on the ground (Collins et al.
  2005) to 35% for a burst in the air (Glasstone and Dolan 1977). Ours is between: 3%, as Siraj and Loeb's 2 to 4% for
  small fast bodies, and near Chelyabinsk's 7 +- 3% (Popova et al. 2013). It lasts about 200 seconds, as Collins's
  fireball of that energy does, and the airburst rule's 140 seconds to its peak. So about 7e16 W: a little more than
  the sunlight Earth reflects, 5e16 W. A world struck about doubles in light for three minutes. Ours, by logic.
- Who sees it. Only a telescope that splits the world from its star, watching when the light arrives. Against its star
  the flash is a part in ten billion at a Sun, so no telescope that takes the two together sees it, as Stevens et al.
  2016 find for a war's flashes, and Flagg et al. 2016 for strikes on cool worlds.
  - A mirror with a coronagraph: by the same relation that times its first sight of a world (Stark et al. 2014,
    equation 7, calcs/observing.py), with the flash as the signal and the world's own light joining the noise.
  - The Hypertelescope: the flash sits in one pixel of its picture. It is seen where it puts as much light in that
    pixel as a 30 minute picture gives a pixel of that world (Labeyrie, calcs/mercury.py).
  - A sentinel of ours that stays there sees it land.
- What it leaves. At half this energy, a 1 km rock into the sea cuts ozone by over half worldwide for over a year, and
  by over 40% for about 3.5 years (Pierazzo et al. 2010). The burst's own nitric oxide is about 45 times what that
  study took, by Glasstone's 1e32 molecules a megaton. A region is gone. The world's life is not: Chicxulub was a
  thousand times this.
"""
import math
import mercury, observing

MT_J = 4.184e15
BULLET_MT = (1 / math.sqrt(1 - 0.1 ** 2) - 1) * 1e6 * 299792458 ** 2 / MT_J        # 1,000 t at a tenth of light speed
FLASH_SHARE, FLASH_S = 0.03, 200.0
# The sunlight Earth reflects: its albedo, the Sun's light at 1 AU, and its face.
EARTH_W = 0.29 * 1361 * math.pi * 6.371e6 ** 2
# Ozone under half, worldwide, for this many Years after: between Pierazzo's over a year and 3.5.
OZONE_YEARS = (1.0, 3.5)
# The Hypertelescope's pixel and reach, as the game's catalog rounds them, so the game's sum is this one.
HYPER_KM, HYPER_REACH = round(mercury.hyper_km(1), 2), round(mercury.HYPER_REACH)

def flash_w(mt=BULLET_MT): return FLASH_SHARE * mt * MT_J / FLASH_S
def flash_ratio(radius, a_au, lum, mt=BULLET_MT):
    """A strike's flash over the world's own reflected light: its radius in Earths, its orbit in AU, its star in Suns."""
    return flash_w(mt) / (EARTH_W * radius ** 2 * lum / a_au ** 2)

def planet_share(d_pc, radius, a_au, lum, mirror=observing.MIRROR):
    """The world's own light as a share of all a mirror's noise there: the rest is leaked starlight and dust."""
    f = radius ** 2 * (lum / a_au ** 2) * (10 / d_pc) ** 2
    area = (mirror / observing.MIRROR) ** 2
    return (1 / f / area) / ((1 + 2 * observing.K_LEAK * a_au ** 2 / radius ** 2) / f / area + 2 * observing.K_DUST / f ** 2 / area ** 2)

def flash_hours(d_pc, radius, a_au, lum, mirror=observing.MIRROR, mt=BULLET_MT):
    """Hours a mirror would need to see the flash as surely as it first sees the world. None if it can't split the
    world from its star."""
    seen = observing.observe(d_pc, radius, a_au, lum, mirror)['seen_h']
    if seen is None: return None
    k = flash_ratio(radius, a_au, lum, mt)
    return seen * (1 + k * planet_share(d_pc, radius, a_au, lum, mirror)) / k ** 2
def mirror_sees(d_pc, radius, a_au, lum, mirror=observing.MIRROR, mt=BULLET_MT):
    h = flash_hours(d_pc, radius, a_au, lum, mirror, mt)
    return h is not None and h * 3600 <= FLASH_S

def hyper_flash(d_ly, radius, a_au, lum, mt=BULLET_MT):
    """The flash's light in its one pixel of the Hypertelescope's picture, over what a 30 minute picture gives a pixel
    of that world."""
    pixels = math.pi / 4 * (mercury.EARTH_KM * radius / (HYPER_KM * d_ly)) ** 2
    return flash_ratio(radius, a_au, lum, mt) * FLASH_S / (mercury.HYPER_MIN * 60) * pixels
def hyper_sees(d_ly, radius, a_au, lum, mt=BULLET_MT):
    return d_ly <= HYPER_REACH and hyper_flash(d_ly, radius, a_au, lum, mt) >= 1

def catalog():
    """For game/data/works.json: the flash's share of the energy and its seconds, Earth's reflected light, a megaton,
    and the Years the ozone stays under half."""
    return dict(strike=dict(share=FLASH_SHARE, seconds=FLASH_S, earthW=EARTH_W, mtJ=MT_J, mt=BULLET_MT, ozone=list(OZONE_YEARS),
                            earthKm=mercury.EARTH_KM, hyperMin=mercury.HYPER_MIN))

CASES = [(10.0, 1.0, 1.0, 1.0), (4.24 / 3.2616, 1.07 ** (1 / 3.7), 0.0485, 0.00157), (12.9 / 3.2616, 1.2, 0.15, 0.0124),
         (4.32 / 3.2616, 0.97, 1.447, 1.52), (31.18 / 3.2616, 1.5, 0.702, 0.362), (19.7 / 3.2616, 2.0, 1.354, 0.66), (100 / 3.2616, 1.0, 0.1, 0.005)]
def golden():
    """Flashes for game/lib/sim/strikes.ts to reproduce: each world's ratio, and what each telescope makes of it."""
    out = []
    for d_pc, radius, a, lum in CASES:
        row = dict(args=[d_pc, radius, a, lum], ratio=flash_ratio(radius, a, lum), hyper=hyper_flash(d_pc * 3.2616, radius, a, lum), hyperSees=hyper_sees(d_pc * 3.2616, radius, a, lum))
        for name, m in (('near', observing.MIRROR), ('wide', observing.WIDE)):
            row[name] = flash_hours(d_pc, radius, a, lum, m)
            row[name + 'Sees'] = mirror_sees(d_pc, radius, a, lum, m)
        out.append(row)
    return out

if __name__ == '__main__':
    print(f'A bullet lands with {BULLET_MT:,.0f} Mt, {BULLET_MT * MT_J:.2e} J. Its flash: {flash_w():.1e} W for {FLASH_S:.0f} s. Earth reflects {EARTH_W:.1e} W.')
    print(f'{"world":28} {"flash/own":>9} {"6.5 m":>10} {"15 m":>10} {"hyper":>8}')
    names = ['Earth twin, 10 pc', 'Proxima b', 'red dwarf world, 12.9 ly', 'Alpha Cen A, warm zone', '31 ly, K star', '19.7 ly, 2 Earths', 'red dwarf world, 100 ly']
    for n, g in zip(names, golden()):
        t = lambda h: 'no split' if h is None else f'{h * 3600:,.0f} s'
        print(f'{n:28} {g["ratio"]:9.2f} {t(g["near"]):>10} {t(g["wide"]):>10} {g["hyper"]:8.1f}')
    print(f'A mirror sees it where that time is under {FLASH_S:.0f} s. The Hypertelescope where its figure is 1 or more, within {HYPER_REACH} ly.')
