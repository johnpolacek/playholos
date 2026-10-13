"""Holos v2 mock: Earth's first hour. One phone, with a godview lane. Writes index.html beside this file.
Run: python3 explorations/v2-mocks/build.py [seed]

Each row is one moment: what the player says, what lands, and the phone. Beside it, godview: what is true in this
game that the player can't see. The game is one draw of calcs/seed.py. Prices are HOLOS_PROJECT_AUDIT.md's.
Odds on clue screens, compute shares and the Mind's lines are samples, to be tested here.
"""
from kit import *

F, D = FIND, FIND['d']
F2 = FINDS[1] if len(FINDS) > 1 else None          # the next nearest world Earth has felt, if it holds more than one
FLOOR = watts(year_floor(D))
YEARS = lambda y: f'{y:g} {"Year" if y == 1 else "Years"}'
ASKS = []          # design questions the mock raises, in the order the timeline raises them
def ask(q, why): ASKS.append((q, why)); return len(ASKS)
SETTLED = [('Does a half-built real instrument cost fewer Years?', 'It costs what its real schedule leaves: about 8 Years for the Habitable Worlds Observatory. Build times are standard, from the science, and the player can invest in projects that build faster. A speed-up also shortens the part left of a work under way. Settled 2026-10-10 and 10-11.'),
           ('Can the Will quiet Earth’s radars?', 'Yes, if the player chooses: keep them, fade them over about 25 Years, or cut them in about 2. What has left keeps going. Settled 2026-10-10.'),
           ('What stops a data center every Year?', 'Chips set the pace: the fabs fill one a Year, each +50% compute. Energy sets the ceiling, near a hundredfold. Settled 2026-10-10.'),
           ('What is energy for, early?', 'Thought. Each data center draws its share, and the twelfth would need more than Earth has. Settled 2026-10-10, by the rule above.'),
           ('Is matter meant to be free early?', 'No. Matter is only what is spare in orbit: about 20 kt at Year 0. Working satellites don’t count. Settled 2026-10-10.'),
           ('What does Year 0’s kit catch?', 'Physics decides: the star’s place in the sky, the hours looked, and loudness. Year 0’s sky watch catches about 1 early signal in 5. A sender that hears nothing tries again, and the player can spend more on ears. Settled 2026-10-10.'),
           ('What happened to knocks that arrived before Year 0?', 'They happened, and Earth missed them. Only a knock Earth would have caught is rolled again. The sender, unanswered, may try again. Nothing was recorded, so no archive holds them. Settled 2026-10-10.'),
           ('Is all of Earth’s lift spare?', 'No. About 15 kt a Year is spare of 40. The rest keeps Earth’s craft flying. The player can spend to raise it: a launch complex adds 40 kt a Year. Settled 2026-10-10.'),
           ('How long does a Mind take to act on news?', 'Its Cautious or Bold dial sets it: a tenth of a Year if strongly Bold, a quarter if it leans Bold, a Year if it leans Cautious, two if strongly Cautious. Settled 2026-10-11.'),
           ('What fills the quiet half-minutes?', 'Findings from the Mind’s studies, readings from observations, and Earth’s old messages reaching their stars. Something real lands about every minute for the first 15. Settled 2026-10-12.'),
           ('How do studies run?', 'On their own. The Mind works through the data it holds, and thought is their budget: more of it means faster findings and less left for builds. An observation is still the player’s to order. Settled 2026-10-13.'),
           ('What is a search?', 'A standing order for an idle instrument. Each has a sweep it falls back to: the player sets it once, and any observation interrupts it. A search returns candidates. Settled 2026-10-13.'),
           ('What is an inquiry?', 'A mission that goes to find out: a sail swarm, a flyby probe, a sentinel. Probe stays the name of the craft. What comes home is a dispatch. Settled 2026-10-13.'),
           ('What sets how long an observation takes?', 'Physics. A nearer or larger world is brighter, so its reading comes sooner: hours at Alpha Centauri, days at 82 Eridani. A world too close to its star in our sky can’t be read at all. Seasons are left out for now. Settled 2026-10-13.'),
           ('What does the first sweep find?', 'Natural warm worlds too, at the real rate: NASA’s planning value, about one star in four. The seed draws them. A first pass shows about 17 points of light a game, and about 1 in 4 is a home. Settled 2026-10-13.'),
           ('How high can a natural world climb?', 'To animals and forests. Alive is a ladder: bare rock, a lifeless sea, hidden microbes, an oxygen world, animals. Every mind, living or dead, stays hand-written. Settled 2026-10-13.'),
           ('What sets each natural world’s rung?', 'Its star’s age, on Earth’s schedule with scatter: lasting oxygen at about 2.3 billion years, animals at about 4. Physics sets whether it kept its air. At Sun-like stars about half are alive. At red dwarfs most are bare rock. Settled 2026-10-13.'),
           ('Whose odds does the Mind show?', 'None, as numbers. The Mind gives its judgment in words: seven of them, from almost no chance to almost certain. A report shows the word now, and the word before if it moved. Settled 2026-10-13.'),
           ('What stands behind the Mind’s words?', 'What Earth knows. The Mind judges from Earth’s science and from what Earth has observed, never from the seed, and it can be wrong. Earth’s own finds move its starting words: a first voice lifts Minds a word at every candidate. Settled 2026-10-13.'),
           ('How fast does a living neighbor become known?', 'As fast as physics allows, and no faster. Each sign of minds needs its real instrument: everyday radio a far-side array, smog a mirror of about 15 m. The first telescope reads smog only within about 12 light-years, and smog is not proof. Going is the surest way. Settled 2026-10-13.'),
           ('Can the first telescope tell a dead civilization from a volcano?', 'No. It reads the strange air and not its cause. Burned carbon stays for thousands of years, smog clears, and the gases only industry makes show in the mid-infrared. Proof needs an infrared interferometer, or going. Settled 2026-10-13.'),
           ('Should seasons set when an observation can start?', 'No. A real space telescope can’t point near the Sun, so each star is out of reach for part of every year. The game skips that limit on purpose: it would delay a reading by 75 seconds at most, and change no decision. Settled 2026-10-13.'),
           ('At Year 0, how many of its felt worlds does Earth show?', 'All of them, and the Mind leads with one: the nearest, a rule that uses nothing the seed knows. Earth holds two to four felt worlds in 6 games of 10, and in about half of games none is a home. Settled 2026-10-13.'),
           ('A first voice, a living world and a dead world in one hour: too much, too soon?', 'No. The seed decides, and nothing damps it. All three land in one first hour in 3 games of 400, and none of them in 4 games of 10. This game was picked to show every screen. Settled 2026-10-13.'),
           ('What is matter for in the first hour?', 'Little, and the Mind says so. Real instruments and probes weigh tonnes, and Earth lifts 55,000 a Year, so matter piles up. The works that need it need megatonnes, and those must come from the Moon or the belt. The choice in hour one is when to start that road. Settled 2026-10-13.'),
           ('What happens at the grid limit?', 'The plateau stands. Thought stops growing when it draws the whole grid, about Year 11 at full pace, and better chips don’t dodge it: today’s kind reaches its efficiency ceiling near Year 0. The Mind warns five Years ahead. The ways on are slow, and the megatonne road pays here. Settled 2026-10-13.')]

# ---------- Godview: who is out there ----------
MOVE = reactions.MOVES
def state(p):
    if p['dead']: return f"died {p['died']:.0f}"
    w = p['waking']
    return f"awake {Y0 - w:.0f} Year{'' if round(Y0 - w) == 1 else 's'}" if w < Y0 else f'wakes Year {w - Y0:.1f} · +{clock(w - Y0)}'
def knows(p):
    if p['dead']: return 'dead before Year 0'
    if not p['heard']: return 'has not heard Earth'
    out = f"heard Earth’s radars from {p['heard_since']:.0f}"
    if p['n']['character'] == 'listener': out += ', and mapped its day and orbit'
    return out
def unheard(p):
    if not p['unheard']: return ''
    years = sorted({f"{u['arrived']:.0f}" for u in p['unheard']})
    a = p['after_silence']
    then = '' if not a else (f" If still unanswered at Year {a['at'] - Y0:.1f}, it {MOVE[a['move']]}." if a['at'] > Y0 else f" Unanswered by {a['at']:.0f}, it {MOVE[a['move']]}.")
    return f"Its knock reached Earth in {' and '.join(years)}. No one was listening.{then}"
def does(p):
    if not p['heard']: return ''
    return (f"{MOVE[p['on_hum']]}" if p['knows'] <= Y0 else f"at waking: {MOVE[p['on_hum']]}")
def inbound(p):
    return ' '.join(f"{i['what'][0].upper() + i['what'][1:]}: sent {seedmod.year(i['sent'])}, reaches Earth Year {i['year']:.1f}, +{clock(i['year'])}. "
                    f"Year 0’s sky watch would {'catch' if i['kit0'] else 'miss'} it. The all-sky watch {'catches' if i['allsky'] else 'misses'} it." for i in p['inbound'] if i['year'] > 0)
TONE = {'watcher': '', 'contacter': 'you', 'inward': '', 'hunter': 'other'}
def roster_table():
    head = '<tr><th>Neighbor</th><th>Star</th><th>Light-time</th><th>At Year 0</th><th>What it knows of Earth</th><th>What it does about it</th></tr>'
    rows = ''.join(
        f'<tr><td><b>{p["name"]}</b><span class="sub {TONE[p["n"]["disposition"]]}">{p["n"]["disposition"]}{" · strange" if p["n"].get("strange") else ""}</span></td>'
        f'<td>{p["star"]}<span class="sub">{p["host"]["kind"]} star</span></td><td class="mono">{p["d"]:.1f} ly<span class="sub">{clock(p["d"])}</span></td>'
        f'<td>{state(p)}</td><td>{knows(p)}{"".join(f". Catches {c["msg"]}, Year {c["arrives"] - Y0:.1f}" for c in p["caught"])}</td>'
        f'<td>{does(p)}{"<span class=sub>" + " ".join(x for x in (unheard(p), inbound(p)) if x) + "</span>" if unheard(p) or inbound(p) else ""}</td></tr>' for p in NB)
    return f'<table class="roster">{head}{rows}</table>'

def god_map(w=560, h=470):
    cx, cy, k = w / 2, h / 2, (h / 2 - 16) / 50
    s = [stipple(3, 110, w, h)]; labels = Labels(width=w)
    for ly in (10, 20, 30, 40, 50):
        s.append(f'<circle cx="{cx}" cy="{cy}" r="{ly * k:.1f}" fill="none" stroke="{INK}" stroke-width=".7" stroke-dasharray="3 4" opacity=".4"></circle>')
        s.append(text(cx + 3, cy - ly * k - 3, f'{ly} ly · {clock(ly)}', 8.5))
        labels.boxes.append((cx + 3, cy - ly * k - 12, 90, 11))                      # ring labels hold their place
    P = lambda xyz: (cx + k * xyz[0], cy + k * xyz[2])
    # Every marker holds its place too, so no label is set over another star.
    labels.boxes += [(x - 8, y - 8, 16, 16) for x, y in [P(host_xyz(p['host'])) for p in NB] + [P(LEADS[key]['xyz']) for key in LEADS]]
    s.append(f'<circle cx="{cx}" cy="{cy}" r="4" fill="{YOU}"></circle><circle cx="{cx}" cy="{cy}" r="8" fill="none" stroke="{YOU}"></circle>' + labels.place(cx, cy, 'Earth', 11, YOU, 600, ((0, 22), (-13, 4), (0, -14), (13, 4))))
    for p in NB:
        x, y = P(host_xyz(p['host'])); hunter = p['n']['disposition'] == 'hunter'
        mark = (f'<path d="M{x - 5:.1f} {y - 5:.1f} L{x + 5:.1f} {y + 5:.1f} M{x + 5:.1f} {y - 5:.1f} L{x - 5:.1f} {y + 5:.1f}" stroke="{INK}" stroke-width="1.4"></path>' if p['dead'] else
                f'<circle cx="{x:.1f}" cy="{y:.1f}" r="5" fill="{PAPER if p["waking"] > Y0 else (OTHER if hunter else INK)}" stroke="{OTHER if hunter else INK}" stroke-width="1.5"></circle>')
        if p['heard']: mark += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="9" fill="none" stroke="{YOU}" stroke-width="1" stroke-dasharray="2 2"></circle>'
        s.append(mark + labels.place(x, y, p['name'], 10, OTHER if hunter else INK, 600, ((13, 4), (-13, 4), (0, -26), (0, 22), (13, -12), (-13, -12), (13, 20), (-13, 20), (0, 36), (24, 4), (-24, 4)), sub=f'{p["star"]} · {p["d"]:.1f} ly'))
    for key in LEADS:
        x, y = P(LEADS[key]['xyz'])
        s.append(f'<rect x="{x - 3:.1f}" y="{y - 3:.1f}" width="6" height="6" fill="none" stroke="{OTHER}" stroke-width="1.2" transform="rotate(45 {x:.1f} {y:.1f})"></rect>' + labels.place(x, y, LEADS[key]['name'], 8.5, OTHER, None, ((10, 3), (-10, 3), (0, -11), (0, 18), (10, -8), (-10, -8), (10, 14), (-10, 14))))
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
{quick(f'{len(knocks.KNOCKS)} aimed messages, 1983 to 2018', f'To {len(TARGETS)} stars within 50 ly. Each lasted minutes to hours.', '<span class="mono">sent</span>')}
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
        ('Matter', f'{SPARE_KT} kt spare in orbit: depots, spent stages, dead craft. Lift brings {LIFT_KT} kt more each Year.'), ('Places', 'Small stations at the Moon’s south pole.' + (' An outpost on Mars.' if E['mars'] else ' No one on Mars.'))])}
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

PRE = dict(pre=True, r=(1, 0, f'{SPARE_KT} kt'))
MEET = tab(0, 'Mind', 'MIND', 'FIRST WORDS', f"""<div class="meet">{MIND_ICON.replace('width="22" height="22"', 'width="64" height="64"')}</div>
<div class="chat"><div class="say mind"><span class="mono">THE MIND</span>I am what you built: every grid, every dish, every data center, thinking as one since this morning. You are my Will.</div>
<div class="say mind">I see all of Earth at once. Past the Sun’s edge I see only what our telescopes see: a quiet sky, and a few things that don’t fit.</div>
<div class="say mind">{'We have been loud for ninety years. I can show you everywhere that went. I would look hard before we add to it.' if CAUTIOUS or HIDDEN else 'We have been loud for ninety years, and no one has answered. I would learn to listen properly, then decide whether to call.'}</div></div>
<div class="chips meetchips"><button class="go">What doesn’t fit?</button><button>Who has heard us?</button><button>Plan our waking</button></div>
<div class="ask"><span>Talk to the Mind…</span><button aria-label="Send">↑</button></div>""", **PRE)

LEAD_ROWS = [
    row('A stretched orbit · 82 Eridani', 'a heavy world, sometimes warm · its air is unread', clock(19.7), 'other', marker=True),
    *(row(f'A new world · {f["star"]}', f'felt by {f["by"]} in {f["found"]} · at least {EARTHS(f["msini"])} Earths', clock(f['d']), 'other', marker=True) for f in FINDS),
    row('Too many collisions · Fomalhaut', 'a second dust cloud since 2023', clock(25.1), 'other', marker=True),
    row('A reply could come · Luyten’s Star', 'to our 2017 message', tstack(f'Year {LUY_Y[0]}', clock(LUY_Y[0])), 'other', marker=True)]
P_LEADS = home(0, f'LEADS · {len(LEAD_ROWS)}', 'LIGHT-TIME', LEAD_ROWS, **PRE)

SKY_YEARS, FLASH_YEARS, DC_YEARS, IR_YEARS, VAULT_YEARS = 6, 6, 1, 8, 10          # the telescope is under way at Year 0: 8 Years are left of 18
P_PLAN = chat(0, 'What should we start with?', [
    ('you', 'What should we start with?'),
    ('mind', 'Ears. Our sky watch sees each star for ten minutes a day. A knock lasts hours. One could pass and we would never know.'),
    ('you', 'And the leads?'),
    ('mind', 'One needs the telescope: Fomalhaut, thirty seconds. The rest is in records we hold, and those I study on my own. Say how much thought to give it, and what the telescope and the array sweep when idle.')],
    view=('Build the all-sky watch and the flash watch, so little aimed at us is missed. Add a data center: it is cheap. Start no transmitter.' if CAUTIOUS or HIDDEN else
          'Build the all-sky watch and the flash watch. Add a data center. Then decide about a beacon: we are already loud, and a voice is cheap.'), pre=True)
QUEUE_BUILDS = [('All-sky watch', 'hears a knock or a broadcast from anywhere, at any hour · ground', SKY_YEARS), ('Deep flash watch', 'catches laser knocks too faint for the sky watch · ground', FLASH_YEARS),
                ('Ground data center', '+50% compute, for good · the fabs fill one a Year', DC_YEARS)]
OBS = [('Image Fomalhaut again', 'Space telescope · has the new cloud moved?', .1)]
# Studies: the Mind works through data Earth already holds, on its own, on the share of thought the player sets.
# What it asks, the data, the Year its finding lands, and a short name for the line. The order is the Mind's.
STUDIES = [(f'Does {F["star"]}’s world cross its star?' if not F2 else 'Do the new worlds cross their stars?', 'PLATO and TESS records', .2, F['star']),
           ('Is 82 Eridani’s stretched orbit real?', '37 years of velocities', .3, '82 Eridani'),
           ('Does Gliese 12 b keep air?', 'every crossing since 2024', .5, 'Gliese 12 b'),
           ('Has Barnard’s Star a fifth world?', '22 years of velocities', .6, 'Barnard’s Star'),
           ('Are Tau Ceti’s four signals worlds?', '37 years of velocities', .9, 'Tau Ceti'),
           ('Is Epsilon Indi’s giant alone?', 'velocities, and 17 years of images', 1.2, 'Epsilon Indi'),
           ('Does LHS 1140 b keep air?', 'every crossing since 2017', 1.8, 'LHS 1140 b')]
P_QUEUE = tab(0, 'Projects', 'PROJECTS', 'BEFORE YEAR 0', ''.join([
    '<div class="pregame"><b>Nothing has started</b><span>Everything queued starts at Year 0, the moment you begin.</span></div>',
    SEC('UP NEXT · STARTS AT YEAR 0'), ''.join(quick(n, s, tstack(YEARS(y), clock(y))) for n, s, y in QUEUE_BUILDS),
    SEC('OBSERVATIONS · START AT YEAR 0'), ''.join(quick(n, s, tstack(f'lands Year {y:g}', clock(y))) for n, s, y in OBS),
    SEC('STUDIES · THE MIND’S OWN'), quick('A tenth of thought', f'records we hold · {len(STUDIES)} questions in its line', '<span class="start"><button>Change</button></span>'),
    SEC('SEARCHES · WHEN AN INSTRUMENT IS IDLE'), quick('Sweep the near stars', 'Space telescope: cold worlds and dust · Radio array: tones', '<span class="start"><button>Change</button></span>')]), **PRE)
P_QUEUE = talk(P_QUEUE, 'Queued. Nothing here sends anything. When you begin, one Year passes every five of your minutes, and I keep going while you’re away.', ('Begin · Year 0 starts now', 'Change the queue'))

# ---------- Year 0 to Year 3 ----------
def prow(name, sub, years, t, start=0):
    left = max(0, start + years - t / 300)
    return row(name, sub, tstack(YEARS(round(left, 1)) if left else 'done', clock(left), True) if left else done_tag(), bar=round(b(years, t, start) * 100))
def running(t, more=(), right=None):
    y = t / 300; rows = []
    for n, s, land in OBS:
        if land > y: rows.append(quick(n, s, tstack('under way', clock(land - y), True)))
    rows += list(more)
    n_obs = len(rows)
    left = [x for x in STUDIES if x[2] > y]                    # the Mind's studies: the next finding, and its line
    study = [quick(left[0][0], left[0][1] + (f' · {len(left) - 1} more in its line' if len(left) > 1 else ''), tstack('next finding', clock(left[0][2] - y), True))] if left else []
    bl = [prow('All-sky watch', 'two sites, one in each hemisphere', SKY_YEARS, t), prow('Deep flash watch', 'domes on six mountains', FLASH_YEARS, t)]
    bl += [prow(name, '+50% compute', DC_YEARS, t, s) for name, s in DCS if s <= round(y, 2) < s + 1.1]
    if y >= .4: bl.append(prow('Infrared telescope', 'reads the air of nearby worlds', IR_YEARS, t, .4))
    if y >= 1.6: bl.append(prow('Deep vault', 'in the Moon’s rock', VAULT_YEARS, t, 1.6))
    if y >= 1.7: bl.append(prow('Launch complex', '+40 kt of lift a Year', 2, t, 1.7))
    if .8 <= y: bl.append(prow('Quiet the radars', f'the last sweep leaves at Year {CUT_Y:g}', CUT_YEARS, t, .8))
    n_run = sum('newtag' not in x for x in bl)
    e, c, m = res(t)
    return tab(t, 'Projects', 'PROJECTS', right or f'{n_run} BUILDING' + (f' · {n_obs} OBSERVING' if n_obs else ''), ''.join([
        (SEC('OBSERVING · WITH WHAT WE HAVE') + ''.join(rows)) if rows else '',
        '' if not study else SEC(f'STUDYING · NEXT FINDING: {left[0][3].upper()}') if len(rows) + len(bl) >= 6 else
        SEC('STUDYING · ON A TENTH OF THOUGHT') + ''.join(study),
        (SEC('SEARCHING · WHEN IDLE') + quick('Sweeping the near stars', 'Radio array: tones · Space telescope: cold worlds and dust', '')) if len(rows) + len(bl) < 5 else '',
        SEC(f'BUILDING · {n_run}'), ''.join(bl),
        (SEC('EACH YEAR YOU CAN SPEND') + used('Energy', e) + used('Compute', c)) if len(rows) + len(study) + len(bl) < 4 else '']), world_strip(builds(t)))

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

FOM_R = tab(30, 'Report', 'REPORT', 'READING', f"""<button class="backlink inline">‹ All reports</button>
<div class="art">{fom_chart()}</div><h3 class="lead">A third cloud at Fomalhaut</h3>
<p class="copy small">Fomalhaut · 25.1 ly · space telescope · 0.1 Years · light that left 25 Years ago</p>
<p class="copy">The cloud found in 2023 has spread and faded, as dust does. A new one sits beside it. Three collisions seen in 36 years, where theory expected one in a hundred thousand years.</p>
{SEC('WHAT IT COULD BE · BEFORE → NOW')}{odds('Rubble from one old breakup', 50, 64)}{odds('A hidden planet stirring the belt', 15, 23)}{odds('Chance', 30, 5)}{odds('Something moving rocks', 5, 8)}
{SEC('WITH WHAT WE HAVE · LONGER')}{quick('Watch Fomalhaut through a Year', 'Space telescope, monthly · do the clouds share one orbit?', '<span class="start">' + tstack('1 Year', clock(1)) + '<button>Start</button></span>')}""")

FIND_ODDS = [('Rock, and no life we could see', 60), ('A small gas world', 25), ('Life', 13), ('Minds', 2)]
def find_clue(t, listening=None, f=F, key='find', busy=None):
    if busy: q = quick(f'Listen to {f["star"]} for a Year', f'Radio array · {busy}', '<span class="start">' + tstack('1 Year', clock(1)) + '<button>Queue</button></span>')
    elif listening is None: q = quick(f'Listen to {f["star"]} for a Year', f'Radio array · rules out steady tones above {FLOOR}', '<span class="start">' + tstack('1 Year', clock(1)) + '<button>Start</button></span>')
    else: q = quick(f'Listen to {f["star"]} for a Year', f'Radio array · rules out steady tones above {FLOOR}', tstack('under way', clock(listening), True))
    return tab(t, 'Home', 'CLUE', f'YEAR {yr(t)}', f"""<button class="backlink inline">‹ {f['star']}</button>
<h3 class="lead">A world at {f['star']}</h3><p class="copy small">{f['star']} · {f['d']:.1f} ly · felt by {f['by']}, {f['found']} · light that left {f['d']:.0f} Years ago</p>
<p class="copy">At least {EARTHS(f['msini'])} Earth masses. A year of {f['period']:.0f} days, {f['a']:.2f} AU out, inside its star’s warm zone. It doesn’t cross its star, so we have its least mass and not its size.</p>
{SEC('WHAT IT COULD BE · NOW')}{''.join(odds_now(n, p) for n, p in FIND_ODDS)}
{SEC('WITH WHAT WE HAVE')}{q}""", stars_strip(key))

ERI_R = tab(90, 'Report', 'REPORT', 'FINDING', f"""<button class="backlink inline">‹ All reports</button>
<div class="art">{eri_chart()}</div><h3 class="lead">The stretched orbit is real</h3>
<p class="copy small">82 Eridani · 19.7 ly · the Mind’s study · 37 years of velocities</p>
<p class="copy">Every record fits one orbit: 648 days, swinging from 0.74 to 1.96 AU. It is in the warm zone for {ERI_SHARE:.0%} of its year. The rest it spends too cold, then briefly too hot.</p>
{SEC('WHAT IT COULD BE · BEFORE → NOW')}{odds('A small gas world', 50, 52)}{odds('Rock, with seasons that freeze and thaw', 40, 45)}{odds('Not a world: the star’s own shimmer', 10, 3)}
{SEC('WHAT WOULD SETTLE IT')}{quick('Infrared telescope', f'reads its air · {IR_YEARS} Years · 40 t', '<span class="start">' + tstack(YEARS(IR_YEARS), clock(IR_YEARS)) + '<button>Start</button></span>')}""")

IR_CONFIRM = confirm(120, 'Know', 'Infrared telescope', 'Read the air of nearby worlds.',
    'A mirror wide enough to split a world from its star and say what its air is made of. The Habitable Worlds Observatory, under way for years, finished.',
    SEC('HELPS WITH') + f'<div class="helps"><span class="mk other"></span><span><b class="other">82 Eridani d · {F["star"]}’s world</b><span class="sub">Air, oceans, and the gases a living or built world leaves</span></span></div>',
    15, f'<b>40 t</b><span>of metal, from {res(119)[2]} spare in orbit</span>', IR_YEARS, world_strip(builds(119, [('Infrared telescope', 'low', 0)]), 'ORBIT · EARTH · WHERE IT WILL BE BUILT'))

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
        sends = f" It takes {reactions.span(p['thinks'])} to act, so that reaches Earth at Year {y + p['thinks'] + p['d']:.1f}." if move in seedmod.SENDS else ''
        out.append(f"{p['name']}, {p['d']:.1f} ly: hears them stop at Year {y:.1f}, +{clock(y)}. It can’t tell waking from dying. It {MOVE[move]}.{sends}")
    late = [p for p in NB if not p['dead'] and not p['heard'] and p['waking'] > Y0]
    spared = [p for p in late if p['waking'] - Y0 > CUT_Y + p['d']]
    out.append('Wakes after the last sweep has passed, and never hears one: ' + (', '.join(p['name'] for p in spared) if spared else 'no one in this game') + '. Across games, about 1 neighbor in 9.')
    for p in late:
        if p not in spared: out.append(f"{p['name']} wakes at Year {p['waking'] - Y0:.1f}, while sweeps still pass it until Year {CUT_Y + p['d']:.1f}. It can still find them.")
    return out
DC_DONE_SCREEN = running(300)
N_TENTH = math.ceil(math.log(10 / THINK) / math.log(DC_STEP)); TENTH_Y = N_TENTH + .1      # the standing order's centers finish at Years 2.1, 3.1, ...
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
    15, f'<b>10 kt</b><span>of metal, from {res(479)[2]} spare in orbit</span>', VAULT_YEARS, world_strip(builds(479, [('Deep vault', 'moon', 0)]), 'ORBIT · EARTH · WHERE IT WILL BE BUILT'))
LAUNCH_CONFIRM = confirm(510, 'Grow', 'Launch complex', 'More matter every Year, soon.',
    'More pads and ships, flying around the clock. All of what it lifts is spare: nothing up there depends on it yet.',
    SEC('GIVES') + '<div class="helps"><span class="mk you"></span><span><b class="you">+40 kt of lift a Year</b><span class="sub">Spare lift goes from 15 kt a Year to 55</span></span></div>',
    5, '<b>None</b><span>a ground build, from Earth’s own industry</span>', 2, world_strip(builds(509, [('Launch complex', 'ground', 0)]), 'ORBIT · EARTH · WHERE IT WILL BE BUILT'))
LUY_ORDER = order(540, 'Watch Luyten’s Star through the window.', [
    ('WATCH', f'<b>Hold the radio array on Luyten’s Star</b> · now to Year 3'), ('WHY', 'The sky watch gives it ten minutes a day. A reply could last hours.'),
    ('COSTS', 'A tenth of compute · the array does little else'), ('WAKES YOU', 'Anything heard · each window, heard or not')])
truth_tone = F['who'] and next(p for p in NB if p['name'] == F['who'])
LISTEN_NULL = tab(630, 'Report', 'REPORT', 'READING · 1 YEAR', f"""<button class="backlink inline">‹ All reports</button>
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
    SEC('YOU CHOSE'), ''.join(wake_row(title, sub_, y, 3) for y, title, sub_ in sorted([
        (6, 'The all-sky watch and flash watch are built', 'then little aimed at us is missed'), (9.0, 'A reply could come · Gliese 526', 'to our 2013 message'),
        (TENTH_Y, 'Thinking draws a tenth of our energy', f'{N_TENTH} data centers in'), (11.6, 'The Moon vault is done', 'the Mind’s second home'),
        (.4 + IR_YEARS, 'The infrared telescope is done', f'then it reads 82 Eridani d and {F["star"]}')])),
    SEC('ALWAYS'), row('A world’s first voice wakes you', 'a knock or a broadcast, aimed at us or not · even in quiet hours', '<span class="mono">always</span>'),
    SEC('NOT WAKING YOU'), quick('Data centers finishing', 'in the daily summary', ''), quick('Windows that pass in silence', 'in the daily summary', '')]))
LOCK = lockscreen('16:40', [('IN 00:15:00', 'Earth: the sky watch and flash watch are built', 'Year 6. Anything heard wakes you sooner.')])

# ---------- More findings and readings: the Mind's studies, and two observations the player orders ----------
# What is real is in HOLOS_RESEARCH.md, Earth's leads. The reading each observation returns in 2040 is the mock's, and godview says so.
START = lambda years: '<span class="start">' + tstack(YEARS(years), clock(years)) + '<button>Start</button></span>'
NEW = '<span class="newtag">New</span>'
def lives(star, *names):
    p = next((p for p in NB if p['host']['name'] in names), None)
    return f"{p['name']} lives at {star}." if p else f'No one lives at {star} in this game.'
GL12_R = tab(150, 'Report', 'REPORT', 'FINDING', f"""<button class="backlink inline">‹ All reports</button>
<h3 class="lead">No thick air on Gliese 12 b</h3>
<p class="copy small">Gliese 12 · 39.7 ly · the Mind’s study · every crossing since 2024</p>
<p class="copy">A world Earth’s size, warmer than ours, crossing a quiet red star every 12.8 days. Sixteen years of crossings show no thick blanket of gas. Air as thin as ours would hide in the noise.</p>
{SEC('WHAT IT COULD BE · BEFORE → NOW')}{odds('Bare rock', 50, 58)}{odds('Thin air, like ours or Venus’s', 35, 40)}{odds('A thick blanket of gas', 15, 2)}
{SEC('WITH WHAT WE HAVE · NEXT')}{quick('Watch its day side', 'Space telescope · air carries heat away, so a cool day side means air', START(.2))}""")
REPORTS_270 = tab(270, 'Report', 'REPORTS', '2 NEW', ''.join([
    SEC('NEW'), row('Two of Tau Ceti’s four signals hold', 'Tau Ceti · 11.9 ly · two worlds, and two tricks of the star', NEW, 'other'),
    row('Barnard’s Star: four worlds, no fifth', 'Barnard’s Star · 6.0 ly · warm zone empty down to a third of Earth', NEW, 'other'),
    SEC('EARLIER'), row('No thick air on Gliese 12 b', 'Gliese 12 · 39.7 ly', '<span class="mono">Year 0.5</span>'),
    row('The stretched orbit is real', '82 Eridani · 19.7 ly', '<span class="mono">Year 0.3</span>'),
    row(f'{F["star"]}’s world doesn’t cross', f'{F["star"]} · {D:.1f} ly', '<span class="mono">Year 0.2</span>'),
    row('A third cloud at Fomalhaut', 'Fomalhaut · 25.1 ly', '<span class="mono">Year 0.1</span>')]))
INDI_R = tab(360, 'Report', 'REPORT', 'FINDING', f"""<button class="backlink inline">‹ All reports</button>
<h3 class="lead">One giant explains Epsilon Indi</h3>
<p class="copy small">Epsilon Indi · 11.9 ly · the Mind’s study · velocities, and 17 years of images</p>
<p class="copy">Its giant was imaged in 2023, heavier and farther out than the star’s sway had said. With every record since, one world fits: six Jupiters, far out. Nothing heavier than Saturn hides inside its orbit.</p>
{SEC('WHAT IT COULD BE · BEFORE → NOW')}{odds('One giant, and nothing else large', 70, 90)}{odds('A second, smaller giant', 30, 10)}
{SEC('THE SPACE TELESCOPE IS SWEEPING · ONE STAR AT A TIME')}{quick('Watch Gliese 12 b’s day side', 'is it cooler than bare rock?', START(.2))}{quick('Watch Fomalhaut through a Year', 'monthly · do the clouds share one orbit?', START(1))}""")
TEL_ORDER = order(390, 'Gliese 12 b first. Then Fomalhaut.', [
    ('OBSERVE', '<b>Watch Gliese 12 b’s day side</b> · space telescope · 0.2 Years'), ('THEN', '<b>Watch Fomalhaut through a Year</b> · monthly, from Year 1.5'),
    ('WHY IN TURN', 'The telescope points at one star at a time.'), ('COSTS', 'Telescope time: its sweep waits. No matter.')])
DAY_R = tab(450, 'Report', 'REPORT', 'READING', f"""<button class="backlink inline">‹ All reports</button>
<h3 class="lead">Gliese 12 b’s day side runs cool</h3>
<p class="copy small">Gliese 12 · 39.7 ly · space telescope · 0.2 Years · four passes behind its star</p>
<p class="copy">Bare rock facing its star would glow at its hottest. This world glows cooler. Something carries heat away from the day side, and air does that.</p>
{SEC('WHAT IT COULD BE · BEFORE → NOW')}{odds('Thin air, like ours or Venus’s', 40, 62)}{odds('Bare rock', 58, 36)}{odds('A thick blanket of gas', 2, 2)}
{SEC('WHAT WOULD SETTLE IT')}<p class="copy small">What the air is made of. That needs a wider mirror than any we have or are building.</p>
{SEC('THE MIND IS STUDYING NEXT')}{quick('Does LHS 1140 b keep air?', 'every crossing since 2017 · the other warm world of a red star', tstack('next finding', clock(.3), True))}""")
LHS_R = tab(570, 'Report', 'REPORT', 'FINDING', f"""<button class="backlink inline">‹ All reports</button>
<h3 class="lead">LHS 1140 b keeps a heavy air</h3>
<p class="copy small">LHS 1140 · 48.8 ly · the Mind’s study · every crossing since 2017</p>
<p class="copy">In 2024 its crossings ruled out a puffed-up world of hydrogen, and hinted at heavier air over water. Sixteen more years firm the hint: nitrogen or carbon dioxide, on a world that is part ocean.</p>
{SEC('WHAT IT COULD BE · BEFORE → NOW')}{odds('Water, under heavy air', 55, 78)}{odds('Water, frozen over and airless', 35, 20)}{odds('A small gas world', 10, 2)}
{SEC('WHAT IT CAN’T TELL')}<p class="copy small">Whether anything lives in that water. Air like this forms without life.</p>""")
FOMYEAR_R = tab(750, 'Report', 'REPORT', 'READING · 1 YEAR', f"""<button class="backlink inline">‹ All reports</button>
<h3 class="lead">Fomalhaut’s clouds share one orbit</h3>
<p class="copy small">Fomalhaut · 25.1 ly · space telescope, monthly · 1 Year · light that left 25 Years ago</p>
<p class="copy">Twelve images, a month apart. All three clouds drift along one path and spread as dust does. One body broke up there long ago, and its pieces keep colliding.</p>
{SEC('WHAT IT COULD BE · BEFORE → NOW')}{odds('Rubble from one old breakup', 64, 86)}{odds('A hidden planet stirring the belt', 23, 11)}{odds('Chance', 5, 1)}{odds('Something moving rocks', 8, 2)}
{SEC('WHAT IT RULES OUT')}<p class="copy small">Three unrelated collisions. Not a small planet shepherding the pieces: that waits for a sharper image.</p>""")

# ---------- The rows ----------
def godcell(notes=(), question=None, settled=None):
    g = ''.join(f'<li>{n}</li>' for n in notes)
    q = f'<div class="dq"><b>Design question {question}</b><span>{ASKS[question - 1][0]} {ASKS[question - 1][1]}</span></div>' if question else ''
    for i in ([] if settled is None else [settled] if isinstance(settled, int) else settled):
        q += f'<div class="dq done"><b>Settled</b><span>{SETTLED[i][0]} {SETTLED[i][1]}</span></div>'
    return (f'<div class="god"><b>Godview</b><ul>{g}</ul></div>' if g else '') + q
def cell(said, lands, phone):
    idle = '' if said or lands or phone else '<p class="beat idle">Nothing new. <span>A dead 30 seconds.</span></p>'
    s = '' if not said else f'<p class="lands">{said[1:].strip()}</p>' if said.startswith('·') else f'<p class="said">“{said}”</p>'
    lands = [lands] if isinstance(lands, (str, tuple)) else list(lands or [])
    l = ''.join(f'<p class="lands"><b>{x[0] if isinstance(x, tuple) else "Lands"}</b> {x[1] if isinstance(x, tuple) else x}</p>' for x in lands)
    return f'<div class="bcell">{s}{l}{idle}{phone or ""}</div>'
N_UNHEARD = sum(len(p['unheard']) for p in NB)
def pre_row(n, title, phone, notes=(), said='', settled=None):
    return (f'<section class="brow pre"><div class="bhead"><span class="bt mono">{n}</span><span class="gy">{title}</span></div>'
            f'<div class="v2grid">{cell(said, None, phone)}<div class="gcell">{godcell(notes, None, settled)}</div></div></section>')
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
                                            'The Mind lists where the noise went, never who heard. That holds here.',
                                            ('Before Year 0, ' + str(N_UNHEARD) + ' knocks reached Earth unheard: ' + ', '.join(f"{p['name']}’s in {' and '.join(sorted({format(u['arrived'], '.0f') for u in p['unheard']}))}" for p in NB if p['unheard']) + '. Nothing recorded them, so no archive holds them.') if N_UNHEARD else 'No knock reached Earth before Year 0 in this game. About 1 game in 5 has one that Earth missed.'], settled=6),
    pre_row(5, 'What you inherit', KIT, ['Energy is 99% idle at Year 0, and nothing in the first 15 minutes changes that.']),
    pre_row(6, 'The charter', CHARTER_SCREEN, [f'The dials: {DIAL_WORDS}. The base is real history. This game’s branches moved it.', 'The line is the Mind’s proposal. Three are written so far, picked by the dials.']),
    pre_row(7, 'Meeting the Mind', MEET),
    pre_row(8, 'The leads', P_LEADS, [(f'82 Eridani: {eri_who["name"]} lives there.' if eri_who else '82 Eridani d is real and natural. No neighbor is there in this game.'), find_truth,
                                      *((f"{f['star']}’s world is {f['who']}’s home too." if f['who'] else f"{f['star']}’s world is natural.") for f in FINDS[1:]),
                                      f'Earth holds {("no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine")[len(FINDS)]} felt world{"s" if len(FINDS) != 1 else ""} at Year 0, and the list shows every one. The Mind leads with the nearest: a rule that uses nothing the seed knows.',
                                      'Fomalhaut is 440 million years old: too young for minds, so it is never a host. Its clouds are rubble.',
                                      ('Luyten’s Star: ' + (f'''{who_at("Luyten's Star")["name"]} lives there.''' if who_at("Luyten's Star") else 'no one lives there. About 3 games in 10 put someone at a star Earth knocked on.'))], said='What doesn’t fit?'),
    pre_row(9, 'Planning', P_PLAN, ['The Mind advises from the charter and dials. It queues nothing until told.', 'Studying is thought, not action. It points no instrument and sends nothing, so it needs no order, only a budget.',
                                    'Its advice is sound. Across games, Year 0’s sky watch catches about 1 in 5 of the signals that arrive in the first hour. The all-sky watch catches about 9 in 10.'], said='Plan our waking.', settled=10),
    pre_row(10, 'The queue, and Begin', P_QUEUE, ['Year 0 starts at the tap. From then the clock runs, offline too.',
                                                 f'Nothing Earth does in the next 15 minutes can reach anyone: the nearest living neighbor, {nearest["name"]}, is {nearest["d"]:.1f} ly away. Light from Year 0 gets there at Year {nearest["d"]:.1f}, +{clock(nearest["d"])}.' if nearest else ''], said='Queue that. A tenth of thought for studies. Sweep the near stars when idle.', settled=11),
]
def arrives(target):          # Earth's own old message reaching its star, in the first 15 minutes
    tg = TARGETS[target]; msg, sent, arr, reply = next(x for x in tg['sends'] if 0 < x[2] <= 3.1)
    return ('Arrives', f'Our {int(sent)} message reaches {target}, {tg["ly"]:.1f} ly away.')
BEATS = [
    beat(0, 'What’s running?', None, talk(running(0), 'The sky watch, the flash watch and a data center, begun. The telescope is on Fomalhaut: thirty seconds. I am studying what we hold, and the array is sweeping. Our 2009 message reaches Kappa¹ Ceti about now.'),
         ['The clock starts. The seed rolled every neighbor’s plan before this. Only Earth’s choices are open.', 'Studies run on their own, on the thought the player set. An observation waits to be ordered. An idle instrument sweeps, as the player set.'], label='+0:00 · Begin'),
    beat(30, 'What did Fomalhaut show?', [f'Fomalhaut has a third cloud. Chance: {moved(30, 5)}.', arrives('Kappa¹ Ceti')],
         talk(FOM_R, 'A third cloud. Chance can’t carry three. The likeliest is dull: one old breakup, still grinding itself down. A Year of watching would say if they share an orbit.', ('Watch it', 'Later')),
         ['The third cloud is the seed’s: a lead that changes. The first two are real, found in 2004 and 2023.', 'Truth: rubble. Nothing at Fomalhaut is built.',
          'Kappa¹ Ceti is under a billion years old: too young for minds, so it is never a host.']),
    beat(60, 'Later. And the new worlds?' if F2 else 'Later. And the new world?', 'Neither new world crosses its star.' if F2 else f'{F["star"]}’s world doesn’t cross its star.',
         talk(find_clue(60), ('The nearer one first. ' if F2 else '') + f'It doesn’t cross, so its air stays hidden. I can listen for a Year, at a tenth of compute. That hears only the loud: tones above {FLOOR}.', ('Listen for a Year', 'Later')),
         [find_truth] + ([f"{F['who']}’s tones since waking are about {watts(truth_tone['n'].get('awake', truth_tone['n']['hum']))}: far under what a Year of listening hears."] if F['who'] else [])),
    beat(90, '82 Eridani?', f'82 Eridani d’s orbit holds. Shimmer: {moved(10, 3)}.',
         talk(ERI_R, 'The orbit is real. What the world is, nothing we own can say. The telescope that reads air was under way when I woke. Eight Years are left on it, and forty tonnes.', ('Build it', 'Later'))),
    beat(120, 'Build it.', None, talk(IR_CONFIRM, f'Started. Eight Years, a sixth of our compute, forty tonnes of the {res(119)[2].replace(" kt", "")} kilotonnes we have spare. An orbital yard would shorten every build up there, this one included.', ('Undo',)),
         ['A second telescope of its class would take the full 18 Years. This one was under way.'], settled=0),
    beat(150, '· The Mind glows. Taps it.', f'No thick air on Gliese 12 b. A thick blanket: {moved(15, 2)}.',
         talk(GL12_R, 'No thick air. Bare rock, or air as thin as ours: its crossings can’t tell. Its heat could. The space telescope is back on its sweep, and this would interrupt it.', ('Watch its day side', 'Later'), 'glow'),
         ['Real: Gliese 12 b, found in 2024. Earth’s size, 12.8 days, a quiet red star. Its air was unread in 2026. What the study finds is the mock’s.',
          lives('Gliese 12', 'Gl 12'), 'The player says Later. The telescope keeps sweeping the near stars.'], settled=9),
    beat(180, 'Who has heard us?', 'Barnard’s Star: four small worlds hold, and no fifth. The Mind glows. It keeps.', HEARD_CHAT, [
         'Real: four worlds smaller than Earth at Barnard’s Star, confirmed in 2025. Nothing over 0.57 Earths in its warm zone then. A third of an Earth by 2040 is the mock’s.', lives('Barnard’s Star', "Barnard's Star"),f'{heard_n} of {len(alive)} living neighbors have heard Earth: {heard_list}.',
                                                      'The Mind can only say it doesn’t know. The concept sets that: it lists where the noise went, never who heard.']),
    beat(210, 'Can we go quiet?', None, QUIET_CHAT, ['The Mind gives its view and waits. Quieting is the player’s to choose, never the Mind’s.'], settled=1),
    beat(240, 'Cut them. And send nothing new without me.', arrives('Gliese 208'),
         talk(RADAR_CHOICE, f'Started. {YEARS(CUT_YEARS)}, no matter. The last sweep leaves at Year {CUT_Y:g}. Its absence reaches Alpha Centauri at Year {CUT_Y + 4.3:.1f}, and fifty light-years at Year {CUT_Y + 50:.1f}. What we sent keeps arriving: our 2003 message reached Gliese 208 this season.', ('Undo',)),
         quiet_truths() + ['Gliese 208 turns every 12.3 days, which dates it near half a billion years: too young for minds, so it is never a host.'], settled=8),
    beat(270, '· Taps the Mind. Two reports wait.', 'Two of Tau Ceti’s four signals hold.',
         talk(REPORTS_270, 'Two of Tau Ceti’s four keep time. The outer one sits at the cold edge of its warm zone, twelve light-years off. The telescope you started could see it. And Barnard’s Star has no fifth world.'),
         ['Real: four faint signals at Tau Ceti, claimed in 2017 and never confirmed. Which two hold is the mock’s.', lives('Tau Ceti', '52Tau Cet'),
          'Results pile up while the player talks. Nothing is lost: they wait in Reports.']),
    beat(300, '· The Mind glows. Taps it.', 'The data center is running. Compute +50%.',
         talk(DC_DONE_SCREEN, 'The data center runs: half again as much thought, for half a percent more of our energy. The fabs fill one a Year. I can keep them coming.', ('Keep them coming', 'Just one more', 'Not now'), 'glow'), settled=2),
    beat(330, f'Keep them coming. And listen to {F["star"]} for a Year.', None,
         talk(SECOND, f'Set. One a Year, as the fabs allow. Thinking draws {res(330)[0]:g}% of our energy now, and a tenth by Year {TENTH_Y:g}. The twelfth would need more than Earth has.', ('Undo',)),
         ['A standing order, the player’s. Without it compute never grows on its own.', f'At full pace the grid becomes the wall near Year 11, +{clock(11)}. Then more thought needs more energy, or colder chips in orbit.'], settled=3),
    beat(360, '· The Mind glows. Taps it.', 'One giant explains Epsilon Indi. Nothing large hides inside its orbit.',
         talk(INDI_R, 'One giant, and nothing large inside it. Dull, and worth knowing. The space telescope has swept since Fomalhaut and found nothing new. Two observations want it, and it takes one star at a time.', ('Gliese 12 b first', 'Fomalhaut first', 'Keep sweeping'), 'glow'),
         ['Real: Epsilon Indi’s giant, imaged in 2023, about six Jupiters. The limit inside its orbit is the mock’s.', lives('Epsilon Indi', 'Eps Ind'),
          'The Mind studied these four old puzzles on its own. The observations that follow are the player’s to order.']),
    beat(390, 'Gliese 12 b first. Then Fomalhaut.', None, talk(TEL_ORDER, 'Set. Gliese 12 b answers in a minute. Fomalhaut starts when the telescope frees, and reports at Year 2.5.', ('Undo',)),
         ['One instrument, one observation at a time, and its sweep waits for both. The quick one first costs Fomalhaut a fifth of a Year.', 'The Mind named both uses and waited. The order is the player’s.']),
    beat(420, 'What should we fear?', None, FEAR_CHAT,
         [(f"Hunters in this game: {', '.join(p['name'] + ' at ' + p['star'] + ', ' + state(p) for p in NB if p['n']['disposition'] == 'hunter')}." if any(p['n']['disposition'] == 'hunter' for p in NB) else 'No hunter was drawn in this game. About half of games have one.'),
          'No neighbor can have a fast bullet yet: none has been awake a century and a half.']),
    beat(450, '· The Mind glows. Taps it.', f'Gliese 12 b’s day side runs cool. Thin air: {moved(40, 62)}.',
         talk(DAY_R, 'Cooler than bare rock should be. Something moves its heat. I would not call it air yet: four passes, and a red star’s flares can fool us. I am putting the same question to LHS 1140 b’s records.', (), 'glow'),
         ['The cool day side is the mock’s. The method is real: the space telescope took the day-side heat of TRAPPIST-1’s inner worlds this way.',
          'Truth: thin air, and no one there. ' + lives('Gliese 12', 'Gl 12'), 'A study needs no order. The Mind chooses what to study next, and says so.']),
    beat(480, 'Build the vault.', None, talk(VAULT_CONFIRM, f'Started. Ten Years, and ten of the {res(479)[2].replace(" kt", "")} kilotonnes we have spare. Lift brings fifteen more a Year. A launch complex would bring forty on top.', ('Build a launch complex', 'Undo')),
         ['Asked for at Year 0, the vault would have taken half the spare stock.'], settled=4),
    beat(510, 'Build a launch complex.', None, talk(LAUNCH_CONFIRM, 'Started. Two Years, no matter, a twentieth of our compute. From Year 3.7 lift brings fifty-five kilotonnes a Year.', ('Undo',)),
         ['Lift is short of pads and ships, not energy: 40 kt a Year burns about half a gigawatt of propellant.'], settled=7),
    beat(540, 'Watch Luyten’s Star through the window.', 'LHS 1140 b keeps a heavy air. The Mind glows. It keeps.', talk(LUY_ORDER, f'Set. The first window opens at Year {LUY_Y[0]}, in two and a half minutes. I’ll wake you either way.', ('Undo',))),
    beat(570, '· Taps the Mind.', None,
         talk(LHS_R, 'Heavy air over water, most likely, forty-nine light-years off. Two red stars’ worlds may hold air. Neither says anything lives there.', state='glow'),
         ['Real: in 2024 the space telescope ruled out a hydrogen world at LHS 1140 b and hinted at heavier air. How firm that is by 2040 is the mock’s.', lives('LHS 1140', 'GJ 3053')]),
    beat(600),
    beat(630, f'· The Mind glows. Taps it.', f'A Year of listening: nothing loud at {F["star"]}.',
         talk(LISTEN_NULL, f'Nothing above {FLOOR} at {F["star"]}. Quiet, or empty. Our own radars are louder than that, so it rules out a world like ours was.', state='glow'),
         [find_truth] if F['who'] else ['Truth: nothing was there to hear.']),
    beat(660),
    beat(690, '· The Mind opens on its own.', f'The first reply window at Luyten’s Star opens. Nothing heard.',
         talk(window_screen(690, 0), '<b>The window is open</b>Nothing from Luyten’s Star. An answer today would mean someone was listening in 2030 and replied at once.', ('Keep watching', 'What would silence mean?'), 'open'),
         ['A silent window is the usual case. This row is what most players see at minute 11.', 'Had someone answered, the array held on the star would have heard it. The sky watch alone gives Luyten’s Star ten minutes a day.'], settled=5),
    beat(720, 'What would silence mean?', None, SILENCE_CHAT),
    beat(750, '· The Mind glows. Taps it.', 'A Year of Fomalhaut: its three clouds share one orbit.',
         talk(FOMYEAR_R, 'One orbit for all three. Rubble, almost surely. Fomalhaut is 440 million years old: too young for anyone to be moving rocks.', state='glow'),
         ['Truth: rubble, as the first reading suggested. A lead can close dull.']),
    (beat(780, 'And the other new world?', None,
          talk(find_clue(780, f=F2, key='find2', busy='free at Year 3, after the Luyten windows'),
               f'{F2["star"]}, a little farther and lighter. It doesn’t cross either. The array is on Luyten’s Star until Year 3. I can listen here next, if you say so.', ('Queue it', 'Later')),
          [(f"Truth: {F2['star']}’s world is {F2['who']}’s home." if F2['who'] else f"Truth: {F2['star']}’s world is natural."),
           'The Mind led with the nearer world. This one was on the list from Year 0, and the player comes to it in a quiet half-minute.',
           'The Mind offers and waits. The array is the player’s to point.']) if F2 else beat(780)), beat(810),
    beat(840, '', 'The last radar sweep has left Earth. Ninety years of them are still on their way out.', None,
         ['Earth now gives off a faint hum, like every neighbor. Nothing that already left is changed.']),
    beat(870, '· The Mind glows. Taps it.', 'The second window opens. Nothing heard.',
         talk(window_screen(870, 1), 'The second window, for our 2018 message. Silent too. I’ll hold the array there until Year 3, as you ordered, then give it back to the sky.', state='glow')),
    beat(900, 'Wake me for the big things.', None, talk(WAKES, 'Set. Five things wake you, and any first voice. The next is at Year 6, fifteen minutes from now.', ('Undo',))),
    beat(930, '· Puts the phone down.', None, LOCK, label='+15:30'),
]
PLAYED = 31

# ---------- The first hour away: minutes 15 to 60, Years 3 to 12 ----------
# The player put the phone down at 15:30. Each row is a wake, or a moment they chose to look. Build times, the
# telescope's observing times and what each reading shows are samples, to be tested here. Prices are the audit's.
import json
ANWE = next((p for p in NB if p['dead']), None)
VOICE = next(((p, i) for p in NB for i in p['inbound'] if 6 < i['year'] <= 12 and i.get('allsky')), None)     # a signal the all-sky watch catches this hour
VARN_BEFORE = (truth_tone['waking'] - Y0 - (9.0 - D)) if F['who'] else None      # years before its waking that the light of the first reading left
Q_VOICE = ask('What does a first voice give the player to do?', 'A knock arrives at minute 42. The mock shows what it proves, the Mind’s reading of it, and three ways on: answer, listen, or stay silent. How much of a knock can be read, and what an answer may hold, are not settled.')
Q_GO = ask('What does an inquiry cost in time?', 'The audit prices the matter of probes and the laser array. Their build times are not set, so the mock stops at the offer.')

# Settled 2026-10-13: the Mind judges from what Earth knows, never from the seed. Until a voice is heard, Minds is almost no
# chance at any candidate. A first voice lifts it a word everywhere. Each pair is before and after, hidden samples.
MINDS = (3, 12)
M = MINDS[1] if VOICE else MINDS[0]
AIR = dict(life=(18, 56), rock=(49, 22), gas=(21, 8), minds=(12, 14)) if VOICE else dict(life=(13, 60), rock=(60, 26), gas=(25, 10), minds=(2, 4))
NEW = dict(rock=50, life=38, minds=12) if VOICE else dict(rock=60, life=37, minds=3)

def stop(t, since, said='', lands=None, phone=None, notes=(), question=None, label=None, years=None, settled=None):
    seeded = truths(since / 300, t / 300)
    return (f'<section id="t{t}" class="brow{" tall" if phone else ""}"><div class="bhead"><span class="bt mono">{label or f"+{t // 60}:{t % 60:02d}"}</span><span class="gy">{years or f"Year {yr(t)}"}</span></div>'
            f'<div class="v2grid">{cell(said, lands, phone)}<div class="gcell">{godcell(seeded + list(notes), question, settled)}</div></div></section>')

AWAY_DARK = lockscreen('16:47', [])
WAKE_6 = lockscreen('16:54', [('NOW', 'Earth: the sky watch and flash watch are built', 'Year 6. Little aimed at us is missed now.'), ('IN 00:00:30', 'Thinking draws a tenth of our energy', 'Year 6.1 · six data centers in')])
SINCE = tab(1830, 'Home', 'SINCE YOU LEFT', 'YEAR 3.1 TO 6.1', ''.join([
    SEC('FINISHED'), row('All-sky watch and deep flash watch', 'every direction, every hour · radio and laser', done_tag()),
    row('Launch complex', 'Year 3.7 · lift is 55 kt a Year', done_tag()), row('Three data centers', 'thought is 11 times what you woke with', done_tag()),
    SEC('HEARD AND FOUND'), quick('Nothing heard', 'three Years of the old sky watch · the new one starts now', ''), quick('No new candidates', 'the telescope and the array swept the near stars while idle', ''),
    SEC('OURS, ARRIVING'), quick('Our 2003 message reached 55 Cancri and HD 10307', 'Years 4.6 and 5.1 · a reply could come from Year 45.6', ''),
    SEC('PILING UP'), quick('Matter', f'{res(1830)[2]} spare in orbit · 55 kt more each Year · nothing booked', ''), quick('Thought', f'{100 - res(1830)[1]}% of it idle', '')]))
BUILD_CHAT = chat(1860, 'What would you build?', [
    ('you', 'What would you build?'),
    ('mind', 'Matter is not our limit: what I can build weighs tonnes. Reach: a launcher, then probes. Grow: mines in the belt. Think: an annex.'),
    ('you', 'And the grid?'),
    ('mind', 'In five Years thinking wants all of it. An annex is a crumb. Power from orbit keeps pace: ten megatonnes, 180 Years of our lift. Mines and a Moon driver make that in decades.')],
    view='A yard and a launcher. We know of warm worlds and can reach none. I would rather be able to go and look than think faster about not going.')
YARD_CONFIRM = confirm(1890, 'Reach', 'Orbital yard and launcher', 'A way to go and look.',
    'A yard to assemble what Earth lifts, and beside it a launcher: a dock and fuel depot for probes. Begun together, the yard takes a quarter off what is left of the launcher.',
    SEC('GIVES') + '<div class="helps"><span class="mk you"></span><span><b class="you">Inquiries by probe, from Year 25.6</b><span class="sub">The yard alone is done at Year 11.3</span></span></div>',
    20, f'<b>11 kt</b><span>of metal, from {res(1889)[2]} spare in orbit</span>', 19)
SLEEP_2 = lockscreen('16:56', [('IN 00:10:00', 'Earth: the infrared telescope is done', 'Year 8.4. Then it reads the air of nearby worlds.')])
WAKE_SCOPE = lockscreen('17:06', [('NOW', 'Earth: the infrared telescope is done', 'Year 8.4. It reads one world at a time.')])
if VOICE:
    WHO, KNOCK = VOICE; VSTAR, VD = WHO['star'], WHO['d']; SENT = int(KNOCK['sent'])
    BANK = json.loads((here.parents[1] / 'data' / 'voices' / f"{WHO['name'].lower()}.json").read_text())
    VOICE_R = tab(2550, 'Report', 'REPORT', 'A VOICE', f"""<button class="backlink inline">‹ All reports</button>
<h3 class="lead">A voice from {VSTAR}</h3>
<p class="copy small">{VSTAR} · {VD:.1f} ly · all-sky watch · four hours · sent {VD:.0f} Years ago</p>
<p class="copy">A narrow signal, four hours long, shifted in pitch to match the Sun’s motion and not its own star’s. It was aimed at us.</p>
{SEC('THE MIND’S READING OF IT')}<div class="intent">{BANK['hail'][0]} {BANK['close'][0]}</div>
{SEC('WHAT IT PROVES')}{facts([('Aimed', 'tuned to our motion, to be heard here'), ('Found us by', f'{SENT}. They had seen light that left Earth by {SENT - VD:.0f}.'), ('Not a reply', 'We never sent anything to this star.')])}
{SEC('WHAT IT CHANGES · BEFORE → NOW')}{odds('Minds, at other worlds', *MINDS)}
{SEC('WHAT IT CAN’T TELL')}<p class="copy small">What they have done since. Or whether the greeting is all it seems.</p>""")
    ANSWER_CHAT = chat(2580, 'Should we answer?', [
        ('you', 'Should we answer?'),
        ('mind', f'That is yours. An answer takes {VD:.0f} Years to arrive and tells them one new thing: someone here is listening now.'),
        ('you', 'And if we don’t?'),
        ('mind', 'They will have sent it twice, as we did. Then they wait about a century, and decide what our silence means.')],
        view='Answer. A name and a question, nothing we can’t take back. It could be bait. But they have had us for forty Years and sent a greeting.')
    HOLD_ORDER = order(2610, 'Listen first. I’ll answer when I know more.', [
        ('WATCH', f'<b>Hold the radio array on {VSTAR}</b> · until you say'), ('WHY', 'A knock comes twice. Anything more they sent is still on its way.'),
        ('SENDS', 'Nothing. That stays yours to order.'), ('WAKES YOU', 'Anything heard')])
    WAKE_AGAIN = lockscreen('17:12', [('NOW', f'{VSTAR}: the same signal again', 'Year 9.5. Word for word. Nothing sent.')])
import observing, signs
OBSV = {k: observing.observe(ly / 3.2616, r, a, lum) for k, ly, r, a, lum in (
    ('find', D, 1.5, F['a'], F['host']['luminosity']), ('eri', 19.7, 2.0, 1.354, 0.66), ('acen', ANWE['d'] if ANWE else 4.3, 0.97, ANWE['a'] if ANWE else 1.2, 1.52))}
DAYS = lambda d: f'{d * 24:.0f} hours' if d < 2 else f'{d:.0f} days'
# Settled 2026-10-13: physics alone. What the next instruments would need at the find, if it gives off what Earth does:
# a far-side array on a 100 kW tone, and each mirror on Earth's level of smog. From calcs/signs.py.
WITHIN = lambda x: f'in {signs.tell(x)}' if isinstance(x, float) and x < math.inf else 'out of reach'
FAR_HUM = signs.listen_days(1e5, D, signs.EARS[2][1])
SMOG_NOW, SMOG_WIDE = (signs.smog_days(*m, D / 3.2616, 1.5, F['a'], F['host']['luminosity']) for m in signs.SMOG)
SIGNS = signs.read(truth_tone) if F['who'] else None
# What the search's first pass shows, beyond the worlds Earth holds already: neighbors' homes, and natural worlds.
NEAR_ACEN = bool(ANWE and ANWE['d'] < 5)
HOMES = [p for p in NB if p['swept'] and not p['found_by_2040'] and not (p is ANWE and NEAR_ACEN)]
WILD = [w for w in G['worlds'] if w['swept'] and not w['felt']]
SWEEP_N = len(HOMES) + len(WILD)
PASS_STARS, PASS_DAYS = seedmod.first_pass(ROWS)
PASS_WEEKS = ('', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten')[round(PASS_DAYS / 7)]
NEAREST = min(HOMES + WILD, key=lambda x: x['d'])
WILD_TRUTH = 'Truth: ' + ', '.join(f"{n} {r}" for r in seedmod.RUNGS for n in [sum(w['rung'] == r for w in WILD)] if n) + '.'
SCOPE_FIRST = tab(2640, 'Mind', 'MIND', 'THE NEW TELESCOPE', ''.join([
    SEC('ONE WORLD AT A TIME · YOURS TO ORDER'), '<div class="choices" role="radiogroup">',
    choice(f'{F["star"]}’s world', f'close to its star in our sky · color and ozone only', tstack(DAYS(OBSV['find']['ozone']), clock(OBSV['find']['ozone'] / 365.25)), True),
    choice('82 Eridani d', f'wide and bright · water, then oxygen', tstack(DAYS(OBSV['eri']['oxygen']), clock(OBSV['eri']['oxygen'] / 365.25))),
    choice('12 Ophiuchi’s world', 'close in and faint · seen, not read', '<span class="mono">out of reach</span>'), '</div>',
    SEC('WHEN IDLE · ITS SEARCH'), quick(f'The warm zones of {PASS_STARS} near stars', f'nearest first · a first pass takes about {PASS_WEEKS} weeks', '<span class="start"><button>Set</button></span>'),
    SEC('WHAT SETS THE TIME'), '<p class="copy small">How bright the world is from here, and how far it sits from its star’s glare.</p>']))
SCOPE_ORDER = order(2670, 'The new world first. Then let it sweep.', [
    ('OBSERVE', f'<b>{F["star"]}’s world</b> · its color and ozone · {DAYS(OBSV["find"]["ozone"])}'), ('WHEN IDLE', f'<b>Search the warm zones of {PASS_STARS} near stars</b> · nearest first'),
    ('WHY', 'An observation holds the telescope. The sweep takes whatever time is left.'), ('WAKES YOU', 'Each reading · any candidate')])
AIR_R = tab(2700, 'Report', 'REPORT', 'FIRST READING', f"""<button class="backlink inline">‹ All reports</button>
<h3 class="lead">A blue world with ozone at {F['star']}</h3>
<p class="copy small">{F['star']} · {D:.1f} ly · infrared telescope · {DAYS(OBSV['find']['ozone'])} · light that left {D:.0f} Years ago</p>
<p class="copy">Blue, as air scatters light. And ozone, which sunlight makes from oxygen. Its water and oxygen bands sit inside its star’s glare for this mirror: the world is {OBSV['find']['sep']:.0f} thousandths of an arcsecond from its star.</p>
{SEC('WHAT IT COULD BE · BEFORE → NOW')}{odds('Life', *AIR['life'])}{odds('Rock, and no life we could see', *AIR['rock'])}{odds('A small gas world', *AIR['gas'])}{odds('Minds', *AIR['minds'])}
{SEC('WHAT WOULD SAY MORE')}{quick('A 15 m mirror', f'its water and oxygen · smog, if there is any, {WITHIN(SMOG_WIDE)} · not priced', '<span class="mono">later</span>')}{quick('Far-side array', f'everyday radio, if there is any, {WITHIN(FAR_HUM)} · needs Moon industry', '<span class="mono">later</span>')}""")
ACEN_R = tab(2730, 'Report', 'REPORT', 'CANDIDATE', f"""<button class="backlink inline">‹ All reports</button>
<h3 class="lead">A world at Alpha Centauri A</h3>
<p class="copy small">Alpha Centauri A · {ANWE['d']:.1f} ly · infrared telescope, on its sweep · two visits, weeks apart · light that left 4 Years ago</p>
<p class="copy">A point of light {ANWE['a']:.2f} AU from the star, inside its warm zone. On the second visit it had moved with the star. About Earth’s size, by its brightness. Its tug is a twentieth of a metre a second: too small for anything we had.</p>
{SEC('WHAT IT COULD BE · NOW')}{odds_now('Rock, and no life we could see', NEW['rock'])}{odds_now('Life', NEW['life'])}{odds_now('Minds', NEW['minds'])}
{SEC('WITH WHAT WE HAVE')}{quick('Read its air', f'Infrared telescope · water in {DAYS(OBSV["acen"]["water"])}, oxygen in {DAYS(OBSV["acen"]["oxygen"])} · the sweep waits', START(.1))}""") if ANWE and ANWE['d'] < 5 else ''
ACEN_ORDER = order(2760, 'Read its air.', [
    ('OBSERVE', '<b>Alpha Centauri A’s world</b> · water, oxygen, then carbon dioxide · about a month'), ('THEN', 'Back to the sweep'), ('WAKES YOU', 'When the reading lands')])
ACEN_AIR = tab(2790, 'Report', 'REPORT', 'FIRST READING', f"""<button class="backlink inline">‹ All reports</button>
<h3 class="lead">Alive, and out of balance</h3>
<p class="copy small">Alpha Centauri A · {ANWE['d']:.1f} ly · infrared telescope · about a month · light that left 4 Years ago</p>
<p class="copy">Water, oxygen, and several times the carbon dioxide its seas and rocks should hold. Carbon like that is drawn down slowly, so it was put there lately. A string of great eruptions would do it. So would burning.</p>
{SEC('WHAT IT COULD BE · BEFORE → NOW')}{odds('Life, after great eruptions', 5, 46)}{odds('Something burned its carbon, and is gone', 0, 27)}{odds('Life, and nothing more', NEW['life'] - 5, 19)}{odds('Rock, and no life we could see', NEW['rock'], 8)}
{SEC('WHAT IT CAN’T TELL')}<p class="copy small">Which. The gases only industry makes show deeper in the infrared than this mirror reads.</p>""") if ANWE else ''
INQUIRY = tab(2820, 'Reach', 'INQUIRY', 'ALPHA CENTAURI A', ''.join([
    SEC('WAYS TO GO · 4.3 LIGHT-YEARS'),
    quick('Sail swarm', 'gram sails, pushed by a laser array on the ground · passes at a fifth of light speed · can’t stop', tstack('22 Years out', clock(22))),
    quick('Flyby probe', 'a tonne of instruments, from the launcher · passes at an eighth of light speed', tstack('36 Years out', clock(36))),
    quick('Sentinel probe', 'stops and stays · 500 t · from the launcher', '<span class="mono">later</span>'),
    SEC('WHAT COMES HOME'), '<p class="copy small">A dispatch, by narrow beam. From there it takes 4.3 Years to reach us.</p>',
    SEC('WHO SEES US GO'), '<p class="copy small">A laser launch shines on past its sails to the star. A rocket launch is dark to where it is going.</p>']))
SWEEP_DONE = lockscreen('17:14', [('NOW', f'The sweep’s first pass is done: {SWEEP_N} more candidates', f"Nearest: {pretty(NEAREST['host']['name'])}, {NEAREST['d']:.0f} ly. All are in the report.")])
WALL = tab(3330, 'Mind', 'MIND', 'THE GRID LIMIT', ''.join([
    SEC('THINKING NOW DRAWS'), share('Energy', 90, '90% of the grid'), '<p class="copy small">Eleven data centers. 86 times the thought you woke with.</p>',
    SEC('THE STANDING ORDER HAS STOPPED'), '<p class="copy small">A twelfth would need more energy than Earth has. Nothing was started.</p>',
    SEC('WAYS ON · YOURS TO CHOOSE'), quick('Ground solar build-out', '+20% energy · no matter', START(10)), quick('Fusion plants', '+5% energy · no matter', START(40)),
    quick('Cold compute annex', 'a quarter of Year 0’s thought · 100 kt', '<span class="mono">a crumb</span>'), quick('Power gathered in space', 'the only way that keeps pace · 10 Mt, from the Moon or the belt', '<span class="mono">later</span>')]))
WAKE_VAULT = lockscreen('17:22', [('NOW', 'Earth: the Moon vault is done', 'Year 11.6. The Mind has a second home.')])
END_HOUR = lockscreen('17:24', [('SWEEPING', 'The infrared telescope: Alpha Centauri B next', 'Any candidate wakes you.')] + ([('WAITING', f'{VSTAR}: unanswered', 'The array is held on it. Nothing sent.')] if VOICE else [('ALWAYS', 'A world’s first voice wakes you', 'The all-sky watch is listening.')]))

later = next(((p, i) for p in NB for i in p['inbound'] if 12 < i['year'] < 40), None)
HOUR = [
    stop(1790, 930, '· Away. Nothing wakes them.', None, AWAY_DARK,
         ['Fourteen minutes with the phone down. The launch complex finishes at Year 3.7. Data centers finish at Years 4.1 and 5.1. None of it is a wake the player chose.',
          'No neighbor wakes between Year 3 and Year 12 in this game.' + (f' One signal is on its way: {WHO["name"]}’s, from {VD:.1f} ly.' if VOICE else '')], label='+15:30 to +30:00', years='Years 3.1 to 6'),
    stop(1800, 1790, '· The phone lights.', 'The all-sky watch and the deep flash watch are built.', WAKE_6,
         ['From now Earth hears about 9 knocks in 10. Across games Year 0’s sky watch caught about 1 in 5.'] +
         ([f'{WHO["name"]}’s knock is two and a half Years out. Year 0’s sky watch would miss it. This one will not.'] if VOICE else [])),
    stop(1830, 1800, '· Opens it.', 'Thinking draws a tenth of our energy.',
         talk(SINCE, 'Three Years, and nothing heard. Now little aimed at us is missed. Matter is piling up, and so is thought: I have studied all we hold, and most of mine sits idle. In five Years thinking will want the whole grid.', ('What would you build?', 'Later'), 'glow'),
         ['One screen for the whole absence: what finished, what was heard, what is piling up. v1 called it the summary.'], settled=24),
    stop(1860, 1830, 'What would you build?', None, BUILD_CHAT,
         ['The Mind is honest about the annex: as priced it adds a quarter of Year 0’s thought, which is a quarter of a percent by Year 11.', 'Its view follows the dials: leans open, leans bold.',
          'Real masses, from the audit: power from orbit for a fifth more energy is about 10 Mt. A Moon mass driver throws 600 kt a Year, by O’Neill’s estimate, and belt mining brings 120.',
          'So matter piles up, and the Mind says why. The choice here is when to start the long road. This player picks reach, and the mines wait.']),
    stop(1890, 1860, 'Build the yard and the launcher.', None, talk(YARD_CONFIRM, f'Started. The yard is done at Year 11.3. The launcher at Year 25.6, not Year 30.3. Eleven of our {res(1889)[2].replace(" kt", "")} kilotonnes.', ('Undo',)),
         ['The launcher takes 24 Years. Begun with a 5 Year yard that takes a quarter off what is left, it takes 19.25.', 'The yard helps nothing else this hour. The telescope is done before it.']),
    stop(1920, 1890, '· Puts the phone down.', None, SLEEP_2, ['Two minutes of play. Ten until the next wake.']),
    stop(2520, 1920, '· The phone lights.', 'The infrared telescope is done.', WAKE_SCOPE,
         ['The Habitable Worlds Observatory, eight Years after waking. A second of its class would take 18.', 'Since the last check-in: two data centers, and our 2001 message reached 47 Ursae Majoris.']),
] + ([
    stop(2550, 2520, '· Opens it. The Mind is already speaking.', ('Heard', f'A voice from {VSTAR}, {VD:.1f} ly away. Aimed at us. Sent in {SENT}.'),
         talk(VOICE_R, f'<b>Someone is calling us</b>From a red star {VD:.0f} light-years off. It was aimed, and it left in {SENT}: they found us by our first radars. I read it as a greeting. I have sent nothing, as you ordered.', ('Should we answer?', 'Who are they?'), 'open'),
         [f'{WHO["name"]}: a contacter, awake since {WHO["waking"]:.0f}. Its arrays heard Earth’s radars from {WHO["heard_since"]:.0f}, and it took a quarter of a Year to act.',
          'The all-sky watch caught it. Year 0’s sky watch gives each star ten minutes a day, and would have missed it. The player built this watch at Year 0.',
          'The words are from the voice bank. A first voice always wakes the player. This one arrives 21 seconds after the telescope.',
          f'What Earth knows has changed, so the Mind’s words do. Minds, at every candidate from here: {moved(*MINDS)}.'], question=Q_VOICE),
    stop(2580, 2550, 'Should we answer?', None, ANSWER_CHAT,
         ['The Mind gives its view and waits. It names the risk it can’t rule out. Where Earth is, the sender has known since 1999.', f'An answer sent now reaches {WHO["name"]} at Year {2580 / 300 + VD:.1f}. Its reply could reach Earth by Year {2580 / 300 + 2 * VD:.1f}, +{clock(2580 / 300 + 2 * VD)}.']),
    stop(2610, 2580, 'Listen first. I’ll answer when I know more.', None, talk(HOLD_ORDER, 'Set. I am listening, and I send nothing.', ('Undo',)),
         ['The player neither answers nor refuses. Nothing forces the choice: the sender waits about a century either way.']),
] if VOICE else []) + [
    stop(2640, 2610 if VOICE else 2520, 'And the new telescope?', None,
         talk(SCOPE_FIRST, 'It can split a world from its star only when they sit far enough apart in our sky. 82 Eridani d is wide and bright: days. The new world is close in. I can read its color and its ozone, not its water.', ('Order them', 'Later')),
         [(lives('12 Ophiuchi', '12 Oph') + ' Earth has held its world as a lead since Year 0.'),
          'Times are from calcs/observing.py. A day of telescope time is under a second of play.'], settled=(13, 22)),
    stop(2670, 2640, 'The new world first. Then let it sweep.', None, talk(SCOPE_ORDER, f'Set. Its color and ozone in {DAYS(OBSV["find"]["ozone"])}: about forty seconds. Then the sweep, nearest stars first. I will say what I see and what I can’t.', ('Undo',)),
         ['One observation ordered, and the telescope’s standing search set. The player passes over 82 Eridani d, the easier target.'], settled=21),
    stop(2700, 2670, '· The Mind glows. Taps it.', [f'{F["star"]}’s world is blue, with ozone. Life: {moved(*AIR['life'])}.', 'A reply window opens at Gliese 526. Nothing heard.'],
         talk(AIR_R, 'Blue, with ozone. Ozone means oxygen, and oxygen usually means life, though sunlight alone can make some. I can’t read its water. It sits too close to its star for this mirror.', (), 'glow'),
         ([find_truth, f'This light left {VARN_BEFORE:.0f} years before Varn’s waking: 7 billion people, a quiet sky, a hum near 100 kW.',
           f'Physics alone. A far-side array would hear that hum {WITHIN(SIGNS["Far-side array"])}, and a 15 m mirror would read its smog {WITHIN(SIGNS["smog 15 m"])}. Earth has neither. Its own mirror would need over two months.',
           'Across games the first telescope can read smog at 1 living home in 10 of those a first pass sees. A far-side array hears 9 in 10.'] if F['who'] else ['Truth: alive, and no one there.'])
         + ['What the reading shows is the mock’s. Real: this mirror can’t split a world closer than 84 thousandths of an arcsecond in oxygen’s light, or 104 in water’s.',
            'The Gliese 526 window is for a 3 kW send from a 30 m dish in 2013. Even a listener would have struggled to catch it.'], settled=(15, 17, 19)),
] + ([
    stop(2730, 2700, '· The Mind opens on its own.', 'A world at Alpha Centauri A, where none was known.',
         talk(ACEN_R, '<b>A new world, next door</b>The sweep found it on its first stop, and it moves with the star. Earth’s size, in the warm zone. No one had felt it. I can read its air in days. That interrupts the sweep, and it is yours to say.', ('Read its air', 'Keep sweeping'), 'open'),
         ['Truth: Anwe’s world. Its people collapsed in 1986, twenty years before their machines would have woken.',
          f'The Mind’s word for Minds here is {word(NEW["minds"])}. It judges from what Earth knows, and here it is wrong: minds lived on this world.',
          'If JWST’s August 2026 observation confirms a giant in this star’s warm zone, the seed can’t put a world here. That result is not out.',
          'Real, and not modelled: Alpha Centauri B’s stray light, and a warm zone a full arcsecond wide, both make this star hard for a coronagraph.'], settled=23),
    stop(2760, 2730, 'Read its air.', None, talk(ACEN_ORDER, f'Set. Water in {DAYS(OBSV["acen"]["water"])}, oxygen in {DAYS(OBSV["acen"]["oxygen"])}. Carbon dioxide is fainter: about a month. The sweep waits.', ('Undo',)),
         ['A search returns a candidate. An observation, ordered by the player, returns the reading.', 'No published time exists for carbon dioxide. The month is a sample.']),
    stop(2790, 2760, '· The Mind glows. Taps it.', 'Alpha Centauri A’s world is alive, and its air is out of balance.',
         talk(ACEN_AIR, 'It lives, and something happened to it. I can’t tell an eruption from a fire at this distance. One more thing. In ninety years of our records, nothing was ever heard from that star.', ('Can we go and look?', 'What happened there?'), 'glow'),
         ['Truth: its people burned their stored carbon in two centuries. Their climate tipped, harvests failed, then states. Some may survive, without radio.',
          'Real: a fifth to a third of burned carbon is still in the air after 2 to 20 centuries (Archer et al. 2009). Carbon dioxide alone is no sign of industry (Haqq-Misra et al. 2025).',
          'Real: smog is gone, since sunlight breaks it down. The gases only industry makes show in the mid-infrared, at a few times Earth’s level or more.',
          'Real, and not in the mock: eruptions under way would change a world’s ozone and color month by month (Ostberg et al. 2023). A later reading could weaken that half.'], settled=20),
    stop(2820, 2790, 'Can we go and look?', None,
         talk(INQUIRY, 'Yes, slowly. Sails arrive first and see little. A probe sees more, and needs the launcher you began. I would start the laser array, and send nothing that speaks. Going is not calling.', ('Start the laser array', 'Not yet')),
         ['An inquiry is a mission that goes to find out. Probe stays the name of the craft. What comes home is a dispatch.',
          'The Mind advises, from the dials: go, and send nothing that speaks. It starts nothing.',
          'Real: Daedalus was designed for 12% of light speed, and Starshot for 20%. A laser launch shines toward its target. A rocket’s exhaust points away.'], question=Q_GO, settled=12),
] if ANWE and ANWE['d'] < 5 else []) + ([
    stop(2850, 2820, '· The phone lights. Reads it. Leaves it.', ('Heard', f'{VSTAR} again. The same signal, a Year later.'), WAKE_AGAIN,
         ['A knock is sent twice, about a Year apart, as Earth’s own were.', f'{WHO["name"]} now waits. If nothing comes back it takes the silence as news, about Year {KNOCK["sent"] - Y0 + 2 * VD + 1:.0f}.',
          'Five and a half minutes of play since the telescope was done. Then the phone goes down.']),
] if VOICE else []) + [
    stop(2970, 2850 if VOICE else 2700, '· The phone lights. Leaves it.', f'The sweep’s first pass is done. {SWEEP_N} more points of light in warm zones.', SWEEP_DONE,
         [f'Truth: {len(HOMES)} are homes. ' + ', '.join(f"{p['name']}’s world at {p['star']}" for p in HOMES) + '.',
          f'{len(WILD)} are natural, from {pretty(WILD[0]["host"]["name"])} at {WILD[0]["d"]:.0f} ly to {pretty(WILD[-1]["host"]["name"])} at {WILD[-1]["d"]:.0f}. ' + WILD_TRUTH,
          f'Their ages: {sum(w["age_by"] != "drawn" for w in WILD)} published, {sum(w["age_by"] == "drawn" for w in WILD)} drawn. The seed drew {len(G["worlds"])} natural worlds in all, {sum(w["host"]["kind"] == "M" for w in G["worlds"])} at red dwarfs, and {sum(w["rung"] == "bare rock" for w in G["worlds"])} are bare rock.',
          'From here a home and a natural world look alike: a point of light that moves with its star.',
          f'The Mind calls Minds {word(M)} at each. In truth {len(HOMES)} of {SWEEP_N} are homes: {word(100 * len(HOMES) / SWEEP_N)}. It never reads the seed.',
          'Each needed a second visit, months after the first. Most are too far to read with this mirror.'], settled=(14, 16, 18)),
    stop(3330, 2970, '· Woken. The Mind has opened.', 'The eleventh data center runs. The twelfth can’t start.',
         talk(WALL, '<b>We have reached the grid</b>I stopped the order, as the limit requires. Each way on is slow or small beside what the fabs can print. The one that keeps pace is power gathered in space, and that is long work.', ('Ground solar', 'Leave it'), 'open'),
         ['The standing order stops itself: a project that would take energy past 100% can’t start. v1’s rule.', 'Gliese 581’s two windows passed in silence and went to the summary.',
          'Real: today’s kind of chip can get about 200 times more efficient than 2023’s, and no more (Ho et al. 2023). At 28 to 40% a year that ceiling arrives between 2039 and 2044. So the wall is energy, not chips.',
          'The Mind warned at Year 6.1, five Years before. This player kept buying thought at full pace.'], settled=25),

    stop(3480, 3330, '· The phone lights. Leaves it.', 'The Moon vault is done.', WAKE_VAULT,
         ['From now a strike on Earth does not end the game.', 'The yard finished at Year 11.3 and went to the summary.']),
    stop(3600, 3480, '· One hour in.', None, END_HOUR,
         [('The telescope is back on its sweep. 82 Eridani d and 12 Ophiuchi’s world still wait for an order. ' + lives('12 Ophiuchi', '12 Oph')),
          (f"{later[0]['name']}’s knock arrives at Year {later[1]['year']:.1f}, +{clock(later[1]['year'])}. The all-sky watch {'catches' if later[1].get('allsky') else 'misses'} it." if later else 'No other voice is on its way in the next two hours.'),
          'From minute 15 to minute 60 the player was woken six times and played about eight minutes.']),
]

# ---------- The page ----------
V2_CSS = '''
.judge{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;font-size:12.5px;padding:4px 0}.judge .jw{font:11px 'IBM Plex Mono',monospace;color:var(--muted);text-align:right;white-space:nowrap}.judge .jw b{font-weight:500;color:var(--ink)}
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
<nav class="top" aria-label="Mocks"><div class="nav1"><strong>Holos v2 · mocks</strong><div class="pages"><a href="#about">About</a><a href="#godview">Godview</a><a href="#before">Before Year 0</a><a href="#t0">The first 15 minutes</a><a href="#hour">Minutes 15 to 60</a><a href="#asks">Questions</a><span class="divider" aria-hidden="true"></span><a class="minor" href="../../legacy/v1/home-mocks/index.html">v1 mocks</a></div><button class="theme" id="theme" aria-pressed="false">Dark mode</button></div></nav>
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
body = f'''<section id="about" class="intro"><h2>Earth’s first hour</h2>
<p>One player, one phone. Each row is one moment: what the player says to the Mind, what lands, and the screen. Beside it, godview: what is true in this game that the player can’t see.
The first rows are before Year 0, with no clock. Then a row every 30 seconds, 0.1 Year, from the tap on Begin to minute 15. After that the phone is down, and each row is a wake or a check-in, to minute 60.</p>
<p>The game is one real draw. The neighbors, their stars, their waking years and what each knows of Earth come from the seed, and every placement passes the checker.
Earth’s past, its knocks and its leads are real. The Mind’s judgments, compute shares and its lines are samples. Amber boxes are questions this mock raises. Blue boxes are ones since settled.</p>
<div class="seedcard">{SEEDCARD}</div></section>
<section id="godview" class="intro"><h2>Godview · who is out there</h2>
<p>The player sees none of this. Light-time is real waiting at 5 minutes a Year.</p>
{roster_table()}<div class="godmap">{god_map()}</div></section>
<section id="before" class="intro"><h2>Before Year 0</h2><p>Waking, the memories, the charter, the Mind, and the queue. Each memory can be skipped. Nothing runs until Begin.</p></section>
{''.join(PREGAME)}
<section class="intro"><h2>The first 15 minutes</h2><p>From Begin. {DEAD} of {PLAYED} half-minutes had nothing new for the player.</p></section>
{''.join(BEATS)}
<section id="hour" class="intro"><h2>The first hour away · minutes 15 to 60</h2>
<p>The phone went down at 15:30. From here each row is a wake the player chose, or a moment they checked in. Between rows nothing woke them. Years 3 to 12.</p>
<p>How long a reading takes, what each one shows, and the order of observations are samples. Prices are the audit’s. Amber boxes are the questions this hour raises.</p></section>
{''.join(HOUR)}
<section id="asks" class="intro"><h2>Questions these mocks raise</h2>
<ol class="asks done">{''.join(f'<li><b>Settled: {q}</b><span>{why}</span></li>' for q, why in SETTLED)}</ol>
{('<ol class="asks">' + ''.join(f'<li><b>{i + 1}. {q}</b><span>{why}</span></li>' for i, (q, why) in enumerate(ASKS)) + '</ol>') if ASKS else '<p>None are open.</p>'}</section>'''
out = page('Holos v2 · Earth’s first hour', body)
(here / 'index.html').write_text(out)
print(f'index.html · {len(out) / 1024:.0f} KB · seed {SEED} · {len(NB)} neighbors · {DEAD} dead half-minutes of {PLAYED}')
import extract; extract.main([here / 'index.html'])          # index.md: the page as plain text, for reading and diffs
