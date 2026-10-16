"""Draw one game from a seed number: Earth's branches to 2040, who is out there, where, when each wakes, what
each already knows of Earth, and the natural warm worlds at other stars. Run: python3 calcs/seed.py 7   (no number: one line for each of the first 40 seeds.
'stats': what 400 games look like.)

The rules are HOLOS_GAME_CONCEPT.md's: Year 0 and Earth's road to it, The neighbors, Stars Earth knocked on, How
neighbors play. Every placement passes calcs/neighbors.py. The same seed always gives the same game.
"""
import hashlib, math, random, sys
import branches, knocks, neighbors as nb, observing, reactions

Y0 = nb.EARTH_WAKES
# Earth's branches, odds read from Metaculus on 2026-10-10. Taiwan's three outcomes share one roll:
# invasion 26%, blockade alone 20%, neither 54%.
NUCLEAR, MARS, FUSION = 0.24, 0.15, 0.45
# Moves that send something Earth could catch. The opening must be silent: Earth heard nothing by Year 0. A signal
# that reached Earth before then was either one Earth would have caught, which never happened, or one it missed.
SENDS = ('knock', 'answer', 'call', 'gift', 'mask')
# How long a Mind takes to act on news comes from its Cautious or Bold dial: reactions.THINKS.

# ---------- What reaches Earth, and what Year 0's kit would catch of it ----------
# A neighbor's knock is taken to be like Earth's own. Cosmic Call sent about 150 kW from a 70 m dish at 5 GHz, about
# 1e12 W along the beam, for about four hours a star. Earth sent its knocks again a Year or so later, so a knock is
# sent twice. A call is a steady broadcast at 1% of an Earth-scale grid, a sample. Hael's Long Call is its own 10 GW.
# Year 0's sky watch is a drift scan: each direction north of -20 degrees, ten minutes a day. The all-sky watch, once
# built, sees every direction at every hour.
KNOCK_W, KNOCK_HOURS, AGAIN, CALL_W = 1e12, 4, 1.0, 2.4e11
def catches(p, i, seed):
    d, steady = p['d'], i['move'] in ('call', 'broadcast')
    watts = i.get('watts') or (CALL_W if steady else p['n']['awake'] if p['n'].get('awake_aimed') else KNOCK_W)
    rng = random.Random(f"{seed}:{p['name']}:{i['what']}")
    overlap = 1.0 if steady else (KNOCK_HOURS + 1 / 6) / 24
    sends = 1 if steady else i.get('sends', 2)
    loud = watts >= nb.floor_watts(12, 1, 600, d)
    i.update(watts=watts, steady=steady, north=p['host']['north'], loud=loud,
             kit0=p['host']['north'] and loud and any(rng.random() < overlap for _ in range(sends)),
             allsky=watts >= nb.floor_watts(12, 1, 86400 if steady else KNOCK_HOURS * 3600, d))

# ---------- What Earth's listening caught before Year 0 ----------
# A steady call lasts Years, so the searches that found nothing by 2040 would have found it. A knock lasts hours.
# Before the sky watch, finished in 2028, Earth's searches gave each star minutes in decades, so a knock was caught
# about one time in a hundred. From 2028 the drift scan sees each northern direction ten minutes a day.
SKYWATCH_FROM, BEFORE_IT, PATIENCE = 2028.0, 0.01, 1.0
def earth_caught(p, sent, steady, watts, rng):
    if steady: return True
    if sent + p['d'] < SKYWATCH_FROM: return rng.random() < BEFORE_IT
    return p['host']['north'] and watts >= nb.floor_watts(12, 1, 600, p['d']) and rng.random() < (KNOCK_HOURS + 1 / 6) / 24

def act(p, news, t, what, table, rng, depth=0):
    """Roll its move on this news at time t, and follow it. A move that sends reaches Earth d years later. If that
    is before Year 0, Earth either would have caught it, which the silent opening rules out, so the move is rolled
    again, or missed it. A sender whose knock goes unanswered gets that silence as news and may try again."""
    d = p['d']
    for _ in range(50):
        moves, odds = zip(*table[news])
        move = rng.choices(moves, weights=odds)[0]
        if move == 'strike': move = 'watch'       # gate: a first strike waits for a soft target and an unseen launch
        if move not in SENDS: return move
        steady = move == 'call'
        watts = CALL_W if steady else p['n']['awake'] if p['n'].get('awake_aimed') else KNOCK_W
        go = t + p['thinks']
        sends = [go] if steady else [go, go + AGAIN]
        early = [x for x in sends if x + d <= Y0]
        if any(earth_caught(p, x, steady, watts, rng) for x in early): continue      # Earth would have heard it: it never happened
        for x in early: p['unheard'].append(dict(what=what, move=move, sent=x, arrived=x + d))
        late = [x for x in sends if x + d > Y0]
        if late: p['inbound'].append(dict(what=what, move=move, sent=late[0], year=late[0] + d - Y0, sends=len(late)))
        elif depth < 4:                                                              # every send was missed: silence, then perhaps another try
            at = sends[-1] + 2 * d + PATIENCE                                        # there and back, and a Year of patience
            p['after_silence'] = dict(at=at, move=act(p, 'silence', at, what + ', tried again', table, rng, depth + 1))
        return move
    return 'watch'

# ---------- A neighbor's probe ----------
# Settled 2026-10-14: every probe is a rocket, v1's sentinel: 20 Years to build, a tenth of light speed. Its braking
# flame points at Sol, but a fusion flame is X-rays. A wide-field X-ray watch like Einstein Probe sees a drive of a
# terawatt only within about 3 AU, and Zubrin's own 60 TW ship within about 22: its last weeks (this project's
# arithmetic). No such watch is confirmed past about 2031, so Earth must build one.
# Set aside the same day, to keep the game simple: small dark sails that brake on the Sun's light. Physics allows
# them, but the Sun catches a sail only below 3.8% of light speed (Heller and Hippke 2017), so they take about 115
# Years from Alpha Centauri and almost never arrive in play.
# Settled 2026-10-14: where a probe ends its burn is set by its sender's Open or Hidden dial, as odds. One burns all
# the way in to watch from close, so an X-ray sky watch can see its last weeks. The other ends its burn past 100 AU,
# beyond any watch's reach, and watches from the outskirts, as v1's lurker did. The odds are samples.
# Settled 2026-10-15 with the fusion drive's price: speeding up and slowing down take time. A rocket at a hundredth of a
# gravity takes 9.7 Years to reach a tenth of light speed, over half a light-year, and as long to stop. Each costs
# about 5 Years over cruising that stretch, so a probe's trip is ROCKET_BURNS Years longer.
ROCKET_V, ROCKET_BUILD, ROCKET_BURNS = 0.1, 20, 10
BURN_IN = {'O2': 0.9, 'O1': 0.7, 'H1': 0.3, 'H2': 0.1}
def probe_trip(seed, p, t, what):
    launch = t + p['thinks'] + ROCKET_BUILD
    inward = keyed(seed, 'burn', p['name'], what) < BURN_IN[p['dials'].split()[0]]     # keyed, so no other draw moves
    # Settled 2026-10-15: its orders, rolled by its sender at launch (calcs/reactions.py orders). Keyed too.
    u, acc, order = keyed(seed, 'orders', p['name'], what), 0, None
    for order, odds in reactions.orders(p['name']):
        acc += odds
        if u < acc: break
    return dict(what=what, kind='rocket', bright=inward, ends='close' if inward else 'outskirts', orders=order, launch=launch,
                arrives=launch + p['d'] / ROCKET_V + ROCKET_BURNS, year=launch + p['d'] / ROCKET_V + ROCKET_BURNS - Y0)

# ---------- What an X-ray sky watch sees of a probe burning in ----------
# Proposed 2026-10-14, samples: a probe of 1,000 t braking at a hundredth of a gravity, exhaust 10,600 km/s as
# Daedalus's, so about 0.5 TW of jet. A tenth of that leaks as X-rays, as Zubrin 1995 assumed. 6% of a fusion flame's
# X-rays fall in Einstein Probe's band, whose limit is 2.6e-11 erg/s/cm2 in 1,000 s. A day's looks stacked reach about
# three times as far, as the fourth root of the time. The watch: Einstein Probe's class, 6 Years at standard pace, as it
# took from approval in 2018 to launch in 2024, and Swift 5.
PROBE_T, BRAKE_G, PROBE_VE, XRAY_SHARE = 1000, 0.01, 1.06e7, 0.1
WXT_BAND, WXT_LIMIT, XRAY_WATCH_YEARS = 0.06, 2.6e-11, 6
AU_M = 1.496e11
def xray_reach_au(stack_s=86400):
    a = BRAKE_G * 9.81
    xrays = XRAY_SHARE * 0.5 * PROBE_T * 1e3 * a * PROBE_VE                       # watts
    r_cm = math.sqrt(xrays * 1e7 * WXT_BAND / (4 * math.pi * WXT_LIMIT)) * (stack_s / 1000) ** 0.25
    return r_cm / 100 / AU_M
def xray_warning_days():
    """Days before a probe burning in stops that the X-ray watch first sees it: the time to brake from its reach."""
    return math.sqrt(2 * xray_reach_au() * AU_M / (BRAKE_G * 9.81)) / 86400

# ---------- Spreading ----------
# Settled 2026-10-14: neighbors may spread by the same physics and prices as Earth. The seed rolls whether a Mind
# sends colonies, weighted by its Expand or Deepen dial, and each colony, once it stands alone as a Mind, rolls again
# with its parent's dials. That is Landis's percolation (1998): some branches stop, and quiet pockets form.
# Samples, all of them: the odds; a first seed ship 40 Years after waking, as Earth's own launcher and a sentinel take;
# one more every 20 Years, to the nearest free star in the census; a tenth of light speed, v1's; and a colony standing
# alone 20 Years after it lands, as Metzger et al. 2013 bootstrap the Moon's industry. No colony goes to Sol, or to a
# star another neighbor holds. Targets come from the census to 100 ly, so a neighbor near 50 ly isn't pushed inward.
# Settled 2026-10-14: a colony ship brakes on a magnetic sail, a loop that drags on the gas between stars, with no
# fuel. Gros 2017's case: a 1,500 t craft, half of it a loop 1,600 km across, stops from a tenth of light speed in
# 0.37 ly and about 19 years, at 0.1 protons per cubic cm. The star's wind finishes the last 100 km/s. So a trip is
# BRAKE Years longer than its cruise. Corrected the same day: this said a Mind finishes on its rocket from 2% of light
# speed, from a case far smaller than Gros's.
# Settled 2026-10-14: every seed stands alone, so a seed ship weighs about 1,500 t: Freitas 1980's 443 t seed, Gros's
# sail, a shield and a frame. The pace above assumes a seed that grows faster than Freitas's: a sample.
# The sail's radio is born just above the gas's own cutoff, so the gas swallows it within a few thousand AU (Redfield
# and Falcon 2008, and this project's arithmetic). Zubrin 1995's range left that out. Earth never hears one brake.
CENSUS_PC = 100 / 3.2616
SPREAD = {'E2': 0.8, 'E1': 0.6, 'D1': 0.25, 'D2': 0.1}
# Settled 2026-10-15: a seed ship burns deuterium for 20 Years to reach a tenth of light speed, as Firefly's engine
# allows (calcs/early_game.py seed_ship). At half speed on average, the burn costs BURN Years over cruising. Hops under
# 1.4 ly never reach full speed, so they come out a little long. A sample.
FIRST_SHIP, EVERY, SHIP_V, BRAKE, BURN, STANDS, HORIZON = 40, 20, 0.1, 15, 10, 20, Y0 + 300
_CENSUS = []
def census():
    if not _CENSUS:
        import hosts
        st = hosts.stars(CENSUS_PC); hosts.name_from_hyg(st, CENSUS_PC); hosts.hipparcos(st)
        for x in st:
            ra, de, d = math.radians(x['ra']), math.radians(x['dec']), x['d_pc'] * 3.2616
            _CENSUS.append(dict(id=x['id'], name=x['name'], kind=x['kind'], d=d, xyz=(d * math.cos(de) * math.cos(ra), d * math.cos(de) * math.sin(ra), d * math.sin(de))))
    return _CENSUS
_CELLS = {}
def nearest(star, reach=20):
    """Census stars by distance from star: those within reach ly first, from a grid, then the rest, rarely needed."""
    if not _CELLS:
        for x in census(): _CELLS.setdefault(tuple(int(c // 10) for c in x['xyz']), []).append(x)
    cx, k = [int(c // 10) for c in star['xyz']], reach // 10 + 1
    near = [x for i in range(-k, k + 1) for j in range(-k, k + 1) for l in range(-k, k + 1) for x in _CELLS.get((cx[0] + i, cx[1] + j, cx[2] + l), ())]
    near = sorted((x for x in near if math.dist(x['xyz'], star['xyz']) <= reach), key=lambda x: math.dist(x['xyz'], star['xyz']))
    yield from near
    seen = {x['id'] for x in near}
    yield from (x for x in sorted(census(), key=lambda x: math.dist(x['xyz'], star['xyz'])) if x['id'] not in seen)
def spread(seed, neighbors):
    stars = {x['id']: x for x in census()}
    taken = {p['host']['id'] for p in neighbors}
    queue = [dict(name=p['name'], root=p['name'], star=stars[p['host']['id']], stands=p['waking'], dials=p['dials'], depth=0, p=p) for p in neighbors if not p['dead']]
    colonies = []
    while queue:
        m = queue.pop(0)
        if keyed(seed, 'spread', m['root'], m['star']['id']) >= SPREAD[m['dials'].split()[1]]: continue
        t = m['stands'] + FIRST_SHIP
        for x in nearest(m['star']):
            if t > HORIZON: break
            if x['id'] in taken: continue
            hop = math.dist(x['xyz'], m['star']['xyz'])
            if hop < 1: continue          # a companion within a light-year is home ground, like Proxima to Alpha Centauri A. Gaia's distance errors would also misdirect the hop
            taken.add(x['id'])
            # Settled 2026-10-14: Earth sees of a colony what physics gives. Its radio, once it stands alone, is its
            # parent Mind's toward Sol: a sample. Its ship's fusion X-rays fade past about a light-year (Zubrin 1995), and
            # its sail's radio dies in the gas, so Earth never sees it go or arrive. Its heat stays far under any
            # search's limit for centuries.
            n = m['p']['n']
            tone = n.get('awake', n['hum']) if m['p']['targeted'] or not n.get('awake_aimed') else n['hum']
            lands = t + hop / SHIP_V + BURN + BRAKE
            c = dict(root=m['root'], parent=m['name'], origin=m['star'], tone=tone, star=x, sent=t, lands=lands, stands=lands + STANDS, hop=hop, depth=m['depth'] + 1)
            colonies.append(c)
            if c['stands'] < HORIZON: queue.append(dict(name=f"{m['root']} {len(colonies)}", root=m['root'], star=x, stands=c['stands'], dials=m['dials'], depth=c['depth'], p=m['p']))
            t += EVERY
    return sorted(colonies, key=lambda c: c['lands'])

def keyed(*parts):
    """A number between 0 and 1 that depends only on its parts. Placement uses it with each star's id, so a star
    leaving the host list moves only a neighbor that lived there."""
    return (int.from_bytes(hashlib.blake2b(':'.join(map(str, parts)).encode(), digest_size=8).digest(), 'big') + 1) / (2 ** 64 + 2)

# ---------- Natural warm worlds ----------
# Settled 2026-10-13: the seed draws them at the real rate. NASA plans its telescope on 0.24 rocky worlds in each
# star's warm zone, 0.6 to 1.4 Earths wide, the same at every kind of star (Stark et al. 2019, from the SAG13 average
# of Kepler's counts: 0.08 to 0.70). Small ones are commoner, and so are wide orbits: per step of ln R as R^-0.19, per
# step of ln P as P^0.26. A world narrower than 0.8 / sqrt(a) Earths, a in Sun-twin AU, can't hold its air and is not
# counted. Orbits are circular. Rock's mass grows as R^3.7 (Zeng et al. 2016).
# A sample: at most one to a star, and none beside a neighbor's world.
ETA, R_MIN, R_MAX = 0.24, 0.6, 1.4
def power(u, lo, hi, k): return (lo ** k + u * (hi ** k - lo ** k)) ** (1 / k)
def warm_world(seed, host):
    """This star's natural warm world, or None. It passes the checks a neighbor's world does: a stable orbit, no
    transit seen from Sol, no tug in 2026 data. One draw, on the star's own stream, so no other star moves it."""
    if keyed(seed, 'natural', host['id']) >= ETA: return None
    rng = random.Random(f"{seed}:natural:{host['id']}")
    while True:
        x, radius = power(rng.random(), 0.95, 1.67, 0.39), power(rng.random(), R_MIN, R_MAX, -0.19)
        if radius >= 0.8 * x ** -0.5: break
    a, mass, pole = x * math.sqrt(host['luminosity']), radius ** 3.7, math.degrees(math.acos(rng.uniform(-1, 1)))
    fails, k = nb.orbit_fails(host, mass, a, 0, pole)
    w = dict(host=host, d=host['distance_ly'], a=a, radius=radius, mass=mass, pole=pole, tug=k, fails=fails,
             felt=k > nb.rv_2040(host), **sight(host, radius, a))
    return dict(w, **rung(seed, w))

# ---------- What lives on a natural world ----------
# Settled 2026-10-13: alive is a ladder, and a natural world climbs no higher than animals and forests. Its star's age
# sets the rung, on Earth's schedule with scatter. Whether it kept its air comes from physics. Sources are in
# HOLOS_RESEARCH.md, "Kinds of worlds".
# - Air. The cosmic shoreline (Zahnle and Catling 2017, as written by Pass et al. 2025): a world keeps its air when
#   4 log10(escape speed in km/s) - log10(lifetime dose of far ultraviolet and X-rays, Earth = 1) - 3.16 is above zero.
#   Mars sits on the line. The dose is L^0.4 / a^2, and 3.1 times that at a fully convective red dwarf, one fainter
#   than absolute G 10 (Pass et al. 2025). The line is broad (Ji et al. 2025), so each world has its own luck: 0.5 in
#   the log, a sample. Checked 2026-10-16: Nguyen et al. 2026 put this line between their nominal and volatile-poor
#   Sun-like cases, so it stays a middle case, and the luck stands for each world's unknown volatiles.
# - Life. Kipping 2025 gives 13 to 1 that life starts fast where conditions allow, and not how often they allow. Here
#   it started on 3 airy worlds in 4, and later died out on 1 in 5 of those: both samples.
# - Pace. Earth had lasting oxygen at 2.3 billion years old (Poulton et al. 2021), and air rich enough to read, with
#   animals and forests, at about 4.0 (Reinhard et al. 2017). Each world runs faster or slower by its own factor, 1.6
#   at one sigma: a sample. Settled 2026-10-15: Earth's pace is typical, with no hard steps, as Mills et al. 2025 argue.
#   Oxygen as a long shot would leave about 3 natural worlds with animals a game, fewer than its minds.
# - Age. A published age from asteroseismology or spin (Ware et al. 2026). Where none exists, drawn evenly from 1 to
#   10.5 billion years (Cukanovaite et al. 2023), and no more than the star's main-sequence life.
RUNGS = ('bare rock', 'airy and lifeless', 'hiding microbes', 'showing oxygen', 'with animals and forests', 'where life died')
ALIVE = RUNGS[2:5]
SHORE_LUCK, STARTED, DIED, PACE = 0.5, 0.75, 0.2, math.log(1.6)
OXYGEN_AT, RICH_AT, OLDEST = 2.3, 4.0, 10.5
def shoreline(host, radius, mass, a):
    """How far a world sits on the airy side of the cosmic shoreline, in the log. Negative: its air is probably gone."""
    dose = host['luminosity'] ** 0.4 / a ** 2 * (3.1 if host['kind'] == 'M' and host['gabs'] > 10 else 1)
    return 4 * math.log10(11.19 * math.sqrt(mass / radius)) - math.log10(dose) - 3.16
def rung(seed, w):
    """The truth of a natural world: its age, whether it kept its air, and how far its life has come."""
    host = w['host']; rng = random.Random(f"{seed}:rung:{host['id']}")
    u_age, luck, u_start, u_died, pace = rng.random(), rng.gauss(0, SHORE_LUCK), rng.random(), rng.random(), math.exp(rng.gauss(0, PACE))
    age = host['age'] or 1 + u_age * (min(OLDEST, max(2.0, 10 * host['luminosity'] ** -0.75)) - 1)
    shore = shoreline(host, w['radius'], w['mass'], w['a'])
    if shore + luck <= 0: r = RUNGS[0]
    elif u_start >= STARTED: r = RUNGS[1]
    elif u_died < DIED: r = RUNGS[5]
    else: r = RUNGS[2] if age < OXYGEN_AT * pace else RUNGS[3] if age < RICH_AT * pace else RUNGS[4]
    return dict(age=age, age_by=host['age_by'] or 'drawn', shore=shore, rung=r)

# The infrared telescope's search. Its first pass gives a star up to a day, a sample: enough to see an Earth twin of a
# Sun twin out to about 50 ly. A fainter world waits for a deeper pass.
PASS_H = 24
def first_pass(rows):
    """How many hosts the mirror can split at the middle of the warm zone, and the days one pass of them takes."""
    hours = [observing.observe(h['distance_ly'] / 3.2616, 1.0, 1.31 * math.sqrt(h['luminosity']), h['luminosity'])['seen_h'] for h in rows]
    return sum(t is not None for t in hours), sum(min(t, PASS_H) for t in hours if t is not None) / 24
def sight(host, radius, a):
    o = observing.observe(host['distance_ly'] / 3.2616, radius, a, host['luminosity'])
    return dict(sep=o['sep'], seen_h=o['seen_h'], split=o['seen_h'] is not None, swept=o['seen_h'] is not None and o['seen_h'] <= PASS_H)

def draw(seed, rows=None):
    rows = rows or nb.load_hosts()
    rng = random.Random(seed)
    r = rng.random()
    earth = dict(taiwan=next((k for k, p in (('invasion', 0.26), ('blockade', 0.46)) if r < p), None),
                 nuclear=rng.random() < NUCLEAR, mars=rng.random() < MARS, fusion=rng.random() < FUSION)
    # When each branch happened, and what a Taiwan branch left of Earth's compute (calcs/branches.py). Fabs either
    # catch up to the old trend or the whole curve slides back: an even roll, until better evidence.
    earth['years'] = dict(taiwan=rng.randint(2027, 2034), nuclear=rng.randint(2027, 2034), mars=rng.randint(2033, 2035), fusion=rng.randint(2037, 2039))
    catch_up = rng.random() < 0.5
    earth['compute'] = 1.0 if not earth['taiwan'] else branches.stock_2040(
        earth['years']['taiwan'], outage=4 if earth['taiwan'] == 'invasion' else 1, catch_up=catch_up) / branches.stock_2040()
    count = min(len(nb.ROSTER), round(3 * 10 ** rng.random()))          # evenly in tenfold steps, 3 to 30
    picks = rng.sample(nb.ROSTER, count)
    if not any(n['disposition'] == 'hunter' for n in picks):            # a struck world needs a hunter in the game
        spare = [n for n in nb.ROSTER if n not in picks and not n.get('struck') and n['disposition'] != 'hunter']
        picks = [rng.choice(spare) if n.get('struck') else n for n in picks]
    by_name = {h['name']: h for h in rows}
    knocked = {by_name[v]['id']: k for k, v in nb.KNOCKED.items()}
    nudge = rng.random() < nb.KNOCKED_SHARE
    used, out = set(), []

    def place(n, pool):
        # Stars in a weighted random order, heavier ones sooner, that depends only on the seed, the neighbor and
        # each star's id. Then a few tries at each star, on that star's own stream.
        order = sorted(pool, key=lambda h: math.log(keyed(seed, n['name'], h['id'])) / float(h['weight']), reverse=True)
        for host in order[:100]:
            if host['id'] in used: continue
            rng = random.Random(f"{seed}:{n['name']}:{host['id']}")
            for _ in range(3):
                waking = Y0 + 100 * (rng.random() - rng.random())           # a century either way, most near Earth's
                if n.get('dies') is not None and waking - n['dies'] > Y0: continue   # the dead died before Year 0
                pole = math.degrees(math.acos(rng.uniform(-1, 1)))
                targeted = rng.random() < n.get('aims_at_sol', 1)
                fails, info = nb.check(n, host, waking, pole, targeted)
                if not fails: return dict(n=n, host=host, waking=waking, pole=pole, targeted=targeted, **info)

    for n in picks:
        fits = [h for h in rows if h['kind'] in n.get('kinds', 'FGKM') and h['luminosity'] >= n.get('min_lum', 0)]
        p = None
        if nudge:                                                        # one neighbor goes where Earth knocked
            p = place(n, [h for h in fits if h['id'] in knocked]) if any(h['id'] in knocked for h in fits) else None
            nudge = p is None
        p = p or place(n, fits)
        if not p: continue
        used.add(p['host']['id'])
        d, w, dead = p['host']['distance_ly'], p['waking'], n.get('dies') is not None
        p.update(name=n['name'], d=d, dead=dead, died=w - n['dies'] if dead else None,
                 dials=reactions.CHARACTER[n['name']][0], style=reactions.CHARACTER[n['name']][1], thinks=reactions.thinks(n['name']))
        # What it does is rolled on its own stream, so a change to these rules never moves where anyone lives.
        acts = random.Random(f"{seed}:{n['name']}:acts")
        p['heard'] = (not dead) and acts.random() < p['heard']
        p['heard_since'] = max(1950 + d, w - n.get('arrays_since', 60)) if p['heard'] else None
        table = reactions.table(n['name'])
        # It acts on what it knows once its Mind is awake. What is on its way to Earth goes in inbound. What reached
        # Earth before Year 0 and was missed goes in unheard.
        p['knows'] = max(w, p['heard_since']) if p['heard'] else None
        p['inbound'], p['unheard'], p['caught'], p['after_silence'] = [], [], [], None
        p['on_hum'] = act(p, 'hum', p['knows'], 'its answer to Earth’s radars', table, acts) if p['heard'] else None
        for msg, sent, target, ly in knocks.KNOCKS:
            if knocked.get(p['host']['id']) != target: continue
            arrives = sent + d
            if not dead and acts.random() < nb.caught_odds(n, p['host'], w, arrives):   # a dead world has no reactions written
                t = max(w, arrives)
                p['caught'].append(dict(msg=msg, arrives=arrives, acts=t, move=act(p, 'knock', t, f'its answer to {msg}', table, acts)))
        for start, end, watts, *how in n['emissions'] if dead else []:   # a dead world's last broadcast
            if end == n['dies']: p['inbound'].append(dict(what='its last broadcast', move='broadcast', sent=w - start, year=w - start + d - Y0, watts=watts))
        for i in p['inbound']: catches(p, i, seed)
        # Probes it rolled, and when each reaches Sol. Pure arithmetic on moves already rolled, so no draw moves.
        p['probes'] = [probe_trip(seed, p, t, what) for t, move, what in
                       ([(p['knows'], p['on_hum'], 'its answer to Earth’s radars')] if p['heard'] else [])
                       + ([(p['after_silence']['at'], p['after_silence']['move'], 'after silence')] if p['after_silence'] else [])
                       + [(c['acts'], c['move'], f"its answer to {c['msg']}") for c in p['caught']] if move == 'probe']
        out.append(p)
    for p in out: p.update(sight(p['host'], p['n']['world']['mass'] ** (1 / 3.7), p['a']))
    drawn = [w for w in (warm_world(seed, h) for h in rows if h['id'] not in used) if w]
    worlds = sorted((w for w in drawn if not w['fails']), key=lambda w: w['d'])
    # Earth's finds at Year 0: every world whose tug shows by 2040, a neighbor's or a natural one. If the draw gives
    # none, the seed adds a natural world at a Terra Hunting star, so the opening always has a find.
    found, felt = [p for p in out if p['found_by_2040']], [w for w in worlds if w['felt']]
    natural = None
    if not found and not felt:
        taken = used | {w['host']['id'] for w in drawn}
        pool = [h for h in rows if h['north'] and h['kind'] in 'GK' and h['luminosity'] > 0.3 and h['id'] not in taken and not h['planets']
                and not h['name'].startswith('Gaia ')]                      # the planet hunters' stars are bright, so they have names
        natural = max(pool, key=lambda h: keyed(seed, 'find', h['id']))
    colonies = spread(seed, out)                                        # keyed draws only, so nothing above moves
    return dict(seed=seed, earth=earth, count=count, neighbors=sorted(out, key=lambda p: p['d']), found=found, natural=natural, colonies=colonies,
                worlds=worlds, felt=felt, ruled_out=[w for w in drawn if w['fails']])

def year(t): return f"Year {t - Y0:.1f}" if t >= Y0 else f'{t:.0f}'

def report(g):
    e = g['earth']
    print(f"Seed {g['seed']}. Earth: Taiwan {e['taiwan'] or 'neither'}, nuclear use {'yes' if e['nuclear'] else 'no'}, "
          f"Mars {'yes' if e['mars'] else 'no'}, fusion on the grid {'yes' if e['fusion'] else 'no'}, compute {e['compute']:.0%}. {len(g['neighbors'])} neighbors.")
    for p in g['neighbors']:
        n = p['n']
        state = (f"died {p['died']:.0f}" if p['dead'] else f"awake since {p['waking']:.0f}" if p['waking'] < Y0 else f"wakes Year {p['waking'] - Y0:.1f}")
        knows = (f"heard Earth from {p['heard_since']:.0f}, then: {p['on_hum']}" if p['heard'] else 'has not heard Earth')
        print(f"  {p['name']:7} {n['disposition']:9} {p['host']['name']:22} {p['host']['kind']} {p['d']:5.1f} ly  {state:18} {p['dials']}  {knows}"
              + ''.join(f". Caught {c['msg']} in {c['arrives']:.0f}, then: {c['move']}" for c in p['caught'])
              + (f". Tug {p['tug']:.2f} m/s: Earth found its world" if p['found_by_2040'] else ''))
        if p['after_silence']: print(f"          unanswered by {year(p['after_silence']['at'])}, it will: {p['after_silence']['move']}")
        for u in p['unheard']: print(f"          unheard: {u['what']} ({u['move']}), sent {u['sent']:.0f}, reached Earth in {u['arrived']:.0f}. No one was listening.")
        for i in p['inbound']: print(f"          on its way: {i['what']} ({i['move']}), sent {year(i['sent'])}, arrives Year {i['year']:.1f}. "
                                     f"Year 0's sky watch {'catches' if i['kit0'] else 'misses'} it, the all-sky watch {'catches' if i['allsky'] else 'misses'} it.")
    if g['natural']: print(f"  Seeded find: a natural world at {g['natural']['name']}, {g['natural']['distance_ly']:.1f} ly.")
    w = g['worlds']; first = [x for x in w if x['swept'] and not x['felt']]
    print(f"  Natural warm worlds: {len(w)}, {sum(x['host']['kind'] == 'M' for x in w)} of them at red dwarfs. {len(g['ruled_out'])} more drawn and ruled out by what Earth already knows.")
    print('  Felt by Year 0: ' + (', '.join(f"{x['host']['name']} ({x['d']:.1f} ly, {x['tug']:.2f} m/s)" for x in g['felt']) or 'none') + '.')
    print(f"  The telescope can split {sum(x['split'] for x in w)} from their stars. Its first pass sees {len(first)} not felt before: "
          + ', '.join(f"{x['host']['name']} ({x['d']:.1f} ly, {x['radius']:.2f} Earths wide)" for x in first) + '.')
    for x in first: print(f"    {x['host']['name']:22} {x['host']['kind']} {x['d']:5.1f} ly  {x['age']:4.1f} Gyr ({x['age_by']})  shoreline {x['shore']:+.2f}  {x['rung']}")
    print('  All natural worlds: ' + ', '.join(f"{sum(x['rung'] == r for x in w)} {r}" for r in RUNGS) + '.')
    homes = [p for p in g['neighbors'] if p['swept']]
    print(f"  The same pass sees {len(homes)} neighbors' worlds: " + ', '.join(f"{p['name']} at {p['host']['name']}" for p in homes) + '.')

def stats(rows, n=400):
    """What many draws look like: how many neighbors, and how often Earth's first hour holds something."""
    counts, knocked, caught, in15, in60, hunter, find = [], 0, 0, 0, 0, 0, 0
    warm, felt, finds, split, first, homes, points = [], [], [], [], [], [], []
    rungs, seen_rungs, sun_rungs = {r: 0 for r in RUNGS}, {r: 0 for r in RUNGS}, {r: 0 for r in RUNGS}
    for s in range(1, n + 1):
        g = draw(s, rows); ns = g['neighbors']
        arr = [i['year'] for p in ns for i in p['inbound'] if i['year'] > 0]
        counts.append(len(ns)); knocked += any(p['host']['name'] in nb.KNOCKED.values() for p in ns); caught += any(p['caught'] for p in ns)
        in15 += any(y < 3 for y in arr); in60 += any(y < 12 for y in arr)
        hunter += any(p['n']['disposition'] == 'hunter' for p in ns); find += bool(g['found'])
        w = g['worlds']; warm.append(len(w)); felt.append(len(g['felt'])); finds.append(len(g['found']) + len(g['felt']))
        split.append(sum(x['split'] for x in w)); first.append(sum(x['swept'] and not x['felt'] for x in w)); homes.append(sum(p['swept'] for p in ns))
        points.append(sum(x['swept'] for x in w) + homes[-1])
        for x in w:
            rungs[x['rung']] += 1; seen_rungs[x['rung']] += x['swept']; sun_rungs[x['rung']] += x['host']['kind'] != 'M'
    # Quieting Earth's radars: a neighbor that wakes after the last radar light has passed it never finds them.
    living = heard = 0; spared = {3: 0, 30: 0}
    for s in range(1, n + 1):
        for p in draw(s, rows)['neighbors']:
            if p['dead']: continue
            living += 1; heard += p['heard']
            for cut in spared: spared[cut] += (not p['heard']) and p['waking'] > Y0 + cut + p['d']
    # What Earth's ears catch of the signals that arrive in the first hour
    early = [i for s in range(1, n + 1) for p in draw(s, rows)['neighbors'] for i in p['inbound'] if 0 < i['year'] < 12]
    median = sorted(counts)[n // 2]
    print(f"The lowest seed with the median count, for the mocks: {counts.index(median) + 1}.")
    print(f"{n} games. Neighbors: median {median}, from {min(counts)} to {max(counts)}. A hunter in {hunter / n:.0%}. "
          f"Someone at a knocked star in {knocked / n:.0%}, a knock caught in {caught / n:.0%}. Earth's seeded find is a neighbor's world in {find / n:.0%}. "
          f"A neighbor's signal reaches Earth in the first 15 minutes in {in15 / n:.1%}, in the first hour in {in60 / n:.0%}: an answer to Earth's radars or knocks, or a dead world's last broadcast.")
    print(f"Earth's radars: {heard / living:.0%} of living neighbors heard them by Year 0. If the last sweep leaves by Year 3, {spared[3] / living:.0%} "
          f"wake after it has passed them, about 1 in {living / spared[3]:.0f}. By Year 30, {spared[30] / living:.0%}, about 1 in {living / spared[30]:.0f}.")
    unheard = [sum(len(p['unheard']) for p in draw(s, rows)['neighbors']) for s in range(1, n + 1)]
    print(f"Before Year 0: in {sum(u > 0 for u in unheard) / n:.0%} of games at least one knock reached Earth unheard. {sum(unheard) / n:.1f} a game on average.")
    mid = lambda v: f"median {sorted(v)[n // 2]}, from {min(v)} to {max(v)}"
    print(f"Natural warm worlds a game: {mid(warm)}. Felt by Year 0: {mid(felt)}. Earth's finds at Year 0, with neighbors' worlds: {mid(finds)}. "
          f"None in {sum(f == 0 for f in finds) / n:.1%}, where the seed adds one.")
    print(f"Natural worlds the infrared telescope can split from their stars: {mid(split)}. Seen on its first pass and not felt before: {mid(first)}. "
          f"Neighbors' worlds seen on that pass: {mid(homes)}. The pass shows {sum(points) / n:.0f} points of light on average, and about 1 in {sum(points) / sum(homes):.0f} is a home.")
    share = lambda d: ', '.join(f"{r} {d[r] / sum(d.values()):.0%}" for r in RUNGS)
    print(f"What natural worlds are: {share(rungs)}. At Sun-like stars: {share(sun_rungs)}. Among those the first pass sees: {share(seen_rungs)}.")
    print(f"Living natural worlds a game: {sum(rungs[r] for r in ALIVE) / n:.0f} of {sum(rungs.values()) / n:.0f}. Among those the first pass sees: "
          f"{sum(seen_rungs[r] for r in ALIVE) / n:.1f} of {sum(seen_rungs.values()) / n:.1f}, and {seen_rungs[RUNGS[3]] / n + seen_rungs[RUNGS[4]] / n:.1f} show oxygen.")
    k = len(early)
    print(f"Earth's ears: of {k} signals arriving in the first hour, Year 0's sky watch catches {sum(i['kit0'] for i in early) / k:.0%}. "
          f"{sum(not i['north'] for i in early) / k:.0%} come from its blind southern sky, and {sum(i['north'] and not i['loud'] for i in early) / k:.0%} are too faint for it. "
          f"The all-sky watch would catch {sum(i['allsky'] for i in early) / k:.0%}.")

if __name__ == '__main__':
    rows = nb.load_hosts()
    if sys.argv[1:] == ['stats']: stats(rows)
    elif len(sys.argv) > 1: report(draw(int(sys.argv[1]), rows))
    else:
        for s in range(1, 41):
            g = draw(s, rows); ns = g['neighbors']
            first = min((i['year'] for p in ns for i in p['inbound'] if i['year'] > 0), default=None)
            print(f"{s:3}: {len(ns):2} neighbors, {sum(p['heard'] for p in ns):2} heard Earth, {sum(p['waking'] > Y0 and not p['dead'] for p in ns):2} wake later, "
                  f"hunters {sum(p['n']['disposition'] == 'hunter' for p in ns)}, dead {sum(p['dead'] for p in ns)}, "
                  f"at a knocked star {sum(1 for p in ns if p['caught'] or p['host']['name'] in nb.KNOCKED.values())}, caught {sum(len(p['caught']) for p in ns)}, "
                  f"found {len(g['found'])}, first arrival {'none' if first is None else f'Year {first:.1f}'}, nearest {ns[0]['d']:.1f} ly")
