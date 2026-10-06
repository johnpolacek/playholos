# Holos · Neighbors

Last updated: October 6, 2026.

The hand-written roster of neighbors, and the template every one must fill. The rules behind it are in [HOLOS_GAME_CONCEPT.md](HOLOS_GAME_CONCEPT.md#the-neighbors). Each game's seed picks some of these neighbors, places each at a host star by weight, draws its waking time, and rolls its branches. The roster is still empty: v1's Veyra, Hael and Kesh are reworked into it next.

**How it is kept.** Each field says what it holds and how it is checked. Fields marked *seeded* are drawn per game. The rest are written by hand once. A neighbor that fails a check can't be placed. The checks are meant to run as a script, as v1's `leads.py` tested every lead on every build.

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
