(function(){
 'use strict';
 const gcd=(a,b)=>b?gcd(b,a%b):a;
 const notation=p=>`${p.whole} ${p.n}/${p.d}`;
 function values(m){
  for(const p of[m.left,m.right])if(!p||!['whole','n','d'].every(k=>Number.isInteger(p[k]))||p.whole<1||p.n<1||p.n>=p.d||p.d>12)throw new Error('Mixed addition requires positive mixed operands with proper fractional parts.');
  const a=m.left,b=m.right,common=a.d*b.d/gcd(a.d,b.d),first=a.n*common/a.d,second=b.n*common/b.d,raw=first+second,whole=a.whole+b.whole,regrouping=m.kind==='mixed_add_regroup',remainder=regrouping?raw-common:raw,factor=gcd(remainder,common);
  if(regrouping?(raw<common||raw>=2*common):raw>=common)throw new Error('Mixed addition fractional total is outside its authored regrouping boundary.');
  return{common,first,second,raw,whole,remainder,n:remainder/factor,d:common/factor,factor,regrouping,finalWhole:whole+(regrouping?1:0)};
 }
 function evidence(q,response){
  if(q.evidence_profile!=='mixed_add_components')return null;
  const v=values(q.visual.model),p=window.RevilyMixedConversion.mixedParts(response),V=window.RevilyValidators;
  const correct=V.validate(q,response);
  if(correct)return{correct:true,wholeCorrect:p&&p.whole===BigInt(v.whole)?true:null,fractionCorrect:p&&p.whole===BigInt(v.whole)?true:null,classification:'correct',form:p?'mixed':'fraction'};
  if(q.response.require_proper_fractional_part&&V.sameRational(response,q.answer.value))return{correct:false,wholeCorrect:null,fractionCorrect:null,classification:'wrong_form',form:p?'mixed':'fraction'};
  if(p){
   const wholeCorrect=p.whole===BigInt(v.whole),fractionCorrect=p.d>0n&&p.n*BigInt(v.common)===BigInt(v.raw)*p.d;
   return{correct:false,wholeCorrect,fractionCorrect,classification:wholeCorrect?'fraction_only':fractionCorrect?'whole_only':'both_parts',form:'mixed'};
  }
  return{correct:false,wholeCorrect:null,fractionCorrect:null,classification:V.sameRational(response,`${v.raw}/${v.common}`)?'omitted_wholes':'check_value',form:'fraction'};
 }
 function render(m,reveal,shown){
  const v=values(m),step=m.solved?(v.regrouping?5:4):reveal?shown||1:0,math=window.RevilyVisuals.mathMarkup,person=window.RevilyVisuals.escapeHtml(m.person||'Amir'),container=m.container==='tank'?'tank':'container';
  const unit=m.object==='ribbon'?'metre':m.object==='water'?'litre':m.object==='walk'?'kilometre':m.object==='flour'?'kilogram':'whole';
  const strip=(n,d,tag,color='os-water')=>`<svg viewBox="0 0 320 38" preserveAspectRatio="none" aria-hidden="true" data-ma-strip="${tag}">${Array.from({length:d},(_,i)=>`<rect x="${320*i/d}" y="2" width="${320/d}" height="32" class="${i<n?color:'os-empty'}" data-ma-part="${tag}" data-filled="${i<n}"/>`).join('')}${m.object==='walk'?'<path d="M0 18 H320" stroke="white" stroke-dasharray="12 8" stroke-width="2"/>':''}${m.object==='ribbon'?'<path d="M0 7 H320 M0 29 H320" stroke="white" stroke-dasharray="3 3"/>':''}</svg>`;
  const amount=(p,label,tag,color)=>`<section class="os-ma-amount"><h3>${math(`${label}: ${notation(p)}${unit==='whole'?'':' '+unit+'s'}`)}</h3><div class="os-ma-units">${Array.from({length:p.whole},()=>`<section data-ma-given-whole="${tag}"><small>1 ${unit}</small>${strip(p.d,p.d,tag,color)}</section>`).join('')}<section><small>${math(`${p.n}/${p.d} ${unit}`)}</small>${strip(p.n,p.d,tag,color)}</section></div></section>`;
  let html=`<div class="os-both-add os-mixed-addition" data-ma-context="${m.object}">`;
  if(m.object==='water'){
   const capacity=v.finalWhole+1;
   html+=`<h2>Water in the ${container} and water added</h2><p>Both scales use the same one-litre bands.</p><div class="os-ma-vessels">`;
   for(const[p,label,tag,color]of[[m.left,`Initially in the ${container}`,'initial','os-water'],[m.right,'Further water','added','os-mixed-second']])html+=`<section><h3>${label}</h3><p>${math(`${notation(p)} litres`)}</p><svg viewBox="0 0 170 175" aria-hidden="true" data-ma-vessel="${tag}">${Array.from({length:capacity*p.d},(_,i)=>`<rect x="25" y="${150-(i+1)*120/(capacity*p.d)}" width="100" height="${120/(capacity*p.d)}" class="${i<p.whole*p.d+p.n?color:'os-empty'}"/>`).join('')}${Array.from({length:capacity},(_,i)=>`<path d="M25 ${150-(i+1)*120/capacity} H125" class="os-mc-band"/><text x="130" y="${154-(i+1)*120/capacity}" font-size="12">${i+1} L</text>`).join('')}<path d="M25 22 V150 H125 V22" class="os-capacity-outline"/></svg></section>`;
   html+='</div>';
  }else{
   const labels=m.object==='ribbon'?['First ribbon','Second ribbon']:m.object==='walk'?[`${person}’s morning walk`,`${person}’s afternoon walk`]:m.object==='flour'?['Bread flour','Cake flour']:['First mixed number','Second mixed number'];
   html+=`<h2>${m.object==='ribbon'?'Two lengths of ribbon':m.object==='walk'?`${person}’s two walks`:m.object==='flour'?'Flour for bread and cakes':math(`${notation(m.left)} + ${notation(m.right)}`)}</h2><p>Each full scale represents 1 ${unit}.</p>`;
   if(m.object==='flour')html+='<svg viewBox="0 0 180 100" class="os-so-icon" aria-hidden="true" data-ma-flour=""><path d="M20 65 Q90 106 160 65 L145 85 H35 Z" fill="#b6d3cb" stroke="#536f68"/><path d="M30 65 Q90 -10 150 65 Z" fill="#f1e4c8" stroke="#987f57"/></svg>';
   html+=amount(m.left,labels[0],'left','os-water')+amount(m.right,labels[1],'right','os-mixed-second');
  }
  if(m.operation_choice)return html+`<p>${reveal?math(`Use ${notation(m.left)} + ${notation(m.right)} to combine both masses.`):'Calculation: choose below'}</p></div>`;
  if(step>=1)html+=`<p data-ma-wholes="">${math(`${m.left.whole} + ${m.right.whole} = ${v.whole}`)} complete ${unit}s.</p>`;
  if(step>=2)html+=`<section data-ma-matching=""><p>${math(`${m.left.n}/${m.left.d} = ${v.first}/${v.common}`)}; ${math(`${m.right.n}/${m.right.d} = ${v.second}/${v.common}`)}</p><div class="os-ma-fraction-row">${strip(v.first,v.common,'renamed-left')}${strip(v.second,v.common,'renamed-right','os-mixed-second')}</div></section>`;
  if(v.regrouping)return html+window.RevilyMixedRegroup.working(m,v,step,strip,unit)+'</div>';
  if(step>=3)html+=`<section data-ma-fractions=""><p>${math(`${v.first}/${v.common} + ${v.second}/${v.common} = ${v.raw}/${v.common}${v.factor>1?' = '+v.n+'/'+v.d:''}`)}</p>${strip(v.raw,v.common,'fractional-sum','os-selected')}<p>The fractional total is less than one whole. No additional whole is formed.</p></section>`;
  if(step>=4)html+=`<section data-ma-final=""><p>${math(`${v.whole} + ${v.n}/${v.d} = ${v.whole} ${v.n}/${v.d}`)}</p><div class="os-ma-units">${Array.from({length:v.whole},()=>`<section data-ma-result-whole=""><small>1 ${unit}</small>${strip(1,1,'result','os-selected')}</section>`).join('')}<section><small>${math(`${v.n}/${v.d} ${unit}`)}</small>${strip(v.n,v.d,'result-fraction','os-selected')}</section></div></section>`;
  else html+='<p>Total: ?</p>';
  return html+'</div>';
 }
 function accessible(m,reveal,shown){
  const v=values(m),step=m.solved?(v.regrouping?5:4):reveal?shown||1:0;
  const base=`${m.object==='walk'?`${m.person||'Amir'}’s morning and afternoon walks`:m.object==='ribbon'?'First and second ribbon lengths':m.object==='water'?`Initial ${m.container==='tank'?'tank':'container'} water and further water`:m.object==='flour'?'Bread and cake flour masses':'Two mixed numbers'}: ${notation(m.left)} and ${notation(m.right)}. Each full scale is one ${m.object==='walk'?'kilometre':m.object==='ribbon'?'metre':m.object==='water'?'litre':m.object==='flour'?'kilogram':'reference whole'}.`;
  if(m.operation_choice)return base+(reveal?' Add the two flour masses.':' The operation is not shown.');
  if(v.regrouping)return base+window.RevilyMixedRegroup.describe(v,step);
  return base+(step>=1?` Whole-number sum ${v.whole}.`:'')+(step>=2?` Matched fractional parts ${v.first} over ${v.common} and ${v.second} over ${v.common}.`:'')+(step>=3?` Fractional sum ${v.raw} over ${v.common}, less than one whole. No additional whole forms.`:'')+(step>=4?` Total ${v.whole} and ${v.n} over ${v.d}.`:' The total is not shown.');
 }
 window.RevilyMixedAddition={values,evidence,render,accessible};
})();
