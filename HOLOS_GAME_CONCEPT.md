# Holos — Game Concept and Decision Record

Last updated: September 25, 2026.

## Status and scope

This is a living record of the concept discussion, not an implementation plan or a description of completed game features. **Do not build the game yet.** We are developing the idea through questions and iteration, starting from the existing Holos map.

Record agreed decisions here as the discussion continues. Keep unanswered questions and illustrative possibilities separate from commitments. Later user clarifications take precedence over earlier suggestions.

**Merge decision (September 25, 2026):** this atlas becomes the map and home centerpiece of the sibling holos-game client; holos-game's server systems stay. [HOLOS_MERGE.md](HOLOS_MERGE.md) records six conflicts with holos-game's settled design and how each was resolved on September 25, 2026. The resolutions are folded into the sections below, marked **(merge, 2026-09-25)**; HOLOS_MERGE.md keeps the full reasoning and rejected alternatives.

The user subsequently requested an exploratory **admin godview of ten player worlds on the map**, comparing observationally grounded possibilities with speculation. This authorizes a placement visualization, not construction of the game systems. [HOLOS_PLAYER_PLACEMENT.md](HOLOS_PLAYER_PLACEMENT.md) records two provisional layouts and their communication times. Neither layout is a final population or starting-world decision.

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
- **(merge, 2026-09-25)** The three choices come from holos-game's generator, each with a cradle, lineage, dial sheet, and archetype. All three share one set of starting ladders and stocks. The archetype's lean appears only in dials, counsel, AI behavior, and flavor. Dials may still price particular acts and bound colony charters; that is character, not strength.
- **(merge, 2026-09-25)** Host-star and planet differences shape later growth, not starting capacity.

### Observational compatibility of starting worlds

- The user wants players to be able to look up a real home planet and find that the proposed life-bearing setting is scientifically possible. Merely being a detected planet is insufficient.
- Do not place a civilization on a world whose established conditions contradict its proposed life and environment. Preserve measured constraints; describe any assumed atmosphere, climate, biology, and technology as speculation.
- Invented planets in distant, incompletely surveyed systems are welcome, subject to known observational constraints. A real host with an invented planet and an entirely invented system are distinct cases and should be labeled separately.
- Proposed real sites need a source-backed habitability case with its assumptions and adverse evidence recorded. This is an implementation criterion for the user's compatibility requirement, not a claim that the provisional shortlist is proven habitable. New evidence can require replacing a site or revising its fictional environment.
- The admin's two layouts are alternatives for the **same ten hypothetical player slots**. They do not distinguish the player from other players, observed civilizations from hidden civilizations, or humans from AI. Either kind of site could host any player slot.
- Observational grounding and population spacing are independent choices. Invented worlds need not be separated by galactic distances; no final spacing has been chosen.
- **(merge, 2026-09-25)** Player homes are invented planets around real catalog stars, placed where current surveys leave room for them. The sky players see is the real catalog; generation supplies only planets and hidden objects that surveys cannot yet rule out.
- **(2026-09-26)** Earth is present in every cohort, run by AI by default. A paid tier may later offer the Earth seat, starting exactly equal to every other civilization. This reverses an earlier merge decision that Earth would never be a player home.
- **(merge, 2026-09-25)** Cross-cohort play is out of v1. Each cohort is self-contained, and v1 aims to make one cohort fun on its own terms.
- **(2026-09-26)** The v1 region is the real solar neighborhood: centered on the Sun, 100 ly in radius, about 10,000 star systems. Civilizations are seeded within the inner 50 ly; the outer shell is frontier. Stars beyond 100 ly are backdrop in v1. With about 20 civilizations, nearest neighbors are roughly 80 real minutes apart one way.
- **(2026-09-26)** The setting's single stated "what if": many civilizations reaching the singularity in the same century within about 100 ly of one another. No observation forbids it; every estimate makes it very unlikely.

## Multiplayer population and purpose

- The galaxy contains player civilizations, with AI-controlled civilizations filling player slots when there are not enough humans.
- Other civilizations are central to the game. This is not a potentially lifeless solo exploration premise.
- Civilizations have unknown motivations. Whether they cooperate, compete, isolate themselves, intervene, or go to war emerges from their behavior.
- Success is completely up to the players. Expansion, discovery, stewardship, wellbeing, diplomacy, and other ambitions are possibilities, not prescribed victory conditions.
- **(merge, 2026-09-25)** Survival is the one purpose every civilization shares. It is a floor, not a victory condition. This adopts holos-game's stakes-design.md after a human playtest found knowledge without consequence was not fun.

## Hard science and speculative technology

**Hard science is a governing constraint, repeatedly emphasized in the discussion.** The user's test (2026-09-26): "I want this game to feel like something that is actually possible." An element passes if current observations permit it; improbable is acceptable, contradicted is not. It applies to exploration, observation, communication, travel, industry, intelligence gathering, and conflict.

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

### The opening (2026-09-26)

- **The game begins in the eerie silence.** No one has been heard, which matches current observations. A few clues suggest we may not be alone, and none proves it.
- **How the player responds to those clues is the beginning of the game.** Sample clues in the mocks: oxygen in Sol's air, a warm infrared glow at ε Indi, uneven dimming at Gl 783 A. Each has natural explanations.
- **Home screen:** your world first, with what is in motion and the leads below it. Pinch out through five levels: world, system, stars, region, galaxy. A small icon in the galaxy view opens the Local Group for perspective.
- **After landing, a short guided tour:** you and your map; the eerie silence and its clues; the Projects, Report and Mind tabs; then the hand-off to the clues. The rest of Home is left to discovery. The Projects tab is to be reworked so that it shows how time works. The tour is skippable and replayable.
- Mocks: `explorations/home-mocks/index.html`, one page generated by `build-zoom.py`.

## Fermi paradox and observational fidelity

The setting must accommodate engaging multiplayer while remaining faithful to current observations of the universe and the unresolved Fermi paradox. The user's framing is that life must be rare or hard to find enough to fit what we currently observe.

The discussion distinguished that design requirement from a scientific conclusion: the Fermi paradox does not prove life is rare, and a lack of confirmed detection is not a complete census of civilizations.

Research consulted during the discussion:

- [NASA: UAP FAQs](https://science.nasa.gov/uap/faqs/) states that NASA has not found credible evidence of extraterrestrial life.
- [Wright, Kanodia, and Lubar: How Much SETI Has Been Done?](https://arxiv.org/abs/1809.07252) examines the limited fraction of a modeled radio search space covered by searches. This is context for incomplete detection, not evidence that a particular civilization population exists.
- [SETI Institute: The Fermi Paradox](https://www.seti.org/research/seti-101/fermi-paradox/) explains the tension between possible galactic expansion over long timescales and the absence of obvious evidence.

No explanation for the Fermi paradox has been selected. In particular, light-speed limits alone have not been accepted as an explanation for the absence of older, widespread civilizations. Population density, separation, detectability, and historical context need further development.

**(merge, 2026-09-25)** Detectability is settled by holos-game's detection floor: a civilization with current-Earth instruments detects no technosignatures, because receiver sensitivity is the binding limit. Finding others is the upgrade loop. A cohort near Earth is acceptable only if every civilization's emission history stays below Earth's 2026 detection limits. The floor explains why neighbors are not seen; it does not explain why no older civilizations filled the galaxy first. That expansion problem remains open.

## Separated minds and player location

- Minds can become separated by distance.
- The player must choose which mind to occupy.
- Changing occupied minds incurs the light-speed communication cost at the shared game clock rate. It is not instantaneous switching that carries the player's information across space.
- Tight-beam communication is the likely standard.
- Separated minds that the player is not occupying are controlled by AI.
- Players choose their instructions and guidance. The nature of the species and planet can influence the minds' context.
- Autonomous minds can act in unexpected ways depending on circumstances; their decisions are not guaranteed to match what the player would have done.
- **(merge, 2026-09-25)** Changing minds is travel at light speed. The player departs as a transmission and arrives after the one-way light time, knowing only what they knew at departure. The mind left behind continues under AI from the moment of departure.
- **(merge, 2026-09-25)** While in transit the player can do nothing, for the real-time equivalent of the crossing: 20 ly is 100 minutes, 100 ly about 8.3 hours. The lockout is the cost of moving.
- **(merge, 2026-09-25)** Divergence is discovered on arrival. Arriving at a colony that no longer aligns is emigration: the player takes up its values. A wounded player escapes the same way, as a transmission others can observe and intercept.
- The authority or binding limits of autonomous minds remain open.

## Communication and cooperation

The full range of communication and cooperation options is available in principle, subject to hard science constraints.

Discussed communication possibilities include unrestricted composed messages, attached observations, shared research, proposals, agreements, and diplomatic packages containing several of these together.

Discussed cooperation possibilities include exchanging knowledge, sharing observations, coordinating exploration, access to infrastructure, and eventually joint settlements. These are accepted directions, not implemented mechanics or a finalized feature list.

Transmission and travel delays remain part of these relationships. Specific agreement systems, exchange rules, and interfaces have not been designed.

**(merge, 2026-09-25)** Messages are composed by the civilization's mind. The player writes intent as free text; the mind, the same LLM agent that guides the game, translates it into holos-game's typed message parts, and the player approves the result before sending. Only typed parts travel; no player-written or generated text is sent as content. The mind knows only what the sender knows, and says so when an intent does not fit the grammar.

**(merge, 2026-09-25)** Each civilization has its own voice. The same parts read differently from different civilizations, shaped by archetype, dials, species, homeworld, and lineage. Facts stay identical and sit outside the flavored prose. Each reading is written fresh by the model and frozen at send; the approval screen shows it exactly. AI civilizations use the same renderer.

## Deception, intelligence gathering, and conflict

- Civilizations may conceal information, lie, fabricate claims, and break promises as much as their capabilities and circumstances permit.
- **(merge, 2026-09-25)** Fabricated claims are forged message parts, identical in form to true ones. The mind builds them from the player's intent, the approval screen marks them for the sender only, and the game privately records them so a caught lie can enter dossiers. AI civilizations can forge too.
- Other civilizations can spy, observe, and acquire data under the same physical constraints. Intelligence gathering and assessing claims can be part of the fun.
- This does not establish universal visibility or guaranteed detection; methods and limits still need to be worked out.
- Players may be extremely aggressive or warlike. Conflict and its consequences should be guided by physics.
- No artificial protection, guaranteed survival, or mandatory peaceful outcome has been agreed.
- **(merge, 2026-09-25)** Conflict follows holos-game's stakes-design.md. Death is real, and defense is dispersal. Mercy comes from physics: kills are campaigns, attackers are blind afterward, shots are signed, and craters cannot be looted. Wounded is a played state. Total loss ends the run, and the player rejoins a new cohort with knowledge reset.
- Specific weapons, defenses, and espionage methods remain to be designed.

## Open questions to carry forward

### Relationship to the Holos theory

The user introduced their theory in `docs/holos.pdf` as a source to evaluate, specifically its speculative ideas about aliens and technology. The PDF was located in the sibling `holos-game` project. [HOLOS_THEORY_EVALUATION.md](HOLOS_THEORY_EVALUATION.md) records the comparison, source page references, scientific qualifications, and proposed directions.

The Integration Hypothesis, Holosian scale, Dark Nodes, and named technologies are now discussion material. They have **not** automatically become agreed game mechanics or the selected explanation of the Fermi paradox. The evaluation's recommendations remain proposals; the decisions above still govern.

### Unresolved game questions

These are unresolved, not permission to start implementation:

Items resolved or narrowed by the merge are marked.

1. *(Narrowed: detection floor adopted; the expansion problem remains.)* What physical and historical setting supports the population of comparable civilizations while respecting observational limits and the Fermi paradox?
2. *(Resolved for v1: Sun-centered 100 ly region, civilizations within 50 ly.)* How far apart are civilizations, and how do those distances affect discovery, diplomacy, and travel at the agreed clock rate?
3. What produces initial leads, what evidence does each contain, and what can particular instruments actually resolve?
4. What starting infrastructure, resource model, and engineering capabilities fit the speculative post-singularity baseline?
5. *(Resolved: identical starts; planets shape later growth.)* How do planet-specific circumstances coexist with mechanically equal starting choices?
6. *(Resolved: light-speed transit with a lockout.)* How exactly does occupying another mind work without creating a faster-than-light information channel?
7. How are autonomous minds instructed, and how do they interpret guidance, handle surprises, and exercise authority?
8. How are claims, observations, uncertainty, provenance, and information age represented for players?
9. *(Resolved in principle: stakes-design.md adopted.)* What are the physical mechanics and player consequences of conflict, including catastrophic loss?

Continue developing these through conversation. **The current authorization is to explore and document the concept, not build it.**
