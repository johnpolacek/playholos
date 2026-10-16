# Holos · the game

The v2 game shell: one phone, built from [the v2 mocks](../explorations/v2-mocks/index.html). Design is in [HOLOS_GAME_CONCEPT.md](../HOLOS_GAME_CONCEPT.md).

```bash
npm install
npm run dev     # http://localhost:3000
```

- `app/(play)/`: the phone. Top bar, map strip, tab page, and the rail. One route per tab.
- `app/godview/`: what the player can't see. Dev only.
- `app/api/mind/`: the Mind's chat, on the AI SDK. Needs `ANTHROPIC_API_KEY` in `.env.local`.
- `lib/game/`: the clock, save types, and the browser store. The simulation is still Python in `../calcs/`.
- `components/map-strip.tsx`: the slot for the atlas's Three.js line-art scene.

Everything inside the phone is placeholder.
