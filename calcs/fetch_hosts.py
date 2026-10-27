"""Download what calcs/hosts.py needs into .cache/. Run once: python3 calcs/fetch_hosts.py

- Gaia DR3 FLAME ages for every census star within 50 ly (ESA Gaia archive).
- Known planets within 50 ly (NASA Exoplanet Archive, pscomppars).
- Wide binaries among those stars (El-Badry, Rix and Heintz 2021, via VizieR).
- Published ages of the Habitable Worlds Observatory's target stars (the HAges Catalog, Ware et al. 2026, via Zenodo).
- Radial velocity surveys of red dwarfs: CARMENES DR1, the HARPS RV bank, and Keck's HIRES (CDS and VizieR).
Builds read the cached files and never fetch.
"""
import csv, math, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.cache'
PC_50LY = 50 / 3.261563777

def near_ids():
    ids = []
    for r in csv.DictReader((CACHE / 'gcns-100ly.csv').open()):
        d = math.dist((0, 0, 0), (float(r['xcoord50']), float(r['ycoord50']), float(r['zcoord50'])))
        if d <= PC_50LY: ids.append(r['GaiaEDR3'])
    return ids

def post(url, fields, out):
    if (CACHE / out).exists():
        print(f'{out}: cached'); return
    data = urllib.parse.urlencode(fields).encode()
    with urllib.request.urlopen(urllib.request.Request(url, data=data), timeout=300) as resp:
        (CACHE / out).write_bytes(resp.read())
    print(f'{out}: {sum(1 for _ in (CACHE / out).open()) - 1} rows')

def main():
    ids = near_ids()
    print(f'{len(ids)} census stars within 50 ly')
    id_list = ','.join(ids)
    post('https://gea.esac.esa.int/tap-server/tap/sync', {
        'REQUEST': 'doQuery', 'LANG': 'ADQL', 'FORMAT': 'csv',
        'QUERY': 'SELECT source_id, age_flame, age_flame_lower, age_flame_upper, mass_flame, lum_flame, '
                 'evolstage_flame, flags_flame FROM gaiadr3.astrophysical_parameters '
                 f'WHERE source_id IN ({id_list})'}, 'gaia-flame-50ly.csv')
    post('https://exoplanetarchive.ipac.caltech.edu/TAP/sync', {
        'format': 'csv',
        'query': 'SELECT hostname, hd_name, hip_name, gaia_dr3_id, sy_dist, pl_name, pl_bmasse, pl_orbsmax, pl_orbeccen, '
                 'st_lum, st_age, discoverymethod, pl_rvamp FROM pscomppars WHERE sy_dist < 15.33'}, 'exoplanets-50ly.csv')
    post('https://tapvizier.cds.unistra.fr/TAPVizieR/tap/sync', {
        'REQUEST': 'doQuery', 'LANG': 'ADQL', 'FORMAT': 'csv',
        'QUERY': 'SELECT Source1, Source2, sepAU, R, BinType FROM "J/MNRAS/506/2269/catalog" '
                 f'WHERE Source1 IN ({id_list}) OR Source2 IN ({id_list})'}, 'elbadry-50ly.csv')

def ages():
    """The HAges Catalog, public release v1: ages from asteroseismology and spin for 127 of 659 target stars."""
    (CACHE / 'hages').mkdir(exist_ok=True)
    for part in ('Overview', 'Gyrochronology', 'Asteroseismology'):
        name = f'HAges_Catalog_{part}.csv'
        if (CACHE / 'hages' / name).exists(): print(f'{name}: cached'); continue
        with urllib.request.urlopen(f'https://zenodo.org/api/records/19227788/files/{name}/content', timeout=300) as resp:
            (CACHE / 'hages' / name).write_bytes(resp.read())
        print(f'{name}: downloaded')

def close_binaries():
    """Orbits of close pairs: ORB6 for visual binaries (USNO and GSU), SB9 for spectroscopic ones (VizieR B/sb9)."""
    for name in ('orb6orbits.txt', 'orb6format.txt'):
        if (CACHE / name).exists(): print(f'{name}: cached'); continue
        with urllib.request.urlopen(f'https://www.astro.gsu.edu/wds/orb6/{name}', timeout=300) as resp:
            (CACHE / name).write_bytes(resp.read())
        print(f'{name}: downloaded')
    for table, out in (('main', 'sb9-main.csv'), ('orbits', 'sb9-orbits.csv')):
        post('https://tapvizier.cds.unistra.fr/TAPVizieR/tap/sync', {
            'REQUEST': 'doQuery', 'LANG': 'ADQL', 'FORMAT': 'csv', 'MAXREC': '100000',
            'QUERY': f'SELECT * FROM "B/sb9/{table}"'}, out)

def rv_surveys():
    """Who watched which star: CARMENES DR1's star list (Ribas et al. 2023), and every velocity in the HARPS RV bank
    (Trifonov et al. 2020) and Keck's HIRES survey as corrected by Tal-Or et al. 2019."""
    (CACHE / 'rv').mkdir(exist_ok=True)
    asu = 'https://vizier.cds.unistra.fr/viz-bin/asu-tsv?-out.max=unlimited&-source='
    for name, url in (('carmenes-dr1.dat', 'https://cdsarc.cds.unistra.fr/ftp/cats/J/A+A/670/A139/table1.dat'),
                      ('harps-list.dat', 'https://cdsarc.cds.unistra.fr/ftp/cats/J/A+A/636/A74/list.dat'),
                      ('harps-rv.tsv', asu + 'J/A+A/636/A74/rvbank&-out=Name,BJD,DRVmlcnzp'),
                      ('hires-stars.dat', 'https://cdsarc.cds.unistra.fr/ftp/cats/J/MNRAS/484/L8/stars.dat'),
                      ('hires-rv.tsv', asu + 'J/MNRAS/484/L8/table1&-out=Name,BJD,RVcor')):
        if (CACHE / 'rv' / name).exists(): print(f'{name}: cached'); continue
        with urllib.request.urlopen(url, timeout=600) as resp:
            (CACHE / 'rv' / name).write_bytes(resp.read())
        print(f'{name}: downloaded')

if __name__ == '__main__':
    main()
    close_binaries()
    ages()
    rv_surveys()
