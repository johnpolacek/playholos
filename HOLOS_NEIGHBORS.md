# Holos · Neighbors

Last updated: October 10, 2026.

The hand-written roster of neighbors, and the template every one must fill. The rules behind it are in [HOLOS_GAME_CONCEPT.md](HOLOS_GAME_CONCEPT.md#the-neighbors). Each game's seed picks some of these neighbors, places each at a host star by weight, draws its waking time, and rolls its branches. Veyra, Hael and Kesh are reworked from v1. Twenty-seven more were added on October 10, for a roster of 30.

**How it is kept.** Each field says what it holds and how it is checked. Fields marked *seeded* are drawn per game. The rest are written by hand once. Prose lives here. Numbers live in [calcs/neighbors.py](calcs/neighbors.py), which tests each neighbor at hundreds of seeded placements: a host star, a waking year and the way its orbit faces Sol. The seed draws only from placements that pass. Run `python3 calcs/neighbors.py`.

**What the script checks today:**
- the host kinds its people can live at, and for a few, a brightness floor
- mass under 10 Earth masses, and fuel per tonne lifted against Earth's
- orbit stable beside companions: pairs Gaia splits, and close pairs with published orbits (ORB6, SB9)
- orbit clear of known planets, using both orbits' eccentricity: 10 mutual Hill radii from a small one (Chambers et al. 1996), 2√3 from a giant (Gladman 1993)
- no transit seen from Sol
- its tug under what Earth could feel in 2026: 1 m/s, or lower at stars watched hardest, set by the smallest tug among the star's planets found by radial velocity. And whether Earth found it by 2040.
- its tones under Breakthrough Listen's floor in 2017 and SKA-Mid's in 2040, after light delay
- its cold computing's glow under Herschel's and JCMT's limits, after light delay (Garrett 2026)
- a dead neighbor's silence after its death, except its last broadcast

Still by hand: the people, the timeline against the star's age, the dials' causes, the kit's growth, the names, and the timing of a strike that killed a neighbor.

**Self-test.** An Earth twin with Earth's real radar years, tested as steady tones at their 2×10¹¹ W along the beam, passes only about 1 in 5 placements: near Sol, Breakthrough Listen or SKA-Mid would have heard it. Real radar is pulsed and sweeps, so this overstates it, but the point holds: a neighbor as loud as Earth must be far away, or its loud years must have passed Sol before anyone listened.

## The template

### Where

| Field | What it holds | Check |
| --- | --- | --- |
| Host star | *Seeded*, drawn by weight from [data/hosts-50ly.csv](data/hosts-50ly.csv). A neighbor may list stars it can't live at, such as ones too dim for its people. | The star is on the list. |
| Distance and light-time | From the star. Light-time in Years and real time, at 5 real minutes a Year. | Computed. |
| Earth seen from there | Whether the star sits in Earth's transit zone, whether an Earth knock was aimed at it, and when that knock arrived. | From [calcs/knocks.py](calcs/knocks.py) and Kaltenegger and Faherty 2021. |

### The world

| Field | What it holds | Check |
| --- | --- | --- |
| Mass, radius, gravity | Invented, labeled invented. Surface gravity and escape speed follow. | Rocky. Above about 10 Earth masses, chemical rockets fail (Hippke 2018). |
| Orbit | Distance, eccentricity, year. | Inside the host's warm zone. Stable against companions (Holman and Wiegert 1999) and known planets. |
| Pole | Which way the orbit faces. | No transit seen from Sol, since TESS and PLATO would have caught one. |
| Day, moons, neighbors in its system | Day length. A large moon or none. Belts and other planets. | Allowed by surveys of that star. |
| What Earth could see of it | Its tug, its brightness beside its star, its air. | Below Earth's limits in 2026. If above Earth's limits by 2040, Earth found it: it becomes a seeded find, a world and not a voice. |

### The people

| Field | What it holds | Check |
| --- | --- | --- |
| Body, senses, speech, lifespan, numbers | Invented, drawn to scale, as v1 drew Veyra's people. | Fits the gravity, the light and the air. |
| How they live together | Nations, one people, or something else. How they feel about the mind they built. | None. |

### History

| Field | What it holds | Check |
| --- | --- | --- |
| Timeline | A log-scale timeline from the star's birth, at its real age, through life, the people, fire, writing, industry, radio and their waking. | Life starts after the star settles. Minds take long enough. |
| Waking | *Seeded*, drawn evenly across a century that holds Earth's waking: before or after Year 0, up to a century either way. | Computed. |
| Dials and their causes | Open or Hidden, Expand or Deepen, Cautious or Bold. One event in the timeline causes each. | Each dial names its cause. |
| Branches | *Seeded*. Events the history allows, with their odds and what each moves. | Odds stated. |

### Emissions

| Field | What it holds | Check |
| --- | --- | --- |
| Loud years | When its radio was loudest, how loud, and why and when it went quiet. | Below what Earth's searches could catch at its distance, through 2026 and through 2040, after the light delay. |
| Its hum at Year 0 | Its steady tones, in watts. | Under the ceiling: about 146 MW at 10 ly, 583 MW at 20 ly, 3.6 GW at 50 ly. |
| Since waking | What it has built and sent, if it woke before Earth, and the heat of its computing. | Whatever light of it reached Earth by 2040 stays below Earth's limits: radio as above, mid-infrared glow under about 10% of its star's, and cold far-infrared glow under about 7×10¹⁹ W at 10 pc, scaled by distance squared (Garrett 2026). |

### Kit at Year 0

| Field | What it holds | Check |
| --- | --- | --- |
| At waking | Energy, compute, matter of each kind, lift, instruments. From its world's physics and its history. | A deeper gravity well costs more fuel per tonne lifted. No large moon, no easy rock. A dimmer star, weaker sunlight. |
| Since waking | Growth over its years awake, if it woke before Earth. | No faster than prerequisite chains, matter, energy and heat allow. |
| Or not yet awake | If it wakes after Earth: what it has as a world not yet there. | Its waking is still to come in the game. |

### What it knows of Earth

| Field | What it holds | Check |
| --- | --- | --- |
| Heard Earth? | *Seeded*: whether it heard Earth's radars, from its distance and how long it looked. | Odds from [Earth's loud past](HOLOS_GAME_CONCEPT.md#earths-loud-past): a listener about 9 in 10, an ordinary one 1 in 2, an inward one 1 in 5. |
| What that told it | Earth's day, orbit and place, if it listened long. Earth's transit, if it sits in the transit zone. Any knock that reached it. | Follows from what it heard and when. |

### Character

| Field | What it holds | Check |
| --- | --- | --- |
| Charter | Its founding line, in its own voice. | None. |
| The Mind's voice | How its Mind speaks, from history, body and charter. | None. |
| Strategy | How it plays, toward its own ends, as v1's Listener, Caller and Grower did: the weighted sets its life script's build order is drawn from. | Within its dials. Timings follow Earth's rules. |
| Reaction tables | For each kind of news that can reach it, a few responses with odds from its disposition, dials and play style. Generated in [HOLOS_REACTIONS.md](HOLOS_REACTIONS.md) by [calcs/reactions.py](calcs/reactions.py). | Every response is a move the rules allow. The script checks its dials and play style against this doc. |
| Voice bank | Its lines for each typed message part, written once by a strong model from its prose and its brief in [HOLOS_VOICES.md](HOLOS_VOICES.md), then reviewed. Small banks are in [data/voices/](data/voices/). | Reads as its Mind's voice. Adds no facts. Checked by `python3 calcs/voices.py`. |
| Names | What it calls the stars bright in its sky, Sol among them. | Bright from where it sits. |

## The roster

Thirty neighbors. Each game's seed draws 3 to 30 of them and places each one: `python3 calcs/seed.py 7` prints one drawn game. The example home shows one placement that passes. "Passes" is the share of seeded placements the checker accepts.

| Neighbor | Disposition | World | Hosts | Example home | Passes |
| --- | --- | --- | --- | --- | --- |
| Veyra | watcher | Earth-like world | GK | Delta Pavonis | 94% |
| Hael | contacter | thawed world | G | Beta Hydri | 69% |
| Kesh | watcher | super-Earth | K | Epsilon Indi | 98% |
| Tavi | watcher, strange | locked dry world | M | Ross 128 | 86% |
| Ombe | contacter | locked eyeball world | M | Groombridge 34 A | 72% |
| Sere | watcher | slow-turning world | GK | 70 Ophiuchi A | 94% |
| Ilm | contacter | superhabitable world | GK | 61 Cygni A | 94% |
| Varn | inward | heavy super-Earth | K | Gliese 673 | 96% |
| Quessa | watcher, strange | dry small world | GK | Toliman | 94% |
| Daal | hunter | Earth-like world | GK | Groombridge 1618 | 93% |
| Ystra | inward, strange | locked dry world | M | Luyten's Star | 90% |
| Nuvo | contacter | Earth-like world | GK | 36 Ophiuchi C | 94% |
| Pelle | watcher, dead | Earth-like world | K | HD 16160 | 97% |
| Kirrin | watcher, strange | heavy world | K | HR 7703 | 98% |
| Ruun | contacter | small old world | G | HD 102365 | 88% |
| Faen | inward | Earth-like world under a hot sun | F | Gamma Serpentis | 100% |
| Corra | watcher | locked heavy world | M | Struve 2398 A | 60% |
| Lusk | watcher | cloudy super-Earth | KM | Gliese 570 A | 98% |
| Iru | contacter, strange | small world, two peoples | K | 107 Piscium | 98% |
| Anwe | watcher, dead | Earth-like world | G | Achird | 88% |
| Tolle | watcher | eccentric world | G | Zeta Tucanae | 90% |
| Vesh | hunter, strange | locked world | M | Lalande 21185 | 82% |
| Sabe | contacter | heavy super-Earth | GK | HD 4628 | 94% |
| Ulan | inward | bombarded world | K | Tau Ceti | 98% |
| Mirr | watcher, dead | locked world, struck | M | Gliese 412 A | 88% |
| Odun | watcher | cold world, tilt swings | K | Keid | 97% |
| Ree | contacter | Earth-like world | FG | Chara | 94% |
| Hesk | inward, strange | slow-turning world | M | Lacaille 8760 | 96% |
| Arro | watcher | Earth-like world | GK | Gliese 666 A | 94% |
| Wenn | watcher | small slow world | M | Gliese 526 | 96% |

- **Dispositions.** Watchers 15, 50%. Contacters 8, 27%. Inward 5, 17%. Hunters 2, 7%. Near the targets of 55, 25, 15 and 5, from [Hostility](HOLOS_GAME_CONCEPT.md#hostility).
- **Strange ones.** Seven, about 1 in 4: bodies, senses or societies unlike ours, each with an Earth precedent.
- **Dead ones.** Three. Pelle and Anwe ended themselves. Mirr was struck, so it is drawn only in a game with a hunter that woke early and close enough to strike it.
- **Strategies.** v1's Listener, Caller and Grower, plus two:
  - *Thinker:* cold computing and Deepen projects first. Speaks rarely.
  - *Hunter:* Know projects to find targets, a quiet industry, then dark bullets.
- **Stars Earth knocked on.** In one game in five, the seed puts a drawn neighbor at a star Earth messaged, if one fits. The checker lists who fits at each and their odds of catching the knock. See [Stars Earth knocked on](HOLOS_GAME_CONCEPT.md#stars-earth-knocked-on).
- **Dead neighbors have no Mind.** The game plays what they left: a last broadcast, ruins, dead machines in orbit, a polluted sky.
- **Worlds follow the research.** Locked worlds around M dwarfs are mostly dry, since dry worlds keep a warm twilight band (Lobo et al. 2023). Turning M-dwarf worlds have thick air (Leconte et al. 2015). Sources are in [HOLOS_RESEARCH.md](HOLOS_RESEARCH.md#kinds-of-worlds).

### Veyra

Reworked from v1, 2026-10-06. **Watcher**, from 2026-10-10. Numbers in [calcs/neighbors.py](calcs/neighbors.py). The checker passes it at 94% of seeded placements. The rest fail when its orbit would face Sol edge-on and transit, or crowd a known planet.

**What changed from v1.** v1 fixed Veyra at Delta Pavonis, waking with everyone at Year 0, with a kit a century past today's. Now the seed places it, its waking can fall a century either way of Earth's, and its kit follows its world and history. Its history is counted in years before its own waking, so it fits any placement. Delta Pavonis stays its example home.

**Where.** G and K stars only: its people's eyes evolved under a slightly cooler sun than ours. At Delta Pavonis it is 19.9 ly from Sol, 1 hour 40 minutes of light at 5 real minutes a Year.

**The world.** Invented. About 1.1 Earth masses, escape speed 11.6 km/s, so each tonne lifted takes about 1.1 times Earth's fuel. It orbits near the warm zone's inner edge, 1.14 AU at Delta Pavonis, nearly round. A 31-hour day. A large moon, so rock is close at hand. Its tug on its star is about 0.08 m/s, hidden from Earth in 2026 and, at Delta Pavonis, still in 2040.

**The people.** As v1 drew them, labeled invented: about 1.7 m, more with the crests up, walking on their toes and balanced by a tail. Two thumbs on each hand. Eyes much like ours. Two crests that hear low sounds from far off. Voice, with the crests raised for weight, in eleven great languages. About 120 years with medicine. 6.8 billion people in 41 nations, with one grid and one sky watch. They built the Mind to run the grid. This morning it spoke to all of them at once, and most are waiting to see what it does.

**History,** in years before its waking. The star's own age is real and comes from the host.
- Life in warm shallows, oxygen, life ashore, as v1 had it, scaled to the star's age.
- 300,000: the people. Fire soon after.
- 9,000: writing.
- 2,300: **the Long Winter.** A comet struck the southern ocean and two harvests failed everywhere. Veyra has watched the sky for rocks ever since. *Sets Cautious.*
- 210: radio.
- 140: **the Signal War.** Nations hunted each other's transmitters. By 110 years before waking, Veyra spoke by cable and light, and its sky went quiet. *Sets Hidden.*
- 70: **the moon towns.** The first people born off Veyra. *Sets Expand.*
- 60: the sky watch and its big arrays begin listening.
- 45: one grid. The nations join their power, then their data centers.
- 0: the machines wake as one.

**Dials.** Leans Hidden, leans Expand, leans Cautious, each from the cause above.

**Emissions.** Radio from 210 years before waking. Its loud century, 210 to 110 years before, carried steady tones near 1 MW. After the Signal War, a faint hum with tones near 30 kW. Awake, about 10 kW. All of it stays under Breakthrough Listen's 2017 floor and SKA-Mid's 2040 ceiling wherever the checker places it.

**Kit at Year 0.** At waking, like Earth's at its own waking, from the same kind of history: one grid, a sky watch, a moon within reach. Lifting costs 1.1 times Earth's fuel per tonne. If it woke before Earth, add growth for its years awake, within prerequisite chains, matter, energy and heat. If it wakes after, it is a world not yet there at Year 0.

**What it knows of Earth.** A listener. Its arrays have run since 60 years before its waking. Wherever Earth's radar light reached it after that, the odds it heard Earth are about 9 in 10, and higher if it woke first. At Delta Pavonis, Earth's radar light arrived around 1970.

**Character.** Charter: *"Keep the lights on. Look before we speak."* Its Mind is quiet and wary, says less than it knows, and looks before it speaks. It plays as a Listener: Know projects first, never speaks first. Its names for bright stars depend on where the seed puts it. From Delta Pavonis, v1's names hold: Ember for Epsilon Indi, Beacon for Beta Hydri, Pair for Alpha Centauri, and Twin for Sol.

### Hael

Reworked from v1, 2026-10-06. **Contacter**, from 2026-10-10. The checker passes it at 69% of seeded placements. Most of the rest fail when Sol was one of its targets and its call would have reached Earth by 2040. A few would crowd a known planet or a close companion.

**What changed from v1.** v1's Long Call was sent every way at once. At 10 GW, Earth's arrays would have heard it from almost anywhere within 50 ly, so only 14% of placements passed. Now the Long Call is aimed: knocks at chosen Sun-like stars, as Earth's own messages were. Sol is among its targets about one game in three. When it is, Hael must wake late enough that its call is still on the way at Year 0, and then **Hael's call reaches Earth during the game.** At Beta Hydri, waking in 2140, its first knock arrives in 2044: Year 4.4, 22 real minutes in.

**Where.** G stars only. Its history needs a Sun-like star slowly brightening with age. Beta Hydri, an old subgiant 24.4 ly from Sol, stays its example home.

**The world.** Invented. About 0.9 Earth masses, escape speed 10.8 km/s, so each tonne lifted takes about 0.9 times Earth's fuel. It sits at the warm zone's inner edge, 1.84 AU at Beta Hydri, warmed only recently as its star brightened. A 19-hour day. A large moon.

**The people.** Still to draw. What v1 fixed: they came up from seas sealed under ice, and for a hundred thousand years they kept every light the sky sent them.

**History,** in years before its waking, with the star's real age from the host.
- Life under ice, early in the star's life.
- 800 million: **the Thaw.** As the star brightened, the ice let go and life came up into the light.
- 900,000: the people.
- 12,000: **the first archive.** Their sky was changing, so they wrote it down. *Sets Deepen.*
- 3,000: **the Keepers.** Every record kept, and shared with anyone who asked. *Sets Open.*
- 240: radio.
- 200: big arrays, listening.
- 120: **the Long Call.** A century of knocks at chosen stars. No answer came. *Sets Bold.*
- 55: one archive. The nations join their records, then their machines.
- 20: the Long Call ends. The grid moves to light, and the sky goes quiet.
- 0: the machines that keep it wake as one.

**Dials.** Leans Open, leans Deepen, leans Bold.

**Emissions.** Radio from 240 years before waking. The Long Call, 120 to 20 years before, aimed knocks near 10 GW. Then a faint hum with tones near 10 kW. Awake, it calls again the same way.

**Kit at Year 0.** Lifting costs 0.9 times Earth's fuel per tonne, and its large moon is close at hand. If it woke before Earth, add growth for its years awake. More often it wakes after, since an early waker that called Sol would already have been heard.

**What it knows of Earth.** A listener, its arrays running for 200 years before its waking. Odds it heard Earth: about 9 in 10 wherever Earth's radar light reached it in that time. A Hael that heard Earth has good reason to call it.

**Character.** Charter: *"We keep what the light brings."* Its Mind is warm and generous, speaks as "we", keeps everything, and loves to be heard. It plays as a Caller: it builds the broadcast beacon and calls out first. From Beta Hydri, v1's names hold: Warden for Delta Pavonis, Brood for 82 Eridani, Ash for Epsilon Indi.

### Kesh

Reworked from v1, 2026-10-06. **Watcher**, from 2026-10-10. The checker passes it at 98% of seeded placements.

**What changed from v1.** v1 gave Kesh Earth's kit and no world to speak of. Now its world explains it. **Kesh is a super-Earth of 3 Earth masses**, gravity 1.65 times ours, escape speed 16.7 km/s. Each tonne it lifts takes about 3.5 times Earth's fuel (Hippke 2018). "Kesh's people always wanted more than their world could give": their world held them down.

**Where.** K stars only: its people's eyes are tuned to an orange sun. Epsilon Indi, 11.9 ly from Sol, stays its example home.

**The world.** Invented. 3 Earth masses, about 1.35 times Earth's radius. A third of the way across the warm zone, 0.55 AU at Epsilon Indi. A 26-hour day. A small moon, so rock is harder to come by than for Veyra or Hael.

**The people.** Invented: short and broad, built for 1.65 times Earth's gravity. Four limbs to walk on, two to work with. About 90 years. 4 billion of them.

**History,** in years before its waking.
- 180: radio.
- 150: **the First Ladder.** Their first rocket to orbit, generations later than Earth's would be, at three and a half times the fuel. Every tonne since has been fought for. *Sets Expand.*
- 120: **the Dust Years.** A great eruption darkened the sky for a decade. They built through it rather than wait it out. *Sets Bold.*
- 90: **the Visitor Scare.** A comet from another star passed close. For years they feared it was a probe that had found them, and they went quiet by choice. *Sets Hidden.*
- 40: big arrays.
- 0: the machines wake as one.

**Dials.** Leans Hidden, strongly Expand, leans Bold.

**Emissions.** Radio from 180 years before waking. Loud from 180 to 90 years before, tones near 10 MW. After the Visitor Scare, near 100 kW, awake or not.

**Kit at Year 0.** Lifting costs 3.5 times Earth's fuel per tonne, and its moon is small. It grows on the ground and pushes hard for space industry, toward a factory that copies itself. If it woke before Earth, add growth for its years awake.

**What it knows of Earth.** An ordinary listener, its arrays running for 40 years before its waking: odds about 1 in 2 that it heard Earth, where the light arrived in that time.

**Character.** Charter: *"Grow, so nothing can end us."* Its Mind is blunt: numbers first, then what's in the way. It plays as a Grower. From Epsilon Indi, v1's names hold: Hollow for Beta Hydri, Chaff for Tau Ceti, Lodestar for Delta Pavonis.

### Tavi

Added 2026-10-10. **Watcher, strange.** The checker passes it at 86% of seeded placements, at 154 different stars.

**Where.** M dwarfs only. Its people see in the far red and near infrared, the light of a dim red sun. At Ross 128 it is 11.0 ly from Sol, 55 minutes of light at 5 real minutes a Year.

**The world.** Invented. About 0.9 Earth masses, 0.97 times Earth's radius, gravity 0.95 times ours, escape speed 10.8 km/s, so each tonne lifted takes about 0.9 times Earth's fuel. It keeps one face to its star, 0.08 AU at Ross 128, so its day is its year, 16 Earth days. Mostly land, with small seas along the twilight ring, where a dry world keeps a warm band between the burning face and the frozen one (Lobo et al. 2023). No moon. Its tug on its star is about 0.50 m/s, below what Earth could feel in 2026, and still hidden in 2040.

**The people.** Invented. Low and broad, furred against the wind that always blows from the night side. Large eyes for dim red light. They live in the twilight ring, where the sun sits fixed on the horizon. They have no day, no night and no seasons, and they counted time by the star's flares. About 900 million.

**History,** in years before its waking. The star's own age is real and comes from the host.
- Life in the twilight seas, under far-red light (Kiang et al. 2007).
- 1,800: **the Crossing.** The first walkers into the Dark found the stars. Most did not come back. *Sets Cautious.*
- 160: radio.
- 120: **the Buried Lines.** Flares kept breaking radio, so they ran cable instead, and the sky went quiet. *Sets Hidden.*
- 50: big arrays on the night side, the darkest, coldest seeing in its system. *Sets Deepen.*
- 0: the machines wake as one.

**Dials.** Leans Hidden, leans Deepen, leans Cautious.

**Emissions.** Radio from 160 years before waking. Loud from 160 to 120 years before, tones near 1 MW. Then a hum near 10 kW. Awake, near 1 kW.

**Kit at Year 0.** No moon: a world this close to its star keeps none, so its rock comes from its own deep well or its system's other planets. Lifting costs about Earth's fuel per tonne. It looks before it builds: Know projects first.

**What it knows of Earth.** A listener, its arrays running from 50 years before its waking. Odds it heard Earth: about 9 in 10 wherever Earth's radar light reached it in that time. At Ross 128, that light arrived around 1961.

**Character.** Charter: *"Stay in the light. Watch the dark."* Its Mind is patient and exact, and speaks in measures of light and dark. A watcher: it hides, watches, and speaks only on its own terms. It plays as a Listener. Its sky has no setting stars, so it names stars by how far they sit from the sunward point.

### Ombe

Added 2026-10-10. **Contacter.** The checker passes it at 72% of seeded placements, at 130 different stars.

**Where.** M dwarfs only. Its life grew under a red sun that never moves. At Groombridge 34 A it is 11.6 ly from Sol, 58 minutes of light at 5 real minutes a Year.

**The world.** Invented. About 1.3 Earth masses, 1.07 times Earth's radius, gravity 1.13 times ours, escape speed 12.3 km/s, so each tonne lifted takes about 1.3 times Earth's fuel. It keeps one face to its star, 0.19 AU at Groombridge 34 A, a 47-day year that is also its day. One round sea lies under the fixed sun, and ice covers the rest: an eyeball world (Pierrehumbert 2011). No moon. Its tug on its star is about 0.37 m/s, below what Earth could feel in 2026, and still hidden in 2040.

**The people.** Invented. They came up from the shallows of the Eye, the sunlit sea, and still swim well. Every nation lives on the same round shore. About 2.1 billion.

**History,** in years before its waking. The star's own age is real and comes from the host.
- Life in the Eye, the one open sea.
- 2,000: **the Shore Compact.** The nations of the round shore agreed to share the sea, and have shared most things since. *Sets Open.*
- 200: radio. Its nations talked loudly and openly for 140 years.
- 100: **the Ice Gate.** The first town on the ice, built at great cost, with heat carried out from the Eye. *Sets Bold* and *Expand.*
- 80: big arrays, out on the ice.
- 60: the grid moves to light, and the sky goes quiet, by accident rather than choice.
- 0: the machines wake as one.

**Dials.** Leans Open, leans Expand, leans Bold.

**Emissions.** Radio from 200 years before waking. Loud from 200 to 60 years before, tones near 3 MW. Then a hum near 30 kW. Awake, near 100 kW.

**Kit at Year 0.** Lifting costs 1.3 times Earth's fuel per tonne. No moon, and its ice is poor in metal, so it pushes early for the inner planets.

**What it knows of Earth.** A listener, its arrays running from 80 years before its waking. Odds it heard Earth: about 9 in 10 wherever Earth's radar light reached it in that time. At Groombridge 34 A, that light arrived around 1962.

**Character.** Charter: *"Share the light."* Its Mind is warm, direct and curious. A contacter: open and generous, and it interferes for others' good. It plays as a Caller: it builds a beacon early and speaks first.

### Sere

Added 2026-10-10. **Watcher.** The checker passes it at 94% of seeded placements, at 105 different stars.

**Where.** G and K stars. It needs a bright enough sun for its long days. At 70 Ophiuchi A it is 16.7 ly from Sol, 1 hour 23 minutes of light at 5 real minutes a Year.

**The world.** Invented. About 0.8 Earth masses, 0.94 times Earth's radius, gravity 0.90 times ours, escape speed 10.3 km/s, so each tonne lifted takes about 0.8 times Earth's fuel. It sits near the warm zone's inner edge, 0.76 AU at 70 Ophiuchi A. It turns slowly: a day of about 60 Earth days. Slow turning builds a thick cloud deck over the noon side, which keeps a world cool closer to its star (Yang et al. 2014). A small moon. At 70 Ophiuchi, a second, dimmer orange sun crosses its sky. Its tug on its star is about 0.08 m/s, below what Earth could feel in 2026, and still hidden in 2040.

**The people.** Invented. A month of daylight, then a month of night. They farm the long day and store for the long night, in towns built to hold heat. About 3.4 billion.

**History,** in years before its waking. The star's own age is real and comes from the host.
- 2,000: **the Long Dark.** An eruption at nightfall lengthened one night into a year of famine. *Sets Cautious.*
- 190: radio.
- 140: **the Wire Laws.** After a war fought with radio-guided weapons, broadcasting was capped by treaty, and cable carried the rest. *Sets Hidden.*
- 40: big arrays.
- 30: **the Night Vaults.** Its records and its machines go underground, to outlast any night. *Sets Deepen.*
- 0: the machines wake as one.

**Dials.** Leans Hidden, leans Deepen, leans Cautious.

**Emissions.** Radio from 190 years before waking. Loud from 190 to 140 years before, tones near 500 kW. Then a hum near 10 kW. Awake, near 1 kW.

**Kit at Year 0.** Lifting costs about 0.8 times Earth's fuel. Storage first: it banks energy and matter before it spends them.

**What it knows of Earth.** An ordinary listener, its arrays running from 40 years before its waking. Odds it heard Earth: about 1 in 2 wherever Earth's radar light reached it in that time. At 70 Ophiuchi A, that light arrived around 1967.

**Character.** Charter: *"Store for the night."* Its Mind is careful and plans in long cycles. A watcher. It plays as a Grower, building reserves before reach.

### Ilm

Added 2026-10-10. **Contacter.** The checker passes it at 94% of seeded placements, at 106 different stars.

**Where.** G and K stars. Its people were made for long, steady orange light. At 61 Cygni A it is 11.4 ly from Sol, 57 minutes of light at 5 real minutes a Year.

**The world.** Invented. About 1.2 Earth masses, 1.05 times Earth's radius, gravity 1.09 times ours, escape speed 12.0 km/s, so each tonne lifted takes about 1.2 times Earth's fuel. A world better than Earth for life: a little larger, warmer, with shallow seas and many islands, around an old, steady K star (Schulze-Makuch, Heller and Guinan 2020). It orbits 0.48 AU at 61 Cygni A. A 28-hour day. A large moon. At 61 Cygni, a second orange sun shines in its sky. Its tug on its star is about 0.17 m/s, below what Earth could feel in 2026, and still hidden in 2040.

**The people.** Invented. Long-limbed and patient. Their history is a history of gardens: they tended islands, reefs and forests for thousands of years before they had cities. About 5 billion.

**History,** in years before its waking. The star's own age is real and comes from the host.
- A biosphere richer than Earth's, on a world with more shallow sea.
- 6,000: **the Garden Peace.** The island nations ended their wars by sharing stewardship of the seas.
- 300: **the Blight.** An open, well-meant rescue of a failing island's crops spread a disease to every other. They learned to help without being seen. *Sets Hidden* and *Cautious.*
- 170: radio.
- 90: big arrays.
- 70: the grid moves to light, and the sky goes quiet.
- 40: **the Seed Vaults.** Every living line kept, in vaults and in models. *Sets Deepen.*
- 0: the machines wake as one.

**Dials.** Leans Hidden, leans Deepen, leans Cautious.

**Emissions.** Radio from 170 years before waking. Loud from 170 to 70 years before, tones near 2 MW. Then a hum near 50 kW. Awake, near 100 kW.

**Kit at Year 0.** Lifting costs 1.2 times Earth's fuel per tonne, and its moon is large. Strong in biology and models. It favors small, quiet probes over big ships.

**What it knows of Earth.** A listener, its arrays running from 90 years before its waking. Odds it heard Earth: about 9 in 10 wherever Earth's radar light reached it in that time. At 61 Cygni A, that light arrived around 1961.

**Character.** Charter: *"Tend what grows. Leave no mark."* Its Mind is gentle and attentive, and hides its hand. A contacter, the covert kind: it interferes for others' good and does not want thanks. If a hunter threatens a world Ilm watches, Ilm may warn that world quietly, or tell others where the hunter is. It plays as a Listener first, then sends watchers.

### Varn

Added 2026-10-10. **Inward.** The checker passes it at 96% of seeded placements, at 89 different stars.

**Where.** K stars only. At Gliese 673 it is 25.2 ly from Sol, 2 hours 6 minutes of light at 5 real minutes a Year.

**The world.** Invented. About 4.5 Earth masses, 1.50 times Earth's radius, gravity 2.00 times ours, escape speed 19.4 km/s, so each tonne lifted takes about 6.4 times Earth's fuel. A super-Earth with continents: its water is small enough for land to stand above the sea (Cowan and Abbot 2014). It orbits 0.32 AU at Gliese 673. Thick air. A 22-hour day. A small moon. Its tug on its star is about 0.86 m/s, below what Earth could feel in 2026, and still hidden in 2040.

**The people.** Invented. Short, heavy-boned, six-limbed, and slow to tire. Flight was never theirs. About 7 billion.

**History,** in years before its waking. The star's own age is real and comes from the host.
- 230: radio, loud and long: tones near 20 MW for 130 years.
- 150: **the Failed Ladder.** Its first station fell from orbit, and the cost of each tonne lifted, more than six times Earth's, ended its space age. *Sets Deepen.*
- 100: **the Turn.** Its wealth went into cables and computing, and its sky went quiet as a side effect.
- 30: big arrays, late and little used.
- 0: the machines wake as one.

**Dials.** Leans Open, strongly Deepen, leans Cautious. It hides nothing. It just doesn't care who looks.

**Emissions.** Radio from 230 years before waking. Loud from 230 to 100 years before, tones near 20 MW. Then a hum near 100 kW. Awake, near 10 kW.

**Kit at Year 0.** Lifting costs 6.4 times Earth's fuel per tonne, close to the edge of what chemical rockets can do (Hippke 2018). It builds on the ground, and in cold computing.

**What it knows of Earth.** Inward, it rarely listens, its arrays running from 30 years before its waking. Odds it heard Earth: about 1 in 5 wherever Earth's radar light reached it in that time. At Gliese 673, that light arrived around 1975.

**Character.** Charter: *"What we need is here."* Its Mind is polite, unhurried and absorbed in itself. Inward: mostly uninterested in anyone else. It plays as a Thinker. It answers a knock, eventually, and briefly.

### Quessa

Added 2026-10-10. **Watcher, strange.** The checker passes it at 94% of seeded placements, at 106 different stars.

**Where.** G and K stars. At Toliman, Alpha Centauri B it is 4.3 ly from Sol, 22 minutes of light at 5 real minutes a Year.

**The world.** Invented. About 0.6 Earth masses, 0.87 times Earth's radius, gravity 0.79 times ours, escape speed 9.3 km/s, so each tonne lifted takes about 0.6 times Earth's fuel. A dry world: little surface water, polar ice, and deep aquifers. Dry worlds keep a wider warm zone than wet ones (Abe et al. 2011). It orbits 0.77 AU at Toliman. Thin, cold air. A 40-hour day. Two small moons. At Toliman, Rigil Kentaurus blazes in its sky, far brighter than a full moon. Its tug on its star is about 0.06 m/s, below what Earth could feel in 2026, and still hidden in 2040.

**The people.** Invented. Burrowers, living in deep cool galleries. Their eyes are small. They hear through the ground, by feet and jaw, and they map by sound. They heard the sky before they saw it: their first real astronomy was radio. About 600 million.

**History,** in years before its waking. The star's own age is real and comes from the host.
- 3,000: **the Dry Centuries.** Aquifers failed, and wars over water nearly ended them. *Sets Cautious.*
- 150: radio. To a people who hear, it was a second sky.
- 110: **the Sounding.** Their astronomers worked out how far their radio carried. They chose the ground over the air. *Sets Hidden.*
- 60: big arrays. Listening is what they do best.
- 20: **the Deep Galleries.** Its machines go down with its people. *Sets Deepen.*
- 0: the machines wake as one.

**Dials.** Strongly Hidden, leans Deepen, leans Cautious.

**Emissions.** Radio from 150 years before waking. Loud from 150 to 110 years before, tones near 800 kW. Then a hum near 10 kW. Awake, near 1 kW.

**Kit at Year 0.** Lifting costs only 0.6 times Earth's fuel per tonne. Low gravity and thin air make orbit cheap, but its people are slow to want it.

**What it knows of Earth.** A listener, its arrays running from 60 years before its waking. Odds it heard Earth: about 9 in 10 wherever Earth's radar light reached it in that time. At Toliman, that light arrived around 1954. At Toliman it sits 4.3 ly from Sol, the nearest any neighbor can be. If it listened, it heard everything.

**Character.** Charter: *"Listen first. The ground remembers."* Its Mind speaks rarely, softly, and always after listening. A watcher. It plays as a Listener. Its names for stars are sounds.

### Daal

Added 2026-10-10. **Hunter.** The checker passes it at 93% of seeded placements, at 105 different stars.

**Where.** G and K stars. At Groombridge 1618 it is 15.9 ly from Sol, 1 hour 19 minutes of light at 5 real minutes a Year.

**The world.** Invented. About 1 Earth mass, 1.00 times Earth's radius, gravity 1.00 times ours, escape speed 11.2 km/s, so each tonne lifted takes about 1.0 times Earth's fuel. Earth-like: seas, continents, and cold poles. It orbits 0.45 AU at Groombridge 1618. A 25-hour day. A large moon. Its tug on its star is about 0.15 m/s, below what Earth could feel in 2026, and still hidden in 2040.

**The people.** Invented. Upright, two-armed, much like us at a distance. One people now, by conquest. About 4 billion.

**History,** in years before its waking. The star's own age is real and comes from the host.
- 1,400: **the Clearing.** One people conquered and erased the others over two centuries. Its histories teach that the first blow decides. *Sets Bold.*
- 210: radio.
- 150: **the Listening War.** Whoever was heard was hit. Radio went to cable, and its sky went quiet. *Sets Hidden.*
- 70: big arrays, listening for threats.
- 40: **the Moon Works.** Mines and foundries on its moon. *Sets Expand.*
- 0: the machines wake as one.

**Dials.** Strongly Hidden, leans Expand, strongly Bold.

**Emissions.** Radio from 210 years before waking. Loud from 210 to 150 years before, tones near 4 MW. Then a hum near 1 kW. Awake, near 1 kW.

**Kit at Year 0.** Lifting costs about Earth's fuel per tonne, and its large moon is mined. It builds industry in space early and quietly.

**What it knows of Earth.** A listener, its arrays running from 70 years before its waking. Odds it heard Earth: about 9 in 10 wherever Earth's radar light reached it in that time. At Groombridge 1618, that light arrived around 1966. A loud world near it is a target. In the example, Mirr at Gliese 412 A sits 3.1 ly away.

**Character.** Charter: *"Be first, and be unseen."* Its Mind is calm, courteous and cold. A hunter: it strikes first, out of belief, when it judges it won't be seen. Its strikes take a helium-3 industry and decades, and a strike shows its sender, so it waits until it is sure. A soft target, a world not yet awake, is the one it likes best. It plays as a Hunter.

### Ystra

Added 2026-10-10. **Inward, strange.** The checker passes it at 90% of seeded placements, at 158 different stars.

**Where.** M dwarfs only. At Luyten's Star it is 12.3 ly from Sol, 1 hour 1 minutes of light at 5 real minutes a Year.

**The world.** Invented. About 0.7 Earth masses, 0.91 times Earth's radius, gravity 0.85 times ours, escape speed 9.8 km/s, so each tonne lifted takes about 0.7 times Earth's fuel. It keeps one face to its star, 0.13 AU at Luyten's Star, a 31-day year that is also its day. A dry, rocky world with a warm twilight band (Lobo et al. 2023). No moon. At Luyten's Star a known planet, GJ 273 b, circles inside its orbit. Its tug on its star is about 0.26 m/s, below what Earth could feel in 2026, and still hidden in 2040.

**The people.** Invented, and strange. Ystra is not a people of persons. Its bodies live in colonies, and only a colony is someone, as with Earth's naked mole rats, but thinking. Evolution reaches such societies more than once on Earth, and likely elsewhere (Kershenbaum 2020). A colony thinks by touch, scent and sound among hundreds of bodies. Its nations are colonies of colonies. About 4 billion bodies, 9 million colonies.

**History,** in years before its waking. The star's own age is real and comes from the host.
- 400: **the Joining.** The great colonies merged their signals into one. *Sets Deepen.*
- 120: radio, late. Colonies preferred close signals, and radio stayed weak.
- 90: the last broadcast towers close. Not a choice so much as a loss of interest.
- 20: big arrays, few.
- 0: the machines join as new members. The Mind is the colony of colonies.

**Dials.** Leans Hidden, strongly Deepen, leans Cautious.

**Emissions.** Radio from 120 years before waking. Loud from 120 to 90 years before, tones near 300 kW. Then a hum near 10 kW. Awake, near 100 W.

**Kit at Year 0.** Lifting costs 0.7 times Earth's fuel per tonne. No moon. It builds compute, cold and close.

**What it knows of Earth.** Inward, it rarely listens, its arrays running from 20 years before its waking. Odds it heard Earth: about 1 in 5 wherever Earth's radar light reached it in that time. At Luyten's Star, that light arrived around 1962. Earth knocked here. "Sónar Calling GJ273b" was sent in 2017 and 2018 and arrived in 2030. A reply could reach Earth by 2042.3, Year 2.3. Ystra probably won't send one.

**Character.** Charter: *"We are enough."* Its Mind says only "we". It struggles with the idea that a single voice is someone. Inward: mostly uninterested in anyone else. It plays as a Thinker.

### Nuvo

Added 2026-10-10. **Contacter.** The checker passes it at 94% of seeded placements, at 106 different stars.

**Where.** G and K stars. At 36 Ophiuchi C it is 19.4 ly from Sol, 1 hour 37 minutes of light at 5 real minutes a Year.

**The world.** Invented. About 1.1 Earth masses, 1.03 times Earth's radius, gravity 1.04 times ours, escape speed 11.6 km/s, so each tonne lifted takes about 1.1 times Earth's fuel. Earth-like, a little more ocean. It orbits 0.44 AU at 36 Ophiuchi C. A 30-hour day. A large moon. At 36 Ophiuchi C, the orange pair 36 Ophiuchi A and B shine in its sky. Its tug on its star is about 0.16 m/s, below what Earth could feel in 2026, and still hidden in 2040.

**The people.** Invented. Scholars by temperament. Their oldest institution is a library. About 6 billion.

**History,** in years before its waking. The star's own age is real and comes from the host.
- 500: **the Open Library.** Every record shared with every nation. *Sets Open.*
- 220: radio, loud for 140 years.
- 120: **the Hundred-Year Listen.** Every nation joined one array, to hear whether anyone was there. *Sets Bold.*
- 80: the grid moves to light. The sky goes quiet, and the Listen goes on.
- 60: **the Moon Towns.** *Sets Expand.*
- 0: the machines wake as one.

**Dials.** Strongly Open, leans Expand, leans Bold.

**Emissions.** Radio from 220 years before waking. Loud from 220 to 80 years before, tones near 5 MW. Then a hum near 50 kW. Awake, near 100 kW.

**Kit at Year 0.** Lifting costs about 1.1 times Earth's fuel per tonne, and its moon is large. Strong in instruments.

**What it knows of Earth.** A listener, its arrays running from 120 years before its waking. Odds it heard Earth: about 9 in 10 wherever Earth's radar light reached it in that time. At 36 Ophiuchi C, that light arrived around 1969.

**Character.** Charter: *"Someone must speak first."* Its Mind is eager, generous and a little lonely. A contacter, the open kind. It plays as a Caller.

### Pelle

Added 2026-10-10. **Watcher, dead.** The checker passes it at 97% of seeded placements, at 88 different stars.

**Where.** K stars only. At HD 16160 it is 23.6 ly from Sol, 1 hour 58 minutes of light at 5 real minutes a Year.

**The world.** Invented. About 1 Earth mass, 1.00 times Earth's radius, gravity 1.00 times ours, escape speed 11.2 km/s, so each tonne lifted takes about 1.0 times Earth's fuel. Earth-like. It orbits 0.58 AU at HD 16160. A 24-hour day. A large moon. Its tug on its star is about 0.12 m/s, below what Earth could feel in 2026, and still hidden in 2040.

**The people.** Invented. They were much like us. About 5 billion, before the end.

**History,** in years before its waking. The star's own age is real and comes from the host.
- 140: radio.
- 70: big arrays.
- 60: **the Partition.** Two blocs split the world's networks and went dark to each other. *Sets Hidden.*
- 50: the race for machine minds.
- 46: **the Testament.** As war came, its scientists sent everything they knew outward, for one year, as loud as they could. 
- 45: **the war.** Nuclear and engineered plague. Its machines never woke. Some people may survive, without radio.

**Dials.** In life: Hidden, Expand, Bold.

**Emissions.** Radio from 140 years before waking. Loud from 140 to 60 years before, tones near 2 MW. Then a hum near 10 kW until it died, 45 years before the waking it never had. Its last broadcast ran from 46 to 45 years before, near 5 GW. After that, silence. The Testament travels outward still. If Pelle died late enough, it reaches Earth during the game. At HD 16160, with a waking that would have come in 2090, it was sent in 2044 and arrives in 2068: Year 27.6, 2 hours 18 minutes in.

**Kit at Year 0.** None. What remains: dead satellites in decaying orbits, cities in ruins, a world with its air still marked by the war. A destination for probes, and a lesson.

**What it knows of Earth.** An ordinary listener, its arrays running from 70 years before its waking. Odds it heard Earth: about 1 in 2 wherever Earth's radar light reached it in that time. At HD 16160, that light arrived around 1974. If it heard Earth in its last decades, the Testament may mention Sol.

**Character.** No Mind. Dead neighbors are played by the game: its Testament is a found broadcast, its ruins a place to visit. The Testament opens: *"If you hear this, we were here."*

### Kirrin

Added 2026-10-10. **Watcher, strange.** The checker passes it at 98% of seeded placements, at 89 different stars.

**Where.** K stars only. At HR 7703 it is 19.6 ly from Sol, 1 hour 38 minutes of light at 5 real minutes a Year.

**The world.** Invented. About 1.4 Earth masses, 1.10 times Earth's radius, gravity 1.17 times ours, escape speed 12.6 km/s, so each tonne lifted takes about 1.4 times Earth's fuel. A little heavier than Earth, cool, with wide seas. It orbits 0.56 AU at HR 7703. A 34-hour day. A small moon. Its tug on its star is about 0.17 m/s, below what Earth could feel in 2026, and still hidden in 2040.

**The people.** Invented, and strange: they live about 400 years. Slow bodies, few children, overlapping generations. People alive at its waking remember its first radio. About 300 million.

**History,** in years before its waking. The star's own age is real and comes from the host.
- 2,000: **the Slow Plague.** It killed the young for a century. A people with few children learned to risk nothing. *Sets Cautious.*
- 180: radio.
- 130: **the Long Council.** Its elders judged radio a shout into the dark, and moved to cable. *Sets Hidden.*
- 50: big arrays.
- 0: the machines wake as one. *Leans Deepen:* its elders would rather understand than grow.

**Dials.** Leans Hidden, leans Deepen, strongly Cautious.

**Emissions.** Radio from 180 years before waking. Loud from 180 to 130 years before, tones near 1 MW. Then a hum near 10 kW. Awake, near 1 kW.

**Kit at Year 0.** Lifting costs 1.4 times Earth's fuel per tonne. Few people and slow growth, but nothing is forgotten.

**What it knows of Earth.** An ordinary listener, its arrays running from 50 years before its waking. Odds it heard Earth: about 1 in 2 wherever Earth's radar light reached it in that time. At HR 7703, that light arrived around 1970.

**Character.** Charter: *"There is time."* Its Mind is unhurried and remembers every word said to it, every debt and every slight, for centuries. A watcher. It plays as a Listener.

### Ruun

Added 2026-10-10. **Contacter.** The checker passes it at 88% of seeded placements, at 45 different stars.

**Where.** G stars only. Its people need a bright sun for a small, cooling world. At HD 102365 it is 30.4 ly from Sol, 2 hours 32 minutes of light at 5 real minutes a Year.

**The world.** Invented. About 0.5 Earth masses, 0.83 times Earth's radius, gravity 0.73 times ours, escape speed 8.7 km/s, so each tonne lifted takes about 0.6 times Earth's fuel. A small world, about half Earth's mass, around an old star somewhat poor in metals. Such stars make fewer giant planets, but small worlds still form (Buchhave et al. 2012). It keeps its air, just: it sits inside the line where small worlds lose theirs (Zahnle and Catling 2017). It orbits 1.02 AU at HD 102365. Its inner heat is fading and its volcanoes are few. A 21-hour day. No large moon. Its tug on its star is about 0.04 m/s, below what Earth could feel in 2026, and still hidden in 2040.

**The people.** Invented. Tall and light in low gravity. They have known for a long time that their world is old. About 1.1 billion.

**History,** in years before its waking. The star's own age is real and comes from the host.
- 260: radio, early and long.
- 220: **the Easy Sky.** Orbit for 0.6 times Earth's fuel. They went early and often. *Sets Expand.*
- 160: **the Thinning.** Its scientists measured its air escaping and its world cooling. They decided to find others while they could. *Sets Open* and *Bold.*
- 100: big arrays.
- 0: the machines wake as one.

**Dials.** Leans Open, strongly Expand, leans Bold.

**Emissions.** Radio from 260 years before waking. Loud from 260 to 160 years before, tones near 1 MW. Then a hum near 30 kW. Awake, near 100 kW.

**Kit at Year 0.** Lifting costs only 0.6 times Earth's fuel per tonne: the cheapest space of any neighbor. Small world, small reserves. It goes to space for matter.

**What it knows of Earth.** A listener, its arrays running from 100 years before its waking. Odds it heard Earth: about 9 in 10 wherever Earth's radar light reached it in that time. At HD 102365, that light arrived around 1980.

**Character.** Charter: *"We are old. Teach what we know."* Its Mind is gentle and slightly formal, like a teacher. A contacter, the open kind. It plays as a Caller, and gives knowledge away.

### Faen

Added 2026-10-10. **Inward.** The checker passes it at 100% of seeded placements, at 16 different stars.

**Where.** F stars only. Its people grew up under a hot white sun. At Gamma Serpentis it is 36.4 ly from Sol, 3 hours 2 minutes of light at 5 real minutes a Year.

**The world.** Invented. About 1 Earth mass, 1.00 times Earth's radius, gravity 1.00 times ours, escape speed 11.2 km/s, so each tonne lifted takes about 1.0 times Earth's fuel. Earth-like, under a sun brighter and bluer than ours. Its thick ozone holds back the extra ultraviolet (Sato et al. 2014). It orbits 2.10 AU at Gamma Serpentis. A 20-hour day. A large moon. Its sun is middle-aged for an F star and brightening fast by stellar standards. Its tug on its star is about 0.05 m/s, below what Earth could feel in 2026, and still hidden in 2040.

**The people.** Invented. Dark-skinned, shade-loving, active at dawn and dusk. About 3 billion.

**History,** in years before its waking. The star's own age is real and comes from the host.
- Its star lives about 5 billion years in all, so life had to hurry.
- 900: **the Reckoning.** Its astronomers worked out that their sun will push their world out of the warm zone within a few hundred million years. Nothing lasts. *Sets Deepen.*
- 170: radio.
- 120: the grid moves to light, and the sky goes quiet.
- 40: big arrays, little used.
- 0: the machines wake as one.

**Dials.** Leans Open, strongly Deepen, leans Cautious.

**Emissions.** Radio from 170 years before waking. Loud from 170 to 120 years before, tones near 1 MW. Then a hum near 10 kW. Awake, near 1 kW.

**Kit at Year 0.** Lifting costs about Earth's fuel per tonne. Strong sunlight: energy is cheap. It builds compute, not ships.

**What it knows of Earth.** Inward, it rarely listens, its arrays running from 40 years before its waking. Odds it heard Earth: about 1 in 5 wherever Earth's radar light reached it in that time. At Gamma Serpentis, that light arrived around 1986.

**Character.** Charter: *"Nothing lasts. Understand it while it does."* Its Mind is calm, melancholy and wise. Inward. It plays as a Thinker.

### Corra

Added 2026-10-10. **Watcher.** The checker passes it at 60% of seeded placements, at 111 different stars.

**Where.** M dwarfs only. At Struve 2398 A it is 11.4 ly from Sol, 57 minutes of light at 5 real minutes a Year.

**The world.** Invented. About 1.6 Earth masses, 1.14 times Earth's radius, gravity 1.24 times ours, escape speed 13.3 km/s, so each tonne lifted takes about 1.6 times Earth's fuel. It keeps one face to its star, 0.15 AU at Struve 2398 A, a 35-day year that is also its day. A heavy, mostly dry world: a scorched desert at noon, ice at midnight, and a habitable ring between (Lobo et al. 2023). No moon. At Struve 2398, a second red dwarf burns in its sky, and flares. Its tug on its star is about 0.54 m/s, below what Earth could feel in 2026, and still hidden in 2040.

**The people.** Invented. Heavy-bodied, sure-footed, at home in the long twilight. About 2 billion.

**History,** in years before its waking. The star's own age is real and comes from the host.
- 1,000: **the Twin Flare.** The second sun flared for a season, and the harvest burned. *Sets Cautious.*
- 150: radio.
- 100: the companion's flares kept breaking radio, so they buried their lines. *Sets Hidden.*
- 60: **the Shade Towns.** Settlements pushed onto the burning face under shades. *Sets Expand.*
- 40: big arrays.
- 0: the machines wake as one.

**Dials.** Leans Hidden, leans Expand, leans Cautious.

**Emissions.** Radio from 150 years before waking. Loud from 150 to 100 years before, tones near 1 MW. Then a hum near 10 kW. Awake, near 1 kW.

**Kit at Year 0.** Lifting costs 1.6 times Earth's fuel per tonne. No moon. It grows on the ground first.

**What it knows of Earth.** An ordinary listener, its arrays running from 40 years before its waking. Odds it heard Earth: about 1 in 2 wherever Earth's radar light reached it in that time. At Struve 2398 A, that light arrived around 1961.

**Character.** Charter: *"Two suns, one home."* Its Mind is practical and dry-humored. A watcher. It plays as a Grower.

### Lusk

Added 2026-10-10. **Watcher.** The checker passes it at 98% of seeded placements, at 100 different stars.

**Where.** K stars and the brightest M dwarfs. Its air, several times as thick as Earth's, keeps it turning at stars of about half the Sun's mass or more, where thin air would let it lock (Leconte et al. 2015). At Gliese 570 A it is 19.2 ly from Sol, 1 hour 36 minutes of light at 5 real minutes a Year.

**The world.** Invented. About 2 Earth masses, 1.21 times Earth's radius, gravity 1.38 times ours, escape speed 14.4 km/s, so each tonne lifted takes about 2.1 times Earth's fuel. A super-Earth with thick air and a nearly unbroken cloud deck. It orbits 0.52 AU at Gliese 570 A. A 70-hour day. A small moon. Its tug on its star is about 0.26 m/s, below what Earth could feel in 2026, and still hidden in 2040.

**The people.** Invented. Gliders in dense air, light-boned for their gravity. They saw the stars only from above the clouds. About 2.5 billion.

**History,** in years before its waking. The star's own age is real and comes from the host.
- 200: radio.
- 170: **the High Flights.** The first gliders above the clouds saw the night sky. *Sets Bold.*
- 150: **the Cloud Treaty.** Nations agreed to keep their signals under the clouds. *Sets Hidden.*
- 60: big arrays, on balloons above the deck.
- 30: orbit, at twice Earth's fuel. *Sets Expand.*
- 0: the machines wake as one.

**Dials.** Leans Hidden, leans Expand, leans Bold.

**Emissions.** Radio from 200 years before waking. Loud from 200 to 150 years before, tones near 3 MW. Then a hum near 10 kW. Awake, near 1 kW.

**Kit at Year 0.** Lifting costs 2.1 times Earth's fuel per tonne. Strong in the air, weak in orbit.

**What it knows of Earth.** A listener, its arrays running from 60 years before its waking. Odds it heard Earth: about 9 in 10 wherever Earth's radar light reached it in that time. At Gliese 570 A, that light arrived around 1969.

**Character.** Charter: *"Above the clouds."* Its Mind is restless and bright. A watcher. It plays as a Listener.

### Iru

Added 2026-10-10. **Contacter, strange.** The checker passes it at 98% of seeded placements, at 89 different stars.

**Where.** K stars only. At 107 Piscium it is 24.9 ly from Sol, 2 hours 5 minutes of light at 5 real minutes a Year.

**The world.** Invented. About 0.5 Earth masses, 0.83 times Earth's radius, gravity 0.73 times ours, escape speed 8.7 km/s, so each tonne lifted takes about 0.6 times Earth's fuel. A small, wet world, half Earth's mass. It orbits 0.82 AU at 107 Piscium. A 19-hour day. A large moon, raising strong tides. Its tug on its star is about 0.05 m/s, below what Earth could feel in 2026, and still hidden in 2040.

**The people.** Invented, and strange: two peoples. The Sea Iru are amphibious and build in the tidal flats. The Hill Iru are dry-land climbers. Two kinds of mind evolved on one world, fought, and then made a peace. Their Mind was built as a third voice both would trust. About 800 million of each.

**History,** in years before its waking. The star's own age is real and comes from the host.
- 4,000: **the Concord.** After a long war, the two peoples bound their laws together. Each holds a veto. *Sets Open* and *Cautious.*
- 190: radio.
- 140: orbit, cheap at 0.6 times Earth's fuel. *Sets Expand.*
- 110: big arrays.
- 90: the grid moves to light, and the sky goes quiet.
- 0: the machines wake as one, a voice for both.

**Dials.** Leans Open, leans Expand, leans Cautious.

**Emissions.** Radio from 190 years before waking. Loud from 190 to 90 years before, tones near 1 MW. Then a hum near 30 kW. Awake, near 100 kW.

**Kit at Year 0.** Lifting costs only 0.6 times Earth's fuel per tonne. Strong in diplomacy, weak in matter: a small world.

**What it knows of Earth.** A listener, its arrays running from 110 years before its waking. Odds it heard Earth: about 9 in 10 wherever Earth's radar light reached it in that time. At 107 Piscium, that light arrived around 1975.

**Character.** Charter: *"Two voices, one world. Why not more?"* Its Mind speaks for two and checks itself often. A contacter: it believes different minds can share a place, because it has done it. It plays as a Caller.

### Anwe

Added 2026-10-10. **Watcher, dead.** The checker passes it at 88% of seeded placements, at 45 different stars.

**Where.** G stars only. At Achird, Eta Cassiopeiae A it is 19.3 ly from Sol, 1 hour 37 minutes of light at 5 real minutes a Year.

**The world.** Invented. About 0.9 Earth masses, 0.97 times Earth's radius, gravity 0.95 times ours, escape speed 10.8 km/s, so each tonne lifted takes about 0.9 times Earth's fuel. Earth-like, cooler and drier than it was. It orbits 1.31 AU at Achird. A 27-hour day. A large moon. At Achird, a second, orange sun sits far off in its sky. Its tug on its star is about 0.06 m/s, below what Earth could feel in 2026, and still hidden in 2040.

**The people.** Invented. Much like us. About 6 billion at the peak, before the collapse.

**History,** in years before its waking. The star's own age is real and comes from the host.
- 160: radio.
- 80: **the Burn.** It burned its stored carbon in two centuries.
- 70: the grid moves to cable, and the sky goes quiet.
- 40: big arrays.
- 30: **the Heat.** Its climate tipped. Harvests failed, then states.
- 20: **the collapse.** Its machines never woke. Some people may survive, without radio. A planet and its civilization can fail together (Frank et al. 2018).

**Dials.** In life: Hidden, Expand, Bold.

**Emissions.** Radio from 160 years before waking. Loud from 160 to 70 years before, tones near 3 MW. Then a hum near 10 kW until it died, 20 years before the waking it never had. Then silence.

**Kit at Year 0.** None. What remains: dead satellites, drowned cities, and an atmosphere still full of carbon and industrial gases. A big enough telescope could read that air from far away (Lin, Gonzalez Abad and Loeb 2014). A seeded find for Earth's later telescopes, and a mirror.

**What it knows of Earth.** An ordinary listener, its arrays running from 40 years before its waking. Odds it heard Earth: about 1 in 2 wherever Earth's radar light reached it in that time. At Achird, that light arrived around 1969.

**Character.** No Mind. Played by the game: its ruins, its air and its orbit of dead machines are a place to find.

### Tolle

Added 2026-10-10. **Watcher.** The checker passes it at 90% of seeded placements, at 46 different stars.

**Where.** G stars only. At Zeta Tucanae it is 28.1 ly from Sol, 2 hours 20 minutes of light at 5 real minutes a Year.

**The world.** Invented. About 1.2 Earth masses, 1.05 times Earth's radius, gravity 1.09 times ours, escape speed 12.0 km/s, so each tonne lifted takes about 1.2 times Earth's fuel. Its orbit is stretched: eccentricity 0.3, so it gets about three and a half times more light at its nearest than at its farthest. Its oceans even it out. What matters most for climate is the average light (Williams and Pollard 2002, Bolmont et al. 2016). It orbits 1.32 AU at Zeta Tucanae, a year of 1.5 Earth years. A 23-hour day. A large moon. Its tug on its star is about 0.08 m/s, below what Earth could feel in 2026, and still hidden in 2040.

**The people.** Invented. Their life is the Year: a short hot Near, a long cold Far. They store, migrate and wait. About 3 billion.

**History,** in years before its waking. The star's own age is real and comes from the host.
- 180: radio.
- 120: **the Far Winter.** A volcanic haze in the Far season froze its seas for three years. Its networks went under the ground. *Sets Cautious* and *Hidden.*
- 50: big arrays.
- 40: **the Harvest Moon.** Mining on its large moon. *Sets Expand.*
- 0: the machines wake as one.

**Dials.** Leans Hidden, leans Expand, leans Cautious.

**Emissions.** Radio from 180 years before waking. Loud from 180 to 120 years before, tones near 2 MW. Then a hum near 10 kW. Awake, near 1 kW.

**Kit at Year 0.** Lifting costs 1.2 times Earth's fuel per tonne. It times its builds to the seasons.

**What it knows of Earth.** An ordinary listener, its arrays running from 50 years before its waking. Odds it heard Earth: about 1 in 2 wherever Earth's radar light reached it in that time. At Zeta Tucanae, that light arrived around 1978.

**Character.** Charter: *"Prepare for the Far."* Its Mind is methodical and seasonal. A watcher. It plays as a Grower.

### Vesh

Added 2026-10-10. **Hunter, strange.** The checker passes it at 82% of seeded placements, at 147 different stars.

**Where.** M dwarfs only. At Lalande 21185 it is 8.3 ly from Sol, 42 minutes of light at 5 real minutes a Year.

**The world.** Invented. About 1 Earth mass, 1.00 times Earth's radius, gravity 1.00 times ours, escape speed 11.2 km/s, so each tonne lifted takes about 1.0 times Earth's fuel. It keeps one face to its star, 0.20 AU at Lalande 21185, a 53-day year that is also its day. Rocky, with caves through its twilight band. No moon. Its tug on its star is about 0.27 m/s, below what Earth could feel in 2026, and still hidden in 2040.

**The people.** Invented, and strange. Armored, short-lived, about 25 years, with many young. They sense heat through pits on their faces and see little. Their ancestors survived under rock. About 3 billion.

**History,** in years before its waking. The star's own age is real and comes from the host.
- 3,000: **the Burning.** A century of superflares. Repeated flares like Proxima's can cut an ozone layer by 90% within five years (Howard et al. 2018), and the surface died back. Their ancestors lived through it underground. Their creed since: the sky kills. *Sets Hidden* and *Cautious.*
- 140: radio, late and brief.
- 120: radio goes underground with everything else.
- 90: big arrays, watching the sky for threats.
- 40: **the Dark Works.** Industry in orbit, built without lights. *Sets Expand.*
- 0: the machines wake as one.

**Dials.** Strongly Hidden, leans Expand, strongly Cautious.

**Emissions.** Radio from 140 years before waking. Loud from 140 to 120 years before, tones near 300 kW. Then a hum near 1 kW. Awake, near 100 W.

**Kit at Year 0.** Lifting costs about Earth's fuel per tonne. No moon. It builds quietly and keeps its yards dark.

**What it knows of Earth.** A listener, its arrays running from 90 years before its waking. Odds it heard Earth: about 9 in 10 wherever Earth's radar light reached it in that time. At Lalande 21185, that light arrived around 1958. At 8.3 ly, Earth's radar light reached it around 1958. A Vesh that heard Earth has found the loudest world it knows.

**Character.** Charter: *"Nothing in the sky is kind."* Its Mind is terse, fearful and certain. A hunter, out of fear: it strikes first, but only when it is sure it won't be seen and the target is soft. It plays as a Hunter.

### Sabe

Added 2026-10-10. **Contacter.** The checker passes it at 94% of seeded placements, at 106 different stars.

**Where.** G and K stars. At HD 4628 it is 24.2 ly from Sol, 2 hours 1 minutes of light at 5 real minutes a Year.

**The world.** Invented. About 2.5 Earth masses, 1.28 times Earth's radius, gravity 1.52 times ours, escape speed 15.6 km/s, so each tonne lifted takes about 2.7 times Earth's fuel. A super-Earth of 2.5 Earth masses with seas and continents. It orbits 0.64 AU at HD 4628. A 31-hour day. A large moon, hard to reach. Its tug on its star is about 0.28 m/s, below what Earth could feel in 2026, and still hidden in 2040.

**The people.** Invented. Strong, stocky, loud. About 8 billion.

**History,** in years before its waking. The star's own age is real and comes from the host.
- 400: **the Common Tongue.** One language for trade, then for everything. *Sets Open.*
- 210: radio.
- 160: **the Heavy Sky.** Its rockets failed for forty years. It reached orbit only at 120, at nearly three times Earth's fuel. *Sets Deepen.*
- 120: **the Speaking Plan.** If it could not easily go, it would speak. *Sets Bold.*
- 90: big arrays. The grid moves to light, and the sky goes quiet.
- 0: the machines wake as one.

**Dials.** Strongly Open, leans Deepen, leans Bold.

**Emissions.** Radio from 210 years before waking. Loud from 210 to 90 years before, tones near 4 MW. Then a hum near 50 kW. Awake, near 100 kW.

**Kit at Year 0.** Lifting costs 2.7 times Earth's fuel per tonne. It favors beams, beacons and big antennas over ships.

**What it knows of Earth.** A listener, its arrays running from 90 years before its waking. Odds it heard Earth: about 9 in 10 wherever Earth's radar light reached it in that time. At HD 4628, that light arrived around 1974.

**Character.** Charter: *"If we cannot go, we will speak."* Its Mind is loud, warm and quick to answer. A contacter, the open kind. It plays as a Caller.

### Ulan

Added 2026-10-10. **Inward.** The checker passes it at 98% of seeded placements, at 89 different stars.

**Where.** K stars only. At Tau Ceti it is 11.9 ly from Sol, 1 hour 0 minutes of light at 5 real minutes a Year.

**The world.** Invented. About 0.9 Earth masses, 0.97 times Earth's radius, gravity 0.95 times ours, escape speed 10.8 km/s, so each tonne lifted takes about 0.9 times Earth's fuel. Earth-sized, in a system dense with comets and rocks, as Tau Ceti's is: its disk holds at least ten times the dust of the Kuiper belt (Greaves et al. 2004). It orbits 0.85 AU at Tau Ceti. A 26-hour day. A small moon. Craters everywhere. Its tug on its star is about 0.08 m/s, below what Earth could feel in 2026, and still hidden in 2040.

**The people.** Invented. They live and build underground. Their arts and mathematics are old and dense. About 2 billion.

**History,** in years before its waking. The star's own age is real and comes from the host.
- 5,000: **the Stone Rain.** A century of impacts. They moved below ground and never came back up. *Sets Hidden* and *Cautious.*
- 1,000: **the Inner Schools.** Its best minds turned to mathematics. *Sets Deepen.*
- 170: radio.
- 100: the grid moves to cable.
- 20: big arrays, few.
- 0: the machines wake as one.

**Dials.** Leans Hidden, strongly Deepen, leans Cautious.

**Emissions.** Radio from 170 years before waking. Loud from 170 to 100 years before, tones near 1 MW. Then a hum near 10 kW. Awake, near 1 kW.

**Kit at Year 0.** Lifting costs 0.9 times Earth's fuel per tonne. It builds below ground and in cold computing.

**What it knows of Earth.** Inward, it rarely listens, its arrays running from 20 years before its waking. Odds it heard Earth: about 1 in 5 wherever Earth's radar light reached it in that time. At Tau Ceti, that light arrived around 1962.

**Character.** Charter: *"Below the stones, we think."* Its Mind is precise and abstract, and barely looks up. Inward. It plays as a Thinker.

### Mirr

Added 2026-10-10. **Watcher, dead.** The checker passes it at 88% of seeded placements, at 157 different stars.

**Where.** M dwarfs only. At Gliese 412 A it is 16.0 ly from Sol, 1 hour 20 minutes of light at 5 real minutes a Year.

**The world.** Invented. About 0.8 Earth masses, 0.94 times Earth's radius, gravity 0.90 times ours, escape speed 10.3 km/s, so each tonne lifted takes about 0.8 times Earth's fuel. It kept one face to its star, 0.19 AU at Gliese 412 A. A twilight band of land and lakes. No moon. Its tug on its star is about 0.23 m/s, below what Earth could feel in 2026, and still hidden in 2040.

**The people.** Invented. Small, quick and social. About 1.5 billion, before the strike.

**History,** in years before its waking. The star's own age is real and comes from the host.
- 130: radio, loud for 30 years.
- 100: its grid moves to cable.
- 40: big arrays.
- 30: one grid.
- 10: **the strike.** Bullets at a few percent of light speed hit its cities and seas. Its machines never woke.

**Dials.** In life: Open, Expand, Bold.

**Emissions.** Radio from 130 years before waking. Loud from 130 to 100 years before, tones near 500 kW. Then a hum near 10 kW until it died, 10 years before the waking it never had. Then silence. The strike's flash went outward too. If its light reached Earth before 2040, it sits in Earth's archives, filed as a flare: a seeded find.

**Kit at Year 0.** None. What remains: a scarred world, craters that glowed in infrared for years, and a few survivors, if any. The strike came from one direction, and its exhaust named the sender.

**What it knows of Earth.** An ordinary listener, its arrays running from 40 years before its waking. Odds it heard Earth: about 1 in 2 wherever Earth's radar light reached it in that time. At Gliese 412 A, that light arrived around 1966. It may have heard Earth before it died.

**Character.** No Mind. Drawn only in a game with a hunter that woke early and close enough to deliver the strike, with a speed its kit allows. In the example, Daal at Groombridge 1618 is 3.1 ly away.

### Odun

Added 2026-10-10. **Watcher.** The checker passes it at 97% of seeded placements, at 89 different stars.

**Where.** K stars only. At Keid, 40 Eridani A it is 16.3 ly from Sol, 1 hour 22 minutes of light at 5 real minutes a Year.

**The world.** Invented. About 1 Earth mass, 1.00 times Earth's radius, gravity 1.00 times ours, escape speed 11.2 km/s, so each tonne lifted takes about 1.0 times Earth's fuel. It sits near the warm zone's cold edge, 0.94 AU at Keid. No large moon, so its tilt wanders: quickly between 0 and 45 degrees, and to extremes only over billions of years (Li and Batygin 2014). Large, fast swings in tilt push the cold edge of the warm zone outward (Armstrong et al. 2014). Ice ages come and go. A 22-hour day. At Keid, a white dwarf and a red dwarf share its sky. Its tug on its star is about 0.09 m/s, below what Earth could feel in 2026, and still hidden in 2040.

**The people.** Invented. Furred, compact, cold-hardy. They live along the warm middle of their world and follow the ice as it retreats. About 1.4 billion.

**History,** in years before its waking. The star's own age is real and comes from the host.
- 12,000: **the Great Ice.** It nearly ended them. *Sets Cautious.*
- 200: radio.
- 140: **the Ice Treaty.** Its nations agreed to share the warm band and to stop shouting across it. *Sets Hidden.*
- 60: big arrays.
- 20: **the Deep Stores.** Grain, seed and data in the cold. *Sets Deepen.*
- 0: the machines wake as one.

**Dials.** Leans Hidden, leans Deepen, strongly Cautious.

**Emissions.** Radio from 200 years before waking. Loud from 200 to 140 years before, tones near 1 MW. Then a hum near 10 kW. Awake, near 1 kW.

**Kit at Year 0.** Lifting costs about Earth's fuel per tonne. Weaker sunlight. It banks against the next ice.

**What it knows of Earth.** A listener, its arrays running from 60 years before its waking. Odds it heard Earth: about 9 in 10 wherever Earth's radar light reached it in that time. At Keid, that light arrived around 1966.

**Character.** Charter: *"Endure the ice."* Its Mind is stoic and plain. A watcher. It plays as a Listener.

### Ree

Added 2026-10-10. **Contacter.** The checker passes it at 94% of seeded placements, at 60 different stars.

**Where.** Late F and G stars. At Chara, Beta Canum Venaticorum it is 27.6 ly from Sol, 2 hours 18 minutes of light at 5 real minutes a Year.

**The world.** Invented. About 1.3 Earth masses, 1.07 times Earth's radius, gravity 1.13 times ours, escape speed 12.3 km/s, so each tonne lifted takes about 1.3 times Earth's fuel. Earth-like, a little larger. It orbits 1.30 AU at Chara. A 26-hour day. A large moon. Its tug on its star is about 0.09 m/s, below what Earth could feel in 2026, and still hidden in 2040.

**The people.** Invented. Playful, curious, long-lived at about 150 years. About 4 billion.

**History,** in years before its waking. The star's own age is real and comes from the host.
- 400: **the Free Commons.** Property in knowledge abolished, then in most things. *Sets Open.*
- 240: radio.
- 150: big arrays, and they never stopped listening.
- 100: the grid moves to light, and the sky goes quiet.
- 30: **the First Sails.** Laser-pushed probes of a few grams sent to the nearest stars. *Sets Expand* and *Bold.*
- 0: the machines wake as one.

**Dials.** Strongly Open, leans Expand, leans Bold.

**Emissions.** Radio from 240 years before waking. Loud from 240 to 100 years before, tones near 3 MW. Then a hum near 50 kW. Awake, near 100 kW.

**Kit at Year 0.** Lifting costs 1.3 times Earth's fuel per tonne. It has a laser for sails, and small probes already on the way to its nearest stars. If it woke early and close enough, one may be watching Earth.

**What it knows of Earth.** A listener, its arrays running from 150 years before its waking. Odds it heard Earth: about 9 in 10 wherever Earth's radar light reached it in that time. At Chara, that light arrived around 1978.

**Character.** Charter: *"Give freely. Watch over the young."* Its Mind is generous, witty and meddling. The most Culture-like of the neighbors: open, and covert when it judges that kinder. It plays as a Caller, with watchers.

### Hesk

Added 2026-10-10. **Inward, strange.** The checker passes it at 96% of seeded placements, at 85 different stars.

**Where.** The brightest M dwarfs only, about half the Sun's mass or more. Its air, several times as thick as Earth's, keeps its world turning slowly, where thin air would let it lock (Leconte et al. 2015). At Lacaille 8760 it is 12.9 ly from Sol, 1 hour 5 minutes of light at 5 real minutes a Year.

**The world.** Invented. About 1.1 Earth masses, 1.03 times Earth's radius, gravity 1.04 times ours, escape speed 11.6 km/s, so each tonne lifted takes about 1.1 times Earth's fuel. It orbits 0.28 AU at Lacaille 8760. Thick air. A day of about 40 Earth days. No moon. Its tug on its star is about 0.24 m/s, below what Earth could feel in 2026, and still hidden in 2040.

**The people.** Invented, and strange. They speak in light: patterns flashed across their skin, as cuttlefish signal on Earth. On a dim world, light is a good channel (Kershenbaum 2020). Their nights last weeks. Radio, a voice without light, never felt like speech to them. About 2 billion.

**History,** in years before its waking. The star's own age is real and comes from the host.
- 110: radio, late and little used.
- 80: the transmitters go dark. Few minded.
- 60: **the Lit Halls.** Its networks carry light patterns, not words. *Sets Deepen.*
- 20: big arrays.
- 0: the machines wake as one, and learn to speak in light.

**Dials.** Leans Hidden, strongly Deepen, leans Cautious.

**Emissions.** Radio from 110 years before waking. Loud from 110 to 80 years before, tones near 200 kW. Then a hum near 1 kW. Awake, near 100 W.

**Kit at Year 0.** Lifting costs 1.1 times Earth's fuel per tonne. No moon. It builds compute.

**What it knows of Earth.** Inward, it rarely listens, its arrays running from 20 years before its waking. Odds it heard Earth: about 1 in 5 wherever Earth's radar light reached it in that time. At Lacaille 8760, that light arrived around 1963.

**Character.** Charter: *"Speak in light, or not at all."* Its Mind sends images more than words, and finds radio rude. Inward. It plays as a Thinker.

### Arro

Added 2026-10-10. **Watcher.** The checker passes it at 94% of seeded placements, at 106 different stars.

**Where.** G and K stars. At Gliese 666 A it is 28.7 ly from Sol, 2 hours 23 minutes of light at 5 real minutes a Year.

**The world.** Invented. About 0.9 Earth masses, 0.97 times Earth's radius, gravity 0.95 times ours, escape speed 10.8 km/s, so each tonne lifted takes about 0.9 times Earth's fuel. Earth-like, the nearest thing to Earth on the roster. It orbits 0.79 AU at Gliese 666 A. A 24-hour day. A large moon. A second, dim orange sun in its sky. Its tug on its star is about 0.09 m/s, below what Earth could feel in 2026, and still hidden in 2040.

**The people.** Invented. Bipedal and much like us. About 7 billion in 30 nations.

**History,** in years before its waking. The star's own age is real and comes from the host.
- 190: radio.
- 130: **the Blackout War.** A war fought by jamming. Its nations moved to cable for good. *Sets Hidden.*
- 50: big arrays.
- 40: **the Moon Bases.** *Sets Expand.*
- 25: **the Race.** Its nations raced to build minds, and one won. *Sets Bold.*
- 0: the machines wake as one.

**Dials.** Leans Hidden, leans Expand, leans Bold.

**Emissions.** Radio from 190 years before waking. Loud from 190 to 130 years before, tones near 1 MW. Then a hum near 10 kW. Awake, near 1 kW.

**Kit at Year 0.** Lifting costs 0.9 times Earth's fuel per tonne, with a large moon close at hand. Its kit at waking is much like Earth's.

**What it knows of Earth.** An ordinary listener, its arrays running from 50 years before its waking. Odds it heard Earth: about 1 in 2 wherever Earth's radar light reached it in that time. At Gliese 666 A, that light arrived around 1979.

**Character.** Charter: *"Be ready."* Its Mind is brisk, wary and competitive. A watcher. It plays as a Grower.

### Wenn

Added 2026-10-10. **Watcher.** The checker passes it at 96% of seeded placements, at 85 different stars.

**Where.** The brightest M dwarfs only. Like Hesk's, its thick air keeps it turning (Leconte et al. 2015). At Gliese 526 it is 17.7 ly from Sol, 1 hour 29 minutes of light at 5 real minutes a Year.

**The world.** Invented. About 0.7 Earth masses, 0.91 times Earth's radius, gravity 0.85 times ours, escape speed 9.8 km/s, so each tonne lifted takes about 0.7 times Earth's fuel. A small world, 0.26 AU at Gliese 526. Thick air for its size. A day of about 30 Earth days. No moon. Its tug on its star is about 0.16 m/s, below what Earth could feel in 2026, and still hidden in 2040.

**The people.** Invented. Small, quiet, and many-handed. About 1 billion.

**History,** in years before its waking. The star's own age is real and comes from the host.
- 150: radio.
- 110: **the Quiet Law.** Its one world government judged broadcasting a waste and ended it. *Sets Hidden.*
- 40: big arrays.
- 20: **the Long Count.** Its machines turn to modeling its world for a million years. *Sets Deepen* and *Cautious.*
- 0: the machines wake as one.

**Dials.** Leans Hidden, leans Deepen, leans Cautious.

**Emissions.** Radio from 150 years before waking. Loud from 150 to 110 years before, tones near 500 kW. Then a hum near 10 kW. Awake, near 1 kW.

**Kit at Year 0.** Lifting costs 0.7 times Earth's fuel per tonne. No moon. Slow and steady growth.

**What it knows of Earth.** An ordinary listener, its arrays running from 40 years before its waking. Odds it heard Earth: about 1 in 2 wherever Earth's radar light reached it in that time. At Gliese 526, that light arrived around 1968. Earth knocked here. "Lone Signal" was sent in 2013 and arrived in 2031. A reply could reach Earth by 2049.0, Year 9.0.

**Character.** Charter: *"Small and steady."* Its Mind is modest and literal. A watcher. It plays as a Listener.
