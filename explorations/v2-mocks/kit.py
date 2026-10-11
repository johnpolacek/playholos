"""The v2 mocks' kit: one drawn game, Earth's numbers in it, and the phone's parts. Used by build.py.

The game is drawn by calcs/seed.py, so every neighbor, star, date and branch is one real draw.
Star positions are real (HYG 4.1, the Gaia census). The phone's parts are v1's, copied and cut down.
"""
import csv, math, random, re, struct, sys
from pathlib import Path

here = Path(__file__).resolve().parent
root = here.parents[1]
sys.path.insert(0, str(root / 'calcs'))
import hosts, knocks, neighbors as nb, reactions, seed as seedmod

# The default is the lowest seed with the median number of neighbors: python3 calcs/seed.py stats
SEED = int(sys.argv[1]) if len(sys.argv) > 1 else 10
PAPER, INK, MUTED, FAINT, YOU, OTHER = '#FBFAF7', '#171716', '#6B6860', '#CFCBC0', '#1F7A96', '#A8620F'
PC, Y0 = 3.261563777, 2040.0
ROT = [(-.0548755604, -.8734370902, -.4838350155), (.4941094279, -.4448296300, .7469822445), (-.8676661490, -.1980763734, .4559837762)]

# ---------- The game ----------
ROWS = nb.load_hosts()
G = seedmod.draw(SEED, ROWS)
E, NB = G['earth'], G['neighbors']
STARS = {s['id']: s for s in hosts.stars()}

def atlas(ra_deg, dec_deg, ly):
    ra, dec = math.radians(ra_deg), math.radians(dec_deg)
    eq = [ly * math.cos(dec) * math.cos(ra), ly * math.cos(dec) * math.sin(ra), ly * math.sin(dec)]
    g = [sum(a * b for a, b in zip(r, eq)) for r in ROT]
    return (g[0], g[2], -g[1])
def host_xyz(h):
    s = STARS[h['id']]; return atlas(s['ra'], s['dec'], h['distance_ly'])

hyg = {r['hip']: r for r in csv.DictReader((root / '.cache/hygdata_v41.csv').open()) if r['hip']}
def hip_xyz(hip):
    r = hyg[hip]; return atlas(float(r['ra']) * 15, float(r['dec']), float(r['dist']) * PC)
raw = (root / 'data/neighborhood.bin').read_bytes()
vals = struct.unpack('<' + 'f' * (len(raw) // 4), raw)
CENSUS = [vals[i:i + 5] for i in range(0, len(vals), 5)]

# Star names as people say them: the host list keeps catalog short forms.
GREEK = dict(Alp='Alpha', Bet='Beta', Gam='Gamma', Del='Delta', Eps='Epsilon', Zet='Zeta', Eta='Eta', The='Theta', Iot='Iota', Kap='Kappa', Lam='Lambda',
             Mu='Mu', Nu='Nu', Xi='Xi', Omi='Omicron', Pi='Pi', Rho='Rho', Sig='Sigma', Tau='Tau', Ups='Upsilon', Phi='Phi', Chi='Chi', Psi='Psi', Ome='Omega')
GEN = dict(And='Andromedae', Aql='Aquilae', Aqr='Aquarii', Ara='Arae', Ari='Arietis', Aur='Aurigae', Boo='Boötis', Cam='Camelopardalis', Cap='Capricorni',
           Cas='Cassiopeiae', Cen='Centauri', Cep='Cephei', Cet='Ceti', CMa='Canis Majoris', CMi='Canis Minoris', Cnc='Cancri', Com='Comae Berenices',
           CrB='Coronae Borealis', Crv='Corvi', CVn='Canum Venaticorum', Cyg='Cygni', Del='Delphini', Dor='Doradus', Dra='Draconis', Eri='Eridani',
           For='Fornacis', Gem='Geminorum', Gru='Gruis', Her='Herculis', Hor='Horologii', Hya='Hydrae', Hyi='Hydri', Ind='Indi', Leo='Leonis', Lep='Leporis',
           Lib='Librae', LMi='Leonis Minoris', Lup='Lupi', Lyn='Lyncis', Lyr='Lyrae', Men='Mensae', Mic='Microscopii', Mon='Monocerotis', Mus='Muscae',
           Oph='Ophiuchi', Ori='Orionis', Pav='Pavonis', Peg='Pegasi', Per='Persei', Phe='Phoenicis', Pic='Pictoris', PsA='Piscis Austrini', Psc='Piscium',
           Pup='Puppis', Ret='Reticuli', Scl='Sculptoris', Sco='Scorpii', Ser='Serpentis', Sex='Sextantis', Sge='Sagittae', Sgr='Sagittarii', Tau='Tauri',
           Tel='Telescopii', TrA='Trianguli Australis', Tri='Trianguli', Tuc='Tucanae', UMa='Ursae Majoris', UMi='Ursae Minoris', Vel='Velorum', Vir='Virginis',
           Vol='Volantis', Vul='Vulpeculae')
def pretty(name):
    m = re.match(r'^(Gl|GJ|NN|Wo) ?(\d+\.?\d*) ?([ABC]?)$', name)
    if m: return f'Gliese {m.group(2)}' + (f' {m.group(3)}' if m.group(3) else '')
    m = re.match(r'^(\d+)? ?([A-Z][a-z]{1,2})? ?(\d)? ?([A-Z][A-Za-z]{2})( [ABC])?$', name)
    if m and m.group(4) in GEN and (m.group(1) or m.group(2) in GREEK):
        n, g, sup, con, comp = m.groups()
        head = (GREEK[g] + (f'{"¹²³"[int(sup) - 1]}' if sup else '')) if g in GREEK else n
        return f'{head} {GEN[con]}{comp or ""}'
    return name
for p in NB: p['star'] = pretty(p['host']['name'])

def clock(years):
    """Real time for a span of game time: 5 minutes a Year."""
    s = round(years * 300); return f'{s // 3600:02d}:{s % 3600 // 60:02d}:{s % 60:02d}'
def yr(t):
    y = round(t / 300, 1); return int(y) if y == int(y) else y
def fmt(n): return f'{n:.1f}'
def text(x, y, s, size=10, fill=MUTED, anchor='start', weight=None):
    w = f' font-weight="{weight}"' if weight else ''
    return f'<text x="{fmt(x)}" y="{fmt(y)}" font-size="{size}" fill="{fill}" text-anchor="{anchor}"{w} stroke="{PAPER}" stroke-width="3" stroke-linejoin="round" paint-order="stroke">{s}</text>'
def tstack(years, real, live=False):
    return f'<span class="tstack"><span class="gy">{years}</span><span class="rtime{" live" if live else ""}">{real}</span></span>'
def stipple(seed, n=90, w=390, h=360):
    rng = random.Random(seed)
    return ''.join(f'<circle cx="{rng.uniform(0, w):.0f}" cy="{rng.uniform(0, h):.0f}" r="{rng.choice((.5, .5, .8))}" fill="{INK}" opacity=".35"></circle>' for _ in range(n))

# ---------- Earth in this game ----------
# Dials as a knob's place from left to right: Open to Hidden, Expand to Deepen, Cautious to Bold. The base is
# HOLOS_GAME_CONCEPT.md's: leans Open, near the middle, leans Bold. Each branch nudges one. Sample sizes.
NUDGE = 12
DIALS = [35 + NUDGE * (E['taiwan'] == 'invasion'), 50 - NUDGE * E['mars'], 62 - NUDGE * (E['taiwan'] == 'blockade') - NUDGE * E['nuclear']]
def lean(v, a, b): return f'leans {a}' if v < 44 else f'leans {b}' if v > 56 else 'near the middle'
DIAL_WORDS = ' · '.join([lean(DIALS[0], 'open', 'hidden'), lean(DIALS[1], 'expand', 'deepen') if abs(DIALS[1] - 50) > 6 else 'expand and deepen, even', lean(DIALS[2], 'cautious', 'bold')])
CAUTIOUS, HIDDEN = DIALS[2] < 44, DIALS[0] > 56
CHARTER = ('We were loud by accident. Be quiet on purpose.' if HIDDEN else
           'We came close to ending ourselves. Look first, then speak as one.' if CAUTIOUS else
           'We have always called out. Now find who answers.')
GRID_TW, SPARE_KT, LIFT_KT = 24, 20, 40       # matter is what is spare in orbit: depots, spent stages, dead craft
COMPUTE = 1e25 * E['compute']
def sci(x):
    e = math.floor(math.log10(x)); m = x / 10 ** e
    sup = str(e).translate(str.maketrans('0123456789', '⁰¹²³⁴⁵⁶⁷⁸⁹'))
    return f'10{sup}' if round(m, 1) == 1 else f'{m:.1f}×10{sup}'
def dials(v=DIALS):
    ends = (('Open', 'Hidden'), ('Expand', 'Deepen'), ('Cautious', 'Bold'))
    return ''.join(f'<div class="dial"><span>{a}</span><b><s style="left:{p}%"></s></b><span>{b}</span></div>' for (a, b), p in zip(ends, v))

# ---------- Earth's seeded find ----------
# A neighbor's world if one tugs hard enough for Earth's planet hunters by 2040, else a natural world the seed adds.
def make_find():
    if G['found']:
        p = G['found'][0]; h = p['host']; mass = p['n']['world']['mass']; a = p['a']; k = p['tug']; who = p['name']
        msini = mass * math.sin(math.radians(p['pole']))
    else:
        h = G['natural']; who = None
        a = h['hz_in'] + 0.4 * (h['hz_out'] - h['hz_in']); floor = nb.rv_2040(h)
        msini = 1.5 * floor / nb.tug(1, a, nb.star_mass(h['luminosity']), 1); k = 1.5 * floor; mass = msini / 0.87
    period = math.sqrt(a ** 3 / nb.star_mass(h['luminosity'])) * 365.25
    north = h['north'] and h['kind'] in 'GK'
    return dict(host=h, star=pretty(h['name']), d=h['distance_ly'], who=who, mass=mass, msini=msini, a=a, tug=k, period=period,
                by='Terra Hunting' if north else 'ESPRESSO', found=2036 if north else 2034, xyz=host_xyz(h))
FIND = make_find()
EARTHS = lambda m: f'{m:.1f}'.rstrip('0').rstrip('.')

# 82 Eridani d (Nari et al. 2025): at least 5.8 Earth masses, 647.6 days, e 0.45, 1.354 AU. How much of its year is warm?
def warm_share(a=1.354, e=0.45, lum=0.66):
    lo, hi = hosts.hz(lum); inside = 0; n = 2000
    for i in range(n):
        M = 2 * math.pi * (i + .5) / n; Ecc = M
        for _ in range(30): Ecc = M + e * math.sin(Ecc)
        inside += lo <= a * (1 - e * math.cos(Ecc)) <= hi
    return inside / n, lo, hi
ERI_SHARE, ERI_LO, ERI_HI = warm_share()

# What a Year of SKA-Mid listening rules out at a star: the floor for a steady tone, in watts.
def year_floor(ly): return nb.floor_watts(1.1, 1, nb.YEAR_S, ly)
def watts(w): return f'{w / 1e6:,.0f} MW' if w >= 1e6 else f'{w / 1e3:,.0f} kW'

# ---------- Earth's knocks ----------
TARGETS = {}
for msg, sent, target, ly in knocks.KNOCKS:
    t = TARGETS.setdefault(target, dict(target=target, ly=ly, sends=[]))
    t['sends'].append((msg, sent, sent + ly - Y0, sent + 2 * ly - Y0))          # message, sent, arrives (Year), earliest reply (Year)
AT = {nb.KNOCKED.get(t): t for t in nb.KNOCKED}                                  # host-list name -> knock target
def who_at(target):
    return next((p for p in NB if AT.get(p['host']['name']) == target), None)
LUY = TARGETS["Luyten's Star"]; LUY_Y = [round(s[3], 1) for s in LUY['sends']]   # reply windows, Years

# ---------- The phone ----------
TABS = ['Home', 'Report', 'Projects', 'Reach', 'Mind']
def rail(active):
    return '<nav class="rail" aria-label="Main">' + ''.join(f'<button class="on" aria-current="page">{t}</button>' if t == active else f'<button>{t}</button>' for t in TABS) + '</nav>'

# Compute in use, as a share of what Earth has that Year. Shares are v1's: a choice of how much thought goes in.
# (start Year, end Year, share): the queue at Year 0, then what the player starts.
# Ground data centers: the fabs fill one a Year, each +50% compute, and thinking's draw on energy grows with it.
# The first is queued before Year 0. A standing order at Year 1.1 keeps them coming.
DC_STEP = 1.5
DCS = [('Ground data center', 0), ('Second data center', 1.1), ('Third data center', 2.1)]
DC_DONE = tuple(s + 1 for _, s in DCS)
THINK = 100 * .25 / GRID_TW                    # thinking's share of energy at Year 0, in percent
USES = [(0, 6, 1), (0, 6, 20), (0, .1, 5), (0, .2, 5), (0, .3, 5),                         # sky watch, flash watch, three looks
        (.4, 18.4, 15), (.8, 2.8, 5), (1.1, 2.1, 10), (1.6, 11.6, 15), (1.8, 3.0, 10)]     # telescope, quieting the radars, a Year's listening, vault, Luyten watch
USES += [(s, s + 1, 5) for _, s in DCS]
def res(t):
    y = t / 300
    grown = DC_STEP ** sum(y >= d for d in DC_DONE)
    used = sum(s for a, b, s in USES if a <= y < b) / grown
    matter = SPARE_KT + LIFT_KT * y - .04 * (y >= .4) - 10 * (y >= 1.6)
    return (round(THINK * grown, 1), round(used), f'{matter:,.0f} kt')
def hud(t, r=None, pre=False):
    e, c, m = r or res(t)
    when = 'Before Year 0' if pre else f'Year {yr(t)}'
    right = 'The clock starts when you begin' if pre else f'{Y0 + t / 300:.1f} · 1 Year = <span class="rtime">00:05:00</span>'
    return (f'<div class="hud"><div class="hud1"><span class="name"><i></i>Earth</span><span class="gy">{when}</span></div>'
            f'<div class="hud2"><span>Sol</span><span>{right}</span></div>'
            f'<div class="res"><span>ENERGY<b><s style="width:{e}%"></s></b></span><span>MATTER<em>{m}</em></span><span>COMPUTE<b><s style="width:{c}%"></s></b></span></div></div>')
def tab(t, active, head, right, body, strip='', pre=False, r=None):
    return f'<div class="phone">{hud(t, r, pre)}{strip}<div class="tabpage"><div class="ph"><span>{head}</span><span class="mono">{right}</span></div>{body}</div>{rail(active)}</div>'
def row(title, sub, right='', tone='', bar=None, marker=False):
    mk = f'<span class="mk {tone}"></span>' if marker else ''
    b = f'<span class="bar"><span style="width:{bar}%"></span></span>' if bar is not None else ''
    return f'<button class="row">{mk}<span class="rt"><span class="{tone}">{title}</span><span class="sub">{sub}</span>{b}</span><span class="rr">{right}</span></button>'
def quick(title, sub, right): return f'<div class="row quick"><span class="rt"><span><b>{title}</b></span><span class="sub">{sub}</span></span><span class="rr">{right}</span></div>'
def done_tag(): return '<span class="newtag donetag">Done</span>'
def used(name, pct): return f'<div class="cap"><span>{name}</span><b class="use"><s style="width:{pct}%"></s></b><span class="mono">{100 - pct:g}% free</span></div>'
def share(name, pct, label=None): return f'<div class="cap"><span>{name}</span><b class="use"><s style="width:{pct}%"></s></b><span class="mono">{label or f"{pct}%"}</span></div>'
def odds(name, before, after): return f'<div class="odds"><span>{name}</span><b><s class="before" style="width:{before}%"></s><s class="after" style="width:{after}%"></s></b><span class="mono">{before} → {after}</span></div>'
def odds_now(name, pct): return f'<div class="odds"><span>{name}</span><b><s class="after" style="width:{pct}%;height:100%;top:0"></s></b><span class="mono">{pct}</span></div>'
def part(kind, body): return f'<div class="part"><span class="mono pk">{kind}</span>{body}</div>'
def facts(rows): return '<dl class="facts wide ledger">' + ''.join(f'<dt>{k}</dt><dd>{v}</dd>' for k, v in rows) + '</dl>'
SEC = lambda s: f'<div class="sec">{s}</div>'

MIND_ICON = ('<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4">'
             '<circle cx="11" cy="11" r="3"></circle><circle cx="11" cy="11" r="7.5" stroke-dasharray="2 2.6"></circle></svg>')
def talk(phone, reply=None, chips=(), state=None):
    """The Mind floats over every screen. Just after it acts, its reply shows beside it. 'glow': it has something
    unasked, a tap hears it. 'open': something that matters, so it opens on its own."""
    if '<div class="ask">' in phone: return phone
    ch = ''.join(f'<button class="{"go" if i == 0 and len(chips) > 1 else ""}">{c}</button>' for i, c in enumerate(chips))
    label = 'THE MIND' + (' · UNASKED' if state == 'open' else '')
    toast = (f'<div class="mtoast{" unasked" if state == "open" else ""}"><span class="mono">{label}</span>{reply}' + (f'<span class="chips">{ch}</span>' if ch else '') + '</div>') if reply else ''
    fab = f'<button class="mfab{" glow" if state in ("glow", "open") else ""}" aria-label="Talk to the Mind">{MIND_ICON}</button>'
    dock = f'<div class="mfloat{" onrail" if "<nav class=\"rail\"" in phone else ""}">{toast}{fab}</div>'
    k = phone.rindex('</div>'); return phone[:k] + dock + phone[k:]
def chat(t, about, lines, view=None, strip='', pre=False):
    said = ''.join(f'<div class="say {who}">' + ('<span class="mono">THE MIND</span>' if who == 'mind' else '') + f'{s}</div>' for who, s in lines)
    if view: said += f'<div class="say you">What would you do?</div><div class="say mind"><span class="mono">ITS VIEW · FROM OUR CHARTER AND DIALS</span>{view}<span class="dials">{DIAL_WORDS}</span></div>'
    clockline = '' if pre else '<p class="clockline">The clock runs while you talk: 1 Year every <span class="rtime">00:05:00</span>.</p>'
    return tab(t, 'Mind', 'MIND', 'ASKING', f'<div class="pinned"><span class="mono">ABOUT</span><b>{about}</b></div>{clockline}<div class="chat">{said}</div>'
               '<div class="ask"><span>Ask the Mind…</span><button aria-label="Send">↑</button></div>', strip, pre, (1, 0, f'{SPARE_KT} kt') if pre else None)
def order(t, want, parts, warn='', strip=''):
    return tab(t, 'Mind', 'MIND', 'NEW ORDER', SEC('WHAT YOU WANT') + f'<div class="intent">{want}<i></i></div>' + SEC('THE MIND’S VERSION')
               + ''.join(part(k, v) for k, v in parts) + (f'<p class="warnline">{warn}</p>' if warn else '')
               + '<div class="twobtn"><button class="primary ghost">Edit</button><button class="primary">Set the order</button></div>', strip)
def confirm(t, kind, name, why, copy, sections, compute, matter_line, years, strip=''):
    width = min(100, years * 5 / 180 * 100)
    return (f'<div class="phone">{hud(t)}{strip}<div class="sheet"><div class="sh"><button class="backlink">‹ {kind}</button><span class="mono kind">{kind.upper()}</span></div>'
            f'<h3 class="lead">{name}</h3><p class="whyline">{why}</p><p class="copy">{copy}</p>{sections}'
            + SEC('USES EACH YEAR') + share('Compute', compute) + share('Energy', 1, 'under 1%')
            + SEC('USES ONCE, AT START') + f'<div class="pile">{matter_line}</div>'
            + SEC('TIME') + '<div class="timeline"><div class="track"><i style="left:0"></i><i style="left:33.3%"></i><i style="left:66.6%"></i><i style="left:100%"></i>'
            f'<span>now</span><span>01:00:00</span><span>02:00:00</span><span>03:00:00</span></div><div class="span" style="width:{width:.1f}%"><span>{years} Years</span></div></div>'
            f'</div></div>')
def lockscreen(clock_, notes):
    n = ''.join(f'<div class="note"><span class="mono">HOLOS · {t}</span><b>{h}</b><span>{b}</span></div>' for t, h, b in notes)
    return f'<div class="phone lock"><div class="lockclock"><span>Saturday</span><b>{clock_}</b></div>{n}</div>'

# ---------- The board: a strip of the map under the top bar ----------
SH = 195
def strip(inner, caption, y0=0):
    return (f'<div class="mapstrip"><svg width="390" height="{SH}" viewBox="0 {fmt(y0)} 390 {SH}" font-family="IBM Plex Mono, monospace" role="img" aria-label="{caption}">{inner}</svg>'
            f'<span class="mcap mono">{caption}</span><span class="mgrab" aria-hidden="true"></span></div>')

def camera(elevation, azimuth):
    el, az = math.radians(elevation), math.radians(azimuth)
    f = (-math.cos(el) * math.sin(az), -math.sin(el), -math.cos(el) * math.cos(az))
    right = (-f[2], 0, f[0]); n = math.hypot(*right); right = tuple(c / n for c in right)
    up = (right[1] * f[2] - right[2] * f[1], right[2] * f[0] - right[0] * f[2], right[0] * f[1] - right[1] * f[0])
    return right, up
def project(p, cam, k, origin):
    return (origin[0] + k * sum(a * b for a, b in zip(p, cam[0])), origin[1] - k * sum(a * b for a, b in zip(p, cam[1])))

class Labels:
    def __init__(self, taken=(), width=390): self.boxes, self.width = list(taken), width
    def place(self, x, y, s, size=10, fill=MUTED, weight=None, spots=((10, 4), (-10, 4), (0, -10), (0, 18)), sub=None):
        w = len(s) * size * .62; w2 = len(sub) * 5.2 if sub else 0
        for dx, dy in spots:
            anchor = 'start' if dx > 0 else 'end' if dx < 0 else 'middle'
            x0 = x + dx - (0 if anchor == 'start' else max(w, w2) if anchor == 'end' else max(w, w2) / 2)
            box = (x0, y + dy - size, max(w, w2), size + (11 if sub else 2))
            if box[0] < 2 or box[0] + box[2] > self.width - 2: continue
            if any(box[0] < b[0] + b[2] and b[0] < box[0] + box[2] and box[1] < b[1] + b[3] and b[1] < box[1] + box[3] for b in self.boxes): continue
            self.boxes.append(box)
            return text(x + dx, y + dy, s, size, fill, anchor, weight) + (text(x + dx, y + dy + 10, sub, 8.5, MUTED, anchor) if sub else '')
        return ''

# Earth's leads on the map: real stars, plus the seeded find.
NAMED = {'71683': 'Alpha Centauri', '32349': 'Sirius', '37279': 'Procyon', '8102': 'Tau Ceti', '16537': 'Epsilon Eridani', '87937': 'Barnard’s Star',
         '97649': 'Altair', '91262': 'Vega', '108870': 'Epsilon Indi', '104214': '61 Cygni'}
LEADS = {'eri': dict(name='82 Eridani', xyz=hip_xyz('15510'), d=19.7), 'fom': dict(name='Fomalhaut', xyz=hip_xyz('113368'), d=25.1),
         'luy': dict(name='Luyten’s Star', xyz=hip_xyz('36208'), d=LUY['ly']), 'find': dict(name=FIND['star'], xyz=FIND['xyz'], d=FIND['d'])}
MAP_R = 27            # a lead farther than this sits at the map's edge, marked as beyond the view
def sol_map(select=None, height=360):
    el = 58; cam, k, origin = camera(el, 205), 172 / MAP_R, (195, 196)
    s = [stipple(7, 60)]; labels = Labels([(8, 8, 110, 40)]); rings = []
    step = 10 if MAP_R < 36 else 20
    for ly in range(step, int(MAP_R) + 1, step):
        s.append(f'<ellipse cx="{origin[0]}" cy="{origin[1]}" rx="{ly * k:.1f}" ry="{ly * k * math.sin(math.radians(el)):.1f}" fill="none" stroke="{INK}" stroke-width=".7" stroke-dasharray="3 4" opacity=".4"></ellipse>')
        rings.append((origin[0] - ly * k + 4, origin[1] + 3, clock(ly)))
    for p in sorted([p for p in CENSUS if .05 < math.hypot(*p[:3]) <= MAP_R], key=lambda p: -p[2]):
        d = math.hypot(*p[:3]); m = p[3] - 5 * math.log10(max(.1, d / PC) / 10)
        if m > 11 and d > 12: continue                                   # far, dim red dwarfs would only crowd the map
        x, y = project(p[:3], cam, k, origin)
        r = 2.8 if m < 4.5 else 2.0 if m < 7 else 1.4 if m < 11 else 1.0
        s.append(f'<circle cx="{fmt(x)}" cy="{fmt(y)}" r="{r}" fill="{INK}" opacity="{.9 if m < 7 else .55}"></circle>')
    s.append(f'<circle cx="{origin[0]}" cy="{origin[1]}" r="4" fill="{YOU}"></circle><circle cx="{origin[0]}" cy="{origin[1]}" r="8" fill="none" stroke="{YOU}"></circle>')
    s.append(labels.place(origin[0], origin[1], 'Sol', 11, YOU, 600, ((0, 22), (12, 4), (-12, 4))))
    for key, L in LEADS.items():
        x, y = project(L['xyz'], cam, k, origin)
        dx, dy = x - origin[0], y - origin[1]
        far = L['d'] > MAP_R
        if far:                                                          # clamp to the edge of the view
            t = min(165 / max(abs(dx), 1e-6), (128 if dy > 0 else 140) / max(abs(dy), 1e-6), 1)
            x, y = origin[0] + dx * t, origin[1] + dy * t
        if key == select:
            s.append(f'<line x1="{origin[0]}" y1="{origin[1]}" x2="{fmt(x)}" y2="{fmt(y)}" stroke="{YOU}" stroke-width="1.5" stroke-dasharray="5 4"></line>')
            s.append(f'<circle cx="{fmt(x)}" cy="{fmt(y)}" r="13" fill="none" stroke="{INK}" stroke-width="1.6"></circle>')
        s.append(f'<circle cx="{fmt(x)}" cy="{fmt(y)}" r="7" fill="none" stroke="{OTHER}" stroke-width="1.5"></circle><circle cx="{fmt(x)}" cy="{fmt(y)}" r="2" fill="{OTHER}"></circle>')
        L['px'] = (x, y)
        s.append(labels.place(x, y, L['name'] + (' →' if far and dx > 0 else ''), 10, OTHER, 600, ((12, 4), (-12, 4), (0, -13), (0, 22), (12, -10), (-12, -10)),
                              sub=f'{L["d"]:.1f} ly · {clock(L["d"])}' + (' · beyond this view' if far else '')))
    for x, y, label in rings: s.append(labels.place(x, y, label, 9, MUTED, None, ((0, 0), (0, -8), (0, 10))))
    for hip, name in NAMED.items():
        p = hip_xyz(hip)
        if math.hypot(*p) > MAP_R: continue
        x, y = project(p, cam, k, origin); s.append(labels.place(x, y, name, 8.5))
    return ''.join(s), f'{step} ly', step * k
def stars_strip(select=None, caption=None):
    inner, _, _ = sol_map(select)
    cy = 196
    if select:
        ty = LEADS[select]['px'][1]; cy = min(max((196 + ty) / 2, SH / 2 + 30), 360 - SH / 2)
        caption = caption or f'STARS · {LEADS[select]["name"].upper()} · {LEADS[select]["d"]:.1f} LY · {clock(LEADS[select]["d"])}'
    return strip(inner, caption or f'STARS · WITHIN {MAP_R:.0f} LY OF SOL', cy - SH / 2)
def home(t, head, right, rows, select=None, pre=False, r=None):
    viz, label, px = sol_map(select)
    svg = (f'<svg width="390" height="360" viewBox="0 0 390 360" font-family="IBM Plex Mono, monospace" role="img" aria-label="Stars near Sol">{viz}'
           f'<line x1="16" y1="18" x2="{fmt(16 + px)}" y2="18" stroke="{INK}" stroke-width="1.2"></line><line x1="16" y1="14" x2="16" y2="22" stroke="{INK}"></line>'
           f'<line x1="{fmt(16 + px)}" y1="14" x2="{fmt(16 + px)}" y2="22" stroke="{INK}"></line>{text(16, 34, label, 9, INK)}</svg>')
    ladder = '<div class="ladder" role="group" aria-label="Zoom level">' + ''.join(f'<button aria-pressed="{str(n == "Stars").lower()}" class="rung{" on" if n == "Stars" else ""}">{n}</button>' for n in ('World', 'System', 'Stars', 'Region', 'Galaxy')) + '</div>'
    return (f'<div class="phone">{hud(t, r, pre)}<div class="viz">{svg}{ladder}</div><div class="panel"><div class="ph"><span>{head}</span><span class="mono">{right}</span></div>{"".join(rows)}</div>{rail("Home")}</div>')

def world_strip(items, caption=None):
    """Earth's limb, low orbit and the Moon, with what is built or building. items: (name, 'ground' | 'low' | 'moon', built 0..1)."""
    cx, cy, R, RO = 195, SH + 420, 470, 508
    on = lambda x, r: cy - math.sqrt(r * r - (x - cx) ** 2)
    s = [stipple(11, 30, 390, SH), f'<circle cx="{cx}" cy="{cy}" r="{R}" fill="{PAPER}" stroke="{INK}" stroke-width="1.3"></circle>',
         f'<circle cx="{cx}" cy="{cy}" r="{RO}" fill="none" stroke="{INK}" stroke-width=".7" stroke-dasharray="3 4" opacity=".5"></circle>',
         f'<circle cx="352" cy="44" r="15" fill="{PAPER}" stroke="{INK}" stroke-width="1.1"></circle>', text(330, 48, 'the Moon', 8.5, MUTED, 'end'),
         text(195, SH - 8, 'Earth', 10, YOU, 'middle', 600), text(14, on(14, RO) - 6, 'low orbit', 8.5, MUTED)]
    xs = {'ground': [70, 195, 320, 132, 258], 'low': [120, 250, 185], 'moon': [352]}; n = {k: 0 for k in xs}
    for name, where, built in items:
        x = xs[where][n[where] % len(xs[where])]; n[where] += 1
        y = 44 if where == 'moon' else on(x, R if where == 'ground' else RO)
        done = built >= 1; col = INK if done else YOU; dash = '' if done else ' stroke-dasharray="2 2"'
        if where == 'ground':
            s.append(f'<path d="M{fmt(x - 7)} {fmt(y + 1)} L{fmt(x)} {fmt(y - 11)} L{fmt(x + 7)} {fmt(y + 1)} Z" fill="{INK if done else PAPER}" stroke="{col}" stroke-width="1.1"{dash}></path>')
            ly, anchor, lx = y + 16 + (n[where] - 1) // 3 * 12, 'middle', x
        elif where == 'low':
            s.append(f'<rect x="{fmt(x - 6)}" y="{fmt(y - 6)}" width="12" height="12" fill="{PAPER}" stroke="{col}" stroke-width="1.1"{dash}></rect>')
            ly, anchor, lx = y - 12 - (n[where] - 1) % 2 * 12, 'middle', x
        else:
            s.append(f'<rect x="{x - 5}" y="{y - 5}" width="10" height="10" fill="{PAPER}" stroke="{col}" stroke-width="1.1"{dash}></rect>')
            ly, anchor, lx = y + 30, 'end', x + 14
        s.append(text(lx, ly, name + ('' if done else f' · {round(built * 100)}%'), 8.5, col, anchor, 600))
    return strip(''.join(s), caption or 'ORBIT · EARTH' + (f' · {sum(b < 1 for *_, b in items)} BUILDING' if items else ''))
b = lambda years, t, start=0: max(0.0, min(1.0, (t / 300 - start) / years))
def builds(t, extra=()):
    out = [('All-sky watch', 'ground', b(6, t)), ('Deep flash watch', 'ground', b(6, t))]
    out += [(name.replace('Ground d', 'D'), 'ground', b(1, t, s)) for name, s in DCS if s <= round(t / 300, 2) < s + 1.1]
    if t >= 120: out.append(('Infrared telescope', 'low', b(18, t, .4)))
    if t >= 480: out.append(('Deep vault', 'moon', b(10, t, 1.6)))
    return out + list(extra)
