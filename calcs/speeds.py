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
# The sail's drag fades as the craft slows, so its last tenth of speed takes two thirds of the time: 1.84 x / v to a
# tenth of its speed, by Gros, against 5.2 to a three-hundredth. Integrating his drag, ours: by a tenth of its speed it
# has covered 0.908 of x. So a craft with a drive sheds the last tenth by a burn, as Perakis and Hein 2016 found a
# second means beats the sail alone at low speed. The burn is a tenth of the craft's speed, at a Fusion Drive's pace:
# 10 Years over cruising for a tenth of light speed (calcs/seed.py), so a hundredth of light speed costs 1.
T_TENTH, X_TENTH, BURN_PER_C = 1.84, 0.908, 100.0
# That burn's fuel, on the craft's own engine: Firefly's exhaust at 0.04 of light speed, calcs/craft.py's. From a tenth
# of light speed the burn is a hundredth, and takes 0.28 t of deuterium a tonne.
FINISH_VE = 0.04
def finish_fuel(beta): return math.exp(beta / 10 / FINISH_VE) - 1
def brake_years(beta, n, tonnes, drive=True):
    """The Years stopping adds over cruising the same stretch: on the sail alone, or with a burn for the last tenth."""
    x = stop_ly(beta, n, tonnes)
    if not drive: return (T_STOP - 1) * x / beta
    return (T_TENTH - X_TENTH) * x / beta + BURN_PER_C * beta / 10
def braking_ly(beta, n, tonnes, drive=True): return stop_ly(beta, n, tonnes) * (X_TENTH if drive else 1)
def best_beta(d, n, tonnes, drive=True):
    """The speed that lands a craft soonest. Its trip is d / beta of cruising and K beta of stopping, so the two are
    equal at the best speed. Ours, from Gros's relation."""
    k = (T_STOP - 1) * GROS_T / (n * tonnes) if not drive else (T_TENTH - X_TENTH) * GROS_T / (n * tonnes) + BURN_PER_C / 10
    return math.sqrt(d / k)

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
# A beam does a fixed amount of work on what it pushes: its push times the distance it stays whole on the sail. So a
# heavy thing leaves slow and a light one fast, on one curve the beam sets. Relativity bends the curve: a fast mirror
# runs from the light, which pushes it less, by (1 - beta) / (1 + beta), and its mass grows as gamma cubed along its
# path (Kulkarni, Lubin and Zhang 2018). Until 2026-11-12 this took a shortcut that ran high: 0.19 of light speed for
# a seed ship on the Ship Beam, where the formula gives 0.17.
LAMBDA = 1.06e-6
def beam_reach(emitter_m, sail_m): return emitter_m * sail_m / (2.44 * LAMBDA)
def _pushed(beta, n=2000):
    """The distance a beam must push to bring a mirror to beta, in units of m c^3 / 2P: Simpson's rule on Kulkarni's
    relation, d(beta)/dx = 2P (1 - beta) / (m c^3 gamma^3 beta (1 + beta))."""
    f = lambda b: b * (1 + b) / ((1 - b) * (1 - b * b) ** 1.5)
    h = beta / n
    return h / 3 * (f(0) + f(beta) + sum((4 if i % 2 else 2) * f(i * h) for i in range(1, n)))
def beam_beta(watts, emitter_m, sail_m, kg):
    """The speed a beam gives a mass, pushed out to where the beam stops being whole on its sail."""
    want = 2 * watts * beam_reach(emitter_m, sail_m) / (kg * C ** 3)
    lo, hi = 0.0, 0.999
    for _ in range(60):
        mid = (lo + hi) / 2
        lo, hi = (mid, hi) if _pushed(mid) < want else (lo, mid)
    return lo
def beam_days(watts, emitter_m, sail_m, kg, n=4000):
    """How long that push lasts, in days: the same relation, summed over time."""
    top = beam_beta(watts, emitter_m, sail_m, kg)
    f = lambda b: (1 + b) / ((1 - b) * (1 - b * b) ** 1.5)
    h = top / n
    return kg * C ** 2 / (2 * watts) * h / 3 * (f(0) + f(top) + sum((4 if i % 2 else 2) * f(i * h) for i in range(1, n))) / 86400
# The light that pushes: the Ship Beam's, less what its sail's mirror lets through (calcs/mercury.py's MIRROR_R).
BEAM_W = mercury.SHIP_BEAM_W * mercury.MIRROR_R
SHIP_BEAM = beam_beta(BEAM_W, mercury.SHIP_BEAM_M, mercury.SHIP_SAIL_M, mercury.SHIP_KG + mercury.SHIP_SAIL_KG)
SHIP_BEAM_DAYS = beam_days(BEAM_W, mercury.SHIP_BEAM_M, mercury.SHIP_SAIL_M, mercury.SHIP_KG + mercury.SHIP_SAIL_KG)

# ---------- A trip ----------
def gas_at(star): return N_CLOUD if star in IN_CLOUD else N_BETWEEN
def trip(d, tonnes, push, n=N_BETWEEN, front_m2=20, stops=True, drive=True, beamed=False):
    """A craft's speed over d ly, what binds it, and its Years. `drive`: it carries one for the last of its braking,
    with that burn's fuel. The fuel is dead weight until then: a beam pushes it too, so `beamed` craft leave slower,
    and the sail must stop it too, so the craft brakes as if the gas were that much thinner."""
    weight = 1.0
    for _ in range(40):
        limits = dict(push=push / math.sqrt(weight) if beamed else push, shield=shield_beta(d, tonnes, front_m2))
        if stops: limits['stopping'] = best_beta(d, n / weight, tonnes, drive)
        binds = min(limits, key=limits.get)
        beta = limits[binds]
        weight = 1 + finish_fuel(beta) if stops and drive else 1.0
    years = d / beta + (brake_years(beta, n / weight, tonnes, drive) if stops else 0)
    return dict(beta=beta, binds=binds, years=years, stop_ly=braking_ly(beta, n / weight, tonnes, drive) if stops else 0, fuel=weight - 1)

# ---------- Our craft that stop ----------
# A sentinel is 1,000 t and a seed ship 1,500 t, about half of each its magnetic sail (calcs/craft.py, Gros 2017). Each
# shows about 20 m2 of front, a sample. On a Fusion Drive its fuel holds it to a tenth of light speed, and the same
# drive ends its stop. Pushed by the Ship Beam it carries no drive, which is the beam's point, so it stops on its sail
# alone. Not yet: a pushed ship that carries a small drive for the end.
CRAFT = dict(sentinel=dict(tonnes=1000.0, front=20.0), ship=dict(tonnes=1500.0, front=20.0))
def start_years(beta, beamed=False):
    """The Years getting up to speed adds over cruising: a Fusion Drive's burn, or the Ship Beam's push."""
    return mercury.SHIP_PUSH['lost'] * beta / (mercury.SHIP_V / C) if beamed else BURN_PER_C * beta
def stay(kind, d, n=N_BETWEEN, beamed=False):
    """One of our craft sent d ly to stop there: its speed, what binds it, and its Years from leaving to stopped."""
    c = CRAFT[kind]
    t = trip(d, c['tonnes'], SHIP_BEAM if beamed else FUSION_BETA, n, c['front'], drive=not beamed, beamed=beamed)
    return dict(t, years=t['years'] + start_years(t['beta'], beamed))

# ---------- What another mind throws ----------
# What an old mind sends to wreck a craft or strike a world never stops, so its stopping binds nothing. Its push binds
# nothing either: a mind with works hundreds of AU wide commands far more than the 4e17 W that drives a 10 km sail at
# the most a sail bears, a billionth of a sun's light. So only its shield binds it. It throws a slender rod, as long as
# our own bullet is, about 45 m of rock: a tenth of that a m2 may go to its front. Near, it flies at the 0.9 past which
# no study follows a craft. Far, dust wears it, so it flies slower the farther it goes.
# How hard it strikes is the sender's choice, not physics. Ours, by logic: it keeps the harm it means and sends it as
# fast as it can, since speed costs it nothing and gives its target less time. So the same energy as a bullet of ours,
# in a rod of a few tonnes.
THROWN = dict(tonnes=1000.0, front=10.0)
def thrown_beta(d): return shield_beta(d, THROWN['tonnes'], THROWN['front'])
def their_years(d):
    """Years for what another mind throws to cross d ly."""
    return d / thrown_beta(d) if d > 0 else 0.0

# ---------- What our own beam throws ----------
# The Ship Beam does the same work on whatever rides its sail, so a light craft leaves fast. A flyby probe is 150 t of
# instruments (calcs/craft.py, Icarus Firefly's payload). Thrown by the beam it carries no engine and no fuel, and it
# never stops, so only the beam's push and its own shield bind it. Its front is a seed ship's, shrunk in shape with its
# mass: 4.3 m2, ours. The sail sees the beam's light stretched 1.57 times at its top speed, inside the band its mirror
# of silicon and glass reflects, 1.75 times wide (calcs/mercury.py's MIRROR_STRETCH). A lighter craft could not pass
# half of light speed on this sail: there it outruns its mirror.
PROBE = dict(tonnes=150.0, front=CRAFT['ship']['front'] * (150.0 / CRAFT['ship']['tonnes']) ** (2 / 3))
_PROBE_KG = PROBE['tonnes'] * 1e3 + mercury.SHIP_SAIL_KG
PROBE_BEAM = beam_beta(BEAM_W, mercury.SHIP_BEAM_M, mercury.SHIP_SAIL_M, _PROBE_KG)
PROBE_BEAM_DAYS = beam_days(BEAM_W, mercury.SHIP_BEAM_M, mercury.SHIP_SAIL_M, _PROBE_KG)
assert PROBE_BEAM < mercury.MIRROR_BETA
# The Years its push costs over cruising the same stretch: the push's time, less the time to cross the beam's reach at
# its top speed.
PROBE_BEAM_LOST = PROBE_BEAM_DAYS / 365.25 - beam_reach(mercury.SHIP_BEAM_M, mercury.SHIP_SAIL_M) / (PROBE_BEAM * C) / YEAR
def probe_beta(d):
    """How fast the Ship Beam throws a flyby probe d ly: the beam's most, or less on a road so long that dust would
    wear through its shield."""
    return min(PROBE_BEAM, shield_beta(d, PROBE['tonnes'], PROBE['front']))
def probe_years(d):
    """Years for a flyby probe the Ship Beam threw to pass a star d ly away."""
    if d <= 0: return 0.0
    b = probe_beta(d)
    return d / b + PROBE_BEAM_LOST * b / PROBE_BEAM

# ---------- What the game reads ----------
# Sails of a few grams, pushed from Earth: a fifth of light speed, Starshot's.
SAIL_BETA = 0.2
def catalog():
    """What game/lib/sim/speeds.ts needs to work each trip, through calcs/export_worlds.py into game/data/works.json:
    our bullets' and our sails' speeds, the rod another mind throws, and what binds a craft that stops."""
    return dict(speeds=dict(bullet=FUSION_BETA, sail=SAIL_BETA, thrown=THROWN,
                            # What a craft that stops is bound by, for game/lib/sim/speeds.ts to work each trip.
                            gas=dict(cloud=N_CLOUD, between=N_BETWEEN, inCloud=list(IN_CLOUD)),
                            sailing=dict(gros=GROS_T, stop=T_STOP, tenth=T_TENTH, covered=X_TENTH, burnPerC=BURN_PER_C, finishVe=FINISH_VE),
                            wear=dict(dust=DUST, range=[list(r) for r in RANGE], share=SHIELD_SHARE, most=0.9),
                            fusion=FUSION_BETA, beam=SHIP_BEAM, beamDays=round(SHIP_BEAM_DAYS), beamStart=mercury.SHIP_PUSH['lost'] / (mercury.SHIP_V / C),
                            craft=CRAFT,
                            # A flyby probe the Ship Beam throws: its mass and front, the beam's most, and its push.
                            probe=dict(PROBE, beam=PROBE_BEAM, days=round(PROBE_BEAM_DAYS), lost=PROBE_BEAM_LOST)))

def golden():
    """Trips for game/lib/sim/speeds.ts to reproduce: each craft, far and near, in a cloud and between, on its drive
    and pushed."""
    out = []
    for kind in CRAFT:
        for d in (4.25, 10.5, 10, 20, 50, 120, 400, 2700, 30000):
            for n in (N_CLOUD, N_BETWEEN):
                for beamed in ((False, True) if kind == 'ship' else (False,)):
                    t = stay(kind, d, n, beamed)
                    out.append(dict(kind=kind, d=d, n=n, beamed=beamed, beta=t['beta'], years=t['years'], binds=t['binds'], stopLy=t['stop_ly']))
    return out

def golden_thrown():
    """What another mind throws, near and far, for game/lib/sim/speeds.ts to reproduce."""
    return [dict(d=d, beta=thrown_beta(d), years=their_years(d)) for d in (4.25, 29.7, 50, 150, 480, 1000, 2700, 30000)]


def golden_probes():
    """Flyby probes the Ship Beam throws, near and far, for game/lib/sim/speeds.ts to reproduce."""
    return [dict(d=d, beta=probe_beta(d), years=probe_years(d)) for d in (4.25, 10.5, 50, 400, 1000, 2700, 30000)]


def megatons(tonnes, beta): return (1 / math.sqrt(1 - beta ** 2) - 1) * tonnes * 1000 * C ** 2 / 4.184e15

if __name__ == '__main__':
    print('What sets a craft\'s speed.')
    print(f'Gas: {N_CLOUD} ions a cm3 in a warm cloud, {N_BETWEEN} between them, which is most of space near us.')
    for n, where in ((0.1, 'the 0.1 the design took everywhere'), (N_CLOUD, 'a warm cloud'), (N_BETWEEN, 'between clouds')):
        print(f'  A 1,500 t craft at a tenth of light speed in {where}: on its sail alone it stops in {stop_ly(0.1, n, 1500):.2f} ly, '
              f'{brake_years(0.1, n, 1500, False):.0f} Years over cruising. With a burn for the last tenth, {brake_years(0.1, n, 1500):.0f}.')
    print(f'Fusion: {fusion_fuel(0.1):.0f} t of fuel a tonne at a tenth of light speed, {fusion_fuel(0.2):,.0f} at two tenths, '
          f'on Daedalus\'s staged design. On a craft\'s own engine, {finish_fuel(0.1):.2f} for the hundredth that ends a stop from a tenth.')
    print(f'The Ship Beam as built pushes a seed ship to {SHIP_BEAM:.2f} of light speed in {SHIP_BEAM_DAYS:.0f} days.')
    print(f'  Its sail\'s mirror: {mercury.MIRROR_PAIRS} pairs of silicon and glass, {mercury.MIRROR_KG_M2 * 1e3:.2f} g a m2, {mercury.SHIP_SAIL_KG / 1e3:.1f} t in all, reflecting '
          f'{mercury.MIRROR_R:.1%} over a band {mercury.MIRROR_STRETCH:.2f} times wide. A sail outruns it at {mercury.MIRROR_BETA:.2f} of light speed.')
    print('  What it gives by mass, sail and all, never past what its mirror reflects:')
    for tonnes in (1500, 1000, 150, 10, 5, 2):
        kg = tonnes * 1e3 + mercury.SHIP_SAIL_KG
        b = min(beam_beta(BEAM_W, mercury.SHIP_BEAM_M, mercury.SHIP_SAIL_M, kg), mercury.MIRROR_BETA)
        print(f'  {tonnes:>7,} t: {b:.2f} of light speed, {megatons(tonnes, b):>9,.0f} Mt, pushed at most {beam_days(BEAM_W, mercury.SHIP_BEAM_M, mercury.SHIP_SAIL_M, kg):.0f} days.')
    head = f"  {'to':24}{'ly':>6}{'speed':>7}{'bound by':>10}{'Years':>8}{'brakes over':>13}{'fuel t/t':>10}{'today':>8}"
    trips = (('Proxima Centauri', 4.25), ('Epsilon Eridani', 10.5), ('', 10), ('', 20), ('', 50), ('', 100), ('', 400), ('', 2700))
    def table(title, tonnes, push, drive, today, start=0.0, beamed=False):
        print(title); print(head)
        for star, d in trips:
            t = trip(d, tonnes, push, gas_at(star), drive=drive, beamed=beamed)
            print(f"  {(star or 'between clouds'):24}{d:>6}{t['beta']:>7.3f}{t['binds']:>10}{t['years'] + start:>8,.0f}{t['stop_ly']:>10.1f} ly{t['fuel']:>10.1f}{today(d):>8,.0f}")
    table('A seed ship of 1,500 t on its Fusion Drive, fuel holding it to a tenth, a burn ending its stop:', 1500, FUSION_BETA, True, lambda d: d / 0.1 + 25, 10)
    table('The same ship pushed by the Ship Beam, with a small drive for the end of its stop:', 1500, SHIP_BEAM, True, lambda d: d / 0.1 + 15.11, beamed=True)
    table('Pushed by the Ship Beam with no drive at all, as the game has it, stopping on its sail alone:', 1500, SHIP_BEAM, False, lambda d: d / 0.1 + 15.11, beamed=True)
    table('A sentinel of 1,000 t on its Fusion Drive:', 1000, FUSION_BETA, True, lambda d: d / 0.1 + 25, 10)
    print('A slug of 1,000 t that never stops:')
    wide = beam_beta(FLUX_MAX * math.pi * 1e4 ** 2 / 4, 1e7, 1e4, 1e6 + mercury.SWARM_KG_M2 * math.pi * 1e4 ** 2 / 4)
    for name, push in (('on a Fusion Drive', FUSION_BETA), ('pushed by the Ship Beam', beam_beta(BEAM_W, mercury.SHIP_BEAM_M, mercury.SHIP_SAIL_M, 1e6 + mercury.SHIP_SAIL_KG)),
                       ('pushed from 10,000 km of swarm on a 10 km sail', wide)):
        for d in (50, 480):
            t = trip(d, 1000, push, front_m2=10, stops=False)
            print(f"  {name:48}{d:>5} ly{t['beta']:>7.2f}  bound by {t['binds']:8}{t['years']:>7,.0f} Years{megatons(1000, t['beta']):>14,.0f} Mt")
    print(f'  That wide beam is {FLUX_MAX * math.pi * 1e4 ** 2 / 4 / 3.828e26:.1e} of the Sun\'s light.')
    print(f'A flyby probe of {PROBE["tonnes"]:.0f} t, {PROBE["front"]:.1f} m2 of front, thrown by the Ship Beam: {PROBE_BEAM:.3f} of light speed in '
          f'{PROBE_BEAM_DAYS:.0f} days, {PROBE_BEAM_LOST * 365.25:.0f} days over cruising. Its light stretches {math.sqrt((1 + PROBE_BEAM) / (1 - PROBE_BEAM)):.2f} times.')
    for d in (4.25, 10.5, 50, 400, 1000, 2700):
        print(f'  {d:>7} ly: {probe_beta(d):.2f} of light speed, {probe_years(d):>7,.1f} Years, where its Fusion Drive took {d / FUSION_BETA + 10:>8,.1f}.')
    print('What another mind throws, a slender rod bound only by its shield:')
    for d in (30, 50, 150, 480, 1000, 2700):
        b = thrown_beta(d)
        print(f'  {d:>6} ly: {b:.2f} of light speed, {their_years(d):>7,.0f} Years, where a tenth took {d * 10:>7,}. '
              f'For a bullet\'s {megatons(1000, 0.1):,.0f} Mt it weighs {megatons(1000, 0.1) / megatons(1, b):.1f} t.')
