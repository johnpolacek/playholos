"""The Climate Hold: holding Earth's air where we choose, and why no ice age comes. Run: python3 calcs/climate.py

Settled 2026-11-12, the designer's picks (f) and (j): a small build for lore, first in every strategy's queue. Sources in
HOLOS_RESEARCH.md, "Earth's air and the next ice age". Each number is from a published estimate or marked ours or a
sample.

- Our carbon has already put off the next ice age. With none of it, the next would begin about 50,000 years from now.
  With 500 GtC burned, not within 120,000. With 1,000, not for 550,000 to 700,000 (Talento and Ganopolski 2021).
- By Year 0 we will have burned about 900 GtC, so no ice age comes in any game.
- The Climate Hold stops the air's carbon rising, by taking back what each Year adds. It does not clean the air back to
  before industry: that would start the ice's clock again.
"""
import math

# ---------- What we burned ----------
# Global Carbon Budget 2024 (Friedlingstein et al. 2025): 710 GtC from 1850 to 2023, fossil and land use. About 11.4 GtC
# in 2024. 419.31 ppm in 2023, rising 2.79 ppm, from 278 in 1750. About 44% of what we emit stays in the air.
CUMULATIVE_2023, EMITTED_2024, PPM_2023, RISE_2023, PPM_1750, AIRBORNE = 710.0, 11.4, 419.31, 2.79, 278.0, 0.44
GTC_PER_PPM = 2.12                                              # 5.9 GtC raised the air 2.79 ppm in 2023
GTCO2_PER_GTC = 3.664
YEAR_0 = 2040
# To Year 0 at 2024's rate, a sample: forecasts to 2040 split, and the branch sets no number for it.
BURNED_YEAR_0 = CUMULATIVE_2023 + EMITTED_2024 * (YEAR_0 - 2023)
PPM_YEAR_0 = PPM_2023 + EMITTED_2024 * AIRBORNE / GTC_PER_PPM * (YEAR_0 - 2023)

# ---------- The next ice age ----------
# Talento and Ganopolski 2021, read: the next glacial inception in years from now, by GtC burned. The critical summer
# sunlight at 65 N for inception falls as the log of CO2: 466 W/m2 at 280 ppm, by 77 W/m2 for each unit of its log.
INCEPTION = {0: 50e3, 500: 120e3, 1000: 550e3}                  # the soonest each could be: 500 GtC, "highly unlikely in the next 120 kyr"
def inception_after(gtc):
    """The soonest the next ice age begins, in years from now, by the GtC burned: between the paper's cases, ours."""
    keys = sorted(INCEPTION)
    if gtc >= keys[-1]: return INCEPTION[keys[-1]]
    i = max(k for k in range(len(keys)) if keys[k] <= gtc)
    a, b = keys[i], keys[i + 1]
    return INCEPTION[a] + (INCEPTION[b] - INCEPTION[a]) * (gtc - a) / (b - a)

# ---------- Holding the air ----------
# What the air gains each Year at Year 0, if we still burned at 2024's rate: its airborne share.
GAIN_GTC = EMITTED_2024 * AIRBORNE
GAIN_T = GAIN_GTC * GTCO2_PER_GTC * 1e9                         # tonnes of CO2 a Year to take back to hold it
# Taking CO2 from the air on solid sorbents (Realmonte et al. 2019, Climeworks' kind, the lower case): 0.668 GJ of
# electricity and 4.468 GJ of heat a tonne. The heat is low, about 100 C, the kind our data centers throw away.
ELEC_GJ, HEAT_GJ = 0.668, 4.468
HOLD_ELEC_W = GAIN_T * ELEC_GJ * 1e9 / 3.15576e7
HOLD_HEAT_W = GAIN_T * HEAT_GJ * 1e9 / 3.15576e7
EARTH_ELEC_W = 5e12                                            # Year 0's electricity, HOLOS_GAME_CONCEPT.md
# How fast it grows: Realmonte's fastest, 30% a year, from one plant of a megatonne a year, to what the air gains. Its
# Years at standard pace. Its want is the Quiet Radars', a sample: machines, not thought.
PLANT_T, GROWTH = 1e6, 0.30
HOLD_YEARS = round(math.log(GAIN_T / PLANT_T) / math.log(1 + GROWTH))
HOLD_WANT = 0.01
# Cleaning the air back to 1750's 278 ppm would start the ice's clock: with none of our carbon left, about 50,000
# years. Holding it where it stands keeps the ice past any game.

def catalog():
    return dict(years=HOLD_YEARS, want=HOLD_WANT)

if __name__ == '__main__':
    print(f'Burned by Year 0: about {BURNED_YEAR_0:,.0f} GtC, the air near {PPM_YEAR_0:.0f} ppm.')
    print(f'The next ice age: not before about {inception_after(BURNED_YEAR_0):,.0f} years. With none of our carbon, about {INCEPTION[0]:,.0f}.')
    print(f'The air gains about {GAIN_GTC:.1f} GtC a Year, {GAIN_T / 1e9:.0f} Gt of CO2. Taking it back: {HOLD_ELEC_W / 1e12:.2f} TW of electricity, '
          f'{HOLD_ELEC_W / EARTH_ELEC_W:.0%} of Year 0\'s, and {HOLD_HEAT_W / 1e12:.1f} TW of low heat.')
    print(f'Grown at 30% a year from one plant of a megatonne: {HOLD_YEARS} Years.')
