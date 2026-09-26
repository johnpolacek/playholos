import { Vector3 } from 'three';

// ICRS / mean equatorial J2000 -> IAU Galactic axes, in the atlas's
// right-handed order (Galactic X, Galactic Z, -Galactic Y).
export function equatorialToGalactic({x,y,z}) {
  return new Vector3(
    -.0548755604*x-.8734370902*y-.4838350155*z,
    -.8676661490*x-.1980763734*y+.4559837762*z,
    -(.4941094279*x-.4448296300*y+.7469822445*z)
  );
}

export function skyBasis(raDeg,decDeg) {
  const ra=raDeg*Math.PI/180,dec=decDeg*Math.PI/180;
  return {
    radial:equatorialToGalactic(new Vector3(Math.cos(dec)*Math.cos(ra),Math.cos(dec)*Math.sin(ra),Math.sin(dec))).normalize(),
    north:equatorialToGalactic(new Vector3(-Math.sin(dec)*Math.cos(ra),-Math.sin(dec)*Math.sin(ra),Math.cos(dec))).normalize(),
    east:equatorialToGalactic(new Vector3(-Math.sin(ra),Math.cos(ra),0)).normalize()
  };
}

// The outline a sphere presents to a perspective camera: the circle where
// sight lines graze its surface. Null while the camera is inside the sphere.
export function sphereSilhouette(radius,camera,segments=256) {
  const distance=camera.length();
  if(distance<=radius*1.0001)return null;
  const axis=camera.clone().divideScalar(distance);
  const center=axis.clone().multiplyScalar(radius*radius/distance),ring=radius*Math.sqrt(1-radius*radius/(distance*distance));
  const u=new Vector3(0,1,0).cross(axis);if(u.lengthSq()<1e-8)u.set(1,0,0).cross(axis);u.normalize();
  const v=axis.clone().cross(u);
  return Array.from({length:segments+1},(_,i)=>{const t=i/segments*Math.PI*2;return center.clone().addScaledVector(u,ring*Math.cos(t)).addScaledVector(v,ring*Math.sin(t));});
}
