"""Check every neighbor's voice bank in data/voices/, and show a sample message. Run: python3 calcs/voices.py

A bank is one JSON file per neighbor: hails, closes, and lines for each of the seven part kinds, each part line with
one {part} slot. The rules are in HOLOS_VOICES.md.
"""
import json, random, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIR = ROOT / 'data' / 'voices'
KINDS = ['finding', 'sighting', 'archive', 'culture', 'request', 'verdict', 'accord']
SMALL = dict(hail=3, close=2, **{k: 5 for k in KINDS})
LONGEST = 160
# The living roster, plus Pelle's Testament. Anwe and Mirr sent nothing that survives.
NAMES = ['Veyra', 'Hael', 'Kesh', 'Tavi', 'Ombe', 'Sere', 'Ilm', 'Varn', 'Quessa', 'Daal', 'Ystra', 'Nuvo', 'Pelle',
         'Kirrin', 'Ruun', 'Faen', 'Corra', 'Lusk', 'Iru', 'Tolle', 'Vesh', 'Sabe', 'Ulan', 'Odun', 'Ree', 'Hesk',
         'Arro', 'Wenn']
OWN_RULES = {
    'Ystra': (re.compile(r"\b(I|I'm|I've|me|my|mine)\b"), 'says "I"'),
    'Pelle': (None, None),
}

def check(name):
    path = DIR / f'{name.lower()}.json'
    if not path.exists(): return [f'{name}: no bank yet']
    bank = json.loads(path.read_text())
    errors = []
    want = dict(SMALL, **({'request': 0, 'accord': 0} if name == 'Pelle' else {}))
    for key, count in want.items():
        lines = bank.get(key, [])
        if len(lines) != count: errors.append(f'{name}.{key}: {len(lines)} lines, want {count}')
        for line in lines:
            slots = line.count('{part}')
            if key in KINDS and slots != 1: errors.append(f'{name}.{key}: needs one {{part}}: {line}')
            if key not in KINDS and slots: errors.append(f'{name}.{key}: no slot allowed: {line}')
            if re.search(r'\{part\}[.,:!?]', line): errors.append(f'{name}.{key}: punctuation after the slot: {line}')
            if len(line) > LONGEST: errors.append(f'{name}.{key}: over {LONGEST} characters: {line}')
            if any(ch in line for ch in '—–;!'): errors.append(f'{name}.{key}: dash, semicolon or exclamation: {line}')
            rule, what = OWN_RULES.get(name, (None, None))
            if rule and rule.search(line): errors.append(f'{name}.{key}: {what}: {line}')
    every = [l for k in want for l in bank.get(k, [])]
    for dup in {l for l in every if every.count(l) > 1}: errors.append(f'{name}: repeated line: {dup}')
    extra = set(bank) - set(want) - {'name', 'calls_sol'}
    if extra: errors.append(f'{name}: unknown keys {sorted(extra)}')
    return errors

def sample(name, parts, seed=1):
    """A message as the player reads it: a hail, then each part in its frame, then a close."""
    bank, rng = json.loads((DIR / f'{name.lower()}.json').read_text()), random.Random(seed)
    lines = [rng.choice(bank['hail'])]
    lines += [rng.choice(bank[kind]).replace('{part}', text) for kind, text in parts if bank[kind]]
    return '\n'.join(lines + [rng.choice(bank['close'])])

if __name__ == '__main__':
    errors = [e for n in NAMES for e in check(n)]
    seen = {}
    for n in NAMES:                                  # no line shared between neighbors
        path = DIR / f'{n.lower()}.json'
        if not path.exists(): continue
        for line in {l for v in json.loads(path.read_text()).values() if isinstance(v, list) for l in v}:
            if line in seen: errors.append(f'{n} and {seen[line]} share a line: {line}')
            seen.setdefault(line, n)
    done = [n for n in NAMES if (DIR / f'{n.lower()}.json').exists()]
    print(f'{len(done)} of {len(NAMES)} banks, {sum(sum(len(v) for k, v in json.loads((DIR / f"{n.lower()}.json").read_text()).items() if isinstance(v, list)) for n in done)} lines.')
    for e in errors: print('  ' + e)
    if done and not errors:
        print()
        for n in ('Kesh', 'Ree', 'Ystra'):
            if n in done:
                print(f'{n}, sending a finding and a request:')
                print(sample(n, [('finding', 'Your star has a cold belt at 40 AU.'), ('request', 'What is your largest moon made of?')]))
                print()
    sys.exit(1 if errors else 0)
