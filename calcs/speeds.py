"""What sets a craft's speed. Run: python3 calcs/speeds.py

Settled 2026-11-11, the designer's word: speed is set by physics, never a round figure. Four things bound a craft: its
push, the wear of dust on its front, the radiation of gas striking at speed, and stopping. A different one binds each
craft and each trip, so no one speed fits all. Sources in HOLOS_RESEARCH.md, "What sets a craft's speed". Each number
is from a published estimate or marked ours.
"""
import math
import mercury

C, LY, YEAR = 299_792_458.0, 9.4607e15, 3.15576e7

# ---------- The gas a craft meets ----------
# Only ions brake a magnetic sail. Inside a warm cloud, as at the Sun: 0.07 a cm3 (Slavin and Frisch 2008). Between the
# clouds, 0.012, the only direct count, from pulsars (Linsky and Redfield 2021): the other pictures give 0.004 and 0.04.
# The clouds fill 5.5 to 19% of space within 15 pc (Redfield and Linsky 2008), so most stars sit between them.
N_CLOUD, N_BETWEEN = 0.07, 0.012
# Stars known to sit in a cloud: their own winds meet its neutral gas and show (Crawford 2011, from Wood's astrospheres).
IN_CLOUD = ('Alpha Centauri', 'Proxima Centauri', 'Epsilon Eridani', '61 Cygni', 'Epsilon Indi')

# ---------- Stopping on a magnetic sail ----------
# Gros 2017: a craft of mass m, half of it loop, at its best current stops in a distance that grows as its speed
# squared and shrinks with the gas and with its own mass, since a heavier craft carries a wider loop. Reduced to one
# line, the research agent's, which gives back his 1,500 t at a tenth of light speed in 0.37 ly: tonnes = 5,700 beta^2
# / (n x), with x in ly. Slowing to a three-hundredth of its speed takes 5.2 x / v, where cruising would take x / v.
# Fitted to runs at a hundredth of light speed and below, and stretched from there, as he stretches it himself.
GROS_T, T_STOP = 5700.0, 5.2
def stop_ly(beta, n, tonnes): return GROS_T * beta ** 2 / (n * tonnes)
def brake_years(beta, n, tonnes):
    """The Years braking adds over cruising the same stretch."""
    return (T_STOP - 1) * stop_ly(beta, n, tonnes) / beta
def best_beta(d, n, tonnes):
    """The speed that lands a craft soonest. Its trip is d / beta of cruising and K beta of braking, so the two are
    equal at the best speed, and braking fills about a quarter of the way. Ours, from Gros's relation."""
    return math.sqrt(d * n * tonnes / ((T_STOP - 1) * GROS_T))

# ---------- Wear and radiation ----------
# Dust wears a front by 5 kg a m2 over 6 ly at a tenth of light speed (Crawford 2011, on Landgraf's dust). Ulysses
# measured a third of that dust over 16 years (Kruger et al. 2015), so a third of the wear. It grows as speed squared
# times distance.
DUST = 5.0 / 3
def wear(beta, d): return DUST * (beta / 0.1) ** 2 * d / 6
# Gas strikes as protons: 19 MeV at a fifth of light speed, 45 at three tenths, 145 at half, 376 at seven tenths. Their
# range in graphite, kg a m2, from NIST PSTAR. A shield three ranges thick, ours, for what the first range lets by.
RANGE = ((0.2, 4.47), (0.3, 20.8), (0.5, 167.0), (0.7, 832.0))
def proton_range(beta):
    pts = RANGE
    lo, hi = (pts[0], pts[1]) if beta <= pts[1][0] else (pts[1], pts[2]) if beta <= pts[2][0] else (pts[2], pts[3])
    k = math.log(hi[1] / lo[1]) / math.log(hi[0] / lo[0])
    return lo[1] * (beta / lo[0]) ** k
# What a craft can spend on its front: a tenth of its mass, ours. A slender craft shows little front: 20 m2 for a seed
# ship of 1,500 t, 10 m2 for a slug of 1,000 t, samples.
SHIELD_SHARE = 0.1
def shield_beta(d, tonnes, front_m2):
    """The fastest a craft can cross d ly before its shield outweighs its share. Never past 0.9: beyond it gas strikes
    hard enough to set off showers in any shield, and no study follows a craft there (Semyonov 2009)."""
    budget = SHIELD_SHARE * tonnes * 1000 / front_m2
    lo, hi = 0.01, 0.9
    if wear(hi, d) + 3 * proton_range(hi) <= budget: return hi
    for _ in range(60):
        mid = (lo + hi) / 2
        lo, hi = (mid, hi) if wear(mid, d) + 3 * proton_range(mid) <= budget else (lo, mid)
    return lo

# ---------- The push ----------
# A fusion drive, Daedalus's: exhaust at 0.035 of light speed, and 3.9 times an ideal stage's fuel (calcs/late_game.py).
# A tenth of light speed takes 61 t of fuel a tonne. Each tenth more takes 17 times the last.
FUSION_BETA, FUSION_VE, FUSION_REAL = 0.1, 0.035, 3.9
def fusion_fuel(beta): return FUSION_REAL * (math.exp(beta / FUSION_VE) - 1)
# A beam on a sail, calcs/mercury.py's: the push holds while the sail stays inside the beam's spot. What a sail can
# take is its heat: 5 GW a m2 before silicon runs away, where Starshot plans 8.7 (Parkin 2018).
FLUX_MAX = 5e9
def beam_beta(watts, emitter_m, sail_m, kg):
    """Speed from a beam's push. Its momentum, so it holds near light speed too: ours."""
    x = mercury.push_speed(watts, emitter_m, sail_m, kg) / C
    return x / math.sqrt(1 + x * x)
SHIP_BEAM = beam_beta(mercury.SHIP_BEAM_W, mercury.SHIP_BEAM_M, mercury.SHIP_SAIL_M, mercury.SHIP_KG + mercury.SHIP_SAIL_KG)

# ---------- A trip ----------
def gas_at(star): return N_CLOUD if star in IN_CLOUD else N_BETWEEN
def trip(d, tonnes, push, n=N_BETWEEN, front_m2=20, stops=True):
    """A craft's speed over d ly, what binds it, and its Years."""
    limits = dict(push=push, shield=shield_beta(d, tonnes, front_m2))
    if stops: limits['stopping'] = best_beta(d, n, tonnes)
    binds = min(limits, key=limits.get)
    beta = limits[binds]
    years = d / beta + (brake_years(beta, n, tonnes) if stops else 0)
    return dict(beta=beta, binds=binds, years=years, stop_ly=stop_ly(beta, n, tonnes) if stops else 0)

def megatons(tonnes, beta): return (1 / math.sqrt(1 - beta ** 2) - 1) * tonnes * 1000 * C ** 2 / 4.184e15

if __name__ == '__main__':
    print('What sets a craft\'s speed.')
    print(f'Gas: {N_CLOUD} ions a cm3 in a warm cloud, {N_BETWEEN} between them, which is most of space near us.')
    for n, where in ((0.1, 'the 0.1 the design took everywhere'), (N_CLOUD, 'a warm cloud'), (N_BETWEEN, 'between clouds')):
        print(f'  A 1,500 t craft at a tenth of light speed in {where}: stops in {stop_ly(0.1, n, 1500):.2f} ly, '
              f'{brake_years(0.1, n, 1500):.0f} Years over cruising.')
    print(f'Fusion: {fusion_fuel(0.1):.0f} t of fuel a tonne at a tenth of light speed, {fusion_fuel(0.2):,.0f} at two tenths.')
    print(f'The Ship Beam as built pushes a seed ship to {SHIP_BEAM:.2f} of light speed.')
    print('A seed ship of 1,500 t, pushed by the Ship Beam, braking on its magnetic sail:')
    print(f"  {'to':28}{'ly':>7}{'speed':>8}{'bound by':>10}{'Years':>9}{'stops in':>10}{'at a tenth, today':>19}")
    for star, d in (('Proxima Centauri', 4.25), ('Epsilon Eridani', 10.5), ('a star between clouds', 10), ('', 20), ('', 50), ('', 100), ('', 400), ('', 2700)):
        n = gas_at(star); t = trip(d, 1500, SHIP_BEAM, n)
        print(f"  {(star or 'a star between clouds'):28}{d:>7}{t['beta']:>8.3f}{t['binds']:>10}{t['years']:>9,.0f}{t['stop_ly']:>8.1f} ly{d / 0.1 + 15.11:>19,.0f}")
    print('The same ship on its Fusion Drive, held to a tenth by its fuel:')
    for star, d in (('Proxima Centauri', 4.25), ('a star between clouds', 10), ('', 20), ('', 50)):
        n = gas_at(star); t = trip(d, 1500, FUSION_BETA, n)
        print(f"  {(star or 'a star between clouds'):28}{d:>7}{t['beta']:>8.3f}{t['binds']:>10}{t['years'] + 10:>9,.0f}{t['stop_ly']:>8.1f} ly{d / 0.1 + 25:>19,.0f}")
    print('A slug of 1,000 t that never stops:')
    wide = beam_beta(FLUX_MAX * math.pi * 1e4 ** 2 / 4, 1e7, 1e4, 1e6 + mercury.SWARM_KG_M2 * math.pi * 1e4 ** 2 / 4)
    for name, push in (('on a Fusion Drive', FUSION_BETA), ('pushed by the Ship Beam', beam_beta(mercury.SHIP_BEAM_W, mercury.SHIP_BEAM_M, mercury.SHIP_SAIL_M, 1e6 + mercury.SHIP_SAIL_KG)),
                       ('pushed from 10,000 km of swarm on a 10 km sail', wide)):
        for d in (50, 480):
            t = trip(d, 1000, push, front_m2=10, stops=False)
            print(f"  {name:48}{d:>5} ly{t['beta']:>7.2f}  bound by {t['binds']:8}{t['years']:>7,.0f} Years{megatons(1000, t['beta']):>14,.0f} Mt")
    print(f'  That wide beam is {FLUX_MAX * math.pi * 1e4 ** 2 / 4 / 3.828e26:.1e} of the Sun\'s light.')
