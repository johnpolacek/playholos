"""Black holes in the game's region, drawn per seed. Run: python3 calcs/holes.py

Settled 2026-10-26. Sources in HOLOS_RESEARCH.md, "Black holes". Each number is from a published estimate or marked a
sample. The draw has its own random stream, keyed on the seed, so no other draw in calcs/seed.py moves.
"""
import math, random

PC_LY = 3.2616
REGION_LY = 100
# Bambi 2025 and 2026, from Olejak et al. 2020: about one black hole per 1,500 pc^3 in the disk, 92% of them alone.
# Only lone ones are drawn: a hole with a companion would need a real star the census doesn't have. At 30 pc the disk's
# thickness doesn't matter, so they are spread evenly.
PER_PC3, ALONE = 1 / 1500, 0.92
# Masses: lone holes found so far are 7 to 10 Suns (OGLE-2011-BLG-0462, Gaia BH1 and BH2), and Gaia BH3 is 33. A sample:
# a log-normal with its middle at 8 Suns and a spread of 0.15 dex, kept within 5 to 35.
MASS_MID, MASS_DEX = 8.0, 0.15
# Speeds: a sample, 30 km/s on each axis, for kicks smaller than neutron stars' and the disk's own spread.
SPEED_AXIS = 30
# Spins: holes seen by gravitational waves mostly spin slowly. A sample: a beta(2, 5), so about 0.3 on average.
SPIN_AB = (2, 5)

# ---------- How Earth finds one ----------
# A lone hole is dark. Passing in front of a star, it shifts where the star appears, by about thetaE^2 / b at a
# distance b, well past its Einstein ring (astrometric microlensing, as found OGLE-2011-BLG-0462, Sahu et al. 2022).
# thetaE = 2.85 mas sqrt(M / Suns) sqrt(1 kpc / D), for a star far behind. A survey that sees shifts down to `floor` mas
# sees every star the hole passes within b = thetaE^2 / floor. Stars it can measure: a sample density by galactic
# latitude, about 10,000 a square degree in the plane falling to 500 at the poles, for Gaia's stars to G 17.
GAIA = dict(floor=1.0, per_deg2=(500, 9500, 10.0), span=(2014.6, 2025.1))   # DR5: 10.5 years, published about 2030
# A larger star mapper, of the GaiaNIR class proposed to ESA for the 2040s: near-infrared, so it sees through dust to
# five times the stars, and about three times sharper. A sample. Once done it watches for good.
MAPPER = dict(floor=0.3, more_stars=5)

def theta_e_mas(mass, d_ly):
    return 2.85 * math.sqrt(mass) * math.sqrt(1000 / (d_ly / PC_LY))

def stars_per_arcsec2(b_deg, per_deg2=GAIA['per_deg2']):
    low, extra, scale = per_deg2
    return (low + extra * math.exp(-abs(b_deg) / scale)) / 3600 ** 2

def events_a_year(h, floor, more=1.0):
    """Stars a hole passes close enough to shift by `floor` mas or more, a Year."""
    te = theta_e_mas(h['mass'], h['d']) / 1000                       # arcsec
    mu = h['vt'] / (4.74 * h['d'] / PC_LY)                           # arcsec a Year
    reach = te ** 2 / (floor / 1000)                                 # arcsec
    return 2 * reach * mu * stars_per_arcsec2(h['b']) * more

# Galactic to equatorial, J2000.
_G2E = ((-0.0548755604, 0.4941094279, -0.8676661490), (-0.8734370902, -0.4448296300, -0.1980763734),
        (-0.4838350155, 0.7469822445, 0.4559837762))

def draw(seed):
    rng = random.Random(f"{seed}:holes")
    volume = 4 / 3 * math.pi * (REGION_LY / PC_LY) ** 3
    mean = volume * PER_PC3 * ALONE
    # Poisson, by counting exponential gaps.
    n, t = 0, rng.expovariate(1)
    while t < mean: n += 1; t += rng.expovariate(1)
    holes = []
    for i in range(n):
        while True:
            x, y, z = (rng.uniform(-1, 1) for _ in range(3))
            if 0.01 < x * x + y * y + z * z <= 1: break
        r = math.sqrt(x * x + y * y + z * z); d = REGION_LY * r
        u = (x / r, y / r, z / r)                                     # galactic: toward the center, the turning, the pole
        b = math.degrees(math.asin(u[2]))
        e = [sum(_G2E[j][k] * u[k] for k in range(3)) for j in range(3)]
        ra = math.degrees(math.atan2(e[1], e[0])) % 360; dec = math.degrees(math.asin(e[2]))
        mass = min(35, max(5, MASS_MID * 10 ** rng.gauss(0, MASS_DEX)))
        v = [rng.gauss(0, SPEED_AXIS) for _ in range(3)]
        radial = sum(v[k] * u[k] for k in range(3))
        vt = math.sqrt(max(0.0, sum(c * c for c in v) - radial ** 2))
        h = dict(id=f'h{i + 1}', d=round(d, 3), ra=round(ra, 4), dec=round(dec, 4), b=round(b, 3), mass=round(mass, 2),
                 spin=round(rng.betavariate(*SPIN_AB), 3), vt=round(vt, 2))
        # Gaia DR5: found if a star it passed shifted by a milliarcsecond within the survey's years. Published ~2030.
        dr5 = events_a_year(h, GAIA['floor']) * (GAIA['span'][1] - GAIA['span'][0])
        # Its finds draw from their own stream, so tuning a survey never moves a hole.
        seen = random.Random(f"{seed}:holes:{i + 1}:seen")
        h['found2040'] = seen.random() < 1 - math.exp(-dr5)
        # The star mapper: each event drawn as a Year from Year 0, a Poisson stream, for 2,000 Years.
        rate, events, t = events_a_year(h, MAPPER['floor'], MAPPER['more_stars']), [], 0.0
        while rate > 0:
            t += seen.expovariate(rate)
            if t > 2000 or len(events) >= 8: break
            events.append(round(t, 2))
        h['events'] = events
        holes.append(h)
    return sorted(holes, key=lambda h: h['d'])

if __name__ == '__main__':
    import statistics
    seeds = list(range(1, 33)) + [62]
    ns, near, found, first = [], [], [], []
    for s in seeds:
        hs = draw(s)
        ns.append(len(hs)); near.append(hs[0]['d']); found.append(sum(h['found2040'] for h in hs))
        first.append(min((h['events'][0] for h in hs if h['events']), default=math.inf))
    print(f'Lone black holes within {REGION_LY} ly, {len(seeds)} games: {statistics.mean(ns):.0f} a game on average '
          f'({min(ns)} to {max(ns)}). The nearest is {statistics.median(near):.0f} ly away in the middle game, {min(near):.0f} at the closest.')
    print(f'  Found by Gaia DR5 by Year 0: {statistics.mean(found):.1f} a game, none in {sum(f == 0 for f in found)} of {len(seeds)}.')
    print(f'  A star mapper done at Year 0 finds its first in {statistics.median(first):.1f} Years in the middle game, '
          f'{max(first):.1f} at the longest, so every game has one to find.')
    h = draw(10)[0]
    print(f'  Seed 10, the nearest: {h["d"]:.1f} ly, {h["mass"]} Suns, spin {h["spin"]}, {h["vt"]:.0f} km/s across the sky. '
          f'Its ring {theta_e_mas(h["mass"], h["d"]):.0f} mas. {events_a_year(h, 1.0):.2f} Gaia events a year, '
          f'{events_a_year(h, 0.1, 5):.1f} for the mapper.')

# ---------- Neighbors at black holes ----------
# Settled 2026-10-26. A neighbor finds the holes near it as Earth would, with a star mapper of its own, and some go.
# Samples, from Smart 2012's transcension: inward minds are drawn most, then by how far a Mind leans Deepen. A Mind
# that goes sends a sentinel first, on Earth's own timings (calcs/seed.py's probe): a mapper 8 Years after waking, a
# find within 10, the sentinel 20 Years to build, a tenth of light speed and 10 Years of burns. The most inward also
# send a colony, on calcs/seed.py's seed-ship timings, to stay: a furnace if the Mind leans Open, a refuge if Hidden.
# None can arrive before Year 0, since no neighbor woke more than about a century before Earth. Checked below.
GO = {'inward': 0.6, 'D2': 0.4, 'D1': 0.25, 'E1': 0.15, 'E2': 0.1, 'hunter': 0.3}
# Settled 2026-10-26: a hunter watches holes for who comes, not to stay. If minds are drawn to holes, as Smart 2012
# argues, a hole is where others gather, so a hunter sends a sentinel there, never a colony. Its odds are a sample.
SETTLE = {'inward': 0.5, 'D2': 0.3}
MAPPER_YEARS, FIND_YEARS, SENTINEL_BUILD, V, BURNS = 8, 10, 20, 0.1, 10
# A furnace: its Mind starts at Earth's 2040 scale and doubles as calcs/neighbors.py's glow does. A sample tenth of its
# light falls in soft X-rays, where eRASS1 reaches about 5e-14 erg/s/cm2 (HOLOS_RESEARCH.md, "Black holes").
XRAY_SHARE, XRAY_LIMIT = 0.1, 5e-14

def xyz(ra, dec, d):
    a, b = math.radians(ra), math.radians(dec)
    return (d * math.cos(b) * math.cos(a), d * math.cos(b) * math.sin(a), d * math.sin(b))

def claim(seed, holes, neighbors, place):
    """Who goes to which hole, and when: each living neighbor, by its own keyed roll. `place` gives a neighbor's xyz in
    ly. Adds `claims` to each hole, soonest first, and returns them all."""
    at = {h['id']: xyz(h['ra'], h['dec'], h['d']) for h in holes}
    out = []
    for p in neighbors:
        if p['dead']: continue
        rng = random.Random(f"{seed}:holes:{p['name']}")
        lean = p['n']['disposition'] if p['n']['disposition'] in ('inward', 'hunter') else p['dials'].split()[1]
        if rng.random() >= GO.get(lean, 0): continue
        home = place(p)
        h = min(holes, key=lambda h: math.dist(at[h['id']], home))
        hop = math.dist(at[h['id']], home)
        waking = p['waking'] - Y0
        leaves = waking + MAPPER_YEARS + FIND_YEARS + SENTINEL_BUILD
        c = dict(who=p['name'], kind='sentinel', leaves=round(leaves, 2), arrives=round(leaves + hop / V + BURNS, 2), hop=round(hop, 2))
        h.setdefault('claims', []).append(c); out.append(c)
        if rng.random() < SETTLE.get(lean, 0):
            sent = waking + S_FIRST_SHIP
            lands = sent + hop / V + S_BURN + S_BRAKE
            mode = 'furnace' if p['dials'].split()[0] in ('O1', 'O2') else 'refuge'
            c = dict(who=p['name'], kind='colony', mode=mode, leaves=round(sent, 2), arrives=round(lands, 2), stands=round(lands + S_STANDS, 2),
                     hop=round(hop, 2), doubling=p['n'].get('doubling', 10))
            if mode == 'furnace':
                # When Earth's X-ray sky could first see it, in its light: Year it crosses, plus light time to Earth.
                need = XRAY_LIMIT * 4 * math.pi * (h['d'] * 9.4607e17) ** 2 * 1e-7 / XRAY_SHARE     # W
                c['seen'] = round(c['stands'] + c['doubling'] * math.log2(need / 1e13) + h['d'], 1)
            h['claims'].append(c); out.append(c)
    for h in holes:
        if 'claims' in h: h['claims'].sort(key=lambda c: c['arrives'])
    return out

Y0 = 2040.0
S_FIRST_SHIP, S_BURN, S_BRAKE, S_STANDS = 40, 10, 15, 20     # calcs/seed.py's seed-ship timings

# ---------- The Will moving to our Mind at a hole ----------
# Settled 2026-10-26. The Will goes as a transmission, as HOLOS_GAME_CONCEPT.md's Death and new games has it. Our dishes
# can't carry a Mind: 100 PB to a watch 15 ly off would take millions of Years. A diffraction-limited laser can, as
# calcs/late_game.py's mind() works it: the receiver catches (Dt Dr / (wavelength d))^2 of the beam, at ten photons a bit.
# The Mind Link is 100 m optics in orbit and a 1 GW laser, a sample. Our Mind at the hole builds its own 100 m receiver
# with its seed factory. NASA's DSOC sent 267 Mb/s from 19 million miles in 2023, on a 22 cm terminal and a 5 m telescope.
MIND_BITS, LINK_APERTURE, LINK_W, LINK_WAVE, LINK_PHOTONS = 8e17, 100, 1e9, 1e-6, 10
LINK_YEARS, LINK_WANT = 18, 0.5          # samples: a mirror larger than any, built in orbit, as long as the 15 m Mirror's road

def link_years(ly):
    """Years the Mind Link takes to send the Will to a hole `ly` away, before the light-time."""
    caught = (LINK_APERTURE ** 2 / (LINK_WAVE * ly * 9.4607e15)) ** 2
    joules = MIND_BITS * LINK_PHOTONS * 6.626e-34 * 3e8 / LINK_WAVE / caught
    return joules / LINK_W / 3.156e7

# A clock slowed close in. On the innermost stable orbit a clock runs at calcs' iscoClock: 0.71 of ours with no spin.
# Tides there tear anything large: about 6e6 per second squared across each metre at 8 Suns. A rod of length L feels a
# stress of about density x tide x L^2 / 8, so a 1 m chip of silicon feels about 1.7 GPa and breaks, and a 10 cm one
# about 17 MPa and holds. So a Mind can live there only spread over small chips, each in its own orbit, linked by
# light. A furnace's disk fills that orbit, so only a refuge can. This project's arithmetic.
def isco_stress_mpa(mass, length, density=2330):
    r = 6 * 6.674e-11 * mass * 1.989e30 / 9e16
    return density * 2 * 6.674e-11 * mass * 1.989e30 / r ** 3 * length ** 2 / 8 / 1e6
