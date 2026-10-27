import { build } from 'esbuild';
import { readdir,readFile,writeFile } from 'node:fs/promises';
import path from 'node:path';
const root=new URL('../',import.meta.url);
const assetFiles=(await readdir(new URL('assets/',root))).filter(file=>/\.(jpg|png)$/.test(file));
const encode=async file=>`data:image/${file.endsWith('.png')?'png':'jpeg'};base64,${(await readFile(new URL('assets/'+file,root))).toString('base64')}`;
const catalog=await readFile(new URL('data/stars.json',root),'utf8');
const meta=await readFile(new URL('data/catalog-meta.json',root),'utf8');
const stars=(await readFile(new URL('data/stars.bin',root))).toString('base64');
const neighborhood=await readFile(new URL('data/neighborhood-meta.json',root),'utf8');
const neighborhoodStars=(await readFile(new URL('data/neighborhood.bin',root))).toString('base64');
const css=await readFile(new URL('src/style.css',root),'utf8');
const template=await readFile(new URL('src/template.html',root),'utf8');
const license=await readFile(new URL('node_modules/three/LICENSE',root),'utf8');
const ephemerisLicense=(await readFile(new URL('node_modules/astronomy-engine/esm/astronomy.js',root),'utf8')).split('*/')[0].replace('/**','').trim();
const attribution=`<!--\nThree.js license:\n${license}\nAstronomy Engine license:\n${ephemerisLicense}\nPlanetary texture maps: Solar System Scope / INOVE, CC BY 4.0, https://www.solarsystemscope.com/textures/\nHYG 4.1 star data: David Nash / Astronexus, CC BY-SA 4.0, https://github.com/astronexus/HYG-Database\nAdaptations: distance filtering and Galactic coordinate transformation; adapted data remains CC BY-SA 4.0.\nNearby-star census within 100 ly: Gaia Catalogue of Nearby Stars, Gaia Collaboration, Smart et al. (2021), A&A 649, A6. Credit: ESA, Gaia DPAC. Gaia data: CC BY-NC 3.0 IGO; commercial use requires ESA authorization.
Galaxy compilation: Andrew B. Pace, Local Volume Database v1.1.1, CC0, https://github.com/apace7/local_volume_database\nGalaxy measurements: original studies cited per object; RC3 B25 contours, de Vaucouleurs et al. (1991), CDS VII/155.\n-->\n`;

// index.html is the line drawing; color.html keeps the original color rendering.
// The line drawing traces coastlines and contours from the surface maps, so it
// omits the maps used only for color (clouds, night lights, Sun, ring alpha).
const LINE_UNUSED=['earth_clouds','earth_nightmap','sun','saturn_ring_alpha'];
const lineNote=`<h3>Drawing style</h3><p>The atlas is drawn as ink on paper, or chalk on slate in dark mode. Planet and Moon globes are traced from the static surface maps described below: Earth’s coastlines come from its land–ocean contrast, and other globes show tonal contours. Night-side hatching follows the computed sunlight direction. Planet circles, star rings, galaxy drawings, contour hatching, and dashed distance guides are map symbols, not measured sizes or structures. A <a href="color.html">color edition</a> with the full surface imagery sits beside this file.</p>`;
// Overlay descriptions written for the color rendering, restated for the drawing.
const LINE_WORDING=[['Blue outlines with soft shading show','Hatched outlines show'],['Gold line segments show','Heavier line segments show'],['Marker size, color, halos, and contour shading are map styling','Marker size, rings, and contour hatching are map styling']];

async function buildEdition({lineArt,output}) {
  const assets={};
  for(const file of assetFiles){const name=path.parse(file).name;if(lineArt&&LINE_UNUSED.includes(name))continue;assets[name]=await encode(file);}
  const embedded=`export const ASSETS=${JSON.stringify(assets)};export const CATALOG=${catalog};export const META=${meta};export const STAR_BUFFER=${JSON.stringify(stars)};export const NEIGHBORHOOD=${neighborhood};export const NEIGHBORHOOD_BUFFER=${JSON.stringify(neighborhoodStars)};`;
  const result=await build({entryPoints:[new URL('src/app.js',root).pathname],bundle:true,write:false,format:'iife',minify:true,target:'es2020',legalComments:'inline',define:{__LINE_ART__:String(lineArt)},plugins:[{name:'embedded-assets',setup(b){b.onResolve({filter:/embedded\.js$/},()=>({path:'embedded',namespace:'virtual'}));b.onLoad({filter:/.*/,namespace:'virtual'},()=>({contents:embedded,loader:'js'}));}}]});
  // Escape script closing delimiters so embedded data can never terminate the script tag.
  const js=result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
  const styles=lineArt?css+'\n'+await readFile(new URL('src/line-art.css',root),'utf8'):css;
  let html=template.replace('<head>','<head>\n'+attribution).replace('/*__CSS__*/',()=>styles).replace('/*__APP__*/',()=>js).replace('<!--__EDITION__-->',()=>lineArt?lineNote:'');
  if(lineArt){html=html.replace('content="#06090e"','content="#fbfaf7"');for(const [from,to] of LINE_WORDING){if(!html.includes(from))throw new Error(`Missing wording: ${from}`);html=html.replace(from,to);}}
  else html=html.replace('<title>Holos — Earth to the Local Group</title>','<title>Holos — Earth to the Local Group · Color edition</title>').replace('A COSMIC ATLAS','A COSMIC ATLAS · COLOR EDITION');
  await writeFile(new URL(output,root),html);
  console.log(`Built self-contained ${output} · ${(Buffer.byteLength(html)/1024/1024).toFixed(2)} MB · no runtime network requests`);
}
await buildEdition({lineArt:true,output:'index.html'});
await buildEdition({lineArt:false,output:'color.html'});
