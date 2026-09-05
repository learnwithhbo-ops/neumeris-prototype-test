(function(){
 'use strict';
 const gcd=(a,b)=>b?gcd(b,a%b):a;
 function quantities(m){
  if(![m.a,m.b,m.c,m.d].every(Number.isInteger)||m.a<1||m.a>=m.b||m.c<1||m.c>=m.d||!['add','subtract'].includes(m.operation))throw new Error('Simplify-operation model requires positive proper operands and an explicit operation.');
  const common=m.b*m.d/gcd(m.b,m.d),first=m.a*common/m.b,second=m.c*common/m.d,raw=m.operation==='add'?first+second:first-second;
  if(raw<=0||raw>=common)throw new Error('Simplify-operation model requires a positive proper result.');
  const factor=gcd(raw,common);return{common,first,second,raw,factor,n:raw/factor,d:common/factor,sign:m.operation==='add'?'+':'−'};
 }
 const count=(m,reveal,shown)=>m.solved?4:reveal?shown||1:0;
 function strip(n,d,tag,group=1,color='os-water'){
  return `<svg viewBox="0 0 500 46" aria-hidden="true" data-so-row="${tag}">${Array.from({length:d},(_,i)=>`<rect x="${i*500/d}" y="2" width="${500/d}" height="40" class="${i<n?color:'os-empty'}" data-so-part="${tag}" data-filled="${i<n}"/>`).join('')}${group>1?Array.from({length:d/group},(_,i)=>`<rect x="${i*group*500/d+1}" y="1" width="${group*500/d-2}" height="42" class="os-so-group" data-so-group="${tag}"/>`).join(''):''}</svg>`;
 }
 function render(m,reveal,shown){
  const v=quantities(m),step=count(m,reveal,shown),math=window.RevilyVisuals.mathMarkup,frac=window.RevilyVisuals.fractionMarkup;
  const row=(label,n,d,tag,color)=>`<section class="os-both-row"><p>${math(`${label}: ${n}/${d}`)}</p>${strip(n,d,tag,1,color)}</section>`;
  let html=`<div class="os-both-add os-simplify-operation" data-so-context="${m.object}">`;
  if(m.object==='bars')html+=`<h2>${math(`${m.a}/${m.b} ${v.sign} ${m.c}/${m.d}`)}</h2><p>One unchanged reference whole</p>`+row('First fraction',m.a,m.b,'first','os-water')+row('Second fraction',m.c,m.d,'second','os-mixed-second');
  else if(m.object==='flour')html+='<h2>Flour for cake and bread</h2><p>Each mass scale represents 1 kilogram.</p><div class="os-both-context">'+`<section><svg viewBox="0 0 160 105" class="os-so-icon" aria-hidden="true"><path d="M20 75 Q80 102 140 75 L130 90 H30 Z" fill="#a6cfc9" stroke="#557b75"/><path d="M30 70 Q80 8 130 70 Z" fill="#efdebb" stroke="#947b56"/></svg>`+row('Cake flour (kg)',m.a,m.b,'cake','os-water')+'</section><section><svg viewBox="0 0 160 105" class="os-so-icon" aria-hidden="true"><path d="M20 75 Q80 102 140 75 L130 90 H30 Z" fill="#d9c9e3" stroke="#766381"/><path d="M30 70 Q80 8 130 70 Z" fill="#efdebb" stroke="#947b56"/></svg>'+row('Bread flour (kg)',m.c,m.d,'bread','os-mixed-second')+'</section></div>';
  else if(m.object==='walk')html+='<h2>Leila’s morning and afternoon walk</h2><p>Each distance scale represents 1 kilometre.</p>'+row('Morning (km)',m.a,m.b,'morning','os-road-morning')+row('Afternoon (km)',m.c,m.d,'afternoon','os-road-afternoon');
  else if(m.object==='tank')html+='<h2>Water left in the tank</h2><p>Reference whole: full tank capacity.</p>'+`<svg viewBox="0 0 180 150" class="os-both-vessel" aria-hidden="true" data-so-tank="">${Array.from({length:m.b},(_,i)=>`<rect x="31" y="${130-(i+1)*100/m.b}" width="118" height="${100/m.b}" class="${i<m.a?'os-water':'os-empty'}"/>`).join('')}<path d="M30 25 V130 H150 V25" class="os-capacity-outline"/></svg><p>${math(`Initially full: ${m.a}/${m.b}`)}</p>`+row('Capacity removed',m.c,m.d,'removed','os-mixed-second');
  else throw new Error('Unknown simplify-operation context.');
  if(step>=1)html+=`<div data-so-conversions=""><p>${math(`${m.a}/${m.b} = ${v.first}/${v.common}`)}; ${math(`${m.c}/${m.d} = ${v.second}/${v.common}`)}</p></div>`;
  if(step>=2)html+=`<section data-so-operation=""><p>${math(`${v.first}/${v.common} ${v.sign} ${v.second}/${v.common} = ${v.raw}/${v.common}`)}</p>${strip(v.raw,v.common,'raw',step>=3?v.factor:1,'os-selected')}</section>`;
  if(step>=3)html+=`<p data-so-factor="">${v.factor>1?`Group every ${v.factor} small parts into one larger part. Divide both counts by ${v.factor}.`:'The numerator and denominator share no factor greater than 1. No regrouping is needed.'}</p>`;
  if(step>=4)html+=`<section data-so-simplest=""><p>${math(`${v.raw}/${v.common}`)}${v.factor>1?` = ${frac(`${v.raw} ÷ ${v.factor}`,`${v.common} ÷ ${v.factor}`)} = ${math(`${v.n}/${v.d}`)}`:' is already simplest.'}</p>${strip(v.n,v.d,'simplest',1,'os-selected')}<p>The shaded amount has not changed.</p></section>`;
  else html+='<p>Final simplest fraction: ?</p>';
  return html+'</div>';
 }
 function accessible(m,reveal,shown){
  const v=quantities(m),step=count(m,reveal,shown);
  const base=m.object==='flour'?`Cake flour ${m.a} over ${m.b} kilogram, bread flour ${m.c} over ${m.d} kilogram. Each scale represents one kilogram.`:m.object==='walk'?`Leila walks ${m.a} over ${m.b} kilometre in the morning and ${m.c} over ${m.d} kilometre in the afternoon. Each scale represents one kilometre.`:m.object==='tank'?`The tank is ${m.a} over ${m.b} full. Water equal to ${m.c} over ${m.d} of full tank capacity is removed.`:`${m.a} over ${m.b} ${m.operation==='add'?'plus':'minus'} ${m.c} over ${m.d}, using one reference whole.`;
  return base+(step>=1?` Matching parts: ${v.first} over ${v.common} and ${v.second} over ${v.common}.`:'')+(step>=2?` The operation gives ${v.raw} over ${v.common}.`:'')+(step>=3?(v.factor>1?` Group every ${v.factor} parts together, dividing both counts by ${v.factor}.`:' The only common factor is one; no change is needed.'):'')+(step>=4?` Simplest form ${v.n} over ${v.d}. The shaded amount is unchanged.`:' The final simplest fraction is not shown.');
 }
 window.RevilySimplifyOperationVisuals={render,accessible,quantities};
})();
