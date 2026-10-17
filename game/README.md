# Holos · the game

The v2 game shell: one phone, built from [the v2 mocks](../explorations/v2-mocks/index.html). Design is in [HOLOS_GAME_CONCEPT.md](../HOLOS_GAME_CONCEPT.md).

```bash
npm install --prefix .. && npm install    # the atlas's packages, then the game's
npm run dev                                # http://localhost:3000
```

- `app/(play)/`: the phone. Top bar, map strip, tab page, and the rail. One route per tab.
- `components/unlock.tsx`: the Mind is private in the test build. The rest of the game is open. On any production server, the Mind tab asks once for the code in `ACCESS_CODE`, and a cookie keeps it open. `next dev` is open.
- `app/godview/`: what the player can't see. Dev only.
- `app/api/mind/`: the Mind's chat, on the AI SDK. Needs `ANTHROPIC_API_KEY` in `.env.local`.
- `lib/game/`: the clock, save types, and the browser store.
- `lib/sim/`: the simulation, ported a piece at a time from Python in `../calcs/`. `npm test` checks it against Python.
  - `data/worlds/`: the pool of drawn worlds, one per seed, written by `python3 ../calcs/export_worlds.py`. They hold the seed's truth, so only the server reads them.
  - `knowledge.ts` is the wall: the Mind is told what Earth knows at that moment, never the truth.
  - `pyrandom.ts` is CPython's random generator, so a roll here matches the same roll in the calcs and the mocks.
  - `works.ts` paces Earth's works from the player's orders, in one loop from Year 0. `data/works.json` holds each work's Years and want.

- `components/map-strip.tsx`: the map strip. It mounts the atlas's own scene, `../src/strip.js`, opening on Earth.
  - `lib/atlas.ts` loads its maps and star data from `../assets` and `../data`.
  - Three.js and Astronomy Engine come from the atlas's packages at the repo root.

- `lib/theme.ts`: the theme follows the phone until the player picks Light or Dark, kept in this browser. The root layout's script paints it before the first frame. The button in the corner of Wake and the map, `components/theme-toggle.tsx`, flips it. People, Stand and Inherit stay night in both.
- `lib/motion.ts`: the full motion treatment, from the animaxxing skills in `../.claude/skills`. Every element enters from a blank screen, rests, and leaves. Mark an element `data-m` and give its screen a `useStage` intro. Reduced motion skips the travel.

Everything else inside the phone is placeholder.

Live at https://holos-game.vercel.app. A push to `main` deploys it. By hand, deploy from the repo root with `vercel deploy --prod`: the Vercel project's Root Directory is `game`, and `.vercelignore` keeps the upload to what the game reads.

## Orders in the save, proposed

Not wired yet. Agree this with the UI before either side builds on it.

- `Save` gains `orders?: Order[]`, with `Order` from `lib/sim/works.ts`.
- An order is stamped with the game Year it was given: `yearAt(beganAt)` at the tap, 0 while planning before Begin.
- The list only grows. A change of mind is a new order, never an edit.
- Four kinds so far:
  - `{ y, begin: "Moon vault" }`: a work joins the end of the line. `"Data center"` queues one for the fabs.
  - `{ y, first: "Moon vault" }`: the player moves a work under way to the front.
  - `{ y, standing: "Data center" }`: the fabs keep data centers coming.
  - `{ y, studies: 0.1 }`: thought set aside for the Mind's studies.
- Work names are the keys of `data/works.json`.
- The chat request sends `orders` with `seed` and `beganAt`. The server replays them all with `pace(orders, now, { scale: world.earth.compute })`, so a date never drifts.
