export function radiationBudget(incident,albedo,transmission=0){
 if(![incident,albedo,transmission].every(Number.isFinite)||incident<0||albedo<0||albedo>1||transmission<0||albedo+transmission>1)throw new RangeError('Invalid radiation account');
 return {incident,albedo,transmission,reflected:incident*albedo,absorbed:incident*(1-albedo-transmission),transmitted:incident*transmission};
}
export function albedoFromFlows(reflected,absorbed,transmitted=0){
 if(![reflected,absorbed,transmitted].every(n=>Number.isFinite(n)&&n>=0))throw new RangeError('Invalid flow');
 const incident=reflected+absorbed+transmitted;
 return {incident,albedo:incident?reflected/incident:null};
}
// Illustrative two-surface comparison, equal incident intensity on each patch.
// These chosen coefficients are assumptions, not universal ice/water constants.
export const ICE_ALBEDO=.60,WATER_ALBEDO=.10;
export function iceBudget(ice,incident=340){
 if(!Number.isFinite(ice)||ice<0||ice>1)throw new RangeError('Invalid ice fraction');
 return {...radiationBudget(incident,ice*ICE_ALBEDO+(1-ice)*WATER_ALBEDO),ice};
}
export function compareAlbedos(before,after,incident=340){
 const a=radiationBudget(incident,before),b=radiationBudget(incident,after),difference=b.absorbed-a.absorbed;
 return {before:a,after:b,difference,ratio:a.absorbed?b.absorbed/a.absorbed:null,percent:a.absorbed?100*difference/a.absorbed:null};
}
export function weightedAlbedo(patches){
 const total=patches.reduce((s,p)=>s+p.incident*p.area,0);
 return total?patches.reduce((s,p)=>s+p.incident*p.area*p.albedo,0)/total:null;
}
