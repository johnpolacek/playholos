// Earth's aimed messages before Year 0, as calcs/knocks.py lists them. Real sends on real dates; see
// HOLOS_RESEARCH.md, Earth's aimed messages.

/** Message, sent as a decimal year, target, light-years. */
export const KNOCKS: [string, number, string, number][] = [
  ["Message to Altair", 1983.62, "Altair", 16.73],
  ["Teen Age Message", 2001.67, "47 Ursae Majoris", 45.3],
  ["Cosmic Call 2", 2003.51, "Gliese 49", 31.83],
  ["Cosmic Call 2", 2003.51, "Gliese 208", 37.26],
  ["Cosmic Call 2", 2003.51, "55 Cancri", 41.05],
  ["Cosmic Call 2", 2003.51, "HD 10307", 41.55],
  ["Cosmic Call 2", 2003.51, "47 Ursae Majoris", 45.3],
  ["A Message From Earth", 2008.77, "Gliese 581", 20.55],
  ["Hello From Earth", 2009.66, "Gliese 581", 20.55],
  ["RuBisCo Stars", 2009.85, "Teegarden's Star", 12.5],
  ["RuBisCo Stars", 2009.85, "TZ Arietis", 14.58],
  ["RuBisCo Stars", 2009.85, "Kappa¹ Ceti", 30.26],
  ["Lone Signal", 2013.5, "Gliese 526", 17.73],
  ["Sónar Calling GJ273b", 2017.79, "Luyten's Star", 12.26],
  ["Sónar Calling GJ273b", 2018.37, "Luyten's Star", 12.26],
];

/** A message's own story, from the real record: what it holds, why we sent it, from where, and what has come of it. */
export interface Send {
  holds: string;
  why: string;
  from: string;
  since?: string;
}

/** Each message's story, by its name in KNOCKS. Sources in HOLOS_RESEARCH.md, What our messages hold. */
export const SENDS: Record<string, Send> = {
  "Message to Altair": {
    holds:
      "A spoken greeting in Japanese, drawn from 48,972 readers’ letters. Then 13 pictures: numbers, the elements, the Solar System, DNA, and life from first cells to mammals. The last is the formula for alcohol and the word “Cheers”.",
    why: "Weekly Shōnen Jump, a boys’ comic magazine, marked its 15th year by giving “dreams to children”. Two astronomers at the Tokyo Astronomical Observatory made it, for Altair, “a famous star that everyone knows”.",
    from: "The 46 m Stanford dish in California · August 15, 1983, one hour, on Tanabata, the festival of Altair and Vega",
    since: "It reached Altair in 2000. The readers’ letters lie buried in a canister beside the dish.",
  },
  "Teen Age Message": {
    holds:
      "A theremin concert: Beethoven’s Ode to Joy, Rachmaninoff’s Vocalise, Gershwin’s Summertime, “Kalinka-Malinka” and more. Then greetings in Russian and English, and pictures of who we are.",
    why: "Teenagers from four Russian cities chose its music, words and stars. They called it “Hello, Galaxy!”, 40 years after Gagarin flew. Music, said its sender Alexander Zaitsev, is the “language of emotions”.",
    from: "The 70 m dish at Evpatoria, Crimea · September 3, 2001, about an hour",
    since: "Arecibo had turned it down the year before, fearing it “may be a dangerous affair”.",
  },
  "Cosmic Call 2": {
    holds:
      "A primer of numbers and physics built to explain itself, and the 1974 Arecibo message. Then 220 MB from people in more than 50 countries: David Bowie’s “Starman”, children’s drawings from Ukraine, the flags of 282 states.",
    why: "Team Encounter of Houston sold it as “a people’s space program”: anyone could pay to send words, pictures or songs. Its president called it a “we’re coming” announcement for a solar sail. Senders voted for “Starman”, 161 to 147.",
    from: "The 70 m dish at Evpatoria, Crimea · July 6, 2003, about an hour for each star",
    since: "The company folded in 2004. The sail it announced never flew.",
  },
  "A Message From Earth": {
    holds:
      "501 notes, photos and drawings, picked by web vote among more than half a million people. One: “I wish I could be alive to see the day contact between the two worlds is made, I’ve been born way too early.”",
    why: "The social network Bebo ran it, to “capture young people’s imaginations and inspire them to think about our own planet earth and humanity’s impact upon it”.",
    from: "The 70 m dish at Evpatoria, Crimea · October 9, 2008, four and a half hours",
    since:
      "Its planet, Gliese 581c, is now thought likely too hot for life. Bebo went offline in 2013, and what the 501 said is no longer clear.",
  },
  "Hello From Earth": {
    holds:
      "25,880 text messages from nearly 200 countries, 160 characters each. One from a school class: “We come in peace. If you are out there, please respond.”",
    why: "Cosmos magazine ran it for Australia’s National Science Week. Its editor: “We don’t know if there’s life on Gliese 581d… But we do know that it might have the conditions for life.”",
    from: "NASA’s 70 m dish at Tidbinbilla, near Canberra · August 28, 2009, two hours",
    since:
      "Later studies found the planet’s signal likely came from the star itself. The world we wrote to may not exist.",
  },
  "RuBisCo Stars": {
    holds:
      "The gene for RuBisCo, the protein plants use to take carbon from the air: 1,434 letters of DNA, 2,868 bits. A computer voice spoke each letter as a phrase: “I”, “am the”, “know yourself”, “riddle of life”.",
    why: "An artist, Joe Davis, sent it on his own, unfunded, near the 35th anniversary of the 1974 Arecibo message. He meant it for us too: “there are intelligent beings on Earth we can’t communicate with.”",
    from: "Arecibo, Puerto Rico · the night of November 7, 2009. The encoder was broken, so it went out from a recording on his iPhone.",
    since: "The same night’s sends reached Teegarden’s Star in 2022 and TZ Arietis in 2024.",
  },
  "Lone Signal": {
    holds:
      "Two beams. One sent prime numbers, then a picture of where we are, the periodic table and the hydrogen atom. The other sent anyone’s text of 144 characters, the first free, then about 25 cents each.",
    why: "A startup’s hope that anyone could speak to the stars: “It’s never been the case that anyone on the face of the Earth can commune with the cosmos.” It went quiet after about two months.",
    from: "The Jamesburg dish in California, which carried the Moon landings live to the world · from June 17, 2013",
    since: "Gliese 526 has no known planets. It was picked from a list of stars that could host one.",
  },
  "Sónar Calling GJ273b": {
    holds:
      "Prime numbers to 193, then a lesson: counting, geometry, radio waves and how to tell time, each sent three times so errors can be outvoted. Then 10-second pieces of music, from Autechre, Holly Herndon, Jean-Michel Jarre and more.",
    why: "For the Sónar music festival’s 25th year, with Catalan astronomers and METI International. Luyten’s Star was picked for being close. Its designer called it a prototype for something we might do a million times.",
    from: "The EISCAT dish near Tromsø, Norway · October 16 to 18, 2017, and again in May 2018",
    since:
      "Its maker said success would come “if, 25 years from now, there’s someone who remembers to look.” We are looking.",
  },
};

/** Earth's radars began sweeping the sky in the 1950s. */
export const RADARS_SINCE = 1950;

/** Each target's declination, J2000 degrees, for placing it in 3D. Its right ascension and distance are in sky.json. */
export const TARGET_DEC: Record<string, number> = {
  Altair: 8.87,
  "47 Ursae Majoris": 40.43,
  "Gliese 49": 62.35,
  "Gliese 208": 11.33,
  "55 Cancri": 28.33,
  "Gliese 581": -7.72,
  "TZ Arietis": 13.05,
  "Kappa¹ Ceti": 3.37,
  "Gliese 526": 14.89,
  "Luyten's Star": 5.23,
  "HD 10307": 42.61,
  "Teegarden's Star": 16.88,
};
