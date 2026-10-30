"""Mercury Works, the Solar Swarm, the Star Beam and the Hypertelescope. Run: python3 calcs/mercury.py

Settled 2026-10-29, from a player's plan: mine Mercury, cover it in solar cells and lasers, beam power across the solar
system, and send giant telescopes to the Sun's focus to see every warm world near us. Each step checked against the
physics, and kept where it holds. Sources are in HOLOS_RESEARCH.md, "Mercury, the swarm and its beam".

- Mercury's face is the wrong place for the lasers. Its day lasts 176 of ours, so half of it is always dark, and a
  laser on the ground sees only the half of the sky above it. All its sunlit face catches is about 1.7e17 W.
- Taking it apart catches far more. Armstrong and Sandberg 2013: a seed of 1 km^2 of panels on Mercury, its rock made
  into collectors in orbit round the Sun. A swarm of them, from 1 km^2, could catch all the Sun's 3.8e26 W.
- Its pace is Metzger et al.'s: generations 2 years apart, so the swarm doubles every 2 Years. A neighbor's own
  build-out takes 1 to 5 years a doubling, HOLOS_GAME_CONCEPT.md's realistic premise, and ours matches.
- It thinks with what it catches. Our thought grows with the swarm's power over the power our Mind drew at Year 0.
- It glows warm, near 500 K. A neighbor sees it as an infrared excess over the Sun once it catches enough.
- A beam from the swarm pushes lens craft to the Sun's focus in about a Year, each with a telescope wide enough to
  picture a world in days. Even the Laser Sail Array, Starshot's 200 GW, cuts a lens's 17 Years to about 5.
- A hypertelescope, Labeyrie's: 150 mirrors of 3 m over 150 km, a 30 minute picture of an Earth at 10 ly, 40 pixels
  across. It can point anywhere, so it pictures every world we have felt, but its pixel grows with distance.
"""
import math

C, SIGMA, H, KB = 2.998e8, 5.670e-8, 6.626e-34, 1.381e-23
AU, LY, PC = 1.496e11, 9.461e15, 3.086e16
L_SUN, R_SUN, T_SUN = 3.828e26, 6.957e8, 5772
YEAR = 3.156e7

# ---------- Mercury ----------
MERCURY_KG, MERCURY_R, MERCURY_AU = 3.30e23, 2.4397e6, 0.387
FLUX = L_SUN / (4 * math.pi * (MERCURY_AU * AU) ** 2)          # W/m^2 at Mercury, about 9.1 kW
SURFACE_CATCH = FLUX * math.pi * MERCURY_R ** 2                 # its sunlit disk, all of it

# ---------- Mercury Works: the seed ----------
# Armstrong and Sandberg 2013's seed: 1 km^2 of panels on Mercury. At 0.1 kg/m^2, about 100 t landed, a sample.
SEED_M2, SEED_KT = 1e6, 0.1
SEED_W = FLUX * SEED_M2                                        # sunlight it catches, about 9 GW
# Built in orbit from the foundry's parts, then flown there: BepiColombo took 7 years, MESSENGER 6.6. Its Years and
# want are samples: a flagship-class fleet of landers.
WORKS_YEARS, WORKS_WANT = 12, 3.0

# ---------- The Solar Swarm ----------
SWARM_YEARS, SWARM_WANT = 4, 1.0                              # the first collectors thrown off Mercury: samples
DOUBLING = 2                                                    # Years: Metzger et al. 2013's generation
SWARM_FULL = math.log2(L_SUN / SEED_W)                          # doublings until it catches all the Sun
SWARM_KG_M2 = 1e-3                                              # 1 g/m^2: HOLOS_PROJECT_AUDIT.md's solar swarm
SWARM_KG = 4 * math.pi * (MERCURY_AU * AU) ** 2 * SWARM_KG_M2  # every collector, a whole shell at Mercury's distance
# What our Mind drew at Year 0, about a hundredth of Earth's 24 TW grid. Each doubling adds its share to that.
EARTH_THINK_W = 0.01 * 24e12
def steps(n):
    """Our thought from n doublings, as data centers' steps of 1.5."""
    return math.log(1 + SEED_W * 0.2 * 2 ** n / EARTH_THINK_W) / math.log(1.5)

# ---------- Its shape, as the map draws it, 2026-10-29 ----------
# Collectors leave Mercury's mass driver a little faster or slower than Mercury, so they drift along its orbit. A spread
# of 0.3 km/s, a sample for a driver's aim, spreads their periods by 3 dv/v and the arc by that share of an orbit each
# orbit, both ways. Mercury goes round 4.15 times a Year.
MERCURY_V, LAUNCH_DV = 47.4e3, 300
SPREAD = 3 * LAUNCH_DV / MERCURY_V * (1 / 0.2408467)        # share of an orbit the arc widens a Year, both ways together
RING_YEARS = 1 / SPREAD                                       # until the arc closes into a ring
# A collector shades those behind it, so the swarm keeps to one layer: the share of the Sun's light it catches is the
# share of the sky round the Sun it covers. Collectors spread from Mercury's orbital plane, so at a share f it fills a
# band of latitude b with sin b = f round that plane: a thin ring until f nears a tenth, a shell at f = 1.
def band_deg(f): return math.degrees(math.asin(min(1.0, f)))
# The swarm keeps Earth's line to the Sun clear: Earth subtends 8.5e-5 rad from the Sun, a hole of about 1e-8 of the
# shell. Otherwise a full swarm would darken Earth by its share: 1% of sunlight is about 2.4 W/m^2 of cooling.
EARTH_HOLE = (6371e3 / AU) ** 2 / 4

# ---------- Its glow ----------
EFF = 0.2                                                       # what a collector turns to power; the rest is heat now
T_SWARM = (FLUX * (1 - EFF) / (2 * SIGMA)) ** 0.25              # a flat collector, lit on one face, shedding from both
def planck_nu(lam, t):
    nu = C / lam
    return 2 * H * nu ** 3 / C ** 2 / math.expm1(H * nu / (KB * t))
def jansky(w, t, d_m, lam=12e-6):
    """The 12 µm flux of w watts shed as a blackbody at t, seen d_m away, in Jy."""
    nu = C / lam
    share = math.pi * planck_nu(lam, t) * nu / (SIGMA * t ** 4) / nu    # per Hz, of all it sheds
    return w * share / (4 * math.pi * d_m ** 2) / 1e-26
SUN_12 = lambda d_m: jansky(L_SUN, T_SUN, d_m)
# A watch like WISE's sees an excess once it is a tenth of the star's own light at 12 µm: its calibration is good to
# a few percent. Our sample. Across the Galaxy, its floor is AllWISE's 0.73 mJy.
EXCESS, W3_JY = 0.10, 0.73e-3
FRACTION_SEEN = EXCESS * SUN_12(10 * PC) / jansky(L_SUN, T_SWARM, 10 * PC)
def seen_w(d_ly):
    """Watts the swarm must shed for a neighbor `d_ly` away to see it: an excess, or past their floor, whichever needs more."""
    floor = W3_JY / jansky(1, T_SWARM, d_ly * LY)
    return max(FRACTION_SEEN * L_SUN, floor)
def seen_after(d_ly):
    return DOUBLING * math.log2(seen_w(d_ly) / SEED_W)

# ---------- Beams that push a lens ----------
def push_speed(p, aperture, sail, kg, lam=1.06e-6):
    """Top speed of a sail pushed while it stays inside the beam's spot: Lubin 2016's limit, pushed at 2P/c."""
    reach = aperture * sail / (2.44 * lam)
    return math.sqrt(2 * (2 * p / C) * reach / kg)
LENS_AU = 548
def flight(v):
    return LENS_AU * AU / v / YEAR
# The Solar Lens's craft: about 100 kg with a 1 m telescope, Turyshev et al. 2020. Starshot's array, Parkin 2018:
# 200 GW from 2.7 km. Its sail, 10 m, a sample.
ARRAY_V = push_speed(200e9, 2700, 10, 100)
# The Star Beam: a 100 km patch of the swarm phased as one, at 10 TW, Lubin's DE-STAR grown. A 3 m telescope, about
# 2 t with its 100 m sail, samples.
BEAM_V = push_speed(10e12, 1e5, 100, 2000)
# The swarm's own collectors, phased: 10 Years and two flagships, samples. The physics of phasing them is open.
BEAM_YEARS, BEAM_WANT = 10, 2.0
# Integration falls as the telescope's width cubed: Turyshev, Shao and Toth's essay. 1 m to 3 m: 27 times faster.
LOOK, BEAM_SCOPE = 0.5, 3.0
BEAM_LOOK = LOOK / BEAM_SCOPE ** 3

# ---------- The Hypertelescope ----------
# Labeyrie 1999 and 2018: 150 mirrors of 3 m spread over 150 km, 40 by 40 pixels of an Earth at 3 pc in 30 minutes.
HYPER_BASE, HYPER_LAM, HYPER_MIN = 150e3, 0.5e-6, 30
def hyper_km(d_ly):
    return HYPER_LAM / HYPER_BASE * d_ly * LY / 1e3
EARTH_KM = 12742
# A world must be at least 3 pixels across to show more than a dot. As a world is farther, fewer pixels hold its
# light, so each pixel gets as much, and 30 minutes still serves. Moving the fleet to a new star: a week, a sample.
HYPER_REACH = EARTH_KM / 3 / hyper_km(1)
HYPER_SLEW = 7 / 365.25
HYPER_YEARS, HYPER_WANT, HYPER_KT = 20, 2.0, 0.2              # JWST took about 25 years; samples
# Fields cleared in squares and cities show only to a pixel narrower than about 50 km.
CITIES_KM = 50

if __name__ == '__main__':
    print(f"Mercury: sunlight {FLUX:.0f} W/m^2. All its sunlit face catches {SURFACE_CATCH:.2e} W, "
          f"{SURFACE_CATCH / L_SUN:.1e} of the Sun.")
    print(f"Seed: {SEED_M2 / 1e6:.0f} km^2, {SEED_KT * 1000:.0f} t, catching {SEED_W:.2e} W.")
    print(f"Swarm: {SWARM_FULL:.1f} doublings to all the Sun, {SWARM_FULL * DOUBLING:.0f} Years at {DOUBLING} a doubling. "
          f"A whole shell at 1 g/m^2 weighs {SWARM_KG:.1e} kg, {SWARM_KG / MERCURY_KG:.1e} of Mercury.")
    print(f"  Thought: {steps(0):.2f} steps at first, {steps(10):.1f} after 10 doublings, {steps(SWARM_FULL):.0f} at full.")
    print(f"  Its collectors sit near {T_SWARM:.0f} K.")
    print(f"  Its arc widens {SPREAD * 360:.0f} degrees a Year and closes into a ring in {RING_YEARS:.1f} Years.")
    for n in (20, 43, 49, 52, 54, 55.2):
        f = min(1, SEED_W * 2 ** n / L_SUN)
        print(f"  After {n} doublings, {n * DOUBLING:.0f} Years: {f:.1e} of the Sun, a band {band_deg(f):.2f} degrees either side.")
    print(f"  Earth's line to the Sun is a hole of {EARTH_HOLE:.0e} of the shell.")
    print(f"  The Sun at 10 pc: {SUN_12(10 * PC) * 1e3:.0f} mJy at 12 µm. A swarm shows as an excess past "
          f"{FRACTION_SEEN:.2e} of the Sun, {FRACTION_SEEN * L_SUN:.1e} W.")
    for d in (10, 50, 300, 1000, 30000):
        print(f"  Seen from {d} ly once it sheds {seen_w(d):.1e} W, {seen_after(d):.0f} Years after it starts.")
    print(f"Lens craft: the array pushes one to {ARRAY_V / 1e3:.0f} km/s, {flight(ARRAY_V):.1f} Years to {LENS_AU} AU. "
          f"The Star Beam to {BEAM_V / 1e3:.0f} km/s ({BEAM_V / C:.3f} c), {flight(BEAM_V):.2f} Years. Today's dive: "
          f"150 km/s, {flight(150e3):.1f} Years.")
    print(f"  A {BEAM_SCOPE:.0f} m telescope looks for {BEAM_LOOK * 365.25:.1f} days, not {LOOK * 365.25:.0f}.")
    print(f"Hypertelescope: {hyper_km(10):.0f} km a pixel at 10 ly, {hyper_km(100):.0f} at 100 ly. An Earth is 3 "
          f"pixels across at {HYPER_REACH:.0f} ly. Cities show within {CITIES_KM / hyper_km(1):.1f} ly.")

def catalog():
    """What the game takes from here, through calcs/export_worlds.py into game/data/works.json."""
    works = {
        'Mercury works': dict(years=WORKS_YEARS, want=WORKS_WANT, orbit=True),
        'Solar swarm': dict(years=SWARM_YEARS, want=SWARM_WANT, grows=DOUBLING, thinks=round(SEED_W * EFF / EARTH_THINK_W, 5), full=round(SWARM_FULL, 1)),
        'Star beam': dict(years=BEAM_YEARS, want=BEAM_WANT),
        'Hypertelescope': dict(years=HYPER_YEARS, want=HYPER_WANT, orbit=True),
    }
    return works, dict(
        beams=dict(array=round(flight(ARRAY_V), 2), beam=round(flight(BEAM_V), 2), look=round(BEAM_LOOK, 4)),
        swarm=dict(watts=float(f'{SEED_W:.3g}'), doubling=DOUBLING, excess=float(f'{FRACTION_SEEN * L_SUN:.3g}'),
                   perLy2=float(f'{W3_JY / jansky(1, T_SWARM, LY):.3g}'), kelvin=round(T_SWARM, -1), spread=round(SPREAD, 4)),
        hyper=dict(kmPerLy=round(hyper_km(1), 2), reach=round(HYPER_REACH), slew=round(HYPER_SLEW, 4), cities=CITIES_KM))
