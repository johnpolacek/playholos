"""What it costs to let a model play the neighbors. For v2 open question 5. Run: python3 calcs/ai_cost.py

Prices are first-party rates as of October 2026, per million tokens: Anthropic's pricing page and Google's Gemini
API pricing page. Batch APIs halve the uncached price for work that can wait. Token counts per decision are
assumptions to test in playtests.
"""

MODELS = {
    # name: (input, cached input, output) in dollars per million tokens. Thinking counts as output.
    'Claude Opus 5.5': (4.00, 0.20, 20.00),
    'Claude Sonnet 5.5': (2.00, 0.20, 10.00),
    'Claude Haiku 4.5': (1.00, 0.10, 5.00),
    'Gemini 3.5 Flash-Lite': (0.30, 0.03, 2.50),
    'Gemini 3.1 Flash-Lite': (0.25, 0.025, 1.50),
}
BATCH = 0.5

# A decision, two ways.
# Open: the model reads the neighbor's charter, history, dials and the rules (cached), its state and news (fresh),
# then reasons freely and writes a plan: about 2,000 tokens out.
# Menu: the rules work out the legal moves and their costs, and the model picks one and gives its reason in a
# sentence or two, as structured output: about 300 tokens out, less fresh input.
PROFILES = {'open': (6000, 3000, 2000), 'menu': (6000, 1500, 300)}

# Decisions per neighbor per real day of 288 Years: on news, about 30. Big moments only, about 10.
CADENCE = {'on news': 30, 'big moments': 10}
NEIGHBORS = 10        # a typical game: counts are drawn evenly in tenfold steps from 3 to 30

def per_call(model, profile, batch=False):
    i, c, o = MODELS[model]
    cached, fresh, out = PROFILES[profile]
    return (cached * c + (fresh * i + out * o) * (BATCH if batch else 1)) / 1e6

if __name__ == '__main__':
    print(f'Per game per real day, {NEIGHBORS} neighbors, in dollars, batched')
    cols = [(p, k) for p in PROFILES for k in CADENCE]
    print(f"  {'model':24}" + ''.join(f'{p + ", " + k:>22}' for p, k in cols))
    for m in MODELS:
        print(f'  {m:24}' + ''.join(f'{NEIGHBORS * CADENCE[k] * per_call(m, p, True):>22,.2f}' for p, k in cols))
    print('  Gemini caches also bill storage, $1 per million tokens an hour: 60,000 tokens kept for ten neighbors is')
    print(f'  about ${60000 / 1e6 * 24:.2f} a day. One shared rules prompt keeps it small.')
