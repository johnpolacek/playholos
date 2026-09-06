import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AU_KM, DEG, PLANETS, julianDate, planetPosition, orbitPath, seededRandom, colorFromBV } from './astronomy.js';
import { ASSETS, CATALOG, STAR_BUFFER, META } from './embedded.js';

const $ = id => document.getElementById(id);
const modes = ['earth','solar','stars','galaxy'];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const state = {mode:'earth',planet:PLANETS[2],star:null,date:new Date('2026-09-06T12:00:00Z'),playing:false,speed:1,labels:true,orbits:true,trueSizes:false,reconstruction:true,transitioning:false};
const canvasHost=$('viewport'), labelsHost=$('labels');
const textures={},sceneCache={},labelItems=[];
const sphere=new THREE.SphereGeometry(1,96,64);
let renderer,camera,controls,current,animation,tween,toastTimer,last=0,uiTime=0,viewFactor=1;
const tempV=new THREE.Vector3(),sunVector=new THREE.Vector3(),raycaster=new THREE.Raycaster();
let catalogArray;

function fatal(error) { console.error(error); $('fatal').hidden=false; $('loading').classList.add('done'); }
function toast(message) { $('toast').textContent=message; $('toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3600); }
function format(n,dp=0) { return n.toLocaleString('en-US',{maximumFractionDigits:dp,minimumFractionDigits:dp}); }
function vec(a) { return new THREE.Vector3(...a); }
function dateText() { return state.date.toISOString().slice(0,10); }
function decodeStars() { const bytes=Uint8Array.from(atob(STAR_BUFFER),c=>c.charCodeAt(0)); return new Float32Array(bytes.buffer); }
function loadTextures() {
  const loader=new THREE.TextureLoader();let completed=0;
  return Promise.all(Object.entries(ASSETS).map(async ([key,url])=>{
    const texture=await loader.loadAsync(url);
    texture.colorSpace=key==='earth_clouds'?THREE.NoColorSpace:THREE.SRGBColorSpace;
    texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    textures[key]=texture;
    $('loading-detail').textContent=`Preparing planetary maps · ${++completed} / ${Object.keys(ASSETS).length}`;
  }));
}

// Analytic stellar point-spread profile. Point size is deliberately not a stellar radius.
function starPoints(positions,colors,sizes,{opacity=1,attenuate=false,scale=100,additive=true}={}) {
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geometry.setAttribute('pointSize',new THREE.Float32BufferAttribute(sizes,1));
  const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,vertexColors:true,
    blending:additive?THREE.AdditiveBlending:THREE.NormalBlending,
    uniforms:{opacity:{value:opacity},pixelRatio:{value:renderer.getPixelRatio()},attenuate:{value:attenuate?1:0},sizeScale:{value:scale}},
    vertexShader:`attribute float pointSize; varying vec3 vColor; uniform float pixelRatio; uniform float attenuate; uniform float sizeScale;
    void main(){vColor=color;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;
      float factor=mix(1.,clamp(sizeScale/max(1.,-mv.z),.25,4.),attenuate);gl_PointSize=clamp(pointSize*pixelRatio*factor,1.,40.);}`,
    fragmentShader:`varying vec3 vColor;uniform float opacity;
    void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;float core=exp(-d*d*20.);float halo=exp(-d*d*5.)*.22;gl_FragColor=vec4(vColor,(core+halo)*opacity);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`});
  const points=new THREE.Points(geometry,material);points.frustumCulled=false;return points;
}

function galaxyToEcliptic(p) {
  const [gx,gz,minusGy]=p,gy=-minusGy;
  const ex=-.0548755604*gx+.4941094279*gy-.8676661490*gz;
  const ey=-.8734370902*gx-.4448296300*gy-.1980763734*gz;
  const ez=-.4838350155*gx+.7469822445*gy+.4559837762*gz;
  const e=23.43928*DEG;
  return new THREE.Vector3(ex,-Math.sin(e)*ey+Math.cos(e)*ez,-(Math.cos(e)*ey+Math.sin(e)*ez));
}
function backgroundSky(radius=6000) {
  const positions=[],colors=[],sizes=[];
  for(let i=0;i<catalogArray.length;i+=5) {
    const mag=catalogArray[i+3];if(mag>6.5)continue;
    const p=galaxyToEcliptic([catalogArray[i],catalogArray[i+1],catalogArray[i+2]]).normalize().multiplyScalar(radius);
    positions.push(...p.toArray());colors.push(...colorFromBV(catalogArray[i+4]).map(c=>c*.75));
    sizes.push(Math.max(1.1,4.4-mag*.48));
  }
  return starPoints(positions,colors,sizes,{opacity:.78});
}
function line(points,color='#597487',opacity=.2) {
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(p=>Array.isArray(p)?vec(p):p)),new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false}));
}
function circle(radius,color,opacity,y=0) { return line(Array.from({length:257},(_,i)=>[radius*Math.cos(i*Math.PI/128),y,radius*Math.sin(i*Math.PI/128)]),color,opacity); }
function glow(color,size,opacity=.7) {
  const positions=[0,0,0],colors=new THREE.Color(color).toArray();
  const point=starPoints(positions,colors,[size],{opacity});return point;
}
function makeAtmosphere(radius,color='#62b5ff',sunDir=new THREE.Vector3(1,0,0)) {
  return new THREE.Mesh(sphere,new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.BackSide,
    uniforms:{tint:{value:new THREE.Color(color)},sunDir:{value:sunDir},strength:{value:1}},
    vertexShader:`varying vec3 vNormal;varying vec3 vWorld;void main(){vNormal=normalize(mat3(modelMatrix)*normal);vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.);}`,
    fragmentShader:`varying vec3 vNormal;varying vec3 vWorld;uniform vec3 tint;uniform vec3 sunDir;uniform float strength;
    void main(){vec3 n=normalize(vNormal);vec3 viewDir=normalize(cameraPosition-vWorld);float rim=pow(max(0.,1.-abs(dot(n,viewDir))),4.);float day=smoothstep(-.3,.8,dot(n,normalize(sunDir)));gl_FragColor=vec4(tint,rim*(.07+.7*day)*strength);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`}));
}
function createPlanet(planet,{detailed=false,sunDir=new THREE.Vector3(-3,1,3)}={}) {
  const root=new THREE.Group(),axial=new THREE.Group();root.add(axial);axial.rotation.x=-planet.tilt*DEG;
  let material;
  if(planet.name==='Earth') {
    material=new THREE.ShaderMaterial({uniforms:{dayMap:{value:textures.earth_daymap},nightMap:{value:textures.earth_nightmap},sunDir:{value:sunDir}},
      vertexShader:`varying vec2 vUv;varying vec3 vNormal;varying vec3 vWorld;void main(){vUv=uv;vNormal=normalize(mat3(modelMatrix)*normal);vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.);}`,
      fragmentShader:`uniform sampler2D dayMap;uniform sampler2D nightMap;uniform vec3 sunDir;varying vec2 vUv;varying vec3 vNormal;varying vec3 vWorld;
      void main(){vec3 n=normalize(vNormal),light=normalize(sunDir),v=normalize(cameraPosition-vWorld);float ndl=dot(n,light);vec3 day=texture2D(dayMap,vUv).rgb;vec3 night=texture2D(nightMap,vUv).rgb;
        float ocean=smoothstep(.025,.11,day.b-day.r)*smoothstep(.0,.07,day.b-day.g);float spec=pow(max(0.,dot(reflect(-light,n),v)),65.)*ocean*.32;
        vec3 col=day*(.022+max(0.,ndl)*1.6)+night*(1.-smoothstep(-.18,.08,ndl))*.9+spec;
        float rim=pow(1.-max(0.,dot(n,v)),3.);col+=vec3(.05,.28,.55)*rim*smoothstep(-.12,.45,ndl)*.42;
        gl_FragColor=vec4(col,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`});
  } else material=new THREE.MeshStandardMaterial({map:textures[planet.texture],roughness:1,metalness:0});
  const surface=new THREE.Mesh(sphere,material);surface.castShadow=true;surface.receiveShadow=true;axial.add(surface);
  // Radius comes from the parent root, so atmosphere and rings follow physical proportions.
  let clouds,atmosphere;
  if(planet.name==='Earth') {
    clouds=new THREE.Mesh(sphere,new THREE.MeshStandardMaterial({map:textures.earth_clouds,alphaMap:textures.earth_clouds,transparent:true,opacity:.72,depthWrite:false,roughness:1}));
    clouds.scale.setScalar(1.004);axial.add(clouds);
    atmosphere=makeAtmosphere(1.025,'#559eee',sunDir);atmosphere.scale.setScalar(1.025);root.add(atmosphere);
  }
  if(planet.name==='Saturn') {
    const geometry=new THREE.RingGeometry(1.24,2.27,180);
    const uv=geometry.attributes.uv,pos=geometry.attributes.position;
    for(let i=0;i<pos.count;i++) { const r=Math.hypot(pos.getX(i),pos.getY(i));uv.setXY(i,(r-1.24)/(2.27-1.24),.5); }
    const rings=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({map:textures.saturn_ring_alpha,transparent:true,alphaTest:.04,side:THREE.DoubleSide,depthWrite:false,roughness:1,opacity:.9}));
    rings.castShadow=true;rings.receiveShadow=true;rings.rotation.x=-Math.PI/2;axial.add(rings);
  }
  root.userData.planet=planet;
  return {root,axial,surface,clouds,atmosphere,sunDir,planet};
}
function addLabel(data,{name,position,object,action,color,cls='',priority=0,maxDistance=Infinity}) {
  data.labels.push({name,position,object,action,color,cls,priority,maxDistance});
}
function installLabels(data) {
  labelsHost.replaceChildren();labelItems.length=0;
  for(const item of data.labels) {
    const el=document.createElement(item.action?'button':'span');el.className=`object-label ${item.cls}`;
    el.textContent=item.name;el.style.setProperty('--label-color',item.color||'#8daabc');
    if(item.action){el.setAttribute('aria-label',`Explore ${item.name}`);el.addEventListener('click',item.action);}
    labelsHost.append(el);labelItems.push({...item,el});
  }
}

function earthScene(planet=PLANETS[2]) {
  const scene=new THREE.Scene();scene.background=new THREE.Color('#06090e');
  scene.add(backgroundSky());
  const p=vec(planetPosition(planet,julianDate(state.date))).normalize();
  const sunDir=p.negate();
  const body=createPlanet(planet,{detailed:true,sunDir});scene.add(body.root);
  const sunLight=new THREE.DirectionalLight('#fff6e7',2.6);sunLight.position.copy(sunDir).multiplyScalar(100);scene.add(sunLight);
  if(planet.name==='Saturn'){
    sunLight.castShadow=true;sunLight.shadow.mapSize.set(2048,2048);
    Object.assign(sunLight.shadow.camera,{left:-3,right:3,top:3,bottom:-3,near:90,far:110});
    sunLight.shadow.bias=-.00015;sunLight.shadow.normalBias=.008;
  }
  scene.add(new THREE.AmbientLight('#8b9dac',.08));
  const data={scene,labels:[],body,planet,sunLight,unitKm:planet.radius,min:1.15,max:planet.name==='Earth'?180:35,target:new THREE.Vector3(),initial:new THREE.Vector3(0,1.1,3.45),pickables:[body.surface]};
  // Default to the daylight side, then offset to reveal the terminator and atmosphere.
  data.initial.copy(sunDir).applyAxisAngle(new THREE.Vector3(0,1,0),.75).multiplyScalar(planet.name==='Saturn'?6.1:3.55);data.initial.y=planet.name==='Saturn'?3.3:1.1;
  if(planet.name==='Earth') {
    const moonRoot=new THREE.Group();scene.add(moonRoot);
    const moon=new THREE.Mesh(sphere,new THREE.MeshStandardMaterial({map:textures.moon,roughness:1}));moon.scale.setScalar(1737.4/planet.radius);moonRoot.add(moon);
    const moonDistance=384400/planet.radius;
    const moonOrbit=circle(moonDistance,'#728598',.15);moonOrbit.rotation.x=-5.145*DEG;scene.add(moonOrbit);
    data.moon=moon;data.moonRoot=moonRoot;data.moonOrbit=moonOrbit;data.moonDistance=moonDistance;
    addLabel(data,{name:'Moon',object:moon,priority:5,color:'#d3d7dc',action:()=>{tweenCamera(moon.getWorldPosition(new THREE.Vector3()),new THREE.Vector3(1,1,2).multiplyScalar(2),1000);toast('Moon · 384,400 km mean orbital distance. Orbit phase is illustrative.');}});
  }
  return data;
}
function solarScene() {
  const scene=new THREE.Scene();scene.background=new THREE.Color('#06090e');scene.add(backgroundSky(7000));
  const sun=new THREE.Mesh(sphere,new THREE.MeshBasicMaterial({map:textures.sun,color:'#fff1d9'}));sun.scale.setScalar(.00465047);scene.add(sun);
  const sunlight=new THREE.PointLight('#fff5e7',3,0,0);scene.add(sunlight);scene.add(new THREE.AmbientLight('#8797ae',.065));
  const halo=glow('#fff0c5',30,.85);scene.add(halo);
  const data={scene,labels:[],sun,halo,bodies:[],unitKm:AU_KM,min:.00001,max:130,target:new THREE.Vector3(),initial:new THREE.Vector3(12,35,46),pickables:[],orbits:new THREE.Group()};
  scene.add(data.orbits);
  for(const planet of PLANETS) {
    const body=createPlanet(planet);scene.add(body.root);data.bodies.push(body);data.pickables.push(body.surface);
    data.orbits.add(line(orbitPath(planet,julianDate(state.date)),planet.color,.24));
    addLabel(data,{name:planet.name,object:body.root,color:planet.color,priority:10-PLANETS.indexOf(planet),action:()=>focusPlanet(planet)});
  }
  addLabel(data,{name:'Sun',object:sun,color:'#eec98e',priority:20,cls:'sun-label',action:()=>{tweenCamera(new THREE.Vector3(),new THREE.Vector3(.02,.025,.06),1200);setInfo({kicker:'SOL / G2V MAIN-SEQUENCE STAR',name:'Sun',description:'The star at the center of our Solar System. Its gravity holds the planets in orbit; its light powers almost all life on Earth.',facts:[['Mean diameter','1.39 million','km'],['Earth distance','8.3','light-minutes']]});}});
  // Statistical belt particles: orbital regions, not named asteroid ephemerides.
  const r=seededRandom(34),positions=[],colors=[],sizes=[];
  for(let i=0;i<3200;i++) { const a=2.15+r()*1.15,t=r()*Math.PI*2;positions.push(Math.cos(t)*a,(r()-.5)*.15,Math.sin(t)*a);colors.push(.35,.33,.30);sizes.push(.8); }
  data.belt=starPoints(positions,colors,sizes,{opacity:.35});data.orbits.add(data.belt);
  return data;
}
function measuredStars(galaxy=false) {
  const positions=[],colors=[],sizes=[];
  for(let i=0;i<catalogArray.length;i+=5) {
    positions.push(catalogArray[i]+(galaxy?-26000:0),catalogArray[i+1]+(galaxy?65:0),catalogArray[i+2]);
    const bv=Math.max(-.39,Math.min(2.5,catalogArray[i+4]));colors.push(...colorFromBV(bv));
    sizes.push(galaxy?1.25:Math.max(1.6,4.1-catalogArray[i+3]*.2));
  }
  return starPoints(positions,colors,sizes,{opacity:galaxy?.48:.8});
}
function starScene() {
  const scene=new THREE.Scene();scene.background=new THREE.Color('#06090e');
  const points=measuredStars();scene.add(points);
  const sun=glow('#ffe1a4',12,1);scene.add(sun);
  const data={scene,labels:[],points,sun,min:.3,max:6500,target:new THREE.Vector3(),initial:new THREE.Vector3(21,15,29),unitLy:1,guides:new THREE.Group()};
  scene.add(data.guides);
  for(const radius of [5,10,20,50,100,500,1000]) data.guides.add(circle(radius,'#759bb3',.10));
  const nearest=CATALOG.filter(s=>s.distance<17).sort((a,b)=>a.distance-b.distance);
  const named=CATALOG.filter(s=>['Vega','Altair','Arcturus','Fomalhaut','Capella','Aldebaran','Betelgeuse','Polaris','Rigel','Deneb','Spica'].includes(s.name));
  for(const star of [...nearest,...named]) {
    if(['Toliman','Rigil Kentaurus'].includes(star.name)&&star.name==='Toliman')continue;
    addLabel(data,{name:star.name==='Rigil Kentaurus'?'Alpha Centauri A / B':star.name,position:vec(star.pos),action:()=>focusStar(star),priority:star.name==='Proxima Centauri'?18:star.name==='Sirius'?17:star.name.includes('Barnard')?16:star.name==='Rigil Kentaurus'?15:2,maxDistance:star.distance*12+50});
  }
  addLabel(data,{name:'Sun · you are here',position:new THREE.Vector3(),color:'#ffe1a4',cls:'sun-label',priority:30,action:()=>setMode('solar')});
  return data;
}
function galaxyScene() {
  const scene=new THREE.Scene();scene.background=new THREE.Color('#06090e');
  const data={scene,labels:[],min:1200,max:260000,target:new THREE.Vector3(-3000,0,0),initial:new THREE.Vector3(18000,85000,105000),unitLy:1,model:new THREE.Group(),guides:new THREE.Group()};
  scene.add(data.model,data.guides);
  const rand=seededRandom(271828),gaussian=()=>Math.sqrt(-2*Math.log(Math.max(1e-8,rand())))*Math.cos(2*Math.PI*rand());
  const pos=[],col=[],sizes=[];
  // Density samples: exponential disk, logarithmic arm enhancement, and a central bar/bulge.
  for(let i=0;i<135000;i++) {
    let x,y,z,c,size;
    const component=rand();
    if(component<.22) {
      const bar=rand()<.65;
      const bx=gaussian()*(bar?5100:2400),bz=gaussian()*1300,angle=27*DEG;
      x=bx*Math.cos(angle)-bz*Math.sin(angle);z=bx*Math.sin(angle)+bz*Math.cos(angle);y=gaussian()*850;
      c=[.45,.24,.10];size=1.1+rand()*1.4;
    } else if(component<.56) {
      const radius=Math.min(52000,-Math.log(Math.max(1e-6,rand()*rand()))*8000),theta=rand()*Math.PI*2;
      x=radius*Math.cos(theta);z=radius*Math.sin(theta);y=gaussian()*(250+radius*.009);
      c=[.58,.58,.60];size=.9+rand()*1.6;
    } else {
      const arm=Math.floor(rand()*4),radius=6500+Math.pow(rand(),.68)*42500;
      const theta=arm*Math.PI/2+Math.log(radius/7000)/Math.tan(13*DEG)+.25;
      const scatter=gaussian()*(600+radius*.033),jitter=gaussian()*.022;
      x=Math.cos(theta+jitter)*(radius+scatter)+gaussian()*450;z=Math.sin(theta+jitter)*(radius+scatter)+gaussian()*450;y=gaussian()*190;
      const bright=rand();c=bright<.14?[.94,.64,.59]:bright<.5?[.58,.72,.94]:[.69,.76,.86];size=1.0+rand()*2.2;
    }
    pos.push(x,y,z);const radius=Math.hypot(x,z),fade=1-THREE.MathUtils.smoothstep(radius,36000,53000),brightness=(.4+rand()*.5)*(.08+.92*fade);col.push(...c.map(v=>v*brightness));sizes.push(size);
  }
  data.density=starPoints(pos,col,sizes,{opacity:.19});data.model.add(data.density);
  // A much softer unresolved population makes the stellar disk read as continuous light.
  const softPos=[],softCol=[],softSizes=[];
  for(let i=0;i<pos.length;i+=15) {softPos.push(pos[i],pos[i+1],pos[i+2]);softCol.push(col[i]*.45,col[i+1]*.45,col[i+2]*.45);softSizes.push(17);}
  data.model.add(starPoints(softPos,softCol,softSizes,{opacity:.023}));
  data.catalog=measuredStars(true);scene.add(data.catalog);
  const sun=glow('#ffe1a4',15,1);sun.position.set(-26000,65,0);scene.add(sun);data.sun=sun;
  for(const radius of [10000,20000,30000,40000,50000]) data.guides.add(circle(radius,'#70879c',.085,-100));
  data.guides.add(line([[-26000,65,0],[0,65,0]],'#d3b580',.28));
  addLabel(data,{name:'Solar System',object:sun,color:'#ffe1a4',cls:'sun-label',priority:50,action:()=>setMode('stars')});
  addLabel(data,{name:'Galactic center · Sagittarius A*',position:new THREE.Vector3(0,600,0),priority:40,color:'#ecc697',action:()=>{tweenCamera(new THREE.Vector3(),new THREE.Vector3(6000,14000,18000),1300);toast('Sagittarius A* marks the center; no resolved black-hole geometry is shown.');}});
  addLabel(data,{name:'100,000 light-years across',position:new THREE.Vector3(39000,0,25000),cls:'galaxy-label',priority:10});
  return data;
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
function updateContext() {
  const m=state.mode;
  document.querySelectorAll('[data-mode]').forEach(el=>{el.classList.toggle('active',el.dataset.mode===m);el.setAttribute('aria-pressed',el.dataset.mode===m?'true':'false');});
  $('frame-note').textContent=m==='earth'?`${state.planet.name.toUpperCase()}-CENTERED VIEW`:m==='solar'?'HELIOCENTRIC · J2000 ECLIPTIC':m==='stars'?'SUN-CENTERED · GALACTIC FRAME':'GALACTIC CENTER · GALACTIC FRAME';
  $('model-note').textContent=m==='earth'?'Physical proportions · composite surface imagery':m==='solar'?(state.trueSizes?'True physical sizes & distances · markers enlarged':'True orbital distances · planet disks enlarged'):m==='stars'?`${format(META.count)} measured stars · J2000.0 · markers enlarged`:(state.reconstruction?'Statistical galaxy reconstruction + measured local stars':'Measured HYG catalog only · no reconstruction');
  $('outward-label').textContent=m==='earth'?'Explore the Solar System':m==='solar'?'Meet our stellar neighbors':m==='stars'?'See the Milky Way':'Return to Earth';
  $('sizes-option').hidden=m!=='solar';$('orbits-option').hidden=m==='galaxy'||(m==='earth'&&state.planet.name!=='Earth');$('reconstruction-option').hidden=m!=='galaxy';
  $('orbits-option').querySelector('span').textContent=m==='stars'?'Distance rings':'Orbits';
  $('play').disabled=m==='stars'||m==='galaxy';$('date').disabled=m==='stars'||m==='galaxy';$('speed').disabled=m==='stars'||m==='galaxy';
  if(m==='stars'||m==='galaxy'){state.playing=false;updatePlay();}
}
function resize() {
  const w=innerWidth,h=innerHeight;renderer.setSize(w,h);camera.aspect=w/h;
  const factor=w<=760?Math.max(1,h/w*(state.mode==='solar'?1.45:1.08)):1;
  camera.position.sub(controls.target).multiplyScalar(factor/viewFactor).add(controls.target);viewFactor=factor;
  if(current)controls.maxDistance=current.max*factor;
  // Keep the working view clear of the reading panel; on phones, place the object above it.
  camera.clearViewOffset();
  if(w>760)camera.setViewOffset(w,h,-w*(state.mode==='earth'?.115:.07),0,w,h);
  else camera.setViewOffset(w,h,0,h*(state.mode==='earth'?.15:.13),w,h);
  camera.updateProjectionMatrix();
}
function setClip() {
  camera.near=state.mode==='earth'?.001:state.mode==='solar'?.000001:state.mode==='stars'?.005:10;
  camera.far=state.mode==='galaxy'?1e6:state.mode==='stars'?30000:12000;camera.updateProjectionMatrix();
}
function assignScene(mode,reset=true) {
  if(mode==='earth') {
    const key='planet-'+state.planet.name;
    current=sceneCache[key] ||= earthScene(state.planet);
  } else current=sceneCache[mode] ||= mode==='solar'?solarScene():mode==='stars'?starScene():galaxyScene();
  controls.minDistance=current.min;controls.maxDistance=current.max;
  if(reset){viewFactor=1;camera.position.copy(current.initial).add(current.target);controls.target.copy(current.target);controls.update();}
  setClip();resize();installLabels(current);updateContext();defaultInfo();
  updateScene(0);updateLabels();
}
async function setMode(mode,{instant=false,planet}={}) {
  if(!modes.includes(mode)||state.transitioning)return;
  clearTimeout(toastTimer);$('toast').classList.remove('visible');
  if(mode==='earth'&&!planet)state.planet=PLANETS[2];
  if(planet)state.planet=planet;
  const changed=state.mode!==mode;
  if(!instant&&!reducedMotion){state.transitioning=true;$('transition').classList.add('cover');await new Promise(r=>setTimeout(r,270));}
  tween=null;state.mode=mode;
  if(mode!=='stars'||changed)state.star=null;
  assignScene(mode);
  history.replaceState(null,'','#'+mode);
  if(!instant&&!reducedMotion){requestAnimationFrame(()=>$('transition').classList.remove('cover'));state.transitioning=false;}
  if(mode==='galaxy'&&changed)toast('The large-scale galaxy is reconstructed. The local star catalog is measured.');
}
function tweenCamera(target,offset,duration=1100) {
  if(reducedMotion){controls.target.copy(target);camera.position.copy(target).add(offset);controls.update();return;}
  tween={start:performance.now(),duration,fromTarget:controls.target.clone(),toTarget:target.clone(),fromPos:camera.position.clone(),toPos:target.clone().add(offset)};
}
async function focusPlanet(planet) {state.star=null;await setMode('earth',{planet});}
async function focusStar(star) {
  if(state.mode!=='stars')await setMode('stars');
  state.star=star;starInfo(star);
  const target=vec(star.pos);tweenCamera(target,new THREE.Vector3(2,1.5,3.7),1300);
  if(!current.labels.some(l=>l.name===star.name)) {addLabel(current,{name:star.name,position:target,action:()=>focusStar(star),priority:45});installLabels(current);}
  labelItems.forEach(l=>l.el.classList.toggle('selected',l.name===star.name));
}
function updatePlay(){ $('play').textContent=state.playing?'Ⅱ':'▶';$('play').setAttribute('aria-label',state.playing?'Pause time':'Play time'); }
function setPlaying(){if($('play').disabled)return;state.playing=!state.playing;updatePlay();}
function zoom(factor){const offset=camera.position.clone().sub(controls.target);offset.multiplyScalar(factor);offset.setLength(THREE.MathUtils.clamp(offset.length(),controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(offset);tween=null;controls.update();}
function updateScene(dt) {
  const jd=julianDate(state.date),days=jd-2451545;
  if(state.mode==='earth') {
    const p=current.planet;
    sunVector.copy(vec(planetPosition(p,jd))).normalize().negate();
    current.body.sunDir.copy(sunVector);current.sunLight.position.copy(sunVector).multiplyScalar(100);
    // Negative rotation periods are represented by the >90° pole orientation.
    current.body.surface.rotation.y=(days/Math.abs(p.day)%1)*Math.PI*2+.5;
    if(current.body.clouds)current.body.clouds.rotation.y=current.body.surface.rotation.y+.002;
    if(current.moon) {
      const phase=(days/27.321661%1)*Math.PI*2+.8;
      current.moon.position.set(Math.cos(phase)*current.moonDistance,Math.sin(phase)*current.moonDistance*Math.sin(5.145*DEG),Math.sin(phase)*current.moonDistance*Math.cos(5.145*DEG));
      current.moon.rotation.y=-phase;current.moonOrbit.visible=state.orbits&&controls.getDistance()>10;
    }
  } else if(state.mode==='solar') {
    for(const b of current.bodies) {
      b.root.position.fromArray(planetPosition(b.planet,jd));b.sunDir.copy(b.root.position).negate().normalize();
      const physical=b.planet.radius/AU_KM;
      const distance=camera.position.distanceTo(b.root.position);
      const enlarged=Math.min(.17*Math.sqrt(b.planet.radius/6371),distance*.0034);
      b.root.scale.setScalar(state.trueSizes?physical:Math.max(physical,enlarged));
      b.surface.rotation.y=(days/Math.abs(b.planet.day)%1)*Math.PI*2;
      if(b.clouds)b.clouds.rotation.y=b.surface.rotation.y;
    }
    const sunSize=state.trueSizes?.00465047:Math.max(.00465047,Math.min(.32,camera.position.length()*.006));current.sun.scale.setScalar(sunSize);
    current.halo.visible=!state.trueSizes;current.orbits.visible=state.orbits;
  } else if(state.mode==='stars') current.guides.visible=state.orbits;
  else {current.model.visible=state.reconstruction;current.guides.visible=state.reconstruction;current.catalog.material.uniforms.opacity.value=state.reconstruction?.0015:.16;}
}
const proj=new THREE.Vector3(),camDir=new THREE.Vector3(),world=new THREE.Vector3();
function updateLabels() {
  const w=innerWidth,h=innerHeight,occupied=[],panel=$('object-info').getBoundingClientRect();
  camera.getWorldDirection(camDir);current.scene.updateMatrixWorld();
  const sorted=[...labelItems].sort((a,b)=>b.priority-a.priority);
  for(const item of sorted) {
    const el=item.el;
    if(!state.labels){el.hidden=true;continue;}
    if(item.object)item.object.getWorldPosition(world);else world.copy(item.position);
    const d=camera.position.distanceTo(world);
    if(d>item.maxDistance||(state.mode==='earth'&&controls.getDistance()<8)){el.hidden=true;continue;}
    proj.copy(world).project(camera);
    if(proj.z<-1||proj.z>1||Math.abs(proj.x)>1.1||Math.abs(proj.y)>1.1){el.hidden=true;continue;}
    const x=(proj.x+1)/2*w+9,y=(-proj.y+1)/2*h-11;
    const labelWidth=Math.min(240,item.name.length*(w<761?4.7:5.8)+29),labelHeight=24;
    if(y<116||y>h-140||x+labelWidth>w-16||(x<panel.right+8&&x+labelWidth>panel.left&&y>panel.top-12&&y<panel.bottom+8)||(w>760&&x<280&&y<350)) {el.hidden=true;continue;}
    const rect={x,y,w:labelWidth,h:labelHeight};
    if(occupied.some(r=>x<r.x+r.w&&x+rect.w>r.x&&y<r.y+r.h&&y+rect.h>r.y)){el.hidden=true;continue;}
    occupied.push(rect);el.hidden=false;el.style.transform=`translate(${Math.round(x)}px,${Math.round(y)}px)`;
  }
}
function updateReadout() {
  const d=controls.getDistance();let value,label;
  if(state.mode==='earth'){const km=Math.max(0,camera.position.length()-1)*current.planet.radius;value=`${format(km)} km`;label=`ALTITUDE ABOVE ${current.planet.name.toUpperCase()}`;}
  else if(state.mode==='solar'){value=`${format(d,d<1?3:1)} AU`;label='DISTANCE TO VIEW CENTER';}
  else {value=`${format(d,d<100?1:0)} ${innerWidth<=760?'ly':'light-years'}`;label=state.mode==='stars'?'DISTANCE TO VIEW CENTER':'DISTANCE TO GALACTIC VIEW';}
  $('distance-value').textContent=value;$('distance-label').textContent=label;
}
function frame(now) {
  animation=requestAnimationFrame(frame);
  const dt=Math.min((now-last)/1000,.05);last=now;
  if(document.hidden)return;
  if(state.playing) {
    const ms=state.date.getTime()+dt*state.speed*86400000;
    if(ms>Date.parse('2050-12-31T23:59:59Z')){state.date=new Date('2050-12-31T12:00:00Z');state.playing=false;updatePlay();toast('Reached the end of the JPL model’s supported date range.');}
    else state.date=new Date(ms);
  }
  if(tween) {
    const t=Math.min(1,(now-tween.start)/tween.duration),ease=t*t*(3-2*t);
    controls.target.lerpVectors(tween.fromTarget,tween.toTarget,ease);camera.position.lerpVectors(tween.fromPos,tween.toPos,ease);
    if(t===1)tween=null;
  }
  controls.update();updateScene(dt);renderer.render(current.scene,camera);
  uiTime+=dt;
  if(uiTime>.08){uiTime=0;updateLabels();updateReadout();if(state.playing&&document.activeElement!==$('date'))$('date').value=dateText();}
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
function wireControls() {
  document.querySelectorAll('[data-mode]').forEach(el=>el.onclick=()=>setMode(el.dataset.mode));
  document.querySelector('.brand').onclick=e=>{e.preventDefault();setMode('earth',{planet:PLANETS[2]});};
  $('outward').onclick=()=>setMode(modes[(modes.indexOf(state.mode)+1)%4],{planet:PLANETS[2]});
  $('zoom-in').onclick=()=>zoom(.7);$('zoom-out').onclick=()=>zoom(1.4);
  $('reset-view').onclick=()=>{tweenCamera(current.target,current.initial.clone().multiplyScalar(viewFactor),900);state.star=null;defaultInfo();};
  $('top-view').onclick=()=>{const d=controls.getDistance();tweenCamera(controls.target,new THREE.Vector3(0,d,.001*d),800);};
  $('labels-toggle').onclick=()=>{state.labels=!state.labels;$('labels-toggle').setAttribute('aria-pressed',String(state.labels));};
  $('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('Fullscreen is unavailable in this browser window.');}};
  $('play').onclick=setPlaying;
  $('date').onchange=()=>{
    const input=$('date');if(!input.value||!input.checkValidity()){input.value=dateText();toast('Choose a date from 1800 through 2050.');return;}
    state.date=new Date(input.value+'T12:00:00Z');
    // Rebuild orbit lines for the selected secular epoch.
    if(sceneCache.solar)sceneCache.solar.bodies.forEach((body,i)=>{const geometry=sceneCache.solar.orbits.children[i].geometry;geometry.setFromPoints(orbitPath(body.planet,julianDate(state.date)).map(vec));});
  };
  $('date').oninput=()=>{if($('date').value&&$('date').checkValidity())$('date').onchange();};
  $('speed').onchange=()=>{state.speed=Number($('speed').value);};
  $('orbits').onchange=()=>{state.orbits=$('orbits').checked;};
  $('true-sizes').onchange=()=>{state.trueSizes=$('true-sizes').checked;updateContext();if(state.trueSizes)toast('Physical sizes enabled. Most planets are smaller than one pixel at this distance.');};
  $('reconstruction').onchange=()=>{state.reconstruction=$('reconstruction').checked;updateContext();};
  $('search-open').onclick=openSearch;$('search-input').oninput=()=>searchResults($('search-input').value);
  $('search-input').onkeydown=e=>{if(e.key==='ArrowDown'){e.preventDefault();$('search-results').querySelector('button')?.focus();}if(e.key==='Enter'){$('search-results').querySelector('button')?.click();}};
  $('about-open').onclick=()=>$('about-dialog').showModal();$('help-open').onclick=()=>$('help-dialog').showModal();
  document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}}));
  document.addEventListener('keydown',e=>{
    if(document.querySelector('dialog[open]')||['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))return;
    if(e.key==='/'){e.preventDefault();openSearch();}
    if(['1','2','3','4'].includes(e.key))setMode(modes[Number(e.key)-1]);
    if(e.code==='Space'&&!['BUTTON','A'].includes(document.activeElement?.tagName)){e.preventDefault();setPlaying();}
    if(e.key.toLowerCase()==='r'){tweenCamera(current.target,current.initial.clone().multiplyScalar(viewFactor));state.star=null;defaultInfo();}
    if(e.key==='+'||e.key==='=')zoom(.8);if(e.key==='-')zoom(1.25);
    if(e.key.startsWith('Arrow')){
      e.preventDefault();tween=null;const offset=camera.position.clone().sub(controls.target),sph=new THREE.Spherical().setFromVector3(offset);
      if(e.key==='ArrowLeft')sph.theta-=.1;if(e.key==='ArrowRight')sph.theta+=.1;if(e.key==='ArrowUp')sph.phi-=.1;if(e.key==='ArrowDown')sph.phi+=.1;sph.makeSafe();camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(sph));
    }
  });
  controls.addEventListener('start',()=>{tween=null;});
  let pointerDown;
  renderer.domElement.addEventListener('pointerdown',e=>{pointerDown={x:e.clientX,y:e.clientY};});
  renderer.domElement.addEventListener('pointerup',e=>{
    if(!pointerDown||Math.hypot(e.clientX-pointerDown.x,e.clientY-pointerDown.y)>5||state.mode!=='solar')return;
    const r=renderer.domElement.getBoundingClientRect(),mouse=new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);
    raycaster.setFromCamera(mouse,camera);const hit=raycaster.intersectObjects(current.pickables,false)[0];
    if(hit){let object=hit.object;while(object&&!object.userData.planet)object=object.parent;if(object)focusPlanet(object.userData.planet);}
  });
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(animation);$('fatal').hidden=false;$('fatal-message').textContent='The graphics context was interrupted. Reload the atlas to restore the view.';});
  addEventListener('resize',resize);
  addEventListener('hashchange',()=>{const mode=location.hash.slice(1);if(modes.includes(mode))setMode(mode);});
}

async function start() {
  try {
    renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    canvasHost.append(renderer.domElement);camera=new THREE.PerspectiveCamera(43,innerWidth/innerHeight,.001,12000);
    controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.07;controls.rotateSpeed=.65;controls.zoomSpeed=.75;controls.screenSpacePanning=true;
    catalogArray=decodeStars();await loadTextures();
    const initial=modes.includes(location.hash.slice(1))?location.hash.slice(1):'earth';state.mode=initial;$('date').value=dateText();assignScene(initial);wireControls();
    $('loading').classList.add('done');last=performance.now();frame(last);
    // Small, read-only diagnostic surface for numerical/browser verification.
    window.holos={getState:()=>({mode:state.mode,planet:state.planet.name,star:state.star?.name,date:dateText(),playing:state.playing,trueSizes:state.trueSizes,reconstruction:state.reconstruction,catalogStars:META.count,searchable:META.searchable,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,points:renderer.info.render.points,webgl:renderer.capabilities.isWebGL2,loadedTextures:Object.keys(textures).length}),
      getSolarPositions:()=>PLANETS.map(p=>({name:p.name,position:planetPosition(p,julianDate(state.date)),radiusAU:p.radius/AU_KM})),
      getCamera:()=>({position:camera.position.toArray(),target:controls.target.toArray(),distance:controls.getDistance()})};
  } catch(error){fatal(error);}
}
start();
