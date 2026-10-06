"""Which stars within 50 ly could host a neighbor? A first pass for v2 open question 4. Run: python3 calcs/hosts.py

Uses HYG 4.1 spectral types (.cache/hygdata_v41.csv). Still to add: ages, binary orbits and known planets.
Sources are in HOLOS_RESEARCH.md.
"""
import csv, math, re, collections
from pathlib import Path

LY_PC = 3.261563777
LY = 9.4607e15
JY = 1e-26
ROOT = Path(__file__).resolve().parents[1]

# Per-star weight, before ages, binaries and planets. G and K dwarfs are the known case. Late F stars live
# 3 to 7 billion years, shorter than Earth took to make minds. Rocky planets close to M dwarfs keep turning out
# airless in JWST's surveys, though temperate ones are still open.
WEIGHT = {'F': 0.5, 'G': 1.0, 'K': 1.0, 'M': 0.1}

def kind(spect):
    m = re.match(r'([OBAFGKM])(\d(\.\d)?)?', spect.strip())
    if not m: return None, None
    sub = float(m.group(2)) if m.group(2) else 5.0
    if re.search(r'Ia|Ib|II', spect): return m.group(1), 'giant'
    if 'IV' in spect and 'IV-V' not in spect: return m.group(1), 'subgiant'
    return m.group(1), sub

def hosts():
    rows = [r for r in csv.DictReader((ROOT / '.cache/hygdata_v41.csv').open())
            if r['dist'] and 0 < float(r['dist']) * LY_PC <= 50]
    systems = collections.defaultdict(list)
    for r in rows:
        k, sub = kind(r['spect'])
        if k in WEIGHT and sub not in ('giant',) and not (k == 'F' and isinstance(sub, float) and sub < 5):
            systems[r['comp_primary']].append((k, sub, r))
    by_kind = collections.Counter()
    weight = 0
    for comps in systems.values():
        best = max(comps, key=lambda c: WEIGHT[c[0]])
        by_kind[best[0]] += 1
        weight += WEIGHT[best[0]]
    subgiants = sum(1 for comps in systems.values() for c in comps if c[1] == 'subgiant')
    print(f'Within 50 ly, typed in HYG: {sum(by_kind.values())} systems with an F5 to M star, '
          + ', '.join(f'{k} {by_kind[k]}' for k in 'FGKM') + f'. Weighted, about {weight:.0f} G-star equivalents.')
    print(f'  {subgiants} subgiants are kept: they brighten, but slowly. Untyped faint stars are mostly M dwarfs, left out here.')

# ---------- How loud a neighbor may be ----------
# Earth heard nothing by 2040. Suppose by then SKA-Mid had stared an hour at every star within 50 ly, searching
# 1 Hz channels. A neighbor's steady tones must stay under that floor, as of the light that reached Earth by 2040.
def loudness_ceiling():
    f = 10 * 1.1 * JY * math.sqrt(1 / (2 * 3600))
    print("Ceiling on a neighbor's tones, given Earth heard nothing by 2040: " +
          ', '.join(f'{d} ly {4 * math.pi * (d * LY) ** 2 * f / 1e6:,.0f} MW' for d in (5, 10, 20, 30, 50)))

if __name__ == '__main__':
    hosts(); print()
    loudness_ceiling()
