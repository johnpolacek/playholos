import { Box3, Vector3 } from 'three';
import { LY_AU } from './navigation.js';
import { PLAYER_LAYOUTS, layoutStats, realDelay, separationLy } from './player-sites.js';

const $ = id => document.getElementById(id);
const number = n => n.toLocaleString('en-US', { maximumFractionDigits: n < 100 ? 1 : 0 });
const svgNS = 'http://www.w3.org/2000/svg';

export function createGodview({ state, pose, universe, flyTo, projectAU, onChange }) {
  let active = false, layoutKey = 'observed', selectedId = 'P01', targetId = 'P02', previous = null, markers = [];
  const panel = document.createElement('aside');
  panel.id = 'godview-panel'; panel.hidden = true; panel.setAttribute('aria-label', 'Civilization placement study');
  panel.innerHTML = `
    <div class="godview-heading"><div><div class="eyebrow">ADMIN · PLACEMENT STUDY</div><h1>Ten civilizations</h1></div><button id="godview-close" aria-label="Return to the atlas" title="Return to the atlas">×</button></div>
    <div class="godview-tabs" role="group" aria-label="Placement scenario"><button data-layout="observed" aria-pressed="true">Real planet sites</button><button data-layout="speculative" aria-pressed="false">Invented planet sites</button></div>
    <p class="godview-alternatives">Alternative layouts · same 10 player slots</p>
    <p id="godview-description"></p>
    <div class="godview-actions"><button id="godview-fit">Frame all 10</button><button id="godview-focus">Approach selected</button></div>
    <div class="godview-measure"><span id="godview-measure-from"></span><label for="godview-target">Measure to</label><select id="godview-target"></select><output id="godview-measure-value" aria-live="polite"></output><small>Select a world on the map to change the origin.</small></div>
    <div class="godview-stats"><div><span>Closest pair</span><strong id="godview-min"></strong><em id="godview-min-delay"></em></div><div><span>Widest pair</span><strong id="godview-max"></strong><em id="godview-max-delay"></em></div></div>
    <div class="godview-selection" aria-live="polite"><div class="eyebrow" id="godview-evidence"></div><h2 id="godview-name"></h2><p id="godview-world-description"></p><details><summary>Site evidence & assumptions</summary><p id="godview-note"></p><a id="godview-source" target="_blank" rel="noopener"></a><p id="godview-habitability"></p><a id="godview-research" target="_blank" rel="noopener" hidden>Habitability research · assumptions & limits</a><a id="godview-distance-source" target="_blank" rel="noopener" hidden>Adopted distance · system study</a></details></div>
    <div class="godview-roster-head"><span id="godview-from"></span><span>Distance / arrival</span></div>
    <div id="godview-roster" aria-label="Ten player sites"></div>
    <p class="godview-footnote">Arrival = minimum one-way message delay in real time.<br>5 min = 1 game year. A reply takes at least twice as long.</p>
    <p class="godview-caveat" id="godview-caveat"></p>`;
  document.querySelector('.exploration-panel').append(panel);
  const overlay = document.createElementNS(svgNS, 'svg'); overlay.id = 'godview-lines'; overlay.setAttribute('aria-hidden', 'true'); overlay.setAttribute('hidden', '');
  const links = document.createElementNS(svgNS, 'path'), leaders = document.createElementNS(svgNS, 'path'), measurement = document.createElementNS(svgNS, 'path');
  links.classList.add('godview-links'); leaders.classList.add('godview-leaders'); measurement.classList.add('godview-measure-line'); overlay.append(links, measurement, leaders); $('atlas').append(overlay);
  const measureLabel = document.createElement('span'); measureLabel.id = 'godview-measure-label'; measureLabel.hidden = true; $('atlas').append(measureLabel);
  const markerLayer = document.createElement('div'); markerLayer.id = 'godview-markers'; markerLayer.hidden = true; markerLayer.setAttribute('aria-label', 'Player sites on the map'); $('atlas').append(markerLayer);
  const caption = document.createElement('div'); caption.id = 'godview-caption'; caption.hidden = true;
  caption.innerHTML = '<span class="eyebrow">ALL PLAYERS VISIBLE · ADMIN VIEW</span><strong id="godview-caption-title"></strong><span id="godview-caption-subtitle"></span><span class="godview-legend"><i></i> Observed site <i class="fictional"></i> Invented site · All civilizations fictional</span>';
  $('atlas').append(caption);

  function worlds() { return PLAYER_LAYOUTS[layoutKey].worlds; }
  function selected() { return worlds().find(w => w.id === selectedId); }
  function target() { return worlds().find(w => w.id === targetId); }
  function updateMeasurement() {
    const distance = separationLy(selected(), target());
    $('godview-measure-from').textContent = `From ${selected().id} · ${selected().name}`;
    $('godview-measure-value').textContent = `${number(distance)} ly · ${realDelay(distance)} one way`;
    measureLabel.textContent = `${selectedId} ↔ ${targetId} · ${number(distance)} ly`;
  }
  function buildMarkers() {
    markerLayer.replaceChildren();
    markers = worlds().map(world => {
      const dot = document.createElement('span'), label = document.createElement('button');
      dot.className = 'godview-dot'; label.className = 'godview-marker'; label.textContent = `${world.id} · ${world.name}`;
      label.setAttribute('aria-label', `Select ${world.id}, ${world.name}`); label.onclick = () => select(world.id);
      const fictional = world.evidence.startsWith('Fictional');
      dot.classList.toggle('fictional', fictional); label.classList.toggle('fictional', fictional);
      markerLayer.append(dot, label);
      return { world, dot, label, position: new Vector3(...world.positionLy).multiplyScalar(LY_AU), projected: new Vector3() };
    });
  }
  function select(id) {
    const restoreRosterFocus = $('godview-roster').contains(document.activeElement);
    selectedId = id;
    const origin = selected();
    const destinations = worlds().filter(w => w.id !== id);
    if (!destinations.some(w => w.id === targetId)) targetId = destinations.reduce((a, b) => separationLy(origin, a) < separationLy(origin, b) ? a : b).id;
    $('godview-target').replaceChildren(...destinations.map(w => { const option = document.createElement('option'); option.value = w.id; option.textContent = `${w.id} · ${w.name}`; return option; }));
    $('godview-target').value = targetId; updateMeasurement();
    $('godview-name').textContent = `${origin.id} · ${origin.name}`;
    $('godview-evidence').textContent = `${origin.evidence} · ${origin.host}`;
    $('godview-world-description').textContent = origin.description;
    $('godview-note').textContent = origin.note;
    $('godview-habitability').textContent = origin.habitability || '';
    $('godview-habitability').hidden = !origin.habitability;
    $('godview-research').hidden = !origin.research;
    if (origin.research) $('godview-research').href = origin.research;
    $('godview-source').hidden = !origin.source;
    if (origin.source) { $('godview-source').href = origin.source; $('godview-source').textContent = origin.sourceLabel; }
    $('godview-distance-source').hidden = !origin.distanceSource;
    if (origin.distanceSource) $('godview-distance-source').href = origin.distanceSource;
    $('godview-from').textContent = `From ${origin.id} · ${origin.name}`;
    $('godview-roster').replaceChildren(...worlds().map(world => {
      const distance = separationLy(origin, world), row = document.createElement('button'); row.className = 'godview-row';
      row.setAttribute('aria-pressed', String(world.id === id));
      const identity = document.createElement('span'), badge = document.createElement('small'), name = document.createElement('span'), values = document.createElement('span');
      badge.textContent = world.id; name.textContent = world.name; identity.append(badge, name); values.className = 'godview-row-values';
      if (world.id === id) values.textContent = 'Selected origin';
      else { const d = document.createElement('span'), t = document.createElement('em'); d.textContent = `${number(distance)} ly`; t.textContent = realDelay(distance); values.append(d, t); }
      row.append(identity, values); row.onclick = () => select(world.id);
      return row;
    }));
    if (restoreRosterFocus) $('godview-roster').querySelector('[aria-pressed="true"]').focus({ preventScroll: true });
    markers.forEach(marker => { const isSelected = marker.world.id === id; marker.label.setAttribute('aria-pressed', String(isSelected)); marker.dot.classList.toggle('selected', isSelected); });
  }
  function fit({ instant = false } = {}) {
    const bounds = new Box3().setFromPoints(worlds().map(w => new Vector3(...w.positionLy)));
    const target = bounds.getCenter(new Vector3()), radius = bounds.getSize(new Vector3()).length() / 2;
    const mobileFactor = innerWidth <= 760 ? Math.max(1.6, innerHeight / innerWidth * 1.1) : 1;
    flyTo({ target: target.multiplyScalar(LY_AU), direction: new Vector3(.15, 1, .65).normalize(), distance: radius * 3.6 * mobileFactor * LY_AU, home: false, follow: null }, 'all ten civilizations', { instant });
  }
  function setLayout(key, { instant = false } = {}) {
    if (!PLAYER_LAYOUTS[key]) return;
    layoutKey = key;
    const layout = PLAYER_LAYOUTS[key], stats = layoutStats(layout.worlds);
    document.querySelectorAll('[data-layout]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.layout === key)));
    $('godview-description').textContent = layout.description; $('godview-caveat').textContent = layout.caveat;
    $('godview-caption-title').textContent = layout.name; $('godview-caption-subtitle').textContent = layout.subtitle;
    $('godview-min').textContent = `${number(stats.minimum)} ly`; $('godview-max').textContent = `${number(stats.maximum)} ly`;
    $('godview-min-delay').textContent = `${realDelay(stats.minimum)} one way`; $('godview-max-delay').textContent = `${realDelay(stats.maximum)} one way`;
    // The galaxy background is explicitly illustrative and restored on exit.
    state.reconstruction = key === 'speculative'; $('reconstruction').checked = state.reconstruction;
    state.star = null; state.galaxy = null;
    targetId = layout.worlds.slice(1).reduce((a, b) => separationLy(layout.worlds[0], a) < separationLy(layout.worlds[0], b) ? a : b).id;
    buildMarkers(); select('P01'); fit({ instant });
    history.replaceState(null, '', `#godview-${key}`); onChange();
  }
  function show(key = layoutKey, options = {}) {
    if (!active) previous = { reconstruction: state.reconstruction, target: pose.target.clone(), direction: pose.direction.clone(), distance: pose.distance, home: pose.home, follow: pose.follow, star: state.star, galaxy: state.galaxy, hash: location.hash };
    active = true; state.playing = false;
    $('atlas').classList.add('godview-active'); $('godview-open').setAttribute('aria-pressed', 'true');
    panel.hidden = markerLayer.hidden = caption.hidden = false; overlay.removeAttribute('hidden');
    setLayout(key, options);
  }
  function hide() {
    active = false; panel.hidden = markerLayer.hidden = caption.hidden = measureLabel.hidden = true; overlay.setAttribute('hidden', '');
    $('atlas').classList.remove('godview-active'); $('godview-open').setAttribute('aria-pressed', 'false');
    if (previous) {
      state.reconstruction = previous.reconstruction; $('reconstruction').checked = previous.reconstruction;
      state.star = previous.star; state.galaxy = previous.galaxy;
      flyTo(previous, 'the atlas'); history.replaceState(null, '', previous.hash.startsWith('#godview') ? '#earth' : previous.hash || '#earth');
    }
    onChange(); $('godview-open').focus();
  }
  function render() {
    if (!active) return;
    const width = innerWidth, height = innerHeight;
    const zones = [panel, caption, document.querySelector('.topbar'), document.querySelector('.bottom-panel'), document.querySelector('.view-tools')].map(e => e.getBoundingClientRect());
    const occupied = [], projectedMarkers = markers.map(marker => {
      const p = projectAU(marker.position, marker.projected);
      return { ...marker, x: (p.x + 1) * width / 2, y: (1 - p.y) * height / 2, visible: p.z > -1 && p.z < 1 && Math.abs(p.x) < 1.05 && Math.abs(p.y) < 1.05 };
    });
    const origin = projectedMarkers.find(m => m.world.id === selectedId), segments = [], callouts = [];
    if (origin?.visible) for (const target of projectedMarkers) if (target.visible && target !== origin) segments.push(`M${origin.x},${origin.y}L${target.x},${target.y}`);
    for (const marker of projectedMarkers.sort((a, b) => Number(b.world.id === selectedId) - Number(a.world.id === selectedId))) {
      const { dot, label, x, y, visible, world } = marker;
      dot.hidden = label.hidden = !visible;
      if (!visible) continue;
      dot.style.transform = `translate(${x}px,${y}px)`;
      if (!state.labels) { label.hidden = true; continue; }
      const labelText = width <= 760 ? world.id : `${world.id} · ${world.name}`;
      if (label.textContent !== labelText) label.textContent = labelText;
      const w = label.offsetWidth, h = label.offsetHeight;
      const candidates = [[x + 12, y - h / 2], [x - w - 12, y - h / 2], [x - w / 2, y - h - 12], [x - w / 2, y + 12]];
      for (const radius of [45, 75, 110, 150, 195, 245]) for (const [dx, dy] of [[1, -1], [-1, -1], [1, 1], [-1, 1], [0, -1], [0, 1], [1, 0], [-1, 0]]) candidates.push([x + dx * radius - (dx < 0 ? w : dx === 0 ? w / 2 : 0), y + dy * radius - h / 2]);
      const blocked = (lx, ly) => lx < 8 || ly < 8 || lx + w > width - 8 || ly + h > height - 8 || [...zones, ...occupied].some(r => lx < r.right + 5 && lx + w > r.left - 5 && ly < r.bottom + 5 && ly + h > r.top - 5) || projectedMarkers.some(other => other !== marker && other.visible && other.x > lx - 8 && other.x < lx + w + 8 && other.y > ly - 8 && other.y < ly + h + 8);
      const location = candidates.find(([lx, ly]) => !blocked(lx, ly));
      if (!location) { label.hidden = true; continue; }
      const [lx, ly] = location; label.style.transform = `translate(${lx}px,${ly}px)`;
      occupied.push({ left: lx, top: ly, right: lx + w, bottom: ly + h });
      const ex = Math.max(lx, Math.min(lx + w, x)), ey = Math.max(ly, Math.min(ly + h, y));
      callouts.push(`M${x},${y}L${ex},${ey}`);
    }
    const destination = projectedMarkers.find(m => m.world.id === targetId);
    const pairVisible = origin?.visible && destination?.visible;
    measurement.setAttribute('d', pairVisible ? `M${origin.x},${origin.y}L${destination.x},${destination.y}` : '');
    measureLabel.hidden = !pairVisible;
    if (pairVisible) {
      const x = (origin.x + destination.x) / 2, y = (origin.y + destination.y) / 2;
      const w = measureLabel.offsetWidth, h = measureLabel.offsetHeight;
      const candidates = [0, -25, 25, -50, 50, -85, 85, -125, 125].map(dy => [x - w / 2, y + dy - h / 2]);
      for (const radius of [85, 125, 175, 235, 300]) for (const [dx, dy] of [[-1, 0], [1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1], [0, 1], [0, -1]]) candidates.push([x + dx * radius - w / 2, y + dy * radius - h / 2]);
      const location = candidates.find(([lx, ly]) => lx >= 8 && ly >= 8 && lx + w <= width - 8 && ly + h <= height - 8 && ![...zones, ...occupied].some(r => lx < r.right + 5 && lx + w > r.left - 5 && ly < r.bottom + 5 && ly + h > r.top - 5) && !projectedMarkers.some(m => m.visible && m.x > lx - 8 && m.x < lx + w + 8 && m.y > ly - 8 && m.y < ly + h + 8));
      if (location) {
        const [lx, ly] = location; measureLabel.style.transform = `translate(${lx}px,${ly}px)`;
        callouts.push(`M${x},${y}L${Math.max(lx, Math.min(lx + w, x))},${Math.max(ly, Math.min(ly + h, y))}`);
      } else measureLabel.hidden = true;
    }
    links.setAttribute('d', segments.join('')); leaders.setAttribute('d', callouts.join(''));
  }
  $('godview-open').onclick = () => active ? hide() : show();
  $('godview-close').onclick = hide; $('godview-fit').onclick = () => fit();
  $('godview-target').onchange = event => { targetId = event.target.value; updateMeasurement(); };
  $('godview-focus').onclick = () => flyTo({ target: new Vector3(...selected().positionLy).multiplyScalar(LY_AU), direction: pose.direction.clone(), distance: (layoutKey === 'observed' ? 12 : 16000) * LY_AU, home: false, follow: null }, selected().name);
  document.querySelectorAll('[data-layout]').forEach(button => button.onclick = () => setLayout(button.dataset.layout));
  return { show, hide, fit, render, get active() { return active; }, getState: () => ({ active, layout: layoutKey, selected: selectedId, target: targetId, measuredDistanceLy: separationLy(selected(), target()), stats: layoutStats(worlds()), worlds: worlds().map(w => ({ id: w.id, name: w.name, evidence: w.evidence, positionLy: w.positionLy, distanceFromSelectedLy: separationLy(selected(), w) })) }) };
}
