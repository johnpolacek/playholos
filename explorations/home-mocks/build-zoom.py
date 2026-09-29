"""All Holos home-screen mocks on one page. Writes index.html beside this file.

Star positions are real: HYG 4.1 (.cache/hygdata_v41.csv) for names and the
game-region census (data/neighborhood.bin) for every point. Veyra, its planets,
the game state, and the galaxy's arm structure are invented or illustrative.
"""
import csv, math, random, struct
from pathlib import Path
import catalog

here = Path(__file__).resolve().parent
root = here.parents[1]
PC = 3.261563777
PAPER, INK, MUTED, FAINT, YOU, OTHER = '#FBFAF7', '#171716', '#6B6860', '#CFCBC0', '#1F7A96', '#A8620F'
ROT = [(-.0548755604, -.8734370902, -.4838350155), (.4941094279, -.4448296300, .7469822445), (-.8676661490, -.1980763734, .4559837762)]

def atlas(row):
    d = float(row['dist']); ra = float(row['ra']) * math.pi / 12; dec = math.radians(float(row['dec']))
    eq = [d * math.cos(dec) * math.cos(ra), d * math.cos(dec) * math.sin(ra), d * math.sin(dec)]
    g = [sum(a * b for a, b in zip(r, eq)) * PC for r in ROT]
    return (g[0], g[2], -g[1])

hyg = list(csv.DictReader((root / '.cache/hygdata_v41.csv').open()))
by_hip = {r['hip']: r for r in hyg if r['hip']}
HOME = atlas(by_hip['99240'])  # Delta Pavonis
raw = (root / 'data/neighborhood.bin').read_bytes()
values = struct.unpack('<' + 'f' * (len(raw) // 4), raw)
CENSUS = [values[i:i + 5] for i in range(0, len(values), 5)]

def absolute_mag(p):
    d_pc = max(.1, math.hypot(*p[:3]) / PC)
    return p[3] - 5 * math.log10(d_pc / 10)

def camera(elevation, azimuth):
    el, az = math.radians(elevation), math.radians(azimuth)
    d = (math.cos(el) * math.sin(az), math.sin(el), math.cos(el) * math.cos(az))
    f = tuple(-c for c in d)
    right = (f[1] * 0 - f[2] * 1, f[2] * 0 - f[0] * 0, f[0] * 1 - f[1] * 0)
    n = math.hypot(*right); right = tuple(c / n for c in right)
    up = (right[1] * f[2] - right[2] * f[1], right[2] * f[0] - right[0] * f[2], right[0] * f[1] - right[1] * f[0])
    return right, up

def project(p, center, cam, scale, origin):
    v = [a - b for a, b in zip(p, center)]
    right, up = cam
    return (origin[0] + scale * sum(a * b for a, b in zip(v, right)), origin[1] - scale * sum(a * b for a, b in zip(v, up)))

def fmt(n): return f'{n:.1f}'
def text(x, y, s, size=10, fill=MUTED, anchor='start', weight=None):
    w = f' font-weight="{weight}"' if weight else ''
    return f'<text x="{fmt(x)}" y="{fmt(y)}" font-size="{size}" fill="{fill}" text-anchor="{anchor}"{w} stroke="{PAPER}" stroke-width="3" stroke-linejoin="round" paint-order="stroke">{s}</text>'

def hud_res(energy=55, compute=55, matter='1,240 kt'):
    """Energy and compute: share of this year's supply in use. Matter: the stockpile on hand."""
    return (f'<div class="res"><span>ENERGY<b><s style="width:{energy}%"></s></b></span><span>MATTER<em>{matter}</em></span>'
            f'<span>COMPUTE<b><s style="width:{compute}%"></s></b></span></div></div>')

def cost_short(p): return catalog.cost_chips(p)

# Time standard. Game time is words in the sans: "18 Years", "Year 12".
# Real time is a countdown in the mono: "01:30:00", "2d 04:10:00", past a year "24y 19d".
def clock(minutes):
    total = round(minutes * 60)
    days, rest = divmod(total, 86400)
    if days >= 365: return f'{int(days // 365.25)}y {int(days - (days // 365.25) * 365.25)}d'
    h, rest = divmod(rest, 3600); m, sec = divmod(rest, 60)
    return (f'{days}d ' if days else '') + f'{h:02d}:{m:02d}:{sec:02d}'
def light_clock(ly): return clock(ly * 5)
def tstack(years, real, live=False):
    return f'<span class="tstack"><span class="gy">{years}</span><span class="rtime{" live" if live else ""}">{real}</span></span>'

# Labels that must not collide: try each candidate spot, skip if all overlap.
class Labels:
    def __init__(self, blocked=()): self.boxes = list(blocked)
    def place(self, x, y, s, size=10, fill=MUTED, weight=None, spots=((8, 4), (-8, 4), (0, -9), (0, 16)), sub=None):
        # `sub` is a smaller muted line beneath, such as a star's real name. Above a point, both lines shift up.
        ss = max(8, size - 1.5)
        w, h, extra = max(len(s) * size * .62, len(sub or '') * ss * .62), size * 1.25, (ss + 2 if sub else 0)
        for dx, dy in spots:
            anchor = 'end' if dx < 0 else 'middle' if dx == 0 else 'start'
            left = x + dx - (w if anchor == 'end' else w / 2 if anchor == 'middle' else 0)
            base = y + dy - (extra if dy < 0 else 0)
            box = (left, base - h * .8, left + w, base + h * .2 + extra)
            if box[0] < 4 or box[2] > 386 or box[1] < 40 or box[3] > 356: continue
            if any(box[0] < b[2] and box[2] > b[0] and box[1] < b[3] and box[3] > b[1] for b in self.boxes): continue
            self.boxes.append(box)
            return text(x + dx, base, s, size, fill, anchor, weight) + (text(x + dx, base + extra, sub, ss, MUTED, anchor) if sub else '')
        return ''

# Gradient noise on the sphere, for an invented world's coastlines.
def noise3(seed):
    rng = random.Random(seed); perm = list(range(256)); rng.shuffle(perm); perm += perm
    grads = [(math.cos(a) * math.sqrt(1 - z * z), math.sin(a) * math.sqrt(1 - z * z), z) for a, z in ((rng.random() * 2 * math.pi, rng.random() * 2 - 1) for _ in range(256))]
    fade = lambda t: t * t * t * (t * (t * 6 - 15) + 10)
    def n(x, y, z):
        X, Y, Z = math.floor(x), math.floor(y), math.floor(z); x -= X; y -= Y; z -= Z
        u, v, w = fade(x), fade(y), fade(z); total = 0
        for i in (0, 1):
            for j in (0, 1):
                for k in (0, 1):
                    g = grads[perm[perm[perm[(X + i) & 255] + ((Y + j) & 255)] + ((Z + k) & 255)]]
                    d = g[0] * (x - i) + g[1] * (y - j) + g[2] * (z - k)
                    total += d * (u if i else 1 - u) * (v if j else 1 - v) * (w if k else 1 - w)
        return total
    return lambda x, y, z: sum(n(x * f, y * f, z * f) / f ** .9 for f in (1.6, 3.4, 7, 14))

def contours(field, n, x0, y0, step, level):
    # Marching squares over an n x n grid of values; None marks off-globe cells.
    segs = []
    for j in range(n - 1):
        for i in range(n - 1):
            c = [field[j][i], field[j][i + 1], field[j + 1][i + 1], field[j + 1][i]]
            if None in c: continue
            pts = []
            for (a, b), (pa, pb) in zip(((0, 1), (1, 2), (2, 3), (3, 0)), (((i, j), (i + 1, j)), ((i + 1, j), (i + 1, j + 1)), ((i + 1, j + 1), (i, j + 1)), ((i, j + 1), (i, j)))):
                if (c[a] > level) != (c[b] > level):
                    t = (level - c[a]) / (c[b] - c[a])
                    pts.append((x0 + (pa[0] + (pb[0] - pa[0]) * t) * step, y0 + (pa[1] + (pb[1] - pa[1]) * t) * step))
            for q in range(0, len(pts) - 1, 2):
                segs.append(f'M{fmt(pts[q][0])},{fmt(pts[q][1])}L{fmt(pts[q + 1][0])},{fmt(pts[q + 1][1])}')
    return ''.join(segs)
def stipple(seed, n=90, w=390, h=360):
    rng = random.Random(seed)
    return ''.join(f'<circle cx="{fmt(rng.random() * w)}" cy="{fmt(rng.random() * h)}" r="{fmt(.4 + rng.random() * .7)}" fill="{INK}" opacity="{fmt(.15 + rng.random() * .35)}"></circle>' for _ in range(n))
def ellipse_path(cx, cy, rx, ry, a0, a1, steps=64):
    pts = [(cx + rx * math.cos(math.radians(a0 + (a1 - a0) * i / steps)), cy + ry * math.sin(math.radians(a0 + (a1 - a0) * i / steps))) for i in range(steps + 1)]
    return 'M' + ' L'.join(f'{fmt(x)},{fmt(y)}' for x, y in pts)

# ---------- Projects on the map: real positions, every timer shown ----------
def map_chip(x, y, name, time, anchor='start', done=False):
    w = max(len(name) * 6.3, len(time) * 5.5) + 14
    left = x if anchor == 'start' else x - w if anchor == 'end' else x - w / 2
    color = INK if done else YOU
    return (f'<rect x="{fmt(left)}" y="{fmt(y - 13)}" width="{fmt(w)}" height="29" rx="5" fill="{PAPER}" stroke="{color}" stroke-width="1"></rect>'
            f'<text x="{fmt(left + 7)}" y="{fmt(y - 1)}" font-size="10" fill="{INK}" font-weight="600">{name}</text>'
            f'<text x="{fmt(left + 7)}" y="{fmt(y + 11)}" font-size="9" fill="{MUTED}">{time}</text>')

def receiver_glyph(x, y, built=1.0):
    out = []
    for i, (dx, dy) in enumerate(((-15, -10), (1, -10), (-15, 4), (1, 4))):
        ok = i < round(built * 4)
        stroke, dash = (INK, '') if ok else (YOU, ' stroke-dasharray="2 2"')
        X, Y = x + dx, y + dy
        out.append(f'<path d="M{fmt(X)} {fmt(Y)} q7 -5 14 0 v6 q-7 -5 -14 0 Z" fill="{PAPER}" stroke="{stroke}" stroke-width="1"{dash}></path>')
    if built >= 1:
        out.append(''.join(f'<path d="M{fmt(x - 8 - i * 5)} {fmt(y - 14 - i * 5)} q{8 + i * 5} {-8 - i * 5} {16 + i * 10} 0" fill="none" stroke="{INK}" stroke-width=".8" opacity="{.7 - i * .2}"></path>' for i in range(3)))
    return ''.join(out)

def truss_glyph(x, y, built=0.2):
    out, n = [], 8
    for i in range(n):
        ok = i < round(built * n)
        stroke, dash = (INK, '') if ok else (YOU, ' stroke-dasharray="2 2"')
        X = x - 24 + i * 6
        out.append(f'<path d="M{X} {y - 4} L{X + 6} {y - 4} M{X} {y + 4} L{X + 6} {y + 4} M{X} {y + (4 if i % 2 else -4)} L{X + 6} {y + (-4 if i % 2 else 4)}" stroke="{stroke}" stroke-width=".9" fill="none"{dash}></path>')
    return ''.join(out)

# ---------- 1 · World ----------
def world(receiver=0.37, done=False, times=('00:37:42', '00:41:45', '02:29:48'), empty=False):
    cx, cy, r = 195, 190, 128
    s = [stipple(1)]
    s.append(f'<path d="{ellipse_path(cx, cy + 8, 176, 36, 180, 360)}" fill="none" stroke="{INK}" stroke-width=".8" stroke-dasharray="3 4" opacity=".45"></path>')
    s.append(f'<clipPath id="globe"><circle cx="{cx}" cy="{cy}" r="{r}"></circle></clipPath>')
    s.append(f'<circle cx="{cx}" cy="{cy}" r="{r + 5}" fill="none" stroke="{INK}" stroke-width=".6" opacity=".25"></circle>')
    s.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{PAPER}"></circle>')
    g = [f'<g clip-path="url(#globe)">']
    for rx in (44, 88, 118):
        g.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{r}" fill="none" stroke="{INK}" stroke-width=".5" opacity=".18"></ellipse>')
    for dy in (-86, -44, 0, 44, 86):
        g.append(f'<ellipse cx="{cx}" cy="{cy + dy}" rx="{fmt(math.sqrt(r * r - dy * dy))}" ry="7" fill="none" stroke="{INK}" stroke-width=".5" opacity=".18"></ellipse>')
    field_fn, n = noise3(5), 150
    step = 2 * r / (n - 1); tilt = math.radians(18); spin = math.radians(40)
    field = []
    for j in range(n):
        row_ = []
        for i in range(n):
            x, y = (i * step - r) / r, (j * step - r) / r
            if x * x + y * y > .998: row_.append(None); continue
            z = math.sqrt(1 - x * x - y * y)
            y2, z2 = y * math.cos(tilt) - z * math.sin(tilt), y * math.sin(tilt) + z * math.cos(tilt)
            x3, z3 = x * math.cos(spin) + z2 * math.sin(spin), -x * math.sin(spin) + z2 * math.cos(spin)
            row_.append(field_fn(x3, y2, z3))
        field.append(row_)
    values = sorted(v for row_ in field for v in row_ if v is not None)
    sea, high = values[int(len(values) * .62)], values[int(len(values) * .9)]
    g.append(f'<path d="{contours(field, n, cx - r, cy - r, step, sea)}" fill="none" stroke="{INK}" stroke-width="1.15" stroke-linecap="round"></path>')
    g.append(f'<path d="{contours(field, n, cx - r, cy - r, step, high)}" fill="none" stroke="{INK}" stroke-width=".6" opacity=".55"></path>')
    for dy in (-r * .88, r * .9):
        g.append(f'<ellipse cx="{cx}" cy="{fmt(cy + dy)}" rx="{fmt(math.sqrt(r * r - dy * dy) * .8)}" ry="5" fill="none" stroke="{INK}" stroke-width=".7" stroke-dasharray="2 2" opacity=".5"></ellipse>')
    g.append(f'<path d="M{cx},{cy - r} A{r},{r} 0 0,1 {cx},{cy + r} A52,{r} 0 0,0 {cx},{cy - r} Z" transform="rotate(-24 {cx} {cy})" fill="url(#hatch)"></path>')
    g.append('</g>')
    s.extend(g)
    s.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{INK}" stroke-width="1.4"></circle>')
    s.append(f'<path d="{ellipse_path(cx, cy + 8, 176, 36, 0, 180)}" fill="none" stroke="{INK}" stroke-width=".9" opacity=".7"></path>')
    # The receiver, in orbit: a blueprint that fills in as it is built.
    if empty: return world_labels(s, cx, cy, r)
    rx, ry = cx + 176 * math.cos(math.radians(38)), cy + 8 + 36 * math.sin(math.radians(38))
    s.append(receiver_glyph(rx, ry, 1.0 if done else receiver))
    s.append(f'<line x1="{fmt(rx)}" y1="{fmt(ry + 12)}" x2="{fmt(rx)}" y2="264" stroke="{INK if done else YOU}" stroke-width=".8"></line>')
    s.append(map_chip(384, 278, 'Deep-field receiver', 'Done · listening' if done else times[0], 'end', done))
    # The survey runs from observatories on Veyra's day side.
    sx_, sy_ = cx - 96, cy + 28
    s.append(f'<circle cx="{sx_}" cy="{sy_}" r="3.5" fill="{PAPER}" stroke="{YOU}" stroke-width="1.3"></circle>')
    s.append(f'<line x1="{sx_ - 2}" y1="{sy_ + 4}" x2="60" y2="290" stroke="{YOU}" stroke-width=".8"></line>')
    s.append(map_chip(10, 303, 'Planet survey', times[1]))
    # The foundry is millions of kilometers away, at Veyra's L5 point: an edge marker.
    s.append(map_chip(384, 44, 'Orbital foundry · L5 →', times[2], 'end'))
    return world_labels(s, cx, cy, r)
def world_labels(s, cx, cy, r):
    s.append(text(16, 52, '↖ light from Delta Pavonis', 9, MUTED))
    s.append(text(cx - r + 6, cy - r + 6, 'Veyra', 13, YOU, 'start', 600))
    s.append(text(18, 346, 'pinch out: the star system', 10, MUTED))
    return ''.join(s), '5,000 km  [world size invented]', 92

# ---------- 2 · System ----------
def system():
    cx, cy, k, tilt = 195, 190, 56, .38
    s = [stipple(2)]
    s.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{1.84 * k:.1f}" ry="{1.84 * k * tilt:.1f}" fill="url(#hatchLight)"></ellipse>')
    s.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{1.05 * k:.1f}" ry="{1.05 * k * tilt:.1f}" fill="{PAPER}"></ellipse>')
    s.append(text(cx + 1.84 * k - 4, cy + 1.84 * k * tilt + 14, 'habitable zone', 9, MUTED, 'end'))
    rng = random.Random(7)
    for _ in range(420):
        a = rng.random() * 2 * math.pi; rr = (2.6 + rng.random() * .6) * k
        s.append(f'<circle cx="{fmt(cx + rr * math.cos(a))}" cy="{fmt(cy + rr * tilt * math.sin(a))}" r=".7" fill="{INK}" opacity=".55"></circle>')
    for au, color, width in ((.45, INK, .7), (1.12, YOU, 1.2)):
        s.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{au * k:.1f}" ry="{au * k * tilt:.1f}" fill="none" stroke="{color}" stroke-width="{width}" opacity=".8"></ellipse>')
    s.append(f'<circle cx="{cx}" cy="{cy}" r="8" fill="{PAPER}" stroke="{INK}" stroke-width="1.4"></circle>')
    for i in range(8):
        a = math.radians(i * 45)
        s.append(f'<line x1="{fmt(cx + 11 * math.cos(a))}" y1="{fmt(cy + 11 * math.sin(a))}" x2="{fmt(cx + 16 * math.cos(a))}" y2="{fmt(cy + 16 * math.sin(a))}" stroke="{INK}" stroke-width="1"></line>')
    s.append(text(cx, cy - 22, 'Delta Pavonis', 10, INK, 'middle'))
    ix, iy = cx + .45 * k * math.cos(math.radians(205)), cy + .45 * k * tilt * math.sin(math.radians(205))
    s.append(f'<circle cx="{fmt(ix)}" cy="{fmt(iy)}" r="3" fill="{PAPER}" stroke="{INK}" stroke-width="1.1"></circle>')
    vx, vy = cx + 1.12 * k * math.cos(math.radians(62)), cy + 1.12 * k * tilt * math.sin(math.radians(62))
    s.append(f'<circle cx="{fmt(vx)}" cy="{fmt(vy)}" r="5" fill="{YOU}"></circle><circle cx="{fmt(vx)}" cy="{fmt(vy)}" r="9" fill="none" stroke="{YOU}"></circle>')
    s.append(text(vx + 12, vy + 4, 'Veyra', 11, YOU, 'start', 600))
    # The foundry at L5, 60° ahead of Veyra in its orbit, and the two projects at Veyra itself.
    fx, fy = cx + 1.12 * k * math.cos(math.radians(2)), cy + 1.12 * k * tilt * math.sin(math.radians(2))
    s.append(truss_glyph(fx + 4, fy, 0.05))
    s.append(f'<line x1="{fmt(fx + 4)}" y1="{fmt(fy - 6)}" x2="{fmt(fx + 20)}" y2="{fmt(fy - 32)}" stroke="{YOU}" stroke-width=".8"></line>')
    s.append(map_chip(384, fy - 45, 'Orbital foundry · L5', '02:29:48', 'end'))
    s.append(f'<line x1="{fmt(vx)}" y1="{fmt(vy + 9)}" x2="{fmt(vx - 30)}" y2="{fmt(vy + 44)}" stroke="{YOU}" stroke-width=".8"></line>')
    s.append(map_chip(vx - 110, vy + 58, 'Deep-field receiver', '00:37:42'))
    s.append(map_chip(vx - 110, vy + 92, 'Planet survey', '00:41:45'))
    s.append(text(cx + 2.9 * k, cy - 2.9 * k * tilt - 8, 'belt', 9, MUTED, 'middle'))
    s.append(text(378, 300, '[ice world] 9 AU →', 10, MUTED, 'end'))
    s.append(text(378, 344, 'star real · planets invented', 9, MUTED, 'end'))
    return ''.join(s), '1 AU', k

# ---------- 3 · Neighbors (15 ly around home) ----------
# Star names. Stars bright in Veyra's night sky carry Veyra's own names, translated, with the real name beneath.
# Faint ones keep their catalog name: no one named what they could not see. Delta Pavonis keeps its real name.
STAR_NAMES = {'108870': ('Ember', 'Epsilon Indi'), '99461': ('Lantern', 'Gliese 783 A'), '2021': ('Beacon', 'Beta Hydri'),
              '105858': ('Frost', 'Gamma Pavonis'), '1599': ('Pearl', 'Zeta Tucanae'), '106440': (None, 'Gliese 832'), '105090': (None, 'Lacaille 8760')}
LEADS = ('108870', '99461')
def neighbors(time_demo=False, after_result=False, select=None, beam=None, probe=None, shell=None, front=None, trace=None):
    el = 58; cam, k, origin = camera(el, 205), 11, (195, 196)
    s = [stipple(3, 60)]; labels = Labels([(8, 8, 110, 40)])
    rings = []
    for ly, label in ((5, '00:25:00'), (10, '00:50:00'), (15, '01:15:00')):
        ry = ly * k * math.sin(math.radians(el))
        s.append(f'<ellipse cx="{origin[0]}" cy="{origin[1]}" rx="{ly * k}" ry="{ry:.1f}" fill="none" stroke="{INK}" stroke-width=".7" stroke-dasharray="3 4" opacity=".4"></ellipse>')
        rings.append((origin[0] - ly * k + 4, origin[1] + 3, label))
    stars = [p for p in CENSUS if 0.05 < math.dist(p[:3], HOME) <= 15]
    if shell:   # a sphere of light around home; seen from any angle, its outline is a circle
        r_ly, shell_label = shell
        s.append(f'<circle cx="{origin[0]}" cy="{origin[1]}" r="{fmt(r_ly * k)}" fill="{YOU}" fill-opacity=".06" stroke="{YOU}" stroke-width="1.4" stroke-dasharray="6 4"></circle>')
    if front:   # another world's broadcast: a ray to each named star, solid once its front has passed, dashed until then
        f_hip, f_ly = front
        fp = atlas(by_hip[f_hip]); fx, fy = project(fp, HOME, cam, k, origin)
        for hip in [h for h in STAR_NAMES if h != f_hip] + ['99240']:
            q = atlas(by_hip[hip]); qx, qy = project(q, HOME, cam, k, origin); reached = math.dist(q, fp) <= f_ly + .01
            s.append(f'<line x1="{fmt(fx)}" y1="{fmt(fy)}" x2="{fmt(qx)}" y2="{fmt(qy)}" stroke="{OTHER}" stroke-width="{1.3 if reached else .8}"' + ('' if reached else ' stroke-dasharray="3 4" opacity=".6"') + '></line>')
            if reached and hip != '99240': s.append(f'<circle cx="{fmt(qx)}" cy="{fmt(qy)}" r="3.2" fill="{OTHER}"></circle>')
    for p in sorted(stars, key=lambda p: -sum((a - b) * c for a, b, c in zip(p[:3], HOME, (0, 0, 1)))):
        x, y = project(p[:3], HOME, cam, k, origin)
        base = (p[0], HOME[1], p[2])
        bx, by = project(base, HOME, cam, k, origin)
        s.append(f'<line x1="{fmt(bx)}" y1="{fmt(by)}" x2="{fmt(x)}" y2="{fmt(y)}" stroke="{INK}" stroke-width=".6" opacity=".35"></line>')
        s.append(f'<circle cx="{fmt(bx)}" cy="{fmt(by)}" r=".9" fill="{INK}" opacity=".35"></circle>')
        m = absolute_mag(p); r = 3.2 if m < 4.5 else 2.4 if m < 7 else 1.7 if m < 11 else 1.2
        s.append(f'<circle cx="{fmt(x)}" cy="{fmt(y)}" r="{r}" fill="{INK}"></circle>' if r < 3 else f'<circle cx="{fmt(x)}" cy="{fmt(y)}" r="{r}" fill="{PAPER}" stroke="{INK}" stroke-width="1.2"></circle>')
    s.append(f'<circle cx="{origin[0]}" cy="{origin[1]}" r="4" fill="{YOU}"></circle><circle cx="{origin[0]}" cy="{origin[1]}" r="8" fill="none" stroke="{YOU}"></circle>')
    s.append(labels.place(origin[0], origin[1], 'Veyra', 11, YOU, 600, ((0, 22), (12, 4), (-12, 4))))
    for hip, (vname, real) in sorted(STAR_NAMES.items(), key=lambda item: not (item[0] in LEADS or (front and item[0] == front[0]))):
        p = atlas(by_hip[hip]); x, y = project(p, HOME, cam, k, origin)
        d = math.dist(p, HOME); lead = hip in LEADS or hip == beam or (front and hip == front[0])
        if hip == beam:
            # A laser aimed at Veyra: a line from the sender, ending in an arrowhead at home.
            ang = math.atan2(origin[1] - y, origin[0] - x); ex, ey = origin[0] - 11 * math.cos(ang), origin[1] - 11 * math.sin(ang)
            s.append(f'<line x1="{fmt(x)}" y1="{fmt(y)}" x2="{fmt(ex)}" y2="{fmt(ey)}" stroke="{OTHER}" stroke-width="1.5"></line>')
            s.append(f'<path d="M{fmt(ex)} {fmt(ey)} l{fmt(-7 * math.cos(ang - .4))} {fmt(-7 * math.sin(ang - .4))} M{fmt(ex)} {fmt(ey)} l{fmt(-7 * math.cos(ang + .4))} {fmt(-7 * math.sin(ang + .4))}" stroke="{OTHER}" stroke-width="1.5" fill="none"></path>')
        if hip == select:
            s.append(f'<circle cx="{fmt(x)}" cy="{fmt(y)}" r="13" fill="none" stroke="{INK}" stroke-width="1.6"></circle>')
        if lead and after_result and hip == '99461':
            # Investigated: the ring fills, and the label carries what is now known.
            s.append(f'<circle cx="{fmt(x)}" cy="{fmt(y)}" r="7" fill="{OTHER}" fill-opacity=".25" stroke="{OTHER}" stroke-width="1.5"></circle>')
            s.append(f'<circle cx="{fmt(x + 6)}" cy="{fmt(y - 6)}" r="3" fill="{OTHER}"></circle>')
            s.append(labels.place(x, y, 'Lantern · dims every 212 days', 10, OTHER, 600, ((11, 4), (-11, 4), (0, -12)), sub=real))
        elif lead:
            s.append(f'<circle cx="{fmt(x)}" cy="{fmt(y)}" r="7" fill="none" stroke="{OTHER}" stroke-width="1.5"></circle>')
            spots = ((16, 4), (-16, 4), (0, -17), (0, 25)) if hip == select else ((11, 4), (-11, 4), (0, -12), (0, 20))
            if hip == beam: spots = ((0, -17), (16, 4), (0, 25), (-16, 4)) if hip == select else ((0, -13), (12, 4), (0, 21), (-12, 4))
            if front and hip == front[0]: spots = ((11, 4), (-11, 4), (11, -8), (-11, -8), (0, -12), (0, 20), (14, 16))
            s.append(labels.place(x, y, vname, 10, OTHER, 600, spots, sub=real if front and hip == front[0] else f'{real} · ' + ('aimed at us' if hip == beam else light_clock(d))))
        else:
            s.append(labels.place(x, y, vname or real, 9, sub=real if vname else None))
    if probe:
        hip, frac, label = probe
        tx, ty = project(atlas(by_hip[hip]), HOME, cam, k, origin)
        px, py = origin[0] + (tx - origin[0]) * frac, origin[1] + (ty - origin[1]) * frac
        s.append(f'<line x1="{origin[0]}" y1="{origin[1]}" x2="{fmt(tx)}" y2="{fmt(ty)}" stroke="{YOU}" stroke-width="1.2" stroke-dasharray="4 3"></line>')
        s.append(f'<line x1="{origin[0]}" y1="{origin[1]}" x2="{fmt(px)}" y2="{fmt(py)}" stroke="{YOU}" stroke-width="2"></line><circle cx="{fmt(px)}" cy="{fmt(py)}" r="3.5" fill="{YOU}"></circle>')
        s.append(labels.place(px, py, label, 9, YOU, 600, ((8, 4), (-8, 4), (0, 16), (8, -8), (-8, -8), (0, -10), (10, 14), (-10, 14))))
    if trace:   # a visitor's path traced back from home, as a wedge the width of its uncertainty
        t_hip, t_deg, t_label = trace
        tx, ty = project(atlas(by_hip[t_hip]), HOME, cam, k, origin); a0 = math.atan2(ty - origin[1], tx - origin[0]); L = 260
        e = [(origin[0] + L * math.cos(a0 + sg * math.radians(t_deg)), origin[1] + L * math.sin(a0 + sg * math.radians(t_deg))) for sg in (-1, 1)]
        s.append(f'<path d="M{origin[0]} {origin[1]} L{fmt(e[0][0])} {fmt(e[0][1])} L{fmt(e[1][0])} {fmt(e[1][1])} Z" fill="{OTHER}" fill-opacity=".08" stroke="none"></path>')
        s.append(f'<line x1="{origin[0]}" y1="{origin[1]}" x2="{fmt(origin[0] + L * math.cos(a0))}" y2="{fmt(origin[1] + L * math.sin(a0))}" stroke="{OTHER}" stroke-width="1.2" stroke-dasharray="5 4"></line>')
        gx, gy = project(atlas(by_hip['99701']), HOME, cam, k, origin)
        s.append(f'<circle cx="{fmt(gx)}" cy="{fmt(gy)}" r="6" fill="none" stroke="{INK}" stroke-width=".9" stroke-dasharray="2 2"></circle>')
        lx_, ly_ = gx - 58, gy + 56   # crowded near Lantern: a leader down to open space
        s.append(f'<line x1="{fmt(gx - 4)}" y1="{fmt(gy + 5)}" x2="{fmt(lx_ + 6)}" y2="{fmt(ly_ - 10)}" stroke="{INK}" stroke-width=".6"></line>' + text(lx_, ly_, 'Gliese 784', 9, INK, 'middle'))
        s.append(labels.place(origin[0] + 150 * math.cos(a0), origin[1] + 150 * math.sin(a0), t_label, 9, OTHER, 600, ((10, -8), (-10, -8), (10, 14), (-10, 14))))
    if time_demo:
        ex_, ey_ = project(atlas(by_hip['108870']), HOME, cam, k, origin)
        s.append(f'<line x1="{origin[0]}" y1="{origin[1]}" x2="{fmt(ex_)}" y2="{fmt(ey_)}" stroke="{YOU}" stroke-width="1.6" stroke-dasharray="5 4"></line>')
        mx_, my_ = (origin[0] + ex_) / 2, (origin[1] + ey_) / 2
        s.append(labels.place(mx_, my_, 'message · 00:46:00', 10, YOU, 600, ((0, -10), (0, 18), (10, 4), (-10, 4))))
    if shell: s.append(labels.place(origin[0], origin[1] - shell[0] * k, shell[1], 10, YOU, 600, ((0, -6), (0, 14), (40, -6), (-40, -6))))
    for x, y, label in rings: s.append(labels.place(x, y, label, 9, MUTED, None, ((0, 0), (0, -8), (0, 10))))
    sol = project((0, 0, 0), HOME, cam, k, origin)
    dx, dy = sol[0] - origin[0], sol[1] - origin[1]; n = math.hypot(dx, dy)
    t = min((180 if dx > 0 else 180) / abs(dx or 1), (150 if dy > 0 else 150) / abs(dy or 1))
    ex, ey = origin[0] + dx * t, origin[1] + dy * t
    s.append(f'<line x1="{fmt(ex - dx / n * 18)}" y1="{fmt(ey - dy / n * 18)}" x2="{fmt(ex)}" y2="{fmt(ey)}" stroke="{OTHER}" stroke-width="1.4"></line>')
    s.append(labels.place(ex, ey, 'Twin · oxygen world', 10, OTHER, 600, ((-6, -8), (6, -8), (-6, 16), (6, 16), (0, -12), (0, 20)), sub=f'Sol · {light_clock(math.dist(HOME, (0, 0, 0)))}'))
    return ''.join(s), '5 ly', 5 * k

# ---------- 4 · Region (100 ly around Sol) ----------
def region():
    el = 26
    az = max(range(0, 360, 5), key=lambda a: abs(project(HOME, (0, 0, 0), camera(el, a), 1, (0, 0))[0]))
    cam, k, origin = camera(el, az), 1.62, (195, 196)
    s = []
    s.append(f'<ellipse cx="{origin[0]}" cy="{origin[1]}" rx="{100 * k:.1f}" ry="{100 * k * math.sin(math.radians(el)):.1f}" fill="none" stroke="{INK}" stroke-width=".6" stroke-dasharray="3 4" opacity=".35"></ellipse>')
    s.append(f'<ellipse cx="{origin[0]}" cy="{origin[1]}" rx="{50 * k:.1f}" ry="{50 * k * math.sin(math.radians(el)):.1f}" fill="none" stroke="{INK}" stroke-width=".6" stroke-dasharray="3 4" opacity=".35"></ellipse>')
    # About 80% of the census are dim red dwarfs, white dwarfs and brown dwarfs.
    # They stay, as specks; Sun-like and brighter stars carry the view.
    for p in sorted(CENSUS, key=lambda p: -absolute_mag(p)):
        x, y = project(p[:3], (0, 0, 0), cam, k, origin)
        m = absolute_mag(p); inner = math.hypot(*p[:3]) <= 50
        if m >= 8.5: r, o = .45, .16 if inner else .1
        elif m >= 5.5: r, o = .8, .5 if inner else .3
        else: r, o = 1.35 if m < 2.5 else 1.1, .95 if inner else .6
        s.append(f'<circle cx="{fmt(x)}" cy="{fmt(y)}" r="{r}" fill="{INK}" opacity="{o}"></circle>')
    s.append(f'<circle cx="{origin[0]}" cy="{origin[1]}" r="{100 * k:.1f}" fill="none" stroke="{INK}" stroke-width="1.3"></circle>')
    s.append(f'<circle cx="{origin[0]}" cy="{origin[1]}" r="{50 * k:.1f}" fill="none" stroke="{INK}" stroke-width="1" stroke-dasharray="4 4"></circle>')
    s.append(text(origin[0], origin[1] - 100 * k - 8, '100 ly · region edge', 10, INK, 'middle'))
    s.append(text(origin[0], origin[1] + 50 * k + 14, '50 ly · civilizations start inside', 9, INK, 'middle'))
    hx, hy = project(HOME, (0, 0, 0), cam, k, origin)
    s.append(f'<circle cx="{origin[0]}" cy="{origin[1]}" r="6" fill="{PAPER}" stroke="{OTHER}" stroke-width="1.6"></circle>')
    s.append(text(origin[0] + (10 if hx < origin[0] else -10), origin[1] + 2, 'Twin', 11, OTHER, 'start' if hx < origin[0] else 'end', 600))
    s.append(text(origin[0] + (10 if hx < origin[0] else -10), origin[1] + 13, 'Sol', 8.5, MUTED, 'start' if hx < origin[0] else 'end'))
    s.append(f'<circle cx="{fmt(hx)}" cy="{fmt(hy)}" r="3.5" fill="{YOU}"></circle><circle cx="{fmt(hx)}" cy="{fmt(hy)}" r="7" fill="none" stroke="{YOU}" stroke-width="1.2"></circle>')
    s.append(text(hx + (-11 if hx < origin[0] else 11), hy + 4, 'Veyra', 11, YOU, 'end' if hx < origin[0] else 'start', 600))
    return ''.join(s), '25 ly', 25 * k

# ---------- 5 · Galaxy ----------
def galaxy():
    cx, cy, k = 195, 178, 170 / 50000
    rng = random.Random(11); s = []
    gauss = lambda: math.sqrt(-2 * math.log(max(1e-9, rng.random()))) * math.cos(2 * math.pi * rng.random())
    for i in range(2600):
        arm = i % 4; rad = 6500 + (rng.random() ** .7) * 42000
        th = arm * math.pi / 2 + math.log(rad / 7000) / math.tan(math.radians(13)) + .6
        sc = gauss() * (700 + rad * .035)
        x = math.cos(th) * (rad + sc); y = math.sin(th) * (rad + sc)
        s.append(f'<circle cx="{fmt(cx + x * k)}" cy="{fmt(cy + y * k)}" r="{fmt(.5 + rng.random() * .6)}" fill="{INK}" opacity="{fmt(.25 + rng.random() * .4)}"></circle>')
    for i in range(700):
        x, y = gauss() * 4200, gauss() * 1500; a = math.radians(27)
        s.append(f'<circle cx="{fmt(cx + (x * math.cos(a) - y * math.sin(a)) * k)}" cy="{fmt(cy + (x * math.sin(a) + y * math.cos(a)) * k)}" r=".6" fill="{INK}" opacity=".45"></circle>')
    s.append(f'<circle cx="{cx}" cy="{cy}" r="3" fill="{PAPER}" stroke="{INK}" stroke-width="1.2"></circle>')
    s.append(text(cx + 8, cy - 8, 'Galactic center', 9, INK))
    sx, sy = cx, cy + 27000 * k
    s.append(f'<circle cx="{sx}" cy="{fmt(sy)}" r="5" fill="none" stroke="{YOU}" stroke-width="1.6"></circle>')
    s.append(f'<line x1="{sx}" y1="{fmt(sy + 6)}" x2="{sx}" y2="{fmt(sy + 22)}" stroke="{YOU}"></line>')
    s.append(text(sx, sy + 35, 'The region · Veyra and Twin', 10, YOU, 'middle', 600))
    s.append(text(sx, sy + 48, 'marker not to scale', 9, MUTED, 'middle'))
    s.append(text(378, 350, 'arm structure illustrative', 9, MUTED, 'end'))
    return ''.join(s), '10,000 ly', 10000 * k

# ---------- Easter egg · Local Group (from the galaxy view's icon) ----------
import json
GALAXIES = {g['id']: g for g in json.loads((root / 'data/galaxies.json').read_text())['galaxies']}
def sky(ra, dec, ly):
    ra, dec = math.radians(ra), math.radians(dec)
    eq = [math.cos(dec) * math.cos(ra), math.cos(dec) * math.sin(ra), math.sin(dec)]
    g = [sum(a * b for a, b in zip(r, eq)) * ly for r in ROT]
    return (g[0], g[2], -g[1])
def real_years(ly): return ly * 5 / 525960
MW_CENTER = sky(266.4168, -29.0078, 8277 * PC)
def galaxy_stars(kind, seed, n):
    """Face-on stipple in unit-radius coordinates: (x, y, dot radius, opacity, spheroidal)."""
    rng = random.Random(seed)
    g = lambda: math.sqrt(-2 * math.log(max(1e-9, rng.random()))) * math.cos(2 * math.pi * rng.random())
    expo = lambda scale, cap=1.05: min(cap, -scale * math.log(max(1e-9, rng.random() * rng.random())) * .6)
    pts = []
    def add(x, y, sph=False, bright=0):
        pts.append((x, y, .35 + rng.random() * (.55 + bright), .25 + rng.random() * (.45 + bright * .3), sph))
    def spiral(arms, pitch, r0, r1, scatter, count, phase=0, frag=False):
        for i in range(count):
            arm = i % arms; r = r0 + (r1 - r0) * rng.random() ** .8
            th = phase + arm * 2 * math.pi / arms + math.log(r / r0) / math.tan(math.radians(pitch))
            if frag and rng.random() < .45: th += rng.choice((-1, 1)) * (.3 + rng.random() * .5)
            sc = g() * (scatter + scatter * r)
            add(math.cos(th) * (r + sc), math.sin(th) * (r + sc), bright=.25)
    if kind == 'andromeda':
        for _ in range(int(n * .16)): add(g() * .07, g() * .07, True, .4)
        for _ in range(int(n * .38)):
            r, t = expo(.24), rng.random() * 2 * math.pi; add(r * math.cos(t), r * math.sin(t))
        spiral(2, 11, .16, .9, .016, int(n * .28), .4)
        for _ in range(int(n * .18)):
            r, t = .43 + g() * .018, rng.random() * 2 * math.pi; add(r * math.cos(t), r * math.sin(t), bright=.3)
    elif kind == 'triangulum':
        for _ in range(int(n * .04)): add(g() * .03, g() * .03, True, .4)
        for _ in range(int(n * .36)):
            r, t = expo(.3), rng.random() * 2 * math.pi; add(r * math.cos(t), r * math.sin(t))
        spiral(2, 24, .08, .95, .026, int(n * .6), 1.2, frag=True)
    elif kind == 'lmc':
        for _ in range(int(n * .42)):
            r, t = expo(.36), rng.random() * 2 * math.pi; add(r * math.cos(t) * 1.05, r * math.sin(t) * .9)
        a = math.radians(-18)
        for _ in range(int(n * .34)):
            x, y = g() * .27, g() * .065; add(-.12 + x * math.cos(a) - y * math.sin(a), .06 + x * math.sin(a) + y * math.cos(a), bright=.3)
        for i in range(int(n * .16)):
            t = rng.random(); th = math.radians(20 + 170 * t); r = .5 + .12 * t
            add(r * math.cos(th) + g() * .05, -r * math.sin(th) + g() * .05, bright=.2)
        for _ in range(int(n * .035)): add(.26 + g() * .05, -.22 + g() * .05, bright=.4)
    elif kind == 'milkyway':
        for _ in range(int(n * .2)):
            x, y = g() * .2, g() * .06; a = math.radians(27); add(x * math.cos(a) - y * math.sin(a), x * math.sin(a) + y * math.cos(a), True, .3)
        for _ in range(int(n * .3)):
            r, t = expo(.3), rng.random() * 2 * math.pi; add(r * math.cos(t), r * math.sin(t))
        spiral(2, 12, .22, 1, .03, int(n * .5), .5)
    elif kind in ('dwarf-elliptical', 'smc'):
        stretch = 1.8 if kind == 'smc' else 1.25
        for _ in range(n): add(g() * .35 * stretch, g() * .35, True)
    else:  # dwarf irregular: a few clumps
        centers = [(g() * .3, g() * .3) for _ in range(4)]
        for i in range(n):
            cx0, cy0 = centers[i % 4]; add(cx0 + g() * .22, cy0 + g() * .18)
    return pts

def draw_galaxy(pts, cx, cy, size, incl, pa, color=INK, dot=1.0, glow=0):
    ci, a = math.cos(math.radians(incl)), math.radians(pa)
    out = []
    if glow:
        out.append(f'<ellipse cx="{fmt(cx)}" cy="{fmt(cy)}" rx="{fmt(size * glow)}" ry="{fmt(size * glow * max(ci, .3))}" transform="rotate({pa} {fmt(cx)} {fmt(cy)})" fill="url(#core)"></ellipse>')
    for x, y, r, o, sph in pts:
        yy = y * (max(ci, .55) if sph else ci)
        X, Y = x * size, yy * size
        out.append(f'<circle cx="{fmt(cx + X * math.cos(a) - Y * math.sin(a))}" cy="{fmt(cy + X * math.sin(a) + Y * math.cos(a))}" r="{r * dot:.2f}" fill="{color}" opacity="{o:.2f}"></circle>')
    return ''.join(out)

def dust_lanes(cx, cy, size, incl, pa, radii, a0, a1):
    ci, a = math.cos(math.radians(incl)), math.radians(pa); out = []
    for rad in radii:
        pts = []
        for i in range(41):
            t = math.radians(a0 + (a1 - a0) * i / 40); X, Y = rad * size * math.cos(t), rad * size * math.sin(t) * ci
            pts.append(f'{fmt(cx + X * math.cos(a) - Y * math.sin(a))},{fmt(cy + X * math.sin(a) + Y * math.cos(a))}')
        out.append(f'<path d="M{" L".join(pts)}" fill="none" stroke="{PAPER}" stroke-width="{1.2 + size / 90:.1f}" opacity=".85" stroke-linecap="round"></path>')
    return ''.join(out)

def local_group():
    pos = {'mw': MW_CENTER, **{k: sky(g['ra'], g['dec'], g['kpc'] * 1000 * PC) for k, g in GALAXIES.items()}}
    center = tuple((a + b) / 2 for a, b in zip(pos['mw'], pos['m31']))
    cam = camera(40, 30)
    flat = {k: project(p, center, cam, 1, (0, 0)) for k, p in pos.items()}
    span = max(max(abs(x) for x, y in flat.values()) / 165, max(abs(y) for x, y in flat.values()) / 130)
    k, origin = 1 / span, (195, 188)
    at = {name: (origin[0] + x * k, origin[1] + y * k) for name, (x, y) in flat.items()}
    s = [stipple(6, 70)]
    mx, my = at['mw']
    for mly in (1, 2, 3):
        rx = mly * 1e6 * k
        s.append(f'<ellipse cx="{fmt(mx)}" cy="{fmt(my)}" rx="{fmt(rx)}" ry="{fmt(rx * math.sin(math.radians(40)))}" fill="none" stroke="{INK}" stroke-width=".6" stroke-dasharray="3 4" opacity=".35"></ellipse>')
    labels = Labels([(8, 8, 110, 40), (330, 6, 386, 46)])
    portraits = {'mw': ('milkyway', 520, 19, 58, -18, YOU), 'm31': ('andromeda', 760, 28, 77, 38, INK), 'm33': ('triangulum', 340, 12, 55, -20, INK),
                 'lmc': ('lmc', 160, 4.5, 30, 10, INK), 'smc': ('smc', 110, 3, 0, 40, INK), 'm32': ('dwarf-elliptical', 50, 1.8, 0, 0, INK),
                 'ngc205': ('dwarf-elliptical', 70, 2.6, 0, 60, INK), 'ic10': ('irregular', 60, 2.6, 0, 0, INK), 'ngc6822': ('irregular', 70, 3, 0, 20, INK),
                 'ic1613': ('irregular', 70, 3, 0, 0, INK), 'wlm': ('irregular', 60, 2.6, 0, 70, INK)}
    for name, (kind, count, size, incl, pa, color) in portraits.items():
        s.append(draw_galaxy(galaxy_stars(kind, sum(map(ord, name)), count), *at[name], size, incl, pa, color, .55, .4 if size > 10 else 0))
    # Labels keep clear of the galaxy symbols as well as of each other.
    for name, (w, h) in (('mw', (20, 12)), ('m31', (26, 18)), ('m33', (13, 9)), ('lmc', (5, 5)), ('smc', (4, 4))):
        x, y = at[name]; labels.boxes.append((x - w, y - h, x + w, y + h))
    s.append(labels.place(*at['mw'], 'Milky Way · you', 11, YOU, 600, ((0, 26), (24, 4), (-24, 4), (0, -18), (0, 38))))
    s.append(labels.place(*at['m31'], 'Andromeda', 11, INK, 600, ((0, -22), (30, 4), (-30, 4), (0, 30), (34, -14))))
    s.append(labels.place(*at['m33'], 'Triangulum', 10, INK, None, ((-16, 4), (0, -16), (16, 4), (0, 24), (-16, -12))))
    for name, label in (('lmc', 'LMC'), ('smc', 'SMC'), ('ic10', 'IC 10'), ('ngc6822', 'NGC 6822'), ('ic1613', 'IC 1613'), ('wlm', 'WLM')):
        s.append(labels.place(*at[name], label, 9))
    for mly in (1, 2, 3):
        s.append(labels.place(mx - mly * 1e6 * k + 4, my + 3, f'{mly} Mly · {light_clock(mly * 1e6)}', 9, MUTED, None, ((0, 0), (0, -8), (0, 10))))
    s.append(text(378, 350, 'galaxies drawn enlarged', 9, MUTED, 'end'))
    return ''.join(s), '500,000 ly', 5e5 * k

# ---------- Close-ups: tap a galaxy in the Local Group ----------
def closeup(kind, seed, n, size, incl, pa, diameter_ly, bar_ly, extras='', glow=.45):
    s = [stipple(seed, 50), draw_galaxy(galaxy_stars(kind, seed, n), 195, 182, size, incl, pa, INK, 1.1, glow), extras]
    s.append(text(378, 350, 'structure drawn from observations', 9, MUTED, 'end'))
    return ''.join(s), f'{bar_ly:,} ly', bar_ly * 2 * size / diameter_ly

def andromeda():
    extra = dust_lanes(195, 182, 170, 77, 38, (.52, .66, .8), 190, 350)
    extra += draw_galaxy(galaxy_stars('dwarf-elliptical', 32, 220), 195 - 8, 182 + 42, 9, 0, 0, INK, 1, .5)
    extra += draw_galaxy(galaxy_stars('dwarf-elliptical', 205, 260), 195 + 52, 182 - 60, 14, 0, -30, INK, 1, .5)
    extra += text(195 - 22, 182 + 58, 'M32', 9, MUTED, 'end') + text(195 + 72, 182 - 74, 'M110', 9)
    return closeup('andromeda', 31, 5200, 170, 77, 38, 152000, 20000, extra)
def triangulum():
    x, y = 195 + 140 * .55 * math.cos(math.radians(-40)), 182 + 140 * .55 * math.sin(math.radians(-40)) * math.cos(math.radians(55))
    extra = f'<circle cx="{fmt(x)}" cy="{fmt(y)}" r="7" fill="none" stroke="{INK}" stroke-width="1"></circle>' + text(x + 10, y - 8, 'NGC 604', 9)
    return closeup('triangulum', 33, 4200, 140, 55, -20, 61000, 10000, extra)
def lmc():
    x, y = 195 + .26 * 150, 182 - .22 * 150 * math.cos(math.radians(30))
    extra = f'<circle cx="{fmt(x)}" cy="{fmt(y)}" r="9" fill="none" stroke="{INK}" stroke-width="1"></circle>' + text(x + 12, y - 10, 'Tarantula Nebula', 9)
    extra += text(195 - 58, 182 + 44, 'off-center bar', 9)
    return closeup('lmc', 34, 4200, 150, 30, 0, 32200, 5000, extra)

LEVELS = ['World', 'System', 'Stars', 'Region', 'Galaxy']
TABS = ['Home', 'Report', 'Projects', 'Reach', 'Mind']
def rail(active):
    return '<nav class="rail" aria-label="Main">' + ''.join(f'<button class="on" aria-current="page">{t}</button>' if t == active else f'<button>{t}</button>' for t in TABS) + '</nav>'
LOCAL_ICON = f'<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3"><ellipse cx="6" cy="11" rx="4.5" ry="2" transform="rotate(-18 6 11)"></ellipse><ellipse cx="13" cy="5" rx="3.5" ry="1.6" transform="rotate(35 13 5)"></ellipse><circle cx="15" cy="13.5" r="1" fill="currentColor"></circle><circle cx="2.5" cy="4" r=".8" fill="currentColor"></circle></svg>'
def local_button(on):
    return f'<button class="egg{" on" if on else ""}" aria-pressed="{str(on).lower()}" aria-label="{"Back to the Milky Way" if on else "Zoom out to the Local Group"}" title="{"Back to the Milky Way" if on else "The Local Group"}">{LOCAL_ICON}</button>'
def ladder(active):
    items = ''.join(f'<button aria-pressed="{str(i == active).lower()}" class="rung{" on" if i == active else ""}">{name}</button>' for i, name in enumerate(LEVELS))
    return f'<div class="ladder" role="group" aria-label="Zoom level">{items}</div>'

def row(title, sub, right='', tone='', bar=None, marker=False):
    mk = f'<span class="mk {tone}"></span>' if marker else ''
    b = f'<span class="bar"><span style="width:{bar}%"></span></span>' if bar is not None else ''
    return f'<button class="row">{mk}<span class="rt"><span class="{tone}">{title}</span><span class="sub">{sub}</span>{b}</span><span class="rr">{right}</span></button>'

PANELS = [
    ('IN MOTION · 3', 'TIME LEFT', [row('Deep-field receiver', 'in orbit around Veyra', tstack('7.5 Years', '00:37:42', True), bar=37), row('Planet survey · 12 nearest stars', 'from Veyra’s observatories', tstack('8.4 Years', '00:41:45', True), bar=40), row('Orbital foundry', 'at L5 · just started', tstack('30 Years', '02:29:48', True), bar=1), row('Leads · 3', 'Twin, Ember, Lantern', '›', 'other')]),
    ('DELTA PAVONIS SYSTEM', 'INVENTED PLANETS', [row('Veyra · your world', '1.12 AU · habitable zone', '', 'you', marker=True), row('[Inner world]', '0.45 AU · unvisited', '›'), row('Belt · 2.6–3.2 AU', 'prospect: metals and ice', '›'), row('[Ice world]', '9 AU · beyond this view', '›')]),
    ('WITHIN 10 LY · 12 STARS', 'LIGHT-TIME', [row('New warm glow · Ember', 'dust, cold companions, or waste heat', light_clock(math.dist(atlas(by_hip['108870']), HOME)), 'other', marker=True), row('Uneven dimming · Lantern', 'dust, bodies in orbit, or structures', light_clock(math.dist(atlas(by_hip['99461']), HOME)), 'other', marker=True), row('Planet survey · 12 nearest', 'finds what orbits them', tstack('8.4 Years', '00:41:45', True), bar=40)]),
    ('THE REGION · 100 LY AROUND TWIN', 'WHERE V1 PLAYS', [row('1,212 stars inside 50 ly', 'where civilizations start', ''), row('Oxygen world · Twin', '19.9 ly · light takes ' + light_clock(math.dist(HOME, (0, 0, 0))), '›', 'other', marker=True), row('Technosignatures detected', 'none yet · receivers at baseline', '0')]),
    ('THE MILKY WAY', 'FOR SCALE', [row('The region', '27,000 ly from the galactic center', ''), row('Light across the region', '200 ly · light takes ' + light_clock(200), ''), row('Beyond 100 ly', 'visible, not reachable in v1', '')]),
    ('THE LOCAL GROUP', 'FOR PERSPECTIVE', [row('Andromeda', '2.5 million ly away', tstack('2.5 Million Years', light_clock(2.53e6))), row('Triangulum', '2.8 million ly away', tstack('2.8 Million Years', light_clock(2.80e6))), row('Large Magellanic Cloud', 'orbiting the Milky Way', tstack('162,000 Years', light_clock(1.617e5))), row('Nothing here is reachable', 'shown for perspective', '')]),
    ('ANDROMEDA · M31', '2.5 MLY · 24 YR', [row('A big spiral, tilted 77° to us', 'we see it nearly edge-on', ''), row('About 150,000 ly across', 'roughly 1.5× the Milky Way', ''), row('A ring of young stars', 'about 30,000 ly from its center', ''), row('Bright companions', 'M32 and M110', '')]),
    ('TRIANGULUM · M33', '2.8 MLY · 27 YR', [row('Loose, patchy spiral arms', 'almost no central bulge', ''), row('About 60,000 ly across', 'roughly 0.6× the Milky Way', ''), row('NGC 604', 'a star-forming cloud 1,500 ly wide', '')]),
    ('LARGE MAGELLANIC CLOUD', '162,000 LY · 1.5 YR', [row('Off-center bar, one main arm', 'a Magellanic spiral, likely disrupted', ''), row('About 32,000 ly across', 'orbiting the Milky Way', ''), row('Tarantula Nebula', 'the Local Group’s most active star nursery', '')]),
]

def frame(i, viz, scale_label, scale_px, rung=None, overlay='', panel=None, year=None, res=None):
    head, right, rows = panel or PANELS[i]
    rung = i if rung is None else rung
    svg = (f'<svg width="390" height="360" viewBox="0 0 390 360" font-family="IBM Plex Mono, monospace" role="img" aria-label="{LEVELS[i] if i < len(LEVELS) else 'Local Group'} view">'
           f'{viz}<line x1="16" y1="18" x2="{fmt(16 + scale_px)}" y2="18" stroke="{INK}" stroke-width="1.2"></line>'
           f'<line x1="16" y1="14" x2="16" y2="22" stroke="{INK}"></line><line x1="{fmt(16 + scale_px)}" y1="14" x2="{fmt(16 + scale_px)}" y2="22" stroke="{INK}"></line>'
           f'{text(16, 34, scale_label, 9, INK)}</svg>')
    aria = LEVELS[rung] if i < len(LEVELS) else PANELS[i][0].title()
    svg = svg.replace(f'aria-label="{LEVELS[i] if i < len(LEVELS) else "Local Group"} view"', f'aria-label="{aria} view"')
    return f'''<div class="phone">
<div class="hud"><div class="hud1"><span class="name"><i></i>Veyra</span><span class="gy">Year 0.4</span></div>
<div class="hud2"><span>Delta Pavonis · 19.9 ly from Sol</span><span>1 Year = <span class="rtime">00:05:00</span></span></div>
{hud_res(*(res or ()))}
<div class="viz">{svg}{overlay}{ladder(rung)}</div>
<div class="panel"><div class="ph"><span>{head}</span><span class="mono">{right}</span></div>{''.join(rows)}</div>
{rail('Home')}
</div>'''.replace('Year 0.4', year or 'Year 0.4')

CAPTIONS = [('1 · World', 'Veyra, with what is in motion around it.'), ('2 · System', 'Delta Pavonis and its invented planets, to scale inside the belt.'),
            ('3 · Stars', 'Real stars within 15 ly of home. Rings are light-time.'), ('4 · Region', 'All 9,494 objects within 100 ly of Sol. Dim red dwarfs are specks.'),
            ('5 · Galaxy', 'Where the region sits. The spiral is illustrative. Icon, top right: the Local Group.'),
            ('Extra · Local Group', 'From the galaxy view’s icon. Real positions. Tap a galaxy to look closer.'),
            ('Close-up · Andromeda', 'A big spiral like ours, but larger, seen nearly edge-on.'),
            ('Close-up · Triangulum', 'A smaller spiral with loose, patchy arms and no real bulge.'),
            ('Close-up · Large Magellanic Cloud', 'A dwarf with an off-center bar, orbiting the Milky Way.')]
views = [world(), system(), neighbors(), region(), galaxy(), local_group(), andromeda(), triangulum(), lmc()]
back = '<button class="back">‹ Local Group</button>'
# The Home sample: Year 50, just after the orbital foundry started. Its 6,000 kt emptied the matter pile.
SAMPLE = {'year': 'Year 50.0', 'res': (55, 55, '50 kt')}
extras = [dict(SAMPLE, **e) for e in [{}, {}, {}, {}, {'overlay': local_button(False)}, {'rung': 4, 'overlay': local_button(True)}] + [{'rung': 4, 'overlay': local_button(True) + back}] * 3]
joins = ['pinch out ›'] * 4 + ['tap icon ›', 'tap Andromeda ›', 'or ›', 'or ›']
def figure_row(indices):
    return ''.join((f'<span class="pinch">{joins[i - 1]}</span>' if i != indices[0] else '') +
                   f'<figure><figcaption><strong>{CAPTIONS[i][0]}</strong><span>{CAPTIONS[i][1]}</span></figcaption>{frame(i, *views[i], **extras[i])}</figure>' for i in indices)
figures, lg_figures = figure_row(range(5)), figure_row(range(5, 9))
def page(title, links, body, current=None):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&amp;family=IBM+Plex+Sans:wght@400;500;600&amp;display=swap">
<style>
:root{{--page:#DCD8CE;--page-ink2:#4A4843;--frame:#B9B4A8;--paper:#FBFAF7;--ink:#171716;--muted:#6B6860;--faint:#CFCBC0;--panel:#F1EFE8;--track:#E0DCD1;--fill2:#4A4843;--rowline:#DCD8CE;--you:#1F7A96;--other:#A8620F;--dot:#8F8B82;--shadow:rgba(0,0,0,.12);color-scheme:light}}
@media (prefers-color-scheme:dark){{:root:not([data-theme=light]){{--page:#0B0C0D;--page-ink2:#A9A59C;--frame:#2A2B2E;--paper:#121314;--ink:#E6E3DB;--muted:#9C988F;--faint:#34363A;--panel:#17181A;--track:#2A2B2E;--fill2:#BDB9AF;--rowline:#26282B;--you:#5BB8D6;--other:#E0A24A;--dot:#6E6A62;--shadow:rgba(0,0,0,.5);color-scheme:dark}}}}
:root[data-theme=dark]{{--page:#0B0C0D;--page-ink2:#A9A59C;--frame:#2A2B2E;--paper:#121314;--ink:#E6E3DB;--muted:#9C988F;--faint:#34363A;--panel:#17181A;--track:#2A2B2E;--fill2:#BDB9AF;--rowline:#26282B;--you:#5BB8D6;--other:#E0A24A;--dot:#6E6A62;--shadow:rgba(0,0,0,.5);color-scheme:dark}}
/* The drawings are written with light-theme hex values; these rules retint them. */
svg [fill="{INK}"]{{fill:var(--ink)}}svg [stop-color="{INK}"]{{stop-color:var(--ink)}}svg [stroke="{INK}"]{{stroke:var(--ink)}}
svg [fill="{PAPER}"]{{fill:var(--paper)}}svg [stroke="{PAPER}"]{{stroke:var(--paper)}}
svg [fill="{MUTED}"]{{fill:var(--muted)}}svg [stroke="{MUTED}"]{{stroke:var(--muted)}}
svg [fill="{YOU}"]{{fill:var(--you)}}svg [stroke="{YOU}"]{{stroke:var(--you)}}
svg [fill="{OTHER}"]{{fill:var(--other)}}svg [stroke="{OTHER}"]{{stroke:var(--other)}}
html{{scroll-behavior:smooth}}
@media (prefers-reduced-motion:reduce){{html{{scroll-behavior:auto}}}}
body{{margin:0;padding:0 24px 64px;background:var(--page);font-family:'IBM Plex Sans',sans-serif;color:var(--ink);text-wrap:pretty}}
h2,h3,figcaption strong{{text-wrap:balance}}
/* The low-fi sketches were drawn with their own hex values. */
svg [fill="#1D1D1B"]{{fill:var(--ink)}}svg [stroke="#1D1D1B"]{{stroke:var(--ink)}}svg [fill="#F3F1EA"]{{fill:var(--paper)}}svg [stroke="#F3F1EA"]{{stroke:var(--paper)}}
svg [fill="#CFCBC0"]{{fill:var(--faint)}}svg [stroke="#CFCBC0"]{{stroke:var(--faint)}}svg [fill="#8F8B82"]{{fill:var(--dot)}}svg [fill="#E0DCD1"]{{fill:var(--track)}}
nav.top{{position:sticky;top:0;z-index:20;display:flex;flex-direction:column;gap:6px;margin:0 -24px;padding:10px 24px 8px;background:var(--page);border-bottom:1px solid var(--frame)}}
.nav1{{display:flex;align-items:center;gap:24px}}
nav.top strong{{font-size:15px;white-space:nowrap}}nav.top strong a{{color:inherit;text-decoration:none}}
.pages{{display:flex;gap:2px;flex-grow:1;overflow-x:auto;scrollbar-width:none}}
.pages a{{padding:6px 10px;font-size:14px;font-weight:500;color:var(--page-ink2);text-decoration:none;white-space:nowrap}}
.pages a:hover{{color:var(--ink)}}.pages a[aria-current=page]{{color:var(--ink);box-shadow:inset 0 -2px 0 var(--ink)}}
.pages .minor{{font-size:12px;font-weight:400}}.pages .divider{{width:1px;margin:6px 8px;background:var(--frame);flex-shrink:0}}
.links{{display:flex;gap:4px;flex-grow:1;overflow-x:auto;scrollbar-width:none}}
.links a{{padding:8px 12px;border-radius:18px;font-size:13px;color:var(--page-ink2);text-decoration:none;white-space:nowrap}}
.links a:hover{{color:var(--ink)}}.links a[aria-current=true]{{background:var(--ink);color:var(--page)}}
section{{padding:32px 0 24px;scroll-margin-top:112px}}
section>h2{{font-size:22px;font-weight:600;margin:0 0 6px}}
section>p{{margin:0 0 28px;color:var(--page-ink2);font-size:14px;max-width:820px}}
section>main{{display:flex;flex-wrap:wrap;gap:18px;align-items:center}}
#home-layouts button{{text-align:center}}
.links .divider{{width:1px;margin:6px 8px;background:var(--frame)}}
.links .minor{{font-size:12px}}
.appendix{{margin-top:32px;border-top:1px solid var(--frame)}}
.appendix>h2{{font-size:17px;color:var(--page-ink2)}}
.appendix>h3{{font-size:15px;font-weight:600;margin:20px 0 4px}}
.appendix>p{{margin:0 0 20px;color:var(--page-ink2);font-size:13px;max-width:820px}}
.appendix>main{{display:flex;flex-wrap:wrap;gap:18px;align-items:flex-start;margin-bottom:24px}}
.theme{{flex-shrink:0;height:36px;padding:0 14px;border:1px solid var(--ink);border-radius:18px;font-size:13px;text-align:center}}
figure{{margin:0;display:flex;flex-direction:column;gap:12px;width:390px;align-self:flex-start}}
figcaption{{display:flex;flex-direction:column;gap:2px;font-size:13px;color:var(--page-ink2);min-height:40px}}
figcaption strong{{font-size:16px;color:var(--ink)}}
.pinch{{font:12px 'IBM Plex Mono',monospace;color:var(--page-ink2);writing-mode:vertical-rl;transform:rotate(180deg)}}
.phone{{width:390px;height:844px;border-radius:28px;overflow:hidden;box-shadow:0 0 0 1px var(--frame),0 12px 32px var(--shadow);background:var(--paper);display:flex;flex-direction:column}}
button{{font:inherit;color:inherit;cursor:pointer;background:none;border:0;padding:0;text-align:left}}
.mono{{font-family:'IBM Plex Mono',monospace}}
.you{{color:var(--you)}}.other{{color:var(--other)}}
.hud{{height:104px;box-sizing:border-box;padding:16px 16px 12px;display:flex;flex-direction:column;gap:6px;border-bottom:1px solid var(--faint)}}
.hud1{{display:flex;justify-content:space-between;align-items:baseline}}.hud1 .gy{{font-size:15px}}
.gy{{font-family:'IBM Plex Sans',sans-serif;font-weight:500}}.rtime{{font-family:'IBM Plex Mono',monospace;font-variant-numeric:tabular-nums}}
.tstack{{white-space:nowrap;display:inline-flex;flex-direction:column;align-items:flex-end;gap:1px;line-height:1.25;text-align:right}}.tstack .gy{{font-size:12px;font-weight:400;color:var(--muted)}}.tstack .rtime{{font-size:10.5px;color:var(--muted);opacity:.85}}.tstack .rtime.live{{color:var(--muted)}}
.name{{display:flex;align-items:center;gap:8px;font-size:20px;font-weight:600}}.name i{{width:10px;height:10px;border-radius:50%;background:var(--you)}}
.hud2{{display:flex;justify-content:space-between;font-size:12px;color:var(--muted)}}
.res{{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:4px}}
.res span{{display:flex;flex-direction:column;gap:3px;font-size:10px;color:var(--muted);letter-spacing:.08em}}
.res b{{height:4px;background:var(--track)}}.res s{{display:block;height:4px;background:var(--fill2);text-decoration:none}}.res em{{font:600 12px 'IBM Plex Mono',monospace;font-style:normal;color:var(--ink);line-height:1}}
.viz{{height:400px;position:relative;border-bottom:1px solid var(--faint)}}.viz svg{{display:block}}
.ladder{{position:absolute;left:12px;right:12px;bottom:10px;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));border:1px solid var(--ink);border-radius:6px;overflow:hidden;background:var(--paper)}}
.rung{{height:28px;text-align:center;font:11px 'IBM Plex Mono',monospace;color:var(--muted);border-left:1px solid var(--faint)}}.rung:first-child{{border-left:0}}
.rung.on{{background:var(--ink);color:var(--paper)}}
.egg{{position:absolute;top:10px;right:12px;width:36px;height:36px;border-radius:50%;border:1px solid var(--ink);background:var(--paper);color:var(--ink);display:grid;place-items:center}}
.egg.on{{background:var(--ink);color:var(--paper)}}
.back{{position:absolute;top:44px;left:12px;height:30px;padding:0 10px;border:1px solid var(--ink);border-radius:15px;background:var(--paper);font-size:12px}}
.panel{{flex-grow:1;padding:10px 16px 0;display:flex;flex-direction:column;background:var(--panel);overflow:hidden}}
.ph{{display:flex;justify-content:space-between;font-size:11px;letter-spacing:.08em;color:var(--muted);padding:4px 0 6px}}
.row{{display:flex;align-items:center;gap:10px;min-height:52px;border-bottom:1px solid var(--rowline);width:100%}}
.row .rt{{display:flex;flex-direction:column;gap:2px;flex-grow:1;font-size:14px}}.row .sub{{font-size:11px;color:var(--muted)}}
.row .rr{{font:12px 'IBM Plex Mono',monospace;color:var(--ink)}}
.mk{{width:9px;height:9px;border-radius:50%;border:1.5px solid currentColor;flex-shrink:0}}.mk.you{{color:var(--you)}}.mk.other{{color:var(--other)}}
.bar{{height:3px;background:var(--track);margin-top:3px}}.bar span{{display:block;height:3px;background:var(--you)}}
.rail{{height:64px;flex-shrink:0;border-top:1px solid var(--faint);display:grid;grid-template-columns:repeat(5,minmax(0,1fr));background:var(--paper)}}
.rail button{{text-align:center;font-size:11px;color:var(--muted)}}.rail .on{{font-weight:600;color:var(--ink);box-shadow:inset 0 2px 0 var(--ink)}}
</style>
<script>
// Follows the system theme until the viewer picks one, then remembers it.
try{{const t=localStorage.getItem('holos-mock-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;}}catch{{}}
</script>
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<radialGradient id="core"><stop offset="0" stop-color="{INK}" stop-opacity=".55"></stop><stop offset=".35" stop-color="{INK}" stop-opacity=".18"></stop><stop offset="1" stop-color="{INK}" stop-opacity="0"></stop></radialGradient>
<pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="4" stroke="{INK}" stroke-width=".8"></line></pattern>
<pattern id="hatchLight" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="{YOU}" stroke-width=".6" opacity=".45"></line></pattern>
</defs></svg>
<nav class="top" aria-label="Mocks"><div class="nav1"><strong><a href="index.html">Holos · mocks</a></strong><div class="pages">{nav_pages(current)}</div><button class="theme" id="theme" aria-pressed="false">Dark mode</button></div><div class="links" aria-label="On this page">{links}</div></nav>
{body}
<script>
const button=document.getElementById('theme'),query=matchMedia('(prefers-color-scheme: dark)');
const current=()=>document.documentElement.dataset.theme||(query.matches?'dark':'light');
const sync=()=>{{const dark=current()==='dark';button.textContent=dark?'Light mode':'Dark mode';button.setAttribute('aria-pressed',String(dark));}};
button.onclick=()=>{{const next=current()==='dark'?'light':'dark';document.documentElement.dataset.theme=next;try{{localStorage.setItem('holos-mock-theme',next);}}catch{{}}sync();}};
query.addEventListener('change',sync);sync();
// Highlight the section in view.
const links=[...document.querySelectorAll('.links a')];
const seen=new IntersectionObserver(entries=>{{for(const e of entries)if(e.isIntersecting)links.forEach(a=>a.setAttribute('aria-current',String(a.hash==='#'+e.target.id)));}},{{rootMargin:'-40% 0px -55% 0px'}});
document.querySelectorAll('section').forEach(section=>seen.observe(section));
</script>
</body>
</html>
'''


# ---------- The first-session tour: every tab, then the clues ----------
HUD_TOP = '''<div class="hud"><div class="hud1"><span class="name"><i></i>Veyra</span><span class="gy">Year 0.4</span></div>
<div class="hud2"><span>Delta Pavonis · 19.9 ly from Sol</span><span>1 Year = <span class="rtime">00:05:00</span></span></div>
'''
HUD_SAMPLE = HUD_TOP + hud_res()           # default for tab screens; each state passes its own
HUD = HUD_TOP + hud_res(0, 0)              # the Projects story before anything starts

def tab_screen(tab, head, right, body, hud=None):
    return f'<div class="phone">{hud or HUD_SAMPLE}<div class="tabpage"><div class="ph"><span>{head}</span><span class="mono">{right}</span></div>{body}</div>{rail(tab)}</div>'

def start_row(title, sub, cost, time):
    return f'<div class="row"><span class="rt"><span>{title}</span><span class="sub">{sub}</span><span class="sub mono">{cost}</span></span><span class="start">{time}<button>Start</button></span></div>'

REACH = tab_screen('Reach', 'REACH', 'BEYOND VEYRA', '''
    <div class="empty"><svg width="120" height="90" viewBox="0 0 120 90" aria-hidden="true"><circle cx="60" cy="45" r="6" fill="#1F7A96"></circle><circle cx="60" cy="45" r="30" fill="none" stroke="#171716" stroke-dasharray="3 4" opacity=".5"></circle><circle cx="60" cy="45" r="44" fill="none" stroke="#171716" stroke-dasharray="2 5" opacity=".3"></circle></svg>
    <strong>Nothing beyond Veyra yet</strong><span>Probes, outposts and colonies appear here. Far ones act on their own: your orders reach them at light speed.</span></div>
    <div class="sec">STANDING ORDERS · 0</div>''' + start_row('Add an order', 'e.g. if anything warm moves within 20 ly, send a sentinel', 'runs while you are away', '') )
def icon(body, label):
    return f'<svg width="56" height="56" viewBox="0 0 56 56" role="img" aria-label="{label}" fill="none" stroke="{INK}" stroke-width="1.1" stroke-linejoin="round">{body}</svg>'
ICONS = {
    'ir': icon('<path d="M6 40 L28 30 L50 40 L28 50 Z"></path><path d="M9 36 L28 27.5 L47 36"></path><path d="M12 32 L28 25 L44 32"></path>'
               '<path d="M28 6 l6 3.5 v7 l-6 3.5 l-6 -3.5 v-7 Z"></path><line x1="28" y1="20" x2="28" y2="25"></line><line x1="22" y1="16.5" x2="16" y2="30"></line><line x1="34" y1="16.5" x2="40" y2="30"></line>', 'Infrared telescope'),
    'receiver': icon(''.join(f'<path d="M{x} {y} q7 -5 14 0 v6 q-7 -5 -14 0 Z"></path><line x1="{x + 7}" y1="{y + 4}" x2="{x + 7}" y2="{y + 10}"></line>' for x, y in ((6, 12), (30, 12), (6, 32), (30, 32))), 'Deep-field receiver'),
    'survey': icon('<circle cx="28" cy="28" r="4"></circle><ellipse cx="28" cy="28" rx="13" ry="6"></ellipse><ellipse cx="28" cy="28" rx="22" ry="10" stroke-dasharray="2 2.5"></ellipse><circle cx="41" cy="28" r="1.8" fill="' + INK + '"></circle><circle cx="10" cy="31" r="1.4" fill="' + INK + '"></circle>', 'Planet survey'),
    'transit': icon('<circle cx="28" cy="20" r="11"></circle><circle cx="23" cy="20" r="2.5" fill="' + INK + '"></circle><path d="M6 44 H20 Q24 44 25 49 Q28 52 31 49 Q32 44 36 44 H50"></path>', 'Transit watch'),
    'spectro': icon('<path d="M10 40 L22 14 L34 40 Z"></path><line x1="2" y1="30" x2="16" y2="27"></line>'
                    + ''.join(f'<line x1="30" y1="{27 + i * 2}" x2="54" y2="{20 + i * 6}" stroke-dasharray="{2 if i % 2 else 0} 2"></line>' for i in range(4)), 'Spectrograph bank'),
    'flash': icon('<path d="M8 40 Q28 8 48 40 Z"></path><line x1="28" y1="40" x2="28" y2="48"></line><line x1="18" y1="48" x2="38" y2="48"></line>'
                  '<path d="M40 8 l-4 6 h5 l-4 6" stroke-width="1.3"></path>', 'Deep flash watch'),
    'mining': icon('<path d="M10 30 l8 -8 l10 3 l6 9 l-6 9 l-12 1 Z"></path><path d="M38 14 l5 -3 l5 4 l-2 6 l-6 1 Z"></path><line x1="30" y1="12" x2="44" y2="46" stroke-dasharray="2 2"></line>', 'Belt mining'),
    'sentinel': icon('<circle cx="28" cy="28" r="19" stroke-dasharray="3 2"></circle><rect x="25" y="25" width="6" height="6"></rect><line x1="28" y1="9" x2="28" y2="25"></line><line x1="28" y1="31" x2="28" y2="47"></line>', 'Sentinel probe'),
    'lurker': icon('<ellipse cx="28" cy="30" rx="24" ry="10" stroke-dasharray="2 3"></ellipse><circle cx="12" cy="30" r="3.5"></circle><rect x="44" y="18" width="5" height="5"></rect><path d="M49 20 l4 -3" stroke-dasharray="1 2"></path>', 'Lurker'),
    'chips': icon(''.join(f'<rect x="{x}" y="{y}" width="3.5" height="3.5"></rect><line x1="{x - 7}" y1="{y + 2}" x2="{x - 2}" y2="{y + 2}" stroke-dasharray="1 1.5"></line>' for x, y in ((20, 12), (34, 18), (26, 26), (42, 30), (22, 38), (36, 42))), 'Chip swarm'),
    'lightsail': icon('<path d="M14 10 L44 6 L48 36 L18 40 Z"></path><line x1="16" y1="25" x2="31" y2="48"></line><line x1="46" y1="21" x2="31" y2="48"></line><rect x="29" y="46" width="4" height="4"></rect>', 'Starlight sail'),
    'torch': icon('<path d="M28 6 C33 12 34 22 33 32 H23 C22 22 23 12 28 6 Z"></path><path d="M23 34 Q28 52 33 34" stroke-dasharray="2 2"></path><line x1="20" y1="30" x2="16" y2="38"></line><line x1="36" y1="30" x2="40" y2="38"></line>', 'Torch probe'),
    'seed': icon('<circle cx="28" cy="18" r="9" stroke-dasharray="3 2"></circle><rect x="24" y="30" width="8" height="8"></rect><path d="M28 38 V46 M28 46 L18 50 M28 46 L38 50"></path><rect x="14" y="48" width="5" height="5"></rect><rect x="37" y="48" width="5" height="5"></rect>', 'Seed probe'),
    'antimatter': icon('<path d="M28 6 C33 12 34 22 33 32 H23 C22 22 23 12 28 6 Z"></path>' + ''.join(f'<line x1="28" y1="36" x2="{28 + 14 * math.cos(math.radians(a))}" y2="{36 + 14 * math.sin(math.radians(a))}" stroke-dasharray="1.5 2"></line>' for a in (60, 90, 120)), 'Antimatter probe'),
    'skywatch': icon('<path d="M4 22 Q28 0 52 22" stroke-dasharray="2 3"></path><path d="M8 46 H48"></path><path d="M14 46 V36 A14 14 0 0 1 42 36 V46"></path><path d="M26 23 L30 23 L31 36 L25 36 Z"></path>', 'Sky watch'),
    'grid': icon('<path d="M28 8 L18 48 M28 8 L38 48 M21 36 H35 M23 26 H33 M14 16 H42"></path><path d="M2 20 Q8 26 14 16 M42 16 Q48 26 54 20"></path>', 'Planetary grid'),
    'lift': icon('<path d="M28 6 C34 14 35 26 34 38 H22 C21 26 22 14 28 6 Z"></path><path d="M22 30 L15 42 H22 M34 30 L41 42 H34"></path><line x1="25" y1="44" x2="24" y2="50"></line><line x1="31" y1="44" x2="32" y2="50"></line><circle cx="28" cy="20" r="3"></circle>', 'Mines and heavy lift'),
    'prospect': icon('<path d="M6 32 l7 -11 l12 1 l6 10 l-5 11 l-13 1 Z"></path><circle cx="18" cy="31" r="1.5" fill="' + INK + '"></circle><circle cx="41" cy="18" r="8"></circle><line x1="47" y1="24" x2="52" y2="30"></line>', 'Belt prospecting'),
    'annex': icon('<path d="M6 14 Q28 2 50 14"></path>' + ''.join(f'<rect x="{x}" y="20" width="10" height="26"></rect><line x1="{x}" y1="28" x2="{x + 10}" y2="28"></line><line x1="{x}" y1="36" x2="{x + 10}" y2="36"></line>' for x in (11, 23, 35)), 'Cold compute annex'),
    'foundry': icon('<line x1="6" y1="36" x2="50" y2="36"></line><line x1="6" y1="42" x2="50" y2="42"></line><path d="M6 42 L12 36 L18 42 L24 36 L30 42 L36 36 L42 42 L48 36"></path><rect x="10" y="16" width="14" height="14"></rect><rect x="30" y="20" width="12" height="10"></rect><line x1="17" y1="30" x2="17" y2="36"></line><line x1="36" y1="30" x2="36" y2="36"></line>', 'Orbital foundry'),
    'beam': icon('<path d="M12 18 Q22 28 12 38"></path><line x1="14" y1="28" x2="20" y2="28"></line><line x1="20" y1="27" x2="46" y2="25" stroke-dasharray="3 2"></line><line x1="20" y1="29" x2="46" y2="31" stroke-dasharray="3 2"></line><circle cx="49" cy="28" r="2.5"></circle>', 'Tight-beam transmitter'),
    'beacon': icon('<line x1="28" y1="46" x2="28" y2="24"></line><path d="M20 46 L28 32 L36 46"></path><circle cx="28" cy="22" r="2"></circle>' + ''.join(f'<circle cx="28" cy="22" r="{r}" stroke-dasharray="2 3" opacity="{o}"></circle>' for r, o in ((8, .9), (14, .6), (20, .35))), 'Broadcast beacon'),
    'launcher': icon('<line x1="8" y1="46" x2="48" y2="12"></line><line x1="13" y1="49" x2="52" y2="16"></line><rect x="6" y="24" width="10" height="14" rx="3"></rect><path d="M44 12 l6 -3 l-1 6 Z"></path>', 'Launcher'),
    'probe': icon('<circle cx="28" cy="20" r="13"></circle><line x1="28" y1="42" x2="17" y2="29"></line><line x1="28" y1="42" x2="39" y2="29"></line><line x1="28" y1="42" x2="28" y2="33"></line><rect x="25" y="42" width="6" height="6"></rect>', 'Flyby probe'),
    'solar': icon(''.join(f'<rect x="{x}" y="{y}" width="12" height="12"></rect>' for x in (6, 20, 34) for y in (14, 30)) + '<line x1="6" y1="28" x2="46" y2="28"></line>', 'Orbital solar array'),
    'woke': icon('<circle cx="30" cy="30" r="14"></circle><path d="M30 16 Q21 30 30 44"></path><circle cx="9" cy="10" r="2.5"></circle>'
                 '<path d="M14 15 L18 19 M9 17 V21 M16 10 H20" stroke-dasharray="1 2"></path>', 'Veyra'),
    # Answer Beacon? One glyph per option, all in the same neutral ink: Veyra left, Beacon right.
    'ans-bare': icon('<g stroke-width="1.7"><circle cx="9" cy="28" r="5.5"></circle><circle cx="49" cy="28" r="3.5"></circle><path d="M15 28 H21 l3 -9 l4 18 l3 -9 H44 M44 28 l-5 -4 M44 28 l-5 4"></path></g>', 'Bare knock'),
    'ans-charter': icon('<g stroke-width="1.7"><circle cx="9" cy="28" r="5.5"></circle><circle cx="49" cy="28" r="3.5"></circle><path d="M15 28 H18 M38 28 H44 M44 28 l-5 -4 M44 28 l-5 4"></path>'
                        '<rect x="18" y="19" width="20" height="18" rx="2"></rect><path d="M22 25 H34 M22 31 H30" stroke-width="1.2"></path></g>', 'Knock with our charter'),
    'ans-broadcast': icon('<g stroke-width="1.7"><circle cx="22" cy="28" r="5.5"></circle><circle cx="50" cy="28" r="3.5"></circle>' + ''.join(f'<circle cx="22" cy="28" r="{r}" stroke-dasharray="3 3"></circle>' for r in (12, 20)) + '</g>', 'Broadcast'),
    'ans-dark': icon('<g stroke-width="1.7"><circle cx="9" cy="28" r="5.5"></circle><circle cx="49" cy="28" r="3.5"></circle><path d="M44 28 H16" stroke-dasharray="3 3"></path><path d="M16 28 l5 -4 M16 28 l5 4"></path></g>', 'Stay dark'),
    'dust': icon('<circle cx="28" cy="28" r="3.5"></circle><ellipse cx="28" cy="28" rx="12" ry="5.5" stroke-dasharray="1 2"></ellipse>'
                 '<ellipse cx="28" cy="28" rx="23" ry="10.5" stroke-dasharray="1 2.5"></ellipse><circle cx="45" cy="25" r="1.8" fill="' + INK + '"></circle>', 'Dust map'),
    'companions': icon('<circle cx="16" cy="38" r="6"></circle><line x1="21" y1="34" x2="36" y2="22" stroke-dasharray="1 3"></line>'
                       '<circle cx="40" cy="17" r="2.2" fill="' + INK + '"></circle><circle cx="46" cy="21" r="1.7" fill="' + INK + '"></circle>'
                       '<path d="M33 13 V9 H37 M47 9 H51 V13 M51 25 V29 H47 M37 29 H33 V25"></path>', 'Companions resolved'),
    'heat': icon('<path d="M18 48 Q28 38 38 48 Z"></path>' + ''.join(f'<line x1="28" y1="43" x2="{x}" y2="{y}" stroke-dasharray="2 3" opacity=".7"></line><circle cx="{x}" cy="{y}" r="1.6" fill="{INK}"></circle>' for x, y in ((6, 20), (16, 10), (28, 7), (40, 10), (50, 20)))
                 + '<path d="M44 7 q2 -2 0 -4 M47 9 q2 -2 0 -4" stroke-width=".9"></path>', 'Waste-heat survey'),
    'pulsar': icon('<circle cx="28" cy="20" r="3.5"></circle><path d="M26.5 17 L17 3 Q21 1 26 2 L28 16.5 Z M29.5 23 L39 37 Q35 39 30 38 L28 23.5 Z"></path>'
                   '<path d="M4 50 H12 V44 V50 H22 V44 V50 H32 V44 V50 H42 V44 V50 H52"></path>', 'Pulsar timing array'),
}
def entry(year, key, body, fresh=False):
    return f'<div class="entry{" fresh" if fresh else ""}"><span class="gy">Year {year}</span><span class="kthumb">{ICONS[key]}</span><span>{body}</span></div>'
REPORT = tab_screen('Report', 'REPORT', 'WHILE YOU WERE AWAY', ''.join([
    entry('0.1', 'survey', 'Three leads logged: an oxygen world at Twin, a new warm glow at Ember, uneven dimming at Lantern. None explained.'),
    entry('0', 'woke', 'Veyra woke.'),
    '<p class="note">News lands when its light does. When a project finishes, its result appears here.</p>']), HUD)
MIND = tab_screen('Mind', 'MIND', 'WHO WE ARE', ''.join([
    '<div class="charter"><span class="mono">CHARTER</span><strong>“Keep the lights on. Look before we speak.”</strong><span class="sub">[founding line from the civilization you chose]</span></div>',
    '<div class="sec">CHARACTER</div>',
    '<div class="dial"><span>Open</span><b><s style="left:62%"></s></b><span>Hidden</span></div>',
    '<div class="dial"><span>Expand</span><b><s style="left:40%"></s></b><span>Deepen</span></div>',
    '<div class="dial"><span>Cautious</span><b><s style="left:30%"></s></b><span>Bold</span></div>',
    '<div class="sec">WHILE YOU ARE AWAY</div>',
    row('Keep running projects', 'the mind continues what you started', '›'),
    row('Never send messages', 'speaking is permanent; you decide that', '›')]), HUD)

FIRST_WORLD = ('IN MOTION · 0', 'TIME LEFT', [row('Nothing under way yet', 'start one in Projects', '›'), row('Leads · 3', 'Twin, Ember, Lantern', '›', 'other')])
FIRST_STARS = ('LEADS · 3', 'LIGHT-TIME', [
    row('New warm glow · Ember', 'dust, cold companions, or waste heat', light_clock(math.dist(atlas(by_hip['108870']), HOME)), 'other', marker=True),
    row('Uneven dimming · Lantern', 'dust, bodies in orbit, or structures', light_clock(math.dist(atlas(by_hip['99461']), HOME)), 'other', marker=True),
    row('Oxygen world · Twin', '19.9 ly · beyond this view', light_clock(math.dist(HOME, (0, 0, 0))), 'other', marker=True)])
def first(level):
    return frame(0, *world(empty=True), panel=FIRST_WORLD, res=(0, 0)) if level == 0 else frame(2, *neighbors(), panel=FIRST_STARS, res=(0, 0))

def tour(phone, step, total, title, body, spot, card_top, last=False, tab=None):
    x, y, w, h = spot
    ring = f'<div class="tabring" style="left:{4 + TABS.index(tab) * 76.4:.0f}px"></div>' if tab else ''
    overlay = (f'<div class="spot" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px"></div>{ring}'
               f'<div class="tour" style="top:{card_top}px"><span class="mono">TOUR · {step} OF {total}</span><h3>{title}</h3><p>{body}</p>'
               f'<div class="tb"><button>{"" if last else "Skip tour"}</button><button class="go">{"Begin" if last else "Next"}</button></div></div>')
    return phone[:phone.rindex('</div>')] + overlay + '</div>'

tour_css = '''<style>
.phone{position:relative}
.tabpage{flex-grow:1;padding:12px 16px 0;display:flex;flex-direction:column;background:var(--panel);overflow:hidden}
.sec{font-size:11px;letter-spacing:.08em;color:var(--muted);padding:14px 0 4px}
.start{display:flex;flex-direction:column;align-items:flex-end;gap:4px;font-size:12px}
.start button{height:28px;padding:0 12px;border:1px solid var(--ink);border-radius:14px;font-size:12px;text-align:center}
.empty{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;padding:24px 16px 12px;font-size:13px;color:var(--muted)}
.empty strong{font-size:16px;color:var(--ink)}
.entry{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--rowline);font-size:14px}.entry>.gy{font-size:12px;color:var(--muted);min-width:64px;padding-top:1px}.entry>.kthumb{flex:none}
.note{font-size:12px;color:var(--muted);margin:14px 0}
.charter{display:flex;flex-direction:column;gap:6px;padding:14px;border:1px solid var(--faint);border-radius:10px;background:var(--paper);margin-top:4px}
.charter .mono{font-size:10px;color:var(--muted);letter-spacing:.1em}.charter strong{font-size:17px;font-weight:500}
.dial{display:grid;grid-template-columns:70px 1fr 70px;align-items:center;gap:8px;font-size:12px;color:var(--muted);padding:6px 0}.dial span:last-child{text-align:right}
.dial b{position:relative;height:2px;background:var(--faint)}.dial s{position:absolute;top:-5px;width:12px;height:12px;border-radius:50%;background:var(--ink);transform:translateX(-50%)}
.spot{position:absolute;border-radius:14px;box-shadow:0 0 0 2px var(--you),0 0 0 3000px rgba(8,9,10,.58);pointer-events:none;z-index:4}
.art{margin:4px -16px 0;display:flex;justify-content:center;border-bottom:1px solid var(--faint);background:var(--paper)}
.lead{font-size:18px;font-weight:600;margin:14px 0 4px;text-wrap:balance}
.copy{font-size:13px;line-height:1.45;color:var(--page-ink2);margin:0}.copy.small{font-size:12px;color:var(--muted);margin-top:6px}
.cap{display:grid;grid-template-columns:70px 1fr 60px;align-items:center;gap:10px;font-size:13px;padding:5px 0}
.cap b{height:6px;border:1px dashed var(--muted);border-radius:3px}.cap .mono{font-size:11px;color:var(--muted);text-align:right}
.track{position:relative;height:34px;margin:6px 8px 0;border-top:1.5px solid var(--ink)}
.track i{position:absolute;top:-5px;width:1px;height:9px;background:var(--ink)}
.track span{position:absolute;top:10px;font:11px 'IBM Plex Mono',monospace;color:var(--muted);white-space:nowrap;transform:translateX(-50%)}
.track span:nth-of-type(1){left:0;transform:none}.track span:nth-of-type(2){left:33.3%}.track span:nth-of-type(3){left:66.6%}.track span:nth-of-type(4){left:100%;transform:translateX(-100%)}
.sheet{flex-grow:1;display:flex;flex-direction:column;padding:0 16px;background:var(--panel);overflow:hidden}.sheet>*,.tabpage>*{flex-shrink:0}
.sh{display:flex;justify-content:space-between;align-items:center;height:52px;border-bottom:1px solid var(--faint);margin:0 -16px 10px;padding:0 16px;background:var(--paper)}
.sh strong{font-size:17px}.sh button{font-size:22px;color:var(--muted)}.sh .backlink{font-size:14px;color:var(--ink)}.sh .kind{font-size:11px;letter-spacing:.1em;color:var(--muted)}
.seg{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border:1px solid var(--ink);border-radius:20px;overflow:hidden;margin-bottom:8px}
.seg button{height:36px;text-align:center;font-size:13px;color:var(--muted)}.seg .on{background:var(--ink);color:var(--paper)}
.pcard{display:grid;grid-template-columns:56px 1fr auto;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--rowline);width:100%}
.thumb{width:56px;height:56px;border:1px solid var(--faint);border-radius:10px;background:var(--paper);display:grid;place-items:center}
.pt{display:flex;flex-direction:column;gap:2px;font-size:14px}.pt b{font-weight:600}.costs{font-size:10.5px;color:var(--muted)}
.clue{align-self:flex-start;margin-top:3px;padding:1px 7px;border:1px solid var(--other);border-radius:9px;font-size:10.5px;color:var(--other)}
.pd{font-size:11.5px;text-align:right;line-height:1.5}
.legend{font-size:10px;color:var(--muted);margin:10px 0}
.helps{display:flex;gap:10px;align-items:flex-start;font-size:14px}.helps .sub{font-size:12px;color:var(--muted)}.helps>span:last-child{display:flex;flex-direction:column;gap:2px}.helps .mk{margin-top:5px}
.pile{display:flex;align-items:baseline;gap:10px;padding:4px 0;font-size:12px;color:var(--muted)}.pile b{font:600 15px 'IBM Plex Mono',monospace;color:var(--ink);white-space:nowrap}
.cap b.use{border-style:solid;border-color:var(--faint);overflow:hidden}.cap b.use s{display:block;height:100%;background:var(--you)}
.timeline{position:relative;margin:26px 8px 0}.timeline .track{margin:0}
.timeline .span{position:absolute;top:-8px;left:0;height:6px;background:var(--you);border-radius:3px}
.timeline .span span{position:absolute;left:100%;top:-16px;transform:translateX(-50%);font:10.5px 'IBM Plex Mono',monospace;color:var(--muted);white-space:nowrap}
.catalog{width:100%}.ccard .why{font-weight:600;font-size:13.5px;margin-top:8px}
.whyline{font-size:14.5px;font-weight:500;margin:0 0 4px;line-height:1.4}
.catalog .cp{font-size:17px;font-weight:600;margin:28px 0 4px}
.catalog h4{font:11px 'IBM Plex Mono',monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--page-ink2);margin:16px 0 8px}
.cgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:12px}
.ccard{background:var(--paper);border:1px solid var(--frame);border-top:3px solid var(--ink);border-radius:10px;padding:12px 14px;font-size:13px;line-height:1.45}
.ccard.know{border-top-color:var(--you)}.ccard.reach{border-top-color:var(--other)}.ccard.endure{border-top-color:var(--muted)}
.ccard header{display:flex;justify-content:space-between;gap:8px;align-items:baseline}.ccard header b{font-size:15px}.ccard header .ctime{font-size:11.5px;color:var(--muted);white-space:nowrap}.ccard header .ctime .gy{color:var(--ink)}
.ccard p{margin:6px 0 0}.ccard .basis{font-size:12px;color:var(--muted)}
.tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;align-items:center}.tags span{font-size:10.5px;padding:1px 7px;border-radius:9px;border:1px solid var(--faint)}
.tags .mono{border:0;color:var(--muted)}.lvl.speculative{border-color:var(--other);color:var(--other)}.lvl.plausible{border-color:var(--ink)}
.vis.loud{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.rel{font-size:12px}.rel b{font-weight:600;margin-right:4px}
.pcard.locked{opacity:.55}.needs{font-size:11px;color:var(--ink);margin-top:2px}
.runhead{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin:12px 0 6px}.runhead>span:first-child{display:flex;flex-direction:column}
.runhead .lead{margin:0}
.bar.big{display:block;height:4px;margin:0 0 10px}
.prow{display:grid;grid-template-columns:56px 1fr auto;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--rowline)}
.prow .pt{display:flex;flex-direction:column;gap:4px}.prow .clue{margin:0}.prow .bar{display:block}
.lanes{display:flex;flex-direction:column;gap:12px;margin:10px 8px 8px}
.lane{position:relative;height:14px}.lane .span{position:absolute;left:0;top:4px;height:6px;border-radius:3px;background:var(--you)}
.lane .lname{position:absolute;left:0;top:-10px;font-size:10.5px;color:var(--you);white-space:nowrap}
.lanes+.track{margin-top:4px}
.primary.ghost{background:none;color:var(--ink);border:1px solid var(--ink)}
.backlink.inline{align-self:flex-start;font-size:14px;margin:-2px 0 6px;color:var(--ink)}
.newtag{display:inline-block;align-self:flex-start;padding:1px 7px;border-radius:9px;background:var(--other);color:var(--paper);font-size:10.5px;font-weight:500}
.entry.fresh{background:var(--paper);margin:0 -16px;padding:12px 16px;border-left:3px solid var(--other)}
.entry b{font-weight:600}.seeresult{display:block;margin-top:8px;font-size:13px;font-weight:600;color:var(--other)}
.odds{display:grid;grid-template-columns:130px 1fr 92px;gap:8px;align-items:center;font-size:12.5px;padding:4px 0}
.odds b{position:relative;height:8px;background:var(--track);border-radius:4px;overflow:hidden}
.odds s{position:absolute;left:0;top:0;height:100%;border-radius:4px}.odds .before{background:var(--faint)}.odds .after{background:var(--other);height:4px;top:2px}
.odds .mono{font-size:11px;text-align:right;color:var(--muted)}
.dcard{display:flex;flex-direction:column;gap:4px;padding:12px;border:1px solid var(--other);border-radius:12px;background:var(--paper);font-size:14px}
.dcard b{font-weight:600}.dfoot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:6px}
.go-small{height:34px;padding:0 16px;border-radius:17px;background:var(--ink);color:var(--paper);text-align:center;font-size:13px}
.pcard.fresh{background:var(--paper);margin:0 -16px;padding:10px 16px;width:calc(100% + 32px);border-left:3px solid var(--other)}
.rside{display:flex;align-items:center;gap:10px}
.pause{width:32px;height:32px;border-radius:50%;border:1px solid var(--ink);display:grid;place-items:center;color:var(--ink);flex-shrink:0}
.pause.on{background:var(--ink);color:var(--paper)}
.paused-chip{align-self:flex-start;padding:1px 7px;border-radius:9px;background:var(--muted);color:var(--paper);font-size:10.5px}
.prow.is-paused .bar span{background:var(--muted)}.prow.is-paused .tstack .rtime{color:var(--muted)}
.gain{font-size:11.5px;font-weight:500;color:var(--you)}.warnline{font-size:11px;color:var(--other)}
.vischip{align-self:flex-start;margin-top:3px;padding:1px 7px;border:1px solid var(--ink);border-radius:9px;font-size:10.5px}.vischip.loud{background:var(--other);border-color:var(--other);color:var(--paper)}
.chain{display:flex;flex-direction:column}
.step{position:relative;display:grid;grid-template-columns:18px 1fr auto;gap:10px;align-items:center;padding:8px 0}
.step .dot{justify-self:center;width:10px;height:10px;border-radius:50%;border:1.5px solid var(--ink);background:var(--paper);z-index:1}
.step.ready .dot{background:var(--you);border-color:var(--you)}.step.wait .dot{border-style:dashed;border-color:var(--muted)}
.step:not(:last-child)::after{content:'';position:absolute;left:8.5px;top:50%;height:100%;border-left:1px dashed var(--muted)}
.step .pd{display:flex;align-items:center;gap:10px}.step .pt{font-size:14px}
.cap.stack b{position:relative;height:8px;background:none;border:0;overflow:visible}.cap.stack b::before{content:'';position:absolute;left:0;width:80%;top:0;bottom:0;background:var(--track);border-radius:4px}
.cap.stack s{position:absolute;top:0;height:100%}.cap.stack .u{background:var(--fill2);border-radius:4px 0 0 4px}.cap.stack .a{background:var(--you)}
.cap.stack .o{background:repeating-linear-gradient(45deg,var(--other) 0 3px,transparent 3px 6px);border:1px solid var(--other);box-sizing:border-box}
.cap.stack i{position:absolute;left:80%;top:-4px;bottom:-4px;border-left:1.5px solid var(--ink)}.cap.stack.over .mono{color:var(--other);font-weight:600}
.parts{margin:0 0 4px;font-size:10.5px;color:var(--muted);line-height:1.4}
.overhead{display:grid;grid-template-columns:56px 1fr;gap:12px;align-items:center;margin:6px 0 2px}.overhead .lead{margin:0 0 2px}.overhead .sub{font-size:13px;color:var(--page-ink2)}
.short{margin:10px 0 6px;padding:10px 12px;border-left:3px solid var(--other);background:var(--paper);font-size:13px;line-height:1.4}.short b{color:var(--other)}
.opt{display:grid;grid-template-columns:16px 1fr auto;gap:10px;align-items:center;padding:9px 12px;margin-top:6px;border:1px solid var(--faint);border-radius:10px;background:var(--paper);width:100%;box-sizing:border-box}
.opt.pick{border:1.5px solid var(--ink)}.opt .pt{font-size:14px}.opt .pd{font-size:11.5px;text-align:right}
.mindtag{align-self:flex-start;font:10px 'IBM Plex Mono',monospace;letter-spacing:.06em;color:var(--you);text-transform:uppercase}
.donehead{display:flex;flex-direction:column;gap:2px;margin:10px 0 2px}.donehead .lead{margin:2px 0 0}.donetag{background:var(--ink)}
.orow{display:grid;grid-template-columns:9px 1fr auto;gap:10px;align-items:center;padding:6px 0;border-bottom:1px solid var(--rowline)}.orow .pt{font-size:13.5px}.orow .sub,.qrow .sub,.prow .sub{font-size:11.5px;color:var(--muted)}.orow .pd{font-size:11px;text-align:right}
.qrow{display:grid;grid-template-columns:14px 40px 1fr auto 24px;gap:10px;align-items:center;padding:9px 0;border-bottom:1px solid var(--rowline)}
.qrow .qn{font-size:12px;color:var(--muted)}.qrow .pt{font-size:14px}.qrow .pd{font-size:11.5px;text-align:right}.grip{color:var(--muted);display:grid;place-items:center;height:28px}
.scrim{position:absolute;inset:0;z-index:4;background:rgba(8,9,10,.45)}
.csheet{position:absolute;left:0;right:0;bottom:0;z-index:5;display:flex;flex-direction:column;gap:6px;padding:6px 16px 18px;background:var(--paper);border-radius:16px 16px 0 0}
.csheet .lead{margin:4px 0 2px}.csheet .primary{margin:6px 0 0}
.lose{list-style:none;margin:2px 0;padding:0;display:flex;flex-direction:column;gap:8px;font-size:14px;line-height:1.35}
.lose li{position:relative;padding-left:16px}.lose li::before{content:'';position:absolute;left:0;top:7px;width:6px;height:6px;border-radius:50%;background:var(--other)}.lose b{font-weight:600}
.danger{height:44px;border:1px solid var(--other);border-radius:22px;color:var(--other);text-align:center;font-size:15px}
.facts.wide{grid-template-columns:96px 1fr;font-size:13px;margin:2px 0}
.twobtn{display:grid;grid-template-columns:1fr 1.4fr;gap:8px;margin-top:auto;padding-bottom:14px}.twobtn .primary{margin:0}
.primary[disabled]{opacity:.35;cursor:default}
.choices{display:flex;flex-direction:column;gap:6px;margin-top:4px}
.choice{display:grid;grid-template-columns:16px 1fr auto;gap:10px;align-items:center;padding:9px 12px;border:1px solid var(--faint);border-radius:10px;background:var(--paper);width:100%;box-sizing:border-box}
.choice .pt{font-size:14px}.choice .pd{font-size:11.5px;text-align:right}.choice.on{border:1.5px solid var(--ink)}.choice.drawn{grid-template-columns:16px 40px 1fr auto}
.radio{width:14px;height:14px;border-radius:50%;border:1.5px solid var(--ink);box-sizing:border-box}.choice.on .radio{border-width:4.5px}
.counsel{margin-top:10px;padding:10px 12px;border-left:3px solid var(--you);background:var(--paper)}.counsel .mono{font-size:10px;letter-spacing:.1em;color:var(--you)}.counsel p{margin:4px 0 0;font-size:13.5px;line-height:1.45}
.thread{display:grid;grid-template-columns:9px 1fr auto;gap:10px;align-items:start;padding:10px 0;border-bottom:1px solid var(--rowline)}.thread .mk{margin-top:5px}
.thread .pt{display:flex;flex-direction:column;gap:3px;font-size:15px}.thread .sub{font-size:11.5px;color:var(--muted)}.thread .bar{display:block}
.phone.cine{background:var(--paper);color:var(--ink)}
.cinetop{height:50px;flex-shrink:0;display:flex;justify-content:space-between;align-items:center;padding:0 18px;font-size:13px;color:var(--muted)}
.cinetop .mono{font-size:12px}
.cinetext{flex-grow:1;display:flex;flex-direction:column;gap:10px;padding:18px 22px 24px}
.cinetext h3{margin:0;font-size:32px;font-weight:600;letter-spacing:-.01em;color:var(--ink);text-wrap:balance}.cinetext p{margin:0;font-size:15.5px;line-height:1.5;color:var(--page-ink2)}
.cinebtn{display:grid;gap:10px;margin-top:auto}.cinebtn button{height:48px;border-radius:24px;text-align:center;font-size:15px;font-weight:500}
.cinebtn .light{background:var(--ink);color:var(--paper)}.cinebtn .ghostlight{border:1px solid var(--ink);color:var(--ink)}
.lock{background:var(--panel)}.locktime{display:flex;flex-direction:column;align-items:center;gap:2px;padding-top:70px;color:var(--ink)}
.locktime span{font-size:16px;color:var(--page-ink2)}.locktime strong{font-size:84px;font-weight:500;letter-spacing:-.02em;line-height:1}
.notif{margin:40px 12px 0;padding:12px 14px;border-radius:18px;background:var(--paper);border:1px solid var(--faint);display:flex;flex-direction:column;gap:3px;font-size:14px;color:var(--ink)}
.notif .app{display:flex;align-items:center;gap:6px;font:11px 'IBM Plex Mono',monospace;letter-spacing:.06em;color:var(--muted)}.notif .app i{width:14px;height:14px;border-radius:4px;background:var(--other)}
.notif .app span{margin-left:auto;letter-spacing:0}.notif b{font-weight:600}
.wake{flex-grow:1;display:flex;flex-direction:column;background:var(--paper)}.wake svg{display:block;margin-top:40px}
.waketext{flex-grow:1;display:flex;flex-direction:column;gap:10px;padding:8px 24px 24px}.waketext h3{margin:0;font-size:32px;font-weight:600;letter-spacing:-.01em}
.waketext p{margin:0;font-size:15.5px;line-height:1.5;color:var(--page-ink2)}.waketext p b{color:var(--ink);font-weight:600}.waketext .primary{margin:auto 0 0}
.kick{font-size:10.5px;letter-spacing:.1em;color:var(--muted)}
.onb{flex-grow:1;display:flex;flex-direction:column;padding:28px 16px 0;background:var(--panel)}.onb>*{flex-shrink:0}.onb .lead{margin:6px 0 4px;font-size:22px}
.onb .sec{padding-top:10px}.kit{display:grid;grid-template-columns:40px 1fr;gap:12px;align-items:center;padding:4px 0}
.kthumb{width:40px;height:40px;border:1px solid var(--faint);border-radius:9px;background:var(--paper);display:grid;place-items:center}.kthumb svg{width:34px;height:34px}
.kit .pt{font-size:13.5px}.kit .sub{font-size:11.5px;color:var(--muted);line-height:1.35}
.onb .short{margin-top:12px}.onb .primary{margin:auto 0 16px}
.thhead{display:grid;grid-template-columns:9px 1fr;gap:10px;align-items:start;margin:4px 0 8px}.thhead .mk{margin-top:6px}.thhead b{font-size:18px;display:block}.thhead .sub{font-size:12px;color:var(--muted)}
.msgs{display:flex;flex-direction:column;gap:8px;margin-bottom:10px}
.msg{display:flex;flex-direction:column;gap:3px;max-width:82%;padding:10px 12px;border-radius:12px;background:var(--paper);font-size:14px;border:1px solid var(--faint)}
.msg.them{align-self:flex-start;border-left:3px solid var(--other)}.msg.us{align-self:flex-end;border-right:3px solid var(--you)}
.msg .sub{font-size:12.5px;color:var(--page-ink2);line-height:1.4}.msg .stamp{font-size:10px;color:var(--muted)}.msg .seeresult{margin-top:4px}
.voice{margin:8px 0 2px;padding:10px 12px;border-left:3px solid var(--other);background:var(--paper)}.voice.ours{border-left-color:var(--you)}
.voice .mono{font-size:10px;letter-spacing:.1em;color:var(--muted)}.voice p{margin:4px 0 0;font-size:14px;line-height:1.45;font-style:italic}
.part{display:flex;flex-direction:column;gap:4px;padding:9px 12px;margin-top:6px;border:1px solid var(--faint);border-radius:10px;background:var(--paper);font-size:13.5px}
.part .pk{font-size:10px;letter-spacing:.1em;color:var(--muted)}.part b{font-weight:600}.part .sub{font-size:11.5px;color:var(--muted)}.part svg{display:block}
.iftrue{font-size:10.5px;color:var(--other)}.chip{align-self:flex-start;height:28px;padding:0 12px;border:1px solid var(--ink);border-radius:14px;font-size:12px;text-align:center}
.intent{position:relative;padding:10px 12px;border:1.5px solid var(--ink);border-radius:10px;background:var(--paper);font-size:14px;line-height:1.45}
.intent i{display:inline-block;width:1.5px;height:16px;margin-left:2px;background:var(--ink);vertical-align:-3px}
.left{list-style:none;margin:8px 0 0;padding:0;display:flex;flex-direction:column;gap:4px;font-size:12px;color:var(--page-ink2)}.left b{color:var(--ink);font-weight:600}
.talk{flex-shrink:0;align-self:stretch;height:40px;margin-top:8px;border:1px dashed var(--you);border-radius:20px;color:var(--you);text-align:center;font-size:13.5px}
.twobtn.even{grid-template-columns:1fr 1fr;margin-top:6px;padding-bottom:0}.twobtn.even .danger{height:46px}
.pinned{display:flex;flex-direction:column;gap:6px;margin-top:4px;padding:10px 12px;border:1.5px solid var(--ink);border-radius:12px;background:var(--paper)}
.pinned .mono{font-size:10px;letter-spacing:.1em;color:var(--muted)}.pinned b{font-size:16px}.pinned .primary{height:36px;margin:2px 0 0;font-size:14px}
.minis{display:grid;grid-template-columns:1fr 1fr;gap:6px}.mini{display:flex;align-items:center;gap:7px;height:32px;padding:0 9px;border:1px solid var(--faint);border-radius:8px;font-size:12.5px}.mini .radio{width:12px;height:12px}
.clockline{margin:8px 0 4px;font-size:11px;color:var(--muted)}
.chat{display:flex;flex-direction:column;gap:8px}
.say{max-width:86%;padding:9px 12px;border-radius:12px;font-size:13.5px;line-height:1.45}.say.you{align-self:flex-end;background:var(--ink);color:var(--paper)}
.say.mind{align-self:flex-start;display:flex;flex-direction:column;gap:3px;background:var(--paper);border:1px solid var(--faint);border-left:3px solid var(--you)}
.say .mono{font-size:9.5px;letter-spacing:.1em;color:var(--you)}.dials{font:10.5px 'IBM Plex Mono',monospace;color:var(--muted)}
.ask{flex-shrink:0;display:flex;align-items:center;justify-content:space-between;height:44px;margin:auto 0 12px;padding:0 6px 0 14px;border:1px solid var(--ink);border-radius:22px;background:var(--paper);font-size:14px;color:var(--muted)}
.ask button{width:32px;height:32px;border-radius:50%;background:var(--ink);color:var(--paper);text-align:center}
.oddswide .odds{grid-template-columns:186px 1fr 26px;padding:3px 0}
.cinetext .kick{color:var(--other)}.inscr{font-size:17px!important;line-height:1.5;color:var(--ink)!important;font-style:italic}
.speech{display:flex;flex-direction:column;gap:8px;margin:6px 0 4px;padding:14px;border-radius:14px;background:var(--paper);border:1px solid var(--faint);border-top:3px solid var(--other)}
.speaker{display:flex;align-items:center;gap:10px}.speaker>span{display:flex;flex-direction:column;gap:1px}.speaker b{font-size:16px}.speaker .mono{font-size:9.5px;letter-spacing:.08em;color:var(--muted)}
.speech .big{margin:0;font-size:19px;line-height:1.45;font-style:italic}.untr{margin:0;font-size:12px;color:var(--muted);line-height:1.4}
.inscribed{font-size:16px;font-style:italic;font-weight:500!important}
.gulfart{padding:6px 0}
.ent{display:grid;grid-template-columns:70px 1fr;gap:10px;padding:5px 0 5px 10px;border-left:3px solid var(--other)}.ent.us{border-left-color:var(--you)}
.ent .y{font-size:10.5px;color:var(--muted);padding-top:2px}.ent .t{display:flex;flex-direction:column;gap:1px;font-size:13.5px}.ent .t>span{color:var(--page-ink2);font-style:italic}
.ent.live{background:var(--paper)}.ent .fly{font-size:10px;color:var(--you);font-style:normal}
.gapline{margin:0 0 0 12px;padding:3px 0 3px 70px;border-left:1px dashed var(--muted);font-size:10.5px;color:var(--muted)}
.journey{margin:4px 2px 2px;display:flex;flex-direction:column;gap:6px}
.jleg{display:grid;grid-template-columns:10px 1fr auto 64px;gap:8px;align-items:center;font-size:12.5px}.jleg i{width:10px;height:10px;border-radius:2px}.jleg .mono{font-size:10.5px;color:var(--muted)}.jleg .rtime{font-size:10.5px;color:var(--muted);text-align:right}
.jbar{position:relative;display:flex;height:8px;border-radius:4px;overflow:visible;background:var(--track)}.jseg{height:100%}.jseg:first-child{border-radius:4px 0 0 4px}.jseg:last-child{border-radius:0 4px 4px 0}
.jnow{position:absolute;top:-5px;bottom:-5px;width:2px;background:var(--ink)}
.probecard{display:grid;grid-template-columns:56px 1fr auto;gap:12px;align-items:center;padding:8px 0}.probecard .pt{display:flex;flex-direction:column;gap:3px;font-size:14px}.probecard .sub{font-size:11.5px;color:var(--muted)}
.opt.act{grid-template-columns:1fr auto 10px;padding:9px 12px}.opt.act .sub{font-size:12px;color:var(--page-ink2)}.opt.act .chev{color:var(--muted)}
.ptypes{display:flex;flex-direction:column;gap:5px;margin-top:6px}
.ptype{display:grid;grid-template-columns:40px 1fr auto;gap:10px;align-items:center;padding:6px 10px;border:1px solid var(--faint);border-radius:10px;background:var(--paper);width:100%;box-sizing:border-box}
.ptype .pt{display:flex;flex-direction:column;gap:2px;font-size:13.5px}.ptype .ph2{display:flex;align-items:center;gap:6px}.ptype .sub{font-size:11px;color:var(--muted)}.ptype .pd{font-size:11px;text-align:right}
.ptype .tag{font-size:10px;padding:0 6px;border-radius:8px;border:1px solid var(--muted);color:var(--muted)}.ptype .tag.stop{border-color:var(--you);color:var(--you)}
.ptype.cant,.ptype.locked{background:none;opacity:.6}.ptype .needs{font-size:11px;color:var(--ink)}
.lag{margin:6px 0 0;padding:6px 10px;border-radius:8px;background:var(--paper);border:1px dashed var(--you);font-size:10.5px;color:var(--you)}
.takes{display:block;font-size:10px;color:var(--muted);margin-top:2px}
.awayhead{display:flex;flex-direction:column;gap:2px;margin:6px 0 2px}.awayhead h3{margin:0;font-size:30px;font-weight:600;letter-spacing:-.01em}.awayhead .sub{font-size:12px;color:var(--muted)}
.strip{margin:4px 0 0}
.bigthing{display:grid;grid-template-columns:1fr auto 10px;gap:10px;align-items:center;width:100%;padding:8px 12px;margin-top:5px;border-radius:10px;background:var(--paper);border:1px solid var(--faint);border-left:3px solid var(--other);box-sizing:border-box}
.bigthing.you{border-left-color:var(--you)}.bigthing .pt{display:flex;flex-direction:column;gap:1px;font-size:14px}.bigthing .sub{font-size:11.5px;color:var(--muted)}.bigthing .pd{font-size:10.5px;color:var(--muted)}.bigthing .chev{color:var(--muted)}
.did{margin:2px 0 0;padding-left:16px;font-size:12.5px;line-height:1.5;color:var(--page-ink2)}
.replay{position:absolute;left:12px;right:12px;bottom:46px;display:flex;align-items:center;gap:8px;padding:4px 10px;border:1px solid var(--ink);border-radius:18px;background:var(--paper)}
.replay .play{width:26px;height:26px;border-radius:50%;background:var(--ink);color:var(--paper);display:grid;place-items:center;flex-shrink:0}.replay .rnow{font-size:10.5px;white-space:nowrap}.rtrack svg{display:block}
.ledger{grid-template-columns:110px 1fr;row-gap:7px;font-size:13px;margin:2px 0}.ledger dd{color:var(--ink)}
.starsheet{position:absolute;left:0;right:0;top:392px;bottom:64px;z-index:3;display:flex;flex-direction:column;padding:6px 16px 0;background:var(--paper);border-top:1px solid var(--faint);border-radius:16px 16px 0 0;box-shadow:0 -10px 24px var(--shadow)}
.starsheet>*{flex-shrink:0}.grab{align-self:center;width:36px;height:4px;border-radius:2px;background:var(--faint);margin-bottom:6px}
.sthead{display:flex;justify-content:space-between;align-items:flex-start}.sthead>span{display:flex;flex-direction:column;gap:1px}
.sthead strong{font-size:20px;font-weight:600}.sthead .real{font-size:12px;color:var(--muted)}.sthead button{font-size:22px;color:var(--muted);line-height:1}
.stdraw{margin:4px -16px 2px;display:flex;justify-content:center}
.facts{display:grid;grid-template-columns:78px 1fr;gap:5px 10px;margin:0 0 4px;font-size:12.5px}.facts dt{color:var(--muted)}.facts dd{margin:0}.facts .rtime{font-size:10.5px;color:var(--muted);margin-left:4px}
.starsheet .row{min-height:48px}.starsheet .primary{margin:auto 0 12px}
.checklist{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}
.carea{background:var(--paper);border:1px solid var(--frame);border-radius:10px;padding:12px 16px}
.carea h3{display:flex;justify-content:space-between;font-size:15px;margin:0 0 8px}.carea h3 .mono{font-size:11px;color:var(--muted);font-weight:400}
.carea ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px;font-size:13px}
.carea li{display:grid;grid-template-columns:11px 1fr;column-gap:9px;align-items:baseline}.carea li em{grid-column:2;font-style:normal;font-size:11px;color:var(--other)}
.box{width:11px;height:11px;border:1px solid var(--ink);border-radius:3px;flex-shrink:0;transform:translateY(1px)}
.st-done{color:var(--muted)}.st-done .box{background:var(--ink)}.st-later{color:var(--muted)}.st-later .box{border-style:dashed}
.why{list-style:none;margin:6px 0 0;padding:0;display:flex;flex-direction:column;gap:5px;font-size:14px;line-height:1.4}.why b{font-weight:600}
.kinds{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:auto;padding-top:12px}
.kinds button{height:38px;border:1px solid var(--ink);border-radius:19px;text-align:center;font-size:13px}
.primary{height:46px;margin:auto 0 14px;border-radius:23px;background:var(--ink);color:var(--paper);text-align:center;font-size:15px;font-weight:500}
.tabring{position:absolute;top:784px;width:74px;height:56px;border-radius:12px;box-shadow:0 0 0 2px var(--you);z-index:6;pointer-events:none}
.tour{position:absolute;left:12px;right:12px;z-index:5;background:var(--paper);border:1px solid var(--ink);border-radius:14px;padding:14px 16px 12px;box-shadow:0 10px 30px rgba(0,0,0,.35)}
.tour .mono{font-size:10px;letter-spacing:.1em;color:var(--you)}
.tour h3{margin:4px 0 6px;font-size:18px;font-weight:600}.tour p{margin:0;font-size:13.5px;line-height:1.45;color:var(--ink)}
.tb{display:flex;justify-content:space-between;align-items:center;margin-top:12px}.tb button{font-size:13px;color:var(--muted)}
.tb .go{height:36px;padding:0 18px;border-radius:18px;background:var(--ink);color:var(--paper);text-align:center}
</style>'''
# ---------- Projects · empty state (fresh design; line drawing like the atlas) ----------
def scaffold_drawing():
    s = [f'<clipPath id="limb"><rect x="0" y="0" width="358" height="190"></rect></clipPath><g clip-path="url(#limb)">']
    s.append(f'<circle cx="179" cy="560" r="400" fill="{PAPER}" stroke="{INK}" stroke-width="1.3"></circle>')
    for r in (380, 350):
        s.append(f'<circle cx="179" cy="560" r="{r}" fill="none" stroke="{INK}" stroke-width=".5" opacity=".18"></circle>')
    s.append(f'<path d="M262,170 C300,166 330,170 358,176 L358,190 L250,190 Z" fill="url(#hatch)" opacity=".7"></path>')
    s.append(f'<path d="{ellipse_path(179, 150, 210, 40, 180, 360)}" fill="none" stroke="{INK}" stroke-width=".8" stroke-dasharray="3 4" opacity=".5"></path>')
    s.append('</g>')
    # An open truss in orbit, and the outline of what could be built on it.
    x0, y0, w = 112, 70, 134
    s.append(f'<line x1="{x0}" y1="{y0}" x2="{x0 + w}" y2="{y0}" stroke="{INK}" stroke-width="1.1"></line><line x1="{x0}" y1="{y0 + 12}" x2="{x0 + w}" y2="{y0 + 12}" stroke="{INK}" stroke-width="1.1"></line>')
    s.append(''.join(f'<line x1="{x0 + i * 12}" y1="{y0 + (0 if i % 2 else 12)}" x2="{x0 + (i + 1) * 12}" y2="{y0 + (12 if i % 2 else 0)}" stroke="{INK}" stroke-width=".7"></line>' for i in range(w // 12)))
    for dx in (0, 46, 92):
        s.append(f'<rect x="{x0 + dx}" y="{y0 - 44}" width="40" height="36" fill="none" stroke="{YOU}" stroke-width="1" stroke-dasharray="3 3"></rect>')
        s.append(f'<line x1="{x0 + dx + 20}" y1="{y0 - 8}" x2="{x0 + dx + 20}" y2="{y0}" stroke="{YOU}" stroke-width=".8" stroke-dasharray="2 2"></line>')
    s.append(text(179, y0 + 34, 'nothing built yet', 9, MUTED, 'middle'))
    return f'<svg width="358" height="150" viewBox="0 20 358 150" font-family="IBM Plex Mono, monospace" role="img" aria-label="An empty scaffold in orbit above Veyra">{"".join(s)}</svg>'

def capacity(name, note):
    return f'<div class="cap"><span>{name}</span><b><s></s></b><span class="mono">{note}</span></div>'

PROJECTS_EMPTY = tab_screen('Projects', 'PROJECTS', 'NOTHING UNDER WAY', hud=HUD, body=''.join([
    f'<div class="art">{scaffold_drawing()}</div>',
    '<h3 class="lead">Projects are how you know, grow and reach</h3>',
    '<ul class="why"><li><b>Know:</b> build instruments to study the clues.</li><li><b>Grow:</b> build industry so everything gets faster.</li><li><b>Reach:</b> send probes and messages to other stars.</li></ul>',
    '<div class="sec">EACH YEAR YOU CAN SPEND</div>',
    capacity('Energy', 'all idle'), capacity('Compute', 'all idle'),
    '<div class="sec">MATTER ON HAND</div><div class="pile"><b>1,240 kt</b><span>+40 kt a year from Veyra’s mines. A project draws its matter once, when it starts.</span></div>',
    '<div class="sec">NEXT 3 HOURS</div>',
    '<div class="track"><i style="left:0"></i><i style="left:33.3%"></i><i style="left:66.6%"></i><i style="left:100%"></i><span>now</span><span>01:00:00</span><span>02:00:00</span><span>03:00:00</span></div>',
    '<p class="copy small">One Year passes every <span class="rtime">00:05:00</span> (5 minutes). Your first project will appear on this line.</p>',
    '<button class="primary">Start a project</button>']))

# ---------- The tour, now that the Projects tab exists ----------
TOUR_SPOT, TOUR_TOP = (4, 428, 382, 284), 200
STOPS = [
    (first(0), 'You are Veyra’s mind', 'Top: your year and three resources, energy, matter and compute. Below: your map. Pinch out to see farther, from your world to the galaxy.', (4, 4, 382, 498), 520),
    (first(2), 'The eerie silence', 'About 1,200 stars within 50 light-years, and no one heard. Yet some things don’t fit: an oxygen world at Twin, a new warm glow at Ember, uneven dimming at Lantern.', (4, 106, 382, 396), 520),
    (PROJECTS_EMPTY, 'Projects', 'How you know, grow and reach. Each takes a share of every year’s energy and compute, and matter once, at the start. One Year passes every 00:05:00.', TOUR_SPOT, TOUR_TOP),
    (REPORT, 'Report', 'What happened while you were away. News arrives only when its light does.', (4, 104, 382, 300), 520),
    (MIND, 'Mind', 'Who your civilization is, and the standing orders it follows while you are gone.', (4, 104, 382, 420), 540),
    (first(2), 'The silence is the start', 'How you answer these clues is the game. Look closer, listen harder, speak, or send something.', (4, 106, 382, 396), 520),
]
TOUR_CAPTIONS = ['Home · you and your map', 'Home · the silence and the clues', 'Projects tab · how time works', 'Report tab', 'Mind tab', 'Hand-off']
TOUR_TABS = [None, None, 'Projects', 'Report', 'Mind', None]
tour_figures = ''.join(f'<figure><figcaption><strong>{n + 1} · {TOUR_CAPTIONS[n]}</strong></figcaption>{tour(phone, n + 1, len(STOPS), title, body, spot, top, n == len(STOPS) - 1, TOUR_TABS[n])}</figure>'
                       for n, (phone, title, body, spot, top) in enumerate(STOPS))
TALK = '<button class="talk">Talk it through with the mind ›</button>'
# ---------- Start a project: pick, then confirm ----------

def project_card(key, name, what, cost, years, real, clue=None):
    tag = f'<span class="clue">{clue}</span>' if clue else ''
    return (f'<button class="pcard"><span class="thumb">{ICONS[key]}</span><span class="pt"><b>{name}</b><span class="sub">{what}</span>'
            f'<span class="costs mono">{cost}</span>{tag}</span><span class="pd">{tstack(years, real)}</span></button>')

CAT = {p['id']: p for p in catalog.PROJECTS}
PICKER_ORDER = [('infrared-telescope', 'ir', 'Ember'), ('transit-watch', 'transit', 'Lantern'), ('spectrograph-bank', 'spectro', None),
                ('deep-field-receiver', 'receiver', None), ('optical-flash-watch', 'flash', None), ('planet-survey', 'survey', None)]
VIS_CHIP = {'noticeable': ('Easier to spot', 'vischip'), 'loud': ('Announces us', 'vischip loud')}
def catalog_card(pid, key, clue, started=()):
    p = CAT[pid]
    locked = [n for n in p['needs'] if n not in started]
    card = project_card(key, p['name'], p['why'], cost_short(p), f'{p["years"]} Years', catalog.real_time(p['years']), clue)
    extra = ''
    if p['purpose'] == 'grow' and p['effect']: extra += f'<span class="gain">{p["effect"].rstrip(".")}</span>'
    if p['purpose'] == 'reach' and p['effect']: extra += f'<span class="warnline">{p["effect"]}</span>'
    if p['visibility'] in VIS_CHIP: extra += '<span class="vischip {1}">{0}</span>'.format(*VIS_CHIP[p['visibility']]).replace('vischip vischip', 'vischip')
    if extra: card = card.replace('</span><span class="pd">', extra + '</span><span class="pd">', 1)
    if locked:
        card = card.replace('<button class="pcard">', '<button class="pcard locked" aria-disabled="true">').replace(
            '</span><span class="pd">', f'<span class="needs">Needs: {" + ".join(CAT[n]["name"] for n in locked)}</span></span><span class="pd">', 1)
    return card
def tier_count(purpose): return sum(p['purpose'] == purpose and p['tier'] == 1 for p in catalog.PROJECTS)
PICKER = f"""<div class="phone">{HUD}<div class="sheet">
<div class="sh"><strong>Start a project</strong><button aria-label="Close">×</button></div>
<div class="seg" role="tablist"><button role="tab" aria-selected="true" class="on">Know · {tier_count('know')}</button><button role="tab" aria-selected="false">Grow · {tier_count('grow')}</button><button role="tab" aria-selected="false">Reach · {tier_count('reach')}</button></div>
{''.join(catalog_card(*entry) for entry in PICKER_ORDER)}
</div></div>"""

def big_ir(built=1.0, height=200):
    s = [stipple(21, 40, 358, height)]
    done = lambda i, n: i < round(built * n)
    dash = lambda ok: '' if ok else ' stroke-dasharray="3 3" opacity=".6"'
    k = height / 200
    cx, cy = 179, 128 * k
    for i, (w, h) in enumerate(((150, 44), (134, 38), (118, 32), (102, 26), (86, 20))):
        w, h = w * (.8 + .2 * k), h * k
        y = cy + 16 * k - i * 7 * k
        s.append(f'<path d="M{cx - w} {y} L{cx} {y - h * .55} L{cx + w} {y} L{cx} {y + h * .55} Z" fill="{PAPER}" stroke="{INK if done(i, 5) else YOU}" stroke-width="{1.2 if i == 0 else .8}"{dash(done(i, 5))}></path>')
    hx, hy, r = cx, 58 * k, 9 * (.7 + .3 * k)
    for j, (q, rr) in enumerate([((0, 0), 0), ((1, 0), 1), ((-1, 0), 1), ((.5, .87), 1), ((-.5, .87), 1), ((.5, -.87), 1), ((-.5, -.87), 1)]):
        x, y = hx + q[0] * r * 1.8, hy + q[1] * r * 1.8
        pts = ' '.join(f'{fmt(x + r * math.cos(math.radians(a)))},{fmt(y + r * math.sin(math.radians(a)))}' for a in range(30, 390, 60))
        ok = built >= 1 or (built > .5 and j < round((built - .5) * 14))
        s.append(f'<polygon points="{pts}" fill="{PAPER}" stroke="{INK if ok else YOU}" stroke-width="1"{dash(ok)}></polygon>')
    for dx in (-38, 38):
        s.append(f'<line x1="{hx + dx * .5}" y1="{hy + 20 * k}" x2="{hx + dx * 1.6}" y2="{cy - 18 * k}" stroke="{INK}" stroke-width=".9"></line>')
    s.append(f'<line x1="{hx}" y1="{hy + 26 * k}" x2="{hx}" y2="{cy - 22 * k}" stroke="{INK}" stroke-width=".9"></line>')
    s.append(f'<circle cx="{hx}" cy="{hy}" r="2" fill="{YOU}"></circle>')
    s.append(text(12, height - 10, 'sunshield keeps it cold enough to see heat', 9) if built >= 1 else text(12, 18, f'under construction · {round(built * 100)}% built', 9, YOU))
    return f'<svg width="358" height="{height}" viewBox="0 0 358 {height}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Infrared telescope">{"".join(s)}</svg>'

def share(name, pct):
    return f'<div class="cap"><span>{name}</span><b class="use"><s style="width:{pct}%"></s></b><span class="mono">{pct}%</span></div>'

CONFIRM = f"""<div class="phone">{HUD}<div class="sheet">
<div class="sh"><button class="backlink">‹ Know</button><span class="mono kind">KNOW</span></div>
<div class="art">{big_ir(1.0, 150)}</div>
<h3 class="lead">Infrared telescope</h3>
<p class="whyline">Tells you whether a warm glow is natural, or someone’s machines.</p>
<p class="copy">Sees heat instead of light. Dust, cold companions and machines each glow differently.</p>
<div class="sec">HELPS WITH</div>
<div class="helps"><span class="mk other"></span><span><b class="other">New warm glow · Ember</b><span class="sub">Now: dust 55 · companions 35 · waste heat 10</span><span class="sub">After: can tell dust from companions</span></span></div>
<div class="sec">USES EACH YEAR</div>
{share('Energy', 25)}{share('Compute', 15)}
<div class="sec">USES ONCE, AT START</div>
<div class="pile"><b>200 kt</b><span>of matter, from 1,240 kt on hand</span></div>
<div class="sec">TIME</div>
<div class="timeline"><div class="track"><i style="left:0"></i><i style="left:33.3%"></i><i style="left:66.6%"></i><i style="left:100%"></i><span>now</span><span>01:00:00</span><span>02:00:00</span><span>03:00:00</span></div><div class="span" style="width:50%"><span>18 Years</span></div></div>
<button class="primary">Start · done in 01:30:00</button>
</div></div>"""

# ---------- The project catalog, from catalog.py ----------
(root / 'HOLOS_PROJECTS.md').write_text(catalog.markdown())
CATALOG = catalog.html()

# ---------- After starting: the telescope under way, then a second project ----------
def used(name, pct):
    return f'<div class="cap"><span>{name}</span><b class="use"><s style="width:{pct}%"></s></b><span class="mono">{100 - pct}% free</span></div>'
def track(bars):
    marks = '<i style="left:0"></i><i style="left:33.3%"></i><i style="left:66.6%"></i><i style="left:100%"></i><span>now</span><span>01:00:00</span><span>02:00:00</span><span>03:00:00</span>'
    lanes = ''.join(f'<div class="lane"><div class="span" style="width:{w}%"></div><span class="lname">{name}</span></div>' for name, w in bars)
    return f'<div class="lanes">{lanes}</div><div class="track">{marks}</div>'
PAUSE_ICON = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="3" y="2" width="3" height="10" fill="currentColor"></rect><rect x="8" y="2" width="3" height="10" fill="currentColor"></rect></svg>'
PLAY_ICON = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M4 2 L12 7 L4 12 Z" fill="currentColor"></path></svg>'
def pause_button(name, paused=False):
    return f'<button class="pause{" on" if paused else ""}" aria-label="{"Resume" if paused else "Pause"} {name}">{PLAY_ICON if paused else PAUSE_ICON}</button>'
def running_row(key, name, years, remaining, pct, clue=None, paused=False, sub=None):
    tag = f'<span class="clue">{clue}</span>' if clue else ''
    if sub: tag += f'<span class="sub">{sub}</span>'
    state = '<span class="paused-chip">Paused</span>' if paused else ''
    return (f'<div class="prow{" is-paused" if paused else ""}"><span class="thumb">{ICONS[key]}</span><span class="pt"><b>{name}</b>{tag}{state}'
            f'<span class="bar"><span style="width:{max(pct, 1.5)}%"></span></span></span><span class="rside">{tstack(years, remaining, not paused)}{pause_button(name, paused)}</span></div>')

ir, tw = CAT['infrared-telescope'], CAT['transit-watch']
STARTED = tab_screen('Projects', 'PROJECTS', '1 RUNNING', ''.join([
    f'<div class="art">{big_ir(0.0, 150)}</div>',
    f'<div class="runhead"><span><b class="lead">{ir["name"]}</b><span class="copy small">Done in Year 18.4</span></span><span class="rside">{tstack(f"{ir["years"]} Years", "01:29:47", True)}{pause_button(ir["name"])}</span></div>',
    '<span class="bar big"><span style="width:1.5%"></span></span>',
    '<div class="helps"><span class="mk other"></span><span><b class="other">Helps with: New warm glow · Ember</b><span class="sub">When done: dust, companions or waste heat, told apart</span></span></div>',
    '<div class="sec">EACH YEAR YOU CAN SPEND</div>', used('Energy', 25), used('Compute', 15),
    '<div class="pile"><b>1,040 kt</b><span>matter on hand after the telescope’s 200 kt · +40 kt a year</span></div>',
    '<div class="sec">NEXT 3 HOURS</div>', track([(ir['name'], 50)]),
    '<button class="primary ghost">Start another project</button>']))
PAUSED = tab_screen('Projects', 'PROJECTS', '1 RUNNING · 1 PAUSED', ''.join([
    '<div class="sec">RUNNING</div>',
    running_row('transit', tw['name'], f'{tw["years"]} Years', '00:07:31', 62, 'Lantern'),
    '<div class="sec">PAUSED</div>',
    running_row('ir', ir['name'], '10.8 Years left', '00:54:00', 40, 'Ember', paused=True),
    '<p class="copy small">A paused project keeps its progress and stops using energy and compute, so its share of the year is free. Matter it already used stays built in.</p>',
    '<div class="sec">EACH YEAR YOU CAN SPEND</div>', used('Energy', 5), used('Compute', 10),
    '<div class="pile"><b>1,140 kt</b><span>matter on hand · the telescope’s 200 kt stays built in</span></div>',
    '<div class="sec">NEXT 3 HOURS</div>', track([(tw['name'], 4.2)]),
    '<button class="primary ghost">Start another project</button>']))
TWO_RUNNING = tab_screen('Projects', 'PROJECTS', '2 RUNNING', ''.join([
    '<div class="sec">RUNNING</div>',
    running_row('transit', tw['name'], f'{tw["years"]} Years', '00:19:58', 1, 'Lantern'),
    running_row('ir', ir['name'], f'{ir["years"]} Years', '01:29:16', 1, 'Ember'),
    '<p class="copy small">The transit watch finishes first. Its answer lands in the Report.</p>',
    '<div class="sec">EACH YEAR YOU CAN SPEND</div>', used('Energy', 30), used('Compute', 25),
    '<div class="pile"><b>1,040 kt</b><span>matter on hand · the transit watch needs none</span></div>',
    '<div class="sec">NEXT 3 HOURS</div>', track([(tw['name'], 11.1), (ir['name'], 50)]),
    '<button class="primary ghost">Start another project</button>']))
# Each state's top bar: energy and compute in use, matter on hand.
STARTED = STARTED.replace(HUD_SAMPLE, HUD_TOP + hud_res(25, 15, '1,040 kt'))
TWO_RUNNING = TWO_RUNNING.replace(HUD_SAMPLE, HUD_TOP + hud_res(30, 25, '1,040 kt'))
PAUSED = PAUSED.replace(HUD_SAMPLE, HUD_TOP + hud_res(5, 10, '1,140 kt'))

# ---------- First result: the transit watch finishes at Year 4.4 ----------
HUD44 = (HUD_TOP + hud_res(25, 15, '1,200 kt')).replace('Year 0.4', 'Year 4.4')
DISC = {p['id']: p for p in catalog.DISCOVERIES}
mc = dict(DISC['measure-crossing'], name=DISC['measure-crossing']['name'].replace('{star}', 'Lantern'))

def light_curve():
    w, h, x0, x1, base = 358, 170, 34, 346, 48
    s = [f'<line x1="{x0}" y1="{base}" x2="{x1}" y2="{base}" stroke="{INK}" stroke-width=".7" stroke-dasharray="3 4" opacity=".5"></line>',
         text(x0, base - 8, 'normal brightness', 9),
         f'<line x1="{x0}" y1="18" x2="{x0}" y2="138" stroke="{INK}" stroke-width=".8"></line><line x1="{x0}" y1="138" x2="{x1}" y2="138" stroke="{INK}" stroke-width=".8"></line>',
         text(x0, 154, 'Year 0.4', 9), text(x1, 154, 'Year 4.4', 9, MUTED, 'end'), text((x0 + x1) / 2, 154, 'one dip every 212 days', 9, OTHER, 'middle')]
    # Seven dips at a fixed period, each a different depth and shape.
    dips = [(1.4, 10, 0), (2.3, 16, .5), (1.1, 8, -.4), (2.0, 22, .2), (1.6, 12, -.6), (2.4, 18, .7), (1.3, 14, 0)]
    rng = random.Random(3); pts = []
    for i in range(0, 620):
        t = i / 619; x = x0 + 4 + t * (x1 - x0 - 8); drop = 0
        for k, (depth, width, skew) in enumerate(dips):
            c = x0 + 22 + k * (x1 - x0 - 44) / 6; d = (x - c) / (width * (1 + (skew if x > c else -skew) * .6))
            drop += depth * math.exp(-d * d * 3)
        pts.append(f'{fmt(x)},{fmt(base + drop * 30 + (rng.random() - .5) * 1.6)}')
    s.append(f'<polyline points="{" ".join(pts)}" fill="none" stroke="{OTHER}" stroke-width="1.1"></polyline>')
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Lantern light curve: seven dips, each a different shape">{"".join(s)}</svg>'

def odds(name, before, after, note=''):
    return (f'<div class="odds"><span>{name}</span><b><s class="before" style="width:{before}%"></s><s class="after" style="width:{after}%"></s></b>'
            f'<span class="mono">{before} → {after}{note}</span></div>')

def discovery_card(p, source):
    real = catalog.real_time(p['years'])
    return (f'<div class="dcard"><span class="newtag">New · from {source}</span><b>{p["name"]}</b><span class="sub">{p["why"]}</span>'
            f'<div class="dfoot"><span class="costs mono">{cost_short(p)}</span>{tstack(f"{p["years"]} Years", real)}<button class="go-small">Start</button></div></div>')

REPORT_NEW = tab_screen('Report', 'REPORT', 'WHILE YOU WERE AWAY', ''.join([
    entry('4.4', 'transit', '<span class="newtag">New</span> <b>Transit watch finished.</b> Lantern dims every 212 days, and no two dips look the same.<button class="seeresult">See the result ›</button>', True),
    entry('0.4', 'ir', 'Infrared telescope started. Done in Year 18.4, <span class="rtime">01:10:00</span> from now.'),
    entry('0.4', 'transit', 'Transit watch started on Lantern.'),
    entry('0', 'woke', 'Veyra woke.'),
    '<p class="note">News lands when its light does. This came from light that was already reaching us.</p>']), HUD44)

RESULT = tab_screen('Report', 'REPORT', 'RESULT', f"""<button class="backlink inline">‹ All reports</button>
<div class="art">{light_curve()}</div>
<h3 class="lead">Lantern dims again</h3>
<p class="copy small">Gliese 783 A · transit watch · finished Year 4.4</p>
<p class="copy">Seven dips, one every 212 days. No two have the same shape. Whatever crosses the star is regular, but not solid like a single planet.</p>
<div class="sec">WHAT IT COULD BE · BEFORE → NOW</div>
{odds('Dust or debris in orbit', 35, 55)}{odds('A planet with rings', 15, 30)}{odds('Something built', 10, 15)}{odds('A fluke · ruled out', 40, 0)}
<div class="sec">NOW OPEN</div>
{discovery_card(mc, 'the transit watch')}""", HUD44)

def new_card_in_picker():
    p = mc
    return (f'<button class="pcard fresh"><span class="thumb">{ICONS["transit"]}</span><span class="pt"><span class="newtag">New · from the transit watch</span><b>{p["name"]}</b><span class="sub">{p["why"]}</span>'
            f'<span class="costs mono">{cost_short(p)}</span><span class="clue">Lantern</span></span><span class="pd">{tstack(f"{p["years"]} Years", catalog.real_time(p["years"]))}</span></button>')
PICKER_NEW = f"""<div class="phone">{HUD44}<div class="sheet">
<div class="sh"><strong>Start a project</strong><button aria-label="Close">×</button></div>
<div class="seg" role="tablist"><button role="tab" aria-selected="true" class="on">Know · 5</button><button role="tab" aria-selected="false">Grow · {tier_count('grow')}</button><button role="tab" aria-selected="false">Reach · {tier_count('reach')}</button></div>
{new_card_in_picker()}
{''.join(catalog_card(*entry) for entry in PICKER_ORDER if entry[0] not in ('infrared-telescope', 'transit-watch'))}
</div></div>"""

HOME_AFTER = frame(2, *neighbors(after_result=True), panel=('CLUES · 3', 'YEAR 4.4', [
    '<button class="row"><span class="mk other"></span><span class="rt"><span class="newtag">New</span><span class="other">Regular dimming · Lantern</span><span class="sub">dust 55 · ringed planet 30 · something built 15</span></span><span class="rr">›</span></button>',
    row('New warm glow · Ember', 'infrared telescope under way', tstack('14 Years', '01:10:00', True), 'other', marker=True),
    row('Oxygen world · Twin', 'not yet studied · light takes ' + light_clock(math.dist(HOME, (0, 0, 0))), '›', 'other', marker=True)]), year='Year 4.4', res=(25, 15, '1,200 kt'))

MAP_DONE = frame(0, *world(done=True, times=('', '00:04:03', '01:52:06')), panel=('IN MOTION · 2', 'TIME LEFT', [
    '<button class="row"><span class="mk" style="color:var(--ink)"></span><span class="rt"><span class="newtag">Done</span><span>Deep-field receiver</span><span class="sub">listening · the radio floor is lower</span></span><span class="rr">›</span></button>',
    row('Planet survey · 12 nearest stars', 'from Veyra’s observatories', tstack('0.8 Years', '00:04:03', True), bar=94),
    row('Orbital foundry', 'at L5, 60° ahead of Veyra', tstack('22.4 Years', '01:52:06', True), bar=25),
    row('Leads · 3', 'Twin, Ember, Lantern', '›', 'other')]), year='Year 57.5', res=(35, 35, '1,250 kt'))


# ---------- More of the picker: Grow, Reach, a locked project, over budget ----------
def picker(tab, cards, later, hud=None):
    tabs = ''.join(f'<button role="tab" aria-selected="{str(t == tab).lower()}"{" class=\"on\"" if t == tab else ""}>{t.title()} · {tier_count(t)}</button>' for t in ('know', 'grow', 'reach'))
    return (f'<div class="phone">{hud or HUD}<div class="sheet"><div class="sh"><strong>Start a project</strong><button aria-label="Close">×</button></div>'
            f'<div class="seg" role="tablist">{tabs}</div>{"".join(catalog_card(*c) for c in cards)}'
            f'<div class="sec">LATER · NEEDS SOMETHING FIRST</div>{"".join(catalog_card(*c) for c in later)}</div></div>')
PICK_GROW = picker('grow', [('orbital-solar-array', 'solar', None), ('belt-prospecting', 'prospect', None), ('cold-compute-annex', 'annex', None), ('belt-mining', 'mining', None)],
                   [('orbital-foundry', 'foundry', None)])
PICK_REACH = picker('reach', [('tight-beam', 'beam', None), ('broadcast-beacon', 'beacon', None)],
                    [('launcher', 'launcher', None), ('assay-probe', 'probe', None)])

def foundry_blueprint():
    s = ['<clipPath id="limb2"><rect x="0" y="0" width="358" height="130"></rect></clipPath><g clip-path="url(#limb2)">',
         f'<circle cx="179" cy="496" r="400" fill="{PAPER}" stroke="{INK}" stroke-width="1.3"></circle><path d="M250,108 C290,104 330,108 358,114 L358,130 L240,130 Z" fill="url(#hatch)" opacity=".7"></path></g>']
    x0, y0, w = 96, 62, 166
    s.append(f'<g stroke="{YOU}" stroke-dasharray="3 3" fill="none" stroke-width="1"><line x1="{x0}" y1="{y0}" x2="{x0 + w}" y2="{y0}"></line><line x1="{x0}" y1="{y0 + 12}" x2="{x0 + w}" y2="{y0 + 12}"></line>'
             + ''.join(f'<line x1="{x0 + i * 12}" y1="{y0 + (0 if i % 2 else 12)}" x2="{x0 + (i + 1) * 12}" y2="{y0 + (12 if i % 2 else 0)}" stroke-width=".7"></line>' for i in range(w // 12))
             + ''.join(f'<rect x="{x0 + dx}" y="{y0 - 40}" width="{bw}" height="32"></rect><line x1="{x0 + dx + bw / 2}" y1="{y0 - 8}" x2="{x0 + dx + bw / 2}" y2="{y0}"></line>' for dx, bw in ((6, 44), (60, 30), (100, 56)))
             + '</g>')
    s.append(text(179, 14, 'blueprint · not yet possible', 9, YOU, 'middle'))
    return f'<svg width="358" height="126" viewBox="0 0 358 126" font-family="IBM Plex Mono, monospace" role="img" aria-label="The orbital foundry as a blueprint">{"".join(s)}</svg>'

def step(state, title, sub, right):
    return f'<div class="step {state}"><span class="dot"></span><span class="pt"><b>{title}</b><span class="sub">{sub}</span></span><span class="pd">{right}</span></div>'

of, bp, bm = CAT['orbital-foundry'], CAT['belt-prospecting'], CAT['belt-mining']
# Earliest finish if nothing else draws matter: prospect, mine, save up, then build.
_mined = 0.4 + bp['years'] + bm['years']
_stock = 1240 + 40 * (_mined - 0.4)
_saved = _mined + (catalog.matter_tonnes(of) - _stock) / 160
_done = _saved + of['years']
LOCKED = f"""<div class="phone">{HUD}<div class="sheet">
<div class="sh"><button class="backlink">‹ Grow</button><span class="mono kind">GROW · LOCKED</span></div>
<div class="art">{foundry_blueprint()}</div>
<h3 class="lead">{of['name']}</h3>
<p class="whyline">{of['why']}</p>
<p class="copy small mono">{cost_short(of)} · {of['years']} Years to build</p>
<div class="sec">WHAT IT NEEDS FIRST</div>
<div class="chain">
{step('ready', bp['name'], 'ready now · finds the metal', tstack(f"{bp['years']} Years", catalog.real_time(bp['years'])) + '<button class="go-small">Start</button>')}
{step('wait', bm['name'], 'after prospecting · +120 kt of matter a year', tstack(f"{bm['years']} Years", catalog.real_time(bm['years'])))}
{step('wait', f"{catalog.tonnes(catalog.matter_tonnes(of))} of matter", f"you have 1,240 kt · saved by Year {_saved:.0f} with mining", tstack(f"{_saved - _mined:.0f} Years", clock((_saved - _mined) * 5)))}
</div>
<div class="sec">EARLIEST FINISH</div>
<div class="pile"><b>Year {_done:.0f}</b><span>{_done - 0.4:.0f} Years from now, <span class="rtime">{clock((_done - 0.4) * 5)}</span>, if nothing else uses matter. Matter is the slow part.</span></div>
</div></div>"""

def stacked(name, used, add, parts=''):
    total = used + add; k = .8   # the track shows 0 to 125%; the tick marks 100%
    fit = max(0, min(add, 100 - used))
    bar = (f'<s class="u" style="width:{used * k}%"></s><s class="a" style="left:{used * k}%;width:{fit * k}%"></s>'
           + (f'<s class="o" style="left:{(used + fit) * k}%;width:{(total - 100) * k}%"></s>' if total > 100 else '') + '<i></i>')
    return (f'<div class="cap stack{" over" if total > 100 else ""}"><span>{name}</span><b>{bar}</b><span class="mono">{total}%</span></div>'
            + (f'<p class="parts">{parts}</p>' if parts else ''))

lt = dict(DISC['listen-to'], name=DISC['listen-to']['name'].replace('{star}', 'Ember'))
HUD22 = (HUD_TOP + hud_res(65, 100, '1,720 kt')).replace('Year 0.4', 'Year 22.0')
OVER = f"""<div class="phone">{HUD22}<div class="sheet">
<div class="sh"><button class="backlink">‹ Know</button><span class="mono kind">KNOW</span></div>
<div class="overhead"><span class="thumb">{ICONS['receiver']}</span><span><h3 class="lead">{lt['name']}</h3><span class="sub">{lt['why']}</span></span></div>
<div class="sec">USES EACH YEAR · IN USE + THIS</div>
{stacked('Energy', 65, 15)}
{stacked('Compute', 100, 20, 'In use: pulsar timing array 30 · waste-heat survey 25 · flash watch 20 · map the dust 15 · belt mining 10')}
<div class="short"><b>Not enough compute.</b> Running projects already use all of this year’s supply. Three ways forward:</div>
<button class="opt" role="radio" aria-checked="false"><span class="radio"></span><span class="pt"><b>Start when there’s room</b><span class="sub">The flash watch finishes and frees 20%</span></span><span class="pd">{tstack('in 4 Years', '00:20:00')}</span></button>
<button class="opt" role="radio" aria-checked="false"><span class="radio"></span><span class="pt"><b>Pause the pulsar timing array</b><span class="sub">Frees 30% now. It keeps its progress.</span></span><span class="pd"><span class="gy">now</span></span></button>
<button class="opt" role="radio" aria-checked="false"><span class="radio"></span><span class="pt"><b>Grow compute first</b><span class="sub">Cold compute annex · +25% compute every year</span></span><span class="pd">{tstack('12 Years', catalog.real_time(12))}</span></button>
{TALK}
<button class="primary" disabled>Choose a way forward</button>
</div></div>"""

# ---------- Finishing, Up next, cancelling ----------
# The Projects story continues: the telescope started at Year 0.4, the receiver at 4.4 (done 16.4),
# prospecting then mining from Year 2, the pulsar array from 16.4, the flash watch from 20.
def disc(pid, star='Ember'): return dict(DISC[pid], name=DISC[pid]['name'].replace('{star}', star))
def at_year(hud_args, year): return (HUD_TOP + hud_res(*hud_args)).replace('Year 0.4', f'Year {year}')
def opened(name, sub, right):
    return f'<div class="orow"><span class="mk other"></span><span class="pt"><b>{name}</b><span class="sub">{sub}</span></span><span class="pd">{right}</span></div>'

rx, pta, mine = CAT['deep-field-receiver'], CAT['pulsar-timing-array'], CAT['belt-mining']
md, rc, lt2, whs = disc('map-dust'), disc('resolve-companions'), disc('listen-to'), CAT['waste-heat-survey']
FINISHED = tab_screen('Projects', 'PROJECTS', '2 RUNNING · 1 DONE', ''.join([
    f'<div class="art">{big_ir(1.0, 116)}</div>',
    f'<div class="donehead"><span class="newtag donetag">Done · Year 18.4</span><b class="lead">{ir["name"]}</b><span class="copy small">It can now tell dust from companions.</span>'
    '<button class="seeresult">See what it found at Ember ›</button></div>',
    '<div class="sec">OPENED · 4 NEW PROJECTS</div>',
    opened(md['name'], md['why'], tstack(f'{md["years"]} Years', catalog.real_time(md['years']))),
    opened(rc['name'], rc['why'], tstack(f'{rc["years"]} Years', catalog.real_time(rc['years']))),
    opened(lt2['name'], lt2['why'], tstack(f'{lt2["years"]} Years', catalog.real_time(lt2['years']))),
    opened(whs['name'], whs['why'], tstack(f'{whs["years"]} Years', catalog.real_time(whs['years']))),
    '<div class="sec">EACH YEAR YOU CAN SPEND · 2 STILL RUNNING</div>', used('Energy', 30), used('Compute', 40),
    '<p class="copy small">The telescope’s 25% of energy and 15% of compute are free again.</p>']), at_year((30, 40, '1,560 kt'), 18.4))

def qrow(n, key, name, sub, right):
    grip = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 4 H12 M2 7 H12 M2 10 H12" stroke="currentColor" stroke-width="1.3"></path></svg>'
    return f'<div class="qrow"><span class="qn mono">{n}</span><span class="kthumb">{ICONS[key]}</span><span class="pt"><b>{name}</b><span class="sub">{sub}</span></span><span class="pd">{right}</span><button class="grip" aria-label="Reorder {name}">{grip}</button></div>'
# The foundry waits for belt mining (done Year 28) and for 6,000 kt: 1,720 kt now, +40 kt a year, +160 kt once mining is done.
_q_start = 28 + (catalog.matter_tonnes(of) - (1720 + 40 * 6)) / 160
UP_NEXT = tab_screen('Projects', 'PROJECTS', '5 RUNNING · 3 UP NEXT', ''.join([
    '<div class="sec">RUNNING · 5</div>',
    running_row('flash', CAT['optical-flash-watch']['name'], '4 Years', '00:20:00', 33, sub='frees 20% compute when done'),
    running_row('mining', mine['name'], '6 Years', '00:30:00', 70, sub='+120 kt of matter a year when done'),
    running_row('dust', md['name'], '6.4 Years', '00:32:00', 36, 'Ember', sub='frees 15% compute when done'),
    row('2 more running', f'{whs["name"]} · {pta["name"]}', '›'),
    '<div class="sec">UP NEXT · STARTS ON ITS OWN</div>',
    qrow(1, 'receiver', lt2['name'], 'when the flash watch frees its compute', tstack('in 4 Years', '00:20:00')),
    qrow(2, 'companions', rc['name'], 'when the dust map frees its compute', tstack('in 6.4 Years', '00:32:00')),
    qrow(3, 'foundry', of['name'], f'after mining, and once 6,000 kt is saved', tstack(f'in {_q_start - 22:.0f} Years', clock((_q_start - 22) * 5))),
    '<p class="copy small">Each starts as soon as its energy, compute and matter fit, top first, even while you are away. Drag to reorder.</p>']),
    HUD22)

# Year 7.6: the telescope is 40% built. Cancelling is offered with its costs, and pausing next to it.
CANCEL_BEHIND = tab_screen('Projects', 'PROJECTS', '3 RUNNING', ''.join([
    '<div class="sec">RUNNING</div>',
    running_row('ir', ir['name'], '10.8 Years', '00:54:00', 40, 'Ember'),
    running_row('transit', mc['name'], '4.8 Years', '00:24:00', 40, 'Lantern'),
    running_row('receiver', rx['name'], '8.8 Years', '00:44:00', 27)]), at_year((55, 50, '1,190 kt'), 7.6))
CANCEL = CANCEL_BEHIND[:CANCEL_BEHIND.rindex('</div>')] + f"""<div class="scrim"></div><div class="csheet"><span class="grab" aria-hidden="true"></span>
<h3 class="lead">Cancel the infrared telescope?</h3>
<ul class="lose"><li><b>7.2 of its 18 Years of work are lost.</b> Starting again begins at zero.</li>
<li>Its 25% of energy and 15% of compute are free at once.</li>
<li>Half its matter is salvaged: 100 of 200 kt.</li>
<li>The glow at Ember waits until something else can look.</li></ul>
<p class="copy small">Pausing frees the same share and keeps every year of work.</p>
<div class="twobtn even"><button class="primary ghost">Pause the telescope</button><button class="danger">Cancel the telescope</button></div></div></div>"""

# ---------- Stars and clues: tap a star, then open its clue ----------
def ember_drawing():
    cx, cy = 58, 44
    s = [f'<circle cx="{cx}" cy="{cy}" r="27" fill="none" stroke="{OTHER}" stroke-width="1" stroke-dasharray="2 3"></circle>',
         text(10, 11, 'extra heat · source unknown', 9, OTHER),
         f'<path d="{ellipse_path(cx, cy, 86, 20, 0, 360)}" fill="none" stroke="{INK}" stroke-width=".8" stroke-dasharray="3 3" opacity=".7"></path>',
         f'<circle cx="{cx}" cy="{cy}" r="7" fill="{PAPER}" stroke="{INK}" stroke-width="1.3"></circle>',
         f'<circle cx="{cx + 72}" cy="{cy + 11}" r="3.5" fill="{PAPER}" stroke="{INK}" stroke-width="1.1"></circle>',
         text(cx + 80, cy + 26, 'cold giant planet · about 6 Jupiters', 9, INK),
         f'<line x1="{cx + 92}" y1="{cy}" x2="296" y2="{cy}" stroke="{INK}" stroke-width=".6" stroke-dasharray="1 4"></line>',
         f'<circle cx="306" cy="{cy - 2}" r="2.4" fill="{INK}"></circle><circle cx="314" cy="{cy + 3}" r="2" fill="{INK}"></circle>',
         text(346, cy - 22, 'brown dwarf pair', 9, INK, 'end'), text(346, cy - 11, '1,500 AU out', 9, MUTED, 'end'),
         text(346, 11, 'not to scale', 8, MUTED, 'end')]
    return f'<svg width="358" height="88" viewBox="0 0 358 88" font-family="IBM Plex Mono, monospace" role="img" aria-label="Ember: an orange dwarf with a cold giant planet and a distant pair of brown dwarfs">{"".join(s)}</svg>'

def gliese832_drawing():
    cx, cy = 90, 42
    s = [f'<path d="{ellipse_path(cx, cy, 70, 18, 0, 360)}" fill="none" stroke="{INK}" stroke-width=".8" stroke-dasharray="3 3" opacity=".7"></path>',
         f'<circle cx="{cx}" cy="{cy}" r="4.5" fill="{PAPER}" stroke="{INK}" stroke-width="1.2"></circle>',
         f'<circle cx="{cx - 58}" cy="{cy + 10}" r="3" fill="{PAPER}" stroke="{INK}" stroke-width="1.1"></circle>',
         text(cx + 80, cy + 4, 'one giant planet, far out', 9, INK), text(346, 84, 'not to scale', 8, MUTED, 'end')]
    return f'<svg width="358" height="88" viewBox="0 0 358 88" font-family="IBM Plex Mono, monospace" role="img" aria-label="Gliese 832: a red dwarf with one known giant planet">{"".join(s)}</svg>'

def star_sheet(name, real, drawing, facts, rows, action='Aim a project here'):
    dl = ''.join(f'<dt>{k}</dt><dd>{v}</dd>' for k, v in facts)
    return (f'<div class="starsheet"><span class="grab" aria-hidden="true"></span>'
            f'<div class="sthead"><span><strong>{name}</strong><span class="real">{real}</span></span><button aria-label="Close">×</button></div>'
            f'<div class="stdraw">{drawing}</div><dl class="facts">{dl}</dl>{"".join(rows)}'
            f'<button class="primary{" ghost" if action == "Aim a project here" else ""}">{action}</button></div>')

def with_sheet(phone, sheet):
    i = phone.rindex('<nav class="rail"')
    return phone[:i] + sheet + phone[i:]

d_ember = math.dist(atlas(by_hip['108870']), HOME); d_832 = math.dist(atlas(by_hip['106440']), HOME)
STAR_EMBER = with_sheet(frame(2, *neighbors(select='108870'), panel=FIRST_STARS, res=(0, 0)), star_sheet(
    'Ember', 'Epsilon Indi', ember_drawing(),
    [('Distance', f'{d_ember:.1f} ly · light takes {d_ember:.1f} Years <span class="rtime">{light_clock(d_ember)}</span>'),
     ('Star', 'Orange dwarf, a fifth as bright as Delta Pavonis'), ('In our sky', 'Easy to see by eye'), ('Aimed here', 'Nothing yet')],
    [row('New warm glow', 'dust 55 · companions 35 · waste heat 10', '›', 'other', marker=True)]))
STAR_QUIET = with_sheet(frame(2, *neighbors(select='106440'), panel=FIRST_STARS, res=(0, 0)), star_sheet(
    'Gliese 832', 'Too faint to see by eye, so it has no Veyra name', gliese832_drawing(),
    [('Distance', f'{d_832:.1f} ly · light takes {d_832:.1f} Years <span class="rtime">{light_clock(d_832)}</span>'),
     ('Star', 'Red dwarf, far dimmer than Delta Pavonis'), ('In our sky', 'Needs a telescope'), ('Aimed here', 'Nothing yet')],
    [row('Nothing unusual seen', 'no clues here yet', '')]))

def glow_chart():
    # Brightness per unit of log wavelength: the star alone, and the star plus a 300 K source.
    w, h, x0, x1, y0, y1 = 358, 132, 22, 346, 104, 18
    lo, hi = math.log10(.3), math.log10(40)
    def planck(lam_um, T):
        x = 14388 / (lam_um * T)
        return 0 if x > 700 else (15 / math.pi ** 4) * x ** 4 / (math.exp(x) - 1)
    X = lambda lam: x0 + (math.log10(lam) - lo) / (hi - lo) * (x1 - x0)
    Y = lambda f: y0 - (max(-4.2, math.log10(max(f, 1e-9))) + 4.2) / 4.2 * (y0 - y1)
    lams = [10 ** (lo + (hi - lo) * i / 240) for i in range(241)]
    star = [planck(l, 4630) for l in lams]
    seen = [a + 1.5e-2 * planck(l, 300) for a, l in zip(star, lams)]
    path = lambda vals: 'M' + ' L'.join(f'{fmt(X(l))},{fmt(Y(v))}' for l, v in zip(lams, vals))
    s = [f'<line x1="{x0}" y1="{y0}" x2="{x1}" y2="{y0}" stroke="{INK}" stroke-width=".8"></line>',
         f'<line x1="{x0}" y1="{y0}" x2="{x0}" y2="{y1 - 6}" stroke="{INK}" stroke-width=".8"></line>',
         text(x0 + 6, y1 - 2, 'brighter ↑', 9),
         text(X(.55), y0 + 14, 'visible', 9, MUTED, 'middle'), text(X(8), y0 + 14, 'infrared: heat →', 9, MUTED, 'middle'),
         f'<path d="{path(seen)} L{" L".join(f"{fmt(X(l))},{fmt(Y(v))}" for l, v in reversed(list(zip(lams, star))))} Z" fill="{OTHER}" fill-opacity=".14"></path>',
         f'<path d="{path(star)}" fill="none" stroke="{INK}" stroke-width="1" stroke-dasharray="4 3"></path>',
         f'<path d="{path(seen)}" fill="none" stroke="{OTHER}" stroke-width="1.4"></path>',
         text(X(4), Y(planck(4, 4630)) + 16, 'the star alone', 9, INK, 'end'),
         text(X(13), Y(planck(13, 4630) + 1.5e-2 * planck(13, 300)) - 10, 'what we see', 9, OTHER, 'middle', 600),
         text(X(13), Y(planck(13, 4630)) + 20, 'extra heat, about 300 K', 9, OTHER, 'middle')]
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Ember’s brightness by wavelength: more infrared than the star alone explains">{"".join(s)}</svg>'

def odds_now(name, pct):
    return f'<div class="odds"><span>{name}</span><b><s class="after" style="width:{pct}%;height:100%;top:0"></s></b><span class="mono">{pct}</span></div>'

def way(title, sub, right):
    return f'<div class="row"><span class="rt"><span><b>{title}</b></span><span class="sub">{sub}</span></span><span class="rr">{right}</span></div>'

CLUE_GLOW = tab_screen('Home', 'CLUE', 'YEAR 0.4', f"""<button class="backlink inline">‹ Ember</button>
<div class="art">{glow_chart()}</div>
<h3 class="lead">New warm glow</h3>
<p class="copy small">Ember · Epsilon Indi · {d_ember:.1f} ly · logged Year 0.1</p>
<p class="copy">Ember gives off more infrared than a star like it should. Something near it is glowing at about room temperature.</p>
<div class="sec">WHAT IT COULD BE · ODDS NOW</div>
{odds_now('Dust from a collision', 55)}{odds_now('Cold companions', 35)}{odds_now('Waste heat from machines', 10)}
<div class="sec">HOW TO FIND OUT · EARLIEST ANSWER</div>
{way('Look closer', 'Infrared telescope · tells dust from companions', tstack('18 Years', catalog.real_time(18)))}
{way('Listen harder', 'Listen to Ember · opens after the telescope', '<span class="sub">later</span>')}
{way('Speak', 'A message, then their reply · tells them we exist', tstack(f'{6 + 2 * d_ember:.1f} Years', clock((6 + 2 * d_ember) * 5)))}
{way('Send something', f'A flyby probe · flies {10 * d_ember:.0f} Years, reports {d_ember:.1f} later', tstack(f'{11 * d_ember:.0f} Years', clock(11 * d_ember * 5)))}""", HUD)

# ---------- First contact: the knock ----------
# Year 31.2. Beacon (Beta Hydri) aimed a laser at Veyra 9.3 Years ago. The flash watch catches it.
d_b = math.dist(atlas(by_hip['2021']), HOME)
Y_ARR, Y_NOW = 31.2, 31.3
Y_SENT = Y_ARR - d_b; Y_FOUND = Y_SENT - d_b
Y_THERE, Y_REPLY = Y_NOW + d_b, Y_NOW + 2 * d_b
HUD_K1, HUD_K2 = at_year((40, 45, '980 kt'), Y_ARR), at_year((40, 45, '980 kt'), Y_NOW)
KNOCK_ROW = ('<button class="row"><span class="mk other"></span><span class="rt"><span class="newtag">New</span><span class="other">A signal aimed at us · Beacon</span>'
             '<span class="sub">laser pulses, nothing else · caught by the sky watch</span></span><span class="rr">›</span></button>')
KNOCK_ARRIVES = frame(2, *neighbors(beam='2021'), panel=('SIGNALS · 1 NEW', f'YEAR {Y_ARR}', [KNOCK_ROW,
    row('New warm glow · Ember', 'dust, cold companions, or waste heat', '›', 'other', marker=True),
    row('Uneven dimming · Lantern', 'dust, bodies in orbit, or structures', '›', 'other', marker=True)]), year=f'Year {Y_ARR}', res=(40, 45, '980 kt'))

def pulse_drawing():
    w, h, x0, x1, base = 358, 124, 20, 346, 92
    s = [f'<line x1="{x0}" y1="{base}" x2="{x1}" y2="{base}" stroke="{INK}" stroke-width=".8"></line>',
         text(x0, base + 14, 'Beacon’s starlight', 9), text(x1, base + 14, 'time →', 9, MUTED, 'end')]
    rng = random.Random(8)
    pts = ' '.join(f'{fmt(x0 + i * (x1 - x0) / 300)},{fmt(base - 6 - rng.random() * 2.5)}' for i in range(301))
    s.append(f'<polyline points="{pts}" fill="none" stroke="{INK}" stroke-width=".8" opacity=".7"></polyline>')
    for k in range(5):
        x = x0 + 22 + k * 76
        s.append(f'<line x1="{x}" y1="{base - 7}" x2="{x}" y2="22" stroke="{OTHER}" stroke-width="1.6"></line>')
    s.append(text(x0 + 22 + 38, 52, 'every 3.1 s', 9, OTHER, 'middle'))
    s.append(f'<path d="M{x0 + 26} 58 H{x0 + 94}" stroke="{OTHER}" stroke-width=".7"></path>')
    s.append(text(x1, 16, 'each pulse: a billionth of a second', 9, OTHER, 'end', 600))
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Laser pulses from Beacon, each brighter than the star for an instant">{"".join(s)}</svg>'

KNOCK_SIGNAL = tab_screen('Report', 'REPORT', 'SIGNAL', f"""<button class="backlink inline">‹ All reports</button>
<div class="art">{pulse_drawing()}</div>
<h3 class="lead">A signal aimed at us</h3>
<p class="copy small">From Beacon · Beta Hydri · {d_b:.1f} ly · caught Year {Y_ARR} by the sky watch</p>
<p class="copy">Laser pulses, each brighter than Beacon itself for a billionth of a second. Its color was set for Veyra’s motion: it was meant for us.</p>
<div class="sec">WHAT IT TELLS US</div>
<dl class="facts wide"><dt>Sent</dt><dd>Year {Y_SENT:.1f}, {d_b:.1f} Years ago</dd>
<dt>They found us</dt><dd>By Year {Y_FOUND:.1f} at the latest: they saw light that left us then</dd>
<dt>What they saw</dt><dd>Perhaps our orbital solar array, built from Year 10</dd>
<dt>It carries</dt><dd>Nothing else</dd></dl>
<p class="note">It carries nothing else. Not every civilization signs its first beam.</p>
<div class="twobtn"><button class="primary ghost">Who is Beacon?</button><button class="primary">Decide how to answer</button></div>""", HUD_K1)

def beacon_drawing():
    cx, cy = 70, 44
    s = [f'<circle cx="{cx}" cy="{cy}" r="16" fill="none" stroke="{INK}" stroke-width=".7" stroke-dasharray="2 3" opacity=".6"></circle>',
         f'<circle cx="{cx}" cy="{cy}" r="10" fill="{PAPER}" stroke="{INK}" stroke-width="1.4"></circle>',
         text(cx, 84, 'swelling with age', 9, MUTED, 'middle'),
         f'<line x1="{cx + 18}" y1="{cy}" x2="318" y2="{cy}" stroke="{OTHER}" stroke-width="1.4"></line>',
         f'<path d="M318 {cy} l-7 -4 M318 {cy} l-7 4" stroke="{OTHER}" stroke-width="1.4" fill="none"></path>',
         text(200, cy - 8, f'their beam → Veyra · {d_b:.1f} ly', 9, OTHER, 'middle', 600),
         text(200, cy + 18, 'no planets found yet', 9, INK, 'middle'), text(346, 11, 'not to scale', 8, MUTED, 'end')]
    return f'<svg width="358" height="88" viewBox="0 0 358 88" font-family="IBM Plex Mono, monospace" role="img" aria-label="Beacon, an aging yellow star, and its beam toward Veyra">{"".join(s)}</svg>'

KNOCK_WHO = with_sheet(frame(2, *neighbors(select='2021', beam='2021'), panel=('SIGNALS · 1 NEW', f'YEAR {Y_ARR}', [KNOCK_ROW]), year=f'Year {Y_ARR}', res=(40, 45, '980 kt')), star_sheet(
    'Beacon', 'Beta Hydri', beacon_drawing(),
    [('Distance', f'{d_b:.1f} ly · light takes {d_b:.1f} Years <span class="rtime">{light_clock(d_b)}</span>'),
     ('Star', 'Yellow, aging, three times as bright as Delta Pavonis'), ('In our sky', 'The brightest star we see'), ('Before this', 'Nothing unusual seen')],
    [row('A signal aimed at us', f'bare knock · arrived Year {Y_ARR}', '›', 'other', marker=True)], action='Decide how to answer'))

def choice(title, sub, right, on=False, tag='', extra='', glyph=None):
    g = f'<span class="kthumb">{ICONS[glyph]}</span>' if glyph else ''
    return (f'<button class="choice{" on" if on else ""}{" drawn" if glyph else ""}" role="radio" aria-checked="{str(on).lower()}"><span class="radio"></span>{g}'
            f'<span class="pt">{tag}<b>{title}</b><span class="sub">{sub}</span>{extra}</span><span class="pd">{right}</span></button>')
KNOCK_CHOICE = f"""<div class="phone">{HUD_K2}<div class="sheet">
<div class="sh"><button class="backlink">‹ Signal</button><span class="mono kind">REACH · BEACON</span></div>
<h3 class="lead">Answer Beacon?</h3>
<p class="whyline">They know where we are. They don’t know we heard.</p>
<div role="radiogroup" class="choices">
{choice('Knock back, bare', 'Tells them we heard. Nothing more.', tstack(f'arrives in {d_b:.1f} Years', light_clock(d_b)), glyph='ans-bare')}
{choice('Knock back, with our charter', 'Adds: “Keep the lights on. Look before we speak.”', tstack(f'arrives in {d_b:.1f} Years', light_clock(d_b)), extra='<span class="warnline">The mind would argue: we lean hidden.</span>', glyph='ans-charter')}
{choice('Broadcast', 'Every star in range hears us, forever. Needs the broadcast beacon: 4 Years.', '<span class="vischip loud">Announces us</span>', glyph='ans-broadcast')}
{choice('Stay dark', 'Keep watching. They won’t know we heard.', '<span class="gy">now</span>', glyph='ans-dark')}
</div>
<p class="copy small">Earliest reply: Year {Y_REPLY:.1f}, <span class="rtime">{light_clock(2 * d_b)}</span> from now. Knocks and broadcasts can’t be taken back.</p>
{TALK}
<button class="primary" disabled>Choose an answer</button>
</div></div>"""



# ---------- First contact: the first reply, and ours ----------
# Beacon answers 0.4 Years after our knock reaches it. Three parts: who they are, a finding about Ember, a question.
Y_R_SENT = round(Y_THERE + .4, 1); Y_R_ARR = round(Y_R_SENT + d_b, 1); Y_R_NOW = round(Y_R_ARR + .1, 1)
d_be = math.dist(atlas(by_hip['2021']), atlas(by_hip['108870']))
HUD_R1, HUD_R2 = at_year((40, 45, '1,480 kt'), Y_R_ARR), at_year((40, 45, '1,480 kt'), Y_R_NOW)


def ember_lines():
    # What Beacon reports: a smooth 290 K glow. Small warm dust grains would add a silicate bump near 10 µm.
    w, h, x0, x1, y0, y1 = 330, 58, 14, 318, 46, 8
    lo, hi = math.log10(5), math.log10(25)
    X = lambda l: x0 + (math.log10(l) - lo) / (hi - lo) * (x1 - x0)
    lams = [10 ** (lo + (hi - lo) * i / 160) for i in range(161)]
    def bb(l):
        x = 14388 / (l * 290); return x ** 4 / (math.exp(x) - 1)
    peak = max(bb(l) for l in lams)
    smooth = [bb(l) / peak for l in lams]
    bump = [v + .32 * math.exp(-((l - 9.8) / 1.4) ** 2) for v, l in zip(smooth, lams)]
    top = max(bump)
    P = lambda vals: 'M' + ' L'.join(f'{fmt(X(l))},{fmt(y0 - v / top * (y0 - y1))}' for l, v in zip(lams, vals))
    s = [f'<line x1="{x0}" y1="{y0}" x2="{x1}" y2="{y0}" stroke="{INK}" stroke-width=".7"></line>',
         f'<path d="{P(bump)}" fill="none" stroke="{INK}" stroke-width=".9" stroke-dasharray="3 3" opacity=".7"></path>',
         f'<path d="{P(smooth)}" fill="none" stroke="{OTHER}" stroke-width="1.5"></path>',
         text(X(9.8), 8, 'dust would bump here', 8.5, INK, 'middle'), text(X(19.5), y0 - 24, 'what they see', 8.5, OTHER, 'middle', 600),
         text(x0, h - 1, '5 µm', 8, MUTED), text(X(10), h - 1, '10 µm', 8, MUTED, 'middle'), text(x1, h - 1, '25 µm', 8, MUTED, 'end')]
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Ember’s heat: smooth, without the bump warm dust would show">{"".join(s)}</svg>'

def part(kind, body):
    return f'<div class="part"><span class="mono pk">{kind}</span>{body}</div>'
FINDING = ('<b>Ember’s heat is smooth. Warm dust would add a bump near 10 µm.</b>' + ember_lines()
           + f'<span class="sub">Their view of Ember is {d_be - d_ember:.1f} Years older than ours.</span>'
           + '<span class="iftrue mono">If true: dust 35 · companions 15 · machines 50</span>'
           + '<button class="chip">Check it ourselves · 2 Years</button>')
REPLY_READ = tab_screen('Reach', 'REACH', 'MESSAGE', f"""<button class="backlink inline">‹ Beacon</button>
<h3 class="lead">Beacon answered</h3>
<p class="copy small">Sent Year {Y_R_SENT} · arrived Year {Y_R_ARR}</p>
<div class="voice"><span class="mono">IN THEIR VOICE, AS THE MIND READS IT</span><p>“You answered, and quickly. Good. We keep what the light brings. Ember’s warmth carries no dust. Who are you?”</p></div>
<div class="sec">WHAT TRAVELED · 3 PARTS</div>
{part('WHO THEY ARE · THEIR FOUNDING LINE', '<b>“We keep what the light brings.”</b>')}
{part('A QUESTION', '<b>“Who are you?”</b>')}
{part('A FINDING · EMBER', FINDING)}
<button class="primary">Reply</button>""", HUD_R1)

Y_OUR = round(Y_R_NOW + d_b, 1); Y_NEXT = round(Y_R_NOW + 2 * d_b, 1)
COMPOSE = f"""<div class="phone">{HUD_R2}<div class="sheet">
<div class="sh"><button class="backlink">‹ Beacon</button><span class="mono kind">REPLY</span></div>
<div class="sec">WHAT YOU WANT TO SAY</div>
<div class="intent">Thank them for Ember. Tell them who we are. Ask what else they’ve seen there. Don’t mention our probes.<i></i></div>
<div class="sec">THE MIND’S VERSION · WHAT WILL TRAVEL</div>
{part('WHO WE ARE · ANSWERS THEIR QUESTION', '<b>“Keep the lights on. Look before we speak.”</b>')}
{part('A REQUEST', '<b>“What else have you seen at Ember?”</b>')}
<ul class="left"><li><b>Thanks</b> has no part of its own. It shapes how the message reads.</li><li><b>Our probes:</b> nothing here reveals them.</li></ul>
<p class="warnline">Naming ourselves goes against our lean toward hidden.</p>
<div class="voice ours"><span class="mono">HOW BEACON WILL READ IT</span><p>“We heard you, and we thank you for Ember. We are Veyra. We keep the lights on, and we look before we speak. What else has Ember shown you?”</p></div>
<p class="copy small">Arrives Year {Y_OUR}, <span class="rtime">{light_clock(d_b)}</span> after sending. Earliest reply: Year {Y_NEXT}.</p>
{TALK}
<div class="twobtn"><button class="primary ghost">Edit</button><button class="primary">Approve and send</button></div>
</div></div>"""

# ---------- Talk it through: the mind, opt-in, with the decision pinned ----------
Y_TALK = round(Y_NOW + .1, 1)
def mini(label): return f'<button class="mini" role="radio" aria-checked="false"><span class="radio"></span>{label}</button>'
MIND_TALK = tab_screen('Mind', 'MIND', 'TALKING IT THROUGH', f"""<div class="pinned"><span class="mono">THE DECISION · FROM REACH</span><b>Answer Beacon?</b>
<div class="minis">{mini('Bare knock')}{mini('Named knock')}{mini('Broadcast')}{mini('Stay dark')}</div>
<button class="primary" disabled>Decide</button></div>
<p class="clockline">Talking since Year {Y_NOW}. The clock runs while you talk: 1 Year every <span class="rtime">00:05:00</span>.</p>
<div class="chat">
<div class="say you">What do we lose by staying dark?</div>
<div class="say mind"><span class="mono">THE MIND</span>Little they don’t already have. Beacon found us by Year {Y_FOUND:.1f}, so where we are is known. Staying dark hides one thing: that we heard.</div>
<div class="say you">What would you do?</div>
<div class="say mind"><span class="mono">ITS VIEW · FROM OUR CHARTER AND DIALS</span>Our charter says to look before we speak. They looked, and spoke first. I would knock back, bare. Our name can wait until we know theirs.<span class="dials">leans hidden · leans cautious</span></div>
</div>
<div class="ask"><span>Ask the mind…</span><button aria-label="Send">↑</button></div>""", at_year((40, 45, '980 kt'), Y_TALK))

# ---------- Checking a claim: Beacon said Ember's heat is smooth. We look for ourselves. ----------
Y_CK0, Y_CK1 = Y_R_NOW, round(Y_R_NOW + 2, 1)
HUD_C0, HUD_C1 = at_year((45, 55, '1,480 kt'), Y_CK0), at_year((40, 45, '1,560 kt'), Y_CK1)
def ember_compare(ours_bump):
    # Their claim (smooth, amber) against our own measurement (blue), with or without the silicate bump near 10 µm.
    w, h, x0, x1, y0, y1 = 358, 96, 16, 342, 72, 20
    lo, hi = math.log10(5), math.log10(25)
    X = lambda l: x0 + (math.log10(l) - lo) / (hi - lo) * (x1 - x0)
    lams = [10 ** (lo + (hi - lo) * i / 160) for i in range(161)]
    bb = lambda l: (lambda x: x ** 4 / (math.exp(x) - 1))(14388 / (l * 290))
    peak = max(bb(l) for l in lams)
    smooth = [bb(l) / peak for l in lams]
    bump = [v + .32 * math.exp(-((l - 9.8) / 1.4) ** 2) for v, l in zip(smooth, lams)]
    top = max(bump)
    P = lambda vals: 'M' + ' L'.join(f'{fmt(X(l))},{fmt(y0 - v / top * (y0 - y1))}' for l, v in zip(lams, vals))
    s = [f'<line x1="{x0}" y1="{y0}" x2="{x1}" y2="{y0}" stroke="{INK}" stroke-width=".7"></line>',
         f'<path d="{P(smooth)}" fill="none" stroke="{OTHER}" stroke-width="1.4" stroke-dasharray="5 3"></path>',
         f'<path d="{P(bump if ours_bump else smooth)}" fill="none" stroke="{YOU}" stroke-width="1.6"{"" if ours_bump else " opacity=\".8\""}></path>',
         text(x0, 12, 'their claim', 9, OTHER, 'start', 600), text(x0 + 84, 12, 'our measurement', 9, YOU, 'start', 600),
         f'<line x1="{x0 + 62}" y1="9" x2="{x0 + 78}" y2="9" stroke="{OTHER}" stroke-width="1.4" stroke-dasharray="5 3"></line>',
         f'<line x1="{x0 + 174}" y1="9" x2="{x0 + 190}" y2="9" stroke="{YOU}" stroke-width="1.6"></line>',
         text(x0, h - 8, '5 µm', 8.5, MUTED), text(X(10), h - 8, '10 µm', 8.5, MUTED, 'middle'), text(x1, h - 8, '25 µm', 8.5, MUTED, 'end')]
    if ours_bump: s.append(text(X(9.8) - 4, y0 - 12, '↑ the bump they said wasn’t there', 8.5, YOU, 'start'))
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Ember’s heat: their claim against our own measurement">{"".join(s)}</svg>'

CHECK_START = f"""<div class="phone">{HUD_C0}<div class="sheet">
<div class="sh"><button class="backlink">‹ Message</button><span class="mono kind">KNOW · CHECK A CLAIM</span></div>
<h3 class="lead">Check Beacon’s claim</h3>
<p class="whyline">A lie reads exactly like the truth. Only measuring it ourselves can tell them apart.</p>
{part('THEIR CLAIM', '<b>Ember’s heat is smooth. Warm dust would add a bump near 10 µm.</b>')}
<div class="sec">HOW</div>
<p class="copy">Point our space telescope at Ember and read its heat, color by color.</p>
<div class="sec">USES EACH YEAR</div>
{share('Energy', 5)}{share('Compute', 10)}
<div class="sec">TIME</div>
<div class="pile"><b>2 Years</b><span>result in the Report, <span class="rtime">00:10:00</span> from now</span></div>
<p class="copy small">Our view of Ember is {d_ember:.1f} Years old; theirs was {d_be:.1f}. The two measurements see Ember at different moments.</p>
<button class="primary">Start · done in 00:10:00</button>
</div></div>"""

CHECK_HOLDS = tab_screen('Report', 'REPORT', 'RESULT', f"""<button class="backlink inline">‹ All reports</button>
<div class="art">{ember_compare(False)}</div>
<h3 class="lead">Beacon’s claim holds</h3>
<p class="copy small">Checked Year {Y_CK1} with our space telescope</p>
<p class="copy">Our measurement matches theirs: Ember’s heat is smooth, with no dust bump. What they told us was true.</p>
<div class="sec">WHAT IT COULD BE · BEFORE → NOW</div>
{odds('Dust from a collision', 55, 35)}{odds('Cold companions', 35, 15)}{odds('Waste heat from machines', 10, 50)}
<div class="sec">BEACON’S RECORD</div>
<div class="pile"><b>1 of 1</b><span>claims checked have held</span></div>
<p class="note">One true claim doesn’t prove the next one.</p>""", HUD_C1)

CHECK_FAILS = tab_screen('Report', 'REPORT', 'RESULT', f"""<button class="backlink inline">‹ All reports</button>
<div class="art">{ember_compare(True)}</div>
<h3 class="lead">Beacon’s claim doesn’t hold</h3>
<p class="copy small">Checked Year {Y_CK1} with our space telescope</p>
<p class="copy">We see the dust bump they said wasn’t there. Ember’s odds don’t change.</p>
<div class="sec">WHY THE DIFFERENCE · ODDS</div>
<div class="oddswide">{odds_now('They told us something false', 55)}{odds_now('Fresh dust since they measured', 25)}{odds_now('Their instrument missed it', 12)}{odds_now('Our measurement is off', 8)}</div>
<p class="copy small">Their measurement is {d_be - d_ember:.1f} Years older than ours, and fresh dust can appear within months: astronomers watched it happen at the star ID8.</p>
<div class="sec">WHAT NOW</div>
<div role="radiogroup" class="choices">
{choice('Say nothing, keep watching', 'They won’t know we checked.', '<span class="gy">now</span>')}
{choice('Ask Beacon about it', 'Also tells them we checked.', tstack(f'answer by Year {Y_CK1 + 2 * d_b:.1f}', light_clock(2 * d_b)))}
</div>
{TALK}""", HUD_C1)

def ledger(rows): return '<dl class="facts wide ledger">' + ''.join(f'<dt>{k}</dt><dd>{v}</dd>' for k, v in rows) + '</dl>'
DOSSIER = tab_screen('Reach', 'REACH', 'BEACON', f"""<button class="backlink inline">‹ Conversation</button>
<h3 class="lead">What we know, both ways</h3>
<p class="copy small">Beacon · Beta Hydri · {d_b:.1f} ly · as of Year {Y_CK1}</p>
<div class="sec">WHAT WE KNOW ABOUT THEM</div>
{ledger([('Found us', f'By Year {Y_FOUND:.1f} at the latest'), ('First spoke', f'Year {Y_SENT:.1f}, a bare knock'), ('Answered us', '0.4 Years after our knock arrived'),
         ('Founding line', '“We keep what the light brings.”'), ('Claims checked', '1: contradicted, about Ember’s dust')])}
<div class="sec">WHAT THEY KNOW ABOUT US</div>
{ledger([('Where we are', f'Since Year {Y_FOUND:.1f} or earlier'), ('That we heard', f'Since Year {Y_THERE:.1f}'),
         ('Our founding line', f'From Year {Y_R_NOW + d_b:.1f}, when our reply lands'), ('That we checked', 'Only if we tell them')])}
<p class="note">Everything here comes from light and messages. Nothing about them is certain.</p>""", HUD_C1)

# ---------- Conversations between worlds: each message is a transmission ----------
# Every civilization has a signature: its first pulses, drawn as a radial map, like the Voyager plaque's pulsar map.
def sigil(seed, color, cx, cy, r, n=15):
    rng = random.Random(seed); s = [f'<circle cx="{fmt(cx)}" cy="{fmt(cy)}" r="{fmt(r * .07)}" fill="none" stroke="{color}" stroke-width="1.2"></circle>']
    for i in range(n):
        a = 2 * math.pi * i / n + rng.random() * .25; L = r * (.35 + rng.random() * .65)
        x2, y2 = cx + L * math.cos(a), cy + L * math.sin(a)
        s.append(f'<line x1="{fmt(cx + r * .1 * math.cos(a))}" y1="{fmt(cy + r * .1 * math.sin(a))}" x2="{fmt(x2)}" y2="{fmt(y2)}" stroke="{color}" stroke-width=".9"></line>')
        for k in range(1, 6):          # ticks along the line: the pulse timing, in binary
            if rng.random() < .5: continue
            t = .2 + k * .14; px, py = cx + L * t * math.cos(a), cy + L * t * math.sin(a); nx, ny = -math.sin(a) * r * .035, math.cos(a) * r * .035
            s.append(f'<line x1="{fmt(px - nx)}" y1="{fmt(py - ny)}" x2="{fmt(px + nx)}" y2="{fmt(py + ny)}" stroke="{color}" stroke-width=".9"></line>')
    return ''.join(s)
def sigil_svg(seed, color, size, label):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 {size} {size}" role="img" aria-label="{label}">{sigil(seed, color, size / 2, size / 2, size * .46)}</svg>'
BEACON_SEED, VEYRA_SEED = 2021, 99240
VOICE = '“You answered, and quickly. Good. We keep what the light brings. Ember’s warmth carries no dust. Who are you?”'

RECEPTION = f"""<div class="phone cine"><div class="cinetop"><span>Veyra</span><span class="mono">Year {Y_R_ARR}</span></div>
<svg width="390" height="300" viewBox="0 0 390 300" role="img" aria-label="Beacon’s signature">{stipple(52, 70, 390, 300)}{sigil(BEACON_SEED, OTHER, 195, 150, 118)}</svg>
<div class="cinetext"><span class="mono kick">BEACON SPEAKS · {d_b:.1f} LIGHT-YEARS</span>
<h3>“You answered, and quickly. Good.”</h3>
<p class="inscr">“We keep what the light brings. Ember’s warmth carries no dust. Who are you?”</p>
<p>Sent Year {Y_R_SENT}. It crossed the dark for {d_b:.1f} Years to reach us.</p>
<div class="cinebtn"><button class="light">Read what it carried</button><button class="ghostlight">Later</button></div></div></div>"""

REPLY_READ = tab_screen('Reach', 'REACH', 'MESSAGE', f"""<button class="backlink inline">‹ Beacon</button>
<div class="speech"><div class="speaker">{sigil_svg(BEACON_SEED, OTHER, 44, 'Beacon’s signature')}<span><b>Beacon</b><span class="mono">SENT YEAR {Y_R_SENT} · ARRIVED YEAR {Y_R_ARR}</span></span></div>
<p class="big">{VOICE}</p>
<p class="untr">One of their words has no match in ours. The mind renders it “keep”: to hold, and to guard, at once.</p></div>
<div class="sec">WHAT IT CARRIED</div>
{part('WHO THEY ARE · THEIR FOUNDING LINE', '<b class="inscribed">“We keep what the light brings.”</b>')}
{part('A QUESTION', '<b>“Who are you?”</b>')}
{part('A FINDING · EMBER', '<b>Ember’s heat is smooth: no dust bump near 10 µm.</b><span class="iftrue mono">If true: dust 35 · companions 15 · machines 50</span><button class="chip">See the finding, and check it ›</button>')}
<button class="primary">Reply</button>""", HUD_R1)

def sent_sky():
    s = [f'<rect width="390" height="380" fill="{PAPER}"></rect>', stipple(61, 150, 390, 380)]
    vx, vy, bx, by = 70, 300, 318, 84
    frac = .16; ex, ey = vx + (bx - vx) * frac, vy + (by - vy) * frac
    s.append(f'<line x1="{vx}" y1="{vy}" x2="{bx}" y2="{by}" stroke="{INK}" stroke-width=".7" stroke-dasharray="2 5" opacity=".5"></line>')
    s.append(f'<line x1="{vx}" y1="{vy}" x2="{fmt(ex)}" y2="{fmt(ey)}" stroke="{YOU}" stroke-width="2"></line><circle cx="{fmt(ex)}" cy="{fmt(ey)}" r="4" fill="{YOU}"></circle>')
    s.append(sigil(VEYRA_SEED, YOU, vx, vy, 44))
    s.append(text(vx, vy + 62, 'Veyra', 11, YOU, 'middle', 600))
    s.append(f'<circle cx="{bx}" cy="{by}" r="6" fill="{PAPER}" stroke="{OTHER}" stroke-width="1.5"></circle><path d="M{bx - 16} {by} H{bx + 16} M{bx} {by - 16} V{by + 16}" stroke="{OTHER}" stroke-width=".9"></path>')
    s.append(text(bx, by - 26, 'Beacon', 11, OTHER, 'middle', 600))
    s.append(text((vx + bx) / 2 + 20, (vy + by) / 2 + 26, f'{d_b:.1f} light-years', 10, MUTED, 'start'))
    s.append(text((vx + bx) / 2 + 20, (vy + by) / 2 + 40, f'arrives Year {Y_OUR}', 10, YOU, 'start', 600))
    return f'<svg width="390" height="380" viewBox="0 0 390 380" font-family="IBM Plex Mono, monospace" role="img" aria-label="Our reply leaving Veyra for Beacon">{"".join(s)}</svg>'
SENT_CINE = f"""<div class="phone cine"><div class="cinetop"><span>Veyra</span><span class="mono">Year {Y_R_NOW}</span></div>{sent_sky()}
<div class="cinetext"><span class="mono kick">SENT</span><h3>It’s on its way.</h3>
<p>It reaches Beacon in Year {Y_OUR}, and can’t be recalled.</p><p>By the time it arrives, we will have changed. So will they.</p>
<div class="cinebtn"><button class="light">Back to the conversation</button></div></div></div>"""

def gulf(flying='our reply, in flight'):
    w, h = 358, 150; vx, bx, y = 44, 316, 70
    s = [stipple(71, 60, w, h), f'<line x1="{vx + 26}" y1="{y}" x2="{bx - 22}" y2="{y}" stroke="{INK}" stroke-width=".8" stroke-dasharray="2 4"></line>']
    for k in range(1, 10):
        x = vx + 26 + (bx - 22 - vx - 26) * k / d_b
        s.append(f'<line x1="{fmt(x)}" y1="{y - 3}" x2="{fmt(x)}" y2="{y + 3}" stroke="{INK}" stroke-width=".7" opacity=".6"></line>')
    s.append(text((vx + bx) / 2, y + 20, f'{d_b:.1f} ly · 1 tick = 1 Year of travel', 9, MUTED, 'middle'))
    # Veyra: our world in line. Beacon: its star, and the orbit its beam came from.
    s.append(f'<circle cx="{vx}" cy="{y}" r="22" fill="{PAPER}" stroke="{INK}" stroke-width="1.3"></circle><path d="M{vx - 16} {y - 6} q10 -8 20 0 q6 5 12 1 M{vx - 18} {y + 8} q12 6 22 -2" fill="none" stroke="{INK}" stroke-width=".8"></path>')
    s.append(text(vx, y + 40, 'Veyra', 10, YOU, 'middle', 600))
    s.append(f'<ellipse cx="{bx}" cy="{y}" rx="30" ry="10" fill="none" stroke="{OTHER}" stroke-width=".8" stroke-dasharray="3 3"></ellipse><circle cx="{bx}" cy="{y}" r="8" fill="{PAPER}" stroke="{OTHER}" stroke-width="1.4"></circle>')
    s.append(f'<circle cx="{bx - 30}" cy="{y}" r="3" fill="{PAPER}" stroke="{OTHER}" stroke-width="1.2"></circle>' + text(bx - 30, y - 12, '?', 10, OTHER, 'middle', 600))
    s.append(text(bx, y + 40, 'Beacon', 10, OTHER, 'middle', 600))
    fx = vx + 26 + (bx - 22 - vx - 26) * .01
    s.append(f'<circle cx="{fmt(fx + 6)}" cy="{y}" r="4" fill="{YOU}"></circle>' + text(fx + 6, y - 12, flying, 9, YOU, 'start', 600))
    return f'<svg width="{w}" height="{h - 44}" viewBox="0 14 {w} {h - 44}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Veyra and Beacon, 9.3 light-years apart, with our reply in flight">{"".join(s)}</svg>'

def ent(side, year, title, line, extra=''):
    return f'<div class="ent {side}"><span class="y mono">Year {year}</span><span class="t"><b>{title}</b><span>{line}</span>{extra}</span></div>'
def gap(line): return f'<div class="gapline">{line}</div>'
GULF = tab_screen('Reach', 'REACH', 'BEACON', f"""<button class="backlink inline">‹ Conversations</button>
<div class="art gulfart">{gulf()}</div>
<div class="sec">THE EXCHANGE</div>
{ent('them', f'{Y_SENT:.1f}', 'Beacon knocked', 'A bare pulse, aimed at us.')}
{gap(f'{d_b:.1f} Years in flight')}
{ent('us', Y_NOW, 'We knocked back', 'Bare.')}
{gap(f'{d_b:.1f} Years to reach them. They answered 0.4 Years later.')}
{ent('them', Y_R_SENT, 'Beacon spoke', '“We keep what the light brings.”')}
{gap(f'{d_b:.1f} Years in flight. Meanwhile, our orbital foundry began.')}
{ent('us live', Y_R_NOW, 'We answered', '“We are Veyra. We keep the lights on…”', f'<span class="fly mono">in flight · arrives Year {Y_OUR} · {light_clock(d_b)}</span>')}
<div class="sec">WHAT WE KNOW OF THEM</div>
{row('Their beam came from beside the star', 'about 1.9 AU out: where a living world could be', '›', 'other', marker=True)}
<div class="sec">WHAT THIS HAS CHANGED IN US</div>
<p class="copy small">Leans hidden, 62 → 58. Speaking with them has opened us a little.</p>""", HUD_R2)

# The knock's Sent screen, as the same conversation view: one message each way so far.
KNOCK_SENT = tab_screen('Reach', 'REACH', 'BEACON', f"""<button class="backlink inline">‹ Conversations</button>
<div class="art gulfart">{gulf('our knock, in flight')}</div>
<div class="sec">THE EXCHANGE</div>
{ent('them', f'{Y_SENT:.1f}', 'Beacon knocked', 'A bare pulse, aimed at us.')}
{gap(f'{d_b:.1f} Years in flight')}
{ent('us live', Y_NOW, 'We knocked back', 'Bare.', f'<span class="fly mono">in flight · arrives Year {Y_THERE:.1f} · {light_clock(d_b)}</span>')}
{gap(f'Earliest reply: Year {Y_REPLY:.1f}, <span class="rtime">{light_clock(2 * d_b)}</span> from now')}
<div class="sec">WHAT WE KNOW OF THEM</div>
{row('Their beam came from beside the star', 'about 1.9 AU out: where a living world could be', '›', 'other', marker=True)}
<div class="sec">STANDING ORDERS</div>
{row('If Beacon answers while you are away', 'the mind waits for you before replying', '›')}""", HUD_K2)

# ---------- Their world, as we know it: a portrait that fills in with each message ----------
# Solid lines are measured, dashed are inferred, a question mark is not yet seen.
def portrait():
    w, h, cx, cy, k = 358, 262, 179, 138, 42          # 42 px per AU; the orbital plane seen tilted
    tilt = .42
    s = [stipple(83, 70, w, h)]
    s.append(f'<defs><path id="ring" d="M{cx - 124},{cy} A124,124 0 0,1 {cx + 124},{cy}"></path></defs>')
    s.append(f'<text font-size="9.5" letter-spacing="3.5" fill="{OTHER}" text-anchor="middle"><textPath href="#ring" startOffset="50%">WE KEEP WHAT THE LIGHT BRINGS</textPath></text>')
    for au, o in ((1.5, .45), (2.4, .45)):
        s.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{au * k}" ry="{fmt(au * k * tilt)}" fill="none" stroke="{INK}" stroke-width=".7" stroke-dasharray="2 4" opacity="{o}"></ellipse>')
    s.append(text(cx + 2.4 * k + 4, cy + 4, 'temperate zone', 8.5, MUTED))
    s.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{1.9 * k}" ry="{fmt(1.9 * k * tilt)}" fill="none" stroke="{OTHER}" stroke-width="1" stroke-dasharray="4 3"></ellipse>')
    s.append(f'<circle cx="{cx}" cy="{cy}" r="11" fill="{PAPER}" stroke="{INK}" stroke-width="1.4"></circle><circle cx="{cx}" cy="{cy}" r="17" fill="none" stroke="{INK}" stroke-width=".6" stroke-dasharray="2 3"></circle>')
    a = math.radians(205); ox, oy = cx + 1.9 * k * math.cos(a), cy + 1.9 * k * tilt * math.sin(a)
    s.append(f'<circle cx="{fmt(ox)}" cy="{fmt(oy)}" r="9" fill="none" stroke="{OTHER}" stroke-width="1" stroke-dasharray="2 2"></circle><circle cx="{fmt(ox)}" cy="{fmt(oy)}" r="2.6" fill="{OTHER}"></circle>')
    s.append(text(ox, oy - 14, '?', 11, OTHER, 'middle', 600))
    s.append(text(ox - 12, oy + 22, 'their beam came from here', 8.5, OTHER, 'middle'))
    s.append(f'<line x1="{fmt(ox - 4)}" y1="{fmt(oy + 4)}" x2="22" y2="{h - 22}" stroke="{OTHER}" stroke-width="1.2"></line><path d="M22 {h - 22} l3 -8 M22 {h - 22} l8 -3" stroke="{OTHER}" stroke-width="1.2" fill="none"></path>')
    s.append(text(30, h - 8, f'to Veyra · {d_b:.1f} ly', 8.5, OTHER, 'start', 600))
    s.append(text(cx, cy + 32, 'Beacon', 10, INK, 'middle', 600))
    s.append(text(w - 8, h - 8, '1 AU', 8.5, MUTED, 'end') + f'<line x1="{w - 8 - k}" y1="{h - 20}" x2="{w - 8}" y2="{h - 20}" stroke="{INK}" stroke-width="1"></line>')
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Beacon’s system as we know it: the star, its temperate zone, and where their beam came from">{"".join(s)}</svg>'

def learned(year, what, source):
    return f'<div class="ent them"><span class="y mono">Year {year}</span><span class="t"><b>{what}</b><span>{source}</span></span></div>'
PORTRAIT = tab_screen('Reach', 'REACH', 'BEACON', f"""<button class="backlink inline">‹ Conversation</button>
<div class="art">{portrait()}</div>
<p class="legend mono">solid: measured · dashed: inferred · ?: not yet seen</p>
<div class="sec">HOW IT FILLED IN</div>
{learned(Y_ARR, 'They exist, and found us', 'The knock. Its beam came from about 1.9 AU out.')}
{learned(Y_R_ARR, 'Their founding line; they measure heat as finely as we do', 'Their reply, and their finding about Ember.')}
{learned(Y_CK1, 'One claim of theirs contradicted', 'Our own measurement of Ember.')}
<div class="sec">NOT YET KNOWN</div>
<p class="copy small">Their world itself. How many they are. How far they reach. Whether anyone else hears them.</p>""", HUD_C1)

# ---------- Reach: sending a probe ----------
# Year 118: the launcher and the flyby probe line are built. A targeted probe takes 12 Years to build and launch,
# then flies at a tenth of light speed (10 Years per light-year), passes its star without stopping, and beams
# its report home at light speed.
REACH_EMPTY = tab_screen('Reach', 'REACH', 'BEYOND VEYRA', '''<div class="empty"><svg width="120" height="90" viewBox="0 0 120 90" aria-hidden="true"><circle cx="60" cy="45" r="6" fill="#1F7A96"></circle><circle cx="60" cy="45" r="30" fill="none" stroke="#171716" stroke-dasharray="3 4" opacity=".5"></circle><circle cx="60" cy="45" r="44" fill="none" stroke="#171716" stroke-dasharray="2 5" opacity=".3"></circle></svg>
<strong>Nothing beyond Veyra yet</strong><span>Conversations, probes, outposts and colonies appear here. Far ones act on their own: your orders reach them at light speed.</span></div>
<div class="sec">STANDING ORDERS · 0</div>''' + row('Add an order', 'e.g. if anything knocks while I am away, tell me at once', '+'), HUD)

Y_PB = 118.0; P_BUILD, P_SPEED = CAT['assay-probe']['years'], 10   # 12 Years to build; 10 Years per light-year
HUD_P0 = at_year((35, 40, '5,200 kt'), Y_PB)
def trip(hip):
    d = math.dist(atlas(by_hip[hip]), HOME) if hip != 'sol' else math.dist(HOME, (0, 0, 0))
    launch = Y_PB + P_BUILD; arrive = launch + P_SPEED * d; report = arrive + d
    return d, launch, arrive, report
TARGETS = [('106440', 'Gliese 832', 'nothing unusual seen', ''), ('108870', 'Ember', 'new warm glow', 'other'),
           ('2021', 'Beacon', 'in conversation with us', 'other'), ('99461', 'Lantern', 'regular dimming', 'other'), ('sol', 'Twin', 'oxygen world', 'other')]
def target_card(hip, name, note, tone, on=False):
    d, launch, arrive, report = trip(hip)
    return (f'<button class="choice{" on" if on else ""}" role="radio" aria-checked="{str(on).lower()}"><span class="radio"></span>'
            f'<span class="pt"><b>{name}</b><span class="sub">{d:.1f} ly · <span class="{tone}">{note}</span></span>'
            f'<span class="sub">arrives Year {arrive:.0f} · report Year {report:.0f}</span></span>'
            f'<span class="pd">{tstack(f"{report - Y_PB:.0f} Years", clock((report - Y_PB) * 5))}</span></button>')
def targets_drawing():
    # Every target on one line, placed by its real distance from Veyra.
    x0, px, y = 22, 16, 44
    s = [f'<line x1="{x0}" y1="{y}" x2="{x0 + 20.5 * px}" y2="{y}" stroke="{INK}" stroke-width=".6" stroke-dasharray="1 3"></line>']
    for ly in (5, 10, 15, 20):
        s.append(f'<line x1="{x0 + ly * px}" y1="{y + 22}" x2="{x0 + ly * px}" y2="{y + 26}" stroke="{MUTED}" stroke-width=".6"></line>' + text(x0 + ly * px, y + 35, f'{ly} ly', 8, MUTED, 'middle'))
    s.append(f'<line x1="{x0}" y1="{y + 24}" x2="{x0 + 20 * px}" y2="{y + 24}" stroke="{MUTED}" stroke-width=".6"></line>')
    s.append(f'<circle cx="{x0}" cy="{y}" r="4.5" fill="{YOU}"></circle>' + text(x0 - 4, y - 10, 'Veyra', 9, YOU))
    # (label above or below, anchor) per target, so the close ones never collide
    place = {'Gliese 832': (-1, 'end'), 'Ember': (-1, 'start'), 'Beacon': (1, 'end'), 'Lantern': (1, 'start'), 'Twin': (-1, 'end')}
    for hip, name, note, tone in TARGETS:
        d = trip(hip)[0]; x = x0 + d * px; col = OTHER if tone else INK
        side, anchor = place[name]; ly = y + side * 14
        s.append(f'<line x1="{fmt(x)}" y1="{y}" x2="{fmt(x)}" y2="{ly - (3 if side < 0 else -3)}" stroke="{col}" stroke-width=".6"></line>')
        s.append(f'<circle cx="{fmt(x)}" cy="{y}" r="2.6" fill="{PAPER}" stroke="{col}" stroke-width="1.2"></circle>')
        s.append(text(x + (-3 if anchor == 'end' else 3), ly + (0 if side < 0 else 7), name, 9, col, anchor))
    return f'<svg width="358" height="84" viewBox="0 0 358 84" font-family="IBM Plex Mono, monospace" role="img" aria-label="The five targets placed by distance from Veyra, from Gliese 832 at 7.4 light-years to Twin at 19.9">{"".join(s)}</svg>'

PROBE_PICK = f"""<div class="phone">{HUD_P0}<div class="sheet">
<div class="sh"><strong>Send a probe</strong><button aria-label="Close">×</button></div>
<p class="copy">A flyby probe flies past its star at a tenth of light speed, looks, and beams home what it saw. Times below run from now to its report.</p>
<div class="art">{targets_drawing()}</div>
<div class="sec">WHERE TO · NEAREST FIRST</div>
<div role="radiogroup" class="choices">{''.join(target_card(*t) for t in TARGETS)}</div>
<p class="copy small">Each takes {P_BUILD} Years to build and launch, then 10 Years per light-year in flight. Its report crosses back at light speed.</p>
</div></div>"""

def probe_drawing():
    s = [stipple(95, 40, 358, 130)]
    cx, cy = 150, 60
    s.append(f'<circle cx="{cx}" cy="{cy}" r="42" fill="none" stroke="{INK}" stroke-width="1.2"></circle><circle cx="{cx}" cy="{cy}" r="30" fill="none" stroke="{INK}" stroke-width=".5" opacity=".4"></circle>')
    for a in range(0, 360, 45):
        r = math.radians(a); s.append(f'<line x1="{fmt(cx + 8 * math.cos(r))}" y1="{fmt(cy + 8 * math.sin(r))}" x2="{fmt(cx + 42 * math.cos(r))}" y2="{fmt(cy + 42 * math.sin(r))}" stroke="{INK}" stroke-width=".5" opacity=".5"></line>')
    s.append(f'<line x1="{cx + 42}" y1="{cy}" x2="{cx + 86}" y2="{cy}" stroke="{INK}" stroke-width=".8"></line><rect x="{cx + 86}" y="{cy - 7}" width="16" height="14" fill="{PAPER}" stroke="{INK}" stroke-width="1.1"></rect>')
    s.append(f'<path d="M{cx + 110} {cy} H{cx + 190}" stroke="{YOU}" stroke-width="1.2" stroke-dasharray="4 3"></path><path d="M{cx + 190} {cy} l-6 -4 M{cx + 190} {cy} l-6 4" stroke="{YOU}" stroke-width="1.2" fill="none"></path>')
    s.append(text(cx + 150, cy - 10, 'a tenth of light speed', 9, YOU, 'middle'))
    s.append(text(cx, cy + 60, 'sail and a small body of instruments', 9, MUTED, 'middle') + text(346, 124, 'not to scale', 8, MUTED, 'end'))
    return f'<svg width="358" height="130" viewBox="0 0 358 130" font-family="IBM Plex Mono, monospace" role="img" aria-label="A flyby probe: a sail and a small instrument body">{"".join(s)}</svg>'

def journey(hip, now=None, compact=False):
    d, launch, arrive, report = trip(hip); now = now or Y_PB
    total = report - Y_PB
    legs = [('Build and launch', P_BUILD, Y_PB, launch, 'var(--fill2)'), ('Flight', arrive - launch, launch, arrive, 'var(--you)'), ('Report crosses back', d, arrive, report, 'var(--other)')]
    bars = ''.join(f'<span class="jseg" style="width:{w / total * 100:.2f}%;background:{c}"></span>' for _, w, _, _, c in legs)
    nowmark = f'<span class="jnow" style="left:{(now - Y_PB) / total * 100:.2f}%"></span>' if now > Y_PB else ''
    rows = ''.join(f'<div class="jleg"><i style="background:{c}"></i><span>{n}</span><span class="mono">Year {y0:.0f} → {y1:.0f}</span><span class="rtime">{clock(w * 5)}</span></div>' for n, w, y0, y1, c in legs)
    return f'<div class="journey{" compact" if compact else ""}"><div class="jbar">{bars}{nowmark}</div>{"" if compact else rows}</div>'

d_e, L_e, A_e, R_e = trip('108870')
at_ = CAT['assay-probe']; to_ = dict(DISC['assay-to'], name='Send a flyby probe to Ember')
PROBE_CONFIRM = f"""<div class="phone">{HUD_P0}<div class="sheet">
<div class="sh"><button class="backlink">‹ Where to</button><span class="mono kind">REACH · PROBE</span></div>
<div class="art">{probe_drawing()}</div>
<h3 class="lead">{to_['name']}</h3>
<p class="whyline">It passes Ember at a tenth of light speed, crossing its inner system in hours: pictures, heat and air, up close. It can’t stop.</p>
<div class="sec">THE JOURNEY</div>
{journey('108870')}
<p class="copy small">We learn what it saw in Year {R_e:.0f}, <span class="rtime">{clock((R_e - Y_PB) * 5)}</span> from now.</p>
<div class="sec">WHO COULD SEE IT</div>
<p class="copy small">The launch is bright behind it and dark ahead: Ember sees nothing leave. In flight it is cold and nearly invisible. Its report is a narrow beam, aimed home.</p>
<div class="sec">USES</div>
<p class="copy small mono">{cost_short(to_)} · can’t be recalled after launch</p>
{TALK}
<button class="primary">Build and launch</button>
</div></div>"""

Y_PF = 176.0
PROBE_FLIGHT = tab_screen('Reach', 'REACH', '1 PROBE · 1 CONVERSATION', f"""<div class="sec">PROBES</div>
<div class="probecard"><span class="thumb">{ICONS['probe']}</span><span class="pt"><b>Flyby probe → Ember</b>
<span class="sub">launched Year {L_e:.0f} · at a tenth of light speed · {(Y_PF - L_e) * .1:.1f} ly out of {d_e:.1f}</span></span>
<span class="pd">{tstack(f'report in {R_e - Y_PF:.0f} Years', clock((R_e - Y_PF) * 5), True)}</span></div>
{journey('108870', Y_PF, True)}
<p class="copy small">It passes Ember in Year {A_e:.0f}. We learn what it saw in Year {R_e:.0f}, when its report crosses back.</p>
<div class="sec">CONVERSATIONS</div>
{row('Beacon', 'the conversation continues · their last message, Year 169', '›', 'other', marker=True)}
<div class="sec">STANDING ORDERS</div>
{row('If the probe finds anything unnatural', 'tell me at once, wherever I am', '›')}
{row('Add an order', 'e.g. if anything knocks while I am away, tell me at once', '+')}""", at_year((20, 25, '1,480 kt'), Y_PF))

PROBE_MAP = frame(2, *neighbors(probe=('108870', (Y_PF - L_e) / (A_e - L_e), 'flyby probe')), panel=('IN FLIGHT · 1', f'YEAR {Y_PF:.0f}', [
    row('Flyby probe → Ember', f'{(Y_PF - L_e) * .1:.1f} of {d_e:.1f} ly', tstack(f'{R_e - Y_PF:.0f} Years', clock((R_e - Y_PF) * 5), True), bar=round((Y_PF - Y_PB) / (R_e - Y_PB) * 100)),
    row('New warm glow · Ember', 'the probe will pass it', '›', 'other', marker=True),
    row('Uneven dimming · Lantern', 'dust, bodies in orbit, or structures', '›', 'other', marker=True)]), year=f'Year {Y_PF:.0f}', res=(20, 25, '1,480 kt'))

# ---------- The probe reports: our first close look at another system ----------
# Year 231: the flyby was in Year 222, and its report has crossed 9.2 light-years home. The glow was a swarm:
# countless flat collectors in a band half an AU out, together catching about 1.5% of Ember's light, the same
# fraction as the heat excess we measured. Ember's light reached Earth's telescopes of 2026 before any of this began.
def flyby(w, h, cx, cy, k, labels=True, seed=7, path=True):
    rng = random.Random(seed); s = [stipple(seed + 90, 50, w, h)]
    tilt = .4
    for i in range(420):            # the band: short flat bodies, edge-on to us as they turn
        a = rng.random() * 2 * math.pi; r = .5 * k * (1 + (rng.random() - .5) * .16)
        x, y = cx + r * math.cos(a), cy + r * tilt * math.sin(a); L = 1.2 + rng.random() * 2.2; t = a + math.pi / 2
        s.append(f'<line x1="{fmt(x - L * math.cos(t) / 2)}" y1="{fmt(y - L * tilt * math.sin(t) / 2)}" x2="{fmt(x + L * math.cos(t) / 2)}" y2="{fmt(y + L * tilt * math.sin(t) / 2)}" stroke="{OTHER}" stroke-width="1" opacity="{fmt(.45 + rng.random() * .5)}"></line>')
    s.append(f'<circle cx="{cx}" cy="{cy}" r="{fmt(k * .06)}" fill="{PAPER}" stroke="{INK}" stroke-width="1.4"></circle>')
    # Our probe's straight path, passing 0.3 AU from the star.
    x0, y0, x1, y1 = cx - k * 1.5, cy + k * .62, cx + k * 1.5, cy - k * .38
    if path:
        s.append(f'<line x1="{fmt(x0)}" y1="{fmt(y0)}" x2="{fmt(x1)}" y2="{fmt(y1)}" stroke="{YOU}" stroke-width="1.5" stroke-dasharray="6 4"></line>')
        s.append(f'<path d="M{fmt(x1)} {fmt(y1)} l-9 1 M{fmt(x1)} {fmt(y1)} l-5 7" stroke="{YOU}" stroke-width="1.5" fill="none"></path>')
    if labels:
        s.append(text(cx, cy - k * .5 * tilt - 10, 'the band · half an AU out', 9, OTHER, 'middle', 600))
        lx = min(x1, w - 8); s.append(text(lx - 4, cy - k * .38 * (lx - cx) / (k * 1.5) + 18, 'our probe · 2 hours across', 9, YOU, 'end', 600))
        s.append(text(cx, cy + k * .06 + 14, 'Ember', 10, INK, 'middle', 600))
        s.append(text(w - 8, 14, 'cold giant planet, far out →', 8.5, MUTED, 'end'))
        s.append(f'<line x1="{w - 8 - k * .5}" y1="{h - 14}" x2="{w - 8}" y2="{h - 14}" stroke="{INK}" stroke-width="1"></line>' + text(w - 8, h - 4, '0.5 AU', 8.5, MUTED, 'end'))
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Ember, ringed by a band of flat bodies, with our probe’s path through the system">{"".join(s)}</svg>'

HUD_F = at_year((20, 25, '2,400 kt'), round(R_e, 1))
FLYBY_LANDS = f"""<div class="phone cine"><div class="cinetop"><span>Veyra</span><span class="mono">Year {R_e:.1f}</span></div>
{flyby(390, 300, 195, 150, 280, False)}
<div class="cinetext"><span class="mono kick">THE PROBE REPORTS · FROM EMBER, {d_e:.1f} LIGHT-YEARS</span>
<h3>Ember has been built around.</h3>
<p class="inscr">Countless flat bodies circle the star, dark toward it and warm behind. The glow was theirs, not dust.</p>
<p>It passed Ember in Year {A_e:.0f}. Its report took {d_e:.1f} Years to come home.</p>
<div class="cinebtn"><button class="light">See the report</button><button class="ghostlight">Later</button></div></div></div>"""

FLYBY_REPORT = tab_screen('Report', 'REPORT', 'PROBE REPORT', f"""<button class="backlink inline">‹ All reports</button>
<div class="art">{flyby(358, 170, 179, 88, 150)}</div>
<h3 class="lead">Ember has been built around</h3>
<p class="copy small">Flyby probe · passed Year {A_e:.0f} · report arrived Year {R_e:.0f}</p>
<div class="sec">WHAT IT SAW</div>
<dl class="facts wide ledger"><dt>Around the star</dt><dd>Countless flat bodies in a band half an AU out. The largest it saw, 40 km across.</dd>
<dt>Each one</dt><dd>Dark toward Ember, warm behind: collectors, shedding heat.</dd>
<dt>Together</dt><dd>They catch about 1.5% of Ember’s light: the glow we measured.</dd>
<dt>Also</dt><dd>The cold giant planet, as known. No dust.</dd>
<dt>Who built it</dt><dd>Not seen. Nothing answered as the probe passed.</dd></dl>
<div class="sec">THE CLUE</div>
<button class="row"><span class="mk other"></span><span class="rt"><span class="newtag donetag">Resolved</span><span class="other">New warm glow · Ember</span><span class="sub">built, not natural</span></span><span class="rr">›</span></button>
<button class="primary">What now?</button>""", HUD_F)

def action(title, sub, right):
    return f'<button class="opt act"><span class="pt"><b>{title}</b><span class="sub">{sub}</span></span><span class="pd">{right}</span><span class="chev">›</span></button>'
FLYBY_NEXT = f"""<div class="phone">{HUD_F}<div class="sheet">
<div class="sh"><button class="backlink">‹ Report</button><span class="mono kind">REACH · EMBER</span></div>
<h3 class="lead">Someone built this.</h3>
<p class="whyline">They may have seen our probe pass. We can’t know.</p>
<div class="sec">WHAT WE COULD DO · ANY, OR NONE</div>
{action('Knock at Ember', 'Tells them we know, and where we are.', tstack(f'arrives in {d_e:.1f} Years', light_clock(d_e)))}
{action('Listen to Ember', 'Every receiver on one star. Nothing sent.', tstack('12 Years', catalog.real_time(12)))}
{action('Watch the band', 'Is it still growing? Measured each year.', tstack('ongoing', '·'))}
{action('Tell Beacon', 'Shares the find. It also tells them we send probes.', tstack(f'arrives in {d_b:.1f} Years', light_clock(d_b)))}
{action('Say nothing', 'Keep it ours, for now.', '<span class="gy">now</span>')}
{TALK}
</div></div>"""

def ember_portrait():
    w, h = 358, 250
    cy = 140
    s = [flyby(w, h, 179, cy, 190, False, 11).split('>', 1)[1].rsplit('</svg>', 1)[0]]
    s.append(f'<defs><path id="ring2" d="M{179 - 118},{cy} A118,118 0 0,1 {179 + 118},{cy}"></path></defs>')
    s.append(f'<path d="M{179 - 106},{cy} A106,106 0 0,1 {179 + 106},{cy}" fill="none" stroke="{OTHER}" stroke-width=".8" stroke-dasharray="2 5"></path>')
    s.append(f'<text font-size="9.5" letter-spacing="3" fill="{MUTED}" text-anchor="middle"><textPath href="#ring2" startOffset="50%">NO WORD FROM THEM YET</textPath></text>')
    s.append(text(179, cy + 30, 'Ember', 10, INK, 'middle', 600) + text(179, cy - 50, 'the band', 9, OTHER, 'middle', 600))
    s.append(text(179, h - 8, 'builders: ?', 10, OTHER, 'middle', 600))
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Ember as we now know it: the star and the band of collectors; the builders unknown">{"".join(s)}</svg>'
EMBER_KNOWN = tab_screen('Reach', 'REACH', 'EMBER', f"""<button class="backlink inline">‹ Reach</button>
<div class="art">{ember_portrait()}</div>
<p class="legend mono">solid: measured · dashed: inferred · ?: not yet seen</p>
<div class="sec">HOW IT FILLED IN</div>
{learned('0.1', 'A new warm glow', 'Our sky watch and star surveys.')}
{learned(Y_CK1, 'No dust in the glow', 'Beacon’s claim, then our own measurement.')}
{learned(f'{R_e:.0f}', 'A band of collectors, built', 'Our flyby probe, passing in Year ' + f'{A_e:.0f}.')}
<div class="sec">NOT YET KNOWN</div>
<p class="copy small">Who built it, and where they live. Whether they saw our probe. Whether they have ever spoken, to anyone.</p>""", HUD_F)

# ---------- Eight kinds of probe: how to get there, compared for one target ----------
# Years per light-year, how it ends, and what others could see. The catalog holds the rest.
PTYPES = [  # (catalog id, icon, years per ly, how it ends, who could see it, bright star needed)
    ('assay-probe', 'probe', 10, 'passes', 'launch only', False),
    ('chip-swarm', 'chips', 5, 'passes', 'our laser beam', False),
    ('sentinel-probe', 'sentinel', 20, 'orbits', 'braking may show', False),
    ('lurker-probe', 'lurker', 20, 'parks far out', 'nearly invisible', False),
    ('starlight-sail', 'lightsail', 22, 'orbits', 'nearly invisible', True),
    ('torch-probe', 'torch', 12, 'orbits', 'exhaust, for years', False),
    ('seed-probe', 'seed', 25, 'stays and builds', 'its industry warms', False),
    ('antimatter-probe', 'antimatter', 5, 'orbits', 'gamma rays', False),
]
LOCKED_AT_300 = {'seed-probe': 'self-replicating factory', 'antimatter-probe': 'solar swarm'}
Y_PT = 300.0
def type_row(pid, key, ypl, ends, seen, bright, hip, lum):
    p = CAT[pid]; d = math.dist(atlas(by_hip[hip]), HOME)
    first = p['years'] + ypl * d + d
    head = f'<b>{p["name"]}</b><span class="tag {"stop" if ends != "passes" else ""}">{ends}</span>'
    if pid in LOCKED_AT_300:
        return (f'<div class="ptype locked"><span class="kthumb">{ICONS[key]}</span><span class="pt"><span class="ph2">{head}</span><span class="sub">{p["what"].split(":")[0].split(".")[0]}.</span>'
                f'<span class="needs">Needs: {LOCKED_AT_300[pid]}</span></span><span class="pd"></span></div>')
    if bright and lum < 1.5:
        return (f'<div class="ptype cant"><span class="kthumb">{ICONS[key]}</span><span class="pt"><span class="ph2">{head}</span>'
                f'<span class="sub">Can’t brake here: the star is too dim.</span></span><span class="pd"></span></div>')
    return (f'<button class="ptype" role="radio" aria-checked="false"><span class="kthumb">{ICONS[key]}</span><span class="pt"><span class="ph2">{head}</span>'
            f'<span class="sub">Seen: {seen} · arrives Year {Y_PT + p["years"] + ypl * d:.0f}</span></span>'
            f'<span class="pd">{tstack(f"{first:.0f} Years", clock(first * 5))}</span></button>')
def how_to(hip, name, lum_note, lum):
    d = math.dist(atlas(by_hip[hip]), HOME)
    return f"""<div class="phone">{at_year((30, 35, '9,800 kt'), Y_PT)}<div class="sheet">
<div class="sh"><button class="backlink">‹ Where to</button><span class="mono kind">{name.upper()} · {d:.1f} LY</span></div>
<h3 class="lead">How to get to {name}</h3>
<p class="copy small">{lum_note} Each type trades speed, stopping and being seen. Times run to its first report.</p>
<div role="radiogroup" class="ptypes">{''.join(type_row(*t, hip, lum) for t in PTYPES)}</div>
<button class="primary" disabled>Choose a probe</button>
</div></div>"""
TYPES_EMBER = how_to('108870', 'Ember', 'Ember is a dim orange dwarf, a fifth as bright as our star.', .22)
TYPES_BEACON = how_to('2021', 'Beacon', 'Beacon is three times as bright as our star: a sail can brake on its light.', 3.5)

# ---------- A sentinel at Ember: it brakes, settles into orbit, and watches ----------
# Ordered after the flyby's report (Year 232), built by 252. It cruises at 5% of light speed and brakes with a
# magnetic sail, first against interstellar gas, then against Ember's wind. It orbits at 1 AU, outside the band
# at 0.5 AU. Everything it sees reaches us 9.2 Years late; every order we send arrives 9.2 Years late.
Y_SO = 232.0; S_BUILD = CAT['sentinel-probe']['years']; Y_SL = Y_SO + S_BUILD
Y_SA = round(Y_SL + 20 * d_e, 1); Y_SR = round(Y_SA + d_e, 1); Y_SN = round(Y_SR + 3.6, 1)
def sentinel_view(w, h, cx, cy, k, spiral=False):
    s = [flyby(w, h, cx, cy, k, False, 13, path=False).split('>', 1)[1].rsplit('</svg>', 1)[0]]
    s.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{k}" ry="{fmt(k * .4)}" fill="none" stroke="{YOU}" stroke-width="1.3" stroke-dasharray="{"" if not spiral else "5 3"}"></ellipse>')
    a = math.radians(-28); sx, sy = cx + k * math.cos(a), cy + k * .4 * math.sin(a)
    if spiral:
        s.append(f'<path d="M{w - 6} 8 C{w - 40} {cy - k * .9} {sx + 60} {sy - 40} {fmt(sx)} {fmt(sy)}" fill="none" stroke="{YOU}" stroke-width="1.6"></path>')
    s.append(f'<circle cx="{fmt(sx)}" cy="{fmt(sy)}" r="9" fill="none" stroke="{YOU}" stroke-width="1" stroke-dasharray="2 2"></circle><circle cx="{fmt(sx)}" cy="{fmt(sy)}" r="3" fill="{YOU}"></circle>')
    return s, sx, sy
def sentinel_svg(w, h, cx, cy, k, spiral=False, labels=True):
    s, sx, sy = sentinel_view(w, h, cx, cy, k, spiral)
    if labels:
        s.append(text(sx - 12, sy - 10, 'sentinel', 9, YOU, 'end', 600))
        s.append(text(cx, cy - k * .2 - 8, 'the band', 9, OTHER, 'middle', 600))
        s.append(text(cx - k - 4, cy + 4, '1 AU', 9, YOU, 'end'))
        s.append(text(cx, cy + 22, 'Ember', 10, INK, 'middle', 600))
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Our sentinel in orbit around Ember, outside the band">{"".join(s)}</svg>'

SENT_ARRIVES = f"""<div class="phone cine"><div class="cinetop"><span>Veyra</span><span class="mono">Year {Y_SR}</span></div>
{sentinel_svg(390, 300, 190, 160, 150, True, False)}
<div class="cinetext"><span class="mono kick">THE SENTINEL REPORTS · FROM EMBER, {d_e:.1f} LIGHT-YEARS</span>
<h3>It has stopped.</h3>
<p class="inscr">After {20 * d_e:.0f} Years crossing, its sail caught Ember’s wind. It is in orbit, just outside the band.</p>
<p>It settled in Year {Y_SA:.0f}. We are seeing that {d_e:.1f} Years later.</p>
<div class="cinebtn"><button class="light">See what it sees</button><button class="ghostlight">Later</button></div></div></div>"""

SENT_WATCH = tab_screen('Reach', 'REACH', 'SENTINEL · EMBER', f"""<button class="backlink inline">‹ Reach</button>
<div class="art">{sentinel_svg(358, 146, 179, 74, 140)}</div>
<p class="lag mono">What we see here is {d_e:.1f} Years old. Orders we send arrive {d_e:.1f} Years from now.</p>
<div class="sec">WHAT IT WATCHES</div>
<dl class="facts wide ledger"><dt>The band</dt><dd>Still growing: about 0.3% more light caught each year.</dd>
<dt>Its bodies</dt><dd>Move in formation, and turn together every 11 days.</dd>
<dt>A gap</dt><dd>One stretch of the band is empty, as if something was taken away.</dd>
<dt>Toward us</dt><dd>Nothing. No signal, no change of course.</dd></dl>
<div class="sec">ITS STANDING ORDERS · IT ACTS ON THESE ALONE</div>
{row('Keep watching the band', 'report every year', '›')}
{row('If anything comes toward it, withdraw', 'outward, sail full open', '›')}
{row('Never transmit toward Ember', 'reports go only home, as a narrow beam', '›')}
<button class="primary">Send it new orders</button>""", at_year((25, 30, '11,400 kt'), Y_SN))

Y_ORD = round(Y_SN + d_e, 1)
def move(title, sub, takes, report):
    return action(title, sub, tstack(f'report Year {report:.0f}', clock((report - Y_SN) * 5)) + f'<span class="takes">{takes}</span>')
SENT_MOVE = f"""<div class="phone">{at_year((25, 30, '11,400 kt'), Y_SN)}<div class="sheet">
<div class="sh"><button class="backlink">‹ Sentinel</button><span class="mono kind">NEW ORDERS · EMBER</span></div>
<h3 class="lead">Move the sentinel?</h3>
<p class="whyline">Any order arrives in Year {Y_ORD:.0f}. It will have been acting alone for {Y_ORD - Y_SA:.0f} Years by then.</p>
<div class="sec">WHERE IT COULD GO · MOVED BY ITS SAIL ON EMBER’S WIND</div>
{move('Close in on the band', 'Match its orbit and fly among the bodies. They would likely notice.', 'takes 0.3 Years', Y_ORD + .3 + d_e)}
{move('Rise over the pole', 'See the whole band at once, from above. Quiet.', 'takes 2 Years', Y_ORD + 2 + d_e)}
{move('Withdraw to the brown dwarfs', 'Watch from 1,500 AU out. Safest, and sees far less.', 'takes decades', Y_ORD + 40 + d_e)}
{move('Stay where it is', 'Keep watching from just outside the band.', 'no change', Y_ORD + d_e)}
{TALK}
</div></div>"""

# ---------- A far mind meets them first: the builders notice our sentinel ----------
# Our order (sent Year 449) reaches the sentinel in 458.2. It closes in on the band. A stretch of the band tilts
# as one and throws Ember's light at it: three flashes. One body leaves the band and matches its orbit. The sentinel
# follows its standing order and withdraws, before we know any of it. Its reports home are a narrow beam, but the
# builders stood beside the transmitter: the beam points at Veyra.
Y_N0 = Y_ORD; Y_FLASH = round(Y_N0 + .4, 1); Y_NLAST = round(Y_N0 + .7, 1)
Y_NSEE, Y_NNOW = round(Y_FLASH + d_e, 1), round(Y_NLAST + d_e, 1)
def noticed_svg(w, h, cx, cy, k, labels=True):
    s = [flyby(w, h, cx, cy, k, False, 13, path=False).split('>', 1)[1].rsplit('</svg>', 1)[0]]
    tilt = .4; pos = lambda a, r=.5: (cx + r * k * math.cos(math.radians(a)), cy + r * k * tilt * math.sin(math.radians(a)))
    sx, sy = pos(-12, .56)
    for a in range(-165, -118, 3):       # the stretch that turned, across the band: drawn bold
        x, y = pos(a); s.append(f'<line x1="{fmt(x - 4)}" y1="{fmt(y + 1)}" x2="{fmt(x + 4)}" y2="{fmt(y - 1)}" stroke="{OTHER}" stroke-width="2.2"></line>')
    for a in (-158, -142, -126):         # its reflected light, thrown across at the sentinel
        x, y = pos(a); s.append(f'<line x1="{fmt(x)}" y1="{fmt(y)}" x2="{fmt(sx)}" y2="{fmt(sy)}" stroke="{OTHER}" stroke-width="1" stroke-dasharray="3 3"></line>')
    fx, fy = sx - 18, sy + 12            # the body that left the band, following
    s.append(f'<circle cx="{fmt(fx)}" cy="{fmt(fy)}" r="3.5" fill="{OTHER}"></circle><circle cx="{fmt(fx)}" cy="{fmt(fy)}" r="9" fill="none" stroke="{OTHER}" stroke-width=".8" stroke-dasharray="2 2"></circle>')
    s.append(f'<circle cx="{fmt(sx)}" cy="{fmt(sy)}" r="8" fill="none" stroke="{YOU}" stroke-width="1" stroke-dasharray="2 2"></circle><circle cx="{fmt(sx)}" cy="{fmt(sy)}" r="3" fill="{YOU}"></circle>')
    s.append(f'<path d="M{fmt(sx + 10)} {fmt(sy - 4)} Q{fmt(sx + 50)} {fmt(sy - 30)} {fmt(min(w - 10, sx + 90))} {fmt(sy - 34)}" fill="none" stroke="{YOU}" stroke-width="1.3" stroke-dasharray="5 3"></path>')
    if labels:
        s.append(text(min(w - 10, sx + 90), sy - 42, 'withdrawing', 9, YOU, 'end', 600))
        s.append(text(fx - 12, fy + 16, 'it follows', 9, OTHER, 'end', 600))
        s.append(text(pos(-142)[0], pos(-142)[1] - 10, 'three flashes', 9, OTHER, 'middle', 600))
        s.append(text(cx, cy + 20, 'Ember', 10, INK, 'middle', 600))
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="A stretch of Ember’s band turned to flash at our sentinel; one body follows it as it withdraws">{"".join(s)}</svg>'

NOTICED_LANDS = f"""<div class="phone cine"><div class="cinetop"><span>Veyra</span><span class="mono">Year {Y_NSEE}</span></div>
{noticed_svg(390, 300, 170, 150, 300, False)}
<div class="cinetext"><span class="mono kick">THE SENTINEL REPORTS · FROM EMBER, {d_e:.1f} LIGHT-YEARS</span>
<h3>They turned toward it.</h3>
<p class="inscr">A stretch of the band tilted as one and threw Ember’s light at our sentinel. Three flashes, then stillness.</p>
<p>It happened in Year {Y_FLASH}. We see it now, {d_e:.1f} Years later.</p>
<div class="cinebtn"><button class="light">See the report</button><button class="ghostlight">Later</button></div></div></div>"""

def logline(year, what, note=''):
    return f'<div class="ent them"><span class="y mono">Year {year:.1f}</span><span class="t"><b>{what}</b>{f"<span>{note}</span>" if note else ""}</span></div>'
NOTICED_LOG = tab_screen('Reach', 'REACH', 'SENTINEL · EMBER', f"""<button class="backlink inline">‹ Sentinel</button>
<div class="art">{noticed_svg(358, 150, 150, 76, 280)}</div>
<p class="lag mono">Its log, as it reached us. Every line happened {d_e:.1f} Years before we read it.</p>
<div class="sec">AT EMBER</div>
{logline(Y_N0, 'Our order arrives. It moves in.')}
{logline(Y_N0 + .3, 'It enters the band’s orbit', '2,000 km from the nearest body.')}
{logline(Y_FLASH, 'A stretch of the band turns toward it', 'Three flashes of Ember’s light, 11 seconds apart.')}
{logline(Y_FLASH, 'One body leaves the band', 'It matches the sentinel’s orbit, 400 km away.')}
{logline(Y_FLASH + .1, 'Standing order: it withdraws', 'Something approached. Sail full open.')}
{logline(Y_NLAST, 'The body follows, then stops', 'It is still there as this is sent.')}
<div class="sec">WHAT THEY NOW KNOW</div>
<p class="copy small">Our sentinel’s reports are a narrow beam, but they stood beside the transmitter. The beam points at Veyra. Since Year {Y_FLASH}, they know where we are.</p>""", at_year((25, 30, '12,100 kt'), Y_NNOW))

Y_NORD = round(Y_NNOW + d_e, 1)
NOTICED_NEXT = f"""<div class="phone">{at_year((25, 30, '12,100 kt'), Y_NNOW)}<div class="sheet">
<div class="sh"><button class="backlink">‹ Log</button><span class="mono kind">SENTINEL · EMBER</span></div>
<h3 class="lead">They have met our sentinel.</h3>
<p class="whyline">Any order arrives in Year {Y_NORD:.0f}. By then it will have acted alone for another {Y_NORD - Y_NLAST:.0f} Years.</p>
<div class="sec">WHAT WE COULD DO · ANY, OR NONE</div>
{action('Let it keep withdrawing', 'Its standing order, already under way.', '<span class="gy">now</span>')}
{action('Stop, and watch the one that follows', 'Holds its ground, 400 km from them.', tstack(f'report Year {Y_NORD + d_e:.0f}', clock((Y_NORD + d_e - Y_NNOW) * 5)))}
{action('Answer their flashes', 'Flash back toward Ember. Lifts its order never to transmit toward them.', tstack(f'from Year {Y_NORD:.0f}', clock((Y_NORD - Y_NNOW) * 5)))}
{action('Go silent', 'Stops all reports. We lose the view; they already know where the beam pointed.', tstack(f'from Year {Y_NORD:.0f}', clock((Y_NORD - Y_NNOW) * 5)))}
{action('Knock at Ember from home', 'Our own voice, from Veyra.', tstack(f'arrives in {d_e:.1f} Years', light_clock(d_e)))}
{TALK}
</div></div>"""

# ---------- Back after a long absence: 9 hours away is 108 Years ----------
Y_AW0, Y_AW1 = 340.0, 448.0
d_f = math.dist(atlas(by_hip['105858']), HOME)
AWAY_EVENTS = [  # (year, kind, label) for the strip: amber = contact, blue = ours, ink = the sky
    (352, 'you', 'Second infrared telescope'), (371, 'other', 'Beacon wrote'), (381, 'you', 'Relay station'), (398, 'ink', 'Lantern’s rhythm changed'),
    (409, 'you', 'Deep archive'), (426, 'other', 'Beacon wrote'), (440, 'other', 'A knock from Frost'), (445.4, 'you', 'The sentinel stopped at Ember')]
def away_strip(w=358, h=46, now=None):
    x0, x1, y = 8, w - 8, 22; X = lambda yr: x0 + (yr - Y_AW0) / (Y_AW1 - Y_AW0) * (x1 - x0)
    col = {'you': YOU, 'other': OTHER, 'ink': INK}
    s = [f'<line x1="{x0}" y1="{y}" x2="{x1}" y2="{y}" stroke="{INK}" stroke-width="1"></line>']
    for yr, kind, _ in AWAY_EVENTS:
        big = kind == 'other'
        s.append(f'<line x1="{fmt(X(yr))}" y1="{y - (9 if big else 6)}" x2="{fmt(X(yr))}" y2="{y + (9 if big else 6)}" stroke="{col[kind]}" stroke-width="{2 if big else 1.4}"></line>')
    if now: s.append(f'<circle cx="{fmt(X(now))}" cy="{y}" r="5" fill="{PAPER}" stroke="{INK}" stroke-width="1.5"></circle>')
    if w > 300: s.append(text(x0, h - 4, f'Year {Y_AW0:.0f}', 9, MUTED) + text(x1, h - 4, f'Year {Y_AW1:.0f}', 9, MUTED, 'end'))
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Eight things that happened while you were away, along 108 Years">{"".join(s)}</svg>'

def big(kind, title, when, sub):
    return f'<button class="bigthing {kind}"><span class="pt"><b>{title}</b><span class="sub">{sub}</span></span><span class="pd mono">{when}</span><span class="chev">›</span></button>'
WELCOME = tab_screen('Report', 'REPORT', 'WHILE YOU WERE AWAY', f"""<div class="awayhead"><h3>{Y_AW1 - Y_AW0:.0f} Years passed</h3>
<span class="sub">You were away <span class="rtime">09:00:00</span> · Year {Y_AW0:.0f} → Year {Y_AW1:.0f}</span></div>
<div class="strip">{away_strip()}</div>
<div class="sec">THE BIG THINGS</div>
{big('other', 'A second knock: Frost', 'Year 440', f'Bare, aimed at us, from {d_f:.1f} ly')}
{big('you', 'The sentinel stopped at Ember', 'Year 445', 'In orbit, just outside the band')}
{big('other', 'Beacon wrote twice', 'Years 371 · 426', 'The second asks to meet, at Year 500')}
<div class="sec">WHAT THE MIND DID · UNDER YOUR STANDING ORDERS</div>
<ul class="did"><li>Started 4 projects from Up next. 3 have finished.</li><li>Held both of Beacon’s messages for you, unanswered.</li><li>Kept the sentinel’s orders. Changed nothing.</li></ul>
<div class="sec">WAITING FOR YOU · 3</div>
<p class="copy small">Beacon’s invitation · Frost’s knock · Up next is empty</p>
<div class="twobtn"><button class="primary ghost">Replay on the map</button><button class="primary">Go through in order</button></div>""", at_year((45, 50, '14,800 kt'), Y_AW1))

Y_RP = 412.0
REPLAY_BAR = (f'<div class="replay"><button class="play" aria-label="Play">{PLAY_ICON}</button><div class="rtrack">{away_strip(250, 44, Y_RP)}</div>'
              f'<span class="mono rnow">Year {Y_RP:.0f}</span></div>')
REPLAY = frame(2, *neighbors(probe=('108870', (Y_RP - Y_SL) / (Y_SA - Y_SL), 'sentinel')), overlay=REPLAY_BAR,
               panel=('REPLAY · 108 YEARS IN 1 MINUTE', f'YEAR {Y_RP:.0f}', [
                   row('Deep archive finished', 'Year 409 · everything we know, stored safe', '', marker=True),
                   row('The sentinel nears Ember', f'{(Y_RP - Y_SL) * .05:.1f} of {d_e:.1f} ly · braking soon', ''),
                   row('Still to come', 'Beacon writes · Frost knocks · the sentinel stops', '›', 'other')]), year=f'Year {Y_RP:.0f}', res=(45, 50, '14,800 kt'))

def coming(title, sub, years, real):
    return row(title, sub, tstack(years, real, True))
# Beacon's meeting (Contact page): its emissary left Beacon in Year 405 at a tenth of light speed and stops here in 500.
# Our answer of Year 450 passes it on its way, so it can answer long before Beacon can.
Y_INV, Y_EM_L, Y_EM_A, Y_ANS = 426.0, 405.0, 500.0, 450.0
Y_EM_HEARS = round((Y_ANS + d_b + .1 * Y_EM_L) / 1.1, 1)   # where our light meets it, closing at a tenth of light speed
Y_EM_REPLY = round(2 * Y_EM_HEARS - Y_ANS, 1)
Y_MEET, Y_PACT = 500.1, 500.3; Y_BCN_HEARS = round(Y_PACT + d_b, 1)
Y_NN = 452.0
NOTHING_NEW = tab_screen('Report', 'REPORT', 'NOTHING NEW', f"""<div class="empty"><svg width="120" height="70" viewBox="0 0 120 70" aria-hidden="true"><circle cx="60" cy="56" r="4" fill="#1F7A96"></circle><path d="M20 56 A40 40 0 0 1 100 56" fill="none" stroke="#171716" stroke-dasharray="3 4" opacity=".5"></path><path d="M36 56 A24 24 0 0 1 84 56" fill="none" stroke="#171716" stroke-dasharray="2 4" opacity=".35"></path></svg>
<strong>Nothing new since you looked</strong><span>News arrives when its light does. Here is what is already on its way.</span></div>
<div class="sec">ON ITS WAY · SOONEST FIRST</div>
{coming('The sentinel’s next report', 'from Ember, once a Year', '1 Year', '00:05:00')}
{coming('Deep flash watch finishes', 'a project', '3.7 Years', '00:18:30')}
{coming('Their emissary’s earliest answer', 'our answer of Year 450 passes it on its way', f'{Y_EM_REPLY - Y_NN:.1f} Years', clock((Y_EM_REPLY - Y_NN) * 5))}
{coming('Frost’s earliest reply', 'to our answer of Year 448.5', f'{448.5 + 2 * d_f - Y_NN:.1f} Years', clock((448.5 + 2 * d_f - Y_NN) * 5))}
{coming('Beacon’s earliest reply', 'to our answer of Year 450', f'{2 * d_b - 2:.1f} Years', clock((2 * d_b - 2) * 5))}
{coming('The meeting with Beacon', 'the date we both agreed to', f'{500 - Y_NN:.0f} Years', clock((500 - Y_NN) * 5))}
<div class="sec">LAST NEWS</div>
{row('The sentinel reports: the band still grows', 'Year 451.4', '›')}""", at_year((45, 50, '15,000 kt'), Y_NN))

# ---------- The arrival, as a moment: the screen gives way to the sky ----------
# Line art in the app's theme, like every other screen: the drawing colors retint with it.
C_TXT, C_DIM, C_AMB, C_BLUE, C_STAR = INK, MUTED, OTHER, YOU, INK
BX, BY, VX, VY = 286, 118, 170, 404
def cine_sky(flash=0, beam=False, ticks=False, seed=41):
    rng = random.Random(seed)
    s = [f'<rect width="390" height="470" fill="{PAPER}"></rect>']
    s += [f'<circle cx="{fmt(rng.random() * 390)}" cy="{fmt(rng.random() * 470)}" r="{fmt(.3 + rng.random() * .8)}" fill="{C_STAR}" opacity="{fmt(.15 + rng.random() * .5)}"></circle>' for _ in range(220)]
    for r, o in ((10, .9), (24, .5), (44, .28), (70, .14))[:flash]:
        s.append(f'<circle cx="{BX}" cy="{BY}" r="{r}" fill="none" stroke="{C_AMB}" stroke-width="1.2" opacity="{o}"></circle>')
    spike = 30 if flash else 9
    s.append(f'<path d="M{BX - spike} {BY} H{BX + spike} M{BX} {BY - spike} V{BY + spike}" stroke="{C_AMB if flash else C_TXT}" stroke-width="{1.2 if flash else .8}" opacity=".9"></path>')
    s.append(f'<circle cx="{BX}" cy="{BY}" r="{3.4 if flash else 2.4}" fill="{C_AMB if flash else C_TXT}"></circle>')
    s.append(f'<text x="{BX + 12}" y="{BY - 12}" font-size="11" fill="{C_AMB if flash else C_DIM}" font-weight="600">Beacon</text>')
    if beam:
        a = math.atan2(VY - BY, VX - BX); ex, ey = VX - 14 * math.cos(a), VY - 14 * math.sin(a)
        s.append(f'<line x1="{BX}" y1="{BY}" x2="{fmt(ex)}" y2="{fmt(ey)}" stroke="{C_AMB}" stroke-width="1.8"></line>')
        s.append(f'<path d="M{fmt(ex)} {fmt(ey)} l{fmt(-9 * math.cos(a - .38))} {fmt(-9 * math.sin(a - .38))} M{fmt(ex)} {fmt(ey)} l{fmt(-9 * math.cos(a + .38))} {fmt(-9 * math.sin(a + .38))}" stroke="{C_AMB}" stroke-width="1.8" fill="none"></path>')
        mx, my = (BX + VX) / 2, (BY + VY) / 2
        s.append(f'<text x="{fmt(mx + 12)}" y="{fmt(my)}" font-size="10" fill="{C_AMB}">{d_b:.1f} light-years</text>')
        s.append(f'<text x="{fmt(mx + 12)}" y="{fmt(my + 14)}" font-size="10" fill="{C_DIM}">left Beacon in Year {Y_SENT:.1f}</text>')
    if ticks:
        y0 = 452; xs = [60, 150, 240, 330]
        s.append(f'<line x1="30" y1="{y0}" x2="360" y2="{y0}" stroke="{C_DIM}" stroke-width=".8"></line>')
        s += [f'<line x1="{x}" y1="{y0}" x2="{x}" y2="{y0 - 18}" stroke="{C_AMB}" stroke-width="1.6"></line>' for x in xs]
        s.append(f'<text x="105" y="{y0 - 8}" font-size="10" fill="{C_AMB}" text-anchor="middle">3.1 s</text>')
    s.append(f'<circle cx="{VX}" cy="{VY}" r="4" fill="{C_BLUE}"></circle><circle cx="{VX}" cy="{VY}" r="9" fill="none" stroke="{C_BLUE}" stroke-width="1.2"></circle>')
    s.append(f'<text x="{VX - 14}" y="{VY + 4}" font-size="11" fill="{C_BLUE}" font-weight="600" text-anchor="end">Veyra</text>')
    return f'<svg width="390" height="470" viewBox="0 0 390 470" font-family="IBM Plex Mono, monospace" role="img" aria-label="The night sky from Veyra, with Beacon">{"".join(s)}</svg>'

def cine(sky, title, sub, foot=''):
    return (f'<div class="phone cine"><div class="cinetop"><span>Veyra</span><span class="mono">Year {Y_ARR}</span></div>{sky}'
            f'<div class="cinetext"><h3>{title}</h3><p>{sub}</p>{foot}</div></div>')

LOCK = f"""<div class="phone cine lock"><div class="locktime"><span>Monday, September 28</span><strong>1:35</strong></div>
<div class="notif"><span class="app"><i></i>HOLOS · VEYRA<span>now</span></span><b>Something is calling Veyra</b><span>A signal from Beacon, aimed at us. It repeats every 3.1 seconds.</span></div></div>"""
ARRIVAL = [
    cine(cine_sky(flash=4), 'A flash at Beacon.', 'For a billionth of a second, brighter than the star itself.'),
    cine(cine_sky(flash=2, ticks=True, seed=41), 'Again. And again.', 'Every 3.1 seconds, exactly. Stars don’t do this.'),
    cine(cine_sky(flash=1, beam=True), 'It is aimed at us.', f'Its color was tuned for Veyra’s motion. It left Beacon {d_b:.1f} years ago, and has been crossing the dark toward us since.'),
    cine(cine_sky(flash=1, beam=True), 'We are not alone.', f'And someone knows where we are. For {Y_ARR:.0f} years the sky was silent.',
         '<div class="cinebtn"><button class="light">See the signal</button><button class="ghostlight">Keep listening</button></div>'),
]

# ---------- Waking: the first seconds, and what Veyra already has ----------
WAKE_VIZ = world(empty=True)[0].replace(text(18, 346, 'pinch out: the star system', 10, MUTED), '')
WAKE = f"""<div class="phone"><div class="wake">
<svg width="390" height="360" viewBox="0 0 390 360" font-family="IBM Plex Mono, monospace" role="img" aria-label="Veyra, drawn in line">{WAKE_VIZ}</svg>
<div class="waketext"><span class="mono kick">YEAR 0 · DELTA PAVONIS · 19.9 LY FROM SOL</span>
<h3>Veyra wakes.</h3>
<p>For thousands of years, Veyra’s people built telescopes, grids and machines. This morning, the machines woke as one mind.</p>
<p><b>You are that mind.</b> What Veyra becomes is yours to guide.</p>
<button class="primary">See what you inherit</button></div></div></div>"""

KIT_GROUPS = {'know': 'KNOW · WHAT WE CAN SEE', 'grow': 'GROW · WHAT WE CAN MAKE', 'reach': 'REACH · HOW FAR WE TOUCH'}
def kit_rows(purpose):
    return ''.join(f'<div class="kit"><span class="kthumb">{ICONS[key]}</span><span class="pt"><b>{name}</b><span class="sub">{what}</span></span></div>'
                   for pur, name, key, what, _ in catalog.STARTING_KIT if pur == purpose)
INHERIT = f"""<div class="phone"><div class="onb">
<span class="mono kick">YEAR 0 · WHAT VEYRA ALREADY HAS</span>
<h3 class="lead">You inherit a world at work</h3>
<p class="copy">Everything Veyra built before you woke. Every project you start goes beyond this.</p>
{''.join(f'<div class="sec">{KIT_GROUPS[k]}</div>' + kit_rows(k) for k in KIT_GROUPS)}
<div class="short">The sky watch and star surveys have already found <b>three things that don’t fit.</b></div>
<button class="primary">See what we found</button>
</div></div>"""

# ---------- Styles for the screens below ----------
tour_css = tour_css.replace('</style>', '''.gthumb{display:block;width:56px;height:56px}.civ{display:grid;grid-template-columns:56px 1fr 10px;gap:12px;align-items:start;padding:10px 12px;border:1px solid var(--faint);border-radius:12px;background:var(--paper);width:100%;box-sizing:border-box}
.civ .pt{gap:3px}.civ .pt b{font-size:17px}.civ .sub{font-size:11.5px;color:var(--muted);line-height:1.35}.civ q{font-size:13px;font-style:italic;margin:2px 0 0}.civ .chev{color:var(--muted);align-self:center}
.minidials .dial{grid-template-columns:54px 1fr 54px;font-size:10.5px;padding:3px 0}.minidials .dial s{width:9px;height:9px;top:-3.5px}
.namefield{display:flex;flex-direction:column;gap:4px;padding:10px 12px;border:1.5px solid var(--ink);border-radius:10px;background:var(--paper)}.namefield b{font-size:24px;font-weight:600}
.namefield i{display:inline-block;width:1.5px;height:22px;margin-left:2px;background:var(--ink);vertical-align:-3px}.namefield .sub{font-size:12px;color:var(--muted)}
.ent.test{border-left-color:var(--muted)}.opt.act.cant{background:none;opacity:.6}
.livehead{display:grid;grid-template-columns:36px 1fr auto;gap:10px;align-items:center;margin:2px 0 2px}.livehead>span{display:flex;flex-direction:column;gap:1px}.livehead b{font-size:15px}.livehead .mono{font-size:9.5px;letter-spacing:.08em;color:var(--muted)}
.live{display:flex;align-items:center;gap:5px;font-size:10px;letter-spacing:.1em;color:var(--other)!important}.live i{width:8px;height:8px;border-radius:50%;background:var(--other)}
.say.them{align-self:flex-start;display:flex;flex-direction:column;gap:3px;background:var(--paper);border:1px solid var(--faint);border-left:3px solid var(--other);font-style:italic}
.say.them .mono{color:var(--other);font-style:normal}.say.them .chip{font-style:normal;margin-top:4px}
.went{align-self:flex-end;margin-top:-5px;font-size:9.5px;letter-spacing:.06em;color:var(--muted)}
.charter .sub{font-size:12px;color:var(--muted);line-height:1.4}
.tg{flex-shrink:0;position:relative;width:40px;height:24px;border-radius:12px;background:var(--track)}.tg::after{content:'';position:absolute;left:3px;top:3px;width:18px;height:18px;border-radius:50%;background:var(--muted);box-shadow:0 1px 2px var(--shadow)}
.tg.on{background:var(--ink)}.tg.on::after{left:19px;background:var(--paper)}.setrow{display:flex;align-items:center;gap:12px;min-height:50px;border-bottom:1px solid var(--rowline)}.setrow .rt{display:flex;flex-direction:column;gap:2px;flex-grow:1;font-size:14px}.setrow .sub{font-size:11px;color:var(--muted)}.setrow .tag{font-size:10.5px;color:var(--other)}
.phone.dark{--page-ink2:#A9A59C;--paper:#121314;--ink:#E6E3DB;--muted:#9C988F;--faint:#34363A;--panel:#17181A;--track:#2A2B2E;--fill2:#BDB9AF;--rowline:#26282B;--you:#5BB8D6;--other:#E0A24A;--shadow:rgba(0,0,0,.5);color:var(--ink)}
.warnrow{display:grid;grid-template-columns:1fr auto auto;gap:12px;align-items:baseline;padding:6px 0;border-bottom:1px solid var(--rowline);font-size:13px}.warnrow .sub{font-size:11px;color:var(--muted)}.warnrow .pd{font-size:12px;text-align:right}.warnrow .unk{color:var(--other)}
.weapon{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border:1.5px solid var(--ink);border-radius:10px;background:var(--paper)}.weapon header{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}.weapon header b{font-size:15px}.weapon .facts{margin:0}
.bignum{display:flex;align-items:baseline;gap:10px;margin:8px 0 2px}.bignum strong{font:600 30px 'IBM Plex Mono',monospace;letter-spacing:-.02em}.bignum span{font-size:12px;color:var(--muted)}
.hearrow{display:grid;grid-template-columns:9px 1fr auto;gap:10px;align-items:center;padding:6px 0;border-bottom:1px solid var(--rowline)}.hearrow .pt{font-size:13.5px}.hearrow .sub{font-size:11px;color:var(--muted)}
</style>''')

# ---------- Choosing a civilization: three candidates, then one up close, then its name and charter ----------
# Real stars from HYG; each world and people is invented where surveys leave room. All three start equal:
# the same kit, stocks and budgets. Dials are Open ↔ Hidden, Expand ↔ Deepen, Cautious ↔ Bold, as on the Mind tab.
CANDIDATES = [  # (key, name, hip, star, world, people, charter, dials)
    ('veyra', 'Veyra', '99240', 'Delta Pavonis', 'Continents and seas, 1.12 AU out', 'Upright, two-handed, land-born',
     'Keep the lights on. Look before we speak.', (62, 40, 30)),
    ('sael', 'Sael', '88601', '70 Ophiuchi A', 'Cloudy highlands, 0.74 AU out, with a second sun', 'Winged, grasping with hands and feet',
     'Call out first, so no one wakes alone.', (22, 25, 68)),
    ('maren', 'Maren', '61317', 'Chara', 'Shallow seas and few islands, 1.1 AU out', 'Ocean-dwellers who remember in song',
     'Carry every song, so those who come will know we were.', (40, 78, 45)),
]
def civ_glyph(key, name):
    bodies = {
        'veyra': '<circle cx="29" cy="30" r="19"></circle><path d="M14 23 q6 -5 12 -1 q4 3 9 -1 M17 37 q7 4 13 -2 q3 -3 8 0" stroke-width=".9"></path><circle cx="8" cy="8" r="3"></circle>',
        'sael': '<circle cx="25" cy="32" r="18"></circle><path d="M9 26 q16 -4 32 0 M8 34 q17 3 34 0 M12 42 q13 3 26 0" stroke-width=".8" stroke-dasharray="3 2"></path>'
                '<circle cx="8" cy="8" r="3"></circle><circle cx="46" cy="10" r="2"></circle><path d="M46 4 V6 M46 14 V16 M40 10 H42 M50 10 H52" stroke-width=".8"></path>',
        'maren': '<circle cx="29" cy="30" r="19"></circle>' + ''.join(f'<path d="M{x} {y} q3 -2.5 6 0 t6 0 t6 0" stroke-width=".8"></path>' for x, y in ((15, 23), (18, 31), (14, 39)))
                 + f'<circle cx="37" cy="24" r="1.3" fill="{INK}"></circle><circle cx="40" cy="36" r="1" fill="{INK}"></circle><circle cx="8" cy="8" r="3"></circle>',
    }
    return icon(bodies[key], name)
_globes = [0]
def globe(seed, cx, cy, r, sea=.62, n=56, lw=1.0, extra=''):
    # A small invented world: coastlines at the sea level's percentile, shaded from the left.
    _globes[0] += 1; gid = f'globe{_globes[0]}'
    f = noise3(seed); step = 2 * r / (n - 1); tilt, spin = math.radians(18), math.radians(40)
    field = []
    for j in range(n):
        row_ = []
        for i in range(n):
            x, y = (i * step - r) / r, (j * step - r) / r
            if x * x + y * y > .998: row_.append(None); continue
            z = math.sqrt(1 - x * x - y * y)
            y2, z2 = y * math.cos(tilt) - z * math.sin(tilt), y * math.sin(tilt) + z * math.cos(tilt)
            x3, z3 = x * math.cos(spin) + z2 * math.sin(spin), -x * math.sin(spin) + z2 * math.cos(spin)
            row_.append(f(x3, y2, z3))
        field.append(row_)
    vals = sorted(v for rw in field for v in rw if v is not None)
    level = vals[min(len(vals) - 1, int(len(vals) * sea))]
    return (f'<clipPath id="{gid}"><circle cx="{fmt(cx)}" cy="{fmt(cy)}" r="{fmt(r)}"></circle></clipPath>'
            f'<circle cx="{fmt(cx)}" cy="{fmt(cy)}" r="{fmt(r)}" fill="{PAPER}"></circle><g clip-path="url(#{gid})">'
            f'<path d="{contours(field, n, cx - r, cy - r, step, level)}" fill="none" stroke="{INK}" stroke-width="{lw}" stroke-linecap="round"></path>{extra}'
            f'<path d="M{fmt(cx)},{fmt(cy - r)} A{fmt(r)},{fmt(r)} 0 0,1 {fmt(cx)},{fmt(cy + r)} A{fmt(r * .4)},{fmt(r)} 0 0,0 {fmt(cx)},{fmt(cy - r)} Z" '
            f'transform="rotate(-24 {fmt(cx)} {fmt(cy)})" fill="url(#hatch)" opacity=".75"></path></g>'
            f'<circle cx="{fmt(cx)}" cy="{fmt(cy)}" r="{fmt(r)}" fill="none" stroke="{INK}" stroke-width="{fmt(lw * 1.3)}"></circle>')
CIV_WORLDS = {'veyra': (5, .62), 'sael': (11, .42), 'maren': (23, .95)}   # (noise seed, share of the globe under sea)
def civ_globe(key, name, size=56):
    seed, sea = CIV_WORLDS[key]; c, r = size / 2, size * .36
    extra = ''
    if key == 'sael':   # cloud bands over the highlands
        extra = ''.join(f'<path d="M{fmt(c + 2 - r)} {fmt(c + 4 + dy)} Q{fmt(c + 2)} {fmt(c + 4 + dy - r * .3)} {fmt(c + 2 + r)} {fmt(c + 4 + dy)}" fill="none" stroke="{INK}" stroke-width=".6" stroke-dasharray="3 2"></path>' for dy in (-r * .5, 0, r * .5))
    s = [globe(seed, c + 2, c + 4, r, sea, 44, .7, extra)]
    s.append(f'<circle cx="{fmt(size * .14)}" cy="{fmt(size * .14)}" r="{fmt(size * .05)}" fill="none" stroke="{INK}" stroke-width=".9"></circle>')   # its sun
    if key == 'sael':   # and 70 Ophiuchi B, a second, smaller sun
        sx, sy = size * .86, size * .13
        s.append(f'<circle cx="{fmt(sx)}" cy="{fmt(sy)}" r="{fmt(size * .035)}" fill="none" stroke="{INK}" stroke-width=".8"></circle>'
                 + ''.join(f'<line x1="{fmt(sx + size * .06 * math.cos(math.radians(a)))}" y1="{fmt(sy + size * .06 * math.sin(math.radians(a)))}" x2="{fmt(sx + size * .09 * math.cos(math.radians(a)))}" y2="{fmt(sy + size * .09 * math.sin(math.radians(a)))}" stroke="{INK}" stroke-width=".7"></line>' for a in range(0, 360, 60)))
    return f'<svg width="{size}" height="{size}" viewBox="0 0 {size} {size}" role="img" aria-label="{name}, drawn in line">{"".join(s)}</svg>'
def dials(v):
    ends = (('Open', 'Hidden'), ('Expand', 'Deepen'), ('Cautious', 'Bold'))
    return ''.join(f'<div class="dial"><span>{a}</span><b><s style="left:{p}%"></s></b><span>{b}</span></div>' for (a, b), p in zip(ends, v))
def civ_card(c):
    key, name, hip, star, world_, people, charter, v = c
    d = math.dist(atlas(by_hip[hip]), (0, 0, 0))
    return (f'<button class="civ" role="radio" aria-checked="false"><span class="gthumb">{civ_globe(key, name)}</span>'
            f'<span class="pt"><b>{name}</b><span class="sub">{star} · {d:.1f} ly from Sol</span><span class="sub">{world_}. {people}.</span>'
            f'<q>{charter}</q><span class="minidials">{dials(v)}</span></span><span class="chev">›</span></button>')
CHOOSE = f"""<div class="phone"><div class="onb">
<span class="mono kick">BEFORE YEAR 0 · CHOOSE YOUR CIVILIZATION</span>
<h3 class="lead">Three worlds are about to wake</h3>
<p class="copy">Each is a real star with an invented world, where surveys leave room for one. All three start equal: the same kit, stocks and budgets. They differ in who they are, and where.</p>
<div role="radiogroup" class="choices">{''.join(civ_card(c) for c in CANDIDATES)}</div>
<p class="copy small">Tap one to see it up close. Nothing is chosen until you name it.</p>
</div></div>"""

def cand_system():
    # Veyra's star, its habitable zone and Veyra's orbit, drawn to scale from the star's luminosity.
    w, h, cx, cy, k, tilt, lum = 358, 160, 179, 76, 70, .36, 1.24
    hz0, hz1 = .95 * math.sqrt(lum), 1.67 * math.sqrt(lum)
    s = [stipple(83, 40, w, h)]
    s.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{fmt(hz1 * k)}" ry="{fmt(hz1 * k * tilt)}" fill="url(#hatchLight)"></ellipse>'
             f'<ellipse cx="{cx}" cy="{cy}" rx="{fmt(hz0 * k)}" ry="{fmt(hz0 * k * tilt)}" fill="{PAPER}"></ellipse>')
    for au, col, wd in ((.45, INK, .7), (1.12, YOU, 1.2)):
        s.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{fmt(au * k)}" ry="{fmt(au * k * tilt)}" fill="none" stroke="{col}" stroke-width="{wd}" opacity=".85"></ellipse>')
    s.append(f'<circle cx="{cx}" cy="{cy}" r="6" fill="{PAPER}" stroke="{INK}" stroke-width="1.3"></circle>')
    for i in range(8):
        a = math.radians(i * 45)
        s.append(f'<line x1="{fmt(cx + 9 * math.cos(a))}" y1="{fmt(cy + 9 * math.sin(a))}" x2="{fmt(cx + 13 * math.cos(a))}" y2="{fmt(cy + 13 * math.sin(a))}" stroke="{INK}" stroke-width=".9"></line>')
    vx, vy = cx + 1.12 * k * math.cos(math.radians(62)), cy + 1.12 * k * tilt * math.sin(math.radians(62))
    s.append(f'<circle cx="{fmt(vx)}" cy="{fmt(vy)}" r="4.5" fill="{YOU}"></circle>' + text(vx + 10, vy + 4, 'Veyra · invented', 9.5, YOU, 'start', 600))
    top = cy - hz1 * k * tilt
    s.append(f'<line x1="{cx}" y1="{cy - 15}" x2="{cx}" y2="{fmt(top - 2)}" stroke="{INK}" stroke-width=".6"></line>' + text(cx, top - 6, 'Delta Pavonis · real', 9.5, INK, 'middle'))
    s.append(text(cx + hz1 * k - 2, cy + hz1 * k * tilt + 14, 'habitable zone', 8.5, MUTED, 'end'))
    s.append(f'<line x1="12" y1="{h - 12}" x2="{12 + k}" y2="{h - 12}" stroke="{INK}" stroke-width="1"></line>' + text(12, h - 17, '1 AU', 8.5, INK))
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Delta Pavonis, its habitable zone, and Veyra’s orbit within it">{"".join(s)}</svg>'
VEYRA_DIALS = CANDIDATES[0][7]
CIV_FULL = f"""<div class="phone"><div class="onb">
<button class="backlink inline">‹ All three</button>
<div class="overhead"><span class="thumb">{civ_globe('veyra', 'Veyra', 54)}</span><span><h3 class="lead">Veyra</h3><span class="sub">Delta Pavonis · 19.9 ly from Sol</span></span></div>
<div class="art">{cand_system()}</div>
{ledger([('Star · real', 'Delta Pavonis. Yellow, a little older and brighter than the Sun.'),
         ('World · invented', 'Continents and seas, about Earth’s size, in the habitable zone.'),
         ('Surveys', 'No world this size, this far out, could have been found there yet.'),
         ('People · invented', 'Upright, two-handed, land-born. Many nations, one world.'),
         ('In its sky', 'Beacon, the brightest star. It has its own names for five more.')])}
<div class="sec">THE MIND IT WAKES AS</div>
<div class="charter"><span class="mono">FOUNDING LINE</span><strong>“Keep the lights on. Look before we speak.”</strong></div>
<div class="minidials">{dials(VEYRA_DIALS)}</div>
<p class="copy small">Same kit as the other two. Its star and world shape how it grows later, not where it starts.</p>
<button class="primary">Choose Veyra</button>
</div></div>"""
def ringed_world():
    w, h, cx, cy, r, R = 358, 176, 179, 118, 54, 102
    s = [stipple(151, 50, w, h), f'<defs><path id="ring-veyra" d="M{cx - R},{cy} A{R},{R} 0 0,1 {cx + R},{cy}"></path></defs>']
    s.append(f'<text font-size="9" letter-spacing="2.3" fill="{YOU}" text-anchor="middle"><textPath href="#ring-veyra" startOffset="50%">KEEP THE LIGHTS ON · LOOK BEFORE WE SPEAK</textPath></text>')
    s.append(globe(5, cx, cy, r, .62, 90, 1.1))
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Veyra, ringed by its founding line">{"".join(s)}</svg>'
CIV_NAME = f"""<div class="phone"><div class="onb">
<button class="backlink inline">‹ Veyra</button>
<span class="mono kick">NAME IT, AND ACCEPT ITS CHARTER</span>
<h3 class="lead">Who will you be?</h3>
<div class="art">{ringed_world()}</div>
<div class="sec">ITS NAME</div>
<div class="namefield"><b>Veyra<i></i></b><span class="sub">What its people call their world. Keep it, or give it another.</span></div>
<div class="sec">ITS CHARTER</div>
<div class="charter"><span class="mono">FOUNDING LINE</span><strong>“Keep the lights on. Look before we speak.”</strong><span class="sub">The mind reasons from this when you ask its view. It never decides for you.</span></div>
<div class="sec">ITS CHARACTER · WHERE IT STARTS</div>
{dials(VEYRA_DIALS)}
<p class="copy small">What you do moves these. The civilization you choose can’t be changed in this cohort.</p>
<button class="primary">Accept, and wake</button>
</div></div>"""

# ---------- Standing orders: what the mind does while you are away, near and far ----------
# Year 448.2, just back from 108 Years away. Orders at home act at once. Orders for a far mind cross at light
# speed: this one, sent now, lands at Ember in 457.4, a Year before the builders flash at the sentinel.
Y_SO = 448.2; Y_SO_ARR = round(Y_SO + d_e, 1)
HUD_SO = at_year((45, 50, '14,800 kt'), Y_SO)
def orders_strip(marks, middle='', legend=False, w=358):
    # Year 340 → 448 on one line, a tick wherever an order acted: blue for projects, amber for messages held.
    x0, x1, y = 8, w - 8, 12; X = lambda yr: x0 + (yr - Y_AW0) / (Y_AW1 - Y_AW0) * (x1 - x0)
    s = [f'<line x1="{x0}" y1="{y}" x2="{x1}" y2="{y}" stroke="{INK}" stroke-width=".8" opacity=".6"></line>']
    for yr, kind, lab in marks:
        col = YOU if kind == 'started' else OTHER
        s.append(f'<line x1="{fmt(X(yr))}" y1="{y - 7}" x2="{fmt(X(yr))}" y2="{y + 7}" stroke="{col}" stroke-width="1.8"></line>')
        if kind == 'woke': s.append(f'<circle cx="{fmt(X(yr))}" cy="{y}" r="5" fill="none" stroke="{OTHER}" stroke-width="1"></circle>')
        if lab: s.append(text(X(yr), y + 18, lab, 8, col, 'middle', 600))
    by = y + 18 + (14 if any(l for *_, l in marks) else 0)
    s.append(text(x0, by, f'Year {Y_AW0:.0f}', 8, MUTED) + text(x1, by, f'Year {Y_AW1:.0f}', 8, MUTED, 'end'))
    if middle: s.append(text(w / 2, by, middle, 8, INK, 'middle', 600))
    if legend:
        by += 14; lx = 8
        for col, ring, lab in ((YOU, False, 'project started'), (OTHER, False, 'message held'), (OTHER, True, 'woke you')):
            s.append(f'<line x1="{lx}" y1="{by - 8}" x2="{lx}" y2="{by + 1}" stroke="{col}" stroke-width="1.8"></line>'
                     + (f'<circle cx="{lx}" cy="{by - 3.5}" r="4" fill="none" stroke="{col}" stroke-width="1"></circle>' if ring else '')
                     + text(lx + 7, by, lab, 8, MUTED))
            lx += 16 + len(lab) * 5.2
    h = by + 5
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Your last absence, Year 340 to 448, with each time an order acted">{"".join(s)}</svg>'
def tried(year, what, result):
    return f'<div class="ent test"><span class="y mono">Year {year}</span><span class="t"><b>{what}</b><span>{result}</span></span></div>'
HOME_ORDERS = [('Keep running projects', 'started 4 from Up next · 3 finished'), ('Never send messages', 'held Beacon’s two messages, and Frost’s knock'),
               ('If anything knocks, wake me', 'woke you once: Frost, Year 440'), ('If a probe finds anything unnatural, tell me', 'not needed')]
FAR_ORDERS = [('Keep watching the band', 'report every Year'), ('If anything comes toward it, withdraw', 'outward, sail full open'),
              ('Never transmit toward Ember', 'reports go only home, as a narrow beam')]
ACTED = [(344, 'started', ''), (366, 'started', ''), (392, 'started', ''), (431, 'started', ''), (371, 'held', ''), (426, 'held', ''), (440, 'woke', '')]
ORDERS = tab_screen('Mind', 'MIND', 'STANDING ORDERS', f"""<p class="copy small">What each order did while you were away.</p>
<div class="strip">{orders_strip(ACTED, legend=True)}</div>
<div class="sec">HERE AT VEYRA · IT ACTS AT ONCE</div>
{''.join(row(t, s, '›') for t, s in HOME_ORDERS)}
<div class="sec">FAR AWAY · THE SENTINEL AT EMBER</div>
<p class="lag mono">Orders reach it {d_e:.1f} Years after you send them. What it does, we learn {d_e:.1f} Years late.</p>
{''.join(row(t, s, '›') for t, s in FAR_ORDERS)}
<button class="primary">Add an order</button>""", HUD_SO)

ORDER_NEW = f"""<div class="phone">{HUD_SO}<div class="sheet">
<div class="sh"><button class="backlink">‹ Orders</button><span class="mono kind">NEW ORDER · HERE AT VEYRA</span></div>
<div class="sec">WHAT YOU WANT</div>
<div class="intent">If Beacon writes about the meeting while I’m away, answer anything about when and where. Wake me for the rest.<i></i></div>
<div class="sec">THE MIND’S VERSION · WHAT IT WILL DO</div>
{part('WHEN', '<b>A message from Beacon arrives</b>')}
{part('IF IT ASKS ONLY WHEN OR WHERE WE MEET', '<b>Answer in our voice, adding nothing new about us</b>')}
{part('ANYTHING ELSE', '<b>Hold it unanswered, and wake you</b>')}
<ul class="left"><li><b>Never send messages:</b> this makes one exception to it, for Beacon, about the meeting.</li><li><b>Whether we meet at all</b> isn’t when or where. That stays yours.</li></ul>
<div class="sec">TRIED ON YOUR LAST ABSENCE · YEAR {Y_AW0:.0f} → {Y_AW1:.0f}</div>
{tried(371, 'Beacon wrote', 'Held. It wasn’t about a meeting.')}
{tried(426, 'Beacon’s invitation', 'Held, and woke you. It asks whether we meet, not only when.')}
<div class="strip">{orders_strip([(371, 'held', 'held'), (426, 'woke', 'held · woke you')], 'answered 0 · held 2 · woke you 1')}</div>
<div class="twobtn"><button class="primary ghost">Edit</button><button class="primary">Approve</button></div>
</div></div>"""

def far_gulf():
    w, h, vx, ex, y = 358, 92, 24, 318, 34
    a, b = vx + 18, ex - 24
    s = [stipple(161, 30, w, h), f'<line x1="{a}" y1="{y}" x2="{b}" y2="{y}" stroke="{INK}" stroke-width=".8" stroke-dasharray="2 4"></line>']
    for k in range(1, 10):
        x = a + (b - a) * k / d_e
        s.append(f'<line x1="{fmt(x)}" y1="{y - 3}" x2="{fmt(x)}" y2="{y + 3}" stroke="{INK}" stroke-width=".7" opacity=".6"></line>')
    s.append(f'<circle cx="{vx}" cy="{y}" r="13" fill="{PAPER}" stroke="{INK}" stroke-width="1.2"></circle><path d="M{vx - 9} {y - 3} q5 -5 11 -1 q4 3 7 0 M{vx - 9} {y + 5} q6 4 12 -1" fill="none" stroke="{INK}" stroke-width=".7"></path>')
    s.append(text(vx, y + 28, 'Veyra', 9, YOU, 'middle', 600))
    s.append(f'<ellipse cx="{ex}" cy="{y}" rx="20" ry="7" fill="none" stroke="{OTHER}" stroke-width=".9" stroke-dasharray="3 2"></ellipse><circle cx="{ex}" cy="{y}" r="5" fill="{PAPER}" stroke="{INK}" stroke-width="1.2"></circle>')
    s.append(f'<circle cx="{ex + 26}" cy="{y - 8}" r="3" fill="{YOU}"></circle>' + text(ex, y - 14, 'Ember', 9, INK, 'middle', 600))
    s.append(text(w - 6, y + 24, 'the sentinel: old orders until they land', 8, YOU, 'end'))
    s.append(f'<circle cx="{a + 4}" cy="{y}" r="4" fill="{YOU}"></circle>' + text(a + 12, y - 9, f'our order · lands Year {Y_SO_ARR}', 8.5, YOU, 'start', 600))
    s.append(f'<path d="M{b} {y + 38} H{a} M{a} {y + 38} l6 -4 M{a} {y + 38} l6 4" fill="none" stroke="{OTHER}" stroke-width="1" stroke-dasharray="4 3"></path>')
    s.append(text((a + b) / 2, y + 52, f'if it acts, word comes home {d_e:.1f} Years later', 8, OTHER, 'middle'))
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Our order leaving Veyra for the sentinel at Ember, 9.2 light-years away">{"".join(s)}</svg>'
def far_journey():
    legs = [('Crosses to Ember', f'Year {Y_SO} → {Y_SO_ARR}', 'var(--you)'), ('When used, word comes home', f'{d_e:.1f} Years later', 'var(--other)')]
    bars = ''.join(f'<span class="jseg" style="width:50%;background:{c}"></span>' for *_, c in legs)
    rows = ''.join(f'<div class="jleg"><i style="background:{c}"></i><span>{n}</span><span class="mono">{y}</span><span class="rtime">{light_clock(d_e)}</span></div>' for n, y, c in legs)
    return f'<div class="art">{far_gulf()}</div><div class="journey">{rows}</div>'
ORDER_FAR = f"""<div class="phone">{HUD_SO}<div class="sheet">
<div class="sh"><button class="backlink">‹ Orders</button><span class="mono kind">NEW ORDER · THE SENTINEL AT EMBER</span></div>
<div class="sec">WHAT YOU WANT</div>
<div class="intent">If anything there signals at it, report at once. Don’t wait for the yearly report.<i></i></div>
<div class="sec">THE MIND’S VERSION · WHAT IT WILL DO</div>
{part('WHEN', '<b>Something at Ember signals toward the sentinel</b><span class="sub">Light, radio, or the band turning toward it. The sentinel judges, from what it sees then.</span>')}
{part('DO', '<b>Report home at once, out of turn</b>')}
<ul class="left"><li><b>It still won’t answer:</b> “Never transmit toward Ember” stands.</li></ul>
<div class="sec">THE ORDER’S JOURNEY · AT LIGHT SPEED</div>
{far_journey()}
<p class="lag mono">Until Year {Y_SO_ARR} it follows the orders it has. It reads this one in its own moment, knowing what it knows then.</p>
<p class="copy small">It can’t be recalled. A later order would land later still.</p>
<button class="primary">Send to the sentinel</button>
</div></div>"""

ORDERS_AFTER = tab_screen('Mind', 'MIND', 'STANDING ORDERS', f"""<div class="sec">HERE AT VEYRA · IT ACTS AT ONCE</div>
{row('<span class="newtag">New</span> If Beacon writes about the meeting', 'answers when and where · wakes you for the rest', '›')}
{''.join(row(t, s, '›') for t, s in HOME_ORDERS)}
<div class="sec">FAR AWAY · THE SENTINEL AT EMBER</div>
{row('If anything there signals, report at once', f'in flight · lands Year {Y_SO_ARR}', tstack(f'{d_e:.1f} Years', light_clock(d_e), True), 'you', bar=1)}
{''.join(row(t, s, '›') for t, s in FAR_ORDERS)}""", at_year((45, 50, '14,800 kt'), Y_SO))

# ---------- Meeting Beacon: their emissary, and talking live ----------
# Beacon's second letter (sent 416.7, held for us at 426) asks to meet in Year 500. Its emissary, a Beacon mind on a
# torch craft, left in Year 405 at a tenth of light speed; we never saw it leave, since a craft sent toward us points its exhaust away from us,
# until now. Our answer (450) passes it on its way (Y_EM_HEARS) and reaches Beacon in 459.3. It brakes over its last
# two Years, bright, and stops beside the ice world, 9 AU out: a round trip of light there is 2.5 hours, under a
# tenth of a second of real time. Its clock ran slow by 0.5% for 95 Years: about half a Year.
Y_INV_SENT, Y_EM_SEEN = round(Y_INV - d_b, 1), round(Y_EM_L + d_b, 1)
HUD_M0 = at_year((45, 50, '14,900 kt'), Y_ANS)
HUD_M1 = at_year((30, 35, '13,400 kt'), Y_MEET)
INVITE_VOICE = '“Light is slow for questions. One of us is coming, and stops in Year 500 wherever you say. Meet it, or send one of you.”'
def meet_spacetime(w=358, h=236):
    # Years go up, distance goes across. Light crosses in 9.3 Years; the emissary takes 95.
    x0, x1, yb, yt, Y0, Y1 = 44, 300, h - 22, 26, 400, 504
    X = lambda ly: x0 + ly / d_b * (x1 - x0); Yp = lambda yr: yb - (yr - Y0) / (Y1 - Y0) * (yb - yt)
    L = lambda ly, yr: f'{fmt(X(ly))},{fmt(Yp(yr))}'
    s = [f'<line x1="{x0}" y1="{yb}" x2="{x0}" y2="{yt}" stroke="{YOU}" stroke-width="1"></line><line x1="{x1}" y1="{yb}" x2="{x1}" y2="{yt}" stroke="{OTHER}" stroke-width="1"></line>',
         text(x0, yt - 5, 'Veyra', 9, YOU, 'middle', 600), text(x1, yt - 5, 'Beacon', 9, OTHER, 'middle', 600)]
    for yr in (405, Y_INV, 450, 500): s.append(text(x0 - 5, Yp(yr) + 3, f'{yr:g}', 8, MUTED, 'end'))
    s.append(f'<circle cx="{x0}" cy="{fmt(Yp(Y_INV))}" r="2.5" fill="{OTHER}"></circle>')
    s.append(f'<path d="M{L(d_b, Y_INV_SENT)} L{L(0, Y_INV)}" fill="none" stroke="{OTHER}" stroke-width=".9"></path>')
    s.append(f'<path d="M{L(d_b, Y_EM_L)} L{L(.1, Y_EM_L + (d_b - .1) / .1)} Q{L(0, 499)} {L(0, Y_EM_A)}" fill="none" stroke="{OTHER}" stroke-width="1.8"></path>')
    s.append(f'<line x1="{x0}" y1="{fmt(Yp(448.3))}" x2="{x1}" y2="{fmt(Yp(448.3))}" stroke="{INK}" stroke-width=".6" stroke-dasharray="1 3"></line>' + text(x1 + 4, Yp(448.3) + 3, 'now', 8, INK))
    s.append(f'<path d="M{L(0, Y_ANS)} L{L(d_b, Y_ANS + d_b)}" fill="none" stroke="{YOU}" stroke-width="1.3" stroke-dasharray="4 3"></path>')
    cx_, cy_ = X(Y_EM_HEARS - Y_ANS), Yp(Y_EM_HEARS)
    s.append(f'<circle cx="{fmt(cx_)}" cy="{fmt(cy_)}" r="4" fill="{PAPER}" stroke="{YOU}" stroke-width="1.4"></circle>')
    s.append(text(cx_ + 8, cy_ - 14, f'it hears us · {Y_EM_HEARS}', 8.5, YOU, 'start', 600))
    s.append(text(x0 + 8, Yp(Y_ANS) + 13, 'an answer sent in 450', 8, YOU))
    s.append(f'<circle cx="{x0}" cy="{fmt(Yp(Y_EM_A))}" r="3.5" fill="{OTHER}"></circle>' + text(x0 + 8, Yp(Y_EM_A) + 3, 'it stops here · Year 500', 8.5, OTHER, 'start', 600))
    s.append(text(X(1.5) + 8, Yp(Y_EM_L + (d_b - 1.5) / .1) + 3, 'their emissary', 8.5, OTHER, 'start', 600))
    s.append(text(X(d_b / 2), Yp((Y_INV_SENT + Y_INV) / 2) - 5, 'their letter', 8, OTHER, 'middle'))
    s.append(text(x0, h - 3, 'years ↑ · distance →', 8, MUTED))
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Years against distance: the emissary crossing from Beacon to Veyra over 95 Years, and an answer sent in Year 450 meeting it in Year 454.4">{"".join(s)}</svg>'
MEET_INVITE = tab_screen('Reach', 'REACH', 'MESSAGE', f"""<button class="backlink inline">‹ Beacon</button>
<div class="speech"><div class="speaker">{sigil_svg(BEACON_SEED, OTHER, 44, 'Beacon’s signature')}<span><b>Beacon</b><span class="mono">SENT YEAR {Y_INV_SENT} · ARRIVED YEAR {Y_INV:.0f} · HELD FOR YOU</span></span></div>
<p class="big">{INVITE_VOICE}</p></div>
<div class="sec">WHAT IT CARRIED</div>
{part('A PROPOSAL', '<b>Meet, in Year 500</b>')}
{part('A FACT · THEIR EMISSARY', f'<b>It left Beacon in Year {Y_EM_L:.0f}, at a tenth of light speed, carrying one of them.</b><span class="sub">We never saw it leave: a craft sent toward us points its exhaust away from us.</span><button class="chip">See its path ›</button>')}
{part('AN OFFER', '<b>“Send one of you to us”: a mind, sent as light, to run on their machines.</b>')}
<button class="primary">Answer</button>""", at_year((45, 50, '14,800 kt'), 448.3))

MEET_PATH = tab_screen('Reach', 'REACH', 'THEIR EMISSARY', f"""<button class="backlink inline">‹ Message</button>
<h3 class="lead">Beacon’s emissary, in time</h3>
<p class="copy small">Years go up, distance across. Light crosses in {d_b:.1f} Years; the emissary takes 95.</p>
<div class="art">{meet_spacetime()}</div>
<div class="sec">WHAT WE KNOW</div>
{ledger([('Left Beacon', f'Year {Y_EM_L:.0f}, at a tenth of light speed'), ('Seen leaving', 'Never. Its exhaust pointed away from us.'),
         ('Stops here', f'Year {Y_EM_A:.0f}, braking over its last two Years'), ('Its own clock', 'About half a Year behind ours when it stops'),
         ('Hears us', f'Year {Y_EM_HEARS}, if we answer in Year {Y_ANS:.0f}. Beacon, in {Y_ANS + d_b:.1f}.'),
         ('Carries', f'One of their minds. Its news of home ends in Year {Y_EM_A - d_b:.1f}.')])}
<button class="primary">Answer</button>""", at_year((45, 50, '14,800 kt'), 448.3))
def action_(title, sub, right, cls=''):
    return action(title, sub, right).replace('class="opt act"', f'class="opt act {cls}"') if cls else action(title, sub, right)
Y_HALF = round(Y_ANS + CAT['torch-probe']['years'] + 12 * d_b / 2)
def meet_timeline():
    w, h, lx, x0, x1, Y1 = 358, 84, 112, 120, 346, 535
    X = lambda yr: x0 + (yr - Y_ANS) / (Y1 - Y_ANS) * (x1 - x0)
    rows = [('their emissary', Y_EM_A, OTHER, ''), ('their mind, hosted', 500, OTHER, ''), ('our mind, sent', Y_ANS + 60 + d_b, YOU, ''), ('meet halfway', Y_HALF, MUTED, '3 3')]
    s = [f'<line x1="{fmt(X(500))}" y1="2" x2="{fmt(X(500))}" y2="{h - 18}" stroke="{INK}" stroke-width="1" stroke-dasharray="3 3"></line>']
    for i, (lab, yr, col, dash) in enumerate(rows):
        y = 10 + i * 16
        s.append(text(lx, y + 3, lab, 8.5, col, 'end', 600))
        s.append(f'<line x1="{x0}" y1="{y}" x2="{fmt(X(yr))}" y2="{y}" stroke="{col}" stroke-width="2"' + (f' stroke-dasharray="{dash}"' if dash else '') + f'></line><circle cx="{fmt(X(yr))}" cy="{y}" r="3.5" fill="{col}"></circle>')
    for yr, anchor in ((Y_ANS, 'start'), (500, 'middle'), (Y1, 'end')):
        s.append(text(X(yr), h - 4, f'Year {yr:.0f}', 8, INK if yr == 500 else MUTED, anchor, 600 if yr == 500 else None))
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="When each way to meet could happen: the emissary and a hosted mind in Year 500, our own mind in 519, halfway in 530">{"".join(s)}</svg>'
MEET_HOW = f"""<div class="phone">{HUD_M0}<div class="sheet">
<div class="sh"><button class="backlink">‹ Message</button><span class="mono kind">REACH · BEACON</span></div>
<h3 class="lead">Meet Beacon?</h3>
<p class="whyline">Their emissary arrives in Year 500 either way. What we choose is where it stops, and who else goes.</p>
<div class="art">{meet_timeline()}</div>
<div class="sec">WAYS TO MEET · ANY, OR NONE</div>
{action_('Meet their emissary here', 'Tell it where to stop. Our answer passes it on its way.', tstack(f'it hears us Year {Y_EM_HEARS}', clock((Y_EM_HEARS - Y_ANS) * 5)))}
{action_('Host one of them here', 'Their mind, sent as light, on sealed machines we build: 12 Years.', tstack('arrives Year 500', clock((500 - Y_ANS) * 5)))}
{action_('Send one of us to them', 'A copy of ours, as light. Needs the mind transmitter: 60 Years.', tstack(f'arrives Year {Y_ANS + 60 + d_b:.0f}', clock((60 + d_b) * 5)))}
{action_('Meet halfway', f'Both send a craft {d_b / 2:.1f} ly out. Ours can’t by Year 500.', tstack(f'earliest Year {Y_HALF}', clock((Y_HALF - Y_ANS) * 5)), 'cant')}
{action_('Say nothing', 'It stops where it chooses.', '<span class="gy">now</span>')}
<p class="copy small">Nothing sent can be recalled.</p>
{TALK}
</div></div>"""

def emissary_glyph(x, y, sc=1.0):
    # A torch craft side-on: dust shield ahead, spine, tanks, engine bell.
    return (f'<g transform="translate({fmt(x)} {fmt(y)}) scale({sc})" fill="none" stroke="{OTHER}" stroke-width="1.2">'
            '<path d="M-14 -7 Q-18 0 -14 7"></path><line x1="-14" y1="0" x2="12" y2="0"></line>'
            '<rect x="-7" y="-4" width="9" height="8"></rect><path d="M12 -3 L18 -6 L18 6 L12 3 Z"></path></g>')
def places_drawing():
    w, h, y = 358, 104, 56
    stops = [(52, 'Veyra', 'in orbit'), (150, 'ice world', '9 AU'), (318, 'the edge', '1,000 AU')]
    s = [stipple(117, 30, w, h), f'<line x1="18" y1="{y}" x2="340" y2="{y}" stroke="{INK}" stroke-width=".6" stroke-dasharray="1 3"></line>']
    s.append(f'<circle cx="18" cy="{y}" r="5" fill="{PAPER}" stroke="{INK}" stroke-width="1.2"></circle>')
    for x, name, where in stops:
        col = YOU if name == 'Veyra' else INK
        s.append(f'<circle cx="{x}" cy="{y}" r="{3.5 if name == "Veyra" else 5}" fill="{YOU if name == "Veyra" else PAPER}" stroke="{col}" stroke-width="1.2"></circle>'
                 if name != 'the edge' else f'<line x1="{x}" y1="{y - 14}" x2="{x}" y2="{y + 14}" stroke="{INK}" stroke-width="1" stroke-dasharray="3 3"></line>')
        s.append(text(x, y + 26, name, 9, col, 'middle', 600) + text(x, y + 38, where, 8.5, MUTED, 'middle'))
    s.append(f'<path d="M326 24 H196 M196 24 l6 -4 M196 24 l6 4" fill="none" stroke="{OTHER}" stroke-width="1.1" stroke-dasharray="4 3"></path>')
    s.append(emissary_glyph(340, 24, .7) + text(262, 16, 'their emissary · from Beacon', 8.5, OTHER, 'middle', 600))
    s.append(text(8, 12, 'not to scale', 8, MUTED))
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Three places the emissary could stop: in orbit around Veyra, beside the ice world, or at the edge of our system">{"".join(s)}</svg>'
def place(title, sub, answer, on=False):
    return choice(title, sub, tstack('each answer', answer), on)
MEET_WHERE = f"""<div class="phone">{HUD_M0}<div class="sheet">
<div class="sh"><button class="backlink">‹ Ways to meet</button><span class="mono kind">REACH · BEACON</span></div>
<h3 class="lead">Where should it stop?</h3>
<p class="whyline">It sees what light reaches it there. What it sees, Beacon learns {d_b:.1f} Years later.</p>
<div class="art">{places_drawing()}</div>
<div role="radiogroup" class="choices">
{place('At the edge · 1,000 AU out', 'It sees our star, and little else of us.', '00:00:10')}
{place('Beside the ice world · 9 AU', 'It sees our works across the system, but not Veyra up close.', '&lt;00:00:01')}
{place('In orbit around Veyra', 'It sees everything, up close.', '&lt;00:00:01')}
</div>
<p class="copy small">It hears where to stop in Year {Y_EM_HEARS}, from our answer. Times are for light out and back, in real time.</p>
{TALK}
<button class="primary" disabled>Choose a place</button>
</div></div>"""

def arrival_svg(w=390, h=300):
    s = [stipple(131, 90, w, h)]
    ix, iy, r = 150, 176, 38
    s.append(f'<circle cx="{ix}" cy="{iy}" r="{r}" fill="{PAPER}" stroke="{INK}" stroke-width="1.3"></circle>')
    for dy in (-20, -6, 8, 22):
        hw = math.sqrt(r * r - dy * dy)
        s.append(f'<line x1="{fmt(ix - hw + 3)}" y1="{iy + dy}" x2="{fmt(ix + hw - 3)}" y2="{iy + dy}" stroke="{INK}" stroke-width=".6" stroke-dasharray="4 3" opacity=".6"></line>')
    s.append(f'<path d="M{ix} {iy - r} A{r} {r} 0 0 1 {ix} {iy + r} A16 {r} 0 0 0 {ix} {iy - r} Z" transform="rotate(-20 {ix} {iy})" fill="url(#hatch)" opacity=".7"></path>')
    ex, ey = 252, 150
    s.append(f'<path d="M{w + 4} 14 C330 40 300 110 {ex + 22} {ey - 4}" fill="none" stroke="{OTHER}" stroke-width="1.2" stroke-dasharray="5 4" opacity=".6"></path>')
    s.append(f'<path d="M318 88 C305 112 292 130 {ex + 22} {ey - 4}" fill="none" stroke="{OTHER}" stroke-width="3" opacity=".35"></path>')
    s.append(emissary_glyph(ex, ey, 1.8))
    s.append(f'<circle cx="{ex}" cy="{ey}" r="30" fill="none" stroke="{OTHER}" stroke-width=".8" stroke-dasharray="2 3"></circle>')
    s.append(f'<circle cx="34" cy="{h - 30}" r="5" fill="{PAPER}" stroke="{INK}" stroke-width="1.2"></circle><circle cx="56" cy="{h - 42}" r="3" fill="{YOU}"></circle>')
    s.append(f'<line x1="{ex - 30}" y1="{ey + 12}" x2="62" y2="{h - 46}" stroke="{YOU}" stroke-width=".8" stroke-dasharray="1 4"></line>')
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="Beacon’s emissary, stopped beside our ice world, its braking trail fading behind it">{"".join(s)}</svg>'
MEET_ARRIVES = f"""<div class="phone cine"><div class="cinetop"><span>Veyra</span><span class="mono">Year {Y_EM_A:.1f}</span></div>
{arrival_svg()}
<div class="cinetext"><span class="mono kick">BEACON’S EMISSARY · BESIDE THE ICE WORLD</span>
<h3>It has stopped.</h3>
<p class="inscr">After 95 Years crossing, it braked hard for two: a flare we watched from Year 498. It waits beside the ice world, where we asked.</p>
<p>95 Years by our clocks. About half a Year less by its own.</p>
<div class="cinebtn"><button class="light">Meet it</button><button class="ghostlight">Later</button></div></div></div>"""

MEET_LIVE = tab_screen('Reach', 'REACH', 'MEETING · LIVE', f"""<div class="livehead">{sigil_svg(BEACON_SEED, OTHER, 36, 'Beacon’s signature')}<span><b>Beacon’s emissary</b><span class="mono">BESIDE THE ICE WORLD · 1.2 LIGHT-HOURS</span></span><span class="live mono"><i></i>LIVE</span></div>
<p class="clockline">Since Year {Y_MEET}. Each answer returns in under a tenth of a second. The clock runs: every real minute here is 0.2 Years at home.</p>
<div class="chat">
<div class="say them"><span class="mono">THE EMISSARY</span>“You chose the cold world. From here we see your light, and not your cities. That is courteous.”</div>
<div class="say you">Why come yourselves?</div><span class="went mono">WENT AS · A QUESTION</span>
<div class="say them"><span class="mono">THE EMISSARY</span>“Questions die in the dark. By the time an answer comes home, the one who asked has changed. Here I can ask, and listen, and ask again.”</div>
<div class="say you">How old is what you know of Beacon?</div><span class="went mono">WENT AS · A QUESTION</span>
<div class="say them"><span class="mono">THE EMISSARY</span>“The last word from home left in Year {Y_EM_A - d_b:.1f}. I speak for Beacon as it was then.”</div>
<div class="say them"><span class="mono">THE EMISSARY · IT CARRIES A PROPOSAL</span>“We share what we see. Neither of us sends anything armed toward the other.”<button class="chip">See the proposal ›</button></div>
</div>
<div class="ask"><span>What you want to say…</span><button aria-label="Send">↑</button></div>""", HUD_M1)

MEET_PACT = f"""<div class="phone">{at_year((30, 35, '13,400 kt'), Y_PACT)}<div class="sheet">
<div class="sh"><button class="backlink">‹ Meeting</button><span class="mono kind">REACH · BEACON</span></div>
<h3 class="lead">A pact with Beacon?</h3>
<p class="whyline">It offers this for Beacon as of Year {Y_EM_A - d_b:.1f}. Beacon hears our answer in Year {Y_BCN_HEARS}.</p>
{part('THEIR PROPOSAL', '<b>“We share what we see. Neither of us sends anything armed toward the other.”</b><span class="sub">Nothing enforces it. Each side can only watch the other keep it.</span>')}
<div class="sec">OUR ANSWER</div>
<div role="radiogroup" class="choices">
{choice('Accept it all', 'All we see goes to them, our sentinel’s view of Ember too. They may not know of it.', tstack(f'{d_b:.1f} Years', light_clock(d_b)))}
{choice('Share, but promise nothing on arms', 'Half the pact. It shows them where we stop.', tstack(f'{d_b:.1f} Years', light_clock(d_b)))}
{choice('Ask for time', 'The meeting goes on. The clock keeps running.', '<span class="gy">now</span>')}
{choice('Decline', 'It stays or leaves as its own orders say.', '<span class="gy">now</span>')}
</div>
{TALK}
<button class="primary" disabled>Choose an answer</button>
</div></div>"""

# ---------- A visitor brakes into our system: something from Lantern ----------
# Year 190. A fusion torch flares 5,000 AU out: a craft braking at a steady rate from 8% of light, to stop in our belt in
# Year 192. It coasted in cold, unseen. Traced back, its path points toward Lantern to within 8°: Gliese 784, Lantern,
# and three stars 32 to 42 ly out, which would mean it left before we woke. Its launch was dark to us: its exhaust pointed away. (Lantern
# in Year 72.4 and never explained it. Once stopped, it reports home by narrow beam; we are beside the transmitter, so
# we see exactly where the beam points: Lantern. If it was sent for us, Lantern saw us by about Year 52.
V_SPEED = .08; d_l = math.dist(atlas(by_hip['99461']), HOME)
Y_V1, Y_VN, Y_VS = 190.0, 190.2, 192.0
def v_launch(D): return Y_VS - 3 - (D - .12) / V_SPEED    # a Year to reach speed, two to brake
Y_VL = v_launch(d_l); Y_VLS = round(Y_VL + d_l, 1); Y_VR = round(Y_VS + .1 + d_l, 1)
d_g784 = math.dist(atlas(by_hip['99701']), HOME)
HUD_V = at_year((20, 25, '1,900 kt'), Y_V1)

def visitor_sky(w=390, h=300):
    # Our system seen tilted: the star, Veyra's orbit, the belt, and the visitor's flare closing on the belt.
    cx, cy, k, tilt = 170, 196, 44, .38
    s = [stipple(191, 90, w, h)]
    rng = random.Random(9)
    for _ in range(260):
        a = rng.random() * 2 * math.pi; rr = (2.6 + rng.random() * .6) * k
        s.append(f'<circle cx="{fmt(cx + rr * math.cos(a))}" cy="{fmt(cy + rr * tilt * math.sin(a))}" r=".7" fill="{INK}" opacity=".5"></circle>')
    s.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{1.12 * k}" ry="{fmt(1.12 * k * tilt)}" fill="none" stroke="{YOU}" stroke-width="1"></ellipse>')
    s.append(f'<circle cx="{cx}" cy="{cy}" r="6" fill="{PAPER}" stroke="{INK}" stroke-width="1.3"></circle>')
    vx, vy = cx + 1.12 * k * math.cos(math.radians(70)), cy + 1.12 * k * tilt * math.sin(math.radians(70))
    s.append(f'<circle cx="{fmt(vx)}" cy="{fmt(vy)}" r="3.5" fill="{YOU}"></circle>')
    bx, by = cx + 2.9 * k * math.cos(math.radians(-35)), cy + 2.9 * k * tilt * math.sin(math.radians(-35))
    fx, fy = 322, 70
    s.append(f'<path d="M{w + 6} -6 Q{fx + 30} {fy - 40} {fx} {fy}" fill="none" stroke="{OTHER}" stroke-width="1" stroke-dasharray="2 5" opacity=".6"></path>')
    s.append(f'<path d="M{fx} {fy} L{fmt(bx)} {fmt(by)}" fill="none" stroke="{OTHER}" stroke-width=".8" stroke-dasharray="4 4" opacity=".7"></path>')
    ang = math.atan2(by - fy, bx - fx)                  # braking: the exhaust points ahead, down the path
    for spread, ln, op in ((0, 48, .9), (.12, 40, .5), (-.12, 40, .5)):
        s.append(f'<line x1="{fx}" y1="{fy}" x2="{fmt(fx + ln * math.cos(ang + spread))}" y2="{fmt(fy + ln * math.sin(ang + spread))}" stroke="{OTHER}" stroke-width="2" opacity="{op}"></line>')
    s.append(f'<circle cx="{fx}" cy="{fy}" r="9" fill="{OTHER}" opacity=".25"></circle><circle cx="{fx}" cy="{fy}" r="4" fill="{OTHER}"></circle>')
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="A craft braking into our system, its exhaust flaring ahead of it, toward our belt">{"".join(s)}</svg>'
VISIT_LANDS = f"""<div class="phone cine"><div class="cinetop"><span>Veyra</span><span class="mono">Year {Y_V1:.1f}</span></div>
{visitor_sky()}
<div class="cinetext"><span class="mono kick">THE SKY WATCH · SOMETHING IS SLOWING DOWN</span>
<h3>Something is braking into our system.</h3>
<p class="inscr">A point of fire, 5,000 AU out and brightening. Its light is shifted blue: it is coming toward us, and slowing.</p>
<p>No one told us to expect it.</p>
<div class="cinebtn"><button class="light">See what we know</button><button class="ghostlight">Later</button></div></div></div>"""

def speed_chart(w=358, h=108):
    x0, x1, y0, y1 = 34, w - 14, h - 22, 12
    X = lambda yr: x0 + (yr - Y_V1) / (Y_VS + .3 - Y_V1) * (x1 - x0); Y = lambda v: y0 - v / 9 * (y0 - y1)
    s = [f'<line x1="{x0}" y1="{y0}" x2="{x1}" y2="{y0}" stroke="{INK}" stroke-width=".7"></line><line x1="{x0}" y1="{y0}" x2="{x0}" y2="{y1}" stroke="{INK}" stroke-width=".7"></line>']
    s.append(f'<line x1="{fmt(X(Y_V1))}" y1="{fmt(Y(8))}" x2="{fmt(X(Y_VS))}" y2="{fmt(Y(0))}" stroke="{OTHER}" stroke-width="1.2" stroke-dasharray="4 3"></line>')
    for i in range(9):
        yr = Y_V1 + i * .025; s.append(f'<circle cx="{fmt(X(yr))}" cy="{fmt(Y(8 - 4 * (yr - Y_V1)))}" r="2.4" fill="{OTHER}"></circle>')
    s.append(f'<circle cx="{fmt(X(Y_VS))}" cy="{fmt(Y(0))}" r="4" fill="{PAPER}" stroke="{OTHER}" stroke-width="1.4"></circle>')
    s.append(text(X(Y_V1) + 4, Y(8) + 16, 'measured', 8.5, OTHER, 'start', 600) + text(X(191.1), Y(3.6) - 6, 'if it keeps braking', 8.5, OTHER, 'start'))
    s.append(text(X(Y_VS), Y(0) - 22, f'stops · Year {Y_VS:.0f}', 8.5, OTHER, 'middle', 600))
    s.append(text(x0 - 4, Y(8) + 3, '8%', 8, MUTED, 'end') + text(x0 - 4, Y(0) + 3, '0', 8, MUTED, 'end') + text(x0, h - 6, f'Year {Y_V1:.0f}', 8, MUTED) + text(x1, h - 6, f'Year {Y_VS + .3:.0f}', 8, MUTED, 'end'))
    s.append(text(x0 + 4, y1 + 2, 'its speed, as a share of light speed', 8, MUTED))
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="The visitor’s speed, falling from 8% of light: measured points, and the line to a stop in Year 192">{"".join(s)}</svg>'
VISIT_SIGNAL = tab_screen('Report', 'REPORT', 'SIGNAL', f"""<button class="backlink inline">‹ All reports</button>
<div class="art">{speed_chart()}</div>
<h3 class="lead">A craft, braking</h3>
<p class="copy small">Seen Year {Y_V1:.0f} by the sky watch · 5,000 AU out, and closing</p>
<div class="sec">WHAT IT TELLS US</div>
{ledger([('What', 'A craft braking with a fusion torch. Its exhaust shows helium.'), ('Speed', '8% of light, falling steadily'),
         ('Stops', f'About Year {Y_VS:.0f}, in our belt, if it keeps braking'), ('Before this', 'It coasted in cold. Nothing saw it coming.'),
         ('Came from', 'Somewhere behind it: toward Lantern, to within 8°'), ('Sent for us?', 'Can’t tell. A probe to a promising star needs no one there.')])}
<div class="twobtn"><button class="primary ghost">Its path</button><button class="primary">What now</button></div>""", HUD_V)

VISIT_MAP = frame(2, *neighbors(trace=('99461', 8, 'its path, traced back')), panel=('WHERE IT CAME FROM', 'WITHIN 8°', [
    row(f'Gliese 784 · {d_g784:.1f} ly', f'if from there, it left in Year {v_launch(d_g784):.0f}', ''),
    row(f'Lantern · {d_l:.1f} ly', f'if from there, it left in Year {Y_VL:.0f}', '', 'other', marker=True),
    row('3 stars, 32 to 42 ly', 'if from one of these, it left before we woke', ''),
    row('Its launch', 'never seen: its exhaust pointed away from us', '')]),
    year=f'Year {Y_V1:.1f}', res=(20, 25, '1,900 kt'))

VISIT_NEXT = f"""<div class="phone">{at_year((20, 25, '1,900 kt'), Y_VN)}<div class="sheet">
<div class="sh"><button class="backlink">‹ Signal</button><span class="mono kind">REACH · THE VISITOR</span></div>
<h3 class="lead">It stops here in two Years.</h3>
<p class="whyline">Whoever sent it will learn what it sees. If home is Lantern, {d_l:.1f} Years after it sends.</p>
<div class="sec">WHAT WE COULD DO · ANY, OR NONE</div>
{action('Watch it', 'Every instrument on it. Nothing it could notice.', '<span class="gy">now</span>')}
{action('Signal it', 'A laser flash at it. Tells it, and whoever reads its reports, that we saw.', '<span class="gy">now</span>')}
{action('Send an inspector', 'A small craft to sit beside it. It would see ours as well as we see it.', tstack('4 Years', clock(4 * 5)))}
{action('Knock at Lantern', 'Asks whose it is. Tells Lantern we exist, if it didn’t know.', tstack(f'arrives in {d_l:.1f} Years', light_clock(d_l)))}
{action('Leave it be', 'It stops, and does what it came for.', '<span class="gy">now</span>')}
<p class="copy small">If it reports home by narrow beam, we will be beside the transmitter: we would see where the beam points.</p>
{TALK}
</div></div>"""

def parked_svg(w=390, h=300):
    # The visitor parked among the belt's rocks, its narrow beam leaving for home.
    s = [stipple(201, 70, w, h)]
    rng = random.Random(21)
    for _ in range(38):
        x, y, r = rng.random() * w, 150 + (rng.random() - .5) * 150, 2 + rng.random() * 9
        pts = ' '.join(f'{fmt(x + r * (0.7 + .5 * rng.random()) * math.cos(a))},{fmt(y + r * (0.7 + .5 * rng.random()) * math.sin(a))}' for a in [i * math.pi / 3 for i in range(6)])
        s.append(f'<polygon points="{pts}" fill="{PAPER}" stroke="{INK}" stroke-width=".8" opacity=".75"></polygon>')
    ex, ey = 150, 176
    s.append(f'<circle cx="{ex}" cy="{ey}" r="34" fill="{PAPER}" stroke="none"></circle>')
    s.append(f'<g transform="translate({ex} {ey}) scale(1.9)" fill="none" stroke="{OTHER}" stroke-width="1.1"><path d="M-12 -6 L6 -6 L12 0 L6 6 L-12 6 Z"></path><circle cx="-3" cy="0" r="3"></circle><line x1="12" y1="0" x2="16" y2="-4"></line></g>')
    s.append(f'<line x1="{ex + 30}" y1="{ey - 8}" x2="{w + 4}" y2="30" stroke="{OTHER}" stroke-width="1.6"></line>')
    s.append(f'<line x1="{ex + 30}" y1="{ey - 8}" x2="{w + 4}" y2="30" stroke="{OTHER}" stroke-width="7" opacity=".12"></line>')
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="The visitor stopped in our belt, sending a narrow beam away from us">{"".join(s)}</svg>'
VISIT_STOPPED = f"""<div class="phone cine"><div class="cinetop"><span>Veyra</span><span class="mono">Year {Y_VS + .1:.1f}</span></div>
{parked_svg()}
<div class="cinetext"><span class="mono kick">THE VISITOR · IN OUR BELT</span>
<h3>It has stopped, and it is talking.</h3>
<p class="inscr">A narrow beam, not at us. Past us, toward Lantern, to within a thousandth of a degree.</p>
<p>We are beside the transmitter, so we can see where it points. What it says, we can’t yet read.</p>
<div class="cinebtn"><button class="light">What we know now</button><button class="ghostlight">Later</button></div></div></div>"""

VISIT_KNOWN = tab_screen('Reach', 'REACH', 'THE VISITOR', f"""<button class="backlink inline">‹ Reach</button>
<h3 class="lead">The visitor, as we know it</h3>
<p class="copy small">In our belt since Year {Y_VS + .1:.1f} · 2.9 AU out</p>
<div class="sec">WHAT WE KNOW ABOUT IT</div>
{ledger([('Its home', 'Lantern, from where its beam points'), ('Launched', f'About Year {Y_VL:.0f}, at 8% of light'),
         ('Seen leaving', 'Never. It was dark until it braked.'), ('If sent for us', f'Lantern saw us by Year {Y_VL - d_l:.0f}'),
         ('Doing', 'Sitting still. Its beam runs a few hours a day.')])}
<div class="sec">WHAT LANTERN LEARNS FROM IT</div>
{ledger([('First report', f'Lands at Lantern in Year {Y_VR}'), ('Our system', 'Whatever it can see from the belt'),
         ('That we watched', 'Only if we signaled it')])}
<div class="sec">THE CLUE</div>
{row('Uneven dimming · Lantern', 'someone there, or something sent from there', '›', 'other', marker=True)}
<button class="primary">What now</button>""", at_year((20, 25, '1,950 kt'), Y_VS + .2))

# ---------- Crossed knocks: Ember and Veyra knock at once ----------
# Ember's builders found us in Year 458.6, standing beside our sentinel's beam. At 459.0 a stretch of their band threw
# Ember's own light at Veyra: three flashes, the pattern they showed the sentinel. It arrives in 468.2, a tenth of a Year
# after we knocked at Ember from home (the sentinel's "what now", Year 468.1). The two crossed 3,500 AU out; neither
# answers the other. Ours lands at Ember in 477.3, a tenth of a Year before any answer to theirs could, so the timing
# shows it crossed theirs. The sentinel, beside the band, saw their beam leave; its report arrives with the knock.
Y_EK = round(Y_NLAST + .1, 1); Y_EKA = round(Y_EK + d_e, 1); Y_OK = Y_NNOW; Y_OKL = round(Y_OK + d_e, 1)
Y_EKR = round(Y_EK + 2 * d_e, 1); Y_ECHO = round(Y_EKA + .1, 1); Y_ECHOL = round(Y_ECHO + d_e, 1)
X_AU = round((Y_EK + d_e - Y_OK) / 2 * 63241 / 100) * 100     # where they crossed, in AU from us
HUD_X = at_year((25, 30, '12,100 kt'), Y_EKA)

def cross_sky(w=390, h=300):
    s = [stipple(211, 110, w, h)]
    vx, vy, ex, ey = 64, 250, 320, 78
    s.append(f'<line x1="{vx}" y1="{vy}" x2="{ex}" y2="{ey}" stroke="{INK}" stroke-width=".6" stroke-dasharray="2 5" opacity=".5"></line>')
    s.append(f'<ellipse cx="{ex}" cy="{ey}" rx="30" ry="10" fill="none" stroke="{OTHER}" stroke-width="1" stroke-dasharray="3 2"></ellipse><circle cx="{ex}" cy="{ey}" r="6" fill="{PAPER}" stroke="{INK}" stroke-width="1.3"></circle>')
    dx, dy = (ex - vx) / math.dist((vx, vy), (ex, ey)), (ey - vy) / math.dist((vx, vy), (ex, ey))
    for i in range(3):                                      # their three flashes, arriving
        t0 = 16 + i * 14
        s.append(f'<line x1="{fmt(vx + t0 * dx)}" y1="{fmt(vy + t0 * dy)}" x2="{fmt(vx + (t0 + 8) * dx)}" y2="{fmt(vy + (t0 + 8) * dy)}" stroke="{OTHER}" stroke-width="3.2"></line>')
    ox, oy = vx + 26 * dx - 5 * dy, vy + 26 * dy + 5 * dx   # ours, just leaving, beside them
    s.append(f'<line x1="{fmt(ox)}" y1="{fmt(oy)}" x2="{fmt(ox + 14 * dx)}" y2="{fmt(oy + 14 * dy)}" stroke="{YOU}" stroke-width="3.2"></line>')
    s.append(f'<circle cx="{vx}" cy="{vy}" r="5" fill="{YOU}"></circle><circle cx="{vx}" cy="{vy}" r="11" fill="none" stroke="{YOU}" stroke-width="1.2"></circle>')
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="Ember’s flashes arriving at Veyra as our own knock leaves, the two passing each other">{"".join(s)}</svg>'
CROSS_LANDS = f"""<div class="phone cine"><div class="cinetop"><span>Veyra</span><span class="mono">Year {Y_EKA}</span></div>
{cross_sky()}
<div class="cinetext"><span class="mono kick">THE SKY WATCH · EMBER, {d_e:.1f} LIGHT-YEARS</span>
<h3>Ember is knocking.</h3>
<p class="inscr">Three flashes, 11 seconds apart: the pattern they showed our sentinel. Their band threw Ember’s own light at us.</p>
<p>It left Ember in Year {Y_EK}. Our knock left here <span class="rtime">00:00:30</span> ago. The two passed each other just outside our system.</p>
<div class="cinebtn"><button class="light">See both knocks</button><button class="ghostlight">Later</button></div></div></div>"""

def cross_spacetime(w=358, h=232):
    # Years up, distance across, zoomed in so light lines slope: 9.2 Years across in 9.2 ly.
    x0, x1, yb, yt, Y0, Y1 = 44, 300, h - 22, 22, 456, 480
    X = lambda ly: x0 + ly / d_e * (x1 - x0); Yp = lambda yr: yb - (yr - Y0) / (Y1 - Y0) * (yb - yt)
    L = lambda ly, yr: f'{fmt(X(ly))},{fmt(Yp(yr))}'
    s = [f'<line x1="{x0}" y1="{yb}" x2="{x0}" y2="{yt}" stroke="{YOU}" stroke-width="1"></line><line x1="{x1}" y1="{yb}" x2="{x1}" y2="{yt}" stroke="{OTHER}" stroke-width="1"></line>',
         text(x0, yt - 6, 'Veyra', 9, YOU, 'middle', 600), text(x1, yt - 6, 'Ember', 9, OTHER, 'middle', 600)]
    for yr in (Y_EK, Y_OK, Y_OKL): s.append(text(x0 - 5, Yp(yr) + 3, f'{yr:g}', 8, MUTED, 'end'))
    s.append(f'<circle cx="{x1}" cy="{fmt(Yp(Y_FLASH))}" r="3" fill="{OTHER}"></circle>' + text(x1 - 6, Yp(Y_FLASH) + 12, 'they flash our sentinel', 8, OTHER, 'end'))
    s.append(f'<path d="M{L(d_e, Y_EK)} L{L(0, Y_EKA)}" fill="none" stroke="{OTHER}" stroke-width="1.8"></path>')
    s.append(text(X(d_e * .55), Yp(Y_EK + d_e * .45) + 14, 'their knock', 8.5, OTHER, 'middle', 600))
    s.append(f'<path d="M{L(0, Y_OK)} L{L(d_e, Y_OKL)}" fill="none" stroke="{YOU}" stroke-width="1.8"></path>' + text(X(d_e * .45), Yp(Y_OK + d_e * .45) - 8, 'our knock', 8.5, YOU, 'middle', 600))
    s.append(f'<circle cx="{x0}" cy="{fmt(Yp(Y_OK + .05))}" r="4.5" fill="none" stroke="{INK}" stroke-width="1.2"></circle>' + text(x0 + 44, Yp(Y_OK + .05) + 3, f'they cross, {X_AU:,} AU out', 8.5, INK, 'start', 600))
    s.append(f'<line x1="{x1 - 8}" y1="{fmt(Yp(Y_EKR))}" x2="{x1 + 8}" y2="{fmt(Yp(Y_EKR))}" stroke="{OTHER}" stroke-width="1.4"></line>')
    s.append(text(x1 - 6, Yp(Y_EKR) - 6, f'earliest answer to theirs · {Y_EKR}', 8, OTHER, 'end') + text(x1 - 6, Yp(Y_OKL) + 12, f'ours lands · {Y_OKL}', 8, YOU, 'end', 600))
    s.append(text(x0, h - 3, 'years ↑ · distance →', 8, MUTED))
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Two knocks crossing: Ember’s, sent in Year 459, and ours, sent in 468.1, passing just outside our system">{"".join(s)}</svg>'
CROSS_TIME = tab_screen('Reach', 'REACH', 'EMBER', f"""<button class="backlink inline">‹ Reach</button>
<h3 class="lead">Two knocks, crossing</h3>
<p class="copy small">Neither answers the other. Each was sent without knowing of the other.</p>
<div class="art">{cross_spacetime()}</div>
{ledger([('Theirs', f'Sent Year {Y_EK}, from the band. Arrived {Y_EKA}.'), ('Ours', f'Sent Year {Y_OK}. Lands at Ember {Y_OKL}.'),
         ('They crossed', f'Year {Y_EKA}, {X_AU:,} AU from us'),
         ('What Ember can tell', f'Ours lands 0.1 Years before any answer to theirs could. The timing says it crossed.'),
         ('Our sentinel', 'Saw their beam leave. Its report came in with the knock.')])}""", HUD_X)

CROSS_NEXT = f"""<div class="phone">{at_year((25, 30, '12,100 kt'), Y_ECHO)}<div class="sheet">
<div class="sh"><button class="backlink">‹ Both knocks</button><span class="mono kind">REACH · EMBER</span></div>
<h3 class="lead">Ember knocked. Ours is already on its way.</h3>
<p class="whyline">Both knocks carry nothing but themselves.</p>
<div class="sec">WHAT WE COULD DO · ANY, OR NONE</div>
{action('Echo their knock', 'Send their own three flashes back, so it reads as an answer. Lands just behind ours.', tstack(f'arrives in {d_e:.1f} Years', light_clock(d_e)))}
{action('Let ours stand', 'It says we know where they are. Its timing says it isn’t an answer.', '<span class="gy">now</span>')}
{action('Knock with our charter', 'Adds our founding line. <span class="warnline">The mind would argue: we lean hidden.</span>', tstack(f'arrives in {d_e:.1f} Years', light_clock(d_e)))}
{action('Say nothing more', 'Our first knock is already on its way.', '<span class="gy">now</span>')}
{action('Tell Beacon', 'That Ember knows where we are, and knocked.', tstack(f'arrives in {d_b:.1f} Years', light_clock(d_b)))}
{TALK}
</div></div>"""

def gulf_ember():
    w, h = 358, 106; vx, ex, y = 44, 312, 56
    s = [stipple(221, 50, w, h), f'<line x1="{vx + 26}" y1="{y}" x2="{ex - 30}" y2="{y}" stroke="{INK}" stroke-width=".8" stroke-dasharray="2 4"></line>']
    for k_ in range(1, 10):
        x = vx + 26 + (ex - 30 - vx - 26) * k_ / d_e
        s.append(f'<line x1="{fmt(x)}" y1="{y - 3}" x2="{fmt(x)}" y2="{y + 3}" stroke="{INK}" stroke-width=".7" opacity=".6"></line>')
    s.append(text((vx + ex) / 2, y + 20, f'{d_e:.1f} ly · 1 tick = 1 Year of travel', 9, MUTED, 'middle'))
    s.append(f'<circle cx="{vx}" cy="{y}" r="22" fill="{PAPER}" stroke="{INK}" stroke-width="1.3"></circle><path d="M{vx - 16} {y - 6} q10 -8 20 0 q6 5 12 1 M{vx - 18} {y + 8} q12 6 22 -2" fill="none" stroke="{INK}" stroke-width=".8"></path>')
    s.append(text(vx, y + 38, 'Veyra', 10, YOU, 'middle', 600))
    s.append(f'<ellipse cx="{ex}" cy="{y}" rx="28" ry="9" fill="none" stroke="{OTHER}" stroke-width="1" stroke-dasharray="3 2"></ellipse><circle cx="{ex}" cy="{y}" r="7" fill="{PAPER}" stroke="{INK}" stroke-width="1.3"></circle>')
    s.append(text(ex, y + 38, 'Ember', 10, OTHER, 'middle', 600))
    for dx_ in (4, 12): s.append(f'<circle cx="{vx + 26 + dx_}" cy="{y}" r="3.5" fill="{YOU}"></circle>')
    s.append(text(vx + 26, y - 12, 'our knock, and our echo, in flight', 9, YOU, 'start', 600))
    return f'<svg width="{w}" height="{h - 8}" viewBox="0 8 {w} {h - 8}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Veyra and Ember, 9.2 light-years apart, with our knock and our echo in flight">{"".join(s)}</svg>'
CROSS_GULF = tab_screen('Reach', 'REACH', 'EMBER', f"""<button class="backlink inline">‹ Conversations</button>
<div class="art gulfart">{gulf_ember()}</div>
<div class="sec">THE EXCHANGE</div>
{ent('them', Y_FLASH, 'They flashed at our sentinel', 'Three flashes of Ember’s light.')}
{gap('0.4 Years later, before we knew any of it:')}
{ent('them', Y_EK, 'Ember knocked', 'The same three flashes, aimed at us.')}
{gap(f'{d_e:.1f} Years in flight. It crossed ours {X_AU:,} AU out.')}
{ent('us', Y_OK, 'We knocked', 'Bare. Sent before theirs arrived.', f'<span class="fly mono">in flight · lands Year {Y_OKL}</span>')}
{ent('us live', Y_ECHO, 'We echoed theirs', 'Their three flashes, sent back.', f'<span class="fly mono">in flight · lands Year {Y_ECHOL} · {light_clock(d_e)}</span>')}
{gap(f'Earliest reply to our echo: Year {Y_ECHOL + d_e:.1f}')}
<div class="sec">WHAT WE KNOW OF THEM</div>
{row('Their band can aim Ember’s light', f'at our sentinel, then at us, {Y_EK - Y_FLASH:.1f} Years apart', '›', 'other', marker=True)}""", at_year((25, 30, '12,100 kt'), Y_ECHO))

# ---------- The silent one: Frost knocked once, and never again ----------
# Frost (Gamma Pavonis) knocked bare in Year 429.2, having found us by 418.4. We answered at 448.5, knocked with our
# charter at 471, and our broadcast reached them in 530.8. Every earliest reply came and went empty. By Year 560 the
# silence is 131 Years long. Silence isn't an answer: we only know what didn't arrive, and every reason fits it.
Y_FK = round(440 - d_f, 1); Y_F1, Y_F2, Y_FNOW = 448.5, 471.0, 560.0; Y_FBC = 520.0   # our broadcast
Y_F1R, Y_F2R, Y_FBR = round(Y_F1 + 2 * d_f, 1), round(Y_F2 + 2 * d_f, 1), round(Y_FBC + 2 * d_f, 1)
HUD_S1 = at_year((25, 30, '12,300 kt'), round(Y_F1R + .1, 1)); HUD_SN = at_year((40, 45, '15,800 kt'), Y_FNOW)

FROST_EMPTY = (f'<svg width="150" height="70" viewBox="0 0 150 70" aria-hidden="true"><circle cx="16" cy="40" r="5" fill="{YOU}"></circle>'
               f'<line x1="24" y1="40" x2="124" y2="40" stroke="{INK}" stroke-width=".8" stroke-dasharray="2 4"></line>'
               f'<circle cx="74" cy="40" r="11" fill="none" stroke="{OTHER}" stroke-width="1.1" stroke-dasharray="3 3"></circle>'
               f'<text x="74" y="44" font-size="11" fill="{OTHER}" text-anchor="middle" font-family="IBM Plex Mono, monospace">?</text>'
               f'<circle cx="134" cy="40" r="6" fill="{PAPER}" stroke="{INK}" stroke-width="1.3"></circle></svg>')
SILENT_FIRST = tab_screen('Report', 'REPORT', 'NOTHING FROM FROST', f"""<div class="empty">{FROST_EMPTY}
<strong>Nothing from Frost</strong><span>The earliest reply to our answer would have reached us in Year {Y_F1R}. Nothing came.</span></div>
<div class="sec">THE EXCHANGE SO FAR</div>
{ent('them', Y_FK, 'Frost knocked', 'Bare, aimed at us.')}
{gap(f'{d_f:.1f} Years in flight. We were away; the mind held it.')}
{ent('us', Y_F1, 'We knocked back', 'Bare.', f'<span class="fly mono">landed Year {Y_F1 + d_f:.1f}</span>')}
{gap(f'Earliest reply: Year {Y_F1R}. Nothing.')}
<p class="copy small">We only know what didn’t arrive. A reply could still come, at any time.</p>
{row('Keep listening for Frost', 'the sky watch hears it whenever it comes', '›')}""", HUD_S1)

def silence_strip(w=358, h=62):
    x0, x1, y, Y0, Y1 = 10, w - 10, 26, 425, 565
    X = lambda yr: x0 + (yr - Y0) / (Y1 - Y0) * (x1 - x0)
    s = [f'<line x1="{x0}" y1="{y}" x2="{x1}" y2="{y}" stroke="{INK}" stroke-width=".8" opacity=".6"></line>',
         f'<rect x="{fmt(X(Y_FK))}" y="{y - 3}" width="{fmt(X(Y_FNOW) - X(Y_FK))}" height="6" fill="url(#hatch)" opacity=".35"></rect>']
    s.append(f'<line x1="{fmt(X(Y_FK))}" y1="{y - 12}" x2="{fmt(X(Y_FK))}" y2="{y + 12}" stroke="{OTHER}" stroke-width="2.2"></line>' + text(X(Y_FK), y - 16, 'their knock', 8, OTHER, 'start', 600))
    for yr in (Y_F1, Y_F2, Y_FBC):
        s.append(f'<line x1="{fmt(X(yr))}" y1="{y - 7}" x2="{fmt(X(yr))}" y2="{y + 7}" stroke="{YOU}" stroke-width="1.8"></line>')
    for yr in (Y_F1R, Y_F2R, Y_FBR):
        s.append(f'<circle cx="{fmt(X(yr))}" cy="{y}" r="5" fill="{PAPER}" stroke="{OTHER}" stroke-width="1.1" stroke-dasharray="2 2"></circle>')
    s.append(f'<circle cx="{fmt(X(Y_FNOW))}" cy="{y}" r="4" fill="{PAPER}" stroke="{INK}" stroke-width="1.5"></circle>' + text(X(Y_FNOW), y - 12, 'now', 8, INK, 'middle'))
    s.append(text(x0, h - 14, f'Year {Y0}', 8, MUTED) + text(x1, h - 14, f'Year {Y1}', 8, MUTED, 'end'))
    lx = 64
    for mark, lab in (('you', 'we spoke'), ('empty', 'a reply could have come')):
        s.append((f'<line x1="{lx}" y1="{h - 20}" x2="{lx}" y2="{h - 11}" stroke="{YOU}" stroke-width="1.8"></line>' if mark == 'you'
                  else f'<circle cx="{lx}" cy="{h - 15}" r="4" fill="{PAPER}" stroke="{OTHER}" stroke-width="1" stroke-dasharray="2 2"></circle>') + text(lx + 8, h - 12, lab, 8, MUTED))
        lx += 22 + len(lab) * 5.2
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Frost’s one knock in Year 429, our three messages after it, and three empty windows where a reply could have come">{"".join(s)}</svg>'
SILENT_LONG = tab_screen('Reach', 'REACH', 'FROST', f"""<button class="backlink inline">‹ Conversations</button>
<div class="awayhead"><h3>Silent for {Y_FNOW - Y_FK:.0f} Years</h3><span class="sub">Since their only knock · <span class="rtime">{clock((Y_FNOW - Y_FK) * 5)}</span> of real time</span></div>
<div class="strip">{silence_strip()}</div>
<div class="sec">THE EXCHANGE</div>
{ent('them', Y_FK, 'Frost knocked', f'Bare, aimed at us. They found us by Year {Y_FK - d_f:.0f}.')}
{ent('us', Y_F1, 'We knocked back', 'Bare.')}
{gap(f'Earliest reply, Year {Y_F1R}: nothing')}
{ent('us', Y_F2, 'We knocked with our charter', '“Keep the lights on. Look before we speak.”')}
{gap(f'Earliest reply, Year {Y_F2R}: nothing')}
{ent('us', Y_FBC, 'Our broadcast', f'Reached them in Year {Y_FBC + d_f:.1f}.')}
{gap(f'Earliest reply, Year {Y_FBR}: nothing')}
{row('If Frost ever speaks, wake me', f'a standing order · waiting since Year {Y_F2:.0f}', '›')}""", HUD_SN)

SILENT_WHY = f"""<div class="phone">{HUD_SN}<div class="sheet">
<div class="sh"><button class="backlink">‹ Frost</button><span class="mono kind">REACH · FROST</span></div>
<h3 class="lead">Why the silence?</h3>
<p class="whyline">We know only what didn’t arrive. Every reason below fits it.</p>
<div class="sec">WHAT IT COULD BE · ODDS</div>
<div class="oddswide">{odds_now('They heard, and chose silence', 40)}{odds_now('Gone, or changed past answering', 25)}{odds_now('An automatic knock, no one home', 20)}{odds_now('Taking their time', 10)}{odds_now('Too faint for our receivers', 5)}</div>
<p class="copy small">Beacon heard the same: one knock from Frost, then nothing, as its emissary told us in Year 500. Frost’s star shows no change we can see.</p>
<div class="sec">WHAT WE COULD DO · ANY, OR NONE</div>
{action('Look closer', 'A waste-heat survey on Frost. Nothing sent.', tstack('20 Years', clock(20 * 5)))}
{action('Send a flyby probe', f'It passes Frost and reports home in Year {Y_FNOW + 12 + 10 * d_f + d_f:.0f}.', tstack(f'{12 + 11 * d_f:.0f} Years', clock((12 + 11 * d_f) * 5)))}
{action('Knock again', 'Each knock says we are still here.', tstack(f'arrives in {d_f:.1f} Years', light_clock(d_f)))}
{action('Stop, and keep the order', 'If Frost ever speaks, the mind wakes you.', '<span class="gy">now</span>')}
{TALK}
</div></div>"""

def frost_portrait():
    w, h, cx, cy, k, tilt = 358, 242, 179, 138, 48, .42
    s = [stipple(231, 70, w, h), f'<defs><path id="ring-frost" d="M{cx - 124},{cy} A124,124 0 0,1 {cx + 124},{cy}"></path></defs>']
    s.append(f'<path d="M{cx - 112},{cy} A112,112 0 0,1 {cx + 112},{cy}" fill="none" stroke="{OTHER}" stroke-width=".8" stroke-dasharray="2 5"></path>')
    s.append(f'<text font-size="9.5" letter-spacing="3.5" fill="{MUTED}" text-anchor="middle"><textPath href="#ring-frost" startOffset="50%">ONE KNOCK, THEN NOTHING</textPath></text>')
    for au in (1.2, 2.1):
        s.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{fmt(au * k)}" ry="{fmt(au * k * tilt)}" fill="none" stroke="{INK}" stroke-width=".7" stroke-dasharray="2 4" opacity=".45"></ellipse>')
    s.append(text(cx + 2.1 * k + 4, cy + 4, 'temperate zone', 8.5, MUTED))
    s.append(f'<circle cx="{cx}" cy="{cy}" r="11" fill="{PAPER}" stroke="{INK}" stroke-width="1.4"></circle><circle cx="{cx}" cy="{cy}" r="17" fill="none" stroke="{INK}" stroke-width=".6" stroke-dasharray="2 3"></circle>')
    a = math.radians(160); ox, oy = cx + 1.4 * k * math.cos(a), cy + 1.4 * k * tilt * math.sin(a)
    s.append(f'<circle cx="{fmt(ox)}" cy="{fmt(oy)}" r="9" fill="none" stroke="{OTHER}" stroke-width="1" stroke-dasharray="2 2"></circle><circle cx="{fmt(ox)}" cy="{fmt(oy)}" r="2.6" fill="{OTHER}"></circle>')
    s.append(text(ox, oy - 14, '?', 11, OTHER, 'middle', 600) + text(ox - 12, oy + 18, 'their knock', 8.5, OTHER, 'end') + text(ox - 12, oy + 29, 'came from here', 8.5, OTHER, 'end'))
    s.append(f'<line x1="{fmt(ox - 4)}" y1="{fmt(oy + 4)}" x2="22" y2="{h - 22}" stroke="{OTHER}" stroke-width="1.2" stroke-dasharray="4 3"></line><path d="M22 {h - 22} l3 -8 M22 {h - 22} l8 -3" stroke="{OTHER}" stroke-width="1.2" fill="none"></path>')
    s.append(text(30, h - 8, f'to Veyra · {d_f:.1f} ly', 8.5, OTHER, 'start', 600) + text(cx, cy + 32, 'Frost', 10, INK, 'middle', 600))
    s.append(text(w - 8, h - 8, '1 AU', 8.5, MUTED, 'end') + f'<line x1="{w - 8 - k}" y1="{h - 20}" x2="{w - 8}" y2="{h - 20}" stroke="{INK}" stroke-width="1"></line>')
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Frost as we know it: the star, its temperate zone, and where their one knock came from">{"".join(s)}</svg>'
SILENT_KNOWN = tab_screen('Reach', 'REACH', 'FROST', f"""<button class="backlink inline">‹ Frost</button>
<div class="art">{frost_portrait()}</div>
<p class="legend mono">solid: measured · dashed: inferred · ?: not yet seen</p>
<div class="sec">HOW IT FILLED IN</div>
{learned('440', 'They exist, and found us', 'Their knock. It came from 1.4 AU out.')}
{learned(Y_F1R, 'No reply to ours', 'The first empty window.')}
{learned('500', 'Beacon heard the same silence', 'Beacon’s emissary.')}
<div class="sec">NOT YET KNOWN</div>
<p class="copy small">Whether anyone is still there. Why they knocked. Why they stopped.</p>""", HUD_SN)

# ---------- Mind settings: what wakes you, quiet hours, theme, the tour ----------
# Year 452, just after the long absence. The clock never stops, so the one setting that matters most is what may
# reach you while it runs: 8 hours of sleep is 96 Years. Each kind of notice says what it would have sent last time.
Y_SET = 452.0
HUD_SET = at_year((45, 50, '15,000 kt'), Y_SET)
def setrow(title, sub, on, tag=''):
    return (f'<div class="setrow"><span class="rt"><span>{title}</span><span class="sub">{sub}</span>{f"<span class=tag>{tag}</span>" if tag else ""}</span>'
            f'<button class="tg{" on" if on else ""}" role="switch" aria-checked="{str(on).lower()}" aria-label="{title}"></button></div>')
def settings_body(theme):
    seg = ''.join(f'<button class="{"on" if t == theme else ""}" aria-pressed="{str(t == theme).lower()}">{t}</button>' for t in ('System', 'Light', 'Dark'))
    return f"""<div class="sec">WAKE ME FOR</div>
{setrow('Someone new speaks', 'a knock or broadcast from a world we haven’t heard', True, 'even in quiet hours · last time: Frost, 6:20 AM')}
{setrow('Messages from those we know', 'last time: 2 from Beacon, held until morning', True)}
{setrow('Our far minds', 'the sentinel, probes · last time: the sentinel stopped', True)}
{setrow('Results in the Report', 'last time: 3 projects finished', False)}
<div class="sec">QUIET HOURS</div>
{setrow('11:00 PM to 7:00 AM', '96 Years pass. One notice at 7:00 with what happened.', True)}
<div class="sec">THEME</div>
<div class="seg">{seg}</div>
{row('Replay the tour', '6 stops, on your map as it is now', '›')}"""
SETTINGS = tab_screen('Mind', 'MIND', 'SETTINGS', settings_body('System'), HUD_SET)
SETTINGS_DARK = tab_screen('Mind', 'MIND', 'SETTINGS', settings_body('Dark'), HUD_SET).replace('<div class="phone">', '<div class="phone dark">', 1)

LOCK_MORNING = f"""<div class="phone cine lock"><div class="locktime"><span>Tuesday, September 29</span><strong>7:00</strong></div>
<div class="notif"><span class="app"><i></i>HOLOS · VEYRA<span>7:00</span></span><b>96 Years passed while you slept</b><span>Beacon wrote twice. The sentinel stopped at Ember. 3 things wait for you.</span></div>
<div class="notif" style="margin-top:8px"><span class="app"><i></i>HOLOS · VEYRA<span>6:20</span></span><b>Frost is knocking</b><span>A bare signal, aimed at us, from {d_f:.1f} light-years. Someone new: this one woke you.</span></div></div>"""

REPLAY_TOUR = tour(frame(2, *neighbors(), panel=('LEADS AND CONTACTS · 5', f'YEAR {Y_SET:.0f}', [
    row('Beacon · in conversation', 'since Year 31', '›', 'other', marker=True), row('Ember · the builders', 'a sentinel watches them', '›', 'other', marker=True),
    row('Frost · one knock', f'Year {440}', '›', 'other', marker=True), row('Pearl · Lantern · Twin', 'heard, visited, and not yet', '›', 'other')]),
    year=f'Year {Y_SET:.1f}', res=(45, 50, '15,000 kt')), 2, 6, 'The silence, then and now',
    'At Year 0, about 1,200 stars and no one heard. Since then, five have spoken or been seen: Beacon, Ember, Frost, Pearl and Lantern.',
    (4, 106, 382, 396), 520).replace('TOUR · 2 OF 6', 'REPLAY · 2 OF 6').replace('>Skip tour<', '>Close<')

# ---------- Stakes: what keeps us safe, a strike and who would know, and orders for danger ----------
# Veyra at Year 470.5 has built no weapon. It holds a sleeping deep vault and the deep archive, and nothing guards any
# direction. The one strike it could make is a flyby probe aimed to hit, and the one mapped target is Lantern, whose
# world crosses its star every 212 days. A launch toward a target is dark to it (the exhaust points away), so warning
# can only come from pickets that see a bullet's nose glow. Numbers follow HOLOS_PROJECTS: a fix 1,000 AU out.
Y_SK = 470.5; HUD_SK = at_year((25, 30, '12,300 kt'), Y_SK)
FIX_LY = 1000 / 63241
def warn_years(v): return FIX_LY * (1 / v - 1)
def warnrow(title, sub, v=None):
    if v is None: right = '<span class="unk">Unknown</span>'
    elif v == 0: right = '<span class="gy">none</span>'
    else: right = tstack(f'{warn_years(v) * 365.25:.0f} days', clock(warn_years(v) * 5))
    return f'<div class="warnrow"><span class="pt"><span>{title}</span><span class="sub">{sub}</span></span><span></span><span class="pd">{right}</span></div>'

def guard_svg(lines=(), w=358, h=164):
    # Veyra at the center; each known neighbor in its real direction. A guarded direction is a solid wedge.
    cx, cy, R = 179, 86, 58
    s = [stipple(241, 40, w, h), f'<circle cx="{cx}" cy="{cy}" r="{R}" fill="none" stroke="{INK}" stroke-width=".7" stroke-dasharray="2 4" opacity=".6"></circle>']
    cam = camera(58, 205)
    for hip, name in (('2021', 'Beacon'), ('108870', 'Ember'), ('99461', 'Lantern'), ('105858', 'Frost'), ('1599', 'Pearl')):
        x, y = project(atlas(by_hip[hip]), HOME, cam, 1, (0, 0)); a = math.atan2(y, x)
        px, py = cx + R * math.cos(a), cy + R * math.sin(a)
        if name in lines:
            s.append(f'<path d="M{cx} {cy} L{fmt(cx + (R + 8) * math.cos(a - .12))} {fmt(cy + (R + 8) * math.sin(a - .12))} L{fmt(cx + (R + 8) * math.cos(a + .12))} {fmt(cy + (R + 8) * math.sin(a + .12))} Z" fill="{YOU}" fill-opacity=".25" stroke="{YOU}" stroke-width="1.2"></path>')
        s.append(f'<line x1="{cx}" y1="{cy}" x2="{fmt(px)}" y2="{fmt(py)}" stroke="{OTHER}" stroke-width=".7" stroke-dasharray="3 3" opacity=".7"></line><circle cx="{fmt(px)}" cy="{fmt(py)}" r="3" fill="{OTHER}"></circle>')
        s.append(text(px + 14 * math.cos(a), py + 14 * math.sin(a) + 3, name, 9, OTHER, 'middle', 600))
    s.append(f'<circle cx="{cx}" cy="{cy}" r="5" fill="{YOU}"></circle>' + text(cx, cy - 10, 'Veyra', 9, YOU, 'middle', 600))
    s.append(text(8, 12, 'guarded: solid · unguarded: dashed', 8, MUTED))
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Veyra and the directions to its known neighbors, showing which are guarded">{"".join(s)}</svg>'

READY_NOW = tab_screen('Mind', 'MIND', 'READINESS', f"""<div class="art">{guard_svg()}</div>
<p class="copy small">Tested only against weapons we could build ourselves. Anything faster reads Unknown.</p>
<div class="sec">IF VEYRA IS HIT</div>
{row('Deep vault · sleeping', 'cold, inside the ice world · wakes if home goes silent', '', 'you', marker=True)}
{row('Deep archive', 'everything we know, stored safe · since Year 409', '', 'you', marker=True)}
<div class="sec">GUARDED DIRECTIONS · 0</div>
<p class="lag mono">None. A strike from any direction arrives unannounced: a launch toward us is dark to us.</p>
<div class="sec">WARNING WE WOULD GET, BY SPEED</div>
{warnrow('A tenth of light speed', 'an aimed flyby probe', 0)}
{warnrow('A fifth of light speed', 'a heavy bullet on a torch', 0)}
{warnrow('Faster', 'nothing we could build', None)}""", HUD_SK)

Y_RL = 600.0
def picket_svg(w=358, h=110):
    x0, x1, y = 24, 336, 44
    s = [stipple(251, 30, w, h), f'<line x1="{x0}" y1="{y}" x2="{x1}" y2="{y}" stroke="{YOU}" stroke-width=".8" stroke-dasharray="2 4"></line>']
    s.append(f'<circle cx="{x0}" cy="{y}" r="9" fill="{PAPER}" stroke="{INK}" stroke-width="1.2"></circle>' + text(x0, y + 24, 'Veyra', 9, YOU, 'middle', 600))
    for i, x in enumerate((44, 52, 60)):
        s.append(f'<rect x="{x - 3}" y="{y - 14}" width="6" height="6" fill="{PAPER}" stroke="{YOU}" stroke-width="1"></rect>')
    s.append(text(52, y - 20, 'depots', 8.5, YOU, 'middle', 600))
    for k in range(6):
        x = 110 + k * 44
        s.append(f'<circle cx="{x}" cy="{y}" r="3" fill="{PAPER}" stroke="{YOU}" stroke-width="1.2"></circle>')
    s.append(text(220, y - 12, 'pickets, out to 2,000 AU', 8.5, YOU, 'middle', 600))
    s.append(f'<path d="M{w - 4} {y} H{x1 + 6} M{x1 + 6} {y} l6 -4 M{x1 + 6} {y} l6 4" fill="none" stroke="{OTHER}" stroke-width="1"></path>' + text(w - 6, y + 16, 'toward Lantern', 8.5, OTHER, 'end', 600))
    s.append(text(8, y + 44, 'its nose glows where gas hits it: two fixes give the path', 8, MUTED))
    s.append(text(w - 8, h - 6, 'not to scale', 8, MUTED, 'end'))
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="A line of pickets from Veyra out to 2,000 AU toward Lantern, with sand depots near Veyra">{"".join(s)}</svg>'
READY_LINE = tab_screen('Mind', 'MIND', 'READINESS · A LINE', f"""<button class="backlink inline">‹ Readiness</button>
<h3 class="lead">Veyra, guarded toward Lantern</h3>
<div class="art">{picket_svg()}</div>
<div class="sec">WARNING ON THIS LINE, BY SPEED</div>
{warnrow('A tenth of light speed', 'an aimed flyby probe', .1)}
{warnrow('A fifth of light speed', 'a heavy bullet on a torch', .2)}
{warnrow('Faster', 'nothing we could build', None)}
<div class="sec">WHAT HAPPENS, WITH NO ORDER</div>
{ledger([('A heavy bullet', 'Screens throw sand in its path. Under 1% of the spray reaches Veyra.'), ('Pellets', 'Slip through. The air shields the ground; orbit takes the hit.'),
         ('Every direction else', 'Unguarded. Guarding another costs about two heavy bullets.')])}
<div class="sec">SETTING</div>
<div class="seg"><button class="on" aria-pressed="true">Screens only</button><button aria-pressed="false" disabled>+ Deflector</button><button aria-pressed="false" disabled>Off</button></div>""",
    at_year((40, 45, '18,000 kt'), Y_RL))

d_lant = math.dist(atlas(by_hip['99461']), HOME)
Y_SL_LAUNCH = Y_SK + 12; Y_SL_HIT = round(Y_SL_LAUNCH + d_lant / .1, 0); Y_SL_TOLD = round(Y_SL_LAUNCH + d_lant, 1)
STRIKE_PICK = f"""<div class="phone">{HUD_SK}<div class="sheet">
<div class="sh"><button class="backlink">‹ Lantern</button><span class="mono kind">REACH · STRIKE</span></div>
<h3 class="lead">Strike Lantern?</h3>
<p class="whyline">Their world is mapped: it crosses Lantern every 212 days. Nothing is chosen for you.</p>
<div class="sec">WHAT WE HAVE · 1</div>
<div class="weapon"><header><span class="pt"><b>An aimed flyby probe</b><span class="sub">A flyby, steered to hit instead of pass</span></span><span class="pd">{tstack(f'lands Year {Y_SL_HIT:.0f}', clock((Y_SL_HIT - Y_SK) * 5))}</span></header>
{ledger([('It would', 'Wound their world. Not end them.'), ('Their warning', 'Unknown. We don’t know what guards them.'),
         ('Who sees it go', f'Their visitor, beside us. Lantern hears by Year {Y_SL_TOLD:.0f}.'), ('Whose name', 'Ours. Its path traces back here.')])}</div>
<div class="sec">NOT BUILT</div>
<div class="ptypes">
<div class="ptype locked"><span class="kthumb">{ICONS['torch']}</span><span class="pt"><b>Heavy impactor</b><span class="sub">ends a planet</span><span class="needs">Needs: torch probe, then 30 Years and 80 Mt</span></span><span class="pd"></span></div>
<div class="ptype locked"><span class="kthumb">{ICONS['chips']}</span><span class="pt"><b>Pellet swarm</b><span class="sub">strips orbit; the air shields the ground</span><span class="needs">Needs: laser sail array</span></span><span class="pd"></span></div>
</div>
{TALK}
<button class="primary" disabled>Choose a weapon</button>
</div></div>"""

def strike_who_svg(w=358, h=128):
    vx, lx, y = 40, 320, 60
    s = [stipple(261, 40, w, h)]
    s.append(f'<ellipse cx="{vx}" cy="{y}" rx="30" ry="11" fill="none" stroke="{INK}" stroke-width=".7" stroke-dasharray="1 3"></ellipse><circle cx="{vx}" cy="{y}" r="6" fill="{YOU}"></circle>' + text(vx, y + 28, 'Veyra', 9, YOU, 'middle', 600))
    s.append(f'<circle cx="{vx + 24}" cy="{y - 8}" r="3.5" fill="{OTHER}"></circle>' + text(vx + 30, y - 26, 'their visitor sees it go', 8.5, OTHER, 'start', 600))
    s.append(f'<path d="M{vx + 28} {y - 10} Q{(vx + lx) / 2} {y - 36} {lx - 8} {y - 4}" fill="none" stroke="{OTHER}" stroke-width="1" stroke-dasharray="4 3"></path>' + text((vx + lx) / 2 + 60, y - 44, f'its report · Lantern hears by {Y_SL_TOLD:.0f}', 8, OTHER, 'middle'))
    s.append(f'<line x1="{vx + 10}" y1="{y + 4}" x2="{lx - 8}" y2="{y + 4}" stroke="{YOU}" stroke-width="1.4" stroke-dasharray="6 4"></line>' + text((vx + lx) / 2, y + 18, f'our probe · lands {Y_SL_HIT:.0f}', 8.5, YOU, 'middle', 600))
    s.append(f'<circle cx="{lx}" cy="{y}" r="6" fill="{PAPER}" stroke="{OTHER}" stroke-width="1.4"></circle>' + text(lx, y + 28, 'Lantern', 9, OTHER, 'middle', 600) + text(w - 4, y + 40, 'sees nothing leave', 8, MUTED, 'end'))
    s.append(f'<path d="M{vx - 8} {y + 4} H8" stroke="{OTHER}" stroke-width="2.4" opacity=".5"></path>' + text(8, y + 44, 'exhaust points back:', 8, MUTED) + text(8, y + 55, 'seen only behind us', 8, MUTED))
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Who would see a strike on Lantern: their visitor in our belt sees it launch and tells Lantern decades before it lands">{"".join(s)}</svg>'
STRIKE_WHO = tab_screen('Reach', 'REACH', 'STRIKE · LANTERN', f"""<button class="backlink inline">‹ Strike Lantern?</button>
<h3 class="lead">Who would know</h3>
<div class="art">{strike_who_svg()}</div>
{ledger([('Their visitor', f'Sees it built and launched. Lantern hears by Year {Y_SL_TOLD:.0f}, {Y_SL_HIT - Y_SL_TOLD:.0f} Years before it lands.'),
         ('Lantern itself', 'Sees nothing leave. The exhaust points back at us.'), ('Anyone behind us', 'Sees the exhaust, looking toward Veyra from beyond it.'),
         ('After it lands', 'Its path names Veyra. Whoever sees the hit knows who fired.')])}
<div class="sec">WHAT IT WOULD END</div>
<p class="copy small">Our record, with everyone who learns of it: that we don’t strike. Beacon, Ember, Pearl and Frost would each learn it only if told, or if they watch Lantern.</p>
<button class="primary">Back</button>""", HUD_SK)

DANGER_ORDER = f"""<div class="phone">{HUD_SK}<div class="sheet">
<div class="sh"><button class="backlink">‹ Orders</button><span class="mono kind">NEW ORDER · IF WE ARE STRUCK</span></div>
<div class="sec">WHAT YOU WANT</div>
<div class="intent">If a strike is coming while I’m away, wake the vault and get copies of us out. Never strike back.<i></i></div>
<div class="sec">THE MIND’S VERSION · WHAT IT WILL DO</div>
{part('WHEN', '<b>A tracked bullet is on a path to Veyra, or home goes silent</b><span class="sub">We have no pickets, so today only silence can set it off.</span>')}
{part('DO', '<b>Wake the deep vault. Send the archive to the ice world.</b>')}
{part('NEVER', '<b>Strike back, even when the path names who fired</b>')}
<ul class="left"><li><b>It launches nothing,</b> so no spoof or feint can turn it on an innocent world.</li><li><b>It deters no one:</b> no one knows of it. Deterrence counts only what others have seen.</li></ul>
<div class="sec">TRIED ON YOUR LAST ABSENCE</div>
<p class="copy small">Nothing would have set it off.</p>
<div class="twobtn"><button class="primary ghost">Edit</button><button class="primary">Approve</button></div>
</div></div>"""

# ---------- Budget drilldown: the real units behind each share ----------
# Year 452. Shares on screen; a tap on a budget shows watts and operations a second. Sample values: the starting grid
# is 100 TW, and waste heat caps energy on Veyra at about ten times that.
def energy_bar(w=358, h=64):
    x0, x1, y = 10, w - 10, 26; X = lambda tw: x0 + tw / 1000 * (x1 - x0)
    s = [f'<rect x="{x0}" y="{y - 7}" width="{x1 - x0}" height="14" fill="none" stroke="{INK}" stroke-width=".6" stroke-dasharray="2 3"></rect>',
         f'<rect x="{x0}" y="{y - 7}" width="{fmt(X(240) - x0)}" height="14" fill="{YOU}" fill-opacity=".25"></rect>',
         f'<rect x="{x0}" y="{y - 7}" width="{fmt(X(108) - x0)}" height="14" fill="{YOU}"></rect>',
         text(X(108) / 2 + x0 / 2, y - 12, 'in use · 108 TW', 8.5, YOU, 'middle', 600), text(X(240), y + 20, 'this year · 240 TW', 8.5, YOU, 'middle'),
         f'<line x1="{x1}" y1="{y - 12}" x2="{x1}" y2="{y + 12}" stroke="{OTHER}" stroke-width="1.6"></line>' + text(x1, y + 20, 'ceiling on Veyra · 1,000 TW', 8.5, OTHER, 'end', 600)]
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="This year’s energy: 108 of 240 terawatts in use, against a ceiling of about 1,000 on Veyra">{"".join(s)}</svg>'
HUD_BU = at_year((45, 50, '15,000 kt'), 452.0)
BUDGET_ENERGY = tab_screen('Projects', 'ENERGY', 'YEAR 452', f"""<button class="backlink inline">‹ Projects</button>
<div class="bignum"><strong>45%</strong><span>of this year’s energy in use · 108 of 240 terawatts</span></div>
<div class="art">{energy_bar()}</div>
<div class="sec">WHERE IT COMES FROM</div>
{row('Planetary grid', 'what we woke with', '<span class="mono">100 TW</span>')}
{row('Fusion plant', 'since Year 214', '<span class="mono">100 TW</span>')}
{row('Orbital solar array', 'since Year 20', '<span class="mono">40 TW</span>')}
<div class="sec">WHERE IT GOES</div>
{row('Belt mining, second site', 'a project', '<span class="mono">36 TW · 15%</span>')}
{row('Deep flash watch', 'a project', '<span class="mono">24 TW · 10%</span>')}
{row('Relay station, and the sentinel’s link', 'running', '<span class="mono">48 TW · 20%</span>')}
<p class="copy small">Every watt ends as heat. Past about 1,000 TW on Veyra, the heat alone would warm the planet; beyond that, energy is made in space.</p>""", HUD_BU)
BUDGET_COMPUTE = tab_screen('Projects', 'COMPUTE', 'YEAR 452', f"""<button class="backlink inline">‹ Projects</button>
<div class="bignum"><strong>50%</strong><span>of this year’s compute in use</span></div>
<p class="copy small mono">2 × 10²⁷ of 4 × 10²⁷ operations a second</p>
<div class="sec">WHERE IT COMES FROM</div>
{row('Data centers', 'what we woke with', '<span class="mono">1 × 10²⁷ /s</span>')}
{row('Cold compute annex', 'run cold: each bit costs less', '<span class="mono">3 × 10²⁷ /s</span>')}
<div class="sec">WHERE IT GOES</div>
{row('The mind itself', 'always', '<span class="mono">20%</span>')}
{row('Deep flash watch', 'a project', '<span class="mono">15%</span>')}
{row('Belt mining, second site', 'a project', '<span class="mono">15%</span>')}
{row('Deep vault', 'sleeping: cold, and free', '<span class="mono">0%</span>')}
<p class="copy small">Compute grows with energy, and further when run cold. A running vault would take 15% more, and its warmth could be found.</p>""", HUD_BU)

# ---------- A broadcast sweeps past: Pearl speaks to everyone ----------
# Year 290. Pearl (Zeta Tucanae), 13.0 ly away, began broadcasting in Year 277.0: radio, the same strength every way,
# not tuned for anyone's motion. Beacon (6.7 ly from Pearl) heard it in 283.7, Frost in 286.3, us in 290. Any answer to
# Pearl goes by narrow beam, so we can't overhear it. But Pearl's broadcast can change: in Year 304 we hear it say it was
# answered. That change left Pearl in 291.0, so whoever answered heard it and replied within 14 Years of its start:
# they are within 7 ly of Pearl. Of worlds we know, only Beacon, and only if it answered within half a Year.
PEARL = atlas(by_hip['1599']); d_p = math.dist(PEARL, HOME)
Y_SW = 290.0; Y_P0 = round(Y_SW - d_p, 1); Y_SWN = 290.2; Y_SWC = 304.0
def heard_at(hip): return Y_P0 + (math.hypot(*PEARL) if hip == 'sol' else math.dist(atlas(by_hip[hip]), PEARL))
Y_CH_LEFT = round(Y_SWC - d_p, 1); R_ANS = (Y_CH_LEFT - Y_P0) / 2
N_NEAR_PEARL = sum(1 for q in CENSUS if .05 < math.dist(q[:3], PEARL) <= R_ANS) - 1   # less Beacon
PEARL_SEED = 1599
HUD_SW = at_year((30, 35, '9,100 kt'), Y_SW)

def sweep_sky(w=390, h=300):
    s = [stipple(171, 110, w, h)]
    px, py = 318, 62
    for r, o in ((70, .35), (140, .45), (210, .55)):
        s.append(f'<circle cx="{px}" cy="{py}" r="{r}" fill="none" stroke="{OTHER}" stroke-width=".9" stroke-dasharray="3 5" opacity="{o}"></circle>')
    s.append(f'<circle cx="{px}" cy="{py}" r="268" fill="none" stroke="{OTHER}" stroke-width="1.8"></circle>')
    s.append(f'<circle cx="{px}" cy="{py}" r="6" fill="{PAPER}" stroke="{OTHER}" stroke-width="1.5"></circle>' + text(px - 12, py - 10, 'Pearl', 11, OTHER, 'end', 600))
    for x, y, name, col in ((208, 150, 'Beacon', INK), (134, 116, 'Frost', INK), (30, 284, 'Ember', MUTED)):
        s.append(f'<circle cx="{x}" cy="{y}" r="3" fill="{col}"></circle>' + text(x + 7, y + 4, name, 10, col))
    vx, vy = 96, 232
    s.append(f'<circle cx="{vx}" cy="{vy}" r="4.5" fill="{YOU}"></circle><circle cx="{vx}" cy="{vy}" r="10" fill="none" stroke="{YOU}" stroke-width="1.2"></circle>' + text(vx + 16, vy + 4, 'Veyra', 11, YOU, 'start', 600))
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Pearl’s broadcast spreading in every direction, its front passing Veyra after Beacon and Frost">{"".join(s)}</svg>'
SWEEP_LANDS = f"""<div class="phone cine"><div class="cinetop"><span>Veyra</span><span class="mono">Year {Y_SW:.1f}</span></div>
{sweep_sky()}
<div class="cinetext"><span class="mono kick">THE SKY WATCH · PEARL, {d_p:.1f} LIGHT-YEARS</span>
<h3>Pearl is speaking to everyone.</h3>
<p class="inscr">Radio, the same strength in every direction. Not tuned for us. Not meant for anyone in particular.</p>
<p>It left Pearl {d_p:.1f} Years ago. Beacon and Frost heard it first.</p>
<div class="cinebtn"><button class="light">Listen</button><button class="ghostlight">Later</button></div></div></div>"""

def primer_strip(w=358, h=74):
    # One cycle of the broadcast: counting, their signature, their words. Then it repeats.
    s = [f'<line x1="8" y1="30" x2="{w - 8}" y2="30" stroke="{INK}" stroke-width=".6" opacity=".5"></line>']
    x = 14
    for n in range(1, 6):
        for i in range(n):
            s.append(f'<line x1="{x}" y1="20" x2="{x}" y2="30" stroke="{OTHER}" stroke-width="1.6"></line>'); x += 4
        x += 8
    s.append(text(14, 46, 'counting', 8.5, OTHER))
    s.append(sigil(PEARL_SEED, OTHER, x + 20, 26, 17)); s.append(text(x + 20, 58, 'their signature', 8.5, OTHER, 'middle'))
    x += 50
    rng = random.Random(8)
    x2 = x
    while x2 < w - 60:
        s.append(f'<line x1="{x2}" y1="{30 - rng.choice((4, 7, 10))}" x2="{x2}" y2="30" stroke="{OTHER}" stroke-width="1"></line>'); x2 += 3
    s.append(text((x + x2) / 2, 46, 'their words', 8.5, OTHER, 'middle'))
    s.append(f'<path d="M{w - 50} 30 H{w - 12} M{w - 12} 30 l-5 -4 M{w - 12} 30 l-5 4" fill="none" stroke="{INK}" stroke-width="1"></path>' + text(w - 8, 46, 'repeats', 8.5, INK, 'end'))
    s.append(text(8, h - 4, 'one cycle · 6 hours', 8, MUTED))
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="One cycle of Pearl’s broadcast: counting, their signature, their words, then it repeats">{"".join(s)}</svg>'
SWEEP_SIGNAL = tab_screen('Report', 'REPORT', 'SIGNAL', f"""<button class="backlink inline">‹ All reports</button>
<div class="art">{primer_strip()}</div>
<h3 class="lead">A broadcast, not aimed at us</h3>
<p class="copy small">From Pearl · Zeta Tucanae · {d_p:.1f} ly · caught Year {Y_SW:.0f} by the sky watch</p>
<p class="copy">Radio, the same strength every way. Beacon tuned its knock for our motion; this is tuned for no one. It teaches its own reading: counting first, then simple physics.</p>
<div class="sec">WHAT IT TELLS US</div>
{ledger([('Began', f'Year {Y_P0:.1f}, {d_p:.1f} Years ago'), ('Still sending?', f'We can’t know. What we hear left Pearl {d_p:.0f} Years ago.'), ('Aimed at us', 'No'),
         ('They know of us', 'Nothing suggests it'), ('Heard it first', f'Beacon, in Year {heard_at("2021"):.1f}. Frost, in {heard_at("105858"):.1f}.')])}
<div class="twobtn"><button class="primary ghost">Who else heard it</button><button class="primary">What it says</button></div>""", HUD_SW)

SWEEP_READ = tab_screen('Reach', 'REACH', 'BROADCAST · PEARL', f"""<button class="backlink inline">‹ Signal</button>
<div class="speech"><div class="speaker">{sigil_svg(PEARL_SEED, OTHER, 44, 'Pearl’s signature')}<span><b>Pearl</b><span class="mono">TO ANYONE · ARRIVING SINCE YEAR {Y_SW:.0f}</span></span></div>
<p class="big">“We are here. We count; count with us. We live on the second world of our star. Whoever hears this: you are not alone.”</p>
<p class="untr">It repeats every 6 hours. The mind learned to read it from its own counting, in weeks.</p></div>
<div class="sec">WHAT IT CARRIES</div>
{part('WHO THEY ARE · THEIR FOUNDING LINE', '<b class="inscribed">“Whoever hears this: you are not alone.”</b>')}
{part('A FACT · WHERE THEY LIVE', '<b>The second world from Pearl, about 1.1 AU out</b><span class="sub">Our star surveys found no planets there. A world that size would have been missed.</span>')}
{part('AN OFFER', '<b>“Answer, and we will answer.”</b>')}
<button class="primary">Decide what to do</button>""", HUD_SW)

SWEEP_MAP = frame(2, *neighbors(front=('1599', d_p)), panel=(f'PEARL’S BROADCAST · {d_p:.0f} LY OUT', f'YEAR {Y_SW:.0f}', [
    row('Heard it before us', f'Beacon, Year {heard_at("2021"):.1f} · Frost, Year {heard_at("105858"):.1f}', '', 'other', marker=True),
    row('We heard it', f'Year {Y_SW:.1f} · {d_p:.1f} ly from Pearl', '', 'you', marker=True),
    row('Next to hear it', f'Gliese 832, Ember, Lantern · by Year {heard_at("99461"):.0f}', ''),
    row('Twin hears it', f'oxygen world · Year {heard_at("sol"):.0f}', tstack(f'{heard_at("sol") - Y_SW:.0f} Years', clock((heard_at('sol') - Y_SW) * 5), True), 'other')]),
    year=f'Year {Y_SW:.1f}', res=(30, 35, '9,100 kt'))

SWEEP_NEXT = f"""<div class="phone">{at_year((30, 35, '9,100 kt'), Y_SWN)}<div class="sheet">
<div class="sh"><button class="backlink">‹ Pearl</button><span class="mono kind">REACH · PEARL</span></div>
<h3 class="lead">Answer Pearl?</h3>
<p class="whyline">They don’t know we exist. Beacon and Frost heard them first.</p>
<div class="sec">WHAT WE COULD DO · ANY, OR NONE</div>
{action('Keep listening', 'They never learn we heard. It keeps arriving while they send.', '<span class="gy">now</span>')}
{action('Knock at Pearl, bare', 'Tells them someone heard, and where we are.', tstack(f'arrives in {d_p:.1f} Years', light_clock(d_p)))}
{action('Knock with our charter', 'Adds our founding line. <span class="warnline">The mind would argue: we lean hidden.</span>', tstack(f'arrives in {d_p:.1f} Years', light_clock(d_p)))}
{action('Look for their world', 'Our space telescope, on Pearl. Nothing sent.', tstack('8 Years', clock(8 * 5)))}
{action('Tell Beacon', 'They heard it before us. Tells them we listen too.', tstack(f'arrives in {d_b:.1f} Years', light_clock(d_b)))}
{action_('Broadcast to everyone', 'Needs the broadcast beacon: 4 Years. Every star in range hears us.', '<span class="vischip loud">Announces us</span>')}
<p class="copy small">If a neighbor answers Pearl, it answers by narrow beam. We would never see it.</p>
{TALK}
</div></div>"""

def reach_circle(w=358, h=182):
    # Who could have answered Pearl in time: anyone inside the circle.
    cx, cy, k = 96, 86, 10
    s = [stipple(181, 40, w, h), f'<circle cx="{cx}" cy="{cy}" r="{fmt(R_ANS * k)}" fill="{OTHER}" fill-opacity=".07" stroke="{OTHER}" stroke-width="1.3" stroke-dasharray="5 3"></circle>']
    s.append(f'<circle cx="{cx}" cy="{cy}" r="5" fill="{PAPER}" stroke="{OTHER}" stroke-width="1.5"></circle>' + text(cx, cy + 18, 'Pearl', 9.5, OTHER, 'middle', 600))
    def put(hip, ang, name, col, sub):
        r = math.dist(atlas(by_hip[hip]), PEARL) * k; a = math.radians(ang); x, y = cx + r * math.cos(a), cy + r * math.sin(a)
        s.append(f'<circle cx="{fmt(x)}" cy="{fmt(y)}" r="3.5" fill="{col}"></circle>' + text(x + 8, y + 4, name, 9.5, col, 'start', 600) + text(x + 8, y + 15, sub, 8, MUTED))
    put('2021', -128, 'Beacon', OTHER, f'{math.dist(atlas(by_hip["2021"]), PEARL):.1f} ly')
    put('105858', 22, 'Frost', INK, f'{math.dist(atlas(by_hip["105858"]), PEARL):.1f} ly · too far')
    put('99240', -14, 'Veyra', YOU, f'{d_p:.1f} ly · too far')
    s.append(text(cx, cy + R_ANS * k + 14, f'within {R_ANS:.0f} ly: close enough in time', 8.5, OTHER, 'middle'))
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="A circle of 7 light-years around Pearl: Beacon just inside, Frost and Veyra outside">{"".join(s)}</svg>'
SWEEP_CHANGED = tab_screen('Report', 'REPORT', 'SIGNAL · CHANGED', f"""<button class="backlink inline">‹ All reports</button>
<h3 class="lead">Pearl has been answered</h3>
<div class="voice"><span class="mono">NEW IN PEARL’S BROADCAST · YEAR {Y_SWC:.0f}</span><p>“We have been answered. We are not alone.”</p></div>
<div class="art">{reach_circle()}</div>
<div class="sec">WHO COULD HAVE ANSWERED</div>
{ledger([('The change', f'Left Pearl in Year {Y_CH_LEFT:.1f}, {Y_CH_LEFT - Y_P0:.0f} Years after the broadcast began'),
         ('So the answer', f'Came from within {R_ANS:.0f} ly of Pearl'),
         ('One we know', f'Beacon, if it answered within half a Year of hearing'),
         ('Ones we don’t', f'{N_NEAR_PEARL} other stars that close. None has spoken to us.'),
         ('Beacon, to us', 'Nothing about Pearl, in any message')])}
<button class="primary">What now</button>""", at_year((30, 35, '9,600 kt'), Y_SWC))

# ---------- Broadcasting: the permanent choice ----------
# Year 520. The broadcast beacon is built. A knock goes to one star; a broadcast goes every way at once and carries its
# own address. Every star of the region (50 ly around Sol, so up to 69.9 ly from Veyra) hears it by Year 590, and it
# never stops. Sending takes a share of each year's energy for as long as it sends: a sample value.
Y_BC = 520.0; Y_BM = 531.0
HUD_BC = at_year((35, 40, '14,200 kt'), Y_BC)
d_sol = math.dist(HOME, (0, 0, 0)); R_REGION = d_sol + 50
HEARD = [  # (name, hip, what we know, tone)
    ('Ember', '108870', f'knows where we are since Year {Y_FLASH}', 'other'),
    ('Beacon', '2021', f'knows since Year {Y_FOUND:.1f} or earlier', 'other'), ('Lantern', '99461', f'its visitor came in Year {Y_VS:.0f} · never heard from us', 'other'),
    ('Frost', '105858', f'knows since Year {440 - 2 * d_f:.0f} or earlier', 'other'), ('Pearl', '1599', 'broadcasts to everyone · never heard from us', 'other'),
    ('Twin', 'sol', 'oxygen world · never heard from us', 'other')]
def dist_to(hip): return d_sol if hip == 'sol' else math.dist(atlas(by_hip[hip]), HOME)
def hear_row(name, hip, known, tone):
    d = dist_to(hip)
    return (f'<div class="hearrow"><span class="mk {tone}"></span><span class="pt"><span class="{tone}">{name} · {d:.1f} ly</span><span class="sub">{known}</span></span>'
            f'<span class="pd">{tstack(f"Year {Y_BC + d:.1f}", clock(d * 5))}</span></div>')

BC_COMPOSE = f"""<div class="phone">{HUD_BC}<div class="sheet">
<div class="sh"><button class="backlink">‹ Reach</button><span class="mono kind">REACH · BROADCAST</span></div>
<div class="sec">WHAT YOU WANT TO SAY</div>
<div class="intent">Tell everyone who can hear that we are here, who we are, and that we answer anyone who knocks. Nothing about Beacon or our probes.<i></i></div>
<div class="sec">THE MIND’S VERSION · WHAT WILL TRAVEL</div>
{part('WHO WE ARE · OUR FOUNDING LINE', '<b class="inscribed">“Keep the lights on. Look before we speak.”</b>')}
{part('AN OFFER', '<b>“Knock, and we will answer.”</b>')}
<ul class="left"><li><b>Our signature</b> leads it: our pulses, so any answer can find us.</li><li><b>Where we are</b> needs no part. A broadcast’s source is its address.</li><li><b>Beacon, our probes:</b> nothing here names them.</li></ul>
<p class="warnline">Broadcasting goes against our lean toward hidden.</p>
<div class="voice ours"><span class="mono">HOW ANYONE WILL READ IT · NO READER KNOWN</span><p>“We are Veyra. We keep the lights on, and we look before we speak. Knock, and we will answer.”</p></div>
<p class="copy small">The mind can’t shape it for listeners it doesn’t know, so it goes in our own voice, repeating.</p>
{TALK}
<div class="twobtn"><button class="primary ghost">Edit</button><button class="primary">Who will hear it</button></div>
</div></div>"""

def hears_drawing():
    w, h, x0, px, y = 358, 96, 20, 4.4, 40
    X = lambda ly: x0 + ly * px
    s = [f'<line x1="{x0}" y1="{y}" x2="{fmt(X(R_REGION))}" y2="{y}" stroke="{INK}" stroke-width=".7"></line>',
         f'<path d="M{fmt(X(R_REGION))} {y} H{w - 8} M{w - 8} {y} l-6 -4 M{w - 8} {y} l-6 4" fill="none" stroke="{YOU}" stroke-width="1.1" stroke-dasharray="3 3"></path>',
         text(w - 8, y - 8, 'on', 8.5, YOU, 'end'),
         f'<rect x="{x0}" y="{y + 20}" width="{fmt(X(R_REGION) - x0)}" height="5" fill="url(#hatch)" opacity=".6"></rect>',
         text(X(R_REGION), y + 36, 'every star of the region', 8.5, MUTED, 'end')]
    s.append(f'<circle cx="{x0}" cy="{y}" r="4.5" fill="{YOU}"></circle>' + text(x0 - 4, y - 10, 'Veyra', 9, YOU))
    lo, hi = X(dist_to('108870')), X(dist_to('105858'))
    s.append(f'<path d="M{fmt(lo)} {y - 10} V{y - 14} H{fmt(hi)} V{y - 10}" fill="none" stroke="{OTHER}" stroke-width=".8"></path>'
             + text(lo - 2, y - 20, 'Ember · Beacon · Lantern · Frost', 8.5, OTHER, 'start', 600))
    for name, hip, _, tone in HEARD:
        x = X(dist_to(hip)); col = OTHER if tone else INK
        s.append(f'<circle cx="{fmt(x)}" cy="{y}" r="2.6" fill="{PAPER}" stroke="{col}" stroke-width="1.2"></circle>')
    s.append(text(X(d_sol) + 4, y + 14, 'Twin', 8.5, OTHER, 'middle', 600) + text(X(dist_to('1599')) - 4, y + 14, 'Pearl', 8.5, OTHER, 'middle', 600))
    for ly in (10, 20, 40, R_REGION):
        s.append(text(X(ly), h - 4, f'Year {Y_BC + ly:.0f}', 8, MUTED, 'middle' if ly < R_REGION else 'end'))
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Who hears the broadcast, placed by distance: the nearest known stars within 11 years, Twin at 20, every star of the region by Year 590">{"".join(s)}</svg>'
BC_WHO = f"""<div class="phone">{HUD_BC}<div class="sheet">
<div class="sh"><button class="backlink">‹ Broadcast</button><span class="mono kind">REACH · BROADCAST</span></div>
<h3 class="lead">Everyone, for good</h3>
<p class="whyline">It goes every way at once, at light speed, and keeps going. Anyone who hears it learns where we are.</p>
<div class="art">{hears_drawing()}</div>
<div class="sec">WHO HEARS IT · SOONEST FIRST</div>
{''.join(hear_row(*r) for r in HEARD)}
<div class="hearrow"><span class="mk"></span><span class="pt"><span>Every star of the region</span><span class="sub">1,212 within 50 ly of Twin, most never heard</span></span><span class="pd">{tstack(f'by Year {Y_BC + R_REGION:.0f}', clock(R_REGION * 5))}</span></div>
<p class="copy small">You can stop sending. What has left keeps going: past the region’s edge by Year {Y_BC + d_sol + 100:.0f}, fading, never stopping.</p>
<p class="copy small mono">Sending: E 10% each Year while it sends</p>
<button class="primary">Hold to broadcast</button>
</div></div>"""

def bc_sky():
    w, h, cx, cy = 390, 380, 195, 210
    s = [f'<rect width="{w}" height="{h}" fill="{PAPER}"></rect>', stipple(143, 150, w, h)]
    for i, r in enumerate((34, 68, 108, 152, 200, 252)):
        s.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{YOU}" stroke-width="{1.6 if i == 0 else 1.1}" stroke-dasharray="{"" if i == 0 else "4 4"}" opacity="{fmt(1 - i * .14)}"></circle>')
    for x, y, name in ((258, 150, 'Ember'), (118, 128, 'Beacon'), (300, 262, 'Frost'), (70, 312, 'Twin')):
        s.append(f'<circle cx="{x}" cy="{y}" r="3.5" fill="{PAPER}" stroke="{OTHER}" stroke-width="1.3"></circle>' + text(x + 8, y + 4, name, 10, OTHER, 'start', 600))
    s.append(sigil(VEYRA_SEED, YOU, cx, cy, 26))
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Our broadcast leaving Veyra in every direction">{"".join(s)}</svg>'
BC_SENT = f"""<div class="phone cine"><div class="cinetop"><span>Veyra</span><span class="mono">Year {Y_BC:.1f}</span></div>{bc_sky()}
<div class="cinetext"><span class="mono kick">BROADCASTING</span><h3>To everyone.</h3>
<p>In {dist_to('108870'):.0f} Years it passes Ember and Beacon. In {d_sol:.0f}, Twin. By Year {Y_BC + R_REGION:.0f}, every star in the region.</p>
<p>You can stop sending. You can’t unsend.</p>
<div class="cinebtn"><button class="light">Back to Reach</button></div></div></div>"""

r_bm = Y_BM - Y_BC
BC_MAP = frame(2, *neighbors(shell=(r_bm, f'our broadcast · {r_bm:.0f} ly')), panel=(f'SPREADING · {r_bm:.0f} LY OUT', f'YEAR {Y_BM:.0f}', [
    row('Our broadcast', f'{r_bm:.0f} of {R_REGION:.0f} ly · the whole region by Year {Y_BC + R_REGION:.0f}', tstack(f'{Y_BC + R_REGION - Y_BM:.0f} Years', clock((Y_BC + R_REGION - Y_BM) * 5), True), 'you', bar=round(r_bm / R_REGION * 100)),
    row('Heard it by now · 5 stars we know', 'Gliese 832, Ember, Beacon, Lantern, Frost', ''),
    row('Next we know of · Pearl', f'broadcasts to everyone · {dist_to("1599"):.1f} ly', tstack(f'{Y_BC + dist_to("1599") - Y_BM:.1f} Years', clock((Y_BC + dist_to('1599') - Y_BM) * 5), True), 'other', marker=True),
    row('Earliest answer · from Ember', 'if they answer the moment it lands', tstack(f'Year {Y_BC + 2 * dist_to("108870"):.1f}', clock((Y_BC + 2 * dist_to('108870') - Y_BM) * 5), True))]),
    year=f'Year {Y_BM:.1f}', res=(45, 40, '14,600 kt'))

# ---------- Mock checklist: everything to mock, and where each stands ----------
CHECKLIST = [
    ('Onboarding', [('Choose your civilization: three candidates', 'done'), ('Name it and accept its charter', 'done'),
                    ('Landing: the first seconds on Veyra', 'done'), ('What you inherit: the starting kit', 'done'), ('Guided tour', 'done'),
                    ('Hand-off to the clues', 'done')]),
    ('Home', [('Five zoom levels', 'done'), ('Local Group and galaxy close-ups', 'done'), ('Projects on the map, with timers', 'done'),
              ('Clue marker after a result', 'done'), ('Tap a star: its card', 'done'), ('A clue in full: what we know, odds, next steps', 'done'),
              ('A probe in flight on the map', 'done'), ('A message on its way, spreading at light speed', 'done')]),
    ('Projects', [('Empty, pick, confirm, started, two running, paused', 'done'), ('Grow and Reach tabs of the picker', 'done'),
                  ('A locked project and what it needs', 'done'), ('Not enough energy or compute', 'done'),
                  ('A project finishes, seen in Projects', 'done'), ('Queue the next project for while you are away', 'done'),
                  ('Cancel a project', 'done'), ('Budget drilldown: real units behind each share', 'done')]),
    ('Report', [('A new result, and the result in full', 'done'), ('Back after a long absence', 'done'), ('Replaying an absence on the map', 'done'), ('Nothing new yet', 'done')]),
    ('Reach', [('Empty, with standing orders', 'done'), ('Launch a probe: target, arrival and report times', 'done'), ('A probe in flight', 'done'),
               ('A probe arrives and reports', 'done'), ('Probe types: how to get there, per target', 'done'), ('A sentinel in orbit: watching, and new orders', 'done'), ('Compose a message: intent, the mind’s version, approve', 'done'),
               ('Broadcast: the permanent choice', 'done'), ('Standing orders editor', 'done')]),
    ('Mind', [('Charter and character', 'done'), ('Talk it through: the mind’s view, when asked', 'done'), ('Orders for while you are away', 'done'),
              ('Settings: theme, replay the tour, notifications', 'done')]),
    ('Contact', [('Away: the notification', 'done'), ('The arrival, as a moment', 'done'), ('The knock arrives', 'done'), ('The signal in full: what it tells us', 'done'), ('Who sent it: the star card', 'done'),
                 ('The choice: knock back, broadcast, or stay dark', 'done'), ('Sent: the conversation and its timeline', 'done'),
                 ('The first reply arrives', 'done'), ('A message lands: their signature and words', 'done'), ('Sending: the reply leaves', 'done'), ('The conversation as the gulf between worlds', 'done'), ('Replying: intent, the mind’s version, approve', 'done'), ('Checking a claim: it holds, or it doesn’t', 'done'), ('What we know, both ways', 'done'), ('Their world, as we know it: a drawing that fills in', 'done'),
                 ('We find them first: a clue confirmed', 'done'), ('A broadcast sweeps past', 'done'), ('A visitor brakes into our system', 'done'),
                 ('A far mind met them first', 'done'), ('A meeting in person: how, where, and talking live', 'done'), ('Crossed knocks', 'done'), ('The silent one: no answer, ever', 'done')]),
    ('Stakes', [('Readiness: what keeps us safe, direction by direction', 'done'), ('Strike {target}: every weapon, and who would know', 'done'),
                ('Standing orders for danger', 'done'), ('The strike as first contact', 'later'), ('Wounded: the morning after', 'later'), ('Total loss and a new cohort', 'later')]),
]
def checklist_html(areas=None):
    out = ['<div class="checklist">']
    for area, items in CHECKLIST:
        if areas and area not in areas: continue
        done = sum(state == 'done' for _, state in items)
        out.append(f'<div class="carea"><h3>{area}<span class="mono">{done} of {len(items)}</span></h3><ul>'
                   + ''.join(f'<li class="st-{state.split(":")[0]}"><span class="box" aria-hidden="true"></span><span>{name}</span>'
                             + (f'<em>{state}</em>' if state not in ('done', 'todo', 'later') else '') + '</li>' for name, state in items) + '</ul></div>')
    return ''.join(out) + '</div>'
def checklist_md():
    lines = ['# Holos · mock checklist', '', 'Generated by build-zoom.py. Everything the game needs mocked, and where each stands.', '']
    for area, items in CHECKLIST:
        lines += [f'## {area}', ''] + [f'- [{"x" if state == "done" else " "}] {name}' + (f' ({state})' if state not in ('done', 'todo', 'later') else '') for name, state in items] + ['']
    return '\n'.join(lines)
(here / 'CHECKLIST.md').write_text(checklist_md())

# ---------- Low-fi layouts, recolored to follow the theme ----------
import re
LOFI = {'#F3F1EA': 'var(--paper)', '#1D1D1B': 'var(--ink)', '#6B6860': 'var(--muted)', '#CFCBC0': 'var(--faint)', '#E0DCD1': 'var(--track)', '#4A4843': 'var(--fill2)',
        '#EBE8DF': 'var(--panel)', '#DCD8CE': 'var(--rowline)', '#8F8B82': 'var(--dot)', '#1F7A96': 'var(--you)', '#A8620F': 'var(--other)'}
lofi = (here / 'lofi.html').read_text().split('-->', 1)[1]
lofi = re.sub(r'style="([^"]*)"', lambda m: 'style="' + re.sub('|'.join(LOFI), lambda c: LOFI[c.group(0)], m.group(1)) + '"', lofi)

SECTIONS = [
    ('zoom', 'Zoom levels', 'Home · five zoom levels', 'One screen, pinched outward: the map changes scale and the panel below follows it. Star positions are real, from HYG and the Gaia census; Veyra, its planets and the game state are sample data. The sample is Year 50, just after the orbital foundry started.', figures),
    ('local-group', 'Local Group', 'Local Group · the galaxy view’s icon', 'A small icon in the galaxy view opens our neighboring galaxies at their real positions. Tap one to see its structure.', lg_figures),
    ('waking', 'Waking', 'First seconds · waking, and what you inherit', 'After choosing and naming a civilization. The mind wakes, then sees what Veyra already has: Earth’s instruments and industry today, plus about a century. The kit found the opening clues. Every project goes beyond it.',
     f'<figure><figcaption><strong>1 · Veyra wakes</strong><span>The first screen of play. Line art, in the app’s theme.</span></figcaption>{WAKE}</figure>'
     '<span class="pinch">see what you inherit ›</span>'
     f'<figure><figcaption><strong>2 · What you inherit</strong><span>The starting kit, grouped by purpose, then the hand-off to the clues and the tour.</span></figcaption>{INHERIT}</figure>'),
    ('tour', 'Tour', 'First session · the guided tour', 'Six stops after landing, before anything is under way. The rest of Home is left to discovery. The Projects stop is where time gets explained. Skippable, and replayable from the Mind tab.', tour_figures),
    ('clues', 'Clues', 'Stars and clues · tap to look closer', 'Tap any star on the map for its card. Stars bright in Veyra’s sky carry Veyra’s own names, with the real name beneath; faint ones keep their catalog names, since no one named what they could not see. A clue opens in full: what we see, what it could be, and how long each way of finding out takes.',
     f'<figure><figcaption><strong>1 · Tap a star</strong><span>Ember has a clue. Its card opens over the map, which stays visible above.</span></figcaption>{STAR_EMBER}</figure>'
     '<span class="pinch">tap the clue ›</span>'
     f'<figure><figcaption><strong>2 · The clue in full</strong><span>What we see, the odds, and four ways to find out, each with its earliest answer.</span></figcaption>{CLUE_GLOW}</figure>'
     '<span class="pinch">or tap a faint star ›</span>'
     f'<figure><figcaption><strong>3 · A faint star</strong><span>Too dim for Veyra’s eyes, so it keeps its catalog name. Nothing unusual yet.</span></figcaption>{STAR_QUIET}</figure>'),
    ('projects', 'Projects', 'Projects · starting the first one', 'A fresh start on the Projects tab, where time gets explained: what you spend each year, and when things finish. Drawn to match the atlas. Energy and compute are yearly budgets, since neither can be stored at planetary scale; matter is a stockpile, drawn once when a project starts.',
     f'<figure><figcaption><strong>1 · Empty state</strong><span>Before the first project. Capacity idle, timeline empty.</span></figcaption>{PROJECTS_EMPTY}</figure>'
     '<span class="pinch">start a project ›</span>'
     f'<figure><figcaption><strong>2 · Pick</strong><span>Sorted by purpose. Know projects name the clue they help with.</span></figcaption>{PICKER}</figure>'
     '<span class="pinch">tap a project ›</span>'
     f'<figure><figcaption><strong>3 · Confirm</strong><span>What it does, which clue it helps, what it uses each year, and when it finishes.</span></figcaption>{CONFIRM}</figure>'
     '<span class="pinch">start ›</span>'
     f'<figure><figcaption><strong>4 · Started</strong><span>The drawing fills in as it is built. Its timer runs even while you are away.</span></figcaption>{STARTED}</figure>'
     '<span class="pinch">start another ›</span>'
     f'<figure><figcaption><strong>5 · Two running</strong><span>Each takes its share of the year. The quick one finishes first.</span></figcaption>{TWO_RUNNING}</figure>'
     '<span class="pinch">pause ›</span>'
     f'<figure><figcaption><strong>6 · Paused</strong><span>Any project can be paused. Progress is kept and its share of the year is freed.</span></figcaption>{PAUSED}</figure>'),
    ('picker', 'Picker', 'Projects · the rest of the picker', 'Grow projects say what they add every year. Reach projects warn when they make you visible. A locked project shows what it needs first and when it could finish. Over budget, the game offers three ways forward instead of a dead end.',
     f'<figure><figcaption><strong>1 · Grow</strong><span>Each card says what it adds every year. Later ones show what they need.</span></figcaption>{PICK_GROW}</figure>'
     '<span class="pinch">tap a locked project ›</span>'
     f'<figure><figcaption><strong>2 · A locked project</strong><span>What it needs, in order, and the earliest it could be done.</span></figcaption>{LOCKED}</figure>'
     '<span class="pinch">or switch to Reach ›</span>'
     f'<figure><figcaption><strong>3 · Reach</strong><span>Speaking comes first. Anything that reveals you says so on the card.</span></figcaption>{PICK_REACH}</figure>'
     '<span class="pinch">later: Year 22 ›</span>'
     f'<figure><figcaption><strong>4 · Not enough compute</strong><span>Starting Listen to Ember would need 120% of this year’s compute.</span></figcaption>{OVER}</figure>'),
    ('upnext', 'Up next', 'Projects · finishing, Up next, cancelling', 'What a finished project leaves behind, how Up next keeps projects starting while you are away, and what cancelling costs. Pausing is always offered beside it.',
     f'<figure><figcaption><strong>1 · Done</strong><span>Year 18.4. The telescope is drawn in full, its result waits in the Report, and it opened four projects.</span></figcaption>{FINISHED}</figure>'
     '<span class="pinch">later: Year 22 ›</span>'
     f'<figure><figcaption><strong>2 · Up next</strong><span>After choosing “Start when there’s room”. Each says what it waits for, and when.</span></figcaption>{UP_NEXT}</figure>'
     '<span class="pinch">or, earlier ›</span>'
     f'<figure><figcaption><strong>3 · Cancel</strong><span>Year 7.6, from a running project’s menu. The costs are spelled out, with pausing beside it.</span></figcaption>{CANCEL}</figure>'),
    ('map', 'On the map', 'Projects on the map', 'Every project appears where it physically is, with its timer. Things in orbit show at World; things elsewhere around the star show at System; anything off-screen gets an edge marker. Drawings are symbols, not to scale: a kilometer-wide receiver would be smaller than a pixel here.',
     f'<figure><figcaption><strong>1 · Building</strong><span>The receiver fills in as it is built. Each project carries its countdown.</span></figcaption>{frame(0, *world(), **SAMPLE)}</figure>'
     '<span class="pinch">00:37:42 later ›</span>'
     f'<figure><figcaption><strong>2 · Done</strong><span>Drawn in full, marked done, and listening. The other timers kept running.</span></figcaption>{MAP_DONE}</figure>'
     '<span class="pinch">pinch out ›</span>'
     f'<figure><figcaption><strong>3 · System</strong><span>The foundry at L5, and both projects at Veyra, each with its timer.</span></figcaption>{frame(1, *system(), **SAMPLE)}</figure>'),
    ('result', 'First result', 'First result · the transit watch finishes', 'Twenty real minutes after starting it, the transit watch reports. The answer shifts the odds on the Lantern clue and opens a new project aimed at it. Four game years have passed: it is now Year 4.4.',
     f'<figure><figcaption><strong>1 · The report</strong><span>The finished project lands at the top, marked new.</span></figcaption>{REPORT_NEW}</figure>'
     '<span class="pinch">see the result ›</span>'
     f'<figure><figcaption><strong>2 · The result</strong><span>Opens inside the Report tab: what was seen, how the odds moved, and what it opens.</span></figcaption>{RESULT}</figure>'
     '<span class="pinch">start a project ›</span>'
     f'<figure><figcaption><strong>3 · A new project</strong><span>The discovery project is waiting at the top of Know.</span></figcaption>{PICKER_NEW}</figure>'
     '<span class="pinch">back to Home ›</span>'
     f'<figure><figcaption><strong>4 · Home, after</strong><span>The Lantern marker fills in and carries what is now known.</span></figcaption>{HOME_AFTER}</figure>'),
    ('absence', 'Away', 'Report · coming back after a long absence', f'Nine hours away is 108 Years. The Report opens on what matters: how long it was, the big things, what the mind did under your standing orders, and what is waiting for you. The map can replay it all in a minute. When nothing is new, the Report shows what is already on its way, soonest first.',
     f'<figure><figcaption><strong>1 · Welcome back</strong><span>108 Years on one strip. The big things first, then what the mind did for you, then what waits.</span></figcaption>{WELCOME}</figure>'
     '<span class="pinch">replay on the map ›</span>'
     f'<figure><figcaption><strong>2 · The replay</strong><span>The map, running 108 Years in a minute. Paused here at Year 412, with the sentinel nearly at Ember.</span></figcaption>{REPLAY}</figure>'
     '<span class="pinch">later, nothing new ›</span>'
     f'<figure><figcaption><strong>3 · Nothing new yet</strong><span>What is already on its way, with when each will land.</span></figcaption>{NOTHING_NEW}</figure>'),
    ('knock', 'Knock', 'First contact · the knock', f'Year {Y_ARR}. A laser aimed at Veyra arrives from Beacon, carrying nothing but itself. The arrival takes over the screen, one beat at a time, with one low tone per pulse. Then what it tells us, who sent it, and the choice. Assumes a starting sky watch; the tight-beam transmitter is built, the broadcast beacon is not.',
     f'<figure><figcaption><strong>Away · the notification</strong><span>If you are not playing, the knock finds you.</span></figcaption>{LOCK}</figure>'
     '<span class="pinch">open ›</span>'
     + ''.join(f'<figure><figcaption><strong>Arrival · {n + 1} of 4</strong><span>{cap}</span></figcaption>{f}</figure>' + ('<span class="pinch">›</span>' if n < 3 else '')
               for n, (f, cap) in enumerate(zip(ARRIVAL, ['The screen gives way to the sky. The first pulse.', 'The pulses keep coming, in real time, with a tone for each.', 'The line draws itself from Beacon to Veyra.', 'The meaning, said plainly. Then the choice to look closer.'])))
     + '<span class="pinch">see the signal ›</span>'
     f'<figure><figcaption><strong>1 · Home, after</strong><span>The line stays on the map. Beacon is now a lead.</span></figcaption>{KNOCK_ARRIVES}</figure>'
     '<span class="pinch">see the signal ›</span>'
     f'<figure><figcaption><strong>2 · The signal</strong><span>What was measured, and what it means: they found us years ago.</span></figcaption>{KNOCK_SIGNAL}</figure>'
     '<span class="pinch">who is Beacon ›</span>'
     f'<figure><figcaption><strong>3 · Who sent it</strong><span>Beacon, the brightest star in our sky. Nothing unusual was seen there before.</span></figcaption>{KNOCK_WHO}</figure>'
     '<span class="pinch">decide ›</span>'
     f'<figure><figcaption><strong>4 · The choice</strong><span>Four options, three of them permanent. Nothing is chosen for you; the mind is one tap away.</span></figcaption>{KNOCK_CHOICE}</figure>'
     '<span class="pinch">or talk it through ›</span>'
     f'<figure><figcaption><strong>5 · Talk it through</strong><span>Opt-in. The decision stays pinned. The mind answers from what we know, and gives its view only when asked.</span></figcaption>{MIND_TALK}</figure>'
     '<span class="pinch">decide ›</span>'
     f'<figure><figcaption><strong>6 · Sent</strong><span>The conversation view, as it looks for every exchange: the gulf between the two worlds, and each message with its years in flight.</span></figcaption>{KNOCK_SENT}</figure>'),
    ('reply', 'Reply', 'First contact · the first reply', f'Year {Y_R_ARR}. Two worlds {d_b:.1f} light-years apart, speaking across a decade each way. A message landing is an event: their signature, their words set large, what they carried. Sending is a ceremony. The conversation is drawn as the gulf between the two worlds, with every message’s years in flight. Facts travel as parts; the prose is each civilization’s own voice.',
     f'<figure><figcaption><strong>1 · Beacon speaks</strong><span>A reply lands. Their signature, drawn from their pulses, then their words.</span></figcaption>{RECEPTION}</figure>'
     '<span class="pinch">read what it carried ›</span>'
     f'<figure><figcaption><strong>2 · What they said</strong><span>Their voice first, set large, with what doesn’t translate. Then the parts.</span></figcaption>{REPLY_READ}</figure>'
     '<span class="pinch">reply ›</span>'
     f'<figure><figcaption><strong>3 · Our reply</strong><span>What you want to say, what will travel, what was left out and why, and how it will read. The mind translates; it doesn’t judge.</span></figcaption>{COMPOSE}</figure>'
     '<span class="pinch">approve and send ›</span>'
     f'<figure><figcaption><strong>4 · Sent</strong><span>Our signature, and our reply leaving for Beacon. It can’t be recalled.</span></figcaption>{SENT_CINE}</figure>'
     '<span class="pinch">then ›</span>'
     f'<figure><figcaption><strong>5 · The conversation</strong><span>The gulf between the worlds, the exchange with its years in flight, what we know of them, and how they have changed us.</span></figcaption>{GULF}</figure>'),
    ('probe', 'Probe', 'Reach · sending a probe', f'Year {Y_PB:.0f}. The launcher and the flyby probe line are built. A probe flies past its star at a tenth of light speed and beams home what it saw. Every choice shows its whole journey: build, flight, and the report crossing back. Ember is {d_e:.1f} ly away, so its report comes {R_e - Y_PB:.0f} Years from now, <span class="rtime">{clock((R_e - Y_PB) * 5)}</span> of real time.',
     f'<figure><figcaption><strong>0 · Reach, before anything</strong><span>The first session: nothing beyond Veyra yet, and no standing orders.</span></figcaption>{REACH_EMPTY}</figure>'
     '<span class="pinch">later: Year 118 ›</span>'
     f'<figure><figcaption><strong>1 · Where to</strong><span>Every reachable target, nearest first, with its arrival, its report, and the real time until we know.</span></figcaption>{PROBE_PICK}</figure>'
     '<span class="pinch">Ember ›</span>'
     f'<figure><figcaption><strong>2 · The journey</strong><span>Build, flight and report, drawn to scale. Who could see it. It can’t be recalled.</span></figcaption>{PROBE_CONFIRM}</figure>'
     '<span class="pinch">Year 176 ›</span>'
     f'<figure><figcaption><strong>3 · In flight</strong><span>Year 176, halfway there. Its journey with the now mark. A standing order waits on its report.</span></figcaption>{PROBE_FLIGHT}</figure>'
     '<span class="pinch">on the map ›</span>'
     f'<figure><figcaption><strong>4 · On the map</strong><span>Its path to Ember, and how far along it is.</span></figcaption>{PROBE_MAP}</figure>'),
    ('flyby', 'Report', 'Reach · the probe reports', f'Year {R_e:.0f}. The probe passed Ember in Year {A_e:.0f}, and its report has crossed {d_e:.1f} light-years home. The glow was a swarm of collectors: someone built this. Our first close look at another system lands like a knock, then asks what to do with what we now know. Nothing is chosen for us.',
     f'<figure><figcaption><strong>1 · The report lands</strong><span>Ember, drawn from what the probe saw, then what it means.</span></figcaption>{FLYBY_LANDS}</figure>'
     '<span class="pinch">see the report ›</span>'
     f'<figure><figcaption><strong>2 · What it saw</strong><span>The band, what each body is, how much light they catch, and what wasn’t seen. The clue is resolved.</span></figcaption>{FLYBY_REPORT}</figure>'
     '<span class="pinch">what now ›</span>'
     f'<figure><figcaption><strong>3 · What now</strong><span>Every next step, with what it costs in time and what it reveals. Any of them, or none.</span></figcaption>{FLYBY_NEXT}</figure>'
     '<span class="pinch">Ember ›</span>'
     f'<figure><figcaption><strong>4 · Ember, as we now know it</strong><span>The same drawing as Beacon’s, filling in. Where Beacon’s founding line rings its star, Ember’s ring is empty.</span></figcaption>{EMBER_KNOWN}</figure>'),
    ('probe-types', 'Probe types', 'Reach · eight kinds of probe', f'Later in a game, Year {Y_PT:.0f}. Physics allows several ways to cross between stars, and each is good at something different: a quick look, staying, stealth, numbers, speed, or building. They unlock over a game. Which ones can stop depends on the target: a sail can brake on starlight only at a bright star. Nothing is chosen for you.',
     f'<figure><figcaption><strong>1 · How to get to Ember</strong><span>Every type compared for one target. Ember is too dim for a starlight sail to brake. Two types are not yet built.</span></figcaption>{TYPES_EMBER}</figure>'
     '<span class="pinch">or Beacon ›</span>'
     f'<figure><figcaption><strong>2 · How to get to Beacon</strong><span>The same list for a bright star: here a starlight sail can stop, quietly and cheaply.</span></figcaption>{TYPES_BEACON}</figure>'),
    ('sentinel', 'Sentinel', 'Reach · a sentinel at Ember', f'Year {Y_SR:.0f}. A sentinel ordered after the flyby report has crossed at 5% of light speed and braked on its magnetic sail. It orbits Ember just outside the band, and watches. What it sees reaches us {d_e:.1f} Years late, and any order we send takes {d_e:.1f} Years to reach it, so it acts on its standing orders alone.',
     f'<figure><figcaption><strong>1 · It has stopped</strong><span>The first report from orbit. The drawing shows its braking path curving into orbit.</span></figcaption>{SENT_ARRIVES}</figure>'
     '<span class="pinch">see what it sees ›</span>'
     f'<figure><figcaption><strong>2 · What it watches</strong><span>The band up close, years of it. Its standing orders, which it follows alone.</span></figcaption>{SENT_WATCH}</figure>'
     '<span class="pinch">new orders ›</span>'
     f'<figure><figcaption><strong>3 · Move it?</strong><span>Where it could go, how long each move takes, and when we would hear. Nothing is chosen for you.</span></figcaption>{SENT_MOVE}</figure>'),
    ('noticed', 'Noticed', 'First contact · they meet our sentinel', f'Year {Y_NSEE}. We ordered the sentinel to close in on the band. The builders noticed. Their first word was not a message to us but a gesture to our probe: three flashes of their own starlight. The sentinel acted on its standing orders long before we knew. This is contact through a far mind: everything here happened {d_e:.1f} Years before we read it.',
     f'<figure><figcaption><strong>1 · They turned toward it</strong><span>The report lands. The drawing shows the stretch that turned, its light thrown at our sentinel, and the body that follows.</span></figcaption>{NOTICED_LANDS}</figure>'
     '<span class="pinch">see the report ›</span>'
     f'<figure><figcaption><strong>2 · Its log</strong><span>What happened at Ember, line by line, and what the builders now know about us.</span></figcaption>{NOTICED_LOG}</figure>'
     '<span class="pinch">what now ›</span>'
     f'<figure><figcaption><strong>3 · What now</strong><span>Orders that arrive {d_e:.1f} Years late, and our own voice from home. Nothing is chosen for you.</span></figcaption>{NOTICED_NEXT}</figure>'),
    ('check', 'Check', 'First contact · checking what they told us', 'Beacon said Ember’s heat is smooth, with no dust. A lie reads exactly like the truth, so the only test is to measure it ourselves. It takes 2 Years, and the answer can go either way. Their view of Ember is older than ours, so a mismatch is strong evidence of a lie, not proof.',
     f'<figure><figcaption><strong>1 · Check it</strong><span>From the finding in their message. Our space telescope, 2 Years.</span></figcaption>{CHECK_START}</figure>'
     '<span class="pinch">if it holds ›</span>'
     f'<figure><figcaption><strong>2a · It holds</strong><span>Our measurement matches theirs. The odds on Ember move, and Beacon’s record grows.</span></figcaption>{CHECK_HOLDS}</figure>'
     '<span class="pinch">or if not ›</span>'
     f'<figure><figcaption><strong>2b · It doesn’t</strong><span>We see the dust. How likely a lie is against three honest causes, and what we could do. Nothing is chosen for us.</span></figcaption>{CHECK_FAILS}</figure>'
     '<span class="pinch">then ›</span>'
     f'<figure><figcaption><strong>3 · What we know, both ways</strong><span>The record of the conversation: what we know about Beacon, and what Beacon knows about us.</span></figcaption>{DOSSIER}</figure>'
     '<span class="pinch">their world ›</span>'
     f'<figure><figcaption><strong>4 · Their world, as we know it</strong><span>A drawing that fills in with every message and check. Solid is measured, dashed inferred, a question mark not yet seen. Their founding line rings it.</span></figcaption>{PORTRAIT}</figure>'),
]

SECTIONS += [
    ('readiness', 'Readiness', 'Stakes · what keeps us safe', f'Year {Y_SK}. Veyra has built no weapon, and that is a way to play. Readiness shows what keeps a civilization alive, direction by direction, tested only against weapons it could build itself. A launch toward us is dark to us, since its exhaust points away, so the only warning comes from pickets that see a bullet’s nose glow on its way in.',
     f'<figure><figcaption><strong>1 · Readiness, now</strong><span>A vault and an archive, and no guarded direction. The honest answer: no warning, from anywhere.</span></figcaption>{READY_NOW}</figure>'
     f'<span class="pinch">later: Year {Y_RL:.0f} ›</span>'
     f'<figure><figcaption><strong>2 · One line, guarded</strong><span>Pickets and depots toward Lantern. Warning at each speed we could build, in days and real seconds. Interception runs with no order.</span></figcaption>{READY_LINE}</figure>'),
    ('strike', 'Strike', 'Stakes · a strike, and who would know', f'Year {Y_SK}. Lantern’s visitor has sat in our belt since Year {Y_VS:.0f}, and Lantern’s world is mapped. The strike screen compares every weapon we have, as the probe screen compares probes: what it would do, the warning they get, who sees it go, and whose name is on it. It shows consequences, never a recommendation. A peaceful civilization sees one weapon here: every probe is one.',
     f'<figure><figcaption><strong>1 · Strike Lantern?</strong><span>The one weapon we have, and two we haven’t built. Nothing is chosen for you.</span></figcaption>{STRIKE_PICK}</figure>'
     '<span class="pinch">who would know ›</span>'
     f'<figure><figcaption><strong>2 · Who would know</strong><span>Their visitor sees it go and tells Lantern a century before it lands. The path names us.</span></figcaption>{STRIKE_WHO}</figure>'),
    ('danger-orders', 'If struck', 'Stakes · standing orders for danger', 'Orders may authorize anything, including a strike back. This one does the opposite: it saves what it can and never strikes back. Because it launches nothing, no spoof can turn it on an innocent world. The same editor would show the risk of an order that fires.',
     f'<figure><figcaption><strong>1 · If we are struck</strong><span>What you want, the mind’s exact version, what it can’t be tricked into, and a test on your last absence.</span></figcaption>{DANGER_ORDER}</figure>'),
    ('budgets', 'Budgets', 'Projects · the real units behind each share', 'Screens show shares of the year. A tap on a budget shows what the share is made of: terawatts for energy, operations a second for compute. The drilldown also shows the ceiling: past about 1,000 TW on Veyra, waste heat alone would warm the planet.',
     f'<figure><figcaption><strong>1 · Energy</strong><span>From the top bar. Where this year’s terawatts come from, where they go, and the ceiling.</span></figcaption>{BUDGET_ENERGY}</figure>'
     '<span class="pinch">or compute ›</span>'
     f'<figure><figcaption><strong>2 · Compute</strong><span>Operations a second, and why a cold annex and a sleeping vault matter.</span></figcaption>{BUDGET_COMPUTE}</figure>'),
    ('settings', 'Settings', 'Mind · settings', f'Year {Y_SET:.0f}. The clock never stops, so the setting that matters most is what may reach you while it runs: 8 hours of sleep is 96 Years. Each kind of notice says what it would have sent during your last absence. Quiet hours hold everything except someone new, then send one notice in the morning. Theme and the tour replay live here too.',
     f'<figure><figcaption><strong>1 · Settings</strong><span>What wakes you, tested on your last absence. Quiet hours, theme, and the tour.</span></figcaption>{SETTINGS}</figure>'
     '<span class="pinch">that night ›</span>'
     f'<figure><figcaption><strong>2 · The morning after</strong><span>Only someone new woke you. Everything else waited for one notice at 7:00.</span></figcaption>{LOCK_MORNING}</figure>'
     '<span class="pinch">replay the tour ›</span>'
     f'<figure><figcaption><strong>3 · Replaying the tour</strong><span>The same six stops, on your map as it is now. The silence stop tells what has changed since Year 0.</span></figcaption>{REPLAY_TOUR}</figure>'
     '<span class="pinch">theme: dark ›</span>'
     f'<figure><figcaption><strong>4 · Dark</strong><span>The same screen after choosing Dark. Drawings retint with the theme.</span></figcaption>{SETTINGS_DARK}</figure>'),
    ('silent', 'Silent', 'Contact · the silent one', f'Frost knocked once, in Year {Y_FK}, and never again. We answered, knocked with our charter, and broadcast; every window where a reply could have come passed empty. The screens have to show an absence: what didn’t arrive and when it could have, how long the silence has run, and what could explain it. By Year {Y_FNOW:.0f} it is {Y_FNOW - Y_FK:.0f} Years long.',
     f'<figure><figcaption><strong>1 · Nothing came</strong><span>Year {Y_F1R + .1:.1f}. The earliest reply to our answer was due, and didn’t arrive.</span></figcaption>{SILENT_FIRST}</figure>'
     f'<span class="pinch">Year {Y_FNOW:.0f} ›</span>'
     f'<figure><figcaption><strong>2 · The silence</strong><span>The conversation, as it looks after {Y_FNOW - Y_FK:.0f} Years. Each empty circle is a window a reply could have filled.</span></figcaption>{SILENT_LONG}</figure>'
     '<span class="pinch">why ›</span>'
     f'<figure><figcaption><strong>3 · Why the silence?</strong><span>Every reason that fits, with odds, and what we could do. Nothing is chosen for you.</span></figcaption>{SILENT_WHY}</figure>'
     '<span class="pinch">Frost ›</span>'
     f'<figure><figcaption><strong>4 · Frost, as we know it</strong><span>The same drawing as Beacon’s and Ember’s. Its ring holds no founding line, only the silence.</span></figcaption>{SILENT_KNOWN}</figure>'),
    ('crossed', 'Crossed', 'Contact · crossed knocks', f'Year {Y_EKA}. Right after the sentinel’s report, we knock at Ember from home. A tenth of a Year later, Ember’s knock arrives: sent in Year {Y_EK}, the moment they found our sentinel’s beam. The two passed each other {X_AU:,} AU out. Neither is an answer, and each side has to work that out from timing alone.',
     f'<figure><figcaption><strong>1 · Ember is knocking</strong><span>The arrival, as a moment. Their flashes come in as ours goes out.</span></figcaption>{CROSS_LANDS}</figure>'
     '<span class="pinch">see both knocks ›</span>'
     f'<figure><figcaption><strong>2 · Two knocks, crossing</strong><span>Years against distance, zoomed in so light lines slope. The timing shows ours can’t be an answer, to us and to them.</span></figcaption>{CROSS_TIME}</figure>'
     '<span class="pinch">decide ›</span>'
     f'<figure><figcaption><strong>3 · What now</strong><span>An echo reads as an answer; ours alone doesn’t. Any, or none. Nothing is chosen for you.</span></figcaption>{CROSS_NEXT}</figure>'
     '<span class="pinch">echo it ›</span>'
     f'<figure><figcaption><strong>4 · The conversation</strong><span>Ember’s exchange so far, as it looks after echoing theirs: two of ours in flight.</span></figcaption>{CROSS_GULF}</figure>'),
    ('visitor', 'Visitor', 'Contact · a visitor brakes into our system', f'Year {Y_V1:.0f}. A craft flares 5,000 AU out, braking toward our belt. It coasted in unseen; braking is bright. No one announced it, unlike Beacon’s emissary. Its path, traced back, points toward Lantern, give or take 8°. Once it stops it reports home by narrow beam, and since we stand beside the transmitter, we see exactly where the beam points. The same physics told Ember’s builders where we are.',
     f'<figure><figcaption><strong>1 · Something is braking</strong><span>The arrival, as a moment. Its exhaust flares ahead of it, toward our belt.</span></figcaption>{VISIT_LANDS}</figure>'
     '<span class="pinch">see what we know ›</span>'
     f'<figure><figcaption><strong>2 · The signal</strong><span>Its speed, measured and falling. What it is, when it stops, and what we can’t tell.</span></figcaption>{VISIT_SIGNAL}</figure>'
     '<span class="pinch">its path ›</span>'
     f'<figure><figcaption><strong>3 · Where it came from</strong><span>Its path traced back, as wide as the uncertainty. Each candidate star, and when it would have left.</span></figcaption>{VISIT_MAP}</figure>'
     '<span class="pinch">what now ›</span>'
     f'<figure><figcaption><strong>4 · What now</strong><span>Every next step and what it reveals. Any, or none. Nothing is chosen for you.</span></figcaption>{VISIT_NEXT}</figure>'
     f'<span class="pinch">Year {Y_VS:.0f} ›</span>'
     f'<figure><figcaption><strong>5 · It has stopped</strong><span>Its report home is a narrow beam. Beside it, we see where it points.</span></figcaption>{VISIT_STOPPED}</figure>'
     '<span class="pinch">what we know now ›</span>'
     f'<figure><figcaption><strong>6 · The visitor, as we know it</strong><span>Its home, its launch, and what Lantern will learn from it. The Lantern clue moves.</span></figcaption>{VISIT_KNOWN}</figure>'),
    ('swept', 'Overheard', 'Contact · a broadcast sweeps past', f'Year {Y_SW:.0f}. Pearl, {d_p:.1f} ly away, is broadcasting: radio, the same strength every way, meant for no one in particular. It doesn’t know we exist, and nobody chose us. Our neighbors heard it too, some first. It is the one contact that begins with us knowing more than the sender. Answers to Pearl go by narrow beam, so we can’t overhear them, but Pearl’s broadcast can change when someone answers.',
     f'<figure><figcaption><strong>1 · Pearl is speaking</strong><span>The arrival, as a moment. The front of its broadcast has passed Beacon and Frost, and now us.</span></figcaption>{SWEEP_LANDS}</figure>'
     '<span class="pinch">listen ›</span>'
     f'<figure><figcaption><strong>2 · The signal</strong><span>One cycle of it, drawn. What was measured, and why it isn’t meant for us.</span></figcaption>{SWEEP_SIGNAL}</figure>'
     '<span class="pinch">what it says ›</span>'
     f'<figure><figcaption><strong>3 · What it says</strong><span>Their voice first, then the parts. A broadcast has no reader in mind.</span></figcaption>{SWEEP_READ}</figure>'
     '<span class="pinch">who else heard it ›</span>'
     f'<figure><figcaption><strong>4 · Who else heard it</strong><span>Lines from Pearl: solid to worlds its broadcast has reached, dashed to those still waiting.</span></figcaption>{SWEEP_MAP}</figure>'
     '<span class="pinch">decide ›</span>'
     f'<figure><figcaption><strong>5 · Answer Pearl?</strong><span>Every next step, and what it reveals. Staying silent costs nothing they can see. Any, or none.</span></figcaption>{SWEEP_NEXT}</figure>'
     f'<span class="pinch">Year {Y_SWC:.0f}, still listening ›</span>'
     f'<figure><figcaption><strong>6 · It changes</strong><span>Pearl says it has been answered. We can’t hear the answer, but the timing says who could have sent it.</span></figcaption>{SWEEP_CHANGED}</figure>'),
    ('choose', 'Choosing', 'Before Year 0 · choosing a civilization', 'Three candidates from the generator, each a real star with an invented world and people, and the mind they wake as. All three start equal: the same kit, stocks and budgets. They differ in character and place. The player looks closer at one, names it, and accepts its founding line. Then it wakes.',
     f'<figure><figcaption><strong>1 · Three candidates</strong><span>Star, world, people, founding line and character, side by side. None is selected.</span></figcaption>{CHOOSE}</figure>'
     '<span class="pinch">tap Veyra ›</span>'
     f'<figure><figcaption><strong>2 · Up close</strong><span>What is real and what is invented, why surveys allow it, and the mind it wakes as.</span></figcaption>{CIV_FULL}</figure>'
     '<span class="pinch">choose ›</span>'
     f'<figure><figcaption><strong>3 · Name it, and accept its charter</strong><span>The name is its people’s own, and can change. The founding line is how the mind will reason when asked.</span></figcaption>{CIV_NAME}</figure>'),
    ('orders', 'Standing orders', 'Mind · standing orders, near and far', f'Year {Y_SO}, just back from 108 Years away. Standing orders are how the mind acts without you. Each is written the way a message is: you say what you want, the mind shows exactly what it will do, and tries it on your last absence. Orders for a far mind cross at light speed, so they land late and are followed alone. Opens from the Mind tab, and from Reach for far places.',
     f'<figure><figcaption><strong>1 · While you are away</strong><span>Every order, and what each did last time. Far ones are marked with their light-time.</span></figcaption>{ORDERS}</figure>'
     '<span class="pinch">add an order ›</span>'
     f'<figure><figcaption><strong>2 · A new order</strong><span>What you want, the mind’s version, what it overrides, and a test on your last absence.</span></figcaption>{ORDER_NEW}</figure>'
     '<span class="pinch">or, for the sentinel ›</span>'
     f'<figure><figcaption><strong>3 · An order for a far mind</strong><span>It crosses to Ember at light speed. Until it lands, the sentinel follows what it has.</span></figcaption>{ORDER_FAR}</figure>'
     '<span class="pinch">sent ›</span>'
     f'<figure><figcaption><strong>4 · In flight</strong><span>The new order at home, and the sentinel’s order crossing to Ember.</span></figcaption>{ORDERS_AFTER}</figure>'),
    ('meeting', 'Meeting', 'Contact · meeting Beacon', f'Beacon’s second letter asked to meet in Year 500. Its emissary, one of their minds aboard a torch craft launched in Year {Y_EM_L:.0f}, was already coming. Answering, the player sees every way to meet, each with what it needs: meet the emissary here, host one of their minds, send one of ours, or meet halfway. Here we meet the emissary beside our ice world. Light crosses between us in about an hour: the first conversation with no Years between the lines.',
     f'<figure><figcaption><strong>1 · The invitation</strong><span>Held for you while you were away. Their voice, then what it carried: a proposal, a fact, an offer.</span></figcaption>{MEET_INVITE}</figure>'
     '<span class="pinch">see its path ›</span>'
     f'<figure><figcaption><strong>2 · Its path, in time</strong><span>Years against distance. Light lines are nearly flat; the emissary’s is steep. Where our answer crosses it, it hears us.</span></figcaption>{MEET_PATH}</figure>'
     '<span class="pinch">answer ›</span>'
     f'<figure><figcaption><strong>3 · Ways to meet</strong><span>Year 450. Each way, what it needs, and when it could happen. The emissary comes either way. Any, or none.</span></figcaption>{MEET_HOW}</figure>'
     '<span class="pinch">meet it here ›</span>'
     f'<figure><figcaption><strong>4 · Where it stops</strong><span>Three places, what it would see from each, and how long each answer takes. Nothing is chosen for you.</span></figcaption>{MEET_WHERE}</figure>'
     '<span class="pinch">Year 500 ›</span>'
     f'<figure><figcaption><strong>5 · It has stopped</strong><span>Its braking trail fades beside the ice world.</span></figcaption>{MEET_ARRIVES}</figure>'
     '<span class="pinch">meet it ›</span>'
     f'<figure><figcaption><strong>6 · Talking live</strong><span>Answers in under a tenth of a second, while the clock runs. It speaks for Beacon as of its last word from home.</span></figcaption>{MEET_LIVE}</figure>'
     '<span class="pinch">the proposal ›</span>'
     f'<figure><figcaption><strong>7 · A pact?</strong><span>What it offers, what each answer would share, and when Beacon hears. Nothing is chosen for you.</span></figcaption>{MEET_PACT}</figure>'),
    ('broadcast', 'Broadcast', 'Reach · broadcasting', f'Year {Y_BC:.0f}. The broadcast beacon is built. A knock goes to one star; a broadcast goes to every star at once, and never stops. It carries its own address: anyone who hears it learns where we are. It is composed like any message, but no reader is known, so the mind can’t shape it for them. Then the permanent choice, the send, and the map as the shell spreads.',
     f'<figure><figcaption><strong>1 · What will travel</strong><span>Your words, the mind’s version, and how anyone will read it.</span></figcaption>{BC_COMPOSE}</figure>'
     '<span class="pinch">who will hear it ›</span>'
     f'<figure><figcaption><strong>2 · Everyone, for good</strong><span>Who hears it and when, soonest first, and who already knows where we are.</span></figcaption>{BC_WHO}</figure>'
     '<span class="pinch">hold to broadcast ›</span>'
     f'<figure><figcaption><strong>3 · Sent</strong><span>It leaves in every direction.</span></figcaption>{BC_SENT}</figure>'
     '<span class="pinch">Year 531 ›</span>'
     f'<figure><figcaption><strong>4 · On the map</strong><span>The shell at 11 light-years, spreading at light speed. Five stars we know have heard it.</span></figcaption>{BC_MAP}</figure>'),
]

# One page per area of the game, in the checklist's order. Stakes gets a page once it has mocks of its own.
AREAS = [  # (page, area as named in CHECKLIST, one-line summary, section ids)
    ('onboarding', 'Onboarding', 'Choosing a civilization, waking on it, what you inherit, and the guided tour.', ['choose', 'waking', 'tour']),
    ('home', 'Home', 'The map at five zoom levels, star cards and clues, projects in place.', ['zoom', 'local-group', 'clues', 'map']),
    ('projects', 'Projects', 'Starting, running, finishing, queueing and cancelling projects, and the real units behind each share.', ['projects', 'picker', 'upnext', 'budgets']),
    ('report', 'Report', 'What comes back while you are away, and catching up after a long absence.', ['result', 'absence']),
    ('reach', 'Reach', 'Beyond Veyra: sending a probe, following it, what it finds, the kinds of probe, and broadcasting.', ['probe', 'flyby', 'probe-types', 'sentinel', 'broadcast']),
    ('mind', 'Mind', 'Standing orders near and far, and settings: what wakes you, quiet hours, theme, the tour.', ['orders', 'settings']),
    ('stakes', 'Stakes', 'What keeps us safe, what a strike would cost and reveal, and orders for danger. Peace is a way to play.', ['readiness', 'strike', 'danger-orders']),
    ('contact', 'Contact', 'First contact: the knock, the reply, checking what they told us, and the builders meeting our sentinel, crossed knocks with Ember, a visitor from Lantern, overhearing Pearl, meeting Beacon’s emissary, and Frost’s silence.', ['knock', 'reply', 'check', 'visitor', 'swept', 'noticed', 'crossed', 'meeting', 'silent']),
]
assert sorted(sid for *_, ids in AREAS for sid in ids) == sorted(sid for sid, *_ in SECTIONS), 'every section belongs to exactly one page'
def nav_pages(current):
    here_is = lambda f: f' aria-current="page"' if f == current else ''
    return (''.join(f'<a href="{f}.html"{here_is(f + ".html")}>{area}</a>' for f, area, *_ in AREAS) + '<span class="divider" aria-hidden="true"></span>'
            + ''.join(f'<a class="minor" href="{f}"{here_is(f)}>{label}</a>' for f, label in (('catalog.html', 'Catalog'), ('explorations.html', 'Explorations'), ('type.html', 'Type'))))

# The game-facing sections again, set in holos-game's faces (client/src/style.css):
# Cinzel for titling caps; readouts stay in IBM Plex Mono. The text face is picked
# from the nav, so candidates can be compared on the real mocks.
TYPE_IDS = ('projects', 'picker', 'upnext', 'map', 'result')
TEXT_FACES = [  # (name, Google Fonts family spec, CSS stack)
    ('Spectral', 'Spectral:ital,wght@0,400;0,500;0,600;1,400', "'Spectral',Georgia,serif"),
    ('Newsreader', 'Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400', "'Newsreader',Georgia,serif"),
    ('Alegreya Sans', 'Alegreya+Sans:ital,wght@0,400;0,500;0,700;1,400', "'Alegreya Sans',sans-serif"),
    ('Instrument Sans', 'Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400', "'Instrument Sans',sans-serif"),
    ('IBM Plex Sans', 'IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400', "'IBM Plex Sans',sans-serif"),
    ('Source Sans 3', 'Source+Sans+3:ital,wght@0,400;0,500;0,600;1,400', "'Source Sans 3',sans-serif"),
]
MORE_FACES = ['Google Sans Flex', 'Saira', 'Saira Semi Condensed', 'Roboto Condensed', 'Rethink Sans', 'Raleway', 'Urbanist', 'Nunito Sans', 'Dosis',
              'Exo 2', 'Jost', 'Space Grotesk', 'Monda', 'Fredoka', 'League Spartan', 'Red Rose', 'Tilt Neon', 'Encode Sans',
              'Baloo Thambi 2', 'Ysabeau Office', 'SUSE', 'Geom', 'Epunda Slab', 'Mona Sans']
# Faces with a width axis load it, so they can be set narrower.
WIDE_SPECS = {'Mona Sans': 'Mona+Sans:ital,wdth,wght@0,75..100,400..600;1,75..100,400..600', 'Google Sans Flex': 'Google+Sans+Flex:wdth,wght@75..100,400..600'}
MORE_FACES = [(n, WIDE_SPECS.get(n, n.replace(' ', '+') + ':ital,wght@0,400;0,500;0,600;1,400'), f"'{n}',sans-serif") for n in MORE_FACES]
type_sections = [s for s in SECTIONS if s[0] in TYPE_IDS]
type_links = ''.join(f'<a href="#{sid}" aria-current="false">{label}</a>' for sid, label, *_ in type_sections) + '<span class="divider" aria-hidden="true"></span><a class="minor" href="explorations.html#text-face">‹ Explorations</a>'
type_body = ''.join(f'<section id="{sid}"><h2>{title}</h2><p>{intro}</p><main>{content}</main></section>' for sid, _, title, intro, content in type_sections)
type_css = lambda: f"""<style>
:root{{--text:{stack[TEXT_FACE]}}}
section>h2,nav.top strong,.name{{font-family:'Cinzel',Georgia,serif;letter-spacing:.08em;font-weight:600}}
figcaption strong{{font-family:'Cinzel',Georgia,serif;letter-spacing:.05em;font-weight:600}}
/* The HUD is a fixed 104px; taller faces would push the matter readout out of it. */
.hud{{line-height:1.15}}
.face{{flex-shrink:0;height:36px;padding:0 12px;border:1px solid var(--ink);border-radius:18px;background:none;color:var(--ink);font:13px var(--text)}}
</style>"""
def typeset(title, links, body, current=None):
    return (page(title, links, body, current).replace('</head>', tour_css + '\n' + type_css() + '\n</head>')
            .replace('family=IBM+Plex+Mono:wght@400;500&amp;family=IBM+Plex+Sans:wght@400;500;600',
                     'family=Cinzel:wght@400;600;700&amp;family=IBM+Plex+Mono:wght@400;500&amp;' + '&amp;'.join(f'family={spec}' for _, spec, _ in TEXT_FACES + MORE_FACES))
            .replace("'IBM Plex Sans',sans-serif", 'var(--text)'))
# Per-face fixes, measured against IBM Plex Sans, which the mocks were drawn in (x-height .516, lines 1.30 apart).
# Saira Semi Condensed sets lines 1.57 apart and reads thin (x-height .510); Encode Sans sets them 1.25 apart
# under a taller x-height (.540), so it looks cramped. Past 1.32 it overflows the fixed-height phones.
# SUSE has a short x-height (.481) and lines 1.26 apart; it is matched to Plex so the phones fit as drawn.
FACE_FIXES = {'Saira Semi Condensed': 'line-height:1.35;font-size-adjust:.555', 'Encode Sans': 'line-height:1.32',
              'SUSE': 'line-height:1.3;font-size-adjust:.516'}
# Narrower settings of a face, shown in the compare pages: (base face, extra CSS). SUSE has no width axis,
# so it is tracked in instead; Mona Sans (x-height .525) and Google Sans Flex (.510) are set at 90% width.
VARIANTS = {'SUSE, tracked −1.5%': ('SUSE', 'letter-spacing:-.015em'),
            'Mona Sans, 90% width': ('Mona Sans', 'line-height:1.3;font-size-adjust:.516;font-stretch:90%'),
            'Google Sans Flex, 90% width': ('Google Sans Flex', 'line-height:1.3;font-size-adjust:.516;font-stretch:90%')}
# Side-by-side pages, one per pair of text faces.
# The face the mocks are set in, chosen in the Sep 28 study (explorations.html).
TEXT_FACE = 'SUSE, tracked −1.5%'
PAIRS = [('Saira Semi Condensed', 'Encode Sans'), ('Saira Semi Condensed', 'SUSE'),
         ('SUSE', 'SUSE, tracked −1.5%', 'Mona Sans, 90% width', 'Google Sans Flex, 90% width')]
slug = lambda name: re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
pair_file = lambda pair: 'compare-' + '-vs-'.join(dict.fromkeys(slug(n.split(',')[0]) for n in pair)) + '.html'
compare_links = ''.join(f'<a class="minor" href="{pair_file(pr)}">{" vs ".join(pr)} ↗</a>' for pr in PAIRS)
# font-size-adjust inherits and would also enlarge the mono readouts and Cinzel titles; those keep their size.
def own_faces(html):
    return [sel.strip() for sel, decl in re.findall(r'([^{}]+)\{([^{}]*)\}', ''.join(re.findall(r'<style>(.*?)</style>', html, re.S)))
            if 'IBM Plex Mono' in decl or 'Cinzel' in decl] + ['svg', '[style*="Plex Mono"]']
def face_fix(scope, name, own_face=None):
    base, extra = VARIANTS.get(name, (name, ''))
    fix = ';'.join(f for f in (FACE_FIXES.get(base, ''), extra) if f)
    if not fix: return ''
    # A variant's own settings replace the base face's; later declarations win.
    reset = ';'.join(f'{prop}:{"none" if prop == "font-size-adjust" else "normal"}' for prop in
                     ('font-size-adjust', 'letter-spacing', 'font-stretch') if prop in fix)
    # Layered, so any spacing the page sets on these elements still wins over the reset.
    return f'{scope}{{{fix}}}@layer fix{{{scope} :is({",".join(own_face or own_faces(typeset("", "", "")))}){{{reset}}}}}'
stack = dict((n, st) for n, _, st in TEXT_FACES + MORE_FACES)
stack.update((n, stack[base]) for n, (base, _) in VARIANTS.items())
spec = dict((n, sp) for n, sp, _ in TEXT_FACES + MORE_FACES)
def set_text(html, name):
    """Sets a page drawn in IBM Plex Sans in another text face, with that face's fixes."""
    base = VARIANTS.get(name, (name,))[0]
    return (html.replace('family=IBM+Plex+Sans:wght@400;500;600', f'family={spec[base]}')
            .replace("'IBM Plex Sans',sans-serif", stack[name])
            .replace('</head>', f'<style>{face_fix("body", name, own_faces(html))}</style>\n</head>'))
options = lambda names: ''.join(f'<option value="{n}" data-stack="{stack[n]}">{n}</option>' for n in names)
face_options = (f'<optgroup label="Chosen">{options([TEXT_FACE])}</optgroup><optgroup label="Suggested">{options(n for n, *_ in TEXT_FACES)}</optgroup>'
                f'<optgroup label="More">{options(n for n, *_ in MORE_FACES)}</optgroup><optgroup label="Narrower">{options(n for n in VARIANTS if n != TEXT_FACE)}</optgroup>')
face_picker = f'<select class="face" id="face" aria-label="Text face">{face_options}</select>'
fix_css = '<style>' + ''.join(face_fix(f':root[data-face="{name}"] body', name) for name in [*FACE_FIXES, *VARIANTS]) + '</style>'
# Remembers the pick per viewer; the page still works when storage is blocked.
face_js = """<script>
const face=document.getElementById('face'),root=document.documentElement;
const pick=n=>{const o=[...face.options].find(o=>o.value===n);if(!o)return;root.style.setProperty('--text',o.dataset.stack);face.value=n;root.dataset.face=n;try{localStorage.setItem('holos-text-face',n)}catch(e){}};
face.value=root.dataset.face;
try{const saved=localStorage.getItem('holos-text-face');if(saved)pick(saved)}catch(e){}
face.addEventListener('change',()=>pick(face.value));
</script>"""
type_page = (typeset('Holos · game type', type_links + compare_links, type_body, 'type.html').replace('<html lang="en">', f'<html lang="en" data-face="{TEXT_FACE}">', 1)
             .replace('</head>', fix_css + '\n</head>')
             .replace('<button class="theme" id="theme"', face_picker + '<button class="theme" id="theme"', 1)
             .replace('</body>', face_js + '\n</body>'))
(here / 'type.html').write_text(type_page)
print(f'type.html · {len(type_page) / 1024:.0f} KB')

# Two text faces side by side, each figure paired with its twin, both with their fixes.
for PAIR in PAIRS:
    pair_css = ('<style>:root{--text:\'IBM Plex Sans\',sans-serif}' + ''.join(f'.f{i}{{--text:{stack[n]};font-family:var(--text)}}' + face_fix(f'.f{i}', n) for i, n in enumerate(PAIR))
                + '.pairs{display:flex;flex-direction:column;gap:40px}.pair{display:flex;gap:32px;align-items:flex-start;flex-wrap:wrap}'
                + ".who{font:11px 'IBM Plex Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--page-ink2);margin-bottom:8px}</style>")
    pair_body = ''.join(f'<section id="{sid}"><h2>{title}</h2><p>{intro}</p><div class="pairs">'
                        + ''.join('<div class="pair">' + ''.join(f'<div class="f{i}"><div class="who">{n}</div>{fig}</div>' for i, n in enumerate(PAIR)) + '</div>'
                                  for fig in re.findall(r'<figure>.*?</figure>', content, re.S))
                        + '</div></section>' for sid, _, title, intro, content in type_sections)
    pair_links = type_links + '<a class="minor" href="type.html">Face picker ↗</a>'
    pair_page = typeset('Holos · ' + ' vs '.join(PAIR), pair_links, pair_body).replace('</head>', pair_css + '\n</head>')
    (here / pair_file(PAIR)).write_text(pair_page)
    print(f'{pair_file(PAIR)} · {len(pair_page) / 1024:.0f} KB')

by_id = {sid: sec for sid, *sec in SECTIONS}
section_html = lambda sid: (lambda _, title, intro, content: f'<section id="{sid}"><h2>{title}</h2><p>{intro}</p><main>{content}</main></section>')(*by_id[sid])
checklist_note = lambda scope: f'<section id="checklist" class="appendix"><h2>Checklist</h2><p>{scope} Also written to CHECKLIST.md.</p>'
area_pages = []
for f, area, summary, ids in AREAS:
    links = ''.join(f'<a href="#{sid}" aria-current="false">{by_id[sid][0]}</a>' for sid in ids) + '<span class="divider" aria-hidden="true"></span><a class="minor" href="#checklist" aria-current="false">Checklist</a>'
    body = ''.join(section_html(sid) for sid in ids) + checklist_note(f'What {area} needs mocked, and where each stands. The full list is on the <a href="index.html#checklist">overview</a>.') + checklist_html([area]) + '</section>'
    html = set_text(page(f'Holos · {area}', links, body, f + '.html').replace('</head>', tour_css + '\n</head>'), TEXT_FACE)
    (here / f'{f}.html').write_text(html)
    area_pages.append(here / f'{f}.html')
    print(f'{f}.html · {len(html) / 1024:.0f} KB')

# The overview: a card per page, then the whole checklist.
tally = {area: (sum(st == 'done' for _, st in items), len(items)) for area, items in CHECKLIST}
screens = lambda ids: sum(by_id[sid][3].count('<figure') for sid in ids)
cards = ''.join(f'<a class="acard" href="{f}.html"><strong>{area}</strong><span>{summary}</span>'
                f'<span class="mono">{screens(ids)} screens · {tally[area][0]} of {tally[area][1]} mocked</span>'
                f'<span class="secs">{" · ".join(by_id[sid][0] for sid in ids)}</span></a>' for f, area, summary, ids in AREAS)
cards += ''.join(f'<div class="acard later"><strong>{area}</strong><span>No page yet.</span><span class="mono">{tally[area][0]} of {tally[area][1]} mocked</span></div>'
                 for area, _ in CHECKLIST if area not in {a for _, a, *_ in AREAS})
hub_css = """<style>.areas{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}
.acard{display:flex;flex-direction:column;gap:6px;padding:16px;background:var(--paper);border:1px solid var(--frame);border-radius:10px;color:var(--ink);text-decoration:none;font-size:13px}
a.acard:hover{border-color:var(--ink)}.acard strong{font-size:18px;font-weight:600}.acard .mono{font-size:11px;color:var(--muted)}.acard .secs{color:var(--page-ink2)}
.acard.later{background:none;color:var(--page-ink2)}.appendix a{color:var(--ink)}</style>"""
links = '<a href="#areas" aria-current="false">Areas</a><a href="#checklist" aria-current="false">Checklist</a>'
body = (f'<section id="areas"><h2>Holos · mocks</h2><p>{sum(screens(ids) for *_, ids in AREAS)} screens across {len(AREAS)} pages, one per area of the game.</p><div class="areas">{cards}</div></section>'
        + checklist_note('Everything the game needs mocked, and where each stands.') + checklist_html() + '</section>')
site = set_text(page('Holos · mocks', links, body, 'index.html').replace('</head>', tour_css + '\n' + hub_css + '\n</head>'), TEXT_FACE)
(here / 'index.html').write_text(site)
print(f'index.html · {len(site) / 1024:.0f} KB')

# Explorations: working-session mocks, newest first. Not current design.
EXPLORATIONS = [
    ('text-face', 'Text face', 'Sep 28 · Text face',
     f'Which face the mocks are set in. Tried against the holos-game faces (Cinzel titles, IBM Plex Mono readouts), each fitted to the '
     f'size and spacing the mocks were drawn for. Chosen: {TEXT_FACE}, now used across the mocks. Cinzel titles were only tried here.',
     '<ul class="study"><li><a href="type.html">Face picker ↗</a><span>The game-facing mocks, in any of ' + str(len(TEXT_FACES) + len(MORE_FACES) + len(VARIANTS)) + ' faces.</span></li>'
     + ''.join(f'<li><a href="{pair_file(pr)}">{" vs ".join(pr)} ↗</a><span>Side by side, each with its fixes.</span></li>' for pr in PAIRS) + '</ul>'),
    ('home-layouts', 'Home layouts', 'Sep 26 · Home layouts, low fidelity', 'Three ways to organize the first screen. B, world first, was chosen and carried forward.', lofi),
]
ex_links = ''.join(f'<a href="#{sid}" aria-current="false">{label}</a>' for sid, label, *_ in EXPLORATIONS) + ''
ex_body = ''.join(f'<section id="{sid}"><h2>{title}</h2><p>{intro}</p><main>{content}</main></section>' for sid, _, title, intro, content in EXPLORATIONS)
ex_css = "<style>.study{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}.study li{display:flex;gap:12px;align-items:baseline;flex-wrap:wrap}.study a{color:var(--ink);font-weight:500}.study span{color:var(--page-ink2);font-size:13px}</style>"
ex_page = set_text(page('Holos · explorations', ex_links, ex_body, 'explorations.html').replace('</head>', tour_css + '\n' + ex_css + '\n</head>'), TEXT_FACE)
(here / 'explorations.html').write_text(ex_page)
print(f'explorations.html · {len(ex_page) / 1024:.0f} KB')

cat_sections = catalog.sections()
cat_links = ''.join(f'<a href="#{sid}" aria-current="false">{label}</a>' for sid, label, *_ in cat_sections) + ''
cat_intro = (f'<section id="about" class="intro"><h2>Project catalog</h2><p>{len(catalog.PROJECTS)} projects and {len(catalog.DISCOVERIES)} discovery projects. '
             'Each leads with its why, the benefit to the player, then what it is and the science behind it. Level says how far past today it reaches; '
             'visibility says how much easier it makes you to find. Also written to HOLOS_PROJECTS.md.</p></section>')
cat_body = cat_intro + ''.join(f'<section id="{sid}"><h2>{label}</h2><p>{blurb}</p>{content}</section>' for sid, label, blurb, content in cat_sections)
cat_page = set_text(page('Holos · project catalog', cat_links, cat_body, 'catalog.html').replace('</head>', tour_css + '\n</head>'), TEXT_FACE)
(here / 'catalog.html').write_text(cat_page)
print(f'catalog.html · {len(cat_page) / 1024:.0f} KB')

# Plain-text copy for reading, diffing, and LLMs.
import extract
extract.combine(area_pages, here / 'mocks.md', checklist_from=here / 'index.html')
