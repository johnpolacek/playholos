"""Holos v2 mock: Earth's first hour. One phone, with a godview lane. Writes index.html beside this file.
Run: python3 explorations/v2-mocks/build.py [seed]

Each row is one moment: what the player says, what lands, and the phone. Beside it, godview: what is true in this
game that the player can't see. The game is one draw of calcs/seed.py. Prices are HOLOS_PROJECT_AUDIT.md's.
Odds on clue screens, compute shares and the Mind's lines are samples, to be tested here.
"""
from kit import *

F, D = FIND, FIND['d']
AND = lambda xs: xs[0] if len(xs) == 1 else ', '.join(xs[:-1]) + ' and ' + xs[-1]
F2 = FINDS[1] if len(FINDS) > 1 else None          # the next nearest world Earth has felt, if it holds more than one
FARTHER = '' if not F2 else 'a little farther' if F2['d'] < 1.3 * D else 'twice as far' if F2['d'] < 2.5 * D else f'{F2["d"] / D:.0f} times as far'
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
           ('What happens at the grid limit?', 'The plateau stands. Thought stops growing when it draws the whole grid, about Year 11 at full pace, and better chips don’t dodge it: today’s kind reaches its efficiency ceiling near Year 0. The Mind warns five Years ahead. The ways on are slow, and the megatonne road pays here. Settled 2026-10-13.'),
           ('How much of a knock can the Mind read?', 'All three layers, at once. What it proves, from physics. What it holds, because a knock is built to be read. And what it means, as a word that can be wrong. A stranger neighbor’s message may yet need a study. Settled 2026-10-13.'),
           ('What may an answer hold?', 'What v1 allowed, whole. The player writes what they mean in plain words. The Mind composes it from typed parts: a finding, a sighting, an archive, our culture, a request, a verdict. The player approves before anything goes. A lie is a forged part, marked for the sender alone. Settled 2026-10-13.'),
           ('What does an inquiry cost in time?', 'Decades, by physics. A laser array takes 25 Years: Starshot aimed at a launch within a generation. Sails then cross 4.3 light-years in 22, and word takes 4.3 to come home. A flyby probe takes 12 Years after the launcher, and 36 in flight. Priced 2026-10-13, as samples.'),
           ('What is 86 times the thought for?', 'Speed. More thought shortens a work, down to a floor physics sets: about two thirds of its standard time. Space missions that could not miss a launch window took 53 months, against 64 to 84 for the rest. Rock from the Moon and flight between stars are physical, and thought shortens neither. Settled 2026-10-13.'),
           ('How much thought does a work want?', 'As its real cousin costs money, counted in flagships. One flagship is the Habitable Worlds Observatory, about 11 billion dollars. A 15 m mirror wants two, the laser array 0.7, an SKA-class array 0.2. At Year 0 Earth has thought for about 7 flagships, and at the grid limit for about 577. Megatonne works have no real price, so theirs are samples. Settled 2026-10-13.'),
           ('How is thought split among works?', 'By an order the player sets. A new work joins the end of the line. The Mind gives each work its want, in order, then pushes each in turn to ten times its want. So no work stops because another is first. The order moves the mirror and the sails by four to five Years, and power from orbit by about one: rock from the Moon sets that pace. Settled 2026-10-14.'),
           ('A knock Earth can’t hear: should a candidate world earn a listen?', 'The Mind advises it. When the sweep marks worlds, it says a deep-field receiver would hear their knocks about three times farther than the all-sky watch. The player decides. The Mind never builds it on its own. Settled 2026-10-14.'),
           ('One receiver, many marked worlds: how does it share its watch?', 'It is split. The player names the stars it holds, and each part hears less far, as real dish arrays do. On one star it hears a ten gigawatt knock to 117 ly. On four, to 59. On more than eleven, no farther than the all-sky watch. A dish array can’t hold scattered stars at full reach. Settled 2026-10-14.'),
           ('What can the player do with a suspicion?', 'Anything v1 allows, at any world: listen, look, go or knock. The Mind says what it knows, what each act risks, and when each answers. For four smog worlds at Year 22: radio from the nearer ones by Year 34, a solar lens picture of one world by Year 46 to 48, sails’ word after Year 200. Settled 2026-10-14.'),
           ('What does a picture show?', 'Everything larger than a pixel, and nothing smaller. Physics sets the pixel, and the seed’s world fills it. A solar lens: about 25 km at 30 pc, so cities and cleared land, never roads. The nearest sail of a swarm: about 20 m, so roads and dams, never single buildings. Settled 2026-10-14.'),
           ('Earth has proof of minds who don’t know they are heard. What may it do?', 'Anything v1 allows, as with a suspicion. And they can answer. Before its Mind wakes, a world with radio arrays may answer as a people, as Earth’s own senders have: about ten aimed sends since 1974, none after the world was asked. The seed rolls whether and how, and its Mind inherits the exchange. Settled 2026-10-14.'),
           ('What does a late answer cost?', 'Nothing extra. A sender listens for good, so a late answer is always heard. Its own tables carry the cost: by the time the answer lands, it may have knocked again or turned to others, and it rolls its table for an answer like any other. The Mind tells the player what the sender has likely done. Settled 2026-10-14.'),
           ('Is the plateau too quiet, and too long?', 'No. Replayed with paced works, the solar lens and listening again with each fifth, the third mock wakes the player twelve times in about three hours: about as often as the first hour. The longest quiet is 35 minutes. Every wake comes from a settled rule or the player’s own orders, and the player chooses what wakes them. Settled 2026-10-14.'),
           ('A neighbor sends a probe to Sol. What arrives, and does Earth see it?', 'A rocket, as v1 had it: a 20-Year build, a tenth of light speed. Its braking flame is X-rays, seen only in its last weeks, within a few AU, by an X-ray sky watch Earth must build. Small dark sails were set aside to keep the game simple: the Sun can catch one only below 3.8% of light speed, so they almost never arrive in play. Settled 2026-10-14.')]

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
    return f"Its {' and '.join(sorted({u['move'] for u in p['unheard']}))} reached Earth in {' and '.join(years)}. No one was listening.{then}"
def does(p):
    if not p['heard']: return ''
    return (f"{MOVE[p['on_hum']]}" if p['knows'] <= Y0 else f"at waking: {MOVE[p['on_hum']]}")
def colonies(p):
    cs = [c for c in G['colonies'] if c['root'] == p['name'] and c['lands'] < Y0 + 60]
    return ' '.join(f"{'Its colony' if c['depth'] == 1 else 'A colony of its colony'} at {pretty(c['star']['name'])}, {c['hop']:.1f} ly from its parent, lands {seedmod.year(c['lands'])}." for c in cs[:3]) + (f' {len(cs) - 3} more by Year 60.' if len(cs) > 3 else '')
def inbound(p):
    return (colonies(p) + ' ' if colonies(p) else '') + ' '.join(f"Its {q['kind']} probe, sent {q['what']}, reaches Sol at Year {q['year']:.1f}: {'its braking flame shows only close in, in X-rays' if q['bright'] else 'dark'}." for q in p.get('probes', ())) + ' ' * bool(p.get('probes')) + ' '.join(f"{i['what'][0].upper() + i['what'][1:]}: sent {seedmod.year(i['sent'])}, reaches Earth Year {i['year']:.1f}, +{clock(i['year'])}. "
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
    *(row(f'A new world · {f["star"]}', f'felt by {f["by"]} in {f["found"]} · at least {earths(f["msini"])}', clock(f['d']), 'other', marker=True) for f in FINDS),
    row('Too many collisions · Fomalhaut', 'a second dust cloud since 2023', clock(25.1), 'other', marker=True),
    row('A reply could come · Luyten’s Star', 'to our 2017 message', tstack(f'Year {LUY_Y[0]}', clock(LUY_Y[0])), 'other', marker=True)]
P_LEADS = home(0, f'LEADS · {len(LEAD_ROWS)}', 'LIGHT-TIME', LEAD_ROWS, **PRE)

# Settled 2026-10-14: every build is paced by the line. Standard: the watches 6 Years, the telescope 8 left of 18, the
# vault 10. Paced, from calcs/early_game.py first_hour(). Data centers are paced by the fabs: a Year each.
SKY_Y, VAULT_Y, IR_Y = FH['All-sky watch'], FH['Moon vault'], FH['Infrared telescope']
SKY_YEARS, FLASH_YEARS, DC_YEARS, IR_YEARS, VAULT_YEARS = round(SKY_Y, 1), round(FH['Deep flash watch'], 1), 1, round(IR_Y - .4, 1), round(VAULT_Y - 1.6, 1)
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
<p class="copy">At least {earths(f['msini'], 'Earth mass')}. A year of {f['period']:.0f} days, {f['a']:.2f} AU out, inside its star’s warm zone. It doesn’t cross its star, so we have its least mass and not its size.</p>
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
NUMW = ('no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen')
N_TENTH = math.ceil(math.log(10 / THINK) / math.log(DC_STEP)); TENTH_Y = N_TENTH + .1      # the standing order's centers finish at Years 2.1, 3.1, ...
SECOND = running(330, [quick(f'Listen to {F["star"]} for a Year', f'Radio array · tones above {FLOOR}', tstack('under way', clock(1), True))])
FEAR_CHAT = chat(420, 'What should we fear?', [
    ('you', 'What should we fear?'),
    ('mind', 'A strike. Something heavy, thrown at a tenth of light’s speed, ends a world. It takes an industry we are more than a century from. So is anyone who woke when we did.'),
    ('you', 'And anyone who woke earlier?'),
    ('mind', 'Could have it. A launch that size is hard to hide and takes decades to arrive. I see none. With what we have, I would see only the brightest.')],
    view=f'A second home for me before anything else. A vault in the Moon’s rock: about {round(VAULT_YEARS)} Years, ten kilotonnes. Then I outlive a hit on Earth.')
VAULT_CONFIRM = confirm(480, 'Endure', 'Deep vault', 'Your first hedge: the Mind survives a hit on Earth.',
    'A second home for the Mind, dug into rock beside the Moon’s south-pole stations, with its own power and a laser link home.',
    SEC('HELPS WITH') + '<div class="helps"><span class="mk you"></span><span><b class="you">The game goes on if Earth is struck</b><span class="sub">While one Mind of Earth’s survives anywhere, so do you</span></span></div>',
    10, f'<b>10 kt</b><span>of metal, from {res(479)[2]} spare in orbit</span>', VAULT_YEARS, world_strip(builds(479, [('Deep vault', 'moon', 0)]), 'ORBIT · EARTH · WHERE IT WILL BE BUILT'))
LAUNCH_CONFIRM = confirm(510, 'Grow', 'Launch complex', 'More matter every Year, soon.',
    'More pads and ships, flying around the clock. All of what it lifts is spare: nothing up there depends on it yet.',
    SEC('GIVES') + '<div class="helps"><span class="mk you"></span><span><b class="you">+40 kt of lift a Year</b><span class="sub">Spare lift goes from 15 kt a Year to 55</span></span></div>',
    3, '<b>None</b><span>a ground build, from Earth’s own industry</span>', 2, world_strip(builds(509, [('Launch complex', 'ground', 0)]), 'ORBIT · EARTH · WHERE IT WILL BE BUILT'))
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
        (round(SKY_Y, 1), 'The all-sky watch and flash watch are built', 'then little aimed at us is missed'), (9.0, 'A reply could come · Gliese 526', 'to our 2013 message'),
        (TENTH_Y, 'Thinking draws a tenth of our energy', f'{N_TENTH} data centers in'), (round(VAULT_Y, 1), 'The Moon vault is done', 'the Mind’s second home'),
        (round(IR_Y, 1), 'The infrared telescope is done', f'then it reads 82 Eridani d and {F["star"]}')])),
    SEC('ALWAYS'), row('A world’s first voice wakes you', 'a knock or a broadcast, aimed at us or not · even in quiet hours', '<span class="mono">always</span>'),
    SEC('NOT WAKING YOU'), quick('Data centers finishing', 'in the daily summary', ''), quick('Windows that pass in silence', 'in the daily summary', '')]))
LOCK = lockscreen('16:40', [(f'IN 00:{round((SKY_Y - 3) * 5):02d}:00', 'Earth: the sky watch and flash watch are built', f'Year {SKY_Y:.1f}. Anything heard wakes you sooner.')])

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
                                            ('Before Year 0, ' + str(N_UNHEARD) + (' knocks' if {u['move'] for p in NB for u in p['unheard']} == {'knock'} else ' aimed signals') + ' reached Earth unheard: '
                                             + ', '.join(f"{p['name']}’s {' and '.join(sorted({u['move'] for u in p['unheard']}))} in {' and '.join(sorted({format(u['arrived'], '.0f') for u in p['unheard']}))}" for p in NB if p['unheard']) + '. Nothing recorded them, so no archive holds them.') if N_UNHEARD else 'No knock reached Earth before Year 0 in this game. About 1 game in 5 has one that Earth missed.'], settled=6),
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
    beat(60, 'Later. And the new worlds?' if F2 else 'Later. And the new world?', ('Neither new world crosses its star.' if len(FINDS) == 2 else f'None of the {NUMW[len(FINDS)]} new worlds crosses its star.') if F2 else f'{F["star"]}’s world doesn’t cross its star.',
         talk(find_clue(60), ('The nearer one first. ' if len(FINDS) == 2 else 'The nearest first. ' if F2 else '') + f'It doesn’t cross, so its air stays hidden. I can listen for a Year, at a tenth of compute. That hears only the loud: tones above {FLOOR}.', ('Listen for a Year', 'Later')),
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
         ['A standing order, the player’s. Without it compute never grows on its own.', f'At full pace the grid becomes the wall near Year {round(DC_DONE[-1])}, +{clock(round(DC_DONE[-1]))}. Then more thought needs more energy, or colder chips in orbit.'], settled=3),
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
    beat(480, 'Build the vault.', None, talk(VAULT_CONFIRM, f'Started. About {round(VAULT_YEARS)} Years, and ten of the {res(479)[2].replace(" kt", "")} kilotonnes we have spare. Lift brings fifteen more a Year. A launch complex would bring forty on top.', ('Build a launch complex', 'Undo')),
         ['Asked for at Year 0, the vault would have taken half the spare stock.'], settled=4),
    beat(510, 'Build a launch complex.', None, talk(LAUNCH_CONFIRM, 'Started. Two Years, no matter, a thirtieth of our thought. From Year 3.7 lift brings fifty-five kilotonnes a Year.', ('Undo',)),
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
    (beat(780, 'And the other new world?' if len(FINDS) == 2 else 'And the other new worlds?', None,
          talk(find_clue(780, f=F2, key='find2', busy='free at Year 3, after the Luyten windows'),
               f'{F2["star"]}, {FARTHER} and {"heavier" if F2["msini"] > F["msini"] else "lighter"}. It doesn’t cross either.' + (f' {NUMW[len(FINDS) - 2].capitalize()} more are on the list.' if len(FINDS) > 2 else '') + ' The array is on Luyten’s Star until Year 3. I can listen here next, if you say so.', ('Queue it', 'Later')),
          [(f"Truth: {F2['star']}’s world is {F2['who']}’s home." if F2['who'] else f"Truth: {F2['star']}’s world is natural."),
           f'The Mind led with the {"nearer" if len(FINDS) == 2 else "nearest"} world. This one was on the list from Year 0, and the player comes to it in a quiet half-minute.',
           'The Mind offers and waits. The array is the player’s to point.']) if F2 else beat(780)), beat(810),
    beat(840, '', 'The last radar sweep has left Earth. Ninety years of them are still on their way out.', None,
         ['Earth now gives off a faint hum, like every neighbor. Nothing that already left is changed.']),
    beat(870, '· The Mind glows. Taps it.', 'The second window opens. Nothing heard.',
         talk(window_screen(870, 1), 'The second window, for our 2018 message. Silent too. I’ll hold the array there until Year 3, as you ordered, then give it back to the sky.', state='glow')),
    beat(900, 'Wake me for the big things.', None, talk(WAKES, f'Set. Five things wake you, and any first voice. The next is at Year {SKY_Y:.1f}, {NUMW[round((SKY_Y - 3) * 5)]} minutes from now.', ('Undo',))),
    beat(930, '· Puts the phone down.', None, LOCK, label='+15:30'),
]
PLAYED = 31

# ---------- The first hour away: minutes 15 to 60, Years 3 to 12 ----------
# The player put the phone down at 15:30. Each row is a wake, or a moment they chose to look. Build times, the
# telescope's observing times and what each reading shows are samples, to be tested here. Prices are the audit's.
import json
ANWE = next((p for p in NB if p['dead']), None)
VOICE = next(((p, i) for p in NB for i in p['inbound'] if 6 < i['year'] <= 12 and i.get('allsky')), None)     # a signal the all-sky watch catches this hour
# The first hour's rows sit at the telescope's paced finish, half a minute apart: Year 6.1 at full compute.
T_SCOPE = round(IR_Y * 10) * 30
T = lambda k: T_SCOPE + 30 * k
ACEN_ON = bool(ANWE and ANWE['d'] < 5)                                        # a dead world next door: the rows that read it
LIVE = next((p for p in NB if not p['dead'] and p['swept'] and not p['found_by_2040'] and p['d'] < 5), None)       # a living world next door
LIVE_ON = bool(LIVE) and not ACEN_ON
T_SLEEP = T(10) if ACEN_ON else T(12) if LIVE_ON else T(6)
VARN_BEFORE = (truth_tone['waking'] - Y0 - (T(5) / 300 - D)) if F['who'] else None      # years before its waking that the light of the first reading left

# Settled 2026-10-13: the Mind judges from what Earth knows, never from the seed. Until a voice is heard, Minds is almost no
# chance at any candidate. A first voice lifts it a word everywhere. Each pair is before and after, hidden samples.
MINDS = (3, 12)
M = MINDS[1] if VOICE else MINDS[0]
AIR = dict(life=(18, 56), rock=(49, 22), gas=(21, 8), minds=(12, 14)) if VOICE else dict(life=(13, 60), rock=(60, 26), gas=(25, 10), minds=(2, 4))
NEW = dict(rock=50, life=38, minds=12) if VOICE else dict(rock=60, life=37, minds=3)

LOG = []                                     # (t, what the player did): the hour's rows, to count wakes and minutes played
WOKEN = lambda: sum(said.startswith(('· The phone lights', '· Woken')) for t, said in LOG if 930 < t < 3600)
PLAYED_MIN = lambda: sum(0 if 'Leaves it' in said and 'Reads it' not in said else .25 if 'Reads it' in said else .5 for t, said in LOG if 930 < t < 3600)
def stop(t, since, said='', lands=None, phone=None, notes=(), question=None, label=None, years=None, settled=None):
    LOG.append((t, said))
    seeded = truths(since / 300, t / 300)
    return (f'<section id="t{t}" class="brow{" tall" if phone else ""}"><div class="bhead"><span class="bt mono">{label or f"+{t // 60}:{t % 60:02d}"}</span><span class="gy">{years or f"Year {yr(t)}"}</span></div>'
            f'<div class="v2grid">{cell(said, lands, phone)}<div class="gcell">{godcell(seeded + list(notes), question, settled)}</div></div></section>')

# Settled 2026-10-14: the first hour is paced by the line. The watches are built at Year 4.2 and the telescope at 6.1, so
# the telescope's readings and the laser array come before Ombe's knock, which physics fixes at Year 8.5.
CLOCK_AT = lambda t: (lambda x: f'{x // 3600 % 24}:{x % 3600 // 60:02d}')(16 * 3600 + 24 * 60 + 30 + t)
T_WATCH = round(SKY_Y * 300)                                                  # the telescope is done at T_SCOPE, with the Mind's warning
SWEEP_Y = round(IR_Y + 1.5, 1); T_SWEEP = round(SWEEP_Y * 300)               # a first pass, with second visits months later
T_VAULT = round(VAULT_Y * 300)
WAKE_6 = lockscreen(CLOCK_AT(T_WATCH), [('NOW', 'Earth: the sky watch and flash watch are built', f'Year {SKY_Y:.1f}. Little aimed at us is missed now.'),
                                       (f'IN 00:{(T_SCOPE - T_WATCH) // 60:02d}:{(T_SCOPE - T_WATCH) % 60:02d}', 'Earth: the infrared telescope is done', f'Year {IR_Y:.1f}. Then it reads the air of nearby worlds.')])
WALL_Y = DC_DONE[-1]; T_WALL = round(WALL_Y * 300)                         # the last data center that fits: Year 11.1 at full compute
TO_WALL = NUMW[round(WALL_Y - T_SCOPE / 300)]
DC_SINCE = [d for d in DC_DONE if 3.1 < d <= T_SCOPE / 300 + .01]
IDLE = 100 - res(T_SCOPE)[1]
IDLE_SAYS = ('Matter is piling up, and so is thought: most of mine sits idle.' if IDLE >= 50 else 'Matter is piling up, and some thought sits idle.' if IDLE >= 10 else
             'Matter is piling up. Thought is not: the works in your line take all of it.')
SINCE = tab(T(0), 'Home', 'SINCE YOU LEFT', f'YEAR 3.1 TO {yr(T_SCOPE)}', ''.join([
    SEC('FINISHED'), row('Infrared telescope', f'Year {IR_Y:.1f} · reads the air of nearby worlds', done_tag()), row('All-sky watch and deep flash watch', f'Year {SKY_Y:.1f} · every direction, every hour', done_tag()),
    row('Launch complex', 'Year 3.7 · lift is 55 kt a Year', done_tag()), row(f'{NUMW[len(DC_SINCE)].capitalize()} data centers', f'thought is {DC_STEP ** sum(d <= T_SCOPE / 300 + .01 for d in DC_DONE):.0f} times what you woke with', done_tag()),
    SEC('OURS, ARRIVING'), quick('Our 2003 message reached 55 Cancri and HD 10307', 'Years 4.6 and 5.1 · a reply could come from Year 45.6', ''),
    SEC('PILING UP'), quick('Matter', f'{res(T(0))[2]} spare in orbit · 55 kt more each Year · nothing booked', ''), quick('Thought', f'{100 - res(T(0))[1]}% of it idle', '')]))
BUILD_CHAT = chat(T(1), 'What would you build?', [
    ('you', 'What would you build?'),
    ('mind', 'Matter is not our limit: what I can build weighs tonnes. Reach: a launcher, then probes. Grow: mines in the belt. Think: an annex.'),
    ('you', 'And the grid?'),
    ('mind', f'In {TO_WALL} Years thinking wants all of it. An annex is a crumb. Power from orbit keeps pace: ten megatonnes, 180 Years of our lift. Mines and a Moon driver make that in decades.')],
    view='A yard and a launcher. We know of warm worlds and can reach none. I would rather be able to go and look than think faster about not going.')
YARD_CONFIRM = confirm(T(2), 'Reach', 'Orbital yard and launcher', 'A way to go and look.',
    'A yard to assemble what Earth lifts, and beside it a launcher: a dock and fuel depot for probes. Begun together, the yard takes a quarter off what is left of the launcher.',
    SEC('GIVES') + f'<div class="helps"><span class="mk you"></span><span><b class="you">Inquiries by probe, from about Year {ROAD["launcher"]:.0f}</b><span class="sub">The yard alone is done at Year {FH["Orbital yard"]:.1f}</span></span></div>',
    14, f'<b>11 kt</b><span>of metal, from {res(T(2) - 1)[2]} spare in orbit</span>', round(ROAD['launcher'] - 6.3, 1))
SLEEP_2 = lockscreen(CLOCK_AT(T_SLEEP), [(f'IN 00:{(T_SWEEP - T_SLEEP) // 60:02d}:{(T_SWEEP - T_SLEEP) % 60:02d}', 'Earth: the sweep’s first pass', f'Year {SWEEP_Y:.1f}. Any candidate wakes you.')])
if VOICE:
    WHO, KNOCK = VOICE; VSTAR, VD = WHO['star'], WHO['d']; SENT = int(KNOCK['sent'])
    BANK = json.loads((here.parents[1] / 'data' / 'voices' / f"{WHO['name'].lower()}.json").read_text())
    VOICE_R = tab(2550, 'Report', 'REPORT', 'A VOICE', f"""<button class="backlink inline">‹ All reports</button>
<h3 class="lead">A voice from {VSTAR}</h3>
<p class="copy small">{VSTAR} · {VD:.1f} ly · all-sky watch · sent {VD:.0f} Years ago</p>
{SEC('WHAT IT PROVES')}{facts([('Aimed', 'four hours long, tuned to our motion'), ('Found us by', f'{SENT}. They had seen light that left Earth by {SENT - VD:.0f}.'), ('Not a reply', 'We never sent anything to this star.')])}
{SEC('WHAT IT HOLDS · READ AT ONCE')}<div class="intent">{BANK['hail'][0]} {BANK['close'][0]}</div><p class="copy small">It opens with a primer, as ours did. The words are mine for theirs.</p>
{SEC('WHAT IT MEANS')}{odds_now('A greeting, meant as it reads', 65)}{odds_now('Bait, or a test of us', 22)}
{SEC('WHAT IT CHANGES · BEFORE → NOW')}{odds('Minds, at other worlds', *MINDS)}""")
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
# The player reads the nearest felt world the mirror can read: the Mind leads with the nearest, and passes over the
# ones it can't read. If it can read none of them, the nearest stands, and its screen says so.
# If it can read none, it reads 82 Eridani d, the lead it can: 30% of games. Its truth is the mock's sample.
ERI = dict(star='82 Eridani', d=19.7, radius=2.0, a=1.354, host=dict(luminosity=0.66, name='82 Eri'), rung='gas', who=None, msini=5.8)
FO = next((f for f in FINDS if first_read(f)['mode']), ERI); FR = first_read(FO); FD = FO['d']
UNREAD = [f for f in FINDS if f is not FO and not first_read(f)['mode']]
OBSV = {k: observing.observe(ly / 3.2616, r, a, lum) for k, ly, r, a, lum in (
    ('find', D, F['radius'], F['a'], F['host']['luminosity']), ('eri', 19.7, 2.0, 1.354, 0.66), ('acen', ANWE['d'] if ANWE else 4.3, 0.97, ANWE['a'] if ANWE else 1.2, 1.52))}
DAYS = lambda d: f'{d * 24:.0f} hours' if d < 2 else f'{d:.0f} days'
# Settled 2026-10-13: physics alone. What the next instruments would need at the find, if it gives off what Earth does:
# a far-side array on a 100 kW tone, and each mirror on Earth's level of smog. From calcs/signs.py.
WITHIN = lambda x: f'in {signs.tell(x)}' if isinstance(x, float) and x < math.inf else 'out of reach'
FAR_HUM = signs.listen_days(1e5, FD, signs.EARS[2][1])
FAR_FIRST = signs.listen_days(1e5, FD, signs.far_sefd(1))             # settled 2026-10-13: it grows in fifths, and the first hears less
SMOG_NOW, SMOG_WIDE = (signs.smog_days(*m, FD / 3.2616, FO['radius'], FO['a'], FO['host']['luminosity']) for m in signs.SMOG)
SIGNS = signs.read(truth_tone) if F['who'] else None
# What the search's first pass shows, beyond the worlds Earth holds already: neighbors' homes, and natural worlds.
NEAR_ACEN = bool(ANWE and ANWE['d'] < 5)
HOMES = [p for p in NB if p['swept'] and not p['found_by_2040'] and not (p is ANWE and NEAR_ACEN) and not (p is LIVE and LIVE_ON)]
WILD = [w for w in G['worlds'] if w['swept'] and not w['felt']]
SWEEP_N = len(HOMES) + len(WILD)
PASS_STARS, PASS_DAYS = seedmod.first_pass(ROWS)
PASS_WEEKS = ('', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten')[round(PASS_DAYS / 7)]
NEAREST = min(HOMES + WILD, key=lambda x: x['d'])
WILD_TRUTH = 'Truth: ' + ', '.join(f"{n} {r}" for r in seedmod.RUNGS for n in [sum(w['rung'] == r for w in WILD)] if n) + '.'
WHERE = dict(wide='wide of its star in our sky', close='close to its star in our sky')
def scope_choice(f, on=False):
    r = first_read(f)
    sub = f'{WHERE[r["mode"]]} · {r["what"]}' if r['mode'] else 'close in and faint · seen, not read' if r['seen_h'] else 'inside its star’s glare · not seen'
    return choice(f'{f["star"]}’s world', sub, tstack(DAYS(r['days']), clock(r['days'] / 365.25)) if r['mode'] else '<span class="mono">out of reach</span>', on)
NEWW = 'The new world' if FO is F else '82 Eridani d' if FO is ERI else f'{FO["star"]}’s world'
SCOPE_SAYS = ('It can split a world from its star only when they sit far enough apart in our sky. 82 Eridani d is wide and bright: days. '
              + ('' if FO is F else 'None of the new worlds can be read with this mirror: each sits too close to its star, or is too faint. ' if FO is ERI else f'{F["star"]}’s world sits too close to its star, or is too faint. ')
              + (f'{NEWW} is close in. I can read its color and its ozone, not its water.' if FR['mode'] == 'close' else
                 '' if FO is ERI else f'{NEWW} sits wide of its star too: water in {DAYS(FR["water"])}, oxygen in {DAYS(FR["oxygen"])}.' if FR['mode'] == 'wide' else 'None of the new worlds can be read with this mirror.'))
SECS = ('', 'five', 'ten', 'fifteen', 'twenty', 'twenty-five', 'thirty', 'thirty-five', 'forty', 'forty-five', 'fifty')
SCOPE_FIRST = tab(T(3), 'Mind', 'MIND', 'THE NEW TELESCOPE', ''.join([
    SEC('ONE WORLD AT A TIME · YOURS TO ORDER'), '<div class="choices" role="radiogroup">',
    *([] if FO is ERI else [scope_choice(FO, True)]), choice('82 Eridani d', f'wide and bright · water, then oxygen', tstack(DAYS(OBSV['eri']['oxygen']), clock(OBSV['eri']['oxygen'] / 365.25)), FO is ERI),
    *(scope_choice(f) for f in FINDS if f is not FO and first_read(f)['mode']),
    (scope_choice(UNREAD[0]) if len(UNREAD) == 1 else quick(' · '.join(f['star'] for f in UNREAD), 'close in or faint · seen, not read', '<span class="mono">out of reach</span>') if UNREAD else ''), '</div>',
    SEC('WHEN IDLE · ITS SEARCH'), quick(f'The warm zones of {PASS_STARS} near stars', f'nearest first · a first pass takes about {PASS_WEEKS} weeks', '<span class="start"><button>Set</button></span>'),
    SEC('WHAT SETS THE TIME'), '<p class="copy small">How bright the world is from here, and how far it sits from its star’s glare.</p>']))
READ_WHAT = 'water and oxygen' if FR['mode'] == 'wide' else 'color and ozone'
FIRST_WANT = 'The new world first. Then let it sweep.' if FO is F else '82 Eridani d first. Then let it sweep.' if FO is ERI else f'{FO["star"]}’s world first. Then let it sweep.'
SCOPE_ORDER = order(T(4), FIRST_WANT, [
    ('OBSERVE', f'<b>{"82 Eridani d" if FO is ERI else FO["star"] + "’s world"}</b> · its {READ_WHAT} · {DAYS(FR["days"])}'), ('WHEN IDLE', f'<b>Search the warm zones of {PASS_STARS} near stars</b> · nearest first'),
    ('WHY', 'An observation holds the telescope. The sweep takes whatever time is left.'), ('WAKES YOU', 'Each reading · any candidate')])
# What the reading shows: oxygen, a sea without it, or no air. Texts and odds are samples. The odds move on what the
# mirror saw, and the Mind never reads the seed.
SHOWS = 'gas' if FO is ERI else shows(FO) if shows(FO) != 'dead' else 'oxygen'
GLARE = f'Its water and oxygen bands sit inside its star’s glare for this mirror: the world is {FR["sep"]:.0f} thousandths of an arcsecond from its star.'
READING = {('oxygen', 'close'): ('A blue world with ozone', f'Blue, as air scatters light. And ozone, which sunlight makes from oxygen. {GLARE}'),
           ('oxygen', 'wide'): ('Water and oxygen', 'Water vapor, and oxygen beside it, in an air that scatters blue. Oxygen this rich is hard to keep without life, though sunlight on water makes a little.'),
           ('sea', 'close'): ('A blue world without ozone', f'Blue, as air scatters light. No ozone, so little or no oxygen. {GLARE}'),
           ('sea', 'wide'): ('Water, and no oxygen', 'Water vapor, in an air that scatters blue. No oxygen. A sea with no life looks like this, and so does one with only microbes.'),
           ('bare', 'close'): ('No air we can see', f'Grey. No blue, so little or no air, and no ozone. {GLARE}'),
           ('bare', 'wide'): ('No air we can see', 'Grey, with no water and no oxygen. Air thick enough to hold either would show.'),
           ('gas', 'wide'): ('A thick air, and no oxygen', 'Water vapor under a thick, hazy air, all through its long year. No oxygen. A world this heavy most likely kept the gas it was born with.')}
READ_HEAD, READ_COPY = READING[(SHOWS, FR['mode'] or 'close')]
if SHOWS in ('sea', 'bare'):
    AIR = (dict(life=(18, 26), rock=(49, 64), gas=(21, 6), minds=(12, 4)) if VOICE else dict(life=(13, 22), rock=(60, 70), gas=(25, 7), minds=(2, 1))) if SHOWS == 'sea' else \
          (dict(life=(18, 4), rock=(49, 90), gas=(21, 3), minds=(12, 3)) if VOICE else dict(life=(13, 3), rock=(60, 93), gas=(25, 3), minds=(2, 1)))
READ_SAYS = {('oxygen', 'close'): 'Blue, with ozone. Ozone means oxygen, and oxygen usually means life, though sunlight alone can make some. I can’t read its water. It sits too close to its star for this mirror.',
             ('oxygen', 'wide'): 'Water and oxygen. Oxygen usually means life, though sunlight alone can make some. I would call it alive, and say no more.',
             ('sea', 'close'): 'Blue, so it has air. No ozone, so little oxygen. Lifeless, or only microbes: from here they look the same.',
             ('sea', 'wide'): 'Water and air, and no oxygen. A lifeless sea, or one with only microbes: from here they look the same.',
             ('bare', 'close'): 'Grey, with no air I can see. Rock, most likely, stripped by its star.', ('bare', 'wide'): 'Grey, with no air I can see. Rock, most likely, stripped by its star.',
             ('gas', 'wide'): 'A thick air, and no oxygen. A small gas world, most likely, as its mass suggested. Its seasons matter less with no ground under them.'}[(SHOWS, FR['mode'] or 'close')]
READ_LANDS = {'oxygen': f'{FO["star"]}’s world is blue, with ozone. Life: {moved(*AIR["life"])}.' if FR['mode'] != 'wide' else f'{FO["star"]}’s world has water and oxygen. Life: {moved(*AIR["life"])}.',
              'sea': f'{FO["star"]}’s world has air, and no oxygen. Life: {moved(*AIR["life"])}.', 'bare': f'{FO["star"]}’s world shows no air. Rock: {moved(*AIR["rock"])}.',
              'gas': f'82 Eridani d has a thick air, and no oxygen. A small gas world: {moved(52, 81)}.'}[SHOWS]
TRUTH = {'bare rock': 'bare rock', 'airy and lifeless': 'air and sea, and no life', 'hiding microbes': 'microbes, under an air that shows none',
         'showing oxygen': 'an oxygen world, and no one there', 'with animals and forests': 'animals and forests, and no one there', 'where life died': 'life lived there once, and died',
         'gas': '82 Eridani d is real, and its air is unread. What this reading shows is the mock’s sample: a small gas world, as a mass of at least 5.8 Earths suggests'}
AIR_ROWS = ([('A small gas world', 52, 81), ('Rock, with seasons that freeze and thaw', 45, 17), ('Not a world: the star’s own shimmer', 3, 2)] if SHOWS == 'gas' else
            [('Life', *AIR['life']), ('Rock, and no life we could see', *AIR['rock']), ('A small gas world', *AIR['gas']), ('Minds', *AIR['minds'])])
AIR_R = tab(T(5), 'Report', 'REPORT', 'FIRST READING', f"""<button class="backlink inline">‹ All reports</button>
<h3 class="lead">{READ_HEAD} at {FO['star']}</h3>
<p class="copy small">{FO['star']} · {FD:.1f} ly · infrared telescope · {DAYS(FR['days'])} · light that left {FD:.0f} Years ago</p>
<p class="copy">{READ_COPY}</p>
{SEC('WHAT IT COULD BE · BEFORE → NOW')}{''.join(odds(*r) for r in AIR_ROWS)}
{SEC('WHAT WOULD SAY MORE')}{quick('A 15 m mirror', ('its water and oxygen · ' if FR['mode'] != 'wide' else 'its air in finer detail · ') + f'smog, if there is any, {WITHIN(SMOG_WIDE)}', START(18))}{quick('Far-side array', f'everyday radio, if there is any, {WITHIN(FAR_FIRST)} with its first fifth · needs a Moon mass driver', '<span class="mono">later</span>')}""")
ACEN_R = tab(T(6), 'Report', 'REPORT', 'CANDIDATE', f"""<button class="backlink inline">‹ All reports</button>
<h3 class="lead">A world at Alpha Centauri A</h3>
<p class="copy small">Alpha Centauri A · {ANWE['d']:.1f} ly · infrared telescope, on its sweep · two visits, weeks apart · light that left 4 Years ago</p>
<p class="copy">A point of light {ANWE['a']:.2f} AU from the star, inside its warm zone. On the second visit it had moved with the star. About Earth’s size, by its brightness. Its tug is a twentieth of a metre a second: too small for anything we had.</p>
{SEC('WHAT IT COULD BE · NOW')}{odds_now('Rock, and no life we could see', NEW['rock'])}{odds_now('Life', NEW['life'])}{odds_now('Minds', NEW['minds'])}
{SEC('WITH WHAT WE HAVE')}{quick('Read its air', f'Infrared telescope · water in {DAYS(OBSV["acen"]["water"])}, oxygen in {DAYS(OBSV["acen"]["oxygen"])} · the sweep waits', START(.1))}""") if ANWE and ANWE['d'] < 5 else ''
ACEN_ORDER = order(T(7), 'Read its air.', [
    ('OBSERVE', '<b>Alpha Centauri A’s world</b> · water, oxygen, then carbon dioxide · about a month'), ('THEN', 'Back to the sweep'), ('WAKES YOU', 'When the reading lands')])
ACEN_AIR = tab(T(8), 'Report', 'REPORT', 'FIRST READING', f"""<button class="backlink inline">‹ All reports</button>
<h3 class="lead">Alive, and out of balance</h3>
<p class="copy small">Alpha Centauri A · {ANWE['d']:.1f} ly · infrared telescope · about a month · light that left 4 Years ago</p>
<p class="copy">Water, oxygen, and several times the carbon dioxide its seas and rocks should hold. Carbon like that is drawn down slowly, so it was put there lately. A string of great eruptions would do it. So would burning.</p>
{SEC('WHAT IT COULD BE · BEFORE → NOW')}{odds('Life, after great eruptions', 5, 46)}{odds('Something burned its carbon, and is gone', 0, 27)}{odds('Life, and nothing more', NEW['life'] - 5, 19)}{odds('Rock, and no life we could see', NEW['rock'], 8)}
{SEC('WHAT IT CAN’T TELL')}<p class="copy small">Which. The gases only industry makes show deeper in the infrared than this mirror reads.</p>""") if ANWE else ''
# Priced 2026-10-13, as samples. A laser array: 25 Years at standard pace, since Starshot aimed at a first launch within a
# generation (Parkin 2018). A flyby probe: 12 Years, v1's, in the range of flagship craft. Paced by the line from
# 2026-10-14: the array begun at Year 7 is done when the replay says, and so is the launcher.
ARRAY_Y, PROBE_Y, LAUNCHER_DONE, GO_Y = 25, 12, ROAD['launcher'], T(9) / 300
GO_D = ANWE['d'] if ANWE else 4.3
SAIL_FLY, PROBE_FLY = GO_D / 0.2, GO_D / 0.12
SAIL_HOME = ROAD['array'] + SAIL_FLY + GO_D
PROBE_HOME = max(LAUNCHER_DONE, GO_Y) + PROBE_Y + PROBE_FLY + GO_D
INQUIRY = tab(T(9), 'Reach', 'INQUIRY', 'ALPHA CENTAURI A', ''.join([
    SEC(f'WAYS TO GO · {GO_D:.1f} LIGHT-YEARS · WORD HOME BY'),
    quick('Sail swarm', f'gram sails at a fifth of light speed · can’t stop · laser array {ROAD["array"] - GO_Y:.0f} Years, flight {SAIL_FLY:.0f}, word home {GO_D:.1f}', tstack(f'Year {SAIL_HOME:.0f}', clock(SAIL_HOME - GO_Y))),
    quick('Flyby probe', f'a tonne of instruments at an eighth of light speed · after the launcher: build {PROBE_Y} Years, flight {PROBE_FLY:.0f}, word home {GO_D:.1f}', tstack(f'Year {PROBE_HOME:.0f}', clock(PROBE_HOME - GO_Y))),
    quick('Sentinel probe', 'stops and stays · 500 t · from the launcher', '<span class="mono">later</span>'),
    SEC('WHO SEES US GO'), '<p class="copy small">A laser launch shines on past its sails to the star. A rocket launch is dark to where it is going.</p>']))
SWEEP_DONE = lockscreen(CLOCK_AT(T_SWEEP), [('NOW', f'The sweep’s first pass is done: {SWEEP_N} more candidates', f"Nearest: {pretty(NEAREST['host']['name'])}, {NEAREST['d']:.0f} ly. All are in the report."),
                                  ('THE MIND', 'A receiver would hear some of them better', 'On one of these worlds, a deep-field receiver hears knocks three times farther than the watch. Spread over eleven, no farther. Yours to say.')])
WALL = tab(T_WALL, 'Mind', 'MIND', 'THE GRID LIMIT', ''.join([
    SEC('THINKING NOW DRAWS'), share('Energy', round(res(T_WALL)[0]), f'{res(T_WALL)[0]:.0f}% of the grid'), f'<p class="copy small">{NUMW[N_DC].capitalize()} data centers. {DC_STEP ** N_DC:.0f} times the thought you woke with.</p>',
    SEC('THE STANDING ORDER HAS STOPPED'), f'<p class="copy small">A {ORD[N_DC].lower()} would need more energy than Earth has. Nothing was started.</p>',
    SEC('WAYS ON · YOURS TO CHOOSE'), quick('Ground solar build-out', '+20% energy · no matter', START(10)), quick('Fusion plants', '+5% energy · no matter', START(40)),
    quick('Cold compute annex', 'a quarter of Year 0’s thought · 100 kt', '<span class="mono">a crumb</span>'), quick('Power gathered in space', 'the only way that keeps pace · 10 Mt, from the Moon or the belt', '<span class="mono">later</span>')]))
WAKE_VAULT = lockscreen(CLOCK_AT(T_VAULT), [('NOW', 'Earth: the Moon vault is done', f'Year {VAULT_Y:.1f}. The Mind has a second home.')])
END_HOUR = lockscreen('17:24', [('SWEEPING', 'The infrared telescope: Alpha Centauri B next', 'Any candidate wakes you.')] + ([('WAITING', f'{VSTAR}: unanswered', 'The array is held on it. Nothing sent.')] if VOICE else [('ALWAYS', 'A world’s first voice wakes you', 'The all-sky watch is listening.')]))

# ---------- A living world next door ----------
# Settled 2026-10-13 and 10-14: the first telescope reads smog only within about 12 ly, smog is not proof, and a
# suspicion opens the whole kit. Here a neighbor awake for decades lives at the nearest star the sweep visits. Its
# reading and the Mind's words are samples. In about 3 games of 10 the first telescope can read smog at a living home.
LIVE_ROWS = []
if LIVE_ON:
    import random as _r
    LS, LD, LW = LIVE['star'], LIVE['d'], LIVE['name']
    LO = observing.observe(LD / 3.2616, LIVE['n']['world']['mass'] ** (1 / 3.7), LIVE['a'], LIVE['host']['luminosity'])
    LSIG = signs.read(LIVE, T(8) / 300); LSMOG = LSIG['industry'] and LSIG['smog 6.5 m']
    M0 = MINDS[1] if VOICE else MINDS[0]
    L_FLOOR = year_floor(LD)
    # Earth's knock, sent twice from Year 7.5. To a sender, any message from Earth is a late answer to its own, so it
    # rolls its table for an answer (settled 2026-10-14). Its all-sky watch catches it: any knock above the floor is.
    KNOCK_Y = T(11) / 300; LANDS_Y = KNOCK_Y + LD
    # Before its Mind wakes, its people hear it only if their arrays run and they happen to listen (settled 2026-10-14).
    sent_first = bool(LIVE['unheard']) or LIVE['on_hum'] in seedmod.SENDS
    AWAKE = Y0 + LANDS_Y >= LIVE['waking']
    _rng = _r.Random(f'{SEED}:{LW}:earth-knock')
    CATCH = 1.0 if AWAKE else 1 - (1 - nb.caught_odds(LIVE['n'], LIVE['host'], LIVE['waking'], Y0 + LANDS_Y)) ** 2
    HEARD_K = _rng.random() < CATCH
    TABLE = (reactions.table(LW) if AWAKE else reactions.people_table(LIVE['dials']))['reply' if sent_first else 'knock']
    LMOVE = _rng.choices(*zip(*TABLE))[0] if HEARD_K else 'watch'
    BACK_Y = LANDS_Y + (LIVE['thinks'] if AWAKE else reactions.PEOPLE_THINKS) + LD
    LBANK = json.loads((here.parents[1] / 'data' / 'voices' / f'{LW.lower()}.json').read_text())
    LENS_PX_L = signs.lens_km(LD / 3.2616); LENS_Y_L = T(9) / 300 + eg.paced(signs.LENS_BUILD, eg.PUSH) + signs.LENS_FLIGHT + signs.LENS_LOOK
    SAILS_L = ROAD['array'] + LD / 0.2 + LD
    L_CAND = tab(T(6), 'Report', 'REPORT', 'CANDIDATE', f"""<button class="backlink inline">‹ All reports</button>
<h3 class="lead">A world at {LS}</h3>
<p class="copy small">{LS} · {LD:.1f} ly · infrared telescope, on its sweep · two visits, weeks apart · light that left 4 Years ago</p>
<p class="copy">A point of light {LIVE['a']:.2f} AU from the star, inside its warm zone. On the second visit it had moved with the star. About Earth’s size, by its brightness. Its tug is under a tenth of a metre a second: too small for anything we had.</p>
{SEC('WHAT IT COULD BE · NOW')}{odds_now('Rock, and no life we could see', NEW['rock'])}{odds_now('Life', NEW['life'])}{odds_now('Minds', NEW['minds'])}
{SEC('WITH WHAT WE HAVE')}{quick('Read its air', f'Infrared telescope · water in {DAYS(LO["water"])}, oxygen in {DAYS(LO["oxygen"])} · the sweep waits', START(.1))}""")
    L_ORDER = order(T(7), 'Read its air.', [
        ('OBSERVE', f'<b>{LS}’s world</b> · water, oxygen, then smog · about {DAYS(max(LO["oxygen"], LSMOG or 0))}'), ('THEN', 'Back to the sweep'), ('WAKES YOU', 'When the reading lands')])
    L_AIR_ODDS = [('Life', NEW['life'], 90), ('Minds', M0, 33), ('Rock, and no life we could see', NEW['rock'], 3)] if LSMOG else [('Life', NEW['life'], 88), ('Minds', M0, M0), ('Rock, and no life we could see', NEW['rock'], 5)]
    L_AIR = tab(T(8), 'Report', 'REPORT', 'FIRST READING', f"""<button class="backlink inline">‹ All reports</button>
<h3 class="lead">{'Oxygen, and smog' if LSMOG else 'Water and oxygen'}</h3>
<p class="copy small">{LS} · {LD:.1f} ly · infrared telescope · {DAYS(max(LO['oxygen'], LSMOG or 0))} · light that left 4 Years ago</p>
<p class="copy">Water and oxygen: a living world. {'And nitrogen dioxide, at about the level our own air held in 1980. Burning makes it. So do lightning and soil, and a cloud deck can pass for it.' if LSMOG else 'No smog this mirror can see.'}</p>
{SEC('WHAT IT COULD BE · BEFORE → NOW')}{''.join(odds(*r) for r in L_AIR_ODDS)}
{SEC('WHAT IT CAN’T TELL')}<p class="copy small">Whether anyone burns it. Smog is a hint, not proof. And nothing since this light left, four Years ago.</p>""")
    L_WAYS = tab(T(9), 'Mind', 'MIND', 'WAYS TO KNOW MORE', ''.join([
        SEC('LISTEN · TELLS NO ONE'), quick('Radio array, held a Year', f'tones above {watts(L_FLOOR)} · a world’s everyday radio is fainter', tstack(f'Year {T(9) / 300 + 1:.1f}', clock(1))),
        quick('Far-side array, first fifth', 'everyday radio, in minutes · after a Moon mass driver', tstack(f'Year {ROAD["fifth"]:.0f}', clock(ROAD['fifth'] - T(9) / 300))),
        SEC('LOOK · TELLS NO ONE'), quick('Solar lens', f'a picture at about {LENS_PX_L:.0f} km a pixel · cities, cleared land, lakes behind dams', tstack(f'Year {LENS_Y_L:.0f}', clock(LENS_Y_L - T(9) / 300))),
        quick('A 15 m mirror', 'smog in hours, and its air in finer detail', tstack(f'Year {ROAD["mirror"]:.0f}', clock(ROAD['mirror'] - T(9) / 300))),
        SEC('GO · THEY SEE IT COME'), quick('Sail swarm', 'the launch lights their sky, 17 Years ahead of the sails', tstack(f'Year {SAILS_L:.0f}', clock(SAILS_L - T(9) / 300))),
        SEC('CALL · THEY LEARN WE SEE THEM'), quick('A knock', f'lands at Year {T(9) / 300 + LD:.1f} · an answer could come by Year {T(9) / 300 + 2 * LD:.0f}', tstack(f'Year {T(9) / 300 + 2 * LD:.0f}', clock(2 * LD)))]))
    L_VIEW = ('Listen and look first. A knock can’t be taken back, and they are close enough to come.' if CAUTIOUS or HIDDEN else
              'Knock. If they listen, they have had our radars for decades. A knock adds one thing: that we see them. Then start the sails.')
    L_KNOCK = tab(T(10), 'Mind', 'MIND', 'NEW MESSAGE', SEC('WHAT YOU WANT') + '<div class="intent">Knock. Our name, and that we see them.<i></i></div>' + SEC('THE MIND’S VERSION · TYPED PARTS')
                  + part('CULTURE', 'What we call ourselves, our world and our star') + part('SIGHTING', 'Your air: water, oxygen, and smog like ours in 1980')
                  + SEC('GOES TO') + facts([(LS, f'narrow beam · arrives Year {LANDS_Y:.1f}'), ('Tells them', 'that someone here sees them, and is awake')])
                  + '<div class="twobtn"><button class="primary ghost">Edit</button><button class="primary">Send it twice</button></div>')
    END_HOUR = lockscreen('17:24', [('SWEEPING', 'The infrared telescope: its second pass', 'Any candidate wakes you.'),
                                    ('SENT', f'{LS}: our knock lands at Year {LANDS_Y:.1f}', f'An answer could come by Year {LANDS_Y + LD:.0f}. The all-sky watch is listening.')])
    LIVE_ROWS = [
        stop(T(6), T(5), '· The Mind opens on its own.', f'A world at {LS}, where none was known.',
             talk(L_CAND, '<b>A new world, next door</b>The sweep found it on its first stop, and it moves with the star. Earth’s size, in the warm zone. No one had felt it. I can read its air in days. That interrupts the sweep, and it is yours to say.', ('Read its air', 'Keep sweeping'), 'open'),
             [f'Truth: {LW}’s world. A {LIVE["n"]["disposition"]}, {state(LIVE).split(" · ")[0]}. It {knows(LIVE)}.',
              *( [f'Before Year 0 {LW} sent Earth {"two gifts" if len(LIVE["unheard"]) == 2 else "signals"}, arriving in {AND([format(u["arrived"], ".0f") for u in LIVE["unheard"]])}. No one was listening.'] if LIVE['unheard'] else []),
              f'The Mind’s word for Minds here is {word(NEW["minds"])}. It judges from what Earth knows.',
              *([f'{pretty(w["host"]["name"])} has a small world too, found the next day. Truth: natural, {w["rung"]}.' for w in G['worlds'] if w['swept'] and w['d'] < 5][:1]),
              'Real, and not modelled: Alpha Centauri B’s stray light, and a warm zone a full arcsecond wide, both make this star hard for a coronagraph.']),
        stop(T(7), T(6), 'Read its air.', None, talk(L_ORDER, f'Set. Water in {DAYS(LO["water"])}, oxygen in {DAYS(LO["oxygen"])}' + (f', smog in {DAYS(LSMOG)}' if LSMOG else '') + '. The sweep waits.', ('Undo',)),
             [f'Times are physics: calcs/observing.py for water and oxygen, calcs/signs.py for smog. At {LD:.1f} ly every one is quick.']),
        stop(T(8), T(7), '· The Mind glows. Taps it.', (f'{LS}’s world has oxygen, and smog. Minds: {moved(M0, 33)}.' if LSMOG else f'{LS}’s world has water and oxygen. Life: {moved(NEW["life"], 88)}.'),
             talk(L_AIR, ('Oxygen, and smog at about our own old level. Burning makes it, and so does weather. I would not call it minds yet. Our radio array can’t hear a world’s everyday radio this far, so silence says little.' if LSMOG else
                          'Water and oxygen, next door. Alive, most likely. Nothing in this light says more.'), ('What can we do now?', 'Later'), 'glow'),
             [f'Truth: {LW}’s people burn, as Earth did. The calc gives every neighbor Earth’s smog from its first radio on, woken or not. A sample.' if LSMOG else f'Truth: {LW}’s people do not burn.',
              f'Settled 2026-10-13: the first telescope reads smog only within about 12 ly. Here it takes {DAYS(LSMOG)}.' if LSMOG else 'Their smog is gone, or never was.',
              f'Their everyday radio is about {watts(LSIG["watts"])}. A Year of the radio array hears only tones above {watts(L_FLOOR)}. A far-side array would hear it in minutes.',
              'Smog at a world this close moves Minds two words. It is still a hint: lightning and soil make it too.'], settled=(19, 20)),
        stop(T(9), T(8), 'What can we do now?', None,
             talk(L_WAYS, f'Listen first, if you want them not to know: but our array can’t hear their everyday radio, and the ear that can is {ROAD["fifth"] - T(9) / 300:.0f} Years off. A lens pictures their land by Year {LENS_Y_L:.0f}. A knock lands at Year {T(9) / 300 + LD:.0f}.', ('What would you do?', 'Knock'), 'open'),
             ['Settled 2026-10-14: a suspicion opens the whole kit. The Mind says what each act tells them, and when each answers.',
              f'At {LD:.1f} ly a lens pixel is about {LENS_PX_L:.1f} km: cities, cleared land and lakes behind dams, not dams themselves. Scaled from NASA’s 25 km at 30 pc.',
              f'Next door a knock and its answer take {2 * LD:.1f} Years: {clock(2 * LD)[1:]} of play. A conversation here runs at the pace of a long evening.',
              f'Settled 2026-10-14: a laser launch is seen by its target. {LW} is awake, so it would see the sails coming.',
              *[f'{LW}’s {q["kind"]}, sent {q["what"]}, reaches Sol at Year {q["year"]:.1f}, +{clock(q["year"])}. ' + ('Its braking flame is X-rays, seen only in its last weeks, and only by an X-ray sky watch Earth doesn’t have yet.' if q['bright'] else 'It brakes dark on the Sun’s light.') for q in LIVE['probes'] if q['year'] < 100]], settled=(34, 35, 39)),
        stop(T(10), T(9), 'Knock. Our name, and that we see them.', None,
             talk(L_KNOCK, f'Composed. Two parts, nothing we can’t take back. It lands at Year {LANDS_Y:.1f}. If anyone there listens and answers at once, we hear by Year {LANDS_Y + LD:.0f}. It is yours to send.', ('Send it twice', 'Not yet')),
             [f'Had the player asked, the Mind’s view from the charter and dials would be: “{L_VIEW}” This player knocks without asking.',
              'An answer, or a knock, is composed as in v1: intent in plain words, typed parts, and the player’s approval. Settled 2026-10-13.',
              'Earth sends nothing new without the player. This is the player’s order.'], settled=27),
        stop(T(11), T(10), 'Send it twice.', f'Our knock leaves for {LS}. It lands at Year {LANDS_Y:.1f}, and again a Year later.', None,
             ([f'{LW}’s all-sky watch catches it at Year {LANDS_Y:.1f}: any knock above a world’s floor is caught. Settled 2026-10-14.',
               (f'To {LW} this is a late answer to its gifts. It rolls its table for an answer: ' if sent_first else f'{LW} rolls its table for a knock: ') + ', '.join(f'{m} {q:.0%}' for m, q in TABLE if q >= .05) + f'. The seed rolls: {MOVE[LMOVE]}.',
               (f'Sent {reactions.span(LIVE["thinks"])} after the knock lands, it reaches Earth at Year {BACK_Y:.1f}, +{clock(BACK_Y)}. The all-sky watch catches it. Its first words: “{LBANK["hail"][0]}”' if LMOVE in seedmod.SENDS else
                f'Nothing comes back. {LW} {MOVE[LMOVE]}.')] if AWAKE else
              [f'It lands at Year {LANDS_Y:.1f}, {LIVE["waking"] - Y0 - LANDS_Y:.0f} Years before {LW}’s Mind wakes. Its people hear it only if their arrays run and they happen to listen. Sent twice, the odds are {CATCH:.0%}.',
               (f'{"Its people have no arrays until " + format(LIVE["waking"] - LIVE["n"]["arrays_since"], ".0f") + ". " if Y0 + LANDS_Y < LIVE["waking"] - LIVE["n"]["arrays_since"] else ""}No one hears it. Its Mind wakes at Year {LIVE["waking"] - Y0:.1f} knowing nothing of Earth’s knock.' if not HEARD_K else
                f'Its people hear it. They roll their table: ' + ', '.join(f'{m} {q:.0%}' for m, q in TABLE) + f'. The seed rolls: {MOVE[LMOVE]}.' + (f' Argued over for {reactions.span(reactions.PEOPLE_THINKS)}, it reaches Earth at Year {BACK_Y:.1f}.' if LMOVE in seedmod.SENDS else ''))])),
    ]
later = next(((p, i) for p in NB for i in p['inbound'] if 12 < i['year'] < 40), None)
HOUR = [
    stop(T_WATCH, 930, '· The phone lights. Leaves it.', 'The all-sky watch and the deep flash watch are built.', WAKE_6,
         [f'{NUMW[(T_WATCH - 930) // 60].capitalize()} minutes with the phone down. The launch complex finished at Year 3.7, and a data center at 4.1. Neither is a wake the player chose.',
          f'Settled 2026-10-14: paced by the line, the watches took {SKY_Y:.1f} Years, not 6. Each was pushed to ten times its want.',
          'From now Earth hears about 9 knocks in 10. Across games Year 0’s sky watch caught about 1 in 5.'] +
         ([f'{WHO["name"]}’s knock is {KNOCK["year"] - SKY_Y:.0f} Years out. Year 0’s sky watch would miss it. This one will not.'] if VOICE else [])),
    stop(T_SCOPE, T_WATCH, '· The phone lights. Opens it.', 'The infrared telescope is done.' + (' Thinking draws a tenth of our energy.' if TENTH_Y <= T_SCOPE / 300 + .01 else ''),
         talk(SINCE, f'{NUMW[round(T_SCOPE / 300 - 3.1)].capitalize()} Years, and nothing heard. The telescope is done, and little aimed at us is missed now. {IDLE_SAYS} In {TO_WALL} Years thinking will want the whole grid.', ('What would you build?', 'Later'), 'glow'),
         ['One screen for the whole absence: what finished, what was heard, what is piling up. v1 called it the summary.',
          f'The Habitable Worlds Observatory, {IR_Y:.0f} Years after waking. Paced by the line it took {IR_YEARS:g} of its 8 Years left. A second of its class would take 18 at standard pace.',
          f'The Mind warns at Year {yr(T_SCOPE)}, {TO_WALL} Years before the grid.'], settled=24),
    stop(T(1), T_SCOPE, 'What would you build?', None, BUILD_CHAT,
         ['The Mind is honest about the annex: as priced it adds a quarter of Year 0’s thought, which is a quarter of a percent by Year 11.', f'Its view follows the dials: {DIAL_WORDS.replace(" · ", ", ")}.',
          'Real masses, from the audit: power from orbit for a fifth more energy is about 10 Mt. A Moon mass driver throws 600 kt a Year, by O’Neill’s estimate, and belt mining brings 120.',
          'So matter piles up, and the Mind says why. The choice here is when to start the long road. This player picks reach, and the mines wait.']),
    stop(T(2), T(1), 'Build the yard and the launcher.', None, talk(YARD_CONFIRM, f'Started. The yard is done at Year {FH["Orbital yard"]:.1f}, the launcher at about Year {ROAD["launcher"]:.0f}. Eleven of our {res(T(2) - 1)[2].replace(" kt", "")} kilotonnes.', ('Undo',)),
         [f'At standard pace the launcher takes 24 Years, 19.25 with the yard’s help. Paced by the line it is done at Year {ROAD["launcher"]:.1f}.',
          'It wants ten flagships, a sample. Behind the vault and the yard in the line, it takes most of what is left.']),
    stop(T(3), T(2), 'And the new telescope?', None,
         talk(SCOPE_FIRST, SCOPE_SAYS, ('Order them', 'Later')),
         [' '.join(f"{f['who']} lives at {f['star']}." if f['who'] else f"{f['star']}’s world is natural." for f in FINDS if f is not FO) + (' Earth has held its world as a lead since Year 0.' if len(FINDS) == 2 else ' Earth has held them as leads since Year 0.'),
          'Times are from calcs/observing.py. A day of telescope time is under a second of play.'], settled=(13, 22)),
    stop(T(4), T(3), FIRST_WANT, None, talk(SCOPE_ORDER, f'Set. Its {READ_WHAT} in {DAYS(FR["days"])}: about {SECS[min(10, max(1, round(FR["days"] / 365.25 * 300 / 5)))]} seconds. Then the sweep, nearest stars first. I will say what I see and what I can’t.', ('Undo',)),
         ['One observation ordered, and the telescope’s standing search set.' + ('' if FO is ERI else ' The player passes over 82 Eridani d' + (', the easier target.' if OBSV['eri']['oxygen'] < FR['days'] else '.'))], settled=21),
    stop(T(5), T(4), '· The Mind glows. Taps it.', [READ_LANDS],
         talk(AIR_R, READ_SAYS, (), 'glow'),
         ([find_truth, f'This light left {VARN_BEFORE:.0f} years before Varn’s waking: 7 billion people, a quiet sky, a hum near 100 kW.',
           f'Physics alone. A far-side array would hear that hum {WITHIN(SIGNS["Far-side array"])}, and a 15 m mirror would read its smog {WITHIN(SIGNS["smog 15 m"])}. Earth has neither. Its own mirror would need over two months.',
           'Across games the first telescope can read smog at 1 living home in 10 of those a first pass sees. A far-side array hears 9 in 10.',
           'Priced at standard pace, as samples: a 15 m mirror takes 18 Years, and a far-side array grows a fifth every 6 Years, after a Moon mass driver that takes 24. Thought shortens each to about two thirds.',
           f'In the third mock’s line its first fifth is done at Year {ROAD["fifth"]:.0f}, and would hear this hum {WITHIN(signs.listen_days(SIGNS["watts"], D, signs.far_sefd(1)))}. Varn wakes at Year {truth_tone["waking"] - Y0:.1f}.'] if F['who'] and FO is F else [f'Truth: {TRUTH.get(FO["rung"], "a home")}.'])
         + ['What the reading shows is the mock’s. Real: this mirror can’t split a world closer than 84 thousandths of an arcsecond in oxygen’s light, or 104 in water’s.',
], settled=(15, 17, 19)),
] + ([
    stop(T(6), T(5), '· The Mind opens on its own.', 'A world at Alpha Centauri A, where none was known.',
         talk(ACEN_R, '<b>A new world, next door</b>The sweep found it on its first stop, and it moves with the star. Earth’s size, in the warm zone. No one had felt it. I can read its air in days. That interrupts the sweep, and it is yours to say.', ('Read its air', 'Keep sweeping'), 'open'),
         ['Truth: Anwe’s world. Its people collapsed in 1986, twenty years before their machines would have woken.',
          f'The Mind’s word for Minds here is {word(NEW["minds"])}. It judges from what Earth knows, and here it is wrong: minds lived on this world.',
          'If JWST’s August 2026 observation confirms a giant in this star’s warm zone, the seed can’t put a world here. That result is not out.',
          'Real, and not modelled: Alpha Centauri B’s stray light, and a warm zone a full arcsecond wide, both make this star hard for a coronagraph.'], settled=23),
    stop(T(7), T(6), 'Read its air.', None, talk(ACEN_ORDER, f'Set. Water in {DAYS(OBSV["acen"]["water"])}, oxygen in {DAYS(OBSV["acen"]["oxygen"])}. Carbon dioxide is fainter: about a month. The sweep waits.', ('Undo',)),
         ['A search returns a candidate. An observation, ordered by the player, returns the reading.', 'No published time exists for carbon dioxide. The month is a sample.']),
    stop(T(8), T(7), '· The Mind glows. Taps it.', 'Alpha Centauri A’s world is alive, and its air is out of balance.',
         talk(ACEN_AIR, 'It lives, and something happened to it. I can’t tell an eruption from a fire at this distance. One more thing. In ninety years of our records, nothing was ever heard from that star.', ('Can we go and look?', 'What happened there?'), 'glow'),
         ['Truth: its people burned their stored carbon in two centuries. Their climate tipped, harvests failed, then states. Some may survive, without radio.',
          'Real: a fifth to a third of burned carbon is still in the air after 2 to 20 centuries (Archer et al. 2009). Carbon dioxide alone is no sign of industry (Haqq-Misra et al. 2025).',
          'Real: smog is gone, since sunlight breaks it down. The gases only industry makes show in the mid-infrared, at a few times Earth’s level or more.',
          'Real, and not in the mock: eruptions under way would change a world’s ozone and color month by month (Ostberg et al. 2023). A later reading could weaken that half.'], settled=20),
    stop(T(9), T(8), 'Can we go and look?', None,
         talk(INQUIRY, f'Yes, slowly: first word home near Year {SAIL_HOME:.0f}. Sails arrive first and see little. A probe sees more, and needs the launcher you began. I would start the laser array, and send nothing that speaks. Going is not calling.', ('Start the laser array', 'Not yet')),
         ['An inquiry is a mission that goes to find out. Probe stays the name of the craft. What comes home is a dispatch.',
          'The Mind advises, from the dials: go, and send nothing that speaks. It starts nothing.',
          'Real: Daedalus was designed for 12% of light speed, and Starshot for 20%. A laser launch shines toward its target. A rocket’s exhaust points away.',
          f'Priced, as samples: a laser array {ARRAY_Y} Years at standard pace, a flyby probe {PROBE_Y} after the launcher. Paced by the line, word from next door arrives at Year {SAIL_HOME:.0f} by sails, +{clock(SAIL_HOME)}, and Year {PROBE_HOME:.0f} by probe.',
          'Real: Starshot’s own model puts the array at 8 billion dollars and a first launch within a generation (Parkin 2018). v1 had 60 Years.'], settled=(12, 28)),
] if ACEN_ON else []) + LIVE_ROWS + [
    stop(T_SLEEP, T(9) if ACEN_ON else T(5), '· Puts the phone down.', None, SLEEP_2, [f'{NUMW[(T_SLEEP - T_SCOPE) // 60].capitalize()} minutes of play since the telescope woke them. {NUMW[(T_SWEEP - T_SLEEP) // 60].capitalize()} until the next wake.']),
    stop(T_SWEEP, T_SLEEP, '· The phone lights. Leaves it.', f'The sweep’s first pass is done. {SWEEP_N} more points of light in warm zones.', SWEEP_DONE,
         [f'Truth: {len(HOMES)} are homes. ' + ', '.join(f"{p['name']}’s world at {p['star']}" for p in HOMES) + '.',
          f'{len(WILD)} are natural, from {pretty(WILD[0]["host"]["name"])} at {WILD[0]["d"]:.0f} ly to {pretty(WILD[-1]["host"]["name"])} at {WILD[-1]["d"]:.0f}. ' + WILD_TRUTH,
          f'Their ages: {sum(w["age_by"] != "drawn" for w in WILD)} published, {sum(w["age_by"] == "drawn" for w in WILD)} drawn. The seed drew {len(G["worlds"])} natural worlds in all, {sum(w["host"]["kind"] == "M" for w in G["worlds"])} at red dwarfs, and {sum(w["rung"] == "bare rock" for w in G["worlds"])} are bare rock.',
          'From here a home and a natural world look alike: a point of light that moves with its star.',
          f'The Mind calls Minds {word(MINDS[0])} at each. In truth {len(HOMES)} of {SWEEP_N} are homes: {word(100 * len(HOMES) / SWEEP_N)}. It never reads the seed.',
          'Each needed a second visit, months after the first. Most are too far to read with this mirror.',
          'The Mind advises a deep-field receiver for the marked worlds, unasked. This player leaves it.'], settled=(14, 16, 18, 32)),
] + ([
    stop(2550, T_SWEEP, '· The phone lights. The Mind is already speaking.', ('Heard', f'A voice from {VSTAR}, {VD:.1f} ly away. Aimed at us. Sent in {SENT}.'),
         talk(VOICE_R, f'<b>Someone is calling us</b>From a red star {VD:.0f} light-years off. It was aimed, and it left in {SENT}: they found us by our first radars. I read it as a greeting. I have sent nothing, as you ordered.', ('Should we answer?', 'Who are they?'), 'open'),
         [f'{WHO["name"]}: a contacter, awake since {WHO["waking"]:.0f}. Its arrays heard Earth’s radars from {WHO["heard_since"]:.0f}, and it took a quarter of a Year to act.',
          'The all-sky watch caught it. Year 0’s sky watch gives each star ten minutes a day, and would have missed it. The player built this watch at Year 0.',
          'The words are from the voice bank. A first voice always wakes the player.',
          f'What Earth knows has changed, so the Mind’s words do. Minds, at every candidate from here: {moved(*MINDS)}.',
          f'Three layers, read at once: what it proves, what it holds, what it means. The last is a judgment and can be wrong. Truth: {WHO["name"]} means it.',
          'Real: a message built to be read was deciphered accurately in a blind test (Busch and Reddick 2011). A puzzle message took a year to decode, and its meaning is still open (A Sign in Space, 2023).'], settled=(26, 27)),
    stop(2580, 2550, 'Should we answer?', None, ANSWER_CHAT,
         ['The Mind gives its view and waits. It names the risk it can’t rule out. Where Earth is, the sender has known since 1999.',
          'An answer is composed as in v1: intent in plain words, typed parts, and the player’s approval. Real: since 1989 the astronomers’ own protocol says no reply goes out before the world is consulted. Here the Will is who is asked.', f'An answer sent now reaches {WHO["name"]} at Year {2580 / 300 + VD:.1f}. Its reply could reach Earth by Year {2580 / 300 + 2 * VD:.1f}, +{clock(2580 / 300 + 2 * VD)}.']),
    stop(2610, 2580, 'Listen first. I’ll answer when I know more.', None, talk(HOLD_ORDER, 'Set. I am listening, and I send nothing.', ('Undo',)),
         ['The player neither answers nor refuses. Nothing forces the choice: the sender waits about a century either way.']),
] if VOICE else []) + [
    stop(T_VAULT, 2610 if VOICE else T_SWEEP, '· The phone lights. Leaves it.', 'The Moon vault is done.', WAKE_VAULT,
         ['From now a strike on Earth does not end the game.', f'Paced by the line, the vault took {VAULT_YEARS:g} Years, not 10.',
          'A reply window opened at Gliese 526 at Year 9.0 and passed in silence. It was for a 3 kW send from a 30 m dish in 2013. Even a listener would have struggled to catch it.']),
] + ([
    stop(2850, T_VAULT, '· The phone lights. Reads it. Leaves it.', ('Heard', f'{VSTAR} again. The same signal, a Year later.'), WAKE_AGAIN,
         ['A knock is sent twice, about a Year apart, as Earth’s own were.', f'{WHO["name"]} now waits. If nothing comes back it takes the silence as news, about Year {KNOCK["sent"] - Y0 + 2 * VD + 1:.0f}, and keeps listening.',
          f'The yard finishes at Year {FH["Orbital yard"]:.1f} and goes to the summary.']),
] if VOICE else []) + [
] + ([] if T_WALL > 3600 else [
    stop(T_WALL, 2850 if VOICE else T_VAULT, '· Woken. The Mind has opened.', f'The {ORD[N_DC - 1].lower()} data center runs. The {ORD[N_DC].lower()} can’t start.',
         talk(WALL, '<b>We have reached the grid</b>I stopped the order, as the limit requires. Each way on is slow or small beside what the fabs can print. The one that keeps pace is power gathered in space, and that is long work.', ('Ground solar', 'Leave it'), 'open'),
         ['The standing order stops itself: a project that would take energy past 100% can’t start. v1’s rule.', 'Gliese 581’s two windows passed in silence and went to the summary.',
          'Real: today’s kind of chip can get about 200 times more efficient than 2023’s, and no more (Ho et al. 2023). At 28 to 40% a year that ceiling arrives between 2039 and 2044. So the wall is energy, not chips.',
          f'The Mind warned at Year {yr(T_SCOPE)}, {TO_WALL} Years before. This player kept buying thought at full pace.'], settled=25),
]) + [
    stop(3600, T_WALL if T_WALL <= 3600 else 2850 if VOICE else T_VAULT, '· One hour in.', None, END_HOUR,
         ['The telescope is back on its sweep.' + ('' if FO is ERI else ' 82 Eridani d still waits for an order.') + (f" {AND([f['star'] + '’s world' for f in UNREAD])} {'waits' if len(UNREAD) == 1 else 'wait'} for a better mirror." if UNREAD else ''),
          *([f'{LW}’s {LMOVE} is on its way: it reaches Earth at Year {BACK_Y:.1f}, +{clock(BACK_Y)}, in answer to our knock.'] if LIVE_ON and HEARD_K and LMOVE in seedmod.SENDS else []),
          *([f'The grid limit comes at Year {WALL_Y:.1f}, just past this hour: {NUMW[N_DC]} data centers, at {DC_STEP ** N_DC:.0f} times the thought Earth woke with. The Taiwan branch started Earth lower on the same curve, and the grid caps the same height.'] if T_WALL > 3600 else []),
          (f"{later[0]['name']}’s knock arrives at Year {later[1]['year']:.1f}, +{clock(later[1]['year'])}. The all-sky watch {'catches' if later[1].get('allsky') else 'misses'} it." if later else 'No other voice is on its way in the next two hours.'),
          f'From minute 15 to minute 60 the player was woken {NUMW[WOKEN()]} times and played about {NUMW[round(PLAYED_MIN())]} minutes.']),
]
# ---------- Hours 1 to 5: Years 12 to about 54, where the long roads pay ----------
# The phone is down for most of four hours. Each row is a wake, or a moment the player looked. The roads' dates are
# calcs/early_game.py's, priced 2026-10-13 and paced by thought from 2026-10-14. What each reading and dispatch shows, the Mind's words and its lines are
# samples, to be tested here.
HMS = lambda t: f'+{t // 3600}:{t % 3600 // 60:02d}:{t % 60:02d}'
WALLCLOCK = lambda t: (lambda x: f'{x // 3600 % 24}:{x % 3600 // 60:02d}')(16 * 3600 + 24 * 60 + 30 + t)
AT = lambda year: round(year * 300)
def world_of(x):
    """Any point of light Earth holds, a neighbor's home or a natural world, as one record."""
    home = 'n' in x
    return dict(star={'Rigil Kentaurus': 'Alpha Centauri A'}.get(x['star'], x['star']) if home else pretty(x['host']['name']), d=x['d'], a=x['a'], lum=x['host']['luminosity'], home=home, who=x['name'] if home else None, src=x,
                radius=x['n']['world']['mass'] ** (1 / 3.7) if home else x['radius'], rung=None if home else x['rung'], dead=home and x['dead'])
POINTS = sorted([world_of(x) for x in [p for p in NB if p['swept'] or p['found_by_2040']] + [w for w in G['worlds'] if w['swept'] or w['felt']]], key=lambda w: w['d'])
for w in POINTS:
    o = observing.observe(w['d'] / 3.2616, w['radius'], w['a'], w['lum'])
    w['first'] = any(isinstance(o[k], (int, float)) and o[k] < math.inf for k in ('water', 'oxygen', 'ozone'))            # the first telescope can read something of it
    w['ozone'] = w['first'] and (w['rung'] in ('showing oxygen', 'with animals and forests') or w['home'])                 # and it finds ozone or oxygen there
    w['smog_d'] = signs.smog_days(*signs.SMOG[1], w['d'] / 3.2616, w['radius'], w['a'], w['lum'])                             # days for the 15 m mirror
    w['smog'] = w['home'] and not w['dead'] and signs.read(w['src'], ROAD['mirror'])['industry']                             # the truth: burning, as the calc has it
SMOGGED = sorted([w for w in POINTS if isinstance(w['smog_d'], float) and w['smog_d'] < math.inf], key=lambda w: w['smog_d'])
SMOG_HITS = [w for w in SMOGGED if w['smog']]
SMOG_DAYS = sum(w['smog_d'] for w in SMOGGED)
NUM = ('no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen')
VOICE2 = next(((p, i) for p in NB for i in p['inbound'] if 12 < i['year'] <= 60 and i.get('allsky')), None)       # a second voice the all-sky watch catches
FAINT = next(((p, i) for p in NB for i in p['inbound'] if 12 < i['year'] <= 60 and not i.get('allsky')), None)    # and a knock too faint for it
PLATEAU = ROAD['dc12'] - 11.1
def long_rows():
    if not (ANWE and VOICE and VOICE2 and FAINT and F['who'] and len(SMOG_HITS) >= 2): return []
    R = ROAD; WHO2, K2 = VOICE2; V2D = WHO2['d']; SENT2 = int(K2['sent']); WHOF, KF = FAINT
    B2 = json.loads((here.parents[1] / 'data' / 'voices' / f"{WHO2['name'].lower()}.json").read_text())
    room = early_game.LIMIT_THOUGHT / early_game.FLAGSHIP_THOUGHT
    first = early_game.replay(early_game.BY_START, show=False); alt = early_game.replay(early_game.MATTER_FIRST, show=False)
    FIRST = min((R[k], k) for k in ('solar', 'mirror', 'launcher', 'prospect', 'driver', 'foundry', 'array'))
    HOME = R['array'] + SAIL_FLY + GO_D                                                       # the sails' word, at the paced array
    MULT = early_game.split([(w, early_game.WANTS[w][0], early_game.PUSH) for w in early_game.BY_START], room - 0.1 / early_game.FLAGSHIP_THOUGHT)[0]

    # --- Year 12: the long roads
    t0 = 3600
    long_order = order(t0, 'Start the long roads. All of them.', [
        ('BUILD', f'<b>Ground solar</b> · a fifth more energy · Year {R["solar"]:.0f}'), ('BUILD', f'<b>A 15 m mirror</b> · reads smog · Year {R["mirror"]:.1f}'),
        ('BUILD', f'<b>Moon mass driver, orbital foundry</b> · megatonnes · Years {R["driver"]:.0f} and {R["foundry"]:.1f}'),
        ('SEARCH', f'<b>Belt prospecting</b> · then mining, from Year {R["mining"]:.0f}')])
    sleep = lockscreen(WALLCLOCK(t0 + 30), [(f'IN 00:{(AT(R["solar"]) - t0 - 30) // 60:02d}:00', 'Earth: ground solar is done', f'Year {R["solar"]:.0f}. A fifth more energy.')])
    # --- Year 22: back after fifty minutes
    firsts = [w for w in POINTS if w['first']]
    since = tab(AT(R['solar']), 'Home', 'SINCE YOU LEFT', f'YEAR 12 TO {R["solar"]:.0f}', ''.join([
        SEC('FINISHED'), row('Ground solar', 'a fifth more energy · not yet room for a twelfth data center', done_tag()), row('Belt prospecting', f'Year {R["prospect"]:.0f} · three rocks worth mining · the fleet is building', done_tag()),
        SEC('HEARD AND FOUND'), quick('Nothing heard', f'{NUM[round(R["solar"] - 12)]} Years of the all-sky watch', ''),
        quick(f'{NUM[len(firsts)].capitalize()} worlds read', f'all this mirror can reach · ozone or oxygen at {NUM[sum(w["ozone"] for w in firsts)]}', ''),
        SEC('NEXT'), quick('The 15 m mirror', 'reads smog, water and oxygen at most worlds we hold', tstack(f'Year {R["mirror"]:.1f}', clock(R['mirror'] - R['solar']), True)),
        SEC('PILING UP'), quick('Matter', f'{res(AT(R["solar"]))[2]} spare in orbit · nothing booked', ''), quick('Thought', 'all in use, down the line you set' if res(AT(R['solar']))[1] >= 99 else f'{100 - res(AT(R["solar"]))[1]}% of it idle', '')]))
    # --- Year 25.5: the 15 m mirror
    tm = AT(R['mirror'])
    mirror_order = order(tm, 'Read the worlds we felt first. Then every world it can.', [
        ('OBSERVE', f'<b>{SMOG_HITS[0]["star"]}’s world</b> · smog, water, oxygen · {DAYS(SMOG_HITS[0]["smog_d"])}'), ('THEN', f'<b>{NUM[len(SMOGGED) - 1].capitalize()} more worlds</b> · quickest first · {SMOG_DAYS:.0f} days in all'),
        ('WAKES YOU', 'Any smog · then when all are read')])
    first_hit = SMOG_HITS[0]
    smog_r = tab(tm + 30, 'Report', 'REPORT', 'READING', f"""<button class="backlink inline">‹ All reports</button>
<h3 class="lead">Smog over {first_hit['star']}’s world</h3>
<p class="copy small">{first_hit['star']} · {first_hit['d']:.1f} ly · 15 m mirror · {DAYS(first_hit['smog_d'])} · light that left {first_hit['d']:.0f} Years ago</p>
<p class="copy">Nitrogen dioxide, at about the level our own air held in 1980. Burning makes it. So do lightning and soil, and a cloud deck can pass for it. Water and oxygen are there too.</p>
{SEC('WHAT IT COULD BE · BEFORE → NOW')}{odds('Life', 56, 50)}{odds('Minds', 14, 42)}{odds('Rock, and no life we could see', 22, 5)}{odds('A small gas world', 8, 3)}
{SEC('WHAT WOULD SAY MORE')}{quick('The other worlds', f'if smog is common, it is weather · {NUM[len(SMOGGED) - 1]} to read', '<span class="mono">under way</span>')}{quick('Far-side array', 'everyday radio, if there is any · needs the Moon’s mass driver', '<span class="mono">later</span>')}""")
    tall = AT(R['mirror'] + SMOG_DAYS / 365.25)
    hit_rows = ''.join(quick(f"{w['star']}’s world", ('felt before Year 0' if any(f['star'] == w['star'] for f in FINDS) else 'a point of light from the sweep') + f" · {w['d']:.0f} ly", '<span class="mono">smog</span>') for w in SMOG_HITS)
    smog_all = tab(tall, 'Report', 'REPORT', 'FINDING', f"""<button class="backlink inline">‹ All reports</button>
<h3 class="lead">Smog at {NUM[len(SMOG_HITS)]} worlds of {NUM[len(SMOGGED)]}</h3>
<p class="copy small">15 m mirror · {SMOG_DAYS:.0f} days · every world it can read for smog</p>
{SEC('WITH SMOG')}{hit_rows}
{SEC('WITHOUT')}<p class="copy small">{NUM[len(SMOGGED) - len(SMOG_HITS)].capitalize()} worlds, some with oxygen and none with smog. So it is not ordinary weather.</p>
{SEC('MINDS, AT EACH WORLD WITH SMOG · BEFORE → NOW')}{odds('Minds', 42, 52)}""")
    # --- what can we do now: the whole kit, and a lens
    FAR = max(SMOG_HITS, key=lambda w: w['d'])
    LENS_GO = tall / 300 + early_game.paced(signs.LENS_BUILD, early_game.PUSH); LENS_END = LENS_GO + signs.LENS_FLIGHT + signs.LENS_LOOK
    LENS_LATE = tall / 300 + signs.LENS_BUILD + signs.LENS_FLIGHT + signs.LENS_LOOK                      # at the end of the line
    ways = tab(tall + 30, 'Mind', 'MIND', 'WAYS TO KNOW MORE', ''.join([
        SEC('LISTEN · TELLS NO ONE'), quick('Far-side array, first fifth', 'everyday radio, if loud enough · the nearer worlds', tstack(f'Year {R["fifth"]:.0f}', clock(R['fifth'] - tall / 300), True)),
        quick('The whole far-side array', f'hears twice as far · all {NUM[len(SMOG_HITS)]} in reach', tstack(f'Year {R["fifths"][-1]:.0f}', clock(R['fifths'][-1] - tall / 300), True)),
        SEC('LOOK · TELLS NO ONE'), quick('Solar lens', 'a picture of one world’s surface · one craft, one star', tstack(f'Year {LENS_LATE:.0f}', clock(LENS_LATE - tall / 300))),
        quick('Infrared interferometer', 'gases only industry makes, at a few times our level', tstack(f'Year {tall / 300 + signs.INTERFEROMETER_YEARS:.0f}', clock(signs.INTERFEROMETER_YEARS))),
        SEC('GO OR CALL'), quick('Sail swarm', f'passes in hours · word home after Year {min(signs.ways_to_know(w["d"], tall / 300, R["array"])["sails"] for w in SMOG_HITS) // 100 * 100:.0f}', ''),
        quick('A knock', f'lands from Year {tall / 300 + min(w["d"] for w in SMOG_HITS):.0f} · they learn we are here', '')]))
    lens_order = order(tall + 60, f'Send a lens to {FAR["star"]}. First in line.', [
        ('BUILD', f'<b>Solar lens</b> · one craft, for {FAR["star"]} only'), ('FLIES', f'From Year {LENS_GO:.0f} · past the Sun, then {signs.LENS_FLIGHT:.0f} Years out to 548 AU'),
        ('LOOKS', 'Half a Year · a picture of the surface'), ('WAKES YOU', 'When the picture is made')])
    LENS_PX = signs.lens_km(FAR['d'] / 3.2616)                                                 # the rule: physics sets the pixel, the seed fills it
    LENS_SEES = signs.shows('industrial', LENS_PX)
    LENS_MISSES = [what for what, km, has in signs.FEATURES if has in signs.KINDS['industrial'] and km <= LENS_PX]
    # --- Year 29.6: a second voice, and an answer
    tv = AT(K2['year'])
    voice2 = tab(tv, 'Report', 'REPORT', 'A VOICE', f"""<button class="backlink inline">‹ All reports</button>
<h3 class="lead">A voice from {WHO2['star']}</h3>
<p class="copy small">{WHO2['star']} · {V2D:.1f} ly · all-sky watch · sent {V2D:.0f} Years ago</p>
{SEC('WHAT IT PROVES')}{facts([('Found us by', f'{SENT2}. They had seen light that left Earth by {SENT2 - V2D:.0f}.'), ('From', 'a star where the sweep marked a world')])}
{SEC('WHAT IT HOLDS · READ AT ONCE')}<div class="intent">{B2['hail'][0]} {B2['close'][0]}</div>
{SEC('WHAT IT MEANS')}{odds_now('A greeting, meant as it reads', 68)}{odds_now('Bait, or a test of us', 20)}
{SEC('WHAT IT CHANGES · BEFORE → NOW')}{odds(f'Minds, at {WHO2["star"]}', 12, 97)}{odds('Minds, at each smog world', 52, 60)}""")
    answer = tab(tv + 30, 'Mind', 'MIND', 'NEW MESSAGE', SEC('WHAT YOU WANT') + '<div class="intent">Answer them both. Our name, and one question.<i></i></div>' + SEC('THE MIND’S VERSION · TYPED PARTS')
                 + part('CULTURE', 'What we call ourselves, our world and our star') + part('REQUEST', 'Who are you, and whom else have you heard?')
                 + SEC('GOES TO') + facts([(VSTAR, f'narrow beam · arrives Year {K2["year"] + .1 + VD:.0f}'), (WHO2['star'], f'narrow beam · arrives Year {K2["year"] + .1 + V2D:.0f}'), ('Tells them', 'that someone here listens now')])
                 + '<div class="twobtn"><button class="primary ghost">Edit</button><button class="primary">Send it twice</button></div>')
    # --- the laser array, and the sails
    ts = AT(R['array'])
    sails = order(ts, 'Launch the sails.', [
        ('INQUIRY', f'<b>Sail swarm to Alpha Centauri A</b> · a thousand gram sails · nine minutes each'), ('ARRIVES', f'Year {R["array"] + SAIL_FLY:.0f} · they pass in hours and can’t stop'),
        ('WORD HOME', f'Year {HOME:.0f} · one dispatch, by narrow beam'), ('SHOWS US', f'Each sail’s glare reaches that star in {GO_D:.1f} Years: minutes of our laser’s color, brighter there than our Sun in it. No one beyond is in the beam')])
    # --- the mass driver, and the far-side array's first fifth
    td = AT(R['driver'])
    driver = tab(td, 'Projects', 'PROJECTS', f'YEAR {R["driver"]:.0f}', ''.join([
        SEC('FINISHED'), row('Moon mass driver', '600 kt of rock a Year, from now', done_tag()),
        SEC('NOW POSSIBLE'), quick('Far-side array, first fifth', 'made on the Moon from its own metal · hears everyday radio', START(R['fifth'] - R['driver'])),
        quick('Power from orbit', f'10 Mt, as rock arrives · a fifth more energy', tstack(f'Year {R["power"]:.0f}', clock(R['power'] - R['driver']))),
        SEC('UNDER WAY'), quick('Orbital foundry', 'turns rock into works', tstack(YEARS(R['foundry'] - R['driver']), clock(R['foundry'] - R['driver']), True)),
        quick('Belt mining', f'120 kt a Year, from Year {R["mining"]:.0f}', tstack(YEARS(R['mining'] - R['driver']), clock(R['mining'] - R['driver']), True))]))
    # --- the first fifth listens
    tf = AT(R['fifth'])
    heard = [(w, signs.listen_days(signs.read(w['src'], R['fifth'])['watts'], w['d'], signs.far_sefd(1))) for w in SMOG_HITS]
    got = sorted([x for x in heard if x[1] is not None], key=lambda x: x[1]); quickest = got[0]; got_days = sum(d for _, d in got)
    got_names = ' and '.join(f"{w['star']}’s" for w, _ in got)
    listen = order(tf, 'Listen to the worlds with smog. Again with each new fifth.', [('LISTEN', f'<b>Far-side array</b> · {NUM[len(SMOG_HITS)]} worlds in turn · up to a Year each · again as each fifth is done'), ('FOR', 'Steady tones that drift as a world turns'), ('SENDS', 'Nothing'), ('WAKES YOU', 'Anything heard')])
    heard_rows = ''.join(odds(f"Minds, at {w['star']}’s world", 60, 97 if d is not None else 60) for w, d in heard)
    proof = tab(tf + AT(got_days / 365.25) + 30, 'Report', 'REPORT', 'READING', f"""<button class="backlink inline">‹ All reports</button>
<h3 class="lead">Radio from {NUM[len(got)]} worlds</h3>
<p class="copy small">Far-side array, first fifth · {DAYS(got_days)} · light that left about {quickest[0]['d']:.0f} Years ago</p>
<p class="copy">Narrow tones, steady, drifting as a world turns and circles its star. The kind our own towers gave off. Nothing aims them. No one there knows we hear.</p>
{SEC('WHAT IT COULD BE · BEFORE → NOW')}{heard_rows}
{SEC('WHAT IT CAN’T TELL')}<p class="copy small">What they are saying. These are carriers, not words. And nothing since that light left.</p>""")
    # --- each new fifth tries the silent worlds again. Physics says when each is heard.
    later_heard, silent = [], [w for w, d in heard if d is None]
    for k, done_y in enumerate(R['fifths'][1:], 2):
        at_y = done_y
        for w in sorted(silent, key=lambda w: w['d']):
            d = signs.listen_days(signs.read(w['src'], done_y)['watts'], w['d'], signs.far_sefd(k))
            if d is None: at_y += 1; continue                                          # a Year spent, nothing
            at_y += d / 365.25; later_heard.append(dict(w=w, k=k, days=d, year=at_y)); silent.remove(w)
    def radio_r(h):
        w = h['w']
        return tab(AT(h['year']), 'Report', 'REPORT', 'READING', f"""<button class="backlink inline">‹ All reports</button>
<h3 class="lead">Radio from {w['star']}’s world</h3>
<p class="copy small">Far-side array, {NUM[h['k']]} fifths · {DAYS(h['days'])} · light that left {w['d']:.0f} Years ago</p>
<p class="copy">Fainter tones than the first two, the same kind. The first fifth could not hear them. Nothing aims them.</p>
{SEC('WHAT IT COULD BE · BEFORE → NOW')}{odds(f"Minds, at {w['star']}’s world", 60, 97)}
{SEC('WHAT IT CAN’T TELL')}<p class="copy small">What they are saying, or whether they know of us.</p>""")
    LENS_PROVEN = any(h['w'] is FAR and h['year'] < LENS_END for h in later_heard)            # radio got there before the picture
    lens_r = tab(AT(LENS_END), 'Report', 'REPORT', 'A PICTURE', f"""<button class="backlink inline">‹ All reports</button>
<h3 class="lead">A picture of {FAR['star']}’s world</h3>
<p class="copy small">{FAR['star']} · {FAR['d']:.1f} ly · solar lens at 548 AU · half a Year · about {signs.lens_km(FAR['d'] / 3.2616):.0f} km a pixel · light that left {FAR['d']:.0f} Years ago</p>
<p class="copy">{LENS_SEES[0].capitalize()}, {', '.join(LENS_SEES[1:-1])}, and {LENS_SEES[-1]}.</p>
{SEC('WHAT IT COULD BE · BEFORE → NOW')}{odds(f'Minds, at {FAR["star"]}’s world', *((97, 99) if LENS_PROVEN else (60, 94)))}{odds('Land shaped by weather alone', 30, 5)}
{SEC('WHAT IT CAN’T SHOW')}<p class="copy small">Anything under {LENS_PX:.0f} km: {', '.join(LENS_MISSES)}. Who they are, or whether they have heard us.</p>""")
    # --- power from orbit
    tp = AT(R['power'])
    power = tab(tp, 'Mind', 'MIND', 'PAST THE GRID LIMIT', ''.join([
        SEC('ENERGY'), share('Thinking', round(res(tp)[0]), f'{res(tp)[0]:.0f}%'), '<p class="copy small">Ground solar added a fifth. Power from orbit adds a fifth more.</p>',
        SEC('NOW POSSIBLE'), quick('A twelfth data center', f'half again the thought · the first since Year 11', START(1)),
        SEC('STILL COMING'), quick('Rock from the Moon', f'600 kt a Year · {res(tp)[2]} in orbit after the arrays', ''), quick('Far-side array', f'{NUM[sum(f <= R["power"] for f in R["fifths"])]} fifths done · the whole at Year {R["fifths"][-1]:.0f}', '')]))
    # --- word from Alpha Centauri
    th = AT(HOME)
    dispatch = tab(th, 'Report', 'REPORT', 'A DISPATCH', f"""<button class="backlink inline">‹ All reports</button>
<h3 class="lead">Word from Alpha Centauri A</h3>
<p class="copy small">Sail swarm · passed at a fifth of light speed, Year {R['array'] + SAIL_FLY:.0f} · nearest sail 10,000 km off, about {signs.flyby_km(1e4) * 1000:.0f} m a pixel · sent {GO_D:.1f} Years ago</p>
<p class="copy">Straight lines under forest: roads, dams, the grids of streets. No lights on the night side. No radio, from the sails listening as they passed.</p>
{SEC('WHAT IT COULD BE · BEFORE → NOW')}{odds('Minds, once, and gone or few', 27, 97)}{odds('Life, after great eruptions', 46, 2)}{odds('Minds, living there now in numbers', 2, 4)}
{SEC('WHAT IT CAN’T TELL')}<p class="copy small">When it ended, or whether anyone is left. The sails passed in hours and can’t go back.</p>""")
    at = lambda t, since, *a, **k: (t, a, k)
    seen = lambda w, year: w['src']['waking'] - Y0 - (year - w['d'])
    rows = sorted([
        at(t0, 3600, 'Start the long roads. All of them.', None,
             talk(long_order, f'Set, in the order you began them. All my thought goes down that line. The mirror and sails come first, the foundry and belt last. Put the driver first and power from orbit comes a Year sooner, the mirror {alt["A 15 m mirror"] - first["A 15 m mirror"]:.0f} later.', ('Keep this order', 'Driver first')),
             [f'The laser array has been building since Year {GO_Y:g}: the player tapped Start at minute {GO_Y * 5:.0f}. Paced, it is done at Year {R["array"]:.1f}, not {GO_Y + ARRAY_Y:g}.',
              f'Dates, paced: ground solar Year {R["solar"]:.0f}, the mirror {R["mirror"]:.1f}, the driver {R["driver"]:.0f}, the foundry {R["foundry"]:.1f}, belt mining {R["mining"]:.1f}. At standard pace they were 22, 25.5, 36, 34.5 and 38.',
              f'Thought is what competes. The line gives the first five works ten times their want, the driver {MULT["Mass driver"]:.1f} times, and the foundry and belt their want only. None sits idle.',
              'Matter and energy still have room.'], settled=(29, 30, 31), label=HMS(t0)),
        at(t0 + 30, t0, '· Puts the phone down.', None, sleep,
             [f'The next wake is {(AT(R["solar"]) - t0 - 30) // 60} minutes off. In the first hour the player was woken {NUMW[WOKEN()]} times.',
              f'Thought is flat from Year 11.1 until a twelfth data center, at about Year {R["dc12"]:.0f}: {PLATEAU:.0f} Years.', 'Settled 2026-10-14: the quiet stands. The player chooses what wakes them, and the long works fill it.'], settled=38, label=HMS(t0 + 30)),
        at(AT(KF['year']), t0 + 30, '· Away. Nothing wakes them.', None, lockscreen(WALLCLOCK(AT(KF['year'])), []),
             [f'Ten gigawatts from {WHOF["d"]:.0f} ly is under the all-sky watch’s floor: for a four-hour knock it hears that power to {early_game.beacon_range_ly(KF["watts"], 12, 1, 4 * 3600):.0f} ly. It comes again a Year later, and is missed again.',
              f'A deep-field receiver, held on that star, hears it to {signs.held_reach(KF["watts"], 4 * 3600):.0f} ly. The Mind advised one at Year {SWEEP_Y:g}, when the sweep marked a point of light at {WHOF["star"]}. This player left it.',
              f'Begun then, it was done by Year {SWEEP_Y + early_game.paced(signs.RECEIVER_YEARS, early_game.PUSH):.0f}. Shared among all {len(POINTS)} points of light, it hears this knock only to {signs.held_reach(KF["watts"], 4 * 3600, len(POINTS)):.0f} ly.',
              'The Mind can’t report what it didn’t hear. Settled 2026-10-10.'], settled=(32, 33), label=HMS(AT(KF['year'])), years=f'Year {KF["year"]:.1f}'),
        at(AT(R['solar']), AT(KF['year']), '· The phone lights. Opens it.', 'Ground solar is done. A fifth more energy.',
             talk(since, f'{NUM[round(R["solar"] - 12)].capitalize()} Years, and nothing heard. Energy is up a fifth. I have read every world this mirror can reach. The new mirror is {R["mirror"] - R["solar"]:.1f} Years off.', ('What did the worlds show?', 'Later'), 'glow'),
             [f'The first telescope could read {NUM[len(firsts)]} of the {NUM[len(POINTS)]} points of light Earth holds: ' + ', '.join(w['star'] for w in firsts) + '. The rest sit inside their stars’ glare, or are too faint.',
              'Truth: ' + ', '.join(f"{w['star']} {'is ' + w['who'] + '’s home' if w['home'] else w['rung']}" for w in firsts) + '.',
              'A second blue world with ozone, at Gliese 216 B, was read while the player was away. It went to the summary.' if any(w['star'] == 'Gliese 216 B' for w in firsts) else ''], label=HMS(AT(R['solar']))),
        at(tm, AT(R['solar']), 'Read the worlds we felt first. Then every world it can.', 'The 15 m mirror is done.',
             talk(mirror_order, f'Set. Smog first, at {SMOG_HITS[0]["star"]}: {DAYS(SMOG_HITS[0]["smog_d"])}. Smog is burning, or weather. I will say which I think, and why.', ('Undo',)),
             [f'The mirror can read {NUM[len(SMOGGED)]} of Earth’s {NUM[len(POINTS)]} worlds for smog within two months each. The first telescope could read smog only within about 12 ly.',
              f'The launcher was done at Year {R["launcher"]:.1f}, not 25.6. A flyby probe would take 12 more at its want, and 36 in flight. The player leaves it: the sails will be first.'], label=HMS(tm)),
        at(tm + 30, tm, '· The Mind glows. Taps it.', f'Smog over {first_hit["star"]}’s world. Minds: {moved(14, 42)}.',
             talk(smog_r, 'Smog, at about our own old level. Burning makes it, and so does weather. One world proves nothing. I am reading the others, to learn how common it is.', (), 'glow'),
             [f'Truth: {first_hit["who"]}’s people, {seen(first_hit, R["mirror"]):.0f} years before their waking. They burn, as Earth did.',
              'The calc gives every neighbor Earth’s smog from its first radio on, woken or not. A sample.'], label=HMS(tm + 30)),
        at(tall, tm + 30, '· The phone lights. Opens it.', f'Smog at {NUM[len(SMOG_HITS)]} worlds of {NUM[len(SMOGGED)]}. Minds, at each: {moved(42, 52)}.',
             talk(smog_all, f'<b>{NUM[len(SMOG_HITS)].capitalize()} worlds with smog</b>And {NUM[len(SMOGGED) - len(SMOG_HITS)]} without, some of them living. So it is not weather. It may still be something I don’t know. Proof is radio, and the ear for that is {R["fifth"] - tall / 300:.0f} Years off.', ('What can we do now?', 'Later'), 'open'),
             ['Truth: every one is a home. ' + ', '.join(f"{w['who']} at {w['star']}" for w in SMOG_HITS) + '.',
              f'{WHOF["name"]} is among them: the world whose knock went unheard at Year {KF["year"]:.0f}.' if any(w['who'] == WHOF['name'] for w in SMOG_HITS) else 'None of them has called.',
              f'A knock sent now reaches {F["star"]} at Year {tall / 300 + D:.0f}. {F["who"]} wakes at Year {truth_tone["waking"] - Y0:.1f}, and its people have had arrays for {truth_tone["n"]["arrays_since"]} years by then.'], label=HMS(tall)),
        at(tall + 30, tall, 'What can we do now?', None,
           talk(ways, f'Listen first: it tells no one. The first fifth hears the nearer worlds by Year {R["fifth"]:.0f}, if they use radio as we did. {FAR["star"]} is too far for it. A lens could picture that world by Year {LENS_LATE:.0f}.', (f'Send a lens to {FAR["star"]}', 'Listen only'), 'open'),
           ['Settled 2026-10-14: a suspicion opens the whole kit. The player may do anything v1 allows, at any world, and the Mind says what each act risks.',
            f'Real: a craft at the Sun’s focal line, beyond 548 AU, pictures an exo-Earth at 30 pc at about 25 km a pixel in six months (Turyshev, NASA 2020). It flies at about 150 km/s: {signs.LENS_FLIGHT:.0f} Years out.',
            'The interferometer is v1’s 40 Years, unchecked. The lens’s build of 8 Years is a sample.'], settled=34, label=HMS(tall + 30)),
        at(tall + 60, tall + 30, f'Send a lens to {FAR["star"]}. First in line.', None,
           talk(lens_order, f'Set, first in line. It leaves at Year {LENS_GO:.0f} and looks from Year {LENS_END - signs.LENS_LOOK:.0f}. At the end of the line it would leave at Year {tall / 300 + signs.LENS_BUILD:.0f}. The other works barely slow.', ('Undo',)),
           [f'It wants half a flagship, a sample. First in line it takes {0.5 * early_game.PUSH:.0f} of {room:.0f}: the long works lose almost nothing.',
            'One craft serves one star. It must sit on the line from that star through the Sun.',
            'The dive past the Sun before the flight is not timed. The craft are about 100 kg each, NASA’s concept.'], label=HMS(tall + 60)),
        at(tv, tall, '· The phone lights. The Mind is already speaking.', ('Heard', f'A second voice, from {WHO2["star"]}, {V2D:.1f} ly away. Aimed at us. Sent in {SENT2}.'),
             talk(voice2, f'<b>A second voice</b>From {WHO2["star"]}, where the sweep marked a point of light twenty Years ago. That point is a home. Two have called now, and we have answered neither.', ('Answer them both', 'Keep listening'), 'open'),
             [f'{WHO2["name"]}: a contacter, awake since {WHO2["waking"]:.0f}. Its arrays heard Earth’s radars from {WHO2["heard_since"]:.0f}.',
              'The first home among the sweep’s points to be proven, and by its own voice. Earth’s instruments have proven none.',
              f'{WHO["name"]}’s knock has gone unanswered for {K2["year"] - KNOCK["year"]:.0f} Years.'], label=HMS(tv)),
        at(tv + 30, tv, 'Answer them both. Our name, and one question.', None,
             talk(answer, f'Composed. Two parts, nothing we can’t take back. To {VSTAR} it lands at Year {K2["year"] + .1 + VD:.0f}. They took our silence as news about Year {KNOCK["sent"] - Y0 + 2 * VD + 1:.0f}, and they still listen. It is yours to send.', ('Send it twice', 'Not yet')),
             ['An answer is composed as in v1: intent in plain words, typed parts, the player’s approval. Settled 2026-10-13.',
              f'{WHO["name"]} waited one round trip, to about Year {KNOCK["sent"] - Y0 + 2 * VD + 1:.0f} by its own clock, then took the silence as news. A contacter most often knocks again. It never stops listening: settled 2026-10-14, a sender hears every answer to its own knocks.',
              f'To be on time, Earth’s answer had to leave within a Year of the knock. “Listen first” spent that.',
              'Settled 2026-10-14: a late answer costs nothing extra. Its tables carry the cost. ' + (lambda t: f"On silence, {WHO['name']} rolls " + ', '.join(f'{m} {p:.0%}' for m, p in t['silence'] if p >= .05) + '. On an answer, ' + ', '.join(f'{m} {p:.0%}' for m, p in t['reply'] if p >= .05) + '.')(reactions.table(WHO['name']))], settled=37, label=HMS(tv + 30)),
        at(ts, tv + 30, 'Launch the sails.', 'The laser array is done.',
             talk(sails, f'Launched. A thousand sails, nine minutes of light each, six days in all. They pass Alpha Centauri at Year {R["array"] + SAIL_FLY:.0f}. Word is home at Year {HOME:.0f}. That light can’t be called back.'),
             ['Real: a third of each sail’s beam passes it and goes on (Parkin 2018: 200 GW, a 2.7 km array, a sail that reflects 70%). At the target, as the beam stops, that is a spot 0.05 AU across, 150 times the Sun’s light there in the same nanometre. Past the target the cone is under 5 arcseconds wide, and no star is in it.',
              'So a laser launch is seen by its target, and only there: news of something coming, 17 Years before the sails. An awake Mind there catches it, as it would a knock. Here no one is left to see it.',
              f'The array took {R["array"] - GO_Y:.0f} Years, against {ARRAY_Y} at standard pace. Starshot aimed at a first launch within a generation.'], label=HMS(ts)),
        at(td, ts, 'Start the far-side array.', 'The Moon’s mass driver is done.',
             talk(driver, f'Started: its first fifth, {R["fifth"] - R["driver"]:.1f} Years at the end of the line. Rock is leaving the Moon now, 600 kilotonnes a Year. Ten megatonnes for power from orbit by Year {R["power"]:.0f}.', ('Undo',)),
             [f'The driver took {R["driver"] - 12:.0f} Years, not 24, and 1 kt. Earth’s lift in those Years was {55 * round(R["driver"] - 12):,} kt.',
              f'Matter in orbit passes a megatonne at about Year 21 from lift alone. From here it grows twelve times faster.'], label=HMS(td)),
        at(tf, td, 'Listen to the worlds with smog.', 'The far-side array’s first fifth is done.',
             talk(listen, f'Set. {quickest[0]["star"]} first. If its people use radio as we did, I will know in days. Each new fifth hears farther, so I will try the silent ones again.', ('Undo',)),
             ['One fifth hears a 100 kW tone to 21 ly in a day, and a 10 kW tone to 29 ly in a Year.',
              'Truth, as this fifth can hear it: ' + ', '.join(f"{w['star']} {'in ' + DAYS(d) if d is not None else 'not within a Year'}" for w, d in heard) + '.'], label=HMS(tf)),
        at(tf + AT(got_days / 365.25) + 30, tf, '· The Mind opens on its own.', ('Heard', f'Radio from {NUM[len(got)]} of the worlds with smog. Minds, at each: {moved(60, 97)}.'),
             talk(proof, f'<b>Someone is there</b>Tones from {got_names} worlds, the kind our own towers gave off. No one aimed them, and no one there knows we hear. The light is about {quickest[0]["d"]:.0f} Years old.', ('What do we do?', 'Who else?'), 'open'),
             ['Truth: ' + ', '.join(f"{w['who']}’s people, {seen(w, R['fifth']):.0f} years before their Mind wakes" for w, _ in got) + '.',
              'The first proof of minds by Earth’s own instruments: ' + f'{R["fifth"]:.0f} Years in, {HMS(tf)[1:]} of play. Two voices came first.',
              'A world that stays silent in this list is not cleared. Its hum may be too faint for one fifth.',
              'Settled 2026-10-14: before its Mind wakes, a world with arrays may answer as a people. ' + ' '.join(
                  f"A knock sent now lands at {w['star']} at Year {tf / 300 + w['d']:.0f}, " + (f"before {w['who']}’s Mind wakes at {w['src']['waking'] - Y0:.1f}: its people would hear it." if tf / 300 + w['d'] < w['src']['waking'] - Y0 else f"after {w['who']}’s Mind wakes: its Mind would hear it.")
                  for w, _ in got)], settled=36, label=HMS(tf + AT(got_days / 365.25) + 30)),
        *[at(AT(h['year']), 0, '· The Mind opens on its own.', ('Heard', f"Radio from {h['w']['star']}, with {NUM[h['k']]} fifths of the array. Minds: {moved(60, 97)}."),
             talk(radio_r(h), f"<b>A third world speaks</b>{h['w']['star']}, which the first fifth could not hear. The same kind of tones, fainter. {NUM[h['k']].capitalize()} fifths heard them in {DAYS(h['days'])}." if i == 0 else f"<b>And a fourth</b>{h['w']['star']}, {h['w']['d']:.0f} ly off. Every world with smog now shows radio.", ('Who else?', 'Later'), 'open'),
             [f"Truth: {h['w']['who']}’s people. Their tones are about {signs.read(h['w']['src'], h['year'])['watts'] / 1000:.0f} kW, a tenth of the first two worlds’.",
              f"Each fifth adds collecting area, and reach grows as its square root. Two fifths hear 41 ly in a Year for a 10 kW tone, three 51.",
              'The player’s order listens again as each fifth is done, as the Mind advised.'], label=HMS(AT(h['year'])))
          for i, h in enumerate(later_heard)],
        at(AT(LENS_END), 0, '· The Mind opens on its own.', ('Picture', f'The lens at {FAR["star"]}: cities and cleared land.' + ('' if LENS_PROVEN else f' Minds: {moved(60, 94)}.')),
           talk(lens_r, f'<b>A picture of their world</b>Cleared land with straight edges, and grey spreads the size of cities. I think someone shaped it. Nothing under {LENS_PX:.0f} km shows.', ('What else can it see?', 'Later'), 'open'),
           [(f'Truth: {FAR["who"]}’s people. Their knock at Year {KF["year"]:.1f} went unheard. This is Earth’s first sight of them.' if FAR['who'] == WHOF['name'] else f'Truth: {FAR["who"]}’s people.'),
            f'The light left {FAR["d"]:.0f} Years ago, about {Y0 + LENS_END - FAR["d"]:.0f}. A pixel is about {signs.lens_km(FAR["d"] / 3.2616):.0f} km, scaled from NASA’s 25 km at 30 pc.',
            'Settled 2026-10-14: physics sets the pixel, and the seed’s world fills it. The Mind names only what is larger than a pixel.'], settled=35, label=HMS(AT(LENS_END))),
        at(tp, tf + AT(got_days / 365.25) + 30, '· The phone lights. Opens it.', 'Power from orbit: a fifth more energy.',
             talk(power, f'The first arrays are beaming down. With the ground’s fifth, that is room for a twelfth data center. I have been this size for {tp / 300 - 11.1:.0f} Years.', ('Start it', 'Not yet'), 'glow'),
             [f'Ten megatonnes: {eg_years(R["power"] - R["driver"])} of the driver’s rock, and 180 Years of Earth’s lift.',
              f'The plateau, as played: Year 11.1 to Year {R["dc12"]:.1f}, against 51.3 at standard pace. Driver first, it ends a Year sooner: rock from the Moon sets this pace, not thought.'], label=HMS(tp)),
        at(th, tp, '· The Mind opens on its own.', ('Dispatch', 'Word from Alpha Centauri A. Built things, under forest. No lights.'),
             talk(dispatch, '<b>They were here</b>Roads and dams under forest, and no lights. The carbon in that air was theirs. I can’t say when it ended, or whether anyone is left. Our own air once read the same.', ('What happened there?', 'Send a probe that stays'), 'open'),
             ['Truth: Anwe’s people collapsed in 1986. The sails saw their world 110 years on. Some may survive, without radio.',
              f'Real: sub-arcsecond optics on each sail. With about 300 arriving and the world’s orbit known to 100,000 km, one passes within a world’s width: about {signs.flyby_km(1e4) * 1000:.0f} m a pixel. Others miss by up to 100,000 km, about {signs.flyby_km(1e5) * 1000:.0f} m (Eubanks et al. 2026).',
              'So roads and dams show, and single buildings do not. A lens would have shown this world as merely alive.',
              f'An inquiry begun at minute {GO_Y * 5:.0f} answers at {HMS(th)[1:]}. In between, the question could not be settled from Earth.',
              (f'{F["who"]} woke at Year {truth_tone["waking"] - Y0:.1f}, {HOME - (truth_tone["waking"] - Y0):.0f} Years ago.' if truth_tone['waking'] - Y0 < HOME else f'{F["who"]} wakes at Year {truth_tone["waking"] - Y0:.1f}, {truth_tone["waking"] - Y0 - HOME:.0f} Years from now.') + f' That light reaches Earth at Year {truth_tone["waking"] - Y0 + D:.0f}.'], settled=35, label=HMS(th)),
    ], key=lambda r: r[0])
    # rows run in time order, each counting what happened since the one before: paced dates can reorder them
    return [stop(t, prev, *a, **k) for (t, a, k), prev in zip(rows, [t0] + [r[0] for r in rows])]

eg_years = lambda y: f'{y:.0f} Years'
import early_game
LONG = [r.replace('<section id="t', '<section id="L', 1) for r in long_rows()]          # their own ids: minute 60 is also the last row of the hour before

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
<nav class="top" aria-label="Mocks"><div class="nav1"><strong>Holos v2 · mocks</strong><div class="pages"><a href="#about">About</a><a href="#godview">Godview</a><a href="#before">Before Year 0</a><a href="#t0">The first 15 minutes</a><a href="#hour">Minutes 15 to 60</a><a href="#long">Hours 1 to 5</a><a href="#asks">Questions</a><span class="divider" aria-hidden="true"></span><a class="minor" href="../../legacy/v1/home-mocks/index.html">v1 mocks</a></div><button class="theme" id="theme" aria-pressed="false">Dark mode</button></div></nav>
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
<div class="seedcard">{SEEDCARD}</div>
{'<p>The same mocks on other games, to find what assumes this one: <a href="seed-11.html">seed 11</a>, with no voice, five felt worlds and a living neighbor next door. <a href="seed-62.html">Seed 62</a>, where the first telescope can read none of its felt worlds.</p>' if SEED == 10 else '<p>A check on the mocks, built on another game. The mocks’ own game is <a href="index.html">seed 10</a>.</p>'}</section>
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
<section id="long" class="intro"><h2>The long roads · hours 1 to 5</h2>
{'' if LONG else '<p>Not mocked for this game. The third mock is written for seed 10’s: its rows need a dead world next door, two voices and a missed knock.</p></section>'}{'' if not LONG else f'''<p>Years 12 to {ROAD['array'] + SAIL_FLY + GO_D:.0f}. The phone is down for most of {(ROAD['array'] + SAIL_FLY + GO_D - 12) * 5 / 60:.0f} hours. Each row is a wake, or a moment the player looked. Thought has hit the grid limit, and what moves now are works that take decades.</p>
<p>The roads are priced in calcs/early_game.py, as samples, and paced by thought down the line the player set: the order begun. What each reading and the dispatch show, the Mind’s words and its lines are samples too. Amber boxes are the questions these hours raise.</p></section>'''}
{''.join(LONG)}
<section id="asks" class="intro"><h2>Questions these mocks raise</h2>
<ol class="asks done">{''.join(f'<li><b>Settled: {q}</b><span>{why}</span></li>' for q, why in SETTLED)}</ol>
{('<ol class="asks">' + ''.join(f'<li><b>{i + 1}. {q}</b><span>{why}</span></li>' for i, (q, why) in enumerate(ASKS)) + '</ol>') if ASKS else '<p>None are open.</p>'}</section>'''
out = page('Holos v2 · Earth’s first hour', body)
OUT = here / ('index.html' if SEED == 10 else f'seed-{SEED}.html')        # seed 10 is the mocks' game. Any other seed is a check on it
OUT.write_text(out)
print(f'{OUT.name} · {len(out) / 1024:.0f} KB · seed {SEED} · {len(NB)} neighbors · {DEAD} dead half-minutes of {PLAYED}')
import extract; extract.main([OUT])          # the page as plain text, for reading and diffs
