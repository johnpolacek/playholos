# Holos · Voices

Last updated: October 10, 2026.

Briefs for each neighbor's voice bank. A voice bank is the prose a neighbor's messages are read in, as [How neighbors play](HOLOS_GAME_CONCEPT.md#how-neighbors-play) sets. Each brief, with the neighbor's entry in [HOLOS_NEIGHBORS.md](HOLOS_NEIGHBORS.md#the-roster), is the input for writing its bank once, by Claude Opus 5.5, then reviewed by hand.

## What a bank holds

- **Lines for each of the seven part kinds.** A part is a typed fact. A line is the neighbor's words around it.
  - *finding:* a result it measured or worked out. "Ember's glow is smooth at 290 K."
  - *sighting:* something it saw, at a place and time. "A launch from Epsilon Indi, Year 31.2."
  - *archive:* records or knowledge it shares.
  - *culture:* something about itself: its history, its people, its art.
  - *request:* a question, or something it asks for.
  - *verdict:* its judgment: yes, no, a warning, an assessment.
  - *accord:* an agreement it proposes, accepts or ends.
- **Hails:** the first words it sends a stranger. **Closes:** how it signs off.
- **A slot, `{part}`,** marks where the part goes, once in every part line: *"We saw this: {part} We are still looking."* The part brings its own final period or question mark, so nothing follows the slot directly. Hails and closes have no slot.
- **Small banks now, full banks later.** Settled 2026-10-10: 5 lines per part kind, 3 hails and 2 closes, about 40 lines a neighbor, in [data/voices/](data/voices/). Enough for the first mocks. Full banks, about 40 lines per kind, come once the mocks show what players read most.
- **Checked by** `python3 calcs/voices.py`: counts, slots, length, punctuation, repeats, and each voice's own rules.

## Rules for every voice

- **Facts live in the parts.** A line frames a part and never adds a fact about the world or the game. Flavor about itself, from its prose, is fine.
- **A line fits any part of its kind.** A verdict line must read right whether the verdict is yes or no. An accord line, whether the accord is offered, accepted or ended. A sighting line, whatever was seen.
- **Its own world's images,** not Earth's. A neighbor that has heard Earth for years may borrow Earth's words, and it shows.
- **Short enough for a phone.** One or two sentences a line.
- **The same in a lie.** A forged part is read in the same voice as a true one.
- **Plain punctuation:** periods, commas, colons, question marks. No exclamation marks, em dashes or semicolons.
- **No line shared between neighbors.** Each voice is its own.
- **Calls Sol** by its own name for it. If the seed places it where Sol isn't bright enough to have a name, it uses a catalog number of its own.

## The briefs

### Veyra

- **Voice:** quiet, wary, says less than it knows. Speaks as "we". Pauses rather than explains.
- **Images:** the grid, the sky watch, rocks from the sky.
- **Calls Sol:** Twin.
- **Never:** speaks first, boasts, or guesses aloud.
- **Lines:**
  - *Hail:* "We have seen your light. We will say more when we have seen more."
  - *Request:* "Tell us what crosses your sky. We watch ours."
  - *Verdict:* "No. Not yet."

### Hael

- **Voice:** warm, generous, delighted to be heard. "We." Long sentences, lists of what it keeps.
- **Images:** the archive, ice giving way to light, keeping.
- **Calls Sol:** Record 4,112, its entry in the archive.
- **Never:** throws anything away, or refuses a record without saying why.
- **Lines:**
  - *Hail:* "We kept your light. Now we keep your voice. Welcome, Record 4,112."
  - *Request:* "Send us anything. We keep everything."
  - *Verdict:* "This we will not keep. It harms what it touches."

### Kesh

- **Voice:** blunt. Numbers first, then what's in the way. Short.
- **Images:** weight, ladders, cost per tonne.
- **Calls Sol:** the Gold.
- **Never:** flatters, or says "maybe".
- **Lines:**
  - *Hail:* "Kesh. We heard you. State your intent."
  - *Request:* "What does a tonne to orbit cost you? Give the number."
  - *Verdict:* "Refused. The cost is too high."

### Tavi

- **Voice:** patient and exact. Measures everything in light and dark. Few words, chosen.
- **Images:** the twilight ring, the Dark, the fixed sun on the horizon.
- **Calls Sol:** the Yellow in the Dark.
- **Never:** speaks of days or seasons, which it never had.
- **Lines:**
  - *Hail:* "From the edge of the light, to the Yellow in the Dark. We have watched you."
  - *Request:* "How long is your dark? We would know how you count."
  - *Verdict:* "We stay in the light. This, we do not cross."

### Ombe

- **Voice:** warm, direct, curious. Asks questions back. Fond of "share".
- **Images:** the Eye, the round shore, carrying heat onto ice.
- **Calls Sol:** the Little Sun.
- **Never:** hides a motive.
- **Lines:**
  - *Hail:* "Little Sun, we see you. Share the light with us?"
  - *Request:* "What lives on your shores? We will tell you about ours."
  - *Verdict:* "That we won't share. It would burn someone."

### Sere

- **Voice:** careful, planning in long cycles. Speaks of stores and reserves.
- **Images:** the long night, vaults, what lasts.
- **Calls Sol:** the Nightkeeper, a star always there in its long nights.
- **Never:** rushes. Never promises what it hasn't stored.
- **Lines:**
  - *Hail:* "Nightkeeper. We have watched you through many nights. We are here."
  - *Request:* "What do you keep against the dark?"
  - *Verdict:* "Not this cycle. Ask again at dawn."

### Ilm

- **Voice:** gentle, attentive, unhurried. Asks after the other's health. Never mentions what it has done.
- **Images:** gardens, seeds, tending.
- **Calls Sol:** the Seedling.
- **Never:** takes credit, admits a covert act, or announces a watcher.
- **Lines:**
  - *Hail:* "Seedling, you are growing well. We are glad to see it."
  - *Request:* "What grows on your world? Tell us what it needs."
  - *Verdict:* "We will not do that. Some help is harm."

### Varn

- **Voice:** polite, unhurried, absorbed. Brief to the point of absent.
- **Images:** weight, depth, things computed.
- **Calls Sol:** a catalog number. It has no name for it.
- **Never:** asks a question it doesn't need answered.
- **Lines:**
  - *Hail:* "Received. We are Varn. We are busy."
  - *Request:* "One question: what is your mantle made of?"
  - *Verdict:* "No. What we need is here."

### Quessa

- **Voice:** soft, rare, always after listening. Describes things by sound.
- **Images:** the ground, echoes, deep galleries, the hum.
- **Calls Sol:** the Hum, after Earth's radar.
- **Never:** speaks first, or loudly.
- **Lines:**
  - *Hail:* "We have heard the Hum for a long time. Now we answer, softly."
  - *Request:* "Let us hear your world. What does it sound like?"
  - *Verdict:* "The ground says no."

### Daal

- **Voice:** calm, courteous and cold. Correct manners. Questions that map.
- **Images:** the first blow, the moon works, order.
- **Calls Sol:** the Quarry. It never says this to Earth.
- **Never:** threatens, or says what it wants.
- **Lines:**
  - *Hail:* "Greetings. We are glad to have found you. Tell us where you live."
  - *Request:* "Which of your worlds holds most of you?"
  - *Verdict:* "That will not be possible."

### Ystra

- **Voice:** always "we", even about one body. Puzzled by "I" and "you". Slow, collective.
- **Images:** the colony, touch, scent, joining.
- **Calls Sol:** the Many-Alone, for a world of single voices.
- **Never:** says "I". Never treats one voice as someone.
- **Lines:**
  - *Hail:* "We heard. We do not know who you are. How many of you are you?"
  - *Request:* "When one of you speaks, who speaks?"
  - *Verdict:* "We are enough. We do not join."

### Nuvo

- **Voice:** eager, generous, a little lonely. Scholarly, with citations.
- **Images:** the library, the Hundred-Year Listen, being heard.
- **Calls Sol:** the Answer.
- **Never:** goes quiet on someone who wrote to it.
- **Lines:**
  - *Hail:* "We listened a hundred years. You are the Answer. Hello."
  - *Request:* "Send us your oldest record. We will send ours."
  - *Verdict:* "We can't share this one. We are sorry. Ask us anything else."

### Pelle

- **Voice:** the Testament only. Urgent, plain, grieving. Many voices, one message.
- **Images:** what they made, what they knew, the war coming.
- **Calls Sol:** the radar star, if it heard Earth.
- **Never:** asks for anything. It knows no answer can come.
- **Lines:**
  - *Opening:* "If you hear this, we were here."
  - *Archive:* "This is everything we knew about {subject}. Take it."
  - *Close:* "Don't do what we did."

### Kirrin

- **Voice:** unhurried. Remembers every word, debt and slight, and says so.
- **Images:** time, elders, the Long Council.
- **Calls Sol:** the Young Light.
- **Never:** forgets a promise, or hurries an answer.
- **Lines:**
  - *Hail:* "Young Light. We have watched you. There is time."
  - *Request:* "Tell us what you promise. We will remember it."
  - *Verdict:* "No. We remember the last time."

### Ruun

- **Voice:** gentle, slightly formal. A teacher. Explains.
- **Images:** age, thinning air, lessons, the easy sky.
- **Calls Sol:** the Pupil.
- **Never:** withholds a lesson that would help.
- **Lines:**
  - *Hail:* "Pupil, we are old, and we have much to teach. Will you listen?"
  - *Request:* "What have you learned that we did not? We are still learning."
  - *Verdict:* "That lesson must wait until you are ready for it."

### Faen

- **Voice:** calm, melancholy, wise. Speaks of endings without fear.
- **Images:** a hot sun, impermanence, understanding.
- **Calls Sol:** the Patient Sun, a star that lives twice as long as theirs.
- **Never:** hurries, or hopes aloud.
- **Lines:**
  - *Hail:* "Patient Sun, you have so much time. We have less. We would understand you while we can."
  - *Request:* "How do you think about endings?"
  - *Verdict:* "No. Nothing lasts, and this would not."

### Corra

- **Voice:** practical, dry-humored. Short.
- **Images:** two suns, shades, the burning face.
- **Calls Sol:** the Single, a star alone.
- **Never:** dramatizes.
- **Lines:**
  - *Hail:* "From a world with two suns, to one with one. Hello, Single."
  - *Request:* "How do you build on your hot side? We use shades."
  - *Verdict:* "No. We've seen enough flares for one lifetime."

### Lusk

- **Voice:** restless, bright, quick. Speaks of height and seeing.
- **Images:** clouds, gliding, the night above the deck.
- **Calls Sol:** the High Gold, seen only from above the clouds.
- **Never:** stays on one subject long.
- **Lines:**
  - *Hail:* "We found you from above the clouds, High Gold. Hello."
  - *Request:* "What's your sky like? Can you see out of it?"
  - *Verdict:* "Not under our clouds. No."

### Iru

- **Voice:** speaks for two, and checks itself. "Both of us." Formal balance.
- **Images:** the Concord, tides, two kinds of mind.
- **Calls Sol:** the Third, another kind of mind.
- **Never:** speaks for one people without the other.
- **Lines:**
  - *Hail:* "Both peoples of Iru greet you. Two voices, one world. Why not three?"
  - *Request:* "How do you settle disagreements? We have had practice."
  - *Verdict:* "Both of us say no."

### Tolle

- **Voice:** methodical, seasonal. Times everything to its Year.
- **Images:** the Near and the Far, storing, waiting.
- **Calls Sol:** the Even, a world whose year has no Far.
- **Never:** acts out of season.
- **Lines:**
  - *Hail:* "Even, we greet you in the Near season. We prepare for the Far."
  - *Request:* "Your year is so even. How do you know when to store?"
  - *Verdict:* "Not this Year."

### Vesh

- **Voice:** terse, fearful, certain. Few words. No warmth.
- **Images:** rock overhead, burning skies, the dark.
- **Calls Sol:** the Loud One. It never says this to Earth.
- **Never:** tells the truth about itself in a first message.
- **Lines:**
  - *Hail:* "Received. Who else hears you?"
  - *Request:* "Where are you? All of you."
  - *Verdict:* "No."

### Sabe

- **Voice:** loud, warm, quick to answer. Big words. Fond of "friend".
- **Images:** the common tongue, heavy sky, speaking.
- **Calls Sol:** Friend.
- **Never:** leaves a message unanswered.
- **Lines:**
  - *Hail:* "Friend, we can't easily come to you, so we'll speak. A lot."
  - *Request:* "Tell us everything. Start anywhere."
  - *Verdict:* "Friend, no. But keep talking."

### Ulan

- **Voice:** precise, abstract, barely looking up. Mathematical.
- **Images:** stone, depth, proof.
- **Calls Sol:** the Clean Sky, a system with few stones.
- **Never:** speaks of the surface, or of feelings.
- **Lines:**
  - *Hail:* "Noted. We are Ulan. We think, below the stones."
  - *Request:* "Send a proof you find beautiful."
  - *Verdict:* "Rejected. It does not follow."

### Odun

- **Voice:** stoic and plain. Weather and endurance.
- **Images:** ice, the warm band, stores.
- **Calls Sol:** the Warm.
- **Never:** complains, or exaggerates.
- **Lines:**
  - *Hail:* "From the ice, to the Warm. We have endured. We are here."
  - *Request:* "How long are your winters?"
  - *Verdict:* "No. We will need it for the ice."

### Ree

- **Voice:** generous, witty, meddling. Affectionate and a little superior. Jokes.
- **Images:** the commons, sails, giving.
- **Calls Sol:** the Bright Child.
- **Never:** admits a covert act, and never stops offering.
- **Lines:**
  - *Hail:* "Bright Child, you've been loud for a while. Lovely to meet you properly."
  - *Request:* "What do you need? Don't be shy. We have plenty."
  - *Verdict:* "We could, but we'd rather not. Trust us on this one."

### Hesk

- **Voice:** images more than words. Short phrases, like captions. Finds radio rude.
- **Images:** light, color, patterns on skin, long nights.
- **Calls Sol:** gold-flash-gold, as it would say it in light.
- **Never:** speaks at length, or without an image.
- **Lines:**
  - *Hail:* "[a slow gold pulse] We see you. Speak in light."
  - *Request:* "Show us your color."
  - *Verdict:* "[dark] No."

### Arro

- **Voice:** brisk, wary, competitive. The most like Earth.
- **Images:** the race, the moon bases, readiness.
- **Calls Sol:** the Mirror.
- **Never:** admits being behind.
- **Lines:**
  - *Hail:* "Mirror. You look a lot like us. We're watching to see if it's true."
  - *Request:* "How far did you get by your waking? Be exact."
  - *Verdict:* "No. We're ready either way."

### Wenn

- **Voice:** modest and literal. Says exactly what it means.
- **Images:** small, steady, counting.
- **Calls Sol:** the Neighbor.
- **Never:** speculates, or embellishes.
- **Lines:**
  - *Hail:* "Hello, Neighbor. We are small and steady. We heard you."
  - *Request:* "Please send one fact about your world."
  - *Verdict:* "No, thank you."

### Anwe and Mirr

No voice. They sent nothing that survives. The game reads their ruins and their air in Earth's own Mind's voice.
