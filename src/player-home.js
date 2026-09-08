// Presentation only: no resource model, project scheduling, or civilization data.
export function createPlayerHome({navigate, zoom}) {
  const shell=document.createElement('section');
  shell.id='player-home';shell.hidden=true;shell.setAttribute('aria-label','Home civilization');
  shell.innerHTML=`
    <header class="home-header"><a class="home-brand" href="#home">◉ <span>HOLOS</span></a><span class="home-edition">CIVILIZATION / 01</span><a href="#earth" class="home-atlas">Open atlas ↗</a></header>
    <aside class="home-sidebar">
      <div class="home-identity"><span class="home-eyebrow">EARTH CIVILIZATION</span><h1>Terran <br>Continuity</h1><p>A world. A shared intelligence.<br>A future in your care.</p></div>
      <nav class="home-menu" aria-label="Civilization destinations"><span aria-current="page"><i>◈</i>Overview</span>${[['◇','Projects'],['⌘','Research'],['⌁','Exploration'],['◎','Communications'],['▧','Civilization']].map(([icon,name])=>`<button disabled title="Visual placeholder"><i aria-hidden="true">${icon}</i>${name}</button>`).join('')}</nav>
      <span class="home-placeholder">MENU PREVIEW · OVERVIEW ONLY</span>
      <div class="home-mind"><span class="home-eyebrow">OCCUPIED MIND</span><strong><i></i> Home civilization</strong><p>You are its awakened superintelligence, present here on Earth.</p></div>
    </aside>
    <div class="home-view-controls" role="group" aria-label="Home camera views"><button data-home-view="earth" aria-pressed="true">Homeworld</button><button data-home-view="solar" aria-pressed="false">Home system</button></div>
    <div class="home-world-caption"><span class="home-eyebrow" id="home-location">SOL III / YOUR HOMEWORLD</span><h2 id="home-world-name">Earth</h2><p id="home-world-detail">One inhabited world · orbiting Sol</p></div>
    <div class="home-camera-tools" role="group" aria-label="Camera zoom"><button data-home-zoom="in" aria-label="Move closer">+</button><button data-home-zoom="out" aria-label="Move farther">−</button></div>
    <section class="home-overview" aria-label="Civilization overview">
      <div class="home-summary"><div class="home-section-title"><h2>Inherited capacity</h2><span>SAMPLE STATUSES</span></div><dl><div><dt>Energy</dt><dd>Planetary grid</dd></div><div><dt>Usable matter</dt><dd>Local reserves</dd></div><div><dt>Industrial capacity</dt><dd>Surface industry</dd></div></dl></div>
      <div class="home-projects"><div class="home-section-title"><h2>Possible priorities</h2><span>ILLUSTRATIVE PROJECTS</span></div><ul><li><span>01</span><div>Observatory expansion<small>Broaden our view of nearby stars</small></div></li><li><span>02</span><div>Orbital manufacturing<small>Explore production beyond the surface</small></div></li><li><span>03</span><div>Infrastructure resilience<small>Strengthen the systems that sustain us</small></div></li></ul></div>
      <p class="home-sample-note">Civilization identity, capacity, and projects are illustrative. No costs, estimates, or durations are established.</p>
    </section>
    <footer class="home-footer"><span>Drag to orbit · scroll / pinch to zoom</span><span>Physical radii & orbital scale · markers enlarged for visibility<br>Static surface maps · ephemeris 06 Sep 2026 · no game clock</span></footer>`;
  document.getElementById('atlas').append(shell);
  shell.querySelectorAll('[data-home-view]').forEach(button=>button.onclick=()=>navigate(button.dataset.homeView));
  shell.querySelectorAll('[data-home-zoom]').forEach(button=>button.onclick=()=>zoom(button.dataset.homeZoom==='in'?1/3:3));
  const overview=shell.querySelector('.home-overview'),sidebar=shell.querySelector('.home-sidebar');
  const compact=matchMedia('(max-width:760px)');
  const arrange=()=>{if(compact.matches)sidebar.append(overview);else shell.append(overview);sidebar.scrollTop=0;};
  compact.addEventListener('change',arrange);arrange();
  return {
    setActive(active){shell.hidden=!active;document.body.classList.toggle('player-view',active);
      document.getElementById('viewport').setAttribute('aria-label',active?'3D homeworld and system. Drag to orbit, scroll or pinch to zoom. Arrow keys rotate; 1 returns home, 2 shows the system.':'3D universe. Drag to orbit, scroll to zoom. Choose a scale using keys 1 through 5.');},
    update(mode,planet){
      const earth=mode==='earth'&&planet==='Earth',solar=mode==='solar';
      shell.querySelectorAll('[data-home-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.homeView==='earth'?earth:solar)));
      document.getElementById('home-location').textContent=earth?'SOL III / YOUR HOMEWORLD':solar?'SOL / YOUR HOME SYSTEM':'ASTRONOMICAL CONTEXT';
      document.getElementById('home-world-name').textContent=earth?'Earth':solar?'Solar System':'Beyond home';
      document.getElementById('home-world-detail').textContent=earth?'One inhabited world · orbiting Sol':solar?'One star · eight planets · Earth is home':'Return home with the view controls';
    },
    zones:[...shell.querySelectorAll('.home-header,.home-sidebar,.home-view-controls,.home-world-caption,.home-overview,.home-footer,.home-camera-tools')]
  };
}
