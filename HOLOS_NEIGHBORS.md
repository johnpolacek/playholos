# Holos · Neighbors

Last updated: October 6, 2026.

The hand-written roster of neighbors, and the template every one must fill. The rules behind it are in [HOLOS_GAME_CONCEPT.md](HOLOS_GAME_CONCEPT.md#the-neighbors). Each game's seed picks some of these neighbors, places each at a host star by weight, draws its waking time, and rolls its branches. Veyra is reworked. Hael and Kesh follow.

**How it is kept.** Each field says what it holds and how it is checked. Fields marked *seeded* are drawn per game. The rest are written by hand once. Prose lives here. Numbers live in [calcs/neighbors.py](calcs/neighbors.py), which tests each neighbor at hundreds of seeded placements: a host star, a waking year and the way its orbit faces Sol. The seed draws only from placements that pass. Run `python3 calcs/neighbors.py`.

**What the script checks today:**
- the host kinds its people can live at
- mass under 10 Earth masses, and fuel per tonne lifted against Earth's
- orbit stable beside companions
- no transit seen from Sol
- its tug under 2026's 1 m/s, and whether Earth found it by 2040
- its tones under Breakthrough Listen's floor in 2017 and SKA-Mid's in 2040, after light delay Still by hand: the people, the timeline against the star's age, the dials' causes, the kit's growth, and the names.

**Self-test.** An Earth twin with Earth's real radar years, tested as steady tones at their 2×10¹¹ W along the beam, passes only 16% of placements: near Sol, Breakthrough Listen or SKA-Mid would have heard it. Real radar is pulsed and sweeps, so this overstates it, but the point holds: a neighbor as loud as Earth must be far away, or its loud years must have passed Sol before anyone listened.

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
| Since waking | What it has built and sent, if it woke before Earth. | Whatever light of it reached Earth by 2040 stays below Earth's limits. |

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
| Strategy | How its AI Will plays, toward its own ends, as v1's Listener, Caller and Grower did. | Within its dials. |
| Names | What it calls the stars bright in its sky, Sol among them. | Bright from where it sits. |

## The roster

### Veyra

Reworked from v1, 2026-10-06. Numbers in [calcs/neighbors.py](calcs/neighbors.py). The checker passes it at 99.5% of seeded placements. The rest fail only when its orbit would face Sol edge-on and transit.

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
