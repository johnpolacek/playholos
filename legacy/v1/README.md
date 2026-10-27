# Legacy · v1, the cohort design

The multiplayer design, September 25 to October 6, 2026. Players joined a cohort, chose an invented civilization (Veyra, Hael or Kesh), and woke together at a scheduled start, with AI filling empty seats and Earth run by AI. Git tag `v1-cohort` marks its last commit.

It is no longer maintained. v2 is a single-player game on Earth among seeded neighbors, in the top-level [HOLOS_GAME_CONCEPT.md](../../HOLOS_GAME_CONCEPT.md). Where v2 says nothing, v1's rules still hold. Where they disagree, v2 wins.

- [HOLOS_GAME_CONCEPT.md](HOLOS_GAME_CONCEPT.md): every v1 decision, dated, with the research baseline of October 1, 2026.
- [HOLOS_PROJECTS.md](HOLOS_PROJECTS.md): the project catalog, generated from `home-mocks/catalog.py`.
- [home-mocks/](home-mocks/index.html): the screens, the cohort playtest, Veyra deduces, and the catalog. `python3 legacy/v1/home-mocks/build-zoom.py` rebuilds them (needs `.cache/hygdata_v41.csv`) and writes `HOLOS_PROJECTS.md` here. `home-mocks/LEADS.md` tests every seat's leads against the orbits Earth's data permit.
