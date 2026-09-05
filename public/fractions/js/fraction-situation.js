(function(){
 'use strict';
 const value=p=>p.whole+p.n/p.d,notation=p=>(p.whole?p.whole+' ':'')+p.n+'/'+p.d;
 function check(m){
  for(const p of[m.first,m.second])if(!p||!['whole','n','d'].every(k=>Number.isInteger(p[k]))||p.whole<0||p.n<1||p.n>=p.d)throw new Error('Situation quantities need positive exact fractions with optional whole-number parts.');
  if(!['join','remain','compare','missing'].includes(m.relationship))throw new Error('A situation needs an explicit relationship.');
  if(m.relationship!=='join'&&value(m.first)<=value(m.second))throw new Error('Subtraction situations must put the larger full or starting quantity first.');
 }
 function evidence(q,response){
  const selected=q.operation_choices?.find(x=>x.value===response),required=q.required_operation;
  if(!selected||!required)return{operationCorrect:null,orderCorrect:null,classification:'unrecognised_response'};
  const operationCorrect=selected.operation===required,orderCorrect=operationCorrect&&required==='subtract'&&selected.order!=null?selected.order==='original':null;
  return{operation:selected.operation,operationCorrect,orderCorrect,classification:!operationCorrect?'wrong_operation':orderCorrect===false?'reversed_order':'correct',arithmeticAssessed:false};
 }
 function icon(object){
  const shapes={tank:'<path d="M8 10 Q28 2 48 10 V43 Q28 51 8 43 Z M8 10 Q28 18 48 10 M8 34 Q28 42 48 34"/>',bottle:'<path d="M21 5 H35 V14 L43 22 V48 H13 V22 L21 14 Z M13 33 H43"/>',water:'<path d="M28 5 C22 17 12 25 12 34 A16 16 0 0 0 44 34 C44 25 34 17 28 5 Z"/>',container:'<path d="M10 13 H46 L42 47 H14 Z M9 13 Q28 5 47 13 M12 30 H44"/>',paint:'<path d="M10 18 H46 L43 47 H13 Z M15 18 C15 0 41 0 41 18 M11 24 H45"/>',oil:'<path d="M14 17 H39 V47 H8 V25 Z M18 17 V6 H35 V17 M39 23 L50 17 V29 H39"/>',flour:'<path d="M17 8 H39 L35 17 Q49 30 44 47 H12 Q7 30 21 17 Z M17 8 L21 17 H35 M20 31 Q28 24 36 31"/>',parcel:'<path d="M7 17 L28 6 L49 17 V42 L28 52 L7 42 Z M7 17 L28 28 L49 17 M28 28 V52 M18 11 L39 22 V31"/>',clay:'<path d="M8 40 C3 30 14 15 24 19 C32 5 48 20 48 34 Q52 47 30 48 Q12 48 8 40 Z M15 32 Q28 22 41 31"/>',rope:'<path d="M8 19 Q20 8 31 19 T50 19 M8 29 Q20 18 31 29 T50 29 M11 14 L17 24 M21 13 L27 23 M32 20 L38 30 M42 20 L48 30"/>',wire:'<path d="M6 38 H17 C48 38 48 8 28 8 C8 8 8 33 29 33 H50 M20 29 C13 15 39 12 37 26"/>',ribbon:'<path d="M7 13 H49 L42 27 L49 41 H7 L14 27 Z M14 19 H41 M14 35 H41"/>',fabric:'<path d="M16 10 Q3 10 7 27 Q10 33 18 28 V45 H48 V12 H17 Q8 12 12 23 H18 M20 18 H43 M20 25 H43 M23 34 H43"/>',plank:'<path d="M7 14 H49 V42 H7 Z M13 21 Q25 16 44 24 M12 33 Q28 40 43 32"/>',board:'<path d="M7 14 H49 V42 H7 Z M13 21 Q25 16 44 24 M12 33 Q28 40 43 32"/>',route:'<path d="M7 43 C47 46 8 16 40 15 M39 15 V3 L50 8 L39 12 M7 38 V48"/>'};
  if(object==='rice')return '<svg class="os-fs-icon" viewBox="0 0 56 56" aria-hidden="true"><path d="M8 20 H48 L43 48 H13 Z M8 20 Q28 10 48 20 M14 29 l5 4 M23 26 l5 4 M34 27 l5 4 M19 37 l5 4 M31 38 l5 4"/></svg>';
  return `<svg class="os-fs-icon" viewBox="0 0 56 56" aria-hidden="true">${shapes[object]||shapes.container}</svg>`;
 }
 function rules(){return '<div class="os-fs-rules"><h2>Read the relationship</h2><section><h3>Join two amounts</h3><div class="os-fs-parts"><span>First amount</span><span>Second amount</span></div><p>Combined total: a + b</p></section><section><h3>Remove an amount</h3><div class="os-fs-parts"><span>Remaining</span><span>Removed</span></div><p>Starting amount: a. Removed amount: b. Remaining: a − b.</p></section><p>For a comparison, subtract the smaller amount from the larger. For a missing part, subtract the known part from the full amount.</p></div>';}
 function render(m,reveal,shown){
  if(m.kind==='fraction_situation_rule')return rules();
  check(m);const math=window.RevilyVisuals.mathMarkup,esc=window.RevilyVisuals.escapeHtml,step=m.solved?3:reveal?shown||1:0,a=value(m.first),b=value(m.second),scale=Math.max(1,a,b),expression=`${notation(m.first)} ${m.relationship==='join'?'+':'−'} ${notation(m.second)}`;
  const bar=(p,color)=>`<svg class="os-fs-scale" viewBox="0 0 320 34" preserveAspectRatio="none" aria-hidden="true"><path d="M0 30 H320" class="os-fs-axis"/><rect x="0" y="4" width="${316*value(p)/scale}" height="22" rx="3" fill="${color}" data-fs-quantity="${value(p)}"/>${Array.from({length:Math.floor(scale)+1},(_,i)=>`<path d="M${316*i/scale} 27 V33" class="os-fs-axis"/>`).join('')}</svg>`;
  let html=`<div class="os-fraction-situation" data-fs-context="${esc(m.object)}"><h2>${esc(m.title)}</h2><div class="os-fs-givens">`;
  for(const[p,label,color]of[[m.first,m.first_label,m.first_color||'#267caa'],[m.second,m.second_label,m.second_color||'#b36c27']])html+=`<section>${icon(m.object)}<div><h3>${esc(label)}</h3><p>${math(`${notation(p)} ${m.unit}`)}</p>${bar(p,color)}</div></section>`;
  html+=`</div><p class="os-fs-scale-note">Both bars use the same ${esc(m.unit_name)} scale, starting at zero. Ticks are one ${esc(m.unit_name)} apart.</p>`;
  if(m.response_mode){html+=`<p data-fs-identification="${reveal}">${math(reveal?m.completed:'Choose or enter the requested information below.')}</p>`;return html+'</div>';}
  html+=`<p>${esc(m.requested_label)}: ?</p>`;
  if(step>=1)html+=`<section data-fs-roles=""><p>${esc(m.roles)}</p></section>`;
  if(step>=2){
   const join=m.relationship==='join',firstWidth=join?a/(a+b):b/a,firstLabel=join?m.first_label:m.second_label,secondLabel=join?m.second_label:m.requested_label;
   html+=`<section data-fs-relationship="${esc(m.relationship)}" style="--fs-known:${esc(join?m.first_color||'#267caa':m.second_color||'#b36c27')};--fs-second:${esc(m.second_color||'#b36c27')}"><h3>${esc(join?m.requested_label:m.first_label)}</h3><div class="os-fs-partwhole" role="img" aria-label="${esc(join?m.first_label+' and '+m.second_label+' together form '+m.requested_label:m.second_label+' and '+m.requested_label+' together form '+m.first_label)}"><span style="flex:${firstWidth}" class="os-fs-known"></span><span style="flex:${1-firstWidth}" class="${join?'os-fs-second':'os-fs-unknown'}"></span></div><p class="os-fs-key"><span class="os-fs-key-first">${esc(firstLabel)}</span><span class="os-fs-key-second">${esc(secondLabel)}${join?'':' · ?'}</span></p><p>${esc(m.relationship_text)}</p></section>`;
  }
  if(step>=3)html+=`<section data-fs-expression=""><p>${math(expression)}</p><p>Select the calculation; no numerical result is required.</p></section>`;
  return html+'</div>';
 }
 function accessible(m,reveal,shown){
  if(m.kind==='fraction_situation_rule')return 'Joining two amounts gives a total: add. Remove, compare or find a missing part: subtract. Read the complete relationship, not one isolated word.';
  check(m);const step=m.solved?3:reveal?shown||1:0,base=`${m.title}. ${m.first_label}: ${notation(m.first)} ${m.unit}. ${m.second_label}: ${notation(m.second)} ${m.unit}. Both quantity bars use the same unit scale.`;
  if(m.response_mode)return base+(reveal?` ${m.completed}`:' The requested response is not shown.');
  return base+` Find ${m.requested_label}.`+(step>=1?' '+m.roles:'')+(step>=2?' '+m.relationship_text:'')+(step>=3?` Select ${notation(m.first)} ${m.relationship==='join'?'plus':'minus'} ${notation(m.second)}. No numerical result is required.`:' The operation and calculation are not shown.');
 }
 window.RevilyFractionSituation={check,value,notation,evidence,render,accessible,icon};
})();
