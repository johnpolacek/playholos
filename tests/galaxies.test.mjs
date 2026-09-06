import test from 'node:test';
import assert from 'node:assert/strict';
import { PC_LY } from '../src/astronomy.js';
import { GALAXIES, galaxyPosition } from '../src/galaxies.js';

test('galaxy coordinates preserve catalog distance and the Galactic X, Z, −Y frame',()=>{
  for(const galaxy of GALAXIES){
    const p=galaxyPosition(galaxy),distance=galaxy.kpc*1000*PC_LY;
    assert.ok(Math.abs(p.length()-distance)<1e-8);
    assert.ok(Math.abs(Math.asin(p.y/distance)*180/Math.PI-galaxy.b)<1e-10);
    const longitude=(Math.atan2(-p.z,p.x)*180/Math.PI+360)%360;
    assert.ok(Math.abs(longitude-galaxy.l)<1e-10);
  }
  const m31=galaxyPosition(GALAXIES.find(g=>g.id==='m31'));
  assert.ok(m31.x<0&&m31.y<0&&m31.z<0);
  assert.ok(m31.length()>2.5e6&&m31.length()<2.6e6);
  const lmc=galaxyPosition(GALAXIES.find(g=>g.id==='lmc'));
  assert.ok(lmc.x>0&&lmc.y<0&&lmc.z>0);
  assert.ok(lmc.length()>160000&&lmc.length()<170000);
});

test('Andromeda companion separations agree with independent table estimates',()=>{
  const m31=galaxyPosition(GALAXIES.find(g=>g.id==='m31'));
  for(const [id,kpc] of [['m32',23],['ngc205',42],['m33',206]]){
    const separation=m31.distanceTo(galaxyPosition(GALAXIES.find(g=>g.id===id)))/(1000*PC_LY);
    assert.ok(Math.abs(separation-kpc)<2,`${id}: ${separation} kpc`);
  }
});

test('galaxy search names and identifiers are unambiguous',()=>{
  const names=GALAXIES.flatMap(g=>[g.name,...g.aliases].map(n=>n.toLowerCase()));
  assert.equal(new Set(names).size,names.length);
  assert.equal(new Set(GALAXIES.map(g=>g.id)).size,GALAXIES.length);
});
