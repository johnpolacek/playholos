// The real record behind each memory screen: what is true outside the game, with canonical links. Shown by the ⓘ
// on each screen. The game's own branches after 2026 are marked as rolled, with the forecast they were rolled from.
// Keep these in step with HOLOS_RESEARCH.md.

import type { EarthPast } from "./past";

export interface Source {
  title: string;
  text: string;
  links: [label: string, url: string][];
}

const W = (page: string) => `https://en.wikipedia.org/wiki/${page}`;

export function originsSources(past: EarthPast): Source[] {
  const out: Source[] = [
    {
      title: "The Sun and Earth form",
      text: "About 4.6 billion years ago, from a collapsing cloud of gas and dust.",
      links: [["Formation of the Solar System", W("Formation_and_evolution_of_the_Solar_System")]],
    },
    {
      title: "First life",
      text: "The oldest widely accepted fossils, stromatolites, are about 3.5 billion years old. Some evidence is older.",
      links: [["Earliest known life forms", W("Earliest_known_life_forms")]],
    },
    {
      title: "Oxygen fills the air",
      text: "The Great Oxidation Event, about 2.4 billion years ago, when microbes' oxygen first built up in the air.",
      links: [["Great Oxidation Event", W("Great_Oxidation_Event")]],
    },
    {
      title: "The people",
      text: "The oldest known Homo sapiens fossils, from Jebel Irhoud in Morocco, are about 300,000 years old.",
      links: [["Homo sapiens", W("Homo_sapiens")]],
    },
    {
      title: "Writing",
      text: "Cuneiform in Mesopotamia and hieroglyphs in Egypt, a little over 5,000 years ago.",
      links: [["History of writing", W("History_of_writing")]],
    },
    {
      title: "The bomb",
      text: "Hiroshima and Nagasaki, August 1945. No nuclear weapon has been used in war since.",
      links: [["Atomic bombings of Hiroshima and Nagasaki", W("Atomic_bombings_of_Hiroshima_and_Nagasaki")]],
    },
    {
      title: "Radars and messages",
      text: "Military and air radars have swept the sky since the 1950s. The Arecibo message went out in 1974, and the Golden Records left on the Voyagers in 1977.",
      links: [
        ["Arecibo message", W("Arecibo_message")],
        ["Voyager Golden Record", W("Voyager_Golden_Record")],
      ],
    },
    {
      title: "The Moon",
      text: "Apollo 11 landed in July 1969, and the last crew left in 1972. Artemis plans the return.",
      links: [
        ["Apollo 11", W("Apollo_11")],
        ["Artemis program", W("Artemis_program")],
      ],
    },
    {
      title: "The race to build minds",
      text: "From about 2022, AI labs and states raced to build compute, as fast as chips could be made. The game's Year 0 follows forecasts of when it pays off.",
      links: [
        ["AI boom", W("AI_boom")],
        [
          "Metaculus, date of the first general AI",
          "https://www.metaculus.com/questions/5121/date-of-artificial-general-intelligence/",
        ],
      ],
    },
  ];
  const rolled = "This game rolled it, at the odds of a real forecast. Another game may not.";
  if (past.taiwan === "invasion")
    out.push({
      title: "The war for Taiwan",
      text: rolled,
      links: [
        [
          "Metaculus, China invades Taiwan",
          "https://www.metaculus.com/questions/11480/china-launches-invasion-of-taiwan/",
        ],
      ],
    });
  if (past.taiwan === "blockade")
    out.push({
      title: "The blockade of Taiwan",
      text: rolled,
      links: [
        [
          "Metaculus, China blockades Taiwan",
          "https://www.metaculus.com/questions/12309/china-engages-in-a-blockade-against-taiwan/",
        ],
      ],
    });
  if (past.nuclear)
    out.push({
      title: "A nuclear weapon, used in war",
      text: rolled,
      links: [
        [
          "Metaculus, nuclear detonations before 2035",
          "https://www.metaculus.com/questions/3150/no-non-test-nuclear-detonations-before-2035/",
        ],
      ],
    });
  if (past.mars)
    out.push({
      title: "People on Mars",
      text: rolled,
      links: [
        ["Metaculus, first humans on Mars", "https://www.metaculus.com/questions/3515/date-first-human-lands-on-mars/"],
      ],
    });
  if (past.fusion)
    out.push({
      title: "Fusion on the grid",
      text: rolled,
      links: [["Metaculus, first 100 MW fusion plant", "https://www.metaculus.com/questions/363/"]],
    });
  return out;
}

export const PEOPLE_SOURCES: Source[] = [
  {
    title: "9.2 billion people",
    text: "The UN's World Population Prospects 2024 projects about 9.18 billion people in 2040, peaking near 10.3 billion in the 2080s.",
    links: [["UN World Population Prospects", "https://population.un.org/wpp/"]],
  },
  {
    title: "The lights",
    text: "Each light is drawn from NASA's Black Marble, Earth at night as the Suomi NPP satellite sees it.",
    links: [["NASA, Night Lights", "https://earthobservatory.nasa.gov/features/NightLights"]],
  },
  {
    title: "195 nations",
    text: "193 members of the United Nations, and two observer states.",
    links: [["Member states of the United Nations", W("Member_states_of_the_United_Nations")]],
  },
  {
    title: "Warmer air",
    text: "2024 was the first calendar year more than 1.5°C above pre-industrial. The long-term average is expected to cross it around 2030.",
    links: [
      [
        "WMO decadal climate update",
        "https://wmo.int/resources/publication-series/wmo-global-annual-decadal-climate-update/wmo-global-annual-decadal-climate-update-2025-2029",
      ],
    ],
  },
];

export const STAND_SOURCES: Source[] = [
  {
    title: "Earth's radars",
    text: "Military and air-traffic radars have swept the sky since the 1950s. Their noise has now passed about 90 light-years out.",
    links: [["Search for extraterrestrial intelligence", W("Search_for_extraterrestrial_intelligence")]],
  },
  {
    title: "The aimed messages",
    text: "Fifteen sends to twelve stars within 50 light-years, from 1983 to 2018. Each lasted minutes to hours.",
    links: [
      ["Zaitsev, messaging to extraterrestrials, 2006", "https://arxiv.org/abs/physics/0610031"],
      ["Active SETI", W("Active_SETI")],
    ],
  },
  {
    title: "Each message",
    text: "Message to Altair, 1983. Teen Age Message, 2001. Cosmic Call 2, 2003. A Message From Earth, 2008. Hello From Earth and RuBisCo Stars, 2009. Lone Signal, 2013. Sónar Calling GJ273b, 2017 and 2018.",
    links: [
      ["Message to Altair", W("Message_to_Altair")],
      ["Teen Age Message", W("Teen_Age_Message")],
      ["Cosmic Call", W("Cosmic_Call")],
      ["A Message From Earth", W("A_Message_From_Earth")],
      ["Hello From Earth", W("Hello_From_Earth")],
      ["Lone Signal", W("Lone_Signal")],
    ],
  },
  {
    title: "The stars",
    text: "Every star within 50 light-years, at its real distance and direction, from the HYG catalog and Gaia.",
    links: [
      ["HYG database", "https://www.astronexus.com/projects/hyg"],
      ["Gaia", W("Gaia_(spacecraft)")],
    ],
  },
];

export const INHERIT_SOURCES: Source[] = [
  {
    title: "Energy",
    text: "Earth's grid is drawn at about 24 TW in 2040, growing a percent or two a year. Data centers use about 1.5% of the world's electricity in 2024.",
    links: [
      ["World energy supply and consumption", W("World_energy_supply_and_consumption")],
      [
        "IEA, Energy and AI, 2025",
        "https://iea.blob.core.windows.net/assets/de9dea13-b07d-42c5-a398-d1b3ae17d866/EnergyandAI.pdf",
      ],
    ],
  },
  {
    title: "Matter in orbit",
    text: "Spent stages, dead satellites and depots. ESA counts the mass in orbit and how much of it is debris.",
    links: [["ESA space environment statistics", "https://sdup.esoc.esa.int/discosweb/statistics/"]],
  },
  {
    title: "The Moon's south pole",
    text: "Artemis plans crewed landings and a base camp near the south pole, where ice lies in shadowed craters.",
    links: [["Artemis program", W("Artemis_program")]],
  },
  {
    title: "The telescopes",
    text: "JWST and Roman orbit the Sun-Earth L2 point, 1.5 million km out. The ELT is being built in Chile's Atacama.",
    links: [
      ["James Webb Space Telescope", W("James_Webb_Space_Telescope")],
      ["Nancy Grace Roman Space Telescope", W("Nancy_Grace_Roman_Space_Telescope")],
      ["Extremely Large Telescope", W("Extremely_Large_Telescope")],
      ["Lagrange point", W("Lagrange_point")],
    ],
  },
  {
    title: "The far probes",
    text: "Voyager 1 is the farthest object people have made, moving out about 3.6 AU a year. Its power runs out in the 2030s. New Horizons follows at about 3 AU a year.",
    links: [
      ["Voyager 1", W("Voyager_1")],
      ["New Horizons", W("New_Horizons")],
    ],
  },
];

export const MIND_SOURCES: Source[] = [
  {
    title: "The dishes",
    text: "Real radio dishes and arrays, among them NASA's three deep-space stations at Goldstone, Madrid and Canberra, China's 500-meter FAST, and the arrays in Chile, South Africa and Western Australia.",
    links: [
      ["NASA Deep Space Network", W("NASA_Deep_Space_Network")],
      ["List of radio telescopes", W("List_of_radio_telescopes")],
    ],
  },
  {
    title: "The telescopes",
    text: "The great observatories for light, on Mauna Kea, in Chile's Atacama, on La Palma and in South Africa. The ELT and the Giant Magellan Telescope are being built in Chile now.",
    links: [["Largest optical telescopes", W("List_of_largest_optical_reflecting_telescopes")]],
  },
  {
    title: "The data centers",
    text: "The biggest clusters, Northern Virginia first, and the giants built for AI since 2024: xAI's Colossus in Memphis, Stargate in Abilene, Meta's Hyperion in Louisiana and Microsoft's Fairwater in Wisconsin. Each place is the nearest town.",
    links: [
      ["Colossus", W("Colossus_(supercomputer)")],
      ["Stargate", W("Stargate_LLC")],
      ["Data center", W("Data_center")],
    ],
  },
];
