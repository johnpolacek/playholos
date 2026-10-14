"""Each neighbor's reaction tables: for each kind of news that can reach it, its responses and their odds.
Run: python3 calcs/reactions.py   (writes HOLOS_REACTIONS.md)

How a table is made. A base table per disposition, then each dial lean multiplies some moves, once for "leans" and
twice for "strongly", then the neighbor's play style, then any notes of its own. The seed rolls the result whenever
that news arrives. Odds are design choices, not physics: they only have to be plausible for that character.
Hard rules sit outside the odds: only a hunter strikes first, anyone may strike back, and dead neighbors have no table.
"""
import re
from pathlib import Path
import neighbors as nb

ROOT = Path(__file__).resolve().parents[1]

NEWS = {
    'hum': 'It overhears someone: radio, a hum or a leak. Now it knows they exist.',
    'knock': 'A knock aimed at it arrives.',
    'broadcast': 'A broadcast sweeps past it.',
    'reply': 'An answer to its own message arrives.',
    'launch': "It sees someone's launch, going elsewhere.",
    'incoming': "Something is heading for it: a laser launch's glare, or a picket's sighting.",
    'probe': 'A probe brakes into its system.',
    'strike_seen': 'It sees a strike on someone else.',
    'struck': 'It is struck.',
    'tipoff': 'A third party tells it about someone.',
    'quiet': 'A world it was listening to goes quiet: its radars stop within a few years.',
    'silence': 'Its own knock or call goes unanswered: the reply window passes with nothing heard.',
}
MOVES = {
    'watch': 'stays quiet and aims its instruments at the source',
    'hide': 'goes quieter: cuts its hum, dims its works',
    'guard': 'builds pickets and depots toward the source',
    'knock': 'knocks back: a short aimed signal, its name optional',
    'answer': 'replies with message parts: findings, records, questions, offers',
    'call': 'starts or widens a broadcast',
    'probe': 'sends a probe or a watcher',
    'gift': 'sends knowledge unasked',
    'warn': 'tells a third party, openly or covertly',
    'mask': 'sends forged parts: a false face, or bait',
    'catch': 'catches or disables a probe in its system',
    'strike': 'plans a strike, fired when its weapons are ready',
    'ignore': 'nothing new: keeps its plan',
}

B = lambda **w: w
BASE = {
    'watcher': {
        'hum': B(watch=70, probe=10, hide=10, guard=5, knock=5),
        'knock': B(watch=45, guard=20, knock=10, answer=10, hide=10, probe=5),
        'broadcast': B(watch=70, hide=10, probe=10, knock=5, answer=5),
        'reply': B(answer=50, watch=30, guard=10, probe=10),
        'launch': B(watch=60, guard=20, hide=15, warn=5),
        'incoming': B(guard=50, watch=20, hide=20, knock=10),
        'probe': B(watch=40, catch=20, hide=15, answer=15, guard=10),
        'strike_seen': B(watch=40, hide=30, guard=25, warn=5),
        'struck': B(guard=40, strike=30, hide=20, answer=10),
        'tipoff': B(watch=60, guard=15, hide=10, probe=10, knock=5),
        'quiet': B(watch=65, probe=15, guard=10, hide=5, knock=5),
        'silence': B(watch=60, knock=15, probe=15, hide=10),
    },
    'contacter': {
        'hum': B(knock=35, watch=30, probe=15, call=10, gift=10),
        'knock': B(answer=50, gift=20, knock=10, watch=10, probe=10),
        'broadcast': B(answer=40, watch=20, gift=15, knock=15, probe=10),
        'reply': B(answer=60, gift=20, probe=10, watch=10),
        'launch': B(watch=50, warn=25, guard=15, knock=10),
        'incoming': B(knock=30, guard=30, watch=20, answer=20),
        'probe': B(answer=50, watch=25, gift=15, catch=10),
        'strike_seen': B(warn=40, watch=25, guard=20, probe=10, hide=5),
        'struck': B(guard=40, strike=25, answer=20, warn=15),
        'tipoff': B(watch=30, warn=25, knock=20, probe=15, gift=10),
        'quiet': B(knock=35, probe=30, watch=25, gift=10),          # are you still there?
        'silence': B(knock=45, probe=25, watch=20, call=10),        # try again
    },
    'inward': {
        'hum': B(ignore=60, watch=35, knock=5),
        'knock': B(ignore=55, watch=25, answer=15, hide=5),
        'broadcast': B(ignore=70, watch=25, answer=5),
        'reply': B(answer=50, ignore=30, watch=20),
        'launch': B(ignore=50, watch=40, guard=10),
        'incoming': B(guard=45, watch=30, hide=20, knock=5),
        'probe': B(watch=40, ignore=30, catch=20, answer=10),
        'strike_seen': B(watch=40, guard=30, ignore=20, hide=10),
        'struck': B(guard=50, strike=25, hide=20, answer=5),
        'tipoff': B(ignore=60, watch=35, guard=5),
        'quiet': B(ignore=65, watch=30, hide=5),
        'silence': B(ignore=75, watch=25),
    },
    'hunter': {
        'hum': B(watch=50, strike=35, hide=10, probe=5),
        'knock': B(watch=40, strike=35, mask=20, hide=5),
        'broadcast': B(watch=45, strike=35, mask=15, hide=5),
        'reply': B(mask=50, watch=30, strike=20),
        'launch': B(watch=50, hide=30, guard=20),
        'incoming': B(guard=50, hide=30, strike=20),
        'probe': B(catch=60, watch=20, hide=10, mask=10),
        'strike_seen': B(watch=50, hide=30, guard=20),
        'struck': B(strike=50, guard=30, hide=20),
        'tipoff': B(watch=45, strike=30, probe=15, hide=10),
        'quiet': B(watch=45, strike=25, probe=20, hide=10),         # it woke, or it died: either way, look
        'silence': B(watch=50, mask=25, strike=15, hide=10),
    },
}

# Per unit of lean. "Strongly" applies it twice.
DIAL = {
    'Open': dict(knock=1.5, answer=1.5, call=1.6, gift=1.5, warn=1.2, hide=0.6, mask=0.6),
    'Hidden': dict(watch=1.4, hide=1.5, mask=1.3, catch=1.2, knock=0.6, call=0.4, answer=0.75, gift=0.75),
    'Expand': dict(probe=1.5, guard=1.15, ignore=0.8),
    'Deepen': dict(watch=1.2, ignore=1.3, probe=0.75, gift=1.1),
    'Bold': dict(knock=1.3, probe=1.3, strike=1.4, call=1.3, catch=1.2, watch=0.85, guard=0.85, hide=0.8),
    'Cautious': dict(watch=1.25, guard=1.4, hide=1.2, strike=0.6, knock=0.7, call=0.7, probe=0.85),
}
STYLE = {
    'Listener': dict(watch=1.3),
    'Caller': dict(call=1.5, knock=1.2),
    'Grower': dict(guard=1.2, probe=1.2),
    'Thinker': dict(ignore=1.2, watch=1.1),
    'Hunter': dict(strike=2.5, watch=0.85),   # caution delays a hunter's strike, it doesn't cancel it
}

# Dials and play style, as HOLOS_NEIGHBORS.md writes them. check_doc() keeps the two in step.
CHARACTER = {
    'Veyra': ('H1 E1 C1', 'Listener'), 'Hael': ('O1 D1 B1', 'Caller'), 'Kesh': ('H1 E2 B1', 'Grower'),
    'Tavi': ('H1 D1 C1', 'Listener'), 'Ombe': ('O1 E1 B1', 'Caller'), 'Sere': ('H1 D1 C1', 'Grower'),
    'Ilm': ('H1 D1 C1', 'Listener'), 'Varn': ('O1 D2 C1', 'Thinker'), 'Quessa': ('H2 D1 C1', 'Listener'),
    'Daal': ('H2 E1 B2', 'Hunter'), 'Ystra': ('H1 D2 C1', 'Thinker'), 'Nuvo': ('O2 E1 B1', 'Caller'),
    'Pelle': ('H1 E1 B1', None), 'Kirrin': ('H1 D1 C2', 'Listener'), 'Ruun': ('O1 E2 B1', 'Caller'),
    'Faen': ('O1 D2 C1', 'Thinker'), 'Corra': ('H1 E1 C1', 'Grower'), 'Lusk': ('H1 E1 B1', 'Listener'),
    'Iru': ('O1 E1 C1', 'Caller'), 'Anwe': ('H1 E1 B1', None), 'Tolle': ('H1 E1 C1', 'Grower'),
    'Vesh': ('H2 E1 C2', 'Hunter'), 'Sabe': ('O2 D1 B1', 'Caller'), 'Ulan': ('H1 D2 C1', 'Thinker'),
    'Mirr': ('O1 E1 B1', None), 'Odun': ('H1 D1 C2', 'Listener'), 'Ree': ('O2 E1 B1', 'Caller'),
    'Hesk': ('H1 D2 C1', 'Thinker'), 'Arro': ('H1 E1 B1', 'Grower'), 'Wenn': ('H1 D1 C1', 'Listener'),
}
DIAL_NAMES = {'O': 'Open', 'H': 'Hidden', 'E': 'Expand', 'D': 'Deepen', 'B': 'Bold', 'C': 'Cautious'}
# Years a Mind takes to act on news, from its Cautious or Bold dial. A design choice, not physics: Bold acts first,
# Cautious looks before it acts. The midpoint, with no lean, would be half a Year.
THINKS = {'B2': 0.1, 'B1': 0.25, 'C1': 1.0, 'C2': 2.0}
def thinks(name):
    return next(THINKS[c] for c in CHARACTER[name][0].split() if c in THINKS)
def span(y):
    return {0.1: 'a tenth of a Year', 0.25: 'a quarter of a Year', 0.5: 'half a Year'}.get(y) or f"{y:g} Year{'s' if y > 1 else ''}"

# What each neighbor's own prose adds: (multipliers on moves, a note on how it plays them).
OWN = {
    'Hael': (dict(call=1.5), 'Its Long Call is aimed: a call is knocks at chosen stars.'),
    'Kesh': (dict(guard=1.2), 'Every tonne lifted costs it 3.5 times Earth\'s fuel, so it guards from the ground first.'),
    'Ilm': (dict(warn=2.0, call=0.3, probe=1.5), 'Its warnings are covert, and its probes are watchers that do not announce themselves.'),
    'Varn': (dict(probe=0.4, answer=0.8), 'It answers eventually, and briefly. Its probes cost 6.4 times Earth\'s fuel.'),
    'Daal': (dict(mask=1.3), 'A mask is bait: a friendly face to learn where its target is.'),
    'Ystra': (dict(answer=0.5, ignore=1.3), 'When it answers, it answers as "we", and asks who "you" are.'),
    'Nuvo': (dict(gift=1.2), 'It shares what its library holds.'),
    'Ruun': (dict(gift=1.5), 'Its gifts are lessons.'),
    'Iru': (dict(answer=1.3, warn=1.3), 'Its warnings are open, and it offers to mediate.'),
    'Vesh': (dict(hide=1.3, mask=1.2), 'It strikes only when sure it won\'t be seen and the target is soft.'),
    'Sabe': (dict(probe=0.6, call=1.3), 'It would rather speak than go.'),
    'Ree': (dict(gift=1.5, probe=1.5, warn=1.5), 'It warns covertly when it judges that kinder, and its sails may already be out.'),
    'Hesk': (dict(answer=0.6, knock=0.5), 'Its answers come as images, not words.'),
    'Quessa': (dict(watch=1.2), 'It listens longest of all.'),
}

# Settled 2026-10-14: before its Mind wakes, a world with arrays answers as a people. Earth is the only example: about
# ten aimed sends from 1974 to 2018, from dishes in four countries, by private groups and single institutions, and none
# after the world was asked. In 2015 scientists signed a statement asking for a worldwide discussion first. So a people
# answers readily, sometimes in more than one voice, and often not at all. Only its Open or Hidden dial applies: a
# culture leans open or closed before its Mind does. Odds and the delay are design choices, not physics.
PEOPLE = {
    'knock': B(answer=35, knock=15, watch=50),
    'broadcast': B(watch=70, answer=20, knock=10),
    'reply': B(answer=55, watch=45),
}
PEOPLE_THINKS = 2.0                      # Years: a people argues before it sends, and some senders don't wait
def people_table(dials):
    out = {}
    for news, weights in PEOPLE.items():
        w = dict(weights)
        for code in dials.split():
            if code[0] in 'OH':
                for move, m in DIAL[DIAL_NAMES[code[0]]].items():
                    if move in w: w[move] *= m ** int(code[1])
        total = sum(w.values())
        out[news] = sorted(((m, v / total) for m, v in w.items()), key=lambda kv: -kv[1])
    return out

GATES = [
    'Only a hunter strikes first, and only when its target is soft and it judges the launch unseen. Otherwise a rolled strike becomes watch.',
    'Anyone may strike back when struck, if it has the weapons. Until then a rolled strike queues the weapon projects.',
    'A neighbor reacts to a knock only if it caught the knock. See [Stars Earth knocked on](HOLOS_GAME_CONCEPT.md#stars-earth-knocked-on).',
    'Dead neighbors have no table. Pelle\'s Testament, Anwe\'s air and Mirr\'s ruins are scripted.',
    'A neighbor reacts to a world going quiet only if it was listening to that world. It can\'t tell waking from dying. A fade over decades is not news.',
    'Before its Mind wakes, a world answers as a people, from the table below, once its arrays exist. Its answer may come in more than one voice. Its Mind, on waking, inherits the exchange: it rolls its own table for that news, knowing what its people sent.',
]

def table(name):
    n = next(x for x in nb.ROSTER if x['name'] == name)
    dials, style = CHARACTER[name]
    if n.get('dies') is not None: return None
    own = OWN.get(name, ({}, ''))[0]
    out = {}
    for news, weights in BASE[n['disposition']].items():
        w = dict(weights)
        for code in dials.split():
            for move, m in DIAL[DIAL_NAMES[code[0]]].items():
                if move in w: w[move] *= m ** int(code[1])
        for mults in (STYLE[style], own):
            for move, m in mults.items():
                if move in w: w[move] *= m
        total = sum(w.values())
        out[news] = sorted(((m, v / total) for m, v in w.items()), key=lambda kv: -kv[1])
    return out

def dial_words(code):
    return ', '.join(f"{'strongly' if c[1] == '2' else 'leans'} {DIAL_NAMES[c[0]]}" for c in code.split())

def check_doc():
    """The dials and play style written in HOLOS_NEIGHBORS.md must match CHARACTER."""
    text = (ROOT / 'HOLOS_NEIGHBORS.md').read_text()
    roster = text[text.index('## The roster'):]
    for block in roster.split('\n### ')[1:]:
        name = block.split('\n')[0].strip()
        d = re.search(r'\*\*Dials\.\*\* (.*)', block).group(1).split('. It ')[0]
        lv = {dial: 2 if s.lower() == 'strongly' else 1
              for s, dial in re.findall(r'(leans|strongly|Leans|Strongly)? ?(Open|Hidden|Expand|Deepen|Cautious|Bold)', d)}
        style = re.search(r'plays as an? (\w+)', block)
        assert ' '.join(f'{k[0]}{v}' for k, v in lv.items()) == CHARACTER[name][0], name
        assert (style.group(1) if style else None) == CHARACTER[name][1], name

def write():
    check_doc()
    assert set(CHARACTER) == {n['name'] for n in nb.ROSTER}
    L = ['# Holos · Reactions', '',
         'Generated by `python3 calcs/reactions.py`. Do not edit by hand: change the model in [calcs/reactions.py](calcs/reactions.py).', '',
         "Each neighbor's reaction tables, from [How neighbors play](HOLOS_GAME_CONCEPT.md#how-neighbors-play). When news reaches a neighbor, "
         "after its light delay, the seed rolls that neighbor's table for that news. The same seed and the same player actions give the same game.", '',
         '## How a table is made', '',
         '- A base table for each disposition: watcher, contacter, inward, hunter.',
         '- Each dial lean multiplies some moves: once for "leans", twice for "strongly".',
         '- Then its play style, then anything its own prose adds.',
         '- Odds are design choices, not physics. They only have to fit the character.', '',
         '**Hard rules, outside the odds:**'] + [f'- {g}' for g in GATES] + ['', '## News', '']
    L += [f'- **{k}.** {v}' for k, v in NEWS.items()] + ['', '## Moves', '']
    L += [f'- **{k}:** {v}.' for k, v in MOVES.items()] + ['', '## What the dials do', '']
    for dial, mults in DIAL.items():
        L.append(f"- **{dial}:** " + ', '.join(f'{m} ×{v:g}' for m, v in mults.items()) + '.')
    L += ['', '**How long a Mind takes to act on news,** from its Cautious or Bold dial: ' + ', '.join(
        f'{dial_words(c)} {span(y)}' for c, y in THINKS.items()) + '. '
        'It sets when an answer leaves, so when it arrives.']
    L += ['', '**Play styles:** ' + '. '.join(f"{s}: {', '.join(f'{m} ×{v:g}' for m, v in mults.items()) or 'none'}" for s, mults in STYLE.items()) + '.', '']
    L += ['## Before a Mind wakes', '',
          'Settled 2026-10-14. A world with arrays hears a knock and may answer as a people, the way Earth\'s own senders have: about ten aimed sends from 1974 to 2018, '
          'from dishes in four countries, none after the world was asked. Only the Open or Hidden dial applies. '
          f'A people acts {span(PEOPLE_THINKS)} after news.', '', '| Lean | News | Odds |', '| --- | --- | --- |']
    for lean in ('O2', 'O1', 'H1', 'H2'):
        for news, odds in people_table(lean).items():
            L.append(f'| {dial_words(lean)} | {news} | ' + ', '.join(f'{m} {p:.0%}' for m, p in odds) + ' |')
    L += ['', '## Tables', '', 'Moves under 5% are folded into "other".', '']
    for n in nb.ROSTER:
        name = n['name']
        dials, style = CHARACTER[name]
        L.append(f'### {name}')
        L.append('')
        t = table(name)
        if t is None:
            L += [f"Dead. No table. In life it was {dial_words(dials)}.", '']
            continue
        note = OWN.get(name, ({}, ''))[1]
        L.append(f"{n['disposition'].capitalize()}, {dial_words(dials)}. Plays as a {style}. Acts {span(thinks(name))} after news."
                 + (f' {note}' if note else ''))
        L.append('')
        L.append('| News | Odds |')
        L.append('| --- | --- |')
        for news, odds in t.items():
            shown = [(m, p) for m, p in odds if p >= 0.05]
            other = 1 - sum(p for _, p in shown)
            cell = ', '.join(f'{m} {p:.0%}' for m, p in shown) + (f', other {other:.0%}' if other >= 0.005 else '')
            L.append(f'| {news} | {cell} |')
        L.append('')
    (ROOT / 'HOLOS_REACTIONS.md').write_text('\n'.join(L))

if __name__ == '__main__':
    write()
    for name in ('Veyra', 'Hael', 'Vesh', 'Ystra'):
        t = table(name)
        print(name, 'knock:', ', '.join(f'{m} {p:.0%}' for m, p in t['knock'] if p >= 0.05))
    print('wrote HOLOS_REACTIONS.md')
