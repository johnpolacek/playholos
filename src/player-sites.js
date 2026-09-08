import { Vector3 } from 'three';
import { PC_LY } from './astronomy.js';
import { skyBasis } from './coordinates.js';
import { GALACTIC_CENTER, LY_AU } from './navigation.js';
import planets from '../data/player-sites/exoplanets.json';

export const GAME_MINUTES_PER_YEAR = 5;
const archive = 'https://exoplanetarchive.ipac.caltech.edu/overview/';
const earth = { id: 'P01', name: 'Earth', host: 'Sun', positionLy: [0, 0, 0], evidence: 'Observed world', description: 'Our reference world. The future singularity and player civilization are fictional.', source: 'https://science.nasa.gov/earth/', sourceLabel: 'NASA · Earth', note: 'The Sun represents Earth at interstellar scales. Planetary orbital offsets are not shown.' };
const choices = [
  ['Proxima Cen b', 'Proxima b', 'Nearest known exoplanet system. Its atmosphere and surface conditions remain unknown.'],
  ['Ross 128 b', 'Ross 128 b', 'A low-mass planet around a relatively quiet red dwarf. A temperate environment is possible, not established.'],
  ['GJ 1061 d', 'GJ 1061 d', 'A low-mass planet in a nearby red-dwarf system. Its orbit motivates investigation; oceans and life are fictional assumptions.'],
  ['GJ 273 b', 'Luyten b', 'A super-Earth receiving roughly Earth-like stellar flux. Its atmosphere and surface are not known.'],
  ["Teegarden's Star b", 'Teegarden b', 'A low-mass planet around a very cool red dwarf. A civilization here is a scenario premise.'],
  ['GJ 1002 b', 'GJ 1002 b', 'An Earth-mass-scale planet in its star’s habitable zone. That designation does not establish surface water.'],
  ['TRAPPIST-1 e', 'TRAPPIST-1 e', 'An Earth-sized planet in a compact seven-planet system. Webb observations have not established a habitable surface.'],
  ['LHS 1140 b', 'LHS 1140 b', 'A transiting super-Earth of interest for atmospheric studies. Its environment and suitability for life remain uncertain.'],
  ['TOI-700 d', 'TOI-700 d', 'An Earth-sized, habitable-zone planet. This more distant outpost stretches the local layout’s communication times.'],
];
const observed = [earth, ...choices.map(([key, name, description], i) => {
  const row = planets.find(p => p.pl_name === key);
  // The composite archive's GJ 273 distance conflicts with the published system
  // study. Explicitly adopt its 3.75 pc value, retaining the raw row for audit.
  const distancePc = key === 'GJ 273 b' ? 3.75 : row.sy_dist;
  return { id: `P${String(i + 2).padStart(2, '0')}`, name, host: row.hostname, evidence: 'Observed world', description,
    positionLy: skyBasis(row.ra, row.dec).radial.multiplyScalar(distancePc * PC_LY).toArray(),
    source: archive + encodeURIComponent(key), sourceLabel: 'NASA Exoplanet Archive',
    note: `Host position from catalog RA/Dec and adopted distance; planet orbit unresolved. ${key === 'GJ 273 b' ? 'Distance override: 3.75 pc from Pozuelos et al. (2020); archive composite currently lists 5.92 pc. ' : ''}Atmosphere, life, and a post-singularity civilization are not established by these data.`,
    distanceSource: key === 'GJ 273 b' ? 'https://arxiv.org/abs/2006.09403' : null };
})];

// Hand-authored spatial comparison, not a population or habitability model.
// Radii and heights are relative to the measured Galactic center; angles are
// in the atlas X/Z plane. No generated point is identified with a catalog star.
const fictional = [
  ['Nacre', 21000, 150, 120, 'K dwarf', 'An imagined ocean-rich terrestrial world.'],
  ['Ilex', 32000, 115, -180, 'G dwarf', 'An imagined terrestrial world with broad continental interiors.'],
  ['Serein', 25000, 75, 80, 'K dwarf', 'An imagined cloudy terrestrial world.'],
  ['Orison', 37000, 38, -110, 'G dwarf', 'An imagined terrestrial world in the outer disk.'],
  ['Talus', 23000, 0, 200, 'K dwarf', 'An imagined mountainous terrestrial world.'],
  ['Morrow', 33000, -42, -140, 'G dwarf', 'An imagined terrestrial world with shallow seas.'],
  ['Pelagos', 27000, -85, 90, 'K dwarf', 'An imagined terrestrial world dominated by archipelagos.'],
  ['Cael', 35000, -128, -220, 'G dwarf', 'An imagined terrestrial world around a Sun-like star.'],
  ['Lumen', 19000, -165, 150, 'K dwarf', 'An imagined terrestrial world in the inner disk.'],
];
const centerLy = GALACTIC_CENTER.clone().divideScalar(LY_AU);
const speculative = [earth, ...fictional.map(([name, radius, angle, height, spectral], i) => ({
  id: `P${String(i + 2).padStart(2, '0')}`, name, host: `Invented ${spectral} host`, evidence: 'Fictional world & host',
  description: fictional[i][5] + ' Biology and scenery are flavor; starting capabilities are assumed comparable.',
  positionLy: centerLy.clone().add(new Vector3(radius * Math.cos(angle * Math.PI / 180), height, radius * Math.sin(angle * Math.PI / 180))).toArray(),
  note: `Invented site: ${radius.toLocaleString('en-US')} ly from the Galactic center, ${height} ly vertical offset in the atlas frame. Its star, planet, environment, and civilization are all speculative. No claim of a detected host or real spiral-arm membership.`,
}))];

export const PLAYER_LAYOUTS = {
  observed: { name: 'Observed worlds', subtitle: 'Real planet sites · fictional civilizations', worlds: observed,
    description: 'Earth + nine confirmed exoplanets. Chosen for a nearby exploration study, not as evidence for ten inhabited systems.',
    caveat: 'Known planets ≠ known habitable worlds. This dense local civilization population is a fictional assumption.' },
  speculative: { name: 'Speculative galaxy', subtitle: 'Invented worlds · real galactic scale', worlds: speculative,
    description: 'Earth + nine invented systems spread through the Galactic disk. Host positions are authored, not observations.',
    caveat: 'Illustrative distribution, not a model of where life is likely. Equal capabilities do not imply equal geography.' },
};

export function separationLy(a, b) { return Math.hypot(...a.positionLy.map((x, i) => x - b.positionLy[i])); }
export function layoutStats(worlds) {
  const pairs = worlds.flatMap((a, i) => worlds.slice(i + 1).map(b => separationLy(a, b))).sort((a, b) => a - b);
  return { minimum: pairs[0], maximum: pairs.at(-1), median: pairs[Math.floor(pairs.length / 2)] };
}
export function realDelay(years) {
  const minutes = years * GAME_MINUTES_PER_YEAR;
  if (minutes < 60) return `${minutes.toFixed(1)} min`;
  if (minutes < 1440) return `${(minutes / 60).toFixed(1)} hr`;
  return `${(minutes / 1440).toFixed(1)} days`;
}
