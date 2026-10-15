# Holos · Game Concept

Last updated: October 6, 2026.

## Status

This is v2, begun October 6, 2026: a single-player game on Earth. v1, the multiplayer cohort design, is frozen in [legacy/v1](legacy/v1/README.md). Where v2 says nothing, v1's rules still hold. Where they disagree, v2 wins.

v2 grows one question at a time, and each answer is dated. Later user clarifications take precedence. The v2 mocks are [Earth's first 15 minutes](explorations/v2-mocks/index.html) and [the first hour away](explorations/v2-mocks/index.html#hour), on one page built by `python3 explorations/v2-mocks/build.py`. v1's mocks show v1.

**Evidence first (2026-10-06).** Everything starts from real data and published research, the most current included. Only then comes hard-science speculation, from the best evidence we have now. Preliminary results are marked as such, with what would change if the full paper differs. Every source goes into [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md), with what it found and where the design uses it.

**Nothing artificial limits the Will (2026-10-14).** The Will may do anything physics allows, at its real price. Holos is a test of the Fermi paradox: if expansion is possible, why is the sky quiet? So a limit on what Earth can do must come from physics or cost, never from a game rule.

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
  - *Aimed messages.* About twenty, from 1983 on, each lasting from a quarter of an hour to a few hours. Targets within 50 ly: Altair (1983), Gliese 49, Gliese 208, 55 Cancri, HD 10307 and 47 Ursae Majoris (Teen Age Message, 2001, and Cosmic Call 2, 2003), Gliese 581 (2008 and 2009), Teegarden's Star, TZ Arietis and Kappa¹ Ceti (2009), Gliese 526 (2013) and Luyten's Star (2017). To hear one, a listener had to be watching Sol in those hours, at that frequency.
  - *Earth crossing the Sun.* About 75 stars within 100 ly sit where Earth transits the Sun and Earth's radio has already reached (Kaltenegger and Faherty 2021). A transit shows a rocky world in the warm zone, not who lives there.
- **Physics lets every neighbor hear Earth. Whether one did depends on whether, and how long, it looked.** Earth's radar signal has been spreading since the 1950s and is still being sent, so it crossed every neighbor while that neighbor had instruments like today's. Odds come from distance and character: a near, curious neighbor stares at Sol for days, as Project Ozma stared at Tau Ceti and Epsilon Eridani in 1960. A far or inward one gives Sol a survey glance, or nothing.
- **Sample odds, until the radar paper is out:** a listening neighbor, near or far, about 9 in 10. An ordinary one, about 1 in 2. An inward or growth-first one, about 1 in 5. Catching an aimed message: certain for an awake Mind, if the knock is above its watch's floor. Before its Mind wakes, under 1 in 100, unless it was already keeping a beam on Sol. See [Stars Earth knocked on](#stars-earth-knocked-on). If the full paper needs long stares for airport radar, the ordinary and inward odds fall.
- **What a long listen reveals.** The radars' pitch shifts with Earth's turning and its orbit, so a listener recovers Earth's day, its orbit, and where it is (Loeb and Zaldarriaga 2007). Under v1's aiming rule, that is enough to aim a strike. A neighbor that heard Earth may start the game with Earth already mapped.
- **Earth is the late one.** Every neighbor's loud century ended long before Year 0. Earth's radars still sweep at Year 0, so Earth is the likeliest civilization in the region to have been heard.
- **The Mind lays out Earth's exposure at waking.** The radar years, every aimed message with its target and arrival, which stars could have heard, and what changed between 2026 and Year 0. It never says who did hear: no one at Year 0 knows that.
- **Replies to Earth's knocks could arrive during the game.** Each message sets the earliest date a reply could reach Earth: the light-time there and back ([calcs/knocks.py](calcs/knocks.py)).
  - Already passed in silence: Altair (2017.1), Teegarden's Star (2034.9), TZ Arietis (2039.0).
  - In the first hour: Luyten's Star at Year 2.3 and 2.9, 11 and 14 real minutes in. Gliese 526 at Year 9.0. Gliese 581 at Year 9.9 and 10.8.
  - Later: Gliese 49 at Year 27.2, Kappa¹ Ceti at 30.4, Gliese 208 at 38.0, 55 Cancri at 45.6, HD 10307 at 46.6, 47 Ursae Majoris at 52.3.
  - Distances are Gaia DR3's, or Hipparcos's for Altair and HD 10307.
  - Six sends are still on the way at Year 0, to five stars. Kappa¹ Ceti's arrives at Year 0.1 and Gliese 208's at 0.8. 55 Cancri's arrives at Year 4.6, HD 10307's at 5.1, and 47 Ursae Majoris's at 7.0 and 8.8. Corrected 2026-10-10: an earlier count gave two.
  - Corrected 2026-10-13: the 2012 reply to the Wow! signal is left out. Arecibo's transmitter overheated soon after it began, and no one recalls which of its three stars it was pointed at. So 55 Cancri has one send on the way, not two.
  - Most windows pass empty. The Mind marks each one, as v1's silence rules say.

## Stars Earth knocked on

Settled 2026-10-10. Numbers in [calcs/neighbors.py](calcs/neighbors.py).

- **The seed sometimes puts a neighbor where Earth knocked.** In one game in five, if a drawn neighbor can live at a messaged star, the seed places it there.
  - By chance alone, about one game in 10 has someone at a messaged star. With the nudge, about 3 in 10, and a knock is caught in about 1 in 5. Measured on 1,000 drawn games ([calcs/seed.py](calcs/seed.py)), 2026-10-14, after HD 10307 joined. Before, 1 in 27, 1 in 5 and 1 in 7. It was 1 in 10 before awake Minds caught every knock. Before Gliese 208 left the host list it was one in 10 and 3 in 10.
  - It is a game choice, not physics. It contradicts nothing: Earth chose those stars because they might have planets.
- **Seven messaged stars can host a neighbor.** Luyten's Star, TZ Arietis, Gliese 526, Gliese 581, Gliese 49, 55 Cancri B, and HD 10307.
  - 55 Cancri A has a giant crossing its warm zone. Its companion B sat in the same beam.
  - Altair, 47 Ursae Majoris, Kappa¹ Ceti and Teegarden's Star can't host one.
  - *HD 10307 can, from 2026-10-14.* It was thought missing from Gaia's census. Gaia lists it, at a parallax its unseen companion spoils: 48 ly, against Hipparcos's 41.6. The census now takes Hipparcos's, as the knock list did.
  - Gliese 208 can't either, from 2026-10-12. It turns every 12.3 days, which dates it near half a billion years (Engle 2024, Grandjean et al. 2021). Earth's 2003 message still arrives there at Year 0.8. No one is home.
  - Six are M dwarfs, where 9 of the 30 neighbors can live. HD 10307 is a Sun-like star, where 13 can.
- **Any knock above a world's floor is caught.** Revised 2026-10-14. Numbers in [calcs/neighbors.py](calcs/neighbors.py).
  - *Why.* Hearing faint things is costly: a hum, smog, everyday radio. Hearing a beam meant for you is not.
    - Earth builds an all-sky watch in 6 Years, for a hundredth of its thought. It hears a Cosmic Call-strength knock, 10¹² W for four hours, to about 390 ly.
  - *An awake Mind keeps such a watch.* It catches every knock above its floor: about 2×10¹⁰ W at 50 ly, for four hours.
    - Every one of Earth's real knocks clears that floor at its star. Lone Signal was hundreds of times weaker than Cosmic Call, but ran two months.
  - *A sender listens to every star it knocked, for good.* It hears every answer, however late.
    - A sender that hears nothing after one round trip takes the silence as news and acts on it. It does not stop listening.
  - *Before its Mind wakes, a people catches a knock only where it happens to listen.* Settled 2026-10-10, kept for peoples.
    - That means it heard Earth's radars first, and its arrays were running when the knock arrived.
    - Then a listener catches it about 3 times in 4, an ordinary one 1 in 2, an inward one 1 in 10. Otherwise, under 1 in 100.
    - These odds are invented, like the radar odds, until better evidence.
  - A neighbor that died before the knock arrived catches nothing.
  - *One real limit:* a watch hears only its band. A sender knows the frequency it used, so answers to its own knocks are always in band.
  - Set aside: only senders hearing answers for certain, and the 2026-10-10 odds for everyone.
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
  - About 70% of living neighbors heard Earth before Year 0. For them nothing changes.
  - If the last sweep leaves by Year 3, about 1 neighbor in 9 wakes too late to hear it. By Year 30, about 1 in 23.
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
- **Year 0's sky watch misses most of them.** It sees each direction north of −20° for ten minutes a day. That is 63% of host stars by weight, and a four-hour knock overlaps its pass about one time in six.
  - Of the signals that reach Earth in the first hour, it catches about 1 in 5.
  - About 4 in 10 come from the southern sky it never sees. About 1 in 7 are too faint for it.
  - The all-sky watch would catch about 9 in 10.
- **A sender that hears nothing tries again.** A knock is sent twice, about a Year apart, as Earth's own were. If its reply window then passes in silence, that is news to the sender, and it rolls its table ([HOLOS_REACTIONS.md](HOLOS_REACTIONS.md)): a contacter most often knocks again. So a missed knock is delayed, not lost.
- **The player can spend more on ears.**
  - *Hold the radio array on one star:* it hears whatever comes from there, for a share of compute.
  - *The all-sky watch:* every direction at every hour. A ground build at two sites: 6 Years, a hundredth of compute. Real arrays took 2 to 8 years. Priced 2026-10-11.
  - *The deep flash watch:* knocks sent as laser flashes.
  - *A larger watch hears fainter:* four times the collecting area reaches twice as far.
  - *The deep-field receiver, then the far-side array:* a world's everyday radio.
    - *Checked 2026-10-13:* at the roster's tones the deep-field receiver hears about 1 living neighbor in 460. The far-side array is the one that hears them. See [How Earth learns](#how-earth-learns).
- **Knocks before Year 0 happened, and Earth missed them.** Settled 2026-10-10. A neighbor awake before Earth may already have knocked.
  - The seed rolls Earth's real odds of catching each. Before the sky watch of 2028, Earth's searches gave a star minutes in decades: about 1 knock in 100 caught.
  - Only a knock Earth would have caught is rolled again, since Earth heard nothing by 2040. A steady call always would have been caught.
  - In about 1 game in 5, at least one knock reached Earth unheard before Year 0.
  - The sender, unanswered, takes the silence as news. Some try again, and some of those land during the game.
- **The Mind reads a knock at once, in three layers.** Settled 2026-10-13. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#hearing-technology-by-radio).
  - *What it proves.* Physics: it was aimed, when it left, and how early the sender had found us. v1's rule ([First contact](legacy/v1/HOLOS_GAME_CONCEPT.md#first-contact)).
  - *What it holds.* A knock is built to be read, and opens with a primer, as Earth's own did. The Mind gives its content in its own words for theirs.
  - *What it means.* A judgment, in words: a greeting meant as it reads, or bait. It can be wrong.
  - *Why at once.* The one blind test of a message built to be read ended in an accurate reading (Busch and Reddick 2011). A message built as a puzzle took 10 days to extract and a year to decode, and its meaning is still open (A Sign in Space).
  - *So the player chooses knowing what was said:* answer, listen, or stay silent.
  - *Later, as written exceptions:* a stranger neighbor's message may need a study before it yields.
  - Set aside: content as a study that lands later, and a Mind that never turns a knock into words.
- **An answer is composed as in v1, whole.** Settled 2026-10-13. v1's rule: [Communication and deception](legacy/v1/HOLOS_GAME_CONCEPT.md#communication-and-deception).
  - *The player writes what they mean in plain words.* The Mind composes it from typed parts, and the player approves before anything goes. Only typed parts travel.
  - *The parts:* a finding, a sighting, an archive, something of our culture, a request, a verdict. The neighbors' voice banks are written in the same parts.
  - *A lie is a forged part,* the same in form as a true one, marked for the sender alone.
  - *Earth's real rule agrees.* Since 1989 the astronomers' protocol has said no reply goes out until the world is consulted. In the game the Will is who is asked.
  - Set aside: a first answer limited to a name and a question, and v1's rule without lies.
- **The Mind can't report what it didn't hear.** A missed knock leaves no trace on Earth: nothing was pointed there, so no archive holds it. A search of old data for half-recorded knocks was considered and left out.
- **The Mind advises a listen at marked worlds. The player decides.** Settled 2026-10-14. Numbers from `calcs/signs.py`.
  - *When.* The sweep marks worlds, and the Mind says one line, unasked: a receiver would hear some of them better.
  - *Why it matters.* Held on one star, a deep-field receiver hears a knock about three times farther than the all-sky watch.
  - *In the mock's game.* Hael's knock at Year 19.9 comes from 49 ly. The watch hears it to 35 ly, a receiver to 117.
  - Begun when the Mind advised it, at Year 9.9, the receiver is done by Year 18. This player left it.
  - *The Mind never builds it on its own.* It advises freely and never acts on its own advice.
  - Set aside: listening at every marked world by default, and no prompt at all.
- **One receiver is split among the stars it holds.** Settled 2026-10-14. Numbers from `python3 calcs/signs.py receiver`.
  - *The player names the stars.* Each part has a share of the dishes, so each hears less far.
  - *Reach falls as the square root of the stars held.* A ten gigawatt knock lasting four hours:
    - One star: 117 ly. Four: 59. Eighteen: 28.
    - Past eleven stars it hears no farther than the all-sky watch, which hears every star at every hour.
  - *So the choice is which few to hold.* The Mind gives the reach for each choice.
  - *Why split, and not all at once.* The receiver is the full SKA-Mid, a dish array. Real dish arrays split into parts, and the SKA plans up to 16.
    - The beams a dish array forms at once must lie inside each dish's view: about a degree at 1.4 GHz. Marked worlds are scattered.
    - Arrays of fixed antennas can hold scattered stars at once (LOFAR), at low frequencies and sharing their bandwidth.
  - *Like every ground ear,* a part hears its star only while that star is above the horizon.
  - Set aside: one star at a time in an order, and every marked world at once at full reach.

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
- **Matter piles up in the first hour, and the Mind says what it is for.** Settled 2026-10-13. Masses are the audit's ([HOLOS_PROJECT_AUDIT.md](HOLOS_PROJECT_AUDIT.md)).
  - *Why it piles up.* Real instruments and probes weigh tonnes to a few kilotonnes. After one launch complex Earth lifts 55 kt a Year. By Year 12 about 500 kt sit unspent.
  - *What needs matter needs megatonnes.* Power from orbit, for a fifth more energy: about 10 Mt. The far-side array: about 1 Mt of lunar metal. A habitat ring: 10 Mt.
  - *Megatonnes can't come from Earth.* 10 Mt is 180 Years of lift. A mass driver on the Moon throws 600 kt a Year, by O'Neill's estimate, and belt mining brings 120.
  - *So the choice in the first hour is when to start that road:* mines, then a driver. The Mind lays it out and waits.
  - *The first 15 minutes do use matter.* Earth starts with 20 kt, and a vault or a launcher costs 10.
  - *Priced 2026-10-13:* belt mining and the mass driver keep v1's 20 and 24 Years, and the driver no longer waits for the belt. See [Build times](#build-times).
  - Set aside: hiding matter until a megatonne work is on offer, and shrinking Earth's lift so matter stays scarce.
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
- **The plateau stands.** Settled 2026-10-13. At the grid limit thought stops growing until energy does.
  - *Better chips don't dodge it.* Today's kind of chip can get about 200 times more efficient than 2023's, and no more (Ho, Erdil and Besiroglu 2023). At 28 to 40% a year that ceiling arrives between 2039 and 2044.
  - *So at Year 0 chips sit at or near their ceiling,* with a doubling left at most. That arithmetic is this project's.
  - *The ways on are slow by nature.* Ground solar: a fifth more in 10 Years. Power from orbit: about 10 Mt, from the Moon or the belt. Colder chips: the annex, a crumb.
  - *The Mind warns five Years ahead.* The choice is to keep buying thought at full pace, or to grow energy first.
  - *It is where the megatonne road pays.* See [Earth's kit at Year 0](#earths-kit-at-year-0).
  - Set aside: a new kind of chip as a project, which nothing read so far supports. And slower fabs, so the first hour never reaches the grid.
- **Thought buys speed, down to a floor physics sets.** Settled 2026-10-13. Numbers from `python3 calcs/early_game.py`. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#earth-to-year-0-forecasts).
  - *Why it was asked.* The third mock showed 99% of Earth's thought idle at the grid limit. A limit on something no one uses costs nothing.
  - *The rule.* Part of a build is planning, and part is physical work. Thought shrinks the first and never the second.
  - *The floor: two thirds of the standard time,* a sample. NASA science missions took 64 months from design to launch, against a plan of 50. Those with a launch window they could not miss took about 53, which the study calls a lower limit (Joumier, Freaner, Bitten and Emmons 2012).
  - *What that gives.* Half the thought costs a third more time. Four times the thought saves a quarter. Past ten times there is almost nothing more to gain.
  - *What thought never shortens.* Rock leaving the Moon, flight between stars, and light coming home.
  - *It adds to the method projects.* Factories and yards change how a thing is built. Thought plans the same build better.
  - Set aside: thought that buys knowing only, and thought as a gate that larger works must pass.
- **A work wants thought in scale with its real cost.** Settled 2026-10-13. Numbers from `python3 calcs/early_game.py`.
  - *Counted in flagships.* One flagship is the Habitable Worlds Observatory, about 11 billion dollars.
  - *Four works have a real price.* A 15 m mirror: 2 flagships, as LUVOIR-A costs 18 to 24 billion. The laser sail array: 0.7, as Starshot's beam director costs 8 billion. An SKA-class array: 0.2, as the SKA costs about 1.9 billion euros.
  - *One number ties the scale to the game.* The first telescope takes 0.15 of Year 0's thought, the mocks' own share. So Earth has thought for about 7 flagships at Year 0, and for about 577 at the grid limit.
  - *So thought is tight early and for megatonne works.* At Year 0 a second flagship is a real cost. At the limit every real-priced work can run at its floor.
  - *Megatonne works have no real price.* Samples: the launcher 10, belt mining 20, the mass driver 30, the foundry 30, a fifth of the far-side array 40, power from orbit 200.
  - *At the limit:* the works begun at Year 12 want 93 flagships and would each take 72% of their standard time. To push the mass driver alone to ten times its want takes half of all thought.
  - *Done 2026-10-14:* all three mocks are replayed at paced speed, from Year 0.
  - Set aside: thought in scale with a work's Years, and one amount for every work.
- **The first hour is paced too.** Settled 2026-10-14 with the split, applied 2026-10-14. Numbers from `python3 calcs/early_game.py`.
  - *One replay from Year 0.* Thought grows with each data center. Data centers are paced by the fabs, and observations by physics, so their thought is set aside.
  - *Paced, in the order begun:* the watches are built at Year 4.2, not 6. The telescope at 6.1, not 8.4. The vault at 9.1, not 11.6. The yard at 9.8, not 11.3.
  - *The launch complex stays at Year 3.7.* Behind the watches and the telescope in the line, it gets only its want.
  - *Wants of the first hour's works are samples:* the deep flash watch 0.1 flagship, the vault 1, the launch complex 0.3, the yard 0.7.
  - *Thought sits idle when the line is short.* About four tenths idle after the watches are built, and eight tenths at the grid limit, until the long works begin at Year 12.
- **Thought is split by an order the player sets.** Settled 2026-10-14. Numbers from `python3 calcs/early_game.py`.
  - *The line.* A new work joins the end. The player can move it. One decision, and no sliders.
  - *How the Mind fills it.* First each work gets its want, in order. Then each in turn is pushed to ten times its want.
    - This project's reading. So no work stops because another is first.
    - Ten times is where a work stops gaining: 70% of its time, against a floor of 67%.
  - *What is left over sits idle,* and the Mind says so. Power from orbit takes its want and no more, since rock arrives at its own pace.
  - *What the order changes, in the third mock's game.* In the order begun, the mirror and launcher are done at about Year 21.5, the sails launched at 27.7, power from orbit at 43.9.
  - Driver, belt and foundry first: the mirror waits until 25.5, the sails until 33.1, and power from orbit comes at 42.9.
  - *So the order moves small works by Years, and matter's road by about one.* Rock from the Moon sets that pace, not thought.
  - Set aside: an even split, which leaves the player nothing to decide. And a share for each work, retuned at every new one.
- **Faster than one a Year needs new fabs.** A chip fab project adds a second line: 3 Years, a tenth of compute, no matter. Priced 2026-10-11. A leading-edge fab takes 2 to 4 years, and one firm makes the tools that print the finest chips, about 90 a year. Two lines make compute grow 2.25 times a Year. The chip stock grew 3.4 times a year in 2026, so that pace has been seen.
  - *It only reaches the ceiling sooner.* Eleven data centers fit under the grid. One line fills them by Year 11, two by Year 7. A third line gains a third of a Year.
- **Only if the player chooses.** One at a time, or a standing order to keep them coming. Compute never grows on its own.
- **A Taiwan branch lowers where compute starts, not the pace.** Tested 2026-10-14 on a second game, seed 11: a blockade left 67% of compute.
  - *This project's reading:* thinking's draw on energy falls with the chips, so the grid caps the same height. A twelfth data center fits, and the limit comes a Year later, at Year 12.1.
  - *Builds run slower while thought is short.* The telescope is done at Year 6.5, not 6.1, and the vault at 9.4, not 9.1.
  - *The long roads barely move.* Rock from the Moon sets their pace, not thought.

## Build times

Settled 2026-10-10. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#earth-to-year-0-forecasts).

- **One standard time per project, from the science.** It is how long works of that kind take. A flagship space telescope takes about 18 Years: Hubble took 12 from first funding to launch, Webb 18 from its prime contract. The time is the same in every game. The seed doesn't roll it.
- **A real work under way at Year 0 costs what is left of it.** The Habitable Worlds Observatory has about 8 Years left: NASA aims it at the 2040s, and flagships slip. A second telescope of its class takes the full 18. The 8 is a sample.
- **The player can invest to build faster.** Other projects make building more efficient. Each speeds one kind of work. Priced 2026-10-11 in [calcs/early_game.py](calcs/early_game.py). Compute shares are samples.
  - *Factory-built works,* on the ground: 3 Years, a twentieth of compute, no matter. It takes a third off ground builds. Modular building cuts schedules by 20 to 50% (McKinsey 2019). Liberty ships took over six months each at first and thirty days by late 1943.
  - *An orbital yard:* 5 Years, a tenth of compute, 1 kt. It takes a quarter off builds in orbit, and works too large to launch whole become possible. The ISS took 13 years at the Shuttle's pace, and Tiangong 18 months. NASA's 2019 study found assembly in space workable, and the only way past 15 m mirrors. The speed-up itself is speculation: that study found costs about equal and gave no number for time saved, and no other study found does either.
- **A speed-up helps whatever is not yet built.** Settled 2026-10-11. That is later works, and the part left of works under way, by the same rule as a real work under way at Year 0.
  - The all-sky watch takes 6 Years. Begin it and the factory together: the factory is done at Year 3, the watch's last 3 Years become 2, and it is done at Year 5.
  - The deep-field receiver, 12 Years, is done at Year 9. The Habitable Worlds Observatory, 8 Years left, is done at Year 7.25 if the yard is begun at Year 0.
  - So starting a work at once is never worse than waiting for the speed-up. A design choice: real works pay something to change method midway.
- **The same pattern everywhere.** A standard pace from the science, and a project that raises it: chip fabs for compute, launch complexes for lift, factories and yards for building.
- **An inquiry's works, priced 2026-10-13.** Samples. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#travel-sails-and-lenses).
  - *A laser sail array:* 25 Years, on the ground, no matter. Starshot aimed at a first launch within a generation, and its own model puts the array at 8 billion dollars (Parkin 2018). v1 had 60 Years.
  - *Not under way at Year 0.* Starshot paused in 2024, so Earth starts it from nothing, unlike the telescope.
  - *A flyby probe:* 12 Years after the launcher, v1's time, in the range of flagship craft. *A sentinel probe:* 20, v1's.
  - *What an inquiry to the nearest star costs.* At standard pace, begun at Year 9.4: the array is done at Year 34, sails arrive at Year 56, and their word is home at Year 60.
    - *Paced by the line, 2026-10-14,* begun at Year 7: the array is done at Year 24.8, sails arrive at Year 46, and their word is home at Year 51. A probe's word is home at about Year 72.
  - *Flight and light set most of it.* 4.3 ly is 22 Years at a fifth of light speed, 36 at an eighth, and 4.3 more for word to come back.
- **The long roads, priced 2026-10-13.** Samples, each against the best real plan found. Numbers from `python3 calcs/early_game.py`. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#real-masses-behind-the-projects).
  - *A new telescope with a 15 m mirror:* 18 Years, the flagship standard, about 40 t. Its study aimed at a launch about 2039, from a 2019 report. It needs no assembly in space: that is the only way only past 15 m.
  - *A mass driver on the Moon:* 24 Years, v1's, and 1 kt, which Earth can lift. Then 600 kt of rock a Year. O'Neill's group gave that rate and no build time, so nothing real checks the 24.
  - *It no longer waits for belt mining.* v1 made it wait because it cost 4,000 kt. At 1 kt it can start in the first hour.
  - *An orbital foundry:* 30 Years, v1's, 1 kt. It turns thrown rock into works.
  - *Belt prospecting, then mining:* 6 and 20 Years, v1's. Then 120 kt a Year. Nothing like it has flown.
  - *A far-side array:* 30 Years, v1's, begun once the driver's mine exists. About 1 Mt of metal made in place. FarView plans 4 to 8 years for a fifth of the area, in far lighter antennas.
  - *Power from orbit:* about 10 Mt for a fifth more energy, so its pace is the pace rock arrives.
  - *The mock's game at standard pace, each begun when the Mind first offers it.* Replaced 2026-10-14 by the paced replay in [Growing compute](#growing-compute). The mirror: Year 23. Driver and foundry: Year 30. Belt mining: Year 32. Laser array: Year 34. Ten megatonnes in orbit: Year 45. Far-side array: Year 60.
  - *So the plateau lasts about 34 Years:* 2.8 hours of play, from the grid limit at Year 11 to power from orbit at about Year 45. Ground solar adds a fifth at Year 21.
  - *The whole far-side array arrives about when Varn wakes,* Year 57.6. Its first fifth arrives 24 Years sooner.
- **The far-side array grows in stages.** Settled 2026-10-13. Numbers from `python3 calcs/signs.py stats`.
  - *Five fifths, 6 Years each.* FarView's builders give 4 to 8 years for an array of about that area, and plan it as a core that grows outward.
  - *Each fifth hears farther.* Reach grows as the square root of the collecting area, as for Earth's other ears ([What Earth hears](#what-earth-hears)).
  - *What each stage hears within a Year,* of the living homes a first pass sees: 6 in 10 with one fifth, 7 with two, 8 with three, and 9 with all five.
  - *A 100 kW tone:* heard to 21 ly in a day by the first fifth, and to 47 by the whole.
  - *The decision it gives:* how much to build before listening, and where to point what is built.
  - *In the mock's game* the first fifth is done at Year 36 and hears Varn's everyday radio in 5 days, 21 Years before Varn wakes.
  - *Counted as Earth sees the neighbors at Year 9.* By Year 36 more have woken, and the shares will differ.
  - Set aside: whole or nothing, and leaving it open until a third mock.

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
  - *Every world Earth has felt,* such as one Terra Hunting felt by 2036. Settled 2026-10-13: all are on the list from Year 0. See [The seed, drawn](#the-seed-drawn).
  - *Fomalhaut's new cloud,* 25 ly. It drifts and fades, so the first observation makes it stranger, as v1 required of one lead.
  - *The Luyten's Star reply window,* Year 2.3, 11 real minutes in.
- **Four older puzzles are studied from Begin.** Added 2026-10-12, to keep the first session's rhythm. From 2026-10-13 they are studies, which the Mind runs on its own: see [How Earth learns](#how-earth-learns). Each is a real oddity as of 2026. What a study finds in 2040 is the mock's sample.
  - *Gliese 12 b,* 39.7 ly. A world Earth's size, 12.8 days around a quiet red star. Its air is unread.
  - *Barnard's Star,* 6 ly. Four worlds smaller than Earth, confirmed in 2025. Nothing over 0.57 Earths in its warm zone then.
  - *Tau Ceti,* 11.9 ly. Four faint signals claimed in 2017 and never confirmed.
  - *Epsilon Indi's giant,* 11.9 ly. Imaged in 2023, heavier and farther out than its star's sway had said.
  - Why a study can find something: the Mind reads old records better than their first readers did. That is the game's premise, not a result.
- **What follows in the first mock.** Two observations the Mind offers, which spend the telescope in turn, and one more study.
  - Gliese 12 b's day side, with the space telescope. A cool day side means air carries heat away. The space telescope read TRAPPIST-1's inner worlds this way in 2023.
  - LHS 1140 b's crossings, studied. In 2024 they ruled out a hydrogen world and hinted at heavier air over water.
  - Fomalhaut through a Year, monthly. It closes the lead as rubble.
- **Settled leads stay settled.** Alpha Centauri A's candidate is resolved long before 2040. Adopt JWST's August 2026 result when it is published. As of 2026-10-13 it is not: the telescope observed on August 11 and 12, and no paper is out. A bright background star blocks the next try until about 2030.

## How Earth learns

Settled 2026-10-13.

- **Four ways to learn, from widest to closest.** A search sweeps many targets for one kind of sign. An observation points one instrument at one target. A study works through data already in hand. An inquiry goes there.
- **An observation is ordered.** One instrument, one target at a time. What comes back is a reading. The Mind offers observations and never starts one unasked.
- **A study runs on its own.** The Mind works through the data Earth holds: old records at first, then each new reading as it lands. What comes back is a finding. Settled 2026-10-13.
  - *Thought is its budget.* The player sets a share of compute for studies. More means faster findings, and less left for builds.
  - *Why this is not acting unasked.* A study points no instrument, builds nothing and sends nothing. The Mind says what it is studying next.
  - *What limits it.* Data. Once the records are read, more thought finds little until new readings arrive. This is reasoning, not yet a rule.
  - *Sample:* a tenth of thought, and about one finding a minute in the first session.
  - Set aside: studies in the Mind's own order with no budget, and studies the player orders one by one.
- **A search is a standing order for an idle instrument.** Settled 2026-10-13. Each instrument has a sweep it falls back to: many targets, one kind of sign. The player sets it once. Any observation interrupts it. What comes back is a candidate.
  - *Why:* real observatories don't idle. Between pointed work they sweep, as Breakthrough Listen swept 1,327 near stars and Terra Hunting watches 40 for ten years.
  - *The trade is real.* The same instrument hours spread wide go shallow, and an observation takes the instrument away from its sweep.
  - *Candidates can be wrong.* Hephaistos's best waste-heat candidates turned out to be background galaxies.
  - *Already searches, under other names:* the sky watch and all-sky watch, which never stop. The audit's Planet survey and Waste-heat survey. Terra Hunting, which felt this game's new world.
  - *Sample, in the mocks:* at Year 0 the space telescope sweeps near stars for cold worlds and dust, and the radio array sweeps them for tones. The infrared telescope, once built, sweeps the nearest stars' warm zones, up to a day a star. Its first stop finds the world at Alpha Centauri A.
  - Set aside: a search as a one-off order like an observation, and no new kind at all.
- **An inquiry goes there.** Settled 2026-10-13. A mission sent to find out: a sail swarm, a flyby probe, a sentinel. Probe stays the name of the craft. What comes home is a dispatch, by narrow beam, one light-time later.
  - *One screen compares the ways to go,* as v1's Send a probe screen did: when each arrives, what it can see, and who sees it leave.
  - Set aside: an inquiry as a question pinned on a place, which the Mind then pursues by every means. Worth its own round later. And leaving the word unused.
- **Four words for what comes back.** A search returns a candidate. An observation returns a reading. A study returns a finding. An inquiry returns a dispatch.
- **Physics sets how long an observation or a sweep takes.** Settled 2026-10-13. A nearer or larger world is brighter, so its reading comes sooner. The numbers are in [calcs/observing.py](calcs/observing.py).
  - *The rule.* A warm world's brightness goes as its area over its distance squared. Time grows as distance squared where starlight sets the noise, and as its fourth power where dust does (Stark et al. 2014).
  - *Calibrated on published figures.* An Earth twin at 10 pc is first seen in 3.2 hours. A search for water takes about 22 days for a 6 m mirror, and oxygen four times that. No target gets more than two months.
  - *Reach matters as much as time.* A mirror can't split a world too close to its star in our sky: 56 thousandths of an arcsecond in green light, 84 at oxygen's band, 104 at water's, for a 6.5 m mirror.
  - *In this game:* Alpha Centauri A's world is seen in minutes, with water in 16 hours and oxygen in 3 days. 82 Eridani d gives water in 3 days. Gliese 432 A's world, 73 thousandths from its star, gives only its color and ozone, in 49 days. 12 Ophiuchi's can be seen and not read.
  - *On the game clock* a day is under a second. So a reading lands within the minute it is ordered, or not at all.
  - *The sweep.* The mirror can split the middle of the warm zone at 110 of the 880 hosts. A first pass gives each up to a day, a sample, and takes about eight weeks. A candidate needs a second visit, weeks to months later, to show it moves with its star.
  - NASA's own list has 164 stars because it reaches past 50 ly. The seed draws nothing out there.
  - *What this means for neighbors.* The mirror can split a warm world from any Sun-like star within 50 ly. A red dwarf's world sits too close in.
  - *Samples:* how the noise splits between starlight and dust, the mirror's size, and a month for carbon dioxide, which has no published time.
  - Seasons are left out on purpose. See the real limits the game skips, below.
  - Set aside: one fixed time for each kind of observation, everywhere.
- **A sweep finds natural warm worlds too, at the real rate.** Settled 2026-10-13. The seed draws them, in [calcs/seed.py](calcs/seed.py).
  - *The rate.* NASA plans its telescope on 0.24 rocky worlds in each star's warm zone, 0.6 to 1.4 Earths wide, the same at every kind of star (Stark et al. 2019). Kepler's counts allow 0.08 to 0.70.
  - *The draw.* Each host with no neighbor gets a world at that chance. Small ones are commoner, and so are wider orbits, as Kepler found. Orbits are circular.
  - *The same checks as a neighbor's world.* A stable orbit, no transit seen from Sol, no tug in 2026 data. About 60 draws a game fail and are dropped, most at red dwarfs, where a fifth of worlds would tug over 1 m/s.
  - *What a game holds.* About 150 natural warm worlds, 120 of them at red dwarfs. The mirror can split about 18 from their stars. Its first pass sees about 10 it had not felt before, and about 4 neighbors' worlds.
  - *So about 1 point of light in 4 is a home.* From Earth the two look alike: a point that moves with its star.
  - *Some are felt before Year 0.* A natural world that tugs hard enough for the planet hunters by 2040 is one of Earth's finds: about 2 a game, and none in 1 game in 10.
  - *Samples:* at most one warm world a star, none beside a neighbor's world, and a day a star on the first pass.
  - Set aside: a sweep that finds only neighbors' worlds, and a sweep that finds cold giants and dust alone.
- **Alive is a ladder, and a natural world climbs no higher than animals and forests.** Settled 2026-10-13. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#kinds-of-worlds).
  - *The rungs.* Bare rock. Air and sea with no life. Hidden microbes. An oxygen world. Animals and forests. A world whose life died is one more.
  - *Every mind stays hand-written,* living or dead, with industry or without. The seed never draws one.
  - *Why.* Earth's life has been microbes for most of 4.2 billion years, and its radio is 130 years old. A natural draw would almost never land on minds.
  - *What the first mirror tells apart.* No air, water without oxygen, and oxygen. Hidden microbes read as a lifeless sea, and animals as an oxygen world.
  - *A world whose life died reads as a lifeless sea.* Its oxygen is gone in a few million years. A sample, from 2026-10-14.
  - *Which reading a game opens with.* Measured on 300 games, 2026-10-14. At the nearest felt world it can read, the first mirror reads water and oxygen in 6 games of 10. It reads only color and ozone in 1 in 17, as in the mocks' game. In 3 of 10 it can read no felt world, and the player reads 82 Eridani d.
  - *The premise makes life common.* It puts a mind at about 1 warm world in 18. Minds can't be commoner than life, so most worlds that can hold life do.
  - *Later:* stone-age worlds and old ruins can join the roster as written entries.
  - Set aside: minds without industry drawn by the seed, and every rung drawn, ruins included.
- **A natural world's rung comes from its star's age, and physics says whether it kept its air.** Settled 2026-10-13. Built in [calcs/seed.py](calcs/seed.py).
  - *Air.* A world keeps its air if it sits on the airy side of the cosmic shoreline: the line through Mars that divides the Solar System's airy worlds from its bare ones. Small worlds and harsh young stars lose (Zahnle and Catling 2017).
  - *Red dwarfs are harsh.* Their warm zones sit close in, and the dimmest stay active about three times longer than the old estimate (Pass et al. 2025). Most of their warm worlds come out bare rock.
  - *Age.* Earth had lasting oxygen at 2.3 billion years old, and air rich enough to read, with animals and forests, at about 4. A world follows that schedule at its own pace.
  - *Published ages where they exist.* 53 hosts have one from asteroseismology or spin (Ware et al. 2026). The rest are drawn evenly from 1 to 10.5 billion years, as nearby stars formed.
  - *What a game holds.* Of about 150 natural worlds: 90 bare rock, 15 airy and lifeless, 36 alive, 9 where life died.
  - *At Sun-like stars* about half are alive, and 4 in 10 show oxygen. At red dwarfs about 7 in 10 are bare rock.
  - *So oxygen does not unmask a neighbor.* Of the points of light a first pass shows, about 5 natural worlds show oxygen, beside about 4 or 5 homes.
  - *Samples:* life started on 3 airy worlds in 4, and died on 1 in 5 of those. Each world's pace varies by a factor of 1.6. Each world's luck at the shoreline is half a power of ten.
  - *Earth's pace is taken as typical.* One school says Earth was fast, and most living worlds are still microbes. The pace is the number to turn if so.
  - *Not modelled:* a warm zone drifts outward as its star brightens, so an old Sun-like star's world may have thawed late.
  - Set aside: fixed odds at every star, and fixed odds by star kind.
- **The Mind gives its judgment in words, never in numbers.** Settled 2026-10-13.
  - *A report still lists what a thing could be.* Each explanation carries a word. If a reading moved it, the word before shows too: Life, very unlikely → likely.
  - *Seven words,* a sample, after the scale US intelligence analysts use: almost no chance, very unlikely, unlikely, roughly even, likely, very likely, almost certain.
  - *This replaces v1's percentages.* The rest of v1's rule holds ([v1: What we know, and how we know it](legacy/v1/HOLOS_GAME_CONCEPT.md#what-we-know-and-how-we-know-it)): explanations compete, and each instrument runs one test.
  - *A number that is a measurement stays a number:* a distance, a time, a mass.
  - *Known cost.* People read such words differently, and nearer to even than meant (Budescu et al. 2014). One fixed scale, used everywhere, is the guard.
  - Set aside: odds the Mind reasons out from what Earth knows, shown as numbers. And odds that match the seed's truth.
- **The Mind judges from what Earth knows, and it can be wrong.** Settled 2026-10-13.
  - *It never reads the seed.* Its words come from Earth's science at Year 0, and from what Earth has observed since: readings, findings, voices, dispatches.
  - *Example.* At a new point of light it says Minds, almost no chance. In the seed's truth about 1 such point in 4 is a home.
  - *Why it starts there.* No search has found anyone ([Price et al. 2020](HOLOS_RESEARCH.md#hearing-technology-by-radio)), and the science leans to rare minds (Kipping 2020). For life it leans the other way (Kipping 2025).
  - *Earth's own finds move its starting words.* After a first voice, Minds starts a word higher at every candidate: very unlikely. The voice's report shows that change.
  - *It can be wrong.* In the mock's game it reads Alpha Centauri A's air as eruptions, roughly even. The truth is burning, which it calls unlikely.
  - *So the premise holds.* The Mind can't tell the player how many are out there. Its words climb toward the truth only as Earth finds it.
  - *Samples:* each starting word, and how far one voice moves Minds. In the mock a voice leaves Life's word where it was.
  - Set aside: words that follow the seed's real frequencies, and words written by hand for each report with no rule.
- **A living neighbor becomes known as fast as physics allows, and no faster.** Settled 2026-10-13. Numbers from `python3 calcs/signs.py stats`. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#reading-air).
  - *Each sign of minds needs its real instrument.* Nothing is hurried, and nothing guarantees a neighbor is known by any Year.
    - *Aimed radio:* a knock, or a radar beam. The all-sky watch hears it from any of the hosts.
    - *Everyday radio:* pure tones of about 10 to 100 kW. Only a far-side array hears them: hours for the nearer hosts, months for the farthest.
    - *Smog:* nitrogen dioxide, from burning. The first telescope reads Earth's 1980 peak within about 12 ly. A 15 m mirror reads today's level in days to weeks at most worlds it can split.
    - *Industrial gases:* in the mid-infrared, for an interferometer, at levels well above Earth's. No time is published for Earth's level.
    - *City lights:* out of reach. Earth's own would show to 0.04 ly.
    - *Going:* a flyby or a probe is the surest way (Haqq-Misra et al. 2025).
  - *Smog is not proof.* Lightning and soil make it too, and clouds can mimic it. It moves the Mind's word.
  - *What a game holds.* A first pass sees about 4 living homes. The first telescope can read smog at 1 in 10 of them, a 15 m mirror at 8 in 10. A far-side array hears 9 in 10 within a Year.
  - *Earth's ground arrays hear almost none.* Held on a star for a Year, an SKA-class deep-field receiver hears about 1 living neighbor in 460. Their loud years are mostly over, as seen from here.
  - *About 1 living neighbor in 8 is out of reach of all of these.* What is left is its own voice, or going.
  - *In the mock's game:* Varn's world, 31 ly off, 80 years before its waking. A far-side array would hear it in 5 hours and a 15 m mirror would read its smog in 5 days. Earth has neither at Year 9.
  - *Samples:* a neighbor's smog is taken to be like Earth's, from its first radio on. Times are scaled from one published point for each mirror: Earth's peak for the first telescope, today's level for the 15 m. No listening campaign runs past a Year.
  - *Priced 2026-10-13:* a 15 m mirror, 18 Years. A far-side array, 30 Years after a Moon mass driver. See [Build times](#build-times).
  - Set aside: a floor, where some instrument within reach in the first hours can always tell. And minds never read from afar.
- **The first telescope reads a dead world's strange air, and not its cause.** Settled 2026-10-13. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#reading-air).
  - *What a collapse leaves.* Radio stops at once. Smog clears, since sunlight breaks it down. Burned carbon stays: a fifth to a third is still in the air after 2 to 20 centuries (Archer et al. 2009).
  - *Carbon dioxide alone is no sign of industry* (Haqq-Misra et al. 2025). Even with smog beside it, it is a tentative one. Great eruptions leave the same excess.
  - *The gases only industry makes* last from decades to tens of thousands of years, and show in the mid-infrared. An interferometer reads them at a few times Earth's level or more.
  - *So proof needs that interferometer, or going.* A flyby that sees the surface is the most conclusive.
  - *The Mind says so.* It gives eruptions and burning as competing words, and names what would tell.
  - *Real, and not used yet:* eruptions under way change a world's ozone and color month by month (Ostberg et al. 2023). Later readings could weaken "eruptions now", never "eruptions long ago".
  - Set aside: a mark only industry leaves that the first telescope can read. And a dead world that reads as an ordinary living one.
- **Real limits the game skips, on purpose.** A rule the player must learn should change a decision. These would not.
  - *Seasons.* Settled 2026-10-13. A space telescope can't point near the Sun. The planned one may point 45° to 135° from it (Spohn, Stark and Savransky 2026), so a star on the Sun's path is out of reach twice a year, 90 days each time.
    - In play that is a wait of 75 seconds at most. Real astronomers care because the real survey has a few years. Here telescope time is plentiful.
    - It contradicts nothing observed. It is a simplification.
    - Set aside: seasons by the telescope's real limits, and deciding later.
- **A suspicion opens the whole kit.** Settled 2026-10-14. Numbers from `python3 calcs/signs.py closer`. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#travel-sails-and-lenses).
  - *The player may do anything v1 allows, at any world.* Listen, look, go or knock.
  - *The Mind lists the ways and what each risks,* with when each answers. It advises, and the player decides.
  - *The mock's game, smog at four worlds at Year 22:*
    - Listen, telling no one: the far-side array's first fifth by Year 34, the whole array by Year 51.
    - Look, telling no one: a solar lens pictures one world by Year 46 to 48. An infrared interferometer reads industry's gases by Year 62.
    - Go: sails' word comes home after Year 200.
    - Knock: it lands from Year 52, and they learn we are here.
  - *The solar lens.* A craft beyond 548 AU, on the line from a star through the Sun, pictures that star's world. NASA's concept: an exo-Earth at 30 pc, about 25 km a pixel, in six months of looking (Turyshev and colleagues, 2020).
    - It flies at about 150 km/s from a dive past the Sun: 17 Years out. One craft serves one star.
    - At 49 ly a pixel is about 13 km. The build, 8 Years, and its want, half a flagship, are samples.
  - *Earth has knocked on stars with no sign of life,* as Cosmic Call did. A suspicion is more than Earth had then.
  - *Next door, in a second game, seed 11.* Hael lives at Alpha Centauri A, awake since 1992.
    - The sweep's first stop finds its world at Year 7.1. The first mirror reads oxygen and smog in 10 days.
    - Its everyday radio, about 10 kW, is under what a Year of Earth's array hears: 290 kW.
    - So the ways differ: radio by Year 34, a lens picture at about 1 km a pixel by Year 31, sails' word by 51.
    - A knock and its answer take 8.6 Years: 43 minutes of play. The mock's player knocks at Year 7.6.
    - To Hael it is a late answer to its gifts of 1992. Its answer reaches Earth at Year 16.5.
    - In about 3 games of 10 the first mirror can read smog at a living home within the first hour.
  - Set aside: only listening and looking until proof, and knocks gated by the Mind's judgment.
- **A laser launch is seen by its target, and no one else.** Found 2026-10-14. Numbers from `python3 calcs/early_game.py`.
  - *Why.* A sail reflects 70% of its beam and passes 30% forward (Parkin 2018). That light goes on to the target star.
  - *How bright.* As each sail's beam stops, a spot 0.05 AU across at Alpha Centauri gets 150 times the Sun's light there in that nanometre. A laser's line is narrower still.
    - Earlier in the pulse the spot is wider and fainter, so the whole system is lit for a moment.
  - *No one behind it.* Past the target the cone is under 5 arcseconds wide. No star within 50 ly is expected in it.
  - *So it is news to the target:* something is coming, 17 Years before the sails at 4.3 ly. An awake Mind there catches it, as it would a knock. A people catches it only if it watches Sol in that color.
  - *The Mind says so before a launch,* when the target is a candidate.
- **A picture shows everything larger than a pixel, and nothing smaller.** Settled 2026-10-14. Numbers from `python3 calcs/signs.py pictures`.
  - *Physics sets the pixel. The seed's world fills it.* The Mind names only what is larger than a pixel.
  - *A solar lens:* about 25 km a pixel at 30 pc, 13 km at 49 ly. Cities and cleared land show. Dams and roads don't.
  - *A sail flyby:* optics of about 0.4 arcseconds on each sail (Eubanks et al. 2026).
    - With about 300 sails arriving and the world's orbit known to 100,000 km, one passes within a world's width: about 20 m a pixel.
    - Others miss by up to 100,000 km: about 200 m. The closest pass lasts under a minute.
    - So roads and dams show. Single buildings don't.
  - *Earth's own telescopes:* a world is less than one pixel. They read its light, never its shapes.
  - *What it means for play.* A lens shows a living world with industry. A world whose minds are gone looks merely alive to it. Sails see the ruins.
  - *The sizes are round figures from Earth's surface:* cities about 30 km across, lakes behind dams 10, dams 1, street grids 0.1, roads 0.03.
  - Set aside: a fixed list of what each way shows, and hand-written samples.

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
  - *Dropped:* stars known to be younger than about a billion years, with their companions. Checked 2026-10-10 against published ages and young-group lists: 25 more left, among them Xi Boötis A and HD 166. Gaia's own ages miss young cool stars. Borderline ages were settled 2026-10-12: see the next bullet. Stars whose companion leaves no stable orbit in the warm zone (Holman and Wiegert 1999), whether Gaia splits the pair or only a published orbit shows it (ORB6, SB9). Stars with a white dwarf companion, judged in [calcs/scorch.py](calcs/scorch.py): see the next bullet. Giant stars. And stars where a known planet of 10 Earth masses or more crosses the warm zone.
  - *How sure "young" must be,* settled 2026-10-12. A star leaves only when every published age is under a billion years, error bars included. An age that straddles a billion is improbable, not contradicted, so the star stays.
    - Ages counted: spin, activity, X-rays, lithium, surface gravity, and the age of a star it is bound to. At least one must come from a method built for that kind of star.
    - Not counted: where a K or M star sits on the main sequence, which barely moves in ten billion years. Survey pipeline fits. Assumed defaults. Spin set by a close companion's tides.
    - 8 stars are out: HD 82106, Gliese 208 and its companion, DS Leonis, DT Virginis, GJ 569 A, YZ Canis Minoris and YY Geminorum.
    - *Corrected 2026-10-13.* On 2026-10-12, 29 left. Sixteen of those were small red dwarfs dated only by fast spin or bright X-rays. Fully convective red dwarfs, under about 0.35 Suns, stay fast and active for billions of years (Pass et al. 2024, Medina et al. 2022), so those ages can't say under a billion. They are hosts again: Ross 154 and EV Lacertae among them.
    - A small red dwarf now leaves only on other evidence: a bound star's age, low gravity, or brightness above the main sequence.
    - *And a fast spin dates no red dwarf,* 2026-10-13. It says only that the star has not yet settled onto the slow sequence. About a quarter of stars of 0.35 to 0.5 Suns still spin fast at 0.7 billion years (Douglas et al. 2017, 2019), and nothing measures that mass between 0.7 and 4. So AD Leonis, GT Pegasi, GJ 4337 A with GJ 4338 B, and OT Serpentis are hosts again: probably young, not shown to be.
    - Kept: 58 Eridani, 0.45 to 1.3 billion years. Gliese 338 A and B, 0.65 to 1.3. GJ 3417 A, listed as under 0.3 but turning once in 54 days, which reads 3.9. Three dim K stars whose only ages push a Sun-like relation onto redder stars.
    - Set aside: dropping on the middle estimate, which would also take 58 Eridani. And leaving the list as it was.
  - *White dwarf companions,* settled 2026-10-11 ([calcs/scorch.py](calcs/scorch.py)). A white dwarf was a giant first, and lit its partner's warm zone from closer in than the pair sits now. Sixteen stars have one. A scorched zone restarts the same billion-year clock as a young star. 40 Eridani C leaves: its zone took about 18 times Earth's sunlight 0.12 billion years ago. Procyon and GJ 3991 leave because their zones hold no stable orbit. Gliese 86, Stein 2051 A and Gliese 283 B stay: scorched, but 1.25 to 1.9 billion years ago. Improbable, not contradicted: no paper found says such a zone stays dead. The other ten took under Earth's own sunlight.
  - *What's left:* 880 stars, F 16, G 49, K 100, M 715, worth about 228 G-star equivalents. Stars whose color and brightness disagree are left out as bad photometry.
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
  - *Settled 2026-10-11:* how long a Mind takes to act on news comes from its Cautious or Bold dial. Strongly Bold: a tenth of a Year. Leans Bold: a quarter. Leans Cautious: a Year. Strongly Cautious: two. It sets when an answer leaves, and so when it arrives: Hael answers Earth's radars a quarter of a Year after hearing them, and Kirrin takes two Years. A design choice, not physics, like the odds.
- **Before its Mind wakes, a world answers as a people.** Settled 2026-10-14. Table in [HOLOS_REACTIONS.md](HOLOS_REACTIONS.md#before-a-mind-wakes).
  - *Why.* In v2 a world has radio arrays decades before its Mind wakes. It is like Earth today: people who can hear, and can send.
  - *Earth is the only example.* About ten aimed sends from 1974 to 2018, from dishes in four countries, by private groups and single institutions. None waited for the world to be asked.
    - In 2015 scientists signed a statement asking for a worldwide discussion first. Some urge waiting, and some send anyway.
  - *So a people answers readily, sometimes in more than one voice, and often not at all.* A neither-leaning people answers or knocks back half the time, and keeps it the other half.
  - *Only the Open or Hidden dial applies.* A culture leans open or closed before its Mind does.
  - *A people takes 2 Years to act,* a sample. It argues before it sends.
  - *Its Mind inherits the exchange.* On waking it knows who knocked and what its people sent, and rolls its own table.
  - *In the mock's game:* a knock sent at Year 34 lands at Kesh's world at Year 63, before its Mind wakes at 66.9. Its people would hear it.
  - Set aside: only the Mind answers, once awake. And v1's rule, no conversation with a young world, which now means a world without arrays.
- **A late answer costs nothing extra.** Settled 2026-10-14.
  - *A sender listens for good,* so a late answer is always heard. See [Stars Earth knocked on](#stars-earth-knocked-on).
  - *Its own tables carry the cost.* After one round trip of silence it rolls its silence table. By the time the answer lands it may have knocked again, or turned to others. Then it rolls its table for an answer, like any other.
  - *In the mock's game:* Ombe's knock reached Earth at Year 8.5, and Earth answers at Year 29.7. Ombe takes the silence as news about Year 59: knock again 52%, probe 24%, call 15%. The answer lands at Year 79: answer 61%, gift 20%, probe 13%.
  - *The Mind says what the sender has likely done,* from those tables, in words.
  - Set aside: a trust score that falls with lateness, and one that falls only after the sender gave up.
- **A neighbor's probe is a rocket.** Settled 2026-10-14. Built in [calcs/seed.py](calcs/seed.py). Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#travel-sails-and-lenses).
  - *v1's sentinel:* 20 Years to build, a tenth of light speed. It brakes on a fusion flame pointed at Sol.
  - *Corrected 2026-10-14: its flame is X-rays, and shows only close in.* Earth needs an X-ray sky watch to see it, a work the Will can start. Before, this said the watches see it.
    - *Corrected again the same day: close in means its last weeks.* A wide-field watch like Einstein Probe sees a drive of a terawatt within about 3 AU. Zubrin's 60 TW ship shows within about 22. This project's arithmetic.
    - Braking at a hundredth of a gravity, a probe covers its last 10 AU in about 64 days.
    - Zubrin's "within a light-year" came from a focusing step that adds no photons, by a reading of his scanned paper.
    - *No such watch is confirmed for 2040.* Einstein Probe, SVOM and MAXI end by about 2031. Swift is coming down. THESEUS lost its slot.
  - *Where it ends its burn is its sender's Open or Hidden dial, as odds.* Settled 2026-10-14.
    - One burns all the way in, to watch from close. An X-ray sky watch can catch its last weeks.
    - The other ends its burn past 100 AU, beyond any watch's reach, and watches from the outskirts, as v1's lurker did. Earth never sees it arrive.
    - *Odds of burning in, samples:* strongly Open 90%, leans Open 70%, leans Hidden 30%, strongly Hidden 10%. On 1,000 games, 53% of rolled probes burn in.
    - *In seed 11,* Hael leans Open, and its probe burns in.
    - Set aside: every probe burning in, and every probe stopping far out.
  - *What it does on arrival is what its orders say.* Settled 2026-10-15. Built in [calcs/reactions.py](calcs/reactions.py), tables in [HOLOS_REACTIONS.md](HOLOS_REACTIONS.md#a-probes-orders).
    - A probe has no mind of its own, as v1's nodes. Its sender writes its orders at launch, rolled from a table for its kind and tilted by its dials.
    - It watches quietly and reports home, hails the world it was sent to, or waits to be hailed. A hunter's may hail with a false face, as bait.
    - *Bases, samples:* a watcher's probe watches 70%, waits 25%, hails 5%. A contacter's hails 50%, waits 35%, watches 15%. An inward neighbor's watches 60%, waits 35%. A hunter's watches 70%, wears a false face 20%, waits 10%.
    - A hail is sent from close range, so any receiver hears it. Its words are as old as the launch: it knows nothing since.
    - *On 1,000 games* of rolled probes: watch 42%, hail 33%, wait 24%, a false face under 1%.
    - *In seed 11,* Hael's orders: hail 63%, wait 28%, watch 8%. The seed rolls hail. Its words, written in 2023, reach Earth at Year 36.2.
  - *The X-ray sky watch, proposed 2026-10-14.* Samples, in [calcs/seed.py](calcs/seed.py).
    - Einstein Probe's class: a few tonnes in orbit, 6 Years at standard pace. Einstein Probe took about 6 from approval in 2018 to launch in 2024, and Swift 5. It wants a twentieth of a flagship.
    - A probe of 1,000 t braking at a hundredth of a gravity runs half a terawatt of jet. A tenth leaks as X-rays, as Zubrin assumed.
    - The watch sees it within 0.7 AU in one look, 2 AU with a day of looks stacked. So 29 days before it stops: 23 seconds of play.
    - *In seed 11's mock,* the player builds it on the Mind's word after Hael answers, and it catches Hael's probe. See [the mock](explorations/v2-mocks/seed-11.html#next).
  - *How often.* On 1,000 games, a rolled probe reaches Sol by Year 60 in 2. None arrives before Year 0, so none breaks Earth's quiet opening. Probes rolled in answer to the player's acts come on top.
  - *Speeding up and slowing down take 10 Years more,* settled 2026-10-15. At a hundredth of a gravity, each takes 9.7 Years over half a light-year.
  - *In seed 11:* Hael's rocket, rolled on silence in 2003, reaches Sol at Year 36.2.
  - *v1 reasoned that ancient probes must be rare, since none has been found.* That holds only for big ones. Searches would miss a probe 1 to 10 m across (Haqq-Misra and Kopparapu 2012).
  - Set aside for neighbors the same day, to keep the game simple: small dark sails, chosen by a Hidden sender's dials. Physics allows them. But the Sun can catch a sail only below 3.8% of light speed (Heller and Hippke 2017), so one takes about 115 Years from Alpha Centauri and almost never arrives in play.
  - Also set aside for neighbors: relays at the Sun's lens points, lurkers on Earth's co-orbital asteroids, and probes that build. Logged as research.
  - *The Will may still build or search for any of these,* at their real prices. Nothing artificial limits the Will.
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
- **Planning.** The player queues builds, observations, standing orders and what wakes them, sets how much thought goes to studies, and sets what each instrument searches when idle. Nothing happens yet.
- **Begin.** When the player taps Begin, Year 0 starts and everything queued starts at once. From then on the clock runs, offline too, at 5 real minutes a Year.
- **The first session keeps v1's rhythm.** Settled 2026-10-12. About 15 minutes of play from Begin, the first result within 30 seconds, and something real landing about every minute. It ends on a timer the player sets, 45 to 60 minutes out.
  - The first mock kept it for 90 seconds. Then nothing landed for 3.5 minutes, and later for 5.5. Eleven of its 31 half-minutes held nothing.
  - Why: v2 took build times from real works, so the shortest build is a Year, and the opening's three observations all land by 1:30.
  - Quiet of that length is a flaw, not the pace. Set aside: dropping the rule and shortening the session, and a Mind that speaks up on a timer.
  - *What may land,* settled 2026-10-12: readings from observations, findings from studies, and Earth's own old messages reaching their stars.
    - Observations: Earth has about ten more real oddities logged than the opening's three. An observation takes 30 to 90 seconds, and one instrument makes one at a time.
    - Arrivals: real sends on real dates. Kappa¹ Ceti's at Year 0.1 and Gliese 208's at Year 0.8, then the reply windows at Luyten's Star.
    - The mock needs about nine more landings: seven observations and two arrivals.
    - Set aside: part-way reports from long observations and builds. They would teach the player to ignore what lands.
    - The Mind offers observations and never queues them unasked, as v1 had it.
  - *How the observations are spread,* settled 2026-10-12: four more are queued at Begin, and three are offered as follow-ups to what lands.
    - *Revised 2026-10-13:* the four are studies of old records, so they run on their own from Begin. Observations are still offered as follow-ups, and the player orders each.
    - Seven observations queued at Begin on three instruments would all land by about 4:30, and leave 5:30 to 10:00 empty.
    - The early minutes fill themselves, which leaves room to meet the Mind.
    - A follow-up is a real choice: it spends an instrument the next lead also wants.
    - Set aside: everything queued at Begin with longer observations, and an offer at every landing.
  - *The mock, rebuilt 2026-10-12:* 4 of 31 half-minutes are quiet, down from 11. No two landings are more than 90 seconds apart.
    - Studied from Begin, on a tenth of thought: Gliese 432 A's crossings, 82 Eridani, Gliese 12 b, Barnard's Star, Tau Ceti, Epsilon Indi, then LHS 1140 b.
    - Offered as observations: Gliese 12 b's day side, and Fomalhaut through a Year.
    - Arrivals: the 2009 message at Kappa¹ Ceti, 0:30. The 2003 message at Gliese 208, 4:00.
    - Results pile up while the player talks, and wait in Reports.

## The seed, drawn

Built 2026-10-10 in [calcs/seed.py](calcs/seed.py), from the rules above.

- **One number gives one game.** `python3 calcs/seed.py 10` prints it: Earth's branches and their years, what a Taiwan branch left of compute, then each neighbor's star, waking year, what it knows of Earth and what it does about it.
- **A neighbor acts once its Mind is awake.** Its reaction to hearing Earth is rolled from its table at its waking or its first hearing, whichever is later. One that wakes during the game reacts then.
- **Nothing damps the first hour.** Settled 2026-10-13. The seed decides what lands in it, however much or little.
  - *What 400 games hold in their first hour:* a signal reaches Earth in 27%. A neighbor's home is among Earth's finds in 46%. A dead world sits within 15 ly in 3%.
  - *All three together:* 3 games of 400. *None of the three:* 4 games of 10.
  - The mock's game is one of the loud ones, picked to show every screen.
  - Set aside: a cap of one such event in the first hour, and a more typical game for the mock.
- **Earth's finds.** Every drawn world that tugs hard enough for Earth's planet hunters by 2040 is a find, a neighbor's or a natural one. A median of 3 a game, from 0 to 9. If a game draws none, 1 in 22, the seed adds a natural world at a bright northern Sun-like star.
  - **The opening shows every one, and the Mind leads with the nearest.** Settled 2026-10-13.
    - *Earth knows what it has felt,* and the Mind speaks from what Earth knows. So none is held back.
    - *The lead uses nothing the seed knows.* It is the nearest, a sample. Before, a neighbor's world led whenever one was found, which told the player the lead was special.
    - *So the lead is a home in 1 game in 4,* not in nearly half. A home is still among the finds in nearly half.
    - *What a game holds at Year 0:* none in 1 game in 22, one in 1 in 7, two to four in 6 in 10, five or more in 2 in 10.
    - *The decision it gives:* where to hold the radio array, and what to study first.
    - *In the mock's game* Earth holds two, at Gliese 432 A and 12 Ophiuchi. The player comes to the second at minute 13, in what was a quiet half-minute. Three are left.
    - *Not designed yet:* a list of five or more. On the mock's phone a sixth lead would scroll.
    - Set aside: all as a plain list with no lead, and one at Year 0 with the rest appearing later.
- **Keeping the opening silent.** Settled 2026-10-10 in [What Earth hears](#what-earth-hears): a signal that reached Earth before Year 0 was missed, or it never happened.
- **How long a Mind takes to act on news.** Settled 2026-10-11 in [How neighbors play](#how-neighbors-play): its Cautious or Bold dial sets it.
- **A star leaving the list moves only who lived there.** Built 2026-10-11. Each neighbor tries stars in an order set by the seed, its name and each star's id, so the host list can be corrected without reshuffling every game.
- **What 400 drawn games look like** (`python3 calcs/seed.py stats`):
  - A median of 9 neighbors, from 3 to 30. A hunter in a little over half.
  - A neighbor's own world is among Earth's finds in nearly half.
  - About 150 natural warm worlds, from 118 to 178. The infrared telescope's first pass shows about 17 points of light, and about 1 in 4 is a home.
  - Of the natural worlds, 6 in 10 are bare rock and about 1 in 4 is alive. Of the 12 a first pass sees, 7 are alive and 5 show oxygen.
  - A neighbor's signal reaches Earth in the first 15 minutes in about 1 game in 10, and in the first hour in about 1 in 4. Most are answers to Earth's radars.

## Outposts and colonies

Begun 2026-10-14. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#outposts-and-colonies).

- **People may go anywhere physics allows, at real prices.** Settled 2026-10-14, by the rule that nothing artificial limits the Will.
  - *A machine seed is cheapest.* About 12 tonnes landed on the Moon could bootstrap its industry in about 20 years (Metzger et al. 2013).
  - *People cost more.* About 110 settlers keep a Mars settlement going (Salotti 2020). A ring for 10,000 weighs about 10 million tons (the Stanford torus, NASA 1975). That is the scale of the game's Moon road.
  - *People to another star cost billions of tonnes and centuries.* The 2025 winning design, Chrysalis: 2.4 billion tonnes, about 2,400 people, about 400 years to Alpha Centauri. Over 100,000 aboard keep knowledge alive (Hein et al. 2012).
  - *Frozen embryos weigh far less,* but artificial wombs don't exist yet (Crowl et al. 2012). Building them is research Earth could do first.
  - *A colony that can stand alone is a Mind,* as v1 had it: its own industry, power and thought.
  - Set aside: Minds only beyond the home system, and Minds only everywhere.
- **Neighbors may spread too, by the same physics and prices.** Settled 2026-10-14.
  - *Why.* Holos tests the Fermi paradox. A quiet sky must come from neighbors' choices and costs, never from a rule. Neighbors already play like players.
  - *When their scripts choose.* Spreading joins each neighbor's life script.
  - *What it built before Year 0 stays below what Earth could see by 2040,* as everything else must.
  - *How much it could matter.* A neighbor's nearest other host star is a median 4.5 ly away. If every living neighbor sent one colony the moment it woke, at v1's times, one would land by Year 0 in 54% of games, and by Year 60 in 97%. An upper bound.
  - *The theory.* Expansion can fill the galaxy far faster than its age (Hart 1975, Carroll-Nellenback et al. 2019), or slowly (Newman and Sagan 1981). If only some settlements choose to spread, empty regions remain (Landis 1998).
  - Set aside: neighbors who stay home, and neighbors who spread only in answer to news.
- **The seed rolls whether a neighbor spreads, weighted by its dial, and each colony rolls again.** Settled 2026-10-14. Built in [calcs/seed.py](calcs/seed.py).
  - *Why.* Dials tilt every neighbor choice as odds. A roll at each colony is Landis's percolation: some branches stop, and quiet pockets form.
  - *Odds, samples:* strongly Expand 80%, leans Expand 60%, leans Deepen 25%, strongly Deepen 10%. A colony keeps its parent's dials. About 4 living neighbors in 10 spread.
  - *Pace, samples from Earth's own:* the first seed ship 40 Years after waking, as Earth's launcher and a sentinel take. Then one every 20 Years, to the nearest free star, at a tenth of light speed, and 15 Years more to brake. A colony stands alone as a Mind 20 Years after landing (Metzger et al. 2013).
  - *Never to Sol, or to a star another neighbor holds.* Targets come from Gaia's census to 100 ly, so a neighbor near 50 ly isn't pushed inward.
  - *A companion within a light-year is home ground,* like Proxima to Alpha Centauri A. Gaia's distance errors between companions would also misdirect such hops.
  - *A 20-Year burn to cruising speed costs 10 Years more,* settled 2026-10-15, as Firefly's engine allows. Hops under 1.4 ly come out a little long.
  - *What a game holds, on 400 games.* A colony has landed before Year 0 in 1%. By Year 60, in 41%. By Year 300, in 95%, a median of 30: the region fills, as Hart's argument expects. A hop is a median 3.2 ly.
  - *In seed 11,* Kesh settles GJ 4352 at Year 64, and Hael reaches Barnard's Star, 6 ly from Sol, at Year 81.6. In seed 10, Ombe's first colony lands at Year 43.9.
- **Earth sees of a colony what physics gives.** Settled 2026-10-14. Built in [calcs/seed.py](calcs/seed.py). Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#outposts-and-colonies).
  - *Its ship, never.* It brakes on a magnetic sail, whose radio dies in the gas between stars, below. A fusion launch shows in X-rays only within tens of AU of its home.
    - An antimatter rocket would show for hundreds of light-years, but only along its exhaust. No neighbor flies one.
  - *Its radio, once it stands alone, is its parent Mind's toward Sol.* A sample. Earth hears it with the same instruments and limits as any home.
    - By Year 60, in 400 games: 10 colonies' radio reaches Earth. The all-sky watch hears none. A far-side array, held a Year on the right star, would hear one in 1% of games.
  - *Its heat stays far under any search's limit for centuries.* Searches rule out only near-complete Dyson spheres within 100 pc.
  - *So spreading is mostly unseen early,* and a quiet sky can hide a filling region. That is the Fermi test, played honestly.
- **A colony ship brakes on a magnetic sail.** Settled 2026-10-14. Built in [calcs/seed.py](calcs/seed.py).
  - *What it is.* A loop of wire carrying a current. Its field drags on the thin gas between stars, so braking needs no fuel.
  - *How long.* Gros 2017's case: a 1,500-tonne craft, half of it a loop 1,600 km across, stops from a tenth of light speed in 0.37 ly and about 19 years. The star's wind finishes the last 100 km/s.
    - So a trip runs 15 Years longer than its cruise.
  - *Corrected the same day:* this first said a Mind sails down to 2% of light speed and finishes on its rocket, 10 Years more. That came from a case far smaller than Gros's: 8 tonnes on a 1,000 km loop (Perakis and Hein 2016).
  - *Corrected 2026-10-14: Earth can't hear one brake.* The question that settled this offered an antenna in deep space to hear sails braking, from Zubrin 1995.
    - The sail's radio is born just above the gas's own cutoff. Warm gas like that around Sol swallows it within a few thousand AU.
    - Sol sits in such gas, the Local Interstellar Cloud. Its density is from Redfield and Falcon 2008. The absorption is this project's arithmetic, from textbook physics.
    - Zubrin's ranges, 40 to 400 ly, left that absorption out, as far as the accounts read show.
    - The Will may still build such an antenna. It would hear nothing from other stars.
  - Set aside: braking on the rocket alone.
- **Every seed stands alone, so a seed ship weighs about 1,500 tonnes.** Settled 2026-10-14. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#pricing-a-seed-ship).
  - *Why.* Light-years from home, nothing can be fetched. NASA's 1980 seed weighs 100 t but needs 4 to 10% of its parts from Earth, such as chips and bearings.
  - *The seed: about 443 t,* Freitas's 1980 design, the only stand-alone interstellar seed found. It brings its own reactors. No study yet shows a seed that makes its own chips, so that is speculation.
  - *The ship: about 1,500 t,* Gros 2017's case. Half is the magnetic sail. The rest is the seed, its shield and its frame. Daedalus's dust shield was 50 t of beryllium.
  - *Three ways to push it to a tenth of light speed,* all open to Earth and to neighbors:
    - A laser: at least 6.7e21 J of light, about 9 Years of Earth's whole Year 0 grid. About 50 TW from an array 100 km across, by Lubin's scaling. The array serves ship after ship.
    - Fusion on deuterium: a ship of about 12 times its dry mass at launch, as Firefly's exhaust gives. Deuterium comes from seawater: about a billion tonnes processed for 40,000 t. Its engine needs heavy radiators.
    - Fusion on helium-3: about 17 times its dry mass, as Daedalus's exhaust gives. The Moon holds too little. Uranus's air holds enough, at 20,000 to 110,000 t of mining craft for 5,000 t of fuel (Palaszewski).
  - *It brakes on its sail,* in about 19 years with no fuel.
  - *How fast a seed grows is a separate number.* NASA's seed copies itself in about a year. Freitas's grows to a factory in 500. The neighbors' pace, a first ship 60 Years after landing, sits between: a sample.
  - Set aside: a light seed fed chips by supply ships until it builds its own chip works.
- **What each push costs Earth, priced 2026-10-14.** Numbers from `python3 calcs/early_game.py`. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#pricing-a-seed-ship).
  - *A laser waits on industry that copies itself.* 50 TW in space weighs about 150 Mt by NASA's 2024 ratio, or about 2 Gt with today's lasers and radiators. The long roads bring 720 kt of rock a Year.
  - *Deuterium is cheap, and its plants are the pace.* A 20 to 30 Year burn needs 30,000 to 60,000 t, plus 1,400 to 4,000 t of engine and radiators. Bruce took 4 to 5 years to build, and works twelve times its peak make 40,000 t in 10 Years. Its energy is 1% of a Year of the grid.
  - *The drive is the hard part.* Firefly needs a steady pinch of 1,175 GW. Zap Energy's best ran 39 kW. No one has dated a flight engine.
  - *Helium-3 waits on Uranus,* about 20,000 t, and on an engine that burns it. Helion reached 13 keV in 2026, and the burn wants about 60.
  - So deuterium is Earth's nearest road, once a drive exists.
- **A fusion drive takes 30 Years at standard pace.** Settled 2026-10-15. A sample: no one has dated a flight engine. Thought shortens it to 21.
  - It burns deuterium, as Firefly does, for 20 Years to reach a tenth of light speed.
  - So a first launch near Year 35 if begun with the long roads at Year 12, with deuterium works and a ship built alongside.
  - Set aside: fusion plants first, then the drive, and leaving it unpriced.
- **A seed ship takes 18 Years at standard pace.** Settled 2026-10-15. The flagship standard, built in the orbital yard alongside the drive.
  - The yard takes a quarter off, and thought shortens it to about 9.5 Years. The drive, at 21, sets the launch.
  - For scale: the ISS took about 13 years to assemble 420 t.
  - Set aside: the ISS's 13 Years, and v1's 50.

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

- **No screen shows how many civilizations there are.** v1 hid the seat count. v2 hides the roster's size and the seed's picks. Who is out there, and how many, is learned only by looking: Know projects, inquiries and contact.
- **Odds are words.** Settled 2026-10-13. v1 showed percentages across named explanations. v2 shows one of seven words for each. See [How Earth learns](#how-earth-learns).
- **Looks are observations, and what comes back is a reading.** Settled 2026-10-13. An observation is one pointed use of an instrument: an image, a listen, a watch. v1's quick look and long look are a quick and a long observation. A study returns a finding. Ordinary uses of the word look stay.

## Open questions

Answered one at a time, in this order. Every answer must be permitted by current observations: improbable is acceptable, contradicted is not.

1. **Settled 2026-10-10:** branch odds, read on the Metaculus pages. Taiwan is one roll: invasion 26%, blockade alone about 20%, neither 54%. Nuclear use 24%. See [Year 0 and Earth's road to it](#year-0-and-earths-road-to-it).
2. **Settled 2026-10-06:** kinds of matter and the branches' effects. Prices and splits are proposed in [the audit](HOLOS_PROJECT_AUDIT.md), to test in the mocks.
3. **Settled 2026-10-06:** Earth's leads. See [Earth's leads at Year 0](#earths-leads-at-year-0).
4. **The neighbor roster.** Thirty written as of 2026-10-10, in [HOLOS_NEIGHBORS.md](HOLOS_NEIGHBORS.md#the-roster): 15 watchers, 8 contacters, 5 inward, 2 hunters, 7 strange, 3 dead. Each passes the checker at most placements. Reaction tables, voice briefs and small voice banks are written: 1,110 lines, in [data/voices/](data/voices/). Close binaries are checked against published orbits. The host list was rechecked for white dwarf companions on 2026-10-11 and for borderline ages on 2026-10-12 and 13, leaving 880 stars. Still open: full banks once the mocks show what players read most.
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
   - **Settled 2026-10-10:** knocks before Year 0 happened, and Earth missed them. See [What Earth hears](#what-earth-hears).
   - **Settled 2026-10-11:** a Mind's Cautious or Bold dial sets how long it takes to act on news. See [How neighbors play](#how-neighbors-play).
   - **Priced 2026-10-11:** chip fabs, factory-built works, the orbital yard and the all-sky watch. See [Build times](#build-times) and [Growing compute](#growing-compute).
   - **Settled 2026-10-12:** 11 of the 31 half-minutes had nothing new for the player. That is a flaw: v1's first-session rule holds in v2. See [How a game starts](#how-a-game-starts). What may land is settled too: readings from observations, findings from studies, and Earth's old messages arriving. Studies run on their own from Begin, and observations are offered as follow-ups. The rebuilt mock has 4 quiet half-minutes.
9. **Settled 2026-10-10:** v1's research baseline, rechecked against the 2025 radar result and Garrett's 2026 cold-computing paper. See [Why the sky is quiet, rechecked](#why-the-sky-is-quiet-rechecked).
10. **Second mock built 2026-10-13:** [the first hour away](explorations/v2-mocks/index.html#hour), minutes 15 to 60, on the same game. What each reading shows is a sample.
    - **Replayed 2026-10-14 at paced speed.** The watches are built at minute 21. The telescope is done at minute 30, with the Mind's warning about energy. The player orders the yard and launcher, then the telescope gives a partial reading of one living world and finds a dead one next door, and the player starts the laser array at minute 35. The sweep's first pass is done at minute 38. A contacter's knock reaches Earth at minute 42, and the all-sky watch the player built catches it. The player is woken seven times and plays about nine minutes.
    - **Settled 2026-10-13:** physics sets how long an observation or a sweep takes. See [How Earth learns](#how-earth-learns).
    - **Settled 2026-10-13:** matter piles up in the first hour, and the Mind says what it is for: megatonne works, which must come from the Moon or the belt. See [Earth's kit at Year 0](#earths-kit-at-year-0).
    - **Settled 2026-10-13:** the Mind reads a knock at once, in three layers: what it proves, what it holds, and what it means as a word. See [What Earth hears](#what-earth-hears).
    - **Settled 2026-10-13:** an answer holds what v1 allowed, whole, lies included. See [What Earth hears](#what-earth-hears).
    - **Settled 2026-10-13:** seasons are left out on purpose. A real telescope can't point near the Sun, and the game skips that limit. See [How Earth learns](#how-earth-learns).
    - **Settled 2026-10-13:** Earth shows every world it has felt from Year 0, and the Mind leads with the nearest. See [The seed, drawn](#the-seed-drawn).
    - **Settled 2026-10-13:** a living neighbor becomes known as fast as physics allows. In this game nothing Earth holds at Year 9 can tell Varn's world from a natural one. A far-side array would, in 5 hours. See [How Earth learns](#how-earth-learns).
    - **Settled 2026-10-13:** a loud first hour is left as the seed draws it. See [The seed, drawn](#the-seed-drawn).
    - **Settled 2026-10-13:** the first telescope reads a dead world's strange air, and not its cause. Proof needs an infrared interferometer, or going. See [How Earth learns](#how-earth-learns).
    - **Settled 2026-10-13:** a sweep finds natural warm worlds too, at the real rate. In this game its first pass shows 15 new points of light: 4 homes and 11 natural worlds. See [How Earth learns](#how-earth-learns).
    - **Settled 2026-10-13:** alive is a ladder, and a natural world climbs no higher than animals and forests. Every mind stays hand-written. See [How Earth learns](#how-earth-learns).
    - **Settled 2026-10-13:** its star's age sets a natural world's rung, on Earth's schedule with scatter, and physics says whether it kept its air. In this game the sweep's 11 natural worlds are 5 alive, 2 where life died, 2 airy and lifeless, 2 bare rock. See [How Earth learns](#how-earth-learns).
    - **Settled 2026-10-13:** the Mind gives its judgment in words, never in numbers. Both mocks now show words. See [How Earth learns](#how-earth-learns).
    - **Settled 2026-10-13:** the Mind judges from what Earth knows, never from the seed, and it can be wrong. A first voice lifts Minds a word at every candidate. In this game it calls Minds very unlikely at the sweep's 15 points of light, and 4 are homes. See [How Earth learns](#how-earth-learns).
    - **Priced 2026-10-13:** what an inquiry costs in time. A laser array takes 25 Years, and word from 4.3 ly comes home near Year 60. See [Build times](#build-times). Every question this mock raised is now closed.
11. **Third mock built 2026-10-13:** [the long roads](explorations/v2-mocks/index.html#long), hours 1 to 5, on the same game. The player starts five long works at Year 12 and is woken twelve times.
    - **Replayed 2026-10-14** with every work paced by thought, down the line in the order begun, from Year 0. Years 12 to 51, about three hours.
    - *What it shows.* 35 minutes with no wake. Smog at four worlds at Year 22, each of them a home, and a solar lens sent to the farthest. Sails launched at Year 24.8. A second voice at Year 30, and a first answer, 21 Years late. Radio from two worlds at Year 34: the first proof of minds by Earth's own instruments. Each new fifth of the far-side array listens again: radio from 12 Ophiuchi at Year 38.4 and Gliese 1021 at 43.1. Power from orbit at Year 44. The lens's picture of Hael's world at 45.7. Word from Alpha Centauri at Year 51.
    - *Wakes, as played:* twelve in about three hours, about one every 16 minutes. The longest quiet is 35 minutes, Years 12 to 19.
    - *The plateau, as played:* 34 Years, 2.8 hours, from the grid limit to a twelfth data center. At standard pace it was 40.
    - *One knock is never heard.* Hael's, at Year 20, is under the all-sky watch's floor. A deep-field receiver held on that star would have caught it. The Mind advised one at Year 9.9, and this player left it.
    - **Settled 2026-10-13:** thought buys speed, down to a floor physics sets. See [Growing compute](#growing-compute).
    - **Settled 2026-10-13:** a work wants thought in scale with its real cost. See [Growing compute](#growing-compute).
    - **Settled 2026-10-14:** thought is split by an order the player sets. See [Growing compute](#growing-compute).
    - **Settled 2026-10-14:** the plateau stands as played. Twelve wakes in about three hours, about as often as the first hour, and the longest quiet is 35 minutes. Every wake comes from a settled rule or the player's orders, and the player chooses what wakes them. Set aside: waking the player for every finished work, and new event sources for the middle hours.
    - Every question this mock raised is now closed.
    - **Settled 2026-10-14:** the Mind advises a listen at marked worlds, and the player decides. See [What Earth hears](#what-earth-hears).
    - **Settled 2026-10-14:** one receiver is split among the stars it holds, and each part hears less far. See [What Earth hears](#what-earth-hears).
    - **Settled 2026-10-14:** a suspicion opens the whole kit, and the Mind lists the ways. In the mock the player sends a solar lens to Gliese 1021, the smog world too far for the first fifth. Its picture comes at Year 45.7: Earth's first sight of Hael's people. See [How Earth learns](#how-earth-learns).
    - **Settled 2026-10-14:** a late answer costs nothing extra. A sender listens for good, and its own tables carry the cost. See [How neighbors play](#how-neighbors-play).
    - **Settled 2026-10-14:** before its Mind wakes, a world with arrays may answer as a people, and its Mind inherits the exchange. See [How neighbors play](#how-neighbors-play).
    - **Settled 2026-10-14:** a picture shows everything larger than a pixel. The lens and the dispatch now follow the rule. The swarm is a thousand sails, six days of laser. See [How Earth learns](#how-earth-learns).
    - **Settled 2026-10-13:** the plateau at the grid limit stands. Better chips don't dodge it, and the megatonne road pays there. See [Growing compute](#growing-compute).
12. **The mocks on other games, 2026-10-14:** [seed 11](explorations/v2-mocks/seed-11.html), with no voice, five felt worlds and a living neighbor next door, and [seed 62](explorations/v2-mocks/seed-62.html), where the first mirror can read no felt world. The first hour now runs on any seed. It raised one question:
    - **Settled 2026-10-14:** a neighbor's probe is a rocket, v1's. Small dark sails were set aside to keep the game simple. Its braking flame is X-rays and shows only close in, corrected the same day: only in its last weeks, within a few AU. See [How neighbors play](#how-neighbors-play).
    - **Settled 2026-10-14:** where a probe ends its burn is its sender's Open or Hidden dial, as odds. A Hidden sender's probe most often stops far out, unseen. See [How neighbors play](#how-neighbors-play).
    - **Settled 2026-10-15:** a fusion drive takes 30 Years at standard pace, and burns 20 to reach a tenth of light speed. Every trip gains 10 Years for speeding up, probes' too.
    - **Settled 2026-10-15:** a seed ship takes 18 Years at standard pace, built in the orbital yard. The drive sets the launch.
    - **Mocked 2026-10-14:** [seed 11, next door](explorations/v2-mocks/seed-11.html#next). Hael answers Earth's knock at Year 16.5, the Mind reads its tables for silence, the player builds an X-ray watch, and it catches Hael's probe 29 days out, at Year 36. It raised one question: what does a neighbor's probe do once it arrives?
    - **Settled 2026-10-15:** what its orders say, rolled by its sender at launch: watch, hail, or wait to be hailed. Hael's probe hails.
13. **Earth's outposts and colonies, begun 2026-10-14.** See [Outposts and colonies](#outposts-and-colonies).
    - **Settled 2026-10-14:** people may go anywhere physics allows, at real prices. Nothing artificial limits the Will, since Holos tests the Fermi paradox.
    - **Settled 2026-10-14:** neighbors may spread too, by the same physics and prices, when their scripts choose.
    - **Settled 2026-10-14:** the seed rolls whether each neighbor spreads, weighted by its dial, and each colony rolls again.
    - **Settled 2026-10-14:** Earth sees of a colony what physics gives: almost never its ship, its radio as its parent's, and no heat for centuries.
    - **Settled 2026-10-14:** a colony ship brakes on a magnetic sail, 15 Years more a trip, by Gros 2017's case. Corrected the same day: its sail's radio dies in the gas, so Earth can't hear it.
    - **Settled 2026-10-14:** every seed stands alone, so a seed ship weighs about 1,500 t. A laser, deuterium or helium-3 pushes it, at real prices.
