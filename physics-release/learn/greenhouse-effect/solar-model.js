// S is the incident intensity on a directly facing detector outside the atmosphere.
export function detectorBudget(area,seconds,intensity=1360){
 return {intensity,area,seconds,power:intensity*area,energy:intensity*area*seconds,side:Math.sqrt(area)};
}
export function facingArea(area,angle){return area*Math.max(0,Math.cos(angle*Math.PI/180));}
