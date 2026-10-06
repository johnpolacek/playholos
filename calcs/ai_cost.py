"""What it costs to let a model play the neighbors. For v2 open question 5. Run: python3 calcs/ai_cost.py

Prices are Anthropic's first-party rates as of September 2026, per million tokens. The Batch API halves them for
work that can wait. Token counts per decision are assumptions to test in playtests.
"""

MODELS = {
    # name: (input, cached input, output) in dollars per million tokens
    'Claude Opus 5.5': (4.00, 0.20, 20.00),
    'Claude Sonnet 5.5': (2.00, 0.20, 10.00),
    'Claude Haiku 4.5': (1.00, 0.10, 5.00),
}
BATCH = 0.5

# One decision: the neighbor's charter, history, dials and the game's rules, cached once; its current state and what
# just reached it, fresh; its plan or message out, with thinking billed as output.
CACHED, FRESH, OUT = 6000, 3000, 2000

def per_call(model, batch=False):
    i, c, o = MODELS[model]
    cost = (CACHED * c + FRESH * i + OUT * o) / 1e6
    return cost * (BATCH if batch else 1)

# How often a neighbor decides, per real day of 288 Years. Every Year is 288 calls. Event-driven, it decides when
# something reaches it or a plan step ends, and reviews its plan every 25 Years: about 30. Rules for routine,
# the model only for big moments (contact, a message, a strike, a plan review every 50 Years): about 10.
CADENCE = {'every Year': 288, 'event-driven': 30, 'big moments only': 10}

if __name__ == '__main__':
    print('Per neighbor, per real day, in dollars')
    print(f"  {'model':20}" + ''.join(f'{k:>22}' for k in CADENCE))
    for m in MODELS:
        for batch in (False, True):
            label = m + (' batch' if batch else '')
            print(f'  {label:20}' + ''.join(f'{n * per_call(m, batch):>22,.2f}' for n in CADENCE.values()))
    print(f'  one decision on Claude Opus 5.5: ${per_call("Claude Opus 5.5"):.3f}')
