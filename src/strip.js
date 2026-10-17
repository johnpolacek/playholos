import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AU_KM, PLANETS, julianDate, planetPosition } from './astronomy.js';
import { Universe } from './universe.js';
import { LY_AU, RENDER_DISTANCE, clampDistance, eclipticToGalactic, homeTarget, planFlight, sampleFlight } from './navigation.js';
import { INK_THEMES, setInkTheme } from './line-art.js';

// A small view of the atlas for the game's map strip: the same Universe, one camera, opening on Earth.
// show(stage) flies outward or home through the atlas's five stages, as its own destinations do.
// The caller loads the data, so this file knows nothing about how it is bundled.
// Line edition only: the bundler defines __LINE_ART__ as true.
// turnSeconds: real seconds per Earth day, as the atlas plays time. 0 holds Earth still.
// onFrame: called each frame with the camera's distance from Earth's surface in AU.
export async function mountStrip(parent,{textures:urls,stars,neighborhoodStars,neighborhood,date=new Date(),theme='light',turnSeconds=0,onFrame}) {
  setInkTheme(theme);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,logarithmicDepthBuffer:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;
  renderer.domElement.style.cssText='display:block;width:100%;height:100%;touch-action:none';
  const camera=new THREE.PerspectiveCamera(43,1,.05,1e6);camera.position.set(0,0,RENDER_DISTANCE);
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.07;controls.rotateSpeed=.65;controls.zoomSpeed=2;controls.minDistance=1;controls.maxDistance=10000;controls.screenSpacePanning=true;

  const loader=new THREE.TextureLoader(),textures={};
  await Promise.all(Object.entries(urls).map(async([key,url])=>{
    const texture=await loader.loadAsync(url);texture.colorSpace=THREE.SRGBColorSpace;
    texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());textures[key]=texture;
  }));
  const universe=new Universe(renderer,textures,stars,neighborhoodStars,neighborhood);universe.updateEphemeris(date);
  const state={mode:'earth',planet:PLANETS[2],star:null,galaxy:null,date,playing:false,speed:1,labels:true,orbits:true,trueSizes:true,reconstruction:false,portraits:true,extents:true,uncertainty:true,region:false};

  // The atlas's viewpoints for each stage: app.js planetView and bookmark. A tall frame stands farther back, as on a phone.
  let viewFactor=1;
  function bookmark(stage){
    if(stage==='earth'){
      const earth=PLANETS[2];
      const direction=new THREE.Vector3(...planetPosition(earth,julianDate(state.date))).normalize().negate().applyAxisAngle(new THREE.Vector3(0,1,0),.75);
      direction.multiplyScalar(3.55);direction.y=1.1;
      const view=eclipticToGalactic(direction).multiplyScalar(earth.radius/AU_KM*viewFactor);
      return {target:universe.bodies[2].positionAU.clone(),direction:view.clone().normalize(),distance:view.length(),home:true,follow:{planet:earth}};
    }
    const normal=eclipticToGalactic(new THREE.Vector3(0,1,0)).normalize();
    const tangent=new THREE.Vector3(0,1,0).addScaledVector(normal,-normal.y).normalize();
    const view=stage==='solar'?normal.multiplyScalar(.36).addScaledVector(tangent,.933).multiplyScalar(76*viewFactor):
      stage==='stars'?new THREE.Vector3(21,15,29).multiplyScalar(LY_AU*viewFactor):stage==='galaxy'?new THREE.Vector3(18000,85000,105000).multiplyScalar(LY_AU*viewFactor):new THREE.Vector3(-.1,.86,.5).normalize().multiplyScalar(5.2e6*LY_AU*viewFactor);
    return {target:homeTarget(view.length(),universe.earth.positionAU),direction:view.clone().normalize(),distance:view.length(),home:true,follow:null};
  }
  const pose=bookmark('earth');
  let flight=null;
  const still=matchMedia('(prefers-reduced-motion: reduce)');

  // As app.js: the camera orbits a fixed point, and the pose carries the true position and scale.
  const offset=new THREE.Vector3();
  function syncCamera(){controls.target.set(0,0,0);camera.position.copy(pose.direction).multiplyScalar(RENDER_DISTANCE);camera.lookAt(controls.target);camera.updateMatrixWorld();}
  function readControls(){
    offset.copy(camera.position).sub(controls.target);
    if(controls.target.lengthSq()>1e-16){pose.target.addScaledVector(controls.target,pose.distance/RENDER_DISTANCE);pose.home=false;pose.follow=null;}
    pose.distance=clampDistance(pose.distance*offset.length()/RENDER_DISTANCE);pose.direction.copy(offset).normalize();syncCamera();
  }
  function resize(){
    const {width:w,height:h}=parent.getBoundingClientRect();if(!w||!h)return;
    renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
    // As app.js resize: rescale the view, and stop any flight planned at the old scale.
    const factor=Math.max(1,h/w*1.25);
    if(factor!==viewFactor){flight=null;pose.distance=clampDistance(pose.distance*factor/viewFactor);viewFactor=factor;}
  }
  const observer=new ResizeObserver(resize);observer.observe(parent);
  parent.append(renderer.domElement);resize();syncCamera();
  let last=performance.now(),driver=null;const eye=new THREE.Vector3(),size=new THREE.Vector2();
  renderer.setAnimationLoop(time=>{
    const dt=Math.max(0,Math.min((time-last)/1000,.05));last=time;
    if(document.hidden)return;
    if(turnSeconds){state.date=new Date(state.date.getTime()+dt/turnSeconds*86400000);universe.updateEphemeris(state.date);}
    if(driver){
      // Driven: the caller sets the whole view each frame, lens included.
      const view=driver(renderer.getSize(size),universe.earth.positionAU);
      pose.target.copy(view.target);pose.direction.copy(view.direction);pose.distance=view.distance;pose.home=false;pose.follow=null;flight=null;
      camera.up.copy(view.up);camera.fov=view.fov/Math.PI*180;camera.setViewOffset(size.x,size.y,0,size.y*view.lift,size.x,size.y);camera.updateProjectionMatrix();
    } else if(flight){
      const t=Math.min(1,(time-flight.start)/flight.duration),sample=sampleFlight(flight,t,universe.earth.positionAU);
      pose.target.copy(sample.target);pose.direction.copy(sample.direction);pose.distance=sample.distance;
      if(t===1){pose.home=flight.to.home;pose.follow=flight.to.follow;flight=null;}
    } else {
      controls.update();readControls();
      if(pose.home)pose.target.copy(homeTarget(pose.distance,universe.earth.positionAU));
    }
    syncCamera();universe.update(pose,state,camera);renderer.render(universe.scene,camera);
    if(onFrame){eye.copy(pose.target).addScaledVector(pose.direction,pose.distance);onFrame(Math.max(0,eye.distanceTo(universe.earth.positionAU)-PLANETS[2].radius/AU_KM));}
  });

  return {
    show(stage){
      // As app.js flyTo: settle the orbit damping, then plan from the exact pose.
      controls.enableDamping=false;controls.update();readControls();controls.enableDamping=true;
      const to=bookmark(stage);
      if(still.matches){flight=null;Object.assign(pose,{distance:to.distance,home:to.home,follow:to.follow});pose.target.copy(to.target);pose.direction.copy(to.direction);return;}
      flight={...planFlight(pose,to,{home:pose.home&&to.home}),to,start:performance.now()};
      pose.follow=null;pose.home=flight.home;
    },
    // For the first screen: fn(size, earthAU) returns {target, direction, distance, up, fov, lift} each frame.
    drive(fn){driver=fn;controls.enabled=false;},
    setTheme(name){setInkTheme(name);universe.scene.background.set(INK_THEMES[name].paper);},
    dispose(){renderer.setAnimationLoop(null);observer.disconnect();controls.dispose();renderer.dispose();renderer.domElement.remove();},
  };
}
