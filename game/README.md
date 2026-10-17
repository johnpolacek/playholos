# Holos · the game

The v2 game shell: one phone, built from [the v2 mocks](../explorations/v2-mocks/index.html). Design is in [HOLOS_GAME_CONCEPT.md](../HOLOS_GAME_CONCEPT.md).

```bash
npm install --prefix .. && npm install    # the atlas's packages, then the game's
npm run dev                                # http://localhost:3000
```

- `app/(play)/`: the phone. Top bar, map strip, tab page, and the rail. One route per tab.
- `proxy.ts` and `app/unlock/`: the test build is private. Any production server asks once for the code in `ACCESS_CODE`, and a cookie keeps it open. `next dev` is open.
- `app/godview/`: what the player can't see. Dev only.
- `app/api/mind/`: the Mind's chat, on the AI SDK. Needs `ANTHROPIC_API_KEY` in `.env.local`.
- `lib/game/`: the clock, save types, and the browser store.
- `lib/sim/`: the simulation, ported a piece at a time from Python in `../calcs/`. `npm test` checks it against Python.
  - `data/worlds/`: the pool of drawn worlds, one per seed, written by `python3 ../calcs/export_worlds.py`. They hold the seed's truth, so only the server reads them.
  - `knowledge.ts` is the wall: the Mind is told what Earth knows at that moment, never the truth.
  - `pyrandom.ts` is CPython's random generator, so a roll here matches the same roll in the calcs and the mocks.
- `components/map-strip.tsx`: the map strip. It mounts the atlas's own scene, `../src/strip.js`, opening on Earth.
  - `lib/atlas.ts` loads its maps and star data from `../assets` and `../data`.
  - Three.js and Astronomy Engine come from the atlas's packages at the repo root.

- `lib/motion.ts`: the full motion treatment, from the animaxxing skills in `../.claude/skills`. Every element enters from a blank screen, rests, and leaves. Mark an element `data-m` and give its screen a `useStage` intro. Reduced motion skips the travel.

Everything else inside the phone is placeholder.

Live at https://holos-game.vercel.app. A push to `main` deploys it. By hand, deploy from the repo root with `vercel deploy --prod`: the Vercel project's Root Directory is `game`, and `.vercelignore` keeps the upload to what the game reads.
