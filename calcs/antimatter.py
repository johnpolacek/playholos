"""Antimatter in bulk, made on the Solar Swarm's power, for craft that stop faster than fusion's tenth of light speed.
Run: python3 calcs/antimatter.py

Started 2026-11-12, the designer's word: make the science into builds, starting with antimatter. Sources in
HOLOS_RESEARCH.md, "Antimatter by the tonne, read". Each number is from a published estimate, or marked ours or a sample.

- Making it. The energy that ends as antimatter: 3.9e-10 at Fermilab, 3.9e-5 in a plant built for it with known
  technology, never more than half (Schmidt et al. 2000). With a swarm round the Sun, energy stops being the bar.
- Pushing with it. A beamed core engine: the charged pions from each annihilation, turned out the back by a magnetic
  nozzle. Frisbee 2003 drew the craft round it. Keane and Zhang 2012 found a nozzle more than twice as good.
- Stopping with it. A rocket that stops needs no gas to brake on, so its stop is the same at every star.
- Its price: its heat holds it to a hundredth of a g, so it is slow to start and slow to stop, and its stop is a
  flame pointed at the star it stops at.
"""
import math
import mercury
import speeds

C, YEAR, LY, G = 299_792_458.0, 3.15576e7, 9.4607e15, 9.80665

# ---------- Making it ----------
# Schmidt, Gerrish, Martin, Smith and Meyer 2000, J. Propulsion and Power 16: the share of the wall plug's energy that
# ends as antiprotons. At Fermilab, 7.8e-8 from the target and 5e-3 at the plug: 3.9e-10. A plant built for it, one
# antiproton for 20 collisions and a tenth at the plug, "based on existing technology": 3.9e-5. Each antiproton is
# made with an ordinary partner, so never more than half.
ETA_TODAY, ETA_PLANT, ETA_MOST = 3.9e-10, 3.9e-5, 0.5
J_PER_KG = C ** 2 / ETA_PLANT                                   # about 2.3e21, against 2.3e26 today
# What it runs on: a share of what the swarm turns to power, its collectors' fifth of the light they catch
# (calcs/mercury.py). A hundredth, a sample: the swarm doubles every 2 Years, so any share from a thousandth to a tenth
# moves the Year a craft's fuel is in by under 7 Years either way, and a hundredth costs our thought nothing it shows.
SHARE = 0.01
def kg_a_year(doublings):
    """Antimatter a Year from the Works, with the swarm grown so many doublings past its seed."""
    watts = mercury.SEED_W * 2 ** min(doublings, mercury.SWARM_FULL)
    return SHARE * mercury.EFF * watts * YEAR / J_PER_KG
def made_by(years, from_doubling=0.0):  # for checks by hand
    """Antimatter made, kg, over `years` of the swarm growing on, from a Works done at `from_doubling`."""
    n0, kg, step = from_doubling, 0.0, 1 / 64
    for i in range(int(years / step)):
        kg += kg_a_year(n0 + (i + 0.5) * step / mercury.DOUBLING) * step
    return kg
# The Works itself: accelerators, cooling rings and traps built through the swarm. Samples, as Mercury Works' fleet.
WORKS_YEARS, WORKS_WANT = 10, 3.0

# ---------- Keeping it ----------
# Not shown at any scale that counts. A trap holds about a million antiprotons. 92 rode a truck for half an hour at CERN
# on 2026-03-24 (Physics World). A gram is 6.5e21 times that. Ice of antihydrogen held off the walls by a magnetic
# bottle, diamagnetic as hydrogen is, or charged and held between electrodes, is proposed (Forward and Davis 1988, as
# LaPointe 2020 draws it) and never made. Taken to work: improbable, not contradicted. Nothing below depends on how.

# ---------- Pushing with it ----------
# Proton on antiproton gives on average 3 charged pions and 2 neutral (LaPointe 2020). The neutral ones turn to gamma
# rays at once, so only the charged ones can push: their rest mass is 3 x 139.57 MeV of the 1,876.5 MeV that annihilates,
# 22%. A magnetic nozzle turns a share of their momentum, its efficiency, out the back.
CHARGED_SHARE = 3 * 139.57 / 1876.5
def thrust_share(v, nozzle):
    """Momentum out the back, times c, for each unit of energy annihilated: the rocket's exhaust speed, in c, counting
    what leaves as gamma rays and neutrinos and pushes nothing. Its rapidity grows by this times the log of its mass
    ratio, exactly, as a photon rocket's grows by the log alone. Ours, from the pions' momentum."""
    return CHARGED_SHARE * v / math.sqrt(1 - v ** 2) * nozzle
# Frisbee 2003, by way of Morgan 1974: pions at 0.92 of light speed, through Callas's nozzle at 36%. Keane and Zhang
# 2012, by Geant4: pions at 0.81, measured spectra their own 2011 paper took up, through a nozzle 3.8 m long at 85%,
# with a field of 12 T at its strongest, which "could be produced today".
K_FRISBEE = thrust_share(0.92, 0.36)
K_KEANE = thrust_share(0.81, 0.85)
# Frisbee's craft. His 2008 optimization, as Keane and Zhang quote its Table 5: 100 t carried to 40 ly at 0.42 of
# light speed and stopped there, on four stages and 40 million tonnes of antimatter, the same again of hydrogen. His
# 2003 paper, read by OCR on 2026-11-11, gave 0.5 on 39 million: a stage a little stronger, so ours is the cautious one.
# Each stage gives a quarter of the rapidity, and all four 800,000 times what they carry. So a stage weighs 30 times
# what it pushes on, its radiators and shields most of it: in one stage's own burn the mass falls only about 4 times.
FRISBEE_STAGES, FRISBEE_BETA, FRISBEE_CARRIED, FRISBEE_ANTI = 4, 0.42, 100.0, 40e6
STAGE_RAPIDITY = 2 * math.atanh(FRISBEE_BETA) / FRISBEE_STAGES
STAGE_RATIO = ((2 * FRISBEE_ANTI + FRISBEE_CARRIED) / FRISBEE_CARRIED) ** (1 / FRISBEE_STAGES)
BURN_RATIO = math.exp(STAGE_RAPIDITY / K_FRISBEE)
# The same stages through Keane and Zhang's nozzle: the same fuel and weight, more push, so each stage gives more
# rapidity by the ratio of their exhaust speeds. Ours.
OUR_STAGE = STAGE_RAPIDITY * K_KEANE / K_FRISBEE
# Two stages, the fewest that stop: one to go, one to stop. Frisbee drew craft of two stages for a quarter of light
# speed or less, with fuel "dramatically lower" than his four, in Keane and Zhang's words. Every stage more multiplies
# the fuel 30 times, so two. Ours: the craft goes as fast as two of Frisbee's stages through the better nozzle take it.
STAGES = 2
BETA = math.tanh(OUR_STAGE * STAGES / 2)
ANTI_PER_TONNE = (STAGE_RATIO ** STAGES - 1) / 2               # antimatter, tonnes a tonne landed, hydrogen the other half
# Its heat. A twentieth to a third of each annihilation warms what it strikes, and what it warms must shed it: Frisbee's
# radiators, hundreds of km long, hold his craft to a hundredth of a g. Ours, the same.
ACCEL = 0.01 * G
C_OVER_A = C / ACCEL / YEAR                                    # Years at that push for each unit of rapidity, and ly
def start(beta):
    """Years and ly to reach `beta` from rest at that push, by the clock at home: hyperbolic motion."""
    phi = math.atanh(beta)
    return C_OVER_A * math.sinh(phi), C_OVER_A * (math.cosh(phi) - 1)
def years(d, beta=BETA):
    """Years from leaving to stopped, d ly off: up to speed, a cruise, and down again. A road too short to reach speed
    turns over halfway."""
    t, x = start(beta)
    if d >= 2 * x: return 2 * t + (d - 2 * x) / beta
    return 2 * C_OVER_A * math.sinh(math.acosh(1 + d / 2 / C_OVER_A))
def cruise(d, tonnes, front):
    """Its speed d ly off: the stages' most, or less where dust and gas would wear through its shield first."""
    return min(BETA, speeds.shield_beta(d, tonnes, front))
def trip(d, kind='sentinel'):
    c = speeds.CRAFT[kind]
    b = cruise(d, c['tonnes'], c['front'])
    return dict(beta=b, years=years(d, b), anti=c['tonnes'] * ANTI_PER_TONNE)
# Its flame. The engine's power is its thrust times c over its exhaust speed: what is not thrust leaves as gamma rays,
# neutrinos and heat. Down to a stop, its nozzle points at the star it stops at.
def watts(tonnes):
    return tonnes * 1e3 * ACCEL * C / K_KEANE

# ---------- What the game reads ----------
def catalog():
    """For game/lib/sim/speeds.ts, through calcs/export_worlds.py into game/data/works.json."""
    return dict(beta=BETA, accel=ACCEL, cOverA=C_OVER_A, perTonne=ANTI_PER_TONNE, jPerKg=J_PER_KG, share=SHARE,
                kgPerYear0=kg_a_year(0))
def golden():
    """Trips for game/lib/sim/speeds.ts to reproduce."""
    return [dict(kind=k, d=d, **trip(d, k)) for k in speeds.CRAFT for d in (1, 4.25, 10, 12, 20, 50, 100, 326, 1000, 2700)]

if __name__ == '__main__':
    print('Antimatter in bulk.')
    print(f'Making it: {J_PER_KG:.1e} J a kg in a plant built for it, against {C ** 2 / ETA_TODAY:.1e} today.')
    full = kg_a_year(mercury.SWARM_FULL)
    print(f'  On a hundredth of the swarm\'s power: {kg_a_year(0) * 1e6:.2f} mg a Year from the seed, doubling every 2 Years, '
          f'to {full / 1e9:,.1f} Mt a Year once it catches all the Sun.')
    print(f'Pushing with it: exhaust {K_FRISBEE:.3f} of light speed by Frisbee\'s figures, {K_KEANE:.3f} through Keane and Zhang\'s nozzle, '
          f'{K_KEANE / K_FRISBEE:.2f} times as much.')
    print(f'  Frisbee\'s stage: {STAGE_RAPIDITY:.3f} of rapidity, {STAGE_RATIO:.1f} times what it pushes on, its mass falling {BURN_RATIO:.1f} times in its burn.')
    print(f'  Ours, two stages through the better nozzle: {BETA:.3f} of light speed, then stopped. {ANTI_PER_TONNE:,.0f} t of antimatter '
          f'a tonne landed, and as much hydrogen.')
    t, x = start(BETA)
    print(f'  At a hundredth of a g: {t:.1f} Years and {x:.1f} ly up to speed, the same down.')
    for kind in speeds.CRAFT:
        c = speeds.CRAFT[kind]
        need = c['tonnes'] * ANTI_PER_TONNE * 1e3
        n = math.log2(need / kg_a_year(0))
        print(f'  A {kind} of {c["tonnes"]:,.0f} t: {need / 1e6:,.0f} kt of antimatter, {need * J_PER_KG:.1e} J. The Works makes that much in a Year '
              f'once the swarm has grown {n:.1f} doublings, {mercury.DOUBLING * n:.0f} Years. Its flame at the start: {watts(c["tonnes"] * STAGE_RATIO ** 2):.1e} W, '
              f'at its stop {watts(c["tonnes"] * STAGE_RATIO):.1e} W.')
    print(f"  {'to':24}{'ly':>6}{'speed':>8}{'Years':>8}{'soonest before':>16}{'by':>22}")
    names = {(False, True): 'its fusion drive', (True, False): 'Ship Beam bare', (True, True): 'Ship Beam, small drive',
             ('wide', False): 'Wide Beam bare', ('wide', True): 'Wide Beam, small drive'}
    for star, d in (('Proxima Centauri', 4.25), ('Epsilon Eridani', 10.5), ('', 10), ('', 20), ('', 50), ('', 100), ('', 326), ('', 1000)):
        n_gas = speeds.gas_at(star)
        way = speeds.soonest(d, n_gas)
        before = speeds.stay('ship', d, n_gas, *way)['years']
        am = trip(d, 'ship')
        print(f"  {(star or 'between clouds'):24}{d:>6}{am['beta']:>8.3f}{am['years']:>8,.0f}{before:>16,.0f}{names[way]:>22}")
    s = trip(10, 'sentinel')
    print(f"  A sentinel 10 ly off between clouds: {s['years']:.0f} Years, where its fusion drive took {speeds.stay('sentinel', 10)['years']:.0f}.")
