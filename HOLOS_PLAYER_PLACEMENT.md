# Holos — Ten-player placement exploration

September 7, 2026. Two provisional admin visualization scenarios, not final starting locations or gameplay mechanics.

The existing map now has an optional **Godview · 10 players** overlay. It uses the same scene, camera, and spatial frame as the atlas. All sites are visible to the admin regardless of what a player could observe. Select a marker or roster entry to compare its separation and minimum message delay to the other nine; use **Frame all 10** to return to the overview.

Open the built `index.html` and select Godview, or use `#godview-observed` / `#godview-speculative` as direct-entry fragments. This is a local, offline placement study, with no accounts, resource economy, AI simulation, missions, or running game clock.

## Scenario A: observed planet sites

Earth anchors a deliberately selected group of nine confirmed exoplanets. The exoplanet positions and existence are supported by catalogs; their habitability and all player civilizations remain speculative. This is not a claim that our stellar neighborhood contains ten civilizations.

Distances and delays below are **from Earth**. The interactive map calculates other player-to-player pairs.

| Player | Proposed site | Distance from Earth | Minimum one-way delay, real time |
| --- | --- | ---: | ---: |
| P01 | Earth | 0 ly | — |
| P02 | Proxima b | 4.24 ly | 21.2 minutes |
| P03 | Ross 128 b | 11.01 ly | 55.0 minutes |
| P04 | GJ 1061 d | 11.98 ly | 59.9 minutes |
| P05 | Luyten b / GJ 273 b | 12.23 ly | 1.0 hour |
| P06 | Teegarden b | 12.49 ly | 1.0 hour |
| P07 | GJ 1002 b | 15.81 ly | 1.3 hours |
| P08 | TRAPPIST-1 e | 40.54 ly | 3.4 hours |
| P09 | LHS 1140 b | 48.88 ly | 4.1 hours |
| P10 | TOI-700 d | 101.52 ly | 8.5 hours |

Across all 45 pairs, separations range from **4.24 to 111.70 ly**. Minimum one-way delays range from **21.2 minutes to 9.3 real hours**, with a median separation of 26.75 ly. This supplies varied local relationships with distant outposts, rather than equal spacing.

These are investigation-worthy sites, not nine proven Earth analogues. All nine exoplanet hosts in the sample are M dwarfs, reflecting the selected nearby detections rather than a decision that civilizations require red dwarfs. Detailed site evidence, the archive snapshot, and a documented GJ 273 distance discrepancy are in [the data notes](data/player-sites/README.md).

## Scenario B: speculative galactic sites

Earth remains the reference. Nine invented systems are dispersed through the Galactic disk at its actual mapped scale. Their host stars, planets, and environmental descriptions are fictional. Neither their arrangement nor the illustrative spiral background establishes where life is likely.

| Player | Invented world (except Earth) | Assumed host | Distance from Earth | Minimum one-way delay, real time |
| --- | --- | --- | ---: | ---: |
| P01 | Earth | Sun | 0 ly | — |
| P02 | Nacre | K dwarf | 13,727 ly | 47.7 days |
| P03 | Ilex | G dwarf | 32,003 ly | 111.1 days |
| P04 | Serein | K dwarf | 41,284 ly | 143.3 days |
| P05 | Orison | G dwarf | 60,607 ly | 210.4 days |
| P06 | Talus | K dwarf | 49,996 ly | 173.6 days |
| P07 | Morrow | G dwarf | 56,042 ly | 194.6 days |
| P08 | Pelagos | K dwarf | 39,792 ly | 138.2 days |
| P09 | Cael | G dwarf | 28,089 ly | 97.5 days |
| P10 | Lumen | K dwarf | 9,932 ly | 34.5 days |

Across all pairs, separations range from **9,932 to 71,464 ly**. Minimum one-way delays range from **34.5 to 248.1 real days**, with a median separation of 41,644 ly. A round-trip exchange takes at least twice as long.

This is an intentionally dispersed comparison, not a recommendation for the first ten-player population. It shows how different a galactic distribution is from a local one under the agreed clock. Fictional worlds could instead be placed within a local region; speculation does not require galaxy-wide separation. A later comparison could hold scale constant and vary only the use of cataloged versus invented sites.

## What this exploration establishes

- At **5 real minutes per game year**, nearby stellar distances can support exchanges within a session or day. Dispersing only ten civilizations across the disk moves even the nearest exchanges into weeks of real time.
- Equal initial capabilities do not make the geography equal. Neither layout has been optimized for competitive balance.
- Knowing a real planet exists does not establish that a civilization could develop there. Fictional hosts give more control over Earth-like starting assumptions but less observational grounding.
- The local scenario's dense population needs a setting explanation. The galactic scenario's sparse population needs a satisfying activity model during very long contact delays. Neither resolves the Fermi paradox by itself.
- Admin visibility is a visualization convenience. The connecting lines do not mean players know each other, possess communications links, or have observations of a shared present.

## Verification and limits

The production build and the existing 23 numerical tests passed. An additional check compared all 36 non-Solar observed-site pairs against an independent spherical-coordinate distance calculation; both ten-site sets and the game-clock conversions were checked. Desktop and mobile browser checks cover rendering and interaction.

Positions are fixed catalog estimates or authored fictional coordinates. The visualization does not propagate stars to the speculative future, reconstruct light cones, resolve planetary orbits, or compute detectability. Message times are static geometric lower bounds. No final placement, civilization density, or new game rule has been adopted.
