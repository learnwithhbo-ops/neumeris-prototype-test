export function parseNumber(value){
  let s=String(value).trim().replaceAll('−','-');
  if(s.includes(',')&&!/^[+-]?\d{1,3}(?:,\d{3})+(?:\.\d*)?(?:e[+-]?\d+)?$/i.test(s))return null;
  const digits='⁰¹²³⁴⁵⁶⁷⁸⁹';
  s=s.replace(/10([⁻⁺⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g,(_,exp)=>'10^'+[...exp].map(c=>c==='⁻'?'-':c==='⁺'?'+':digits.indexOf(c)).join('')).replaceAll(',','');
  if(!s)return null;
  const m=s.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*(?:[×x*]\s*10\s*\^?\s*([+-]?\d+))?$/i);
  const normal=m?m[1]+(m[2]!==undefined?'e'+m[2]:''):s;
  if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(normal))return null;
  const n=Number(normal);return Number.isFinite(n)?n:null;
}
export function checkAnswer(activity,value,unit){
  if(activity.type==='choice')return value==null||value===''?{valid:false,message:'Choose an answer first.'}:{valid:true,correct:String(value)===String(activity.correct),message:activity.explanation};
  if(activity.type!=='numeric')return{valid:false,message:'Use the marking checklist for a written explanation.'};
  const n=parseNumber(value);if(n===null)return{valid:false,message:'Enter a number, for example 1360, 1.36e3 or 1.36 × 10^3.'};
  if(activity.unit&&unit!==activity.unit)return{valid:true,correct:false,message:'Check the units: '+activity.unit_explanation};
  const correct=Math.abs(n-activity.answer)<=activity.tolerance+Number.EPSILON*Math.max(1,Math.abs(activity.answer));
  const misconception=(activity.misconceptions??[]).find(x=>Math.abs(n-x.value)<=x.tolerance);
  return{valid:true,correct,message:correct?activity.explanation:misconception?.feedback??'Recheck which quantities are given, the relationship you need, and your calculation. '+(activity.retry_hint??'')};
}
