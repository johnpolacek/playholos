# Holos — Game Concept and Decision Record

Last updated: September 7, 2026.

## Status and scope

This is a living record of the concept discussion, not an implementation plan or a description of completed game features. **Do not build the game yet.** We are developing the idea through questions and iteration, starting from the existing Holos map.

Record agreed decisions here as the discussion continues. Keep unanswered questions and illustrative possibilities separate from commitments. Later user clarifications take precedence over earlier suggestions.

## Core premise

Holos is a multiplayer, hard science fiction browser game where you inherit a civilization as it becomes superintelligent and guide its future across a persistent galaxy.

You study distant stars, develop technology, contact other civilizations, and send probes and colony ships. Nothing travels faster than light. Distant observations show history, and messages can take years to arrive.

The central challenge is deciding how to explore, grow, and preserve your civilization when distance makes knowledge uncertain and every commitment takes time.

Iain M. Banks's Culture books are an inspiration: being a powerful Mind responsible for a society, encountering different values, intervening in other civilizations, and the possibilities of cooperation and abundance alongside conflict. This inspiration does not authorize departures from the hard science constraint.

## Player identity and civilization

- The player is the awakened superintelligence itself.
- A civilization at this stage is hyperconnected, with a shared, unified civilization mind or process and individual agents within that structure.
- Large distances can separate that connected intelligence into distinct minds.
- There is assumed to be substantial commonality across post-singularity civilizations. Biology and organic history do not prescribe a fixed future.
- Players decide how much their civilization's organic past guides its future.
- A civilization's species and home planet can shape the context and nature of its minds, but players choose their guidance and priorities.

## Starting conditions and civilization choice

- Start on a single inhabited planet comparable to a speculative Earth roughly 100 years in the future, assuming a singularity event.
- Use substantial inherited astronomical knowledge and knowledge of the home system's planets and resource prospects as the starting baseline.
- Assume comparable technological capabilities among starting civilizations for now.
- Generate **three civilization choices** for each new player.
- Those choices should be mechanically equal. Their differences are primarily flavor: the nature of life, biology, home planet, and civilization background.
- Do not treat the three choices as different difficulty levels or bundles of strategic advantages.
- Physical resource circumstances may vary somewhat by planet. How to reconcile that variation with equal starts remains to be worked out.

## Multiplayer population and purpose

- The galaxy contains player civilizations, with AI-controlled civilizations filling player slots when there are not enough humans.
- Other civilizations are central to the game. This is not a potentially lifeless solo exploration premise.
- Civilizations have unknown motivations. Whether they cooperate, compete, isolate themselves, intervene, or go to war emerges from their behavior.
- Success is completely up to the players. Expansion, discovery, stewardship, wellbeing, diplomacy, and other ambitions are possibilities, not prescribed victory conditions.

## Hard science and speculative technology

**Hard science is a governing constraint, repeatedly emphasized in the discussion.** It applies to exploration, observation, communication, travel, industry, intelligence gathering, and conflict.

- Nothing, including actionable information, travels faster than light.
- Speculative engineering is welcome within known physics. Individual technologies still need scrutiny; a speculative idea is not automatically feasible merely because it sounds plausible.
- Missions and measurements must have physical mechanisms, resource requirements, and elapsed time.
- Technological development combines research into unknown possibilities with experiments, physical validation, and building the infrastructure to use discoveries.
- Superintelligence does not automatically provide the energy, matter, or industrial capacity required to realize a technology.
- Specific propulsion systems, technology trees, engineering limits, and numerical costs have not been selected.

## Shared time and session rhythm

Everyone shares one continuously advancing clock, including while offline.

**5 real minutes = 1 game year.**

| Real elapsed time | Game elapsed time |
| --- | --- |
| 5 minutes | 1 year |
| 15 minutes | 3 years |
| 1 hour | 12 years |
| 8 hours | 96 years |
| 24 hours | 288 years |

The intended session rhythm is **“spinning plates.”** Several projects, investigations, missions, and relationships unfold at once. Attention can be drawn by:

- Projects reaching decision points.
- Surprising observations and investigation results.
- Competing demands for resources.
- Autonomous minds requesting guidance.

Players can leave instructions and guidance for their absence. AI does its best to act on that guidance as circumstances develop. Exact automation controls, notification rules, and the consequences of particular unattended situations are not yet specified.

## Economy, projects, and missions

- Civilizations have some capacity level of energy and matter.
- Projects and missions can increase that capacity and enable more ambitious activity.
- Clash of Clans base progression is a reference for the mechanics, **not the UI**.
- Resources have physical locations. A remote resource operation does not instantly supply every other location; transport or local industry is needed to use its output elsewhere.
- Broad allocations and automated logistics are an acceptable way to make local resources manageable.
- Research and missions can have uncertain outcomes. Other civilizations' intentions and actions add uncertainty as well.
- Exact currencies, production rates, storage, construction queues, and logistics abstractions remain undecided.

## The map, leads, and investigation

The map primarily tells the player their place in the universe. Curiosity about other civilizations motivates spending resources on projects and missions to learn more.

- Players begin with some leads to investigate, rather than requiring an immediate confirmed contact.
- Leads should fit the scientific setting and observational constraints.
- Investigation involves meaningful choices of approach. Discussed and accepted options include using existing instruments, building a better observatory, sending a message, and eventually dispatching a probe.
- Different approaches answer different questions and incur different costs and delays.
- An investigation buys an actual measurement or mission; it does not automatically grant knowledge simply because it was funded.
- No specific opening signal, anomaly, target system, or mission has been chosen.
- The time to first confirmed discovery or reply remains open. The preference expressed so far is to start with leads.

## Fermi paradox and observational fidelity

The setting must accommodate engaging multiplayer while remaining faithful to current observations of the universe and the unresolved Fermi paradox. The user's framing is that life must be rare or hard to find enough to fit what we currently observe.

The discussion distinguished that design requirement from a scientific conclusion: the Fermi paradox does not prove life is rare, and a lack of confirmed detection is not a complete census of civilizations.

Research consulted during the discussion:

- [NASA: UAP FAQs](https://science.nasa.gov/uap/faqs/) states that NASA has not found credible evidence of extraterrestrial life.
- [Wright, Kanodia, and Lubar: How Much SETI Has Been Done?](https://arxiv.org/abs/1809.07252) examines the limited fraction of a modeled radio search space covered by searches. This is context for incomplete detection, not evidence that a particular civilization population exists.
- [SETI Institute: The Fermi Paradox](https://www.seti.org/research/seti-101/fermi-paradox/) explains the tension between possible galactic expansion over long timescales and the absence of obvious evidence.

No explanation for the Fermi paradox has been selected. In particular, light-speed limits alone have not been accepted as an explanation for the absence of older, widespread civilizations. Population density, separation, detectability, and historical context need further development.

## Separated minds and player location

- Minds can become separated by distance.
- The player must choose which mind to occupy.
- Changing occupied minds incurs the light-speed communication cost at the shared game clock rate. It is not instantaneous switching that carries the player's information across space.
- Tight-beam communication is the likely standard.
- Separated minds that the player is not occupying are controlled by AI.
- Players choose their instructions and guidance. The nature of the species and planet can influence the minds' context.
- Autonomous minds can act in unexpected ways depending on circumstances; their decisions are not guaranteed to match what the player would have done.
- The exact transfer process, what the player does during transit, copying versus migration, and the authority or binding limits of autonomous minds remain open.

## Communication and cooperation

The full range of communication and cooperation options is available in principle, subject to hard science constraints.

Discussed communication possibilities include unrestricted composed messages, attached observations, shared research, proposals, agreements, and diplomatic packages containing several of these together.

Discussed cooperation possibilities include exchanging knowledge, sharing observations, coordinating exploration, access to infrastructure, and eventually joint settlements. These are accepted directions, not implemented mechanics or a finalized feature list.

Transmission and travel delays remain part of these relationships. Specific agreement systems, exchange rules, and interfaces have not been designed.

## Deception, intelligence gathering, and conflict

- Civilizations may conceal information, lie, fabricate claims, and break promises as much as their capabilities and circumstances permit.
- Other civilizations can spy, observe, and acquire data under the same physical constraints. Intelligence gathering and assessing claims can be part of the fun.
- This does not establish universal visibility or guaranteed detection; methods and limits still need to be worked out.
- Players may be extremely aggressive or warlike. Conflict and its consequences should be guided by physics.
- No artificial protection, guaranteed survival, or mandatory peaceful outcome has been agreed.
- Weapons, defenses, espionage methods, defeat conditions, and what happens to a player after catastrophic loss remain unspecified.

## Open questions to carry forward

### Relationship to the Holos theory

The user introduced their theory in `docs/holos.pdf` as a source to evaluate, specifically its speculative ideas about aliens and technology. The PDF was located in the sibling `holos-game` project. [HOLOS_THEORY_EVALUATION.md](HOLOS_THEORY_EVALUATION.md) records the comparison, source page references, scientific qualifications, and proposed directions.

The Integration Hypothesis, Holosian scale, Dark Nodes, and named technologies are now discussion material. They have **not** automatically become agreed game mechanics or the selected explanation of the Fermi paradox. The evaluation's recommendations remain proposals; the decisions above still govern.

### Unresolved game questions

These are unresolved, not permission to start implementation:

1. What physical and historical setting supports the population of comparable civilizations while respecting observational limits and the Fermi paradox?
2. How far apart are civilizations, and how do those distances affect discovery, diplomacy, and travel at the agreed clock rate?
3. What produces initial leads, what evidence does each contain, and what can particular instruments actually resolve?
4. What starting infrastructure, resource model, and engineering capabilities fit the speculative post-singularity baseline?
5. How do planet-specific circumstances coexist with mechanically equal starting choices?
6. How exactly does occupying another mind work without creating a faster-than-light information channel?
7. How are autonomous minds instructed, and how do they interpret guidance, handle surprises, and exercise authority?
8. How are claims, observations, uncertainty, provenance, and information age represented for players?
9. What are the physical mechanics and player consequences of conflict, including catastrophic loss?

Continue developing these through conversation. **The current authorization is to explore and document the concept, not build it.**
