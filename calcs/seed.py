"""Draw one game from a seed number: Earth's branches to 2040, who is out there, where, when each wakes, and what
each already knows of Earth. Run: python3 calcs/seed.py 7   (no number: one line for each of the first 40 seeds.
'stats': what 400 games look like.)

The rules are HOLOS_GAME_CONCEPT.md's: Year 0 and Earth's road to it, The neighbors, Stars Earth knocked on, How
neighbors play. Every placement passes calcs/neighbors.py. The same seed always gives the same game.
"""
import math, random, sys
import branches, knocks, neighbors as nb, reactions

Y0 = nb.EARTH_WAKES
# Earth's branches, odds read from Metaculus on 2026-10-10. Taiwan's three outcomes share one roll:
# invasion 26%, blockade alone 20%, neither 54%.
NUCLEAR, MARS, FUSION = 0.24, 0.15, 0.45
# Moves that send something Earth could catch. The opening must be silent: Earth heard nothing by Year 0. A signal
# that reached Earth before then was either one Earth would have caught, which never happened, or one it missed.
SENDS = ('knock', 'answer', 'call', 'gift', 'mask')
THINKS = 0.5        # Years a Mind takes to act on news: a sample, until life scripts set it

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
        sends = [t + THINKS] if steady else [t + THINKS, t + THINKS + AGAIN]
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
        for _ in range(300):
            host = rng.choices(pool, weights=[float(h['weight']) for h in pool])[0]
            if host['id'] in used: continue
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
                 dials=reactions.CHARACTER[n['name']][0], style=reactions.CHARACTER[n['name']][1])
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
            if acts.random() < nb.caught_odds(n, p['host'], w, arrives):
                t = max(w, arrives)
                p['caught'].append(dict(msg=msg, arrives=arrives, acts=t, move=act(p, 'knock', t, f'its answer to {msg}', table, acts)))
        for start, end, watts, *how in n['emissions'] if dead else []:   # a dead world's last broadcast
            if end == n['dies']: p['inbound'].append(dict(what='its last broadcast', move='broadcast', sent=w - start, year=w - start + d - Y0, watts=watts))
        for i in p['inbound']: catches(p, i, seed)
        out.append(p)
    # Earth's seeded find: a neighbor's world if one tugs hard enough, else a natural world at a Terra Hunting star.
    found = [p for p in out if p['found_by_2040']]
    natural = None
    if not found:
        pool = [h for h in rows if h['north'] and h['kind'] in 'GK' and h['luminosity'] > 0.3 and h['id'] not in used and not h['planets']
                and not h['name'].startswith('Gaia ')]                      # the planet hunters' stars are bright, so they have names
        natural = rng.choice(pool)
    return dict(seed=seed, earth=earth, count=count, neighbors=sorted(out, key=lambda p: p['d']), found=found, natural=natural)

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

def stats(rows, n=400):
    """What many draws look like: how many neighbors, and how often Earth's first hour holds something."""
    counts, knocked, caught, in15, in60, hunter, find = [], 0, 0, 0, 0, 0, 0
    for s in range(1, n + 1):
        g = draw(s, rows); ns = g['neighbors']
        arr = [i['year'] for p in ns for i in p['inbound'] if i['year'] > 0]
        counts.append(len(ns)); knocked += any(p['host']['name'] in nb.KNOCKED.values() for p in ns); caught += any(p['caught'] for p in ns)
        in15 += any(y < 3 for y in arr); in60 += any(y < 12 for y in arr)
        hunter += any(p['n']['disposition'] == 'hunter' for p in ns); find += bool(g['found'])
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
