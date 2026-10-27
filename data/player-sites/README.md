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

## Habitability review and selection rule

The user requires a real starting world to support a scientifically defensible life-bearing scenario, not simply lack a proof of sterility. Each exoplanet's evidence panel therefore links to habitability research as well as its catalog record. These sites remain provisional; no extraterrestrial life or player civilization is established by the sources. The assessment concerns possibilities under specified assumptions, not the probability that a civilization actually arose there.

- **Proxima b:** [NASA's coupled ocean/climate simulations](https://www.giss.nasa.gov/research/features/202002_proxima/) find liquid-water scenarios given suitable atmospheres and oceans. [Atmospheric escape modeling](https://www.nasa.gov/science-research/heliophysics/an-earth-like-atmosphere-may-not-survive-proxima-bs-orbit/) highlights a serious retention problem; favorable climate simulations do not establish that the needed atmosphere survived.
- **Ross 128 b:** the ESO source above supports a potentially temperate low-mass world around a relatively quiet star, not a confirmed temperate surface. Unknown reflectivity and atmosphere remain decisive.
- **GJ 1061 d:** the [discovery study](https://arxiv.org/abs/1908.04717) places it in the liquid-water habitable zone; composition and atmosphere remain unknown.
- **GJ 273 b:** [formation and dynamical modeling](https://arxiv.org/abs/2006.09403) considers habitability and potential water delivery, which are not measurements of a surface ocean.
- **Teegarden b:** a [2025 climate study](https://arxiv.org/abs/2510.11940) permits habitable conditions with an assumed Earth-like atmosphere at its preferred irradiation estimate. A higher irradiation estimate produces runaway warming in the model. This is a conditional inner-edge choice.
- **GJ 1002 b:** NASA's discovery discussion above supports an Earth-mass-scale habitable-zone candidate; air and water remain assumptions.
- **TRAPPIST-1 e:** [NASA's Webb account, updated January 2026](https://science.nasa.gov/missions/webb/nasa-webb-looks-at-earth-sized-habitable-zone-exoplanet-trappist-1-e/), allows atmospheric scenarios compatible with some liquid water and also an airless interpretation. Do not extrapolate constraints on other TRAPPIST-1 planets to e.
- **LHS 1140 b:** [2024 transmission spectroscopy](https://arxiv.org/abs/2406.15136) motivates water-rich/secondary-atmosphere scenarios; neither an ocean nor nitrogen atmosphere is confirmed. An [August 2026 preprint](https://arxiv.org/abs/2608.13473) finds no helium absorption in four Webb transits and leaves the planet's nature unresolved. It is substantially larger than Earth, so an Earth-twin landscape is not justified.
- **TOI-700 d:** [NASA's habitable-zone account](https://science.nasa.gov/photojournal/toi-700-habitable-zone-diagram/) places the Earth-sized planet in the conservative habitable zone. Its actual atmosphere and surface are not established.

Review dated September 7, 2026. This is a documented provisional assessment, not an exhaustive guarantee against every published constraint. Before final adoption, assign a concrete hypothetical environment to each site and check it against the then-current evidence. Invented planets around real hosts likewise need detection-limit and dynamical checks; the current fictional systems have no catalog-host association.

## Fictional comparison

`src/player-sites.js` separately defines Earth plus nine hand-authored sites at radii of 19,000–37,000 ly from the adopted Galactic center, with small vertical offsets. Those hosts and planets are invented; names do not refer to identified stars or measured spiral-arm positions. The galaxy density background is the existing labeled illustration. This is a dispersed comparison layout, not a probabilistic population model or a final recommendation.

Distances are Euclidean separations between the adopted fixed 3D positions. Minimum one-way message delays use `distanceLy × 5 real minutes`; they omit transmission duration, processing, motion, obstruction, receiver availability, and signal-detection feasibility. Lines connect selected sites for measurement, not for established communications, routes, or ownership.
