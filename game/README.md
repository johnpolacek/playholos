# Holos · the game

The v2 game shell: one phone, built from [the v2 mocks](../explorations/v2-mocks/index.html). Design is in [HOLOS_GAME_CONCEPT.md](../HOLOS_GAME_CONCEPT.md).

```bash
npm install --prefix .. && npm install    # the atlas's packages, then the game's
npm run dev                                # http://localhost:3000
```

- `app/(play)/`: the phone. Top bar, map strip, tab page, and the rail. One route per tab.
- `app/godview/`: what the player can't see. Dev only.
- `app/api/mind/`: the Mind's chat, on the AI SDK. Needs `ANTHROPIC_API_KEY` in `.env.local`.
- `lib/game/`: the clock, save types, and the browser store. The simulation is still Python in `../calcs/`.
- `components/map-strip.tsx`: the map strip. It mounts the atlas's own scene, `../src/strip.js`, opening on Earth.
  - `lib/atlas.ts` loads its maps and star data from `../assets` and `../data`.
  - Three.js and Astronomy Engine come from the atlas's packages at the repo root.

Everything else inside the phone is placeholder.

Live at https://holos-game.vercel.app. Deploy from the repo root with `vercel deploy --prod`: the Vercel project's Root Directory is `game`, and `.vercelignore` keeps the upload to what the game reads.
