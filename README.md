# Holos — Earth to the Local Group

Open **index.html** in a modern browser. The complete 3D application, thirteen texture maps, and star catalog are embedded in that one file. No server, account, CDN, or internet connection is needed. WebGL 2 / hardware acceleration is required.

The atlas covers:

- Earth and the Moon, with a textured globe, clouds, atmosphere, sunlight, and night lights.
- All eight planets, textured close-ups, Saturn's rings and ring shadows, and date-dependent elliptical orbits.
- A local star map containing **109,400 HYG stars**, with **958 searchable entries**.
- A Milky Way reconstruction containing a disk, spiral-arm density enhancements, central bar and bulge, the Sun's approximate location, and the measured catalog.

- A Local Group view with **10 neighboring galaxies**, searchable by common names and catalog aliases such as **M31** and **M33**. Select a galaxy for a closer look, then return to the group overview.

The entire atlas occupies **one Three.js scene with one camera**. Earth, the planets, measured stars, and all galaxies keep their positions in a shared Galactic reference frame. Scroll, pinch, or use the zoom slider to move continuously from Earth out to the Local Group. The destination buttons or keys **1–5** animate the camera through that same world. Drag, scroll, or press **Escape** to stop anywhere along a flight; choose another destination to reverse or redirect it.

Drag to orbit and right-drag to pan. Search with **/**. Select planets or labeled stars to fly to them. **R** resets the current perspective; **Space** plays or pauses the planetary clock. Keyboard controls also support arrow keys and **+ / −**. The view center gradually moves from Earth to the Sun, the Galactic center, and then the Local Group overview during outward zooming, and follows the same path inward. Panning lets you explore independently of that path.

Physical coordinates use astronomical units and a floating origin. Uniform render scaling and logarithmic depth keep close-up planetary surfaces and faraway stars stable across the distance range. Geometry detail, labels, and brightness adapt with distance; the application does not replace scenes or cover travel with a screen fade.

The Solar System's **True sizes** switch uses physical radii instead of enlarged planet disks. Positions and orbital distances remain linear in either setting. The galaxy's **Galaxy reconstruction** switch isolates the measured stars and galaxy center markers.

## Scientific scope

This is an educational atlas, with its assumptions available inside the **Model and sources** dialog:

- Planetary orbits use [JPL's approximate Keplerian elements and rates](https://ssd.jpl.nasa.gov/planets/approx_pos.html), Table 1, for 1800–2050. Earth uses the Earth–Moon barycenter. UTC substitutes for TDB; this is not a high-precision ephemeris. Initial date: September 6, 2026, noon UTC.
- Radii and rotation periods follow [JPL's physical parameter table](https://ssd.jpl.nasa.gov/planets/phys_par.html). Planetary surfaces are spherical, using mean radii. Axial tilt magnitudes are included; pole longitudes and texture longitudes are illustrative. Cloud maps are static composites. General relativistic effects and gravitational N-body interactions are not simulated.
- The Moon has its actual mean distance and radius, an inclined circular orbit, and its sidereal period. Its phase, node, and orientation are illustrative. The asteroid belt is a statistical distribution, not an asteroid ephemeris. Other moons, dwarf planets, comets, spacecraft, and exoplanet orbits are not yet included.
- [HYG 4.1](https://github.com/astronexus/HYG-Database) combines Hipparcos, Yale, and Gliese sources. The subset retains distances in **(0, 1,000] parsecs**, excluding missing-distance sentinels. It is neither complete nor uniformly precise. Star positions stay at **J2000.0**, independently of the planetary clock.
- Star Cartesian positions are recomputed from HYG's RA, declination, and distance fields, then transformed into Galactic coordinates. This avoids small inconsistencies between some updated spherical fields and legacy Cartesian fields. The atlas uses the axis order `(Galactic X, Galactic Z, −Galactic Y)`; the embedded star buffer stores light-years, while camera and planetary calculations use astronomical units. Planetary ecliptic coordinates are rotated into this same Galactic frame. Point size/brightness/color favor legibility and are not calibrated photometry or stellar radii.
- Search includes named stars, stars closer than 12 parsecs, and stars with apparent magnitude brighter than 3. Multiple-star components may remain unresolved.
- The galaxy follows the broad morphology in [ESA's guide](https://www.esa.int/Science_Exploration/Space_Science/Gaia/Guide_to_our_galaxy): approximately 100,000 light-years across, with the Sun about 26,000 light-years from the center. The disk/bar/arms are a seeded statistical density model, **not a catalog of individual known stars**. Spiral-arm locations are illustrative. The Sun is placed approximately 65 light-years above the model midplane. Dust extinction, galactic warp, stellar halo, and dark matter are not modeled in this version.
- Ten neighboring galaxies use Galactic coordinates and heliocentric distances from [McConnachie (2012), AJ 144, 4, Table 2](https://arxiv.org/html/1204.1562). This selection includes Andromeda, Triangulum, the Magellanic Clouds, M32, NGC 205, IC 10, NGC 6822, IC 1613, and WLM; it is not a complete census. Galaxy shapes, orientations, extents, and colors are illustrative seeded models, and small center markers favor legibility. Positions stay fixed as the planetary clock advances. The overview anchor is the midpoint of the Milky Way and Andromeda, not a measured barycenter. Guide rings are 1, 2, and 3 million light-years from the Milky Way. Galaxy motions, interactions, dark matter halos, and cosmic expansion are not simulated.

## Editing and rebuilding

```sh
npm install
npm run build
npm test
npm run dev
```

The local preview is `http://127.0.0.1:4173`. `npm run build` creates the portable `index.html`; only that file needs to be copied or shared. The source files and data are kept separately to make future expansion easier.

- `src/app.js`: camera controls, animated travel, interface, and render loop.
- `src/universe.js`: the persistent Three.js scene, bodies, star catalog, galaxy density, and adaptive rendering.
- `src/navigation.js`: shared reference frame, floating-origin projection, continuous zoom anchors, and camera flight paths.
- `src/galaxies.js`: curated Local Group positions, search aliases, and illustrative galaxy model parameters.
- `src/astronomy.js`: orbital calculations and physical parameters.
- `src/template.html` / `src/style.css`: document and interface.
- `data/stars.bin`: little-endian float32 records: Galactic X, Z, −Y (light-years), apparent magnitude, B−V color index.
- `data/stars.json`: searchable catalog subset.
- `scripts/prepare-catalog.py`: catalog preprocessing. It expects the [original HYG CSV](https://raw.githubusercontent.com/astronexus/HYG-Database/main/hyg/CURRENT/hygdata_v41.csv) at `.cache/hygdata_v41.csv`. Preprocessing is not needed for ordinary builds.

## Attribution

Planet maps: **Solar System Scope / INOVE**, [texture collection](https://www.solarsystemscope.com/textures/), **CC BY 4.0**, based on NASA imagery. Maps are supplied as composite imagery, with enhanced colors and some filled gaps. Rendering adds lighting and atmosphere; the original downloaded maps are retained in `assets/`.

Star data: **David Nash / Astronexus, HYG 4.1**, **CC BY-SA 4.0**. The filtered/reprojected catalog in `data/` and the embedded copy carry the same data license. See `data/HYG-LICENSE.txt`.

Three.js: **Three.js authors**, **MIT**. Its license is embedded in the HTML and reproduced in `THIRD_PARTY_LICENSES.md`.

## Verification

Numerical tests check Kepler convergence, orbital transformations, planetary distance bounds over 1800–2050, an independent JPL Horizons reference at J2000, Julian dates, physical scale conversion, and every binary catalog record. Navigation tests check coordinate rotation, floating-origin precision, continuous and reversible zoom anchors through the Local Group, galaxy coordinate distances and handedness, travel endpoints, and interruption without position jumps. Browser checks cover the outward and return journey, persistent scene/camera/body identities, scrolling across scales, galaxy selection and search aliases, planetary close-ups, simulation time, true-size and reconstruction toggles, responsive layout, and direct offline file loading.
