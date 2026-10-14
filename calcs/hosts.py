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
        if not k or not G_ABS[k][0] - 0.5 <= float(r['absmag']) <= G_ABS[k][1] + 2: continue    # giants, or a wrong type
        ra, dec = float(r['ra']) * 15, float(r['dec'])
        if any(angle(g, ra, dec) < 0.1 and abs(g['d_pc'] / float(r['dist']) - 1) < 0.15 for g in gaia): continue
        name = r['proper'] or (f"{r['bf']}".strip() or f"HIP {r['hip']}")
        out.append(dict(id='HIP ' + r['hip'], name=name, kind=k, d_pc=float(r['dist']), ra=float(r['ra']) * 15,
                        dec=float(r['dec']), plx=1000 / float(r['dist']), e_plx=1.0, pmra=float(r['pmra']),
                        pmde=float(r['pmdec']), gabs=float(r['absmag']), lum=float(r['lum'])))
    return out

def name_from_hyg(star_list):
    """Give Gaia stars their common names: HYG within a tenth of a degree and a third in distance. HYG's old parallaxes
    for faint red dwarfs are often that far off: it puts GJ 1061 at 4.3 pc, where Gaia has 3.7. A star with no proper,
    Bayer, Flamsteed or Gliese name takes its HD number, then its HIP number."""
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
                    if angle(s, float(r['ra']) * 15, float(r['dec'])) < 0.1 and abs(float(r['dist']) / s['d_pc'] - 1) < 0.35:
                        options.append((abs(float(r['absmag']) + g_minus_v.get(s['kind'], -0.5) - s['gabs']), s['id'], r))
    named, taken = set(), set()
    by_id = {s['id']: s for s in star_list}
    for _, sid, r in sorted(options, key=lambda o: o[0]):
        if sid in named or r['id'] in taken: continue
        s = by_id[sid]
        s['name'] = r['proper'] or ' '.join(r['bf'].split()) or r['gl'] or (r['hd'] and f"HD {r['hd']}") or (r['hip'] and f"HIP {r['hip']}") or s['name']
        s['hip'] = r['hip']
        named.add(sid); taken.add(r['id'])
    same = collections.defaultdict(list)                      # HYG names both stars of some pairs alike: 61 Cyg
    for s in star_list:
        if s['id'] in named: same[s['name']].append(s)
    for name, pair in same.items():
        if len(pair) > 1:
            for letter, s in zip('ABCD', sorted(pair, key=lambda s: s['gabs'])): s['name'] = f'{name} {letter}'
    # HYG files the white dwarf Gliese 754.1 A's name under its red dwarf companion, LDS 678 B. The red dwarf is B.
    for s in star_list:
        if s['id'] == '4201781696994082944': s['name'] = 'Gl 754.1B'

# Known young stars within 50 ly. Gaia's FLAME ages are isochrone ages, which barely constrain K and M dwarfs:
# FLAME puts Epsilon Eridani near 7 billion years, where its spin and activity say 0.4 to 0.8.
YOUNG = {
    '16537': 'Epsilon Eridani, 0.4 to 0.8 Gyr',
    '15457': 'Kappa1 Ceti, 0.3 to 0.6 Gyr',
    '42438': 'Pi1 Ursae Majoris, Ursa Major group, about 0.4 Gyr',
    '27913': 'Chi1 Orionis, Ursa Major group, about 0.4 Gyr',
    '102409': 'AU Microscopii, about 0.02 Gyr',
    '113283': 'TW Piscis Austrini, Fomalhaut B, about 0.44 Gyr',
    '25647': 'AB Doradus, about 0.15 Gyr',
    # Added 2026-10-10 from a cross-check against published ages and young-group lists (HOLOS_RESEARCH.md, Ages of
    # nearby stars). Keys are Hipparcos numbers, or Gaia ids for stars without one.
    '544': 'HD 166 (Gl 5), Hercules-Lyra, about 0.2 Gyr',
    '13402': 'HD 17925 (Gl 117), Hercules-Lyra, about 0.15 Gyr',
    '72659': 'Xi Bootis A, about 0.25 Gyr',
    '26779': 'HD 37394 (Gl 211), about 0.5 Gyr',
    '25278': '111 Tauri, about 0.3 Gyr',
    '23693': 'Zeta Doradus, about 0.5 Gyr',
    '21818': 'HD 29697 (Gl 174), about 0.25 Gyr',
    '42808': 'HD 74576 (Gl 320), about 0.5 Gyr',
    '55454': 'HD 98712 (Gl 425 A), about 0.3 Gyr',
    '37349': 'HD 61606 (Gl 282 A), about 0.45 Gyr, from activity alone: the weakest entry',
    '102141': 'AT Microscopii, Beta Pictoris group, about 0.02 Gyr',
    '22738': 'GJ 2036, AB Doradus group, about 0.15 Gyr',
    '110526': 'Wolf 1225 (Gl 856), AB Doradus group, about 0.15 Gyr',
    '6623351805412369024': 'Fomalhaut C, about 0.44 Gyr',
    '2886233695250041216': 'AP Columbae, Argus, about 0.04 Gyr',
    '5605469299570245504': 'GJ 2060 C, AB Doradus group, about 0.15 Gyr',
    # Added 2026-10-12, under the rule settled that day: a star leaves only when every published age is under a
    # billion years, error bars included, and at least one comes from a method built for its kind of star. Ages
    # counted: spin, activity, X-rays, lithium, surface gravity, and the age of a star it is bound to. Not counted:
    # main-sequence position for K and M stars, survey pipeline fits, assumed defaults, and the spin or activity of a
    # star whose close companion's tides set it. An activity relation fit to Sun-like stars and pushed onto a redder
    # one can keep a star, but can't drop one alone. Sources in HOLOS_RESEARCH.md, Ages of nearby stars.
    # Corrected 2026-10-13: spin, activity and X-rays don't date a fully convective red dwarf, under about 0.35 Suns.
    # Those stay fast and active for billions of years (Pass et al. 2024, Medina et al. 2022), so 15 red dwarfs dropped
    # the day before on such ages alone are hosts again, Ross 154 and EV Lacertae among them.
    # And a fast spin dates no red dwarf: it says only that the star has not yet settled onto the slow sequence, and
    # about a quarter of 0.35 to 0.5 Sun stars are still fast at 0.7 billion years (Douglas et al. 2017, 2019). So
    # AD Leonis, GT Pegasi, GJ 4337 A with GJ 4338 B, and OT Serpentis are hosts again too. Those below stay out: each
    # is dated by a slow, settled spin, by a bound companion, or by its brightness above the main sequence.
    '46580': 'HD 82106 (Gl 349), 0.2 to 0.9 Gyr from spin, activity and X-rays',
    '26335': 'Gliese 208, 0.15 to 0.8 Gyr, near 0.5 from its 12.3 day spin. Earth knocked here',
    '892348454394856064': 'YY Geminorum (Castor C), 0.29 to 0.37 Gyr, the age of Castor A and B',
    '63510': 'DT Virginis (Gl 494, Ross 458), 0.13 to 0.8 Gyr',
    '72944': 'GJ 569 A, 0.1 to 0.8 Gyr, with its brown dwarf pair',
    '53985': 'DS Leonis (Gl 410), 0.06 to 0.8 Gyr',
    '37766': 'YZ Canis Minoris (Gl 285), 0.02 to 0.5 Gyr: brighter than the main sequence, as a star still settling is',
}

# Stars with a white dwarf companion are judged in calcs/scorch.py: the companion was a giant first, and lit the warm
# zone from closer in. A star leaves the list if its zone could not hold planets then or now, or if the zone was
# scorched under a billion years ago: the same clock as a young star.

# ---------- Ages, from Gaia DR3 FLAME ----------
def flame():
    rows = {}
    for r in csv.DictReader((CACHE / 'gaia-flame-50ly.csv').open()):
        rows[r['source_id']] = r
    return rows

# ---------- Ages good enough to date a world, from the HAges Catalog ----------
# Ware et al. 2026 compile published ages for the Habitable Worlds Observatory's 659 likeliest targets, from the two
# methods that reach about 20%: asteroseismology and spin. 127 stars have one. Asteroseismology is preferred: for
# stars past about 6 Gyr, spin ages run about 47% low. Gaia's FLAME ages above are not used for this. On the 9 hosts
# that have both, the two differ by a median of 4.7 Gyr.
def published_ages():
    out = {}
    for r in csv.DictReader((CACHE / 'hages' / 'HAges_Catalog_Overview.csv').open(encoding='utf-8-sig')):
        sid = r['gaia_dr3_id'].replace('Gaia DR3', '').strip()
        if r['med_age_seis']: out[sid] = (float(r['med_age_seis']), 'asteroseismology')
        elif r['med_age_gyro']: out[sid] = (float(r['med_age_gyro']), 'spin')
    return out

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
    """Holman and Wiegert 1999: the widest stable orbit around one star, as a share of the binary's separation.
    Their fit covers e up to 0.8. Beyond it, scale with the closest approach, a(1 - e)."""
    if e > 0.8: return critical_a(mu, 0.8) * (1 - e) / 0.2
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

# Gaia's parallax for HD 10307 is 68.0 mas, with an error 15 times its neighbors': it is an astrometric binary with a
# 20-year orbit. Hipparcos has 78.5 mas, and calcs/knocks.py uses it too, since Earth knocked on this star in 2003.
# FLAME's luminosity scales with the distance squared.
HIPPARCOS = {'348515297330773120': ('HD 10307', 12.74)}
def hipparcos(star_list):
    for s in star_list:
        if s['id'] in HIPPARCOS:
            name, d = HIPPARCOS[s['id']]
            s.update(name=name, lum_scale=(d / s['d_pc']) ** 2, gabs=s['gabs'] + 5 * math.log10(d / s['d_pc']), d_pc=d, plx=1000 / d)

def main():
    s_list = stars()
    name_from_hyg(s_list)
    hipparcos(s_list)
    import binaries, scorch
    ages, pl, pairs, close = flame(), planets(), companions(s_list), binaries.close_orbits(s_list)
    kept, dropped, dated = [], collections.Counter(), published_ages()
    for s in [s for s in s_list if s['kind']]:
        f = ages.get(s['id'], {})
        lum = float(f['lum_flame']) * s.get('lum_scale', 1) if f.get('lum_flame') else s.get('lum') or 10 ** (-0.4 * (s['gabs'] - 4.67))
        inner, outer = hz(lum)
        why = None
        hips = {s.get('hip'), s['id'].replace('HIP ', '')} | {x for o, _ in pairs.get(s['id'], []) for x in (o.get('hip'), o['id'])}
        if hips & set(YOUNG):                                      # a young star's companions are young too
            why = 'younger than 1 Gyr'
        elif s['id'] in scorch.PAIRS:
            why = scorch.judge(s, scorch.PAIRS[s['id']], (inner, outer))['why']
        elif s['kind'] in 'FG' and f.get('age_flame_upper') and float(f['age_flame_upper']) < 1.0:
            why = 'younger than 1 Gyr'
        for o, sep in pairs.get(s['id'], []):
            m1, m2 = mass_from_gabs(s['gabs']), mass_from_gabs(o['gabs'])
            if critical_a(m2 / (m1 + m2)) * sep < inner:
                why = why or 'companion too close for a stable warm zone'
        if s['id'] in close and not binaries.zone_left(mass_from_gabs(s['gabs']), inner, outer, close[s['id']]):
            why = why or 'a close companion leaves no stable warm zone (ORB6, SB9)'
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
        w.writerow(['id', 'name', 'kind', 'distance_ly', 'luminosity', 'warm_zone_au', 'age_gyr', 'weight', 'age_pub_gyr', 'age_pub_by'])
        for s in sorted(kept, key=lambda s: s['d_pc']):
            w.writerow([s['id'], s['name'], s['kind'], f"{s['d_pc'] * LY_PC:.2f}", f"{s['lum']:.3g}",
                        f"{s['hz_in']:.2f}-{s['hz_out']:.2f}", s['age'][:4] if s['age'] else '', s['weight'], *dated.get(s['id'], ('', ''))])
    print(f"  {sum(s['id'] in dated for s in kept)} hosts have a published age from asteroseismology or spin (HAges).")
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
