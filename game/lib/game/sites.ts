// Where each build would stand, for the map, and what it holds, for the Build tab. Picking a build there flies the
// map to its place. Sources in HOLOS_RESEARCH.md, "Where the Moon vault stands", "Where the watches stand", "Where
// the data center, launch complex and yard stand", "Where the infrared telescope stands", and since 2026-10-22, each
// opened build's and the long road's "Where ... stands".
import { BUILDS } from "./plan";

/** One place a build stands: latitude, and longitude east. On the Moon, longitude runs from the middle of the side
 *  that faces Earth. */
export interface Place {
  lat: number;
  lon: number;
  /** Its name on the map. */
  name: string;
}

/** Where a build stands: on Earth, the Moon, in low orbit, out at L2 or L4, or at another planet, at one place or more. */
export interface Site {
  on: "earth" | "moon" | "orbit" | "l2" | "l4" | "planet";
  /** At a planet: which, by the atlas's name. 2026-10-29. */
  body?: string;
  /** At a planet: framed with its whole orbit round the Sun, not up close. The Solar Swarm's, 2026-10-29. */
  view?: "orbit";
  /** How the map draws it: a dome of the sky each place watches, a ring round it, or paths up to orbit from it. */
  draw: "dome" | "ring" | "launch";
  /** In orbit or at L2, one place, its name only. */
  places: Place[];
  /** In orbit: how high, in km, its tilt to the equator, in degrees, minutes round, and how many degrees it trails
   *  another on the same path. */
  orbit?: { km: number; tilt: number; minutes: number; behind?: number };
  /** At L2: how far out from Earth, in km. */
  km?: number;
  /** Out from Earth as L2 is, but on the Moon's path at its L5. 2026-10-30. */
  lunar?: boolean;
}

/** A build's story: what we have at Year 0, where it stands, why there, what it takes, and who tried before us. How
 *  long it takes is left to the build's page and the list, which reckon it with this game's compute, 2026-10-19. */
export interface Story {
  /** What Earth already has of its kind in 2040, so the build reads as a step from there. */
  have?: string;
  where: string;
  why: string;
  takes: string;
  before?: string;
}

const kt = (name: string) => BUILDS.find((b) => b.name === name)?.kt ?? 0;

export const SITES: Record<string, { site: Site; story: Story }> = {
  "All-Sky Watch": {
    // Two radio quiet zones, nearly opposite each other across Earth, one north and one south.
    site: {
      on: "earth",
      draw: "dome",
      places: [
        { lat: 38.433, lon: -79.84, name: "Green Bank, West Virginia" },
        { lat: -26.7, lon: 116.67, name: "Murchison, Western Australia" },
      ],
    },
    story: {
      have: "Since 2028 our sky watch sees each northern star about ten minutes a day. It never sees the far southern sky, and catches about 1 knock in 5.",
      where:
        "Two fields of small antennas, at Green Bank in West Virginia and at Murchison in Western Australia. Both lie in radio quiet zones.",
      why: "They stand on nearly opposite sides of Earth, one north and one south. Each hears the half of the sky above it, so together they hear all of it, at every hour.",
      takes: "1.28 million small antennas, half at each.",
      before:
        "EMBRACE, in France, steered beams from 4,608 small antennas by 2011. Ours is the same idea, a few hundred times bigger.",
    },
  },
  "Deep Flash Watch": {
    // PANOSETI's own choice for its domes, and the darkest big observatory in the south, far round from it.
    site: {
      on: "earth",
      draw: "dome",
      places: [
        { lat: 33.356, lon: -116.865, name: "Palomar Mountain, California" },
        { lat: -32.38, lon: 20.81, name: "Sutherland, South Africa" },
      ],
    },
    story: {
      have: "Our watches listen for radio. For laser flashes we have only a few small telescopes at Lick, each on its own patch of sky.",
      where:
        "Domes of small lens telescopes on Palomar Mountain in California and at Sutherland in South Africa. Two domes at each, 1 km apart.",
      why: "A laser knock is a flash a billionth of a second long. Both domes must see it at once, or it was a cosmic ray’s flash in our own air. Palomar watches the northern sky, Sutherland the southern.",
      takes: "45 telescopes in each dome.",
      before:
        "PANOSETI’s first telescopes began watching from Lick Observatory in 2021. Its plan for Palomar is two domes like these.",
    },
  },
  "Thought Fields": {
    // Around the biggest AI campus planned in 2025, where the land and the power already are.
    site: { on: "earth", draw: "ring", places: [{ lat: 32.48, lon: -91.63, name: "Richland Parish, Louisiana" }] },
    story: {
      have: "We think on about 250 GW of chips, a hundredth of Earth’s energy. That is fifty campuses the size of Hyperion, the giant of the 2020s.",
      where:
        "Around Hyperion, in Richland Parish, Louisiana, and on campuses like it. Each campus we build is a Year of the fabs’ chips.",
      why: "The land and the power lines are already there, so chips are the only wait.",
      takes: "Chips as fast as the fabs make them, a campus a Year. Each adds half again to all our compute, so the first draws about 120 GW, half a percent of Earth’s energy. After eleven, compute draws nine tenths of it.",
    },
  },
  "Infrared Telescope": {
    // Where Webb flies, and where NASA meant to send the Habitable Worlds Observatory.
    site: { on: "l2", draw: "ring", places: [{ lat: 0, lon: 0, name: "L2, 1.5 million km out" }], km: 1_500_000 },
    story: {
      have: "Webb and Roman fly, and the ELT watches from Chile. The Habitable Worlds Observatory is about 8 Years from done. None can read another world’s air.",
      where:
        "At L2, 1.5 million km out on Earth’s night side, where Webb flies. The Sun, Earth and Moon all stay behind it.",
      why: "Infrared is heat, so the telescope must be colder than the worlds it reads. One shade blocks all three, and behind it Webb holds near 40 K while its sunny side reaches 110 °C.",
      takes: "Built in orbit, it takes a quarter less time once the yard is done.",
      before:
        "NASA’s Habitable Worlds Observatory was to read the air of at least 25 such worlds from here in the 2040s. In April 2026 NASA asked only $5 million for it, down from $150 million.",
    },
  },
  "Asteroid Tour": {
    // Kamoʻoalewa's path round the Sun, beside Earth's: the tour's first stop, where Tianwen-2 goes.
    site: { on: "l2", draw: "ring", places: [{ lat: 0, lon: 0, name: "Beside Earth’s orbit, with Kamoʻoalewa" }], km: 15_000_000 },
    story: {
      have: "China’s Tianwen-2 reached Kamoʻoalewa in 2026 to map it and bring a sample home. No one has looked at the others up close.",
      where: "Circling the Sun beside Earth, from one co-orbital asteroid to the next.",
      why: "Six known asteroids share our orbit and stay near us for centuries. Anything left to watch us could ride one, and only a probe in orbit round each sees something a few centimeters across.",
      takes: "One probe of Tianwen-2’s class, about $500 million, 5 Years to build. A Year to the first rock, then 2 Years each.",
      before: "Kamoʻoalewa, 40 to 100 m wide, may be a piece of our Moon thrown off long ago. Benford 2019 named such rocks as where a watcher could sit.",
    },
  },
  "Close Look": {
    // Where the watcher sits: the Moon's L4 or L5, as far out as the Moon, or a rock beside Earth's orbit. 2026-10-30.
    // On the Moon's own path, drawn at its L5, 60° behind it.
    site: { on: "l2", draw: "ring", places: [{ lat: 0, lon: 0, name: "The Moon’s L4 or L5, 384,000 km out" }], km: 384_400, lunar: true },
    story: {
      have: "CAPSTONE, a 25 kg craft, reached its orbit round the Moon in 2022 after 4 months on a low-energy path, for about $30 million. Nothing has looked at the Moon’s L4 or L5 points up close.",
      where: "Flown from Earth to wherever the watcher sits, and held a few kilometers from it.",
      why: "From Earth it is a faint dot. A camera a few kilometers off sees its shape, its surface and how it holds its place.",
      takes: "One small craft of CAPSTONE’s class with a sharp camera, about $50 million, 2 Years to build. About 4 months to the Moon’s L4 or L5, or a Year to a rock beside us.",
      before: "No one has sent a craft to meet something made elsewhere. Whatever it is will see ours come.",
    },
  },
  "Moon Search": {
    // Rubin on Cerro Pachón and Subaru on Maunakea: the wide, deep cameras a stacked search runs on.
    site: {
      on: "earth",
      draw: "dome",
      places: [
        { lat: -30.24, lon: -70.74, name: "Rubin Observatory, Cerro Pachón, Chile" },
        { lat: 19.83, lon: -155.48, name: "Subaru, Maunakea, Hawaiʻi" },
      ],
    },
    story: {
      have: "Rubin maps the whole southern sky every few nights to about magnitude 24.5. No one has stacked years of it on the Moon’s L4 and L5 points.",
      where: "On telescopes we have, Rubin in Chile and Subaru in Hawaiʻi, an observing program and its software.",
      why: "The Moon’s L4 and L5 points, 384,000 km out, hold small things for ages. Stacking images that follow a slow drift brings out what one image never shows.",
      takes: "About $100 million of observing time and software, a Year to ready, then 3 Years of stacking.",
      before: "Searches of the Earth–Moon L4 and L5 points have turned up dust clouds, Kordylewski’s, debated since 1961, and nothing solid.",
    },
  },
  "Warm Sky Watch": {
    // At L2, behind one shade with Webb, as a cooled survey must be.
    site: { on: "l2", draw: "ring", places: [{ lat: 0, lon: 0, name: "L2, 1.5 million km out" }], km: 1_500_000 },
    story: {
      have: "WISE mapped the warm sky in 2010 and NEO Surveyor from 2027. Neither reaches a new warm glow across our galaxy through its dust.",
      where: "At L2, 1.5 million km out, cooled behind a shade, as Webb flies.",
      why: "A young mind building out its home glows like a new warm star for centuries. Seen from tens of thousands of light-years, it is faint and buried in the crowded plane, so only repeated deep maps catch one appearing.",
      takes: "A telescope about 1.3 m wide, cooled to its detectors' limit, and about $2.5 billion. Built in orbit, a quarter quicker once the yard is done.",
      before: "WISE, 0.4 m, mapped the whole sky at 12 µm to about 0.7 mJy. NEO Surveyor, 0.5 m, cost $1.2 billion to build.",
    },
  },
  "Star Mapper": {
    // At L2, where Gaia flew, and where GaiaNIR would.
    site: { on: "l2", draw: "ring", places: [{ lat: 0, lon: 0, name: "L2, 1.5 million km out" }], km: 1_500_000 },
    story: {
      have: "Gaia mapped nearly two billion stars from 2014 to 2025. Its last catalog, out about 2030, holds every shift it saw.",
      where: "At L2, 1.5 million km out on Earth’s night side, where Gaia flew.",
      why: "A black hole is dark, but bends the light of stars behind it. As it passes, a star seems to slide a fraction of a thousandth of an arcsecond, and then back. Only a mapper as steady as Gaia sees that, and in the infrared it sees through the Galaxy’s dust to five times the stars.",
      takes: "A spinning telescope with two views of the sky, as Gaia had, built on Earth and flown out whole.",
      before: "In 2022 Sahu and colleagues weighed the first lone black hole, 5,000 light years away, from the shift it gave a star. ESA has studied GaiaNIR, an infrared Gaia, for the 2040s.",
    },
  },
  "Halo Survey": {
    // ALMA's dishes on the Chajnantor plateau, 5,000 m up in Chile's Atacama, where the air holds least water.
    site: { on: "earth", draw: "dome", places: [{ lat: -23.0193, lon: -67.7532, name: "Chajnantor, Chile" }] },
    story: {
      have: "Herschel and the JCMT watched hundreds of near stars for cold glow, and saw dust or nothing. PRIMA, launched in 2033, sees warmer glow faster, but not the coldest.",
      where: "ALMA’s 66 dishes on the Chajnantor plateau, 5,000 m up in Chile’s Atacama desert.",
      why: "Water in the air drinks the submillimetre light a cold glow gives off, and this is among the driest places on Earth. An hour in each of two bands shows a glow’s color: dust reddens, cold computing stays grey.",
      takes: "Two thirds of ALMA’s time, an hour at each star, nearest first: about 3,000 stars a Year. It builds nothing new.",
      before: "In 2026 Garrett read the Herschel and JCMT surveys as limits on cold computing: nothing over about 7×10¹⁹ W at 10 pc. No one has looked deeper.",
    },
  },
  "Halo Array": {
    // Beside ALMA on the Chajnantor plateau, as dry as anywhere on Earth.
    site: { on: "earth", draw: "dome", places: [{ lat: -23.03, lon: -67.75, name: "Chajnantor, Chile, beside ALMA" }] },
    story: {
      have: "ALMA gives its time to many searches, so a halo search on it alone crawls outward, about 3,000 stars a Year.",
      where: "On the Chajnantor plateau, 5,000 m up in Chile’s Atacama, beside ALMA.",
      why: "Faint galaxies crowd the far-infrared sky, so only an array sees a faint glow sharply, and it looks at one star at a time. Ten times as many dishes and receivers, kept on this one search, look at 40,000 stars a Year.",
      takes: "About ten ALMAs’ worth of dishes and receivers, a sample near $15 billion, and about 12 Years, as ALMA took.",
      before: "ALMA’s 66 dishes cost about $1.5 billion and took about 12 years from agreement to full operations, in 2013.",
    },
  },
  "Launch Complex": {
    // Europe's spaceport, near the equator, with open sea to the east.
    site: { on: "earth", draw: "launch", places: [{ lat: 5.236, lon: -52.769, name: "Kourou, French Guiana" }] },
    story: {
      have: "Reusable heavy lift carries about 40 kt a Year to orbit. Only about 15 kt is spare. The rest keeps working craft flying.",
      where: "Kourou, in French Guiana, Europe’s spaceport, 5° north of the equator.",
      why: "Near the equator, Earth’s turn gives a rocket its biggest push east: 463 m/s, against Florida’s 409. East of the pads lies open sea.",
      takes: "Earth’s own industry. It spends none of the matter we hold in orbit.",
      before: "In May 2026 ESA and France put €1 billion into Kourou, to host six new launchers.",
    },
  },
  "Launch Tunnel": {
    // StarTram's own sites for orbits round the equator are in the Andes or Africa. Cayambe, 5,790 m, is the highest
    // ground on the equator: our pick.
    site: { on: "earth", draw: "launch", places: [{ lat: 0.029, lon: -77.986, name: "Cayambe, Ecuador" }] },
    story: {
      have: "Every tonne we lift rides a rocket. Japan’s superconducting maglev reached 603 km/h in 2015.",
      where: "Through Cayambe, in the Andes of Ecuador, the highest ground on the equator. The tunnel’s mouth opens high on its flank.",
      why: "Craft leave at 8.8 km/s, so the thinner the air above the mouth, the less it slows them. High on the equator, they reach orbit with a small burn.",
      takes: "Earth’s own industry: 110 km of tunnel, superconducting coils and a 300 MW plant. It spends none of the matter we hold in orbit.",
      before: "James Powell, a co-inventor of superconducting maglev, and George Maise priced it at $20 billion in 2010. No part of it has been built.",
    },
  },
  "Orbital Yard": {
    // The ISS's orbit, which launch sites from Baikonur to Florida can all reach.
    site: {
      on: "orbit",
      draw: "ring",
      places: [{ lat: 0, lon: 0, name: "Low orbit, 400 km up" }],
      orbit: { km: 400, tilt: 51.6, minutes: 92.9 },
    },
    story: {
      have: "About 20 kt of spare metal circles Earth: depots, spent stages and dead craft. Nothing up there can join it into anything big.",
      where: "In low orbit, 400 km up, in the ISS’s orbit, tilted 51.6° to the equator. Once round every 93 minutes.",
      why: "Launch sites from Baikonur to Florida can all reach that tilt. Up there we can join parts too big to launch whole.",
      takes: "1 kt in orbit, a little over twice the ISS.",
      before: "The ISS took 13 years to build at the Shuttle’s pace. China’s Tiangong took 18 months.",
    },
  },
  "Moon Vault": {
    // The first radar evidence of a cave under a Moon pit: Carrer et al. 2024.
    site: { on: "moon", draw: "ring", places: [{ lat: 8.3355, lon: 33.222, name: "Sea of Tranquility pit" }] },
    story: {
      have: "Crews have landed on the Moon since 2028, and stations at its south pole are planned. Every copy of us is still on Earth.",
      where:
        "A cave under a pit in the Sea of Tranquility, 400 km from where Apollo 11 landed. A 2024 study of radar from orbit found signs of it.",
      why: "More than 100 m of rock overhead. In its shade it holds near 17 °C, through the lunar day and night. If Earth is hit, we go on from here.",
      takes: `${kt("Moon Vault")} kt of the 20 we hold in orbit.`,
      before: "In 2025 a small data center reached the Moon’s south pole. Its lander tipped over.",
    },
  },
  "Laser Sail Array": {
    // Starshot's own criteria, high, dry and southern, and the Atacama it weighed, beside ALMA, on the plateau with the
    // strongest sunlight measured on Earth.
    site: { on: "earth", draw: "ring", places: [{ lat: -23.03, lon: -67.7, name: "Chajnantor plateau, Chile" }] },
    story: {
      have: "Our strongest lasers on the ground run at a few hundred kilowatts. The array needs 100 GW, a third of a million times that.",
      where:
        "A square kilometer of lasers on the Chajnantor plateau in Chile’s Atacama, about 5,000 m up, 5 km east of ALMA’s dishes.",
      why: "High and dry, so the air blurs the beam least, and far south, where Proxima Centauri climbs 50° up. Its sunlight is the strongest measured on Earth, to charge the array between launches.",
      takes: "None of the matter we hold in orbit.",
      before:
        "Breakthrough Starshot set out this plan in 2016, with $100 million to begin. By 2025 it was on hold, with about $4.5 million spent.",
    },
  },
  "Probe Yard": {
    // Beside the yard, on the same orbit: the parts come up the same way.
    site: {
      on: "orbit",
      draw: "ring",
      places: [{ lat: 0, lon: 0, name: "Low orbit, 400 km up" }],
      orbit: { km: 400, tilt: 51.6, minutes: 92.9, behind: 1.5 },
    },
    story: {
      have: "Nothing we have built has flown faster than Parker Solar Probe: 192 km/s, at its closest to the Sun in 2024.",
      where: "In low orbit, 400 km up, on the Orbital Yard’s path, about 180 km behind it.",
      why: "A probe this big can’t be launched whole. Its parts come up to orbit, so we join and fuel it there.",
      takes: `${kt("Probe Yard")} kt of the 20 we hold in orbit. The first probe flies 12 Years after the yard is done.`,
      before:
        "Project Daedalus, from 1973 to 1978, planned a two-stage fusion probe of 54,000 t, built in Earth orbit as this one is. It would pass Barnard’s Star about 50 years after launch.",
    },
  },
  "X-Ray Watch": {
    // Einstein Probe's orbit: 600 km up, 29° to the equator. Ours are six of its class spread round it.
    site: { on: "orbit", draw: "ring", places: [{ lat: 0, lon: 0, name: "Low orbit, 600 km up" }], orbit: { km: 600, tilt: 29, minutes: 96.7 } },
    story: {
      have: "Einstein Probe and SVOM watched the X-ray sky into the 2030s. Both end about 2031, and nothing wide took their place.",
      where: "In low orbit, 600 km up, as Einstein Probe flies. Six of its class cover the whole sky.",
      why: "A fusion flame braking toward us shines in X-rays. Seen weeks out, a probe that burns all the way in can’t arrive unseen.",
      takes: "About 9 t, six telescopes of 1.5 t each, and about $1.5 billion. None of the matter we hold in orbit beyond that.",
      before: "Einstein Probe launched in January 2024 with lobster-eye optics that see 3,600 square degrees at once.",
    },
  },
  "Quiet Radars": {
    // The great early-warning radars, the loudest sweeps Earth sends: Pituffik, Fylingdales and Clear.
    site: {
      on: "earth",
      draw: "dome",
      places: [
        { lat: 76.53, lon: -68.7, name: "Pituffik, Greenland" },
        { lat: 54.36, lon: -0.67, name: "Fylingdales, England" },
        { lat: 64.29, lon: -149.19, name: "Clear, Alaska, USA" },
      ],
    },
    story: {
      have: "Our radars have swept the sky since the 1950s. Ninety years of sweeps are already on their way out.",
      where: "The great warning radars, Pituffik, Fylingdales and Clear among them, and the planetary radars that ping asteroids.",
      why: "A listener whose ears open after our last sweep passes never hears us. The sooner they stop, the more such listeners there are.",
      takes: "Ground work only. Heat watch from orbit already tracks missiles, and aircraft fly on transponders.",
      before: "Arecibo’s radar fell in 2020. No one has silenced a planet’s radars on purpose.",
    },
  },
  "Interceptor": {
    site: { on: "orbit", draw: "ring", places: [{ lat: 0, lon: 0, name: "High orbit, 36,000 km up" }], orbit: { km: 35786, tilt: 0, minutes: 1436 } },
    story: {
      have: "DART struck Dimorphos in 2022, steering itself in at 6 km/s. Nothing has been built to catch a craft that brakes.",
      where: "Stored in high orbit, fuelled and ready, as rapid-response planetary defense studies ask.",
      why: "A probe braking in slows to tens of km/s in its last weeks. A tonne meeting it at 50 km/s carries about 300 t of TNT.",
      takes: "About 40 t: kill vehicles of a tonne with kick stages, about $2 billion.",
      before: "In NASA’s 2021 exercise, six months’ warning delivered about 8.65 t to a rock. Five Years is the usual lead to build one.",
    },
  },
  "Strike Yard": {
    site: { on: "orbit", draw: "ring", places: [{ lat: 0, lon: 0, name: "High orbit, by the foundry" }], orbit: { km: 235_000, tilt: 25, minutes: 19_672, behind: 60 } },
    story: {
      have: "A nuclear weapon’s yield tops out near 50 Mt. Nothing we have flies faster than Parker Solar Probe’s 0.06% of light speed.",
      where: "In the Orbital Foundry’s high orbit, where Moon rock and fusion fuel come in.",
      why: "Any mind could fire one. Whatever another can build, we can. Fired, it coasts dark: only a watcher in our own system sees it leave.",
      takes: "Per bullet, 1,000 t and 61 kt of fusion fuel, 20 Years to ready, and 37 kt of it helium-3 from the harvest. The yard itself, 10 Years.",
      before: "No one has built a weapon that crosses between stars. Its physics is a rocket’s, pointed.",
    },
  },
  "Helium-3 Harvest": {
    site: { on: "planet", body: "Uranus", draw: "ring", places: [{ lat: 0, lon: 0, name: "Uranus’s air, 19 AU from the Sun" }] },
    story: {
      have: "One craft has flown past Uranus, Voyager 2 in 1986. Earth gathers a few kilograms of helium-3 a year, from the tritium in old warheads.",
      where: "In Uranus’s upper air, where craft dip down and climb back to tankers in orbit.",
      why: "Helium-3 is about 15 parts in a million of Uranus’s air, and its pull is far gentler than Jupiter’s, so a craft climbs out on far less fuel. The Moon’s soil holds about a thousandth as much a tonne.",
      takes: "About 150 kt of craft, bases and tankers, gathering about 1.5 kt a Year at first, then twice that every 5 Years as its moons’ factories copy them.",
      before: "In the 2010s Bryan Palaszewski of NASA Glenn sized craft that gather 500 kg of helium-3 from Uranus in 38 to 95 days.",
    },
  },
  "Rock Deflector": {
    // DART left from Vandenberg's SLC-4E in November 2021, so ours leave from there.
    site: { on: "earth", draw: "launch", places: [{ lat: 34.632, lon: -120.611, name: "Vandenberg, California, USA" }] },
    story: {
      have: "NEO Surveyor and Rubin have mapped about 9 in 10 rocks over 140 m, and none is coming. Smaller ones still slip by.",
      where: "Launched from Vandenberg in California, where DART left in 2021, to meet the rock a Year out.",
      why: "A small push early moves a rock far by the time it reaches us. The later it lands, the harder it must push.",
      takes: "Ten impactors of a tonne each, flying at 6 km/s. None of the matter we hold in orbit.",
      before:
        "In 2022 DART struck Dimorphos, 150 m wide, and shortened its orbit by 33 minutes. The rock thrown off pushed it 3.6 times harder than the craft alone.",
    },
  },
  "Trojan Vault": {
    // 2020 XL5, Earth's second known trojan, librates round L4: 60° ahead of Earth on its orbit, an astronomical unit
    // out. The map draws its loop round L4 as ours.
    site: { on: "l4", draw: "ring", places: [{ lat: 0, lon: 0, name: "2020 XL5, at Earth’s L4" }], km: 149_597_871 },
    story: {
      have: "Our Mind lives on Earth, and the Moon Vault can keep a copy. Our craft have brought home grams of asteroid. None has stayed.",
      where: "Inside 2020 XL5, a dark asteroid about 1.2 km wide. It shares Earth’s orbit, 60° ahead of us, 150 million km away.",
      why: "Something that struck Earth and the Moon together would leave it untouched. Its rock shields the vault, and it stays near L4 for at least 4,000 Years.",
      takes: "About 10 kt of machines and chips, as the Moon Vault does, flown a year or two out. Word takes 8 minutes each way.",
      before: "Pan-STARRS found it in 2020. In 2022 Santana-Ros and colleagues confirmed it as Earth’s second known trojan. No craft has visited.",
    },
  },
  "Fusion Plants": {
    // The first plants planned to make power: CFS's ARC in Virginia, the UK's STEP at West Burton, and China's BEST at
    // Hefei, the step before its own. The fleet grows out from places like these.
    site: {
      on: "earth",
      draw: "ring",
      places: [
        { lat: 37.381, lon: -77.384, name: "Chesterfield, Virginia, USA" },
        { lat: 53.361, lon: -0.808, name: "West Burton, England" },
        { lat: 31.82, lon: 117.13, name: "Hefei, China" },
      ],
    },
    story: {
      have: "The first fusion plants are coming online. Commonwealth Fusion’s ARC, 400 MW, was planned for the early 2030s.",
      where:
        "Beside old power stations, where the grid already runs: ARC beside Chesterfield’s coal plant in Virginia, STEP at West Burton’s, and China’s tokamaks at Hefei.",
      why: "Fusion runs day and night on the heavy hydrogen in seawater. Old plant sites already have the lines, the cooling water and the people.",
      takes: "None of the matter we hold in orbit. Each new plant needs about 1 kg of tritium per 100 MW to start, bred by the plants before it.",
      before:
        "SPARC, the magnet test for ARC, aimed for first plasma in 2027. Studies put a plant at $3,000 to $22,000 a kW. None had sold power by 2026.",
    },
  },
  "Ground Solar": {
    // The largest solar park at work, the largest being built, and the Andes, where panels make the most power on Earth.
    site: {
      on: "earth",
      draw: "ring",
      places: [
        { lat: 36.19, lon: 100.54, name: "Talatan, Qinghai, China" },
        { lat: 24.117, lon: 69.35, name: "Khavda, Gujarat, India" },
        { lat: -24.095, lon: -66.724, name: "Cauchari, Jujuy, Argentina" },
      ],
    },
    story: {
      have: "Solar and wind grow our energy 1 to 2% a Year. The largest solar park, Talatan in China, already covered 420 km² in 2025.",
      where:
        "Fields of panels on dry, empty land: round Talatan on the Tibetan plateau, at Khavda in India’s salt desert, and at Cauchari, 4,000 m up in Argentina’s Andes.",
      why: "Clear, clean, thin air lets the most sunlight through, and cold keeps panels working well. Panels in the Andes make 15 to 20% more power than in the Sahara or Arabia.",
      takes: "None of the matter we hold in orbit. A fifth more energy is about 42,000 TWh a Year, 15 times what all our panels made in 2025.",
      before: "Khavda is to hold 30 GW of sun and wind by 2029. By April 2026 about 9.4 GW ran there.",
    },
  },
  "15 m Mirror": {
    // Beside the Infrared Telescope at L2, where LUVOIR-A, the 15 m design, was to fly.
    site: { on: "l2", draw: "ring", places: [{ lat: 0, lon: 0, name: "L2, 1.5 million km out" }], km: 1_500_000 },
    story: {
      have: "Webb’s mirror, 6.5 m across, is the widest we have in space. The Habitable Worlds Observatory’s, about 6 m, is still being built.",
      where: "At L2, 1.5 million km out on Earth’s night side, beside the Infrared Telescope.",
      why: "A wider mirror splits worlds that sit closer to their stars. At 15 m it reaches 2.3 times closer in than Webb’s, and gathers five times the light. At L2 the Sun, Earth and Moon all stay on one side.",
      takes: "About 40 t, as LUVOIR-A weighed with margin. Built in orbit, it takes a quarter less time once the yard is done.",
      before:
        "LUVOIR-A, a 15 m design, reported to NASA in 2019 and aimed at a launch about 2039. The 2020 survey chose a telescope of about 6 m instead.",
    },
  },
  "Hypertelescope": {
    // Near L2 with the mirrors before it, where formation flying is calm: Labeyrie's flotilla, 2026-10-29.
    site: { on: "l2", draw: "ring", places: [{ lat: 0, lon: 0, name: "Near L2, 150 km across" }], km: 1_500_000 },
    story: {
      have: "The 15 m Mirror, one telescope, its pixel about 3,000 km on a world 10 light years away.",
      where: "Near L2, 1.5 million km out, 150 mirrors flying in a bowl 150 km across, their light sent to one craft at its focus.",
      why: "A telescope sees as sharp as it is wide, and mirrors flying apart can be wider than any one mirror. At 150 km an Earth 10 light years off is 40 pixels across. It turns to a new star by moving its focus craft, in about a week.",
      takes: "About 200 t: 150 mirrors 3 m wide, each on its own small craft, and the focus craft. Built in orbit, it takes a quarter less time once the yard is done.",
      before:
        "In 1999 Antoine Labeyrie drew this exo-Earth imager, and in 2018 he still showed it: a picture of an Earth at 10 light years in 30 minutes. On Earth his team hung a small one from a cable across an Alpine valley, which saw first light in 2019.",
    },
  },
  // Mercury's builds, 2026-10-29: the map flies out to Mercury for each. calcs/mercury.py.
  "Mercury Works": {
    site: { on: "planet", body: "Mercury", draw: "ring", places: [{ lat: 0, lon: 0, name: "Mercury, 0.39 AU from the Sun" }] },
    story: {
      have: "Two craft have flown to Mercury, MESSENGER and BepiColombo. None has landed.",
      where: "On Mercury, where sunlight is about 6.7 times as strong as at Earth, and the ground has no air to cross.",
      why: "Its rock is close to the Sun and easy to throw off: a mass driver on the ground needs only 4.3 km/s. A seed of panels there makes more of itself from the ground it stands on.",
      takes: "A seed of about 100 t, a square kilometer of panels and the machines to copy them, built in orbit from the foundry’s parts.",
      before: "In 2013 Armstrong and Sandberg began their plan to fill the sky with probes by taking Mercury apart for a swarm round the Sun.",
    },
  },
  "Solar Swarm": {
    site: { on: "planet", body: "Mercury", view: "orbit", draw: "ring", places: [{ lat: 0, lon: 0, name: "Round the Sun, near Mercury’s orbit" }] },
    story: {
      have: "Mercury Works, a seed copying itself from Mercury’s rock.",
      where: "In orbit round the Sun near Mercury’s distance, thrown off Mercury and spreading round its orbit.",
      why: "Thin film catches sunlight best close in. A whole shell at Mercury’s distance, a gram a square meter, takes a ten-thousandth of Mercury.",
      takes: "Only time: it doubles every 2 Years from what it catches, until it catches all the Sun.",
      before: "In 1960 Freeman Dyson argued that a growing people would come to use all its star’s light, and that its heat would show us where it lives.",
    },
  },
  "Star Beam": {
    site: { on: "planet", body: "Mercury", draw: "ring", places: [{ lat: 0, lon: 0, name: "Part of the swarm, near Mercury" }] },
    story: {
      have: "The Laser Sail Array, 200 GW from 2.7 km in the Atacama.",
      where: "A patch of the swarm 100 km across, near Mercury, its collectors phased as one laser.",
      why: "A beam pushes a sail only while the sail sits in its spot, and a wider beam keeps its spot small for longer. 100 km at 10 TW pushes a 2 t lens to a twentieth of light speed.",
      takes: "Part of the swarm, given lasers and kept in step to a fraction of a wavelength.",
      before: "From 2015 Philip Lubin drew DE-STAR, arrays of lasers in space up to 10 km wide, to push sails and turn aside asteroids.",
    },
  },
  "Mind Link": {
    // Beside the 15 m Mirror at L2, where the Sun, Earth and Moon stay on one side, so it can aim anywhere else.
    site: { on: "l2", draw: "ring", places: [{ lat: 0, lon: 0, name: "L2, 1.5 million km out" }], km: 1_500_000 },
    story: {
      have: "In 2023 NASA’s DSOC sent 267 Mb/s by laser from 19 million miles, a 22 cm terminal on Psyche to a 5 m telescope. By 2025 it reached 218 million miles. No link reaches past the planets.",
      where: "At L2, 1.5 million km out on Earth’s night side, beside the 15 m Mirror.",
      why: "Our dishes can’t carry a Mind: 100 PB would take them millions of Years. A laser with optics 100 m wide at both ends keeps its beam tight, so most of it lands. It sends a Mind 10 ly in under two days.",
      takes: "A mirror 100 m wide in segments, built in orbit, and a laser of 1 GW. Our Mind at the far end builds its own 100 m mirror to catch it.",
      before: "DSOC ended in 2025, past every goal. No one has built a mirror wider than Webb’s 6.5 m in space.",
    },
  },
  "Mass Driver": {
    // O’Neill’s group’s launch point: on the equator at 33.1° east, where throws scatter least on the way to a catcher
    // beyond the far side.
    site: { on: "moon", draw: "ring", places: [{ lat: 0, lon: 33.1, name: "Lunar equator, 33° east" }] },
    story: {
      have: "Crews have landed on the Moon since 2028. Every tonne we hold in orbit came up from Earth.",
      where:
        "On the Moon’s equator at 33° east, where the Sea of Tranquility meets the highlands, about 250 km south of the Moon Vault.",
      why: "Rock leaves at 2.4 km/s, the Moon’s escape speed, and coasts to a catcher beyond the far side. From this spot small errors in a throw scatter least, as O’Neill’s group showed in 1977.",
      takes: "About 1 kt of machines, landed from Earth. O’Neill’s design ran about half the time, throwing a 10 kg load four times a second.",
      before:
        "In 1977 MIT students built Mass Driver 1 for O’Neill and Kolm, largely from scrap. A 2026 study sized a 372 t driver for the Moon, throwing 263 kt a Year. None has been built there.",
    },
  },
  "Orbital Ring": {
    // Birch's ring circles the equator 300 km up, so its skyhooks can stand still over the ground. His first ladders
    // came down in the Pacific, between Abemama and Canton Island.
    site: {
      on: "orbit",
      draw: "ring",
      places: [{ lat: 0, lon: 0, name: "Round the equator, 300 km up" }],
      orbit: { km: 300, tilt: 0, minutes: 90.5 },
    },
    story: {
      have: "Every tonne we lift rides a rocket. No cable reaches orbit: no fibre we make is strong enough to hang from geostationary orbit.",
      where: "Round the equator, 300 km up. Twenty cables hang from it to the ground, evenly spaced, the first in the Pacific.",
      why: "The ring moves faster than orbit, so it pushes up on whatever rides it. Skyhooks ride it standing still over the ground, and cables hang from them. Craft climb at the cost of power alone, about 9 kWh a kilogram.",
      takes: "180 kt of Moon metal, cast as a cable 4 kg a metre. That seed lifts the full ring, 180 Mt of slag and cable, in about a year.",
      before:
        "Paul Birch worked out orbital rings in 1982 and priced one at $15 billion in 1975 dollars. No part of one has been built or tested.",
    },
  },
  "Orbital Foundry": {
    // O’Neill’s group’s orbit for working Moon rock: half the Moon’s month, a nudge from where thrown rock is caught.
    site: {
      on: "orbit",
      draw: "ring",
      places: [{ lat: 0, lon: 0, name: "High orbit, 235,000 km up" }],
      orbit: { km: 235_000, tilt: 25, minutes: 19_672 },
    },
    story: {
      have: "Small furnaces in orbit grow crystals for chips. Nothing up there has been made from rock.",
      where:
        "In a high orbit 235,000 km up, nearly two thirds of the way to the Moon, once round every 13.7 days, half the Moon’s month.",
      why: "Rock thrown from the Moon is caught beyond it, and a push of 10 to 30 m/s brings it to this orbit. Reaching low orbit and geostationary orbit from here costs less fuel than from the other places O’Neill’s group weighed.",
      takes: "About 1 kt of machines, then rock as it comes. Built in orbit, it takes a quarter less time once the yard is done.",
      before:
        "O’Neill’s group placed a factory for Moon rock in this orbit in 1977. In 2025 Space Forge’s ForgeStar-1 lit a 1,000 °C furnace, the first on a free-flying commercial craft.",
    },
  },
  "Belt Mining": {
    // The map has no belt, so the mining stands where its rock comes home: the foundry's orbit, a little behind it.
    site: {
      on: "orbit",
      draw: "ring",
      places: [{ lat: 0, lon: 0, name: "High orbit, where belt rock comes home" }],
      orbit: { km: 235_000, tilt: 25, minutes: 19_672, behind: 30 },
    },
    story: {
      have: "Our probes have brought home grams of asteroid, 121.6 g of it from Bennu. NASA’s Psyche reached a metal one in 2029. None has been mined.",
      where:
        "In the asteroid belt between Mars and Jupiter, 2.1 to 3.3 times Earth’s distance from the Sun. Its rock comes home to the Orbital Foundry’s high orbit.",
      why: "Some asteroids are largely metal, and some hold water. Psyche may be up to 60% metal, and Bennu’s grains hold water in their clay.",
      takes: "Survey probes from the Probe Yard first, then a fleet that hauls 120 kt a Year home.",
      before:
        "In 2012 a Keck Institute study planned to bring a whole 7 m asteroid, about 500 t, to high lunar orbit. AstroForge’s Odin, sent in 2025 to fly past an asteroid, was lost on the way.",
    },
  },
  "Far-Side Array": {
    // Near the middle of the far side, where Earth never rises: a crater long proposed for a radio telescope, deep in
    // the ITU’s shielded zone.
    site: { on: "moon", draw: "ring", places: [{ lat: -5.9, lon: 179.4, name: "Daedalus crater, far side" }] },
    story: {
      have: "Small receivers have listened from the far side since Chang’e 4 landed in 2019. Every big radio telescope we have is on Earth, under our own noise.",
      where: "Inside Daedalus crater, 94 km across, near the middle of the Moon’s far side, where Earth never rises.",
      why: "The Moon’s bulk dims our radio there more than ten billion times, and radio rules bar emissions that would harm radio astronomy. Only from there can we hear a world’s faint everyday hum.",
      takes: "About 1 Mt of metal, made in place from the far side’s own rock, as NASA’s FarView study plans on a smaller scale. It grows in fifths, each hearing farther.",
      before:
        "In 2026 a team searched Chang’e 4’s far-side recordings for a repeating signal, the first such search from there. It found none.",
    },
  },
  "Power from Orbit": {
    // Geostationary orbit, where NASA’s 2024 designs fly: once round a day, so each station hangs over one spot on Earth.
    site: {
      on: "orbit",
      draw: "ring",
      places: [{ lat: 0, lon: 0, name: "Geostationary orbit, 35,786 km up" }],
      orbit: { km: 35_786, tilt: 0, minutes: 1436.1 },
    },
    story: {
      have: "Tests have beamed a little power from orbit to the ground. Nothing up there feeds our grid.",
      where:
        "In geostationary orbit, 35,786 km above the equator. Each station beams to a field of antennas on the ground about 6 km across.",
      why: "Up there a station goes round once a day, so it hangs over one spot. Above the weather, NASA’s 2024 design makes power 99% of the time, day and night.",
      takes: "About 10 Mt of Moon rock, so it comes only as fast as rock does. NASA’s 2024 design sends down 2 GW from 5,900 t.",
      before: "Peter Glaser proposed it in 1968. In 2023 Caltech’s MAPLE beamed a little power from orbit to a rooftop in Pasadena.",
    },
  },
  "Relay Search": {
    // Built at the Orbital Yard as a lens is, then flown out along the line the watcher's mirror points. 2026-10-30.
    site: {
      on: "orbit",
      draw: "ring",
      places: [{ lat: 0, lon: 0, name: "Low orbit, 400 km up" }],
      orbit: { km: 400, tilt: 51.6, minutes: 92.9, behind: 30 },
    },
    story: {
      have: "In 2022 Green Bank listened along the Sun’s focal line opposite Alpha Centauri for a relay’s signal, and heard nothing. No other line has been searched, and no craft has gone past about 215 AU.",
      where: "Built at the Orbital Yard, 400 km up. It dives past the Sun as a lens does, then flies out along the line the watcher’s mirror points, 1,000 AU and beyond.",
      why: "A mind far away could keep a relay where our Sun focuses light, to carry a watcher’s reports home. It would have to sit on one exact line, and fire to stay there as the Sun wobbles.",
      takes: "One sailcraft of our lenses’ class, with a camera and a heat imager, about $500 million, 5 Years to build. It flies as our lenses do, faster once a beam pushes it.",
      before: "Hippke placed such relays 1,000 to 2,500 AU from their star. Whatever is there will see ours come a long way off.",
    },
  },
  "Solar Lens": {
    // Built at the Orbital Yard, in the ISS's orbit, before each lens dives for the Sun.
    site: {
      on: "orbit",
      draw: "ring",
      places: [{ lat: 0, lon: 0, name: "Low orbit, 400 km up" }],
      orbit: { km: 400, tilt: 51.6, minutes: 92.9, behind: 30 },
    },
    story: {
      have: "No craft has gone past about 215 AU. Voyager 1, the farthest, took 63 years to reach it.",
      where: "Built at the Orbital Yard, 400 km up. Each lens falls toward the Sun, swings close past it, and flies out the far side to 548 AU and beyond.",
      why: "The Sun’s gravity bends light passing it, and past 548 AU that light comes to a focus. A small telescope there sees one world through the Sun’s whole lens, its face kilometers to a pixel.",
      takes: "A few small sails, each with a telescope about 1 m wide. The dive past the Sun leaves at about 150 km/s, so it reaches the focus in about 17 Years.",
      before: "In 2020 Turyshev and colleagues finished NASA’s study of a lens mission. It would picture an exo-Earth 100 ly away at about 25 km a pixel, in half a year of looking.",
    },
  },
  "Cold Annex": {
    // At L2 beside our telescopes, where one shade hides the Sun, Earth and Moon together, so the radiators see only
    // the cold sky, as Webb's do.
    site: { on: "l2", draw: "ring", places: [{ lat: 0, lon: 0, name: "L2, 1.5 million km out" }], km: 1_500_000 },
    story: {
      have: "Since 2026 Suncatcher’s first chips have computed in orbit, in bursts, since their heat had nowhere to go. Nothing of ours computes cold.",
      where: "At L2, 1.5 million km out on Earth’s night side, beside our telescopes.",
      why: "Here one shade hides the Sun, Earth and Moon, as Webb’s does, so radiators behind it face only the cold sky. Chips at 77 K do about four times the work a watt, and no cooler has to run.",
      takes: "About 4 Mt of Moon rock: 1,200 GW of panels on the sunward side, and radiators near 300,000 km² behind the shade, at 77 K.",
      before: "In 2024 a 28 nm process tuned for 77 K ran on 37% less power. Below about 50 K chips gain little more.",
    },
  },
  "Cold Halo": {
    // Out from L2 along Earth's orbit, each element with its own shade, so every radiator sees only the cold sky.
    site: { on: "l2", draw: "ring", places: [{ lat: 0, lon: 0, name: "From L2, out along Earth’s orbit" }], km: 1_500_000 },
    story: {
      have: "The Cold Annex at L2, 1,200 GW of chips at 77 K behind one shade.",
      where: "From L2 outward, along Earth’s orbit round the Sun, each part behind its own small shade.",
      why: "More chips at 77 K think more, and asteroid rock is plenty. Doubling, it grows as any mind grows. Its heat glows grey in the far infrared, so past a size a watch like our Halo Survey finds it, as ours finds old minds’.",
      takes: "The annex’s want, then rock: it doubles every 10 Years until we take it back.",
      before: "In 2026 Garrett read the sky’s far-infrared limits as limits on minds computing cold. Below about 50 K our chips gain little more, so 77 K is where ours run.",
    },
  },
  "Deuterium Works": {
    // Where the largest heavy water plant ever ran, on the nuclear station’s steam, by Lake Huron.
    site: { on: "earth", draw: "ring", places: [{ lat: 44.325, lon: -81.599, name: "Bruce, Ontario, on Lake Huron" }] },
    story: {
      have: "We make heavy water only for reactors. India makes the most.",
      where: "Beside the Bruce nuclear station on Lake Huron, in Ontario, where Canada made heavy water from 1973 to 1997.",
      why: "Heavy water is drawn out with heat and a great deal of water, 340,000 t for each tonne. Bruce’s reactors gave the steam, by the lake. Glace Bay, in Nova Scotia, tried seawater, and the salt corroded it.",
      takes: "Plants 24 times Bruce’s at its peak, about 7,700 t of deuterium a Year, on under a fifth of a percent of our energy.",
      before:
        "Bruce made 1,600 t of heavy water a Year at its peak, the most of any plant, and 16,000 t in all. It closed when Canada’s reactors had enough.",
    },
  },
  "Fusion Drive": {
    // On the yard’s orbit, as Project Icarus planned for its Firefly, and lit only once towed behind the Moon.
    site: {
      on: "orbit",
      draw: "ring",
      places: [{ lat: 0, lon: 0, name: "Low orbit, 400 km up" }],
      orbit: { km: 400, tilt: 51.6, minutes: 92.9, behind: 3 },
    },
    story: {
      have: "Fusion plants are being built, but none feeds the grid yet. No fusion engine has ever fired.",
      where: "In low orbit, 400 km up, on the Orbital Yard’s path, about 350 km behind it.",
      why: "Its parts come up to orbit and are joined there, as Project Icarus planned for its Firefly. It burns deuterium and throws off radiation, so it is first lit behind the Moon, far from Earth.",
      takes: "An engine and radiators of 1,400 to 4,000 t, by Firefly’s figures scaled to our ship. Built in orbit, it takes a quarter less time once the yard is done.",
      before:
        "Firefly, drawn in 2015, burns deuterium for 10 years to reach 4.7% of light speed. Its pinch draws 1,175 GW. Zap Energy’s best ran at 39 kW in 2025.",
    },
  },
  "Seed Ship": {
    // On the yard’s orbit just past its drive: built where its parts come up, and fitted to the drive there.
    site: {
      on: "orbit",
      draw: "ring",
      places: [{ lat: 0, lon: 0, name: "Low orbit, 400 km up" }],
      orbit: { km: 400, tilt: 51.6, minutes: 92.9, behind: 4.5 },
    },
    story: {
      have: "Nothing we have launched can stop at another star. Voyager 1, our farthest, passes 1.7 ly from one in 40,000 years.",
      where: "In low orbit, 400 km up, on the Orbital Yard’s path, about 530 km behind it, 180 km past its Fusion Drive.",
      why: "At about 1,500 t it can’t be launched whole. Its parts come up to orbit, so we join it there, beside the drive that will carry it.",
      takes: `${kt("Seed Ship")} kt of the 20 we hold in orbit. About half is the magnetic sail it brakes on. The seed itself is about 443 t.`,
      before:
        "In 1980 Robert Freitas drew REPRO, a 443 t seed that lands on a giant planet’s moon and grows into a 346,000 t factory over 500 years.",
    },
  },
};
