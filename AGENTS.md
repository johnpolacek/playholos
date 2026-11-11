# Holos

A hard science fiction game about the Fermi paradox, and the atlas it draws its sky from. [README.md](README.md) has setup and the full tour of the repo.

## Where things live

- `game/` is the game: a React app on a Cloudflare Worker. [game/README.md](game/README.md) maps its code. Read it before working there.
- `game/lib/sim/` is the simulation, ported from the Python in `calcs/`. The Python stays the reference.
- `game/worker/mind.ts` builds what the Mind is told. `game/lib/sim/knowledge.ts` keeps it to what Earth knows.
- `src/`, `assets/` and `data/` are the atlas, a 3D map from Earth to the Local Group. The game draws its sky from them.
- `npx/` is the `npx playholos` launcher, published to npm.
- [HOLOS_GAME_CONCEPT.md](HOLOS_GAME_CONCEPT.md) holds the design and why. Read the part you are changing first.
- [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md) holds the sources.
- `legacy/` holds earlier designs. Where v2 says nothing, v1 still holds.

## House rules

- Start from real data and published research. A detail can be improbable, but never contradicted by what we know. Add a source to HOLOS_RESEARCH.md when a change rests on one.
- Nothing travels faster than light.
- In game text, Earth and its Mind speak as “we”, never “I”. Use plain words and short sentences.
- Keep a change to one idea, so it is easy to review.

## Checks

Run these before a pull request:

```sh
npm test                    # at the root: the atlas against JPL Horizons
cd game
npm test                    # the simulation against the Python
npm run lint
npx tsc --noEmit
```

If you change what the Mind is told or how it answers, also run `npm run check:mind` in `game/` with the dev server going. `npm run trace:mind` asks the full set of test questions. See [game/README.md](game/README.md).

## Deploying

Nothing deploys on push. `npm run deploy` in `game/` builds the client and the Worker and publishes both to playholos.com.
