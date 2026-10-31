"""How high a mind's chance to spread can go before some mind fills the Galaxy and Earth is settled.
Run: python3 calcs/spread_limit.py

calcs/minds.py's family tree, solved exactly rather than drawn: a settlement spreads with chance p, settles a Poisson
count of stars in reach, and each colony's chance is its parent's times e^N(0, 0.3), capped at 1 (Landis 1998, with
inheritance). f(p), the chance a tree starting at p never dies out, solves f(p) = p (1 - e^(-n E[f(p')])), on a grid in
log p. A tree that never dies out fills the Galaxy. With chances drawn evenly in log from 1 in 1,000 to a top, the top
is where the Galaxy's minds expect about 0.44 fillers, the line the 2026-10-30 run drew for 200,000 minds.
"""
import math

def survival(n, sd=0.3, steps=900):
    lo = math.log(1e-6); dx = -lo / (steps - 1)
    p = [math.exp(lo + i * dx) for i in range(steps)]
    K = int(6 * sd / dx); ks = range(-K, K + 1)
    w = [math.exp(-(j * dx) ** 2 / (2 * sd * sd)) for j in ks]; s = sum(w); w = [v / s for v in w]
    f = [1.0] * steps
    for _ in range(300):        # down from 1 to the smallest fixed point
        f = [p[i] * -math.expm1(-n * sum(wj * f[min(steps - 1, max(0, i + j))] for wj, j in zip(w, ks))) for i in range(steps)]
    return p, f

def top(n, minds, line=0.44, floor=1e-3):
    p, f = survival(n)
    for k in range(len(p)):
        if p[k] < floor * 1.01: continue
        inside = [f[i] for i in range(len(p)) if floor <= p[i] <= p[k]]
        if sum(inside) / len(inside) * minds > line: return p[k]

if __name__ == '__main__':
    for life, n in (('20,000-year', 6 + 20_000 / 11_000), ('million-year', 6 + 1e6 / 11_000)):
        for minds in (2e5, 1.25e8):
            print(f'{life} lives, {minds:,.0f} minds: a chance under about 1 in {1 / top(n, minds):.0f}')
