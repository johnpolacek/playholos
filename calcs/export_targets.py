"""The stars our messages can aim at: every star in the 50 ly census, by the name players see, its place in the sky and
its distance. Run: python3 calcs/export_targets.py. Writes game/data/targets.json.

The same for every game, so the list says nothing of who lives where. Settled 2026-10-26: the Will may send to any star.
Places are as game/scripts/leads.mjs finds them: by Gaia id from the census cache (python3 calcs/fetch_hosts.py fetches
it), else from the atlas's HYG list by HIP number. Right ascension in hours, declination in degrees.
"""
import csv, json
from pathlib import Path
from export_worlds import pretty

ROOT = Path(__file__).resolve().parent.parent
# Bright stars the census leaves out, as too young or too hot to host a neighbor, that a player may still name. Altair
# had Earth's first message to it. Their places and distances from the atlas's HYG list, by Gliese number.
EXTRA = [('Sirius', 'Gl 244A'), ('Epsilon Eridani', 'Gl 144'), ('Procyon', 'Gl 280A'), ('Altair', 'Gl 768'), ('Vega', 'Gl 721'),
         ('Fomalhaut', 'Gl 881')]
hyg = json.loads((ROOT / 'data' / 'stars.json').read_text())
by_gl = {s['gl']: s for s in hyg if s.get('gl')}
by_hip = {f"HIP {s['hip']}": s for s in hyg if s.get('hip')}
census = {r['GaiaEDR3']: (float(r['RA_ICRS']) / 15, float(r['DE_ICRS'])) for r in csv.DictReader(open(ROOT / '.cache' / 'gcns-100ly.csv'))}

def place(id):
    if id in census: return census[id]
    s = by_hip.get(id)
    return (s['ra'], s['dec']) if s else None

out, seen, missing = [], set(), []
for r in csv.DictReader(open(ROOT / 'data' / 'hosts-50ly.csv')):
    name, at = pretty(r['name']), place(r['id'])
    if name in seen: continue
    if not at: missing.append(name); continue
    seen.add(name)
    out.append({'name': name, 'ra': round(at[0], 4), 'dec': round(at[1], 3), 'd': round(float(r['distance_ly']), 2)})
for name, gl in EXTRA:
    s = by_gl[gl]
    if name not in seen: out.append({'name': name, 'ra': round(s['ra'], 4), 'dec': round(s['dec'], 3), 'd': round(s['distance'], 2)})
out.sort(key=lambda t: t['d'])
(ROOT / 'game' / 'data' / 'targets.json').write_text(json.dumps(out, ensure_ascii=False, separators=(',', ':')))
print(f'{len(out)} stars to 50 ly, nearest {out[0]["name"]} at {out[0]["d"]} ly. No place for {len(missing)}: {", ".join(missing[:8])}')
