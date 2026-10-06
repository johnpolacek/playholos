# Holos · Research

Last updated: October 6, 2026.

Every source the game rests on, grouped by the question it answers. Each entry says what it found, why it matters to Holos, and where the design uses it. The rules are in [HOLOS_GAME_CONCEPT.md](HOLOS_GAME_CONCEPT.md). The atlas's own data sources (ephemeris, star catalogs, galaxies) are in the [README's scientific scope](README.md#scientific-scope) and the `data/*/README.md` files.

**Keeping it current.** Every Q&A round adds the sources it used. A newer result never deletes an older one: the older entry is marked *superseded* and points to the newer. The watch list at the end holds results the design is waiting on.

**Status.** *Published*: peer reviewed. *Preprint*: posted, not yet reviewed. *Preliminary*: a talk or press release, no paper yet. *Study*: an engineering concept, not a demonstration. *Reference*: a compiled secondary source. Check the primary before relying on a number.

## Hearing technology by radio

- **[Loeb and Zaldarriaga 2007](https://arxiv.org/abs/astro-ph/0610377)** · Published, JCAP.
  - Earth's strongest steady leakage is military radar: about ten early-warning transmitters near 400 MHz, about 2×10⁸ W each, a hundred times more along the beam. A month's stare hears it to about 23 pc with a small low-frequency array and about 200 pc with the SKA. A long listen recovers the planet's day and orbit from the shifting pitch.
  - Matters: physics lets every neighbor within 50 ly hear Earth, and what it hears is enough to aim at.
  - Used: v2 [Earth's loud past](HOLOS_GAME_CONCEPT.md#earths-loud-past). v1 "Why Earth hears none of it today".
- **Saide, Garrett and colleagues, airport and military radar** · Preliminary, [RAS National Astronomy Meeting, July 2025](https://ras.ac.uk/news-and-press/research-highlights/how-airports-heathrow-and-gatwick-could-help-aliens-spot-earth) ([summary](https://www.sci.news/astronomy/civilian-military-radar-leakage-alien-civilizations-14055.html)).
  - Airport radars worldwide add up to about 2×10¹⁵ W. A dish like Green Bank's could hear them to about 200 ly. Military radars sweep past an observer like a lighthouse, peaking near 10¹⁴ W, and look clearly artificial. Modeled from Barnard's Star, HD 48948, HD 40307, AU Microscopii, HD 216520 and LHS 475.
  - Matters: a brief survey look at Sol may be enough to hear Earth. It raised v2's sample odds.
  - Used: v2 Earth's loud past. On the watch list: the full paper sets the observing times.
- **[Saide, Garrett and Heeralall-Issur 2023](https://academic.oup.com/mnras/article/522/2/2393/7028804)** · Published, MNRAS.
  - Cell towers leak about 4 GW at peak, periodic and direction dependent. A Green Bank-class dish could not hear it within 10 ly.
  - Matters: broadband leakage alone doesn't give a world away. Basis for v1's faint hum.
  - Used: v2 Earth's loud past. v1 "A world's hum can be heard".
- **[Sheikh et al. 2025, Earth detecting Earth](https://arxiv.org/abs/2502.02614)** · Published, AJ.
  - Earth's detectable signatures, seen with present-day Earth instruments, span 13 orders of magnitude. Planetary radar reaches a thousand times farther than the best non-radio signature.
  - Matters: radio, not heat or air, is how worlds like Earth are found first.
  - Used: v2 Earth's loud past. v1 "Why Earth hears none of it today".
- **[Forgan and Nichol 2010, a failure of serendipity](https://arxiv.org/abs/1007.0850)** · Published, International Journal of Astrobiology.
  - Two human-like civilizations placed at random in the galaxy overhear each other about one time in ten million.
  - Matters: why the game needs its one "what if", many neighbors in the same century.
  - Used: v1 "Why the sky stays quiet".
- **[Price et al. 2020, Breakthrough Listen, 1,327 nearby stars](https://arxiv.org/abs/1906.07750)** · Published, AJ.
  - About 15 minutes per star, 1.1 to 3.45 GHz, searching for narrow drifting tones. Rules out steady narrowband transmitters above about 2×10¹⁰ to 3×10¹¹ W at the neighbors' distances.
  - Matters: what Earth's null results exclude about the neighbors. They search for tones, so they barely limit pulsed radar.
  - Used: v1 "Why Earth hears none of it today". v2 open question 4.
- **[Garrett 2026, broadband radio searches](https://academic.oup.com/mnras/article/549/3/stag991/8697603)** · Published, MNRAS.
  - Broadband surveys followed by interferometric source discrimination. Its roughly 100 pc reach assumes emissions far stronger than Earth's today.
  - Matters: the model for surveying, then investigating. It does not validate v1's receiver ranges.
  - Used: v1 "Survey, then investigate", deep-field receiver.
- **[Isolating Broadband Radio Technosignatures, May 2026](https://arxiv.org/abs/2605.10212)** · Preprint, MNRAS.
  - A framework for picking planetary-scale broadband leakage out of natural sources.
  - Matters: may sharpen v1's survey and hum rules. Not yet reviewed for the design.
  - Used: not yet. On the watch list.
- **[CHIME/FRB first catalog, 2021](https://arxiv.org/abs/2106.04352)** · Published, ApJS.
  - About 800 fast radio bursts per sky per day above its threshold.
  - Matters: the sky is never silent. A watch on everything hears far galaxies first.
  - Used: v1 "The sky is never silent".
- **[Project Ozma, 1960](https://www.seti.org/research/seti-101/project-ozma/)** · History.
  - The first modern search: Tau Ceti and Epsilon Eridani, six hours a day, April to July 1960, at 21 cm.
  - Matters: a young listener stares longest at its nearest Sun-like stars. Basis for v2's character-weighted odds.
  - Used: v2 Earth's loud past.
- **[List of interstellar radio messages](https://en.wikipedia.org/wiki/List_of_interstellar_radio_messages)** · Reference.
  - Earth's aimed messages from 1974 on, with targets and arrival dates. Within 50 ly: Altair, Gliese 49, Gliese 208, 55 Cancri, HD 10307, 47 Ursae Majoris, Gliese 581, Teegarden's Star, TZ Arietis, Kappa¹ Ceti, Gliese 526, Luyten's Star.
  - Matters: Earth's real knocks. Each lasted hours, so being heard needs a listener watching Sol at that moment.
  - Used: v2 Earth's loud past. Check transmitter power and duration in primary sources.

## Earth to Year 0: forecasts

- **[Metaculus, date of the first general AI system](https://www.metaculus.com/questions/5121/date-of-artificial-general-intelligence/)** · Forecast, community median ([summary](https://aitoolsreview.co.uk/insights/agi-timeline-predictions-2026)).
  - Median about January 2031 at the latest reading, with a range of April 2028 to July 2037. It was January 2033 in early 2026 and about 2070 in 2020.
  - Matters: the forecasters' date for Earth's Mind waking.
  - Used: v2 [Year 0 and Earth's road to it](HOLOS_GAME_CONCEPT.md#year-0-and-earths-road-to-it).
- **[Grace et al., 2024 Expert Survey on Progress in AI](https://aiimpacts.org/wp-content/uploads/2026/09/ESPAI2024.pdf)** · Survey of 1,580 AI researchers, published September 2026.
  - High-level machine intelligence: 10% by 2027, 50% by 2042, down from 2047 in the [2023 survey](https://arxiv.org/abs/2401.02843). Full automation of labor: 50% by 2098.
  - Matters: the researchers' date for Earth's Mind waking. They run about a decade behind the forecasters.
  - Used: v2 [Year 0 and Earth's road to it](HOLOS_GAME_CONCEPT.md#year-0-and-earths-road-to-it).
- **[Epoch AI, AI chip stock](https://epoch.ai/data/ai-data-centers)** · Data ([summary](https://the-decoder.com/global-ai-compute-hits-15-million-h100-equivalents-epoch-ai-finds/)).
  - About 27.6 million H100-equivalents sold by June 2026, roughly 3×10²² operations a second. The stock grows about 3.4× a year. 15 million of them draw over 10 GW.
  - Matters: where Earth's compute starts, and how fast it can grow before power binds.
  - Used: v2 [Year 0 and Earth's road to it](HOLOS_GAME_CONCEPT.md#year-0-and-earths-road-to-it).
- **[IEA, Energy and AI, 2025](https://iea.blob.core.windows.net/assets/de9dea13-b07d-42c5-a398-d1b3ae17d866/EnergyandAI.pdf)** · Report.
  - Data centers used about 415 TWh in 2024 and reach about 945 TWh by 2030 and 1,200 TWh by 2035 in the base case. Accelerated servers grow about 30% a year.
  - Matters: how much of Earth's power thinking takes by Year 0.
  - Used: v2 [Year 0 and Earth's road to it](HOLOS_GAME_CONCEPT.md#year-0-and-earths-road-to-it).
- **[Energy Institute, Statistical Review of World Energy 2025](https://www.energyinst.org/exploring-energy/resources/news-centre/media-releases/a-year-of-record-highs-in-an-energy-hungry-world,-reveals-ei-statistical-review)** · Data.
  - World primary energy reached 592 EJ in 2024, about 19 TW, up nearly 2%. Wind and solar grew 16%.
  - Matters: Earth's grid at Year 0. v1's 100 TW was five times today's.
  - Used: v2 [Year 0 and Earth's road to it](HOLOS_GAME_CONCEPT.md#year-0-and-earths-road-to-it).
- **[Global mass to orbit, 2025](https://www.satellitetoday.com/launch/2026/04/10/brycetech-report-shows-spacex-accounted-for-50-of-launches-in-2025/)** · Data, BryceTech ([Starship](https://en.wikipedia.org/wiki/SpaceX_Starship)).
  - About 3,200 t reached orbit in 2025, over 80% of it by SpaceX. Starship's later blocks aim at 100 to 200 t a flight.
  - Matters: v1's 40 kt a year is about twelve times 2025, a few hundred Starship flights.
  - Used: v2 [Year 0 and Earth's road to it](HOLOS_GAME_CONCEPT.md#year-0-and-earths-road-to-it).
- **Earth's instruments by 2040** · Plans.
  - [ELT](https://www.eso.org/public/announcements/ann25001/): first light March 2029, science from December 2030. [SKA](https://en.wikipedia.org/wiki/Square_Kilometre_Array): science verification from 2029 (Low) and 2031 (Mid). [PLATO](https://www.dlr.de/en/latest/news/2025/plato-mission-to-launch-in-late-2026-onboard-ariane-6): launch December 2026. [Habitable Worlds Observatory](https://en.wikipedia.org/wiki/Habitable_Worlds_Observatory): early 2040s at the soonest.
  - Matters: what Earth sees with at Year 0, and whether it can read a neighbor's air.
  - Used: v2 [Year 0 and Earth's road to it](HOLOS_GAME_CONCEPT.md#year-0-and-earths-road-to-it).
- **[FAA radar divestiture](https://www.faa.gov/air_traffic/technology/radardivestiture)** · Plan.
  - ADS-B lets the FAA retire overlapping radars through 2035. The rest stay for aircraft without transponders, backup and weather.
  - Matters: Earth's radars thin but don't go quiet before Year 0.
  - Used: v2 [Year 0 and Earth's road to it](HOLOS_GAME_CONCEPT.md#year-0-and-earths-road-to-it).
- **[UN World Population Prospects 2024](https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2024_wpp_2024_advance_unedited_0.pdf)** · Projection.
  - About 9.18 billion in 2040 in the medium variant, peaking near 10.3 billion in the mid-2080s.
  - Matters: Earth's people at Year 0, the lives a strike ends.
  - Used: v2 Year 0 and Earth's road to it.
- **[WMO Global Annual to Decadal Climate Update](https://wmo.int/resources/publication-series/wmo-global-annual-decadal-climate-update/wmo-global-annual-decadal-climate-update-2025-2029)** · Forecast.
  - 2024 was the first calendar year above 1.5°C. About a 70% chance the 2025 to 2029 average exceeds it. The Paris goal is a 20-year average, so the long-term crossing comes around 2030.
  - Matters: Earth's climate at Year 0.
  - Used: v2 Year 0 and Earth's road to it.
- **Crewed Moon landings** · Plans. [Artemis](https://en.wikipedia.org/wiki/Artemis_program): Artemis III is a docking test in Earth orbit in late 2027, Artemis IV the first landing in early 2028. [China](https://spacenews.com/china-on-track-for-crewed-moon-landing-by-2030-space-official-says/): a crewed landing in 2029 or 2030. [International Lunar Research Station](https://en.wikipedia.org/wiki/International_Lunar_Research_Station): a basic south-pole station by 2035.
  - Matters: where people are off Earth at Year 0. Plans like these usually slip.
  - Used: v2 Year 0 and Earth's road to it.
- **[Metaculus, first humans on Mars](https://www.metaculus.com/questions/3515/date-first-human-lands-on-mars/)** · Forecast.
  - Median about July 2045, within November 2037 to August 2060. About 15% for humans sent before 2036.
  - Matters: no one on Mars at Year 0 in the most probable path. A seeded branch can send them.
  - Used: v2 Year 0 and Earth's road to it, open question 1.
- **[Commonwealth Fusion Systems, ARC](https://cfs.energy/technology/arc/)** · Plan ([grid application](https://cfs.energy/news-and-media/commonwealth-fusion-systems-becomes-first-fusion-company-to-apply-to-pjm-interconnection-the-largest-u.s.-wholesale-electricity-market)).
  - A 400 MW plant aimed at the grid in the early 2030s. The grid approval takes four to six years. Net power on a grid has never been shown.
  - Matters: fusion arrives before Year 0 but stays small.
  - Used: v2 Year 0 and Earth's road to it, open question 1.
- **[Interstellar Probe](https://en.wikipedia.org/wiki/Interstellar_Probe_(spacecraft))** · Study, recommended by the 2024 heliophysics decadal survey.
  - Launch window 2036 to 2042, about 6 to 7 AU a year after a Jupiter flyby.
  - Matters: Earth's farthest working probe at Year 0. v1's 900 AU precursor is out of reach by 2040.
  - Used: v2 Year 0 and Earth's road to it.

## Seeing worlds

- **[Kaltenegger and Faherty 2021, the Earth transit zone](https://arxiv.org/abs/2107.07936)** · Published, Nature.
  - 1,715 stars within 100 pc could have seen Earth cross the Sun in the last 5,000 years. 75 within 100 ly see it now and have been reached by Earth's radio.
  - Matters: a neighbor there can know Earth is a rocky world in the warm zone, not who lives on it.
  - Used: v2 Earth's loud past.
- **[Terra Hunting Experiment](https://arxiv.org/abs/1806.00518)** · Study.
  - Ten years of nightly radial velocities on at least 40 bright Sun-like stars, to find Earth twins through the star's own shimmer.
  - Matters: finding a small world takes Years even with a good instrument.
  - Used: v1 "Feeling small worlds takes Years", spectrograph bank.
- **[Habitable Worlds Observatory](https://habitableworldsobservatory.org/home)** · Study, NASA, planned for the 2040s.
  - A large space telescope built to image Earth-size worlds and read their air.
  - Matters: no seat can read another's air at Year 0. That waits for an instrument of this class.
  - Used: v1 starting kit. v2: still being built at Year 0.

## The leads: real oddities at real stars

- **[Laliotis et al. 2023](https://arxiv.org/abs/2302.10310)** · Published.
  - Delta Pavonis shows an astrometric pull with only a faint trend toward and away, so its companion's orbit likely faces Sol.
  - Used: v1 leads ("a giant, half seen"), `legacy/v1/home-mocks/leads.py`.
- **[Matthews et al. 2024, Epsilon Indi Ab](https://www.nature.com/articles/s41586-024-07837-8)** · Published, Nature.
  - JWST imaged a 275 K super-Jupiter: about 6 Jupiter masses, about 28 AU out, heavier and wider than the star's sway foretold.
  - Used: v1 lead "Ember", leads.py.
- **[A second visit to Epsilon Indi Ab, March 2026](https://arxiv.org/abs/2603.08780)** · Preprint.
  - New JWST photometry confirms ammonia and suggests thick clouds.
  - Used: not yet. Bears on v2 open question 3.
- **[Kravtchenko et al., September 2026, ammonia mapped on Epsilon Indi Ab](https://arxiv.org/abs/2609.25784)** · Preprint.
  - JWST spectra from MIRI (October 2025) and NIRSpec (May 2026) securely detect ammonia and water, with weaker methane and a hint of carbon dioxide.
  - Matters: the most current data on the nearest imaged giant. Earth's Year 0 lead must start from it.
  - Used: not yet. Bears on v2 open question 3.
- **[Beichman et al. 2025, Alpha Centauri A candidate](https://ui.adsabs.harvard.edu/abs/2025ApJ...989L..22B/abstract)** · Published, ApJL ([NASA release](https://science.nasa.gov/missions/webb/nasas-webb-finds-new-evidence-for-planet-around-closest-solar-twin/)).
  - Candidate S1: 3.5 mJy at 15.5 µm, 1.5″ from the star, contrast 5.5×10⁻⁵, unseen in two follow-ups. A giant-planet candidate, not a rocky world.
  - Matters: from Sol it is a real lead. v1 dropped it only because Veyra couldn't see it.
  - Used: v1 leads (dropped). v2 open question 3.
- **[Feng et al. 2017, Tau Ceti](https://arxiv.org/abs/1708.02051)** · Published, AJ.
  - Four candidate signals under 4 Earth masses, at 20, 49, 160 and 642 days, after modeling color-dependent stellar noise.
  - Used: v1 lead "Chaff", leads.py.
- **[MacGregor et al. 2016, Tau Ceti's dust belt](https://arxiv.org/abs/1607.02513)** · Published, ApJ.
  - ALMA imaged the cold dust belt. leads.py takes its tilt, about 35°, as the plane of the candidate planets.
  - Used: leads.py. Check the adopted tilt against the paper's fit.
- **[Pepe et al. 2011, 82 Eridani](https://arxiv.org/abs/1108.3447)** · Published, A&A.
  - Three super-Earths at 0.12, 0.20 and 0.35 AU around HD 20794, found by their tug.
  - Used: v1 lead "Brood", leads.py.
- **Beta Hydri's slow drift** · Published, primary sources to find.
  - A long radial-velocity trend once read as a companion. CES and HARPS data from 2012 and a 2023 study tie it to the star's magnetic cycle. A [2025 study](https://www.aanda.org/articles/aa/full_html/2025/06/aa54730-25/aa54730-25.html) finds a cycle of about 12 years.
  - Used: v1 lead "Beacon", leads.py.
- **[Llop-Sayson et al., September 2026, Epsilon Eridani b](https://arxiv.org/abs/2609.19131)** · Preprint.
  - About 0.91 ± 0.06 Jupiter masses. The imaging interpretation depends on the model.
  - Used: v1 research baseline. Preserve its candidates and alternative fits.
- **[Project Hephaistos IV, July 2026](https://arxiv.org/abs/2607.09460)** · Preprint.
  - Infrared candidates D and E resolve into foreground stars and background galaxies.
  - Matters: a heat clue can turn out to be something else. It explains these two, not every candidate.
  - Used: v1 "Infrared follow-up is specific".
- **[Lim et al., August 2026, TRAPPIST-1 f](https://arxiv.org/abs/2608.17207)** · Preprint, accepted in AJ.
  - JWST excludes hydrogen-helium atmospheres above about 20 mbar at 95% confidence in its cleaner visits.
  - Matters: a null result is knowledge, but excluding one air doesn't make a world airless.
  - Used: v1 "A null result is knowledge".

## Reading air

- **[Krissansen-Totton et al., published 2026](https://arxiv.org/abs/2507.14771)** · Published.
  - Broad wavelength coverage is needed to read oxygen and methane as life, not geology.
  - Used: v1 "Instruments shift the odds", air projects.
- **[Seavey et al., March 2026](https://arxiv.org/abs/2603.11017)** · Preprint.
  - Oxygen can build up without life in Mars-like atmospheres.
  - Used: v1 clue odds.
- **[Kopparapu et al. 2021](https://arxiv.org/abs/2102.05027)** · Published.
  - Nitrogen dioxide as an industrial sign, with its natural sources and detection limits.
  - Used: v1 "Instruments shift the odds".

## Where neighbors can live

- **[Li et al., March 2026, 70 Ophiuchi](https://arxiv.org/abs/2603.20044)** · Preprint.
  - Planet exclusion limits and a binary solution. A rocky world in component A's warm zone remains possible.
  - Used: v1 "Sael remains possible".
- **[Jankowski et al., August 2026](https://arxiv.org/abs/2608.13243)** · Preprint.
  - Orbital stability around 70 Ophiuchi and 36 Ophiuchi. Stable orbits to about 2.5 AU around 70 Oph A.
  - Used: v1 homeworld constraints.
- **Habitable-zone planets near Sol** · Mixed. Proxima b, GJ 1061 d, GJ 273 b, Teegarden b, TRAPPIST-1 e, LHS 1140 b, TOI-700 d, Ross 128 b and GJ 1002 b and c, each with what is and isn't established.
  - Used: the atlas's player-site overlay. Sources in [data/player-sites/README.md](data/player-sites/README.md).

## Why the sky is quiet: computing and heat

- **[Slysh haloes, August 2026](https://arxiv.org/abs/2608.31153)** · Preprint.
  - The energy cost of computing falls with temperature, so mature minds may compute cold, far from their star, near the 2.7 K floor. Their waste heat would glow grey in the far infrared and submillimetre, not the mid-infrared older searches watched. Archival surveys of nearby stars could limit such haloes to about 10²⁰ W.
  - Matters: it tests v1's "mature minds turn inward" directly. It may make cold minds findable by a different instrument than v1 assumed.
  - Used: not yet. v2 open question 9.
- **[Wright et al. 2014, the Ĝ search](https://arxiv.org/abs/1408.1133)** · Published ([framework](https://arxiv.org/abs/1408.1134)).
  - Waste-heat searches, their natural contaminants, and why no one behavior can be assigned to all civilizations.
  - Used: alpha-1 theory evaluation. v1 "Why the sky is quiet".
- **[Bennett on Landauer's principle](https://arxiv.org/abs/physics/0210005)** and **[Landauer on dissipation](https://research.ibm.com/publications/dissipation-and-noise-immunity-in-computation-and-communication)** · Published.
  - Erasing information has a minimum heat cost that scales with temperature. Reversible computing has idealized limits and speed tradeoffs.
  - Used: v1 cold compute, "Compute runs on energy".
- **[OGLE compact-object constraints](https://arxiv.org/abs/1901.07120)** · Published.
  - Microlensing limits on hidden compact objects depend on mass and population, so they don't cap a number of small minds.
  - Used: alpha-1 theory evaluation.
- **[NASA small-spacecraft thermal control](https://www.nasa.gov/smallsat-institute/sst-soa/thermal-control/)** · Reference.
  - Radiators and heat transport are explicit infrastructure. Shrinking the core doesn't remove them.
  - Used: alpha-1 theory evaluation.

## Travel, sails and lenses

- **[Caltech, January 2025](https://www.caltech.edu/about/news/the-pressure-to-explore-caltech-researchers-take-first-experimental-steps-toward-lightsails-that-could-reach-distant-star-systems)** · Published, lab result.
  - First measurement of radiation pressure on a tethered microscopic sail.
  - Used: v1 research baseline, sails.
- **[Shen and Li, June 2026](https://arxiv.org/abs/2606.04052)** · Preprint.
  - Sail thrust efficiency drops at relativistic speeds, but net acceleration stays positive.
  - Used: v1 star laser, near-light sails.
- **[Heller and Hippke 2017](https://arxiv.org/abs/1701.08803)** · Published, ApJL.
  - A sail can brake on starlight and gravity at a bright star: about 4.6% of light speed to park at Proxima via Alpha Centauri A and B.
  - Used: v1 starlight sail, catalog.
- **[Hippke 2017, the Sun's lens](https://arxiv.org/abs/1706.05570)** · Published, Acta Astronautica.
  - The solar corona defocuses the Sun's gravitational lens below about 120 GHz, so the lens cannot hear a world's low-frequency hum.
  - Used: v1 "The Sun's lens cannot be assumed to amplify the low-frequency hum", catalog.
- **Solar gravitational lens mission** · Study ([NASA concept](https://www.nasa.gov/general/direct-multipixel-imaging-and-spectroscopy-of-an-exoplanet-with-a-solar-gravitational-lens-mission/), [geometry and travel](https://science.nasa.gov/universe/exoplanets/want-to-see-the-surface-of-another-earth-use-our-sun/)).
  - The focal line starts beyond about 550 AU for a Sun-like star. Turyshev and colleagues.
  - Used: v1 catalog.
- **[NASA Deep Space Optical Communications](https://www.nasa.gov/missions/tech-demonstration/deep-space-optical-communications-dsoc/)** · Demonstrated.
  - Laser links across deep space, with precise pointing and data rates that fall with distance.
  - Used: v1 tight beam, laser links.
- **Classic propulsion studies** · Study. Breakthrough Starshot (gram-scale beamed sails), Project Daedalus and Icarus (fusion rockets), Zubrin and Andrews (magnetic sail braking, about 20 years per light-year).
  - Used: v1 probe kinds in the catalog. Primary links to add.

## Industry and big works

- **[Advanced Automation for Space Missions, NASA 1980](https://en.wikisource.org/wiki/Advanced_Automation_for_Space_Missions)** · Study, NASA CP-2255, Freitas and Gilbreath, editors.
  - A self-replicating, growing lunar factory, assumed to copy itself in about a year.
  - Used: v1 "Industry compounds once it can copy itself", self-replicating factory.
- **Classic space-industry studies** · Study. Gerard O'Neill's lunar mass driver, NASA's 1975 Stanford torus, David Criswell's star lifting.
  - Used: v1 catalog (mass driver, habitat ring, star lifting). Primary links to add.

## Watch list

Results the design is waiting on. Check each when its date comes.

- **Saide, Garrett and Heeralall-Issur, "Modelling Earth's Radio Leakage: Detectability of Civilian and Military Radar Systems"** · in preparation. Its observing times set v2's odds of Earth being heard.
- **[Gaia DR4](https://www.cosmos.esa.int/web/gaia/dr4)** · planned. Rebuild the census after release and validation, per v1's migration notes.
- **Isolating Broadband Radio Technosignatures** and **Slysh haloes** · to review for the design (v2 open question 9).
- **Epsilon Indi Ab's atmosphere** · two 2026 preprints. Feed Earth's leads (v2 open question 3).

## To check

- Metaculus odds of a Taiwan war before 2035, for the branch list. A search summary gave about one in three. The question may be conditional.
- Tau Ceti dust belt tilt in leads.py against MacGregor et al. 2016.
- Beta Hydri drift: find the 2012 and 2023 primary papers.
- Earth's aimed messages: transmitter power, frequency and duration from primary sources.
- Primary links for the classic propulsion and space-industry studies.
