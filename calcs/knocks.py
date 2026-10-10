"""When could a reply to each message Earth aimed at a nearby star first arrive? Run: python3 calcs/knocks.py

Targets within 50 ly, from the list of interstellar radio messages (see HOLOS_RESEARCH.md). Distances are Gaia DR3's,
as the census in calcs/hosts.py has them, so they match calcs/neighbors.py. Altair is too bright for Gaia and HD 10307
is missing from its census, so those two are Hipparcos's. Year 0 is 2040.0, and one Year is 5 real minutes.
"""
YEAR_0 = 2040.0

KNOCKS = [
    # (message, sent as a decimal year, target, light-years)
    ('Message to Altair', 1983.62, 'Altair', 16.73),
    ('Teen Age Message', 2001.67, '47 Ursae Majoris', 45.30),
    ('Cosmic Call 2', 2003.51, 'Gliese 49', 31.83),
    ('Cosmic Call 2', 2003.51, 'Gliese 208', 37.26),
    ('Cosmic Call 2', 2003.51, '55 Cancri', 41.05),
    ('Cosmic Call 2', 2003.51, 'HD 10307', 41.55),
    ('Cosmic Call 2', 2003.51, '47 Ursae Majoris', 45.30),
    ('A Message From Earth', 2008.77, 'Gliese 581', 20.55),
    ('Hello From Earth', 2009.66, 'Gliese 581', 20.55),
    ('RuBisCo Stars', 2009.86, "Teegarden's Star", 12.50),
    ('RuBisCo Stars', 2009.86, 'TZ Arietis', 14.58),
    ('RuBisCo Stars', 2009.86, 'Kappa¹ Ceti', 30.26),
    ('Wow! Signal Reply', 2012.62, '55 Cancri', 41.05),
    ('Lone Signal', 2013.5, 'Gliese 526', 17.73),
    ('Sónar Calling GJ273b', 2017.79, "Luyten's Star", 12.26),
    ('Sónar Calling GJ273b', 2018.37, "Luyten's Star", 12.26),
]

def clock(years):
    minutes = years * 5
    return f'{int(minutes // 60):02d}:{int(minutes % 60):02d}' if minutes >= 0 else 'before'

if __name__ == '__main__':
    print(f"{'message':22} {'target':18} {'arrives':>8} {'reply by':>9} {'Year':>7} {'real time':>10}")
    for message, sent, target, ly in sorted(KNOCKS, key=lambda k: k[1] + 2 * k[3]):
        arrives, reply = sent + ly, sent + 2 * ly
        y = reply - YEAR_0
        print(f'{message:22} {target:18} {arrives:>8.1f} {reply:>9.1f} {y:>7.1f} {clock(y):>10}')
