(function(){
 'use strict';
 const gcd=(a,b)=>b?gcd(b,a%b):a<0n?-a:a;
 function rational(input){const p=window.RevilyValidators.parseRational(input);if(!p||p.d<=0n)throw new Error('A timeline needs exact rational quantities.');return p;}
 const add=(a,b,sign=1n)=>{const n=a.n*b.d+sign*b.n*a.d,d=a.d*b.d,g=gcd(n,d);return{n:n/g,d:d/g};};
 const fraction=p=>p.d===1n?String(p.n):`${p.n}/${p.d}`;
 const mixed=p=>p.n>=p.d&&p.n%p.d?`${p.n/p.d} ${p.n%p.d}/${p.d}`:fraction(p);
 function values(m){
  if(!m||m.kind!=='additive_timeline'||!['add','subtract'].includes(m.first_operation))throw new Error('An additive timeline needs an explicit first operation.');
  const start=rational(m.start),first=rational(m.first),second=rational(m.second),middle=add(start,first,m.first_operation==='add'?1n:-1n),final=add(middle,second,-1n);
  if([start,first,second].some(p=>p.n<=0n)||middle.n<0n||final.n<0n)throw new Error('Timeline amounts must remain non-negative.');
  return{start,first,second,middle,final,reused:add(start,second,-1n),wrongFirst:add(add(start,first,m.first_operation==='add'?-1n:1n),second,-1n),wrongSecond:add(middle,second)};
 }
 function evidence(q,response){
  const v=values(q.visual.model),same=p=>window.RevilyValidators.sameRational(response,p),correct=window.RevilyValidators.validate(q,response);let classification='check_calculation';
  if(correct)classification='correct';else if(same(v.middle))classification='intermediate_only';else if(same(v.reused))classification='original_for_second';else if(same(v.wrongFirst))classification='first_event_value';else if(same(v.wrongSecond))classification='second_event_value';
  return{finalValueCorrect:correct,classification,operationSequenceObserved:false,intermediateCalculationObserved:false};
 }
 const icon=m=>m.object==='cycle'?'<svg class="os-fs-icon" viewBox="0 0 56 56" aria-hidden="true"><circle cx="12" cy="39" r="9"/><circle cx="44" cy="39" r="9"/><path d="M12 39 L23 20 L33 39 H12 M23 20 H39 L44 39 M21 16 H29 M37 14 L40 20"/></svg>':window.RevilyFractionSituation.icon(m.object==='barrel'?'tank':m.object==='material'?'fabric':m.object==='wood'?'board':m.object==='walk'?'route':m.object);
 function render(m,reveal,shown){
  const v=values(m),math=window.RevilyVisuals.mathMarkup,esc=window.RevilyVisuals.escapeHtml,step=m.solved?m.through||4:reveal?shown||1:0,op=m.first_operation==='add'?'+':'−',expression=`(${m.start} ${op} ${m.first}) − ${m.second}`,limit=Math.max(1,...[v.start,v.middle].map(p=>Number(p.n)/Number(p.d)));
  const quantity=(p,tag,color,removed)=>{const width=300*Number(p.n)/Number(p.d)/limit,cut=removed?300*Number(removed.n)/Number(removed.d)/limit:0;return`<svg class="os-at-scale" viewBox="0 0 310 34" preserveAspectRatio="none" aria-hidden="true" data-at-scale="${tag}"><path d="M0 30 H300" class="os-fs-axis"/><rect x="0" y="3" width="${width}" height="23" fill="${color}" rx="2"/>${cut?`<rect x="${width-cut}" y="3" width="${cut}" height="23" fill="#eedbce"/><path d="M${width-cut} 3 L${width} 26 M${width-cut} 26 L${width} 3" stroke="#903c33" stroke-width="2" data-at-removed="${fraction(removed)}"/>`:''}${Array.from({length:Math.floor(limit)+1},(_,i)=>`<path d="M${300*i/limit} 27 V33" class="os-fs-axis"/>`).join('')}</svg>`;};
  let html=`<div class="os-additive-timeline" data-at-context="${esc(m.object)}"><h2>${esc(m.title)}</h2>`;
  if(m.expression_given)html+=`<p>${math(expression)}</p>`;
  html+='<div class="os-at-events">';for(const[label,amount,tag]of[[m.start_label,m.start,'start'],[m.first_label,m.first,'first'],[m.second_label,m.second,'second']])html+=`<section data-at-given="${tag}">${icon(m)}<h3>${esc(label)}</h3><p>${math(`${amount}${m.unit?' '+m.unit:''}`)}</p></section>`;html+='</div>';
  if(m.symbolic_flow){html+=`<div class="os-at-flow"><section><h3>Start</h3><p>${math(m.start)}</p></section><span>→</span><section><h3>After the first event</h3><p>${math(`${m.start} ${op} ${m.first}`)}</p></section><span>→</span><section><h3>After the second event</h3><p>${math(expression)}</p></section></div><p>The second event acts on the updated amount.</p>`;return html+'</div>';}
  if(m.selection){html+=`<p>${math(reveal?m.completed:'Choose the requested step or plan below.')}</p>`;return html+'</div>';}
  html+=`<p>${esc(m.final_label)}: ${step>=4?math(mixed(v.final)):'?'}${m.unit?' '+esc(m.unit):''}</p>`;
  if(step>=1)html+=`<section data-at-plan=""><p>${esc(m.plan)}</p><p>${math(expression)}</p></section>`;
  if(step>=2)html+=`<section data-at-middle=""><h3>${esc(m.middle_label)}</h3><p>${math(m.first_working||`${m.start} ${op} ${m.first} = ${fraction(v.middle)}${mixed(v.middle)!==fraction(v.middle)?' = '+mixed(v.middle):''}`)}</p>${quantity(v.middle,'middle','#267caa')}<p>This updated amount is carried into the next event.</p></section>`;
  if(step>=3)html+=`<section data-at-second=""><h3>${esc(m.second_label)}</h3>${quantity(v.middle,'second','#267caa',v.second)}<p>${math(m.second_working||`${fraction(v.middle)} − ${m.second} = ${fraction(v.final)}`)}</p><p>Crossed shading marks the second amount removed from the updated amount.</p></section>`;
  if(step>=4)html+=`<section data-at-final=""><h3>${esc(m.final_label)}</h3>${quantity(v.final,'final','#337c64')}<p>${math(`${mixed(v.final)}${m.unit?' '+m.unit:''}`)}</p></section>`;
  if(step>=2)html+=`<p class="os-fs-scale-note">All working bars use the same ${esc(m.unit_name||'whole')} scale, starting at zero. Ticks are one ${esc(m.unit_name||'whole')} apart.</p>`;
  return html+'</div>';
 }
 function accessible(m,reveal,shown){const v=values(m),step=m.solved?m.through||4:reveal?shown||1:0,base=`${m.title}. ${m.start_label}: ${m.start} ${m.unit||''}. ${m.first_label}: ${m.first} ${m.unit||''}. ${m.second_label}: ${m.second} ${m.unit||''}.`;
  if(m.symbolic_flow)return base+` Start, then ${m.start} ${m.first_operation==='add'?'plus':'minus'} ${m.first}, then subtract ${m.second} from that updated amount.`;
  if(m.selection)return base+(reveal?' '+m.completed:' The requested step or plan is not shown.');
  return base+(step>=1?' '+m.plan:' The operation plan is not shown.')+(step>=2?` Updated amount: ${mixed(v.middle)} ${m.unit||''}; this becomes the next starting amount.`:' The intermediate amount is not shown.')+(step>=3?` Remove ${m.second} from ${fraction(v.middle)}; ${fraction(v.final)} remains.`:'')+(step>=4?` ${m.final_label}: ${mixed(v.final)} ${m.unit||''}.`:' The final answer is not shown.');
 }
 window.RevilyAdditiveTimeline={values,evidence,render,accessible,fraction,mixed};
})();
