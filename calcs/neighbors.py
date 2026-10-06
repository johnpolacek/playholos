"""Check every hand-written neighbor against physics, at every place and time the seed could put it.
Run: python3 calcs/neighbors.py

Each neighbor is written once, in HOLOS_NEIGHBORS.md for its prose and in ROSTER below for its numbers.
The seed then chooses a placement: a host star, a waking year and the way its world's orbit faces Sol.
A placement passes only if every check here passes. The seed draws only from passing placements.
Sources are in HOLOS_RESEARCH.md.
"""
import csv, math, random
from pathlib import Path
import hosts

ROOT = Path(__file__).resolve().parents[1]
LY = 9.4607e15
JY = 1e-26
EARTH_WAKES = 2040.0
G, M_EARTH, R_EARTH, M_SUN, R_SUN = 6.674e-11, 5.972e24, 6.371e6, 1.989e30, 6.957e8
YEAR_S = 3.156e7

# ---------- The roster ----------
# Numbers only. Orbits sit at a share of the way across the host's warm zone, so a neighbor fits any host.
# Emissions are steady tones in watts, timed in years before its own waking: radio_since, loud spans, then its hum.
# Character sets the odds it heard Earth: 'listener', 'ordinary' or 'inward'.
ROSTER = [
    # Veyra: prose in HOLOS_NEIGHBORS.md. v1 set it at Delta Pavonis; now the seed places it.
    dict(name='Veyra', kinds='GK', world=dict(mass=1.1, hz_share=0.1, e=0.03, day_hours=31, moon='large'),
         radio_since=210, arrays_since=60, emissions=[(210, 110, 1e6)], hum=3e4, awake=1e4, character='listener'),
]

# ---------- What Earth's searches could catch ----------
# Narrowband tones, F_min = SNR x SEFD x sqrt(channel / (2 x stare)). Light Earth received in year T left in T - d.
SEARCHES = [
    (2017.0, 'Breakthrough Listen, a big dish for 5 minutes', 10, 3, 300),
    (2040.0, 'SKA-Mid for an hour, assumed for every star within 50 ly by Year 0', 1.1, 1, 3600),
]
def floor_watts(sefd, chan, stare, ly):
    return 4 * math.pi * (ly * LY) ** 2 * 10 * sefd * JY * math.sqrt(chan / (2 * stare))

# ---------- What Earth's planet hunters could feel ----------
# A world's tug on its star, K. In 2026 the star's own shimmer, about 1 m/s, hides an Earth.
# By 2040 a decade of nightly watching reaches about 0.1 m/s for Terra Hunting's bright northern stars, and about
# 0.3 m/s for other bright Sun-like stars. Above that, Earth found the world: it is a seeded find, not hidden.
RV_2026 = 1.0
def rv_2040(host):
    bright_sunlike = host['kind'] in 'GK' and host['luminosity'] > 0.3
    return (0.1 if host.get('north') else 0.3) if bright_sunlike else 1.0

def tug(m_earths, a_au, m_star, sin_i):
    period_yr = math.sqrt(a_au ** 3 / m_star)
    return 28.4 * (m_earths / 317.8) * sin_i * period_yr ** (-1 / 3) * m_star ** (-2 / 3)

# ---------- Leaving the ground ----------
# Rocky radius grows about as mass to the 1/3.7 (Zeng et al. 2016). Fuel for the same payload grows as
# exp(extra escape speed / exhaust speed), 4.4 km/s for the best chemical rockets (Hippke 2018).
def lift_factor(m_earths):
    r = R_EARTH * m_earths ** (1 / 3.7)
    v_esc = math.sqrt(2 * G * m_earths * M_EARTH / r)
    return v_esc / 1000, math.exp((v_esc - 11186) / 4400)

def star_mass(lum):
    return lum ** 0.25                          # main sequence, roughly

def load_hosts():
    rows = list(csv.DictReader((ROOT / 'data' / 'hosts-50ly.csv').open()))
    star_list = hosts.stars(); hosts.name_from_hyg(star_list)
    pairs = hosts.companions(star_list)
    by_id = {s['id']: s for s in star_list}
    for r in rows:
        r['luminosity'] = float(r['luminosity']); r['distance_ly'] = float(r['distance_ly'])
        r['hz_in'], r['hz_out'] = hosts.hz(r['luminosity'])     # the CSV rounds dim stars' zones to zero
        s = by_id.get(r['id'], {})
        r['north'] = s.get('dec', -90) > -20
        r['companions'] = [(o, sep) for o, sep in pairs.get(r['id'], [])]
        r['gabs'] = s.get('gabs', 4.67)
    return rows

def check(n, host, waking, pole_from_sol):
    """Every reason this placement fails. Empty means it passes."""
    fails = []
    w = n['world']
    if host['kind'] not in n.get('kinds', 'FGKM'): fails.append(f"its people can't live at a {host['kind']} star")
    a = host['hz_in'] + w['hz_share'] * (host['hz_out'] - host['hz_in'])
    if w['mass'] > 10: fails.append('too heavy to leave by rocket')
    for o, sep in host['companions']:
        m1, m2 = hosts.mass_from_gabs(host['gabs']), hosts.mass_from_gabs(o['gabs'])
        if a * (1 + w.get('e', 0)) > hosts.critical_a(m2 / (m1 + m2)) * sep: fails.append('its orbit is unstable beside a companion')
    m_star = star_mass(host['luminosity'])
    r_star = R_SUN * host['luminosity'] ** 0.5 / (m_star ** 0.5) if m_star > 0.6 else R_SUN * m_star
    if abs(math.cos(math.radians(pole_from_sol))) < r_star / (a * 1.496e11): fails.append('it would transit, seen from Sol')
    k = tug(w['mass'], a, m_star, math.sin(math.radians(pole_from_sol)))
    if k > RV_2026: fails.append(f'its tug shows in 2026 data: {k:.2f} m/s')
    for year, name, sefd, chan, stare in SEARCHES:
        left = year - host['distance_ly']
        p = tone_at(n, waking, left)
        if p > floor_watts(sefd, chan, stare, host['distance_ly']): fails.append(f'{name} would have heard it: {p / 1e6:,.0f} MW tones')
    return fails, dict(a=a, tug=k, found_by_2040=k > rv_2040(host), heard=heard_odds(n, host, waking))

# ---------- Did it hear Earth by Year 0? ----------
# Earth's radars have spread since 1950. They reach a neighbor d years later. It could hear them only once its big
# arrays were running, arrays_since years before its waking. Odds from Earth's loud past: a listener about 9 in 10,
# an ordinary neighbor 1 in 2, an inward one 1 in 5. Awake before Year 0, a Mind that looks finds them almost surely.
HEARD = {'listener': 0.9, 'ordinary': 0.5, 'inward': 0.2}
def heard_odds(n, host, waking):
    arrives = 1950 + host['distance_ly']
    listening_from = waking - n.get('arrays_since', 60)
    if min(EARTH_WAKES, waking) - max(arrives, listening_from) < 5 and waking > EARTH_WAKES: return 0.0
    odds = HEARD[n['character']]
    if waking < EARTH_WAKES - 5 and arrives < EARTH_WAKES: odds = max(odds, 0.5 if n['character'] == 'inward' else 0.95)
    return odds

def tone_at(n, waking, year):
    """Its steadiest tones, in watts, in a given Earth calendar year: nothing before its radio, its loud years,
    its hum between them, and once awake whatever it chose to send."""
    before = waking - year
    if before > n['radio_since']: return 0
    for start, end, watts in n['emissions']:
        if end <= before <= start: return watts
    return n.get('awake', n['hum']) if before < 0 else n['hum']

def placements(n, host_rows, tries=200, seed=1):
    rng = random.Random(seed)
    ok, reasons = 0, {}
    host_rows = [h for h in host_rows if h['kind'] in n.get('kinds', 'FGKM')]   # the seed only draws stars it can live at
    for _ in range(tries):
        host = rng.choices(host_rows, weights=[float(h['weight']) for h in host_rows])[0]
        waking = EARTH_WAKES + 100 * (rng.random() - rng.random())       # a century either way, most near Earth's
        pole = math.degrees(math.acos(rng.uniform(-1, 1)))
        fails, _ = check(n, host, waking, pole)
        if fails:
            for f in fails:
                kind = f.split(':')[0]
                reasons[kind] = reasons.get(kind, 0) + 1
        else: ok += 1
    return ok / tries, reasons

def at(n, host_rows, name, waking=EARTH_WAKES, pole=60):
    """One placement in detail: a named host, a waking year, a pole angle from Sol's line."""
    host = next(h for h in host_rows if h['name'] == name)
    fails, info = check(n, host, waking, pole)
    print(f"{n['name']} at {name}, {host['distance_ly']:.1f} ly, waking {waking:.0f}: orbit {info['a']:.2f} AU, "
          f"tug {info['tug']:.2f} m/s{', found by 2040' if info['found_by_2040'] else ''}, heard Earth {info['heard']:.0%}. "
          + ('Passes.' if not fails else 'Fails: ' + '; '.join(fails)))

def report(host_rows):
    if not ROSTER:
        print('The roster is empty. Self-test with an Earth-like neighbor:')
    for n in ROSTER or [TEST]:
        v, f = lift_factor(n['world']['mass'])
        share, reasons = placements(n, host_rows)
        print(f"{n['name']}: escape {v:.1f} km/s, {f:.1f} times Earth's fuel per tonne lifted. "
              f"{share:.0%} of seeded placements pass.")
        for why, count in sorted(reasons.items(), key=lambda kv: -kv[1]): print(f'  fails {count}: {why}')

# An Earth twin with Earth's real radio past, used only to test the checks: its radars from 90 years before waking
# to 10 before, at about 2e11 W along their beams, should fail near Sol.
TEST = dict(name='Test: an Earth twin', kinds='GK', world=dict(mass=1.0, hz_share=0.3, e=0.02),
            radio_since=120, emissions=[(90, 10, 2e11)], hum=1e5, character='ordinary')

if __name__ == '__main__':
    rows = load_hosts()
    report(rows)
    print()
    at(ROSTER[0], rows, 'Del Pav')                       # v1's home, waking with Earth
    at(ROSTER[0], rows, 'Del Pav', waking=1990)          # fifty years before Earth
    at(ROSTER[0], rows, 'Eps Ind', waking=2090)          # a near K dwarf, fifty years after
