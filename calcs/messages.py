"""What our messages cost and carry. Run: python3 calcs/messages.py

For sending in play, settled 2026-10-26. Sources are in HOLOS_RESEARCH.md, "Sending messages".

A message is noticed farther than it is read. A listener notices a steady tone once it stands above the noise in one
narrow channel (calcs/early_game.py's beacon). Reading what it carries takes enough energy for every bit, and that
falls with the square of the distance.

- A bit needs at least ln 2 times the noise in one hertz, kT, at the receiver: Shannon's limit, which Messerschmitt
  2014 shows the noise of the sky alone sets for interstellar links. Real codes and detection sit above it. Within a
  factor of two is where his own design gets as bandwidth grows, so READ_MARGIN is 2, a sample. A receiver's noise is
  in its SEFD, which is 2kT over its area, so the energy a bit needs, per square metre facing us, is
  READ_MARGIN * ln 2 * SEFD / 2.
- So an aimed message of EIRP watts reaches d with a rate R = EIRP / (4 pi d^2 E_bit). Twice as far reads four times
  slower. A message sent every way at once is the same with P in place of EIRP: it has no dish to focus it.
- A listener who hears it again adds the passes, so a repeating message reads farther the longer it is heard: reach
  grows as the square root of the passes. Settled 2026-10-26: never past where the listener would notice it in that
  time, since it can't add up a message it never found. Noticing grows only as the fourth root of the time.
- The listener is taken to keep an all-sky watch like Earth's, 12 Jy, as every awake neighbor does (calcs/neighbors.py).
  A star that turns a big receiver on Sol hears more: 1.1 Jy, the full SKA-Mid.

This project's own: Earth's aimed sends at Year 0 are 1e14 W along the beam, a sample, settled 2026-10-26. Earth's
strongest today are about 1e13: Arecibo's 1974 message, and Goldstone's 70 m radar, about 450 kW at 8.56 GHz. A 2040
Earth with a Mind does ten times better with dishes it has, beamed together. A build can raise it. Sizes are real where
marked.
"""
import math

LY, JY, YEAR, DAY = 9.4607e15, 1e-26, 3.156e7, 86400
GRID_2040 = 24e12                        # W, Earth's energy at Year 0 (calcs/early_game.py)
READ_MARGIN = 2                          # times Shannon's limit, a sample from Messerschmitt 2014
EARS = (('an all-sky watch', 12), ('a big receiver on Sol', 1.1))
AIMED_W = 1e14                           # W along the beam: ten times Arecibo's 1974 message or Goldstone's radar, a sample
SNR, CHAN = 10, 1                        # noticing a tone: calcs/early_game.py's form

# What a message can carry, in bits. Real where a source is given.
SIZES = [
    ('Arecibo’s picture, 1974', 1679),                          # Wikipedia, Arecibo message
    ('a page of words', 8 * 3000),
    ('Cosmic Call 2’s messages, 2003', 8 * 220e6),            # 220 MB, IRE RAS
    ('our genes, one genome', 2 * 3.1e9),                       # 3.1 billion bases, two bits each
    ('Wikipedia’s text, 2026', 8 * 26.8e9),                   # 26.8 GB compressed, Size of Wikipedia
    ('every book, 2010', 8 * 129_864_880 * 0.5e6),            # Google's count, at a sample 0.5 MB a book
]

def bit_energy(sefd):
    """Joules a bit needs at the receiver, per square metre facing us."""
    return READ_MARGIN * math.log(2) * sefd * JY / 2

def rate(watts, ly, sefd):
    """Bits a second read at `ly` from a message of `watts` along the line to the listener."""
    return watts / (4 * math.pi * (ly * LY) ** 2 * bit_energy(sefd))

def read_reach(watts, bits, seconds, sefd, passes=1):
    """Light-years at which a message of `bits`, sent in `seconds` at `watts`, is read after `passes`, a pass each
    `seconds`. Never past where it is noticed in that time."""
    read = math.sqrt(watts * seconds * passes / (4 * math.pi * bits * bit_energy(sefd))) / LY
    return min(read, notice_reach(watts, sefd, seconds * passes))

def power_for(ly, bits, seconds, sefd):
    """Watts every way at once for a message of `bits`, sent in `seconds`, to be read at `ly`."""
    return 4 * math.pi * (ly * LY) ** 2 * bits * bit_energy(sefd) / seconds

def notice_reach(watts, sefd, stare=DAY):
    """Light-years at which a steady tone of `watts` every way is noticed in a stare of `stare` seconds."""
    f_min = SNR * sefd * JY * math.sqrt(CHAN / (2 * stare))
    return math.sqrt(watts / (4 * math.pi * f_min)) / LY

def span(s):
    for unit, n in (('Years', YEAR), ('days', DAY), ('hours', 3600), ('minutes', 60)):
        if s >= n: return f'{s / n:,.1f} {unit}'
    return f'{s:,.1f} seconds'

def aimed():
    print(f'Aimed, {AIMED_W:.0e} W along the beam: time to send each, read by the star it is aimed at')
    for name, sefd in EARS:
        print(f'  heard by {name}, {sefd} Jy:')
        print(f"    {'':34}" + ''.join(f'{d:>13} ly' for d in (4.2, 12, 25, 50)))
        for what, bits in SIZES:
            print(f'    {what:34}' + ''.join(f'{span(bits / rate(AIMED_W, d, sefd)):>16}' for d in (4.2, 12, 25, 50)))

def everywhere():
    sefd = EARS[0][1]
    print(f'Every way at once, heard by an all-sky watch, {sefd} Jy: power to be read at each distance, as a share of 2040 energy')
    for seconds, how in ((DAY, 'sent in a day'), (YEAR, 'sent over a Year')):
        print(f'  {how}:')
        print(f"    {'':34}" + ''.join(f'{d:>10} ly' for d in (5, 10, 20, 50)))
        for what, bits in SIZES[:4]:
            print(f'    {what:34}' + ''.join(f'{power_for(d, bits, seconds, sefd) / GRID_2040:>13.2%}' for d in (5, 10, 20, 50)))
    print('  Noticed, a steady tone in a day’s stare, and a page of words read once a day:')
    for share in (0.001, 0.01, 0.1):
        w = share * GRID_2040
        print(f'    {share:5.1%} of 2040 energy, {w:.1e} W: noticed to {notice_reach(w, sefd):,.0f} ly, '
              f'read to {read_reach(w, SIZES[1][1], DAY, sefd):,.1f} ly, '
              f'{read_reach(w, SIZES[1][1], DAY, sefd, passes=365):,.0f} ly once heard for a Year, '
              f'where it is noticed in a Year')

if __name__ == '__main__':
    aimed(); print()
    everywhere()
