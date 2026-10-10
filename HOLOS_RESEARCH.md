# Holos · Research

Last updated: October 10, 2026.

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
- **[Garrett 2026, isolating broadband radio technosignatures](https://arxiv.org/abs/2605.10212)** · Preprint, May 2026.
  - Narrowband searches may file a civilization's broadband leakage as noise. Wide-field surveys, then interferometric follow-up, could find leakage from a Kardashev Type I civilization to about 100 pc, judged by brightness temperature, polarization, spectral structure, scintillation and position on a nearby star.
  - Matters: Type I leakage is vastly louder than a world like Earth's, so this doesn't reach v2's faint neighbors. It supports v2's finding that their tones, not their broad hum, are what carries.
  - Used: v2 [the project audit](HOLOS_PROJECT_AUDIT.md#calculations), a world's hum.
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
  - Median 5 January 2031, range April 2028 to April 2037, from about 1,900 forecasters, read on the page 2026-10-10. It was January 2033 in early 2026 and about 2070 in 2020.
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
  - Median January 2046, range February 2038 to October 2060, from 392 forecasters, read on the page 2026-10-10. About 15% for humans sent before 2036, from an earlier summary.
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

- **[Metaculus, first 100 MW fusion plant](https://www.metaculus.com/questions/363/)** · Forecast ([0.1% of world energy](https://www.metaculus.com/questions/9464/nuclear-fusion-power-01-of-global-energy/)).
  - Median July 2041 for a 100 MW fusion plant in service, range March 2034 to July 2053, from 256 forecasters. July 2047 for fusion to supply 0.1% of world energy, range September 2039 to May 2058, from 99. Read on the pages 2026-10-10.
  - Matters: most games have no fusion on the grid at Year 0. It corrected an earlier draft that assumed the 2030s.
  - Used: v2 Year 0 and Earth's road to it, open question 1.
- **[Metaculus, Chinese invasion of Taiwan](https://www.metaculus.com/questions/11480/china-launches-invasion-of-taiwan/)** · Forecast, read on the page 2026-10-10.
  - A full-scale invasion before 2028, 5%. Before 2030, 15%. Before 2035, 26%. From 974 forecasters. Earlier search summaries, 12% by 2028 and 27 to 33% by 2035, were out of date.
  - Matters: the likeliest major branch before Year 0.
  - Used: v2 [Year 0 and Earth's road to it](HOLOS_GAME_CONCEPT.md#year-0-and-earths-road-to-it), the branches.
- **[Metaculus, China blockades Taiwan](https://www.metaculus.com/questions/12309/china-engages-in-a-blockade-against-taiwan/)** · Forecast, read on the page 2026-10-10.
  - A full-scale blockade before 2030, 30%. Before 2035, 46%. From 101 forecasters.
  - Matters: a blockade cuts chip exports without an invasion, and forecasters think it nearly twice as likely.
  - Used: v2 [Year 0 and Earth's road to it](HOLOS_GAME_CONCEPT.md#year-0-and-earths-road-to-it), the blockade branch.
- **[Metaculus, no non-test nuclear detonation before 2035](https://www.metaculus.com/questions/3150/no-non-test-nuclear-detonations-before-2035/)** · Forecast, read on the page 2026-10-10 ([by 2050](https://www.metaculus.com/questions/4779/will-a-nuclear-weapon-be-detonated-as-an-act-of-war-by-2050/)).
  - 76% that none is used before 2035, so 24% that one is, from 193 forecasters. 34% for one used in war by 2050, from 532. The two agree.
  - Matters: a branch that would push Earth toward Cautious.
  - Used: v2 [Year 0 and Earth's road to it](HOLOS_GAME_CONCEPT.md#year-0-and-earths-road-to-it), the branches.

- **[Epoch AI, ML hardware energy efficiency](https://epoch.ai/data-insights/ml-hardware-energy-efficiency)** · Data ([hardware trends](https://epoch.ai/blog/trends-in-machine-learning-hardware)).
  - Leading ML hardware gets about 28 to 40% more energy efficient a year. The H100 peaks near 1.4×10¹² operations a second per watt.
  - Matters: Earth's compute per watt at Year 0, about 40 to 100 times 2026's. With about 0.25 TW for thinking, about 10²⁵ operations a second.
  - Used: v2 open question 2.
- **[Large space flexible solar arrays, 2025 review](https://www.sciencedirect.com/science/article/pii/S2950104025000161)** · Published ([NASA small-spacecraft power](https://www.nasa.gov/smallsat-institute/sst-soa/power-subsystems/)).
  - Flown roll-out arrays reach about 36 to 218 W/kg, the ISS's iROSA about 75 W/kg. Thin-film designs target 1 kW/kg.
  - Matters: v1's orbital solar array implied about 50 kW/kg, 50 to 600 times too light. At 1 kW/kg, 400 kt yields about 0.4 TW.
  - Used: v2 open question 2.

## Other worlds' starting points

- **[Hippke 2018, spaceflight from super-Earths is difficult](https://arxiv.org/abs/1804.04727)** · Published, International Journal of Astrobiology.
  - Rocket fuel grows exponentially with a world's surface gravity. 9,000 t of fuel on Earth becomes 55,000 t on a world of 9.7 Earth masses. Chemical rockets work up to about 10 Earth masses, beyond that a world needs nuclear propulsion.
  - Matters: a neighbor's gravity well sets how fast it can reach space, so neighbors don't start equal to Earth.
  - Used: v2 [The neighbors](HOLOS_GAME_CONCEPT.md#the-neighbors).

- **[Hot Rocks Survey](https://www.stsci.edu/jwst/phase2-public/3730.pdf)** · JWST program 3730, results 2024 to 2026 ([II](https://arxiv.org/abs/2503.19772), [GJ 3929 b](https://arxiv.org/abs/2508.12516), [VI](https://arxiv.org/abs/2609.30552)).
  - Most hot rocky planets around M dwarfs show no atmosphere, which maps the "cosmic shoreline". A few, like GJ 357 b, don't fit simple models. Temperate M-dwarf worlds remain open.
  - Matters: M dwarfs are weighted low as neighbor hosts, not excluded. [calcs/hosts.py](calcs/hosts.py).
  - Used: v2 open question 4.
- **[Holman and Wiegert 1999](https://arxiv.org/abs/astro-ph/9809315)** · Published, AJ.
  - A planet around one star of a binary stays stable inside a critical distance set by the binary's separation, mass ratio and eccentricity: about 0.46 of the separation for a circular, equal-mass pair, less as eccentricity grows.
  - Matters: the test for whether a binary's warm zone can hold a neighbor's world.
  - Used: v2 open question 4.

- **[Gaia DR3 astrophysical parameters, FLAME](https://www.cosmos.esa.int/web/gaia/dr3)** · Data, via the ESA Gaia archive. Fetched by [calcs/fetch_hosts.py](calcs/fetch_hosts.py).
  - Isochrone ages, masses and luminosities for many stars within 50 ly.
  - Matters: luminosity sets each host's warm zone. Ages are used only for F and G stars, since isochrones barely constrain K and M dwarfs: FLAME puts Epsilon Eridani near 7 billion years.
  - Used: [data/hosts-50ly.csv](data/hosts-50ly.csv).
- **[NASA Exoplanet Archive, planetary systems composite](https://exoplanetarchive.ipac.caltech.edu/docs/TAP/usingTAP.html)** · Data, fetched October 2026.
  - 227 known planets within 50 ly, with masses, orbits and eccentricities.
  - Matters: a host is dropped when a known planet of 10 Earth masses or more crosses its warm zone.
  - Used: data/hosts-50ly.csv.
- **[El-Badry, Rix and Heintz 2021, a million binaries from Gaia](https://arxiv.org/abs/2101.05282)** · Published, MNRAS.
  - Bound pairs agree in parallax and move together within what an orbit allows, about 2.1 km/s at 1,000 AU.
  - Matters: the test calcs/hosts.py applies to find companions. Their catalog was unreachable on VizieR in October 2026, so the pairs are found directly.
  - Used: data/hosts-50ly.csv.
- **[Pecaut and Mamajek 2013](https://arxiv.org/abs/1307.2657)** · Published, ApJS ([table](https://www.pas.rochester.edu/~emamajek/EEM_dwarf_UBVIJHK_colors_Teff.txt)).
  - Colors along the dwarf sequence: Gaia BP−RP near 0.59 at F5, 0.75 at G0, 0.98 at K0 and 1.84 at M0.
  - Used: data/hosts-50ly.csv, sorting stars by kind.
- **[Kopparapu et al. 2013, habitable zones](https://arxiv.org/abs/1301.6674)** · Published, ApJ.
  - The conservative warm zone, about 0.95 to 1.67 AU for the Sun's luminosity, scaling as its square root.
  - Used: data/hosts-50ly.csv.
- **Known young stars within 50 ly** · Published ages.
  - [Epsilon Eridani](https://en.wikipedia.org/wiki/Epsilon_Eridani), 0.4 to 0.8 Gyr. [Kappa¹ Ceti](https://en.wikipedia.org/wiki/Kappa1_Ceti), 0.3 to 0.6 Gyr. The [Ursa Major moving group](https://arxiv.org/abs/2601.08985), about 418 Myr, with Pi¹ Ursae Majoris and Chi¹ Orionis. AU Microscopii, about 20 Myr.
  - Used: dropped as hosts in data/hosts-50ly.csv.

- **[Zeng, Sasselov and Jacobsen 2016, mass and radius of rocky planets](https://arxiv.org/abs/1512.08827)** · Published, ApJ.
  - Rocky radius grows about as mass to the power 1/3.7, from Earth's own interior model.
  - Matters: a neighbor's gravity and escape speed, and so its cost of reaching space.
  - Used: [calcs/neighbors.py](calcs/neighbors.py).

## Hostility

- **[Dam 2026, First Attack, Final Offensive: the Dark Forest on an Open Roster](https://arxiv.org/abs/2609.12003)** · Preprint, September 2026.
  - When no one can know how many others are out there, a first strike is rational only if the attacker accepts it may be its last attack. Mutual aggression is not an equilibrium. Everyone hiding is, whenever strikes are more visible to unfound watchers than hiders are to hunters.
  - Matters: the physics of Holos makes strikes visible to third parties. Exhaust shows from behind, laser launches shine ahead, braking glows, and a strike's direction names its sender. So the quiet sky fits a region where most minds hide and watch, and strike-first minds are rare.
  - Used: v2 open question 4, the roster's hostility.
- **[Brin 1983, The Great Silence](https://www.researchgate.net/publication/234496344_The_'Great_Silence'_The_Controversy_Concerning_Extraterrestrial_Intelligent_Life)** · Published, QJRAS 24, 283.
  - The "deadly probes" idea: hostile machines that silence others fit the Fermi paradox, but would leave no one to find. Liu Cixin's "dark forest" later took the idea up ([overview](https://en.wikipedia.org/wiki/Dark_forest_hypothesis)).
  - Matters: hostility can explain silence, but a region of wholly hostile minds leaves nothing to play. Holos's premise, many minds waking in one century, sits better with hiding than with killing.
  - Used: v2 open question 4.
- **[Tan 2025, Beyond the Dark Forest](https://philarchive.org/archive/TANBTD-2)** · Essay.
  - Criticizes the dark forest for assuming cheap interstellar war, static equilibria and fixed technology.
  - Used: v2 open question 4.
- **[Iain M. Banks, the Culture](https://en.wikipedia.org/wiki/Culture_series)** · Fiction, the stated inspiration ([Joseph Heath, Why the Culture Wins](https://josephheath.substack.com/p/why-the-culture-wins-an-appreciation)).
  - Advanced minds are mostly tolerant, curious and generous. Contact studies younger civilizations and sometimes interferes, overtly or covertly, through Special Circumstances. Aggressive powers exist, but they are few, and they lose. The oldest civilizations Sublime and leave the galaxy's affairs.
  - Matters: past the physics, Holos's neighbors take their range of character from here.
  - Used: v2 open question 4.

## Running the neighbors

- **[Claude API pricing](https://platform.claude.com/docs/en/about-claude/pricing)** · Reference, September 2026 ([batch processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing), [prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)).
  - Per million tokens, in and out: Claude Opus 5.5 $4 and $20, Claude Sonnet 5.5 $2 and $10, Claude Haiku 4.5 $1 and $5. [Claude Haiku 5.5](https://www.anthropic.com/claude/haiku), released October 7, 2026, $0.10 and $0.50 for prompts up to 100,000 tokens, cache hits $0.01, five times that above 100,000. Cached input about a tenth of the input price. The Batch API halves the price for work that can wait.
  - Matters: what it costs for a model to play each neighbor.
  - Used: v2 open question 5, [calcs/ai_cost.py](calcs/ai_cost.py).
- **[Gemini Developer API pricing](https://ai.google.dev/gemini-api/docs/pricing)** · Reference, October 2026.
  - Per million tokens, in and out: Gemini 3.5 Flash-Lite $0.30 and $2.50, Gemini 3.1 Flash-Lite $0.25 and $1.50. Batch halves both. Cached input about a tenth, plus $1 per million tokens an hour to keep the cache. Thinking counts as output.
  - Matters: once the cheapest option, now dearer than Claude Haiku 5.5 on both input and output.
  - Used: v2 open question 5, calcs/ai_cost.py.

## Real masses behind the projects

Anchors for [the project audit](HOLOS_PROJECT_AUDIT.md).

- **[UNEP Global Resources Outlook 2024](https://www.unep.org/resources/Global-Resource-Outlook-2024)** · Report.
  - The world uses about 106 Gt of materials a year, up from 30 Gt in 1970, heading for about 160 Gt by 2060.
  - Matters: on Earth, ground builds are not short of matter. Only matter in space is scarce.
  - Used: the project audit.
- **[LUVOIR final report](https://arxiv.org/abs/1912.06219)** · Study.
  - LUVOIR-A, a 15 m space telescope, about 28 t, up to 37 t with margins. JWST is 6.2 t.
  - Used: the project audit, telescopes.
- **[Starshade Rendezvous Probe](https://ntrs.nasa.gov/api/citations/20190028272/downloads/20190028272.pdf)** · Study, NASA.
  - Launch mass about 3.8 t.
  - Used: the project audit, starshade.
- **[Hyper-Kamiokande](https://iopscience.iop.org/article/10.1088/1742-6596/2156/1/012153/pdf)** · Under construction.
  - A 260 kt underground water detector.
  - Used: the project audit, neutrino watch.
- **[Project Daedalus](https://en.wikipedia.org/wiki/Project_Daedalus)** · Study, British Interplanetary Society, 1973 to 1978 ([Icarus](https://arxiv.org/abs/1005.3833)).
  - 54,000 t at departure, 50,000 t of it fuel, 450 t of payload, to 0.12c. Exhaust about 10,000 km/s.
  - Matters: the yardstick for every fusion probe, ship and bullet.
  - Used: the project audit, probes and impactors.
- **[Stanford torus](https://en.wikipedia.org/wiki/Stanford_torus)** · Study, NASA SP-413, 1975.
  - About 10 Mt for 10,000 people, 95% of it radiation shielding from lunar soil.
  - Used: the project audit, habitat ring.
- **[O'Neill's lunar mass driver](https://nss.org/l5-news-mass-driver-update/)** · Study, 1976 to 1977.
  - A driver of 100 to 200 t could deliver about 600,000 t a year from the Moon.
  - Used: the project audit, mass driver.
- **[Freitas and Zachary 1981, a self-replicating lunar factory](http://www.rfreitas.com/Astro/GrowingLunarFactory1981.htm)** · Study.
  - Grown from a 100 t seed, copying itself in about a year.
  - Matters: v1's factory cost 60 Mt, about 600,000 times the seed.
  - Used: the project audit, factory and foundry.
- **[Google Project Suncatcher](https://research.google/blog/exploring-a-space-based-scalable-ai-infrastructure-system-design/)** · Study, 2025, with a [prototype launched](https://www.npr.org/2026/10/01/nx-s1-5983697/project-suncatcher-google-ai-data-center-space) in 2026.
  - Solar-powered satellites carrying AI chips, linked by laser, planned in clusters of 81.
  - Matters: compute in orbit is being tested now. The cold compute annex fits it.
  - Used: the project audit, cold compute annex.
- **[NASA, antimatter requirements and energy costs](https://ntrs.nasa.gov/api/citations/19990110316/downloads/19990110316.pdf)** · Study.
  - Making antimatter today takes about 10⁹ times more energy than it releases.
  - Matters: the antimatter probe fits only if production gets about 100,000 times better.
  - Used: the project audit, antimatter probe.
- **[DART](https://en.wikipedia.org/wiki/Double_Asteroid_Redirection_Test)** · Demonstrated, 2022.
  - About 0.6 t at impact.
  - Used: the project audit, comet deflection.

- **[Green Bank Telescope proposer's guide](https://greenbankobservatory.org/wp-content/uploads/2017/07/GBTpg.pdf)** · Reference.
  - At L band, about 2 K/Jy and 20 K, so an SEFD near 10 Jy.
  - Used: the project audit, beacon range. [calcs/early_game.py](calcs/early_game.py).
- **[SKA1 science performance](https://www.skao.int/sites/default/files/documents/SKA-TEL-SKO-0000818-01_SKA1_Science_Perform.pdf)** · Reference, SKAO.
  - The full SKA-Mid reaches about 1,600 m²/K at 1.4 GHz, an SEFD near 1.1 Jy.
  - Used: the project audit, beacon range.
- **[Pulsar science with the CHIME telescope](https://arxiv.org/abs/1711.02104)** · Published.
  - About 8,000 m² of cylinders, a gain near 1.16 K/Jy, a receiver near 30 K, about 200 square degrees in view. An SEFD near 45 Jy with the sky added.
  - Used: the project audit, the sky watch's sensitivity.
- **[FarView, 2024](https://arxiv.org/abs/2404.03840)** · Study, Advances in Space Research.
  - 100,000 dipoles over 200 km² of the lunar far side, made in place from metal in the regolith, by equipment landed from Earth.
  - Matters: a far-side array is a lunar industry project, not cargo.
  - Used: the project audit, far-side array.

- **[Phipps et al., Review: Laser-Ablation Propulsion](https://www.researchgate.net/publication/225005755_Review_Laser-Ablation_Propulsion)** · Published, Journal of Propulsion and Power ([debris removal](https://arxiv.org/abs/1110.3835)).
  - Ablation thrust runs about 10⁻⁵ to 10⁻⁴ N per watt that lands, near 10⁻⁴ at its best.
  - Matters: the deflector laser needs about 9 TW with a 1 km mirror, or 0.1 TW with a 10 km one.
  - Used: the project audit, deflector laser. [calcs/late_game.py](calcs/late_game.py).
- **[Mahaffy et al. 1998, Galileo probe](https://link.springer.com/article/10.1023/A:1005091806594)** · Published ([helium abundance](https://agupubs.onlinelibrary.wiley.com/doi/10.1029/98JE00695)).
  - Jupiter's ³He/⁴He is (1.66 ± 0.05)×10⁻⁴. Helium is about 24% of its air by mass.
  - Matters: about 30 g of helium-3 per thousand tonnes of Jupiter's air. Every fast fusion craft is gated by it.
  - Used: the project audit, heavy impactor and helium-3 harvest.
- **[Project Daedalus, fuel](https://en.wikipedia.org/wiki/Project_Daedalus)** · Study.
  - Its helium-3 was to be mined from Jupiter's air by balloon-borne robotic factories over 20 years. Stages: 46,000 t and 4,000 t of propellant.
  - Matters: 111 t of fuel per tonne of payload to 0.12c, about 3.9 times one ideal stage. The audit scales every fusion trip by that.
  - Used: the project audit, all fusion craft.
- **[NASA, antimatter production efficiency](https://ntrs.nasa.gov/api/citations/19990110316/downloads/19990110316.pdf)** · Study.
  - Accelerator production is about 10⁻⁹ efficient.
  - Used: the project audit, antimatter probe needs the swarm.
- **[Heavy water production](https://energyeducation.ca/encyclopedia/Heavy_water)** · Reference.
  - About one hydrogen atom in 6,500 in seawater is deuterium. Electrolysis takes about 850 kWh per kg of heavy water, the costly route.
  - Matters: a slow D-D bullet's 83 kt of deuterium is cheap in energy and plentiful in the oceans.
  - Used: the project audit, heavy impactor.

- **[Palaszewski 2014, atmospheric mining in the outer solar system](https://ntrs.nasa.gov/api/citations/20140006386/downloads/20140006386.pdf)** · Study, NASA TM-2014-217892 ([2021 update](https://ntrs.nasa.gov/api/citations/20210018165/downloads/Palaszewski_Atmospheric%20Mining%20in%20the%20Outer%20Solar%20System%20ASC.pdf)).
  - Helium-3 is about 1.5×10⁻⁵ of Uranus's air and 1.9×10⁻⁵ of Neptune's. A 100 t gas-core nuclear aerospacecraft gathers 500 kg in 38 to 95 days. Uranus and Neptune are easier to mine than Jupiter or Saturn.
  - Matters: a helium-3 harvest of about 1.5 kt a Year is about 150 kt of system.
  - Used: the project audit, helium-3 harvest.
- **[CHORD](https://arxiv.org/abs/2607.09374)** · Under construction ([progress](https://spaceq.ca/chord-the-successor-to-chime-readies-for-first-big-test-this-fall/)).
  - 512 six-meter dishes at 300 to 1,500 MHz, a transit instrument that scans the sky as Earth turns. Complete by the end of 2027, commissioned in 2028.
  - Matters: Earth's Year 0 sky watch is a drift scan, not an always-on watch of the whole sky.
  - Used: v2 Earth's kit, the project audit.
- **[EMBRACE](https://www.researchgate.net/publication/234056794_EMBRACE_Results_from_an_aperture_array_for_radio_astronomy)** · Demonstrated, since 2011 ([SKA mid-frequency aperture array](https://arxiv.org/abs/2008.04583)).
  - 4,608 elements 12.5 cm apart near 1.2 GHz, forming many independent beams. Demonstrators reached about 100 m².
  - Matters: an all-sky watch is a hundredfold scale-up of something that works.
  - Used: the project audit, all-sky watch.
- **[What exactly is 8-VSB anyway?](https://www.arrl.org/files/file/Technology/TV_Channels/8_Bit_VSB.pdf)** · Reference ([IEEE notes](https://site.ieee.org/scv-ces/files/2015/06/NTSC_8VSB.pdf)).
  - ATSC digital television keeps a pilot tone 11.3 dB below its average power, about 7%.
  - Matters: a modern world's radio still carries pure tones, and tones are what a far listener catches.
  - Used: the project audit, a world's hum.

- **[Neely 2025, the economic effects of a potential armed conflict over Taiwan](https://www.stlouisfed.org/-/media/project/frbstl/stlouisfed/publications/review/pdfs/2025/feb/economic-effects-of-potential-armed-conflict-over-taiwan.pdf)** · Published, Federal Reserve Bank of St. Louis Review ([Rhodium Group](https://rhg.com/research/taiwan-economic-disruptions/)).
  - Taiwan makes 92% of the most advanced logic chips. Domestic suppliers elsewhere have very limited room to replace them. Rhodium puts a blockade's immediate cost above $2 trillion.
  - Matters: a Taiwan war before 2035 leaves Earth with about half its compute at Year 0.
  - Used: v2 branches, [calcs/branches.py](calcs/branches.py).

## Earth's character

- **[Arecibo message](https://en.wikipedia.org/wiki/Arecibo_message)** and **[Voyager Golden Records](https://en.wikipedia.org/wiki/Voyager_Golden_Record)** · History.
  - Earth's first deliberate messages: a radio burst toward M13 in 1974, and records on two probes leaving the Solar System in 1977.
  - Matters: Earth chose to be found, at least once. Basis for Earth's lean toward Open.
  - Used: v2 [The dials](HOLOS_GAME_CONCEPT.md#the-dials).
- **[Statement regarding METI and Active SETI, 2015](https://setiathome.berkeley.edu/meti_statement_0.html)** · Statement, signed by scientists and others.
  - Urges "vigorous international debate by a broadly representative body" before any more messages are sent.
  - Matters: the strongest real pull toward Hidden.
  - Used: v2 The dials.
- **[DART](https://en.wikipedia.org/wiki/Double_Asteroid_Redirection_Test)** · Demonstrated, 2022.
  - The first test of moving an asteroid by impact.
  - Matters: Earth guards against loss it can see coming. A real pull toward Cautious.
  - Used: v2 The dials.

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

## Earth's leads, as of October 2026

What Sol's own instruments have found nearby. For v2 open question 3.

- **[Alpha Centauri A's candidate, S1](https://arxiv.org/abs/2508.03814)** · 4.4 ly. Imaged once by JWST in August 2024, missed in February and April 2025, with a 52% chance its orbit hid it. JWST looked again in August 2026. Result not yet published: adopt it when it is.
- **[Barnard's Star](https://ui.adsabs.harvard.edu/abs/2025ApJ...982L...1B/abstract)** · 6 ly. Four sub-Earths confirmed in 2025 after decades of false claims. Basant et al., MAROON-X and ESPRESSO.
- **[82 Eridani d](https://arxiv.org/abs/2501.17092)** · 19.7 ly. At least 5 Earth masses, 650 days, eccentricity 0.45, swinging through the warm zone of a Sun-like star. Nari et al. 2025. Its air waits for the Habitable Worlds Observatory.
- **[Fomalhaut's collisions](https://phys.org/news/2025-12-hubble-captures-rare-collision-nearby.html)** · 25 ly. Its "planet" was a dust cloud from a collision, and a second cloud, cs2, appeared in 2023 Hubble images. Kalas and colleagues, December 2025.
- **[The Wow! signal, revised](https://arxiv.org/abs/2508.10657)** · 1977. Archival Ohio SETI data put it above 250 Jy at 1420.726 MHz, from two fields near 19h26m, −27°. Méndez and colleagues propose a hydrogen cloud brightened by a flare ([part I](https://arxiv.org/abs/2408.08513)).
- **[3I/ATLAS](https://aasnova.org/2026/01/28/monthly-roundup-interstellar-visitor-3i-atlas/)** · An interstellar comet, found July 2025. Its water is rich in deuterium and it may be older than the Sun ([ESO](https://www.eso.org/public/news/eso2608/)). Its push off course fits ordinary outgassing ([preprint](https://arxiv.org/abs/2511.07450)). A radio search found only human interference ([report](https://www.sciencedaily.com/releases/2026/06/260621060309.htm)).
- **[Gliese 12 b](https://www.livescience.com/space/exoplanets/nasa-detects-earth-size-planet-just-40-light-years-away-thats-not-a-bad-place-to-hunt-for-life)** · 40 ly. The nearest known transiting, temperate, Earth-size world. Air unknown.
- **[LHS 1140 b](https://arxiv.org/abs/2403.13265)** · 49 ly. A water world or a small gas world. No helium in four JWST transits (August 2026).
- **[Terra Hunting Experiment](https://www.iac.es/en/projects/harps3-high-accuracy-radial-velocity-planet-searcher)** · HARPS3 began work in summer 2026 on La Palma: every clear night for ten years, on at least 40 bright Sun-like northern stars. By 2040 its results are in. If a neighbor's world sits in its sample and is heavy enough, Earth found it.
- Earlier entries also apply: Epsilon Indi Ab, Delta Pavonis, Tau Ceti, Beta Hydri, Epsilon Eridani b, TRAPPIST-1 f and the Earth transit zone, where Teegarden's Star enters about 2050.

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

- **[Sixth Catalog of Orbits of Visual Binary Stars, ORB6](https://www.astro.gsu.edu/wds/orb6.html)** · Reference, kept by the US Naval Observatory and Georgia State University.
  - About 4,000 orbits of visual, interferometric and astrometric pairs, each graded 1, definitive, to 5, indeterminate, with 9 for wobble-only orbits.
  - Used: [calcs/binaries.py](calcs/binaries.py). Grade 5 orbits are skipped.
- **[Pourbaix et al. 2004, SB9](https://doi.org/10.1051/0004-6361:20041213)** · Published, A&A. The Ninth Catalogue of Spectroscopic Binary Orbits, [VizieR B/sb9](https://vizier.cds.unistra.fr/viz-bin/VizieR?-source=B/sb9).
  - About 4,000 spectroscopic pairs with period, eccentricity and velocity amplitudes.
  - Used: close pairs in calcs/binaries.py, and to confirm wobble-only orbits.
- **[Bond et al. 2015, the Procyon system](https://arxiv.org/abs/1510.00485)** · Published, ApJ.
  - Masses 1.478 and 0.592 Suns. Procyon A is about 2.7 billion years old. B became a white dwarf 1.37 billion years ago, from a star of about 2 Suns.
  - Matters: B's giant phase scorched A's warm zone, too recently for minds since.
  - Used: Procyon dropped as a host.
- **[Soubiran et al. 2018, radial velocity standard stars](https://doi.org/10.1051/0004-6361/201832795)** · Published, A&A.
  - 107 Piscium's velocity is steady to about a meter per second. Later work finds it single (Halbwachs et al. 2018).
  - Matters: Hipparcos's 1997 wobble orbit for it, which implies a brown dwarf tugging at about 2 km/s, can't be real.
  - Used: the rule that wobble-only orbits need backing. 107 Piscium kept as a host.
- **[Bell, Mamajek and Naylor 2015, ages of young moving groups](https://arxiv.org/abs/1508.05955)** · Published, MNRAS.
  - The AB Doradus moving group is about 150 million years old.
  - Used: AB Doradus and its companions dropped as hosts, too young.

## Kinds of worlds

What a neighbor's world can plausibly be, beyond an Earth twin. Each roster entry cites the ones it uses.

- **[Lobo, Shields, Palubski and Wolf 2023, terminator habitability](https://iopscience.iop.org/article/10.3847/1538-4357/aca970)** · Published, ApJ 945:161.
  - A locked dry land world can have a scorching day side, a frozen night side and a temperate twilight band. On an ocean world, heat transport erases that contrast. Wet worlds can still have more habitable area at lower light, and may dry out as water freezes on the night side.
  - Matters: locked M-dwarf neighbors should mostly be dry.
  - Used: Tavi, Ystra, Corra and Mirr, in the roster in [HOLOS_NEIGHBORS.md](HOLOS_NEIGHBORS.md#the-roster).
- **[Abe, Abe-Ouchi, Sleep and Zahnle 2011, dry planets](https://doi.org/10.1089/ast.2010.0545)** · Published, Astrobiology.
  - A land planet keeps liquid water at its poles up to 170% of Earth's sunlight, against 135% for an ocean planet. It freezes at 77% of Earth's light, against 90%.
  - Matters: dry worlds have a wider warm zone.
  - Used: Quessa.
- **[Pierrehumbert 2011, eyeball Earth](https://doi.org/10.1088/2041-8205/726/1/L8)** · Published, ApJL.
  - A locked, mostly frozen planet can keep one stable pool of open water under its fixed sun.
  - Caveat: written for Gliese 581g, which is no longer accepted as real ([Robertson et al. 2014](https://doi.org/10.1126/science.1253253)). The climate result stands as a general case.
  - Used: Ombe.
- **[Leconte, Wu, Menou and Murray 2015, asynchronous rotation](https://arxiv.org/abs/1502.01952)** · Published, Science.
  - Tides in a planet's air can keep a warm world from locking. With 1 bar of air, only around stars above about 0.5 to 0.7 Suns. With 10 bars, down to about 0.3 Suns.
  - Matters: turning worlds at M dwarfs need thick air and a brighter M dwarf.
  - Used: Hesk, Wenn and Lusk, and the checker's brightness floor, 0.03 Suns of light.
- **[Barnes 2017, tidal locking](https://arxiv.org/abs/1708.02981)** · Published, Celestial Mechanics and Dynamical Astronomy.
  - Locking is possible for most planets in the warm zones of G, K and M dwarfs, if they start spinning slowly and have no moon.
  - Matters: locked worlds are a normal case, not an oddity.
  - Used: the roster's mix of locked and turning worlds.
- **[Luger and Barnes 2015, water loss at M dwarfs](https://arxiv.org/abs/1411.7412)** · Published, Astrobiology.
  - A young M dwarf's long bright phase can hold its warm-zone planets in a runaway greenhouse for hundreds of millions of years. They can lose several oceans.
  - Matters: M-dwarf worlds that kept life are likely dry, and M dwarfs stay low-weight hosts.
  - Used: the dry M-dwarf worlds, and the host weights.
- **[Yang, Boué, Fabrycky and Abbot 2014, slow rotation](https://arxiv.org/abs/1404.4992)** · Published, ApJL.
  - Slow rotators build thick clouds over their noon side and stay Earth-like at nearly twice the light of fast rotators.
  - Used: Sere.
- **[Cowan and Abbot 2014, super-Earths need not be water worlds](https://iopscience.iop.org/article/10.1088/0004-637X/781/1/27)** · Published, ApJ.
  - A planet with plate tectonics keeps dry land if its water is under about 0.2% of its mass, at any size, since deeper seafloors push more water into the mantle.
  - Used: Varn, Sabe, Lusk and Kesh's continents.
- **[Schulze-Makuch, Heller and Guinan 2020, superhabitable worlds](https://doi.org/10.1089/ast.2019.2161)** · Published, Astrobiology.
  - A world better for life than Earth: a K dwarf 5 to 8 billion years old, a planet up to 1.5 Earth masses, a little warmer, with shallow seas and a large moon.
  - Used: Ilm.
- **[Williams and Pollard 2002, eccentric orbits](https://doi.org/10.1017/S1473550402001064)** · Published, International Journal of Astrobiology.
  - Long-term climate depends mostly on the light averaged over a whole orbit. Their models ran an Earth twin at eccentricities up to 0.4.
  - Used: Tolle.
- **[Bolmont, Libert, Leconte and Selsis 2016, limits of the mean-flux rule](https://arxiv.org/abs/1604.06091)** · Published, A&A.
  - The averaging rule breaks down at high eccentricity: above 0.6 around a Sun-like star, a planet freezes near its far point.
  - Matters: Tolle's 0.3 is safely inside.
  - Used: Tolle.
- **[Armstrong et al. 2014, obliquity swings](https://arxiv.org/abs/1404.3686)** · Published, Astrobiology.
  - Fast, large swings in tilt weaken ice-albedo feedback. The swings alone push the warm zone's cold edge out by up to 20%.
  - Used: Odun.
- **[Li and Batygin 2014, a moonless Earth's tilt](https://arxiv.org/abs/1404.7505)** · Published, ApJ.
  - Without a moon, tilt wanders fast between 0 and 45 degrees, but takes about 2 billion years to reach extremes. Slow enough not to preclude habitability.
  - Related: [Laskar, Joutel and Robutel 1993](https://doi.org/10.1038/361615a0) found the Moon holds Earth's tilt to ±1.3 degrees. [Lissauer, Barnes and Chambers 2012](https://doi.org/10.1016/j.icarus.2011.10.013) found a moonless Earth's range typically 20 to 25 degrees over hundreds of millions of years.
  - Used: Odun.
- **[Zahnle and Catling 2017, the cosmic shoreline](https://arxiv.org/abs/1702.03386)** · Published, ApJ.
  - Bodies with and without air split along a line where sunlight scales as escape speed to the fourth power.
  - Matters: a small world keeps its air only with modest light.
  - Used: Ruun.
- **[Buchhave et al. 2012, small planets at all metallicities](https://www.nature.com/articles/nature11121)** · Published, Nature.
  - Giant planets favor metal-rich stars. Small planets form around stars with a wide range of metals.
  - Used: Ruun, at a metal-poor star.
- **[Sato, Cuntz, Guerra Olvera, Jack and Schröder 2014, F stars](https://arxiv.org/abs/1312.7431)** · Published, International Journal of Astrobiology.
  - Ultraviolet damage to DNA at Earth-like distances from F stars is 2.5 to 7.1 times the Sun's with no air, less with air.
  - Used: Faen.
- **[Kiang et al. 2007, photosynthesis under other stars](https://doi.org/10.1089/ast.2006.0108)** · Published, Astrobiology.
  - Pigments should peak in near infrared under M dwarfs, red-orange under K stars, blue under early F.
  - Used: Tavi.
- **[Claudi et al. 2021, cyanobacteria under M-dwarf light](https://doi.org/10.3390/life11010010)** · Published, Life.
  - Cyanobacteria grew under simulated M-dwarf light about as well as under sunlight.
  - Used: the M-dwarf worlds' life.
- **[Howard et al. 2018, a naked-eye superflare from Proxima](https://arxiv.org/abs/1804.02001)** · Published, ApJL.
  - Proxima brightened about 68 times. At least 5 such flares a year could cut an Earth-like ozone layer by 90% within 5 years.
  - Used: Vesh.
- **[Günther et al. 2020, flares in TESS's first data](https://arxiv.org/abs/1901.00443)** · Published, AJ.
  - Flares on about 30% of mid-to-late M dwarfs, 5% of early M dwarfs, and under 1% of F, G and K stars.
  - Matters: a strike's flash at an M dwarf would be filed as a flare.
  - Used: Tavi, Corra, Mirr.
- **[Heller and Barnes 2013, exomoon habitability](https://arxiv.org/abs/1209.5323)** · Published, Astrobiology.
  - Starlight, planet light and tidal heat set an inner "habitable edge" for moons. Moons beyond about 10 planetary radii can be habitable.
  - Not used yet: radial-velocity surveys would see most warm giants around near stars. Held for a neighbor on a moon of a known giant.
- **[Greaves et al. 2004, Tau Ceti's debris disk](https://people.ast.cam.ac.uk/~wyatt/gwhd04.pdf)** · Published, MNRAS.
  - A disk out to about 55 AU with at least ten times the dust of the Kuiper belt, around a star older than the Sun.
  - Used: Ulan.
- **[Kershenbaum 2020, The Zoologist's Guide to the Galaxy](https://openlibrary.org/isbn/9780241406793)** · Book, Viking.
  - Natural selection is universal, so Earth's animals predict alien bodies, senses and societies.
  - Used: the strange neighbors, Ystra and Hesk most.
- **[Frank, Carroll-Nellenback, Alberti and Kleidon 2018, the Anthropocene generalized](https://doi.org/10.1089/ast.2017.1671)** · Published, Astrobiology.
  - Models coupling a civilization to its planet show a soft landing, a boom and die-off, or collapse.
  - Used: Anwe.
- **[Lin, Gonzalez Abad and Loeb 2014, industrial pollution](https://iopscience.iop.org/article/10.1088/2041-8205/792/1/L7)** · Published, ApJL.
  - CFCs in an Earth-like planet's air could be detected or ruled out at about 10 times Earth's level, in about 1.2 to 1.7 days of JWST time for a planet around a white dwarf.
  - Used: Anwe's polluted sky, a seeded find for later telescopes.
- **[Chambers, Wetherill and Boss 1996, multi-planet stability](https://doi.org/10.1006/icar.1996.0019)** · Published, Icarus.
  - Instability time grows exponentially with spacing. Systems packed tighter than about 10 mutual Hill radii eventually go unstable.
  - Used: the checker's spacing from known small planets.
- **[Gladman 1993, two close planets](https://doi.org/10.1006/icar.1993.1169)** · Published, Icarus.
  - Two planets never meet if their orbits are more than 2√3 mutual Hill radii apart.
  - Used: the checker's spacing from known giants.
- **[NASA Exoplanet Archive, composite planet table](https://exoplanetarchive.ipac.caltech.edu/)** · Reference.
  - Discovery method and radial-velocity amplitude for each known planet within 50 ly.
  - Matters: Barnard's Star, Tau Ceti, Proxima and 82 Eridani already show planets at 0.2 to 0.5 m/s, so an invented world there must tug less.
  - Used: the checker's per-star 2026 floor.
- **[Mamajek 2012, Fomalhaut's age](https://arxiv.org/abs/1206.6353)** · Published, ApJL.
  - Fomalhaut and its companion TW Piscis Austrini are about 440 million years old.
  - Used: TW PsA is dropped as a host, too young.

## Why the sky is quiet: computing and heat

- **[Garrett 2026, Slysh haloes](https://arxiv.org/abs/2608.31153)** · Preprint, August 2026.
  - The energy cost of computing falls with temperature, so mature minds may compute cold, far from their star, at about 5 to 28 K. Their waste heat glows grey and line-free in the far infrared and submillimetre, not the mid-infrared older searches watched. A thin-film halo of 10²⁰ W at 12 K weighs about 2×10²⁰ kg, a fraction of Ceres.
  - Herschel's DEBRIS (446 stars within 45 pc) and DUNES (133 within 25 pc) at 100 µm, and JCMT's SONS (100 within 50 pc) at 850 µm, can be read as limits: about 7×10¹⁹ W at 10 pc, 10⁻⁷ to 10⁻⁵ of a star's light. ALMA and NOEMA suit compact haloes around M dwarfs.
  - Matters: v1's cold, inward minds stay hidden at Earth's scale, but a neighbor that grew large would show. A cold halo can pass for a debris disk until several wavelengths are compared.
  - Used: v2 [Why the sky is quiet, rechecked](HOLOS_GAME_CONCEPT.md#why-the-sky-is-quiet-rechecked), the neighbor template.
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
- **[Gaia DR4](https://www.cosmos.esa.int/web/gaia/dr4)** · release set for December 2, 2026, with the first large set of planets found by astrometry. Rebuild the census after release and validation, per v1's migration notes, and recheck the host list and leads.
- **Epsilon Indi Ab's atmosphere** · two 2026 preprints. Feed Earth's leads (v2 open question 3).
- **JWST's August 2026 look at Alpha Centauri A** · not yet published. Adopt the result for candidate S1.

## To check

- Cross-check calcs/hosts.py's wide pairs with the El-Badry catalog. VizieR is reachable again as of 2026-10-10.
- Other white dwarf companions that may have scorched a warm zone, such as Gliese 86 B. Only Procyon is handled.
- Companion masses in calcs/binaries.py are rough: dynamical masses depend on distance cubed, and white dwarfs read as light from their brightness.
- Ages for K and M dwarfs within 50 ly from activity or spin, beyond the six known young stars. Xi Bootis A may be young: FLAME gives 4.75 Gyr, its fast spin suggests far less.
- Smith and Lissauer 2009, Icarus: confirm the lifetime of Earth-mass systems near 9 to 10 mutual Hill radii, for the checker's spacing rule.
- Tau Ceti dust belt tilt in leads.py against MacGregor et al. 2016.
- Beta Hydri drift: find the 2012 and 2023 primary papers.
- Earth's aimed messages: transmitter power, frequency and duration from primary sources.
- Primary links for the classic propulsion and space-industry studies.
