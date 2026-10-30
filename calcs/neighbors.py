"""The host stars within 50 ly, and the physics every world there must pass: where a planet's orbit is stable, and how
hard it tugs its star. Run: python3 calcs/neighbors.py

Once it also checked the hand-written neighbors against physics. The roster was retired 2026-10-29 by the realistic
premise, one mind per million stars, and its checks went with it. The minds a game holds come from calcs/minds.py.
Sources are in HOLOS_RESEARCH.md.
"""
import csv, math
from pathlib import Path
import binaries, hosts

ROOT = Path(__file__).resolve().parents[1]
LY = 9.4607e15
JY = 1e-26
EARTH_WAKES = 2040.0
G, M_EARTH, R_EARTH, M_SUN, R_SUN = 6.674e-11, 5.972e24, 6.371e6, 1.989e30, 6.957e8
YEAR_S = 3.156e7

# A red dwarf's 2026 floor is what the surveys could feel there, from calcs/hosts.py, settled 2026-10-16. One no
# survey watched hides any warm world. By 2040 a watched red dwarf's floor halves: a decade more, four times the nights.
# By 2040 a decade of nightly watching reaches about 0.1 m/s for Terra Hunting's bright northern stars, and about
# 0.3 m/s for other bright Sun-like stars. Above that, Earth found the world: it is a seeded find, not hidden.
RV_2026 = 1.0
def rv_2040(host):
    if host['kind'] == 'M': return min(host.get('rv_floor', RV_2026), host.get('rv_survey', RV_2026) / 2)
    bright_sunlike = host['kind'] in 'GK' and host['luminosity'] > 0.3
    return min((0.1 if host.get('north') else 0.3) if bright_sunlike else 1.0, host.get('rv_floor', RV_2026))

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
    known = hosts.planets()
    close = binaries.close_orbits(star_list)
    by_id = {s['id']: s for s in star_list}
    for r in rows:
        r['luminosity'] = float(r['luminosity']); r['distance_ly'] = float(r['distance_ly'])
        r['age'], r['age_by'] = (float(r['age_pub_gyr']), r['age_pub_by']) if r.get('age_pub_gyr') else (None, None)
        r['hz_in'], r['hz_out'] = hosts.hz(r['luminosity'])     # the CSV rounds dim stars' zones to zero
        s = by_id.get(r['id'], {})
        r['north'] = s.get('dec', -90) > -20
        r['companions'] = [(o, sep) for o, sep in pairs.get(r['id'], [])]
        r['gabs'] = s.get('gabs', 4.67)
        r['orbits'] = close.get(r['id'], [])                   # published orbits of pairs Gaia can't split
        r['planets'] = {(p['pl_name'], float(p['pl_bmasse']), float(p['pl_orbsmax']), float(p['pl_orbeccen'] or 0))
                        for p in known.get(r['id'], []) + known.get(r['name'], []) + known.get(f"HIP {s.get('hip')}", [])
                        if p['pl_bmasse'] and p['pl_orbsmax']}
        rv = [p for p in known.get(r['id'], []) + known.get(r['name'], []) + known.get(f"HIP {s.get('hip')}", [])
              if p['discoverymethod'] == 'Radial Velocity']
        r['rv_survey'] = (float(r['rv_floor_2026']) if r['rv_floor_2026'] else math.inf) if r['kind'] == 'M' else RV_2026
        r['rv_floor'] = min([r['rv_survey']] + [float(p['pl_rvamp']) if p['pl_rvamp'] else
                                                tug(float(p['pl_bmasse']), float(p['pl_orbsmax']), star_mass(r['luminosity']), 1)
                                                for p in rv if p['pl_rvamp'] or (p['pl_bmasse'] and p['pl_orbsmax'])])
    return rows

def orbit_fails(host, mass, a, e, pole):
    """Why a world of this mass can't sit on this orbit at this star, unseen from Sol by 2026. And its tug, in m/s.
    A neighbor's world and a natural one pass the same checks."""
    fails = []
    for o, sep in host['companions']:
        m1, m2 = hosts.mass_from_gabs(host['gabs']), hosts.mass_from_gabs(o['gabs'])
        if a * (1 + e) > hosts.critical_a(m2 / (m1 + m2)) * sep: fails.append('its orbit is unstable beside a companion')
    if host['orbits'] and not binaries.zone_left(hosts.mass_from_gabs(host['gabs']), a * (1 - e),
                                                 a * (1 + e), host['orbits']):
        fails.append('its orbit is unstable beside a close companion')
    m_star = star_mass(host['luminosity'])
    # Known planets: small ones 10 mutual Hill radii from its orbit, since packed systems tighter than that eventually
    # go unstable (Chambers et al. 1996). A giant, 2√3, the limit for two planets (Gladman 1993). Gaps use both
    # eccentricities.
    for pname, pm, pa, pe in host['planets']:
        hill = ((mass + pm) * M_EARTH / (3 * m_star * M_SUN)) ** (1 / 3) * (a + pa) / 2
        gap = pa * (1 - pe) - a * (1 + e) if pa > a else a * (1 - e) - pa * (1 + pe)
        if gap < (10 if pm < 10 else 2 * 3 ** 0.5) * hill: fails.append(f'too close to known planet {pname}')
    r_star = R_SUN * host['luminosity'] ** 0.5 / (m_star ** 0.5) if m_star > 0.6 else R_SUN * m_star
    if abs(math.cos(math.radians(pole))) < r_star / (a * 1.496e11): fails.append('it would transit, seen from Sol')
    k = tug(mass, a, m_star, math.sin(math.radians(pole)))
    if k > host.get('rv_floor', RV_2026): fails.append(f'its tug shows in 2026 data: {k:.2f} m/s')
    return fails, k

if __name__ == '__main__':
    rows = load_hosts()
    print(f"{len(rows)} host stars within 50 ly, {sum(r['kind'] == 'M' for r in rows)} of them red dwarfs.")
