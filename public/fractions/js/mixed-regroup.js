(function(){
 'use strict';
 const gcd=(a,b)=>b?gcd(b,a%b):a;
 function evidence(q,response){
  if(q.evidence_profile!=='mixed_regroup_stages')return null;
  const V=window.RevilyValidators,t=q.regrouping_target,p=window.RevilyMixedConversion.mixedParts(response),correct=V.validate(q,response),valueCorrect=V.sameRational(response,q.answer.value),proper=Boolean(p&&p.whole>0n&&p.n>0n&&p.n<p.d),simplest=proper?gcd(p.n,p.d)===1n:null;
  const fractionMatches=Boolean(p&&p.d>0n&&p.n*BigInt(t.d)===BigInt(t.n)*p.d);
  let classification='check_value';
  if(correct)classification='correct';
  else if(valueCorrect)classification=p&&!proper?'unfinished_mixed':p&&!simplest?'simplify_only':'mixed_form_required';
  else if(p&&fractionMatches&&p.whole===BigInt(t.originalWhole))classification='lost_whole';
  else if(p&&fractionMatches&&p.whole===BigInt(t.finalWhole+1))classification='double_whole';
  else if(p&&p.whole===BigInt(t.finalWhole)&&p.n===BigInt(t.remainder)&&p.d===BigInt(t.rawNumerator))classification='changed_denominator';
  else if(p&&p.whole===BigInt(t.finalWhole))classification='fractional_part';
  else if(fractionMatches)classification='whole_part';
  return{correct,valueCorrect,properMixed:proper,simplestFraction:simplest,wholeMatchesFinal:p?p.whole===BigInt(t.finalWhole):null,fractionMatchesRemainder:p?fractionMatches:null,classification};
 }
 function working(m,v,step,strip,unit){
  const math=window.RevilyVisuals.mathMarkup;let html='';
  if(step>=3)html+=`<section data-mr-sum=""><p>${math(`${v.first}/${v.common} + ${v.second}/${v.common} = ${v.raw}/${v.common}`)}</p><div class="os-mc-parts" data-mr-ungrouped="">${Array.from({length:v.raw},()=>`<span data-mr-part="">${math(`1/${v.common}`)}</span>`).join('')}</div></section>`;
  if(step>=4)html+=`<section data-mr-regroup=""><p>${math(`${v.raw}/${v.common} = ${v.common}/${v.common}${v.remainder?' + '+v.remainder+'/'+v.common:''} = 1${v.remainder?' '+v.remainder+'/'+v.common:''}${v.factor>1&&v.remainder?' = 1 '+v.n+'/'+v.d:''}`)}</p><div class="os-ma-units"><section data-mr-extra-whole=""><small>1 new ${unit}</small>${strip(v.common,v.common,'regrouped-whole','os-mixed-second')}</section>${v.remainder?`<section data-mr-remainder=""><small>${math(`${v.remainder}/${v.common} ${unit}`)}</small>${strip(v.remainder,v.common,'regrouped-remainder','os-selected')}</section>`:''}</div><p>One complete group forms exactly one additional whole.</p></section>`;
  if(step>=5)html+=`<section data-ma-final="" data-mr-final=""><p>${math(`${v.whole} + 1${v.n?' '+v.n+'/'+v.d:''} = ${v.finalWhole}${v.n?' '+v.n+'/'+v.d:''}`)}</p><div class="os-ma-units">${Array.from({length:v.whole},()=>`<section data-mr-original-whole=""><small>1 original ${unit}</small>${strip(1,1,'original-whole','os-water')}</section>`).join('')}<section data-mr-added-whole=""><small>1 new ${unit}</small>${strip(1,1,'added-whole','os-mixed-second')}</section>${v.n?`<section><small>${math(`${v.n}/${v.d} ${unit}`)}</small>${strip(v.n,v.d,'result-fraction','os-selected')}</section>`:''}</div><p>The additional whole has been counted once.</p></section>`;
  else html+='<p>Final total: ?</p>';
  return html;
 }
 function describe(v,step){return(step>=1?` Original whole-number sum ${v.whole}.`:'')+(step>=2?` Matching fractional parts ${v.first} over ${v.common} and ${v.second} over ${v.common}.`:'')+(step>=3?` Fractional total ${v.raw} over ${v.common}, shown as ungrouped equal parts.`:'')+(step>=4?` Regroup ${v.common} parts into exactly one additional whole; ${v.remainder} parts remain.`:'')+(step>=5?` Add that whole once: final total ${v.finalWhole}${v.n?' and '+v.n+' over '+v.d:''}.`:' The final total is not shown.');}
 window.RevilyMixedRegroup={working,describe,evidence};
})();
