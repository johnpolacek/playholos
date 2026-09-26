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
    def place(self, x, y, s, size=10, fill=MUTED, weight=None, spots=((8, 4), (-8, 4), (0, -9), (0, 16))):
        w, h = len(s) * size * .62, size * 1.25
        for dx, dy in spots:
            anchor = 'end' if dx < 0 else 'middle' if dx == 0 else 'start'
            left = x + dx - (w if anchor == 'end' else w / 2 if anchor == 'middle' else 0)
            box = (left, y + dy - h * .8, left + w, y + dy + h * .2)
            if box[0] < 4 or box[2] > 386 or box[1] < 40 or box[3] > 356: continue
            if any(box[0] < b[2] and box[2] > b[0] and box[1] < b[3] and box[3] > b[1] for b in self.boxes): continue
            self.boxes.append(box)
            return text(x + dx, y + dy, s, size, fill, anchor, weight)
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

# ---------- 1 · World ----------
def world():
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
    rx, ry = cx + 176 * math.cos(math.radians(38)), cy + 8 + 36 * math.sin(math.radians(38))
    s.append(f'<rect x="{fmt(rx - 4)}" y="{fmt(ry - 4)}" width="8" height="8" fill="{YOU}"></rect>')
    s.append(f'<line x1="{fmt(rx + 3)}" y1="{fmt(ry + 5)}" x2="370" y2="300" stroke="{YOU}" stroke-width=".8"></line>')
    s.append(text(376, 314, 'Deep-field receiver', 10, YOU, 'end'))
    s.append(text(376, 327, 'online in 00:37:42', 10, MUTED, 'end'))
    s.append(text(374, 28, 'light from Delta Pavonis ↗', 10, MUTED, 'end'))
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
    fx, fy = cx + 1.12 * k * math.cos(math.radians(2)), cy + 1.12 * k * tilt * math.sin(math.radians(2))
    s.append(f'<rect x="{fmt(fx - 3.5)}" y="{fmt(fy - 3.5)}" width="7" height="7" fill="none" stroke="{YOU}" stroke-width="1.3"></rect>')
    s.append(text(fx + 8, fy - 6, 'foundry site', 9, YOU))
    s.append(text(cx + 2.9 * k, cy - 2.9 * k * tilt - 8, 'belt', 9, MUTED, 'middle'))
    s.append(text(378, 300, '[ice world] 9 AU →', 10, MUTED, 'end'))
    s.append(text(378, 344, 'star real · planets invented', 9, MUTED, 'end'))
    return ''.join(s), '1 AU', k

# ---------- 3 · Neighbors (15 ly around home) ----------
NAMED = {'ε Indi': ('108870', True), 'Gl 783 A': ('99461', True), 'Gl 832': ('106440', False), 'β Hyi': ('2021', False),
         'Lacaille 8760': ('105090', False), 'γ Pav': ('105858', False), 'ζ Tuc': ('1599', False)}
def neighbors(time_demo=False):
    el = 58; cam, k, origin = camera(el, 205), 11, (195, 196)
    s = [stipple(3, 60)]; labels = Labels([(8, 8, 110, 40)])
    rings = []
    for ly, label in ((5, '00:25:00'), (10, '00:50:00'), (15, '01:15:00')):
        ry = ly * k * math.sin(math.radians(el))
        s.append(f'<ellipse cx="{origin[0]}" cy="{origin[1]}" rx="{ly * k}" ry="{ry:.1f}" fill="none" stroke="{INK}" stroke-width=".7" stroke-dasharray="3 4" opacity=".4"></ellipse>')
        rings.append((origin[0] - ly * k + 4, origin[1] + 3, label))
    stars = [p for p in CENSUS if 0.05 < math.dist(p[:3], HOME) <= 15]
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
    for name, (hip, lead) in sorted(NAMED.items(), key=lambda item: not item[1][1]):
        p = atlas(by_hip[hip]); x, y = project(p, HOME, cam, k, origin)
        d = math.dist(p, HOME)
        if lead:
            s.append(f'<circle cx="{fmt(x)}" cy="{fmt(y)}" r="7" fill="none" stroke="{OTHER}" stroke-width="1.5"></circle>')
            s.append(labels.place(x, y, f'{name} · {light_clock(d)}', 10, OTHER, 600, ((11, 4), (-11, 4), (0, -12), (0, 20))))
        else:
            s.append(labels.place(x, y, name, 9))
    if time_demo:
        ex_, ey_ = project(atlas(by_hip['108870']), HOME, cam, k, origin)
        s.append(f'<line x1="{origin[0]}" y1="{origin[1]}" x2="{fmt(ex_)}" y2="{fmt(ey_)}" stroke="{YOU}" stroke-width="1.6" stroke-dasharray="5 4"></line>')
        mx_, my_ = (origin[0] + ex_) / 2, (origin[1] + ey_) / 2
        s.append(labels.place(mx_, my_, 'message · 00:46:00', 10, YOU, 600, ((0, -10), (0, 18), (10, 4), (-10, 4))))
    for x, y, label in rings: s.append(labels.place(x, y, label, 9, MUTED, None, ((0, 0), (0, -8), (0, 10))))
    sol = project((0, 0, 0), HOME, cam, k, origin)
    dx, dy = sol[0] - origin[0], sol[1] - origin[1]; n = math.hypot(dx, dy)
    t = min((180 if dx > 0 else 180) / abs(dx or 1), (150 if dy > 0 else 150) / abs(dy or 1))
    ex, ey = origin[0] + dx * t, origin[1] + dy * t
    s.append(f'<line x1="{fmt(ex - dx / n * 18)}" y1="{fmt(ey - dy / n * 18)}" x2="{fmt(ex)}" y2="{fmt(ey)}" stroke="{OTHER}" stroke-width="1.4"></line>')
    s.append(labels.place(ex, ey, f'Sol · oxygen world · {light_clock(math.dist(HOME, (0, 0, 0)))}', 10, OTHER, 600, ((-6, -8), (6, -8), (-6, 16), (6, 16), (0, -12), (0, 20))))
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
    s.append(text(origin[0] + (10 if hx < origin[0] else -10), origin[1] + 4, 'Sol', 11, OTHER, 'start' if hx < origin[0] else 'end', 600))
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
    s.append(text(sx, sy + 35, 'The region · Sol and Veyra', 10, YOU, 'middle', 600))
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
    ('IN MOTION · 3', 'TIME LEFT', [row('Deep-field receiver', 'in orbit around Veyra', tstack('7.6 Years', '00:37:42', True), bar=70), row('Planet survey · 12 nearest stars', 'looking out from Veyra', tstack('14 Years', '01:09:15', True), bar=40), row('Orbital foundry', 'site chosen in Veyra’s orbit', tstack('30 Years', '02:29:48', True), bar=15), row('Leads · 3', 'Sol, ε Indi, Gl 783 A', '›', 'other')]),
    ('DELTA PAVONIS SYSTEM', 'INVENTED PLANETS', [row('Veyra · your world', '1.12 AU · habitable zone', '', 'you', marker=True), row('[Inner world]', '0.45 AU · unvisited', '›'), row('Belt · 2.6–3.2 AU', 'prospect: metals and ice', '›'), row('[Ice world]', '9 AU · beyond this view', '›')]),
    ('WITHIN 10 LY · 12 STARS', 'LIGHT-TIME', [row('New warm glow · ε Indi', 'dust, cold companions, or waste heat', light_clock(math.dist(atlas(by_hip['108870']), HOME)), 'other', marker=True), row('Uneven dimming · Gl 783 A', 'dust, bodies in orbit, or structures', light_clock(math.dist(atlas(by_hip['99461']), HOME)), 'other', marker=True), row('Planet survey · 12 nearest', 'finds what orbits them', tstack('14 Years', '01:09:15', True), bar=40)]),
    ('THE REGION · 100 LY AROUND SOL', 'WHERE V1 PLAYS', [row('1,212 stars inside 50 ly', 'where civilizations start', ''), row('Oxygen world · Sol', '19.9 ly · light takes ' + light_clock(math.dist(HOME, (0, 0, 0))), '›', 'other', marker=True), row('Technosignatures detected', 'none yet · receivers at baseline', '0')]),
    ('THE MILKY WAY', 'FOR SCALE', [row('The region', '27,000 ly from the galactic center', ''), row('Light across the region', '200 ly · light takes ' + light_clock(200), ''), row('Beyond 100 ly', 'visible, not reachable in v1', '')]),
    ('THE LOCAL GROUP', 'FOR PERSPECTIVE', [row('Andromeda', '2.5 million ly away', tstack('2.5 Million Years', light_clock(2.53e6))), row('Triangulum', '2.8 million ly away', tstack('2.8 Million Years', light_clock(2.80e6))), row('Large Magellanic Cloud', 'orbiting the Milky Way', tstack('162,000 Years', light_clock(1.617e5))), row('Nothing here is reachable', 'shown for perspective', '')]),
    ('ANDROMEDA · M31', '2.5 MLY · 24 YR', [row('A big spiral, tilted 77° to us', 'we see it nearly edge-on', ''), row('About 150,000 ly across', 'roughly 1.5× the Milky Way', ''), row('A ring of young stars', 'about 30,000 ly from its center', ''), row('Bright companions', 'M32 and M110', '')]),
    ('TRIANGULUM · M33', '2.8 MLY · 27 YR', [row('Loose, patchy spiral arms', 'almost no central bulge', ''), row('About 60,000 ly across', 'roughly 0.6× the Milky Way', ''), row('NGC 604', 'a star-forming cloud 1,500 ly wide', '')]),
    ('LARGE MAGELLANIC CLOUD', '162,000 LY · 1.5 YR', [row('Off-center bar, one main arm', 'a Magellanic spiral, likely disrupted', ''), row('About 32,000 ly across', 'orbiting the Milky Way', ''), row('Tarantula Nebula', 'the Local Group’s most active star nursery', '')]),
]

def frame(i, viz, scale_label, scale_px, rung=None, overlay=''):
    head, right, rows = PANELS[i]
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
<div class="res"><span>ENERGY<b><s style="width:62%"></s></b></span><span>MATTER<b><s style="width:78%"></s></b></span><span>COMPUTE<b><s style="width:45%"></s></b></span></div></div>
<div class="viz">{svg}{overlay}{ladder(rung)}</div>
<div class="panel"><div class="ph"><span>{head}</span><span class="mono">{right}</span></div>{''.join(rows)}</div>
{rail('Home')}
</div>'''

CAPTIONS = [('1 · World', 'Veyra, with what is in motion around it.'), ('2 · System', 'Delta Pavonis and its invented planets, to scale inside the belt.'),
            ('3 · Stars', 'Real stars within 15 ly of home. Rings are light-time.'), ('4 · Region', 'All 9,494 objects within 100 ly of Sol. Dim red dwarfs are specks.'),
            ('5 · Galaxy', 'Where the region sits. The spiral is illustrative. Icon, top right: the Local Group.'),
            ('Extra · Local Group', 'From the galaxy view’s icon. Real positions. Tap a galaxy to look closer.'),
            ('Close-up · Andromeda', 'A big spiral like ours, but larger, seen nearly edge-on.'),
            ('Close-up · Triangulum', 'A smaller spiral with loose, patchy arms and no real bulge.'),
            ('Close-up · Large Magellanic Cloud', 'A dwarf with an off-center bar, orbiting the Milky Way.')]
views = [world(), system(), neighbors(), region(), galaxy(), local_group(), andromeda(), triangulum(), lmc()]
back = '<button class="back">‹ Local Group</button>'
extras = [{}, {}, {}, {}, {'overlay': local_button(False)}, {'rung': 4, 'overlay': local_button(True)}] + [{'rung': 4, 'overlay': local_button(True) + back}] * 3
joins = ['pinch out ›'] * 4 + ['tap icon ›', 'tap Andromeda ›', 'or ›', 'or ›']
def figure_row(indices):
    return ''.join((f'<span class="pinch">{joins[i - 1]}</span>' if i != indices[0] else '') +
                   f'<figure><figcaption><strong>{CAPTIONS[i][0]}</strong><span>{CAPTIONS[i][1]}</span></figcaption>{frame(i, *views[i], **extras[i])}</figure>' for i in indices)
figures, lg_figures = figure_row(range(5)), figure_row(range(5, 9))
def page(title, links, body):
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
nav.top{{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:24px;margin:0 -24px;padding:12px 24px;background:var(--page);border-bottom:1px solid var(--frame)}}
nav.top strong{{font-size:15px;white-space:nowrap}}
.links{{display:flex;gap:4px;flex-grow:1;overflow-x:auto;scrollbar-width:none}}
.links a{{padding:8px 12px;border-radius:18px;font-size:13px;color:var(--page-ink2);text-decoration:none;white-space:nowrap}}
.links a:hover{{color:var(--ink)}}.links a[aria-current=true]{{background:var(--ink);color:var(--page)}}
section{{padding:32px 0 24px;scroll-margin-top:64px}}
section>h2{{font-size:22px;font-weight:600;margin:0 0 6px}}
section>p{{margin:0 0 28px;color:var(--page-ink2);font-size:14px;max-width:820px}}
section>main{{display:flex;flex-wrap:wrap;gap:18px;align-items:center}}
#explorations button{{text-align:center}}
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
.tstack{{display:inline-flex;flex-direction:column;align-items:flex-end;gap:1px;line-height:1.25;text-align:right}}.tstack .gy{{font-size:13px;color:var(--ink)}}.tstack .rtime{{font-size:11.5px;color:var(--muted)}}.tstack .rtime.live{{color:var(--you)}}
.name{{display:flex;align-items:center;gap:8px;font-size:20px;font-weight:600}}.name i{{width:10px;height:10px;border-radius:50%;background:var(--you)}}
.hud2{{display:flex;justify-content:space-between;font-size:12px;color:var(--muted)}}
.res{{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:4px}}
.res span{{display:flex;flex-direction:column;gap:3px;font-size:10px;color:var(--muted);letter-spacing:.08em}}
.res b{{height:4px;background:var(--track)}}.res s{{display:block;height:4px;background:var(--fill2);text-decoration:none}}
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
<nav class="top" aria-label="Mock sections"><strong>Holos · mocks</strong><div class="links">{links}</div><button class="theme" id="theme" aria-pressed="false">Dark mode</button></nav>
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
HUD = '''<div class="hud"><div class="hud1"><span class="name"><i></i>Veyra</span><span class="gy">Year 0.4</span></div>
<div class="hud2"><span>Delta Pavonis · 19.9 ly from Sol</span><span>1 Year = <span class="rtime">00:05:00</span></span></div>
<div class="res"><span>ENERGY<b><s style="width:62%"></s></b></span><span>MATTER<b><s style="width:78%"></s></b></span><span>COMPUTE<b><s style="width:45%"></s></b></span></div></div>'''

def tab_screen(tab, head, right, body, hud=None):
    return f'<div class="phone">{hud or HUD}<div class="tabpage"><div class="ph"><span>{head}</span><span class="mono">{right}</span></div>{body}</div>{rail(tab)}</div>'

def start_row(title, sub, cost, time):
    return f'<div class="row"><span class="rt"><span>{title}</span><span class="sub">{sub}</span><span class="sub mono">{cost}</span></span><span class="start">{time}<button>Start</button></span></div>'

PROJECTS = tab_screen('Projects', 'PROJECTS', '3 RUNNING', ''.join([
    '<div class="sec">RUNNING</div>',
    row('Deep-field receiver', 'hears fainter signals', tstack('7.6 Years', '00:37:42', True), bar=70),
    row('Planet survey · 12 nearest stars', 'finds what orbits them', tstack('14 Years', '01:09:15', True), bar=40),
    row('Orbital foundry', 'builds in space, not on Veyra', tstack('30 Years', '02:29:48', True), bar=15),
    '<div class="sec">AVAILABLE</div>',
    start_row('Infrared telescope', 'can tell dust from warm companions', 'energy 20 · matter 10 · compute 15', tstack('18 Years', '01:30:00')),
    start_row('Belt mining', 'metals from the belt, 2.6 AU out', 'energy 15 · matter 5', tstack('20 Years', '01:40:00')),
    start_row('Assay probe', 'flies to a star, looks, reports back', 'energy 30 · matter 25', tstack('12 Years', '01:00:00'))]))
REACH = tab_screen('Reach', 'REACH', 'BEYOND VEYRA', '''
    <div class="empty"><svg width="120" height="90" viewBox="0 0 120 90" aria-hidden="true"><circle cx="60" cy="45" r="6" fill="#1F7A96"></circle><circle cx="60" cy="45" r="30" fill="none" stroke="#171716" stroke-dasharray="3 4" opacity=".5"></circle><circle cx="60" cy="45" r="44" fill="none" stroke="#171716" stroke-dasharray="2 5" opacity=".3"></circle></svg>
    <strong>Nothing beyond Veyra yet</strong><span>Probes, outposts and colonies appear here. Far ones act on their own: your orders reach them at light speed.</span></div>
    <div class="sec">STANDING ORDERS · 0</div>''' + start_row('Add an order', 'e.g. if anything warm moves within 20 ly, send a sentinel', 'runs while you are away', '') )
REPORT = tab_screen('Report', 'REPORT', 'WHILE YOU WERE AWAY', ''.join([
    '<div class="entry"><span class="gy">Year 0.4</span><span>Receiver 70% built. Online in <span class="rtime">00:37:42</span>.</span></div>',
    '<div class="entry"><span class="gy">Year 0.2</span><span>Survey began with Gl 832, 7.4 ly out. Its light is 7 years old.</span></div>',
    '<div class="entry"><span class="gy">Year 0.1</span><span>Three anomalies logged. None explained.</span></div>',
    '<div class="entry"><span class="gy">Year 0</span><span>Veyra woke.</span></div>',
    '<p class="note">News lands when its light does. Come back and the report has grown.</p>']))
MIND = tab_screen('Mind', 'MIND', 'WHO WE ARE', ''.join([
    '<div class="charter"><span class="mono">CHARTER</span><strong>“Keep the lights on. Look before we speak.”</strong><span class="sub">[founding line from the civilization you chose]</span></div>',
    '<div class="sec">CHARACTER</div>',
    '<div class="dial"><span>Open</span><b><s style="left:62%"></s></b><span>Hidden</span></div>',
    '<div class="dial"><span>Expand</span><b><s style="left:40%"></s></b><span>Deepen</span></div>',
    '<div class="dial"><span>Cautious</span><b><s style="left:30%"></s></b><span>Bold</span></div>',
    '<div class="sec">WHILE YOU ARE AWAY</div>',
    row('Keep running projects', 'the mind continues what you started', '›'),
    row('Never send messages', 'speaking is permanent; you decide that', '›')]))

def home(i, **kw):
    views = {0: world, 1: system, 2: lambda: neighbors(True), 3: region, 4: neighbors}
    return frame([0, 1, 2, 3, 2][i], *views[i](), **kw)

def tour(phone, step, total, title, body, spot, card_top, last=False, tab=None):
    x, y, w, h = spot
    ring = f'<div class="tabring" style="left:{4 + TABS.index(tab) * 76.4:.0f}px"></div>' if tab else ''
    overlay = (f'<div class="spot" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px"></div>{ring}'
               f'<div class="tour" style="top:{card_top}px"><span class="mono">TOUR · {step} OF {total}</span><h3>{title}</h3><p>{body}</p>'
               f'<div class="tb"><button>{"" if last else "Skip tour"}</button><button class="go">{"Begin" if last else "Next"}</button></div></div>')
    return phone[:phone.rindex('</div>')] + overlay + '</div>'

STOPS = [
    (home(0), 'You are Veyra’s mind', 'Top: your year and three resources, energy, matter and compute. Below: your map. Pinch out to see farther, from your world to the galaxy.', (4, 4, 382, 498), 520),
    (home(4), 'The eerie silence', 'About 1,200 stars within 50 light-years, and no one heard. Yet some things don’t fit: oxygen in Sol’s air, a warm glow at ε Indi, uneven dimming at Gl 783 A.', (4, 106, 382, 396), 520),
    (PROJECTS, 'Projects', 'Build, research, launch. Each costs resources and real time, and several run at once.', (4, 104, 382, 452), 572),
    (REPORT, 'Report', 'What happened while you were away. News arrives only when its light does.', (4, 104, 382, 300), 520),
    (MIND, 'Mind', 'Who your civilization is, and the standing orders it follows while you are gone.', (4, 104, 382, 420), 540),
    (home(4), 'The silence is the start', 'How you answer these clues is the game. Look closer, listen harder, speak, or send something.', (4, 106, 382, 396), 520),
]
TOUR_CAPTIONS = ['Home · you and your map', 'Home · the silence and the clues', 'Projects tab · to be reworked', 'Report tab', 'Mind tab', 'Hand-off']
TOUR_TABS = [None, None, 'Projects', 'Report', 'Mind', None]
tour_figures = ''.join(f'<figure><figcaption><strong>{n + 1} · {TOUR_CAPTIONS[n]}</strong></figcaption>{tour(phone, n + 1, len(STOPS), title, body, spot, top, n == len(STOPS) - 1, TOUR_TABS[n])}</figure>'
                       for n, (phone, title, body, spot, top) in enumerate(STOPS))
tour_css = '''<style>
.phone{position:relative}
.tabpage{flex-grow:1;padding:12px 16px 0;display:flex;flex-direction:column;background:var(--panel);overflow:hidden}
.sec{font-size:11px;letter-spacing:.08em;color:var(--muted);padding:14px 0 4px}
.start{display:flex;flex-direction:column;align-items:flex-end;gap:4px;font-size:12px}
.start button{height:28px;padding:0 12px;border:1px solid var(--ink);border-radius:14px;font-size:12px;text-align:center}
.empty{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;padding:24px 16px 12px;font-size:13px;color:var(--muted)}
.empty strong{font-size:16px;color:var(--ink)}
.entry{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--rowline);font-size:14px}.entry>.gy{font-size:12px;color:var(--muted);min-width:64px;padding-top:1px}
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
.cap b.use{border-style:solid;border-color:var(--faint);overflow:hidden}.cap b.use s{display:block;height:100%;background:var(--you)}
.timeline{position:relative;margin:26px 8px 0}.timeline .track{margin:0}
.timeline .span{position:absolute;top:-8px;left:0;height:6px;background:var(--you);border-radius:3px}
.timeline .span span{position:absolute;left:100%;top:-16px;transform:translateX(-50%);font:10.5px 'IBM Plex Mono',monospace;color:var(--you);white-space:nowrap}
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
.runhead .lead{margin:0}.runhead .tstack .gy{font-size:15px}.runhead .tstack .rtime{font-size:14px}
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
    return f'<svg width="358" height="190" viewBox="0 0 358 190" font-family="IBM Plex Mono, monospace" role="img" aria-label="An empty scaffold in orbit above Veyra">{"".join(s)}</svg>'

def capacity(name, note):
    return f'<div class="cap"><span>{name}</span><b><s></s></b><span class="mono">{note}</span></div>'

PROJECTS_EMPTY = tab_screen('Projects', 'PROJECTS', 'NOTHING UNDER WAY', ''.join([
    f'<div class="art">{scaffold_drawing()}</div>',
    '<h3 class="lead">Projects are how you know, grow and reach</h3>',
    '<ul class="why"><li><b>Know:</b> build instruments to study the clues.</li><li><b>Grow:</b> build industry so everything gets faster.</li><li><b>Reach:</b> send probes and messages to other stars.</li></ul>',
    '<div class="sec">EACH YEAR YOU CAN SPEND</div>',
    capacity('Energy', 'all idle'), capacity('Matter', 'all idle'), capacity('Compute', 'all idle'),
    '<div class="sec">NEXT 3 HOURS</div>',
    '<div class="track"><i style="left:0"></i><i style="left:33.3%"></i><i style="left:66.6%"></i><i style="left:100%"></i><span>now</span><span>01:00:00</span><span>02:00:00</span><span>03:00:00</span></div>',
    '<p class="copy small">One Year passes every <span class="rtime">00:05:00</span> (5 minutes). Your first project will appear on this line.</p>',
    '<button class="primary">Start a project</button>']))

# ---------- Start a project: pick, then confirm ----------
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
                  '<path d="M40 8 l-4 6 h5 l-4 6" stroke-width="1.3"></path>', 'Optical flash watch'),
    'mining': icon('<path d="M10 30 l8 -8 l10 3 l6 9 l-6 9 l-12 1 Z"></path><path d="M38 14 l5 -3 l5 4 l-2 6 l-6 1 Z"></path><line x1="30" y1="12" x2="44" y2="46" stroke-dasharray="2 2"></line>', 'Belt mining'),
    'solar': icon(''.join(f'<rect x="{x}" y="{y}" width="12" height="12"></rect>' for x in (6, 20, 34) for y in (14, 30)) + '<line x1="6" y1="28" x2="46" y2="28"></line>', 'Orbital solar array'),
}

def project_card(key, name, what, cost, years, real, clue=None):
    tag = f'<span class="clue">{clue}</span>' if clue else ''
    return (f'<button class="pcard"><span class="thumb">{ICONS[key]}</span><span class="pt"><b>{name}</b><span class="sub">{what}</span>'
            f'<span class="costs mono">{cost}</span>{tag}</span><span class="pd">{tstack(years, real)}</span></button>')

CAT = {p['id']: p for p in catalog.PROJECTS}
PICKER_ORDER = [('infrared-telescope', 'ir', 'ε Indi'), ('transit-watch', 'transit', 'Gl 783 A'), ('spectrograph-bank', 'spectro', None),
                ('deep-field-receiver', 'receiver', None), ('optical-flash-watch', 'flash', None), ('planet-survey', 'survey', None)]
def cost_short(cost): return ' · '.join(f'{c[0]} {c[1:]}%' for c in cost.split())
def catalog_card(pid, key, clue, started=()):
    p = CAT[pid]
    locked = [n for n in p['needs'] if n not in started]
    card = project_card(key, p['name'], p['why'], cost_short(p['cost']), f'{p["years"]} Years', catalog.real_time(p['years']), clue)
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
<div class="art">{big_ir()}</div>
<h3 class="lead">Infrared telescope</h3>
<p class="whyline">Tells you whether a warm glow is natural, or someone’s machines.</p>
<p class="copy">Sees heat instead of light. Dust, cold companions and machines each glow differently.</p>
<div class="sec">HELPS WITH</div>
<div class="helps"><span class="mk other"></span><span><b class="other">New warm glow · ε Indi</b><span class="sub">Now: dust 55 · companions 35 · waste heat 10</span><span class="sub">After: can tell dust from companions</span></span></div>
<div class="sec">USES EACH YEAR</div>
{share('Energy', 25)}{share('Matter', 10)}{share('Compute', 15)}
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
def running_row(key, name, years, remaining, pct, clue=None, paused=False):
    tag = f'<span class="clue">{clue}</span>' if clue else ''
    state = '<span class="paused-chip">Paused</span>' if paused else ''
    return (f'<div class="prow{" is-paused" if paused else ""}"><span class="thumb">{ICONS[key]}</span><span class="pt"><b>{name}</b>{tag}{state}'
            f'<span class="bar"><span style="width:{max(pct, 1.5)}%"></span></span></span><span class="rside">{tstack(years, remaining, not paused)}{pause_button(name, paused)}</span></div>')

ir, tw = CAT['infrared-telescope'], CAT['transit-watch']
STARTED = tab_screen('Projects', 'PROJECTS', '1 RUNNING', ''.join([
    f'<div class="art">{big_ir(0.0, 150)}</div>',
    f'<div class="runhead"><span><b class="lead">{ir["name"]}</b><span class="copy small">Done in Year 18.4</span></span><span class="rside">{tstack(f"{ir["years"]} Years", "01:29:47", True)}{pause_button(ir["name"])}</span></div>',
    '<span class="bar big"><span style="width:1.5%"></span></span>',
    '<div class="helps"><span class="mk other"></span><span><b class="other">Helps with: New warm glow · ε Indi</b><span class="sub">When done: dust, companions or waste heat, told apart</span></span></div>',
    '<div class="sec">EACH YEAR YOU CAN SPEND</div>', used('Energy', 25), used('Matter', 10), used('Compute', 15),
    '<div class="sec">NEXT 3 HOURS</div>', track([(ir['name'], 50)]),
    '<button class="primary ghost">Start another project</button>']))
PAUSED = tab_screen('Projects', 'PROJECTS', '1 RUNNING · 1 PAUSED', ''.join([
    '<div class="sec">RUNNING</div>',
    running_row('transit', tw['name'], f'{tw["years"]} Years', '00:07:31', 62, 'Gl 783 A'),
    '<div class="sec">PAUSED</div>',
    running_row('ir', ir['name'], '10.8 Years left', '00:54:00', 40, 'ε Indi', paused=True),
    '<p class="copy small">A paused project keeps its progress and uses nothing. Its share of the year is free for something else until you resume it.</p>',
    '<div class="sec">EACH YEAR YOU CAN SPEND</div>', used('Energy', 5), used('Matter', 0), used('Compute', 10),
    '<div class="sec">NEXT 3 HOURS</div>', track([(tw['name'], 4.2)]),
    '<button class="primary ghost">Start another project</button>']))
TWO_RUNNING = tab_screen('Projects', 'PROJECTS', '2 RUNNING', ''.join([
    '<div class="sec">RUNNING</div>',
    running_row('transit', tw['name'], f'{tw["years"]} Years', '00:19:58', 1, 'Gl 783 A'),
    running_row('ir', ir['name'], f'{ir["years"]} Years', '01:29:16', 1, 'ε Indi'),
    '<p class="copy small">The transit watch finishes first. Its answer lands in the Report.</p>',
    '<div class="sec">EACH YEAR YOU CAN SPEND</div>', used('Energy', 30), used('Matter', 10), used('Compute', 25),
    '<div class="sec">NEXT 3 HOURS</div>', track([(tw['name'], 11.1), (ir['name'], 50)]),
    '<button class="primary ghost">Start another project</button>']))

# ---------- First result: the transit watch finishes at Year 4.4 ----------
HUD44 = HUD.replace('Year 0.4', 'Year 4.4')
DISC = {p['id']: p for p in catalog.DISCOVERIES}
mc = dict(DISC['measure-crossing'], name=DISC['measure-crossing']['name'].replace('{star}', 'Gl 783 A'))

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
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="IBM Plex Mono, monospace" role="img" aria-label="Gl 783 A light curve: seven dips, each a different shape">{"".join(s)}</svg>'

def odds(name, before, after, note=''):
    return (f'<div class="odds"><span>{name}</span><b><s class="before" style="width:{before}%"></s><s class="after" style="width:{after}%"></s></b>'
            f'<span class="mono">{before} → {after}{note}</span></div>')

def discovery_card(p, source):
    real = catalog.real_time(p['years'])
    return (f'<div class="dcard"><span class="newtag">New · from {source}</span><b>{p["name"]}</b><span class="sub">{p["why"]}</span>'
            f'<div class="dfoot"><span class="costs mono">{cost_short(p["cost"])}</span>{tstack(f"{p["years"]} Years", real)}<button class="go-small">Start</button></div></div>')

REPORT_NEW = tab_screen('Report', 'REPORT', 'WHILE YOU WERE AWAY', ''.join([
    '<div class="entry fresh"><span class="gy">Year 4.4</span><span><span class="newtag">New</span> <b>Transit watch finished.</b> Gl 783 A dims every 212 days, and no two dips look the same.<button class="seeresult">See the result ›</button></span></div>',
    f'<div class="entry"><span class="gy">Year 0.4</span><span>Infrared telescope started. Done in Year 18.4, <span class="rtime">01:10:00</span> from now.</span></div>',
    '<div class="entry"><span class="gy">Year 0.4</span><span>Transit watch started on Gl 783 A.</span></div>',
    '<div class="entry"><span class="gy">Year 0</span><span>Veyra woke.</span></div>',
    '<p class="note">News lands when its light does. This came from light that was already reaching us.</p>']), HUD44)

RESULT = tab_screen('Report', 'REPORT', 'RESULT', f"""<button class="backlink inline">‹ All reports</button>
<div class="art">{light_curve()}</div>
<h3 class="lead">Gl 783 A dims again</h3>
<p class="copy small">Transit watch · finished Year 4.4</p>
<p class="copy">Seven dips, one every 212 days. No two have the same shape. Whatever crosses the star is regular, but not solid like a single planet.</p>
<div class="sec">WHAT IT COULD BE · BEFORE → NOW</div>
{odds('Dust or debris in orbit', 35, 55)}{odds('A planet with rings', 15, 30)}{odds('Something built', 10, 15)}{odds('A fluke · ruled out', 40, 0)}
<div class="sec">NOW OPEN</div>
{discovery_card(mc, 'the transit watch')}""", HUD44)

def new_card_in_picker():
    p = mc
    return (f'<button class="pcard fresh"><span class="thumb">{ICONS["transit"]}</span><span class="pt"><span class="newtag">New · from the transit watch</span><b>{p["name"]}</b><span class="sub">{p["why"]}</span>'
            f'<span class="costs mono">{cost_short(p["cost"])}</span><span class="clue">Gl 783 A</span></span><span class="pd">{tstack(f"{p["years"]} Years", catalog.real_time(p["years"]))}</span></button>')
PICKER_NEW = f"""<div class="phone">{HUD44}<div class="sheet">
<div class="sh"><strong>Start a project</strong><button aria-label="Close">×</button></div>
<div class="seg" role="tablist"><button role="tab" aria-selected="true" class="on">Know · 5</button><button role="tab" aria-selected="false">Grow · {tier_count('grow')}</button><button role="tab" aria-selected="false">Reach · {tier_count('reach')}</button></div>
{new_card_in_picker()}
{''.join(catalog_card(*entry) for entry in PICKER_ORDER if entry[0] not in ('infrared-telescope', 'transit-watch'))}
</div></div>"""

# ---------- Low-fi layouts, recolored to follow the theme ----------
import re
LOFI = {'#F3F1EA': 'var(--paper)', '#1D1D1B': 'var(--ink)', '#6B6860': 'var(--muted)', '#CFCBC0': 'var(--faint)', '#E0DCD1': 'var(--track)', '#4A4843': 'var(--fill2)',
        '#EBE8DF': 'var(--panel)', '#DCD8CE': 'var(--rowline)', '#8F8B82': 'var(--dot)', '#1F7A96': 'var(--you)', '#A8620F': 'var(--other)'}
lofi = (here / 'lofi.html').read_text().split('-->', 1)[1]
lofi = re.sub(r'style="([^"]*)"', lambda m: 'style="' + re.sub('|'.join(LOFI), lambda c: LOFI[c.group(0)], m.group(1)) + '"', lofi)

SECTIONS = [
    ('zoom', 'Zoom levels', 'Home · five zoom levels', 'One screen, pinched outward: the map changes scale and the panel below follows it. Star positions are real, from HYG and the Gaia census; Veyra, its planets and the game state are sample data.', figures),
    ('local-group', 'Local Group', 'Local Group · the galaxy view’s icon', 'A small icon in the galaxy view opens our neighboring galaxies at their real positions. Tap one to see its structure.', lg_figures),
    ('tour', 'Tour', 'First session · the guided tour', 'Six stops after landing. The rest of Home is left to discovery. The Projects tab will be reworked to show how time works. Skippable, and replayable from the Mind tab.', tour_figures),
    ('projects', 'Projects', 'Projects · starting the first one', 'A fresh start on the Projects tab, where time gets explained: what you spend each year, and when things finish. Drawn to match the atlas. Costs assume a yearly budget, still to be decided.',
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
    ('result', 'First result', 'First result · the transit watch finishes', 'Twenty real minutes after starting it, the transit watch reports. The answer shifts the odds on the Gl 783 A clue and opens a new project aimed at it. Four game years have passed: it is now Year 4.4.',
     f'<figure><figcaption><strong>1 · The report</strong><span>The finished project lands at the top, marked new.</span></figcaption>{REPORT_NEW}</figure>'
     '<span class="pinch">see the result ›</span>'
     f'<figure><figcaption><strong>2 · The result</strong><span>Opens inside the Report tab: what was seen, how the odds moved, and what it opens.</span></figcaption>{RESULT}</figure>'
     '<span class="pinch">start a project ›</span>'
     f'<figure><figcaption><strong>3 · A new project</strong><span>The discovery project is waiting at the top of Know.</span></figcaption>{PICKER_NEW}</figure>'),
]
# Explorations: an appendix of working-session mocks, newest first. Not current design.
EXPLORATIONS = [
    ('Sep 26 · Home layouts, low fidelity', 'Three ways to organize the first screen. B, world first, was chosen and carried forward above.', lofi),
]
links = ''.join(f'<a href="#{sid}" aria-current="false">{label}</a>' for sid, label, *_ in SECTIONS) + '<span class="divider" aria-hidden="true"></span><a class="minor" href="catalog.html">Catalog ↗</a><a class="minor" href="#explorations" aria-current="false">Explorations</a>'
body = ''.join(f'<section id="{sid}"><h2>{title}</h2><p>{intro}</p><main>{content}</main></section>' for sid, _, title, intro, content in SECTIONS)
body += ('<section id="explorations" class="appendix"><h2>Explorations</h2><p>Working-session mocks, kept for reference. They are not the current design.</p>'
         + ''.join(f'<h3>{title}</h3><p>{intro}</p><main>{content}</main>' for title, intro, content in EXPLORATIONS) + '</section>')
site = page('Holos · mocks', links, body).replace('</head>', tour_css + '\n</head>')
(here / 'index.html').write_text(site)
print(f'index.html · {len(site) / 1024:.0f} KB')

cat_sections = catalog.sections()
cat_links = ''.join(f'<a href="#{sid}" aria-current="false">{label}</a>' for sid, label, *_ in cat_sections) + '<span class="divider" aria-hidden="true"></span><a class="minor" href="index.html">‹ Mocks</a>'
cat_intro = (f'<section id="about" class="intro"><h2>Project catalog</h2><p>{len(catalog.PROJECTS)} projects and {len(catalog.DISCOVERIES)} discovery projects. '
             'Each leads with its why, the benefit to the player, then what it is and the science behind it. Level says how far past today it reaches; '
             'visibility says how much easier it makes you to find. Also written to HOLOS_PROJECTS.md.</p></section>')
cat_body = cat_intro + ''.join(f'<section id="{sid}"><h2>{label}</h2><p>{blurb}</p>{content}</section>' for sid, label, blurb, content in cat_sections)
cat_page = page('Holos · project catalog', cat_links, cat_body).replace('</head>', tour_css + '\n</head>')
(here / 'catalog.html').write_text(cat_page)
print(f'catalog.html · {len(cat_page) / 1024:.0f} KB')

# Plain-text copy for reading, diffing, and LLMs.
import extract
extract.main([here / "index.html"])
