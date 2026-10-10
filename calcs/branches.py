"""How big each 2026 to 2040 branch is, for HOLOS_GAME_CONCEPT.md. Run: python3 calcs/branches.py

Orders of magnitude from published numbers, not forecasts. Sources are in HOLOS_RESEARCH.md.
"""

# ---------- A Taiwan war and Earth's compute ----------
# Earth's compute grows from about 3e22 operations a second in 2026 to about 1e25 by 2040: about 1.5 times a year.
# Taiwan makes about 92% of the most advanced logic chips (Neely, St. Louis Fed, 2025). A new leading-edge fab takes
# about 3 to 4 years, an industry rule of thumb.
# Chips are retired after about 5 years, so what runs in 2040 is what was made from 2036 on.
GROWTH, LIFE = 1.5, 5

def stock_2040(war_year=None, cut=0.9, outage=4, catch_up=True):
    made = {}
    for year in range(2026, 2041):
        base = GROWTH ** (year - 2026)
        if war_year is None or year < war_year:
            made[year] = base
        elif year < war_year + outage:
            made[year] = base * (1 - cut)
        else:
            # rebuilt fabs resume the old trend, or the whole curve slides back by the outage
            made[year] = base if catch_up else GROWTH ** (year - 2026 - outage)
    return sum(v for y, v in made.items() if y > 2040 - LIFE)

def taiwan():
    base = stock_2040()
    print('An invasion of Taiwan: compute at Year 0, as a share of the no-war path')
    for war in (2028, 2032, 2035):
        print(f'  war in {war}: fabs catch up {stock_2040(war) / base:.0%}, curve slides back {stock_2040(war, catch_up=False) / base:.0%}')

# ---------- A blockade of Taiwan, without invasion ----------
# The fabs survive, but chips stop shipping while it lasts. About a year, as a sample: an assumption, since no
# modern blockade of a chip maker has happened.
def blockade():
    base = stock_2040()
    print('A blockade of Taiwan for a year: compute at Year 0, as a share of the no-blockade path')
    for year in (2028, 2032, 2035):
        print(f'  blockade in {year}: output catches up {stock_2040(year, outage=1) / base:.0%}, '
              f'curve slides back {stock_2040(year, outage=1, catch_up=False) / base:.0%}')

if __name__ == '__main__':
    taiwan()
    blockade()
