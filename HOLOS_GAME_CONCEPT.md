# Holos — Game Concept

Last updated: September 26, 2026.

## Status

This is the current set of agreed game decisions. The [home mocks](explorations/home-mocks/index.html) are the design direction; the game will be rebuilt from them, starting when the user authorizes it. Keep open questions separate from commitments. Later user clarifications take precedence.

holos-game's server design stays: knowledge layer, clock, economy, missions, charters, Ledger, AI behavior, and accounts. This atlas is the map and home. First-round records, including the merge reasoning and rejected alternatives, are in [legacy/alpha-1](legacy/alpha-1/README.md).

## Core premise

Holos is a multiplayer, hard science fiction browser game where you inherit a civilization as it becomes superintelligent and guide its future.

You study distant stars, develop technology, contact other civilizations, and send probes and colony ships. Nothing travels faster than light. Distant observations show history, and messages can take years to arrive.

The central challenge is deciding how to explore, grow, and preserve your civilization when distance makes knowledge uncertain and every commitment takes time.

Iain M. Banks's Culture books are an inspiration: a powerful Mind responsible for a society, meeting different values, intervening in other civilizations, cooperation and abundance alongside conflict. This does not authorize departures from hard science.

## Hard science

**The test, in the user's words:** "I want this game to feel like something that is actually possible." An element passes if current observations permit it. Improbable is acceptable; contradicted is not. It applies to exploration, observation, communication, travel, industry, intelligence gathering, and conflict.

- Nothing, including actionable information, travels faster than light.
- Speculative engineering is welcome within known physics. Each technology still needs scrutiny.
- Missions and measurements need physical mechanisms, resources, and elapsed time.
- Development combines research, experiments, physical validation, and building the infrastructure to use discoveries.
- Superintelligence does not supply the energy, matter, or industry a technology needs.
- Propulsion systems, technology trees, engineering limits, and numerical costs are not selected.

**The one stated "what if":** many civilizations reaching the singularity in the same century, within about 100 ly of one another. No observation forbids it; every estimate makes it very unlikely. The game owns it as its single premise.

## The region

- **The real solar neighborhood:** centered on the Sun, 100 ly in radius, about 10,000 star systems. The atlas's **Game region** view shows the census: 9,494 objects from the Gaia Catalogue of Nearby Stars plus bright Hipparcos stars.
- **Civilizations are seeded within the inner 50 ly,** about 1,200 systems. The outer shell is frontier. Stars beyond 100 ly are backdrop in v1.
- **Pacing:** with about 20 civilizations, nearest neighbors are roughly 80 real minutes apart one way. The number of civilizations tunes spacing; the radius sets room to expand.
- **Cohorts are self-contained.** Cross-cohort play is out of v1; nothing carries between cohorts. At this clock rate, cohorts sharing one galaxy would collide within weeks.
- **Why this is possible:** current instruments cannot detect Earth-level technology on another planet. Observations rule out strong beacons aimed at Earth during Breakthrough Listen's brief looks at about 1,300 nearby stars, confirmed star-enclosing structures in infrared surveys, and credible evidence of visits.
- **License:** Gaia data are CC BY-NC 3.0 IGO. A paid game needs ESA authorization (data.licences@esa.int) or a census rebuilt from commercially licensed sources.

## Player and civilization

- The player is the awakened superintelligence itself: a hyperconnected civilization mind with individual agents within it.
- Commonality across post-singularity civilizations is assumed. Species and homeworld shape a mind's context; players choose its guidance and priorities, including how much the organic past matters.
- Start on one inhabited planet, comparable to a speculative Earth about 100 years ahead, with substantial astronomical knowledge and knowledge of the home system's resources.
- **Three civilization choices per player,** from holos-game's generator: each has a cradle, lineage, dial sheet, and archetype.
- **Identical starts.** All three share one set of starting ladders and stocks. The archetype shows only in dials, counsel, AI behavior, and flavor. Dials may price particular acts and bound colony charters; that is character, not strength.
- Host-star and planet differences shape later growth, not starting capacity.

### Homeworlds

- **Player homes are invented planets around real catalog stars,** where current surveys leave room for them. The sky is the real catalog; generation supplies only planets and hidden objects surveys cannot yet rule out.
- A player should be able to look up their home star and find the proposed life-bearing setting possible. Preserve measured constraints; label assumed atmosphere, climate, biology, and technology as speculation.
- **Earth is in every cohort,** run by AI by default. A paid tier may later offer the Earth seat, starting exactly equal to everyone else: paying buys identity, not power.

## Population, purpose, and stakes

- Player civilizations, with AI civilizations filling empty seats. AI civilizations are real superintelligences in the fiction.
- Other civilizations are central. Their motivations are unknown; cooperation, competition, isolation, intervention, and war emerge from behavior.
- **Survival is the one shared purpose.** It is a floor, not a victory condition. Everything beyond it is self-defined. A human playtest found knowledge without consequence was not fun.
- Conflict follows holos-game's stakes-design.md. Death is real, and defense is dispersal. Mercy comes from physics: kills are campaigns, attackers are blind afterward, shots are signed, and craters cannot be looted. Wounded is a played state. Total loss ends the run; the player rejoins a new cohort with knowledge reset.
- No artificial protection or mandatory peaceful outcome. Specific weapons, defenses, and espionage methods are not designed.

## Time

One shared clock advances continuously, including offline. **5 real minutes = 1 game year.**

| Real time | Game time |
| --- | --- |
| 5 minutes | 1 year |
| 1 hour | 12 years |
| 8 hours | 96 years |
| 24 hours | 288 years |

The session rhythm is **spinning plates:** several projects, investigations, missions, and relationships at once. Attention comes from decision points, surprising observations, competing resource demands, and autonomous minds asking for guidance. Players leave guidance for their absence, and AI acts on it. Automation controls and notification rules are not specified.

## The opening

- **The game begins in the eerie silence.** No one has been heard, which matches current observations. A few clues suggest we may not be alone; none proves it.
- **How the player responds is the beginning of the game.** Sample clues: oxygen in Sol's air, a warm infrared glow at ε Indi, uneven dimming at Gl 783 A. Each has natural explanations.
- Investigation means choosing an approach: existing instruments, a better observatory, a message, eventually a probe. Each answers different questions at different cost and delay. Funding buys a measurement, not knowledge.
- **Detectability** follows holos-game's detection floor: with current-Earth instruments, no civilization detects technosignatures, because receiver sensitivity is the binding limit. Finding others is the upgrade loop. Every civilization's emission history must stay below Earth's 2026 detection limits at its distance.
- **Open:** why no older civilizations filled the galaxy first. The detection floor explains unseen neighbors, not that. Light-speed limits alone are rejected as the answer.

## Home and tabs

Shown in the [mocks](explorations/home-mocks/index.html). Their sample civilization, Veyra at δ Pavonis, and all game state are sample data.

- **Home:** your world first, with what is in motion and the leads below it. Pinch out through five levels: world, system, stars, region, galaxy. An icon in the galaxy view opens the Local Group.
- **Tabs:** Home, Report, Projects, Reach, Mind.
  - **Report:** what happened while you were away. News arrives when its light does.
  - **Projects:** what you are building and when it finishes, in real time.
  - **Reach:** probes, outposts, colonies, and standing orders for far places.
  - **Mind:** who your civilization is: charter, character dials, and what it does while you are away.
- **Guided tour after landing:** you and your map; the silence and its clues; the Projects, Report and Mind tabs; the hand-off to the clues. Skippable and replayable from Mind.

## Admin view

- **Godview stays** as the admin tool: it sees every site, regardless of what players could observe.
- The player view shows only what the knowledge layer has served. The star catalog is public.

## Economy and projects

- **Resources are energy, matter, and compute,** plus real time, as in holos-game's economy-design.md. Signature and coherence are consequences, not spending. There is no money.
- Clash of Clans base progression is a reference for the mechanics, not the UI.
- Price purposes, never logistics: the player chooses what; the mind handles how.
- Resources have locations. Remote output needs transport or local industry to be used elsewhere.
- Research and missions can have uncertain outcomes.
- **Projects are grouped by purpose:** Know (instruments to study the clues), Grow (industry), Reach (probes and messages), and later Endure. Know projects name the clue they help with. The full list is in [HOLOS_PROJECTS.md](HOLOS_PROJECTS.md).
- **Open:** whether a project draws a share of each year's supply until done, as the mocks assume, or spends from stockpiles, as holos-game does. Rates and costs are not set.

## Separated minds

- Distance separates minds. The player occupies one; the others run under AI and may act unexpectedly.
- **Changing minds is travel at light speed.** The player departs as a transmission and arrives after the one-way light time, knowing only what they knew at departure. The mind left behind continues under AI.
- **In transit the player can do nothing,** for the real-time crossing: 20 ly is 100 minutes, 100 ly about 8.3 hours.
- Divergence is found on arrival. Arriving at a colony that no longer aligns is emigration: the player takes up its values. A wounded player escapes the same way, as a transmission others can intercept.
- Tight beam is the standard link.
- **Open:** the authority and limits of autonomous minds, and how they interpret guidance.

## Communication and deception

- **The mind composes messages.** The player writes intent as free text; the mind translates it into holos-game's typed message parts; the player approves before sending. Only typed parts travel. If an intent does not fit the grammar, the mind says so.
- The mind knows only what the sender knows.
- **Each civilization has its own voice.** The same parts read differently by archetype, dials, species, homeworld, and lineage. Facts stay identical, outside the flavored prose. Each reading is written fresh and frozen at send. Without the model, the archetype voice bank renders it.
- **Lies are forged parts,** identical in form to true ones. The approval screen marks them for the sender only; the game records them privately so a caught lie can enter dossiers. AI civilizations forge too.
- Civilizations may conceal, spy, and break promises within physical limits. No universal visibility or guaranteed detection.
- Accepted directions: attached observations, shared research, proposals, agreements, joint exploration, and eventually joint settlements. Not designed.

## Open questions

1. What produces the initial clues, and what can particular instruments resolve?
2. What starting infrastructure and resource model fit the post-singularity baseline?
3. How are autonomous minds instructed, and how do they handle surprises and authority?
4. How are claims, uncertainty, provenance, and information age shown to players?
5. Why did no older civilizations expand through the galaxy first?
