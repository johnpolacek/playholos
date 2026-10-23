# Holos · the game

The v2 game shell, built from [the v2 mocks](../explorations/v2-mocks/index.html). Design is in [HOLOS_GAME_CONCEPT.md](../HOLOS_GAME_CONCEPT.md).

```bash
npm install --prefix .. && npm install    # the atlas's packages, then the game's
npm run dev                                # http://localhost:5173
```

- A React app built with Vite, routed by React Router in `routes.tsx`, and served by one Cloudflare Worker. `worker/` answers `/api/*`, and every other address is the built client.
- `app/play/`: the shell. Top bar, map, tab page, and the rail. One route per tab.
  - It fills the screen at every size. Tall, as on a phone, the parts stack. Wide, from a phone on its side up, the map fills the left and the tab page and rail stand on the right. `wide:` in `app/globals.css` is that breakpoint: landscape, 640px and up.
  - Screens before the shell lay out with `components/spread.tsx`: one column when tall, capped to a readable width on a tablet, and the art beside the words when wide.
- `components/unlock.tsx`: the Mind is private in the test build. The rest of the game is open. On any production server, the Mind tab asks once for the code in `ACCESS_CODE` or the player's own Anthropic API key, and a cookie keeps it open. A key bills the player, and the Worker uses it per call without storing it. Only Console keys work: Anthropic's terms bar claude.ai logins in other apps. `worker/access.ts` holds the cookies. The dev server is open.
- `app/godview.tsx`: what the player can't see. Dev only.
- `worker/mind.ts`: the Mind's chat, on the AI SDK. Needs `ANTHROPIC_API_KEY` in `.dev.vars`.
  - `npm run check:mind`, with the dev server going, asks the live Mind a few questions and checks its answers by code: that it knows its own Earth's road to Year 0 and speaks as we. It asks on your own Claude login through the `claude` CLI, or with `--via api` as players do, for a few cents.
  - `npm run trace:mind`, with the dev server going, asks the live Mind every question in `evals/mind/cases.json`, each on a test Earth the file sets, and saves each answer beside what the Mind was told to `evals/mind/traces/`. It asks on your own Claude login through the `claude` CLI, at no API cost, with the same model, effort and prompt, though the CLI also tells it today's date and that it runs in the Claude Agent SDK. With `--via api` it asks as players do, about 4 cents a question. With `--dry`, it shows what each test Earth tells the Mind, for nothing. The dev server alone sends what the Mind was told. Each answer is checked by code against the Mind's rules in `evals/mind/checks.mjs`: we not I, length, punctuation, plain names, odds in words, and never naming a model.
  - `npm run review:mind` opens them at http://localhost:5190, one at a time, to mark pass or fail with a note, kept in `evals/mind/labels.json`. Reading them finds how the Mind fails before any check is written for it.
- `lib/game/`: the clock, save types, and the browser store.
- `lib/sim/`: the simulation, ported a piece at a time from Python in `../calcs/`. `npm test` checks it against Python.
  - `data/worlds/`: the pool of drawn worlds, one per seed, written by `python3 ../calcs/export_worlds.py`. They hold the seed's truth, so they ride inside the Worker, never among the public files. `worker/world.ts` reads them there, and `lib/sim/world.ts` from disk for the tests.
  - `knowledge.ts` is the wall: the Mind is told what Earth knows at that moment, never the truth.
  - `pyrandom.ts` is CPython's random generator, so a roll here matches the same roll in the calcs and the mocks.
  - `works.ts` paces Earth's works from the player's orders, in one loop from Year 0. `data/works.json` holds each work's Years and want.

- `lib/drift.ts`: the game's one scene, in Three.js with the atlas's ephemeris, stars and galaxies from `../src`, `../assets` and `../data`. Today's Earth with its night lights, the planets, the HYG stars, and a Milky Way drawn to its measured arms. It draws four scales, each in its own units, far to near, so no float spans Earth to Andromeda. Sources in HOLOS_RESEARCH.md, The drift.
  - `lib/flight.ts` places its camera: one director for the title's loop, every screen's view and the map, easing distance, turn and tilt between them, so the camera zooms, pans and orbits from one view to the next and never cuts. The map rests at five stops, flies between them, and turns with a drag.
  - Three.js and Astronomy Engine come from the atlas's packages at the repo root. The game keeps only Three.js's types.
- `components/sky.tsx`: the game's one sky, behind every screen from the title to the charter and on into the shell, where the map strip is its window. Each screen's `SkyArt` is an empty box in its layout where the sky frames the screen's subject, with the screen's dials: the sunrise on Wake, the Sun's road on Where we come from (timed by `lib/game/road.ts`), the lights and threads on Who they are, the radar shell on Where things stand, the flight out to Voyager 1 on What you inherit, and Earth and the Moon behind the charter. Each screen's story waits for the camera to arrive.
- `components/drift.tsx`: a new game's first screen, before Wake. No title: the slow loop from Earth out to the Local Group and home, and Begin game, which dives home to Earth.
- `components/map-strip.tsx`: the map strip, the sky's window in the shell. The camera flies in from the charter, and back out to the title on New game.
- `components/menu.tsx`: the galactic year in the top bar's corner, Sol circling the galaxy's glowing, breathing core. It opens a drawer: the player's Anthropic key, New game, the about pages, and links out.

- The game is always dark: the colors in `app/globals.css`, and `lib/ink.ts` for the memory screens' canvases. Screens before the shell open with `components/screen-bar.tsx`, by way of `Spread`: the real record on the left.
- `lib/motion.ts`: the full motion treatment, from the animaxxing skills, whose sources are in `../skills-lock.json`. Every element enters from a blank screen, rests, and leaves. Mark an element `data-m` and give its screen a `useStage` intro. Reduced motion skips the travel.

Everything else inside the shell is placeholder.

Live at https://playholos.com, on the Cloudflare Worker `holos`. `npm run deploy` builds the client and the Worker and deploys both. Nothing deploys on push. The Worker's secrets, `ANTHROPIC_API_KEY` and `ACCESS_CODE`, are set with `npx wrangler secret put` and never committed. Locally they go in `.dev.vars`. The card a shared link shows and the home screen icon are drawn as the client is built, from `app/card.tsx` and `app/apple-icon.tsx`.

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
