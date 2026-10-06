"""Each lead is one real system, seen from each seat. build-zoom.py runs it and writes LEADS.md.

Earth's data fix part of each orbit: a tilt range, a separation, a brightness. The seeding picks the rest.
A seat sees its own projection: a tug toward and away shrinks with the sine of the tilt it sees, and an
image's separation with the seat's distance. Every claim a seat's screens make about a lead is tested
against every orbit Earth's data permit:
  robust  · it holds for all of them
  seeded  · it holds for the orbit the seeding picked, with every other claim on that system
  FAIL    · no permitted orbit makes it hold, or not together with the system's other claims
Invented worlds have no Earth data beyond what surveys rule out (no transit seen from Sol). The seeding
picks their poles too, as close to their giant's plane as their claims allow.
"""
import math

LY_PC = 3.261563777
IWA = 0.49            # arcsec · a JWST-class coronagraph's inner edge at 15.5 µm: 1 λ/D for 6.5 m
R_SUN_AU = 0.00465

def sub(a, b): return [x - y for x, y in zip(a, b)]
def dot(a, b): return sum(x * y for x, y in zip(a, b))
def cross(a, b): return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
def unit(v):
    n = math.sqrt(dot(v, v)); return [x / n for x in v]
def angle(a, b): return math.degrees(math.acos(max(-1, min(1, dot(unit(a), unit(b))))))
def basis(axis, toward):
    """Two unit vectors square to axis; the first leans toward `toward`."""
    e1 = unit(sub(toward, [dot(toward, axis) * x for x in axis])); return e1, cross(axis, e1)
def pole(axis, e1, e2, tilt, turn):
    t, f = math.radians(tilt), math.radians(turn)
    return [math.cos(t) * a + math.sin(t) * (math.cos(f) * b + math.sin(f) * c) for a, b, c in zip(axis, e1, e2)]

# ---------- The systems behind the leads ----------
# tilt: the range of angles between the orbit's pole and Sol's line that Earth's data allow.
# image: Earth's view of an imaged body, sep in arcsec, and whether that detection sat at the kit's edge.
SYSTEMS = [
    dict(key='dp-giant', hip='99240', star='Delta Pavonis', body='a cold giant, at least 37 Years round', a=11.1, tilt=(0, 40),
         earth='An astrometric pull with only a faint trend toward and away (2021 astrometry; Laliotis et al. 2023). Its orbit nearly faces Sol.',
         claims=[('sol', 'face', 'Earth · a pull across the sky, a faint tug'), ('kesh', 'face', 'Lodestar · heavier than it pulls'),
                 ('hael', 'side', 'Warden · seen from the side, its pull still building')]),
    dict(key='ei-giant', hip='108870', star='Epsilon Indi', body='Epsilon Indi Ab', a=28.4, tilt=(87, 108), image=dict(sep=4.1, edge=False),
         earth='JWST imaged it: 6.3 Jupiter masses, about 28 AU out, tilted about 99° to Sol’s line (Matthews et al. 2024). A clear detection.',
         claims=[('veyra', 'imaged', 'Ember · seen directly'), ('veyra', 'sway', 'Ember · a sway to weigh it against'),
                 ('hael', 'imaged', 'Ash · seen directly'), ('hael', 'sway', 'Ash · a sway to weigh it against')]),
    # Not a lead: Alpha Centauri A's candidate S1 sat 1.5″ out at the kit's edge, seen from Sol. From Veyra it is never more
    # than 0.37″ out, from Kesh 0.64″, inside the glare. Pair and Twofold were dropped for it (2026-10-06).
    dict(key='tc-worlds', hip='8102', star='Tau Ceti', body='four candidate worlds', tilt=(25, 45),
         earth='Four wobbles under 1 m/s (Feng et al. 2017), inside a dust belt tilted about 35° (MacGregor et al. 2016). Taken as one plane.',
         claims=[('kesh', 'similar', 'Chaff · wobbles too small to trust')]),
    dict(key='82eri-worlds', hip='15510', star='82 Eridani', body='three hot worlds', tilt=(20, 160),
         earth='Three worlds of a few Earth masses, found by their tug (Pepe et al. 2011). Tilt unknown.',
         claims=[('hael', 'similar', 'Brood · three hot worlds')]),
    dict(key='bh-cycle', hip='2021', star='Beta Hydri', body=None,
         earth='The drift tracks the star’s own spot cycle (2012 and 2023 studies). No body, so nothing changes with the view.',
         claims=[('veyra', 'none', 'Beacon · a slow drift'), ('kesh', 'none', 'Hollow · a slow drift')]),
]
# Invented worlds, where the data leaves room. r_star in solar radii.
WORLDS = [
    dict(key='veyra-world', hip='99240', star='Delta Pavonis', body='Veyra’s world', a=1.12, r_star=1.2, host='dp-giant',
         claims=[('hael', 'felt', 'A world at Warden'), ('kesh', 'felt', 'A world at Lodestar'), ('sol', 'no-transit', 'No transit seen from Sol')]),
    dict(key='kesh-world', hip='108870', star='Epsilon Indi', body='Kesh’s world', a=0.5, r_star=0.71, host='ei-giant',
         claims=[('veyra', 'felt', 'A world at Ember, and the pitch of its radio'), ('sol', 'no-transit', 'No transit seen from Sol')]),
    dict(key='hael-world', hip='2021', star='Beta Hydri', body='Hael’s world', a=1.85, r_star=1.8, host=None,
         claims=[('veyra', 'felt-late', 'Beacon’s world, given Years'), ('sol', 'no-transit', 'No transit seen from Sol')]),
]
SAYS = {'face': 'shows at most half its tug', 'side': 'shows nearly all its tug', 'sway': 'shows at least half the tug Earth sees',
        'similar': 'shows 0.7 to 1.5 times the tug Earth sees', 'imaged': 'clear of the glare, and bright enough',
        'glimpsed': 'out of the glare at times, hidden at others', 'none': 'nothing to project', 'felt': 'shows at least 80% of its tug',
        'felt-late': 'shows at least 40% of its tug', 'no-transit': 'never crosses its star'}

def view(kind, seat_dir, sol_dir, p, d_seat, d_sol, sys):
    """Margin of one claim at pole p: positive holds, negative fails."""
    s_seat, s_sol = math.sin(math.radians(angle(p, seat_dir))), math.sin(math.radians(angle(p, sol_dir)))
    if kind == 'none': return 1
    if kind == 'face': return .5 - s_seat
    if kind == 'side': return s_seat - .9
    if kind == 'felt': return s_seat - .8
    if kind == 'felt-late': return s_seat - .4
    if kind == 'sway': return s_seat / s_sol - .5
    if kind == 'similar': r = s_seat / s_sol; return min(r - .7, 1.5 - r)
    if kind == 'no-transit': return abs(math.cos(math.radians(angle(p, sol_dir)))) - 2 * sys['r_star'] * R_SUN_AU / sys['a']
    sep_max = sys['a'] / (d_seat / LY_PC); sep_min = sep_max * abs(math.cos(math.radians(angle(p, seat_dir))))
    im = sys['image']; bright = (d_sol / d_seat) ** 2      # flux scales with distance; contrast with the star doesn't
    floor = im['sep'] if im['edge'] else 1.5 * IWA          # an edge detection can't get any closer to its star
    if kind == 'imaged': return min(sep_max - floor, bright - .3)
    if kind == 'glimpsed': return min(sep_max - floor, IWA - sep_min, bright - .7)
    raise ValueError(kind)

def check(pos):
    """pos: hip or seat id → position in light-years, Sol at the origin. Returns the report as Markdown and the counts."""
    sol = [0, 0, 0]
    results, chosen, facts = [], {}, {}
    for sys in SYSTEMS + WORLDS:
        star = pos[sys['hip']]
        to = lambda who: sub(sol if who == 'sol' else pos[who], star)
        sol_dir = unit(to('sol')); d_sol = math.sqrt(dot(star, star))
        claims = sys['claims']; seats = [w for w, *_ in claims if w != 'sol']
        e1, e2 = basis(sol_dir, unit(to(seats[0])))
        if sys in SYSTEMS:
            if sys['body'] is None:
                results.append((sys, None, [(c, 'robust', None) for c in claims])); continue
            lo, hi = sys['tilt']
            grid = [(t, f) for t in [lo + (hi - lo) * k / 40 for k in range(41)] for f in range(0, 360, 3)]
        else:   # invented: anywhere on the sphere
            grid = [(t, f) for t in range(0, 181, 2) for f in range(0, 360, 3)]
        host = chosen.get(sys.get('host'))
        def margins(p): return [view(k, unit(to(w)), sol_dir, p, math.sqrt(dot(to(w), to(w))), d_sol, sys) for w, k, _ in claims]
        rows = [(t, f, pole(sol_dir, e1, e2, t, f)) for t, f in grid]
        scored = [(margins(p), t, f, p) for t, f, p in rows]
        def rank(s):
            m, t, f, p = s; ok = all(x > 0 for x in m)
            tilt_off = min(angle(p, host), 180 - angle(p, host)) if host else 0
            return (ok, -tilt_off if ok else min(m), min(m))
        best = max(scored, key=rank)
        chosen[sys['key']] = best[3]
        joint = all(x > 0 for x in best[0])
        out = []
        for i, c in enumerate(claims):
            always = all(s[0][i] > 0 for s in scored)
            status = 'robust' if always else 'seeded' if joint else 'FAIL'
            w, kind = c[0], c[1]; d = unit(to(w)); tilt = angle(best[3], d); d_w = math.sqrt(dot(to(w), to(w)))
            fact = dict(tilt=min(tilt, 180 - tilt), tug=math.sin(math.radians(tilt)))
            if kind in ('imaged', 'glimpsed'):
                fact.update(sep=sys['a'] / (d_w / LY_PC), bright=(d_sol / d_w) ** 2, sep_earth=sys['image']['sep'])
            facts[(sys['key'], w)] = fact
            out.append((c, status, fact))
        results.append((sys, (best[1], best[2], best[3], seats[0], host), out))
        if host: facts[(sys['key'], 'host')] = min(angle(best[3], host), 180 - angle(best[3], host))
    md, n = report(results, pos)
    return md, n, facts

def report(results, pos):
    names = {'veyra': 'Veyra', 'hael': 'Hael', 'kesh': 'Kesh', 'sol': 'Sol'}
    n = {'robust': 0, 'seeded': 0, 'FAIL': 0}
    lines, fails = [], []
    for sys, pick, out in results:
        star = pos[sys['hip']]; sol_dir = unit(sub([0, 0, 0], star))
        lines.append(f"### {sys['star']} · {sys['body'] or 'no body'}")
        lines.append(sys.get('earth') or f"Invented, where surveys leave room. {sys['a']} AU from its star.")
        if pick:
            t, f, p, ref, host = pick
            hostline = f" Tilted {min(angle(p, host), 180 - angle(p, host)):.0f}° from its giant’s plane." if host else ''
            lines.append(f"Seeded pole: {t:.0f}° from Sol’s line, turned {f}° from the side facing {names[ref]}.{hostline}")
        lines.append('')
        lines.append('| Seat | Claim | Off Sol’s line | What it sees | Needs | Status |')
        lines.append('| --- | --- | --- | --- | --- | --- |')
        for (who, kind, label), status, fact in out:
            n[status] += 1
            off = '0°' if who == 'sol' else f"{angle(sub(pos[who], star), sol_dir):.0f}°"
            seen = ('' if fact is None else f"{fact['sep']:.2f}″ from its star at most, {fact['bright']:.2f}× Earth’s brightness" if 'sep' in fact
                    else f"tilted {fact['tilt']:.0f}°, {fact['tug'] * 100:.0f}% of its tug")
            lines.append(f"| {names[who]} | {label} | {off} | {seen} | {SAYS[kind]} | {status} |")
            if status == 'FAIL':
                why = (f" Earth saw it {fact['sep_earth']}″ out, at the kit’s edge. From {names[who]} it is never more than {fact['sep']:.2f}″ out, at {fact['bright']:.2f}× the brightness."
                       if fact and 'sep' in fact else '')
                fails.append(f"- **{sys['star']} · {names[who]} · {label}.** Needs: {SAYS[kind]}. No orbit Earth allows does that.{why}")
        lines.append('')
    head = ['<!-- Generated by build-zoom.py from leads.py. Edit leads.py, not this file. -->', '',
            '# Holos · leads seen from each seat', '',
            'Each lead is one real system. Earth’s data fix part of its orbit; the seeding picks the rest. '
            'Every claim a seat makes about it is tested against every orbit Earth’s data permit. '
            'Robust: true for all of them. Seeded: true for the orbit the seeding picked. FAIL: true for none.', '',
            f"**{n['robust']} robust · {n['seeded']} seeded · {n['FAIL']} FAIL**", '']
    if fails: head += ['## Fails', ''] + fails + ['']
    return '\n'.join(head + ['## Systems', ''] + lines), n
