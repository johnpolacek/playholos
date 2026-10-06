# Holos · Game Concept

Last updated: October 6, 2026.

## Status

This is v2, begun October 6, 2026: a single-player game on Earth. v1, the multiplayer cohort design, is frozen in [legacy/v1](legacy/v1/README.md). Where v2 says nothing, v1's rules still hold. Where they disagree, v2 wins.

v2 grows one question at a time, and each answer is dated. Later user clarifications take precedence. There are no v2 mocks yet. v1's mocks show v1.

**Evidence first (2026-10-06).** Everything starts from real data and published research, the most current included. Only then comes hard-science speculation, from the best evidence we have now. Preliminary results are marked as such, with what would change if the full paper differs. Every source goes into [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md), with what it found and where the design uses it.

## Core premise

Holos is a single-player, hard science fiction browser game. You are the Will of Earth's Mind, on the morning Earth's machines wake as one, and you guide what Earth becomes.

You study nearby stars, build, listen, and send probes and messages. Nothing travels faster than light. Distant observations show history, and messages can take years to arrive.

Others woke in the same century. Every other civilization is seeded: written by hand, placed by the game, and run by AI. You don't know who they are, how many there are, or where. Finding them is the game, and so is surviving them.

The central challenge is deciding how to explore, grow, and preserve Earth when distance makes knowledge uncertain and every commitment takes time.

Iain M. Banks's Culture books remain an inspiration. This does not authorize departures from hard science ([v1: Hard science](legacy/v1/HOLOS_GAME_CONCEPT.md#hard-science)).

## Settled 2026-10-06

- **Single player, on Earth.** The player is Earth's Will. There are no cohorts and no other players. This answers v1's first objection to Earth as a home: only one player could have it.
- **Every other civilization is seeded and run by AI.** They are real superintelligences in the fiction, each with its own AI Will, as v1 set.
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
- **Sample odds, until the radar paper is out:** a listening neighbor, near or far, about 9 in 10. An ordinary one, about 1 in 2. An inward or growth-first one, about 1 in 5. Catching an aimed message, under 1 in 100. If the full paper needs long stares for airport radar, the ordinary and inward odds fall.
- **What a long listen reveals.** The radars' pitch shifts with Earth's turning and its orbit, so a listener recovers Earth's day, its orbit, and where it is (Loeb and Zaldarriaga 2007). Under v1's aiming rule, that is enough to aim a strike. A neighbor that heard Earth may start the game with Earth already mapped.
- **Earth is the late one.** Every neighbor's loud century ended long before Year 0. Earth's radars still sweep at Year 0, so Earth is the likeliest civilization in the region to have been heard.
- **The Mind lays out Earth's exposure at waking.** The radar years, every aimed message with its target and arrival, which stars could have heard, and what changed between 2026 and Year 0. It never says who did hear: no one at Year 0 knows that.
- **The seed doesn't favor stars Earth messaged.** A neighbor lands at a messaged star only by chance.
- **Replies to Earth's knocks could arrive during the game.** Each message sets the earliest date a reply could reach Earth: the light-time there and back ([calcs/knocks.py](calcs/knocks.py)).
  - Already passed in silence: Altair (2017), Teegarden's Star (2034.9), TZ Arietis (2039.1).
  - In the first hour: Luyten's Star at Year 2.5 and 3.1, 12 and 15 real minutes in. Gliese 526 at Year 8.7. Gliese 581 at Year 9.4 and 10.3.
  - Later: Gliese 49 at Year 27.5, Kappa¹ Ceti at 29.5, Gliese 208 at 37.5, 55 Cancri and HD 10307 at 45.5, 47 Ursae Majoris at 53.7.
  - Earth's 2003 knock reaches Gliese 208 half a Year after Year 0.
  - A window almost always passes empty: catching a knock is under 1 in 100. The Mind marks each one, as v1's silence rules say.

## Year 0 and Earth's road to it

Settled 2026-10-06.

- **Year 0 is 2040.** Forecasters put general AI near January 2031, within 2028 to 2037 (Metaculus). AI researchers give it even odds by 2042 (2024 expert survey). 2040 sits between: Earth's machines have been general for some years, and this morning they wake as one Mind.
- **One Mind is the game's second premise.** In the most probable 2040, Earth has several rival AIs, not one. The game assumes they wake as one Mind, so the Will has one Mind to live in. Improbable, not contradicted. The first premise is many neighbors waking in the same century ([v1: Hard science](legacy/v1/HOLOS_GAME_CONCEPT.md#hard-science)).
- **Earth's history is real to 2026, then the most probable path to 2040.** Each strand follows its best current forecast. Where forecasts split, the seed picks a branch, weighted by its odds. Every branch must leave the opening silent: nothing heard from any neighbor.
- **The backbone, the same in every game:**
  - *People:* about 9.2 billion (UN, 2024).
  - *Climate:* the long-term average passes 1.5°C around 2030. Single years already have (WMO).
  - *Energy:* about 22 to 26 TW, up from 19 TW in 2024, at 1 to 2% a year. Solar and wind carry the growth. Fusion plants are being built, but forecasters put the first 100 MW plant near 2042, so most games have none on the grid at Year 0.
  - *Compute:* about 10²⁵ to 10²⁶ operations a second, up from about 3×10²² in 2026. Power and chip supply set the pace.
  - *Space:* fully reusable heavy lift, near 40 kt a year to orbit. Crewed Moon landings from 2028 (US) and about 2030 (China), and south-pole stations planned for the mid-2030s, likely late. No one on Mars: forecasts put the first landing near 2045.
  - *Probes:* the Voyagers fall silent in the 2030s, Voyager 1 near 220 AU by 2040. New Horizons is near 100 AU. Interstellar Probe may be on its way, if it launches in its 2036 to 2042 window.
  - *Instruments:* today's, plus PLATO (late 2026), Roman, the ELT (science from 2030) and the SKA (from 2029 to 2031). The Habitable Worlds Observatory is still being built. Earth can feel nearby worlds by their tug, but can't read any neighbor's air.
  - *Radars:* fewer airport radars as ADS-B spreads, but primary and military radars still sweep. Earth is loud at Year 0.
  - *Listening:* nothing heard to 2040. This binds the neighbors: each one's emissions must stay below what Earth's instruments to 2040 could catch.
- **Earth's dials: a fixed base from real history, shifted by the seed's branches.** Real history sets where each dial starts, the same every game. Each probable branch from 2026 to 2040 nudges a dial.
- **Branches can change Earth's kit, by their real effects.** A Taiwan war that cuts chip supply means Earth wakes with less compute. v1 held that history explains character, never capacity, to keep players equal. With one player, that reason is gone for Earth.
- **The branches, odds to verify:**
  - *A Taiwan war before 2035,* about 3 in 10. Nudges Hidden. Taiwan makes about 92% of the most advanced logic chips, and a new fab takes 3 to 4 Years, so Earth wakes with about half its compute: a fifth to all of it, depending on how fast fabs come back ([calcs/branches.py](calcs/branches.py)).
  - *A nuclear weapon used in war before 2035,* about 1 in 4. Nudges Cautious. Limited use leaves the kit as it is. A full exchange is far rarer and is not a branch.
  - *People sent to Mars before 2036,* about 15%. Nudges Expand. A small crewed outpost at Year 0, a few ships' cargo, about 1 kt of metal.
  - *Fusion on the grid by 2040,* a bit under even. No dial. The first plants are too small to change Earth's energy, but the fusion build-out is open from Year 0.
  - Each branch is rolled on its own.

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
- **Matter in orbit:** about 250 kt, plus 40 kt a year from reusable heavy lift.
- **Instruments and probes:** as in the backbone above.
- **The sky watch is a drift scan.** Like CHORD, finished in 2028: each northern direction passes through it for about 10 minutes a day. v1's always-on watch of the whole sky becomes a project: dense aperture arrays on two continents ([the audit](HOLOS_PROJECT_AUDIT.md#calculations)).
- **What moves with the smaller grid.** Compute takes about 1% of energy, not v1's 10%, so even more energy sits idle early. A ground data center's +25% compute draws about 0.25% of energy, not 3%. The industry cap at 100 GJ a tonne falls to about 7.5 Gt a year (v1: 30). Star lifting needs about 200,000 times the grid (v1: 50,000). A Sun-like star's whole output is about 16 trillion times it (v1: four trillion).
- **Matter is real mass in space (2026-10-06).** It is what sits in orbit, on the Moon or in the belt, counted in tonnes. Ground builds draw on Earth's own industry, about 106 Gt of materials a year, and spend no matter. Each project's mass comes from physics or a real design. v1's matter was a pacing currency that grew tenfold per tier. With real masses, most instruments and probes become cheap in matter, and build time, compute shares, lift and propellant pace them. Compute shares already cap how much runs at once.
- **Four kinds of matter (2026-10-06).** Each comes from its own place and gates its own works.
  - *Metal:* structure, machines, film. From the belt, or lifted from Earth as finished goods.
  - *Rock:* shielding, sand and anything built on the Moon from its soil. From the Moon, by mass driver.
  - *Ice:* water, propellant and deuterium. From belt ice, or lifted from Earth's oceans.
  - *Helium-3:* fast fusion fuel. Earth has almost none. From Uranus's air, by a harvest.
  - Earth's lift carries any kind, 40 kt a year in all, mostly as metal. The 250 kt in orbit at Year 0 is metal.
  - The [audit](HOLOS_PROJECT_AUDIT.md#kinds-of-matter) says how each project's mass splits among them.
- **Project prices are in [HOLOS_PROJECT_AUDIT.md](HOLOS_PROJECT_AUDIT.md)** (open question 2).

## Earth's leads at Year 0

Settled 2026-10-06. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#earths-leads-as-of-october-2026).

- **Earth's leads are its real ones.** Sol's own published oddities, seen with published values: no projection from another seat. To 2040 they follow the most probable path, and what Earth's instruments would find by then, it found.
- **Three kinds of lead.**
  - *Open questions 2040's instruments can't settle,* such as a warm world whose air waits for the Habitable Worlds Observatory.
  - *Seeded finds from 2026 to 2040.* Terra Hunting, the ELT, Gaia and PLATO find what the seed put within their reach. A find is a neighbor's world only if the seed put a neighbor there. Otherwise it is a natural world.
  - *Things that change,* such as Fomalhaut's collision clouds or a visitor from another star.
- **The opening: three leads and a deadline.**
  - *82 Eridani d,* 19.7 ly. At least 5 Earth masses on a stretched orbit through a Sun-like star's warm zone. Its air is unread.
  - *One seeded find,* such as a world Terra Hunting felt by 2036.
  - *Fomalhaut's new cloud,* 25 ly. It drifts and fades, so the first look makes it stranger, as v1 required of one lead.
  - *The Luyten's Star reply window,* Year 2.5, 12 real minutes in.
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
  - *Dropped:* stars known to be younger than about a billion years, stars whose companion leaves no stable orbit in the warm zone (Holman and Wiegert 1999), and stars where a known planet of 10 Earth masses or more crosses the warm zone.
  - *What's left:* 930 stars, F 22, G 52, K 116, M 740, worth about 253 G-star equivalents. Stars whose color and brightness disagree are left out as bad photometry.
  - *Not yet tested:* close binaries Gaia can't split, such as Procyon, Chi Draconis and Zeta Herculis.
- **How loud they may be.** Earth heard nothing by 2040. If SKA-Mid listened an hour to every star within 50 ly by then, a neighbor's steady tones stayed under about 146 MW at 10 ly, 583 MW at 20 ly and 3.6 GW at 50 ly. Each neighbor's history sets its own loudness under that ceiling.

## Retired with the cohort

These v1 rules no longer apply.

- Cohorts, their scheduled start, the entry lock, and the cross-cohort rule ([v1: The region](legacy/v1/HOLOS_GAME_CONCEPT.md#the-region), [v1: Time](legacy/v1/HOLOS_GAME_CONCEPT.md#time)).
- Three civilization choices per player, and the choosing screen ([v1: Player and civilization](legacy/v1/HOLOS_GAME_CONCEPT.md#player-and-civilization)).
- Earth run by AI, the paid Earth seat ([v1: Homeworlds](legacy/v1/HOLOS_GAME_CONCEPT.md#homeworlds)), and Earth's random character per cohort ([v1: First contact](legacy/v1/HOLOS_GAME_CONCEPT.md#first-contact)).
- Identical starts, and every seat waking at the same moment ([v1: Player and civilization](legacy/v1/HOLOS_GAME_CONCEPT.md#player-and-civilization)). See [The neighbors](#the-neighbors).
- Total loss sending the player to a new cohort ([v1: Population, purpose, and stakes](legacy/v1/HOLOS_GAME_CONCEPT.md#population-purpose-and-stakes)). Total loss ends the game, and the next game has a new seed. What carries over is open question 7.

## Carried, reworded

- **No screen shows how many civilizations there are.** v1 hid the seat count. v2 hides the roster's size and the seed's picks. Who is out there, and how many, is learned only by looking: Know projects, probes and contact.

## Open questions

Answered one at a time, in this order. Every answer must be permitted by current observations: improbable is acceptable, contradicted is not.

1. **Branch odds.** Read the Metaculus pages for the Taiwan and nuclear odds. Search summaries disagree, and Metaculus blocks scripted reads.
2. **Settled 2026-10-06:** kinds of matter and the branches' effects. Prices and splits are proposed in [the audit](HOLOS_PROJECT_AUDIT.md), to test in the mocks.
3. **Settled 2026-10-06:** Earth's leads. See [Earth's leads at Year 0](#earths-leads-at-year-0).
4. **The neighbor roster.** Who is written, in [HOLOS_NEIGHBORS.md](HOLOS_NEIGHBORS.md), and how each one's history sets its world, kit and loudness. The template is drafted. Hosts, timing, count and the loudness ceiling are settled in [The neighbors](#the-neighbors). Close binaries Gaia can't split still need checking against published orbits.
5. **Neighbors' behavior and cost.** What fixed rules decide and what the model decides. What runs while the player is away.
6. **How a game starts.** No entry lock. Earth's real history, its people, and meeting the Mind.
7. **Death and new games.** What carries over, and where variety comes from.
8. **First mock: Earth's first 15 minutes.** One phone, with a godview lane for the neighbors.
9. **Recheck v1's research baseline.** Newer work bears on it: the radar preprint above, and an August 2026 preprint on the waste heat of cold computing (v1's "Why the sky is quiet").
