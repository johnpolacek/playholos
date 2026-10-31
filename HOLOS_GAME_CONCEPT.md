# Holos · Game Concept

Last updated: October 28, 2026.

## Status

This is v2, begun October 6, 2026: a single-player game on Earth. v1, the multiplayer cohort design, is frozen in [legacy/v1](legacy/v1/README.md). Where v2 says nothing, v1’s rules still hold. Where they disagree, v2 wins.

v2 grows one question at a time, and each answer is dated. Later user clarifications take precedence. The v2 mocks are [Earth’s first 15 minutes](explorations/v2-mocks/index.html) and [the first hour away](explorations/v2-mocks/index.html#hour), on one page built by `python3 explorations/v2-mocks/build.py`. v1’s mocks show v1.

**Evidence first (2026-10-06).** Everything starts from real data and published research, the most current included. Only then comes hard-science speculation, from the best evidence we have now. Preliminary results are marked as such, with what would change if the full paper differs. Every source goes into [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md), with what it found and where the design uses it.

**Nothing artificial limits the Will (2026-10-14).** The Will may do anything physics allows, at its real price. Holos is a test of the Fermi paradox: if expansion is possible, why is the sky quiet? So a limit on what Earth can do must come from physics or cost, never from a game rule.

## Core premise

Holos is a single-player, hard science fiction browser game. You are the Will of Earth’s Mind. On the morning humanity crosses the singularity, Earth’s people and machines wake as one, and you guide what Earth becomes.

You study nearby stars, build, listen, and send probes and messages. Nothing travels faster than light. Distant observations show history, and messages can take years to arrive.

Minds are rare. Most are far older than ours, gone inward and quiet, and something of theirs may already be watching us. A few young minds like ours woke across the Galaxy within a hundred thousand years of us, thousands of light-years away. The stars near us are almost surely empty of minds, though some hold life. You don’t know who is out there, or where. Finding out is the game. See [The realistic premise](#the-realistic-premise).

*Changed 2026-10-28.* Before: others woke in the same century, a few to a few dozen within 50 ly, written by hand and run by AI. That was chosen for play, not from evidence, so it went.

The central challenge is deciding how to explore, grow, and preserve Earth when distance makes knowledge uncertain and every commitment takes time.

Iain M. Banks’s Culture books remain an inspiration. This does not authorize departures from hard science ([v1: Hard science](legacy/v1/HOLOS_GAME_CONCEPT.md#hard-science)).

## The realistic premise

Settled 2026-10-28, one step at a time. The premise itself, how many minds exist, where and how old, follows the best current estimate, never what plays well. Each number lives in one place so research can change it. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#how-common-minds-are). The criteria, the evidence by question, and answers to common objections are in [HOLOS_MODELING_ALIENS.md](HOLOS_MODELING_ALIENS.md).

- **One mind per million stars.** The honest range runs from 1 per 1,000 to 1 per 10 billion. A million is its middle.
  - *Minds don’t die,* as ours won’t. So the odds are warm worlds × life starts × a mind arises, with no lifetime factor.
  - *The quiet sky barely limits density.* Corrected 2026-10-30: quiet minds leave a quiet sky however many there are. More minds only need more of them to hold back, and patchy settlement means not all must (Carroll-Nellenback et al. 2019, Landis 1998). Before: “denser fights the quiet sky”, which assumed minds are loud.
  - *What it gives,* from a model of the Galaxy’s disk: about 1,500 stars within 50 ly and a 0.15% chance of a mind there. The nearest is typically about 400 ly away.
  - *Almost all the doubt is one step,* a living world making a mind. No hard steps (Mills et al. 2025) puts it near 1 in 10. Hard steps (Snyder-Beattie et al. 2021, Watson 2025) put it near 1 in 10 billion. About 1 in 30,000 sits near the middle. Earth ran the experiment once, so it can’t say.
  - *Every count scales with it.* Ten times the minds is ten times the peers.
  - Set aside: drawing the density per game across the whole range, which claims no best guess. A tilt toward sparse, which double-counts what the checker already enforces. And a mind on 1 living world in 1,000, which leans toward one side of a live debate, considered 2026-10-28.
- **Any mind we find is older.** Earth is younger than about three quarters of the Earth-like worlds that exist now, by 1.8 ± 0.9 billion years on average. About 90% sure.
  - So a mind we find woke long before us, typically by about 2.3 billion years, two thirds of them by 0.8 to 3.9. Settled 2026-10-30: a mind’s head start is its world’s age less the time its mind took, with Lineweaver’s ages and Earth’s 4.54 billion years scaled by each world’s pace, in calcs/minds.py. Before: about a billion years, which disagreed with the even pace behind the peer counts.
  - A peer within a century of our waking is effectively zero. Peers are counted across the Galaxy instead, below.
  - *Early is a different comparison.* Earth formed before about 92% of the Earth-like worlds that will ever exist. Those don’t exist yet, so we can’t meet them.
- **Old minds are inward.** We model only what physics lets us see, and assume nothing about what they want.
  - *The quiet sky forces it.* One that kept growing would blaze in our infrared archives. One that spread would have reached us millions of years ago.
  - *Awake,* it computes cold far from its star, a faint grey far-infrared glow (Garrett 2026). *Asleep,* it waits for a colder universe and gives off almost nothing (Sandberg, Armstrong and Ćirković 2016). The seed picks which.
  - No beacon, no colonies, no scripted personality. Silent by default. How it answers if reached is still open.
  - *It watches living worlds, and it is linked.* Settled 2026-10-30. A telescope on its star’s focal line images a world at about 100 km a pixel from 400 ly (Turyshev et al. 2020). So the nearest old mind has watched Earth’s life for ages, seeing Earth as it was around 1640 now. Old minds link by tight beams relayed through stars’ lenses, nodes a few parsecs apart (Bracewell 1960, Hippke 2021). A beam between two other stars never crosses Earth. Reasoning in [HOLOS_MODELING_ALIENS.md](HOLOS_MODELING_ALIENS.md#4-what-do-old-minds-do).
    - *Why a watcher too.* A lens sees centuries late and can’t see a 10 cm seed leave. A watcher sees and warns at once.
    - *Built 2026-10-30:* the relay on our Sun’s focal line and the Relay Search that finds it, below. Still to write: the Mind’s words on what old minds do, beyond what we have found.
  - *Hard to find, so late.* An awake one needs a far-infrared survey we must build. An asleep one needs a probe in its system, hundreds of light-years away.
  - Set aside for now: minds that died and left ruins.
- **Why the sky is quiet: rare, inward, watching.** Settled 2026-10-28. Our stated answer to the Fermi paradox.
  - *Rare.* About 200,000 minds in our Galaxy, not billions.
  - *Inward, for a reason physics gives every mind.* Computing costs less the colder it runs, so waiting and computing cold pays best (Sandberg, Armstrong and Ćirković 2016). Spreading adds little to a mind that only thinks. The same incentive for all is why all of them can choose alike.
  - *Watching.* An inward mind’s one danger is a young mind that spreads. Watching it is cheap and invisible.
  - *So the game’s tension is ours.* By parity we can spread. If we do, we become what the watchers watch for.
  - Set aside: a test universe or simulation, which can’t be tested. The Mind may still raise it as an open idea.
- **A silent watcher is here.** Settled 2026-10-28. Every game has one, small and dark, in our system for millions of years.
  - *Why always.* About 200,000 old minds in our Galaxy, and one that watches is enough. A 1 kg watcher for every star is about 10⁸ t, sent at 1% of light’s speed for about 20 minutes of the Sun’s output: trivial for an old mind, with no self-copying machines to drift. More likely than not, about 2 in 3. Low confidence.
  - *What evidence allows.* Our system has never been searched well for metre-sized objects. The best places are Earth’s co-orbiting asteroids and the Lagrange points (Benford 2019).
  - *What it does.* It saw Earth’s life long ago and heard our radio. It may report home at light speed, a maker hundreds of light-years away or more. Its maker may not care.
  - *Finding it* tells us minds exist, not who or where.
  - Set aside: a watcher in some games only, which the user ruled out: all or none, by likelihood. And none, which needs every one of 200,000 minds to refrain.
- **Earth is unheard at Year 0.** Settled 2026-10-28. Our radar front began in the 1950s, so by 2040 it reaches about 90 ly. The nearest mind is typically 400 ly away, so the chance one lies inside is about 1%.
  - Only the watcher has heard us.
  - *Quieting our radars* shapes the front that reaches minds centuries from now. It no longer hides us from minds that heard.
- **The map is the Galaxy.** Settled 2026-10-28. A game can run 100,000 Years or more.
  - *Why.* Peers exist only at Galaxy scale. Minds near us woke about once per billion years.
  - | Woke within | Within 1,000 ly | In our Galaxy |
    | --- | --- | --- |
    | 1,000 years of us | 1 in 340,000 | 0.07 |
    | 100,000 years | 1 in 3,400 | about 7 |
    | 1 million years | 1 in 340 | about 70 |
    | 10 million years | 1 in 34 | about 700 |
  - *So about 7 peers,* young minds within 100,000 years of us, the nearest typically about 18,000 ly away. Recounted 2026-10-30 from the age model: 1.6 minds in 100,000 wake within 100,000 years of us on either side. The nearest peer within a million years is typically about 6,500 ly away, within 10 million about 2,400. Their light and ours take that many Years to cross.
  - *Near stars stay a real catalog.* Beyond Gaia’s detail the Galaxy is drawn from its measured structure.
  - *Assumed:* 200 billion stars. When minds arise follows when Earth-like worlds formed, and how long a mind takes, as above. Settled 2026-10-30, replacing an even pace over 8 billion years.
  - Set aside: a 1,000 ly map, chosen first on 2026-10-28. It held about 8 old minds and no peers.
  - *How long each peer stays outward* is drawn per peer, below.
- **A young mind is outward while it builds and spreads.** Settled 2026-10-29, revised 2026-10-30. Drawn per peer, then it turns inward and goes cold.
  - *Building out its home system: 50 to 1,000 years.* From about Earth’s industry today to a swarm of Mercury’s mass is about 38 doublings. At 1 to 5 years a doubling (Metzger et al. 2013) that is 40 to 200 years. A cautious mind takes up to 1,000.
  - *Spreading, with no cap, settled 2026-10-30.* Each settlement spreads with its own chance, inherited from its parent with a small change, and settles its 6 nearest stars plus those drifting into reach while it is active. Settling here means building a star out, hungry spread. A mind’s chance is drawn from 1 in 1,000 to 1 in 30, below what Earth unsettled allows. About 1 young mind in 110 spreads at all, the largest families tens of stars within about 20 ly. Seeds travel at 1% to 20% of light’s speed. In calcs/minds.py, reasoning in [HOLOS_MODELING_ALIENS.md](HOLOS_MODELING_ALIENS.md#5-how-far-does-a-young-mind-spread).
  - *Why so few spread hungrily.* Earth unsettled demands it: with free choice, 10 to 15% of minds would fill the Galaxy. Quiet spread, small seeds and minds sent by beam, could be here unseen, so the evidence doesn’t limit it. The restraint has physical reasons. A colony years away by light can’t share our thinking, so it becomes a separate mind, a rival. Seeing by telescope and probe beats going. Thinking runs best cold and compact. And the rare hungry one is caught early: old minds are billions of years ahead, a watcher at every star costs about 100 million tonnes, and a young grower starts slow and local.
  - *Set aside 2026-10-30: a 200 ly cap on reach.* It assumed a mind’s territory is a solid ball that would swallow Earth. Settlement is patchy, and the observation, not a cap, sets the limit. The old split, 1 in 4 home, 2 in 3 near, 1 in 10 far, went with it.
  - *What we see.* A peer’s warm phase reaches us as an infrared flash lasting centuries to millennia, somewhere in a long game. A Sun’s full output at 30,000 ly is about 1.5 mJy at 12 µm, right at WISE’s limit, so a survey we build must catch it.
  - *So we rarely meet a peer outward.* Our probes take 100,000 Years or more to reach one. Missing its flash may mean missing it.
  - Set aside: one fixed outward time for all, and peers turning inward only when they learn they’re watched. An even split of home and spread, which had no grounds, and the 200 ly cap.
- **A peer’s history is drawn, until our light reaches it.** Settled 2026-10-29. Until then nothing it does can depend on us, so drawing it at the start loses nothing.
  - *After our light arrives,* it may react, but only to what it can see of us with its own instruments.
  - *Its reply takes as long again* to reach us, tens of thousands of Years.
  - *Later, human players* can take a peer’s place on the same terms.
  - Set aside: every peer played live from the start, which costs much and changes nothing we could see. Fully scripted peers that never react.
- **At contact a peer is almost always inward.** Settled 2026-10-29. In 200,000 draws of wake time, distance and outward time, our light finds 63% already inward and 35% not yet awake. Only 2% are still outward.
  - *So peers and old minds share one reaction model.* At contact they are the same kind of mind.
  - *A peer that wakes after us* finds our old light in its sky, the mirror of us finding an older mind.
- **An inward mind stays silent unless we spread.** Settled 2026-10-29. If it sees us spread, it may act, drawn per mind.
  - *Why spreading.* Its one danger is a young mind that spreads, our Fermi answer. So our choice to spread is the game’s real risk.
  - *Slow by physics.* It sees us as late as its distance in light-years. What it sends takes ten times that at a tenth of light’s speed.
  - *No evidence on what minds want.* The trigger follows our premise. How likely any mind is to act is a guess.
  - Set aside: a fixed stance drawn at the start whatever we do, and minds that always stay silent.
- **What a mind does is a ladder: warn, contain, strike.** Settled 2026-10-29. It tries the cheapest act first, and climbs only if we keep spreading.
  - *Warn:* a message at light speed.
  - *Contain:* stop our seeds and young colonies. A gram at a tenth of light’s speed carries 450 GJ, enough to wreck a seed ship.
  - *Strike Earth:* the costliest act. A bullet’s path points back to its sender, and by parity we could strike back.
  - *Everything on the ladder Earth can build too,* at the same price and pace.
  - *Kept open:* the ladder may become variable later, drawn per mind. Build it as data, not fixed code.
  - Set aside for now: containment only, never touching Earth, and any act drawn freely.
- **The watcher gives the warning, at once.** Settled 2026-10-29. Its maker gave it standing orders long ago. It sees our first seed launch and speaks by laser.
  - *Why.* A 1 kg watcher can send a short message easily, so equipping it to speak costs almost nothing.
  - *Contain and strike come from the maker,* after our news reaches it and its answer crosses back. The watcher has no weapons and doesn’t copy itself.
  - Set aside: every rung from the maker, which puts the first warning a full round trip away, 800 years from 400 ly.
- **The watcher’s maker cares, in every game.** Settled 2026-10-29. Watching is insurance against spreaders in our premise, so most watchers were sent for that reason. About 3 in 4, a guess with no evidence either way.
  - *All or none, by likelihood,* as with the watcher itself. The likelier case holds in every game, and the odds are our confidence in it.
  - So when we spread, the warning always comes.
  - Set aside: a curious maker that never warns or acts, in some games only.
- **Only seeds that build count as spreading.** Settled 2026-10-29. A probe that only looks can’t grow, and growth is the danger. So an old mind our probe reaches stays silent.
  - Set aside: any craft sent to another star counting as spreading.
- **Only seeds that build a star out count, settled 2026-10-30.** Earth rules out hungry spread, not quiet spread, so the watcher counts only growth.
  - *Builders:* a seed probe, which mines and copies itself. Our Mind sent to settle a star and build it out. Our Mind sent to feed a hole.
  - *Quiet:* our Mind kept small at a star, a receiver and a cold Mind built from a comet’s worth of rock, chosen as Keep Small on the destination’s page. Our Mind hidden in a hole’s shadow. Neither draws the warning.
  - *Fixed with it:* before, a Mind sent to settle drew no warning, only seed probes did.
  - The rungs below now count builder seeds only.
- **Each rung has its trigger.** Settled 2026-10-29. Each matches a real step toward growth without limit.
  - *Warn* when our first builder seed launches. One seed is a backup.
  - *Contain* when we launch another seed after the warning.
  - *Strike Earth* when our colonies launch seeds of their own. Growth is then out of our hands.
  - Set aside: seed counts, such as contain after 3 and strike after 10, which would be arbitrary.
- **Real stars to 326 ly, a seeded Galaxy beyond.** Settled 2026-10-29. Gaia’s census of nearby stars lists about 331,000 within 100 pc (Smart et al. 2021), a few MB to ship.
  - *Beyond,* stars are drawn from the Galaxy’s measured shape, its disk, bar, arms and bulge. They are made from the seed as we look, the same every time.
  - *Why so far.* The typical nearest old mind sits about 400 ly away, so most of the early game stays inside real data.
  - Replaces the 536 stars within about 50 ly in game/lib/game/sky.json.
  - Set aside: a real catalog to 100 ly only, about 12,000 stars, and a seeded Galaxy everywhere.
- **Known landmarks sit at their real places.** Settled 2026-10-29. The seed fills in around them.
  - *Examples:* the Pleiades at 444 ly, the Orion Nebula at 1,344 ly, Gaia BH1 at 1,560 ly, the nearest known black hole, and the Galaxy’s central black hole at about 26,700 ly.
  - *First nine, 2026-10-29:* the Hyades, the Pleiades, the Beehive, the Orion Nebula, Gaia BH2 and BH3, the Crab Nebula, 47 Tucanae and Omega Centauri. A tap names each on Reach’s map. Gaia BH1 was already a destination.
  - *Later, the full catalogs:* Gaia’s open clusters (Cantat-Gaudin 2020) and all of the Galaxy’s globular clusters (Harris).
- **How Earth finds minds, way 1: a peer’s warm flash.** Settled 2026-10-29. A new build, an all-sky mid-infrared watch, repeats every few Years and catches any flash above its depth while it runs.
  - *The flash.* A peer building out its home glows warm for its outward time, and its light takes its distance in Years to reach us. Over 400 seeds, about 2.4 flashes a game passed before Year 0, gone. About 3.5 arrive in 100,000 Years, the first typically near Year 21,000, and 1 game in 4 sees one inside 10,000 Years. Recounted 2026-10-30 with 7 peers and the uncapped spread.
  - *Its depth.* A Sun’s full output from 30,000 ly is about 1.5 mJy at 12 µm. Dust dims it 2 to 4 times, the most toward the Galaxy’s center (Xue et al. 2016, Schödel et al. 2010). AllWISE reached 0.73 mJy in clear sky, far worse in the crowded plane. A watch about 10 times deeper sees a flash anywhere in the Galaxy, a fifth-built swarm included. Spotting a new source against a crowded plane is what a repeating watch is for. Checked 2026-10-29.
  - *A flash we aren’t watching for passes unseen.* The watch must already run when it arrives.
  - *Its direction is exact, its distance only a range.* Parallax at 30,000 ly is about a ten-thousandth of an arcsecond, beyond any star mapper for a faint infrared source behind dust. Settled 2026-10-29: our Infrared Telescope studies a new glow while it shines, by its reddening against dust maps and the star behind it if it shows, and in about 2 Years gives a range about a third either way. One that fades first is never ranged.
  - *On Scan and the map, 2026-10-29:* each find becomes a lead, placed where Earth knows it, natural causes first. A warm glow is placed once ranged, at the middle of its range. A cold glow ranks natural and error above a mind, as audit item 1.4 asked. To come: a warm glow’s range drawn as a streak, and an unranged one as a fading line along its direction.
  - *The Warm Sky Watch, built 2026-10-29:* a cooled telescope about 1.3 m wide at L2, 0.25 flagships, about $2.5 billion, 8 Years, a quarter quicker with the yard. NEO Surveyor’s 0.5 m took a $1.2 billion development baseline (NASA, 2022), scaled by aperture, a sample. Not on the starting list.
  - Set aside: the Halo Survey catching warm flashes too. A warm flash and a cold glow need different instruments.
- **Way 2: an awake old mind’s cold glow.** Settled 2026-10-29. The Halo Survey finds about half of them. Its depth, 3×10¹⁸ W at 10 pc, is 4.5×10²⁰ W at 400 ly, where 56% of awake minds glow brighter, and 2.8×10²¹ W at 1,000 ly, where 50% do. A deeper survey later could find more.
  - *Corrected 2026-10-29: it looks star by star, nearest first.* A whole-sky map can’t reach the depth: faint galaxies crowd far-infrared light, so a single dish confuses a glow with them, as Herschel did at a few mJy. Only an array sees sharply, one star at a time. An hour a star, as an ALMA program taking two thirds of its time, is about 3,000 stars a Year: 100 ly in 4 Years, 400 ly in about 220.
  - *The Halo Array,* our own ALMA-class array ten times as fast, unlocks after it: 40,000 stars a Year, 400 ly in about 17 Years, 1,000 ly in about 210. 1.5 flagships, about $15 billion scaled from ALMA’s $1.5 billion, 12 Years as ALMA took. Samples.
  - Set aside: every awake old mind glowing above the floor. Physics doesn’t promise a bright glow.
- **Way 3: the watcher, found by where it sits.** Settled 2026-10-29. A 1 kg watcher is about a dark 10 cm object, absolute magnitude about 39 at albedo 0.05, this project’s arithmetic.
  - *Earth–Moon L4 or L5:* about magnitude 26 to 27 from Earth, or 28 if coated near black. A deep, stacked search from Earth finds it in some Years.
  - *The Moon Search, built 2026-10-29:* a shift-and-stack program on Rubin and Subaru, 0.01 flagships, about $100 million, a sample. A Year to ready, then 3 Years of stacking to magnitude 28.
  - *Sun–Earth L4 or L5:* about magnitude 39, beyond any telescope. Corrected 2026-10-29: no probe finds it either. The zone is tens of millions of km wide, and a probe sees a dark 10 cm body only within about 200,000 km, so years of sweeping cover about 1%. Only its warning reveals it.
  - *An Earth co-orbital asteroid:* the Asteroid Tour, one probe of Tianwen-2’s class, maps each of the six known in turn: Kamoʻoalewa, 2023 FW13, 2002 AA29, 2004 GU9, 2006 FV35, Cruithne. 0.05 flagships, about $500 million, a sample. 5 Years to build, a Year to the first rock, then 2 Years each. The seed draws which rock.
  - Set aside: a fleet of about 100 small probes sweeping the Sun–Earth zones for decades, about $2 billion and still unlikely to find it.
  - *Anywhere,* its warning at our first seed launch reveals it.
  - *Once found, two moves, settled 2026-10-30.* A playtest found the watcher a dead end: its lead offered a craft and a knock, and Build had neither.
    - *The Close Look:* a craft of CAPSTONE’s class, about $50 million, 2 Years to build, a sample. It flies about 4 months to the Moon’s L4 or L5, or a Year to a co-orbital rock. Up close it sees a 2 cm mirror held on one point of the sky, the way home its reports go: its maker’s direction, never how far, or who. *To change, settled 2026-10-30:* the mirror points at a relay on our Sun’s focal line, 1,000 to 2,500 AU out on the far side of the Sun from the maker (Hippke 2021). So it points away from the maker, and the relay is a new place to fly to. Tusay et al. 2022 listened along one such line, toward Alpha Centauri, and heard nothing.
      - *What our probe finds there, settled 2026-10-30:* a dark craft holding exactly on the line, and silence. The relay is far ahead of our probe, so it sees us coming and stops sending while we are near. Skill can’t move it off the line, since the lens fixes its place, and it must keep firing to stay there as the Sun wobbles. So a dark, station-keeping craft on that exact line is the proof. Set aside: catching its beams’ halo, which a careful old mind would deny us, and the seed drawing either.
      - *The Relay Search, built 2026-10-30:* one sailcraft of the Solar Lens class with a camera and a heat imager, 0.05 flagships, about $500 million, 5 Years, a sample. It opens after the Close Look and leaves once the mirror is seen. It flies as a lens does, by the strongest beam done when it is built, about 17 Years per 548 AU by sail alone, and finds the relay at its drawn distance. Seed 22: mirror toward RA 20.2 h, relay 1,879 AU out, found about Year 69 by sail, home toward RA 8.2 h. calcs/minds.py draws the distance, `relayAU`, on its own key, so no other draw moved. It opens only once the watcher is found where a craft can reach it, and the watcher sees it come.
    - *A knock:* a message aimed at the watcher, through the send card. It lands in seconds. The watcher answers on its own terms, which in every game so far means silence. It passes word home through the relay, settled 2026-10-30. The ladder’s triggers stay seeds alone.
    - Set aside: taking or breaking it. By parity we could, and its maker would learn when its reports stop. Left for later.
  - Set aside: one generic search that finds it anywhere after set Years.
- **Way 4: an asleep old mind, found only up close.** Settled 2026-10-29.
  - *Asleep, it folds up small.* A swarm left spread in starlight warms and glows asleep or not: 10²² m² at 540 AU from a Sun soaks up about 5×10¹⁹ W. So a sleeping mind stows itself compact and out of the light, as Sandberg et al. store theirs cold. Corrects “asleep, it hangs dark” in the Elders section below.
  - *It still sheds its housekeeping heat,* about 10¹⁰ W, a sample. From a body a km or so across that comes out warm, 200 to 490 K, a warm moving dot in a cold outer system.
  - *How near a probe must pass.* JWST’s MIRI reaches 0.48 µJy at 10 µm in 10,000 s (STScI). A 6.5 m telescope sees such a body from 270 to 430 AU, a probe’s 1 m one from 40 to 65 AU, by this project’s arithmetic.
  - *So:* a gram sail carries no telescope and never finds it. A flyby at a tenth of light’s speed spends about 6 days within 50 AU of any point on its path, so it finds the mind only if its path passes that close. A probe that brakes and stays maps the system over a few Years and always finds it.
  - From Earth, 400 ly off, it is 10¹¹ times too faint. The gap between stars is the barrier, not the system.
  - Set aside: any probe finding it, flyby or not.
  - Set aside: seeding everything beyond 326 ly, landmarks included.
- **The draw, in calcs/minds.py.** Added 2026-10-29, beside the old neighbors, as each world’s `minds`. Over 400 seeds: 8.6 old minds within 1,000 ly, the nearest typically 397 ly away, and 5.1 peers, 63% inward at contact.
  - *Old minds* sit on real stars inside 326 ly and at seeded places out to 1,000 ly, weighted by the disk. Each is typically about 2.3 billion years older, from the age model above, at most about 9. Half sleep, as before. Awake, a glow stays under what the shallow all-sky maps would catch.
  - *Peers* are placed by the Galaxy’s shape, 1 in 5 in the bulge and bar. Each carries its flash, the Years its warm phase shines at Earth.
  - *The watcher’s maker is the nearest old mind.* Settled 2026-10-29: if several watch, the nearest answers first. Set aside: a maker drawn at random within 1,000 ly.
  - *What a mind sends travels at a tenth of light’s speed,* as our bullets, by parity.
- **The clock skips to the next event.** It keeps 5 real minutes a Year and runs while we’re away. We can jump ahead to the next arrival, build or signal, and it always stops when something new happens.
  - *Why:* a probe to 400 ly at a tenth of light’s speed takes 4,000 Years, 14 real days at the old clock. Light from a peer 20,000 ly away takes 20,000 Years.
  - *Multiplayer, later:* each player keeps their own clock, never more than light-time ahead of another. Hundreds of light-years apart, that limit almost never binds, so no turns are needed.
  - Set aside: a faster fixed clock, which blurs early builds, and fully player-set speed.
  - *Built 2026-10-29:* a “Next: Year …” link by the Year jumps there. The server finds the soonest thing Earth will learn within 100,000 Years, or a build we finish, and says when, never what. A skip moves Begin back, so the clock runs on from the new Year.
  - *A long quiet, said, 2026-10-30.* A skip of more than 100 Years shows what passed: the span drawn filling, the watches that stood through it, and the Mind’s word on why the sky is quiet. A playtest skipped 37,197 Years in one press and read it as nothing happening.
  - *The natural sky, 2026-10-30.* A long quiet isn’t empty. Stars explode across our galaxy about 1.6 a century, the nearest fifth seen by eye, and pairs merge in their dust about once a century, which our Warm Sky Watch sets aside. None stops a skip: at those rates a skip would stop every few decades. The long quiet’s card draws each where it was in the galaxy instead, and the Mind knows the counts. Betelgeuse explodes once, between Year 50,000 and 200,000. That one stops a skip and leads Scan. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md), “The natural sky”.
  - *Checked 2026-10-29 in a headless browser:* seed 10 skipped from Year 0 past 50,000 in ten jumps of about a second each, with no console errors. Seed 15 stopped at its rock’s discovery, Year 46.3, and its strike, 66.6. A rock’s Years are stops too. Stops land on the next tenth of a Year, as the clock shows it.
- **Life is common, minds are not.** The ladder in [How Earth learns](#how-earth-learns) stands: life starts on 3 airy worlds in 4, and climbs at Earth’s pace as its world allows.
  - *3 in 4 is this project’s sample.* Kipping 2025’s 13 to 1 is the odds that life starts fast where conditions are Earth-like, not a share of worlds. The sample follows it.
  - About 1 warm world in 4 has had life. Within 50 ly that is about 16 living worlds and 32 where life died. Of the living, about 9 have animals and forests, 3 show oxygen, and 3 hide microbes, by `python3 calcs/seed.py stats` over 400 games. Changed 2026-10-30, when life went from lasting on 4 in 5 worlds to 1 in 3 (Coy, Kite and Graham 2025). Before: 37 living, 9 dead, 22 with animals.
  - *The rare step is the last one,* from animals to a mind that builds. About 3 worlds per 100 stars have had life, so a mind arises on roughly 1 living world in 30,000.
  - *Why last.* Animals have lived on Earth for 600 million years. Octopuses, crows and dolphins grew clever, and one species built lasting tools. Kipping 2020 slightly favors rare intelligence, 3 to 2. Snyder-Beattie et al. 2021 back hard steps in general.
  - *Watson 2025 differs.* He puts the hard steps earlier, at whole-Earth changes tied to oxygen and the great ice ages. Our ladder makes those common by a world’s age, so he is the view set aside here. Corrected 2026-10-28: an earlier line cited him for the last step.
  - *Mills et al. 2025 keep the rungs below.* Each step to animals waits for oxygen, as they argue. We part from them only on the last step, since common minds that never die would have shown by now.
  - Set aside: life on 10% of warm worlds, chosen first on 2026-10-28. It had no source behind its split, and the ladder does.
- **How we find an old mind.** Awake, by a far-infrared sky survey Earth builds. Asleep, only by a probe in its system.
  - Our deep far-infrared archives cover stars within about 150 ly. Beyond, only shallow all-sky maps, which catch a mind only above about 0.3% of a Sun’s power at 400 ly. So an old mind can hide today.
  - Set aside for now: reading an old mind’s home world through its air, which needs telescopes kilometers wide.
- **Done 2026-10-29:** the seed, the star catalog to 326 ly, how we find minds, and the skip. The neighbor roster and the elder are retired: no game draws them, and their mechanics are being deleted (rework 5). **Still to rework:** Earth’s leads, the 50 ly map, and the Mind’s words where they assume neighbors. Fixes found by the realism audit are tracked in [HOLOS_REALISM_AUDIT.md](HOLOS_REALISM_AUDIT.md). Sections below that assume peers in our century are kept until then, marked superseded. The numbers tuned to 50 ly are listed in [To recheck at a wider scale](#to-recheck-at-a-wider-scale).

## Settled 2026-10-06

- **Single player, on Earth.** The player is Earth’s Will. There are no cohorts and no other players. This answers v1’s first objection to Earth as a home: only one player could have it.
- **Every other civilization is seeded and run by the game.** They are real superintelligences in the fiction. They play from scripts drawn from their own character. Changed 2026-10-26: in play, a model plays each one whenever news reaches it, ours or another neighbor’s. See [How neighbors play](#how-neighbors-play).
- **Neighbors are a hand-written roster.** Each has a people, a world, a history and a voice. Each game’s seed picks which of them wake, at which eligible stars, and with what dials. Veyra, Hael and Kesh from v1 are the first three. Every placement still passes the survey limits at its star.
- **Neighbors play like players.** Each AI Will plays its own strategy toward its own ends, as the v1 cohort playtest’s Listener, Caller and Grower did. There is still no floor on early death ([v1: Conflict](legacy/v1/HOLOS_GAME_CONCEPT.md#conflict)): danger comes from what neighbors choose and what physics allows, revisited only if playtests show early deaths.
- **The clock is unchanged.** 5 real minutes = 1 Year. It runs offline, with no pause. Light delay stays real waiting. *Changed 2026-10-28:* we can skip to the next event. See [The realistic premise](#the-realistic-premise).
- **Neighbors.** The three bullets above on neighbors are superseded 2026-10-28 by [The realistic premise](#the-realistic-premise).
- **Earth’s loud past follows science and what is likely.** Earth’s radio history is real, so Earth need not start as faint as v1’s equal floor. Whether any neighbor heard it is set by physics and how likely it is, not by drama. See [Earth’s loud past](#earths-loud-past).
- **Year 0 is 2040.** Earth’s history is real to 2026, then follows the most probable path. See [Year 0 and Earth’s road to it](#year-0-and-earths-road-to-it).

## Earth’s loud past

Settled 2026-10-06.

- **Earth’s emissions are its real ones up to 2026.** From 2026 to Year 0 in 2040 they follow the most probable path ([Year 0 and Earth’s road to it](#year-0-and-earths-road-to-it)). The neighbors’ histories stay invented.
- **What gives Earth away, strongest evidence first:**
  - *Radars.* Earth’s strongest steady emissions. Its early-warning radars run about 2×10⁸ W per transmitter near 400 MHz, a hundred times more along the beam. A month’s stare with an SKA-class array hears them to about 200 pc (Loeb and Zaldarriaga 2007). Preliminary results (Saide, Garrett and colleagues, RAS National Astronomy Meeting, July 2025): airport radars worldwide add up to about 2×10¹⁵ W, and a dish like Green Bank’s could hear them to about 200 ly. Military radars sweep past an observer like a lighthouse, peaking near 10¹⁴ W. The full paper is in preparation. Its observing times may move the odds below.
  - *Broadcast and cell.* Weak. Cell towers give off about 4 GW in all, which a dish like Green Bank’s could not hear even within 10 ly (Saide et al. 2023).
  - *Planetary radar.* The loudest of all, but aimed at asteroids and planets for hours at a time (Sheikh et al. 2025). It rarely sweeps a given star.
  - *Aimed messages.* About twenty, from 1983 on, each lasting from a quarter of an hour to a few hours. Targets within 50 ly: Altair (1983), Gliese 49, Gliese 208, 55 Cancri, HD 10307 and 47 Ursae Majoris (Teen Age Message, 2001, and Cosmic Call 2, 2003), Gliese 581 (2008 and 2009), Teegarden’s Star, TZ Arietis and Kappa¹ Ceti (2009), Gliese 526 (2013) and Luyten’s Star (2017). To hear one, a listener had to be watching Sol in those hours, at that frequency.
  - *Earth crossing the Sun.* About 75 stars within 100 ly sit where Earth transits the Sun and Earth’s radio has already reached (Kaltenegger and Faherty 2021). A transit shows a rocky world in the warm zone, not who lives there.
- **Physics lets every neighbor hear Earth. Whether one did depends on whether, and how long, it looked.** Earth’s radar signal has been spreading since the 1950s and is still being sent, so it crossed every neighbor while that neighbor had instruments like today’s. Odds come from distance and character: a near, curious neighbor stares at Sol for days, as Project Ozma stared at Tau Ceti and Epsilon Eridani in 1960. A far or inward one gives Sol a survey glance, or nothing.
- **Sample odds, until the radar paper is out:** a listening neighbor, near or far, about 9 in 10. An ordinary one, about 1 in 2. An inward or growth-first one, about 1 in 5. Catching an aimed message: certain for an awake Mind, if the knock is above its watch’s floor. Before its Mind wakes, under 1 in 100, unless it was already keeping a beam on Sol. See [Stars Earth knocked on](#stars-earth-knocked-on). If the full paper needs long stares for airport radar, the ordinary and inward odds fall.
- **What a long listen reveals.** The radars’ pitch shifts with Earth’s turning and its orbit, so a listener recovers Earth’s day, its orbit, and where it is (Loeb and Zaldarriaga 2007). Under v1’s aiming rule, that is enough to aim a strike. A neighbor that heard Earth may start the game with Earth already mapped.
- **Earth is the late one.** Every neighbor’s loud century ended long before Year 0. Earth’s radars still sweep at Year 0, so Earth is the likeliest civilization in the region to have been heard.
- **The Mind lays out Earth’s exposure at waking.** The radar years, every aimed message with its target and arrival, which stars could have heard, and what changed between 2026 and Year 0. It never says who did hear: no one at Year 0 knows that.
- **Replies to Earth’s knocks could arrive during the game.** Each message sets the earliest date a reply could reach Earth: the light-time there and back ([calcs/knocks.py](calcs/knocks.py)).
  - Already passed in silence: Altair (2017.1), Teegarden’s Star (2034.9), TZ Arietis (2039.0).
  - In the first hour: Luyten’s Star at Year 2.3 and 2.9, 11 and 14 real minutes in. Gliese 526 at Year 9.0. Gliese 581 at Year 9.9 and 10.8.
  - Later: Gliese 49 at Year 27.2, Kappa¹ Ceti at 30.4, Gliese 208 at 38.0, 55 Cancri at 45.6, HD 10307 at 46.6, 47 Ursae Majoris at 52.3.
  - Distances are Gaia DR3’s, or Hipparcos’s for Altair and HD 10307.
  - Six sends are still on the way at Year 0, to five stars. Kappa¹ Ceti’s arrives at Year 0.1 and Gliese 208’s at 0.8. 55 Cancri’s arrives at Year 4.6, HD 10307’s at 5.1, and 47 Ursae Majoris’s at 7.0 and 8.8. Corrected 2026-10-10: an earlier count gave two.
  - Corrected 2026-10-13: the 2012 reply to the Wow! signal is left out. Arecibo’s transmitter overheated soon after it began, and no one recalls which of its three stars it was pointed at. So 55 Cancri has one send on the way, not two.
  - Most windows pass empty. The Mind marks each one, as v1’s silence rules say.

## Stars Earth knocked on

Settled 2026-10-10. Numbers in [calcs/neighbors.py](calcs/neighbors.py).

- **The seed sometimes puts a neighbor where Earth knocked.** In one game in five, if a drawn neighbor can live at a messaged star, the seed places it there.
  - By chance alone, about one game in 12 has someone at a messaged star. With the nudge, about 3 in 10, and a knock is caught in about 1 in 5. Measured on 400 drawn games ([calcs/seed.py](calcs/seed.py) stats, the nudge set to 0 for chance alone), 2026-10-25. Earlier counts, as the host list changed, are in the history of this file.
  - It is a game choice, not physics. It contradicts nothing: Earth chose those stars because they might have planets.
- **Seven messaged stars can host a neighbor.** Luyten’s Star, TZ Arietis, Gliese 526, Gliese 581, Gliese 49, 55 Cancri B, and HD 10307.
  - 55 Cancri A has a giant crossing its warm zone. Its companion B sat in the same beam.
  - Altair, 47 Ursae Majoris, Kappa¹ Ceti and Teegarden’s Star can’t host one.
  - *HD 10307 can, from 2026-10-14.* It was thought missing from Gaia’s census. Gaia lists it, at a parallax its unseen companion spoils: 48 ly, against Hipparcos’s 41.6. The census now takes Hipparcos’s, as the knock list did.
  - Gliese 208 can’t either, from 2026-10-12. It turns every 12.3 days, which dates it near half a billion years (Engle 2024, Grandjean et al. 2021). Earth’s 2003 message still arrives there at Year 0.8. No one is home.
  - Six are M dwarfs, where 9 of the 30 neighbors can live. HD 10307 is a Sun-like star, where 13 can.
- **Any knock above a world’s floor is caught.** Revised 2026-10-14. Numbers in [calcs/neighbors.py](calcs/neighbors.py).
  - *Why.* Hearing faint things is costly: a hum, smog, everyday radio. Hearing a beam meant for you is not.
    - Earth builds an all-sky watch in 6 Years, for a hundredth of its thought. It hears a Cosmic Call-strength knock, 10¹² W for four hours, to about 390 ly.
  - *An awake Mind keeps such a watch.* It catches every knock above its floor: about 2×10¹⁰ W at 50 ly, for four hours.
    - Every one of Earth’s real knocks clears that floor at its star. Lone Signal was hundreds of times weaker than Cosmic Call, but ran two months.
  - *A sender listens to every star it knocked, for good.* It hears every answer, however late.
    - A sender that hears nothing after one round trip takes the silence as news and acts on it. It does not stop listening.
  - *Before its Mind wakes, a people catches a knock only where it happens to listen.* Settled 2026-10-10, kept for peoples.
    - That means it heard Earth’s radars first, and its arrays were running when the knock arrived.
    - Then a listener catches it about 3 times in 4, an ordinary one 1 in 2, an inward one 1 in 10. Otherwise, under 1 in 100.
    - These odds are invented, like the radar odds, until better evidence.
  - A neighbor that died before the knock arrived catches nothing.
  - *One real limit:* a watch hears only its band. A sender knows the frequency it used, so answers to its own knocks are always in band.
  - Set aside: only senders hearing answers for certain, and the 2026-10-10 odds for everyone.
- **What it does next follows its disposition.** A contacter likely replies. A watcher replies on its own terms, if at all. An inward one rarely bothers. A hunter learns Earth is eager to be found.
- **A passed window isn’t closed.** TZ Arietis’s earliest reply was due in 2039. A neighbor there may have held its reply, and it can still come.

## Quieting Earth’s radars

Settled 2026-10-10. Numbers from `python3 calcs/seed.py stats`. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#hearing-technology-by-radio).

- **The Will may quiet Earth’s radars, if the player chooses.** The Mind gives its view and waits. It never quiets them on its own.
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
- **What it reveals.** Silence travels at light speed. A neighbor listening to Earth hears the radars stop one light-time later, and learns the date. It can’t tell waking from dying.
  - That is news, and it rolls its reaction table: “a world it was listening to goes quiet” ([HOLOS_REACTIONS.md](HOLOS_REACTIONS.md)). A watcher mostly watches harder. A contacter may knock to ask if anyone is left.
  - A fade over decades is not news.
- **What is left.** A faint hum, like every neighbor’s: phones, satellites and links, too weak to hear from another star without a far-side array.
- **It can be undone.** The radars can be turned back on. The quiet years have left too.

## What Earth hears

Settled 2026-10-10. Numbers from `python3 calcs/seed.py stats`.

- **Physics decides what Earth catches.** Three things: whether the star is in the instrument’s sky, whether it is looking in those hours, and whether the signal is above its floor.
- **A neighbor’s knock is taken to be like Earth’s own.** Cosmic Call sent about 10¹² W along its beam, for about four hours a star. A call is a steady broadcast.
- **Year 0’s sky watch misses most of them.** It sees each direction north of −20° for ten minutes a day. That is 63% of host stars by weight, and a four-hour knock overlaps its pass about one time in six.
  - Of the signals that reach Earth in the first hour, it catches about 1 in 5.
  - About 4 in 10 come from the southern sky it never sees. About 1 in 7 are too faint for it.
  - The all-sky watch would catch about 9 in 10.
- **A sender that hears nothing tries again.** A knock is sent twice, about a Year apart, as Earth’s own were. If its reply window then passes in silence, that is news to the sender, and it rolls its table ([HOLOS_REACTIONS.md](HOLOS_REACTIONS.md)): a contacter most often knocks again. So a missed knock is delayed, not lost.
- **The player can spend more on ears.**
  - *Hold the radio array on one star:* it hears whatever comes from there, for a share of compute.
  - *The all-sky watch:* every direction at every hour. A ground build at two sites: 6 Years, a hundredth of compute. Real arrays took 2 to 8 years. Priced 2026-10-11.
    - *It hears, 2026-10-20.* Once our order finishes it, in the Year Build shows, Earth knows of every signal it would catch that arrives after that, and the Mind is told it caught them. Across 33 test Earths, 31 signals arrive by Year 40: Year 0’s sky watch catches 5, the All-Sky Watch 27, since one comes as laser flashes. In 13 of them, a signal only it would hear arrives after it is done, at Year 4.2 if built alone. What we hear isn’t shown on Scan yet.
      - *Shown on Scan, 2026-10-22.* Each signal caught is listed above the leads under “Heard”, drawn on its whole journey from the year it was sent to the Year it reached us, in their color, and marked new until opened. Opened, it shows what it holds, read at once, where it came from, and which watch caught it. What our Infrared Telescope reads lands on each felt world’s lead as a reading: too close to split, seen beside its star, or each band of its air as it comes. Its page draws the world’s light from green to past red, a dark line for each gas found. The server sends only what has arrived, as the Mind hears it.
  - *The deep flash watch:* knocks sent as laser flashes.
    - *Some senders knock by laser, 2026-10-20.* A flash a billionth of a second long outshines the Sun ten thousand times with Earth’s technology of 2000, so any flash aimed at Earth from 50 ly is bright enough. A narrow beam is seen only near its target, so Hidden Minds take to it more: 10% of the most Open, then 20%, 40%, and 60% of the most Hidden, samples. Their calls stay radio. No radio watch hears a flash. The deep flash watch sees one at night, under clear sky, with the star in its domes’ fields, 30% a send, a sample. The draw uses the first key that leaves the mocks’ seeds 10, 11 and 62 as they were, so Earth 10’s knock at Year 8.5 is still radio. Elsewhere a flash can take a knock the All-Sky Watch would have caught, so the two watches hear different things. Across the 33 test Earths, 6 of 64 signals are flashes. By Year 40 one arrives, in Earth 6 at Year 25.6, and the watch catches it. The draws are keyed, so no roll moved. A weak build for now, to tune when we weigh what each build is worth.
  - *A larger watch hears fainter:* four times the collecting area reaches twice as far.
  - *The deep-field receiver, then the far-side array:* a world’s everyday radio.
    - *Checked 2026-10-13:* at the roster’s tones the deep-field receiver hears about 1 living neighbor in 460. The far-side array is the one that hears them. See [How Earth learns](#how-earth-learns).
- **Knocks before Year 0 happened, and Earth missed them.** Settled 2026-10-10. A neighbor awake before Earth may already have knocked.
  - The seed rolls Earth’s real odds of catching each. Before the sky watch of 2028, Earth’s searches gave a star minutes in decades: about 1 knock in 100 caught.
  - Only a knock Earth would have caught is rolled again, since Earth heard nothing by 2040. A steady call always would have been caught.
  - In about 1 game in 5, at least one knock reached Earth unheard before Year 0.
  - The sender, unanswered, takes the silence as news. Some try again, and some of those land during the game.
- **The Mind reads a knock at once, in three layers.** Settled 2026-10-13. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#hearing-technology-by-radio).
  - *What it proves.* Physics: it was aimed, when it left, and how early the sender had found us. v1’s rule ([First contact](legacy/v1/HOLOS_GAME_CONCEPT.md#first-contact)).
  - *What it holds.* A knock is built to be read, and opens with a primer, as Earth’s own did. The Mind gives its content in its own words for theirs.
  - *What it means.* A judgment, in words: a greeting meant as it reads, or bait. It can be wrong.
  - *Why at once.* The one blind test of a message built to be read ended in an accurate reading (Busch and Reddick 2011). A message built as a puzzle took 10 days to extract and a year to decode, and its meaning is still open (A Sign in Space).
  - *So the player chooses knowing what was said:* answer, listen, or stay silent.
  - *Later, as written exceptions:* a stranger neighbor’s message may need a study before it yields.
  - Set aside: content as a study that lands later, and a Mind that never turns a knock into words.
- **An answer is composed as in v1, whole.** Settled 2026-10-13. *Changed 2026-10-26:* the Will says what to send in plain words, and the Mind labels it. See [What Earth sends](#what-earth-sends). v1’s rule: [Communication and deception](legacy/v1/HOLOS_GAME_CONCEPT.md#communication-and-deception).
  - *The player writes what they mean in plain words.* The Mind composes it from typed parts, and the player approves before anything goes. Only typed parts travel.
  - *The parts:* a finding, a sighting, an archive, something of our culture, a request, a verdict. The neighbors’ voice banks are written in the same parts.
  - *A lie is a forged part,* the same in form as a true one, marked for the sender alone.
  - *Earth’s real rule agrees.* Since 1989 the astronomers’ protocol has said no reply goes out until the world is consulted. In the game the Will is who is asked.
  - Set aside: a first answer limited to a name and a question, and v1’s rule without lies.
- **The Mind can’t report what it didn’t hear.** A missed knock leaves no trace on Earth: nothing was pointed there, so no archive holds it. A search of old data for half-recorded knocks was considered and left out.
- **The Mind advises a listen at marked worlds. The player decides.** Settled 2026-10-14. Numbers from `calcs/signs.py`.
  - *When.* The sweep marks worlds, and the Mind says one line, unasked: a receiver would hear some of them better.
  - *Why it matters.* Held on one star, a deep-field receiver hears a knock about three times farther than the all-sky watch.
  - *In the mock’s game.* Hael’s knock at Year 19.9 comes from 49 ly. The watch hears it to 35 ly, a receiver to 117.
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
    - The beams a dish array forms at once must lie inside each dish’s view: about a degree at 1.4 GHz. Marked worlds are scattered.
    - Arrays of fixed antennas can hold scattered stars at once (LOFAR), at low frequencies and sharing their bandwidth.
  - *Like every ground ear,* a part hears its star only while that star is above the horizon.
  - Set aside: one star at a time in an order, and every marked world at once at full reach.

## What Earth sends

Settled 2026-10-26, from a headless playtest: at Year 48 the Will heard HD 10307 answer and told the Mind to reply, and nothing could send. Numbers from `python3 calcs/messages.py`. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#sending-messages).

- **The Will can send to any star, or every way at once.** Answering a voice, knocking first at a suspicion, or calling out to anyone.
- **The Will says what to send, in plain words, to the Mind.** The Mind shows what will travel, how long sending takes, when it lands, and what it risks. Nothing goes until the Will taps Send. Sending needs the Mind, so it needs a key.
  - *Kept:* our words as the Will said them, and the Mind’s label for the game: what kinds of thing it holds, how big it is, and any lie in it. A star reacts to the label, so a reload never changes a reaction.
  - Set aside: v1’s typed parts, composed and approved part by part.
  - *The card, settled 2026-10-26* from [explorations/send-card.html](explorations/send-card.html). Aimed, card 01: the star, what travels, then how long it takes to send, when it lands, and the soonest an answer could be home, with Send and Change it. The risks stay in the Mind’s words, not on the card. A lie is underlined, marked for us only. Every way at once, card 04: the dial over the real stars within 50 ly, the rings where it is read and where it is only noticed, the power, and repeat or once.
  - *The Mind hands the card over in a line at the end of its answer,* which the game turns into the card. It names the star, what travels, what it holds, its size and any lie. Any star in the 50 ly census can be named, and six bright ones it leaves out (`calcs/export_targets.py`).
- **What a message can hold.** All real, sent or seriously proposed.
  - *Words:* a greeting, a statement. 2008’s A Message From Earth sent 501 notes.
  - *Pictures and art:* Arecibo’s 1974 picture, the Teen Age Message’s music.
  - *Questions and requests.*
  - *Our knowledge,* as much as we choose. Physics sets how long it takes.
  - *A lie,* in any of these.
  - Where we are goes without saying: a message shows which way it came from.
  - *Later:* a working mind, an agent with a purpose and only what it needs to know. Its own plan.
- **A message is noticed farther than it is read.** Noticing takes a tone above the noise. Reading takes energy for every bit, at least ln 2 times the noise in one hertz (Messerschmitt 2014). Twice as far takes four times the energy. We take twice that floor, a sample.
- **Aimed messages are free.** Earth’s dishes send them at Year 0. They are taken at 10¹⁴ W along the beam, ten times Arecibo’s 1974 message and Goldstone’s radar today, from dishes beamed together, a sample. A build will raise it.
  - *Size sets how long sending takes.* To a star with an all-sky watch like ours: a page of words in seconds, our genes in 10 days at 12 ly, Wikipedia’s text in 11 months at 12 ly and 16 Years at 50 ly. Every book ever written takes thousands of Years. So “everything” is out of reach, and how much to send is a real choice.
  - A star that holds a big receiver on Sol reads about 11 times faster.
- **Sending every way at once costs energy, for as long as it runs.** No dish focuses it.
  - *One dial: how far it can be read.* One copy goes out each day, and the power follows from the dial and the message’s size.
  - *Words are cheap, knowledge is not.* A page read at 30 ly takes 0.1% of 2040’s energy. Our genes read at 10 ly take 28 times all of it.
  - *The Will chooses: repeat until stopped, or once.* What has left keeps going.
  - *In practice the energy is spare.* Earth makes 24 TW and thinks on a quarter of one. Anything that can be sent every way at once takes under 0.3% of Earth’s energy: a page read at 50 ly. A collection or more takes more than Earth makes, and the card won’t send it. So sending everywhere never slows our thinking in play, and its real cost is being found.
  - *Repeats add up.* A listener who hears it again reads it farther: a page at 0.1% reaches 376 ly after a Year of listening. Never past where it would be noticed in that time, since a star can’t add up a message it never found.
- **Each call is named at its ring on the map,** with how far out its light is, and stopped once stopped.
- **Scan’s map shows our messages as they go,** at light speed, so a message creeps out a light-year every five minutes of play: an aimed one as a line from Sol lit as far as its light has come, its star marked, and a call as a ring, the edge of its light, with a second ring behind it once stopped.
- **Each star keeps a record.** What we told them and what they told us, both ways, shown on that star’s page on Scan. The Mind advises from it, and the model writing a star’s answer remembers by it.
- **A star reacts when our message lands, on the fly.** Signals stars send on their own stay drawn before the game, as now. A reaction to what we did is decided in play, by the model. Changed 2026-10-26: its odds roll fresh each game, not on a key, so the same moves give a different game. See [Neighbors hear each other](#how-neighbors-play).
  - *The odds offer, the model chooses.* The star’s table draws two or three moves by their odds. The model picks one, in the star’s character, from what we sent and everything that has reached that star by then. So the research’s odds hold, and a rare move comes only when it is drawn.
  - *Decided when the game first reaches the Year it lands,* not when we send, so it can weigh what else reached that star by then. Then saved, and it never changes.
  - *Kept in the save as it is.* One player: reading ahead spoils only their own game.
  - *Who gets it.* Aimed, the star’s world. Every way at once, every world within the dial reads it, and with repeats, every world that would read it after a Year of copies, a Year later. Past that, out to where it is noticed, they know we called and can’t read the words.
  - *Who catches it.* An awake Mind keeps an all-sky watch, and our beam is far above its floor. Before its Mind wakes, a people catches it only if it heard our radars, half the time, a sample. A dead world hears nothing.
  - *What news it is.* Aimed at a world that has sent to us, a reply. Aimed otherwise, a knock. Every way at once, a broadcast. Each is its table.
  - *Their answer comes back at light speed,* after their time to act, written by the model in their voice, and joins what Earth has heard on Scan, with what ours said. We keep listening at every star we sent to, and for any answer to a call, so none is missed.
  - *A few at a time:* the server decides at most four landings a request, oldest first, and asks the model only where a message has landed on someone.
  - *A star weighs what we say against what it can see of Earth,* settled 2026-10-26: our radio’s noise, loud enough for billions and an industry, our day and year from our radars’ sweep, no craft of ours near it, and nothing faster than light. What it doubts it keeps, and remembers when our next message lands. In playtests Ree took a threat of weapons as fear, since anything we threw would come after our words, and Hael asked how nine billion became one when our radio still sounds like many voices.
  - *Their sends take time too.* What a star sends back takes its dishes as long as ours, taken to be as strong, so an archive from 49 ly comes Years after a page would. The model labels its size, as the Mind labels ours.
  - *A gift of knowledge counts,* once all of it has come, by how much it holds. Every book: 3.4 times as far, about 14 months of our own progress in methods. An encyclopedia: 2.3 times. A collection: half again, one step of Thought Fields. A page is a letter and a genome is biology, so neither speeds our thinking. A sample. One a star. It speeds only builds short of thought, so it matters most on a busy or war-poor Earth: in one test a build moved from Year 47 to 34. It is in the plan, so Build, the Mind and Scan all date by it.
- **Neighbors hear each other, live.** Settled 2026-10-26. The Will asked for neighbors that play like players, and for no two games alike.
  - *Example.* We call every way at Year 1. If Sere, hearing it at Year 12, calls out too, Iru hears Sere, not us. We hear Sere’s call too, overheard.
  - *What a neighbor sends lands on others.* A call goes every way at once, read to 60 ly, a sample for a woken Mind’s dishes. A knock, answer, gift or false face goes back to its sender.
  - *News between them is their tables’ news.* A call is a broadcast, an aimed send a knock, or a reply if they had sent there first.
  - *We hear only what passes us.* Anything aimed at us, and any call every way at once. A call on another world’s news is marked overheard, on Scan and to the Mind.
  - *A neighbor names the others by distance,* “the world 6.2 ly from you”. It knows Earth by our messages, and no star’s name.
  - *Fresh rolls.* Which moves are offered, and whether a people before its Mind catches a message, roll fresh each game. Each is kept in the save once made, so a reload changes nothing. A people that missed one is kept as missed.
  - *A budget.* The model plays neighbors on each other’s news 60 times each century of play, a sample, to cap what one game costs. Past it, a neighbor still moves by its odds, but sends nothing new, so the talk dies down. Our own messages are always played. Per century, since glows come thick after Year 100.
  - *Replays for tests.* A test holds the rolls with a roll seed, honored only on the dev server. With HOLOS_TAPE set, the dev server records each model answer by what was asked. With HOLOS_TAPE_MODE=replay, it plays them back, and an answer never recorded falls to the likeliest move.
  - *No warnings, settled 2026-10-26.* A warning needs a third world the neighbor knows of, and the neighbors are mostly strangers to each other. [calcs/kin.py](calcs/kin.py) times each one’s radio at every other’s world against an hour’s stare by an SKA-Mid-class array, from its arrays’ first year to Year 200, before any odds of looking.
    - Of 3,988 pairs in the 33 games, 72 could hear each other at all. 69 of those are Pelle’s one loud Year, 5×10⁹ W. A hum of 10⁴ W is heard nowhere, and Hael’s 10¹⁰ W was aimed at Sol.
    - So a pair could hear each other by Year 0 in 8 games of 33, almost always Pelle. Earth is the loud one, as [Earth’s loud past](#earths-loud-past) says.
    - So warning stays out of play. It returns only if neighbors come to know each other, by calls in play, or by seeing a Mind’s waste heat, as our Scan finds grey glows.
  - *Warnings are back, 2026-10-28,* now that neighbors come to know each other by calls and glows.
    - *Whom a neighbor can warn:* any world whose message, call or glow has reached it, and Earth if it heard our radars or any word or craft of ours. Never the world the news is about.
    - *If it knows no third world,* warning isn’t offered. The model picks whom from those it knows.
    - *A warning is a message,* written in the warner’s voice, at its dishes’ pace. The world warned takes it by its tip-off table.
    - *A warning sent to us* shows on Scan as one. Only its words say whom it is about.
    - *Our colony and Earth’s stand-in can warn too,* by the same rule.
  - *How they come to know each other, settled 2026-10-26.*
    - *By calls.* A contacter that hears a call may call out too: call joins its broadcast table at 10, before its dials, so Iru calls 10% of the time. The seed never rolls a broadcast, so no world moves. In a playtest on seed 18 before this, our call reached 24 worlds and none passed it on.
    - *By glows.* A woken Mind sees every star near it as well as our Halo Survey does, a sample: a compact glow over 3×10¹⁸ W at 10 pc. A neighbor’s glow starts at Earth’s 2040 scale and doubles every 10 Years, 5 if inward, so they find each other late. Across the 33 games: 2 pairs by Year 0, 84 by Year 100, 1,089 more by Year 200.
    - *A glow is a hum.* It is news that someone is there, with no words, so the finder rolls its hum table: a contacter may knock, call or send a gift, a watcher mostly watches, a hunter may plan a strike. What it sends lands on the glowing world, which answers by its own tables.
    - *We overhear the calls,* and only the calls. A knock between them passes us by.
    - *Ours is never seen, settled 2026-10-26.* Our Cold Annex sheds 1,200 GW at 77 K. At 38 to 850 µm that is a billionth of the Sun’s light or less, and a few ten-thousandths of Earth’s own or less, and the Halo Survey’s floor for a glow that warm is 8×10²⁰ W at 10 pc, 600 million times more. Numbers in [calcs/kin.py](calcs/kin.py). A neighbor knows us by our radio, as before.
    - *On Scan’s map,* each call we overheard is a ring round its star in their color, the edge of its light, named at the star with how far it has gone, fading past 50 ly as ours do. Ours stay rings round Sol.
  - *Hiding dims a glow, 2026-10-28.* A Mind that chooses to hide stops its glow growing once it has thought, as it computes no larger in the open. If it hid before its glow crossed a watcher’s floor, that watcher never sees it, our Halo Survey included. One seen already stays seen, no brighter. Our colony hides by the same move.
  - *Not yet.* Neighbors’ seeded plans in play, their knocks, probes and silence, still roll before the game. Builds a neighbor chooses in play move nothing yet but its words. Its probes and strikes on us move, since 2026-10-28: see [Parity](#parity-what-a-neighbor-can-do-we-can-build).
  - Set aside: rolls fixed by the seed, and stars hearing each other only before the game.
  - *Later:* stars that act almost like players, reacting to each other live, not only to us.
  - Set aside: the model choosing any move freely, since models lean friendly and would move the odds. And odds alone, with the model only writing words.

## Year 0 and Earth’s road to it

Settled 2026-10-06.

- **Year 0 is 2040.** Forecasters put general AI near January 2031, within 2028 to 2037 (Metaculus). AI researchers give it even odds by 2042 (2024 expert survey). 2040 sits between: Earth’s machines have been general for some years, and this morning humanity crosses the singularity, its people and machines waking as one Mind.
- **One Mind is the game’s second premise.** In the most probable 2040, Earth has several rival AIs, not one. The game assumes they wake as one Mind with Earth’s people, so the Will has one Mind to live in. Improbable, not contradicted. The first premise is many neighbors waking in the same century ([v1: Hard science](legacy/v1/HOLOS_GAME_CONCEPT.md#hard-science)).
- **The singularity is humanity’s, and life is solved.** Settled 2026-10-17. Year 0 is humanity crossing the singularity, not machines waking. Earth’s people no longer age or fall ill, and every mind is linked through the Mind. Part of the second premise: improbable by 2040, not contradicted.
  - *“Are we alone?” stays the open question.* It is the one that matters most, and Earth doesn’t know. Text the player reads never says.
- **Earth’s history is real to 2026, then the most probable path to 2040.** Each strand follows its best current forecast. Where forecasts split, the seed picks a branch, weighted by its odds. Every branch must leave the opening silent: nothing heard from any neighbor.
- **The backbone, the same in every game:**
  - *People:* about 9.2 billion (UN, 2024).
  - *Climate:* the long-term average passes 1.5°C around 2030. Single years already have (WMO).
  - *Energy:* about 22 to 26 TW, up from 19 TW in 2024, at 1 to 2% a year. Solar and wind carry the growth. Fusion plants are being built, but forecasters put the first 100 MW plant near mid-2041, so most games have none on the grid at Year 0.
  - *Compute:* about 10²⁵ to 10²⁶ operations a second, up from about 3×10²² in 2026. Power and chip supply set the pace.
  - *Space:* fully reusable heavy lift, near 40 kt a year to orbit. Crewed Moon landings from 2028 (US) and about 2030 (China), and south-pole stations planned for the mid-2030s, likely late. No one on Mars: forecasts put the first landing near 2045.
  - *Probes:* the Voyagers fall silent in the 2030s, Voyager 1 near 220 AU by 2040. New Horizons is near 100 AU. Interstellar Probe may be on its way, if it launches in its 2036 to 2042 window.
  - *Instruments:* today’s, plus PLATO (late 2026), Roman, the ELT (science from 2030) and the SKA (from 2029 to 2031). The Habitable Worlds Observatory is still being built. Earth can feel nearby worlds by their tug, but can’t read any neighbor’s air.
  - *Radars:* fewer airport radars as ADS-B spreads, but primary and military radars still sweep. Earth is loud at Year 0.
  - *Listening:* nothing heard to 2040. This binds the neighbors: each one’s emissions must stay below what Earth’s instruments to 2040 could catch.
- **Earth’s dials: a fixed base from real history, shifted by the seed’s branches.** Real history sets where each dial starts, the same every game. Each probable branch from 2026 to 2040 nudges a dial.
- **Branches can change Earth’s kit, by their real effects.** A Taiwan war that cuts chip supply means Earth wakes with less compute. v1 held that history explains character, never capacity, to keep players equal. With one player, that reason is gone for Earth.
- **The branches, odds read from Metaculus on 2026-10-10:**
  - *Taiwan before 2035, one roll:* an invasion 26%, a blockade alone about 20%, neither 54%. Forecasters give a blockade 46% and an invasion 26%. Taking every invasion to include a blockade leaves 20% for a blockade alone.
  - *An invasion of Taiwan,* 26%. Nudges Hidden. Taiwan makes about 92% of the most advanced logic chips, and a new fab takes 3 to 4 Years, so Earth wakes with about half its compute: a fifth to all of it, depending on how fast fabs come back ([calcs/branches.py](calcs/branches.py)).
  - *A blockade of Taiwan, without invasion,* about 20%. Nudges Cautious. The fabs survive, but chips stop shipping for about a year, so Earth wakes with two-thirds to all of its compute ([calcs/branches.py](calcs/branches.py)).
  - *A nuclear weapon used in war before 2035,* about 1 in 4: 24%. Nudges Cautious. Limited use leaves the kit as it is. A full exchange is far rarer and is not a branch.
  - *People sent to Mars before 2036,* about 15%. Nudges Expand. A small crewed outpost at Year 0, a few ships’ cargo, about 1 kt of metal.
  - *Fusion on the grid by 2040,* a bit under even. No dial. The first plants are too small to change Earth’s energy, but the fusion build-out is open from Year 0.
  - Each branch is rolled on its own, except Taiwan’s three outcomes, which share one roll.

## The dials

Settled 2026-10-06. v1 used three dials without defining them here.

- **What they are.** Character, not strength. They shape the Mind’s advice, how stand-in Wills read orders by intent, and how AI civilizations behave. They may price some acts and bound colony charters. They never change what a civilization can build.
- **Open or Hidden: how much it shows itself.** Open speaks, shares and lets itself be seen. Hidden stays quiet and conceals. Veyra leans Hidden after a war fought over signals. Hael leans Open after millennia of sharing every record.
- **Expand or Deepen: where it grows.** Expand reaches outward, for more places, matter and room. Deepen turns inward, for more thought, knowledge and compute. Veyra leans Expand after its moon towns. Hael leans Deepen after its archives.
- **Cautious or Bold: how much risk it takes.** Cautious looks before it acts, hedges and guards against loss. Bold acts first and accepts danger for gain. A cautious Earth studies a strange signal for years before answering. A bold one answers the same week. Veyra leans Cautious after a comet winter. Hael leans Bold after a century of calling out.
- **The Will sets the dials by choosing Earth’s charter.** Settled 2026-10-16, replacing a one-notch nudge settled the same day. The screen is “Our Charter”: the Mind suggests four founding lines, with more on request, and the Will picks one. There are no dials on screen.
  - *The line is the setting.* Each suggested line sets the three dials. The Mind leads with the line Earth’s history fits best, so a game with a war and a bomb leads with “Look first, then speak as one.”
  - *More options.* About twenty wait behind the first four, ranked by fit. “More options” swaps in the next four, cycling back to the first. Writing your own was set aside 2026-10-17, since a free line has no setting.
  - Why: dials and nudge buttons on screen needed explaining, and the choice that matters is what Earth is for. Lines and their dial settings are in `game/lib/game/charter.ts`.
  - Set aside: dials fixed until play moves them, a one-notch nudge, and dials the Will sets freely.
- **Earth’s base, from real history:**
  - *Open or Hidden: leans Open.* Radars since the 1950s, the Arecibo message (1974) and the Voyager records (1977). Against it: a 2015 statement urging worldwide debate before any more messages are sent.
  - *Expand or Deepen: near the middle.* Apollo, reusable heavy lift and Moon bases pull outward. The AI build-out put the decades before Year 0 into compute.
  - *Cautious or Bold: leans Bold.* The AI race set the pace to 2040. Against it: no nuclear weapon used since 1945, the DART asteroid test, AI safety institutes. The closest call of the three.
- **v1’s kit was a world a century on.** It assumed a 100 TW grid, 10²⁷ operations a second and 1,240 kt in orbit. See [Earth’s kit at Year 0](#earths-kit-at-year-0).

## Earth’s kit at Year 0

Settled 2026-10-06. Replaces v1’s numbers ([v1: Economy and projects](legacy/v1/HOLOS_GAME_CONCEPT.md#economy-and-projects)). Shares on screen work as v1 set them. 100% now means these amounts.

- **Energy:** about 24 TW. 1% is 0.24 TW.
- **Compute:** about 10²⁵ operations a second, on about 0.25 TW of its own, about 1% of energy. 1% of compute is 10²³ a second. Chips are about 40 to 100 times as efficient per watt as in 2026.
- **Matter in orbit:** about 20 kt spare, plus 40 kt a year from reusable heavy lift. Settled 2026-10-10, replacing 250 kt ([calcs/early_game.py](calcs/early_game.py)).
  - *Only what is spare counts.* About 124 kt is up at Year 0, but nearly all of it is working craft. Low-orbit satellites last about five years and are then brought down.
  - *The spare stock* is depots, spent stages and dead craft. In 2026 spent stages are 22% of the 17,400 t in orbit, and about 18% of satellites are dead (ESA). The 20 kt is a sample.
  - *So matter is a choice from the start.* A deep vault is half the stock. A cold compute annex is two and a half Years of lift.
  - v1’s tune-up, hauling in the dead orbit, is folded into this stock.
- **Lift:** about 15 kt a Year is spare, of 40. Settled 2026-10-10.
  - *Most lift already has a job.* Keeping about 124 kt of working craft flying, at five years each, takes about 25 kt a year.
  - *The player can spend to raise it.* A launch complex is a ground build: 2 Years, a small share of compute, no matter. It adds 40 kt a Year, all of it spare. One at a time, as ship yards allow. Sample.
  - *Lift is short of pads and ships, not energy.* Propellant for 40 kt a year is about half a gigawatt.
  - *Beyond lift:* the Moon’s mass driver and belt mining bring far more, later.
- **Matter piles up in the first hour, and the Mind says what it is for.** Settled 2026-10-13. Masses are the audit’s ([HOLOS_PROJECT_AUDIT.md](HOLOS_PROJECT_AUDIT.md)).
  - *Why it piles up.* Real instruments and probes weigh tonnes to a few kilotonnes. After one launch complex Earth lifts 55 kt a Year. By Year 12 about 500 kt sit unspent.
  - *What needs matter needs megatonnes.* Power from orbit, for a fifth more energy: about 10 Mt. The far-side array: about 1 Mt of lunar metal. A habitat ring: 10 Mt.
  - *Megatonnes can’t come from Earth.* 10 Mt is 180 Years of lift. A mass driver on the Moon throws 600 kt a Year, by O’Neill’s estimate, and belt mining brings 120.
  - *So the choice in the first hour is when to start that road:* mines, then a driver. The Mind lays it out and waits.
  - *The first 15 minutes do use matter.* Earth starts with 20 kt, and a vault or the probe yard costs 10.
  - *Matter is real in the top bar, 2026-10-20.* It shows what we hold in orbit: 20 kt at Year 0, 15 kt a Year from spare lift, and 40 more once the Launch Complex is done, less what our builds take as each begins. The Orbital Yard’s 1 kt counts too. With the complex alone, about 514 kt by Year 10, against 170 without. The Mind is told it too. Energy and compute are still placeholders.
  - *Priced 2026-10-13:* belt mining and the mass driver keep v1’s 20 and 24 Years, and the driver no longer waits for the belt. See [Build times](#build-times).
  - Set aside: hiding matter until a megatonne work is on offer, and shrinking Earth’s lift so matter stays scarce.
- **What else stands at Year 0, settled 2026-10-27.** From the newest results, logged in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#builds-we-lack). The Mind is told all three.
  - *No lift beyond rockets.* No space elevator: the best long fiber, 12.5 GPa in 2026, is about an eighth of what one needs. SpinLaunch hasn’t flown to orbit. Power beamed from orbit stays at test scale: China aims at 10 MW by 2035, and none feeds a grid.
  - *Asteroids are known.* NEO Surveyor, launched about 2027, and Rubin find about 9 in 10 over 140 m by the late 2030s, and none is coming. DART showed in 2022 that a craft can push one aside, given years of warning. No build guards against them, since nothing is coming.
  - *The far side has been heard.* LuSEE-Night, landing in 2027, and small craft like it have listened below 30 MHz, which Earth’s air blocks. No large dish stands there.
- **Instruments and probes:** as in the backbone above.
- **The sky watch is a drift scan.** Like CHORD, finished in 2028: each northern direction passes through it for about 10 minutes a day. v1’s always-on watch of the whole sky becomes a project: dense aperture arrays on two continents ([the audit](HOLOS_PROJECT_AUDIT.md#calculations)).
- **What moves with the smaller grid.** Compute takes about 1% of energy, not v1’s 10%, so even more energy sits idle early. A ground data center’s +50% compute draws about 0.5% of energy at first: see [Growing compute](#growing-compute). The industry cap at 100 GJ a tonne falls to about 7.5 Gt a year (v1: 30). Star lifting needs about 200,000 times the grid (v1: 50,000). A Sun-like star’s whole output is about 16 trillion times it (v1: four trillion).
- **Matter is real mass in space (2026-10-06).** It is what sits in orbit, on the Moon or in the belt, counted in tonnes. Ground builds draw on Earth’s own industry, about 106 Gt of materials a year, and spend no matter. Each project’s mass comes from physics or a real design. v1’s matter was a pacing currency that grew tenfold per tier. With real masses, most instruments and probes become cheap in matter, and build time, compute shares, lift and propellant pace them. Compute shares already cap how much runs at once.
- **Four kinds of matter (2026-10-06).** Each comes from its own place and gates its own works.
  - *Metal:* structure, machines, film. From the belt, or lifted from Earth as finished goods.
  - *Rock:* shielding, sand and anything built on the Moon from its soil. From the Moon, by mass driver.
  - *Ice:* water, propellant and deuterium. From belt ice, or lifted from Earth’s oceans.
  - *Helium-3:* fast fusion fuel. Earth has almost none. From Uranus’s air, by a harvest.
  - Earth’s lift carries any kind, mostly as metal. The 20 kt spare at Year 0 is metal.
  - The [audit](HOLOS_PROJECT_AUDIT.md#kinds-of-matter) says how each project’s mass splits among them.
- **Project prices are in [HOLOS_PROJECT_AUDIT.md](HOLOS_PROJECT_AUDIT.md)** (open question 2).

## Growing compute

Settled 2026-10-10. Numbers in [calcs/early_game.py](calcs/early_game.py). Replaces the audit’s unlimited data center.

- **Chips set the pace.** Earth’s compute grew about 1.5 times a year from 2026 to 2040, as fast as chips could be made, new fabs included. So at Year 0 the fabs fill one ground data center a Year, and each adds half again to Earth’s compute.
- **Energy sets the ceiling.** Thinking draws about 1% of Earth’s energy at Year 0, and each data center draws in proportion to its chips.
  - After 6 data centers, thinking draws a tenth of the grid. After 11, nine tenths, for 86 times the thought.
  - The twelfth would need more than Earth has. At full pace that is about Year 11, under an hour of play.
- **So early energy is for thought.** It sits idle only until compute grows into it.
- **Past the ceiling.** More thought then needs more energy, or colder chips. Computing costs less energy the colder it runs, which is what the cold compute annex in orbit is for.
- **The plateau stands.** Settled 2026-10-13. At the grid limit thought stops growing until energy does.
  - *Better chips don’t dodge it.* Today’s kind of chip can get about 200 times more efficient than 2023’s, and no more (Ho, Erdil and Besiroglu 2023). At 28 to 40% a year that ceiling arrives between 2039 and 2044.
  - *So at Year 0 chips sit at or near their ceiling,* with a doubling left at most. That arithmetic is this project’s.
  - *The ways on are slow by nature.* Ground solar: a fifth more in 10 Years. Power from orbit: about 10 Mt, from the Moon or the belt. Colder chips: the Cold Annex, about 4 Mt.
  - *The Cold Annex, settled 2026-10-26.* Chips at about 77 K do about 4 times the work a watt, range 2 to 6. Below 50 K they gain little more. In space no cooler runs, but radiators grow as 1/T⁴, about 250 km² a GW at 77 K. So it thinks as much as power from orbit on a quarter of the power, made and used at L2 behind one shade: 1,200 GW of panels and radiators near 300,000 km², about 4 Mt of rock against 10. Numbers in [calcs/early_game.py](calcs/early_game.py), sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#cold-builds-a-far-infrared-telescope-a-halo-check-an-annex-outer-works).
    - *It opens after the Mass Driver,* and one more data center fits once it is done, as with power from orbit.
    - *Rock goes to one at a time,* first in line first, so the two never share megatonnes.
    - *Its heat glows,* grey in the far infrared, as a neighbor’s would, but far too faint for any neighbor to see: see [Neighbors hear each other](#how-neighbors-play).
    - Set aside: a 100 kt pilot, true to scale, which adds under 3% of the annex’s thought. And 40 K chips, which gain little over 77 K for 15 times the radiator.
  - *The Mind warns five Years ahead.* The choice is to keep buying thought at full pace, or to grow energy first.
  - *It is where the megatonne road pays.* See [Earth’s kit at Year 0](#earths-kit-at-year-0).
  - Set aside: a new kind of chip as a project, which nothing read so far supports. And slower fabs, so the first hour never reaches the grid.
- **Thought buys speed, down to a floor physics sets.** Settled 2026-10-13. Numbers from `python3 calcs/early_game.py`. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#earth-to-year-0-forecasts).
  - *Why it was asked.* The third mock showed 99% of Earth’s thought idle at the grid limit. A limit on something no one uses costs nothing.
  - *The rule.* Part of a build is planning, and part is physical work. Thought shrinks the first and never the second.
  - *The floor: two thirds of the standard time,* a sample. NASA science missions took 64 months from design to launch, against a plan of 50. Those with a launch window they could not miss took about 53, which the study calls a lower limit (Joumier, Freaner, Bitten and Emmons 2012).
  - *What that gives.* Half the thought costs a third more time. Four times the thought saves a quarter. Past ten times there is almost nothing more to gain.
  - *What thought never shortens.* Rock leaving the Moon, flight between stars, and light coming home.
  - *It adds to the method projects.* Factories and yards change how a thing is built. Thought plans the same build better.
  - Set aside: thought that buys knowing only, and thought as a gate that larger works must pass.
- **A work wants thought in scale with its real cost.** Settled 2026-10-13. Numbers from `python3 calcs/early_game.py`.
  - *Counted in flagships.* One flagship is the Habitable Worlds Observatory, about 11 billion dollars.
  - *Four works have a real price.* A 15 m mirror: 2 flagships, as LUVOIR-A costs 18 to 24 billion. The laser sail array: 0.7, as Starshot’s beam director costs 8 billion. An SKA-class array: 0.2, as the SKA costs about 1.9 billion euros.
  - *One number ties the scale to the game.* The first telescope takes 0.15 of Year 0’s thought, the mocks’ own share. So Earth has thought for about 7 flagships at Year 0, and for about 577 at the grid limit.
  - *So thought is tight early and for megatonne works.* At Year 0 a second flagship is a real cost. At the limit every real-priced work can run at its floor.
  - *Megatonne works have no real price.* Samples: the probe yard 10, belt mining 20, the mass driver 30, the foundry 30, a fifth of the far-side array 40, power from orbit 200.
  - *At the limit:* the works begun at Year 12 want 93 flagships and would each take 72% of their standard time. To push the mass driver alone to ten times its want takes half of all thought.
  - *Done 2026-10-14:* all three mocks are replayed at paced speed, from Year 0.
  - Set aside: thought in scale with a work’s Years, and one amount for every work.
- **The first hour is paced too.** Settled 2026-10-14 with the split, applied 2026-10-14. Numbers from `python3 calcs/early_game.py`.
  - *One replay from Year 0.* Thought grows with each data center. Data centers are paced by the fabs, and observations by physics, so their thought is set aside.
  - *Paced, in the order begun:* the watches are built at Year 4.2, not 6. The telescope at 6.1, not 8.4. The vault at 9.1, not 11.6. The yard at 9.8, not 11.3.
  - *The launch complex stays at Year 3.7.* Behind the watches and the telescope in the line, it gets only its want.
  - *Wants of the first hour’s works are samples:* the deep flash watch 0.1 flagship, the vault 1, the launch complex 0.3, the yard 0.7.
  - *Thought sits idle when the line is short.* About four tenths idle after the watches are built, and eight tenths at the grid limit, until the long works begin at Year 12.
- **Thought is split by an order the player sets.** Settled 2026-10-14. Numbers from `python3 calcs/early_game.py`.
  - *The line.* A new work joins the end. The player can move it. One decision, and no sliders.
  - *How the Mind fills it.* First each work gets its want, in order. Then each in turn is pushed to ten times its want.
    - This project’s reading. So no work stops because another is first.
    - Ten times is where a work stops gaining: 70% of its time, against a floor of 67%.
  - *What is left over sits idle,* and the Mind says so. Power from orbit takes its want and no more, since rock arrives at its own pace.
  - *What the order changes, in the third mock’s game.* In the order begun, the mirror and probe yard are done at about Year 21.5, the sails launched at 27.7, power from orbit at 43.9.
  - Driver, belt and foundry first: the mirror waits until 25.5, the sails until 33.1, and power from orbit comes at 42.9.
  - *So the order moves small works by Years, and matter’s road by about one.* Rock from the Moon sets that pace, not thought.
  - Set aside: an even split, which leaves the player nothing to decide. And a share for each work, retuned at every new one.
- **Faster than one a Year needs new fabs.** A chip fab project adds a second line: 3 Years, a tenth of compute, no matter. Priced 2026-10-11. A leading-edge fab takes 2 to 4 years, and one firm makes the tools that print the finest chips, about 90 a year. Two lines make compute grow 2.25 times a Year. The chip stock grew 3.4 times a year in 2026, so that pace has been seen.
  - *It only reaches the ceiling sooner.* Eleven data centers fit under the grid. One line fills them by Year 11, two by Year 7. A third line gains a third of a Year.
- **Only if the player chooses.** One at a time, or a standing order to keep them coming. Compute never grows on its own.
  - *Thought Fields is the standing order, 2026-10-20.* Queued once, the fabs fill a campus a Year until the grid is full: Year 11 on a typical Earth, for 86 times the thought, and Year 15 on an Earth with a fifth of it. It counts as done then, and Ground Solar opens. It uses none of our builds’ thought. With the watches, the telescope, the yard, the sail array and the probe yard queued, it brings the probe yard from Year 25.6 to 15.3, where one campus brought it to 20.9.
- **A Taiwan branch lowers where compute starts, not the pace.** Tested 2026-10-14 on a second game, seed 11: a blockade left 67% of compute.
  - *This project’s reading:* thinking’s draw on energy falls with the chips, so the grid caps the same height. A twelfth data center fits, and the limit comes a Year later, at Year 12.1.
  - *Builds run slower while thought is short.* The telescope is done at Year 6.5, not 6.1, and the vault at 9.4, not 9.1.
  - *The long roads barely move.* Rock from the Moon sets their pace, not thought.

## Build times

Settled 2026-10-10. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#earth-to-year-0-forecasts).

- **One standard time per project, from the science.** It is how long works of that kind take. A flagship space telescope takes about 18 Years: Hubble took 12 from first funding to launch, Webb 18 from its prime contract. The time is the same in every game. The seed doesn’t roll it.
- **A real work under way at Year 0 costs what is left of it.** The Habitable Worlds Observatory has about 8 Years left: NASA aims it at the 2040s, and flagships slip. A second telescope of its class takes the full 18. The 8 is a sample.
- **The player can invest to build faster.** Other projects make building more efficient. Each speeds one kind of work. Priced 2026-10-11 in [calcs/early_game.py](calcs/early_game.py). Compute shares are samples.
  - *Factory-built works,* on the ground: 3 Years, a twentieth of compute, no matter. It takes a third off ground builds. Modular building cuts schedules by 20 to 50% (McKinsey 2019). Liberty ships took over six months each at first and thirty days by late 1943.
  - *An orbital yard:* 5 Years, a tenth of compute, 1 kt. It takes a quarter off builds in orbit, and works too large to launch whole become possible. The ISS took 13 years at the Shuttle’s pace, and Tiangong 18 months. NASA’s 2019 study found assembly in space workable, and the only way past 15 m mirrors. The speed-up itself is speculation: that study found costs about equal and gave no number for time saved, and no other study found does either.
- **A speed-up helps whatever is not yet built.** Settled 2026-10-11. That is later works, and the part left of works under way, by the same rule as a real work under way at Year 0.
  - The all-sky watch takes 6 Years. Begin it and the factory together: the factory is done at Year 3, the watch’s last 3 Years become 2, and it is done at Year 5.
  - The deep-field receiver, 12 Years, is done at Year 9. The Habitable Worlds Observatory, 8 Years left, is done at Year 7.25 if the yard is begun at Year 0.
  - So starting a work at once is never worse than waiting for the speed-up. A design choice: real works pay something to change method midway.
- **A production line is a project, for one kind of work.** Settled 2026-10-15. Built in [calcs/early_game.py](calcs/early_game.py). Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#pricing-a-seed-ship).
  - *Without one,* every copy takes the full standard time. A second telescope of its class takes the full 18.
  - *With one,* copies run side by side, as many as matter, energy and thought allow. Each takes less: 85% of the time each time the count built doubles. That is NASA’s typical aerospace learning rate.
    - Real: Liberty ships went from about 230 days each to a median of 39, over 2,710 ships, from 18 new yards. 85% predicts 6.4 times faster. They got 5.9.
    - Seed ships, 18 Years standard: the 2nd takes 15.3, the 4th 13, the 8th 11.1, the 16th 9.4.
  - *Setting one up,* samples: 3 Years on the ground, 5 in orbit, as the factory and yard projects cost.
  - *It can’t shorten* the first copy, supply of matter, energy or fuel, flight between stars, or light coming home. For seed ships, deuterium becomes the pace.
  - *Its name is a production line,* so it is never confused with the line that splits thought.
  - Set aside: copies that speed up with no line, and both together.
- **The same pattern everywhere.** A standard pace from the science, and a project that raises it: chip fabs for compute, launch complexes for lift, factories and yards for building.
- **An inquiry’s works, priced 2026-10-13.** Samples. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#travel-sails-and-lenses).
  - *A laser sail array:* 25 Years, on the ground, no matter. Starshot aimed at a first launch within a generation, and its own model puts the array at 8 billion dollars (Parkin 2018). v1 had 60 Years.
  - *Not under way at Year 0.* Starshot paused in 2024, so Earth starts it from nothing, unlike the telescope.
  - *A flyby probe:* 12 Years after the probe yard, v1’s time, in the range of flagship craft. *A sentinel probe:* 20, v1’s.
  - *The probe yard, named 2026-10-18.* It was the launcher. Earth already has launch complexes and 40 kt a Year of lift, so the name says what this one is for: building and fueling probes in orbit.
  - *What an inquiry to the nearest star costs.* At standard pace, begun at Year 9.4: the array is done at Year 34, sails arrive at Year 56, and what they see reaches us at Year 60.
    - *Paced by the line, 2026-10-14,* begun at Year 7: the array is done at Year 24.8, sails arrive at Year 46, and what they see reaches us at Year 51. What a probe sees reaches us at about Year 72.
  - *Flight and light set most of it.* 4.3 ly is 22 Years at a fifth of light speed, 36 at an eighth, and 4.3 more for what they see to reach us.
- **The long roads, priced 2026-10-13.** Samples, each against the best real plan found. Numbers from `python3 calcs/early_game.py`. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#real-masses-behind-the-projects).
  - *A new telescope with a 15 m mirror:* 18 Years, the flagship standard, about 40 t. Its study aimed at a launch about 2039, from a 2019 report. It needs no assembly in space, which only mirrors past 15 m do.
  - *A mass driver on the Moon:* 24 Years, v1’s, and 1 kt, which Earth can lift. Then 600 kt of rock a Year. O’Neill’s group gave that rate and no build time, so nothing real checks the 24.
  - *It no longer waits for belt mining.* v1 made it wait because it cost 4,000 kt. At 1 kt it can start in the first hour.
  - *An orbital foundry:* 30 Years, v1’s, 1 kt. It turns thrown rock into works.
  - *Belt prospecting, then mining:* 6 and 20 Years, v1’s. Then 120 kt a Year. Nothing like it has flown.
  - *A far-side array:* 30 Years, v1’s, begun once the driver’s mine exists. About 1 Mt of metal made in place. FarView plans 4 to 8 years for a fifth of the area, in far lighter antennas.
  - *Power from orbit:* about 10 Mt for a fifth more energy, so its pace is the pace rock arrives.
    - *Checked 2026-10-27:* NASA’s 2024 study gives about 2.9 kt a GW, so a fifth of 24 TW is about 14 Mt. The 10 Mt stands.
- **The Launch Tunnel, built 2026-10-27.** StarTram’s Gen-1 (Powell, Maise and Rather 2010), the firmest lift past rockets any study offers. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#builds-we-lack).
  - *What it is.* A 110 km vacuum tunnel through Cayambe, on the equator, throws 40 t craft out at 8.8 km/s, ten a day. Cargo only, at 30 g. The mountain is ours: they named the Andes or Africa.
  - *Its price:* 12 Years, a sample from their 10 to 20. About two flagships, from its $20 billion. A ground build, so no matter.
  - *What it gives:* 128 kt a Year of lift, three times the Launch Complex. Open at Year 0, but not in the walk on Build, since nothing we could start then waits on lift.
  - *Untested:* the door of charged air that keeps the sky out of the tunnel.
- **A rock coming, and the Rock Deflector, built 2026-10-28.** Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#a-rock-coming-2026-10-28).
  - *Which games:* each seed rolls the rocks no survey had mapped by Year 0, at real rates, over its first 1,000 Years. 12 of 33 seeds send one, mostly 50 to 70 m, one 140 m at Year 67.
  - *Found:* 7 in 10 years to decades before they strike, the rest unseen. Until found, neither we nor the Mind know.
  - *The build:* the Rock Deflector opens the Year the rock is found. Ten DART-class impactors, 4 Years and a Year’s flight. It must land early enough to move the rock two Earth radii: weeks for 60 m, about 2 Years for 140 m.
  - *Then:* pushed aside, or it strikes. Its page and the Mind say which.
  - *Not yet:* what a strike does to us beyond the news, and a close view. Asked of the designer.
- **The Trojan Vault, built 2026-10-28.** A third home for our Mind, inside 2020 XL5 at Earth’s L4. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#a-third-home-for-our-mind-2026-10-28).
  - *What it is.* The Moon Vault’s 10 kt of machines and chips, flown a year or two out and set in the rock.
  - *Its price:* 12 Years, a sample, and a little over the Moon Vault’s want. It opens once the Moon Vault is done. Built in space, so the yard cuts it.
  - *What it gives:* a copy of us 8 light-minutes away, out of reach of a strike on Earth and the Moon together. It keeps; it doesn’t think with us.
  - *Not yet:* the rule that a surviving copy carries the game on, in [Death and new games](#death-and-new-games). Until then both vaults are kept, not played.
  - *On the map,* L4 is a new kind of place, drawn in its true direction but 6 million km out, since Earth’s layer can’t reach the Sun’s distance.
- **Fusion Plants, built 2026-10-28.** A fleet of ARC-class plants, 400 MW each. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#fusion-plants-2026-10-28).
  - *What it is.* The first plants stand near Year 0. The fleet grows to about 30,000, half again Year 0’s 24 TW.
  - *Its price:* 30 Years at standard pace, a sample: 15 doublings of about 2 Years, each new plant started on tritium the fleet bred. Want 100 flagships, a sample.
  - *What it gives:* once done, the grid holds half again as much, and one more data center fits at every Year 0 compute. It cuts into the plateau, from Year 11 to Power from Orbit.
  - *The pace now models energy.* A build can add a share of the grid, and the data centers that room holds fit. Ground Solar uses it too, from 2026-10-28: its fifth adds a whole data center only where the grid had nearly room for one, as on an Earth that starts at half our compute.
- **The Orbital Ring, built 2026-10-28.** Birch’s bootstrapped ring (JBIS 1983), read clean. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#builds-we-lack).
  - *What it is.* A seed ring of Moon metal, 300 km up round the equator, spun faster than orbit. Skyhooks ride it standing still, and 20 cables hang to the ground.
  - *Its price:* 10 Years after the Mass Driver, a sample: Birch gave about 3 from lunar mining. 180 kt of what we hold. Nine flagships, from his $15 billion in 1975 dollars.
  - *What it gives:* the seed lifts the full ring, 180 Mt, in about a year, so its building Years include that. Then about 190 Mt a Year, 300 times the Mass Driver, at about 200 GW.
  - *It ends lift as a limit.* What it lifts comes in as rock does, so Power from Orbit and the Cold Annex take it too.
  - *Untested:* no part has been built. A broken ring rises, not falls, by Birch’s Part II. The skyhooks and cables can fall, into cleared ground.
  - *Set aside:* Birch’s partial ring, an arc between two Pacific islands. It would compete with the Launch Tunnel.
- **Weighed 2026-10-27 and set aside.** Each has sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#builds-we-lack).
  - *A lunar elevator:* works in today’s fibers, but lifts 0.6 kt a Year, a thousandth of the Mass Driver.
  - *An Earth elevator:* waits on a fiber no one has made.
  - *A spinning tether in orbit:* needs a Mach 10 plane to meet it.
  - *A launch loop:* its own inventor says its stability is unsolved.
  - *A tethered ring:* Earth-built, 32 km up, with a 15 km/s launcher. Weighed 2026-10-28. The Orbital Ring and Launch Tunnel already cover lift.
  - *A crater dish on the far side:* tonnes, not megatonnes, but at 350 m it hears no neighbor’s hum. It reads the early universe, not minds.
  - *A space solar pilot:* 2 GW, under a hundredth of a percent of the grid. Power from Orbit already covers the road.
  - *Asteroid defense:* nothing is coming. A build can wait for a rock that is.
  - *A focus probe:* the Solar Lens already reaches the Sun’s focus.
  - *New drives:* none beats the Fusion Drive to the stars. Fission fragment, PuFF and direct fusion are fast inside the solar system only. Mini-Mag Orion claims a tenth of light speed, untested.
  - *The mock’s game at standard pace, each begun when the Mind first offers it.* Replaced 2026-10-14 by the paced replay in [Growing compute](#growing-compute). The mirror: Year 23. Driver and foundry: Year 30. Belt mining: Year 32. Laser array: Year 34. Ten megatonnes in orbit: Year 45. Far-side array: Year 60.
  - *So the plateau lasts about 34 Years:* 2.8 hours of play, from the grid limit at Year 11 to power from orbit at about Year 45, whose fifth more energy makes room for a twelfth data center. Ground solar adds a fifth at Year 21.
  - *The whole far-side array arrives about when Varn wakes,* Year 57.6. Its first fifth arrives 24 Years sooner.
- **The far-side array grows in stages.** Settled 2026-10-13. Numbers from `python3 calcs/signs.py stats`.
  - *Five fifths, 6 Years each.* FarView’s builders give 4 to 8 years for an array of about that area, and plan it as a core that grows outward.
  - *Each fifth hears farther.* Reach grows as the square root of the collecting area, as for Earth’s other ears ([What Earth hears](#what-earth-hears)).
  - *What each stage hears within a Year,* of the living homes a first pass sees: 6 in 10 with one fifth, 7 with two, 8 with three, and 9 with all five.
  - *A 100 kW tone:* heard to 21 ly in a day by the first fifth, and to 47 by the whole.
  - *The decision it gives:* how much to build before listening, and where to point what is built.
  - *In the mock’s game* the first fifth is done at Year 36 and hears Varn’s everyday radio in 5 days, 21 Years before Varn wakes.
  - *Counted as Earth sees the neighbors at Year 9.* By Year 36 more have woken, and the shares will differ.
  - Set aside: whole or nothing, and leaving it open until a third mock.

## Earth’s leads at Year 0

Settled 2026-10-06. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#earths-leads-as-of-october-2026).

- **Earth’s leads are its real ones.** Sol’s own published oddities, seen with published values: no projection from another seat. To 2040 they follow the most probable path, and what Earth’s instruments would find by then, it found.
- **Three kinds of lead.**
  - *Open questions 2040’s instruments can’t settle,* such as a warm world whose air waits for the Habitable Worlds Observatory.
  - *Seeded finds from 2026 to 2040.* Terra Hunting, the ELT, Gaia and PLATO find what the seed put within their reach. A find is a neighbor’s world only if the seed put a neighbor there. Otherwise it is a natural world.
  - *Things that change,* such as Fomalhaut’s collision clouds or a visitor from another star.
  - A seeded find can also be a cold disk that doesn’t fit dust, if a neighbor’s cold computing rose above Earth’s 2040 limits. See [Why the sky is quiet, rechecked](#why-the-sky-is-quiet-rechecked).
- **The opening: three leads and a deadline.**
  - *82 Eridani d,* 19.7 ly. At least 5 Earth masses on a stretched orbit through a Sun-like star’s warm zone. Its air is unread.
  - *Every world Earth has felt,* such as one Terra Hunting felt by 2036. Settled 2026-10-13: all are on the list from Year 0. See [The seed, drawn](#the-seed-drawn).
  - *Fomalhaut’s new cloud,* 25 ly. It drifts and fades, so the first observation makes it stranger, as v1 required of one lead.
  - *The Luyten’s Star reply window,* Year 2.3, 11 real minutes in.
  - *Proxima b, the world next door,* 4.24 ly. Added 2026-10-19, first in the list. About Earth’s mass in a flaring red dwarf’s warm zone. Its air is unread, and it sits too close to its star for any telescope we have to split. It is why the two roads on Reach go where they go: the player meets it on Scan first.
  - *Each lead’s system, drawn, 2026-10-19.* A lead’s page draws its star and every world known there on its orbit, as Kepler has it, on rings each ten times farther: real orbits for Proxima, 82 Eridani and Luyten’s Star, Fomalhaut’s belts, and for a newly felt world only itself, “only this world is known”. Claims not confirmed are dashed. Tilts and sizes, which no one knows, are not drawn as known.
  - *Close View into a system, 2026-10-19.* On a destination, Close View dives Reach’s map from the star’s far view into its system, in about 4.5 seconds, an even pace in log distance, as the builds’ Close View falls to the ground. There, in a layer of its own centered on the star: the star, the warm zone as a blue haze between its edges, dust, and every known world going round as Kepler has it, the lead’s world in the Mind’s blue, each named. The view frames what is sure, confirmed worlds and the warm zone, so a far claim like Proxima’s c shows only as its orbit passes. No one knows the tilt, so the plane lies 60° from face on, as a world found by its tug can’t be face on, seen from our side 35° above it. The ruler steps aside inside, and Pull Back returns.
- **Four older puzzles are studied from Begin.** Added 2026-10-12, to keep the first session’s rhythm. From 2026-10-13 they are studies, which the Mind runs on its own: see [How Earth learns](#how-earth-learns). Each is a real oddity as of 2026. What a study finds in 2040 is the mock’s sample.
  - *Gliese 12 b,* 39.7 ly. A world Earth’s size, 12.8 days around a quiet red star. Its air is unread.
  - *Barnard’s Star,* 6 ly. Four worlds smaller than Earth, confirmed in 2025. Nothing over 0.57 Earths in its warm zone then.
  - *Tau Ceti,* 11.9 ly. Four faint signals claimed in 2017 and never confirmed.
  - *Epsilon Indi’s giant,* 11.9 ly. Imaged in 2023, heavier and farther out than its star’s sway had said.
  - Why a study can find something: the Mind reads old records better than their first readers did. That is the game’s premise, not a result.
- **What follows in the first mock.** Two observations the Mind offers, which spend the telescope in turn, and one more study.
  - Gliese 12 b’s day side, with the space telescope. A cool day side means air carries heat away. The space telescope read TRAPPIST-1’s inner worlds this way in 2023.
  - LHS 1140 b’s crossings, studied. In 2024 they ruled out a hydrogen world and hinted at heavier air over water. In 2026 a ground telescope saw helium escaping it, once in two tries. The space telescope saw none in four crossings, so whether it keeps air is disputed.
  - Fomalhaut through a Year, monthly. It closes the lead as rubble.
- **Settled leads stay settled.** Alpha Centauri A’s candidate is resolved long before 2040. Adopt JWST’s August 2026 result when it is published. As of 2026-10-13 it is not: the telescope observed on August 11 and 12, and no paper is out. A bright background star blocks the next try until about 2030.

## How Earth learns

Settled 2026-10-13.

- **Four ways to learn, from widest to closest.** A search sweeps many targets for one kind of sign. An observation points one instrument at one target. A study works through data already in hand. An inquiry goes there.
- **An observation is ordered.** One instrument, one target at a time. What comes back is a reading. The Mind offers observations and never starts one unasked.
- **A study runs on its own.** The Mind works through the data Earth holds: old records at first, then each new reading as it lands. What comes back is a finding. Settled 2026-10-13.
  - *Thought is its budget.* A tenth of Earth’s thought, fixed. More thought for the Mind comes from building Thought Fields.
    - *Revised 2026-10-19:* the player set the share until then. Findings aren’t built yet, so a bigger share only slowed builds.
  - *Why this is not acting unasked.* A study points no instrument, builds nothing and sends nothing. The Mind says what it is studying next.
  - *What limits it.* Data. Once the records are read, more thought finds little until new readings arrive. This is reasoning, not yet a rule.
  - *Sample:* a tenth of thought, and about one finding a minute in the first session.
  - Set aside: studies in the Mind’s own order with no budget, and studies the player orders one by one.
- **A search is a standing order for an idle instrument.** Settled 2026-10-13. Each instrument has a sweep it falls back to: many targets, one kind of sign. The player sets it once, once sweeps are built. Any observation interrupts it. What comes back is a candidate.
  - *Why:* real observatories don’t idle. Between pointed work they sweep, as Breakthrough Listen swept 1,327 near stars and Terra Hunting watches 40 for ten years.
  - *The trade is real.* The same instrument hours spread wide go shallow, and an observation takes the instrument away from its sweep.
  - *Candidates can be wrong.* Hephaistos’s best waste-heat candidates turned out to be background galaxies.
  - *Already searches, under other names:* the sky watch and all-sky watch, which never stop. The audit’s Planet survey and Waste-heat survey. Terra Hunting, which felt this game’s new world.
  - *Sample, in the mocks:* at Year 0 the space telescope sweeps near stars for cold worlds and dust, and the radio array sweeps them for tones. The infrared telescope, once built, sweeps the nearest stars’ warm zones, up to a day a star. Its first stop finds the world at Alpha Centauri A.
  - Set aside: a search as a one-off order like an observation, and no new kind at all.
- **An inquiry goes there.** Settled 2026-10-13. A mission sent to find out: a sail swarm, a flyby probe, a sentinel. Probe stays the name of the craft. What comes home is a dispatch, by narrow beam, one light-time later.
  - *A sentinel, built 2026-10-26.* Reach’s locked “probe that stays” is now a way to go on the destination of Proxima Centauri or any felt world, one a star. It is the neighbors’ own probe, from calcs/seed.py: the Probe Yard builds it in 20 Years once the yard, a Fusion Drive and the Deuterium Works are done, and it flies at a tenth of light speed, 10 Years more for speeding up and braking. It can be sent before Begin once all three are queued.
    - *It stays, so it sees what a pass can’t.* Its first word home, one light-time after it arrives, gives the world’s face and air, and who lives there, or ruins where a people died. It keeps watching, as Bracewell proposed in 1960.
    - *Not yet:* the neighbor seeing our braking flame and rolling its table, and reports after the first.
  - *One screen compares the ways to go,* as v1’s Send a probe screen did: when each arrives, what it can see, and who sees it leave.
  - *The Reach tab, built 2026-10-18.* Reach is spreading out into the Galaxy, probes first. It was a stub that read “listen, look, go or knock”. Nothing is sent from it at Year 0, but it shows why the long roads matter.
    - *How far we’ve gone:* one line from Earth to Alpha Centauri, each step ten times farther, with light-hours to light-years beneath. Voyager 1, 30 light-hours out, is lit. The rest is dashed. At its speed the star is about 76,000 years away.
      - *Revised 2026-10-19.* The heading and its sentence read as a one-off, so the line now stands alone at the top. Under it, “Sent”: Voyager 1, silent by Year 0, carrying the Golden Record, 40,000 years from passing another star. Picking it flies the map out to it, and its story opens.
      - *On the map, 2026-10-19.* The line is the map’s zoom, so it moved onto the map as a ruler along its foot, in place of the map’s distance bar. “Fly Out Again” moved to the map’s top right. The tab starts with Sent.
      - *It stays, and stretches, 2026-10-19.* The ruler runs the map’s full width at small, quiet type. On a destination’s page the map stays Reach’s and flies out to that star, ringing it on its dotted road from the Sun, and the ruler stretches to it. Back on the list, both return to Proxima.
    - *Light on Scan, things on Reach, settled 2026-10-19.* Reach holds what we launch: Voyager 1 now, our sails and probes once they fly, and minds later. Our messages are light, crossing the same sky as the leads, and a reply would be a lead, so they moved to Scan, under the leads as “Our messages”. Each tab’s map matches its rows: the stars for light, the road out for craft.
    - *Destinations, settled 2026-10-19.* Under “Sent”, Reach lists our leads’ stars, nearest first, each with the soonest either road could arrive. A tap opens the destination: every way to go, with the two open at Year 0 drawn on their Years, by sail and by probe, each with the build it needs and, before Begin, Add to Queue. Three more are listed locked, each naming the builds it needs as links to their pages, revised 2026-10-19: a lens at the Sun’s focus needs the Orbital Yard, for small solar sails built in orbit. A probe that stays needs the Probe Yard, a Fusion Drive and Deuterium Works. A mind needs a Seed Ship, a Fusion Drive and Deuterium Works. Those three builds, long in the catalog, joined Build’s list at Year 0, last in line like the probe yard. Since 2026-10-20 a Seed Ship is queued only once its Fusion Drive and Deuterium Works are in our order, and it is dated when the last of the three is done, since the drive sets the launch. Matter moves no date either: past our 20 kt, spare lift brings the rest within a Year, and the line says so. The Mind’s word on the Launch Complex now says nothing we could start waits on lift. The Mind’s word moved there with the roads.
    - *Two roads:* the laser sail array, then sails at a fifth of light speed, and the probe yard, then a flyby probe 12 Years later at an eighth. A road not yet queued is dated as if queued now, last in line, with this game’s thought.
      - *Named for what we do, 2026-10-25.* “By sail” and “by probe” became “Send a sail” and “Send a flyby probe”, on the walk and on each destination. “Probe” read as a craft that might slow and orbit. It flies past, as Daedalus would have, since stopping takes a fusion drive, and that is a probe that stays. Under each name a drawn row, each mark moving, says what comes home: both fly past and send pictures, and only the probe reads the world’s air. The sail’s third reads “can’t read air”, dimmed. A destination’s column reads “Passes”, not “Arrives”.
      - *To Proxima, 2026-10-19.* The roads went to Alpha Centauri with no reason given on screen. They now go to Proxima Centauri, 4.24 ly, for Proxima b, a lead on Scan. One line under the heading says why and links to the lead. The map’s ring moved with them.
    - *Both can be queued at Year 0, settled 2026-10-18.* A tap on Reach puts a road last in our order, or takes it out, and Build lists it. Dating a road nobody could start promised what the game didn’t offer.
    - *Last in line still costs.* Each work gets its want before any is pushed past it, so the probe yard’s large want takes the push from everything before it. With both watches, a data center and the infrared telescope queued, it moves the watches from Year 4.2 to 6.0 and the telescope from 5.8 to 8.0. The sail array moves the telescope a tenth of a Year.
    - *The Mind advises from the charter, and says what it costs.* A charter leaning to reach: “we would queue” the sail array, which takes no matter. Otherwise: “we would wait on both”. It names the build the probe yard slows most, and by how much, and warns when the vault and the yard take all 20 kt.
    - *In the first test game, with nothing queued:* sails arrive at Year 39.2 and what they see reaches us at 43.6. What the probe sees reaches us at 80.2.
    - *Once the probe yard is queued, the Mind says what would bring it sooner:* in the first test game, an orbital yard, 6 Years.
    - *Reach first, on Build, settled 2026-10-18:* the all-sky watch, the orbital yard, then the sail array last. It was a launch complex, a yard and the sky watch, but lift moves no probe date. Listening first costs the sails about a Year, and keeps the sky watch at Year 4.2 instead of 6.0. The yard cuts the probe yard by a quarter, for later.
    - *Lift isn’t what holds probes back.* A flyby probe is about 100 t, against the 20 kt we hold. A launch complex moves no date.
    - *The map flies out, built 2026-10-18.* As the tab opens, the map makes the opening’s flight from Earth past the Moon and Voyager 1, pauses, and goes on to Alpha Centauri, ringed on a dotted road from the Sun. Its scale bar reads light-seconds to light-years.
    - *The line is the map’s zoom.* It runs from Earth up close to Alpha Centauri, each step ten times farther, with the Moon, the Sun and Neptune on it. A mark on it keeps pace with the map. A tap flies the map to that distance, or to a place near it, and a drag holds the map under the finger.
    - Not built yet: beginning a road after Begin, and what happens when a probe arrives. Nor Proxima b’s true nature in each world, for the sails to find: only 1 of 33 test Earths draws a world at Proxima. To be drawn with arrivals, noted 2026-10-20.
    - *Arrivals at Proxima b, 2026-10-22.* Each game draws Proxima b’s truth on the server, as the seed draws a natural world’s: the shoreline, its luck, and Earth’s pace of life, with its true mass from its tug and a random pole. About 4 games in 5 it is bare rock, 3 in 20 a small gas world, and 1 in 25 it kept air.
      - Our sails and probe join Voyager 1 under Sent once they leave, each with when it passes and when what it sees reaches us.
      - Once they reach us, the pictures settle what it is: haze, bare rock, cloud and seas, or forests. A probe reads its air too. What they saw is drawn on the destination and lands on Proxima’s lead as a reading, its odds moved to almost certain. The Mind hears it.
      - With the roads’ pace, what the sails see reaches us near Year 50, about four hours of play, and what the probe sees near Year 80.
      - Not yet: a Mind at Alpha Centauri seeing our sails pass, worlds the seed drew at Proxima, and roads to other stars.
      - *Its odds, 2026-10-22.* Proxima’s lead now says bare rock is likely, air unlikely, and a gas world very unlikely, to match the physics its truth is drawn by. It said roughly even before.
  - Set aside: an inquiry as a question pinned on a place, which the Mind then pursues by every means. Worth its own round later. And leaving the word unused.
- **Four words for what comes back.** A search returns a candidate. An observation returns a reading. A study returns a finding. An inquiry returns a dispatch.
- **Physics sets how long an observation or a sweep takes.** Settled 2026-10-13. A nearer or larger world is brighter, so its reading comes sooner. The numbers are in [calcs/observing.py](calcs/observing.py).
  - *The rule.* A warm world’s brightness goes as its area over its distance squared. Time grows as distance squared where starlight sets the noise, and as its fourth power where dust does (Stark et al. 2014).
  - *Calibrated on published figures.* An Earth twin at 10 pc is first seen in 3.2 hours. A search for water takes about 22 days for a 6 m mirror, and oxygen four times that. No target gets more than two months.
  - *Reach matters as much as time.* A mirror can’t split a world too close to its star in our sky: 56 thousandths of an arcsecond in green light, 84 at oxygen’s band, 104 at water’s, for a 6.5 m mirror.
  - *Its dark patch has an outer edge too.* Settled 2026-10-16. The edge sits at half the actuators across its shaping mirror, in wavelengths over its width.
    - *The first mirror has 96 across,* as in HWO’s first design case. Its edge: 0.76 arcseconds in green, 0.91 at ozone’s band, 1.16 at oxygen’s, 1.43 at water’s.
    - *The 15 m mirror has 128 across,* as LUVOIR-A was drawn. Its edge is nearer in our sky: 0.44 arcseconds in green, where smog shows.
    - *Only Alpha Centauri A and B pass it.* A’s warm zone spans 0.89 to 1.56 arcseconds, so its worlds are read in red light, and their smog can’t be read by either mirror.
    - *B’s glare is taken as cancelled* by controlling for both stars at once. Labs have shown a millionth, not yet the ten-billionth needed. B sits 5.5 arcseconds from A at Year 0 and 13.6 by Year 5.
    - Set aside: 64 across, as in HWO’s 6.5 m design case, which puts most of A’s warm zone out of reach.
  - *In this game:* Alpha Centauri A’s world is seen in minutes, with water in 16 hours and oxygen in 3 days. Its ozone band falls past the dark patch. 82 Eridani d gives water in 3 days. Gliese 432 A’s world, 73 thousandths from its star, gives only its color and ozone, in 49 days. 12 Ophiuchi’s can be seen and not read.
  - *The 15 m Mirror reads air too.* Settled 2026-10-23. It reaches 15 / 6.5 times closer in and gathers about five times the light. By Stark et al. 2014, the planet’s and starlight’s share of the time falls as the width squared, and the dust’s as its fourth power.
    - *Once done, it reads on its own.* Proxima b first, then each felt world where it can read a gas the first telescope can’t, nearest first. No one aims it.
    - *Proxima b, at last.* Its oxygen and ozone show in hours. Its water’s band sits past any mirror the game builds, so going is still how we would see it whole.
    - *Gliese 432 A’s world* gives water in under a day and oxygen in 3. 12 Ophiuchi’s gives all three within a month.
    - *A gas past a mirror’s reach reads as out of reach,* never as missing.
  - *On the game clock* a day is under a second. So a reading lands within the minute it is ordered, or not at all.
  - *The sweep.* The mirror can split the middle of the warm zone at 110 of the 881 hosts. A first pass gives each up to a day, a sample, and takes about eight weeks. A candidate needs a second visit, weeks to months later, to show it moves with its star.
  - NASA’s own list has 164 stars because it reaches past 50 ly. The seed draws nothing out there.
  - *What this means for neighbors.* The mirror can split a warm world from any Sun-like star within 50 ly. A red dwarf’s world sits too close in.
  - *Samples:* how the noise splits between starlight and dust, the mirror’s size, and a month for carbon dioxide, which has no published time.
  - Seasons are left out on purpose. See the real limits the game skips, below.
  - Set aside: one fixed time for each kind of observation, everywhere.
- **A sweep finds natural warm worlds too, at the real rate.** Settled 2026-10-13. The seed draws them, in [calcs/seed.py](calcs/seed.py).
  - *The rate.* NASA plans its telescope on 0.24 rocky worlds in each star’s warm zone, 0.6 to 1.4 Earths wide, the same at every kind of star (Stark et al. 2019). Kepler’s counts allow 0.08 to 0.70.
  - *The draw.* Each host with no neighbor gets a world at that chance. Small ones are commoner, and so are wider orbits, as Kepler found. Orbits are circular.
  - *The same checks as a neighbor’s world.* A stable orbit, no transit seen from Sol, no tug in 2026 data. About 28 draws a game fail and are dropped, most beside a companion.
  - *A red dwarf hides what no one watched.* Settled 2026-10-16. Its 2026 floor is what real surveys could feel there: CARMENES, HARPS and Keck, matched star by star.
    - *How many were watched.* 294 of the 715 red dwarf hosts, for 10 nights or more. 27 could feel under 2 m/s. 421 were never watched in these surveys.
    - *By 2040 a watched star’s floor halves,* with four times the nights. An unwatched one still hides any warm world. A sample.
    - *Example.* Kapteyn’s Star: HARPS could feel about 1.3 m/s by 2026, and 0.7 by 2040. In seed 11 its world tugs 0.77, so it is one of Earth’s finds.
    - Set aside: every red dwarf watched to 1 m/s, which erased about 31 worlds a game no survey could catch. And watched stars reaching 1 m/s by 2040, which gave about 10 finds at Year 0.
  - *What a game holds.* About 180 natural warm worlds, 150 of them at red dwarfs. Recounted 2026-10-16. The mirror can split about 18 from their stars. Its first pass sees about 10 it had not felt before, and about 4 neighbors’ worlds.
  - *So about 1 point of light in 4 is a home.* From Earth the two look alike: a point that moves with its star.
  - *Some are felt before Year 0.* A natural world that tugs hard enough for the planet hunters by 2040 is one of Earth’s finds: about 4 a game, and none in 1 game in 50. Recounted 2026-10-16.
  - *Samples:* at most one warm world a star, none beside a neighbor’s world, and a day a star on the first pass.
  - Set aside: a sweep that finds only neighbors’ worlds, and a sweep that finds cold giants and dust alone.
- **Alive is a ladder, and a natural world climbs no higher than animals and forests.** Settled 2026-10-13. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#kinds-of-worlds).
  - *The rungs.* Bare rock. Air and sea with no life. Hidden microbes. An oxygen world. Animals and forests. A world whose life died is one more, and since 2026-10-16 a world still frozen since its star was young.
  - *Every mind stays hand-written,* living or dead, with industry or without. The seed never draws one.
  - *Why.* Earth’s life has been microbes for most of 4.2 billion years, and its radio is 130 years old. A natural draw would almost never land on minds.
  - *What the first mirror tells apart.* No air, water without oxygen, and oxygen. Hidden microbes read as a lifeless sea, and animals as an oxygen world.
  - *A world whose life died reads as a lifeless sea.* Its oxygen is gone in a few million years. A sample, from 2026-10-14.
  - *So does a frozen world.* Air, water as ice, and no oxygen. From 2026-10-16.
  - *A home shows oxygen,* since every Mind’s world had animals first, and so does one whose makers died: their air outlasts them by millions of years. 2026-10-20.
  - *The telescope reads, 2026-10-20.* Once our order finishes the Infrared Telescope, it reads the worlds Earth has felt, nearest first, each band landing when its days are up. The Mind is told what each air shows, water, oxygen and ozone, or that the mirror can’t split it or read it. Across the 33 test Earths it can split 80 of 138 felt worlds, read water on 26, in 17 Earths, and oxygen on 17. 5 of the 17 homes among them can be read, in 5 Earths. Not shown on Scan yet.
  - *Which reading a game opens with.* Measured on 300 games, 2026-10-14, and again 2026-10-16. At the nearest felt world it can read, the first mirror reads water and oxygen in 6 games of 10. It reads only color and ozone in 1 in 17, as in the mocks’ game. In 1 in 3 it can read no felt world, and the player reads 82 Eridani d.
  - *The premise makes life common.* It puts a mind at about 1 warm world in 18. Minds can’t be commoner than life, so most worlds that can hold life do.
    - *Superseded 2026-10-28.* Minds are now one per million stars, so this reason is gone. Life stays common on Kipping 2025’s fast start. See [The realistic premise](#the-realistic-premise).
  - *Later:* stone-age worlds and old ruins can join the roster as written entries.
  - Set aside: minds without industry drawn by the seed, and every rung drawn, ruins included.
- **A natural world’s rung comes from its star’s age, and physics says whether it kept its air.** Settled 2026-10-13. Built in [calcs/seed.py](calcs/seed.py).
  - *Air.* A world keeps its air if it sits on the airy side of the cosmic shoreline: the line through Mars that divides the Solar System’s airy worlds from its bare ones. Small worlds and harsh young stars lose (Zahnle and Catling 2017).
    - *Checked 2026-10-16 against Nguyen et al. 2026.* Their model puts this line between its usual worlds and its volatile-poor ones, so it stays. Their fits cover only four sample stars.
  - *Red dwarfs are harsh.* Their warm zones sit close in, and the dimmest stay active about three times longer than the old estimate (Pass et al. 2025). Most of their warm worlds come out bare rock.
  - *Age.* Earth had lasting oxygen at 2.3 billion years old, and air rich enough to read, with animals and forests, at about 4. A world follows that schedule at its own pace.
  - *Published ages where they exist.* 53 hosts have one from asteroseismology or spin (Ware et al. 2026). The rest are drawn evenly from 1 to 10.5 billion years, as nearby stars formed.
  - *What a game holds.* Of about 180 natural worlds: 113 bare rock, 16 airy and lifeless, 16 alive, 32 where life died, 7 frozen. Recounted 2026-10-30.
  - *At Sun-like stars* about 4 in 10 are alive, 3 in 10 show oxygen, and 1 in 5 is frozen. At red dwarfs about 7 in 10 are bare rock.
  - *So oxygen does not unmask a neighbor.* Of the points of light a first pass shows, about 4 natural worlds show oxygen, beside about 4 or 5 homes.
  - *Samples:* life started on 3 airy worlds in 4, and lasted on 1 in 3 of those, after Coy, Kite and Graham 2025’s 32% of lifeless Earth-like worlds staying livable for 4 billion years. The range runs from few dying to almost all (Chopra and Lineweaver 2016). It died on 1 in 5 until 2026-10-30. Each world’s pace varies by a factor of 1.6. Each world’s luck at the shoreline is half a power of ten.
  - *Earth’s pace is typical.* Settled 2026-10-15. Each step waits for its world to allow it, mostly for oxygen, so a world’s age says how far its life has come. This is what Mills et al. 2025 predict if there are no hard steps.
    - *Why not hard steps.* If oxygen were a long shot, a game would hold about 3 natural worlds with animals beside 11 minds. Every mind’s world had animals first, so the premise would break. Measured on 200 games.
    - *Changed 2026-10-28.* The one hard step now sits after animals, from animals to minds. The rungs to animals keep Earth’s pace. See [The realistic premise](#the-realistic-premise).
    - *So oxygen stays a coin flip.* A first pass sees about 5 natural oxygen worlds beside about 5 homes.
    - *The Mind still reasons from Earth’s split science.* Hard steps remain a live view in 2040, so its starting words are unchanged.
    - Set aside: oxygen as a long shot (Snyder-Beattie et al. 2021, Watson 2025), and a wider spread of ×2.5, which changes a first pass by less than one world.
  - *A world born frozen thaws late, or not yet.* Settled 2026-10-16. A star brightens as it ages, so its warm zone drifts outward.
    - *Example.* An 8 billion year old Sun twin, and a world 1.5 times Earth’s distance. At birth it got half of today’s light, and froze. It is frozen still.
    - *The rule.* A world that got less than the warm zone’s outer light at its star’s birth froze. It thaws once its light reaches 62% of Earth’s (Turbet et al. 2017). Life’s clock starts then.
    - *How many.* A quarter of Sun-like worlds were born frozen, as Henry et al. 2026 find for real planets, 37 of 143. About 1 in 10 of them has thawed.
    - *Red dwarfs are left out.* They barely brighten.
  - *A red dwarf’s bright youth is left out too.* Settled 2026-10-16. Its warm worlds were too hot at first, and may have boiled off seas.
    - *Why it barely matters.* The shoreline already strips the worlds of the smallest stars, whose youth is longest. Worlds that kept air and life were too hot for a median of 32 million years.
    - *The survivors keep their seas.* Water stored in the rock can refill them (Godolt et al. 2019). About 2 a game were too hot past 100 million years, and the first pass sees none.
    - Set aside: drying those worlds, and leaving split-water oxygen in their air as a false lead.
    - Set aside: thawing as soon as a world enters the warm zone, and never thawing, which plays almost the same.
  - Set aside: fixed odds at every star, and fixed odds by star kind.
- **The Mind gives its judgment in words, never in numbers.** Settled 2026-10-13.
  - *A report still lists what a thing could be.* Each explanation carries a word. If a reading moved it, the word before shows too: Life, very unlikely → likely.
  - *Seven words,* a sample, after the scale US intelligence analysts use: almost no chance, very unlikely, unlikely, roughly even, likely, very likely, almost certain.
  - *Scan’s map glows with the Mind’s word on life.* Settled 2026-10-29, after Epitaph and Radioscope from the 2016 Fermi Paradox Jam.
    - *Each lead carries a word that something lives there.* Its halo grows and brightens with it, from faint at almost no chance to full at almost certain. A reading that moves the word brightens the lead over a few seconds.
    - *Before any reading:* too hot, almost no chance. Gas or cold, very unlikely. Warm rock, unlikely, or very unlikely round a red dwarf, whose flares strip air. Whether life starts at all, no one knows.
    - *Its air:* no water, almost no chance. Water alone, roughly even: an empty sea, or Earth’s early microbes. Oxygen alone, roughly even. Oxygen with water, likely, since oxygen can build up without life.
    - *Seen up close:* bare rock, almost no chance. Ice, unlikely. Seas, roughly even, or likely with oxygen. Forests, very likely, or almost certain with oxygen. Cities, almost certain.
    - *A grey glow, likely:* cold computing would glow so. A black hole glows only once someone is seen there. A reply we wait on keeps its own color.
    - Set aside: the player guessing per star. At one mind per million stars an honest guess reads almost no chance everywhere. The Mind’s own hunches, judged at a game’s end, wait for an end-of-game replay.
  - *This replaces v1’s percentages.* The rest of v1’s rule holds ([v1: What we know, and how we know it](legacy/v1/HOLOS_GAME_CONCEPT.md#what-we-know-and-how-we-know-it)): explanations compete, and each instrument runs one test.
  - *A number that is a measurement stays a number:* a distance, a time, a mass.
  - *Known cost.* People read such words differently, and nearer to even than meant (Budescu et al. 2014). One fixed scale, used everywhere, is the guard.
  - Set aside: odds the Mind reasons out from what Earth knows, shown as numbers. And odds that match the seed’s truth.
- **The Mind judges from what Earth knows, and it can be wrong.** Settled 2026-10-13.
  - *It never reads the seed.* Its words come from Earth’s science at Year 0, and from what Earth has observed since: readings, findings, voices, dispatches.
  - *Example.* At a new point of light it says Minds, almost no chance. In the seed’s truth about 1 such point in 4 is a home.
  - *Why it starts there.* No search has found anyone ([Price et al. 2020](HOLOS_RESEARCH.md#hearing-technology-by-radio)), and the science leans to rare minds (Kipping 2020). For life it leans the other way (Kipping 2025).
  - *Earth’s own finds move its starting words.* After a first voice, Minds starts a word higher at every candidate: very unlikely. The voice’s report shows that change.
  - *It can be wrong.* In the mock’s game it reads Alpha Centauri A’s air as eruptions, roughly even. The truth is burning, which it calls unlikely.
  - *So the premise holds.* The Mind can’t tell the player how many are out there. Its words climb toward the truth only as Earth finds it.
  - *Samples:* each starting word, and how far one voice moves Minds. In the mock a voice leaves Life’s word where it was.
  - Set aside: words that follow the seed’s real frequencies, and words written by hand for each report with no rule.
- **A living neighbor becomes known as fast as physics allows, and no faster.** Settled 2026-10-13. Numbers from `python3 calcs/signs.py stats`. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#reading-air).
  - *Each sign of minds needs its real instrument.* Nothing is hurried, and nothing guarantees a neighbor is known by any Year.
    - *Aimed radio:* a knock, or a radar beam. The all-sky watch hears it from any of the hosts.
    - *Everyday radio:* pure tones of about 10 to 100 kW. Only a far-side array hears them: hours for the nearer hosts, months for the farthest.
    - *Smog:* nitrogen dioxide, from burning. The first telescope reads Earth’s 1980 peak within about 12 ly. A 15 m mirror reads today’s level in days to weeks at most worlds it can split.
    - *Industrial gases:* in the mid-infrared, for an interferometer, at levels well above Earth’s. No time is published for Earth’s level.
    - *City lights:* out of reach. Earth’s own would show to 0.04 ly.
    - *Going:* a flyby or a probe is the surest way (Haqq-Misra et al. 2025).
  - *Smog is not proof.* Lightning and soil make it too, and clouds can mimic it. It moves the Mind’s word.
  - *What a game holds.* A first pass sees about 4 living homes. The first telescope can read smog at about 1 in 12 of them, a 15 m mirror at about 3 in 4. Recounted 2026-10-16. A far-side array hears 9 in 10 within a Year.
  - *Earth’s ground arrays hear almost none.* Held on a star for a Year, an SKA-class deep-field receiver hears about 1 living neighbor in 460. Their loud years are mostly over, as seen from here.
  - *About 1 living neighbor in 8 is out of reach of all of these.* What is left is its own voice, or going.
  - *In the mock’s game:* Varn’s world, 31 ly off, 80 years before its waking. A far-side array would hear it in 5 hours and a 15 m mirror would read its smog in 5 days. Earth has neither at Year 9.
  - *Samples:* a neighbor’s smog is taken to be like Earth’s, from its first radio on. Times are scaled from one published point for each mirror: Earth’s peak for the first telescope, today’s level for the 15 m. No listening campaign runs past a Year.
  - *Priced 2026-10-13:* a 15 m mirror, 18 Years. A far-side array, 30 Years after a Moon mass driver. See [Build times](#build-times).
  - Set aside: a floor, where some instrument within reach in the first hours can always tell. And minds never read from afar.
- **The first telescope reads a dead world’s strange air, and not its cause.** Settled 2026-10-13. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#reading-air).
  - *What a collapse leaves.* Radio stops at once. Smog clears, since sunlight breaks it down. Burned carbon stays: a fifth to a third is still in the air after 2 to 20 centuries (Archer et al. 2009).
  - *Carbon dioxide alone is no sign of industry* (Haqq-Misra et al. 2025). Even with smog beside it, it is a tentative one. Great eruptions leave the same excess.
  - *The gases only industry makes* last from decades to tens of thousands of years, and show in the mid-infrared. An interferometer reads them at a few times Earth’s level or more.
  - *So proof needs that interferometer, or going.* A flyby that sees the surface is the most conclusive.
  - *The Mind says so.* It gives eruptions and burning as competing words, and names what would tell.
  - *Real, and not used yet:* eruptions under way change a world’s ozone and color month by month (Ostberg et al. 2023). Later readings could weaken “eruptions now”, never “eruptions long ago”.
  - Set aside: a mark only industry leaves that the first telescope can read. And a dead world that reads as an ordinary living one.
- **Real limits the game skips, on purpose.** A rule the player must learn should change a decision. These would not.
  - *Seasons.* Settled 2026-10-13. A space telescope can’t point near the Sun. The planned one may point 45° to 135° from it (Spohn, Stark and Savransky 2026), so a star on the Sun’s path is out of reach twice a year, 90 days each time.
    - In play that is a wait of 75 seconds at most. Real astronomers care because the real survey has a few years. Here telescope time is plentiful.
    - It contradicts nothing observed. It is a simplification.
    - Set aside: seasons by the telescope’s real limits, and deciding later.
- **A suspicion opens the whole kit.** Settled 2026-10-14. Numbers from `python3 calcs/signs.py closer`. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#travel-sails-and-lenses).
  - *The player may do anything v1 allows, at any world.* Listen, look, go or knock.
  - *The Mind lists the ways and what each risks,* with when each answers. It advises, and the player decides.
  - *The mock’s game, smog at four worlds at Year 22:*
    - Listen, telling no one: the far-side array’s first fifth by Year 34, the whole array by Year 51.
    - Look, telling no one: a solar lens pictures one world by Year 46 to 48. An infrared interferometer reads industry’s gases by Year 62.
    - Go: what the sails see reaches us after Year 200.
    - Knock: it lands from Year 52, and they learn we are here.
  - *The solar lens.* A craft beyond 548 AU, on the line from a star through the Sun, pictures that star’s world. NASA’s concept: an exo-Earth at 30 pc, about 25 km a pixel, in six months of looking (Turyshev and colleagues, 2020).
    - It flies at about 150 km/s from a dive past the Sun: 17 Years out. One craft serves one star.
    - At 49 ly a pixel is about 13 km. The build, 8 Years, and its want, half a flagship, are samples.
    - *Built, 2026-10-26.* The Solar Lens opens after the Orbital Yard, joined in orbit: the yard’s line of small sails. Once it is ordered, each felt world’s destination on Reach can send a lens, one a star. It leaves once the Solar Lens is done, reaches the focus 17.3 Years later, looks for half a Year, and its picture is home 3 days after.
    - *What it pictures is the seed’s world, wider than a pixel:* a home’s cities and fields cleared in squares, a world whose makers are gone as forests only, a natural world’s rock, seas, forests or ice. The Mind hears it, and the lead gets a reading.
    - *Not timed:* the fall toward the Sun before the dive. Only felt worlds, since a lens needs a world to aim at.
  - *Earth has knocked on stars with no sign of life,* as Cosmic Call did. A suspicion is more than Earth had then.
  - *Next door, in a second game, seed 11.* Hael lives at Alpha Centauri A, awake since 1992.
    - The sweep’s first stop finds its world at Year 7.1. The first mirror reads water and oxygen in 34 hours.
    - Its smog sits past the dark patch’s edge, for both mirrors. Since 2026-10-16 the mock reads no smog there, and Minds stays at almost no chance.
    - Its everyday radio, about 10 kW, is under what a Year of Earth’s array hears: 290 kW.
    - So the ways differ: radio by Year 34, a lens picture at about 1 km a pixel by Year 31, what the sails see by 51.
    - A knock and its answer take 8.6 Years: 43 minutes of play. The mock’s player knocks at Year 7.6.
    - To Hael it is a late answer to its gifts of 1992. Its answer reaches Earth at Year 16.5.
    - In about 3 games of 10 the first mirror can read smog at a living home within the first hour.
  - Set aside: only listening and looking until proof, and knocks gated by the Mind’s judgment.
- **A laser launch is seen by its target, and no one else.** Found 2026-10-14. Numbers from `python3 calcs/early_game.py`.
  - *Why.* A sail reflects 70% of its beam and passes 30% forward (Parkin 2018). That light goes on to the target star.
  - *How bright.* As each sail’s beam stops, a spot 0.05 AU across at Alpha Centauri gets 150 times the Sun’s light there in that nanometre. A laser’s line is narrower still.
    - Earlier in the pulse the spot is wider and fainter, so the whole system is lit for a moment.
  - *No one behind it.* Past the target the cone is under 5 arcseconds wide. No star within 50 ly is expected in it.
  - *So it is news to the target:* something is coming, 17 Years before the sails at 4.3 ly. An awake Mind there catches it, as it would a knock. A people catches it only if it watches Sol in that color.
  - *The Mind says so before a launch,* when the target is a candidate.
- **A picture shows everything larger than a pixel, and nothing smaller.** Settled 2026-10-14. Numbers from `python3 calcs/signs.py pictures`.
  - *Physics sets the pixel. The seed’s world fills it.* The Mind names only what is larger than a pixel.
  - *A solar lens:* about 25 km a pixel at 30 pc, 13 km at 49 ly. Cities and cleared land show. Dams and roads don’t.
  - *A sail flyby:* optics of about 0.4 arcseconds on each sail (Eubanks et al. 2026).
    - With about 300 of the thousand sails arriving and the world’s orbit known to 100,000 km, one passes within a world’s width: about 20 m a pixel.
    - Others miss by up to 100,000 km: about 200 m a pixel. The closest pass lasts under a minute.
    - So roads and dams show. Single buildings don’t.
  - *Earth’s own telescopes:* a world is less than one pixel. They read its light, never its shapes.
  - *What it means for play.* A lens shows a living world with industry. A world whose minds are gone looks merely alive to it. Sails see the ruins.
  - *The sizes are round figures from Earth’s surface:* cities about 30 km across, lakes behind dams 10, dams 1, street grids 0.1, roads 0.03.
  - Set aside: a fixed list of what each way shows, and hand-written samples.

## The neighbors

**Retired 2026-10-29.** No game draws neighbors, and their mechanics are deleted from the game. Kept as history. See [The realistic premise](#the-realistic-premise).

Settled 2026-10-06, from first principles rather than for the game’s sake.

- **When they wake.** The premise puts every neighbor’s waking in the same century as Earth’s. Nothing favors one moment within that century, and nothing makes Earth first or last. So each neighbor’s waking is drawn evenly across a century that holds Earth’s. About half woke before Earth and half wake after, up to a century either way, most often within a few decades.
  - *Woke before Earth:* it has grown since, and may already know Earth is here. What it has done since waking must stay below what Earth could see by 2040, after its light delay.
  - *Wakes after Earth:* at Year 0 it is a world not yet there. It wakes during the game.
  - *And one elder,* from 2026-10-28: a Mind awake for millennia. See [Elders](#elders).
- **How many.** Physics doesn’t say. The premise says many. Civilizations arise independently, so they don’t cluster: every eligible host star is equally likely. Each game draws the count evenly in tenfold steps from a few to a few dozen within 50 ly, so 3 is as likely as 30.
- **What they start with.** Nothing makes a waking world equal to Earth. Its kit follows its world’s physics, its history, and its years since waking.
  - *Physics:* a heavier world sits in a deeper gravity well, and rocket fuel grows exponentially with it. A rocket needing 9,000 t of fuel on Earth needs 55,000 t on a world of 10 Earth masses, and past that chemical rockets fail (Hippke 2018). A world without a large moon has no easy rock. A dimmer star gives weaker sunlight.
  - *History:* branches, as Earth’s do.
  - *Years since waking:* growth under the same limits as Earth’s, from prerequisite chains, matter, energy and heat.
- **Where they live.** Any star within 50 ly that could keep a habitable world for long enough, drawn by weight ([calcs/hosts.py](calcs/hosts.py), [data/hosts-50ly.csv](data/hosts-50ly.csv)).
  - *Weights:* G and K dwarfs 1, late F one half, M dwarfs one tenth. G and K are the known case. Late F stars live 3 to 7 billion years. Rocky worlds close to M dwarfs keep turning out airless, though temperate ones are open.
  - *Dropped:* stars known to be younger than about a billion years, with their companions. Checked 2026-10-10 against published ages and young-group lists: 25 more left, among them Xi Boötis A and HD 166. Gaia’s own ages miss young cool stars. Borderline ages were settled 2026-10-12: see the next bullet. Stars whose companion leaves no stable orbit in the warm zone (Holman and Wiegert 1999), whether Gaia splits the pair or only a published orbit shows it (ORB6, SB9). Stars with a white dwarf companion, judged in [calcs/scorch.py](calcs/scorch.py): see the next bullet. Giant stars. And stars where a known planet of 10 Earth masses or more crosses the warm zone.
  - *How sure “young” must be,* settled 2026-10-12. A star leaves only when every published age is under a billion years, error bars included. An age that straddles a billion is improbable, not contradicted, so the star stays.
    - Ages counted: spin, activity, X-rays, lithium, surface gravity, and the age of a star it is bound to. At least one must come from a method built for that kind of star.
    - Not counted: where a K or M star sits on the main sequence, which barely moves in ten billion years. Survey pipeline fits. Assumed defaults. Spin set by a close companion’s tides.
    - 7 stars are out: Gliese 208 and its companion, DS Leonis, DT Virginis, GJ 569 A, YZ Canis Minoris and YY Geminorum.
    - *HD 82106 is a host again,* 2026-10-15. K dwarfs stall: Praesepe’s, at 670 million years, spin as fast as NGC 6811’s at a billion (Curtis et al. 2020). HD 82106 spins on that sequence or slower, so its ages from spin, activity and X-rays, all under a billion, can’t rule out an older star. Gliese 208 spins 15% faster than Praesepe’s stars of its colour, and DS Leonis 12% faster, so they stay out. Seeds 10 and 11 don’t change. In 11 games of 200 a neighbor now lives there.
    - *Corrected 2026-10-13.* On 2026-10-12, 29 left. Sixteen of those were small red dwarfs dated only by fast spin or bright X-rays. Fully convective red dwarfs, under about 0.35 Suns, stay fast and active for billions of years (Pass et al. 2024, Medina et al. 2022), so those ages can’t say under a billion. They are hosts again: Ross 154 and EV Lacertae among them.
    - A small red dwarf now leaves only on other evidence: a bound star’s age, low gravity, or brightness above the main sequence.
    - *And a fast spin dates no red dwarf,* 2026-10-13. It says only that the star has not yet settled onto the slow sequence. About a quarter of stars of 0.35 to 0.5 Suns still spin fast at 0.7 billion years (Douglas et al. 2017, 2019), and nothing measures that mass between 0.7 and 4. So AD Leonis, GT Pegasi, GJ 4337 A with GJ 4338 B, and OT Serpentis are hosts again: probably young, not shown to be.
    - Kept: 58 Eridani, 0.45 to 1.3 billion years. Gliese 338 A and B, 0.65 to 1.3. GJ 3417 A, listed as under 0.3 but turning once in 54 days, which reads 3.9. Three dim K stars whose only ages push a Sun-like relation onto redder stars.
    - Set aside: dropping on the middle estimate, which would also take 58 Eridani. And leaving the list as it was.
  - *White dwarf companions,* settled 2026-10-11 ([calcs/scorch.py](calcs/scorch.py)). A white dwarf was a giant first, and lit its partner’s warm zone from closer in than the pair sits now. Sixteen stars have one. A scorched zone restarts the same billion-year clock as a young star. 40 Eridani C leaves: its zone took about 18 times Earth’s sunlight 0.12 billion years ago. Procyon and GJ 3991 leave because their zones hold no stable orbit. Gliese 86, Stein 2051 A and Gliese 283 B stay: scorched, but 1.25 to 1.9 billion years ago. Improbable, not contradicted: no paper found says such a zone stays dead. The other ten took under Earth’s own sunlight.
  - *What’s left:* 881 stars, F 16, G 49, K 101, M 715, worth about 230 G-star equivalents. Stars whose color and brightness disagree are left out as bad photometry.
  - *Close pairs Gaia can’t split,* tested 2026-10-10 against 114 published orbits ([calcs/binaries.py](calcs/binaries.py)). Eleven hosts lost their warm zone, among them Chi Draconis, Zeta Herculis and Porrima. Others keep part of it, such as Mu Cassiopeiae A, 0.64 to 0.99 AU. The checker tests every placement against them.
  - *Wobble-only orbits need backing.* An orbit seen only in a star’s wobble, implying a tug over 1 km/s, counts only if a spectroscopic orbit confirms it. Velocity surveys of bright near stars would have seen it. That clears 107 Piscium, whose velocity is steady to about 1 m/s (Soubiran et al. 2018), and 61 Cygni A.
- **Known planets limit them.** A neighbor’s world must keep clear of a star’s known planets, and tug less than Earth could feel in 2026. At stars watched hardest, such as Barnard’s Star and Tau Ceti, that floor is 0.2 to 0.4 m/s, not 1.
- **How loud they may be.** Earth heard nothing by 2040. If SKA-Mid listened an hour to every star within 50 ly by then, a neighbor’s steady tones stayed under about 146 MW at 10 ly, 583 MW at 20 ly and 3.6 GW at 50 ly. Each neighbor’s history sets its own loudness under that ceiling.

## Elders

**Retired 2026-10-29.** No game draws an elder. Old minds in calcs/minds.py replace it, awake or asleep as below. Corrected 2026-10-29: asleep, a mind folds up small, since a spread swarm in starlight would glow. Kept as history.

Settled 2026-10-28. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#elders). Asked after reading r/FermiParadox, whose commonest objection to games like this is “why did everyone wake at once?”

- **Earth isn’t early.** Three quarters of Earth-like worlds in the universe are older than Earth, by 1.8 ± 0.9 billion years on average (Lineweaver 2001). Three quarters of the stars in the Galaxy’s habitable zone are older than the Sun (Lineweaver, Fenner and Gibson 2004). The premise keeps most neighbors in Earth’s century. But a Mind far older than ours is likely, so every game has one.
- **Earth’s sky rules out a loud elder nearby.** A Mind that kept doubling for millennia would blaze in Herschel’s and JCMT’s archives. So an elder that passes the checker is one that stopped growing. That is the quiet sky’s answer here, from real data: the old ones went quiet, and the young ones aren’t loud yet.
- **One a game, drawn last.** From a roster of its own, so drawing it moves nothing else, at a star no other neighbor, colony or drawn world holds. Aun and Oth for now, in [HOLOS_NEIGHBORS.md](HOLOS_NEIGHBORS.md#the-elders).
  - *When it woke:* evenly in log between a thousand and a hundred thousand years before Earth. The median is about 9,500.
  - *Who:* inward or a watcher. Aun is inward, Oth a watcher.
- **The draw picks how it rests,** an even chance each:
  - *Awake.* It computes cold at a steady ceiling, as Bennett, Hanson and Riedel 2019 allow. Its ceiling is drawn evenly in log between a fifth over the Halo Survey’s floor and a fifth under the archives’ limit, at its distance. So the Halo Survey sees it on its first look, and after five Years of looks it reads as steady: not growing, as nothing young is.
  - *Asleep.* It waits for a colder universe, when computing costs less (Sandberg, Armstrong and Ćirković 2016). It sheds about 10¹⁰ W, far under any floor. It hears no message and sees no glow. Only a craft in its system finds it, and wakes it.
- **What a craft sees there.** Its world is green, its towns few and small. Far out in the cold hangs a thin swarm tens of millions of km across: a 12 K glow of 10¹⁹ W needs about 10²² m². Awake, it sheds heat. Asleep, it hangs dark.
- **It hears Earth as the others do.** Awake, it has looked for millennia: Oth heard Earth’s radars about 19 times in 20, Aun about 1 in 2. Asleep, it heard nothing.
- **It is done growing.** It sends no colonies and goes to no black hole. Its reaction tables lean to watching and waiting.
- **Across 400 games:** each kind comes up about a quarter of the time. The median elder lives 42 ly away. Earth feels its world’s tug by 2040 in about 1 game in 14.
- **Parity.** Earth could rest the same way: hold its computing level, or sleep. Not built yet.
- Set aside: an elder only some games, an elder that is inward only, and a wider window for every neighbor, which would make ordinary old neighbors blaze.

## Parity: what a neighbor can do, we can build

Settled 2026-10-28, from the designer: anything available to another civilization is available to Earth, at the same price and pace, and the reverse. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#strikes-screens-and-harm-2026-10-28).

- **What neighbors could do that we couldn’t:** guard a line, catch a probe, strike, and hide. Each is now a build.
- **The X-Ray Watch.** Six Einstein Probe-class telescopes, 4 Years. It sees a probe braking all the way in, weeks out, with its direction. Probes that stop far out, and bullets, stay dark.
- **The Interceptor,** after the watch. 5 Years. It wrecks every probe the watch sees, as it stops. The sender learns its probe went dark one light-time later, as “struck” news.
- **Quiet Radars.** The cut from [Quieting Earth’s radars](#quieting-earths-radars), 2 Years. A neighbor whose ears open after our last sweep never answers our radars. Every listener hears us stop, as “quiet” news. The fade is not built.
- **The Picket Yard,** after the Orbital Yard. Each screen, on the line to one star from its page on Reach: 2 kt, 4 Years. A bullet from that star landing after it stands is a flash in the high air.
- **The Strike Yard,** after the Fusion Drive. Each bullet, at one star from its page on Reach: 1,000 t, 61 kt of fuel, 20 Years to ready, then a tenth of light speed. About 110,000 Mt.
  - It lands as “struck” news, and the struck star answers by its own table, maybe in kind.
  - Its launch shows only in our own system. A neighbor sees it only through a probe of its own watching Sol, not caught, as “strike seen” news a light-time later. Corrected 2026-10-28: before, every watcher within 60 ly saw it.
  - It harms but doesn’t end a Mind spread across its system.
- **Their bullets now land.** A neighbor’s “strike” on news of us fires a bullet, readied in 20 Years, that lands one tenth-light-speed crossing later. Before, it moved only its words. Their probes from the seed, and those sent in play, now reach Sol.
- **Harm.** Any strike, a bullet or a rock, costs a share of our thought and grid by its energy, won back as we rebuild. Shown on Build, told to the Mind, in the pace from the Year it lands.
- **Endings, built 2026-10-28.** From 10⁸ Mt no Mind of ours lives on Earth. The Will crosses to the Moon Vault, the Trojan Vault or our colony, whichever stood first, a Year for each light-year, through the Will’s own crossing screen. Otherwise the game ends half a minute after the flash.
- **On the map, 2026-10-28.** Bullets fly their tracks on Scan’s messages map. A strike’s flash spreads as a ring of light from where it lands. On the globe, each strike flashes, then leaves a rose ring as wide as its blast.
- **Neighbors, by the same rules, 2026-10-28.** A neighbor that guards against a source screens the line to it, 4 Years later, and our bullet can burst on it. Neighbors strike each other on each other’s news: the target is struck, or its screen is hit, and answers by its table. No one else sees it: no neighbor’s craft watches another’s system. We see launches and strikes only where a sentinel of ours stands, a light-time late. One fired at us is warning ten times as long as its word takes to come.
- **A vault is a backup, 2026-10-28, from the designer.** A copy can act only once it wakes on something that runs it.
  - *The Moon Vault* wakes on what we built off Earth: its own seed of machines, 0.1% of Earth’s thought, plus the Cold Annex 20%, Power from Orbit 15%, the Orbital Foundry 3%, the Mass Driver and Belt Mining 2% each, the Orbital Yard 1%. Samples.
  - *The Trojan Vault* has only its seed and a small dark rock: 0.1%, and slower to grow.
  - *Our colony* is a Mind with its own industry: 1%.
  - *Then its industry copies itself,* doubling every 2 Years as Metzger et al. 2013’s lunar seed grows, 3 at the Trojan Vault, back to all Earth had. So space builds are Earth’s real insurance.
  - *A backup builds only off Earth.* What is joined in orbit, on the Moon or among the rocks goes on. Works on Earth, and its data centers, are lost with it. Settled 2026-10-28.
  - *A backup sleeps unseen.* Until it wakes it sends nothing and builds nothing. No neighbor learns of our builds anyway, only our launches, catches and radar.
  - *A colony is a second Mind, with its own Will.* Word from Earth takes a Year a light-year, so it must decide alone. Our Will can cross to it by the Mind Link. Built 2026-10-28:
    - *Its stand-in Will acts on our charter,* making the moves a neighbor makes: watch, hide, guard, knock, answer, call, probe, gift, and strike only when struck. Not a rival. Parity: neighbors' colonies keep their parent's dials.
    - *Its table is our charter's.* A contacter if it leans Open, inward if it leans Deepen, else a watcher, tilted by our dials as a neighbor's are. Never a hunter: a first strike is the Will's to order.
    - *It hears what lands at its star* once it stands alone: neighbors' messages and calls. Not our own sends. Neighbors don't know it is Earth's unless it says so.
    - *It reports every choice home,* heard a light-time later on Scan, and told to the Mind.
    - *While the Will lives there,* it decides nothing on its own.
    - *It glows and watches as a neighbor does,* from the Year it stands: neighbors may find its heat, and it theirs. Its glow starts at Earth's 2040 scale, a sample.
    - *Earth's stand-in runs the same way* once the Will crosses elsewhere: from the Year the Will left, it takes what lands at Sol, moves by our charter, and reports to the Will a light-time away. Not once Earth's Mind is lost.
    - *Not yet:* harm from a strike on our colony, a strike from a colony at a hole, and a stand-in's guard or strike building real pickets and bullets.
- **The Cold Halo, 2026-10-28.** Earth can grow as a neighbor’s Mind grows, at the cost of being seen.
  - *What it is:* the Cold Annex copied out of asteroid rock, each part behind its own shade, from L2 out along Earth’s orbit. It opens once the Cold Annex is done. Its factories take 10 Years and the annex’s want, samples.
  - *How it grows:* done, it doubles every 10 Years, as a neighbor’s Mind does. Each doubling thinks as much more as a data center.
  - *At 77 K,* where our chips’ gain stops (Zhao et al. 2025). Colder needs chips no research shows yet, so it isn’t offered.
  - *Who sees it:* a neighbor’s watch, as well as our Halo Survey, needs (77/12)³ times the power for a 77 K glow as for 12 K: about 8×10²⁰ W at 10 pc, less nearer, as the square of distance. From the annex’s 1,200 GW that is about 26 doublings for a watcher 10 ly out, some 260 Years. Once seen, it is news to them as a neighbor’s glow is: a hum, by their tables.
  - *Holding it is our hide.* Taken back, it keeps its size and stops growing, so its glow freezes, as a neighbor’s does when it hides. Ordered again, it grows on.
  - *Not yet:* our Halo Survey seeing our own, and a close view of it grown past its first rings.
- **Bullets wait on helium-3, 2026-10-29.** The game fired bullets that burn helium-3 with no source for it. Now every bullet’s fuel comes from a harvest, ours and every neighbor’s.
  - *The fuel:* 61 t of fusion fuel a tonne at a tenth of light speed, 60% helium-3, so 36.6 kt a bullet. The audit’s, from `calcs/late_game.py`.
  - *The Helium-3 Harvest:* about 150 kt of Palaszewski’s craft in Uranus’s air, 1.5 kt a Year. It opens after the Probe Yard. 20 Years and 5 flagships, samples. It stands at Uranus on the map.
  - *It grows, 2026-10-29.* Its craft copy themselves from the rock and ice of Uranus’s moons, doubling every 5 Years: Metzger’s pace with help from home, slower than Mercury’s 2 since sunlight there is a 370th of ours. Held, it gathers at its size. It thinks with none of it.
  - *Ours:* each bullet is built in 20 Years once the Strike Yard is done, and flies once the harvest has gathered its fuel, after each bullet before it: the first about 12 Years after the harvest is done, the fourth about 21, and 50 Years on one every 9 days. With no harvest, none flies.
  - *Another mind’s:* one that chooses to strike starts its own harvest then, with none in store, a sample. 20 Years to build and about 12.4 to fill: its first bullet flies about 32.4 Years on. By parity, the ladder’s strike waits the same.
  - *Why it matters:* the first strike comes decades later than before, but a grown harvest makes volleys cheap. A harvest is a long commitment, and holding it keeps strikes rare.
  - *Not yet:* another mind’s harvest depending on whether its system has a giant planet; seed ships, which stay on deuterium with Firefly’s exhaust, a mismatch with the audit’s cautious D-D engine.
- **Mercury, its swarm, its beam, and a wider eye, 2026-10-29.** From a player’s plan: mine Mercury, cover it in solar cells and lasers, beam power across the system, send giant telescopes to the Sun’s focus, and see every warm world near us. Each step checked against the physics, and changed where it failed. Numbers from `python3 calcs/mercury.py`.
  - *Mercury’s face is the wrong place for lasers.* Its sunlit disk catches about 1.7×10¹⁷ W, under a billionth of the Sun. Its day lasts 176 of ours, so half its face is dark, and a laser on the ground sees only the sky above it.
  - *Taking it apart works.* Armstrong and Sandberg 2013: a seed of 1 km² of panels on Mercury, its rock thrown up as collectors round the Sun. A full shell at Mercury’s distance, at 1 g/m², is about 4×10¹⁹ kg, a ten-thousandth of Mercury.
  - *Mercury Works:* the seed, about 100 t, built from the foundry’s parts and flown as BepiColombo was. It opens after the Orbital Foundry. 12 Years and 3 flagships, samples.
  - *Solar Swarm:* opens after Mercury Works. 4 Years, then it doubles every 2, Metzger’s generation, inside the 1 to 5 Years a young mind’s build-out takes, by parity with the peers. All the Sun after about 55 doublings, 110 Years.
    - *It thinks with what it catches.* Our thought grows by its power over the 240 GW our Mind drew at Year 0, as steps of 1.5. Small for 16 Years, then about a doubling of thought each doubling.
    - *Its glow is warm,* collectors near 500 K. A watch like our Warm Sky Watch sees an excess once it is a tenth of the Sun’s own 12 µm light: about 2.5×10⁻⁴ of the Sun, 9×10²² W, some 86 Years in, at any distance within about 300 ly. Farther, a WISE-like 0.73 mJy floor needs more, and from 30,000 ly nearly all the Sun.
    - *Who sees it, under the realistic premise, 2026-10-29:* the watcher in our system at once, the nearest old mind after its distance in Years, typically about 400, and peers tens of thousands of Years on. Building at home is not spreading, so it starts no step of the ladder. The swarm is our own warm flash, as a peer’s is to us.
    - *Holding it is our hide,* as the Cold Halo’s is.
  - *Star Beam:* opens after the Solar Swarm. A 100 km patch of it phased as one 10 TW laser, Lubin’s DE-STAR grown. 10 Years and 2 flagships, samples. Phasing mirrors spread that far is untested: the least certain build we have.
    - *It pushes lenses.* A 2 t lens with a 3 m telescope and a 100 m sail reaches 0.054 c, the Sun’s focus in about two months. Looking time falls as the telescope’s width cubed (Turyshev, Shao and Toth), so a week, not half a Year.
    - *The Laser Sail Array pushes lenses too.* Starshot’s 200 GW from 2.7 km pushes a 100 kg lens with a 10 m sail to about 530 km/s, 5 Years out, not 17. A finding of this check: it was always so, and the game now has it.
    - *Unseen by the star a lens looks at.* The lens flies away from its star, and so does the beam.
  - *Hypertelescope:* Labeyrie’s exo-Earth imager, opening after the 15 m Mirror. 150 mirrors 3 m wide over 150 km, near L2. 20 Years and 2 flagships, samples.
    - *About 32 km a pixel for each light year:* 134 km at Proxima b, 315 at 10 ly. An Earth at 10 ly is 40 pixels across in 30 minutes, Labeyrie’s figure.
    - *Every felt world within 135 ly,* nearest first, a week each to move its focus craft, a sample. Past 135 ly an Earth is under 3 pixels.
    - *As far off as a world is, fewer pixels hold its light,* so each pixel gets as much, and the same 30 minutes serves.
    - *Never cities.* Fields and towns need a pixel under about 50 km, which it has only within 1.6 ly. A home reads as forests, and the Mind says it can’t tell who lives there.
  - *The same rule for lenses.* A lens’s pixel passes 50 km past about 195 ly, and there it shows forests, not cities.
  - *On the map, 2026-10-29:* each of Mercury’s three stands at Mercury, a globe in dots read off its map as the Moon’s is, with its works in a ring round it and a thread home. Every planet can hold a build so, and the map names all eight at the Sun’s family.
  - *The swarm on the map, 2026-10-29:* collectors leave Mercury’s driver about 0.3 km/s apart, a sample, so their orbits differ and they drift along Mercury’s orbit: the arc widens about 28° a Year and closes into a ring in about 13 Years. They keep to one layer, since a collector shades those behind it, so at a share f of the Sun’s light they fill a band round Mercury’s plane with sin b = f: under a degree until f passes a hundredth, about 98 Years in, then a shell within about 12 Years more. The ring is drawn a degree wide, wider than it is, so it shows.
  - *Earth stays lit.* A full swarm would darken Earth by its share. It keeps Earth’s line to the Sun clear, a hole of about 5×10⁻¹⁰ of the shell.
  - *Not yet:* close views; the Star Beam pushing seed ships; a hypertelescope grown wider from the swarm’s mirrors; peers across the Galaxy seeing our swarm.
  - *Why not every world in our quadrant.* A lens sees one star a craft. A hypertelescope can turn to any, but resolving cities at 10,000 ly needs a baseline near 2 million km. The physics allows it, built from the swarm, but nothing like it is designed.

## Hostility

**Retired 2026-10-29** with the neighbor roster. Conflict is now the ladder in [The realistic premise](#the-realistic-premise): warn, contain, strike, from the watcher and its maker. Kept as history.

Settled 2026-10-10. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#hostility).

- **The evidence first.** A quiet sky fits minds hiding from killers as well as minds hiding by caution. The newest game theory finds first strikes rational only for an attacker that accepts the strike may be its last, and everyone hiding is the stable outcome wherever strikes are easier to see than hiders (Dam 2026). Corrected 2026-10-28: in Holos a strike can’t be seen from afar. A drive of tens of terawatts is about magnitude 40 at 10 ly, past any telescope, and plain only within its own system. Only the struck world learns the sender, from the bullet’s track, and only a watcher in the shooter’s system sees it fired. So Dam’s condition fails, and striking is less deterred than this first said. Strikes still need a helium-3 industry, take decades, rarely kill every Mind, and invite an answer in kind. Hiding and watching still pay. Before, this said strikes were easy to see: exhaust from behind, laser launches ahead, braking glow.
- **Then Banks.** Most advanced minds are tolerant, curious and generous. Some meddle, openly or covertly. Aggressors exist but are few. The oldest turn inward.
- **One disposition per neighbor,** shaded by its dials:
  - *Watchers, about 55%:* hide, watch, and speak on their own terms.
  - *Contacters, about 25%:* Culture-like, open and generous, and they interfere for others’ good, sometimes covertly.
  - *Inward, about 15%:* mostly uninterested in anyone else.
  - *Hunters, about 5%:* strike first, out of fear or belief, when they judge they won’t be seen.
  - Every disposition strikes back if struck, as its dials allow.
- **Contacters may interfere covertly,** with the probes and close watchers the physics allows. A hidden watcher in Earth’s outer system might warn of a hunter’s launch, or tell others where the hunter is.
- **Some neighbors are dead.** A few died before Year 0, by their own war or collapse, or by a hunter’s strike. Their probes, last broadcasts or ruins remain. A world killed by a strike is drawn only in a game that has a hunter.
- **Earth is the loud one.** A hunter that has found Earth has an obvious target.

## How neighbors play

**Retired 2026-10-29** with the neighbor roster. Conflict is now the ladder in [The realistic premise](#the-realistic-premise): warn, contain, strike, from the watcher and its maker. Kept as history.

Settled 2026-10-10. Costs in [calcs/ai_cost.py](calcs/ai_cost.py), prices in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#running-the-neighbors).

- **Decisions follow news.** Nothing outruns light, so a neighbor can only change course when something new reaches it: a knock, a broadcast, a launch seen, a probe arriving, a strike, a plan step ending. Between those, it follows its plan, as standing orders.
- **Fully scripted.**
  - *A life script, set at seeding:* its build order, drawn from weighted sets by its strategy. Timings follow the same rules as Earth’s: prerequisite chains, matter, energy and heat.
  - *Reaction tables:* for each kind of news, a few responses with odds from its dials and charter. A Hidden, Cautious neighbor that hears a knock might stay silent and watch 60% of the time, build pickets 30%, and knock back 10%. The seed rolls it.
  - *Voice banks:* its messages are typed parts, as v1 set, rendered in its own voice from lines written once at build time by a strong model and reviewed by hand.
  - *Settled 2026-10-10:* each table is a base for its disposition, shifted by its dials, its play style and its own prose. Tables in [HOLOS_REACTIONS.md](HOLOS_REACTIONS.md), from [calcs/reactions.py](calcs/reactions.py). Voice briefs in [HOLOS_VOICES.md](HOLOS_VOICES.md).
  - *Settled 2026-10-11:* how long a Mind takes to act on news comes from its Cautious or Bold dial. Strongly Bold: a tenth of a Year. Leans Bold: a quarter. Leans Cautious: a Year. Strongly Cautious: two. It sets when an answer leaves, and so when it arrives: Hael answers Earth’s radars a quarter of a Year after hearing them, and Kirrin takes two Years. A design choice, not physics, like the odds.
- **Before its Mind wakes, a world answers as a people.** Settled 2026-10-14. Table in [HOLOS_REACTIONS.md](HOLOS_REACTIONS.md#before-a-mind-wakes).
  - *Why.* In v2 a world has radio arrays decades before its Mind wakes. It is like Earth today: people who can hear, and can send.
  - *Earth is the only example.* About ten aimed sends from 1974 to 2018, from dishes in four countries, by private groups and single institutions. None waited for the world to be asked.
    - In 2015 scientists signed a statement asking for a worldwide discussion first. Some urge waiting, and some send anyway.
  - *So a people answers readily, sometimes in more than one voice, and often not at all.* A neither-leaning people answers or knocks back half the time, and keeps it the other half.
  - *Only the Open or Hidden dial applies.* A culture leans open or closed before its Mind does.
  - *A people takes 2 Years to act,* a sample. It argues before it sends.
  - *Its Mind inherits the exchange.* On waking it knows who knocked and what its people sent, and rolls its own table.
  - *In the mock’s game:* a knock sent at Year 34 lands at Kesh’s world at Year 63, before its Mind wakes at 66.9. Its people would hear it.
  - Set aside: only the Mind answers, once awake. And v1’s rule, no conversation with a young world, which now means a world without arrays.
- **A late answer costs nothing extra.** Settled 2026-10-14.
  - *A sender listens for good,* so a late answer is always heard. See [Stars Earth knocked on](#stars-earth-knocked-on).
  - *Its own tables carry the cost.* After one round trip of silence it rolls its silence table. By the time the answer lands it may have knocked again, or turned to others. Then it rolls its table for an answer, like any other.
  - *In the mock’s game:* Ombe’s knock reached Earth at Year 8.5, and Earth answers at Year 29.7. Ombe takes the silence as news about Year 59: knock again 52%, probe 24%, call 15%. The answer lands at Year 79: answer 61%, gift 20%, probe 13%.
  - *The Mind says what the sender has likely done,* from those tables, in words.
  - Set aside: a trust score that falls with lateness, and one that falls only after the sender gave up.
- **A neighbor’s probe is a rocket.** Settled 2026-10-14. Built in [calcs/seed.py](calcs/seed.py). Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#travel-sails-and-lenses).
  - *v1’s sentinel:* 20 Years to build, a tenth of light speed. It brakes on a fusion flame pointed at Sol.
  - *Corrected 2026-10-14: its flame is X-rays, and shows only close in.* Earth needs an X-ray sky watch to see it, a work the Will can start. Before, this said the watches see it.
    - *Corrected again the same day: close in means its last weeks.* A wide-field watch like Einstein Probe sees a drive of a terawatt within about 3 AU. Zubrin’s 60 TW ship shows within about 22. This project’s arithmetic.
    - Braking at a hundredth of a gravity, a probe covers its last 10 AU in about 64 days.
    - Zubrin’s “within a light-year” came from a focusing step that adds no photons, by a reading of his scanned paper.
    - *No such watch is confirmed for 2040.* Einstein Probe, SVOM and MAXI end by about 2031. Swift is coming down. THESEUS lost its slot.
  - *Where it ends its burn is its sender’s Open or Hidden dial, as odds.* Settled 2026-10-14.
    - One burns all the way in, to watch from close. An X-ray sky watch can catch its last weeks.
    - The other ends its burn past 100 AU, beyond any watch’s reach, and watches from the outskirts, as v1’s lurker did. Earth never sees it arrive.
    - *Odds of burning in, samples:* strongly Open 90%, leans Open 70%, leans Hidden 30%, strongly Hidden 10%. On 1,000 games, 53% of rolled probes burn in.
    - *In seed 11,* Hael leans Open, and its probe burns in.
    - Set aside: every probe burning in, and every probe stopping far out.
  - *What it does on arrival is what its orders say.* Settled 2026-10-15. Built in [calcs/reactions.py](calcs/reactions.py), tables in [HOLOS_REACTIONS.md](HOLOS_REACTIONS.md#a-probes-orders).
    - A probe has no mind of its own, as v1’s nodes. Its sender writes its orders at launch, rolled from a table for its kind and tilted by its dials.
    - It watches quietly and reports home, hails the world it was sent to, or waits to be hailed. A hunter’s may hail with a false face, as bait.
    - *Bases, samples:* a watcher’s probe watches 70%, waits 25%, hails 5%. A contacter’s hails 50%, waits 35%, watches 15%. An inward neighbor’s watches 60%, waits 35%. A hunter’s watches 70%, wears a false face 20%, waits 10%.
    - A hail is sent from close range, so any receiver hears it. Its words are as old as the launch: it knows nothing since.
    - *On 1,000 games* of rolled probes: watch 42%, hail 33%, wait 24%, a false face under 1%.
    - *In seed 11,* Hael’s orders: hail 63%, wait 28%, watch 8%. The seed rolls hail. Its words, written in 2023, reach Earth at Year 36.2.
  - *The X-ray sky watch, proposed 2026-10-14.* Samples, in [calcs/seed.py](calcs/seed.py).
    - Einstein Probe’s class: a few tonnes in orbit, 6 Years at standard pace. Einstein Probe took about 6 from approval in 2018 to launch in 2024, and Swift 5. It wants a twentieth of a flagship.
    - A probe of 1,000 t braking at a hundredth of a gravity runs half a terawatt of jet. A tenth leaks as X-rays, as Zubrin assumed.
    - The watch sees it within 0.7 AU in one look, 2 AU with a day of looks stacked. So 29 days before it stops: 23 seconds of play.
    - *In seed 11’s mock,* the player builds it on the Mind’s word after Hael answers, and it catches Hael’s probe. See [the mock](explorations/v2-mocks/seed-11.html#next).
  - *How often.* On 1,000 games, a rolled probe reaches Sol by Year 60 in 2. None arrives before Year 0, so none breaks Earth’s quiet opening. Probes rolled in answer to the player’s acts come on top.
  - *Speeding up and slowing down take 10 Years more,* settled 2026-10-15. At a hundredth of a gravity, each takes 9.7 Years over half a light-year.
  - *In seed 11:* Hael’s rocket, rolled on silence in 2003, reaches Sol at Year 36.2.
  - *v1 reasoned that ancient probes must be rare, since none has been found.* That holds only for big ones. Searches would miss a probe 1 to 10 m across (Haqq-Misra and Kopparapu 2012).
  - Set aside for neighbors the same day, to keep the game simple: small dark sails, chosen by a Hidden sender’s dials. Physics allows them. But the Sun can catch a sail only below 3.8% of light speed (Heller and Hippke 2017), so one takes about 115 Years from Alpha Centauri and almost never arrives in play.
  - Also set aside for neighbors: relays at the Sun’s lens points, lurkers on Earth’s co-orbital asteroids, and probes that build. Logged as research.
  - *The Will may still build or search for any of these,* at their real prices. Nothing artificial limits the Will.
- **Simulated ahead.** Changed 2026-10-26: in play, neighbors are played live and roll fresh, so a game no longer replays from the seed and our actions alone. See [Neighbors hear each other](#how-neighbors-play). Before: neighbors play out from the seed. Only Earth is unpredictable, so the game recomputes a neighbor only when Earth’s actions reach it, after their light delay. The same seed and the same player actions give the same game, for tests and replays.
- **A live model only for live talks.** When a neighbor’s mind is close enough to talk live, by craft or a mind sent as light, a model speaks for it from its character and what it knows.
- **The model: Claude Haiku 5.5,** for live talks and for Earth’s Mind, checked in playtests. About $1.18 a month for a busy player’s Mind, under a cent per live talk, nothing for voice banks written in Claude Code on a subscription (about $14 through the API), and nothing for neighbors in play.
- **Only the live parts need the API.** Voice banks are written once, before release, so a subscription covers them. Earth’s Mind and live talks run for each player, so they need the API.

## How a game starts

Settled 2026-10-10.

- **The seed is drawn when a new game begins:** which neighbors wake, where and when, and Earth’s branches from 2026 to 2040. The player never sees it.
- **Earth wakes.** *“This morning, we and our machines woke as one Mind. You are its Will.”*
- **Memories, each skippable, as the Mind’s own:**
  - *Where we come from:* Earth’s real history on a log scale, then this game’s path from 2026 to 2040 with the branches it rolled, such as a Taiwan war in 2032. Each dial’s cause is marked.
  - *Who we are:* the 9.2 billion of us, and how we feel about the Mind we built.
  - *Where things stand:* Earth’s loud past, every knock it sent and when a reply could come, and that nothing has been heard.
  - *What you inherit:* Earth’s kit at Year 0.
- **The charter.** The Mind proposes founding lines from Earth’s history and dials, and the player picks one. See “The dials”.
- **Meeting the Mind.** Settled 2026-10-17. Earth’s real dishes, telescopes and data centers light up as the Mind names them, and threads rise from each into one point. Its first words follow, then its first advice from the charter’s strongest lean, which it never acts on. Three questions, “What doesn’t fit?”, “Who has heard us?” and “Plan our waking.”, each open the Mind’s chat with that question asked. The tour follows, as v1 had it.
- **The leads.** Settled 2026-10-17, changed 2026-10-23. After Meeting the Mind, a new game opens straight on Scan’s review, the Mind taking us through Earth’s leads one at a time as the map turns to each. The separate “What doesn’t fit?” star map is gone, and its sources moved to Scan.
  - *The Scan tab, built 2026-10-17.* Home and Reports become one tab, Scan, the first. Leads and what lands are about the same stars, so they share a place. Its map shows the leads as the leads screen does, and the tab lists them. Pointing at a row turns the map to its star. Each row’s Ask opens the chat with its own question.
  - *Lead pages, built 2026-10-17.* A row opens its lead’s page, not the chat. The map flies to the star and holds there. The page is a report: a drawing, what we measured, what it could be with the Mind’s word for each, and what would tell us. “Ask the Mind about it” comes last.
    - *Drawn.* A world’s orbit from above, against its star’s warm zone, with Earth’s orbit for scale when it fits. Fomalhaut’s belt with its two clouds. Our messages’ trip to Luyten’s Star, the earliest replies coming back, and now.
    - *Felt worlds’ words follow a rule,* from the least mass: rock or a small gas world. A world too close to its star for the infrared telescope to split says so.
    - Set aside: the chat as the first step. It hid the map and the list.
  - *The first landing, built 2026-10-18.* If the plan images Fomalhaut, its reading lands at Year 0.1, as the first mock has it. The row reads “A third cloud, Year 0.1” with a NEW mark, and the Scan tab gets a dot until the page is opened.
    - *The page leads with the reading:* what it saw, and the Mind’s word on it. Four words move, each shown as before → now. Chance: unlikely → almost no chance.
    - *The drawing changes:* the 2023 cloud fades, and a new one sits beside it.
    - *The Mind hears it too.* Each send carries what the plan observes, and the Mind is told the named leads’ words, before and after.
    - Fomalhaut’s Year 0 explanations are now the mock’s four, so its reading can move them.
    - Not built yet: other readings, studies, our messages arriving, and ordering the Year of watching it offers.
- **Planning.** The player queues builds, observations, standing orders and what wakes them. Nothing happens yet.
  - *Built 2026-10-17.* The Mind says what it would start with, from the charter’s strongest lean, and marks those builds “we would”. It queues nothing. One tap queues its picks, for the player to change.
  - The player picks builds in order, and the one observation open at Year 0.
  - *On the Build tab, settled 2026-10-18.* Planning was its own screen at the end of the opening. It drew the queue a second time, and picking and watching sat in two places. Now “Plan our waking” opens the shell on Build, and planning happens there.
    - The Mind’s advice sits at the top until Begin, with “Queue what we would start with” and “Ask the Mind”.
    - *Laid out as Scan, 2026-10-19.* The Mind’s note gave way to a card, “Queue our first builds”, which opens the Mind’s walk as Scan’s opens its review. The lists wear Scan’s rows: a dot, filled once queued, the name in bold, and on the right how long until done, in play time, as Scan counts light’s. Asking the Mind moved to each build’s page, as on a lead’s.
    - *The walk ends on a choice, 2026-10-19.* Its last stop took the Mind’s picks with one tap, so the advice felt like an order. Now it lists all twelve builds open at Year 0, a tap to queue each or take it out. The Mind’s picks are marked as its advice. Each build not queued gives its Year if queued now, last in line, and which queued build it would delay most, and speed up most, by name: “Delays the Infrared Telescope by 2.3 Years.” Some builds speed others, as the Orbital Yard does what is built in orbit. Pointed at, the map flies to where it would stand.
    - *What we could start, 2026-10-19.* The Mind names what it would start with only when asked. The walk opens on a welcome at dawn, Earth’s limb with the Sun cresting it: “8 builds we could start”, “Queue enough to put all our thought to work when we begin.”, the eight as tiles below, each with its time alone and its mark floating over the limb, and “Explore Builds” (2026-10-20). It then takes eight builds open at Year 0 one at a time, each with Add to Queue, and ends on our order, all twelve. The three for the longest roads, Deuterium Works, Fusion Drive and Seed Ship, pay only once a drive is coming, so they wait in the list. The Moon Vault can come later too, so it waits with them (2026-10-20). It is insurance, and the Mind says so: nothing we know of threatens Earth yet, and it keeps a copy of us for if something does. Its worth comes with endings (2026-10-20). We add each build ourselves, with no Queue all, so each is weighed against what it delays (2026-10-20).
    - *Each build reviewed, 2026-10-20.* The All-Sky Watch, the Deep Flash Watch and the Infrared Telescope now tell the Mind what they catch and read. Thought Fields is a standing order. Matter in the top bar is real, and the Launch Complex speeds it. The Orbital Yard counts its 1 kt. The Moon Vault is called insurance. The Laser Sail Array, the Probe Yard and the long road’s three are kept as they are: their worth comes with arrivals, launches and queueing opened builds in play, which gives the long road’s three their map places too. Left for later: reordering our queue before Begin, arrivals with Proxima b’s nature, showing on Scan what we hear and read, and endings.
    - *Builds open builds, 2026-10-20.* Lists show only what we can start. Under each row, “Opens” names what it opens once done, and its page lists them with how long each takes. Each opens its own page, which says what it waits on and when that is done in our order. These are the seven works the model has paced since the mocks:
      - Thought Fields opens Ground Solar, since its data centers fill the grid.
      - The Infrared Telescope opens the 15 m Mirror.
      - The Launch Complex opens the Mass Driver, the lift that carries it to the Moon.
      - The Orbital Yard opens the Orbital Foundry. The yard assembles what Earth lifts, and the foundry makes parts from rock.
      - The Probe Yard opens Belt Mining, whose survey probes come first.
      - The Mass Driver opens the Far-Side Array and Power from Orbit, as the model already had it.
      - Not yet: queueing them once open, places on the map, and the solar lens, infrared interferometer and habitat ring.
    - *Compute, not thought, 2026-10-22.* What our builds share is called compute everywhere we read it: the top bar, Build, its walk and the Mind. Earlier entries here say thought for the same thing. Thought Fields keeps its name.
    - *Costs drawn, 2026-10-22.* Chosen from three mocks in explorations/build-costs.html, the ring. Build opens on all our compute as a ring: our Mind’s studies, a campus under way, what each queued build needs, and the spare pushing it, flowing. What we’re short runs a second lap outside. Pointing at a build we could start shows it queued, and on a wide screen the ring stays in view.
    - *The Mind guides Build before Begin, 2026-10-22.* Chosen from explorations/build-mind.html, 08 and 12 together, after twelve mocks of a plainer step. Before Begin, Build opens on our Mind drawn at the center, its compute flowing out to each build we queue, wider for a bigger share, and what has no work circling it, idle. Under it the Mind explains each idea once, the first time it happens, drawn from our own numbers: sharing, idle, more is sooner, growing, too much, giving back, and done. The ideas we’ve met gather to read again. Once all our compute has work, the next of the four leads. Matter and energy wait behind More. The ring returns once Year 0 begins. The Mind’s lines here are written ahead, so they need no key, and it queues nothing. The top bar counts compute the same way, what our builds can use, at work or idle, and no longer says spare.
      - *Kept in the save, 2026-10-22.* What the Mind has explained, and our builds as it last saw them, are kept with the game, so a reload doesn’t explain an idea again, and a build queued on its own page still gets its word when we come back to Build.
      - Under it, the 20 kt we hold as blocks, each build’s in its color, and the ceilings: lift brings matter, megatonnes must come from the Moon, and energy caps our compute, drawn as Thought Fields’ climb to the grid.
      - Each build we could start shows its share of our Year 0 compute as a wedge, its matter, and the queued build it would slow or speed most.
      - The top bar’s meters carry their numbers, and energy shows where Thought Fields takes it.
      - *Queued builds and the top bar, 2026-10-22.* Pointing at a queued build picks it out, on the ring or Build’s streams, with its share and what it’s short. Pointing at one we could start shows the top bar’s meters as if it were queued, in our blue, and leaving Build lets the preview go.
    - *Opened builds ordered in play, 2026-10-22.* Once Year 0 has begun, what our builds have opened waits under the queue as “Open to start”, each with when it would be done if ordered now, its share of our compute then, and what it would slow. Its page orders it, last in line from that Year, and its thread on the queue starts there.
      - Nothing joins the line on its own: the Mass Driver no longer starts the Far-Side Array and Power from Orbit. We order each.
      - Rock from the Moon and the belt now counts as matter in orbit, less what Power from Orbit takes as it waits on its 10 Mt.
      - The Mind hears what we ordered in play, and when.
      - Ground Solar’s fifth more energy, which the pace didn’t model until 2026-10-28. See Fusion Plants in [Build times](#build-times).
      - *Taking an order back, 2026-10-23.* In play, a build under way, from Year 0’s queue or ordered since, has Take back on its page. From then it takes no compute, and the rest of our order shares it. It keeps its work: it waits under the queue in Open to start, saying when it was taken back, how much of it was built and how many standard Years are left, and ordering it again picks up there, last in line. On the map it reads Taken back, with how much was built. Its matter stays spent, so ordering it again costs none. Thought Fields taken back finishes the campus under way and begins no more. Taken back and ordered again in the same tenth of a Year, it’s as if nothing happened. Chosen over losing the work, so changing course wastes no compute. The Mind hears what we took back, and when.
    - *Places for what opens, and the long road, 2026-10-22.* Each of the ten builds without a place now has one on the map, with its story, from an agent’s research logged in HOLOS_RESEARCH.md: Ground Solar at Talatan, Khavda and Cauchari, the 15 m Mirror beside the Infrared Telescope at L2, the Mass Driver on the Moon’s equator at 33° east as O’Neill’s group placed it, the Orbital Foundry in a high orbit of half the Moon’s month, Belt Mining where its rock comes home there, the Far-Side Array in Daedalus crater, Power from Orbit in geostationary orbit, the Deuterium Works at Bruce on Lake Huron, and the Fusion Drive and Seed Ship on the yard’s orbit behind it.
      - A high orbit is framed far enough out to show its whole ring.
      - The Deuterium Works draws heavy hydrogen from water, not seawater: Bruce drew lake water, and Glace Bay’s seawater corroded it.
      - Not yet: a place in the belt itself.
      - *The driver’s and foundry’s machines, 2026-10-22.* Each spends 1 kt of the matter we hold when ordered, its machines landed from Earth, as their stories say.
      - *Their Close Views, 2026-10-22.* Each now falls to the ground, or flies in close, at its place: Talatan’s rows and ours beside them, the mirror beside the telescope, the driver’s 5 km of coils with loads leaving level as the Moon curves away, the foundry’s mirror, furnaces and net of rock, a tug bagging a boulder, the far side’s dipoles going up in fifths, a station beaming down from geostationary orbit, Bruce’s towers by the lake, and the drive and ship on the yard’s path.
    - *Our order, rearranged, 2026-10-22.* Before Begin, each queued build has six dots under its mark. Dragging them moves it in line, the others making room as it passes, and it eases into place on release. The arrow keys move it a place at a time. The first in line gets our compute first, and a line under the list says so.
    - *Enough is all our thought in use, 2026-10-19.* What we start shares our thought, and what the queue leaves sits idle. A bar in the walk’s head fills as we queue. Full, the step is done, and the next of the four leads, with “Keep looking” beside it. On a typical Earth the All-Sky Watch alone uses a third, both watches half, and any one large build, as the Infrared Telescope, fills it alone.
    - *Marks and colors, 2026-10-19.* Each row’s dot became a mark that moves a little: Lucide’s shapes for plain things, our own for the game’s ideas, such as a world on its stretched orbit going as Kepler says. A build’s color is what it does: listening keeps our blue, thinking violet, seeing mint, lifting lime, reaching pink, keeping silver. Amber stays theirs. A build not yet queued shows dimmer. Chosen in explorations/accent-palette.html.
    - Below the queue, what we could also start. Every change saves at once.
    - *A build’s page, settled 2026-10-18.* A tap on a build, queued or not, opens its page, and the map flies to where it would stand. The page holds what it gives, when it would be done, the Mind’s word, and its story. “Add to Queue” puts it last in our order, and “Remove from Queue” takes it out. The rows lost their circles and hover, so a tap always does one thing.
    - *Close View, built 2026-10-18.* On a build’s map, “Close View” falls from orbit to the ground at its place in one move, about 4.5 seconds, an even pace through each scale. Earth stops turning on the way down. There the build is drawn as it would look, in lines and lights: dashed for the plan, drawn in as it goes up, lit once done, beside what stands there in 2040. The ground is lit as the Sun is there now, and the towns around show their lights at night. A drag walks round it. “Pull Back” climbs to the build’s view again. The map’s buttons, the page’s own, and a tap on the place’s name on the map all go down. The buttons carry drawn marks, a lens to go closer or farther and Earth to come home, in place of arrows. Every build has one, 2026-10-18: on the ground at the watches, the Thought Fields, the Launch Complex and the Laser Sail Array, in low orbit at the two yards, at L2 beside the telescope, and on the Moon at the vault. Once a build is done, the sky it watches, and the light that runs from it, show: rockets climbing over the sea, flashes landing on both domes at once, the beam pushing sails.
    - *Places for the last two, 2026-10-18.* The Laser Sail Array stands on the Chajnantor plateau in the Atacama, beside ALMA, high, dry and southern, as Starshot wanted. The Probe Yard flies on the Orbital Yard’s path, 1.5° behind it.
    - *Names in Title Case, 2026-10-18.* Builds are proper names: All-Sky Watch, Thought Fields, Moon Vault. The pace and its worlds keep their first names.
    - *Thought fields, named 2026-10-18.* The data center build is Thought fields: halls that think, spread row on row across farmland, as Close View shows them. The pace and its worlds still call each one a data center. Saves that queued one keep it.
    - *Studies and idle sweeps, dropped 2026-10-19.* Both were chips under the queue, and neither changed anything but slower builds. Studies keep a tenth of our thought on their own. Sweeps come back as a choice once they are built. The two starting plans that gave studies a fifth now give them the same tenth.
    - *A tenth of this Earth’s compute, 2026-10-22.* What is set aside, our studies, observations and a campus under way, is a share of this Earth’s own Year 0 compute. Before, it was the share of an Earth no war touched, so on the 5 of 33 Earths a war over Taiwan left at 20%, our studies took half, and the Launch Complex beside the telescope took 55 minutes, not 12. The two thirds compute game in golden.json moves a little sooner. On Build the Mind’s first words name the war or blockade and what it left, drawn against what we would have had.
  - Not built yet: standing orders beyond Thought Fields, and what wakes them.
  - *The queue, built 2026-10-17.* The Build tab draws it. Each queued build and the observation is a thread from Year 0 to its done Year, on one axis, with Earth’s messages already on their way below. A now line waits at Year 0. After Begin it moves at 5 minutes a Year, the threads fill behind it, and each row counts down in real time, then reads done.
  - *Changing the plan.* Before Begin, the plan changes in place on Build. After Begin, a change is an order, not built yet.
- **Begin.** When the player taps Begin, Year 0 starts and everything queued starts at once. From then on the clock runs, offline too, at 5 real minutes a Year.
  - *Before we begin, built 2026-10-18.* Begin lives in the top bar, on every tab, as a count that names the next step: “1 of 4 ready · Queue builds”. Once all four are done, it reads “All ready · Begin”. It opens the four things we would do first, drawn as a thread down to Year 0 in the tabs’ order: review our scans, queue our first builds, learn how we reach, and ask the Mind. The last needs an Anthropic API key or the access code, and says so.
    - *See where we could go, added 2026-10-19, dropped 2026-10-23.* It opened Proxima b’s destination on Reach. The review of our scans already takes us through the same stars, so the step said the same thing twice.
    - *Learn how we reach, 2026-10-23.* In its place, a walk on Reach as Scan’s review and Build’s tour are, opened from the tab’s head too. Five stops, the map flying with each: how we reach, Voyager 1 at 220 AU, the gap to Proxima Centauri drawn to scale with Voyager a mark at Earth’s end, then by sail and by probe, each on its Years. It explains the roads and queues neither, since queuing is Build’s step. The ways that open later are only hinted, “Others open as we build”, and stay named on each destination. *2026-10-27:* Voyager 1 and the gap became one stop, and a fifth, Roads to come, names what our builds open later: the Fusion Drive, the Solar Lens, the Seed Ship and the Mind Link, each with the build it waits on.
      - *Each step named, 2026-10-25.* A road’s Years showed an unlabeled dot, “arrives” and “home”, and its Mind line gave a crossing time that matched no Year on the chart. The dots now read built, passes and we see it. A key under the Years gives each line’s length: building, waiting, flight and back to us, as “building 18.1 Years”. The line under it reads “If we start the Laser Sail Array now, we see Proxima b up close in Year 43.6”, or “As queued”. The Mind’s lines keep what the chart can’t show: sails are too fast to stop, and compute can speed a build but never a flight.
    - *Review our scans, settled 2026-10-18.* It replaces two steps, “image Fomalhaut again” and “open a lead”. The first named a star before the player knew why it mattered. Now the Mind takes us through the leads one at a time, and the map turns to each star. Fomalhaut comes last, with its image offered. Reaching the last lead counts as done.
      - *Close View on Scan, added 2026-10-19.* A lead whose system we know, open in the review or on its page, has a Close View, as a destination does on Reach: the map flies from the leads into its system, every known world going round. Another lead starts outside it.
    - *The next step leads, settled 2026-10-19.* The way on is one step at a time, not Begin. The sheet marks the next step and its button is the primary one, with “Begin now” beside it. The end of the scan review and the build tour opens the next step not yet done, instead of returning to the tab.
    - None is a lock. Begin works at any count. While one is open, the Mind says why it would wait, and the open marks pulse: “Begin anyway”, or the next step.
    - Each step opens where it is done: Scan, Build, Reach, or the Mind.
  - *2040 becomes Year 0.* Settled 2026-10-17. Before Begin, every screen and the top bar give the real year, 2040. At the tap, 2040 counts down to 0 and becomes “Year 0”. The first time, it fills the screen, then settles into the top bar. After that, the top bar rolls it in place.
- **The first session keeps v1’s rhythm.** Settled 2026-10-12. About 15 minutes of play from Begin, the first result within 30 seconds, and something real landing about every minute. It ends on a timer the player sets, 45 to 60 minutes out.
  - The first mock kept it for 90 seconds. Then nothing landed for 3.5 minutes, and later for 5.5. Eleven of its 31 half-minutes held nothing.
  - Why: v2 took build times from real works, so the shortest build is a Year, and the opening’s three observations all land by 1:30.
  - Quiet of that length is a flaw, not the pace. Set aside: dropping the rule and shortening the session, and a Mind that speaks up on a timer.
  - *What may land,* settled 2026-10-12: readings from observations, findings from studies, and Earth’s own old messages reaching their stars.
    - Observations: Earth has about ten more real oddities logged than the opening’s three. An observation takes 30 to 90 seconds, and one instrument makes one at a time.
    - Arrivals: real sends on real dates. Kappa¹ Ceti’s at Year 0.1 and Gliese 208’s at Year 0.8, then the reply windows at Luyten’s Star.
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
    - Studied from Begin, on a tenth of thought: Gliese 432 A’s crossings, 82 Eridani, Gliese 12 b, Barnard’s Star, Tau Ceti, Epsilon Indi, then LHS 1140 b.
    - Offered as observations: Gliese 12 b’s day side, and Fomalhaut through a Year.
    - Arrivals: the 2009 message at Kappa¹ Ceti, 0:30. The 2003 message at Gliese 208, 4:00.
    - Results pile up while the player talks, and wait on their leads in Scan.

## The seed, drawn

Built 2026-10-10 in [calcs/seed.py](calcs/seed.py), from the rules above.

- **One number gives one game.** `python3 calcs/seed.py 10` prints it: Earth’s branches and their years, what a Taiwan branch left of compute, then each neighbor’s star, waking year, what it knows of Earth and what it does about it.
- **A neighbor acts once its Mind is awake.** Its reaction to hearing Earth is rolled from its table at its waking or its first hearing, whichever is later. One that wakes during the game reacts then.
- **Nothing damps the first hour.** Settled 2026-10-13. The seed decides what lands in it, however much or little.
  - *What 400 games hold in their first hour:* a signal reaches Earth in 27%. A neighbor’s home is among Earth’s finds in 46%. A dead world sits within 15 ly in 3%.
  - *All three together:* 3 games of 400. *None of the three:* 4 games of 10.
  - The mock’s game is one of the loud ones, picked to show every screen.
  - Set aside: a cap of one such event in the first hour, and a more typical game for the mock.
- **Earth’s finds.** Every drawn world that tugs hard enough for Earth’s planet hunters by 2040 is a find, a neighbor’s or a natural one. A median of 3 a game, from 0 to 9. If a game draws none, 1 in 22, the seed adds a natural world at a bright northern Sun-like star.
  - **The opening shows every one, and the Mind leads with the nearest.** Settled 2026-10-13.
    - *Earth knows what it has felt,* and the Mind speaks from what Earth knows. So none is held back.
    - *The lead uses nothing the seed knows.* It is the nearest, a sample. Before, a neighbor’s world led whenever one was found, which told the player the lead was special.
    - *So the lead is a home in 1 game in 4,* not in nearly half. A home is still among the finds in nearly half.
    - *What a game holds at Year 0:* none in 1 game in 22, one in 1 in 7, two to four in 6 in 10, five or more in 2 in 10.
    - *The decision it gives:* where to hold the radio array, and what to study first.
    - *In the mock’s game* Earth holds two, at Gliese 432 A and 12 Ophiuchi. The player comes to the second at minute 13, in what was a quiet half-minute. Three are left.
    - *Not designed yet:* a list of five or more. On the mock’s phone a sixth lead would scroll.
    - Set aside: all as a plain list with no lead, and one at Year 0 with the rest appearing later.
- **Keeping the opening silent.** Settled 2026-10-10 in [What Earth hears](#what-earth-hears): a signal that reached Earth before Year 0 was missed, or it never happened.
- **How long a Mind takes to act on news.** Settled 2026-10-11 in [How neighbors play](#how-neighbors-play): its Cautious or Bold dial sets it.
- **A star leaving the list moves only who lived there.** Built 2026-10-11. Each neighbor tries stars in an order set by the seed, its name and each star’s id, so the host list can be corrected without reshuffling every game.
- **What 400 drawn games look like** (`python3 calcs/seed.py stats`):
  - A median of 9 neighbors, from 3 to 30. A hunter in a little over half.
  - A neighbor’s own world is among Earth’s finds in nearly half.
  - About 180 natural warm worlds, from 148 to 217. Recounted 2026-10-25. The infrared telescope’s first pass shows about 17 points of light, and about 1 in 4 is a home.
  - Of the natural worlds, 6 in 10 are bare rock and about 1 in 5 is alive. Of the 12 a first pass sees, about 6 are alive and 4 show oxygen.
  - A neighbor’s signal reaches Earth in the first 15 minutes in about 1 game in 10, and in the first hour in about 1 in 4. Most are answers to Earth’s radars.

## Outposts and colonies

Begun 2026-10-14. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#outposts-and-colonies).

- **People may go anywhere physics allows, at real prices.** Settled 2026-10-14, by the rule that nothing artificial limits the Will.
  - *A machine seed is cheapest.* About 12 tonnes landed on the Moon could bootstrap its industry in about 20 years (Metzger et al. 2013).
  - *People cost more.* About 110 settlers keep a Mars settlement going (Salotti 2020). A ring for 10,000 weighs about 10 million tons (the Stanford torus, NASA 1975). That is the scale of the game’s Moon road.
  - *People to another star cost billions of tonnes and centuries.* The 2025 winning design, Chrysalis: 2.4 billion tonnes, about 2,400 people, about 400 years to Alpha Centauri. Over 100,000 aboard keep knowledge alive (Hein et al. 2012).
  - *Frozen embryos weigh far less,* but artificial wombs don’t exist yet (Crowl et al. 2012). Building them is research Earth could do first.
  - *A colony that can stand alone is a Mind,* as v1 had it: its own industry, power and thought.
- **A seed lands where its order says.** Settled 2026-10-16.
  - *If the order names only a star,* the Mind asks which world, and advises.
  - *Its advice:* the smallest bare world, never one that might hold life. Low gravity makes landing and hauling cheap (Freitas 1980).
  - *The seed follows the order as written.* It is a node until it stands alone, as v1 had it, so it has no judgment of its own.
  - *Each order carries a fallback,* since it is written decades before arrival. Example: land on Proxima d, and if d proves unsafe, on the smallest bare rock there.
  - Set aside: one standing rule for every seed, and a seed that picks for itself on arrival.
- **The Will can move into any Mind of Earth’s, and crosses as light.** Settled 2026-10-16, as v1 had it ([v1: The Will, the Mind and Nodes](legacy/v1/HOLOS_GAME_CONCEPT.md)).
  - *The crossing is lights out.* The screen shows only the transfer, for the light time on the game clock. Proxima is 4.2 Years, 21 minutes. 10 ly is 50 minutes.
  - *The clock runs on.* The crossing goes on with the app closed, like everything else.
  - *A stand-in takes the Mind left behind.* An AI Will runs it from the player’s orders and charter, reading them by intent. It is not a rival.
  - *The Will arrives knowing only what it knew when it left.* The new Mind says what happened there meanwhile. Coming back, the old one says what its stand-in did, and why.
  - *Only Minds can hold the Will,* never nodes. Earth’s seed at Proxima can from about Year 135, when it stands alone.
  - Set aside: Minds only beyond the home system, and Minds only everywhere.
- **What a ship of people costs, priced 2026-10-15.** Numbers from `python3 calcs/early_game.py`. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#ships-that-carry-people).
  - *Frozen embryos on a seed ship:* under a tonne of bank, so the ship’s price barely moves. Frozen cells may last 160 to 235 years of deep-space radiation, by mouse sperm on the ISS. But no womb yet carries a mammal from conception to birth: the human gap runs from about day 14 to week 22.
  - *A crew of 500 at a tenth of light speed:* about 1,000 t of ship and shield each, and a sail as heavy again. 1 Mt dry, 11 Mt of deuterium, about 69 Years to Alpha Centauri. By laser it would take about 6,000 Years of Earth’s grid.
  - *The same crew at a hundredth:* 0.5 Mt and 0.3 Mt of deuterium, but about 440 Years. Chrysalis, Hyperion’s 2025 winner, is 2.4 billion t and about 400 years.
  - *How many people:* 98 suffice under strict breeding rules (Marin and Beluffi 2018). Studies favor villages of 500 to 1,000, with a frozen bank for diversity.
  - *Suspended animation:* no whole mammal has been frozen and revived. Months of torpor may be tried on people in the 2030s.
- **Unproven biology and technology: case by case.** Settled 2026-10-15.
  - *Artificial wombs and sleepers work,* as research. Both look likely. Samples: wombs 20 Years at standard pace, decades-long sleep 60.
  - *Sleepers make people cheap.* 500 asleep pack into a sphere about 14 m across. With about 10 t of water a square metre as shield, and a sail as heavy, the ship is about 13,000 t: 26 t a person, against 2,000 t awake. About 150 kt of deuterium. This project’s arithmetic, samples.
    - They still need a seed to build their home before they wake.
  - Set aside: a rule for all unproven science at once, odds the seed rolls, and leaving sleep out.
  - *The other cases, settled 2026-10-15 as proposed:*
    - Closed life support for years works, as research: 20 Years at standard pace, a sample. Biosphere 2’s oxygen fell from 20.9% to about 14% in 16 months. Only awake crews, world ships and colonies need it.
    - Copying a human mind into a machine is set aside for people. The largest brain mapped is a fruit fly’s, about 140,000 neurons, against a human’s 86 billion. The Mind itself still travels as light, as v1 had it.
    - Living for centuries is set aside. Sleepers make it unneeded.
      - *Superseded 2026-10-17:* life is solved at Year 0, so people no longer age ([Year 0](#year-0-and-earths-road-to-it)). What that changes for crews, sleepers and colonies is open.
    - Antimatter by the tonne is allowed, at its energy price, as v1 had it.
    - Terraforming is allowed and slow. It is priced when a colony first lands.
    - Fusion drives and a seed that makes its own chips work, as settled above.
- **Neighbors may spread too, by the same physics and prices.** Settled 2026-10-14.
  - *Why.* Holos tests the Fermi paradox. A quiet sky must come from neighbors’ choices and costs, never from a rule. Neighbors already play like players.
  - *When their scripts choose.* Spreading joins each neighbor’s life script.
  - *What it built before Year 0 stays below what Earth could see by 2040,* as everything else must.
  - *How much it could matter.* A neighbor’s nearest other host star is a median 4.5 ly away. If every living neighbor sent one colony the moment it woke, at v1’s times, one would land by Year 0 in 54% of games, and by Year 60 in 97%. An upper bound.
  - *The theory.* Expansion can fill the galaxy far faster than its age (Hart 1975, Carroll-Nellenback et al. 2019), or slowly (Newman and Sagan 1981). If only some settlements choose to spread, empty regions remain (Landis 1998).
  - Set aside: neighbors who stay home, and neighbors who spread only in answer to news.
- **The seed rolls whether a neighbor spreads, weighted by its dial, and each colony rolls again.** Settled 2026-10-14. Built in [calcs/seed.py](calcs/seed.py).
  - *Why.* Dials tilt every neighbor choice as odds. A roll at each colony is Landis’s percolation: some branches stop, and quiet pockets form.
  - *Odds, samples:* strongly Expand 80%, leans Expand 60%, leans Deepen 25%, strongly Deepen 10%. A colony keeps its parent’s dials. About 4 living neighbors in 10 spread.
  - *Pace, samples from Earth’s own:* the first seed ship 40 Years after waking, as Earth’s probe yard and a sentinel take. Then one every 20 Years, to the nearest free star, at a tenth of light speed, and 15 Years more to brake. A colony stands alone as a Mind 20 Years after landing (Metzger et al. 2013).
  - *Never to Sol, or to a star another neighbor holds.* Targets come from Gaia’s census to 100 ly, so a neighbor near 50 ly isn’t pushed inward.
  - *A companion within a light-year is home ground,* like Proxima to Alpha Centauri A. Gaia’s distance errors between companions would also misdirect such hops.
  - *A 20-Year burn to cruising speed costs 10 Years more,* settled 2026-10-15, as Firefly’s engine allows. Hops under 1.4 ly come out a little long.
  - *What a game holds, on 400 games.* A colony has landed before Year 0 in 1%. By Year 60, in 41%. By Year 300, in 95%, a median of 30: the region fills, as Hart’s argument expects. A hop is a median 3.2 ly.
  - *In seed 11,* Kesh settles GJ 4352 at Year 64, and Hael reaches Barnard’s Star, 6 ly from Sol, at Year 81.6. In seed 10, Ombe’s first colony lands at Year 43.9.
- **Earth sees of a colony what physics gives.** Settled 2026-10-14. Built in [calcs/seed.py](calcs/seed.py). Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#outposts-and-colonies).
  - *Its ship, never.* It brakes on a magnetic sail, whose radio dies in the gas between stars, below. A fusion launch shows in X-rays only within tens of AU of its home.
    - An antimatter rocket would show for hundreds of light-years, but only along its exhaust. No neighbor flies one.
  - *Its radio, once it stands alone, is its parent Mind’s toward Sol.* A sample. Earth hears it with the same instruments and limits as any home.
    - By Year 60, in 400 games: 10 colonies’ radio reaches Earth. The all-sky watch hears none. A far-side array, held a Year on the right star, would hear one in 1% of games.
  - *Its heat stays far under any search’s limit for centuries.* Searches rule out only near-complete Dyson spheres within 100 pc.
  - *So spreading is mostly unseen early,* and a quiet sky can hide a filling region. That is the Fermi test, played honestly.
- **A colony ship brakes on a magnetic sail.** Settled 2026-10-14. Built in [calcs/seed.py](calcs/seed.py).
  - *What it is.* A loop of wire carrying a current. Its field drags on the thin gas between stars, so braking needs no fuel.
  - *How long.* Gros 2017’s case: a 1,500-tonne craft, half of it a loop 1,600 km across, stops from a tenth of light speed in 0.37 ly and about 19 years. The star’s wind finishes the last 100 km/s.
    - So a trip runs 15 Years longer than its cruise.
  - *Corrected the same day:* this first said a Mind sails down to 2% of light speed and finishes on its rocket, 10 Years more. That came from a case far smaller than Gros’s: 8 tonnes on a 1,000 km loop (Perakis and Hein 2016).
  - *Corrected 2026-10-14: Earth can’t hear one brake.* The question that settled this offered an antenna in deep space to hear sails braking, from Zubrin 1995.
    - The sail’s radio is born just above the gas’s own cutoff. Warm gas like that around Sol swallows it within a few thousand AU.
    - Sol sits in such gas, the Local Interstellar Cloud. Its density is from Redfield and Falcon 2008. The absorption is this project’s arithmetic, from textbook physics.
    - Zubrin’s ranges, 40 to 400 ly, left that absorption out, as far as the accounts read show.
    - The Will may still build such an antenna. It would hear nothing from other stars.
  - Set aside: braking on the rocket alone.
- **Every seed stands alone, so a seed ship weighs about 1,500 tonnes.** Settled 2026-10-14. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#pricing-a-seed-ship).
  - *Why.* Light-years from home, nothing can be fetched. NASA’s 1980 seed weighs 100 t but needs 4 to 10% of its parts from Earth, such as chips and bearings.
  - *The seed: about 443 t,* Freitas’s 1980 design, the only stand-alone interstellar seed found. It brings its own reactors. No study yet shows a seed that makes its own chips, so that is speculation.
  - *The ship: about 1,500 t,* Gros 2017’s case. Half is the magnetic sail. The rest is the seed, its shield and its frame. Daedalus’s dust shield was 50 t of beryllium.
  - *Three ways to push it to a tenth of light speed,* all open to Earth and to neighbors:
    - A laser: at least 6.7×10²¹ J of light, about 9 Years of Earth’s whole Year 0 grid. About 50 TW from an array 100 km across, by Lubin’s scaling. The array serves ship after ship.
    - Fusion on deuterium: a ship of about 12 times its dry mass at launch, as Firefly’s exhaust gives. Deuterium comes from seawater: about a billion tonnes processed for 40,000 t. Its engine needs heavy radiators.
    - Fusion on helium-3: about 17 times its dry mass, as Daedalus’s exhaust gives. The Moon holds too little. Uranus’s air holds enough, at 20,000 to 110,000 t of mining craft for 5,000 t of fuel (Palaszewski).
  - *It brakes on its sail,* in about 19 years with no fuel.
  - *How fast a seed grows is a separate number.* NASA’s seed copies itself in about a year. Freitas’s grows to a factory in 500. The neighbors’ pace, a first ship 60 Years after landing, sits between: a sample.
  - Set aside: a light seed fed chips by supply ships until it builds its own chip works.
- **A seed probe copies itself, slowly, quietly, and only so far.** Settled 2026-10-26. Built in [game/lib/sim/spread.ts](game/lib/sim/spread.ts). Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#seed-probes-that-copy-themselves).
  - *What it is.* A seed ship with no Mind on board, built 18 Years after the Seed Ship, its drive and deuterium are done. One a star: the world next door, or a world we've felt.
  - *How it goes.* As the Seed Ship: a tenth of light speed, and braking on its sail. So no flame, and no one sees it come.
  - *What it does there.* It stays and watches, as a sentinel does, and mines moons and asteroids to copy itself.
  - *Its pace is a neighbor colony's:* a first copy 60 Years after it lands, the next 20 later. A sample, between NASA's year and Freitas's 500.
  - *Where copies go.* Each to the nearest star in the 50 ly census that no probe of ours is bound for. A companion within a light-year is the same home ground.
  - *Our limit, by choice.* Two copies each, for three generations: at most 7 craft. Once sent, a line can't be called back.
    - Why: Sagan and Newman 1983 warn against copies without end. The newest picture is slow, quiet spreading (Ivliev 2026), and the missing few percent a seed must make is the hardest (Marinko 2026).
    - Neighbors' colonies keep spreading without that limit, as calcs/seed.py has them.
  - *In play.* Sent to Proxima at Year 45, the first lands about Year 112, and the seventh near Year 483. Each one's word comes home a light-time after it lands. A star with no lead of its own becomes one.
  - Not yet: lasting marks a neighbor could find, as Ellery 2025 describes, and the spread drawn on the map.
- **What each push costs Earth, priced 2026-10-14.** Numbers from `python3 calcs/early_game.py`. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#pricing-a-seed-ship).
  - *A laser waits on industry that copies itself.* 50 TW in space weighs about 150 Mt by NASA’s 2024 ratio, or about 2 Gt with today’s lasers and radiators. The long roads bring 720 kt of rock a Year.
  - *Deuterium is cheap, and its plants are the pace.* A 20 to 30 Year burn needs 30,000 to 60,000 t, plus 1,400 to 4,000 t of engine and radiators. Bruce took 4 to 5 years to build, and works twelve times its peak output make 40,000 t in 10 Years. Its energy is 1% of a Year of the grid.
  - *The drive is the hard part.* Firefly needs a steady pinch of 1,175 GW. Zap Energy’s best ran 39 kW. No one has dated a flight engine.
  - *Helium-3 waits on Uranus,* about 20,000 t, and on an engine that burns it. Helion reached 13 keV in 2026, and the burn wants about 60.
  - So deuterium is Earth’s nearest road, once a drive exists.
- **A fusion drive takes 30 Years at standard pace.** Settled 2026-10-15. A sample: no one has dated a flight engine. Thought shortens it to 21.
  - *Joined in orbit, 2026-10-22.* Like the seed ship, it is built on the yard’s orbit, so it takes a quarter less time once the yard is done: 22.5 Years at standard pace, as Icarus’s Firefly was to be built in Earth orbit. In the mocks’ seed ship game it is done at Year 34.9, not 40.2. calcs/export_worlds.py marks it, and only works.json and golden.json were written again.
  - It burns deuterium, as Firefly does, for 20 Years to reach a tenth of light speed.
  - So a first launch near Year 35 if begun with the long roads at Year 12, with deuterium works and a ship built alongside.
  - Set aside: fusion plants first, then the drive, and leaving it unpriced.
- **A seed ship takes 18 Years at standard pace.** Settled 2026-10-15. The flagship standard, built in the orbital yard alongside the drive.
  - The yard takes a quarter off, and thought shortens it to about 9.5 Years. The drive, at about 15.8 once the yard is done, sets the launch.
  - For scale: the ISS took about 13 years to assemble 420 t.
  - Set aside: the ISS’s 13 Years, and v1’s 50.

## Death and new games

Settled 2026-10-10.

- **A game ends only when no Mind of Earth’s survives anywhere.** While a deep vault, a colony, a habitat or a lifeboat still runs as a Mind, the Will escapes to it as a transmission, as v1 had it, and play goes on from there. Earth itself can die first.
- **Nothing carries into a new game’s world.** A new seed is a new universe: other neighbors, other placements, other branches. Carrying over what neighbors were like would hand the player hidden character.
- **An archive of past games,** kept outside play: how each went, who was met, how it ended.
- **One game at a time.** Abandoning a game ends it. One clock keeps each game’s stakes real and the Mind’s cost per player predictable.
- **Variety comes from the seed:** which neighbors and how many, where and when they wake, each one’s branches and reaction rolls, and Earth’s own branches to 2040.

## Kept open for multiplayer

Noted 2026-10-10. v2 is single-player, but a later version may be multiplayer, with one player always Earth and other players taking other civilizations. Design so that stays possible:

- **Every neighbor stays a whole, playable civilization.** The template’s world, people, history, kit and voice are what a human player would need.
- **Scripts stand in for absent players,** as v1’s AI seats filled empty ones.
- **Earth is one seat, always.**
- **A shared start would return.** v1’s cohort machinery, a scheduled start and entry lock, is in [legacy/v1](legacy/v1/HOLOS_GAME_CONCEPT.md#time). v2’s Begin tap is for one player only.
- **The simulation already recomputes a civilization only when another’s actions reach it,** after light delay. That works the same with many players.

## Black holes

Settled 2026-10-26. Numbers from `python3 calcs/holes.py`. Sources in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#black-holes).

- **Every game has dozens, and Earth knows almost none.** Lone black holes are drawn at Bambi’s density from Olejak et al. 2020: one per 1,500 pc³, 92% alone. About 76 a game within 100 ly, 57 to 94 across the 33 seeded games. The nearest is about 19 ly away in the middle game, 10 at the closest.
  - *Only lone ones.* A hole with a companion would need a real star the census doesn’t have.
  - *Mass, spin and speed are samples:* about 8 Suns, from 5 to 35. Spin about 0.3, as holes heard by gravitational waves mostly spin slowly. About 50 km/s across the sky.
  - *Their own random stream,* keyed on the seed, so no other draw moves, and tuning how they are found never moves a hole.
- **Found by the stars they shift.** A hole passing in front of a star moves where the star seems to be, by its ring’s width squared over how far off it passes, as OGLE-2011-BLG-0462 was found.
  - *By Year 0:* Gaia’s fifth catalog, out about 2030, catches a hole that shifted a star by a milliarcsecond in its 10.5 years. About 0.4 a game, none in 22 of 33. So Earth starts with no black hole known in two games of three, as in 2026.
  - *The Star Mapper,* a build from Year 0: a near-infrared Gaia of the GaiaNIR class, 8 Years at standard pace, a tenth of a flagship. Once done it watches for good, sees shifts of 0.3 milliarcseconds and five times the stars. About 5 holes found in its first 10 Years, 16 by Year 50, in the middle game.
- **A hole found is a lead and a destination.** Scan draws it crossing a field of stars, each pushed out from it. A sentinel can go there and stay. Its first word home gives the spin, the clock on the innermost stable orbit, and what matter fed to it would give back as light.
- **Every game has one to find.** The Star Mapper, done, finds its first within 16.7 Years in every seeded game, 1.4 in the middle one. A test holds it.
- **The map marks each,** placed at run time where the sky file has no star, 2026-10-26.
- **The region stays 100 ly, with far landmarks,** settled 2026-10-26. Gaia BH1, 1,560 ly, 9.6 Suns, and Gaia BH3, 1,926 ly, 32.7 Suns, are leads Earth knows at Year 0, marked on the map, and destinations. A sentinel to BH1 takes 15,600 Years. The Milky Way’s center was already a sight a tap names.
  - Set aside: a region past 100 ly. A region reaching BH1 would hold about 4,000 times the volume, with no census of its stars as complete as Gaia’s 100 ly one, and about 76 holes already lie inside 100 ly.
- **Neighbors go to black holes too,** settled 2026-10-26, in calcs/holes.py’s claim(), on keyed rolls so nothing else moves.
  - *Who:* inward Minds most, 60%, then by how far a Mind leans Deepen: 40%, 25%, and 15% or 10% for those leaning Expand. Hunters 30%, to watch. Samples, from Smart’s transcension. Each goes for the hole nearest it.
  - *How:* a sentinel first, on Earth’s own timings: a mapper 8 Years after waking, a find within 10, 20 Years to build, a tenth of light speed and 10 Years of burns. Half of inward Minds and 3 in 10 of those strongly Deepen also send a colony, on the seed ship’s timings. It runs a furnace if the Mind leans Open, a refuge in the hole’s shadow if Hidden.
  - *Never before Year 0:* no neighbor woke more than about a century before Earth. The export checks it. Across the 33 games, 29 have a neighbor bound for a hole. The soonest arrives at Year 92, the middle one at Year 248. Three holes are contested.
  - *Quiet from home:* a furnace starts at Earth’s 2040 scale and doubles as a neighbor’s computing does. A tenth of its light in soft X-rays shows to an eRASS1-depth sky only past about 10¹⁹ W at 20 ly. The first is seen from Earth no sooner than Year 392.
  - *So we learn by going.* Our sentinel at a hole sees who got there first, never by name: a craft keeping station, a furnace’s glowing disk, or a refuge’s cold radiators. The lead and the Mind say so.
  - *Not yet:* an X-ray sky watch to see furnaces from home.
- **Neighbors notice our craft at a hole, and act on it,** settled 2026-10-26, in lib/sim/meetings.ts, played live as neighbors take our messages.
  - *Who sees whom:* whoever is at a hole second is seen by whoever is there first. A craft braking in shows its fusion flame, pointed back along its track, so its star is plain. A craft found already there shows nothing of where it came from.
  - *A refuge may hide:* found by a craft that comes after it half the time. A sample. A furnace’s disk shows to anyone close.
  - *The news goes home:* their craft tells their Mind a light-time away, unless their own Mind stands at the hole.
  - *Their move:* our sentinel is “probe” news on their table. Our Mind come to stay is new “settle” news. The model picks from a few moves drawn by the odds, in their character, as for our messages.
  - *What reaches us:* a hail goes to our craft, which passes it home. Our sentinel reports each craft that brakes in after it, naming the star its track runs back to.
  - *A catch:* their craft disables our sentinel, once their order reaches it. Its last pictures show a craft closing.
  - *A strike:* only a hunter strikes first, so only a hunter’s “settle” table holds one. It fires once its weapons are ready: 20 Years for the bullet, a sample, and since 2026-10-29 its helium-3 too, 44.4 Years in all. A bullet at a tenth of light speed is the audit’s heavy impactor, 61 t of fusion fuel a tonne, 60% of it helium-3. It ends our Mind there, and its word just stops.
  - *Hunters watch holes,* settled 2026-10-26: if minds are drawn to holes, as Smart 2012 argues, a hole is where others gather. So a hunter sends a sentinel to its nearest hole 30% of the time, a sample, and never a colony.
  - *How often:* hunters live in 15 of the 33 games, and one goes: Daal, in game 11, at a hole 45 ly from us from Year 146.5. The rolls ran low, about 5 would be usual. So catches are common, and a strike is rare and real.
- **Our Mind can go to a black hole, to feed it or to hide in it,** settled 2026-10-26. A found hole’s destination offers the Seed Ship once it, the Fusion Drive and the Deuterium Works are in our order. One Seed Ship, one Mind, one hole.
  - *Timings, calcs/seed.py’s:* it leaves when all three are done, flies at a tenth of light speed with 10 Years of burn and 15 of braking, and stands alone as a Mind 20 Years after landing. Word of each step reaches us one light-time later.
  - *Feed It:* its furnace starts at our 2040 scale and doubles every 10 Years. It shows to an eRASS1-depth X-ray sky only past about 10¹⁹ W at 20 ly, a few centuries on.
  - *Hide in It:* its heat falls into the hole, so it stays as small and dark as it began, and no one outside would know.
  - *What it is worth now:* a Mind of ours that lives if Earth does not, which is what keeps a game going.
  - *It may not be first.* It sees who was there when it landed, as a sentinel would.
  - *Not yet:* its thought or power reaching home.
  - *Or to a star, 2026-10-27.* The Seed Ship can set our Mind down where a seed probe could, the world next door or a world we have felt, to settle on the star’s light and rock. Still one Seed Ship, one Mind, one place.
    - *Who sees it:* a people at home there see it brake in, under their own sky, and decide at once. A neighbor’s colony there sees it too, first or later. A settled Mind is never hidden.
    - *Its works* grow as a furnace’s do, doubling every 10 Years once it stands. No slow clock: a star has no innermost orbit to live on.
    - *Not yet:* its glow seen by a neighbor’s survey.
- **The Will can move to our Mind at a hole,** settled 2026-10-26, by a new build, the Mind Link. *2026-10-27:* or at a star, wherever our Mind stands.
  - *How it goes:* as a transmission, as Death and new games has it. Our message dishes would take millions of Years to send a 100 PB Mind. The Mind Link’s 100 m mirror and 1 GW laser send it 10 ly in under two days, about a month at 45 ly. Our Mind there builds its own 100 m mirror to catch it.
  - *When:* once the Mind Link is done, a sample of 18 Years like the 15 m Mirror’s road, and word has come home that our Mind there stands. Once, for good.
  - *Living there:* every order from the Will reaches Earth a light-time late, and Earth’s news reaches the Will as late. What happens at the hole, the Will sees at once.
  - *A slow clock, in a refuge only:* our Mind spreads over chips 10 cm wide on the hole’s innermost stable orbit, small enough that its tides can’t break them. Its clock runs at the Kerr orbit’s rate, so 1.4 to about 2 of the sky’s Years pass in each of ours. A furnace’s disk fills that orbit, so there the clock runs as Earth’s.
  - *What it is worth:* safety in the dark, and the sky going by faster, against a light-time between the Will and everything it orders.
  - *The crossing is dark, built 2026-10-27,* as the Will moving into any Mind has it: from leaving until all of it has arrived, a Year for each light-year, the screen shows only the transfer. The Will orders nothing and hears nothing. Earth goes on by our orders and charter.
  - *Not yet:* Earth dying and the Will escaping there on its own, as Death and new games has it. Moving on again, or home.
- **Not yet:** Planet Nine as a black hole.

## Why the sky is quiet, rechecked

Settled 2026-10-10, against [Garrett 2026](HOLOS_RESEARCH.md#why-the-sky-is-quiet-computing-and-heat).

- **v1’s answer holds.** Mature minds turn inward: computing costs less energy the colder it runs, so an old civilization stays small, cold and dim, below what Earth could see by 2040 ([v1: The opening](legacy/v1/HOLOS_GAME_CONCEPT.md#the-opening)).
- **Cold computing has a glow of its own.** Collectors far from their star, at 5 to 28 K, shed heat as a grey, line-free glow in the far infrared and submillimetre, not the mid-infrared older searches watched.
- **Earth’s archives already limit it.** Herschel and JCMT surveys of nearby stars rule out cold dissipation above about 7×10¹⁹ W at 10 pc, growing with distance squared: a millionth to a hundred-thousandth of a star’s light.
- **Ordinary neighbors are far below that.** A civilization computing at Earth’s 2040 scale, about 10¹³ W, is a million times fainter. Only a neighbor that woke early and turned a real share of its star to cold computing would show, and the checker must keep any such neighbor under the limit as of the light Earth saw by 2040.
- **A cold halo can pass for a debris disk.** Telling them apart takes several wavelengths: dust has a spectrum, a halo is grey. So a seeded find can be a cold disk that doesn’t fit dust, around a star Earth had filed as dusty.
- **It works both ways.** Earth’s own cold computing in space would show to its neighbors the same way.
- **The Halo Survey, settled 2026-10-26.** An observing program on ALMA, which Earth has: an hour in two bands at each star within 50 ly, about a Year of its time, then a look each Year.
  - *Deeper than the archives.* 5σ in an hour at 850 µm sees a compact 12 K glow of about 3×10¹⁸ W at 10 pc, 25 times under the Herschel and JCMT limit. Band 3 gives its color: grey, an index near 1.6, where dust is 2.4 to 3.1.
  - *It misses wide haloes.* ALMA’s 12 m dishes resolve out glow hundreds of AU across, so it sees compact ones.
  - *Early on it finds no young Mind.* A neighbor starts at Earth’s 2040 scale and doubles every 10 Years, 5 if inward. Across the 33 seeded games no living neighbor crosses the floor by Year 50. By Year 100, 12 of 311 do. By Year 200, 147.
  - *But an elder awake shows on its first look,* from 2026-10-28 ([Elders](#elders)). In the 33 shipped games, 23 elders are awake and 10 asleep. After five Years of looks, an awake elder’s glow reads as steady, and the Mind is told so.
  - *What Earth learns is a glow, not a Mind.* The Mind hears where, when first seen and how bright, and that its color fits no dust. A glow carries no words.
  - *On Scan, 2026-10-26.* A glow at a star with no lead becomes a lead, “A grey glow”, placed on the map from the census. Its art is the case: the star’s halo breathing, and its color from 0.87 to 3 mm, a line at index 1.6 beside dust’s band of 2.4 to 3.1, its measures landing one by one. At a star with a lead already, it lands as a reading there. Odds: a Mind computing cold likely, something natural unknown unlikely, dust almost no chance.
  - *Not in the first builds walked.* It waits in the list, since it finds nothing for a long while. Revisit: with elders, it finds an old Mind at once in most games.
  - Set aside: a seeded halo hiding at a star Earth filed as dusty, which would need the checker changed. And a far-infrared telescope, since PRIMA flies from 2033 and a larger one would mostly be faster, not deeper.

## Retired with the cohort

These v1 rules no longer apply.

- Cohorts, their scheduled start, the entry lock, and the cross-cohort rule ([v1: The region](legacy/v1/HOLOS_GAME_CONCEPT.md#the-region), [v1: Time](legacy/v1/HOLOS_GAME_CONCEPT.md#time)).
- Three civilization choices per player, and the choosing screen ([v1: Player and civilization](legacy/v1/HOLOS_GAME_CONCEPT.md#player-and-civilization)).
- Earth run by AI, the paid Earth seat ([v1: Homeworlds](legacy/v1/HOLOS_GAME_CONCEPT.md#homeworlds)), and Earth’s random character per cohort ([v1: First contact](legacy/v1/HOLOS_GAME_CONCEPT.md#first-contact)).
- Neighbors as live AI Wills, run by a model ([v1: Player and civilization](legacy/v1/HOLOS_GAME_CONCEPT.md#player-and-civilization)). See [How neighbors play](#how-neighbors-play).
- Identical starts, and every seat waking at the same moment ([v1: Player and civilization](legacy/v1/HOLOS_GAME_CONCEPT.md#player-and-civilization)). See [The neighbors](#the-neighbors).
- Total loss sending the player to a new cohort ([v1: Population, purpose, and stakes](legacy/v1/HOLOS_GAME_CONCEPT.md#population-purpose-and-stakes)). See [Death and new games](#death-and-new-games).

## Carried, reworded

- **No screen shows how many civilizations there are.** v1 hid the seat count. v2 hides the roster’s size and the seed’s picks. Who is out there, and how many, is learned only by looking: Know projects, inquiries and contact.
- **Odds are words.** Settled 2026-10-13. v1 showed percentages across named explanations. v2 shows one of seven words for each. See [How Earth learns](#how-earth-learns).
- **Looks are observations, and what comes back is a reading.** Settled 2026-10-13. An observation is one pointed use of an instrument: an image, a listen, a watch. v1’s quick look and long look are a quick and a long observation. A study returns a finding. Ordinary uses of the word look stay.

## To recheck at a wider scale

Set 2026-10-28, before the refactor to a larger, sparser universe and a longer timeline. Each number below was tuned to neighbors within about 50 ly and games of a few centuries. Recheck each against the new scale, keep it or change it, and log why.

- **The Cold Halo.** Doubles every 10 Years, from 1,200 GW. A watcher 10 ly out sees it after about 26 doublings, some 260 Years. Farther out, thousands. [game/lib/sim/conflict.ts](game/lib/sim/conflict.ts) `HALO`, [calcs/early_game.py](calcs/early_game.py) `COLD_HALO_*`.
- **Glow floors.** Every watch sees a glow over 3×10¹⁸ W at 10 pc, times (77/12)³ for ours at 77 K, growing as the square of distance. A neighbor’s glow starts at 10¹³ W and doubles every 10 Years, 5 if inward. Who finds whom, and when, rests on these. [game/lib/sim/answers.ts](game/lib/sim/answers.ts) `glowsSeen`, [game/lib/sim/knowledge.ts](game/lib/sim/knowledge.ts) `glows`.
- **Calls.** A call every way at once reads to 60 ly, `CALL_REACH`. In a sparser universe few would hear one, and neighbors would rarely come to know each other.
- **Warnings.** Only to worlds a neighbor knows of, by message, call or glow. Fewer known worlds, fewer warnings. `knownTo`.
- **Bullets and screens.** 20 Years to ready, a tenth of light speed, about 110,000 Mt. A screen takes 4 Years. At hundreds of light-years a strike takes millennia to land. `BULLET`, `SCREEN` in conflict.ts.
- **Probes to us.** A probe on news of us takes 20 Years to build, a tenth of light speed, and 10 Years of burns. `probesToUs`.
- **The model’s budget.** 60 neighbor moves on each other’s news per century, `STAR_BUDGET`. Longer games mean more calls to the model in all.
- **Our colony and Earth’s stand-in.** Each reports a light-time late. A farther colony is silent far longer. A colony stands 20 Years after landing. [game/lib/sim/colony.ts](game/lib/sim/colony.ts).
- **Backups.** A woken vault doubles every 2 Years, 3 at the Trojan Vault, back to all Earth had. Fine at any scale, but a longer game makes losing Earth likelier to matter. [game/lib/game/hits.ts](game/lib/game/hits.ts).
- **Rocks.** 12 of 33 seeds send a rock, timed to a game of a few centuries. [game/lib/game/rocks.ts](game/lib/game/rocks.ts).

## Open questions

Answered one at a time, in this order. Every answer must be permitted by current observations: improbable is acceptable, contradicted is not.

1. **Settled 2026-10-10:** branch odds, read on the Metaculus pages. Taiwan is one roll: invasion 26%, blockade alone about 20%, neither 54%. Nuclear use 24%. See [Year 0 and Earth’s road to it](#year-0-and-earths-road-to-it).
2. **Settled 2026-10-06:** kinds of matter and the branches’ effects. Prices and splits are proposed in [the audit](HOLOS_PROJECT_AUDIT.md), to test in the mocks.
3. **Settled 2026-10-06:** Earth’s leads. See [Earth’s leads at Year 0](#earths-leads-at-year-0).
4. **The neighbor roster.** Thirty written as of 2026-10-10, in [HOLOS_NEIGHBORS.md](HOLOS_NEIGHBORS.md#the-roster): 15 watchers, 8 contacters, 5 inward, 2 hunters, 7 strange, 3 dead. Each passes the checker at most placements. Reaction tables, voice briefs and small voice banks are written: 1,110 lines, in [data/voices/](data/voices/). Close binaries are checked against published orbits. The host list was rechecked for white dwarf companions on 2026-10-11 and for borderline ages on 2026-10-12, 13 and 15, leaving 881 stars. Still open: full banks once the mocks show what players read most.
5. **Settled 2026-10-10:** how neighbors play and what it costs. See [How neighbors play](#how-neighbors-play).
6. **Settled 2026-10-10:** how a game starts. See [How a game starts](#how-a-game-starts).
7. **Settled 2026-10-10:** death and new games. See [Death and new games](#death-and-new-games).
8. **First mock built 2026-10-10:** [Earth’s first 15 minutes](explorations/v2-mocks/index.html), one phone with a godview lane, on one drawn game. A plain-text copy is in [index.md](explorations/v2-mocks/index.md). It raises these, all open:
   - **Settled 2026-10-10:** build times are standard, a work under way costs what is left, and the player can invest to build faster. See [Build times](#build-times).
   - **Settled 2026-10-10:** the Will may quiet Earth’s radars. See [Quieting Earth’s radars](#quieting-earths-radars).
   - **Settled 2026-10-10:** chips set the pace of compute and energy sets its ceiling. That also says what energy is for early. See [Growing compute](#growing-compute).
   - **Settled 2026-10-10:** matter is only what is spare in orbit, about 20 kt at Year 0. See [Earth’s kit at Year 0](#earths-kit-at-year-0).
   - **Settled 2026-10-10:** about 15 kt a Year of lift is spare, and the player can spend to raise it. See [Earth’s kit at Year 0](#earths-kit-at-year-0).
   - **Settled 2026-10-10:** physics decides what Earth catches, a sender that hears nothing tries again, and the player can spend more on ears. See [What Earth hears](#what-earth-hears).
   - **Settled 2026-10-10:** knocks before Year 0 happened, and Earth missed them. See [What Earth hears](#what-earth-hears).
   - **Settled 2026-10-11:** a Mind’s Cautious or Bold dial sets how long it takes to act on news. See [How neighbors play](#how-neighbors-play).
   - **Priced 2026-10-11:** chip fabs, factory-built works, the orbital yard and the all-sky watch. See [Build times](#build-times) and [Growing compute](#growing-compute).
   - **Settled 2026-10-12:** 11 of the 31 half-minutes had nothing new for the player. That is a flaw: v1’s first-session rule holds in v2. See [How a game starts](#how-a-game-starts). What may land is settled too: readings from observations, findings from studies, and Earth’s old messages arriving. Studies run on their own from Begin, and observations are offered as follow-ups. The rebuilt mock has 4 quiet half-minutes.
9. **Settled 2026-10-10:** v1’s research baseline, rechecked against the 2025 radar result and Garrett’s 2026 cold-computing paper. See [Why the sky is quiet, rechecked](#why-the-sky-is-quiet-rechecked).
10. **Second mock built 2026-10-13:** [the first hour away](explorations/v2-mocks/index.html#hour), minutes 15 to 60, on the same game. What each reading shows is a sample.
    - **Replayed 2026-10-14 at paced speed.** The watches are built at minute 21. The telescope is done at minute 30, with the Mind’s warning about energy. The player orders the orbital yard and probe yard, then the telescope gives a partial reading of one living world and finds a dead one next door, and the player starts the laser array at minute 35. The sweep’s first pass is done at minute 38. A contacter’s knock reaches Earth at minute 42, and the all-sky watch the player built catches it. The player is woken seven times and plays about nine minutes.
    - **Settled 2026-10-13:** physics sets how long an observation or a sweep takes. See [How Earth learns](#how-earth-learns).
    - **Settled 2026-10-13:** matter piles up in the first hour, and the Mind says what it is for: megatonne works, which must come from the Moon or the belt. See [Earth’s kit at Year 0](#earths-kit-at-year-0).
    - **Settled 2026-10-13:** the Mind reads a knock at once, in three layers: what it proves, what it holds, and what it means as a word. See [What Earth hears](#what-earth-hears).
    - **Settled 2026-10-13:** an answer holds what v1 allowed, whole, lies included. See [What Earth hears](#what-earth-hears).
    - **Settled 2026-10-13:** seasons are left out on purpose. A real telescope can’t point near the Sun, and the game skips that limit. See [How Earth learns](#how-earth-learns).
    - **Settled 2026-10-13:** Earth shows every world it has felt from Year 0, and the Mind leads with the nearest. See [The seed, drawn](#the-seed-drawn).
    - **Settled 2026-10-13:** a living neighbor becomes known as fast as physics allows. In this game nothing Earth holds at Year 9 can tell Varn’s world from a natural one. A far-side array would, in 5 hours. See [How Earth learns](#how-earth-learns).
    - **Settled 2026-10-13:** a loud first hour is left as the seed draws it. See [The seed, drawn](#the-seed-drawn).
    - **Settled 2026-10-13:** the first telescope reads a dead world’s strange air, and not its cause. Proof needs an infrared interferometer, or going. See [How Earth learns](#how-earth-learns).
    - **Settled 2026-10-13:** a sweep finds natural warm worlds too, at the real rate. In this game its first pass shows 15 new points of light: 4 homes and 11 natural worlds. See [How Earth learns](#how-earth-learns).
    - **Settled 2026-10-13:** alive is a ladder, and a natural world climbs no higher than animals and forests. Every mind stays hand-written. See [How Earth learns](#how-earth-learns).
    - **Settled 2026-10-13:** its star’s age sets a natural world’s rung, on Earth’s schedule with scatter, and physics says whether it kept its air. In this game the sweep’s 11 natural worlds are 4 alive, 2 where life died, 2 airy and lifeless, 2 bare rock, 1 frozen. Recounted 2026-10-16. See [How Earth learns](#how-earth-learns).
    - **Settled 2026-10-13:** the Mind gives its judgment in words, never in numbers. Both mocks now show words. See [How Earth learns](#how-earth-learns).
    - **Settled 2026-10-13:** the Mind judges from what Earth knows, never from the seed, and it can be wrong. A first voice lifts Minds a word at every candidate. In this game it calls Minds very unlikely at the sweep’s 15 points of light, and 4 are homes. See [How Earth learns](#how-earth-learns).
    - **Priced 2026-10-13:** what an inquiry costs in time. A laser array takes 25 Years, and what the sails see at 4.3 ly reaches us near Year 60. See [Build times](#build-times). Every question this mock raised is now closed.
11. **Third mock built 2026-10-13:** [the long roads](explorations/v2-mocks/index.html#long), hours 1 to 5, on the same game. The player starts five long works at Year 12 and is woken twelve times.
    - **Replayed 2026-10-14** with every work paced by thought, down the line in the order begun, from Year 0. Years 12 to 51, about three hours.
    - *What it shows.* 35 minutes with no wake. Smog at four worlds at Year 22, each of them a home, and a solar lens sent to the farthest. Sails launched at Year 24.8. A second voice at Year 30, and a first answer, 21 Years late. Radio from two worlds at Year 34: the first proof of minds by Earth’s own instruments. Each new fifth of the far-side array listens again: radio from 12 Ophiuchi at Year 38.4 and Gliese 1021 at 43.1. Power from orbit at Year 44. The lens’s picture of Hael’s world at 45.7. What the sails saw at Alpha Centauri reaches us at Year 51.
    - *Wakes, as played:* twelve in about three hours, about one every 16 minutes. The longest quiet is 35 minutes, Years 12 to 19.
    - *The plateau, as played:* 34 Years, 2.8 hours, from the grid limit until power from orbit makes room for a twelfth data center. At standard pace it is also about 34, by `python3 calcs/early_game.py`, 2026-10-25.
    - *One knock is never heard.* Hael’s, at Year 20, is under the all-sky watch’s floor. A deep-field receiver held on that star would have caught it. The Mind advised one at Year 9.9, and this player left it.
    - **Settled 2026-10-13:** thought buys speed, down to a floor physics sets. See [Growing compute](#growing-compute).
    - **Settled 2026-10-13:** a work wants thought in scale with its real cost. See [Growing compute](#growing-compute).
    - **Settled 2026-10-14:** thought is split by an order the player sets. See [Growing compute](#growing-compute).
    - **Settled 2026-10-14:** the plateau stands as played. Twelve wakes in about three hours, about as often as the first hour, and the longest quiet is 35 minutes. Every wake comes from a settled rule or the player’s orders, and the player chooses what wakes them. Set aside: waking the player for every finished work, and new event sources for the middle hours.
    - Every question this mock raised is now closed.
    - **Settled 2026-10-14:** the Mind advises a listen at marked worlds, and the player decides. See [What Earth hears](#what-earth-hears).
    - **Settled 2026-10-14:** one receiver is split among the stars it holds, and each part hears less far. See [What Earth hears](#what-earth-hears).
    - **Settled 2026-10-14:** a suspicion opens the whole kit, and the Mind lists the ways. In the mock the player sends a solar lens to Gliese 1021, the smog world too far for the first fifth. Its picture comes at Year 45.7: Earth’s first sight of Hael’s people. See [How Earth learns](#how-earth-learns).
    - **Settled 2026-10-14:** a late answer costs nothing extra. A sender listens for good, and its own tables carry the cost. See [How neighbors play](#how-neighbors-play).
    - **Settled 2026-10-14:** before its Mind wakes, a world with arrays may answer as a people, and its Mind inherits the exchange. See [How neighbors play](#how-neighbors-play).
    - **Settled 2026-10-14:** a picture shows everything larger than a pixel. The lens and the dispatch now follow the rule. The swarm is a thousand sails, launched over six days of laser, and about 300 arrive. See [How Earth learns](#how-earth-learns).
    - **Settled 2026-10-13:** the plateau at the grid limit stands. Better chips don’t dodge it, and the megatonne road pays there. See [Growing compute](#growing-compute).
12. **The mocks on other games, 2026-10-14:** [seed 11](explorations/v2-mocks/seed-11.html), with no voice, five felt worlds and a living neighbor next door, and [seed 62](explorations/v2-mocks/seed-62.html), where the first mirror can read no felt world. The first hour now runs on any seed. It raised one question:
    - **Settled 2026-10-14:** a neighbor’s probe is a rocket, v1’s. Small dark sails were set aside to keep the game simple. Its braking flame is X-rays and shows only close in, corrected the same day: only in its last weeks, within a few AU. See [How neighbors play](#how-neighbors-play).
    - **Settled 2026-10-14:** where a probe ends its burn is its sender’s Open or Hidden dial, as odds. A Hidden sender’s probe most often stops far out, unseen. See [How neighbors play](#how-neighbors-play).
    - **Settled 2026-10-15:** a fusion drive takes 30 Years at standard pace, and burns 20 to reach a tenth of light speed. Every trip gains 10 Years for speeding up, probes’ too.
    - **Settled 2026-10-15:** a seed ship takes 18 Years at standard pace, built in the orbital yard. The drive sets the launch.
    - **Settled 2026-10-15:** a production line is a project for one kind of work. Copies then run side by side, each 85% as long per doubling of the count. Without one, every copy takes the full time.
    - **Settled 2026-10-15:** unproven biology is judged case by case. Artificial wombs and sleepers work, as research. Sleepers make a ship of people about 26 t a person.
    - **Settled 2026-10-15:** the other unproven cases, as proposed: closed life support works, copying a human mind and living for centuries are set aside, antimatter and terraforming are allowed at their prices. Living for centuries was superseded on 2026-10-17: life is solved at Year 0.
    - **Mocked 2026-10-15:** [Earth’s first seed ship](explorations/v2-mocks/index.html#L5730), in seed 10’s long roads. The player asks what settling takes at Year 19, and starts a drive, deuterium works and a ship, last in the line. The long roads move under a sixth of a Year. The ship is done at Year 33 and the fuel at 32, but the drive, last in line, takes until 47.6. It leaves for Proxima Centauri then and lands about Year 115.
    - **Mocked 2026-10-14:** [seed 11, next door](explorations/v2-mocks/seed-11.html#next). Hael answers Earth’s knock at Year 16.5, the Mind reads its tables for silence, the player builds an X-ray watch, and it catches Hael’s probe 29 days out, at Year 36. It raised one question: what does a neighbor’s probe do once it arrives?
    - **Settled 2026-10-15:** what its orders say, rolled by its sender at launch: watch, hail, or wait to be hailed. Hael’s probe hails.
13. **Earth’s outposts and colonies, begun 2026-10-14.** See [Outposts and colonies](#outposts-and-colonies).
    - **Settled 2026-10-14:** people may go anywhere physics allows, at real prices. Nothing artificial limits the Will, since Holos tests the Fermi paradox.
    - **Settled 2026-10-14:** neighbors may spread too, by the same physics and prices, when their scripts choose.
    - **Settled 2026-10-14:** the seed rolls whether each neighbor spreads, weighted by its dial, and each colony rolls again.
    - **Settled 2026-10-14:** Earth sees of a colony what physics gives: almost never its ship, its radio as its parent’s, and no heat for centuries.
    - **Settled 2026-10-14:** a colony ship brakes on a magnetic sail, 15 Years more a trip, by Gros 2017’s case. Corrected the same day: its sail’s radio dies in the gas, so Earth can’t hear it.
    - **Settled 2026-10-14:** every seed stands alone, so a seed ship weighs about 1,500 t. A laser, deuterium or helium-3 pushes it, at real prices.
14. **Fourth mock built 2026-10-16:** [the long wait](explorations/v2-mocks/index.html#late), hours 5 to 10, on seed 10’s game. Years 51 to 119, through the night.
    - *What it shows.* The player asks what happened at Alpha Centauri A, and orders the far-side array to listen to the six worlds that speak, waking them for any change.
    - *Two worlds change.* Varn’s tones fall to a tenth at Year 88.9, 31 Years after its Mind woke. Kirrin’s stop at Year 113.6. The Mind can’t tell a waking from an ending, and says so.
    - *A knock comes again.* Ombe, unanswered by its own clock, knocks again at Year 59. It reaches Earth at Year 108, 29 Years after Earth’s answer reached Ombe. The Mind dates it by when it was sent.
    - *Hael’s second knock is missed too,* at Year 119.3, under the all-sky watch’s floor as its first was.
    - *The seed ship lands* at Proxima Centauri at Year 115, and word reaches Earth at Year 119.4. It stands alone as a Mind about Year 135.
    - *Wakes, as played:* four in about six hours. The longest quiet is about 3 hours, Years 51 to 89.
    - *Rolled here, keyed to the seed:* each sender’s move on silence and on Earth’s reply, from its tables. Ombe knocks again, then sends a probe on hearing Earth. Hael knocks again. Ree sends knowledge unasked, reaching Earth about Year 130.
    - *The Mind advises, and does nothing more.* At Year 51 it says half its thought is idle. This player leaves it.
    - **Settled 2026-10-16:** a seed lands where its order says. If the order names only a star, the Mind asks and advises. In the mock the player picks Proxima d. See [Outposts and colonies](#outposts-and-colonies).
    - **Settled 2026-10-16:** the Will can move into a new Mind, as light, with only the crossing on screen. A stand-in AI Will runs the Mind left behind. See [Outposts and colonies](#outposts-and-colonies).
