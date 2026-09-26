# Game-region census: provenance

Retrieved September 26, 2026 from VizieR's TAP service. `query-url.txt` preserves the census query and `match-query-url.txt` the full-catalog position query used only for cross-matching. The responses live in `.cache/` (`gcns-100ly.csv`, `gcns-all-positions.csv`) with `hygdata_v41.csv`; `scripts/prepare-neighborhood.py` turns them into `data/neighborhood.bin` and `data/neighborhood-meta.json`. Builds do not fetch data.

## Sources

- **Gaia Catalogue of Nearby Stars** (GCNS): Gaia Collaboration, Smart et al. (2021), *Gaia Early Data Release 3: The Gaia Catalogue of Nearby Stars*, A&A 649, A6, [doi:10.1051/0004-6361/202039498](https://doi.org/10.1051/0004-6361/202039498); VizieR J/A+A/649/A6, table `table1c`. Credit: ESA, Gaia DPAC.
- **HYG 4.1**, David Nash / Astronexus, CC BY-SA 4.0: Hipparcos stars that Gaia does not measure, and landmark names.

## License

Gaia data are distributed under **CC BY-NC 3.0 IGO** ([ESA terms](https://www.cosmos.esa.int/web/esdc/terms-and-conditions)). Non-commercial use with the credit line above is permitted. **Any commercial use, including a paid game, requires prior authorization from ESA** (data.licences@esa.int). HYG remains CC BY-SA 4.0.

## Method

- **Census:** every GCNS object whose median Galactic position (`xcoord50`, `ycoord50`, `zcoord50`, parsecs) lies within 100 ly of the Sun: 9,281 objects. Distance is the length of that position vector; `Dist50` is not used because VizieR rounds it to four digits in kiloparsecs.
- **Bright-star supplement:** GCNS contains nothing brighter than G ≈ 2.1 within this radius, so Sirius, Vega, Alpha Centauri A and B, Arcturus, and others are absent. A HYG star with a Hipparcos number and a HYG distance within 100 ly is added when no GCNS object anywhere in the catalog (out to 100 pc) matches it: 213 stars. Matching moves the HYG J2000.0 position to J2016.0 with its proper motion, then accepts the nearest GCNS object within 60″ whose magnitude is plausible (V − G between −1.0 and 4.5) and, beyond 3″, whose distance agrees within 35%. The magnitude test stops a bright star from matching a faint neighbor, such as Aldebaran and the 12th-magnitude object 31″ from it.
- **Not supplemented:** HYG entries without Hipparcos astrometry. An unmatched faint Gliese entry is more often a duplicate component or a mis-estimated distance than a star Gaia missed.
- **Photometry for map styling:** Gaia G is converted to an approximate V with the Riello et al. (2021) G − V polynomial in BP − RP, and BP − RP to an approximate B − V along the dwarf sequence. Missing colors assume BP − RP of 0.3 for likely white dwarfs (`WDprob` > 0.5) and 2.5 otherwise. These values set point size and tint only.
- **Landmarks:** 17 well-known stars, positioned from their Gaia counterpart when one exists and from HYG otherwise; `neighborhood-meta.json` records which.

## Limits

- The census misses the faintest brown dwarfs, which are too faint for Gaia at these distances, and some close binaries without a Gaia solution.
- Objects are counted individually, so binary and multiple components count separately. The count is of objects, not systems.
- Distances are Gaia parallax estimates with their own uncertainty; positions are at epoch J2016.0 (Gaia) or J2000.0 (HYG supplement). Proper motion is not animated.
- No planets or civilizations are included. Homes in the game are invented planets around these real stars.
