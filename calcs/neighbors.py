"""Check every hand-written neighbor against physics, at every place and time the seed could put it.
Run: python3 calcs/neighbors.py

Each neighbor is written once, in HOLOS_NEIGHBORS.md for its prose and in ROSTER below for its numbers.
The seed then chooses a placement: a host star, a waking year and the way its world's orbit faces Sol.
A placement passes only if every check here passes. The seed draws only from passing placements.
Sources are in HOLOS_RESEARCH.md.
"""
import csv, math, random
from pathlib import Path
import binaries, hosts, knocks

ROOT = Path(__file__).resolve().parents[1]
LY = 9.4607e15
JY = 1e-26
EARTH_WAKES = 2040.0
G, M_EARTH, R_EARTH, M_SUN, R_SUN = 6.674e-11, 5.972e24, 6.371e6, 1.989e30, 6.957e8
YEAR_S = 3.156e7

# Air of 1 bar keeps a warm world turning only at stars above about 0.5 to 0.7 Suns, 10 bars down to about 0.3
# (Leconte et al. 2015). Thick-aired worlds here need about half a Sun or more: luminosity 0.03.
MIN_LUM_TURNING = 0.03

def N(name, disposition, kinds, mass, hz_share, e=0.03, locked=False, radio=200, arrays=60, loud=(), hum=1e4,
      awake=None, char='ordinary', strange=False, dies=None, last=(), struck=False, doubling=None, min_lum=0):
    """One roster entry, in the slate's short form."""
    n = dict(name=name, disposition=disposition, kinds=kinds, strange=strange, character=char,
             world=dict(mass=mass, hz_share=hz_share, e=e, locked=locked), radio_since=radio, arrays_since=arrays,
             emissions=list(loud) + list(last), hum=hum, doubling=doubling or (5 if disposition == 'inward' else 10))
    if awake is not None: n['awake'] = awake
    if min_lum: n['min_lum'] = min_lum
    if dies is not None: n.update(dies=dies, struck=struck)
    return n

# ---------- The roster ----------
# Numbers only. Orbits sit at a share of the way across the host's warm zone, so a neighbor fits any host.
# Emissions are steady tones in watts, timed in years before its own waking: radio_since, loud spans, then its hum.
# Character sets the odds it heard Earth: 'listener', 'ordinary' or 'inward'.
ROSTER = [
    # Veyra: prose in HOLOS_NEIGHBORS.md. v1 set it at Delta Pavonis; now the seed places it.
    dict(name='Veyra', disposition='watcher', kinds='GK', world=dict(mass=1.1, hz_share=0.1, e=0.03, day_hours=31, moon='large'),
         radio_since=210, arrays_since=60, emissions=[(210, 110, 1e6)], hum=3e4, awake=1e4, character='listener'),
    # Hael: a century of calling, 120 to 20 years before waking, knocks of 10 GW aimed at chosen Sun-like stars.
    # Sol is one of them about one time in three. Awake, it calls again, the same way.
    dict(name='Hael', disposition='contacter', kinds='G', world=dict(mass=0.9, hz_share=0.05, e=0.04, day_hours=19, moon='large'),
         radio_since=240, arrays_since=200, emissions=[(120, 20, 1e10, 'aimed')], hum=1e4, awake=1e10,
         awake_aimed=True, aims_at_sol=1 / 3, character='listener'),
    # Kesh: a super-Earth, hard to leave. Loud for ninety years, then quiet by choice.
    dict(name='Kesh', disposition='watcher', kinds='K', world=dict(mass=3.0, hz_share=0.3, e=0.05, day_hours=26, moon='small'),
         radio_since=180, arrays_since=40, emissions=[(180, 90, 1e7)], hum=1e5, awake=1e5, character='ordinary'),
] + [
    # The 2026-10-10 slate. Prose in HOLOS_NEIGHBORS.md. Locked worlds keep one face to their star (Lobo et al. 2023:
    # their warm band survives on dry worlds, not water worlds). Dead neighbors never wake: dies is when, in years
    # before the waking they never had, and their last broadcast is their final emission.
    N('Tavi', 'watcher', 'M', 0.9, 0.45, locked=True, radio=160, arrays=50, loud=[(160, 120, 1e6)], hum=1e4, awake=1e3, char='listener', strange=True),
    N('Ombe', 'contacter', 'M', 1.3, 0.35, locked=True, radio=200, arrays=80, loud=[(200, 60, 3e6)], hum=3e4, awake=1e5, char='listener'),
    N('Sere', 'watcher', 'GK', 0.8, 0.15, radio=190, arrays=40, loud=[(190, 140, 5e5)], hum=1e4, awake=1e3, char='ordinary'),
    N('Ilm', 'contacter', 'GK', 1.2, 0.4, radio=170, arrays=90, loud=[(170, 70, 2e6)], hum=5e4, awake=1e5, char='listener'),
    N('Varn', 'inward', 'K', 4.5, 0.3, radio=230, arrays=30, loud=[(230, 100, 2e7)], hum=1e5, awake=1e4, char='inward'),
    N('Quessa', 'watcher', 'GK', 0.6, 0.3, radio=150, arrays=60, loud=[(150, 110, 8e5)], hum=1e4, awake=1e3, char='listener', strange=True),
    N('Daal', 'hunter', 'GK', 1.0, 0.5, radio=210, arrays=70, loud=[(210, 150, 4e6)], hum=1e3, awake=1e3, char='listener'),
    N('Ystra', 'inward', 'M', 0.7, 0.4, locked=True, radio=120, arrays=20, loud=[(120, 90, 3e5)], hum=1e4, awake=1e2, char='inward', strange=True),
    N('Nuvo', 'contacter', 'GK', 1.1, 0.25, radio=220, arrays=120, loud=[(220, 80, 5e6)], hum=5e4, awake=1e5, char='listener'),
    N('Pelle', 'watcher', 'K', 1.0, 0.3, radio=140, arrays=70, loud=[(140, 60, 2e6)], hum=1e4, char='ordinary',
      dies=45, last=[(46, 45, 5e9)]),
    N('Kirrin', 'watcher', 'K', 1.4, 0.2, radio=180, arrays=50, loud=[(180, 130, 1e6)], hum=1e4, awake=1e3, char='ordinary', strange=True),
    N('Ruun', 'contacter', 'G', 0.5, 0.2, radio=260, arrays=100, loud=[(260, 160, 1e6)], hum=3e4, awake=1e5, char='listener'),
    N('Faen', 'inward', 'F', 1.0, 0.35, radio=170, arrays=40, loud=[(170, 120, 1e6)], hum=1e4, awake=1e3, char='inward'),
    N('Corra', 'watcher', 'M', 1.6, 0.3, locked=True, radio=150, arrays=40, loud=[(150, 100, 1e6)], hum=1e4, awake=1e3, char='ordinary'),
    N('Lusk', 'watcher', 'KM', 2.0, 0.2, radio=200, arrays=60, loud=[(200, 150, 3e6)], hum=1e4, awake=1e3, char='listener', min_lum=MIN_LUM_TURNING),
    N('Iru', 'contacter', 'K', 0.5, 0.35, radio=190, arrays=110, loud=[(190, 90, 1e6)], hum=3e4, awake=1e5, char='listener', strange=True),
    N('Anwe', 'watcher', 'G', 0.9, 0.3, radio=160, arrays=40, loud=[(160, 70, 3e6)], hum=1e4, char='ordinary',
      dies=20, last=[]),
    N('Tolle', 'watcher', 'G', 1.2, 0.3, e=0.3, radio=180, arrays=50, loud=[(180, 120, 2e6)], hum=1e4, awake=1e3, char='ordinary'),
    N('Vesh', 'hunter', 'M', 1.0, 0.5, locked=True, radio=140, arrays=90, loud=[(140, 120, 3e5)], hum=1e3, awake=1e2, char='listener', strange=True),
    N('Sabe', 'contacter', 'GK', 2.5, 0.3, radio=210, arrays=90, loud=[(210, 90, 4e6)], hum=5e4, awake=1e5, char='listener'),
    N('Ulan', 'inward', 'K', 0.9, 0.4, radio=170, arrays=20, loud=[(170, 100, 1e6)], hum=1e4, awake=1e3, char='inward'),
    N('Mirr', 'watcher', 'M', 0.8, 0.4, locked=True, radio=130, arrays=40, loud=[(130, 100, 5e5)], hum=1e4, char='ordinary',
      dies=10, last=[], struck=True),
    N('Odun', 'watcher', 'K', 1.0, 0.75, radio=200, arrays=60, loud=[(200, 140, 1e6)], hum=1e4, awake=1e3, char='listener'),
    N('Ree', 'contacter', 'FG', 1.3, 0.3, radio=240, arrays=150, loud=[(240, 100, 3e6)], hum=5e4, awake=1e5, char='listener'),
    N('Hesk', 'inward', 'M', 1.1, 0.45, radio=110, arrays=20, loud=[(110, 80, 2e5)], hum=1e3, awake=1e2, char='inward', strange=True, min_lum=MIN_LUM_TURNING),
    N('Arro', 'watcher', 'GK', 0.9, 0.3, radio=190, arrays=50, loud=[(190, 130, 1e6)], hum=1e4, awake=1e3, char='ordinary'),
    N('Wenn', 'watcher', 'M', 0.7, 0.5, radio=150, arrays=40, loud=[(150, 110, 5e5)], hum=1e4, awake=1e3, char='ordinary', min_lum=MIN_LUM_TURNING),
]

# ---------- What Earth's searches could catch ----------
# Narrowband tones, F_min = SNR x SEFD x sqrt(channel / (2 x stare)). Light Earth received in year T left in T - d.
SEARCHES = [
    (2017.0, 'Breakthrough Listen, a big dish for 5 minutes', 10, 3, 300),
    (2040.0, 'SKA-Mid for an hour, assumed for every star within 50 ly by Year 0', 1.1, 1, 3600),
]
def floor_watts(sefd, chan, stare, ly):
    return 4 * math.pi * (ly * LY) ** 2 * 10 * sefd * JY * math.sqrt(chan / (2 * stare))

# ---------- What Earth's infrared archives could see ----------
# A Mind computes cold, far from its star, and its waste heat glows in the far infrared. Herschel and JCMT archives
# rule out about 7e19 W at 10 pc, growing with distance squared (Garrett 2026). A Mind starts at Earth's 2040 scale,
# about 1e13 W, and doubles every `doubling` years after waking: 10 for most, 5 for those that turn inward.
GLOW_LIMIT_10PC, PC_LY = 7e19, 3.2616
def glow_at(n, waking, year):
    after = year - waking
    if after <= 0 or n.get('dies') is not None: return 0     # the dead never wake
    return 1e13 * 2 ** (after / n.get('doubling', 10))

# ---------- What Earth's planet hunters could feel ----------
# A world's tug on its star, K. In 2026 the star's own shimmer, about 1 m/s, hides an Earth. Stars watched hardest
# do better: at Barnard's Star and Proxima, planets near 0.2 to 0.4 m/s are already found. So a star's 2026 floor is
# the smallest tug among its planets found by radial velocity, if under 1 m/s.
# By 2040 a decade of nightly watching reaches about 0.1 m/s for Terra Hunting's bright northern stars, and about
# 0.3 m/s for other bright Sun-like stars. Above that, Earth found the world: it is a seeded find, not hidden.
RV_2026 = 1.0
def rv_2040(host):
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
        r['rv_floor'] = min([RV_2026] + [float(p['pl_rvamp']) if p['pl_rvamp'] else
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

def check(n, host, waking, pole_from_sol, sol_targeted=True):
    """Every reason this placement fails. Empty means it passes. Aimed knocks reach Earth only if Sol was a target."""
    fails = []
    w = n['world']
    if host['kind'] not in n.get('kinds', 'FGKM'): fails.append(f"its people can't live at a {host['kind']} star")
    if host['luminosity'] < n.get('min_lum', 0): fails.append('too dim: its world would lock')
    a = host['hz_in'] + w['hz_share'] * (host['hz_out'] - host['hz_in'])
    if w['mass'] > 10: fails.append('too heavy to leave by rocket')
    orbit, k = orbit_fails(host, w['mass'], a, w.get('e', 0), pole_from_sol)
    fails += orbit
    for year, name, sefd, chan, stare in SEARCHES:
        left = year - host['distance_ly']
        p = tone_at(n, waking, left, sol_targeted)
        if p > floor_watts(sefd, chan, stare, host['distance_ly']): fails.append(f'{name} would have heard it: {p / 1e6:,.0f} MW tones')
    glow = glow_at(n, waking, EARTH_WAKES - host['distance_ly'])
    if glow > GLOW_LIMIT_10PC * (host['distance_ly'] / (10 * PC_LY)) ** 2: fails.append(f'Herschel would have seen its cold glow: {glow:.0e} W')
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

def tone_at(n, waking, year, sol_targeted=True):
    """Its steadiest tones toward Sol, in watts, in a given Earth calendar year: nothing before its radio, its loud
    years, its hum between them, and once awake whatever it chose to send. Aimed knocks count only if Sol was a target."""
    before = waking - year
    if before > n['radio_since']: return 0
    if n.get('dies') is not None and before < n['dies']:
        for start, end, watts, *how in n['emissions']:
            if end <= before <= start: return watts
        return 0                                               # dead: silence after its last broadcast
    for start, end, watts, *how in n['emissions']:
        if end <= before <= start: return watts if sol_targeted or how != ['aimed'] else n['hum']
    if before < 0:
        return n.get('awake', n['hum']) if sol_targeted or not n.get('awake_aimed') else n['hum']
    return n['hum']

# ---------- Stars Earth knocked on ----------
# Earth's aimed messages, by the host-list name of the star each was aimed at. 55 Cancri A is dropped as a host, since
# a known giant crosses its warm zone, but its companion B sat in the same beam. Altair, 47 Ursae Majoris, Kappa1 Ceti,
# HD 10307, Teegarden's Star and Gliese 208 can't host a neighbor: Gliese 208 spins every 12.3 days, which dates it
# near half a billion years. In about one game in five, if a drawn neighbor passes at one of these stars, the seed
# puts it there, so Earth's real knocks sometimes have someone to hear them.
KNOCKED = {"Luyten's Star": "Luyten's Star", 'TZ Arietis': 'Gl 83.1', 'Gliese 526': 'Gl 526', 'Gliese 581': 'Gl 581',
           'Gliese 49': 'Gl 49', '55 Cancri': 'Gl 324B'}
KNOCKED_SHARE = 0.2

# Settled 2026-10-14: any knock above a world's floor is caught. A beam meant for you is cheap to hear: Earth builds an
# all-sky watch in 6 Years for a hundredth of its thought, so an awake Mind keeps one, and it catches every knock above
# that watch's floor. A sender also listens to every star it knocked, for good. Earth's knocks are taken at Cosmic
# Call's 1e12 W for four hours: the floor at 50 ly is about 2e10 W. Lone Signal was hundreds of times weaker but ran
# for two months, and Sónar Calling was about 1e11 W at 12 ly: both clear the floor at their stars.
# Before its Mind wakes, a people catches a knock only where it happens to listen: one that heard Earth's radars, with
# its arrays running when the knock arrived. Then a listener catches it about 3 times in 4, an ordinary one 1 in 2,
# an inward one 1 in 10. Otherwise, under 1 in 100. Settled 2026-10-10, and kept for peoples.
CATCH = {'listener': 0.75, 'ordinary': 0.5, 'inward': 0.1}
WATCH_SEFD = 12                          # an all-sky watch like Earth's: every direction, every hour
def caught_odds(n, host, waking, arrives, watts=1e12, hours=4):
    if n.get('dies') is not None and arrives > waking - n['dies']: return 0.0
    if arrives >= waking: return 1.0 if watts >= floor_watts(WATCH_SEFD, 1, hours * 3600, host['distance_ly']) else 0.01
    if arrives < waking - n.get('arrays_since', 60): return 0.01
    return heard_odds(n, host, waking) * CATCH[n['character']] + 0.01

def knocked_report(host_rows, tries=100):
    by_name = {h['name']: h for h in host_rows}
    print('At the stars Earth knocked on, who can live there:')
    for target, name in KNOCKED.items():
        h = by_name[name]
        sent = min(s for m, s, tg, ly in knocks.KNOCKS if tg == target)
        arrives, year = sent + h['distance_ly'], sent + 2 * h['distance_ly'] - EARTH_WAKES
        fits = []
        for n in ROSTER:
            rng, ok, caught = random.Random(2), 0, 0.0
            for _ in range(tries):
                waking = EARTH_WAKES + 100 * (rng.random() - rng.random())
                pole = math.degrees(math.acos(rng.uniform(-1, 1)))
                if not check(n, h, waking, pole)[0]: ok += 1; caught += caught_odds(n, h, waking, arrives)
            if ok > tries / 2: fits.append(f"{n['name']} {caught / ok:.0%}")
        print(f"  {target} ({name}, {h['kind']}, {h['distance_ly']:.1f} ly): knock arrives {arrives:.0f}, reply by Year {year:.1f}. "
              f"{len(fits)} fit, with odds of catching the knock: {', '.join(fits)}")

def placements(n, host_rows, tries=200, seed=1):
    rng = random.Random(seed)
    ok, reasons, homes = 0, {}, set()
    host_rows = [h for h in host_rows if h['kind'] in n.get('kinds', 'FGKM') and h['luminosity'] >= n.get('min_lum', 0)]   # the seed only draws stars it can live at
    for _ in range(tries):
        host = rng.choices(host_rows, weights=[float(h['weight']) for h in host_rows])[0]
        waking = EARTH_WAKES + 100 * (rng.random() - rng.random())       # a century either way, most near Earth's
        pole = math.degrees(math.acos(rng.uniform(-1, 1)))
        targeted = rng.random() < n.get('aims_at_sol', 1)
        fails, _ = check(n, host, waking, pole, targeted)
        if fails:
            for f in fails:
                kind = f.split(':')[0]
                reasons[kind] = reasons.get(kind, 0) + 1
        else: ok += 1; homes.add(host['name'])
    return ok / tries, reasons, len(homes)

def at(n, host_rows, name, waking=EARTH_WAKES, pole=60, sol_targeted=True):
    """One placement in detail: a named host, a waking year, a pole angle from Sol's line."""
    host = next(h for h in host_rows if h['name'] == name)
    fails, info = check(n, host, waking, pole, sol_targeted)
    print(f"{n['name']} at {name}, {host['distance_ly']:.1f} ly, waking {waking:.0f}: orbit {info['a']:.2f} AU, "
          f"tug {info['tug']:.2f} m/s{', found by 2040' if info['found_by_2040'] else ''}, heard Earth {info['heard']:.0%}. "
          + ('Passes.' if not fails else 'Fails: ' + '; '.join(fails)))

def report(host_rows):
    if not ROSTER:
        print('The roster is empty. Self-test with an Earth-like neighbor:')
    for n in ROSTER or [TEST]:
        v, f = lift_factor(n['world']['mass'])
        share, reasons, homes = placements(n, host_rows)
        tags = ', '.join(x for x in (n.get('disposition'), 'strange' if n.get('strange') else '',
                                     'dead' if n.get('dies') is not None else '') if x)
        print(f"{n['name']} ({tags}): escape {v:.1f} km/s, {f:.1f} times Earth's fuel per tonne lifted. "
              f"{share:.0%} of seeded placements pass, at {homes} different stars.")
        for why, count in sorted(reasons.items(), key=lambda kv: -kv[1]): print(f'  fails {count}: {why}')
    if ROSTER:
        print()
        for d in ('watcher', 'contacter', 'inward', 'hunter'):
            names = [n['name'] for n in ROSTER if n.get('disposition') == d]
            print(f"{d}s {len(names)} of {len(ROSTER)}, {len(names) / len(ROSTER):.0%}: {', '.join(names)}")
        print(f"strange {sum(1 for n in ROSTER if n.get('strange'))}, dead {sum(1 for n in ROSTER if n.get('dies') is not None)}")

# An Earth twin with Earth's real radio past, used only to test the checks: its radars from 90 years before waking
# to 10 before, at about 2e11 W along their beams, should fail near Sol.
TEST = dict(name='Test: an Earth twin', kinds='GK', world=dict(mass=1.0, hz_share=0.3, e=0.02),
            radio_since=120, emissions=[(90, 10, 2e11)], hum=1e5, character='ordinary')

if __name__ == '__main__':
    rows = load_hosts()
    report(rows)
    print()
    knocked_report(rows)
    print()
    veyra, hael, kesh = ROSTER[:3]
    at(veyra, rows, 'Del Pav')                           # v1's home, waking with Earth
    at(veyra, rows, 'Del Pav', waking=1990)              # fifty years before Earth
    at(veyra, rows, 'Eps Ind', waking=2090)              # a near K dwarf, fifty years after
    at(hael, rows, 'Bet Hyi', sol_targeted=False)        # v1's home, Sol not among its targets
    at(hael, rows, 'Bet Hyi')                            # Sol a target: its call would have reached Earth
    at(hael, rows, 'Bet Hyi', waking=2140)               # Sol a target, waking late: its call is still on the way
    at(kesh, rows, 'Eps Ind')                            # v1's home
