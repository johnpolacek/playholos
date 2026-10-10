"""What the models cost when neighbors are scripted. For v2 open question 5. Run: python3 calcs/ai_cost.py

Neighbors play from seeded life scripts, weighted reaction tables and prewritten voice banks: no model at run time.
A model is used in three places only: writing the voice banks once, live talks with a neighbor's mind, and Earth's
own Mind, which the player talks to. Prices are first-party rates as of October 10, 2026, per million tokens:
Anthropic's and Google's pricing pages. Token counts and how often things happen are assumptions to test.
"""

MODELS = {
    # name: (input, cached input, output) in dollars per million tokens. Thinking counts as output.
    'Claude Opus 5.5': (4.00, 0.20, 20.00),
    'Claude Haiku 4.5': (1.00, 0.10, 5.00),
    'Claude Haiku 5.5': (0.10, 0.01, 0.50),      # prompts up to 100,000 tokens, released October 7, 2026
    'Gemini 3.1 Flash-Lite': (0.25, 0.025, 1.50),
}

def turn(model, cached, fresh, out):
    i, c, o = MODELS[model]
    return (cached * c + fresh * i + out * o) / 1e6

# ---------- Once, at build time: voice banks ----------
# Written in Claude Code on a subscription, the banks cost no API money: small banks were written that way on
# 2026-10-10. The figure below is what the same work would cost through the API, from a build script.
# Each neighbor's voice: about 300 lines across the message parts, written by the strongest model from the neighbor's
# prose, then reviewed by hand. About 20,000 tokens in and 20,000 out per neighbor, for a roster of 30.
ROSTER = 30
def voice_banks():
    return ROSTER * turn('Claude Opus 5.5', 0, 20000, 20000)

# ---------- In a game: live talks with a neighbor's mind ----------
# Only when minds are close, late in a game. A talk is about 10 turns: the neighbor's character and the rules
# cached, the talk so far fresh, a short reply out.
def live_talk(model):
    return 10 * turn(model, 8000, 1000, 300)

# ---------- Every day: Earth's Mind ----------
# Talking to the Mind is how you play. A turn: rules, charter and voice cached, the game's state fresh, one line back
# plus the action it takes, with a little thinking. About 60 turns on a day of three short sessions,
# plus three reports of what happened while you were away.
TURNS_A_DAY, REPORTS_A_DAY = 60, 3
def mind_day(model):
    return TURNS_A_DAY * turn(model, 10000, 3000, 400) + REPORTS_A_DAY * turn(model, 10000, 6000, 800)

if __name__ == '__main__':
    print(f'Once: voice banks for {ROSTER} neighbors, written by Claude Opus 5.5 through the API: ${voice_banks():.2f}.'
          ' Written in Claude Code on a subscription: no API cost.')
    print('Neighbors in play: $0. They run on scripts, tables and voice banks.')
    print()
    print(f"  {'model':24}{'a live talk':>14}{'Mind, a day':>14}{'Mind, a month':>16}")
    for m in MODELS:
        print(f'  {m:24}{live_talk(m):>14.3f}{mind_day(m):>14.2f}{30 * mind_day(m):>16.2f}')
