# Holos — Earth to the Local Group

Open **index.html** in a modern browser. The atlas is drawn as minimalist line diagrams, ink on paper or chalk on slate, with a light / dark toggle. The application, the surface maps its globes are traced from, ephemeris, and catalogs are embedded in that file. No server, account, CDN, or internet connection is needed. WebGL 2 / hardware acceleration is required.

**Science review:** the [October 1, 2026 research baseline](legacy/v1/HOLOS_GAME_CONCEPT.md#research-baseline-october-1-2026) records observation limits, uncertain clues, cohort catalog pinning and engineering assumptions that still need validation.

**Game design:** v2, a single-player game on Earth among seeded neighbors, is in [HOLOS_GAME_CONCEPT.md](HOLOS_GAME_CONCEPT.md). It is built one question at a time and has no mocks yet. Where it says nothing, v1 holds. v1, the multiplayer cohort design, is frozen in [legacy/v1](legacy/v1/README.md): its rules, the project list in [HOLOS_PROJECTS.md](legacy/v1/HOLOS_PROJECTS.md), and the screens in [home-mocks/index.html](legacy/v1/home-mocks/index.html), built by `python3 legacy/v1/home-mocks/build-zoom.py` (needs `.cache/hygdata_v41.csv`). The build also writes [mocks.md](legacy/v1/home-mocks/mocks.md), a plain-text copy for searching, diffs, and LLMs; `python3 legacy/v1/home-mocks/extract.py` regenerates it alone. First-round records are in [legacy/alpha-1](legacy/alpha-1/README.md).

**Color edition:** open **color.html** for the original rendering: photographic surface maps, glowing stars, and a dark interface. Positions, orbits, catalogs, measurements, navigation, Godview, and the player home are identical; only the drawing differs. It is also self-contained and offline. With `npm run dev`, visit **http://127.0.0.1:4173/color.html**. See [Drawing style](#drawing-style).

Explore Earth and the Moon, all eight planets, **109,400 HYG stars** (958 searchable), the Milky Way, and **10 selected neighboring galaxies**. Search for names and aliases such as M31 or M33. This is an educational coordinate atlas with documented observations and uncertainty, not a complete or exact reconstruction of the universe.

**Godview · 10 players** is an admin view: it sees every civilization site regardless of what a player could observe. It currently holds two ten-player placement layouts, Earth plus nine real exoplanet sites or nine invented systems across the Milky Way. Select a site for pairwise distances and message delays at five real minutes per game year. The layouts predate the 100 ly game region. Direct entry: `#godview-observed` or `#godview-speculative`. See [the placement notes](legacy/alpha-1/HOLOS_PLAYER_PLACEMENT.md) and [data provenance](data/player-sites/README.md).

The atlas occupies **one Three.js scene with one camera**. Scroll, pinch, or use the zoom slider to move continuously across scales. Destination buttons or keys **1–5** animate the camera through the same world. Drag, scroll, or press **Escape** to stop a flight; choose another destination to redirect it. Drag to orbit, right-drag to pan, **/** to search, **R** to reset, and **Space** to play or pause planetary time. Arrow keys and **+ / −** also control the camera.

Coordinates use astronomical units, a floating origin, uniform render scaling, and logarithmic depth. Planetary **True sizes** are enabled by default. Optional enlarged disks, illustrative Milky Way structure, and a statistical asteroid belt are labeled as visualization aids. Density reconstructions are off by default. Galaxy centers, projected photometric contours, and distance uncertainty are visible by default. The Local Group overview also includes enlarged, illustrative galaxy portraits; turn off **Galaxy portraits** for a view of the measured overlays alone.

## Game region

Choose **Game region** in the atlas header, or open `index.html#region`. It is a design study of where the planned game plays: the real solar neighborhood, 100 light-years around the Sun, with civilizations seeded inside 50 ly (see [HOLOS_GAME_CONCEPT.md](HOLOS_GAME_CONCEPT.md)). Inside that sphere the atlas swaps its HYG subset for a nearby-object census: **9,494 objects**, 9,281 from the [Gaia Catalogue of Nearby Stars](https://doi.org/10.1051/0004-6361/202039498) plus 213 bright Hipparcos stars Gaia does not measure. The view draws the region edge and the seeding limit as sphere outlines, labels 17 landmark stars, and reports counts and light-time at the game clock. This counts objects, including separate stellar components, rather than distinct systems. The faintest companions remain incomplete. No planets or civilizations are shown. **View from above** looks down the Galactic pole; **Frame the region** or **R** restores the overview.

Gaia data are **CC BY-NC 3.0 IGO**: non-commercial use with credit (ESA, Gaia DPAC). A paid game would need prior authorization from ESA. Provenance, matching method, and limits: [data/neighborhood-sources/README.md](data/neighborhood-sources/README.md). Rebuild the census with `python3 scripts/prepare-neighborhood.py` after downloading its two queries into `.cache/`. The view lives in `src/region.js`; the census layer and outlines are in `src/universe.js`.

## Player home preview

Choose **Player home** in the atlas header, or open `index.html#home`; `#home-system` opens the Solar System overview. It is an early shell for the illustrative **Terran Continuity** on Earth: **Homeworld** and **Home system** fly the atlas camera through the same scene, beside a civilization menu whose game content is placeholder. The [v1 home mocks](legacy/v1/home-mocks/index.html) superseded its design. v2 returns the player to Earth. Entry resets the astronomical snapshot to 2026-09-06 12:00 UTC. The shell lives in `src/player-home.js`, with styles in `src/style.css` and integration in `src/app.js`.

## Drawing style

`npm run build` writes `index.html` (line drawing) and `color.html` (color edition) from the same source; `__LINE_ART__` is set at build time for `index.html`. The line drawing's conventions:

- Orbits are solid hairlines; distance guides are dashed. Line widths stay constant in screen pixels at every scale.
- Planets, the Moon, and the Sun appear as open circle symbols (Saturn with a ring) until their true globe is larger than the symbol.
- Globes are traced from the same static surface maps. Earth shows coastlines from its land–ocean contrast and a faint 30° graticule. Other bodies show luminance contours; Jupiter, Saturn, Uranus, and Neptune are averaged along longitude first so contours follow their bands. Saturn's rings are drawn as their main edges and the Cassini division.
- Night sides are hatched from the computed sunlight direction.
- Stars are stipple: faint stars are dots, bright stars are open rings. The illustrative asteroid belt becomes evenly dotted rings.
- Galaxy portraits are pen drawings, and projected galaxy contours are hatched instead of shaded.
- The Solar System destination looks across the orbital plane at a lower angle than the color edition.
- A light / dark toggle sits in the header and the player home header. Light is ink on paper; dark is chalk on slate. It follows the system setting until the viewer chooses, then remembers the choice in local storage.

These are map symbols, not measured sizes or structures; the in-app **Model and sources** dialog says so and links to the color edition. `index.html` omits the cloud, night-lights, Sun, and ring-alpha maps it does not draw, so it is smaller than `color.html`. Rendering lives in `src/line-art.js` and interface overrides in `src/line-art.css`; hooks in `src/universe.js`, `src/galaxy-portraits.js`, and `src/app.js` are guarded by `LINE_ART`, so `color.html` keeps the original rendering.

## Scientific scope

The **Model and sources** dialog explains these assumptions inside the application. Selecting a neighboring galaxy shows its adopted distance study and expandable measurement details.

- **Planet and Moon positions:** [Astronomy Engine 2.1.19](https://github.com/cosinekitty/astronomy), using its VSOP87-derived planetary and lunar ephemeris. Its design target is approximately one arcminute, with upstream comparisons against JPL Horizons and NOVAS. Earth uses its actual center. Coordinates are geometric J2000 vectors for the selected UTC time, without observer light-time, aberration, or atmospheric corrections. Initial time is September 6, 2026, noon UTC; the date control spans 1800–2050.
- **Orbit guides:** planetary ellipses use [JPL's approximate Keplerian elements](https://ssd.jpl.nasa.gov/planets/approx_pos.html), Table 1. Body positions use the ephemeris, so the guides are approximate. The Moon's guide samples its geocentric ephemeris over a sidereal month and refreshes daily.
- **Surfaces and rotation:** spherical mean radii follow [JPL's physical parameters](https://ssd.jpl.nasa.gov/planets/phys_par.html). Poles and prime-meridian rotation follow Astronomy Engine's IAU 2015 implementation. Texture maps are static composites; absolute texture longitude registration and colors are not independently calibrated. Rendering omits oblateness, terrain, and current weather. Other moons, dwarf planets, comets, spacecraft, and exoplanet orbits are omitted. The optional asteroid belt is generated, not a catalog of measured asteroids.
- **Stars:** [HYG 4.1](https://github.com/astronexus/HYG-Database) combines Hipparcos, Yale, and Gliese sources. The subset retains distances in **(0, 1,000] parsecs**, excluding missing-distance sentinels. It is incomplete and has varying measurement precision. Empty space beyond its survey cut is not an observed absence of stars. Positions stay at **J2000.0**, independently of the planetary clock; proper motion is not animated. Search includes named stars, stars closer than 12 parsecs, and stars brighter than apparent magnitude 3. Multiple-star components can remain unresolved.
- **Reference frame:** star positions are recomputed from HYG RA, declination, and distance fields, then transformed into Galactic coordinates. The atlas uses axis order `(Galactic X, Galactic Z, −Galactic Y)`. The embedded star buffer stores light-years; camera and planetary calculations use AU. J2000 equatorial ephemeris vectors and galaxy directions use the same transform. Point size, brightness, and color favor legibility and do not represent physical stellar radii or calibrated photometry.
- **Milky Way:** the default view shows HYG and a Galactic center marker. The center adopts the J2000 radio position of [Sagittarius A*](https://simbad.cds.unistra.fr/simbad/sim-id?Ident=Sagittarius+A) at **8,277 pc**, with statistical uncertainty 9 pc and systematics roughly 30 pc ([GRAVITY Collaboration 2022](https://www.aanda.org/articles/aa/full_html/2022/01/aa42465-21/aa42465-21.html)). The optional disk, bar, and spiral arms are a seeded statistical illustration; particle positions, arm paths, and the roughly 100,000-light-year disk boundary are not measurement results. We do not have a complete 3D census or an external photograph of our galaxy.
- **Neighboring galaxies:** the pinned [Local Volume Database v1.1.1, released August 12, 2026](https://github.com/apace7/local_volume_database/releases/tag/v1.1.1), supplies observed centers and adopted measurements with original-study references. Selected objects are Andromeda, Triangulum, the Magellanic Clouds, M32, NGC 205, IC 10, NGC 6822, IC 1613, and WLM. This is not a complete census; different methods can give different distance estimates. The Magellanic Clouds use direct eclipsing-binary distances from [Pietrzyński et al. 2019](https://arxiv.org/abs/1903.08096) and [Graczyk et al. 2020](https://arxiv.org/abs/2010.08754), with statistical and systematic errors combined in quadrature for display. Other distance intervals are transformed from reported distance-modulus bounds. Heavier line segments (gold in the color edition) show those reported 1σ intervals along our line of sight, not galaxy lengths.
- **Galaxy outlines:** hatched ellipses (blue in the color edition) show sky-projected photometric contours in the observer's tangent plane. Most use the catalog's half-light semi-major axis, ellipticity, and position angle. Andromeda and Triangulum use [RC3 B-band 25 mag/arcsec² isophotes](https://cdsarc.cds.unistra.fr/viz-bin/ReadMe/VII/155?format=html), which are not directly comparable to half-light contours. These are fitted summaries of observations, not exact boundaries or 3D disks. Missing orientations stay unknown: SMC and IC 10 have center markers without ellipses. Stellar halos can extend farther. Marker size and color are map symbols. Galaxy motions, interactions, dark matter, and expansion are not simulated.
- **Galaxy portraits:** screen-facing, procedurally drawn map symbols make the major spirals and isolated dwarfs readable in the Local Group overview. Their apparent sizes, inclinations, colors, spiral arms, dust lanes, and generated stars are artistic choices, not observed structure or physical extents. Centers remain at catalog positions; portraits fade out as you approach the measured contours. Click a portrait or catalog center to explore it. On phones the overview prioritizes the three main galaxy labels; companions remain tappable and searchable. The dashed Milky Way–Andromeda ruler displays the 3D separation of the adopted centers (about 2.54 million light-years), not an orbit.
- **Epochs and framing:** stars remain at their catalog epoch and galaxies at their adopted observed estimates; the planetary clock does not reconstruct a simultaneous present-day universe from ancient light. The overview anchor is the framing midpoint of the Milky Way and Andromeda, not a measured barycenter. Guide rings are 1, 2, and 3 million light-years from the Milky Way center.

## Editing and rebuilding

```sh
npm install
npm run build
npm test
npm run dev
```

The preview is `http://127.0.0.1:4173`. The build creates portable `index.html` and `color.html`; either file can be shared on its own. Ordinary builds do not fetch data.

- `src/app.js`: camera controls, travel, interface, and render loop.
- `src/universe.js`: persistent bodies, observed contours, catalog points, and optional illustrations.
- `src/galaxy-portraits.js`: seeded atlas illustrations and responsive screen-space sizing.
- `src/navigation.js` / `src/coordinates.js`: reference frame, floating origin, zoom anchors, and flights.
- `src/ephemeris.js`: geometric positions and IAU orientations.
- `src/galaxies.js`: names, aliases, projected contours, and distance intervals.
- `src/astronomy.js`: approximate orbit guides and physical parameters.
- `src/template.html` / `src/style.css`: interface and source explanations.
- `src/line-art.js` / `src/line-art.css`: line drawing, themes, and paper / slate interface.
- `data/galaxies.json`: adopted measurements. Rebuild offline with `python3 scripts/prepare-galaxies.py`; provenance is documented in `data/galaxy-sources/README.md`.
- `data/stars.bin`: little-endian float32 records: Galactic X, Z, −Y (light-years), apparent magnitude, B−V color index.
- `data/stars.json`: searchable catalog subset.
- `data/neighborhood.bin` / `data/neighborhood-meta.json`: the game-region census, same record layout as `stars.bin` with approximate V and B−V for Gaia objects, plus counts and landmarks. Built by `scripts/prepare-neighborhood.py`.
- `scripts/prepare-catalog.py`: star preprocessing; expects the [original HYG CSV](https://raw.githubusercontent.com/astronexus/HYG-Database/main/hyg/CURRENT/hygdata_v41.csv) at `.cache/hygdata_v41.csv`.

## Attribution

Planet maps: **Solar System Scope / INOVE**, [texture collection](https://www.solarsystemscope.com/textures/), **CC BY 4.0**, based on NASA imagery. Composite maps have enhanced colors and some filled gaps; originals remain in `assets/`.

Star data: **David Nash / Astronexus, HYG 4.1**, **CC BY-SA 4.0**. The filtered/reprojected catalog and embedded copy carry the same license (`data/HYG-LICENSE.txt`). Galaxy compilation: **Andrew B. Pace, Local Volume Database**, **CC0**, with original studies and RC3 credited in the source records.

Three.js and Astronomy Engine: **MIT**. Full notices are embedded in the HTML and reproduced in `THIRD_PARTY_LICENSES.md`; that file also documents GSAP and data attribution.

## Verification

Numerical tests compare all eight planets and the Moon with independent **JPL Horizons ICRF vectors at three dates** (J2000, September 2026, and December 2049), requiring angular differences below one arcminute and radial differences below 0.1%. Additional checks cover varying lunar distance, an IAU pole reference, coordinate directions independently calculated with Astropy, projected ellipse axes and position angles, missing structural measurements, and asymmetric distance intervals. Source URLs accompany the fixtures.

Existing tests cover approximate orbit guides, Julian dates, physical scale conversion, every binary star record, floating-origin precision, continuous reversible zoom anchors, and interruptible travel. Browser verification covers navigation and search, observed defaults and optional overlays, uncertainty toggles, planetary close-ups, responsive layout, persistent scene objects, simulation time, and direct offline loading. These checks validate implementation within the stated model; they do not establish catalog completeness or eliminate observational uncertainty.
