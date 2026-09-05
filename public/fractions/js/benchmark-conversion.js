(function(){
 'use strict';
 const esc=s=>window.RevilyVisuals.escapeHtml(String(s)),math=s=>window.RevilyVisuals.mathMarkup(String(s));
 const integer=x=>/^\d+$/.test(String(x??'')),gcd=(a,b)=>{while(b)[a,b]=[b,a%b];return a;};
 function fraction(value){if(!value||!integer(value.n)||!integer(value.d)||BigInt(value.d)===0n)return null;return window.RevilyValidators.parseRational(value);}
 function evidence(q,response){
  const fields={};let fractionValueCorrect=false;
  for(const key of q.response.fields){
   if(key==='fraction'){const a=fraction(response?.fraction),b=fraction(q.answer.value.fraction);fractionValueCorrect=Boolean(a&&b&&a.n===b.n&&a.d===b.d);fields.fraction=fractionValueCorrect&&(!q.response.require_simplest_form||gcd(BigInt(response.fraction.n),BigInt(response.fraction.d))===1n);}
   else fields[key]=key==='decimal'?window.RevilyPlaceValue.sameDecimal(response?.decimal,q.answer.value.decimal):integer(response?.percent)&&BigInt(response.percent)===BigInt(q.answer.value.percent);
  }
  const missing=Object.keys(fields).filter(key=>!fields[key]);
  let classification=!missing.length?'correct':missing.length===1?'check_'+missing[0]:'check_multiple';
  if(missing.length===1&&missing[0]==='fraction'&&fractionValueCorrect)classification='simplify_fraction';
  if(missing.length>1)for(const pattern of q.response_patterns||[]){if(Object.entries(pattern.values).every(([key,value])=>key==='decimal'?window.RevilyPlaceValue.sameDecimal(response?.[key],value):integer(response?.[key])&&BigInt(response[key])===BigInt(value))){classification=pattern.classification;break;}}
  return{correct:!missing.length,fields,fractionValueCorrect,classification,routeConfirmed:false,unseenMethodAssessed:false,earlierSkillStateChanged:false};
 }
 function markup(q,saved,locked){const value=saved&&typeof saved==='object'?saved:{},disabled=locked?' disabled':'',input=(key,label,val)=>`<input data-bm-field="${key}" aria-label="${label}" inputmode="${key==='decimal'?'decimal':'numeric'}" autocomplete="off" value="${esc(val??'')}"${disabled}/>`;
  return `<fieldset class="pv-paired-answer"><legend>${esc(q.response.input_label||'Complete both forms')}</legend><div class="pv-paired-fields">${q.response.fields.map(key=>key==='fraction'?`<div class="pv-fraction-field"><span>Fraction${q.response.require_simplest_form?' in simplest form':''}</span><div class="fixed-fraction-builder">${input('n','Numerator',value.fraction?.n)}<i aria-hidden="true"></i>${input('d','Denominator',value.fraction?.d)}</div></div>`:`<label><span>${key==='decimal'?'Decimal':'Percentage'}</span><span class="pv-percent-input">${input(key,key==='decimal'?'Decimal':'Percentage',value[key])}${key==='percent'?'<b aria-label="percent">%</b>':''}</span></label>`).join('')}</div>${q.response.fields.includes('percent')?'<p>The percent sign is printed; enter only the percentage number.</p>':''}</fieldset>`;
 }
 function read(root,q,partial){const get=key=>root.querySelector(`[data-bm-field="${key}"]`)?.value.trim()||'',value=Object.fromEntries(q.response.fields.map(key=>[key,key==='fraction'?{n:get('n'),d:get('d')}:get(key)]));const complete=q.response.fields.every(key=>key==='fraction'?Boolean(fraction(value.fraction)):key==='decimal'?Boolean(window.RevilyPlaceValue.decimal(value.decimal)):integer(value.percent));return partial||complete?value:null;}
 function bar(n,d,object='bar'){
  if(!Number.isInteger(n)||!Number.isInteger(d)||![2,4,5,10].includes(d)||n<0||n>d)throw new Error('Benchmark model requires a valid half, quarter, fifth or tenth.');
  if(object==='tank')return `<svg class="bm-tank" viewBox="0 0 180 250" aria-hidden="true"><path d="M25 15 H155 V235 H25 Z" fill="#fff" stroke="#1b5a67" stroke-width="4"/>${Array.from({length:d},(_,i)=>`<rect data-bm-part="${i}" data-selected="${i<n}" x="27" y="${233-(i+1)*216/d}" width="126" height="${216/d}" fill="${i<n?'#74c7e6':'#fff'}" stroke="#456979"/>`).join('')}<path d="M155 202 h19 v17" fill="none" stroke="#1b5a67" stroke-width="6"/></svg>`;
  const battery=object==='battery',tickets=object==='tickets',y=battery?14:4,h=battery?72:48;
  return `<svg class="bm-bar" viewBox="0 0 ${battery?420:404} ${battery?102:58}" aria-hidden="true">${battery?'<rect x="1" y="7" width="402" height="86" rx="8" fill="#fff" stroke="#234e52" stroke-width="3"/><rect x="403" y="33" width="13" height="33" rx="3" fill="#234e52"/>':''}${Array.from({length:d},(_,i)=>`<rect data-bm-part="${i}" data-selected="${i<n}" x="${4+i*396/d}" y="${y}" width="${396/d}" height="${h}" fill="${i<n?'#79beb4':'#fff'}" stroke="#355b64" stroke-width="1.5"${tickets?' stroke-dasharray="5 2"':''}/>`).join('')}</svg>`;
 }
 const value=(n,d)=>String(n/d),percent=(n,d)=>n*100/d;
 function description(m,n){if(m.object==='tank')return `Full water-tank capacity divided into ${m.d} equal regions; ${n} filled. `;if(m.object==='tickets')return `All tickets divided into ${m.d} equal-sized groups; ${n} sold groups. This is a proportion model, not a count of individual tickets. `;if(m.object==='students')return `The surveyed students divided into ${m.d} equal-sized groups; ${n} groups represent those walking to school. This is a proportion model, not a count of individual students. `;if(m.object==='battery')return `Full battery capacity divided into ${m.d} equal parts; ${n} charged. `;return `One whole divided into ${m.d} equal parts; ${n} shaded. `;}
 function render(m,reveal,shown=1){let html=`<div class="bm-model"><h2>${esc(m.title)}</h2>${m.given?`<p class="bm-given">${math(m.given)}</p>`:''}`;const count=m.phase||shown;
  if(m.mode==='table')return html+`<div class="bm-benchmarks">${[2,4,5,10].map(d=>`<section><h3>${math(`1/${d}`)}</h3>${bar(1,d)}<p>${math(`1/${d} = ${100/d}/100 = ${value(1,d)} = ${100/d}%`)}</p></section>`).join('')}</div></div>`;
  if(!reveal&&!m.model_given)return html+(m.explanation_question?'<p>The explanation is not shown.</p>':'<p>The requested forms are not shown.</p>')+'</div>';
  if(m.mode==='rule')return html+(reveal&&m.phase?`<ol class="bm-steps">${m.steps.slice(0,count).map(line=>`<li>${math(line)}</li>`).join('')}</ol>`:reveal?'':'<p>The explanation is not shown.</p>')+'</div>';
  const selected=m.object?m.n:m.parts_by_step?.[Math.min(count-1,m.parts_by_step.length-1)]??m.n;
  html+=`${!m.object&&m.n>1?`<h3 class="bm-current-part">${selected===1?'Start from one equal part':'Combine the selected copies'}</h3>`:''}<figure>${bar(selected,m.d,m.object)}<figcaption>${esc(description(m,selected))}</figcaption></figure>`;
  // Question working is rendered by the shared sequential solution panel; do not duplicate it.
  if(reveal&&m.phase)html+=`<ol class="bm-steps">${m.steps.slice(0,count).map(line=>`<li>${math(line)}</li>`).join('')}</ol>`;
  return html+'</div>';
 }
 function accessible(m,reveal,shown=1){const base=m.title+'. '+(m.given?m.given+'. ':'');if(m.mode==='table')return base+[2,4,5,10].map(d=>`One of ${d} equal parts: one over ${d}, ${100/d} over one hundred, ${value(1,d)}, ${100/d} percent.`).join(' ');if(!reveal&&!m.model_given)return base+(m.explanation_question?'The explanation is not shown.':'The requested forms are not shown.');const count=m.phase||shown,selected=m.object?m.n:m.parts_by_step?.[Math.min(count-1,m.parts_by_step.length-1)]??m.n;return base+(m.mode==='rule'?'':description(m,selected))+(reveal?m.steps.slice(0,count).join(' '):'The requested forms are not shown.');}
 window.RevilyBenchmark={fraction,evidence,markup,read,bar,render,accessible};
})();
