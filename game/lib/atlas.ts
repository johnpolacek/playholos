// Loads the atlas's data and mounts its scene. The scene itself is ../src/strip.js, shared with the atlas.
import neighborhood from "../../data/neighborhood-meta.json";
import earth_daymap from "../../assets/earth_daymap.jpg";
import jupiter from "../../assets/jupiter.jpg";
import mars from "../../assets/mars.jpg";
import mercury from "../../assets/mercury.jpg";
import moon from "../../assets/moon.jpg";
import neptune from "../../assets/neptune.jpg";
import saturn from "../../assets/saturn.jpg";
import uranus from "../../assets/uranus.jpg";
import venus_atmosphere from "../../assets/venus_atmosphere.jpg";

// The maps the line drawing traces. It leaves out clouds, night lights, the Sun and Saturn's ring alpha.
const TEXTURES = { earth_daymap, jupiter, mars, mercury, moon, neptune, saturn, uranus, venus_atmosphere };

async function floats(url: URL) {
  return new Float32Array(await (await fetch(url)).arrayBuffer());
}

export type Theme = "light" | "dark";

export async function mountAtlas(
  parent: HTMLElement,
  theme: Theme,
  { onFrame }: { onFrame?(fromEarthAU: number): void } = {},
) {
  const [{ mountStrip }, stars, neighborhoodStars] = await Promise.all([
    import("../../src/strip.js"),
    floats(new URL("../../data/stars.bin", import.meta.url)),
    floats(new URL("../../data/neighborhood.bin", import.meta.url)),
  ]);
  const textures = Object.fromEntries(Object.entries(TEXTURES).map(([key, image]) => [key, image.src]));
  // Earth turns once a minute, for the look. It does not follow the game clock, where a Year passes
  // in 5 minutes and Earth would spin about once a second. Settled 2026-10-16. Still for reduced motion.
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  return mountStrip(parent, { textures, stars, neighborhoodStars, neighborhood, theme, date: new Date(), turnSeconds: still ? 0 : 60, onFrame });
}

// The first screen's drift drawn by the map's own scene instead of lib/drift.ts, to compare the two. Both follow the
// same flight, lib/flight.ts, so with the same epoch they are at the same place at the same moment.
export async function mountAtlasDrift(
  parent: HTMLElement,
  { theme, still, epoch, onFrame }: { theme: Theme; still: boolean; epoch?: number; onFrame?(fromEarthAU: number): void },
) {
  const { createFlight, LIFT } = await import("./flight");
  const flight = createFlight({ still, epoch });
  const strip = await mountAtlas(parent, theme, { onFrame });
  strip.drive((size: { x: number; y: number }, earth: Parameters<typeof flight.at>[1]) => {
    const { target, dir, D, up } = flight.at(flight.clock(), earth);
    return { target, direction: dir, distance: D, up, fov: flight.lens(size.x, size.y), lift: LIFT };
  });
  return {
    setTheme: (scheme: Theme) => strip.setTheme(scheme),
    home: () => flight.home(flight.clock()),
    dispose() {
      flight.dispose();
      strip.dispose();
    },
  };
}
