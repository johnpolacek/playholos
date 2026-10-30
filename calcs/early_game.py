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
    for name, kt in (('Deep vault', 10), ('Probe yard', 10), ('Cold compute annex', 100)):
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
ORBIT = [('Cold compute annex', 12), ('A new infrared telescope', 18), ('Starshade', 20), ('Probe yard', 24), ('Orbital foundry', 30), ('Habitat ring', 60)]
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
# - A mass driver on the Moon: v1's 24 Years. O'Neill's group gave a rate, 600 kt a year, and no build time. Checked
#   2026-10-16: a Chinese rotating launcher plans full scale by 2045, and a 2026 quenchgun study gives 263 kt a year.
# - An orbital foundry: v1's 30 Years. It turns thrown rock into works.
# - A far-side array: v1's 30 Years, after the Moon's mine exists. FarView plans 4 to 8 years for a fifth of the area,
#   in far lighter antennas. Settled 2026-10-13: it grows in fifths, 6 Years each, and each hears farther.
# - Belt prospecting and mining: v1's 6 and 20 Years. Nothing like it has flown. 120 kt a year. Still true in 2026:
#   AstroForge's Odin was lost in 2025, and nothing has been mined.
# - Power from orbit: about 10 Mt for a fifth more energy, so its pace is the pace matter arrives.
ROADS = dict(mirror=18, array=25, driver=24, foundry=30, far_side=30, prospect=6, mining=20)
# Settled 2026-10-15: a fusion drive, 30 Years at standard pace. A sample: no one has dated a flight engine.
ROADS['fusion_drive'] = 30
# Settled 2026-10-15: a seed ship takes 18 Years at standard pace, the flagship standard, built in the orbital yard.
ROADS['seed_ship'] = 18
DRIVER_KT, MINING_KT, ORBIT_POWER_MT = 600, 120, 10
# Settled 2026-10-26: cold power from orbit, the cold compute annex at scale. Chips at about 77 K do about 4 times the
# work per watt (He et al. 2024, Zhao et al. 2025, range 2 to 6), and below 50 K they gain little more. In space the
# cooler goes, but the radiator grows as 1/T^4: about 250 km^2 a GW at 77 K, at 4 g/m^2 of film. So a quarter of
# power from orbit's power gives the same thought, made and used up there: no beam, no field of antennas below.
COLD_GAIN, COLD_RADIATOR_KT_GW = 4, 1.0
def cold_annex_mt():
    power_gw = GRID_2040 / 5 / COLD_GAIN / 1e9                     # a quarter of a fifth more energy
    panels = ORBIT_POWER_MT * 1000 / (GRID_2040 / 5 / 1e9)        # kt a GW, as power from orbit's 10 Mt for its fifth
    return power_gw * (panels + COLD_RADIATOR_KT_GW) / 1000, power_gw
COLD_ANNEX_MT = round(cold_annex_mt()[0])

# Settled 2026-10-26: the halo survey. ALMA reaches about 25 uJy at 1 sigma in an hour in band 7, so 5 sigma at 850 um
# sees a compact 12 K halo of about 3e18 W at 10 pc, 25 times under the Herschel and JCMT limit, growing with distance
# squared. Band 3 then gives its color: grey, an index near 1.6, where dust is 2.4 to 3.1. An hour in each band at
# each star within 50 ly is about a Year of ALMA's time, so it looks again each Year. Haloes hundreds of AU wide are
# resolved out by the 12 m dishes, so it sees the compact ones.
HALO = dict(floor=3e18, every=1, years=1)

def halo_floor(T=12, lam=850e-6, sigma_mjy=0.025, snr=5, pc=10):
    h, k, c, sb = 6.626e-34, 1.381e-23, 3e8, 5.67e-8
    nu = c / lam; b = 2 * h * nu ** 3 / c ** 2 / (math.exp(h * nu / (k * T)) - 1)
    per_watt = math.pi * b / (sb * T ** 4) / (4 * math.pi * (pc * 3.086e16) ** 2) / 1e-29     # mJy a watt
    return snr * sigma_mjy / per_watt

def cold_annex():
    print(f'Halo survey: 5 sigma in an hour of ALMA band 7 sees {halo_floor(5):.0e} W at 5 K, {halo_floor():.0e} W at 12 K, '
          f'{halo_floor(28):.0e} W at 28 K, at 10 pc. The game uses {HALO["floor"]:.0e} W.')
    mt, gw = cold_annex_mt()
    print(f'Cold power from orbit: {gw:,.0f} GW of sunlight on chips at 77 K, {COLD_GAIN} times the work a watt, '
          f'thinks as much as power from orbit\'s {GRID_2040 / 5 / 1e12:.1f} TW on the ground.')
    print(f'  Panels at {ORBIT_POWER_MT * 1000 / (GRID_2040 / 5 / 1e9):.1f} kt a GW and radiators at {COLD_RADIATOR_KT_GW} kt a GW: {mt:.1f} Mt, '
          f'about {COLD_ANNEX_MT} Mt of rock against power from orbit\'s {ORBIT_POWER_MT}. A 100 kt pilot would add {0.1 / mt:.1%} of that.')

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

# ---------- Who sees a laser launch ----------
# Starshot's 0.2c point design (Parkin 2018, read 2026-10-14): 200 GW at 1.06 microns from a 2.7 km array, for 480 s a
# sail. The sail starts 60,000 km up and reflects 70% of the light, absorbs almost none, and passes the rest forward.
# Past its focus the light spreads at about the array's width over the sail's distance, so its footprint at the target
# shrinks as the sail climbs. This project's arithmetic: the forward light alone, 30% of the beam.
LASER_W, ARRAY_M, SAIL_START_M, PULSE_S, PASSED = 200e9, 2700, 6e7, 480, 0.30
def launch_glare(ly=4.32, stars_within_ly=50, stars=2000):
    d = ly * 9.4607e15; c = 2.998e8
    end_m = 0.5 * 0.2 * c * PULSE_S                           # about where the sail is when the beam stops
    sun_at = 3.828e26 / (4 * math.pi * d ** 2)                # the Sun's light at the target, all colors
    sun_nm = 0.65 * (1.496e11 / d) ** 2                       # the Sun's light per nanometre near 1 micron: about 0.65 W/m2 at Earth
    print(f'A laser launch, seen from {ly} ly. {PASSED:.0%} of {LASER_W / 1e9:.0f} GW passes the sail and goes on.')
    for label, L in (('as the beam starts', SAIL_START_M), ('as it stops', end_m)):
        r = d * ARRAY_M / (2 * L); flux = PASSED * LASER_W / (math.pi * r ** 2)
        print(f'  {label:18} a spot {2 * r / 1.496e11:6.2f} AU across at the target: {flux:.1e} W/m2, {flux / sun_at:.1e} of all the Sun\'s light there, '
              f'{flux / sun_nm:.2g} times the Sun\'s in that nanometre')
    half = ARRAY_M / (2 * SAIL_START_M)
    print(f'  The cone past the target is at most {half * 206265:.1f} arcseconds wide. Of about {stars} stars within {stars_within_ly} ly, '
          f'{stars * half ** 2 / 4:.0e} are expected in it: no one behind the target sees it.')
    print(f'  A laser\'s line is far narrower than a nanometre, so against the Sun in its own color it is brighter still. A swarm is a pulse per sail.')

# ---------- Thought buys speed ----------
# Settled 2026-10-13. More thought shortens a work, down to a floor physics sets. The form is Amdahl's: the part of a
# build that is planning shrinks as thought grows, and the part that is physical work does not.
# The floor is a sample, from one real data set. NASA science missions took 64 months from design to launch against a
# plan of 50, and ESA's 84 against 62. Missions with a launch window they could not miss took about 53, which the
# study calls a lower limit that can't be compressed (Joumier, Freaner, Bitten and Emmons 2012). 53 months is two
# thirds of what large missions took, and five sixths of the average. So a floor of two thirds.
FLOOR = 2 / 3
def paced(years, s=1.0, floor=FLOOR):
    """Years a work takes when given s times the thought its standard pace needs. Under 1 it runs slower than standard."""
    return years * (floor + (1 - floor) / s)

def thought_speed():
    print(f'Thought buys speed, down to a floor of {FLOOR:.0%} of the standard time. A work given s times its standard thought:')
    print('  ' + ''.join(f'{f"{s:g}x":>9}' for s in (0.5, 1, 2, 4, 10, 86)))
    for name, t in (('A 15 m mirror', ROADS['mirror']), ('Mass driver', ROADS['driver']), ('Laser sail array', ROADS['array']), ('One fifth of the far-side array', ROADS['far_side'] / 5)):
        print('  ' + ''.join(f'{paced(t, s):9.1f}' for s in (0.5, 1, 2, 4, 10, 86)) + f'  Years · {name}')
    print('  Half the thought costs a third more time. Four times the thought saves a quarter. Past ten times, almost nothing more.')
    print('  Rock from the Moon and flight between stars are physical. Thought shortens neither.')

# ---------- How much thought a work wants ----------
# Settled 2026-10-13: in scale with real cost. A work wants thought as its real cousin costs money, counted in
# flagships: one flagship is the Habitable Worlds Observatory, about 11 billion dollars. Four works have a real price.
# The megatonne works have none, so theirs are samples, in round numbers, to be tuned.
# One number ties the scale to the game: the first telescope takes 0.15 of Year 0's thought, the mocks' own share.
FLAGSHIP_THOUGHT = 0.15
WANTS = {  # work: (flagships, where the number comes from)
    'All-sky watch': (0.2, 'the SKA: about 1.9 billion euros with ten years of running'),
    'Deep-field receiver': (0.2, 'the SKA again'),
    'Infrared telescope': (1.0, 'the Habitable Worlds Observatory: about 11 billion dollars'),
    'A 15 m mirror': (2.0, 'LUVOIR-A: 18 to 24 billion dollars over its life'),
    'Laser sail array': (0.7, 'Starshot: 8 billion dollars for the ground beam director'),
    'Probe yard': (10, 'sample'), 'Belt mining': (20, 'sample'), 'Mass driver': (30, 'sample'), 'Orbital foundry': (30, 'sample'),
    'Far-side array, one fifth': (40, 'sample'), 'Power from orbit': (200, 'sample'), 'Cold annex': (80, 'sample: power from orbit\'s, for the same thought')}
LIMIT_THOUGHT = 1.5 ** 11                # eleven data centers fit under the grid
# A game whose Taiwan branch cut Earth's compute starts lower on the same curve: scale is Year 0's compute over the
# no-branch path's. Thinking's draw on energy scales with it, so the grid holds 96 times full Year 0 thought, and the
# fabs keep filling a center a Year until the next would pass that. At 67%, twelve fit, a Year later, at the same height.
# What is set aside, studies, observations and the data centers' build, is a share of that Earth's own Year 0 thought,
# so studies keep a tenth of it whatever a war left. Before 2026-10-22 it was the no-branch path's share, and at 20%
# compute the studies took half.
GRID_ROOM = 24 / 0.25
def centers(scale=1.0): return int(math.log(GRID_ROOM / scale) / math.log(1.5))

def at_the_limit(running=('A 15 m mirror', 'Laser sail array', 'Probe yard', 'Belt mining', 'Mass driver', 'Orbital foundry')):
    room = LIMIT_THOUGHT / FLAGSHIP_THOUGHT
    print(f'How much thought a work wants, in flagships. At Year 0 Earth has thought for {1 / FLAGSHIP_THOUGHT:.1f} flagships at standard pace. At the grid limit, for {room:.0f}.')
    for name, (f, src) in WANTS.items():
        print(f'  {name:26} {f:6g}   {f / room:6.1%} of thought at the limit   {src}')
    want = sum(WANTS[n][0] for n in running); s = room / want
    print(f'  The third mock\'s works at Year 12 want {want:.0f} flagships together. Split evenly, each gets {s:.1f} times its want and takes {paced(1, s):.0%} of its standard time.')
    for name in ('Mass driver', 'Power from orbit'):
        f = WANTS[name][0]
        print(f'  To push {name.lower()} to ten times its want takes {10 * f / room:.0%} of all thought at the limit, for {paced(1, 10):.0%} of its time.')
    later = want - WANTS['A 15 m mirror'][0] - WANTS['Laser sail array'][0] + WANTS['Far-side array, one fifth'][0] + WANTS['Power from orbit'][0]
    print(f'  From Year 36, with a fifth of the far-side array and power from orbit under way, the works want {later:.0f}: {later / room:.0%} of thought at the limit.')

# ---------- How thought is split ----------
# Settled 2026-10-14: by an order the player sets. A new work joins the end of the line, and the player can move it.
# This project's reading of the rule: the Mind first gives each work its want, in that order, so no work stops
# because another is first. Then it pushes them, in the same order, to ten times their want. Past ten times a work
# gains almost nothing (thought_speed), so the Mind stops there. What is left over sits idle, and the Mind says so.
# Power from orbit is paced by rock arriving, so it takes its want and no more.
PUSH = 10
WANTS['Ground solar'] = (20, 'sample')
WANTS['Solar lens'] = (0.5, 'sample: a few small sailcraft')
# Settled 2026-10-28: six Einstein Probe-class wide-field units cover the sky, about 9 t and $1.5B, 4 Years.
WANTS['X-ray sky watch'] = (0.15, 'six Einstein Probe-class units, about 1.5 billion dollars')
XRAY_YEARS = 4
WANTS['Halo survey'] = (0.05, 'sample: an observing program on a telescope we have')
# Settled 2026-10-29: the warm sky watch, a cooled all-sky mid-infrared telescope about 1.3 m wide, ten times deeper
# than WISE at 12 um. NEO Surveyor's 0.5 m took a development baseline of $1.2B, so about $2.5B: a sample, by aperture.
WANTS['Warm sky watch'] = (0.25, 'about 2.5 billion dollars: NEO Surveyor, 0.5 m, $1.2B, scaled by aperture')
WARM_YEARS = 8
# Settled 2026-10-29: the Moon search, a shift-and-stack program on telescopes we have, Rubin's class, to magnitude 28
# at the Earth-Moon L4 and L5 points. Observing time and software: a sample.
WANTS['Moon search'] = (0.01, 'sample: about 100 million dollars of observing time and software')
# Settled 2026-10-29: the asteroid tour, one probe of Tianwen-2's class mapping each Earth co-orbital asteroid in turn.
# Discovery-class, about half a billion dollars: a sample, since Tianwen-2's price isn't public.
WANTS['Asteroid tour'] = (0.05, 'sample: a Discovery-class probe, about 500 million dollars')
# Settled 2026-10-29: the halo array, our own ALMA-class array about ten times its speed for this one task, 40,000
# stars a Year. ALMA cost about 1.5 billion dollars: a sample, scaled.
WANTS['Halo array'] = (1.5, 'sample: about ten ALMAs\' worth of dishes and receivers, scaled from ALMA\'s 1.5 billion dollars')
# Wants for the seed ship's works, samples: no real price exists for any of them.
WANTS.update({'Fusion drive': (10, 'sample: no real price exists'), 'Seed ship': (5, 'sample'),
              'Deuterium works': (1, 'sample: twenty-four Bruce plants'), 'Seed ship line': (2, 'sample')})
D_WORKS_YEARS, D_WORKS_KT = 5, 8          # Bruce took 4 to 5 years. Twenty-four of its peak make about 8 kt of deuterium a Year
# Settled 2026-10-27: the Launch Tunnel, StarTram's Gen-1 (Powell, Maise and Rather 2010). A 110 km vacuum tunnel in a
# mountain throws 40 t craft out at 8.78 km/s, 10 a day: 128 kt of cargo a Year at 30 g, never people. $20B to build,
# about two flagships. They gave 10 to 20 years to first launch from 2010, so 12 is a sample. A ground build: no matter.
WANTS['Launch tunnel'] = (2.0, 'StarTram Gen-1: about 20 billion dollars')
TUNNEL_YEARS, TUNNEL_KT = 12, 128
# Settled 2026-10-28: the Orbital Ring, Birch's bootstrapped ring (JBIS 36, 115, 1983). A seed ring of Moon metal,
# 180 kt at 4 kg a metre, holds 20 ladders down to the ground, each lifting 300 kg a second: about 190 Mt a Year. The
# seed first lifts the full ring, 180 Mt of slag and cable, in about a year. Birch priced it all at $15B in 1975
# dollars, about $90B now, nine flagships. He gave about three years from lunar mining, which nothing has tested, so 10
# is a sample.
WANTS['Orbital ring'] = (9.0, "Birch's bootstrapped ring: $15B in 1975 dollars")
RING_YEARS, RING_SEED_KT, RING_KT = 10, 180, 189_000
# Settled 2026-10-28: Fusion Plants, a fleet of ARC-class plants. CFS's SPARC aims at first plasma in 2027 and ARC,
# 400 MW, in the early 2030s, so the first plants stand near Year 0. Half again Year 0's 24 TW is 12 TW, about 30,000
# such plants. A new plant must start on tritium the fleet breeds, about 1 kg per 100 MW of fusion (Abdou et al.
# 2021), so the fleet grows by doubling, as France's reactors went from 15 to 55 in the 1980s. From one plant, 15
# doublings at about 2 Years each: 30 Years, a sample. Its want is a sample between ground solar's and power from
# orbit's. Overnight costs run from $3,000 to $22,000 a kW in studies, so no real price fits a flagship count.
WANTS['Fusion plants'] = (100, 'sample: tens of trillions of dollars at any studied price')
FUSION_YEARS, FUSION_ENERGY = 30, 0.5
# Settled 2026-10-28: the Trojan Vault, a third home for our Mind inside 2020 XL5, the 1.2 km asteroid at Earth's L4
# (Santana-Ros et al. 2022). The Moon Vault's 10 kt of machines, flown a year or two out, and hollowing as long as the
# vault took: 12 Years, a sample. Its want a little over the Moon Vault's, a sample.
WANTS['Trojan vault'] = (1.5, 'sample: the Moon Vault\'s, and a longer reach')
TROJAN_YEARS, TROJAN_KT = 12, 10
# Settled 2026-10-28: the Cold Halo, the Cold Annex grown into a swarm that copies itself from asteroid rock, at 77 K,
# where our chips' gain stops (Zhao et al. 2025). Its factories take 10 Years and the annex's want, samples. Done, it
# doubles every 10 Years, as a neighbor's Mind grows, until taken back. Neighbors see it once its glow crosses their
# floor, 3e18 W at 10 pc for 12 K, times (77/12)^3 for 77 K, this project's arithmetic (once calcs/kin.py, retired 2026-10-29).
WANTS['Cold halo'] = (80, 'sample: the Cold Annex\'s')
COLD_HALO_YEARS, COLD_HALO_DOUBLING = 10, 10
# Settled 2026-10-28: the Rock Deflector, ten DART-class impactors of a tonne. DART took about five years from its
# start to launch on a few hundred million dollars, so 4 Years and a few hundredths of a flagship, samples. Which games
# see a rock is game/lib/game/rocks.ts.
WANTS['Rock deflector'] = (0.3, 'sample: ten DARTs, a few billion dollars')
DEFLECTOR_YEARS = 4
# Settled 2026-10-28, parity with what neighbors can do. Interceptors: stored kill vehicles of a tonne, readied as
# planetary defense's rapid-response studies ask, about 5 Years and $2B (Barbee et al.). Quiet radars: the concept's
# cut, 2 Years of ground work. A picket yard builds pellet screens in orbit, each 2,000 t and 4 Years, our estimate. A
# strike yard readies bullets of 1,000 t, as a neighbor's: 20 Years each once the yard stands. Its want and Years are
# samples between the probe yard's and the fusion drive's.
WANTS.update({'Interceptor': (0.2, 'about 2 billion dollars'), 'Quiet radars': (0.01, 'sample: ground work'),
              'Picket yard': (0.5, 'sample'), 'Strike yard': (3, 'sample')})
INTERCEPTOR_YEARS, QUIET_YEARS, PICKET_YEARS, STRIKE_YARD_YEARS = 5, 2, 6, 10
def split(line, room, push=PUSH):
    """line: (name, want, most) in the player's order, most = how many times its want it can use. Returns {name: s}, idle."""
    give = {}
    for name, want, most in line:
        give[name] = min(want, room); room -= give[name]
    for name, want, most in line:
        more = min(want * (most - 1), room); give[name] += more; room -= more
    return {name: give[name] / want for name, want, _ in line}, room

def replay(order, start=12.0, dt=0.01, studies=0.1, show=True, early=None, scale=1.0, extra=(), front=()):
    """The third mock's game from Year 12, every work paced by the thought the player's order gives it. The probe yard
    and the laser array were begun earlier: `early` gives their standard Years left at Year 12, from first_hour()."""
    early = early or first_hour(show=False, scale=scale)[1]
    n = centers(scale)
    left = {'Probe yard': early['Probe yard'], 'Laser sail array': early['Laser sail array'], 'Ground solar': 10, 'A 15 m mirror': ROADS['mirror'] * 0.75,
            'Mass driver': ROADS['driver'], 'Orbital foundry': ROADS['foundry'] * 0.75, 'Belt mining': ROADS['prospect'] + ROADS['mining']}
    line = [w for w in order if w in left]
    done, fifths, y, first, dc12, spare = {}, 0, start, None, math.inf, []
    rock = lambda y: DRIVER_KT * max(0, y - done.get('Mass driver', math.inf)) + MINING_KT * max(0, y - done.get('Belt mining', math.inf))
    extra = sorted(extra)                                       # (Year, work, standard Years): works the player adds later, and keeps last in the line
    added = {w for _, w, _ in extra}
    while y < 80 and (fifths < FIFTHS_TOTAL or extra or any(w in line for w in added)):
        while extra and extra[0][0] <= y + 1e-9:
            _, w, years = extra.pop(0); left[w] = years
            if w in front: line.insert(0, w)                  # the player moved it to the front of the line
            else: line.append(w)
        room = scale * 1.5 ** (min(n, sum(y >= d for d in dc_done(n))) + (y >= dc12)) / FLAGSHIP_THOUGHT - scale * studies / FLAGSHIP_THOUGHT
        s, idle = split([(w, WANTS[w.split(' (')[0]][0], 1 if w == 'Power from orbit' else PUSH) for w in line], room)
        if first is None: first = dict(s, idle=idle)
        spare.append((y, idle / room))
        for w in list(line):
            if w == 'Power from orbit':
                if rock(y) >= ORBIT_POWER_MT * 1000: done[w] = y; line.remove(w); dc12 = y + 1
                continue
            left[w] -= dt / paced(1, s[w])
            if w == 'Belt mining' and 'Belt prospecting' not in done and left[w] <= ROADS['mining']: done['Belt prospecting'] = y
            if left[w] <= 0:
                line.remove(w)
                if w != 'Far-side array, one fifth': done[w] = y
                k = next((i for i, x in enumerate(line) if x in added and x not in front), len(line))    # before the works added later, unless moved first
                if w == 'Mass driver': line[k:k] = ['Far-side array, one fifth', 'Power from orbit']; left['Far-side array, one fifth'] = ROADS['far_side'] / 5
                if w == 'Far-side array, one fifth':
                    fifths += 1; done[f'Far-side array, fifth {fifths}'] = y
                    if fifths < FIFTHS_TOTAL: line.insert(k, w); left[w] = ROADS['far_side'] / 5
        y += dt
    if show:
        print('  At Year 12: ' + ', '.join(f'{w.lower()} {first[w]:.1f}x' for w in order if w in first) + f'. Idle: {first["idle"]:.0f} flagships.')
        for w, when in sorted(((w, v) for w, v in done.items() if w != 'spare'), key=lambda x: x[1]):
            print(f'    {w:30} Year {when:5.1f}')
    done['spare'] = spare
    return done

# ---------- The first hour, paced ----------
# Settled 2026-10-14 for the mocks: one replay from Year 0. The first two mocks' builds are paced by the same line,
# in the order begun. Thought grows with each data center: 1.5 times, done at Year 1, 2.1, 3.1 and so on to 11.1. Data
# centers are paced by the fabs, and observations by physics, so neither is in the line: their thought is set aside.
# Wants of the first hour's works, in flagships. The all-sky watch and the telescope are real-priced above. The rest
# are samples: the mocks' own shares of Year 0's thought, turned into flagships.
WANTS.update({'Deep flash watch': (0.1, 'sample'), 'Moon vault': (1.0, 'sample: the mocks\' 15% of Year 0'),
              'Launch complex': (0.3, 'sample: the mocks\' 5%'), 'Orbital yard': (0.7, 'sample: the mocks\' 10%')})
def dc_done(n=11): return (1.0,) + tuple(i + 1.1 for i in range(1, n))
DC_DONE = dc_done()
# (work, start Year, standard Years): the mocks' starts. The telescope has 8 Years left of its real schedule at Year 0.4.
# Paced, the telescope is done at Year 6.1, so the player reads Alpha Centauri A and starts the laser array at Year 7.
FIRST_HOUR = (('All-sky watch', 0, 6), ('Deep flash watch', 0, 6), ('Infrared telescope', 0.4, 8), ('Moon vault', 1.6, 10),
              ('Launch complex', 1.7, 2), ('Orbital yard', 6.3, 5), ('Probe yard', 6.3, 24), ('Laser sail array', 7.0, ROADS['array']))
SET_ASIDE_BASE = ((0, 99, 0.10), (0, 0.1, 0.05), (0.8, 2.8, 0.05), (1.1, 2.1, 0.10), (1.8, 3.0, 0.10), (6.2, 10.2, 0.10))
def set_aside(dcs=DC_DONE): return SET_ASIDE_BASE + tuple((d - 1, d, 0.05) for d in dcs)    # studies, observations, a Year's listening, the telescope's reads, the data centers
SET_ASIDE = set_aside()
def first_hour(until=12.0, dt=0.005, show=True, scale=1.0):
    """Years 0 to 12, every build paced by the line. Returns when each is done, standard Years left at `until`, and
    the share of thought idle through the hour, as (Year, share). scale: Year 0's compute over the no-branch path's."""
    left = {w: years for w, _, years in FIRST_HOUR}; start = {w: t for w, t, _ in FIRST_HOUR}
    done, y, shown, spare = {}, 0.0, {}, []
    dcs = dc_done(centers(scale)); aside = set_aside(dcs)
    while y < until:
        room = scale * 1.5 ** sum(y >= d for d in dcs) / FLAGSHIP_THOUGHT - scale * sum(share for a, b, share in aside if a <= y < b) / FLAGSHIP_THOUGHT
        line = [w for w, t, _ in FIRST_HOUR if t <= y and w not in done]
        s, idle = split([(w, WANTS[w][0], PUSH) for w in line], room)
        spare.append((y, idle / (room + scale * sum(share for a, b, share in aside if a <= y < b) / FLAGSHIP_THOUGHT)))
        for w in line:
            if w not in shown: shown[w] = (y, s[w])
            left[w] -= dt / paced(1, s[w])
            if w == 'Probe yard' and 'Orbital yard' in done and not done.get('yard cut'): left[w] *= 0.75; done['yard cut'] = y
            if left[w] <= 0: done[w] = y
        y += dt
    done.pop('yard cut', None)
    if show:
        print(f'The first hour, paced by the line in the order begun. Standard dates in brackets.')
        std = dict(zip([w for w, *_ in FIRST_HOUR], (6, 6, 8.4, 11.6, 3.7, 11.3, 25.55, 32)))
        for w, *_ in FIRST_HOUR:
            when = f'Year {done[w]:5.1f}' if w in done else f'{left[w]:.1f} standard Years left at Year {until:g}'
            print(f'  {w:20} {when:36} [{std[w]}]   first given {shown[w][1]:.1f} times its want')
    return done, left, spare

FIFTHS_TOTAL = 5
BY_START = ('Probe yard', 'Laser sail array', 'Ground solar', 'A 15 m mirror', 'Mass driver', 'Orbital foundry', 'Belt mining')
MATTER_FIRST = ('Mass driver', 'Belt mining', 'Orbital foundry', 'Probe yard', 'Laser sail array', 'Ground solar', 'A 15 m mirror')
def thought_split():
    print(f'How thought is split: by the player\'s order. Each work gets its want in that order, then each is pushed to {PUSH} times its want.')
    for name, order in (('In the order begun, the default', BY_START), ('Matter first: driver, belt, foundry', MATTER_FIRST)):
        print(f'  {name}:'); d = replay(order)
        print(f'    The plateau ends at Year {d["Power from orbit"] + 1:.1f}: {d["Power from orbit"] + 1 - 11.1:.0f} Years, {(d["Power from orbit"] + 1 - 11.1) * 5 / 60:.1f} hours of play.')
    print('  The order moves the small works by Years, and matter\'s road by about one. Rock from the Moon sets that pace.')

# ---------- A seed ship, and what pushes it ----------
# Settled 2026-10-14: every seed stands alone, so a seed ship weighs about 1,500 t (Gros 2017's case, Freitas 1980's
# seed). Priced 2026-10-14 from a research agent's sources, logged in HOLOS_RESEARCH.md, "Pricing a seed ship". The
# arithmetic here is this project's. Three pushes to a tenth of light speed, all open to the Will.
C = 2.998e8
def seed_ship(ship_t=1500, v=0.1, grid_tw=24):
    print(f'A seed ship of {ship_t:,} t to {v:g} of light speed. It brakes on its sail, so it carries no braking fuel.')
    # 1. Light. A sail takes at best 2P/c of push, so the light it needs is at least m v c / 2.
    e = ship_t * 1e3 * v * C * C / 2
    print(f'  Laser: at least {e:.1e} J of light, {e / (grid_tw * 1e12 * YEAR):.1f} Years of Earth\'s whole Year 0 grid.')
    print('    About 50 TW from an array 100 km across, by Lubin 2016\'s scaling. In space that is about 150 Mt by NASA\'s 2024')
    print('    ratio for space power, or about 2 Gt with Lubin\'s masses for lasers, panels and radiators today.')
    print(f'    The long roads bring {DRIVER_KT + MINING_KT} kt of rock a Year, so it waits on industry that copies itself.')
    # 2. Deuterium. Firefly's exhaust, 12,000 km/s, and its engine and radiators, 2,050 t for 600 kN.
    ve, kg_per_n = 1.2e7, 2050e3 / 6e5
    ratio = math.exp(v * C / ve)
    for burn in (20, 30):
        n_per_t = (ratio - 1) * 1e3 * ve / (burn * YEAR)              # average thrust per tonne of dry ship
        k = kg_per_n * n_per_t / 1e3                                  # tonnes of engine per tonne of dry ship
        dry = ship_t / (1 - k); fuel = (ratio - 1) * dry
        print(f'  Deuterium, a {burn}-Year burn: mass ratio {ratio:.1f}, engine and radiators {dry - ship_t:,.0f} t, {fuel:,.0f} t of deuterium.')
    d2o = 40e3 * 20 / 4                                               # tonnes of heavy water holding 40,000 t of deuterium
    print(f'    40,000 t of deuterium is {d2o:,.0f} t of heavy water: {d2o / 1600:.0f} Years of Canada\'s Bruce plant at its peak,')
    print(f'    or 10 Years of works twelve times its size. Bruce took 4 to 5 years to build. At 36 GJ a kg of heavy water,')
    print(f'    {d2o * 1e3 * 36e9:.1e} J: {d2o * 1e3 * 36e9 / (grid_tw * 1e12 * YEAR):.0%} of a Year of the grid.')
    print('    The drive itself: Firefly needs a 1,175 GW pinch held steady. Zap Energy\'s best ran 39 kW. No one has dated a flight engine.')
    # 3. Helium-3. Daedalus's exhaust, 10,600 km/s. 60% of D-He3 fuel by mass is helium-3.
    ratio3 = math.exp(v * C / 1.06e7)
    print(f'  Helium-3: mass ratio {ratio3:.0f}. About 20,000 t of helium-3, from Uranus: Palaszewski needs 20 to 110 kt of craft')
    print('    for 5,000 t of fuel over 10 years. The Moon holds about 200,000 t in its richest soil, spread thin. No engine yet')
    print('    burns it: Helion reached about 13 keV in 2026, and the burn wants about 60.')

# ---------- A production line ----------
# Settled 2026-10-15: a production line is a project of its own, for one kind of work. Without one, every copy takes
# the full standard time. With one, copies run side by side, as many as matter, energy and thought allow, and each
# takes less: NASA's Cost Estimating Handbook gives a typical aerospace learning rate of 85%, each doubling of the
# count built taking 85% of the labor. Liberty ships went from about 230 days to a median of 39 over 2,710 ships, close
# to what 85% predicts. Setting up a line costs what the factory and yard projects do, samples: 3 Years on the ground,
# 5 in orbit. It can't shorten supply, flight between stars, or light coming home.
LEARN, LINE_GROUND, LINE_ORBIT = 0.85, 3, 5
def copy_years(standard, n, rate=LEARN):
    """Standard Years for the nth copy of a work built on a production line. The first is the full time."""
    return standard * n ** (math.log(rate) / math.log(2))
def production_line():
    print(f'A production line: {LINE_GROUND} Years to set up on the ground, {LINE_ORBIT} in orbit. Each copy then takes the')
    print(f'standard time times n to the {math.log(LEARN) / math.log(2):.3f}: {LEARN:.0%} each time the count doubles.')
    print('  Seed ships, 18 Years standard: ' + ', '.join(f'copy {n} {copy_years(18, n):.1f}' for n in (1, 2, 4, 8, 16, 32)) + '.')
    print(f'  Check: 2,710 Liberty ships at {LEARN:.0%} predict {1 / copy_years(1, 2710):.1f} times faster. They went from 230 days to 39: {230 / 39:.1f}.')

# ---------- Ships that carry people ----------
# Priced 2026-10-15 from a research agent's sources, logged in HOLOS_RESEARCH.md, "Ships that carry people". Shielding
# is most of a crewed ship: the Stanford torus carries about 990 t of shield a person, and Hein 2012's world ship about
# 600 t a person in all. Samples: a crew of 500, as world ship studies' village modules, at 1,000 t a person.
def people_ships(crew=500, t_each=1000, ly=4.37, grid_tw=24):
    ve = 1.2e7; grid_year = grid_tw * 1e12 * YEAR
    dry = crew * t_each
    print(f'Ships that carry people, to {ly} ly.')
    # Frozen embryos ride a seed ship. Wakayama 2021: sperm took 30 Gy of x-rays and still gave pups. Deep space gives
    # 0.35 to 0.5 mGy a day (MSL RAD, OLTARIS), so 165 to 235 years unshielded, if embryos are like sperm.
    trip = ly / 0.1 + 10 + 15
    print(f'  Embryos on a seed ship: under a tonne of bank, a {trip:.0f}-Year trip. 30 Gy at 0.35 to 0.5 mGy a day lasts '
          f'{30 / 0.5e-3 / 365.25:.0f} to {30 / 0.35e-3 / 365.25:.0f} years. No womb yet carries a mammal from conception to birth.')
    # Settled 2026-10-15: sleepers work. Packed at about 3 cubic metres each, 500 fill a sphere about 14 m across. To hold
    # the dose near NASA's 0.6 Sv career limit over 70 Years, about 10 t a square metre of water (Globus and Strout 2017
    # give 6 to 7 for 20 mSv a year). Samples, and this project's arithmetic.
    r = (3 * 3 * crew / (4 * math.pi)) ** (1 / 3); sleeper_dry = 2 * (4 * math.pi * r * r * 10 + 0.5 * crew)    # shield, pods, and a sail as heavy
    print(f'  {crew} sleepers at 0.1 of light speed: about {sleeper_dry:,.0f} t dry with its sail, {sleeper_dry / crew:.0f} t a person. '
          f'{(math.exp(0.1 * C / ve) - 1) * sleeper_dry / 1e3:,.0f} kt of deuterium. About {trip:.0f} Years to arrive.')
    for v in (0.1, 0.01):
        fast = v >= 0.05
        ratio = math.exp(v * C / ve) ** (1 if fast else 2)          # a slow ship can't brake on a sail, so it burns both ways
        dry = crew * t_each * (2 if fast else 1)                    # a fast one carries a sail as heavy as the rest, as Gros's case
        fuel = (ratio - 1) * dry
        light = dry * 1e3 * v * C * C / 2
        t = ly / v + (25 if v >= 0.05 else 2)
        print(f'  {crew} people at {v:g} of light speed: {dry / 1e6:.1f} Mt dry, mass ratio {ratio:.2f}, {fuel / 1e6:.1f} Mt of deuterium '
              f'({fuel * 5 / 1e6:.0f} Mt of heavy water, {fuel * 5e3 * 36e9 / grid_year:.1f} Years of the grid to make). '
              f'By laser: {light / grid_year:,.0f} Years of the grid. About {t:.0f} Years to arrive.')

if __name__ == '__main__':
    long_roads(); print()
    cold_annex(); print()
    thought_speed(); print()
    at_the_limit(); print()
    first_hour(); print()
    launch_glare(); print()
    thought_split(); print()
    compute_growth(); print()
    orbit_stock(); print()
    raise_the_pace(); print()
    beacon(); print()
    belt(); belt(flow_kt=60); print()
    far_side(); print()
    hum(); tone_reach(); print()
    all_sky(); print()
    seed_ship(); print()
    production_line(); print()
    people_ships()
