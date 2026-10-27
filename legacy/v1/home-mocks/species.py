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

SIDE_RAYS = ([-58, -74, -90, -105, -120, -136, -152, -168], [17, 24, 28, 30, 29, 26, 21, 14])
def crest(fig, base, scale=1.0, rays=SIDE_RAYS, root=2):
    # One of the paired crests: a fan of stiff rays under skin, one each side of the head, like ears.
    bx, by = base
    angles, lengths = rays
    tips = [(bx + L * scale * math.cos(math.radians(a)), by + L * scale * math.sin(math.radians(a))) for a, L in zip(angles, lengths)]
    d = f'M{f(bx + root)} {f(by + root / 2)} L{f(tips[0][0])} {f(tips[0][1])}'
    for (x1, y1), (x2, y2) in zip(tips, tips[1:]):
        cx, cy = (x1 + x2) / 2 + (bx - (x1 + x2) / 2) * .16, (y1 + y2) / 2 + (by - (y1 + y2) / 2) * .16
        d += f' Q{f(cx)} {f(cy)} {f(x2)} {f(y2)}'
    d += f' L{f(bx - root)} {f(by + root)} Z'
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
    crest(fig, (25, -182), .9, ([a + 10 for a in SIDE_RAYS[0]], SIDE_RAYS[1]))   # the far crest, peeking past the near one
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


# ---------- Front view and face: the same body, facing us ----------
# Front on, the snout points at the viewer and foreshortens to a round muzzle; the eyes face forward; the two crests
# spread up and out like a crown. Symmetric about x = 0, same centimeters, ground at y = 0.
def front_rays(side):
    angles = [-84, -70, -57, -44, -31, -18, -6]
    lengths = [22, 28, 30, 29, 26, 21, 14]
    return ([a if side > 0 else -180 - a for a in angles], lengths)

def front_hand(fig, wrist, s):
    wx, wy = wrist
    fig.part(Part([(wx, wy - 1), (wx + s * .4, wy + 2.4), (wx + s * .3, wy + 5)], [4.6, 5.6, 5], per=6), shade=False)
    digits = [[(wx + s * 1.3, wy + 5), (wx + s * 1.9, wy + 9), (wx + s * 1.5, wy + 12.6)],     # two fingers, hanging
              [(wx - s * .6, wy + 5.2), (wx - s * .8, wy + 9.2), (wx - s * .2, wy + 12.4)],
              [(wx - s * 2, wy + 1.6), (wx - s * 4.6, wy + 3.6), (wx - s * 5.8, wy + 6.8)],   # two thumbs, turned in
              [(wx - s * 1.8, wy + 3.4), (wx - s * 3.8, wy + 6.6), (wx - s * 4.2, wy + 10)]]
    for pts in digits:
        fig.part(Part(pts, [2.1, 1.7, 1.1], per=6), shade=False, rings=2 if fig.detail >= 2 else 0)
        (ax, ay), (bx, by) = pts[-2], pts[-1]; n = math.hypot(bx - ax, by - ay)
        fig.out.append(f'<path d="M{f(bx)} {f(by)} l{f((bx - ax) / n * 1.2)} {f((by - ay) / n * 1.2)}" {stroke(1.1)}></path>')

def front_head(fig, detail):
    """The face, front on and a little from above, so the long muzzle runs down toward us. Detail 3 adds the portrait's scales and iris."""
    for sd in (-1, 1):
        crest(fig, (sd * 9, -190), 1.0, front_rays(sd), root=2.6)
    fig.part(Part([(0, -146), (0, -156), (0, -166)], [17, 13.5, 12], per=8), rings=5 if detail < 3 else 0, pebbles=3)   # neck
    if detail >= 2:   # throat folds
        fig.out.append(''.join(f'<path d="M{f(-6 + k * .3)} {f(-155.4 + k * 2.6)} Q0 {f(-153.2 + k * 2.6)} {f(6 - k * .3)} {f(-155.4 + k * 2.6)}" {stroke(.5, " opacity=\".75\"")}></path>' for k in range(4)))
    skull = ('M0 -197 C7.5 -197 12.6 -193.4 13.4 -187.6 L13 -182 C12.6 -178.4 10.8 -175.4 8.2 -173.2 '
             'C6 -171.2 5 -167 4.4 -162.6 C3.9 -159.6 2.2 -158 0 -158 C-2.2 -158 -3.9 -159.6 -4.4 -162.6 '
             'C-5 -167 -6 -171.2 -8.2 -173.2 C-10.8 -175.4 -12.6 -178.4 -13 -182 L-13.4 -187.6 C-12.6 -193.4 -7.5 -197 0 -197 Z')
    fig.shape(skull)
    if detail >= 3:   # tiled scales over the crown, larger at the brow
        for row, (y, n, r) in enumerate(((-194.6, 5, 1.2), (-192.4, 6, 1.15), (-190.2, 7, 1.05))):
            for k in range(n):
                x = (k - (n - 1) / 2) * r * 2.05 + (.5 if row % 2 else 0)
                fig.out.append(f'<path d="M{f(x - r)} {f(y)} A{f(r)} {f(r)} 0 0 0 {f(x + r)} {f(y)}" {stroke(.45, " opacity=\".8\"")}></path>')
        for sd in (-1, 1):   # cheek plates
            for x, y, r in ((10.6, -180.6, 1.1), (9.2, -177.4, 1), (11.6, -184, .9), (7.2, -175, .8)):
                fig.out.append(f'<path d="M{f(sd * (x - r))} {f(y)} A{f(r)} {f(r)} 0 0 0 {f(sd * (x + r))} {f(y)}" {stroke(.4, " opacity=\".8\"")}></path>')
    elif detail >= 1:
        fig.out.append(f'<path d="M-6 -194 Q0 -196 6 -194 M-7.6 -191.6 Q0 -193.8 7.6 -191.6" {stroke(.45, " opacity=\".7\"")}></path>')
    fig.outline(skull, 1.4)
    for sd in (-1, 1):
        fig.out.append(f'<path d="M{sd * 12.8} -188.6 q{sd * -1.8} 1.8 {sd * -.7} 4.4" {stroke(.8)}></path>')                          # ear opening at the crest root
        fig.out.append(f'<path d="M{sd * 2.1} -181.6 Q{sd * 2.9} -171 {sd * 2.3} -161.4" {stroke(.6, " opacity=\".8\"")}></path>')   # the ridge down the muzzle
        fig.out.append(f'<path d="M{sd * 4.3} -160.8 Q{sd * 6.4} -165.2 {sd * 7.4} -170.2 Q{sd * 8.6} -172.4 {sd * 10.4} -173.6" {stroke(1)}></path>')   # the long mouth, running back along the jaw
        fig.out.append(f'<path d="M{sd * .9} -160.4 l{sd * 1.2} -1.6" {stroke(1)}></path>')                                                # nostril slit
        ex, ey = sd * 7.2, -182
        eye = f'M{f(ex - sd * 3.4)} {f(ey + .6)} Q{f(ex)} {f(ey - 2.8)} {f(ex + sd * 3.4)} {f(ey - 1.2)} Q{f(ex + sd * .4)} {f(ey + 2.6)} {f(ex - sd * 3.4)} {f(ey + .6)} Z'
        fig.out.append(f'<path d="{eye}" fill="{PAPER}" {stroke(1)[len("fill=\"none\" "):]}></path>')
        fig.out.append(f'<clipPath id="{fig.uid}e{sd + 1}"><path d="{eye}"></path></clipPath><g clip-path="url(#{fig.uid}e{sd + 1})">'
                       + (f'<circle cx="{f(ex + sd * .2)}" cy="{f(ey - .4)}" r="2" fill="none" stroke="{YOU}" stroke-width="2.2" vector-effect="non-scaling-stroke" opacity=".6"></circle>' if detail >= 3 else '')
                       + f'<circle cx="{f(ex + sd * .2)}" cy="{f(ey - .4)}" r="2" {stroke(.6)}></circle>'
                       + f'<ellipse cx="{f(ex + sd * .2)}" cy="{f(ey - .4)}" rx=".5" ry="1.8" fill="{INK}"></ellipse></g>'
                       + f'<circle cx="{f(ex + sd * .2 + .7)}" cy="{f(ey - 1.3)}" r=".4" fill="{PAPER}"></circle>')
        brow = f'M{f(sd * 2.2)} {f(-183.6)} L{f(sd * 11.6)} {f(-187.4)} L{f(sd * 11)} {f(-185.2)} L{f(sd * 3)} {f(-182.2)} Z'   # heavy brow, angled down to the middle
        fig.out.append(f'<path d="{brow}" fill="{PAPER}" {stroke(1.1)[len("fill=\"none\" "):]}></path>')
        if detail >= 2:
            fig.out.append(f'<path d="M{f(ex - sd * 3)} {f(ey + 2)} Q{f(ex)} {f(ey + 3.6)} {f(ex + sd * 3.4)} {f(ey + .6)}" {stroke(.45, " opacity=\".8\"")}></path>')   # lower lid fold

def draw_front(uid, detail=2):
    fig = Figure(uid, detail)
    tail = Part([(-4, -78), (-20, -52), (-36, -24), (-52, -8), (-64, -3)], [12, 9, 6, 3, .8], per=12)   # swept out behind, left
    fig.part(tail, rings=10, pebbles=6, bands=True)
    torso = Part([(0, -86), (0, -102), (0, -121), (0, -137), (0, -150)], [32, 38, 39, 34, 21], per=14)
    fig.part(torso, rings=9, ring_from=.08, ring_to=.9, pebbles=6)
    if detail >= 2:   # belly plates down the midline
        fig.out.append(''.join(f'<path d="M-5 {y} Q0 {y + 1.6} 5 {y}" {stroke(.55, " opacity=\".8\"")}></path>' for y in range(-140, -92, 5)))
    for sd in (-1, 1):   # heavy thighs splay out over the belly; knees forward, so the shins read short
        fig.part(Part([(sd * 9, -98), (sd * 15, -82), (sd * 16, -64), (sd * 14.5, -46), (sd * 13.5, -28), (sd * 14, -4)], [22, 21, 14, 10.5, 9, 7], per=12), rings=10, pebbles=10)
        fig.out.append(f'<path d="M{sd * 17.4} -28 l{sd * 2.6} 2.4" {stroke(1.1)}></path>')   # hock spur
        for a, L in ((90 - sd * 30, 8), (90, 9), (90 + sd * 26, 7)):   # toes, foreshortened toward us
            r = math.radians(a); tip = (sd * 14 + L * math.cos(r), -5 + L * math.sin(r) * .6)
            fig.part(Part([(sd * 14, -6), tip], [4.8, 2.8], per=4), shade=False)
            fig.out.append(f'<path d="M{f(tip[0])} {f(tip[1])} l{f(math.cos(r) * 1.2)} {f(.9)}" {stroke(1.1)}></path>')
    sash = Part([(15, -146), (5, -128), (-6, -110), (-15, -96)], [4.2] * 4, per=10, cap=False)
    fig.part(sash, rings=10, shade=False)
    fig.out.append(f'<rect x="-18.5" y="-102" width="9" height="11" rx="1.6" fill="{PAPER}" transform="rotate(-30 -14 -96)" {stroke(1.2)[len("fill=\"none\" "):]}></rect>')
    fig.out.append(f'<circle cx="5.6" cy="-128.6" r="2.6" fill="{YOU}"></circle><circle cx="5.6" cy="-128.6" r="4.4" {stroke(.7)}></circle>')
    for sd in (-1, 1):
        fig.part(Part([(sd * 17, -143), (sd * 24, -131), (sd * 27.5, -118), (sd * 27.5, -109), (sd * 27, -104)], [10.5, 10, 6.8, 5.8, 4.8], per=8), rings=6, pebbles=5)
        fig.out.append(f'<path d="M{sd * 27.5 - 2.6} -108.4 h5.2 M{sd * 27.2 - 2.6} -105.6 h5.2" {stroke(.9)}></path>' if sd > 0 else '')   # wrist band, one arm
        front_hand(fig, (sd * 27, -104), sd)
    front_head(fig, detail)
    return fig.svg_defs(), ''.join(fig.out)

def draw_face(uid):
    fig = Figure(uid, 3)
    torso = Part([(0, -128), (0, -140), (0, -150)], [36, 33, 20], per=10)
    fig.part(torso, rings=4, pebbles=4)
    sash = Part([(15, -146), (9, -136), (3, -126)], [4.2] * 3, per=8, cap=False)
    fig.part(sash, rings=6, shade=False)
    front_head(fig, 3)
    return fig.svg_defs(), ''.join(fig.out)

def svg_of(drawer, width, height, view, extra='', label=''):
    _uids[0] += 1; uid = f'vey{_uids[0]}'
    defs, body = drawer(uid)
    return (f'<svg width="{width}" height="{height}" viewBox="{" ".join(f(v) for v in view)}" font-family="IBM Plex Mono, monospace" role="img" aria-label="{label}">'
            f'<defs>{defs}</defs>{body}{extra}</svg>')

def callouts(left, right, lx, rx, fs):
    tw = lambda t: len(t) * fs * .6; out = []
    for (px, py), ty, lab in left:
        out.append(f'<circle cx="{px}" cy="{py}" r="{fs * .17:.2f}" fill="{INK}"></circle><path d="M{px} {py} L{f(lx + tw(lab) + fs * .35)} {f(ty - fs * .3)}" {stroke(.5)}></path>'
                   f'<text x="{lx}" y="{ty}" font-size="{fs}" fill="{INK}">{lab}</text>')
    for (px, py), ty, lab in right:
        out.append(f'<circle cx="{px}" cy="{py}" r="{fs * .17:.2f}" fill="{INK}"></circle><path d="M{px} {py} L{f(rx - fs * .35)} {f(ty - fs * .3)}" {stroke(.5)}></path>'
                   f'<text x="{rx}" y="{ty}" font-size="{fs}" fill="{INK}">{lab}</text>')
    return ''.join(out)

def plate_front(width=358):
    vx, vy, vw, vh = -130, -226, 238, 238
    ex = shadow().replace('cx="4"', 'cx="0"').replace('rx="26"', 'rx="30"') + f'<line x1="{vx}" y1="0" x2="{vx + vw}" y2="0" {stroke(.9)}></line>'
    ex += f'<path d="M-124 0 V-200 M-126 -200 H-122" {stroke(.9)}></path>' + ''.join(f'<path d="M-124 {-k * 10} h{2.4 if k % 5 else 4}" {stroke(.6)}></path>' for k in range(1, 20))
    ex += f'<text x="-121" y="-98" font-size="4.6" fill="{MUTED}">1 m</text><text x="-121" y="-198" font-size="4.6" fill="{MUTED}">2 m</text>'
    ex += callouts([((-26, -208), -214, 'Two crests'), ((-7.2, -182), -178, 'Eyes face forward'),
                    ((5.6, -129), -150, 'The lamp'), ((-14, -96), -120, 'Pouch'), ((-52, -7), -40, 'Tail, behind')],
                   [((8, -171), -170, 'Long mouth'), ((31, -97), -106, 'Two thumbs'),
                    ((17, -80), -80, 'Heavy thighs'), ((15, -3), -20, 'On its toes')], -120, 40, 5.8)
    return svg_of(lambda u: draw_front(u, 2), width, width * vh / vw, (vx, vy, vw, vh), ex, 'Front view: one of Veyra’s people, facing us')

def portrait(width=358, height=358):
    vw = 84; vh = vw * height / width
    return svg_of(draw_face, width, height, (-vw / 2, -230, vw, vh), label='Portrait: a Veyran face, front on, crests raised')

def plate_face(width=358):
    vw, vh = 100, 100
    ex = callouts([((-22, -212), -222, 'Crest rays'), ((-18, -203), -212, 'Mood spots'), ((-12.8, -186), -196, 'Ear'),
                   ((-8, -186), -186, 'Brow ridge'), ((-7.2, -171), -174, 'Mouth, jaw-long'), ((-4, -152), -154, 'Throat folds')],
                  [((4, -194), -222, 'Crown scales'), ((7.4, -182.4), -190, 'Slit pupil'), ((9, -180.8), -182, 'Blue iris'),
                   ((1.2, -160.6), -164, 'Nostril slits'), ((10, -140), -144, 'Sash')], -49, 25, 2.7)
    return svg_of(draw_face, width, width, (-50, -232, vw, vh), ex, 'The face in close-up, with its parts named')

def thumb(size=56):
    # A portrait: the face and crests, for cards and lists.
    return svg_of(lambda u: draw_front(u, 1), size, size, (-30, -214, 60, 60), label='A Veyran, face and crests')
