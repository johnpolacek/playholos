"""Veyra's people, drawn as a naturalist's plate. Invented, like everything on Veyra.

The body is built, not traced: each part is a tapered tube along a Catmull-Rom spine, closed into an
outline, shaded where it turns from a light at upper right, ringed with cross-contours, and pebbled.
Units are centimeters, ground at y = 0, facing right. One figure serves every size: a portrait thumb,
the People screen, and a full-screen plate whose insets magnify the same drawing.
"""
import math, random

PAPER, INK, MUTED, YOU = '#FBFAF7', '#171716', '#6B6860', '#1F7A96'
LIGHT = (3.2, -2.6)   # the shadow is what a part's own outline, nudged toward the light, doesn't cover

def f(n): return f'{n:.2f}'.rstrip('0').rstrip('.')

def catmull(points, widths, per=14):
    pts = [points[0]] + list(points) + [points[-1]]
    out = []
    for i in range(len(points) - 1):
        p0, p1, p2, p3 = pts[i], pts[i + 1], pts[i + 2], pts[i + 3]
        for k in range(per):
            t = k / per; t2, t3 = t * t, t * t * t
            x = .5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
            y = .5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
            out.append((x, y, widths[i] + (widths[i + 1] - widths[i]) * t))
    out.append((*points[-1], widths[-1]))
    return out

class Part:
    """A tapered tube: its outline, the cross-section at every sample, and a polygon for texture tests."""
    def __init__(self, points, widths, per=14, cap=True):
        s = catmull(points, widths, per)
        self.samples = []
        left, right = [], []
        for i, (x, y, w) in enumerate(s):
            a, b = s[max(i - 1, 0)], s[min(i + 1, len(s) - 1)]
            tx, ty = b[0] - a[0], b[1] - a[1]; n = math.hypot(tx, ty) or 1
            tx, ty = tx / n, ty / n; nx, ny = -ty, tx
            L, R = (x + nx * w / 2, y + ny * w / 2), (x - nx * w / 2, y - ny * w / 2)
            left.append(L); right.append(R); self.samples.append((x, y, w, tx, ty, L, R))
        poly = left[:]
        if cap:   # round the far end
            x, y, w, tx, ty, *_ = self.samples[-1]
            a0 = math.atan2(left[-1][1] - y, left[-1][0] - x)
            poly += [(x + w / 2 * math.cos(a0 - math.pi * k / 8), y + w / 2 * math.sin(a0 - math.pi * k / 8)) for k in range(1, 8)]
        poly += right[::-1]
        if cap:
            x, y, w, tx, ty, *_ = self.samples[0]
            a0 = math.atan2(right[0][1] - y, right[0][0] - x)
            poly += [(x + w / 2 * math.cos(a0 - math.pi * k / 8), y + w / 2 * math.sin(a0 - math.pi * k / 8)) for k in range(1, 8)]
        self.poly = poly
        self.d = 'M' + ' L'.join(f'{f(x)} {f(y)}' for x, y in poly) + ' Z'

def inside(poly, x, y):
    c = False
    for (x1, y1), (x2, y2) in zip(poly, poly[1:] + poly[:1]):
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1: c = not c
    return c

def stroke(w, extra=''):
    return f'fill="none" stroke="{INK}" stroke-width="{w}" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"{extra}'

class Figure:
    def __init__(self, uid, detail=2):
        self.uid, self.detail, self.out, self.n = uid, detail, [], 0
        self.rng = random.Random(7)

    def shape(self, d, poly=None, shade=True):
        self.n += 1; mid = f'{self.uid}m{self.n}'
        self.out.append(f'<path d="{d}" fill="{PAPER}" stroke="none"></path>')
        if shade:
            self.out.append(f'<mask id="{mid}"><path d="{d}" fill="white"></path><path d="{d}" fill="black" transform="translate({LIGHT[0]} {LIGHT[1]})"></path></mask>'
                            f'<rect x="-130" y="-220" width="220" height="230" fill="url(#{self.uid}h)" mask="url(#{mid})"></rect>')
        return mid

    def outline(self, d, w=1.4):
        self.out.append(f'<path d="{d}" {stroke(w)}></path>')

    def part(self, p, rings=0, ring_from=0, ring_to=1, pebbles=0, bands=False, shade=True):
        self.shape(p.d, p.poly, shade)
        if self.detail >= 1 and rings:
            m = len(p.samples)
            for i in range(int(m * ring_from) + 2, int(m * ring_to) - 1, max(1, m // rings)):
                x, y, w, tx, ty, L, R = p.samples[i]
                cx, cy = x + tx * w * .28, y + ty * w * .28
                heavy = bands and (i // max(1, m // rings)) % 2 == 0
                self.out.append(f'<path d="M{f(L[0])} {f(L[1])} Q{f(cx)} {f(cy)} {f(R[0])} {f(R[1])}" {stroke(.9 if heavy else .45, "" if heavy else " opacity=\".7\"")}></path>')
        if self.detail >= 2 and pebbles:
            xs = [x for x, _ in p.poly]; ys = [y for _, y in p.poly]
            for _ in range(pebbles * 6):
                x = self.rng.uniform(min(xs), max(xs)); y = self.rng.uniform(min(ys), max(ys))
                if inside(p.poly, x, y) and inside(p.poly, x + LIGHT[0] * .6, y + LIGHT[1] * .6) is False or (inside(p.poly, x, y) and self.rng.random() < .35):
                    r = self.rng.uniform(.25, .6)
                    self.out.append(f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r)}" fill="{INK}" opacity=".55"></circle>')
        self.outline(p.d)

    def svg_defs(self):
        return (f'<pattern id="{self.uid}h" width="1.3" height="1.3" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">'
                f'<line x1="0" y1="0" x2="0" y2="1.3" stroke="{INK}" stroke-width=".32"></line></pattern>')

def leg(hip, knee, hock, ball, near=True):
    # Digitigrade: a heavy thigh swings the knee forward, a lean shin runs back to the hock, and the long foot stands on its toes.
    k = 1 if near else .9
    thigh = ((hip[0] * .45 + knee[0] * .55) + 3, (hip[1] * .45 + knee[1] * .55))
    shin = ((knee[0] + hock[0]) / 2 - 1.5, (knee[1] + hock[1]) / 2)
    return Part([hip, thigh, knee, shin, hock, ball], [19 * k, 17 * k, 10 * k, 6.8 * k, 5.6 * k, 4.4 * k], per=12)

def toes(fig, ball, spread, length=9):
    for k, a in enumerate(spread):
        a = math.radians(a)
        tip = (ball[0] + length * math.cos(a), ball[1] + length * math.sin(a))
        mid = (ball[0] + length * .55 * math.cos(a) + .6, ball[1] + length * .55 * math.sin(a) - .6)
        p = Part([ball, mid, tip], [3.2, 2.4, 1.2], per=6)
        fig.part(p, shade=False)
        fig.out.append(f'<path d="M{f(tip[0])} {f(tip[1])} l1.8 .9" {stroke(1.2)}></path>')   # claw

def hand(fig, wrist, reach=1.0):
    wx, wy = wrist
    palm = Part([(wx - 1, wy), (wx + 2.5, wy + .8), (wx + 5, wy + 1.2)], [4.6, 5.4, 4.8], per=6)
    fig.part(palm, shade=False)
    digits = [  # two fingers forward and down, two thumbs up and back, opposed
        [(wx + 5, wy + 1.4), (wx + 8.5, wy + 3.2), (wx + 10.5, wy + 6)],
        [(wx + 4.6, wy + 2.6), (wx + 7, wy + 5.6), (wx + 7.6, wy + 9)],
        [(wx + 3.6, wy - 1), (wx + 5.4, wy - 4.6), (wx + 8, wy - 6.4)],
        [(wx + 1.4, wy - 1.2), (wx + 1.8, wy - 5.2), (wx + 3.8, wy - 7.8)],
    ]
    for i, pts in enumerate(digits):
        p = Part(pts, [2.2, 1.8, 1.1], per=6)
        fig.part(p, shade=False, rings=2 if fig.detail >= 2 else 0)
        (ax, ay), (bx, by) = pts[-2], pts[-1]
        n = math.hypot(bx - ax, by - ay); ux, uy = (bx - ax) / n, (by - ay) / n
        fig.out.append(f'<path d="M{f(bx)} {f(by)} l{f(ux * 1.3)} {f(uy * 1.3)}" {stroke(1.1)}></path>')

def crest(fig, base, scale=1.0):
    bx, by = base
    angles = [-58, -74, -90, -105, -120, -136, -152, -168]
    lengths = [17, 24, 28, 30, 29, 26, 21, 14]
    tips = [(bx + L * scale * math.cos(math.radians(a)), by + L * scale * math.sin(math.radians(a))) for a, L in zip(angles, lengths)]
    d = f'M{f(bx + 2)} {f(by + 1)} L{f(tips[0][0])} {f(tips[0][1])}'
    for (x1, y1), (x2, y2) in zip(tips, tips[1:]):
        cx, cy = (x1 + x2) / 2 + (bx - (x1 + x2) / 2) * .16, (y1 + y2) / 2 + (by - (y1 + y2) / 2) * .16
        d += f' Q{f(cx)} {f(cy)} {f(x2)} {f(y2)}'
    d += f' L{f(bx - 2)} {f(by + 2)} Z'
    fig.shape(d)
    if fig.detail >= 1:
        for (tx, ty), a in zip(tips, angles):   # rays: stiff at the root, fine at the tip
            fig.out.append(f'<path d="M{f(bx)} {f(by)} L{f(tx)} {f(ty)}" {stroke(.8)}></path>')
            fig.out.append(f'<circle cx="{f(tx)}" cy="{f(ty)}" r=".7" fill="{INK}"></circle>')
    if fig.detail >= 1:   # the mood band: spots that flush when the crest is raised
        for k in range(len(angles) - 1):
            for r in (.58, .72):
                a = math.radians((angles[k] + angles[k + 1]) / 2); L = (lengths[k] + lengths[k + 1]) / 2 * scale * r
                fig.out.append(f'<circle cx="{f(bx + L * math.cos(a))}" cy="{f(by + L * math.sin(a))}" r="{f(1.25 if r < .7 else .9)}" fill="{YOU}" opacity=".75"></circle>')
        for k in range(len(angles) - 1 if fig.detail >= 2 else 0):   # fine fibers between rays
            for t in (.33, .66):
                a = math.radians(angles[k] + (angles[k + 1] - angles[k]) * t); L = (lengths[k] + (lengths[k + 1] - lengths[k]) * t) * scale * .92
                fig.out.append(f'<path d="M{f(bx + 5 * math.cos(a))} {f(by + 5 * math.sin(a))} L{f(bx + L * math.cos(a))} {f(by + L * math.sin(a))}" {stroke(.3, " opacity=\".6\"")}></path>')
    fig.outline(d, 1.3)

def draw(uid, detail=2):
    """The Veyran body, in centimeters. Returns (defs, body) for one <svg>."""
    fig = Figure(uid, detail)
    # far side first
    far_arm = Part([(3, -141), (6, -129), (7, -118), (19, -106)], [8, 8.4, 5.6, 4.4], per=10)
    fig.part(far_arm, rings=5, pebbles=4 if detail >= 2 else 0)
    hand(fig, (19, -106))
    far_leg = leg((-7, -94), (6, -64), (-9, -29), (1, -3.5), near=False)
    fig.part(far_leg, rings=9, pebbles=10)
    toes(fig, (1, -3.5), [4, 16, -8], 8)
    tail = Part([(-6, -96), (-28, -82), (-52, -54), (-76, -26), (-98, -9), (-112, -4)], [24, 16, 10.5, 6, 2.8, .8], per=14)
    fig.part(tail, rings=16, ring_to=.95, pebbles=16, bands=True)
    torso = Part([(-6, -86), (-4, -103), (1, -121), (7, -137), (12, -150)], [27, 32, 34, 29, 18], per=14)
    fig.part(torso, rings=8, ring_from=.1, ring_to=.85, pebbles=6)
    # the sash: a band from the near shoulder to the far hip, with its pouch and the lamp of the founding line
    sash = Part([(14, -146), (6, -128), (-4, -110), (-12, -98)], [4, 4, 4, 4], per=10, cap=False)
    fig.part(sash, rings=10, shade=False)
    fig.out.append(f'<rect x="-15" y="-104" width="9" height="11" rx="1.6" fill="{PAPER}" transform="rotate(-24 -10 -98)" {stroke(1.2)[len("fill=\"none\" "):]}></rect>')
    fig.out.append(f'<circle cx="7" cy="-129" r="2.6" fill="{YOU}"></circle><circle cx="7" cy="-129" r="4.4" {stroke(.7)}></circle>')
    near_leg = leg((0, -94), (15, -63), (2, -28), (13, -3.6))
    fig.part(near_leg, rings=10, pebbles=12)
    toes(fig, (13, -3.6), [2, 14, -10], 10)
    fig.out.append(f'<path d="M1.5 -27 l-3 3.4" {stroke(1.1)}></path>')   # the spur at the hock
    neck = Part([(9, -144), (14, -158), (20, -168), (24, -173)], [16, 12, 10.5, 10], per=10)
    fig.part(neck, rings=6, pebbles=3)
    crest(fig, (22, -179))
    head = Part([(15, -177), (25, -181), (37, -179.5), (47, -175.5), (54, -172)], [13, 18, 15.5, 10, 4.2], per=12)
    fig.part(head, rings=0, pebbles=5 if detail >= 2 else 0)
    # face: brow, the eye with its lid and catchlight, nostril, the long mouth
    fig.out.append(f'<path d="M30 -186.5 Q37 -189.6 44 -185" {stroke(1.2)}></path>')                     # brow ridge
    fig.out.append(f'<circle cx="37" cy="-182.4" r="3.1" fill="{INK}"></circle><circle cx="38.1" cy="-183.5" r=".9" fill="{PAPER}"></circle>')
    fig.out.append(f'<path d="M33 -183.8 Q37 -187 41.4 -183.6 M33.4 -180 Q37 -178.2 40.6 -180.2" {stroke(.7)}></path>')   # lids
    fig.out.append(f'<path d="M51.6 -174.6 q1 -.6 1.8 0" {stroke(.8)}></path>')                            # nostril
    fig.out.append(f'<path d="M53.6 -170.8 Q45 -170 32 -174.2 Q30 -175 29 -177" {stroke(1)}></path>')    # the long mouth
    fig.out.append(f'<path d="M44 -168.6 Q37 -168 30 -171" {stroke(.45, " opacity=\".7\"")}></path>')   # jaw line
    fig.out.append(f'<path d="M27 -176 q-1.6 -2.2 -.8 -4.6" {stroke(.8)}></path>')                        # ear opening under the crest
    if detail >= 1:
        fig.out.append(f'<path d="M24 -178 Q27 -172 25 -168 M28 -178 Q30.5 -173.5 29 -170" {stroke(.5, " opacity=\".7\"")}></path>')   # the crest's root folds
    # near arm last, in front of everything
    near_arm = Part([(14, -141), (19, -129), (23, -118), (30, -113), (37, -110)], [9.5, 9.6, 6.4, 5.6, 4.6], per=8)
    fig.part(near_arm, rings=6, pebbles=5)
    fig.out.append(f'<path d="M34 -112.6 h3.4 M34.2 -107.6 h3.2" {stroke(.9)}></path>')   # the wrist band
    hand(fig, (37, -110))
    return fig.svg_defs(), ''.join(fig.out)

_uids = [0]
def svg(width, height, view, detail=2, extra='', label='One of Veyra’s people'):
    """The figure framed by `view` (x, y, w, h in centimeters). `extra` is drawn in the same units, over it."""
    _uids[0] += 1; uid = f'vey{_uids[0]}'
    defs, body = draw(uid, detail)
    # Drawn inline, not through <use>: the theme retints colors by attribute, which doesn't reach into <use> clones.
    return (f'<svg width="{width}" height="{height}" viewBox="{" ".join(f(v) for v in view)}" font-family="IBM Plex Mono, monospace" role="img" aria-label="{label}">'
            f'<defs>{defs}</defs>{body}{extra}</svg>')

def thumb(size=56):
    # A portrait: the head and crest, for cards and lists.
    return svg(size, size, (-6, -214, 66, 66), detail=1, label='A Veyran, head and crest')

def shadow():
    return f'<ellipse cx="4" cy="0" rx="26" ry="2.6" fill="{INK}" opacity=".12"></ellipse>'

def standing(width=358, height=232):
    # The whole body on the ground line, with a meter for scale.
    ground = f'<line x1="-140" y1="0" x2="120" y2="0" {stroke(.9)}></line>'
    meter = f'<path d="M84 0 V-100 M81 -100 H87" {stroke(1)}></path><text x="80" y="-95" font-size="6" fill="{INK}" text-anchor="end">1 m</text>'
    vh = 222; vw = vh * width / height
    return svg(width, height, (-15 - vw / 2, -214, vw, vh), detail=2, extra=shadow() + ground + meter)

def inset(cx, cy, r, zoom, at, label):
    # A round window magnifying `at` on the figure.
    ax, ay = at; _uids[0] += 1; k = f'vey{_uids[0]}'
    defs, body = draw(k)
    return (f'<defs>{defs}<clipPath id="{k}c"><circle cx="{f(cx)}" cy="{f(cy)}" r="{f(r)}"></circle></clipPath></defs>'
            f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(r)}" fill="{PAPER}"></circle>'
            f'<g clip-path="url(#{k}c)"><g transform="translate({f(cx - ax * zoom)} {f(cy - ay * zoom)}) scale({zoom})">{body}</g></g>'
            f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(r)}" {stroke(1.2)}></circle>'
            f'<text x="{f(cx)}" y="{f(cy + r + 7)}" font-size="5" fill="{MUTED}" text-anchor="middle">{label}</text>')

def plate(width=358):
    """Full screen: the body large, called out, with the crest, eye, hand and foot magnified below the ground line."""
    vx, vy, vw, vh = -130, -226, 238, 300
    fs = 5.8; tw = lambda t: len(t) * fs * .6
    left = [((10, -204), -214, 'Crest: hears far off'), ((22, -195), -205, 'Spots flush with mood'),
            ((7, -129), -150, 'The lamp of the founding line'), ((-4, -104), -140, 'Sash and pouch'), ((-58, -46), -72, 'Tail: balance')]
    right = [((37, -182), -196, 'Eye'), ((44, -116), -128, 'Two thumbs'), ((20, -76), -86, 'Heavy thigh'), ((2, -28), -44, 'Hock spur'), ((14, -3), -16, 'On its toes')]
    ex = []
    for (px, py), ty, lab in left:
        tx = -122
        ex.append(f'<circle cx="{px}" cy="{py}" r="1" fill="{INK}"></circle><path d="M{px} {py} L{f(tx + tw(lab) + 2)} {ty - 1.6}" {stroke(.5)}></path>'
                  f'<text x="{tx}" y="{ty}" font-size="{fs}" fill="{INK}">{lab}</text>')
    for (px, py), ty, lab in right:
        tx = 60
        ex.append(f'<circle cx="{px}" cy="{py}" r="1" fill="{INK}"></circle><path d="M{px} {py} L{tx - 2} {ty - 1.6}" {stroke(.5)}></path>'
                  f'<text x="{tx}" y="{ty}" font-size="{fs}" fill="{INK}">{lab}</text>')
    ex.append(shadow() + f'<line x1="{vx}" y1="0" x2="{vx + vw}" y2="0" {stroke(.9)}></line>')
    ex.append(f'<path d="M-124 0 V-200 M-126 -200 H-122" {stroke(.9)}></path>' + ''.join(f'<path d="M-124 {-k * 10} h{2.4 if k % 5 else 4}" {stroke(.6)}></path>' for k in range(1, 20))
              + f'<text x="-121" y="-98" font-size="4.6" fill="{MUTED}">1 m</text><text x="-121" y="-198" font-size="4.6" fill="{MUTED}">2 m</text>')
    ex.append(inset(-98, 34, 24, 2.1, (16, -194), 'crest ×2') + inset(-40, 34, 24, 3.2, (39, -178), 'eye ×3')
              + inset(18, 34, 24, 3.2, (42, -110), 'hand ×3') + inset(76, 34, 24, 3, (15, -5), 'foot ×3'))
    return svg(width, width * vh / vw, (vx, vy, vw, vh), detail=2, extra=''.join(ex), label='Plate: one of Veyra’s people, with the crest, eye, hand and foot magnified')
