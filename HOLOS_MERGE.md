# Holos: merging the atlas into holos-game

September 25, 2026. Decision record and reconciliation worksheet.

## Decision (settled 2026-09-25)

**The atlas becomes the map and home centerpiece of holos-game's rebuilt client.** holos-game's server systems stay: the knowledge layer, clock, economy, missions, charters, Ledger, AI behavior, and accounts.

Why this direction:

- holos-game's August playtest failed, and Phase S condemned the client while keeping the server ([roadmap](../holos-game/docs/roadmap.md), § Phase S).
- The one element the playtest liked was "the spatial feeling of having a place in a real sky." The atlas is that element, built from real data.
- holos-game already planned a real-catalog sky: the HYG backdrop in [act3-map.md](../holos-game/docs/act3-map.md) and the "textbook sky" in [stakes-design.md](../holos-game/docs/stakes-design.md), § The two-layer sky.
- Starting over would discard a server that implements every Phase A system.

All six conflicts were settled on 2026-09-25. Integration work starts when the user authorizes it. Until then, [HOLOS_GAME_CONCEPT.md](HOLOS_GAME_CONCEPT.md)'s "do not build yet" still applies to game systems in this repository.

## Already agreed by both

- 5 real minutes = 1 game year, on one shared clock that runs while players are offline.
- Nothing, including information, travels faster than light. Every remote fact is stale.
- The player is the awakened mind of a post-singularity civilization.
- Players inherit a civilization; they do not start from nothing.
- AI civilizations fill empty seats and are real superintelligences in the fiction.
- Success beyond survival is defined by the player.
- Tight beam as the standard for communication.
- Current observations must stay consistent with the setting. holos-game's [vision](../holos-game/docs/vision.md) calls this a "consistency check."

## Conflicts to settle

Each item states both positions, a proposal, and its status. Proposals are recommendations, not decisions.

### 1. Where players live

- **holos-game:** civilizations sit in a generated star field with real statistics, 25 ly radius (`server/src/galaxy.ts`). Whether player geography uses the real neighborhood is an open question in act3-map.md. stakes-design.md separately settles a real "textbook sky" with a statistically seeded "dark sky."
- **holos-map:** every star is real, from HYG 4.1. A homeworld must be observationally compatible. Invented planets around real hosts are allowed and labeled.
- **Proposal:** homes are **invented planets around real catalog stars**, chosen where current surveys leave room for them. The sky players see is the real catalog. Generation supplies only planets and dark-sky objects that surveys cannot yet rule out.
- **Sub-question:** whether Earth is ever a player home. Only one player can have it, and it carries our real history. Proposal: Earth is not a home in cohort play. It remains the atlas reference point.
- **Status:** settled 2026-09-25, as proposed. The Earth sub-question was later reversed; see *The v1 region and Earth*, below.

### 2. The Fermi paradox

- **holos-game:** the S1 amendment settles a detection floor. Civilizations with current-Earth instruments detect no technosignatures, because receiver sensitivity is the binding limit. Finding others is the upgrade loop.
- **holos-map:** the setting must fit current observations. No explanation has been chosen. Light-speed limits alone are rejected. [HOLOS_THEORY_EVALUATION.md](HOLOS_THEORY_EVALUATION.md) flags the unexplained absence of older expanded lineages.
- **Proposal:** adopt the detection floor as the rule that keeps any cohort consistent with Earth's null results. Record the expansion problem as open. The floor explains why neighbors are not seen. It does not explain why no older civilizations filled the galaxy first.
- **Consequence for item 1:** a cohort within about 100 ly of Earth is acceptable only if every civilization's emission history stays below Earth's 2026 detection limits.
- **Status:** settled 2026-09-25, as proposed. The expansion problem remains open.

### 3. Starting civilization choices

- **holos-game:** three generated candidates per player, preferring distinct archetypes (`makeCandidates` in `server/src/cohort.ts`). Each has a cradle, lineage, dial sheet, and archetype. Starting ladders follow the archetype's lean, and stocks follow the ladders (`drawLadders` and `drawStocks` in `server/src/civseed.ts`). Most homeworlds are statistically common types, not Earth twins.
- **Finding:** the current candidates are not balanced. A balanced-lean candidate starts at energy 200, matter 320, compute 360, coherence 100. An energy-lean candidate starts at 200, 320, 240, 50. The balanced candidate is equal or better in every stock.
- **holos-map:** three choices, mechanically equal. The differences are flavor: biology, home planet, and background. Technology is comparable to a speculative Earth about 100 years from now.
- **Proposal:** keep the generator, the dial sheets, and the archetypes. They drive AI behavior, counsel, and flavor-specific prizes. Always offer three. Give a player's three candidates equal starting ladders and stocks, so the choice is about character, not strength.
- **Status:** settled 2026-09-25: identical start. All three candidates share one set of starting ladders and stocks. The lean appears only in dials, counsel, AI behavior, and flavor. Dials may still price particular acts and bound colony charters; that is character, not strength. Host-star and planet differences shape later growth, not starting capacity. Alternatives rejected: equal totals with a lean-specific mix, which is still a bundle of strategic advantages, and the current variation, where the balanced lean dominates the energy lean.

### 4. Stakes and purpose

- **holos-game:** settled after the failed playtest. Every civilization shares one purpose: continuing to exist. Death is real, conflict is in v1, and visibility has costs and benefits (stakes-design.md). The purpose is shown through the intro, not stated in text.
- **holos-map:** success is entirely up to players. There is no artificial protection. Weapons and defeat are unspecified.
- **Proposal:** add survival as a shared minimum to HOLOS_GAME_CONCEPT.md. It is a stake, not a victory condition. Everything beyond it stays self-defined. Record the playtest lesson there: knowledge without consequence was not fun.
- **Status:** settled 2026-09-25: adopt stakes-design.md whole. Survival is the shared floor, not a victory condition. Death is real, defense is dispersal, and mercy comes from physics: kills are campaigns, attackers are blind afterward, shots are signed, and craters cannot be looted. Wounded is a played state. Total loss ends the run, and the player rejoins a new cohort with knowledge reset. This answers HOLOS_GAME_CONCEPT.md open question 9.
- **Follow-up, settled 2026-09-25: cross-cohort play is out of v1.** v1 aims to make one cohort fun on its own terms. Each cohort is self-contained: nothing carries between cohorts, including stakes-design.md's cross-cohort ruins. A player whose run ends still rejoins a new cohort. Discussion noted why a single shared galaxy fails at this clock rate: one real day is 288 game years, light crosses the Milky Way in under a real year, and a 0.1c seedship crosses 1,000 ly in about 35 real days, so cohorts in one galaxy would collide within weeks.
- The v1 region was then settled; see *The v1 region and Earth*, below.

### 5. Separated minds

- **holos-game, vision.md:** one seat per player. Transmitting yourself forks the mind: stay, or become the arriving copy. A destroyed seat flees toward the nearest fork as a lightspeed transmission, visible and interceptable.
- **holos-game, stakes-design.md § The thread you play (settled 2026-08, scheduled for Phase S stage S2):** the player is a thread of continuity. Jumping is a camera move, never a transmission. A healthy jump is a question that resolves after the round-trip light time. A wounded player may jump instantly and blind into any colony. What the player leaves continues as an autonomous actor.
- **holos-map:** the player chooses which separated mind to occupy. Changing minds costs the light-speed communication time. It must not be instantaneous switching that carries the player's information across space.
- **The conflict:** the player is a human who remembers. Any jump that lands the player before light could have carried their knowledge is a faster-than-light channel. The instant wounded jump carries everything the player knew at home to the colony at once. The healthy jump waits a round trip at home, then lands instantly, so the colony receives knowledge from the waiting period sooner than light allows. The two holos-game documents also disagree with each other: transmission versus camera move.
- **Earlier proposal withdrawn:** this document first called the two models the same mechanic and out of v1. Both claims were wrong.
- **Status:** settled 2026-09-25: the player travels at light speed. A jump departs as a transmission and arrives after the one-way light time, carrying only what the player knew at departure. The mind left behind continues under AI from the moment of departure. **While in transit the player can do nothing**, for the real-time equivalent of the crossing: at 5 real minutes per light-year, 20 ly is 100 minutes and 100 ly about 8.3 hours. That lockout is the cost of moving. Divergence is discovered on arrival: arriving at a colony that no longer aligns is emigration, taking up its values. A wounded player escapes the same way, as a transmission others can observe and intercept. This replaces stakes-design.md's camera-move jump, round-trip question, and instant wounded jump. Alternatives rejected: keeping the faster-than-light leak as a convenience, and instant jumps restricted to the colony's view, which cannot erase the player's memory.

### 6. Messages between human players

- **holos-game, as built (systems-a.md §14):** composed signals only, for humans and AI alike. Freeform text was retired game-wide because it let a sender tell humans from AI. The client sends selectors and the server materializes each part from the sender's real state, frozen at send. Seven part kinds: finding, sighting, archive, culture, request, verdict, accord. Five tones. Fabrication is structurally impossible; deception is selection, omission, tone, and timing. Caps: one hail and 24 signals per pair, ever.
- **holos-game, stakes-design.md § Lying has three tenses:** the past is unfakeable because the sky keeps receipts; masking the present costs upkeep; promises are free and breakable. False flags are permitted but expensive.
- **holos-map:** civilizations may conceal, lie, fabricate claims, and break promises as far as capability allows. Assessing claims is part of the fun. Accepted directions include composed messages, attached observations, shared research, proposals, agreements, and packages.
- **The conflict:** fabricated claims. Concealment, broken promises, and false flags already exist in holos-game. A false finding or sighting cannot be sent.
- **Proposal (the user's, 2026-09-25):** the player writes intent as free text. The civilization's mind, the same LLM agent that guides the game, translates it into composed parts, including forged ones. The player approves the translation before it is sent. Refinements proposed with it:
  - The mind outputs typed parts only: part kinds, selectors, parameters, and tone. No generated or player-written prose travels, so the moderation posture and the voice-bank rendering both hold.
  - The mind's prompt is bounded by the sender's knowledge, as the AV4 counsel seam already is. It must never see truth the player lacks, or a forgery could come out accidentally true.
  - The approval screen shows the message exactly as the receiver will see it, with forged parts marked for the sender only.
  - If the intent does not fit the grammar, the mind says so instead of approximating.
  - Forged parts look identical in form to true ones. The act log records privately which parts were forged, so a caught lie can enter dossiers.
  - AI civilizations can forge through the same part kinds, preserving indistinguishability.
  - The existing manual composer remains the fallback when the model is unavailable.
- **Status:** settled 2026-09-25: the mind translates free-text intent into typed parts, including forged parts, for approval before sending, with the refinements above. Only typed parts travel. Rejected: letting the mind write the message prose itself.
- **Flavor (the user's addition, settled in principle 2026-09-25):** the same parts read differently from different civilizations.
  - Today a signal's fact-free body is drawn from a voice bank per archetype, so ten archetypes means ten voices. Flavor extends this to each civilization's own character: archetype, dials, species, homeworld, and lineage.
  - Facts stay identical across civilizations and sit outside the flavored prose, in the instrument register. Honesty checks by geometry keep working.
  - The player shapes flavor only through structured choices such as tone. Player text never reaches the renderer, so it cannot be steered.
  - The reading is rendered and frozen at send, and the approval screen shows it exactly. AI civilizations use the same renderer.
  - A distinctive voice identifies the sender more than an archetype voice does. holos-game already accepts that speaking discloses the archetype family.
  - **Settled 2026-09-25: each message is written fresh.** The model renders each reading from the typed parts and the sending civilization's character, and the reading is frozen at send. When the model is unavailable, the existing archetype voice bank renders it instead. Rejected: a voice pool generated once per civilization, which is cheaper but repeats over a long game.

## The v1 region and Earth (settled 2026-09-26)

**The guiding test, in the user's words:** "I want this game to feel like something that is actually possible." A setting element passes if current observations permit it. Improbable is acceptable; contradicted is not.

- **The region is the real solar neighborhood, centered on the Sun, 100 ly in radius.** About 10,000 star systems, estimated by scaling the census of stars within 10 pc.
- **Civilizations are seeded within the inner 50 ly,** about 1,200 systems. The outer shell is frontier for expansion and prizes. Stars beyond 100 ly are visible backdrop, not destinations, in v1.
- **Pacing:** with about 20 civilizations, nearest neighbors sit roughly 80 real minutes apart, one way. Neighbor spacing is tuned by the number of civilizations; the radius sets room to expand.
- **Earth is present in every cohort,** run by AI by default. This reverses item 1's Earth sub-question. A paid tier may later let a player take the Earth seat. Earth then starts exactly equal to every other civilization, as item 3 requires: paying buys identity, not power. The atlas's *Terran Continuity* home preview is the starting point for that seat.
- **Why this is possible:** no observation rules out a quiet civilization even at Alpha Centauri. Current instruments cannot detect Earth-level technology on another planet. Observations rule out strong beacons aimed at Earth during Breakthrough Listen's brief looks at about 1,300 nearby stars, confirmed star-enclosing structures in infrared surveys, and credible evidence of visits. Item 2's detection floor enforces this per distance; civilizations at the nearest few stars must have been quieter than Earth's own radio leakage.
- **The one stated "what if":** many civilizations reaching the singularity in the same century, all within about 100 ly of one another. Nothing observed forbids it; every estimate makes it very unlikely. The concept owns it as the game's single premise rather than hiding it.
- **Rejected:** a 25 ly region, which felt too limiting, and a region offset from the Sun, which kept Earth out of play.

**Costs:**

- holos-game's generated field (`server/src/galaxy.ts`) is replaced by real stars. The knowledge layer and most server logic are unaffected.
- Tunings sized for a 25 ly field need revisiting, including the seat separation floor and the 20 ly standing-order trigger.
- HYG misses many faint red dwarfs at these distances. The region needs a complete census, such as Gaia's catalog of nearby stars.

## Technical integration

These are notes for later, not decisions.

| Area | holos-game today | Atlas today | Proposed direction |
| --- | --- | --- | --- |
| Renderer | Pixi 2D stage with a hand-rolled orbit camera, `client/src/model.ts` (about 3,000 lines) | Three.js scene, floating origin, logarithmic depth, GSAP flights | Atlas scene replaces the Model's renderer; the DOM interface stays |
| Stars | About 260 generated stars per cohort | 109,400 HYG stars, embedded | A complete census of the 100 ly region for play; HYG as streamed backdrop |
| Delivery | Vite client, Cloudflare Worker | Single HTML files, 10–12 MB | Split data out of the bundle; phone first render budget |
| Frame | Light-years, cohort-centered | AU and light-years, Galactic axes | One shared frame: Galactic coordinates in light-years |
| Style | Adopted concept-art plates | Line art default, color edition | Open, a design call after the merge |
| Truth | Server knowledge layer decides what is visible | Admin sees everything | Catalog is public; everything else comes through the knowledge layer |

Godview remains an admin tool. The player view must render only what the knowledge layer has served.

## Next steps

1. ~~Settle conflicts 1–6.~~ Done 2026-09-25.
2. ~~Record the outcomes in HOLOS_GAME_CONCEPT.md and holos-game's docs.~~ Done 2026-09-26: roadmap.md, stakes-design.md, vision.md, and act3-map.md carry dated amendments.
3. ~~Import a complete nearby-star census for the 100 ly region.~~ Done 2026-09-26: 9,494 objects from the Gaia Catalogue of Nearby Stars plus bright Hipparcos stars, shown in the atlas's **Game region** view.
   - **License, open:** Gaia data are CC BY-NC 3.0 IGO. The free atlas qualifies as non-commercial use. A paid game using this census needs prior authorization from ESA (data.licences@esa.int), or a census rebuilt from sources licensed for commercial use.
4. Prototype: the atlas renders one real cohort served by holos-game's server.
