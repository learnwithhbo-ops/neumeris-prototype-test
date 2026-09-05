(function(){
 'use strict';
 const esc=value=>window.RevilyVisuals.escapeHtml(value);
 function mixedParts(response){
  const match=typeof response==='string'?response.trim().match(/^(\d+)\s*(?:\+\s*|\s+)(\d+)\s*\/\s*(\d+)$/):null;
  const value=response&&typeof response==='object'&&'whole' in response?response:match?{whole:match[1],n:match[2],d:match[3]}:null;
  return value&&['whole','n','d'].every(k=>/^\d+$/.test(String(value[k]??'')))?{whole:BigInt(value.whole),n:BigInt(value.n),d:BigInt(value.d)}:null;
 }
 function classify(q,response){
  const t=q.conversion_target;if(!t)return 'incorrect_arithmetic';
  if(q.response.type==='fraction'){
   const p=window.RevilyValidators.exactFractionParts(response);if(!p)return 'wrong_form';
   const n=BigInt(p.n),d=BigInt(p.d),total=BigInt(t.whole*t.d+t.n);
   if(d!==BigInt(t.d))return 'changed_denominator';
   if(n===total)return 'correct';
   if(n===BigInt(t.whole+t.n))return 'omitted_whole';
   if(n===BigInt(t.whole*t.d))return 'omitted_fraction';
   return 'incorrect_arithmetic';
  }
  const p=mixedParts(response);if(!p)return 'wrong_form';
  if(p.d!==BigInt(t.d))return 'changed_denominator';
  if(p.whole<1n||p.n<1n||p.n>=p.d)return 'wrong_form';
  if(p.whole===BigInt(t.whole)&&p.n===BigInt(t.n))return 'correct';
  if(p.whole===BigInt(t.n)&&p.n===BigInt(t.whole))return 'swapped_quotient_remainder';
  return 'incorrect_arithmetic';
 }
 function values(m){
  const forward=m.direction==='mixed_to_improper',d=m.d,w=forward?m.whole:Math.floor(m.numerator/d),n=forward?m.n:m.numerator%d,total=w*d+n;
  if(!['mixed_to_improper','improper_to_mixed'].includes(m.direction)||![d,w,n,total].every(Number.isInteger)||d<2||d>12||w<1||w>9||n<1||n>=d)throw new Error('Mixed conversion requires positive mixed quantities with a proper nonzero fractional part and denominator 2–12.');
  return{forward,d,w,n,total};
 }
 const stage=(m,reveal,shown)=>m.solved?3:reveal?shown||1:0;
 const gcd=(a,b)=>b?gcd(b,a%b):a;
 function render(m,reveal,shown){
  const{forward,d,w,n,total}=values(m),step=stage(m,reveal,shown),math=window.RevilyVisuals.mathMarkup;
  const parts=(count,tag)=>`<div class="os-mc-parts" data-mc-parts="${tag}">${Array.from({length:count},()=>`<span data-mc-piece="${tag}">${math(`1/${d}`)}</span>`).join('')}</div>`;
  const bar=(filled,tag)=>`<svg viewBox="0 0 320 36" aria-hidden="true">${Array.from({length:d},(_,i)=>`<rect x="${i*320/d}" y="1" width="${320/d}" height="32" class="${i<filled?'os-water':'os-empty'}" data-mc-bar-part="${tag}" data-filled="${i<filled}"/>`).join('')}</svg>`;
  const wholes=tag=>`<div class="os-mc-wholes">${Array.from({length:w},()=>`<section><p>${m.object==='rope'?'1 metre':'1 whole'}</p>${bar(d,tag)}</section>`).join('')}<section><p>${math(`${n}/${d}${m.object==='rope'?' metre':''}`)}</p>${bar(n,tag)}</section></div>`;
  let html=`<div class="os-both-add os-mixed-conversion" data-mc-direction="${m.direction}" data-mc-context="${m.object}">`;
  if(m.method_choice)return html+`<h2>${math(`${total}/${d}`)}</h2><p>${reveal?'Use division to find complete groups and a remainder.':'First calculation: choose below'}</p></div>`;
  if(m.object==='rope')html+=`<h2>A length of rope</h2><p>${math(`Length: ${w} ${n}/${d} metres`)}</p><p>Each full scale shows 1 metre of the same rope.</p>`+wholes('given');
  else if(m.object==='water')html+=`<h2>Water in the container</h2><p>${math(`Amount: ${w} ${n}/${d} litres`)}</p><p>Each thickly marked band represents 1 litre.</p><svg viewBox="0 0 180 220" class="os-both-vessel" aria-hidden="true">${Array.from({length:(w+1)*d},(_,i)=>`<rect x="31" y="${200-(i+1)*170/((w+1)*d)}" width="118" height="${170/((w+1)*d)}" class="${i<total?'os-water':'os-empty'}" data-mc-water-part="" data-filled="${i<total}"/>`).join('')}${Array.from({length:w},(_,i)=>`<path d="M30 ${200-(i+1)*170/(w+1)} H150" class="os-mc-band"/>`).join('')}<path d="M30 25 V200 H150 V25" class="os-capacity-outline"/></svg>`;
  else if(m.object==='flour')html+=`<h2>The baker’s flour mass</h2><svg viewBox="0 0 180 100" class="os-both-vessel" aria-hidden="true" data-mc-flour-bowl=""><path d="M20 60 Q90 105 160 60 L145 85 H35 Z" fill="#c0d7d2" stroke="#5c7972" stroke-width="2"/><path d="M30 60 Q85 -8 150 60 Z" fill="#f1e4c8" stroke="#987f57" stroke-width="2"/></svg><p>${math(`Flour used: ${total}/${d} kg`)}</p><p>Each tile measures one quarter kilogram of flour.</p>`+parts(total,'ungrouped');
  else if(forward)html+=`<h2>${math(`${w} ${n}/${d}`)}</h2><p>The whole and fractional parts use the same-sized reference whole.</p>`+wholes('given');
  else html+=`<h2>${math(`${total}/${d}`)}</h2><p>Equal-sized fractional parts, not yet grouped into wholes.</p>`+parts(total,'ungrouped');
  if(forward){
   if(step>=1)html+=`<p data-mc-first="">${math(`${w} × ${d} = ${w*d}`)} parts in the complete wholes.</p>`;
   if(step>=2)html+=`<section data-mc-second=""><p>${math(`${w*d} + ${n} = ${total}`)} parts altogether.</p>${parts(total,'total')}</section>`;
   if(step>=3)html+=`<p data-mc-final="">${math(`${w} ${n}/${d} = ${total}/${d}`)}. The denominator stays ${d}.</p>`;
  }else{
   if(step>=1)html+=`<p data-mc-first="">${math(`${total} ÷ ${d} = ${w}`)} remainder ${n}.</p>`;
   if(step>=2)html+=`<section data-mc-second=""><div class="os-mc-grouped">${Array.from({length:w},()=>`<section data-mc-whole=""><p>1 whole</p>${parts(d,'grouped')}</section>`).join('')}<section data-mc-remainder=""><p>Leftover parts</p>${parts(n,'remainder')}</section></div></section>`;
   if(step>=3)html+=`<p data-mc-final="">${math(`${total}/${d} = ${w} ${n}/${d}`)}${m.simplify_result?` = ${math(`${w} ${n/gcd(n,d)}/${d/gcd(n,d)}`)}. The fractional part is now simplest.`:`. The denominator stays ${d}.`}</p>`;
  }
  if(step<3)html+=`<p>${forward?'Improper fraction':'Mixed number'}: ?</p>`;
  return html+'</div>';
 }
 function accessible(m,reveal,shown){
  const{forward,d,w,n,total}=values(m),step=stage(m,reveal,shown),unit=m.object==='rope'?'metres':m.object==='water'?'litres':m.object==='flour'?'kilograms':'reference wholes';
  const given=forward?`${w} and ${n} over ${d} ${unit}.`:`${total} over ${d} ${unit}, shown as equal fractional parts.`;
  if(m.method_choice)return `${total} over ${d}.`+(reveal?' Use division to find complete groups and the remainder.':' The first calculation is not shown.');
  return given+(step>=1?(forward?` The complete wholes contain ${w*d} parts.`:` Division gives quotient ${w}, remainder ${n}.`):'')+(step>=2?(forward?` Include ${n} extra parts for ${total} parts altogether.`:` Make ${w} complete groups of ${d}, with ${n} parts left over.`):'')+(step>=3?(forward?` Improper fraction ${total} over ${d}.`:` Mixed number ${w} and ${n} over ${d}.`)+(m.simplify_result?` Simplest mixed number ${w} and ${n/gcd(n,d)} over ${d/gcd(n,d)}.`:''):' The requested conversion is not shown.')+(m.simplify_result?' Equivalent regrouping and simplification keep the same value.':' The part size stays fixed.');
 }
 function markup(q,saved,locked){
  const v=saved&&typeof saved==='object'?saved:{whole:'',n:'',d:''},disabled=locked?' disabled':'';
  return `<fieldset class="mixed-answer os-conversion-mixed"><legend>Your mixed number</legend><label><span>Wholes</span><input id="mixed-whole" aria-label="Whole number" inputmode="numeric" autocomplete="off" value="${esc(v.whole??'')}"${disabled}/></label><div class="fraction-input"><input id="mixed-n" aria-label="Fractional numerator" inputmode="numeric" autocomplete="off" value="${esc(v.n??'')}"${disabled}/><i aria-hidden="true"></i><input id="mixed-d" aria-label="Denominator" inputmode="numeric" autocomplete="off" value="${esc(v.d??'')}"${disabled}/></div>${q.response.suffix?`<b>${esc(q.response.suffix)}</b>`:''}</fieldset>`;
 }
 window.RevilyMixedConversion={classify,mixedParts,values,render,accessible,markup};
})();
