"""Download what calcs/hosts.py needs into .cache/. Run once: python3 calcs/fetch_hosts.py

- Gaia DR3 FLAME ages for every census star within 50 ly (ESA Gaia archive).
- Known planets within 50 ly (NASA Exoplanet Archive, pscomppars).
- Wide binaries among those stars (El-Badry, Rix and Heintz 2021, via VizieR).
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
                 'st_lum, st_age FROM pscomppars WHERE sy_dist < 15.33'}, 'exoplanets-50ly.csv')
    post('https://tapvizier.cds.unistra.fr/TAPVizieR/tap/sync', {
        'REQUEST': 'doQuery', 'LANG': 'ADQL', 'FORMAT': 'csv',
        'QUERY': 'SELECT source_id1, source_id2, sep_AU FROM "J/MNRAS/506/2269/table" '
                 f'WHERE source_id1 IN ({id_list}) OR source_id2 IN ({id_list})'}, 'elbadry-50ly.csv')

if __name__ == '__main__':
    main()
