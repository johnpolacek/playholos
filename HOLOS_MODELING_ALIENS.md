# Holos · Modeling Other Minds

Last updated: October 30, 2026.

How Holos decides who else is out there, how many, how old, where, and what they do. First the criteria every decision must meet. Then the model those criteria produce. Then the science, research and data behind each part, with links.

This is the reasoning behind the game’s numbers. The numbers themselves live in [HOLOS_GAME_CONCEPT.md](HOLOS_GAME_CONCEPT.md#the-realistic-premise), and every source is logged in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md).

“Are we alone?” is still an open question. Holos doesn’t answer it. It takes the best current estimate and lets us play inside it.

## The criteria

Every choice about other minds has to pass these, in order.

1. **Evidence first.** Start from real data and published research, the newest included. Only then speculate, and only from the best evidence we have.
   - Preliminary results are marked as preliminary, with what would change if the full paper differs.
2. **Improbable is fine for details. Contradicted is not.** A detail can be unlikely. Nothing can conflict with what has been observed.
3. **The premise follows the best estimate, not what plays well.** How many minds exist, where and how old, is set by the middle of the evidence.
   - Example: until October 28, 2026, Holos put a few to a few dozen neighbors within 50 light-years, all waking in our century. That was chosen for play, not from evidence, so it went.
4. **Carry the whole range, then pick its middle.** Where estimates span many orders of magnitude, we say so, and take the center. We don’t lean toward either end without a reason.
5. **The quiet sky is a hard constraint.** Any model must explain what we actually see: no signals, no visitors, no galaxies glowing with waste heat. A model that predicts a loud sky is wrong.
6. **Model what physics lets us see.** We assume nothing about what other minds want, beyond incentives physics gives every mind. No scripted personalities.
7. **Nothing faster than light.** Every observation is old news. Every reply takes as long again.
8. **Parity.** Anything another mind can do, Earth can build too, at the same price and pace. The reverse holds as well.
9. **All or none, by likelihood.** If a feature is more likely than not, it is in every game. If less likely, in none. We don’t sprinkle it in some games to add variety.
10. **One number, one place.** Each estimate is stored once, so new research can change it without breaking the rest.
11. **Show the set-asides.** Every rejected option is recorded, with why. Disagreement with the model should be able to find the exact step it disagrees with.

## The model in brief

| Question | Holos’s answer | Confidence |
| --- | --- | --- |
| How common are minds? | About 1 per million stars, about 200,000 in our Galaxy | Low. The honest range is 1 per 1,000 to 1 per 10 billion |
| How common is life? | Common. Life starts on about 3 in 4 suitable worlds | Moderate, for Earth-like conditions |
| Where is the rare step? | From animals to a mind that builds | Low. Contested |
| How far is the nearest mind? | Typically about 400 light-years | Follows from the density |
| How old is a mind we find? | Older, likely by around a billion years | About 75% |
| Any minds our age? | About 5 in the whole Galaxy, 10,000 to 50,000 light-years away | Follows from the density |
| What do old minds do? | Turn inward. Compute cold, or sleep | Moderate. Forced by the quiet sky |
| Has anyone heard us? | Almost surely not. Our radio reaches about 90 light-years | About 99% |
| Is something watching us? | Yes, a small dark watcher in our system | About 2 in 3. Low |
| What is dangerous? | Spreading. Seeds that build can draw a warning, then worse | A guess. No evidence on motives |

## The chain: from stars to minds in 2040

The plain idea: start with every star, and at each step keep only the share that passes. What is left at the end is how common minds are. Each step depends on the ones before it, so a change anywhere moves the result.

The middle column follows 100 typical stars near us. The counts for steps 2 to 6 come from the game’s own life draws, `python3 calcs/seed.py stats`, over 400 games. Each game draws 183 warm worlds among the 881 single stars within 50 ly that could host one. About 1,500 stars lie within 50 ly in all, counting white dwarfs, brown dwarfs and stars in tight pairs.

| Step | Out of 100 stars | Share kept | Basis | Confidence |
| --- | --- | --- | --- | --- |
| 1. Stars | 100 | | About 200 billion in our Galaxy. Its stars weigh about 61 billion Suns ([Licquia and Newman 2015](https://arxiv.org/abs/1407.1078)), and most are red dwarfs far lighter than the Sun, so the count runs about 100 to 400 billion. Holos takes 200 | Good |
| 2. A rocky world in the warm zone | 12 | About 1 in 8 of all stars. 0.24 per star that can host one, about 0.21 after orbit checks | [Stark et al. 2019](https://arxiv.org/abs/1904.11988), from Kepler’s counts. Range 0.08 to 0.70. For Sun-like stars, [Bryson et al. 2021](https://arxiv.org/abs/2010.14812) find 0.37 to 0.60, with wide error bars. For red dwarfs, [Dressing and Charbonneau 2015](https://arxiv.org/abs/1501.01623) find about 0.16 Earth-sized worlds in each warm zone | Moderate |
| 3. It keeps its air and isn’t frozen | 4.2 | About 1 in 3 | The cosmic shoreline, where a world’s gravity against the light it takes decides whether it keeps air ([Zahnle and Catling 2017](https://arxiv.org/abs/1702.03386), as a formula in [Pass, Charbonneau and Vanderburg 2025](https://arxiv.org/abs/2504.01182)). Most nearby stars are red dwarfs, whose young flares strip air. JWST and Spitzer find bare rock on the rocky red-dwarf worlds measured so far, such as TRAPPIST-1 b ([Greene et al. 2023](https://arxiv.org/abs/2303.14849)) and LHS 3844 b ([Kreidberg et al. 2019](https://arxiv.org/abs/1908.06834)). A few worlds are born frozen ([Henry, von Hippel and Childs 2026](https://arxiv.org/abs/2609.01790)) | Moderate |
| 4. Life starts | 3.1 | 3 in 4 | [Kipping 2025](https://arxiv.org/abs/2504.05993): a fast start favored 13 to 1 where conditions are Earth-like. It rests on the last common ancestor living about 4.2 billion years ago ([Moody et al. 2024](https://doi.org/10.1038/s41559-024-02461-1)). [Spiegel and Turner 2012](https://arxiv.org/abs/1107.3835) caution that a fast start is weak evidence, since we had to exist to ask | Moderate, for Earth-like worlds |
| 5. Life lasts | 1.6 | 1 in 2, an assumption | Early life may often die out before it can steady its planet’s climate. [Chopra and Lineweaver 2016, “The Case for a Gaian Bottleneck”](https://doi.org/10.1089/ast.2015.1387) argue almost all does, and give no rate. Models disagree on how often: some worlds lose life fast and others keep it ([Nicholson et al. 2018, ExoGaia](https://arxiv.org/abs/1803.08063)), and life on many worlds tends to keep conditions livable ([Arthur and Nicholson 2023](https://arxiv.org/abs/2301.02150)). The usual warm zone assumes rock weathering steadies a climate without life, so few would die. No one has a rate, anywhere from few to almost all, so Holos assumes half | Low |
| 6. Life reaches animals, by now | 0.94 | About 3 in 5 of living worlds | Each step waits for oxygen, as on Earth ([Mills et al. 2025](https://doi.org/10.1126/sciadv.ads5698)). Oxygen lasted from 2.3 billion years ([Poulton et al. 2021](https://doi.org/10.1038/s41586-021-03393-7)), animals and forests from about 4.0 ([Reinhard et al. 2017](https://arxiv.org/abs/1702.01137)). Each world runs faster or slower, 1.6 times at one sigma | Moderate |
| 7. Animals to a mind that builds | 0.0001 | **About 1 in 9,400** | What the chain needs to reach 1 mind per million stars. Bounded by [Mills et al. 2025](https://doi.org/10.1126/sciadv.ads5698), no hard steps, and [Snyder-Beattie et al. 2021](https://doi.org/10.1089/ast.2019.2149), hard steps. [Kipping 2020](https://arxiv.org/abs/2005.09008) slightly favors rare intelligence. Details below | Low. This is the contested step |
| 8. Minds don’t die | 0.0001 | All | No outside evidence. It follows the [game’s premise](HOLOS_GAME_CONCEPT.md#the-realistic-premise): at Year 0, aging and illness are solved and Earth’s people and machines wake as one Mind. A mind like that doesn’t age out, so minds add up over the Galaxy’s history | An assumption |

**The result:** about 1 mind per million stars. Times 200 billion stars, that is about 200,000 minds in our Galaxy in 2040. The nearest is typically about 400 light-years from us.

**How much step 5 matters.** Its range is wide, from few dying to almost all. It doesn’t move the count of minds, since that comes from the density’s range as a whole, and step 7 is what is left over. It moves where the rarity sits.

- *If few die, say 1 in 5,* about 2.5 worlds per 100 stars keep life, about 1.5 reach animals, and step 7 becomes about 1 in 15,000.
- *If 99 in 100 die,* about 0.03 per 100 stars keep life, nearby life is rare, and step 7 becomes about 1 in 200. The Gaian bottleneck would then be much of the answer to the Fermi paradox, as Chopra and Lineweaver argue.
- *Either way,* step 7’s own range, from 1 in 9 to 1 in 94 million, is far wider. Step 5 shifts the picture of life near us more than the count of minds.

### Step 7: from animals to a mind that builds

**How often.** About 1 world with animals in 9,400 ever produces a mind that builds. That is what the chain needs to land on 1 mind per million stars, given steps 1 to 6.

- Put another way: of all the worlds near us that have had animals, about 0.94 per 100 stars, a mind is very unlikely on any one of them.
- Across the Galaxy there are about 1.9 billion worlds with animals, and about 200,000 minds.
- *The range.* It inherits the density’s honest range, 1 mind per 1,000 stars to 1 per 10 billion. Step 7 then runs from about 1 in 9 to about 1 in 94 million.
- *The high end* is the no-hard-steps view (Mills et al. 2025). Each step waited for the planet to allow it, and humans arose on time. Then minds should be common on old enough worlds with animals.
- *The low end* is the hard-steps view (Snyder-Beattie et al. 2021). Each big step is so unlikely that it usually doesn’t happen before a world stops being habitable.
- *Why Holos puts the rarity here, not earlier.* Animals have lived on Earth for about 600 million years. Many lines grew clever, octopuses, crows, dolphins, apes, and only one built lasting tools. Kipping 2020 slightly favors rare intelligence, about 3 to 2. Steps 4 to 6 have physical clocks, oxygen above all. Step 7 has none we know of.
- *Why no rarer.* At the low end, our Galaxy holds about 20 minds. That is allowed. Holos takes the middle of the range, per criterion 4.

**How long it takes.** On a world where it happens, about 0.5 to 2 billion years after animals.

- *Earth’s case.* Animals about 600 million years ago, a builder now. About 0.5 billion years.
- *The window.* A world with animals stays habitable only so long. Mills et al. 2025 give Earth’s land life about 1.0 to 1.9 billion years more. So Earth’s window for a mind runs about 1.5 to 2.5 billion years from animals. Each world’s clock runs faster or slower with its pace.
- *If the step is rare,* a mind that does arise could come at any time in the window, about evenly. A typical wait is then about half the window, around a billion years. Earth, at 0.5 billion, came early in its window but not unusually.
- *As a rate:* about 1 chance in 19,000 per billion years of animal life, on any one world.
- *What it sets.* A world reaches animals at about 4 billion years old, and a mind about a billion years later. Earth-like worlds near us are about 1.8 billion years older than Earth on average (Lineweaver 2001). So most minds woke long ago, and any mind we find is likely older than us by around a billion years.
- *In 2040.* Minds arise at about 25 per million years across the Galaxy. Nearly all 200,000 are already old. About 5 woke within 100,000 years of us, either side, thousands of light-years away.

## The evidence, by question

### 1. How common are minds?

The plain idea: count the steps from a star to a mind, and multiply the odds of each. Almost all the doubt sits in one step, a living world making a mind that builds.

- **[Sandberg, Drexler and Ord 2018, “Dissolving the Fermi Paradox”](https://arxiv.org/abs/1806.02404)** · Preprint.
  - Carries honest uncertainty through every factor of the Drake equation, rather than multiplying single guesses.
  - The result: a substantial chance that no one else is in the observable universe, and also room for many.
  - Informs: criterion 4, and why a sparse best guess is the honest one.
- **[Kipping 2020, “An objective Bayesian analysis of life’s early start and our late arrival”](https://arxiv.org/abs/2005.09008)** · Published, PNAS.
  - Rerun Earth’s clock and life should often start again. Intelligence is a different matter: rare is slightly favored, about 3 to 2.
  - Informs: common life, rare minds.
- **[Kipping 2025](https://arxiv.org/abs/2504.05993)** · Accepted, Astrobiology.
  - With the last common ancestor dated to about 4.2 billion years ago, a fast start for life is favored 13 to 1 over a slow one. His caution: this holds for Earth-like conditions, which may themselves be rare.
  - Informs: life on about 3 in 4 suitable worlds. That share is this project’s sample, following Kipping’s odds.
- **[Moody et al. 2024](https://doi.org/10.1038/s41559-024-02461-1)** · Published, Nature Ecology and Evolution.
  - The last common ancestor of all life lived about 4.2 billion years ago, between 4.09 and 4.33.
  - Informs: the fast start Kipping 2025 builds on.
- **[Snyder-Beattie et al. 2021](https://doi.org/10.1089/ast.2019.2149)** · Published, Astrobiology.
  - The “hard steps” case. Each big transition took longer, on average, than Earth will last, so intelligent life is exceptionally rare.
  - Informs: the low end of the range, near 1 mind per 10 billion stars.
- **[Mills et al. 2025](https://doi.org/10.1126/sciadv.ads5698)** · Published, Science Advances.
  - The opposite case: no hard steps. Each step waited for Earth to allow it, mostly for enough oxygen, and humans arose on time. A step that happened once is not proof it was hard.
  - Informs: the high end of the range, near 1 in 10. Also the rungs from microbes to animals, which Holos keeps at Earth’s pace.
- **[Watson 2025](https://doi.org/10.1098/rstb.2024.0105)** · Published, Philosophical Transactions B.
  - A hard-steps update. Puts the hard steps earlier, at whole-Earth changes tied to oxygen and the great ice ages.
  - Informs: recorded as the view set aside. Holos puts the rare step last.
- **[Spiegel and Turner 2012](https://arxiv.org/abs/1107.3835)** · Published, PNAS.
  - Life’s early start is weak evidence that life is common, since we had to exist to ask.
  - Informs: the bounds on how common life is. Kipping 2020 answers it with an objective prior.
- **[Lineweaver and Davis 2002](https://arxiv.org/abs/astro-ph/0205014)** · Published, Astrobiology.
  - Reads Earth’s fast start as at least a 13% chance of life on suitable worlds older than a billion years.
  - Informs: the same bounds, from the other side.

**What Holos takes:** one mind per million stars, the middle of a range from 1 per 1,000 to 1 per 10 billion. Denser fights the quiet sky: 1 per 1,000 would mean about 100 million silent minds in our Galaxy. Minds here don’t die, as ours won’t, so there is no lifetime factor.

### 2. How old would they be?

The plain idea: most Earth-like planets that exist today formed before ours. So a mind we meet most likely woke long before us.

- **[Lineweaver 2001, “An estimate of the age distribution of terrestrial planets in the universe”](https://arxiv.org/abs/astro-ph/0012399)** · Published, Icarus.
  - About three quarters of Earth-like planets are older than Earth, by 1.8 ± 0.9 billion years on average.
  - Informs: any mind we find is older, likely by around a billion years.
- **[Lineweaver, Fenner and Gibson 2004, the Galactic habitable zone](https://arxiv.org/abs/astro-ph/0401024)** · Published, Science.
  - The same answer for our own Galaxy. About three quarters of stars in its habitable ring are older than the Sun.
  - Informs: the same.
- **[Behroozi and Peeples 2015, “On the history and future of cosmic planet formation”](https://arxiv.org/abs/1508.01202)** · Published, MNRAS.
  - Earth formed before about 92% of the Earth-like planets the universe will ever make.
  - Informs: why Earth is early in cosmic time but young among worlds that exist now. Those future worlds don’t exist yet, so we can’t meet them.

**What Holos takes:** a peer waking within a century of us is effectively zero. Across the whole Galaxy, about 5 minds woke within 100,000 years of us, typically 10,000 to 50,000 light-years away. That is why the game’s map is the Galaxy, and a game can run 100,000 Years or more.

### 3. Why is the sky quiet?

The plain idea: if minds are out there, why haven’t we seen them? Part of the answer is that we have barely looked. The rest has to come from what minds do.

**How little we have searched**

- **[Wright, Kanodia and Lubar 2018, “How Much SETI Has Been Done?”](https://arxiv.org/abs/1809.07252)** · Published, AJ.
  - Models every place a radio signal could hide as an eight-dimensional “cosmic haystack”. If that space were Earth’s oceans, the share searched so far is about a large hot tub.
  - Informs: radio silence alone says very little.
- **[Price et al. 2020, Breakthrough Listen on 1,327 nearby stars](https://arxiv.org/abs/1906.07750)** · Published, AJ.
  - About 15 minutes per star, 1.1 to 3.45 GHz, listening for narrow tones. Rules out steady transmitters above about 2×10¹⁰ to 3×10¹¹ W at those distances.
  - Informs: the null result our Mind starts from.
- **[Forgan and Nichol 2010, “A failure of serendipity”](https://arxiv.org/abs/1007.0850)** · Published, International Journal of Astrobiology.
  - Two Earth-like civilizations placed at random in the Galaxy overhear each other’s stray emissions about one time in ten million.
  - Informs: why chance overhearing is not how minds find each other.
- **[Sheikh et al. 2025, “Earth detecting Earth”](https://arxiv.org/abs/2502.02614)** · Published, AJ.
  - Earth’s own detectable signs, seen with today’s instruments, span 13 orders of magnitude. Planetary radar reaches about a thousand times farther than the best sign that isn’t radio.
  - Informs: radio, not heat or air, is how a world like ours is found first.

**What the quiet still rules out**

- **[Hart 1975, “An explanation for the absence of extraterrestrials on Earth”](https://ui.adsabs.harvard.edu/abs/1975QJRAS..16..128H/abstract)** · Published, QJRAS.
  - If anyone spread, they would have filled the Galaxy long ago. They aren’t here, so no one spread.
  - Informs: criterion 5. Minds that spread far must be rare or absent.
- **[Nicholson and Forgan 2013, slingshot dynamics for self-replicating probes](https://arxiv.org/abs/1307.1648)** · Published, International Journal of Astrobiology.
  - Self-copying probes could explore the Galaxy in about 10 million years.
  - Informs: an old mind had a hundred times that long. So either no one sent them, or they are here and quiet.
- **[Armstrong and Sandberg 2013, “Eternity in six hours”](https://doi.org/10.1016/j.actaastro.2013.04.002)** · Published, Acta Astronautica.
  - Spreading across galaxies is cheap for a civilization that can take apart a planet like Mercury.
  - Informs: sharpens the quiet. Also gives the mass of a swarm, 3.3×10²³ kg, used for how bright a growing mind would be.
- **[Wright et al. 2014, the Ĝ search for waste heat](https://arxiv.org/abs/1408.1133)** · Published ([framework](https://arxiv.org/abs/1408.1134)).
  - Any mind using lots of energy must shed it as heat, which infrared surveys can see. Also, no single behavior can be assumed for every civilization.
  - Informs: why a mind that kept growing would blaze in our infrared archives.
- **[Suazo et al. 2024, Project Hephaistos II](https://arxiv.org/abs/2405.02927)** · Published, MNRAS.
  - About five million stars screened in Gaia, 2MASS and WISE for the warm glow of partial Dyson spheres. Seven candidates, all red dwarfs, none confirmed.
  - **[Project Hephaistos IV, 2026](https://arxiv.org/abs/2607.09460)** · Preprint. Two of the candidates resolve into foreground stars and background galaxies.
  - Informs: no warm footprints near us. Reach must be small.
- **[AllWISE sensitivity](https://irsa.ipac.caltech.edu/data/WISE/docs/release/AllWISE/expsup/sec2_3a.html)** · Data.
  - 12 µm depth of about 0.73 mJy in clear sky. A Sun’s full output in waste heat at 30,000 light-years is about 1.5 mJy before dust.
  - Informs: a growing young mind anywhere in the Galaxy sits right at today’s limit. A deeper, repeating survey would catch one.

**What Holos takes:** our stated answer is rare, inward, watching. Few minds, almost all gone quiet, and quiet watching is cheap.

### 4. What do old minds do?

The plain idea: computing costs less energy the colder it runs. So a mature mind that mostly thinks has a reason to stay home, go cold, and stop growing. That reason applies to every mind, which is why they can all choose alike.

- **[Landauer on dissipation](https://research.ibm.com/publications/dissipation-and-noise-immunity-in-computation-and-communication)** and **[Bennett on Landauer’s principle](https://arxiv.org/abs/physics/0210005)** · Published.
  - Erasing information has a minimum heat cost that scales with temperature.
  - Informs: the physics behind cold computing.
- **[Sandberg, Armstrong and Ćirković 2016, “That is not dead which can eternal lie”](https://arxiv.org/abs/1705.03394)** · Published, JBIS.
  - The aestivation hypothesis. Waiting for the universe to cool gains about 10³⁰ in computing. Minds would sleep and save their matter.
  - Informs: an old mind asleep, giving off almost nothing.
- **[Bennett, Hanson and Riedel 2019, comment on aestivation](https://arxiv.org/abs/1902.06730)** · Published, Foundations of Physics.
  - Matter not yet in equilibrium can absorb the heat now, so nothing forces waiting.
  - Informs: an old mind awake, computing cold today at a steady rate. Holos keeps both, about half each.
- **[Garrett 2026, “Slysh haloes”](https://arxiv.org/abs/2608.31153)** · Preprint.
  - Heavy computing far from a star could shed its heat at 5 to 28 K. It would glow faint, grey and featureless in the far infrared and submillimetre, bands older searches mostly skipped. Existing archives could be reread for it.
  - Informs: how an awake old mind shows, and why it can hide today. Our deep far-infrared archives only cover stars within about 150 light-years.

### 5. How far does a young mind spread?

The plain idea: a young mind first builds out its home system, then may send a few seeds. Light delay makes a far colony a separate mind, a rival. So most stay close.

- **[Metzger et al. 2013, bootstrapping a space industry](https://arxiv.org/abs/1612.03238)** · Published, Journal of Aerospace Engineering.
  - Self-copying industry grows in generations about 2 years apart.
  - Informs: building out a home system takes 50 to 1,000 years.
- **[Omohundro 2008, “The basic AI drives”](https://selfawaresystems.com/wp-content/uploads/2008/01/ai_drives_final.pdf)** · Published, AGI 2008 proceedings.
  - Most goal-seeking agents gather resources and protect themselves, whatever their goals.
  - Informs: the case for spreading at all, mostly as backups.
- **Suazo et al. 2024 and Hart 1975,** above.
  - Informs: the quiet sky caps reach at about 200 light-years. With one mind per million stars, Earth sits outside every mind’s footprint only if each holds under about 100,000 stars. This project’s arithmetic.

**What Holos takes:** a young mind stays outward 50 to 20,000 years. About 1 in 4 stays home, about 2 in 3 seed a few stars under 50 light-years away, about 1 in 10 spreads up to 200. Then it turns inward. By the time our light reaches a peer, it is almost always inward already.

### 6. Is something watching us?

The plain idea: with about 200,000 old minds in our Galaxy, only one has to send a watcher. A 1 kg watcher for every star is trivial for an old mind.

- **[Benford 2019, “Looking for Lurkers: Co-orbiters as SETI Observables”](https://arxiv.org/abs/1903.09582)** · Published, AJ.
  - Earth’s co-orbiting asteroids, such as Kamoʻoalewa, are where a watcher could sit unseen. They could be searched.
  - Informs: where Earth looks for the watcher.
- **[Sagan and Newman 1983, “The solipsist approach to extraterrestrial intelligence”](https://ui.adsabs.harvard.edu/abs/1983QJRAS..24..113S/abstract)** · Published, QJRAS.
  - Wise minds would refuse self-copying probes, since copies can drift and run wild.
  - Informs: why a watcher is sent whole, not grown. It doesn’t argue no watcher is sent.
- **Nicholson and Forgan 2013,** above.
  - Informs: anyone who wanted to could have reached us long ago.

**What Holos takes:** a silent watcher sits in our system in every game. About 2 in 3, low confidence. Our system has never been searched well for metre-sized objects, so nothing contradicts it.

### 7. Could anyone have heard us?

The plain idea: our strongest radio signals began in the 1950s and travel at light speed. By 2040 they reach about 90 light-years. The nearest mind is typically about 400 away.

- **[Loeb and Zaldarriaga 2007](https://arxiv.org/abs/astro-ph/0610377)** · Published, JCAP.
  - Earth’s strongest steady emissions are early-warning radars, about 2×10⁸ W each. A month’s stare with an SKA-class array hears them to about 200 parsecs.
- **[Saide, Garrett and Heeralall-Issur 2023](https://academic.oup.com/mnras/article/522/2/2393/7028804)** · Published, MNRAS.
  - Cell towers give off about 4 GW at peak. A Green Bank-class dish could not hear them even within 10 light-years.
- **Saide, Garrett and colleagues 2025, airport and military radar** · Preliminary, [RAS National Astronomy Meeting](https://ras.ac.uk/news-and-press/research-highlights/how-airports-heathrow-and-gatwick-could-help-aliens-spot-earth).
  - Airport radars worldwide could be heard to about 200 light-years by a dish like Green Bank’s.

**What Holos takes:** Earth is unheard at Year 0. The chance a mind lies inside our radio bubble is about 1%. Only the watcher has heard us.

### 8. Would they be hostile?

The plain idea: if every mind fears every other, they all hide or strike first. That is the “dark forest”. Holos looks at it as game theory with real physics, not as a given.

- **[Brin 1983, “The Great Silence”](https://ui.adsabs.harvard.edu/abs/1983QJRAS..24..283B/abstract)** · Published, QJRAS.
  - Surveys answers to the Fermi paradox, including “deadly probes” that silence others. Notes a catch: a galaxy of killers leaves almost no one to be found.
- **[Dam 2026, “First Attack, Final Offensive: The Dark Forest on an Open Roster”](https://arxiv.org/abs/2609.12003)** · Preprint.
  - When no one knows how many others are watching, striking first is rational only if the attacker accepts it may be its last act. Hiding is the stable outcome when strikes are easier to see than hiders are to find.
  - Holos’s own check, October 28: in our physics a strike can’t be seen from afar. A drive of tens of terawatts is about magnitude 40 at 10 light-years. So Dam’s key condition fails, and striking is less deterred than his model finds.
- **[Tan 2025, “Beyond the Dark Forest”](https://philarchive.org/archive/TANBTD-2)** · Essay.
  - Argues the dark forest assumes cheap interstellar war, fixed equilibria and technology that stands still.
- **[Iain M. Banks, the Culture](https://en.wikipedia.org/wiki/Culture_series)** · Fiction, the game’s stated inspiration. It never overrides hard science.

**What Holos takes:** we have no evidence on what minds want, so the model is narrow. An inward mind stays silent unless we spread, since a young mind that spreads is its one real danger. If we do, it climbs a ladder, cheapest first: warn by a light-speed message, then stop our seeds, then strike Earth. Only seeds that build count, not probes that only look. Every rung is something Earth could build too.

- The earlier design, with neighbors split into watchers, contacters, inward minds and hunters, drew on Brin, Dam, Tan and Banks. It was retired on October 29, 2026, along with neighbors in our century.

### 9. What will we see next?

The plain idea: our ability to look is about to jump. Holos starts on Year 0, with Earth’s real instruments and those due to be built.

- **[Vera C. Rubin Observatory](https://rubinobservatory.org/)** · Maps the whole southern sky every few nights to about magnitude 24.5.
  - Informs: the deep, stacked search for a watcher at the Earth–Moon L4 and L5 points.
- **[ESO’s Extremely Large Telescope](https://www.eso.org/public/announcements/ann25001/)** · First light planned for March 2029.
- **[Square Kilometre Array](https://www.skao.int/)** · Science verification from 2029 for SKA-Low and 2031 for SKA-Mid.
  - Informs: how far Earth’s radars could be heard, and real build times for large radio arrays.
- **[PRIMA](https://www.nasa.gov/news-release/nasa-selects-far-infrared-telescope-as-first-in-new-mission-class/)** · NASA’s far-infrared probe, selected September 2026, launch aimed at 2033.
  - Informs: Earth’s first far-infrared telescope since Herschel. It stops at 261 µm, short of where the coldest glow is brightest.
- **[Habitable Worlds Observatory](https://science.nasa.gov/astrophysics/programs/habitable-worlds-observatory/)** · Aims to image about 25 potentially habitable worlds, early 2040s at the soonest. Its 2027 budget request was cut to $5 million, not yet final.
- **[Smart et al. 2021, the Gaia Catalogue of Nearby Stars](https://arxiv.org/abs/2012.02061)** · Published, A&A.
  - About 331,000 objects within 100 parsecs.
  - Informs: the game’s star map is real to 326 light-years. Beyond that, stars are drawn from the Galaxy’s measured shape.

## Common objections, and where Holos stands

Positions people raised when we asked what a physics-compliant Fermi game should do. Each gets the model’s answer and the evidence it rests on.

### “There’s no alien tech anywhere. At most, microbes.”

- Holos agrees minds are rare and leans toward common life. It parts ways on where the rarity sits.
- The microbes-only view puts the hard step early, at complex cells or animals. Snyder-Beattie et al. 2021 and Watson 2025 support that.
- Holos follows Mills et al. 2025 for the rungs to animals. Each waited for oxygen, and Earth got there on time. The rare step is the last one, from animals to a mind that builds.
- In practice the two views look alike near us. Within 50 light-years, Holos gives a mind only a 0.15% chance. Of about 24 living worlds within 50 light-years, about 14 hold animals and forests. Life died on about 24 more.

### “We’re probably alone. The rare explanations are plausible. A mind that existed would have expanded, and they’re not here.”

- Being alone in our Galaxy is inside the honest range. Sandberg, Drexler and Ord 2018 find a substantial chance of no one else in the observable universe.
- At the low end, 1 mind per 10 billion stars, our Galaxy holds about 20. Holos takes the middle, about 200,000, under criterion 4.
- “They would have expanded” is Hart 1975’s argument, and Holos takes it seriously. It is why minds that spread far are capped at about 200 light-years, and most stay home.
- Holos’s explanation for not expanding is physical, not a matter of taste. Computing costs less the colder it runs (Landauer, Sandberg et al. 2016). A mind that mostly thinks gains little from spreading and a lot from going cold.
- Its known weakness: it needs nearly every mind to choose alike. The answer is that the incentive is the same for all. A mind that broke the pattern would show in Hephaistos or the Ĝ search, and none has.
- “Aliens descended from Earth” are in the model already. Light delay makes a far colony a separate mind, a rival. That is one reason most young minds stay close.

### “Infrared surveys only rule out the very largest civilizations. Smaller ones could still be out there.”

- Largely right, and it is central to the model.
- **[Griffith et al. 2015, the Ĝ search, part III](https://arxiv.org/abs/1504.03418)** · Published, ApJS. Across about 100,000 galaxies in WISE, none holds a civilization turning more than 85% of its starlight into mid-infrared heat. That rules out galaxy-scale civilizations, not star-scale ones.
- Hephaistos II screened about five million stars for star-scale works. A few candidates turned up, and none is confirmed.
- So a warm, growing civilization around a nearby star would likely show. A cold one would not. Garrett 2026 puts its glow at 5 to 28 K, in far-infrared and submillimetre bands we have barely searched.
- Holos’s awake old minds are exactly that case. The sky may not be empty, only faint in bands we haven’t looked at.

### “We haven’t looked enough. We may find plenty of aliens in the next 100 years.”

- The first half matches the evidence. Wright et al. 2018 put radio’s search so far at a hot tub against Earth’s oceans.
- The second half depends on density. At 1 mind per million stars, the nearest is typically about 400 light-years away.
- New instruments improve the odds for life first. The Habitable Worlds Observatory aims to read the air of about 25 nearby worlds.
- Minds come slower. In Holos a deep search of the Earth–Moon L4 and L5 points could find a watcher within years. A star-by-star far-infrared survey takes about 220 Years to reach 400 light-years. A young mind’s warm flash reaches us typically near Year 29,000.
- If the density were near the high end, 1 per 1,000 stars, this view would be right. That is one of the things that would change the model, below.

### “Make it a dark forest. Space gets dangerous as we explore, and probes past some radius or tech level get destroyed.”

- Holos’s danger is close to this. The trigger is spreading, not existing or exploring.
- A probe that only looks is safe. A seed that builds is the risk, since growth without limit is the one thing an inward mind has reason to fear.
- The response is a ladder: a warning by light-speed message, then our seeds stopped, then Earth struck. Earth is not struck at the first step, only when our colonies launch seeds of their own.
- Holos doesn’t adopt the full dark forest. In Dam 2026’s game theory, hiding is stable, and striking first is rational only for an attacker that accepts its strike may be its last. Tan 2025 argues the theory assumes cheap war and frozen technology. Brin 1983 notes a galaxy of killers leaves no one to find.
- **[Alastair Reynolds, Revelation Space](https://en.wikipedia.org/wiki/Revelation_Space_series)** · Fiction. Its Inhibitors, machines that suppress spreading life, are close to Holos’s ladder.

### “Expansion isn’t worth the risk, or a galactic warden tells you to stop. Fight a billion-year-old mind and you lose.”

- This is near the Holos model.
- The watcher is the warden. It has been here for millions of years, and when our first seed launches, it warns us.
- Its maker is old, likely by around a billion years. By parity we can build whatever it can, at the same price and pace. Parity gives us the same choices, not the same head start.
- Stopping expansion doesn’t stop discovery. Probes that only look, telescopes and messages never trigger the ladder.
- The other branch, a nearly empty universe, sits inside the model’s range. See the density above.

### “Civilizations probably collapse before the singularity.”

- Possibly the likelier outcome in reality. Holos starts after that step, on the day humanity crosses the singularity, so it doesn’t model it.
- **[Frank et al. 2018, the Anthropocene generalized](https://doi.org/10.1089/ast.2017.1671)** · Published, Astrobiology. Models of a civilization coupled to its planet show a soft landing, a boom and die-off, or collapse.
- Minds that died and left ruins are set aside for now, below.

### “Rare Earth is the only explanation that makes sense.” Or: “Rare Earth is wrong.”

- **[Ward and Brownlee 2000, Rare Earth](https://openlibrary.org/isbn/9780387987019)** · Book. Argues complex life needs many unlikely conditions, so it is uncommon, though microbes may be common.
- Holos doesn’t adopt Rare Earth for life. Kipping 2025 favors a fast start 13 to 1 where conditions are Earth-like, and Mills et al. 2025 find each step on time.
- Holos keeps Rare Earth’s conclusion in a narrower form. Minds are rare, but the rarity sits in the last step, not in the planet.
- Kipping’s own caution cuts toward Rare Earth: Earth-like conditions may themselves be rare. If so, the density moves toward the low end.

### “The game will reflect whatever the designers believe. Better to draw a different answer each playthrough.”

- This is the risk the criteria guard against. The premise follows the best current estimate, not a belief, and every rejected option is shown.
- Holos tried the opposite first. Neighbors in our century were chosen for play, and they were removed when the evidence didn’t support them.
- Drawing a different answer each game was considered and set aside. Picking from the whole range claims no best guess, and a player would meet unlikely worlds as often as likely ones.
- What varies per game is the detail inside the answer: which stars host minds, how far, how old, asleep or awake.

### “Leave it a mystery.”

- From the player’s side it is one. We start on Year 0 knowing what Earth knows in 2040: a quiet sky and no answer.
- Earth’s Mind starts out giving minds “almost no chance”, the same as the evidence. Finding out is the game.
- Underneath, the model needs an answer to stay consistent. It is the one above: rare, inward, watching.
- A test universe or simulation is set aside, since it can’t be tested. Earth’s Mind may still raise it as an open idea.

### “Turn Mercury into a solar-powered laser, then send telescopes to use the Sun as a lens and see every habitable world near us.”

- Physics allows all of it, so Holos allows all of it.
- Armstrong and Sandberg 2013 treat taking Mercury apart as the first step toward a swarm.
- **[Turyshev et al. 2020, a solar gravitational lens mission](https://arxiv.org/abs/2002.11871)** · Study, NASA NIAC Phase III. Past about 548 AU, the Sun’s gravity focuses one star’s light. A craft there could image an Earth-like world 30 parsecs away at about 25 km per pixel.
- The catch is one craft per target star. Each sits on its own line through the Sun, so seeing every world in a region takes a fleet, one craft for each star.
- A second catch: a Mercury-sized power plant glows. Its waste heat is exactly what the Ĝ and Hephaistos searches look for, so building it makes us visible.
- Building at home is not spreading, so it doesn’t trigger a warning. Seeds that build elsewhere do.

### “What’s the goal? Why play?”

- A design question, not a modeling one. It belongs in [HOLOS_GAME_CONCEPT.md](HOLOS_GAME_CONCEPT.md).
- The short version: the challenge is deciding how to explore, grow and protect Earth when distance makes knowledge uncertain and every choice takes years to play out.

### “Crossed the singularity?”

- In Holos, Year 0 is the day humanity crosses the singularity. People and machines wake as one Mind. It is not machines waking alone.

## What would change the model

Each of these would move a number, and the doc and game would follow.

- **A confirmed technosignature,** anywhere. Minds would be commoner than 1 per million stars, or louder than inward.
- **Oxygen or other life signs on several nearby worlds.** Supports common life. A clean null would push life rarer.
- **A deep far-infrared or submillimetre null.** Fewer awake cold minds, or dimmer ones.
- **Confirmed Dyson-sphere candidates.** Minds that grow and stay outward longer than modeled.
- **A deep search of Earth’s co-orbitals and Lagrange points that finds nothing.** Lowers the watcher’s odds.
- **Settling the hard-steps debate.** The single biggest lever. It moves the density by up to a billion times.

## Set aside, and why

- **Neighbors waking in our century, within 50 light-years.** Chosen for play, not evidence.
- **Drawing the density per game across the whole range.** Claims no best guess.
- **A watcher in some games only.** All or none, by likelihood.
- **Minds that died and left ruins.** Not yet modeled.
- **A simulation or test universe.** Can’t be tested. The game’s Mind may still raise it as an open idea.
- **Any craft we send counting as spreading.** Only seeds that build can grow, and growth is the danger.

## Source notes

- Most entries above were read at the abstract or in full, as logged in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md).
- Cited from memory there and not yet read at source: Behroozi and Peeples 2015, Lineweaver and Davis 2002, Spiegel and Turner 2012, Nicholson and Forgan 2013, Sagan and Newman 1983, Benford 2019, Omohundro 2008, Chopra and Lineweaver 2016. Their links were checked on October 30, 2026, except Sagan and Newman’s bibcode and Omohundro’s PDF.
- Added October 30, 2026, links checked: Griffith et al. 2015, Ward and Brownlee 2000, Licquia and Newman 2015, Bryson et al. 2021, Zahnle and Catling 2017, Greene et al. 2023 and Kreidberg et al. 2019. Chopra and Lineweaver 2016 by search, its DOI behind a paywall. Turyshev et al. 2020 and Frank et al. 2018 were already logged.
- Shares like “3 in 4” and “2 in 3” are this project’s estimates, built on the sources, not quoted from them.
