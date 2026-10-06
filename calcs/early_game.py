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
    ('Sky watch, 1 day', 45, 1, 86400, 'CHIME-class area facing every direction at once: SEFD about 45 Jy'),
]
SNR, N_POL = 10, 2

def f_min(sefd, chan, t):
    return SNR * sefd * JY * math.sqrt(chan / (N_POL * t))

def beacon_range_ly(power, sefd, chan, t):
    return math.sqrt(power / (4 * math.pi * f_min(sefd, chan, t))) / LY

def beacon():
    print('Broadcast beacon: range for a steady tone, in light-years')
    shares = (0.001, 0.01, 0.1)
    print(f"  {'receiver':22}" + ''.join(f'{s:>9.1%}' for s in shares) + '   of 2040 energy')
    for name, sefd, chan, t, _ in RECEIVERS:
        print(f'  {name:22}' + ''.join(f'{beacon_range_ly(s * GRID_2040, sefd, chan, t):>9,.0f}' for s in shares))
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

if __name__ == '__main__':
    beacon(); print()
    belt(); belt(flow_kt=60); print()
    far_side()
