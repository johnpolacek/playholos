"""Mid- and late-game calculations for HOLOS_PROJECT_AUDIT.md. Run: python3 calcs/late_game.py

Each one is an order of magnitude from published numbers, not a design. Sources are in HOLOS_RESEARCH.md.
"""
import math

C = 2.998e8             # m/s
AU = 1.496e11           # m
LY = 9.4607e15          # m
YEAR = 3.156e7          # s
TW_YEAR = 1e12 * YEAR   # J
GRID_2040 = 24e12       # W
MEV = 1.602e-13         # J
AMU = 1.6605e-27        # kg

def kinetic(m, beta):
    return (1 / math.sqrt(1 - beta ** 2) - 1) * m * C ** 2

# ---------- Fusion fuel ----------
# Exhaust speed from the charged products a pulse can direct: ve = sqrt(2 * burnup * E / m).
# D-He3 gives 18.35 MeV per 5 amu, all charged. D-D gives about 2.4 MeV charged per 4 amu. The rest leaves as neutrons.
BURNUP = 0.2
def exhaust_c(mev_charged, amu):
    return math.sqrt(2 * BURNUP * mev_charged * MEV / (amu * AMU)) / C
VE = {'D-He3': exhaust_c(18.35, 5), 'D-D': exhaust_c(2.4, 4), 'Daedalus as designed': 1.06e7 / C}
HE3_SHARE = 3 / 5                   # of D-He3 fuel, by mass
HE3_IN_JUPITER = 0.24 * 0.75 * 1.66e-4   # helium mass fraction x He3/He4 by mass
DAEDALUS_HE3_T, DAEDALUS_YEARS = 30000, 20

def fuel_per_tonne(dv_c, ve_c):
    """Tonnes of propellant per tonne of payload, one stage, non-relativistic rocket equation."""
    return math.exp(dv_c / ve_c) - 1

def fusion():
    print('Fusion exhaust speed: ' + ', '.join(f'{k} {v:.3f}c' for k, v in VE.items()))
    # One ideal stage understates real ships: Daedalus carried 111 t of fuel per tonne of payload to 0.12c.
    real = (50000 / 450) / fuel_per_tonne(0.12, VE['Daedalus as designed'])
    print(f'  Daedalus needed {real:.1f} times the ideal one-stage fuel: stages, tanks and engines. Applied below.')
    trips = [('Heavy impactor, 0.2c', 0.2), ('Heavy impactor, 0.1c', 0.1), ('Slow impactor, 0.05c', 0.05),
             ('Flyby probe, 0.1c', 0.1), ('Torch probe, 0.08c and stop', 0.16), ('Seed probe, 0.04c and stop', 0.08),
             ('Torch ship, 0.1c and stop', 0.2)]
    print(f"  {'tonnes of fuel per tonne of payload':40}{'Daedalus':>12}{'D-D':>14}")
    for name, dv in trips:
        print(f"  {name:40}{real * fuel_per_tonne(dv, VE['Daedalus as designed']):>12,.0f}{real * fuel_per_tonne(dv, VE['D-D']):>14,.0f}")
    bullet = 1000 * real * fuel_per_tonne(0.2, VE['Daedalus as designed'])
    he3 = bullet * HE3_SHARE
    print(f'  A 1,000 t bullet at 0.2c: {bullet / 1e3:,.0f} kt of D-He3, {he3 / 1e3:,.0f} kt of it He3, '
          f'from {he3 / HE3_IN_JUPITER / 1e9:.1f} Gt of Jupiter\'s air. Daedalus planned {DAEDALUS_HE3_T / 1e3:.0f} kt in {DAEDALUS_YEARS} Years.')
    for beta, what in ((0.2, '1,000 t at 0.2c'), (0.05, '1,000 t at 0.05c')):
        e = kinetic(1e6, beta)
        rock_kg = e / (0.5 * 2e4 ** 2)                       # the same energy as rock at 20 km/s
        asteroid_km = 2 * (3 * rock_kg / 2500 / (4 * math.pi)) ** (1 / 3) / 1000
        print(f'  {what} hits with {e:.1e} J, like a {asteroid_km:.1f} km asteroid at 20 km/s')

# ---------- Deflector laser ----------
# Ablation pushes a bullet sideways: thrust = Cm x power on target, Cm about 1e-4 N/W (Phipps et al.).
# It must move the bullet one Earth radius plus margin in the time left. The spot is about wavelength x range / aperture,
# and a bullet only catches the share of the spot its own face covers.
def deflector(range_au, aperture_m, beta=0.2, mass=1e6, face_m=6.2, miss=1e7, cm=1e-4, wavelength=1e-6):
    d = range_au * AU; t = d / (beta * C)
    on_target = mass * miss / t / t / cm
    spot = wavelength * d / aperture_m
    share = min(1, (face_m / spot) ** 2)
    return on_target / share, t

def deflector_table():
    print('Deflector laser: power for a 1,000 t bullet at 0.2c, engaged at a range, by aperture')
    for au in (0.3, 1, 3):
        cells = []
        for ap in (1e3, 1e4):
            p, t = deflector(au, ap); cells.append(f'{ap / 1e3:.0f} km: {p / 1e12:,.1f} TW')
        print(f'  {au} AU, {t / 60:.0f} minutes of fire: ' + ', '.join(cells))

# ---------- Antimatter ----------
# Annihilating 1 kg of antimatter with 1 kg of matter releases 2 x 9e16 J. Assume 20% reaches the probe's motion,
# and the probe needs its 0.2c twice: once out, once to stop.
def antimatter(probe_t=10, beta=0.2, use=0.2):
    need = 2 * kinetic(probe_t * 1000, beta) / use
    anti_kg = need / (2 * C ** 2)
    print(f'Antimatter probe, {probe_t} t to {beta}c and a stop: {anti_kg:,.0f} kg of antimatter')
    for eta in (1e-9, 1e-4, 1e-2):
        tw_years = anti_kg * C ** 2 / eta / TW_YEAR
        print(f'  made at {eta:.0e} efficiency: {tw_years:,.0f} TW-years, {tw_years / (GRID_2040 / 1e12):,.0f} Years of all 2040 energy')

# ---------- Mind transmitter ----------
# A diffraction-limited laser link: the receiver catches (Dt x Dr / (wavelength x d))^2 of the beam.
# Ten photons a bit at the receiver. The mind's size is an assumption: 100 PB.
def mind(bits=8e17, ly=10, wavelength=1e-6, photons=10):
    print(f'Mind transmitter, 100 PB across {ly} ly at 1 µm')
    photon = 6.626e-34 * C / wavelength
    for ap in (10, 100, 1000):
        caught = (ap * ap / (wavelength * ly * LY)) ** 2
        joules = bits * photons * photon / caught
        print(f'  {ap:,} m apertures both ends: {joules:.1e} J, {joules / 1e9 / 86400:,.1f} days at 1 GW')

# ---------- Smaller rules ----------
def rules():
    ve = 30e3
    print(f'Wandering habitats: 10 m/s of random burns a year costs {1 - math.exp(-10 / ve):.2%} of the habitat a year in propellant')
    for dv in (1e3, 3e3):
        print(f'Shadow berths: {dv / 1e3:.0f} km/s to move behind a moon costs {1 - math.exp(-dv / ve):.0%} of the works, once')
    earth_disk = math.pi * 6.371e6 ** 2
    print(f'Sunshade at 1 g/m2: all of Earth {earth_disk * 1e-3 / 1e9:,.0f} Mt, one 100 km site {math.pi * 5e4 ** 2 * 1e-3 / 1e6:,.1f} kt')
    swarm = 4 * math.pi * AU ** 2 * 1e-3
    print(f'Solar swarm at 1 g/m2 around 1 AU: {swarm:.1e} kg, {swarm / 3.30e23:.2%} of Mercury, '
          f'{math.log2(swarm / 1e6):.0f} doublings from a 1 kt seed')
    d_per_kg_d2o = 850 * 3.6e6          # electrolysis, the costly upper bound
    print(f'Deuterium by electrolysis: {d_per_kg_d2o * 5 / 1e9:.0f} GJ per kg of deuterium, the upper bound')

if __name__ == '__main__':
    fusion(); print()
    deflector_table(); print()
    antimatter(); print()
    mind(); print()
    rules()
