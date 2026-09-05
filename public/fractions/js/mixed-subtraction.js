(function(){
 'use strict';
 const gcd=(a,b)=>b?gcd(b,a%b):a,notation=p=>`${p.whole} ${p.n}/${p.d}`;
 function values(m){
  for(const p of[m.left,m.right])if(!p||!['whole','n','d'].every(k=>Number.isInteger(p[k]))||p.whole<1||p.n<1||p.n>=p.d||p.d>12)throw new Error('Mixed subtraction needs positive mixed operands with proper fractional parts.');
  const a=m.left,b=m.right,common=a.d*b.d/gcd(a.d,b.d),first=a.n*common/a.d,second=b.n*common/b.d,exchange=m.kind==='mixed_subtract_exchange',exchangeWhole=a.whole-(exchange?1:0),available=first+(exchange?common:0),raw=available-second,whole=exchangeWhole-b.whole,factor=gcd(raw,common);
  if(raw<0||whole<0||(!raw&&!whole)||(exchange&&first>=second))throw new Error('Mixed subtraction must meet its explicit with or without exchange boundary, with a positive result.');
  return{common,first,second,raw,whole,factor,n:raw/factor,d:common/factor,exchange,exchangeWhole,available};
 }
 function evidence(q,response){
  if(q.evidence_profile!=='mixed_subtract_components')return null;
  const v=values(q.visual.model),V=window.RevilyValidators,p=window.RevilyMixedConversion.mixedParts(response),correct=V.validate(q,response),valueCorrect=V.sameRational(response,q.answer.value),proper=Boolean(p&&p.whole>0n&&p.n>0n&&p.n<p.d),simplest=proper?gcd(p.n,p.d)===1n:null;
  const wholeCorrect=p?p.whole===BigInt(v.whole):null,fractionCorrect=p?Boolean(p.d>0n&&p.n*BigInt(v.common)===BigInt(v.raw)*p.d):null;
  let classification='check_value';
  if(correct)classification='correct';
  else if(valueCorrect)classification=proper&&!simplest?'simplify_only':'mixed_form_required';
  else if(V.sameRational(response,String(v.whole)))classification='omitted_fraction';
  else if(V.sameRational(response,`${v.raw}/${v.common}`))classification='omitted_wholes';
  else if(p)classification=wholeCorrect?'fraction_only':fractionCorrect?'whole_only':'both_parts';
  return{correct,valueCorrect,properMixed:proper,simplestFraction:simplest,wholeCorrect,fractionCorrect,classification};
 }
 function render(m,reveal,shown){
  const v=values(m),step=m.solved?(v.exchange?5:4):reveal?shown||1:0,math=window.RevilyVisuals.mathMarkup,liquid=['water','tank'].includes(m.object),fabric=m.object==='fabric',unit=liquid?'litre':['ribbon','fabric'].includes(m.object)?'metre':m.object==='walk'?'kilometre':'whole',person=window.RevilyVisuals.escapeHtml(m.person||'Maya');
  const names=m.object==='ribbon'?['Original ribbon roll','Ribbon cut off']:fabric?['Original fabric roll','Fabric cut off']:liquid?[m.object==='tank'?'Liquid originally in the tank':'Water originally in the container',m.object==='tank'?'Liquid removed':'Water poured out']:m.object==='walk'?[`${person}’s planned walk`,'Distance already walked']:['First mixed number','Amount to subtract'];
  const strip=(n,d,tag,removed=0,color='os-water')=>`<svg viewBox="0 0 320 38" preserveAspectRatio="none" aria-hidden="true" data-ms-strip="${tag}">${Array.from({length:d},(_,i)=>`<rect x="${320*i/d}" y="2" width="${320/d}" height="32" class="${i<n?color:'os-empty'}" data-ms-part="${tag}" data-filled="${i<n}"/>${i<removed?`<path d="M${320*i/d+3} 5 L${320*(i+1)/d-3} 31 M${320*i/d+3} 31 L${320*(i+1)/d-3} 5" class="os-ms-cross" data-ms-removed-part="${tag}"/>`:''}`).join('')}${m.object==='walk'?'<path d="M0 18 H320" stroke="white" stroke-dasharray="12 8" stroke-width="2"/>':m.object==='ribbon'?'<path d="M0 7 H320 M0 29 H320" stroke="white" stroke-dasharray="3 3"/>':''}</svg>`;
  const amount=(p,label,tag)=>`<section class="os-ma-amount"><h3>${math(`${label}: ${notation(p)}${unit==='whole'?'':' '+unit+'s'}`)}</h3><div class="os-ma-units">${Array.from({length:p.whole},()=>`<section data-ms-given-whole="${tag}"><small>1 ${unit}</small>${strip(1,1,tag,0,tag==='right'?'os-mixed-second':'os-water')}</section>`).join('')}<section><small>${math(`${p.n}/${p.d} ${unit}`)}</small>${strip(p.n,p.d,tag,0,tag==='right'?'os-mixed-second':'os-water')}</section></div></section>`;
  let html=`<div class="os-both-add os-mixed-subtraction" data-ms-context="${m.object}"><h2>${m.object==='tank'?'Liquid in the tank':m.object==='bars'?math(`${notation(m.left)} − ${notation(m.right)}`):fabric?'A piece cut from a fabric roll':m.object==='ribbon'?'A length cut from a ribbon roll':m.object==='walk'?`${person}’s planned and completed distances`:'Water poured from a container'}</h2><p>${liquid?'Both volume scales use matching one-litre bands.':`Each full scale represents 1 ${unit}.`}</p>`;
  if(liquid){
   const capacity=m.left.whole+1;
   html+='<div class="os-ma-vessels">';
   for(const[p,label,tag]of[[m.left,names[0],'left'],[m.right,names[1],'right']])html+=`<section><h3>${label}</h3><p>${math(`${notation(p)} litres`)}</p><svg viewBox="0 0 175 205" aria-hidden="true" data-ms-vessel="${tag}">${Array.from({length:capacity*p.d},(_,i)=>`<rect x="25" y="${180-(i+1)*155/(capacity*p.d)}" width="100" height="${155/(capacity*p.d)}" class="${i<p.whole*p.d+p.n?tag==='left'?'os-water':'os-mixed-second':'os-empty'}"/>`).join('')}${Array.from({length:capacity},(_,i)=>`<path d="M25 ${180-(i+1)*155/capacity} H125" class="os-mc-band"/><text x="130" y="${184-(i+1)*155/capacity}" font-size="12">${i+1} L</text>`).join('')}<path d="M25 18 V180 H125 V18" class="os-capacity-outline"/></svg></section>`;
   html+='</div>';
  }else html+=amount(m.left,names[0],'left')+amount(m.right,names[1],'right');
  if(m.method_choice)return html+`<p>${reveal?math(`Rewrite the first amount: ${notation(m.left)} = ${v.exchangeWhole} ${v.available}/${v.common}.`):'First step: choose below'}</p></div>`;
  if(m.operation_choice)return html+`<p>${reveal?math(`Use ${notation(m.left)} − ${notation(m.right)} to find the liquid remaining.`):'Calculation: choose below'}</p></div>`;
  if(v.exchange)return html+window.RevilyMixedExchange.working(m,v,step,strip,unit)+'</div>';
  if(step>=1)html+=`<section data-ms-wholes="">${liquid?'<p>Each complete working strip represents 1 litre.</p>':''}<p>${math(`${m.left.whole} − ${m.right.whole} = ${v.whole}`)} complete ${unit}s remain.</p><div class="os-ma-units">${Array.from({length:m.left.whole},(_,i)=>`<section data-ms-whole="${i<m.right.whole?'removed':'remaining'}"><small>${i<m.right.whole?'Remove':'Keep'} 1 ${unit}</small>${strip(1,1,'whole-removal',i<m.right.whole?1:0)}</section>`).join('')}</div></section>`;
  if(step>=2)html+=`<section data-ms-matching=""><p>${math(`${m.left.n}/${m.left.d} = ${v.first}/${v.common}`)}; ${math(`${m.right.n}/${m.right.d} = ${v.second}/${v.common}`)}</p><div class="os-ma-fraction-row">${strip(v.first,v.common,'renamed-first')}${strip(v.second,v.common,'renamed-second',0,'os-mixed-second')}</div></section>`;
  if(step>=3)html+=`<section data-ms-fractions=""><p>Crosses mark the fractional parts removed.</p>${strip(v.first,v.common,'fraction-removal',v.second)}<p>${math(`${v.first}/${v.common} − ${v.second}/${v.common} = ${v.raw}/${v.common}${v.factor>1?' = '+v.n+'/'+v.d:''}`)}</p><p>The first fractional part contains enough matching parts. No whole needs exchanging.</p></section>`;
  if(step>=4)html+=`<section data-ms-final=""><p>${math(`${v.whole} + ${v.n}/${v.d} = ${v.whole}${v.n?' '+v.n+'/'+v.d:''}`)}</p><div class="os-ma-units">${Array.from({length:v.whole},()=>`<section data-ms-result-whole=""><small>1 remaining ${unit}</small>${strip(1,1,'result-whole',0,'os-selected')}</section>`).join('')}${v.n?`<section><small>${math(`${v.n}/${v.d} ${unit}`)}</small>${strip(v.n,v.d,'result-fraction',0,'os-selected')}</section>`:''}</div></section>`;
  else html+='<p>Remaining amount: ?</p>';
  return html+'</div>';
 }
 function accessible(m,reveal,shown){
  const v=values(m),step=m.solved?(v.exchange?5:4):reveal?shown||1:0,context=m.object==='ribbon'?'Original ribbon roll and length cut off':m.object==='fabric'?'Original fabric roll and piece cut off':m.object==='water'?'Original container water and water poured out':m.object==='tank'?'Original tank liquid and liquid removed':m.object==='walk'?`${m.person||'Maya'}’s planned and completed walking distances`:'First mixed number and amount to subtract';
  const base=`${context}: ${notation(m.left)} and ${notation(m.right)}. Reference scales use the same unit.`;
  if(m.operation_choice)return base+(reveal?' Subtract the liquid removed from the original amount.':' The operation is not shown.');
  if(m.method_choice)return base+(reveal?` Rewrite the first amount as ${v.exchangeWhole} and ${v.available} over ${v.common}.`:' The first step is not shown.');
  if(v.exchange)return base+window.RevilyMixedExchange.describe(v,step);
  return base+(step>=1?` Remove ${m.right.whole} of the ${m.left.whole} complete wholes; ${v.whole} remain.`:'')+(step>=2?` Matching fractional parts: ${v.first} over ${v.common} and ${v.second} over ${v.common}.`:'')+(step>=3?` Cross out ${v.second} matching parts from ${v.first}; ${v.raw} remain. No whole needs exchanging.`:'')+(step>=4?` Remaining amount ${v.whole}${v.n?' and '+v.n+' over '+v.d:''}.`:' The remaining amount is not shown.');
 }
 window.RevilyMixedSubtraction={values,evidence,render,accessible};
})();
