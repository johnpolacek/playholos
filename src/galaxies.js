import { Vector3 } from 'three';
import { DEG, PC_LY } from './astronomy.js';

// Galactic longitude, latitude, and heliocentric distance: McConnachie (2012),
// AJ 144, 4, Table 2. https://arxiv.org/html/1204.1562#S3
// This is a curated subset, not a complete census. Model radii and orientations
// below are illustrative rendering parameters, not measured stellar boundaries.
export const GALAXIES = [
  {id:'m31',name:'Andromeda',aliases:['M31','M 31','NGC 224'],l:121.2,b:-21.6,kpc:783,type:'Spiral galaxy',family:'M31 subgroup',shape:'spiral',radius:100000,tilt:.7,turn:.5,color:'#e5c6a3',description:'A vast spiral beyond our own. Andromeda and the Milky Way are the two dominant galaxies of the Local Group, each surrounded by smaller companions.'},
  {id:'m33',name:'Triangulum',aliases:['M33','M 33','NGC 598'],l:133.6,b:-31.3,kpc:809,type:'Spiral galaxy',family:'Local Group',shape:'spiral',radius:30000,tilt:.35,turn:1.8,color:'#a6c7ed',description:'The third large spiral of the Local Group. Triangulum is smaller than the Milky Way and Andromeda, with a loose disk of stars and star-forming regions.'},
  {id:'lmc',name:'Large Magellanic Cloud',aliases:['LMC'],l:280.5,b:-32.9,kpc:51,type:'Magellanic irregular',family:'Milky Way subgroup',shape:'irregular',radius:16000,tilt:.4,turn:.8,color:'#a6d4e9',description:'A close companion of the Milky Way. Its uneven stellar disk and central bar offer a different galactic shape from the great spirals.'},
  {id:'smc',name:'Small Magellanic Cloud',aliases:['SMC'],l:302.8,b:-44.3,kpc:64,type:'Dwarf irregular',family:'Milky Way subgroup',shape:'irregular',radius:9000,tilt:1.1,turn:2,color:'#b6cfec',description:'A smaller, irregular companion near the Large Magellanic Cloud. Both clouds belong to the Milky Way’s surrounding family of galaxies.'},
  {id:'m32',name:'M32',aliases:['M 32','NGC 221'],l:121.2,b:-22,kpc:805,type:'Compact elliptical',family:'M31 subgroup',shape:'elliptical',radius:4000,tilt:.5,turn:1,color:'#e8caa6',description:'A compact elliptical companion of Andromeda. Its rounded concentration of stars contrasts with its neighbor’s extended spiral disk.'},
  {id:'ngc205',name:'NGC 205',aliases:['M110','M 110'],l:120.7,b:-21.1,kpc:824,type:'Dwarf elliptical',family:'M31 subgroup',shape:'elliptical',radius:8000,tilt:.8,turn:2.4,color:'#dcc8b2',description:'Also called M110, this dwarf elliptical is one of Andromeda’s close companions. Zoom toward Andromeda to separate the surrounding galaxies.'},
  {id:'ic10',name:'IC 10',aliases:['IC10'],l:119,b:-3.3,kpc:794,type:'Dwarf irregular',family:'M31 subgroup',shape:'irregular',radius:4500,tilt:1,turn:.3,color:'#c6bbdf',description:'An irregular dwarf in the Andromeda region of the Local Group. Its position adds depth to the family of galaxies beyond our own.'},
  {id:'ngc6822',name:'NGC 6822',aliases:['NGC6822','Barnard’s Galaxy','Barnard galaxy'],l:25.4,b:-18.4,kpc:459,type:'Dwarf irregular',family:'Local Group',shape:'irregular',radius:7000,tilt:.7,turn:1.5,color:'#afcddf',description:'Barnard’s Galaxy, an irregular dwarf farther from the large spirals. It helps reveal the space between the Local Group’s two main concentrations.'},
  {id:'ic1613',name:'IC 1613',aliases:['IC1613'],l:129.7,b:-60.6,kpc:755,type:'Dwarf irregular',family:'Local Group',shape:'irregular',radius:7000,tilt:.3,turn:.2,color:'#b1c9df',description:'A relatively isolated dwarf galaxy. Its sparse, irregular stellar body sits away from the crowded neighborhoods of the largest spirals.'},
  {id:'wlm',name:'WLM',aliases:['Wolf-Lundmark-Melotte','Wolf Lundmark Melotte'],l:75.9,b:-73.6,kpc:933,type:'Dwarf irregular',family:'Local Group',shape:'irregular',radius:6000,tilt:1.2,turn:.8,color:'#b9c9df',description:'Wolf–Lundmark–Melotte, a dwarf on the outskirts of this selection. A small island of stars in the wide spaces of the Local Group.'}
];

// Same Sun-centered axis order as the star catalog: (Galactic X, Z, −Y).
export function galaxyPosition(galaxy) {
  const l=galaxy.l*DEG,b=galaxy.b*DEG,d=galaxy.kpc*1000*PC_LY;
  return new Vector3(d*Math.cos(b)*Math.cos(l),d*Math.sin(b),-d*Math.cos(b)*Math.sin(l));
}
