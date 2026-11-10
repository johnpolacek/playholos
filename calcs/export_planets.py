"""Every known planet within 50 ly, for the Universe section's Worlds flight: python3 calcs/export_planets.py

Reads the NASA Exoplanet Archive's planets from .cache/exoplanets-50ly.csv (calcs/fetch_hosts.py) and places each at
its star: from game/data/sim-hosts.json or data/stars.json where the star is there, else by name through the CDS
Sesame resolver, cached in .cache/sesame-hosts.json so a rerun never asks again. Writes game/data/planets-50ly.json,
nearest first. 2026-11-10.
"""
import csv, json, math, re, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.cache'
LY_PER_PC = 3.261563777
SESAME = 'https://vizier.idia.ac.za/viz-bin/nph-sesame/-ox/SNV?'

def warm_zone(lum):
    """Conservative warm zone, after Kopparapu et al. 2013, in AU, as calcs/hosts.py has it."""
    return 0.95 * math.sqrt(lum), 1.67 * math.sqrt(lum)

def resolve(name, known):
    if name in known: return known[name]
    # A component's letter is dropped if the pair is one entry: WISEP J1217+1626 A is at its pair's place.
    for ask in [name, re.sub(r' [AB]$', '', name)]:
        with urllib.request.urlopen(SESAME + urllib.parse.quote(ask), timeout=60) as resp:
            text = resp.read().decode()
        ra = re.search(r'<jradeg>([^<]+)</jradeg>', text)
        dec = re.search(r'<jdedeg>([^<]+)</jdedeg>', text)
        if ra and dec: break
    if not ra or not dec: raise SystemExit(f'Sesame has no place for {name}')
    known[name] = [float(ra.group(1)), float(dec.group(1))]
    print(f'{name}: resolved by Sesame')
    return known[name]

def main():
    hosts = json.load((ROOT / 'game/data/sim-hosts.json').open())
    by_id = {h['id']: h for h in hosts}
    by_name = {h['name'].lower(): h for h in hosts}
    stars = json.load((ROOT / 'data/stars.json').open())
    by_hip = {str(s['hip']): s for s in stars if s.get('hip')}
    star_names = {s['name'].lower(): s for s in stars}
    sesame_file = CACHE / 'sesame-hosts.json'
    known = json.load(sesame_file.open()) if sesame_file.exists() else {}
    out = []
    for r in csv.DictReader((CACHE / 'exoplanets-50ly.csv').open()):
        gaia = r['gaia_dr3_id'].replace('Gaia DR3 ', '').strip()
        hip = r['hip_name'].replace('HIP ', '').strip()
        host = by_id.get(gaia) or by_id.get(r['hip_name'].strip()) or by_name.get(r['hostname'].lower())
        star = by_hip.get(hip) or star_names.get(r['hostname'].lower())
        if host: ra, dec = host['ra'] * 15, host['dec']
        elif star: ra, dec = star['ra'] * 15, star['dec']
        else: ra, dec = resolve(r['hostname'], known)
        # The star's name as our maps give it, where we have one: Proxima Centauri, not Proxima Cen. The planet's name
        # takes it too, so Proxima Cen b reads Proxima Centauri b.
        host_name = (host or star or {}).get('name') or r['hostname']
        # Our unnamed stars go by their Gaia number: the archive's name is better there.
        if host_name.lower() == r['hostname'].lower() or host_name.startswith('Gaia '): host_name = r['hostname']
        pl_name = r['pl_name']
        for alias in [r['hostname'], r['hd_name'], r['hip_name']]:
            if alias and pl_name.startswith(alias + ' '):
                pl_name = host_name + pl_name[len(alias):]
                break
        # The archive's composite distance is wrong for a few stars (GJ 411 at 5.7 pc, which is 2.5): where the star is
        # in our files, our distance stands, Gaia's.
        d_ly = host['d'] if host else star['distance'] if star else float(r['sy_dist']) * LY_PER_PC
        lum = 10 ** float(r['st_lum']) if r['st_lum'] else None
        a = float(r['pl_orbsmax']) if r['pl_orbsmax'] else None
        warm = None
        if lum is not None and a is not None:
            lo, hi = warm_zone(lum)
            warm = lo <= a <= hi
        method = {'Radial Velocity': 'wobble', 'Transit': 'transit', 'Imaging': 'image', 'Astrometry': 'astrometry',
                  'Transit Timing Variations': 'timing'}.get(r['discoverymethod'], r['discoverymethod'].lower())
        out.append({
            'name': pl_name, 'host': host_name, 'd': round(d_ly, 2),
            'ra': round(ra, 4), 'dec': round(dec, 4),
            'mass': round(float(r['pl_bmasse']), 2) if r['pl_bmasse'] else None,
            'a': round(a, 4) if a is not None else None,
            'e': round(float(r['pl_orbeccen']), 2) if r['pl_orbeccen'] else None,
            'lum': round(lum, 5) if lum is not None else None,
            'method': method, 'warm': warm,
        })
    sesame_file.write_text(json.dumps(known, indent=1))
    out.sort(key=lambda p: (p['d'], p['name']))
    path = ROOT / 'game/data/planets-50ly.json'
    path.write_text('[\n' + ',\n'.join(json.dumps(p, ensure_ascii=False) for p in out) + '\n]\n')
    print(f'{path}: {len(out)} planets, {sum(1 for p in out if p["warm"])} in a warm zone')

if __name__ == '__main__':
    main()
