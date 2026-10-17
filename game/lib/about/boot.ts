// Runs before an about page paints, on a full load only: marks the page so CSS hides the items its motion will bring
// in, unless motion is reduced. If the motion hasn't taken over in 1.5 seconds, it shows them as they are. The marker
// is never in the server's HTML, so without JavaScript the page reads as it is.
export const BOOT = `(function(){try{if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;var d=document.documentElement;d.dataset.aboutBoot="pending";setTimeout(function(){if(d.dataset.aboutBoot==="pending")d.dataset.aboutBoot="recovered"},1500)}catch(e){}})()`;
