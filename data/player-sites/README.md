# Player-site research snapshot

Retrieved September 7, 2026 from the NASA Exoplanet Archive `pscomppars` table using its [TAP service](https://exoplanetarchive.ipac.caltech.edu/docs/TAP/usingTAP.html). `query-url.txt` preserves the exact query; `exoplanets.json` preserves the response, including values not used in the visualization. Builds do not fetch data.

The nine exoplanets in this deliberately selected sample are cataloged planets, not confirmed habitable worlds. Their civilizations, biology, environments, and future technology are fictional. Earth is added separately as the tenth site and reference origin. This selection is neither exhaustive nor a ranking of habitability. Nearby small-planet detections are dominated by M-dwarf hosts in this sample; it is not representative of all possible civilization sites.

## Adopted positions

The overlay takes host RA and declination in degrees and distance in parsecs, converts distance using the atlas's `PC_LY`, then uses its existing equatorial-to-Galactic transform. Positions use the atlas's Sun-centered `(Galactic X, Galactic Z, -Galactic Y)` axis order. Markers represent host systems, not resolved planetary orbital positions. Earth is represented by the Sun at this scale.

**GJ 273 distance override:** the retrieved composite row lists 5.921535 pc, inconsistent with the 3.75 pc system described by [Pozuelos et al. (2020)](https://arxiv.org/abs/2006.09403) and the roughly 12.4-light-year position in the existing HYG atlas. The overlay explicitly adopts **3.75 pc**, or approximately 12.23 ly, while retaining the original archive row. The marker's evidence panel links to the adopted study. This does not claim to resolve the archive discrepancy or supply a new uncertainty estimate.

Other systems use the snapshot's `sy_dist`. Catalog coordinates and distances are adopted estimates, not exact synchronized present-day positions. Proper motion, radial velocity, light-time reconstruction, exoplanet orbits, and a future-epoch propagation are not modeled. Updated host estimates can differ from the older HYG background points; godview suppresses the ordinary catalog labels rather than rewriting the HYG dataset.

The raw composite table includes estimated quantities. In particular, an inferred radius or a mass estimated from a mass–radius relationship must not be described as a direct measurement. The overlay does not display those fields.

## Interpretation sources

- [NASA: GJ 1002 b and c](https://science.nasa.gov/universe/exoplanets/discovery-alert-two-nearby-worlds-might-be-habitable/) explains the conditional meaning of the habitable zone.
- [ESO: Ross 128 b](https://www.eso.org/public/news/eso1736/) describes the low-mass planet and comparatively quiet host; it does not establish life or a habitable surface.
- [NASA: Webb observations of TRAPPIST-1](https://science.nasa.gov/mission/webb/science-overview/science-explainers/what-is-webb-revealing-about-the-trappist-1-system/) provides atmospheric-observation context. The visualization does not label TRAPPIST-1 e as possessing a confirmed habitable atmosphere.
- Each observed exoplanet links to its NASA Exoplanet Archive overview for the planet record.

## Fictional comparison

`src/player-sites.js` separately defines Earth plus nine hand-authored sites at radii of 19,000–37,000 ly from the adopted Galactic center, with small vertical offsets. Those hosts and planets are invented; names do not refer to identified stars or measured spiral-arm positions. The galaxy density background is the existing labeled illustration. This is a dispersed comparison layout, not a probabilistic population model or a final recommendation.

Distances are Euclidean separations between the adopted fixed 3D positions. Minimum one-way message delays use `distanceLy × 5 real minutes`; they omit transmission duration, processing, motion, obstruction, receiver availability, and signal-detection feasibility. Lines connect selected sites for measurement, not for established communications, routes, or ownership.
