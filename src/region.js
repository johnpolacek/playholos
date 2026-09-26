import { Vector3 } from 'three';
import { LY_AU } from './navigation.js';
import { sphereSilhouette } from './coordinates.js';
import { realDelay } from './player-sites.js';

const $ = id => document.getElementById(id);
const number = n => n.toLocaleString('en-US', { maximumFractionDigits: 0 });

// Design study: where a v1 cohort plays. The real solar neighborhood, 100 ly
// around the Sun, drawn from the complete census instead of the HYG subset.
export function createRegion({ state, pose, flyTo, projectAU, onChange, beforeShow, meta }) {
  let active = false, previous = null;
  const panel = document.createElement('aside');
  panel.id = 'region-panel'; panel.className = 'study-panel'; panel.hidden = true; panel.setAttribute('aria-label', 'The v1 game region');
  panel.innerHTML = `
    <div class="godview-heading"><div><div class="eyebrow">DESIGN STUDY · V1 GAME REGION</div><h1>The real neighborhood</h1></div><button id="region-close" aria-label="Return to the atlas" title="Return to the atlas">×</button></div>
    <p class="region-lede">Where a v1 cohort plays: every known star within ${meta.radiusLy} light-years of the Sun. Civilizations are seeded inside ${meta.seedRadiusLy} ly; the outer shell is frontier. Earth is present in every cohort.</p>
    <div class="godview-actions"><button id="region-fit">Frame the region</button><button id="region-top">View from above</button></div>
    <div class="godview-stats"><div><span>Within ${meta.radiusLy} ly</span><strong>${number(meta.count)}</strong><em>${realDelay(meta.radiusLy)} light-time</em></div><div><span>Within ${meta.seedRadiusLy} ly</span><strong>${number(meta.withinSeed)}</strong><em>${realDelay(meta.seedRadiusLy)} light-time</em></div></div>
    <dl class="region-sources">
      <div><dt>Gaia Catalogue of Nearby Stars</dt><dd>${number(meta.gaia)}</dd></div>
      <div><dt>Bright stars Gaia does not measure, from Hipparcos</dt><dd>${number(meta.hipparcosSupplement)}</dd></div>
      <div><dt>White dwarfs, included above</dt><dd>${number(meta.whiteDwarfs)}</dd></div>
    </dl>
    <p class="godview-footnote">Light-time is one way at the game clock, 5 real minutes per game year. Objects are counted individually; binary components count separately.</p>
    <p class="godview-caveat">No planets or civilizations are shown. Homes will be invented planets around these real stars. The census still misses the faintest brown dwarfs, and distances carry parallax uncertainty.</p>
    <p class="godview-footnote">Gaia EDR3 positions at epoch J2016.0; Hipparcos stars via HYG 4.1 at J2000.0. Outside ${meta.radiusLy} ly the atlas keeps its HYG stars.</p>`;
  document.querySelector('.exploration-panel').append(panel);
  const caption = document.createElement('div');
  caption.id = 'region-caption'; caption.className = 'study-caption'; caption.hidden = true;
  caption.innerHTML = `<span class="eyebrow">DESIGN STUDY · WHERE V1 PLAYS</span><strong>${meta.radiusLy} light-years around the Sun</strong><span>${number(meta.count)} real stars · civilizations seeded inside ${meta.seedRadiusLy} ly</span><span class="region-legend"><i></i> Region edge · ${meta.radiusLy} ly <i class="seed"></i> Seeding limit · ${meta.seedRadiusLy} ly</span>`;
  $('atlas').append(caption);
  const layer = document.createElement('div'); layer.id = 'region-labels'; layer.hidden = true; layer.setAttribute('aria-hidden', 'true'); $('atlas').append(layer);
  const label = (text, kind) => { const el = document.createElement('span'); el.className = `region-label ${kind}`; el.textContent = text; layer.append(el); return el; };
  const landmarks = [{ name: 'Sun · Earth', pos: [0, 0, 0], home: true }, ...meta.landmarks].map(l => ({ ...l, el: label(l.name, l.home ? 'home' : 'star'), positionAU: new Vector3(...l.pos).multiplyScalar(LY_AU), projected: new Vector3() }));
  const rings = [[meta.radiusLy, `${meta.radiusLy} ly · region edge`], [meta.seedRadiusLy, `${meta.seedRadiusLy} ly · seeding limit`]].map(([radius, text]) => ({ radius, el: label(text, 'ring') }));

  function fit({ instant = false, above = false } = {}) {
    const mobile = innerWidth <= 760 ? Math.max(1.5, innerHeight / innerWidth * 1.05) : 1;
    const direction = above ? new Vector3(0, 1, .001).normalize() : new Vector3(.42, .5, .76).normalize();
    flyTo({ target: new Vector3(), direction, distance: meta.radiusLy * 3.1 * mobile * LY_AU, home: false, follow: null }, 'the game region', { instant });
  }
  function show({ instant = false } = {}) {
    if (!active) { beforeShow?.(); previous = { target: pose.target.clone(), direction: pose.direction.clone(), distance: pose.distance, home: pose.home, follow: pose.follow, star: state.star, galaxy: state.galaxy, reconstruction: state.reconstruction, hash: location.hash }; }
    active = true; state.region = true; state.playing = false; state.star = null; state.galaxy = null; state.reconstruction = false; $('reconstruction').checked = false;
    $('atlas').classList.add('study-active', 'region-active'); $('region-open').setAttribute('aria-pressed', 'true');
    panel.hidden = caption.hidden = layer.hidden = false;
    fit({ instant }); history.replaceState(null, '', '#region'); onChange();
  }
  function hide() {
    if (!active) return;
    active = false; state.region = false; panel.hidden = caption.hidden = layer.hidden = true;
    $('atlas').classList.remove('study-active', 'region-active'); $('region-open').setAttribute('aria-pressed', 'false');
    if (previous) {
      Object.assign(state, { star: previous.star, galaxy: previous.galaxy, reconstruction: previous.reconstruction }); $('reconstruction').checked = previous.reconstruction;
      flyTo(previous, 'the atlas'); history.replaceState(null, '', previous.hash === '#region' ? '#earth' : previous.hash || '#earth');
    }
    onChange();
  }
  // Labels are map annotations: placed beside their point, hidden rather than
  // allowed to collide with the panels, one another, or the region outlines' labels.
  function render() {
    if (!active) return;
    const width = innerWidth, height = innerHeight, occupied = [];
    const zones = [panel, caption, document.querySelector('.topbar'), document.querySelector('.bottom-panel'), document.querySelector('.view-tools')].filter(e => e.getClientRects().length).map(e => e.getBoundingClientRect());
    const free = (x, y, w, h) => x >= 8 && y >= 8 && x + w <= width - 8 && y + h <= height - 8 && ![...zones, ...occupied].some(r => x < r.right + 6 && x + w > r.left - 6 && y < r.bottom + 4 && y + h > r.top - 4);
    const place = (el, candidates) => {
      if (!state.labels) { el.hidden = true; return; }
      el.hidden = false; const w = el.offsetWidth, h = el.offsetHeight;
      const spot = candidates(w, h).find(([x, y]) => free(x, y, w, h));
      if (!spot) { el.hidden = true; return; }
      el.style.transform = `translate(${spot[0]}px,${spot[1]}px)`; occupied.push({ left: spot[0], top: spot[1], right: spot[0] + w, bottom: spot[1] + h });
    };
    const camera = pose.target.clone().addScaledVector(pose.direction, pose.distance).divideScalar(LY_AU);
    for (const ring of rings) {
      const outline = sphereSilhouette(ring.radius, camera, 64);
      const screen = outline?.map(p => projectAU(p.multiplyScalar(LY_AU), new Vector3())).filter(p => p.z > -1 && p.z < 1).map(p => [(p.x + 1) * width / 2, (1 - p.y) * height / 2]);
      if (!screen?.length) { ring.el.hidden = true; continue; }
      // Prefer the outline's top, then its lower-right side where the panels are not.
      const top = screen.reduce((a, b) => b[1] < a[1] ? b : a), side = screen.reduce((a, b) => b[0] + b[1] > a[0] + a[1] ? b : a);
      place(ring.el, (w, h) => [[top[0] - w / 2, top[1] - h - 6], [top[0] - w / 2, top[1] + 6], [side[0] + 6, side[1]], [side[0] - w - 6, side[1] - h - 4]]);
    }
    for (const landmark of landmarks) {
      const p = projectAU(landmark.positionAU, landmark.projected);
      if (p.z < -1 || p.z > 1 || Math.abs(p.x) > 1.05 || Math.abs(p.y) > 1.05) { landmark.el.hidden = true; continue; }
      const x = (p.x + 1) * width / 2, y = (1 - p.y) * height / 2;
      place(landmark.el, (w, h) => [[x + 8, y - h / 2], [x - w - 8, y - h / 2], [x - w / 2, y - h - 6], [x - w / 2, y + 6]]);
    }
  }
  $('region-open').onclick = () => active ? hide() : show();
  $('region-close').onclick = hide; $('region-fit').onclick = () => fit(); $('region-top').onclick = () => fit({ above: true });
  return { show, hide, fit, render, get active() { return active; },
    getState: () => ({ active, radiusLy: meta.radiusLy, seedRadiusLy: meta.seedRadiusLy, count: meta.count, withinSeed: meta.withinSeed, visibleLabels: [...landmarks.map(l => l.el), ...rings.map(r => r.el)].filter(el => !el.hidden).map(el => el.textContent) }) };
}
