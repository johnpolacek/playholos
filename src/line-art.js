import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

// Line edition: the same atlas drawn as ink on paper. `npm run build` sets
// __LINE_ART__ per output file; unbundled imports (tests) see the color atlas.
export const LINE_ART = typeof __LINE_ART__ !== 'undefined' && __LINE_ART__;
// Light is ink on paper; dark is chalk on slate. Every ink material shares
// these colors, so a theme change recolors the scene without rebuilding it.
export const INK_THEMES = { light:{paper:'#fbfaf7',ink:'#171716'}, dark:{paper:'#121314',ink:'#e6e3db'} };
let theme = INK_THEMES.light;
const paper = new THREE.Color().setStyle(theme.paper, THREE.NoColorSpace), ink = new THREE.Color().setStyle(theme.ink, THREE.NoColorSpace);
export const inkTheme = () => theme;

export function shaderMaterial(parameters) {
  parameters.vertexShader='#include <common>\n#include <logdepthbuf_pars_vertex>\n'+parameters.vertexShader.replace(/\}\s*$/, '\n#include <logdepthbuf_vertex>\n}');
  parameters.fragmentShader='#include <logdepthbuf_pars_fragment>\n'+parameters.fragmentShader.replace(/void main\(\)\s*\{/, 'void main(){\n#include <logdepthbuf_fragment>\n');
  return new THREE.ShaderMaterial(parameters);
}

// Shared GLSL: pixel-width contour of a scalar field, and ink/paper colors in
// display sRGB. These shaders skip color conversion, so hex values match CSS.
const INK_GLSL = `uniform vec3 paper;uniform vec3 ink;uniform float pixelRatio;
float contour(float f,float width){float d=abs(fract(f-.5)-.5)/max(fwidth(f),1e-6);return 1.-smoothstep(width*.5-.5,width*.5+.5,d);}`;
const inkUniforms = () => ({ paper:{value:paper}, ink:{value:ink}, pixelRatio:{value:1} });
const pixelMaterials = new Set(), lineMaterials = new Set(), tintedMaterials = new Set();
export function setInkTheme(name) {
  theme = INK_THEMES[name];
  paper.setStyle(theme.paper, THREE.NoColorSpace); ink.setStyle(theme.ink, THREE.NoColorSpace);
  for (const material of [...lineMaterials, ...tintedMaterials]) material.color.set(theme.ink);
}
// Materials drawn in white (galaxy portraits) take the ink color as a tint.
export function tintWithInk(material) { tintedMaterials.add(material); material.color.set(theme.ink); return material; }
export function syncInkViewport(width, height, pixelRatio) {
  for (const material of lineMaterials) material.resolution.set(width, height);
  for (const material of pixelMaterials) material.uniforms.pixelRatio.value = pixelRatio;
}

// Screen-width lines. Widths stay in CSS pixels at every scale.
export function inkLine(points, opacity = 1, { width = 1, dash = null } = {}) {
  const material = new LineMaterial({ color: theme.ink, linewidth: width, transparent: true, opacity, depthWrite: false, toneMapped: false });
  if (dash) { material.dashed = true; material.dashSize = dash[0]; material.gapSize = dash[1]; }
  lineMaterials.add(material);
  const line = new Line2(new LineGeometry(), material);
  setInkPoints(line, points);
  return line;
}
export function setInkPoints(line, points) {
  const flat = [];
  for (const p of points) Array.isArray(p) ? flat.push(p[0], p[1], p[2]) : flat.push(p.x, p.y, p.z);
  while (flat.length < 6) flat.push(flat[0] ?? 0, flat[1] ?? 0, flat[2] ?? 0);
  // Daily Moon and yearly orbit refreshes rewrite the same buffer in place.
  const buffer = line.geometry.attributes.instanceStart?.data;
  if (buffer && buffer.array.length === (flat.length / 3 - 1) * 6) {
    for (let i = 0, j = 0; i < flat.length - 3; i += 3, j += 6) buffer.array.set(flat.slice(i, i + 6), j);
    buffer.needsUpdate = true; line.geometry.computeBoundingSphere();
  } else line.geometry.setPositions(flat);
  if (line.material.dashed) line.computeLineDistances();
}

// Globe drawing styles derived from each static surface map:
// 0 coastlines, 1 tonal contours, 2 banded contours, 3 outline only.
// `width` is the smoothed field's resolution; lower values draw broader forms.
const SPHERE_STYLES = {
  Sun:{mode:3,night:0}, Moon:{mode:1,levels:2,width:512},
  Mercury:{mode:1,levels:3,width:256}, Venus:{mode:1,levels:3,width:256},
  Earth:{mode:0,width:1024,graticule:1}, Mars:{mode:1,levels:3,width:512},
  Jupiter:{mode:2,levels:4,width:512}, Saturn:{mode:2,levels:4,width:512},
  Uranus:{mode:2,levels:2,width:256}, Neptune:{mode:2,levels:3,width:256}
};
const smoothstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// A smoothed scalar field traced from a surface map: Earth's land–ocean
// mask, or luminance. Fields stay in floating point, since 8-bit plateaus
// near a contour level would fill in as solid patches. Banded worlds are
// averaged along longitude first.
function boxBlur(field, w, h, rx, ry) {
  const out = new Float32Array(field.length);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let k = -rx; k <= rx; k++) sum += field[y * w + (x + k + w) % w];
    out[y * w + x] = sum / (2 * rx + 1);
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let k = -ry; k <= ry; k++) sum += out[Math.max(0, Math.min(h - 1, y + k)) * w + x];
    field[y * w + x] = sum / (2 * ry + 1);
  }
}
function inkField(texture, { mode, width }) {
  const image = texture.image, W = image.width, H = image.height, canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0);
  const d = ctx.getImageData(0, 0, W, H).data, w = width, h = width / 2, field = new Float32Array(w * h), count = new Float32Array(w * h);
  for (let y = 0; y < H; y++) {
    // Rows run bottom-up so the field matches the sphere's flipped image UVs.
    const row = (h - 1 - Math.min(h - 1, Math.floor(y * h / H))) * w;
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4, r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255, j = row + Math.min(w - 1, Math.floor(x * w / W));
      field[j] += mode === 0 ? smoothstep(.025, .11, b - r) * smoothstep(0, .07, b - g) : .299 * r + .587 * g + .114 * b; count[j]++;
    }
  }
  for (let i = 0; i < field.length; i++) field[i] /= count[i];
  if (mode === 2) boxBlur(field, w, h, Math.round(w / 40), 0);
  boxBlur(field, w, h, 1, 1); boxBlur(field, w, h, 1, 1);
  // Stretch luminance between its 2nd and 98th percentiles, so contour
  // levels divide every map's own tonal range evenly. Clipped values stop
  // just inside 0 and 1, which are themselves contour levels.
  if (mode !== 0) {
    const sorted = Float32Array.from(field).sort(), low = sorted[Math.floor(sorted.length * .02)], high = Math.max(low + 1e-4, sorted[Math.floor(sorted.length * .98)]);
    for (let i = 0; i < field.length; i++) field[i] = Math.max(.01, Math.min(.99, (field[i] - low) / (high - low)));
  }
  const result = new THREE.DataTexture(Uint16Array.from(field, THREE.DataUtils.toHalfFloat), w, h, THREE.RedFormat, THREE.HalfFloatType);
  Object.assign(result, { wrapS: THREE.RepeatWrapping, magFilter: THREE.LinearFilter, minFilter: THREE.LinearMipmapLinearFilter, generateMipmaps: true, needsUpdate: true });
  return result;
}

export function inkSphereMaterial(name, map, sunDir = new THREE.Vector3(1, 0, 0)) {
  const style = { levels:1, offset:0, night:1, graticule:0, ...SPHERE_STYLES[name] };
  const field = map && style.mode !== 3 ? inkField(map, style) : null;
  const material = shaderMaterial({
    uniforms:{ ...inkUniforms(), map:{value:field}, sunDir:{value:sunDir}, mode:{value:field?style.mode:3}, levels:{value:style.levels}, offset:{value:style.offset}, night:{value:style.night}, graticule:{value:style.graticule} },
    vertexShader:`varying vec2 vUv;varying vec3 vNormal;varying vec3 vWorld;void main(){vUv=uv;vNormal=normalize(mat3(modelMatrix)*normal);vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.);}`,
    fragmentShader:`${INK_GLSL}
      uniform sampler2D map;uniform vec3 sunDir;uniform float mode;uniform float levels;uniform float offset;uniform float night;uniform float graticule;
      varying vec2 vUv;varying vec3 vNormal;varying vec3 vWorld;
      void main(){
        vec3 n=normalize(vNormal),v=normalize(cameraPosition-vWorld);float px=pixelRatio;
        // The limb is where the surface turns edge-on; its derivative keeps the outline a steady pixel width.
        float facing=max(dot(n,v),0.);float a=1.-smoothstep(1.2*px-.5,1.2*px+.5,facing/max(fwidth(facing),1e-6));
        float detail=smoothstep(.02,.18,facing);
        if(mode<2.5){float f=texture2D(map,vUv).r;
          if(mode<.5)a=max(a,(1.-smoothstep(.5*px-.5,.5*px+.5,abs(f-.5)/max(fwidth(f),1e-6)))*.9*detail);
          else a=max(a,contour(f*levels+offset,.75*px)*(mode<1.5?.6:.7)*detail);}
        if(graticule>.5){float g=max(contour(vUv.y*6.,.6*px),contour(vUv.x*12.,.6*px));a=max(a,g*.12*detail);}
        // Engraved hatching marks the night side; its spacing is fixed on screen.
        float dark=smoothstep(.12,-.3,dot(n,normalize(sunDir)))*night;
        float along=(gl_FragCoord.x+gl_FragCoord.y)*.7071/(4.5*px);
        float hatch=1.-smoothstep(.35*px-.5,.35*px+.5,abs(fract(along)-.5)*4.5*px);
        a=max(a,hatch*dark*.3);
        gl_FragColor=vec4(mix(paper,ink,clamp(a,0.,1.)),1.);
      }`
  });
  pixelMaterials.add(material);
  return material;
}

// Saturn's main ring edges and the Cassini division, in planet radii.
export function inkRings() {
  const rings = new THREE.Group();
  for (const [radius, opacity] of [[1.24,.45],[1.53,.7],[1.95,.8],[2.03,.55],[2.27,.8]])
    rings.add(inkLine(Array.from({length:181},(_,i)=>[radius*Math.cos(i*Math.PI/90),0,radius*Math.sin(i*Math.PI/90)]), opacity, { width:.9 }));
  return rings;
}

// Screen-sized circle symbols at planet positions, like an orbital diagram.
// A body's own globe takes over as soon as it is larger than its symbol.
export function planetSymbols(specs) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(specs.length * 3), 3));
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(specs.map(s => s.size), 1));
  geometry.setAttribute('ringed', new THREE.Float32BufferAttribute(specs.map(s => s.ringed ? 1 : 0), 1));
  geometry.setAttribute('alpha', new THREE.Float32BufferAttribute(new Float32Array(specs.length), 1));
  const material = shaderMaterial({ transparent:true, depthTest:false, depthWrite:false, uniforms:inkUniforms(),
    vertexShader:`attribute float size;attribute float ringed;attribute float alpha;varying float vSize;varying float vRinged;varying float vAlpha;uniform float pixelRatio;
      void main(){vRinged=ringed;vAlpha=alpha;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);vSize=size*pixelRatio*(ringed>.5?2.4:1.);gl_PointSize=vAlpha>.001?vSize:0.;}`,
    fragmentShader:`${INK_GLSL}varying float vSize;varying float vRinged;varying float vAlpha;
      void main(){
        vec2 q=(gl_PointCoord-.5)*vSize;float r=length(q),w=pixelRatio,R=(vRinged>.5?vSize/2.4:vSize)*.5-.5;
        float disk=1.-smoothstep(R-.5,R+.5,r);float line=1.-smoothstep(w*.5-.5,w*.5+.5,abs(r-R+w*.5));
        if(vRinged>.5){
          float c=.956,s=-.292;vec2 e=vec2(c*q.x-s*q.y,s*q.x+c*q.y);float A=vSize*.47,B=A*.26;
          float k=length(e/vec2(A,B));float grad=length(e/vec2(A*A,B*B))/max(k,1e-4);
          float ring=1.-smoothstep(w*.5-.5,w*.5+.5,abs(k-1.)/max(grad,1e-4));
          if(e.y<0.&&disk>.5)ring=0.;line=max(line,ring);
        }
        float a=max(disk,line)*vAlpha;if(a<.004)discard;
        gl_FragColor=vec4(mix(paper,ink,line),a);
      }` });
  pixelMaterials.add(material);
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false; points.renderOrder = 5;
  return points;
}

// Catalog points as stipple: faint stars are dots, bright stars and map
// markers are open circles. `fill` gives the Sun's symbol a paper interior.
export const INK_POINT_FRAGMENT = `${INK_GLSL}varying vec3 vColor;varying float vAlpha;varying float vSize;uniform float opacity;uniform float fill;
  void main(){
    vec2 q=(gl_PointCoord-.5)*vSize;float r=length(q),R=vSize*.5-.25,w=.9*pixelRatio;
    float strength=max(vColor.r,max(vColor.g,vColor.b)),a,outline=1.;
    if(vSize>=3.4*pixelRatio){outline=1.-smoothstep(w*.5-.5,w*.5+.5,abs(r-R+w*.5));a=max(outline,(1.-smoothstep(R-.5,R+.5,r))*fill);}
    else a=(1.-smoothstep(R-.6,R+.4,r))*mix(.4,1.,smoothstep(1.3*pixelRatio,3.*pixelRatio,vSize));
    a*=opacity*vAlpha*strength;if(a<.004)discard;
    gl_FragColor=vec4(mix(paper,ink,outline),a);
  }`;
export function inkPointUniforms(fill = 0) { return { ...inkUniforms(), fill:{value:fill} }; }
export function trackPixelRatio(material) { pixelMaterials.add(material); return material; }

// Soft diagonal hatching inside projected galaxy contours.
export function inkHatchMaterial() {
  return trackPixelRatio(shaderMaterial({ transparent:true, depthWrite:false, side:THREE.DoubleSide, uniforms:{ ...inkUniforms(), opacity:{value:.5} },
    vertexShader:`varying vec2 point;void main(){point=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`${INK_GLSL}varying vec2 point;uniform float opacity;
      void main(){float along=(gl_FragCoord.x-gl_FragCoord.y)*.7071/(5.*pixelRatio);
        float hatch=1.-smoothstep(.4*pixelRatio-.5,.4*pixelRatio+.5,abs(fract(along)-.5)*5.*pixelRatio);
        float a=hatch*opacity*.32*(1.-smoothstep(.55,1.,length(point)));if(a<.004)discard;gl_FragColor=vec4(ink,a);}` }));
}

// Galaxy portraits as pen drawings: dotted rim, strand-drawn arms, bulge rings.
// Drawn in white; the sprite material tints them with the current ink.
export function inkPortraitCanvas(style, random) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d'), c = Math.cos(style.angle), s = Math.sin(style.angle);
  const gaussian = () => Math.sqrt(-2 * Math.log(Math.max(1e-8, random()))) * Math.cos(2 * Math.PI * random());
  const at = (x, y) => [256 + x * c - y * style.flatten * s, 256 + x * s + y * style.flatten * c];
  const loop = (radius, wobble = () => 1) => { ctx.beginPath(); for (let i = 0; i <= 160; i++) { const t = i / 160 * Math.PI * 2, r = radius * wobble(t); ctx.lineTo(...at(Math.cos(t) * r, Math.sin(t) * r)); } };
  ctx.strokeStyle = ctx.fillStyle = '#fff'; ctx.lineCap = ctx.lineJoin = 'round';
  ctx.setLineDash([1, 6]); ctx.lineWidth = 1.6; ctx.globalAlpha = .5; loop(224); ctx.stroke(); ctx.setLineDash([]);
  if (style.arms) {
    for (let arm = 0; arm < style.arms; arm++) for (const [strand, width, alpha] of [[0, 1.8, .85], [-.075, 1.1, .45], [.08, 1.1, .4]]) {
      let previous = null;
      for (let r = 24; r <= 212; r += 2) {
        const t = arm * Math.PI * 2 / style.arms + Math.log(r / 28) * 2.7 + strand, point = at(Math.cos(t) * r, Math.sin(t) * r);
        if (previous) { ctx.beginPath(); ctx.moveTo(...previous); ctx.lineTo(...point); ctx.lineWidth = width; ctx.globalAlpha = alpha * Math.pow(1 - r / 225, .6); ctx.stroke(); }
        previous = point;
      }
    }
  } else {
    const phases = Array.from({ length: 3 }, () => random() * Math.PI * 2);
    for (const [radius, alpha] of [[70, .75], [118, .5], [166, .32]]) {
      loop(radius, t => 1 + .07 * Math.sin(2 * t + phases[0]) + .05 * Math.sin(3 * t + phases[1]) + .03 * Math.sin(5 * t + phases[2]));
      ctx.lineWidth = 1.4; ctx.globalAlpha = alpha; ctx.stroke();
    }
  }
  for (let i = 0; i < (style.arms ? 1400 : 600); i++) {
    const r = Math.min(215, -Math.log(Math.max(1e-8, random() * random())) * 36);
    let t = random() * Math.PI * 2;
    if (style.arms && random() > .3) t = Math.floor(random() * style.arms) * Math.PI * 2 / style.arms + Math.log(Math.max(r, 12) / 28) * 2.7 + gaussian() * .1;
    const [x, y] = at(Math.cos(t) * r + gaussian() * 4, Math.sin(t) * r + gaussian() * 4);
    ctx.globalAlpha = (.25 + random() * .45) * Math.max(0, 1 - r / 225);
    ctx.beginPath(); ctx.arc(x, y, .9 + random() * .6, 0, Math.PI * 2); ctx.fill();
  }
  const bulge = style.warm ? 44 : 28;
  ctx.globalAlpha = .9; ctx.lineWidth = 1.6; loop(bulge); ctx.stroke();
  ctx.globalAlpha = .6; ctx.lineWidth = 1.2; loop(bulge * .42); ctx.stroke();
  return canvas;
}
