"""What each craft we send costs, by physics: the sail, the flyby probe and the sentinel. Settled 2026-11-07 (m:235).

A sail is pushed by our laser and costs little energy, but its beam flashes toward its star (early_game.launch_glare).
A flyby probe and a sentinel burn deuterium in a Firefly-style fusion drive, and the Deuterium Works pays for it.
A sentinel speeds up on its drive and brakes on a magnetic sail, as our seed ships do (Gros 2017), so it carries no
braking fuel. Run: python3 calcs/craft.py
"""
import math

from early_game import ARRAY_M, LASER_W, PULSE_S, D_WORKS_KT, launch_glare

C, YEAR = 2.998e8, 3.156e7
# Firefly (Freeland and Lamontagne 2015, through i4is 2018): exhaust 12,000 km/s, and 2,050 t of engine and radiators
# for 600 kN, as early_game.seed_ship uses.
VE, KG_PER_N = 1.2e7, 2050e3 / 6e5


def drive(payload_t, v, burn_years):
    """Deuterium and engine for a payload to `v` of light speed in one burn of `burn_years`. The engine grows with the
    thrust the burn needs, and the fuel with the engine, so it is solved together, as in early_game.seed_ship."""
    ratio = math.exp(v * C / VE)
    n_per_t = (ratio - 1) * 1e3 * VE / (burn_years * YEAR)
    k = KG_PER_N * n_per_t / 1e3
    if k >= 1:
        return None
    dry = payload_t / (1 - k)
    return dict(ratio=ratio, engine=dry - payload_t, dry=dry, fuel=(ratio - 1) * dry)


def sail():
    e = LASER_W * PULSE_S
    print('Sail (Parkin 2018): 4.1 m across, 3.6 g with its 1 g chip, to 0.2 of light speed.')
    print(f'  Beam: {LASER_W / 1e9:.0f} GW for {PULSE_S} s from an array {ARRAY_M / 1e3:.1f} km across, {e / 3.6e12:.0f} GWh of light a launch.')
    print('  Parkin counts 63 GWh drawn from storage, about 6 million dollars at 10 cents a kWh: hours of a small grid.')
    print('  Its price is being seen: the light that passes the sail flashes toward its star.')
    launch_glare(4.24)


def flyby(payload_t=150, v=0.1):
    print(f'\nFlyby probe: {payload_t} t of instruments, as Icarus Firefly\'s payload, to {v} of light speed. It never brakes.')
    print('  At an eighth of light speed a deuterium engine outweighs the craft unless it burns 30 Years: 54 kt. Daedalus')
    print('  reached it only on helium-3. Settled 2026-11-07: a tenth, on deuterium.')
    for burn in (10, 20):
        d = drive(payload_t, v, burn)
        if not d:
            print(f'  A {burn}-Year burn: the engine would outweigh the craft.')
            continue
        print(f'  A {burn}-Year burn: mass ratio {d["ratio"]:.1f}, engine {d["engine"]:,.0f} t, {d["fuel"]:,.0f} t of deuterium,'
              f' {d["fuel"] / 1e3 / D_WORKS_KT:.1f} Years of the Deuterium Works.')


def sentinel(payload_t=1000, v=0.1):
    print(f'\nSentinel: {payload_t:,} t, about half of it magnetic sail (Gros 2017), to {v} of light speed, braking on its sail.')
    for burn in (10, 20):
        d = drive(payload_t, v, burn)
        if not d:
            print(f'  A {burn}-Year burn: the engine would outweigh the craft.')
            continue
        print(f'  A {burn}-Year burn: mass ratio {d["ratio"]:.1f}, engine {d["engine"]:,.0f} t, {d["fuel"]:,.0f} t of deuterium,'
              f' {d["fuel"] / 1e3 / D_WORKS_KT:.1f} Years of the Deuterium Works.')
    print('  Braking: Gros 2017 stops 1,500 t from 0.1c in about 19 years over 0.37 ly, 15 Years more than cruising it.')
    stop = drive(payload_t, v, 20)
    both = math.exp(2 * v * C / VE)
    print(f'  Braking on fuel instead: mass ratio {both:.0f} for both burns, before any engine. The magnetic sail is why it can stop.')
    return stop


def catalog():
    """What the game takes, through calcs/export_worlds.py into game/data/works.json: each craft's fuel in kt of
    deuterium, a flyby probe's speed and the Years its 20-Year burn adds over cruising, and the Works' rate."""
    import seed as S
    # One speed for both, calcs/seed.py's: a fusion craft's fuel holds it to a tenth of light speed (calcs/speeds.py).
    probe, stay = drive(150, S.ROCKET_V, 20), drive(1000, S.ROCKET_V, 20)
    return dict(probe=dict(build=12, speed=S.ROCKET_V, burn=10, fuel=round(probe['fuel'] / 1e3, 1)),
                sentinelFuel=round(stay['fuel'] / 1e3, 1), sentinelBrake=S.BRAKE, deuterium=dict(perYear=D_WORKS_KT))


if __name__ == '__main__':
    sail()
    flyby()
    sentinel()
