"""Early-game calculations for HOLOS_PROJECT_AUDIT.md. Run: python3 calcs/early_game.py

Each one is an order of magnitude from published numbers, not a design. Sources are in HOLOS_RESEARCH.md.
"""
import math

LY = 9.4607e15          # m
JY = 1e-26              # W m^-2 Hz^-1
YEAR = 3.156e7          # s
GRID_2040 = 24e12       # W, Earth's energy at Year 0

# ---------- The broadcast beacon ----------
# A steady narrowband tone sent the same way in every direction. A receiver hears it when its flux beats
#   F_min = SNR * SEFD * sqrt(B / (n_pol * t))     (the radiometer form Breakthrough Listen uses)
# so the range is d = sqrt(P / (4 pi F_min)). Long stares assume the tone stays in one channel:
# the sender removes its own motion, the receiver removes its own.
RECEIVERS = [
    # name, SEFD (Jy), channel (Hz), stare (s), what it is
    ('Big dish, 5 minutes', 10, 3, 300, 'Green Bank as Breakthrough Listen uses it: SEFD about 10 Jy'),
    ('SKA-Mid, 1 hour', 1.1, 1, 3600, 'the full SKA-Mid at 1.4 GHz: SEFD about 1.1 Jy'),
    ('Sky watch at Year 0, 10 min', 12, 1, 600, 'CHORD-class drift scan: 512 six-meter dishes, about 10 minutes a day on each northern direction'),
    ('All-sky watch, 1 day', 12, 1, 86400, 'a dense aperture array, every direction at once, the same sensitivity'),
]
SNR, N_POL = 10, 2

def f_min(sefd, chan, t):
    return SNR * sefd * JY * math.sqrt(chan / (N_POL * t))

def beacon_range_ly(power, sefd, chan, t):
    return math.sqrt(power / (4 * math.pi * f_min(sefd, chan, t))) / LY

def beacon():
    print('Broadcast beacon: range for a steady tone, in light-years')
    shares = (0.001, 0.01, 0.1)
    print(f"  {'receiver':30}" + ''.join(f'{s:>9.1%}' for s in shares) + '   of 2040 energy')
    for name, sefd, chan, t, _ in RECEIVERS:
        print(f'  {name:30}' + ''.join(f'{beacon_range_ly(s * GRID_2040, sefd, chan, t):>9,.0f}' for s in shares))
    # check against Breakthrough Listen: Price et al. 2020 give about 2e10 W at the nearest stars
    print(f"  check: a big dish's 5-minute floor at 10 ly is {4 * math.pi * (10 * LY) ** 2 * f_min(10, 3, 300):.1e} W")

# ---------- Belt mining ----------
# Metal from metal-rich asteroids needs melting, not smelting: about 2 GJ a tonne.
# Hauling it home with solar-electric thrusters, 7.5 km/s at 30 km/s exhaust, 60% efficient:
# propellant 1 - exp(-dv/ve) of the load, mined there, and jet energy 1/2 m ve^2.
def haul_energy_per_kg(dv=7.5e3, ve=30e3, eff=0.6):
    prop = 1 - math.exp(-dv / ve)
    return 0.5 * prop * ve ** 2 / eff

def belt(flow_kt=120, process_gj=2, w_per_kg_at_1au=1000, au=2.7):
    per_kg = haul_energy_per_kg() + process_gj * 1e9 / 1000
    power = flow_kt * 1e6 * per_kg / YEAR
    w_per_kg = w_per_kg_at_1au / au ** 2
    arrays_kt = power / w_per_kg / 1e6
    print(f'Belt mining, {flow_kt} kt a year: {per_kg / 1e9 * 1000:.0f} GJ a tonne, {power / 1e9:.1f} GW, '
          f'{arrays_kt:.1f} kt of solar arrays at {au} AU ({w_per_kg:.0f} W/kg)')

# ---------- Far-side array ----------
# v1: a thousand square kilometers of dishes. On the Moon there is no wind and a sixth of the gravity,
# so a mesh dish can be light. FarView plans its antennas from lunar aluminum, made in place.
def far_side(area_km2=1000, kg_per_m2=1.0, efficiency=0.5, t_sys=30):
    mass_mt = area_km2 * 1e6 * kg_per_m2 / 1e9
    sefd = 2 * 1380 * t_sys / (area_km2 * 1e6 * efficiency)
    print(f'Far-side array, {area_km2:,} km2: about {mass_mt:.0f} Mt of lunar metal at {kg_per_m2} kg/m2, '
          f'SEFD about {sefd:.1e} Jy, {10 / sefd:,.0f} times a big dish')

# ---------- A world's hum: the tones, not the roar ----------
# A hum spread over 1 GHz is far too faint per hertz to rise above the radio sources behind it.
# What a far listener can catch are its pure tones: a digital TV station keeps a pilot tone of about 7% of its power,
# so a 1 MW station carries a tone near 70 kW. Tones smear as the world turns. Once its day and year are known,
# they can be unwound and stacked. Range grows as the fourth root of the stare.
def hum(power=4e7, band=1e9, ly=10):
    s = power / (4 * math.pi * (ly * LY) ** 2 * band) / JY
    print(f'A {power / 1e6:.0f} MW hum over {band / 1e9:.0f} GHz at {ly} ly: {s * 1e12:.0f} pJy per hertz, far below the background')

def tone_reach(tone=1e5):
    print(f'A {tone / 1e3:.0f} kW tone: how far each receiver hears it, in light-years')
    arrays = [('Big dish', 10), ('SKA-Mid', 1.1), ('Far-side array', 2 * 1380 * 30 / 5e8)]
    stares = [('1 day', 86400), ('1 Year', YEAR)]
    print(f"  {'':16}" + ''.join(f'{s:>10}' for s, _ in stares))
    for name, sefd in arrays:
        print(f'  {name:16}' + ''.join(f'{beacon_range_ly(tone, sefd, 1, t):>10,.1f}' for _, t in stares))

# ---------- An all-sky watch ----------
# Elements every 12.5 cm, as EMBRACE uses near 1.2 GHz, over a 100 m square, beamformed by FFT to every direction,
# then each beam searched for drifting tones. Two sites cover both hemispheres.
def all_sky(side=100, spacing=0.125, bandwidth=1e9, t_sys=30, efficiency=0.7):
    n = (side / spacing) ** 2
    beams = 4 * math.pi / (0.3 / side) ** 2
    fft = 5 * n * math.log2(n) * bandwidth
    search = 100 * beams * bandwidth * 5 * 30
    sefd = 2 * 1380 * t_sys / (side ** 2 * efficiency)
    print(f'All-sky watch, {side} m dense array: {n:,.0f} elements, {beams:,.0f} beams, SEFD about {sefd:.0f} Jy, '
          f'about {(fft + search):.0e} operations a second: {(fft + search) / 1e25:.0e} of 2040 compute')

# ---------- Growing compute ----------
# Earth's compute went from about 3e22 operations a second in 2026 to about 1e25 in 2040. That pace already holds the
# fabs built along the way, so it is what chips allow. Thinking draws about 0.25 TW of 24 at Year 0, and a data
# center's draw grows with its chips. So the fabs set how fast compute grows, and the grid sets how far.
def compute_growth(start=3e22, end=1e25, years=14, share=0.25 / 24, step=1.5):
    pace = (end / start) ** (1 / years)
    print(f'Compute grew {pace:.2f} times a year from 2026 to 2040. One ground data center a Year, each +{step - 1:.0%}:')
    for n in (1, 2, 3, 6, 11):
        print(f'  after {n:2}: {step ** n:5.1f} times the thought, drawing {share * step ** n:5.1%} of Year 0 energy')
    tenth, wall = (math.log(x / share) / math.log(step) for x in (0.1, 1))
    print(f'  a tenth of energy after {math.ceil(tenth)} data centers. Number {math.floor(wall) + 1} would need more than the whole grid: '
          f'about Year {wall:.0f}, {wall * 5:.0f} real minutes at full pace.')

# ---------- Matter in orbit at Year 0 ----------
# About 17,400 t is in orbit in October 2026: 77% payloads and 22% spent rocket bodies by mass, and about 18% of the
# satellites up are dead (ESA). About 3,200 t reached orbit in 2025, and lift reaches about 40 kt a year by 2040.
# Low-orbit craft such as Starlink's are built for about five years and then brought down. So most of what is up in
# 2040 is recent and working. What the Will can build from is what is spare.
def orbit_stock(now_kt=17.4, lift_2025=3.2, lift_2040=40, life=5, spare_kt=20):
    g = (lift_2040 / lift_2025) ** (1 / 15)
    launched = [lift_2025 * g ** k for k in range(1, 15)]            # 2026 to 2039
    print(f'Lift grows {g:.2f} times a year. Launched 2026 to 2039: {sum(launched):.0f} kt, on top of {now_kt} kt up in 2026.')
    print(f'  If craft last {life} years, about {sum(launched[-life:]):.0f} kt is up at Year 0, nearly all of it working.')
    print(f"  Spent stages are {0.22 * now_kt:.1f} kt of today's mass. Sample for Year 0: {spare_kt} kt spare, as depots, spent stages and dead craft.")
    up = sum(launched[-life:]); upkeep = up / life; spare_lift = lift_2040 - upkeep
    print(f'  Keeping {up:.0f} kt flying takes {upkeep:.0f} kt of lift a year. Spare lift: about {spare_lift:.0f} kt a Year.')
    for name, kt in (('Deep vault', 10), ('Launcher', 10), ('Cold compute annex', 100)):
        print(f'  {name}, {kt} kt: {kt / spare_kt:.1f} times the spare stock, {kt / spare_lift:.1f} Years of spare lift')
    # What lift spends. A fully reusable heavy lifter burns about 4,600 t of methane and oxygen for 100 to 150 t to
    # orbit, about 1,000 t of it methane at 50 MJ/kg. Order of magnitude: lift is short of pads and ships, not energy.
    gj_per_t = 1000e3 * 50e6 / 125 / 1e9
    print(f'  Propellant: about {gj_per_t:.0f} GJ a tonne lifted. {lift_2040} kt a year is {lift_2040 * 1e3 * gj_per_t * 1e9 / YEAR / 1e9:.1f} GW, '
          f'{lift_2040 * 1e3 * gj_per_t * 1e9 / YEAR / GRID_2040:.4%} of the grid.')

# ---------- Pricing the projects that raise a pace ----------
# Chip fabs: a second line of fabs fills a second data center a Year. Only so many data centers fit under the grid,
# so a faster line only reaches that ceiling sooner.
def wall_year(fits, more_lines=()):
    """The Year the last data center that fits is done, at one a Year for each line of fabs."""
    t = done = 0.0; lines = 1; ups = sorted(more_lines)
    while True:
        nxt = ups[0] if ups else math.inf
        if t + (fits - done) / lines <= nxt: return t + (fits - done) / lines
        done += (nxt - t) * lines; t = nxt; lines += 1; ups.pop(0)

# Works that speed building: one that takes P Years cuts a share c off everything not yet built. Settled 2026-10-11:
# that is later works, and the part left of works under way. So a work of T Years begun at Year 0 is done at
# P + (1 - c) * (T - P), or at T if it is done first. Starting at once is never worse than waiting.
GROUND = [('Launch complex', 2), ('Chip fabs', 3), ('All-sky watch', 6), ('Deep flash watch', 6), ('Spectrograph bank', 8),
          ('Ground solar build-out', 10), ('Deep-field receiver', 12), ('Fusion plants', 40)]
ORBIT = [('Cold compute annex', 12), ('A new infrared telescope', 18), ('Starshade', 20), ('Launcher', 24), ('Orbital foundry', 30), ('Habitat ring', 60)]
def raise_the_pace(share=0.25 / 24, step=1.5, fab=3, factory=(3, 1 / 3), yard=(5, 1 / 4)):
    fits = math.floor(math.log(1 / share) / math.log(step))
    one, two, three = wall_year(fits), wall_year(fits, [fab]), wall_year(fits, [fab, 2 * fab])
    print(f'Chip fabs, {fab} Years a line. {fits} data centers fit under the grid. One line fills them by Year {one:.0f}, '
          f'a second line by Year {two:.0f}, a third by Year {three:.1f}.')
    print(f'  Two lines make compute grow {step ** 2:.2f} times a Year. The chip stock grew 3.4 times a year in 2026.')
    for name, (own, cut), works in (('Factory-built works', factory, GROUND), ('Orbital yard', yard, ORBIT)):
        print(f'{name}, {own} Years, {cut:.0%} off whatever is not yet built. Both begun at Year 0:')
        for work, t in works:
            done = t if t <= own else own + (1 - cut) * (t - own)
            print(f'  {work:26} {t:3} Years alone, done at Year {done:4.1f} with it. Begun after it: {t * (1 - cut):4.1f} Years.')
    # The all-sky watch against real arrays: CHIME, built 2015 to 2017. SKA-Low, begun December 2022, done about 2030.
    side, spacing, sites = 100, 0.125, 2
    elements = sites * (side / spacing) ** 2
    print(f'All-sky watch: {elements / 1e6:.2f} million elements at {sites} sites, {elements / 131072:.0f} times SKA-Low\'s antenna count and '
          f'{elements / 1024:,.0f} times CHIME\'s receivers, on {sites * side ** 2 / 8000:.1f} times CHIME\'s area.')

# ---------- The long roads ----------
# Priced 2026-10-13, as samples, each against the best real plan found. Sources are in HOLOS_RESEARCH.md.
# - A new telescope with a 15 m mirror: 18 Years, the flagship standard. Its study aimed at a launch about 2039, from a
#   2019 report. About 40 t.
# - A laser sail array: 25 Years. Starshot aimed at a first launch within a generation.
# - A mass driver on the Moon: v1's 24 Years. O'Neill's group gave a rate, 600 kt a year, and no build time.
# - An orbital foundry: v1's 30 Years. It turns thrown rock into works.
# - A far-side array: v1's 30 Years, after the Moon's mine exists. FarView plans 4 to 8 years for a fifth of the area,
#   in far lighter antennas. Settled 2026-10-13: it grows in fifths, 6 Years each, and each hears farther.
# - Belt prospecting and mining: v1's 6 and 20 Years. Nothing like it has flown. 120 kt a year.
# - Power from orbit: about 10 Mt for a fifth more energy, so its pace is the pace matter arrives.
ROADS = dict(mirror=18, array=25, driver=24, foundry=30, far_side=30, prospect=6, mining=20)
DRIVER_KT, MINING_KT, ORBIT_POWER_MT = 600, 120, 10

def finish(start, years, helper=None, cut=0.0):
    """The Year a work is done. A speed-up that is done at `helper` takes `cut` off whatever is not yet built."""
    if helper is None or helper >= start + years: return start + years
    built = max(0, helper - start)
    return max(start, helper) + (years - built) * (1 - cut)

def long_roads(early=6.2, reading=9.4, yard=11.3, ly=4.32):
    """The mock's game: works begun when the Mind first offers them, at Year 6.2 and Year 9.4, with the yard done at 11.3."""
    mirror = finish(reading, ROADS['mirror'], yard, 0.25)
    array = finish(reading, ROADS['array']); word = array + ly / 0.2 + ly
    driver = finish(early, ROADS['driver']); foundry = finish(early, ROADS['foundry'], yard, 0.25)
    mining = finish(early, ROADS['prospect']) + ROADS['mining']
    far = driver + ROADS['far_side']; fifth = driver + ROADS['far_side'] / 5      # it grows in fifths: settled 2026-10-13
    rock = lambda y: DRIVER_KT * max(0, y - driver) + MINING_KT * max(0, y - mining)        # kt thrown or hauled by Year y
    y = max(driver, foundry)
    while rock(y) < ORBIT_POWER_MT * 1000: y += 0.1
    print(f'The long roads, in the mock\'s game. Begun at Year {early} or Year {reading}, with the yard done at Year {yard}:')
    for name, when, note in (
        ('A 15 m mirror', mirror, f'begun Year {reading}. Reads smog at most worlds it can split, in days to weeks'),
        ('Mass driver on the Moon', driver, f'begun Year {early}. Then {DRIVER_KT} kt of rock a Year'),
        ('Orbital foundry', foundry, f'begun Year {early}. Turns rock into works'),
        ('Belt mining', mining, f'prospecting from Year {early}. Then {MINING_KT} kt a Year'),
        ('Laser sail array', array, f'begun Year {reading}. Sails\' word from {ly} ly is home at Year {word:.0f}'),
        (f'{ORBIT_POWER_MT} Mt in orbit', y, 'enough for power from orbit: a fifth more energy'),
        ('Far-side array, first fifth', fifth, 'begun when the driver is done. Hears a 100 kW tone to 21 ly in a day'),
        ('Far-side array, whole', far, 'a fifth every 6 Years. Hears a 100 kW tone to 47 ly in a day')):
        print(f'  {name:28} Year {when:5.1f}  +{int(when * 5 // 60)}:{int(when * 5 % 60):02d} of play  {note}')
    print(f'  The grid limit is reached at about Year 11. Ground solar adds a fifth by Year 21. Power from orbit, from about Year {y:.0f}: '
          f'{y - 11:.0f} Years at the limit, {(y - 11) * 5 / 60:.1f} hours of play.')

if __name__ == '__main__':
    long_roads(); print()
    compute_growth(); print()
    orbit_stock(); print()
    raise_the_pace(); print()
    beacon(); print()
    belt(); belt(flow_kt=60); print()
    far_side(); print()
    hum(); tone_reach(); print()
    all_sky()
