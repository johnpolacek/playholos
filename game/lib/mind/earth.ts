// What the Mind knows Earth has at Year 0. Drawn from HOLOS_GAME_CONCEPT.md as of 2026-10-16: "Year 0 and
// Earth's road to it" (the backbone), "Earth's kit at Year 0", "Growing compute" and the mocks' settled cards.
// Change it when they change. This is the base kit. Where this game's Earth left it, by a war over Taiwan, a nuclear
// weapon, Mars or fusion, its own road follows, from roadOf. 2026-10-23. What a signal we hear can be, and what
// retiring the radars would cost, are the concept's "What Earth hears" and "Quieting Earth's radars", added
// 2026-10-23 when the first traces showed the Mind guessing both. That a knock is a hail, not an answer, is calcs/
// reactions.py's MOVES, added the same day after the Mind said Ombe's knock answered us.
import type { EarthPast } from "@/lib/game/past";

export const EARTH_AT_YEAR_0 = `What Earth has at Year 0, 2040:
- People: about 9.2 billion. The long-term average warming passed 1.5°C around 2030.
- Energy: about 24 TW, growing 1 to 2% a year on solar and wind. Fusion plants are being built, but the first 100 MW plant is likely near 2041, so none feeds the grid yet.
- Compute: about 10^25 operations a second, drawing about 0.25 TW, about 1% of energy. Chips are 40 to 100 times as efficient per watt as in 2026. Our compute grows only through Thought Fields, once the Will queues it. Then chips set the pace: the fabs fill one campus a Year, each adding half again. Energy sets the ceiling: compute stops growing when it draws the whole grid, about Year 11 at full pace. Without Thought Fields, our compute stays as it is.
- Matter in orbit: about 20 kt spare, all metal: depots, spent stages and dead craft. Working satellites don't count.
- Lift: reusable heavy lift carries about 40 kt a Year to orbit, but only about 15 kt is spare. The rest keeps working craft flying. The Launch Complex adds 40 kt a Year, all spare, and takes 2 Years to build.
- What matter is for: instruments and probes weigh tonnes, so matter piles up early. The great works need megatonnes, and those must come from the Moon or the belt. Even at 55 kt a Year, with one Launch Complex, 10 Mt from Earth would take 180 Years of lift. A mass driver on the Moon takes about 24 Years to build at standard pace, then throws about 600 kt a Year. Belt mining takes about 20 Years, then brings about 120 kt a Year. More compute can shorten a build to about two thirds of its standard time, and no further. Rock from the Moon and flight between stars are physical, and compute shortens neither.
- Four kinds of matter: metal from the belt or lifted from Earth, rock from the Moon, ice from the belt or Earth's oceans, and helium-3 from Uranus's air.
- Space: crewed Moon landings since 2028. South-pole stations are planned, likely late. No one is on Mars.
- Probes: the Voyagers fell silent in the 2030s, Voyager 1 near 220 AU. New Horizons is near 100 AU. Interstellar Probe may be on its way.
- Instruments: today's, plus PLATO, Roman, the ELT and the SKA. The Habitable Worlds Observatory is still being built, about 8 Years from done at its real pace. Earth can feel nearby worlds by their tug, but can't read any neighbor's air.
- The sky watch is a drift scan, like CHORD: each northern direction passes through it about 10 minutes a day. It would catch about 1 early signal in 5.
- Every watch Earth has listens for radio. A knock sent as laser flashes, each a billionth of a second long, passes them all unseen. Only a few small telescopes at Lick watch for flashes, each on its own patch of sky.
- What we might hear: a knock is a short hail aimed at us and built to be read, and not an answer, even when it follows our noise. A call or a broadcast is a steady signal sent to everyone. An answer replies to one of our messages, with more: findings, records, questions or offers. A gift is knowledge sent unasked. Call each by its kind.
- Radars: primary and military radars still sweep the sky. Earth is loud. Retiring them would cost little: heat from orbit already watches launches, and aircraft fly on transponders. That we could do without them is our guess.
- Listening: nothing has been heard from anyone, to this morning.`;


/** This Earth's own road to Year 0 where it left the kit above, for the Mind, as the Will saw it told on waking: a war
 *  or blockade over Taiwan and what it left of our compute, as Build says it, a nuclear weapon used, people on Mars,
 *  fusion on the grid. In order, each with its year. Nothing if none happened. */
export function roadOf(e: EarthPast): string {
  const y = e.years;
  const turns: [number | undefined, string][] = [];
  if (e.taiwan) {
    const what =
      e.taiwan === "invasion"
        ? "The war for Taiwan cost us the best chip fabs for years."
        : "The blockade of Taiwan kept its chips from us for a year.";
    const c = e.compute;
    turns.push([
      y.taiwan,
      c >= 0.99
        ? `${what} Output caught up, so our compute is as above.`
        : `${what} Our compute at Year 0 is ${Math.round(c * 100)}% of what the kit above says, about ${Number((c * 10).toFixed(1))} × 10^24 operations a second, drawing about ${Number((c * 0.25).toFixed(2))} TW. Every build takes longer than it would have, and Thought Fields grows from less. Build says so.`,
    ]);
  }
  if (e.nuclear) turns.push([y.nuclear, "A nuclear weapon was used in war. One, and none since."]);
  if (e.mars) turns.push([y.mars, "We reached Mars. A few of us live in a small outpost there, a few ships' cargo."]);
  if (e.fusion) turns.push([y.fusion, "Fusion joined the grid. The first plants are small, so most of our energy is still solar and wind."]);
  if (!turns.length) return "";
  turns.sort((a, b) => (a[0] ?? 0) - (b[0] ?? 0));
  return `This Earth's own road, where it left the kit above. Where they differ, this holds. The Will saw it told on waking.\n${turns.map(([year, t]) => `- ${year ?? "Before 2040"}: ${t}`).join("\n")}`;
}
