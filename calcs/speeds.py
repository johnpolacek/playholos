"""What sets a craft's speed. Run: python3 calcs/speeds.py

Settled 2026-11-11, the designer's word: speed is set by physics, never a round figure. Four things bound a craft: its
push, the wear of dust on its front, the radiation of gas striking at speed, and stopping. A different one binds each
craft and each trip, so no one speed fits all. Sources in HOLOS_RESEARCH.md, "What sets a craft's speed". Each number
is from a published estimate or marked ours.
"""
import math
from pathlib import Path
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
# Two things his relation leaves out, added 2026-11-12. HOLOS_RESEARCH.md, "Stopping from a third of light speed".
# The loop must hold itself together. A current loop pushes itself outward, and the pull round it is mu0 I^2 / 4 pi
# times a log of its width over its wire's, about 21 for ours. Gros writes that no structure is needed past the
# tethers. The virial limit says otherwise: what holds a magnet weighs at least its stored energy over its fibre's
# strength for its weight. His best current grows with the craft's speed, 4.2 MA for each unit of light speed, so the
# faster the craft, the more of its loop is fibre and the less is wire. With half the craft still loop, the loop is
# narrower by that share, and the stop longer by its square.
# The fibre: the strongest measured where several strands share one load. Bundles of carbon nanotubes, 80 GPa on their
# walls (Bai et al. 2018), which at graphite's 2.26 g a cm3 is 35 MJ a kg. Taken at break, with no margin, so this is
# the least the structure can weigh, and each stop the least it can take. Today's best yarn holds a sixth of that
# (Zhang et al. 2024): what lies between is flaws and alignment, not physics. Ours, by logic.
# Not modeled: inside a warm cloud, neutral gas strikes the wire unturned and warms it, so the loop flies as a ribbon,
# edge on.
MU0, I_BEST, WIRE, LOOP_LOG = 4e-7 * math.pi, math.e * 1.55e6, 0.18e-6, 21.0
FIBRE_S = 80e9 / 2260
HOOP = MU0 * I_BEST * LOOP_LOG / (4 * math.pi * WIRE * FIBRE_S)     # the fibre's weight over the wire's, for each unit of gamma beta
def loop_weight(beta): return (1 + HOOP * beta / math.sqrt(1 - beta ** 2)) ** 2
# Relativity. A proton's path depends on the current over its momentum, so the best current is higher by gamma and the
# loop narrower by it. The craft's own momentum is higher too. Worked from M gamma dv/dt = -2 A n m v^2, with his area
# A = A_c (1 + ln(p0 / p))^3 in the proton's momentum p: ours, and the research agent's, which agree. Its factors on
# the stop's distance and its time, at each speed, by Simpson's rule. Under 1% at a tenth of light speed, 12% and 11%
# at 0.37.
def _simpson(f, a, b, n=400):
    h = (b - a) / n
    return h / 3 * (f(a) + f(b) + sum((4 if i % 2 else 2) * f(a + i * h) for i in range(1, n)))
def _rel(beta, to=1 / 300):
    if beta <= 0: return 1.0, 1.0
    g = 1 / math.sqrt(1 - beta ** 2); p0 = g * beta; end = beta * to
    u, u0 = math.log(p0 / (end / math.sqrt(1 - end ** 2))), math.log(1 / to)
    x = _simpson(lambda v: 1 / ((1 + v) ** 3 * math.sqrt(1 + (p0 * math.exp(-v)) ** 2)), 0, u) / _simpson(lambda v: 1 / (1 + v) ** 3, 0, u0)
    t = _simpson(lambda v: math.exp(v) / (1 + v) ** 3, 0, u) / p0 / (_simpson(lambda v: math.exp(v) / (1 + v) ** 3, 0, u0) / beta)
    return g ** 2 * x, g ** 2 * t
REL = [[b / 20, *_rel(b / 20)] for b in range(0, 19)]                # each twentieth of light speed, to 0.9
def rel(beta):
    """Relativity's factors on a stop's distance and time at a speed, between the worked speeds by a straight line."""
    k = min(len(REL) - 2, int(beta * 20))
    (b0, x0, t0), (b1, x1, t1) = REL[k], REL[k + 1]
    w = (beta - b0) / (b1 - b0)
    return x0 + (x1 - x0) * w, t0 + (t1 - t0) * w
def _stop0(beta, n, tonnes): return GROS_T * beta ** 2 * loop_weight(beta) / (n * tonnes)
def stop_ly(beta, n, tonnes): return _stop0(beta, n, tonnes) * rel(beta)[0]
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
# That engine has weight too, counted since 2026-11-12: until then only its fuel rode with the craft. Firefly's is
# 2,050 t of engine and radiators for 600 kN (Freeland and Lamontagne 2015, as calcs/craft.py has it). The burn lasts
# twice the Years it costs over cruising, so its thrust is a share of the craft that barely moves with its speed:
# the engine is about a fifth of what it stops. The big engine that launched the craft is long dropped: this is a
# small one of its own. Ours, by the same arithmetic as calcs/craft.py's drive().
ENGINE_KG_N = 2050e3 / 6e5
def finish_engine(beta):
    """The finishing engine's share of the craft it stops, its fuel aside."""
    return ENGINE_KG_N * finish_fuel(beta) * FINISH_VE * C / (2 * BURN_PER_C * beta / 10 * YEAR)
def finish_weight(beta):
    """What a craft weighs with its finishing engine and that burn's fuel aboard, over what it weighs without."""
    return (1 + finish_fuel(beta)) / (1 - finish_engine(beta))
def brake_years(beta, n, tonnes, drive=True):
    """The Years stopping adds over cruising the same stretch: on the sail alone, or with a burn for the last tenth."""
    x, (fx, ft) = _stop0(beta, n, tonnes), rel(beta)
    if not drive: return (T_STOP * ft - fx) * x / beta
    return (T_TENTH * ft - X_TENTH * fx) * x / beta + BURN_PER_C * beta / 10
def braking_ly(beta, n, tonnes, drive=True): return stop_ly(beta, n, tonnes) * (X_TENTH if drive else 1)
def best_beta(d, n, tonnes, drive=True):
    """The speed that lands a craft soonest: its trip is d / beta of cruising and its stopping, which grows faster
    than its speed, so one speed is best. Found where a little faster and a little slower take the same Years.
    Ours, from Gros's relation. Until 2026-11-12 it had a closed form, before the loop's fibre and relativity."""
    years = lambda b: d / b + brake_years(b, n, tonnes, drive)
    lo, hi = 1e-4, 0.89
    for _ in range(60):
        mid = (lo + hi) / 2
        lo, hi = (mid, hi) if years(mid * 1.0001) < years(mid * 0.9999) else (lo, mid)
    return (lo + hi) / 2

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
LAMBDA = mercury.BEAM_LAM
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
    with that burn's fuel. Engine and fuel are dead weight until then: a beam pushes them too, so `beamed` craft leave
    slower, and the sail must stop them too, so the craft brakes as if the gas were that much thinner."""
    weight = 1.0
    for _ in range(40):
        limits = dict(push=push / math.sqrt(weight) if beamed else push, shield=shield_beta(d, tonnes, front_m2))
        if stops: limits['stopping'] = best_beta(d, n / weight, tonnes, drive)
        binds = min(limits, key=limits.get)
        beta = limits[binds]
        weight = finish_weight(beta) if stops and drive else 1.0
    years = d / beta + (brake_years(beta, n / weight, tonnes, drive) if stops else 0)
    return dict(beta=beta, binds=binds, years=years, stop_ly=braking_ly(beta, n / weight, tonnes, drive) if stops else 0,
                fuel=finish_fuel(beta) / (1 - finish_engine(beta)) if stops and drive else 0.0, weight=weight)

# ---------- Our craft that stop ----------
# A sentinel is 1,000 t and a seed ship 1,500 t, about half of each its magnetic sail (calcs/craft.py, Gros 2017). Each
# shows about 20 m2 of front, a sample. On a Fusion Drive its fuel holds it to a tenth of light speed, and the same
# drive ends its stop. Pushed by the Ship Beam it carries no drive, which is the beam's point, so it stops on its sail
# alone. Not yet: a pushed ship that carries a small drive for the end.
CRAFT = dict(sentinel=dict(tonnes=1000.0, front=20.0), ship=dict(tonnes=1500.0, front=20.0))
def start_years(beta, beamed=False):
    """The Years getting up to speed adds over cruising: a Fusion Drive's burn, the Ship Beam's push, or the Wide
    Beam's, where `beamed` is 'wide'."""
    if beamed == 'wide': return WIDE_SHIP_LOST * beta / WIDE_SHIP
    return mercury.SHIP_PUSH['lost'] * beta / (mercury.SHIP_V / C) if beamed else BURN_PER_C * beta
def stay(kind, d, n=N_BETWEEN, beamed=False, drive=None):
    """One of our craft sent d ly to stop there: its speed, what binds it, and its Years from leaving to stopped.
    `beamed`: the Ship Beam threw it, or the Wide Beam, 'wide'. `drive`: it carries a small one to end its stop. A
    craft on its own drive always does. A thrown one may, where a Fusion Drive and the Deuterium Works stand, 2026-11-12:
    the beam must push that weight too, and it lands far sooner for it."""
    c = CRAFT[kind]
    drive = (not beamed) if drive is None else drive
    push = WIDE_SHIP if beamed == 'wide' else SHIP_BEAM if beamed else FUSION_BETA
    t = trip(d, c['tonnes'], push, n, c['front'], drive=drive, beamed=bool(beamed))
    return dict(t, years=t['years'] + start_years(t['beta'], beamed))
SHIP_WAYS = ((False, True), (True, False), (True, True), ('wide', False), ('wide', True))
def soonest(d, n=N_BETWEEN, ways=SHIP_WAYS):
    """The way a seed ship lands soonest d ly off, of those it may go by: which beam throws it, if one does, and
    whether it carries a drive. Each as (beamed, drive)."""
    return min(ways, key=lambda w: stay('ship', d, n, *w)['years'])

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

# A bullet of ours is 1,000 t at a tenth of light speed, on its Fusion Drive. Thrown by the Ship Beam it is a rod with
# no engine: as with what another mind throws, we keep the harm we mean and send it as fast as we can. The beam could
# push so light a rod past half of light speed, but there its sail outruns its mirror, so the mirror sets its speed,
# and the harm sets its mass: about 32 t. A slender rod as long as our bullet has the same shield for its length, so
# dust binds it only as it binds what another mind throws. It steers by small jets, as any thrown thing must: ours.
BULLET_TONNES = 1000.0
def _energy(beta): return 1 / math.sqrt(1 - beta ** 2) - 1
ROD_BEAM = mercury.MIRROR_BETA
ROD_TONNES = BULLET_TONNES * _energy(FUSION_BETA) / _energy(ROD_BEAM)
_ROD_KG = ROD_TONNES * 1e3 + mercury.SHIP_SAIL_KG
assert beam_beta(BEAM_W, mercury.SHIP_BEAM_M, mercury.SHIP_SAIL_M, _ROD_KG) > ROD_BEAM     # the mirror binds it, not the push
def _push(beta, kg, n=4000):
    """Days and metres of push that bring a mass to beta on the Ship Beam: Kulkarni's relation, summed."""
    ft = lambda b: (1 + b) / ((1 - b) * (1 - b * b) ** 1.5)
    h = beta / n
    simpson = lambda f: h / 3 * (f(0) + f(beta) + sum((4 if i % 2 else 2) * f(i * h) for i in range(1, n)))
    return kg * C ** 2 / (2 * BEAM_W) * simpson(ft) / 86400, kg * C ** 3 / (2 * BEAM_W) * simpson(lambda b: b * ft(b))
ROD_BEAM_DAYS, _ROD_M = _push(ROD_BEAM, _ROD_KG)
ROD_BEAM_LOST = ROD_BEAM_DAYS / 365.25 - _ROD_M / (ROD_BEAM * C) / YEAR
# Readying one: a bullet takes the Strike Yard 20 Years (calcs/conflict.py's). A rod is a thirtieth of its mass with
# no engine, so by its mass about 8 months: a sample.
ROD_READY = 20 * ROD_TONNES / BULLET_TONNES
def rod_beta(d): return min(ROD_BEAM, thrown_beta(d))
def rod_years(d):
    """Years for a rod our Ship Beam threw to land d ly away."""
    if d <= 0: return 0.0
    b = rod_beta(d)
    return d / b + ROD_BEAM_LOST * b / ROD_BEAM

# How soon another mind is ready to throw. Until 2026-11-12 it took a bullet's 32 Years: 20 to build it, and a helium-3
# harvest built and filled. But it throws a rod by a beam that already stands, as we now can, so by parity it readies
# one as we do: a bullet's 20 Years by the rod's share of a bullet's mass. Near us its rod flies fastest and is
# lightest, about 4 t, so about a month. Far off it flies slower and must weigh more for the same harm.
def their_tonnes(d): return BULLET_TONNES * _energy(FUSION_BETA) / _energy(thrown_beta(d))
def their_ready(d): return ROD_READY * their_tonnes(d) / ROD_TONNES

# ---------- The Wide Beam: what it throws ----------
# calcs/mercury.py has the beam. Each color can push from the speed at which the sail sees it inside the mirror's
# band, and the beam uses the bluest it can, since a bluer beam holds its spot farther. The last color leaves the band
# at 0.90 of light speed: the mirror's most.
def _stretch(beta): return math.sqrt((1 + beta) / (1 - beta))
def _speed(stretch): return (stretch ** 2 - 1) / (stretch ** 2 + 1)
WIDE_FROM = [0.0] + [_speed(mercury.WIDE_COLORS[0] / c) for c in mercury.WIDE_COLORS[1:]]
WIDE_MOST = _speed(mercury.WIDE_COLORS[0] * mercury.MIRROR_STRETCH / mercury.WIDE_COLORS[-1])
WIDE_REACH = [mercury.WIDE_BEAM_M * mercury.SHIP_SAIL_M / (2.44 * c) for c in mercury.WIDE_COLORS]
# Each color is still inside the band when the next takes over.
assert all(mercury.WIDE_COLORS[i] * _stretch(WIDE_FROM[i + 1]) < mercury.WIDE_COLORS[0] * mercury.MIRROR_STRETCH for i in range(len(WIDE_FROM) - 1))
def wide_beta(kg):
    """The speed the Wide Beam gives a mass: pushed while its spot is whole on the sail, in the bluest color the
    mirror reflects at each speed, and no faster than the mirror's most."""
    unit = kg * C ** 3 / (2 * BEAM_W)                        # metres pushed, for each unit of _pushed
    steps = WIDE_FROM[1:] + [WIDE_MOST]
    for i, until in enumerate(steps):
        if _pushed(until) * unit <= WIDE_REACH[i]: continue
        lo, hi = WIDE_FROM[i], until
        for _ in range(60):
            mid = (lo + hi) / 2
            lo, hi = (mid, hi) if _pushed(mid) * unit < WIDE_REACH[i] else (lo, mid)
        return lo
    return WIDE_MOST
# A flyby probe: the beam's work binds it, under the mirror's most and under its shield's near us.
_WIDE_PROBE_KG = PROBE['tonnes'] * 1e3 + mercury.WIDE_SAIL_KG
WIDE_PROBE = wide_beta(_WIDE_PROBE_KG)
WIDE_PROBE_DAYS, _WIDE_PROBE_M = _push(WIDE_PROBE, _WIDE_PROBE_KG)
WIDE_PROBE_LOST = WIDE_PROBE_DAYS / 365.25 - _WIDE_PROBE_M / (WIDE_PROBE * C) / YEAR
def wide_probe_beta(d): return min(WIDE_PROBE, shield_beta(d, PROBE['tonnes'], PROBE['front']))
def wide_probe_years(d):
    """Years for a flyby probe the Wide Beam threw to pass a star d ly away."""
    if d <= 0: return 0.0
    b = wide_probe_beta(d)
    return d / b + WIDE_PROBE_LOST * b / WIDE_PROBE
# A seed ship or a seed probe, 1,500 t: the beam's work could give it more than a third of light speed, but it must
# stop, on its sail alone, so on most roads its stopping sets its speed. 2026-11-12.
_WIDE_SHIP_KG = CRAFT['ship']['tonnes'] * 1e3 + mercury.WIDE_SAIL_KG
WIDE_SHIP = wide_beta(_WIDE_SHIP_KG)
WIDE_SHIP_DAYS, _WIDE_SHIP_M = _push(WIDE_SHIP, _WIDE_SHIP_KG)
WIDE_SHIP_LOST = WIDE_SHIP_DAYS / 365.25 - _WIDE_SHIP_M / (WIDE_SHIP * C) / YEAR
# A rod: its shield binds it, as it binds what another mind throws, so it is that rod. The same harm, the same speed,
# the same mass, readied as fast. The beam's work never binds one: checked near and far.
def wide_rod_beta(d): return min(WIDE_MOST, thrown_beta(d))
def wide_rod_tonnes(d): return BULLET_TONNES * _energy(FUSION_BETA) / _energy(wide_rod_beta(d))
assert all(wide_beta(wide_rod_tonnes(d) * 1e3 + mercury.WIDE_SAIL_KG) >= wide_rod_beta(d) for d in (4.25, 50, 400, 2700, 30000))
_WIDE_ROD_KG = wide_rod_tonnes(10) * 1e3 + mercury.WIDE_SAIL_KG
WIDE_ROD = wide_rod_beta(10)
WIDE_ROD_DAYS, _WIDE_ROD_M = _push(WIDE_ROD, _WIDE_ROD_KG)
WIDE_ROD_LOST = WIDE_ROD_DAYS / 365.25 - _WIDE_ROD_M / (WIDE_ROD * C) / YEAR
def wide_rod_ready(d): return ROD_READY * wide_rod_tonnes(d) / ROD_TONNES
def wide_rod_years(d):
    """Years for a rod our Wide Beam threw to land d ly away."""
    if d <= 0: return 0.0
    b = wide_rod_beta(d)
    return d / b + WIDE_ROD_LOST * b / WIDE_ROD

# ---------- Who sees a launch beam ----------
# A craft is aimed where its star will be when it lands, and its beam points along its path. The beam's light gets
# there in d Years and the craft in d / beta, and the star moves on in between. So the beam passes the star as it then
# is by its speed across our sky times that gap: (v / c)(1 / beta - 1) d. The slower the craft, the wider it misses.
# Benford and Benford 2016: "the beam is generally not observable from the target planetary system".
# How fast a star crosses our sky: each star's own, which our files hold for every star of the census, 301,387 within
# 326 ly (data/gcns-326ly-drift.bin, from Gaia's catalogue of nearby stars, scripts/prepare-neighborhood.py). Where no
# star is named, their middle speed: 31 km/s. Until 2026-11-12 the game took 30 for every star, a sample.
# Benford takes 20. Proxima's is 24, Tau Ceti's 33, Barnard's 90.
# Until 2026-11-12 every launch beam was seen at its star, the designer's pick with this doubt beside it. The designer's
# pick now, (ar): it is seen only where a mind's works reach the beam's line. An awake old mind's panels sit where a
# plate stays at its glow's 12 K (calcs/minds.py): 538 AU from a Sun, and nearer in round a dimmer star, as the root
# of its light. Each old mind's star has its own, read from the census (calcs/minds.py lum_of): 51 AU round the middle
# one, a red dwarf of 0.009 Suns. A peer's swarm is 0.4 AU wide, and peers are thousands of ly off, so no peer sees
# one. Not yet: each star's own motion across our sky.
_drifts = sorted(v for v in (Path(__file__).resolve().parents[1] / 'data/gcns-326ly-drift.bin').read_bytes() if v)
DRIFT_KMS, GLOW_K, AU = float(_drifts[len(_drifts) // 2]), 12.0, 1.495978707e11
WORKS_AU = math.sqrt(3.828e26 / (16 * math.pi * 5.670374e-8 * GLOW_K ** 4)) / AU
def works_au(lum=1.0): return WORKS_AU * math.sqrt(lum)
def beam_miss(d, beta, kms=None): return (kms or DRIFT_KMS) * 1e3 / C * (1 / beta - 1) * d * LY / AU
def beam_seen(d, beta, lum=1.0, kms=None): return beam_miss(d, beta, kms) <= works_au(lum)
def seen_within(beta, lum=1.0, kms=None): return works_au(lum) / beam_miss(1, beta, kms)

# ---------- What the game reads ----------
# Sails of a few grams, pushed from Earth: a fifth of light speed, Starshot's.
SAIL_BETA = 0.2
def catalog():
    """What game/lib/sim/speeds.ts needs to work each trip, through calcs/export_worlds.py into game/data/works.json:
    our bullets' and our sails' speeds, the rod another mind throws, and what binds a craft that stops."""
    return dict(speeds=dict(bullet=FUSION_BETA, sail=SAIL_BETA, thrown=THROWN,
                            # What a craft that stops is bound by, for game/lib/sim/speeds.ts to work each trip.
                            gas=dict(cloud=N_CLOUD, between=N_BETWEEN, inCloud=list(IN_CLOUD)),
                            sailing=dict(gros=GROS_T, stop=T_STOP, tenth=T_TENTH, covered=X_TENTH, burnPerC=BURN_PER_C, finishVe=FINISH_VE,
                                         # The finishing engine's kg for each newton of its thrust.
                                         engine=ENGINE_KG_N,
                                         # The loop's fibre for each unit of gamma beta, and relativity's factors on a stop's
                                         # distance and time at each twentieth of light speed.
                                         hoop=HOOP, rel=REL),
                            wear=dict(dust=DUST, range=[list(r) for r in RANGE], share=SHIELD_SHARE, most=0.9),
                            fusion=FUSION_BETA, beam=SHIP_BEAM, beamDays=round(SHIP_BEAM_DAYS), beamStart=mercury.SHIP_PUSH['lost'] / (mercury.SHIP_V / C),
                            craft=CRAFT,
                            # A flyby probe the Ship Beam throws: its mass and front, the beam's most, and its push.
                            probe=dict(PROBE, beam=PROBE_BEAM, days=round(PROBE_BEAM_DAYS), lost=PROBE_BEAM_LOST),
                            # A rod the Ship Beam throws in place of a bullet: its mass for a bullet's harm at the
                            # mirror's most, its push, and the Years the Strike Yard takes to ready one.
                            rod=dict(tonnes=ROD_TONNES, beam=ROD_BEAM, days=round(ROD_BEAM_DAYS), lost=ROD_BEAM_LOST, ready=ROD_READY),
                            # Who sees a launch beam: how fast a star crosses our sky, in km/s, and how far an awake
                            # old mind's works reach from its star, in AU.
                            seen=dict(kms=DRIFT_KMS, worksAU=WORKS_AU),
                            # The Wide Beam: its colors in microns, the mirror's most, its sail in tonnes, how far
                            # its last color holds its spot in ly, and what it throws: a flyby probe at the most its
                            # work gives, and a rod as another mind's, with its push near us.
                            wide=dict(colors=[round(c * 1e6, 2) for c in mercury.WIDE_COLORS], most=WIDE_MOST, sail=mercury.WIDE_SAIL_KG / 1e3,
                                      reach=WIDE_REACH[-1] / LY,
                                      probe=dict(beam=WIDE_PROBE, days=round(WIDE_PROBE_DAYS), lost=WIDE_PROBE_LOST),
                                      # `curve`: the days of push that bring a ship to each speed past the Ship Beam's most.
                                      ship=dict(beam=WIDE_SHIP, days=round(WIDE_SHIP_DAYS), lost=WIDE_SHIP_LOST,
                                                curve=[[b, round(_push(b, _WIDE_SHIP_KG)[0])] for b in (0.15, 0.2, 0.25, 0.3, 0.35)]),
                                      rod=dict(beam=WIDE_ROD, days=round(WIDE_ROD_DAYS), lost=WIDE_ROD_LOST))))

def golden():
    """Trips for game/lib/sim/speeds.ts to reproduce: each craft, far and near, in a cloud and between, on its drive
    and pushed."""
    out = []
    for kind in CRAFT:
        for d in (4.25, 10.5, 10, 20, 50, 120, 400, 2700, 30000):
            for n in (N_CLOUD, N_BETWEEN):
                for beamed, drive in (SHIP_WAYS if kind == 'ship' else ((False, True),)):
                    t = stay(kind, d, n, beamed, drive)
                    out.append(dict(kind=kind, d=d, n=n, beamed=beamed, drive=drive, beta=t['beta'], years=t['years'], binds=t['binds'], stopLy=t['stop_ly']))
    return out

def golden_thrown():
    """What another mind throws, near and far, for game/lib/sim/speeds.ts to reproduce."""
    return [dict(d=d, beta=thrown_beta(d), years=their_years(d), ready=their_ready(d)) for d in (4.25, 29.7, 50, 150, 480, 1000, 2700, 30000)]


def golden_probes():
    """Flyby probes the Ship Beam throws, near and far, for game/lib/sim/speeds.ts to reproduce."""
    return [dict(d=d, beta=probe_beta(d), years=probe_years(d)) for d in (4.25, 10.5, 50, 400, 1000, 2700, 30000)]


def golden_rods():
    """Rods the Ship Beam throws in place of bullets, near and far, for game/lib/sim/speeds.ts to reproduce."""
    return [dict(d=d, beta=rod_beta(d), years=rod_years(d)) for d in (4.25, 10.5, 50, 400, 1000, 2700, 30000)]


def golden_wide():
    """What the Wide Beam throws, near and far: a flyby probe and a rod, for game/lib/sim/speeds.ts to reproduce."""
    return [dict(d=d, probe=wide_probe_beta(d), probeYears=wide_probe_years(d), rod=wide_rod_beta(d), rodYears=wide_rod_years(d),
                 tonnes=wide_rod_tonnes(d), ready=wide_rod_ready(d)) for d in (4.25, 10.5, 50, 120, 400, 1000, 2700, 30000)]

def golden_misses():
    """How far a launch beam passes from its star, and whether an awake old mind there sees it, for each craft a beam
    throws: sails, a seed ship, a flyby probe and a rod. For game/lib/sim/speeds.ts to reproduce."""
    return [dict(d=d, beta=b, lum=lum, kms=kms, au=beam_miss(d, b, kms), seen=beam_seen(d, b, lum, kms))
            for d in (4.25, 10.5, 17, 20, 50, 62, 90, 400, 2700) for b in (SAIL_BETA, SHIP_BEAM, probe_beta(d), rod_beta(d))
            for lum in (1.0, 0.009, 0.17) for kms in (None, 9, 24, 90)]


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
    print(f'A rod thrown by the Ship Beam in place of a bullet: {ROD_TONNES:.1f} t at {ROD_BEAM:.3f} of light speed, the mirror\'s most, lands with '
          f'{megatons(ROD_TONNES, ROD_BEAM):,.0f} Mt, a bullet\'s {megatons(BULLET_TONNES, FUSION_BETA):,.0f}. Pushed {ROD_BEAM_DAYS:.0f} days, '
          f'{ROD_BEAM_LOST * 365.25:.0f} over cruising, at {ROD_BEAM * C / (ROD_BEAM_DAYS * 86400) / 9.81:.0f} g on average. Readied in {ROD_READY:.2f} Years.')
    for d in (4.25, 10.5, 50, 400, 2700):
        print(f'  {d:>7} ly: {rod_beta(d):.2f} of light speed, {rod_years(d):>7,.1f} Years, where a bullet took {d / FUSION_BETA:>8,.1f}.')
    print('What another mind throws, a slender rod bound only by its shield:')
    for d in (30, 50, 150, 480, 1000, 2700):
        b = thrown_beta(d)
        print(f'  {d:>6} ly: {b:.2f} of light speed, {their_years(d):>7,.0f} Years, where a tenth took {d * 10:>7,}. '
              f'For a bullet\'s {megatons(1000, 0.1):,.0f} Mt it weighs {their_tonnes(d):.1f} t, readied in {their_ready(d) * 365.25:.0f} days.')
    print(f'Who sees a launch beam: a star crossing our sky at {DRIFT_KMS:.0f} km/s, and an awake old mind\'s works {WORKS_AU:.0f} AU out, where {GLOW_K:.0f} K lies round a Sun.')
    for name, b in (('Sails', SAIL_BETA), ('A seed ship', SHIP_BEAM), ('A flyby probe', PROBE_BEAM), ('A rod', ROD_BEAM)):
        print(f'  {name:14} at {b:.2f} of light speed: its beam passes {beam_miss(4.2465, b):>4.0f} AU from Proxima, {beam_miss(2700, b) * AU / LY:.2f} ly from a star 2,700 ly off. '
              f'Seen within {seen_within(b):.0f} ly at a Sun, {seen_within(b, 0.17):.0f} at a star of 0.17 Suns, {seen_within(b, 0.009):.1f} at a red dwarf of 0.009.')
    print(f'The Wide Beam: {mercury.WIDE_BEAM_M / 1e3:,.0f} km of swarm, {len(mercury.WIDE_COLORS)} colors, a sail of {mercury.WIDE_SAIL_KG / 1e3:.1f} t. Each color pushes from '
          + ', '.join(f'{b:.2f}' for b in WIDE_FROM) + f' of light speed, and the mirror\'s most is {WIDE_MOST:.3f}. Its spot holds to '
          + ', '.join(f'{r / 1.495978707e11:,.0f}' for r in WIDE_REACH) + f' AU, the last {WIDE_REACH[-1] / LY:.2f} ly.')
    print(f'  A flyby probe: {WIDE_PROBE:.3f} of light speed in {WIDE_PROBE_DAYS:.0f} days, ending {_WIDE_PROBE_M / 1.495978707e11:,.0f} AU out. Proxima in {wide_probe_years(4.2465):.1f} Years.')
    print(f'  A rod near us: {wide_rod_tonnes(10):.2f} t at {WIDE_ROD:.2f} of light speed in {WIDE_ROD_DAYS:.0f} days, ending {_WIDE_ROD_M / 1.495978707e11:,.0f} AU out, '
          f'at {WIDE_ROD * C / (WIDE_ROD_DAYS * 86400) / 9.81:.1f} g on average, readied in {wide_rod_ready(10) * 365.25:.0f} days. 10 ly in {wide_rod_years(10):.1f} Years.')
    print(f'  A seed ship of 1,500 t: {wide_beta(1.5e6 + mercury.WIDE_SAIL_KG):.3f} of light speed, were it to ride it. The swarm grows {mercury.WIDE_BEAM_DOUBLINGS:.1f} doublings more, {mercury.WIDE_BEAM_YEARS} Years.')
