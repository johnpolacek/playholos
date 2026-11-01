"""The host stars within 50 ly as simulation mode draws natural warm worlds at them: what calcs/seed.py's warm_world and
rung read of each star, cut to what a draw needs. Run: python3 calcs/export_sim_hosts.py

Writes game/data/sim-hosts.json. Each row: id, name, kind, distance, luminosity, a published age and how, absolute G,
whether it is in the north, where it is in the sky, the widest stable orbit beside a wide companion, whether a close
pair's published orbit rules out its warm zone, its known planets, and its 2026 tug floor, null where no survey
watched it. 2026-11-01.

A close pair: calcs/neighbors.py's orbit_fails asks binaries.zone_left for the stable part of [a, a] for a circular
orbit, which is never wider than nothing, so any star with a published close orbit hides no natural world. Kept so the
port matches Python.
"""
import json, math
from pathlib import Path
import hosts, neighbors as nb, seed as S, export_worlds as X

ROOT = Path(__file__).resolve().parents[1]

def row(h):
    m1 = hosts.mass_from_gabs(h['gabs'])
    wide = [hosts.critical_a(hosts.mass_from_gabs(o['gabs']) / (m1 + hosts.mass_from_gabs(o['gabs']))) * sep for o, sep in h['companions']]
    sky = X.sky_of(h['id'])
    return dict(id=h['id'], name=X.pretty(h['name']), kind=h['kind'], d=h['distance_ly'], lum=h['luminosity'],
                age=h['age'], ageBy=h['age_by'], gabs=h['gabs'], north=h['north'], ra=sky.get('ra'), dec=sky.get('dec'),
                wideAU=min(wide) if wide else None, closePair=bool(h['orbits']),
                planets=sorted([pm, pa, pe] for _, pm, pa, pe in h['planets']),
                rvFloor=None if h.get('rv_floor', nb.RV_2026) == math.inf else h.get('rv_floor', nb.RV_2026))   # None: no survey watched it

if __name__ == '__main__':
    rows = [row(h) for h in nb.load_hosts()]
    (ROOT / 'game' / 'data' / 'sim-hosts.json').write_text(json.dumps(rows, separators=(',', ':')))
    print(f'{len(rows)} hosts, {sum(r["ra"] is None for r in rows)} without a place in the sky.')
