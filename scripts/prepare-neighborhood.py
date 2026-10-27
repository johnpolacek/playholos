"""Build the v1 game region's star census: every object within 100 ly of the Sun.

Sources (download into .cache first; the exact queries are in
data/neighborhood-sources/):
  .cache/gcns-100ly.csv          Gaia Catalogue of Nearby Stars, Dist50 <= 31 pc
  .cache/gcns-all-positions.csv  the full GCNS positions, used only for matching
  .cache/hygdata_v41.csv         HYG 4.1, for bright stars Gaia does not measure
"""
import collections, csv, json, math, struct
from pathlib import Path

root = Path(__file__).resolve().parents[1]
PC_LY = 3.261563777
RADIUS_LY, SEED_LY = 100, 50
EPOCH_SHIFT_YEARS = 16  # HYG J2000.0 positions moved to Gaia's J2016.0 epoch
LANDMARKS = {'Sirius': 'Sirius', 'Rigil Kentaurus': 'Alpha Centauri', 'Proxima Centauri': 'Proxima Centauri',
    "Barnard's Star": "Barnard's Star", 'Wolf 359': 'Wolf 359', 'Procyon': 'Procyon', 'Ran': 'Epsilon Eridani',
    'Gl 71': 'Tau Ceti', 'Altair': 'Altair', 'Vega': 'Vega', 'Fomalhaut': 'Fomalhaut', 'Arcturus': 'Arcturus',
    'Pollux': 'Pollux', 'Capella': 'Capella', 'Castor': 'Castor', 'Aldebaran': 'Aldebaran', 'Regulus': 'Regulus'}

def unit(ra, dec):
    ra, dec = math.radians(ra), math.radians(dec)
    return (math.cos(dec) * math.cos(ra), math.cos(dec) * math.sin(ra), math.sin(dec))

def separation(u, v):
    return math.degrees(math.acos(max(-1, min(1, sum(a * b for a, b in zip(u, v)))))) * 3600

def atlas(x, y, z):
    # Galactic X, Y, Z in parsecs -> the atlas's (X, Z, -Y) in light-years.
    return [x * PC_LY, z * PC_LY, -y * PC_LY]

def g_minus_v(bp_rp):
    # Riello et al. (2021), G - V as a cubic in BP - RP, valid for -0.5 to 2.75.
    x = max(-.5, min(2.75, bp_rp))
    return -.02704 + .01424 * x - .2156 * x * x + .01426 * x ** 3

# Approximate dwarf-sequence colors (Mamajek's table), used only to tint points.
BP_RP_TO_BV = [(-.1, -.14), (0, 0), (.45, .3), (.82, .65), (.98, .82), (1.43, 1.15), (1.84, 1.42), (2.4, 1.49), (3, 1.65), (4, 1.9), (4.8, 2.1)]
def b_minus_v(bp_rp):
    points = BP_RP_TO_BV
    if bp_rp <= points[0][0]: return points[0][1]
    for (x0, y0), (x1, y1) in zip(points, points[1:]):
        if bp_rp <= x1: return y0 + (y1 - y0) * (bp_rp - x0) / (x1 - x0)
    return points[-1][1]

# The census itself: every GCNS object whose median position lies inside 100 ly.
census, points = [], []
for row in csv.DictReader((root / '.cache/gcns-100ly.csv').open()):
    xyz = [float(row[k]) for k in ('xcoord50', 'ycoord50', 'zcoord50')]
    distance_ly = math.hypot(*xyz) * PC_LY
    if distance_ly > RADIUS_LY: continue
    white_dwarf = float(row['WDprob'] or 0) > .5
    # Missing BP/RP photometry: assume a typical color for the object's class.
    bp_rp = float(row['BPmag']) - float(row['RPmag']) if row['BPmag'] and row['RPmag'] else (.3 if white_dwarf else 2.5)
    g = float(row['Gmag']) if row['Gmag'] else 20.5
    census.append(dict(source='gaia', white_dwarf=white_dwarf, distance=distance_ly, pos=atlas(*xyz)))
    points.extend([*atlas(*xyz), g - g_minus_v(bp_rp), b_minus_v(bp_rp)])
gaia_count = len(census)

# Index every GCNS position (out to 100 pc) so a HYG star counts as measured by
# Gaia even when Gaia places it outside the region.
cell, grid = .01, collections.defaultdict(list)
for row in csv.DictReader((root / '.cache/gcns-all-positions.csv').open()):
    u = unit(float(row['RA_ICRS']), float(row['DE_ICRS']))
    xyz = [float(row[k]) for k in ('xcoord50', 'ycoord50', 'zcoord50')]
    grid[tuple(math.floor(c / cell) for c in u)].append((u, float(row['Gmag'] or 99), math.hypot(*xyz) * PC_LY, xyz))

def gaia_counterpart(star):
    ra, dec = float(star['ra']) * 15, float(star['dec'])
    years = EPOCH_SHIFT_YEARS / 3.6e6
    u = unit(ra + float(star['pmra'] or 0) * years / max(1e-6, math.cos(math.radians(dec))), dec + float(star['pmdec'] or 0) * years)
    key, v, d, best = tuple(math.floor(c / cell) for c in u), float(star['mag']), float(star['dist']) * PC_LY, None
    for dx in (-1, 0, 1):
        for dy in (-1, 0, 1):
            for dz in (-1, 0, 1):
                for w, g, gaia_d, xyz in grid[(key[0] + dx, key[1] + dy, key[2] + dz)]:
                    s = separation(u, w)
                    # HYG proper motions leave residuals up to ~20" for the fastest
                    # stars. Reject companions by brightness and by distance.
                    if s > 60 or not -1 <= v - g <= 4.5 or (s > 3 and abs(gaia_d - d) > .35 * d): continue
                    if best is None or s < best[0]: best = (s, xyz)
    return best

# Supplement: Hipparcos stars (via HYG) that Gaia did not measure, mostly the
# brightest stars. Gliese-only HYG entries are not added: without Hipparcos
# astrometry, an unmatched faint entry is more likely a duplicate component or
# a mis-estimated distance than a star Gaia missed.
landmarks = []
for star in csv.DictReader((root / '.cache/hygdata_v41.csv').open()):
    d = float(star['dist']) * PC_LY
    if not 0 < d <= RADIUS_LY + 5: continue
    key = star['proper'] or star['gl']
    match = gaia_counterpart(star) if star['hip'] or key in LANDMARKS else None
    added = bool(star['hip']) and match is None and d <= RADIUS_LY
    if added:
        ra, dec = math.radians(float(star['ra']) * 15), math.radians(float(star['dec']))
        eq = [d * math.cos(dec) * math.cos(ra), d * math.cos(dec) * math.sin(ra), d * math.sin(dec)]
        # ICRS -> Galactic, the same IAU matrix as prepare-catalog.py.
        rotation = [(-.0548755604, -.8734370902, -.4838350155), (.4941094279, -.4448296300, .7469822445), (-.8676661490, -.1980763734, .4559837762)]
        gal = [sum(a * b for a, b in zip(r, eq)) for r in rotation]
        pos = [gal[0], gal[2], -gal[1]]
        census.append(dict(source='hyg', white_dwarf=False, distance=d, pos=pos))
        points.extend([*pos, float(star['mag']), float(star['ci']) if star['ci'] else .65])
    if key in LANDMARKS and (match or added):
        pos = atlas(*match[1]) if match else pos
        landmarks.append(dict(name=LANDMARKS[key], hyg=int(star['id']), pos=[round(v, 5) for v in pos],
            distance=round(math.hypot(*pos), 4), source='Gaia EDR3' if match else 'Hipparcos via HYG'))

(root / 'data/neighborhood.bin').write_bytes(struct.pack('<' + 'f' * len(points), *points))
within_seed = sum(s['distance'] <= SEED_LY for s in census)
meta = dict(radiusLy=RADIUS_LY, seedRadiusLy=SEED_LY, count=len(census), withinSeed=within_seed,
    gaia=gaia_count, hipparcosSupplement=len(census) - gaia_count, whiteDwarfs=sum(s['white_dwarf'] for s in census),
    epoch='J2016.0 (Gaia EDR3); HYG supplement at J2000.0',
    fields=['galacticX_ly', 'galacticZ_ly', 'negativeGalacticY_ly', 'approxVisualMagnitude', 'approxBVColorIndex'],
    sources=dict(gaia='Gaia Collaboration, Smart et al. (2021), A&A 649, A6: Gaia Catalogue of Nearby Stars, VizieR J/A+A/649/A6',
        hyg='HYG 4.1, David Nash / Astronexus, CC BY-SA 4.0'),
    landmarks=sorted(landmarks, key=lambda l: l['distance']))
(root / 'data/neighborhood-meta.json').write_text(json.dumps(meta, indent=2) + '\n')
print(f"{len(census):,} objects within {RADIUS_LY} ly ({gaia_count:,} Gaia, {len(census) - gaia_count:,} Hipparcos supplement); "
      f"{within_seed:,} within {SEED_LY} ly; {len(landmarks)} landmarks")
