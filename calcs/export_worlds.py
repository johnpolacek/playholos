"""Each seed's world as a data file the game's server reads. Run: python3 calcs/export_worlds.py

Settled 2026-10-16: the game ships a pool of drawn worlds, not a port of the draw. Python draws one in about a
second, and the game loads one when a game begins. The files hold the seed's truth, so only the game's server reads
them, and the Mind is told only what Earth knows (game/lib/sim/knowledge.ts).

Writes game/data/worlds/<seed>.json.gz, game/data/reactions.json, game/lib/sim/pool.ts, and the golden checks in
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
    return dict(random=seqs, rolls=choose)

if __name__ == '__main__':
    rows = nb.load_hosts()
    (GAME / 'data' / 'worlds').mkdir(parents=True, exist_ok=True)
    for s in POOL:
        data = json.dumps(export(s, rows), separators=(',', ':')).encode()
        (GAME / 'data' / 'worlds' / f'{s}.json.gz').write_bytes(gzip.compress(data, mtime=0))
    tables = {n['name']: reactions.table(n['name']) for n in nb.ROSTER if reactions.table(n['name'])}
    (GAME / 'data' / 'reactions.json').write_text(json.dumps(dict(tables=tables, moves=reactions.MOVES), indent=1))
    (GAME / 'lib' / 'sim' / 'pool.ts').write_text('// Written by calcs/export_worlds.py. The seeds a new game may draw.\n'
                                                  f'export const POOL: readonly number[] = {json.dumps(POOL)};\n')
    (GAME / 'lib' / 'sim' / 'golden.json').write_text(json.dumps(golden(), indent=1))
    size = sum(f.stat().st_size for f in (GAME / 'data' / 'worlds').glob('*.json.gz'))
    print(f'{len(POOL)} worlds, {size / 1024:.0f} KB in all, {len(tables)} reaction tables.')
