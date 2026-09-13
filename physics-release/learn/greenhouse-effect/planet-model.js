// Pure scene/physics functions: seeking to a time always gives the same scene.
export function illumination(solar,angle=0){
 const cosine=Math.max(0,Math.cos(angle*Math.PI/180));
 return {solar,mean:solar/4,local:solar*cosine,footprint:cosine>1e-6?1/cosine:null};
}
export function cueAt(cues,time){
 return cues.reduce((chosen,cue)=>cue.at<=time?cue:chosen,cues[0]);
}
export function sceneAt(cues,time,reduced=false){
 const cue=cueAt(cues,time),p=Math.min(1,Math.max(0,(time-cue.at)/(cue.transition??1)));
 const ease=reduced?1:p*p*(3-2*p);
 const angle=(cue.angleFrom??cue.angle??0)+((cue.angle??0)-(cue.angleFrom??cue.angle??0))*ease;
 const radius=(cue.radiusFrom??cue.radius??1)+((cue.radius??1)-(cue.radiusFrom??cue.radius??1))*ease;
 const area=(cue.areaFrom??cue.area??1)+((cue.area??1)-(cue.areaFrom??cue.area??1))*ease;
 const exposure=(cue.exposureFrom??cue.exposure??0)+((cue.exposure??0)-(cue.exposureFrom??cue.exposure??0))*ease;
 const values={};
 for(const [name,fallback] of [['albedo',.3],['incident',340],['ice',1],['cloud',0]]){
  const start=cue[name+'From']??cue[name]??fallback;
  values[name]=start+((cue[name]??fallback)-start)*ease;
 }
 return {...cue,angle,radius,area,exposure,...values,progress:ease,time:reduced?0:time,reduced};
}
export function planetBudget(solar,radius){return {areaScale:radius**2,powerScale:solar/1360*radius**2,mean:solar/4};}
export function beamAppearance(solar){const strength=Math.max(0,Math.min(1,solar/2000));return {strength,fill:strength*.34,glow:strength*.85,stroke:strength?1.5+strength*3:0};}
export function rayPackets(intensity,time,start,end,y){
 if(intensity<=0)return [];
 // Each marker represents equal energy. Intensity changes spacing, never speed.
 const spacing=160*1360/intensity,speed=150,phase=((time*speed)%spacing+spacing)%spacing;
 const points=[];
 for(let x=start+phase;x<end;x+=spacing)points.push({x,y});
 return points;
}
