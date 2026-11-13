"""Thought near its limits: chips at the wall that physics sets for them. Run: python3 calcs/thought.py

Settled 2026-11-12, the designer's word: make science into builds. Sources in HOLOS_RESEARCH.md, "Thought near its
limits". Each number is from a published estimate or marked ours or a sample.

- Ordinary chips, switching charge on and off and throwing it away as heat, have a wall: about 4.7e15 operations a
  joule at 4-bit precision, 2.9e14 at 16-bit, about 207 times the H100 of 2023, give or take 0.7 orders at one
  standard deviation (Ho, Erdil and Besiroglu 2023).
- Our Mind at Year 0 already thinks at 1e25 operations a second on 0.25 TW: 4e13 a joule. So the wall is about 7 times
  past us, not hundreds.
- Past the wall lies reversible computing, which recycles its charge. Landauer's floor binds only what is erased. No
  chip beyond a test structure has shown it, so it is not built.
"""
import math

# Ho, Erdil and Besiroglu 2023, read: the wall for 16-bit operations, and its spread.
WALL_FP16, SPREAD_OOM = 2.9e14, 0.7
# Our Mind at Year 0, HOLOS_GAME_CONCEPT.md: 1e25 operations a second on 0.25 TW of its own.
YEAR_0_OPS, YEAR_0_W = 1e25, 0.25e12
OURS = YEAR_0_OPS / YEAR_0_W
GAIN = WALL_FP16 / OURS
STEP = 1.5                                                   # a data center's step of thought
STEPS = math.log(GAIN) / math.log(STEP)
# Its pace: GPUs have doubled their operations a joule every 2.7 years for 15 years (Ho et al., citing an earlier
# count). So the gain takes that many doublings at that pace, its Years at standard pace. Its want is a flagship's,
# a sample: new fabs, as Thought Fields' chips come from.
DOUBLING_YEARS = 2.7
YEARS = round(math.log2(GAIN) * DOUBLING_YEARS)
WANT = 1.0
# The Landauer floor at 300 K, for scale: kT ln 2 a bit erased.
LANDAUER_J = 1.380649e-23 * 300 * math.log(2)

def catalog():
    return dict(years=YEARS, want=WANT, steps=round(STEPS, 2))

if __name__ == '__main__':
    print(f'Our Mind at Year 0: {OURS:.1e} operations a joule. The wall for ordinary chips: {WALL_FP16:.1e}, '
          f'{GAIN:.1f} times past us, within {10 ** -SPREAD_OOM * GAIN:.1f} to {10 ** SPREAD_OOM * GAIN:.0f} at one standard deviation.')
    print(f'That is {STEPS:.2f} steps of a data center\'s 1.5. At GPUs\' pace, {YEARS} Years.')
    print(f'Landauer\'s floor at 300 K: {LANDAUER_J:.1e} J a bit erased. A 4-bit operation at the wall costs '
          f'{1 / (WALL_FP16 * 16):.1e} J, {1 / (WALL_FP16 * 16) / LANDAUER_J:,.0f} times it.')
