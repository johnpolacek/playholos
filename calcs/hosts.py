"""Which stars within 50 ly could host a neighbor? For v2 open question 4. Run: python3 calcs/hosts.py

Reads the census (.cache/gcns-100ly.csv, .cache/hygdata_v41.csv) and what calcs/fetch_hosts.py cached:
Gaia DR3 FLAME ages and luminosities, and known planets from the NASA Exoplanet Archive.
Writes data/hosts-50ly.csv. Sources are in HOLOS_RESEARCH.md.
"""
import csv, math, re, collections
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.cache'
LY_PC = 3.261563777
PC_50LY = 50 / LY_PC
LY = 9.4607e15
JY = 1e-26

# Per-star weight. G and K dwarfs are the known case. Late F stars live 3 to 7 billion years, shorter than Earth took
# to make minds. Rocky planets close to M dwarfs keep turning out airless in JWST's surveys, though temperate ones are
# still open. Earlier than F5, and white and brown dwarfs, weigh nothing.
WEIGHT = {'F': 0.5, 'G': 1.0, 'K': 1.0, 'M': 0.1}
# Gaia BP-RP along the dwarf sequence (Pecaut and Mamajek): F5 0.59, G0 0.75, K0 0.98, M0 1.84, past M9 about 4.5.
def kind_from_color(bp_rp):
    if bp_rp < 0.59: return None
    if bp_rp < 0.75: return 'F'
    if bp_rp < 0.98: return 'G'
    if bp_rp < 1.84: return 'K'
    if bp_rp < 4.5: return 'M'
    return None

G_ABS = {'F': (1.0, 4.6), 'G': (1.5, 6.3), 'K': (3.0, 9.0), 'M': (7.0, 17.0)}

def kind_from_spect(spect):
    m = re.match(r'([OBAFGKM])(\d(\.\d)?)?', spect.strip())
    if not m: return None
    if m.group(1) == 'F' and m.group(2) and float(m.group(2)) < 5: return None
    if re.search(r'Ia|Ib|II', spect): return None
    return m.group(1) if m.group(1) in WEIGHT else None

def angle(s, ra, dec):
    """Degrees between a star and a position on the sky."""
    c = (math.sin(math.radians(s['dec'])) * math.sin(math.radians(dec)) +
         math.cos(math.radians(s['dec'])) * math.cos(math.radians(dec)) * math.cos(math.radians(s['ra'] - ra)))
    return math.degrees(math.acos(max(-1, min(1, c))))

def stars():
    """Every object within 50 ly, Gaia first, bright Hipparcos stars from HYG where Gaia has none.
    Possible hosts carry a kind. The rest, white dwarfs and brown dwarfs among them, still count as companions."""
    out = []
    for r in csv.DictReader((CACHE / 'gcns-100ly.csv').open()):
        xyz = (float(r['xcoord50']), float(r['ycoord50']), float(r['zcoord50']))
        d = math.dist((0, 0, 0), xyz)
        if d > PC_50LY: continue
        bp, rp = r['BPmag'], r['RPmag']
        white = r['WDprob'] and float(r['WDprob']) > 0.5
        k = None if white or not bp or not rp else kind_from_color(float(bp) - float(rp))
        # A color that disagrees with the brightness is bad photometry or not a dwarf: absolute G per kind,
        # roomy enough for subgiants (Pecaut and Mamajek).
        if k and r['Gmag']:
            g_abs = float(r['Gmag']) + 5 * math.log10(float(r['Plx']) / 100)
            low, high = G_ABS[k]
            if not low <= g_abs <= high: k = None
        num = lambda v: float(v) if v else None
        out.append(dict(id=r['GaiaEDR3'], name='Gaia ' + r['GaiaEDR3'], kind=k, d_pc=d,
                        ra=float(r['RA_ICRS']), dec=float(r['DE_ICRS']), plx=float(r['Plx']), e_plx=float(r['e_Plx']),
                        pmra=num(r['pmRA']), pmde=num(r['pmDE']),
                        gabs=float(r['Gmag']) + 5 * math.log10(float(r['Plx']) / 100) if r['Gmag'] else 15.0))
    gaia = list(out)
    gaia_bright = 2.1                       # GCNS has nothing brighter; HYG fills these in
    for r in csv.DictReader((CACHE / 'hygdata_v41.csv').open()):
        if not r['hip'] or not r['dist'] or not 0 < float(r['dist']) <= PC_50LY or float(r['mag']) > gaia_bright + 2: continue
        k = kind_from_spect(r['spect'])
        if not k: continue
        ra, dec = float(r['ra']) * 15, float(r['dec'])
        if any(angle(g, ra, dec) < 0.1 and abs(g['d_pc'] / float(r['dist']) - 1) < 0.15 for g in gaia): continue
        name = r['proper'] or (f"{r['bf']}".strip() or f"HIP {r['hip']}")
        out.append(dict(id='HIP ' + r['hip'], name=name, kind=k, d_pc=float(r['dist']), ra=float(r['ra']) * 15,
                        dec=float(r['dec']), plx=1000 / float(r['dist']), e_plx=1.0, pmra=float(r['pmra']),
                        pmde=float(r['pmdec']), gabs=float(r['absmag']), lum=float(r['lum'])))
    return out

def name_from_hyg(star_list):
    """Give Gaia stars their common names: HYG within a tenth of a degree and 10% in distance."""
    hyg = [r for r in csv.DictReader((CACHE / 'hygdata_v41.csv').open()) if r['dist'] and 0 < float(r['dist']) <= PC_50LY * 1.1]
    cells = collections.defaultdict(list)
    for r in hyg: cells[(round(float(r['ra']) * 15), round(float(r['dec'])))].append(r)
    # Gaia's G runs brighter than HYG's V, most for red stars. Within a pair, match brightest to brightest, one to one.
    g_minus_v = {'F': 0.0, 'G': -0.15, 'K': -0.35, 'M': -1.2}
    options = []
    for s in star_list:
        if not s['id'].isdigit(): continue
        for dra in (-1, 0, 1):
            for dde in (-1, 0, 1):
                for r in cells[(round(s['ra']) + dra, round(s['dec']) + dde)]:
                    if angle(s, float(r['ra']) * 15, float(r['dec'])) < 0.1 and abs(float(r['dist']) / s['d_pc'] - 1) < 0.1:
                        options.append((abs(float(r['absmag']) + g_minus_v.get(s['kind'], -0.5) - s['gabs']), s['id'], r))
    named, taken = set(), set()
    by_id = {s['id']: s for s in star_list}
    for _, sid, r in sorted(options, key=lambda o: o[0]):
        if sid in named or r['id'] in taken: continue
        s = by_id[sid]
        s['name'] = r['proper'] or ' '.join(r['bf'].split()) or r['gl'] or s['name']
        s['hip'] = r['hip']
        named.add(sid); taken.add(r['id'])
    same = collections.defaultdict(list)                      # HYG names both stars of some pairs alike: 61 Cyg
    for s in star_list:
        if s['id'] in named: same[s['name']].append(s)
    for name, pair in same.items():
        if len(pair) > 1:
            for letter, s in zip('ABCD', sorted(pair, key=lambda s: s['gabs'])): s['name'] = f'{name} {letter}'

# Known young stars within 50 ly. Gaia's FLAME ages are isochrone ages, which barely constrain K and M dwarfs:
# FLAME puts Epsilon Eridani near 7 billion years, where its spin and activity say 0.4 to 0.8.
YOUNG = {
    '16537': 'Epsilon Eridani, 0.4 to 0.8 Gyr',
    '15457': 'Kappa1 Ceti, 0.3 to 0.6 Gyr',
    '42438': 'Pi1 Ursae Majoris, Ursa Major group, about 0.4 Gyr',
    '27913': 'Chi1 Orionis, Ursa Major group, about 0.4 Gyr',
    '102409': 'AU Microscopii, about 0.02 Gyr',
    '113283': 'TW Piscis Austrini, Fomalhaut B, about 0.44 Gyr',
}

# ---------- Ages, from Gaia DR3 FLAME ----------
def flame():
    rows = {}
    for r in csv.DictReader((CACHE / 'gaia-flame-50ly.csv').open()):
        rows[r['source_id']] = r
    return rows

# ---------- Wide binaries, found in the census ----------
# A pair counts as bound when its parallaxes agree within 3 sigma and its motion across the sky differs by less than
# a bound orbit allows: about 2.1 km/s at 1,000 AU, falling as the square root of the separation (El-Badry et al. 2021).
def companions(star_list):
    pairs = collections.defaultdict(list)
    by_cell = collections.defaultdict(list)
    for s in star_list: by_cell[(int(s['ra']), int(s['dec']))].append(s)
    for s in [s for s in star_list if s['kind']]:
        for dra in (-1, 0, 1):
            for dde in (-1, 0, 1):
                for o in by_cell[(int(s['ra']) + dra, int(s['dec']) + dde)]:
                    if o is s: continue
                    theta = math.degrees(math.acos(min(1, math.sin(math.radians(s['dec'])) * math.sin(math.radians(o['dec'])) +
                            math.cos(math.radians(s['dec'])) * math.cos(math.radians(o['dec'])) * math.cos(math.radians(s['ra'] - o['ra']))))) * 3600
                    sep_au = theta * s['d_pc']
                    if sep_au > 20000 or abs(s['plx'] - o['plx']) > 3 * math.hypot(s['e_plx'], o['e_plx']) + 0.5 + 0.03 * s['plx']: continue
                    if None in (s['pmra'], o['pmra']): dv = 0     # no motion known: trust the parallaxes
                    else: dv = 4.74 * math.hypot(s['pmra'] - o['pmra'], s['pmde'] - o['pmde']) / s['plx']
                    if dv < 2.1 * (max(sep_au, 1) / 1000) ** -0.5 + 0.5:
                        pairs[s['id']].append((o, sep_au))
    return pairs

def mass_from_gabs(g):
    """Main-sequence mass from absolute G, rough: the Sun is G 4.67."""
    return max(0.08, min(1.6, 10 ** (-0.1 * (g - 4.67))))

def critical_a(mu, e=0.5):
    """Holman and Wiegert 1999: the widest stable orbit around one star, as a share of the binary's separation."""
    return 0.464 - 0.380 * mu - 0.631 * e + 0.586 * mu * e + 0.150 * e * e - 0.198 * mu * e * e

# ---------- Known planets ----------
def planets():
    by_host = collections.defaultdict(list)
    for r in csv.DictReader((CACHE / 'exoplanets-50ly.csv').open()):
        gid = r['gaia_dr3_id'].replace('Gaia DR3 ', '').strip()
        by_host[gid or r['hostname']].append(r)
        if r['hip_name']: by_host[r['hip_name'].replace(' ', ' ')].append(r)
    return by_host

def hz(lum):
    """Conservative warm zone, after Kopparapu et al. 2013, in AU."""
    return 0.95 * math.sqrt(lum), 1.67 * math.sqrt(lum)

def main():
    s_list = stars()
    name_from_hyg(s_list)
    ages, pl, pairs = flame(), planets(), companions(s_list)
    kept, dropped = [], collections.Counter()
    for s in [s for s in s_list if s['kind']]:
        f = ages.get(s['id'], {})
        lum = float(f['lum_flame']) if f.get('lum_flame') else s.get('lum') or 10 ** (-0.4 * (s['gabs'] - 4.67))
        inner, outer = hz(lum)
        why = None
        if s.get('hip') in YOUNG or s['id'].replace('HIP ', '') in YOUNG:
            why = 'younger than 1 Gyr'
        elif s['kind'] in 'FG' and f.get('age_flame_upper') and float(f['age_flame_upper']) < 1.0:
            why = 'younger than 1 Gyr'
        for o, sep in pairs.get(s['id'], []):
            m1, m2 = mass_from_gabs(s['gabs']), mass_from_gabs(o['gabs'])
            if critical_a(m2 / (m1 + m2)) * sep < inner:
                why = why or 'companion too close for a stable warm zone'
        for p in pl.get(s['id'], []) + pl.get(s['name'], []):
            m, a = p['pl_bmasse'], p['pl_orbsmax']
            if not m or not a or float(m) < 10: continue
            e = float(p['pl_orbeccen'] or 0)
            if float(a) * (1 - e) < 1.3 * outer and float(a) * (1 + e) > 0.7 * inner:
                why = why or 'a known giant crosses the warm zone'
        if why: dropped[(s['kind'], why)] += 1
        else: kept.append(dict(s, lum=lum, hz_in=inner, hz_out=outer, age=f.get('age_flame', '') if s['kind'] in 'FG' else '', weight=WEIGHT[s['kind']]))
    by_kind = collections.Counter(s['kind'] for s in kept)
    print(f"Within 50 ly: {len(kept)} stars could host a neighbor: " + ', '.join(f'{k} {by_kind[k]}' for k in 'FGKM') +
          f". Weighted, about {sum(s['weight'] for s in kept):.0f} G-star equivalents.")
    for (k, why), n in sorted(dropped.items()): print(f'  dropped {n} {k}: {why}')
    out = ROOT / 'data' / 'hosts-50ly.csv'
    with out.open('w', newline='') as fh:
        w = csv.writer(fh)
        w.writerow(['id', 'name', 'kind', 'distance_ly', 'luminosity', 'warm_zone_au', 'age_gyr', 'weight'])
        for s in sorted(kept, key=lambda s: s['d_pc']):
            w.writerow([s['id'], s['name'], s['kind'], f"{s['d_pc'] * LY_PC:.2f}", f"{s['lum']:.3g}",
                        f"{s['hz_in']:.2f}-{s['hz_out']:.2f}", s['age'][:4] if s['age'] else '', s['weight']])
    print(f'  wrote {out.relative_to(ROOT)}')

# ---------- How loud a neighbor may be ----------
# Earth heard nothing by 2040. Suppose by then SKA-Mid had stared an hour at every star within 50 ly, searching
# 1 Hz channels. A neighbor's steady tones must stay under that floor, as of the light that reached Earth by 2040.
def loudness_ceiling():
    f = 10 * 1.1 * JY * math.sqrt(1 / (2 * 3600))
    print("Ceiling on a neighbor's tones, given Earth heard nothing by 2040: " +
          ', '.join(f'{d} ly {4 * math.pi * (d * LY) ** 2 * f / 1e6:,.0f} MW' for d in (5, 10, 20, 30, 50)))

if __name__ == '__main__':
    main(); print()
    loudness_ceiling()
