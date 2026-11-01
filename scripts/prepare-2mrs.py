"""Place the 2MASS Redshift Survey's galaxies in the atlas's frame, for the simulation's view of the universe we can see.

Source: data/galaxy-sources/2mrs/2mrs.tsv, Huchra et al. 2012, VizieR J/ApJS/199/26 table3, retrieved 2026-11-01 from
  https://vizier.cfa.harvard.edu/viz-bin/asu-tsv?-source=J/ApJS/199/26/table3&-out.max=unlimited&-out=RAJ2000,DEJ2000,cz,Ktmag&-oc.form=dec

Each galaxy's distance is its speed away from us over the Hubble constant, H0 = 70 km/s per Mpc, between Planck's 67
and the distance ladder's 73. Past about 300 km/s that is good to the survey's depth, where a galaxy's own motion is
small against the Galaxy's spread. Nearer than that, own motions rule, and the Local Volume Database already places
those galaxies, so they are left out.

Writes data/2mrs.bin: per galaxy, x, y, z in thousands of light-years in the atlas's (Galactic X, Galactic Z,
-Galactic Y) frame, and its K-band magnitude, as little-endian float32s.
  python3 scripts/prepare-2mrs.py
"""
import math, struct
from pathlib import Path

root = Path(__file__).resolve().parents[1]
H0 = 70.0                       # km/s per Mpc
NEAREST_CZ = 300.0              # km/s
MPC_KLY = 3261.563777

# ICRS / J2000 equatorial to IAU Galactic axes in the atlas's order, as src/coordinates.js.
def atlas(x, y, z):
    return (-.0548755604 * x - .8734370902 * y - .4838350155 * z,
            -.8676661490 * x - .1980763734 * y + .4559837762 * z,
            -(.4941094279 * x - .4448296300 * y + .7469822445 * z))

rows, out = 0, bytearray()
for line in (root / 'data/galaxy-sources/2mrs/2mrs.tsv').read_text().splitlines():
    parts = line.split('\t')
    if len(parts) != 4 or not parts[0].strip()[:1].isdigit() or not parts[2].strip(): continue
    ra, dec, cz, k = (float(p) for p in parts)
    if cz < NEAREST_CZ: continue
    d = cz / H0 * MPC_KLY
    ra, dec = math.radians(ra), math.radians(dec)
    x, y, z = atlas(math.cos(dec) * math.cos(ra), math.cos(dec) * math.sin(ra), math.sin(dec))
    out += struct.pack('<4f', x * d, y * d, z * d, k)
    rows += 1
(root / 'data/2mrs.bin').write_bytes(out)
print(f'{rows} galaxies, {len(out) / 1024:.0f} KB.')
