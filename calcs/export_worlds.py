"""Each seed's world as a data file the game's server reads. Run: python3 calcs/export_worlds.py

Settled 2026-10-16: the game ships a pool of drawn worlds, not a port of the draw. Python draws one in about a
second, and the game loads one when a game begins. The files hold the seed's truth, so only the game's server reads
them, and the Mind is told only what Earth knows (game/lib/sim/knowledge.ts).

Writes game/data/worlds/<seed>.json.gz, game/data/reactions.json, game/data/works.json, game/lib/sim/pool.ts, and the golden checks in
game/lib/sim/golden.json that the TypeScript port is tested against. Times are game Years, Year 0 = 2040.
"""
import gzip, json, math, random, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'calcs'))
import neighbors as nb, reactions, seed as S

GAME = ROOT / 'game'
POOL = list(range(1, 33)) + [62]          # the mocks' seeds 10, 11 and 62 among them
Y0 = S.Y0

def r4(x): return round(x, 4) if isinstance(x, float) else x
def yr(t): return None if t is None else round(t - Y0, 4)

def pretty(name):
    """The mocks' display names, from explorations/v2-mocks/kit.py, without its draw."""
    sys.argv = ['kit', '10']; sys.path.insert(0, str(ROOT / 'explorations' / 'v2-mocks'))
    import kit
    return kit.pretty(name)

def star(h, stars):
    if h['id'] not in stars:
        stars[h['id']] = dict(name=h['name'], shown=pretty(h['name']), kind=h['kind'], d=r4(h['distance_ly']), lum=r4(h['luminosity']),
                              north=h['north'], hz=[r4(h['hz_in']), r4(h['hz_out'])], age=r4(h['age']))
    return h['id']

def neighbor(p, stars):
    n = p['n']
    return dict(
        name=p['name'], star=star(p['host'], stars), d=r4(p['d']), dead=p['dead'], waking=yr(p['waking']),
        disposition=n['disposition'], dials=p['dials'], style=p['style'], thinks=p['thinks'],
        heard=p['heard'], heardSince=yr(p['heard_since']), onHum=p['on_hum'],
        world=dict(mass=r4(n['world']['mass']), a=r4(p['a']), pole=r4(p['pole']), tug=r4(p['tug'])),
        foundBy2040=p['found_by_2040'], swept=p['swept'], split=p['split'], sep=r4(p['sep']), seenH=r4(p['seen_h']),
        radio=dict(since=n['radio_since'], arraysSince=n.get('arrays_since'), hum=n['hum'], awake=n.get('awake'), dies=n.get('dies'),
                   emissions=[[r4(x) for x in e] for e in n['emissions']]),
        inbound=[dict(what=i['what'], move=i['move'], sent=yr(i['sent']), year=r4(i['year']), sends=i.get('sends', 1), watts=i.get('watts'),
                      kit0=i.get('kit0'), allsky=i.get('allsky')) for i in p['inbound']],
        unheard=[dict(what=u['what'], move=u['move'], sent=yr(u['sent']), arrived=yr(u['arrived'])) for u in p['unheard']],
        caught=[dict(msg=c['msg'], arrives=yr(c['arrives']), acts=yr(c['acts']), move=c['move']) for c in p['caught']],
        afterSilence=dict(at=yr(p['after_silence']['at']), move=p['after_silence']['move']) if p['after_silence'] else None,
        probes=[{k: r4(v) for k, v in q.items()} for q in p['probes']])

def world(w, stars):
    return dict(star=star(w['host'], stars), d=r4(w['d']), a=r4(w['a']), radius=r4(w['radius']), mass=r4(w['mass']), pole=r4(w['pole']),
                tug=r4(w['tug']), felt=w['felt'], swept=w['swept'], split=w['split'], sep=r4(w['sep']), seenH=r4(w['seen_h']),
                rung=w['rung'], age=r4(w['age']), ageBy=w['age_by'], thaw=r4(w['thaw']))

def find(src, stars):
    """One of Earth's finds at Year 0, as the mocks' kit.find_of makes it: what the planet hunters measured, and apart
    from it the truth. A neighbor's world, a natural one, or the find the seed adds when the draw gives none."""
    if src is None: return None
    if 'n' in src:
        h, mass, a, pole, truth = src['host'], src['n']['world']['mass'], src['a'], src['pole'], dict(kind='dead' if src['dead'] else 'home', who=src['name'])
        msini = mass * math.sin(math.radians(pole))
    elif 'rung' in src:
        h, mass, a, pole, truth = src['host'], src['mass'], src['a'], src['pole'], dict(kind='natural', rung=src['rung'])
        msini = mass * math.sin(math.radians(pole))
    else:                                                                   # the seeded find: a world just over the floor
        h = src; a = h['hz_in'] + 0.4 * (h['hz_out'] - h['hz_in'])
        msini = 1.5 * nb.rv_2040(h) / nb.tug(1, a, nb.star_mass(h['luminosity']), 1); mass = msini / 0.87
        truth = dict(kind='natural', rung=S.rung(SEED_NOW[0], dict(host=h, radius=mass ** (1 / 3.7), mass=mass, a=a))['rung'])
    north = h['north'] and h['kind'] in 'GK'
    return dict(star=star(h, stars), d=r4(h['distance_ly']), msini=r4(msini), a=r4(a),
                periodDays=r4(math.sqrt(a ** 3 / nb.star_mass(h['luminosity'])) * 365.25),
                by='Terra Hunting' if north else 'ESPRESSO', year=(2036 if north else 2034) - Y0, truth=truth)
SEED_NOW = [0]

def export(seed, rows):
    g = S.draw(seed, rows); stars = {}; SEED_NOW[0] = seed
    out = dict(v=1, seed=seed, earth=g['earth'], neighbors=[neighbor(p, stars) for p in g['neighbors']],
               worlds=[world(w, stars) for w in g['worlds']],
               colonies=[dict(root=c['root'], parent=c['parent'], star=star(c['star'], stars) if 'distance_ly' in c['star'] else c['star']['id'],
                              sent=yr(c['sent']), lands=yr(c['lands']), stands=yr(c['stands']), hop=r4(c['hop']), depth=c['depth'], tone=c['tone'])
                         for c in g['colonies']],
               natural=star(g['natural'], stars) if g['natural'] else None,
               finds=sorted((find(x, stars) for x in g['found'] + g['felt'] + ([g['natural']] if g['natural'] else [])), key=lambda f: f['d']))
    for c, src in zip(out['colonies'], g['colonies']):                     # a colony's star may not be a host
        if c['star'] not in stars: stars[c['star']] = dict(name=src['star']['name'], shown=pretty(src['star']['name']), kind=src['star']['kind'], d=r4(src['star']['d']))
    out['stars'] = stars
    return out

def golden():
    """What the TypeScript port must reproduce: CPython's generator, and the rolls the mocks rely on."""
    seqs = {str(k): (lambda rng: [rng.random() for _ in range(5)])(random.Random(k)) for k in (0, 1, 10, 42, 2 ** 40 + 7, 'abc', '10:Ombe:silence')}
    choose = {}
    for key in ('10:Ombe:silence', '10:Hael:silence', '10:Ombe:reply', '10:Ree:reply', '11:Hael:reply'):
        name, news = key.split(':')[1:]
        t = reactions.table(name)
        choose[key] = random.Random(key).choices(*zip(*t[news]))[0]
    import observing
    cases = [(10.0, 1.0, 1.0, 1.0), (4.32 / 3.2616, 0.97, 1.447, 1.52), (19.7 / 3.2616, 2.0, 1.354, 0.66), (31.18 / 3.2616, 1.5, 0.702, 0.362),
             (4.32 / 3.2616, 1.0, 0.60, 0.5), (12.9 / 3.2616, 1.2, 0.15, 0.0124)]
    seen = [dict(args=c, out={k: 'inf' if v == math.inf else v for k, v in observing.observe(*c).items()}) for c in cases]   # JSON has no infinity
    return dict(random=seqs, rolls=choose, observe=seen, works=works_golden())

# ---------- Works and their pacing ----------
# calcs/early_game.py paces the mocks in two loops, each for one fixed order: first_hour() to Year 12, then replay().
# The game runs one loop for any order (game/lib/sim/works.ts). Its numbers come from here, so they have one source.
import early_game as eg
FH = {w: years for w, _, years in eg.FIRST_HOUR}
ORBIT = ('Infrared telescope', 'Probe yard', 'A 15 m mirror', 'Orbital foundry', 'Seed ship')    # the yard's cut, as the mocks apply it

def works_catalog():
    R = eg.ROADS
    years = dict(FH, **{'Ground solar': 10, 'A 15 m mirror': R['mirror'], 'Mass driver': R['driver'], 'Orbital foundry': R['foundry'],
                        'Belt mining': R['prospect'] + R['mining'], 'Far-side array, one fifth': R['far_side'] / eg.FIFTHS_TOTAL,
                        'Fusion drive': R['fusion_drive'], 'Seed ship': R['seed_ship'], 'Deuterium works': eg.D_WORKS_YEARS})
    works = {w: dict(years=y, want=eg.WANTS[w][0]) for w, y in years.items()}
    for w in ORBIT: works[w]['orbit'] = True
    works['Belt mining']['milestone'] = ['Belt prospecting', R['mining']]          # prospecting is done when mining's Years are all that is left
    works['Mass driver']['then'] = ['Far-side array, one fifth', 'Power from orbit']
    works['Far-side array, one fifth']['copies'] = [eg.FIFTHS_TOTAL, 'Far-side array, fifth']
    works['Power from orbit'] = dict(want=eg.WANTS['Power from orbit'][0], rock=eg.ORBIT_POWER_MT * 1000, most=1)
    return dict(works=works, floor=eg.FLOOR, push=eg.PUSH, flagship=eg.FLAGSHIP_THOUGHT, gridRoom=eg.GRID_ROOM, step=1.5,
                dataCenter=dict(years=1, aside=0.05), studies=0.1, yard=dict(work='Orbital yard', cut=0.25),
                rock={'Mass driver': eg.DRIVER_KT, 'Belt mining': eg.MINING_KT})

def mock_orders(order=eg.BY_START, extra=(), front=()):
    """The mocks' game as the player's orders: the first hour's builds as begun, the long roads at Year 12 in `order`."""
    o = [dict(y=0, begin='Data center'), dict(y=1.1, standing='Data center')] + [dict(y=t, begin=w) for w, t, _ in eg.FIRST_HOUR]
    o += [dict(y=12.0, begin=w) for w in eg.BY_START if w not in FH]
    if order != eg.BY_START: o += [dict(y=12.0, first=w) for w in reversed(order)]
    for y, w, _ in sorted(extra):
        o.append(dict(y=y, begin=w))
        if w in front: o.append(dict(y=y, first=w))
    return o

def works_golden():
    """Each mock game's dates, from early_game's two loops, for the one loop to match."""
    aside = [list(a) for a in eg.SET_ASIDE_BASE[1:]]                                # the mock's observations. Studies and data centers are the loop's own
    out = []
    for name, scale, order, extra, front in (('in the order begun', 1.0, eg.BY_START, (), ()), ('matter first', 1.0, eg.MATTER_FIRST, (), ()),
                                             ('two thirds the compute', 2 / 3, eg.BY_START, (), ())):
        done = dict(eg.first_hour(show=False, scale=scale)[0], **eg.replay(order, show=False, scale=scale))
        done.pop('spare')
        out.append(dict(name=name, scale=scale, orders=mock_orders(order), aside=aside, done=done))
    y = round(eg.replay(eg.BY_START, show=False)['Ground solar'] + 0.2, 1)
    extra = [(y, 'Fusion drive', eg.ROADS['fusion_drive']), (y, 'Seed ship', eg.ROADS['seed_ship'] * 0.75), (y, 'Deuterium works', eg.D_WORKS_YEARS)]
    done = dict(eg.first_hour(show=False)[0], **eg.replay(eg.BY_START, show=False, extra=extra, front=('Fusion drive',)))
    done.pop('spare')
    out.append(dict(name='a seed ship, its drive first', scale=1.0, orders=mock_orders(extra=extra, front=('Fusion drive',)), aside=aside, done=done))
    return out

if __name__ == '__main__':
    rows = nb.load_hosts()
    (GAME / 'data' / 'worlds').mkdir(parents=True, exist_ok=True)
    for s in POOL:
        data = json.dumps(export(s, rows), separators=(',', ':')).encode()
        (GAME / 'data' / 'worlds' / f'{s}.json.gz').write_bytes(gzip.compress(data, mtime=0))
    tables = {n['name']: reactions.table(n['name']) for n in nb.ROSTER if reactions.table(n['name'])}
    (GAME / 'data' / 'reactions.json').write_text(json.dumps(dict(tables=tables, moves=reactions.MOVES), indent=1))
    (GAME / 'data' / 'works.json').write_text(json.dumps(works_catalog(), indent=1))
    (GAME / 'lib' / 'sim' / 'pool.ts').write_text('// Written by calcs/export_worlds.py. The seeds a new game may draw.\n'
                                                  f'export const POOL: readonly number[] = {json.dumps(POOL)};\n')
    (GAME / 'lib' / 'sim' / 'golden.json').write_text(json.dumps(golden(), indent=1))
    size = sum(f.stat().st_size for f in (GAME / 'data' / 'worlds').glob('*.json.gz'))
    print(f'{len(POOL)} worlds, {size / 1024:.0f} KB in all, {len(tables)} reaction tables.')
