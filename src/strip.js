import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AU_KM, PLANETS, julianDate, planetPosition } from './astronomy.js';
import { Universe } from './universe.js';
import { RENDER_DISTANCE, clampDistance, eclipticToGalactic, homeTarget } from './navigation.js';
import { INK_THEMES, setInkTheme } from './line-art.js';

// A small view of the atlas for the game's map strip: the same Universe, one camera, opening on Earth.
// The caller loads the data, so this file knows nothing about how it is bundled.
// Line edition only: the bundler defines __LINE_ART__ as true.
export async function mountStrip(parent,{textures:urls,stars,neighborhoodStars,neighborhood,date=new Date(),theme='light'}) {
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

  // The atlas's Earth view: app.js planetView.
  const earth=PLANETS[2],body=universe.bodies[2];
  const direction=new THREE.Vector3(...planetPosition(earth,julianDate(date))).normalize().negate().applyAxisAngle(new THREE.Vector3(0,1,0),.75);
  direction.multiplyScalar(3.55);direction.y=1.1;
  const view=eclipticToGalactic(direction).multiplyScalar(earth.radius/AU_KM);
  const pose={target:body.positionAU.clone(),direction:view.clone().normalize(),distance:view.length(),home:true,follow:{planet:earth}};

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
  }
  const observer=new ResizeObserver(resize);observer.observe(parent);
  parent.append(renderer.domElement);resize();syncCamera();
  renderer.setAnimationLoop(()=>{
    if(document.hidden)return;
    controls.update();readControls();
    if(pose.home)pose.target.copy(homeTarget(pose.distance,universe.earth.positionAU));
    syncCamera();universe.update(pose,state,camera);renderer.render(universe.scene,camera);
  });

  return {
    setTheme(name){setInkTheme(name);universe.scene.background.set(INK_THEMES[name].paper);},
    dispose(){renderer.setAnimationLoop(null);observer.disconnect();controls.dispose();renderer.dispose();renderer.domElement.remove();},
  };
}
