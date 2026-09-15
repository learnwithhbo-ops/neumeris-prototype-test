const clamp=n=>Math.max(0,Math.min(1,n));
const ease=n=>{const x=clamp(n);return x*x*(3-2*x);};
export const neutralDepth={scale:1,y:0,opacity:1,depth:0,phase:0,visible:true};

// Native scroll intervals move card surfaces in Y and depth only. Faces stay parallel.
// Tall cards receive enough untransformed scrolling to read every line and disclosure.
export function wheelMetrics(height,viewport,readingLine=110){
 const space=Math.max(180,viewport-readingLine-28);
 const travel=Math.max(380,Math.min(820,space*.98));
 return {space,travel,reading:Math.max(0,height-space),height:Math.max(0,height-space)+travel};
}
export function questionDepth(top,height,viewport,readingLine=110){
 if(![top,height,viewport,readingLine].every(Number.isFinite)||height<=0||viewport<=0)return {...neutralDepth};
 const {space,travel,reading}=wheelMetrics(height,viewport,readingLine),offset=readingLine-top;
 if(offset>=0&&offset<=reading)return {...neutralDepth};
 const incoming=offset<0,phase=incoming?offset/travel:(offset-reading)/travel;
 const distance=clamp(Math.abs(phase)),depth=ease(distance),arc=Math.sin(distance*Math.PI/2);
 const shift=incoming?space*.78*arc:-space*.19*arc;
 return {scale:1-depth*(incoming?.32:.34),y:offset-(incoming?0:reading)+shift,opacity:1-depth*(incoming?.94:.97),depth,phase,visible:Math.abs(phase)<1.12};
}
