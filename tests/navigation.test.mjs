import test from 'node:test';
import assert from 'node:assert/strict';
import { Vector3 } from 'three';
import { PLANETS, AU_KM, planetPosition } from '../src/astronomy.js';
import { LY_AU, GALACTIC_CENTER, ECLIPTIC_ROTATION, eclipticToGalactic, homeTarget, renderPosition, planFlight, sampleFlight } from '../src/navigation.js';

const earth=eclipticToGalactic(new Vector3(...planetPosition(PLANETS[2],2451545)));
const direction=new Vector3(.3,.4,.5).normalize();
const close={target:earth,direction,distance:6371.0084/AU_KM*3.7};
const galaxy={target:GALACTIC_CENTER,direction:new Vector3(.1,.8,.6).normalize(),distance:140000*LY_AU};

test('the ecliptic-to-Galactic transform preserves distances and handedness',()=>{
  const basis=[new Vector3(1,0,0),new Vector3(0,1,0),new Vector3(0,0,1)];
  const rotated=basis.map(eclipticToGalactic);
  for(const v of rotated)assert.ok(Math.abs(v.length()-1)<1e-9);
  assert.ok(rotated[0].clone().cross(rotated[1]).distanceTo(rotated[2])<1e-9);
  for(const v of basis)assert.ok(v.clone().applyQuaternion(ECLIPTIC_ROTATION).distanceTo(eclipticToGalactic(v))<1e-9);
});
test('floating origin preserves a kilometer separation when viewing a distant star',()=>{
  const origin=new Vector3(25000000,19000000,-40000000),oneKm=new Vector3(1/AU_KM,0,0);
  const rendered=renderPosition(origin.clone().add(oneKm),origin,.01);
  // CPU doubles at tens of millions of AU resolve meters, while direct GPU
  // float32 positions would lose the entire kilometer offset.
  assert.ok(Math.abs(rendered.x/(100/.01)*AU_KM-1)<.3);
  const local=renderPosition(earth.clone().add(oneKm),earth,.00016);
  assert.ok(Math.abs(local.x/(100/.00016)*AU_KM-1)<1e-7);
});
test('home anchor connects Earth, Sun, and galactic center continuously and reversibly',()=>{
  assert.ok(homeTarget(close.distance,earth).distanceTo(earth)<1e-12);
  assert.equal(homeTarget(59,earth).length(),0);
  assert.equal(homeTarget(38*LY_AU,earth).length(),0);
  assert.equal(homeTarget(galaxy.distance,earth).distanceTo(GALACTIC_CENTER),0);
  let prior=homeTarget(close.distance,earth);
  for(let i=1;i<=20000;i++){
    const d=close.distance*Math.pow(galaxy.distance/close.distance,i/20000),next=homeTarget(d,earth);
    assert.ok(next.distanceTo(prior)/d<.015);prior=next;
  }
});
test('Earth-to-galaxy travel crosses every physical scale with no jump or endpoint drift',()=>{
  for(const [from,to] of [[close,galaxy],[galaxy,close]]){
    const flight=planFlight(from,to,{home:true});let previous=sampleFlight(flight,0,earth);
    const ascending=to.distance>from.distance;
    for(let i=1;i<=4000;i++){
      const p=sampleFlight(flight,i/4000,earth);
      assert.ok(Number.isFinite(p.distance)&&p.distance>0);
      assert.ok(Math.abs(Math.log(p.distance/previous.distance))<.02);
      assert.ok(ascending?p.distance>=previous.distance:p.distance<=previous.distance);
      assert.ok(Math.abs(p.direction.length()-1)<1e-12);previous=p;
    }
    assert.equal(previous.distance,to.distance);assert.deepEqual(previous.target.toArray(),to.target.toArray());
  }
});
test('a flight between close-up objects pulls back before crossing the separation',()=>{
  const to={target:new Vector3(-3,1,0),distance:.0001,direction:new Vector3(-1,.2,.8).normalize()};
  const flight=planFlight(close,to);let moved=false;
  for(let i=0;i<=4000;i++){
    const p=sampleFlight(flight,i/4000,earth);
    if(p.target.distanceTo(close.target)>.001&&p.target.distanceTo(to.target)>.001){moved=true;assert.ok(p.distance>=close.target.distanceTo(to.target)*2.99);}
  }
  assert.ok(moved);assert.deepEqual(sampleFlight(flight,1,earth).target.toArray(),to.target.toArray());
});
test('an interrupted flight can depart from its exact current pose without snapping',()=>{
  const first=planFlight(close,galaxy,{home:true}),middle=sampleFlight(first,.43,earth);
  const reversed=planFlight(middle,close,{home:true}),departure=sampleFlight(reversed,0,earth);
  assert.equal(departure.distance,middle.distance);assert.deepEqual(departure.target.toArray(),middle.target.toArray());
});
