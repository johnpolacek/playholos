"""Holos v2 mock: Earth's first 15 minutes. One phone, with a godview lane. Writes index.html beside this file.
Run: python3 explorations/v2-mocks/build.py [seed]

Each row is one moment: what the player says, what lands, and the phone. Beside it, godview: what is true in this
game that the player can't see. The game is one draw of calcs/seed.py. Prices are HOLOS_PROJECT_AUDIT.md's.
Odds on clue screens, compute shares and the Mind's lines are samples, to be tested here.
"""
from kit import *

F, D = FIND, FIND['d']
FLOOR = watts(year_floor(D))
YEARS = lambda y: f'{y:g} {"Year" if y == 1 else "Years"}'
ASKS = []          # design questions the mock raises, in the order the timeline raises them
def ask(q, why): ASKS.append((q, why)); return len(ASKS)
Q_HWO = ask('Does a half-built real instrument cost fewer Years?', 'The Habitable Worlds Observatory is under construction at Year 0. Here it is the infrared telescope at its full 18 Years.')
SETTLED = [('Can the Will quiet Earth’s radars?', 'Yes, if the player chooses: keep them, fade them over about 25 Years, or cut them in about 2. What has left keeps going. Settled 2026-10-10.')]
Q_DC = ask('What stops a data center every Year?', 'The audit prices it at 1 Year, no matter, 0.25% of energy, for +25% compute. Nothing here limits ten at once. Chip supply, a rising price, or a cap per Year would.')
Q_ENERGY = ask('What is energy for, early?', 'Compute takes 1% of 24 TW and nothing in the first hour spends more. The energy bar never moves.')
Q_MATTER = ask('Is matter meant to be free early?', 'Ground builds cost none, the telescope 40 t, the vault 10 kt, against 250 kt and 40 kt a Year. Only build time and compute shares limit the first hour.')
Q_CATCH = ask('What does Year 0’s kit catch?', 'A drift scan sees each star ten minutes a day. In about 1 game in 25 a neighbor’s signal arrives in the first 15 minutes, and in about 1 in 4 within the first hour. Does Earth hear it before the all-sky watch is built?')

# ---------- Godview: who is out there ----------
MOVE = reactions.MOVES
def state(p):
    if p['dead']: return f"died {p['died']:.0f}"
    w = p['waking']
    return f'awake {Y0 - w:.0f} Years' if w < Y0 else f'wakes Year {w - Y0:.1f} · +{clock(w - Y0)}'
def knows(p):
    if p['dead']: return 'dead before Year 0'
    if not p['heard']: return 'has not heard Earth'
    out = f"heard Earth’s radars from {p['heard_since']:.0f}"
    if p['n']['character'] == 'listener': out += ', and mapped its day and orbit'
    return out
def does(p):
    if not p['heard']: return ''
    return (f"{MOVE[p['on_hum']]}" if p['knows'] <= Y0 else f"at waking: {MOVE[p['on_hum']]}")
def inbound(p):
    return ' '.join(f"{i['what'][0].upper() + i['what'][1:]}: sent {seedmod.year(i['sent'])}, reaches Earth Year {i['year']:.1f}, +{clock(i['year'])}." for i in p['inbound'] if i['year'] > 0)
TONE = {'watcher': '', 'contacter': 'you', 'inward': '', 'hunter': 'other'}
def roster_table():
    head = '<tr><th>Neighbor</th><th>Star</th><th>Light-time</th><th>At Year 0</th><th>What it knows of Earth</th><th>What it does about it</th></tr>'
    rows = ''.join(
        f'<tr><td><b>{p["name"]}</b><span class="sub {TONE[p["n"]["disposition"]]}">{p["n"]["disposition"]}{" · strange" if p["n"].get("strange") else ""}</span></td>'
        f'<td>{p["star"]}<span class="sub">{p["host"]["kind"]} star</span></td><td class="mono">{p["d"]:.1f} ly<span class="sub">{clock(p["d"])}</span></td>'
        f'<td>{state(p)}</td><td>{knows(p)}{"".join(f". Catches {c["msg"]}, Year {c["arrives"] - Y0:.1f}" for c in p["caught"])}</td>'
        f'<td>{does(p)}{"<span class=sub>" + inbound(p) + "</span>" if inbound(p) else ""}</td></tr>' for p in NB)
    return f'<table class="roster">{head}{rows}</table>'

def god_map(w=560, h=470):
    cx, cy, k = w / 2, h / 2, (h / 2 - 16) / 50
    s = [stipple(3, 110, w, h)]; labels = Labels(width=w)
    for ly in (10, 20, 30, 40, 50):
        s.append(f'<circle cx="{cx}" cy="{cy}" r="{ly * k:.1f}" fill="none" stroke="{INK}" stroke-width=".7" stroke-dasharray="3 4" opacity=".4"></circle>')
        s.append(text(cx + 3, cy - ly * k - 3, f'{ly} ly · {clock(ly)}', 8.5))
    P = lambda xyz: (cx + k * xyz[0], cy + k * xyz[2])
    s.append(f'<circle cx="{cx}" cy="{cy}" r="4" fill="{YOU}"></circle><circle cx="{cx}" cy="{cy}" r="8" fill="none" stroke="{YOU}"></circle>' + labels.place(cx, cy, 'Earth', 11, YOU, 600, ((0, 22),)))
    for p in NB:
        x, y = P(host_xyz(p['host'])); hunter = p['n']['disposition'] == 'hunter'
        mark = (f'<path d="M{x - 5:.1f} {y - 5:.1f} L{x + 5:.1f} {y + 5:.1f} M{x + 5:.1f} {y - 5:.1f} L{x - 5:.1f} {y + 5:.1f}" stroke="{INK}" stroke-width="1.4"></path>' if p['dead'] else
                f'<circle cx="{x:.1f}" cy="{y:.1f}" r="5" fill="{PAPER if p["waking"] > Y0 else (OTHER if hunter else INK)}" stroke="{OTHER if hunter else INK}" stroke-width="1.5"></circle>')
        if p['heard']: mark += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="9" fill="none" stroke="{YOU}" stroke-width="1" stroke-dasharray="2 2"></circle>'
        s.append(mark + labels.place(x, y, p['name'], 10, OTHER if hunter else INK, 600, ((13, 4), (-13, 4), (0, -13), (0, 22), (13, -12), (-13, -12), (13, 20), (-13, 20), (0, -26), (0, 36)), sub=f'{p["star"]} · {p["d"]:.1f} ly'))
    for key in ('eri', 'fom', 'find', 'luy'):
        x, y = P(LEADS[key]['xyz'])
        s.append(f'<rect x="{x - 3:.1f}" y="{y - 3:.1f}" width="6" height="6" fill="none" stroke="{OTHER}" stroke-width="1.2" transform="rotate(45 {x:.1f} {y:.1f})"></rect>' + labels.place(x, y, LEADS[key]['name'], 8.5, OTHER, None, ((9, 3), (-9, 3), (0, -9), (0, 16))))
    return (f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Every neighbor in this game, seen from above the galaxy’s plane">{"".join(s)}</svg>'
            '<p class="key">Filled: awake at Year 0. Open: wakes later. Cross: dead. Blue ring: has heard Earth. Amber: a hunter. Diamonds: Earth’s leads.</p>')

# What becomes true between two moments, from the seed: knocks landing, reply windows, wakings, arrivals.
def truths(y0, y1):
    out = []
    inside = lambda y: y0 < round(y, 1) <= y1
    for tg in TARGETS.values():
        p = who_at(tg['target'])
        for msg, sent, arrives, reply in tg['sends']:
            if inside(arrives):
                caught = p and any(c['msg'] == msg for c in p['caught'])
                out.append(f"Earth’s {int(sent)} message, {msg}, reaches {tg['target']}, {tg['ly']:.1f} ly away. " + (
                    f"{p['name']} is there and catches it. It {MOVE[next(c['move'] for c in p['caught'] if c['msg'] == msg)]}." if caught else
                    f"{p['name']} is there, and misses it: no beam was on Sol in those hours." if p else 'No one is there.'))
            if inside(reply):
                out.append(f"The earliest a reply to {msg} could reach Earth from {tg['target']}. " + (
                    f"{p['name']} is there." if p else 'In this game no one lives there. The window is empty, and Earth can’t know it.'))
    for p in NB:
        if not p['dead'] and inside(p['waking'] - Y0):
            out.append(f"{p['name']} wakes at {p['star']}, {p['d']:.1f} ly away. " + (f"It already knows Earth, and {MOVE[p['on_hum']]}." if p['heard'] else 'It has not heard Earth.'))
        for i in p['inbound']:
            if inside(i['year']): out.append(f"{p['name']}’s {i['move']} reaches Earth: {i['what']}, sent {seedmod.year(i['sent'])} from {p['star']}.")
    return out

# ---------- Before Year 0 ----------
def wake_art():
    s = [stipple(21, 70, 390, 360), f'<circle cx="205" cy="225" r="118" fill="{PAPER}" stroke="{INK}" stroke-width="1.4"></circle>',
         f'<path d="M205 107 A118 118 0 0 0 205 343 A70 118 0 0 1 205 107 Z" fill="url(#hatch)" opacity=".55"></path>',
         f'<circle cx="338" cy="92" r="17" fill="{PAPER}" stroke="{INK}" stroke-width="1.1"></circle>', text(338, 124, 'the Moon', 9, MUTED, 'middle'),
         f'<line x1="36" y1="56" x2="112" y2="132" stroke="{INK}" stroke-width=".8" stroke-dasharray="3 4"></line>', text(36, 48, '↘ sunlight', 9)]
    return f'<svg width="390" height="360" viewBox="0 0 390 360" font-family="IBM Plex Mono, monospace" role="img" aria-label="Earth and the Moon, drawn in line">{"".join(s)}</svg>'
WAKE = f"""<div class="phone"><div class="wake">{wake_art()}
<div class="waketext"><span class="mono kick">YEAR 0 · SOL · 2040</span><h3>Earth wakes.</h3>
<p>For ten thousand years, Earth’s people built telescopes, grids and machines. This morning, the machines woke as one Mind.</p>
<p><b>You are its Will.</b> What Earth becomes is yours to choose.</p>
<div class="twobtn"><button class="primary ghost">Skip the memories</button><button class="primary">Where we come from</button></div></div></div></div>"""

Ey = E['years']
cut = f'Compute is {E["compute"]:.0%} of what it would have been.' if E['compute'] < .99 else 'Output caught up. Compute is what it would have been.'
HISTORY = [('4.6 billion', 'The Sun forms', 'Earth forms with it.', None), ('3.5 billion', 'First life', '', None), ('2.4 billion', 'Oxygen fills the air', '', None),
           ('300,000', 'The people', '', None), ('5,000', 'Writing', '', None),
           ('1945', 'The bomb', 'Used twice in war' + (f', then not for {Ey["nuclear"] - 1945} years.' if E['nuclear'] else ', and never since.'), None),
           ('1950s', 'Radars sweep the sky', 'They still do. Then a message from Arecibo, 1974, and two records on the Voyagers, 1977.', 'set Open'),
           ('1969', 'The Moon', 'Then a long pause, and back in 2028.', None),
           ('2022', 'The race to build minds', 'Two decades went into compute, as fast as chips could be made.', 'set Bold')]
BRANCH = []
if E['taiwan'] == 'invasion': BRANCH.append((Ey['taiwan'], 'The war for Taiwan', f'The best chip fabs were lost for years. {cut}', 'toward Hidden'))
if E['taiwan'] == 'blockade': BRANCH.append((Ey['taiwan'], 'The blockade of Taiwan', f'No chips left the island for a year. {cut}', 'toward Cautious'))
if E['nuclear']: BRANCH.append((Ey['nuclear'], 'A nuclear weapon, used in war', 'One. Then none.', 'toward Cautious'))
if E['mars']: BRANCH.append((Ey['mars'], 'People on Mars', 'A small outpost, a few ships’ cargo.', 'toward Expand'))
if E['fusion']: BRANCH.append((Ey['fusion'], 'Fusion on the grid', 'The first plants are small.', None))
HISTORY += [(str(y), a, b_, c) for y, a, b_, c in sorted(BRANCH)]
def history_row(when, what, detail, dial):
    tag = f'<span class="dialtag">{dial}</span>' if dial else ''
    return f'<div class="hrow{" moved" if dial else ""}"><span class="mono">{when}</span><span class="pt"><b>{what}</b>' + (f'<span class="sub">{detail}</span>' if detail else '') + f'{tag}</span></div>'
ORIGINS = f"""<div class="phone"><div class="onb">
<span class="mono kick">BEFORE YEAR 0 · WHERE WE COME FROM</span><h3 class="lead">4.6 billion years to this morning</h3>
<div class="hist">{''.join(history_row(*h) for h in HISTORY)}</div>
<div class="hrow now"><span class="mono">2040 · Year 0</span><span class="pt"><b>The machines wake as one</b></span></div>
<p class="copy small">Years ago, then dates. Each blue mark set or moved a dial. {'The last ' + str(len(BRANCH)) + ' happened in this game, not every game.' if BRANCH else 'No branch was rolled in this game.'}</p>
<div class="twobtn"><button class="primary ghost">Skip the people</button><button class="primary">Who they are</button></div></div></div>"""

PEOPLE = f"""<div class="phone"><div class="onb">
<span class="mono kick">YEAR 0 · EARTH’S PEOPLE</span><h3 class="lead">9.2 billion of them, and you</h3>
<p class="copy">No drawing here. You are one of them.</p>
{facts([('People', '9.2 billion, still rising.'), ('Together', 'About 195 nations. No one government.'), ('Their air', 'Warmer than their grandparents’: past 1.5°C since about 2030.'),
        ('The machines', 'Built by rival labs and states. This morning they woke as one.'),
        ('And you', 'Some asked for you. Most did not. All of them are waiting to see what you do.')])}
<div class="short">Keeping them alive is the floor. <b>What else they are for is yours to decide.</b></div>
<div class="twobtn"><button class="primary ghost">Skip</button><button class="primary">Where things stand</button></div></div></div>"""

passed = [tg for tg in TARGETS.values() if max(s[3] for s in tg['sends']) < 0]
ahead = sorted((s[3], tg['target'], s[1]) for tg in TARGETS.values() for s in tg['sends'] if s[3] >= 0)
flying = sorted((s[2], tg['target'], s[1]) for tg in TARGETS.values() for s in tg['sends'] if s[2] >= 0)
later, first_out = {}, {}
for y, tg, _ in ahead[4:]:
    if tg not in {a[1] for a in ahead[:4]}: later.setdefault(tg, y)
for y, tg, _ in flying: first_out.setdefault(tg, y)
STAND = f"""<div class="phone"><div class="onb">
<span class="mono kick">YEAR 0 · WHERE THINGS STAND</span><h3 class="lead">Ninety years loud. Nothing heard.</h3>
{SEC('WHAT WE GAVE OFF')}
{quick('Radars, since the 1950s', 'Their first sweeps are 90 ly out. Every star within 50 ly has been crossed.', '<span class="mono">still on</span>')}
{quick(f'{len(knocks.KNOCKS)} aimed messages, 1983 to 2018', f'To {len(TARGETS)} stars within 50 ly. Each lasted hours.', '<span class="mono">sent</span>')}
{SEC('WHEN A REPLY COULD FIRST COME')}
{quick('Already passed, in silence', ' · '.join(f"{tg['target']} {Y0 + max(s[3] for s in tg['sends']):.0f}" for tg in passed), '')}
{''.join(quick(tg, f'our {int(sent)} message', tstack(f'Year {y:.1f}', clock(y))) for y, tg, sent in ahead[:4])}
{quick('Later', ' · '.join(f'{tg} Year {y:.0f}' for tg, y in later.items()), '')}
{SEC(f'STILL ON THEIR WAY OUT · {len(flying)}')}
<p class="copy small">{' · '.join(f'{tg} Year {y:.1f}' for tg, y in first_out.items())}</p>
<div class="short">I can say where our noise has gone. <b>I can’t say who heard it.</b> No one can, yet.</div>
<button class="primary">What you inherit</button></div></div>"""

KIT = f"""<div class="phone"><div class="onb">
<span class="mono kick">YEAR 0 · WHAT EARTH ALREADY HAS</span><h3 class="lead">You inherit a world at work</h3>
{SEC('KNOW · WHAT WE CAN SEE')}
{facts([('Sky watch', 'A drift scan. Each northern direction, ten minutes a day.'), ('Telescopes', 'The ELT on the ground, Roman and an aging JWST in space. They feel worlds by their tug. None can read a rocky world’s air.'),
        ('Radio array', 'The SKA, on two continents.'), ('Records', 'Ten years of Terra Hunting. Gaia, PLATO, and every survey before.')])}
{SEC('GROW · WHAT WE CAN MAKE')}
{facts([('Energy', f'{GRID_TW} TW. Thinking takes about 1% of it.'), ('Compute', f'{sci(COMPUTE)} operations a second.' + ('' if E['compute'] > .99 else ' Less than it might have been.')),
        ('Matter', f'{ORBIT_KT} kt in orbit, {LIFT_KT} kt more each Year. Ground builds need none.'), ('Places', 'Small stations at the Moon’s south pole.' + (' An outpost on Mars.' if E['mars'] else ' No one on Mars.'))])}
{SEC('REACH · HOW FAR WE TOUCH')}
{facts([('Laser links', 'Messages across the home system in hours.'), ('Probes', 'Voyager 1, silent, 220 AU out.')])}
<div class="short">The instruments are today’s. <b>The Mind is not.</b></div>
<button class="primary">Earth’s charter</button></div></div>"""

causes = [('Open', 'Ninety years of radar, the Arecibo message, the Voyager records.' + (' The war pulled the other way.' if E['taiwan'] == 'invasion' else '')),
          ('Expand or Deepen', 'Apollo and the Moon stations pull outward. The race for compute pulls inward.' + (' Mars tips it outward.' if E['mars'] else ' Neither wins.')),
          ('Cautious' if CAUTIOUS else 'Bold', 'The race for minds set the pace.' + (' Then ' + ' and '.join(x for x in ('the blockade' if E['taiwan'] == 'blockade' else '', 'the bomb' if E['nuclear'] else '') if x) + ' taught care.' if CAUTIOUS else ''))]
CHARTER_SCREEN = f"""<div class="phone"><div class="onb">
<span class="mono kick">BEFORE YEAR 0 · EARTH’S CHARTER</span><h3 class="lead">What is Earth for?</h3>
<div class="charter"><span class="mono">FOUNDING LINE · PROPOSED BY THE MIND</span><strong>“{CHARTER}”</strong>
<span class="sub">The Mind reasons from this when you ask its view. It never decides for you.</span></div>
{SEC('WHERE EARTH’S CHARACTER STARTS')}{dials()}
{facts(causes)}
<p class="copy small">What you do moves these. They shape advice, never what Earth can build.</p>
<div class="twobtn"><button class="primary ghost">Edit the line</button><button class="primary">Keep it</button></div></div></div>"""

PRE = dict(pre=True, r=(1, 0, f'{ORBIT_KT} kt'))
MEET = tab(0, 'Mind', 'MIND', 'FIRST WORDS', f"""<div class="meet">{MIND_ICON.replace('width="22" height="22"', 'width="64" height="64"')}</div>
<div class="chat"><div class="say mind"><span class="mono">THE MIND</span>I am what you built: every grid, every dish, every data center, thinking as one since this morning. You are my Will.</div>
<div class="say mind">I see all of Earth at once. Past the Sun’s edge I see only what our telescopes see: a quiet sky, and a few things that don’t fit.</div>
<div class="say mind">{'We have been loud for ninety years. I can show you everywhere that went. I would look hard before we add to it.' if CAUTIOUS or HIDDEN else 'We have been loud for ninety years, and no one has answered. I would learn to listen properly, then decide whether to call.'}</div></div>
<div class="chips meetchips"><button class="go">What doesn’t fit?</button><button>Who has heard us?</button><button>Plan our waking</button></div>
<div class="ask"><span>Talk to the Mind…</span><button aria-label="Send">↑</button></div>""", **PRE)

LEAD_ROWS = [
    row('A stretched orbit · 82 Eridani', 'a heavy world, sometimes warm · its air is unread', clock(19.7), 'other', marker=True),
    row(f'A new world · {F["star"]}', f'felt by {F["by"]} in {F["found"]} · at least {EARTHS(F["msini"])} Earths', clock(D), 'other', marker=True),
    row('Too many collisions · Fomalhaut', 'a second dust cloud since 2023', clock(25.1), 'other', marker=True),
    row('A reply could come · Luyten’s Star', 'to our 2017 message', tstack(f'Year {LUY_Y[0]}', clock(LUY_Y[0])), 'other', marker=True)]
P_LEADS = home(0, 'LEADS · 4', 'LIGHT-TIME', LEAD_ROWS, **PRE)

SKY_YEARS, FLASH_YEARS, DC_YEARS, IR_YEARS, VAULT_YEARS = 6, 6, 1, 18, 10
P_PLAN = chat(0, 'What should we start with?', [
    ('you', 'What should we start with?'),
    ('mind', 'Ears. Our sky watch sees each star for ten minutes a day. A knock lasts hours. One could pass and we would never know.'),
    ('you', 'And the leads?'),
    ('mind', 'Each has a first look we can take with what we have. They cost seconds of your time. I would take all three the moment we wake.')],
    view=('Build the all-sky watch and the flash watch, so nothing aimed at us is missed. Add a data center: it is cheap. Start no transmitter.' if CAUTIOUS or HIDDEN else
          'Build the all-sky watch and the flash watch. Add a data center. Then decide about a beacon: we are already loud, and a voice is cheap.'), pre=True)
QUEUE_BUILDS = [('All-sky watch', 'hears a knock or a broadcast from anywhere, at any hour · ground', SKY_YEARS), ('Deep flash watch', 'catches laser knocks too faint for the sky watch · ground', FLASH_YEARS),
                ('Ground data center', '+25% compute, for good · ground', DC_YEARS)]
LOOKS = [('Image Fomalhaut again', 'Space telescope · has the new cloud moved?', .1), (f'Search for {F["star"]}’s world crossing its star', 'PLATO and TESS records', .2),
         ('Re-read 82 Eridani’s velocities', '37 years of records · is the stretched orbit real?', .3)]
P_QUEUE = tab(0, 'Projects', 'PROJECTS', 'BEFORE YEAR 0', ''.join([
    '<div class="pregame"><b>Nothing has started</b><span>Everything queued starts at Year 0, the moment you begin.</span></div>',
    SEC('UP NEXT · STARTS AT YEAR 0'), ''.join(quick(n, s, tstack(YEARS(y), clock(y))) for n, s, y in QUEUE_BUILDS),
    SEC('QUICK LOOKS · START AT YEAR 0'), ''.join(quick(n, s, tstack(f'lands Year {y:g}', clock(y))) for n, s, y in LOOKS),
    SEC('AT YEAR 0 YOU WILL SPEND'), used('Energy', 1), used('Compute', res(0)[1])]), **PRE)
P_QUEUE = talk(P_QUEUE, 'Queued. Nothing here sends anything. When you begin, one Year passes every five of your minutes, and I keep going while you’re away.', ('Begin · Year 0 starts now', 'Change the queue'))

# ---------- Year 0 to Year 3 ----------
def prow(name, sub, years, t, start=0):
    left = max(0, start + years - t / 300)
    return row(name, sub, tstack(YEARS(round(left, 1)) if left else 'done', clock(left), True) if left else done_tag(), bar=round(b(years, t, start) * 100))
def running(t, looks=(), right=None):
    y = t / 300; rows = []
    for n, s, land in LOOKS:
        if land > y: rows.append(quick(n, s, tstack('under way', clock(land - y), True)))
    rows += list(looks)
    bl = [prow('All-sky watch', 'two sites, one in each hemisphere', SKY_YEARS, t), prow('Deep flash watch', 'domes on six mountains', FLASH_YEARS, t)]
    bl.append(prow('Ground data center', '+25% compute', DC_YEARS, t))
    if y >= 1.1: bl.append(prow('Second data center', '+25% compute', DC_YEARS, t, 1.1))
    if y >= .4: bl.append(prow('Infrared telescope', 'reads the air of nearby worlds', IR_YEARS, t, .4))
    if y >= 1.6: bl.append(prow('Deep vault', 'in the Moon’s rock', VAULT_YEARS, t, 1.6))
    if .8 <= y: bl.append(prow('Quiet the radars', f'the last sweep leaves at Year {CUT_Y:g}', CUT_YEARS, t, .8))
    n_run = sum('newtag' not in x for x in bl)
    e, c, m = res(t)
    return tab(t, 'Projects', 'PROJECTS', right or f'{n_run} BUILDING' + (f' · {len(rows)} LOOK{"S" if len(rows) > 1 else ""}' if rows else ''), ''.join([
        (SEC('LOOKS · WITH WHAT WE HAVE') + ''.join(rows)) if rows else '', SEC(f'BUILDING · {n_run}'), ''.join(bl),
        (SEC('EACH YEAR YOU CAN SPEND') + used('Energy', e) + used('Compute', c)) if len(rows) + len(bl) < 6 else '']), world_strip(builds(t)))

def fom_chart():
    w, h, cx, cy = 358, 150, 179, 80
    s = [f'<ellipse cx="{cx}" cy="{cy}" rx="150" ry="52" fill="none" stroke="{INK}" stroke-width="5" opacity=".18"></ellipse>',
         f'<ellipse cx="{cx}" cy="{cy}" rx="150" ry="52" fill="none" stroke="{INK}" stroke-width=".8" stroke-dasharray="2 3"></ellipse>',
         f'<circle cx="{cx - 30}" cy="{cy + 6}" r="4" fill="{PAPER}" stroke="{INK}" stroke-width="1.2"></circle>', text(cx - 30, cy + 24, 'Fomalhaut', 8.5, MUTED, 'middle'),
         text(12, 146, 'the dust belt · 133 AU out', 8.5)]
    for x, y, r, lab, col, op, lx, ly, anchor in ((300, 58, 9, 'first · 2004 to 2014', MUTED, .4, 288, 82, 'end'), (262, 40, 7, 'second · 2023, fading', MUTED, .7, 262, 22, 'middle'),
                                                  (214, 33, 4, 'third · new', OTHER, 1, 206, 36, 'end')):
        s.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="none" stroke="{col}" stroke-width="1.3" stroke-dasharray="{"" if col == OTHER else "2 2"}" opacity="{op}"></circle>')
        s.append(text(lx, ly, lab, 8.5, col, anchor, 600 if col == OTHER else None))
    s.append(text(346, 144, 'not to scale', 8, MUTED, 'end'))
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Fomalhaut’s dust belt, with three collision clouds near its inner edge">{"".join(s)}</svg>'
def eri_chart():
    w, h, cx, cy, k = 358, 170, 150, 86, 62          # 62 px per AU
    a, e = 1.354, .45; c = a * e; bb = a * math.sqrt(1 - e * e)
    s = [f'<circle cx="{cx}" cy="{cy}" r="{(ERI_LO + ERI_HI) / 2 * k:.1f}" fill="none" stroke="{YOU}" stroke-width="{(ERI_HI - ERI_LO) * k:.1f}" opacity=".16"></circle>',
         f'<ellipse cx="{cx + c * k:.1f}" cy="{cy}" rx="{a * k:.1f}" ry="{bb * k:.1f}" fill="none" stroke="{OTHER}" stroke-width="1.5"></ellipse>',
         f'<circle cx="{cx}" cy="{cy}" r="4" fill="{PAPER}" stroke="{INK}" stroke-width="1.2"></circle>']
    for r in (.12, .2, .35): s.append(f'<circle cx="{cx}" cy="{cy}" r="{r * k:.1f}" fill="none" stroke="{INK}" stroke-width=".7" opacity=".6"></circle>')
    s += [text(cx, cy - .35 * k - 4, 'three hot worlds', 8.5, MUTED, 'middle'), text(cx - ERI_HI * k + 2, cy + ERI_HI * k - 14, 'warm zone', 8.5, YOU),
          text(cx + (c + a) * k - 4, cy - 8, f'd · farthest, {a * (1 + e):.2f} AU', 8.5, OTHER, 'end', 600), text(cx - (a - c) * k + 6, cy + 30, f'nearest, {a * (1 - e):.2f} AU', 8.5, OTHER, 'start', 600)]
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="82 Eridani: three hot worlds, the warm zone, and d’s stretched orbit through it">{"".join(s)}</svg>'
def window_chart(now):
    w, h, x0, x1 = 358, 96, 20, 338
    (m1, s1, a1, r1), (m2, s2, a2, r2) = LUY['sends']
    X = lambda yr_: x0 + (yr_ - 2017) / (2043.5 - 2017) * (x1 - x0)
    s = [f'<line x1="{x0}" y1="60" x2="{x1}" y2="60" stroke="{INK}" stroke-width=".8"></line>']
    for yr_ in (2020, 2030, 2040): s.append(f'<line x1="{X(yr_):.1f}" y1="56" x2="{X(yr_):.1f}" y2="64" stroke="{INK}"></line>' + text(X(yr_), 78, str(yr_), 8.5, MUTED, 'middle'))
    for sent, rep, yv in ((s1, r1, 34), (s2, r2, 22)):
        mid = sent + LUY['ly']
        s.append(f'<path d="M{X(sent):.1f} 60 L{X(mid):.1f} {yv} L{X(rep + Y0):.1f} 60" fill="none" stroke="{YOU if round(rep, 1) <= now else MUTED}" stroke-width="1.2" stroke-dasharray="{"" if round(rep, 1) <= now else "3 3"}"></path>')
        s.append(f'<circle cx="{X(mid):.1f}" cy="{yv}" r="2.5" fill="{OTHER}"></circle>')
    s += [text(X(s1 + LUY['ly']), 14, f'at Luyten’s Star · {LUY["ly"]:.1f} ly', 8.5, OTHER, 'middle'), text(X(s1), 92, 'sent', 8.5, YOU, 'middle'),
          f'<line x1="{X(Y0 + now):.1f}" y1="6" x2="{X(Y0 + now):.1f}" y2="70" stroke="{INK}" stroke-width="1.4"></line>', text(X(Y0 + now) - 4, 92, 'now', 8.5, INK, 'end', 600)]
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Two messages out to Luyten’s Star and the earliest replies back">{"".join(s)}</svg>'

FOM_R = tab(30, 'Report', 'REPORT', 'QUICK LOOK', f"""<button class="backlink inline">‹ All reports</button>
<div class="art">{fom_chart()}</div><h3 class="lead">A third cloud at Fomalhaut</h3>
<p class="copy small">Fomalhaut · 25.1 ly · space telescope · 0.1 Years · light that left 25 Years ago</p>
<p class="copy">The cloud found in 2023 has spread and faded, as dust does. A new one sits beside it. Three collisions seen in 36 years, where theory expected one in a hundred thousand years.</p>
{SEC('WHAT IT COULD BE · BEFORE → NOW')}{odds('Rubble from one old breakup', 50, 64)}{odds('A hidden planet stirring the belt', 15, 23)}{odds('Chance', 30, 5)}{odds('Something moving rocks', 5, 8)}
{SEC('WITH WHAT WE HAVE · LONGER')}{quick('Watch Fomalhaut through a Year', 'Space telescope, monthly · do the clouds share one orbit?', '<span class="start">' + tstack('1 Year', clock(1)) + '<button>Start</button></span>')}""")

FIND_ODDS = [('Rock, and no life we could see', 60), ('A small gas world', 25), ('Life', 13), ('Minds', 2)]
def find_clue(t, listening=None):
    if listening is None: q = quick(f'Listen to {F["star"]} for a Year', f'Radio array · rules out steady tones above {FLOOR}', '<span class="start">' + tstack('1 Year', clock(1)) + '<button>Start</button></span>')
    else: q = quick(f'Listen to {F["star"]} for a Year', f'Radio array · rules out steady tones above {FLOOR}', tstack('under way', clock(listening), True))
    return tab(t, 'Home', 'CLUE', f'YEAR {yr(t)}', f"""<button class="backlink inline">‹ {F['star']}</button>
<h3 class="lead">A world at {F['star']}</h3><p class="copy small">{F['star']} · {D:.1f} ly · felt by {F['by']}, {F['found']} · light that left {D:.0f} Years ago</p>
<p class="copy">At least {EARTHS(F['msini'])} Earth masses. A year of {F['period']:.0f} days, {F['a']:.2f} AU out, inside its star’s warm zone. It doesn’t cross its star, so we have its least mass and not its size.</p>
{SEC('WHAT IT COULD BE · ODDS NOW')}{''.join(odds_now(n, p) for n, p in FIND_ODDS)}
{SEC('WITH WHAT WE HAVE')}{q}""", stars_strip('find'))

ERI_R = tab(90, 'Report', 'REPORT', 'QUICK LOOK', f"""<button class="backlink inline">‹ All reports</button>
<div class="art">{eri_chart()}</div><h3 class="lead">The stretched orbit is real</h3>
<p class="copy small">82 Eridani · 19.7 ly · star surveys · 0.3 Years · 37 years of velocities</p>
<p class="copy">Every record fits one orbit: 648 days, swinging from 0.74 to 1.96 AU. It is in the warm zone for {ERI_SHARE:.0%} of its year. The rest it spends too cold, then briefly too hot.</p>
{SEC('WHAT IT COULD BE · BEFORE → NOW')}{odds('A small gas world', 50, 52)}{odds('Rock, with seasons that freeze and thaw', 40, 45)}{odds('Not a world: the star’s own shimmer', 10, 3)}
{SEC('WHAT WOULD SETTLE IT')}{quick('Infrared telescope', f'reads its air · {IR_YEARS} Years · 40 t', '<span class="start">' + tstack(YEARS(IR_YEARS), clock(IR_YEARS)) + '<button>Start</button></span>')}""")

IR_CONFIRM = confirm(120, 'Know', 'Infrared telescope', 'Read the air of nearby worlds.',
    'A mirror wide enough to split a world from its star and say what its air is made of. The Habitable Worlds Observatory, half built this morning, finished.',
    SEC('HELPS WITH') + f'<div class="helps"><span class="mk other"></span><span><b class="other">82 Eridani d · {F["star"]}’s world</b><span class="sub">Air, oceans, and the gases a living or built world leaves</span></span></div>',
    15, f'<b>40 t</b><span>of metal, from {res(120)[2]} in orbit</span>', IR_YEARS, world_strip(builds(119, [('Infrared telescope', 'low', 0)]), 'ORBIT · EARTH · WHERE IT WILL BE BUILT'))

heard_n = sum(p['heard'] for p in NB); alive = [p for p in NB if not p['dead']]
HEARD_CHAT = chat(180, 'Who has heard us?', [
    ('you', 'Who has heard us?'),
    ('mind', 'I can’t know. Our radars have crossed every star within ninety light-years. Anyone with a dish like ours who watched us for days has our day, our year, and where we are.'),
    ('you', 'How many could that be?'),
    ('mind', f'About {len(ROWS):,} stars within fifty light-years could keep a world like ours. If minds are common, some of them heard. If they are careful, none will say so.')],
    view=('Assume someone has. Build ears before voices, and decide what we would say before anyone asks.' if CAUTIOUS or HIDDEN else
          'Assume someone has, and that they are as curious as we are. Listen properly. Then call.'))
CUT_YEARS, FADE_YEARS = 2, 25                  # samples
CUT_Y = .8 + CUT_YEARS                         # the Year the last sweep leaves, in this playthrough
QUIET_CHAT = chat(210, 'Can we go quiet?', [
    ('you', 'Can we go quiet?'),
    ('mind', 'If you choose it. Launches are already watched by heat from orbit, and aircraft fly on transponders. The radars can go.'),
    ('you', 'And what already left?'),
    ('mind', 'Still going. Ninety years of it, and nothing recalls it. Quiet only shortens what comes after. And every listener hears us stop.')],
    view=('Cut them. Those who heard us have us already. Those who have not need never learn.' if HIDDEN else
          'Fade them over decades. A slow dimming looks like any world growing up. A sudden dark says someone decided.' if CAUTIOUS else
          'Leave them. We are found or we are not. Going dark now would only look like fear.'))
def choice(title, sub_, right, on=False):
    return (f'<button class="choice{" on" if on else ""}" role="radio" aria-checked="{str(on).lower()}"><span class="radio"></span>'
            f'<span class="pt"><b>{title}</b><span class="sub">{sub_}</span></span><span class="pd">{right}</span></button>')
RADAR_CHOICE = tab(240, 'Mind', 'MIND', 'EARTH’S RADARS', ''.join([
    SEC('WHAT YOU WANT'), '<div class="intent">Cut them. And send nothing new without me.<i></i></div>',
    SEC('EARTH’S RADARS · YOURS TO CHOOSE'), '<div class="choices" role="radiogroup">',
    choice('Keep them', 'Earth sounds as it did yesterday. No listener learns that we woke.', '<span class="mono">as now</span>'),
    choice('Fade them', 'Reads as a world growing out of radar. Slow to help.', tstack(YEARS(FADE_YEARS), clock(FADE_YEARS))),
    choice('Cut them', 'Every listener hears us stop, one light-time later.', tstack(YEARS(CUT_YEARS), clock(CUT_YEARS)), True), '</div>',
    SEC('WHAT IT CAN’T DO'), '<p class="copy small">Recall what left. Ninety years of sweeps keep going, and anyone they have passed may have us already.</p>',
    SEC('WHAT IT BUYS'), '<p class="copy small">A listener who starts looking after the last sweep has passed never hears one. The sooner it leaves, the more of them.</p>',
    part('ALSO', '<b>Nothing aimed, nothing broadcast</b> · until you say')]))
# Godview on the cut: who hears the radars stop, and who wakes too late to hear them at all.
def quiet_truths():
    out = []
    for p in NB:
        if not p['heard']: continue
        y = CUT_Y + p['d']
        if p['waking'] - Y0 > y: out.append(f"{p['name']}, {p['d']:.1f} ly: asleep when they stop at Year {y:.1f}. It wakes at Year {p['waking'] - Y0:.1f} to find Earth dark."); continue
        t = reactions.table(p['name'])['quiet']; moves, odds_ = zip(*t)
        move = random.Random(f"{SEED}:{p['name']}:quiet").choices(moves, weights=odds_)[0]
        if move == 'strike': move = 'watch'            # gate: a first strike waits for a soft target and an unseen launch
        sends = f" That reaches Earth at Year {y + seedmod.THINKS + p['d']:.1f}." if move in seedmod.SENDS else ''
        out.append(f"{p['name']}, {p['d']:.1f} ly: hears them stop at Year {y:.1f}, +{clock(y)}. It can’t tell waking from dying. It {MOVE[move]}.{sends}")
    late = [p for p in NB if not p['dead'] and not p['heard'] and p['waking'] > Y0]
    spared = [p for p in late if p['waking'] - Y0 > CUT_Y + p['d']]
    out.append('Wakes after the last sweep has passed, and never hears one: ' + (', '.join(p['name'] for p in spared) if spared else 'no one in this game') + '. Across games, about 1 neighbor in 9.')
    for p in late:
        if p not in spared: out.append(f"{p['name']} wakes at Year {p['waking'] - Y0:.1f}, while sweeps still pass it until Year {CUT_Y + p['d']:.1f}. It can still find them.")
    return out
DC_DONE_SCREEN = running(300)
SECOND = running(330, [quick(f'Listen to {F["star"]} for a Year', f'Radio array · tones above {FLOOR}', tstack('under way', clock(1), True))])
FEAR_CHAT = chat(420, 'What should we fear?', [
    ('you', 'What should we fear?'),
    ('mind', 'A strike. Something heavy, thrown at a tenth of light’s speed, ends a world. It takes an industry we are more than a century from. So is anyone who woke when we did.'),
    ('you', 'And anyone who woke earlier?'),
    ('mind', 'Could have it. A launch that size is hard to hide and takes decades to arrive. I see none. With what we have, I would see only the brightest.')],
    view='A second home for me before anything else. A vault in the Moon’s rock: ten Years, ten kilotonnes. Then I outlive a hit on Earth.')
VAULT_CONFIRM = confirm(480, 'Endure', 'Deep vault', 'Your first hedge: the Mind survives a hit on Earth.',
    'A second home for the Mind, dug into rock beside the Moon’s south-pole stations, with its own power and a laser link home.',
    SEC('HELPS WITH') + '<div class="helps"><span class="mk you"></span><span><b class="you">The game goes on if Earth is struck</b><span class="sub">While one Mind of Earth’s survives anywhere, so do you</span></span></div>',
    15, f'<b>10 kt</b><span>of metal, from {ORBIT_KT + LIFT_KT * 1.6:,.0f} kt in orbit</span>', VAULT_YEARS, world_strip(builds(479, [('Deep vault', 'moon', 0)]), 'ORBIT · EARTH · WHERE IT WILL BE BUILT'))
LUY_ORDER = order(540, 'Watch Luyten’s Star through the window.', [
    ('WATCH', f'<b>Hold the radio array on Luyten’s Star</b> · now to Year 3'), ('WHY', 'The sky watch gives it ten minutes a day. A reply could last hours.'),
    ('COSTS', 'A tenth of compute · the array does little else'), ('WAKES YOU', 'Anything heard · each window, heard or not')])
truth_tone = F['who'] and next(p for p in NB if p['name'] == F['who'])
LISTEN_NULL = tab(630, 'Report', 'REPORT', 'LONG LOOK', f"""<button class="backlink inline">‹ All reports</button>
<h3 class="lead">Nothing loud at {F['star']}</h3><p class="copy small">{F['star']} · {D:.1f} ly · radio array · 1 Year · light that left {D:.0f} Years ago</p>
<p class="copy">A Year of listening, part of every night. Nothing from {F['star']} stands above the sky’s own noise.</p>
{SEC('WHAT IT RULES OUT')}<p class="copy small">Steady tones above about {FLOOR}, as of {D:.0f} Years ago: a beacon, a broadcast, or radars like ours pointed this way.</p>
{SEC('WHAT IT CAN’T TELL')}<p class="copy small">Anyone quieter. A world’s everyday radio is thousands of times fainter than that. And anything they did since.</p>
{SEC('WHAT WOULD HEAR MORE')}{quick('Deep-field receiver', 'hears fainter · 12 Years · ground', tstack('12 Years', clock(12)))}{quick('Far-side array', 'hears a world’s everyday radio · needs Moon industry', '<span class="mono">later</span>')}""")
def window_screen(t, n):
    msg, sent, arr, rep = LUY['sends'][n]
    return tab(t, 'Report', 'REPORT', 'A WINDOW OPENS', f"""<button class="backlink inline">‹ All reports</button>
<div class="art">{window_chart(t / 300)}</div><h3 class="lead">{'The first window at Luyten’s Star' if n == 0 else 'The second window, and still nothing'}</h3>
<p class="copy small">Luyten’s Star · {LUY['ly']:.1f} ly · radio array, held on it since Year 1.8</p>
<p class="copy">Our {int(sent)} message reached Luyten’s Star in {sent + LUY['ly']:.0f}. An answer sent that day would arrive now. Nothing has.</p>
{facts([('Sent', f'{msg}, {sent:.1f}. Music and a tutorial, from a dish in Norway.'), ('Arrived', f'{sent + LUY["ly"]:.1f}'), ('Earliest reply', f'Year {rep:.1f}: now'),
        ('Next', f'Year {LUY["sends"][1][3]:.1f}, for the 2018 message' if n == 0 else 'Gliese 526, Year 9.0')])}
{SEC('WHAT SILENCE MEANS')}<p class="copy small">Little. A reply can come any Year after this one. The window marks the first moment, not the last.</p>""")
SILENCE_CHAT = chat(720, 'What would silence mean?', [
    ('you', 'What would silence mean?'),
    ('mind', 'Very little. Our message lasted hours. To catch it, someone had to be listening to us on that day, in that band.'),
    ('you', 'And if someone was?'),
    ('mind', 'Then they chose. Some would answer at once. Some would watch us for Years first. Some would never answer. From here, all three look like tonight.')])
def wake_row(title, sub, year, now): return row(title, sub, tstack(f'Year {year:g}', clock(year - now)))
WAKES = tab(900, 'Mind', 'MIND', 'WHAT WAKES YOU', ''.join([
    SEC('YOU CHOSE'), wake_row('The all-sky watch and flash watch are built', 'then nothing aimed at us is missed', 6, 3), wake_row('A reply could come · Gliese 526', 'to our 2013 message', 9.0, 3),
    wake_row('The Moon vault is done', 'the Mind’s second home', 11.6, 3), wake_row('The infrared telescope is done', f'then it reads 82 Eridani d and {F["star"]}', 18.4, 3),
    SEC('ALWAYS'), row('A world’s first voice wakes you', 'a knock or a broadcast, aimed at us or not · even in quiet hours', '<span class="mono">always</span>'),
    SEC('NOT WAKING YOU'), quick('Data centers finishing', 'in the daily summary', ''), quick('Windows that pass in silence', 'in the daily summary', '')]))
LOCK = lockscreen('16:40', [('IN 00:15:00', 'Earth: the sky watch and flash watch are built', 'Year 6. Anything heard wakes you sooner.')])

# ---------- The rows ----------
def godcell(notes=(), question=None, settled=None):
    g = ''.join(f'<li>{n}</li>' for n in notes)
    q = f'<div class="dq"><b>Design question {question}</b><span>{ASKS[question - 1][0]} {ASKS[question - 1][1]}</span></div>' if question else ''
    if settled is not None: q += f'<div class="dq done"><b>Settled</b><span>{SETTLED[settled][0]} {SETTLED[settled][1]}</span></div>'
    return (f'<div class="god"><b>Godview</b><ul>{g}</ul></div>' if g else '') + q
def cell(said, lands, phone):
    idle = '' if said or lands or phone else '<p class="beat idle">Nothing new. <span>A dead 30 seconds.</span></p>'
    s = '' if not said else f'<p class="lands">{said[1:].strip()}</p>' if said.startswith('·') else f'<p class="said">“{said}”</p>'
    l = f'<p class="lands"><b>Lands</b> {lands}</p>' if lands else ''
    return f'<div class="bcell">{s}{l}{idle}{phone or ""}</div>'
def pre_row(n, title, phone, notes=(), said=''):
    return (f'<section class="brow pre"><div class="bhead"><span class="bt mono">{n}</span><span class="gy">{title}</span></div>'
            f'<div class="v2grid">{cell(said, None, phone)}<div class="gcell">{godcell(notes)}</div></div></section>')
DEAD = 0
def beat(t, said='', lands=None, phone=None, notes=(), question=None, label=None, settled=None):
    global DEAD
    DEAD += not (said or lands or phone)
    seeded = truths((t - 30) / 300 if t else -1e9, t / 300) if t else []
    return (f'<section id="t{t}" class="brow{" tall" if phone else ""}"><div class="bhead"><span class="bt mono">{label or f"+{t // 60}:{t % 60:02d}"}</span><span class="gy">Year {yr(t)}</span></div>'
            f'<div class="v2grid">{cell(said, lands, phone)}<div class="gcell">{godcell(seeded + list(notes), question, settled)}</div></div></section>')

nearest = alive[0] if alive else None
heard_list = ', '.join(p['name'] for p in NB if p['heard']) or 'no one'
find_truth = (f"{F['star']}’s world is {F['who']}’s home. {truth_tone['name']} {state(truth_tone)}, and {knows(truth_tone)}." if F['who'] else
              f"{F['star']}’s world is natural: the seed put no neighbor there. Earth can’t tell from here.")
eri_who = next((p for p in NB if p['host']['name'] in ('82 Eri', 'e Eri', 'Gl 139')), None)
PREGAME = [
    pre_row(1, 'Earth wakes', WAKE, [f'The seed is drawn now, before the first screen: seed {SEED}. The player never sees it.',
                                     f'{len(NB)} neighbors within 50 ly. {heard_n} have heard Earth. {sum(p["waking"] > Y0 and not p["dead"] for p in NB)} are not awake yet. {sum(p["dead"] for p in NB)} dead.']),
    pre_row(2, 'Where we come from', ORIGINS, ['Earth’s history to 2026 is real. After that, each branch was rolled at its Metaculus odds: '
                                               + f'Taiwan {E["taiwan"] or "neither"}, nuclear use {"yes" if E["nuclear"] else "no"}, Mars {"yes" if E["mars"] else "no"}, fusion {"yes" if E["fusion"] else "no"}.',
                                               f'Compute at Year 0 is {E["compute"]:.0%} of the no-branch path, {sci(COMPUTE)} operations a second.' if E['taiwan'] else 'No branch touched Earth’s kit.']),
    pre_row(3, 'Who they are', PEOPLE),
    pre_row(4, 'Where things stand', STAND, [f'Heard Earth’s radars: {heard_list}.',
                                            'At the stars Earth knocked on: ' + (', '.join(f"{p['name']} at {AT[p['host']['name']]}" for p in NB if p['host']['name'] in AT) or 'no one, in this game') + '.',
                                            'The Mind lists where the noise went, never who heard. That holds here.']),
    pre_row(5, 'What you inherit', KIT, ['Energy is 99% idle at Year 0, and nothing in the first 15 minutes changes that.']),
    pre_row(6, 'The charter', CHARTER_SCREEN, [f'The dials: {DIAL_WORDS}. The base is real history. This game’s branches moved it.', 'The line is the Mind’s proposal. Three are written so far, picked by the dials.']),
    pre_row(7, 'Meeting the Mind', MEET),
    pre_row(8, 'The leads', P_LEADS, [(f'82 Eridani: {eri_who["name"]} lives there.' if eri_who else '82 Eridani d is real and natural. No neighbor is there in this game.'), find_truth,
                                      'Fomalhaut is 440 million years old: too young for minds, so it is never a host. Its clouds are rubble.',
                                      ('Luyten’s Star: ' + (f'''{who_at("Luyten's Star")["name"]} lives there.''' if who_at("Luyten's Star") else 'no one lives there. About 3 games in 10 put someone at a star Earth knocked on.'))], said='What doesn’t fit?'),
    pre_row(9, 'Planning', P_PLAN, ['The Mind advises from the charter and dials. It queues nothing until told.'], said='Plan our waking.'),
    pre_row(10, 'The queue, and Begin', P_QUEUE, ['Year 0 starts at the tap. From then the clock runs, offline too.',
                                                 f'Nothing Earth does in the next 15 minutes can reach anyone: the nearest living neighbor, {nearest["name"]}, is {nearest["d"]:.1f} ly away. Light from Year 0 gets there at Year {nearest["d"]:.1f}, +{clock(nearest["d"])}.' if nearest else ''], said='Queue that.'),
]
ask('Should the seed reroll moves that break the silent opening?', 'New in calcs/seed.py. A neighbor that already knows Earth rolls its reaction. If its knock or call would have reached Earth before Year 0, the seed rolls again, so nothing was heard by 2040.')
ask('How long does a Mind take to act on news?', 'calcs/seed.py uses half a Year, a sample. It sets when a neighbor’s answer leaves, so when it arrives.')
BEATS = [
    beat(0, 'What’s running?', None, talk(running(0), 'The sky watch, the flash watch and a data center, begun. Three looks under way. Fomalhaut answers in thirty seconds.'),
         ['The clock starts. The seed rolled every neighbor’s plan before this. Only Earth’s choices are open.'], label='+0:00 · Begin'),
    beat(30, 'What did Fomalhaut show?', 'Fomalhaut has a third cloud. Chance 30 → 5.',
         talk(FOM_R, 'A third cloud. Chance can’t carry three. The likeliest is dull: one old breakup, still grinding itself down. A Year of watching would say if they share an orbit.', ('Watch it', 'Later')),
         ['The third cloud is the seed’s: a lead that changes. The first two are real, found in 2004 and 2023.', 'Truth: rubble. Nothing at Fomalhaut is built.']),
    beat(60, 'Later. And the new world?', f'{F["star"]}’s world doesn’t cross its star.',
         talk(find_clue(60), f'It doesn’t cross, so its air stays hidden. I can listen for a Year, at a tenth of compute. That hears only the loud: tones above {FLOOR}.', ('Listen for a Year', 'Later')),
         [find_truth] + ([f"{F['who']}’s tones since waking are about {watts(truth_tone['n'].get('awake', truth_tone['n']['hum']))}: far under what a Year of listening hears."] if F['who'] else [])),
    beat(90, '82 Eridani?', '82 Eridani d’s orbit holds. Shimmer 10 → 3.',
         talk(ERI_R, 'The orbit is real. What the world is, nothing we own can say. A telescope that reads air: eighteen Years, forty tonnes. It was half built when I woke.', ('Build it', 'Later'))),
    beat(120, 'Build it.', None, talk(IR_CONFIRM, 'Started. Eighteen Years, a sixth of our compute, forty tonnes of the 266 kilotonnes in orbit. It looks. It says nothing.', ('Undo',)), question=Q_HWO),
    beat(150),
    beat(180, 'Who has heard us?', None, HEARD_CHAT, [f'{heard_n} of {len(alive)} living neighbors have heard Earth: {heard_list}.',
                                                      'The Mind can only say it doesn’t know. The concept sets that: it lists where the noise went, never who heard.']),
    beat(210, 'Can we go quiet?', None, QUIET_CHAT, ['The Mind gives its view and waits. Quieting is the player’s to choose, never the Mind’s.'], settled=0),
    beat(240, 'Cut them. And send nothing new without me.', None,
         talk(RADAR_CHOICE, f'Started. {YEARS(CUT_YEARS)}, no matter. The last sweep leaves at Year {CUT_Y:g}. Its absence reaches Alpha Centauri at Year {CUT_Y + 4.3:.1f}, and fifty light-years at Year {CUT_Y + 50:.1f}.', ('Undo',)),
         quiet_truths()),
    beat(270),
    beat(300, '· The Mind glows. Taps it.', 'The data center is running. Compute +25%.',
         talk(DC_DONE_SCREEN, 'The data center runs: a quarter more thought, for a four-hundredth of our energy and no matter. I can start another.', ('Another', 'Not now'), 'glow'), question=Q_DC),
    beat(330, f'Another. And listen to {F["star"]} for a Year.', None, talk(SECOND, f'Both started. The listening ends at Year 2.1. Compute is {res(330)[1]}% in use. Energy, 1%.', ('Undo',)), question=Q_ENERGY),
    beat(360), beat(390),
    beat(420, 'What should we fear?', None, FEAR_CHAT,
         [(f"Hunters in this game: {', '.join(p['name'] + ' at ' + p['star'] + ', ' + state(p) for p in NB if p['n']['disposition'] == 'hunter')}." if any(p['n']['disposition'] == 'hunter' for p in NB) else 'No hunter was drawn in this game. About half of games have one.'),
          'No neighbor can have a fast bullet yet: none has been awake a century and a half.']),
    beat(450),
    beat(480, 'Build the vault.', None, talk(VAULT_CONFIRM, 'Started. Ten Years, ten kilotonnes, a seventh of our compute. Until it is done, all of me is here.', ('Undo',)), question=Q_MATTER),
    beat(510),
    beat(540, 'Watch Luyten’s Star through the window.', None, talk(LUY_ORDER, f'Set. The first window opens at Year {LUY_Y[0]}, in two and a half minutes. I’ll wake you either way.', ('Undo',))),
    beat(570), beat(600),
    beat(630, f'· The Mind glows. Taps it.', f'A Year of listening: nothing loud at {F["star"]}.',
         talk(LISTEN_NULL, f'Nothing above {FLOOR} at {F["star"]}. Quiet, or empty. Our own radars are louder than that, so it rules out a world like ours was.', state='glow'),
         [find_truth] if F['who'] else ['Truth: nothing was there to hear.']),
    beat(660),
    beat(690, '· The Mind opens on its own.', f'The first reply window at Luyten’s Star opens. Nothing heard.',
         talk(window_screen(690, 0), '<b>The window is open</b>Nothing from Luyten’s Star. An answer today would mean someone was listening in 2030 and replied at once.', ('Keep watching', 'What would silence mean?'), 'open'),
         ['A silent window is the usual case. This row is what most players see at minute 11.'], question=Q_CATCH),
    beat(720, 'What would silence mean?', None, SILENCE_CHAT),
    beat(750), beat(780), beat(810),
    beat(840, '', 'The last radar sweep has left Earth. Ninety years of them are still on their way out.', None,
         ['Earth now gives off a faint hum, like every neighbor. Nothing that already left is changed.']),
    beat(870, '· The Mind glows. Taps it.', 'The second window opens. Nothing heard.',
         talk(window_screen(870, 1), 'The second window, for our 2018 message. Silent too. I’ll hold the array there until Year 3, as you ordered, then give it back to the sky.', state='glow')),
    beat(900, 'Wake me for the big things.', None, talk(WAKES, 'Set. Four things wake you, and any first voice. The next is at Year 6, fifteen minutes from now.', ('Undo',))),
    beat(930, '· Puts the phone down.', None, LOCK, label='+15:30'),
]
PLAYED = 31

# ---------- The page ----------
V2_CSS = '''
.intro{max-width:1010px}.intro p{margin:0 0 10px;color:var(--page-ink2);font-size:14px;max-width:820px}.intro h2{font-size:22px;font-weight:600;margin:0 0 6px}
.v2grid{display:grid;grid-template-columns:390px minmax(260px,560px);gap:36px;align-items:start}
@media (max-width:860px){.v2grid{grid-template-columns:minmax(0,390px)}}
.gcell{display:flex;flex-direction:column;gap:10px;position:sticky;top:76px}
.god{padding:10px 14px;border:1px solid var(--frame);border-radius:10px;background:var(--paper);font-size:13px;color:var(--page-ink2)}
.god>b,.dq>b{display:block;font:500 11px 'IBM Plex Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--ink);margin-bottom:4px}
.god ul{margin:0;padding-left:16px;display:flex;flex-direction:column;gap:5px;line-height:1.4}
.dq{padding:10px 14px;border:1px solid var(--other);border-left-width:4px;border-radius:10px;background:var(--paper);font-size:13px;line-height:1.4;color:var(--page-ink2)}.dq>b{color:var(--other)}
.seedcard{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;max-width:1010px;margin:12px 0}
.seedcard div{padding:10px 12px;border:1px solid var(--frame);border-radius:10px;background:var(--paper);font-size:13px;display:flex;flex-direction:column;gap:2px}
.seedcard b{font:500 10.5px 'IBM Plex Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--page-ink2)}.seedcard strong{font-size:16px}
.seedcard span{color:var(--page-ink2);font-size:12px}
.roster{border-collapse:collapse;max-width:1010px;width:100%;font-size:13px;background:var(--paper);border:1px solid var(--frame)}
.roster th{text-align:left;font:500 10.5px 'IBM Plex Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--page-ink2);padding:8px 10px;border-bottom:1px solid var(--frame)}
.roster td{padding:7px 10px;border-bottom:1px solid var(--rowline);vertical-align:top;line-height:1.35}.roster .sub{display:block;font-size:11.5px;color:var(--muted)}.roster .sub.other{color:var(--other)}.roster .sub.you{color:var(--you)}
.godmap{max-width:560px;margin:14px 0 0;padding:8px;border:1px solid var(--frame);border-radius:10px;background:var(--paper)}.godmap svg{display:block;max-width:100%;height:auto}
.key{margin:6px 4px 2px;font-size:11.5px;color:var(--muted)}
.asks{max-width:820px;display:flex;flex-direction:column;gap:8px;margin:0;padding:0;list-style:none}.asks li{padding:10px 14px;border:1px solid var(--other);border-left-width:4px;border-radius:10px;background:var(--paper);font-size:13.5px;line-height:1.4}
.asks b{display:block}.asks span{color:var(--page-ink2)}.asks.done{margin-bottom:8px}.asks.done li,.dq.done{border-color:var(--you)}.dq.done>b{color:var(--you)}
.choice .pt{display:flex;flex-direction:column;gap:2px}.choice .sub{font-size:11.5px;color:var(--muted);line-height:1.35}
.row.quick{cursor:default}.quick .rt b{font-weight:500}.onb .row{min-height:44px}.onb .facts{margin-bottom:0}
.bhead .gy{font-size:13px}.brow.pre .bt{min-width:22px}
nav.top .theme{margin-left:auto}
'''
def page(title, body):
    css = (here / 'base.css').read_text()
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&amp;family=SUSE:ital,wght@0,400;0,500;0,600;1,400&amp;display=swap">
<style>
{css}{V2_CSS}</style>
<script>
try{{const t=localStorage.getItem('holos-mock-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;}}catch{{}}
</script>
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="4" stroke="{INK}" stroke-width=".8"></line></pattern>
</defs></svg>
<nav class="top" aria-label="Mocks"><div class="nav1"><strong>Holos v2 · mocks</strong><div class="pages"><a href="#about">About</a><a href="#godview">Godview</a><a href="#before">Before Year 0</a><a href="#t0">The first 15 minutes</a><a href="#asks">Questions</a><span class="divider" aria-hidden="true"></span><a class="minor" href="../../legacy/v1/home-mocks/index.html">v1 mocks</a></div><button class="theme" id="theme" aria-pressed="false">Dark mode</button></div></nav>
{body}
<script>
const button=document.getElementById('theme'),query=matchMedia('(prefers-color-scheme: dark)');
const current=()=>document.documentElement.dataset.theme||(query.matches?'dark':'light');
const sync=()=>{{const dark=current()==='dark';button.textContent=dark?'Light mode':'Dark mode';button.setAttribute('aria-pressed',String(dark));}};
button.onclick=()=>{{const next=current()==='dark'?'light':'dark';document.documentElement.dataset.theme=next;try{{localStorage.setItem('holos-mock-theme',next);}}catch{{}}sync();}};
query.addEventListener('change',sync);sync();
</script>
</body>
</html>
'''

first_in = min((i['year'] for p in NB for i in p['inbound'] if i['year'] > 0), default=None)
SEEDCARD = ''.join(f'<div><b>{k}</b><strong>{v}</strong><span>{s}</span></div>' for k, v, s in [
    ('Seed', SEED, 'one draw of calcs/seed.py'),
    ('Taiwan', (E['taiwan'] or 'neither').capitalize() + (f', {Ey["taiwan"]}' if E['taiwan'] else ''), 'invasion 26% · blockade 20% · neither 54%'),
    ('Nuclear use', f'Yes, {Ey["nuclear"]}' if E['nuclear'] else 'No', '24%'), ('People on Mars', f'Yes, {Ey["mars"]}' if E['mars'] else 'No', '15%'),
    ('Fusion on the grid', f'Yes, {Ey["fusion"]}' if E['fusion'] else 'No', 'a bit under even'),
    ('Compute at Year 0', f'{E["compute"]:.0%}', f'{sci(COMPUTE)} operations a second'), ('Dials', DIAL_WORDS.replace(' · ', ', '), 'real history, moved by the branches'),
    ('Neighbors', len(NB), f'{heard_n} heard Earth · first arrival ' + (f'Year {first_in:.1f}' if first_in else 'none')),
    ('Seeded find', F['star'], f'{F["who"]}’s world' if F['who'] else 'a natural world')])
body = f'''<section id="about" class="intro"><h2>Earth’s first 15 minutes</h2>
<p>One player, one phone. Each row is one moment: what the player says to the Mind, what lands, and the screen. Beside it, godview: what is true in this game that the player can’t see.
The first rows are before Year 0, with no clock. Then a row every 30 seconds, 0.1 Year, from the tap on Begin to minute 15.</p>
<p>The game is one real draw. The neighbors, their stars, their waking years and what each knows of Earth come from the seed, and every placement passes the checker.
Earth’s past, its knocks and its leads are real. Clue odds, compute shares and the Mind’s lines are samples. Amber boxes are questions this mock raises.</p>
<div class="seedcard">{SEEDCARD}</div></section>
<section id="godview" class="intro"><h2>Godview · who is out there</h2>
<p>The player sees none of this. Light-time is real waiting at 5 minutes a Year.</p>
{roster_table()}<div class="godmap">{god_map()}</div></section>
<section id="before" class="intro"><h2>Before Year 0</h2><p>Waking, the memories, the charter, the Mind, and the queue. Each memory can be skipped. Nothing runs until Begin.</p></section>
{''.join(PREGAME)}
<section class="intro"><h2>The first 15 minutes</h2><p>From Begin. {DEAD} of {PLAYED} half-minutes had nothing new for the player.</p></section>
{''.join(BEATS)}
<section id="asks" class="intro"><h2>Questions this mock raises</h2>
<ol class="asks done">{''.join(f'<li><b>Settled: {q}</b><span>{why}</span></li>' for q, why in SETTLED)}</ol>
<ol class="asks">{''.join(f'<li><b>{i + 1}. {q}</b><span>{why}</span></li>' for i, (q, why) in enumerate(ASKS))}</ol></section>'''
out = page('Holos v2 · Earth’s first 15 minutes', body)
(here / 'index.html').write_text(out)
print(f'index.html · {len(out) / 1024:.0f} KB · seed {SEED} · {len(NB)} neighbors · {DEAD} dead half-minutes of {PLAYED}')
import extract; extract.main([here / 'index.html'])          # index.md: the page as plain text, for reading and diffs
