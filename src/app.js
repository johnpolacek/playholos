import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AU_KM, PLANETS, julianDate, planetPosition } from './astronomy.js';
import { Universe } from './universe.js';
import { LY_AU, GALACTIC_CENTER, MIN_DISTANCE_AU, MAX_DISTANCE_AU, RENDER_DISTANCE, eclipticToGalactic, homeTarget, scaleAtDistance, clampDistance, planFlight, sampleFlight, smooth } from './navigation.js';
import { ASSETS, CATALOG, STAR_BUFFER, META } from './embedded.js';

const $=id=>document.getElementById(id),vec=a=>new THREE.Vector3(...a);
const modes=['earth','solar','stars','galaxy'];
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const state={mode:'earth',planet:PLANETS[2],star:null,date:new Date('2026-09-06T12:00:00Z'),playing:false,speed:1,labels:true,orbits:true,trueSizes:false,reconstruction:true};
const pose={target:new THREE.Vector3(),direction:new THREE.Vector3(0,0,1),distance:1,home:true,follow:null};
const textures={},labelItems=[];
let renderer,camera,controls,universe,flight=null,zoomGoal=null,toastTimer,last=0,uiTime=0,viewFactor=1,animation,frameCount=0,contextKey='';
const raycaster=new THREE.Raycaster(),offset=new THREE.Vector3(),projected=new THREE.Vector3();
function format(n,dp=0){return n.toLocaleString('en-US',{maximumFractionDigits:dp,minimumFractionDigits:dp});}
function dateText(){return state.date.toISOString().slice(0,10);}
function toast(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3600);}
function fatal(error){console.error(error);$('fatal').hidden=false;$('loading').classList.add('done');}
function decodeStars(){return new Float32Array(Uint8Array.from(atob(STAR_BUFFER),c=>c.charCodeAt(0)).buffer);}
async function loadTextures(){
  const loader=new THREE.TextureLoader();let completed=0;
  await Promise.all(Object.entries(ASSETS).map(async([key,url])=>{
    const texture=await loader.loadAsync(url);texture.colorSpace=key==='earth_clouds'?THREE.NoColorSpace:THREE.SRGBColorSpace;
    texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());textures[key]=texture;
    $('loading-detail').textContent=`Preparing planetary maps · ${++completed} / ${Object.keys(ASSETS).length}`;
  }));
}

function setInfo({kicker,name,description,facts}) {
  $('object-kicker').textContent=kicker;$('object-name').textContent=name;$('object-description').textContent=description;
  $('object-name').style.fontSize=name.length>19?'clamp(27px, 3.6vw, 49px)':name.length>12?'clamp(30px, 4vw, 56px)':'';
  $('object-facts').replaceChildren(...facts.map(([label,value,unit])=>{
    const div=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd'),span=document.createElement('span');dt.textContent=label;dd.textContent=value+' ';span.textContent=unit;dd.append(span);div.append(dt,dd);return div;
  }));
}
function defaultInfo() {
  if(state.mode==='earth') {
    const p=state.planet;
    setInfo({kicker:`SOL ${['I','II','III','IV','V','VI','VII','VIII'][PLANETS.indexOf(p)]} / ${p.type.toUpperCase()}`,name:p.name,description:p.description,facts:[['Mean diameter',format(p.radius*2),'km'],['Mean Sun distance',format(p.elements[0],2),'AU']]});
  } else if(state.mode==='solar') setInfo({kicker:'OUR PLANETARY SYSTEM',name:'Solar System',description:'One star. Eight planets. Worlds in motion, connected by gravity. Follow their orbits from Mercury to the ice giants.',facts:[['Neptune’s orbit','30.07','AU'],['Light to Neptune','4.2','hours']]});
  else if(state.mode==='stars') {
    if(state.star)return starInfo(state.star);
    setInfo({kicker:'THE LOCAL STELLAR NEIGHBORHOOD',name:'Among the stars',description:'Our Sun is one of many. Explore the nearest stellar systems at their cataloged three-dimensional positions.',facts:[['Nearest star','4.23','ly'],['Catalog stars',format(META.count),'']]});
  } else setInfo({kicker:'OUR GALAXY / BARRED SPIRAL',name:'Milky Way',description:'A disk of stars, dust, and gas, wrapped around a luminous central bar. Our Sun lies far from the crowded galactic center.',facts:[['Disk diameter','~100,000','ly'],['Sun to center','~26,000','ly']]});
}
function starInfo(star) {
  let description=`A cataloged ${star.spectral==='Unknown'?'star':star.spectral+' star'} ${format(star.distance,2)} light-years from the Sun. Its position is shown in the Galactic reference frame at epoch J2000.0.`;
  if(star.name==='Proxima Centauri')description='The nearest known star to the Sun, a faint red dwarf in the Alpha Centauri system. Its catalog distance is about 4.23 light-years.';
  if(star.name==='Rigil Kentaurus')description='Alpha Centauri A, also called Rigil Kentaurus. It forms a close binary with Alpha Centauri B; the pair is unresolved at this map scale.';
  if(star.name==='Sirius')description='The brightest star in Earth’s night sky. Sirius is a nearby binary system; its faint white-dwarf companion is not resolved here.';
  setInfo({kicker:`HYG ${star.id} / ${star.spectral.toUpperCase()}`,name:star.name,description,facts:[['Distance from Sun',format(star.distance,2),'ly'],['Visual magnitude',format(star.mag,2),'mag']]});
}
function searchResults(query='') {
  const q=query.toLowerCase().trim();
  const planetResults=PLANETS.filter(p=>p.name.toLowerCase().includes(q));
  let stars;
  if(!q)stars=CATALOG.filter(s=>['Proxima Centauri','Sirius','Rigil Kentaurus','Vega'].includes(s.name));
  else stars=CATALOG.filter(s=>[s.name,s.hip&&'hip '+s.hip,s.gl,s.name==='Rigil Kentaurus'?'alpha centauri':'',s.name==='Toliman'?'alpha centauri b':'',s.name==='Ran'?'epsilon eridani':''].filter(Boolean).some(v=>v.toLowerCase().includes(q))).sort((a,b)=>a.distance-b.distance).slice(0,35);
  const results=[...planetResults.map(p=>({name:p.name,subtitle:p.type,detail:format(p.elements[0],2)+' AU from Sun',action:()=>focusPlanet(p)})),...stars.map(s=>({name:s.name,subtitle:s.spectral+' · HYG '+s.id,detail:format(s.distance,2)+' light-years',action:()=>focusStar(s)}))];
  $('search-results').replaceChildren(...results.map(r=>{const row=document.createElement('div'),button=document.createElement('button'),name=document.createElement('span'),sub=document.createElement('em'),detail=document.createElement('small');row.setAttribute('role','listitem');button.className='search-result';name.textContent=r.name;sub.textContent=r.subtitle;name.append(sub);detail.textContent=r.detail;button.append(name,detail);button.onclick=()=>{$('search-dialog').close();r.action();};row.append(button);return row;}));
  if(!results.length){const p=document.createElement('p');p.className='no-results';p.textContent='No match in this subset. Try a common star name, HIP number, or Gliese ID.';$('search-results').append(p);}
}
function openSearch(){searchResults();$('search-input').value='';$('search-dialog').showModal();$('search-input').focus();}

function planetView(planet) {
  const body=universe.bodies[PLANETS.indexOf(planet)],radius=planet.radius/AU_KM;
  const direction=vec(planetPosition(planet,julianDate(state.date))).normalize().negate().applyAxisAngle(new THREE.Vector3(0,1,0),.75);
  direction.multiplyScalar(planet.name==='Saturn'?6.1:3.55);direction.y=planet.name==='Saturn'?3.3:1.1;
  const view=eclipticToGalactic(direction).multiplyScalar(radius*viewFactor);
  return {target:body.positionAU.clone(),direction:view.clone().normalize(),distance:view.length(),home:planet.name==='Earth',follow:{planet}};
}
function bookmark(mode) {
  if(mode==='earth')return planetView(PLANETS[2]);
  // Choose an oblique solar viewpoint whose orbital plane fits horizontally
  // in the Galactic frame, without rotating or rearranging the actual planets.
  const normal=eclipticToGalactic(new THREE.Vector3(0,1,0)).normalize();
  const tangent=new THREE.Vector3(0,1,0).addScaledVector(normal,-normal.y).normalize();
  const view=mode==='solar'?normal.multiplyScalar(.6).addScaledVector(tangent,.8).multiplyScalar(85*viewFactor):
    mode==='stars'?new THREE.Vector3(21,15,29).multiplyScalar(LY_AU*viewFactor):new THREE.Vector3(18000,85000,105000).multiplyScalar(LY_AU*viewFactor);
  return {target:homeTarget(view.length(),universe.earth.positionAU),direction:view.clone().normalize(),distance:view.length(),home:true,follow:null};
}
function syncCamera() {
  controls.target.set(0,0,0);camera.position.copy(pose.direction).multiplyScalar(RENDER_DISTANCE);camera.lookAt(controls.target);camera.updateMatrixWorld();
}
function stopTravel(){flight=null;zoomGoal=null;$('travel-status').hidden=true;contextKey='';}
function readControls() {
  offset.copy(camera.position).sub(controls.target);
  if(controls.target.lengthSq()>1e-16){pose.target.addScaledVector(controls.target,pose.distance/RENDER_DISTANCE);pose.home=false;pose.follow=null;}
  pose.distance=clampDistance(pose.distance*offset.length()/RENDER_DISTANCE);pose.direction.copy(offset).normalize();
  syncCamera();
}
function flyTo(destination,name,{instant=false,duration}={}) {
  stopTravel();state.playing=false;updatePlay();
  // Flush any remaining orbit damping before capturing the exact departure pose.
  controls.enableDamping=false;controls.update();readControls();controls.enableDamping=true;
  clearTimeout(toastTimer);$('toast').classList.remove('visible');
  if(instant||reducedMotion){Object.assign(pose,{distance:destination.distance,home:destination.home,follow:destination.follow});pose.target.copy(destination.target);pose.direction.copy(destination.direction);syncCamera();updateContext();return;}
  flight={...planFlight(pose,destination,{home:pose.home&&destination.home,duration}),start:performance.now(),name,destination};
  pose.follow=null;pose.home=flight.home;
  $('travel-status').hidden=false;$('travel-name').textContent=`Traveling to ${name}`;
  contextKey='';
}
function setMode(mode,{instant=false,planet}={}) {
  if(!modes.includes(mode))return;
  state.star=null;state.planet=planet||PLANETS[2];
  const destination=planet?planetView(planet):bookmark(mode);
  flyTo(destination,planet?.name||{earth:'Earth',solar:'the Solar System',stars:'nearby stars',galaxy:'the Milky Way'}[mode],{instant});
  history.replaceState(null,'','#'+mode);
}
function focusPlanet(planet){setMode('earth',{planet});}
function focusStar(star){
  state.star=star;
  const view=new THREE.Vector3(2,1.5,3.7).multiplyScalar(LY_AU*viewFactor);
  flyTo({target:vec(star.pos).multiplyScalar(LY_AU),direction:view.clone().normalize(),distance:view.length(),home:false,follow:{star}},star.name);
  ensureStarLabel(star,true);contextKey='';
}
function focusMoon(){
  const view=eclipticToGalactic(new THREE.Vector3(1,1,2)).multiplyScalar(1737.4/AU_KM*2*viewFactor);
  flyTo({target:universe.moonPositionAU.clone(),direction:view.clone().normalize(),distance:view.length(),home:false,follow:{moon:true}},'the Moon');
}
function zoom(factor){
  if(flight)stopTravel();
  zoomGoal=clampDistance((zoomGoal??pose.distance)*factor);
  if(reducedMotion){pose.distance=zoomGoal;zoomGoal=null;}
}
function updatePlay(){ $('play').textContent=state.playing?'Ⅱ':'▶';$('play').setAttribute('aria-label',state.playing?'Pause time':'Play time'); }
function setPlaying(){if($('play').disabled)return;state.playing=!state.playing;updatePlay();}

function updateContext() {
  state.mode=scaleAtDistance(pose.distance);
  const m=state.mode,key=[m,state.planet.name,state.star?.id,state.trueSizes,state.reconstruction,!!flight,pose.follow?.moon].join('|');
  if(key===contextKey)return;contextKey=key;
  document.querySelectorAll('[data-mode]').forEach(el=>{el.classList.toggle('active',el.dataset.mode===m);el.setAttribute('aria-pressed',String(el.dataset.mode===m));});
  $('frame-note').textContent='ONE UNIVERSE · CONTINUOUS 3D';
  $('model-note').textContent=m==='earth'?'Physical proportions · composite surface imagery':m==='solar'?(state.trueSizes?'True physical sizes & distances':'True orbital distances · distant planet disks enlarged'):m==='stars'?`${format(META.count)} measured stars · J2000.0`:(state.reconstruction?'Statistical galaxy reconstruction + measured local stars':'Measured HYG catalog only');
  $('outward-label').textContent=m==='earth'?'Travel to the Solar System':m==='solar'?'Travel to nearby stars':m==='stars'?'Travel to the Milky Way':'Travel back to Earth';
  $('sizes-option').hidden=m!=='solar';$('orbits-option').hidden=false;$('reconstruction-option').hidden=m!=='galaxy';
  $('orbits-option').querySelector('span').textContent=m==='stars'||m==='galaxy'?'Distance guides':'Orbits';
  $('play').disabled=!!flight||m==='stars'||m==='galaxy';$('speed').disabled=$('play').disabled;$('date').disabled=!!flight;
  if(m==='stars'||m==='galaxy'){state.playing=false;updatePlay();}
  if(pose.follow?.moon&&!flight)setInfo({kicker:'EARTH’S NATURAL SATELLITE',name:'Moon',description:'A cratered world orbiting Earth. Its mean distance and physical size are represented here; orbital phase and orientation are illustrative.',facts:[['Mean diameter','3,475','km'],['Mean Earth distance','384,400','km']]});
  else defaultInfo();
}

function addLabel({name,position,action,priority=0,kind='planet',color,star}) {
  const el=document.createElement(action?'button':'span');el.className=`object-label ${kind==='galaxy'?'galaxy-label':''} ${kind==='sun'?'sun-label':''}`;
  el.textContent=name;el.style.setProperty('--label-color',color||'#8daabc');
  if(kind==='earth'){el.classList.add('earth-marker');el.style.opacity='0';}
  if(action){el.setAttribute('aria-label',`Explore ${name}`);el.onclick=action;}
  $('labels').append(el);labelItems.push({name,position,action,priority,kind,color,star,el});
}
function ensureStarLabel(star,selected=false){
  let label=labelItems.find(l=>l.star?.id===star.id);
  if(!label){addLabel({name:star.name,position:()=>vec(star.pos).multiplyScalar(LY_AU),action:()=>focusStar(star),priority:star.distance<5?25:star.name==='Sirius'?24:10,kind:'star',star});label=labelItems.at(-1);}
  if(selected){labelItems.forEach(l=>l.el.classList.toggle('selected',l===label));label.priority=50;}
}
function createLabels(){
  for(const body of universe.bodies)addLabel({name:body.planet.name,position:()=>body.positionAU,action:()=>focusPlanet(body.planet),kind:body===universe.earth?'earth':'planet',priority:body===universe.earth?60:20-PLANETS.indexOf(body.planet),color:body.planet.color});
  addLabel({name:'Moon',position:()=>universe.moonPositionAU,action:focusMoon,priority:19,kind:'moon',color:'#d3d7dc'});
  addLabel({name:'Sun',position:()=>new THREE.Vector3(),priority:40,kind:'sun',color:'#ffe1a4',action:()=>setMode('solar')});
  for(const star of CATALOG.filter(s=>s.distance<17||['Vega','Altair','Arcturus','Fomalhaut','Capella','Aldebaran','Betelgeuse','Polaris','Rigel','Deneb','Spica'].includes(s.name))){if(star.name!=='Toliman')ensureStarLabel(star);}
  addLabel({name:'Galactic center · Sagittarius A*',position:()=>GALACTIC_CENTER,priority:35,kind:'center',action:()=>flyTo({target:GALACTIC_CENTER.clone(),direction:new THREE.Vector3(.2,.6,.77).normalize(),distance:22000*LY_AU,home:false,follow:null},'the galactic center')});
}
function projectAU(positionAU,target=projected){
  // Same angular/depth projection as the distant-star shader, in CPU precision.
  target.copy(positionAU).sub(universe.cameraAU).multiplyScalar(universe.renderScale);
  if(target.length()>800000)target.setLength(800000);
  return target.add(camera.position).project(camera);
}
function updateLabels(){
  const occupied=[],panel=$('object-info').getBoundingClientRect(),w=innerWidth,h=innerHeight,dLy=pose.distance/LY_AU;
  // Wait until the physical globe is smaller than one CSS pixel, then blend
  // in its marker as it recedes to a quarter pixel. This reverses on approach.
  const earthDepth=-offset.copy(universe.earth.root.position).applyMatrix4(camera.matrixWorldInverse).z;
  const earthDiameter=universe.earth.displayRadiusAU*universe.renderScale*h*camera.projectionMatrix.elements[5]/earthDepth;
  const earthOpacity=earthDepth>0?1-smooth((earthDiameter-.25)/.75):0;
  for(const item of [...labelItems].sort((a,b)=>b.priority-a.priority)){
    let visible=state.labels;
    if(item.kind==='earth'){
      visible&&=(state.mode==='earth'||state.mode==='solar')&&earthOpacity>.001;
      item.el.style.opacity=String(earthOpacity);
    }
    if(item.kind==='planet'){
      const body=universe.bodies.find(b=>b.planet.name===item.name);
      visible&&=pose.distance>.0007&&pose.distance<4000&&universe.cameraAU.distanceTo(body.positionAU)>body.planet.radius/AU_KM*15;
    }
    if(item.kind==='moon')visible&&=pose.distance>.0002&&pose.distance<.025;
    if(item.kind==='star')visible&&=dLy>.15&&dLy<4000;
    if(item.kind==='center')visible&&=dLy>4000;
    if(item.kind==='sun'){visible&&=pose.distance>.1;item.el.textContent=dLy>300?'Solar System':dLy>.2?'Sun · you are here':'Sun';}
    if(!visible){item.el.hidden=true;continue;}
    const position=item.position();projectAU(position);
    if(projected.z<-1||projected.z>1||Math.abs(projected.x)>1.1||Math.abs(projected.y)>1.1){item.el.hidden=true;continue;}
    // Keep Earth's callout above-left of its exact point, away from the Sun
    // and inner-planet labels. Its connector still ends at Earth's position.
    const earth=item.kind==='earth';
    const x=(projected.x+1)*w/2+(earth?-76:9),y=(1-projected.y)*h/2-(earth?36:11);
    const width=earth?58:Math.min(245,item.el.textContent.length*(w<761?4.7:5.8)+29),height=24;
    if(y<(w<761?145:116)||y>h-145||x+width>w-16||(x<panel.right+8&&x+width>panel.left&&y>panel.top-12&&y<panel.bottom+8)||(w>760&&h>700&&x<300&&y<400)){item.el.hidden=true;continue;}
    if(occupied.some(r=>x<r.x+r.w&&x+width>r.x&&y<r.y+r.h&&y+height>r.y)){item.el.hidden=true;continue;}
    occupied.push({x,y,w:width,h:height});item.el.hidden=false;item.el.style.transform=`translate(${Math.round(x)}px,${Math.round(y)}px)`;
  }
}
function formatDistance(distance){
  if(distance<.01)return `${format(distance*AU_KM)} km`;
  if(distance<.1*LY_AU)return `${format(distance,distance<1?3:distance<100?1:0)} AU`;
  return `${format(distance/LY_AU,distance/LY_AU<100?1:0)} ${innerWidth<=760?'ly':'light-years'}`;
}
function updateReadout(){
  let distance=pose.distance,label='DISTANCE TO VIEW CENTER';
  if(state.mode==='earth'&&(pose.home||pose.follow?.planet)){
    const body=universe.bodies[PLANETS.indexOf(state.planet)];distance=Math.max(0,universe.cameraAU.distanceTo(body.positionAU)-body.planet.radius/AU_KM);label=`ALTITUDE ABOVE ${body.planet.name.toUpperCase()}`;
  }
  $('distance-value').textContent=formatDistance(distance);$('distance-label').textContent=label;
  const sliderDistance=zoomGoal??pose.distance;
  $('zoom-scale').value=String(Math.log10(sliderDistance));$('zoom-scale').setAttribute('aria-valuetext',formatDistance(sliderDistance));
  if(flight){const t=Math.min(1,(performance.now()-flight.start)/flight.duration);$('travel-progress').value=t;$('travel-percent').textContent=`${Math.round(t*100)}%`;}
}
function resize(){
  const {width:w,height:h}=$('viewport').getBoundingClientRect();
  if(!w||!h)return;
  // CSS owns the canvas layout. Its drawing buffer must never force the mobile
  // viewport wider during a resize or a change in device orientation.
  renderer.setSize(w,h,false);camera.aspect=w/h;
  const factor=w<=760?Math.max(1,h/w*1.25):1;
  if(universe&&factor!==viewFactor){stopTravel();pose.distance=clampDistance(pose.distance*factor/viewFactor);}
  viewFactor=factor;camera.clearViewOffset();
  // The projection stays fixed while traveling; changing scale never shifts the viewport.
  if(w>760)camera.setViewOffset(w,h,-w*.105,0,w,h);else camera.setViewOffset(w,h,0,h*.15,w,h);
  camera.updateProjectionMatrix();
}
function trackTarget(){
  if(pose.home)pose.target.copy(homeTarget(pose.distance,universe.earth.positionAU));
  else if(pose.follow?.planet)pose.target.copy(universe.bodies[PLANETS.indexOf(pose.follow.planet)].positionAU);
  else if(pose.follow?.moon)pose.target.copy(universe.moonPositionAU);
}
function frame(now){
  animation=requestAnimationFrame(frame);frameCount++;
  const dt=Math.min((now-last)/1000,.05);last=now;if(document.hidden)return;
  if(state.playing){
    const ms=state.date.getTime()+dt*state.speed*86400000;
    if(ms>Date.parse('2050-12-31T23:59:59Z')){state.date=new Date('2050-12-31T12:00:00Z');state.playing=false;updatePlay();$('date').value=dateText();toast('Reached the end of the supported date range.');}
    else state.date=new Date(ms);
  }
  universe.updateEphemeris(state.date);
  if(flight){
    const t=Math.min(1,(now-flight.start)/flight.duration),sample=sampleFlight(flight,t,universe.earth.positionAU);
    pose.target.copy(sample.target);pose.direction.copy(sample.direction);pose.distance=sample.distance;
    if(t===1){pose.home=flight.destination.home;pose.follow=flight.destination.follow;flight=null;$('travel-status').hidden=true;contextKey='';}
    syncCamera();
  } else {
    controls.update();readControls();
    if(zoomGoal!==null){const blend=1-Math.exp(-dt*9);pose.distance=Math.exp(THREE.MathUtils.lerp(Math.log(pose.distance),Math.log(zoomGoal),blend));if(Math.abs(Math.log(pose.distance/zoomGoal))<1e-5){pose.distance=zoomGoal;zoomGoal=null;}}
    trackTarget();syncCamera();
  }
  universe.update(pose,state);renderer.render(universe.scene,camera);
  uiTime+=dt;
  if(uiTime>.06){uiTime=0;updateContext();updateLabels();updateReadout();if(state.playing&&document.activeElement!==$('date'))$('date').value=dateText();}
}

function wireControls(){
  document.querySelectorAll('[data-mode]').forEach(el=>el.onclick=()=>setMode(el.dataset.mode));
  document.querySelector('.brand').onclick=e=>{e.preventDefault();setMode('earth');};
  $('outward').onclick=()=>setMode(modes[(modes.indexOf(state.mode)+1)%4]);
  $('zoom-in').onclick=()=>zoom(1/3);$('zoom-out').onclick=()=>zoom(3);
  $('zoom-scale').min=String(Math.log10(MIN_DISTANCE_AU));$('zoom-scale').max=String(Math.log10(MAX_DISTANCE_AU));
  $('zoom-scale').oninput=()=>{stopTravel();zoomGoal=clampDistance(10**Number($('zoom-scale').value));};
  $('travel-stop').onclick=()=>stopTravel();
  $('reset-view').onclick=()=>setMode(state.mode);
  $('top-view').onclick=()=>{
    const up=new THREE.Vector3(0,1,.001).normalize();
    const direction=state.mode==='earth'||state.mode==='solar'?eclipticToGalactic(up).normalize():up;
    flyTo({target:pose.target.clone(),direction,distance:pose.distance,home:pose.home,follow:pose.follow},'a view from above',{duration:1300});
  };
  $('labels-toggle').onclick=()=>{state.labels=!state.labels;$('labels-toggle').setAttribute('aria-pressed',String(state.labels));};
  $('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('Fullscreen is unavailable in this window.');}};
  $('play').onclick=setPlaying;
  $('date').onchange=()=>{
    const input=$('date');if(!input.value||!input.checkValidity()){input.value=dateText();toast('Choose a date from 1800 through 2050.');return;}
    state.date=new Date(input.value+'T12:00:00Z');universe.updateEphemeris(state.date);trackTarget();
  };
  $('date').oninput=()=>{if($('date').value&&$('date').checkValidity())$('date').onchange();};
  $('speed').onchange=()=>state.speed=Number($('speed').value);
  $('orbits').onchange=()=>state.orbits=$('orbits').checked;
  $('true-sizes').onchange=()=>{state.trueSizes=$('true-sizes').checked;updateContext();};
  $('reconstruction').onchange=()=>{state.reconstruction=$('reconstruction').checked;updateContext();};
  $('search-open').onclick=openSearch;$('search-input').oninput=()=>searchResults($('search-input').value);
  $('search-input').onkeydown=e=>{if(e.key==='ArrowDown'){e.preventDefault();$('search-results').querySelector('button')?.focus();}if(e.key==='Enter')$('search-results').querySelector('button')?.click();};
  $('about-open').onclick=()=>$('about-dialog').showModal();$('help-open').onclick=()=>$('help-dialog').showModal();
  document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}}));
  document.addEventListener('keydown',e=>{
    if(document.querySelector('dialog[open]')||['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))return;
    if(e.key==='/'){e.preventDefault();openSearch();}
    if(['1','2','3','4'].includes(e.key))setMode(modes[Number(e.key)-1]);
    if(e.key==='Escape')stopTravel();
    if(e.code==='Space'&&!['BUTTON','A'].includes(document.activeElement?.tagName)){e.preventDefault();if(flight)stopTravel();else setPlaying();}
    if(e.key.toLowerCase()==='r')setMode(state.mode);
    if(e.key==='+'||e.key==='=')zoom(1/2);if(e.key==='-')zoom(2);
    if(e.key.startsWith('Arrow')){e.preventDefault();stopTravel();const sph=new THREE.Spherical().setFromVector3(pose.direction);
      if(e.key==='ArrowLeft')sph.theta-=.1;if(e.key==='ArrowRight')sph.theta+=.1;if(e.key==='ArrowUp')sph.phi-=.1;if(e.key==='ArrowDown')sph.phi+=.1;
      sph.makeSafe();pose.direction.setFromSpherical(sph).normalize();syncCamera();
    }
  });
  controls.addEventListener('start',()=>stopTravel());
  let pointerDown;
  renderer.domElement.addEventListener('pointerdown',e=>{pointerDown={x:e.clientX,y:e.clientY};});
  renderer.domElement.addEventListener('pointerup',e=>{
    if(!pointerDown||Math.hypot(e.clientX-pointerDown.x,e.clientY-pointerDown.y)>5)return;
    const r=renderer.domElement.getBoundingClientRect(),mouse=new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);
    raycaster.setFromCamera(mouse,camera);const hit=raycaster.intersectObjects(universe.bodies.filter(b=>b.root.visible).map(b=>b.surface),false)[0];
    if(hit){let object=hit.object;while(object&&!object.userData.planet)object=object.parent;if(object)focusPlanet(object.userData.planet);}
  });
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(animation);fatal(new Error('The graphics context was interrupted. Reload to restore the atlas.'));});
  addEventListener('resize',resize);new ResizeObserver(resize).observe($('viewport'));
  addEventListener('hashchange',()=>{const mode=location.hash.slice(1);if(modes.includes(mode))setMode(mode);});
}

async function start(){
  try{
    renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance',logarithmicDepthBuffer:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    $('viewport').append(renderer.domElement);camera=new THREE.PerspectiveCamera(43,innerWidth/innerHeight,.05,1e6);
    camera.position.set(0,0,RENDER_DISTANCE);
    // Capture wheel input before OrbitControls so one gesture crosses any scale.
    renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();e.stopImmediatePropagation();const pixels=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);zoom(Math.exp(Math.max(-2,Math.min(2,pixels*.006))));},{passive:false,capture:true});
    controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.07;controls.rotateSpeed=.65;controls.zoomSpeed=2;controls.minDistance=1;controls.maxDistance=10000;controls.screenSpacePanning=true;
    resize();await loadTextures();universe=new Universe(renderer,textures,decodeStars());universe.updateEphemeris(state.date);
    const initial=modes.includes(location.hash.slice(1))?location.hash.slice(1):'earth',destination=bookmark(initial);
    pose.target.copy(destination.target);pose.direction.copy(destination.direction);pose.distance=destination.distance;pose.home=true;pose.follow=destination.follow;
    syncCamera();universe.update(pose,state);createLabels();wireControls();$('date').value=dateText();updateContext();updateLabels();updateReadout();
    $('loading').classList.add('done');last=performance.now();frame(last);
    window.holos={
      getState:()=>({mode:state.mode,planet:state.planet.name,star:state.star?.name,date:dateText(),playing:state.playing,trueSizes:state.trueSizes,reconstruction:state.reconstruction,catalogStars:META.count,searchable:META.searchable,loadedTextures:Object.keys(textures).length,sceneId:universe.scene.uuid,sceneCount:1,cameraId:camera.uuid,earthObjectId:universe.earth.root.uuid,frameCount,traveling:!!flight,destination:flight?.name,travelProgress:flight?Math.min(1,(performance.now()-flight.start)/flight.duration):null,drawCalls:renderer.info.render.calls,points:renderer.info.render.points,webgl:renderer.capabilities.isWebGL2}),
      getCamera:()=>({positionAU:universe.cameraAU.toArray(),targetAU:pose.target.toArray(),direction:pose.direction.toArray(),distanceAU:pose.distance,renderScale:universe.renderScale,homeAnchored:pose.home}),
      getSolarPositions:()=>universe.bodies.map(b=>({name:b.planet.name,positionAU:b.positionAU.toArray(),radiusAU:b.planet.radius/AU_KM})),
      getObjectProjection:name=>{const b=universe.bodies.find(b=>b.planet.name===name);if(!b)return null;const p=projectAU(b.positionAU,new THREE.Vector3());return {x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2,visible:b.root.visible,objectId:b.root.uuid};}
    };
  }catch(error){fatal(error);}
}
start();
