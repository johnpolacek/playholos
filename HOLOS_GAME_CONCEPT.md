# Holos — Game Concept

Last updated: September 28, 2026.

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

- **Nothing travels faster than light in a way that violates physics (2026-09-28).** No matter, message or influence outruns light. Things that only seem faster carry nothing: entangled particles stay correlated, but no message rides on that. Relativity's real effects are in play: a fast traveler's own clock runs slow, so it ages less than those it left. Warp drives and wormholes are out (2026-09-28): they need negative energy that physics has only seen in traces, and any faster-than-light trip could carry a message into its own past.
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
- **Choosing (2026-09-28):** the three sit side by side: real star, invented world and people, founding line, and dials. None is preselected. The player looks closer at one, keeps or changes its name, and accepts its founding line. The choice holds for the cohort. The mocks' candidates are Veyra (Delta Pavonis), Sael (70 Ophiuchi A) and Maren (Chara); surveys leave room for all three worlds.
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

The session rhythm is **spinning plates:** several projects, investigations, missions, and relationships at once. Attention comes from decision points, surprising observations, competing resource demands, and autonomous minds asking for guidance. Players leave guidance for their absence, and AI acts on it. Notification rules are not specified.

- **Standing orders (2026-09-28):** written like a message. The player says what they want; the mind shows exactly what it will do (when, if, do, otherwise) and which order it overrides, then tries it on the player's last absence. Orders for a far mind cross at light speed, can't be recalled, and are read in that mind's own moment. Until one lands, the far mind follows the orders it has.

**On screen, two clocks have two voices.** Game time is words in the interface sans: *18 Years*, *Year 12*, *light that left 9 Years ago*. Real time is a countdown in the mono: `01:30:00`, `2d 04:10:00`, and past a year `24y 19d`. Where both apply, years sit above the countdown. Only running items tick; a fixed duration reads `01:30:00`.

## The opening

- **The game begins in the eerie silence.** No one has been heard, which matches current observations. A few clues suggest we may not be alone; none proves it.
- **How the player responds is the beginning of the game.** Sample clues, by Veyra's names: an oxygen world at Twin (Sol), a new warm infrared glow at Ember (Epsilon Indi), uneven dimming at Lantern (Gliese 783 A). Each has natural explanations.
- Investigation means choosing an approach: existing instruments, a better observatory, a message, eventually a probe. Each answers different questions at different cost and delay. Funding buys a measurement, not knowledge.
- **Detectability** follows holos-game's detection floor: with current-Earth instruments, no civilization detects technosignatures, because receiver sensitivity is the binding limit. Finding others is the upgrade loop. Every civilization's emission history must stay below Earth's 2026 detection limits at its distance.
- **Open:** why no older civilizations filled the galaxy first. The detection floor explains unseen neighbors, not that. Light-speed limits alone are rejected as the answer.

## Home and tabs

Shown in the [mocks](explorations/home-mocks/index.html). Their sample civilization, Veyra at δ Pavonis, and all game state are sample data.

- **Home:** your world first, with what is in motion and the leads below it. Pinch out through five levels: world, system, stars, region, galaxy. An icon in the galaxy view opens the Local Group.
- **Star names:** stars bright in your civilization's night sky carry its own names, shown translated, with the real name smaller beneath: *Ember*, over *Epsilon Indi*. Faint stars keep their catalog names, since no one named what they could not see. Your own star keeps its real name; it anchors where you are. Names differ by civilization.
- **Projects on the map:** each project appears where it physically is, at the zoom level where that place is visible, with its countdown timer. Off-screen projects get edge markers. Drawings are symbols, not to scale. While building, a project is a blueprint that fills in; when finished it is drawn in full.
- **Tabs:** Home, Report, Projects, Reach, Mind.
  - **Report:** what happened while you were away. News arrives when its light does.
    - **Coming back (2026-09-28):** the Report opens on how long you were away, the big things, what the mind did under your standing orders, and what waits for you. The map can replay the absence in a minute. When nothing is new, it shows what is already on its way, soonest first.
  - **Projects:** what you are building and when it finishes, in real time.
  - **Reach:** probes, outposts, colonies, and standing orders for far places.
    - **Probes show their whole journey before launch (2026-09-28):** build, flight at a tenth of light speed, and the report crossing back, each in game years and real time. The launch is visible to anyone watching; in flight a probe is nearly invisible. A flyby can't stop, and nothing can be recalled after launch.
    - **Eight kinds of probe, unlocked over a game (2026-09-28):** flyby, chip swarm, sentinel, lurker, starlight sail, torch, seed and antimatter. Each trades speed, stopping and being seen. What works depends on the target: a sail can brake on starlight only at a bright star.
  - **Mind:** who your civilization is: charter, character dials, and what it does while you are away.
- **The mind advises only when asked (2026-09-28).** Decision screens show options and consequences, never a recommendation. *Talk it through with the mind* opens Mind with the decision pinned: the player asks, the mind answers from what the civilization knows, and gives its own view when asked, shaped by charter and dials. It can disagree. The decision can be made there, and the clock keeps running while they talk. Stated costs of character, like a mind that would argue against naming itself, still show.
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
- **Energy and compute are yearly budgets; matter is a stockpile (2026-09-26).** Energy and compute cannot be stored at planetary scale, so a running project takes a share of each year's supply; what a year does not use is lost, and pausing frees the share. Matter can be stored: a project draws its matter once when it starts, and mines refill the pile, including while the player is away. Rates and amounts are sample values.
- **Every civilization starts with a kit (2026-09-28):** Earth's instruments and industry today, plus about a century. A whole-sky watch in light and radio, a large space telescope, star surveys that already know the nearest stars' big planets, a continent-wide radio array, a planetary grid and data centers (the 100% energy and compute budgets), mines and reusable heavy lift, laser links across the home system, and precursor probes heading out. The kit is what found the opening clues, and it catches strong knocks. Catalog projects are upgrades beyond it.
- **Matter is counted in kilotonnes (2026-09-28):** 1,240 kt on hand at the start, +40 kt a year. Tonnes were too small for a civilization a century past today's launch rates.
- **Over budget, the game stops and offers ways forward (2026-09-26).** A project that would take energy or compute past 100% cannot start. The player can start it when there is room (it joins Up next), pause something to make room, or grow capacity first. No option is suggested. Projects never silently slow each other down.
- **Up next starts projects on its own (2026-09-26).** Queued projects start as soon as their energy, compute and matter fit, top first, including while the player is away.
- **Matter paces the big works (2026-09-26).** Second-tier works cost millions of tonnes, so the first one, the orbital foundry, lands about 6.5 real hours into the game (around Year 80). Matter is meant to be the slow part.

## Separated minds

- Distance separates minds. The player occupies one; the others run under AI and may act unexpectedly.
- **Changing minds is travel at light speed.** The player departs as a transmission and arrives after the one-way light time, knowing only what they knew at departure. The mind left behind continues under AI.
- **In transit the player can do nothing,** for the real-time crossing: 20 ly is 100 minutes, 100 ly about 8.3 hours.
- Divergence is found on arrival. Arriving at a colony that no longer aligns is emigration: the player takes up its values. A wounded player escapes the same way, as a transmission others can intercept.
- Tight beam is the standard link.
- **Meeting in person (2026-09-28):** minds talk live only when close. Every way to get close is offered, each with what it needs and when it could happen: meet a craft carrying one of their minds, host their mind sent as light on sealed machines, send ours as light, or both send craft halfway. Close in, answers return in under a second of real time, and the clock keeps running. A craft's mind speaks for home as of the last word that reached it.
- **Open:** the authority and limits of autonomous minds, and how they interpret guidance.

## Communication and deception

- **The mind composes messages.** The player writes intent as free text; the mind translates it into holos-game's typed message parts; the player approves before sending. Only typed parts travel. If an intent does not fit the grammar, the mind says so.
- The mind knows only what the sender knows.
- **Each civilization has its own voice.** The same parts read differently by archetype, dials, species, homeworld, and lineage. Facts stay identical, outside the flavored prose. Each reading is written fresh and frozen at send. Without the model, the archetype voice bank renders it.
- **Broadcasting (2026-09-28):** a broadcast goes every way at once and carries its own address. It is composed like any message, but no reader is known, so it goes in our own voice. Before sending, the player sees who hears it and when, and who already knows where we are. Sending can stop; what has left keeps going. Sending takes a share of each year's energy (sample value).
- **Lies are forged parts,** identical in form to true ones. The approval screen marks them for the sender only; the game records them privately so a caught lie can enter dossiers. AI civilizations forge too.
- **A received message reads voice first, then parts (2026-09-28).** The sender's prose comes first, as the mind reads it; the parts follow as facts. A finding shows how it would move our odds if true, and how to check it ourselves. When composing, the mind lists what will travel, what was left out and why, and how the recipient will read it.
- **A claim can be checked, at a cost in time (2026-09-28).** Checking uses our own instruments and lands in the Report. It can hold or fail. A failed check shows how likely a lie is against honest causes like older light, never a verdict. Each conversation keeps a record both ways: what we know about them, and what they know about us.
- Civilizations may conceal, spy, and break promises within physical limits. No universal visibility or guaranteed detection.
- Accepted directions: attached observations, shared research, proposals, agreements, joint exploration, and eventually joint settlements. Not designed.

## First contact

- **Twenty ways it can begin, in six families (2026-09-28).**
  - *We notice them:* a clue confirmed as technology, a launch flare, an overheard broadcast, a tip-off from a third party, our probe arriving.
  - *They notice us:* a bare knock, a named knock, a broadcast shell sweeping past, a visitor probe braking into our system, a far mind of ours met them first.
  - *Both at once:* crossed knocks, mutual watching.
  - *No conversation possible:* a young world, the silent one, a letter from the dead, an old watcher.
  - *Danger:* the mask, the bait, the strike.
  - *Earth,* the oxygen world at Twin for Veyra.
- **No guaranteed timing (2026-09-28).** First contact emerges from seeding and behavior; the game does not arrange one early.
- **A first contact can be a strike (2026-09-28).** No protection. Physics still requires the attacker to have found you first.
- **Earth's character is random per cohort (2026-09-28),** like any other seat, so no one can plan around it.
- **Physics notes.** Narrow beams cannot be overheard, except beside the sender or the target: anyone next to our probe learns which way its reports go, and so where we are. Broadcasts can be overheard anywhere. A coasting probe is nearly invisible; braking is bright. Ancient probes must be rare, since none has been found at Sol.
- **A knock carries its own evidence.** A frequency tuned to the receiver's motion shows it was aimed. Its send date bounds when the sender found you: they saw light that left you at least one light-time before they sent.

## Open questions

1. What can particular instruments resolve, clue by clue? The starting kit produces the initial clues.
2. What are the starting kit's exact stocks and rates? Its contents are set; its numbers are sample values.
3. How far does an autonomous mind's authority reach, and how does it handle surprises? Standing orders set how it is instructed.
4. How are claims, uncertainty, provenance, and information age shown to players?
5. Why did no older civilizations expand through the galaxy first?
