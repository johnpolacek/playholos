import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Vector3 } from 'three';
import { sphereSilhouette } from '../src/coordinates.js';

test('game-region census is complete within its radius and consistent with its metadata',async()=>{
  const binary=await readFile(new URL('../data/neighborhood.bin',import.meta.url));
  const meta=JSON.parse(await readFile(new URL('../data/neighborhood-meta.json',import.meta.url)));
  assert.equal(binary.byteLength,meta.count*5*4);
  assert.equal(meta.gaia+meta.hipparcosSupplement,meta.count);
  const records=[];
  for(let i=0;i<binary.byteLength;i+=20)records.push([0,4,8,12,16].map(offset=>binary.readFloatLE(i+offset)));
  assert.ok(records.every(r=>r.every(Number.isFinite)));
  const distances=records.map(r=>Math.hypot(r[0],r[1],r[2]));
  assert.ok(distances.every(d=>d>0&&d<=meta.radiusLy));
  assert.equal(distances.filter(d=>d<=meta.seedRadiusLy).length,meta.withinSeed);
  // Gaia measures Proxima; Sirius is too bright for it and comes from Hipparcos.
  const landmark=name=>meta.landmarks.find(l=>l.name===name);
  assert.equal(landmark('Proxima Centauri').source,'Gaia EDR3');
  assert.ok(Math.abs(landmark('Proxima Centauri').distance-4.246)<.01);
  assert.equal(landmark('Sirius').source,'Hipparcos via HYG');
  for(const l of meta.landmarks)assert.ok(records.some(r=>Math.hypot(r[0]-l.pos[0],r[1]-l.pos[1],r[2]-l.pos[2])<.01),l.name);
});

test('sphere silhouette grazes the sphere and disappears from inside',()=>{
  const camera=new Vector3(120,210,-90),radius=100;
  const outline=sphereSilhouette(radius,camera);
  assert.equal(outline.length,257);
  for(const p of outline){
    assert.ok(Math.abs(p.length()-radius)<1e-9);
    // Tangency: the sight line from the camera is perpendicular to the radius.
    assert.ok(Math.abs(p.clone().sub(camera).dot(p))<1e-7);
  }
  assert.equal(sphereSilhouette(radius,new Vector3(0,40,0)),null);
});
