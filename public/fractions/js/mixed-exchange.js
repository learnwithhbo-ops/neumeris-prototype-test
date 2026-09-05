(function(){
 'use strict';
 const gcd=(a,b)=>b?gcd(b,a%b):a;
 function rewriteEvidence(q,response){
  const t=q.exchange_target,p=window.RevilyMixedConversion.mixedParts(response),expectedWhole=BigInt(t.whole-1),expectedNumerator=BigInt(t.d+t.n),denominator=BigInt(t.d);
  const wholeChanged=p?p.whole===expectedWhole:null,partsAdded=p?p.n===expectedNumerator:null,denominatorKept=p?p.d===denominator:null;
  let classification='check_rewrite';
  if(!p)classification='complete_both_parts';
  else if(!denominatorKept)classification='changed_denominator';
  else if(wholeChanged&&partsAdded)classification='correct';
  else if(wholeChanged&&p.n===BigInt(t.n))classification='lost_whole';
  else if(p.whole===BigInt(t.whole)&&partsAdded)classification='extra_whole';
  else if(p.whole===BigInt(t.whole)&&p.n===BigInt(t.n))classification='not_exchanged';
  else if(wholeChanged&&p.n===denominator)classification='original_fraction_lost';
  else if(wholeChanged)classification='fractional_parts';
  else if(partsAdded)classification='whole_part';
  return{phase:'rewrite',correct:classification==='correct',wholeChanged,partsAdded,denominatorKept,classification};
 }
 function resultEvidence(q,response){
  const v=window.RevilyMixedSubtraction.values(q.visual.model),V=window.RevilyValidators,p=window.RevilyMixedConversion.mixedParts(response),correct=V.validate(q,response),valueCorrect=V.sameRational(p||response,q.answer.value),proper=Boolean(p&&p.whole>0n&&p.n>0n&&p.n<p.d),simplest=proper?gcd(p.n,p.d)===1n:null;
  const wholeCorrect=p?p.whole===BigInt(v.whole):null,fractionCorrect=p?Boolean(p.d>0n&&p.n*BigInt(v.common)===BigInt(v.raw)*p.d):null;
  let classification='check_value';
  if(correct)classification='correct';
  else if(valueCorrect)classification=proper&&!simplest?'simplify_only':'mixed_form_required';
  else if(p&&fractionCorrect&&p.whole===BigInt(v.whole+1))classification='one_whole_too_large';
  else if(p&&wholeCorrect)classification='fraction_only';
  else if(p&&fractionCorrect)classification='whole_only';
  else if(p)classification='both_parts';
  return{phase:'result',correct,valueCorrect,properMixed:proper,simplestFraction:simplest,wholeCorrect,fractionCorrect,classification};
 }
 function working(m,v,step,strip,unit){
  const math=window.RevilyVisuals.mathMarkup;let html='';
  if(step>=1)html+=`<section data-me-compare=""><p>${math(`${m.left.n}/${m.left.d} = ${v.first}/${v.common}`)}; ${math(`${m.right.n}/${m.right.d} = ${v.second}/${v.common}`)}</p><div class="os-ma-fraction-row">${strip(v.first,v.common,'compare-first')}${strip(v.second,v.common,'compare-second',0,'os-mixed-second')}</div><p>${math(`${v.first}/${v.common} < ${v.second}/${v.common}`)}. The first fractional part is too small to remove the second directly.</p></section>`;
  if(step>=2)html+=`<section data-me-exchange=""><p>Exchange exactly one existing whole; do not add or lose value.</p><p>${math(`1 = ${v.common}/${v.common}; ${m.left.whole} ${v.first}/${v.common} = ${v.exchangeWhole} + ${v.common}/${v.common} + ${v.first}/${v.common} = ${v.exchangeWhole} ${v.available}/${v.common}`)}</p><div class="os-ma-units">${Array.from({length:v.exchangeWhole},()=>`<section data-me-kept-whole=""><small>1 intact ${unit}</small>${strip(1,1,'intact-whole')}</section>`).join('')}<section data-me-exchanged-whole=""><small>${math(`${v.common}/${v.common} from 1 ${unit}`)}</small>${strip(v.common,v.common,'exchanged-whole',0,'os-mixed-second')}</section><section data-me-original-fraction=""><small>${math(`Original ${v.first}/${v.common}`)}</small>${strip(v.first,v.common,'original-fraction')}</section></div><p>The original fractional part is kept alongside the exchanged parts.</p></section>`;
  if(step>=3)html+=`<section data-me-whole-removal=""><p>${math(`${v.exchangeWhole} − ${m.right.whole} = ${v.whole}`)} complete ${unit}s remain.</p><div class="os-ma-units">${Array.from({length:v.exchangeWhole},(_,i)=>`<section data-me-whole="${i<m.right.whole?'removed':'remaining'}"><small>${i<m.right.whole?'Remove':'Keep'} 1 ${unit}</small>${strip(1,1,'exchange-whole-removal',i<m.right.whole?1:0)}</section>`).join('')}</div></section>`;
  if(step>=4){
   html+=`<section data-me-fraction-removal=""><p>Remove matching fractional parts in the original subtraction order.</p><div class="os-ma-units"><section><small>Exchanged parts</small>${strip(v.common,v.common,'exchanged-removal',v.second,'os-mixed-second')}</section><section><small>Original extra parts</small>${strip(v.first,v.common,'original-kept')}</section></div><p>${math(`${v.available}/${v.common} − ${v.second}/${v.common} = ${v.raw}/${v.common}${v.factor>1?' = '+v.n+'/'+v.d:''}`)}</p></section>`;
  }
  if(step>=5)html+=`<section data-me-final=""><p>${math(`${v.whole} + ${v.n}/${v.d} = ${v.whole} ${v.n}/${v.d}`)}</p><div class="os-ma-units">${Array.from({length:v.whole},()=>`<section data-me-result-whole=""><small>1 remaining ${unit}</small>${strip(1,1,'exchange-result-whole',0,'os-selected')}</section>`).join('')}<section><small>${math(`${v.n}/${v.d} ${unit}`)}</small>${strip(v.n,v.d,'exchange-result-fraction',0,'os-selected')}</section></div><p>The exchanged whole is not counted again as a complete whole.</p></section>`;
  else html+='<p>Remaining amount: ?</p>';
  return html;
 }
 function describe(v,step){return(step>=1?` Matching fractional parts: ${v.first} over ${v.common} is less than ${v.second} over ${v.common}.`:'')+(step>=2?` Exactly one existing whole becomes ${v.common} matching fractional parts. ${v.exchangeWhole} intact wholes and ${v.available} fractional parts now represent the same original amount.`:'')+(step>=3?` Remove the second whole-number part; ${v.whole} complete wholes remain.`:'')+(step>=4?` Remove ${v.second} fractional parts from ${v.available}; ${v.raw} remain.`:'')+(step>=5?` Remaining amount ${v.whole} and ${v.n} over ${v.d}; the exchanged whole is not counted twice.`:' The remaining amount is not shown.');}
 window.RevilyMixedExchange={rewriteEvidence,resultEvidence,working,describe};
})();
