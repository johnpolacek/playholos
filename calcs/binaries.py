"""Close binaries Gaia can't split: published orbits, matched to the census, and what they leave of each warm zone.
Run: python3 calcs/binaries.py   (reports every host with a published orbit; needs .cache from fetch_hosts.py)

Gaia finds wide pairs as two stars. A pair closer than about an arcsecond shows as one, so its orbit has to come from
the catalogs: ORB6, the Sixth Catalog of Orbits of Visual Binary Stars, and SB9, the Ninth Catalogue of Spectroscopic
Binary Orbits. A world is stable around one star only inside a critical distance, and around both only outside one
(Holman and Wiegert 1999). A host keeps its warm zone if some part of it fits either way.
"""
import csv, math
from pathlib import Path
import hosts

CACHE = hosts.CACHE
DAY_YR = 365.25

def _num(s):
    s = s.strip()
    try: return float(s)
    except ValueError: return None

def orb6():
    """Visual orbits: position (J2000), HIP, magnitudes, period in years, semi-major axis in arcsec, e, grade."""
    out = []
    for line in (CACHE / 'orb6orbits.txt').open(encoding='latin-1'):
        if len(line) < 235 or not line[:2].strip().isdigit(): continue
        try:
            ra = (int(line[0:2]) + int(line[2:4]) / 60 + float(line[4:9]) / 3600) * 15
            sign = -1 if line[9] == '-' else 1
            dec = sign * (int(line[10:12]) + int(line[12:14]) / 60 + float(line[14:18]) / 3600)
        except ValueError: continue
        p, pu = _num(line[81:92]), line[92]
        a, au = _num(line[105:114]), line[114]
        if p is None: continue
        p_yr = {'d': p / DAY_YR, 'y': p, 'c': p * 100}.get(pu)
        a_as = {'a': a, 'm': a / 1000 if a else None, 'M': a * 60 if a else None}.get(au) if a else None
        name = line[30:44].strip()
        tail = name.rstrip(',abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
        comps = [c for c in name[len(tail):] if c.isupper()]
        out.append(dict(source='ORB6', name=name, comps=comps or [''], ra=ra, dec=dec, hip=line[58:64].strip(),
                        mag1=None if line[71] == 'k' else _num(line[66:71]),       # infrared magnitudes can't
                        mag2=None if line[78] == 'k' else _num(line[73:78]),       # be compared with Gaia's G
                        p_yr=p_yr, a_as=a_as,
                        e=_num(line[187:195]) or 0.0, grade=line[233].strip(), ref=line[237:245].strip()))
    return [o for o in out if o['p_yr']]

def sb9():
    """Spectroscopic orbits, the best-graded per system: period in years, e, K1 and K2 in km/s."""
    main = {r['Seq']: r for r in csv.DictReader((CACHE / 'sb9-main.csv').open())}
    best = {}
    for r in csv.DictReader((CACHE / 'sb9-orbits.csv').open()):
        g = _num(r['Grade']) or 0
        if r['Seq'] not in best or g >= best[r['Seq']][0]: best[r['Seq']] = (g, r)
    out = []
    for seq, (g, r) in best.items():
        m = main.get(seq)
        if not m or not _num(r['Per']): continue
        out.append(dict(source='SB9', name=m['Name'].strip(), ra=float(m['RAJ2000']), dec=float(m['DEJ2000']),
                        hip=m['Name'].replace('HIP', '').strip() if m['Name'].startswith('HIP') else '',
                        mag1=_num(m['mag1']), mag2=_num(m['mag2']), p_yr=float(r['Per']) / DAY_YR, a_as=None,
                        e=_num(r['e']) or 0.0, k1=_num(r['K1']), k2=_num(r['K2']), grade=r['Grade']))
    return out

def at_2000(s):
    """A Gaia star's position moved back to 2000, to match catalogs in J2000 coordinates."""
    if s['id'].startswith('HIP') or s.get('pmra') is None: return s['ra'], s['dec']
    dt = -16.0
    return (s['ra'] + s['pmra'] * dt / 3.6e6 / math.cos(math.radians(s['dec'])), s['dec'] + s['pmde'] * dt / 3.6e6)

def companion_mass(o, m_host, host_is_primary, d_pc):
    """The other body's mass, in Suns.
    Visual orbit: the dynamical mass, Kepler's third law from the true orbit, less this star's.
    Astrometric orbit: only this star's wobble is seen, so the companion is as massive as that wobble needs.
    Spectroscopic: K1/K2 when both are seen, else the minimum mass from the mass function."""
    if o['source'] == 'ORB6':
        if o['grade'] == '9' or o.get('wobble'):
            wobble, m2 = o['a_as'] * d_pc, 0.01
            for _ in range(50): m2 = wobble / ((m_host + m2) * o['p_yr'] ** 2) ** (1 / 3) * (m_host + m2)
            return m2
        return min(3.0, max(0.01, (o['a_as'] * d_pc) ** 3 / o['p_yr'] ** 2 - m_host))
    if o['source'] == 'SB9':
        if o.get('k1') and o.get('k2'): q = o['k1'] / o['k2']
        elif o.get('k1'):
            f = 1.0361e-7 * (1 - o['e'] ** 2) ** 1.5 * o['k1'] ** 3 * o['p_yr'] * DAY_YR    # mass function, Suns
            m2 = f ** (1 / 3) * m_host ** (2 / 3)
            for _ in range(30): m2 = (f * (m_host + m2) ** 2) ** (1 / 3)
            return m2 if host_is_primary else m_host
        else: return 0.5 * m_host
        return m_host * q if host_is_primary else m_host / q

def close_orbits(star_list):
    """Published orbits for each census star: {id: [dict(m2, a_au, e, p_yr, label)]}."""
    cats = orb6() + sb9()
    by_hip = {}
    for o in cats:
        if o['hip']: by_hip.setdefault(o['hip'], []).append(o)
    cells = {}
    for o in cats: cells.setdefault((round(o['ra']), round(o['dec'])), []).append(o)
    found = {}
    for s in star_list:
        if not s.get('kind'): continue
        ra, dec = at_2000(s)
        near = [o for dra in (-1, 0, 1) for dde in (-1, 0, 1) for o in cells.get((round(ra) + dra, round(dec) + dde), [])
                if hosts.angle(dict(ra=ra, dec=dec), o['ra'], o['dec']) * 3600 < 10]
        hip = s.get('hip') or (s['id'][4:] if s['id'].startswith('HIP') else '')
        near += [o for o in by_hip.get(hip, []) if o not in near]
        d_pc = s['d_pc']
        m_host = hosts.mass_from_gabs(s['gabs'])
        app = s['gabs'] + 5 * math.log10(d_pc / 10)
        sb_periods = [o['p_yr'] for o in near if o['source'] == 'SB9']
        for o in near:
            if o['source'] == 'ORB6' and (o['grade'] == '5' or not o['a_as']): continue    # indeterminate orbits
            # A visual orbit too small for any stellar mass is a wobble, the star's own path, not the pair's separation.
            if o['source'] == 'ORB6' and o['grade'] != '9' and (o['a_as'] * d_pc) ** 3 / o['p_yr'] ** 2 < 0.5 * m_host:
                o = dict(o, wobble=True)
            # Is this star in the pair at all? Catalogs file a companion's own orbit, such as Epsilon Indi Ba and Bb,
            # at the primary's position. This star must match one of the pair's magnitudes. V runs fainter than
            # Gaia's G: a few tenths for Sun-like stars, up to about 2.5 magnitudes for red dwarfs.
            lo, hi = {'F': (-0.6, 0.9), 'G': (-0.6, 0.9), 'K': (-0.4, 1.3), 'M': (0.0, 2.8)}[s['kind']]
            fits = [m for m in (o['mag1'], o['mag2']) if m is not None and lo <= m - app <= hi]
            if (o['mag1'] is not None or o['mag2'] is not None) and not fits: continue
            if o['mag1'] is None and o['mag2'] is None and o['source'] == 'ORB6' and not set(o['comps']) & {'A', ''}: continue
            primary = o['mag2'] is None or abs(app - (o['mag1'] or app)) <= abs(app - o['mag2'])
            m2 = companion_mass(o, m_host, primary, d_pc)
            if m2 < 0.005: continue          # planet-mass: Holman and Wiegert overstate it, and the planet check covers it
            # A wobble-only orbit whose companion would tug the star by over 1 km/s needs a spectroscopic orbit to back
            # it. Radial-velocity surveys of near, bright stars would have seen it. 107 Piscium's 1997 Hipparcos orbit
            # fails this: its velocity is steady to about 1 m/s (Soubiran et al. 2018). So does 61 Cygni A's from 1960.
            if o['source'] == 'ORB6' and (o['grade'] == '9' or o.get('wobble')):
                a_rel = ((m_host + m2) * o['p_yr'] ** 2) ** (1 / 3)
                tug_kms = 29.78 * math.sqrt((m_host + m2) / a_rel) * m2 / (m_host + m2)
                if tug_kms > 1 and not any(abs(p / o['p_yr'] - 1) < 0.2 for p in sb_periods): continue
            if o['a_as'] and o['grade'] != '9' and not o.get('wobble'):
                a_au = o['a_as'] * d_pc
            else:                                               # astrometric or spectroscopic: Kepler's third law
                a_au = ((m_host + m2) * o['p_yr'] ** 2) ** (1 / 3)
            found.setdefault(s['id'], []).append(dict(m2=m2, a_au=a_au, e=o['e'], p_yr=o['p_yr'],
                                                      label=f"{o['source']} {o['name']}"))
    return found

def p_type(mu, e):
    """Holman and Wiegert 1999: the closest stable orbit around both stars, as a share of their separation."""
    return 1.60 + 5.10 * e - 2.22 * e * e + 4.12 * mu - 4.27 * e * mu - 5.09 * mu * mu + 4.61 * e * e * mu * mu

def zone_left(m_host, hz_in, hz_out, orbits):
    """What part of the warm zone stays stable: (inner, outer, how). Empty if none."""
    lo, hi, how = hz_in, hz_out, 'one star'
    for o in orbits:
        mu = o['m2'] / (m_host + o['m2'])
        s_max = hosts.critical_a(mu, o['e']) * o['a_au']
        c_min = p_type(mu, o['e']) * o['a_au']
        if o['a_au'] < hz_in: lo, how = max(lo, c_min), 'both stars'     # a pair tighter than the warm zone: worlds circle both
        else: hi = min(hi, s_max)                                         # a wider one: worlds circle this star alone
    return (lo, hi, how) if lo < hi else None

if __name__ == '__main__':
    sl = hosts.stars(); hosts.name_from_hyg(sl)
    found = close_orbits(sl)
    rows = {r['id']: r for r in csv.DictReader((hosts.ROOT / 'data' / 'hosts-50ly.csv').open())}
    print(f"Published orbits for {len(found)} census stars. Hosts among them:")
    for s in sorted(sl, key=lambda s: s['d_pc']):
        if s['id'] not in found or s['id'] not in rows: continue
        lum = float(rows[s['id']]['luminosity'])
        hz_in, hz_out = hosts.hz(lum)
        m = hosts.mass_from_gabs(s['gabs'])
        left = zone_left(m, hz_in, hz_out, found[s['id']])
        orbit = '; '.join(f"{o['label']}: {o['p_yr']:.3g} yr, {o['a_au']:.2g} AU, e {o['e']:.2f}, other {o['m2']:.2f} Sun"
                          for o in found[s['id']])
        verdict = f"keeps {left[0]:.2f} to {left[1]:.2f} AU, around {left[2]}" if left else 'NO stable warm zone'
        print(f"  {s['name']:18} {s['kind']} {s['d_pc'] * hosts.LY_PC:5.1f} ly, warm zone {hz_in:.2f} to {hz_out:.2f} AU: {verdict}. {orbit}")
