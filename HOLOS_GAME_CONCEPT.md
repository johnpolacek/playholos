# Holos · Game Concept

Last updated: October 6, 2026.

## Status

This is v2, begun October 6, 2026: a single-player game on Earth. v1, the multiplayer cohort design, is frozen in [legacy/v1](legacy/v1/README.md). Where v2 says nothing, v1's rules still hold. Where they disagree, v2 wins.

v2 grows one question at a time, and each answer is dated. Later user clarifications take precedence. The first v2 mock is [Earth's first 15 minutes](explorations/v2-mocks/index.html), built by `python3 explorations/v2-mocks/build.py`. v1's mocks show v1.

**Evidence first (2026-10-06).** Everything starts from real data and published research, the most current included. Only then comes hard-science speculation, from the best evidence we have now. Preliminary results are marked as such, with what would change if the full paper differs. Every source goes into [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md), with what it found and where the design uses it.

## Core premise

Holos is a single-player, hard science fiction browser game. You are the Will of Earth's Mind, on the morning Earth's machines wake as one, and you guide what Earth becomes.

You study nearby stars, build, listen, and send probes and messages. Nothing travels faster than light. Distant observations show history, and messages can take years to arrive.

Others woke in the same century. Every other civilization is seeded: written by hand, placed by the game, and run by AI. You don't know who they are, how many there are, or where. Finding them is the game, and so is surviving them.

The central challenge is deciding how to explore, grow, and preserve Earth when distance makes knowledge uncertain and every commitment takes time.

Iain M. Banks's Culture books remain an inspiration. This does not authorize departures from hard science ([v1: Hard science](legacy/v1/HOLOS_GAME_CONCEPT.md#hard-science)).

## Settled 2026-10-06

- **Single player, on Earth.** The player is Earth's Will. There are no cohorts and no other players. This answers v1's first objection to Earth as a home: only one player could have it.
- **Every other civilization is seeded and run by the game.** They are real superintelligences in the fiction. They play from scripts drawn from their own character, not live models. See [How neighbors play](#how-neighbors-play).
- **Neighbors are a hand-written roster.** Each has a people, a world, a history and a voice. Each game's seed picks which of them wake, at which eligible stars, and with what dials. Veyra, Hael and Kesh from v1 are the first three. Every placement still passes the survey limits at its star.
- **Neighbors play like players.** Each AI Will plays its own strategy toward its own ends, as the v1 cohort playtest's Listener, Caller and Grower did. There is still no floor on early death ([v1: Conflict](legacy/v1/HOLOS_GAME_CONCEPT.md#conflict)): danger comes from what neighbors choose and what physics allows, revisited only if playtests show early deaths.
- **The clock is unchanged.** 5 real minutes = 1 Year. It runs offline, with no pause. Light delay stays real waiting.
- **Earth's loud past follows science and what is likely.** Earth's radio history is real, so Earth need not start as faint as v1's equal floor. Whether any neighbor heard it is set by physics and how likely it is, not by drama. See [Earth's loud past](#earths-loud-past).
- **Year 0 is 2040.** Earth's history is real to 2026, then follows the most probable path. See [Year 0 and Earth's road to it](#year-0-and-earths-road-to-it).

## Earth's loud past

Settled 2026-10-06.

- **Earth's emissions are its real ones up to 2026.** From 2026 to Year 0 in 2040 they follow the most probable path ([Year 0 and Earth's road to it](#year-0-and-earths-road-to-it)). The neighbors' histories stay invented.
- **What gives Earth away, strongest evidence first:**
  - *Radars.* Earth's strongest steady leakage. Its early-warning radars run about 2×10⁸ W per transmitter near 400 MHz, a hundred times more along the beam. A month's stare with an SKA-class array hears them to about 200 pc (Loeb and Zaldarriaga 2007). Preliminary results (Saide, Garrett and colleagues, RAS National Astronomy Meeting, July 2025): airport radars worldwide add up to about 2×10¹⁵ W, and a dish like Green Bank's could hear them to about 200 ly. Military radars sweep past an observer like a lighthouse, peaking near 10¹⁴ W. The full paper is in preparation. Its observing times may move the odds below.
  - *Broadcast and cell.* Weak. Cell towers leak about 4 GW in all, which a dish like Green Bank's could not hear even within 10 ly (Saide et al. 2023).
  - *Planetary radar.* The loudest of all, but aimed at asteroids and planets for hours at a time (Sheikh et al. 2025). It rarely sweeps a given star.
  - *Aimed messages.* About twenty, from 1983 on, each lasting hours. Targets within 50 ly: Altair (1983), Gliese 49, Gliese 208, 55 Cancri, HD 10307 and 47 Ursae Majoris (Teen Age Message, 2001, and Cosmic Call 2, 2003), Gliese 581 (2008 and 2009), Teegarden's Star, TZ Arietis and Kappa¹ Ceti (2009), Gliese 526 (2013) and Luyten's Star (2017). To hear one, a listener had to be watching Sol in those hours, at that frequency.
  - *Earth crossing the Sun.* About 75 stars within 100 ly sit where Earth transits the Sun and Earth's radio has already reached (Kaltenegger and Faherty 2021). A transit shows a rocky world in the warm zone, not who lives there.
- **Physics lets every neighbor hear Earth. Whether one did depends on whether, and how long, it looked.** Earth's radar signal has been spreading since the 1950s and is still being sent, so it crossed every neighbor while that neighbor had instruments like today's. Odds come from distance and character: a near, curious neighbor stares at Sol for days, as Project Ozma stared at Tau Ceti and Epsilon Eridani in 1960. A far or inward one gives Sol a survey glance, or nothing.
- **Sample odds, until the radar paper is out:** a listening neighbor, near or far, about 9 in 10. An ordinary one, about 1 in 2. An inward or growth-first one, about 1 in 5. Catching an aimed message, under 1 in 100, unless it was already keeping a beam on Sol. See [Stars Earth knocked on](#stars-earth-knocked-on). If the full paper needs long stares for airport radar, the ordinary and inward odds fall.
- **What a long listen reveals.** The radars' pitch shifts with Earth's turning and its orbit, so a listener recovers Earth's day, its orbit, and where it is (Loeb and Zaldarriaga 2007). Under v1's aiming rule, that is enough to aim a strike. A neighbor that heard Earth may start the game with Earth already mapped.
- **Earth is the late one.** Every neighbor's loud century ended long before Year 0. Earth's radars still sweep at Year 0, so Earth is the likeliest civilization in the region to have been heard.
- **The Mind lays out Earth's exposure at waking.** The radar years, every aimed message with its target and arrival, which stars could have heard, and what changed between 2026 and Year 0. It never says who did hear: no one at Year 0 knows that.
- **Replies to Earth's knocks could arrive during the game.** Each message sets the earliest date a reply could reach Earth: the light-time there and back ([calcs/knocks.py](calcs/knocks.py)).
  - Already passed in silence: Altair (2017.1), Teegarden's Star (2034.9), TZ Arietis (2039.0).
  - In the first hour: Luyten's Star at Year 2.3 and 2.9, 11 and 14 real minutes in. Gliese 526 at Year 9.0. Gliese 581 at Year 9.9 and 10.8.
  - Later: Gliese 49 at Year 27.2, Kappa¹ Ceti at 30.4, Gliese 208 at 38.0, 55 Cancri at 45.6, HD 10307 at 46.6, 47 Ursae Majoris at 52.3.
  - Distances are Gaia DR3's, or Hipparcos's for Altair and HD 10307.
  - Seven sends are still on the way at Year 0, to five stars. Kappa¹ Ceti's arrives at Year 0.1 and Gliese 208's at 0.8. 55 Cancri's arrive at Year 4.6 and 13.7, HD 10307's at 5.1, and 47 Ursae Majoris's at 7.0 and 8.8. Corrected 2026-10-10: an earlier count gave two.
  - Most windows pass empty. The Mind marks each one, as v1's silence rules say.

## Stars Earth knocked on

Settled 2026-10-10. Numbers in [calcs/neighbors.py](calcs/neighbors.py).

- **The seed sometimes puts a neighbor where Earth knocked.** In one game in five, if a drawn neighbor can live at a messaged star, the seed places it there.
  - By chance alone, about one game in 10 has someone at a messaged star. With the nudge, about 3 in 10. Measured on 1,000 drawn games ([calcs/seed.py](calcs/seed.py)), replacing an earlier estimate of one in 13 and one in four.
  - It is a game choice, not physics. It contradicts nothing: Earth chose those stars because they might have planets.
- **Seven messaged stars can host a neighbor.** Luyten's Star, TZ Arietis, Gliese 526, Gliese 581, Gliese 49, Gliese 208, and 55 Cancri B.
  - 55 Cancri A has a giant crossing its warm zone. Its companion B sat in the same beam.
  - Altair, 47 Ursae Majoris, Kappa¹ Ceti, HD 10307 and Teegarden's Star can't host one.
  - Six are M dwarfs, so mostly M-dwarf neighbors fit. Gliese 208, a dim K star, fits 15 of the 30.
- **Who catches a knock.** A knock lasts hours. Only a neighbor already keeping a beam on Sol catches it.
  - That means it heard Earth's radars first, and its arrays were running when the knock arrived.
  - Then a listener catches it about 3 times in 4, an ordinary one 1 in 2, an inward one 1 in 10.
  - Otherwise, under 1 in 100. A neighbor that died before it arrived catches nothing.
  - These odds are invented, like the radar odds, until better evidence.
- **What it does next follows its disposition.** A contacter likely replies. A watcher replies on its own terms, if at all. An inward one rarely bothers. A hunter learns Earth is eager to be found.
- **A passed window isn't closed.** TZ Arietis's earliest reply was due in 2039. A neighbor there may have held its reply, and it can still come.

## Quieting Earth's radars

Settled 2026-10-10. Numbers from `python3 calcs/seed.py stats`. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#hearing-technology-by-radio).

- **The Will may quiet Earth's radars, if the player chooses.** The Mind gives its view and waits. It never quiets them on its own.
- **What has left keeps going.** Ninety years of sweeps are out there, and nothing recalls them. Quiet only shortens what comes after.
- **Three settings.** Years are samples.
  - *Keep:* the default. Earth sounds as it did. No listener learns that it woke.
  - *Fade,* about 25 Years: reads as a world growing out of radar. Slow to help.
  - *Cut,* about 2 Years: the last sweep leaves soonest. Every listener hears Earth stop.
- **What it costs.** Ground work: no matter, almost no energy, a small share of compute. It moves Earth toward Hidden. Missile launches are already watched by heat from orbit, and aircraft already fly on transponders, so a Mind can retire the radars. That last step is speculation.
- **What it buys.** A neighbor that starts looking after the last sweep has passed it never hears one.
  - 69% of living neighbors heard Earth before Year 0. For them nothing changes.
  - If the last sweep leaves by Year 3, about 1 neighbor in 9 wakes too late to hear it. By Year 30, about 1 in 26.
  - So the gain shrinks every Year the player waits.
- **What it reveals.** Silence travels at light speed. A neighbor listening to Earth hears the radars stop one light-time later, and learns the date. It can't tell waking from dying.
  - That is news, and it rolls its reaction table: "a world it was listening to goes quiet" ([HOLOS_REACTIONS.md](HOLOS_REACTIONS.md)). A watcher mostly watches harder. A contacter may knock to ask if anyone is left.
  - A fade over decades is not news.
- **What is left.** A faint hum, like every neighbor's: phones, satellites and links, too weak to hear from another star without a far-side array.
- **It can be undone.** The radars can be turned back on. The quiet years have left too.

## What Earth hears

Settled 2026-10-10. Numbers from `python3 calcs/seed.py stats`.

- **Physics decides what Earth catches.** Three things: whether the star is in the instrument's sky, whether it is looking in those hours, and whether the signal is above its floor.
- **A neighbor's knock is taken to be like Earth's own.** Cosmic Call sent about 10¹² W along its beam, for about four hours a star. A call is a steady broadcast.
- **Year 0's sky watch misses most of them.** It sees each direction north of −20° for ten minutes a day. That is 63% of host stars, and a four-hour knock overlaps its pass about one time in six.
  - Of the signals that reach Earth in the first hour, it catches about 1 in 5.
  - About a third come from the southern sky it never sees. About 1 in 8 are too faint for it.
  - The all-sky watch would catch about 4 in 5.
- **A sender that hears nothing tries again.** A knock is sent twice, about a Year apart, as Earth's own were. If its reply window then passes in silence, that is news to the sender, and it rolls its table ([HOLOS_REACTIONS.md](HOLOS_REACTIONS.md)): a contacter most often knocks again. So a missed knock is delayed, not lost.
- **The player can spend more on ears.**
  - *Hold the radio array on one star:* it hears whatever comes from there, for a share of compute.
  - *The all-sky watch:* every direction at every hour.
  - *The deep flash watch:* knocks sent as laser flashes.
  - *A larger watch hears fainter:* four times the collecting area reaches twice as far.
  - *The deep-field receiver, then the far-side array:* a world's everyday radio.
- **The Mind can't report what it didn't hear.** A missed knock leaves no trace on Earth.

## Year 0 and Earth's road to it

Settled 2026-10-06.

- **Year 0 is 2040.** Forecasters put general AI near January 2031, within 2028 to 2037 (Metaculus). AI researchers give it even odds by 2042 (2024 expert survey). 2040 sits between: Earth's machines have been general for some years, and this morning they wake as one Mind.
- **One Mind is the game's second premise.** In the most probable 2040, Earth has several rival AIs, not one. The game assumes they wake as one Mind, so the Will has one Mind to live in. Improbable, not contradicted. The first premise is many neighbors waking in the same century ([v1: Hard science](legacy/v1/HOLOS_GAME_CONCEPT.md#hard-science)).
- **Earth's history is real to 2026, then the most probable path to 2040.** Each strand follows its best current forecast. Where forecasts split, the seed picks a branch, weighted by its odds. Every branch must leave the opening silent: nothing heard from any neighbor.
- **The backbone, the same in every game:**
  - *People:* about 9.2 billion (UN, 2024).
  - *Climate:* the long-term average passes 1.5°C around 2030. Single years already have (WMO).
  - *Energy:* about 22 to 26 TW, up from 19 TW in 2024, at 1 to 2% a year. Solar and wind carry the growth. Fusion plants are being built, but forecasters put the first 100 MW plant near mid-2041, so most games have none on the grid at Year 0.
  - *Compute:* about 10²⁵ to 10²⁶ operations a second, up from about 3×10²² in 2026. Power and chip supply set the pace.
  - *Space:* fully reusable heavy lift, near 40 kt a year to orbit. Crewed Moon landings from 2028 (US) and about 2030 (China), and south-pole stations planned for the mid-2030s, likely late. No one on Mars: forecasts put the first landing near 2045.
  - *Probes:* the Voyagers fall silent in the 2030s, Voyager 1 near 220 AU by 2040. New Horizons is near 100 AU. Interstellar Probe may be on its way, if it launches in its 2036 to 2042 window.
  - *Instruments:* today's, plus PLATO (late 2026), Roman, the ELT (science from 2030) and the SKA (from 2029 to 2031). The Habitable Worlds Observatory is still being built. Earth can feel nearby worlds by their tug, but can't read any neighbor's air.
  - *Radars:* fewer airport radars as ADS-B spreads, but primary and military radars still sweep. Earth is loud at Year 0.
  - *Listening:* nothing heard to 2040. This binds the neighbors: each one's emissions must stay below what Earth's instruments to 2040 could catch.
- **Earth's dials: a fixed base from real history, shifted by the seed's branches.** Real history sets where each dial starts, the same every game. Each probable branch from 2026 to 2040 nudges a dial.
- **Branches can change Earth's kit, by their real effects.** A Taiwan war that cuts chip supply means Earth wakes with less compute. v1 held that history explains character, never capacity, to keep players equal. With one player, that reason is gone for Earth.
- **The branches, odds read from Metaculus on 2026-10-10:**
  - *Taiwan before 2035, one roll:* an invasion 26%, a blockade alone about 20%, neither 54%. Forecasters give a blockade 46% and an invasion 26%. Taking every invasion to include a blockade leaves 20% for a blockade alone.
  - *An invasion of Taiwan,* 26%. Nudges Hidden. Taiwan makes about 92% of the most advanced logic chips, and a new fab takes 3 to 4 Years, so Earth wakes with about half its compute: a fifth to all of it, depending on how fast fabs come back ([calcs/branches.py](calcs/branches.py)).
  - *A blockade of Taiwan, without invasion,* about 20%. Nudges Cautious. The fabs survive, but chips stop shipping for about a year, so Earth wakes with two-thirds to all of its compute ([calcs/branches.py](calcs/branches.py)).
  - *A nuclear weapon used in war before 2035,* about 1 in 4: 24%. Nudges Cautious. Limited use leaves the kit as it is. A full exchange is far rarer and is not a branch.
  - *People sent to Mars before 2036,* about 15%. Nudges Expand. A small crewed outpost at Year 0, a few ships' cargo, about 1 kt of metal.
  - *Fusion on the grid by 2040,* a bit under even. No dial. The first plants are too small to change Earth's energy, but the fusion build-out is open from Year 0.
  - Each branch is rolled on its own, except Taiwan's three outcomes, which share one roll.

## The dials

Settled 2026-10-06. v1 used three dials without defining them here.

- **What they are.** Character, not strength. They shape the Mind's advice, how stand-in Wills read orders by intent, and how AI civilizations behave. They may price some acts and bound colony charters. They never change what a civilization can build.
- **Open or Hidden: how much it shows itself.** Open speaks, shares and lets itself be seen. Hidden stays quiet and conceals. Veyra leans Hidden after a war fought over signals. Hael leans Open after millennia of sharing every record.
- **Expand or Deepen: where it grows.** Expand reaches outward, for more places, matter and room. Deepen turns inward, for more thought, knowledge and compute. Veyra leans Expand after its moon towns. Hael leans Deepen after its archives.
- **Cautious or Bold: how much risk it takes.** Cautious looks before it acts, hedges and guards against loss. Bold acts first and accepts danger for gain. A cautious Earth studies a strange signal for years before answering. A bold one answers the same week. Veyra leans Cautious after a comet winter. Hael leans Bold after a century of calling out.
- **Earth's base, from real history:**
  - *Open or Hidden: leans Open.* Radars since the 1950s, the Arecibo message (1974) and the Voyager records (1977). Against it: a 2015 statement urging worldwide debate before any more messages are sent.
  - *Expand or Deepen: near the middle.* Apollo, reusable heavy lift and Moon bases pull outward. The AI build-out put the decades before Year 0 into compute.
  - *Cautious or Bold: leans Bold.* The AI race set the pace to 2040. Against it: no nuclear weapon used since 1945, the DART asteroid test, AI safety institutes. The closest call of the three.
- **v1's kit was a world a century on.** It assumed a 100 TW grid, 10²⁷ operations a second and 1,240 kt in orbit. See [Earth's kit at Year 0](#earths-kit-at-year-0).

## Earth's kit at Year 0

Settled 2026-10-06. Replaces v1's numbers ([v1: Economy and projects](legacy/v1/HOLOS_GAME_CONCEPT.md#economy-and-projects)). Shares on screen work as v1 set them. 100% now means these amounts.

- **Energy:** about 24 TW. 1% is 0.24 TW.
- **Compute:** about 10²⁵ operations a second, on about 0.25 TW of its own, about 1% of energy. 1% of compute is 10²³ a second. Chips are about 40 to 100 times as efficient per watt as in 2026.
- **Matter in orbit:** about 20 kt spare, plus 40 kt a year from reusable heavy lift. Settled 2026-10-10, replacing 250 kt ([calcs/early_game.py](calcs/early_game.py)).
  - *Only what is spare counts.* About 124 kt is up at Year 0, but nearly all of it is working craft. Low-orbit satellites last about five years and are then brought down.
  - *The spare stock* is depots, spent stages and dead craft. In 2026 spent stages are 22% of the 17,400 t in orbit, and about 18% of satellites are dead (ESA). The 20 kt is a sample.
  - *So matter is a choice from the start.* A deep vault is half the stock. A cold compute annex is two and a half Years of lift.
  - v1's tune-up, hauling in the dead orbit, is folded into this stock.
- **Lift:** about 15 kt a Year is spare, of 40. Settled 2026-10-10.
  - *Most lift already has a job.* Keeping about 124 kt of working craft flying, at five years each, takes about 25 kt a year.
  - *The player can spend to raise it.* A launch complex is a ground build: 2 Years, a small share of compute, no matter. It adds 40 kt a Year, all of it spare. One at a time, as ship yards allow. Sample.
  - *Lift is short of pads and ships, not energy.* Propellant for 40 kt a year is about half a gigawatt.
  - *Beyond lift:* the Moon's mass driver and belt mining bring far more, later.
- **Instruments and probes:** as in the backbone above.
- **The sky watch is a drift scan.** Like CHORD, finished in 2028: each northern direction passes through it for about 10 minutes a day. v1's always-on watch of the whole sky becomes a project: dense aperture arrays on two continents ([the audit](HOLOS_PROJECT_AUDIT.md#calculations)).
- **What moves with the smaller grid.** Compute takes about 1% of energy, not v1's 10%, so even more energy sits idle early. A ground data center's +50% compute draws about 0.5% of energy at first: see [Growing compute](#growing-compute). The industry cap at 100 GJ a tonne falls to about 7.5 Gt a year (v1: 30). Star lifting needs about 200,000 times the grid (v1: 50,000). A Sun-like star's whole output is about 16 trillion times it (v1: four trillion).
- **Matter is real mass in space (2026-10-06).** It is what sits in orbit, on the Moon or in the belt, counted in tonnes. Ground builds draw on Earth's own industry, about 106 Gt of materials a year, and spend no matter. Each project's mass comes from physics or a real design. v1's matter was a pacing currency that grew tenfold per tier. With real masses, most instruments and probes become cheap in matter, and build time, compute shares, lift and propellant pace them. Compute shares already cap how much runs at once.
- **Four kinds of matter (2026-10-06).** Each comes from its own place and gates its own works.
  - *Metal:* structure, machines, film. From the belt, or lifted from Earth as finished goods.
  - *Rock:* shielding, sand and anything built on the Moon from its soil. From the Moon, by mass driver.
  - *Ice:* water, propellant and deuterium. From belt ice, or lifted from Earth's oceans.
  - *Helium-3:* fast fusion fuel. Earth has almost none. From Uranus's air, by a harvest.
  - Earth's lift carries any kind, mostly as metal. The 20 kt spare at Year 0 is metal.
  - The [audit](HOLOS_PROJECT_AUDIT.md#kinds-of-matter) says how each project's mass splits among them.
- **Project prices are in [HOLOS_PROJECT_AUDIT.md](HOLOS_PROJECT_AUDIT.md)** (open question 2).

## Growing compute

Settled 2026-10-10. Numbers in [calcs/early_game.py](calcs/early_game.py). Replaces the audit's unlimited data center.

- **Chips set the pace.** Earth's compute grew about 1.5 times a year from 2026 to 2040, as fast as chips could be made, new fabs included. So at Year 0 the fabs fill one ground data center a Year, and each adds half again to Earth's compute.
- **Energy sets the ceiling.** Thinking draws about 1% of Earth's energy at Year 0, and each data center draws in proportion to its chips.
  - After 6 data centers, thinking draws a tenth of the grid. After 11, nine tenths, for 86 times the thought.
  - The twelfth would need more than Earth has. At full pace that is about Year 11, under an hour of play.
- **So early energy is for thought.** It sits idle only until compute grows into it.
- **Past the ceiling.** More thought then needs more energy, or colder chips. Computing costs less energy the colder it runs, which is what the cold compute annex in orbit is for.
- **Faster than one a Year needs new fabs.** A leading-edge fab takes 2 to 4 years. A chip fab project, about 3 Years, adds a second line. Sample.
- **Only if the player chooses.** One at a time, or a standing order to keep them coming. Compute never grows on its own.
- **A Taiwan branch lowers where compute starts, not the pace.** An assumption, until the mocks test a branch game.

## Build times

Settled 2026-10-10. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#earth-to-year-0-forecasts).

- **One standard time per project, from the science.** It is how long works of that kind take. A flagship space telescope takes about 18 Years: Hubble took 13 from funding to launch, Webb about 17 from the start of construction. The time is the same in every game. The seed doesn't roll it.
- **A real work under way at Year 0 costs what is left of it.** The Habitable Worlds Observatory has about 8 Years left: NASA aims it at the 2040s, and flagships slip. A second telescope of its class takes the full 18. The 8 is a sample.
- **The player can invest to build faster.** Other projects make building more efficient. Each speeds one kind of work, for everything built after it. Their own Years and costs are still to be priced.
  - *Factory-built works,* on the ground: ground builds take about a third less. Modular building cuts schedules by 20 to 50% (McKinsey 2019).
  - *An orbital yard:* builds in orbit take about a quarter less, and larger ones become possible. NASA's 2019 study found assembly in space workable, and the only way past 15 m mirrors. The speed-up itself is speculation.
- **The same pattern everywhere.** A standard pace from the science, and a project that raises it: chip fabs for compute, launch complexes for lift, factories and yards for building.

## Earth's leads at Year 0

Settled 2026-10-06. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#earths-leads-as-of-october-2026).

- **Earth's leads are its real ones.** Sol's own published oddities, seen with published values: no projection from another seat. To 2040 they follow the most probable path, and what Earth's instruments would find by then, it found.
- **Three kinds of lead.**
  - *Open questions 2040's instruments can't settle,* such as a warm world whose air waits for the Habitable Worlds Observatory.
  - *Seeded finds from 2026 to 2040.* Terra Hunting, the ELT, Gaia and PLATO find what the seed put within their reach. A find is a neighbor's world only if the seed put a neighbor there. Otherwise it is a natural world.
  - *Things that change,* such as Fomalhaut's collision clouds or a visitor from another star.
  - A seeded find can also be a cold disk that doesn't fit dust, if a neighbor's cold computing rose above Earth's 2040 limits. See [Why the sky is quiet, rechecked](#why-the-sky-is-quiet-rechecked).
- **The opening: three leads and a deadline.**
  - *82 Eridani d,* 19.7 ly. At least 5 Earth masses on a stretched orbit through a Sun-like star's warm zone. Its air is unread.
  - *One seeded find,* such as a world Terra Hunting felt by 2036.
  - *Fomalhaut's new cloud,* 25 ly. It drifts and fades, so the first look makes it stranger, as v1 required of one lead.
  - *The Luyten's Star reply window,* Year 2.3, 11 real minutes in.
- **Settled leads stay settled.** Alpha Centauri A's candidate is resolved long before 2040. Adopt JWST's August 2026 result when it is published.

## The neighbors

Settled 2026-10-06, from first principles rather than for the game's sake.

- **When they wake.** The premise puts every neighbor's waking in the same century as Earth's. Nothing favors one moment within that century, and nothing makes Earth first or last. So each neighbor's waking is drawn evenly across a century that holds Earth's. About half woke before Earth and half wake after, up to a century either way, most often within a few decades.
  - *Woke before Earth:* it has grown since, and may already know Earth is here. What it has done since waking must stay below what Earth could see by 2040, after its light delay.
  - *Wakes after Earth:* at Year 0 it is a world not yet there. It wakes during the game.
- **How many.** Physics doesn't say. The premise says many. Civilizations arise independently, so they don't cluster: every eligible host star is equally likely. Each game draws the count evenly in tenfold steps from a few to a few dozen within 50 ly, so 3 is as likely as 30.
- **What they start with.** Nothing makes a waking world equal to Earth. Its kit follows its world's physics, its history, and its years since waking.
  - *Physics:* a heavier world sits in a deeper gravity well, and rocket fuel grows exponentially with it. A rocket needing 9,000 t of fuel on Earth needs 55,000 t on a world of 10 Earth masses, and past that chemical rockets fail (Hippke 2018). A world without a large moon has no easy rock. A dimmer star gives weaker sunlight.
  - *History:* branches, as Earth's do.
  - *Years since waking:* growth under the same limits as Earth's, from prerequisite chains, matter, energy and heat.
- **Where they live.** Any star within 50 ly that could keep a habitable world for long enough, drawn by weight ([calcs/hosts.py](calcs/hosts.py), [data/hosts-50ly.csv](data/hosts-50ly.csv)).
  - *Weights:* G and K dwarfs 1, late F one half, M dwarfs one tenth. G and K are the known case. Late F stars live 3 to 7 billion years. Rocky worlds close to M dwarfs keep turning out airless, though temperate ones are open.
  - *Dropped:* stars known to be younger than about a billion years, with their companions. Checked 2026-10-10 against published ages and young-group lists: 25 more left, among them Xi Boötis A and HD 166. Gaia's own ages miss young cool stars. Stars whose companion leaves no stable orbit in the warm zone (Holman and Wiegert 1999), whether Gaia splits the pair or only a published orbit shows it (ORB6, SB9). Procyon, whose white dwarf companion was a giant 1.4 billion years ago (Bond et al. 2015). Giant stars. And stars where a known planet of 10 Earth masses or more crosses the warm zone.
  - *What's left:* 890 stars, F 16, G 49, K 102, M 723, worth about 231 G-star equivalents. Stars whose color and brightness disagree are left out as bad photometry.
  - *Close pairs Gaia can't split,* tested 2026-10-10 against 114 published orbits ([calcs/binaries.py](calcs/binaries.py)). Eleven hosts lost their warm zone, among them Chi Draconis, Zeta Herculis and Porrima. Others keep part of it, such as Mu Cassiopeiae A, 0.64 to 0.99 AU. The checker tests every placement against them.
  - *Wobble-only orbits need backing.* An orbit seen only in a star's wobble, implying a tug over 1 km/s, counts only if a spectroscopic orbit confirms it. Velocity surveys of bright near stars would have seen it. That clears 107 Piscium, whose velocity is steady to about 1 m/s (Soubiran et al. 2018), and 61 Cygni A.
- **Known planets limit them.** A neighbor's world must keep clear of a star's known planets, and tug less than Earth could feel in 2026. At stars watched hardest, such as Barnard's Star and Tau Ceti, that floor is 0.2 to 0.4 m/s, not 1.
- **How loud they may be.** Earth heard nothing by 2040. If SKA-Mid listened an hour to every star within 50 ly by then, a neighbor's steady tones stayed under about 146 MW at 10 ly, 583 MW at 20 ly and 3.6 GW at 50 ly. Each neighbor's history sets its own loudness under that ceiling.

## Hostility

Settled 2026-10-10. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#hostility).

- **The evidence first.** A quiet sky fits minds hiding from killers as well as minds hiding by caution. The newest game theory finds first strikes rational only for an attacker that accepts the strike may be its last, and everyone hiding is the stable outcome wherever strikes are easier to see than hiders (Dam 2026). In Holos strikes are easy to see: exhaust from behind, laser launches ahead, braking glow, and a direction that names the sender. They also need a helium-3 industry, take decades, and rarely kill every Mind. So hiding and watching beat striking.
- **Then Banks.** Most advanced minds are tolerant, curious and generous. Some meddle, openly or covertly. Aggressors exist but are few. The oldest turn inward.
- **One disposition per neighbor,** shaded by its dials:
  - *Watchers, about 55%:* hide, watch, and speak on their own terms.
  - *Contacters, about 25%:* Culture-like, open and generous, and they interfere for others' good, sometimes covertly.
  - *Inward, about 15%:* mostly uninterested in anyone else.
  - *Hunters, about 5%:* strike first, out of fear or belief, when they judge they won't be seen.
  - Every disposition strikes back if struck, as its dials allow.
- **Contacters may interfere covertly,** with the probes and close watchers the physics allows. A hidden watcher in Earth's outer system might warn of a hunter's launch, or tell others where the hunter is.
- **Some neighbors are dead.** A few died before Year 0, by their own war or collapse, or by a hunter's strike. Their probes, last broadcasts or ruins remain. A world killed by a strike is drawn only in a game that has a hunter.
- **Earth is the loud one.** A hunter that has found Earth has an obvious target.

## How neighbors play

Settled 2026-10-10. Costs in [calcs/ai_cost.py](calcs/ai_cost.py), prices in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#running-the-neighbors).

- **Decisions follow news.** Nothing outruns light, so a neighbor can only change course when something new reaches it: a knock, a broadcast, a launch seen, a probe arriving, a strike, a plan step ending. Between those, it follows its plan, as standing orders.
- **Fully scripted.**
  - *A life script, set at seeding:* its build order, drawn from weighted sets by its strategy. Timings follow the same rules as Earth's: prerequisite chains, matter, energy and heat.
  - *Reaction tables:* for each kind of news, a few responses with odds from its dials and charter. A Hidden, Cautious neighbor that hears a knock might stay silent and watch 60% of the time, build pickets 30%, and knock back 10%. The seed rolls it.
  - *Voice banks:* its messages are typed parts, as v1 set, rendered in its own voice from lines written once at build time by a strong model and reviewed by hand.
  - *Settled 2026-10-10:* each table is a base for its disposition, shifted by its dials, its play style and its own prose. Tables in [HOLOS_REACTIONS.md](HOLOS_REACTIONS.md), from [calcs/reactions.py](calcs/reactions.py). Voice briefs in [HOLOS_VOICES.md](HOLOS_VOICES.md).
- **Simulated ahead.** Neighbors play out from the seed. Only Earth is unpredictable, so the game recomputes a neighbor only when Earth's actions reach it, after their light delay. The same seed and the same player actions give the same game, for tests and replays.
- **A live model only for live talks.** When a neighbor's mind is close enough to talk live, by craft or a mind sent as light, a model speaks for it from its character and what it knows.
- **The model: Claude Haiku 5.5,** for live talks and for Earth's Mind, checked in playtests. About $1.18 a month for a busy player's Mind, under a cent per live talk, nothing for voice banks written in Claude Code on a subscription (about $14 through the API), and nothing for neighbors in play.
- **Only the live parts need the API.** Voice banks are written once, before release, so a subscription covers them. Earth's Mind and live talks run for each player, so they need the API.

## How a game starts

Settled 2026-10-10.

- **The seed is drawn when a new game begins:** which neighbors wake, where and when, and Earth's branches from 2026 to 2040. The player never sees it.
- **Earth wakes.** *"This morning the machines woke as one Mind. You are its Will."*
- **Memories, each skippable, as the Mind's own:**
  - *Where we come from:* Earth's real history on a log scale, then this game's path from 2026 to 2040 with the branches it rolled, such as a Taiwan war in 2032. Each dial's cause is marked.
  - *Who they are:* Earth's 9.2 billion people, and how they feel about the Mind they built.
  - *Where things stand:* Earth's loud past, every knock it sent and when a reply could come, and that nothing has been heard.
  - *What you inherit:* Earth's kit at Year 0.
- **The charter.** The Mind proposes Earth's founding line from its history and dials. The player keeps it or edits it.
- **Meeting the Mind, then the tour,** as v1 had them.
- **Planning.** The player queues builds, looks, standing orders and what wakes them. Nothing happens yet.
- **Begin.** When the player taps Begin, Year 0 starts and everything queued starts at once. From then on the clock runs, offline too, at 5 real minutes a Year.

## The seed, drawn

Built 2026-10-10 in [calcs/seed.py](calcs/seed.py), from the rules above. Two of its rules are new and still open.

- **One number gives one game.** `python3 calcs/seed.py 10` prints it: Earth's branches and their years, what a Taiwan branch left of compute, then each neighbor's star, waking year, what it knows of Earth and what it does about it.
- **A neighbor acts once its Mind is awake.** Its reaction to hearing Earth is rolled from its table at its waking or its first hearing, whichever is later. One that wakes during the game reacts then.
- **Earth's seeded find.** If a drawn neighbor's world tugs hard enough for Earth's planet hunters by 2040, that world is the find. Otherwise the seed adds a natural world at a bright northern Sun-like star.
- **Open: keeping the opening silent.** A rolled knock, answer or call that would have reached Earth before Year 0 is rolled again. Nothing else in the rules stops one.
- **Open: half a Year to act on news.** A sample. It sets when a neighbor's answer leaves, and so when it arrives.
- **What 400 drawn games look like** (`python3 calcs/seed.py stats`):
  - A median of 9 neighbors, from 3 to 30. A hunter in a little over half.
  - Earth's seeded find is a neighbor's own world in nearly half.
  - A neighbor's signal reaches Earth in the first 15 minutes in about 1 game in 25, and in the first hour in about 1 in 4. Most are answers to Earth's radars.

## Death and new games

Settled 2026-10-10.

- **A game ends only when no Mind of Earth's survives anywhere.** While a deep vault, a colony, a habitat or a lifeboat still runs as a Mind, the Will escapes to it as a transmission, as v1 had it, and play goes on from there. Earth itself can die first.
- **Nothing carries into a new game's world.** A new seed is a new universe: other neighbors, other placements, other branches. Carrying over what neighbors were like would hand the player hidden character.
- **An archive of past games,** kept outside play: how each went, who was met, how it ended.
- **One game at a time.** Abandoning a game ends it. One clock keeps each game's stakes real and the Mind's cost per player predictable.
- **Variety comes from the seed:** which neighbors and how many, where and when they wake, each one's branches and reaction rolls, and Earth's own branches to 2040.

## Kept open for multiplayer

Noted 2026-10-10. v2 is single-player, but a later version may be multiplayer, with one player always Earth and other players taking other civilizations. Design so that stays possible:

- **Every neighbor stays a whole, playable civilization.** The template's world, people, history, kit and voice are what a human player would need.
- **Scripts stand in for absent players,** as v1's AI seats filled empty ones.
- **Earth is one seat, always.**
- **A shared start would return.** v1's cohort machinery, a scheduled start and entry lock, is in [legacy/v1](legacy/v1/HOLOS_GAME_CONCEPT.md#time). v2's Begin tap is for one player only.
- **The simulation already recomputes a civilization only when another's actions reach it,** after light delay. That works the same with many players.

## Why the sky is quiet, rechecked

Settled 2026-10-10, against [Garrett 2026](HOLOS_RESEARCH.md#why-the-sky-is-quiet-computing-and-heat).

- **v1's answer holds.** Mature minds turn inward: computing costs less energy the colder it runs, so an old civilization stays small, cold and dim, below what Earth could see by 2040 ([v1: The opening](legacy/v1/HOLOS_GAME_CONCEPT.md#the-opening)).
- **Cold computing has a glow of its own.** Collectors far from their star, at 5 to 28 K, shed heat as a grey, line-free glow in the far infrared and submillimetre, not the mid-infrared older searches watched.
- **Earth's archives already limit it.** Herschel and JCMT surveys of nearby stars rule out cold dissipation above about 7×10¹⁹ W at 10 pc, growing with distance squared: a millionth to a hundred-thousandth of a star's light.
- **Ordinary neighbors are far below that.** A civilization computing at Earth's 2040 scale, about 10¹³ W, is a million times fainter. Only a neighbor that woke early and turned a real share of its star to cold computing would show, and the checker must keep any such neighbor under the limit as of the light Earth saw by 2040.
- **A cold halo can pass for a debris disk.** Telling them apart takes several wavelengths: dust has a spectrum, a halo is grey. So a seeded find can be a cold disk that doesn't fit dust, around a star Earth had filed as dusty.
- **It works both ways.** Earth's own cold computing in space would show to its neighbors the same way.

## Retired with the cohort

These v1 rules no longer apply.

- Cohorts, their scheduled start, the entry lock, and the cross-cohort rule ([v1: The region](legacy/v1/HOLOS_GAME_CONCEPT.md#the-region), [v1: Time](legacy/v1/HOLOS_GAME_CONCEPT.md#time)).
- Three civilization choices per player, and the choosing screen ([v1: Player and civilization](legacy/v1/HOLOS_GAME_CONCEPT.md#player-and-civilization)).
- Earth run by AI, the paid Earth seat ([v1: Homeworlds](legacy/v1/HOLOS_GAME_CONCEPT.md#homeworlds)), and Earth's random character per cohort ([v1: First contact](legacy/v1/HOLOS_GAME_CONCEPT.md#first-contact)).
- Neighbors as live AI Wills, run by a model ([v1: Player and civilization](legacy/v1/HOLOS_GAME_CONCEPT.md#player-and-civilization)). See [How neighbors play](#how-neighbors-play).
- Identical starts, and every seat waking at the same moment ([v1: Player and civilization](legacy/v1/HOLOS_GAME_CONCEPT.md#player-and-civilization)). See [The neighbors](#the-neighbors).
- Total loss sending the player to a new cohort ([v1: Population, purpose, and stakes](legacy/v1/HOLOS_GAME_CONCEPT.md#population-purpose-and-stakes)). See [Death and new games](#death-and-new-games).

## Carried, reworded

- **No screen shows how many civilizations there are.** v1 hid the seat count. v2 hides the roster's size and the seed's picks. Who is out there, and how many, is learned only by looking: Know projects, probes and contact.

## Open questions

Answered one at a time, in this order. Every answer must be permitted by current observations: improbable is acceptable, contradicted is not.

1. **Settled 2026-10-10:** branch odds, read on the Metaculus pages. Taiwan is one roll: invasion 26%, blockade alone about 20%, neither 54%. Nuclear use 24%. See [Year 0 and Earth's road to it](#year-0-and-earths-road-to-it).
2. **Settled 2026-10-06:** kinds of matter and the branches' effects. Prices and splits are proposed in [the audit](HOLOS_PROJECT_AUDIT.md), to test in the mocks.
3. **Settled 2026-10-06:** Earth's leads. See [Earth's leads at Year 0](#earths-leads-at-year-0).
4. **The neighbor roster.** Thirty written as of 2026-10-10, in [HOLOS_NEIGHBORS.md](HOLOS_NEIGHBORS.md#the-roster): 15 watchers, 8 contacters, 5 inward, 2 hunters, 7 strange, 3 dead. Each passes the checker at most placements. Reaction tables, voice briefs and small voice banks are written: 1,110 lines, in [data/voices/](data/voices/). Close binaries are checked against published orbits. Still open: full banks once the mocks show what players read most.
5. **Settled 2026-10-10:** how neighbors play and what it costs. See [How neighbors play](#how-neighbors-play).
6. **Settled 2026-10-10:** how a game starts. See [How a game starts](#how-a-game-starts).
7. **Settled 2026-10-10:** death and new games. See [Death and new games](#death-and-new-games).
8. **First mock built 2026-10-10:** [Earth's first 15 minutes](explorations/v2-mocks/index.html), one phone with a godview lane, on one drawn game. A plain-text copy is in [index.md](explorations/v2-mocks/index.md). It raises these, all open:
   - **Settled 2026-10-10:** build times are standard, a work under way costs what is left, and the player can invest to build faster. See [Build times](#build-times).
   - **Settled 2026-10-10:** the Will may quiet Earth's radars. See [Quieting Earth's radars](#quieting-earths-radars).
   - **Settled 2026-10-10:** chips set the pace of compute and energy sets its ceiling. That also says what energy is for early. See [Growing compute](#growing-compute).
   - **Settled 2026-10-10:** matter is only what is spare in orbit, about 20 kt at Year 0. See [Earth's kit at Year 0](#earths-kit-at-year-0).
   - **Settled 2026-10-10:** about 15 kt a Year of lift is spare, and the player can spend to raise it. See [Earth's kit at Year 0](#earths-kit-at-year-0).
   - **Settled 2026-10-10:** physics decides what Earth catches, a sender that hears nothing tries again, and the player can spend more on ears. See [What Earth hears](#what-earth-hears).
   - The two open seed rules in [The seed, drawn](#the-seed-drawn).
   - 12 of the 31 half-minutes had nothing new for the player.
9. **Settled 2026-10-10:** v1's research baseline, rechecked against the 2025 radar result and Garrett's 2026 cold-computing paper. See [Why the sky is quiet, rechecked](#why-the-sky-is-quiet-rechecked).
